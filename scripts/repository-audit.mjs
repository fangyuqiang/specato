#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, '..');
const executeFile = promisify(execFile);
const maximumTrackedSize = 1024 * 1024;
const skippedDirectories = new Set([
  '.codegraph',
  '.git',
  '.playwright-cli',
  '.pnpm-store',
  '.qa-workbench',
  'node_modules',
  'temp',
  'tmp',
]);
const skippedPrefixes = [
  'artifacts/',
  'blob-report/',
  'build/',
  'coverage/',
  'dist/',
  'playwright-report/',
  'qa/.runtime/',
  'qa/output/',
  'reports/',
  'test-results/',
  'traces/',
];
const forbiddenExtensions = new Set([
  '.db', '.dump', '.gif', '.har', '.jpeg', '.jpg', '.key', '.p12', '.pem',
  '.pfx', '.png', '.sql', '.sqlite', '.sqlite3', '.trace', '.webp', '.zip',
]);
const textExtensions = new Set([
  '.cjs', '.css', '.html', '.js', '.json', '.jsx', '.md', '.mjs', '.ts',
  '.tsx', '.yaml', '.yml',
]);
const forbiddenTextPatterns = [
  {
    label: 'absolute personal workstation path',
    pattern: /(?:^|[\s"'`(])(?:[a-z]:[\\/](?:users|workspace|code)[\\/]|\/(?:users|home)\/[^/\s]+\/)/im,
  },
  {
    label: 'private IPv4 address',
    pattern: /(?:^|[^\d])(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?:[^\d]|$)/,
  },
  {
    label: 'non-public infrastructure hostname',
    pattern: /\b(?:[a-z0-9-]+\.)+(?:corp|internal|intranet|lan)\b/i,
  },
];
const allowedTrackedGeneratedFiles = new Set(['.codegraph/.gitignore']);
const forbiddenTrackedPrefixes = [
  '.codegraph/',
  '.playwright-cli/',
  '.pnpm-store/',
  '.qa-workbench/',
  'node_modules/',
  'qa/workbench/node_modules/',
  ...skippedPrefixes,
];

function normalized(relativePath) {
  return relativePath.replaceAll('\\', '/');
}

function skipped(relativePath, directoryName) {
  const file = normalized(relativePath);
  return skippedDirectories.has(directoryName)
    || skippedPrefixes.some((prefix) => file === prefix.slice(0, -1) || file.startsWith(prefix));
}

function skippedFile(relativePath) {
  const file = normalized(relativePath);
  const basename = path.posix.basename(file).toLowerCase();
  return file === 'qa/config/environments.yaml'
    || basename === '.env'
    || (basename.startsWith('.env.') && basename !== '.env.example')
    || basename.endsWith('.local.yaml')
    || basename.endsWith('.local.yml')
    || ['.bak', '.log', '.orig', '.tmp'].some((extension) => basename.endsWith(extension));
}

async function walk(directory = repoRoot) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = normalized(path.relative(repoRoot, absolute));
    if (entry.isDirectory()) {
      if (!skipped(relative, entry.name)) files.push(...await walk(absolute));
    } else if (entry.isFile() && !skippedFile(relative)) {
      files.push({ absolute, relative });
    }
  }
  return files;
}

const errors = [];
for (const requiredFile of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) {
  try {
    await fs.access(path.join(repoRoot, requiredFile));
  } catch {
    errors.push(`${requiredFile}: required publication file is missing`);
  }
}

const { stdout: trackedOutput } = await executeFile('git', ['ls-files', '-z'], { cwd: repoRoot });
for (const trackedFile of trackedOutput.split('\0').filter(Boolean).map(normalized)) {
  if (!allowedTrackedGeneratedFiles.has(trackedFile)
    && forbiddenTrackedPrefixes.some((prefix) => trackedFile.startsWith(prefix))) {
    errors.push(`${trackedFile}: generated or machine-local path must not be tracked`);
  }
}

const files = await walk();
for (const file of files) {
  const extension = path.extname(file.relative).toLowerCase();
  const stats = await fs.stat(file.absolute);
  if (stats.size > maximumTrackedSize) {
    errors.push(`${file.relative}: file is larger than 1 MiB (${stats.size} bytes)`);
  }
  if (forbiddenExtensions.has(extension)) {
    errors.push(`${file.relative}: forbidden generated, secret, or business-asset file type`);
  }
  if (textExtensions.has(extension) && file.relative !== 'scripts/repository-audit.mjs') {
    const content = await fs.readFile(file.absolute, 'utf8');
    for (const check of forbiddenTextPatterns) {
      if (check.pattern.test(content)) {
        errors.push(`${file.relative}: ${check.label} found`);
      }
    }
  }
}

if (errors.length) {
  console.error(`Repository audit failed with ${errors.length} finding(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Repository audit passed: ${files.length} files checked.`);
}
