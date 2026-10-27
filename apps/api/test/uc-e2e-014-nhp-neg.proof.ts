/**
 * uc-e2e-014-nhp-neg.proof.ts — NHP-014-NEG-01 · UC-E2E-014/026 NEG 残余亚层 · 验签门边界值证据层
 * (webhook-neg 刀 case 1 · REQUEST=ai-docs/delivery/harness/webhook-neg-REQUEST.md
 *  · 覆盖矩阵 §1.0.1 UC-E2E-014/026 行 NEG cell 残余亚层 · §1.0.2 工具行 additive 注记随收据)
 *
 * 需求源（口径以此为准，不发明验收标准）：
 *  - e2e-scenarios.md UC-E2E-026(:528-546)：E-伪造签名/验签 fail-closed(:536)·TC-E2E-026-forged-sig(:544)；
 *    UC-E2E-014(:518-526)：幂等窗面。本 case=验签门**边界值证据层**（窗锐缘/ts 类型形/kind 对偶反向互换），
 *    非七类重铺（七类=NHP-014-ADV-01 已钉·互不替代互不借用）。
 *
 * 产品事实基线（读真实代码得出，断言即据此 · 并线 merge `69997bd42` 届值亲读）：
 *  - 入口：POST /commerce/webhook/pay/:id（无登录态·commerce-webhook.controller.ts:12-17）与
 *    POST /commerce/webhook/refund/:id（:20-24 对偶）·均不挂 PrincipalGuard。
 *  - 验签单源 verifyCommerceSig（commerce.service.ts:26-36）：缺 providerTxn/sig → 400 invalid_callback(:27)；
 *    ts 门 :28-29 `typeof ts!=='number' || !Number.isFinite(ts) || Math.abs(Date.now()-ts) > 窗*1000` → 400
 *    （窗常数 PAY_SIG_REPLAY_WINDOW_SECONDS=300 :15）；HMAC 载荷 `${id}:${providerTxn}:${kind}:${ts}` :33
 *    （kind 入签·paid/refunded 对偶标签不可互换 :23 注）；密钥缺失/长度不等短路/恒时序不等 → 403 bad_signature :34-35。
 *  - 窗锐缘（两层读法·REQUEST §0.2 认领②）：HTTP 口层现证据只 ±360s 远超窗（neg-commerce.proof.ts:509/:515）；
 *    单测层已行使（authz5a2-hmac.proof.ts :44 常数钉值+:71-74 恰外 ∓301_000+:77-78 恰内 298s）——
 *    本刀新鲜面=HTTP 口层传输证据：恰内 ∓299_000 双向（N1/N3·全树零臂）+ 恰外 ∓301_000 口层对照（N2/N4）。
 *  - ts 类型形：typeof 门 :28-29 前段——string（N5·口层新鲜）/null/boolean（N6 双形）→ 400；
 *    浮点（JSON 可载·窗内·载荷同值）→ isFinite 放行 → 200（N7·全树首证行为臂）。
 *  - kind 反向互换：`refunded` 标签正确 HMAC 打 pay 口 → 403 bad_signature（N8·对偶对称性补齐——
 *    现证据仅单向 pay 标签打 refund 口：uc011 mouth:136/adv:231+authz5a2:66 三处）。
 *
 * egress 形（r2 席2 P2-A/P2-B 钉）：boot() 进程内真栈（_neg-harness 单源）——回调密钥只经 boot() 进程环境注入，
 * 两模型环境键由 harness 内自删（两键实形）；本文件**零环境变量词面**（零含词·provider-egress-inventory 零新条目·
 * additive 零条目形如实登记收据；支付回调密钥不在 egress 扫域·Ban 新增登记）。
 *
 * 隔离：run-e2e-isolated 三层壳（uc014:nhp-neg:prove → :raw → prove:uc014-nhp-neg）· 随机容器+动态端口 ·
 * 壳行种子=隔离夹具裸 INSERT（§5 豁免枚举①：payment_order 'created' 壳·`uc-e2e-014-026-webhook-adv.proof.ts:105-115`
 * 先例形——枚举外裸 INSERT 即违 Ban）· 零 live 模型 · est live=0。
 * EXIT 契约：EXIT 0 ⇔ PC+N1–N9 每臂断言全部成立；任一红 → EXIT 1 诚实保留（attempts 台账·Ban retry-to-green·
 * Ban 改断言迁就）。EXIT 0 = case 证据 ≠ covered ≠ 翻行（格值 partial 保持·coveredCount=8 不动·翻面权归协调方）。
 */

import { boot, paySig } from './_neg-harness';

const CMD = 'pnpm uc014:nhp-neg:prove';
const WH = (id: string) => `/commerce/webhook/pay/${id}`;
const RF = (id: string) => `/commerce/webhook/refund/${id}`;
const GAP_ID = 'GAP-UC014-NEG-01';

