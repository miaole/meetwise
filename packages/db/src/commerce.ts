/**
 * @meetwise/db · commerce saga — 共享权益池的 reserve/confirm/release + 对账。
 * 全部在 principal 上下文 client 上跑（asPrincipal 包事务，READ COMMITTED，RLS 生效）。口径见 02_commerce.sql / meetwise-pricing-model。
 *
 * 不丢/不重扣的保证（经对抗审计）：
 *  ① 幂等键 (owner, idempotency_key) 唯一 → 双击/重发只算一次（reserve 幂等返回既有；confirm/release 对终态幂等）
 *  ② reserve 用 `FOR UPDATE` 锁桶 + READ COMMITTED 的 EvalPlanQual 重判 + available-CAS → 并发不超卖；DB CHECK ck_bucket_capacity 兜底
 *  ③ reserve 全有全无：凑不够即 throw → asPrincipal 整事务回滚，不留半预留
 *  ④ confirm 按比例分账用**大余数法**：逐桶 consume 之和严格等于权威 settled 总额（杜绝逐桶独立四舍五入的分币泄漏）
 *  ⑤ confirm/release 对桶 UPDATE 校验 rowCount=1（RLS 隐藏/并发异常不静默吞）
 *  ⑥ owner 必须等于已绑定 principal（防把 owner 当可信入参绕 RLS 的脚枪）
 *
 * 死锁自由：reserve 按 (expires_at ASC, id ASC) 全序锁桶；confirm/release 按 reserve 写入的 allocations 顺序（同升序）→ 单调一致。
 */
import type { PoolClient as Client } from 'pg';   // 直接取 pg 类型,不从 ./index 桶引（否则 index↔commerce 成环）

export interface Allocation { bucket_id: string; units: number }
export type ReserveResult =
  | { status: 'reserved'; consumptionId: string; allocations: Allocation[] }
  | { status: 'duplicate'; consumptionId: string; existingStatus: string }
  | { status: 'insufficient'; available: number; requested: number };

/** 最小可交易单位（2 位小数）。低于此值的请求是客户端 bug,显式拒,不要混进 insufficient。 */
export const MIN_UNIT = 0.01;
/** 预留租约默认时长(秒)。长会话靠 renewReservationLease 心跳续约;租约过期=进程崩了 → 对账回收。 */
export const DEFAULT_LEASE_SECONDS = 1800;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** owner 必须 === 已绑定 principal。RLS 已兜底,这层是让脚本/调用方传错 owner 时早炸,而非静默 0 行。 */
async function assertPrincipal(c: Client, owner: string): Promise<void> {
  const r = await c.query("SELECT current_setting('app.principal_user', true) AS p");
  if (r.rows[0].p !== owner) throw Object.assign(new Error('principal_owner_mismatch'), { code: 'principal_owner_mismatch' });
}

