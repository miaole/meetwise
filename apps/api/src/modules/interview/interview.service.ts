import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { assertInterviewPrivacyActive, reserveEntitlement, enqueueInterviewJob, getReport, abandonInterviewAndRelease, requeueFailedReport, claimInterviewAnswer, listScorableScoreCards, submitInterviewAnswer, viewInterviewAnswerSnapshot, readbackInterviewAnswerSubmission } from '@meetwise/db';
import { deriveAssessment, deriveLearningPlan, deriveCareerPath, resolveOverlongAnswerPolicy, isTrustedScoreIdentity, requireTrustedPracticeOverall } from '@meetwise/domain';
import { VOICE_EGRESS_DISABLED_ID, type Asr, type Tts, type StreamingTts } from '@meetwise/ai-runtime';
import type { InterviewAnswerPreviewSubmitDto, InterviewAnswerSubmitResult, TranscribeDto, TurnDto } from '@meetwise/contracts';
import { DbService } from '../../platform/db.service';
import { RateLimitService } from '../../platform/rate-limit.service';
import {
  assertPublicPreviewControlledWriteAllowed,
  assertPublicPreviewWritesClosed,
  PublicPreviewReadOnlyError,
  PublicPreviewWriteUnavailableError,
} from '../../platform/public-preview';
import { resumeDisplayName } from '../resume/resume-display.ts';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;   // 10MB 上限(单题语音作答足够;防大文件 DoS)
// 语音端点(ASR/TTS)调付费百炼模型但无额度预留(边缘 I/O,非整场面试计费单元)→ **per-principal 令牌桶限流防成本 DoS**(安全审计高危#1)。
// 突发 40(足够一场语音面试的 ASR+TTS 往返),稳态 0.3/秒(~18/分)——正常用够、滥用循环被摁住。
const VOICE_RL = { capacity: 40, refillPerSec: 0.3 };
// 每次 turn 都入队一条**付费评分** job → 无限流 = 成本 DoS(安全审计 F1)。突发 30(足够一场面试的作答+澄清重答),稳态 0.2/秒(~12/分)。
const TURN_RL = { capacity: 30, refillPerSec: 0.2 };
// interview 表状态机:created → active →(completed | failed | abandoned)。终态集中一处定义,begin/turn/abandon 守卫共用。
const TERMINAL_INTERVIEW = ['completed', 'abandoned', 'failed'];
const MAX_TURN = 256;             // turn 号上界(默认绝对杀开关 120 + clarify 冗余;防超大 turn 号刷无限 job)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toInterviewView(row: any) {
  let displayNumber = 0;
  for (const char of String(row.id)) displayNumber = (displayNumber * 33 + char.charCodeAt(0)) % 1_000_000;
  return {
    id: row.id,
    status: row.status,
    job_title: row.job_title,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    display_code: `场次${String(displayNumber).padStart(6, '0')}`,
    resume_display_name: row.resume_id
      ? resumeDisplayName({
          created_at: row.resume_created_at,
          experience_hint: row.resume_experience_hint,
          skill_hint: row.resume_skill_hint,
          content_sha: row.resume_content_sha,
        })
      : null,
    current_question_index: row.current_question_index,
    issued_turns: row.issued_turns,
    answered_turns: row.answered_turns,
    current_turn: row.current_turn,
    processing_turn: row.processing_turn,
  };
}
// 语音接口由 DI seam 提供。组合根经 registry + 能力 Key 接线批量 ASR/TTS；
// 缺 Key 或未接线仍 fail-closed。service 不硬编码供应商细节。
export const VOICE_ASR = Symbol.for('meetwise.VOICE_ASR');
export const VOICE_TTS = Symbol.for('meetwise.VOICE_TTS');
export const VOICE_STREAM_TTS = Symbol.for('meetwise.VOICE_STREAM_TTS');
/** Transcript listing uses the domain honesty gate: canonical question identity
 * plus answer claim.  Event `.score` is never the listing authority — ScoreCard
 * totals are joined afterwards, and missing cards stay null. */
