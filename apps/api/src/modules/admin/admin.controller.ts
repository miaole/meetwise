import { Controller, Get, Post, Param, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { PrincipalGuard } from '../../platform/principal.guard';
import { AdminGuard } from '../../platform/admin.guard';
import { AdminService } from './admin.service';

/**
 * 运营 admin HTTP 适配层(薄):经 PrincipalGuard+AdminGuard 双校验 → 调 AdminService → 映射 HTTP。
 * 跨用户能力仍由服务中的数据库函数再次复核 admin 身份。
 */
@Controller('admin')
@UseGuards(PrincipalGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  users(@Req() req: any) {
    return this.admin.users(req.principal);
  }

  @Get('orders')
  orders(@Req() req: any) {
    return this.admin.orders(req.principal);
  }

  @Get('stats')
  stats(@Req() req: any) {
    return this.admin.stats(req.principal);
  }

  @Post('users/:id/disable')
  @HttpCode(HttpStatus.OK)
  disable(@Param('id') id: string, @Req() req: any) {
    return this.admin.disable(id, req.principal);
  }

  @Get('audit')
  audit(@Req() req: any) {
    return this.admin.audit(req.principal);
  }

  @Get('question-feedback')
  questionFeedback(@Req() req: any) {
    return this.admin.questionFeedback(req.principal);
  }
}
