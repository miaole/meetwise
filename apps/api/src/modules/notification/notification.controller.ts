import { Controller, Get, Post, Param, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { PrincipalGuard } from '../../platform/principal.guard';
import { NotificationService } from './notification.service';

/**
 * 站内通知 HTTP 适配层(薄):解析输入 → 调 NotificationService → 映射 HTTP。**不碰 SQL/事务**(修审计 F1)。
 * 全经 principal/RLS,只见自己的通知。
 */
@Controller('notifications')
@UseGuards(PrincipalGuard)
export class NotificationController {
  constructor(private readonly notifications: NotificationService) {}

  @Get()
  list(@Req() req: any) {
    return this.notifications.list(req.principal);
  }

  @Get('unread-count')
  unread(@Req() req: any) {
    return this.notifications.unread(req.principal);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  readAll(@Req() req: any) {
    return this.notifications.readAll(req.principal);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  read(@Param('id') id: string, @Req() req: any) {
    return this.notifications.read(req.principal, id);
  }
}
