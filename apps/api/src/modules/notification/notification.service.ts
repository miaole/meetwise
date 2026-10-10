import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { listNotifications, markNotificationRead, markAllNotificationsRead, unreadCount, requireOwnerUserId } from '@meetwise/db';
import { DbService } from '../../platform/db.service';

/**
 * 站内通知应用服务(拥有 asPrincipal 事务边界 + 业务编排)。controller 只解析/映射 HTTP,不碰 SQL(修审计 F1)。
 * 系统内部产生(报告就绪等),用户读。全经 RLS,只见自己的通知。
 * PRIV01-C 应用层 tenant 强制第二层(E1 入口显式 owner · 失败即 tenant_owner_user_id_required throw):
 * RLS 仍是授权根,此处为纵深防御——helper 见 @meetwise/db 导出的 tenant 模块(应用层 tenant ≠ RLS)。
 */
@Injectable()
export class NotificationService {
  constructor(private readonly db: DbService) {}

  async list(principal: string) {
    const owner = requireOwnerUserId(principal, 'notification.list');
    const items = await this.db.asPrincipal(owner, (c) => listNotifications(c, owner));
    return { notifications: items };
  }

  async unread(principal: string) {
    const owner = requireOwnerUserId(principal, 'notification.unread');
    const n = await this.db.asPrincipal(owner, (c) => unreadCount(c, owner));
    return { unread: n };
  }

  async readAll(principal: string) {
    const owner = requireOwnerUserId(principal, 'notification.readAll');
    const n = await this.db.asPrincipal(owner, (c) => markAllNotificationsRead(c, owner));
    return { markedRead: n };
  }

  async read(principal: string, id: string) {
    const owner = requireOwnerUserId(principal, 'notification.read');
    const ok = await this.db.asPrincipal(owner, (c) => markNotificationRead(c, owner, id));
    if (!ok) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return { read: true };
  }
}
