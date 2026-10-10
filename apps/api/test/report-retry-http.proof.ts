/**
 * REPORT-RETRY HTTP prove · #229 报告重试刀 D2 五件（HTTP 腿 · eval-first · POST /interview/:id/report/retry）。
 *
 * REQUEST: ai-docs/delivery/harness/report-retry-REQUEST.md @9d381aaf rev2 · mw-retry229-exec
 *
 *   H1 解锁全链（§4-②）：poison×3 → quarantined + report_unavailable(max_attempts_exceeded) 事件 →
 *      HTTP retry → 200 {requeued:true} + attempts=0（重置预算）→ good generate → ready。
 *   H2 零扣费（§4-③）：手动重试×3 轮：额度恒定、consumption 恒 confirmed 单行、无 released/无新行。
 *   H3 非 2xx 明确提示（§4-④）：queued/ready 上 retry → 404 no_retriable_report；web 契约面静态门：
 *      retryReportAction 读 r.ok/status、非 2xx redirect ?retry_error=；page 渲染 ④文案逐字+提示条；
 *      无「重新开一场面试」替代出口。
 *   H4 频控（§4-频控）：同报告 1 小时内第 1-3 次 200（每轮先打回 failed 保持可重试）、第 4 次 429
 *      report_retry_limited；跨报告互不影响（per-interview key）。
 *
 * Fixture: _neg-harness + minimal privacy-active stub（沿 uc019-http 先例·stub ≠ 0058 fence covered）。
 * 每 section 独立 owner（claim=owner-FIFO，独立 owner 消除游离 queued 游标·沿 uc019-http neutralize 教训）。
 * NO MODEL_API_KEY（generate 注入确定性函数）· releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered。
 *
 *   pnpm report-retry:http:prove
 *   pnpm -C apps/api prove:report-retry-http   (raw; needs isolated DATABASE_URL)
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  asPrincipal, reserveEntitlement, availableUnits, completeInterviewAndConfirm,
  enqueueReport, getReport, MAX_REPORT_ATTEMPTS,
} from '@meetwise/db';
import { drainReportsOnce, sweepReportsOnce, type ReportWorkerDeps } from '../../worker/src/report-worker.ts';
import type { InterviewSummary, ReportContent } from '@meetwise/ai-graphs';
import { boot, mkAssert } from './_neg-harness';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
function readRepo(rel: string): string {
  const p = resolve(repoRoot, rel);
  if (!existsSync(p)) throw new Error(`missing ${rel}`);
  return readFileSync(p, 'utf8');
}

const h = await boot();
const { A, done } = mkAssert('report-retry:http');

console.log('REPORT-RETRY (#229 D2) HTTP prove · releaseEvidence=false · Not HA');
console.log('NOTE: 本绿≠全链路 E2E covered；HTTP retry 口 + 频控 + web 契约面；fixture=isolated PG + minimal privacy stub');
console.log('NOTE: D2 — 失败可重试、重试不重复扣费、不退款；频控 3 次/小时/份（S12 建议值待追认·常量可调）');

// Minimal privacy-active stubs（0058 not in _neg-harness minimal mirror；owner match only）。
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
`);
console.log('PIN   RR229-PRIVACY-STUB: minimal privacy-active stub (≠ 0058 fence covered)');

const S = Date.now().toString(36);
const IID = (k: string) => `IV_RR229_${k}_${S}`;

const failingGenerate = (): ReportContent => { throw new Error('rr229_injected_fail'); };
const goodGenerate = (s: InterviewSummary): ReportContent => ({
  overall: Math.round(s.scores.reduce((a, b) => a + b, 0) / Math.max(1, s.scores.length)),
  sections: [{ title: '总评', body: `rr229 q=${s.questionCount}` }],
});
const depsWith = (generate: (s: InterviewSummary) => ReportContent): ReportWorkerDeps => ({
  loadSummary: (_o, iid) => ({ interviewId: iid, questionCount: 1, scores: [70] }),
  generate,
});

async function httpUnits(hdr: Record<string, string>): Promise<number | undefined> {
  const r = await h.req('GET', '/commerce/entitlement', hdr);
  if (r.status !== 200) return undefined;
  const u = r.body?.availableUnits;
  return typeof u === 'number' ? u : undefined;
}

async function consRows(owner: string): Promise<string> {
  return asPrincipal(h.pool, owner, (c) => c.query(
    'SELECT idempotency_key, status, units_requested::text AS ur FROM entitlement_consumption WHERE owner_user_id=$1 ORDER BY idempotency_key',
    [owner],
  )).then((r) => JSON.stringify(r.rows));
}

/** complete+confirm + enqueue（付费基座·每 interview 一桶，availableUnits 快照前后自洽）。 */
async function setupConfirmedWithReport(owner: string, interviewId: string) {
  await h.pool.query(
    "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '300 days')",
    [owner],
  );
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')",
    [interviewId, owner],
  );
  await asPrincipal(h.pool, owner, (c) => reserveEntitlement(c, owner, interviewId, 'mock_interview', 1.0));
  await asPrincipal(h.pool, owner, (c) => completeInterviewAndConfirm(c, owner, interviewId));
  return asPrincipal(h.pool, owner, (c) => enqueueReport(c, owner, interviewId));
}

