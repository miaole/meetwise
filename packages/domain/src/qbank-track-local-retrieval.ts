/**
 * RAG-FUNNEL-04 / track-local retrieval：冻结 `RetrievalPlan` + route scope digest 派生 +
 * 服务端校验（复用 RAG-03 planner 输出校验）。
 *
 * 零 IO、零模型、零 db —— 只做：
 *  - `routeScopeDigest`：把「某 snapshot 的 route_digest + 某 leaf + taxonomy 版本」钉成一个 digest，
 *    使 plan 结构上可证明「这一轮只读这个 snapshot 的这个 leaf」；
 *  - `deriveRetrievalPlanKey`：plan 内容的 canonical digest，作为 principal 作用域幂等键；
 *  - `validateRetrievalPlan`：plan 必须属于 snapshot（snapshotId 匹配 + leaf ∈ allocations + routeScopeDigest
 *    重派生一致 + generation/recipe 形状 + policy 版本），复用 RAG-03 `validatePlannerOutput` 的
 *    leaf/difficulty/competency 判定。
 *
 * 真实检索/召回由 `packages/db/src/qbank-track-local-retrieval.ts` 派发；本模块只冻结形状与校验。
 */
import { createHash } from 'node:crypto';
import {
  validatePlannerOutput, planInterviewTurn, JOB_ROUTE_TAXONOMY_VERSION,
  type JobRouteAllocation, type InterviewPlannerOutput,
} from './job-route-classifier.ts';

/** RAG-04 冻结的检索派发策略版本。改此值 = 改检索派发语义，必须升版本。 */
export const RETRIEVAL_POLICY_VERSION = 'rag04-track-local:v1';

/** RetrievalPlan 状态机（显式 enum；CAS from→to）。 */
export const RETRIEVAL_PLAN_STATUSES = ['prepared', 'dispatched', 'served', 'recheck_failed', 'superseded'] as const;
export type RetrievalPlanStatus = (typeof RETRIEVAL_PLAN_STATUSES)[number];

const SNAPSHOT_ID = /^[A-Za-z0-9:_-]{1,160}$/;
const GENERATION_ID = /^qgen-[0-9a-f-]{36}$/;
const RECIPE_ID = /^qrecipe-[0-9a-f]{32}$/;
const TAXONOMY_VERSION = /^v[1-9][0-9]{0,15}$/;
const LEAF = /^[a-z][a-z0-9_]*(\/[a-z][a-z0-9_]*){0,3}$/;
const FACET = /^[^\x00-\x1f\x7f]{1,64}$/;

/**
 * 图内一轮 track-local 检索的冻结计划。`seniority`/`questionKind` 是 RAG-01/02
 * QuestionArtifactMetadata 的 facet 维度，当前 RAG-03 planner 不产出它们；此处仅作为
 * facet 透传字段（可选 + 形状校验），**权威枚举归 RAG-01/02**，RAG-04 不发明枚举。
 * `leafTrackId` 与 serving_scope_id 是同一字符串（如 `backend/nodejs`）。
 */
export interface RetrievalPlan {
  snapshotId: string;
  routeScopeDigest: string;
  leafTrackId: string;
  taxonomyVersion: string;
  competencyId: string;
  difficulty: number;
  seniority?: string;
  questionKind?: string;
  generationId: string;
  recipeId: string;
  policyVersion: string;
}

/** snapshot 侧为校验所需的最小视图（与 db 层 InterviewRouteSnapshotView 对应）。 */
export interface RetrievalPlanSnapshot {
  interviewId: string;
  routeDigest: string;
  allocations: readonly JobRouteAllocation[];
}

/** 把「某 snapshot 的某 leaf 的某 taxonomy 版本」钉成 route scope digest。 */
export function deriveRouteScopeDigest(input: {
  routeDigest: string;
  leafTrackId: string;
  taxonomyVersion: string;
}): string {
  return createHash('sha256').update(JSON.stringify({
    v: 'route-scope:v1',
    routeDigest: input.routeDigest,
    leafTrackId: input.leafTrackId,
    taxonomyVersion: input.taxonomyVersion,
  })).digest('hex');
}

