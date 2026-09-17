/**
 * UC-E2E-019 focused HTTP prove (eval-first · POST /interview/:id/report/retry).
 *
 * Extends packages/db G1–G4 with the EXISTING product regenerate mouth:
 *   POST /interview/:id/report/retry → InterviewService.retryReport → requeueFailedReport
 *
 * Search conclusion (wave #5):
 *   ✅ Product mouth EXISTS: report/retry (NOT demand-side POST /reports/:id/regenerate)
 *   ❌ regenerateAttempt column / (interviewId, regenerateAttempt) idem key — schema GAP
 *   ❌ A3 confirmed→released→regen 拒 — no confirmed→released product path
 *   ❌ quarantined regenerate 出口 — retry SELECT includes quarantined but requeue CAS
 *      only failed→queued → HTTP 404 no_retriable_report (UC-011 H2 / G3 BLOCKED)
 *
 * Fixture note: `_neg-harness` does not load migration 0058. This prove installs a
 * **minimal** privacy-active stub so GET report / retry can run. Stub ≠ full fence covered.
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-019 covered
 * fixture via run-e2e-isolated → pgvector → green-risk / R5
 *
 *   pnpm uc019:report-regenerate:http:prove
 *   pnpm -C apps/api prove:uc019-report-regenerate-http   (raw; needs isolated DATABASE_URL)
 *
 * Matrix stays **partial**. Do NOT claim covered.
 */
import {
  asPrincipal, availableUnits, reserveEntitlement, releaseConsumption,
  completeInterviewAndConfirm,
  enqueueReport, claimReport, markReportFailed, sweepReports, getReport,
  MAX_REPORT_ATTEMPTS,
} from '@meetwise/db';
import { boot, mkAssert } from './_neg-harness';

const h = await boot();
const { A, done } = mkAssert('uc019:report-regenerate:http');

console.log('UC-E2E-019 report-regenerate HTTP prove · releaseEvidence=false · Not HA');
console.log('NOTE: 本绿≠全链路 E2E covered；≠ matrix covered；HTTP report/retry 口 + GAP probe；fixture=pgvector → green-risk/R5');
console.log('NOTE: D1 — 报告失败默认不退；regenerate 应免费；产品口 = POST /interview/:id/report/retry（≠ /reports/:id/regenerate）');
console.log('NOTE: remaining→covered: regenerateAttempt 幂等键 · A3 confirmed→released 产品口 · quarantine regen 出口 · full.e2e/UI');

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
console.log('PIN   GAP-UC019-PRIVACY-STUB: minimal privacy-active stub (≠ 0058 fence covered)');

const A_ = h.U('userA');
const S = Date.now().toString(36);
const IID = (k: string) => `IV_H019_${k}_${S}`;

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

/**
 * complete+confirm + enqueue + single fail → status=failed (attempts=1, not quarantined).
 * claimReport is owner-FIFO (oldest queued) — prior H* may leave queued siblings; drain
 * strays to ready so we fail the target interview's report only.
 */
async function setupFailedReport(owner: string, interviewId: string, leaseOwner: string) {
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')",
    [interviewId, owner],
  );
  await asPrincipal(h.pool, owner, (c) =>
    reserveEntitlement(c, owner, interviewId, 'mock_interview', 1.0));
  await asPrincipal(h.pool, owner, (c) =>
    completeInterviewAndConfirm(c, owner, interviewId));
  const enq = await asPrincipal(h.pool, owner, (c) => enqueueReport(c, owner, interviewId));
  let claimed: { reportId: string; interviewId: string; attempts: number; lease: string } | null = null;
  for (let i = 0; i < 32; i++) {
    const lease = `${leaseOwner}-d${i}`;
    const c0 = await asPrincipal(h.pool, owner, (c) => claimReport(c, owner, lease));
    if (!c0) break;
    if (c0.interviewId === interviewId) {
      claimed = { ...c0, lease };
      break;
    }
    // Neutralize stray queued (e.g. H1 left queued after retry) so it is not re-claimed.
    await asPrincipal(h.pool, owner, (c) => c.query(
      "UPDATE ai_report SET status='ready', content=$3::jsonb, lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$4",
      [c0.reportId, owner, JSON.stringify({ neutralized: true, from: c0.interviewId }), lease],
    ));
  }
  if (!claimed) throw new Error('claimReport_missed_target');
  const ok = await asPrincipal(h.pool, owner, (c) =>
    markReportFailed(c, owner, claimed!.reportId, claimed!.lease, 'uc019_http_injected_fail'));
  if (!ok) throw new Error('markReportFailed_missed');
  return { reportId: enq.reportId, claimed };
}

