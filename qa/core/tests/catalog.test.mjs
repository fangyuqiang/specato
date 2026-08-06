import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCatalog } from '../catalog.mjs';

test('builds an OpenAPI and Arazzo catalog from the synthetic project manifest', async () => {
  const catalog = await buildCatalog();
  assert.equal(catalog.project.id, 'qa-workbench-demo');
  assert.equal(catalog.summary.specs, 1);
  assert.equal(catalog.summary.operations, 2);
  assert.equal(catalog.summary.workflows, 1);
  assert.equal(catalog.summary.coveredOperations, 1);
  assert.equal(catalog.operations.find((operation) => operation.operationId === 'getHealth')?.path, '/health');
});
