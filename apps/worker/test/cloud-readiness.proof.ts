import assert from 'node:assert/strict';
import { assertCloudSmokeHostsPrivate, assertCloudSmokePeer, cloudSmokeFailure, cloudSmokePinnedUrl, cloudSmokeTarget, resolveCloudSmokeConfig } from '../src/cloud-readiness.ts';

const base = {
  CLOUD_TEST_RUN_ID: 'cloud-20260809-a',
  CLOUD_TEST_DATABASE_URL: 'postgresql://meetwise_cloud_smoke_reader:secret@rds.internal:5432/meetwise_e2e_cloud_20260809_a',
  CLOUD_TEST_REDIS_URL: 'rediss://mw_cloud_smoke:secret@tair.internal:6380/0',
  CLOUD_TEST_DATABASE_SSL_CA_PATH: import.meta.filename,
  CLOUD_TEST_REDIS_TLS_CA_PATH: import.meta.filename,
  CLOUD_TEST_RECEIPT_HMAC_KEY: 'a-32-byte-minimum-test-only-hmac-key',
  CLOUD_TEST_PRIVATE_CIDRS: '10.0.0.0/8,192.168.0.0/16',
} as NodeJS.ProcessEnv;

function rejects(name: string, mutate: (env: NodeJS.ProcessEnv) => void, expected: string): void {
  const env = { ...base };
  mutate(env);
  assert.throws(() => resolveCloudSmokeConfig(base.CLOUD_TEST_RUN_ID, env), new RegExp(expected));
  console.log(`✓ ${name}`);
}

