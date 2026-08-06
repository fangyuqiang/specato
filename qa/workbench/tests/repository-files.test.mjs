import assert from 'node:assert/strict';
import test from 'node:test';
import { readRepositoryText, safeRelative } from '../src/server/services/repository-files.mjs';

test('reads only manifest-approved synthetic files', async () => {
  const file = await readRepositoryText('examples/demo/openapi/demo.oas.yaml');
  assert.match(file.content, /Synthetic Demo API/);
});

test('rejects traversal, repository metadata, local environments, and unrelated files', async () => {
  await assert.rejects(safeRelative('examples/demo/../../.git/config'), /inside the repository/);
  await assert.rejects(safeRelative('examples/demo/.git/config'), /Sensitive files/);
  await assert.rejects(safeRelative('qa/config/environments.yaml'), /Sensitive files/);
  await assert.rejects(safeRelative('package.json'), /outside the Workbench read boundary/);
});
