import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createOrder, getOrder, markOrderPaidAndCredit, markOrderRefunded, availableUnits, listLedger, requireOwnerUserId, newEntityId, errCode, asErr, type Client, type CreditBucketKind } from '@meetwise/db';
import { DbService } from '../../platform/db.service';

/**
 * 交易应用服务(拥有 asPrincipal 事务边界 + 业务编排)。controller 只解析/校验/映射 HTTP,不碰 SQL(修审计 F1)。
 * 承重:回调**幂等 exactly-once 入账**(CAS,重复回调不双扣不双入)+ HMAC 验签(密钥缺失 fail-closed)。
 * AUTHZ-HARDEN 5A-2 #100:三回调验签收敛于单源 `verifyCommerceSig`(含 ts 时间戳防重放窗);
 * 旧「pay-callback 经 principal 登录可调」面撤除——回调面统一纯签名访问,owner 由网关函数解析
 * (payCallback 方法已并入 payWebhook 同管道;账务 CAS/exactly-once 语义零触)。
 */
export type ProductDomain = 'consumer' | 'enterprise';
/** 回调签名载荷:`${id}:${providerTxn}:${kind}:${ts}`(ts=签名毫秒时刻;|now-ts|>窗即 400 防重放)。 */
export const PAY_SIG_REPLAY_WINDOW_SECONDS = 300;

export type CommerceCallbackBody = { providerTxn?: string; sig?: string; ts?: number };

/**
 * #100 HMAC 验签单源(原 :87/:105/:135 三份复制块收敛于此):
 *  - 缺 providerTxn/sig/ts 或 ts 非有限数或超 ±窗 → 400 invalid_callback(结构性拒·fail-closed);
 *  - 密钥缺失或签名不等长/不等 → 403 bad_signature(恒时序比较);
 *  - kind 入签(paid/refunded 对偶标签不可互换),签名与订单 id 绑定不弱化。
 * 隐私面零关:privacy.service preview digest 为异用途,不经此函数(席1 边界·零触)。
 */
export function verifyCommerceSig(id: string, body: CommerceCallbackBody, kind: 'paid' | 'refunded'): void {
  if (!body?.providerTxn || !body?.sig) throw new HttpException({ error: 'invalid_callback' }, HttpStatus.BAD_REQUEST);
  const ts = body.ts;
  if (typeof ts !== 'number' || !Number.isFinite(ts) || Math.abs(Date.now() - ts) > PAY_SIG_REPLAY_WINDOW_SECONDS * 1000) {
    throw new HttpException({ error: 'invalid_callback' }, HttpStatus.BAD_REQUEST);
  }
  const secret = process.env.PAY_PROVIDER_SECRET ?? '';
  const exp = createHmac('sha256', secret).update(`${id}:${body.providerTxn}:${kind}:${ts}`).digest('hex');
  const a = Buffer.from(body.sig), e = Buffer.from(exp);
  if (!secret || a.length !== e.length || !timingSafeEqual(a, e)) throw new HttpException({ error: 'bad_signature' }, HttpStatus.FORBIDDEN);
}
export const PRODUCTS: Array<{ id: string; name: string; amountCents: number; units: number; domain: ProductDomain }> = [
  { id: 'pack_10', name: '10 次面试包', amountCents: 9900, units: 10, domain: 'consumer' },
  { id: 'pack_30', name: '30 次面试包', amountCents: 24900, units: 30, domain: 'consumer' },
  // B271 #271 片1 企业商品（audit①「开放企业商品」）：下单人须 approved recruiter（gateway_require_active_recruiter·
  // 0155 同门）；enterprise 域入账落位 kind='enterprise'（下单招聘方企业桶·非个人池）。
  { id: 'ent_pack_50', name: '企业充值 50 次面试', amountCents: 39900, units: 50, domain: 'enterprise' },
  { id: 'ent_pack_200', name: '企业充值 200 次面试', amountCents: 149900, units: 200, domain: 'enterprise' },
];

