/**
 * uc-e2e-014-nhp-fault.proof.ts — NHP-014-FAULT-01 · UC-E2E-014/026 FAULT 残余亚层 · 回调故障注入证据层
 * (webhook-fault 刀 case 1 · REQUEST=ai-docs/delivery/harness/webhook-fault-REQUEST.md
 *  · 覆盖矩阵 §1.0.1 UC-E2E-014/026 行 FAULT cell 残余亚层 · §1.0.2 工具行 additive 注记随收据)
 *
 * 需求源（口径以此为准，不发明验收标准）：
 *  - e2e-scenarios.md UC-E2E-014(:518-526) 异常流/幂等族 + UC-E2E-026(:528-546) 后置「非法回调零副作用」(:539)。
 *    本 case=回调写路径内**故障注入证据层**（桶态故障→savepoint 回滚确定性），非七类重铺（ADV 已钉）非并发重铺
 *    （23505 面 neg-commerce 三面已钉）非 lifecycle 重铺（BOUND=CAS 不中族已钉——分界：BOUND=进不了红冲的 CAS
 *    不中族 · FAULT=进了红冲但桶不足的回滚族）。
 *
 * 产品事实基线（读真实代码得出，断言即据此 · EXEC 开工 tip 亲读）：
 *  - 缝本体 markOrderRefunded（packages/db/src/commerce/payment.ts:122-189）：
 *    SAVEPOINT payment_refund_txn_claim(:127) → CAS paid→refunded(:130-139·rowCount=1=进红冲) →
 *    桶选择 :151-158（avail>0 过滤 :156 · FOR UPDATE · FIFO expires_at,id :157）→ 逐桶 claw :160-172
 *    （守卫 UPDATE :164-170 · rowCount 判定 :171）→ remaining>0 → ROLLBACK TO SAVEPOINT :175 + RELEASE :176
 *    → return 'conflict' :177（:174 注「不静默半退」）。
 *  - 口层映射 refundWebhook（commerce.service.ts:151-168）：conflict → 409 order_conflict（:166）。
 *  - 可行性：entitlement_bucket numeric(12,2) + ck_bucket_capacity（0001_baseline.sql:93-105·:104
 *    reserved+consumed<=total）——F2 种子 4.00/5.00 合法 · F3 种子 total=consumed=10.00 合法（零可用形）。
 *  - 预置 'paid' 壳直进 CAS 命中臂（status='paid' 谓词 :133）——CAS 命中后失败面=全树零臂（本刀新鲜面）。
 *
 * 臂形（五臂）：
 *  - PC = 管道活性对照（non-claim·zero claim）：'created' 壳经产品口 pay → 200 credited（产品路径落桶 +10）→
 *    合法签 refund → 200 refunded——仅证 harness 管道非假阴性（成功红冲面=uc011 M1 已钉·Ban 借 PC 宣成功面新证据）。
 *  - F1 = 零桶形：'paid' 壳（provider_txn 预置）+ owner 零桶 → 合法签 refund → 409 order_conflict
 *    （非 500 · 非 200 already）+ 五面快照恒等（status='paid' 不变 · refund 流水全局 0 行 · 桶零行）。
 *  - F2 = 多桶部分红冲不足形（缝本体）：'paid' 壳 + 两桶 4.00/5.00（总 avail 9.00 < order.units 10.00）→
 *    合法签 refund → 409 + 两桶 units_total 逐值恢复 4.00/5.00（部分 claw 已写入被 :175 savepoint 回滚撤销 ·
 *    零半退 :174——桶种子系夹具已提交行不在 savepoint 内，回滚只撤销本事务 claw 写入）。
 *  - F3 = 零可用形：'paid' 壳 + 桶 total=10.00/consumed=10.00（过 ck_bucket_capacity · avail=0 → :156 谓词
 *    过滤出空桶集）→ 409 + 桶行零触（total/consumed/version 恒等）。
 *  - 拒臂（F1/F2/F3）全程五面快照 before/after 恒等：status / provider_txn / refund_provider_txn 全局行数 /
 *    桶 units_total 合计 / 全局 refund 流水行数。
 *
 * egress 形：boot() 进程内真栈（_neg-harness 单源）——回调密钥只经 boot() 进程环境注入，两模型环境键由
 * harness 内自删（两键实形）；本文件**零环境变量词面**（零含词·provider-egress-inventory 零新条目·
 * additive 零条目形如实登记收据；支付回调密钥不在 egress 扫域·Ban 新增登记）。
 *
 * 隔离：run-e2e-isolated 三层壳（uc014:nhp-fault:prove → :raw → prove:uc014-nhp-fault）· 随机容器+动态端口 ·
 * 种子=隔离夹具裸 INSERT（§5 豁免枚举①②具名：payment_order 'created' PC 壳/'paid'+provider_txn 预置故障壳
 * `uc-e2e-014-026-webhook-adv.proof.ts:105-115`+uc011 mouth :85-91 先例形 · entitlement_bucket 故障桶态
 * `uc-e2e-011-refund-callback-mouth.proof.ts:94` 先例形——枚举外裸 INSERT 即违 Ban）· 零 live 模型 · est live=0。
 * EXIT 契约：EXIT 0 ⇔ PC+F1–F3 每臂断言全部成立；任一红 → EXIT 1 诚实保留（attempts 台账·Ban retry-to-green·
 * Ban 改断言迁就）。EXIT 0 = case 证据 ≠ covered ≠ 翻行（格值 partial 保持·coveredCount=8 不动·翻面权归协调方）。
 */

