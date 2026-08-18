/**
 * RAG-FUNNEL-06 / route-scope 缓存 + provenance + 撤销隔离的 db 控制面。
 *
 * 承重边界（与 packages/db/migrations/0113_qbank_route_scope_cache.sql 一一对应）：
 *  - retrieval-result / singleflight 热缓存键全部 HMAC 绑定 routeScopeCacheDigest（七面：
 *    routeScopeDigest / leaf / taxonomy / generationId / recipeId / privacyEpoch / aclDigest），
 *    结构上不可能跨桶 replay（桶 A 的 key ≠ 桶 B 的 key）。两个命名空间（value / singleflight）
 *    分离，防值锁碰撞。
 *  - durable negative-result cache 的权威判定在 PG 行/epoch CAS（非进程内 Map）：
 *    `recordRouteScopeNegativeResult` 冻结时读 active generation + qbank_cache_epoch 存快照；
 *    `readRouteScopeNegativeResult` 命中时**同一事务**重读 active generation / qbank_cache_epoch /
 *    live privacy epoch，mismatch → CAS active→superseded（version+1）+ outbox receipt → 返回 stale，
 *    **绝不** replay 旧 negative verdict（故调用方不得据此跳过重新检索或派发 fallback）。
 *  - `revalidateRouteScopeCacheHit` 是命中水合重验：命中只回 ref/distance，正文/向量从 PG 的
 *    evidence 二段可见性（qbankQuestionResultsForHits）重读、绝不经缓存；generation/epoch 变 →
 *    generation_stale / corpus_epoch_changed（旧命中不得出题、不得派发 fallback）。
 *
 * 四条承重原语落点：① asPrincipal（全部事务，RLS owner=principal）② CAS（active→superseded，
 * version 单调 +1，对齐 0111 version CAS）③ append-only outbox（qbank_route_scope_cache_event，
 * INSERT…SELECT MAX+1，对齐 0104/0106/0110 的 event outbox，不重造 appendEvent——本面不是
 * interview_event）④ lease 有意不用——命中重验由 epoch CAS 承重（非租约语义）。
 *
 * 分层纪律：形状校验归 domain（validateRouteScopeCacheFacets）；本层只把字段送进承重 SQL 并映射返回值。
 */
import { createHmac, randomUUID } from 'node:crypto';
import type { PoolClient as Client } from 'pg';
import { asPrincipal, type DbPool } from './principal.ts';
import {
  activeQbankGeneration, qbankQuestionResultsForHits,
  type QbankQuestionRetrievalResult, type QbankServingScopeInput,
} from './qbank-generation-retrieval.ts';
import type { QbankRetrievalHit } from './qbank-retrieval-cache.ts';
import {
  deriveRouteScopeCacheDigest, validateRouteScopeCacheFacets,
  type RouteScopeCacheFacets, type NegativeResultStatus, type NegativeResultVerdict,
} from '@meetwise/domain';

const CACHE_KEY_VERSION = 'route-scope-retrieval-cache:v1';
const SINGLEFLIGHT_KEY_VERSION = 'route-scope-singleflight:v1';
const MAX_QUERY_CHARS = 12_000;
const MAX_EMBEDDER_VERSION_CHARS = 256;

/** retrieval-result + singleflight 共用输入（owner 之外全部进 HMAC，键只含 opaque digest，不进 Redis 明文）。 */
export interface RouteScopeRetrievalCacheKeyInput {
  owner: string;
  /** 七面绑定的 canonical cache 身份（domain deriveRouteScopeCacheDigest）。 */
  routeScopeCacheDigest: string;
  query: string;
  k: number;
  embedderVersion: string;
  retrievalMode?: 'dense' | 'rrf';
}

function validateKeyInput(input: RouteScopeRetrievalCacheKeyInput): void {
  if (!input.owner || input.owner.length > 512) throw new Error('qbank_route_scope_cache_invalid_owner');
  if (!/^[0-9a-f]{64}$/.test(input.routeScopeCacheDigest)) throw new Error('qbank_route_scope_cache_invalid_digest');
  if (!input.query || input.query.length > MAX_QUERY_CHARS) throw new Error('qbank_route_scope_cache_invalid_query');
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > 50) throw new Error('qbank_route_scope_cache_invalid_k');
  if (!input.embedderVersion || input.embedderVersion.length > MAX_EMBEDDER_VERSION_CHARS) throw new Error('qbank_route_scope_cache_invalid_embedder_version');
}

