/**
 * RAG-FUNNEL-05 / LLM 同桶生成题 dispatch seam。
 *
 * 当 eligibility reader（RAG-04）对某已冻结 leaf 的终态是 `no_eligible_in_scope`（干净无题）时，
 * 本 seam 在**同一 leaf** 生成**恰好一题**，绝不伪装成 QBank 证据、绝不写回 QBank/vector、
 * 绝不被评分/B 端聚合（不建 issued_question_contract / score_request / score_card）。
 *
 * 承重边界（与 packages/db/migrations/0110_llm_qbank_miss_generation.sql 一一对应）：
 *  - 两阶段 durable 派发（对齐 RAG-03 model_prepared / RAG-04 RetrievalPlan.dispatched）：
 *    `planned →(CAS) dispatched` 是「模型外发前的持久 claim」，唯一赢家才调模型（E1 派发≤1）；
 *    模型/网络 I/O 一律在 DB 事务**外**。
 *  - `dispatched →(CAS) result_persisted` 写 durable 结果（question_plan_event.result = result
 *    outbox）：投影事务失败时，恢复读 durable 结果重投影，绝不重新生成不同题（E4 exact-once）。
 *  - `result_persisted →(CAS) question_ready` 在同一事务写 interview_question + question_ready
 *    事件 + question_issue_provenance（幂等：interview_question ON CONFLICT + question_ready
 *    eventKey + provenance UNIQUE(owner,interview,question)）。
 *  - E2 epoch fence：active generation/recipe 或 interview privacy epoch 与 plan 冻结值不符 →
 *    旧 plan void，模型=0。伪造 leaf/plan/rubric/generation/verdict → 校验/ FK 拒绝（E3）。
 *  - E5 降级：eligibility verdict ≠ no_eligible_in_scope → no_model_fallback（模型/Web=0）；
 *    model 已知失败 / dispatched_unknown → generation_unavailable，不重发。
 *  - E6 污染+评分：本模块**不触碰** SCOR-01 写路径（不 issueQuestionContract），生成题
 *    review_status=review_required（⇒ score_excluded），不写 QBank/vector。
 *
 * 四条承重原语落点：① asPrincipal（全部事务）② CAS 状态机模式（planned→…→question_ready，
 * 与 0104/0106 一致，question_plan 有自己的 CAS UPDATE，不调用 interview 专用的 casTransition）
 * ③ appendEvent（question_ready 写 interview_event，复用原语）④ lease 有意不用——模型派发≤1 由
 * CAS + epoch fence 承重（对齐 RAG-03 model_prepared，非租约语义）。
 *
 * 分层纪律：schema 校验与 leaf ∈ allocations 判定归 domain（validateQuestionPlan /
 * validateGeneratedQuestion）；本层只把字段送进承重 SQL 并映射返回值，与 job-route-decision.ts 一致。
 */
import { randomUUID } from 'node:crypto';
import type { PoolClient as Client } from 'pg';
import { asPrincipal, type DbPool } from './principal.ts';
import { getInterviewRouteSnapshot } from './job-route-decision.ts';
import { activeQbankGeneration } from './qbank-generation-retrieval.ts';
import { persistInterviewQuestion } from './interview-question.ts';
import { appendEvent } from './interview-event.ts';
import {
  deriveQuestionPlanKey, validateQuestionPlan, validateGeneratedQuestion,
  type QuestionPlan, type QuestionPlanSnapshot, type QuestionPlanStatus,
  type EligibilityVerdict, type QbankMissModelOutput,
} from '@meetwise/domain';

/** 模型 typed binding 输入：只含冻结 leaf/能力/难度/已批准 blueprint/rubric 标识/语言/avoid set。 */
export interface QbankMissModelInput {
  leafTrackId: string;
  competencyId: string;
  difficulty: number;
  blueprint: { focus: string; templateId?: string };
  rubricId: string;
  language: string;
  avoidDigests: string[];
}

