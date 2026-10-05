/**
 * uc-e2e-011-refund-callback-mouth.proof.ts — GAP-UC011-REFUND-CALLBACK · Path A
 * refund-callback 产品口可测真证据（Line Z · coding+prove）。
 *
 * 需求源（不发明验收）：
 *  - harness/gap-uc011-refund-callback-product-mouth.md B-1 pins
 *  - e2e-scenarios.md E3/A3/TC-E2E-011-refund-idem · 契约 POST /payment/refund-callback 或等价 webhook
 *  - 对齐 payWebhook / UC014：400 invalid_callback · 403 bad_signature · 404 order_not_found ·
 *    200 {result: refunded|already} · 金额 DISCLOSED 无通道
 *
 * 产品口钉死：POST /commerce/webhook/refund/:id（等价 webhook · HMAC 标签 `refunded`）
 *
 * EXIT 契约：
 *  - EXIT 0 ⇔ 口已挂载 + M1/M2 + 拒签具名 403 bad_signature + 适用时 400/404 具名行 + 零双退。
 *  - EXIT 0 ≠ UC-011 covered ≠ ADV wash ≠ 关 GAP-UC011-ADV-01 · coveredCount=8 不变。
 *  - Ban any-non-404-4xx-as-sig-evidence · Ban invent covered · Ban self-nail。
 *
 * 隔离：pnpm uc011:refund-callback:prove → run-e2e-isolated → apps/api prove:uc011-refund-callback-mouth
 * PAY_PROVIDER_SECRET 仅进程环境 · Ban live · Ban secrets · releaseEvidence=false · NOT_HA。
 */
import { randomUUID } from 'node:crypto';
import { boot, paySig } from './_neg-harness';

const WH = (id: string) => `/commerce/webhook/refund/${id}`;
const GAP_ID = 'GAP-UC011-REFUND-CALLBACK';
const CMD = 'pnpm uc011:refund-callback:prove';

type Cls = 'SIG' | 'INV' | 'NF' | 'AMT' | 'M1' | 'M2' | 'M2x';
const CLASSES: Cls[] = ['SIG', 'INV', 'NF', 'AMT', 'M1', 'M2', 'M2x'];

let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) { failures.push({ cls, name }); console.log(`FAIL  [${cls}] ${name}`); }
  else console.log(`PASS  [${cls}] ${name}`);
};