/** MIME → DashScope 可识别的 format 字符串(MediaRecorder 常出 audio/webm;codecs=opus / audio/mp4)。 */
function formatFromMime(mime: string): string {
  const m = (mime || '').toLowerCase();
  const sub = m.split('/')[1]?.split(';')[0]?.trim();      // 'audio/webm;codecs=opus' → 'webm'
  if (sub === 'mpeg' || sub === 'mpga') return 'mp3';
  if (sub === 'x-m4a') return 'm4a';
  return sub || 'mp3';
}

/**
 * 面试应用服务(拥有 asPrincipal 事务边界 + 业务编排:advisory 锁、幂等、额度预留、入队、状态机、RLS)。
 * controller 只解析/校验/映射 HTTP,不碰 SQL(修审计 F1——interview.controller 原为最大违规者)。行为完全保持。
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
    } catch (error: any) {
      if (error?.message === 'interview_privacy_fenced')
        throw new HttpException({ error: 'interview_privacy_fenced' }, HttpStatus.GONE);
      throw error;
    }
  }

  // 开始面试:扣额度 + 入队 start job(长编排在 worker 跑,api 薄)。reqId 随 payload 入队 → worker 出队沿用 → 落模型 trace.request_id(全链路一跳到底)。
  begin(principal: string, id: string, resumeId: string, requestId?: string) {
    this.denyPublicPreviewWrite();
    if (!resumeId) throw new HttpException({ error: 'missing_resume_id' }, HttpStatus.BAD_REQUEST);
    if (!UUID_RE.test(resumeId)) throw new HttpException({ error: 'invalid_resume_id' }, HttpStatus.BAD_REQUEST);
    return this.db.asPrincipal(principal, async (c) => {
      // **并发竞态安全**:事务级 advisory 锁串行化同面试的并发 begin(对齐 invoke 关口)——否则两并发都过 check-then-act = 双开。
      await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', ['begin', id]);
      const cur = await c.query('SELECT status,resume_id,resume_privacy_epoch,application_id FROM interview WHERE id=$1 FOR UPDATE', [id]);
      if (cur.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      await this.guardInterviewPrivacy(c, id);
      // **状态机守卫(此前 begin 一个守卫都没有 → 可复活终态面试 + 白扣额度,负测 BUG-PROBE 抓到)**:
      //   终态(completed/failed/abandoned)绝不可再 begin(不可复活、不可二次扣额)。
      if (TERMINAL_INTERVIEW.includes(cur.rows[0].status))
        throw new HttpException({ error: 'interview_not_active', status: cur.rows[0].status }, HttpStatus.CONFLICT);

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
          [id, principal, resumeId],
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
      // 额度不足时 reserveEntitlement **抛**(回滚),不是返回——必须 catch 映射成 402,否则被异常过滤当 500(E2E 实测抓到)。
      let rr;
      try { rr = await reserveEntitlement(c, principal, id, 'mock_interview', 1.0); }
      catch (e: any) {
        if (e?.code === 'insufficient_entitlement') throw new HttpException({ error: 'insufficient_entitlement' }, HttpStatus.PAYMENT_REQUIRED);
        throw e;
      }
      if (rr.status !== 'reserved') throw new HttpException({ error: 'insufficient_entitlement' }, HttpStatus.PAYMENT_REQUIRED);
      // The queue derives the v64 typed id+epoch from the just-bound parent;
      // JSON retains only transport tracing, never a resume locator.
      const jobId = await enqueueInterviewJob(c, principal, id, 'start', { requestId }, 0);
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
    return this.db.asPrincipal(principal, async (c) => {
      // 状态机守卫(对齐 quiz/diagnosis 的 CAS 守卫;安全审计 F1):只对**未终态**面试收作答。
      // 对 completed/abandoned/failed 提交 → 409,绝不制造新付费 job、不绕状态机(此前一个守卫都没有)。
      const iv = await c.query('SELECT status FROM interview WHERE id=$1', [id]);
      if (iv.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      // Delete holds the same transaction advisory lock and atomically
      // redacts any earlier queue row.  Put this before question claim so a
      // fenced turn leaves neither an answer hash nor a job behind.
      await this.guardInterviewPrivacy(c, id);
      await this.assertAnswerable(c, id, iv.rows[0].status);   // 终态拒 / 未 begin 拒(见下方共用守卫)
      const claim = await claimInterviewAnswer(c, principal, id, body);
      if (claim.status === 'hash_mismatch') throw new HttpException({ error: 'answer_hash_mismatch' }, HttpStatus.UNPROCESSABLE_ENTITY);
      if (claim.status === 'not_ready') throw new HttpException({ error: 'question_not_ready' }, HttpStatus.CONFLICT);
      if (claim.status === 'stale') throw new HttpException({ error: 'stale_question' }, HttpStatus.CONFLICT);
      if (claim.status === 'conflict') throw new HttpException({ error: 'answer_conflict' }, HttpStatus.CONFLICT);
      const jobId = await enqueueInterviewJob(c, principal, id, 'answer', { ...body, requestId }, turn + 1);
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
    return this.db.asPrincipal(principal, async (c) => {
      await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', ['preview-answer', id]);
      const iv = await c.query('SELECT status FROM interview WHERE id=$1', [id]);
      if (iv.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
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
          WHERE owner_user_id=current_setting('app.principal_user', true)
            AND interview_id=$1 AND question_id=$2 FOR UPDATE`,
        [id, body.questionId],
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
          privacyEpoch: 1,
        });
        if (submitted.interviewId !== id || submitted.questionId !== body.questionId
          || submitted.stateVersion !== body.stateVersion)
          throw new HttpException({ error: 'interview_answer_submission_conflict' }, HttpStatus.CONFLICT);
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
  // 边缘 I/O(ASR)直调 ai-runtime voice seam(在 invoke 关口之外,与 resume extractResumeText 同性质:api service 内同步请求-响应一次外呼)。
  // 隐私:只回转写文本,原始录音不落库(rules 隐私铁律——录音需单独同意才存)。
  /** TTS:把 AI 题/追问合成语音(qwen-tts),供单人语音模式播报。未配置/失败 → 降级(前端回落文字读题)。 */
  async speak(principal: string, id: string, dto: { text: string }, options: { signal?: AbortSignal } = {}) {
    this.voiceGate(principal);
    await this.db.asPrincipal(principal, (c) => this.guardInterviewPrivacy(c, id));
    const text = (dto.text ?? '').trim();
    if (!text) throw new HttpException({ error: 'empty_text' }, HttpStatus.BAD_REQUEST);
    try {
      const audio = await this.tts.synthesize(text.slice(0, 2000), { signal: options.signal });   // 截断防超长 TTS
      return { audioBase64: Buffer.from(audio).toString('base64'), mimeType: 'audio/wav' };
    } catch (e: any) {
      if (String(e?.message) === 'tts_not_configured')
        throw new HttpException({ error: 'tts_unavailable', message: '语音播报暂不可用，将以文字显示题目' }, HttpStatus.SERVICE_UNAVAILABLE);
      if (String(e?.message) === 'tts_download_capacity_exceeded')
        throw new HttpException({ error: 'tts_busy', message: '语音播报繁忙，将以文字显示题目', retryAfterSeconds: 1 }, HttpStatus.SERVICE_UNAVAILABLE);
      if (String(e?.message) === 'tts_malformed')
        throw new HttpException({ error: 'tts_failed', message: '语音播报失败，将以文字显示题目' }, HttpStatus.BAD_GATEWAY);
      throw new HttpException({ error: 'tts_failed', message: '语音播报失败，将以文字显示题目' }, HttpStatus.BAD_GATEWAY);
    }
  }

  /** 流式 TTS 前置:归属校验(404)+ 文本校验(400)+ 配置校验(503)。**真正的 chunk 写入是 Fastify raw 流胶水,留在 controller**(对齐 SSE 边界 F5)。
   *  把"首音延迟"从整段合成下载(qwen-tts ~9s)降到首块到达(cosyvoice WS ~1-2s);未配置/中断 → 前端回落非流式 /speak 再回落文字读题(无死胡同)。 */
  async speakStreamPrepare(principal: string, id: string, dto: { text: string }) {
    this.voiceGate(principal);
    await this.db.asPrincipal(principal, (c) => this.guardInterviewPrivacy(c, id));
    const text = (dto.text ?? '').trim();
    if (!text) throw new HttpException({ error: 'empty_text' }, HttpStatus.BAD_REQUEST);
    // Disabled before hijack/headers: the browser can always fall back to text
    // and no stream transport can be constructed from a broad provider key.
    if (this.streamTts.id === VOICE_EGRESS_DISABLED_ID)
      throw new HttpException({ error: 'tts_unavailable', message: '语音播报暂不可用，将以文字显示题目' }, HttpStatus.SERVICE_UNAVAILABLE);
    return { text: text.slice(0, 2000) };   // 截断防超长 TTS(对齐非流式 speak)
  }

  /** 流式 TTS 音频块迭代器(MP3,signal 可中断:挂断/切走/barge-in 即停吐)。边缘 I/O,在 invoke 关口之外。 */
  speakStreamChunks(text: string, signal: AbortSignal): AsyncIterable<Uint8Array> {
    return this.streamTts.synthesizeStream(text, signal);
  }

  async transcribe(principal: string, id: string, dto: TranscribeDto, options?: { signal?: AbortSignal }) {
    this.voiceGate(principal);
    // Check the same durable fence before any audio leaves the process.  This
    // closes delete-wins; dispatch-wins provider retention receipts remain a
    // separate release blocker until voice uses the durable egress outbox.
    await this.db.asPrincipal(principal, (c) => this.guardInterviewPrivacy(c, id));
    const audio = Buffer.from(dto.audioBase64, 'base64');
    if (audio.length === 0) throw new HttpException({ error: 'empty_audio' }, HttpStatus.BAD_REQUEST);
    if (audio.length > MAX_AUDIO_BYTES) throw new HttpException({ error: 'audio_too_large' }, HttpStatus.PAYLOAD_TOO_LARGE);
    const format = dto.format?.trim() || formatFromMime(dto.mimeType);
    try {
      const text = await this.asr.transcribe(new Uint8Array(audio), { format, signal: options?.signal });
      if (typeof text !== 'string')
        throw new HttpException({ error: 'asr_failed', message: '语音转写失败，请重试或改用文字作答' }, HttpStatus.BAD_GATEWAY);
      // 这不是说话人识别结果：唯一可信事实是请求经过同意、来自本机单轨。
      // 在双轨/电话接入与 DER/WER 验收完成前，显式返回 unavailable，禁止下游伪造候选人/面试官归因。
      return {
        text,
        capture: {
          mode: dto.capture.mode,
          speakerAttribution: 'not_diarized' as const,
          wordTimestamps: 'not_available' as const,
        },
      };
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      // 优雅降级:模型未配置 / 转写失败 → 明确错误,前端回落到文字作答(不抛 500,不死胡同)。
      if (String(e?.message) === 'asr_not_configured')
        throw new HttpException({ error: 'asr_unavailable', message: '语音转写暂不可用，请改用文字作答' }, HttpStatus.SERVICE_UNAVAILABLE);
      if (String(e?.message) === 'asr_malformed')
        throw new HttpException({ error: 'asr_failed', message: '语音转写失败，请重试或改用文字作答' }, HttpStatus.BAD_GATEWAY);
      if (String(e?.message) === 'asr_timeout')
        throw new HttpException({ error: 'asr_timeout', message: '语音转写超时，请重试或改用文字作答' }, HttpStatus.GATEWAY_TIMEOUT);
      // 499 is an internal/client-aborted classification. The response socket
      // is already gone in the normal path, so this must never be aggregated
      // with supplier timeouts or advertised as a retryable provider failure.
      if (String(e?.message) === 'asr_aborted')
        throw new HttpException({ error: 'asr_cancelled' }, 499);
      throw new HttpException({ error: 'asr_failed', message: '语音转写失败，请重试或改用文字作答' }, HttpStatus.BAD_GATEWAY);
    }
  }

  // 题目反馈(赞/踩):收集人对 AI 生成题的质量信号,喂 eval/改进闭环。一题一反馈,可改(UPSERT)。
  async questionFeedback(principal: string, id: string, idx: string, b: { rating?: string; comment?: string }) {
    this.denyPublicPreviewWrite();
    if (b?.rating !== 'up' && b?.rating !== 'down') throw new HttpException({ error: 'invalid_rating' }, HttpStatus.BAD_REQUEST);
    const qi = Number(idx);
    if (!Number.isInteger(qi) || qi < 0) throw new HttpException({ error: 'invalid_index' }, HttpStatus.BAD_REQUEST);
    await this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      await c.query(`INSERT INTO question_feedback(owner_user_id, interview_id, question_index, rating, comment) VALUES ($1,$2,$3,$4,$5)
               ON CONFLICT (owner_user_id, interview_id, question_index) DO UPDATE SET rating=EXCLUDED.rating, comment=EXCLUDED.comment`,
        [principal, id, qi, b.rating, b.comment ?? null]);
    });
    return { recorded: true };
  }

  // 放弃面试:**退还预留额度**(不漏扣)+ status abandoned。对接 commerce saga release 路径。
  abandon(principal: string, id: string) {
    this.denyPublicPreviewWrite();
    return this.db.asPrincipal(principal, async (c) => {
      // advisory 锁仅折叠同端点重复点击；与 worker 的真正串行化由
      // abandonInterviewAndRelease 内部在 consumption 行上的 FOR UPDATE + 条件状态 CAS 完成。
      await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', ['abandon', id]);
      const cur = await c.query('SELECT status FROM interview WHERE id=$1', [id]);
      if (cur.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      await this.guardInterviewPrivacy(c, id);
      const st = cur.rows[0].status;
      if (st === 'completed' || st === 'failed')
        throw new HttpException({ error: 'interview_not_active', status: st }, HttpStatus.CONFLICT);
      try {
        const result = await abandonInterviewAndRelease(c, principal, id);
        return { abandoned: true, released: result.released, alreadyAbandoned: result.status === 'already_abandoned' };
      } catch (e: any) {
        if (e?.code === 'interview_release_failed' || e?.code === 'interview_abandon_conflict')
          throw new HttpException({ error: 'interview_not_active', status: e?.status ?? st }, HttpStatus.CONFLICT);
        throw e;
      }
    });
  }

  // 新建面试(空壳,created)。begin 才扣额度跑图。
  // **幂等**:同一用户同一时刻只保留一个进行中会话——连点/重复提交不再各插一条(用户实测点 3 次出 3 条 = 这里没幂等)。
  // 未结束(非 completed/abandoned/failed)就复用既有;复用后再 begin 由 begin 的 alreadyBegun 幂等兜住(不重复扣费)。
  async create(principal: string) {
    this.denyPublicPreviewWrite();
    return this.db.asPrincipal(principal, async (c) => {
      // advisory 事务锁串行化同用户并发"开始面试",防两次点击 check-then-act 竞态各 INSERT 一条。
      await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [principal, 'iv-create']);
      const open = await c.query(
        "SELECT id, status FROM interview WHERE status NOT IN ('completed','abandoned','failed') ORDER BY id DESC LIMIT 1"); // RLS 只见己
      if (open.rowCount! > 0) return { interviewId: open.rows[0].id, status: open.rows[0].status, reused: true };
      const id = 'iv_' + randomUUID();
      await c.query("INSERT INTO interview(id, owner_user_id, status) VALUES ($1,$2,'created')", [id, principal]); // RLS WITH CHECK owner=principal
      return { interviewId: id, status: 'created', reused: false };
    });
  }

  // 列出自己的面试(RLS 只见己),可按 status 过滤 + limit 分页。
  async list(principal: string, status?: string, limit?: string) {
    const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
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
    const r = await this.db.asPrincipal(principal, (c) =>
      status
        ? c.query(`${projection} WHERE i.status=$1 AND interview_privacy_active(i.id) ORDER BY i.created_at DESC NULLS LAST, i.id DESC LIMIT $2`, [status, lim])
        : c.query(`${projection} WHERE interview_privacy_active(i.id) ORDER BY i.created_at DESC NULLS LAST, i.id DESC LIMIT $1`, [lim]));
    return { interviews: r.rows.map(toInterviewView) };
  }

  async get(principal: string, id: string) {
    const r = await this.db.asPrincipal(principal, async (c) => {
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
    const r = await this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      return getReport(c, principal, id);
    });
    if (!r) {
      // **E5 修:无报告行 → 区分"面试进行中(还没生成)"与"面试已中断(失败终态)"**。
      //  后者(worker 发过 interview_unavailable、从未 enqueueReport)绝不能被报告页显示成"继续答题"(误导:让用户去答一场已死的面试)。
      const failed = await this.db.asPrincipal(principal, (c) =>
        c.query("SELECT kind FROM interview_event WHERE stream_key=$1 AND kind IN ('interview_unavailable','assessment_unavailable') ORDER BY seq DESC LIMIT 1", [id]));
      if (failed.rows[0]?.kind === 'assessment_unavailable')
        return { status: 'assessment_unavailable' as const, content: null };
      if ((failed.rowCount ?? 0) > 0) return { status: 'interview_failed' as const, content: null };   // 200:页面显示"面试已中断"
      throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);   // 真·进行中
    }
    return { status: r.status, content: r.status === 'ready' ? r.content : null };
  }

  // 报告重试:失败/隔离的报告重新入队生成(舱壁降级后的用户侧恢复——报告挂了不连累面试,且可重试)。
  async retryReport(principal: string, id: string) {
    this.denyPublicPreviewWrite();
    const ok = await this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      const rep = await c.query("SELECT id FROM ai_report WHERE interview_id=$1 AND status IN ('failed','quarantined')", [id]);
      if (rep.rowCount === 0) return false;
      return requeueFailedReport(c, principal, rep.rows[0].id);
    });
    if (!ok) throw new HttpException({ error: 'no_retriable_report' }, HttpStatus.NOT_FOUND);
    return { requeued: true };
  }

  // 报告导出 markdown(用户下载/分享)。返回 { ready, md } 供 controller 写响应(SSE/原始响应胶水留在 controller)。
  async exportReport(principal: string, id: string): Promise<{ ready: false } | { ready: true; md: string }> {
    const r = await this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      return getReport(c, principal, id);
    });
    if (!r || r.status !== 'ready') return { ready: false };
    const c = r.content as { overall?: number; sections?: { title: string; body: string }[] };
    const md = `# 面试报告\n\n**综合评分：${c.overall ?? '—'}**\n\n` + (c.sections ?? []).map((s) => `## ${s.title}\n\n${s.body}`).join('\n\n');
    return { ready: true, md };
  }

  // 面试转写:题面/outcome 来自 ledger 对齐的 answer_evaluated；分数只读 ScoreCard，无卡 null（不读 payload.score）。
  transcript(principal: string, id: string) {
    return this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      const iv = await c.query('SELECT questions FROM interview WHERE id=$1', [id]);
      if (iv.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      const ev = await c.query(
        `SELECT e.payload
           FROM interview_event e
          WHERE e.stream_key=$1
            AND e.kind='answer_evaluated'
            AND EXISTS (
              SELECT 1 FROM interview_question q
               WHERE q.owner_user_id=e.owner_user_id
                 AND q.interview_id=e.stream_key
                 AND q.question_id=e.payload->>'questionId'
                 AND q.state_version=CASE WHEN COALESCE(e.payload->>'stateVersion','') ~ '^[0-9]+$' THEN (e.payload->>'stateVersion')::int ELSE NULL END
                 AND q.answer_id=e.payload->>'answerId'
                 AND q.answer_hash=e.payload->>'answerHash'
                 AND q.competency=e.payload->>'competency'
                 AND q.status='answered'
            )
          ORDER BY e.seq`, [id]);
      // 得分权威 = ScoreCard(确定性总分),非事件 .score;逐题按 questionId 对齐,fail-closed 无卡=null(无数值)。
      const cards = await listScorableScoreCards(c, id);
      const totalByQuestion = new Map(cards.map((card) => [card.questionId, card.deterministicTotal]));
      // **E2 修:纯从 answer_evaluated 构建题面/outcome/competency**(每条自带 question/outcome/competency,天然对齐,不再靠 question_ready 序号 vs turn 两套计数 join)。
      //  自适应主线:题面在 answer_evaluated.question(worker 落库)。遗留固定题单:回退 questions[turn] 列。
      const legacy: string[] = iv.rows[0].questions ?? [];
      return { turns: ev.rows.filter((r: any) => isTrustedScoreIdentity(r.payload)).map((r: any, i: number) => {
        const p = r.payload ?? {};
        const t = Number.isInteger(Number(p.turn)) ? Number(p.turn) : i;
        return { index: t, question: p.question || legacy[t] || '', competency: p.competency, score: totalByQuestion.get(p.questionId) ?? null, outcome: p.outcome ?? undefined };
      }) };
    });
  }

  // 生成能力评估:面试各题 ScoreCard(确定性总分)→ 维度+差距,落库(ready),返回。
  // SCOR-02 消费迁移:得分只读 ScoreCard(practice_eligible/b_review_eligible),legacy answer_evaluated.score 结构性不参与。
  generateAssessment(principal: string, id: string) {
    this.denyPublicPreviewWrite();
    return this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      const iv = await c.query('SELECT 1 FROM interview WHERE id=$1', [id]);
      if (iv.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      // 得分权威 = ScoreCard(确定性总分),按 competency 聚合(score_card 经 rubric_id 钉住 competency,无需回退问题文本)。
      const cards = await listScorableScoreCards(c, id);
      // fail-closed:无任何可评分卡(未走 SCOR-02/03 评分管线)→ 409,绝不落 overall=0 的 ready 假报告
      // (否则 career 据 0 分误判最低定位、成长曲线注入假 0 点;legacy 事件分数也不得回退兜底)。
      if (cards.length === 0) throw new HttpException({ error: 'no_scorable_cards' }, HttpStatus.CONFLICT);
      const turns = cards.map((card) => ({
        question: card.questionId,   // 仅作 competency 缺失时的维度回退;score_card 恒带 competency,不会触发
        competency: card.competency,
        score: card.deterministicTotal,
      }));
      let a: ReturnType<typeof deriveAssessment>;
      try { a = deriveAssessment(turns); }
      catch (e) {
        if ((e as { code?: string }).code === 'score_aggregate_empty')
          throw new HttpException({ error: 'no_scorable_cards' }, HttpStatus.CONFLICT);
        throw e;
      }
      await c.query(
        `INSERT INTO assessment_report(id, owner_user_id, interview_id, status, dimensions, overall)
           VALUES ($1,$2,$3,'ready',$4,$5)
           ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET status='ready', dimensions=EXCLUDED.dimensions, overall=EXCLUDED.overall, version=assessment_report.version+1`,
        [randomUUID(), principal, id, JSON.stringify(a.dimensions), a.overall]);
      return a;
    });
  }

  async getAssessment(principal: string, id: string) {
    const r = await this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      return c.query('SELECT status, dimensions, overall FROM assessment_report WHERE interview_id=$1', [id]);
    });
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return r.rows[0];
  }

  // 学习计划:据评估差距维度生成学习项,落库。需先有评估。
  generateLearningPlan(principal: string, id: string) {
    this.denyPublicPreviewWrite();
    return this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      const a = await c.query('SELECT dimensions FROM assessment_report WHERE interview_id=$1', [id]);
      if (a.rowCount === 0) throw new HttpException({ error: 'assessment_required' }, HttpStatus.CONFLICT);
      const plan = deriveLearningPlan(a.rows[0].dimensions ?? []);
      await c.query(
        `INSERT INTO learning_plan(id, owner_user_id, interview_id, items)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET items=EXCLUDED.items, version=learning_plan.version+1`,
        [randomUUID(), principal, id, JSON.stringify(plan.items)]);
      return plan;
    });
  }

  getLearningPlan(principal: string, id: string) {
    return this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      const r = await c.query('SELECT status, items FROM learning_plan WHERE interview_id=$1', [id]);
      if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
      const doneRows = await c.query('SELECT topic FROM learning_progress WHERE interview_id=$1', [id]);
      const done = new Set(doneRows.rows.map((x: any) => x.topic));
      const items = (r.rows[0].items ?? []).map((it: any) => ({ ...it, done: done.has(it.topic) }));   // 标完成度
      const completed = items.filter((it: any) => it.done).length;
      return { status: r.rows[0].status, items, progress: { completed, total: items.length } };
    });
  }

  // 标记某学习项完成(留存:打卡学过的)。topic 为键;幂等。
  async completeLearningItem(principal: string, id: string, b: { topic?: string }) {
    this.denyPublicPreviewWrite();
    if (!b?.topic) throw new HttpException({ error: 'missing_topic' }, HttpStatus.BAD_REQUEST);
    await this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      await c.query('INSERT INTO learning_progress(owner_user_id, interview_id, topic) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [principal, id, b.topic]);
    });
    return { done: true };
  }

  // 职业路径:据评估综合分+弱项生成,落库。成长链终点。
  generateCareerPath(principal: string, id: string) {
    this.denyPublicPreviewWrite();
    return this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      const a = await c.query('SELECT overall, dimensions FROM assessment_report WHERE interview_id=$1', [id]);
      if (a.rowCount === 0) throw new HttpException({ error: 'assessment_required' }, HttpStatus.CONFLICT);
      const weaknesses = (a.rows[0].dimensions ?? []).filter((d: any) => d.gap).map((d: any) => d.dimension);
      let overall: number;
      try { overall = requireTrustedPracticeOverall(a.rows[0].overall); }
      catch (e) {
        const code = (e as { code?: string }).code;
        if (code === 'insufficient_evidence' || code === 'score_value_invalid')
          throw new HttpException({ error: 'insufficient_evidence' }, HttpStatus.CONFLICT);
        throw e;
      }
      const cp = deriveCareerPath(overall, weaknesses);
      await c.query(
        `INSERT INTO career_path(id, owner_user_id, interview_id, readiness, level, milestones)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET readiness=EXCLUDED.readiness, level=EXCLUDED.level, milestones=EXCLUDED.milestones, version=career_path.version+1`,
        [randomUUID(), principal, id, cp.readiness, cp.level, JSON.stringify(cp.milestones)]);
      return cp;
    });
  }

  async getCareerPath(principal: string, id: string) {
    const r = await this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      return c.query('SELECT readiness, level, milestones FROM career_path WHERE interview_id=$1', [id]);
    });
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return r.rows[0];
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
  /** Parse the resumable SSE cursor fail-closed.  `Number()` accepts values
   * such as Infinity, decimals and whitespace; feeding those to SQL silently
   * changes replay semantics and can force expensive full-stream scans. */
  private parseLastEventId(lastEventId?: string): number {
    if (lastEventId === undefined) return 0;
    if (!/^(0|[1-9]\d{0,15})$/.test(lastEventId))
      throw new HttpException({ error: 'invalid_last_event_id' }, HttpStatus.BAD_REQUEST);
    const parsed = Number(lastEventId);
    if (!Number.isSafeInteger(parsed) || parsed < 0)
      throw new HttpException({ error: 'invalid_last_event_id' }, HttpStatus.BAD_REQUEST);
    return parsed;
  }

  events(principal: string, id: string, lastEventId?: string) {
    const lastId = this.parseLastEventId(lastEventId);
    return this.db.asPrincipal(principal, async (c) => {
      await this.guardInterviewPrivacy(c, id);
      const rows = (await c.query('SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND seq>$2 ORDER BY seq', [id, lastId])).rows;
      return { lastId, rows };
    });
  }
}