@Injectable()
export class CommerceService {
  /** B271 片1：approved recruiter 门（0155 同谓词·app_role 可执行形）。gateway_require_active_recruiter()
   * 已被 0155 REVOKE 自 app_role（23_api_gateway.sql:418）——app_role 会话内直调必 42501 insufficient_privilege
   * （EXEC attempt4 实测），不可作服务端门调用形。此处按该门**同谓词**在调用方 RLS 自身行作用域内校验
   * （勘误①更正·B271 片3 P6·机制描述事实更正非翻案：user_account p_user_account_self FORCE RLS 在位且生效——0041:14-20 ENABLE/FORCE+策略·镜像 09_auth.sql:23-27·asPrincipal `SET LOCAL ROLE app_role` principal.ts:949·表级 GRANT 0001:372 再证可达·自初档 d9394e91 在位；
   * 门判定=RLS 自身行可见性 × 本显式三键谓词双重收窄·与 0155 等价·fail-closed 同义：candidate/pending/rejected 自行零行 → 403 不变）。DB 侧 gateway_active_candidate 等 DEFINER 门仍持纵深（B 端端点面），双层不弱。 */
  private static readonly APPROVED_RECRUITER_SQL =
    "SELECT 1 AS ok FROM user_account WHERE id = current_setting('app.principal_user', true) " +
    "AND role='recruiter' AND status='active' AND approval_status='approved'";

  constructor(private readonly db: DbService) {}

  // 公开目录=**C 端域子集**（B271 片1·前席发现②兼容收口）：C 端契约「恰 2 个面试包」逐字节不变
  // （neg-commerce:389 / api validate:448 / openapi 公开面零弱化）；企业商品经独立端点 enterpriseProducts
  // （approved recruiter 门·上方 requireApprovedRecruiter 同门）对招聘方开放。
  products() {
    return { products: PRODUCTS.filter((p) => p.domain === 'consumer') };
  }

  async enterpriseProducts(principal: string) {
    await this.requireApprovedRecruiter(principal);
    return { products: PRODUCTS.filter((p) => p.domain === 'enterprise') };
  }

  async createOrder(principal: string, dto: { productId?: string; channel?: 'online' | 'offline' }, idempotencyKey?: string) {
    const p = PRODUCTS.find((x) => x.id === dto?.productId);
    if (!p) throw new HttpException({ error: 'unknown_product' }, HttpStatus.BAD_REQUEST);
    const offline = p.domain === 'enterprise' && dto?.channel === 'offline';
    const id = newEntityId('ord');
    let orderId: string;
    try {
      orderId = await this.db.asPrincipal(principal, async (c) => {        // 幂等:同 key 同参重试返回原单
        // B271 片1:企业商品下单人须 approved recruiter(0155 同谓词·RLS 自身行·403);C 端商品零触。
        if (p.domain === 'enterprise') {
          const gate = await c.query(CommerceService.APPROVED_RECRUITER_SQL);
          if (gate.rowCount !== 1) throw new HttpException({ error: 'recruiter_required' }, HttpStatus.FORBIDDEN);
        }
        const oid = await createOrder(c, principal, { id, productId: p.id, amountCents: p.amountCents, units: p.units, idempotencyKey });
        // 对公单停 created(channel='offline'·审计①「对公转账订单停 created」):不经 webhook 推进,
        // 由 admin 录入银行流水+人工确认入账。幂等重放(同 key)重复置 offline 收敛同值。
        if (offline) await c.query("UPDATE payment_order SET channel='offline' WHERE id=$1 AND status='created'", [oid]);
        return oid;
      });
    } catch (e: unknown) {
      if (e instanceof HttpException) throw e;
      if (errCode(e) === 'idempotency_key_conflict') throw new HttpException({ error: 'idempotency_key_conflict' }, HttpStatus.CONFLICT);   // 同 key 换商品 → 409(不静默吞)
      throw e;
    }
    return { orderId, amountCents: p.amountCents, status: 'created', channel: offline ? 'offline' : 'online' };
  }

