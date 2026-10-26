/**
 * uc-e2e-011-nhp-load.proof.ts — NHP-011-LOAD-w-01 执行收据 + NHP-011-PERF-api-01 case 证据
 * (NHP 批 B · 覆盖矩阵 §1.0.1 行 6 UC-E2E-011 · §1.0.2 :148 PERF_api/LOAD_worker 注记形
 *  · REQUEST=ai-docs/delivery/harness/nhp-batch-b-REQUEST.md)
 *
 * 需求源（口径以此为准，不发明验收标准）：
 *  - nhp-batch-b-REQUEST.md §1.4 行 6：NHP-011-LOAD-w-01 执行收据（并发失败退款风暴·
 *    refundWebhook 单管道并发行使·沿 NHP-017-LOAD-w-01 settled-cohort 先例）+ NHP-011-PERF-api-01
 *    （refund-callback 错签/负路径并发延迟·命令+负载形状+期望+收据路径四件套）。
 *  - §9-rev.3 追钉：行使面=HTTP refund-callback 管道（commerce.service.ts:151-168 refundWebhook
 *    单管道）·**收据文禁写 worker 产能义**（隔离库并发行使≠worker 容量·同律防洗句）。
 *  - §9-rev3 R1 主读：:148 格保持 blind + 『NHP 矩阵侧 blind→case-only 措辞』注记形·
 *    防洗句逐字镜像 uc017 先例「Ban 借 LOAD 收据宣 PERF SLO/生产容量/HA」。
 *  - 机制面（真实代码，断言即据此）：
 *    POST /payment/refund-callback（payment-callback.controller.ts:20/:24 主口·body 白名单
 *      {orderId,providerTxn,sig,ts}）→ verifyCommerceSig（400 invalid_callback/403 bad_signature）
 *      → gateway owner → markOrderRefunded（packages/db/src/commerce/payment.ts:122-176：
 *      SAVEPOINT CAS·paid→refunded·NOT EXISTS 同流水·23505→conflict·FIFO 红冲）
 *      → 200 {result: refunded|already} / 409 order_conflict。
 *
 * 负载族（本 prove 断言面 · 期望形=协调方钉：1×refunded+(N-1)×already / 跨单同流水→conflict）：
 *  L1 防空转显式钉: 风暴前置种 'paid' 壳（真未退单）·风暴后断言 refunded 计数 ≥1 ∧ avail 恰 −10
 *     ——风暴若整体空转（全 already/全 409/零红冲）= 红停（防「全拒亦绿」假证）。
 *  L2 同单同流水风暴: N=16 并发同单同 txn → 恰 1×200{refunded} + 15×200{already} · 零 5xx ·
 *     txn 全局恰 1 行 · 红冲恰一次 · status=refunded（CAS exactly-once 收敛）。
 *  L3 顺序重放风暴: 首 200{refunded} + N=8 重放全 200{already}（幂等去重·A4 先例并发形）。
 *  L4 跨单同流水风暴: 4 单 4 owner 同 txn 并发 → 恰 1×200{refunded} + 3×409 order_conflict（非 5xx）
 *     · txn 恰 1 行 · 唯一赢家红冲 −10·三家零变。
 *  P1 PERF-api 负路径并发: 60 并发垃圾签（403 fast-fail）+ 60 并发缺字段（400 结构拒）→
 *     全 403/400 零 5xx · 状态面零变 · 延迟观测（p50/p95/max）如实落 stdout 收据
 *     ——**观测值=隔离本地观察 ≠ SLO ≠ 容量 ≠ 门槛断言**（Ban 借 LOAD/PERF 收据宣 PERF SLO/生产容量/HA）。
 *
 * 隔离：run-e2e-isolated 三层壳（uc011:nhp-load:prove → :raw → prove:uc011-nhp-load）· 随机容器+动态端口 ·
 * boot() 进程内真栈 · PAY_PROVIDER_SECRET 只经进程环境（_neg-harness 单源）· 零 live 模型 · est live=0。
 * EXIT 契约：EXIT 0 ⇔ L1-L4+P1 全绿；任一红 → EXIT 1 诚实保留（attempts 台账 · Ban retry-to-green）。
 * EXIT0 = case 证据 ≠ covered ≠ 翻行；LOAD/PERF 措辞 blind→case-only（NHP 矩阵侧注记形·格值 blind 保持），
 * coveredCount=8 不动 · **Ban 借本收据宣 PERF SLO/生产容量/HA**（rev3 追钉逐字）。
 */
