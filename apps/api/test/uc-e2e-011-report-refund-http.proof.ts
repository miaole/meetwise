/**
 * UC-E2E-011 focused HTTP prove (eval-first · GET /commerce/entitlement 额度断言).
 *
 * Extends packages/db R1–R4 with HTTP entitlement mouth + honesty probes for
 * refund-callback / wallet / balance-ui product gaps.
 * Parallel §1b (H5): static inventory + 抬 covered prerequisites for implementing
 * refund-callback — EXIT=0 = honesty GAP only; never covered; no fake product mouth.
 *
 * Product mouths that EXIST:
 *   GET /commerce/entitlement → availableUnits (契约名 wallet 未落；本口钉额度)
 * Product mouths MISSING (honest GAP):
 *   POST /payment/refund-callback · GET /wallet · POST /commerce/webhook/refund/:id
 *   payment.ts has no confirmed→refunded / markOrderRefunded API
 *   apps/web/app/billing = preview stub（无余额 UI）
 *
 * Interview fail has no user HTTP mouth (worker failInterviewAndRelease only) —
 * mutations stay @meetwise/db; assertions use HTTP entitlement.
 *
 * Fixture note: `_neg-harness` does not load migration 0058. This prove installs a
 * **minimal** privacy-active stub so GET report / retry can run. Stub ≠ full fence covered.
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-011 covered
 * fixture via run-e2e-isolated → pgvector → green-risk / R5
 *
 *   pnpm uc011:report-refund:http:prove
 *   pnpm -C apps/api prove:uc011-report-refund-http   (raw; needs isolated DATABASE_URL)
 *
 * Matrix stays **partial**. Do NOT claim covered.
 */
import {
  asPrincipal, availableUnits, reserveEntitlement,
  completeInterviewAndConfirm, failInterviewAndRelease, releaseConsumption,
  enqueueReport, claimReport, markReportFailed, sweepReports, getReport,
  MAX_REPORT_ATTEMPTS,
} from '@meetwise/db';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { boot, mkAssert } from './_neg-harness';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../..');
function readRepo(rel: string): string {
  const p = resolve(repoRoot, rel);
  if (!existsSync(p)) throw new Error(`missing ${rel}`);
  return readFileSync(p, 'utf8');
}

const h = await boot();
const { A, done } = mkAssert('uc011:report-refund:http');

console.log('UC-E2E-011 report-refund HTTP prove · releaseEvidence=false · Not HA');
console.log('NOTE: 本绿≠全链路 E2E covered；≠ matrix covered；HTTP 额度口 + GAP probe；fixture=pgvector → green-risk/R5');
console.log('NOTE: D1 — 1 额度=一场面试；reserved→confirmed @ completed；报告失败默认不退');
console.log('NOTE: remaining→covered: refund-callback product · balance-ui · fail HTTP mouth · full.e2e · regenerate(UC-019)');

// Minimal privacy-active stubs (0058 not in _neg-harness). Owner match only; no erasure fence.
await h.pool.query(`
CREATE OR REPLACE FUNCTION interview_privacy_active(target_interview text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM interview i
     WHERE i.id = target_interview AND i.owner_user_id = principal
  );
END $$;
CREATE OR REPLACE FUNCTION assert_interview_privacy_active(target_interview text)
RETURNS void
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NOT interview_privacy_active(target_interview) THEN
    RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
  END IF;
END $$;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
`);
console.log('PIN   GAP-UC011-PRIVACY-STUB: minimal privacy-active stub (≠ 0058 fence covered)');

const A_ = h.U('userA');
const S = Date.now().toString(36);
const IID = (k: string) => `IV_H011_${k}_${S}`;

async function httpUnits(ownerHdr: Record<string, string>): Promise<number | undefined> {
  const r = await h.req('GET', '/commerce/entitlement', ownerHdr);
  if (r.status !== 200) return undefined;
  const u = r.body?.availableUnits;
  return typeof u === 'number' ? u : undefined;
}

async function consStatus(owner: string, key: string): Promise<string | undefined> {
  return asPrincipal(h.pool, owner, (c) => c.query(
    'SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, key],
  )).then((r) => r.rows[0]?.status as string | undefined);
}

