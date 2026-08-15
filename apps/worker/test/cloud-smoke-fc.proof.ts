import assert from 'node:assert/strict';
import { createCloudSmokeFcHandler, parseFixedReadonlySmokeSecret } from '../src/cloud-smoke-fc.ts';
import { loadCloudSmokeConfigFromEnvironment } from '../fc/cloud-smoke-handler.ts';

const secret = JSON.stringify({
  schemaVersion: 1,
  tlsMode: 'system-root',
  databaseUrl: 'postgresql://meetwise_cloud_smoke_reader:secret@rds.internal:5432/meetwise_cloud_test',
  redisUrl: 'rediss://mw_cloud_smoke:secret@tair.internal:6380/0',
  databaseCa: '-----BEGIN CERTIFICATE-----\nRDS\n-----END CERTIFICATE-----\n',
  redisCa: '-----BEGIN CERTIFICATE-----\nTAIR\n-----END CERTIFICATE-----\n',
  receiptHmacKey: 'a-32-byte-minimum-test-only-hmac-key',
  privateCidrs: '10.0.0.0/8,192.168.0.0/16',
});

assert.equal(parseFixedReadonlySmokeSecret(secret).schemaVersion, 1);
assert.throws(() => parseFixedReadonlySmokeSecret(JSON.stringify({ schemaVersion: 1 })), /secret_schema_invalid/);
assert.throws(() => parseFixedReadonlySmokeSecret(JSON.stringify({ ...JSON.parse(secret), target: 'attacker' })), /secret_schema_invalid/);
assert.equal(await loadCloudSmokeConfigFromEnvironment({ MEETWISE_CLOUD_SMOKE_CONFIG_B64: Buffer.from(secret).toString('base64') }), secret);
await assert.rejects(() => loadCloudSmokeConfigFromEnvironment({ MEETWISE_CLOUD_SMOKE_CONFIG_B64: 'not a valid envelope' }), /cloud_smoke_fc_secret_unavailable/);

let captured: NodeJS.ProcessEnv = {};
const handler = createCloudSmokeFcHandler({
  loadSecret: async () => secret,
  runSmoke: async (runId, env) => {
    captured = env;
    return {
      kind: 'cloud_connectivity_receipt', runId, targetKind: 'fixed-readonly', status: 'passed',
      databaseFingerprint: 'db-fingerprint', redisFingerprint: 'redis-fingerprint', databaseTls: true, redisTls: true, tlsVerification: 'system-root',
      writes: { database: 0, redis: 0, oss: 0 },
    };
  },
});

const result = JSON.parse(await handler(Buffer.from('{"runId":"cloud-20260811-a"}')));
assert.equal(result.status, 'passed');
assert.equal(captured.CLOUD_TEST_TARGET_KIND, 'fixed-readonly');
assert.equal(captured.CLOUD_TEST_TLS_MODE, 'system-root');
assert.equal(captured.CLOUD_TEST_FIXED_READONLY_ACK, 'I_UNDERSTAND_FIXED_TARGET_IS_READ_ONLY');
assert.equal(captured.DATABASE_URL, undefined);
assert.equal(captured.PGHOST, undefined);
assert.match(captured.CLOUD_TEST_DATABASE_SSL_CA_PATH ?? '', /meetwise-cloud-smoke-/);
assert.match(captured.CLOUD_TEST_REDIS_TLS_CA_PATH ?? '', /meetwise-cloud-smoke-/);

captured = {};
const trustedRootsOnly = JSON.stringify({ ...JSON.parse(secret), databaseCa: '', redisCa: '' });
const trustedRootsHandler = createCloudSmokeFcHandler({
  loadSecret: async () => trustedRootsOnly,
  runSmoke: async (runId, env) => {
    captured = env;
    return {
      kind: 'cloud_connectivity_receipt', runId, targetKind: 'fixed-readonly', status: 'passed',
      databaseFingerprint: 'db-fingerprint', redisFingerprint: 'redis-fingerprint', databaseTls: true, redisTls: true, tlsVerification: 'system-root',
      writes: { database: 0, redis: 0, oss: 0 },
    };
  },
});
await trustedRootsHandler('{"runId":"cloud-20260811-a"}');
assert.equal(captured.CLOUD_TEST_DATABASE_SSL_CA_PATH, undefined);
assert.equal(captured.CLOUD_TEST_REDIS_TLS_CA_PATH, undefined);

const invalidEvent = JSON.parse(await handler('{"runId":"cloud-20260811-a","databaseUrl":"postgresql://attacker"}'));
assert.deepEqual(invalidEvent, { kind: 'cloud_connectivity_receipt', status: 'failed', code: 'cloud_smoke_fc_event_invalid' });

const missingSecret = createCloudSmokeFcHandler({ loadSecret: async () => { throw new Error('kms timeout'); } });
assert.deepEqual(JSON.parse(await missingSecret('{"runId":"cloud-20260811-a"}')), {
  kind: 'cloud_connectivity_receipt', status: 'failed', code: 'cloud_smoke_fc_secret_unavailable',
});

console.log('✓ FC only accepts a run ID, isolates function configuration, and emits redacted receipts');
