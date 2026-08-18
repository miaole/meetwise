/**
 * @meetwise/db · 评分确定性聚合（SCOR-02）存储侧。
 *
 * 只建「确定性终态 score-writer + C 端只读聚合」两个数据访问面：模型只输出 criterionId +
 * span + digest + disposition，总分在 0103 的 DB 函数内按确定性公式算（模型不得输出自由总分）。
 * writer 只写 practice_eligible/b_review_eligible（isScoreCardScorable）；聚合只读 score_card，
 * legacy `answer_evaluated.score` 整数事件结构性不参与。
 *
 * 权限分离（复用 SCOR-01 角色，不新增角色）：
 *   - scoring_write_final_score_card → EXECUTE 授 scoring_worker_executor（asScoringWorkerPrincipal）。
 *   - scoring_aggregate_interview_scores / scoring_list_scorable_score_cards → EXECUTE 授 app_role
 *     （asPrincipal），C 端只读，owner 作用域 RLS 生效。
 */
import type { Client } from './principal.ts';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

export interface ScoreEvidenceInput {
  criterionId: string;
  sourceAnswerId: string;
  answerVersion: number;
  span: { offsetKind: 'utf8_byte'; start: number; end: number };
  spanDigest: string;
  disposition: 'below' | 'meets' | 'exceeds';
}

export interface WriteFinalScoreCardInput {
  requestId: string;
  leaseToken: string;
  /** 模型只输出 criterionId + span + digest + disposition；总分服务端算，不进本输入。 */
  evidence: ScoreEvidenceInput[];
  targetStatus: 'practice_eligible' | 'b_review_eligible';
}

export interface WriteFinalScoreCardResult {
  cardId: string | null;
  status: string | null;
  deterministicTotal: number | null;
  coverage: number | null;
  uncertainty: Record<string, unknown> | null;
  recorded: boolean;
}

export interface InterviewScoreAggregate {
  eligibleCardCount: number;
  deterministicOverall: number | null;
  nonScoringCardCount: number;
}

export interface ScorableScoreCardRow {
  cardId: string;
  questionId: string;
  rubricId: string;
  deterministicTotal: number;
  coverage: number;
  status: 'practice_eligible' | 'b_review_eligible';
  /** 能力维度（来自 question_rubric，随 rubric_id 冻结）；C 端逐题能力分组用它，不再依赖 legacy 事件。 */
  competency: string;
}

/** 专用终态 writer。调用方须已 asScoringWorkerPrincipal（scoring_worker_executor）。 */
export async function writeFinalScoreCard(c: Client, input: WriteFinalScoreCardInput): Promise<WriteFinalScoreCardResult> {
  const r = await c.query<{
    card_id: string | null; status: string | null; deterministic_total: string | null;
    coverage: string | null; uncertainty: unknown; recorded: boolean;
  }>(
    'SELECT * FROM scoring_write_final_score_card($1,$2,$3,$4)',
    [input.requestId, input.leaseToken, JSON.stringify(input.evidence), input.targetStatus],
  );
  const row = r.rows[0];
  if (!row) fail('scoring_final_card_unavailable');
  return {
    cardId: row.card_id,
    status: row.status,
    deterministicTotal: row.deterministic_total == null ? null : Number(row.deterministic_total),
    coverage: row.coverage == null ? null : Number(row.coverage),
    uncertainty: (row.uncertainty ?? null) as Record<string, unknown> | null,
    recorded: row.recorded === true,
  };
}

/** C 端只读聚合（asPrincipal / app_role）。调用方须已 asPrincipal。 */
export async function aggregateInterviewScores(c: Client, interviewId: string): Promise<InterviewScoreAggregate> {
  const r = await c.query<{ eligible_card_count: string; deterministic_overall: string | null; non_scoring_card_count: string }>(
    'SELECT * FROM scoring_aggregate_interview_scores($1)', [interviewId]);
  const row = r.rows[0];
  if (!row) fail('scoring_aggregate_unavailable');
  return {
    eligibleCardCount: Number(row.eligible_card_count),
    deterministicOverall: row.deterministic_overall == null ? null : Number(row.deterministic_overall),
    nonScoringCardCount: Number(row.non_scoring_card_count),
  };
}

/** C 端逐题读面：只返回可评分态卡（asPrincipal / app_role）。调用方须已 asPrincipal。 */
export async function listScorableScoreCards(c: Client, interviewId: string): Promise<ScorableScoreCardRow[]> {
  const r = await c.query<{
    card_id: string; question_id: string; rubric_id: string;
    deterministic_total: string; coverage: string; status: 'practice_eligible' | 'b_review_eligible';
    competency: string;
  }>('SELECT * FROM scoring_list_scorable_score_cards($1)', [interviewId]);
  return r.rows.map((row) => ({
    cardId: row.card_id,
    questionId: row.question_id,
    rubricId: row.rubric_id,
    deterministicTotal: Number(row.deterministic_total),
    coverage: Number(row.coverage),
    status: row.status,
    competency: row.competency,
  }));
}