(async () => {
  const h = await boot();
  const pool = h.pool;

  const orderRow = async (id: string) =>
    (await pool.query(
      'SELECT id, owner_user_id, status, units, amount_cents, provider_txn, refund_provider_txn FROM payment_order WHERE id=$1',
      [id],
    )).rows[0] ?? null;
  const bucketCount = async (owner: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].n);
  const bucketSum = async (owner: string) =>
    Number((await pool.query('SELECT COALESCE(SUM(units_total),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].s);
  const availSum = async (owner: string) =>
    Number((await pool.query(
      `SELECT COALESCE(SUM(units_total - units_reserved - units_consumed),0)::float8 s
         FROM entitlement_bucket WHERE owner_user_id=$1`, [owner],
    )).rows[0].s);
  const refundTxnRows = async (txn: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM payment_order WHERE refund_provider_txn=$1', [txn])).rows[0].n);
  const sig = (orderId: string, txn: string) => paySig(`${orderId}:${txn}:refunded`);
  const goodBody = (orderId: string, txn: string) => ({ providerTxn: txn, sig: sig(orderId, txn) });

  // Fixtures: paid orders with credited unused entitlement (红冲前置)
  const F = {
    sig: { ord: 'RF_SIG', owner: 'rfSig', payTxn: 'rfSigPay', units: 10 },
    inv: { ord: 'RF_INV', owner: 'rfInv', payTxn: 'rfInvPay', units: 10 },
    nf: { ord: 'RF_NF', owner: 'rfNf', payTxn: 'rfNfPay', units: 10 },
    amt: { ord: 'RF_AMT', owner: 'rfAmt', payTxn: 'rfAmtPay', units: 10 },
    m1: { ord: 'RF_M1', owner: 'rfM1', payTxn: 'rfM1Pay', units: 10 },
    m2: { ord: 'RF_M2', owner: 'rfM2', payTxn: 'rfM2Pay', units: 10 },
    m2a: { ord: 'RF_M2A', owner: 'rfM2A', payTxn: 'rfM2APay', units: 10 },
    m2b: { ord: 'RF_M2B', owner: 'rfM2B', payTxn: 'rfM2BPay', units: 10 },
  } as const;

  await pool.query(
    `INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status,provider_txn) VALUES
       ('RF_SIG','rfSig','pack_10',9900,10,'paid','rfSigPay'),
       ('RF_INV','rfInv','pack_10',9900,10,'paid','rfInvPay'),
       ('RF_NF','rfNf','pack_10',9900,10,'paid','rfNfPay'),
       ('RF_AMT','rfAmt','pack_10',9900,10,'paid','rfAmtPay'),
       ('RF_M1','rfM1','pack_10',9900,10,'paid','rfM1Pay'),
       ('RF_M2','rfM2','pack_10',9900,10,'paid','rfM2Pay'),
       ('RF_M2A','rfM2A','pack_10',9900,10,'paid','rfM2APay'),
       ('RF_M2B','rfM2B','pack_10',9900,10,'paid','rfM2BPay')`);
  for (const x of Object.values(F)) {
    await pool.query(
      `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
       VALUES ($1,'paid',$2, now()+interval '365 days')`,
      [x.owner, x.units]);
  }

  console.log('PINS: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · UC-011 stays partial · ADV stays gap/case-only');
  console.log(`CMD=${CMD}`);
  console.log('MOUTH: POST /commerce/webhook/refund/:id （等价 webhook · HMAC 标签 refunded）');
  console.log('EXIT 契约: EXIT 0 ⇔ B-1 pins 全命中；EXIT0 ≠ covered · Ban wash ADV · Ban any-non-404-4xx-as-sig-evidence');
  console.log('DISCLOSED: 回调体仅 {providerTxn,sig} · 无金额通道 · Ban 假称已做显式金额复核（对齐 UC014 C3）');

  // ── INV · 缺字段 → 400 invalid_callback + 零副作用 ──
  {
    const { ord, owner } = F.inv;
    const before = { order: await orderRow(ord), buckets: await bucketCount(owner), sum: await bucketSum(owner), avail: await availSum(owner) };
    const r1 = await h.post(WH(ord), {}, {});
    A('INV', '空 body → 400 invalid_callback', r1.status === 400 && r1.body?.error === 'invalid_callback');
    const r2 = await h.post(WH(ord), {}, { providerTxn: 'rfInvTxn' });
    A('INV', '缺 sig → 400 invalid_callback', r2.status === 400 && r2.body?.error === 'invalid_callback');
    const r3 = await h.post(WH(ord), {}, { sig: sig(ord, 'rfInvTxn') });
    A('INV', '缺 providerTxn → 400 invalid_callback', r3.status === 400 && r3.body?.error === 'invalid_callback');
    // Ban any-non-404-4xx：必须是具名 invalid_callback，不是裸 400
    A('INV', '具名码=invalid_callback（Ban any-non-404-4xx-as-sig-evidence）',
      r1.body?.error === 'invalid_callback' && r2.body?.error === 'invalid_callback' && r3.body?.error === 'invalid_callback');
    const after = { order: await orderRow(ord), buckets: await bucketCount(owner), sum: await bucketSum(owner), avail: await availSum(owner) };
    A('INV', '零副作用: status 仍 paid · refund_provider_txn NULL', after.order?.status === 'paid' && after.order?.refund_provider_txn === null);
    A('INV', '零副作用: 桶/可用额度不变', after.buckets === before.buckets && after.sum === before.sum && after.avail === before.avail);
  }

  // ── SIG · 错签/垃圾签 → 403 bad_signature + 零副作用（真验签证据）──
  {
    const { ord, owner } = F.sig;
    const txn = 'rfSigTxn';
    const before = { order: await orderRow(ord), buckets: await bucketCount(owner), sum: await bucketSum(owner), avail: await availSum(owner) };
    const r1 = await h.post(WH(ord), {}, { providerTxn: txn, sig: paySig('forged-unrelated-string') });
    A('SIG', '伪造签名(等长 hex) → 403 bad_signature', r1.status === 403 && r1.body?.error === 'bad_signature');
    const r2 = await h.post(WH(ord), {}, { providerTxn: txn, sig: 'zz' });
    A('SIG', '垃圾短签名 → 403 bad_signature', r2.status === 403 && r2.body?.error === 'bad_signature');
    const r3 = await h.post(WH(ord), {}, { providerTxn: txn, sig: sig('RF_OTHER_ORDER', txn) });
    A('SIG', '他单签名打到本单 → 403 bad_signature', r3.status === 403 && r3.body?.error === 'bad_signature');
    // paid 标签签名打到 refund 口 → 403（标签必须 refunded）
    const r4 = await h.post(WH(ord), {}, { providerTxn: txn, sig: paySig(`${ord}:${txn}:paid`) });
    A('SIG', 'pay 标签签名打到 refund 口 → 403 bad_signature', r4.status === 403 && r4.body?.error === 'bad_signature');
    A('SIG', '具名码=bad_signature（Ban any-non-404-4xx-as-sig-evidence）',
      [r1, r2, r3, r4].every((r) => r.status === 403 && r.body?.error === 'bad_signature'));
    const after = { order: await orderRow(ord), buckets: await bucketCount(owner), sum: await bucketSum(owner), avail: await availSum(owner) };
    A('SIG', '零副作用: status 仍 paid · refund_provider_txn NULL', after.order?.status === 'paid' && after.order?.refund_provider_txn === null);
    A('SIG', '零副作用: 桶/可用额度不变', after.buckets === before.buckets && after.sum === before.sum && after.avail === before.avail);
    A('SIG', '零副作用: refund_provider_txn 全局 0 行', (await refundTxnRows(txn)) === 0);
  }

  // ── NF · 未知 order → 404 order_not_found（≠ 口缺失 404）──
  {
    const ghost = 'RF_GHOST_' + randomUUID();
    const ghostTxn = 'rfGhostTxn';
    const r1 = await h.post(WH(ghost), {}, goodBody(ghost, ghostTxn));
    A('NF', '未知订单(合法签名) → 404 order_not_found', r1.status === 404 && r1.body?.error === 'order_not_found');
    A('NF', '口已挂载: 响应具名 order_not_found（≠ 口缺失裸 404 无体）', r1.body?.error === 'order_not_found');
    A('NF', '零副作用: 幽灵单不落库', (await orderRow(ghost)) === null);
    A('NF', '零副作用: refund_provider_txn 全局 0 行', (await refundTxnRows(ghostTxn)) === 0);
    // 口存活旁证：对合法 paid 单错签仍 403（不是 404）——证明路由已挂
    const mouthAlive = await h.post(WH(F.nf.ord), {}, { providerTxn: 'x', sig: 'zz' });
    A('NF', '口已挂载旁证: 合法单错签 → 403（≠ 口缺失 404）', mouthAlive.status === 403 && mouthAlive.body?.error === 'bad_signature');
  }

  // ── AMT · 金额 DISCLOSED：夹带金额字段被忽略；红冲单位=订单权威 units ──
  {
    console.log('DISCLOSED: 显式服务端金额复核比较路径今天不存在；当前保障=结构性（无金额通道+服务器权威 units）。');
    const { ord, owner } = F.amt;
    const txn = 'rfAmtTxn';
    const before = { avail: await availSum(owner), sum: await bucketSum(owner) };
    const r1 = await h.post(WH(ord), {}, { ...goodBody(ord, txn), amountCents: 1, units: 999999, amount: -500 });
    A('AMT', '夹带 amountCents/units/amount → 字段被忽略, 200 refunded', r1.status === 200 && r1.body?.result === 'refunded');
    A('AMT', '红冲单位恒等于订单权威 units=10（夹带 999999 未入账）', (await availSum(owner)) === before.avail - 10);
    A('AMT', '订单落库 units/amount 仍权威 10/9900',
      Number((await orderRow(ord))?.units) === 10 && Number((await orderRow(ord))?.amount_cents) === 9900);
    A('AMT', '终态 refunded + refund_provider_txn 落库',
      (await orderRow(ord))?.status === 'refunded' && (await orderRow(ord))?.refund_provider_txn === txn);
  }

  // ── M1 · 合法首次退 → 200 {result:'refunded'} + paid→refunded + 红冲一次 ──
  {
    const { ord, owner } = F.m1;
    const txn = 'rfM1Txn';
    const before = { avail: await availSum(owner), sum: await bucketSum(owner), buckets: await bucketCount(owner) };
    const r1 = await h.post(WH(ord), {}, goodBody(ord, txn));
    A('M1', '合法首次退 → 200 {result: refunded}', r1.status === 200 && r1.body?.result === 'refunded');
    const o = await orderRow(ord);
    A('M1', 'DB paid→refunded CAS', o?.status === 'refunded');
    A('M1', 'refund_provider_txn 落库=注入 txn', o?.refund_provider_txn === txn);
    A('M1', '权益红冲一次: available −10', (await availSum(owner)) === before.avail - 10);
    A('M1', 'units_total 合计 −10（红冲写桶）', (await bucketSum(owner)) === before.sum - 10);
    A('M1', 'refund_provider_txn 全局恰 1 行', (await refundTxnRows(txn)) === 1);
  }

  // ── M2 · 同键重放 → 200 {result:'already'} + 无双退 ──
  {
    const { ord, owner } = F.m2;
    const txn = 'rfM2Txn';
    const before = { avail: await availSum(owner), sum: await bucketSum(owner) };
    const w1 = await h.post(WH(ord), {}, goodBody(ord, txn));
    const mid = { avail: await availSum(owner), sum: await bucketSum(owner) };
    const w2 = await h.post(WH(ord), {}, goodBody(ord, txn));
    A('M2', '首次 → 200 refunded', w1.status === 200 && w1.body?.result === 'refunded');
    A('M2', '同键重放 → 200 already', w2.status === 200 && w2.body?.result === 'already');
    A('M2', '无双退: 重放后 available 不变（仍 −10 一次）', mid.avail === before.avail - 10 && (await availSum(owner)) === mid.avail);
    A('M2', '无双退: units_total 合计不变', mid.sum === before.sum - 10 && (await bucketSum(owner)) === mid.sum);
    A('M2', '无双退: status 仍 refunded · txn 不变',
      (await orderRow(ord))?.status === 'refunded' && (await orderRow(ord))?.refund_provider_txn === txn);
    A('M2', 'refund_provider_txn 全局恰 1 行', (await refundTxnRows(txn)) === 1);
  }

  // ── M2′ · 跨单同流水 → 409 order_conflict · 恰一单退成 ──
  {
    const txn = 'rfM2xTxn';
    const { ord: ordA, owner: ownerA } = F.m2a;
    const { ord: ordB, owner: ownerB } = F.m2b;
    const w1 = await h.post(WH(ordA), {}, goodBody(ordA, txn));
    const w2 = await h.post(WH(ordB), {}, goodBody(ordB, txn));
    A('M2x', '第一张 → 200 refunded', w1.status === 200 && w1.body?.result === 'refunded');
    A('M2x', '跨单同流水 → 409 order_conflict', w2.status === 409 && w2.body?.error === 'order_conflict');
    A('M2x', '恰一单退成: A refunded · B 仍 paid',
      (await orderRow(ordA))?.status === 'refunded' && (await orderRow(ordB))?.status === 'paid');
    A('M2x', 'refund_provider_txn 全局恰 1 行', (await refundTxnRows(txn)) === 1);
    A('M2x', 'B 无红冲: available 仍 10', (await availSum(ownerB)) === 10);
    A('M2x', 'A 红冲一次: available 0', (await availSum(ownerA)) === 0);
  }

  // ── EXIT ──
  console.log(`\n断言合计: ${total} 条, 失败 ${failures.length} 条`);
  for (const c of CLASSES) {
    const n = failures.filter((f) => f.cls === c).length;
    console.log(`  ${c}: ${n === 0 ? 'ALL PASS' : `${n} FAILED`}`);
  }
  console.log('HONESTY: EXIT0≠covered · ADV not closed · UC-011 stays partial · coveredCount=8 · GAP-UC011-ADV-01 stays OPEN');
  console.log('HONESTY: Ban wash ADV via this knife · Ban invent covered · Ban self-nail');

  if (failures.length > 0) {
    console.log(`\n${GAP_ID} — 诚实保留（EXIT 1）:`);
    for (const f of failures) console.log(`  GAP-ITEM class=${f.cls} assertion="${f.name}"`);
    process.exit(1);
  }
  console.log(`\nEXIT=0 — Path A B-1 pins 全命中（${total} 条）。口=POST /commerce/webhook/refund/:id`);
  console.log('EXIT 0 ≠ UC-011 covered ≠ ADV covered · 独立 covered-lift + dual + 协调方 nail 另刀。');
  console.log('releaseEvidence=false · NOT_HA · PG-retained · public DELETE=503');
  process.exit(0);
})().catch((e) => {
  console.error(`${GAP_ID} harness 崩溃（EXIT 1）:`, e);
  process.exit(1);
});
