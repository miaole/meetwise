/**
 * qbank 检索的控制面（PostgreSQL）与热数据面（Redis adapter）边界。
 *
 * PostgreSQL 只保存 epoch、ANN、RLS 和外部 embedding 的 durable fill
 * intent；它不再保存/轮询检索结果。Redis adapter 保存短 TTL 的 opaque
 * HMAC key → ref/distance，并以带 fencing token 的 singleflight 合并 miss。
 * Redis 不是授权或扣费真相：命中后调用方仍必须走 evidence 的 PG/RLS 二次校验。
 */
import { createHmac, randomUUID } from 'node:crypto';
import type { PoolClient as Client } from 'pg';
import { asPrincipal, type DbPool } from './principal.ts';
import { hybridQbankSearch, type QbankRetrievalMode } from './qbank-generation-retrieval.ts';

const CACHE_KEY_VERSION = 'qbank-retrieval-cache:v3';
const MAX_QUERY_CHARS = 12_000;
const MAX_EMBEDDER_VERSION_CHARS = 256;
const DEFAULT_TTL_SECONDS = 120;
const DEFAULT_WAIT_MS = 5_000;
const DEFAULT_LEASE_SECONDS = 20;

export interface QbankRetrievalCacheKeyInput {
  owner: string;
  query: string;
  k: number;
  embedderVersion: string;
  qbankRecipeId?: string;
  retrievalMode?: QbankRetrievalMode;
}

export interface QbankEmbeddingCallContext {
  cacheKey: string;
  /** Durable fill id; it remains stable after a Redis lock hand-off. Never contains query text. */
  invocationId: string;
  mode: 'claimed';
}

export interface QbankRetrievalHit { refId: string; distance: number }
export type QbankCacheStatus = 'hit' | 'miss';
export interface CachedQbankSearchResult { hits: QbankRetrievalHit[]; cacheStatus: QbankCacheStatus }

/** Opaque Redis lock: callers must never invent, log or reuse its token. */
export interface QbankRetrievalCacheLock { readonly token: string }
export interface QbankRetrievalCacheAddress {
  /** HMAC only; no owner/tenant/query/prompt may enter a Redis key. */
  cacheKey: string;
  corpusEpoch: string;
}

/**
 * Runtime adapter implemented by the worker's Redis client. `publish` must be
 * a single fenced operation: token equality → SET value with TTL → DEL lock.
 * Lock and value must use the same Redis Cluster hash tag.
 */
export interface QbankRetrievalCacheBackend {
  read(address: QbankRetrievalCacheAddress, k: number): Promise<QbankRetrievalHit[] | undefined>;
  acquire(address: QbankRetrievalCacheAddress, leaseMs: number): Promise<QbankRetrievalCacheLock | undefined>;
  renew(address: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock, leaseMs: number): Promise<boolean>;
  publish(address: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock, hits: QbankRetrievalHit[], ttlMs: number): Promise<boolean>;
  release(address: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock): Promise<void>;
}

export class RagCacheDependencyError extends Error {
  readonly code = 'rag_cache_dependency_unavailable';
  constructor(message = 'rag_cache_dependency_unavailable') { super(message); this.name = 'RagCacheDependencyError'; }
}

export interface CachedQbankSearchInput {
  query: string;
  k: number;
  embedderVersion: string;
  qbankRecipeId?: string;
  retrievalMode?: QbankRetrievalMode;
  /** Redis hot-cache adapter. A missing/unreachable adapter is not a cache miss and must fail closed. */
  cache: QbankRetrievalCacheBackend;
  /** Only called by a fenced cache-fill owner. */
  embed(texts: string[], context: QbankEmbeddingCallContext): Promise<number[][]>;
  ttlSeconds?: number;
  waitMs?: number;
  leaseSeconds?: number;
}

