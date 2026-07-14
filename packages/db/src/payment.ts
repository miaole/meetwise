/**
 * @meetwise/db · 支付订单 ops。承重:回调**幂等 exactly-once 入账**——CAS(created→paid)保证重复回调只入账一次。
 */
import type { PoolClient as Client } from 'pg';

/** 创建订单(幂等):同 owner+idempotencyKey 重试 → 返回已存在订单 id(不重复下单)。返回最终 orderId。 */
export async function createOrder(
  c: Client, owner: string, x: { id: string; productId: string; amountCents: number; units: number; idempotencyKey?: string },
): Promise<string> {
  if (x.idempotencyKey) {
    const ex = await c.query('SELECT id, product_id FROM payment_order WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, x.idempotencyKey]);
    if (ex.rowCount! > 0) {
      // 幂等**必须同参**:同 key 但不同 productId = 语义冲突,绝不能静默返回原单(用户想买 pack_30 却拿回 pack_10 且不报错)。
      if (ex.rows[0].product_id !== x.productId) { const err: any = new Error('idempotency_key_conflict'); err.code = 'idempotency_key_conflict'; throw err; }
      return ex.rows[0].id;                                                        // 幂等:同 key 同参重试 → 返回原单
    }
  }
  await c.query(
    'INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units, idempotency_key) VALUES ($1,$2,$3,$4,$5,$6)',
    [x.id, owner, x.productId, x.amountCents, x.units, x.idempotencyKey ?? null]);
  return x.id;
}

export async function getOrder(c: Client, owner: string, id: string): Promise<{ id: string; status: string; units: number; amountCents: number; productId: string } | null> {
  const r = await c.query('SELECT id, status, units, amount_cents, product_id FROM payment_order WHERE id=$1', [id]);
  if (r.rowCount === 0) return null;
  const x = r.rows[0];
  return { id: x.id, status: x.status, units: Number(x.units), amountCents: x.amount_cents, productId: x.product_id };
}

export type CreditResult = 'credited' | 'already' | 'conflict' | 'not_found';

/** 支付回调入账:CAS created→paid(只第一次成功)+ 充值额度桶。重复回调(同单同流水)→ 'already' 不二次入账。 */
export async function markOrderPaidAndCredit(c: Client, owner: string, orderId: string, providerTxn: string): Promise<CreditResult> {
  const upd = await c.query(
    "UPDATE payment_order SET status='paid', provider_txn=$3, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='created' RETURNING units",
    [orderId, owner, providerTxn]);
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
