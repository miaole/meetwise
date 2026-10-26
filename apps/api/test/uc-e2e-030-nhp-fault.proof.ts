/**
 * NHP-030-FAULT-01 · UC-E2E-030 FAULT 分面（gap→case）· 双触发路径一致性 + 双触发幂等 + 额度恰一次释放
 *
 * REQUEST: ai-docs/delivery/harness/nhp-batch-a-REQUEST.md §1 Row 3 · §9-rev2 守护①②③⑥
 * Base: line/nhp-batch-a-draft（merge origin/main ea0fa0a0a · EXEC tip e4589b57f）
 *
 * 需求源: e2e-scenarios.md:373 — E1 超会话 TTL 一致 abandoned（两触发路径结果相同）·
 * TC-E2E-030-expire-lazy-vs-sweeper。D2 披露: 产品无字面 lazy-on-access 口；两触发路径 =
 * (sweep 口) commerce reconcile reclaim sweep（apps/worker commerceReconcileTick →
 * abandonInterviewAndRelease）×(显式 abandon 口) interview.service POST /interview/:id/abandon
 * （:649-658 → 同一 abandonInterviewAndRelease 原语）。E2 静默 refresh = NOT claimed。
 *
 * 臂: F1 sweep 口 · F2 显式 abandon 口（真 HTTP）· F3 双触发幂等（F1→F2 = 200
 * {alreadyAbandoned:true, released:'noop'}（interview.service.ts:659 映射 · commerce.ts:522/:542
 * already_abandoned→noop）；F2→F1 = sweep 零二次副作用）· F4 未过期对照（sweep 不误伤）·
 * F5 过期/垃圾令牌 401 短回归（verifyTokenFull 服务端钟实参 · 仅触发链 sanity · Ban 代 neg:auth 全家）·
 * N1-N2 额度净账（恰一次 release · availability 逐字）。
 *
 * 守护（§9-rev2）: ① 壳行状态一律 'created'（ag-f-reroll:105 先例 · Ban 'active' 壳直冲
 * conclude/abandon——fail CAS commerce.ts:423 / abandon CAS :534 均不含 'active'）；
 * ② 夹具豁免具名=(a) entitlement_bucket 种子 INSERT（uc-e2e-018-ttl-sweeper-abandon.proof.ts:56-61
 * 先例）+(b) lease 回拨 UPDATE（同文件 :62-66 expireLease 先例）+(c) interview 壳行——豁免外全部
 * 走产品路径（signup/reserve/HTTP/tick）；③ 全 case 缺省 per_session 计费形（断言
 * billing_cap_units IS NULL · Ban per_topic_capped+Σ>0 进 F3 leg 否则 F2 oracle 漂 409）；
 * ⑥ Ban wash 本收据入 UC-018/UC-017 列。
 *
 * Evidence layer: isolated 真 PG（run-e2e-isolated 全迁移链）+ Nest createApp + listen(0) + fetch
 * 真产品 HTTP 口。零模型 · 零外呼（MODEL_API_KEY / DASHSCOPE_API_KEY / DASHSCOPE_COMPAT_BASE_URL
 * 不在场即断言）。EXIT0 = 具名 case 真证据 ≠ covered ≠ suite green；§1.0.1 :128 行措辞零翻动
 * （行状态 partial 不动 · FAULT gap→case 仅经 coordinator nail）；coveredCount=8 不变。
 *
 *   pnpm uc030:nhp-fault:prove            （root · isolated）
 *   pnpm -C apps/api prove:uc030-nhp-fault （raw; needs isolated DATABASE_URL from the runner）
 */
import 'reflect-metadata';
import {
  assertIsolatedTestTarget, asPrincipal, availableUnits, createPool, provisionRuntimeLogin,
  reserveEntitlement,
} from '@meetwise/db';
import { commerceReconcileTick } from '../../worker/src/commerce-reconcile.ts';

let failures = 0;
let total = 0;
const A = (name: string, ok: boolean) => { total++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures += 1; };
const E = (id: string, data: unknown) => console.log(`EVIDENCE ${id} ${JSON.stringify(data)}`);
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

console.log('NHP-030-FAULT-01 UC-E2E-030 FAULT prove (F1-F5 + N1-N2 · 零模型 · Ban wash UC-018/017)');
console.log('Pins: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · §1.0.1 :128 措辞零翻动 · EXIT0≠covered');
console.log('守护 §9-rev2: ①壳行 created ②夹具豁免具名 ③per_session 缺省计费形 ⑥Ban wash UC-018/017');

