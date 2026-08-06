import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import { loadProjectConfig, normalizePath, repoRoot } from './project-config.mjs';

const require = createRequire(import.meta.url);
const coreDirectory = path.dirname(fileURLToPath(import.meta.url));
const { fieldItems, parseTestCaseContent } = require(path.join(coreDirectory, 'testcases.cjs'));
const PRIORITIES = ['p0', 'p1', 'p2', 'p3', 'p4'];
const PRIORITY_ORDER = new Map(PRIORITIES.map((priority, index) => [priority, index]));

export function parseTestcaseDocument(content, file, scope) {
  const parsed = parseTestCaseContent(content, { file });
  if (parsed.errors.length) throw new Error(`Invalid TestCase document:\n${parsed.errors.join('\n')}`);
  return parsed.cases.map((testcase) => ({
    id: testcase.id,
    title: testcase.title,
    priority: String(testcase.priority || '').toLowerCase(),
    module: scope.module.id,
    moduleName: scope.module.name,
    capability: scope.capability,
    requirement: testcase.requirement,
    scenario: testcase.scenario,
    preconditions: fieldItems(testcase.fields.get('Preconditions')),
    steps: testcase.steps.map((step) => ({ action: step.action, expected: [...step.expected] })),
    file,
    line: testcase.line,
  }));
}

function countBy(items, key) {
  const counts = {};
  for (const item of items) {
    const value = typeof key === 'function' ? key(item) : item[key];
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

function buildHierarchy(testcases, modules) {
  const hierarchy = new Map(modules.map((module) => [module.id, {
    ...module,
    count: 0,
    requirements: new Map(),
  }]));
  for (const testcase of testcases) {
    const module = hierarchy.get(testcase.module);
    module.count += 1;
    if (!module.requirements.has(testcase.requirement)) {
      module.requirements.set(testcase.requirement, { name: testcase.requirement, count: 0, scenarios: new Map() });
    }
    const requirement = module.requirements.get(testcase.requirement);
    requirement.count += 1;
    if (!requirement.scenarios.has(testcase.scenario)) {
      requirement.scenarios.set(testcase.scenario, { name: testcase.scenario, count: 0 });
    }
    requirement.scenarios.get(testcase.scenario).count += 1;
  }
  return [...hierarchy.values()]
    .filter((module) => module.count > 0)
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
    .map((module) => ({
      id: module.id,
      name: module.name,
      group: module.group,
      count: module.count,
      requirements: [...module.requirements.values()]
        .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
        .map((requirement) => ({
          name: requirement.name,
          count: requirement.count,
          scenarios: [...requirement.scenarios.values()]
            .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN')),
        })),
    }));
}

export async function buildTestcaseCatalog() {
  const config = await loadProjectConfig();
  const scopedFiles = new Map();
  for (const source of config.catalog.testcases) {
    const files = await fg(source.files, {
      cwd: repoRoot,
      onlyFiles: true,
      unique: true,
      followSymbolicLinks: false,
    });
    for (const file of files) {
      const normalized = normalizePath(file);
      if (scopedFiles.has(normalized)) {
        throw new Error(`TestCase file is matched by multiple sources: ${normalized}`);
      }
      scopedFiles.set(normalized, {
        capability: source.capability,
        module: config.modulesById.get(source.module),
      });
    }
  }
  const documents = await Promise.all([...scopedFiles.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(async ([file, scope]) => ({
      file,
      scope,
      content: await fs.readFile(path.join(repoRoot, file), 'utf8'),
    })));
  const testcases = documents.flatMap(({ file, scope, content }) => (
    parseTestcaseDocument(content, file, scope)
  ));
  const priorityCounts = Object.fromEntries(PRIORITIES.map((priority) => [priority, 0]));
  for (const testcase of testcases) {
    if (Object.hasOwn(priorityCounts, testcase.priority)) priorityCounts[testcase.priority] += 1;
  }
  const capabilityCounts = countBy(testcases, 'capability');
  const moduleCounts = countBy(testcases, 'module');
  const tree = buildHierarchy(testcases, config.modules);
  return {
    generatedAt: new Date().toISOString(),
    project: config.project,
    testcases,
    summary: {
      files: documents.length,
      testcases: testcases.length,
      modules: Object.keys(moduleCounts).length,
      capabilities: Object.keys(capabilityCounts).length,
      priorities: priorityCounts,
    },
    filters: {
      modules: tree.map(({ id, name, group, count }) => ({ id, name, group, count })),
      capabilities: Object.entries(capabilityCounts)
        .map(([id, count]) => ({ id, count }))
        .sort((left, right) => left.id.localeCompare(right.id)),
      priorities: PRIORITIES.map((id) => ({ id, count: priorityCounts[id] })),
    },
    tree,
  };
}

function searchableText(testcase, directoryOnly) {
  const directory = [
    testcase.id,
    testcase.title,
    testcase.module,
    testcase.moduleName,
    testcase.capability,
    testcase.requirement,
    testcase.scenario,
  ];
  const values = directoryOnly
    ? directory
    : [...directory, ...testcase.preconditions, ...testcase.steps.flatMap((step) => [step.action, ...step.expected])];
  return values.join('\n').toLocaleLowerCase('zh-CN');
}

export function queryTestcaseCatalog(catalog, options = {}) {
  const module = String(options.module || '').trim();
  const requirement = String(options.requirement || '').trim();
  const scenario = String(options.scenario || '').trim();
  const priorities = new Set((options.priorities || []).map((value) => String(value).toLowerCase()));
  const query = String(options.query || '').trim().toLocaleLowerCase('zh-CN');
  const searchScope = options.searchScope === 'directory' ? 'directory' : 'all';
  const offset = Math.max(0, Number(options.offset) || 0);
  const limit = Math.min(200, Math.max(1, Number(options.limit) || 50));
  const filtered = catalog.testcases
    .filter((testcase) => (
      (!module || testcase.module === module)
      && (!requirement || testcase.requirement === requirement)
      && (!scenario || testcase.scenario === scenario)
      && (!priorities.size || priorities.has(testcase.priority))
      && (!query || searchableText(testcase, searchScope === 'directory').includes(query))
    ))
    .sort((left, right) => (
      (PRIORITY_ORDER.get(left.priority) ?? PRIORITIES.length)
      - (PRIORITY_ORDER.get(right.priority) ?? PRIORITIES.length)
    ));
  return {
    generatedAt: catalog.generatedAt,
    summary: catalog.summary,
    filters: catalog.filters,
    query: { module, requirement, scenario, priorities: [...priorities], q: query, searchScope, offset, limit },
    pagination: { total: filtered.length, offset, limit, hasMore: offset + limit < filtered.length },
    items: filtered.slice(offset, offset + limit),
  };
}
