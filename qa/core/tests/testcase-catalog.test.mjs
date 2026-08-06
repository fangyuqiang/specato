import assert from 'node:assert/strict';
import test from 'node:test';
import { buildTestcaseCatalog, parseTestcaseDocument, queryTestcaseCatalog } from '../testcase-catalog.mjs';

test('builds and searches the synthetic TestCase catalog', async () => {
  const catalog = await buildTestcaseCatalog();
  assert.equal(catalog.summary.files, 1);
  assert.equal(catalog.summary.testcases, 1);
  assert.equal(catalog.tree[0].id, 'demo');
  const result = queryTestcaseCatalog(catalog, { query: 'GET /health' });
  assert.equal(result.pagination.total, 1);
  assert.equal(result.items[0].id, 'TC-DEMO-HEALTH-0001');
  assert.equal(result.items[0].file, 'examples/demo/testcases/health.md');
});

test('accepts a stable TestCase id independent from the capability path', () => {
  const content = `# Requirement: Synthetic health

## Test Cases

### Scenario: Read health

#### TestCase: health/check:001 accepts a namespaced id

##### Priority
- P1

##### Preconditions
- Synthetic service is available.

##### Steps

###### Step 1
- **Action**: Send a synthetic request.
- **Expected**: A synthetic response is returned.
`;
  const testcases = parseTestcaseDocument(content, 'synthetic.md', {
    capability: 'demo/health',
    module: { id: 'demo', name: 'Demo service' },
  });
  assert.equal(testcases[0].id, 'health/check:001');
});
