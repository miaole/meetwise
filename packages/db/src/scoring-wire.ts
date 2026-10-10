/**
 * @meetwise/db · EXTREV-1 SCORE-WRITER S1 全链接线组合层（零迁移）。
 *
 * 五环链（publishQuestionRubric → issueQuestionContract → createScoreRequest →
 * claimScoreRequest → writeFinalScoreCard/adjudicate）的表/触发器/写入函数已全部落库
 * （0100/0103/0109），本模块只做**调用面组合**，不新增任何 schema：
 *   - `publishRubricAndIssueContract`：出题投影事务内发布 rubric + 冻结题面契约
 *     （rev2 D1；difficulty 由图状态 PendingQuestion plumbing 到投影层，1..5 与
 *     qbank-ingest/adaptive-interview 同源标度）。
 *   - `createScoreRequestForSubmission`：API submit 事务邻域（rev2 D2 勘误锚点
 *     int-transcript.ts:114/139/157 + interview.service.ts:402——与 0092 ledger 写入
 *     **同事务原子**，非 claim 位）。
 *   - `findActiveScoreRequest`：worker drain 侧（rev2 D4）的 app_role 只读定位面。
 *
 * 版本/策略常量**单点**：issue 侧与 submission 侧若各写一版，会破坏契约唯一键
 * (owner,interview,question,stateVersion,rubricId,measurementVersion) 的可重放性——
 * 全部调用方必须引用本模块常量，禁字面量。
 *
 * S1 最小 seed（rev2 D1）：自适应出题侧逐题发布，单分项 `answer_quality`（weight 1）。
 * 过渡窗声明（rev2 D6）：该 seed 下卡总分 = 0/50/100 档位化值（0103 确定性公式 of
 * 单档），≠ v5 hint 分；S2 v6 上线后 seed 随提示词工程扩项（EXTREV-4 QBANK-CORPUS 域）。
 */
import { createHash } from 'node:crypto';
import type { Client } from './principal.ts';
import {
  publishQuestionRubric, issueQuestionContract, createScoreRequest,
  type RubricCriterionInput,
} from './scoring-fact-root.ts';

/** 测量栈版本（issue 契约 measurement_version 与 request 侧对齐的单一来源）。 */
export const SCORING_MEASUREMENT_VERSION = 'scor-factroot-v1';
/** 操作策略版本（score_request.operation_policy_version）。 */
export const SCORING_OPERATION_POLICY_VERSION = 'scor-factroot-v1';
/**
 * 提示词策略版本（#52 v6 · SCORE-WRITER S2）：v6 模型直出 criterionId+quote+disposition，
 * S1 的 v5→disposition 过渡桥已废除（rg 门零残留），issue 契约 prompt_policy_version 同步升版。
 */
export const SCORING_PROMPT_POLICY_VERSION = 'mock-interview.evaluate.v6';
/** 出题路由标签（issue 契约 route 列；自适应图为唯一供题来源）。 */
export const SCORING_ROUTE = 'adaptive-interview';
/** 发题语言 + rubric 语言适用范围（issue 校验 language ∈ scope，二者必须一致）。 */
export const SCORING_LANGUAGE = 'zh';
export const SCORING_LANGUAGE_SCOPE: string[] = ['zh'];
/**
 * issue/submission 两侧共用的 privacy epoch（与 0092 preview submit 现值 1 同值单点；
 * scoring_create_score_request 在 DB 层断言 request.epoch == contract.epoch）。
 */
export const SCORING_ISSUE_PRIVACY_EPOCH = 1;
/** S1 最小 rubric seed 分项（单分项 weight 1；rubric 语料工程归 EXTREV-4）。 */
export const SCORING_SEED_CRITERION_ID = 'answer_quality';

/** 题面内容 hash（sha256 hex，64 位；issue 阶段核对冻结题面未漂移）。 */
export function questionContentHashOf(question: string): string {
  return createHash('sha256').update(question, 'utf8').digest('hex');
}

