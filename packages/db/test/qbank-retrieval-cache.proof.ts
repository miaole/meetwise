/**
 * qbank 检索结果缓存证明（真 PostgreSQL）：跨实例可复用、键严格含 principal/模型/查询/k、
 * 缓存不落原始查询、治理/向量变更以 corpus epoch 失效、RLS 不串主体、并发 miss 只做一次 embedding。
 *
 * pnpm -C packages/db prove:qbank-cache （需 pnpm db:up）
 */
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, createPool, asPrincipal, runMigrations, loadMigrations,
  upsertVectorChunk, cachedQbankSearch, qbankRetrievalCacheKey,
  type QbankRetrievalCacheAddress, type QbankRetrievalCacheBackend, type QbankRetrievalCacheLock, type QbankRetrievalHit,
} from '../src/index.ts';

// 此 proof 会跑完整迁移链；使用独占临时 DB，避免其它真库 proof 的 baseline DROP/重建 app_role 破坏本用例的
// trigger/ACL，也绝不清理开发者正在使用的 meetwise 数据库。
const proofDatabase = `meetwise_qbank_cache_proof_${randomUUID().replaceAll('-', '')}`;
const adminPool = createPool({ database: 'postgres' });
const pool = createPool({ database: proofDatabase });
process.env.RAG_QBANK_CACHE_HASH_KEY = 'qbank-cache-proof-hmac-key-not-production';
let fail = 0;
const A = (name: string, condition: boolean) => { console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`); if (!condition) fail++; };
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Contract double only: production acceptance uses the separately required real Redis/Tair suite. */
class MemoryRedisCache implements QbankRetrievalCacheBackend {
  private readonly values = new Map<string, QbankRetrievalHit[]>();
  private readonly locks = new Map<string, { token: string; expiresAt: number }>();
  private key(address: QbankRetrievalCacheAddress) { return `${address.cacheKey}:${address.corpusEpoch}`; }
  async read(address: QbankRetrievalCacheAddress): Promise<QbankRetrievalHit[] | undefined> { return this.values.get(this.key(address))?.map((x) => ({ ...x })); }
  async acquire(address: QbankRetrievalCacheAddress, leaseMs: number): Promise<QbankRetrievalCacheLock | undefined> {
    const key = this.key(address); const existing = this.locks.get(key);
    if (existing && existing.expiresAt > Date.now()) return undefined;
    const token = randomUUID(); this.locks.set(key, { token, expiresAt: Date.now() + leaseMs }); return { token };
  }
  async renew(address: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock, leaseMs: number): Promise<boolean> {
    const existing = this.locks.get(this.key(address));
    if (!existing || existing.token !== lock.token || existing.expiresAt <= Date.now()) return false;
    existing.expiresAt = Date.now() + leaseMs; return true;
  }
  async publish(address: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock, hits: QbankRetrievalHit[]): Promise<boolean> {
    const key = this.key(address); const existing = this.locks.get(key);
    if (!existing || existing.token !== lock.token || existing.expiresAt <= Date.now()) return false;
    this.values.set(key, hits.map((x) => ({ ...x }))); this.locks.delete(key); return true;
  }
  async release(address: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock): Promise<void> {
    const key = this.key(address); if (this.locks.get(key)?.token === lock.token) this.locks.delete(key);
  }
  evictAll(): void { this.values.clear(); }
}

const DIM = 512;
function vector(seed: string): number[] {
  const digest = createHash('sha256').update(seed).digest();
  const out = Array.from({ length: DIM }, (_, i) => ((digest[i % digest.length]! / 255) * 2) - 1);
  const norm = Math.hypot(...out) || 1;
  return out.map((x) => x / norm);
}
const asVector = (v: number[]) => `[${v.join(',')}]`;

/** 独占 proof DB 的最小前置：只造 0022 所需的 qbank/vector 契约，不运行会重建全局 app_role 的 0001 baseline。 */
async function provisionPrerequisites(): Promise<void> {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE TABLE vector_chunk (
      id text PRIMARY KEY,
      owner_user_id text NOT NULL,
      kind text NOT NULL CHECK (kind IN ('qbank','memory')),
      ref_id text NOT NULL,
      content_hash text NOT NULL,
      embedding vector(512) NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (owner_user_id, kind, content_hash)
    );
    GRANT SELECT, INSERT, UPDATE, DELETE ON vector_chunk TO app_role;
    ALTER TABLE vector_chunk ENABLE ROW LEVEL SECURITY;
    ALTER TABLE vector_chunk FORCE ROW LEVEL SECURITY;
    CREATE POLICY p_vchunk_read ON vector_chunk FOR SELECT
      USING ((kind='qbank' AND owner_user_id='__system_qbank__')
        OR owner_user_id=current_setting('app.principal_user', true));
    CREATE POLICY p_vchunk_write ON vector_chunk FOR ALL
      USING (owner_user_id=current_setting('app.principal_user', true))
      WITH CHECK (owner_user_id=current_setting('app.principal_user', true));

    CREATE TABLE qbank_source (
      id text PRIMARY KEY, kind text NOT NULL, uri text NOT NULL, content_hash text NOT NULL,
      status text NOT NULL, added_by text NOT NULL
    );
    CREATE TABLE qbank_pool_entry (id text PRIMARY KEY);
    GRANT SELECT, INSERT, UPDATE, DELETE ON qbank_source, qbank_pool_entry TO app_role;
    ALTER TABLE qbank_source ENABLE ROW LEVEL SECURITY;
    ALTER TABLE qbank_source FORCE ROW LEVEL SECURITY;
    ALTER TABLE qbank_pool_entry ENABLE ROW LEVEL SECURITY;
    ALTER TABLE qbank_pool_entry FORCE ROW LEVEL SECURITY;
    CREATE POLICY p_qbank_source_test ON qbank_source FOR ALL TO app_role USING (true) WITH CHECK (true);
    CREATE POLICY p_qbank_pool_test ON qbank_pool_entry FOR ALL TO app_role USING (true) WITH CHECK (true);
    CREATE VIEW qbank_visible_ref WITH (security_invoker = true) AS
      SELECT ref_id FROM vector_chunk WHERE kind='qbank' AND owner_user_id='__system_qbank__';
    GRANT SELECT ON qbank_visible_ref TO app_role;
  `);
}

