import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { boot, paySig } from './_neg-harness';

/**
 * uc-e2e-011-refund-callback-adv.proof.ts — GAP-UC011-ADV-01 · 主口 `POST /payment/refund-callback`
 * 真接线 ADV 七类真证据（Line V · coding+prove）。
 *
 * 需求源（口径以此为准，不发明验收标准）：
 *  - e2e-scenarios.md UC-E2E-011：E3 退款幂等(:248) · 验收 A3「重复退款回调仅退一次」(:251) ·
 *    契约 `POST /payment/refund-callback`、`GET /wallet`(:253) · TC-E2E-011-refund-idem(:258)。
 *  - harness/gap-uc011-adv-main-mouth-wiring.md：ADV 七类注入表 A1–A7 + 新鲜 INV + Z mouth 回归硬门槛。
 *  - UC014 先例 `gap-uc014-026-adv-webhook-nhp.md`：七类 C1–C7 口径 + 审计 residual disclosed-not-blocking。
 *
 * 产品事实基线（读真实代码得出，断言即据此）：
 *  - 主口：`POST /payment/refund-callback`（payment-callback.controller.ts · `@Controller('payment')` +
 *    `@Post('refund-callback')` · 无登录态不挂 PrincipalGuard）→ 委托同一 `CommerceService.refundWebhook`
 *    单管道（commerce.service.ts:79-93）：400 `invalid_callback` → HMAC `${id}:${txn}:refunded` +
 *    `timingSafeEqual` 密钥缺失 fail-closed 403 `bad_signature` → owner 经无表权限网关
 *    `gateway_payment_order_owner`（不信调用方）→ 404 `order_not_found` → exactly-once CAS
 *    `markOrderRefunded`（packages/db/src/payment.ts:104：paid→refunded CAS + `refund_provider_txn`
 *    partial UNIQUE + 23505→conflict + FIFO 红冲，不足回滚不半退）→ 409 `order_conflict` /
 *    200 `{result: refunded|already}`。
 *  - 主口 body 白名单 `{orderId, providerTxn, sig}`（controller 只读三字段并只传三字段——额外字段
 *    结构性忽略，无金额通道）；Path A mouth `POST /commerce/webhook/refund/:id`（Z 线，不回退）共用同一管道。
 *
 * EXIT 契约（诚实失败路径）：
 *  - EXIT 0 ⇔ A1–A7 每类断言全绿（exact HTTP status + named code + DB before/after 快照）+ 新鲜 INV 全绿
 *    + 跨入口一致性（model-op C-1）全绿 + Z mouth 回归（`uc-e2e-011-refund-callback-mouth.proof.ts`，
 *    Line Z 冻结文件原样运行）EXIT 0。
 *  - EXIT 0 ≠ covered ≠ ADV 翻行 ≠ 关 GAP-UC011-ADV-01 ≠ §1.1 covered；coveredCount=8 不动。
 *  - 任一做不出 → EXIT 1 诚实保留（打印 GAP-UC011-ADV-01 明细：哪类哪断言未证）· attempts 全记录
 *    · Ban retry-to-green · Ban 把 EXIT1 说成 flake/环境问题。
 *
 * 审计观察点（K/UC014 口径 disclosed-not-blocking）：拒绝类打印 AUDIT-OBSERVATION absent|observed +
 * file:line 依据；缺席不作 EXIT 门槛；Ban 假称审计已接。
 *
 * DISCLOSED（A3 口径，沿 UC014 C3 裁决）：显式服务端金额复核比较路径今天不存在；当前保障=结构性
 * （body 白名单无金额通道 + 服务器权威 units 红冲）；Ban 改口「已实现金额复核」。
 *
 * 隔离：scripts/run-e2e-isolated.mjs 三层包装（root uc011:refund-callback-adv:prove → :raw →
 * apps/api prove:uc011-refund-callback-adv）；随机容器 + 动态端口；零 live 模型；
 * PAY_PROVIDER_SECRET 只经隔离壳/进程环境（boot() 内 process.env 注入），不入树不入 receipt。
 * releaseEvidence=false · NOT_HA。
 */

const MAIN = '/payment/refund-callback';
const PATH_A = (id: string) => `/commerce/webhook/refund/${id}`;
const GAP_ID = 'GAP-UC011-ADV-01';
const CMD = 'pnpm uc011:refund-callback-adv:prove';

type Cls = 'INV' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'X' | 'ZREG';
const CLASSES: Cls[] = ['INV', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'X', 'ZREG'];

let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) { failures.push({ cls, name }); console.log(`FAIL  [${cls}] ${name}`); }
  else console.log(`PASS  [${cls}] ${name}`);
};