/**
 * rubric 全局键命名空间：图内 questionId 形如 `q-v{sv}-t{turn}-c{clarify}`（issueQuestionId
 * 编码，generate-question.ts:10）——**跨面试碰撞**；而 question_rubric 是全局内容表（无 RLS、
 * UNIQUE(question_id,question_version,rubric_version)，且 publish 的幂等回放不比对内容）。
 * 自适应逐题发布必须以 `iv:{interviewId}:{questionId}` 入全局命名空间，否则第二场面试的
 * 同形题会静默绑到第一场的 rubric（competency/difficulty/内容 hash 全错）。契约侧
 * （issued_question_contract）仍存原样 questionId（owner+interview 作用域，无碰撞面）。
 */
export function scoringRubricQuestionId(interviewId: string, questionId: string): string {
  return `iv:${interviewId}:${questionId}`;
}

export interface PublishRubricAndIssueContractInput {
  interviewId: string;
  questionId: string;
  stateVersion: number;
  turn: number;
  question: string;
  competency: string;
  /** 图状态 plumbing（rev2 D1）：PendingQuestion.difficulty，1..5（域内与 0100 CHECK 同标度）。 */
  difficulty: number;
  /** 题型（issue 契约 form 列）。 */
  kind: string;
}

export interface PublishRubricAndIssueContractResult {
  rubricId: string;
  contractId: string;
  contractReplayed: boolean;
}

/**
 * D1：出题投影事务内发布（幂等）版本化 rubric 并冻结题面契约。
 * 调用方须已 asPrincipal（app_role）——通常与 persistInterviewQuestion 同一投影事务。
 * question_version/rubric_version 恒 1：S1 自适应逐题生成，题面一次冻结；更正走
 * supersedes 链（rubric 侧 append-only 新版本），不在本 helper 参数化。
 */
export async function publishRubricAndIssueContract(
  c: Client, input: PublishRubricAndIssueContractInput,
): Promise<PublishRubricAndIssueContractResult> {
  if (!input.competency || !input.question) {
    throw Object.assign(new Error('scoring_wire_projection_identity_missing'), { code: 'scoring_wire_projection_identity_missing' });
  }
  const difficulty = Math.min(5, Math.max(1, Math.round(input.difficulty)));
  const criteria: RubricCriterionInput[] = [{ criterionId: SCORING_SEED_CRITERION_ID, weight: 1, required: true }];
  const { rubricId } = await publishQuestionRubric(c, {
    // 全局命名空间（见 scoringRubricQuestionId 注释）：防跨面试同形 questionId 静默错绑。
    questionId: scoringRubricQuestionId(input.interviewId, input.questionId),
    questionVersion: 1,
    rubricVersion: 1,
    competency: input.competency,
    difficulty,
    languageScope: SCORING_LANGUAGE_SCOPE,
    questionContentHash: questionContentHashOf(input.question),
    criteria,
  });
  const issued = await issueQuestionContract(c, {
    interviewId: input.interviewId,
    questionId: input.questionId,
    stateVersion: input.stateVersion,
    turn: input.turn,
    questionContentHash: questionContentHashOf(input.question),
    rubricId,
    form: input.kind,
    language: SCORING_LANGUAGE,
    route: SCORING_ROUTE,
    promptPolicyVersion: SCORING_PROMPT_POLICY_VERSION,
    measurementVersion: SCORING_MEASUREMENT_VERSION,
    privacyEpoch: SCORING_ISSUE_PRIVACY_EPOCH,
  });
  return { rubricId, contractId: issued.contractId, contractReplayed: issued.replayed };
}

export interface CreateScoreRequestForSubmissionInput {
  interviewId: string;
  questionId: string;
  stateVersion: number;
  submissionId: string;
  artifactId: string;
  canonicalBodyHmac: string;
  privacyEpoch: number;
}

