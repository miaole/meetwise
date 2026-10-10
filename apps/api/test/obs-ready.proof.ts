/**
 * 审计 #92「readiness 深化刀」API 侧 prove（隔离库 · 零外呼 · est live=0）。
 * 经 scripts/run-e2e-isolated.mjs obs-ready:prove:raw（预迁移目标，obs-ready 在 migrate 名单）。
 *
 * 覆盖面（REQUEST §prove api 部分）：
 *  P0. 预迁移目标自证：账本 max(version COLLATE "C") === 目录 latestMigrationVersion()
 *      （runner 同源版本口径；0143/0152 双数字前缀在完整词干比较下序确定）。
 *  P1. 一致 → /readyz/api 200 + schema.migration=ok（+ config.envSchema=ok，#91 位不回退）。
 *  P2. 注入假账本版本（ledger 领先目录）→ 503 degraded + schema.migration=mismatch + error 仍缺。
 *  P3. 删除真 max 行（ledger 落后目录）→ 503 mismatch；还原 → 200（探针每拍现算、自愈语义）。
 *  P4. mismatch 期间 /livez 恒 200（liveness 纪律不被 DB 位拖死）；旧 /health 别名同面。
 *  P5. db_unreachable：SELECT 1 失败 → 503 + schema.migration=unknown（读不到≠已证一致），
 *      且探针查询短路（≤2 有界）。
 *  P6. 迁移目录不可达（MIGRATIONS_DIR 指向不存在路径）→ fail-closed mismatch。
 */
import { randomUUID } from 'node:crypto';
import { assertIsolatedTestTarget, createPool, latestMigrationVersion } from '@meetwise/db';
import type { DbPool } from '@meetwise/db';

let pass = 0;
let fail = 0;
const A = (name: string, cond: boolean) => { pass++; if (!cond) { fail++; console.log(`FAIL  ${name}`); } else console.log(`PASS  ${name}`); };

const admin: DbPool = createPool();
await assertIsolatedTestTarget(admin);
console.log('ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified');

const authSecret = `obs-ready-proof-${randomUUID()}`;
const savedEnv = new Map(['AUTH_SECRET', 'MEETWISE_PUBLIC_PREVIEW', 'OCR_ENABLED', 'NODE_ENV', 'WEB_ORIGIN', 'MIGRATIONS_DIR'].map((k) => [k, process.env[k]]));
Object.assign(process.env, {
  AUTH_SECRET: authSecret,
  MEETWISE_PUBLIC_PREVIEW: '0',
  OCR_ENABLED: '0',
  NODE_ENV: 'test',
  WEB_ORIGIN: 'https://web.example.test',
});
delete process.env.MIGRATIONS_DIR;

