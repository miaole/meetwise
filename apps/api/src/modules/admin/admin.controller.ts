import { Controller, Get, Post, Param, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { PrincipalGuard } from '../../platform/principal.guard';
import { AdminGuard } from '../../platform/admin.guard';
import { AdminService } from './admin.service';

/**
 * 运营 admin HTTP 适配层(薄):经 PrincipalGuard+AdminGuard 双校验 → 调 AdminService → 映射 HTTP。
 * **不碰 SQL**(修审计 F1)。跨用户特权只读由 service 走 pool(超级用户,非 RLS);普通用户到不了(403)。
 */
@Controller('admin')
@UseGuards(PrincipalGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  users() {
    return this.admin.users();
  }

  @Get('orders')
  orders() {
    return this.admin.orders();
  }

  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  @Post('users/:id/disable')
  @HttpCode(HttpStatus.OK)
  disable(@Param('id') id: string, @Req() req: any) {
    return this.admin.disable(id, req.principal);
  }

  @Get('audit')
  audit() {
    return this.admin.audit();
  }

  @Get('question-feedback')
  questionFeedback() {
    return this.admin.questionFeedback();
  }
}
