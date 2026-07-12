import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyTokenFull } from '@meetwise/domain';
import { DbService } from './db.service';

/**
 * principal 注入守卫:优先校验 `Authorization: Bearer <token>`(HMAC 签名会话令牌)→ principal;
 * fail-closed(无/坏令牌 → 401)。x-user-id 头仅在 AUTH_DEV_HEADER=1(开发/测试)时作回退,生产禁用。
 *
 * **会话吊销(安全审计高危#2)**:令牌是无状态 HMAC(7 天 TTL,无 jti/黑名单),仅验签+exp 会让**已禁用/注销/改密**的账户
 *   在 TTL 内继续畅通(禁用=假开关、被盗令牌改密不失效)。故验签后**再查一次账户** status 与密码代次:
 *     ① status 非 'active' → 401(禁用/注销即时失效);
 *     ② 令牌 pwdEpoch ≠ 账户 pwd_epoch → 401(改密自增代次,旧/被盗令牌全部作废;此前只更 hash 不吊销令牌 = 漏洞 F4)。
 *   60s 内存缓存降 DB 负载(吊销生效 ≤60s 延迟,可接受;改密路径同步调 evictPrincipalStatus 即时生效)。多实例生产可换 Redis 共享缓存。
 */
const STATUS_TTL_MS = 60_000;
interface AccountState { active: boolean; epoch: number }
const statusCache = new Map<string, AccountState & { exp: number }>();
/** 账户禁用/注销/改密后调用 → 立即清缓存,让吊销即时生效(不等 60s)。 */
export function evictPrincipalStatus(uid: string): void { statusCache.delete(uid); }

@Injectable()
export class PrincipalGuard implements CanActivate {
  constructor(private readonly db: DbService) {}

  // 一次查询取 status + 密码代次,复用 60s 缓存(读放大不变;改密走 evictPrincipalStatus 让新代次即时可见)。
  private async accountState(uid: string, now: number): Promise<AccountState> {
    const c = statusCache.get(uid);
    if (c && c.exp > now) return { active: c.active, epoch: c.epoch };
    const r = await this.db.pool.query("SELECT status, pwd_epoch FROM user_account WHERE id=$1", [uid]);
    const row = r.rows[0];
    // 账户不存在 → epoch=-1(与任何合法令牌代次 ≥0 不等,天然拒绝),active=false。
    const state: AccountState = row
      ? { active: row.status === 'active', epoch: Number.isInteger(row.pwd_epoch) ? row.pwd_epoch : 0 }
      : { active: false, epoch: -1 };
    statusCache.set(uid, { ...state, exp: now + STATUS_TTL_MS });
    return state;
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const auth = (req.headers['authorization'] as string | undefined) ?? '';
    if (auth.startsWith('Bearer ')) {
      const secret = process.env.AUTH_SECRET ?? '';
      const tok = secret ? verifyTokenFull(auth.slice(7), secret, Math.floor(Date.now() / 1000)) : null;
      if (!tok) throw new UnauthorizedException({ error: 'invalid_token' });
      const st = await this.accountState(tok.uid, Date.now());
      if (!st.active) throw new UnauthorizedException({ error: 'account_inactive' });          // 禁用/注销 → 令牌即时失效
      if (st.epoch !== tok.pwdEpoch) throw new UnauthorizedException({ error: 'session_revoked' });  // 改密后旧代次令牌全失效
      req.principal = tok.uid;
      return true;
    }
    if (process.env.AUTH_DEV_HEADER === '1') {           // 开发/测试回退,生产不设此 env
      const user = req.headers['x-user-id'];
      if (user) { req.principal = user; return true; }
    }
    throw new UnauthorizedException({ error: 'unauthenticated' });
  }
}