interface CacheIdentity {
  owner: string;
  key: string;
  query: string;
  k: number;
  embedderVersion: string;
  qbankRecipeId?: string;
  retrievalMode: QbankRetrievalMode;
  ttlSeconds: number;
  leaseSeconds: number;
}
interface FillClaim { fillId: string; token: string }
type FillClaimResult = { action: 'execute'; claim: FillClaim } | { action: 'wait' } | { action: 'unknown' };

function clampInteger(value: number | undefined, fallback: number, min: number, max: number): number {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`qbank_retrieval_cache_invalid_option:${min}-${max}`);
  return value;
}

function codeError(code: string): Error { return Object.assign(new Error(code), { code }); }

function validateKeyInput(input: QbankRetrievalCacheKeyInput): void {
  if (!input.owner || input.owner.length > 512) throw new Error('qbank_retrieval_cache_invalid_owner');
  if (!input.query || input.query.length > MAX_QUERY_CHARS) throw new Error('qbank_retrieval_cache_invalid_query');
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > 50) throw new Error('qbank_retrieval_cache_invalid_k');
  if (!input.embedderVersion || input.embedderVersion.length > MAX_EMBEDDER_VERSION_CHARS) throw new Error('qbank_retrieval_cache_invalid_embedder_version');
}

/**
 * Only a dedicated HMAC key is permitted. Falling back to an auth/model secret
 * makes credential rotation silently invalidate a cost-sensitive cache and
 * couples two unrelated blast radii.
 */
export function qbankRetrievalCacheKey(input: QbankRetrievalCacheKeyInput): string {
  validateKeyInput(input);
  const secret = process.env.RAG_QBANK_CACHE_HASH_KEY;
  if (!secret || secret.length < 32) throw new Error('qbank_retrieval_cache_hash_key_missing');
  return createHmac('sha256', secret).update(JSON.stringify({
    v: CACHE_KEY_VERSION,
    owner: input.owner,
    embedderVersion: input.embedderVersion,
    qbankRecipeId: input.qbankRecipeId ?? null,
    retrievalMode: input.retrievalMode ?? 'dense',
    k: input.k,
    query: input.query,
  })).digest('hex');
}

function validHits(value: unknown, k: number): QbankRetrievalHit[] | undefined {
  if (!Array.isArray(value) || value.length > k) return undefined;
  const hits: QbankRetrievalHit[] = [];
  for (const item of value) {
    const hit = item as { refId?: unknown; distance?: unknown };
    if (!hit || typeof hit.refId !== 'string' || hit.refId.length < 1 || hit.refId.length > 512 || !Number.isFinite(hit.distance)) return undefined;
    hits.push({ refId: hit.refId, distance: Number(hit.distance) });
  }
  return hits;
}

async function readEpoch(c: Client): Promise<string> {
  const r = await c.query('SELECT epoch::text AS epoch FROM qbank_cache_epoch WHERE singleton=true');
  if (r.rowCount !== 1 || typeof r.rows[0]?.epoch !== 'string') throw new Error('qbank_retrieval_cache_epoch_missing');
  return r.rows[0].epoch;
}

/** app_role only executes this read-lock function; no remote I/O is performed while the transaction is open. */
async function lockAndReadEpoch(c: Client): Promise<string> {
  const r = await c.query('SELECT qbank_lock_retrieval_cache_epoch()::text AS epoch');
  if (r.rowCount !== 1 || typeof r.rows[0]?.epoch !== 'string') throw new Error('qbank_retrieval_cache_epoch_missing');
  return r.rows[0].epoch;
}

