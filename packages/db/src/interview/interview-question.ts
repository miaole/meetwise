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
  /**
   * billing P1（BILL1-TOPIC-FIELDS 修法⑥·additive 可选·0170 三列）：话题维度——topicId=话题归集键
   * （pivot=自己/probe·clarify=主问题 id）；askMode=出题方式；clarifyCause=澄清双因（仅 clarify
   * 重发行）。缺省 undefined → 列 NULL（旧行为空=不按话题计费语义保留；qbank-miss 等既有 caller
   * 零改即兼容）。
   */
  topicId?: string;
  askMode?: 'pivot' | 'probe' | 'clarify';
  clarifyCause?: 'non_answer' | 'quote_unverifiable';
}

export interface AcceptedInterviewAnswer {
  questionId: string;
  stateVersion: number;
  answerId: string;
  answerHash: string;
  turn: number;
  answer: string;
  /** 已有转写结果。缺省表示调用方没有给出转写结果。 */
  asrOutcome?: string;
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
    `INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,competency,qkind,review_status,topic_id,ask_mode,clarify_cause)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (owner_user_id,interview_id,question_id) DO NOTHING`,
    [owner, interviewId, q.questionId, q.stateVersion, q.turn, q.question, q.competency ?? null, q.qkind ?? null, q.reviewStatus ?? 'none',
      q.topicId ?? null, q.askMode ?? null, q.clarifyCause ?? null],
  );
  if (ins.rowCount === 1) return;
  const ex = await c.query(
    `SELECT state_version,turn,question,competency,qkind,review_status,topic_id,ask_mode,clarify_cause FROM interview_question
      WHERE owner_user_id=$1 AND interview_id=$2 AND question_id=$3`,
    [owner, interviewId, q.questionId],
  );
  const row = ex.rows[0];
  if (!row || Number(row.state_version) !== q.stateVersion || Number(row.turn) !== q.turn || row.question !== q.question
    || (row.competency ?? undefined) !== q.competency || (row.qkind ?? undefined) !== q.qkind
    || (row.review_status ?? 'none') !== (q.reviewStatus ?? 'none')
    // billing P1：三新列同形扩——旧行（0170 前存量）与旧 checkpoint 重放两侧均 NULL/undefined 恒等，
    // 崩溃重放幂等不变（同 identity 同派生值）。
    || (row.topic_id ?? undefined) !== q.topicId || (row.ask_mode ?? undefined) !== q.askMode
    || (row.clarify_cause ?? undefined) !== q.clarifyCause) {
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

/** 与作答长度上限一致。更长的转写文本无法原样成为这次作答，不暂存。 */
const ISSUED_TRANSCRIPT_MAX_CHARS = 8000;

/**
 * 已暂存的转写原文能否作为这次作答的转写结果。
 * 只接受原文本身，或客户端把首尾空白去掉后放进作答框的那一种。
 * 其余作答（打字、或改过的文本）不返回，避免把一切答案都当成转写成功。
 */
export function asrOutcomeForStoredTranscript(stored: string | null | undefined, answer: string): string | undefined {
  if (typeof stored !== 'string') return undefined;
  if (stored.length === 0 || stored.length > ISSUED_TRANSCRIPT_MAX_CHARS) return undefined;
  const trimmed = stored.trim();
  if (trimmed === '') return undefined;
  if (answer === stored) return stored;
  if (trimmed !== stored && answer === trimmed) return stored;
  return undefined;
}

/** 转写成功后，把原文写到仍处于 issued 的那道题。题已换发或已占用则不写。 */
export async function rememberIssuedQuestionTranscript(
  c: Client, owner: string, interviewId: string, questionId: string, text: string,
): Promise<void> {
  if (typeof questionId !== 'string' || questionId.length === 0) return;
  if (typeof text !== 'string' || text.length === 0 || text.length > ISSUED_TRANSCRIPT_MAX_CHARS) return;
  if (text.trim() === '') return;
  await c.query(
    `UPDATE interview_question SET asr_transcript=$4
      WHERE owner_user_id=$1 AND interview_id=$2 AND question_id=$3 AND status='issued'`,
    [owner, interviewId, questionId, text],
  );
}

/**
 * 作答入队前取走本题暂存的转写原文。状态仍须是 issued；重放时题已 queued，读不到，也不覆盖已入队的载荷。
 * 返回的 asrOutcome 是原文（含客户端去掉的首尾空白），不是作答框里的文本。
 */
export async function loadTranscribedAnswerJobPayload(
  c: Client, owner: string, interviewId: string, body: AcceptedInterviewAnswer, requestId?: string,
): Promise<AcceptedInterviewAnswer & { requestId?: string }> {
  const locked = await c.query<Record<string, string | null>>(
    `SELECT asr_transcript FROM interview_question
      WHERE owner_user_id=$1 AND interview_id=$2 AND question_id=$3 AND status='issued'
      FOR UPDATE`,
    [owner, interviewId, body.questionId],
  );
  const stored = locked.rows[0]?.['asr_transcript'];
  if (typeof stored === 'string') {
    await c.query(
      `UPDATE interview_question SET asr_transcript=NULL
        WHERE owner_user_id=$1 AND interview_id=$2 AND question_id=$3 AND status='issued'`,
      [owner, interviewId, body.questionId],
    );
  }
  const asrOutcome = asrOutcomeForStoredTranscript(stored, body.answer);
  const payload: AcceptedInterviewAnswer & { requestId?: string } = {
    questionId: body.questionId,
    stateVersion: body.stateVersion,
    answerId: body.answerId,
    answerHash: body.answerHash,
    turn: body.turn,
    answer: body.answer,
  };
  if (requestId !== undefined) payload.requestId = requestId;
  if (asrOutcome !== undefined) payload.asrOutcome = asrOutcome;
  return payload;
}
