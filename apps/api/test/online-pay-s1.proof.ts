import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import { createPool, runMigrations, loadMigrations, asPrincipal } from '@meetwise/db';
import type { Client, DbPool } from '@meetwise/db';
import { CommerceService } from '../src/modules/commerce/commerce.service';
import { DbService } from '../src/platform/db.service';
import { resolvePaymentProvider } from '../src/modules/commerce/payment-provider';
import { mkAssert } from './_neg-harness';

/**
 * online-pay-s1.proof — B 端在线支付适配器第一期隔离库真 PG 验收（判据①-④·隔离 runner·est live=0）。
 *
 * 载体：真迁移链全量应用（0001→届链顶）+ 真实生产码面——CommerceService 以最小 DbService seam
 * （asPrincipal/asGateway→隔离池）直调（零 HTTP 面·守卫/映射/事务边界全真·entpay-s2 同形）。
 *
 * 判据→落槽：
 *  判据① 未配置 provider → pay-session 503 `payment_provider_not_configured`·订单滞 created·桶零入账；
 *  判据② 非空 PAY_PROVIDER_ID → resolve 抛 `payment_provider_unknown`（不回退骨架）；空白 → 骨架；
 *  判据③ 回调幂等语义回归零变——既有 HMAC 口对 online 单 exactly-once 三态（credited/already/conflict）
 *        + CAS `channel='online'` 通道守卫（offline 单持有效签名 → 409·订单滞 created·桶零入账）
 *        + refund 对偶管道（refunded/already）逐臂复证；
 *  判据④ 凭证只从环境变量读取：provider 模块源码零凭据字面量（源码扫描臂）+ env 显式注入结构臂
 *        （resolve 只认传入 env·零 process.env 回退）+ 本夹具一次性非生产值并标明。
 *
 * 夹具凭证：PAY_PROVIDER_SECRET/PAY_PROVIDER_ID 全部为 env 注入的一次性非生产值（值面含
 * -not-production 标记·沿 entpay-s2 夹具先形）·零真实网关凭据·零外部 IO。
 */

process.env.PAY_PROVIDER_SECRET ??= 'online-pay-s1-proof-pay-secret-not-production';
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'online-pay-s1-proof-route-input-hmac-key-not-production-01';

const USER = 's1-pay-user';
const OTHER = 's1-pay-other';

let pool: DbPool | null = null;

/** 最小 DbService seam：asPrincipal/asGateway 直连隔离池（真实事务边界·RLS 上下文全真·entpay-s2 同形）。 */
const fakeDb = {
  asPrincipal: <T>(user: string, fn: (c: Client) => Promise<T>): Promise<T> => asPrincipal(pool!, user, fn),
  asGateway: <T>(fn: (c: Client) => Promise<T>): Promise<T> => Promise.resolve(fn(pool as unknown as Client)),
} as unknown as DbService;

const commerce = new CommerceService(fakeDb);

const paySig = (s: string) => createHmac('sha256', process.env.PAY_PROVIDER_SECRET!).update(s).digest('hex');

const errOf = (e: unknown): { status?: number; error?: string } => {
  const he = e as { getStatus?: () => number; getResponse?: () => { error?: string } } | undefined;
  if (typeof he?.getStatus === 'function' && typeof he?.getResponse === 'function') {
    return { status: he.getStatus(), error: he.getResponse()?.error };
  }
  return {};
};

/** 订单状态/入账桶探针（判据①「订单滞 created·桶零入账」复用）。 */
async function orderStatus(id: string): Promise<string | undefined> {
  return (await pool!.query('SELECT status, channel FROM payment_order WHERE id=$1', [id])).rows[0]?.status;
}
async function bucketsFor(orderId: string): Promise<number> {
  return Number((await pool!.query('SELECT count(*)::int AS n FROM entitlement_bucket WHERE source_order_id=$1', [orderId])).rows[0]?.n ?? 0);
}

