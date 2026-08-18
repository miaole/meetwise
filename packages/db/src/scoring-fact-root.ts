/**
 * @meetwise/db · 评分测量事实根（SCOR-01）存储侧。
 *
 * 这是「版本化 rubric + 两阶段评分事实根」的纯数据访问层：只建事实根 + 状态机 + 幂等 +
 * 并发 + RLS，**不接任何生产写路径、不做确定性聚合、不调模型**（SCOR-02 的 score-writer
 * /消费迁移/legacy 移除；SCOR-03 的证据冲突/uncertainty 语义；SCOR-04 的成本路由均不在此）。
 *
 * 铁律：
 *   - 发题时答案尚不存在 → issue 阶段 `issued_question_contract` 只冻题不冻答案（schema 层
 *     **无** answer 列）；submission 阶段 `score_request` 才绑 canonical artifact
 *     （0092 的 submission receipt + artifact ref + body HMAC）。
 *   - 两阶段与 ScoreCard 在**写卡事务**内受控绑定：写卡重验 question identity + rubric +
 *     epoch + permit(lease_token) + 双 fence（删除/撤权先赢 → card=0 + 迟到结果不得写回）。
 *   - 复用冻结删除授权（0091 issuer + 0096 sink receipt），不重实现删除根；本域只做 fence
 *     重校验（assert_interview_answer_fact_active + assert_interview_privacy_active）。
 *   - 权限分离：publish/issue/create 走 app_role（asPrincipal）；claim/dispatch/fence/record/
 *     transition/supersede 走 scoring_worker_executor（本模块的 asScoringWorker* helper，
 *     不触碰 principal.ts，避免与并发迁移代理冲突）。
 */
import type { Client, DbPool } from './principal.ts';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

