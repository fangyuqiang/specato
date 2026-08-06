#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import {
  ALLURE_LAYERS,
  ALLURE_REPORT_DEFINITIONS,
  REPORT_METADATA_FILE,
  buildProjectAllureIndex,
  buildAllureReportList,
  defaultReportRoot,
  defaultResultsRoot,
  qaRoot,
} from '../src/server/services/allure-indexer.mjs';

const outputRoot = path.join(qaRoot, 'output');
const allureCli = fileURLToPath(new URL('../node_modules/allure/cli.js', import.meta.url));
const allureConfig = fileURLToPath(new URL('../config/allurerc.mjs', import.meta.url));

function runAllure(args, env = {}) {
  const result = spawnSync(process.execPath, [allureCli, ...args], {
    cwd: qaRoot,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Allure exited with code ${result.status}`);
}

function assertOutputPath(target) {
  const relative = path.relative(outputRoot, path.resolve(target));
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to modify a path outside qa/output: ${target}`);
  }
}

function reportDefinition(layer) {
  const definition = ALLURE_REPORT_DEFINITIONS.find((item) => item.layer === layer);
  if (!definition) throw new Error(`Unknown Allure layer: ${layer}`);
  return definition;
}

function historyRootFor(reportRoot) {
  return path.join(path.dirname(reportRoot), 'allure-history');
}

function createReportId(layer, generatedAt) {
  const timestamp = generatedAt.replace(/\D/g, '');
  return `${layer}-${timestamp}-${randomUUID().slice(0, 8)}`;
}

export async function generateAllureReports({
  resultsRoot = defaultResultsRoot,
  reportRoot = defaultReportRoot,
  layer = 'all',
  execution = null,
} = {}) {
  const layers = layer === 'all' ? ALLURE_LAYERS : [reportDefinition(layer).layer];
  const historyRoot = historyRootFor(reportRoot);
  const index = await buildProjectAllureIndex({ resultsRoot });

  const reports = [];
  for (const currentLayer of layers) {
    const definition = reportDefinition(currentLayer);
    const layerResultsRoot = path.join(resultsRoot, currentLayer);
    const historyPath = path.join(historyRoot, `${currentLayer}.jsonl`);
    const resultFiles = await fg('**/*-result.json', {
      cwd: layerResultsRoot,
      onlyFiles: true,
      unique: true,
    });

    assertOutputPath(historyPath);
    if (!resultFiles.length) continue;

    const startedAt = new Date().toISOString();
    const id = createReportId(currentLayer, startedAt);
    const layerReportRoot = path.join(reportRoot, id);
    assertOutputPath(layerReportRoot);
    await fs.mkdir(historyRoot, { recursive: true });
    runAllure([
      'generate',
      '--config', allureConfig,
      '--output', layerReportRoot,
      '--report-name', definition.title,
      layerResultsRoot,
    ], {
      SPECATO_ALLURE_HISTORY_PATH: historyPath,
      SPECATO_ALLURE_REPORT_NAME: definition.title,
    });
    const generatedAt = new Date().toISOString();
    const report = {
      schemaVersion: 1,
      id,
      layer: currentLayer,
      format: 'allure',
      title: definition.title,
      description: definition.description,
      generatedAt,
      summary: index.layers[currentLayer],
      ...(execution ? { execution } : {}),
    };
    await fs.writeFile(
      path.join(layerReportRoot, REPORT_METADATA_FILE),
      `${JSON.stringify(report, null, 2)}\n`,
      'utf8',
    );
    reports.push({ ...report, url: `/reports/allure/${encodeURIComponent(id)}/` });
  }

  return { reports };
}

export async function cleanAllureResults({
  resultsRoot = defaultResultsRoot,
  layer,
} = {}) {
  if (!ALLURE_LAYERS.includes(layer)) throw new Error(`Unknown Allure layer: ${layer}`);
  const target = path.join(resultsRoot, layer);
  assertOutputPath(target);
  await fs.rm(target, { recursive: true, force: true });
  return { cleaned: [target.replaceAll('\\', '/')] };
}

export async function cleanAllureWorkspace({
  resultsRoot = defaultResultsRoot,
  reportRoot = defaultReportRoot,
  layer = 'all',
} = {}) {
  if (layer !== 'all' && layer !== 'report' && !ALLURE_LAYERS.includes(layer)) {
    throw new Error(`Unknown Allure layer: ${layer}`);
  }
  let targets;
  if (layer === 'all') {
    targets = [...ALLURE_LAYERS.map((name) => path.join(resultsRoot, name)), path.join(resultsRoot, 'merged'), reportRoot];
  } else if (layer === 'report') {
    targets = [reportRoot];
  } else {
    const reports = await buildAllureReportList({ reportRoot });
    targets = [
      path.join(resultsRoot, layer),
      ...reports.filter((report) => report.layer === layer).map((report) => path.join(reportRoot, report.id)),
    ];
  }
  for (const target of targets) {
    assertOutputPath(target);
    await fs.rm(target, { recursive: true, force: true });
  }
  return { cleaned: targets.map((target) => target.replaceAll('\\', '/')) };
}

function parseArgs(argv) {
  const args = {
    command: argv[0] || 'status',
    layer: 'all',
    report: '',
    resultsRoot: defaultResultsRoot,
    reportRoot: defaultReportRoot,
  };
  for (let index = 1; index < argv.length; index += 1) {
    if (argv[index] === '--layer') args.layer = argv[++index] || '';
    else if (argv[index] === '--report') args.report = argv[++index] || '';
    else if (argv[index] === '--results-root') args.resultsRoot = path.resolve(qaRoot, argv[++index] || '');
    else if (argv[index] === '--report-root') args.reportRoot = path.resolve(qaRoot, argv[++index] || '');
    else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let result;
  if (args.command === 'clean') result = await cleanAllureWorkspace(args);
  else if (args.command === 'generate') result = await generateAllureReports(args);
  else if (args.command === 'open') {
    if (!args.report) throw new Error('The open command requires --report <report-id>');
    const reports = await buildAllureReportList({ reportRoot: args.reportRoot });
    const report = reports.find((item) => item.id === args.report);
    if (!report) throw new Error(`Unknown Allure report: ${args.report}`);
    runAllure(['open', path.join(args.reportRoot, report.id)]);
    result = { report };
  } else if (args.command === 'status') {
    result = {
      reports: await buildAllureReportList({ reportRoot: args.reportRoot }),
    };
  } else throw new Error(`Unknown command: ${args.command}`);
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exitCode = 1;
  });
}