async function main() {
  const { A, done } = mkAssert('online-pay:s1:prove');
  pool = createPool({ purpose: 'online_pay_s1_proof' });
  await pool.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  const applied = await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  A('S1-0 真迁移链全量应用（末位=届链顶迁移）',
    /^0\d{3}_/.test(applied.applied[applied.applied.length - 1] ?? ''));

  await pool.query(`INSERT INTO user_account(id,email,password_hash,role,approval_status)
    VALUES ($1,$2,'x','candidate','approved'),($3,$4,'x','candidate','approved')
    ON CONFLICT DO NOTHING`, [USER, 's1-pay-user@x.com', OTHER, 's1-pay-other@x.com']);
  // 种子单：online（本主·判据①③）+ online（他人对照·跨单同流水冲突臂）+ offline（通道守卫臂·entpay-s2 判据5 同形）。
  await pool.query(`INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units, status, channel)
    VALUES ('s1-ord-online',$1,'pack_10',9900,10,'created','online'),
           ('s1-ord-online-2',$2,'pack_10',9900,10,'created','online'),
           ('s1-ord-offline',$1,'pack_10',9900,10,'created','offline')`, [USER, OTHER]);

  // ══ 判据① 未配置 provider：pay-session 503 payment_provider_not_configured·订单滞 created·桶零入账 ══
  delete process.env.PAY_PROVIDER_ID;
  let threw1: unknown;
  try { await commerce.createPaymentSession(USER, 's1-ord-online'); } catch (e) { threw1 = e; }
  const e1 = errOf(threw1);
  A('判据① 未配置 provider → pay-session 503 payment_provider_not_configured',
    e1.status === 503 && e1.error === 'payment_provider_not_configured');
  A('判据①a 订单滞 created（fail-closed 拒绝零订单写）', (await orderStatus('s1-ord-online')) === 'created');
  A('判据①b 桶零入账（source_order_id 零行·零权益副作用）', (await bucketsFor('s1-ord-online')) === 0);
  let threw1b: unknown;
  try { await commerce.createPaymentSession(OTHER, 's1-ord-online'); } catch (e) { threw1b = e; }
  const e1b = errOf(threw1b);
  A('判据①c 他人单 → 404 not_found（RLS 本人单守卫·getOrder 读面 owner 由 RLS 收窄）',
    e1b.status === 404 && e1b.error === 'not_found');

  // ══ 判据② 非空 PAY_PROVIDER_ID → resolve 抛 payment_provider_unknown（不回退） ══
  process.env.PAY_PROVIDER_ID = 'online-pay-s1-proof-id-not-production';
  let threw2: unknown;
  try { resolvePaymentProvider(process.env); } catch (e) { threw2 = e; }
  const e2 = errOf(threw2);
  A('判据② 非空 PAY_PROVIDER_ID → resolve 抛 payment_provider_unknown（503·不回退骨架）',
    e2.status === 503 && e2.error === 'payment_provider_unknown');
  let threw2b: unknown;
  try { await commerce.createPaymentSession(USER, 's1-ord-online'); } catch (e) { threw2b = e; }
  const e2b = errOf(threw2b);
  A('判据②b service 面同抛 unknown（无骨架回退·fail-closed 方向）',
    e2b.status === 503 && e2b.error === 'payment_provider_unknown');
  process.env.PAY_PROVIDER_ID = '   ';
  const blankResolved = resolvePaymentProvider(process.env);
  let threw2c: unknown;
  try { await blankResolved.createPaymentSession({ orderId: 's1-ord-online', amountCents: 9900, subject: 'probe' }); } catch (e) { threw2c = e; }
  const e2c = errOf(threw2c);
  A('判据②c 空白 PAY_PROVIDER_ID → 未配置骨架（缺失/空白同臂·骨架恒拒 503 not_configured）',
    blankResolved.id === 'unconfigured' && e2c.status === 503 && e2c.error === 'payment_provider_not_configured');
  delete process.env.PAY_PROVIDER_ID;

  // ══ 判据④ 凭证只从环境变量读取（源码扫描臂 + env 显式注入结构臂） ══
  const providerSrc = readFileSync(fileURLToPath(new URL('../src/modules/commerce/payment-provider.ts', import.meta.url)), 'utf8');
  const credLiteral = /(PAY_PROVIDER_(?:ID|SECRET)|API_KEY|APP_SECRET|ACCESS_TOKEN|PRIVATE_KEY)\s*[:=]=?\s*['"][^'"]+['"]/;
  A('判据④ provider 模块源码零凭据字面量（赋值形扫描零命中）', !credLiteral.test(providerSrc));
  process.env.PAY_PROVIDER_ID = 'online-pay-s1-proof-id-not-production';
  let structuralUnknown = false;
  try { resolvePaymentProvider({}); } catch { structuralUnknown = true; }
  delete process.env.PAY_PROVIDER_ID;
  A('判据④b resolve 只认显式 env 形参（process.env 有值·传参为空仍走骨架·零隐藏回退）', !structuralUnknown);

  // ══ 判据③ 回调幂等语义回归零变（既有 HMAC 单管道·骨架零参与） ══
  const ts1 = Date.now();
  const pay1 = await commerce.payWebhook('s1-ord-online', { providerTxn: 's1-txn-1', ts: ts1, sig: paySig(`s1-ord-online:s1-txn-1:paid:${ts1}`) });
  A('判据③ online 单持有效签名 → credited（订单 paid·桶入账 10u）',
    (pay1 as { result?: string }).result === 'credited' && (await orderStatus('s1-ord-online')) === 'paid' && (await bucketsFor('s1-ord-online')) === 1);
  const ts2 = Date.now();
  const replay = await commerce.payWebhook('s1-ord-online', { providerTxn: 's1-txn-1', ts: ts2, sig: paySig(`s1-ord-online:s1-txn-1:paid:${ts2}`) });
  A('判据③b 同单同流水重放 → already（幂等·零双入）',
    (replay as { result?: string }).result === 'already' && (await bucketsFor('s1-ord-online')) === 1);
  let threw3: unknown;
  const ts3 = Date.now();
  try { await commerce.payWebhook('s1-ord-online', { providerTxn: 's1-txn-2', ts: ts3, sig: paySig(`s1-ord-online:s1-txn-2:paid:${ts3}`) }); } catch (e) { threw3 = e; }
  const e3 = errOf(threw3);
  A('判据③c 已 paid 单换流水 → 409 order_conflict（CAS exactly-once）',
    e3.status === 409 && e3.error === 'order_conflict');
  let threw3b: unknown;
  const ts3b = Date.now();
  try { await commerce.payWebhook('s1-ord-online-2', { providerTxn: 's1-txn-1', ts: ts3b, sig: paySig(`s1-ord-online-2:s1-txn-1:paid:${ts3b}`) }); } catch (e) { threw3b = e; }
  const e3b = errOf(threw3b);
  A('判据③d 跨订单同流水 → 409 conflict（provider_txn partial UNIQUE·23505→确定性冲突）',
    e3b.status === 409 && e3b.error === 'order_conflict');
  // 通道守卫：offline 单持有效签名 → 409·订单滞 created·桶零入账
  let threw3c: unknown;
  const ts3c = Date.now();
  try { await commerce.payWebhook('s1-ord-offline', { providerTxn: 's1-txn-off', ts: ts3c, sig: paySig(`s1-ord-offline:s1-txn-off:paid:${ts3c}`) }); } catch (e) { threw3c = e; }
  const e3c = errOf(threw3c);
  A('判据③e offline 单持有效签名 → 409（CAS channel=online 守卫·订单滞 created·桶零入账）',
    e3c.status === 409 && e3c.error === 'order_conflict' && (await orderStatus('s1-ord-offline')) === 'created' && (await bucketsFor('s1-ord-offline')) === 0);
  // refund 对偶管道回归：paid → refunded → already（同单同流水零双冲）
  const ts4 = Date.now();
  const refund1 = await commerce.refundWebhook('s1-ord-online', { providerTxn: 's1-refund-1', ts: ts4, sig: paySig(`s1-ord-online:s1-refund-1:refunded:${ts4}`) });
  A('判据③f refund 对偶管道 → refunded（红冲后订单 refunded）',
    (refund1 as { result?: string }).result === 'refunded' && (await orderStatus('s1-ord-online')) === 'refunded');
  const ts5 = Date.now();
  const refund2 = await commerce.refundWebhook('s1-ord-online', { providerTxn: 's1-refund-1', ts: ts5, sig: paySig(`s1-ord-online:s1-refund-1:refunded:${ts5}`) });
  A('判据③g refund 重放 → already（零二次红冲）',
    (refund2 as { result?: string }).result === 'already');

  await done();
}

main()
  .catch(async (e: unknown) => {
    console.error('ONLINE-PAY-S1-PROOF-ABORT（prove 红=停手上报·Ban retry-to-green）', e);
    process.exit(1);
  })
  .then(async () => {
    try { await pool?.end(); } catch { /* ignore */ }
  });