/** 校验器身份 helper（与 principal.ts 的 asPrivacyWorkerPrincipal 同构；只在本模块导出，不改 principal.ts）。 */
export async function asScoringWorkerPrincipal<T>(pool: DbPool, user: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE scoring_worker_executor');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [user]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

/** 版本化 rubric 分项输入（随 rubric 一起冻结；weight 必须 > 0，criterionId 唯一）。 */
export interface RubricCriterionInput {
  criterionId: string;
  weight: number;
  /** SCOR-03：required 分项必须覆盖（默认 true，保持 SCOR-02「全分项必须有证据」语义）。 */
  required?: boolean;
  behaviorAnchors?: unknown[];
  capRules?: Record<string, unknown>;
  position?: number;
}

export interface PublishQuestionRubricInput {
  questionId: string;
  questionVersion: number;
  rubricVersion: number;
  competency: string;
  /** 沿用既有 1..5 难度标度（qbank-ingest/adaptive-interview 同源），随版本一起冻结。 */
  difficulty: number;
  /** BCP-47 语言适用范围；issue 阶段校验 language ∈ scope。 */
  languageScope?: string[];
  questionContentHash: string;
  supersedesRubricId?: string | null;
  criteria: RubricCriterionInput[];
}

export interface IssueQuestionContractInput {
  interviewId: string;
  questionId: string;
  stateVersion: number;
  turn: number;
  questionContentHash: string;
  rubricId: string;
  form: string;
  language: string;
  route: string;
  promptPolicyVersion: string;
  measurementVersion: string;
  privacyEpoch: number;
}

export interface CreateScoreRequestInput {
  issuedContractId: string;
  submissionId: string;
  artifactId: string;
  answerBodyHmac: string;
  privacyEpoch: number;
  operationPolicyVersion: string;
  answerVersion: number;
  idempotencyKey: string;
}

export interface ScoreCardCriterionInput {
  criterionId: string;
  disposition: string;
  score: number;
  weight: number;
}

export interface RecordScoreCardInput {
  requestId: string;
  leaseToken: string;
  criteria: ScoreCardCriterionInput[];
  deterministicTotal: number;
  coverage: number;
  uncertainty?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
}

/** 发布（或幂等回放）版本化 rubric。调用方须已 asPrincipal（app_role）。 */
export async function publishQuestionRubric(c: Client, input: PublishQuestionRubricInput): Promise<{ rubricId: string }> {
  const r = await c.query<{ id: string }>(
    'SELECT scoring_publish_question_rubric($1,$2,$3,$4,$5,$6,$7,$8,$9) AS id',
    [input.questionId, input.questionVersion, input.rubricVersion, input.competency, input.difficulty,
      JSON.stringify(input.languageScope ?? []), input.questionContentHash,
      input.supersedesRubricId ?? null, JSON.stringify(input.criteria)],
  );
  const id = r.rows[0]?.id;
  if (!id) fail('scoring_rubric_publish_unavailable');
  return { rubricId: id };
}

/** issue 阶段：冻结题目契约（绝不含答案身份）。调用方须已 asPrincipal（app_role）。 */
export async function issueQuestionContract(c: Client, input: IssueQuestionContractInput): Promise<{ contractId: string; replayed: boolean }> {
  const r = await c.query<{ contract_id: string; replayed: boolean }>(
    'SELECT * FROM scoring_issue_question_contract($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
    [input.interviewId, input.questionId, input.stateVersion, input.turn, input.questionContentHash,
      input.rubricId, input.form, input.language, input.route, input.promptPolicyVersion,
      input.measurementVersion, input.privacyEpoch],
  );
  const row = r.rows[0];
  if (!row?.contract_id) fail('scoring_issue_contract_unavailable');
  return { contractId: row.contract_id, replayed: row.replayed === true };
}

/** submission 阶段：追加答案版本/评分请求（绑 canonical artifact + permit）。调用方须已 asPrincipal。 */
export async function createScoreRequest(c: Client, input: CreateScoreRequestInput): Promise<{ requestId: string; answerVersion: number; replayed: boolean }> {
  const r = await c.query<{ request_id: string; answer_version: string | number; replayed: boolean }>(
    'SELECT * FROM scoring_create_score_request($1,$2,$3,$4,$5,$6,$7,$8)',
    [input.issuedContractId, input.submissionId, input.artifactId, input.answerBodyHmac,
      input.privacyEpoch, input.operationPolicyVersion, input.answerVersion, input.idempotencyKey],
  );
  const row = r.rows[0];
  if (!row?.request_id) fail('scoring_create_score_request_unavailable');
  return { requestId: row.request_id, answerVersion: Number(row.answer_version), replayed: row.replayed === true };
}

/** claim（permit：单次 CAS pending→claimed）。调用方须已 asScoringWorkerPrincipal。 */
export async function claimScoreRequest(c: Client, requestId: string, leaseOwner: string, leaseToken: string): Promise<{ requestId: string; status: string | null; leaseToken: string | null; claimed: boolean }> {
  const r = await c.query<{ request_id: string; status: string | null; lease_token: string | null; claimed: boolean }>(
    'SELECT * FROM scoring_claim_score_request($1,$2,$3)', [requestId, leaseOwner, leaseToken]);
  const row = r.rows[0];
  if (!row?.request_id) fail('scoring_claim_unavailable');
  return { requestId: row.request_id, status: row.status, leaseToken: row.lease_token, claimed: row.claimed === true };
}

/** dispatch（claimed→dispatched，token 匹配）。调用方须已 asScoringWorkerPrincipal。 */
export async function markScoreRequestDispatched(c: Client, requestId: string, leaseToken: string): Promise<{ requestId: string; status: string | null; dispatched: boolean }> {
  const r = await c.query<{ request_id: string; status: string | null; dispatched: boolean }>(
    'SELECT * FROM scoring_mark_score_request_dispatched($1,$2)', [requestId, leaseToken]);
  const row = r.rows[0];
  if (!row?.request_id) fail('scoring_dispatch_unavailable');
  return { requestId: row.request_id, status: row.status, dispatched: row.dispatched === true };
}

/** fence（删除/撤权/答案替换先赢）。调用方须已 asScoringWorkerPrincipal。 */
export async function fenceScoreRequest(c: Client, requestId: string): Promise<{ requestId: string; status: string | null; fenced: boolean }> {
  const r = await c.query<{ request_id: string; status: string | null; fenced: boolean }>(
    'SELECT * FROM scoring_fence_score_request($1)', [requestId]);
  const row = r.rows[0];
  if (!row?.request_id) fail('scoring_fence_unavailable');
  return { requestId: row.request_id, status: row.status, fenced: row.fenced === true };
}

/** 写卡（写卡事务内原子校验两阶段 + CAS + 同事务发事件）。调用方须已 asScoringWorkerPrincipal。 */
export async function recordScoreCard(c: Client, input: RecordScoreCardInput): Promise<{ cardId: string | null; status: string | null; recorded: boolean }> {
  const r = await c.query<{ card_id: string | null; status: string | null; recorded: boolean }>(
    'SELECT * FROM scoring_record_score_card($1,$2,$3,$4,$5,$6,$7)',
    [input.requestId, input.leaseToken, JSON.stringify(input.criteria), input.deterministicTotal, input.coverage,
      JSON.stringify(input.uncertainty ?? {}), JSON.stringify(input.provenance ?? {})],
  );
  const row = r.rows[0];
  if (!row) fail('scoring_record_unavailable');
  return { cardId: row.card_id, status: row.status, recorded: row.recorded === true };
}

/** 状态机 CAS（from→to；非法转移由 0100 触发器拒）。调用方须已 asScoringWorkerPrincipal。 */
export async function transitionScoreCard(c: Client, cardId: string, fromStatus: string, toStatus: string): Promise<{ cardId: string; status: string; transitioned: boolean }> {
  const r = await c.query<{ card_id: string; status: string; transitioned: boolean }>(
    'SELECT * FROM scoring_transition_score_card($1,$2,$3)', [cardId, fromStatus, toStatus]);
  const row = r.rows[0];
  if (!row?.card_id) fail('scoring_transition_unavailable');
  return { cardId: row.card_id, status: row.status, transitioned: row.transitioned === true };
}

/** 更正（旧卡转 superseded + 插新卡，不覆盖历史）。调用方须已 asScoringWorkerPrincipal。 */
export async function supersedeScoreCard(c: Client, oldCardId: string, input: {
  criteria: ScoreCardCriterionInput[];
  deterministicTotal: number;
  coverage: number;
  uncertainty?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
}): Promise<{ cardId: string; supersededCardId: string }> {
  const r = await c.query<{ card_id: string; superseded_card_id: string }>(
    'SELECT * FROM scoring_supersede_score_card($1,$2,$3,$4,$5,$6)',
    [oldCardId, JSON.stringify(input.criteria), input.deterministicTotal, input.coverage,
      JSON.stringify(input.uncertainty ?? {}), JSON.stringify(input.provenance ?? {})],
  );
  const row = r.rows[0];
  if (!row?.card_id) fail('scoring_supersede_unavailable');
  return { cardId: row.card_id, supersededCardId: row.superseded_card_id };
}
