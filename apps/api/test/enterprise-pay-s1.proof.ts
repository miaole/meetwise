import { fileURLToPath } from 'node:url';
import { boot, mkAssert, PAY_SECRET } from './_neg-harness';
import { createPool, runMigrations, loadMigrations, asPrincipal, type DbPool } from '@meetwise/db';
import { createHmac } from 'node:crypto';

/**
 * enterprise-pay-s1.proof — B271 #271 片1 prove（REQUEST @6385804a rev3 §4.1·充值面·审计⑦前半）。
 * 本文件为 B271 片1 EXEC 席 2026-10-10 全新书写（wave2 隔离档零恢复）。
 * 隔离库（run-e2e-isolated 门·本地临时实例·零生产 DSN）·真 HTTP 链（boot() 起真 NestJS）·
 * est live=0（零模型外呼·零真实支付）。
 *
 * 断言表（§4.1 五判据 + ⑦验收面）：
 *  [0] 部署车：隔离容器内一次性空库由真 runMigrations 全量应用 0001→当前最大号（动态链头锚·现 0160）·重跑全 skipped（幂等）。
 *  [1] 线上幂等（§4.1.1）：企业线上单 webhook 入账 credited→企业桶恰一（kind='enterprise'·owner=下单
 *      招聘方·units=50·≈365 天）；重放→already 不双入；同 provider_txn 指向另一单→409 conflict 零二次入账。
 *  [2] 对公防重+门（§4.1.2·审计⑦对公逐条）：确认前企业桶与订单状态不变；非 admin 确认被拒（HTTP
 *      AdminGuard 403 + 受控函数直调 gateway_admin_required 双层）；金额不符→409 且不入账；同一银行
 *      流水号确认第二单→409 offline_remit_provider_txn_conflict（bank_ref 作 provider_txn·0020 CAS）；
 *      确认成功写 admin_audit 四元（操作人/订单/流水号/金额）；录入人==确认人→409（双人分离）；置败→failed+audit。
 *  [3] 红冲过滤（§4.1.3）：企业订单退款只减 enterprise 桶（C 端 paid 桶 units 前后相等断言）。
 *  [4] 开票门+RLS（§4.1.4）：invoice_profile 仅本人读写（他招聘方/候选人 SELECT 零行）；invoice_request
 *      仅 paid 订单可提交（created/refunded 负例 409 拒绝·paid 正例 200·重复 409）。
 *  [5] 零弱化回归（§4.1.5）：C 端 paid 单入账 kind='paid' 语义回归（默认参数路径零退化）·公开商品目录
 *      仍恰 2 条（C 端域子集·前席发现②兼容）·企业商品独立端点恰 2 条（recruiter 门）。
 *  对公台账端点（S1-C7）：admin 队列可见 offline 单；candidate 访问 admin 端点 403。
 */

const ADMIN2 = 'adminV';   // 双人分离第二 admin（脚本内种子·adminU 为 harness 既有）

let adminPool: DbPool | null = null;

/**
 * [0] 部署车证明（runtime-role-http.proof:19 先例形）：真 runMigrations 全量链直接落在隔离容器
 * **默认库**（一次性·per-run 即弃）。独立探针库不可行：0001 的角色治理（DROP OWNED+DROP ROLE）是
 * cluster 级——探针库落满 0001→0156 后，boot() 的 sql/01_schema DROP ROLE 会因探针库跨库依赖炸
 * 2BP01（attempt2/3 实测）；默认库单库承载则 DROP OWNED 清账后 DROP/CREATE ROLE 干净。
 * 必须在 boot() 之前跑（此刻 cluster virgin·迁移账本可从 0001 CLEAN 建账）。
 */
