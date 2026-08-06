import { defineConfig } from 'allure';

const reportName = process.env.QA_WORKBENCH_ALLURE_REPORT_NAME || 'QA Workbench 自动化测试报告';

export default defineConfig({
  name: reportName,
  historyPath: process.env.QA_WORKBENCH_ALLURE_HISTORY_PATH || './output/allure-history/all.jsonl',
  plugins: {
    awesome: {
      options: {
        reportName,
        reportLanguage: 'en',
        groupBy: ['parentSuite', 'suite', 'subSuite'],
        singleFile: false,
      },
    },
  },
});
