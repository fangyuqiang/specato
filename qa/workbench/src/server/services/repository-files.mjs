import fs from 'node:fs/promises';
import path from 'node:path';
import {
  assertSafeRelative,
  loadProjectConfig,
  normalizePath,
  resolveRepoPath,
} from '../../../../core/project-config.mjs';

function sensitiveFile(relativePath, environmentFile) {
  const normalized = normalizePath(relativePath).toLowerCase();
  const basename = path.posix.basename(normalized);
  const segments = normalized.split('/');
  return normalized === environmentFile.toLowerCase()
    || segments.includes('.git')
    || segments.includes('node_modules')
    || basename === '.env'
    || basename.startsWith('.env.')
    || basename.endsWith('.local.yaml')
    || basename.endsWith('.local.yml')
    || basename.endsWith('.sql')
    || basename.endsWith('.dump');
}

export async function safeRelative(relativePath) {
  const normalized = assertSafeRelative(relativePath, 'Workbench file path');
  const config = await loadProjectConfig();
  if (sensitiveFile(normalized, config.environment.file)) {
    throw new Error(`Sensitive files cannot be read through Workbench: ${normalized}`);
  }
  const normalizedLower = normalized.toLowerCase();
  const allowedFiles = new Set(config.workbench.readableFiles.map((file) => file.toLowerCase()));
  const allowedRoots = config.workbench.readableRoots.map((root) => root.toLowerCase());
  if (!allowedFiles.has(normalizedLower) && !allowedRoots.some((root) => normalizedLower.startsWith(root))) {
    throw new Error(`File is outside the Workbench read boundary: ${normalized}`);
  }
  return normalized;
}

export async function fileStatus(relativePath) {
  try {
    await fs.access(resolveRepoPath(relativePath));
    return { path: relativePath, exists: true };
  } catch (error) {
    if (error.code === 'ENOENT') return { path: relativePath, exists: false };
    throw error;
  }
}

export async function readRepositoryText(relativePath) {
  const safePath = await safeRelative(relativePath);
  const [realRepositoryRoot, realTarget] = await Promise.all([
    fs.realpath(resolveRepoPath('.')),
    fs.realpath(resolveRepoPath(safePath)),
  ]);
  const realRelative = path.relative(realRepositoryRoot, realTarget);
  if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
    throw new Error(`Resolved file escapes the repository: ${safePath}`);
  }
  return {
    path: safePath,
    content: await fs.readFile(realTarget, 'utf8'),
  };
}
