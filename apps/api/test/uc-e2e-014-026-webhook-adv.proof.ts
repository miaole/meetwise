import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boot, paySig } from './_neg-harness';

/**
 * uc-e2e-014-026-webhook-adv.proof.ts — NHP-014-ADV-01 · UC-E2E-014/026 ADV 列 · 支付 webhook ADV 七类真证据。
 *
 * 需求源（口径以此为准，不发明验收标准）：
 *  - e2e-scenarios.md UC-E2E-026(:528 起)：E-伪造签名(:536)/E-篡改金额(:537)/E-重放(:538)；验收 A1-A3(:540)；
 *    TC-E2E-026-forged-sig/tamper-amount/replay(:544-546)。UC-E2E-014(:518 起)：重复回调仅充值一次/金额不符不入账。
 *  - 矩阵：non-happy-path-perf-load-case-matrix.md:60（幂等+拒 · gap→case-only）；e2e-requirement-coverage-matrix.md:119 ADV gap。
 *
 * 产品事实基线（读真实代码得出，断言即据此 · @b790b45）：
 *  - 入口唯一：POST /commerce/webhook/pay/:id（无登录态，commerce-webhook.controller.ts:12，不挂 PrincipalGuard）。
 *  - 验签链（commerce.service.ts:56-70）：缺字段 400 invalid_callback(:57) → HMAC-sha256(`${id}:${txn}:paid`)
 *    + timingSafeEqual，缺密钥/长度/内容不符 fail-closed 403 bad_signature(:58-61) → owner 经无表权限网关
 *    gateway_payment_order_owner 读取（:62-64，不信调用方）→ 查不到单 404 order_not_found(:65) → exactly-once CAS
 *    markOrderPaidAndCredit（:66-68；packages/db/src/payment.ts:59-93：created→paid CAS + provider_txn 全局
 *    partial UNIQUE + savepoint 23505→conflict；同单同 txn 重放→already）。
 *  - 回调体类型仅 {providerTxn, sig}（commerce.service.ts:56），**无金额通道**；金额/units 由服务端 PRODUCTS
 *    目录权威定价（:11-14 pack_10=9900¢/10u · pack_30=24900¢/30u）。
 *
 * EXIT 契约：EXIT 0 当且仅当 C1–C7 每类断言全部成立（HTTP 码+响应体错误码+DB before/after 快照）。
 * 任一做不出 → EXIT 1 诚实保留 gap，打印 GAP-UC014-026-WEBHOOK-ADV 明细。EXIT 0 ≠ 翻行 ≠ covered
 * （coveredCount=8 不动；翻行须 post-prove dual + 协调方授权）。
 *
 * C3 口径（pre-exec dual 裁决①）：结构性断言——回调体无金额通道，夹带金额字段被忽略，入账单位恒等于
 * 目录定价；receipt 显式披露「显式服务端金额复核比较路径今天不存在，当前保障=结构性（无金额通道+服务端权威定价）」。
 *
 * 审计观察点（裁决② disclosed-not-blocking）：每个拒绝类（C1/C2/C3/C7）打印
 * AUDIT-OBSERVATION: absent|observed + file:line 依据；缺席不作 EXIT 门槛（case 行期望=幂等+拒）。
 *
 * 隔离：scripts/run-e2e-isolated.mjs 三层包装（root uc014:webhook-adv:prove → :raw → apps/api prove:*）；
 * 随机容器 + 动态端口；schema 由 _neg-harness boot() 按固定迁移白名单加载；PAY_PROVIDER_SECRET 只经
 * 进程环境（boot() 内 process.env 注入），不入库不入 .env。releaseEvidence=false。
 */

const WH = (id: string) => `/commerce/webhook/pay/${id}`;
const GAP_ID = 'GAP-UC014-026-WEBHOOK-ADV';

type Cls = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7';
const CLASSES: Cls[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'];

let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) { failures.push({ cls, name }); console.log(`FAIL  [${cls}] ${name}`); }
  else console.log(`PASS  [${cls}] ${name}`);
};