/** Force poison-pill → quarantined (mirrors UC-011 H2 / G3). Owner-FIFO claim: skip/neutralize strays. */
async function forceQuarantine(owner: string, interviewId: string, leaseOwner: string) {
  await asPrincipal(h.pool, owner, (c) => enqueueReport(c, owner, interviewId));
  for (let i = 0; i < MAX_REPORT_ATTEMPTS + 8; i++) {
    const lease = `${leaseOwner}-q${i}`;
    const claimed = await asPrincipal(h.pool, owner, (c) => claimReport(c, owner, lease));
    if (!claimed) break;
    if (claimed.interviewId !== interviewId) {
      await asPrincipal(h.pool, owner, (c) => c.query(
        "UPDATE ai_report SET status='ready', content=$3::jsonb, lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$4",
        [claimed.reportId, owner, JSON.stringify({ neutralized: true }), lease],
      ));
      continue;
    }
    await asPrincipal(h.pool, owner, (c) =>
      markReportFailed(c, owner, claimed.reportId, lease, 'uc019_http_poison'));
    await asPrincipal(h.pool, owner, (c) => c.query(
      "UPDATE ai_report SET next_attempt_at = now() - interval '1 second' WHERE interview_id=$1 AND owner_user_id=$2 AND status='failed'",
      [interviewId, owner],
    ));
    await asPrincipal(h.pool, owner, (c) => sweepReports(c, owner));
  }
  return asPrincipal(h.pool, owner, (c) => getReport(c, owner, interviewId));
}

// ── H1 · failed → POST report/retry 幂等 + HTTP 额度不扣（A1 / free regen）──
{
  console.log('\n──────── H1 · POST /interview/:id/report/retry 幂等 + 额度不扣（TC-E2E-019-regen-idem HTTP） ────────');
  const id = IID('h1');
  await setupFailedReport('userA', id, `w-uc019-http-h1-${S}`);
  const preRep = await asPrincipal(h.pool, 'userA', (c) => getReport(c, 'userA', id));
  A('H1 pre report=failed', preRep?.status === 'failed');
  A('H1 pre consumption=confirmed', (await consStatus('userA', id)) === 'confirmed');
  const before = await httpUnits(A_);
  A('H1 GET /commerce/entitlement → 200 有额度', typeof before === 'number');

  const r1 = await h.post(`/interview/${id}/report/retry`, A_, {});
  A('H1 首次 POST report/retry → 200 requeued:true',
    r1.status === 200 && r1.body?.requeued === true);
  const mid = await h.req('GET', `/interview/${id}/report`, A_);
  A('H1 GET report → 200 queued（failed→queued via HTTP）',
    mid.status === 200 && mid.body?.status === 'queued');
  A('H1 HTTP 额度不变（regenerate 免费）', (await httpUnits(A_)) === before);
  A('H1 consumption 仍 confirmed', (await consStatus('userA', id)) === 'confirmed');
  A('H1 interview 仍 completed', (await ivStatus(id)) === 'completed');

  const r2 = await h.post(`/interview/${id}/report/retry`, A_, {});
  const r3 = await h.post(`/interview/${id}/report/retry`, A_, {});
  A('H1 二次 POST report/retry → 404 no_retriable_report（已非 failed/quarantined）',
    r2.status === 404 && r2.body?.error === 'no_retriable_report');
  A('H1 三次 POST report/retry → 404（连点幂等）',
    r3.status === 404 && r3.body?.error === 'no_retriable_report');
  const post = await h.req('GET', `/interview/${id}/report`, A_);
  A('H1 post 仍 queued（无重复入队副作用）',
    post.status === 200 && post.body?.status === 'queued');
  A('H1 连点后 HTTP 额度仍不变', (await httpUnits(A_)) === before);
  // Park H1 report out of claim FIFO so later H* setupFailedReport hits the target interview.
  await h.pool.query(
    "UPDATE ai_report SET status='ready', content='{\"parked_after_h1\":true}'::jsonb, lease_owner=NULL WHERE interview_id=$1 AND owner_user_id='userA' AND status='queued'",
    [id],
  );
}

