import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildEnvironmentConfig,
  environmentList,
  resolveServer,
  selectEnvironment,
} from '../environment-config.mjs';

test('supports arbitrary named servers and secret references without exposing values', () => {
  const config = buildEnvironmentConfig({
    default: 'ci',
    environments: {
      base: { servers: { api: 'https://api.example.test/' } },
      ci: {
        extends: 'base',
        servers: { web: 'https://web.example.test' },
        variables: { accessToken: { fromEnv: 'QA_DEMO_TOKEN' } },
      },
    },
  });
  assert.deepEqual(config.environments.ci.servers, {
    api: 'https://api.example.test',
    web: 'https://web.example.test',
  });
  assert.equal(resolveServer(config.environments.ci, 'web'), 'https://web.example.test');
  assert.deepEqual(environmentList(config, { QA_DEMO_TOKEN: 'secret' })[1].variables, [{
    name: 'accessToken',
    fromEnv: 'QA_DEMO_TOKEN',
    configured: true,
  }]);
  assert.equal(selectEnvironment(config, '', { QA_DEMO_TOKEN: 'secret' }).environment.variables.accessToken, 'secret');
});

test('rejects non-http server URLs', () => {
  assert.throws(() => buildEnvironmentConfig({
    environments: { invalid: { servers: { api: 'file:///tmp/demo' } } },
  }), /must use http or https/);
});

test('rejects credentials and query parameters embedded in server URLs', () => {
  assert.throws(() => buildEnvironmentConfig({
    environments: { invalid: { servers: { api: 'https://user@api.example.test' } } },
  }), /cannot contain userinfo/);
  assert.throws(() => buildEnvironmentConfig({
    environments: { invalid: { servers: { api: 'https://api.example.test?token=value' } } },
  }), /cannot contain userinfo/);
});
