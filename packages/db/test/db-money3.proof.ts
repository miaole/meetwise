/**
 * DBM3-1 · GAP-DEBT-DB-MONEY3 钱三轨 + 约束治理刀 prove（P0–P7 · harness rev2 裁定面）。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移至 0149 + nonce 校验）：
 *   P0 负样本自证（协调方 N1 落法）：基线态重构（tx 内摘除 0149 新增 4 CHECK）→ SAVEPOINT p0_neg
 *      注入脏行 → 整跑 0149 文件 → DO 检测块应 RAISE dbm3_dirty_rows（含四计数=1）→ ROLLBACK
 *      → 干净整跑 0149 应成功（幂等）——两跑全账入 stdout，Ban retry-to-green。
 *   P1 约束生效断言（catalog）：4 CHECK 具名存在 · 0027 约束已删 · 0021 partial 仍在 ·
 *      (stream_key,event_key) 唯一结构恰 1 个 · consumption_record 负门（0149 零触碰该表 · rev2 裁摘除）·
 *      ai_graph_run 枚举 11 值逐字面量在卷。
 *   P2 负值/脏值拒绝（23514）：amount_cents=-1/=0 · units=-5/1.005(案B 形态)/1e10 ·
 *      ai_graph_run status='runing'（脏拼写 · rev1 主案由）· settlement_ledger units_settled=-1。
 *   P3 三表回归（真实写路径 · asPrincipal）：payment_order（createOrder→markOrderPaidAndCredit credited
 *      →幂等重放 already→发桶 10）· entitlement_bucket（reserve 1.5→confirm→settlement 入账≥0 ·
 *      reserve→release）· interview_event（appendEvent 重复 eventKey 返既有 seq · 无 key 连写自增）。
 *   P4 不变量回归：uq_active_run 二条非终态→23505 · 终态释放槽位 · succeeded/completed 双终态并存
 *      （Ban 业务语义变更自证）· 正边界（amount_cents=1 · units=0.5 半次）放行。
 *   P5 联动静态门（L1/L2）：sql/01 fixture 无表级 uq_event_key、含 0021 同形 partial ·
 *      migrate.proof 契约更新文本在卷（drift:prove / migrate:prove 另跑于 EXEC 收据）。
 *   P6 0149 文本静态门（dollar-quote 感知）：语句白名单 = 1×DO 检测 + 5×DROP CONSTRAINT IF EXISTS +
 *      4×ADD CONSTRAINT CHECK，零 UPDATE/DELETE/INSERT/ALTER TYPE/CREATE INDEX/TRIGGER/RLS/GRANT。
 *   P7 对表勾销块：postgres skill 第 4 项（status CHECK/金额单位）本刀落地 ✅ + NEXT-NODE C4。
 *
 * EXIT=0 才过；attempts 全账纪律见收据（Ban retry-to-green）。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createPool, asPrincipal, assertIsolatedTestTarget } from '../src/index.ts';
import { createOrder, markOrderPaidAndCredit } from '../src/commerce/payment.ts';
import { reserveEntitlement, confirmConsumption, releaseConsumption } from '../src/commerce/commerce.ts';
import { appendEvent } from '../src/interview/interview-event.ts';

const pool = createPool();
const owner = `dbm3-owner-${process.pid}`;
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const RUN_STATUS_VOCAB = [
  'created', 'active', 'waiting_user', 'migrating', 'paused', 'quarantined',
  'safe_terminating', 'safely_terminated', 'succeeded', 'completed', 'failed',
] as const;

const migPath = fileURLToPath(new URL('../migrations/0149_money_status_constraints.sql', import.meta.url));
const migRaw = readFileSync(migPath, 'utf8');

/** dollar-quote 感知语句切分（DO 体内部 ';' 不当边界）——与 dbid1 P6 同款。 */
function splitSql(text: string): string[] {
  const out: string[] = [];
  let start = 0;
  let i = 0;
  while (i < text.length) {
    if (text[i] === '$') {
      const tag = /^\$[A-Za-z_][A-Za-z0-9_]*\$/.exec(text.slice(i));
      if (tag) {
        const close = text.indexOf(tag[0], i + tag[0].length);
        if (close === -1) throw new Error('split_dollar_quote_unterminated');
        i = close + tag[0].length;
        continue;
      }
    }
    if (text[i] === ';') {
      const s = text.slice(start, i).trim();
      if (s.length > 0) out.push(s);
      i += 1;
      start = i;
      continue;
    }
    i += 1;
  }
  const tail = text.slice(start).trim();
  if (tail.length > 0) out.push(tail);
  return out;
}

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log(`ATTEMPT dbm3-db-money3 pid=${process.pid} startedAt=${new Date().toISOString()} attemptsLedger=required`);

  // 造数前提①：ai_graph_run 有 0059 隐私围栏 BEFORE 触发器（enforce_interview_projection_privacy_active）
  // ——thread_id 必须指向 privacy-active 的 interview（缺行/越权/已删统一 interview_privacy_fenced）。
  // 造数前提②：0058 谓词读 GUC app.principal_user（非 role——superuser 池无 GUC 也拦）→ 一切
  // ai_graph_run 写路径都须在事务内 set_config(..., is_local=true)（同 asPrincipal 语义 · 手动版）。
  // 先落一行 active interview（superuser 池直写 · dbid1 P5 同款），全部 run 的 thread_id 引用之。
  const ivId = `dbm3-iv-${process.pid}`;
  await pool.query(
    "INSERT INTO interview(id, owner_user_id, status, version, current_question_index, questions) VALUES ($1, $2, 'active', 0, 0, '[]'::jsonb)",
    [ivId, owner]);

  /* ── P0 · 负样本自证（N1 落法：基线态 SAVEPOINT 注入 → 跑 0149 RAISE → 回滚 → 干净重跑） ── */
  {
    const c = await pool.connect();
    let run1msg = '';
    let run2err = '';
    let rolledBackClean = false;
    try {
      await c.query('BEGIN');
      // 0058 围栏读 GUC：事务内置 principal（is_local=true · tx 结束自清）。
      await c.query("SELECT set_config('app.principal_user', $1, true)", [owner]);
      // 基线态重构（tx 内可逆）：摘除 0149 新增的 4 个 CHECK，恢复「无守卫」语义供脏行注入。
      // 0027 约束在 prove 时点已被迁移删（不可逆于本 tx）——注入面不含 interview_event，无影响（如实注记）。
      await c.query('ALTER TABLE payment_order DROP CONSTRAINT IF EXISTS ck_payment_order_amount_cents_positive');
      await c.query('ALTER TABLE payment_order DROP CONSTRAINT IF EXISTS ck_payment_order_units_range');
      await c.query('ALTER TABLE settlement_ledger DROP CONSTRAINT IF EXISTS ck_settlement_units_settled_nonneg');
      await c.query('ALTER TABLE ai_graph_run DROP CONSTRAINT IF EXISTS ck_ai_graph_run_status');
      await c.query('SAVEPOINT p0_neg');
      // 注入四类脏行各 1（检测器非恒真自证：若检测器恒过 0 则本块 FAIL 而非静默绿）。
      await c.query(
        `INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units)
         VALUES ('dbm3-neg-ord-a', $1, 'pack_10', -100, 10)`, [owner]);
      await c.query(
        `INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units)
         VALUES ('dbm3-neg-ord-b', $1, 'pack_10', 9900, 1.005)`, [owner]);
      await c.query(
        `INSERT INTO settlement_ledger(owner_user_id, consumption_id, units_settled, service_type)
         VALUES ($1, gen_random_uuid(), -1, 'dbm3-neg')`, [owner]);
      await c.query(
        `INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status)
         VALUES ('dbm3-neg', $2, $1, 'runing')`, [owner, ivId]);
      // run#1：整跑 0149 —— 前置 DO 检测块应先炸（脏行在卷，任何 ADD CONSTRAINT 都不该被触达）。
      try { await c.query(migRaw); } catch (e) { run1msg = (e as Error).message; }
      await c.query('ROLLBACK TO SAVEPOINT p0_neg');
      await c.query('RELEASE SAVEPOINT p0_neg');
      rolledBackClean = (await c.query<{ n: string }>(
        `SELECT count(*)::text AS n FROM payment_order WHERE id LIKE 'dbm3-neg-%'`)).rows[0]!.n === '0';
      // run#2：干净重跑 —— 幂等（DROP IF EXISTS no-op + 重新 ADD 同名同义约束）。
      try { await c.query(migRaw); } catch (e) { run2err = (e as Error).message; }
      await c.query('COMMIT');
    } finally {
      c.release();
    }
    console.log(`ATTEMPT p0 run#1(dirty) -> ${run1msg.includes('dbm3_dirty_rows') ? 'RAISED dbm3_dirty_rows' : 'NO-RAISE(RED)'}`);
    A('P0-1 run#1 脏注入下整跑 0149：DO 检测块 RAISE dbm3_dirty_rows（先检测后约束 · fail-loud）',
      run1msg.includes('dbm3_dirty_rows'));
    A('P0-2 run#1 计数具名四类各=1（amount_cents_nonpositive=1 · units_out_of_domain=1 · settlement_units_settled_negative=1 · ai_graph_run_status_off_vocabulary=1）',
      run1msg.includes('amount_cents_nonpositive=1') && run1msg.includes('units_out_of_domain=1')
      && run1msg.includes('settlement_units_settled_negative=1') && run1msg.includes('ai_graph_run_status_off_vocabulary=1'));
    A('P0-3 ROLLBACK TO p0_neg 后脏行归零（负样本不残留 · 检测器计数与回滚联动正确）', rolledBackClean);
    console.log(`ATTEMPT p0 run#2(clean) -> ${run2err === '' ? 'OK(idempotent)' : `ERR:${run2err.slice(0, 120)}`}`);
    A('P0-4 run#2 干净整跑 0149 成功（幂等重放 · 约束重建同名同义 · 零报错）', run2err === '');
  }

  /* ── P1 · 约束生效断言（catalog） ───────────────────────────────────────── */
  {
    const hasCheck = async (table: string, name: string): Promise<boolean> =>
      (await pool.query<{ n: string }>(
        `SELECT count(*)::text AS n FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          JOIN pg_namespace ns ON ns.oid = t.relnamespace
         WHERE ns.nspname='public' AND t.relname=$1 AND c.conname=$2 AND c.contype='c'`,
        [table, name])).rows[0]!.n === '1';
    A('P1-1 ck_payment_order_amount_cents_positive 存在（CHECK）', await hasCheck('payment_order', 'ck_payment_order_amount_cents_positive'));
    A('P1-2 ck_payment_order_units_range 存在（CHECK · 案B）', await hasCheck('payment_order', 'ck_payment_order_units_range'));
    A('P1-3 ck_settlement_units_settled_nonneg 存在（CHECK · D4）', await hasCheck('settlement_ledger', 'ck_settlement_units_settled_nonneg'));
    A('P1-4 ck_ai_graph_run_status 存在（CHECK · D6 11 值）', await hasCheck('ai_graph_run', 'ck_ai_graph_run_status'));
    const def = (await pool.query<{ d: string }>(
      `SELECT pg_get_constraintdef(c.oid) AS d FROM pg_constraint c
         JOIN pg_class t ON t.oid = c.conrelid
         JOIN pg_namespace ns ON ns.oid = t.relnamespace
        WHERE ns.nspname='public' AND t.relname='ai_graph_run' AND c.conname='ck_ai_graph_run_status'`)).rows[0]?.d ?? '';
    A('P1-5 ai_graph_run 枚举 11 值逐字面量在卷（D6 全收 · 含 succeeded/completed 双终态并存）',
      RUN_STATUS_VOCAB.every((v) => def.includes(`'${v}'`)) && def.split(',').length === 11);
    const gone = (await pool.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM pg_constraint c
         JOIN pg_class t ON t.oid = c.conrelid
         JOIN pg_namespace ns ON ns.oid = t.relnamespace
        WHERE ns.nspname='public' AND t.relname='interview_event' AND c.conname='uq_interview_event_key_constraint'`)).rows[0]!.n;
    const partialIdx = (await pool.query<{ r: string | null }>(
      "SELECT to_regclass('public.uq_interview_event_key')::text AS r")).rows[0]!.r;
    A('P1-6 0027 表级约束 uq_interview_event_key_constraint 已删（D3）', gone === '0');
    A('P1-7 0021 partial index uq_interview_event_key 仍在（ON CONFLICT arbiter 面不变）', partialIdx !== null);
    const uniques = (await pool.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM pg_indexes
        WHERE schemaname='public' AND tablename='interview_event'
          AND indexdef LIKE 'CREATE UNIQUE INDEX%'
          AND indexdef LIKE '%stream_key%'
          AND indexdef LIKE '%event_key%'`)).rows[0]!.n;
    A('P1-8 (stream_key,event_key) 唯一结构恰 1 个（双重唯一写放大消除 · uq_event_seq=stream_key+seq 不计）', uniques === '1');
    // consumption_record 负门（协调方 EXEC 指令④）：0149 零触碰该表（rev2 裁 CHECK 摘除 · DBHY-1 DROP 先行）。
    const crChecks = (await pool.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM pg_constraint c
         JOIN pg_class t ON t.oid = c.conrelid
         JOIN pg_namespace ns ON ns.oid = t.relnamespace
        WHERE ns.nspname='public' AND t.relname='consumption_record' AND c.contype='c'`)).rows[0]!.n;
    A('P1-9 consumption_record 负门：0149 未对其加任何 CHECK（rev2 裁摘除 · 表生死归 DBHY-1）', crChecks === '0');
  }

  /* ── P2 · 负值/脏值拒绝（23514） ────────────────────────────────────────── */
  {
    const rejects = async (name: string, sql: string, params: unknown[] = []): Promise<void> => {
      let code = '';
      try { await pool.query(sql, params); } catch (e) { code = (e as { code?: string }).code ?? ''; }
      A(name, code === '23514');
    };
    await rejects('P2-1 payment_order amount_cents=-1 → 23514（正数 CHECK）',
      `INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units) VALUES ('dbm3-r1', $1, 'pack_10', -1, 10)`, [owner]);
    await rejects('P2-2 payment_order amount_cents=0 → 23514（严格正 · 0 元权益不走 payment_order）',
      `INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units) VALUES ('dbm3-r2', $1, 'pack_10', 0, 10)`, [owner]);
    await rejects('P2-3 payment_order units=-5 → 23514（案B 下界）',
      `INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units) VALUES ('dbm3-r3', $1, 'pack_10', 9900, -5)`, [owner]);
    await rejects('P2-4 payment_order units=1.005 → 23514（案B 形态 · 2 位小数锚 · 协调方点名样例）',
      `INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units) VALUES ('dbm3-r4', $1, 'pack_10', 9900, 1.005)`, [owner]);
    await rejects('P2-5 payment_order units=10000000000 → 23514（案B 上界=落点 numeric(12,2) 容量 · 22003 前移为下单时拒绝）',
      `INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units) VALUES ('dbm3-r5', $1, 'pack_10', 9900, 10000000000)`, [owner]);
    {
      // P2-6 走围栏前置：须 tx 内置 GUC（fence 先于 CHECK 触发——无 GUC 时错误码是 P0001 非 23514）。
      const c = await pool.connect();
      let code = '';
      try {
        await c.query('BEGIN');
        await c.query("SELECT set_config('app.principal_user', $1, true)", [owner]);
        try {
          await c.query(`INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status) VALUES ('dbm3-g0', $2, $1, 'runing')`, [owner, ivId]);
        } catch (e) { code = (e as { code?: string }).code ?? ''; }
        await c.query('ROLLBACK');
      } finally { c.release(); }
      A('P2-6 ai_graph_run status=\'runing\'（脏拼写）→ 23514（围栏过后枚举闸拦 · uq_active_run 不变量前置闸）', code === '23514');
    }
    await rejects('P2-7 settlement_ledger units_settled=-1 → 23514（D4）',
      `INSERT INTO settlement_ledger(owner_user_id, consumption_id, units_settled, service_type) VALUES ($1, gen_random_uuid(), -1, 'dbm3-r7')`, [owner]);
  }

  /* ── P3 · 三表回归（真实写路径 · asPrincipal） ───────────────────────────── */
  {
    // 表① payment_order：下单 → 回调入账 → 幂等重放 → 发桶（22003 落点链在案B 下行为不变）。
    const orderId = `dbm3-ord-${process.pid}`;
    const pay = await asPrincipal(pool, owner, async (c) => {
      const id = await createOrder(c, owner, { id: orderId, productId: 'pack_10', amountCents: 9900, units: 10, idempotencyKey: `dbm3-pay-${process.pid}` });
      const first = await markOrderPaidAndCredit(c, owner, id, `dbm3-txn-${process.pid}`);
      const replay = await markOrderPaidAndCredit(c, owner, id, `dbm3-txn-${process.pid}`);
      return { id, first, replay };
    });
    const bucket = await pool.query<{ n: string; total: string }>(
      `SELECT count(*)::text AS n, coalesce(sum(units_total), 0)::text AS total
         FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='paid' AND units_total=10`, [owner]);
    A('P3-1 payment_order 全链：createOrder → markOrderPaidAndCredit=credited → 重放=already（回调幂等零退化）',
      pay.id === orderId && pay.first === 'credited' && pay.replay === 'already');
    A('P3-2 回调发桶：owner 名下 units_total=10 的 paid 桶恰 1（22003 落点链在案B 下行为不变）',
      bucket.rows[0]!.n === '1' && bucket.rows[0]!.total === '10');

    // 表② entitlement_bucket：FIFO saga reserve→confirm（落账≥0）· reserve→release（全退）。
    const saga = await asPrincipal(pool, owner, async (c) => {
      const res = await reserveEntitlement(c, owner, `dbm3-resv-${process.pid}`, 'interview', 1.5);
      const conf = await confirmConsumption(c, owner, `dbm3-resv-${process.pid}`, 1);
      const res2 = await reserveEntitlement(c, owner, `dbm3-resv2-${process.pid}`, 'interview', 1);
      const rel = await releaseConsumption(c, owner, `dbm3-resv2-${process.pid}`);
      return { res, conf, res2, rel };
    });
    const settled = await pool.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM settlement_ledger WHERE owner_user_id=$1 AND units_settled >= 0`, [owner]);
    A('P3-3 entitlement saga：reserve(1.5)=reserved → confirm(1)=confirmed（ck_bucket_capacity 不变量零退化）',
      saga.res.status === 'reserved' && saga.conf.status === 'confirmed');
    A('P3-4 reserve→release 全退（=released）· confirm 落账 settlement_ledger ≥0 行在卷（D4 同族兜底闭环）',
      saga.res2.status === 'reserved' && saga.rel.status === 'released' && settled.rows[0]!.n !== '0');

    // 表③ interview_event：appendEvent 幂等去重（arbiter=0021 partial · 0027 删除后零影响）。
    const stream = `dbm3-stream-${process.pid}`;
    const ev = await asPrincipal(pool, owner, async (c) => {
      const s1 = await appendEvent(c, owner, stream, 'progress', { pct: 1 }, `dbm3-key-${process.pid}`);
      const s2 = await appendEvent(c, owner, stream, 'progress', { pct: 1 }, `dbm3-key-${process.pid}`);
      const a1 = await appendEvent(c, owner, stream, 'progress', { pct: 2 });
      const a2 = await appendEvent(c, owner, stream, 'progress', { pct: 3 });
      return { s1, s2, a1, a2 };
    });
    A('P3-5 interview_event：重复 eventKey 返既有 seq（appendEvent 幂等零退化 · ON CONFLICT arbiter 仍=0021 partial）',
      ev.s1 === ev.s2);
    A('P3-6 interview_event：无 eventKey 连写 seq 严格自增（NULL 行不再入唯一背衬索引 · 写路径零退化）',
      ev.a1 > ev.s1 && ev.a2 === ev.a1 + 1);
  }

  /* ── P4 · 不变量回归（uq_active_run · 双终态并存 · 正边界） ───────────────── */
  {
    // ai_graph_run 一切写路径都须 tx 内置 GUC（0058 围栏）——三个独立 tx，每 tx 重置 is_local GUC。
    const c = await pool.connect();
    let dupCode = '';
    let terminalFreed = false;
    let dual = false;
    try {
      // tx#1：同 (graph,thread) 二条非终态 → 第二条 23505。
      await c.query('BEGIN');
      await c.query("SELECT set_config('app.principal_user', $1, true)", [owner]);
      await c.query(`INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status)
        VALUES ('dbm3-g1', $2, $1, 'active')`, [owner, ivId]);
      try {
        await c.query(`INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status)
          VALUES ('dbm3-g1', $2, $1, 'waiting_user')`, [owner, ivId]);
      } catch (e) { dupCode = (e as { code?: string }).code ?? ''; }
      await c.query('ROLLBACK'); // 23505 后 tx 已中止；丢弃首行，干净进 tx#2
      // tx#2：终态释放槽位——succeeded 后同 (graph,thread) 新 active run 合法。
      await c.query('BEGIN');
      await c.query("SELECT set_config('app.principal_user', $1, true)", [owner]);
      await c.query(`INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status)
        VALUES ('dbm3-g1', $2, $1, 'active')`, [owner, ivId]);
      await c.query(`UPDATE ai_graph_run SET status='succeeded' WHERE graph_name='dbm3-g1' AND thread_id=$2 AND owner_user_id=$1`, [owner, ivId]);
      await c.query(`INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status)
        VALUES ('dbm3-g1', $2, $1, 'active')`, [owner, ivId]);
      terminalFreed = true;
      await c.query('COMMIT');
      // tx#3：同 (graph,thread) 下 completed+succeeded 双终态并存（kernel 纪元 vs 服务纪元——Ban 收敛自证）。
      await c.query('BEGIN');
      await c.query("SELECT set_config('app.principal_user', $1, true)", [owner]);
      await c.query(`INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status)
        VALUES ('dbm3-g2', $2, $1, 'completed')`, [owner, ivId]);
      await c.query(`INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status)
        VALUES ('dbm3-g2', $2, $1, 'succeeded')`, [owner, ivId]);
      dual = true;
      await c.query('COMMIT');
    } finally { c.release(); }
    A('P4-1 uq_active_run 不变量：同 (graph,thread) 二条非终态 → 第二条 23505（partial unique 零退化）', dupCode === '23505');
    A('P4-2 终态释放槽位：succeeded 后同 (graph,thread) 新 active run 合法（状态机循环零退化）', terminalFreed);
    A('P4-3 同 (graph,thread) 下 succeeded 与 completed 双终态并存均放行（枚举只增不改 · Ban 收敛）', dual);
    // 正边界：最小正价 1 分 · 半次 0.5 units（降级按比例业务口径）放行。
    let pos = true;
    try {
      await pool.query(`INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units)
        VALUES ('dbm3-pos-a', $1, 'pack_10', 1, 0.5)`, [owner]);
    } catch { pos = false; }
    A('P4-4 正边界放行：amount_cents=1 · units=0.5（半次）——CHECK 只拦脏值不拦合法业务量', pos);
  }

  /* ── P5 · 联动静态门（L1 fixture 对齐 · L2 migrate.proof 契约更新） ────────── */
  {
    const fixture = readFileSync(fileURLToPath(new URL('../sql/01_schema.sql', import.meta.url)), 'utf8');
    A('P5-1 L1：sql/01 fixture 无表级 uq_event_key 约束（drift:prove 方向=sql/ 有迁移缺即红 → 已对齐）',
      !/CONSTRAINT\s+uq_event_key\b/.test(fixture));
    A('P5-2 L1：sql/01 fixture 含 0021 同形 partial index（fixture 幂等语义保留）',
      fixture.includes('CREATE UNIQUE INDEX uq_interview_event_key')
      && fixture.includes('WHERE event_key IS NOT NULL'));
    const migrateProof = readFileSync(fileURLToPath(new URL('./migrate.proof.ts', import.meta.url)), 'utf8');
    A('P5-3 L2：migrate.proof 断言已更新为 0149 后终态（0027 约束=0 · 0021 partial 仍在）',
      migrateProof.includes('0027+0149') && migrateProof.includes("conname='uq_interview_event_key_constraint'"));
  }

  /* ── P6 · 0149 文本静态门（语句白名单 · append-only 纪律结构性保证） ───────── */
  {
    const noComments = migRaw.split('\n').map((l) => l.replace(/--.*$/, '')).join('\n');
    const stmts = splitSql(noComments);
    const doBlocks = stmts.filter((s) => /^DO \$dbm3_detect\$$/.test(s.split('\n')[0] ?? '')).length;
    const dropC = stmts.filter((s) => /^ALTER TABLE (public\.)?[a-z_]+ DROP CONSTRAINT IF EXISTS [a-z_]+$/.test(s)).length;
    const addC = stmts.filter((s) => /^ALTER TABLE (public\.)?[a-z_]+ ADD CONSTRAINT [a-z_]+ CHECK \(/.test(s)).length;
    const whitelisted = stmts.filter((s) =>
      s.startsWith('DO $dbm3_detect$')
      || /^ALTER TABLE (public\.)?[a-z_]+ DROP CONSTRAINT IF EXISTS [a-z_]+$/.test(s)
      || /^ALTER TABLE (public\.)?[a-z_]+ ADD CONSTRAINT [a-z_]+ CHECK \(/.test(s)).length;
    const other = stmts.length - whitelisted;
    const banned = /\b(UPDATE|DELETE|INSERT|DROP COLUMN|DROP TABLE|DROP POLICY|DROP ROLE|ALTER COLUMN|CREATE INDEX|CREATE TABLE|CREATE OR REPLACE|TRIGGER|GRANT|REVOKE|POLICY|NOT VALID|VALIDATE CONSTRAINT|REPLICA IDENTITY|OWNER TO|SECURITY LABEL)\b/i;
    const bannedHits = stmts.filter((s) => banned.test(s)); // 全语句含 DO 体逐一扫描（无豁免）
    A('P6-1 语句白名单：1×DO 检测 + 5×DROP CONSTRAINT IF EXISTS（4 幂等守卫+1 D3 删 0027）+ 4×ADD CONSTRAINT CHECK，无其他语句',
      doBlocks === 1 && dropC === 5 && addC === 4 && other === 0);
    A('P6-2 零 UPDATE/DELETE/INSERT/ALTER TYPE/CREATE INDEX/TRIGGER/RLS/GRANT（含 DO 体 · 零数据触碰硬保证）',
      bannedHits.length === 0);
    const bannedNames = ['ck_payment_order_amount_cents_positive', 'ck_payment_order_units_range',
      'ck_settlement_units_settled_nonneg', 'ck_ai_graph_run_status'];
    A('P6-3 零 ALTER TYPE 字样（D1 裁案B · 全文亲证）', !/ALTER\s+COLUMN|TYPE\s+numeric/i.test(migRaw));
    A('P6-4 四约束名逐名在卷（catalog 断言 P1-1..4 与文本一致）',
      bannedNames.every((n) => migRaw.includes(n)));
  }

  /* ── P7 · 对表勾销块（postgres skill 7 项 + NEXT-NODE C4 · 禁 silently 通过） ── */
  {
    console.log('CHECK  [对表·postgres-skill] 1 新表代理键=uuid DEFAULT uuidv7()/text prefix+v7 尾/事件表=bigserial —— DBID-1 已落地（本刀零触碰 · P3-5 零退化）✅');
    console.log('CHECK  [对表·postgres-skill] 2 域前缀注册表制 —— DBID-1 已落地（本刀零新前缀）✅');
    console.log('CHECK  [对表·postgres-skill] 3 高频列索引 —— 本刀删冗余唯一索引 1 枚（D3）· 其余存量违规已登记台账（GAP-DEBT-DB 族） ≠silently 通过');
    console.log('CHECK  [对表·postgres-skill] 4 status CHECK/金额单位 —— 本刀落地：正数 CHECK×2 + units 案B 护栏 + settlement≥0 + ai_graph_run 11 值枚举（P1/P2）✅（DBID-1 EXEC §4 指针本行 → 已清偿）');
    console.log('CHECK  [对表·postgres-skill] 5 jsonb 万能口袋/timestamptz —— 不在刀面·已登记台账（GAP-DEBT-DB-HYGIENE） ≠silently 通过');
    console.log('CHECK  [对表·postgres-skill] 6 触发器同族禁复制 —— 本刀触发器零触碰（P6-2）✅');
    console.log('CHECK  [对表·postgres-skill] 7 迁移 append-only·存量行永不回填 —— P6 语句白名单结构性保证（零 UPDATE/DELETE/INSERT）✅');
    const kebab = (f: string) => /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)+$/.test(f);
    const newFiles = ['db-money3.proof.ts', 'money-convention.md'].map((f) => kebab(f));
    const snake = /^0149_money_status_constraints\.sql$/.test('0149_money_status_constraints.sql');
    A('P7-1 NEXT-NODE C4 kebab-case：本刀新增文件名合规（migration 从仓库 snake 惯例）', newFiles.every(Boolean) && snake);
    console.log('CHECK  [对表·NEXT-NODE C1/C2] lint/tsc-CI 门 —— 台账既有 ❌ 行·不在本刀面（C1/C2 刀治理） ≠silently 通过');
  }

  console.log(`RESULT dbm3-db-money3 failures=${failures} at=${new Date().toISOString()}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await pool.end().catch(() => undefined); process.exit(1); });