export type CreateScoreRequestForSubmissionResult =
  | { created: true; requestId: string; replayed: boolean }
  /** 题面契约缺位（S1 接线前发布的存量题/存量面试）——fail-soft 跳过，不阻断 0092 账本提交。 */
  | { created: false; reason: 'contract_missing' };

/**
 * D2（rev2 勘误）：在 **API submit 事务邻域**（与 0092 submitInterviewAnswer 同事务原子）
 * 为 canonical 答案落 score_request（绑 issuedContractId + submissionId/artifactId/bodyHmac）。
 * 幂等键 `sr:{submissionId}`：同提交重放回既有 request；题面契约缺位则跳过（存量残余，
 * 收据声明——不追溯供卡）。调用方须已 asPrincipal（app_role）。
 */
export async function createScoreRequestForSubmission(
  c: Client, input: CreateScoreRequestForSubmissionInput,
): Promise<CreateScoreRequestForSubmissionResult> {
  const contract = await c.query<{ id: string }>(
    `SELECT id FROM issued_question_contract
      WHERE interview_id=$1 AND question_id=$2 AND state_version=$3 AND measurement_version=$4
      ORDER BY created_at DESC LIMIT 1`,
    [input.interviewId, input.questionId, input.stateVersion, SCORING_MEASUREMENT_VERSION],
  );
  const issuedContractId = contract.rows[0]?.id;
  if (!issuedContractId) return { created: false, reason: 'contract_missing' };
  const request = await createScoreRequest(c, {
    issuedContractId,
    submissionId: input.submissionId,
    artifactId: input.artifactId,
    answerBodyHmac: input.canonicalBodyHmac,
    privacyEpoch: input.privacyEpoch,
    operationPolicyVersion: SCORING_OPERATION_POLICY_VERSION,
    answerVersion: 1,
    idempotencyKey: `sr:${input.submissionId}`,
  });
  return { created: true, requestId: request.requestId, replayed: request.replayed };
}

export interface ActiveScoreRequestRow {
  requestId: string;
  status: 'pending' | 'claimed' | 'dispatched';
  leaseToken: string | null;
  artifactId: string;
  answerVersion: number;
}

/**
 * D4 drain 侧定位面：按 (interview, question, stateVersion) 找仍在途（pending/claimed/
 * dispatched）的最新 answer_version 请求。调用方须已 asPrincipal（app_role · owner 作用域
 * RLS 只读）；claim/写卡须另走 asScoringWorkerPrincipal（scoring_worker_executor）。
 */
export async function findActiveScoreRequest(
  c: Client, interviewId: string, questionId: string, stateVersion: number,
): Promise<ActiveScoreRequestRow | null> {
  const r = await c.query<{
    request_id: string; status: 'pending' | 'claimed' | 'dispatched';
    lease_token: string | null; artifact_id: string; answer_version: string | number;
  }>(
    `SELECT sr.id AS request_id, sr.status, sr.lease_token, sr.artifact_id, sr.answer_version
       FROM score_request sr
       JOIN issued_question_contract c ON c.id = sr.issued_contract_id
      WHERE sr.interview_id=$1 AND c.question_id=$2 AND c.state_version=$3
        AND sr.status IN ('pending','claimed','dispatched')
      ORDER BY sr.answer_version DESC, sr.created_at DESC
      LIMIT 1`,
    [interviewId, questionId, stateVersion],
  );
  const row = r.rows[0];
  if (!row) return null;
  const answerVersion = Number(row.answer_version);
  if (!Number.isSafeInteger(answerVersion) || answerVersion < 1) {
    throw Object.assign(new Error('scoring_wire_answer_version_invalid'), { code: 'scoring_wire_answer_version_invalid' });
  }
  return {
    requestId: row.request_id,
    status: row.status,
    leaseToken: row.lease_token,
    artifactId: row.artifact_id,
    answerVersion,
  };
}
