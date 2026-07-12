import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@meetwise/domain';
import { DbService } from './db.service';

/**
 * principal 注入守卫:优先校验 `Authorization: Bearer <token>`(HMAC 签名会话令牌)→ principal;
 * fail-closed(无/坏令牌 → 401)。x-user-id 头仅在 AUTH_DEV_HEADER=1(开发/测试)时作回退,生产禁用。
 *
 * **会话吊销(安全审计高危#2)**:令牌是无状态 HMAC(7 天 TTL,无 jti/黑名单),仅验签+exp 会让**已禁用/注销/改密**的账户
 *   在 TTL 内继续畅通(禁用=假开关、被盗令牌改密不失效)。故验签后**再查一次账户 status='active'**,非 active 即 401。
 *   60s 内存缓存降 DB 负载(禁用生效 ≤60s 延迟,可接受;需即时可调用 evictPrincipalStatus)。多实例生产可换 Redis 共享缓存。
 */
const STATUS_TTL_MS = 60_000;
const statusCache = new Map<string, { active: boolean; exp: number }>();
/** 账户禁用/注销/改密后调用 → 立即清缓存,让吊销即时生效(不等 60s)。 */
export function evictPrincipalStatus(uid: string): void { statusCache.delete(uid); }

@Injectable()
export class PrincipalGuard implements CanActivate {
  constructor(private readonly db: DbService) {}

  private async isActive(uid: string, now: number): Promise<boolean> {
    const c = statusCache.get(uid);
    if (c && c.exp > now) return c.active;
    const r = await this.db.pool.query("SELECT 1 FROM user_account WHERE id=$1 AND status='active'", [uid]);
    const active = (r.rowCount ?? 0) > 0;
    statusCache.set(uid, { active, exp: now + STATUS_TTL_MS });
    return active;
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const auth = (req.headers['authorization'] as string | undefined) ?? '';
    if (auth.startsWith('Bearer ')) {
      const secret = process.env.AUTH_SECRET ?? '';
      const uid = secret ? verifyToken(auth.slice(7), secret, Math.floor(Date.now() / 1000)) : null;
      if (!uid) throw new UnauthorizedException({ error: 'invalid_token' });
      if (!(await this.isActive(uid, Date.now()))) throw new UnauthorizedException({ error: 'account_inactive' });   // 禁用/注销 → 令牌即时失效
      req.principal = uid;
      return true;
    }
    if (process.env.AUTH_DEV_HEADER === '1') {           // 开发/测试回退,生产不设此 env
      const user = req.headers['x-user-id'];
      if (user) { req.principal = user; return true; }
    }
    throw new UnauthorizedException({ error: 'unauthenticated' });
  }
}
