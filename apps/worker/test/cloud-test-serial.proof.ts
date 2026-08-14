import assert from 'node:assert/strict';
import {
  cloudTestSerialFailure,
  resolveCloudTestSerialConfig,
} from '../src/cloud-test-serial.ts';

const runId = 'cloudtest-20260811-a';
const caseId = 'TC-CLOUD-TEST-001-main';

function env(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    CLOUD_TEST_MODE: 'serial-test-only',
    CLOUD_TEST_RUN_ID: runId,
    CLOUD_TEST_CASE_ID: caseId,
    CLOUD_TEST_TLS_MODE: 'system-root',
    CLOUD_TEST_SERIAL_DATABASE_URL: 'postgresql://mw_e2e_admin:test-only-password@rds.internal:5432/postgres',
    CLOUD_TEST_RECEIPT_HMAC_KEY: 'test-only-hmac-key-that-is-at-least-32-bytes',
    CLOUD_TEST_PRIVATE_CIDRS: '10.0.0.0/8,192.168.0.0/16',
    CLOUD_TEST_TARGET_CERTIFICATE_SHA256: 'a'.repeat(64),
    CLOUD_TEST_TARGET_INSTANCE_ID: 'pg-test-instance-01',
    CLOUD_TEST_TARGET_VPC_ID: 'vpc-test-01',
    CLOUD_TEST_ALLOWED_CASE_ID: 'TC-CLOUD-TEST-001-main',
    CLOUD_TEST_SUITE_ARTIFACT_SHA256: 'b'.repeat(64),
    ...overrides,
  };
}

const resolved = resolveCloudTestSerialConfig({ runId, caseId }, env());
assert.equal(resolved.runId, runId);
assert.equal(resolved.caseId, caseId);
assert.equal(new URL(resolved.controlDatabaseUrl).pathname, '/postgres');
assert.deepEqual(resolved.privateCidrs, ['10.0.0.0/8', '192.168.0.0/16']);
assert.equal(
  resolveCloudTestSerialConfig({ runId, caseId: 'TC-CLOUD-TEST-002-main' }, env({ CLOUD_TEST_CASE_ID: 'TC-CLOUD-TEST-002-main' })).caseId,
  'TC-CLOUD-TEST-002-main',
);
assert.equal(
  resolveCloudTestSerialConfig({ runId, caseId: 'TC-CLOUD-TEST-003-main' }, env({ CLOUD_TEST_CASE_ID: 'TC-CLOUD-TEST-003-main' })).caseId,
  'TC-CLOUD-TEST-003-main',
);

for (const [name, overrides, message] of [
  ['wrong mode', { CLOUD_TEST_MODE: 'fixed-readonly' }, 'mode_invalid'],
  ['fixed smoke URL', { CLOUD_TEST_SERIAL_DATABASE_URL: 'postgresql://meetwise_cloud_smoke_reader:x@rds.internal:5432/meetwise_cloud_test' }, 'credential_invalid'],
  ['non-control database', { CLOUD_TEST_SERIAL_DATABASE_URL: 'postgresql://mw_e2e_admin:x@rds.internal:5432/meetwise_cloud_test' }, 'not_postgres'],
  ['URL query override', { CLOUD_TEST_SERIAL_DATABASE_URL: 'postgresql://mw_e2e_admin:x@rds.internal:5432/postgres?host=attacker' }, 'url_invalid'],
  ['runtime variable', { DATABASE_URL: 'postgresql://runtime:secret@rds.internal/runtime' }, 'variable_forbidden'],
  ['ambient pg variable', { PGUSER: 'ambient' }, 'variable_forbidden'],
  ['wrong case', { CLOUD_TEST_CASE_ID: 'TC-CLOUD-01-main' }, 'case_id_invalid_or_mismatch'],
  ['outside private CIDR', { CLOUD_TEST_PRIVATE_CIDRS: '0.0.0.0/0' }, 'private_cidrs_not_rfc1918'],
  ['no-verify transport', { CLOUD_TEST_TLS_MODE: 'vpc-test-only-no-verify' }, 'tls_mode_invalid'],
  ['missing target certificate', { CLOUD_TEST_TARGET_CERTIFICATE_SHA256: '' }, 'target_certificate_sha256_missing'],
  ['invalid target certificate', { CLOUD_TEST_TARGET_CERTIFICATE_SHA256: 'not-a-fingerprint' }, 'target_certificate_sha256_invalid'],
  ['wrong profile case', { CLOUD_TEST_ALLOWED_CASE_ID: 'TC-CLOUD-TEST-002-main' }, 'target_profile_case_invalid'],
  ['invalid profile artifact', { CLOUD_TEST_SUITE_ARTIFACT_SHA256: 'not-a-digest' }, 'target_profile_artifact_invalid'],
] as const) {
  assert.throws(
    () => resolveCloudTestSerialConfig({ runId, caseId }, env(overrides)),
    new RegExp(message),
    name,
  );
}

assert.equal(resolved.tlsMode, 'system-root');

assert.throws(
  () => resolveCloudTestSerialConfig({ runId: 'cloudtest-20260811-b', caseId }, env()),
  /run_id_invalid_or_mismatch/,
);
assert.equal(cloudTestSerialFailure(new Error('cloud_test_serial_lock_unavailable')), 'cloud_test_serial_lock_unavailable');
assert.equal(cloudTestSerialFailure(new Error('connection reset')), 'cloud_test_serial_dependency_unreachable');
assert.equal(cloudTestSerialFailure(new Error('cloud_smoke_dns_target_not_private')), 'cloud_test_serial_dns_target_not_private');
assert.equal(cloudTestSerialFailure(new Error('cloud_test_serial_case_requires_resettable_cluster')), 'cloud_test_serial_case_requires_resettable_cluster');

console.log('✓ cloud serial test target accepts only the project test admin, exact run/case names, and private clean configuration');