/** poison×3 → quarantined + report_unavailable 事件（生产同链 drain+sweep）。 */
async function forceQuarantine(owner: string, interviewId: string) {
  for (let i = 0; i < MAX_REPORT_ATTEMPTS; i++) {
    const out = await drainReportsOnce(h.pool, owner, `w-rr229-${S}-q${i}`, depsWith(failingGenerate));
    if (out === 'idle') break;
    await asPrincipal(h.pool, owner, (c) => c.query(
      "UPDATE ai_report SET next_attempt_at = now() - interval '1 second' WHERE interview_id=$1 AND owner_user_id=$2 AND status='failed'",
      [interviewId, owner],
    ));
    await sweepReportsOnce(h.pool, owner);
  }
  return asPrincipal(h.pool, owner, (c) => getReport(c, owner, interviewId));
}

/** 打回 failed（可重试态）：手动重试每轮之间模拟模型继续故障（claim 只领 queued/过期 running，failed 不可领）。 */
async function failOnce(owner: string, tag: string) {
  return drainReportsOnce(h.pool, owner, `w-rr229-${S}-${tag}`, depsWith(failingGenerate));
}

// ── H1 · 解锁全链：quarantined + report_unavailable 事件 → HTTP retry 200 + attempts=0 → good → ready ──
{
  console.log('\n──────── H1 · quarantined 解锁（#229 D2②）→ 200 requeued + attempts=0 → ready ────────');
  const owner = `rr229-h1-${S}`, id = IID('h1'), H = h.U(owner);
  await setupConfirmedWithReport(owner, id);
  const before = await httpUnits(H);
  const consBefore = await consRows(owner);
  A('H1 pre 额度=4（confirm 后）+ consumption 恰 1 行 confirmed',
    before === 4.0 && JSON.parse(consBefore).length === 1 && JSON.parse(consBefore)[0].status === 'confirmed');

  const rep = await forceQuarantine(owner, id);
  A(`H1 poison×3 → quarantined（attempts=${MAX_REPORT_ATTEMPTS}）`,
    rep?.status === 'quarantined' && rep?.attempts === MAX_REPORT_ATTEMPTS);
  const unavail = await asPrincipal(h.pool, owner, (c) => c.query(
    "SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND kind='report_unavailable'", [id]));
  const reason = await asPrincipal(h.pool, owner, (c) => c.query(
    "SELECT payload FROM interview_event WHERE stream_key=$1 AND kind='report_unavailable' ORDER BY seq DESC LIMIT 1", [id]));
  A('H1 report_unavailable 事件 ≥1 且 reason=max_attempts_exceeded（终态事件原样）',
    (unavail.rows[0]?.n ?? 0) >= 1 && (reason.rows[0]?.payload as any)?.reason === 'max_attempts_exceeded');

  const retry = await h.post(`/interview/${id}/report/retry`, H, {});
  A('H1 POST retry quarantined → 200 {requeued:true}（#229 D2 翻转旧钉·旧语义 404 见 git blame）',
    retry.status === 200 && retry.body?.requeued === true);
  const mid = await h.req('GET', `/interview/${id}/report`, H);
  A('H1 GET report → queued + attempts=0（重置预算·reportView 回传 attempts）',
    mid.status === 200 && mid.body?.status === 'queued' && mid.body?.attempts === 0);
  A('H1 重试零扣费：额度不变 + consumption byte-identical',
    (await httpUnits(H)) === before && (await consRows(owner)) === consBefore);

  const out = await drainReportsOnce(h.pool, owner, `w-rr229-${S}-good`, depsWith(goodGenerate));
  A('H1 解锁后 good generate → ready（生产同链）', out === 'ready');
  const fin = await h.req('GET', `/interview/${id}/report`, H);
  A('H1 GET report → ready + content + attempts=1（0→claim+1）',
    fin.status === 200 && fin.body?.status === 'ready' && fin.body?.attempts === 1 && typeof fin.body?.content?.overall === 'number');
}