/** plan 内容的 canonical digest，作为 principal 作用域幂等键（同 plan → 同 key → 幂等 noop）。 */
export function deriveRetrievalPlanKey(plan: RetrievalPlan): string {
  return createHash('sha256').update(JSON.stringify({
    v: 'retrieval-plan-key:v1',
    snapshotId: plan.snapshotId,
    routeScopeDigest: plan.routeScopeDigest,
    leafTrackId: plan.leafTrackId,
    taxonomyVersion: plan.taxonomyVersion,
    competencyId: plan.competencyId,
    difficulty: plan.difficulty,
    seniority: plan.seniority ?? null,
    questionKind: plan.questionKind ?? null,
    generationId: plan.generationId,
    recipeId: plan.recipeId,
    policyVersion: plan.policyVersion,
  })).digest('hex');
}

export type ValidateRetrievalPlanResult = { ok: true } | { ok: false; reason: string };

/**
 * 服务端校验：plan 必须属于 snapshot（snapshotId 匹配 + leaf ∈ allocations + routeScopeDigest
 * 重派生一致 + generation/recipe 形状 + policy 版本）。复用 RAG-03 `validatePlannerOutput`
 * 做 leaf/difficulty/competency 判定，避免两处校验语义漂移。
 */
export function validateRetrievalPlan(
  plan: RetrievalPlan,
  snapshot: RetrievalPlanSnapshot,
): ValidateRetrievalPlanResult {
  if (!plan || typeof plan !== 'object') return { ok: false, reason: 'invalid_schema' };
  if (!snapshot || typeof snapshot !== 'object' || !Array.isArray(snapshot.allocations)) {
    return { ok: false, reason: 'invalid_snapshot' };
  }
  if (typeof plan.snapshotId !== 'string' || !SNAPSHOT_ID.test(plan.snapshotId)) return { ok: false, reason: 'snapshot_id_invalid' };
  if (plan.snapshotId !== snapshot.interviewId) return { ok: false, reason: 'snapshot_mismatch' };
  if (typeof plan.routeScopeDigest !== 'string' || !/^[0-9a-f]{64}$/.test(plan.routeScopeDigest)) return { ok: false, reason: 'route_scope_digest_invalid' };
  if (typeof plan.leafTrackId !== 'string' || !LEAF.test(plan.leafTrackId)) return { ok: false, reason: 'leaf_invalid' };
  if (typeof plan.taxonomyVersion !== 'string' || !TAXONOMY_VERSION.test(plan.taxonomyVersion)) return { ok: false, reason: 'taxonomy_invalid' };
  if (plan.taxonomyVersion !== JOB_ROUTE_TAXONOMY_VERSION) return { ok: false, reason: 'taxonomy_not_current' };

  // 复用 RAG-03 planner 校验：leaf 必须属于 snapshot、difficulty 1..5、competencyId 形状。
  const planner = validatePlannerOutput(
    { leafTrackId: plan.leafTrackId, competencyId: plan.competencyId, difficulty: plan.difficulty },
    snapshot.allocations,
  );
  if (planner.ok === false) return { ok: false, reason: `planner_${planner.reason}` };

  // routeScopeDigest 必须与 snapshot 重派生一致（否则是伪造/陈旧 leaf 绑定）。
  const expected = deriveRouteScopeDigest({
    routeDigest: snapshot.routeDigest, leafTrackId: plan.leafTrackId, taxonomyVersion: plan.taxonomyVersion,
  });
  if (plan.routeScopeDigest !== expected) return { ok: false, reason: 'route_scope_digest_mismatch' };

  if (typeof plan.generationId !== 'string' || !GENERATION_ID.test(plan.generationId)) return { ok: false, reason: 'generation_id_invalid' };
  if (typeof plan.recipeId !== 'string' || !RECIPE_ID.test(plan.recipeId)) return { ok: false, reason: 'recipe_id_invalid' };
  if (typeof plan.policyVersion !== 'string' || plan.policyVersion !== RETRIEVAL_POLICY_VERSION) return { ok: false, reason: 'policy_version_invalid' };

  if (plan.seniority != null && (typeof plan.seniority !== 'string' || !FACET.test(plan.seniority))) return { ok: false, reason: 'seniority_invalid' };
  if (plan.questionKind != null && (typeof plan.questionKind !== 'string' || !FACET.test(plan.questionKind))) return { ok: false, reason: 'question_kind_invalid' };

  return { ok: true };
}


