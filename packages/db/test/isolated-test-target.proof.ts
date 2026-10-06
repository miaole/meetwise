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

// --- isolated (local container) profile: two-literal PGHOST whitelist ----------
// C-PERF-CONTAINER-REACHABILITY (Line SS): the whitelist is exactly the two closed
// literals '127.0.0.1' | 'host.docker.internal', compared strictly (no trim/lowercase/
// prefix/regex/env-switch).  Every forged variant below must still be rejected — if a
// third value, a prefix match, or a normalization is ever added, these assertions fail.
function isolatedEnv(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    E2E_ISOLATED: '1',
    E2E_TEST_CONTAINER: 'meetwise-e2e-ss-probe-00000000',
    E2E_TEST_TARGET_TOKEN: 'ss-probe-token-000000000001',
    DATABASE_SSL_MODE: 'disable',
    PGHOST: '127.0.0.1',
    PGPORT: '55432',
    PGUSER: 'meetwise',
    PGPASSWORD: 'test-only',
    PGDATABASE: 'meetwise',
    ...overrides,
  };
}

assert.doesNotThrow(() => assertIsolatedTestEnvironment(isolatedEnv()), 'isolated loopback literal stays admitted');
assert.doesNotThrow(
  () => assertIsolatedTestEnvironment(isolatedEnv({ PGHOST: 'host.docker.internal' })),
  'host-gateway literal admitted (perf dual-container path only)',
);

for (const [name, overrides] of [
  ['rejects empty PGHOST', { PGHOST: '' }],
  ['rejects IPv6 loopback', { PGHOST: '::1' }],
  ['rejects localhost name', { PGHOST: 'localhost' }],
  ['rejects arbitrary private IPv4', { PGHOST: '10.0.0.5' }],
  ['rejects public IPv4', { PGHOST: '8.8.8.8' }],
  ['rejects host-gateway suffix forgery', { PGHOST: 'host.docker.internal.evil' }],
  ['rejects host-gateway prefix forgery', { PGHOST: 'xhost.docker.internal' }],
  ['rejects host-gateway embedded forgery', { PGHOST: 'evil.host.docker.internal' }],
  ['rejects missing PGHOST', { PGHOST: undefined }],
] as const) {
  assert.throws(
    () => assertIsolatedTestEnvironment(isolatedEnv(overrides)),
    /^Error: destructive_proof_loopback_or_hostgateway_required$/,
    name,
  );
}

// The widened literal must NOT leak into the cloud profile: the cloud branch still
// requires a private IPv4 literal via its own check (no shared widened constant).
assert.throws(
  () => assertIsolatedTestEnvironment(cloudEnv({ PGHOST: 'host.docker.internal' })),
  /destructive_proof_cloud_private_ip_required/,
  'cloud branch unaffected by host-gateway admission',
);

// Nonce tripwire is untouched and remains the hard floor on the widened path.
await assertIsolatedTestTarget(
  { query: async () => ({ rows: [{ token: 'ss-probe-token-000000000001' }] }) } as any,
  isolatedEnv({ PGHOST: 'host.docker.internal' }),
);
await assert.rejects(
  assertIsolatedTestTarget({ query: async () => ({ rows: [{ token: 'wrong-token' }] }) } as any, isolatedEnv({ PGHOST: 'host.docker.internal' })),
  /destructive_proof_isolated_target_attestation_mismatch/,
  'server nonce mismatch still throws with host-gateway literal',
);

console.log('✓ isolated profile admits exactly 127.0.0.1 | host.docker.internal, rejects every other target, and keeps the server nonce tripwire');