  /**
   * B271 片1(S1-C3):入账落桶类型由订单商品域派生——enterprise 域 → 企业桶(kind='enterprise',
   * owner=下单招聘方);consumer 域 → C 端语义零触(credit 缺省 'paid'·refund 不带桶过滤)。
   * 同事务内读本人订单派生,不引入跨域读;CAS/幂等/HMAC 链零改。
   */
  private async bucketForOrder(c: Client, owner: string, id: string): Promise<{ kind: CreditBucketKind } | undefined> {
    const o = await getOrder(c, owner, id);
    if (!o) return undefined;
    return PRODUCTS.find((p) => p.id === o.productId)?.domain === 'enterprise' ? { kind: 'enterprise' } : undefined;
  }

  /**
   * 真异步支付 webhook(修审计 F4):**无登录态**(PSP 服务端调,无 user session)。
   * 安全模型:HMAC 绑定订单 id + txn + kind + ts(密钥缺失 fail-closed)→ 验签过才认;owner 从无表权限
   * 网关的固定函数读取(不信调用方)→ 以该 owner 入账。#100 收权:pay-callback 登录面撤除后,本方法即
   * 回调支付唯一管道(orders/:id/pay-callback 端点同委托于此)。
   * 入账复用同一 exactly-once CAS(markOrderPaidAndCredit),重复回调幂等不双入。
   */
  async payWebhook(id: string, body: CommerceCallbackBody) {
    verifyCommerceSig(id, body, 'paid');
    const resolved = await this.db.asGateway((c) => c.query(
      'SELECT gateway_payment_order_owner($1) AS owner_user_id', [id],
    )).then((r: any) => r.rows[0]?.owner_user_id);
    // PRIV01-C 第二层 E1:gateway fn 解析出的 owner 显式校验(fail-closed;缺失/空 → 404 不可区分,沿原守卫语义)。
    let owner: string;
    try {
      owner = requireOwnerUserId(resolved, 'commerce.payWebhook.owner');
    } catch {
      throw new HttpException({ error: 'order_not_found' }, HttpStatus.NOT_FOUND);
    }
    const res = await this.db.asPrincipal(owner, async (c) =>
      markOrderPaidAndCredit(c, owner, id, body.providerTxn!, (await this.bucketForOrder(c, owner, id)) ?? { kind: 'paid' }));
    if (res === 'not_found') throw new HttpException({ error: 'order_not_found' }, HttpStatus.NOT_FOUND);
    if (res === 'conflict') throw new HttpException({ error: 'order_conflict' }, HttpStatus.CONFLICT);
    return { result: res };
  }


  /**
   * 退款 webhook（GAP-UC011-REFUND-CALLBACK Path A）：无登录态 + HMAC fail-closed。
   * 载荷标签用 `refunded`（对偶 pay 的 `paid`）；回调体仅 {providerTxn, sig, ts}——无金额通道（DISCLOSED）。
   * 具名码对齐 payWebhook：400 invalid_callback · 403 bad_signature · 404 order_not_found · 409 order_conflict ·
   * 200 {result: refunded|already}。Ban any-non-404-4xx-as-sig-evidence。
   */
  async refundWebhook(id: string, body: CommerceCallbackBody) {
    verifyCommerceSig(id, body, 'refunded');
    const resolved = await this.db.asGateway((c) => c.query(
      'SELECT gateway_payment_order_owner($1) AS owner_user_id', [id],
    )).then((r: any) => r.rows[0]?.owner_user_id);
    // PRIV01-C 第二层 E1:同 payWebhook(缺失/空 → 404 不可区分)。
    let owner: string;
    try {
      owner = requireOwnerUserId(resolved, 'commerce.refundWebhook.owner');
    } catch {
      throw new HttpException({ error: 'order_not_found' }, HttpStatus.NOT_FOUND);
    }
    const res = await this.db.asPrincipal(owner, async (c) =>
      markOrderRefunded(c, owner, id, body.providerTxn!, await this.bucketForOrder(c, owner, id)));
    if (res === 'not_found') throw new HttpException({ error: 'order_not_found' }, HttpStatus.NOT_FOUND);
    if (res === 'conflict') throw new HttpException({ error: 'order_conflict' }, HttpStatus.CONFLICT);
    return { result: res };   // refunded(首次) | already(幂等重放)
  }

