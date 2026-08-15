import { Controller, Get, Post, Param, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { PrincipalGuard } from '../../platform/principal.guard';
import { JobsService } from './jobs.service';

/**
 * 候选人(C 端)岗位 HTTP 适配层(薄):浏览开放岗位 + 投递。不碰 SQL(F1),全经 principal/RLS。
 * 路由与 @Controller('recruiter') 区分:这里是候选人视角的公开市场。
 */
@Controller('jobs')
@UseGuards(PrincipalGuard)
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Get()
  browse(@Req() req: any) {
    return this.jobs.browse(req.principal);
  }

  @Post(':id/apply')
  @HttpCode(HttpStatus.OK)
  apply(@Param('id') id: string, @Req() req: any) {
    return this.jobs.apply(req.principal, id);
  }
}
