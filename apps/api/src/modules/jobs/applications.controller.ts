import { Controller, Get, Post, Param, Body, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { FinalizeApplicationDto } from '@meetwise/contracts';
import { PrincipalGuard } from '../../platform/principal.guard';
import { ZodValidationPipe } from '../../platform/zod.pipe';
import { ApplicationsService } from './applications.service';

/**
 * 候选人(C 端)申请 HTTP 适配层(薄)。与 /jobs 拆开避免路由前缀冲突(applications vs jobs/:id)。
 * finalize 用契约 FinalizeApplicationDto 真校验(score 0..100,interviewId 非空)。
 */
@Controller('applications')
@UseGuards(PrincipalGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Get()
  mine(@Req() req: any) {
    return this.applications.mine(req.principal);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  start(@Param('id') id: string, @Req() req: any) {
    return this.applications.start(req.principal, id);
  }

  @Post(':id/decline')
  @HttpCode(HttpStatus.OK)
  decline(@Param('id') id: string, @Req() req: any) {
    return this.applications.decline(req.principal, id);
  }

  @Post(':id/finalize')
  @HttpCode(HttpStatus.OK)
  finalize(@Param('id') id: string, @Req() req: any, @Body(new ZodValidationPipe(FinalizeApplicationDto)) b: FinalizeApplicationDto) {
    return this.applications.finalize(req.principal, id, b);
  }
}
