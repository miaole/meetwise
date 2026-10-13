import { Controller, Get, Post, Patch, Param, Body, Query, Req, Headers, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateJobDto, InviteCandidateDto, UpdateJobDto } from '@meetwise/contracts';
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
  create(@Req() req: any, @Body(new ZodValidationPipe(CreateJobDto)) b: CreateJobDto, @Headers('idempotency-key') idempotencyKey?: string) {
    return this.recruiter.create(req.principal, b, idempotencyKey);
  }

  @Get('jobs')
  list(@Req() req: any) {
    return this.recruiter.list(req.principal);
  }

  // 人才库:路径第二段是字面量 'talent',与 'jobs/:id' 前缀不同,无路由冲突(顺序无关)。
  @Get('talent')
  talent(@Req() req: any, @Query('status') status?: string, @Query('sort') _sort?: string, @Query('order') order?: string) {
    const q: TalentQuery = {
      status: status || undefined,
      order: order === 'asc' ? 'asc' : 'desc',
    };
    return this.recruiter.talent(req.principal, q);
  }

  @Get('jobs/:id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.recruiter.get(req.principal, id);
  }

  // I3 JOB-MGMT（裁决①·#220）：PATCH 编辑岗位——语义变更自动写新 revision（route_pending）+ wakeup，
  // 既有 sole worker drain 认领（链路自通零新管道）；owner 谓词内建（db assertPrincipal+行锁）。
  @Patch('jobs/:id')
  update(@Param('id') id: string, @Req() req: any, @Body(new ZodValidationPipe(UpdateJobDto)) b: UpdateJobDto) {
    return this.recruiter.update(req.principal, id, b);
  }

  // I3 JOB-MGMT（裁决①·#220）：POST 下线岗位——三臂语义（非自有→404·closed 再 close 同 404 壳·open→closed 200）。
  @Post('jobs/:id/close')
  @HttpCode(HttpStatus.OK)
  close(@Param('id') id: string, @Req() req: any) {
    return this.recruiter.close(req.principal, id);
  }

  // I3 JOB-MGMT（#219 可见面）：招聘方读岗位语义路由状态（枚举+reasonCodes 摘要·仅 owner·UI 文案含可断言状态字样）。
  @Get('jobs/:id/route')
  route(@Param('id') id: string, @Req() req: any) {
    return this.recruiter.route(req.principal, id);
  }

  // I3 JOB-MGMT（裁决③·#219）：显式重试路由——写新 revision + wakeup 走既有 drain；
  // sticky 枚举语义零改（Ban 无界自动重试·本动作=招聘方显式有界投递）。
  @Post('jobs/:id/route-retry')
  @HttpCode(HttpStatus.OK)
  retryRoute(@Param('id') id: string, @Req() req: any) {
    return this.recruiter.retryRoute(req.principal, id);
  }

  @Get('jobs/:id/candidates')
  candidates(@Param('id') id: string, @Req() req: any) {
    return this.recruiter.candidates(req.principal, id);
  }

  // I2 W2（裁定③落点 A）：B 端最小定性投影端点——属主招聘方门 + 0160 函数内同意门（E6）。
  // 仅出定性档位（无数字评分）；未同意 → disclosed=false 未披露态（非空壳假数据）。
  @Get('jobs/:id/applications/:applicationId/qualitative')
  qualitative(@Param('id') id: string, @Param('applicationId') applicationId: string, @Req() req: any) {
    return this.recruiter.qualitative(req.principal, id, applicationId);
  }

  @Post('jobs/:id/invite')
  @HttpCode(HttpStatus.OK)
  // b110:req.ip 传给 service 撑 invite:ip 桶(trustProxy 保持关闭=socket 地址,防 XFF 伪造,Ban §5.10)。
  invite(@Param('id') id: string, @Req() req: any, @Body(new ZodValidationPipe(InviteCandidateDto)) b: InviteCandidateDto) {
    return this.recruiter.invite(req.principal, id, b, req?.ip);
  }
}
