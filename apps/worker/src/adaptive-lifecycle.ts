/**
 * 自适应图的业务投影层。
 * graph checkpoint 是运行态；question ledger + event key 是 API/SSE 的可恢复业务边界。
 */
import {
  asPrincipal, appendEvent, completeInterviewAndConfirm, failInterviewAndRelease, enqueueReport, markApplicationAssessmentUnavailable, markApplicationNoEligibleScore,
  persistInterviewQuestion, verifyInterviewAnswerClaim, markInterviewAnswerApplied, enrollCheckpointThread,
  assertInterviewGraphFence, type AcceptedInterviewAnswer, type DbPool, type InterviewGraphFence,
} from '@meetwise/db';
import { Command } from '@langchain/langgraph';
import { buildAdaptiveInterviewGraph, type PendingQuestion } from '@meetwise/ai-graphs';
import type { ModelClient, GraphObserver } from '@meetwise/ai-runtime';
import type { ScoredRef, SourceDoc, CompetencySpec, ResearchBoundaryDecision } from '@meetwise/domain';
import { buildAdaptiveDeps, planCompetencies } from './adaptive-interview-service.ts';
import { recordAskedQuestions } from './memory-service.ts';

const pendingQuestion = (snap: any): PendingQuestion | undefined =>
  snap.values?.pending ?? snap.tasks?.[0]?.interrupts?.[0]?.value;

export interface AdaptiveLifecycleDeps {
  pool: DbPool; cp: any; owner: string; interviewId: string; model: ModelClient;
  fastModel?: ModelClient;
  localRetrieve: (q: string) => Promise<ScoredRef[]>;
  webExplore: (q: string) => Promise<SourceDoc[]>;
  deepResearch?: (q: string) => Promise<SourceDoc[]>;
  researchBoundary?: (q: string) => ResearchBoundaryDecision;
  competencyKeywords?: Record<string, string[]>;
  /** 仅隔离 E2E 可降低真实图的收口轮数；生产调用不传，图保持默认 8 轮。 */
  maxTurns?: number;
  /** consumer 持有的 durable graph ownership；图外写入必须复核，防止过期 worker 继续投影。 */
  fence?: InterviewGraphFence;
  /** 组合根注入的安全图观测器；ai-graphs 本身不依赖任何观测供应商。 */
  graphObserver?: GraphObserver;
  /** 仅测试观测：在读取脱敏简历画像前触发；生产不注入，不承载业务逻辑。 */
  onBeforeResumeProfileHydration?: () => void;
}

async function requireCurrentFence(c: Parameters<typeof assertInterviewGraphFence>[0], d: AdaptiveLifecycleDeps): Promise<void> {
  if (d.fence && !await assertInterviewGraphFence(c, d.fence))
    throw Object.assign(new Error('graph_fence_lost'), { code: 'graph_fence_lost' });
}

function makeDeps(
  d: AdaptiveLifecycleDeps,
  competencies: (string | CompetencySpec)[],
  resumeProfileAvailable = false,
  answer?: AcceptedInterviewAnswer,
) {
  return buildAdaptiveDeps({
    pool: d.pool, owner: d.owner, threadId: d.interviewId, model: d.model, fastModel: d.fastModel,
    competencies, resumeProfileAvailable, localRetrieve: d.localRetrieve, webExplore: d.webExplore, deepResearch: d.deepResearch, researchBoundary: d.researchBoundary, competencyKeywords: d.competencyKeywords, maxTurns: d.maxTurns, graphObserver: d.graphObserver,
    loadAnswer: async (reference) => {
      if (!answer || reference.answerId !== answer.answerId)
        throw Object.assign(new Error('answer_artifact_unavailable'), { code: 'answer_artifact_unavailable' });
      return answer.answer;
    },
  });
}

/**
 * Resume personalization is only an authorization bit at the graph boundary.
 * This function reads the profile under owner RLS, but no fact text leaves the
 * DB callback: historic checkpoints cannot retain it through a generated
 * question, interrupt payload or transcript.
 */