// ── H2 · 手动重试×3 轮零扣费（§4-③）──
{
  console.log('\n──────── H2 · 手动重试×3 轮：额度恒定 + consumption 恒 confirmed 单行 ────────');
  const owner = `rr229-h2-${S}`, id = IID('h2'), H = h.U(owner);
  await setupConfirmedWithReport(owner, id);
  const before = await httpUnits(H);
  const consBefore = await consRows(owner);

  await forceQuarantine(owner, id);
  for (let round = 1; round <= 3; round++) {
    const r = await h.post(`/interview/${id}/report/retry`, H, {});
    const mid = await h.req('GET', `/interview/${id}/report`, H);
    A(`H2 第 ${round} 轮手动重试 → 200 requeued + queued + attempts=0`,
      r.status === 200 && r.body?.requeued === true && mid.body?.status === 'queued' && mid.body?.attempts === 0);
    A(`H2 第 ${round} 轮零扣费：额度恒 ${before} + consumption byte-identical`,
      (await httpUnits(H)) === before && (await consRows(owner)) === consBefore);
    if (round < 3) {
      const f = await failOnce(owner, `h2-refail-${round}`);   // 模型继续故障 → 打回 failed（可再重试）
      A(`H2 第 ${round} 轮后打回 failed（重置预算后的第 1 次自动尝试）`, f === 'failed');
    }
  }
  A('H2 全程无 released/无新 consumption 行', (await consRows(owner)) === consBefore);
}

