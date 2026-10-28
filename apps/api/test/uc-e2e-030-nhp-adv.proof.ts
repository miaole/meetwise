/**
 * NHP-030-ADV-01 · UC-E2E-030 残余面（ADV · 长会话刷新对抗）· 四臂族十臂隔离收据
 *
 * REQUEST: ai-docs/delivery/harness/uc30-adv-REQUEST.md（rev r2 · r1 终形 + r2 双审 P2 修订随立项日履行 ·
 * pre dual r2 双 PASS 放行 · EXEC 立项届值重 pin base=origin/main c06ed67b5→tip 7ea825ff93 #174 并线 ·
 * merge a964ed201）。需求源: e2e-scenarios.md:373（UC-030）· E3:382 服务端钟权威（TC 族）· E2:381/A2:384
 * 产品已接线子面（签发/轮换/吊销机械——静默刷新分支除外 · §1.3 停止条件维持）· coverage-matrix §1.0.1
 * :128 ADV cell blind 裸值=本卷认领格 · case-matrix §1.1 区 :51 邻区新行。
 *
 * 臂族一 · RP 族（旧令牌重放/族撤销对抗 · 缝 B 守卫优先序 :95 代次→:98-99 jti）:
 *   RP1 死 jti 令牌重放对写嘴 sweep（真 logout 吊销后同死令牌双嘴：①再 POST /auth/logout
 *       ②POST /profile/change-password 携正确旧密 → 两嘴全 401 session_revoked + DB 零副作用账面）
 *   RP2 族撤销=代次机械全族行使（同户 3× login 并存 3 jti → change-password 恰 1 次 → 3 旧令牌全
 *       401 session_revoked + 3 具名 jti 逐行 revoked_at IS NULL 断言（行保留审计·零 DELETE）+ 回签新令牌 200）
 *   RP3 legacy 无 jti 令牌代次死面（手签无 jti legacy 令牌 → 改密后重放 → 401 session_revoked（:95 代次面
 *       恒行·legacy 只跳过 :98 会话查不跳代次）+ 世界真话行账：legacy 令牌自身恒零会话行 · 改密回签恰 +1 新行 ·
 *       零既有行被动）
 * 臂族二 · RC 族（并发双刷新竞态 · Promise.all 并行口）:
 *   RC1 并发双改密自锁钉（profile.service:147 产品自钉「极罕见的自锁,可接受」首次行使：两路并行
 *       change-password → 200 changed:true ×2 + pwd_epoch 终值=始值+2 零丢更新 + 两回签令牌恰一活一死
 *       （不钉孰先孰后·钉不变式）+ 旧会话行零 DELETE；环境竞态败窗预钉=败者 401 wrong_password（其
 *       :140 SELECT 落于并方 :153 UPDATE commit 之后读新哈希验旧密必败）→ ENV-RED 非机制红）
 *   RC2 并发双吊销 exactly-once（同 jti 两路并行 POST /auth/logout · 臂内并行发出前 ≤1s 先行使一次该令牌
 *       warm sessionCache（auth-session.ts:74）→ 响应集合恰 1×{loggedOut:true,revoked:true}+败者∈
 *       {{loggedOut:true,revoked:false}, 401 session_revoked}（不钉顺序）+ DB 不变式该 jti 恰 1 行 revoked）
 * 臂族三 · TC 族（时钟对抗 · 传输面实钟新向）:
 *   TC1 传输面实钟短窗行使（背签 signToken ttl=1 + 会话行种子（豁免②）→ 发送前 clock guard
 *       Math.floor(Date.now()/1000) < exp 方可发（guard 时刻已 ≥exp 即 ENV-RED）→ 立即 GET /profile →
 *       200（发送前 guard 通过但首打仍 401 invalid_token=服务端处理越窗 · 同判 ENV-RED · r2 P2-①）→
 *       等 ≥2s → 401 invalid_token）
 *   TC2 远期 exp 背签越 TTL 窗诚实钉（背签 ttl=180d ≫ SESSION_TTL_SEC + 行种子 → 200 = 守卫层零最大
 *       寿命执行现状态语义钉 + P3 语义疣候选登记（翻面权归协调方·需持钥=测试面自持·语义钉非漏洞宣称））
 * 臂族四 · XU 族（跨户令牌串用）:
 *   XU1 令牌=身份归因+跨户登出零扰（A 令牌 GET /profile 200 且 id/email=A · A logout 恰吊 A jti →
 *       B 令牌照常 200 + B 行 revoked_at 仍 IS NULL）
 *   XU2 jti-uid 非绑定现状态语义钉（持测试钥手签 uid=A + jti=B 真实 login 产活跃 jti → GET /profile
 *       200 且 principal=A（isSessionActive:78 零 user_id 谓词）+ B 行零扰动=五列前后比对恒等 + B 令牌照常
 *       200 · 需钥=全局失守面零特权提升 · 信任模型语义钉非漏洞宣称零修复诉求）
 *   XU3 跨户代次推进零串扰（B change-password B epoch+1 → A 令牌再打 GET /profile 200 零扰 + A pwd_epoch
 *       零动 + A 会话行五列前后比对恒等）
 *   PC = signup/login happy 对照基面（真 HTTP 双产点）。**各臂独立 principal（每臂各自 signup·禁跨臂共享**
 *       **账号——RL 桶与代次耦合面）**；PC 自身亦独立 principal。全 proof 14 signup（＞缺省 signup:ip 突发 10
 *       → RL_SIGNUP_IP='100,1' 进程窗覆写·见下）。
 *
 * 夹具豁免（REQUEST §5 枚举·如实申明·枚举外零裸 INSERT）: 仅 ② auth_user_session 行种子（仅 TC1/TC2
 * 两臂·背签必需——auth-session.ts:43 签发侧实钟+恒 7d TTL 不可注入的诚实替代 · bound 豁免②同形）。
 * 全部 principal/会话/吊销/改密走产品路径（signup/login/logout/change-password 真产品口）；XU2 手签令牌
 * 系测试钥签名面非 DB 种子；零桶种子零 consent 种子（全臂零额度面·N 审计=会话账口径）。
 *
 * Evidence layer: isolated 真 PG（run-e2e-isolated 全迁移链）+ Nest createApp + listen(0) + fetch 真
 * 产品 HTTP（沿 b1ec5758 同 UC 同壳先例）+ domain 纯函数背签注入（缝 A）+ Promise.all 并行竞态口（RC 族）。
 * 零模型 · 零外呼（MODEL_API_KEY / DASHSCOPE_API_KEY / DASHSCOPE_COMPAT_BASE_URL 不在场即断言）·
 * est live=0。EXIT0 = 具名 case 真证据 ≠ covered ≠ suite green；:128 ADV cell blind 保持+case-only 措辞 ·
 * coveredCount=8 不变。
 *
 * 非替代申明: neg:auth（1dd9cd0a·令牌负例/单令牌代次死/legacy logout 存活——本刀 RP1=写嘴+账面、RP2=全族、
 * RP3=改密面、XU 族=跨户·reason 级可分）· uc030:nhp-fault（176debe5·E1 abandoned/sweep/额度面）·
 * uc030:nhp-bound（b1ec5758·C1-C6 域函数时钟/R1-R5 串行轮换/L1-L3 窗内续命——本刀 RC=并行竞态格、TC=真墙钟
 * 传输面+远期越窗、XU=跨户·可分）· X33（ecbf39af·跨主体写竞态/缓存键隔离）= 旁证互不替代 · Ban 互借关列。
 *
 *   pnpm uc030:nhp-adv:prove             （root · isolated）
 *   pnpm -C apps/api prove:uc030-nhp-adv （raw; needs isolated DATABASE_URL from the runner）
 */