async function hasResumeProfileFactsForInterview(d: AdaptiveLifecycleDeps): Promise<boolean> {
  return asPrincipal(d.pool, d.owner, async (c) => {
    // The profile is sensitive derived data.  Read it only through the
    // immutable parent `(resume_id, privacy_epoch)` and the active resume
    // generation, never by a bare resume id left in a historical interview.
    const parent = await c.query<{ resume_id: string }>(
      `SELECT i.resume_id::text AS resume_id
         FROM interview i
         JOIN resume r ON r.id=i.resume_id AND r.owner_user_id=i.owner_user_id
        WHERE i.id=$1
          AND i.owner_user_id=$2
          AND i.resume_id IS NOT NULL
          AND i.resume_privacy_epoch IS NOT NULL
          AND r.status='ingested'
          AND r.privacy_epoch=i.resume_privacy_epoch`, [d.interviewId, d.owner],
    );
    const resumeId = parent.rows[0]?.resume_id;
    if (!resumeId) return false;
    d.onBeforeResumeProfileHydration?.();
    const profile = await c.query<{ structured: unknown }>(
      'SELECT structured FROM resume_profile WHERE resume_id=$1 AND owner_user_id=$2', [resumeId, d.owner],
    );
    const facts = (profile.rows[0]?.structured as { facts?: unknown } | undefined)?.facts;
    return Array.isArray(facts) && facts.some((value) => typeof value === 'string' && value.trim().length > 0);
  });
}

function runGraph<T>(d: AdaptiveLifecycleDeps, phase: 'start' | 'answer', action: () => Promise<T>): Promise<T> {
  return d.graphObserver
    ? d.graphObserver.runGraph({ graph: 'adaptive-interview', owner: d.owner, threadId: d.interviewId, phase, release: 'adaptive-interview/v1' }, action)
    : action();
}

/** pending question 先入 question ledger，再发具有相同 identity 的 SSE 业务事件。 */
async function persistAndEmitQuestion(d: AdaptiveLifecycleDeps, p: PendingQuestion): Promise<void> {
  await asPrincipal(d.pool, d.owner, async (c) => {
    await requireCurrentFence(c, d);
    await persistInterviewQuestion(c, d.owner, d.interviewId, {
      questionId: p.questionId, stateVersion: p.stateVersion, turn: p.turn,
      question: p.question, competency: p.competency, qkind: p.kind,
    });
    await appendEvent(c, d.owner, d.interviewId, 'question_ready', {
      questionId: p.questionId, stateVersion: p.stateVersion, turn: p.turn,
      question: p.question, competency: p.competency, qkind: p.kind,
    }, `question_ready:${p.questionId}`);
  });
}

/** 开始到第一个纯 awaitAnswer interrupt。重试只会投影同一 question/event，不会重生模型题。 */
async function startAdaptiveInterviewImpl(d: AdaptiveLifecycleDeps, role: string, facts: string[]): Promise<{ question?: string; questionId?: string; stateVersion?: number }> {
  // The planner may know a profile exists, but not its raw facts.  This is a
  // deliberate fail-closed mitigation until fact references have their own
  // artifact/deletion lifecycle.
  const resumeProfileAvailable = facts.some((fact) => fact.trim().length > 0);
  const competencies = await planCompetencies(d.pool, d.owner, d.interviewId, d.fastModel ?? d.model, role, resumeProfileAvailable ? ['authorized_resume_profile_available'] : []);
  await asPrincipal(d.pool, d.owner, (c) => enrollCheckpointThread(c, d.owner, d.interviewId));
  const g = buildAdaptiveInterviewGraph(d.cp, makeDeps(d, competencies, resumeProfileAvailable));
  const cfg = { configurable: { thread_id: d.interviewId } };
  // start job 在 checkpoint 已到 awaitAnswer、但 ledger/SSE 投影尚未来得及提交时会被重投。
  // 对 interrupt 中的图再 invoke({}) 会重新从 START 走到 genQuestion（从而浪费模型调用并换题）；
  // 先读 pending，存在则只补业务投影，绝不触碰图执行。
  let snap = await g.getState(cfg);
  if (!pendingQuestion(snap)) {
    await g.invoke({}, cfg);
    snap = await g.getState(cfg);
  }
  const pending = pendingQuestion(snap);
  if (pending) await persistAndEmitQuestion(d, pending);
  return { question: pending?.question, questionId: pending?.questionId, stateVersion: pending?.stateVersion };
}

export function startAdaptiveInterview(d: AdaptiveLifecycleDeps, role: string, facts: string[]): Promise<{ question?: string; questionId?: string; stateVersion?: number }> {
  return runGraph(d, 'start', () => startAdaptiveInterviewImpl(d, role, facts));
}