  async getOrder(principal: string, id: string) {
    const o = await this.db.asPrincipal(principal, (c) => getOrder(c, principal, id));
    if (!o) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    return o;
  }

  async entitlement(principal: string) {
    // B271 片3 P3（裁定②）：一次调用双算恒并列——availableUnits=全桶和（缺省路径 C 端逐值不变）+
    // enterpriseAvailableUnits=企业桶和（kind 形参·零 query 入参分叉·响应形状只增不改）。
    const u = await this.db.asPrincipal(principal, async (c) => ({
      all: await availableUnits(c, principal),
      enterprise: await availableUnits(c, principal, 'enterprise'),
    }));
    return { availableUnits: u.all, enterpriseAvailableUnits: u.enterprise };
  }

  // ── B271 片3 P4：本人订单列表（RLS p_owner 仅本人·零迁移·开票下拉数据源·只读 LIMIT 50 窗口）──
  async listMyOrders(principal: string) {
    const r = await this.db.asPrincipal(principal, (c) =>
      c.query('SELECT id, product_id, amount_cents, units, status, channel, created_at FROM payment_order WHERE owner_user_id=$1 ORDER BY created_at DESC LIMIT 50', [principal]));
    return { orders: r.rows };
  }

  // ── B271 片3 P2：本人对公订单台账（approved recruiter 门复用 + 0159 受控 DEFINER 读函数·本人行作用域）──
  // offline_remit_record 全库零 GRANT（0156:80-83 纪律）→ 招聘方 principal 物理不可直读，entered 态只能
  // 经 0159 函数（SECURITY DEFINER·WHERE owner_user_id=current_setting('app.principal_user',true)·Ban 无作用域全表读）。
  async listMyOfflineOrders(principal: string) {
    await this.requireApprovedRecruiter(principal);
    const r = await this.db.asPrincipal(principal, (c) =>
      c.query('SELECT order_id, product_id, amount_cents, order_status, remit_status, entered_at, confirmed_at, created_at FROM gateway_entpay_my_offline_orders()'));
    return { orders: r.rows };
  }

  // ── 积分明细列表（billing-redesign §3.13 升 P1 面·additive 只读·零写面零结算语义变更）──
  // C 端本人逐笔：三真账 UNION RLS 直读（零 DEFINER 零特权·p_owner FORCE 兜底）+ keyset 值基三段
  // 复合游标。分页头余额=读时快照非实时余额承诺（多桶 FIFO 下可用额≠Σ账本差·逐笔行不带余额），
  // 同事务内与明细同拍读出（availableUnits 只读余额读函数·扣费路径零触）。
  async listMyLedger(principal: string, opts: { cursor?: string | null; windowDays?: number }) {
    return this.db.asPrincipal(principal, async (c) => {
      const page = await listLedger(c, principal, { cursor: opts.cursor ?? null, windowDays: opts.windowDays });
      const bal = await availableUnits(c, principal);
      return { ...page, availableUnits: bal };
    });
  }

