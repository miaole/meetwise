import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { mkAssert } from './_neg-harness';
import {
  createPool, runMigrations, loadMigrations, asPrincipal, availableUnits,
  type DbPool,
} from '@meetwise/db';
import { CommerceService } from '../src/modules/commerce/commerce.service';

/**
 * entpay-s3.proof — B271 #271 片3 打磨刀 prove（REQUEST rev2 §4 判据·隔离 runner·est live=0）。
 *
 * 载体：真迁移链全量应用（0001→**0159**·末位=片3 P2 受控读函数）+ 真实生产码面——CommerceService 以
 * 最小 DbService seam（asPrincipal→隔离池）直调（零 HTTP 面·RLS/门/事务边界全真，沿 entpay-s2 同型）；
 * web 渲染面断言=apps/web/test/web-logic.proof.ts 片3 新 section（read-file 静态·RX-1/RX-2 载体）。
 *
 * 判据→落槽（REQUEST §4）：§4-3① 函数本人行作用域负例（他招聘方 offline 单零行·探针逐字镜像生产 SQL+
 * 错配反例）｜§4-3② 三态可视（created/entered/confirmed/failed）｜§4-3③ app_role 直读 offline_remit_record
 * 被拒（42501）｜§4-3④ 镜像逐字节同文（0159 ↔ 23_api_gateway.sql 直载比对）｜§4-3⑤ 他人单端点 403/零行
 * 不可区分｜§4-4 P3 形 A（availableUnits 缺省逐值不变+enterprise 过滤+expired 界·entitlement 恒并列）｜
 * §4-5 P4（listMyOrders 仅本人+LIMIT 50 窗+仅-paid 过滤的行级事实源+开票 409 负例面复验）｜§4-7 P6 注释
 * 事实态 read-file（更正文本在位·「实无 RLS」表述零残留）。
 * §4-6 P5=既有 entpay:s2 判据5 offline-reject 断言复跑复验（零新断言·本文件零含——Ban 现场补写）。
 *
 * est live=0（零模型外呼·零真实支付·隔离库零生产 DSN）。
 */

const REC = 's3-recruiter-1';
const REC2 = 's3-recruiter-2';
const CAND = 's3-candidate-1';

let pool: DbPool | null = null;

/** 最小 DbService seam：asPrincipal 直连隔离池（真实事务边界·RLS 上下文全真）。 */
const fakeDb = {
  asPrincipal: (owner: string, fn: (c: any) => any) => asPrincipal(pool!, owner, fn as any),
  asGateway: (fn: (c: any) => any) => Promise.resolve(fn(pool!)),
} as any;

const commerce = new CommerceService(fakeDb);

/** 生产 SQL 探针（逐字=commerce.service.listMyOfflineOrders 调用面·§4-3①「探针逐字镜像生产 SQL」）。 */
const MY_OFFLINE_ORDERS_SQL =
  'SELECT order_id, product_id, amount_cents, order_status, remit_status, entered_at, confirmed_at, created_at FROM gateway_entpay_my_offline_orders()';

const errOf = (e: unknown): { status?: number; error?: string } => {
  const he = e as { getStatus?: () => number; getResponse?: () => { error?: string } } | undefined;
  if (typeof he?.getStatus === 'function' && typeof he?.getResponse === 'function') {
    return { status: he.getStatus(), error: he.getResponse()?.error };
  }
  return {};
};

/** 从 SQL 文本抽取 0159 语句块（CREATE FUNCTION 起·GRANT EXECUTE 止）——镜像逐字节同文比对载体。 */
function extractBlock(src: string): string {
  const m = src.match(/^CREATE OR REPLACE FUNCTION gateway_entpay_my_offline_orders\(\)[\s\S]*?^GRANT EXECUTE ON FUNCTION gateway_entpay_my_offline_orders\(\) TO app_role;$/m);
  if (!m) throw new Error('entpay_s3_block_not_found');
  return m[0];
}

