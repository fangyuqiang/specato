import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { qaRoot } from './allure-indexer.mjs';

export const defaultPlaywrightReportRoot = path.join(qaRoot, 'output/playwright/ui-runs');
export const PLAYWRIGHT_REPORT_METADATA_FILE = 'report.json';

async function readMetadata(reportRoot, runId) {
  try {
    return JSON.parse(await fs.readFile(
      path.join(reportRoot, runId, PLAYWRIGHT_REPORT_METADATA_FILE),
      'utf8',
    ));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function buildPlaywrightReportList({ reportRoot = defaultPlaywrightReportRoot } = {}) {
  const indexFiles = await fg('*/html-report/index.html', {
    cwd: reportRoot,
    onlyFiles: true,
    unique: true,
    suppressErrors: true,
  });
  const reports = [];

  for (const indexFile of indexFiles) {
    const runId = indexFile.split('/')[0];
    const metadata = await readMetadata(reportRoot, runId);
    const stats = await fs.stat(path.join(reportRoot, indexFile));
    reports.push({
      id: `playwright-${runId}`,
      layer: 'ui',
      format: 'playwright',
      title: 'UI 自动化报告',
      description: 'Playwright 原生 HTML 报告，适合查看视觉对比、截图和 Trace',
      generatedAt: metadata?.generatedAt || stats.mtime.toISOString(),
      summary: metadata?.summary || null,
      runId,
      url: `/reports/playwright/${encodeURIComponent(runId)}/html-report/`,
    });
  }

  return reports.sort((left, right) => (
    String(right.generatedAt).localeCompare(String(left.generatedAt))
      || right.id.localeCompare(left.id)
  ));
}
