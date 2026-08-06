import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { qaRoot } from '../../../core/project-config.mjs';
import {
  environmentFiles,
  environmentList,
  loadEnvironmentConfig,
} from '../../../core/environment-config.mjs';
import {
  defaultReportRoot,
} from './services/allure-indexer.mjs';
import { defaultPlaywrightReportRoot } from './services/playwright-report-indexer.mjs';
import { buildReportList } from './services/report-catalog.mjs';
import { reportFileMiddleware } from './services/report-files.mjs';
import { queryTestcaseCatalog } from './services/testcase-catalog.mjs';
import { getApiCatalog, getTestcaseCatalog } from './services/catalogs.mjs';
import {
  fileStatus,
  readRepositoryText,
} from './services/repository-files.mjs';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const workbenchRoot = path.resolve(serverDirectory, '../..');
export const app = express();
const development = process.argv.includes('--dev');

export function validateHost(host, allowRemote = process.env.SPECATO_ALLOW_REMOTE === '1') {
  if (['127.0.0.1', '::1', 'localhost'].includes(host) || allowRemote) return;
  throw new Error('Remote Workbench binding requires SPECATO_ALLOW_REMOTE=1.');
}

app.use(express.json({ limit: '1mb' }));

function refreshRequested(req) {
  return req.query.refresh === '1';
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/catalog', async (req, res, next) => {
  try {
    res.json(await getApiCatalog({ refresh: refreshRequested(req) }));
  } catch (error) {
    next(error);
  }
});

app.get('/api/testcases', async (req, res, next) => {
  try {
    const catalog = await getTestcaseCatalog({ refresh: refreshRequested(req) });
    res.json(queryTestcaseCatalog(catalog, {
      module: req.query.module,
      requirement: req.query.requirement,
      scenario: req.query.scenario,
      priorities: String(req.query.priority || '').split(',').filter(Boolean),
      query: req.query.q,
      searchScope: req.query.searchScope,
      offset: req.query.offset,
      limit: req.query.limit,
    }));
  } catch (error) {
    next(error);
  }
});

app.get('/api/testcases/tree', async (req, res, next) => {
  try {
    const catalog = await getTestcaseCatalog({ refresh: refreshRequested(req) });
    res.json({
      generatedAt: catalog.generatedAt,
      summary: catalog.summary,
      filters: catalog.filters,
      tree: catalog.tree,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/reports', async (_req, res, next) => {
  try {
    res.json({
      ok: true,
      reports: await buildReportList(),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/environments', async (_req, res, next) => {
  try {
    const files = await environmentFiles();
    let config;
    try {
      config = await loadEnvironmentConfig();
    } catch (error) {
      res.json({
        ok: true,
        configError: error.message || String(error),
        environmentFile: await fileStatus(files.file),
        environmentExampleFile: files.exampleFile,
        defaultEnvironment: '',
        environments: [],
      });
      return;
    }
    res.json({
      ok: true,
      environmentFile: {
        path: config.environmentFile.path,
        exists: config.environmentFile.exists,
      },
      environmentExampleFile: files.exampleFile,
      defaultEnvironment: config.defaultEnvironment,
      environments: environmentList(config),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/raw', async (req, res, next) => {
  try {
    const file = await readRepositoryText(req.query.path);
    const extension = path.extname(file.path).toLowerCase();
    res.type(['.yaml', '.yml'].includes(extension) ? 'application/yaml' : 'text/plain').send(file.content);
  } catch (error) {
    next(error);
  }
});

app.get('/api/file', async (req, res, next) => {
  try {
    res.json(await readRepositoryText(req.query.path));
  } catch (error) {
    next(error);
  }
});

app.use('/reports/allure', reportFileMiddleware(
  defaultReportRoot,
  'Allure report has not been generated.',
));
app.use('/reports/playwright', reportFileMiddleware(
  defaultPlaywrightReportRoot,
  'Playwright report has not been generated.',
));

if (development) {
  const allowedHosts = String(process.env.SPECATO_ALLOWED_HOSTS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    root: workbenchRoot,
    appType: 'spa',
    server: {
      middlewareMode: true,
      allowedHosts,
    },
  });
  app.use(vite.middlewares);
} else {
  const staticRoot = path.join(qaRoot, 'output/workbench');
  const staticIndex = path.join(staticRoot, 'index.html');
  try {
    await fs.access(staticIndex);
    app.use(express.static(staticRoot));
    app.get(/^(?!\/api(?:\/|$)).*/, (req, res, next) => {
      if (!req.accepts('html')) {
        next();
        return;
      }
      res.sendFile(staticIndex);
    });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.warn('Workbench static UI is missing. Run from qa/: pnpm run build');
  }
}

app.use((error, _req, res, _next) => {
  const status = error.code === 'ENOENT' ? 404 : 400;
  res.status(status).json({ ok: false, error: error.message || String(error) });
});

export function startServer({
  host = process.env.SPECATO_HOST || '127.0.0.1',
  port = Number(process.env.SPECATO_PORT || 4317),
} = {}) {
  validateHost(host);
  return app.listen(port, host, () => {
    console.log(`Specato listening on http://${host}:${port}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer();
}
