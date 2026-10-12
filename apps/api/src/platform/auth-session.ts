import { randomUUID } from 'node:crypto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { signToken } from '@meetwise/domain';
import { DbService } from './db.service';

/**
 * AUTHZ-HARDEN 5A-1 簇③（#35/#112）：kid/jti 会话令牌签发 + 会话表吊销读侧的共享原语。
 * 表=auth_user_session（0169：jti PRIMARY KEY + pwd_epoch 快照 + retention_class='auth_session'，
 * R5 与 privacy 0091/0112 谱系显式区分）。签发点恰两处（R1 rev2 清单）：login/signup（auth.service issue）
 * 与改密回签（profile.service.changePassword）——双产点全改走本模块，别处禁私签会话令牌。
 *
 * R1 legacy 无态路径：存量已发令牌无 jti（无会话行）→ 守卫只走验签+exp+pwd_epoch/status 既有机械至 TTL
 * 自然过期（存量会话兼容，禁一刀切全拒）；本模块只服务**带 jti** 的新令牌。
 *
 * kid 轮换（#35）：签发恒用 AUTH_SECRET（当前钥）；旧钥经 AUTH_SECRET_PREVIOUS（逗号分隔多钥窗）在
 * principal.guard 验证窗内照验（见该处）。轮换=环境配置面，零停机。
 */
export const SESSION_TTL_SEC = 7 * 24 * 3600;

/** 会话吊销缓存（沿 PrincipalGuard status 60s 缓存同形）：单实例 logout 同步 evict 即时生效；多实例 evict 只清本进程，其余 ≤60s 缓存过期（与既有 status 缓存同源 seam，#36 归 5C 不动）。 */
const SESSION_TTL_MS = 60_000;
interface SessionState { active: boolean; exp: number }
const sessionCache = new Map<string, SessionState>();
/** 登出/吊销后调用 → 立即清缓存,让吊销即时生效(不等 60s)。 */
export function evictSessionRevocation(jti: string): void { sessionCache.delete(jti); }

/**
 * 签发会话令牌并落会话行（同请求内原子先后：INSERT 成功才返回令牌——任何发出的 jti 令牌必有会话行，
 * 守卫侧可 fail-closed）。缺 AUTH_SECRET → null（调用方定语义：login/signup 抛 auth_not_configured；改密降级仅 changed——原语义保留）。
 */
export async function issueSessionToken(db: DbService, uid: string, pwdEpoch = 0): Promise<string | null> {
  const secret = process.env.AUTH_SECRET ?? '';
  if (!secret) return null;
  const jti = randomUUID();
  const token = signToken(uid, secret, SESSION_TTL_SEC, Math.floor(Date.now() / 1000), pwdEpoch, { jti });
  await db.asPrincipal(uid, (c) => c.query(
    'INSERT INTO auth_user_session(jti, user_id, pwd_epoch) VALUES ($1,$2,$3)',
    [jti, uid, pwdEpoch],
  ));
  return token;
}

/**
 * 服务端吊销当前 jti（#112 登出服务端化）：UPDATE revoked_at（无 DELETE，行保留供审计）+ 即时 evict。
 * 返回是否真吊销了一行（legacy 无 jti 令牌无行可吊销 → false，调用方如实回告，不假宣称）。
 */
export async function revokeSession(db: DbService, uid: string, jti: string): Promise<boolean> {
  const r = await db.asPrincipal(uid, (c) => c.query(
    'UPDATE auth_user_session SET revoked_at=now() WHERE jti=$1 AND revoked_at IS NULL',
    [jti],
  ));
  evictSessionRevocation(jti);
  return (r.rowCount ?? 0) > 0;
}

/**
 * 会话仍有效（未吊销）?带 60s 缓存。**fail-closed**：行缺失/已吊销 → false（会话行是 jti 令牌吊销真相源；
 * 签发与 INSERT 同请求先后保证任何发出的 jti 令牌必有行，行缺失即异常态，拒）。仅对带 jti 令牌调用。
 */
export async function isSessionActive(db: DbService, uid: string, jti: string, now: number): Promise<boolean> {
  const c = sessionCache.get(jti);
  if (c && c.exp > now) return c.active;
  const r = await db.asPrincipal(uid, (conn) => conn.query(
    'SELECT 1 FROM auth_user_session WHERE jti=$1 AND revoked_at IS NULL',
    [jti],
  ));
  const active = (r.rowCount ?? 0) > 0;
  sessionCache.set(jti, { active, exp: now + SESSION_TTL_MS });
  return active;
}

/** issue 的抛错形（login/signup 用）：缺 AUTH_SECRET → 500 auth_not_configured（原 auth.service.issue 语义）。 */
export async function issueSessionTokenOrThrow(db: DbService, uid: string, pwdEpoch = 0): Promise<string> {
  const token = await issueSessionToken(db, uid, pwdEpoch);
  if (token === null) throw new HttpException({ error: 'auth_not_configured' }, HttpStatus.INTERNAL_SERVER_ERROR);
  return token;
}