/**
 * 回答 job 的 crash-safe resume：
 * - 先核对 graph pending 与 API 已占用的 question identity；
 * - 若 checkpoint 已经前进但事件投影尚未提交，只重放投影，绝不再次 Command(resume)；
 * - answer/question event 以 questionId 去重，next question 在同一投影事务中先落 ledger。
 */
async function submitAdaptiveAnswerImpl(
  d: AdaptiveLifecycleDeps, input: AcceptedInterviewAnswer,
): Promise<{ score?: number; nextQuestion?: string; nextQuestionId?: string; done: boolean; clarifying: boolean; degraded: boolean }> {
  await asPrincipal(d.pool, d.owner, (c) => enrollCheckpointThread(c, d.owner, d.interviewId));
  const resumeProfileAvailable = await hasResumeProfileFactsForInterview(d);
  const g = buildAdaptiveInterviewGraph(d.cp, makeDeps(d, [], resumeProfileAvailable, input));
  const cfg = { configurable: { thread_id: d.interviewId } };
  const before = await g.getState(cfg);
  const beforeTranscript = (before.values?.transcript ?? []) as { questionId?: string }[];
  const alreadyApplied = beforeTranscript[beforeTranscript.length - 1]?.questionId === input.questionId;
  if (!alreadyApplied) {
    const pending = pendingQuestion(before);
    if (!pending || pending.questionId !== input.questionId || pending.stateVersion !== input.stateVersion || pending.turn !== input.turn)
      throw Object.assign(new Error('stale_question'), { code: 'stale_question' });
    const claimed = await asPrincipal(d.pool, d.owner, (c) => verifyInterviewAnswerClaim(c, d.owner, d.interviewId, input));
    if (!claimed) throw Object.assign(new Error('answer_identity_not_claimed'), { code: 'answer_identity_not_claimed' });
    await g.invoke(new Command({ resume: { answerId: input.answerId } }), cfg);
  }
  const snap = alreadyApplied ? before : await g.getState(cfg);
  const transcript = (snap.values?.transcript ?? []) as Array<{
    questionId?: string; stateVersion?: number; score: number | null; outcome?: string; competency?: string; q?: string; hint?: string; reason?: string;
  }>;
  const last = transcript[transcript.length - 1];
  if (!last || last.questionId !== input.questionId)
    throw Object.assign(new Error('answer_not_applied_to_expected_question'), { code: 'answer_not_applied_to_expected_question' });
  const next = pendingQuestion(snap);
  const clarifying = last.outcome === 'clarify';
  const unscored = last.outcome === 'unscored';
  const done = (snap.next?.length ?? 0) === 0;

  await asPrincipal(d.pool, d.owner, async (c) => {
    await requireCurrentFence(c, d);
    const claimed = await verifyInterviewAnswerClaim(c, d.owner, d.interviewId, input);
    if (!claimed) throw Object.assign(new Error('answer_identity_lost'), { code: 'answer_identity_lost' });
    if (!await markInterviewAnswerApplied(c, d.owner, d.interviewId, input))
      throw Object.assign(new Error('answer_apply_fence_lost'), { code: 'answer_apply_fence_lost' });
    if (next) await persistInterviewQuestion(c, d.owner, d.interviewId, {
      questionId: next.questionId, stateVersion: next.stateVersion, turn: next.turn,
      question: next.question, competency: next.competency, qkind: next.kind,
    });
    if (unscored) {
      await appendEvent(c, d.owner, d.interviewId, 'answer_unscored', {
        questionId: input.questionId, stateVersion: last.stateVersion, turn: input.turn,
        reason: last.reason ?? 'evaluation_unavailable', competency: last.competency, question: last.q ?? '',
      }, `answer_unscored:${input.questionId}`);
      return;
    }
    if (clarifying && !done) {
      await appendEvent(c, d.owner, d.interviewId, 'clarification_needed', {
        questionId: next?.questionId, stateVersion: next?.stateVersion, turn: next?.turn,
        hint: last.hint ?? '', question: next?.question ?? last.q ?? '', competency: last.competency,
      }, `clarification:${input.questionId}`);
      return;
    }
    const outcome = clarifying ? 'unresolved' : (last.outcome ?? 'answered');
    if (typeof last.score !== 'number') throw Object.assign(new Error('scored_turn_missing_score'), { code: 'scored_turn_missing_score' });
    await appendEvent(c, d.owner, d.interviewId, 'answer_evaluated', {
      questionId: input.questionId, stateVersion: last.stateVersion, answerId: input.answerId, answerHash: input.answerHash, turn: input.turn,
      score: last.score, outcome, competency: last.competency, question: last.q ?? '',
    }, `answer_evaluated:${input.questionId}`);
    if (next) await appendEvent(c, d.owner, d.interviewId, 'question_ready', {
      questionId: next.questionId, stateVersion: next.stateVersion, turn: next.turn,
      question: next.question, competency: next.competency, qkind: next.kind,
    }, `question_ready:${next.questionId}`);
  });

  if (done) {
    await asPrincipal(d.pool, d.owner, async (c) => {
      await requireCurrentFence(c, d);
      const evidence = await c.query<{ unscored: number; eligible: number }>(
        `SELECT count(*) FILTER (WHERE kind='answer_unscored')::int AS unscored,
                count(*) FILTER (
                  WHERE kind='answer_evaluated'
                    AND payload ?& ARRAY['questionId','stateVersion','answerId','answerHash','competency']
                    AND COALESCE(payload->>'questionId','') <> ''
                    AND COALESCE(payload->>'answerId','') <> ''
                    AND COALESCE(payload->>'answerHash','') ~ '^[a-f0-9]{64}$'
                    AND COALESCE(payload->>'competency','') <> ''
                    AND COALESCE(payload->>'stateVersion','') ~ '^[0-9]+$'
                    AND COALESCE(payload->>'outcome','answered') <> 'unresolved'
                    AND COALESCE(payload->>'score','') ~ '^[0-9]+(\\.[0-9]+)?$'
                    AND (payload->>'score')::numeric BETWEEN 0 AND 100
                )::int AS eligible
           FROM interview_event WHERE stream_key=$1`, [d.interviewId],
      );
      const counted = evidence.rows[0];
      if (!counted) throw Object.assign(new Error('interview_score_evidence_missing'), { code: 'interview_score_evidence_missing' });
      const unscored = Number(counted.unscored);
      const eligible = Number(counted.eligible);
      if (unscored === 0 && eligible > 0) {
        await completeInterviewAndConfirm(c, d.owner, d.interviewId);
        await enqueueReport(c, d.owner, d.interviewId);
      } else if (unscored === 0) {
        // A fully skipped / unresolved B-side session is not a zero-score
        // completion.  The interaction is still completed and paid, but its
        // application becomes visibly retryable without inventing evidence.
        await completeInterviewAndConfirm(c, d.owner, d.interviewId);
        const mark = await markApplicationNoEligibleScore(c, d.owner, d.interviewId);
        // A C-side interview has no application projection.  Preserve its
        // ordinary report bulkhead instead of creating a terminal-less
        // scoreless branch; only a bound B-side session receives the special
        // retryable application terminal.
        if (mark === 'unbound') {
          await enqueueReport(c, d.owner, d.interviewId);
        } else if (mark !== 'stale') {
          await appendEvent(c, d.owner, d.interviewId, 'assessment_unavailable', { reason: 'no_eligible_scored_answer' }, 'assessment_unavailable:no_eligible_scored_answer');
        }
      } else {
        // A missing evidence-backed score cannot become a zero or partial B-side
        // result.  This compensates the reservation and puts any bound
        // application in a visible, retryable terminal state in the same tx.
        await failInterviewAndRelease(c, d.owner, d.interviewId);
        const mark = await markApplicationAssessmentUnavailable(c, d.owner, d.interviewId);
        if (mark !== 'stale')
          await appendEvent(c, d.owner, d.interviewId, 'assessment_unavailable', { reason: 'evaluation_unscored' }, 'assessment_unavailable:evaluation_unscored');
      }
    });
    const asked = transcript.map((t) => t.q).filter((q): q is string => !!q);
    await recordAskedQuestions(d.pool, d.owner, asked, d.interviewId)
      .catch((e) => console.warn('memory: 跨会话判重 episode 写入跳过(非致命)', (e as any)?.code ?? e));
  }
  return {
    score: typeof last.score === 'number' ? last.score : undefined,
    nextQuestion: next?.question, nextQuestionId: next?.questionId,
    done, clarifying, degraded: unscored,
  };
}

export function submitAdaptiveAnswer(
  d: AdaptiveLifecycleDeps, input: AcceptedInterviewAnswer,
): Promise<{ score?: number; nextQuestion?: string; nextQuestionId?: string; done: boolean; clarifying: boolean; degraded: boolean }> {
  return runGraph(d, 'answer', () => submitAdaptiveAnswerImpl(d, input));
}
