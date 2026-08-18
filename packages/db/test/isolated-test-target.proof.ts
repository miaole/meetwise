import assert from 'node:assert/strict';
import { assertIsolatedTestEnvironment, assertIsolatedTestTarget } from '../src/isolated-test-target.ts';

const runId = 'cloudtest-20260811-profile';
const database = 'meetwise_e2e_cloudtest_20260811_profile';
const token = 'cloud-test-token-1234567890';
const artifact = 'a'.repeat(64);

function cloudEnv(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    E2E_CLOUD_ISOLATED: '1',
    E2E_CLOUD_TEST_RUN_ID: runId,
    E2E_CLOUD_TEST_DATABASE: database,
    E2E_CLOUD_TEST_TARGET_TOKEN: token,
    E2E_CLOUD_TEST_ARTIFACT_DIGEST: artifact,
    PGHOST: '172.31.224.8',
    PGPORT: '5432',
    PGUSER: 'mw_e2e_admin',
    PGPASSWORD: 'test-only',
    PGDATABASE: database,
    DATABASE_SSL_MODE: 'verify-full',
    DATABASE_SSL_CA_PATH: '/tmp/cloud-test-ca.pem',
    PG_TLS_SERVERNAME: 'rds.internal',
    ...overrides,
  };
}

for (const [name, overrides, code] of [
  ['rejects public host', { PGHOST: '8.8.8.8' }, 'private_ip_required'],
  ['rejects wrong database', { PGDATABASE: 'meetwise_cloud_test' }, 'database_mismatch'],
  ['rejects fixed target selection', { E2E_CLOUD_TEST_DATABASE: 'meetwise_cloud_test' }, 'database_mismatch'],
  ['rejects missing CA proof', { DATABASE_SSL_CA_PATH: '' }, 'tls_attestation_missing'],
  ['rejects control credentials in child', { CLOUD_TEST_SERIAL_DATABASE_URL: 'postgres://x' }, 'control_variable_forbidden'],
  ['rejects local and cloud profiles together', { E2E_ISOLATED: '1' }, 'isolation_profiles_conflict'],
] as const) {
  assert.throws(() => assertIsolatedTestEnvironment(cloudEnv(overrides)), new RegExp(code), name);
}

assert.doesNotThrow(() => assertIsolatedTestEnvironment(cloudEnv()));
await assertIsolatedTestTarget({
  query: async () => ({ rows: [{ token, database }] }),
} as any, cloudEnv());
await assert.rejects(
  assertIsolatedTestTarget({ query: async () => ({ rows: [{ token: 'wrong', database }] }) } as any, cloudEnv()),
  /isolated_target_attestation_mismatch/,
);

console.log('✓ cloud-private isolated test profile requires exact run DB, pinned private IP, TLS proof, and server token');
