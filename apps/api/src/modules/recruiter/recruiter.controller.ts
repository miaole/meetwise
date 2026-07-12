import { Controller, Get, Post, Param, Body, Query, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateJobDto, InviteCandidateDto } from '@meetwise/contracts';
import type { TalentQuery } from '@meetwise/db';
import { PrincipalGuard } from '../../platform/principal.guard';
import { RecruiterGuard } from '../../platform/recruiter.guard';
import { ZodValidationPipe } from '../../platform/zod.pipe';
import { RecruiterService } from './recruiter.service';

/**
 * 招聘方(B 端)HTTP 适配层(薄):解析/校验 → 调 RecruiterService → 映射 HTTP。不碰 SQL(F1)。
 * 多租户:全经 principal/RLS,只见自己的岗位/候选人。邀请用契约 InviteCandidateDto 真校验(F2)。
 * RecruiterGuard:/recruiter/* 仅 role='recruiter' 可访问——候选人不能借此发岗位/枚举用户。
 */
@Controller('recruiter')
@UseGuards(PrincipalGuard, RecruiterGuard)
export class RecruiterController {
  constructor(private readonly recruiter: RecruiterService) {}

  @Post('jobs')
  @HttpCode(HttpStatus.OK)
  create(@Req() req: any, @Body(new ZodValidationPipe(CreateJobDto)) b: CreateJobDto) {
    return this.recruiter.create(req.principal, b);
  }

  @Get('jobs')
  list(@Req() req: any) {
    return this.recruiter.list(req.principal);
  }

  // 人才库:路径第二段是字面量 'talent',与 'jobs/:id' 前缀不同,无路由冲突(顺序无关)。
  @Get('talent')
  talent(@Req() req: any, @Query('status') status?: string, @Query('sort') sort?: string, @Query('order') order?: string) {
    const q: TalentQuery = {
      status: status || undefined,
      sort: sort === 'score' ? 'score' : 'created',
      order: order === 'asc' ? 'asc' : 'desc',
    };
    return this.recruiter.talent(req.principal, q);
  }

  @Get('jobs/:id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.recruiter.get(req.principal, id);
  }

  @Get('jobs/:id/candidates')
  candidates(@Param('id') id: string, @Req() req: any) {
    return this.recruiter.candidates(req.principal, id);
  }

  @Post('jobs/:id/invite')
  @HttpCode(HttpStatus.OK)
  invite(@Param('id') id: string, @Req() req: any, @Body(new ZodValidationPipe(InviteCandidateDto)) b: InviteCandidateDto) {
    return this.recruiter.invite(req.principal, id, b);
  }
}
