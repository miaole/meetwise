/**
 * UC-E2E-019 focused integration prove (eval-first · packages/db).
 *
 * Report regenerate + refund concurrency honesty (D1: report fail 不退; regenerate 免费):
 *   G1 failed→requeueFailedReport 幂等（连点仅一次 failed→queued；A1 proxy）
 *   G2 regenerate(requeue) × releaseConsumption 并发：无「已退款且又重排报告」非法组合（A2）
 *   G3 refund-first→released→regen 拒 产品路径缺失 + quarantined 不可 requeue（A3 / UC-011 R2 BLOCKED）
 *   G4 honesty GAP：无 regenerateAttempt 幂等键产品口；HTTP 产品口见 uc019:…:http（report/retry）
 *
 * NO MODEL_API_KEY · HTTP/UI e2e → uc019:report-regenerate:http:prove（本文件仍纯 db）.
 * releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-019 covered
 *
 *   pnpm uc019:report-regenerate:prove
 *   pnpm -C packages/db prove:uc019-report-regenerate
 *
 * Cite: e2e-scenarios.md UC-E2E-019 A1/A2/A3 · matrix row UC-E2E-019
 * Related: UC-E2E-011 R2 quarantined cannot requeue / regenerate BLOCKED
 */
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  reserveEntitlement, releaseConsumption, availableUnits,
  completeInterviewAndConfirm,
  enqueueReport, claimReport, markReportFailed, sweepReports, getReport,
  requeueFailedReport, MAX_REPORT_ATTEMPTS,
} from '../src/index.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const S = Date.now().toString(36);
const OWN = (k: string) => `uc019-${k}-${S}`;
const IID = (k: string) => `iv-uc019-${k}-${S}`;

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

async function reportIdOf(owner: string, interviewId: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT id FROM ai_report WHERE owner_user_id=$1 AND interview_id=$2',
    [owner, interviewId],
  )).then((r) => r.rows[0]?.id as string | undefined);
}

/** complete+confirm + enqueue + single fail → status=failed (attempts=1, not quarantined). */
async function setupFailedReport(owner: string, interviewId: string, leaseOwner: string) {
  await pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')",
    [interviewId, owner],
  );
  await asPrincipal(pool, owner, (c) =>
    reserveEntitlement(c, owner, interviewId, 'mock_interview', 1.0));
  await asPrincipal(pool, owner, (c) =>
    completeInterviewAndConfirm(c, owner, interviewId));
  const enq = await asPrincipal(pool, owner, (c) => enqueueReport(c, owner, interviewId));
  const claimed = await asPrincipal(pool, owner, (c) => claimReport(c, owner, leaseOwner));
  if (!claimed) throw new Error('claimReport_missed');
  await asPrincipal(pool, owner, (c) =>
    markReportFailed(c, owner, claimed.reportId, leaseOwner, 'uc019_injected_fail'));
  return { reportId: enq.reportId, claimed };
}

