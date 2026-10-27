/**
 * NHP-030-BOUND-01 · UC-E2E-030 残余面（BOUND · 时钟漂移/刷新轮换/长会话续命）· 三臂族隔离收据
 *
 * REQUEST: ai-docs/delivery/harness/clock-e2e-REQUEST.md §1（恰 1 case 三臂族 · EXEC 立项届值重 pin
 * base=origin/main b894cad88→tip 39cf555c4 并线 #149 nhp-c+#150 micro-batch2 · merge b0cb09b39）。
 * 需求源: e2e-scenarios.md:373（UC-030）· E3:382「过期判定一律以服务端时钟为准 · 不被客户端篡改时间
 * 绕过」· A3:384「篡改客户端时间不能延长会话」· TC-E2E-030-clock-drift:390 · case-matrix:50
 * NHP-030-BOUND-01 期望「过期判定一致；无 silent extend」。
 *
 * 臂族一 · 时钟漂移臂（C1–C6 · 缝 A packages/domain/src/auth.ts nowSec 双端注入 + 缝 B 守卫实钟）:
 *   C1 边界含等 ±1s 两向（:69/:71 exp=now+ttl 纯算术 · :95 `p.exp < nowSec` 严格小于=等值合法）
 *   C2 零宽过期窗（ttl=0 → verify(t0) 非 null · verify(t0+1) null · 无 grace 无容差）
 *   C3 钟偏单调一致（nowSec ∈ {t0−86400,t0,t0+99,t0+100,t0+101} 判定单调 · 客户端钟偏在域函数面零额外效应）
 *   C4 无 silent extend（仅改 exp 重编 base64url 不重签 → :92 HMAC null + HTTP 401 invalid_token）
 *   C5 错误码优先序（过期+已吊销叠合 → exp 面 :87-91 先 throw → 401 invalid_token 非 session_revoked）
 *   C6 kid 守卫伴行（错 kid :96 null + HTTP 401 invalid_token · neg-auth 5A-1 簇③既有两臂 · Ban 互代）
 * 臂族二 · 刷新轮换臂（R1–R5 · 缝 C 签发双产点 auth-session.ts:39-49 + profile.service.ts:161-162 真 HTTP）:
 *   R1 双 login 轮换并存（jti 相异 + auth_user_session 恰 2 行均未吊销 + 两令牌 /profile 均 200）
 *   R2 改密回签续命（200 {changed:true,token} · 新令牌 200 · 新 jti 行落账 · 行内 pwd_epoch=自增后代次）
 *   R3 改密吊销双保险（旧 jti 行 revoked_at 仍 IS NULL=行保留审计 · 旧令牌 401 session_revoked=:95 代次拒绝）
 *   R4 logout 幂等双面（执行顺序钉 (a)→(b)：(a) service 级 revokeSession 二次 true,false；(b) (a) 后该
 *      jti 所有传输口恒 401 session_revoked·(b) 不断言首次 POST 状态码——r2 席2 P2 消歧句随卷）
 *   R5 jti 唯一（signup+login+改密回签三签发 jti 互异 + 恰 3 行 · 0169 jti PRIMARY KEY+randomUUID 对码）
 * 臂族三 · 长会话续命臂（L1–L3 · 背签注入缝 + 产品守卫实钟）:
 *   L1 3 天停顿续命（背签 exp=now+4d → 200 · 7d TTL 内真行使 · 服务端钟权威）
 *   L2 超 TTL 一致拒（背签 exp=now−1d → 401 invalid_token · 令牌面 8d>7d 一致 · E1 abandoned 面≠本臂）
 *   L3 续命/轮换无重复扣费（产品链 consent→resume→begin 202 恰扣 1 · 换异 jti 同户令牌读同场 200 ·
 *      availableUnits 净变恰 −1 · E2 幂等键守域内对码 · 零 SSE）
 *
 * 夹具豁免（REQUEST §5 枚举·如实申明·枚举外零裸 INSERT）: 仅 ② auth_user_session 行种子（L1/L2 背签
 * 必需 · auth-session.ts:43 签发侧 Math.floor(Date.now()/1000) 实钟不可注入的诚实替代）。consent 走产品
 * 路径 POST /privacy/consent、简历走产品路径 POST /resume、面试壳走产品路径 POST /interview、吊销走
 * 产品路径 POST /auth/logout（R4 (a) 面为 revokeSession 服务原语直证=REQUEST §1 R4 明钉）。
 *
 * Evidence layer: isolated 真 PG（run-e2e-isolated 全迁移链）+ Nest createApp + listen(0) + fetch 真
 * 产品 HTTP（沿 uc-e2e-030-nhp-fault.proof.ts 同壳）+ domain 纯函数直接 import（缝 A 臂零 DB 面）。
 * 零模型 · 零外呼（MODEL_API_KEY / DASHSCOPE_API_KEY / DASHSCOPE_COMPAT_BASE_URL 不在场即断言）·
 * est live=0。EXIT0 = 具名 case 真证据 ≠ covered ≠ suite green；§1.0.1 :128 行值零翻动（FAULT gap/
 * BOUND partial 列值不动 · 升格权归协调方）；case-matrix :50 措辞 case-only 保留；coveredCount=8 不变。
 *
 * 非替代申明: neg:auth（令牌负例/轮换既有面）· uc030:nhp-fault（E1 abandoned/双触发幂等/额度恰一次）
 * · full.e2e（无 Key blocked 层）= 旁证互不替代 · Ban 互借关列 · EXIT0≠covered。
 *
 *   pnpm uc030:nhp-bound:prove             （root · isolated）
 *   pnpm -C apps/api prove:uc030-nhp-bound （raw; needs isolated DATABASE_URL from the runner）
 */
