import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyTokenFull } from '@meetwise/domain';
import { DbService } from './db.service';
import { isSessionActive } from './auth-session';
import { getSseNotify, notePrincipalEvicted, onPrincipalEvict, principalEvictGeneration } from './sse-notify.service';

/**
 * principal 注入守卫:优先校验 `Authorization: Bearer <token>`(HMAC 签名会话令牌)→ principal;
 * fail-closed(无/坏令牌 → 401)。x-user-id 头仅在 AUTH_DEV_HEADER=1(开发/测试)时作回退,生产禁用。
 *
 * **会话吊销(安全审计高危#2)**:令牌是无状态 HMAC(7 天 TTL,无 jti/黑名单),仅验签+exp 会让**已禁用/注销/改密**
 *   在 TTL 内继续畅通(禁用=假开关、被盗令牌改密不失效)。故验签后**再查一次账户** status 与密码代次:
 *     ① status 非 'active' → 401(禁用/注销即时失效);
 *     ② 令牌 pwdEpoch ≠ 账户 pwd_epoch → 401(改密自增代次,旧/被盗令牌作废;此前只更 hash 不吊销令牌 = 漏洞 F4)。
 *   60s 内存缓存降 DB 负载;跨实例失效走 **pg_notify 广播**(0189 user_account 触发器,与状态 UPDATE 同事务随
 *   commit 原子送达):本进程写路径同步 evictPrincipalStatus 即时,其余实例经 meetwise_principal_evict_v1
 *   收播即时逐缓存——吊销窗=广播送达窗+在途请求窗,60s TTL 仅作 LISTEN 断连/未建立时的兜底上界(不 fail-open
 *   于安全)。缓存重填 TOCTOU 已收口:回填前比对单调 evict 序,DB 读开始后序前进(广播/本地 evict)即放弃落缓存,
 *   陈旧态最多存活单个在途请求,不再存活至 TTL。
 *
 * **AUTHZ-HARDEN 5A-1 簇③(#35/#112)只增不翻(§3-6 既有吊销机械零改)**:
 *   ① kid 多钥窗:候选钥=[AUTH_SECRET, ...AUTH_SECRET_PREVIOUS(逗号分隔)] 逐钥验签,kid 匹配者胜(密钥指纹
 *      sha256 前 8 hex,见 domain keyIdFor)——轮换=换 AUTH_SECRET+旧钥暂留 PREVIOUS,窗内旧令牌照验;窗=配置存在期,
 *      移除即窗外 401(环境配置面·零停机)。全部候选不符 → 401 invalid_token(与错钥同码,抗探测)。
 *   ② jti 会话吊销:**带 jti 令牌**验签/exp/保留主体/status/代次既有机械全过之后,再查 auth_user_session(0169;
 *      60s 缓存沿 status 缓存同形,logout 同步 evictSessionRevocation 即时+广播同渠)→ 已吊销 401 session_revoked(复用既有码面)。
 *      **无 jti=存量 legacy 令牌走无态路径**(R1:跳过会话查,至 TTL 自然过期;禁一刀切全拒)。
 */
const STATUS_TTL_MS = 60_000;
interface AccountState { active: boolean; epoch: number; role?: string; approvalStatus?: string; isAdmin?: boolean }
const statusCache = new Map<string, AccountState & { exp: number }>();
/** 账户禁用/注销/改密后调用 → 序自增+清本进程缓存,让吊销即时生效(不等 60s);跨实例由 0189 触发器广播。 */
export function evictPrincipalStatus(uid: string): void { notePrincipalEvicted('uid', uid); }

// 守卫吊销广播收播(0189 触发器 → pg_notify → 同一条 sse-notify 专用 LISTEN 连接第二通道):
// 收播即清本进程缓存;注册即起 LISTEN(不等首个 SSE 流,吊销广播从进程启动即有效)。
onPrincipalEvict('uid', (uid) => { statusCache.delete(uid); });
getSseNotify().whenHealthy();

/**
 * 账户状态单查(守卫 #118 三查并一后的一查五列):status/pwd_epoch 吊销面 + role/approval_status/is_admin
 * (RecruiterGuard/AdminGuard 从同一缓存态读,零各自 SQL)。60s 缓存 + 回填代次比对(TOCTOU 守卫)。
 * 一次查询,复用 60s 缓存(读放大不变;改密走 evictPrincipalStatus 让新代次即时可见)。
 */