let total = 0;
const failures: string[] = [];
const A = (name: string, cond: boolean, detail?: string) => {
  total++;
  if (!cond) { failures.push(name); console.log(`FAIL  ${name}${detail ? ` :: ${detail}` : ''}`); }
  else console.log(`PASS  ${name}`);
};

(async () => {
  console.log('NHP-014-NEG-01 · 验签门边界值证据层（窗锐缘 ±1s 口层/ts 类型形/kind 对偶反向互换）· releaseEvidence=false · Not HA');
  console.log(`CMD=${CMD}`);
  console.log('NOTE: EXIT0=case 证据≠covered≠翻行 · 格值 partial 保持 · Ban 借本收据宣「防重放窗新增能力」/「阈值本体首次行使」（单测层 authz5a2 已行使·本刀=HTTP 口层传输证据层·机制 5A-2 #100 已在码）');

  const h = await boot();
  const pool = h.pool;

  // ── DB 快照/终态工具（特权 pool 直查，绕 RLS；只读）──
  const orderRow = async (id: string) =>
    (await pool.query('SELECT id, owner_user_id, status, provider_txn, refund_provider_txn FROM payment_order WHERE id=$1', [id])).rows[0] ?? null;
  const bucketCount = async (owner: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].n);
  const bucketSum = async (owner: string) =>
    Number((await pool.query('SELECT COALESCE(SUM(units_total),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].s);
  const payTxnRows = async (txn: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM payment_order WHERE provider_txn=$1', [txn])).rows[0].n);
  const refundTxnRows = async (txn: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM payment_order WHERE refund_provider_txn=$1', [txn])).rows[0].n);
  // 签名载荷 `${orderId}:${txn}:${kind}:${ts}`（ts=签名毫秒时刻·与 verifyCommerceSig 单源同形——
  // 本 prove 自带 kind 参数形：pay 臂 'paid'·N8 反向臂 'refunded'）。
  const sigFor = (orderId: string, txn: string, kind: 'paid' | 'refunded', ts: number | string | null | boolean) =>
    paySig(`${orderId}:${txn}:${kind}:${ts}`);
  // 拒臂零副作用五面快照：订单行（status/provider_txn/refund_provider_txn）+owner 桶数合计+全局两流水行数。
  const snap = async (ord: string, owner: string, txn: string) => ({
    order: await orderRow(ord),
    bucketCount: await bucketCount(owner),
    bucketSum: await bucketSum(owner),
    payTxnRows: await payTxnRows(txn),
    refundTxnRows: await refundTxnRows(txn),
  });

  // ── 隔离 fixtures：壳行种子（§5 豁免枚举①·payment_order 'created' 壳·webhook-adv :105-115 先例形）──
  // 成功臂各自独立壳（PC/N1/N3/N7 各转 paid·增量可精确断言）；拒臂共一沙盒壳（NEG_REJ·全程 created）；
  // N9 跨口继承臂独立壳（NEG_N9）。owner 均为隔离新 id（不碰 harness 固定种子·不碰 neg:commerce fixture）。
  await pool.query(
    `INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status) VALUES
       ('NEG_PC','negPc','pack_10',9900,10,'created'),
       ('NEG_N1','negN1','pack_10',9900,10,'created'),
       ('NEG_N3','negN3','pack_10',9900,10,'created'),
       ('NEG_N7','negN7','pack_10',9900,10,'created'),
       ('NEG_REJ','negRej','pack_10',9900,10,'created'),
       ('NEG_N9','negN9','pack_10',9900,10,'created')`);

  // ════════════ PC 窗心合法回调对照（壳行转 paid）════════════
  {
    const txn = 'negPcTxn';
    const ts = Date.now();
    const r = await h.post(WH('NEG_PC'), {}, { providerTxn: txn, ts, sig: sigFor('NEG_PC', txn, 'paid', ts) });
    A('PC 窗心合法回调 ts=now → 200 {result:credited}', r.status === 200 && r.body?.result === 'credited', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const row = await orderRow('NEG_PC');
    A('PC 壳行转 paid ∧ provider_txn 落列（对照臂·壳行种子活体自证）', row?.status === 'paid' && row?.provider_txn === txn, `row=${JSON.stringify(row)}`);
  }

  // ════════════ N1 恰内下界 ts=now−299_000 → 200（口层新鲜·全树零臂）════════════
  {
    const txn = 'negN1Txn';
    const ts = Date.now() - 299_000;
    const r = await h.post(WH('NEG_N1'), {}, { providerTxn: txn, ts, sig: sigFor('NEG_N1', txn, 'paid', ts) });
    A('N1 恰内锐缘 ts=now−299_000 合法签 → 200 credited（|now−ts|=299_000 ≤ 300_000）', r.status === 200 && r.body?.result === 'credited', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const row = await orderRow('NEG_N1');
    A('N1 壳行转 paid ∧ provider_txn 落列（窗下界收口·口层传输证据）', row?.status === 'paid' && row?.provider_txn === txn, `row=${JSON.stringify(row)}`);
  }

  // ════════════ N3 恰内上界 ts=now+299_000 → 200（未来恰内·Math.abs 双向·口层新鲜全树零臂）════════════
  {
    const txn = 'negN3Txn';
    const ts = Date.now() + 299_000;
    const r = await h.post(WH('NEG_N3'), {}, { providerTxn: txn, ts, sig: sigFor('NEG_N3', txn, 'paid', ts) });
    A('N3 恰内锐缘 ts=now+299_000 合法签 → 200 credited（未来向·Math.abs 双向窗）', r.status === 200 && r.body?.result === 'credited', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const row = await orderRow('NEG_N3');
    A('N3 壳行转 paid ∧ provider_txn 落列（窗上界收口·预签近未来载荷在窗内被接受=码态真值）', row?.status === 'paid' && row?.provider_txn === txn, `row=${JSON.stringify(row)}`);
  }

  // ════════════ N7 ts 浮点（窗内·载荷同值）→ 200（isFinite 放行形·全树首证行为臂）════════════
  {
    const txn = 'negN7Txn';
    const ts = Date.now() - 60_000 + 0.5;   // JSON 可载：IEEE754 精确表示·序列化/解析双相保值
    const r = await h.post(WH('NEG_N7'), {}, { providerTxn: txn, ts, sig: sigFor('NEG_N7', txn, 'paid', ts) });
    A('N7 ts 浮点（now−60_000+0.5·窗内·载荷同值）→ 200 credited（typeof=number ∧ isFinite 放行）', r.status === 200 && r.body?.result === 'credited', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const row = await orderRow('NEG_N7');
    A('N7 壳行转 paid ∧ provider_txn 落列（全树首证行为臂·浮点非整数 ts 结构性过窗门）', row?.status === 'paid' && row?.provider_txn === txn, `row=${JSON.stringify(row)}`);
  }

  // ════════════ 拒臂沙盒（NEG_REJ·全程 created·每臂五面快照恒等）════════════
  {
    // N2 恰外下界 ts=now−301_000 → 400（口层对照臂·单测层同界已行使 authz5a2:71-74）
    const txn = 'negRejN2Txn';
    const before = await snap('NEG_REJ', 'negRej', txn);
    const ts = Date.now() - 301_000;
    const r = await h.post(WH('NEG_REJ'), {}, { providerTxn: txn, ts, sig: sigFor('NEG_REJ', txn, 'paid', ts) });
    A('N2 恰外 ts=now−301_000 合法签 → 400 invalid_callback（|now−ts|=301_000 > 300_000）', r.status === 400 && r.body?.error === 'invalid_callback', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const after = await snap('NEG_REJ', 'negRej', txn);
    A('N2 零副作用五面快照恒等（订单行/桶数/桶合计/全局两流水行数）', JSON.stringify(before) === JSON.stringify(after), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
  }
  {
    // N4 恰外上界 ts=now+301_000 → 400（未来恰外·口层对照臂）
    const txn = 'negRejN4Txn';
    const before = await snap('NEG_REJ', 'negRej', txn);
    const ts = Date.now() + 301_000;
    const r = await h.post(WH('NEG_REJ'), {}, { providerTxn: txn, ts, sig: sigFor('NEG_REJ', txn, 'paid', ts) });
    A('N4 恰外 ts=now+301_000 合法签 → 400 invalid_callback（未来向·防预签远未来载荷）', r.status === 400 && r.body?.error === 'invalid_callback', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const after = await snap('NEG_REJ', 'negRej', txn);
    A('N4 零副作用五面快照恒等', JSON.stringify(before) === JSON.stringify(after), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
  }
  {
    // N5 ts 字符串数字 → 400（typeof 门 :28-29 前段·口层新鲜——单测层 'soon' 同分支已行使 authz5a2:70）
    const txn = 'negRejN5Txn';
    const before = await snap('NEG_REJ', 'negRej', txn);
    const ts = String(Date.now() - 1_000);   // JSON 字符串形·签名载荷同串（唯 typeof 门可拒·归因最小化）
    const r = await h.post(WH('NEG_REJ'), {}, { providerTxn: txn, ts, sig: sigFor('NEG_REJ', txn, 'paid', ts) });
    A('N5 ts 字符串数字形 → 400 invalid_callback（typeof ts!==number 先于 HMAC·非 403 归因）', r.status === 400 && r.body?.error === 'invalid_callback', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const after = await snap('NEG_REJ', 'negRej', txn);
    A('N5 零副作用五面快照恒等', JSON.stringify(before) === JSON.stringify(after), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
  }
  {
    // N6a ts=null → 400（同门逐形）
    const txn = 'negRejN6aTxn';
    const before = await snap('NEG_REJ', 'negRej', txn);
    const ts = null;
    const r = await h.post(WH('NEG_REJ'), {}, { providerTxn: txn, ts, sig: sigFor('NEG_REJ', txn, 'paid', ts) });
    A('N6a ts=null → 400 invalid_callback（typeof null!==number·JSON null 形）', r.status === 400 && r.body?.error === 'invalid_callback', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const after = await snap('NEG_REJ', 'negRej', txn);
    A('N6a 零副作用五面快照恒等', JSON.stringify(before) === JSON.stringify(after), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
  }
  {
    // N6b ts=true → 400（同门逐形·boolean 形）
    const txn = 'negRejN6bTxn';
    const before = await snap('NEG_REJ', 'negRej', txn);
    const ts = true as const;
    const r = await h.post(WH('NEG_REJ'), {}, { providerTxn: txn, ts, sig: sigFor('NEG_REJ', txn, 'paid', ts) });
    A('N6b ts=true → 400 invalid_callback（typeof boolean!==number·JSON bool 形）', r.status === 400 && r.body?.error === 'invalid_callback', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const after = await snap('NEG_REJ', 'negRej', txn);
    A('N6b 零副作用五面快照恒等', JSON.stringify(before) === JSON.stringify(after), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
  }
  {
    // N8 kind 反向互换：refunded 标签正确 HMAC 打 pay 口 → 403 bad_signature（对偶对称性补齐·全树零臂）
    const txn = 'negRejN8Txn';
    const before = await snap('NEG_REJ', 'negRej', txn);
    const ts = Date.now();   // fresh ts·窗内·签名本身完全合法——唯 kind 标签段与 pay 口期望不符
    const r = await h.post(WH('NEG_REJ'), {}, { providerTxn: txn, ts, sig: sigFor('NEG_REJ', txn, 'refunded', ts) });
    A('N8 refunded 标签签打 pay 口 → 403 bad_signature（kind 入签 :33 对偶不可互换·口层反向臂全树首证）', r.status === 403 && r.body?.error === 'bad_signature', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const after = await snap('NEG_REJ', 'negRej', txn);
    A('N8 零副作用五面快照恒等（验签拒在先·零入账零落列）', JSON.stringify(before) === JSON.stringify(after), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
  }

  // ════════════ N9 跨口继承旁证一臂（refund 口 ts=now−301_000 → 400·单源 verifyCommerceSig 继承证据）════════════
  // Ban 扩铺 refund 400/403 族——uc011 已钉（41+68+LOAD）；本臂仅证同一 ts 门经 /commerce/webhook/refund/:id 同源继承。
  {
    const txn = 'negN9Txn';
    const before = await snap('NEG_N9', 'negN9', txn);
    const ts = Date.now() - 301_000;
    const r = await h.post(RF('NEG_N9'), {}, { providerTxn: txn, ts, sig: sigFor('NEG_N9', txn, 'refunded', ts) });
    A('N9 refund 口 ts=now−301_000 合法签 → 400 invalid_callback（verifyCommerceSig 单源·EXEC 择 Path A 对偶口）', r.status === 400 && r.body?.error === 'invalid_callback', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const after = await snap('NEG_N9', 'negN9', txn);
    A('N9 零副作用五面快照恒等（跨口同门·零落列）', JSON.stringify(before) === JSON.stringify(after), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
  }

  // ════════════ 收卷 ════════════
  console.log(`\n断言合计: ${total} 条, 失败 ${failures.length} 条`);
  console.log('PINS: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null');
  console.log('非替代申明: neg:commerce webhook 族（±360s 远超窗/缺 ts/短签/重放/跨单）· uc014-adv C1–C7（七类）· uc011 41+68+LOAD · authz5a2 单测两形 = 旁证互不替代互不借用');
  if (failures.length > 0) {
    console.log(`HONESTY: EXIT 1 诚实保留 ${GAP_ID} 明细: ${failures.join(' | ')}`);
    console.log('HONESTY: Ban retry-to-green · 红次入 attempts 台账 · Ban 改断言迁就');
    process.exit(1);
  }
  console.log(`HONESTY: EXIT0 = ${'NHP-014-NEG-01'} case 证据 · ≠ covered ≠ 翻行 · 格值 partial 保持 · coveredCount=8 不变`);
  process.exit(0);
})();
