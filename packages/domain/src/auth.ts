/**
 * 认证核心（纯密码学,无 IO）：密码 scrypt KDF 哈希 + HMAC 签名会话令牌。替掉 x-user-id 骨架。
 * 铁律:密码绝不明文存/日志;只存 scrypt 派生;令牌 HMAC 签名防篡改 + 带过期。nowSec 注入便于 gate 确定性。
 * AUTHZ-HARDEN 5A-1(AUTHZ-HARDEN REQUEST rev2 簇①②③):邮箱归一单一 helper + kid/jti 会话令牌 + 恒时序登录 verify。
 */
import { scryptSync, randomBytes, createHmac, createHash, timingSafeEqual } from 'node:crypto';

/** 密码 → `scrypt$salt$dk`(随机盐,同密码两次哈希不同)。绝不存明文。 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const dk = scryptSync(password, salt, 32);
  return `scrypt$${salt.toString('hex')}$${dk.toString('hex')}`;
}

/** AUTHZ-HARDEN 5A-1 #33:登录恒时序假哈希——与 hashPassword 输出**同形**(`scrypt$<32hex盐>$<64hex dk>`),verify 同参真跑一次 scrypt。内存常量,零 DB 变化(裁决项③)。 */
export const LOGIN_DUMMY_HASH = `scrypt$${'0'.repeat(32)}$${'0'.repeat(64)}`;

/**
 * AUTHZ-HARDEN 5A-1 #33 恒时序登录 verify:stored 缺失(账户不存在)时对同一内存假哈希跑同一 verify——
 * **verify 恰调用一次,与账户存在性/状态无关**(调用计数相等,时序面以计数证非墙钟;状态判定由调用方移到本函数之后)。
 * verify 参数可注入(计数证断言用),默认=verifyPassword 真实 scrypt 同参路径。
 */
export function verifyLogin(stored: string | null | undefined, password: string, verify: (password: string, stored: string) => boolean = verifyPassword): boolean {
  return verify(password, stored ?? LOGIN_DUMMY_HASH);
}

/** AUTHZ-HARDEN 5A-1 #111/#131 邮箱归一**单一 helper**:trim+lower。注册入库/登录查询/邀请解析/限流 key 同源共用(消灭双处各写)。 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** 常量时间比对验证密码,防时序侧信道。 */
export function verifyPassword(password: string, stored: string): boolean {
  const [alg, saltHex, dkHex] = stored.split('$');
  if (alg !== 'scrypt' || !saltHex || !dkHex) return false;
  const dk = scryptSync(password, Buffer.from(saltHex, 'hex'), 32);
  const expected = Buffer.from(dkHex, 'hex');
  return dk.length === expected.length && timingSafeEqual(dk, expected);
}

/** 校验令牌后的载荷:uid + 密码代次(pwdEpoch)。AUTHZ-HARDEN 5A-1 增:会话/密钥指(jti,kid 可选——存量令牌无此二字段)。 */
export interface VerifiedToken { uid: string; pwdEpoch: number; jti?: string; kid?: string }

/**
 * 密钥指(kid)=密钥指纹:sha256 前 8 hex。轮换=换 AUTH_SECRET + 旧钥暂留 AUTH_SECRET_PREVIOUS(逗号分隔多钥窗),
 * 验证端按 kid 匹配候选钥(窗内旧令牌照验;窗=该 env 配置存在期,移除即窗外 401)——零停机零额外状态(裁决=环境配置面)。
 */
export function keyIdFor(secret: string): string {
  return createHash('sha256').update(secret).digest('hex').slice(0, 8);
}

/**
 * 签名会话令牌 `payload.sig`(payload=base64url{uid,exp,pe,kid,jti?};sig=HMAC-SHA256)。
 * `pe`=密码代次(pwdEpoch)快照:签发时刻账户的密码代次。改密使代次自增,守卫比对不等即拒 → 旧代次令牌失效(会话吊销;时效见 PrincipalGuard 缓存说明)。
 * pwdEpoch 省略=0,与账户 pwd_epoch 默认 0 对齐,老调用点/老库无缝兼容。
 * AUTHZ-HARDEN 5A-1 #35:新令牌恒带 `kid`(keyIdFor(secret));`jti` 由 session.jti 提供时才嵌入(会话令牌恒带,支持 0169 表单独吊销/登出)。
 * 兼容:五参以内旧调用点签名不变(jti 不传=不嵌入,令牌即 legacy 形——测试/存量兼容)。
 */
export function signToken(userId: string, secret: string, ttlSec: number, nowSec: number, pwdEpoch = 0, session?: { jti: string }): string {
  const payload = Buffer.from(JSON.stringify({
    uid: userId, exp: nowSec + ttlSec, pe: pwdEpoch, kid: keyIdFor(secret),
    ...(session?.jti ? { jti: session.jti } : {}),
  })).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/**
 * 校验令牌:签名对 + 未过期 → {uid, pwdEpoch, jti?, kid?};否则 null(篡改/过期/错密钥/畸形/kid 与受验钥不符 全 fail-closed)。
 * 向后兼容:旧令牌无 `pe` 字段 → pwdEpoch 视作 0(等于 user_account.pwd_epoch 默认值,首个代次不误吊销)。
 * pe 只在 HMAC 验签通过后读取,已不可伪造;仍做整数/非负防御性归一。
 * AUTHZ-HARDEN 5A-1 #35:令牌带 `kid` 时必须等于 keyIdFor(受验密钥)——防密钥混淆(多钥窗下 kid 选钥由调用方
 * 依候选钥序完成,本函数守最后一道);**无 `kid` 字段=存量 legacy 令牌**,只走验签+exp 既有机械(R1 legacy 无态路径)。
 * `jti` 在验签通过后原样带出(调用方据此查会话表;无 jti=legacy,调用方跳过会话查)。
 */
export function verifyTokenFull(token: string, secret: string, nowSec: number): VerifiedToken | null {
  const dot = token.indexOf('.');
  if (dot < 1) return null;
  const payload = token.slice(0, dot), sig = token.slice(dot + 1);
  const expSig = createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(expSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof p.uid !== 'string' || typeof p.exp !== 'number' || p.exp < nowSec) return null;
    if (p.kid !== undefined && p.kid !== keyIdFor(secret)) return null;
    const pwdEpoch = Number.isInteger(p.pe) && p.pe >= 0 ? p.pe : 0;
    return {
      uid: p.uid, pwdEpoch,
      ...(typeof p.jti === 'string' && p.jti.length > 0 ? { jti: p.jti } : {}),
      ...(typeof p.kid === 'string' ? { kid: p.kid } : {}),
    };
  } catch { return null; }
}

/** 校验令牌 → uid（不需代次的旧调用点用；内部委托 verifyTokenFull,行为不变）。 */
export function verifyToken(token: string, secret: string, nowSec: number): string | null {
  return verifyTokenFull(token, secret, nowSec)?.uid ?? null;
}