// ── H2 · HTTP retry ∥ releaseConsumption：无 released∧regen 非法组合（A2）──
{
  console.log('\n──────── H2 · HTTP retry ∥ release：无「已退款且又重排」非法组合（TC-E2E-019-refund-race HTTP） ────────');
  const id = IID('h2');
  await setupFailedReport('userA', id, `w-uc019-http-h2-${S}`);
  A('H2 pre failed+confirmed', (await consStatus('userA', id)) === 'confirmed'
    && (await asPrincipal(h.pool, 'userA', (c) => getReport(c, 'userA', id)))?.status === 'failed');
  const before = await httpUnits(A_);

  const [retry, rel] = await Promise.all([
    h.post(`/interview/${id}/report/retry`, A_, {}),
    asPrincipal(h.pool, 'userA', (c) => releaseConsumption(c, 'userA', id)),
  ]);

  const cons = await consStatus('userA', id);
  const rep = await asPrincipal(h.pool, 'userA', (c) => getReport(c, 'userA', id));
  const after = await httpUnits(A_);

  A('H2 release → already_confirmed（D1：confirmed 不可误退）',
    rel.status === 'error' && (rel as { reason?: string }).reason === 'already_confirmed');
  A('H2 consumption 仍 confirmed（恰一态；非 released）', cons === 'confirmed');
  A('H2 HTTP 额度未退', after === before);
  A('H2 interview 仍 completed', (await ivStatus(id)) === 'completed');
  // retry may 200 (requeued) or lose only if status changed first — with confirmed fixed, expect success
  A('H2 HTTP retry 可解释终态（200 requeued 或竞态后仍可解释）',
    (retry.status === 200 && retry.body?.requeued === true)
    || (retry.status === 404 && retry.body?.error === 'no_retriable_report'));
  A('H2 report ∈ {queued,failed}', rep?.status === 'queued' || rep?.status === 'failed');
  const illegal = cons === 'released' && (rep?.status === 'queued' || rep?.status === 'running');
  A('H2 无非法组合 released∧(queued|running)', !illegal);
  if (retry.status === 200) {
    A('H2 retry 赢 → report=queued 且 confirmed（可重生成合法态）',
      rep?.status === 'queued' && cons === 'confirmed');
  } else {
    A('H2 retry 未赢时 report 仍 failed + confirmed（可解释）',
      rep?.status === 'failed' && cons === 'confirmed');
  }
}