import { randomUUID } from 'node:crypto';
import { assertIsolatedTestTarget, asPrincipal, availableUnits, createPool, provisionRuntimeLogin } from '@meetwise/db';
import type { Client } from '@meetwise/db';
import { signToken, verifyTokenFull } from '@meetwise/domain';
import { revokeSession, SESSION_TTL_SEC } from '../src/platform/auth-session.ts';

let failures = 0;
let total = 0;
const A = (name: string, ok: boolean) => { total++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures += 1; };
const E = (id: string, data: unknown) => console.log(`EVIDENCE ${id} ${JSON.stringify(data)}`);
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

console.log('NHP-030-BOUND-01 UC-E2E-030 残面 prove（C1-C6 时钟漂移 + R1-R5 刷新轮换 + L1-L3 长会话续命）');
console.log('Pins: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · :128 行值零翻动 · :50 case-only 保留 · EXIT0≠covered');
console.log('夹具豁免: 仅② auth_user_session 行种子（L1/L2 背签必需·具名）· 其余全产品路径');

// ── 零模型面（REQUEST §1 env 三键具名·egress 预置登记三目同 commit 承登·provider-egress-inventory.mjs 口径）──
const keysOnEntry = ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']
  .filter((k) => String(process.env[k] ?? '').trim().length > 0);
