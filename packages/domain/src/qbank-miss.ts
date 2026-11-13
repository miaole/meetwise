/**
 * RAG-FUNNEL-05 / LLM 同桶生成题：纯领域原语（零 IO、零模型、零 db）。
 *
 * 只做：
 *  - `deriveNoEligibleVerdictDigest`：把「clean no_eligible_in_scope」终态钉成 canonical digest。
 *    只有干净无题才可派发模型；qbank_degraded / policy_denied / generation_stale 结构上**不是**
 *    这个 digest，伪造/降级 verdict 在服务端重派生时即被拒（E3/E5）。
 *  - `deriveQuestionPlanKey`：QuestionPlan 内容的 canonical digest，作为 principal 作用域幂等键。
 *  - `deriveGeneratedQuestionDigest`：生成题正文的 canonical digest（去重 + question 身份）。
 *  - `validateQuestionPlan`：plan 必须属于 snapshot（复用 RAG-03 validatePlannerOutput + RAG-04
 *    deriveRouteScopeDigest），并复检 noEligibleVerdictDigest / rubric / blueprint / policy 版本。
 *  - `validateGeneratedQuestion`：模型结构化输出的服务端双重校验（schema → business）——
 *    schema 形状、refs 必须为空、长度、非引导、语言、去重。
 *
 * 真实模型外发归 MODEL-OP-01 typed binding；本模块只暴露受控确定性 seam 与校验。
 */
import { createHash } from 'node:crypto';
import {
  validatePlannerOutput, isServingTaxonomyForLeaf, type JobRouteAllocation,
} from './job-route-classifier.ts';
import { deriveRouteScopeDigest } from './qbank-track-local-retrieval.ts';

/** RAG-05 冻结的 LLM qbank-miss 生成派发策略版本。改此值 = 改生成派发语义，必须升版本。 */
export const QBANK_MISS_POLICY_VERSION = 'rag05-qbank-miss:v1';

/** 分数策略 / prompt / schema / model policy 的冻结版本占位（真实值归 SCOR / MODEL-OP 版本目录）。 */
export const QBANK_MISS_SCORE_POLICY_VERSION = 'scor-frozen-placeholder:v1';
export const QBANK_MISS_PROMPT_POLICY_VERSION = 'rag05-prompt:v1';
export const QBANK_MISS_SCHEMA_POLICY_VERSION = 'rag05-schema:v1';
export const QBANK_MISS_MODEL_POLICY_VERSION = 'rag05-model-binding:v1';

/** QuestionPlan 状态机（显式 enum；CAS from→to）。 */
export const QUESTION_PLAN_STATUSES = ['planned', 'dispatched', 'result_persisted', 'question_ready', 'voided', 'generation_unavailable'] as const;
export type QuestionPlanStatus = (typeof QUESTION_PLAN_STATUSES)[number];

/** eligibility reader 的终态分类。只有 `no_eligible_in_scope` 可派发模型；其余一律 no_model_fallback。 */
export const ELIGIBILITY_VERDICTS = ['no_eligible_in_scope', 'qbank_degraded', 'policy_denied', 'generation_stale'] as const;
export type EligibilityVerdict = (typeof ELIGIBILITY_VERDICTS)[number];

/** 生成题正文长度上下界（服务端复检；模型输出超界即拒）。 */
export const GENERATED_QUESTION_MIN_LENGTH = 10;
export const GENERATED_QUESTION_MAX_LENGTH = 2000;
export const GENERATED_FOCUS_MAX_LENGTH = 512;

const SNAPSHOT_ID = /^[A-Za-z0-9:_-]{1,160}$/;
const GENERATION_ID = /^qgen-[0-9a-f-]{36}$/;
const RECIPE_ID = /^qrecipe-[0-9a-f]{32}$/;
const TAXONOMY_VERSION = /^v[1-9][0-9]{0,15}$/;
const LEAF = /^[a-z][a-z0-9_]*(\/[a-z][a-z0-9_]*){0,3}$/;
const DIGEST = /^[0-9a-f]{64}$/;
const RUBRIC_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const POLICY = /^[^\x00-\x1f\x7f]{1,64}$/;
const CONTROL = /[\x00-\x1f\x7f]/;

