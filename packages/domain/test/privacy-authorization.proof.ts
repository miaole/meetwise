/**
 * PrivacyAuthorizationIssuer 纯密码学证明（确定性，无 IO）。
 * 覆盖：签/验往返、kid/JWKS 表示、轮换（retired 窗口内可验签/过期即移除）、
 * fail-closed（未知/吊销 kid、过期、超寿命、篡改 header/payload/签名、错密钥、
 * 伪造 iss/aud/purpose/keyId 绑定/epoch/digest 全拒绝）。
 * 运行：pnpm -C packages/domain prove:privacy-authorization
 */
import { createPrivateKey, sign as cryptoSign } from 'node:crypto';
import {
  PRIVACY_AUTHZ_ISSUER, PRIVACY_AUTHZ_AUDIENCE, MAX_PRIVACY_AUTHZ_TTL_SEC,
  PRIVACY_AUTHZ_PURPOSES, PRIVACY_AUTHZ_KID_RE, PRIVACY_AUTHZ_DIGEST_RE,
  canonicalTargetSetDigest, generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot,
  verifyPrivacyAuthorizationSnapshot, PrivacyAuthzKeyRegistry, signToken,
  type PrivacyAuthzTarget, type PrivacyAuthorizationClaims,
} from '../src/index.ts';
import {
  PRIVACY_AUTHZ_ISSUER as CONTRACT_ISSUER,
  PRIVACY_AUTHZ_AUDIENCE as CONTRACT_AUDIENCE,
  PRIVACY_AUTHZ_PURPOSES as CONTRACT_PURPOSES,
  PRIVACY_AUTHZ_KID_RE as CONTRACT_KID_RE,
  PRIVACY_AUTHZ_DIGEST_RE as CONTRACT_DIGEST_RE,
} from '@meetwise/contracts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const NOW = 1_700_000_000;

const keyA = generatePrivacyAuthzKeyPair('privacy-del-2026-01');
const keyB = generatePrivacyAuthzKeyPair('privacy-del-2026-02');
const registry = new PrivacyAuthzKeyRegistry();
registry.activate(keyA.kid, keyA.publicJwk);

const TARGETS: PrivacyAuthzTarget[] = [
  { kind: 'checkpoint_rows', resource: 'a'.repeat(64) },
  { kind: 'oss', resource: 'b'.repeat(64) },
  { kind: 'redis', resource: 'c'.repeat(64) },
];
const digest = canonicalTargetSetDigest(TARGETS);

const signed = signPrivacyAuthorizationSnapshot({
  privateKeyPem: keyA.privateKeyPem, kid: keyA.kid,
  actor: 'user-1', owner: 'user-1', interview: 'iv-1',
  purpose: 'interview_data_erasure', privacyEpoch: 3, targets: TARGETS,
  jti: '11111111-1111-4111-8111-111111111111', nowSec: NOW, ttlSec: 300,
});

const verified = verifyPrivacyAuthorizationSnapshot({ jws: signed.jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW });
A('签/验往返还原 owner/epoch/digest/jti/expiry', verified !== null
  && verified.owner === 'user-1' && verified.privacyEpoch === 3
  && verified.targetSetDigest === digest && verified.jti === signed.jti
  && verified.expiresAtMs === (NOW + 300) * 1000 && verified.issuedAtMs === NOW * 1000);
A('digest 与插入顺序无关', canonicalTargetSetDigest([...TARGETS].reverse()) === digest);
A('目标集增删即 digest 漂移', canonicalTargetSetDigest(TARGETS.slice(0, 2)) !== digest);

// 低层手工签名，制造“合法密钥但非法声明”的 JWS，验证 claim 级 fail-closed。
const rawSign = (claims: object, kid: string, pem: string): string => {
  const h = Buffer.from(JSON.stringify({ alg: 'ES256', kid })).toString('base64url');
  const p = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const si = `${h}.${p}`;
  const sig = cryptoSign('sha256', Buffer.from(si), { key: createPrivateKey(pem), dsaEncoding: 'ieee-p1363' });
  return `${si}.${Buffer.from(sig).toString('base64url')}`;
};
const base = (): PrivacyAuthorizationClaims => ({
  iss: PRIVACY_AUTHZ_ISSUER, aud: PRIVACY_AUTHZ_AUDIENCE, jti: '22222222-2222-4222-8222-222222222222',
  iat: NOW, exp: NOW + 300, issuerId: PRIVACY_AUTHZ_ISSUER, keyId: keyA.kid, actor: 'user-1', owner: 'user-1',
  interview: 'iv-1', purpose: 'interview_data_erasure', privacyEpoch: 3, targetSetDigest: digest,
});
const vRaw = (jws: string) => verifyPrivacyAuthorizationSnapshot({ jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW });

A('篡改 payload 拒绝', vRaw(signed.jws.slice(0, signed.jws.length - 4) + 'AAAA') === null);
A('篡改签名拒绝', vRaw(rawSign({ ...base(), jti: '33333333-3333-4333-8333-333333333333' }, keyA.kid, keyA.privateKeyPem).slice(0, -2) + 'xx') === null);
A('篡改 header.kid 拒绝', (() => {
  const j = rawSign(base(), keyA.kid, keyA.privateKeyPem);
  const parts = j.split('.');
  const badHeader = Buffer.from(JSON.stringify({ alg: 'ES256', kid: 'privacy-del-evil' })).toString('base64url');
  return vRaw([badHeader, parts[1], parts[2]].join('.')) === null;
})());
A('错密钥(验签器无对应 kid)拒绝', verifyPrivacyAuthorizationSnapshot({ jws: signed.jws, resolveJwk: () => null, nowSec: NOW }) === null);
A('未知 kid 拒绝', (() => { const r = new PrivacyAuthzKeyRegistry(); r.activate(keyA.kid, keyA.publicJwk); return verifyPrivacyAuthorizationSnapshot({ jws: rawSign(base(), 'privacy-del-unknown', keyA.privateKeyPem), resolveJwk: r.resolve.bind(r), nowSec: NOW }) === null; })());
A('错误 iss 拒绝', vRaw(rawSign({ ...base(), iss: 'meetwise-authz-v1' }, keyA.kid, keyA.privateKeyPem)) === null);
A('错误 aud 拒绝', vRaw(rawSign({ ...base(), aud: 'meetwise-model-gateway' }, keyA.kid, keyA.privateKeyPem)) === null);
A('keyId 与 header.kid 不一致拒绝', vRaw(rawSign({ ...base(), keyId: 'privacy-del-2026-02' }, keyA.kid, keyA.privateKeyPem)) === null);
A('非法 purpose 拒绝', vRaw(rawSign({ ...base(), purpose: 'forge_purpose' }, keyA.kid, keyA.privateKeyPem)) === null);
A('epoch<=0 拒绝', vRaw(rawSign({ ...base(), privacyEpoch: 0 }, keyA.kid, keyA.privateKeyPem)) === null);
A('digest 非 64-hex 拒绝', vRaw(rawSign({ ...base(), targetSetDigest: 'deadbeef' }, keyA.kid, keyA.privateKeyPem)) === null);
A('过期拒绝(nowSec>exp)', verifyPrivacyAuthorizationSnapshot({ jws: signed.jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW + 301 }) === null);
A('畸形 JWS 拒绝', vRaw('nodot') === null && vRaw('') === null && vRaw('a.b') === null);

// 轮换：retire 后窗口内可验签，过期后从 JWKS 移除 + resolve 返回 null；revoke 立即 fail-closed。
registry.retire(keyA.kid, (NOW + 200) * 1000);
A('retired kid 在窗口内仍可验签', verifyPrivacyAuthorizationSnapshot({ jws: signed.jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW + 100 }) !== null);
A('retired kid 窗口关闭后拒绝', verifyPrivacyAuthorizationSnapshot({ jws: signed.jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW + 201 }) === null);
A('窗口关闭后 JWKS 移除 retired kid', registry.toJwks((NOW + 201) * 1000).keys.every((k) => k.kid !== keyA.kid));
registry.activate(keyB.kid, keyB.publicJwk);
const signedB = signPrivacyAuthorizationSnapshot({ privateKeyPem: keyB.privateKeyPem, kid: keyB.kid, actor: 'user-1', owner: 'user-1', interview: 'iv-1', purpose: 'interview_data_erasure', privacyEpoch: 3, targets: TARGETS, nowSec: NOW + 500, ttlSec: 300 });
registry.revoke(keyB.kid);
A('revoked kid 立即拒绝', verifyPrivacyAuthorizationSnapshot({ jws: signedB.jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW + 500 }) === null);
A('revoked kid 不出现在 JWKS', registry.toJwks(NOW * 1000).keys.every((k) => k.kid !== keyB.kid));

// 签发约束：超寿命直接抛，不签弱快照。
A('ttl 超上限抛错', (() => { try { signPrivacyAuthorizationSnapshot({ privateKeyPem: keyA.privateKeyPem, kid: keyA.kid, actor: 'u', owner: 'u', interview: 'i', purpose: 'interview_data_erasure', privacyEpoch: 1, targets: TARGETS, nowSec: NOW, ttlSec: MAX_PRIVACY_AUTHZ_TTL_SEC + 1 }); return false; } catch { return true; } })());
A('epoch 非法抛错', (() => { try { signPrivacyAuthorizationSnapshot({ privateKeyPem: keyA.privateKeyPem, kid: keyA.kid, actor: 'u', owner: 'u', interview: 'i', purpose: 'interview_data_erasure', privacyEpoch: 0, targets: TARGETS, nowSec: NOW, ttlSec: 60 }); return false; } catch { return true; } })());
A('生成密钥对可重建公钥验签 + 私钥非空', keyA.privateKeyPem.length > 0 && keyA.publicJwk.crv === 'P-256' && keyA.publicJwk.x.length > 0);