async function ivStatus(id: string): Promise<string | undefined> {
  const r = await h.pool.query('SELECT status FROM interview WHERE id=$1', [id]);
  return r.rows[0]?.status as string | undefined;
}

/** Force report poison-pill → quarantined using db APIs only (no worker model). */
async function forceQuarantine(owner: string, interviewId: string, leaseOwner: string) {
  await asPrincipal(h.pool, owner, (c) => enqueueReport(c, owner, interviewId));
  for (let i = 0; i < MAX_REPORT_ATTEMPTS + 2; i++) {
    const claimed = await asPrincipal(h.pool, owner, (c) => claimReport(c, owner, leaseOwner));
    if (!claimed) break;
    await asPrincipal(h.pool, owner, (c) =>
      markReportFailed(c, owner, claimed.reportId, leaseOwner, 'uc011_http_injected_report_fail'));
    await asPrincipal(h.pool, owner, (c) => c.query(
      "UPDATE ai_report SET next_attempt_at = now() - interval '1 second' WHERE interview_id=$1 AND owner_user_id=$2 AND status='failed'",
      [interviewId, owner],
    ));
    await asPrincipal(h.pool, owner, (c) => sweepReports(c, owner));
  }
  return asPrincipal(h.pool, owner, (c) => getReport(c, owner, interviewId));
}

// ── H1 · interview fail → HTTP GET /commerce/entitlement 额度净变 0 ──
{
  console.log('\n──────── H1 · failInterviewAndRelease + HTTP entitlement 额度净变 0 ────────');
  const id = IID('h1');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active')",
    [id],
  );
  const before = await httpUnits(A_);
  A('H1 GET /commerce/entitlement → 200 有额度', typeof before === 'number' && before >= 1);
  const rsv = await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
  A('H1 reserve → reserved', rsv.status === 'reserved');
  const mid = await httpUnits(A_);
  A('H1 HTTP 预留后额度 -1', typeof mid === 'number' && typeof before === 'number' && mid === before - 1);

  const fr = await asPrincipal(h.pool, 'userA', (c) =>
    failInterviewAndRelease(c, 'userA', id));
  A('H1 failInterviewAndRelease → failed', fr.status === 'failed');
  A('H1 released=released', fr.released === 'released');
  A('H1 interview=failed', (await ivStatus(id)) === 'failed');
  A('H1 consumption=released', (await consStatus('userA', id)) === 'released');

  const after = await httpUnits(A_);
  A('H1 HTTP 额度净变 0（回补）', typeof after === 'number' && after === before);
  A('H1 HTTP 与 DB availableUnits 一致',
    after === (await asPrincipal(h.pool, 'userA', (c) => availableUnits(c, 'userA'))));

  // 二次 fail 幂等：HTTP 额度不双退
  const fr2 = await asPrincipal(h.pool, 'userA', (c) =>
    failInterviewAndRelease(c, 'userA', id));
  A('H1 二次 fail → already_failed+noop', fr2.status === 'already_failed' && fr2.released === 'noop');
  A('H1 二次后 HTTP 额度不变（不双退）', (await httpUnits(A_)) === after);
}