// ── H3 · A3 退款先赢路径 GAP + quarantined HTTP retry BLOCKED ──
{
  console.log('\n──────── H3 · A3 退款先赢 GAP + quarantined POST report/retry → 404（出口 BLOCKED） ────────');
  const id = IID('h3');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active')",
    [id],
  );
  await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
  await asPrincipal(h.pool, 'userA', (c) =>
    completeInterviewAndConfirm(c, 'userA', id));

  const rel = await asPrincipal(h.pool, 'userA', (c) =>
    releaseConsumption(c, 'userA', id));
  A('H3 release on confirmed → already_confirmed（无法先退到 released）',
    rel.status === 'error' && (rel as { reason?: string }).reason === 'already_confirmed');
  A('H3 consumption 仍 confirmed（A3 退款先赢路径不存在）',
    (await consStatus('userA', id)) === 'confirmed');

  const rep = await forceQuarantine('userA', id, `w-uc019-http-h3-${S}`);
  A('H3 poison → quarantined', rep?.status === 'quarantined');
  const got = await h.req('GET', `/interview/${id}/report`, A_);
  A('H3 GET report → 200 quarantined',
    got.status === 200 && got.body?.status === 'quarantined');
  const before = await httpUnits(A_);
  const retry = await h.post(`/interview/${id}/report/retry`, A_, {});
  A('H3 POST report/retry quarantined → 404 no_retriable_report（quarantine regen 出口 BLOCKED）',
    retry.status === 404 && retry.body?.error === 'no_retriable_report');
  A('H3 HTTP 额度不回补（报告失败不退）', (await httpUnits(A_)) === before);
  A('H3 consumption 仍 confirmed', (await consStatus('userA', id)) === 'confirmed');
  console.log('GAP_PIN: GAP-UC019-REFUND-FIRST-ORDER — 无 confirmed→released 产品口；A3「退款先到→regen 拒」不可在现 API 闭环');
  console.log('GAP_PIN: GAP-UC019-QUARANTINE-REGEN — retry 选到 quarantined 但 requeueFailedReport 仅 failed CAS → HTTP 404；免费 regenerate 出口未对接');
}

// ── H4 · honesty GAP：regenerateAttempt / demand-path /reports/regenerate / full.e2e ──
{
  console.log('\n──────── H4 · honesty GAP pin：regenerateAttempt / demand-path / full.e2e ────────');

  const cols = await h.pool.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name='ai_report' AND table_schema='public'`,
  );
  const names = cols.rows.map((r) => r.column_name);
  const hasRegenAttempt = names.some((n) => /regenerate/i.test(n));
  A('H4 ai_report 无 regenerate* 列（GAP: regenerateAttempt 幂等键未落库）', !hasRegenAttempt);
  A('H4 ai_report 有 status/attempts（现有 report/retry CAS 代理）',
    names.includes('status') && names.includes('attempts'));

  // Demand-side path from scenarios naming — not the product mouth
  const demand = await h.post('/reports/IV_H019_none/regenerate', A_, {});
  A('H4 POST /reports/:id/regenerate → 404（需求名路径未落；产品口是 report/retry）',
    demand.status === 404);

  const anon = await h.post(`/interview/${IID('anon')}/report/retry`, {}, {});
  A('H4 POST report/retry 未鉴权 → 401', anon.status === 401);

  console.log('GAP_PIN: GAP-UC019-REGEN-IDEM-KEY — 需求幂等键 (interviewId, regenerateAttempt) 未产品化；仅 status=failed CAS via report/retry→requeueFailedReport');
  console.log('GAP_PIN: GAP-UC019-HTTP-REGENERATE — 产品口 POST /interview/:id/report/retry 已钉（本 prove H1–H3）；需求名 /reports/:id/regenerate 未落；未进 full.e2e/UI');
  console.log('GAP_PIN: 本 prove EXIT=0 仅= H1–H3 HTTP 诚实 + H4 GAP 钉，≠ UC-E2E-019 covered');
  A('H4 honesty: regenerate* 列缺失已钉且 report/retry 鉴权口存在',
    !hasRegenAttempt && names.includes('status'));
}

console.log('\n──────── GAP pins (抬 covered 仍缺) ────────');
console.log('PIN   GAP-UC019-REGEN-IDEM-KEY: (interviewId, regenerateAttempt) 未落库/未产品化');
console.log('PIN   GAP-UC019-REFUND-FIRST-ORDER: 无 confirmed→released；A3 退款先赢→regen 拒不可闭环');
console.log('PIN   GAP-UC019-QUARANTINE-REGEN: quarantined 上 report/retry → 404；无免费 regenerate 出口');
console.log('PIN   GAP-UC019-FULL-E2E: 未进 full.e2e.ts / e2e:isolated UI regenerate 断言');
console.log('PIN   GAP-UC019-DEMAND-PATH: 需求名 POST /reports/:id/regenerate 未落（≠ report/retry covered 冒充）');
A('honesty: HTTP prove 绿 ≠ UC-E2E-019 covered（GAP pins 已印）', true);

await done();