async function proveMigrationRunner(): Promise<boolean> {
  adminPool = createPool({ purpose: 'entpay_s1_probe_admin' });
  await adminPool.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  const manifest = loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url)));
  const first = await runMigrations(adminPool, manifest);
  const second = await runMigrations(adminPool, manifest);
  const last = first.applied[first.applied.length - 1];
  console.log(`entpay-s1[0] runner applied=${first.applied.length}/${manifest.length} last=${last} rerun_applied=${second.applied.length} rerun_skipped=${second.skipped.length}`);
  // 链头判据（REG-FIX 组3 主案·REQUEST §5.2 定值）：动态链头锚=manifest 排序末位（loadMigrations readdirSync
  // .filter().sort() 全序 · packages/db/src/migrate.ts:307 + canonicalMigrations version localeCompare :192-195
  // ⇒ 末位即当前最大号，下一迁移落地不再漂；空 manifest 经 ?? '' fail-closed——链头空串 → last===chainHead 恒假）。
  // 0156/0157 双在链 Set 面：片1 企业桶判据本体 + 片2 扣费路由（防链中截断）；0160 已实证链头漂移场景（h3）。
  const appliedSet = new Set(first.applied);
  const chainHead = manifest[manifest.length - 1]?.version ?? '';   // version=文件名去 .sql 后缀（loadMigrations 形）
  const chainFullOrder = manifest.length === first.applied.length   // 可选硬化（§5.2 非绑定·顺手采）：applied 与 manifest 全序逐位对比
    && manifest.every((m, i) => m.version === first.applied[i]);
  const lastOk = last === chainHead
    && appliedSet.has('0156_enterprise_bucket_billing')   // 片1 判据本体：企业桶迁移在链
    && appliedSet.has('0157_billing_payer_route')         // 片2 扣费路由在链（防链截断）
    && chainFullOrder;
  return lastOk && second.applied.length === 0 && manifest.length === first.applied.length;
}

