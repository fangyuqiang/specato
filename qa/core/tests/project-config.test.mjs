import assert from 'node:assert/strict';
import test from 'node:test';
import { assertSafeRelative, loadProjectConfig } from '../project-config.mjs';

test('loads the standalone project manifest', async () => {
  const config = await loadProjectConfig();
  assert.equal(config.project.name, 'QA Workbench Demo');
  assert.equal(config.modulesById.get('demo')?.group.id, 'examples');
  assert.deepEqual(config.catalog.testcases[0], {
    files: ['examples/demo/testcases/*.md'],
    module: 'demo',
    capability: 'demo/health',
  });
});

test('rejects repository path traversal', () => {
  assert.throws(() => assertSafeRelative('../outside.yaml'), /inside the repository/);
  assert.throws(() => assertSafeRelative('examples/../../outside.yaml'), /inside the repository/);
});
