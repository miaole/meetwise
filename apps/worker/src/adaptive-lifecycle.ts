/**
 * 自适应图的业务投影层。
 * graph checkpoint 是运行态；question ledger + event key 是 API/SSE 的可恢复业务边界。
 */
import {
  asPrincipal, appendEvent, completeInterviewAndConfirm, failInterviewAndRelease, enqueueReport, markApplicationAssessmentUnavailable, markApplicationNoEligibleScore,
  persistInterviewQuestion, verifyInterviewAnswerClaim, markInterviewAnswerApplied, enrollCheckpointThread,
  assertInterviewGraphFence, publishRubricAndIssueContract,
  type AcceptedInterviewAnswer, type DbPool, type InterviewGraphFence,
} from '@meetwise/db';
import { Command } from '@langchain/langgraph';
import { buildAdaptiveInterviewGraph, type PendingQuestion } from '@meetwise/ai-graphs';
import type { ModelClient, GraphObserver } from '@meetwise/ai-runtime';
import { admitInterviewResume, type QuestionGenerationProvenance, type ScoredRef, type SourceDoc, type CompetencySpec, type ResearchBoundaryDecision } from '@meetwise/domain';
import { buildAdaptiveDeps, planCompetencies } from './adaptive-interview-service.ts';
import { writeScoreCardAfterProjectionFenceTolerant } from './score-writer.ts';
import { buildAdaptiveDeps, buildResumeFactPool, planCompetencies, selectPlannerFacts } from './adaptive-interview-service.ts';

import { recordAskedQuestions } from './memory-service.ts';
import { emitSignalConcludeEvent } from './signal-conclude-event.ts';

export type InterviewGenerationUnavailable = {
  reason: string;
  provenance: QuestionGenerationProvenance;
};

function generationFailureOf(snap: any): InterviewGenerationUnavailable | null {
  const provenance = snap.values?.generationProvenance as QuestionGenerationProvenance | null | undefined;
  const degraded = snap.values?.degraded as { reason?: string } | null | undefined;
  if (provenance?.origin === 'unavailable') {
    const errorCode = provenance.errorCode ?? 'generation_unavailable';
    return {
      reason: `generation_${errorCode}`,
      provenance: { ...provenance, origin: 'unavailable', errorCode },
    };
  }
  if (typeof degraded?.reason === 'string' && degraded.reason.startsWith('generation_')) {
    return {
      reason: degraded.reason,
      provenance: { origin: 'unavailable', errorCode: 'generation_unavailable', invokeError: degraded.reason },
    };
  }
  return null;
}

const pendingQuestion = (snap: any): PendingQuestion | undefined => {
  if (snap.values?.concluded === true || generationFailureOf(snap)) return undefined;
  return snap.values?.pending ?? snap.tasks?.[0]?.interrupts?.[0]?.value;
};

async function writeGenerationUnavailable(
  c: Parameters<typeof failInterviewAndRelease>[0],
  d: AdaptiveLifecycleDeps,
  failure: InterviewGenerationUnavailable,
): Promise<void> {
  await requireCurrentFence(c, d);
  await failInterviewAndRelease(c, d.owner, d.interviewId);
  // G7FIX-4 与 job 失败族（interview-consumer.ts terminalizeUnsettledInterview）对称：
  // generation 终态同样在同一事务、同一 client 内把绑定申请收口为 assessment_unavailable
  // 正向可重试终态（i.status='failed' AND ja.status='in_progress' AND attempt 匹配才命中）。
  // 'unbound'（C 端舱壁）/'stale'（old-attempt worker 防双写）双闸由 marker 自身语义承担；
  // 事件分流与其对齐：updated/replayed → assessment_unavailable，unbound → interview_unavailable，
  // stale 不补任何事件（与 consumer.ts:90 提前返回同形，绝不给已推进的下一 attempt 追加旧终态）。
  const applicationMark = await markApplicationAssessmentUnavailable(c, d.owner, d.interviewId);
  if (applicationMark === 'updated' || applicationMark === 'replayed') {
    // 事件键循 consumer.ts:92 先例 `assessment_unavailable:${reason}`；reason 恒为
    // generation_* 前缀（generationFailureOf 保证），与 no_eligible_scored_answer /
    // evaluation_unscored 两个固定键零碰撞。
    await appendEvent(c, d.owner, d.interviewId, 'assessment_unavailable', {
      reason: failure.reason,
      provenance: failure.provenance,
    }, `assessment_unavailable:${failure.reason}`);
    return;
  }
  if (applicationMark !== 'stale') {
    await appendEvent(c, d.owner, d.interviewId, 'interview_unavailable', {
      reason: failure.reason,
      provenance: failure.provenance,
    }, 'interview_unavailable:terminal');
  }
}