// L9：真正的 payload 翻转——只改 payload 内容、签名保持不变，必须拒绝（此前“篡改 payload”
// 实为改签名末 4 字符，标签误导）。
{
  const parts = signed.jws.split('.');
  const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf8')) as Record<string, unknown>;
  payload.owner = 'user-evil';
  const flippedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  A('真正篡改 payload(签名不变)拒绝(L9)', vRaw([parts[0], flippedPayload, parts[2]].join('.')) === null);
}

// L8：补齐此前假绿的负分支——alg / issuerId / jti / 空字段 / iat-exp 非整数 / 寿命 / L1 iat 边界 / null payload。
const rawSignAlg = (claims: object, alg: string, kid: string, pem: string): string => {
  const h = Buffer.from(JSON.stringify({ alg, kid })).toString('base64url');
  const p = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const si = `${h}.${p}`;
  const sig = cryptoSign('sha256', Buffer.from(si), { key: createPrivateKey(pem), dsaEncoding: 'ieee-p1363' });
  return `${si}.${Buffer.from(sig).toString('base64url')}`;
};
A('alg≠ES256 拒绝(L8)', vRaw(rawSignAlg(base(), 'RS256', keyA.kid, keyA.privateKeyPem)) === null);
A('issuerId 与 iss 不一致拒绝(L8)', vRaw(rawSign({ ...base(), issuerId: 'forged-issuer' }, keyA.kid, keyA.privateKeyPem)) === null);
A('jti 非 UUID 拒绝(L8)', vRaw(rawSign({ ...base(), jti: 'not-a-uuid' }, keyA.kid, keyA.privateKeyPem)) === null);
A('actor 为空拒绝(L8)', vRaw(rawSign({ ...base(), actor: '' }, keyA.kid, keyA.privateKeyPem)) === null);
A('owner 为空拒绝(L8)', vRaw(rawSign({ ...base(), owner: '' }, keyA.kid, keyA.privateKeyPem)) === null);
A('interview 为空拒绝(L8)', vRaw(rawSign({ ...base(), interview: '' }, keyA.kid, keyA.privateKeyPem)) === null);
A('iat 非整数拒绝(L8)', vRaw(rawSign({ ...base(), iat: NOW + 0.5 }, keyA.kid, keyA.privateKeyPem)) === null);
A('exp 非整数拒绝(L8)', vRaw(rawSign({ ...base(), exp: NOW + 300.5 }, keyA.kid, keyA.privateKeyPem)) === null);
A('寿命超上限(exp-iat>MAX)拒绝(L8)', vRaw(rawSign({ ...base(), exp: NOW + MAX_PRIVACY_AUTHZ_TTL_SEC + 1 }, keyA.kid, keyA.privateKeyPem)) === null);
A('iat<=0 拒绝(L1)', vRaw(rawSign({ ...base(), iat: 0, exp: 300 }, keyA.kid, keyA.privateKeyPem)) === null);
A('exp<=iat 拒绝(L1)', vRaw(rawSign({ ...base(), iat: NOW, exp: NOW }, keyA.kid, keyA.privateKeyPem)) === null);
A('future-iat(时钟超前>允许偏移)拒绝(L1)', vRaw(rawSign({ ...base(), iat: NOW + 301, exp: NOW + 601 }, keyA.kid, keyA.privateKeyPem)) === null);
A('payload=null 拒绝(fail-closed,M5)', vRaw(rawSign(null as unknown as object, keyA.kid, keyA.privateKeyPem)) === null);