import { boot, paySig } from './_neg-harness';

const CMD = 'pnpm uc011:nhp-load:prove';
const MAIN = '/payment/refund-callback';

let total = 0;
const failures: string[] = [];
const A = (name: string, cond: boolean, detail?: string) => {
  total++;
  if (!cond) { failures.push(name); console.log(`FAIL  ${name}${detail ? ` :: ${detail}` : ''}`); }
  else console.log(`PASS  ${name}`);
};
const pct = (xs: number[], p: number): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))] ?? NaN;
};
void pct;   // 分位工具位保留:平台无 per-request 时序头·延迟观测面=墙钟(不作门槛不作 SLO)

(async () => {
  const h = await boot();
  const pool = h.pool;

  const availSum = async (owner: string): Promise<number> =>
    Number((await pool.query(
      `SELECT COALESCE(SUM(units_total - units_reserved - units_consumed),0)::float8 s
         FROM entitlement_bucket WHERE owner_user_id=$1`, [owner],
    )).rows[0].s);
  type OrderRow = { id: string; owner: string; status: string; units: number; refundTxn: string | null };
  const orderRow = async (id: string): Promise<OrderRow | null> =>
    (await pool.query(
      'SELECT id, owner_user_id AS owner, status, units, refund_provider_txn AS "refundTxn" FROM payment_order WHERE id=$1', [id],
    )).rows[0] ?? null;
  const txnRows = async (txn: string): Promise<number> =>
    Number((await pool.query('SELECT count(*)::int n FROM payment_order WHERE refund_provider_txn=$1', [txn])).rows[0].n);
  const sig = (orderId: string, txn: string, ts = Date.now()) => paySig(`${orderId}:${txn}:refunded:${ts}`);
  const body = (orderId: string, txn: string, ts = Date.now()) => ({ orderId, providerTxn: txn, ts, sig: sig(orderId, txn, ts) });
  type CallbackBody = { orderId: string; providerTxn: string; ts: number; sig: string };
  const post = (b: CallbackBody) => h.post(MAIN, {}, b);

  console.log('NHP-011-LOAD-w-01 执行收据 + NHP-011-PERF-api-01 case 证据 · releaseEvidence=false · Not HA');
  console.log(`CMD=${CMD}`);
  console.log('MOUTH: POST /payment/refund-callback（主口·refundWebhook 单管道）· 隔离库并发行使 ≠ worker 容量 ≠ 生产负载');
  console.log('NOTE: EXIT0=case 证据≠covered≠翻行 · 格值 blind 保持+矩阵侧 case-only 注记 · Ban 借 LOAD 收据宣 PERF SLO/生产容量/HA');

  // ── 种子:'paid' 壳 ×6 单 6 owner（真未退·红冲前置桶）──
  const F = {
    l2: { ord: 'NBLOAD_L2', owner: 'nbloadL2', units: 10 },
    l3: { ord: 'NBLOAD_L3', owner: 'nbloadL3', units: 10 },
    l4a: { ord: 'NBLOAD_L4A', owner: 'nbloadL4A', units: 10 },
    l4b: { ord: 'NBLOAD_L4B', owner: 'nbloadL4B', units: 10 },
    l4c: { ord: 'NBLOAD_L4C', owner: 'nbloadL4C', units: 10 },
    l4d: { ord: 'NBLOAD_L4D', owner: 'nbloadL4D', units: 10 },
  } as const;
  await pool.query(
    `INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status,provider_txn) VALUES
       ('NBLOAD_L2','nbloadL2','pack_10',9900,10,'paid','nbloadL2Pay'),
       ('NBLOAD_L3','nbloadL3','pack_10',9900,10,'paid','nbloadL3Pay'),
       ('NBLOAD_L4A','nbloadL4A','pack_10',9900,10,'paid','nbloadL4APay'),
       ('NBLOAD_L4B','nbloadL4B','pack_10',9900,10,'paid','nbloadL4BPay'),
       ('NBLOAD_L4C','nbloadL4C','pack_10',9900,10,'paid','nbloadL4CPay'),
       ('NBLOAD_L4D','nbloadL4D','pack_10',9900,10,'paid','nbloadL4DPay')`);
  for (const x of Object.values(F)) {
    await pool.query(
      `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
       VALUES ($1,'paid',$2, now()+interval '365 days')`,
      [x.owner, x.units]);
  }

  // ══ L1+L2 · 同单同流水并发风暴 N=16：1×refunded+(N-1)×already + 防空转钉 ══
  {
    const txn = 'nbloadL2Txn';
    const before = await availSum(F.l2.owner);
    const bodies = Array.from({ length: 16 }, () => body(F.l2.ord, txn));   // 各自 fresh ts(合法窗内)
    const t0 = Date.now();
    const rs = await Promise.all(bodies.map((b) => post(b)));
    const wallMs = Date.now() - t0;
    const results = rs.map((r) => r.body?.result);
    A('L2 并发 16 全 200 零 5xx', rs.every((r) => r.status === 200), `statuses=${rs.map((r) => r.status).join(',')}`);
    A('L2 期望形: 恰 1×refunded + 15×already',
      results.filter((x) => x === 'refunded').length === 1 && results.filter((x) => x === 'already').length === 15,
      `refunded=${results.filter((x) => x === 'refunded').length} already=${results.filter((x) => x === 'already').length}`);
    A('L1 防空转钉: refunded 计数 ≥1 且 avail 恰 −10（真红冲非空转）',
      results.filter((x) => x === 'refunded').length >= 1 && (await availSum(F.l2.owner)) === before - 10,
      `avail=${await availSum(F.l2.owner)} before=${before}`);
    A('L2 单管道 exactly-once: txn 全局恰 1 行 ∧ status=refunded',
      (await txnRows(txn)) === 1 && (await orderRow(F.l2.ord))?.status === 'refunded'
      && (await orderRow(F.l2.ord))?.refundTxn === txn);
    console.log(`LOAD-OBSERVATION: L2 风暴 N=16 墙钟 ${wallMs}ms（隔离本地观察·非 SLO 非容量宣称）`);
  }

  // ══ L3 · 顺序重放风暴: 首 refunded + 8×already（幂等去重）══
  {
    const txn = 'nbloadL3Txn';
    const before = await availSum(F.l3.owner);
    const w1 = await post(body(F.l3.ord, txn));
    const replays = await Promise.all(Array.from({ length: 8 }, () => post(body(F.l3.ord, txn))));
    A('L3 首退 → 200 {refunded}', w1.status === 200 && w1.body?.result === 'refunded');
    A('L3 重放 8 路 → 全 200 {already}（幂等收敛零 5xx）',
      replays.every((r) => r.status === 200 && r.body?.result === 'already'),
      `statuses=${replays.map((r) => `${r.status}:${r.body?.result}`).join(',')}`);
    A('L3 红冲恰一次: avail 恰 −10 ∧ txn 恰 1 行',
      (await availSum(F.l3.owner)) === before - 10 && (await txnRows(txn)) === 1);
  }

  // ══ L4 · 跨单同流水风暴: 4 单并发同 txn → 1×refunded + 3×409 conflict ══
  {
    const txn = 'nbloadSharedTxn';
    const four = [F.l4a, F.l4b, F.l4c, F.l4d];
    const beforeByOwner: Record<string, number> = {};
    for (const x of four) beforeByOwner[x.owner] = await availSum(x.owner);
    const beforeTotal = Object.values(beforeByOwner).reduce((a, b) => a + b, 0);
    const rs = await Promise.all(four.map((x) => post(body(x.ord, txn))));
    const results = rs.map((r) => ({ status: r.status, result: r.body?.result, error: r.body?.error }));
    A('L4 期望形: 恰 1×200{refunded} + 3×409{order_conflict}（非 5xx）',
      results.filter((x) => x.status === 200 && x.result === 'refunded').length === 1
      && results.filter((x) => x.status === 409 && x.error === 'order_conflict').length === 3,
      JSON.stringify(results));
    A('L4 唯一流水归属: txn 全局恰 1 行', (await txnRows(txn)) === 1);
    const orderRows = await Promise.all(four.map((x) => orderRow(x.ord)));
    const winnerIdx = orderRows.findIndex((r) => r?.status === 'refunded');
    const loserCount = orderRows.filter((r) => r?.status === 'paid').length;
    A('L4 恰一赢家（refunded）三输家（paid 原态零变）',
      winnerIdx >= 0 && loserCount === 3, `winnerIdx=${winnerIdx} losers=${loserCount}`);
    // 赢家/输家按订单终态分类断言（赢家并发非确定·分类读诚实）
    let clawOk = true; let losersUntouched = true;
    for (let i = 0; i < four.length; i++) {
      const now = await availSum(four[i]!.owner);
      const was = beforeByOwner[four[i]!.owner]!;
      if (i === winnerIdx) { if (now !== was - 10) clawOk = false; }
      else if (now !== was) losersUntouched = false;
    }
    A('L4 赢家红冲恰一次: avail 恰 −10', clawOk);
    A('L4 输家账户快照零变（无半退无串扰）', losersUntouched);
    A('L4 总量守恒: 四账户 avail 合计恰 −10（唯一红冲）',
      (await Promise.all(four.map((x) => availSum(x.owner)))).reduce((a, b) => a + b, 0) === beforeTotal - 10);
    A('L4 防空转钉(L4 侧): 赢家 refunded ∈ 全体结果（风暴真行使）',
      results.some((x) => x.result === 'refunded'));
  }

  // ══ P1 · PERF-api 负路径并发: 403 fast-fail ×60 + 400 结构拒 ×60 + 延迟观测落收据 ══
  {
    const ord = F.l2.ord; const txn = 'nbloadPerfTxn';
    const snapBefore = { avail: await availSum(F.l2.owner), row: await orderRow(ord) };
    const bad = Array.from({ length: 60 }, () =>
      h.post(MAIN, {}, { orderId: ord, providerTxn: txn, ts: Date.now(), sig: 'zz' }));
    const missing = Array.from({ length: 60 }, (_, i) =>
      h.post(MAIN, {}, { orderId: ord, providerTxn: `${txn}_${i}` }));   // 缺 sig
    const t0 = Date.now();
    const [rs1, rs2] = await Promise.all([Promise.all(bad), Promise.all(missing)]);
    const wallMs = Date.now() - t0;
    A('P1 垃圾签 60 并发 → 全 403 bad_signature 零 5xx',
      rs1.every((r) => r.status === 403 && r.body?.error === 'bad_signature'),
      `statuses=${[...new Set(rs1.map((r) => r.status))].join(',')}`);
    A('P1 缺字段 60 并发 → 全 400 invalid_callback 零 5xx（400 判定先于 HMAC·并发面一致）',
      rs2.every((r) => r.status === 400 && r.body?.error === 'invalid_callback'),
      `statuses=${[...new Set(rs2.map((r) => r.status))].join(',')}`);
    A('P1 负路径零状态面变: avail/订单行快照二致',
      (await availSum(F.l2.owner)) === snapBefore.avail
      && JSON.stringify(await orderRow(ord)) === JSON.stringify(snapBefore.row));
    console.log(`PERF-OBSERVATION: 负路径并发 120 req 墙钟 ${wallMs}ms（隔离本地观察·非 SLO 非容量宣称）`);
    console.log('PERF-DISCLOSURE: 以上为隔离本地观测值 ≠ SLO ≠ 生产容量 ≠ HA 口径 —— Ban 借本收据宣 PERF SLO/生产容量/HA（rev3 追钉）。');
    console.log('PERF-DISCLOSURE: 负载形状=同单 16 并发 storm ×1 + 4 单跨单 storm ×1 + 负路径 120 req · 命令/期望/收据路径见 case-matrix NHP-011-PERF-api-01 行四件套。');
  }

  // ── EXIT 裁决 ──
  console.log(`\n断言合计: ${total} 条, 失败 ${failures.length} 条`);
  console.log('HONESTY: EXIT0 = NHP-011-LOAD-w-01 执行收据 + NHP-011-PERF-api-01 case 证据 · ≠ covered ≠ 翻行');
  console.log('HONESTY: 行使面=HTTP refund-callback 管道 · 收据文无 worker 产能义（隔离库并发行使≠worker 容量）');
  console.log('HONESTY: Ban 借 LOAD 收据宣 PERF SLO/生产容量/HA · coveredCount=8 不动 · est live=0');
  if (failures.length > 0) {
    console.log(`\nNHP-011-LOAD/PERF — 诚实保留 gap（EXIT 1 · 非 flake · Ban invent fix）:`);
    for (const f of failures) console.log(`  GAP-ITEM assertion="${f}"`);
    console.log('  依据: commerce.service.ts:151-168 refundWebhook 单管道 · payment.ts:122-176 markOrderRefunded CAS');
    process.exit(1);
  }
  console.log(`\nEXIT=0 — NHP-011-LOAD-w-01（L1 防空转/L2 风暴/L3 重放/L4 跨单）+ NHP-011-PERF-api-01（P1 负路径并发+观测收据）全绿（${total} 条）。`);
  process.exit(0);
})().catch((e) => {
  console.error('NHP-011-LOAD/PERF harness 崩溃（EXIT 1 · 记入 attempts 台账 · 非 flake）:', e);
  process.exit(1);
});
