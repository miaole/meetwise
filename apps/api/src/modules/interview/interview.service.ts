import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { reserveEntitlement, enqueueInterviewJob, getReport, releaseConsumption, requeueFailedReport } from '@meetwise/db';
import { deriveAssessment, deriveLearningPlan, deriveCareerPath } from '@meetwise/domain';
import { dashscopeAsr, dashscopeTts, dashscopeStreamingTts } from '@meetwise/ai-runtime';
import type { TranscribeDto } from '@meetwise/contracts';
import { DbService } from '../../platform/db.service';
import { RateLimitService } from '../../platform/rate-limit.service';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;   // 10MB 上限(单题语音作答足够;防大文件 DoS)
// 语音端点(ASR/TTS)调付费百炼模型但无额度预留(边缘 I/O,非整场面试计费单元)→ **per-principal 令牌桶限流防成本 DoS**(安全审计高危#1)。
// 突发 40(足够一场语音面试的 ASR+TTS 往返),稳态 0.3/秒(~18/分)——正常用够、滥用循环被摁住。
const VOICE_RL = { capacity: 40, refillPerSec: 0.3 };
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
  constructor(private readonly db: DbService, private readonly rl: RateLimitService) {}

  /** 语音端点共用限流闸(ASR/TTS 无额度预留 → 防成本 DoS)。超速 → 429。 */
  private voiceGate(principal: string) {
    if (!this.rl.allow(`voice:${principal}`, VOICE_RL.capacity, VOICE_RL.refillPerSec))
      throw new HttpException({ error: 'too_many_requests', message: '语音请求过于频繁,请稍候' }, HttpStatus.TOO_MANY_REQUESTS);
  }

  // 开始面试:扣额度 + 入队 start job(长编排在 worker 跑,api 薄)。
  begin(principal: string, id: string, resumeId: string) {
    if (!resumeId) throw new HttpException({ error: 'missing_resume_id' }, HttpStatus.BAD_REQUEST);
    return this.db.asPrincipal(principal, async (c) => {
      // **并发竞态安全**:事务级 advisory 锁串行化同面试的并发 begin(对齐 invoke 关口)——否则两并发都过 check-then-act = 双开。
      await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', ['begin', id]);
      if ((await c.query('SELECT 1 FROM interview WHERE id=$1', [id])).rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      // 幂等:已有 start job(重复 begin/网络重试)→ 不再扣额度、不再入队(否则双扣 + 双出题双花模型)
      const existing = await c.query("SELECT id FROM interview_job WHERE interview_id=$1 AND kind='start'", [id]);
      if (existing.rowCount! > 0) return { accepted: true, jobId: existing.rows[0].id, alreadyBegun: true };
      // 额度不足时 reserveEntitlement **抛**(回滚),不是返回——必须 catch 映射成 402,否则被异常过滤当 500(E2E 实测抓到)。
      let rr;
      try { rr = await reserveEntitlement(c, principal, id, 'mock_interview', 1.0); }
      catch (e: any) {
        if (e?.code === 'insufficient_entitlement') throw new HttpException({ error: 'insufficient_entitlement' }, HttpStatus.PAYMENT_REQUIRED);
        throw e;
      }
      if (rr.status !== 'reserved') throw new HttpException({ error: 'insufficient_entitlement' }, HttpStatus.PAYMENT_REQUIRED);
      const jobId = await enqueueInterviewJob(c, principal, id, 'start', { resumeId });
      return { accepted: true, jobId };
    });
  }

  // 提交一题答案:入队 answer job(worker 续图+评分)。text 答案;音频先 ASR 转写再走此端点。
  turn(principal: string, id: string, body: { turn?: number; answer?: string }) {
    const turn = Number(body?.turn);
    if (!Number.isInteger(turn) || turn < 0 || !body?.answer?.trim()) throw new HttpException({ error: 'invalid_turn' }, HttpStatus.BAD_REQUEST);
    return this.db.asPrincipal(principal, async (c) => {
      if ((await c.query('SELECT 1 FROM interview WHERE id=$1', [id])).rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      const jobId = await enqueueInterviewJob(c, principal, id, 'answer', { turn, answer: body.answer }, turn + 1);
      return { accepted: true, jobId };
    });
  }

  // 语音作答转写:音频 → ASR 文本。**modality-agnostic 不破**——转写文本即文本答案,后续仍走 /turn。
  // 边缘 I/O(ASR)直调 ai-runtime voice seam(在 invoke 关口之外,与 resume extractResumeText 同性质:api service 内同步请求-响应一次外呼)。
  // 隐私:只回转写文本,原始录音不落库(rules 隐私铁律——录音需单独同意才存)。
  /** TTS:把 AI 题/追问合成语音(qwen-tts),供"全程电话"模式播报。未配置/失败 → 降级(前端回落文字读题)。 */
  async speak(principal: string, id: string, dto: { text: string }) {
    this.voiceGate(principal);
    const owned = await this.db.asPrincipal(principal, (c) => c.query('SELECT 1 FROM interview WHERE id=$1', [id]));
    if (owned.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    const text = (dto.text ?? '').trim();
    if (!text) throw new HttpException({ error: 'empty_text' }, HttpStatus.BAD_REQUEST);
    try {
      const audio = await dashscopeTts().synthesize(text.slice(0, 2000));   // 截断防超长 TTS
      return { audioBase64: Buffer.from(audio).toString('base64'), mimeType: 'audio/wav' };
    } catch (e: any) {
      if (String(e?.message) === 'tts_not_configured')
        throw new HttpException({ error: 'tts_unavailable', message: '语音播报暂未开通，将以文字显示题目' }, HttpStatus.SERVICE_UNAVAILABLE);
      throw new HttpException({ error: 'tts_failed', message: '语音播报失败，将以文字显示题目' }, HttpStatus.BAD_GATEWAY);
    }
  }

  /** 流式 TTS 前置:归属校验(404)+ 文本校验(400)+ 配置校验(503)。**真正的 chunk 写入是 Fastify raw 流胶水,留在 controller**(对齐 SSE 边界 F5)。
   *  把"首音延迟"从整段合成下载(qwen-tts ~9s)降到首块到达(cosyvoice WS ~1-2s);未配置/中断 → 前端回落非流式 /speak 再回落文字读题(无死胡同)。 */
  async speakStreamPrepare(principal: string, id: string, dto: { text: string }) {
    this.voiceGate(principal);
    const owned = await this.db.asPrincipal(principal, (c) => c.query('SELECT 1 FROM interview WHERE id=$1', [id]));
    if (owned.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    const text = (dto.text ?? '').trim();
    if (!text) throw new HttpException({ error: 'empty_text' }, HttpStatus.BAD_REQUEST);
    // 配置缺失 → 在 hijack/写头之前就抛 503,前端凭状态码干净回落(若进流后才发现没配置,头已发=无法再换状态码)。
    if (!process.env.MODEL_API_KEY)
      throw new HttpException({ error: 'tts_unavailable', message: '语音播报暂未开通，将以文字显示题目' }, HttpStatus.SERVICE_UNAVAILABLE);
    return { text: text.slice(0, 2000) };   // 截断防超长 TTS(对齐非流式 speak)
  }

  /** 流式 TTS 音频块迭代器(MP3,signal 可中断:挂断/切走/barge-in 即停吐)。边缘 I/O,在 invoke 关口之外。 */
  speakStreamChunks(text: string, signal: AbortSignal): AsyncIterable<Uint8Array> {
    return dashscopeStreamingTts().synthesizeStream(text, signal);
  }

  async transcribe(principal: string, id: string, dto: TranscribeDto) {
    this.voiceGate(principal);
    // 鉴权 + RLS:确认是自己的面试(越权/不存在 → 404)。先校验归属,再花 ASR。
    const owned = await this.db.asPrincipal(principal, (c) => c.query('SELECT 1 FROM interview WHERE id=$1', [id]));
    if (owned.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    const audio = Buffer.from(dto.audioBase64, 'base64');
    if (audio.length === 0) throw new HttpException({ error: 'empty_audio' }, HttpStatus.BAD_REQUEST);
    if (audio.length > MAX_AUDIO_BYTES) throw new HttpException({ error: 'audio_too_large' }, HttpStatus.PAYLOAD_TOO_LARGE);
    const format = dto.format?.trim() || formatFromMime(dto.mimeType);
    try {
      const text = await dashscopeAsr().transcribe(new Uint8Array(audio), { format } as { format: string });
      return { text };
    } catch (e: any) {
      // 优雅降级:模型未配置 / 转写失败 → 明确错误,前端回落到文字作答(不抛 500,不死胡同)。
      if (String(e?.message) === 'asr_not_configured')
        throw new HttpException({ error: 'asr_unavailable', message: '语音转写暂未开通，请改用文字作答' }, HttpStatus.SERVICE_UNAVAILABLE);
      throw new HttpException({ error: 'asr_failed', message: '语音转写失败，请重试或改用文字作答' }, HttpStatus.BAD_GATEWAY);
    }
  }

  // 题目反馈(赞/踩):收集人对 AI 生成题的质量信号,喂 eval/改进闭环。一题一反馈,可改(UPSERT)。
  async questionFeedback(principal: string, id: string, idx: string, b: { rating?: string; comment?: string }) {
    if (b?.rating !== 'up' && b?.rating !== 'down') throw new HttpException({ error: 'invalid_rating' }, HttpStatus.BAD_REQUEST);
    const qi = Number(idx);
    if (!Number.isInteger(qi) || qi < 0) throw new HttpException({ error: 'invalid_index' }, HttpStatus.BAD_REQUEST);
    await this.db.asPrincipal(principal, (c) =>
      c.query(`INSERT INTO question_feedback(owner_user_id, interview_id, question_index, rating, comment) VALUES ($1,$2,$3,$4,$5)
               ON CONFLICT (owner_user_id, interview_id, question_index) DO UPDATE SET rating=EXCLUDED.rating, comment=EXCLUDED.comment`,
        [principal, id, qi, b.rating, b.comment ?? null]));
    return { recorded: true };
  }

  // 放弃面试:**退还预留额度**(不漏扣)+ status abandoned。对接 commerce saga release 路径。
  abandon(principal: string, id: string) {
    return this.db.asPrincipal(principal, async (c) => {
      if ((await c.query('SELECT 1 FROM interview WHERE id=$1', [id])).rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      const rel = await releaseConsumption(c, principal, id);   // 退还 begin 时预留的额度(idempotencyKey=id)
      await c.query("UPDATE interview SET status='abandoned', version=version+1 WHERE id=$1 AND owner_user_id=$2", [id, principal]);
      return { abandoned: true, released: rel.status };
    });
  }

  // 新建面试(空壳,created)。begin 才扣额度跑图。
  // **幂等**:同一用户同一时刻只保留一个进行中会话——连点/重复提交不再各插一条(用户实测点 3 次出 3 条 = 这里没幂等)。
  // 未结束(非 completed/abandoned/failed)就复用既有;复用后再 begin 由 begin 的 alreadyBegun 幂等兜住(不重复扣费)。
  async create(principal: string) {
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
    const r = await this.db.asPrincipal(principal, (c) =>
      status
        ? c.query('SELECT id, status, current_question_index FROM interview WHERE status=$1 ORDER BY id LIMIT $2', [status, lim])
        : c.query('SELECT id, status, current_question_index FROM interview ORDER BY id LIMIT $1', [lim]));
    return { interviews: r.rows };
  }

  async get(principal: string, id: string) {
    const r = await this.db.asPrincipal(principal, (c) =>
      c.query('SELECT id, status, current_question_index FROM interview WHERE id=$1', [id]));
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND); // RLS：越权→0行→404
    return r.rows[0];
  }

  // 查看面试报告:ready 返内容;queued/processing 返状态(前端按 report_ready 事件刷新);report_unavailable 已由舱壁标 failed。
  async report(principal: string, id: string) {
    const r = await this.db.asPrincipal(principal, (c) => getReport(c, principal, id));
    if (!r) {
      // **E5 修:无报告行 → 区分"面试进行中(还没生成)"与"面试已中断(失败终态)"**。
      //  后者(worker 发过 interview_unavailable、从未 enqueueReport)绝不能被报告页显示成"继续答题"(误导:让用户去答一场已死的面试)。
      const failed = await this.db.asPrincipal(principal, (c) =>
        c.query("SELECT 1 FROM interview_event WHERE stream_key=$1 AND kind='interview_unavailable' LIMIT 1", [id]));
      if ((failed.rowCount ?? 0) > 0) return { status: 'interview_failed' as const, content: null };   // 200:页面显示"面试已中断"
      throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);   // 真·进行中
    }
    return { status: r.status, content: r.status === 'ready' ? r.content : null };
  }

  // 报告重试:失败/隔离的报告重新入队生成(舱壁降级后的用户侧恢复——报告挂了不连累面试,且可重试)。
  async retryReport(principal: string, id: string) {
    const ok = await this.db.asPrincipal(principal, async (c) => {
      const rep = await c.query("SELECT id FROM ai_report WHERE interview_id=$1 AND status IN ('failed','quarantined')", [id]);
      if (rep.rowCount === 0) return false;
      return requeueFailedReport(c, principal, rep.rows[0].id);
    });
    if (!ok) throw new HttpException({ error: 'no_retriable_report' }, HttpStatus.NOT_FOUND);
    return { requeued: true };
  }

  // 报告导出 markdown(用户下载/分享)。返回 { ready, md } 供 controller 写响应(SSE/原始响应胶水留在 controller)。
  async exportReport(principal: string, id: string): Promise<{ ready: false } | { ready: true; md: string }> {
    const r = await this.db.asPrincipal(principal, (c) => getReport(c, principal, id));
    if (!r || r.status !== 'ready') return { ready: false };
    const c = r.content as { overall?: number; sections?: { title: string; body: string }[] };
    const md = `# 面试报告\n\n**综合评分：${c.overall ?? '—'}**\n\n` + (c.sections ?? []).map((s) => `## ${s.title}\n\n${s.body}`).join('\n\n');
    return { ready: true, md };
  }

  // 面试转写:题目 + 各题得分(从图落库题目 + answer_evaluated 事件组装)。
  transcript(principal: string, id: string) {
    return this.db.asPrincipal(principal, async (c) => {
      const iv = await c.query('SELECT questions FROM interview WHERE id=$1', [id]);
      if (iv.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      const ev = await c.query("SELECT payload FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' ORDER BY seq", [id]);
      // **E2 修:纯从 answer_evaluated 构建**——每条自带 question/score/outcome/competency,天然对齐(不再靠 question_ready 序号 vs turn 两套计数 join,clarify 轮会错位)。
      //  自适应主线:题面在 answer_evaluated.question(worker 落库)。遗留固定题单:回退 questions[turn] 列。
      const legacy: string[] = iv.rows[0].questions ?? [];
      return { turns: ev.rows.map((r: any, i: number) => {
        const p = r.payload ?? {};
        const t = Number.isInteger(Number(p.turn)) ? Number(p.turn) : i;
        return { index: t, question: p.question || legacy[t] || '', competency: p.competency, score: p.score ?? null, outcome: p.outcome ?? undefined };
      }) };
    });
  }

  // 生成能力评估:面试各题得分 → 维度+差距,落库(ready),返回。
  generateAssessment(principal: string, id: string) {
    return this.db.asPrincipal(principal, async (c) => {
      const iv = await c.query('SELECT questions FROM interview WHERE id=$1', [id]);
      if (iv.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      const questions: string[] = iv.rows[0].questions ?? [];   // 仅遗留固定题单路径有;自适应主线为空,题面回退取自该列(自适应不需要,按 competency 聚合)
      // 维度来源 = **answer_evaluated 事件**(自适应主线唯一权威落库源,自带 competency + outcome),与 worker 报告侧同口径:
      //   ① **剔除 unresolved**(跳过/探尽未决,不当 0 分计入,career advice 不失真——项目红线);
      //   ② 能力优先取事件内 competency(自适应,clarify 下也不错位);缺失则回退 question_ready 序(遗留路径无 clarify,对齐安全)。
      const ev = await c.query("SELECT payload FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' ORDER BY seq", [id]);
      const qr = await c.query("SELECT payload FROM interview_event WHERE stream_key=$1 AND kind='question_ready' ORDER BY seq", [id]);
      const qrComps: (string | undefined)[] = qr.rows.map((r: any) => r.payload?.competency);
      const turns = ev.rows
        .map((r: any) => r.payload)
        .filter((p: any) => (p?.outcome ?? 'answered') !== 'unresolved')
        // **E4 修:剔除分数非有限的异常事件(不再 `Number()||0` 注入幻零拉低 overall/造假 gap)**
        .filter((p: any) => Number.isFinite(Number(p?.score)))
        .map((p: any) => {
          const t = Number(p?.turn);
          return { question: (Number.isInteger(t) ? questions[t] : undefined) ?? '', competency: p?.competency ?? (Number.isInteger(t) ? qrComps[t] : undefined), score: Number(p?.score) };
        });
      // **E4 修:无任何有效已评估轮(全跳过/空壳)→ 抛 409,绝不落 overall=0 的 ready 报告**(否则 career 据 0 分误判最低定位、成长曲线注入假 0 点)。
      if (turns.length === 0) throw new HttpException({ error: 'no_evaluated_turns' }, HttpStatus.CONFLICT);
      const a = deriveAssessment(turns);
      await c.query(
        `INSERT INTO assessment_report(id, owner_user_id, interview_id, status, dimensions, overall)
           VALUES ($1,$2,$3,'ready',$4,$5)
           ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET status='ready', dimensions=EXCLUDED.dimensions, overall=EXCLUDED.overall, version=assessment_report.version+1`,
        [randomUUID(), principal, id, JSON.stringify(a.dimensions), a.overall]);
      return a;
    });
  }

  async getAssessment(principal: string, id: string) {
    const r = await this.db.asPrincipal(principal, (c) =>
      c.query('SELECT status, dimensions, overall FROM assessment_report WHERE interview_id=$1', [id]));
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return r.rows[0];
  }

  // 学习计划:据评估差距维度生成学习项,落库。需先有评估。
  generateLearningPlan(principal: string, id: string) {
    return this.db.asPrincipal(principal, async (c) => {
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
    if (!b?.topic) throw new HttpException({ error: 'missing_topic' }, HttpStatus.BAD_REQUEST);
    await this.db.asPrincipal(principal, (c) =>
      c.query('INSERT INTO learning_progress(owner_user_id, interview_id, topic) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [principal, id, b.topic]));
    return { done: true };
  }

  // 职业路径:据评估综合分+弱项生成,落库。成长链终点。
  generateCareerPath(principal: string, id: string) {
    return this.db.asPrincipal(principal, async (c) => {
      const a = await c.query('SELECT overall, dimensions FROM assessment_report WHERE interview_id=$1', [id]);
      if (a.rowCount === 0) throw new HttpException({ error: 'assessment_required' }, HttpStatus.CONFLICT);
      const weaknesses = (a.rows[0].dimensions ?? []).filter((d: any) => d.gap).map((d: any) => d.dimension);
      const cp = deriveCareerPath(a.rows[0].overall ?? 0, weaknesses);
      await c.query(
        `INSERT INTO career_path(id, owner_user_id, interview_id, readiness, level, milestones)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET readiness=EXCLUDED.readiness, level=EXCLUDED.level, milestones=EXCLUDED.milestones, version=career_path.version+1`,
        [randomUUID(), principal, id, cp.readiness, cp.level, JSON.stringify(cp.milestones)]);
      return cp;
    });
  }

  async getCareerPath(principal: string, id: string) {
    const r = await this.db.asPrincipal(principal, (c) =>
      c.query('SELECT readiness, level, milestones FROM career_path WHERE interview_id=$1', [id]));
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return r.rows[0];
  }

  async answer(principal: string, id: string, key: string) {
    if (!key) throw new HttpException({ error: 'missing_idempotency_key' }, HttpStatus.BAD_REQUEST);
    const out = await this.db.asPrincipal(principal, async (c) => {
      const own = await c.query('SELECT 1 FROM interview WHERE id=$1', [id]);
      if (own.rowCount === 0) return { code: 404, body: { error: 'not_found_or_forbidden' } };
      const ins = await c.query(
        'INSERT INTO consumption_record(owner_user_id, idempotency_key, interview_id) VALUES($1,$2,$3) ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING',
        [principal, key, id]);
      if (ins.rowCount === 0) return { code: 200, body: { result: 'duplicate_ignored' } }; // 幂等
      await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [id]);                   // seq 原子分配
      await c.query(
        `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload)
         SELECT $1,$2,COALESCE(MAX(seq),0)+1,'answer_evaluated',$3 FROM interview_event WHERE stream_key=$2`,
        [principal, id, JSON.stringify({ score: 68 })]);
      return { code: 200, body: { result: 'evaluated', score: 68 } };
    });
    if (out.code !== 200) throw new HttpException(out.body, out.code);
    return out.body;
  }

  // SSE 事件取数(replay):返回 null 表示越权/不存在(404),否则返回待写入的事件行。原始流写入胶水留在 controller。
  events(principal: string, id: string, lastEventId: string) {
    const lastId = Number(lastEventId ?? 0) || 0;
    return this.db.asPrincipal(principal, async (c) => {
      const own = await c.query('SELECT 1 FROM interview WHERE id=$1', [id]);
      if (own.rowCount === 0) return null;
      return (await c.query('SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND seq>$2 ORDER BY seq', [id, lastId])).rows;
    });
  }
}
