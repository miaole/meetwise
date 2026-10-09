import { Controller, Post, Get, Delete, Body, Query, Req, UseGuards, HttpStatus, HttpCode, Headers, Param } from '@nestjs/common';
import { PrivacyPreviewBeginDto } from '@meetwise/contracts';
import { PrincipalGuard } from '../../platform/principal.guard';
import { ZodValidationPipe } from '../../platform/zod.pipe';
import { PrivacyService } from './privacy.service';

/**
 * PIPL 合规 HTTP 适配层(薄):采集同意 / 数据可携 / 删除权 → 调 PrivacyService。不碰 SQL(修审计 F1)。
 */
@Controller('privacy')
@UseGuards(PrincipalGuard)
export class PrivacyController {
  constructor(private readonly privacy: PrivacyService) {}

  @Post('consent')
  @HttpCode(HttpStatus.OK)
  consent(@Req() req: any, @Body() b: { purpose?: string }) {
    return this.privacy.consent(req.principal, b?.purpose ?? 'resume_processing');
  }

  @Get('consent')
  consentStatus(@Req() req: any, @Query('purpose') purpose?: string) {
    // G3(RESUME-GROUNDING rev3):purpose 可选(缺省 resume_processing 兼容既有前端);
    // 上传页据此读 interview_personalization 同意态渲染一次性用途选择。
    return this.privacy.consentStatus(req.principal, purpose ?? 'resume_processing');
  }

  /** G4(RESUME-GROUNDING rev3):撤回=停止后续使用(行删除;缺省 purpose 兼容既有采集同意撤回面)。 */
  @Delete('consent')
  @HttpCode(HttpStatus.OK)
  withdrawConsent(@Req() req: any, @Query('purpose') purpose?: string) {
    return this.privacy.withdrawConsent(req.principal, purpose ?? 'resume_processing');
  }

  @Get('export')
  export(@Req() req: any) {
    return this.privacy.export(req.principal);
  }

  @Post('erasure-preview')
  @HttpCode(HttpStatus.ACCEPTED)
  beginPreview(
    @Req() req: any,
    @Body(new ZodValidationPipe(PrivacyPreviewBeginDto)) body: PrivacyPreviewBeginDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.privacy.beginPreview(req.principal, body, idempotencyKey);
  }

  @Get('erasure-preview')
  listPreview(@Req() req: any) {
    return this.privacy.listPreview(req.principal);
  }

  @Get('erasure-preview/:requestId')
  getPreview(@Param('requestId') requestId: string, @Req() req: any) {
    return this.privacy.getPreview(req.principal, requestId);
  }

  @Delete('interview-data/:id')
  @HttpCode(HttpStatus.SERVICE_UNAVAILABLE)
  eraseInterviewData(@Param('id') id: string, @Req() req: any, @Headers('idempotency-key') idempotencyKey?: string) {
    return this.privacy.eraseInterviewData(req.principal, id, idempotencyKey);
  }

  @Delete('resume-data')
  @HttpCode(HttpStatus.ACCEPTED)   // S1 软删受理（UNSTUB-ERASE rev2）：202+mode:logical+purgePending,非完成态
  deleteResumeData(@Req() req: any) {
    return this.privacy.deleteResumeData(req.principal);
  }
}
