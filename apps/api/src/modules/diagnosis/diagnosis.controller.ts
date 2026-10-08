import { Controller, Get, Post, Param, Query, Req, Res, Headers, UseGuards, HttpCode } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { DiagnosisService } from './diagnosis.service';
import { PrincipalGuard } from '../../platform/principal.guard';
import { RateLimitService } from '../../platform/rate-limit.service';
import { pumpSseEvents } from '../../platform/sse-pump';

/**
 * 简历诊断(resume-diagnosis) HTTP 适配层(薄):解析/校验输入 → 调 DiagnosisService → 映射 HTTP。**不碰 SQL/事务/编排**。
 * 全经 principal/RLS,只见自己的诊断。镜像 QuizController 的 create→begin→SSE→GET 形态。
 */
@Controller('diagnosis')
@UseGuards(PrincipalGuard)
export class DiagnosisController {
  constructor(private readonly diagnoses: DiagnosisService, private readonly rl: RateLimitService) {}

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

  // SSE:取数在 service,原始流写入(hijack/reply.raw)是 Fastify 紧耦合胶水,经 platform/sse-pump 单源化(B5 四件套去重)。
  // SSE-PUSH Opt1:通道健康(LISTEN 在位+0143 trigger 在场)=notify 精确推送+30s 兜底,无事件零 SQL;退化=legacy 2s 轮询 fail-open。
  // 与 quiz events 同形:catch-up 重放 → hold tail 到终态/断开/封顶,心跳保活,Last-Event-ID 续推语义零改。
  @Get(':id/events')
  async events(@Param('id') id: string, @Req() req: any, @Res() reply: FastifyReply, @Headers('last-event-id') lastEventId: string) {
    const initial = await this.diagnoses.events(req.principal, id, lastEventId);
    if (initial === null) { reply.code(404).send({ error: 'not_found_or_forbidden' }); return; }
    const slotKey = `sse:${req.principal}`;            // per-principal SSE 并发上限(安全审计 F5)
    if (!this.rl.acquireSlot(slotKey, 5)) { reply.code(429).send({ error: 'too_many_streams', message: 'SSE 连接过多,请关闭其它页面后重试' }); return; }
    try {
      const isTerminal = (k: string) => k === 'diagnosis_ready' || k === 'diagnosis_unavailable' || k === 'error';   // 终态集合原值参数化,零合并
      await pumpSseEvents({
        reply,
        reqRaw: req.raw,
        streamKey: id,
        initial,
        fetchMore: (lastSeq) => this.diagnoses.events(req.principal, id, String(lastSeq)),
        isTerminal,
      });
    } finally { this.rl.releaseSlot(slotKey); }
  }
}
