import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { DbService } from './db.service';

/**
 * 招聘方(B 端)守卫:在 PrincipalGuard 注入 principal 之后,校验该 principal 的 role='recruiter'。
 * 否则 403 fail-closed。这样 /recruiter/* 不对 C 端候选人开放——杜绝候选人发岗位/借邀请端点枚举用户。
 * b110 审核制三分码(R6):pending → 403 recruiter_pending_review;rejected → 403 recruiter_rejected
 * (免被拒用户永久见「审核中」;分码仅错误码语义,处置裁决留协调方);非招聘方 → recruiter_required。
 * fail-closed:查不到账户/非招聘方/审批态非 approved → 拒。
 */
@Injectable()
export class RecruiterGuard implements CanActivate {
  constructor(private readonly db: DbService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    if (!req.principal) throw new ForbiddenException({ error: 'forbidden' });
    const r = await this.db.asPrincipal(req.principal, (c) => c.query(
      'SELECT role, approval_status FROM user_account WHERE id=$1', [req.principal]));
    if (r.rowCount === 0 || r.rows[0].role !== 'recruiter') throw new ForbiddenException({ error: 'recruiter_required' });
    if (r.rows[0].approval_status === 'pending') throw new ForbiddenException({ error: 'recruiter_pending_review' });
    if (r.rows[0].approval_status !== 'approved') throw new ForbiddenException({ error: 'recruiter_rejected' });
    return true;
  }
}