/** RAG-05 受控确定性 seam；生产由 MODEL-OP-01 typed binding 提供真实实现。 */
export type QbankMissModelGenerate = (input: QbankMissModelInput) => Promise<QbankMissModelOutput>;

export interface DispatchQbankMissGenerationDeps {
  /** eligibility reader（RAG-04）的终态分类。只有 no_eligible_in_scope 派发模型。 */
  eligibility: EligibilityVerdict;
  model: QbankMissModelGenerate;
  /** 已发题 digest 的 avoid set（去重 + 喂给模型避免重复）。 */
  avoidDigests?: string[];
}

export type DispatchQbankMissGenerationResult =
  | { status: 'question_ready'; planId: string; questionId: string; stateVersion: number; turn: number; reviewStatus: 'review_required'; provenanceId: string }
  | { status: 'replayed'; planId: string; planStatus: QuestionPlanStatus }
  | { status: 'voided'; planId: string; reason: string }
  | { status: 'generation_unavailable'; planId: string; reason: string }
  | { status: 'no_model_fallback'; reason: EligibilityVerdict }
  | { status: 'rejected'; reason: string };

function codeError(code: string): Error { return Object.assign(new Error(code), { code }); }

/** 单 owner 单调 outbox：事务内 INSERT…SELECT MAX+1（result 承载 result_persisted 的 durable 结果）。 */
async function appendPlanEvent(
  c: Client, owner: string, planId: string,
  fromStatus: QuestionPlanStatus | null, toStatus: QuestionPlanStatus, reason: string | null, result: unknown,
): Promise<number> {
  const r = await c.query(
    `INSERT INTO question_plan_event(owner_user_id, event_seq, plan_id, from_status, to_status, reason, result)
     SELECT $1, COALESCE(MAX(event_seq),0)+1, $2, $3, $4, $5, $6
       FROM question_plan_event WHERE owner_user_id=$1
     RETURNING event_seq`,
    [owner, planId, fromStatus, toStatus, reason, result ?? null],
  );
  return Number(r.rows[0]?.event_seq);
}

type ClaimResult =
  | { action: 'dispatch'; planId: string }
  | { action: 'replay'; planId: string; planStatus: QuestionPlanStatus }
  | { action: 'voided'; planId: string; reason: string }
  | { action: 'rejected'; reason: string };

/**
 * 阶段 1（事务 A）：服务端校验 plan 属于 snapshot + 服务端字段白名单 → 冻结 + CAS
 * planned→dispatched（外发前的持久 claim）。E2 epoch fence（generation/privacy）先于派发；
 * E3 越权（伪造 snapshot/leaf/plan/rubric/verdict）在 INSERT/FK/重派生即被拒。
 */
