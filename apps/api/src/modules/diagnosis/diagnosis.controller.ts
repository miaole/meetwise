import { Controller, Get, Post, Param, Query, Req, Res, Headers, UseGuards, HttpCode } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { DiagnosisService } from './diagnosis.service';
import { PrincipalGuard } from '../../platform/principal.guard';

/**
 * 简历诊断(resume-diagnosis) HTTP 适配层(薄):解析/校验输入 → 调 DiagnosisService → 映射 HTTP。**不碰 SQL/事务/编排**。
 * 全经 principal/RLS,只见自己的诊断。镜像 QuizController 的 create→begin→SSE→GET 形态。
 */
@Controller('diagnosis')
@UseGuards(PrincipalGuard)
export class DiagnosisController {
  constructor(private readonly diagnoses: DiagnosisService) {}

  // 新建诊断(空壳,created)。begin 才扣额度跑图。
  @Post()
  @HttpCode(200)
  create(@Req() req: any) {
    return this.diagnoses.create(req.principal);
  }

  // 开始诊断:扣额度 + 入队 generate job(长编排在 worker 跑,api 薄)。202 已受理。target-role 头可选(岗位匹配度)。
  @Post(':id/begin')
  @HttpCode(202)
  begin(@Param('id') id: string, @Req() req: any, @Headers('resume-id') resumeId: string, @Headers('target-role') targetRole?: string) {
    return this.diagnoses.begin(req.principal, id, resumeId, targetRole);
  }

  // 放弃诊断:退还预留额度(不漏扣)+ status failed。
  @Post(':id/abandon')
  @HttpCode(200)
  abandon(@Param('id') id: string, @Req() req: any) {
    return this.diagnoses.abandon(req.principal, id);
  }

  @Get()
  list(@Req() req: any, @Query('status') status?: string, @Query('limit') limit?: string) {
    return this.diagnoses.list(req.principal, status, limit);
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.diagnoses.get(req.principal, id);
  }

  // SSE:取数在 service,原始流写入(hijack/reply.raw)是 Fastify 紧耦合胶水,留在 controller。
  // 与 quiz events 同形:catch-up 重放 → hold 连接轮询 tail 新事件到终态/断开/封顶,带心跳保活(无死胡同)。
  @Get(':id/events')
  async events(@Param('id') id: string, @Req() req: any, @Res() reply: FastifyReply, @Headers('last-event-id') lastEventId: string) {
    const rows = await this.diagnoses.events(req.principal, id, lastEventId);
    if (rows === null) { reply.code(404).send({ error: 'not_found_or_forbidden' }); return; }
    reply.hijack();                                   // Fastify:接管底层响应做 SSE
    reply.raw.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive', 'x-accel-buffering': 'no' });
    let closed = false;
    req.raw.on('close', () => { closed = true; });    // 客户端断开
    const safeWrite = (s: string) => { try { reply.raw.write(s); return true; } catch { closed = true; return false; } };
    const isTerminal = (k: string) => k === 'diagnosis_ready' || k === 'diagnosis_unavailable' || k === 'error';
    let lastSeq = Number(lastEventId) || 0;
    let done = false;
    const emit = (list: Array<{ seq: number; kind: string; payload: unknown }>) => {
      for (const e of list) {
        if (!safeWrite(`id: ${e.seq}\nevent: ${e.kind}\ndata: ${JSON.stringify(e.payload)}\n\n`)) return;
        lastSeq = Math.max(lastSeq, e.seq);
        if (isTerminal(e.kind)) done = true;
      }
    };
    emit(rows);                                        // 1. 重放 catch-up
    const deadline = Date.now() + 10 * 60_000;         // 封顶 10min(防僵尸连接;客户端凭 Last-Event-ID 重连续推)
    while (!done && !closed && Date.now() < deadline) {  // 2. hold + 轮询 tail
      await new Promise((r) => setTimeout(r, 2000));
      if (closed) break;
      const more = await this.diagnoses.events(req.principal, id, String(lastSeq)).catch(() => null);
      if (more === null) break;                         // 取数失败 → 收尾(客户端会重连)
      if (more.length) emit(more);
      else if (!safeWrite(': ping\n\n')) break;         // 心跳保活 + 写失败即知断开
    }
    if (!closed) { try { reply.raw.end(); } catch { /* 已断开 */ } }
  }
}