async function claimFillIntent(c: Client, id: CacheIdentity, epoch: string): Promise<FillClaimResult> {
  const token = randomUUID();
  const fillId = randomUUID();
  const inserted = await c.query(
    `INSERT INTO qbank_retrieval_fill_intent(owner_user_id,cache_key,corpus_epoch,fill_id,lease_token,lease_expires_at,status)
     VALUES($1,$2,$3::bigint,$4::uuid,$5::uuid,clock_timestamp()+($6::text || ' seconds')::interval,'claimed')
     ON CONFLICT(owner_user_id,cache_key,corpus_epoch) DO NOTHING
     RETURNING fill_id::text`,
    [id.owner, id.key, epoch, fillId, token, id.leaseSeconds],
  );
  if (inserted.rowCount === 1) return { action: 'execute', claim: { fillId, token } };
  const existing = await c.query(
    `SELECT fill_id::text,status,lease_expires_at < clock_timestamp() AS expired
       FROM qbank_retrieval_fill_intent
      WHERE owner_user_id=$1 AND cache_key=$2 AND corpus_epoch=$3::bigint FOR UPDATE`,
    [id.owner, id.key, epoch],
  );
  const row = existing.rows[0];
  if (!row) throw new Error('qbank_retrieval_fill_intent_missing_after_conflict');
  if (row.status === 'unknown' || row.status === 'dispatching' || row.status === 'settled') return row.status === 'unknown' ? { action: 'unknown' } : { action: 'wait' };
  if (row.expired !== true) return { action: 'wait' };
  const reclaimed = await c.query(
    `UPDATE qbank_retrieval_fill_intent
        SET lease_token=$4::uuid,lease_expires_at=clock_timestamp()+($5::text || ' seconds')::interval,updated_at=clock_timestamp()
      WHERE owner_user_id=$1 AND cache_key=$2 AND corpus_epoch=$3::bigint AND status='claimed' AND lease_expires_at < clock_timestamp()
      RETURNING fill_id::text`,
    [id.owner, id.key, epoch, token, id.leaseSeconds],
  );
  return reclaimed.rowCount === 1
    ? { action: 'execute', claim: { fillId: String(reclaimed.rows[0]?.fill_id), token } }
    : { action: 'wait' };
}

/** Atomic durable boundary immediately before the cost adapter can dispatch a provider request. */
async function markFillDispatched(c: Client, id: CacheIdentity, epoch: string, claim: FillClaim): Promise<boolean> {
  const r = await c.query(
    `UPDATE qbank_retrieval_fill_intent
        SET status='dispatching',lease_token=NULL,lease_expires_at=NULL,updated_at=clock_timestamp()
      WHERE owner_user_id=$1 AND cache_key=$2 AND corpus_epoch=$3::bigint AND fill_id=$4::uuid AND lease_token=$5::uuid
        AND status='claimed' AND lease_expires_at > clock_timestamp()`,
    [id.owner, id.key, epoch, claim.fillId, claim.token],
  );
  return r.rowCount === 1;
}

async function markFillSettled(c: Client, id: CacheIdentity, epoch: string, claim: FillClaim): Promise<boolean> {
  const r = await c.query(
    `UPDATE qbank_retrieval_fill_intent
        SET status='settled',updated_at=clock_timestamp()
      WHERE owner_user_id=$1 AND cache_key=$2 AND corpus_epoch=$3::bigint AND fill_id=$4::uuid AND status='dispatching'`,
    [id.owner, id.key, epoch, claim.fillId],
  );
  return r.rowCount === 1;
}

async function clearFillIntent(c: Client, id: CacheIdentity, epoch: string, claim: FillClaim): Promise<boolean> {
  const r = await c.query(
    `DELETE FROM qbank_retrieval_fill_intent
      WHERE owner_user_id=$1 AND cache_key=$2 AND corpus_epoch=$3::bigint AND fill_id=$4::uuid AND status='settled'`,
    [id.owner, id.key, epoch, claim.fillId],
  );
  return r.rowCount === 1;
}

/** Only reservation decisions proven to occur before provider dispatch may reopen the key automatically. */
async function abandonUnsentFill(c: Client, id: CacheIdentity, epoch: string, claim: FillClaim): Promise<boolean> {
  const r = await c.query(
    `DELETE FROM qbank_retrieval_fill_intent
      WHERE owner_user_id=$1 AND cache_key=$2 AND corpus_epoch=$3::bigint AND fill_id=$4::uuid AND status='dispatching'`,
    [id.owner, id.key, epoch, claim.fillId],
  );
  return r.rowCount === 1;
}