async function claimDispatch(c: Client, owner: string, plan: QuestionPlan, deps: DispatchQbankMissGenerationDeps): Promise<ClaimResult> {
  const snapshot = await getInterviewRouteSnapshot(c, owner, plan.snapshotId);
  if (!snapshot) return { action: 'rejected', reason: 'snapshot_missing' };
  const planSnapshot: QuestionPlanSnapshot = {
    interviewId: snapshot.interviewId, routeDigest: snapshot.routeDigest, allocations: snapshot.allocations,
  };
  const validated = validateQuestionPlan(plan, planSnapshot);
  if (validated.ok === false) return { action: 'rejected', reason: validated.reason };

  // E3：rubric 存在性由 question_plan.rubric_id → question_rubric(id) 的 FK 在 INSERT 时结构上兜底
  //（伪造 rubric_id → INSERT 直接 FK 违例拒绝）。这里**不**单独 SELECT question_rubric，因为
  // app_role 对该表无 SELECT（只有 scoring_definer_owner 有，见 0100）——显式查询会撞
  // "permission denied for table question_rubric"。FK 语义即「绑定既有 rubric」，与迁移头注释一致。
  const key = deriveQuestionPlanKey(plan);
  const planId = 'qp-' + key;

  // 冻结（幂等）：同 plan_key 重放 = noop。
  const ins = await c.query(
    `INSERT INTO question_plan(
       id, owner_user_id, snapshot_id, route_scope_digest, leaf_track_id, taxonomy_version,
       competency_id, difficulty, generation_id, recipe_id, no_eligible_verdict_digest,
       question_blueprint, rubric_id, score_policy_version, prompt_policy_version,
       schema_policy_version, model_policy_version, privacy_epoch, plan_key, status
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'planned')
     ON CONFLICT (owner_user_id, plan_key) DO NOTHING
     RETURNING id`,
    [planId, owner, plan.snapshotId, plan.routeScopeDigest, plan.leafTrackId, plan.taxonomyVersion,
      plan.competencyId, plan.difficulty, plan.generationId, plan.recipeId, plan.noEligibleVerdictDigest,
      JSON.stringify(plan.blueprint), plan.rubricId, plan.scorePolicyVersion, plan.promptPolicyVersion,
      plan.schemaPolicyVersion, plan.modelPolicyVersion, plan.privacyEpoch, key],
  );

  let existingStatus: QuestionPlanStatus;
  if (ins.rowCount === 1) {
    existingStatus = 'planned';
  } else {
    const ex = await c.query('SELECT id, status FROM question_plan WHERE owner_user_id=$1 AND plan_key=$2 FOR UPDATE', [owner, key]);
    const row = ex.rows[0] as { id: string; status: QuestionPlanStatus } | undefined;
    if (!row) throw codeError('question_plan_missing_after_conflict');
    existingStatus = row.status;
  }

  // E2 epoch fence：generation/recipe 或 privacy epoch 与 plan 冻结值不符 → 旧 plan void，模型=0。
  // 只在非终态（planned/dispatched）时 void；终态 sticky 不重复迁移。
  const active = await activeQbankGeneration(c);
  const epochRow = await c.query(
    'SELECT COALESCE(resume_privacy_epoch,0)::bigint AS epoch FROM interview WHERE id=$1 AND owner_user_id=$2',
    [plan.snapshotId, owner],
  );
  const currentEpoch = epochRow.rowCount === 1 ? Number(epochRow.rows[0].epoch) : null;
  if (active.generationId !== plan.generationId || active.recipeId !== plan.recipeId || currentEpoch === null || currentEpoch !== plan.privacyEpoch) {
    const staleReason = (active.generationId !== plan.generationId || active.recipeId !== plan.recipeId)
      ? 'generation_stale' : 'privacy_epoch_changed';
    const voided = await c.query(
      `UPDATE question_plan SET status='voided', updated_at=clock_timestamp()
        WHERE id=$1 AND owner_user_id=$2 AND status IN ('planned','dispatched')
        RETURNING id`,
      [planId, owner],
    );
    if (voided.rowCount === 1) await appendPlanEvent(c, owner, planId, existingStatus, 'voided', staleReason, null);
    return { action: 'voided', planId, reason: staleReason };
  }

  // 终态 sticky 重放：读同一 outcome（E1 20 次恢复读同一结果）。
  if (existingStatus === 'question_ready' || existingStatus === 'voided' || existingStatus === 'generation_unavailable') {
    return { action: 'replay', planId, planStatus: existingStatus };
  }
  // result_persisted：模型已成功但投影未完成 → 恢复重投影（E4）。
  if (existingStatus === 'result_persisted') return { action: 'replay', planId, planStatus: 'result_persisted' };
  // dispatched（崩溃残留，无结果）：不重发（派发≤1），交由调用方映射为 dispatched_unknown。
  if (existingStatus === 'dispatched') return { action: 'replay', planId, planStatus: 'dispatched' };

  // planned → dispatched：CAS 唯一赢家才调模型。
  const upd = await c.query(
    `UPDATE question_plan SET status='dispatched', updated_at=clock_timestamp()
      WHERE id=$1 AND owner_user_id=$2 AND status='planned'
      RETURNING id`,
    [planId, owner],
  );
  if (upd.rowCount !== 1) throw codeError('question_plan_dispatch_cas_lost');
  await appendPlanEvent(c, owner, planId, 'planned', 'dispatched', null, null);
  return { action: 'dispatch', planId };
}

