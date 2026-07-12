import { Controller, Post, Get, Delete, Body, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { PrincipalGuard } from '../../platform/principal.guard';
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

  @Get('export')
  export(@Req() req: any) {
    return this.privacy.export(req.principal);
  }

  @Delete('resume-data')
  @HttpCode(HttpStatus.OK)
  deleteResumeData(@Req() req: any) {
    return this.privacy.deleteResumeData(req.principal);
  }
}
