/**
 * uc-e2e-014-nhp-bound.proof.ts — NHP-014-BOUND-01 · UC-E2E-014/026 BOUND 残余亚层 · 双口分叉+生命周期重放边界
 * (webhook-neg 刀 case 2 · REQUEST=ai-docs/delivery/harness/webhook-neg-REQUEST.md
 *  · 覆盖矩阵 §1.0.1 UC-E2E-014/026 行 BOUND cell「入账幂等」残余亚层)
 *
 * 需求源（口径以此为准，不发明验收标准）：
 *  - e2e-scenarios.md :538（E-重放 幂等去重边界）+ 覆盖矩阵 BOUND 格「入账幂等」读法
 *    + 两分立 partial UNIQUE 语义（0020_commerce_terminal_integrity.sql:20-21 `uq_payment_order_provider_txn`
 *    / 0136_payment_order_refund_provider_txn.sql:27-29 `uq_payment_order_refund_provider_txn`——
 *    两索引分立·无跨 kind 约束·全迁移目录 grep 亲证零 CHECK）。
 *  - 本 case=双口分叉语义证人 + 生命周期重放边界（非跨口幂等统一化 claim·Ban 借 B1/B2 宣「跨口幂等已统一」）。
 *
 * 产品事实基线（读真实代码得出，断言即据此 · 并线 merge `69997bd42` 届值亲读）：
 *  - markOrderPaidAndCredit（packages/db/src/commerce/payment.ts:65-109）：CAS :77-87
 *    `status='created' AND channel='online' AND NOT EXISTS(provider_txn 同)`·savepoint 23505→conflict :89-94·
 *    回读 :105-108：`status='paid' ∧ provider_txn 同` → already :107·否则 conflict :108。
 *  - markOrderRefunded（:122-189）：CAS :130-139 `status='paid' AND NOT EXISTS(refund_provider_txn 同)`·
 *    红冲 FIFO :146-172（owner 可用桶扣 order.units·不足回滚 conflict :173-178）·
 *    回读 :183-188：`status='refunded' ∧ refund_provider_txn 同` → already :187·否则 conflict :188。
 *  - 两 CAS 生命周期门互斥：refund-on-created（B3·created 壳 CAS 不中→回读非 refunded→409）/ 
 *    pay-on-refunded（B4·refunded 壳 CAS 不中→回读非 paid→409）/ 退款后原支付流水重放（B5·:107 already
 *    只认 status='paid'——幂等不跨生命周期倒退复活→409 非 already）/ refund 换流水二次（B6·refund 侧对偶
 *    neg:commerce:552-557 补齐）。
 *
 * egress 形（r2 席2 P2-A/P2-B 钉）：boot() 进程内真栈（_neg-harness 单源）——回调密钥只经 boot() 进程环境注入，
 * 两模型环境键由 harness 内自删（两键实形）；本文件**零环境变量词面**（零含词·provider-egress-inventory 零新条目·
 * additive 零条目形如实登记收据；支付回调密钥不在 egress 扫域·Ban 新增登记）。
 *
 * 隔离：run-e2e-isolated 三层壳（uc014:nhp-bound:prove → :raw → prove:uc014-nhp-bound）· 随机容器+动态端口 ·
 * 壳行种子三态=隔离夹具裸 INSERT（§5 豁免枚举①：payment_order 'created'/'paid'+provider_txn 预置/
 * 'refunded'+双列预置·webhook-adv :105-115 先例形）+ 桶种子 entitlement_bucket（§5 豁免枚举②：B1 红冲净账面·
 * uc-e2e-016-nhp-neg.proof.ts:119 承 cf1e570b:323 先例形）——枚举外裸 INSERT 即违 Ban。
 * EXIT 契约：EXIT 0 ⇔ B1–B6 每臂断言全部成立；任一红 → EXIT 1 诚实保留（attempts 台账·Ban retry-to-green·
 * Ban 改断言迁就·产品缺陷=EXIT1 诚实保留+backlog 登记）。EXIT 0 = case 证据 ≠ covered ≠ 翻行
 * （格值 partial 保持·coveredCount=8 不动·翻面权归协调方）。
 */

import { boot, paySig } from './_neg-harness';

const CMD = 'pnpm uc014:nhp-bound:prove';
const WH = (id: string) => `/commerce/webhook/pay/${id}`;
const RF = (id: string) => `/commerce/webhook/refund/${id}`;
const GAP_ID = 'GAP-UC014-BOUND-01';

let total = 0;
const failures: string[] = [];
const A = (name: string, cond: boolean, detail?: string) => {
  total++;
  if (!cond) { failures.push(name); console.log(`FAIL  ${name}${detail ? ` :: ${detail}` : ''}`); }
  else console.log(`PASS  ${name}`);
};