/** 审计观察点运行时交叉核验：主口 + 管道产品路径是否存在 GuardrailHit/安全日志/审计落库 emit 点。 */
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
function auditObservationBasis(): { absent: boolean; hits: number; files: string[] } {
  const files = [
    '../src/modules/commerce/payment-callback.controller.ts',
    '../src/modules/commerce/commerce.service.ts',
    '../src/modules/commerce/commerce-webhook.controller.ts',
  ];
  let hits = 0;
  for (const f of files) {
    const src = readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');
    hits += (src.match(/GuardrailHit|audit[_-]?log|security[_-]?log/g) ?? []).length;
  }
  return { absent: hits === 0, hits, files };
}
const auditBasis = auditObservationBasis();
const AUDIT_LINE = (cls: string) =>
  console.log(
    `AUDIT-OBSERVATION: ${auditBasis.absent ? 'absent' : 'observed'} class=${cls} ` +
    `basis=payment-callback.controller.ts + commerce.service.ts:79-93 + commerce-webhook.controller.ts ` +
    `(runtime scan of refund product path: ${auditBasis.hits} GuardrailHit/audit-log/security-log emit points) — ` +
    `disclosed-not-blocking，非 EXIT 门槛；缺席作具名 residual「审计后置未接线」带进 post-prove dual。`,
  );

/** Z mouth 回归：原样运行 Line Z 冻结 proof（Ban 改其断言；此处只运行 + 取 EXIT 作合取项）。 */
function runZMouthRegression(): Promise<number> {
  const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
  const apiDir = join(repoRoot, 'apps/api');
  // 与注册脚本 prove:uc011-refund-callback-mouth 逐字同命令（node --import @swc-node/register/esm-register …），
  // cwd=apps/api · 环境继承（同一隔离容器 DB · PAY_PROVIDER_SECRET 只经进程环境）。
  return new Promise((resolve) => {
    console.log(`ZREG: 原样运行 Line Z 冻结 proof（test/uc-e2e-011-refund-callback-mouth.proof.ts · 断言零改动）…`);
    const child = spawn(
      process.execPath,
      ['--import', '@swc-node/register/esm-register', 'test/uc-e2e-011-refund-callback-mouth.proof.ts'],
      { cwd: apiDir, stdio: 'inherit', env: process.env },
    );
    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', (e) => { console.error(`ZREG spawn error（计 EXIT 1 · 非 flake 洗白）:`, e); resolve(1); });
  });
}

