import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import { loadProjectConfig } from '../../../../core/project-config.mjs';
import { buildTestcaseCatalog } from '../../../../core/testcase-catalog.mjs';

const serviceDirectory = path.dirname(fileURLToPath(import.meta.url));
export const qaRoot = path.resolve(serviceDirectory, '../../../..');
export const defaultResultsRoot = path.join(qaRoot, 'output/allure-results');
export const defaultReportRoot = path.join(qaRoot, 'output/allure-report');
export const REPORT_METADATA_FILE = 'report.json';
export const ALLURE_REPORT_DEFINITIONS = [
  {
    layer: 'api',
    title: 'API 自动化报告',
    description: '接口契约与业务流程的完整 Allure HTML 报告',
  },
  {
    layer: 'ui',
    title: 'UI 自动化报告',
    description: '端到端用户路径的完整 Allure HTML 报告',
  },
];
export const ALLURE_LAYERS = ALLURE_REPORT_DEFINITIONS.map(({ layer }) => layer);
const STATUSES = ['passed', 'failed', 'broken', 'skipped', 'unknown'];

function emptyStatusCounts() {
  return Object.fromEntries(STATUSES.map((status) => [status, 0]));
}

function labelsByName(labels = []) {
  const values = new Map();
  for (const label of labels) {
    const name = String(label?.name || '').trim().toLowerCase();
    const value = String(label?.value || '').trim();
    if (!name || !value) continue;
    if (!values.has(name)) values.set(name, []);
    values.get(name).push(value);
  }
  return values;
}

function firstLabel(labels, name) {
  return labels.get(name.toLowerCase())?.[0] || '';
}

function resultSummary(document, layer, file, knownIds, moduleRegistry) {
  const labels = labelsByName(document.labels);
  const caseRefs = [...new Set(labels.get('caseref') || [])];
  const recognizedCaseRefs = caseRefs.filter((id) => knownIds.has(id));
  const unknownCaseRefs = caseRefs.filter((id) => !knownIds.has(id));
  const status = STATUSES.includes(document.status) ? document.status : 'unknown';
  const moduleKey = firstLabel(labels, 'module');
  const registeredModule = moduleRegistry.byId.get(moduleKey);
  return {
    uuid: document.uuid || '',
    name: document.name || document.fullName || path.basename(file),
    fullName: document.fullName || '',
    status,
    layer,
    framework: firstLabel(labels, 'framework'),
    suite: firstLabel(labels, 'suite'),
    module: moduleKey,
    moduleName: registeredModule?.name || '',
    unknownModule: Boolean(moduleKey && !registeredModule),
    environment: firstLabel(labels, 'environment'),
    caseRefs,
    recognizedCaseRefs,
    unknownCaseRefs,
    start: Number(document.start) || null,
    stop: Number(document.stop) || null,
    duration: document.stop && document.start ? Math.max(0, Number(document.stop) - Number(document.start)) : null,
    file: file.replaceAll('\\', '/'),
  };
}

function summarize(results) {
  const statuses = emptyStatusCounts();
  for (const result of results) statuses[result.status] += 1;
  return {
    results: results.length,
    statuses,
    linkedResults: results.filter((result) => result.caseRefs.length > 0).length,
    recognizedCaseRefs: new Set(results.flatMap((result) => result.recognizedCaseRefs)).size,
    unknownCaseRefs: new Set(results.flatMap((result) => result.unknownCaseRefs)).size,
    recognizedModules: new Set(results.filter((result) => result.moduleName).map((result) => result.module)).size,
    unknownModules: new Set(results.filter((result) => result.unknownModule).map((result) => result.module)).size,
  };
}

export async function buildAllureIndex({ resultsRoot = defaultResultsRoot, knownIds = new Set() } = {}) {
  const project = await loadProjectConfig();
  const moduleRegistry = { byId: project.modulesById };
  const results = [];
  const errors = [];
  const layers = {};

  for (const layer of ALLURE_LAYERS) {
    const files = await fg(`${layer}/**/*-result.json`, {
      cwd: resultsRoot,
      onlyFiles: true,
      unique: true,
    });
    const layerResults = [];
    for (const file of files.sort()) {
      try {
        const content = await fs.readFile(path.join(resultsRoot, file), 'utf8');
        const document = JSON.parse(content);
        layerResults.push(resultSummary(document, layer, file, knownIds, moduleRegistry));
      } catch (error) {
        errors.push({ layer, file: file.replaceAll('\\', '/'), error: error.message || String(error) });
      }
    }
    layerResults.sort((left, right) => (right.stop || right.start || 0) - (left.stop || left.start || 0));
    layers[layer] = summarize(layerResults);
    results.push(...layerResults);
  }

  results.sort((left, right) => (right.stop || right.start || 0) - (left.stop || left.start || 0));
  return {
    generatedAt: new Date().toISOString(),
    resultsRoot: resultsRoot.replaceAll('\\', '/'),
    summary: summarize(results),
    layers,
    results,
    errors,
  };
}

export async function buildProjectAllureIndex({ resultsRoot = defaultResultsRoot } = {}) {
  const testcaseCatalog = await buildTestcaseCatalog();
  const knownIds = new Set(testcaseCatalog.testcases.map((testcase) => testcase.id));
  return buildAllureIndex({ resultsRoot, knownIds });
}

export async function buildAllureReportList({ reportRoot = defaultReportRoot } = {}) {
  const metadataFiles = await fg(`*/${REPORT_METADATA_FILE}`, {
    cwd: reportRoot,
    onlyFiles: true,
    unique: true,
    suppressErrors: true,
  });
  const reports = [];

  for (const metadataFile of metadataFiles) {
    const reportDirectory = path.dirname(metadataFile);
    const reportId = path.basename(reportDirectory);
    const metadata = JSON.parse(await fs.readFile(path.join(reportRoot, metadataFile), 'utf8'));
    if (metadata.id !== reportId) throw new Error(`Allure report id does not match its directory: ${metadataFile}`);
    if (!ALLURE_LAYERS.includes(metadata.layer)) throw new Error(`Unknown Allure layer in ${metadataFile}: ${metadata.layer}`);
    try {
      await fs.access(path.join(reportRoot, reportDirectory, 'index.html'));
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    reports.push({
      ...metadata,
      format: 'allure',
      url: `/reports/allure/${encodeURIComponent(reportId)}/`,
    });
  }

  return reports.sort((left, right) => (
    String(right.generatedAt).localeCompare(String(left.generatedAt))
      || right.id.localeCompare(left.id)
  ));
}
