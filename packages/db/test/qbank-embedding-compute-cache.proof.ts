/**
 * RAG-FUNNEL-02B / EMBED-CACHE-01 embedding compute cache proof (real isolated
 * PostgreSQL, full migration chain).
 *
 * The durable fill intent + cost reservation + dispatch slot + unknown/
 * succeeded_uncached/pollution judgements are asserted against real PG rows —
 * never a mock counter.  The value store and merge lock are in-process
 * contract substitutes (production uses real Redis); they carry no business
 * state, so every load-bearing assertion below is a genuine PG assertion.
 *
 * pnpm embed-cache:prove   (node scripts/run-e2e-isolated.mjs embed-cache:prove:raw)
 */
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import {
  assertIsolatedTestTarget, createPool, asPrincipal, asQbankControlExecutor,
  resolveEmbeddingCompute, sweepStaleEmbeddingFills,
  claimFillIntent, reconcileEmbeddingCompute,
  embeddingComputeCacheKey, embeddingExactRecipeDigest, embeddingProviderInputDigest,
  buildEmbeddingComputeValue, validateEmbeddingComputeValue,
  EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, QBANK_OWNER,
  type EmbeddingComputeValue, type EmbeddingComputeValueStore,
  type EmbeddingComputeLockBackend, type EmbeddingComputeLock,
} from '../src/index.ts';

process.env.RAG_QBANK_COMPUTE_CACHE_HASH_KEY = 'embedding-compute-cache-proof-hmac-key-not-production-01';
process.env.RAG_QBANK_COMPUTE_CACHE_VALUE_HASH_KEY = 'embedding-compute-cache-proof-value-hmac-key-not-production-02';

const admin = createPool();
let fail = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) fail++; };
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Contract substitute only: production acceptance uses the separately required real Redis/Tair suite. */
class MemoryValueStore implements EmbeddingComputeValueStore {
  readonly values = new Map<string, EmbeddingComputeValue>();
  failPuts = false;
  async get(cacheKey: string): Promise<EmbeddingComputeValue | null> {
    const v = this.values.get(cacheKey);
    return v ? { ...v, vector: [...v.vector] } : null;
  }
  async put(cacheKey: string, value: EmbeddingComputeValue): Promise<boolean> {
    if (this.failPuts) return false;
    this.values.set(cacheKey, { ...value, vector: [...value.vector] });
    return true;
  }
  clear(): void { this.values.clear(); }
}

class MemoryLockBackend implements EmbeddingComputeLockBackend {
  private readonly locks = new Map<string, { token: string; expiresAt: number }>();
  async acquire(cacheKey: string, leaseMs: number): Promise<EmbeddingComputeLock | null> {
    const existing = this.locks.get(cacheKey);
    if (existing && existing.expiresAt > Date.now()) return null;
    const token = randomUUID();
    this.locks.set(cacheKey, { token, expiresAt: Date.now() + leaseMs });
    return { token };
  }
  async release(cacheKey: string, lock: EmbeddingComputeLock): Promise<void> {
    if (this.locks.get(cacheKey)?.token === lock.token) this.locks.delete(cacheKey);
  }
}

const DIM = 512;
const recipe = {
  schema: 'qbank-embedding:v1',
  provider: 'dashscope',
  deployment: 'cn-beijing',
  model: 'text-embedding-v3',
  revision: '2026-07-01',
  dimension: DIM,
  normalization: 'l2',
  documentTransform: 'none',
  metadataInputProfile: 'qbank-prompt-v1',
  codec: 'utf8',
} as const;

function vector(seed: string): number[] {
  const digest = createHash('sha256').update(seed).digest();
  const out = Array.from({ length: DIM }, (_, i) => ((digest[i % digest.length]! / 255) * 2) - 1);
  const norm = Math.hypot(...out) || 1;
  return out.map((x) => x / norm);
}

const cost = { provider: 'dashscope', model: 'text-embedding-v3', region: 'cn-beijing', reservedMicroCny: 100 };
let embedCalls = 0;
const baseEmbed = async (bytes: Uint8Array) => { embedCalls++; const text = Buffer.from(bytes).toString('utf8'); return vector(text); };

