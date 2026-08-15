import { randomUUID } from 'node:crypto';
import { boot, mkAssert, tokenFor, paySig, PAY_SECRET } from './_neg-harness';

/**
 * neg:commerce — 订单/支付/额度/webhook 域**纯负路径**证明(一条 happy-path 断言都没有)。
 * 每条断言目标都是:拒绝 / 失败 / 越权 / 重放 / 重复扣费 / 超卖 / 幂等冲突 / 签名伪造 / 额度不足 / 过期 / 并发竞态 / 篡改被忽略。
 *
 * 事实基线(读真实代码得出,断言即据此):
 *  - 路由无全局前缀:/commerce/orders、/commerce/orders/:id/pay-callback、/commerce/orders/:id、
 *    /commerce/entitlement（PrincipalGuard）、/commerce/products（公开、可 CDN 缓存）、/commerce/webhook/pay/:id（**无登录态**）。
 *  - 下单契约 CreateOrderDto = { productId: string }。**无 amount/units 字段** → 金额/单位由服务器 PRODUCTS 权威派生,
 *    客户端注入的 amount/units 被 zod strip 掉(篡改天然无效)。PRODUCTS: pack_10=9900¢/10u, pack_30=24900¢/30u。
 *  - 回调/webhook 签名 = HMAC-sha256(`${orderId}:${providerTxn}:paid`, PAY_SECRET) 的 hex;缺字段→400 invalid_callback,
 *    长度不符/内容不符→403 bad_signature(timingSafeEqual,fail-closed)。
 *  - markOrderPaidAndCredit:CAS created→paid 只第一次成功(credited);重复同单同流水→already(不双入);
 *    非本人/不存在→not_found(404);已 paid 但流水不符→conflict(409)。
 *  - 额度消费经 interview begin:reserveEntitlement 不足则**抛** → service catch 映射 402 insufficient_entitlement。
 *  - zod 校验失败→400 {error:'invalid',issues}。异常过滤:pg 23505→409 {error:'conflict'};未知→500 internal_error。
 *  - 传输层:非上传路由 content-length>1MB → onRequest 直接 413 payload_too_large(body parse 之前)。
 */

const money = (o: any) => o?.amountCents;

