import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { app, validateHost } from '../src/server/index.mjs';

test('serves only synthetic catalog data and rejects traversal', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))));
  await once(server, 'listening');
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const health = await fetch(`${baseUrl}/api/health`).then((response) => response.json());
  const catalog = await fetch(`${baseUrl}/api/catalog`).then((response) => response.json());
  const testcases = await fetch(`${baseUrl}/api/testcases?limit=1`).then((response) => response.json());
  const environments = await fetch(`${baseUrl}/api/environments`).then((response) => response.json());
  const missingReport = await fetch(`${baseUrl}/reports/allure/missing/`);
  const traversal = await fetch(
    `${baseUrl}/api/file?path=${encodeURIComponent('examples/demo/../../.git/config')}`,
  );

  assert.equal(health.ok, true);
  assert.equal(catalog.summary.specs, 1);
  assert.equal(catalog.summary.operations, 2);
  assert.equal(catalog.summary.workflows, 1);
  assert.equal(testcases.pagination.total, 1);
  assert.match(environments.configError, /environment file not found/i);
  assert.equal(missingReport.status, 404);
  assert.match(await missingReport.text(), /has not been generated/i);
  assert.equal(traversal.status, 400);
});

test('requires an explicit opt-in for non-loopback binding', () => {
  assert.doesNotThrow(() => validateHost('127.0.0.1', false));
  assert.throws(() => validateHost('0.0.0.0', false), /SPECATO_ALLOW_REMOTE=1/);
  assert.doesNotThrow(() => validateHost('0.0.0.0', true));
});
