import { Controller, Post, Get, Delete, Param, Body, Req, Res, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { UploadResumeDto, UploadResumeFileDto } from '@meetwise/contracts';
import { PrincipalGuard } from '../../platform/principal.guard';
import { ZodValidationPipe } from '../../platform/zod.pipe';
import { ResumeService } from './resume.service';

/**
 * 简历 HTTP 适配层(薄):解析/校验输入 → 调 ResumeService → 映射 HTTP。**不碰 SQL/事务**(修审计 F1)。
 * 全经 principal/RLS,只见自己的简历。
 */
@Controller('resume')
@UseGuards(PrincipalGuard)
export class ResumeController {
  constructor(private readonly resumes: ResumeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  // 校验由共享契约 UploadResumeDto(text ≥20)在 pipe 完成——契约即真相,不手写 if(修审计 F2)。
  upload(@Req() req: any, @Body(new ZodValidationPipe(UploadResumeDto)) b: UploadResumeDto) {
    return this.resumes.upload(req.principal, b);
  }

  @Post('file')
  @HttpCode(HttpStatus.OK)
  // 文件上传(PDF/Word/图片):服务端提取+清洗→结构化。契约 UploadResumeFileDto 真校验。
  // r5:断开即取消(排队弃权+子进程 terminate)——interview transcribe/speak 同款 AbortSignal 缝形
  // (`req.raw 'aborted'`=请求体中断 + `reply.raw 'close'`=解析中途断连;finally 摘监听防正常完成误触)。
  async uploadFile(
    @Req() req: any,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body(new ZodValidationPipe(UploadResumeFileDto)) b: UploadResumeFileDto,
  ) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    req.raw.once('aborted', abort);
    reply.raw.once('close', abort);
    try {
      return await this.resumes.uploadFile(req.principal, b, { signal: controller.signal });
    } finally {
      req.raw.off('aborted', abort);
      reply.raw.off('close', abort);
    }
  }

  @Get()
  list(@Req() req: any) {
    return this.resumes.list(req.principal);
  }

  @Post(':id/reparse')
  @HttpCode(HttpStatus.OK)
  reparse(@Param('id') id: string, @Req() req: any) {
    return this.resumes.reparse(req.principal, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)   // S1 软删受理（UNSTUB-ERASE rev2）：202+mode:logical+purgePending,非完成态
  remove(@Param('id') id: string, @Req() req: any) {
    return this.resumes.remove(req.principal, id);
  }

  @Get(':id/profile')
  profile(@Param('id') id: string, @Req() req: any) {
    return this.resumes.profile(req.principal, id);
  }
}