// ── 零模型面（§1 env -u 三键具名）──
const keysOnEntry = ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']
  .filter((k) => String(process.env[k] ?? '').trim().length > 0);
for (const k of ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']) delete process.env[k];
A('L0 零模型: 三键（MODEL_API_KEY/DASHSCOPE_API_KEY/DASHSCOPE_COMPAT_BASE_URL）入场均不在场', keysOnEntry.length === 0);

const S = Date.now().toString(36);
const AUTH_SECRET = `uc030-nhp-fault-auth-${S}`;
const role = `uc030_nhp_fault_${process.pid}`;
const admin = createPool();

type Res = { status: number; body: any };
const IID = (k: string) => `iv-uc030f-${k}-${S}`;

const ivStatus = (owner: string, id: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2', [id, owner]))
    .then((r) => r.rows[0]?.status as string | undefined);
const consStatus = (owner: string, key: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key]))
    .then((r) => r.rows[0]?.status as string | undefined);
const balOf = (owner: string) => asPrincipal(admin, owner, (c) => availableUnits(c, owner));
const evCount = (owner: string, stream: string, kind: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind=$2', [stream, kind]))
    .then((r) => r.rows[0].n as number);
const capUnitsOf = (owner: string, id: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT billing_cap_units FROM interview WHERE id=$1 AND owner_user_id=$2', [id, owner]))
    .then((r) => r.rows[0]?.billing_cap_units ?? null);

/** 守护②(a) 豁免具名：bucket 种子（ttl-sweeper 先例 seedOwner 同形）。 */
async function seedOwner(owner: string, units = 5.0): Promise<void> {
  await admin.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now()+interval '300 days')", [owner, units]);
}
/** 守护① 豁免具名：interview 壳行 · 状态一律 'created'（ag-f-reroll:105 先例 · Ban 'active'）。 */
async function shellInterview(id: string, owner: string): Promise<void> {
  await admin.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [id, owner]);
  A(`守护① 壳行 ${id} 插入态='created'`, (await ivStatus(owner, id)) === 'created');
}
/** 守护②(b) 豁免具名：lease 回拨 UPDATE（ttl-sweeper 先例 expireLease 同形）——模拟租约过期。 */
async function expireLease(owner: string, key: string): Promise<void> {
  await admin.query("UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id=$1 AND idempotency_key=$2", [owner, key]);
}