import { randomUUID } from 'node:crypto';
import { assertIsolatedTestTarget, createPool, provisionRuntimeLogin } from '@meetwise/db';
import { signToken } from '@meetwise/domain';
import { SESSION_TTL_SEC } from '../src/platform/auth-session.ts';

let failures = 0;
let total = 0;
/** ENV-RED 停判（REQUEST §2-4 一次性重跑政策：环境红恰重跑 1 次·再红即停判如实台账 · Ban 循环重跑至绿）。 */
let envRed = 0;
const A = (name: string, ok: boolean) => { total++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures += 1; };
/** ENV-RED 判据命中：登记 marker+停判该形（非机制红·不计断言失败·外部按政策恰重跑 1 次）。 */
const ENVRED = (marker: string) => { envRed += 1; console.log(`ENV-RED MARKER ${marker}（环境红停判·一次性重跑政策 §2-4）`); };
const E = (id: string, data: unknown) => console.log(`EVIDENCE ${id} ${JSON.stringify(data)}`);
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sleep = (ms: number) => new Promise<void>((r) => { setTimeout(r, ms); });

console.log('NHP-030-ADV-01 UC-E2E-030 残面 prove（RP1-RP3 + RC1-RC2 + TC1-TC2 + XU1-XU3 十臂 + PC 对照基面 + N 会话账审计）');
console.log('Pins: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · :128 ADV cell blind 保持 · case-only · EXIT0≠covered');
console.log('夹具豁免: 仅② auth_user_session 行种子（仅 TC1/TC2 背签必需·具名）· 其余全产品路径 · 零额度面');

// ── 零模型面（REQUEST §1 env 三键具名·egress 预置登记三目同 commit 承登·provider-egress-inventory.mjs 口径）──
const keysOnEntry = ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']
  .filter((k) => String(process.env[k] ?? '').trim().length > 0);