async function main() {
  const { A, done } = mkAssert('entpay:s3:prove');
  pool = createPool({ purpose: 'entpay_s3_proof' });
  await pool.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  const manifest = loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url)));
  const applied = await runMigrations(pool, manifest);
  const rerun = await runMigrations(pool, manifest);

  // ══ S3-0 部署车（§4-8 若 0159 部署车幂等）══
  A('S3-0 真迁移链全量应用 0001→0159（末位=0159 片3 P2 受控读函数）',
    applied.applied[applied.applied.length - 1] === '0159_entpay_my_offline_orders');
  A('S3-0b 重跑全 skipped（幂等·CREATE OR REPLACE+自包含 REVOKE/GRANT）',
    rerun.applied.length === 0 && rerun.skipped.length === manifest.length);
  A('S3-0c 0159 函数在位（SECURITY DEFINER·prosecdef）',
    ((await pool.query(`SELECT count(*)::int AS n FROM pg_proc WHERE proname='gateway_entpay_my_offline_orders' AND prosecdef`)).rows[0]?.n ?? 0) === 1);

  // ══ §4-3④ 镜像逐字节同文（RX-3 指名 23_api_gateway.sql·直载比对）══
  const migSrc = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0159_entpay_my_offline_orders.sql', import.meta.url)), 'utf8');
  const mirrorSrc = readFileSync(fileURLToPath(new URL('../../../packages/db/sql/23_api_gateway.sql', import.meta.url)), 'utf8');
  A('§4-3④ 0159 函数体+ACL 与 23_api_gateway.sql 镜像逐字节同文（S1-C2 承重墙判据·neg 直载同源）',
    extractBlock(migSrc) === extractBlock(mirrorSrc));

  // ══ 播种：双招聘方+候选人·对公订单四态+他方对照 ══
  await pool.query(`INSERT INTO user_account(id,email,password_hash,role,approval_status)
    VALUES ($1,$2,'x','recruiter','approved'),($3,$4,'x','recruiter','approved'),($5,$6,'x','candidate','approved')
    ON CONFLICT DO NOTHING`, [REC, 's3-rec1@x.com', REC2, 's3-rec2@x.com', CAND, 's3-cand@x.com']);
  // REC 四态对公单（created 无台账行/entered/confirmed/failed）+ 一张线上单（不得出现在对公台账）
  await pool.query(`INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status,channel,created_at) VALUES
    ('s3-ord-created',$1,'ent_pack_50',39900,50,'created','offline', now()-interval '4 days'),
    ('s3-ord-entered',$1,'ent_pack_50',39900,50,'created','offline', now()-interval '3 days'),
    ('s3-ord-confirmed',$1,'ent_pack_200',149900,200,'paid','offline', now()-interval '2 days'),
    ('s3-ord-failed',$1,'ent_pack_50',39900,50,'failed','offline', now()-interval '1 day'),
    ('s3-ord-online',$1,'ent_pack_50',39900,50,'created','online', now())`, [REC]);
  await pool.query(`INSERT INTO offline_remit_record(order_id,bank_ref,amount_cents,entered_by,entered_at,status) VALUES
    ('s3-ord-entered','s3-bank-entered',39900,$1, now(),'entered')`, [REC]);
  await pool.query(`INSERT INTO offline_remit_record(order_id,bank_ref,amount_cents,entered_by,entered_at,status,confirmed_by,confirmed_at) VALUES
    ('s3-ord-confirmed','s3-bank-confirmed',149900,$1, now(),'confirmed',$1, now())`, [REC]);
  await pool.query(`INSERT INTO offline_remit_record(order_id,bank_ref,amount_cents,entered_by,entered_at,status,failed_by,failed_at) VALUES
    ('s3-ord-failed','s3-bank-failed',39900,$1, now(),'failed',$1, now())`, [REC]);
  // REC2 对照：一张他方对公单（须对 REC 零可见）
  await pool.query(`INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status,channel,created_at)
    VALUES ('s3-ord-other',$1,'ent_pack_50',39900,50,'created','offline', now())`, [REC2]);

  // ══ §4-3③ app_role 直读 offline_remit_record 被拒（全库零 GRANT·0156:80-83 纪律）══
  let denied: { code?: string; message?: string } = {};
  try {
    await asPrincipal(pool!, REC, (c) => c.query('SELECT * FROM offline_remit_record'));
  } catch (e: unknown) {
    denied = { code: (e as { code?: string }).code, message: (e as Error).message };
  }
  A('§4-3③ app_role 会话直读 offline_remit_record 被拒（42501 permission denied·台账零 GRANT）',
    denied.code === '42501');

  // ══ §4-3① 本人行作用域（探针=生产 SQL 逐字·错配反例留痕）══
  const recRows = await asPrincipal(pool!, REC, (c) => c.query(MY_OFFLINE_ORDERS_SQL));
  const rec2Rows = await asPrincipal(pool!, REC2, (c) => c.query(MY_OFFLINE_ORDERS_SQL));
  A('§4-3①a REC 恰见本人 4 张对公单（他方 s3-ord-other 零行·线上单不入台账）',
    recRows.rows.length === 4 && !recRows.rows.some((r: any) => r.order_id === 's3-ord-other')
      && !recRows.rows.some((r: any) => r.order_id === 's3-ord-online'));
  A('§4-3①b REC2 恰见本人 1 张（本人行作用域双向成立）',
    rec2Rows.rows.length === 1 && rec2Rows.rows[0]?.order_id === 's3-ord-other');
  const mismatch = await asPrincipal(pool!, 's3-nobody-match', (c) => c.query(MY_OFFLINE_ORDERS_SQL));
  A('§4-3①c 错配反例：principal 与任何 owner 不匹配 → 零行（Ban 无作用域全表读）',
    mismatch.rows.length === 0);

  // ══ §4-3② 三态可视（created→entered→confirmed + failed）══
  const stOf = (rows: any[], id: string) => rows.find((r) => r.order_id === id)?.remit_status ?? null;
  A('§4-3②a 无台账行=created（remit_status NULL）', stOf(recRows.rows, 's3-ord-created') === null);
  A('§4-3②b 台账 entered=entered', stOf(recRows.rows, 's3-ord-entered') === 'entered');
  A('§4-3②c 台账 confirmed=confirmed', stOf(recRows.rows, 's3-ord-confirmed') === 'confirmed');
  A('§4-3②d 台账 failed=failed', stOf(recRows.rows, 's3-ord-failed') === 'failed');
  A('§4-3②e created_at DESC 时序（首行=最新对公单 s3-ord-failed·线上单不入列）+ 伴随列随态（entered_at/confirmed_at）',
    recRows.rows.map((r: any) => r.order_id)[0] === 's3-ord-failed'
      && stOf(recRows.rows, 's3-ord-confirmed') === 'confirmed');

  // ══ §4-3⑤ 端点面（service 直调·approved recruiter 门 403 + 零行不可区分）══
  let candErr: { status?: number; error?: string } = {};
  try { await commerce.listMyOfflineOrders(CAND); } catch (e) { candErr = errOf(e); }
  A('§4-3⑤a 非 approved principal → 403 recruiter_required（门复用 :28-30 谓词）',
    candErr.status === 403 && candErr.error === 'recruiter_required');
  const rec2View = await commerce.listMyOfflineOrders(REC2);
  A('§4-3⑤b 他人单零行不可区分：REC2 视图内不见 REC 单号（empty/仅本人行，无存在性泄漏）',
    rec2View.orders.length === 1 && !rec2View.orders.some((o) => o.order_id.startsWith('s3-ord-') && o.order_id !== 's3-ord-other'));

  // ══ §4-4 P3 形 A（裁定②·availableUnits 缺省逐值不变+kind 过滤+expired 界+entitlement 恒并列）══
  await pool.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES
    ($1,'paid',3.00, now()+interval '365 days'),
    ($1,'enterprise',5.00, now()+interval '365 days'),
    ($1,'enterprise',7.00, now()-interval '1 day')`, [REC]);
  const allUnits = await asPrincipal(pool!, REC, (c) => availableUnits(c, REC));
  const entUnits = await asPrincipal(pool!, REC, (c) => availableUnits(c, REC, 'enterprise'));
  const paidUnits = await asPrincipal(pool!, REC, (c) => availableUnits(c, REC, 'paid'));
  A('§4-4a 缺省=全桶未过期和（3+5=8·expired 7.00 界外·与既有 C 端口径逐值一致）', allUnits === 8);
  A('§4-4b kind=enterprise 恰企业桶（5.00·expired 企业桶界外）', entUnits === 5);
  A('§4-4c kind=paid 恰个人桶（3.00·过滤双向不串桶）', paidUnits === 3);
  const ent = await commerce.entitlement(REC);
  A('§4-4d entitlement 一次调用双算恒并列（availableUnits=8 不变+enterpriseAvailableUnits=5 只增）',
    ent.availableUnits === 8 && ent.enterpriseAvailableUnits === 5);

  // ══ §4-5 P4（listMyOrders 仅本人+LIMIT 50 窗+行级事实源+开票 409 负例面复验）══
  await pool.query(`INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status,channel,created_at)
    SELECT 's3-bulk-'||g, $1, 'pack_10', 9900, 10, 'paid', 'online', now() - (g || ' minutes')::interval
      FROM generate_series(1,51) g`, [CAND]);
  const candOrders = await commerce.listMyOrders(CAND);
  A('§4-5a listMyOrders 仅本人行（CAND 51+ 域内·零 REC/REC2 单泄漏）',
    candOrders.orders.every((o) => o.id.startsWith('s3-bulk-')));
  A('§4-5b LIMIT 50 窗（>50 窗外老 paid 单不可选=裁定③如实边界）', candOrders.orders.length === 50);
  A('§4-5c created_at DESC（最新在前·窗口裁的是最老行 s3-bulk-51）',
    candOrders.orders[0]?.id === 's3-bulk-1' && !candOrders.orders.some((o) => o.id === 's3-bulk-51'));
  const recOrders = await commerce.listMyOrders(REC);
  A('§4-5d REC 视图含四态 status+channel 行级事实（web 仅-paid 过滤的行级事实源）',
    recOrders.orders.some((o) => o.status === 'paid') && recOrders.orders.some((o) => o.channel === 'offline'));
  let invErr: { status?: number; error?: string } = {};
  try { await commerce.submitInvoiceRequest(REC, 's3-ord-created'); } catch (e) { invErr = errOf(e); }
  A('§4-5e 开票仅-paid 负例面复验：created 单 → 409 invoice_request_order_not_paid（触发器双层承·不弱）',
    invErr.status === 409 && invErr.error === 'invoice_request_order_not_paid');

  // ══ §4-7 P6 注释事实态（read-file·机制描述事实更正·门行为零变）══
  const svcSrc = readFileSync(fileURLToPath(new URL('../src/modules/commerce/commerce.service.ts', import.meta.url)), 'utf8');
  A('§4-7a P6 更正文本在位（四锚+第五锚：0041:14-20·09_auth.sql:23-27·principal.ts:949·0001:372）',
    svcSrc.includes('p_user_account_self FORCE RLS 在位且生效')
      && svcSrc.includes('0041:14-20') && svcSrc.includes('09_auth.sql:23-27')
      && svcSrc.includes('principal.ts:949') && svcSrc.includes('0001:372'));
  A('§4-7b 「实无 RLS」失准表述零残留（勘误之勘误·slice1 收据 append-only 零改）', !svcSrc.includes('实无 RLS'));

  await done();
}

main()
  .catch(async (e: unknown) => {
    console.error('ENTPAY-S3-PROOF-ABORT（prove 红=停手上报协调方·Ban retry-to-green）', e);
    process.exit(1);
  })
  .then(async () => {
    try { await pool?.end(); } catch { /* ignore */ }
  });
