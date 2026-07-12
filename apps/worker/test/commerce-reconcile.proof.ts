/**
 * C1 对账兜底的**生产调度侧**证明（真 Postgres）：把已写好的 reconcile/sweep/settle 经 worker tick 真跑起来。
 * 证明:①中途弃的面试预留被回收退额度(零泄漏)+发 interview_unavailable 终态事件(无死胡同)
 *      ②活会话(续约)绝不被误扫 ③confirm 投的 outbox 被真实入账本 ④重跑/并发幂等(不重退/不重发/不重入账)。
 *   pnpm -C apps/worker prove:commerce-reconcile   (需 db:up)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  createPool, asPrincipal, reserveEntitlement, confirmConsumption, availableUnits,
  renewReservationLease, DEFAULT_LEASE_SECONDS,
} from '@meetwise/db';
import { commerceReconcileTick, reconcileOwner } from '../src/commerce-reconcile.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}.sql`, import.meta.url)), 'utf8');

// 每 owner 独立池,tick 用 superuser 池越 RLS 枚举(dev 口径)。用唯一后缀避免与其它 proof/重跑撞。
const S = Date.now().toString(36);
const OWN = (k: string) => `recon-${k}-${S}`;
const IID = (k: string) => `iv-${k}-${S}`;

const evCount = (owner: string, stream: string, kind: string) =>
  asPrincipal(pool, owner, (c) => c.query(
    "SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind=$2", [stream, kind]))
    .then((r) => r.rows[0].n as number);
const consStatus = (owner: string, key: string) =>
  asPrincipal(pool, owner, (c) => c.query(
    "SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2", [owner, key]))
    .then((r) => r.rows[0]?.status as string);

async function seedOwner(owner: string, units = 5.0) {
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now()+interval '300 days')", [owner, units]);
}
async function expireLease(owner: string, key: string) {
  await pool.query("UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id=$1 AND idempotency_key=$2", [owner, key]);
}

async function main() {
  for (const f of ['01_schema', '02_commerce', '04_report']) await pool.query(sql(f));

  section('① 中途弃的面试预留:租约过期 → 对账 tick 回收退额度 + 发 interview_unavailable 终态事件');
  {
    const owner = OWN('abandon'), iid = IID('abandon');
    await seedOwner(owner);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [iid, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, iid, 'mock_interview', 1.0)); // begin 预留
    const availAfterReserve = await asPrincipal(pool, owner, (c) => availableUnits(c, owner));
    A('预留后额度扣 1.0（5→4）', availAfterReserve === 4.0);
    await expireLease(owner, iid);                       // 模拟用户中途弃 + 无续约 → 租约过期
    const r = await commerceReconcileTick(pool);         // 真 tick(枚举 → 回收)
    A('tick 回收 ≥1 笔孤儿预留', r.staleReleased >= 1);
    A('额度全退回池（4→5,零泄漏）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
    A('预留 consumption 置 released', (await consStatus(owner, iid)) === 'released');
    A('发了 interview_unavailable 终态事件(无静默死胡同)', (await evCount(owner, iid, 'interview_unavailable')) === 1);
    // **不留半死态(审计高)**:interview 必须落 'abandoned'——否则 create() 复用"未终态"既有面试,用户开不了新面试被卡死。
    A('interview 置终态 abandoned(create 不复用尸体,用户可开新面试)',
      (await asPrincipal(pool, owner, (c) => c.query("SELECT status FROM interview WHERE id=$1", [iid]))).rows[0].status === 'abandoned');
  }

  section('② 活会话(每轮续约)绝不被对账误扫');
  {
    const owner = OWN('active'), iid = IID('active');
    await seedOwner(owner);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [iid, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, iid, 'mock_interview', 1.0));
    await expireLease(owner, iid);                       // 先把租约推到过期(模拟长思考)
    const renewed = await asPrincipal(pool, owner, (c) => renewReservationLease(c, owner, iid, DEFAULT_LEASE_SECONDS)); // 下一轮 job 来了 → 续约
    A('续约成功(仍 reserved)', renewed === true);
    const r = await commerceReconcileTick(pool);
    A('续约后不被回收(仍 reserved)', (await consStatus(owner, iid)) === 'reserved');
    A('活会话 interview 不被误置 abandoned(仍 waiting_user)',
      (await asPrincipal(pool, owner, (c) => c.query("SELECT status FROM interview WHERE id=$1", [iid]))).rows[0].status === 'waiting_user');
    A('活会话额度未退(available 仍 4.0)', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);
    A('活会话不发 interview_unavailable(误杀防护)', (await evCount(owner, iid, 'interview_unavailable')) === 0);
    // 收尾:活会话最终应能正常 confirm 结算(续约+回收未破坏结算路径)
    const conf = await asPrincipal(pool, owner, (c) => confirmConsumption(c, owner, iid, 1));
    A('活会话最终仍能 confirm 结算(未因对账丢预留)', conf.status === 'confirmed');
    void r;
  }

  section('③ confirm 投的结算 outbox 被 tick 真实入账本(exactly-once)');
  {
    const owner = OWN('settle'), iid = IID('settle');
    await seedOwner(owner);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, iid, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) => confirmConsumption(c, owner, iid, 1));  // → 投 settlement_proposed 到 outbox
    const pendBefore = (await asPrincipal(pool, owner, (c) => c.query("SELECT count(*)::int n FROM commerce_outbox WHERE status='pending'"))).rows[0].n;
    A('confirm 后 outbox 有 1 条 pending', pendBefore === 1);
    const r = await commerceReconcileTick(pool);
    A('tick 结算入账 settled≥1', r.settled >= 1);
    const ledger = await asPrincipal(pool, owner, (c) => c.query("SELECT count(*)::int n, COALESCE(SUM(units_settled),0) s FROM settlement_ledger WHERE consumption_id IN (SELECT id FROM entitlement_consumption WHERE owner_user_id=$1)", [owner]));
    A('结算账本入 1 笔 = 1.0', ledger.rows[0].n === 1 && Number(ledger.rows[0].s) === 1.0);
    const pendAfter = (await asPrincipal(pool, owner, (c) => c.query("SELECT count(*)::int n FROM commerce_outbox WHERE status='pending'"))).rows[0].n;
    A('outbox 标 relayed(0 pending)', pendAfter === 0);
  }

  section('④ 幂等:重跑 tick 不重退额度、不重发终态事件、不重入账本');
  {
    const owner = OWN('idem'), iid = IID('idem');
    await seedOwner(owner);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [iid, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, iid, 'mock_interview', 1.0));
    await expireLease(owner, iid);
    await commerceReconcileTick(pool);
    const availAfter1 = await asPrincipal(pool, owner, (c) => availableUnits(c, owner));
    await commerceReconcileTick(pool);   // 重跑
    await commerceReconcileTick(pool);   // 再重跑
    A('重跑额度不再变(不重退)', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === availAfter1 && availAfter1 === 5.0);
    A('interview_unavailable 恰 1 条(重跑不重发)', (await evCount(owner, iid, 'interview_unavailable')) === 1);
  }

  section('⑤ 多实例并发:两拍同时对同一孤儿预留 → 恰好回收一次(行锁,无双退/无双发)');
  {
    const owner = OWN('race'), iid = IID('race');
    await seedOwner(owner);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [iid, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, iid, 'mock_interview', 1.0));
    await expireLease(owner, iid);
    // 两个"worker 实例"同时对账(reconcileOwner 直调,绕开枚举去打同一 owner)
    const [a, b] = await Promise.all([
      reconcileOwner(pool, owner).catch(() => ({ staleReleased: 0, settled: 0, abandoned: 0 })),
      reconcileOwner(pool, owner).catch(() => ({ staleReleased: 0, settled: 0, abandoned: 0 })),
    ]);
    A('两并发对账合计恰回收 1 笔(无双退)', (a.staleReleased + b.staleReleased) === 1);
    A('额度恰退 1.0 回池(available=5.0,无双退超发)', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
    A('interview_unavailable 恰 1 条(并发不重发)', (await evCount(owner, iid, 'interview_unavailable')) === 1);
  }

  section('⑥ 非面试(quiz/diagnosis)孤儿预留:回收退额度,但不误发面试事件');
  {
    const owner = OWN('quiz'), qid = IID('quiz');
    await seedOwner(owner);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, qid, 'resume_quiz', 1.0));
    await expireLease(owner, qid);
    const r = await commerceReconcileTick(pool);
    A('quiz 孤儿预留被回收退额度', r.staleReleased >= 1 && (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
    A('quiz 回收不发 interview_unavailable(仅 mock_interview 发)', (await evCount(owner, qid, 'interview_unavailable')) === 0);
  }

  console.log(`\n${fail === 0 ? '✓ C1 对账兜底调度侧:孤儿预留回收+终态事件+结算入账+幂等+并发安全 全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