(async () => {
  const h = await boot();
  const pool = h.pool;

  // ── DB 快照/终态工具（特权 pool 直查，绕 RLS；只读）──
  const orderRow = async (id: string) =>
    (await pool.query(
      'SELECT id, owner_user_id, status, units, amount_cents, provider_txn, refund_provider_txn FROM payment_order WHERE id=$1', [id],
    )).rows[0] ?? null;
  const bucketCount = async (owner: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].n);
  const bucketSum = async (owner: string) =>
    Number((await pool.query('SELECT COALESCE(SUM(units_total),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1', [owner])).rows[0].s);
  const availSum = async (owner: string) =>
    Number((await pool.query(
      `SELECT COALESCE(SUM(units_total - units_reserved - units_consumed),0)::float8 s
         FROM entitlement_bucket WHERE owner_user_id=$1`, [owner],
    )).rows[0].s);
  const refundTxnRows = async (txn: string) =>
    Number((await pool.query('SELECT count(*)::int n FROM payment_order WHERE refund_provider_txn=$1', [txn])).rows[0].n);
  const snap = async (owner: string) => ({ buckets: await bucketCount(owner), sum: await bucketSum(owner), avail: await availSum(owner) });
  const eqSnap = (a: any, b: any) => a.buckets === b.buckets && a.sum === b.sum && a.avail === b.avail;
  // 主口 sig：HMAC 载荷仍绑定订单 id（`${orderId}:${txn}:refunded`）——签名↔订单绑定不弱化
  const sig = (orderId: string, txn: string) => paySig(`${orderId}:${txn}:refunded`);
  const mainBody = (orderId: string, txn: string) => ({ orderId, providerTxn: txn, sig: sig(orderId, txn) });
  const paBody = (orderId: string, txn: string) => ({ providerTxn: txn, sig: sig(orderId, txn) });

  // ── 隔离 fixtures：paid 单 + 已入账未消耗额度桶（红冲前置）；每类独立 owner，增量可精确断言 ──
  const F = {
    inv: { ord: 'RFADV_INV', owner: 'rfadvInv', payTxn: 'rfadvInvPay', units: 10 },
    a1: { ord: 'RFADV_A1', owner: 'rfadvA1', payTxn: 'rfadvA1Pay', units: 10 },
    a3: { ord: 'RFADV_A3', owner: 'rfadvA3', payTxn: 'rfadvA3Pay', units: 10 },
    a4: { ord: 'RFADV_A4', owner: 'rfadvA4', payTxn: 'rfadvA4Pay', units: 10 },
    a5a: { ord: 'RFADV_A5A', owner: 'rfadvA5A', payTxn: 'rfadvA5APay', units: 10 },
    a5b: { ord: 'RFADV_A5B', owner: 'rfadvA5B', payTxn: 'rfadvA5BPay', units: 10 },
    a6: { ord: 'RFADV_A6', owner: 'rfadvA6', payTxn: 'rfadvA6Pay', units: 10 },
    a7: { ord: 'RFADV_A7', owner: 'rfadvA7', payTxn: 'rfadvA7Pay', units: 10 },
    xa: { ord: 'RFADV_XA', owner: 'rfadvXA', payTxn: 'rfadvXAPay', units: 10 },
    xb: { ord: 'RFADV_XB', owner: 'rfadvXB', payTxn: 'rfadvXBPay', units: 10 },
  } as const;
  await pool.query(
    `INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status,provider_txn) VALUES
       ('RFADV_INV','rfadvInv','pack_10',9900,10,'paid','rfadvInvPay'),
       ('RFADV_A1','rfadvA1','pack_10',9900,10,'paid','rfadvA1Pay'),
       ('RFADV_A3','rfadvA3','pack_10',9900,10,'paid','rfadvA3Pay'),
       ('RFADV_A4','rfadvA4','pack_10',9900,10,'paid','rfadvA4Pay'),
       ('RFADV_A5A','rfadvA5A','pack_10',9900,10,'paid','rfadvA5APay'),
       ('RFADV_A5B','rfadvA5B','pack_10',9900,10,'paid','rfadvA5BPay'),
       ('RFADV_A6','rfadvA6','pack_10',9900,10,'paid','rfadvA6Pay'),
       ('RFADV_A7','rfadvA7','pack_10',9900,10,'paid','rfadvA7Pay'),
       ('RFADV_XA','rfadvXA','pack_10',9900,10,'paid','rfadvXAPay'),
       ('RFADV_XB','rfadvXB','pack_10',9900,10,'paid','rfadvXBPay')`);
  for (const x of Object.values(F)) {
    await pool.query(
      `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
       VALUES ($1,'paid',$2, now()+interval '365 days')`,
      [x.owner, x.units]);
  }

  console.log('PINS: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · UC-011 stays partial · ADV stays gap/case-only · GAP-UC011-ADV-01 stays OPEN');
  console.log(`CMD=${CMD}`);
  console.log('MOUTH(main): POST /payment/refund-callback（scenarios :253 字面契约 · body 白名单 {orderId,providerTxn,sig}）');
  console.log('MOUTH(pathA): POST /commerce/webhook/refund/:id（Line Z · 共用同一 refundWebhook 管道 · 不回退）');
  console.log('EXIT 契约: EXIT 0 ⇔ A1–A7 + 新鲜 INV + 跨入口一致性 + Z mouth 回归 EXIT 0（合取）。EXIT0 ≠ covered ≠ 翻行。');
  console.log('DISCLOSED: 显式服务端金额复核比较路径今天不存在；当前保障=结构性（body 白名单无金额通道 + 服务器权威 units 红冲）。Ban 改口「已实现金额复核」。');

  // ════════════════════════════════════════════════════════════════════════
  // INV · 新鲜 INV（取代过时 old-INV 作证据 · 不改 Line V/Z 历史文件）：
  //   主口已挂载（非 404）· scenarios 字面路径 · 管道存在 · 薄适配（无复制守卫）· 注册形态钉死
  // ════════════════════════════════════════════════════════════════════════
  {
    const ctrlPath = fileURLToPath(new URL('../src/modules/commerce/payment-callback.controller.ts', import.meta.url));
    const svcPath = fileURLToPath(new URL('../src/modules/commerce/commerce.service.ts', import.meta.url));
    const modPath = fileURLToPath(new URL('../src/app.module.ts', import.meta.url));
    const payPath = fileURLToPath(new URL('../../../packages/db/src/payment.ts', import.meta.url));
    const ctrlSrc = readFileSync(ctrlPath, 'utf8');
    const svcSrc = readFileSync(svcPath, 'utf8');
    const modSrc = readFileSync(modPath, 'utf8');
    const paySrc = readFileSync(payPath, 'utf8');

    // 管道存在：service refundWebhook + db markOrderRefunded（单管道，未复制）
    A('INV', '管道存在: commerce.service.ts 含 refundWebhook（单管道 · 全链路 400/403/404/CAS/409/200 只此一份）',
      svcSrc.includes('async refundWebhook'));
    A('INV', '管道存在: packages/db/src/payment.ts 含 markOrderRefunded（CAS + 红冲语义在树）',
      paySrc.includes('export async function markOrderRefunded'));
    // 薄适配：controller 委托 refundWebhook；Ban 复制第二套 HMAC/owner/CAS（Ban 业务逻辑）
    A('INV', '薄适配: payment-callback.controller.ts 委托 refundWebhook（单管道 · 无第二套守卫）',
      ctrlSrc.includes('refundWebhook'));
    A('INV', 'Ban 复制守卫: controller 无 createHmac/timingSafeEqual/gateway_payment_order_owner/markOrderRefunded',
      !ctrlSrc.includes('createHmac') && !ctrlSrc.includes('timingSafeEqual') &&
      !ctrlSrc.includes('gateway_payment_order_owner') && !ctrlSrc.includes('markOrderRefunded'));
    A('INV', 'Ban 金额通道: controller 代码面（剥注释后）无 amount 形字段引用（白名单结构性）',
      !/amount/i.test(stripComments(ctrlSrc)));
    // 注册形态钉死（C-V4）：独立文件 + app.module controllers 注册（既有控制器顺序未变）
    A('INV', '注册形态: 独立文件 payment-callback.controller.ts + app.module.ts 注册 PaymentCallbackController',
      modSrc.includes('PaymentCallbackController') && modSrc.includes("from './modules/commerce/payment-callback.controller'"));
    // 运行时挂载：合法单 + 垃圾 sig → 403（≠ 404）→ 主口已挂载（口存在 ≠ Fastify 兜底 404）
    const probe = await h.post(MAIN, {}, { orderId: F.a1.ord, providerTxn: 'invProbeTxn', sig: 'zz' });
    A('INV', '主口已挂载(非 404): 合法单垃圾签 → 403 bad_signature（≠ 口缺失裸 404）',
      probe.status === 403 && probe.body?.error === 'bad_signature');
    AUDIT_LINE('INV');
  }

  // ════════════════════════════════════════════════════════════════════════
  // A1 伪造签名（主口）→ 403 bad_signature + 零副作用
  // ════════════════════════════════════════════════════════════════════════
  {
    const { ord, owner } = F.a1;
    const txn = 'rfadvA1Txn';
    const before = { order: await orderRow(ord), s: await snap(owner) };
    // 错签：等长 hex（对无关字符串算的 HMAC）→ 内容不符
    const r1 = await h.post(MAIN, {}, { orderId: ord, providerTxn: txn, sig: paySig('forged-unrelated-string') });
    A('A1', '伪造签名(等长 hex) → 403 bad_signature', r1.status === 403 && r1.body?.error === 'bad_signature');
    // 垃圾短 sig → 长度不符分支 fail-closed
    const r2 = await h.post(MAIN, {}, { orderId: ord, providerTxn: txn, sig: 'zz' });
    A('A1', '垃圾短签名 → 403 bad_signature', r2.status === 403 && r2.body?.error === 'bad_signature');
    // 签名绑定他单（本单 id 不在签名原文里）→ 403（签名↔订单绑定）
    const r3 = await h.post(MAIN, {}, { orderId: ord, providerTxn: txn, sig: sig('RFADV_A1_OTHER', txn) });
    A('A1', '他单签名打到本单 → 403 bad_signature（HMAC 载荷绑定 orderId）', r3.status === 403 && r3.body?.error === 'bad_signature');
    // paid 标签签名打到 refund 主口 → 403（标签必须 refunded）
    const r4 = await h.post(MAIN, {}, { orderId: ord, providerTxn: txn, sig: paySig(`${ord}:${txn}:paid`) });
    A('A1', 'pay 标签签名打到 refund 主口 → 403 bad_signature', r4.status === 403 && r4.body?.error === 'bad_signature');
    A('A1', '具名码=bad_signature（Ban any-non-404-4xx-as-sig-evidence）',
      [r1, r2, r3, r4].every((r) => r.status === 403 && r.body?.error === 'bad_signature'));
    // 零副作用 DB 快照
    const after = { order: await orderRow(ord), s: await snap(owner) };
    A('A1', '零副作用: status 仍 paid · refund_provider_txn NULL',
      after.order?.status === 'paid' && after.order?.refund_provider_txn === null);
    A('A1', '零副作用: 桶/可用额度快照不变', eqSnap(before.s, after.s));
    A('A1', '零副作用: refund_provider_txn 全局 0 行', (await refundTxnRows(txn)) === 0);
    AUDIT_LINE('A1');
  }

  // ════════════════════════════════════════════════════════════════════════
  // A2 缺字段（主口 · C-V1 逐字段）→ 400 invalid_callback + 零副作用
  //   前置顺序：400 缺字段判定先于 HMAC（缺 orderId/缺 sig 不得 403）
  // ════════════════════════════════════════════════════════════════════════
  {
    const { ord, owner } = F.inv;
    const before = { order: await orderRow(ord), s: await snap(owner) };
    const r1 = await h.post(MAIN, {}, {});
    A('A2', '空 body → 400 invalid_callback', r1.status === 400 && r1.body?.error === 'invalid_callback');
    const r2 = await h.post(MAIN, {}, { providerTxn: 'rfadvInvTxn', sig: sig(ord, 'rfadvInvTxn') });
    A('A2', '缺 orderId（有 txn+sig）→ 400 invalid_callback（非 403 · 400 判定先于 HMAC）',
      r2.status === 400 && r2.body?.error === 'invalid_callback');
    const r3 = await h.post(MAIN, {}, { orderId: ord });
    A('A2', '缺 providerTxn → 400 invalid_callback', r3.status === 400 && r3.body?.error === 'invalid_callback');
    const r4 = await h.post(MAIN, {}, { orderId: ord, providerTxn: 'rfadvInvTxn' });
    A('A2', '缺 sig → 400 invalid_callback', r4.status === 400 && r4.body?.error === 'invalid_callback');
    const r5 = await h.post(MAIN, {}, { sig: sig(ord, 'rfadvInvTxn') });
    A('A2', '仅 sig（缺 orderId+providerTxn）→ 400 invalid_callback', r5.status === 400 && r5.body?.error === 'invalid_callback');
    A('A2', '具名码=invalid_callback 逐字段一致（C-V1 body 契约 {orderId,providerTxn,sig}）',
      [r1, r2, r3, r4, r5].every((r) => r.status === 400 && r.body?.error === 'invalid_callback'));
    const after = { order: await orderRow(ord), s: await snap(owner) };
    A('A2', '零副作用: status 仍 paid · refund_provider_txn NULL',
      after.order?.status === 'paid' && after.order?.refund_provider_txn === null);
    A('A2', '零副作用: 桶/可用额度快照不变', eqSnap(before.s, after.s));
    A('A2', '零副作用: refund_provider_txn 全局 0 行', (await refundTxnRows('rfadvInvTxn')) === 0);
    AUDIT_LINE('A2');
  }

  // ════════════════════════════════════════════════════════════════════════
  // A3 夹带金额（主口 · 结构断言 · DISCLOSED）：无金额通道，夹带字段被忽略，
  //     红冲单位恒等于服务器权威 units（pack_10=10）。Ban 改口「已实现金额复核」。
  // ════════════════════════════════════════════════════════════════════════
  {
    console.log('DISCLOSED: 依据 payment-callback.controller.ts（body 白名单仅 {orderId,providerTxn,sig}，只传三字段）+');
    console.log('DISCLOSED: commerce.service.ts:79（refundWebhook 回调体类型仅 {providerTxn,sig}）+ payment.ts:104（红冲=订单权威 units）；主口路径无任何金额读取。');
    const { ord, owner } = F.a3;
    const txn = 'rfadvA3Txn';
    const before = await snap(owner);
    // 夹带 amountCents=1 / units=999999 / refundAmount=-500 / amount=1e9 → 全部结构性忽略（白名单丢弃）
    const r1 = await h.post(MAIN, {}, {
      ...mainBody(ord, txn), amountCents: 1, units: 999999, refundAmount: -500, amount: 1000000000,
    });
    A('A3', '夹带 amountCents/units/refundAmount/amount → 字段被忽略, 200 refunded', r1.status === 200 && r1.body?.result === 'refunded');
    A('A3', '红冲单位恒等于服务器权威 units=10（夹带 999999/-500 未入通道）', (await availSum(owner)) === before.avail - 10);
    A('A3', '订单落库 units/amount_cents 仍权威 10/9900（夹带值未落库）',
      Number((await orderRow(ord))?.units) === 10 && Number((await orderRow(ord))?.amount_cents) === 9900);
    A('A3', '终态 refunded + refund_provider_txn 落库',
      (await orderRow(ord))?.status === 'refunded' && (await orderRow(ord))?.refund_provider_txn === txn);
    A('A3', '结构性单退: refund_provider_txn 全局恰 1 行', (await refundTxnRows(txn)) === 1);
    A('A3', '桶计数不变（红冲写原桶 units_total，不新建桶）', (await bucketCount(owner)) === before.buckets);
    AUDIT_LINE('A3');
  }

  // ════════════════════════════════════════════════════════════════════════
  // A4 同单同 txn 顺序重放（主口）→ 首 200 {result:'refunded'} / 次 200 {result:'already'}；
  //     无双退：红冲恰一次、桶快照二致、refund_provider_txn 恰 1 行（C-V2 DB 快照）
  // ════════════════════════════════════════════════════════════════════════
  {
    const { ord, owner } = F.a4;
    const txn = 'rfadvA4Txn';
    const before = await snap(owner);
    console.log(`SNAPSHOT A4 before: ${JSON.stringify({ ...before, order: (await orderRow(ord))?.status })}`);
    const w1 = await h.post(MAIN, {}, mainBody(ord, txn));
    const mid = await snap(owner);
    console.log(`SNAPSHOT A4 after-first: ${JSON.stringify({ ...mid, order: (await orderRow(ord))?.status })}`);
    const w2 = await h.post(MAIN, {}, mainBody(ord, txn));
    const after = await snap(owner);
    console.log(`SNAPSHOT A4 after-replay: ${JSON.stringify({ ...after, order: (await orderRow(ord))?.status })}`);
    A('A4', '首次回调 → 200 {result: refunded}', w1.status === 200 && w1.body?.result === 'refunded');
    A('A4', '同单同 txn 重放 → 200 {result: already}（幂等去重，不双退）', w2.status === 200 && w2.body?.result === 'already');
    A('A4', '无双退: 红冲恰一次（before→mid avail −10，mid→after 快照二致）',
      mid.avail === before.avail - 10 && eqSnap(mid, after));
    A('A4', '无双退: units_total 合计恰 −10 一次', mid.sum === before.sum - 10 && after.sum === mid.sum);
    A('A4', 'refund_provider_txn 全局恰 1 行（C-V2）', (await refundTxnRows(txn)) === 1);
    const o = await orderRow(ord);
    A('A4', '终态: status=refunded 且 refund_provider_txn=注入 txn', o?.status === 'refunded' && o?.refund_provider_txn === txn);
  }

  // ════════════════════════════════════════════════════════════════════════
  // A5 跨订单 409（主口）：同 providerTxn 打两张不同订单 → 恰一单 refunded；
  //     另一单 409 order_conflict（非 5xx）；refund_provider_txn 恰 1 行；两账户合计红冲恰一份
  // ════════════════════════════════════════════════════════════════════════
  {
    const txn = 'rfadvA5Txn';
    const { ord: ordA, owner: ownerA } = F.a5a;
    const { ord: ordB, owner: ownerB } = F.a5b;
    const beforeB = await snap(ownerB);
    const w1 = await h.post(MAIN, {}, mainBody(ordA, txn));
    const w2 = await h.post(MAIN, {}, mainBody(ordB, txn));   // 同流水重放指向第二张订单
    A('A5', '第一张订单 → 200 {result: refunded}', w1.status === 200 && w1.body?.result === 'refunded');
    A('A5', '跨订单重放 → 409 order_conflict（非 5xx）', w2.status === 409 && w2.body?.error === 'order_conflict');
    A('A5', 'refund_provider_txn 全局恰 1 行', (await refundTxnRows(txn)) === 1);
    const rowA = await orderRow(ordA);
    const rowB = await orderRow(ordB);
    A('A5', '唯一流水归属第一张订单（B 仍 paid + refund_provider_txn NULL）',
      rowA?.status === 'refunded' && rowA?.refund_provider_txn === txn && rowB?.status === 'paid' && rowB?.refund_provider_txn === null);
    A('A5', '两账户合计红冲恰一份: A avail −10 · B 快照不变', (await availSum(ownerA)) === 0 && eqSnap(beforeB, await snap(ownerB)));
    // 为 X1 409 一致性留 Stimulus：同 txn 经 Path A 打 B 仍 409（在 X 段断言）
  }

  // ════════════════════════════════════════════════════════════════════════
  // A6 并发恰一次（主口）：并发同单同 txn 双回调 → 恰一次红冲、无双退、无 stuck
  // ════════════════════════════════════════════════════════════════════════
  {
    const { ord, owner } = F.a6;
    const txn = 'rfadvA6Txn';
    const before = await snap(owner);
    console.log(`SNAPSHOT A6 before: ${JSON.stringify({ ...before, order: (await orderRow(ord))?.status })}`);
    const body = mainBody(ord, txn);
    const rs = await Promise.all([h.post(MAIN, {}, body), h.post(MAIN, {}, body)]);
    A('A6', '并发双回调 → 无 5xx（都 200）', rs.every((r) => r.status === 200));
    A('A6', '恰一个 refunded（CAS 裁决，不双退）', rs.map((r) => r.body?.result).filter((x) => x === 'refunded').length === 1);
    A('A6', '另一个为 already（幂等收敛）', rs.map((r) => r.body?.result).filter((x) => x === 'already').length === 1);
    const after = await snap(owner);
    console.log(`SNAPSHOT A6 after: ${JSON.stringify({ ...after, order: (await orderRow(ord))?.status })}`);
    // 无 stuck → 具名 DB 终态断言：双回调完成后订单终态唯一确定
    const o = await orderRow(ord);
    A('A6', '无 stuck 终态: payment_order.status=refunded', o?.status === 'refunded');
    A('A6', '无 stuck 终态: refund_provider_txn=注入 txn', o?.refund_provider_txn === txn);
    A('A6', '无 stuck 终态: 红冲恰一次 avail −10（before→after）', after.avail === before.avail - 10);
    A('A6', '无 stuck 终态: refund_provider_txn 全局恰 1 行（无双行 · C-V2）', (await refundTxnRows(txn)) === 1);
  }

  // ════════════════════════════════════════════════════════════════════════
  // A7 未知单 / 冒充 owner（主口）→ 404 order_not_found（具名 body · ≠ mouth-missing 404 · C-V3）；
  //     签名再对也不入账；owner 不可伪造（owner-gateway 不信调用方 + 白名单丢额外字段）
  // ════════════════════════════════════════════════════════════════════════
  {
    // a7-ghost: 未知订单（签名对该不存在 id）→ 404 + 具名 order_not_found
    const ghost = 'RFADV_GHOST_' + randomUUID();
    const ghostTxn = 'rfadvGhostTxn';
    const r1 = await h.post(MAIN, {}, mainBody(ghost, ghostTxn));
    A('A7', '未知订单(合法签名) → 404 order_not_found', r1.status === 404 && r1.body?.error === 'order_not_found');
    // C-V3：404 order_not_found 与 mouth-missing 404 走具名响应体区分，不得只断 status
    const bogus = await h.post('/payment/definitely-not-a-mouth', {}, mainBody(ghost, ghostTxn));
    A('A7', '命名区分(具名 body): 真口未知单 404.body.error=order_not_found · 缺失口 404 无此具名码',
      r1.body?.error === 'order_not_found' && bogus.status === 404 && bogus.body?.error !== 'order_not_found');
    A('A7', '零副作用: 幽灵单不落库', (await orderRow(ghost)) === null);
    A('A7', '零副作用: refund_provider_txn 全局 0 行', (await refundTxnRows(ghostTxn)) === 0);
    A('A7', '零副作用: 幽灵 owner 无桶', (await bucketCount('rfadvGhostOwner')) === 0);
    // a7-owner: body 夹带 owner 冒充（想把红冲/归属导向攻击者）→ owner 只信 DB 网关 + 白名单丢字段
    const { ord, owner } = F.a7;
    const before = await snap(owner);
    const r2 = await h.post(MAIN, {}, {
      ...mainBody(ord, 'rfadvA7Txn'), owner: 'rfadvAttacker', owner_user_id: 'rfadvAttacker',
    });
    A('A7', 'body 夹带 owner 冒充 → 200 refunded（冒充字段被白名单丢弃）', r2.status === 200 && r2.body?.result === 'refunded');
    A('A7', '攻击者 rfadvAttacker 0 桶（owner 不可伪造）',
      (await bucketCount('rfadvAttacker')) === 0 && (await bucketSum('rfadvAttacker')) === 0);
    A('A7', '真 owner 红冲恰一次: avail −10', (await availSum(owner)) === before.avail - 10);
    const o = await orderRow(ord);
    A('A7', '终态: 订单 refunded 且归属真 owner（owner_user_id 不变）',
      o?.status === 'refunded' && o?.refund_provider_txn === 'rfadvA7Txn' && o?.owner_user_id === owner);
    AUDIT_LINE('A7');
  }

  // ════════════════════════════════════════════════════════════════════════
  // X · 跨入口一致性（model-op C-1）：同刺激主口 vs Path A 具名码逐项一致
  //     + 跨入口重放（≥1 · 双方向）：首退经任一入口、重放经另一入口 → already + 红冲恰一次
  // ════════════════════════════════════════════════════════════════════════
  {
    // X1 同刺激具名码一致：400 / 403 / 404 / 409
    const eM = await h.post(MAIN, {}, {});
    const eP = await h.post(PATH_A(F.inv.ord), {}, {});
    A('X', '同刺激一致: 空 body → 主口 400 invalid_callback = Path A 400 invalid_callback',
      eM.status === 400 && eM.body?.error === 'invalid_callback' && eP.status === 400 && eP.body?.error === 'invalid_callback');
    const gM = await h.post(MAIN, {}, { orderId: F.a1.ord, providerTxn: 'rfadvX1Txn', sig: 'zz' });
    const gP = await h.post(PATH_A(F.a1.ord), {}, { providerTxn: 'rfadvX1Txn', sig: 'zz' });
    A('X', '同刺激一致: 垃圾签 → 主口 403 bad_signature = Path A 403 bad_signature',
      gM.status === 403 && gM.body?.error === 'bad_signature' && gP.status === 403 && gP.body?.error === 'bad_signature');
    const ghost = 'RFADV_X1_GHOST_' + randomUUID();
    const nM = await h.post(MAIN, {}, mainBody(ghost, 'rfadvX1GhostTxn'));
    const nP = await h.post(PATH_A(ghost), {}, paBody(ghost, 'rfadvX1GhostTxn'));
    A('X', '同刺激一致: 未知单 → 主口 404 order_not_found = Path A 404 order_not_found',
      nM.status === 404 && nM.body?.error === 'order_not_found' && nP.status === 404 && nP.body?.error === 'order_not_found');
    const cP = await h.post(PATH_A(F.a5b.ord), {}, paBody(F.a5b.ord, 'rfadvA5Txn'));
    A('X', '同刺激一致: 跨单同流水 → 主口 409 order_conflict = Path A 409 order_conflict（同一 CAS 键）',
      cP.status === 409 && cP.body?.error === 'order_conflict');

    // X2 跨入口重放 dir1：首退经 Path A → 重放经主口 → already + 红冲恰一次
    {
      const { ord, owner } = F.xa;
      const txn = 'rfadvXATxn';
      const before = await snap(owner);
      const w1 = await h.post(PATH_A(ord), {}, paBody(ord, txn));
      const w2 = await h.post(MAIN, {}, mainBody(ord, txn));
      A('X', '跨口重放 dir1: Path A 首退 → 200 refunded', w1.status === 200 && w1.body?.result === 'refunded');
      A('X', '跨口重放 dir1: 主口重放同单同 txn → 200 already（单管道 CAS 收敛）', w2.status === 200 && w2.body?.result === 'already');
      A('X', '跨口重放 dir1: 红冲恰一次 avail −10 · txn 全局恰 1 行',
        (await availSum(owner)) === before.avail - 10 && (await refundTxnRows(txn)) === 1);
    }
    // X2 跨入口重放 dir2：首退经主口 → 重放经 Path A → already + 红冲恰一次
    {
      const { ord, owner } = F.xb;
      const txn = 'rfadvXBTxn';
      const before = await snap(owner);
      const w1 = await h.post(MAIN, {}, mainBody(ord, txn));
      const w2 = await h.post(PATH_A(ord), {}, paBody(ord, txn));
      A('X', '跨口重放 dir2: 主口首退 → 200 refunded', w1.status === 200 && w1.body?.result === 'refunded');
      A('X', '跨口重放 dir2: Path A 重放同单同 txn → 200 already（单管道 CAS 收敛）', w2.status === 200 && w2.body?.result === 'already');
      A('X', '跨口重放 dir2: 红冲恰一次 avail −10 · txn 全局恰 1 行',
        (await availSum(owner)) === before.avail - 10 && (await refundTxnRows(txn)) === 1);
    }
  }

  // ── Z mouth 回归（EXIT0 必要合取项 · Line Z 冻结 proof 原样运行 · Ban 改其断言）──
  // 放最后：子进程 boot() 会重建 schema（不影响本 proof 已采集断言）
  const zExit = await runZMouthRegression();
  A('ZREG', `Z mouth 回归（pnpm uc011:refund-callback:prove 内层 proof）EXIT=0（实际 ${zExit}）`, zExit === 0);

  // ── EXIT 裁决 ──
  console.log(`\n断言合计: ${total} 条, 失败 ${failures.length} 条`);
  const byClass = Object.fromEntries(CLASSES.map((c) => [c, failures.filter((f) => f.cls === c).length]));
  for (const c of CLASSES) console.log(`  ${c}: ${byClass[c] === 0 ? 'ALL PASS' : `${byClass[c]} FAILED`}`);
  console.log('HONESTY: EXIT0 ≠ covered ≠ ADV 翻行 ≠ 关 GAP-UC011-ADV-01 ≠ §1.1 covered · coveredCount=8 不动 · UC-011 stays partial');
  console.log('HONESTY: Ban wash · Ban retry-to-green · attempts 全记录 · Line V honesty-of-red nail（79825b2）与 Line Z nail（244b812）历史保留原样');

  if (failures.length > 0) {
    console.log(`\n${GAP_ID} — 诚实保留 gap（EXIT 1 · 非 flake · 非环境问题 · Ban invent fix）:`);
    for (const f of failures) console.log(`  GAP-ITEM class=${f.cls} assertion="${f.name}"`);
    console.log('  依据: apps/api/src/modules/commerce/payment-callback.controller.ts · commerce.service.ts:79-93 · packages/db/src/payment.ts:104 · app.module.ts:38');
    console.log('  处置: row UC-E2E-011 stays partial · ADV stays gap/case-only · GAP-UC011-ADV-01 stays OPEN · attempts 台账记 EXIT=1。');
    process.exit(1);
  }
  console.log(`\nEXIT=0 — ${GAP_ID} 主口 ADV 七类（A1–A7）+ 新鲜 INV + 跨入口一致性 + Z mouth 回归 全部成立（${total} 条断言全绿）。`);
  console.log('主口=POST /payment/refund-callback（scenarios :253 字面）· 与 Path A 共用 refundWebhook 单管道 · EXIT 0 ≠ covered。');
  console.log('releaseEvidence=false · NOT_HA · PG-retained · public DELETE=503');
  process.exit(0);
})().catch((e) => {
  console.error(`${GAP_ID} harness 崩溃（EXIT 1 · 记入 attempts 台账 · 非 flake）:`, e);
  process.exit(1);
});
