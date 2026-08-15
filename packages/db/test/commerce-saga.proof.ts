/**
 * commerce saga 证明（对真 Postgres）：共享权益池 reserve/confirm/release + FIFO + 按比例 + 并发不超卖 + 对账。
 * 这是"零业务数据丢失"承重证明:额度不丢、不重扣、降级按比例、FIFO 先到期先扣、并发安全、失败全退、对账兜底。
 *   pnpm commerce:prove（完整版本化迁移后的隔离 PostgreSQL）
 */
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  reserveEntitlement, confirmConsumption, releaseConsumption, availableUnits,
  createOrder, markOrderPaidAndCredit, completeInterviewAndConfirm, abandonInterviewAndRelease,
  renewReservationLease, sweepExpiredReservations, settleOutbox, reconcile,
} from '../src/index.ts';

// 桶口径自检：全池 reserved+consumed 守恒检查用
const sumConsumed = (c: any, owner: string) =>
  c.query("SELECT COALESCE(SUM(units_consumed),0) s, COALESCE(SUM(units_reserved),0) r FROM entitlement_bucket WHERE owner_user_id=$1", [owner]).then((x: any) => x.rows[0]);

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
// seed 用隔离库拥有者：userA 三桶（gift 1.0 最先到期 / trial 1.0 次之 / paid 2.0 最后），共 4.0；userB 1 桶
async function seed() {
  await assertIsolatedTestTarget(pool);
  await pool.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES
    ('userA','gift',1.0, now()+interval '10 days'),
    ('userA','trial',1.0, now()+interval '20 days'),
    ('userA','paid',2.0, now()+interval '300 days'),
    ('userB','paid',5.0, now()+interval '300 days')`);
}

async function main() {
  await seed();

  section('FIFO 先到期先扣 + 全有全无预留');
  const r1 = await asPrincipal(pool, 'userA', (c) => reserveEntitlement(c, 'userA', 'k-1', 'mock_interview', 1.5));
  A('reserve 1.5 成功', r1.status === 'reserved');
  if (r1.status === 'reserved') {
    A('FIFO：先吃 gift(1.0)+trial(0.5)，不碰 paid', r1.allocations.length === 2 && r1.allocations[0]?.units === 1.0 && r1.allocations[1]?.units === 0.5);
  }
  A('可用额度 4.0 → 预留 1.5 后剩 2.5', (await asPrincipal(pool, 'userA', (c) => availableUnits(c, 'userA'))) === 2.5);

  section('幂等：重复 reserve 同 key 不重复分配');
  const dup = await asPrincipal(pool, 'userA', (c) => reserveEntitlement(c, 'userA', 'k-1', 'mock_interview', 1.5));
  A('重复 reserve → duplicate', dup.status === 'duplicate');
  A('可用额度仍 2.5（没二次扣）', (await asPrincipal(pool, 'userA', (c) => availableUnits(c, 'userA'))) === 2.5);

  section('confirm 全额：预留转已耗，投 settlement_proposed');
  const cf = await asPrincipal(pool, 'userA', (c) => confirmConsumption(c, 'userA', 'k-1', 1));
  A('confirm 全额 → confirmed，结算 1.5', cf.status === 'confirmed' && (cf as any).unitsSettled === 1.5);
  const ob = await asPrincipal(pool, 'userA', (c) => c.query("SELECT count(*)::int n FROM commerce_outbox WHERE kind='settlement_proposed'"));
  A('outbox 落 settlement_proposed 1 条', ob.rows[0].n === 1);
  A('confirm 后可用仍 2.5（已耗≠回池）', (await asPrincipal(pool, 'userA', (c) => availableUnits(c, 'userA'))) === 2.5);

  section('幂等 confirm：再次 confirm 不重扣、不重投 outbox');
  const cf2 = await asPrincipal(pool, 'userA', (c) => confirmConsumption(c, 'userA', 'k-1', 1));
  A('重复 confirm → noop', cf2.status === 'noop');
  const ob2 = await asPrincipal(pool, 'userA', (c) => c.query("SELECT count(*)::int n FROM commerce_outbox WHERE kind='settlement_proposed'"));
  A('outbox 仍仅 1 条（不重投）', ob2.rows[0].n === 1);

  section('降级按比例(1/2)：confirm ratio=0.5，余量退回池');
  await asPrincipal(pool, 'userA', (c) => reserveEntitlement(c, 'userA', 'k-2', 'mock_interview', 1.0)); // 吃 paid 1.0
  const before = await asPrincipal(pool, 'userA', (c) => availableUnits(c, 'userA'));                    // 2.5-1.0=1.5
  const pc = await asPrincipal(pool, 'userA', (c) => confirmConsumption(c, 'userA', 'k-2', 0.5));
  A('降级 confirm → partial_confirmed，结算 0.5', pc.status === 'partial_confirmed' && (pc as any).unitsSettled === 0.5);
  const after = await asPrincipal(pool, 'userA', (c) => availableUnits(c, 'userA'));
  A('未结算 0.5 退回池（available 回升 0.5）', after === before + 0.5);

  section('失败/中止 release：预留全退、不计费、不投 outbox');
  await asPrincipal(pool, 'userA', (c) => reserveEntitlement(c, 'userA', 'k-3', 'mock_interview', 1.0));
  const avBeforeRel = await asPrincipal(pool, 'userA', (c) => availableUnits(c, 'userA'));
  const rel = await asPrincipal(pool, 'userA', (c) => releaseConsumption(c, 'userA', 'k-3'));
  A('release → released', rel.status === 'released');
  A('额度全退回（available 回升 1.0）', (await asPrincipal(pool, 'userA', (c) => availableUnits(c, 'userA'))) === avBeforeRel + 1.0);
  const obc = await asPrincipal(pool, 'userA', (c) => c.query("SELECT count(*)::int n FROM commerce_outbox"));
  A('release 不投 outbox（outbox 仍 2 条：k-1 全额 + k-2 降级）', obc.rows[0].n === 2);
  const relConfirm = await asPrincipal(pool, 'userA', (c) => confirmConsumption(c, 'userA', 'k-3', 1));
  A('已 release 的不能再 confirm', relConfirm.status === 'error' && (relConfirm as any).reason === 'already_released');

  section('全有全无：余额不足时不留半预留');
  const avNow = await asPrincipal(pool, 'userA', (c) => availableUnits(c, 'userA'));
  let threw = false;
  try { await asPrincipal(pool, 'userA', (c) => reserveEntitlement(c, 'userA', 'k-over', 'mock_interview', avNow + 5)); } catch (e: any) { threw = e?.code === 'insufficient_entitlement'; }
  A('超额 reserve 抛 insufficient_entitlement', threw);
  A('失败后可用额度不变（无半预留泄漏）', (await asPrincipal(pool, 'userA', (c) => availableUnits(c, 'userA'))) === avNow);
  const orphan = await asPrincipal(pool, 'userA', (c) => c.query("SELECT count(*)::int n FROM entitlement_consumption WHERE idempotency_key='k-over'"));
  A('失败的 consumption 占坑也已回滚（0 残留）', orphan.rows[0].n === 0);

  section('并发不超卖：两笔并发抢最后 1.0，仅一笔成功');
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('userC','paid',1.0, now()+interval '300 days')");
  const attempt = (key: string) => asPrincipal(pool, 'userC', (c) => reserveEntitlement(c, 'userC', key, 'mock_interview', 1.0))
    .then((r) => r.status === 'reserved' ? 1 : 0).catch(() => 0);
  const wins = (await Promise.all([attempt('c-a'), attempt('c-b')])).reduce((a, b) => a + b, 0);
  A('两并发预留恰好 1 笔成功（FOR UPDATE+CAS 防超卖）', wins === 1);
  A('userC 池被扣干净（available=0，无超卖）', (await asPrincipal(pool, 'userC', (c) => availableUnits(c, 'userC'))) === 0);

  section('RLS：userB 看不到也花不掉 userA 的池');
  A('userB 视角 userA 桶=0 行（FORCE RLS）', (await asPrincipal(pool, 'userB', (c) => c.query("SELECT count(*)::int n FROM entitlement_bucket WHERE owner_user_id='userA'"))).rows[0].n === 0);
  A('userB 自己池可用=5.0', (await asPrincipal(pool, 'userB', (c) => availableUnits(c, 'userB'))) === 5.0);

  section('租约心跳：活着的长会话预留不被扫；只回收租约过期的孤儿');
  // 活预留（默认租约）：reconcile 不应扫它
  await asPrincipal(pool, 'userA', (c) => reserveEntitlement(c, 'userA', 'k-live', 'mock_interview', 0.5));
  await asPrincipal(pool, 'userA', (c) => sweepExpiredReservations(c, 'userA'));
  A('租约未过期的预留不被扫（仍 reserved）',
    (await asPrincipal(pool, 'userA', (c) => c.query("SELECT status FROM entitlement_consumption WHERE idempotency_key='k-live'"))).rows[0].status === 'reserved');
  // 心跳续约：先把租约改到已过期,再心跳续上 → 不被扫
  await asPrincipal(pool, 'userA', (c) => reserveEntitlement(c, 'userA', 'k-hb', 'mock_interview', 0.5));
  await pool.query("UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id='userA' AND idempotency_key='k-hb'");
  A('心跳续约成功', await asPrincipal(pool, 'userA', (c) => renewReservationLease(c, 'userA', 'k-hb', 1800)));
  await asPrincipal(pool, 'userA', (c) => sweepExpiredReservations(c, 'userA'));
  A('续约后不被扫（仍 reserved）',
    (await asPrincipal(pool, 'userA', (c) => c.query("SELECT status FROM entitlement_consumption WHERE idempotency_key='k-hb'"))).rows[0].status === 'reserved');

  section('并发 心跳续约 vs 回收（TOCTOU 复核）：续约成功 ⟹ 绝不被扫（原子 UPDATE 复核 lease）');
  // 多轮并发抢同一边界预留：不变量必须每轮都成立——renew 返回 true 则该笔必仍 reserved
  let toctouOk = true;
  for (let round = 0; round < 8; round++) {
    const key = `k-race-${round}`;
    await asPrincipal(pool, 'userA', (c) => reserveEntitlement(c, 'userA', key, 'mock_interview', 0.01));
    await pool.query("UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 second' WHERE owner_user_id='userA' AND idempotency_key=$1", [key]); // 置到刚过期(边界)
    const [renewed] = await Promise.all([
      asPrincipal(pool, 'userA', (c) => renewReservationLease(c, 'userA', key, 1800)).catch(() => false),
      asPrincipal(pool, 'userA', (c) => sweepExpiredReservations(c, 'userA')).catch(() => ({ released: 0 })),
    ]);
    const st = (await asPrincipal(pool, 'userA', (c) => c.query('SELECT status FROM entitlement_consumption WHERE idempotency_key=$1', [key]))).rows[0].status;
    if (renewed === true && st !== 'reserved') toctouOk = false;          // 核心不变量：续约成功却被扫 = 破
    if (renewed === false && !['released', 'reserved'].includes(st)) toctouOk = false;
    await asPrincipal(pool, 'userA', (c) => releaseConsumption(c, 'userA', key)).catch(() => {}); // 清理(若仍 reserved)
  }
  A('8 轮并发 续约vs回收：续约成功者从不被扫（无 TOCTOU 丢预留）', toctouOk);

  section('对账：租约过期的孤儿预留回收 + outbox 真实结算入账本（exactly-once）');
  await asPrincipal(pool, 'userA', (c) => reserveEntitlement(c, 'userA', 'k-stale', 'mock_interview', 0.5));
  await pool.query("UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id='userA' AND idempotency_key='k-stale'");
  const avBeforeSweep = await asPrincipal(pool, 'userA', (c) => availableUnits(c, 'userA'));
  const rec = await asPrincipal(pool, 'userA', (c) => reconcile(c, 'userA'));
  A('回收 1 笔租约过期的孤儿预留', rec.staleReleased === 1);
  A('swept 带回被回收笔身份(idempotencyKey/serviceType 供业务层发终态事件)',
    rec.swept.length === 1 && rec.swept[0]?.idempotencyKey === 'k-stale' && rec.swept[0]?.serviceType === 'mock_interview');
  A('结算消费者把 2 条 pending outbox 真实入账（settled=2）', rec.settled === 2);
  A('孤儿预留额度回池（available 回升 0.5）', (await asPrincipal(pool, 'userA', (c) => availableUnits(c, 'userA'))) === avBeforeSweep + 0.5);
  const ledger1 = await asPrincipal(pool, 'userA', (c) => c.query("SELECT count(*)::int n, COALESCE(SUM(units_settled),0) s FROM settlement_ledger"));
  A('结算账本入 2 笔（k-1 全额 1.5 + k-2 降级 0.5 = 2.0）', ledger1.rows[0].n === 2 && Number(ledger1.rows[0].s) === 2.0);

  section('结算 exactly-once：重跑 reconcile 不重复入账');
  const rec2 = await asPrincipal(pool, 'userA', (c) => reconcile(c, 'userA'));
  A('重跑无 pending → settled=0（不重投）', rec2.settled === 0);
  A('重跑无孤儿 → swept 空（已 released 不二次回收,终态事件 exactly-once）', rec2.staleReleased === 0 && rec2.swept.length === 0);
  const ledger2 = await asPrincipal(pool, 'userA', (c) => c.query("SELECT count(*)::int n FROM settlement_ledger"));
  A('账本仍 2 笔（UNIQUE(consumption_id) 幂等,at-least-once→exactly-once）', ledger2.rows[0].n === 2);

  section('多桶降级分账：逐桶 consume 之和严格等于 settled（无分币泄漏 · 审计#4）');
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('userD','gift',0.25, now()+interval '5 days'),('userD','paid',0.25, now()+interval '50 days')");
  await asPrincipal(pool, 'userD', (c) => reserveEntitlement(c, 'userD', 'd-1', 'mock_interview', 0.5)); // 跨两桶各 0.25
  const dpc = await asPrincipal(pool, 'userD', (c) => confirmConsumption(c, 'userD', 'd-1', 0.5));       // 逐桶独立舍入会 0.13+0.13=0.26≠0.25
  const dSettled = (dpc as any).unitsSettled;
  const dBuckets = await asPrincipal(pool, 'userD', (c) => sumConsumed(c, 'userD')) as { s: unknown };
  A('settled=0.25（权威总额）', dSettled === 0.25);
  A('两桶 consumed 之和===settled（0.25,非 0.26）', Number(dBuckets.s) === 0.25);
  A('降级后未结算 0.25 退回池（available=0.25）', (await asPrincipal(pool, 'userD', (c) => availableUnits(c, 'userD'))) === 0.25);

  section('并发 confirm vs release 抢同一 key：恰好一个生效');
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('userE','paid',1.0, now()+interval '50 days')");
  await asPrincipal(pool, 'userE', (c) => reserveEntitlement(c, 'userE', 'e-1', 'mock_interview', 1.0));
  const cfp = asPrincipal(pool, 'userE', (c) => confirmConsumption(c, 'userE', 'e-1', 1)).catch(() => ({ status: 'error' as const }));
  const rlp = asPrincipal(pool, 'userE', (c) => releaseConsumption(c, 'userE', 'e-1')).catch(() => ({ status: 'error' as const }));
  const [cfr, rlr] = await Promise.all([cfp, rlp]);
  const terminal = await asPrincipal(pool, 'userE', (c) => c.query("SELECT status FROM entitlement_consumption WHERE idempotency_key='e-1'"));
  const settledOnce = (cfr.status === 'confirmed' && rlr.status !== 'released') || (rlr.status === 'released' && cfr.status !== 'confirmed');
  A('confirm/release 并发恰好一个生效（另一个被终态守卫挡）', settledOnce && ['confirmed', 'released'].includes(terminal.rows[0].status));

  section('边界：亚分单位 reserve 显式拒（不混进 insufficient）');
  let belowMin = false;
  try { await asPrincipal(pool, 'userB', (c) => reserveEntitlement(c, 'userB', 'b-tiny', 'mock_interview', 0.004)); } catch (e: any) { belowMin = e?.code === 'unit_below_minimum'; }
  A('reserve 0.004 → unit_below_minimum（非 insufficient）', belowMin);

  section('过期语义：预留期内拿的额度,会话跨过到期仍可结算（不惩罚系统耗时）');
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('userF','paid',1.0, now()+interval '50 days')");
  await asPrincipal(pool, 'userF', (c) => reserveEntitlement(c, 'userF', 'f-1', 'mock_interview', 1.0));
  await pool.query("UPDATE entitlement_bucket SET expires_at = now() - interval '1 day' WHERE owner_user_id='userF'"); // 模拟会话跨过到期
  const fcf = await asPrincipal(pool, 'userF', (c) => confirmConsumption(c, 'userF', 'f-1', 1));
  A('跨到期仍能 confirm（已预留的可结算）', fcf.status === 'confirmed' && (fcf as any).unitsSettled === 1.0);

  section('脚枪防护：owner ≠ 已绑定 principal 早炸');
  let mism = false;
  try { await asPrincipal(pool, 'userB', (c) => availableUnits(c, 'userA')); } catch (e: any) { mism = e?.code === 'principal_owner_mismatch'; }
  A('owner≠principal → principal_owner_mismatch（不静默走 RLS 0 行）', mism);

  section('DB 兜底不变量：直接越过应用超卖被 CHECK 拒');
  let capBlocked = false;
  try { await pool.query("UPDATE entitlement_bucket SET units_reserved = units_total + 1 WHERE owner_user_id='userB'"); } catch { capBlocked = true; }
  A('ck_bucket_capacity 拦截超卖直写', capBlocked);

  section('P0：并发同 idempotencyKey 创建订单 → 三个调用全返回同一 orderId（不暴露 23505）');
  const orderOwner = 'order-idem-owner';
  const sameOrder = await Promise.all([0, 1, 2].map((i) =>
    asPrincipal(pool, orderOwner, (c) => createOrder(c, orderOwner, {
      id: `ord-idem-${i}`, productId: 'pack_10', amountCents: 9900, units: 10, idempotencyKey: 'same-order-key',
    }))));
  A('3 个并发下单调用都成功且 orderId 集合大小=1', new Set(sameOrder).size === 1);
  const orderRows = await pool.query("SELECT count(*)::int n FROM payment_order WHERE owner_user_id=$1 AND idempotency_key='same-order-key'", [orderOwner]);
  A('同 idempotencyKey 数据库恰 1 行订单', orderRows.rows[0].n === 1);

  section('P0：同一 providerTxn 并发打两张订单 → 恰一次发权益，另一笔确定性 conflict');
  await Promise.all([
    asPrincipal(pool, 'pay-owner-a', (c) => createOrder(c, 'pay-owner-a', { id: 'pay-order-a', productId: 'pack_10', amountCents: 9900, units: 10 })),
    asPrincipal(pool, 'pay-owner-b', (c) => createOrder(c, 'pay-owner-b', { id: 'pay-order-b', productId: 'pack_10', amountCents: 9900, units: 10 })),
  ]);
  const duplicateTxnResults = await Promise.all([
    asPrincipal(pool, 'pay-owner-a', (c) => markOrderPaidAndCredit(c, 'pay-owner-a', 'pay-order-a', 'psp-txn-global-once')),
    asPrincipal(pool, 'pay-owner-b', (c) => markOrderPaidAndCredit(c, 'pay-owner-b', 'pay-order-b', 'psp-txn-global-once')),
  ]);
  A('跨订单并发相同流水：credited 恰 1，conflict 恰 1',
    duplicateTxnResults.filter((x) => x === 'credited').length === 1 && duplicateTxnResults.filter((x) => x === 'conflict').length === 1);
  const claimed = await pool.query("SELECT count(*)::int n FROM payment_order WHERE provider_txn='psp-txn-global-once'");
  const granted = await pool.query("SELECT COALESCE(SUM(units_total),0)::float8 u FROM entitlement_bucket WHERE owner_user_id IN ('pay-owner-a','pay-owner-b')");
  A('providerTxn 全局仅归属 1 单且合计权益=10.0', claimed.rows[0].n === 1 && Number(granted.rows[0].u) === 10);

  section('P0：abandon vs confirm 并发 16 轮，只能收口为 completed/confirmed 或 abandoned/released');
  let terminalPairsOk = true;
  let terminalEffectsOk = true;
  for (let round = 0; round < 16; round++) {
    const owner = `pair-owner-${round}`;
    const interviewId = `pair-iv-${round}`;
    await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',1.0,now()+interval '90 days')", [owner]);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [interviewId, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, interviewId, 'mock_interview', 1));
    const outcomes = await Promise.all([
      asPrincipal(pool, owner, (c) => completeInterviewAndConfirm(c, owner, interviewId)).then(() => 'complete').catch(() => 'complete_conflict'),
      asPrincipal(pool, owner, (c) => abandonInterviewAndRelease(c, owner, interviewId)).then(() => 'abandon').catch(() => 'abandon_conflict'),
    ]);
    const pair = await pool.query(
      `SELECT i.status AS interview_status, ec.status AS consumption_status
         FROM interview i JOIN entitlement_consumption ec
           ON ec.owner_user_id=i.owner_user_id AND ec.idempotency_key=i.id
        WHERE i.id=$1`, [interviewId]);
    const s = pair.rows[0];
    if (!((s.interview_status === 'completed' && s.consumption_status === 'confirmed') ||
          (s.interview_status === 'abandoned' && s.consumption_status === 'released'))) terminalPairsOk = false;
    if (!((outcomes.includes('complete') && outcomes.includes('abandon_conflict')) ||
          (outcomes.includes('abandon') && outcomes.includes('complete_conflict')))) terminalEffectsOk = false;
  }
  A('16/16 并发轮次终态配对均合法', terminalPairsOk);
  A('16/16 并发轮次恰一个收口动作提交，另一方回滚', terminalEffectsOk);

  section('P0：数据库触发器拒绝绕过应用的非法 terminal pair');
  const triggerOwner = 'pair-trigger-owner';
  const triggerInterview = 'pair-trigger-iv';
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',1.0,now()+interval '90 days')", [triggerOwner]);
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [triggerInterview, triggerOwner]);
  await asPrincipal(pool, triggerOwner, (c) => reserveEntitlement(c, triggerOwner, triggerInterview, 'mock_interview', 1));
  let directPairBlocked = false;
  try {
    await asPrincipal(pool, triggerOwner, (c) => c.query("UPDATE interview SET status='completed' WHERE id=$1", [triggerInterview]));
  } catch (e: any) { directPairBlocked = e?.code === '23514'; }
  A('reserved 状态直接改 completed 被 DB 约束拒绝(23514)', directPairBlocked);

  console.log(`\n${failures === 0 ? '✓ 全部通过' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
