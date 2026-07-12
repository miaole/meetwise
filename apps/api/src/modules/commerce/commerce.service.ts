import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID, createHmac, timingSafeEqual } from 'node:crypto';
import { createOrder, getOrder, markOrderPaidAndCredit, availableUnits } from '@meetwise/db';
import { DbService } from '../../platform/db.service';

/**
 * 交易应用服务(拥有 asPrincipal 事务边界 + 业务编排)。controller 只解析/校验/映射 HTTP,不碰 SQL(修审计 F1)。
 * 承重:回调**幂等 exactly-once 入账**(CAS,重复回调不双扣不双入)+ HMAC 验签(密钥缺失 fail-closed)。
 * 注:此回调经 principal(适合"支付后跳回"确认流);真异步 webhook 需独立无登录态端点 + 验签 + 查单 owner + 特权入账。
 */
export const PRODUCTS = [
  { id: 'pack_10', name: '10 次面试包', amountCents: 9900, units: 10 },
  { id: 'pack_30', name: '30 次面试包', amountCents: 24900, units: 30 },
];

@Injectable()
export class CommerceService {
  constructor(private readonly db: DbService) {}

  products() {
    return { products: PRODUCTS };
  }

  async createOrder(principal: string, dto: { productId?: string }, idempotencyKey?: string) {
    const p = PRODUCTS.find((x) => x.id === dto?.productId);
    if (!p) throw new HttpException({ error: 'unknown_product' }, HttpStatus.BAD_REQUEST);
    const id = 'ord_' + randomUUID();
    const orderId = await this.db.asPrincipal(principal, (c) =>           // 幂等:同 key 重试返回原单
      createOrder(c, principal, { id, productId: p.id, amountCents: p.amountCents, units: p.units, idempotencyKey }));
    return { orderId, amountCents: p.amountCents, status: 'created' };
  }

  async payCallback(principal: string, id: string, body: { providerTxn?: string; sig?: string }) {
    if (!body?.providerTxn || !body?.sig) throw new HttpException({ error: 'invalid_callback' }, HttpStatus.BAD_REQUEST);
    const secret = process.env.PAY_PROVIDER_SECRET ?? '';
    const exp = createHmac('sha256', secret).update(`${id}:${body.providerTxn}:paid`).digest('hex');
    const a = Buffer.from(body.sig), e = Buffer.from(exp);
    if (!secret || a.length !== e.length || !timingSafeEqual(a, e)) throw new HttpException({ error: 'bad_signature' }, HttpStatus.FORBIDDEN);
    const res = await this.db.asPrincipal(principal, (c) => markOrderPaidAndCredit(c, principal, id, body.providerTxn!));
    if (res === 'not_found') throw new HttpException({ error: 'order_not_found' }, HttpStatus.NOT_FOUND);
    if (res === 'conflict') throw new HttpException({ error: 'order_conflict' }, HttpStatus.CONFLICT);
    return { result: res };   // credited(首次) | already(幂等重复)
  }

  /**
   * 真异步支付 webhook(修审计 F4):**无登录态**(PSP 服务端调,无 user session)。
   * 安全模型:HMAC 绑定订单 id + txn(密钥缺失 fail-closed)→ 验签过才认;owner **从 DB 查**(特权 pool 绕 RLS,不信调用方)→ 以该 owner 入账。
   * 入账复用同一 exactly-once CAS(markOrderPaidAndCredit),重复回调幂等不双入。
   */
  async payWebhook(id: string, body: { providerTxn?: string; sig?: string }) {
    if (!body?.providerTxn || !body?.sig) throw new HttpException({ error: 'invalid_callback' }, HttpStatus.BAD_REQUEST);
    const secret = process.env.PAY_PROVIDER_SECRET ?? '';
    const exp = createHmac('sha256', secret).update(`${id}:${body.providerTxn}:paid`).digest('hex');
    const a = Buffer.from(body.sig), e = Buffer.from(exp);
    if (!secret || a.length !== e.length || !timingSafeEqual(a, e)) throw new HttpException({ error: 'bad_signature' }, HttpStatus.FORBIDDEN);
    const owner = await this.db.pool.query('SELECT owner_user_id FROM payment_order WHERE id=$1', [id]).then((r: any) => r.rows[0]?.owner_user_id);
    if (!owner) throw new HttpException({ error: 'order_not_found' }, HttpStatus.NOT_FOUND);   // 查不到单(签名再对也不入账)
    const res = await this.db.asPrincipal(owner, (c) => markOrderPaidAndCredit(c, owner, id, body.providerTxn!));
    if (res === 'not_found') throw new HttpException({ error: 'order_not_found' }, HttpStatus.NOT_FOUND);
    if (res === 'conflict') throw new HttpException({ error: 'order_conflict' }, HttpStatus.CONFLICT);
    return { result: res };
  }

  async getOrder(principal: string, id: string) {
    const o = await this.db.asPrincipal(principal, (c) => getOrder(c, principal, id));
    if (!o) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return o;
  }

  async entitlement(principal: string) {
    const u = await this.db.asPrincipal(principal, (c) => availableUnits(c, principal));
    return { availableUnits: u };
  }
}