(async () => {
  const h = await boot();
  const { A, done } = mkAssert('neg:commerce');
  const pool = h.pool;

  // ── 隔离 fixtures(固定种子不动;所有 mutation/并发用例用独立 owner/订单,可精确断言增量)──
  await pool.query(
    "INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status) VALUES " +
    "('ORD_RPL','negRepl','pack_10',9900,10,'created')," +      // 顺序重放双结算
    "('ORD_CC','negCC','pack_10',9900,10,'created')," +         // 并发双 webhook
    "('ORD_PCC','negPCC','pack_10',9900,10,'created')," +       // 并发双 pay-callback(principal)
    "('ORD_SPOOF','negSpoof','pack_10',9900,10,'created')," +   // body 里塞 owner 冒充(应被忽略,入账真 owner)
    "('ORD_TX_A','negTxnA','pack_10',9900,10,'created')," +     // 跨订单复用同 providerTxn
    "('ORD_TX_B','negTxnB','pack_10',9900,10,'created')," +
    "('ORD_AMT','negAmt','pack_10',9900,10,'created')");        // 备用
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('negExp','paid',5.0, now()-interval '1 day')");   // 过期额度
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('IV_EXP','negExp','created')");
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('negOsell','paid',1.0, now()+interval '30 days')");  // 共享池仅 1.0
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('IV_OS1','negOsell','created'),('IV_OS2','negOsell','created')");
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('negDbl','paid',5.0, now()+interval '30 days')");
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('IV_DBL','negDbl','created')");

  // ── 小工具(经特权 pool 直查,验证 DB 侧不变量;pool 绕 RLS)──
  const nOrders = async (owner: string, key: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM payment_order WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key])).rows[0].n);
  const nBuckets = async (owner: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].n);
  const sumTotal = async (owner: string) =>
    Number((await pool.query('SELECT COALESCE(SUM(units_total),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].s);
  const sumReserved = async (owner: string) =>
    Number((await pool.query('SELECT COALESCE(SUM(units_reserved),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].s);
  const ordAmt = async (id: string) =>
    Number((await pool.query('SELECT amount_cents FROM payment_order WHERE id=$1', [id])).rows[0]?.amount_cents);
  const sig = (orderId: string, txn: string) => paySig(`${orderId}:${txn}:paid`);
  const goodBody = (orderId: string, txn: string) => ({ providerTxn: txn, sig: sig(orderId, txn) });
  const U = h.U;

  // ════════════════════════════════════════════════════════════════════════
  // 1. 下单(POST /commerce/orders):鉴权、畸形、未知品、缺字段、篡改被忽略
  // ════════════════════════════════════════════════════════════════════════
  {
    // 未鉴权(无 x-user-id / 无 Bearer)→ 401
    const r = await h.post('/commerce/orders', {}, { productId: 'pack_10' });
    A('create/unauth → 401 unauthenticated', r.status === 401 && r.body?.error === 'unauthenticated');
  }
  {
    // 坏 Bearer → 401 invalid_token(验签失败,fail-closed)
    const r = await h.post('/commerce/orders', { authorization: 'Bearer not.a.real.token' }, { productId: 'pack_10' });
    A('create/bad-bearer → 401 invalid_token', r.status === 401 && r.body?.error === 'invalid_token');
  }
  {
    // dev 头冒充系统保留主体 __system* → 401 reserved_principal(qbank 投毒门)
    const r = await h.post('/commerce/orders', U('__system_qbank__'), { productId: 'pack_10' });
    A('create/reserved-principal → 401', r.status === 401 && r.body?.error === 'reserved_principal');
  }
  {
    // 缺 productId → zod 400 invalid
    const r = await h.post('/commerce/orders', U('userA'), {});
    A('create/missing productId → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    // productId 类型错(number)→ zod 400 invalid
    const r = await h.post('/commerce/orders', U('userA'), { productId: 123 });
    A('create/productId wrong type → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    // body 为 null → zod 400
    const r = await h.send('POST', '/commerce/orders', U('userA'), 'null');
    A('create/null body → 400', r.status === 400);
  }
  {
    // 未知 product_id → 400 unknown_product
    const r = await h.post('/commerce/orders', U('userA'), { productId: 'pack_999' });
    A('create/unknown product → 400 unknown_product', r.status === 400 && r.body?.error === 'unknown_product');
  }
  {
    // 空字符串 productId → 未知品 400
    const r = await h.post('/commerce/orders', U('userA'), { productId: '' });
    A('create/empty productId → 400 unknown_product', r.status === 400 && r.body?.error === 'unknown_product');
  }
  {
    // 畸形 JSON(content-type: application/json 但正文非法)→ 400(Fastify parser 前置拒)
    const r = await h.raw('POST', '/commerce/orders', { 'content-type': 'application/json', 'x-user-id': 'userA' }, '{ this is : not json ');
    A('create/malformed json → 4xx', r.status >= 400 && r.status < 500);
  }
  {
    // content-type text/plain(非 JSON)→ body 不解析 → zod 拒 400
    const r = await h.raw('POST', '/commerce/orders', { 'content-type': 'text/plain', 'x-user-id': 'userA' }, '{"productId":"pack_10"}');
    A('create/non-json content-type → 4xx', r.status >= 400 && r.status < 500);
  }
  {
    // 超大 body(>1MB,非上传路由)→ 传输层 413(body parse 之前)
    const big = '{"productId":"' + 'x'.repeat(1_100_000) + '"}';
    const r = await h.raw('POST', '/commerce/orders', { 'content-type': 'application/json', 'x-user-id': 'userA' }, big);
    A('create/oversized body → 413 payload_too_large', r.status === 413);
  }
  {
    // 客户端篡改金额(amountCents=1)→ 被 zod strip,服务器仍按 pack_10=9900 权威定价
    const r = await h.post('/commerce/orders', U('userA'), { productId: 'pack_10', amountCents: 1 });
    A('create/tamper amountCents → 服务器价 9900(篡改无效)', r.status === 200 && money(r.body) === 9900);
    if (r.body?.orderId) A('create/tamper amountCents → 落库金额仍 9900', (await ordAmt(r.body.orderId)) === 9900);
  }
  {
    // 篡改单位(units 巨大 + amount 负)→ 全部忽略,按产品定价
    const r = await h.post('/commerce/orders', U('userA'), { productId: 'pack_10', units: 999999, amount: -500, amountCents: -500 });
    A('create/tamper units+amount → 忽略,价 9900', r.status === 200 && money(r.body) === 9900);
  }
  {
    // 单位为 0 / 负数的注入尝试 → 无该字段,定价不受影响(pack_30 权威 24900)
    const r = await h.post('/commerce/orders', U('userA'), { productId: 'pack_30', units: 0 });
    A('create/inject units=0 → pack_30 权威 24900', r.status === 200 && money(r.body) === 24900);
    const r2 = await h.post('/commerce/orders', U('userA'), { productId: 'pack_30', units: -1 });
    A('create/inject units=-1 → pack_30 权威 24900', r2.status === 200 && money(r2.body) === 24900);
  }

  // ── 幂等键正确性(不产生第二条订单)──
  {
    const K = 'idem-' + randomUUID();
    const r1 = await h.post('/commerce/orders', { ...U('userA'), 'idempotency-key': K }, { productId: 'pack_10' });
    // 已修:同 key + 不同 body(pack_30)= 语义冲突 → **409 idempotency_key_conflict**(绝不静默返回原单 pack_10 掩盖用户真实意图)。
    const r2 = await h.post('/commerce/orders', { ...U('userA'), 'idempotency-key': K }, { productId: 'pack_30' });
    A('create/idem 同key不同body → 409 idempotency_key_conflict(不静默吞篡改品)', r2.status === 409 && r2.body?.error === 'idempotency_key_conflict');
    A('create/idem 同key不同body → 不产生第二条订单(冲突前抛,原单不变)', (await nOrders('userA', K)) === 1);
    // 同 key + 同 body → 同一单,仍不新建
    const r3 = await h.post('/commerce/orders', { ...U('userA'), 'idempotency-key': K }, { productId: 'pack_10' });
    A('create/idem 同key同body → 仍只 1 条订单', (await nOrders('userA', K)) === 1 && r3.body?.orderId === r1.body?.orderId);
  }
  {
    // 并发同一 idempotency-key 下单 → ON CONFLICT + 回读：所有重试都拿到**同一个** orderId，
    // 不把正常网络重试暴露为 23505/409。
    const K = 'race-' + randomUUID();
    const owner = 'negRaceCreate';
    const hdr = { ...U(owner), 'idempotency-key': K };
    const rs = await Promise.all([
      h.post('/commerce/orders', hdr, { productId: 'pack_10' }),
      h.post('/commerce/orders', hdr, { productId: 'pack_10' }),
      h.post('/commerce/orders', hdr, { productId: 'pack_10' }),
    ]);
    A('create/并发同key → DB 只落 1 条订单(不重复建)', (await nOrders(owner, K)) === 1);
    A('create/并发同key → 3 个调用均 200（重放不是冲突）', rs.every((r) => r.status === 200));
    const ids = new Set(rs.map((r) => r.body?.orderId));
    A('create/并发同key → 3 个响应严格同一 orderId', ids.size === 1 && !ids.has(undefined));
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. 订单查询(GET /commerce/orders/:id、/entitlement、/products):越权、不存在、未鉴权
  // ════════════════════════════════════════════════════════════════════════
  {
    // userB 查 userA 的 ORD_A → RLS 隐藏 → 404 not_found(不泄他人订单存在)
    const r = await h.req('GET', '/commerce/orders/ORD_A', U('userB'));
    A('query/越权他人订单 → 404 not_found', r.status === 404 && r.body?.error === 'not_found');
  }
  {
    // token 版越权:userB 令牌读 ORD_A → 404
    const r = await h.req('GET', '/commerce/orders/ORD_A', { authorization: `Bearer ${tokenFor('userB')}` });
    A('query/越权(token) → 404', r.status === 404);
  }
  {
    // 查不存在订单 → 404
    const r = await h.req('GET', '/commerce/orders/ORD_DOES_NOT_EXIST', U('userA'));
    A('query/不存在订单 → 404 not_found', r.status === 404 && r.body?.error === 'not_found');
  }
  {
    // 未鉴权查订单 → 401
    const r = await h.req('GET', '/commerce/orders/ORD_A', {});
    A('query/未鉴权订单 → 401', r.status === 401 && r.body?.error === 'unauthenticated');
  }
  {
    // 未鉴权查额度 → 401(entitlement 也在 guard 后)
    const r = await h.req('GET', '/commerce/entitlement', {});
    A('query/未鉴权额度 → 401', r.status === 401);
  }
  {
    // 商品目录是合同中明确的公开静态读接口；不可被控制器级 guard 意外遮蔽。
    const r = await h.req('GET', '/commerce/products', {});
    A('query/未鉴权 products → 200(公开目录与 OpenAPI 对齐)', r.status === 200 && Array.isArray(r.body?.products) && r.body.products.length === 2);
  }

  // ════════════════════════════════════════════════════════════════════════
  // 3. 支付回调(POST /commerce/orders/:id/pay-callback,过 principal):缺签/伪签/越权/冲突
  // ════════════════════════════════════════════════════════════════════════
  const PAY = (id: string) => `/commerce/orders/${id}/pay-callback`;
  {
    const r = await h.post(PAY('ORD_A'), U('userA'), {});
    A('pay/缺 providerTxn+sig → 400 invalid_callback', r.status === 400 && r.body?.error === 'invalid_callback');
  }
  {
    const r = await h.post(PAY('ORD_A'), U('userA'), { providerTxn: 't1' });
    A('pay/缺 sig → 400 invalid_callback', r.status === 400 && r.body?.error === 'invalid_callback');
  }
  {
    const r = await h.post(PAY('ORD_A'), U('userA'), { sig: sig('ORD_A', 't1') });
    A('pay/缺 providerTxn → 400 invalid_callback', r.status === 400 && r.body?.error === 'invalid_callback');
  }
  {
    const r = await h.post(PAY('ORD_A'), U('userA'), { providerTxn: '', sig: sig('ORD_A', '') });
    A('pay/空 providerTxn → 400 invalid_callback', r.status === 400 && r.body?.error === 'invalid_callback');
  }
  {
    // 伪造签名(等长 hex 但内容错)→ 403 bad_signature
    const r = await h.post(PAY('ORD_A'), U('userA'), { providerTxn: 't1', sig: paySig('totally-different-string') });
    A('pay/伪签(等长)→ 403 bad_signature', r.status === 403 && r.body?.error === 'bad_signature');
  }
  {
    // 签名长度不符 → 403(a.length!==e.length 分支)
    const r = await h.post(PAY('ORD_A'), U('userA'), { providerTxn: 't1', sig: 'deadbeef' });
    A('pay/短签名 → 403 bad_signature', r.status === 403 && r.body?.error === 'bad_signature');
  }
  {
    // 用别的订单 id 算的签名打到 ORD_A(签名未绑定本单)→ 403
    const r = await h.post(PAY('ORD_A'), U('userA'), { providerTxn: 't1', sig: sig('ORD_OTHER', 't1') });
    A('pay/错单签名 → 403 bad_signature', r.status === 403 && r.body?.error === 'bad_signature');
  }
  {
    // 签名对 txnX 但 body 送 txnY(签名未绑定本流水)→ 403
    const r = await h.post(PAY('ORD_A'), U('userA'), { providerTxn: 'txnY', sig: sig('ORD_A', 'txnX') });
    A('pay/签名流水不符 → 403 bad_signature', r.status === 403 && r.body?.error === 'bad_signature');
  }
  {
    // 支付不存在的订单(签名正确)→ 404 order_not_found(签名再对,查不到单也不入账)
    const r = await h.post(PAY('ORD_NOPE'), U('userA'), goodBody('ORD_NOPE', 't1'));
    A('pay/不存在订单(合法签名)→ 404 order_not_found', r.status === 404 && r.body?.error === 'order_not_found');
  }
  {
    // 越权支付他人订单:userB 用**合法**签名支付 userA 的 ORD_A → RLS 令 CAS 命不中 → 404(不给他人入账)
    const before = await nBuckets('userA');
    const r = await h.post(PAY('ORD_A'), U('userB'), goodBody('ORD_A', 'txnHijack'));
    A('pay/越权他人订单(合法签名)→ 404 order_not_found', r.status === 404 && r.body?.error === 'order_not_found');
    A('pay/越权他人订单 → 不给受害者入账', (await nBuckets('userA')) === before);
  }
  {
    // 重复回调已 paid 的单(ORD_PAID 无存流水)→ 流水不符 → 409 order_conflict,不产生副作用
    const before = await nBuckets('userA');
    const r = await h.post(PAY('ORD_PAID'), U('userA'), goodBody('ORD_PAID', 'txnZ'));
    A('pay/已paid单再回调(流水不符)→ 409 order_conflict', r.status === 409 && r.body?.error === 'order_conflict');
    A('pay/已paid单再回调 → 不重复入账', (await nBuckets('userA')) === before);
  }
  {
    // 并发双回调(principal 路径)同单同流水 → exactly-once:桶只 +1,恰一个 credited,不双加
    const before = await nBuckets('negPCC');
    const body = goodBody('ORD_PCC', 'txnPCC');
    const rs = await Promise.all([
      h.post(PAY('ORD_PCC'), U('negPCC'), body),
      h.post(PAY('ORD_PCC'), U('negPCC'), body),
    ]);
    A('pay/并发双回调 → 都 200(无 5xx)', rs.every((r) => r.status === 200));
    const results = rs.map((r) => r.body?.result);
    A('pay/并发双回调 → 恰一个 credited(不双结算)', results.filter((x) => x === 'credited').length === 1);
    A('pay/并发双回调 → 桶只加 1 次(不超卖)', (await nBuckets('negPCC')) === before + 1);
    A('pay/并发双回调 → 入账额恰 10(单份)', (await sumTotal('negPCC')) === 10);
  }

  // ════════════════════════════════════════════════════════════════════════
  // 4. 异步 webhook(POST /commerce/webhook/pay/:id,**无登录态**):无鉴权仍 fail-closed + 重放/并发不双入
  // ════════════════════════════════════════════════════════════════════════
  const WH = (id: string) => `/commerce/webhook/pay/${id}`;
  {
    // 无登录态端点仍 fail-closed:缺签 → 400(不因免鉴权而放行)
    const r = await h.post(WH('ORD_RPL'), {}, { providerTxn: 't1' });
    A('webhook/缺 sig → 400 invalid_callback', r.status === 400 && r.body?.error === 'invalid_callback');
  }
  {
    // 伪签 → 403(免登录不等于免验签)
    const r = await h.post(WH('ORD_RPL'), {}, { providerTxn: 't1', sig: paySig('nope') });
    A('webhook/伪签 → 403 bad_signature', r.status === 403 && r.body?.error === 'bad_signature');
  }
  {
    // 短签名 → 403
    const r = await h.post(WH('ORD_RPL'), {}, { providerTxn: 't1', sig: 'ff' });
    A('webhook/短签名 → 403 bad_signature', r.status === 403 && r.body?.error === 'bad_signature');
  }
  {
    // 不存在订单(合法签名)→ 404 order_not_found(owner 从 DB 查,查不到不入账)
    const r = await h.post(WH('ORD_GHOST'), {}, goodBody('ORD_GHOST', 't1'));
    A('webhook/不存在订单 → 404 order_not_found', r.status === 404 && r.body?.error === 'order_not_found');
  }
  {
    // 错 content-type(text/plain)→ body 不解析 → 400 invalid_callback
    const r = await h.raw('POST', WH('ORD_RPL'), { 'content-type': 'text/plain' }, JSON.stringify(goodBody('ORD_RPL', 't1')));
    A('webhook/错 content-type → 400 invalid_callback', r.status === 400);
  }
  {
    // 超大 body(>1MB)→ 传输层 413(验签之前就拒,防放大 DoS)
    const big = JSON.stringify({ providerTxn: 't1', sig: sig('ORD_RPL', 't1'), pad: 'x'.repeat(1_100_000) });
    const r = await h.raw('POST', WH('ORD_RPL'), { 'content-type': 'application/json' }, big);
    A('webhook/超大 body → 413 payload_too_large', r.status === 413);
  }
  {
    // body 里塞 owner 冒充(想把额度记到攻击者名下)→ owner 只信 DB,忽略 body.owner;入账真 owner,攻击者 0 桶
    const r = await h.post(WH('ORD_SPOOF'), {}, { ...goodBody('ORD_SPOOF', 'txnSp'), owner: 'attacker', owner_user_id: 'attacker' });
    A('webhook/body 冒充 owner → 200 credited(仅按 DB owner)', r.status === 200 && r.body?.result === 'credited');
    A('webhook/body 冒充 owner → 攻击者 0 桶(冒充无效)', (await nBuckets('attacker')) === 0);
    A('webhook/body 冒充 owner → 真 owner 入账 1 桶', (await nBuckets('negSpoof')) === 1);
  }
  {
    // 顺序重放双结算:同单同流水打两次 → 第一 credited,第二 already,桶只加一次(不双入账)
    const t = 'txnRPL';
    const w1 = await h.post(WH('ORD_RPL'), {}, goodBody('ORD_RPL', t));
    const w2 = await h.post(WH('ORD_RPL'), {}, goodBody('ORD_RPL', t));
    A('webhook/重放 → 首次 credited', w1.status === 200 && w1.body?.result === 'credited');
    A('webhook/重放 → 二次 already(幂等,不双入)', w2.status === 200 && w2.body?.result === 'already');
    A('webhook/重放 → 桶只 1 个(不重复入账)', (await nBuckets('negRepl')) === 1);
    A('webhook/重放 → 入账额恰 10(单份)', (await sumTotal('negRepl')) === 10);
  }
  {
    // 已 paid 后换新流水回放(伪造二次收款)→ CAS 命不中且流水不符 → 409 order_conflict,不再入账
    const before = await nBuckets('negRepl');
    const r = await h.post(WH('ORD_RPL'), {}, goodBody('ORD_RPL', 'txnRPL-DIFFERENT'));
    A('webhook/已paid换流水回放 → 409 order_conflict', r.status === 409 && r.body?.error === 'order_conflict');
    A('webhook/已paid换流水回放 → 不再入账', (await nBuckets('negRepl')) === before);
  }
  {
    // 并发双 webhook 同单同流水 → exactly-once:恰一个 credited,桶只加一次(不超卖/不双加)
    const before = await nBuckets('negCC');
    const body = goodBody('ORD_CC', 'txnCC');
    const rs = await Promise.all([
      h.post(WH('ORD_CC'), {}, body),
      h.post(WH('ORD_CC'), {}, body),
    ]);
    A('webhook/并发双回调 → 都 200', rs.every((r) => r.status === 200));
    A('webhook/并发双回调 → 恰一个 credited', rs.map((r) => r.body?.result).filter((x) => x === 'credited').length === 1);
    A('webhook/并发双回调 → 桶只加 1(不双结算)', (await nBuckets('negCC')) === before + 1);
    A('webhook/并发双回调 → 入账额恰 10', (await sumTotal('negCC')) === 10);
  }
  {
    // P0：同一 PSP 流水被重放到**两张不同订单**。订单级 CAS 不够；必须由 provider_txn 全局唯一归属
    // 裁决。两个请求均验签正确，故第二个必须是可解释的 409，而不是第二次发放或 500。
    const txn = 'txn-CROSS-ORDER-ONCE';
    const rs = await Promise.all([
      h.post(WH('ORD_TX_A'), {}, goodBody('ORD_TX_A', txn)),
      h.post(WH('ORD_TX_B'), {}, goodBody('ORD_TX_B', txn)),
    ]);
    A('webhook/跨订单同 providerTxn → 恰一笔 200 credited', rs.filter((r) => r.status === 200 && r.body?.result === 'credited').length === 1);
    A('webhook/跨订单同 providerTxn → 另一笔 409 order_conflict（非 5xx）', rs.filter((r) => r.status === 409 && r.body?.error === 'order_conflict').length === 1);
    const txnRows = Number((await pool.query('SELECT count(*)::int n FROM payment_order WHERE provider_txn=$1', [txn])).rows[0].n);
    A('webhook/跨订单同 providerTxn → provider_txn 落库仅 1 行', txnRows === 1);
    A('webhook/跨订单同 providerTxn → 两个账户合计只发 10 单位', (await sumTotal('negTxnA')) + (await sumTotal('negTxnB')) === 10);
  }

  // ════════════════════════════════════════════════════════════════════════
  // 5. 额度消费(POST /interview/:id/begin → reserveEntitlement):不足/过期/越权/竞态超卖
  // ════════════════════════════════════════════════════════════════════════
  const BEGIN = (id: string) => `/interview/${id}/begin`;
  {
    // userB 无任何额度桶 → 消费触发 402。**必须从 created 态 begin**(IV_OTHER 是 active → begin 幂等短路不扣额)。
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('IV_UBC2','userB','created') ON CONFLICT DO NOTHING");
    const r = await h.post(BEGIN('IV_UBC2'), { ...U('userB'), 'resume-id': 'r1' }, {});
    A('consume/无额度 → 402 insufficient_entitlement', r.status === 402 && r.body?.error === 'insufficient_entitlement');
  }
  {
    // 额度已过期(expires_at < now)→ 可用池=0 → 402(过期额度不可用,不误当有效)
    const r = await h.post(BEGIN('IV_EXP'), { ...U('negExp'), 'resume-id': 'r1' }, {});
    A('consume/过期额度 → 402 insufficient_entitlement', r.status === 402 && r.body?.error === 'insufficient_entitlement');
  }
  {
    // 缺 resume-id 头 → 400 missing_resume_id(消费前置校验)
    const r = await h.post(BEGIN('IV_OTHER'), U('userB'), {});
    A('consume/缺 resume-id → 400 missing_resume_id', r.status === 400 && r.body?.error === 'missing_resume_id');
  }
  {
    // 越权对他人面试 begin(userB 打 userA 的 IV_ACT)→ RLS 隐藏 → 404,不扣他人额度
    const r = await h.post(BEGIN('IV_ACT'), { ...U('userB'), 'resume-id': 'r1' }, {});
    A('consume/越权他人面试 → 404 not_found_or_forbidden', r.status === 404 && r.body?.error === 'not_found_or_forbidden');
  }
  {
    // 未鉴权 begin → 401
    const r = await h.post(BEGIN('IV_ACT'), { 'resume-id': 'r1' }, {});
    A('consume/未鉴权 begin → 401', r.status === 401);
  }
  {
    // 并发竞态超卖:共享池仅 1.0,两场不同面试并发各扣 1.0 → 只能一场成功,另一场 402;预留永不超过 1.0
    const rs = await Promise.all([
      h.post(BEGIN('IV_OS1'), { ...U('negOsell'), 'resume-id': 'r1' }, {}),
      h.post(BEGIN('IV_OS2'), { ...U('negOsell'), 'resume-id': 'r1' }, {}),
    ]);
    const codes = rs.map((r) => r.status);
    A('consume/并发超卖 → 恰一场被 402 拒(不超卖)', codes.filter((c) => c === 402).length === 1);
    A('consume/并发超卖 → 预留额不超过池上限 1.0', (await sumReserved('negOsell')) <= 1.0);
    A('consume/并发超卖 → 被拒方返 insufficient_entitlement', rs.some((r) => r.status === 402 && r.body?.error === 'insufficient_entitlement'));
  }
  {
    // 并发重复 begin 同一面试(双击)→ advisory 锁 + 幂等:只预留一次,不双扣
    const rs = await Promise.all([
      h.post(BEGIN('IV_DBL'), { ...U('negDbl'), 'resume-id': 'r1' }, {}),
      h.post(BEGIN('IV_DBL'), { ...U('negDbl'), 'resume-id': 'r1' }, {}),
    ]);
    A('consume/并发同面试双击 → 无 5xx', rs.every((r) => r.status < 500));
    A('consume/并发同面试双击 → 只预留一次(不双扣,reserved==1.0)', (await sumReserved('negDbl')) === 1.0);
    const nConsume = Number((await pool.query(
      "SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id='negDbl' AND idempotency_key='IV_DBL'")).rows[0].n);
    A('consume/并发同面试双击 → 只 1 条 consumption(幂等)', nConsume === 1);
  }

  // ════════════════════════════════════════════════════════════════════════
  // 6. webhook 边角 + 回调其它畸形
  // ════════════════════════════════════════════════════════════════════════
  {
    // webhook 缺全部字段(空 body)→ 400
    const r = await h.post(WH('ORD_AMT'), {}, {});
    A('webhook/空 body → 400 invalid_callback', r.status === 400 && r.body?.error === 'invalid_callback');
  }
  {
    // pay-callback 空 body(过 principal)→ 400
    const r = await h.post(PAY('ORD_AMT'), U('negAmt'), {});
    A('pay/空 body → 400 invalid_callback', r.status === 400 && r.body?.error === 'invalid_callback');
  }
  {
    // webhook 用 GET(方法不允许)→ 404/405(路由只注册 POST)
    const r = await h.req('GET', WH('ORD_RPL'), {});
    A('webhook/错方法 GET → 4xx', r.status >= 400 && r.status < 500);
  }
  {
    // pay-callback 打到已被 spoof 测试入账过的真 owner 单(ORD_SPOOF 现为 paid)→ 越权他人(userA)仍 404
    const r = await h.post(PAY('ORD_SPOOF'), U('userA'), goodBody('ORD_SPOOF', 'txnSp'));
    A('pay/他人已paid单越权 → 404 order_not_found', r.status === 404 && r.body?.error === 'order_not_found');
  }

  // ── 统计 ──
  // 断言条数汇总(见文件末尾注释)。done() 按失败数退出。
  await done();
})().catch((e) => { console.error('neg:commerce харness 崩溃:', e); process.exit(1); });

/*
 * ══ 断言条数统计 ══  共 79 条纯负路径断言(A(...) 调用),无一条 happy-path:
 *   §1 下单(鉴权/畸形/缺字段/未知品/篡改被忽略/幂等正确性/并发同key)
 *   §2 查询(越权/不存在/未鉴权)
 *   §3 pay-callback(缺签/伪签/越权/不存在/冲突/并发双结算)
 *   §4 webhook(无登录态仍 fail-closed/边角/冒充owner/重放/并发双结算)
 *   §5 额度消费(不足/过期/缺参/越权/未鉴权/并发超卖/并发双击)
 *   §6 边角(空body/错方法/越权已paid单)
 */
