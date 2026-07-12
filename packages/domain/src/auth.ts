/**
 * 认证核心（纯密码学,无 IO）：密码 scrypt KDF 哈希 + HMAC 签名会话令牌。替掉 x-user-id 骨架。
 * 铁律:密码绝不明文存/日志;只存 scrypt 派生;令牌 HMAC 签名防篡改 + 带过期。nowSec 注入便于 gate 确定性。
 */
import { scryptSync, randomBytes, createHmac, timingSafeEqual } from 'node:crypto';

/** 密码 → `scrypt$salt$dk`(随机盐,同密码两次哈希不同)。绝不存明文。 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const dk = scryptSync(password, salt, 32);
  return `scrypt$${salt.toString('hex')}$${dk.toString('hex')}`;
}

/** 常量时间比对验证密码,防时序侧信道。 */
export function verifyPassword(password: string, stored: string): boolean {
  const [alg, saltHex, dkHex] = stored.split('$');
  if (alg !== 'scrypt' || !saltHex || !dkHex) return false;
  const dk = scryptSync(password, Buffer.from(saltHex, 'hex'), 32);
  const expected = Buffer.from(dkHex, 'hex');
  return dk.length === expected.length && timingSafeEqual(dk, expected);
}

/** 签名会话令牌 `payload.sig`(payload=base64url{uid,exp};sig=HMAC-SHA256)。 */
export function signToken(userId: string, secret: string, ttlSec: number, nowSec: number): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: nowSec + ttlSec })).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/** 校验令牌:签名对 + 未过期 → uid;否则 null(篡改/过期/错密钥/畸形 全 fail-closed)。 */
export function verifyToken(token: string, secret: string, nowSec: number): string | null {
  const dot = token.indexOf('.');
  if (dot < 1) return null;
  const payload = token.slice(0, dot), sig = token.slice(dot + 1);
  const expSig = createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(expSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof p.uid !== 'string' || typeof p.exp !== 'number' || p.exp < nowSec) return null;
    return p.uid;
  } catch { return null; }
}