// H1/M7：sign 侧 fail-closed 校验（空 targets / 非法 kind / resource 含 ':'/'\n' / 非 64-hex / 非法 kid / 超长 actor / 非法 purpose / nowSec 非整数）。
const signErr = (fn: () => unknown): boolean => { try { fn(); return false; } catch (e) { return typeof (e as Error & { code?: unknown }).code === 'string'; } };
const signInput = { privateKeyPem: keyA.privateKeyPem, kid: keyA.kid, actor: 'u', owner: 'u', interview: 'i', purpose: 'interview_data_erasure' as const, privacyEpoch: 1, targets: TARGETS, nowSec: NOW, ttlSec: 60 };
A('sign 拒绝空 targets(H1)', signErr(() => signPrivacyAuthorizationSnapshot({ ...signInput, targets: [] })));
A('sign 拒绝非法 kind(H1)', signErr(() => signPrivacyAuthorizationSnapshot({ ...signInput, targets: [{ kind: 'evil_sink', resource: 'a'.repeat(64) }] })));
A('sign 拒绝 resource 含 ":"(H1)', signErr(() => signPrivacyAuthorizationSnapshot({ ...signInput, targets: [{ kind: 'oss', resource: 'a'.repeat(31) + ':' + 'a'.repeat(32) }] })));
A('sign 拒绝 resource 含 "\\n"(H1)', signErr(() => signPrivacyAuthorizationSnapshot({ ...signInput, targets: [{ kind: 'oss', resource: 'a'.repeat(31) + '\n' + 'a'.repeat(32) }] })));
A('sign 拒绝非 64-hex resource(H1)', signErr(() => signPrivacyAuthorizationSnapshot({ ...signInput, targets: [{ kind: 'oss', resource: 'not-hex' }] })));
A('sign 拒绝非法 kid 格式(M7)', signErr(() => signPrivacyAuthorizationSnapshot({ ...signInput, kid: 'bad kid!' })));
A('sign 拒绝超长 actor(>128,M6)', signErr(() => signPrivacyAuthorizationSnapshot({ ...signInput, actor: 'x'.repeat(129) })));
A('sign 拒绝非法 purpose(M7)', signErr(() => signPrivacyAuthorizationSnapshot({ ...signInput, purpose: 'forge_purpose' as never })));
A('sign 拒绝 nowSec 非安全整数(M7)', signErr(() => signPrivacyAuthorizationSnapshot({ ...signInput, nowSec: NOW + 0.5 })));
let epochCode: string | undefined;
try { signPrivacyAuthorizationSnapshot({ ...signInput, privacyEpoch: 0 }); } catch (e) { epochCode = (e as Error & { code?: string }).code; }
A('sign 错误带 code 且统一前缀(M10)', epochCode === 'privacy_authorization_epoch_invalid');

// H1：跨 kind/resource 乱序 digest 不变（与 SQL string_agg ORDER BY sink,resource_hmac 同构）。
A('digest 跨 kind/resource 乱序不变(H1)', canonicalTargetSetDigest([
  { kind: 'redis', resource: 'c'.repeat(64) },
  { kind: 'checkpoint_rows', resource: 'a'.repeat(64) },
  { kind: 'oss', resource: 'b'.repeat(64) },
]) === digest);

// M6 跨侧 pin：contracts 契约常量与 domain 实现常量逐值相等。任一侧单独改动即 FAIL（漂移在
// 这里显式暴露，而非等运行期“漂移=拒绝”——签名/验签并不比对 contracts 侧常量）。
A('M6 跨侧: PRIVACY_AUTHZ_ISSUER 逐值相等', PRIVACY_AUTHZ_ISSUER === CONTRACT_ISSUER);
A('M6 跨侧: PRIVACY_AUTHZ_AUDIENCE 逐值相等', PRIVACY_AUTHZ_AUDIENCE === CONTRACT_AUDIENCE);
A('M6 跨侧: purpose 枚举逐值相等',
  CONTRACT_PURPOSES.length === PRIVACY_AUTHZ_PURPOSES.length
  && PRIVACY_AUTHZ_PURPOSES.every((p, i) => p === CONTRACT_PURPOSES[i]));
A('M6 跨侧: kid regex 逐值相等(source+flags)',
  PRIVACY_AUTHZ_KID_RE.source === CONTRACT_KID_RE.source && PRIVACY_AUTHZ_KID_RE.flags === CONTRACT_KID_RE.flags);
A('M6 跨侧: digest regex 逐值相等(source+flags)',
  PRIVACY_AUTHZ_DIGEST_RE.source === CONTRACT_DIGEST_RE.source && PRIVACY_AUTHZ_DIGEST_RE.flags === CONTRACT_DIGEST_RE.flags);

// INT-TRANSCRIPT-00 身份根分离：登录 HMAC（AUTH_SECRET）不得冒充删除授权 JWS。
const loginToken = signToken('user-1', 'auth-secret-reuse-probe', 600, NOW);
A('AUTH_SECRET 登录令牌不能当隐私 JWS 验签', vRaw(loginToken) === null);
A('AUTH_SECRET 字符串不能当 ECDSA 私钥签发', signErr(() => signPrivacyAuthorizationSnapshot({
  ...signInput, privateKeyPem: 'auth-secret-reuse-probe',
})));
A('模型网关 iss/aud 登录令牌形状不能当删除授权', vRaw(rawSign({
  ...base(), iss: 'meetwise-authz-v1', aud: 'meetwise-model-gateway', issuerId: 'meetwise-authz-v1',
}, keyA.kid, keyA.privateKeyPem)) === null);

console.log(`\n${fail === 0 ? '✓ PrivacyAuthorizationIssuer 密码学 全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
