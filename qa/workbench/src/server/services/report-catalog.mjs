import {
  buildAllureReportList,
  defaultReportRoot,
} from './allure-indexer.mjs';
import {
  buildPlaywrightReportList,
  defaultPlaywrightReportRoot,
} from './playwright-report-indexer.mjs';

export async function buildReportList({
  allureReportRoot = defaultReportRoot,
  playwrightReportRoot = defaultPlaywrightReportRoot,
} = {}) {
  const reports = [
    ...await buildAllureReportList({ reportRoot: allureReportRoot }),
    ...await buildPlaywrightReportList({ reportRoot: playwrightReportRoot }),
  ];

  return reports.sort((left, right) => (
    String(right.generatedAt).localeCompare(String(left.generatedAt))
      || right.id.localeCompare(left.id)
  ));
}