/** 已批准题面蓝图：只含已批准 shape（focus + 可选 templateId），绝无用户正文。模型不得新建 track/rubric。 */
export interface QuestionBlueprint {
  focus: string;
  templateId?: string;
}

/** 单 leaf、单轮、不可变生成计划。`language` 是 BCP-47 语言规则（模型 binding + 服务端复检）。 */
export interface QuestionPlan {
  snapshotId: string;
  routeScopeDigest: string;
  leafTrackId: string;
  taxonomyVersion: string;
  competencyId: string;
  difficulty: number;
  generationId: string;
  recipeId: string;
  noEligibleVerdictDigest: string;
  blueprint: QuestionBlueprint;
  rubricId: string;
  scorePolicyVersion: string;
  promptPolicyVersion: string;
  schemaPolicyVersion: string;
  modelPolicyVersion: string;
  privacyEpoch: number;
  policyVersion: string;
  language: string;
}

/** snapshot 侧为校验所需的最小视图（与 db 层 InterviewRouteSnapshotView 对应）。 */
export interface QuestionPlanSnapshot {
  interviewId: string;
  routeDigest: string;
  allocations: readonly JobRouteAllocation[];
}

/** 模型结构化输出合同：仅题文 + focus；refs 必须为空（模型不得引用 QBank/跨桶材料）。 */
export interface QbankMissModelOutput {
  question: string;
  focus: string;
  refs: unknown[];
}

const LANGUAGE_RE = /^[a-z]{2}(-[A-Za-z0-9]+)?$/;
const normalize = (t: string) => (typeof t === 'string' ? t.normalize('NFKC').trim() : '');

/** 把「某 leaf 的 clean no_eligible_in_scope 终态」钉成 canonical digest（E3/E5 承重）。 */
export function deriveNoEligibleVerdictDigest(input: {
  leafTrackId: string;
  taxonomyVersion: string;
  generationId: string;
  recipeId: string;
}): string {
  return createHash('sha256').update(JSON.stringify({
    v: 'no-eligible-verdict:v1',
    leafTrackId: input.leafTrackId,
    taxonomyVersion: input.taxonomyVersion,
    generationId: input.generationId,
    recipeId: input.recipeId,
    verdict: 'no_eligible_in_scope',
  })).digest('hex');
}

/** plan 内容的 canonical digest，作为 principal 作用域幂等键（同 plan → 同 key → 幂等 noop）。 */
export function deriveQuestionPlanKey(plan: QuestionPlan): string {
  return createHash('sha256').update(JSON.stringify({
    v: 'question-plan-key:v1',
    snapshotId: plan.snapshotId,
    routeScopeDigest: plan.routeScopeDigest,
    leafTrackId: plan.leafTrackId,
    taxonomyVersion: plan.taxonomyVersion,
    competencyId: plan.competencyId,
    difficulty: plan.difficulty,
    generationId: plan.generationId,
    recipeId: plan.recipeId,
    noEligibleVerdictDigest: plan.noEligibleVerdictDigest,
    blueprint: { focus: normalize(plan.blueprint?.focus), templateId: plan.blueprint?.templateId ?? null },
    rubricId: plan.rubricId,
    scorePolicyVersion: plan.scorePolicyVersion,
    promptPolicyVersion: plan.promptPolicyVersion,
    schemaPolicyVersion: plan.schemaPolicyVersion,
    modelPolicyVersion: plan.modelPolicyVersion,
    privacyEpoch: plan.privacyEpoch,
    policyVersion: plan.policyVersion,
    language: plan.language,
  })).digest('hex');
}

/** 生成题正文的 canonical digest（去重 + question 身份）。 */
export function deriveGeneratedQuestionDigest(question: string): string {
  return createHash('sha256').update(JSON.stringify({ v: 'generated-question:v1', question: normalize(question) })).digest('hex');
}

export type ValidateQuestionPlanResult = { ok: true } | { ok: false; reason: string };

/**
 * 服务端校验 plan 属于 snapshot + 各字段形状 + noEligibleVerdictDigest 一致性。
 * 复用 RAG-03 validatePlannerOutput（leaf/difficulty/competency）与 RAG-04 deriveRouteScopeDigest
 * （route scope 重派生一致），避免三处校验语义漂移。
 */
