/**
 * @meetwise/db · 支付订单 ops。承重:回调**幂等 exactly-once 入账**——CAS(created→paid)保证重复回调只入账一次。
 */
import type { PoolClient as Client } from 'pg';

/** 创建订单(幂等):同 owner+idempotencyKey 重试 → 返回已存在订单 id(不重复下单)。返回最终 orderId。 */
export async function createOrder(
  c: Client, owner: string, x: { id: string; productId: string; amountCents: number; units: number; idempotencyKey?: string },
): Promise<string> {
  if (!x.idempotencyKey) {
    await c.query(
      'INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units, idempotency_key) VALUES ($1,$2,$3,$4,$5,NULL)',
      [x.id, owner, x.productId, x.amountCents, x.units]);
    return x.id;
  }

  // 不能用「SELECT 再 INSERT」：并发的同 key 请求会一起读到不存在，输家撞 23505 后无法把
  // 网络重试收敛为同一个 orderId。ON CONFLICT 会等待赢家事务落定；若赢家提交，随后独立 SELECT
  // 能读到它，若赢家回滚，本 INSERT 自己成为赢家。于是三个并发请求都会返回同一 id，而不是有人 500/409。
  const inserted = await c.query(
    `INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units, idempotency_key)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING
     RETURNING id`,
    [x.id, owner, x.productId, x.amountCents, x.units, x.idempotencyKey]);
  if (inserted.rowCount === 1) return inserted.rows[0].id;

  const existing = await c.query(
    'SELECT id, product_id, amount_cents, units FROM payment_order WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, x.idempotencyKey]);
  // ON CONFLICT DO NOTHING 只会在另一笔同约束写已提交后返回 0；这里读不到说明约束/数据被绕过，
  // 必须显式失败，不能生成第二笔收费单。
  if (existing.rowCount !== 1) {
    const err: any = new Error('idempotency_replay_missing'); err.code = 'idempotency_replay_missing'; throw err;
  }
  const ex = existing.rows[0];
  // 幂等键绑定完整计费语义，不只比 productId。调用者目前由服务端产品表派生金额/units，仍把三项
  // 都纳入比较，避免未来定价/调用方演进时静默返回不等价旧订单。
  if (ex.product_id !== x.productId || Number(ex.amount_cents) !== x.amountCents || Number(ex.units) !== x.units) {
    const err: any = new Error('idempotency_key_conflict'); err.code = 'idempotency_key_conflict'; throw err;
  }
  return ex.id;
}

export async function getOrder(c: Client, owner: string, id: string): Promise<{ id: string; status: string; units: number; amountCents: number; productId: string } | null> {
  const r = await c.query('SELECT id, status, units, amount_cents, product_id FROM payment_order WHERE id=$1', [id]);
  if (r.rowCount === 0) return null;
  const x = r.rows[0];
  return { id: x.id, status: x.status, units: Number(x.units), amountCents: x.amount_cents, productId: x.product_id };
}

export type CreditResult = 'credited' | 'already' | 'conflict' | 'not_found';

/** 支付回调入账：
 * - `payment_order.provider_txn` 的 partial global UNIQUE 是渠道支付事实的唯一归属，禁止同一流水跨订单发两次权益；
 * - 同订单同流水重放 → `already`；同流水指向另一订单/订单已被其他流水处理 → `conflict`；
 * - 订单状态与权益桶在调用方的同一 `asPrincipal` 事务内提交，事务失败不会留下「paid 但未发权益」。
 */
export async function markOrderPaidAndCredit(c: Client, owner: string, orderId: string, providerTxn: string): Promise<CreditResult> {
  // 唯一索引在跨订单并发时会抛 23505。Savepoint 让当前外层业务事务可回到可查询状态，
  // 以确定性的 `conflict` 回应，而非把数据库错误泄漏成 500。
  await c.query('SAVEPOINT payment_provider_txn_claim');
  let upd;
  try {
    upd = await c.query(
      `UPDATE payment_order
          SET status='paid', provider_txn=$3, version=version+1
        WHERE id=$1 AND owner_user_id=$2 AND status='created'
          AND NOT EXISTS (
            SELECT 1 FROM payment_order claimed
             WHERE claimed.provider_txn=$3
          )
        RETURNING units`,
      [orderId, owner, providerTxn]);
    await c.query('RELEASE SAVEPOINT payment_provider_txn_claim');
  } catch (e: any) {
    if (e?.code !== '23505') throw e;
    await c.query('ROLLBACK TO SAVEPOINT payment_provider_txn_claim');
    await c.query('RELEASE SAVEPOINT payment_provider_txn_claim');
    return 'conflict';
  }
  if (upd.rowCount === 1) {
    await c.query(
      "INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at) VALUES ($1,'paid',$2, now()+interval '365 days')",
      [owner, Number(upd.rows[0].units)]);
    return 'credited';
  }
  // 没改到 = 不是 created。看是否已 paid 且同流水(幂等重复回调)
  const cur = await c.query('SELECT status, provider_txn FROM payment_order WHERE id=$1 AND owner_user_id=$2', [orderId, owner]);
  if (cur.rowCount === 0) return 'not_found';
  if (cur.rows[0].status === 'paid' && cur.rows[0].provider_txn === providerTxn) return 'already';
  return 'conflict';
}
