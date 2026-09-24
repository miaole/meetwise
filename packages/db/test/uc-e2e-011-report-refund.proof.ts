/**
 * UC-E2E-011 focused integration prove (eval-first · packages/db).
 *
 * Billing boundary (D1: 1 unit = 1 interview, confirmed at Interview.completed):
 *   R1 interview fail → reserved→released + 额度净变 0
 *   R2 report quarantine after complete → consumption stays confirmed（不退）
 *   R3 mistaken release on confirmed → already_confirmed（拒）
 *   R4 honesty: payment refund-callback / confirmed→refunded product path MISSING (GAP pin)
 *              + §1b static inventory + 抬 covered prerequisites (never covered)
 *
 * NO MODEL_API_KEY · NO HTTP/UI e2e.
 * releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-011 covered
 *
 *   pnpm uc011:report-refund:prove
 *   pnpm -C packages/db prove:uc011-report-refund
 *
 * Cite: e2e-scenarios.md UC-E2E-011 E1/E2/E4 · matrix row UC-E2E-011
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  reserveEntitlement, releaseConsumption, availableUnits,
  completeInterviewAndConfirm, failInterviewAndRelease,
  enqueueReport, claimReport, markReportFailed, sweepReports, getReport,
  requeueFailedReport, MAX_REPORT_ATTEMPTS,
} from '../src/index.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
function readRepo(rel: string): string {
  const p = resolve(repoRoot, rel);
  if (!existsSync(p)) throw new Error(`missing ${rel}`);
  return readFileSync(p, 'utf8');
}

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const S = Date.now().toString(36);
const OWN = (k: string) => `uc011-${k}-${S}`;
const IID = (k: string) => `iv-uc011-${k}-${S}`;

async function seed(owner: string, units = 5.0) {
  await pool.query(
    "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now()+interval '300 days')",
    [owner, units],
  );
}

async function consStatus(owner: string, key: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, key],
  )).then((r) => r.rows[0]?.status as string | undefined);
}

async function ivStatus(owner: string, id: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2',
    [id, owner],
  )).then((r) => r.rows[0]?.status as string | undefined);
}

/** Force report poison-pill → quarantined using db APIs only (no worker model). */
async function forceQuarantine(owner: string, interviewId: string, leaseOwner: string) {
  await asPrincipal(pool, owner, (c) => enqueueReport(c, owner, interviewId));
  for (let i = 0; i < MAX_REPORT_ATTEMPTS + 2; i++) {
    const claimed = await asPrincipal(pool, owner, (c) => claimReport(c, owner, leaseOwner));
    if (!claimed) break;
    await asPrincipal(pool, owner, (c) =>
      markReportFailed(c, owner, claimed.reportId, leaseOwner, 'uc011_injected_report_fail'));
    await asPrincipal(pool, owner, (c) => c.query(
      "UPDATE ai_report SET next_attempt_at = now() - interval '1 second' WHERE interview_id=$1 AND owner_user_id=$2 AND status='failed'",
      [interviewId, owner],
    ));
    await asPrincipal(pool, owner, (c) => sweepReports(c, owner));
  }
  return asPrincipal(pool, owner, (c) => getReport(c, owner, interviewId));
}

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log('UC-E2E-011 report-refund + billing-boundary prove · releaseEvidence=false · Not HA');
  console.log('NOTE: 本绿≠全链路 E2E covered；integration assert only；≠ matrix covered');
  console.log('NOTE: fixture=pgvector via isolated → green-risk / R5；≠ sole-stack migrated');
  console.log('NOTE: D1 — 1 额度=一场面试；reserved→confirmed @ Interview.completed；报告失败默认不退');

  // ── R1: interview fail → released + 额度净变 0 ──
  section('R1 · interview fail → failed + released + 额度净变 0（TC-E2E-011-interview-fail-refund）');
  {
    const owner = OWN('r1'), id = IID('r1');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')",
      [id, owner],
    );
    const r1 = await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    A('R1 reserve → reserved', r1.status === 'reserved');
    A('R1 额度扣 1.0（5→4）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);

    const fr = await asPrincipal(pool, owner, (c) =>
      failInterviewAndRelease(c, owner, id));
    A('R1 failInterviewAndRelease → failed', fr.status === 'failed');
    A('R1 released=released', fr.released === 'released');
    A('R1 interview=failed', (await ivStatus(owner, id)) === 'failed');
    A('R1 consumption=released', (await consStatus(owner, id)) === 'released');
    A('R1 额度全回补（4→5，净变 0）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);

    const fr2 = await asPrincipal(pool, owner, (c) =>
      failInterviewAndRelease(c, owner, id));
    A('R1 二次 fail → already_failed + noop（幂等）', fr2.status === 'already_failed' && fr2.released === 'noop');
    A('R1 二次后额度仍 5（不双退）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
  }

  // ── R2: report fail after complete → NO refund (confirmed stays) ──
  section('R2 · report quarantine 后不退款：confirmed 不变 + interview completed（TC-E2E-011-report-fail-no-refund）');
  {
    const owner = OWN('r2'), id = IID('r2');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')",
      [id, owner],
    );
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    A('R2 pre 额度=4（reserved）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);

    const done = await asPrincipal(pool, owner, (c) =>
      completeInterviewAndConfirm(c, owner, id));
    A('R2 complete → completed', done.status === 'completed');
    A('R2 consumption=confirmed', (await consStatus(owner, id)) === 'confirmed');
    A('R2 interview=completed', (await ivStatus(owner, id)) === 'completed');
    const afterConfirm = await asPrincipal(pool, owner, (c) => availableUnits(c, owner));
    A('R2 confirm 后可用仍 4（consumed，非退回）', afterConfirm === 4.0);

    const rep = await forceQuarantine(owner, id, `w-uc011-${S}`);
    A('R2 report → quarantined', rep?.status === 'quarantined');
    A(`R2 attempts ≥ MAX_REPORT_ATTEMPTS(${MAX_REPORT_ATTEMPTS})`, (rep?.attempts ?? 0) >= MAX_REPORT_ATTEMPTS);
    A('R2 舱壁：interview 仍 completed（报告失败不碰面试）', (await ivStatus(owner, id)) === 'completed');
    A('R2 舱壁：consumption 仍 confirmed（报告失败不退款）', (await consStatus(owner, id)) === 'confirmed');
    A('R2 额度不回补（仍 4）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);

    // regenerate 入口（UC-019）在 quarantined 上 requeueFailedReport 应失败——诚实钉 BLOCKED
    const rq = await asPrincipal(pool, owner, async (c) => {
      const row = await c.query(
        'SELECT id FROM ai_report WHERE owner_user_id=$1 AND interview_id=$2',
        [owner, id],
      );
      const reportId = row.rows[0]?.id as string;
      return requeueFailedReport(c, owner, reportId);
    });
    A('R2 quarantined 不可 requeueFailedReport（regenerate 产品口仍 BLOCKED→UC-019）', rq === false);
  }

  // ── R3: mistaken refund on completed+confirmed rejected ──
  section('R3 · 误退请求：completed+confirmed 上 release → already_confirmed（E4 状态守卫）');
  {
    const owner = OWN('r3'), id = IID('r3');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')",
      [id, owner],
    );
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) =>
      completeInterviewAndConfirm(c, owner, id));
    A('R3 pre confirmed', (await consStatus(owner, id)) === 'confirmed');

    const rel = await asPrincipal(pool, owner, (c) =>
      releaseConsumption(c, owner, id));
    A('R3 release → error already_confirmed', rel.status === 'error' && (rel as { reason?: string }).reason === 'already_confirmed');
    A('R3 consumption 仍 confirmed（无 confirmed→released 合法迁移）', (await consStatus(owner, id)) === 'confirmed');
    A('R3 额度仍 4（未误退）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);
    A('R3 interview 仍 completed', (await ivStatus(owner, id)) === 'completed');
  }

  // ── R4 honesty GAP: payment refund-callback / confirmed→refunded missing (+ §1b prereqs) ──
  section('R4 · honesty GAP pin：支付退款回调 / confirmed→refunded 产品路径缺失（假绿禁）');
  {
    // Schema: entitlement_consumption has no 'refunded' status (only reserved|confirmed|partial_confirmed|released)
    const chk = await pool.query<{ cons: string }>(
      `SELECT pg_get_constraintdef(oid) AS cons
         FROM pg_constraint
        WHERE conrelid = 'entitlement_consumption'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%status%'`,
    );
    const defs = chk.rows.map((r) => r.cons).join(' | ');
    const hasRefunded = /'refunded'/i.test(defs);
    const hasReleased = /'released'/i.test(defs);
    const hasConfirmed = /'confirmed'/i.test(defs);
    A('R4 schema status CHECK 含 confirmed', hasConfirmed);
    A('R4 schema status CHECK 含 released', hasReleased);
    A('R4 schema status CHECK 不含 refunded（GAP: confirmed→refunded 未落库）', !hasRefunded);

    // Static inventory (parallel §1b): payment.ts pay-only surface
    const paymentSrc = readRepo('packages/db/src/payment.ts');
    const dbIndex = readRepo('packages/db/src/index.ts');
    A('R4 payment.ts 有 markOrderPaidAndCredit（入账旁证）',
      /export async function markOrderPaidAndCredit\b/.test(paymentSrc));
    A('R4 payment.ts 无 markOrderRefunded / refundOrder / applyRefund',
      !/\b(markOrderRefunded|refundOrder|applyRefund|markOrderRefund)\b/.test(paymentSrc));
    A('R4 payment.ts 无 status=refunded 写入',
      !/status\s*=\s*['"]refunded['"]|SET\s+status\s*=\s*['"]refunded['"]/i.test(paymentSrc));
    A('R4 db index 无 refund API re-export',
      !/markOrderRefunded|refundOrder|applyRefund/.test(dbIndex));

    // payment_order schema reserves refunded — API still missing
    const orderChk = await pool.query<{ cons: string }>(
      `SELECT pg_get_constraintdef(oid) AS cons
         FROM pg_constraint
        WHERE conrelid = 'payment_order'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%status%'`,
    );
    const orderDefs = orderChk.rows.map((r) => r.cons).join(' | ');
    A('R4 payment_order CHECK 含 refunded（schema 预留 ≠ API）', /'refunded'/i.test(orderDefs));

    console.log('GAP_PIN: GAP-UC011-REFUND-CALLBACK — packages/db payment.ts 仅 createOrder/getOrder/markOrderPaidAndCredit；无 refund-callback / paid→refunded API');
    console.log('§1b#1 抬 covered 前置（implementing refund-callback · db 侧）:');
    console.log('  PREREQ-2  markOrderRefunded：paid→refunded CAS + 幂等键(支付单号+流水) exactly-once');
    console.log('  PREREQ-3  ConsumptionRecord confirmed→refunded（或红冲）与 D1 对齐；非仅 payment_order CHECK 预留');
    console.log('  PREREQ-4  TC-E2E-011-refund-idem 集成断言可执行');
    console.log('GAP_PIN: TC-E2E-011-refund-idem + balance-ui 仍缺产品路径；本 prove EXIT=0 仅=诚实钉，≠退款回调 covered');
    A('R4 honesty: GAP+§1b PREREQ 已打印且 schema 不伪造 consumption.refunded',
      !hasRefunded && hasConfirmed && hasReleased && /'refunded'/i.test(orderDefs));
  }

  console.log(`\n${fail === 0
    ? '✓ UC-E2E-011 R1–R4 integration/honesty asserts passed (partial ladder only; ≠ covered; ≠ e2e:isolated refund assert)'
    : `✗ ${fail} UC-E2E-011 asserts failed`}`);
  console.log('BLOCKED_FOR_FULL_E2E: full.e2e 有 report_unavailable+quarantined 兜底，但缺额度/ConsumptionRecord 回滚业务断言进 e2e:isolated');
  console.log('BLOCKED: TC-E2E-011-refund-idem（支付回调幂等）+ balance-ui + regenerate 入口（UC-019）仍 gap');
  console.log('BLOCKED: 本绿≠ UC-E2E-011 covered；releaseEvidence=false；Not HA');
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
