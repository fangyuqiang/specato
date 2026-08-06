import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildProjectAllureIndex } from '../src/server/services/allure-indexer.mjs';

test('recognizes TestCase references from the project catalog', async (t) => {
  const resultsRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'specato-allure-'));
  t.after(() => fs.rm(resultsRoot, { recursive: true, force: true }));
  const apiRoot = path.join(resultsRoot, 'api');
  await fs.mkdir(apiRoot, { recursive: true });
  await fs.writeFile(path.join(apiRoot, 'synthetic-result.json'), JSON.stringify({
    uuid: 'synthetic-result',
    name: 'Synthetic API result',
    status: 'passed',
    start: 1,
    stop: 2,
    labels: [
      { name: 'caseRef', value: 'TC-DEMO-HEALTH-0001' },
      { name: 'module', value: 'demo' },
    ],
  }), 'utf8');

  const index = await buildProjectAllureIndex({ resultsRoot });
  assert.equal(index.summary.recognizedCaseRefs, 1);
  assert.equal(index.summary.unknownCaseRefs, 0);
  assert.equal(index.results[0].moduleName, 'Demo service');
  assert.deepEqual(Object.keys(index.layers), ['api', 'ui']);
});