/** Force poison-pill → quarantined (mirrors UC-011 R2 helper). */
async function forceQuarantine(owner: string, interviewId: string, leaseOwner: string) {
  await asPrincipal(pool, owner, (c) => enqueueReport(c, owner, interviewId));
  for (let i = 0; i < MAX_REPORT_ATTEMPTS + 2; i++) {
    const claimed = await asPrincipal(pool, owner, (c) => claimReport(c, owner, leaseOwner));
    if (!claimed) break;
    await asPrincipal(pool, owner, (c) =>
      markReportFailed(c, owner, claimed.reportId, leaseOwner, 'uc019_poison'));
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
  console.log('UC-E2E-019 report-regenerate + refund concurrency prove · releaseEvidence=false · Not HA');
  console.log('NOTE: 本绿≠全链路 E2E covered；integration/honesty only；≠ matrix covered');
  console.log('NOTE: fixture=pgvector via isolated → green-risk / R5；≠ sole-stack migrated');
  console.log('NOTE: D1 — 报告失败默认不退；regenerate 应免费；本 prove 用 requeueFailedReport 作 regenerate 代理');

  // ── G1: requeue idempotency (A1 proxy) ──
  section('G1 · failed→requeue 幂等：连点仅一次 failed→queued（TC-E2E-019-regen-idem proxy）');
  {
    const owner = OWN('g1'), id = IID('g1');
    await seed(owner, 5.0);
    const { reportId } = await setupFailedReport(owner, id, `w-uc019-g1-${S}`);
    const pre = await asPrincipal(pool, owner, (c) => getReport(c, owner, id));
    A('G1 pre report=failed', pre?.status === 'failed');
    A('G1 pre consumption=confirmed', (await consStatus(owner, id)) === 'confirmed');
    A('G1 pre 额度=4（confirmed 不回补）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);

    const rq1 = await asPrincipal(pool, owner, (c) => requeueFailedReport(c, owner, reportId));
    A('G1 首次 requeueFailedReport → true（failed→queued）', rq1 === true);
    const mid = await asPrincipal(pool, owner, (c) => getReport(c, owner, id));
    A('G1 mid report=queued', mid?.status === 'queued');

    const rq2 = await asPrincipal(pool, owner, (c) => requeueFailedReport(c, owner, reportId));
    const rq3 = await asPrincipal(pool, owner, (c) => requeueFailedReport(c, owner, reportId));
    A('G1 二次 requeue → false（已非 failed，CAS 幂等）', rq2 === false);
    A('G1 三次 requeue → false', rq3 === false);
    const post = await asPrincipal(pool, owner, (c) => getReport(c, owner, id));
    A('G1 post 仍 queued（不重复入队副作用）', post?.status === 'queued');
    A('G1 额度仍 4（regenerate 不扣费）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);
    A('G1 consumption 仍 confirmed', (await consStatus(owner, id)) === 'confirmed');
  }

  // ── G2: concurrent requeue × release on confirmed ──
  section('G2 · regenerate×退款并发：无「已退款且又重排」非法组合（TC-E2E-019-refund-race）');
  {
    const owner = OWN('g2'), id = IID('g2');
    await seed(owner, 5.0);
    const { reportId } = await setupFailedReport(owner, id, `w-uc019-g2-${S}`);
    A('G2 pre failed+confirmed', (await consStatus(owner, id)) === 'confirmed'
      && (await asPrincipal(pool, owner, (c) => getReport(c, owner, id)))?.status === 'failed');

    // Concurrent: regenerate proxy + mistaken refund/release
    const [rq, rel] = await Promise.all([
      asPrincipal(pool, owner, (c) => requeueFailedReport(c, owner, reportId)),
      asPrincipal(pool, owner, (c) => releaseConsumption(c, owner, id)),
    ]);

    const cons = await consStatus(owner, id);
    const rep = await asPrincipal(pool, owner, (c) => getReport(c, owner, id));
    const units = await asPrincipal(pool, owner, (c) => availableUnits(c, owner));
    const iv = await ivStatus(owner, id);

    A('G2 release → already_confirmed（D1：confirmed 不可误退）',
      rel.status === 'error' && (rel as { reason?: string }).reason === 'already_confirmed');
    A('G2 consumption 仍 confirmed（恰一态；非 released）', cons === 'confirmed');
    A('G2 interview 仍 completed', iv === 'completed');
    A('G2 额度仍 4（未退）', units === 4.0);
    // requeue may win (queued) or lose race only if status changed — with confirmed fixed, requeue should succeed
    A('G2 requeue 结果 boolean（CAS）', typeof rq === 'boolean');
    A('G2 report ∈ {queued,failed}（可解释终态）', rep?.status === 'queued' || rep?.status === 'failed');
    // Illegal combo pin: never released + regenerating
    const illegal = cons === 'released' && (rep?.status === 'queued' || rep?.status === 'running');
    A('G2 无非法组合 released∧(queued|running)', !illegal);
    // If requeue won, report queued under confirmed — legal free regen
    if (rq === true) {
      A('G2 requeue 赢 → report=queued 且 confirmed（可重生成合法态）',
        rep?.status === 'queued' && cons === 'confirmed');
    } else {
      // Extremely unlikely without status change; still honesty
      A('G2 requeue 未赢时 report 仍 failed + confirmed（可解释）',
        rep?.status === 'failed' && cons === 'confirmed');
    }
  }

  // ── G3: refund-first product path GAP + quarantined BLOCKED ──
  section('G3 · A3 退款先赢→released→regen 拒：产品路径缺失 + quarantined 不可 requeue（诚实钉）');
  {
    const owner = OWN('g3'), id = IID('g3');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')",
      [id, owner],
    );
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) =>
      completeInterviewAndConfirm(c, owner, id));

    // Attempt "refund first" on confirmed — must fail (no confirmed→released)
    const rel = await asPrincipal(pool, owner, (c) => releaseConsumption(c, owner, id));
    A('G3 release on confirmed → already_confirmed（无法先退到 released）',
      rel.status === 'error' && (rel as { reason?: string }).reason === 'already_confirmed');
    A('G3 consumption 仍 confirmed（A3 退款先赢路径不存在）', (await consStatus(owner, id)) === 'confirmed');

    // Quarantined regenerate BLOCKED (UC-011 R2 related)
    const rep = await forceQuarantine(owner, id, `w-uc019-g3-${S}`);
    A('G3 poison → quarantined', rep?.status === 'quarantined');
    const rid = await reportIdOf(owner, id);
    const rq = await asPrincipal(pool, owner, (c) => requeueFailedReport(c, owner!, rid!));
    A('G3 quarantined 不可 requeueFailedReport（产品 regenerate 对 quarantine BLOCKED·UC-011 R2）', rq === false);
    console.log('GAP_PIN: GAP-UC019-REFUND-FIRST-ORDER — 无 confirmed→released 产品口；A3「退款先到→regen 拒」不可在现 API 闭环');
    console.log('GAP_PIN: GAP-UC019-QUARANTINE-REGEN — quarantined 不可 requeue；免费 regenerate 产品口未对接 quarantine 出口');
  }

  // ── G4 honesty GAP pins ──
  section('G4 · honesty GAP pin：regenerateAttempt 幂等键 / demand-path（假绿禁；HTTP 口另轨 http prove）');
  {
    // No regenerateAttempt column / API in ai_report schema surface we use
    const cols = await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
        WHERE table_name='ai_report' AND table_schema='public'`,
    );
    const names = cols.rows.map((r) => r.column_name);
    const hasRegenAttempt = names.some((n) => /regenerate/i.test(n));
    A('G4 ai_report 无 regenerate* 列（GAP: regenerateAttempt 幂等键未落库）', !hasRegenAttempt);
    A('G4 ai_report 有 status/attempts（现有 requeue CAS 代理）',
      names.includes('status') && names.includes('attempts'));

    console.log('GAP_PIN: GAP-UC019-REGEN-IDEM-KEY — 需求幂等键 (interviewId, regenerateAttempt) 未产品化；仅 status=failed CAS via requeueFailedReport');
    console.log('GAP_PIN: GAP-UC019-HTTP-REGENERATE — 产品口 POST /interview/:id/report/retry 由 uc019:report-regenerate:http:prove 钉；需求名 /reports/:id/regenerate 未落；未进 full.e2e/UI');
    console.log('GAP_PIN: 本 prove EXIT=0 仅= G1–G2 集成诚实 + G3/G4 GAP 钉，≠ UC-E2E-019 covered');
    A('G4 honesty: regenerate* 列缺失已钉且 status/attempts 存在', !hasRegenAttempt && names.includes('status'));
  }

  console.log(`\n${fail === 0
    ? '✓ UC-E2E-019 G1–G4 integration/honesty asserts passed (partial ladder only; ≠ covered; ≠ e2e:isolated regenerate)'
    : `✗ ${fail} UC-E2E-019 asserts failed`}`);
  console.log('BLOCKED_FOR_FULL_E2E: regenerateAttempt 幂等键 + A3 refund-first→released + quarantine regen 出口 + full.e2e/UI 仍 gap（HTTP report/retry 见 http prove）');
  console.log('BLOCKED: quarantined regenerate 出口（UC-011 R2）仍 BLOCKED；balance-ui / 支付退款回调另轨');
  console.log('BLOCKED: 本绿≠ UC-E2E-019 covered；releaseEvidence=false；Not HA');
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