/**
 * Assemble a full `RetrievalPlan` from a real planner output + snapshot +
 * generation/recipe identities. Does **not** invent generationId/recipeId and
 * does **not** stuff snapshot max-bps primary leaf without planner (P-FAKEPLAN).
 *
 * Callers must still run `validateRetrievalPlan` (or use
 * `assembleValidatedRetrievalPlan` which fail-closes).
 */
export function buildRetrievalPlanFromPlannerOutput(input: {
  planner: InterviewPlannerOutput;
  snapshot: RetrievalPlanSnapshot;
  generationId: string;
  recipeId: string;
  taxonomyVersion?: string;
  policyVersion?: string;
  seniority?: string;
  questionKind?: string;
}): RetrievalPlan {
  const taxonomyVersion = input.taxonomyVersion ?? JOB_ROUTE_TAXONOMY_VERSION;
  const policyVersion = input.policyVersion ?? RETRIEVAL_POLICY_VERSION;
  const plan: RetrievalPlan = {
    snapshotId: input.snapshot.interviewId,
    routeScopeDigest: deriveRouteScopeDigest({
      routeDigest: input.snapshot.routeDigest,
      leafTrackId: input.planner.leafTrackId,
      taxonomyVersion,
    }),
    leafTrackId: input.planner.leafTrackId,
    taxonomyVersion,
    competencyId: input.planner.competencyId,
    difficulty: input.planner.difficulty,
    generationId: input.generationId,
    recipeId: input.recipeId,
    policyVersion,
  };
  if (input.seniority != null) plan.seniority = input.seniority;
  if (input.questionKind != null) plan.questionKind = input.questionKind;
  return plan;
}

export type AssembleValidatedRetrievalPlanResult =
  | { ok: true; plan: RetrievalPlan; planner: InterviewPlannerOutput; deficit: number[]; leafIndex: number }
  | { ok: false; reason: string; stage: 'snapshot' | 'planner' | 'plan' };

/**
 * Production-capable fail-closed path (P-PLANNER T1–T4 / T6):
 *   planInterviewTurn → validatePlannerOutput → buildRetrievalPlan → validateRetrievalPlan.
 *
 * Missing/illegal snapshot → `route_snapshot_missing` (G-R2-5; never unscoped).
 * Planner/plan validation failure → no RetrievalPlan (no retrieve; no hard-stuff primary leaf).
 * Requires real generationId + recipeId shapes (P-FAKEPLAN ban).
 */