// ── H2 · report quarantine 后 HTTP 额度不退 + report/retry 口 ──
{
  console.log('\n──────── H2 · report quarantine 后 HTTP entitlement 不回补 ────────');
  const id = IID('h2');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active')",
    [id],
  );
  await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
  const afterReserve = await httpUnits(A_);
  A('H2 pre HTTP 有 reserved 后额度', typeof afterReserve === 'number');

  const doneIv = await asPrincipal(h.pool, 'userA', (c) =>
    completeInterviewAndConfirm(c, 'userA', id));
  A('H2 complete → completed', doneIv.status === 'completed');
  A('H2 consumption=confirmed', (await consStatus('userA', id)) === 'confirmed');
  const afterConfirm = await httpUnits(A_);
  A('H2 confirm 后 HTTP 额度仍 reserved 后值（consumed，非退回）', afterConfirm === afterReserve);

  const rep = await forceQuarantine('userA', id, `w-uc011-http-${S}`);
  A('H2 report → quarantined', rep?.status === 'quarantined');
  A('H2 interview 仍 completed', (await ivStatus(id)) === 'completed');
  A('H2 consumption 仍 confirmed', (await consStatus('userA', id)) === 'confirmed');
  A('H2 HTTP 额度不回补（报告失败不退）', (await httpUnits(A_)) === afterConfirm);

  const got = await h.req('GET', `/interview/${id}/report`, A_);
  A('H2 GET report → 200 quarantined',
    got.status === 200 && got.body?.status === 'quarantined');

  // regenerate 产品口：quarantined 上 requeueFailedReport 失败 → HTTP 404 no_retriable_report
  const retry = await h.post(`/interview/${id}/report/retry`, A_, {});
  A('H2 POST report/retry quarantined → 404 no_retriable_report（regenerate BLOCKED→UC-019）',
    retry.status === 404 && retry.body?.error === 'no_retriable_report');
}

// ── H3 · 误退：confirmed 上 release 拒 + HTTP 额度不变 ──
{
  console.log('\n──────── H3 · confirmed 上 release → already_confirmed；HTTP 额度不变 ────────');
  const id = IID('h3');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active')",
    [id],
  );
  await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
  await asPrincipal(h.pool, 'userA', (c) =>
    completeInterviewAndConfirm(c, 'userA', id));
  A('H3 pre confirmed', (await consStatus('userA', id)) === 'confirmed');
  const before = await httpUnits(A_);

  const rel = await asPrincipal(h.pool, 'userA', (c) =>
    releaseConsumption(c, 'userA', id));
  A('H3 release → error already_confirmed',
    rel.status === 'error' && (rel as { reason?: string }).reason === 'already_confirmed');
  A('H3 consumption 仍 confirmed', (await consStatus('userA', id)) === 'confirmed');
  A('H3 HTTP 额度未误退', (await httpUnits(A_)) === before);
  A('H3 interview 仍 completed', (await ivStatus(id)) === 'completed');
}

// ── H4 · honesty GAP：refund-callback / wallet / balance-ui 产品路径缺失 ──
{
  console.log('\n──────── H4 · honesty GAP pin：refund-callback / wallet / balance-ui ────────');

  // Probe demand-side contract mouths from e2e-scenarios.md
  const refundCb = await h.post('/payment/refund-callback', A_, { orderId: 'ORD_PAID', providerTxn: 'txn-x', sig: 'nosig' });
  A('H4 POST /payment/refund-callback → 404（产品口未落）',
    refundCb.status === 404);

  const wallet = await h.req('GET', '/wallet', A_);
  A('H4 GET /wallet → 404（契约名未落；额度口是 GET /commerce/entitlement）',
    wallet.status === 404);

  const refundWh = await h.post('/commerce/webhook/refund/ORD_PAID', {}, { providerTxn: 'txn-r', sig: 'nosig' });
  A('H4 POST /commerce/webhook/refund/:id → 404（webhook 仅 pay）',
    refundWh.status === 404);

  // Schema: payment_order CHECK 含 refunded，但 payment.ts 无迁移 API
  const orderChk = await h.pool.query<{ cons: string }>(
    `SELECT pg_get_constraintdef(oid) AS cons
       FROM pg_constraint
      WHERE conrelid = 'payment_order'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) ILIKE '%status%'`,
  );
  const orderDefs = orderChk.rows.map((r) => r.cons).join(' | ');
  A('H4 payment_order CHECK 含 refunded（schema 预留）', /'refunded'/i.test(orderDefs));

  const consChk = await h.pool.query<{ cons: string }>(
    `SELECT pg_get_constraintdef(oid) AS cons
       FROM pg_constraint
      WHERE conrelid = 'entitlement_consumption'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) ILIKE '%status%'`,
  );
  const consDefs = consChk.rows.map((r) => r.cons).join(' | ');
  A('H4 entitlement_consumption CHECK 不含 refunded', !/'refunded'/i.test(consDefs));

  // Entitlement mouth exists and is auth-gated
  const anonEnt = await h.req('GET', '/commerce/entitlement', {});
  A('H4 GET /commerce/entitlement 未鉴权 → 401', anonEnt.status === 401);
  const okEnt = await h.req('GET', '/commerce/entitlement', A_);
  A('H4 GET /commerce/entitlement 鉴权 → 200 + availableUnits',
    okEnt.status === 200 && typeof okEnt.body?.availableUnits === 'number');

  console.log('GAP_PIN: GAP-UC011-REFUND-CALLBACK — payment.ts 仅 createOrder/getOrder/markOrderPaidAndCredit；无 refund API；webhook 无 refund 口');
  console.log('GAP_PIN: GAP-UC011-WALLET — 契约 GET /wallet 未落；本 prove 用 GET /commerce/entitlement 钉额度（≠ wallet covered）');
  console.log('GAP_PIN: GAP-UC011-BALANCE-UI — apps/web/app/billing 为预览 stub（无余额展示/退款后 UI）；TC-E2E-011-balance-ui 仍缺');
  console.log('GAP_PIN: GAP-UC011-FAIL-HTTP-MOUTH — 无 POST /interview/:id/fail 用户口；fail 仅 worker/db failInterviewAndRelease');
  A('H4 honesty: refund/wallet/balance-ui GAP 已打印且 schema 不伪造 consumption.refunded',
    !/'refunded'/i.test(consDefs) && /'refunded'/i.test(orderDefs));
}

