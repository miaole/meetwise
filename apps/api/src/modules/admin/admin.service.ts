import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { appendAudit, listAudit } from '@meetwise/db';
import { DbService } from '../../platform/db.service';

/**
 * 运营 admin 应用服务(跨用户特权只读 + 写操作审计)。controller 只解析/映射 HTTP,不碰 SQL(修审计 F1)。
 * **跨用户特权刻意走 this.db.pool**(超级用户,非 RLS 作用域)——已经 PrincipalGuard+AdminGuard 双校验,
 * 看全量用户/订单/统计/反馈;绝不切 asPrincipal(那会被 RLS 限回单用户)。
 */
@Injectable()
export class AdminService {
  constructor(private readonly db: DbService) {}

  async users() {
    const r = await this.db.pool.query('SELECT id, email, status, is_admin, created_at FROM user_account ORDER BY created_at DESC LIMIT 100');
    return { users: r.rows };   // 不含 password_hash
  }

  async orders() {
    const r = await this.db.pool.query('SELECT id, owner_user_id, product_id, amount_cents, status FROM payment_order ORDER BY created_at DESC LIMIT 100');
    return { orders: r.rows };
  }

  async stats() {
    const u = await this.db.pool.query('SELECT count(*)::int n FROM user_account');
    const o = await this.db.pool.query("SELECT count(*)::int n, coalesce(sum(amount_cents) FILTER (WHERE status='paid'),0)::int paid FROM payment_order");
    return { users: u.rows[0].n, orders: o.rows[0].n, paidCents: o.rows[0].paid };
  }

  // 写操作:停用用户 + **记审计**(不可改,问责)
  async disable(id: string, principal: string) {
    const r = await this.db.pool.query("UPDATE user_account SET status='disabled' WHERE id=$1", [id]);
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    await appendAudit(this.db.pool, randomUUID(), principal, 'disable_user', id);
    return { disabled: true };
  }

  async audit() {
    return { audit: await listAudit(this.db.pool) };
  }

  // AI 质量监控:聚合题目赞/踩(踩率高 = 出题质量差,触发 prompt/模型复盘)。跨用户特权聚合。
  async questionFeedback() {
    const r = await this.db.pool.query("SELECT rating, count(*)::int n FROM question_feedback GROUP BY rating");
    const by = Object.fromEntries(r.rows.map((x: any) => [x.rating, x.n]));
    const up = by.up ?? 0, down = by.down ?? 0, total = up + down;
    return { up, down, total, downRate: total ? Math.round((down / total) * 100) / 100 : null };
  }
}
