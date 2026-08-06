import fs from 'node:fs/promises';
import path from 'node:path';

function assertInsideRoot(root, target, label) {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} escapes the configured report root.`);
  }
}

function requestRelativePath(requestPath) {
  const decoded = decodeURIComponent(String(requestPath || '/')).replaceAll('\\', '/');
  if (decoded.includes('\0') || decoded.split('/').includes('..')) {
    throw new Error('Report path must stay inside the configured report root.');
  }
  return decoded.replace(/^\/+/, '');
}

export async function resolveReportFile(reportRoot, requestPath) {
  const realRoot = await fs.realpath(reportRoot);
  const relativePath = requestRelativePath(requestPath);
  const candidate = path.resolve(realRoot, relativePath || '.');
  assertInsideRoot(realRoot, candidate, 'Report path');

  const candidateStats = await fs.stat(candidate);
  const requestedFile = candidateStats.isDirectory() ? path.join(candidate, 'index.html') : candidate;
  const realFile = await fs.realpath(requestedFile);
  assertInsideRoot(realRoot, realFile, 'Resolved report file');
  const fileStats = await fs.stat(realFile);
  if (!fileStats.isFile()) {
    const error = new Error(`Report asset is not a file: ${relativePath}`);
    error.code = 'ENOENT';
    throw error;
  }
  return realFile;
}

export function reportFileMiddleware(reportRoot, missingMessage) {
  return async function serveReportFile(req, res, next) {
    if (!['GET', 'HEAD'].includes(req.method)) {
      next();
      return;
    }
    try {
      res.sendFile(await resolveReportFile(reportRoot, req.path));
    } catch (error) {
      if (['ENOENT', 'ENOTDIR'].includes(error.code)) {
        res.status(404).type('text/plain').send(missingMessage);
        return;
      }
      next(error);
    }
  };
}
