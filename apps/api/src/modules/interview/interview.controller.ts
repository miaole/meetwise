import { Controller, Get, Post, Param, Query, Req, Res, Headers, Body, UseGuards, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { TranscribeDto, SpeakDto, TurnDto, FeedbackDto, LearningCompleteDto, InterviewAnswerPreviewSubmitDto } from '@meetwise/contracts';
import { InterviewService } from './interview.service';
import { PrincipalGuard } from '../../platform/principal.guard';
import { PublicPreviewControlledWriteGuard } from '../../platform/preview-controlled-write.guard';
import { RateLimitService } from '../../platform/rate-limit.service';
import { ZodValidationPipe } from '../../platform/zod.pipe';

/**
 * 面试 HTTP 适配层(薄):解析/校验输入 → 调 InterviewService → 映射 HTTP。**不碰 SQL/事务/编排**(修审计 F1)。
 * 全经 principal/RLS,只见自己的面试。
 */
@Controller('interview')
@UseGuards(PrincipalGuard)
export class InterviewController {
  constructor(private readonly interviews: InterviewService, private readonly rl: RateLimitService) {}

  // 开始面试:扣额度 + 入队 start job(长编排在 worker 跑,api 薄)。202 已受理。
  @Post(':id/begin')
  @HttpCode(202)
  begin(@Param('id') id: string, @Req() req: any, @Headers('resume-id') resumeId: string) {
    return this.interviews.begin(req.principal, id, resumeId, req.reqId);   // reqId 透传进 job.payload,贯穿到 worker 模型 trace
  }

  // 提交一题答案:入队 answer job(worker 续图+评分),202。text 答案;音频先 ASR 转写再走此端点。
  // 契约 TurnDto 真校验:作答正文上限 8000 字(超限 → 400 拒在落库/入队前,纵深第一线);turn 序号 int≥0。
  @Post(':id/turn')
  @HttpCode(202)
  turn(@Param('id') id: string, @Req() req: any, @Body(new ZodValidationPipe(TurnDto)) body: TurnDto) {
    return this.interviews.turn(req.principal, id, body, req.reqId);   // reqId 透传进 answer job.payload,贯穿到 worker 模型 trace
  }

  // 预览版账本提交：只在 MEETWISE_PUBLIC_PREVIEW=1 落 0092 rehearsal 账本。
  // 不是 INT-TRANSCRIPT-01 生产 cutover，也不入队 plaintext /turn job。
  @Post(':id/answers')
  @UseGuards(PublicPreviewControlledWriteGuard)
  @HttpCode(HttpStatus.OK)
  submitPreviewAnswer(
    @Param('id') id: string,
    @Req() req: any,
    @Body(new ZodValidationPipe(InterviewAnswerPreviewSubmitDto)) body: InterviewAnswerPreviewSubmitDto,
  ) {
    return this.interviews.submitPreviewAnswer(req.principal, id, body);
  }

  // 语音作答转写:音频(base64)→ ASR 文本。前端塞回作答框,用户可改后再走 /turn(不破 modality-agnostic 内核)。
  // ASR 未配置/失败 → 503/502 明确错误,前端降级回文字作答(无死胡同)。契约 TranscribeDto 真校验。
  @Post(':id/transcribe')
  @HttpCode(HttpStatus.OK)
  async transcribe(
    @Param('id') id: string,
    @Req() req: any,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body(new ZodValidationPipe(TranscribeDto)) b: TranscribeDto,
  ) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    req.raw.once('aborted', abort);
    reply.raw.once('close', abort);
    try {
      return await this.interviews.transcribe(req.principal, id, b, { signal: controller.signal });
    } finally {
      req.raw.off('aborted', abort);
      reply.raw.off('close', abort);
    }
  }

  // TTS:题目语音播报(全程电话模式)。未配置/失败 → 503/502,前端降级文字读题。
  @Post(':id/speak')
  @HttpCode(HttpStatus.OK)
  async speak(
    @Param('id') id: string,
    @Req() req: any,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body(new ZodValidationPipe(SpeakDto)) b: SpeakDto,
  ) {
    // `req.raw.close` is normally emitted after Fastify has consumed the POST
    // body, before this handler starts.  The response socket is the only
    // reliable signal for a caller that disconnects while TTS is still being
    // generated.  Keep `aborted` for a request-body interruption.
    const controller = new AbortController();
    const abort = () => controller.abort();
    req.raw.once('aborted', abort);
    reply.raw.once('close', abort);
    try {
      return await this.interviews.speak(req.principal, id, b, { signal: controller.signal });
    } finally {
      req.raw.off('aborted', abort);
      reply.raw.off('close', abort);
    }
  }

  // 流式 TTS:边合成边吐 MP3 块(cosyvoice WS)。首音(p50/暖网)~1-2s,对比非流式整段下载 ~9s(每请求新建 WS,未池化,冷启或抖动可 2-4s)。
  // 非 JSON 二进制流,不入 apiContract(对齐 SSE events)。
  // 校验/配置失败 → prepare 在 hijack 前抛 404/400/503(经异常过滤正常返 JSON);进流后中断 → 收尾流,前端回落非流式 /speak。
  @Post(':id/speak/stream')
  async speakStream(@Param('id') id: string, @Req() req: any, @Res() reply: FastifyReply, @Body(new ZodValidationPipe(SpeakDto)) b: SpeakDto) {
    const { text } = await this.interviews.speakStreamPrepare(req.principal, id, b);   // 404/400/503 抛在 hijack 之前 → 异常过滤正常响应
    const ac = new AbortController();
    req.raw.on('close', () => ac.abort());                                             // 客户端断开/挂断 → 停吐 + 关上游 WS(barge-in 兼容)
    const it = this.interviews.speakStreamChunks(text, ac.signal)[Symbol.asyncIterator]();

    // **先拉第一块再发头**:首帧前失败(WS 握手/task-failed/空流)仍能返 502,前端凭状态码干净回落非流式
    // ——避免"空 200 + 客户端干等首块超时再回落"(审计 中#3)。成功路径延迟不变(首音本就要等首块)。
    let first: IteratorResult<Uint8Array>;
    try { first = await it.next(); }
    catch { throw new HttpException({ error: 'tts_failed', message: '语音播报失败，将以文字显示题目' }, HttpStatus.BAD_GATEWAY); }
    if (ac.signal.aborted) { try { await it.return?.(); } catch { /* noop */ } return; }   // 客户端已走:收尾上游,不发头
    if (first.done) throw new HttpException({ error: 'tts_failed', message: '语音播报失败，将以文字显示题目' }, HttpStatus.BAD_GATEWAY);

    reply.hijack();
    reply.raw.writeHead(200, { 'content-type': 'audio/mpeg', 'cache-control': 'no-cache', 'x-accel-buffering': 'no', 'transfer-encoding': 'chunked' });
    // 背压写:等 drain,但同时盯 close/error/abort——否则慢客户端断线会让 drain 永不触发而永久挂起(审计 高#5)。
    const writeChunk = (chunk: Uint8Array): Promise<boolean> => {
      if (reply.raw.write(Buffer.from(chunk))) return Promise.resolve(true);
      return new Promise<boolean>((resolve) => {
        const off = () => { reply.raw.off('drain', okFn); reply.raw.off('close', failFn); reply.raw.off('error', failFn); ac.signal.removeEventListener('abort', failFn); };
        const okFn = () => { off(); resolve(true); };
        const failFn = () => { off(); resolve(false); };
        reply.raw.once('drain', okFn); reply.raw.once('close', failFn); reply.raw.once('error', failFn);
        ac.signal.addEventListener('abort', failFn, { once: true });
      });
    };
    try {
      let chunk: Uint8Array | undefined = first.value;
      for (;;) {
        if (ac.signal.aborted || reply.raw.destroyed) break;
        if (!(await writeChunk(chunk!))) break;                          // 客户端断/abort → 停
        const next = await it.next();
        if (next.done) break;
        chunk = next.value;
      }
    } catch { /* 流中断:首块已发,前端就地收尾(已起播则不重播) */ }
    finally { try { await it.return?.(); } catch { /* noop */ } }        // 提前 break/throw 都触发生成器 finally → 关上游 WS
    try { reply.raw.end(); } catch { /* 已断开 */ }
  }

  // 题目反馈(赞/踩):收集人对 AI 生成题的质量信号,喂 eval/改进闭环。一题一反馈,可改(UPSERT)。
  @Post(':id/questions/:idx/feedback')
  @HttpCode(HttpStatus.OK)
  questionFeedback(@Param('id') id: string, @Param('idx') idx: string, @Req() req: any, @Body(new ZodValidationPipe(FeedbackDto)) b: FeedbackDto) {
    return this.interviews.questionFeedback(req.principal, id, idx, b);
  }

  // 放弃面试:**退还预留额度**(不漏扣)+ status abandoned。对接 commerce saga release 路径。
  @Post(':id/abandon')
  @HttpCode(HttpStatus.OK)
  abandon(@Param('id') id: string, @Req() req: any) {
    return this.interviews.abandon(req.principal, id);
  }

  // 新建面试(空壳,created)。begin 才扣额度跑图。
  @Post()
  @HttpCode(HttpStatus.OK)
  create(@Req() req: any) {
    return this.interviews.create(req.principal);
  }

  // 列出自己的面试(RLS 只见己),可按 status 过滤 + limit 分页。
  @Get()
  list(@Req() req: any, @Query('status') status?: string, @Query('limit') limit?: string) {
    return this.interviews.list(req.principal, status, limit);
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.interviews.get(req.principal, id);
  }

  // 查看面试报告:ready 返内容;queued/processing 返状态(前端按 report_ready 事件刷新);report_unavailable 已由舱壁标 failed。
  @Get(':id/report')
  report(@Param('id') id: string, @Req() req: any) {
    return this.interviews.report(req.principal, id);
  }

  // 报告重试:失败/隔离的报告重新入队生成(舱壁降级后的用户侧恢复——报告挂了不连累面试,且可重试)。
  @Post(':id/report/retry')
  @HttpCode(HttpStatus.OK)
  retryReport(@Param('id') id: string, @Req() req: any) {
    return this.interviews.retryReport(req.principal, id);
  }

  // 报告导出 markdown(用户下载/分享)。原始响应写入胶水留在 controller。
  @Get(':id/report/export')
  async exportReport(@Param('id') id: string, @Req() req: any, @Res() reply: FastifyReply) {
    const r = await this.interviews.exportReport(req.principal, id);
    if (!r.ready) { reply.code(404).send({ error: 'report_not_ready' }); return; }
    reply.header('content-type', 'text/markdown; charset=utf-8').send(r.md);
  }

  @Get(':id/transcript')
  transcript(@Param('id') id: string, @Req() req: any) {
    return this.interviews.transcript(req.principal, id);
  }

  // 生成能力评估:面试各题得分 → 维度+差距,落库(ready),返回。
  @Post(':id/assessment')
  @HttpCode(HttpStatus.OK)
  generateAssessment(@Param('id') id: string, @Req() req: any) {
    return this.interviews.generateAssessment(req.principal, id);
  }

  @Get(':id/assessment')
  getAssessment(@Param('id') id: string, @Req() req: any) {
    return this.interviews.getAssessment(req.principal, id);
  }

  // 学习计划:据评估差距维度生成学习项,落库。需先有评估。
  @Post(':id/learning-plan')
  @HttpCode(HttpStatus.OK)
  generateLearningPlan(@Param('id') id: string, @Req() req: any) {
    return this.interviews.generateLearningPlan(req.principal, id);
  }

  @Get(':id/learning-plan')
  getLearningPlan(@Param('id') id: string, @Req() req: any) {
    return this.interviews.getLearningPlan(req.principal, id);
  }

  // 标记某学习项完成(留存:打卡学过的)。topic 为键;幂等。
  @Post(':id/learning-plan/complete')
  @HttpCode(HttpStatus.OK)
  completeLearningItem(@Param('id') id: string, @Req() req: any, @Body(new ZodValidationPipe(LearningCompleteDto)) b: LearningCompleteDto) {
    return this.interviews.completeLearningItem(req.principal, id, b);
  }

  // 职业路径:据评估综合分+弱项生成,落库。成长链终点。
  @Post(':id/career-path')
  @HttpCode(HttpStatus.OK)
  generateCareerPath(@Param('id') id: string, @Req() req: any) {
    return this.interviews.generateCareerPath(req.principal, id);
  }

  @Get(':id/career-path')
  getCareerPath(@Param('id') id: string, @Req() req: any) {
    return this.interviews.getCareerPath(req.principal, id);
  }

  @Post(':id/answer')
  @HttpCode(HttpStatus.GONE)
  answer(@Param('id') id: string, @Req() req: any, @Headers('idempotency-key') key: string) {
    return this.interviews.answer(req.principal, id, key);
  }

  // SSE:取数在 service,原始流写入(hijack/reply.raw)是 Fastify 紧耦合胶水,留在 controller。
  // 修审计 F5:不再"重放即关",改 catch-up → **hold 连接轮询 tail 新事件**到终态/断开/封顶,带心跳保活(无死胡同)。
  @Get(':id/events')
  async events(@Param('id') id: string, @Req() req: any, @Res() reply: FastifyReply, @Headers('last-event-id') lastEventId: string) {
    const initial = await this.interviews.events(req.principal, id, lastEventId);
    if (initial === null) { reply.code(404).send({ error: 'not_found_or_forbidden' }); return; }
    // per-principal SSE 并发上限(安全审计 F5):每条 SSE 长期占一 DB 池周期查询;不封顶 → 开几十条即打满连接池饿死鉴权。
    const slotKey = `sse:${req.principal}`;
    if (!this.rl.acquireSlot(slotKey, 5)) { reply.code(429).send({ error: 'too_many_streams', message: 'SSE 连接过多,请关闭其它页面后重试' }); return; }
    try {
    reply.hijack();                                   // Fastify:接管底层响应做 SSE
    reply.raw.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive', 'x-accel-buffering': 'no' });
    let closed = false;
    req.raw.on('close', () => { closed = true; });    // 客户端断开
    const safeWrite = (s: string) => { try { reply.raw.write(s); return true; } catch { closed = true; return false; } };
    // session_concluded 是练习控制流预览，故意不在终态集合，前端须继续等 report_* / assessment_*。
    const isTerminal = (k: string) => k === 'report_ready' || k === 'report_unavailable' || k === 'assessment_unavailable' || k === 'interview_unavailable' || k === 'error';
    let lastSeq = initial.lastId;
    let done = false;
    const emit = (list: Array<{ seq: number; kind: string; payload: unknown }>) => {
      for (const e of list) {
        if (!safeWrite(`id: ${e.seq}\nevent: ${e.kind}\ndata: ${JSON.stringify(e.payload)}\n\n`)) return;
        lastSeq = Math.max(lastSeq, e.seq);
        if (isTerminal(e.kind)) done = true;
      }
    };
    emit(initial.rows);                                // 1. 重放 catch-up
    const deadline = Date.now() + 10 * 60_000;         // 封顶 10min(防僵尸连接;客户端凭 Last-Event-ID 重连续推)
    while (!done && !closed && Date.now() < deadline) {  // 2. hold + 轮询 tail
      await new Promise((r) => setTimeout(r, 2000));
      if (closed) break;
      const more = await this.interviews.events(req.principal, id, String(lastSeq)).catch(() => null);
      if (more === null) break;                         // 取数失败 → 收尾(客户端会重连)
      if (more.rows.length) emit(more.rows);
      else if (!safeWrite(': ping\n\n')) break;         // 心跳保活 + 写失败即知断开
    }
    if (!closed) { try { reply.raw.end(); } catch { /* 已断开 */ } }
    } finally { this.rl.releaseSlot(slotKey); }        // 释放并发槽(所有退出路径:断开/终态/超时)
  }
}