// ── H5 · parallel §1b：refund-callback 产品缺失库存 + 抬 covered 前置（implementing）──
{
  console.log('\n──────── H5 · §1b refund-callback product inventory + 抬 covered prerequisites ────────');
  console.log('NOTE: product missing → honesty GAP only；若产品口浮出须改刀真 HTTP prove，不得继续 GAP 叙事假绿');

  const paymentSrc = readRepo('packages/db/src/payment.ts');
  const dbIndex = readRepo('packages/db/src/index.ts');
  const commerceCtrl = readRepo('apps/api/src/modules/commerce/commerce.controller.ts');
  const webhookCtrl = readRepo('apps/api/src/modules/commerce/commerce-webhook.controller.ts');
  const commerceSvc = readRepo('apps/api/src/modules/commerce/commerce.service.ts');
  const billingPage = readRepo('apps/web/app/billing/page.tsx');

  // Static: payment.ts surface = pay-only
  A('H5 payment.ts 导出 createOrder', /export async function createOrder\b/.test(paymentSrc));
  A('H5 payment.ts 导出 getOrder', /export async function getOrder\b/.test(paymentSrc));
  A('H5 payment.ts 导出 markOrderPaidAndCredit', /export async function markOrderPaidAndCredit\b/.test(paymentSrc));
  A('H5 payment.ts 无 markOrderRefunded / refundOrder / applyRefund',
    !/\b(markOrderRefunded|refundOrder|applyRefund|markOrderRefund)\b/.test(paymentSrc));
  A('H5 payment.ts 无 paid→refunded / status=.refunded. 写入',
    !/status\s*=\s*['"]refunded['"]|SET\s+status\s*=\s*['"]refunded['"]/i.test(paymentSrc));
  A('H5 @meetwise/db index 仅 re-export createOrder/getOrder/markOrderPaidAndCredit（无 refund）',
    /export \{ createOrder, getOrder, markOrderPaidAndCredit \} from '\.\/payment\.ts'/.test(dbIndex)
    && !/markOrderRefunded|refundOrder|applyRefund/.test(dbIndex));

  // Static: HTTP controllers — pay mouths only; no refund-callback
  A('H5 commerce.controller 有 pay-callback（旁证：支付入账口存在）',
    /@Post\(['"]orders\/:id\/pay-callback['"]\)/.test(commerceCtrl));
  A('H5 commerce.controller 无 refund-callback / refund 路由',
    !/refund-callback|refund\b/i.test(commerceCtrl));
  A('H5 webhook 仅 @Post(pay/:id)',
    /@Post\(['"]pay\/:id['"]\)/.test(webhookCtrl) && !/@Post\(['"]refund/i.test(webhookCtrl));
  A('H5 commerce.service 无 refundCallback / refundWebhook',
    !/\b(refundCallback|refundWebhook|markOrderRefunded)\b/.test(commerceSvc));
  A('H5 apps/web billing 仍「当前不开放」stub（≠ balance-ui covered）',
    /当前不开放/.test(billingPage) && /退款/.test(billingPage));

  // Runtime re-probe demand mouths (contract names from e2e-scenarios)
  const refundCb2 = await h.post('/payment/refund-callback', A_, {
    orderId: 'ORD_H5', providerTxn: 'txn-h5', sig: 'nosig',
  });
  A('H5 POST /payment/refund-callback → 404（产品口未落；≠ 已实现）', refundCb2.status === 404);

  const refundWh2 = await h.post('/commerce/webhook/refund/ORD_H5', {}, {
    providerTxn: 'txn-h5r', sig: 'nosig',
  });
  A('H5 POST /commerce/webhook/refund/:id → 404（webhook 无 refund）', refundWh2.status === 404);

  // Alt contract spellings that must also stay missing (no silent alias)
  const altPayRefund = await h.post('/commerce/orders/ORD_H5/refund-callback', A_, {
    providerTxn: 'txn-alt', sig: 'nosig',
  });
  A('H5 POST /commerce/orders/:id/refund-callback → 404（无 pay-callback 对称口）',
    altPayRefund.status === 404);

  console.log('GAP_PIN: GAP-UC011-REFUND-CALLBACK — H5 static+HTTP：payment pay-only；controller/webhook 无 refund；404×3');
  console.log('§1b#1 抬 covered 前置（implementing refund-callback · 非本 prove 已绿）:');
  console.log('  PREREQ-1  POST /payment/refund-callback 或等价 POST /commerce/webhook/refund/:id 产品口（验签 fail-closed）');
  console.log('  PREREQ-2  payment.ts markOrderRefunded：paid→refunded CAS + 幂等键(支付单号+流水) exactly-once');
  console.log('  PREREQ-3  ConsumptionRecord/权益：confirmed→refunded（或红冲）与 D1 对齐的可执行迁移；非仅 schema 预留');
  console.log('  PREREQ-4  TC-E2E-011-refund-idem 集成：重复回调仅退一次；冲突/越权/缺签 fail-closed');
  console.log('  PREREQ-5  关联 §1b#2/#5：GET /wallet 或 ADR 降级 entitlement + balance-ui（退款后余额可见）');
  console.log('  PREREQ-6  本 H5 EXIT=0 叙事作废条件：上列口浮出后须改刀真 HTTP prove，禁止继续用 404 GAP 冒充闭环');
  A('H5 honesty: §1b#1 prerequisites 已打印且 refund 产品口仍 404',
    refundCb2.status === 404 && refundWh2.status === 404 && altPayRefund.status === 404);
  A('H5 honesty: EXIT=0 ≠ UC-E2E-011 covered / ≠ refund-callback 已实现', true);
}

console.log('\n──────── GAP pins (抬 covered 仍缺 · harness §1b) ────────');
console.log('PIN   GAP-UC011-REFUND-CALLBACK: POST /payment/refund-callback + payment paid→refunded API 未落（H4/H5）');
console.log('PIN   §1b#1 PREREQ: refund HTTP口 + markOrderRefunded CAS/幂等 + consumption 退款迁移 + refund-idem TC + wallet/balance-ui');
console.log('PIN   GAP-UC011-BALANCE-UI: billing 页 stub；无退款后余额 UI e2e');
console.log('PIN   GAP-UC011-FAIL-HTTP-MOUTH: 面试失败无用户 HTTP 口（worker-only）');
console.log('PIN   GAP-UC011-FULL-E2E: 未进 full.e2e.ts 额度回滚业务断言；regenerate→UC-019');
console.log('PIN   GAP-UC011-WALLET: GET /wallet 契约名未落（entitlement 口已钉 ≠ wallet）');
A('honesty: HTTP prove 绿 ≠ UC-E2E-011 covered（GAP pins + §1b PREREQ 已印）', true);

await done();