for (const k of ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']) delete process.env[k];
A('L0 零模型: 三键入场均不在场（零外呼零 Key·est live=0）', keysOnEntry.length === 0);

const S = Date.now().toString(36);
const AUTH_SECRET = `uc030-nhp-bound-auth-${S}`;
const role = `uc030_nhp_bound_${process.pid}`;
const admin = createPool();

type Res = { status: number; body: Record<string, unknown> };

/** 缝 A 纯算术面: 令牌 payload 解码（base64url 段 · 与 auth.ts:70-73 编码形互逆）。 */
const payloadOf = (token: string): Record<string, unknown> =>
  JSON.parse(Buffer.from(token.slice(0, token.indexOf('.')), 'base64url').toString('utf8')) as Record<string, unknown>;
const b64urlJson = (payload: Record<string, unknown>): string =>
  Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
const jtiOf = (token: string): string => String(payloadOf(token)['jti'] ?? '');

const sessionRows = async (uid: string): Promise<Array<Record<string, unknown>>> =>
  (await admin.query(
    'SELECT jti, revoked_at, pwd_epoch FROM auth_user_session WHERE user_id=$1 ORDER BY created_at, jti', [uid],
  )).rows as Array<Record<string, unknown>>;
const balOf = (owner: string): Promise<number> =>
  asPrincipal(admin, owner, (c) => availableUnits(c, owner));

/** 夹具豁免②具名: auth_user_session 行种子（L1/L2 背签必需 · auth-session.ts:43 签发实钟不可注入的诚实替代）。 */
async function seedSessionRow(jti: string, uid: string, pwdEpoch = 0): Promise<void> {
  await admin.query('INSERT INTO auth_user_session(jti, user_id, pwd_epoch) VALUES ($1,$2,$3)', [jti, uid, pwdEpoch]);
}
/** revokeSession 的 DbService 形参适配（pool → asPrincipal 委托 · api-harden-shared-state dbFromPool 同形）。 */
const dbLike = {
  asPrincipal: <T>(user: string, fn: (c: Client) => Promise<T>): Promise<T> => asPrincipal(admin, user, fn),
} as unknown as Parameters<typeof revokeSession>[0];

async function main(): Promise<void> {
  await assertIsolatedTestTarget(admin);
  await provisionRuntimeLogin(admin, { roleName: role, password: `${role}-pw` });
  delete process.env.AUTH_DEV_HEADER;
  process.env.NODE_ENV = 'test';
  process.env.WEB_ORIGIN = 'https://web.example.test';
  process.env.AUTH_SECRET = AUTH_SECRET;
  process.env.RESUME_ENC_KEY = 'uc030-nhp-bound-resume-enc-key';
  process.env.RESUME_HASH_SECRET = 'uc030-nhp-bound-resume-hash-secret';
  process.env.OCR_ENABLED = '0';
  process.env.PGUSER = role;
  process.env.PGPASSWORD = `${role}-pw`;
  // signup:ip 桶 E2E 覆写口（auth.service:11-12 产品明钉「RL_SIGNUP_IP(容量,速率)为独立限流段覆写口，
  // 仅 perf/E2E 启动档放宽并显式落档」）: 本 proof 十 signup（C4-C6/R1/R2/R4/R5/L1-L3 各独立 principal·
  // 臂间零耦合）超缺省突发 10 · 仅本测试进程窗·零配置文件改。模块载入期常量 → 必须先于 main.ts 动态 import。
  process.env.RL_SIGNUP_IP = '100,1';

  // 真 HTTP 口（createApp + listen(0) + fetch · uc-e2e-030-nhp-fault 同壳）
  const { createApp } = await import('../src/main.ts');
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const call = async (method: string, path: string, headers: Record<string, string> = {}, body?: unknown): Promise<Res> => {
    const h: Record<string, string> = { ...headers };
    if (body !== undefined) h['content-type'] = 'application/json';
    const res = await fetch(base + path, {
      method, headers: h, body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let parsed: Record<string, unknown> = {};
    try { parsed = text ? (JSON.parse(text) as Record<string, unknown>) : {}; } catch { parsed = {}; }
    return { status: res.status, body: parsed };
  };
  const signup = async (tag: string): Promise<{ userId: string; token: string }> => {
    const r = await call('POST', '/auth/signup', {}, {
      email: `uc030-nhp-bound-${tag}-${process.pid}@example.test`, password: `uc030-${tag}-pw-2026`, role: 'candidate',
    });
    if (r.status !== 200 || typeof r.body['userId'] !== 'string' || typeof r.body['token'] !== 'string')
      throw new Error(`uc030_signup_failed:${tag}:${r.status}`);
    return { userId: r.body['userId'] as string, token: r.body['token'] as string };
  };
  const login = async (tag: string, email: string, password: string): Promise<string> => {
    const r = await call('POST', '/auth/login', {}, { email, password });
    if (r.status !== 200 || typeof r.body['token'] !== 'string') throw new Error(`uc030_login_failed:${tag}:${r.status}`);
    return r.body['token'] as string;
  };
  const bearer = (t: string) => ({ authorization: `Bearer ${t}` });
  const profile = (t: string) => call('GET', '/profile', bearer(t));

  // ══ 臂族一 · 时钟漂移臂（C1–C6）══
  section('C1 · 边界含等 ±1s 两向（auth.ts:69/:71/:95 对码）');
  const T0 = 1_700_000_000;
  const c1u = `clock-c1-${S}`;
  const c1tok = signToken(c1u, AUTH_SECRET, 100, T0);
  A('C1 exp 算术: signToken(u,s,100,t0) → payload.exp = t0+100（:71 纯算术无 grace）', payloadOf(c1tok)['exp'] === T0 + 100);
  A('C1 verify(exp 等值 now=t0+100) → 非 null（:95 严格小于·等值不拒）', verifyTokenFull(c1tok, AUTH_SECRET, T0 + 100) !== null);
  A('C1 verify(now=t0+101) → null（越界恰 1s 即拒·两向界各一断言）', verifyTokenFull(c1tok, AUTH_SECRET, T0 + 101) === null);

  section('C2 · 零宽过期窗（ttl=0 · 无 grace 秒无漂移容差）');
  const c2tok = signToken(`clock-c2-${S}`, AUTH_SECRET, 0, T0);
  A('C2 exp 算术: ttl=0 → payload.exp = t0（零宽窗）', payloadOf(c2tok)['exp'] === T0);
  A('C2 verify(now=t0) → 非 null（等值仍合法·与 C1 同一判定面）', verifyTokenFull(c2tok, AUTH_SECRET, T0) !== null);
  A('C2 verify(now=t0+1) → null（+1s 即拒·过期判定一致）', verifyTokenFull(c2tok, AUTH_SECRET, T0 + 1) === null);

  section('C3 · 钟偏单调一致（判定是 nowSec 的纯单调函数·E3 服务端钟权威域函数面对码）');
  const c3tok = signToken(`clock-c3-${S}`, AUTH_SECRET, 100, T0);
  const c3Cases: Array<{ delta: number; live: boolean }> = [
    { delta: -86400, live: true }, { delta: 0, live: true }, { delta: 99, live: true }, { delta: 100, live: true }, { delta: 101, live: false },
  ];
  for (const cs of c3Cases) {
    const got = verifyTokenFull(c3tok, AUTH_SECRET, T0 + cs.delta) !== null;
    A(`C3 注入 nowSec=t0${cs.delta >= 0 ? '+' : ''}${cs.delta}s → 判定${cs.live ? '有效' : 'null'}（单调·快/慢钟偏零额外效应）`, got === cs.live);
  }

  section('C4 · 无 silent extend（仅改 exp 重编 base64url 不重签 → HMAC 拒 · 篡改目标=仅延长会话）');
  const c4 = await signup('c4');
  const c4parts = c4.token.split('.');
  const c4payload = payloadOf(c4.token);
  c4payload['exp'] = (c4payload['exp'] as number) + 100_000;
  const c4tampered = `${b64urlJson(c4payload)}.${c4parts[1]}`;
  A('C4 域函数面: 仅改 exp 不重签 → verifyTokenFull null（:92 timingSafeEqual fail-closed）',
    verifyTokenFull(c4tampered, AUTH_SECRET, Math.floor(Date.now() / 1000)) === null);
  const c4http = await profile(c4tampered);
  A('C4 传输面: 篡改体 GET /profile → 401 invalid_token（guard :87-91·TC-E2E-030-clock-drift 替身）',
    c4http.status === 401 && c4http.body['error'] === 'invalid_token');

  section('C5 · 错误码优先序（过期+已吊销叠合 → exp 面先于会话查）');
  const c5 = await signup('c5');
  const c5jti = jtiOf(c5.token);
  const c5out = await call('POST', '/auth/logout', bearer(c5.token));
  A('C5 前置: 产品 logout 真吊销 → 200 {loggedOut:true, revoked:true}（jti 面落账）',
    c5out.status === 200 && c5out.body['loggedOut'] === true && c5out.body['revoked'] === true);
  const c5expired = signToken(c5.userId, AUTH_SECRET, -30, Math.floor(Date.now() / 1000), 0, { jti: c5jti });
  const c5http = await profile(c5expired);
  A('C5 叠合臂: 过期+已吊销同 jti → 401 invalid_token 非 session_revoked（:87-91 先 throw·:98 恒不达·优先序对码）',
    c5http.status === 401 && c5http.body['error'] === 'invalid_token');

  section('C6 · kid 守卫伴行臂（错 kid :96 拒 · neg-auth 5A-1 簇③既有两臂·Ban 互代仅 C 族回归伴行）');
  const c6 = await signup('c6');
  const c6wrongKid = signToken(c6.userId, `${AUTH_SECRET}-other-kid-secret`, 3600, Math.floor(Date.now() / 1000));
  A('C6 域函数面: 他钥 kid 令牌对本钥 verify → null（:96 kid 错配拒）',
    verifyTokenFull(c6wrongKid, AUTH_SECRET, Math.floor(Date.now() / 1000)) === null);
  const c6http = await profile(c6wrongKid);
  A('C6 传输面: 错 kid → 401 invalid_token（全候选钥不符同码抗探测）',
    c6http.status === 401 && c6http.body['error'] === 'invalid_token');

  // ══ 臂族二 · 刷新轮换臂（R1–R5 · 真 HTTP 产品路径）══
  section('R1 · 双 login 轮换并存（多会话并存·neg-auth logout 段未断言形状·可分）');
  const r1pw = 'uc030-r1-pw-2026';
  const r1 = await signup('r1');
  const r1t2 = await login('r1-2nd', `uc030-nhp-bound-r1-${process.pid}@example.test`, r1pw);
  const r1j1 = jtiOf(r1.token);
  const r1j2 = jtiOf(r1t2);
  A('R1 两次 login 均发新令牌（signup+login 双产点第一处·auth.service:120 走 issueSessionTokenOrThrow）', r1t2.length > 0 && r1j2.length > 0);
  A('R1 两令牌 jti 相异（randomUUID :42）', r1j1 !== r1j2);
  const r1rows = await sessionRows(r1.userId);
  A('R1 auth_user_session 恰 2 行（签发与 INSERT 同请求原子·:44-47）', r1rows.length === 2);
  A('R1 两行均 revoked_at IS NULL（并存未吊销）', r1rows.every((r) => r['revoked_at'] === null));
  A('R1 令牌1 GET /profile → 200', (await profile(r1.token)).status === 200);
  A('R1 令牌2 GET /profile → 200（异 jti 同户双活）', (await profile(r1t2)).status === 200);

  section('R2 · 改密回签续命（产点第二处 profile.service:161-162 对码）');
  const r2pw = 'uc030-r2-pw-2026';
  const r2 = await signup('r2');
  const r2old = r2.token;
  const r2chg = await call('POST', '/profile/change-password', bearer(r2old), { oldPassword: r2pw, newPassword: 'uc030-r2-new-pw-2026' });
  A('R2 change-password → 200 且响应体 {changed:true, token}（:162 回签令牌出响应体=续命面）',
    r2chg.status === 200 && r2chg.body['changed'] === true && typeof r2chg.body['token'] === 'string');
  const r2new = String(r2chg.body['token'] ?? '');
  A('R2 新令牌 GET /profile → 200（neg-auth:360-369 只钉旧令牌死·新令牌活面=本臂主断言）', (await profile(r2new)).status === 200);
  const r2rows = await sessionRows(r2.userId);
  A('R2 新 jti 行落账（1→2 恰 +1 行）', r2rows.length === 2);
  A('R2 新令牌 pe 与新行 pwd_epoch=自增后代次 1（单语句原子 :154-156）',
    payloadOf(r2new)['pe'] === 1 && r2rows.every((r) => Number(r['pwd_epoch']) === 1 || Number(r['pwd_epoch']) === 0) &&
    r2rows.filter((r) => Number(r['pwd_epoch']) === 1).length === 1);

  section('R3 · 改密吊销双保险（行保留审计 + 代次拒绝 · 无 DELETE 形）');
  const r2oldJti = jtiOf(r2old);
  const r3rows = await sessionRows(r2.userId);
  A('R3 旧 jti 行 revoked_at 仍 IS NULL（:159-160 注记+revokeSession 仅 logout 调·行保留供审计）',
    r3rows.find((r) => r['jti'] === r2oldJti)?.['revoked_at'] === null);
  const r3old = await profile(r2old);
  A('R3 旧令牌 → 401 session_revoked（guard :95 代次拒绝·先于 :98 会话查·吊销由代次机械承担）',
    r3old.status === 401 && r3old.body['error'] === 'session_revoked');

  section('R4 · logout 幂等双面（执行顺序钉 (a)→(b)：(a) 后该 jti 所有传输口恒 401·(b) 不断言首次 POST 状态码——r2 席2 P2 消歧句随卷）');
  const r4 = await signup('r4');
  const r4jti = jtiOf(r4.token);
  const r4a1 = await revokeSession(dbLike, r4.userId, r4jti);
  const r4a2 = await revokeSession(dbLike, r4.userId, r4jti);
  A('R4(a) service 级 revokeSession 第 1 次 → true（真吊销 1 行·:56-66）', r4a1 === true);
  A('R4(a) 同 jti 第 2 次 → false（WHERE revoked_at IS NULL 二次 0 行如实·幂等面 unowned 真 unowned）', r4a2 === false);
  const r4b = await call('POST', '/auth/logout', bearer(r4.token));
  A('R4(b) (a) 后传输面 POST /auth/logout → 401 session_revoked（guard :98-99 先于 handler·(a) 已吊销故守卫即拒·不断言首次 POST 状态码）',
    r4b.status === 401 && r4b.body['error'] === 'session_revoked');

  section('R5 · jti 唯一性（三签发互异 · 0169 jti PRIMARY KEY 对码）');
  const r5pw = 'uc030-r5-pw-2026';
  const r5 = await signup('r5');
  const r5t2 = await login('r5-2nd', `uc030-nhp-bound-r5-${process.pid}@example.test`, r5pw);
  const r5chg = await call('POST', '/profile/change-password', bearer(r5t2), { oldPassword: r5pw, newPassword: 'uc030-r5-new-pw-2026' });
  const r5t3 = String(r5chg.body['token'] ?? '');
  const r5jtis = [jtiOf(r5.token), jtiOf(r5t2), jtiOf(r5t3)];
  A('R5 signup+login+改密回签三签发 jti 互异（randomUUID :41 对码）', new Set(r5jtis).size === 3);
  A('R5 auth_user_session 恰 3 行（jti PRIMARY KEY 无碰撞·行形状=签发数）', (await sessionRows(r5.userId)).length === 3);

  // ══ 臂族三 · 长会话续命臂（L1–L3 · 背签注入缝 + 产品守卫实钟）══
  section('L1 · 3 天停顿续命（背签 exp=now+4d → 200 · 7d TTL 内真行使·服务端钟权威）');
  const l1 = await signup('l1');
  const l1jti = randomUUID();
  await seedSessionRow(l1jti, l1.userId, 0);
  const l1now = Math.floor(Date.now() / 1000);
  const l1tok = signToken(l1.userId, AUTH_SECRET, SESSION_TTL_SEC, l1now - 259_200, 0, { jti: l1jti });
  A('L1 夹具自检: auth_user_session 行种子在位且未吊销（豁免②具名）',
    (await sessionRows(l1.userId)).find((r) => r['jti'] === l1jti)?.['revoked_at'] === null);
  A('L1 背签算术: exp − 实钟 = +345600s（=4 天·7d TTL 内 3 天前签发）',
    (payloadOf(l1tok)['exp'] as number) - l1now === SESSION_TTL_SEC - 259_200);
  A('L1 GET /profile → 200（guard :85 实钟判窗内·背签臂经真守卫行使=服务端钟权威面）', (await profile(l1tok)).status === 200);

  section('L2 · 超 TTL 一致拒（背签 exp=now−1d → 401 invalid_token · 令牌面 8d>7d 一致）');
  const l2 = await signup('l2');
  const l2jti = randomUUID();
  await seedSessionRow(l2jti, l2.userId, 0);
  const l2now = Math.floor(Date.now() / 1000);
  const l2tok = signToken(l2.userId, AUTH_SECRET, SESSION_TTL_SEC, l2now - 8 * 86_400, 0, { jti: l2jti });
  A('L2 夹具自检: 行种子同形在位（401 归因纯令牌面 exp·非会话缺失）',
    (await sessionRows(l2.userId)).find((r) => r['jti'] === l2jti)?.['revoked_at'] === null);
  A('L2 背签算术: exp = 实钟 − 86400 < now（8d 前签发·7d TTL）', (payloadOf(l2tok)['exp'] as number) === l2now - 86_400);
  const l2http = await profile(l2tok);
  A('L2 GET /profile → 401 invalid_token（一致拒·非 session_revoked 非 account_inactive·E1 面≠本臂）',
    l2http.status === 401 && l2http.body['error'] === 'invalid_token');

  section('L3 · 续命/轮换无重复扣费（产品链 consent→resume→begin 恰扣 1 · 异 jti 同户读同场 200 零重扣）');
  const l3pw = 'uc030-l3-pw-2026';
  const l3 = await signup('l3');
  const l3t2 = await login('l3-2nd', `uc030-nhp-bound-l3-${process.pid}@example.test`, l3pw);
  const l3base = await balOf(l3.userId);
  A('L3 前置: 两令牌异 jti 同户 + 基线额度可读（signup 试给桶）', jtiOf(l3.token) !== jtiOf(l3t2) && l3base > 0);
  const l3consent = await call('POST', '/privacy/consent', bearer(l3t2), { purpose: 'resume_processing' });
  A('L3 产品 consent → 200（R1 第二令牌走产品链·uc-e2e-001-nhp-adv:264 先例形）', l3consent.status === 200);
  const l3resume = await call('POST', '/resume', bearer(l3t2), {
    text: `uc030 clock-bound L3 fixture resume text for cross-session read arm ${S}: senior backend engineer with Go and Kubernetes production experience.`,
  });
  A('L3 产品 POST /resume 文本 → 200 且 status=ingested（owned∧ingested）',
    l3resume.status === 200 && l3resume.body['status'] === 'ingested' && typeof l3resume.body['resumeId'] === 'string');
  const l3resumeId = String(l3resume.body['resumeId'] ?? '');
  const l3iv = await call('POST', '/interview', bearer(l3t2));
  const l3ivId = String(l3iv.body['interviewId'] ?? '');
  A('L3 产品 POST /interview 壳 → 200 {interviewId, status:"created", reused:false}（created 空壳·begin 才扣额度）',
    l3iv.status === 200 && l3ivId.length > 0 && l3iv.body['status'] === 'created' && l3iv.body['reused'] === false);
  const l3beginHeaders: Record<string, string> = bearer(l3t2);
  l3beginHeaders['resume-id'] = l3resumeId;
  const l3begin = await call('POST', `/interview/${l3ivId}/begin`, l3beginHeaders);
  A('L3 产品 begin → 202（真产品口 · 恰扣 1 单位面·EXEC 届时路由亲证: interview.controller @Post(":id/begin") @HttpCode(202)）', l3begin.status === 202);
  const l3read = await call('GET', `/interview/${l3ivId}`, bearer(l3.token));
  A('L3 换异 jti 同户令牌（signup 原令牌）读同场面试 → 200（重注入续跑·RLS 只己见）', l3read.status === 200);
  const l3after = await balOf(l3.userId);
  E('L3-NET', { base: l3base, after: l3after });
  A('L3 availableUnits 净变恰 −1（不因续命/轮换重扣·E2 幂等键守域内对码·零 SSE）', l3after === l3base - 1);

  // ── 终局 ──
  console.log(`\n${failures === 0
    ? `✓ NHP-030-BOUND-01 全臂绿（${total}/${total}）· C=17 R=17 L=13 + L0=1 · EXIT=0 = 具名 case 真证据 ≠ covered`
    : `✗ ${failures}/${total} NHP-030-BOUND-01 断言失败`}`);
  console.log('PIN: C/R/L 三臂族逐条对 §0.2 缝锚 · 任一臂与对码期望不符 → §8 机制不满足停上报（Ban retry-to-green）');
  console.log('PIN: 静默刷新分支=码面无可测注入缝停止条件登记（§1.3·不入臂·先接线后 prove）');
  console.log('PIN: 非替代 — neg:auth / uc030:nhp-fault / full.e2e 旁证互不替代 · Ban 互借关列');
  console.log('PIN: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · :128 行值零翻动 · :50 case-only 保留 · EXIT0≠covered');
  await admin.end();
  process.exit(failures ? 1 : 0);
}

main().catch((e: unknown) => {
  console.error('✗', (e as Error)?.message ?? e);
  process.exit(1);
});