async function emitGenerationUnavailable(d: AdaptiveLifecycleDeps, failure: InterviewGenerationUnavailable): Promise<void> {
  await asPrincipal(d.pool, d.owner, (c) => writeGenerationUnavailable(c, d, failure));
}

export interface AdaptiveLifecycleDeps {
  pool: DbPool; cp: any; owner: string; interviewId: string; model: ModelClient;
  fastModel?: ModelClient;
  localRetrieve: (q: string) => Promise<ScoredRef[]>;
  webExplore: (q: string) => Promise<SourceDoc[]>;
  deepResearch?: (q: string) => Promise<SourceDoc[]>;
  researchBoundary?: (q: string) => ResearchBoundaryDecision;
  competencyKeywords?: Record<string, string[]>;
  /** 软预算初值；仅隔离 E2E 可缩短。生产不传，由覆盖计划派生，decideNext 可上调。 */
  maxTurns?: number;
  /** 平台杀开关；E2E 可压低。生产默认 120，不是质量政策。 */
  absoluteMaxTurns?: number;
  /** consumer 持有的 durable graph ownership；图外写入必须复核，防止过期 worker 继续投影。 */
  fence?: InterviewGraphFence;
  /** 组合根注入的安全图观测器；ai-graphs 本身不依赖任何观测供应商。 */
  graphObserver?: GraphObserver;
  /** 仅测试观测：在读取脱敏简历画像前触发；生产不注入，不承载业务逻辑。 */
  onBeforeResumeProfileHydration?: () => void;
  /**
   * EXTREV-1 SCORE-WRITER S1（rev2 D3/D4）：score_request claim 的 lease_owner。缺省 =
   * 该 drain 不执行写卡步（兼容旧 seam/测试）。生产由 consumer 注入 job 级 leaseOwner。
   */
  scoreWriterLeaseOwner?: string;
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
  resumeFactPool: readonly string[] = [],
) {
  return buildAdaptiveDeps({
    pool: d.pool, owner: d.owner, threadId: d.interviewId, model: d.model, fastModel: d.fastModel,
    competencies, resumeProfileAvailable, resumeFacts: [...resumeFactPool], localRetrieve: d.localRetrieve, webExplore: d.webExplore, deepResearch: d.deepResearch, researchBoundary: d.researchBoundary, competencyKeywords: d.competencyKeywords, maxTurns: d.maxTurns, absoluteMaxTurns: d.absoluteMaxTurns, graphObserver: d.graphObserver,
    loadAnswer: async (reference) => {
      if (!answer || reference.answerId !== answer.answerId)
        throw Object.assign(new Error('answer_artifact_unavailable'), { code: 'answer_artifact_unavailable' });
      return answer.answer;
    },
  });
}

/** C1/S1(RESUME-GROUNDING)同门读取产物:授权位 + 有界 facts 池(仅 worker deps 闭包持有,禁入图 state)。 */
interface InterviewResumeGrounding {
  available: boolean;
  pool: string[];
}

