/**
 * RAG-FUNNEL-04 / track-local retrieval dispatch seam（图内 planner 消费）。
 *
 * 把「Worker 固定技术岗 + 全局检索」升级为「按 InterviewRouteSnapshot 的
 * track-local 检索」：图内 planner 输出 `{leafTrackId, competencyId, difficulty}`
 * 已被 RAG-03 服务端校验过（必须属于 snapshot），本 seam 把它冻结成一个
 * `RetrievalPlan`，再以该 plan 的 leaf 作为 serving_scope 硬过滤检索。
 *
 * 承重边界（与 packages/db/migrations/0106_qbank_track_local_serving_scope.sql
 * 一一对应）：
 *  - 冻结：`RetrievalPlan` 内容（含 routeScopeDigest）先服务端校验「属于 snapshot」，
 *    再以 principal 作用域幂等键 `plan_key`（UNIQUE(owner, plan_key)）落库，同 plan
 *    重放 = noop，绝不二次外发。
 *  - CAS：prepared → dispatched → served / recheck_failed（`UPDATE … WHERE status=$from`
 *    条件更新，陈旧落败 = 0 行）。
 *  - 检索：`cachedQbankSearch(…, scope)` 把 `{taxonomyVersion, servingScopeId}` 经
 *    SET LOCAL GUC 传入 SECURITY DEFINER 检索函数，DB 层 `WHERE` 硬过滤在 ORDER BY/
 *    LIMIT **之前**（非全局 Top-K 后应用层剔除）。
 *  - 复核（recheck）：任何命中（尤其不可信 Redis cache hit）在成为模型材料前，
 *    必须经 `readGenerationQuestionChunkProjection` 权威重验「snapshot leaf ==
 *    plan leaf == 生成投影 leaf == 题面 metadata leaf + 元数据 hash 一致」，且
 *    active generation/recipe 与 plan 冻结值一致。任一失败 → recheck_failed，绝不
 *    写 question_ready、绝不回退同父兄弟叶/全库、绝不放出 legacy_unrouted。
 *  - 事务 outbox：qbank_retrieval_plan_event 单 owner 单调 event_seq（INSERT…SELECT
 *    MAX+1），同一事务内分配。
 *
 * 四条承重原语落点：① CAS（plan 状态机）② principal 作用域幂等（plan_key UNIQUE）
 * ③ RLS（qbank_retrieval_plan/event owner 策略 + 检索全程 asPrincipal）④ 事务
 * outbox + 单调 eventSeq。
 *
 * 分层纪律：schema 校验与 leaf ∈ allocations 判定归 domain（validateRetrievalPlan）；
 * 本层只把字段送进承重 SQL/检索并映射返回值，与 job-route-decision.ts 一致。
 * purpose/consent/privacy 谓词对系统拥有的 qbank 题库不适用（无逐用户 consent；
 * 这些谓词归 MEM-14 记忆召回）；qbank 侧由 generation/recipe/visible/RLS 承重。
 */
import type { PoolClient as Client } from 'pg';
import { asPrincipal, type DbPool } from './principal.ts';
import { getInterviewRouteSnapshot } from './job-route-decision.ts';
import { readGenerationQuestionChunkProjection } from './qbank-generation-projection.ts';
import {
  activeQbankGeneration, qbankQuestionResultsForHits,
  type QbankServingScopeInput, type QbankQuestionRetrievalResult,
} from './qbank-generation-retrieval.ts';
import {
  cachedQbankSearch, type QbankRetrievalCacheBackend,
  type QbankEmbeddingCallContext, type QbankCacheStatus,
} from './qbank-retrieval-cache.ts';
import { qbankMetadataHash, QBANK_ANNOTATION_SOURCES } from './qbank-ingest.ts';
import {
  deriveRetrievalPlanKey, validateRetrievalPlan,
  type RetrievalPlan, type RetrievalPlanStatus, type RetrievalPlanSnapshot,
} from '@meetwise/domain';

