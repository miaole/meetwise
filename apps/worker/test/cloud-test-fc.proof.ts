import assert from 'node:assert/strict';
import { createCloudTestFcHandler, parseCloudTestSerialSecret } from '../src/cloud-test-fc.ts';
import { loadCloudTestConfigFromEnvironment } from '../fc/cloud-test-handler.ts';

const secret = JSON.stringify({
  schemaVersion: 1,
  tlsMode: 'system-root',
  controlDatabaseUrl: 'postgresql://mw_e2e_admin:test-only-password@rds.internal:5432/postgres',
  receiptHmacKey: 'test-only-hmac-key-that-is-at-least-32-bytes',
  privateCidrs: '10.0.0.0/8',
  targetCertificateSha256: 'a'.repeat(64),
  targetInstanceId: 'pg-test-instance-01',
  targetVpcId: 'vpc-test-01',
  allowedCaseId: 'TC-CLOUD-TEST-001-main',
  suiteArtifactSha256: 'b'.repeat(64),
});
assert.equal(parseCloudTestSerialSecret(secret).schemaVersion, 1);
assert.throws(() => parseCloudTestSerialSecret('{"schemaVersion":1}'), /secret_schema_invalid/);
assert.equal(await loadCloudTestConfigFromEnvironment({ MEETWISE_CLOUD_TEST_EXECUTOR_CONFIG_B64: Buffer.from(secret).toString('base64') }), secret);

let captured: NodeJS.ProcessEnv | undefined;
const handler = createCloudTestFcHandler({
  loadSecret: async () => secret,
  runSerial: async (argv, env) => {
    captured = env;
    return { kind: 'cloud_test_serial_receipt', runId: argv.runId!, caseId: argv.caseId!, status: 'passed', testOnly: true, releaseEvidence: false, tlsVerification: 'system-root', targetFingerprint: 'a'.repeat(20), cleanup: { databaseAbsent: true, roleAbsent: true } };
  },
});
const result = JSON.parse(await handler(Buffer.from('{"runId":"cloudtest-20260811-a","caseId":"TC-CLOUD-TEST-001-main"}')));
assert.equal(result.status, 'passed');
assert.equal(captured?.CLOUD_TEST_MODE, 'serial-test-only');
assert.equal(captured?.DATABASE_URL, undefined);
assert.equal(captured?.PGHOST, undefined);
assert.equal(captured?.CLOUD_TEST_SERIAL_DATABASE_URL?.includes('rds.internal'), true);
assert.equal(captured?.CLOUD_TEST_TARGET_INSTANCE_ID, 'pg-test-instance-01');
assert.equal(captured?.CLOUD_TEST_ALLOWED_CASE_ID, 'TC-CLOUD-TEST-001-main');
const fullMigration = JSON.parse(await handler(Buffer.from('"not json"')));
assert.equal(fullMigration.code, 'cloud_test_fc_event_invalid');
const fullCase = JSON.parse(await handler(Buffer.from('{"runId":"cloudtest-20260811-b","caseId":"TC-CLOUD-TEST-002-main"}')));
assert.equal(fullCase.code, 'cloud_test_fc_case_requires_resettable_cluster');
const vectorstoreCase = JSON.parse(await handler(Buffer.from('{"runId":"cloudtest-20260811-v","caseId":"TC-CLOUD-TEST-003-main"}')));
assert.equal(vectorstoreCase.code, 'cloud_test_fc_case_requires_resettable_cluster');
let strictCaptured: NodeJS.ProcessEnv | undefined;
const strictHandler = createCloudTestFcHandler({
  loadSecret: async () => secret,
  tlsModeOverride: 'system-root',
  runSerial: async (_argv, env) => {
    strictCaptured = env;
    return { kind: 'cloud_test_serial_receipt', runId: env.CLOUD_TEST_RUN_ID!, caseId: env.CLOUD_TEST_CASE_ID as 'TC-CLOUD-TEST-001-main', status: 'passed', testOnly: true, releaseEvidence: false, tlsVerification: 'system-root', targetFingerprint: 'redacted', cleanup: { databaseAbsent: true, roleAbsent: true } };
  },
});
assert.equal(JSON.parse(await strictHandler('{"runId":"cloudtest-20260811-c","caseId":"TC-CLOUD-TEST-001-main"}')).status, 'passed');
assert.equal(strictCaptured?.CLOUD_TEST_TLS_MODE, 'system-root');
const invalidTlsOverride = createCloudTestFcHandler({ loadSecret: async () => secret, tlsModeOverride: 'vpc-test-only-no-verify' });
assert.equal(JSON.parse(await invalidTlsOverride('{"runId":"cloudtest-20260811-c","caseId":"TC-CLOUD-TEST-001-main"}')).code, 'cloud_test_fc_tls_mode_override_invalid');
assert.deepEqual(JSON.parse(await handler('{"runId":"cloudtest-20260811-a","caseId":"TC-CLOUD-01-main"}')), {
  kind: 'cloud_test_serial_receipt', status: 'failed', testOnly: true, releaseEvidence: false, code: 'cloud_test_fc_event_invalid',
});
console.log('✓ FC serial cloud test handler accepts only an opaque registered case and private configuration');