function hmacKey(secret: string, version: string, input: RouteScopeRetrievalCacheKeyInput): string {
  return createHmac('sha256', secret).update(JSON.stringify({
    v: version,
    owner: input.owner,
    routeScopeCacheDigest: input.routeScopeCacheDigest,
    embedderVersion: input.embedderVersion,
    retrievalMode: input.retrievalMode ?? 'dense',
    k: input.k,
    query: input.query,
  })).digest('hex');
}

/**
 * retrieval-result 热缓存键：HMAC 绑定 routeScopeCacheDigest（七面）。只允许专用 HMAC 密钥，
 * 绝不回退 auth/model 密钥（否则凭据轮换会静默失效一个成本敏感缓存，且把两个不相干的爆炸半径耦合）。
 */
export function routeScopeRetrievalCacheKey(input: RouteScopeRetrievalCacheKeyInput): string {
  validateKeyInput(input);
  const secret = process.env.RAG_QBANK_CACHE_HASH_KEY;
  if (!secret || secret.length < 32) throw new Error('qbank_route_scope_cache_hash_key_missing');
  return hmacKey(secret, CACHE_KEY_VERSION, input);
}

/** singleflight fill 键：同一七面身份、独立命名空间，防值/锁键碰撞（对齐 cachedQbankSearch 的单飞锁语义）。 */
export function routeScopeSingleflightKey(input: RouteScopeRetrievalCacheKeyInput): string {
  validateKeyInput(input);
  const secret = process.env.RAG_QBANK_CACHE_HASH_KEY;
  if (!secret || secret.length < 32) throw new Error('qbank_route_scope_cache_hash_key_missing');
  return hmacKey(secret, SINGLEFLIGHT_KEY_VERSION, input);
}

/** 单 owner 单调 append-only outbox：事务内 INSERT…SELECT MAX+1（撤销 receipt 承载 active→superseded）。 */
async function appendCacheEvent(
  c: Client, owner: string, cacheDigest: string,
  fromStatus: NegativeResultStatus | null, toStatus: NegativeResultStatus, reason: string | null,
): Promise<number> {
  const r = await c.query(
    `INSERT INTO qbank_route_scope_cache_event(owner_user_id, event_seq, cache_digest, from_status, to_status, reason)
     SELECT $1, COALESCE(MAX(event_seq),0)+1, $2, $3, $4, $5
       FROM qbank_route_scope_cache_event WHERE owner_user_id=$1
     RETURNING event_seq`,
    [owner, cacheDigest, fromStatus, toStatus, reason],
  );
  return Number(r.rows[0]?.event_seq);
}

/** qbank_cache_epoch 读（app_role 可读；epoch 用 text 形式避免 bigint→number 精度损失）。 */
async function readCacheEpoch(c: Client): Promise<string> {
  const r = await c.query('SELECT epoch::text AS epoch FROM qbank_cache_epoch WHERE singleton=true');
  if (r.rowCount !== 1 || typeof r.rows[0]?.epoch !== 'string') throw new Error('qbank_route_scope_cache_epoch_missing');
  return r.rows[0].epoch;
}

export interface RecordRouteScopeNegativeResultDeps {
  verdict: NegativeResultVerdict;
  verdictDigest: string;
}

export type RecordRouteScopeNegativeResultResult =
  | { status: 'recorded'; cacheKey: string }
  | { status: 'replayed'; cacheStatus: NegativeResultStatus }
  | { status: 'rejected'; reason: string };

/**
 * 冻结 durable negative-result：同 (owner, route_scope_cache_digest, corpus_epoch) 幂等
 * （ON CONFLICT DO NOTHING）。corpus_epoch 是 negative-result 的**时态身份**：同一 route scope 在
 * 不同语料 epoch 下「无合格题」是不同事实，故把它纳入幂等键——epoch 变后 re-record 落新行，绝不被
 * 旧 epoch 行挡住。冻结时读 active generation + qbank_cache_epoch 存快照；facets 的 generation/recipe
 * 必须等于 live active（否则已是陈旧负结果，拒录，绝不缓存一个立即失效的 negative）。同时把同 digest
 * 下**旧 epoch 的 active 行**先 CAS superseded（维护「每 (owner,digest) 至多一行 active」不变量）。
 */