/** 图内一轮 track-local 检索的派发依赖（application service seam，非客户端 DTO）。 */
export interface DispatchTrackLocalRetrievalDeps {
  /** 本轮检索的 query 文本（来自图的当前轮上下文）。 */
  query: string;
  /** 查询 embedding 的 embedder 身份（进 cache key，隔离不同向量空间）。 */
  embedderVersion: string;
  k?: number;
  /** cache-fill owner 才调用；确定性 seam 由 proof 注入。 */
  embed: (texts: string[], context: QbankEmbeddingCallContext) => Promise<number[][]>;
  /** Redis 热缓存适配器（缺失/不可达 = 非 cache miss，fail-closed）。 */
  cache: QbankRetrievalCacheBackend;
}

export type DispatchTrackLocalRetrievalResult =
  | { status: 'served'; planId: string; cacheStatus: QbankCacheStatus; results: QbankQuestionRetrievalResult[]; recheckedRefs: number }
  | { status: 'recheck_failed'; planId: string; reason: string }
  | { status: 'replayed'; planId: string; planStatus: RetrievalPlanStatus }
  | { status: 'rejected'; reason: string };

function planScope(plan: RetrievalPlan): QbankServingScopeInput {
  return { taxonomyVersion: plan.taxonomyVersion, servingScopeId: plan.leafTrackId };
}

function codeError(code: string): Error { return Object.assign(new Error(code), { code }); }

/** 单 owner 单调 outbox：事务内 INSERT…SELECT MAX+1。 */
async function appendPlanEvent(
  c: Client, owner: string, planId: string,
  fromStatus: RetrievalPlanStatus | null, toStatus: RetrievalPlanStatus, reason: string | null,
): Promise<number> {
  const r = await c.query(
    `INSERT INTO qbank_retrieval_plan_event(owner_user_id, event_seq, plan_id, from_status, to_status, reason)
     SELECT $1, COALESCE(MAX(event_seq),0)+1, $2, $3, $4, $5
       FROM qbank_retrieval_plan_event WHERE owner_user_id=$1
     RETURNING event_seq`,
    [owner, planId, fromStatus, toStatus, reason],
  );
  return Number(r.rows[0]?.event_seq);
}

type FreezeResult =
  | { action: 'dispatch'; planId: string }
  | { action: 'replay'; planId: string; planStatus: RetrievalPlanStatus };

/**
 * 冻结 plan（幂等）+ CAS prepared→dispatched。同 plan_key 重放返回 replay，
 * 绝不二次外发；终态（served/recheck_failed/superseded）sticky 不重试；prepared/
 * dispatched（崩溃残留）可 reclaim。plan id 由 plan_key 确定性派生（同 plan → 同 id）。
 */
async function freezePlan(c: Client, owner: string, plan: RetrievalPlan): Promise<FreezeResult> {
  const key = deriveRetrievalPlanKey(plan);
  const planId = 'qrp-' + key;
  const ins = await c.query(
    `INSERT INTO qbank_retrieval_plan(
       id, owner_user_id, snapshot_id, route_scope_digest, leaf_track_id, taxonomy_version,
       competency_id, difficulty, seniority, question_kind, generation_id, recipe_id,
       policy_version, plan_key, status
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'prepared')
     ON CONFLICT (owner_user_id, plan_key) DO NOTHING
     RETURNING id`,
    [planId, owner, plan.snapshotId, plan.routeScopeDigest, plan.leafTrackId, plan.taxonomyVersion,
      plan.competencyId, plan.difficulty, plan.seniority ?? null, plan.questionKind ?? null,
      plan.generationId, plan.recipeId, plan.policyVersion, key],
  );
  if (ins.rowCount === 1) {
    const upd = await c.query(
      `UPDATE qbank_retrieval_plan SET status='dispatched', updated_at=clock_timestamp()
        WHERE id=$1 AND owner_user_id=$2 AND status='prepared'
        RETURNING id`,
      [planId, owner],
    );
    if (upd.rowCount !== 1) throw codeError('qbank_retrieval_plan_dispatch_cas_lost');
    await appendPlanEvent(c, owner, planId, 'prepared', 'dispatched', null);
    return { action: 'dispatch', planId };
  }
  const existing = await c.query(
    `SELECT id, status FROM qbank_retrieval_plan WHERE owner_user_id=$1 AND plan_key=$2 FOR UPDATE`,
    [owner, key],
  );
  const row = existing.rows[0] as { id: string; status: RetrievalPlanStatus } | undefined;
  if (!row) throw codeError('qbank_retrieval_plan_missing_after_conflict');
  if (row.status === 'served' || row.status === 'recheck_failed' || row.status === 'superseded') {
    return { action: 'replay', planId: row.id, planStatus: row.status };
  }
  if (row.status !== 'prepared' && row.status !== 'dispatched') {
    throw codeError('qbank_retrieval_plan_unknown_status');
  }
  const upd = await c.query(
    `UPDATE qbank_retrieval_plan SET status='dispatched', updated_at=clock_timestamp()
      WHERE id=$1 AND owner_user_id=$2 AND status IN ('prepared','dispatched')
      RETURNING id`,
    [row.id, owner],
  );
  if (upd.rowCount !== 1) throw codeError('qbank_retrieval_plan_dispatch_cas_lost');
  if (row.status === 'prepared') await appendPlanEvent(c, owner, row.id, 'prepared', 'dispatched', null);
  return { action: 'dispatch', planId: row.id };
}

