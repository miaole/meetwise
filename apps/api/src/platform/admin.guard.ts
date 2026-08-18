import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { DbService } from './db.service';

/**
 * 运营 admin 守卫:在 PrincipalGuard 注入 principal 之后,校验该 principal 是 is_admin。
 * 否则 403 fail-closed。admin 端点据此放心做跨用户特权只读(非 RLS 作用域)。
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly db: DbService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    if (!req.principal) throw new ForbiddenException({ error: 'forbidden' });
    const r = await this.db.asPrincipal(req.principal, (c) => c.query(
      'SELECT is_admin FROM user_account WHERE id=$1', [req.principal]));
    if (r.rowCount === 0 || r.rows[0].is_admin !== true) throw new ForbiddenException({ error: 'admin_required' });
    return true;
  }
}