const config = resolveCloudSmokeConfig(base.CLOUD_TEST_RUN_ID, base);
const first = cloudSmokeTarget(config);
const second = cloudSmokeTarget(config);
assert.equal(first.databaseName, 'meetwise_e2e_cloud_20260809_a');
assert.equal(first.targetKind, 'run-scoped');
assert.equal(first.databaseFingerprint, second.databaseFingerprint);
assert.match(first.databaseFingerprint, /^[a-f0-9]{20}$/);
assert.equal(cloudSmokeFailure(new Error('postgres://secret@internal')), 'cloud_smoke_dependency_unreachable');
assert.equal(cloudSmokeFailure(Object.assign(new Error('certificate verify failed'), { code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' })), 'cloud_smoke_tls_validation_failed');
assert.equal(cloudSmokeFailure(Object.assign(new Error('password authentication failed'), { code: '28P01' })), 'cloud_smoke_dependency_auth_failed');
console.log('✓ 独立 CLOUD_TEST 目标、HMAC 回执和依赖错误脱敏');

rejects('拒绝未绑定 run 的数据库名', (env) => { env.CLOUD_TEST_DATABASE_URL = 'postgresql://meetwise_cloud_smoke_reader:secret@rds.internal:5432/meetwise'; }, 'database_name_not_bound_to_run');
rejects('拒绝运行时数据库变量', (env) => { env.DATABASE_URL = 'postgresql://runtime:secret@prod.internal:5432/meetwise'; }, 'runtime_variable_forbidden');
rejects('拒绝回环数据库目标', (env) => { env.CLOUD_TEST_DATABASE_URL = 'postgresql://meetwise_cloud_smoke_reader:secret@127.0.0.1:5432/meetwise_e2e_cloud_20260809_a'; }, 'database_url_invalid');
rejects('拒绝明文 Redis', (env) => { env.CLOUD_TEST_REDIS_URL = 'redis://:secret@tair.internal:6379/0'; }, 'redis_url_invalid');
for (const query of ['host=outside.internal', 'port=5432', 'user=other', 'password=other', 'ssl=0', 'options=-c%20role%3Dother']) {
  rejects(`拒绝数据库 URL 覆盖参数 ${query}`, (env) => {
    env.CLOUD_TEST_DATABASE_URL = `postgresql://meetwise_cloud_smoke_reader:secret@rds.internal:5432/meetwise_e2e_cloud_20260809_a?${query}`;
  }, 'database_url_query_or_fragment_forbidden');
}
rejects('拒绝数据库 URL 片段', (env) => {
  env.CLOUD_TEST_DATABASE_URL = 'postgresql://meetwise_cloud_smoke_reader:secret@rds.internal:5432/meetwise_e2e_cloud_20260809_a#override';
}, 'database_url_query_or_fragment_forbidden');
rejects('拒绝 Redis URL 覆盖参数', (env) => {
  env.CLOUD_TEST_REDIS_URL = 'rediss://mw_cloud_smoke:secret@tair.internal:6380/0?database=3';
}, 'redis_url_query_or_fragment_forbidden');
rejects('Redis 只能使用 DB 0', (env) => {
  env.CLOUD_TEST_REDIS_URL = 'rediss://mw_cloud_smoke:secret@tair.internal:6380/3';
}, 'redis_url_database_invalid');
rejects('拒绝 libpq 环境凭据继承', (env) => { env.PGUSER = 'ambient_user'; }, 'ambient_variable_forbidden:pguser');
rejects('拒绝非专用数据库账号', (env) => { env.CLOUD_TEST_DATABASE_URL = 'postgresql://migration:secret@rds.internal:5432/meetwise_e2e_cloud_20260809_a'; }, 'database_url_credential_invalid');
rejects('拒绝非专用 Redis ACL 用户', (env) => { env.CLOUD_TEST_REDIS_URL = 'rediss://default:secret@tair.internal:6380/0'; }, 'redis_url_credential_invalid');
rejects('拒绝包含公网的伪私网 CIDR', (env) => { env.CLOUD_TEST_PRIVATE_CIDRS = '0.0.0.0/0'; }, 'private_cidrs_not_rfc1918');
assert.throws(() => resolveCloudSmokeConfig('other-run', base), /run_id_mismatch/);
console.log('✓ 拒绝命令行 run 不匹配');

const fixedReadonly = resolveCloudSmokeConfig('cloud-20260809-a', {
  ...base,
  CLOUD_TEST_TARGET_KIND: 'fixed-readonly',
  CLOUD_TEST_FIXED_READONLY_ACK: 'I_UNDERSTAND_FIXED_TARGET_IS_READ_ONLY',
  CLOUD_TEST_DATABASE_URL: 'postgresql://meetwise_cloud_smoke_reader:secret@rds.internal:5432/meetwise_cloud_test',
});
assert.equal(fixedReadonly.targetKind, 'fixed-readonly');
assert.equal(cloudSmokeTarget(fixedReadonly).databaseName, 'meetwise_cloud_test');
console.log('✓ 固定只读测试库只能在显式确认后作为零写入 smoke 目标');
assert.equal(resolveCloudSmokeConfig('cloud-20260809-a', {
  ...base,
  CLOUD_TEST_TARGET_KIND: 'fixed-readonly',
  CLOUD_TEST_FIXED_READONLY_ACK: 'I_UNDERSTAND_FIXED_TARGET_IS_READ_ONLY',
  CLOUD_TEST_DATABASE_URL: 'postgresql://meetwise_cloud_smoke_reader:secret@rds.internal:5432/meetwise_cloud_test',
  CLOUD_TEST_TLS_MODE: 'vpc-test-only-no-verify',
}).tlsMode, 'vpc-test-only-no-verify');
rejects('仅固定只读测试目标可使用不验证证书链模式', (env) => {
  env.CLOUD_TEST_TLS_MODE = 'vpc-test-only-no-verify';
}, 'tls_mode_not_allowed_for_run_scoped');
rejects('固定只读库必须显式确认', (env) => {
  env.CLOUD_TEST_TARGET_KIND = 'fixed-readonly';
  env.CLOUD_TEST_DATABASE_URL = 'postgresql://meetwise_cloud_smoke_reader:secret@rds.internal:5432/meetwise_cloud_test';
}, 'fixed_readonly_ack_missing');
rejects('固定只读库拒绝其他数据库名', (env) => {
  env.CLOUD_TEST_TARGET_KIND = 'fixed-readonly';
  env.CLOUD_TEST_FIXED_READONLY_ACK = 'I_UNDERSTAND_FIXED_TARGET_IS_READ_ONLY';
}, 'fixed_readonly_database_mismatch');
const resolved = await assertCloudSmokeHostsPrivate(config, async (host) => [{ address: host === 'rds.internal' ? '10.9.0.8' : '192.168.2.7', family: 4 }]);
assert.equal(resolved.databaseAddress, '10.9.0.8');
assert.equal(new URL(cloudSmokePinnedUrl(config.redisUrl, resolved.redisAddress)).hostname, '192.168.2.7');
assert.throws(() => assertCloudSmokePeer('8.8.8.8', config), /peer_not_private/);
assert.throws(() => assertCloudSmokePeer('10.9.0.9', config, resolved.databaseAddress), /peer_not_private/);
await assert.rejects(() => assertCloudSmokeHostsPrivate(config, async () => [{ address: '8.8.8.8', family: 4 }]), /dns_target_not_private/);
console.log('✓ DNS 与连接 peer 必须位于显式 VPC CIDR，公网重绑定在首个 SQL 前拒绝');
console.log('✓ cloud readiness 只读门禁 proof 全部通过');