/**
 * 复核权威（RAG-FUNNEL-04 recheck）：把检索命中的 chunk ref 对权威投影
 * `qbank_generation_chunk` 逐条重验。任一失败 = 跨 track / 被撤回 / 元数据伪造，
 * fail-closed 拒放行。这是「cache hit 在成为模型材料前必须重验」的承重实现。
 *
 * 覆盖谓词：
 *  - generation：active generation/recipe 必须等于 plan 冻结值（generation 竞态 → 拒）。
 *  - source/RLS：投影只读 active generation 的 visible 行；被撤回源 → visible=false → 拒。
 *  - leaf：投影 serving_scope_id/taxonomy_version 必须等于 plan leaf/taxonomy。
 *  - metadata hash：annotation_source 必须是 reviewed 枚举，且 cs.metadata_hash 重算一致。
 *  - artifact leaf：readGenerationQuestionChunkProjection 已抛
 *    qbank_projection_question_scope_mismatch 若题面附件 leaf 与投影 leaf 不一致。
 */
async function recheckHitsAtLeaf(
  pool: DbPool, owner: string, plan: RetrievalPlan, refs: readonly string[],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const active = await asPrincipal(pool, owner, activeQbankGeneration);
  if (active.generationId !== plan.generationId) return { ok: false, reason: 'generation_race' };
  if (active.recipeId !== plan.recipeId) return { ok: false, reason: 'recipe_mismatch' };

  const projections = await readGenerationQuestionChunkProjection(pool, {
    generationId: plan.generationId,
    servingScopeId: plan.leafTrackId,
    taxonomyVersion: plan.taxonomyVersion,
    refIds: [...refs],
  });
  const byRef = new Map(projections.map((p) => [p.refId, p]));
  for (const ref of refs) {
    const p = byRef.get(ref);
    if (!p) return { ok: false, reason: 'cross_track_or_revoked' };
    if (p.servingScopeId !== plan.leafTrackId) return { ok: false, reason: 'serving_scope_mismatch' };
    if (p.taxonomyVersion !== plan.taxonomyVersion) return { ok: false, reason: 'taxonomy_mismatch' };
    if (!p.visible) return { ok: false, reason: 'not_visible' };
    if (!(QBANK_ANNOTATION_SOURCES as readonly string[]).includes(p.annotationSource)) {
      return { ok: false, reason: 'unreviewed_annotation' };
    }
    const expectedHash = qbankMetadataHash('qbank-chunk-scope:v1', {
      taxonomyVersion: p.taxonomyVersion, servingScopeId: p.servingScopeId, annotationSource: p.annotationSource,
    });
    if (p.metadataHash !== expectedHash) return { ok: false, reason: 'metadata_hash_mismatch' };
  }
  return { ok: true };
}