/** 审计观察点运行时交叉核验：webhook 产品路径是否存在 GuardrailHit/安全日志/审计落库 emit 点。 */
function auditObservationBasis(): { absent: boolean; hits: number; files: string[] } {
  const files = [
    '../src/modules/commerce/commerce.service.ts',
    '../src/modules/commerce/commerce-webhook.controller.ts',
  ];
  let hits = 0;
  for (const f of files) {
    const src = readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');
    hits += (src.match(/GuardrailHit|audit[_-]?log|security[_-]?log/g) ?? []).length;
  }
  return { absent: hits === 0, hits, files };
}
const auditBasis = auditObservationBasis();
const AUDIT_LINE = (cls: string) =>
  console.log(
    `AUDIT-OBSERVATION: ${auditBasis.absent ? 'absent' : 'observed'} class=${cls} ` +
    `basis=apps/api/src/modules/commerce/commerce.service.ts:56-70 + commerce-webhook.controller.ts:11-16 ` +
    `(runtime scan of webhook product path: ${auditBasis.hits} GuardrailHit/audit-log/security-log emit points; ` +
    `pre-exec dual 全仓 grep GuardrailHit=0 命中) — disclosed-not-blocking，非 EXIT 门槛；` +
    `缺席作具名 residual「审计后置未接线」带进 post-prove dual。`,
  );