try {
  const { createApp } = await import('../src/main.ts');
  const { HealthService } = await import('../src/modules/health/health.service.ts');
  const { DbService } = await import('../src/platform/db.service.ts');
  const app = await createApp();
  const service = app.get(HealthService);
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const get = async (path: string) => {
    const res = await fetch(base + path);
    return { status: res.status, body: await res.json().catch(() => ({})) as any };
  };

  // P0. 版本源口径自证（账本 vs 目录，同一字节序 max）。本文件在 apps/api/test/ → 三级上溯到仓库根。
  const ledgerMax = (await admin.query<{ v: string | null }>('SELECT max(version COLLATE "C") AS v FROM schema_migrations')).rows[0]?.v ?? null;
  const dirMax = latestMigrationVersion(new URL('../../../packages/db/migrations', import.meta.url).pathname);
  A('P0 预迁移目标：账本 max(version COLLATE "C") === 目录 max（runner 同源口径）',
    ledgerMax !== null && dirMax !== undefined && ledgerMax === dirMax);

  // P1. 一致 → 200。
  const ready1 = await get('/readyz/api');
  A('P1 一致时 /readyz/api → 200 ok + schema.migration=ok + config.envSchema=ok',
    ready1.status === 200 && ready1.body.status === 'ok' && ready1.body.schema?.migration === 'ok' && ready1.body.config?.envSchema === 'ok');

  // P2. 注入假版本（ledger 领先目录）→ 503 + 原因位 mismatch。
  await admin.query("INSERT INTO schema_migrations(version, checksum) VALUES ('9999_zz_obs_ready_injected', 'obs-ready-fake')");
  const ready2 = await get('/readyz/api');
  A('P2a 账本混入假版本 → 503 degraded',
    ready2.status === 503 && ready2.body.status === 'degraded');
  A('P2b 降级体携带原因位 schema.migration=mismatch（无 error 明细，validate 降级体契约保持）',
    ready2.body.schema?.migration === 'mismatch' && ready2.body.config?.envSchema === 'ok' && ready2.body.error === undefined);
  A('P2c 服务层同判 apiReady()=migration_mismatch', await service.apiReady() === 'migration_mismatch');

  // P4. mismatch 期间 liveness 纪律 + 旧别名同面。
  const live2 = await get('/livez');
  A('P4a 迁移漂移不误杀 /livez（恒 200 存活语义）', live2.status === 200 && live2.body.status === 'ok');
  const alias2 = await get('/health');
  A('P4b 旧 /health 别名同面 503 + mismatch 位', alias2.status === 503 && alias2.body.schema?.migration === 'mismatch');

  // P3a. 还原假版本 → 探针每拍现算 → 200（自愈语义，不缓存）。
  await admin.query("DELETE FROM schema_migrations WHERE version = '9999_zz_obs_ready_injected'");
  const ready3 = await get('/readyz/api');
  A('P3a 移除假版本后 /readyz/api 恢复 200（每拍现算不缓存）', ready3.status === 200 && ready3.body.schema?.migration === 'ok');

  // P3b. 反向漂移：删除真 max 行（ledger 落后目录）→ 503；还原 → 200。
  const top = (await admin.query<{ version: string; checksum: string }>('SELECT version, checksum FROM schema_migrations ORDER BY version COLLATE "C" DESC LIMIT 1')).rows[0];
  if (!top) throw new Error('obs_ready_empty_ledger_unexpected');
  await admin.query('DELETE FROM schema_migrations WHERE version = $1', [top.version]);
  const ready4 = await get('/readyz/api');
  A('P3b 账本落后目录（缺真 max 行）→ 503 mismatch', ready4.status === 503 && ready4.body.schema?.migration === 'mismatch');
  await admin.query('INSERT INTO schema_migrations(version, checksum) VALUES ($1, $2)', [top.version, top.checksum]);
  const ready5 = await get('/readyz/api');
  A('P3c 还原后恢复 200', ready5.status === 200 && ready5.body.schema?.migration === 'ok');

  // P5. db_unreachable：SELECT 1 失败 → unknown 位 + 查询短路（≤2 有界）。
  const pool = app.get(DbService).pool;
  const originalQuery = pool.query.bind(pool);
  let probeQueries = 0;
  pool.query = () => { probeQueries++; return Promise.reject(new Error('obs_ready_injected_db_down')); };
  const ready6 = await get('/readyz/api');
  A('P5a DB 不可达 → 503 degraded + schema.migration=unknown（读不到≠已证一致）',
    ready6.status === 503 && ready6.body.schema?.migration === 'unknown' && ready6.body.status === 'degraded');
  A('P5b 探针在 SELECT 1 短路（本拍恰 1 条查询，≤2 有界）', probeQueries === 1);
  pool.query = originalQuery;
  const ready7 = await get('/readyz/api');
  A('P5c 恢复后 /readyz/api 回 200', ready7.status === 200 && ready7.body.schema?.migration === 'ok');

  // P6. 迁移目录不可达 → fail-closed（不 fail-open）。
  process.env.MIGRATIONS_DIR = '/nonexistent/obs-ready-migrations';
  const ready8 = await get('/readyz/api');
  A('P6 MIGRATIONS_DIR 不可读 → 503 mismatch（目录侧无法证明一致即降级）',
    ready8.status === 503 && ready8.body.schema?.migration === 'mismatch');
  delete process.env.MIGRATIONS_DIR;
  const ready9 = await get('/readyz/api');
  A('P6b 恢复目录后回 200', ready9.status === 200 && ready9.body.schema?.migration === 'ok');

  await app.close();
} finally {
  for (const [key, value] of savedEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  await admin.end().catch(() => {});
}

console.log(fail === 0
  ? `\n✓ obs-ready api prove: ${pass} assertions 全绿 · est live=0 · releaseEvidence=false`
  : `\n✗ obs-ready api prove: ${fail}/${pass} 失败`);
process.exit(fail === 0 ? 0 : 1);