async function finalizePlanServed(c: Client, owner: string, planId: string): Promise<void> {
  const upd = await c.query(
    `UPDATE qbank_retrieval_plan SET status='served', updated_at=clock_timestamp()
      WHERE id=$1 AND owner_user_id=$2 AND status='dispatched'
      RETURNING id`,
    [planId, owner],
  );
  if (upd.rowCount !== 1) throw codeError('qbank_retrieval_plan_served_cas_lost');
  await appendPlanEvent(c, owner, planId, 'dispatched', 'served', null);
}

async function finalizePlanRecheckFailed(c: Client, owner: string, planId: string, reason: string): Promise<void> {
  const upd = await c.query(
    `UPDATE qbank_retrieval_plan SET status='recheck_failed', updated_at=clock_timestamp()
      WHERE id=$1 AND owner_user_id=$2 AND status='dispatched'
      RETURNING id`,
    [planId, owner],
  );
  if (upd.rowCount !== 1) throw codeError('qbank_retrieval_plan_recheck_cas_lost');
  await appendPlanEvent(c, owner, planId, 'dispatched', 'recheck_failed', reason);
}

/**
 * 图内 planner 消费 seam：单叶、单轮、不混桶。多桶岗位由调用方按
 * `nextWeightedDeficitLeaf` 每轮选**单个** leaf 分别派发，绝不把多叶混进一次检索。
 */
export async function dispatchTrackLocalRetrieval(
  pool: DbPool,
  owner: string,
  plan: RetrievalPlan,
  deps: DispatchTrackLocalRetrievalDeps,
): Promise<DispatchTrackLocalRetrievalResult> {
  // Phase 1: 服务端校验 plan 属于不可变 snapshot（复用 RAG-03 validatePlannerOutput）。
  const snapshot = await asPrincipal(pool, owner, (c) => getInterviewRouteSnapshot(c, owner, plan.snapshotId));
  if (!snapshot) return { status: 'rejected', reason: 'snapshot_missing' };
  const planSnapshot: RetrievalPlanSnapshot = {
    interviewId: snapshot.interviewId,
    routeDigest: snapshot.routeDigest,
    allocations: snapshot.allocations,
  };
  const validated = validateRetrievalPlan(plan, planSnapshot);
  if (validated.ok === false) return { status: 'rejected', reason: validated.reason };

  // Phase 2: 冻结 + CAS prepared→dispatched（外发前的持久 claim）。
  const frozen = await asPrincipal(pool, owner, (c) => freezePlan(c, owner, plan));
  if (frozen.action === 'replay') return { status: 'replayed', planId: frozen.planId, planStatus: frozen.planStatus };

  // Phase 3: 检索（模型/cache I/O 一律在 DB 事务外）。
  const scope = planScope(plan);
  const search = await cachedQbankSearch(pool, owner, {
    query: deps.query,
    k: deps.k ?? 5,
    embedderVersion: deps.embedderVersion,
    qbankRecipeId: plan.recipeId,
    retrievalMode: 'dense',
    scope,
    cache: deps.cache,
    embed: deps.embed,
  });

  // Phase 4: 命中 refs 在成为模型材料前经权威投影重验。
  const refs = search.hits.map((h) => h.refId);
  const recheck = refs.length === 0 ? { ok: true as const } : await recheckHitsAtLeaf(pool, owner, plan, refs);
  if (recheck.ok === false) {
    await asPrincipal(pool, owner, (c) => finalizePlanRecheckFailed(c, owner, frozen.planId, recheck.reason));
    return { status: 'recheck_failed', planId: frozen.planId, reason: recheck.reason };
  }

  // Phase 5: 组装题面 artifact（二次可见性检查 + scope 过滤，安全空 = 优雅降级）。
  const results = await asPrincipal(pool, owner, (c) =>
    qbankQuestionResultsForHits(c, plan.recipeId, search.hits, 420, scope));

  // Phase 6: CAS dispatched→served + outbox。
  await asPrincipal(pool, owner, (c) => finalizePlanServed(c, owner, frozen.planId));
  return { status: 'served', planId: frozen.planId, cacheStatus: search.cacheStatus, results, recheckedRefs: refs.length };
}