/**
 * Resume personalization reaches the model seam, and only through the worker
 * deps closure (C1/C3 · RESUME-GROUNDING): facts 输入仅在 worker deps 闭包内经
 * `<data-nonce>` 围栏直达模型 seam，禁入图 state/checkpoint/interrupt/SSE/episode；
 * 模型产出的 grounded 题面属派生内容可持久化，其擦除残差（interview_event/题面 ledger/memory
 * episode/ai_invocation_trace.output 中的事实派生片段）登记 Non-claims 并归 #183/#153
 * PRIVACY-FACE（roadmap:84）收口。This function reads the profile under owner RLS
 * through the immutable parent `(resume_id, privacy_epoch)` and the active resume
 * generation (never by a bare resume id left in a historical interview), passes the
 * same `admitInterviewResume` admission gate, and returns a bounded fact pool
 * (buildResumeFactPool: 脱敏/敏感词过滤 ∩ experience>skills 小节优先 ∩ 条数/字符帽);
 * historic checkpoints still cannot retain fact text through a generated question,
 * interrupt payload or transcript.
 */
async function loadInterviewResumeGrounding(d: AdaptiveLifecycleDeps): Promise<InterviewResumeGrounding> {
  return asPrincipal(d.pool, d.owner, async (c) => {
    // The profile is sensitive derived data.  Read it only through the
    // immutable parent `(resume_id, privacy_epoch)` and the active resume
    // generation, never by a bare resume id left in a historical interview.
    const parent = await c.query<{ resume_id: string; source_kind: string }>(
      `SELECT i.resume_id::text AS resume_id, r.source_kind
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
    if (!resumeId) return { available: false, pool: [] };
    d.onBeforeResumeProfileHydration?.();
    const profile = await c.query<{ structured: unknown; ocr_binding: unknown }>(
      'SELECT structured, ocr_binding FROM resume_profile WHERE resume_id=$1 AND owner_user_id=$2', [resumeId, d.owner],
    );
    const structured = profile.rows[0]?.structured as { facts?: unknown; experience?: unknown; skills?: unknown } | undefined;
    const facts = structured?.facts;
    const admitted = admitInterviewResume({
      sourceKind: parent.rows[0].source_kind,
      facts: Array.isArray(facts) ? facts : [],
      ocrBinding: profile.rows[0]?.ocr_binding ?? undefined,
    });
    if (!(admitted.ok === true && admitted.resumeProfileAvailable === true)) return { available: false, pool: [] };
    // G1/G2(RESUME-GROUNDING rev3 同意门):仅当 active consent(purpose='interview_personalization')存在时
    // 才放行 facts 池;未同意/已撤回 → pool=[] → planner 走既有占位串、grounded 走既有固定模板,
    // 与本刀前现状**逐字节一致**(自动化断言:resume-grounding.proof.ts)。读法沿 resume_processing consent 门
    // 先例(resume.service.ts:95 同形 SELECT…LIMIT 1);同一 asPrincipal client 内一次查询(G2:链进入点一次,
    // 勿每 turn 查)。撤回=行删除(G4:撤回=停止后续使用;已落 checkpoint/事件不回溯清除,归 #81 W5 全量面)。
    const consent = await c.query("SELECT 1 FROM consent_record WHERE purpose='interview_personalization' LIMIT 1");
    return { available: true, pool: (consent.rowCount ?? 0) > 0 ? buildResumeFactPool(structured ?? {}) : [] };
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
    // EXTREV-1 SCORE-WRITER S1（rev2 D1）：同一投影事务内发布版本化 rubric（幂等）+
    // 冻结题面契约（冻题不冻答·绑 rubricId·12 参）。difficulty 由图状态 PendingQuestion
    // plumbing（state.ts difficulty 字段，1..5 与 rubric CHECK 同标度）——投影层此前不消费它。
    await publishRubricAndIssueContract(c, {
      interviewId: d.interviewId, questionId: p.questionId, stateVersion: p.stateVersion, turn: p.turn,
      question: p.question, competency: p.competency, difficulty: p.difficulty, kind: p.kind,
    });
    await appendEvent(c, d.owner, d.interviewId, 'question_ready', {
      questionId: p.questionId, stateVersion: p.stateVersion, turn: p.turn,
      question: p.question, competency: p.competency, qkind: p.kind,
    }, `question_ready:${p.questionId}`);
  });
}

export type StartAdaptiveInterviewResult = {
  question?: string;
  questionId?: string;
  stateVersion?: number;
  unavailable?: InterviewGenerationUnavailable;
};

/** 开始到第一个纯 awaitAnswer interrupt。重试只会投影同一 question/event，不会重生模型题。 */
async function startAdaptiveInterviewImpl(d: AdaptiveLifecycleDeps, role: string, _legacyCallerFacts: string[]): Promise<StartAdaptiveInterviewResult> {
  // C1/C2(RESUME-GROUNDING):规划边界不再丢简历内容——loadInterviewResumeGrounding 以同一 RLS+admit 门
  // 读出有界脱敏 facts 池(consent 开,G1);按岗位相关性确定性选 ≤8 条×≤120 字符(selectPlannerFacts,A-3,
  // 禁模型选)真 facts 进 planner <data>。未同意/已撤回/画像不可用 → 既有占位串路径照旧(与现状逐字节一致)。
  // `_legacyCallerFacts` 为 consumer 侧历史准入位:授权位=「RLS 现读 ∨ 调用方准入位」——RLS 现读管弹药
  // (facts 池/consent),调用方位仅作模板路由的向后兼容回退(consumer 只在 DB 准入后才传;零回归保形)。
  const grounding = await loadInterviewResumeGrounding(d);
  const resumeProfileAvailable = grounding.available || _legacyCallerFacts.some((fact) => fact.trim().length > 0);
  const plannerFacts = grounding.pool.length > 0
    ? selectPlannerFacts(grounding.pool, role)
    : resumeProfileAvailable ? ['authorized_resume_profile_available'] : [];
  const competencies = await planCompetencies(d.pool, d.owner, d.interviewId, d.fastModel ?? d.model, role, plannerFacts);
  await asPrincipal(d.pool, d.owner, (c) => enrollCheckpointThread(c, d.owner, d.interviewId));
  const g = buildAdaptiveInterviewGraph(d.cp, makeDeps(d, competencies, resumeProfileAvailable, undefined, grounding.pool));
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
  const failure = generationFailureOf(snap);
  if (failure || !pending) {
    const unavailable = failure ?? {
      reason: 'generation_unavailable',
      provenance: { origin: 'unavailable' as const, errorCode: 'generation_unavailable' as const },
    };
    await emitGenerationUnavailable(d, unavailable);
    return { unavailable };
  }
  await persistAndEmitQuestion(d, pending);
  return { question: pending.question, questionId: pending.questionId, stateVersion: pending.stateVersion };
}

/** facts 形参为 consumer 侧历史准入位(向后兼容保留);规划边界真值由 RLS 现读(见 impl 内 C1/C2 注记)。 */
export function startAdaptiveInterview(d: AdaptiveLifecycleDeps, role: string, facts: string[]): Promise<StartAdaptiveInterviewResult> {
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
  // C2/G2(RESUME-GROUNDING):answer 链进入点同源注入——一次 RLS 读出授权位+consent 门控 facts 池
  // (S2 grounded 真出题与 S3 追问上下文共用的弹药面;撤回后新一轮面试 buildData 零 digest/facts,G4)。
  const grounding = await loadInterviewResumeGrounding(d);
  const g = buildAdaptiveInterviewGraph(d.cp, makeDeps(d, [], grounding.available, input, grounding.pool));
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
    if (next) {
      await persistInterviewQuestion(c, d.owner, d.interviewId, {
        questionId: next.questionId, stateVersion: next.stateVersion, turn: next.turn,
        question: next.question, competency: next.competency, qkind: next.kind,
      });
      // EXTREV-1 D1：answer 投影事务内的下一题同样发 rubric+契约（与 persistAndEmitQuestion 同形）。
      await publishRubricAndIssueContract(c, {
        interviewId: d.interviewId, questionId: next.questionId, stateVersion: next.stateVersion, turn: next.turn,
        question: next.question, competency: next.competency, difficulty: next.difficulty, kind: next.kind,
      });
    }
    const generationFailed = generationFailureOf(snap);
    if (generationFailed) {
      if (!unscored && typeof last.score === 'number') {
        await appendEvent(c, d.owner, d.interviewId, 'answer_evaluated', {
          questionId: input.questionId, stateVersion: last.stateVersion, answerId: input.answerId, answerHash: input.answerHash, turn: input.turn,
          score: last.score, outcome: last.outcome ?? 'answered', competency: last.competency, question: last.q ?? '',
        }, `answer_evaluated:${input.questionId}`);
      } else if (unscored) {
        await appendEvent(c, d.owner, d.interviewId, 'answer_unscored', {
          questionId: input.questionId, stateVersion: last.stateVersion, turn: input.turn,
          reason: last.reason ?? 'evaluation_unavailable', competency: last.competency, question: last.q ?? '',
        }, `answer_unscored:${input.questionId}`);
      }
      await writeGenerationUnavailable(c, d, generationFailed);
      return;
    }
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
    // SCOR-02 消费迁移（选 B——保留事件 .score 为「SSE 进度提示 / 完成判定 hint」，**非分数权威**）：
    //   C 端分数消费面已全部改读 ScoreCard(deterministic_total)，不再把 answer_evaluated.score 当分数源；
    //   此处 .score 仍保留，因为 (1) 完成判定的 eligible 计数与 SSE 进度显示仍需一个瞬时 hint；
    //   (2) 停发 .score(A) 会连带破坏下方 done 块的完成判定（其属 SCOR-03 真实证据提取范畴，不在本次消费迁移）。
    //   模型产 disposition（非自由总分）属 SCOR-03，不在本处实现——本处 score 仅 hint，已无任何合法 C 端分数消费者。
    await appendEvent(c, d.owner, d.interviewId, 'answer_evaluated', {
      questionId: input.questionId, stateVersion: last.stateVersion, answerId: input.answerId, answerHash: input.answerHash, turn: input.turn,
      score: last.score, outcome, competency: last.competency, question: last.q ?? '',
    }, `answer_evaluated:${input.questionId}`);
    if (next) await appendEvent(c, d.owner, d.interviewId, 'question_ready', {
      questionId: next.questionId, stateVersion: next.stateVersion, turn: next.turn,
      question: next.question, competency: next.competency, qkind: next.kind,
    }, `question_ready:${next.questionId}`);
  });

  // EXTREV-1 SCORE-WRITER S1（rev2 D4=后置异 txn）：上方投影事务**提交后**、同一 answer-job
  // drain 内、独立 asScoringWorkerPrincipal 事务 claim+写卡；consumer 的 markJobDone 在其后
  // 收口 → crash 于二者之间 = requeue at-least-once + 0100 CAS（单 winner）= exactly-once 效果。
  // 仅对投影已落 answer_evaluated 且计入 eligible 的回合执行（非 unscored/非 clarify；clarify&&done
  // 的 unresolved 事件不计 eligible，不供卡）。供源 = v5 hint 分（score 卡进度提示），经 D6 过渡桥
  // 映射 disposition；模型不出总分，总分在 0103 DB 函数内确定性计算。
  if (d.scoreWriterLeaseOwner && !unscored && !clarifying && typeof last.score === 'number') {
    await writeScoreCardAfterProjectionFenceTolerant(
      { pool: d.pool, owner: d.owner, leaseOwner: d.scoreWriterLeaseOwner },
      {
        interviewId: d.interviewId, questionId: input.questionId, stateVersion: input.stateVersion,
        answerText: input.answer, hintScore: last.score,
      },
    );
  }

  const generationFailed = generationFailureOf(snap);
  if (generationFailed) {
    return {
      score: typeof last.score === 'number' ? last.score : undefined,
      nextQuestion: undefined, nextQuestionId: undefined,
      done: true, clarifying: false, degraded: true,
    };
  }

  if (done) {
    await asPrincipal(d.pool, d.owner, async (c) => {
      await requireCurrentFence(c, d);
      // INT-LEVEL-SIGNAL-SSE-01：只经投影 append。其他 conclude 码与缺 provenance 不写、不发明分。
      // 既有 interview_event 路径；event_key 幂等。不是 SSE 终态。
      await emitSignalConcludeEvent(
        appendEvent, c, d.owner, d.interviewId,
        (snap.values as { concludeReason?: unknown } | undefined)?.concludeReason,
      );
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