async function countFills(cacheKey: string): Promise<number> {
  const r = await admin.query('SELECT count(*)::int n FROM embedding_fill_intent WHERE cache_key=$1', [cacheKey]);
  return r.rows[0]?.n ?? 0;
}
async function fillRow(cacheKey: string): Promise<Record<string, unknown> | undefined> {
  const r = await admin.query('SELECT status,cost_state,error_code,lease_token,lease_expires_at,refill_version FROM embedding_fill_intent WHERE cache_key=$1', [cacheKey]);
  return r.rows[0];
}
async function eventRows(cacheKey: string): Promise<Array<{ event_seq: number; from_status: string | null; to_status: string }>> {
  const r = await admin.query('SELECT event_seq,from_status,to_status FROM embedding_fill_event WHERE cache_key=$1 ORDER BY event_seq', [cacheKey]);
  return r.rows;
}

async function main() {
  await assertIsolatedTestTarget(admin);
  const unique = `${Date.now()}-${process.pid}`;

  // ---- 1. cache identity: digest/key are a closed field list; owner/tenant/generationId/route/raw content can never enter ----
  const manualRecipeDigest = createHash('sha256').update(JSON.stringify({
    schema: recipe.schema, provider: recipe.provider, deployment: recipe.deployment, model: recipe.model,
    revision: recipe.revision, dimension: recipe.dimension, normalization: recipe.normalization,
    documentTransform: recipe.documentTransform, metadataInputProfile: recipe.metadataInputProfile, codec: recipe.codec,
  })).digest('hex');
  const recipeDigest = embeddingExactRecipeDigest(recipe);
  A('exactRecipeDigest == 固定字段清单的 sha256（无 generationId/route/owner/tenant/raw content 隐藏字段）',
    recipeDigest === manualRecipeDigest && /^[0-9a-f]{64}$/.test(recipeDigest));

  const bytes = Buffer.from(`proof-identity-${unique}`, 'utf8');
  const inputDigest = embeddingProviderInputDigest(bytes);
  const manualInputDigest = createHash('sha256').update(bytes).digest('hex');
  A('provider input digest == SHA-256(实际规范 provider input bytes)', inputDigest === manualInputDigest);

  const cacheKey = embeddingComputeCacheKey(EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest, inputDigest);
  const manualCacheKey = createHmac('sha256', process.env.RAG_QBANK_COMPUTE_CACHE_HASH_KEY!).update(JSON.stringify({
    v: 'embedding-compute-cache:v1', scope: EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, exactRecipeDigest: recipeDigest, inputDigest,
  })).digest('hex');
  A('cache key == HMAC(scope + exactRecipeDigest + SHA-256(input bytes))（仅这三者派生）',
    cacheKey === manualCacheKey && /^[0-9a-f]{64}$/.test(cacheKey));

  let scopeRejected = false;
  try { embeddingComputeCacheKey('org-private', recipeDigest, inputDigest); } catch (e) { scopeRejected = (e as Error).message === 'embedding_compute_scope_not_allowed'; }
  A('非 global-approved-qbank scope 的 key 派生被拒（首期私有/组织 read/write=0）', scopeRejected);

  const store = new MemoryValueStore();
  const locks = new MemoryLockBackend();
  const resolve = (text: string, overrides: Partial<Parameters<typeof resolveEmbeddingCompute>[1]> = {}) => {
    const body = Buffer.from(text, 'utf8');
    return resolveEmbeddingCompute(admin, {
      scope: EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipe, canonicalProviderInputBytes: body, costReservation: cost,
      valueStore: store, lockBackend: locks, embed: baseEmbed, waitMs: 2000, leaseSeconds: 10, ...overrides,
    });
  };

  const fillsBeforeScope = (await admin.query('SELECT count(*)::int n FROM embedding_fill_intent')).rows[0].n;
  let resolveScopeRejected = false;
  try { await resolveEmbeddingCompute(admin, {
    scope: 'org-private', recipe, canonicalProviderInputBytes: Buffer.from('x', 'utf8'), costReservation: cost,
    valueStore: store, lockBackend: locks, embed: baseEmbed,
  }); } catch (e) { resolveScopeRejected = (e as Error & { code?: string }).code === 'embedding_compute_scope_not_allowed'; }
  const fillsAfterScope = (await admin.query('SELECT count(*)::int n FROM embedding_fill_intent')).rows[0].n;
  A('resolve 遇非 global scope 抛错且不写任何 fill', resolveScopeRejected && fillsAfterScope === fillsBeforeScope);

  // ---- 2. pollution (HMAC/dimension/finite) is never a miss ----
  const pollutionText = 'pollution-seed';
  const pollutionBody = Buffer.from(pollutionText, 'utf8');
  const pollutionInputDigest = embeddingProviderInputDigest(pollutionBody);
  const good = buildEmbeddingComputeValue({ recipeDigest, inputDigest: pollutionInputDigest, dimension: DIM, vector: vector(pollutionText) });
  const tamperedHmac = { ...good, valueHmac: good.valueHmac.replace(/^./, good.valueHmac[0] === '0' ? '1' : '0') };
  const tamperedRecipe = { ...good, recipeDigest: '0'.repeat(64) };
  const tamperedInput = { ...good, inputDigest: '1'.repeat(64) };
  const tamperedDim = { ...good, dimension: 128, vector: good.vector.slice(0, 128) };
  const tamperedChecksum = { ...good, checksum: 'f'.repeat(64) };
  const nonFinite = { ...good, vector: good.vector.map((x, i) => (i === 0 ? Number.NaN : x)) };
  const pollutionProbes = [
    validateEmbeddingComputeValue(tamperedHmac, { recipeDigest, inputDigest: pollutionInputDigest, dimension: DIM }).ok === false,
    validateEmbeddingComputeValue(tamperedRecipe, { recipeDigest, inputDigest: pollutionInputDigest, dimension: DIM }).ok === false,
    validateEmbeddingComputeValue(tamperedInput, { recipeDigest, inputDigest: pollutionInputDigest, dimension: DIM }).ok === false,
    validateEmbeddingComputeValue(tamperedDim, { recipeDigest, inputDigest: pollutionInputDigest, dimension: DIM }).ok === false,
    validateEmbeddingComputeValue(tamperedChecksum, { recipeDigest, inputDigest: pollutionInputDigest, dimension: DIM }).ok === false,
    validateEmbeddingComputeValue(nonFinite, { recipeDigest, inputDigest: pollutionInputDigest, dimension: DIM }).ok === false,
    validateEmbeddingComputeValue(good, { recipeDigest, inputDigest: pollutionInputDigest, dimension: DIM }).ok === true,
  ];
  A('value 校验：HMAC/recipe/input/dimension/checksum/非有限 任一不符 = 污染，合法通过', pollutionProbes.every(Boolean));

  // 预置污染 value 的 resolve：抛污染且不调 embed、不写 fill、不写 projection。
  const pollutedKey = embeddingComputeCacheKey(EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest, pollutionInputDigest);
  store.values.set(pollutedKey, { ...tamperedHmac, vector: [...tamperedHmac.vector] });
  const chunksBeforePollution = (await admin.query('SELECT count(*)::int n FROM qbank_generation_chunk')).rows[0].n;
  const gensBeforePollution = (await admin.query('SELECT count(*)::int n FROM qbank_vector_generation')).rows[0].n;
  const embedCallsBeforePollution = embedCalls;
  let pollutionRejected = false;
  try { await resolve(pollutionText); } catch (e) { pollutionRejected = (e as Error & { code?: string }).code === 'embedding_compute_cache_pollution'; }
  const chunksAfterPollution = (await admin.query('SELECT count(*)::int n FROM qbank_generation_chunk')).rows[0].n;
  const gensAfterPollution = (await admin.query('SELECT count(*)::int n FROM qbank_vector_generation')).rows[0].n;
  A('污染 value：抛 pollution、不调 embed、不写 projection/激活、不二次 send',
    pollutionRejected && embedCalls === embedCallsBeforePollution
    && chunksAfterPollution === chunksBeforePollution && gensAfterPollution === gensBeforePollution
    && await countFills(pollutedKey) === 0);

  // ---- 3. miss first writes the durable fill + dispatch slot, before the provider send ----
  const durableText = `proof-durable-${unique}`;
  const durableBody = Buffer.from(durableText, 'utf8');
  const durableInputDigest = embeddingProviderInputDigest(durableBody);
  const durableKey = embeddingComputeCacheKey(EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest, durableInputDigest);
  let releaseEmbed: ((v: number[]) => void) | undefined;
  const deferredEmbed = async (b: Uint8Array) => {
    embedCalls++;
    const text = Buffer.from(b).toString('utf8');
    return new Promise<number[]>((res) => { releaseEmbed = res; void text; });
  };
  const durablePromise = resolveEmbeddingCompute(admin, {
    scope: EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipe, canonicalProviderInputBytes: durableBody, costReservation: cost,
    valueStore: store, lockBackend: locks, embed: deferredEmbed, waitMs: 5000, leaseSeconds: 10,
  });
  for (let i = 0; i < 200 && !releaseEmbed; i++) await sleep(5);
  A('miss 在 provider send 前已写 durable fill + dispatch slot', typeof releaseEmbed === 'function');
  const midFill = await fillRow(durableKey);
  const midEvents = await eventRows(durableKey);
  A('provider send 前 fill=dispatching / cost=dispatched / 持有 dispatch lease，且已有 claim+dispatch 两条事件',
    midFill?.status === 'dispatching' && midFill?.cost_state === 'dispatched'
    && midFill?.lease_token != null && midFill?.lease_expires_at != null
    && midEvents.length === 2 && midEvents[0]?.to_status === 'claimed' && midEvents[1]?.to_status === 'dispatching');
  releaseEmbed!(vector(durableText));
  const durableResult = await durablePromise;
  const durableFill = await fillRow(durableKey);
  A('provider 返回后 settle 为 succeeded/settled 且当前调用拿到向量',
    durableResult.status === 'filled' && durableFill?.status === 'succeeded' && durableFill?.cost_state === 'settled'
    && durableResult.vector.length === DIM && durableResult.vector.every(Number.isFinite));

  // ---- 4a. dispatching response-loss/timeout -> unknown (sticky, no auto re-send) ----
  const unknownText = `proof-unknown-${unique}`;
  const unknownBody = Buffer.from(unknownText, 'utf8');
  const unknownKey = embeddingComputeCacheKey(EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest, embeddingProviderInputDigest(unknownBody));
  const unknownStore = new MemoryValueStore();
  const unknownLocks = new MemoryLockBackend();
  let unknownEmbeds = 0;
  const unknownEmbed = async () => { unknownEmbeds++; throw Object.assign(new Error('external outcome unknown'), { code: 'external_outcome_unknown' }); };
  const unknownResolve = () => resolveEmbeddingCompute(admin, {
    scope: EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipe, canonicalProviderInputBytes: unknownBody, costReservation: cost,
    valueStore: unknownStore, lockBackend: unknownLocks, embed: unknownEmbed, waitMs: 2000, leaseSeconds: 10,
  });
  const unknownFirst = await unknownResolve().then(() => false).catch((e) => (e as Error & { code?: string }).code === 'external_outcome_unknown');
  const unknownSecond = await unknownResolve().then(() => false).catch((e) => (e as Error & { code?: string }).code === 'embedding_compute_fill_unknown');
  const unknownFill = await fillRow(unknownKey);
  A('unknown：首次 provider loss 抛原始错、fill=unknown/cost=unknown，二次不重发不新建 fill',
    unknownFirst && unknownSecond && unknownFill?.status === 'unknown' && unknownFill?.cost_state === 'unknown'
    && unknownEmbeds === 1 && await countFills(unknownKey) === 1);

  // ---- 4b. provider success but value write fails -> succeeded_uncached (no auto re-fill/re-charge) ----
  const uncachedText = `proof-uncached-${unique}`;
  const uncachedBody = Buffer.from(uncachedText, 'utf8');
  const uncachedKey = embeddingComputeCacheKey(EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest, embeddingProviderInputDigest(uncachedBody));
  const uncachedStore = new MemoryValueStore();
  uncachedStore.failPuts = true;
  const uncachedLocks = new MemoryLockBackend();
  let uncachedEmbeds = 0;
  const uncachedEmbed = async (b: Uint8Array) => { uncachedEmbeds++; const text = Buffer.from(b).toString('utf8'); return vector(text); };
  const uncachedResolve = () => resolveEmbeddingCompute(admin, {
    scope: EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipe, canonicalProviderInputBytes: uncachedBody, costReservation: cost,
    valueStore: uncachedStore, lockBackend: uncachedLocks, embed: uncachedEmbed, waitMs: 2000, leaseSeconds: 10,
  });
  const uncachedFirst = await uncachedResolve();
  const uncachedSecond = await uncachedResolve().then(() => false).catch((e) => (e as Error & { code?: string }).code === 'embedding_compute_value_unavailable');
  const uncachedFill = await fillRow(uncachedKey);
  A('succeeded_uncached：value 写失败当前调用仍得向量、fill=succeeded_uncached/settled，二次不重发不新建 fill',
    uncachedFirst.status === 'filled' && uncachedFirst.vector.length === DIM
    && uncachedSecond && uncachedFill?.status === 'succeeded_uncached' && uncachedFill?.cost_state === 'settled'
    && uncachedEmbeds === 1 && await countFills(uncachedKey) === 1);

  // ---- 5. concurrent miss on the same opaque identity -> exactly one provider send ----
  const concurrentText = `proof-concurrent-${unique}`;
  const concurrentBody = Buffer.from(concurrentText, 'utf8');
  const concurrentKey = embeddingComputeCacheKey(EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest, embeddingProviderInputDigest(concurrentBody));
  const concurrentStore = new MemoryValueStore();
  const concurrentLocks = new MemoryLockBackend();
  let concurrentEmbeds = 0;
  const concurrentEmbed = async (b: Uint8Array) => { concurrentEmbeds++; await sleep(30); const text = Buffer.from(b).toString('utf8'); return vector(text); };
  const concurrentResolve = () => resolveEmbeddingCompute(admin, {
    scope: EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipe, canonicalProviderInputBytes: concurrentBody, costReservation: cost,
    valueStore: concurrentStore, lockBackend: concurrentLocks, embed: concurrentEmbed, waitMs: 8000, leaseSeconds: 10,
  });
  const results = await Promise.all(Array.from({ length: 12 }, () => concurrentResolve()));
  const dispatchTransitions = (await admin.query(
    "SELECT count(*)::int n FROM embedding_fill_event WHERE cache_key=$1 AND from_status='claimed' AND to_status='dispatching'", [concurrentKey])).rows[0].n;
  A(`12 路并发同 opaque identity：恰 1 次 provider send / 1 个 fill / 1 次 claimed→dispatching，且全部收敛 (embeds=${concurrentEmbeds})`,
    concurrentEmbeds === 1 && await countFills(concurrentKey) === 1 && dispatchTransitions === 1
    && results.length === 12 && results.every((r) => r.status === 'hit' || r.status === 'filled')
    && results.every((r) => r.vector.length === DIM && r.vector.every(Number.isFinite)));

  // ---- 6. a cache hit is still governed: the cache never restores/activates/authorizes a vector row ----
  const hitText = `proof-hit-${unique}`;
  const hitBody = Buffer.from(hitText, 'utf8');
  const hitStore = new MemoryValueStore();
  const hitLocks = new MemoryLockBackend();
  let hitEmbeds = 0;
  const hitEmbed = async (b: Uint8Array) => { hitEmbeds++; const text = Buffer.from(b).toString('utf8'); return vector(text); };
  const hitResolve = () => resolveEmbeddingCompute(admin, {
    scope: EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipe, canonicalProviderInputBytes: hitBody, costReservation: cost,
    valueStore: hitStore, lockBackend: hitLocks, embed: hitEmbed, waitMs: 2000, leaseSeconds: 10,
  });
  await hitResolve();
  const beforeChunks = (await admin.query('SELECT count(*)::int n FROM qbank_generation_chunk')).rows[0].n;
  const beforeGens = (await admin.query('SELECT count(*)::int n FROM qbank_vector_generation')).rows[0].n;
  const hitSecond = await hitResolve();
  const afterChunks = (await admin.query('SELECT count(*)::int n FROM qbank_generation_chunk')).rows[0].n;
  const afterGens = (await admin.query('SELECT count(*)::int n FROM qbank_vector_generation')).rows[0].n;
  A('cache hit 只复用向量：不写 projection、不激活 generation、不恢复/授权 vector row（前后零变化）',
    hitSecond.status === 'hit' && hitEmbeds === 1 && beforeChunks === afterChunks && beforeGens === afterGens);

  // ---- 7. RLS owner isolation: cross-owner read = 0, app_role has no write path ----
  const crossOwnerRows = await asPrincipal(admin, `tenant-other-${unique}`, (c) => c.query('SELECT count(*)::int n FROM embedding_fill_intent'));
  const qbankOwnerRows = await asPrincipal(admin, QBANK_OWNER, (c) => c.query('SELECT count(*)::int n FROM embedding_fill_intent'));
  let appRoleInsertDenied = false;
  try {
    await asPrincipal(admin, `tenant-other-${unique}`, (c) => c.query(
      `INSERT INTO embedding_fill_intent(cache_key,owner_user_id,scope,fill_id,lease_token,lease_expires_at,status,cost_state,reserved_micro_cny,provider,model,region,recipe_digest,input_digest,dimension)
       VALUES($1,$2,'global-approved-qbank',$3::uuid,$4::uuid,clock_timestamp()+interval '5 seconds','claimed','reserved',1,'p','m','r',$5,$6,512)`,
      ['0'.repeat(64), `tenant-other-${unique}`, randomUUID(), randomUUID(), recipeDigest, inputDigest]));
  } catch { appRoleInsertDenied = true; }
  A('RLS：跨 owner 读 0 行、qbank 属主读 >0 行、app_role 无 INSERT 写路径',
    crossOwnerRows.rows[0]?.n === 0 && qbankOwnerRows.rows[0]?.n > 0 && appRoleInsertDenied);

  // ---- 8. sweeper freezes a stale dispatching fill to unknown (no second send) ----
  const sweepText = `proof-sweep-${unique}`;
  const sweepInputDigest = embeddingProviderInputDigest(Buffer.from(sweepText, 'utf8'));
  const sweepKey = embeddingComputeCacheKey(EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest, sweepInputDigest);
  await asQbankControlExecutor(admin, (c) => c.query(
    `INSERT INTO embedding_fill_intent(cache_key,owner_user_id,scope,fill_id,lease_token,lease_expires_at,status,cost_state,reserved_micro_cny,provider,model,region,recipe_digest,input_digest,dimension)
     VALUES($1,$2,'global-approved-qbank',$3::uuid,$6::uuid,clock_timestamp()-interval '1 second','dispatching','dispatched',100,'dashscope','text-embedding-v3','cn-beijing',$4,$5,512)`,
    [sweepKey, QBANK_OWNER, randomUUID(), recipeDigest, sweepInputDigest, randomUUID()]));
  const sweptCount = await sweepStaleEmbeddingFills(admin, 0);
  const sweptFill = await fillRow(sweepKey);
  const sweptEvents = await eventRows(sweepKey);
  A('sweep：lease 已过期（进程已死）的 dispatching 冻结为 unknown（cost=unknown + 一条 dispatching→unknown 事件），无二次 send',
    sweptCount === 1 && sweptFill?.status === 'unknown' && sweptFill?.cost_state === 'unknown'
    && sweptEvents.length === 1 && sweptEvents[0]?.to_status === 'unknown');

  // ---- M1. ON CONFLICT 落败方 → FOR UPDATE → wait/terminal（绕过 merge lock，直打 PG 合并路径） ----
  const claimRaceText = `proof-claim-race-${unique}`;
  const claimRaceInputDigest = embeddingProviderInputDigest(Buffer.from(claimRaceText, 'utf8'));
  const claimRaceKey = embeddingComputeCacheKey(EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest, claimRaceInputDigest);
  const claimRaceInput = {
    cacheKey: claimRaceKey, scope: EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest,
    inputDigest: claimRaceInputDigest, dimension: DIM, costReservation: cost, leaseSeconds: 10,
  };
  const claimRaceResults = await Promise.all([
    asQbankControlExecutor(admin, (c) => claimFillIntent(c, claimRaceInput)),
    asQbankControlExecutor(admin, (c) => claimFillIntent(c, claimRaceInput)),
  ]);
  const claimRaceActions = claimRaceResults.map((r) => r.action).sort();
  A('M1: 2 executor 无锁并发 claimFillIntent——ON CONFLICT 落败方走 FOR UPDATE→wait（非静默丢弃），恰 1 execute + 1 wait 且唯一 fill 行',
    claimRaceActions[0] === 'execute' && claimRaceActions[1] === 'wait' && await countFills(claimRaceKey) === 1);

  // 预置 claimed + 过期 lease → reclaim 同 fill_id（权威在 PG 行：唯一 fill 行 + claimed→claimed 事件）。
  const reclaimText = `proof-reclaim-${unique}`;
  const reclaimInputDigest = embeddingProviderInputDigest(Buffer.from(reclaimText, 'utf8'));
  const reclaimKey = embeddingComputeCacheKey(EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest, reclaimInputDigest);
  const presetReclaimFillId = randomUUID();
  await asQbankControlExecutor(admin, (c) => c.query(
    `INSERT INTO embedding_fill_intent(cache_key,owner_user_id,scope,fill_id,lease_token,lease_expires_at,status,cost_state,reserved_micro_cny,provider,model,region,recipe_digest,input_digest,dimension)
     VALUES($1,$2,'global-approved-qbank',$3::uuid,$4::uuid,clock_timestamp()-interval '1 second','claimed','reserved',100,'dashscope','text-embedding-v3','cn-beijing',$5,$6,512)`,
    [reclaimKey, QBANK_OWNER, presetReclaimFillId, randomUUID(), recipeDigest, reclaimInputDigest]));
  const reclaimResult = await asQbankControlExecutor(admin, (c) => claimFillIntent(c, {
    cacheKey: reclaimKey, scope: EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest,
    inputDigest: reclaimInputDigest, dimension: DIM, costReservation: cost, leaseSeconds: 10,
  }));
  const reclaimFillId = reclaimResult.action === 'execute' ? reclaimResult.claim.fillId : null;
  const reclaimEvents = await eventRows(reclaimKey);
  const reclaimRenewals = reclaimEvents.filter((e) => e.from_status === 'claimed' && e.to_status === 'claimed');
  A('M1: 预置 claimed + 过期 lease → reclaim 同 fill_id + claimed→claimed 事件（唯一 fill 行，不制造新 billable id）',
    reclaimResult.action === 'execute' && reclaimFillId === presetReclaimFillId
    && reclaimRenewals.length === 1 && await countFills(reclaimKey) === 1);

  // 预置 in-flight dispatching → claimFillIntent 返回 wait（不新建 fill、不误认 terminal）。
  const dispWaitText = `proof-disp-wait-${unique}`;
  const dispWaitInputDigest = embeddingProviderInputDigest(Buffer.from(dispWaitText, 'utf8'));
  const dispWaitKey = embeddingComputeCacheKey(EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest, dispWaitInputDigest);
  await asQbankControlExecutor(admin, (c) => c.query(
    `INSERT INTO embedding_fill_intent(cache_key,owner_user_id,scope,fill_id,lease_token,lease_expires_at,status,cost_state,reserved_micro_cny,provider,model,region,recipe_digest,input_digest,dimension)
     VALUES($1,$2,'global-approved-qbank',$3::uuid,$4::uuid,clock_timestamp()+interval '60 seconds','dispatching','dispatched',100,'dashscope','text-embedding-v3','cn-beijing',$5,$6,512)`,
    [dispWaitKey, QBANK_OWNER, randomUUID(), randomUUID(), recipeDigest, dispWaitInputDigest]));
  const dispWaitResult = await asQbankControlExecutor(admin, (c) => claimFillIntent(c, {
    cacheKey: dispWaitKey, scope: EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest,
    inputDigest: dispWaitInputDigest, dimension: DIM, costReservation: cost, leaseSeconds: 10,
  }));
  A('M1: 预置 in-flight dispatching → claimFillIntent 返回 wait（不新建 fill、不误认 terminal）',
    dispWaitResult.action === 'wait' && await countFills(dispWaitKey) === 1);

  // ---- M2. reconciliation 原语：显式、版本化、fail-closed 的 refill（消除 Redis 逐出死端） ----
  const reconText = `proof-reconcile-${unique}`;
  const reconBody = Buffer.from(reconText, 'utf8');
  const reconKey = embeddingComputeCacheKey(EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest, embeddingProviderInputDigest(reconBody));
  const reconStore = new MemoryValueStore();
  const reconLocks = new MemoryLockBackend();
  let reconEmbeds = 0;
  const reconEmbed = async (b: Uint8Array) => { reconEmbeds++; const text = Buffer.from(b).toString('utf8'); return vector(text); };
  const reconResolve = () => resolveEmbeddingCompute(admin, {
    scope: EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipe, canonicalProviderInputBytes: reconBody, costReservation: cost,
    valueStore: reconStore, lockBackend: reconLocks, embed: reconEmbed, waitMs: 2000, leaseSeconds: 10,
  });
  const reconFirst = await reconResolve();
  const reconRowBefore = await fillRow(reconKey);
  // 模拟 Redis 逐出：durable fill 仍是 succeeded，但 value 已消失。
  reconStore.clear();
  let reconNoProofValueUnavailable = false;
  try { await reconResolve(); } catch (e) { reconNoProofValueUnavailable = (e as Error & { code?: string }).code === 'embedding_compute_value_unavailable'; }
  const reconEmbedsBeforeReconcile = reconEmbeds;
  const reconResult = await reconcileEmbeddingCompute(admin, { cacheKey: reconKey, valueStore: reconStore, costReservation: cost, leaseSeconds: 10 });
  const reconRowAfterReconcile = await fillRow(reconKey);
  // reconcile 后的下一次正常 resolve 才 reclaim 并恰一次新 provider send。
  const reconSecond = await reconResolve();
  const reconEvents = await eventRows(reconKey);
  const reconReconciledEdges = reconEvents.filter((e) => e.from_status === 'succeeded' && e.to_status === 'claimed');
  A('M2: terminal succeeded + Redis 逐出 → 无 reconcile 仍 value_unavailable；reconcile 版本化 reset 后恰一次新 fill（同 fill 行 refill_version=1、embed 恰 +1、仅一条 succeeded→claimed 边）',
    reconFirst.status === 'filled' && reconRowBefore?.status === 'succeeded'
    && reconNoProofValueUnavailable && reconEmbedsBeforeReconcile === 1
    && reconResult.status === 'reconciled' && reconRowAfterReconcile?.status === 'claimed' && reconRowAfterReconcile?.refill_version === 1
    && reconSecond.status === 'filled' && reconEmbeds === 2
    && reconReconciledEdges.length === 1 && await countFills(reconKey) === 1);

  // 无逐出证明（Redis 值仍存在）→ 不 reset / 不重建。
  const reconNoEvict = await reconcileEmbeddingCompute(admin, { cacheKey: reconKey, valueStore: reconStore, costReservation: cost, leaseSeconds: 10 });
  const reconRowAfterNoEvict = await fillRow(reconKey);
  A('M2: 无逐出证明（Redis 值仍存在）→ reconcile 返回 value_present，不 reset/不重建（refill_version 不变、embed 不增）',
    reconNoEvict.status === 'value_present' && reconRowAfterNoEvict?.status === 'succeeded'
    && reconRowAfterNoEvict?.refill_version === 1 && reconEmbeds === 2);

  // ---- M3. sweep 用 dispatch lease 判陈旧：in-flight（lease 未过期）绝不误冻 ----
  const sweepInFlightText = `proof-sweep-inflight-${unique}`;
  const sweepInFlightInputDigest = embeddingProviderInputDigest(Buffer.from(sweepInFlightText, 'utf8'));
  const sweepInFlightKey = embeddingComputeCacheKey(EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE, recipeDigest, sweepInFlightInputDigest);
  await asQbankControlExecutor(admin, (c) => c.query(
    `INSERT INTO embedding_fill_intent(cache_key,owner_user_id,scope,fill_id,lease_token,lease_expires_at,status,cost_state,reserved_micro_cny,provider,model,region,recipe_digest,input_digest,dimension)
     VALUES($1,$2,'global-approved-qbank',$3::uuid,$6::uuid,clock_timestamp()+interval '60 seconds','dispatching','dispatched',100,'dashscope','text-embedding-v3','cn-beijing',$4,$5,512)`,
    [sweepInFlightKey, QBANK_OWNER, randomUUID(), recipeDigest, sweepInFlightInputDigest, randomUUID()]));
  const sweptInFlightCount = await sweepStaleEmbeddingFills(admin, 0);
  const sweptInFlightFill = await fillRow(sweepInFlightKey);
  A('M3: in-flight dispatching（lease 未过期）→ sweep 不冻为 unknown（provider 仍在跑，无死端）',
    sweptInFlightCount === 0 && sweptInFlightFill?.status === 'dispatching' && sweptInFlightFill?.cost_state === 'dispatched');

  console.log(`\n${fail === 0 ? '✓ embedding compute cache（真 Postgres）全部通过' : `✗ ${fail} 项失败`}`);
  await admin.end();
  process.exit(fail ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