async function markFillUnknown(c: Client, id: CacheIdentity, epoch: string, claim: FillClaim, reason: string): Promise<void> {
  await c.query(
    `UPDATE qbank_retrieval_fill_intent
        SET status='unknown',error_code=$5,lease_token=NULL,lease_expires_at=NULL,updated_at=clock_timestamp()
      WHERE owner_user_id=$1 AND cache_key=$2 AND corpus_epoch=$3::bigint AND fill_id=$4::uuid AND status IN ('claimed','dispatching')`,
    [id.owner, id.key, epoch, claim.fillId, reason],
  );
}

/** The value is untrusted infrastructure input: invalid data must not become an ANN/evidence request. */
async function readCached(cache: QbankRetrievalCacheBackend, address: QbankRetrievalCacheAddress, k: number): Promise<QbankRetrievalHit[] | undefined> {
  return validHits(await cache.read(address, k), k);
}

function startLockHeartbeat(
  cache: QbankRetrievalCacheBackend, id: CacheIdentity, address: QbankRetrievalCacheAddress,
  lock: QbankRetrievalCacheLock,
): { stop(): Promise<boolean> } {
  let alive = true;
  let stopped = false;
  const leaseMs = id.leaseSeconds * 1000;
  const timer = setInterval(() => {
    if (stopped || !alive) return;
    void cache.renew(address, lock, leaseMs).then((redisAlive) => { alive = redisAlive; }).catch(() => { alive = false; });
  }, Math.max(1_000, Math.floor(leaseMs * 0.4)));
  timer.unref?.();
  return {
    async stop() { stopped = true; clearInterval(timer); return alive; },
  };
}

async function computeAnnAtEpoch(pool: DbPool, id: CacheIdentity, expectedEpoch: string, embedding: number[]): Promise<QbankRetrievalHit[] | undefined> {
  return asPrincipal(pool, id.owner, async (c) => {
    // The PG transaction contains only PG work: it snapshots epoch and ANN together. Redis publish happens after COMMIT.
    const lockedEpoch = await lockAndReadEpoch(c);
    if (lockedEpoch !== expectedEpoch) return undefined;
    return hybridQbankSearch(c, {
      query: id.query, embedding, k: id.k, expectedRecipeId: id.qbankRecipeId, retrievalMode: id.retrievalMode,
    });
  });
}

/**
 * Cross-instance qbank retrieval. PostgreSQL historical `qbank_retrieval_cache`
 * and `qbank_retrieval_inflight` are intentionally not read or written here;
 * they remain only for a separately governed rollback-retention window.
 */
