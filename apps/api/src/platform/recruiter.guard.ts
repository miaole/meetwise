import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { DbService } from './db.service';
import { accountState } from './principal.guard';

/**
 * 招聘方(B 端)守卫:在 PrincipalGuard 注入 principal 之后,校验该 principal 的 role='recruiter'。
 * 否则 403 fail-closed。这样 /recruiter/* 不对 C 端候选人开放——杜绝候选人发岗位/借邀请端点枚举用户。
 * b110 审核制三分码(R6):pending → 403 recruiter_pending_review;rejected → 403 recruiter_rejected
 * (免被拒用户永久见「审核中」;分码仅错误码语义,处置裁决留协调方);非招聘方 → recruiter_required。
 * fail-closed:查不到账户/非招聘方/审批态非 approved → 拒。
 *
 * #118 三查并一:role/approval_status 不再各自开 SQL,改读 PrincipalGuard 守卫缓存单查(accountState
 * 一查五列·60s 缓存);审批态变更(gateway_admin_recruiter_approval 在 DB 函数内写)经 0189 触发器
 * pg_notify 广播即时逐缓存——approve 与审批拒绝/撤权两方向对称,广播窗+在途请求窗内生效,
 * LISTEN 断连退回 ≤60s TTL 兜底。
 */
@Injectable()
export class RecruiterGuard implements CanActivate {
  constructor(private readonly db: DbService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    if (!req.principal) throw new ForbiddenException({ error: 'forbidden' });
    const st = await accountState(this.db, req.principal, Date.now());
    if (st.role !== 'recruiter') throw new ForbiddenException({ error: 'recruiter_required' });   // 行缺失(账户不存在)同码,role 缺失即非招聘方
    if (st.approvalStatus === 'pending') throw new ForbiddenException({ error: 'recruiter_pending_review' });
    if (st.approvalStatus !== 'approved') throw new ForbiddenException({ error: 'recruiter_rejected' });
    return true;
  }
}