/** 阶段 4（事务 B）：CAS dispatched→result_persisted + 写 durable 结果（result outbox）。 */
async function persistResult(c: Client, owner: string, planId: string, question: string, focus: string, questionDigest: string): Promise<boolean> {
  const upd = await c.query(
    `UPDATE question_plan SET status='result_persisted', updated_at=clock_timestamp()
      WHERE id=$1 AND owner_user_id=$2 AND status='dispatched'
      RETURNING id`,
    [planId, owner],
  );
  if (upd.rowCount !== 1) return false;
  await appendPlanEvent(c, owner, planId, 'dispatched', 'result_persisted', null, { question, focus, questionDigest });
  return true;
}

type ProjectResult =
  | { status: 'question_ready'; questionId: string; stateVersion: number; turn: number; provenanceId: string }
  | { status: 'replay_terminal'; planStatus: QuestionPlanStatus }
  | { status: 'not_projected' };

/**
 * 阶段 5（事务 C）：exact-once 投影。读 durable 结果 → 写 interview_question + question_ready
 * 事件 + provenance + CAS result_persisted→question_ready。全部幂等（ON CONFLICT / eventKey /
 * UNIQUE），任一失败整体回滚，恢复重跑同一事务即可。
 */
async function projectQuestion(c: Client, owner: string, planId: string, plan: QuestionPlan): Promise<ProjectResult> {
  const planRow = await c.query(
    'SELECT status FROM question_plan WHERE id=$1 AND owner_user_id=$2 FOR UPDATE',
    [planId, owner],
  );
  const status = planRow.rows[0]?.status as QuestionPlanStatus | undefined;
  if (status === 'question_ready') {
    const prov = await c.query(
      'SELECT question_id, id FROM question_issue_provenance WHERE plan_id=$1 AND owner_user_id=$2 LIMIT 1',
      [planId, owner],
    );
    const p = prov.rows[0] as { question_id: string; id: string } | undefined;
    const q = await c.query(
      'SELECT state_version, turn FROM interview_question WHERE owner_user_id=$1 AND interview_id=$2 AND question_id=$3',
      [owner, plan.snapshotId, p?.question_id ?? ''],
    );
    return {
      status: 'question_ready', questionId: p?.question_id ?? '', provenanceId: p?.id ?? '',
      stateVersion: Number(q.rows[0]?.state_version ?? 0), turn: Number(q.rows[0]?.turn ?? 0),
    };
  }
  if (status !== 'result_persisted') return { status: 'replay_terminal', planStatus: status ?? 'generation_unavailable' };

  // 读 durable 结果（result outbox）。
  const resultRow = await c.query(
    `SELECT result FROM question_plan_event
      WHERE owner_user_id=$1 AND plan_id=$2 AND to_status='result_persisted'
      ORDER BY event_seq DESC LIMIT 1`,
    [owner, planId],
  );
  const result = resultRow.rows[0]?.result as { question: string; focus: string; questionDigest: string } | undefined;
  if (!result || typeof result.question !== 'string' || typeof result.questionDigest !== 'string') {
    throw codeError('question_plan_result_missing');
  }

  const questionId = 'gqm-' + result.questionDigest.slice(0, 32);
  const next = await c.query(
    `SELECT COALESCE(MAX(turn),0)+1 AS turn, COALESCE(MAX(state_version),0)+1 AS sv
       FROM interview_question WHERE owner_user_id=$1 AND interview_id=$2`,
    [owner, plan.snapshotId],
  );
  const turn = Number(next.rows[0]?.turn ?? 1);
  const stateVersion = Number(next.rows[0]?.sv ?? 1);

  // interview_question（review_required ⇒ score_excluded；qkind 标记 origin）。
  await persistInterviewQuestion(c, owner, plan.snapshotId, {
    questionId, stateVersion, turn, question: result.question,
    competency: plan.competencyId, qkind: 'llm_qbank_miss', reviewStatus: 'review_required',
  });

  // question_ready 业务事件（复用原语③ appendEvent；eventKey 幂等）。
  await appendEvent(c, owner, plan.snapshotId, 'question_ready', {
    questionId, stateVersion, turn, question: result.question,
    competency: plan.competencyId, qkind: 'llm_qbank_miss', reviewStatus: 'review_required',
  }, `question_ready:${questionId}`);

  // provenance（仅脱敏 digest，origin=llm_qbank_miss；无用户正文/PII/raw prompt）。
  const provenanceId = 'qip-' + randomUUID();
  await c.query(
    `INSERT INTO question_issue_provenance(
       id, owner_user_id, interview_id, question_id, origin, plan_id, leaf_track_id, taxonomy_version,
       generation_id, recipe_id, competency_id, difficulty, no_eligible_verdict_digest, question_digest,
       rubric_id, score_policy_version, prompt_policy_version, schema_policy_version, model_policy_version, model_attempt
     ) VALUES ($1,$2,$3,$4,'llm_qbank_miss',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,1)
     ON CONFLICT (owner_user_id, interview_id, question_id) DO NOTHING`,
    [provenanceId, owner, plan.snapshotId, questionId, planId, plan.leafTrackId, plan.taxonomyVersion,
      plan.generationId, plan.recipeId, plan.competencyId, plan.difficulty, plan.noEligibleVerdictDigest,
      result.questionDigest, plan.rubricId, plan.scorePolicyVersion, plan.promptPolicyVersion,
      plan.schemaPolicyVersion, plan.modelPolicyVersion],
  );

  // CAS result_persisted→question_ready + outbox。
  const upd = await c.query(
    `UPDATE question_plan SET status='question_ready', updated_at=clock_timestamp()
      WHERE id=$1 AND owner_user_id=$2 AND status='result_persisted'
      RETURNING id`,
    [planId, owner],
  );
  if (upd.rowCount !== 1) throw codeError('question_plan_ready_cas_lost');
  await appendPlanEvent(c, owner, planId, 'result_persisted', 'question_ready', null, null);

  return { status: 'question_ready', questionId, stateVersion, turn, provenanceId };
}