// ── H3 · 非 2xx 明确提示（§4-④）+ web 契约面静态门 ──
{
  console.log('\n──────── H3 · queued/ready retry → 404 no_retriable_report + web 契约面静态门 ────────');
  const owner = `rr229-h3-${S}`, H = h.U(owner);
  const readyId = IID('h3r');
  await setupConfirmedWithReport(owner, readyId);
  await drainReportsOnce(h.pool, owner, `w-rr229-${S}-h3r`, depsWith(goodGenerate));
  const rReady = await h.post(`/interview/${readyId}/report/retry`, H, {});
  A('H3 ready 上 retry → 404 {error:no_retriable_report}',
    rReady.status === 404 && rReady.body?.error === 'no_retriable_report');

  const queuedId = IID('h3q');
  await setupConfirmedWithReport(owner, queuedId);
  const rQueued = await h.post(`/interview/${queuedId}/report/retry`, H, {});
  A('H3 queued 上 retry → 404 {error:no_retriable_report}',
    rQueued.status === 404 && rQueued.body?.error === 'no_retriable_report');

  // web 契约面（§3-5/§3-6 静态门）：action 读返回码不吞；page 渲染 ④文案逐字 + 提示条；无重开面试替代出口。
  const actions = readRepo('apps/web/app/report/[id]/actions.ts');
  const page = readRepo('apps/web/app/report/[id]/page.tsx');
  A('H3 契约面 retryReportAction 读 r.ok（非 2xx 不静默吞）', /if \(!r\.ok\)/.test(actions));
  A('H3 契约面 非 2xx → redirect ?retry_error=<code>', /redirect\('\/report\/' \+ id \+ '\?retry_error='/.test(actions));
  A('H3 契约面 业务码透传（report_retry_limited / no_retriable_report → body.error）', /errorCode = b\.error/.test(actions));
  A('H3 契约面 page.tsx 渲染 ④文案逐字（系统已自动重试 N 次…不会重复扣费）',
    page.includes('报告生成失败，系统已自动重试') && page.includes('次；你可以再次重试，不会重复扣费'));
  A('H3 契约面 page.tsx 渲染 retry_error 提示条（重试太频繁/没有可重试的报告）',
    /retry_error === 'report_retry_limited'/.test(page) && page.includes('重试太频繁，请稍后再试。') && page.includes('当前没有可重试的报告。'));
  A('H3 契约面 Report type 含 attempts（N=attempts 如实渲染）', /attempts\?: number/.test(page));
  A('H3 契约面 禁「重新开一场面试」替代出口（unavailable 卡重试生成=唯一出口）', !page.includes('重新开一场面试'));
}

// ── H4 · 频控：第 1-3 次 200、第 4 次 429；跨报告互不影响（§4-频控）──
{
  console.log('\n──────── H4 · 频控 3 次/小时/份：429 report_retry_limited + per-interview key ────────');
  const owner = `rr229-h4-${S}`, id = IID('h4'), H = h.U(owner);
  await setupConfirmedWithReport(owner, id);
  const before = await httpUnits(H);
  const consBefore = await consRows(owner);

  A('H4 pre 打回 failed（可重试态）', (await failOnce(owner, 'h4-pre')) === 'failed');
  const r1 = await h.post(`/interview/${id}/report/retry`, H, {});
  A('H4 第 1 次 retry → 200（令牌 3→2）', r1.status === 200 && r1.body?.requeued === true);
  A('H4 第 1 次后打回 failed', (await failOnce(owner, 'h4-f1')) === 'failed');
  const r2 = await h.post(`/interview/${id}/report/retry`, H, {});
  A('H4 第 2 次 retry → 200（令牌 2→1）', r2.status === 200 && r2.body?.requeued === true);
  A('H4 第 2 次后打回 failed', (await failOnce(owner, 'h4-f2')) === 'failed');
  const r3 = await h.post(`/interview/${id}/report/retry`, H, {});
  A('H4 第 3 次 retry → 200（令牌 1→0）', r3.status === 200 && r3.body?.requeued === true);
  A('H4 第 3 次后打回 failed', (await failOnce(owner, 'h4-f3')) === 'failed');

  const r4 = await h.post(`/interview/${id}/report/retry`, H, {});
  A('H4 第 4 次 retry → 429 {error:report_retry_limited}（频控超限·明确提示）',
    r4.status === 429 && r4.body?.error === 'report_retry_limited');
  const st4 = await h.req('GET', `/interview/${id}/report`, H);
  A('H4 429 不改报告状态（仍 failed·attempts 不动）', st4.status === 200 && st4.body?.status === 'failed');
  A('H4 429 零扣费：额度不变 + consumption byte-identical',
    (await httpUnits(H)) === before && (await consRows(owner)) === consBefore);

  // 跨报告独立（per-interview key）：同 user 另一份报告的桶不受耗尽影响。
  const otherId = IID('h4other');
  await setupConfirmedWithReport(owner, otherId);
  await forceQuarantine(owner, otherId);
  const rOther = await h.post(`/interview/${otherId}/report/retry`, H, {});
  A('H4 跨报告互不影响：另一份 quarantined 报告 retry → 200（per-interview key）',
    rOther.status === 200 && rOther.body?.requeued === true);
}

console.log('\n──────── honesty pins ────────');
console.log('NOTE: 本 prove = §4-②③④+频控 HTTP 腿；§4-①⑥ db 腿 → report-retry:prove（packages/db）');
console.log('NOTE: 频控阈值=建议值 3 次/小时/份（S12 待用户追认·常量 REPORT_RETRY_RL 可调·改值不需重开 REQUEST）');
console.log('NOTE: 频控=单实例内存（与 signup 同 seam）·Redis 共享桶归 HA 簇 · ≠ 频控多实例完备');
console.log('NOTE: EXIT0 ≠ covered · UC-011/019 stays partial（翻转仅钉语义·coveredCount=8 不动）· releaseEvidence=false · Not HA');
A('honesty: HTTP prove 绿 ≠ 全链路 covered（钉语义翻转+频控行使 only）', true);

await done();
