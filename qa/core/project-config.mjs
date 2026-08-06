import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const coreDirectory = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(coreDirectory, '../..');
export const qaRoot = path.join(repoRoot, 'qa');
export const PROJECT_FILE = 'qa/project.yaml';

export function normalizePath(value) {
  return String(value || '').replaceAll('\\', '/');
}

export function assertSafeRelative(relativePath, label = 'path') {
  const normalized = normalizePath(relativePath).trim();
  if (!normalized || path.posix.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`${label} must stay inside the repository: ${relativePath}`);
  }
  const resolved = path.resolve(repoRoot, normalized);
  const relative = path.relative(repoRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} escapes the repository: ${relativePath}`);
  }
  return normalized;
}

export function resolveRepoPath(relativePath) {
  return path.resolve(repoRoot, assertSafeRelative(relativePath));
}

function stringList(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new Error(`${label} must be a non-empty string array.`);
  }
  return value.map((item) => assertSafeRelative(item, label));
}

function normalizeTestcaseSources(value, label, modulesById) {
  if (!Array.isArray(value) || !value.length) {
    throw new Error(`${label} must be a non-empty source array.`);
  }
  return value.map((definition, index) => {
    const sourceLabel = `${label}[${index}]`;
    if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
      throw new Error(`${sourceLabel} must be an object.`);
    }
    const moduleId = String(definition.module || '').trim();
    if (!modulesById.has(moduleId)) {
      throw new Error(`${sourceLabel}.module must reference a configured module.`);
    }
    const capability = String(definition.capability || '').trim();
    if (!/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(capability)) {
      throw new Error(`${sourceLabel}.capability must use lowercase path segments.`);
    }
    const files = stringList(definition.files, `${sourceLabel}.files`);
    if (!files.length) throw new Error(`${sourceLabel}.files must not be empty.`);
    return {
      files,
      module: moduleId,
      capability,
    };
  });
}

function normalizeModules(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${PROJECT_FILE}.modules must be an object.`);
  }
  const modules = Object.entries(value).map(([id, definition], order) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      throw new Error(`Invalid module id in ${PROJECT_FILE}: ${id}`);
    }
    const name = String(definition?.name || '').trim();
    if (!name) throw new Error(`${PROJECT_FILE}.modules.${id}.name is required.`);
    return {
      id,
      name,
      description: String(definition?.description || '').trim(),
      group: {
        id: String(definition?.group?.id || 'default').trim() || 'default',
        name: String(definition?.group?.name || 'Modules').trim() || 'Modules',
      },
      order,
    };
  });
  if (!modules.length) throw new Error(`${PROJECT_FILE} must define at least one module.`);
  return modules;
}

export async function loadProjectConfig(relativePath = PROJECT_FILE) {
  const file = assertSafeRelative(relativePath, 'project config path');
  const raw = await fs.readFile(resolveRepoPath(file), 'utf8');
  const document = YAML.parse(raw);
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new Error(`${file} must contain a YAML object.`);
  }
  if (document.schemaVersion !== 1) {
    throw new Error(`${file}.schemaVersion must be 1.`);
  }
  const projectId = String(document.project?.id || '').trim();
  const projectName = String(document.project?.name || '').trim();
  if (!projectId || !projectName) throw new Error(`${file}.project.id and project.name are required.`);

  const modules = normalizeModules(document.modules);
  const modulesById = new Map(modules.map((module) => [module.id, module]));
  const catalog = {
    openapi: stringList(document.catalog?.openapi, `${file}.catalog.openapi`),
    workflows: stringList(document.catalog?.workflows, `${file}.catalog.workflows`),
    testcases: normalizeTestcaseSources(document.catalog?.testcases, `${file}.catalog.testcases`, modulesById),
  };
  const environment = {
    file: assertSafeRelative(document.environment?.file || 'qa/config/environments.yaml', `${file}.environment.file`),
    exampleFile: assertSafeRelative(
      document.environment?.exampleFile || 'qa/config/environments.example.yaml',
      `${file}.environment.exampleFile`,
    ),
  };
  const readableFiles = (document.workbench?.readableFiles || []).map((item) => (
    assertSafeRelative(item, `${file}.workbench.readableFiles`)
  ));
  const readableRoots = (document.workbench?.readableRoots || []).map((item) => {
    const root = assertSafeRelative(item, `${file}.workbench.readableRoots`);
    return root.endsWith('/') ? root : `${root}/`;
  });

  return {
    file,
    project: {
      id: projectId,
      name: projectName,
      description: String(document.project?.description || '').trim(),
    },
    modules,
    modulesById,
    catalog,
    environment,
    workbench: { readableFiles, readableRoots },
  };
}