(async () => {
  // [0] 部署车先行（trial-grant:257 先例形）：迁移探针必须在 boot() 之前跑——cluster 仍 virgin
  // （sql/ 引导未跑·app_role 无跨库依赖对象），0001 的 DROP ROLE/CREATE ROLE 才能干净建账本。
  const migOk = await proveMigrationRunner();
  const h = await boot();
  const { A, done } = mkAssert('enterprise:pay:s1:prove');
  const pool = h.pool;
  const sig = (id: string, txn: string, tag: string) => createHmac('sha256', PAY_SECRET).update(`${id}:${txn}:${tag}`).digest('hex');
  // 5A-2 #100:回调签名载荷 `${id}:${txn}:${kind}:${ts}`(ts=毫秒·±300s 防重放窗)·body 携 ts。
  const payBody = (id: string, txn: string, kind: 'paid' | 'refunded' = 'paid', ts = Date.now()) =>
    ({ providerTxn: txn, ts, sig: createHmac('sha256', PAY_SECRET).update(`${id}:${txn}:${kind}:${ts}`).digest('hex') });

  // ── [0] 部署车断言（先行实跑·此处落账）─────────────────────────────────────────
  A('S1-0 真迁移链 0001→当前最大号(动态链头锚·现 0160) 全量应用+重跑幂等（部署车）', migOk);

  // ── 种子：双 admin + 企业桶基线（recU=0155 approved recruiter·harness 默认）────────────
  await pool.query(`INSERT INTO user_account(id,email,password_hash,is_admin,role) VALUES ($1,$2,'x',true,'candidate') ON CONFLICT DO NOTHING`, [ADMIN2, 'admin2@x.com']);
  await pool.query(
    `INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('recU','paid',7.00, now()+interval '300 days') ON CONFLICT DO NOTHING`);
  const recAuth = h.U('recU');       // 招聘方（approved）
  const adminAuth = h.U('adminU');   // admin #1（录入人）
  const admin2Auth = h.U(ADMIN2);    // admin #2（确认人·双人分离）
  const candAuth = h.U('userA');     // 候选人

  // ── [1] 线上幂等（§4.1.1）─────────────────────────────────────────────────────
  let r = await h.post('/commerce/orders', recAuth, { productId: 'ent_pack_50', channel: 'online' });
  const onlineOrderId = r.body?.orderId as string;
  A('S1-1a 企业线上单创建 200（approved recruiter）', r.status === 200 && typeof onlineOrderId === 'string');
  r = await h.post('/commerce/orders', candAuth, { productId: 'ent_pack_50', channel: 'online' });
  A('S1-1b 候选人买企业商品 → 403 recruiter_required（0155 同门）', r.status === 403);

  const txn1 = `entpay-txn-${onlineOrderId}`;
  r = await h.post(`/commerce/webhook/pay/${onlineOrderId}`, {}, payBody(onlineOrderId, txn1));
  A('S1-1c webhook 入账 credited（HMAC fail-closed 复用）', r.status === 200 && r.body?.result === 'credited');
  const buckets = await pool.query(`SELECT id, kind, units_total, owner_user_id, source_order_id, expires_at FROM entitlement_bucket WHERE source_order_id=$1`, [onlineOrderId]);
  const b1 = buckets.rows[0];
  A('S1-1d 企业桶恰一：kind=enterprise·owner=下单招聘方·units=50·source_order_id=订单（S1-C3 落位）',
    buckets.rowCount === 1 && b1?.kind === 'enterprise' && b1?.owner_user_id === 'recU' && Number(b1?.units_total) === 50 && b1?.source_order_id === onlineOrderId);
  A('S1-1e 到期沿 365 天惯例', b1 ? (new Date(b1.expires_at).getTime() - Date.now()) > 364 * 24 * 3600 * 1000 : false);
  r = await h.post(`/commerce/webhook/pay/${onlineOrderId}`, {}, payBody(onlineOrderId, txn1));
  A('S1-1f 回调重放→already（幂等不双入）', r.status === 200 && r.body?.result === 'already');
  A('S1-1g 企业桶仍恰一行（exactly-once）',
    (await pool.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE source_order_id=$1`, [onlineOrderId])).rows[0]?.n === 1);

  r = await h.post('/commerce/orders', recAuth, { productId: 'ent_pack_50', channel: 'online' });
  const order2 = r.body?.orderId as string;
  r = await h.post(`/commerce/webhook/pay/${order2}`, {}, payBody(order2, txn1));
  A('S1-1h 同 provider_txn 指向另一单 → 409 conflict（0020 CAS 语义）', r.status === 409 && r.body?.error === 'order_conflict');
  A('S1-1i 另一单仍 created 零入账',
    (await pool.query(`SELECT status FROM payment_order WHERE id=$1`, [order2])).rows[0]?.status === 'created' &&
    (await pool.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE source_order_id=$1`, [order2])).rows[0]?.n === 0);

  // ── [2] 对公防重+门（§4.1.2）──────────────────────────────────────────────────
  r = await h.post('/commerce/orders', recAuth, { productId: 'ent_pack_200', channel: 'offline' });
  const off1 = r.body?.orderId as string;
  A('S1-2a 对公单创建（channel=offline·停 created）',
    r.status === 200 &&
    (await pool.query(`SELECT channel, status FROM payment_order WHERE id=$1`, [off1])).rows[0]?.channel === 'offline' &&
    (await pool.query(`SELECT status FROM payment_order WHERE id=$1`, [off1])).rows[0]?.status === 'created');

  // 队列可见（S1-C7 admin 台账）
  r = await h.req('GET', '/admin/offline-remits', adminAuth);
  A('S1-2b admin 台账队列可见 offline 单', r.status === 200 && Array.isArray(r.body?.remits) && r.body.remits.some((x: any) => x.order_id === off1));
  r = await h.req('GET', '/admin/offline-remits', candAuth);
  A('S1-2c candidate 访问 admin 台账 → 403（AdminGuard）', r.status === 403);

  // 非 admin 确认被拒：HTTP 层（AdminGuard）
  r = await h.post(`/admin/offline-remits/${off1}/confirm`, candAuth, {});
  A('S1-2d 非 admin HTTP 确认 → 403（guard 层）', r.status === 403);
  // 非 admin 确认被拒：受控函数直调层（函数内 require_active_admin）
  let fnDenied = false;
  try { await asPrincipal(pool, 'userA', (c) => c.query(`SELECT gateway_admin_offline_remit_confirm($1)`, [off1])); }
  catch (e: unknown) { fnDenied = (e as { message?: string }).message === 'gateway_admin_required'; }
  A('S1-2e 非 admin 直调受控函数 → gateway_admin_required（函数层双层）', fnDenied);

  // 确认前：企业桶与订单状态不变（先做一笔合法录入以便后续分支；桶计数按 source_order_id 限域=本单）
  r = await h.post(`/admin/offline-remits/${off1}/entry`, adminAuth, { bankRef: 'BR-ENT-001', amountCents: 149900 });
  A('S1-2f admin 录入 bank_ref+到账金额 → true', r.status === 200 && r.body?.entered === true);
  A('S1-2g 确认前本单企业桶零入账·订单仍 created（停 created 语义）',
    (await pool.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE source_order_id=$1`, [off1])).rows[0]?.n === 0 &&
    (await pool.query(`SELECT status FROM payment_order WHERE id=$1`, [off1])).rows[0]?.status === 'created');

  // 双人分离：录入人==确认人 拒
  r = await h.post(`/admin/offline-remits/${off1}/confirm`, adminAuth, {});
  A('S1-2h 录入人==确认人 → 409 offline_remit_segregation_required（双人分离）',
    r.status === 409 && r.body?.error === 'offline_remit_segregation_required');
  A('S1-2h2 拒后本单仍零入账·仍 created',
    (await pool.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE source_order_id=$1`, [off1])).rows[0]?.n === 0 &&
    (await pool.query(`SELECT status FROM payment_order WHERE id=$1`, [off1])).rows[0]?.status === 'created');

  // 金额不符：第二单录入到账金额 ≠ 订单金额 → 确认拒且不入账
  r = await h.post('/commerce/orders', recAuth, { productId: 'ent_pack_50', channel: 'offline' });
  const off2 = r.body?.orderId as string;
  await h.post(`/admin/offline-remits/${off2}/entry`, adminAuth, { bankRef: 'BR-ENT-002', amountCents: 1 });
  r = await h.post(`/admin/offline-remits/${off2}/confirm`, admin2Auth, {});
  A('S1-2i 金额不符 → 409 offline_remit_amount_mismatch（拒且不入账）',
    r.status === 409 && r.body?.error === 'offline_remit_amount_mismatch' &&
    (await pool.query(`SELECT status FROM payment_order WHERE id=$1`, [off2])).rows[0]?.status === 'created' &&
    (await pool.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE source_order_id=$1`, [off2])).rows[0]?.n === 0);

  // 同一流水号确认第二单 → conflict（bank_ref 作 provider_txn·0020 全局唯一）
  const confirm1 = await h.post(`/admin/offline-remits/${off1}/confirm`, admin2Auth, {});
  A('S1-2j 第二 admin 确认 → 200 confirmed（双人分离过·CAS 入账）', confirm1.status === 200 && confirm1.body?.confirmed === true);
  A('S1-2k 订单 paid + 本单企业桶恰一（kind=enterprise·units=200·来源=受控函数落位）',
    (await pool.query(`SELECT status FROM payment_order WHERE id=$1`, [off1])).rows[0]?.status === 'paid' &&
    (await pool.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE source_order_id=$1 AND kind='enterprise'`, [off1])).rows[0]?.n === 1);
  r = await h.post('/commerce/orders', recAuth, { productId: 'ent_pack_50', channel: 'offline' });
  const off3 = r.body?.orderId as string;
  await h.post(`/admin/offline-remits/${off3}/entry`, admin2Auth, { bankRef: 'BR-ENT-001', amountCents: 39900 });
  r = await h.post(`/admin/offline-remits/${off3}/confirm`, adminAuth, {});
  A('S1-2l 同一银行流水号确认第二单 → 409 offline_remit_provider_txn_conflict（0020 CAS）',
    r.status === 409 && r.body?.error === 'offline_remit_provider_txn_conflict' &&
    (await pool.query(`SELECT status FROM payment_order WHERE id=$1`, [off3])).rows[0]?.status === 'created');

  // 置败：off2（金额不符悬置）逾期置 failed + audit
  r = await h.post(`/admin/offline-remits/${off2}/fail`, admin2Auth, { reason: '逾期未到账' });
  A('S1-2m 置败 → 200 failed·订单 failed',
    r.status === 200 && r.body?.failed === true &&
    (await pool.query(`SELECT status FROM payment_order WHERE id=$1`, [off2])).rows[0]?.status === 'failed');

  // audit 留痕四元（操作人/订单/流水号/金额）
  const audit = await pool.query(`SELECT actor, action, target, detail FROM admin_audit WHERE action LIKE 'offline_remit%' ORDER BY created_at ASC`);
  const entryAudit = audit.rows.find((x: any) => x.action === 'offline_remit_entry' && x.target === off1);
  const confirmAudit = audit.rows.find((x: any) => x.action === 'offline_remit_confirm' && x.target === off1);
  const failAudit = audit.rows.find((x: any) => x.action === 'offline_remit_fail' && x.target === off2);
  A('S1-2n entry audit（actor=adminU·detail bank_ref/amount）',
    !!entryAudit && entryAudit.actor === 'adminU' && entryAudit.detail?.bank_ref === 'BR-ENT-001' && entryAudit.detail?.amount === 149900);
  A('S1-2o confirm audit 四元（操作人/订单/流水号/金额·审计⑦逐条）',
    !!confirmAudit && confirmAudit.actor === ADMIN2 && confirmAudit.detail?.order === off1 &&
    confirmAudit.detail?.bank_ref === 'BR-ENT-001' && confirmAudit.detail?.amount === 149900);
  A('S1-2p fail audit（reason+actor）', !!failAudit && failAudit.actor === ADMIN2 && typeof failAudit.detail?.reason === 'string');

  // ── [3] 红冲过滤（§4.1.3）────────────────────────────────────────────────────
  const paidBefore = Number((await pool.query(`SELECT units_total FROM entitlement_bucket WHERE owner_user_id='recU' AND kind='paid'`)).rows[0]?.units_total);
  const entBefore = Number((await pool.query(`SELECT coalesce(sum(units_total),0) AS s FROM entitlement_bucket WHERE owner_user_id='recU' AND kind='enterprise'`)).rows[0]?.s);
  const refundTxn = `refund-${off1}`;
  r = await h.post(`/commerce/webhook/refund/${off1}`, {}, payBody(off1, refundTxn, 'refunded'));
  A('S1-3a 企业订单退款 webhook → refunded', r.status === 200 && r.body?.result === 'refunded');
  const paidAfter = Number((await pool.query(`SELECT units_total FROM entitlement_bucket WHERE owner_user_id='recU' AND kind='paid'`)).rows[0]?.units_total);
  const entAfter = Number((await pool.query(`SELECT coalesce(sum(units_total),0) AS s FROM entitlement_bucket WHERE owner_user_id='recU' AND kind='enterprise'`)).rows[0]?.s);
  A('S1-3b 只减 enterprise 桶（-200）·C 端 paid 桶前后相等（S1-C5 过滤）',
    Math.abs(entAfter - (entBefore - 200)) < 1e-9 && paidAfter === paidBefore);
  r = await h.post(`/commerce/webhook/refund/${off1}`, {}, payBody(off1, refundTxn, 'refunded'));
  A('S1-3c 退款重放 → already（红冲 exactly-once 回归）', r.status === 200 && r.body?.result === 'already');

  // ── [4] 开票门+RLS（§4.1.4）──────────────────────────────────────────────────
  r = await h.post('/commerce/invoice-profile', recAuth, { title: '知面科技有限公司', taxId: '91330100MA27X8765B', addressPhone: '杭州市西湖区 0571-88880000', bankAccount: '工行杭州分行 1202000100001234567', email: 'finance@rec.example' });
  A('S1-4a 开票资料维护 → saved（approved recruiter）', r.status === 200 && r.body?.saved === true);
  r = await h.req('GET', '/commerce/invoice-profile', recAuth);
  A('S1-4b 本人可读回（抬头/税号）', r.status === 200 && r.body?.profile?.title === '知面科技有限公司' && r.body?.profile?.tax_id === '91330100MA27X8765B');
  r = await h.req('GET', '/commerce/invoice-profile', h.U('recU2'));
  A('S1-4c 他招聘方 SELECT → 零行（RLS 仅本人）', r.status === 200 && r.body?.profile === null);
  const candProfile = await asPrincipal(pool, 'userA', (c) => c.query(`SELECT count(*)::int AS n FROM invoice_profile WHERE owner_user_id='recU'`));
  A('S1-4d 候选人 principal 直查 → 0 行（RLS FORCE）', candProfile.rows[0]?.n === 0);
  r = await h.post('/commerce/invoice-profile', candAuth, { title: 'x', taxId: 'y', email: 'c@c.example' });
  A('S1-4e 候选人维护开票资料 → 403（recruiter 门）', r.status === 403);

  // 仅-paid 门：created 负例
  r = await h.post('/commerce/invoice-requests', recAuth, { orderId: off3 });
  A('S1-4f created 单申请开票 → 409（invoice_request_order_not_paid）', r.status === 409 && r.body?.error === 'invoice_request_order_not_paid');
  // refunded 负例
  r = await h.post('/commerce/invoice-requests', recAuth, { orderId: off1 });
  A('S1-4g refunded 单申请开票 → 409（负例·审计⑦）', r.status === 409 && r.body?.error === 'invoice_request_order_not_paid');
  // paid 正例 + 重复 409
  r = await h.post('/commerce/invoice-requests', recAuth, { orderId: onlineOrderId });
  A('S1-4h paid 单申请开票 → 200 submitted（仅-paid 门正例）', r.status === 200 && r.body?.request?.status === 'submitted');
  r = await h.post('/commerce/invoice-requests', recAuth, { orderId: onlineOrderId });
  A('S1-4i 同单重复申请 → 409（一单至多一张）', r.status === 409 && r.body?.error === 'invoice_request_duplicate');
  // 他人单双门：candidate 先撞 recruiter 门（403·无存在性信号）；他招聘方（门内）经 RLS 隐单
  // → 触发器 order_not_found → 409（无存在性信号·§4.1-4「其他招聘方读不到企业订单」）
  r = await h.post('/commerce/invoice-requests', candAuth, { orderId: onlineOrderId });
  A('S1-4j 他人 paid 单申请(candidate) → 403 recruiter 门（无存在性信号）', r.status === 403);
  r = await h.post('/commerce/invoice-requests', h.U('recU2'), { orderId: onlineOrderId });
  A('S1-4j2 他人 paid 单申请(他招聘方) → 409（RLS 隐单·无存在性信号）', r.status === 409);
  r = await h.req('GET', '/commerce/invoice-requests', recAuth);
  A('S1-4k 本人申请列表恰一（submitted）', r.status === 200 && r.body?.requests?.length === 1 && r.body.requests[0]?.order_id === onlineOrderId);

  // ── [5] 零弱化回归（§4.1.5）──────────────────────────────────────────────────
  r = await h.post('/commerce/orders', h.U('userB'), { productId: 'pack_10', channel: 'online' });
  const cOrder = r.body?.orderId as string;
  const cTxn = `c-end-${cOrder}`;
  r = await h.post(`/commerce/webhook/pay/${cOrder}`, {}, payBody(cOrder, cTxn));
  A('S1-5a C 端 paid 单入账回归 credited', r.status === 200 && r.body?.result === 'credited');
  A('S1-5b C 端落桶 kind=paid（默认参数路径零退化·source_order_id 溯源同列）',
    (await pool.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE source_order_id=$1 AND kind='paid' AND owner_user_id='userB'`, [cOrder])).rows[0]?.n === 1);
  r = await h.req('GET', '/commerce/products');
  A('S1-5c 公开商品目录仍恰 2 条（C 端域子集·neg-commerce:389 契约零弱化）', r.status === 200 && r.body?.products?.length === 2);
  r = await h.req('GET', '/commerce/enterprise-products', recAuth);
  A('S1-5d 企业商品独立端点恰 2 条（ent_ 域·recruiter 门·前席发现②兼容）', r.status === 200 && r.body?.products?.length === 2);
  r = await h.req('GET', '/commerce/enterprise-products', candAuth);
  A('S1-5e 候选人访问企业商品端点 → 403（recruiter 门）', r.status === 403);
  // C 端红冲回归（全桶 FIFO 语义零弱化）：userA 有 paid 桶（harness 种子 5.00）→ paid 单退款可红冲
  r = await h.post('/commerce/orders', h.U('userA'), { productId: 'pack_10', channel: 'online' });
  const caOrder = r.body?.orderId as string;
  const caTxn = `c-refund-${caOrder}`;
  await h.post(`/commerce/webhook/pay/${caOrder}`, {}, payBody(caOrder, caTxn));
  const uaPaidBefore = Number((await pool.query(`SELECT coalesce(sum(units_total),0) AS s FROM entitlement_bucket WHERE owner_user_id='userA' AND kind='paid'`)).rows[0]?.s);
  const caRefundTxn = `cr-${caOrder}`;
  r = await h.post(`/commerce/webhook/refund/${caOrder}`, {}, payBody(caOrder, caRefundTxn, 'refunded'));
  const uaPaidAfter = Number((await pool.query(`SELECT coalesce(sum(units_total),0) AS s FROM entitlement_bucket WHERE owner_user_id='userA' AND kind='paid'`)).rows[0]?.s);
  A('S1-5f C 端红冲语义回归（paid 桶 -10·无过滤路径零弱化）', r.status === 200 && r.body?.result === 'refunded' && Math.abs(uaPaidAfter - (uaPaidBefore - 10)) < 1e-9);

  await done();
})()
  .catch(async (e: unknown) => {
    console.error('PROVE-ABORT（红即停·手上报协调方·Ban retry-to-green）', e);
    process.exit(1);
  })
  .then(async () => {
    try { await adminPool?.end(); } catch { /* ignore */ }
  });