async function main() {
  await assertIsolatedTestTarget(adminPool);
  await adminPool.query(`CREATE DATABASE "${proofDatabase}"`);
  try {
  await provisionPrerequisites();
  const migrationsDir = fileURLToPath(new URL('../migrations', import.meta.url));
  const migrations = loadMigrations(migrationsDir).filter((m) => (m.version >= '0022_qbank_retrieval_cache' && m.version <= '0026_qbank_cache_trigger_reconcile') || m.version === '0044_qbank_redis_cache_fill_intent');
  const migrated = await runMigrations(pool, migrations);
  A('缓存历史迁移 0022–0026 与新增 0044 按序被运行器加载（已发布历史不可合并）',
    migrations.map((m) => m.version).join(',') === '0022_qbank_retrieval_cache,0023_qbank_cache_epoch_rls_reconcile,0024_qbank_cache_epoch_lock,0025_qbank_cache_delete_acl_reconcile,0026_qbank_cache_trigger_reconcile,0044_qbank_redis_cache_fill_intent'
    && migrated.applied.length === 6);
  const security = (await pool.query(
    `SELECT has_table_privilege('app_role','qbank_cache_epoch','UPDATE') AS epoch_update,
            has_function_privilege('app_role','qbank_lock_retrieval_cache_epoch()','EXECUTE') AS lock_exec,
            has_function_privilege('app_role','qbank_bump_retrieval_cache_epoch()','EXECUTE') AS bump_exec`)).rows[0];
  A('FORCE RLS 下 app_role 无 epoch UPDATE、可执行只读锁函数、不可直接执行 bump 函数', security.epoch_update === false && security.lock_exec === true && security.bump_exec === false);
  const epochThroughDefiner = await asPrincipal(pool, 'cache-proof-rls', async (c) => (await c.query('SELECT qbank_lock_retrieval_cache_epoch()::text epoch')).rows[0].epoch);
  let directEpochWriteDenied = false;
  try { await asPrincipal(pool, 'cache-proof-rls', (c) => c.query('UPDATE qbank_cache_epoch SET epoch=epoch+1 WHERE singleton')); } catch { directEpochWriteDenied = true; }
  A('SECURITY DEFINER 在 app_role/FORCE RLS 路径可取锁且直接写 epoch 被拒', typeof epochThroughDefiner === 'string' && directEpochWriteDenied);

  const unique = `${Date.now()}-${process.pid}`;
  const OWNER_A = `cache-proof-a-${unique}`;
  const OWNER_B = `cache-proof-b-${unique}`;
  const QBANK_OWNER = '__system_qbank__';
  const query = `cache proof uncommon query ${unique}`;
  const refId = `cache-proof-ref-${unique}`;
  const embedding = vector(query);
  const embedderVersion = 'cache-proof-embedder:v1:dim512';
  const k = 5;
  const cache = new MemoryRedisCache();
  const keyA = qbankRetrievalCacheKey({ owner: OWNER_A, query, k, embedderVersion });
  const keyB = qbankRetrievalCacheKey({ owner: OWNER_B, query, k, embedderVersion });
  const keyOtherModel = qbankRetrievalCacheKey({ owner: OWNER_A, query, k, embedderVersion: 'cache-proof-embedder:v2:dim512' });
  const keyOtherK = qbankRetrievalCacheKey({ owner: OWNER_A, query, k: 4, embedderVersion });
  const keyRrf = qbankRetrievalCacheKey({ owner: OWNER_A, query, k, embedderVersion, retrievalMode: 'rrf' });
  A('缓存键含 principal / embedder-version / query / k / retrieval policy', keyA !== keyB && keyA !== keyOtherModel && keyA !== keyOtherK && keyA !== keyRrf && /^[a-f0-9]{64}$/.test(keyA));

  await asPrincipal(pool, QBANK_OWNER, (c) => upsertVectorChunk(c, QBANK_OWNER, {
    id: `cache-proof-vector-${unique}`, kind: 'qbank', refId,
    contentHash: createHash('sha256').update(refId).digest('hex'), embedding,
  }));

  let embeds = 0;
  const retrieve = (owner: string) => cachedQbankSearch(pool, owner, {
    query, k, embedderVersion, ttlSeconds: 60,
    cache,
    embed: async (texts) => { embeds++; await sleep(80); return texts.map(() => embedding); },
  });

  const first = await retrieve(OWNER_A);
  const second = await retrieve(OWNER_A);
  A('首次 miss 写入，第二次跨请求命中且不再调 embedding', first.cacheStatus === 'miss' && second.cacheStatus === 'hit' && embeds === 1);
  A('缓存命中返回真实 ANN qbank 引用', first.hits.some((h) => h.refId === refId) && second.hits.some((h) => h.refId === refId));

  const legacyCacheRows = await pool.query('SELECT count(*)::int n FROM qbank_retrieval_cache');
  A('热路径不再写 PostgreSQL 历史结果缓存表', legacyCacheRows.rows[0]?.n === 0);

  const crossOwnerRows = await asPrincipal(pool, OWNER_B, (c) => c.query(
    'SELECT count(*)::int n FROM qbank_retrieval_cache WHERE owner_user_id=$1 AND cache_key=$2', [OWNER_A, keyA]));
  A('RLS: B 直接按 A 的 key 查询缓存仍为 0 行', crossOwnerRows.rows[0].n === 0);
  const b = await retrieve(OWNER_B);
  A('同 query 的 B 另建自己的缓存分区，不复用 A 行', b.cacheStatus === 'miss' && embeds === 2 && keyA !== keyB);

  // 向量变化会 bump epoch；旧行仍可留作惰性回收，但 JOIN epoch 后不可能命中。
  const epochBeforeVector = (await pool.query('SELECT epoch::text epoch FROM qbank_cache_epoch WHERE singleton')).rows[0].epoch as string;
  await asPrincipal(pool, QBANK_OWNER, (c) => c.query(
    'UPDATE vector_chunk SET embedding=$1::vector WHERE id=$2', [asVector(embedding), `cache-proof-vector-${unique}`]));
  const epochAfterVector = (await pool.query('SELECT epoch::text epoch FROM qbank_cache_epoch WHERE singleton')).rows[0].epoch as string;
  const afterVector = await retrieve(OWNER_A);
  A('qbank vector 变化 bump corpus epoch，旧结果强制 miss', BigInt(epochAfterVector) > BigInt(epochBeforeVector) && afterVector.cacheStatus === 'miss' && embeds === 3);

  // qbank_source 写入是治理面的变化，也必须让所有旧检索结果失效。
  const epochBeforeGovernance = epochAfterVector;
  await asPrincipal(pool, QBANK_OWNER, (c) => c.query(
    `INSERT INTO qbank_source(id, kind, uri, content_hash, status, added_by)
     VALUES ($1, 'manual', $2, $3, 'pending', $4)`,
    [`cache-proof-source-${unique}`, `https://cache-proof.invalid/${unique}`, createHash('sha256').update(`source-${unique}`).digest('hex'), QBANK_OWNER]));
  const epochAfterGovernance = (await pool.query('SELECT epoch::text epoch FROM qbank_cache_epoch WHERE singleton')).rows[0].epoch as string;
  const afterGovernance = await retrieve(OWNER_A);
  A('qbank 审核源变化也 bump epoch，缓存不返回旧治理视图', BigInt(epochAfterGovernance) > BigInt(epochBeforeGovernance) && afterGovernance.cacheStatus === 'miss' && embeds === 4);

  cache.evictAll();
  const callsBeforeStampede = embeds;
  const concurrent = await Promise.all(Array.from({ length: 12 }, () => retrieve(OWNER_A)));
  A(`清空热缓存后的 12 个并发 miss 只有 1 次 embedding（Redis singleflight contract；embeds=${embeds - callsBeforeStampede}，状态=${concurrent.map((r) => r.cacheStatus).join(',')}）`,
    embeds === callsBeforeStampede + 1 && concurrent.every((r) => r.hits.some((h) => h.refId === refId)));
  const staleClaims = await pool.query('SELECT count(*)::int n FROM qbank_retrieval_fill_intent');
  A('成功 fill 发布后不遗留 PostgreSQL durable fill intent', staleClaims.rows[0].n === 0);

  // 外部结果不确定时不能删除 claim 后换 token 重发；费用账本会把同一个 token 识别为同一派发意图。
  const unknownQuery = `cache-unknown-${unique}`;
  const unknownTokens: string[] = [];
  const unknownRetrieve = () => cachedQbankSearch(pool, OWNER_A, {
    query: unknownQuery, k, embedderVersion, waitMs: 100, leaseSeconds: 5,
    cache,
    embed: async (_texts, context) => {
      unknownTokens.push(context.invocationId);
      throw Object.assign(new Error('external outcome unknown'), { code: 'external_outcome_unknown' });
    },
  });
  const unknownFirst = await unknownRetrieve().then(() => false).catch((error) => (error as any)?.code === 'external_outcome_unknown');
  const firstUnknownClaim = await pool.query(
    'SELECT fill_id::text token FROM qbank_retrieval_fill_intent WHERE owner_user_id=$1 ORDER BY created_at DESC LIMIT 1', [OWNER_A]);
  const unknownSecond = await unknownRetrieve().then(() => false).catch((error) => (error as any)?.code === 'qbank_retrieval_fill_unknown');
  const secondUnknownClaim = await pool.query(
    'SELECT fill_id::text token FROM qbank_retrieval_fill_intent WHERE owner_user_id=$1 ORDER BY created_at DESC LIMIT 1', [OWNER_A]);
  A('未知外部结果保留 PostgreSQL durable fill intent，后续请求不生成第二个调用 id',
    unknownFirst && unknownSecond && unknownTokens.length === 1
    && firstUnknownClaim.rows[0]?.token === secondUnknownClaim.rows[0]?.token && firstUnknownClaim.rows[0]?.token === unknownTokens[0]);

  console.log(`\n${fail === 0 ? '✓ qbank 跨实例检索结果缓存（真 Postgres）全部通过' : `✗ ${fail} 项失败`}`);
  } finally {
    await pool.end();
    await adminPool.query(`DROP DATABASE IF EXISTS "${proofDatabase}"`);
    await adminPool.end();
  }
  process.exit(fail ? 1 : 0);
}
main().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => undefined);
  await adminPool.query(`DROP DATABASE IF EXISTS "${proofDatabase}"`).catch(() => undefined);
  await adminPool.end().catch(() => undefined);
  process.exit(1);
});