export function assembleValidatedRetrievalPlan(input: {
  snapshot: RetrievalPlanSnapshot | null | undefined;
  deficit: readonly number[];
  competencyId: string;
  difficulty: number;
  generationId: string;
  recipeId: string;
  taxonomyVersion?: string;
  policyVersion?: string;
  seniority?: string;
  questionKind?: string;
}): AssembleValidatedRetrievalPlanResult {
  if (!input || typeof input !== 'object') {
    return { ok: false, reason: 'invalid_schema', stage: 'snapshot' };
  }
  const snapshot = input.snapshot;
  if (
    !snapshot
    || typeof snapshot !== 'object'
    || typeof snapshot.interviewId !== 'string'
    || snapshot.interviewId.length < 1
    || typeof snapshot.routeDigest !== 'string'
    || snapshot.routeDigest.length < 1
    || !Array.isArray(snapshot.allocations)
    || snapshot.allocations.length === 0
  ) {
    return { ok: false, reason: 'route_snapshot_missing', stage: 'snapshot' };
  }

  // P-FAKEPLAN: refuse to assemble without generation/recipe identities up front.
  if (typeof input.generationId !== 'string' || input.generationId.length < 1
    || typeof input.recipeId !== 'string' || input.recipeId.length < 1) {
    return { ok: false, reason: 'generation_or_recipe_missing', stage: 'plan' };
  }

  const deficit = Array.isArray(input.deficit) && input.deficit.length === snapshot.allocations.length
    ? input.deficit
    : snapshot.allocations.map(() => 0);

  const planned = planInterviewTurn({
    allocations: snapshot.allocations,
    deficit,
    competencyId: input.competencyId,
    difficulty: input.difficulty,
  });
  if (planned.ok === false) {
    const stage = planned.reason === 'route_snapshot_missing' ? 'snapshot' : 'planner';
    return { ok: false, reason: planned.reason, stage };
  }

  const plan = buildRetrievalPlanFromPlannerOutput({
    planner: planned.output,
    snapshot,
    generationId: input.generationId,
    recipeId: input.recipeId,
    taxonomyVersion: input.taxonomyVersion,
    policyVersion: input.policyVersion,
    seniority: input.seniority,
    questionKind: input.questionKind,
  });
  const validated = validateRetrievalPlan(plan, snapshot);
  if (validated.ok === false) {
    return { ok: false, reason: validated.reason, stage: 'plan' };
  }
  return {
    ok: true,
    plan,
    planner: planned.output,
    deficit: planned.deficit,
    leafIndex: planned.leafIndex,
  };
}


/**
 * R4 wrong_track=0 ADV — production-capable assert hooks (pure domain; zero IO).
 *
 * Served hits that declare a leaf/track must match the plan leaf. Missing track
 * metadata counts as wrong (fail-closed). Recheck reasons listed below are the
 * fail-closed predicates that must never become served/question_ready material.
 *
 * Honesty: assert green ≠ R4 closed ≠ NHP-R4-ADV-01 covered; wire green ≠ ADV.
 */
export const R4_WRONG_TRACK_RECHECK_REASONS = [
  'cross_track_or_revoked',
  'serving_scope_mismatch',
  'taxonomy_mismatch',
  'metadata_hash_mismatch',
  'unreviewed_annotation',
  'generation_race',
  'recipe_mismatch',
  'not_visible',
] as const;

export type R4WrongTrackRecheckReason = (typeof R4_WRONG_TRACK_RECHECK_REASONS)[number];

export type WrongTrackHit = {
  ref: string;
  /** Declared serving leaf/track for this hit when known. */
  leafTrackId?: string | null;
  servingScopeId?: string | null;
};

export function declaredHitTrackId(hit: WrongTrackHit): string | null {
  const raw = hit.leafTrackId ?? hit.servingScopeId;
  if (typeof raw !== 'string') return null;
  const t = raw.trim();
  return t.length > 0 ? t : null;
}

/**
 * Count hits whose declared track differs from the allowed plan leaf.
 * Missing/empty track metadata counts as wrong (fail-closed; forged/missing metadata).
 */
export function countWrongTrackHits(
  hits: readonly WrongTrackHit[],
  allowedLeafTrackId: string,
): number {
  if (!Array.isArray(hits)) return 0;
  if (typeof allowedLeafTrackId !== 'string' || allowedLeafTrackId.trim().length < 1) {
    return hits.length;
  }
  const allowed = allowedLeafTrackId.trim();
  let n = 0;
  for (const h of hits) {
    const t = declaredHitTrackId(h);
    if (t === null || t !== allowed) n++;
  }
  return n;
}

export function assertWrongTrackZero(
  hits: readonly WrongTrackHit[],
  allowedLeafTrackId: string,
): { ok: true; wrongTrack: 0 } | { ok: false; wrongTrack: number } {
  const wrongTrack = countWrongTrackHits(hits, allowedLeafTrackId);
  return wrongTrack === 0
    ? { ok: true, wrongTrack: 0 }
    : { ok: false, wrongTrack };
}

export function isFailClosedWrongTrackRecheckReason(reason: string): boolean {
  return typeof reason === 'string'
    && (R4_WRONG_TRACK_RECHECK_REASONS as readonly string[]).includes(reason);
}