/** 预留：FIFO（expires_at 升序）跨桶贪心分配 units；幂等；不够则全回滚（all-or-nothing）；带预留租约（长会话心跳续约）。 */
export async function reserveEntitlement(
  c: Client, owner: string, idempotencyKey: string, serviceType: string, units: number,
  leaseSeconds: number = DEFAULT_LEASE_SECONDS,
): Promise<ReserveResult> {
  await assertPrincipal(c, owner);
  if (units < MIN_UNIT) throw Object.assign(new Error('unit_below_minimum'), { code: 'unit_below_minimum', min: MIN_UNIT });

  // ① 幂等闸：先占坑,已存在则返回既有,绝不重复分配（同 key 不同 units 也按既有,不二次扣——掩盖客户端 bug,但保不重扣）
  const ins = await c.query(
    `INSERT INTO entitlement_consumption(owner_user_id, idempotency_key, service_type, units_requested, lease_expires_at)
     VALUES ($1,$2,$3,$4, now() + ($5 || ' seconds')::interval) ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING
     RETURNING id`, [owner, idempotencyKey, serviceType, units, String(leaseSeconds)]);
  if (ins.rowCount === 0) {
    const ex = await c.query('SELECT id, status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, idempotencyKey]);
    return { status: 'duplicate', consumptionId: ex.rows[0].id, existingStatus: ex.rows[0].status };
  }
  const consumptionId = ins.rows[0].id;

  // ② FIFO 候选桶：未过期、有余量,按到期升序锁定（FOR UPDATE 串行并发预留,EvalPlanQual 重判防超卖）
  const buckets = await c.query(
    `SELECT id, (units_total - units_reserved - units_consumed) AS avail
       FROM entitlement_bucket
      WHERE owner_user_id=$1 AND expires_at > now()
        AND (units_total - units_reserved - units_consumed) > 0
      ORDER BY expires_at ASC, id ASC
      FOR UPDATE`, [owner]);

  let remaining = units;
  const allocations: Allocation[] = [];
  for (const b of buckets.rows) {
    if (remaining <= 0) break;
    const take = r2(Math.min(Number(b.avail), remaining));
    if (take <= 0) continue;
    const upd = await c.query(
      `UPDATE entitlement_bucket SET units_reserved = units_reserved + $2, version = version + 1
         WHERE id=$1 AND (units_total - units_reserved - units_consumed) >= $2`, [b.id, take]);
    if (upd.rowCount === 1) { allocations.push({ bucket_id: b.id, units: take }); remaining = r2(remaining - take); }
  }

  // ③ 全有全无：没凑够 → throw,整事务回滚（含上面的 consumption 占坑与桶预留）
  if (remaining > 0) {
    const avail = allocations.reduce((s, a) => s + a.units, 0);
    throw Object.assign(new Error('insufficient_entitlement'), { code: 'insufficient_entitlement', available: r2(avail), requested: units });
  }

  await c.query('UPDATE entitlement_consumption SET allocations=$2 WHERE id=$1', [consumptionId, JSON.stringify(allocations)]);
  return { status: 'reserved', consumptionId, allocations };
}

export type ConfirmResult =
  | { status: 'confirmed' | 'partial_confirmed'; unitsSettled: number }
  | { status: 'noop'; finalStatus: string }
  | { status: 'error'; reason: string };

/** 落账：按 ratio（1=全额,<1=降级按比例）把预留转已耗,余量退回池；投 settlement_proposed；对终态幂等。
 *  注：不过滤 expires_at——预留是在桶有效期内拿的,会话跨过到期仍应能结算（不因系统耗时惩罚用户）。 */
export async function confirmConsumption(
  c: Client, owner: string, idempotencyKey: string, ratio = 1,
): Promise<ConfirmResult> {
  await assertPrincipal(c, owner);
  if (ratio <= 0 || ratio > 1) return { status: 'error', reason: 'ratio_out_of_range' };
  const row = await c.query(
    'SELECT id, status, units_requested, allocations FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2 FOR UPDATE',
    [owner, idempotencyKey]);
  if (row.rowCount === 0) return { status: 'error', reason: 'not_found' };
  const r = row.rows[0];
  if (r.status === 'confirmed' || r.status === 'partial_confirmed') return { status: 'noop', finalStatus: r.status }; // 幂等：不重扣、不重投 outbox
  if (r.status === 'released') return { status: 'error', reason: 'already_released' };                                // 被对账 sweeper 回收过 → 大声失败,绝不静默丢

  const settled = r2(Number(r.units_requested) * ratio);                                  // 权威总额（单一真相）
  const allocations: Allocation[] = r.allocations;
  // ④ 大余数法：前 n-1 桶按比例舍入,最后一桶吸收差额 → Σconsume 严格 === settled,不漏分不重分
  let distributed = 0;
  for (let i = 0; i < allocations.length; i++) {
    const a = allocations[i];
    const consume = i < allocations.length - 1 ? r2(a.units * ratio) : r2(settled - distributed);
    distributed = r2(distributed + consume);
    const upd = await c.query(
      'UPDATE entitlement_bucket SET units_reserved = units_reserved - $2, units_consumed = units_consumed + $3, version = version + 1 WHERE id=$1',
      [a.bucket_id, a.units, consume]);
    if (upd.rowCount !== 1) throw Object.assign(new Error('confirm_bucket_rowcount'), { code: 'confirm_bucket_rowcount', bucket: a.bucket_id }); // ⑤ 不静默
  }
  const finalStatus = ratio >= 1 ? 'confirmed' : 'partial_confirmed';
  await c.query('UPDATE entitlement_consumption SET status=$2, units_settled=$3 WHERE id=$1', [r.id, finalStatus, settled]);
  // outbox 同事务投递（confirm 与结算意图原子；真正下游结算由 relay 消费者做,见 reconcile 注释）
  await c.query(
    `INSERT INTO commerce_outbox(owner_user_id, kind, consumption_id, payload)
     VALUES ($1,'settlement_proposed',$2,$3)`, [owner, r.id, JSON.stringify({ unitsSettled: settled, ratio })]);
  return { status: finalStatus, unitsSettled: settled };
}

export type ReleaseResult = { status: 'released' | 'noop'; } | { status: 'error'; reason: string };

/** 释放：失败/中止全退预留回池；对终态幂等（已释放=noop,已落账=拒）。 */
export async function releaseConsumption(c: Client, owner: string, idempotencyKey: string): Promise<ReleaseResult> {
  await assertPrincipal(c, owner);
  const row = await c.query(
    'SELECT id, status, allocations FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2 FOR UPDATE',
    [owner, idempotencyKey]);
  if (row.rowCount === 0) return { status: 'error', reason: 'not_found' };
  const r = row.rows[0];
  if (r.status === 'released') return { status: 'noop' };
  if (r.status === 'confirmed' || r.status === 'partial_confirmed') return { status: 'error', reason: 'already_confirmed' };
  for (const a of (r.allocations as Allocation[])) {
    const upd = await c.query('UPDATE entitlement_bucket SET units_reserved = units_reserved - $2, version = version + 1 WHERE id=$1', [a.bucket_id, a.units]);
    if (upd.rowCount !== 1) throw Object.assign(new Error('release_bucket_rowcount'), { code: 'release_bucket_rowcount', bucket: a.bucket_id }); // ⑤ 不静默
  }
  await c.query("UPDATE entitlement_consumption SET status='released' WHERE id=$1", [r.id]);
  return { status: 'released' };
}

/** 当前可用额度（共享池 = 各未过期桶 available 之和）。 */
export async function availableUnits(c: Client, owner: string): Promise<number> {
  await assertPrincipal(c, owner);
  const r = await c.query(
    `SELECT COALESCE(SUM(units_total - units_reserved - units_consumed),0) AS avail
       FROM entitlement_bucket WHERE owner_user_id=$1 AND expires_at > now()`, [owner]);
  return r2(Number(r.rows[0].avail));
}

/** 预留租约心跳续约：长会话每隔一段调一次,把 lease_expires_at 往后推。仅对仍 reserved 的有效；终态不续。 */
export async function renewReservationLease(
  c: Client, owner: string, idempotencyKey: string, leaseSeconds: number = DEFAULT_LEASE_SECONDS,
): Promise<boolean> {
  await assertPrincipal(c, owner);
  const r = await c.query(
    `UPDATE entitlement_consumption SET lease_expires_at = now() + ($3 || ' seconds')::interval
       WHERE owner_user_id=$1 AND idempotency_key=$2 AND status='reserved'`, [owner, idempotencyKey, String(leaseSeconds)]);
  return r.rowCount === 1;
}

/** 被对账回收的一笔孤儿预留身份（供**业务层**据 serviceType 决定终态处置，如面试发 interview_unavailable）。
 *  commerce 只报告"回收了什么"，不碰业务表——镜像 sweepReports→quarantinedInterviews / sweepStuckInterviewJobs→failedInterviews 的分层。 */
export interface SweptReservation { consumptionId: string; idempotencyKey: string; serviceType: string }

/** 回收**租约已过期**（=持有进程崩了、没续约）的孤儿预留。心跳活着的长会话预留不会被扫——根治 backstop-TTL 误扫进行中会话。
 *  关键：状态翻转与 lease 复核在**同一条原子 UPDATE**里（行锁下再判 lease_expires_at），杜绝 heartbeat-vs-sweep TOCTOU
 *  （审计复核：分两步「无锁 SELECT 选中 → 释放时只复核 status」会放过"刚续约成功却仍被扫"的活会话）。
 *  返回被回收笔的身份（consumptionId/idempotencyKey/serviceType）：业务层据此对孤儿会话发终态事件（无静默死胡同）。 */
export async function sweepExpiredReservations(c: Client, owner: string): Promise<{ released: number; swept: SweptReservation[] }> {
  await assertPrincipal(c, owner);
  const swept = await c.query(
    `UPDATE entitlement_consumption SET status='released'
       WHERE owner_user_id=$1 AND status='reserved' AND lease_expires_at < now()
       RETURNING id, idempotency_key, service_type, allocations`, [owner]);
  const reclaimed: SweptReservation[] = [];
  for (const row of swept.rows) {
    for (const a of (row.allocations as Allocation[])) {
      const upd = await c.query('UPDATE entitlement_bucket SET units_reserved = units_reserved - $2, version = version + 1 WHERE id=$1', [a.bucket_id, a.units]);
      if (upd.rowCount !== 1) throw Object.assign(new Error('release_bucket_rowcount'), { code: 'release_bucket_rowcount', bucket: a.bucket_id });
    }
    reclaimed.push({ consumptionId: row.id, idempotencyKey: row.idempotency_key, serviceType: row.service_type });
  }
  return { released: swept.rowCount ?? 0, swept: reclaimed };
}

/**
 * outbox 结算消费者（**真实下游副作用,非 stub**）：把 pending 的 settlement_proposed 逐条入**结算账本** settlement_ledger。
 * `FOR UPDATE OF o SKIP LOCKED` → 多消费者不重复处理；ledger UNIQUE(consumption_id) + ON CONFLICT DO NOTHING → at-least-once + 重跑 = exactly-once 入账。
 * 入账后才把 outbox 标 relayed。重跑安全：已入账的不重复入,只补标 relayed。
 */
export async function settleOutbox(c: Client, owner: string): Promise<{ settled: number }> {
  await assertPrincipal(c, owner);
  const rows = await c.query(
    `SELECT o.id, o.consumption_id, o.payload, ec.service_type
       FROM commerce_outbox o JOIN entitlement_consumption ec ON ec.id = o.consumption_id
      WHERE o.owner_user_id=$1 AND o.status='pending'
      FOR UPDATE OF o SKIP LOCKED`, [owner]);
  let settled = 0;
  for (const row of rows.rows) {
    await c.query(
      `INSERT INTO settlement_ledger(owner_user_id, consumption_id, units_settled, service_type)
       VALUES ($1,$2,$3,$4) ON CONFLICT (consumption_id) DO NOTHING`,
      [owner, row.consumption_id, row.payload.unitsSettled, row.service_type]);
    const upd = await c.query("UPDATE commerce_outbox SET status='relayed' WHERE id=$1", [row.id]);
    if (upd.rowCount === 1) settled++;
  }
  return { settled };
}

/** 对账 = 回收租约过期的孤儿预留 + 跑结算消费者落账本。周期性后台跑。
 *  swept = 本次回收的孤儿预留身份，业务层据 serviceType 补终态事件（如面试 interview_unavailable）。 */
export async function reconcile(c: Client, owner: string): Promise<{ staleReleased: number; settled: number; swept: SweptReservation[] }> {
  const swept = await sweepExpiredReservations(c, owner);
  const out = await settleOutbox(c, owner);
  return { staleReleased: swept.released, settled: out.settled, swept: swept.swept };
}
