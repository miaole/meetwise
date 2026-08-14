import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { listNotifications, markNotificationRead, markAllNotificationsRead, unreadCount } from '@meetwise/db';
import { DbService } from '../../platform/db.service';

/**
 * 站内通知应用服务(拥有 asPrincipal 事务边界 + 业务编排)。controller 只解析/映射 HTTP,不碰 SQL(修审计 F1)。
 * 系统内部产生(报告就绪等),用户读。全经 RLS,只见自己的通知。
 */
@Injectable()
export class NotificationService {
  constructor(private readonly db: DbService) {}

  async list(principal: string) {
    const items = await this.db.asPrincipal(principal, (c) => listNotifications(c, principal));
    return { notifications: items };
  }

  async unread(principal: string) {
    const n = await this.db.asPrincipal(principal, (c) => unreadCount(c, principal));
    return { unread: n };
  }

  async readAll(principal: string) {
    const n = await this.db.asPrincipal(principal, (c) => markAllNotificationsRead(c, principal));
    return { markedRead: n };
  }

  async read(principal: string, id: string) {
    const ok = await this.db.asPrincipal(principal, (c) => markNotificationRead(c, principal, id));
    if (!ok) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return { read: true };
  }
}