  // B 端企业维度逐笔：approved recruiter 门先行 + 0185 受控 DEFINER 读函数经 asPrincipal(recruiter)
  // （调用母形=listMyOfflineOrders 同款）。零 payer 形参——伪造 payer 入口在 API query 层即被函数内
  // payer_user_id=current_setting 硬谓词遮蔽。分页头余额=企业桶读时快照（entitlement 双算口径）。
  async listEnterpriseLedger(principal: string) {
    await this.requireApprovedRecruiter(principal);
    return this.db.asPrincipal(principal, async (c) => {
      const r = await c.query(
        'SELECT created_at, service_type, units_requested::float8 AS units_requested, units_settled::float8 AS units_settled, status, payer_user_id, idempotency_key FROM gateway_billing_ledger_payer()');
      const enterpriseAvailableUnits = await availableUnits(c, principal, 'enterprise');
      return { entries: r.rows, enterpriseAvailableUnits };
    });
  }

  // ── B271 片1 开票面（audit①「企业开票资料 RLS 仅招聘方本人可读写 + 开票申请仅 paid 订单」）──
  // 读写全在 RLS p_owner 之下（本人）；写面再加 approved recruiter 门；仅-paid 门在 DB 触发器
  // （invoice_request_order_not_paid·0156/11_commerce 镜像）——端点+触发器双层，禁半开门。

  async getInvoiceProfile(principal: string) {
    const r = await this.db.asPrincipal(principal, (c) =>
      c.query('SELECT title, tax_id, address_phone, bank_account, email, updated_at FROM invoice_profile WHERE owner_user_id=$1', [principal]));
    return { profile: r.rows[0] ?? null };
  }

  async saveInvoiceProfile(principal: string, b: { title: string; taxId: string; addressPhone?: string; bankAccount?: string; email: string }) {
    await this.requireApprovedRecruiter(principal);
    await this.db.asPrincipal(principal, (c) =>
      c.query(
        `INSERT INTO invoice_profile(owner_user_id, title, tax_id, address_phone, bank_account, email, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6, now())
         ON CONFLICT (owner_user_id) DO UPDATE SET
           title=$2, tax_id=$3, address_phone=$4, bank_account=$5, email=$6, updated_at=now()`,
        [principal, b.title, b.taxId, b.addressPhone ?? null, b.bankAccount ?? null, b.email]));
    return { saved: true };
  }

  async listInvoiceRequests(principal: string) {
    const r = await this.db.asPrincipal(principal, (c) =>
      c.query('SELECT id, order_id, status, invoice_no, reject_reason, requested_at FROM invoice_request WHERE owner_user_id=$1 ORDER BY requested_at DESC LIMIT 50', [principal]));
    return { requests: r.rows };
  }

  async submitInvoiceRequest(principal: string, orderId: string) {
    await this.requireApprovedRecruiter(principal);
    try {
      const r = await this.db.asPrincipal(principal, (c) =>
        c.query(
          'INSERT INTO invoice_request(order_id, owner_user_id) VALUES ($1,$2) RETURNING id, order_id, status, requested_at',
          [orderId, principal]));
      return { request: r.rows[0] };
    } catch (e: unknown) {
      const msg = asErr(e)?.message;
      if (msg === 'invoice_request_order_not_paid' || msg === 'invoice_request_order_not_found')
        throw new HttpException({ error: 'invoice_request_order_not_paid' }, HttpStatus.CONFLICT);   // 负例面:created/refunded/他人单 → 409(不区分存在性)
      if (msg === 'invoice_request_owner_mismatch')
        throw new HttpException({ error: 'invoice_request_order_not_paid' }, HttpStatus.CONFLICT);
      if (errCode(e) === '23505') throw new HttpException({ error: 'invoice_request_duplicate' }, HttpStatus.CONFLICT);   // 一单至多一张票
      throw e;
    }
  }

  private async requireApprovedRecruiter(principal: string) {
    await this.db.asPrincipal(principal, async (c) => {
      const gate = await c.query(CommerceService.APPROVED_RECRUITER_SQL);
      if (gate.rowCount !== 1) throw new HttpException({ error: 'recruiter_required' }, HttpStatus.FORBIDDEN);
    });
  }
}