import { boot, paySig } from './_neg-harness';

const CMD = 'pnpm uc014:nhp-fault:prove';
const PAY = (id: string) => `/commerce/webhook/pay/${id}`;
const RF = (id: string) => `/commerce/webhook/refund/${id}`;
const CASE_ID = 'NHP-014-FAULT-01';

let total = 0;
const failures: string[] = [];
const A = (name: string, cond: boolean, detail?: string) => {
  total++;
  if (!cond) { failures.push(name); console.log(`FAIL  ${name}${detail ? ` :: ${detail}` : ''}`); }
  else console.log(`PASS  ${name}`);
};

(async () => {
  console.log('NHP-014-FAULT-01 · 回调故障注入证据层（红冲不足→savepoint 回滚族：F1 零桶/F2 多桶部分红冲不足/F3 零可用·零半退）· releaseEvidence=false · Not HA');
  console.log(`CMD=${CMD}`);
  console.log('NOTE: EXIT0=case 证据≠covered≠翻行 · 格值 partial 保持 · Ban 借 F 臂宣「退款失败自动重试已证」（:174-178 面无重试语义·conflict 即确定性终态回应·重试归 PSP 侧）/「全量退款正确性背书」/ 借 PC 宣成功面新证据');

  const h = await boot();
  const pool = h.pool;

  // ── DB 快照/终态工具（特权 pool 直查，绕 RLS；只读）──
  const orderRow = async (id: string) =>
    (await pool.query('SELECT id, owner_user_id, status, provider_txn, refund_provider_txn FROM payment_order WHERE id=$1', [id])).rows[0] ?? null;
  const bucketRows = async (owner: string) =>
    (await pool.query('SELECT id, kind, units_total, units_reserved, units_consumed, version FROM entitlement_bucket WHERE owner_user_id=$1 ORDER BY units_total ASC, id ASC', [owner])).rows;
  const bucketSum = async (owner: string) =>
    Number((await pool.query('SELECT COALESCE(SUM(units_total),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].s);
  const refundTxnRows = async (txn: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM payment_order WHERE refund_provider_txn=$1', [txn])).rows[0].n);
  const refundRowsGlobal = async () =>
    Number((await pool.query('SELECT count(*)::int n FROM payment_order WHERE refund_provider_txn IS NOT NULL', [])).rows[0].n);
  // 合法签载荷 `${orderId}:${txn}:${kind}:${ts}`（ts=签名毫秒时刻·与 verifyCommerceSig 单源同形）。
  const sigFor = (orderId: string, txn: string, kind: 'paid' | 'refunded', ts: number) =>
    paySig(`${orderId}:${txn}:${kind}:${ts}`);
  // 拒臂零副作用五面快照（REQUEST §1 枚举）：status / provider_txn / refund_provider_txn 全局行数 /
  // 桶 units_total 合计 / 全局 refund 流水行数。
  const snap = async (ord: string, owner: string, txn: string) => ({
    status: (await orderRow(ord))?.status ?? null,
    providerTxn: (await orderRow(ord))?.provider_txn ?? null,
    refundTxnRows: await refundTxnRows(txn),
    bucketSum: await bucketSum(owner),
    refundRowsGlobal: await refundRowsGlobal(),
  });

  // ════════════ 隔离 fixtures（§5 豁免枚举①②具名）════════════
  // ① 壳行种子 payment_order：'created' PC 单 + 三张 'paid'+provider_txn 预置故障单
  //   （webhook-adv :105-115 壳形 + uc011 mouth :85-91 'paid' 预置形先例）。
  // ② 桶种子 entitlement_bucket：F2 两桶 4.00/5.00（总 avail 9<need 10）+ F3 零可用桶
  //   （total=consumed=10.00·过 ck_bucket_capacity——uc011 mouth :94 桶种子先例形）。
  // F1 owner 故意零桶（零桶形活体）。owner 均为隔离新 id（不碰 harness 固定种子·不碰 neg:commerce fixture）。
  await pool.query(
    `INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status,provider_txn) VALUES
       ('FLT_PC','fltPc','pack_10',9900,10,'created',NULL),
       ('FLT_F1','fltF1','pack_10',9900,10,'paid','fltF1Pay'),
       ('FLT_F2','fltF2','pack_10',9900,10,'paid','fltF2Pay'),
       ('FLT_F3','fltF3','pack_10',9900,10,'paid','fltF3Pay')`);
  await pool.query(
    `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, units_reserved, units_consumed, expires_at) VALUES
       ('fltF2','paid',4.00,0,0, now()+interval '365 days'),
       ('fltF2','paid',5.00,0,0, now()+interval '365 days'),
       ('fltF3','paid',10.00,0,10.00, now()+interval '365 days')`);

  // ════════════ PC 管道活性对照（non-claim·zero claim）════════════
  {
    const txn = 'fltPcPayTxn';
    const ts = Date.now();
    const r = await h.post(PAY('FLT_PC'), {}, { providerTxn: txn, ts, sig: sigFor('FLT_PC', txn, 'paid', ts) });
    A('PC 产品口 pay 合法签 → 200 {result:credited}（管道活性对照·壳行种子活体自证）', r.status === 200 && r.body?.result === 'credited', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const row = await orderRow('FLT_PC');
    A('PC 壳行转 paid ∧ provider_txn 落列（产品路径 CAS 真行使）', row?.status === 'paid' && row?.provider_txn === txn, `row=${JSON.stringify(row)}`);
    const bk = await bucketRows('fltPc');
    A('PC 产品路径落桶 +10（恰 1 桶 units_total=10·非注入路径）', bk.length === 1 && Number(bk[0].units_total) === 10, `rows=${JSON.stringify(bk)}`);
    const rts = Date.now();
    const rf = await h.post(RF('FLT_PC'), {}, { providerTxn: 'fltPcRefundTxn', ts: rts, sig: sigFor('FLT_PC', 'fltPcRefundTxn', 'refunded', rts) });
    A('PC 合法签 refund 足额红冲 → 200 {result:refunded}（管道非假阴性对照·成功面=uc011 M1 已钉 zero claim）', rf.status === 200 && rf.body?.result === 'refunded', `status=${rf.status} body=${JSON.stringify(rf.body)}`);
    const rowAfter = await orderRow('FLT_PC');
    A('PC 终态 refunded ∧ refund_provider_txn 落列（对照臂收口）', rowAfter?.status === 'refunded' && rowAfter?.refund_provider_txn === 'fltPcRefundTxn', `row=${JSON.stringify(rowAfter)}`);
  }

  // ════════════ F1 零桶形（CAS 命中 → 空桶集 → ROLLBACK TO SAVEPOINT → conflict）════════════
  {
    const txn = 'fltF1RefundTxn';
    A('F1 夹具活体自证：owner 零桶（零桶形前提·:156 谓词前空集）', (await bucketRows('fltF1')).length === 0);
    const before = await snap('FLT_F1', 'fltF1', txn);
    const ts = Date.now();
    const r = await h.post(RF('FLT_F1'), {}, { providerTxn: txn, ts, sig: sigFor('FLT_F1', txn, 'refunded', ts) });
    A('F1 合法签 refund 零桶 → 409 {error:order_conflict}（CAS 命中rowCount=1 后空桶集→:175 回滚→:177 conflict→:166 口层 409）', r.status === 409 && r.body?.error === 'order_conflict', `status=${r.status} body=${JSON.stringify(r.body)}`);
    A('F1 非 500 ∧ 非 200 already（已写态被回滚撤销·非幂等重放语义·非泄漏 500）', r.status !== 500 && r.status !== 200, `status=${r.status}`);
    const after = await snap('FLT_F1', 'fltF1', txn);
    A('F1 五面快照恒等（status/provider_txn/refund流水全局/桶合计/全局 refund 行数——status 恒 paid·写态回滚）', JSON.stringify(before) === JSON.stringify(after) && after.status === 'paid', `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
    A('F1 refund_provider_txn 全局 0 行（CAS 写入被回滚·零落列）', await refundTxnRows(txn) === 0);
    A('F1 桶零行恒等（owner 零桶不因失败臂生出桶）', (await bucketRows('fltF1')).length === 0 && (await bucketSum('fltF1')) === 0);
  }

  // ════════════ F2 多桶部分红冲不足形（缝本体：部分 claw 已写入 → 仍不足 → 回滚撤销）════════════
  {
    const txn = 'fltF2RefundTxn';
    const seeded = await bucketRows('fltF2');
    A('F2 夹具活体自证：两桶 avail 4.00+5.00 合计 9.00 < order.units 10（ck_bucket_capacity 合法形）',
      seeded.length === 2 && seeded.map((b) => Number(b.units_total)).join(',') === '4,5' && (await bucketSum('fltF2')) === 9,
      `rows=${JSON.stringify(seeded)}`);
    const before = await snap('FLT_F2', 'fltF2', txn);
    const ts = Date.now();
    const r = await h.post(RF('FLT_F2'), {}, { providerTxn: txn, ts, sig: sigFor('FLT_F2', txn, 'refunded', ts) });
    A('F2 合法签 refund 总 avail 9<need 10 → 409 {error:order_conflict}（:160-172 逐桶 claw 尽 → remaining=1>0 → :173-177 回滚 conflict）', r.status === 409 && r.body?.error === 'order_conflict', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const afterRows = await bucketRows('fltF2');
    A('F2 两桶 units_total 逐值恢复 4.00/5.00 恒等（部分 claw 已写入被 :175 savepoint 回滚撤销·零半退 :174）',
      afterRows.length === 2 && afterRows.map((b) => Number(b.units_total)).join(',') === '4,5',
      `rows=${JSON.stringify(afterRows)}`);
    A('F2 桶行无半退残迹（reserved/consumed/version 恒 0/0/0·种子已提交行不在 savepoint 内·回滚只撤本事务 claw 写入）',
      afterRows.every((b) => Number(b.units_reserved) === 0 && Number(b.units_consumed) === 0 && Number(b.version) === 0),
      `rows=${JSON.stringify(afterRows)}`);
    const after = await snap('FLT_F2', 'fltF2', txn);
    A('F2 五面快照恒等（status 恒 paid·桶合计恒 9.00·全局 refund 行数零增）', JSON.stringify(before) === JSON.stringify(after) && after.status === 'paid' && after.bucketSum === 9, `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
    A('F2 refund_provider_txn 全局 0 行（CAS 写入被回滚·零落列零跨单泄漏）', await refundTxnRows(txn) === 0);
  }

  // ════════════ F3 零可用形（total=consumed=10 过 ck → avail=0 被 :156 过滤 → 空桶集 → conflict）════════════
  {
    const txn = 'fltF3RefundTxn';
    const seeded = await bucketRows('fltF3');
    A('F3 夹具活体自证：桶 total=10.00/consumed=10.00（过 ck_bucket_capacity :104·avail=0 零可用形合法）',
      seeded.length === 1 && Number(seeded[0].units_total) === 10 && Number(seeded[0].units_consumed) === 10 && Number(seeded[0].version) === 0,
      `rows=${JSON.stringify(seeded)}`);
    const before = await snap('FLT_F3', 'fltF3', txn);
    const ts = Date.now();
    const r = await h.post(RF('FLT_F3'), {}, { providerTxn: txn, ts, sig: sigFor('FLT_F3', txn, 'refunded', ts) });
    A('F3 合法签 refund 零可用 → 409 {error:order_conflict}（:156 avail>0 谓词过滤出空桶集→:173 回滚 conflict）', r.status === 409 && r.body?.error === 'order_conflict', `status=${r.status} body=${JSON.stringify(r.body)}`);
    const afterRows = await bucketRows('fltF3');
    A('F3 桶行零触（total/consumed/version 恒等·零 claw 行使零写放）',
      afterRows.length === 1 && Number(afterRows[0].units_total) === 10 && Number(afterRows[0].units_consumed) === 10 && Number(afterRows[0].version) === 0,
      `rows=${JSON.stringify(afterRows)}`);
    const after = await snap('FLT_F3', 'fltF3', txn);
    A('F3 五面快照恒等（status 恒 paid·桶合计恒 10.00·全局 refund 行数零增）', JSON.stringify(before) === JSON.stringify(after) && after.status === 'paid' && after.bucketSum === 10, `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
    A('F3 refund_provider_txn 全局 0 行（CAS 写入被回滚·零落列）', await refundTxnRows(txn) === 0);
  }

  // ════════════ 收卷 ════════════
  console.log(`\n断言合计: ${total} 条, 失败 ${failures.length} 条`);
  console.log('PINS: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null');
  console.log('非替代申明: BOUND（CAS 不中 lifecycle 族 B3–B6）· uc011 mouth/adv（足额红冲成功面+refund 口 400/403/404 全族）· NHP-011-LOAD（足额桶下并发风暴幂等）· neg-commerce（pay 口并发/跨单 23505 面）· uc014-adv C1–C7 = 旁证互不替代互不借用 · FAULT=进了红冲但桶不足的回滚族');
  if (failures.length > 0) {
    console.log(`HONESTY: EXIT 1 诚实保留 ${CASE_ID} 明细: ${failures.join(' | ')}`);
    console.log('HONESTY: Ban retry-to-green · 红次入 attempts 台账 · Ban 改断言迁就');
    process.exit(1);
  }
  console.log(`HONESTY: EXIT0 = ${CASE_ID} case 证据 · ≠ covered ≠ 翻行 · 格值 partial 保持 · coveredCount=8 不变`);
  process.exit(0);
})();