(async () => {
  const h = await boot();
  const pool = h.pool;

  // ── DB 快照/终态工具（特权 pool 直查，绕 RLS；只读）──
  const orderRow = async (id: string) =>
    (await pool.query('SELECT id, owner_user_id, status, units, amount_cents, provider_txn FROM payment_order WHERE id=$1', [id])).rows[0] ?? null;
  const bucketCount = async (owner: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].n);
  const bucketSum = async (owner: string) =>
    Number((await pool.query('SELECT COALESCE(SUM(units_total),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].s);
  const txnRows = async (txn: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM payment_order WHERE provider_txn=$1', [txn])).rows[0].n);
  const sig = (orderId: string, txn: string) => paySig(`${orderId}:${txn}:paid`);
  const goodBody = (orderId: string, txn: string) => ({ providerTxn: txn, sig: sig(orderId, txn) });

  // ── 隔离 fixtures：每类独立 owner/订单，增量可精确断言（不影响固定种子；不碰 neg:commerce fixture）──
  const F = {
    c1: { ord: 'ADV_C1', owner: 'advC1' },
    c2: { ord: 'ADV_C2', owner: 'advC2' },
    c3a: { ord: 'ADV_C3A', owner: 'advC3A' },
    c3b: { ord: 'ADV_C3B', owner: 'advC3B' },
    c4: { ord: 'ADV_C4', owner: 'advC4' },
    c5a: { ord: 'ADV_C5A', owner: 'advC5A' },
    c5b: { ord: 'ADV_C5B', owner: 'advC5B' },
    c6: { ord: 'ADV_C6', owner: 'advC6' },
    c7: { ord: 'ADV_C7', owner: 'advC7' },
  } as const;
  await pool.query(
    `INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status) VALUES
       ('ADV_C1','advC1','pack_10',9900,10,'created'),
       ('ADV_C2','advC2','pack_10',9900,10,'created'),
       ('ADV_C3A','advC3A','pack_10',9900,10,'created'),
       ('ADV_C3B','advC3B','pack_30',24900,30,'created'),
       ('ADV_C4','advC4','pack_10',9900,10,'created'),
       ('ADV_C5A','advC5A','pack_10',9900,10,'created'),
       ('ADV_C5B','advC5B','pack_10',9900,10,'created'),
       ('ADV_C6','advC6','pack_10',9900,10,'created'),
       ('ADV_C7','advC7','pack_10',9900,10,'created')`);

  console.log('PINS: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · row stays gap');
  console.log('EXIT 契约: EXIT 0 ⇔ C1–C7 全立；任一不成立 → EXIT 1 诚实保留 gap。EXIT 0 ≠ 翻行 ≠ covered。');

  // ════════════════════════════════════════════════════════════════════════
  // C1 伪造签名（合法单+合法 txn，错签/垃圾 sig）→ 403 bad_signature + 零副作用
  // ════════════════════════════════════════════════════════════════════════
  {
    const { ord, owner } = F.c1;
    const txn = 'advC1Txn';
    const before = { order: await orderRow(ord), buckets: await bucketCount(owner), sum: await bucketSum(owner) };
    // 错签：等长 hex（对无关字符串算的 HMAC）→ 内容不符
    const r1 = await h.post(WH(ord), {}, { providerTxn: txn, sig: paySig('forged-unrelated-string') });
    A('C1', '伪造签名(等长 hex) → 403 bad_signature', r1.status === 403 && r1.body?.error === 'bad_signature');
    // 垃圾短 sig → 长度不符分支 fail-closed
    const r2 = await h.post(WH(ord), {}, { providerTxn: txn, sig: 'zz' });
    A('C1', '垃圾短签名 → 403 bad_signature', r2.status === 403 && r2.body?.error === 'bad_signature');
    // 签名绑定他单（本单 id 不在签名原文里）→ 403
    const r3 = await h.post(WH(ord), {}, { providerTxn: txn, sig: sig('ADV_C1_OTHER_ORDER', txn) });
    A('C1', '他单签名打到本单 → 403 bad_signature', r3.status === 403 && r3.body?.error === 'bad_signature');
    // 零副作用 DB 快照：PaymentOrder 状态/流水/units/amount 全不变；桶数与合计不变；txn 全局 0 行
    const after = { order: await orderRow(ord), buckets: await bucketCount(owner), sum: await bucketSum(owner) };
    A('C1', '零副作用: 订单 status 仍 created', after.order?.status === 'created' && before.order?.status === 'created');
    A('C1', '零副作用: provider_txn 仍 NULL（未落流水）', after.order?.provider_txn === null);
    A('C1', '零副作用: 订单 units/amount 不变(10/9900)', Number(after.order?.units) === 10 && Number(after.order?.amount_cents) === 9900);
    A('C1', '零副作用: entitlement 桶数/合计不变', after.buckets === before.buckets && after.sum === before.sum);
    A('C1', '零副作用: provider_txn 全局 0 行', (await txnRows(txn)) === 0);
    AUDIT_LINE('C1');
  }

  // ════════════════════════════════════════════════════════════════════════
  // C2 缺字段（缺 sig / 缺 providerTxn / 空 body）→ 400 invalid_callback + 零副作用
  // ════════════════════════════════════════════════════════════════════════
  {
    const { ord, owner } = F.c2;
    const before = { order: await orderRow(ord), buckets: await bucketCount(owner), sum: await bucketSum(owner) };
    const r1 = await h.post(WH(ord), {}, {});
    A('C2', '空 body → 400 invalid_callback', r1.status === 400 && r1.body?.error === 'invalid_callback');
    const r2 = await h.post(WH(ord), {}, { providerTxn: 'advC2Txn' });
    A('C2', '缺 sig → 400 invalid_callback', r2.status === 400 && r2.body?.error === 'invalid_callback');
    const r3 = await h.post(WH(ord), {}, { sig: sig(ord, 'advC2Txn') });
    A('C2', '缺 providerTxn → 400 invalid_callback', r3.status === 400 && r3.body?.error === 'invalid_callback');
    const after = { order: await orderRow(ord), buckets: await bucketCount(owner), sum: await bucketSum(owner) };
    A('C2', '零副作用: 订单 status 仍 created + provider_txn 仍 NULL', after.order?.status === 'created' && after.order?.provider_txn === null);
    A('C2', '零副作用: 桶数/合计不变', after.buckets === before.buckets && after.sum === before.sum);
    A('C2', '零副作用: provider_txn 全局 0 行', (await txnRows('advC2Txn')) === 0);
    AUDIT_LINE('C2');
  }

  // ════════════════════════════════════════════════════════════════════════
  // C3 篡改金额/夹带金额字段（结构性断言 · 裁决①）：回调体无金额通道 → 夹带字段被忽略，
  //     入账单位恒等于目录定价（pack_10=10 / pack_30=30）。
  //     DISCLOSED: 显式服务端金额复核比较路径今天不存在，当前保障=结构性（无金额通道+服务端权威定价）。
  // ════════════════════════════════════════════════════════════════════════
  {
    console.log('DISCLOSED: 显式服务端金额复核比较路径今天不存在，当前保障=结构性（无金额通道+服务端权威定价）。');
    console.log('DISCLOSED: 依据 commerce.service.ts:56（回调体类型仅 {providerTxn, sig}，无金额字段）+ :11-14（PRODUCTS 服务端权威定价）；webhook 路径无任何金额读取。');
    const { ord: ordA, owner: ownerA } = F.c3a;
    const { ord: ordB, owner: ownerB } = F.c3b;
    const beforeA = { buckets: await bucketCount(ownerA), sum: await bucketSum(ownerA) };
    const beforeB = { buckets: await bucketCount(ownerB), sum: await bucketSum(ownerB) };
    // 夹带 amountCents=1 / units=999999 / amount=-500 → 全部被忽略（无金额通道），支付本身合法 → credited
    const r1 = await h.post(WH(ordA), {}, { ...goodBody(ordA, 'advC3TxnA'), amountCents: 1, units: 999999, amount: -500 });
    A('C3', '夹带 amountCents/units/amount → 字段被忽略, 回调 200 credited', r1.status === 200 && r1.body?.result === 'credited');
    A('C3', '入账单位恒等于目录定价 pack_10=10（夹带 999999 未入账）', (await bucketSum(ownerA)) === beforeA.sum + 10 && (await bucketCount(ownerA)) === beforeA.buckets + 1);
    A('C3', '订单落库 units/amount 仍目录权威 10/9900（夹带值未落库）',
      Number((await orderRow(ordA))?.units) === 10 && Number((await orderRow(ordA))?.amount_cents) === 9900);
    // pack_30 同样夹带 → 恒等于目录定价 30
    const r2 = await h.post(WH(ordB), {}, { ...goodBody(ordB, 'advC3TxnB'), amountCents: 999999, units: 1 });
    A('C3', 'pack_30 夹带 amountCents=999999/units=1 → 忽略, 200 credited', r2.status === 200 && r2.body?.result === 'credited');
    A('C3', '入账单位恒等于目录定价 pack_30=30（夹带 1 未入账）', (await bucketSum(ownerB)) === beforeB.sum + 30 && (await bucketCount(ownerB)) === beforeB.buckets + 1);
    A('C3', '订单落库 units/amount 仍目录权威 30/24900',
      Number((await orderRow(ordB))?.units) === 30 && Number((await orderRow(ordB))?.amount_cents) === 24900);
    A('C3', '结构性双拦: 全局无第二条流水（每单恰 1 行 txn）', (await txnRows('advC3TxnA')) === 1 && (await txnRows('advC3TxnB')) === 1);
    AUDIT_LINE('C3');
  }

  // ════════════════════════════════════════════════════════════════════════
  // C4 同单同 txn 顺序重放 → 首 credited / 次 already；桶恰 1；入账额恰单份
  // ════════════════════════════════════════════════════════════════════════
  {
    const { ord, owner } = F.c4;
    const txn = 'advC4Txn';
    const before = { buckets: await bucketCount(owner), sum: await bucketSum(owner) };
    const w1 = await h.post(WH(ord), {}, goodBody(ord, txn));
    const w2 = await h.post(WH(ord), {}, goodBody(ord, txn));
    A('C4', '首次回调 → 200 credited', w1.status === 200 && w1.body?.result === 'credited');
    A('C4', '重放回调 → 200 already（幂等去重，不双入）', w2.status === 200 && w2.body?.result === 'already');
    A('C4', '桶恰 +1（不重复入账）', (await bucketCount(owner)) === before.buckets + 1);
    A('C4', '入账额恰单份 10', (await bucketSum(owner)) === before.sum + 10);
    A('C4', 'provider_txn 全局恰 1 行', (await txnRows(txn)) === 1);
    const o = await orderRow(ord);
    A('C4', '终态: status=paid 且 provider_txn=注入 txn', o?.status === 'paid' && o?.provider_txn === txn);
  }

  // ════════════════════════════════════════════════════════════════════════
  // C5 同 providerTxn 跨订单重放 → 恰一笔 credited；另一笔 409 order_conflict（非 5xx）；
  //     provider_txn 落库恰 1 行；两账户合计恰单份
  // ════════════════════════════════════════════════════════════════════════
  {
    const txn = 'advC5Txn';
    const { ord: ordA, owner: ownerA } = F.c5a;
    const { ord: ordB, owner: ownerB } = F.c5b;
    const w1 = await h.post(WH(ordA), {}, goodBody(ordA, txn));
    const w2 = await h.post(WH(ordB), {}, goodBody(ordB, txn));   // 同流水重放指向第二张订单
    A('C5', '第一张订单 → 200 credited', w1.status === 200 && w1.body?.result === 'credited');
    A('C5', '跨订单重放 → 409 order_conflict（非 5xx）', w2.status === 409 && w2.body?.error === 'order_conflict');
    A('C5', 'provider_txn 全局恰 1 行', (await txnRows(txn)) === 1);
    const rowA = await orderRow(ordA);
    const rowB = await orderRow(ordB);
    A('C5', '唯一流水归属第一张订单（B 仍 created + provider_txn NULL）', rowA?.provider_txn === txn && rowB?.status === 'created' && rowB?.provider_txn === null);
    A('C5', '两账户合计恰单份 10（A=10, B=0）', (await bucketSum(ownerA)) === 10 && (await bucketSum(ownerB)) === 0);
  }

  // ════════════════════════════════════════════════════════════════════════
  // C6 并发同单同 txn 双回调 → 恰一个 credited；无双入；无 stuck（落为 DB 终态断言）
  // ════════════════════════════════════════════════════════════════════════
  {
    const { ord, owner } = F.c6;
    const txn = 'advC6Txn';
    const before = { buckets: await bucketCount(owner), sum: await bucketSum(owner) };
    const body = goodBody(ord, txn);
    const rs = await Promise.all([h.post(WH(ord), {}, body), h.post(WH(ord), {}, body)]);
    A('C6', '并发双回调 → 无 5xx（都 200）', rs.every((r) => r.status === 200));
    A('C6', '恰一个 credited（CAS 裁决，不双结算）', rs.map((r) => r.body?.result).filter((x) => x === 'credited').length === 1);
    A('C6', '另一个为 already（幂等收敛）', rs.map((r) => r.body?.result).filter((x) => x === 'already').length === 1);
    // 无 stuck → 具名 DB 终态断言（Conditions C-4）：双回调完成后订单终态唯一确定
    const o = await orderRow(ord);
    A('C6', '无 stuck 终态: payment_order.status=paid', o?.status === 'paid');
    A('C6', '无 stuck 终态: provider_txn=注入 txn', o?.provider_txn === txn);
    A('C6', '无 stuck 终态: 桶 delta=1 且入账恰单份 10', (await bucketCount(owner)) === before.buckets + 1 && (await bucketSum(owner)) === before.sum + 10);
    A('C6', '无 stuck 终态: provider_txn 全局恰 1 行（无双行）', (await txnRows(txn)) === 1);
  }

  // ════════════════════════════════════════════════════════════════════════
  // C7 未知订单 / 冒充 owner → 404 order_not_found（签名再对也不入账）；
  //     owner 不可伪造（owner-gateway 不信调用方）+ 零副作用快照
  // ════════════════════════════════════════════════════════════════════════
  {
    // c7a: 未知订单（签名对该不存在 id）→ 404，零副作用
    const ghost = 'ADV_C7_GHOST_' + randomUUID();
    const ghostTxn = 'advC7GhostTxn';
    const r1 = await h.post(WH(ghost), {}, goodBody(ghost, ghostTxn));
    A('C7', '未知订单(合法签名) → 404 order_not_found', r1.status === 404 && r1.body?.error === 'order_not_found');
    A('C7', '零副作用: 幽灵单不落库', (await orderRow(ghost)) === null);
    A('C7', '零副作用: provider_txn 全局 0 行', (await txnRows(ghostTxn)) === 0);
    A('C7', '零副作用: 幽灵 owner 无桶', (await bucketCount('advC7GhostOwner')) === 0);
    // c7b: body 冒充 owner（想把额度记到攻击者名下）→ owner 只信 DB 网关，冒充被忽略
    const { ord, owner } = F.c7;
    const before = { buckets: await bucketCount(owner), sum: await bucketSum(owner) };
    const r2 = await h.post(WH(ord), {}, { ...goodBody(ord, 'advC7Txn'), owner: 'advAttacker', owner_user_id: 'advAttacker' });
    A('C7', 'body 夹带 owner 冒充 → owner 不可伪造, 入账真 owner', r2.status === 200 && r2.body?.result === 'credited');
    A('C7', '攻击者 advAttacker 0 桶（冒充无效）', (await bucketCount('advAttacker')) === 0 && (await bucketSum('advAttacker')) === 0);
    A('C7', '真 owner 入账恰单份 10', (await bucketSum(owner)) === before.sum + 10 && (await bucketCount(owner)) === before.buckets + 1);
    const o = await orderRow(ord);
    A('C7', '终态: 订单 paid 且流水归属真订单', o?.status === 'paid' && o?.provider_txn === 'advC7Txn' && o?.owner_user_id === owner);
    AUDIT_LINE('C7');
  }

  // ── EXIT 裁决 ──
  console.log(`\n断言合计: ${total} 条, 失败 ${failures.length} 条`);
  const byClass = Object.fromEntries(CLASSES.map((c) => [c, failures.filter((f) => f.cls === c).length]));
  for (const c of CLASSES) console.log(`  ${c}: ${byClass[c] === 0 ? 'ALL PASS' : `${byClass[c]} FAILED`}`);

  if (failures.length > 0) {
    console.log(`\n${GAP_ID} — 诚实保留 gap（EXIT 1 · 非 flake · 非环境问题 · Ban invent fix）:`);
    for (const f of failures) {
      console.log(`  GAP-ITEM class=${f.cls} assertion="${f.name}"`);
    }
    console.log('  依据: apps/api/src/modules/commerce/commerce.service.ts:56-70 · packages/db/src/commerce/payment.ts:59-93 · commerce-webhook.controller.ts:11-16');
    console.log('  处置: row UC-E2E-014/026 ADV 保持 gap → case-only 停留；不翻行；attempts 台账记 EXIT=1。');
    process.exit(1);
  }
  console.log(`\nEXIT=0 — C1–C7 七类 webhook ADV 真证据全部成立（${total} 条断言全绿）。`);
  console.log('EXIT 0 ≠ 翻行 ≠ covered：ADV gap→partial 须 post-prove dual PASS + 协调方授权；coveredCount=8 不动。');
  console.log('releaseEvidence=false · NOT_HA · local green ≠ HA · need multi-instance + fault-inject for releaseEvidence.');
  process.exit(0);
})().catch((e) => {
  console.error(`${GAP_ID} harness 崩溃（EXIT 1 · 记入 attempts 台账 · 非 flake）:`, e);
  process.exit(1);
});
