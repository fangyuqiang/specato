import fs from 'node:fs/promises';
import YAML from 'yaml';
import { loadProjectConfig, resolveRepoPath } from './project-config.mjs';

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) return clone(override);
  const next = clone(base) || {};
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    next[key] = isPlainObject(next[key]) && isPlainObject(value)
      ? deepMerge(next[key], value)
      : clone(value);
  }
  return next;
}

function normalizeServerUrl(value, environmentId, serverName) {
  const normalized = typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '';
  if (!normalized) throw new Error(`Environment "${environmentId}" requires servers.${serverName}`);
  let url;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error(`Environment "${environmentId}" has invalid servers.${serverName}: ${normalized}`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`Environment "${environmentId}" servers.${serverName} must use http or https`);
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      `Environment "${environmentId}" servers.${serverName} cannot contain userinfo, query parameters, or fragments`,
    );
  }
  return normalized;
}

function normalizeVariables(value, environmentId) {
  if (value === undefined) return {};
  if (!isPlainObject(value)) throw new Error(`Environment "${environmentId}" variables must be an object`);
  return Object.fromEntries(Object.entries(value).map(([name, definition]) => {
    const fromEnv = String(definition?.fromEnv || '').trim();
    if (!fromEnv || !/^[A-Z_][A-Z0-9_]*$/.test(fromEnv)) {
      throw new Error(`Environment "${environmentId}" variables.${name}.fromEnv must be an environment variable name`);
    }
    return [name, { fromEnv }];
  }));
}

function resolveEnvironment(id, rawEnvironments, resolving = []) {
  const entry = rawEnvironments[id];
  if (!isPlainObject(entry)) return null;
  if (resolving.includes(id)) {
    throw new Error(`Circular environment extends chain: ${[...resolving, id].join(' -> ')}`);
  }
  const parentId = typeof entry.extends === 'string' ? entry.extends.trim() : '';
  if (parentId && !isPlainObject(rawEnvironments[parentId])) {
    throw new Error(`Environment "${id}" extends missing environment "${parentId}"`);
  }
  const parent = parentId ? resolveEnvironment(parentId, rawEnvironments, [...resolving, id]) : {};
  const environment = deepMerge(parent || {}, entry);
  delete environment.extends;
  environment.id = id;
  environment.label ||= id;
  if (!isPlainObject(environment.servers) || !Object.keys(environment.servers).length) {
    throw new Error(`Environment "${id}" requires at least one named server`);
  }
  environment.servers = Object.fromEntries(Object.entries(environment.servers).map(([name, value]) => [
    name,
    normalizeServerUrl(value, id, name),
  ]));
  environment.transport = isPlainObject(environment.transport) ? environment.transport : {};
  if (Object.hasOwn(environment.transport, 'tlsVerify') && typeof environment.transport.tlsVerify !== 'boolean') {
    throw new Error(`Environment "${id}" transport.tlsVerify must be a boolean`);
  }
  environment.transport.tlsVerify = environment.transport.tlsVerify !== false;
  environment.variables = normalizeVariables(environment.variables, id);
  return environment;
}

export function buildEnvironmentConfig(data) {
  const input = isPlainObject(data) ? data : {};
  const rawEnvironments = isPlainObject(input.environments) ? input.environments : {};
  const environments = Object.fromEntries(Object.keys(rawEnvironments).map((id) => [
    id,
    resolveEnvironment(id, rawEnvironments),
  ]));
  const defaultEnvironment = String(input.default || '').trim() || Object.keys(environments)[0] || '';
  if (defaultEnvironment && !environments[defaultEnvironment]) {
    throw new Error(`Default environment "${defaultEnvironment}" is not configured`);
  }
  return { defaultEnvironment, environments };
}

async function readYamlFile(relativePath) {
  try {
    const raw = await fs.readFile(resolveRepoPath(relativePath), 'utf8');
    const data = raw.trim() ? YAML.parse(raw) : {};
    if (!isPlainObject(data)) throw new Error(`${relativePath} must contain a YAML object`);
    return { path: relativePath, exists: true, content: raw, data };
  } catch (error) {
    if (error.code === 'ENOENT') return { path: relativePath, exists: false, content: '', data: {} };
    throw error;
  }
}

export async function environmentFiles() {
  const config = await loadProjectConfig();
  return config.environment;
}

export async function loadEnvironmentConfig() {
  const files = await environmentFiles();
  const environmentFile = await readYamlFile(files.file);
  if (!environmentFile.exists) {
    throw new Error(`QA environment file not found: ${files.file}. Copy ${files.exampleFile} and rename it first.`);
  }
  return { ...buildEnvironmentConfig(environmentFile.data), environmentFile };
}

export function environmentList(config, processEnvironment = process.env) {
  return Object.values(config.environments || {}).map((environment) => ({
    id: environment.id,
    label: environment.label || environment.id,
    description: environment.description || '',
    kind: environment.kind || '',
    servers: environment.servers,
    transport: environment.transport,
    variables: Object.entries(environment.variables || {}).map(([name, definition]) => ({
      name,
      fromEnv: definition.fromEnv,
      configured: Boolean(processEnvironment[definition.fromEnv]),
    })),
  }));
}

export function selectEnvironment(config, requestedId, processEnvironment = process.env) {
  const id = String(requestedId || config.defaultEnvironment || '').trim();
  const environment = config.environments?.[id];
  if (!id || !environment) throw new Error(`Environment "${id || requestedId}" is not configured`);
  const variables = Object.fromEntries(Object.entries(environment.variables || {}).map(([name, definition]) => [
    name,
    processEnvironment[definition.fromEnv] || '',
  ]));
  return { id, environment: { ...clone(environment), variables } };
}

export function resolveServer(environment, serverName) {
  const server = environment?.servers?.[serverName];
  if (!server) throw new Error(`Unknown QA server: ${serverName}`);
  return server;
}

export function verifyTls(environment) {
  return environment?.transport?.tlsVerify !== false;
}