/**
 * 图内 worker 消费 seam：单 leaf、单轮、单题。调用方须已持有 graph fence；本层以
 * eligibility verdict + 状态机 CAS + epoch fence 承重（对齐 RAG-04 的分层）。
 */
export async function dispatchQbankMissGeneration(
  pool: DbPool, owner: string, plan: QuestionPlan, deps: DispatchQbankMissGenerationDeps,
): Promise<DispatchQbankMissGenerationResult> {
  // 阶段 0：eligibility 终态分类。只有干净无题派发模型；其余（degraded/denied/stale）模型/Web=0。
  if (deps.eligibility !== 'no_eligible_in_scope') {
    return { status: 'no_model_fallback', reason: deps.eligibility };
  }

  // 阶段 1：校验 + 冻结 + CAS planned→dispatched（持久 claim）。
  const claim = await asPrincipal(pool, owner, (c) => claimDispatch(c, owner, plan, deps));
  if (claim.action === 'rejected') return { status: 'rejected', reason: claim.reason };
  if (claim.action === 'voided') return { status: 'voided', planId: claim.planId, reason: claim.reason };
  if (claim.action === 'replay') {
    if (claim.planStatus === 'result_persisted') {
      const projected = await asPrincipal(pool, owner, (c) => projectQuestion(c, owner, claim.planId, plan));
      if (projected.status === 'question_ready') {
        return { planId: claim.planId, ...projected, reviewStatus: 'review_required' };
      }
      return { status: 'replayed', planId: claim.planId, planStatus: projected.status === 'replay_terminal' ? projected.planStatus : claim.planStatus };
    }
    if (claim.planStatus === 'dispatched') {
      // 崩溃残留：不重发（派发≤1），映射为 dispatched_unknown 不可用态。
      return { status: 'generation_unavailable', planId: claim.planId, reason: 'dispatched_unknown' };
    }
    return { status: 'replayed', planId: claim.planId, planStatus: claim.planStatus };
  }

  // 阶段 2：模型外发（事务外，恰一次）。
  let output: QbankMissModelOutput;
  try {
    output = await deps.model({
      leafTrackId: plan.leafTrackId, competencyId: plan.competencyId, difficulty: plan.difficulty,
      blueprint: { focus: plan.blueprint.focus, templateId: plan.blueprint.templateId },
      rubricId: plan.rubricId, language: plan.language, avoidDigests: deps.avoidDigests ?? [],
    });
  } catch (err) {
    // E5：任何模型失败/超时/dispatched_unknown/预算拒绝 → generation_unavailable，绝不重发。
    const code = (err as { code?: unknown } | undefined)?.code;
    const reason = code === 'dispatched_unknown' ? 'dispatched_unknown'
      : code === 'budget_rejected' ? 'budget_rejected'
      : code === 'timeout' ? 'timeout'
      : 'model_failed';
    await asPrincipal(pool, owner, (c) => c.query(
      `UPDATE question_plan SET status='generation_unavailable', updated_at=clock_timestamp()
        WHERE id=$1 AND owner_user_id=$2 AND status='dispatched'`,
      [claim.planId, owner],
    ));
    return { status: 'generation_unavailable', planId: claim.planId, reason };
  }

  // 阶段 3：模型输出服务端双重校验（schema → business）。
  const validated = validateGeneratedQuestion(output, { language: plan.language, avoidDigests: deps.avoidDigests ?? [] });
  if (validated.ok === false) {
    await asPrincipal(pool, owner, async (c) => {
      await c.query(
        `UPDATE question_plan SET status='generation_unavailable', updated_at=clock_timestamp()
          WHERE id=$1 AND owner_user_id=$2 AND status='dispatched'`,
        [claim.planId, owner],
      );
      await appendPlanEvent(c, owner, claim.planId, 'dispatched', 'generation_unavailable', validated.reason, null);
    });
    return { status: 'generation_unavailable', planId: claim.planId, reason: validated.reason };
  }

  // 阶段 4：持久 durable 结果（result outbox）。
  const persisted = await asPrincipal(pool, owner, (c) =>
    persistResult(c, owner, claim.planId, validated.question, validated.focus, validated.questionDigest));
  if (!persisted) {
    // 并发 E2 void 已先赢（plan 已 voided/terminal）→ 不投影。
    const planRow = await asPrincipal(pool, owner, (c) =>
      c.query('SELECT status FROM question_plan WHERE id=$1 AND owner_user_id=$2', [claim.planId, owner]));
    const status = planRow.rows[0]?.status as QuestionPlanStatus | undefined;
    if (status === 'voided' || status === 'generation_unavailable') return { status: 'replayed', planId: claim.planId, planStatus: status };
    // result_persisted/question_ready 已被另一投影完成 → 重投影读取同一结果。
    const projected = await asPrincipal(pool, owner, (c) => projectQuestion(c, owner, claim.planId, plan));
    if (projected.status === 'question_ready') {
      return { planId: claim.planId, ...projected, reviewStatus: 'review_required' };
    }
    return { status: 'replayed', planId: claim.planId, planStatus: projected.status === 'replay_terminal' ? projected.planStatus : status ?? 'dispatched' };
  }

  // 阶段 5：exact-once 投影。
  const projected = await asPrincipal(pool, owner, (c) => projectQuestion(c, owner, claim.planId, plan));
  if (projected.status === 'question_ready') {
    return { planId: claim.planId, ...projected, reviewStatus: 'review_required' };
  }
  return { status: 'replayed', planId: claim.planId, planStatus: projected.status === 'replay_terminal' ? projected.planStatus : 'result_persisted' };
}
