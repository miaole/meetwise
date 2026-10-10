import { Injectable, Inject, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { assertInterviewPrivacyActive, reserveEntitlement, enqueueInterviewJob, abandonInterviewAndRelease, claimInterviewAnswer, submitInterviewAnswer, readbackInterviewAnswerSubmission, viewInterviewAnswerSnapshot, supplyCandidateProfileRoute, requireOwnerUserId, buildRequiredOwnerFilter, newEntityId, asErr, errCode, createScoreRequestForSubmission, SCORING_ISSUE_PRIVACY_EPOCH } from '@meetwise/db';
import { deriveCareerPath, requireTrustedPracticeOverall, resolveOverlongAnswerPolicy } from '@meetwise/domain';
import { runCareerPathGraph, selectCareerPathDerive, CAREER_PATH_GRAPH_NAME } from '@meetwise/ai-graphs';
import type { InterviewAnswerPreviewSubmitDto, InterviewAnswerSubmitResult, TranscribeDto, TurnDto } from '@meetwise/contracts';
import type { Asr, Tts, StreamingTts } from '@meetwise/ai-runtime';
import { DbService } from '../../platform/db.service';
import { RateLimitService } from '../../platform/rate-limit.service';
import { parseLastEventId } from '../../platform/last-event-id.ts';
import {
  assertPublicPreviewControlledWriteAllowed,
  assertPublicPreviewWritesClosed,
  PublicPreviewReadOnlyError,
  PublicPreviewWriteUnavailableError,
} from '../../platform/public-preview';
import { toInterviewView } from './interview-view.ts';
import { synthesizeSpokenAudio, prepareSpeakStreamText, transcribeAnswer } from './interview-voice.ts';
import { reportView, retryReportById, exportReportMd, transcriptView } from './interview-report.ts';
import { generateAssessmentFor, getAssessmentFor, getCareerPathFor } from './interview-assessment.ts';
import { generateLearningPlanFor, getLearningPlanFor, completeLearningItemFor } from './interview-learning.ts';

// 语音端点(ASR/TTS)调付费百炼模型但无额度预留(边缘 I/O,非整场面试计费单元)→ **per-principal 令牌桶限流防成本 DoS**(安全审计高危#1)。
// 突发 40(足够一场语音面试的 ASR+TTS 往返),稳态 0.3/秒(~18/分)——正常用够、滥用循环被摁住。
const VOICE_RL = { capacity: 40, refillPerSec: 0.3 };
// 每次 turn 都入队一条**付费评分** job → 无限流 = 成本 DoS(安全审计 F1)。突发 30(足够一场面试的作答+澄清重答),稳态 0.2/秒(~12/分)。
const TURN_RL = { capacity: 30, refillPerSec: 0.2 };
// interview 表状态机:created → active →(completed | failed | abandoned)。终态集中一处定义,begin/turn/abandon 守卫共用。
const TERMINAL_INTERVIEW = ['completed', 'abandoned', 'failed'];
const MAX_TURN = 256;             // turn 号上界(默认绝对杀开关 120 + clarify 冗余;防超大 turn 号刷无限 job)
// DBID-1 post-dual 席2：版本组字符类放宽 [1-5]→[0-9a-f]（纳 v7 · resume.id 已 DEFAULT uuidv7()）·变位锁 [89ab] 与守卫逻辑不动。
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// career-path AiGraphRun lease(审计 fence;终态 succeeded/failed 清空,让出 uq_active_run 重试槽)。
const CAREER_PATH_LEASE_SECONDS = 120;
const careerPathLogger = new Logger('CareerPathGraph');

/**
 * GAP-UC004-FI3 thread-scoped fail-only 注入 seam(C-HA-2 / C-MO-2):
 * MEETWISE_CAREER_PATH_FAIL_THREAD_ID=<interview id>——仅该线程的 career-path 图 dep 确定性抛错。
 * 默认关:未设/空 = 零行为差;NODE_ENV=production 恒关;不读凭据、不触网、不写 ai_invocation_trace。
 */
function careerPathFailSeamThreadId(): string | undefined {
  if (process.env.NODE_ENV === 'production') return undefined;
  return process.env.MEETWISE_CAREER_PATH_FAIL_THREAD_ID;
}

// 语音接口由 DI seam 提供。组合根经 registry + 能力 Key 接线批量 ASR/TTS；
// 缺 Key 或未接线仍 fail-closed。service 不硬编码供应商细节。
export const VOICE_ASR = Symbol.for('meetwise.VOICE_ASR');
export const VOICE_TTS = Symbol.for('meetwise.VOICE_TTS');
export const VOICE_STREAM_TTS = Symbol.for('meetwise.VOICE_STREAM_TTS');

/**
 * 面试应用服务(拥有 asPrincipal 事务边界 + 业务编排:advisory 锁、幂等、额度预留、入队、状态机、RLS)。
 * controller 只解析/校验/映射 HTTP,不碰 SQL(修审计 F1——interview.controller 原为最大违规者)。行为完全保持。
 * GODFN-1c 拆解:voice/report/assessment/career-path/learning 方法体机械迁出至同目录域文件(委托·语义等价);
 * 六守卫/事务边界/RLS 上下文/begin 全守卫链路留在本类(dbid1 冒烟经 Object.create(prototype) 直调 begin,
 * 签名/this 语义零变;tenant 接线 manifest 按本文件为 envelope 精确计数)。
 */
@Injectable()
export class InterviewService {
  constructor(
    private readonly db: DbService,
    private readonly rl: RateLimitService,
    @Inject(VOICE_ASR) private readonly asr: Asr,
    @Inject(VOICE_TTS) private readonly tts: Tts,
    @Inject(VOICE_STREAM_TTS) private readonly streamTts: StreamingTts,
  ) {}

  /**
   * Fail-closed preview backstop for persisted interview/scoring writes.
   * HTTP ingress already rejects mutating methods; this blocks a GET or
   * in-process caller from reaching asPrincipal / enqueue / ScoreCard paths.
   */
  private denyPublicPreviewWrite(): void {
    try {
      assertPublicPreviewWritesClosed();
    } catch (error) {
      if (error instanceof PublicPreviewReadOnlyError) {
        throw new HttpException({ error: 'public_preview_read_only' }, HttpStatus.SERVICE_UNAVAILABLE);
      }
      throw error;
    }
  }

  /**
   * Preview-only ledger submit. Off-preview must look like the route does
   * not exist (404), so this is not an INT-TRANSCRIPT-01 production write.
   */
  private requirePublicPreviewControlledWrite(): void {
    try {
      assertPublicPreviewControlledWriteAllowed();
    } catch (error) {
      if (error instanceof PublicPreviewWriteUnavailableError) {
        throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }

  private mapAnswerLedgerError(error: any): never {
    const code = String(error?.code ?? error?.message ?? '');
    if (code === 'interview_privacy_fenced')
      throw new HttpException({ error: 'interview_privacy_fenced' }, HttpStatus.GONE);
    if (code === 'interview_answer_submission_conflict')
      throw new HttpException({ error: 'interview_answer_submission_conflict' }, HttpStatus.CONFLICT);
    if (code === 'interview_answer_submission_fenced_or_forbidden')
      throw new HttpException({ error: 'interview_privacy_fenced' }, HttpStatus.GONE);
    if (code === 'interview_answer_body_empty' || code === 'interview_answer_state_version_invalid')
      throw new HttpException({ error: code }, HttpStatus.BAD_REQUEST);
    if (code === 'interview_answer_artifact_missing' || code === 'interview_answer_receipt_incomplete')
      throw new HttpException({ error: code }, HttpStatus.CONFLICT);
    if (code === 'interview_answer_ledger_dual_write_fenced' || code === 'interview_answer_legacy_plaintext_fenced')
      throw new HttpException({ error: code }, HttpStatus.CONFLICT);
    throw error;
  }

  /** 语音端点共用限流闸(ASR/TTS 无额度预留 → 防成本 DoS)。超速 → 429。 */
  private voiceGate(principal: string) {
    if (!this.rl.allow(`voice:${principal}`, VOICE_RL.capacity, VOICE_RL.refillPerSec))
      throw new HttpException({ error: 'too_many_requests', message: '语音请求过于频繁,请稍候' }, HttpStatus.TOO_MANY_REQUESTS);
  }

  // 作答前置守卫(turn 共用)。**自适应流程全程 interview.status='created'**(逐轮态在 LangGraph checkpoint,不在本列),
  //   故 'created' 是合法「答题中」态——但必须**已 begin**(存在 start job)才可答,以区分「进行中」vs「从未开始的空壳」;终态一律拒。
  //   返回 {code,error} 或 null(可答)。turn 用 assertAnswerable 抛；遗留
  //   /answer 在认证后无条件 410，不参与任何面试状态判断。
  private async answerableError(c: any, id: string, status: string): Promise<{ code: number; error: string } | null> {
    if (TERMINAL_INTERVIEW.includes(status)) return { code: 409, error: 'interview_not_active' };
    if (status === 'created') {
      const begun = await c.query("SELECT 1 FROM interview_job WHERE interview_id=$1 AND kind='start' LIMIT 1", [id]);
      if (begun.rowCount === 0) return { code: 409, error: 'interview_not_started' };   // created 但从未 begin → 拒(不给空壳造付费 answer job)
    }
    return null;
  }
  private async assertAnswerable(c: any, id: string, status: string): Promise<void> {
    const e = await this.answerableError(c, id, status);
    if (e) throw new HttpException({ error: e.error, status }, e.code);
  }

  /**
   * The HTTP layer is not the only producer of interview projections, so the
   * database also has RLS and write-trigger guards (0059, privacy fence — not
   * the public-preview write-gate).  This helper keeps
   * the public contract explicit: a caller that owns a now-fenced interview
   * receives 410, while a missing/cross-owner id remains indistinguishable as
   * 404.  Call it in the same transaction as every interview-owned read or
   * write; never turn a privacy fence into a best-effort controller check.
   */
  private async guardInterviewPrivacy(c: any, id: string): Promise<void> {
    const owned = await c.query('SELECT 1 FROM interview WHERE id=$1', [id]);
    if (owned.rowCount === 0)
      throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    try {
      await assertInterviewPrivacyActive(c, id);
    } catch (error: unknown) {
      if (asErr(error)?.message === 'interview_privacy_fenced')
        throw new HttpException({ error: 'interview_privacy_fenced' }, HttpStatus.GONE);
      throw error;
    }
  }

  // 开始面试:扣额度 + 入队 start job(长编排在 worker 跑,api 薄)。reqId 随 payload 入队 → worker 出队沿用 → 落模型 trace.request_id(全链路一跳到底)。
  // GAP-UC025-NEG-01 真接线:第 5 形参 sourceQuizId 为可选源押题工件(controller header quiz-id 透传)。
  begin(principal: string, id: string, resumeId: string, requestId?: string, sourceQuizId?: string) {
    this.denyPublicPreviewWrite();
    if (!resumeId) throw new HttpException({ error: 'missing_resume_id' }, HttpStatus.BAD_REQUEST);
    if (!UUID_RE.test(resumeId)) throw new HttpException({ error: 'invalid_resume_id' }, HttpStatus.BAD_REQUEST);
    // PRIV01-C 应用层 tenant 强制第二层:E1 入口显式 owner + E2 必选谓词绑定——授权根仍为 RLS(应用层 tenant ≠ RLS)。
    const owner = requireOwnerUserId(principal, 'interview.begin');
    const quizScope = buildRequiredOwnerFilter(owner, 'interview.begin.quizScope');
    const bindScope = buildRequiredOwnerFilter(owner, 'interview.begin.bind');
    return this.db.asPrincipal(owner, async (c) => {
      // **并发竞态安全**:事务级 advisory 锁串行化同面试的并发 begin(对齐 invoke 关口)——否则两并发都过 check-then-act = 双开。
      await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', ['begin', id]);
      const cur = await c.query('SELECT status,resume_id,resume_privacy_epoch,application_id FROM interview WHERE id=$1 FOR UPDATE', [id]);
      if (cur.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      await this.guardInterviewPrivacy(c, id);
      // **状态机守卫(此前 begin 一个守卫都没有 → 可复活终态面试 + 白扣额度,负测 BUG-PROBE 抓到)**:
      //   终态(completed/failed/abandoned)绝不可再 begin(不可复活、不可二次扣额)。
      if (TERMINAL_INTERVIEW.includes(cur.rows[0].status))
        throw new HttpException({ error: 'interview_not_active', status: cur.rows[0].status }, HttpStatus.CONFLICT);

      // GODFN-1c 三守卫合并(纯机械语义等价):源押题工件三刀守卫块(NEG stale_quiz / FAULT missing_quiz_expiry /
      // BOUND resume_version_mismatch)原各自 SELECT resume_quiz(前两刀 SQL 字节级重复)→ 归一为**单查**
      // (status+expires_at+pin JOIN 一查询回);抛序逐字节保持现行精确顺序:
      //   404 not_found_or_forbidden → stale_quiz(NEG;C-1 窄保留:expires_at NULL≠过期) → missing_quiz_expiry(FAULT;NULL
      //   独立错误码) → missing_quiz_expiry(NaN fold) → resume_version_mismatch(BOUND;pin NULL 旧工件不假拒)。
      // 每刀都发生在**任何简历绑定写、扣额度(reserveEntitlement)与入队(enqueueInterviewJob)之前**,无局部 catch 吞
      // (下方唯一 catch 只映射 insufficient_entitlement 且原样重抛),经 Nest 异常层映射为真实 HTTP 状态。
      // 不带 sourceQuizId → 完全跳过本块,行为与合并前一致(rag C-6);resume_quiz 查询次数 3→1
      // (断言面:prove:begin-guard-merge 抛序等价+计数断言)。
      if (sourceQuizId) {
        const quiz = await c.query(
          `SELECT q.status, q.expires_at,
                  q.resume_id::text AS pinned_resume_id,
                  q.privacy_epoch AS pinned_epoch,
                  r.privacy_epoch AS current_epoch
             FROM resume_quiz q
             LEFT JOIN resume r ON r.id=q.resume_id AND r.owner_user_id=q.owner_user_id
            WHERE q.id=$1 AND q.owner_user_id=$2`,
          [sourceQuizId, quizScope.value],
        );
        if (quiz.rowCount === 0)
          throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
        // NEG stale_quiz:owner-scoped 真消费工件,stale/未 ready → 在扣额度与入队之前抛真 409。
        // expires_at 为 NULL 不得当 stale_quiz 过期拒(C-1 窄保留:NULL≠stale);非法/NaN 日期由下方 FAULT 同口 fail-closed。
        const quizExpired = quiz.rows[0].expires_at != null
          && new Date(quiz.rows[0].expires_at).getTime() <= Date.now();
        if (quiz.rows[0].status !== 'ready' || quizExpired)
          throw new HttpException({ error: 'stale_quiz' }, HttpStatus.CONFLICT);
        // FAULT missing_quiz_expiry:missing/NULL expires_at fail-closed(独立错误码;NULL 仍不得抛 stale_quiz)。
        const rawExpiry = quiz.rows[0].expires_at;
        if (rawExpiry == null)
          throw new HttpException({ error: 'missing_quiz_expiry' }, HttpStatus.CONFLICT);
        const expiryMs = new Date(rawExpiry as string | Date).getTime();
        if (Number.isNaN(expiryMs))
          throw new HttpException({ error: 'missing_quiz_expiry' }, HttpStatus.CONFLICT);
        // BOUND resumeVersion pin 失配:0061 typed 引用钉死 (resume_id, privacy_epoch)=工件 pin。本次 resume-id ≠ pin 的
        // resume_id(简历变更后拿旧押题开面),或 pin 的 privacy_epoch ≠ 该简历当前世代 → 409。pin 为 NULL(0061 前
        // 旧工件/无 typed 引用)不得当失配拒(NULL pin 旧工件不假拒)。
        const pinnedResumeId = quiz.rows[0].pinned_resume_id as string | null | undefined;
        if (pinnedResumeId != null) {
          const pinnedEpoch = quiz.rows[0].pinned_epoch == null ? null : Number(quiz.rows[0].pinned_epoch);
          const currentEpoch = quiz.rows[0].current_epoch == null ? null : Number(quiz.rows[0].current_epoch);
          const resumeVersionMismatch = pinnedResumeId.toLowerCase() !== resumeId.toLowerCase()
            || pinnedEpoch === null || currentEpoch === null || pinnedEpoch !== currentEpoch;
          if (resumeVersionMismatch)
            throw new HttpException({ error: 'resume_version_mismatch' }, HttpStatus.CONFLICT);
        }
      }

      // A new C-side start must bind its source in a typed, owner-checked
      // column before any quota reservation or queue write.  B-side sessions
      // already carry an immutable resume_id from application creation and
      // must match it rather than being rebound through this generic endpoint.
      const existingResumeId = cur.rows[0].resume_id as string | null;
      const existingResumeEpoch = cur.rows[0].resume_privacy_epoch == null
        ? null
        : Number(cur.rows[0].resume_privacy_epoch);
      if (existingResumeId && existingResumeId !== resumeId)
        throw new HttpException({ error: 'interview_resume_binding_conflict' }, HttpStatus.CONFLICT);
      // A pre-v64 parent has no immutable authorization snapshot.  Do not
      // infer one from the current resume row: its existing unique start-job
      // key prevents a safe replacement and a guessed upgrade could revive a
      // stale task after a future privacy fence.
      if (existingResumeId && existingResumeEpoch === null)
        throw new HttpException({ error: 'legacy_resume_reference_unavailable' }, HttpStatus.CONFLICT);
      if (!existingResumeId) {
        const bound = await c.query(
          `UPDATE interview i
              SET resume_id=r.id,
                  resume_privacy_epoch=r.privacy_epoch,
                  version=i.version+1
             FROM resume r
            WHERE i.id=$1
              AND i.owner_user_id=$2
              AND i.application_id IS NULL
              AND i.resume_id IS NULL
              AND i.resume_privacy_epoch IS NULL
              AND i.status='created'
              AND r.id=$3
              AND r.owner_user_id=$2
              AND r.status='ingested'`,
          [id, bindScope.value, resumeId],
        );
        if (bound.rowCount !== 1)
          throw new HttpException({ error: 'interview_resume_binding_unavailable' }, HttpStatus.CONFLICT);
      }
      // 幂等:已有 start job(重复 begin/网络重试)→ 不再扣额度、不再入队(否则双扣 + 双出题双花模型)
      const existing = await c.query(
        `SELECT j.id
           FROM interview_job j
           JOIN interview i ON i.id=j.interview_id AND i.owner_user_id=j.owner_user_id
           JOIN resume r ON r.id=i.resume_id AND r.owner_user_id=i.owner_user_id
          WHERE j.interview_id=$1
            AND j.kind='start'
            AND j.reference_schema_version=64
            AND j.resume_id=i.resume_id
            AND j.resume_privacy_epoch=i.resume_privacy_epoch
            AND r.status='ingested'
            AND r.privacy_epoch=i.resume_privacy_epoch`, [id],
      );
      if (existing.rowCount! > 0) return { accepted: true, jobId: existing.rows[0].id, alreadyBegun: true };
      const anyExistingStart = await c.query("SELECT 1 FROM interview_job WHERE interview_id=$1 AND kind='start'", [id]);
      if (anyExistingStart.rowCount! > 0)
        throw new HttpException({ error: 'legacy_resume_reference_unavailable' }, HttpStatus.CONFLICT);
      // 已 active(worker 已开面/已出题)但无 start job 行(边角恢复态)→ 幂等返回,绝不二次预留额度。
      if (cur.rows[0].status === 'active') return { accepted: true, alreadyBegun: true };
      // G7S 通用 begin 供给面收口(C-MO-S4 事务序):candidate-profile-derived route decision + snapshot
      // 同步落库,先于扣额/入队(同 asPrincipal 事务,未决 throw → 整体回滚零悬账)。通用面
      // (application_id IS NULL)才供给;recruiter-flow 面的 bound interview 由 recruiter 启动事务的
      // snapshot(recruiter.ts:428 唯一生产者)供给,本步零触碰零回归。无决策/歧义 → 409
      // candidate_route_undecided(拒因从 worker 异步 throw 前移为 begin 同步业务拒绝,拒的本体
      // 零消失);worker fail-closed 门(adaptive-role-resolve 默认 ON)零改动,缺行/缺叶仍拒。
      if (cur.rows[0].application_id == null) {
        const supply = await supplyCandidateProfileRoute(c, owner, id, resumeId);
        if (supply.status === 'undecided')
          throw new HttpException({ error: 'candidate_route_undecided', reason: supply.reason }, HttpStatus.CONFLICT);
      }
      // 额度不足时 reserveEntitlement **抛**(回滚),不是返回——必须 catch 映射成 402,否则被异常过滤当 500(E2E 实测抓到)。
      let rr;
      try { rr = await reserveEntitlement(c, owner, id, 'mock_interview', 1.0); }
      catch (e: unknown) {
        if (errCode(e) === 'insufficient_entitlement') throw new HttpException({ error: 'insufficient_entitlement' }, HttpStatus.PAYMENT_REQUIRED);
        throw e;
      }
      if (rr.status !== 'reserved') throw new HttpException({ error: 'insufficient_entitlement' }, HttpStatus.PAYMENT_REQUIRED);
      // The queue derives the v64 typed id+epoch from the just-bound parent;
      // JSON retains only transport tracing, never a resume locator.
      const jobId = await enqueueInterviewJob(c, owner, id, 'start', { requestId }, 0);
      return { accepted: true, jobId };
    });
  }

  // 提交一题答案:入队 answer job(worker 续图+评分)。text 答案;音频先 ASR 转写再走此端点。
  turn(principal: string, id: string, body: TurnDto, requestId?: string) {
    this.denyPublicPreviewWrite();
    const turn = body.turn;
    // 共享 Zod 契约是入口；service 仍做上界防御，避免内部调用绕过 pipe。
    if (turn > MAX_TURN || !body.answer.trim()) throw new HttpException({ error: 'invalid_turn' }, HttpStatus.BAD_REQUEST);
    // 超长作答策略显式化（CTX-01）：确定性 reject + 明确错误码 answer_too_long（用户可感知），
    // 绝不截断/摘要后当评分证据——评分只看原始作答，经 SCOR score_evidence 链（评分侧 capUserData 仍为纵深兜底）。
    const overlong = resolveOverlongAnswerPolicy('interview_route', body.answer.length);
    // 用 `=== false` 而非 `!overlong.accepted`：api 侧 tsconfig strict:false（strictNullChecks 关），
    // `!` 对 boolean 判别联合在 strictNullChecks 关时不会收窄对象类型（会 TS2339 报 policy 不存在）。
    if (overlong.accepted === false)
      throw new HttpException({ error: overlong.policy.errorCode, max: overlong.policy.maxLength }, HttpStatus.PAYLOAD_TOO_LARGE);
    // 成本 DoS 闸(每 turn = 一条付费评分 job):per-principal 令牌桶,超速 → 429(安全审计 F1)。
    if (!this.rl.allow(`turn:${principal}`, TURN_RL.capacity, TURN_RL.refillPerSec))
      throw new HttpException({ error: 'too_many_requests', message: '作答过于频繁,请稍候' }, HttpStatus.TOO_MANY_REQUESTS);
    const owner = requireOwnerUserId(principal, 'interview.turn');   // PRIV01-C 第二层 E1(授权根仍 RLS)
    return this.db.asPrincipal(owner, async (c) => {
      // 状态机守卫(对齐 quiz/diagnosis 的 CAS 守卫;安全审计 F1):只对**未终态**面试收作答。
      // 对 completed/abandoned/failed 提交 → 409,绝不制造新付费 job、不绕状态机(此前一个守卫都没有)。
      const iv = await c.query('SELECT status FROM interview WHERE id=$1', [id]);
      if (iv.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND); // E5:自身 id 意外 0 行 → 404 fail-closed
      // Delete holds the same transaction advisory lock and atomically
      // redacts any earlier queue row.  Put this before question claim so a
      // fenced turn leaves neither an answer hash nor a job behind.
      await this.guardInterviewPrivacy(c, id);
      await this.assertAnswerable(c, id, iv.rows[0].status);   // 终态拒 / 未 begin 拒(见下方共用守卫)
      const claim = await claimInterviewAnswer(c, owner, id, body);
      if (claim.status === 'hash_mismatch') throw new HttpException({ error: 'answer_hash_mismatch' }, HttpStatus.UNPROCESSABLE_ENTITY);
      if (claim.status === 'not_ready') throw new HttpException({ error: 'question_not_ready' }, HttpStatus.CONFLICT);
      if (claim.status === 'stale') throw new HttpException({ error: 'stale_question' }, HttpStatus.CONFLICT);
      if (claim.status === 'conflict') throw new HttpException({ error: 'answer_conflict' }, HttpStatus.CONFLICT);
      const jobId = await enqueueInterviewJob(c, owner, id, 'answer', { ...body, requestId }, turn + 1);
      return { accepted: claim.status === 'accepted', replayed: claim.status === 'replayed', jobId };
    });
  }

  /**
   * Preview-path ledger write. Calls the existing 0092 submitInterviewAnswer
   * rehearsal. Does not enqueue a plaintext /turn job and is not 01 cutover.
   */
  submitPreviewAnswer(principal: string, id: string, body: InterviewAnswerPreviewSubmitDto): Promise<InterviewAnswerSubmitResult> {
    this.requirePublicPreviewControlledWrite();
    if (!body.answer.trim()) throw new HttpException({ error: 'interview_answer_body_empty' }, HttpStatus.BAD_REQUEST);
    const overlong = resolveOverlongAnswerPolicy('interview_route', body.answer.length);
    if (overlong.accepted === false)
      throw new HttpException({ error: overlong.policy.errorCode, max: overlong.policy.maxLength }, HttpStatus.PAYLOAD_TOO_LARGE);
    if (!this.rl.allow(`turn:${principal}`, TURN_RL.capacity, TURN_RL.refillPerSec))
      throw new HttpException({ error: 'too_many_requests', message: '作答过于频繁,请稍候' }, HttpStatus.TOO_MANY_REQUESTS);
    const owner = requireOwnerUserId(principal, 'interview.submitPreviewAnswer');   // PRIV01-C 第二层 E1
    const issuedScope = buildRequiredOwnerFilter(owner, 'interview.submitPreview.issued');   // E2 必选谓词(原 GUC 直读改参数绑定,RLS 会话内同值)
    return this.db.asPrincipal(owner, async (c) => {
      await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', ['preview-answer', id]);
      const iv = await c.query('SELECT status FROM interview WHERE id=$1', [id]);
      if (iv.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND); // E5:自身 id 意外 0 行 → 404 fail-closed
      await this.guardInterviewPrivacy(c, id);
      await this.assertAnswerable(c, id, iv.rows[0].status);
      const existing = await readbackInterviewAnswerSubmission(c, body.clientSubmissionKey);
      if (existing) {
        if (existing.interviewId !== id || existing.questionId !== body.questionId
          || existing.stateVersion !== body.stateVersion)
          throw new HttpException({ error: 'interview_answer_submission_conflict' }, HttpStatus.CONFLICT);
      }
      const issued = await c.query(
        `SELECT state_version, status FROM interview_question
          WHERE owner_user_id=$3
            AND interview_id=$1 AND question_id=$2 FOR UPDATE`,
        [id, body.questionId, issuedScope.value],
      );
      // Same-key replay must not depend on the live question row (A4/E6).
      if (!existing) {
        if (issued.rowCount === 0)
          throw new HttpException({ error: 'question_not_ready' }, HttpStatus.CONFLICT);
        const row = issued.rows[0];
        if (Number(row.state_version) !== body.stateVersion || row.status === 'cancelled')
          throw new HttpException({ error: 'stale_question' }, HttpStatus.CONFLICT);
        const snap = await viewInterviewAnswerSnapshot(c, id);
        const occupied = snap.items.some((item) => item.questionId === body.questionId
          && item.stateVersion === body.stateVersion && item.status === 'active');
        if (occupied)
          throw new HttpException({ error: 'stale_question' }, HttpStatus.CONFLICT);
        if (row.status !== 'issued')
          throw new HttpException({ error: 'stale_question' }, HttpStatus.CONFLICT);
      }
      try {
        const submitted = await submitInterviewAnswer(c, {
          interviewId: id,
          questionId: body.questionId,
          stateVersion: body.stateVersion,
          clientSubmissionKey: body.clientSubmissionKey,
          answer: body.answer,
          privacyEpoch: SCORING_ISSUE_PRIVACY_EPOCH,
        });
        if (submitted.interviewId !== id || submitted.questionId !== body.questionId
          || submitted.stateVersion !== body.stateVersion)
          throw new HttpException({ error: 'interview_answer_submission_conflict' }, HttpStatus.CONFLICT);
        // EXTREV-1 SCORE-WRITER S1（rev2 D2 勘误锚点=interview.service.ts:402 邻域）：
        // score_request 与 0092 账本写入**同事务原子**（绑 submissionId/artifactId/bodyHmac），
        // 非 claim 位。题面契约缺位（S1 接线前的存量题）→ fail-soft 跳过（存量不追溯供卡）。
        await createScoreRequestForSubmission(c, {
          interviewId: id,
          questionId: body.questionId,
          stateVersion: body.stateVersion,
          submissionId: submitted.submissionId,
          artifactId: submitted.artifactId,
          canonicalBodyHmac: submitted.canonicalBodyHmac,
          privacyEpoch: submitted.privacyEpoch,
        });
        return {
          interviewId: submitted.interviewId,
          questionId: submitted.questionId,
          stateVersion: submitted.stateVersion,
          clientSubmissionKey: submitted.clientSubmissionKey,
          canonicalBodyHmac: submitted.canonicalBodyHmac,
          privacyEpoch: submitted.privacyEpoch,
          status: 'accepted_unscored',
          replayed: submitted.replayed,
        };
      } catch (error) {
        if (error instanceof HttpException) throw error;
        this.mapAnswerLedgerError(error);
      }
    });
  }

  // 语音作答转写:音频 → ASR 文本。**modality-agnostic 不破**——转写文本即文本答案,后续仍走 /turn。
  // 边缘 I/O(ASR)直调 ai-runtime voice seam(在 invoke 关口之外)。隐私:只回转写文本,原始录音不落库(rules 隐私铁律——录音需单独同意才存)。
  async transcribe(principal: string, id: string, dto: TranscribeDto, options?: { signal?: AbortSignal }) {
    this.voiceGate(principal);
    const owner = requireOwnerUserId(principal, 'interview.transcribe');   // PRIV01-C 第二层 E1(授权根仍 RLS;guard 0 行→404 fail-closed)
    // Check the same durable fence before any audio leaves the process.  This
    // closes delete-wins; dispatch-wins provider retention receipts remain a
    // separate release blocker until voice uses the durable egress outbox.
    await this.db.asPrincipal(owner, (c) => this.guardInterviewPrivacy(c, id));
    return transcribeAnswer(this.asr, dto, options);
  }

  /** TTS:把 AI 题/追问合成语音(qwen-tts),供单人语音模式播报。未配置/失败 → 降级(前端回落文字读题)。 */
  async speak(principal: string, id: string, dto: { text: string }, options: { signal?: AbortSignal } = {}) {
    this.voiceGate(principal);
    const owner = requireOwnerUserId(principal, 'interview.speak');   // PRIV01-C 第二层 E1(授权根仍 RLS;guard 0 行→404 fail-closed)
    await this.db.asPrincipal(owner, (c) => this.guardInterviewPrivacy(c, id));
    const text = (dto.text ?? '').trim();
    if (!text) throw new HttpException({ error: 'empty_text' }, HttpStatus.BAD_REQUEST);
    return synthesizeSpokenAudio(this.tts, text, options);
  }

  /** 流式 TTS 前置:归属校验(404)+ 文本校验(400)+ 配置校验(503)。**真正的 chunk 写入是 Fastify raw 流胶水,留在 controller**(对齐 SSE 边界 F5)。
   *  把"首音延迟"从整段合成下载(qwen-tts ~9s)降到首块到达(cosyvoice WS ~1-2s);未配置/中断 → 前端回落非流式 /speak 再回落文字读题(无死胡同)。 */
  async speakStreamPrepare(principal: string, id: string, dto: { text: string }) {
    this.voiceGate(principal);
    const owner = requireOwnerUserId(principal, 'interview.speakStreamPrepare');   // PRIV01-C 第二层 E1(授权根仍 RLS;guard 0 行→404 fail-closed)
    await this.db.asPrincipal(owner, (c) => this.guardInterviewPrivacy(c, id));
    const text = (dto.text ?? '').trim();
    if (!text) throw new HttpException({ error: 'empty_text' }, HttpStatus.BAD_REQUEST);
    return prepareSpeakStreamText(this.streamTts, text);
  }

  /** 流式 TTS 音频块迭代器(MP3,signal 可中断:挂断/切走/barge-in 即停吐)。边缘 I/O,在 invoke 关口之外。 */
  speakStreamChunks(text: string, signal: AbortSignal): AsyncIterable<Uint8Array> {
    return this.streamTts.synthesizeStream(text, signal);
  }

  // 题目反馈(赞/踩):收集人对 AI 生成题的质量信号,喂 eval/改进闭环。一题一反馈,可改(UPSERT)。
  async questionFeedback(principal: string, id: string, idx: string, b: { rating?: string; comment?: string }) {
    this.denyPublicPreviewWrite();
    if (b?.rating !== 'up' && b?.rating !== 'down') throw new HttpException({ error: 'invalid_rating' }, HttpStatus.BAD_REQUEST);
    const qi = Number(idx);
    if (!Number.isInteger(qi) || qi < 0) throw new HttpException({ error: 'invalid_index' }, HttpStatus.BAD_REQUEST);
    const owner = requireOwnerUserId(principal, 'interview.questionFeedback');   // PRIV01-C 第二层 E1
    await this.db.asPrincipal(owner, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      await c.query(`INSERT INTO question_feedback(owner_user_id, interview_id, question_index, rating, comment) VALUES ($1,$2,$3,$4,$5)
               ON CONFLICT (owner_user_id, interview_id, question_index) DO UPDATE SET rating=EXCLUDED.rating, comment=EXCLUDED.comment`,
        [owner, id, qi, b.rating, b.comment ?? null]);
    });
    return { recorded: true };
  }

  // 放弃面试:**退还预留额度**(不漏扣)+ status abandoned。对接 commerce saga release 路径。
  abandon(principal: string, id: string) {
    this.denyPublicPreviewWrite();
    const owner = requireOwnerUserId(principal, 'interview.abandon');   // PRIV01-C 第二层 E1(授权根仍 RLS)
    return this.db.asPrincipal(owner, async (c) => {
      // advisory 锁仅折叠同端点重复点击；与 worker 的真正串行化由
      // abandonInterviewAndRelease 内部在 consumption 行上的 FOR UPDATE + 条件状态 CAS 完成。
      await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', ['abandon', id]);
      const cur = await c.query('SELECT status FROM interview WHERE id=$1', [id]);
      if (cur.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND); // E5:自身 id 意外 0 行 → 404 fail-closed
      await this.guardInterviewPrivacy(c, id);
      const st = cur.rows[0].status;
      if (st === 'completed' || st === 'failed')
        throw new HttpException({ error: 'interview_not_active', status: st }, HttpStatus.CONFLICT);
      try {
        const result = await abandonInterviewAndRelease(c, owner, id);
        return { abandoned: true, released: result.released, alreadyAbandoned: result.status === 'already_abandoned' };
      } catch (e: unknown) {
        const err = asErr(e);
        if (errCode(e) === 'interview_release_failed' || errCode(e) === 'interview_abandon_conflict')
          throw new HttpException({ error: 'interview_not_active', status: err?.status ?? st }, HttpStatus.CONFLICT);
        throw e;
      }
    });
  }

  // 新建面试(空壳,created)。begin 才扣额度跑图。
  // **幂等**:同一用户同一时刻只保留一个进行中会话——连点/重复提交不再各插一条(用户实测点 3 次出 3 条 = 这里没幂等)。
  // 未结束(非 completed/abandoned/failed)就复用既有;复用后再 begin 由 begin 的 alreadyBegun 幂等兜住(不重复扣费)。
  async create(principal: string) {
    this.denyPublicPreviewWrite();
    const owner = requireOwnerUserId(principal, 'interview.create');   // PRIV01-C 第二层 E1(fail-closed)
    return this.db.asPrincipal(owner, async (c) => {
      // advisory 事务锁串行化同用户并发"开始面试",防两次点击 check-then-act 竞态各 INSERT 一条。
      await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [owner, 'iv-create']);
      const open = await c.query(
        "SELECT id, status FROM interview WHERE status NOT IN ('completed','abandoned','failed') ORDER BY id DESC LIMIT 1"); // RLS 只见己(集合端点空集=合法,E5 白名单)
      if (open.rowCount! > 0) return { interviewId: open.rows[0].id, status: open.rows[0].status, reused: true };
      const id = newEntityId('iv');
      await c.query("INSERT INTO interview(id, owner_user_id, status) VALUES ($1,$2,'created')", [id, owner]); // RLS WITH CHECK owner=principal
      return { interviewId: id, status: 'created', reused: false };
    });
  }

  // 列出自己的面试(RLS 只见己),可按 status 过滤 + limit 分页。
  async list(principal: string, status?: string, limit?: string) {
    const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
    // PRIV01-C 第二层 E1+E2:入口显式 owner + 列表显式必选 owner 谓词(原仅隐式 RLS)。授权根仍为 RLS。
    const owner = requireOwnerUserId(principal, 'interview.list');
    const listScope = buildRequiredOwnerFilter(owner, 'interview.list.scope');
    const projection = `
      SELECT i.id, i.status, i.created_at,
        i.job_title_snapshot AS job_title,
        i.resume_id,
        r.created_at AS resume_created_at, r.content_sha AS resume_content_sha,
        rp.structured #>> '{experience,0,text}' AS resume_experience_hint,
        rp.structured #>> '{skills,0,text}' AS resume_skill_hint,
        q.current_question_index,
        COALESCE(q.issued_turns, 0)::int AS issued_turns,
        COALESCE(q.answered_turns, 0)::int AS answered_turns,
        q.current_turn,
        q.processing_turn
      FROM interview i
      LEFT JOIN resume r ON r.id=i.resume_id AND r.owner_user_id=i.owner_user_id
      LEFT JOIN resume_profile rp ON rp.resume_id=r.id AND rp.owner_user_id=r.owner_user_id
      LEFT JOIN LATERAL (
        SELECT
          max(iq.turn) FILTER (WHERE iq.status <> 'cancelled')::int AS current_question_index,
          count(*) FILTER (WHERE iq.status <> 'cancelled')::int AS issued_turns,
          count(*) FILTER (WHERE iq.status = 'answered')::int AS answered_turns,
          max(iq.turn) FILTER (WHERE iq.status = 'issued')::int AS current_turn,
          max(iq.turn) FILTER (WHERE iq.status = 'queued')::int AS processing_turn
        FROM interview_question iq
        WHERE iq.interview_id = i.id AND iq.owner_user_id = i.owner_user_id
      ) q ON true`;
    const r = await this.db.asPrincipal(owner, (c) =>
      status
        ? c.query(`${projection} WHERE i.owner_user_id=$2 AND i.status=$1 AND interview_privacy_active(i.id) ORDER BY i.created_at DESC NULLS LAST, i.id DESC LIMIT $3`, [status, listScope.value, lim])
        : c.query(`${projection} WHERE i.owner_user_id=$1 AND interview_privacy_active(i.id) ORDER BY i.created_at DESC NULLS LAST, i.id DESC LIMIT $2`, [listScope.value, lim]));
    return { interviews: r.rows.map(toInterviewView) };
  }

  async get(principal: string, id: string) {
    const owner = requireOwnerUserId(principal, 'interview.get');   // PRIV01-C 第二层 E1(guard 0 行→404 fail-closed)
    const r = await this.db.asPrincipal(owner, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      return c.query(`
        SELECT i.id, i.status, i.created_at,
          i.job_title_snapshot AS job_title,
          i.resume_id,
          r.created_at AS resume_created_at, r.content_sha AS resume_content_sha,
          rp.structured #>> '{experience,0,text}' AS resume_experience_hint,
          rp.structured #>> '{skills,0,text}' AS resume_skill_hint,
          q.current_question_index,
          COALESCE(q.issued_turns, 0)::int AS issued_turns,
          COALESCE(q.answered_turns, 0)::int AS answered_turns,
          q.current_turn,
          q.processing_turn
        FROM interview i
        LEFT JOIN resume r ON r.id=i.resume_id AND r.owner_user_id=i.owner_user_id
        LEFT JOIN resume_profile rp ON rp.resume_id=r.id AND rp.owner_user_id=r.owner_user_id
        LEFT JOIN LATERAL (
          SELECT
            max(iq.turn) FILTER (WHERE iq.status <> 'cancelled')::int AS current_question_index,
            count(*) FILTER (WHERE iq.status <> 'cancelled')::int AS issued_turns,
            count(*) FILTER (WHERE iq.status = 'answered')::int AS answered_turns,
            max(iq.turn) FILTER (WHERE iq.status = 'issued')::int AS current_turn,
            max(iq.turn) FILTER (WHERE iq.status = 'queued')::int AS processing_turn
          FROM interview_question iq
          WHERE iq.interview_id = i.id AND iq.owner_user_id = i.owner_user_id
        ) q ON true
        WHERE i.id=$1`, [id]);
    });
    return r.rows[0] ? toInterviewView(r.rows[0]) : undefined;
  }

  // 查看面试报告:ready 返内容;queued/processing 返状态(前端按 report_ready 事件刷新);report_unavailable 已由舱壁标 failed。
  async report(principal: string, id: string) {
    return reportView(this.db, this.guardInterviewPrivacy.bind(this), principal, id);
  }

  // 报告重试:失败/隔离的报告重新入队生成(舱壁降级后的用户侧恢复——报告挂了不连累面试,且可重试)。
  async retryReport(principal: string, id: string) {
    this.denyPublicPreviewWrite();
    return retryReportById(this.db, this.guardInterviewPrivacy.bind(this), principal, id);
  }

  // 报告导出 markdown(用户下载/分享)。返回 { ready, md } 供 controller 写响应(SSE/原始响应胶水留在 controller)。
  async exportReport(principal: string, id: string): Promise<{ ready: false } | { ready: true; md: string }> {
    return exportReportMd(this.db, this.guardInterviewPrivacy.bind(this), principal, id);
  }

  // 面试转写:题面/outcome 来自 ledger 对齐的 answer_evaluated；分数只读 ScoreCard，无卡 null（不读 payload.score）。
  transcript(principal: string, id: string) {
    return transcriptView(this.db, this.guardInterviewPrivacy.bind(this), principal, id);
  }

  // 生成能力评估:面试各题 ScoreCard(确定性总分)→ 维度+差距,落库(ready),返回。
  generateAssessment(principal: string, id: string) {
    this.denyPublicPreviewWrite();
    return generateAssessmentFor(this.db, this.guardInterviewPrivacy.bind(this), principal, id);
  }

  async getAssessment(principal: string, id: string) {
    return getAssessmentFor(this.db, this.guardInterviewPrivacy.bind(this), principal, id);
  }

  // 学习计划:据评估差距维度生成学习项,落库。需先有评估。
  generateLearningPlan(principal: string, id: string) {
    this.denyPublicPreviewWrite();
    return generateLearningPlanFor(this.db, this.guardInterviewPrivacy.bind(this), principal, id);
  }

  getLearningPlan(principal: string, id: string) {
    return getLearningPlanFor(this.db, this.guardInterviewPrivacy.bind(this), principal, id);
  }

  // 标记某学习项完成(留存:打卡学过的)。topic 为键;幂等。
  async completeLearningItem(principal: string, id: string, b: { topic?: string }) {
    this.denyPublicPreviewWrite();
    if (!b?.topic) throw new HttpException({ error: 'missing_topic' }, HttpStatus.BAD_REQUEST);
    return completeLearningItemFor(this.db, this.guardInterviewPrivacy.bind(this), principal, id, b);
  }

  // 职业路径:据评估综合分+弱项生成,落库。成长链终点。
  // GAP-UC004-FI3-GRAPH-WIRING Candidate A:derive 经 career-path 单节点图执行(@meetwise/ai-graphs,纯本地,零模型调用),
  // AiGraphRun(career-path) 状态机真实落库:guards/评估前置(tx1,零写)→ create/reuse active(tx2,version+1)
  // → 图(derive)→ career_path upsert 原样 + active→succeeded(tx3 同事务)| 失败 active→failed(tx4,version+1)后 rethrow。
  // 对外契约冻结:成功体 {readiness,level,milestones} / 409 信封 / 500 internal_error / GET 语义全部原样。
  // (GODFN-1c 注:本方法留 facade——三处 guard 调用点跨三个事务闭包,拆出会使 guardInterviewPrivacy
  //  调用点计数漂移,违五值等数;getCareerPath 单 guard 点已迁 interview-assessment.ts。)
  async generateCareerPath(principal: string, id: string) {
    this.denyPublicPreviewWrite();
    const pre = await this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      const a = await c.query('SELECT overall, dimensions FROM assessment_report WHERE interview_id=$1', [id]);
      if (a.rowCount === 0) throw new HttpException({ error: 'assessment_required' }, HttpStatus.CONFLICT);
      const weaknesses: string[] = (a.rows[0].dimensions ?? []).filter((d: any) => d.gap).map((d: any) => d.dimension);
      let overall: number;
      try { overall = requireTrustedPracticeOverall(a.rows[0].overall); }
      catch (e) {
        const code = (e as { code?: string }).code;
        if (code === 'insufficient_evidence' || code === 'score_value_invalid')
          throw new HttpException({ error: 'insufficient_evidence' }, HttpStatus.CONFLICT);
        throw e;
      }
      return { overall, weaknesses };
    });
    const leaseOwner = randomUUID();
    // C-HA-2 seam:生效点在 guards/前置之后、仅替换图 dep;env 未设 = 原 deriveCareerPath 原样(同一引用)。
    const derive = selectCareerPathDerive(id, careerPathFailSeamThreadId(), deriveCareerPath);
    return runCareerPathGraph<{ runId: string; version: number }>(pre, {
      derive,
      ledger: {
        begin: () => this.db.asPrincipal(principal, async (c) => {
          await this.guardInterviewPrivacy(c, id);
          // 同线程并发 begin 串行化(事务级 advisory lock,提交即释放);latest-row FOR UPDATE 复用/接管。
          await c.query('SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))', [CAREER_PATH_GRAPH_NAME, `${principal}:${id}`]);
          const cur = await c.query(
            `SELECT run_id FROM ai_graph_run WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3
              ORDER BY version DESC LIMIT 1 FOR UPDATE`,
            [CAREER_PATH_GRAPH_NAME, id, principal]);
          const r = cur.rowCount === 0
            ? await c.query(
              `INSERT INTO ai_graph_run(graph_name,thread_id,owner_user_id,status,version,lease_owner,lease_expires_at)
                 VALUES ($1,$2,$3,'active',1,$4,now()+($5||' seconds')::interval) RETURNING run_id,version`,
              [CAREER_PATH_GRAPH_NAME, id, principal, leaseOwner, String(CAREER_PATH_LEASE_SECONDS)])
            : await c.query(
              `UPDATE ai_graph_run SET status='active',version=version+1,lease_owner=$3,lease_expires_at=now()+($4||' seconds')::interval
                WHERE run_id=$1 AND owner_user_id=$2 RETURNING run_id,version`,
              [cur.rows[0].run_id, principal, leaseOwner, String(CAREER_PATH_LEASE_SECONDS)]);
          return { runId: String(r.rows[0].run_id), version: Number(r.rows[0].version) };
        }),
        commitSuccess: (run, cp) => this.db.asPrincipal(principal, async (c) => {
          await this.guardInterviewPrivacy(c, id);
          await c.query(
            `INSERT INTO career_path(id, owner_user_id, interview_id, readiness, level, milestones)
               VALUES ($1,$2,$3,$4,$5,$6)
               ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET readiness=EXCLUDED.readiness, level=EXCLUDED.level, milestones=EXCLUDED.milestones, version=career_path.version+1`,
            [randomUUID(), principal, id, cp.readiness, cp.level, JSON.stringify(cp.milestones)]);
          // active→succeeded 与业务落库同事务;fence(version)被并发接管时 0 行=不越权改别人的 run。
          await c.query(
            `UPDATE ai_graph_run SET status='succeeded',version=version+1,lease_owner=NULL,lease_expires_at=NULL
              WHERE run_id=$1 AND owner_user_id=$2 AND version=$3 AND status='active'`,
            [run.runId, principal, run.version]);
        }),
        markFailed: (run) => this.db.asPrincipal(principal, async (c) => {
          await c.query(
            `UPDATE ai_graph_run SET status='failed',version=version+1,lease_owner=NULL,lease_expires_at=NULL
              WHERE run_id=$1 AND owner_user_id=$2 AND version=$3 AND status='active'`,
            [run.runId, principal, run.version]);
        }),
      },
      // fail-closed:转换自身失败不伪装终态(行如实停留 active,下次 begin 接管);原错误照常 rethrow。
      onTransitionError: (e) => careerPathLogger.error(`career_path_graph_run_failed_transition_error${(e as { code?: string })?.code ? ` [${(e as { code?: string }).code}]` : ''}`),
    });
  }

  async getCareerPath(principal: string, id: string) {
    return getCareerPathFor(this.db, this.guardInterviewPrivacy.bind(this), principal, id);
  }

  /**
   * Legacy fixed-question endpoint deliberately remains as an authenticated
   * 410 instead of disappearing as a 404: old clients get an actionable
   * migration signal, while no caller can create an answer_evaluated event.
   * Production-like answers still use /turn. Preview may write the rehearsal
   * ledger via /answers; that path is not INT-TRANSCRIPT-01 cutover.
   */
  async answer(_principal: string, _id: string, _key: string): Promise<never> {
    throw new HttpException({ error: 'legacy_answer_endpoint_disabled', replacement: 'turn' }, HttpStatus.GONE);
  }

  // SSE 事件取数(replay):返回 null 表示越权/不存在(404),否则返回待写入的事件行。原始流写入胶水留在 controller。
  events(principal: string, id: string, lastEventId?: string) {
    const lastId = parseLastEventId(lastEventId);
    return this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      const rows = (await c.query('SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND seq>$2 ORDER BY seq', [id, lastId])).rows;
      return { lastId, rows };
    });
  }
}