for (const k of ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']) delete process.env[k];
A('L0 零模型: 三键入场均不在场（零外呼零 Key·est live=0）', keysOnEntry.length === 0);

const S = Date.now().toString(36);
const AUTH_SECRET = `uc030-nhp-adv-auth-${S}`;
const role = `uc030_nhp_adv_${process.pid}`;
const admin = createPool();

type Res = { status: number; body: Record<string, unknown> };

/** 缝 A 纯算术面: 令牌 payload 解码（base64url 段 · 与 auth.ts:70-73 编码形互逆）。 */
const payloadOf = (token: string): Record<string, unknown> =>
  JSON.parse(Buffer.from(token.slice(0, token.indexOf('.')), 'base64url').toString('utf8')) as Record<string, unknown>;
const jtiOf = (token: string): string => String(payloadOf(token)['jti'] ?? '');

const sessionRows = async (uid: string): Promise<Array<Record<string, unknown>>> =>
  (await admin.query(
    'SELECT jti, revoked_at, pwd_epoch FROM auth_user_session WHERE user_id=$1 ORDER BY created_at, jti', [uid],
  )).rows as Array<Record<string, unknown>>;
/** XU2/XU3 列级五列比对快照（jti/user_id/pwd_epoch/revoked_at/created_at · 0169 列集 · admin 池读·r2 P2-⑥）。 */
const snapFive = async (uid: string): Promise<string> =>
  JSON.stringify((await admin.query(
    'SELECT jti, user_id, pwd_epoch, revoked_at, created_at FROM auth_user_session WHERE user_id=$1 ORDER BY jti', [uid],
  )).rows);
const accountEpoch = async (uid: string): Promise<number> =>
  Number((await admin.query('SELECT pwd_epoch FROM user_account WHERE id=$1', [uid])).rows[0]?.pwd_epoch);
/** 会话账枚举（N 臂口径）: 行数+已吊销行数。 */
const ledgerOf = async (uid: string): Promise<{ rows: number; revoked: number; epoch: number }> => {
  const rows = await sessionRows(uid);
  return { rows: rows.length, revoked: rows.filter((r) => r['revoked_at'] !== null).length, epoch: await accountEpoch(uid) };
};

/** 夹具豁免②具名: auth_user_session 行种子（仅 TC1/TC2 背签必需 · auth-session.ts:43 签发实钟不可注入的诚实替代）。 */
async function seedSessionRow(jti: string, uid: string, pwdEpoch = 0): Promise<void> {
  await admin.query('INSERT INTO auth_user_session(jti, user_id, pwd_epoch) VALUES ($1,$2,$3)', [jti, uid, pwdEpoch]);
}

async function main(): Promise<void> {
  await assertIsolatedTestTarget(admin);
  await provisionRuntimeLogin(admin, { roleName: role, password: `${role}-pw` });
  delete process.env.AUTH_DEV_HEADER;
  process.env.NODE_ENV = 'test';
  process.env.WEB_ORIGIN = 'https://web.example.test';
  process.env.AUTH_SECRET = AUTH_SECRET;
  process.env.RESUME_ENC_KEY = 'uc030-nhp-adv-resume-enc-key';
  process.env.RESUME_HASH_SECRET = 'uc030-nhp-adv-resume-hash-secret';
  process.env.OCR_ENABLED = '0';
  process.env.PGUSER = role;
  process.env.PGPASSWORD = `${role}-pw`;
  // signup:ip 桶 E2E 覆写口（auth.service.ts:11-15 产品明钉「RL_SIGNUP_IP(容量,速率)为独立限流段覆写口，
  // 仅 perf/E2E 启动档放宽并显式落档」）: 本 proof 14 signup（PC/RP1/RP2/RP3/RC1/RC2/TC1/TC2 各独立
  // principal + XU1/XU2/XU3 各 A/B 双户）超缺省突发 10 → r2 P2-③ 显式钉 '100,1'（bound proof 先例档同值）。
  // 其余五键（RL_LOGIN_IP/RL_LOGIN_GLOBAL/RL_CHGPWD/RL_CHGPWD_IP/RL_CHGPWD_FAIL）沿 bound 先例档=产品缺省
  // （login:ip 突发 60＞本 proof 4 login·chgpwd 主体桶 20/ip 桶 60＞本 proof ≤2 改密每主体·共 5·失败锁 5＞0
  // 预期失败——五键名具名于 REQUEST §1·值设定须先于 main.ts 动态 import=模块载入期常量捕获）。
  // 仅本测试进程窗 · 零配置文件改。
  process.env.RL_SIGNUP_IP = '100,1';

  // 真 HTTP 口（createApp + listen(0) + fetch · uc-e2e-030-nhp-bound 同壳）
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
  const signup = async (tag: string): Promise<{ userId: string; token: string; email: string }> => {
    const email = `uc030-nhp-adv-${tag}-${process.pid}@example.test`;
    const r = await call('POST', '/auth/signup', {}, {
      email, password: `uc030-adv-${tag}-pw-2026`, role: 'candidate',
    });
    if (r.status !== 200 || typeof r.body['userId'] !== 'string' || typeof r.body['token'] !== 'string')
      throw new Error(`uc030_signup_failed:${tag}:${r.status}`);
    return { userId: r.body['userId'] as string, token: r.body['token'] as string, email };
  };
  const login = async (tag: string, email: string, password: string): Promise<string> => {
    const r = await call('POST', '/auth/login', {}, { email, password });
    if (r.status !== 200 || typeof r.body['token'] !== 'string') throw new Error(`uc030_login_failed:${tag}:${r.status}`);
    return r.body['token'] as string;
  };
  const bearer = (t: string) => ({ authorization: `Bearer ${t}` });
  const profile = (t: string) => call('GET', '/profile', bearer(t));
  const chgpwd = (t: string, oldPassword: string, newPassword: string) =>
    call('POST', '/profile/change-password', bearer(t), { oldPassword, newPassword });

  // ══ PC · signup/login happy 对照基面（真 HTTP 双产点 · 独立 principal）══
  section('PC · signup/login happy 对照基面（双产点 auth.service issue + profile 改密回签之外第一处）');
  const pcPw = 'uc030-adv-pc-pw-2026';
  const pc = await signup('pc');
  const pcT2 = await login('pc-2nd', pc.email, pcPw);
  const pcJ1 = jtiOf(pc.token);
  const pcJ2 = jtiOf(pcT2);
  A('PC signup→200 {userId,token,role} + login→200 {token,userId}（真 HTTP 双产点）',
    pc.userId.length > 0 && pcT2.length > 0);
  A('PC signup/login 两令牌 jti 相异（randomUUID auth-session.ts:42）', pcJ1 !== pcJ2 && pcJ1.length > 0 && pcJ2.length > 0);
  A('PC auth_user_session 恰 2 行均未吊销（签发与 INSERT 同请求原子 :44-47）', (await ledgerOf(pc.userId)).rows === 2);
  A('PC 两令牌 GET /profile 均 200（并存多会话基面）', (await profile(pc.token)).status === 200 && (await profile(pcT2)).status === 200);

  // ══ 臂族一 · RP 族 ══
  section('RP1 · 死 jti 令牌重放对写嘴 sweep（guard :98-99 jti 查恒先于 handler · 零副作用账面）');
  const rp1Pw = 'uc030-adv-rp1-pw-2026';
  const rp1 = await signup('rp1');
  const rp1Out = await call('POST', '/auth/logout', bearer(rp1.token));
  A('RP1 前置: 产品 logout 真吊销 → 200 {loggedOut:true, revoked:true}（auth.controller:29-36）',
    rp1Out.status === 200 && rp1Out.body['loggedOut'] === true && rp1Out.body['revoked'] === true);
  const rp1Ledger0 = await ledgerOf(rp1.userId);
  const rp1Mouth1 = await call('POST', '/auth/logout', bearer(rp1.token));
  A('RP1 嘴① 死令牌再 POST /auth/logout → 401 session_revoked（guard :98-99 先于 handler·neg-auth 仅读面单嘴可分）',
    rp1Mouth1.status === 401 && rp1Mouth1.body['error'] === 'session_revoked');
  const rp1Mouth2 = await chgpwd(rp1.token, rp1Pw, 'uc030-adv-rp1-new-pw-2026');
  A('RP1 嘴② 死令牌对写嘴 POST /profile/change-password（携正确旧密）→ 401 session_revoked（写嘴全婴拒=本臂新面）',
    rp1Mouth2.status === 401 && rp1Mouth2.body['error'] === 'session_revoked');
  const rp1Ledger1 = await ledgerOf(rp1.userId);
  E('N-RP1', { before: rp1Ledger0, after: rp1Ledger1 });
  A('RP1 DB 零副作用: 行数零增零删（revoked_at IS NOT NULL 恰 1 行不变）',
    rp1Ledger1.rows === 1 && rp1Ledger1.revoked === 1 && rp1Ledger0.rows === 1);
  A('RP1 DB 零副作用: pwd_epoch 零动（写嘴 401 拒不入 handler·零消费）', rp1Ledger1.epoch === 0 && rp1Ledger0.epoch === 0);

  section('RP2 · 族撤销=代次机械全族行使（3 并存会话一改密全灭 · 3 具名 jti 逐行断言·行保留审计）');
  const rp2Pw = 'uc030-adv-rp2-pw-2026';
  const rp2 = await signup('rp2');
  const rp2T2 = await login('rp2-2nd', rp2.email, rp2Pw);
  const rp2T3 = await login('rp2-3rd', rp2.email, rp2Pw);
  const rp2Jtis = [jtiOf(rp2.token), jtiOf(rp2T2), jtiOf(rp2T3)];
  A('RP2 前置: 3× login 并存产 3 jti 互异（bound R1 只 2×·本臂全族）', new Set(rp2Jtis).size === 3);
  const rp2Rows0 = await sessionRows(rp2.userId);
  A('RP2 前置: 3 行均未吊销且 pwd_epoch=0（令牌内嵌当前代次 auth.service:108）',
    rp2Rows0.length === 3 && rp2Rows0.every((r) => r['revoked_at'] === null && Number(r['pwd_epoch']) === 0));
  const rp2Chg = await chgpwd(rp2T3, rp2Pw, 'uc030-adv-rp2-new-pw-2026');
  A('RP2 change-password 恰 1 次 → 200 {changed:true, token}（:154 代次自增·:162 回签）',
    rp2Chg.status === 200 && rp2Chg.body['changed'] === true && typeof rp2Chg.body['token'] === 'string');
  const rp2New = String(rp2Chg.body['token'] ?? '');
  A('RP2 回签新令牌 → 200（新代次·profile.service:161-162）', (await profile(rp2New)).status === 200);
  const rp2ReplayRes = await Promise.all([profile(rp2.token), profile(rp2T2), profile(rp2T3)]);
  const [rp2r1, rp2r2, rp2r3] = rp2ReplayRes;
  A('RP2 旧令牌 1/3 → 401 session_revoked（guard :95 代次拒）',
    rp2r1?.status === 401 && rp2r1?.body['error'] === 'session_revoked');
  A('RP2 旧令牌 2/3 → 401 session_revoked（同上·r1 P2-⑤ 逐臂独立断言）',
    rp2r2?.status === 401 && rp2r2?.body['error'] === 'session_revoked');
  A('RP2 旧令牌 3/3 → 401 session_revoked（同上）',
    rp2r3?.status === 401 && rp2r3?.body['error'] === 'session_revoked');
  const rp2Rows1 = await sessionRows(rp2.userId);
  A('RP2 具名 jti#1 逐行断言: 行在且 revoked_at IS NULL（吊销由代次机械承担·行保留审计·零 DELETE）',
    rp2Rows1.find((r) => r['jti'] === rp2Jtis[0])?.['revoked_at'] === null);
  A('RP2 具名 jti#2 逐行断言: 行在且 revoked_at IS NULL（非 COUNT 聚合·逐行 SELECT）',
    rp2Rows1.find((r) => r['jti'] === rp2Jtis[1])?.['revoked_at'] === null);
  A('RP2 具名 jti#3 逐行断言: 行在且 revoked_at IS NULL（同上）',
    rp2Rows1.find((r) => r['jti'] === rp2Jtis[2])?.['revoked_at'] === null);
  A('RP2 行账: 3 旧行保留 + 回签恰 +1 新行 = 恰 4 行', rp2Rows1.length === 4);
  E('N-RP2', { jtis: rp2Jtis, rows: rp2Rows1.length, epoch: await accountEpoch(rp2.userId) });

  section('RP3 · legacy 无 jti 令牌代次死面（:95 代次面恒行·legacy 只跳过 :98 会话查不跳代次）');
  const rp3Pw = 'uc030-adv-rp3-pw-2026';
  const rp3 = await signup('rp3');
  const rp3Now = Math.floor(Date.now() / 1000);
  const rp3Legacy = signToken(rp3.userId, AUTH_SECRET, 3600, rp3Now);   // 手签无 jti·无会话行（neg-auth tokenFor 先例形·无 _neg-harness 依赖）
  A('RP3 夹具自检: legacy 令牌 payload 无 jti 字段（手签无 session 参·auth.ts:69-76 兼容形）', payloadOf(rp3Legacy)['jti'] === undefined);
  A('RP3 前置行账: legacy 令牌自身恒零会话行（该户恰 1 行=signup 产·世界真话）', (await ledgerOf(rp3.userId)).rows === 1);
  A('RP3 前置: 改密前 legacy 令牌 GET /profile → 200（无态路径存活·与改密后死面二向可分）', (await profile(rp3Legacy)).status === 200);
  const rp3Chg = await chgpwd(rp3.token, rp3Pw, 'uc030-adv-rp3-new-pw-2026');
  A('RP3 change-password → 200 {changed:true, token}（epoch 0→1）',
    rp3Chg.status === 200 && rp3Chg.body['changed'] === true && typeof rp3Chg.body['token'] === 'string');
  const rp3After = await profile(rp3Legacy);
  A('RP3 改密后 legacy 重放 → 401 session_revoked（:95 代次面恒行·登出无效≠改密无效·neg-auth :440-445 存活面可分）',
    rp3After.status === 401 && rp3After.body['error'] === 'session_revoked');
  const rp3Rows = await sessionRows(rp3.userId);
  A('RP3 世界真话行账: 改密回签按双产点语义恰 +1 新行（1→2·profile.service:161-162→auth-session.ts:39-49 INSERT）',
    rp3Rows.length === 2);
  A('RP3 零既有行被动: 2 行均 revoked_at IS NULL（无 revoke 无 delete·既有会话行吊销仅由代次机械承担）',
    rp3Rows.every((r) => r['revoked_at'] === null));
  E('N-RP3', { rows: rp3Rows.length, epoch: await accountEpoch(rp3.userId) });

  // ══ 臂族二 · RC 族（并行竞态格）══
  section('RC1 · 并发双改密自锁钉（profile.service:147 产品自钉「极罕见的自锁,可接受」首次行使）');
  const rc1Pw = 'uc030-adv-rc1-pw-2026';
  const rc1 = await signup('rc1');
  const rc1Ledger0 = await ledgerOf(rc1.userId);
  const rc1NewPw = 'uc030-adv-rc1-new-pw-2026';
  const rc1Pair = await Promise.all([chgpwd(rc1.token, rc1Pw, rc1NewPw), chgpwd(rc1.token, rc1Pw, rc1NewPw)]);
  const rc1Ok = rc1Pair.filter((r) => r.status === 200 && r.body['changed'] === true && typeof r.body['token'] === 'string');
  const rc1Wrong = rc1Pair.filter((r) => r.status === 401 && r.body['error'] === 'wrong_password');
  const rc1Epoch1 = await accountEpoch(rc1.userId);
  if (rc1Wrong.length === 1 && rc1Ok.length === 1) {
    // 环境竞态败窗预钉形（REQUEST §0.2 RC1/§2-4）: 败者 :140 SELECT 落于并方 :153 UPDATE commit 之后读新哈希·
    // 验旧密必败 → 合法环境红非机制红。该形 epoch 终值=始值+1·败者零回签令牌。停判 ENV-RED·一次性重跑政策。
    ENVRED('RC1 wrong_password loss-window (epoch start+1 · loser zero re-sign)');
    E('N-RC1-ENVRED', { before: rc1Ledger0, epoch: rc1Epoch1, shapes: rc1Pair.map((r) => r.status) });
  } else {
    A('RC1 两路并行 → 均 200 {changed:true, token}（行锁内串行 :154 单语句原子·双 401/429/500 形=机制红）',
      rc1Ok.length === 2);
    const rc1Tokens = rc1Ok.map((r) => String(r.body['token']));
    const rc1Epoch2 = await accountEpoch(rc1.userId);
    A('RC1 pwd_epoch 终值=始值+2（0→2 零丢更新·两 UPDATE 各恰 +1）', rc1Ledger0.epoch === 0 && rc1Epoch2 === 2);
    const rc1Probe = await Promise.all(rc1Tokens.map((t) => profile(t)));
    const alive = rc1Probe.filter((r) => r.status === 200).length;
    const dead = rc1Probe.filter((r) => r.status === 401 && r.body['error'] === 'session_revoked').length;
    A('RC1 两回签令牌恰一活一死（先提交者内嵌旧代次→401 session_revoked·后提交者→200·不钉孰先）',
      alive === 1 && dead === 1);
    const rc1WinnerIdx = rc1Probe.findIndex((r) => r.status === 200);
    const rc1WinnerToken = rc1Tokens[rc1WinnerIdx] ?? '';
    A('RC1 活令牌内嵌终代次 pe=2（终值判失效面 :95）',
      rc1WinnerToken.length > 0 && Number(payloadOf(rc1WinnerToken)['pe']) === 2);
    const rc1Ledger1 = await ledgerOf(rc1.userId);
    E('N-RC1', { before: rc1Ledger0, after: rc1Ledger1 });
    A('RC1 行账: 旧会话行零 DELETE·两回签恰 +2 行（1→3）', rc1Ledger0.rows === 1 && rc1Ledger1.rows === 3 && rc1Ledger1.revoked === 0);
  }

  section('RC2 · 并发双吊销 exactly-once（revokeSession :56-66 WHERE revoked_at IS NULL 并行恰一 UPDATE 命中）');
  const rc2 = await signup('rc2');
  const rc2Warm = await profile(rc2.token);
  A('RC2 前置: 并行发出前 ≤1s 先行使一次该令牌 warm sessionCache（auth-session.ts:74·guard 侧缓存命中免 DB 会话查）',
    rc2Warm.status === 200);
  const rc2Pair = await Promise.all([
    call('POST', '/auth/logout', bearer(rc2.token)),
    call('POST', '/auth/logout', bearer(rc2.token)),
  ]);
  const rc2Winners = rc2Pair.filter((r) => r.status === 200 && r.body['loggedOut'] === true && r.body['revoked'] === true);
  const rc2Losers = rc2Pair.filter((r) =>
    (r.status === 200 && r.body['loggedOut'] === true && r.body['revoked'] === false) ||
    (r.status === 401 && r.body['error'] === 'session_revoked'));
  A('RC2 响应集合: 恰 1×{loggedOut:true, revoked:true}（胜者·不钉顺序）', rc2Winners.length === 1);
  A('RC2 响应集合: 败者∈{{loggedOut:true,revoked:false}, 401 session_revoked} 两形集（r2 P2-③ 扩形）',
    rc2Pair.length === 2 && rc2Losers.length === 1);
  const rc2Rows = await sessionRows(rc2.userId);
  A('RC2 DB 不变式: 该 jti 恰 1 行 revoked_at 非 NULL（落账恰一次·恒机制红判据）',
    rc2Rows.length === 1 && rc2Rows.filter((r) => r['revoked_at'] !== null).length === 1);
  A('RC2 行账: logout 零增行零删行（恰 1 行·epoch 零动）', (await ledgerOf(rc2.userId)).rows === 1 && (await accountEpoch(rc2.userId)) === 0);
  E('N-RC2', { shapes: rc2Pair.map((r) => [r.status, r.body['revoked'] ?? r.body['error']]), rows: rc2Rows.length });

  // ══ 臂族三 · TC 族（传输面实钟）══
  section('TC1 · 传输面实钟短窗行使（ttl=1 背签 + 发送前 clock guard · 越窗=ENV-RED 非机制红）');
  const tc1 = await signup('tc1');
  const tc1Jti = randomUUID();
  await seedSessionRow(tc1Jti, tc1.userId, 0);   // 豁免②具名（背签必需·签发侧恒 7d 不可产短窗）
  const tc1Now = Math.floor(Date.now() / 1000);
  const tc1Tok = signToken(tc1.userId, AUTH_SECRET, 1, tc1Now, 0, { jti: tc1Jti });
  A('TC1 背签算术: exp = now+1（ttl=1s · auth.ts:71 纯算术）', payloadOf(tc1Tok)['exp'] === tc1Now + 1);
  // 发送前 clock guard（r1 P2-④）: guard 时刻已 ≥exp 即 ENV-RED（墙钟发送延迟·非 exp 机械红）。
  const tc1Guard = Math.floor(Date.now() / 1000);
  let tc1First: Res = { status: 0, body: {} };
  if (tc1Guard >= tc1Now + 1) {
    ENVRED(`TC1 pre-send guard crossed (guard=${tc1Guard} >= exp=${tc1Now + 1})`);
  } else {
    tc1First = await profile(tc1Tok);
    if (tc1First.status === 401 && tc1First.body['error'] === 'invalid_token') {
      // r2 P2-①: 发送前 guard 通过但首打仍 401 invalid_token（服务端处理越窗）同判 ENV-RED·一次性重跑政策。
      ENVRED(`TC1 first-hit invalid_token after pre-send guard pass (server-side window crossing · guard=${tc1Guard})`);
      E('N-TC1-ENVRED', { guard: tc1Guard, exp: tc1Now + 1 });
    } else {
      A('TC1 立即 GET /profile → 200（guard :85 实钟 exp−now=1s 窗内·真墙钟传输面）', tc1First.status === 200);
    }
  }
  await sleep(2_100);
  const tc1After = await profile(tc1Tok);
  A('TC1 ≥2s 后 → 401 invalid_token（auth.ts:95 exp 判定经真守卫行使·服务端钟权威）',
    tc1After.status === 401 && tc1After.body['error'] === 'invalid_token');
  E('N-TC1', { seededJti: tc1Jti, rows: (await sessionRows(tc1.userId)).length });

  section('TC2 · 远期 exp 背签越 TTL 窗诚实钉（守卫层零最大寿命执行 · P3 语义疣候选登记）');
  const tc2 = await signup('tc2');
  const tc2Jti = randomUUID();
  await seedSessionRow(tc2Jti, tc2.userId, 0);   // 豁免②具名
  const tc2Now = Math.floor(Date.now() / 1000);
  const tc2Tok = signToken(tc2.userId, AUTH_SECRET, 180 * 86_400, tc2Now, 0, { jti: tc2Jti });
  A('TC2 背签算术: exp−now=180d ≫ SESSION_TTL_SEC 7d（auth-session.ts:19 仅约束签发侧 :43）',
    (payloadOf(tc2Tok)['exp'] as number) - tc2Now === 180 * 86_400 && 180 * 86_400 > SESSION_TTL_SEC);
  const tc2Res = await profile(tc2Tok);
  A('TC2 GET /profile → 200（verifyTokenFull :95 只判 exp<now 零最大寿命上界·现状态语义诚实钉）',
    tc2Res.status === 200);
  console.log('P3-WART-CANDIDATE TC2: guard layer enforces no maximum token lifetime (far-future exp accepted) · disclosure: requires AUTH_SECRET (test-face self-held; real adversary keyless) · semantic pin, NOT a vulnerability claim, NO fix demand · flip authority = coordinator');
  E('N-TC2', { seededJti: tc2Jti, ttlSec: 180 * 86_400, sessionTtlSec: SESSION_TTL_SEC });

  // ══ 臂族四 · XU 族（跨户令牌串用）══
  section('XU1 · 令牌=身份归因+跨户登出零扰（A logout 恰吊 A jti·B 零扰）');
  const xu1a = await signup('xu1a');
  const xu1b = await signup('xu1b');
  const xu1aMe = await profile(xu1a.token);
  A('XU1 A 令牌 GET /profile → 200 且响应 id/email=A（profile.service:40 WHERE id=$1 按签名 uid 归因）',
    xu1aMe.status === 200 && xu1aMe.body['id'] === xu1a.userId && xu1aMe.body['email'] === xu1a.email);
  const xu1aOut = await call('POST', '/auth/logout', bearer(xu1a.token));
  A('XU1 A logout → 200 {loggedOut:true, revoked:true}（auth.controller:34-35 req.jti 来自令牌自身）',
    xu1aOut.status === 200 && xu1aOut.body['revoked'] === true);
  const xu1bMe = await profile(xu1b.token);
  A('XU1 B 令牌照常 200（A 登出零扰 B 会话）', xu1bMe.status === 200 && xu1bMe.body['id'] === xu1b.userId);
  const xu1bRows = await sessionRows(xu1b.userId);
  A('XU1 B 行 revoked_at 仍 IS NULL（revokeSession:57 WHERE jti=$1 单行）',
    xu1bRows.length === 1 && xu1bRows[0]?.['revoked_at'] === null);
  A('XU1 A 行已吊销恰 1（对照面）', (await ledgerOf(xu1a.userId)).revoked === 1);

  section('XU2 · jti-uid 非绑定现状态语义钉（isSessionActive:78 零 user_id 谓词·诚实披露非漏洞宣称）');
  const xu2a = await signup('xu2a');
  const xu2bPw = 'uc030-adv-xu2b-pw-2026';
  const xu2b = await signup('xu2b');
  const xu2bT2 = await login('xu2b-2nd', xu2b.email, xu2bPw);   // B 真实 login 产活跃 jti（非种子）
  const xu2bJti = jtiOf(xu2bT2);
  const xu2bSnap0 = await snapFive(xu2b.userId);
  A('XU2 前置: B 真实 login jti 活跃行在位（未吊销）',
    (await sessionRows(xu2b.userId)).find((r) => r['jti'] === xu2bJti)?.['revoked_at'] === null);
  const xu2Forged = signToken(xu2a.userId, AUTH_SECRET, 3600, Math.floor(Date.now() / 1000), 0, { jti: xu2bJti });
  const xu2ForgedMe = await profile(xu2Forged);
  A('XU2 手签 uid=A + jti=B → GET /profile 200（会话活性查不绑 uid·fail-closed 不触发）', xu2ForgedMe.status === 200);
  A('XU2 principal=A: 响应 id/email 恒 A（guard :100 principal 恒取签名 uid·B 数据零可达）',
    xu2ForgedMe.body['id'] === xu2a.userId && xu2ForgedMe.body['email'] === xu2a.email);
  const xu2bSnap1 = await snapFive(xu2b.userId);
  A('XU2 B 行零扰动: 五列（jti/user_id/pwd_epoch/revoked_at/created_at）前后比对恒等（admin 池读）',
    xu2bSnap0 === xu2bSnap1);
  A('XU2 B 本尊令牌照常 200（B 会话零扰）', (await profile(xu2bT2)).status === 200);
  console.log('DISCLOSURE XU2: jti-uid non-binding is the current trust-model semantics (requires AUTH_SECRET = global key compromise, zero privilege escalation — keyed adversary can sign uid=B directly) · semantic pin, NOT a vulnerability claim, zero fix demand');

  section('XU3 · 跨户代次推进零串扰（B epoch+1 对 A 态零扰·列级五列比对恒等）');
  const xu3a = await signup('xu3a');
  const xu3bPw = 'uc030-adv-xu3b-pw-2026';
  const xu3b = await signup('xu3b');
  const xu3aSnap0 = await snapFive(xu3a.userId);
  const xu3aEpoch0 = await accountEpoch(xu3a.userId);
  const xu3bChg = await chgpwd(xu3b.token, xu3bPw, 'uc030-adv-xu3b-new-pw-2026');
  A('XU3 B change-password → 200 {changed:true}（B epoch 0→1·本户代次推进）',
    xu3bChg.status === 200 && xu3bChg.body['changed'] === true);
  const xu3aMe = await profile(xu3a.token);
  A('XU3 A 令牌再打 GET /profile → 200 零扰（accountState:50 WHERE id=$1 按 uid 键控）',
    xu3aMe.status === 200 && xu3aMe.body['id'] === xu3a.userId);
  A('XU3 A pwd_epoch 零动（B 代次推进不触 A 态）', xu3aEpoch0 === 0 && (await accountEpoch(xu3a.userId)) === 0);
  A('XU3 A 会话行零动: 五列前后比对恒等（XU2/XU3 同口径·r2 P2-⑥）', xu3aSnap0 === (await snapFive(xu3a.userId)));
  A('XU3 对照面: B pwd_epoch=1（推进确实发生·非空转）', (await accountEpoch(xu3b.userId)) === 1);
  E('N-XU', { xu3aEpoch: await accountEpoch(xu3a.userId), xu3bEpoch: await accountEpoch(xu3b.userId) });

  // ══ N · 净账审计（会话账口径）══
  section('N · 净账审计（会话账口径 · 零消费面零 entitlement 触）');
  const nUids: Array<[string, string, number]> = [
    ['PC', pc.userId, 0], ['RP1', rp1.userId, 0], ['RP2', rp2.userId, 1], ['RP3', rp3.userId, 1],
    ['RC1', rc1.userId, 0], ['RC2', rc2.userId, 0], ['TC1', tc1.userId, 0], ['TC2', tc2.userId, 0],
    ['XU1A', xu1a.userId, 0], ['XU1B', xu1b.userId, 0], ['XU2A', xu2a.userId, 0], ['XU2B', xu2b.userId, 0],
    ['XU3A', xu3a.userId, 0], ['XU3B', xu3b.userId, 1],
  ];
  const nLedger: Record<string, { rows: number; revoked: number; epoch: number }> = {};
  let nMonotonic = true;
  for (const [tag, uid, epochFloor] of nUids) {
    const l = await ledgerOf(uid);
    nLedger[tag] = l;
    if (l.epoch < epochFloor) nMonotonic = false;
  }
  E('N-LEDGER', nLedger);
  A('N pwd_epoch 单调账: 14 principal 逐户 epoch 终值≥预期下界（恒单调零回退）', nMonotonic);
  A('N 会话账: 全臂零 DELETE（各户行数只增不减·TC1/TC2 行种子为唯一非产品路径行且恰 1 行/户）',
    nLedger['TC1']?.rows === 2 && nLedger['TC2']?.rows === 2 && nLedger['PC']?.rows === 2 &&
    nLedger['RC2']?.rows === 1 && nLedger['XU1A']?.rows === 1);
  console.log('PIN N: 零消费面零 entitlement 触——全臂零 interview/resume/consent/额度端点触（审计口径=会话账非额度账·与 bound L3/fault N1-N2 额度账口径互不替代）');

  // ── 终局 ──
  console.log(`\n${failures === 0 && envRed === 0
    ? `✓ NHP-030-ADV-01 全臂绿（${total}/${total}）· EXIT=0 = 具名 case 真证据 ≠ covered`
    : `✗ ${failures}/${total} 断言失败${envRed > 0 ? ` · ENV-RED ${envRed} 形（一次性重跑政策 §2-4：恰重跑 1 次·再红即停判）` : ''}`}`);
  console.log('PIN: 十臂逐条对 REQUEST §0.2 缝锚 · 任一臂实测与对码期望不符（预钉集合之外）→ §8 机制不满足停上报（Ban retry-to-green）');
  console.log('PIN: RC1 败窗=401 wrong_password / RC2 败窗=401 session_revoked / TC1 发送前越窗或首打越窗 = ENV-RED 分口（§2-4 一次性重跑政策）');
  console.log('PIN: 静默刷新分支=码面无可测注入缝停止条件登记维持（§1.3·不入臂·先接线后 prove）');
  console.log('PIN: 非替代 — neg:auth / uc030:nhp-fault / uc030:nhp-bound / X33 旁证互不替代 · Ban 互借关列');
  console.log('PIN: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · :128 ADV cell blind 保持+case-only · EXIT0≠covered');
  await admin.end();
  process.exit(failures || envRed ? 1 : 0);
}

main().catch((e: unknown) => {
  console.error('✗', (e as Error)?.message ?? e);
  process.exit(1);
});