async function main(): Promise<void> {
  await assertIsolatedTestTarget(admin);
  await provisionRuntimeLogin(admin, { roleName: role, password: `${role}-pw` });
  delete process.env.AUTH_DEV_HEADER;
  Object.assign(process.env, {
    NODE_ENV: 'test', WEB_ORIGIN: 'https://web.example.test', AUTH_SECRET,
    RESUME_ENC_KEY: 'uc030-nhp-fault-resume-enc-key', RESUME_HASH_SECRET: 'uc030-nhp-fault-resume-hash-secret',
    OCR_ENABLED: '0', PGUSER: role, PGPASSWORD: `${role}-pw`,
  });

  // 真 HTTP 口（interview.controller @Post(':id/abandon') → service.abandon → abandonInterviewAndRelease）
  const { createApp } = await import('../src/main.ts');
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const call = async (method: string, path: string, headers: Record<string, string> = {}, body?: unknown): Promise<Res> => {
    const res = await fetch(base + path, {
      method,
      headers: body === undefined ? headers : { ...headers, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let parsed: any = {};
    try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { _raw: text }; }
    return { status: res.status, body: parsed };
  };
  // 真实 signup（产品路径）→ userId/token；夹具 owner 一律取真 userId（与 HTTP principal 对齐）。
  const signup = async (tag: string): Promise<{ userId: string; token: string }> => {
    const r = await call('POST', '/auth/signup', {}, {
      email: `uc030-nhp-fault-${tag}-${process.pid}@example.test`, password: `uc030-${tag}-pw-2026`, role: 'candidate',
    });
    if (r.status !== 200 || typeof r.body?.userId !== 'string' || typeof r.body?.token !== 'string')
      throw new Error(`uc030_signup_failed:${tag}:${r.status}`);
    return { userId: r.body.userId as string, token: r.body.token as string };
  };
  const bearer = (t: string) => ({ authorization: `Bearer ${t}` });

  // ── F1 · reclaim sweep 口：租约过期 → tick → abandoned + released + interview_unavailable 恰一 ──
  section('F1 · reclaim sweep 口（commerceReconcileTick → abandonInterviewAndRelease）');
  const f1 = IID('f1');
  const f1U = await signup('f1');
  await seedOwner(f1U.userId, 5.0);
  // 0168 gateway_auth_signup 恒发 free-tier 试给桶（1.0）→ 断言一律用基线差分（净变语义），
  // 基线=种子后实读值（含试给桶），非绝对值断言。
  const f1Base = await balOf(f1U.userId);
  A('F1 夹具自检: 基线可读且含试给桶（signup +1.0 + 种子 5.0 = 6.0）', f1Base === 6.0);
  await shellInterview(f1, f1U.userId);
  const rsv1 = await asPrincipal(admin, f1U.userId, (c) => reserveEntitlement(c, f1U.userId, f1, 'mock_interview', 1.0));
  A('F1 reserve（产品原语·begin 同 CAS）→ reserved', rsv1.status === 'reserved');
  A('F1 预留后 availability=基线-1.0', (await balOf(f1U.userId)) === f1Base - 1.0);
  A('守护③ F1 计费形=per_session 缺省（billing_cap_units IS NULL）', (await capUnitsOf(f1U.userId, f1)) === null);
  await expireLease(f1U.userId, f1);
  const tick1 = await commerceReconcileTick(admin);
  A('F1 tick staleReleased≥1', tick1.staleReleased >= 1);
  A('F1 tick abandoned≥1', tick1.abandoned >= 1);
  A('F1 interview 终态=abandoned', (await ivStatus(f1U.userId, f1)) === 'abandoned');
  A('F1 consumption=released', (await consStatus(f1U.userId, f1)) === 'released');
  A('F1 额度全回补 availability=基线（净变 0）', (await balOf(f1U.userId)) === f1Base);
  A('F1 interview_unavailable 补发恰一（无静默死胡同）', (await evCount(f1U.userId, f1, 'interview_unavailable')) === 1);

  // ── F2 · 显式 abandon 口：真 HTTP POST /interview/:id/abandon → 同终态同原语 ──
  section('F2 · 显式 abandon 口（interview.service → abandonInterviewAndRelease · 真 HTTP）');
  const f2 = IID('f2');
  const f2U = await signup('f2');
  await seedOwner(f2U.userId, 5.0);
  const f2Base = await balOf(f2U.userId);
  await shellInterview(f2, f2U.userId);
  const rsv2 = await asPrincipal(admin, f2U.userId, (c) => reserveEntitlement(c, f2U.userId, f2, 'mock_interview', 1.0));
  A('F2 reserve → reserved', rsv2.status === 'reserved');
  A('守护③ F2 计费形=per_session 缺省（billing_cap_units IS NULL）', (await capUnitsOf(f2U.userId, f2)) === null);
  const r2ab = await call('POST', `/interview/${f2}/abandon`, bearer(f2U.token));
  A('F2 HTTP 200', r2ab.status === 200);
  A('F2 响应 {abandoned:true, released:"released", alreadyAbandoned:false}', r2ab.body?.abandoned === true && r2ab.body?.released === 'released' && r2ab.body?.alreadyAbandoned === false);
  A('F2 interview 终态=abandoned（与 F1 同终态）', (await ivStatus(f2U.userId, f2)) === 'abandoned');
  A('F2 consumption=released（与 F1 同原语释放）', (await consStatus(f2U.userId, f2)) === 'released');
  A('F2 额度全回补 availability=基线（净变 0）', (await balOf(f2U.userId)) === f2Base);
  A('F2 显式口零 interview_unavailable（补偿事件=sweep 口专属 · 家族形状）', (await evCount(f2U.userId, f2, 'interview_unavailable')) === 0);

  // ── F3a · F1→F2 双触发幂等：sweep 后显式 abandon → alreadyAbandoned + noop · 零二次副作用 ──
  section('F3a · F1(sweep)→F2(显式 HTTP) 幂等 · 200 {alreadyAbandoned:true, released:"noop"}');
  const f3 = IID('f3');
  const f3U = await signup('f3');
  await seedOwner(f3U.userId, 5.0);
  const f3Base = await balOf(f3U.userId);
  await shellInterview(f3, f3U.userId);
  await asPrincipal(admin, f3U.userId, (c) => reserveEntitlement(c, f3U.userId, f3, 'mock_interview', 1.0));
  await expireLease(f3U.userId, f3);
  await commerceReconcileTick(admin);
  const f3AfterF1 = { status: await ivStatus(f3U.userId, f3), bal: await balOf(f3U.userId), ev: await evCount(f3U.userId, f3, 'interview_unavailable') };
  A('F3a 前置 F1 生效（abandoned + 基线回补 + 事件恰一）', f3AfterF1.status === 'abandoned' && f3AfterF1.bal === f3Base && f3AfterF1.ev === 1);
  const r3 = await call('POST', `/interview/${f3}/abandon`, bearer(f3U.token));
  A('F3a HTTP 200（非 409 conflict）', r3.status === 200);
  A('F3a 响应 {abandoned:true, released:"noop", alreadyAbandoned:true}（interview.service.ts:659 映射 · commerce.ts:522/:542）',
    r3.body?.abandoned === true && r3.body?.released === 'noop' && r3.body?.alreadyAbandoned === true);
  A('F3a 终态不复活: 仍 abandoned', (await ivStatus(f3U.userId, f3)) === 'abandoned');
  A('F3a 无二次 release: consumption 仍 released', (await consStatus(f3U.userId, f3)) === 'released');
  A('F3a 额度不动: availability 仍基线（无双退）', (await balOf(f3U.userId)) === f3Base);
  A('F3a 事件恰一: interview_unavailable 仍 1（无重放）', (await evCount(f3U.userId, f3, 'interview_unavailable')) === 1);

  // ── F3b · F2→F1 反向幂等：显式 abandon 后 sweep → 零二次副作用 ──
  section('F3b · F2(显式)→F1(sweep) 反向幂等 · sweep 不触已释放');
  const f4 = IID('f4');
  const f4U = await signup('f4');
  await seedOwner(f4U.userId, 5.0);
  const f4Base = await balOf(f4U.userId);
  await shellInterview(f4, f4U.userId);
  await asPrincipal(admin, f4U.userId, (c) => reserveEntitlement(c, f4U.userId, f4, 'mock_interview', 1.0));
  const r4ab = await call('POST', `/interview/${f4}/abandon`, bearer(f4U.token));
  A('F3b 前置 F2 生效（HTTP 200 released · abandoned · 基线回补）', r4ab.status === 200 && r4ab.body?.released === 'released' && (await ivStatus(f4U.userId, f4)) === 'abandoned' && (await balOf(f4U.userId)) === f4Base);
  await expireLease(f4U.userId, f4);
  const tick2 = await commerceReconcileTick(admin);
  E('F3b-TICK', { staleReleased: tick2.staleReleased });
  A('F3b 终态不复活: 仍 abandoned', (await ivStatus(f4U.userId, f4)) === 'abandoned');
  A('F3b consumption 仍 released（sweep 不二次处理已释放）', (await consStatus(f4U.userId, f4)) === 'released');
  A('F3b 额度不动: availability 仍基线（无双退）', (await balOf(f4U.userId)) === f4Base);
  A('F3b 零补偿事件: interview_unavailable 恒 0', (await evCount(f4U.userId, f4, 'interview_unavailable')) === 0);

  // ── F4 · 未过期对照：新租约不受 sweep 误伤（不入终态）──
  section('F4 · 未过期对照（lease 新鲜 → sweep 不误伤）');
  const f5 = IID('f5');
  const f5U = await signup('f5');
  await seedOwner(f5U.userId, 5.0);
  const f5Base = await balOf(f5U.userId);
  await shellInterview(f5, f5U.userId);
  await asPrincipal(admin, f5U.userId, (c) => reserveEntitlement(c, f5U.userId, f5, 'mock_interview', 1.0));
  const tick3 = await commerceReconcileTick(admin);
  E('F4-TICK', { staleReleased: tick3.staleReleased });
  A('F4 interview 仍 created（未入 abandoned 终态）', (await ivStatus(f5U.userId, f5)) === 'created');
  A('F4 consumption 仍 reserved', (await consStatus(f5U.userId, f5)) === 'reserved');
  A('F4 额度仍占用: availability=基线-1.0（未误退）', (await balOf(f5U.userId)) === f5Base - 1.0);
  A('F4 零事件: interview_unavailable=0', (await evCount(f5U.userId, f5, 'interview_unavailable')) === 0);

  // ── F5 · 过期/垃圾令牌 401 短回归（verifyTokenFull 服务端钟实参 · 触发链 sanity · Ban 代 neg:auth）──
  section('F5 · 过期/垃圾令牌 401 短回归（sanity · 非全家）');
  const { signToken } = await import('@meetwise/domain');
  const expired = signToken(f5U.userId, AUTH_SECRET, -10, Math.floor(Date.now() / 1000));
  const r5a = await call('POST', `/interview/${f5}/abandon`, bearer(expired));
  A('F5 过期令牌（exp<服务端钟）→ 401 invalid_token', r5a.status === 401 && r5a.body?.error === 'invalid_token');
  const r5b = await call('POST', `/interview/${f5}/abandon`, bearer('garbage.sig'));
  A('F5 垃圾签名 → 401 invalid_token（fail-closed）', r5b.status === 401 && r5b.body?.error === 'invalid_token');
  const r5c = await call('POST', `/interview/${f5}/abandon`, {});
  A('F5 无令牌 → 401（unauthenticated/invalid_token · 不落 dev 回退）', r5c.status === 401 && (r5c.body?.error === 'invalid_token' || r5c.body?.error === 'unauthenticated'));
  A('F5 对照: 有效令牌同口 200 可达（401 非路由缺失假阳性）', r3.status === 200);

  // ── N1-N2 · 额度净账审计（恰一次 release · ledger 逐字）──
  section('N1-N2 · 额度净账（恰一次 release · 全 owner 汇总）');
  {
    const owners = [f1U.userId, f2U.userId, f3U.userId, f4U.userId, f5U.userId];
    const bases = [f1Base, f2Base, f3Base, f4Base, f5Base];
    const net = { f1: await balOf(owners[0]!), f2: await balOf(owners[1]!), f3: await balOf(owners[2]!), f4: await balOf(owners[3]!), f5: await balOf(owners[4]!) };
    E('N1-NET', { net, bases });
    A('N1 五 owner availability 对基线: 四终态净变 0（恰一次 release）· F4 未终态恰占 1.0',
      net.f1 === bases[0] && net.f2 === bases[1] && net.f3 === bases[2] && net.f4 === bases[3] && net.f5 === bases[4]! - 1.0);
    const cons = await admin.query(
      `SELECT owner_user_id, idempotency_key, status, service_type, units_requested::text req
         FROM entitlement_consumption WHERE owner_user_id = ANY($1) ORDER BY idempotency_key`, [owners]);
    const rows = cons.rows as Array<{ owner_user_id: string; idempotency_key: string; status: string; service_type: string; req: string }>;
    A('N2 每笔 interview 恰一 consumption 行（无重复预留）', rows.length === 5 && new Set(rows.map((r) => r.idempotency_key)).size === 5);
    A('N2 全部 service_type=mock_interview · units_requested=1.0', rows.every((r) => r.service_type === 'mock_interview' && (r.req === '1.00' || r.req === '1.0')));
    const releasedRows = rows.filter((r) => r.idempotency_key !== f5);
    A('N2 四笔终态笔恰一次 released（零双退零悬挂）', releasedRows.length === 4 && releasedRows.every((r) => r.status === 'released'));
    A('N2 未终态笔仍 reserved（F4 对照笔零泄漏零误退）', rows.find((r) => r.idempotency_key === f5)?.status === 'reserved');
  }

  console.log(`\n${failures === 0
    ? `✓ NHP-030-FAULT-01 全臂绿（${total}/${total}）· EXIT=0 = 具名 case 真证据 ≠ covered`
    : `✗ ${failures}/${total} NHP-030-FAULT-01 断言失败`}`);
  console.log('PIN: 双触发路径一致性+sweep/显式口幂等 = UC-030 行 FAULT 面独立新证据');
  console.log('PIN: §9-rev2 ⑥ Ban wash — 本收据不关 UC-018（abandon 家族已闭）不关 UC-017（LOAD Line Y）任何列');
  console.log('PIN: D2 — lazy-on-access 字面口 / refresh token 静默刷新 = NOT claimed（产品未接线）');
  console.log('PIN: F5 仅触发链 sanity · Ban 代 neg:auth 全家 · ADV=blind 留后刀');
  console.log('PIN: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · §1.0.1 :128 行措辞零翻动 · EXIT0≠covered');
  await admin.end();
  process.exit(failures ? 1 : 0);
}

main().catch((e: unknown) => {
  console.error('✗', (e as Error)?.message ?? e);
  process.exit(1);
});