export async function cachedQbankSearch(pool: DbPool, owner: string, input: CachedQbankSearchInput): Promise<CachedQbankSearchResult> {
  const key = qbankRetrievalCacheKey({ owner, query: input.query, k: input.k, embedderVersion: input.embedderVersion, qbankRecipeId: input.qbankRecipeId, retrievalMode: input.retrievalMode });
  const id: CacheIdentity = {
    owner, key, query: input.query, k: input.k, embedderVersion: input.embedderVersion,
    qbankRecipeId: input.qbankRecipeId, retrievalMode: input.retrievalMode ?? 'dense',
    ttlSeconds: clampInteger(input.ttlSeconds, DEFAULT_TTL_SECONDS, 5, 3600),
    leaseSeconds: clampInteger(input.leaseSeconds, DEFAULT_LEASE_SECONDS, 5, 60),
  };
  const waitMs = clampInteger(input.waitMs, DEFAULT_WAIT_MS, 100, 30_000);
  const deadline = Date.now() + waitMs;

  while (Date.now() <= deadline) {
    const epoch = await asPrincipal(pool, owner, readEpoch);
    const address = { cacheKey: id.key, corpusEpoch: epoch };
    const cached = await readCached(input.cache, address, id.k);
    if (cached) {
      // Do not return a value if the control-plane generation changed during the Redis read.
      const confirmedEpoch = await asPrincipal(pool, owner, readEpoch);
      if (confirmedEpoch === epoch) return { hits: cached, cacheStatus: 'hit' };
      continue;
    }

    const lock = await input.cache.acquire(address, id.leaseSeconds * 1000);
    if (!lock) {
      await new Promise<void>((resolve) => setTimeout(resolve, Math.min(50, Math.max(10, deadline - Date.now()))));
      continue;
    }
    let releaseLock = true;
    try {
      // Re-read after lock acquisition; another owner may have populated the value while this contender waited.
      const afterLock = await readCached(input.cache, address, id.k);
      if (afterLock) return { hits: afterLock, cacheStatus: 'hit' };
      const claimResult = await asPrincipal(pool, owner, (c) => claimFillIntent(c, id, epoch));
      if (claimResult.action === 'unknown') throw codeError('qbank_retrieval_fill_unknown');
      if (claimResult.action === 'wait') continue;
      const claim = claimResult.claim;
      if (!await asPrincipal(pool, owner, (c) => markFillDispatched(c, id, epoch, claim))) {
        throw codeError('qbank_retrieval_fill_lost');
      }
      const heartbeat = startLockHeartbeat(input.cache, id, address, lock);
      let keepIntent = false;
      let settledIntent = false;
      try {
        const vectors = await input.embed([id.query], { cacheKey: id.key, invocationId: claim.fillId, mode: 'claimed' });
        const embedding = vectors[0];
        if (!embedding?.length || !embedding.every(Number.isFinite)) throw codeError('qbank_retrieval_cache_invalid_embedding');
        if (!await asPrincipal(pool, owner, (c) => markFillSettled(c, id, epoch, claim))) {
          throw codeError('qbank_retrieval_fill_settle_failed');
        }
        settledIntent = true;
        keepIntent = true;
        // Once fencing is lost a producer has no permission to publish a value, even if its provider response arrived.
        if (!await heartbeat.stop()) throw codeError('qbank_retrieval_lock_lost');
        const hits = await computeAnnAtEpoch(pool, id, epoch, embedding);
        if (!hits) continue; // generation changed; old-epoch result must never be published under a new key.
        if (!await input.cache.publish(address, lock, hits, id.ttlSeconds * 1000)) {
          throw codeError('qbank_retrieval_lock_lost');
        }
        releaseLock = false; // fenced publish atomically deleted this lock.
        const cleared = await asPrincipal(pool, owner, (c) => clearFillIntent(c, id, epoch, claim));
        if (!cleared) throw codeError('qbank_retrieval_fill_clear_failed');
        return { hits, cacheStatus: 'miss' };
      } catch (error) {
        // Model adapters deliberately map any post-dispatch uncertainty to `external_outcome_unknown`.
        // Conservatively retain this durable id for every fill-owner error: automatically assigning a new id is worse
        // than a controlled no-local-RAG degradation because it can produce a second provider charge.
        keepIntent = true;
        if (!settledIntent) {
          const rawCode = (error as { code?: unknown } | undefined)?.code;
          const reason = typeof rawCode === 'string' && /^[A-Za-z0-9._:-]{1,120}$/.test(rawCode) ? rawCode : 'fill_owner_error';
          if (reason === 'rag_cost_budget_exhausted' || reason === 'rag_cost_policy_missing' || reason === 'rag_cost_price_missing') {
            // These three branches are returned by the ledger before its `mark_dispatched` boundary.
            keepIntent = !await asPrincipal(pool, owner, (c) => abandonUnsentFill(c, id, epoch, claim)).catch(() => true);
          } else {
            await asPrincipal(pool, owner, (c) => markFillUnknown(c, id, epoch, claim, reason)).catch(() => undefined);
          }
        }
        throw error;
      } finally {
        await heartbeat.stop();
        if (!keepIntent) await asPrincipal(pool, owner, (c) => clearFillIntent(c, id, epoch, claim)).catch(() => undefined);
      }
    } finally {
      if (releaseLock) await input.cache.release(address, lock).catch(() => undefined);
    }
  }
  throw codeError('qbank_retrieval_claim_timeout');
}