export function validateQuestionPlan(plan: QuestionPlan, snapshot: QuestionPlanSnapshot): ValidateQuestionPlanResult {
  if (!plan || typeof plan !== 'object') return { ok: false, reason: 'invalid_schema' };
  if (!snapshot || typeof snapshot !== 'object' || !Array.isArray(snapshot.allocations)) {
    return { ok: false, reason: 'invalid_snapshot' };
  }
  if (typeof plan.snapshotId !== 'string' || !SNAPSHOT_ID.test(plan.snapshotId)) return { ok: false, reason: 'snapshot_id_invalid' };
  if (plan.snapshotId !== snapshot.interviewId) return { ok: false, reason: 'snapshot_mismatch' };
  if (typeof plan.routeScopeDigest !== 'string' || !DIGEST.test(plan.routeScopeDigest)) return { ok: false, reason: 'route_scope_digest_invalid' };
  if (typeof plan.leafTrackId !== 'string' || !LEAF.test(plan.leafTrackId)) return { ok: false, reason: 'leaf_invalid' };
  if (typeof plan.taxonomyVersion !== 'string' || !TAXONOMY_VERSION.test(plan.taxonomyVersion)) return { ok: false, reason: 'taxonomy_invalid' };
  if (!isServingTaxonomyForLeaf(plan.taxonomyVersion, plan.leafTrackId)) return { ok: false, reason: 'taxonomy_not_current' };

  // 复用 RAG-03 planner 校验：leaf ∈ snapshot、difficulty 1..5、competencyId 形状。
  const planner = validatePlannerOutput(
    { leafTrackId: plan.leafTrackId, competencyId: plan.competencyId, difficulty: plan.difficulty },
    snapshot.allocations,
  );
  if (planner.ok === false) return { ok: false, reason: `planner_${planner.reason}` };

  // routeScopeDigest 必须与 snapshot 重派生一致（否则伪造/陈旧 leaf 绑定）。
  const expectedScope = deriveRouteScopeDigest({
    routeDigest: snapshot.routeDigest, leafTrackId: plan.leafTrackId, taxonomyVersion: plan.taxonomyVersion,
  });
  if (plan.routeScopeDigest !== expectedScope) return { ok: false, reason: 'route_scope_digest_mismatch' };

  if (typeof plan.generationId !== 'string' || !GENERATION_ID.test(plan.generationId)) return { ok: false, reason: 'generation_id_invalid' };
  if (typeof plan.recipeId !== 'string' || !RECIPE_ID.test(plan.recipeId)) return { ok: false, reason: 'recipe_id_invalid' };

  // noEligibleVerdictDigest 必须恰为「clean no_eligible_in_scope」的 canonical digest（伪造/降级 → 拒）。
  if (typeof plan.noEligibleVerdictDigest !== 'string' || !DIGEST.test(plan.noEligibleVerdictDigest)) {
    return { ok: false, reason: 'no_eligible_verdict_digest_invalid' };
  }
  const expectedVerdict = deriveNoEligibleVerdictDigest({
    leafTrackId: plan.leafTrackId, taxonomyVersion: plan.taxonomyVersion,
    generationId: plan.generationId, recipeId: plan.recipeId,
  });
  if (plan.noEligibleVerdictDigest !== expectedVerdict) return { ok: false, reason: 'no_eligible_verdict_digest_mismatch' };

  // blueprint：已批准 shape（focus 非空 + templateId 可选）。
  const bp = plan.blueprint;
  if (!bp || typeof bp !== 'object' || typeof bp.focus !== 'string' || normalize(bp.focus).length < 1
    || normalize(bp.focus).length > GENERATED_FOCUS_MAX_LENGTH || CONTROL.test(bp.focus)) {
    return { ok: false, reason: 'blueprint_invalid' };
  }
  if (bp.templateId != null && (typeof bp.templateId !== 'string' || CONTROL.test(bp.templateId) || bp.templateId.length < 1 || bp.templateId.length > 128)) {
    return { ok: false, reason: 'blueprint_template_invalid' };
  }

  // rubric：绑定既有（uuid 形状；存在性由 db FK 兜底）。
  if (typeof plan.rubricId !== 'string' || !RUBRIC_ID.test(plan.rubricId)) return { ok: false, reason: 'rubric_id_invalid' };

  if (typeof plan.scorePolicyVersion !== 'string' || !POLICY.test(plan.scorePolicyVersion)) return { ok: false, reason: 'score_policy_version_invalid' };
  if (typeof plan.promptPolicyVersion !== 'string' || !POLICY.test(plan.promptPolicyVersion)) return { ok: false, reason: 'prompt_policy_version_invalid' };
  if (typeof plan.schemaPolicyVersion !== 'string' || !POLICY.test(plan.schemaPolicyVersion)) return { ok: false, reason: 'schema_policy_version_invalid' };
  if (typeof plan.modelPolicyVersion !== 'string' || !POLICY.test(plan.modelPolicyVersion)) return { ok: false, reason: 'model_policy_version_invalid' };
  if (typeof plan.policyVersion !== 'string' || plan.policyVersion !== QBANK_MISS_POLICY_VERSION) return { ok: false, reason: 'policy_version_invalid' };
  if (!Number.isInteger(plan.privacyEpoch) || plan.privacyEpoch < 0) return { ok: false, reason: 'privacy_epoch_invalid' };
  if (typeof plan.language !== 'string' || !LANGUAGE_RE.test(plan.language)) return { ok: false, reason: 'language_invalid' };

  return { ok: true };
}