export async function accountState(db: DbService, uid: string, now: number): Promise<AccountState> {
  const c = statusCache.get(uid);
  if (c && c.exp > now) return { active: c.active, epoch: c.epoch, role: c.role, approvalStatus: c.approvalStatus, isAdmin: c.isAdmin };
  const genBefore = principalEvictGeneration('uid', uid);
  const r = await db.asPrincipal(uid, (conn) => conn.query(
    "SELECT status, pwd_epoch, role, approval_status, is_admin FROM user_account WHERE id=$1", [uid]));
  const row = r.rows[0];
  // 账户不存在 → epoch=-1(与任何合法令牌代次 ≥0 不等,天然拒绝),active=false。
  // 显式 Number() 归一:pwd_epoch 现为 int4(返回 number);即便日后改 bigint(pg 返回字符串)也不会静默塌成 0 造成伪匹配。
  const epoch = Number(row?.pwd_epoch);
  const state: AccountState = row
    ? { active: row.status === 'active', epoch: Number.isFinite(epoch) && epoch >= 0 ? epoch : 0,
        role: row.role ?? undefined, approvalStatus: row.approval_status ?? undefined, isAdmin: row.is_admin === true }
    : { active: false, epoch: -1 };
  // 回填代次比对:DB 读开始后若有 evict(本进程或广播),该读可能早于远端 commit(旧态)——放弃落缓存,
  // 仅本请求使用;陈旧态因此最多存活一个在途请求窗,不会存活至 TTL。
  if (principalEvictGeneration('uid', uid) === genBefore) statusCache.set(uid, { ...state, exp: now + STATUS_TTL_MS });
  return state;
}

/** 5A-1 #35:验证候选钥序(当前钥优先;AUTH_SECRET_PREVIOUS 逗号分隔多旧钥窗)。逐请求读 env——轮换即改即生效。 */
function authSecretCandidates(): string[] {
  const cur = process.env.AUTH_SECRET ?? '';
  const prev = (process.env.AUTH_SECRET_PREVIOUS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return [cur, ...prev].filter(Boolean);
}

@Injectable()
export class PrincipalGuard implements CanActivate {
  constructor(private readonly db: DbService) {}

  // **保留系统内部主体前缀**:`__system*`(如 qbank 灌库 owner `__system_qbank__`)是系统内部身份,**绝不可作为绑定 HTTP 主体**——
  // 否则(尤其 staging 开 dev-header)攻击者发 `x-user-id: __system_qbank__` 就冒充受信写入方绕过 qbank 投毒门(qbank 审计残留洞 #1)。
  private static isReserved(p: unknown): boolean { return typeof p === 'string' && p.startsWith('__system'); }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const auth = (req.headers['authorization'] as string | undefined) ?? '';
    if (auth.startsWith('Bearer ')) {
      // 5A-1 #35:多钥窗逐候选验签(kid 不符/签名不符皆 null → 下一候选;全不符 = 与错钥同码 invalid_token)。
      const nowSec = Math.floor(Date.now() / 1000);
      let tok: ReturnType<typeof verifyTokenFull> = null;
      for (const secret of authSecretCandidates()) {
        tok = verifyTokenFull(auth.slice(7), secret, nowSec);
        if (tok) break;
      }
      if (!tok) throw new UnauthorizedException({ error: 'invalid_token' });
      if (PrincipalGuard.isReserved(tok.uid)) throw new UnauthorizedException({ error: 'reserved_principal' });   // 令牌 uid 撞保留 sentinel(不可能来自正常注册,防伪造)
      const st = await accountState(this.db, tok.uid, Date.now());
      if (!st.active) throw new UnauthorizedException({ error: 'account_inactive' });          // 禁用/注销 → 令牌即时失效
      if (st.epoch !== tok.pwdEpoch) throw new UnauthorizedException({ error: 'session_revoked' });  // 改密后旧代次令牌失效
      // 5A-1 #112(jti 会话吊销·只增):带 jti 令牌最后查会话表(60s 缓存+logout evict 即时)——已吊销 401 session_revoked。
      // 无 jti=存量 legacy 令牌 → 无态路径(R1,跳过)。既有 status/代次/保留主体机械零改,本查恒在其后(既有错误码优先序不变)。
      if (tok.jti && !(await isSessionActive(this.db, tok.uid, tok.jti, Date.now())))
        throw new UnauthorizedException({ error: 'session_revoked' });
      req.principal = tok.uid;
      req.jti = tok.jti;   // 5A-1 #112:挂当前会话 jti 供 /auth/logout 精确吊销(legacy 无 jti → undefined)
      return true;
    }
    // x-user-id 回退仅限开发/测试:它绕过验签/status/代次,若在生产误开=任意账户接管。故硬闸——NODE_ENV=production 时该分支永不生效(不靠运维纪律)。
    if (process.env.AUTH_DEV_HEADER === '1' && process.env.NODE_ENV !== 'production') {
      const user = req.headers['x-user-id'];
      if (PrincipalGuard.isReserved(user)) throw new UnauthorizedException({ error: 'reserved_principal' });   // dev-header 也不许冒充系统 sentinel(qbank 投毒门端到端闭合)
      if (user) { req.principal = user; return true; }
    }
    throw new UnauthorizedException({ error: 'unauthenticated' });
  }
}
