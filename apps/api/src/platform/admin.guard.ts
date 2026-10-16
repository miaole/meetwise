import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { DbService } from './db.service';
import { accountState } from './principal.guard';

/**
 * 运营 admin 守卫:在 PrincipalGuard 注入 principal 之后,校验该 principal 是 is_admin。
 * 否则 403 fail-closed。admin 端点据此放心做跨用户特权只读(非 RLS 作用域)。
 *
 * #118 三查并一:is_admin 不再各自开 SQL,改读 PrincipalGuard 守卫缓存单查(accountState 一查五列);
 * is_admin 变更经 0189 触发器 pg_notify 广播即时逐缓存(LISTEN 断连退回 ≤60s TTL 兜底)。
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly db: DbService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    if (!req.principal) throw new ForbiddenException({ error: 'forbidden' });
    const st = await accountState(this.db, req.principal, Date.now());
    if (st.isAdmin !== true) throw new ForbiddenException({ error: 'admin_required' });   // 行缺失同码,is_admin 非真即拒(fail-closed)
    return true;
  }
}
