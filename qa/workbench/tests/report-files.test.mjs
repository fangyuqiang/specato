import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { resolveReportFile } from '../src/server/services/report-files.mjs';

test('resolves report assets inside the configured realpath boundary', async (t) => {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'specato-report-files-'));
  t.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const reportRoot = path.join(temporaryRoot, 'reports');
  const runRoot = path.join(reportRoot, 'run-1');
  await fs.mkdir(runRoot, { recursive: true });
  await fs.writeFile(path.join(runRoot, 'index.html'), '<h1>Synthetic report</h1>', 'utf8');

  const resolved = await resolveReportFile(reportRoot, '/run-1/');
  assert.equal(resolved, await fs.realpath(path.join(runRoot, 'index.html')));
  await assert.rejects(resolveReportFile(reportRoot, '/../outside.txt'), /must stay inside/);
});

test('rejects a report symlink that resolves outside the configured root', async (t) => {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'specato-report-symlink-'));
  t.after(() => fs.rm(temporaryRoot, { recursive: true, force: true }));
  const reportRoot = path.join(temporaryRoot, 'reports');
  const outsideRoot = path.join(temporaryRoot, 'outside');
  const linkRoot = path.join(reportRoot, 'leak');
  await fs.mkdir(reportRoot, { recursive: true });
  await fs.mkdir(outsideRoot, { recursive: true });
  await fs.writeFile(path.join(outsideRoot, 'index.html'), '<h1>Outside</h1>', 'utf8');
  await fs.symlink(outsideRoot, linkRoot, 'junction');

  await assert.rejects(resolveReportFile(reportRoot, '/leak/'), /escapes the configured report root/);
});
