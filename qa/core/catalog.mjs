import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import YAML from 'yaml';
import {
  loadProjectConfig,
  normalizePath,
  qaRoot,
  repoRoot,
  resolveRepoPath,
} from './project-config.mjs';

const HTTP_METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);

async function readYaml(relativePath) {
  const raw = await fs.readFile(resolveRepoPath(relativePath), 'utf8');
  return { raw, document: YAML.parse(raw) };
}

function operationReference(sourceDescriptions, reference) {
  const match = String(reference || '').match(/^\$sourceDescriptions\.([^.]+)\.(.+)$/);
  if (!match) return { sourceName: null, operationId: reference || null };
  const source = sourceDescriptions.find((item) => item.name === match[1]);
  return {
    sourceName: match[1],
    sourceUrl: source?.url || null,
    operationId: match[2],
  };
}

function collectOperations(specFile, spec) {
  const operations = [];
  for (const [apiPath, pathItem] of Object.entries(spec.paths || {})) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method) || !operation || typeof operation !== 'object') continue;
      operations.push({
        id: operation.operationId || `${method}_${apiPath}`,
        operationId: operation.operationId || null,
        method: method.toUpperCase(),
        path: apiPath,
        summary: operation.summary || '',
        description: operation.description || '',
        tags: operation.tags || [],
        specFile,
        servers: spec.servers || [],
        responseCodes: Object.keys(operation.responses || {}),
        hasRequestBody: Boolean(operation.requestBody),
        parameterCount: Array.isArray(operation.parameters) ? operation.parameters.length : 0,
      });
    }
  }
  return operations;
}

function collectWorkflows(workflowFile, arazzo) {
  const sourceDescriptions = arazzo.sourceDescriptions || [];
  return (arazzo.workflows || []).map((workflow) => {
    const steps = (workflow.steps || []).map((step, index) => {
      const reference = step.operationId || step.operationPath || step.operationRef || '';
      const operation = operationReference(sourceDescriptions, reference);
      return {
        index,
        stepId: step.stepId || `step_${index + 1}`,
        operationReference: reference,
        operationId: operation.operationId || reference || null,
        sourceName: operation.sourceName,
        sourceUrl: operation.sourceUrl,
        successCriteria: step.successCriteria || [],
        outputs: step.outputs || {},
      };
    });
    return {
      workflowId: workflow.workflowId,
      summary: workflow.summary || '',
      description: workflow.description || '',
      file: workflowFile,
      sourceDescriptions,
      stepCount: steps.length,
      criteriaCount: steps.reduce((sum, step) => sum + step.successCriteria.length, 0),
      operations: [...new Set(steps.map((step) => step.operationId).filter(Boolean))],
      steps,
    };
  });
}

export async function buildCatalog({ write = false } = {}) {
  const config = await loadProjectConfig();
  const [specFiles, workflowFiles] = await Promise.all([
    fg(config.catalog.openapi, { cwd: repoRoot, onlyFiles: true, unique: true, followSymbolicLinks: false }),
    fg(config.catalog.workflows, { cwd: repoRoot, onlyFiles: true, unique: true, followSymbolicLinks: false }),
  ]);

  const specs = [];
  const operations = [];
  for (const specFile of specFiles.sort()) {
    const { document } = await readYaml(specFile);
    const specOperations = collectOperations(specFile, document || {});
    specs.push({
      file: normalizePath(specFile),
      title: document?.info?.title || path.basename(specFile),
      version: document?.info?.version || '',
      operationCount: specOperations.length,
      servers: document?.servers || [],
    });
    operations.push(...specOperations);
  }

  const workflowDocuments = [];
  const workflows = [];
  for (const workflowFile of workflowFiles.sort()) {
    const { document } = await readYaml(workflowFile);
    const fileWorkflows = collectWorkflows(workflowFile, document || {});
    workflowDocuments.push({
      file: normalizePath(workflowFile),
      title: document?.info?.title || path.basename(workflowFile),
      version: document?.info?.version || '',
      workflowCount: fileWorkflows.length,
    });
    workflows.push(...fileWorkflows);
  }

  const coveredOperations = new Set(workflows.flatMap((workflow) => workflow.operations));
  const coverage = operations.map((operation) => {
    const linkedWorkflows = workflows
      .filter((workflow) => workflow.operations.includes(operation.operationId))
      .map((workflow) => ({ workflowId: workflow.workflowId, file: workflow.file }));
    return { ...operation, covered: linkedWorkflows.length > 0, workflows: linkedWorkflows };
  });
  const catalog = {
    generatedAt: new Date().toISOString(),
    project: config.project,
    specs,
    workflowDocuments,
    operations,
    workflows,
    coverage,
    summary: {
      specs: specs.length,
      operations: operations.length,
      workflowFiles: workflowDocuments.length,
      workflows: workflows.length,
      coveredOperations: operations.filter((operation) => coveredOperations.has(operation.operationId)).length,
    },
  };

  if (write) {
    const output = path.join(qaRoot, 'output/catalog.json');
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  }
  return catalog;
}
