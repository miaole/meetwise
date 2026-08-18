/**
 * 图外 question/answer identity ledger。
 * LangGraph 的 Command(resume) 不认识 questionId；此表是 API 与 worker 共同使用的
 * fencing 点：只有当前 issued question 能被接受，重放必须携带相同 answerId+hash。
 */
import { createHash } from 'node:crypto';
import type { PoolClient as Client } from 'pg';

export interface PersistedInterviewQuestion {
  questionId: string;
  stateVersion: number;
  turn: number;
  question: string;
  competency?: string;
  qkind?: string;
  /** RAG-FUNNEL-05：LLM 同桶生成题必须 `review_required`（⇒ score_excluded）；既有 caller 缺省 `none`。 */
  reviewStatus?: 'none' | 'review_required';
}

export interface AcceptedInterviewAnswer {
  questionId: string;
  stateVersion: number;
  answerId: string;
  answerHash: string;
  turn: number;
  answer: string;
}

export type ClaimAnswerResult =
  | { status: 'accepted' }
  | { status: 'replayed' }
  | { status: 'not_ready' }
  | { status: 'stale' }
  | { status: 'conflict' }
  | { status: 'hash_mismatch' };

export function answerHash(answer: string): string {
  return createHash('sha256').update(answer, 'utf8').digest('hex');
}

/** 幂等持久化已由 graph checkpoint 产出的 pending question；同 identity 的 crash replay 只能读回，不能改题面。 */
export async function persistInterviewQuestion(
  c: Client, owner: string, interviewId: string, q: PersistedInterviewQuestion,
): Promise<void> {
  const ins = await c.query(
    `INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,competency,qkind,review_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (owner_user_id,interview_id,question_id) DO NOTHING`,
    [owner, interviewId, q.questionId, q.stateVersion, q.turn, q.question, q.competency ?? null, q.qkind ?? null, q.reviewStatus ?? 'none'],
  );
  if (ins.rowCount === 1) return;
  const ex = await c.query(
    `SELECT state_version,turn,question,competency,qkind,review_status FROM interview_question
      WHERE owner_user_id=$1 AND interview_id=$2 AND question_id=$3`,
    [owner, interviewId, q.questionId],
  );
  const row = ex.rows[0];
  if (!row || Number(row.state_version) !== q.stateVersion || Number(row.turn) !== q.turn || row.question !== q.question
    || (row.competency ?? undefined) !== q.competency || (row.qkind ?? undefined) !== q.qkind
    || (row.review_status ?? 'none') !== (q.reviewStatus ?? 'none')) {
    throw Object.assign(new Error('question_identity_conflict'), { code: 'question_identity_conflict' });
  }
}

/**
 * API 事务内占用当前题。answerHash 重新由正文计算，不能信客户端字段；相同 identity 可重放，
 * 不同 identity/正文一律拒绝，避免第二标签页覆盖或把旧答案投给新 interrupt。
 */
export async function claimInterviewAnswer(
  c: Client, owner: string, interviewId: string, a: AcceptedInterviewAnswer,
): Promise<ClaimAnswerResult> {
  if (answerHash(a.answer) !== a.answerHash) return { status: 'hash_mismatch' };
  const q = await c.query(
    `SELECT state_version,turn,status,answer_id,answer_hash FROM interview_question
      WHERE owner_user_id=$1 AND interview_id=$2 AND question_id=$3 FOR UPDATE`,
    [owner, interviewId, a.questionId],
  );
  if (q.rowCount === 0) return { status: 'not_ready' };
  const row = q.rows[0];
  if (Number(row.state_version) !== a.stateVersion || Number(row.turn) !== a.turn || row.status === 'cancelled') return { status: 'stale' };
  if (row.status === 'issued') {
    const upd = await c.query(
      `UPDATE interview_question SET status='queued',answer_id=$4,answer_hash=$5
        WHERE owner_user_id=$1 AND interview_id=$2 AND question_id=$3 AND status='issued'`,
      [owner, interviewId, a.questionId, a.answerId, a.answerHash],
    );
    return upd.rowCount === 1 ? { status: 'accepted' } : { status: 'conflict' };
  }
  if ((row.status === 'queued' || row.status === 'answered')
      && row.answer_id === a.answerId && row.answer_hash === a.answerHash) return { status: 'replayed' };
  // The server has already consumed this identity with another answer. Expose
  // it as stale (not a generic conflict) so clients can discard the old
  // question token instead of retrying it forever after a clarification/tab
  // race. Exact same answerId/hash above remains the sole idempotent replay.
  return { status: 'stale' };
}

/** worker 只接受被 API 占用、且 identity 未变的答案；防绕过 API 或旧 job 重放。 */
export async function verifyInterviewAnswerClaim(
  c: Client, owner: string, interviewId: string, a: AcceptedInterviewAnswer,
): Promise<boolean> {
  const r = await c.query(
    `SELECT 1 FROM interview_question
      WHERE owner_user_id=$1 AND interview_id=$2 AND question_id=$3 AND state_version=$4 AND turn=$5
        AND status IN ('queued','answered') AND answer_id=$6 AND answer_hash=$7`,
    [owner, interviewId, a.questionId, a.stateVersion, a.turn, a.answerId, a.answerHash],
  );
  return r.rowCount === 1;
}

/** 评分/图 checkpoint 已完成后才标 answered；同 identity 重放返回 true，绝不覆盖别的答案。 */
export async function markInterviewAnswerApplied(
  c: Client, owner: string, interviewId: string, a: AcceptedInterviewAnswer,
): Promise<boolean> {
  const r = await c.query(
    `UPDATE interview_question SET status='answered', answered_at=COALESCE(answered_at,now())
      WHERE owner_user_id=$1 AND interview_id=$2 AND question_id=$3 AND state_version=$4 AND turn=$5
        AND status='queued' AND answer_id=$6 AND answer_hash=$7`,
    [owner, interviewId, a.questionId, a.stateVersion, a.turn, a.answerId, a.answerHash],
  );
  if (r.rowCount === 1) return true;
  return verifyInterviewAnswerClaim(c, owner, interviewId, a);
}

export async function cancelOpenInterviewQuestion(c: Client, owner: string, interviewId: string): Promise<void> {
  await c.query(
    `UPDATE interview_question SET status='cancelled'
      WHERE owner_user_id=$1 AND interview_id=$2 AND status IN ('issued','queued')`,
    [owner, interviewId],
  );
}