export async function recordRouteScopeNegativeResult(
  pool: DbPool, owner: string, facets: RouteScopeCacheFacets, deps: RecordRouteScopeNegativeResultDeps,
): Promise<RecordRouteScopeNegativeResultResult> {
  const validated = validateRouteScopeCacheFacets(facets);
  if (validated.ok === false) return { status: 'rejected', reason: validated.reason };
  if (!/^[0-9a-f]{64}$/.test(deps.verdictDigest)) return { status: 'rejected', reason: 'verdict_digest_invalid' };

  const digest = deriveRouteScopeCacheDigest(facets);
  return asPrincipal(pool, owner, async (c) => {
    const active = await activeQbankGeneration(c);
    if (active.generationId !== facets.generationId || active.recipeId !== facets.recipeId) {
      return { status: 'rejected', reason: 'generation_stale' } as const;
    }
    const corpusEpoch = await readCacheEpoch(c);
    // 维护不变量：同 digest 下旧 epoch 的 active 行先作废（epoch 已变，旧「无合格题」事实失效）。
    const older = await c.query(
      `UPDATE qbank_route_scope_negative_result
          SET status='superseded', version=version+1, updated_at=clock_timestamp()
        WHERE owner_user_id=$1 AND route_scope_cache_digest=$2 AND status='active' AND corpus_epoch <> $3::bigint
        RETURNING id`,
      [owner, digest, corpusEpoch],
    );
    for (const row of older.rows) {
      await appendCacheEvent(c, owner, digest, 'active', 'superseded', 'superseded_by_re_record');
    }
    const id = 'nr-' + randomUUID();
    const ins = await c.query(
      `INSERT INTO qbank_route_scope_negative_result(
         id, owner_user_id, route_scope_cache_digest, route_scope_digest, leaf_track_id, taxonomy_version,
         generation_id, recipe_id, privacy_epoch, acl_digest, corpus_epoch, verdict, verdict_digest, status, version
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::bigint,$12,$13,'active',1)
       ON CONFLICT (owner_user_id, route_scope_cache_digest, corpus_epoch) DO NOTHING
       RETURNING id`,
      [id, owner, digest, facets.routeScopeDigest, facets.leafTrackId, facets.taxonomyVersion,
        facets.generationId, facets.recipeId, facets.privacyEpoch, facets.aclDigest, corpusEpoch,
        deps.verdict, deps.verdictDigest],
    );
    if (ins.rowCount === 1) {
      await appendCacheEvent(c, owner, digest, null, 'active', null);
      return { status: 'recorded', cacheKey: digest } as const;
    }
    const ex = await c.query(
      'SELECT status FROM qbank_route_scope_negative_result WHERE owner_user_id=$1 AND route_scope_cache_digest=$2 AND corpus_epoch=$3::bigint',
      [owner, digest, corpusEpoch],
    );
    return { status: 'replayed', cacheStatus: (ex.rows[0]?.status ?? 'active') as NegativeResultStatus } as const;
  });
}

export interface RouteScopeNegativeResultLive {
  /** 面试当前的 resume privacy epoch（调用方从 interview 表读，本面不反解 routeScopeDigest 回 snapshot）。 */
  privacyEpoch: number;
}

export type ReadRouteScopeNegativeResultResult =
  | { status: 'hit'; verdict: NegativeResultVerdict; verdictDigest: string }
  | { status: 'miss' }
  | { status: 'stale'; reason: string };

/**
 * 命中重验（权威判定在 PG 行/epoch CAS）：同一事务重读 active generation / qbank_cache_epoch /
 * live privacy epoch，与冻结快照比对。mismatch → CAS active→superseded（version+1）+ outbox receipt
 * → 返回 stale。旧 negative verdict **绝不** replay（stale 后调用方必须重新检索，不得据此派发 fallback）。
 */
export async function readRouteScopeNegativeResult(
  pool: DbPool, owner: string, facets: RouteScopeCacheFacets, live: RouteScopeNegativeResultLive,
): Promise<ReadRouteScopeNegativeResultResult> {
  const validated = validateRouteScopeCacheFacets(facets);
  if (validated.ok === false) return { status: 'stale', reason: validated.reason };
  const digest = deriveRouteScopeCacheDigest(facets);

  return asPrincipal(pool, owner, async (c) => {
    const active = await activeQbankGeneration(c);
    const corpusEpoch = await readCacheEpoch(c);
    const row = await c.query(
      `SELECT id, generation_id, recipe_id, privacy_epoch::text AS privacy_epoch, corpus_epoch::text AS corpus_epoch,
              verdict, verdict_digest, status, version
         FROM qbank_route_scope_negative_result
        WHERE owner_user_id=$1 AND route_scope_cache_digest=$2 AND status='active'
        FOR UPDATE`,
      [owner, digest],
    );
    const r = row.rows[0] as
      | { id: string; generation_id: string; recipe_id: string; privacy_epoch: string; corpus_epoch: string;
          verdict: string; verdict_digest: string; status: string; version: string }
      | undefined;
    if (!r || r.status === 'superseded') return { status: 'miss' } as const;

    const reason = r.generation_id !== active.generationId || r.recipe_id !== active.recipeId
      ? 'generation_stale'
      : r.corpus_epoch !== corpusEpoch
        ? 'corpus_epoch_changed'
        : Number(r.privacy_epoch) !== live.privacyEpoch
          ? 'privacy_epoch_changed'
          : null;

    if (reason) {
      // CAS active→superseded（version+1）；只有 status='active' 的旧行被作废，sticky 不二次迁移。
      const upd = await c.query(
        `UPDATE qbank_route_scope_negative_result
            SET status='superseded', version=version+1, updated_at=clock_timestamp()
          WHERE id=$1 AND owner_user_id=$2 AND status='active'
          RETURNING id`,
        [r.id, owner],
      );
      if (upd.rowCount === 1) await appendCacheEvent(c, owner, digest, 'active', 'superseded', reason);
      return { status: 'stale', reason } as const;
    }
    return { status: 'hit', verdict: r.verdict as NegativeResultVerdict, verdictDigest: r.verdict_digest } as const;
  });
}

