import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import type { OfflineRemitEntryDto, OfflineRemitFailDto, RecruiterDecisionDto } from '@meetwise/contracts';
import { DbService } from '../../platform/db.service';
import { evictPrincipalStatus } from '../../platform/principal.guard';

/**
 * B271 片1：对公转账 DB 具名拒绝 → HTTP 分码映射（AdminGuard 之外的第二层语义保真；
 * 函数内 require_active_admin 双层不变——直调受控函数的非 admin 仍 403）。
 */
function mapOfflineRemitError(e: unknown): never {
  const msg = typeof (e as any)?.message === 'string' ? (e as any).message as string : undefined;
  switch (msg) {
    case 'offline_remit_order_not_found':
      throw new HttpException({ error: 'offline_remit_order_not_found' }, HttpStatus.NOT_FOUND);
    case 'offline_remit_segregation_required':                      // 录入人==确认人（双人分离）
    case 'offline_remit_amount_mismatch':                           // 金额不符（拒且不入账）
    case 'offline_remit_provider_txn_conflict':                     // 同一流水指向第二单（CAS 23505）
    case 'offline_remit_order_not_entrant':
    case 'offline_remit_order_not_offline':
      throw new HttpException({ error: msg }, HttpStatus.CONFLICT);
    case 'offline_remit_entry_invalid_input':
    case 'offline_remit_confirm_invalid_input':
    case 'offline_remit_fail_invalid_input':
      throw new HttpException({ error: msg }, HttpStatus.BAD_REQUEST);
    case 'gateway_admin_required':
      throw new HttpException({ error: 'admin_required' }, HttpStatus.FORBIDDEN);
    default:
      throw e as Error;
  }
}

/**
 * 运营 admin 应用服务(跨用户特权只读 + 写操作审计)。所有跨用户读取都调用受版本控制的
 * SECURITY DEFINER 函数；函数内部复核 current principal 是 active admin，不能只依赖 HTTP guard。
 */
@Injectable()
export class AdminService {
  constructor(private readonly db: DbService) {}

  async users(principal: string) {
    const r = await this.db.asPrincipal(principal, (c) => c.query('SELECT * FROM gateway_admin_users()'));
    return { users: r.rows };   // 不含 password_hash
  }

  async orders(principal: string) {
    const r = await this.db.asPrincipal(principal, (c) => c.query('SELECT * FROM gateway_admin_orders()'));
    return { orders: r.rows };
  }

  async stats(principal: string) {
    const r = await this.db.asPrincipal(principal, (c) => c.query('SELECT * FROM gateway_admin_stats()'));
    // PostgreSQL bigint 由 node-postgres 以 string 交付；HTTP 既有契约是 number，
    // 所以在边界显式转换，不能让前端因 SQL 实现替换而收到类型漂移。
    return {
      users: Number(r.rows[0].users),
      orders: Number(r.rows[0].orders),
      paidCents: Number(r.rows[0].paid_cents),
    };
  }

  // 写操作:停用用户 + **记审计**(不可改,问责)
  async disable(id: string, principal: string) {
    const r = await this.db.asPrincipal(principal, (c) => c.query(
      'SELECT gateway_admin_disable($1) AS disabled', [id]));
    if (r.rows[0]?.disabled !== true) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return { disabled: true };
  }

  async audit(principal: string) {
    const r = await this.db.asPrincipal(principal, (c) => c.query('SELECT * FROM gateway_admin_audit()'));
    return { audit: r.rows };
  }

  // b110 招聘方审核制:审批队列(pending 先到先审)+ 裁决(approve/reject)。
  // 跨用户写仍走受控 SECURITY DEFINER 函数,函数内复核 admin(与 HTTP AdminGuard 双层)并
  // admin_audit 留痕(approve_recruiter/reject_recruiter)——approve=企业付费主体诞生时刻(#271 挂点)。
  async recruiterApprovals(principal: string) {
    const r = await this.db.asPrincipal(principal, (c) => c.query('SELECT * FROM gateway_admin_recruiter_approvals()'));
    return { approvals: r.rows };
  }

  async recruiterDecision(id: string, b: RecruiterDecisionDto, principal: string) {
    const r = await this.db.asPrincipal(principal, (c) => c.query(
      'SELECT gateway_admin_recruiter_approval($1,$2) AS decided', [id, b.decision]));
    // false=目标不存在或非招聘方账户(含 candidate)→ 404(不区分两者,无存在性信号)
    if (r.rows[0]?.decided !== true) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    evictPrincipalStatus(id);   // 本进程守卫缓存即时清(approve/reject 双向对称·调用点在 asPrincipal COMMIT 之后=事务外);跨实例由 0189 触发器同事务 pg_notify 广播逐缓存
    return { decided: true };
  }

  // AI 质量监控:聚合题目赞/踩(踩率高 = 出题质量差,触发 prompt/模型复盘)。跨用户特权聚合。
  async questionFeedback(principal: string) {
    const r = await this.db.asPrincipal(principal, (c) => c.query('SELECT * FROM gateway_admin_feedback_summary()'));
    const up = Number(r.rows[0]?.up ?? 0), down = Number(r.rows[0]?.down ?? 0), total = up + down;
    return { up, down, total, downRate: total ? Math.round((down / total) * 100) / 100 : null };
  }

  // ── B271 片1:对公录入/确认/置败三端点(AdminGuard+函数内 require_active_admin 双层照 B110 先例)──
  // 全部经受控 SECURITY DEFINER 函数(0156);audit 留痕(entry/confirm/fail)在函数内写 admin_audit。
  async offlineRemits(principal: string) {
    const r = await this.db.asPrincipal(principal, (c) => c.query('SELECT * FROM gateway_admin_offline_remit_queue()'));
    return { remits: r.rows };
  }

  async remitEntry(id: string, b: OfflineRemitEntryDto, principal: string) {
    try {
      const r = await this.db.asPrincipal(principal, (c) =>
        c.query('SELECT gateway_admin_offline_remit_entry($1,$2,$3) AS entered', [id, b.bankRef, b.amountCents]));
      if (r.rows[0]?.entered !== true) throw new HttpException({ error: 'offline_remit_order_not_found' }, HttpStatus.NOT_FOUND);
      return { entered: true };
    } catch (e: unknown) { mapOfflineRemitError(e); }
  }

  async remitConfirm(id: string, principal: string) {
    try {
      const r = await this.db.asPrincipal(principal, (c) =>
        c.query('SELECT gateway_admin_offline_remit_confirm($1) AS confirmed', [id]));
      if (r.rows[0]?.confirmed !== true) throw new HttpException({ error: 'offline_remit_order_not_found' }, HttpStatus.NOT_FOUND);
      return { confirmed: true };   // true=首次入账 | 重放收敛(同流水同单幂等)
    } catch (e: unknown) { mapOfflineRemitError(e); }
  }

  async remitFail(id: string, b: OfflineRemitFailDto, principal: string) {
    try {
      const r = await this.db.asPrincipal(principal, (c) =>
        c.query('SELECT gateway_admin_offline_remit_fail($1,$2) AS failed', [id, b.reason ?? null]));
      if (r.rows[0]?.failed !== true) throw new HttpException({ error: 'offline_remit_order_not_found' }, HttpStatus.NOT_FOUND);
      return { failed: true };
    } catch (e: unknown) { mapOfflineRemitError(e); }
  }
}