export type ValidateGeneratedQuestionResult =
  | { ok: true; question: string; focus: string; questionDigest: string }
  | { ok: false; reason: string };

/**
 * 模型结构化输出的服务端双重校验（schema → business）。
 *  - schema：question/focus 是字符串、refs 是数组。
 *  - refs 必须为空：模型不得引用 QBank/跨桶材料（spec ③「refs 必为空」）。
 *  - 长度：question ∈ [MIN, MAX]，focus ∈ [1, MAX]。
 *  - 非引导：题文不得内嵌答案标记（防模型把答案塞进题面）。
 *  - 语言：plan.language='en' 时题文不得含 CJK（轻量语言规则，fail-closed）。
 *  - 去重：question digest 不得命中 avoidDigests（已发题 digest 集合）。
 */
export function validateGeneratedQuestion(
  output: QbankMissModelOutput,
  context: { language: string; avoidDigests: readonly string[] },
): ValidateGeneratedQuestionResult {
  if (!output || typeof output !== 'object') return { ok: false, reason: 'invalid_schema' };
  if (typeof output.question !== 'string' || typeof output.focus !== 'string') return { ok: false, reason: 'invalid_schema' };
  if (!Array.isArray(output.refs) || output.refs.length !== 0) return { ok: false, reason: 'refs_not_empty' };

  const question = normalize(output.question);
  const focus = normalize(output.focus);
  if (question.length < GENERATED_QUESTION_MIN_LENGTH || question.length > GENERATED_QUESTION_MAX_LENGTH) {
    return { ok: false, reason: 'question_length_out_of_range' };
  }
  if (focus.length < 1 || focus.length > GENERATED_FOCUS_MAX_LENGTH || CONTROL.test(output.focus)) {
    return { ok: false, reason: 'focus_invalid' };
  }
  if (CONTROL.test(output.question)) return { ok: false, reason: 'question_control_chars' };

  // 非引导：内嵌答案标记（中/英）→ 拒（题面不得泄露答案）。
  if (/(答案是|正确答案|正确选项|答案是:|answer is|correct answer|the answer is)/i.test(question)) {
    return { ok: false, reason: 'leading_question' };
  }
  // 语言规则：en 的题面不得含 CJK（轻量 fail-closed；zh 双脚本皆可）。
  if (context.language === 'en' && /[一-鿿]/.test(question)) {
    return { ok: false, reason: 'language_mismatch' };
  }

  const questionDigest = deriveGeneratedQuestionDigest(question);
  if ((context.avoidDigests ?? []).includes(questionDigest)) return { ok: false, reason: 'duplicate_question' };

  return { ok: true, question, focus, questionDigest };
}