export type SupersedeRouteScopeNegativeResultsResult =
  | { status: 'superseded'; count: number }
  | { status: 'none' };

/**
 * 撤销控制面（source 撤销 / generation 切换 / 隐私删除后的显式作废）：把该 (owner, digest) 下所有
 * active 行 CAS active→superseded（version+1）+ outbox receipt。撤销不需物理删除（本表只存 digest，
 * 无 PII），故不走 0111 deletion sink。
 */
export async function supersedeRouteScopeNegativeResults(
  pool: DbPool, owner: string, facets: RouteScopeCacheFacets,
): Promise<SupersedeRouteScopeNegativeResultsResult> {
  const validated = validateRouteScopeCacheFacets(facets);
  if (validated.ok === false) return { status: 'none' };
  const digest = deriveRouteScopeCacheDigest(facets);
  return asPrincipal(pool, owner, async (c) => {
    const upd = await c.query(
      `UPDATE qbank_route_scope_negative_result
          SET status='superseded', version=version+1, updated_at=clock_timestamp()
        WHERE owner_user_id=$1 AND route_scope_cache_digest=$2 AND status='active'
        RETURNING id`,
      [owner, digest],
    );
    for (const row of upd.rows) {
      await appendCacheEvent(c, owner, digest, 'active', 'superseded', 'explicit_revoke');
    }
    const count = Number(upd.rowCount ?? 0);
    return count > 0 ? { status: 'superseded', count } as const : { status: 'none' } as const;
  });
}

/** 命中水合时声称的冻结事实（generation/recipe + 填充时 epoch），用于同事务重验。 */
export interface RouteScopeCacheHitFrozen {
  generationId: string;
  recipeId: string;
  corpusEpoch: string;
}

export type RevalidateRouteScopeCacheHitResult =
  | { ok: true; results: QbankQuestionRetrievalResult[] }
  | { ok: false; reason: string };

/**
 * 命中水合重验：cache 命中只携带 ref/distance（QbankRetrievalHit，无正文/向量）；正文/向量一律从
 * PG 的 evidence 二段可见性（qbankQuestionResultsForHits，SECURITY DEFINER 重查 active generation +
 * source 可见性 + RLS + serving scope）重读。generation/epoch 变 → generation_stale /
 * corpus_epoch_changed（旧命中不得出题、不得派发 fallback）。
 */
export async function revalidateRouteScopeCacheHit(
  pool: DbPool, owner: string, frozen: RouteScopeCacheHitFrozen,
  hits: readonly QbankRetrievalHit[], scope?: QbankServingScopeInput,
): Promise<RevalidateRouteScopeCacheHitResult> {
  if (!/^qgen-[0-9a-f-]{36}$/.test(frozen.generationId)) return { ok: false, reason: 'generation_id_invalid' };
  if (!/^qrecipe-[0-9a-f]{32}$/.test(frozen.recipeId)) return { ok: false, reason: 'recipe_id_invalid' };
  return asPrincipal(pool, owner, async (c) => {
    const active = await activeQbankGeneration(c);
    if (active.generationId !== frozen.generationId || active.recipeId !== frozen.recipeId) {
      return { ok: false, reason: 'generation_stale' } as const;
    }
    const corpusEpoch = await readCacheEpoch(c);
    if (corpusEpoch !== frozen.corpusEpoch) return { ok: false, reason: 'corpus_epoch_changed' } as const;
    const results = await qbankQuestionResultsForHits(c, frozen.recipeId, hits, 420, scope);
    return { ok: true, results } as const;
  });
}