(async () => {
  console.log('NHP-014-BOUND-01 · 双口分叉语义证人+生命周期重放边界 · releaseEvidence=false · Not HA');
  console.log(`CMD=${CMD}`);
  console.log('NOTE: EXIT0=case 证据≠covered≠翻行 · 格值 partial 保持 · Ban 借 B1/B2 宣「跨口幂等已统一」（事实=两分立 partial UNIQUE 命名空间·本刀=语义证人非统一化 claim）');

  const h = await boot();
  const pool = h.pool;

  // ── DB 快照/终态工具（特权 pool 直查，绕 RLS；只读）──
  const orderRow = async (id: string) =>
    (await pool.query('SELECT id, owner_user_id, status, provider_txn, refund_provider_txn FROM payment_order WHERE id=$1', [id])).rows[0] ?? null;
  const bucketSum = async (owner: string) =>
    Number((await pool.query('SELECT COALESCE(SUM(units_total),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].s);
  const bucketAvail = async (owner: string) =>
    Number((await pool.query('SELECT COALESCE(SUM(units_total-units_reserved-units_consumed),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].s);
  const payTxnRows = async (txn: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM payment_order WHERE provider_txn=$1', [txn])).rows[0].n);
  const refundTxnRows = async (txn: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM payment_order WHERE refund_provider_txn=$1', [txn])).rows[0].n);
  const paySigFor = (orderId: string, txn: string, ts = Date.now()) => paySig(`${orderId}:${txn}:paid:${ts}`);
  const refundSigFor = (orderId: string, txn: string, ts = Date.now()) => paySig(`${orderId}:${txn}:refunded:${ts}`);

  // ── 隔离 fixtures（§5 豁免枚举①壳行三态+②桶种子·逐项具名）──
  await pool.query(
    `INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status,provider_txn,refund_provider_txn) VALUES
       ('BOUND_B1_X','b1xBuyer','pack_10',9900,10,'created',NULL,NULL),
       ('BOUND_B1_Y','b1yBuyer','pack_10',9900,10,'paid','BOUND_B1_Y_PTXN',NULL),
       ('BOUND_B2','b2Owner','pack_10',9900,10,'created',NULL,NULL),
       ('BOUND_B3','b3Owner','pack_10',9900,10,'created',NULL,NULL),
       ('BOUND_B4','b4Owner','pack_10',9900,10,'refunded','BOUND_B4_PTXN','BOUND_B4_RTXN'),
       ('BOUND_B5','b5Owner','pack_10',9900,10,'created',NULL,NULL),
       ('BOUND_B6','b6Owner','pack_10',9900,10,'refunded','BOUND_B6_PTXN','BOUND_B6_T2')`);
  // 豁免②桶种子：B1 红冲净账面（b1yBuyer 需可用 ≥ units=10 方能 200 refunded·uc-e2e-016-nhp-neg:119 先例形）。
  await pool.query(
    `INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('b1yBuyer','paid',50.0, now()+interval '300 days')`);

  // ════════════ B1 跨命名空间同流水：X pay T credited + Y refund T refunded → 双 200 ════════════
  {
    const txn = 'BOUND_B1_SHARED_TXN';
    const xBefore = await bucketSum('b1xBuyer');
    const yBefore = await bucketAvail('b1yBuyer');
    const ts1 = Date.now();
    const r1 = await h.post(WH('BOUND_B1_X'), {}, { providerTxn: txn, ts: ts1, sig: paySigFor('BOUND_B1_X', txn, ts1) });
    A('B1a 单 X（created 壳）pay 同流水 T → 200 credited', r1.status === 200 && r1.body?.result === 'credited', `status=${r1.status} body=${JSON.stringify(r1.body)}`);
    A('B1a X owner 桶 +10（入账落桶）', (await bucketSum('b1xBuyer')) - xBefore === 10);
    const ts2 = Date.now();
    const r2 = await h.post(RF('BOUND_B1_Y'), {}, { providerTxn: txn, ts: ts2, sig: refundSigFor('BOUND_B1_Y', txn, ts2) });
    A('B1b 单 Y（他人·paid 壳）refund 同字符串 T → 200 refunded（两索引分立·pay 命名空间占用不阻 refund 命名空间）', r2.status === 200 && r2.body?.result === 'refunded', `status=${r2.status} body=${JSON.stringify(r2.body)}`);
    A('B1b provider_txn=T 全局恰 1 行（uq_payment_order_provider_txn 分立空间）', (await payTxnRows(txn)) === 1);
    A('B1b refund_provider_txn=T 全局恰 1 行（uq_payment_order_refund_provider_txn 分立空间）', (await refundTxnRows(txn)) === 1);
    A('B1b Y owner 可用 −10（红冲 exactly-once）', Math.round((yBefore - (await bucketAvail('b1yBuyer'))) * 100) / 100 === 10);
    const xRow = await orderRow('BOUND_B1_X');
    const yRow = await orderRow('BOUND_B1_Y');
    A('B1b 终态：X status=paid∧provider_txn=T ∧ Y status=refunded∧refund_provider_txn=T（两命名空间分立证人）', xRow?.status === 'paid' && xRow?.provider_txn === txn && yRow?.status === 'refunded' && yRow?.refund_provider_txn === txn,
      `x=${JSON.stringify(xRow)} y=${JSON.stringify(yRow)}`);
  }

  // ════════════ B2 同单同串双列：ORD pay T credited → 同 ORD refund T refunded（语义证人臂）════════════
  {
    const txn = 'BOUND_B2_TXN';
    const r1 = await h.post(WH('BOUND_B2'), {}, { providerTxn: txn, ts: Date.now(), sig: paySigFor('BOUND_B2', txn) });
    A('B2a 同单 pay T → 200 credited', r1.status === 200 && r1.body?.result === 'credited', `status=${r1.status} body=${JSON.stringify(r1.body)}`);
    const r2 = await h.post(RF('BOUND_B2'), {}, { providerTxn: txn, ts: Date.now(), sig: refundSigFor('BOUND_B2', txn) });
    A('B2b 同单同字符串 T refund → 200 refunded（refund CAS 只查 refund_provider_txn 命名空间·结构性放行）', r2.status === 200 && r2.body?.result === 'refunded', `status=${r2.status} body=${JSON.stringify(r2.body)}`);
    const row = await orderRow('BOUND_B2');
    A('B2b 同行 provider_txn=T ∧ refund_provider_txn=T 并存（分立列分立索引·码态真值证人）', row?.provider_txn === txn && row?.refund_provider_txn === txn && row?.status === 'refunded', `row=${JSON.stringify(row)}`);
    A('B2b 净账恒等：+10 入账 −10 红冲 = 桶合计归零', (await bucketSum('b2Owner')) === 0, `sum=${await bucketSum('b2Owner')}`);
    console.log('DISCLOSURE(B2): 语义证人臂——期望=码态真值钉死并显式披露（两分立 partial UNIQUE 无跨 kind 约束→同单同串双列并存系结构性放行）；非产品意图背书·Ban 借本臂宣退款正确性已证。');
    console.log('DISCLOSURE(B2): 与 REQUEST §0.2 Case2 锚表逐臂对码：CAS :77-87/:130-139 只各查本列 NOT EXISTS·无跨列谓词（亲读非推定·防 UC-019 静态推定错）。');
  }

  // ════════════ B3 refund-on-created：created 壳单 refund → 409（生命周期分叉·created 侧零臂补齐）════════════
  {
    const txn = 'BOUND_B3_TXN';
    const before = { row: await orderRow('BOUND_B3'), sum: await bucketSum('b3Owner'), rRows: await refundTxnRows(txn) };
    const r = await h.post(RF('BOUND_B3'), {}, { providerTxn: txn, ts: Date.now(), sig: refundSigFor('BOUND_B3', txn) });
    A('B3 created 壳单 refund（合法签）→ 409 order_conflict（refund CAS status=paid 不中·回读 created≠refunded）', r.status === 409 && r.body?.error === 'order_conflict', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const after = { row: await orderRow('BOUND_B3'), sum: await bucketSum('b3Owner'), rRows: await refundTxnRows(txn) };
    A('B3 零副作用：订单行恒等∧refund_provider_txn=T 全局 0 行∧桶零变', JSON.stringify(before) === JSON.stringify(after), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
  }

  // ════════════ B4 pay-on-refunded：refunded 壳单 pay → 409（refunded 终态·pay 侧零臂补齐）════════════
  {
    const txn = 'BOUND_B4_TXN';
    const before = { row: await orderRow('BOUND_B4'), sum: await bucketSum('b4Owner'), pRows: await payTxnRows(txn) };
    const r = await h.post(WH('BOUND_B4'), {}, { providerTxn: txn, ts: Date.now(), sig: paySigFor('BOUND_B4', txn) });
    A('B4 refunded 壳单 pay（合法签）→ 409 order_conflict（pay CAS status=created 不中·回读 refunded≠paid）', r.status === 409 && r.body?.error === 'order_conflict', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const after = { row: await orderRow('BOUND_B4'), sum: await bucketSum('b4Owner'), pRows: await payTxnRows(txn) };
    A('B4 零副作用：订单行恒等（status/refund_provider_txn 保持预置）∧provider_txn=T 全局 0 行∧桶零变', JSON.stringify(before) === JSON.stringify(after), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
  }

  // ════════════ B5 退款后原支付流水重放：pay T → refund T2 → 重放原 pay T → 409 非 already ════════════
  {
    const txn = 'BOUND_B5_TXN';
    const txn2 = 'BOUND_B5_REFUND_TXN';
    const r1 = await h.post(WH('BOUND_B5'), {}, { providerTxn: txn, ts: Date.now(), sig: paySigFor('BOUND_B5', txn) });
    A('B5a created 单经产品口 pay T → 200 credited', r1.status === 200 && r1.body?.result === 'credited', `status=${r1.status} body=${JSON.stringify(r1.body)}`);
    const r2 = await h.post(RF('BOUND_B5'), {}, { providerTxn: txn2, ts: Date.now(), sig: refundSigFor('BOUND_B5', txn2) });
    A('B5b refund T2 → 200 refunded（生命周期推进 paid→refunded）', r2.status === 200 && r2.body?.result === 'refunded', `status=${r2.status} body=${JSON.stringify(r2.body)}`);
    const sumMid = await bucketSum('b5Owner');
    const before = { row: await orderRow('BOUND_B5'), sum: sumMid, pRows: await payTxnRows(txn) };
    const r3 = await h.post(WH('BOUND_B5'), {}, { providerTxn: txn, ts: Date.now(), sig: paySigFor('BOUND_B5', txn) });   // 原支付流水 T 重放·fresh ts 合法签
    A('B5c 原支付流水重放 → 409 order_conflict 非 200 already（:107 already 只认 status=paid·幂等不跨生命周期倒退复活）', r3.status === 409 && r3.body?.error === 'order_conflict', `status=${r3.status} body=${JSON.stringify(r3.body)}`);
    const after = { row: await orderRow('BOUND_B5'), sum: await bucketSum('b5Owner'), pRows: await payTxnRows(txn) };
    A('B5c 零副作用：订单行保持 refunded∧provider_txn=T∧refund_provider_txn=T2 恒等', JSON.stringify(before) === JSON.stringify(after), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
    A('B5c 桶/可用净账恒等（+10 −10 后零再动）', (await bucketSum('b5Owner')) === 0 && sumMid === 0, `sum=${await bucketSum('b5Owner')}`);
  }

  // ════════════ B6 refund 换流水二次：refunded 壳单再 refund T3（≠原 T2）→ 409（refund 侧补齐 pay 侧对偶）════════════
  {
    const txn3 = 'BOUND_B6_T3';
    const before = { row: await orderRow('BOUND_B6'), sum: await bucketSum('b6Owner'), rRows: await refundTxnRows(txn3) };
    const r = await h.post(RF('BOUND_B6'), {}, { providerTxn: txn3, ts: Date.now(), sig: refundSigFor('BOUND_B6', txn3) });
    A('B6 refunded 壳单 refund T3（≠T2·合法签）→ 409 order_conflict（CAS 不中·回读 refund_provider_txn=T2≠T3 非 already）', r.status === 409 && r.body?.error === 'order_conflict', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const after = { row: await orderRow('BOUND_B6'), sum: await bucketSum('b6Owner'), rRows: await refundTxnRows(txn3) };
    A('B6 零红冲零副作用：refund_provider_txn 仍=预置 T2∧T3 全局 0 行∧桶零变', JSON.stringify(before) === JSON.stringify(after), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
  }

  // ════════════ 收卷 ════════════
  console.log(`\n断言合计: ${total} 条, 失败 ${failures.length} 条`);
  console.log('PINS: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null');
  console.log('非替代申明: neg:commerce 跨单（pay 侧）/已 paid 换流水（pay 侧 :552-557）· uc014-adv C4/C5（pay 口重放/跨单）· uc011 M2/A4/X（refund 口 already/跨单/跨口重放）· NHP-011-LOAD（风暴幂等）= 旁证互不替代互不借用');
  if (failures.length > 0) {
    console.log(`HONESTY: EXIT 1 诚实保留 ${GAP_ID} 明细: ${failures.join(' | ')}`);
    console.log('HONESTY: Ban retry-to-green · 红次入 attempts 台账 · 产品缺陷=EXIT1 诚实保留+backlog 登记');
    process.exit(1);
  }
  console.log('HONESTY: EXIT0 = NHP-014-BOUND-01 case 证据 · ≠ covered ≠ 翻行 · 格值 partial 保持 · coveredCount=8 不变');
  process.exit(0);
})();
