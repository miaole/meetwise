import { Controller, Post, Get, Delete, Body, Req, UseGuards, HttpStatus, HttpCode, Headers, Param } from '@nestjs/common';
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
  consentStatus(@Req() req: any) {
    return this.privacy.consentStatus(req.principal, 'resume_processing');
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
  @HttpCode(HttpStatus.OK)
  deleteResumeData(@Req() req: any) {
    return this.privacy.deleteResumeData(req.principal);
  }
}
