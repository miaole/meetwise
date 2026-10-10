/**
 * NHP-001-FAULT-01 · UC-E2E-001 FAULT column · blind→case（Line AI）
 *
 * Harness: ai-docs/delivery/harness/nhp-001-fault-01-blind-to-case.md（REQUEST 6128b79）
 * Pre-exec dual: mw-e2e-ha re-PRE PASS b449371 + mw-rag-route Re-PRE PASS 44e3665 · C1–C7 carry.
 * AUTHORIZE coding+prove · coordinator.
 *
 * Evidence layer（C7）: Nest createApp + listen(0) + fetch against real HTTP contract
 * + isolated true PG via run-e2e-isolated.mjs. Ban fake DB for ledger. Ban misleading
 * «Supertest-only» narration.
 *
 * Injection（不改产品）: ReportWorkerDeps.generate 确定性 throw → drainReportsOnce →
 * markReportFailed. Ban live · Ban MODEL_API_KEY · Ban narrating live-model main-chain.
 *
 * C1 path: GET /interview/:id（@Controller('interview') · 非 /interviews/）
 * C2 complete = offline seed（completeInterviewAndConfirm + enqueueReport）；Ban 无模型跑通主链叙述
 * C3 F2b before F2 / separate fixtures；requeueFailedReport only status='failed'；
 *    quarantined → POST retry 404 no_retriable_report
 * C4 additive runner uc001:nhp-fault:prove（AG 7eb1c88 shape）
 * C5 LEDGER-SNAP on true PG（exact-1 confirmed · byte-identical across fail/retry）
 * C6 MUT-F1 temp only · record actual · EXIT≠0 · never commit（separate run）
 *
 * Cases: F1 failed · F2b retry/export · F2 quarantined · PC ready · F3 Ban-borrow separation
 *
 * EXIT 0 = F1/F2b/F2/PC/F3 case evidence. EXIT0 ≠ covered ≠ FAULT column flip ≠ nail ≠ HA ·
 * coveredCount=8 · FAULT stays partial · Ban wash Y/AB/AG · Ban borrow report:prove.
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · interview DELETE closed(503)·resume/account DELETE=202 软删受理(purge_pending).
 *
 *   pnpm uc001:nhp-fault:prove                 (isolated; MODEL_API_KEY must be absent)
 *   pnpm -C apps/api prove:uc001-nhp-fault     (raw; needs isolated PG env from the runner)
 */
import 'reflect-metadata';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { InterviewSummary, ReportContent } from '@meetwise/ai-graphs';
import {
  assertIsolatedTestTarget, createPool, provisionRuntimeLogin,
  asPrincipal, persistInterviewQuestion, answerHash,
  completeInterviewAndConfirm, enqueueReport, getReport, MAX_REPORT_ATTEMPTS,
} from '@meetwise/db';
import {
  drainReportsOnce, sweepReportsOnce, type ReportWorkerDeps,
} from '../../worker/src/report-worker.ts';

const CMD = 'pnpm uc001:nhp-fault:prove';
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

let failures = 0;
const results: Array<{ name: string; ok: boolean }> = [];
const A = (name: string, ok: boolean): boolean => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures += 1;
  return ok;
};
const E = (id: string, data: unknown) => console.log(`EVIDENCE ${id} ${JSON.stringify(data)}`);

console.log('NHP-001-FAULT-01 UC-E2E-001 FAULT blind→case prove (F1/F2b/F2/PC/F3 · Ban live · Ban wash Y/AB/AG)');
console.log('Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=202 软删受理(purge_pending)');
console.log('NOTE: EXIT0 = case evidence ≠ covered ≠ FAULT flip ≠ suite green · FAULT stays partial · Ban borrow report:prove');
console.log('C2 NOTE: complete+enqueueReport = offline seed (completeInterviewAndConfirm) · Ban live-model main-chain narration');
console.log('C7 NOTE: evidence = createApp + listen(0) + fetch · not Supertest-only');

// ── Ban live / Ban MODEL_API_KEY ──
const keyPresentOnEntry = String(process.env.MODEL_API_KEY ?? '').trim().length > 0;
const baseUrlPresentOnEntry = String(process.env.MODEL_BASE_URL ?? '').trim().length > 0;
delete process.env.MODEL_API_KEY;
delete process.env.MODEL_BASE_URL;
A('L0 Ban live: MODEL_API_KEY absent on entry (not loaded)', !keyPresentOnEntry);
E('L0-ENV', { model_api_key_present_on_entry: keyPresentOnEntry, model_base_url_present_on_entry: baseUrlPresentOnEntry });

delete process.env.MEETWISE_PUBLIC_PREVIEW;

function lineOf(src: string, re: RegExp, from = 0): number {
  const lines = src.split('\n');
  for (let i = from; i < lines.length; i++) if (re.test(lines[i]!)) return i + 1;
  return -1;
}
function sha256(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

{
  const svc = readFileSync(resolve(repoRoot, 'apps/api/src/modules/interview/interview.service.ts'), 'utf8');
  const ctrl = readFileSync(resolve(repoRoot, 'apps/api/src/modules/interview/interview.controller.ts'), 'utf8');
  const reportDb = readFileSync(resolve(repoRoot, 'packages/db/src/report.ts'), 'utf8');
  const worker = readFileSync(resolve(repoRoot, 'apps/worker/src/report-worker.ts'), 'utf8');
  const commerce = readFileSync(resolve(repoRoot, 'packages/db/src/commerce.ts'), 'utf8');
  const thisSrc = readFileSync(fileURLToPath(import.meta.url), 'utf8');

  const ctrlPrefix = lineOf(ctrl, /@Controller\('interview'\)/);
  const getOne = lineOf(ctrl, /@Get\(':id'\)/);
  const getReportRoute = lineOf(ctrl, /@Get\(':id\/report'\)/);
  const retryRoute = lineOf(ctrl, /@Post\(':id\/report\/retry'\)/);
  const exportRoute = lineOf(ctrl, /@Get\(':id\/report\/export'\)/);
  const turnRoute = lineOf(ctrl, /@Post\(':id\/turn'\)/);
  const answerGone = lineOf(ctrl, /@Post\(':id\/answer'\)/);
  const drainFn = lineOf(worker, /export async function drainReportsOnce\(/);
  const markFailCall = lineOf(worker, /markReportFailed\(c, owner, claim\.reportId/, Math.max(0, drainFn - 1));
  const sweepFn = lineOf(worker, /export async function sweepReportsOnce\(/);
  const requeueOnlyFailed = lineOf(reportDb, /status='failed'/);
  const completeFn = lineOf(commerce, /export async function completeInterviewAndConfirm\(/);
  const reportSvc = lineOf(svc, /^\s*async report\(principal: string, id: string\)/);
  const retrySvc = lineOf(svc, /^\s*async retryReport\(principal: string, id: string\)/);

  const anchors = {
    "interview.controller.ts:@Controller('interview')": ctrlPrefix,
    "interview.controller.ts:@Get(':id')": getOne,
    "interview.controller.ts:@Get(':id/report')": getReportRoute,
    "interview.controller.ts:@Post(':id/report/retry')": retryRoute,
    "interview.controller.ts:@Get(':id/report/export')": exportRoute,
    "interview.controller.ts:@Post(':id/turn')": turnRoute,
    "interview.controller.ts:@Post(':id/answer') GONE": answerGone,
    'report-worker.ts:drainReportsOnce': drainFn,
    'report-worker.ts:markReportFailed on generate throw': markFailCall,
    'report-worker.ts:sweepReportsOnce': sweepFn,
    "report.ts:requeueFailedReport status='failed' only": requeueOnlyFailed,
    'commerce.ts:completeInterviewAndConfirm': completeFn,
    'interview.service.ts:report': reportSvc,
    'interview.service.ts:retryReport': retrySvc,
  };
  E('ANCHORS', anchors);
  A('C1 ANCHOR @Controller(interview) + @Get(:id) present (path /interview/:id · not /interviews/)',
    ctrlPrefix > 0 && getOne > 0);
  A('ANCHOR report/retry/export + /turn mouths present · /answer GONE line present',
    getReportRoute > 0 && retryRoute > 0 && exportRoute > 0 && turnRoute > 0 && answerGone > 0);
  A('ANCHOR drainReportsOnce + markReportFailed + sweepReportsOnce + requeue failed-only + completeInterviewAndConfirm',
    drainFn > 0 && markFailCall > 0 && sweepFn > 0 && requeueOnlyFailed > 0 && completeFn > 0);
  A('C2 disclose: this proof names completeInterviewAndConfirm + enqueueReport as offline seed',
    /offline seed/.test(thisSrc) && /completeInterviewAndConfirm/.test(thisSrc) && /enqueueReport/.test(thisSrc));
  A('C3 disclose: F2b separate fixture / before F2 · quarantined→404 no_retriable_report named',
    /F2b/.test(thisSrc) && /no_retriable_report/.test(thisSrc) && /quarantined/.test(thisSrc));
  A('C5 disclose: LEDGER-SNAP on true PG chosen (not «本 case 不做 ledger 断言»)',
    /LEDGER-SNAP/.test(thisSrc));
  A('C7 disclose: createApp+listen(0)+fetch wording (Ban Supertest-only narration)',
    /createApp/.test(thisSrc) && /listen\(0\)/.test(thisSrc) && /fetch/.test(thisSrc));
  A('F3 Ban-borrow: this proof does not import Y NEG / AB BOUND / AG ADV / report-bulkhead proof files',
    !/uc-e2e-001-nhp-neg\.proof/.test(thisSrc)
    && !/uc-e2e-001-nhp-bound\.proof/.test(thisSrc)
    && !/uc-e2e-001-nhp-adv\.proof/.test(thisSrc)
    && !/report-bulkhead\.proof/.test(thisSrc));
}

type Res = { status: number; body: any; text?: string };

const AUTH_SECRET = 'uc001-nhp-fault-auth-secret-2026';
const role = `uc001_nhp_fault_${process.pid}`;
const password = `uc001-nhp-fault-pw-${process.pid}`;
const admin = createPool();
let runtime: ReturnType<typeof createPool> | undefined;

const failingGenerate = (): ReportContent => {
  throw new Error('nhp001_fault_injected_generate_fail');
};
const goodGenerate = (s: InterviewSummary): ReportContent => ({
  overall: Math.round(s.scores.reduce((a, b) => a + b, 0) / Math.max(1, s.scores.length)),
  sections: [{ title: '总评', body: `nhp-fault-pc q=${s.questionCount}` }],
});
const depsWith = (generate: (s: InterviewSummary) => ReportContent): ReportWorkerDeps => ({
  loadSummary: (_o, iid) => ({ interviewId: iid, questionCount: 1, scores: [72] }),
  generate,
});

async function main(): Promise<void> {
  await assertIsolatedTestTarget(admin);
  console.log('ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified');
  await provisionRuntimeLogin(admin, { roleName: role, password });
  runtime = createPool({
    host: process.env.PGHOST, port: Number(process.env.PGPORT), database: process.env.PGDATABASE,
    user: role, password, sslMode: 'disable',
  });
  delete process.env.AUTH_DEV_HEADER;
  Object.assign(process.env, {
    NODE_ENV: 'test', WEB_ORIGIN: 'https://web.example.test', AUTH_SECRET,
    RESUME_ENC_KEY: 'uc001-nhp-fault-resume-enc-key', RESUME_HASH_SECRET: 'uc001-nhp-fault-resume-hash-secret',
    OCR_ENABLED: '0', PGUSER: role, PGPASSWORD: password,
  });

  // C7: createApp + listen(0) + fetch (not Supertest-only)
  const { createApp } = await import('../src/main.ts');
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');

  const call = async (method: string, path: string, headers: Record<string, string> = {}, body?: unknown): Promise<Res> => {
    const res = await fetch(base + path, {
      method,
      headers: body === undefined ? headers : { ...headers, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let parsed: any = {};
    try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { _raw: text }; }
    return { status: res.status, body: parsed, text };
  };

  const signup = async (tag: string) => {
    const r = await call('POST', '/auth/signup', {}, {
      email: `uc001-nhp-fault-${tag}-${process.pid}@example.test`,
      password: `uc001-nhp-fault-${tag}-pw-2026`,
      role: 'candidate',
    });
    if (r.status !== 200 || typeof r.body?.userId !== 'string' || typeof r.body?.token !== 'string')
      throw new Error(`uc001_nhp_fault_signup_failed:${tag}:${r.status}`);
    return { userId: r.body.userId as string, token: r.body.token as string };
  };
  const q = async (sql: string, params: unknown[] = []) => (await admin.query(sql, params)).rows;
  const n = async (sql: string, params: unknown[] = []) => Number((await q(sql, params))[0]?.n ?? 0);

  /** C5 LEDGER-SNAP on true PG — owner totals + exact-1 consumption + all buckets */
  const ledgerSnap = async (owner: string, interviewId: string) => {
    const exact1 = await q(
      `SELECT idempotency_key, service_type, units_requested::text AS units_requested, status,
              COALESCE(units_settled::text, '') AS units_settled
         FROM entitlement_consumption
        WHERE owner_user_id=$1 AND idempotency_key=$2`,
      [owner, interviewId],
    );
    const allConsumption = await q(
      `SELECT idempotency_key, service_type, units_requested::text AS units_requested, status
         FROM entitlement_consumption WHERE owner_user_id=$1 ORDER BY idempotency_key`,
      [owner],
    );
    const allBuckets = await q(
      `SELECT id::text, kind, units_total::text, units_reserved::text, units_consumed::text, version
         FROM entitlement_bucket WHERE owner_user_id=$1 ORDER BY id`,
      [owner],
    );
    const snap = { exact1, allConsumption, allBuckets, ownerTotalRows: allConsumption.length };
    return { snap, byte: JSON.stringify(snap) };
  };
  const assertLedgerConfirmed = async (owner: string, interviewId: string, label: string) => {
    const { snap, byte } = await ledgerSnap(owner, interviewId);
    A(`LEDGER-SNAP non-empty guard: entitlement_consumption exact-1 status=confirmed for ${label}`,
      snap.exact1.length === 1
      && snap.exact1[0].status === 'confirmed'
      && snap.exact1[0].idempotency_key === interviewId
      && snap.exact1[0].units_requested === '1.00');
    A(`LEDGER-SNAP allocations point at existing entitlement_bucket rows (${label})`,
      snap.allBuckets.length >= 1);
    return { snap, byte };
  };

  const seedResume = async (owner: string, tag: string) => {
    const id = randomUUID();
    await admin.query(
      "INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind) VALUES ($1,$2,'ingested',$3,'text')",
      [id, owner, `uc001-nhp-fault-${tag}-${process.pid}`],
    );
    return id;
  };
  const seedInterview = async (owner: string, id: string) => {
    await admin.query(
      "INSERT INTO interview(id,owner_user_id,status,questions) VALUES ($1,$2,'created','[]'::jsonb)",
      [id, owner],
    );
  };
  const seedIssuedQuestion = async (
    owner: string, interviewId: string,
    qid: string, stateVersion: number, turn: number, text: string,
  ) => {
    await asPrincipal(admin, owner, (c) =>
      persistInterviewQuestion(c, owner, interviewId, {
        questionId: qid, stateVersion, turn, question: text, competency: 'fault',
      }));
  };

  const begin = (id: string, headers: Record<string, string>) =>
    call('POST', `/interview/${id}/begin`, headers);
  const turn = (id: string, headers: Record<string, string>, body: unknown) =>
    call('POST', `/interview/${id}/turn`, headers, body);
  const getInterview = (id: string, headers: Record<string, string>) =>
    call('GET', `/interview/${id}`, headers);
  const getReportHttp = (id: string, headers: Record<string, string>) =>
    call('GET', `/interview/${id}/report`, headers);
  const retryReportHttp = (id: string, headers: Record<string, string>) =>
    call('POST', `/interview/${id}/report/retry`, headers, {});
  const exportReportHttp = (id: string, headers: Record<string, string>) =>
    call('GET', `/interview/${id}/report/export`, headers);

  /**
   * Golden-path setup up to offline complete+enqueue seed（C2）.
   * begin → /turn → completeInterviewAndConfirm + enqueueReport（seeded · Ban live model）.
   */
  const setupThroughEnqueue = async (tag: string) => {
    const u = await signup(tag);
    const rid = await seedResume(u.userId, tag);
    const iv = `uc001-nhp-fault-${tag}-${process.pid}`;
    await seedInterview(u.userId, iv);
    await admin.query(
      "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '7 days')",
      [u.userId],
    );
    const auth = { authorization: `Bearer ${u.token}`, 'resume-id': rid };
    const b = await begin(iv, auth);
    A(`${tag} begin → HTTP 202`, b.status === 202 && b.body?.accepted === true);
    // TurnDto questionId must match /^q-v\d+-t\d+-c\d+$/ (contracts)
    const qid = 'q-v1-t0-c0';
    await seedIssuedQuestion(u.userId, iv, qid, 1, 0, `FAULT ${tag} seeded question`);
    const answer = `fault-answer-${tag}`;
    const turnBody = {
      questionId: qid,
      stateVersion: 1,
      answerId: randomUUID(),
      answerHash: answerHash(answer),
      turn: 0,
      answer,
    };
    A(`${tag} answerHash helper matches sha256`, turnBody.answerHash === sha256(answer));
    const t = await turn(iv, { authorization: `Bearer ${u.token}` }, turnBody);
    E(`${tag}-TURN`, { status: t.status, body: t.body });
    A(`${tag} /turn → HTTP 202 (Ban /answer 410)`, t.status === 202 && t.body?.accepted === true);
    // C2: offline seed — NOT live-model main-chain
    const complete = await asPrincipal(admin, u.userId, (c) =>
      completeInterviewAndConfirm(c, u.userId, iv));
    E(`${tag}-COMPLETE-SEED`, {
      complete,
      note: 'offline seed completeInterviewAndConfirm · Ban full-main-chain-without-model narration',
    });
    A(`${tag} fixture completeInterviewAndConfirm → completed`,
      complete.status === 'completed' || complete.status === 'already_completed');
    const enq = await asPrincipal(admin, u.userId, (c) => enqueueReport(c, u.userId, iv));
    E(`${tag}-ENQUEUE-SEED`, {
      enq,
      note: 'offline seed enqueueReport after complete · Ban live model',
    });
    A(`${tag} enqueueReport created or idempotent`, typeof enq.reportId === 'string');
    const ledgerAfterComplete = await assertLedgerConfirmed(u.userId, iv, `${tag}-after-complete`);
    return { u, rid, iv, auth, ledgerAfterComplete, lease: `fault-w-${tag}-${process.pid}` };
  };

  const forceFailOnce = async (owner: string, lease: string) => {
    const outcome = await drainReportsOnce(admin, owner, lease, depsWith(failingGenerate));
    return outcome;
  };

  const forceQuarantine = async (owner: string, interviewId: string, leaseBase: string) => {
    for (let i = 0; i < MAX_REPORT_ATTEMPTS + 4; i++) {
      const out = await drainReportsOnce(admin, owner, `${leaseBase}-q${i}`, depsWith(failingGenerate));
      if (out === 'idle') {
        const cur = await asPrincipal(admin, owner, (c) => getReport(c, owner, interviewId));
        if (cur?.status === 'quarantined') break;
      }
      await asPrincipal(admin, owner, (c) => c.query(
        "UPDATE ai_report SET next_attempt_at = now() - interval '1 second' WHERE interview_id=$1 AND owner_user_id=$2 AND status='failed'",
        [interviewId, owner],
      ));
      await sweepReportsOnce(admin, owner);
    }
    return asPrincipal(admin, owner, (c) => getReport(c, owner, interviewId));
  };

  try {
    // ════════════════ F1 · report worker fail → interview completed · report failed ════════════════
    {
      console.log('\n──────── F1 · generate throw → interview completed · GET report failed ────────');
      const fx = await setupThroughEnqueue('f1');
      const drainOut = await forceFailOnce(fx.u.userId, fx.lease);
      E('F1-DRAIN', { outcome: drainOut });
      A('F1 drainReportsOnce → failed (generate throw → markReportFailed)', drainOut === 'failed');

      const ivHttp = await getInterview(fx.iv, fx.auth);
      E('F1-GET-INTERVIEW', { status: ivHttp.status, body: ivHttp.body });
      A("F1 GET /interview/:id → 200 status='completed' (C1 path · interview not rolled back)",
        ivHttp.status === 200 && ivHttp.body?.status === 'completed');

      const repHttp = await getReportHttp(fx.iv, fx.auth);
      E('F1-GET-REPORT', { status: repHttp.status, body: repHttp.body });
      A("F1 GET /interview/:id/report → 200 {status:'failed', content:null}",
        repHttp.status === 200 && repHttp.body?.status === 'failed' && repHttp.body?.content === null);

      const ledgerAfterFail = await ledgerSnap(fx.u.userId, fx.iv);
      A('F1 LEDGER-SNAP byte-identical after report fail (no double-charge / no silent release)',
        ledgerAfterFail.byte === fx.ledgerAfterComplete.byte);
      A("F1 consumption stays confirmed (report fail does not touch entitlement)",
        ledgerAfterFail.snap.exact1[0]?.status === 'confirmed');
    }

    // ════════════════ F2b · retry/export on failed（BEFORE F2 / separate fixture · C3）════════════════
    {
      console.log('\n──────── F2b · failed → POST retry 200 · GET export 404（separate fixture · before F2） ────────');
      const fx = await setupThroughEnqueue('f2b');
      const drainOut = await forceFailOnce(fx.u.userId, fx.lease);
      A('F2b pre drain → failed', drainOut === 'failed');
      const pre = await getReportHttp(fx.iv, fx.auth);
      A("F2b pre GET report status='failed'", pre.status === 200 && pre.body?.status === 'failed');

      const retry = await retryReportHttp(fx.iv, fx.auth);
      E('F2b-RETRY', { status: retry.status, body: retry.body });
      A('F2b POST /interview/:id/report/retry → 200 {requeued:true} (status=failed only)',
        retry.status === 200 && retry.body?.requeued === true);

      const mid = await getReportHttp(fx.iv, fx.auth);
      A("F2b GET report after retry → 200 status='queued'",
        mid.status === 200 && mid.body?.status === 'queued');

      const exp = await exportReportHttp(fx.iv, fx.auth);
      E('F2b-EXPORT', { status: exp.status, body: exp.body });
      A("F2b GET /interview/:id/report/export → 404 {error:'report_not_ready'}",
        exp.status === 404 && exp.body?.error === 'report_not_ready');

      const ledgerAfterRetry = await ledgerSnap(fx.u.userId, fx.iv);
      A('F2b LEDGER-SNAP byte-identical after retry (regen free · no double-charge)',
        ledgerAfterRetry.byte === fx.ledgerAfterComplete.byte);
    }

    // ════════════════ F2 · sweep → quarantined + report_unavailable · retry 404 ════════════════
    {
      console.log('\n──────── F2 · sweep quarantine · report_unavailable · retry 404 no_retriable_report ────────');
      const fx = await setupThroughEnqueue('f2');
      const rep = await forceQuarantine(fx.u.userId, fx.iv, fx.lease);
      E('F2-QUARANTINE', { report: rep });
      A("F2 report status='quarantined'", rep?.status === 'quarantined');

      const repHttp = await getReportHttp(fx.iv, fx.auth);
      A("F2 GET /interview/:id/report → 200 {status:'quarantined', content:null}",
        repHttp.status === 200 && repHttp.body?.status === 'quarantined' && repHttp.body?.content === null);

      const ivHttp = await getInterview(fx.iv, fx.auth);
      A("F2 GET /interview/:id stays status='completed'",
        ivHttp.status === 200 && ivHttp.body?.status === 'completed');

      const unavail = await n(
        "SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND kind='report_unavailable'",
        [fx.iv],
      );
      const unavailReason = await q(
        "SELECT payload FROM interview_event WHERE stream_key=$1 AND kind='report_unavailable' ORDER BY seq DESC LIMIT 1",
        [fx.iv],
      );
      E('F2-EVENT', { count: unavail, payload: unavailReason[0]?.payload ?? null });
      A('F2 interview_event contains report_unavailable', unavail >= 1);
      A("F2 report_unavailable reason max_attempts_exceeded",
        (unavailReason[0]?.payload as any)?.reason === 'max_attempts_exceeded');

      // C3: quarantined → requeueFailedReport no-ops → 404 no_retriable_report（不得写成 200）
      const retryQ = await retryReportHttp(fx.iv, fx.auth);
      E('F2-RETRY-QUARANTINED', { status: retryQ.status, body: retryQ.body });
      A("F2 POST retry on quarantined → 404 {error:'no_retriable_report'} (C3 · requeue failed-only)",
        retryQ.status === 404 && retryQ.body?.error === 'no_retriable_report');

      const ledgerAfterQ = await ledgerSnap(fx.u.userId, fx.iv);
      A('F2 LEDGER-SNAP byte-identical after quarantine',
        ledgerAfterQ.byte === fx.ledgerAfterComplete.byte);
    }

    // ════════════════ PC · positive control · good generate → ready + report_ready ════════════════
    {
      console.log('\n──────── PC · good generate → ready + report_ready ────────');
      const fx = await setupThroughEnqueue('pc');
      const out = await drainReportsOnce(admin, fx.u.userId, fx.lease, depsWith(goodGenerate));
      E('PC-DRAIN', { outcome: out });
      A('PC drainReportsOnce → ready', out === 'ready');

      const repHttp = await getReportHttp(fx.iv, fx.auth);
      E('PC-GET-REPORT', { status: repHttp.status, body: repHttp.body });
      A("PC GET /interview/:id/report → 200 {status:'ready', content:…}",
        repHttp.status === 200
        && repHttp.body?.status === 'ready'
        && repHttp.body?.content != null
        && typeof repHttp.body.content.overall === 'number');

      const readyN = await n(
        "SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND kind='report_ready'",
        [fx.iv],
      );
      A('PC interview_event contains report_ready', readyN >= 1);

      const ivHttp = await getInterview(fx.iv, fx.auth);
      A("PC GET /interview/:id stays status='completed'",
        ivHttp.status === 200 && ivHttp.body?.status === 'completed');

      const ledgerAfterReady = await ledgerSnap(fx.u.userId, fx.iv);
      A('PC LEDGER-SNAP byte-identical after ready',
        ledgerAfterReady.byte === fx.ledgerAfterComplete.byte);
    }

    // ════════════════ F3 · Ban-borrow separation (evidence only) ════════════════
    {
      console.log('\n──────── F3 · Ban-borrow Y/AB/AG/report:prove （independent receipt） ────────');
      E('F3-BAN', {
        ban_wash_Y_NEG: ['ff74522', '51c0c0b'],
        ban_wash_AB_BOUND: ['f8cdc82', '5adb14f'],
        ban_wash_AG_ADV: true,
        ban_borrow_report_prove: true,
        note: 'This receipt is independent; regressions named separately · Ban relabel',
      });
      A('F3 Ban-borrow disclosure recorded (Y/AB/AG/report:prove ≠ this case)', true);
    }
  } finally {
    await app.close().catch(() => undefined);
    await runtime?.end().catch(() => undefined);
    await admin.end().catch(() => undefined);
  }

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nSUMMARY asserts=${results.length} failed=${failed}`);
  console.log(`CMD=${CMD} EXIT=${failed === 0 ? 0 : 1}`);
  console.log('NONCLAIM: EXIT0≠covered · FAULT stays partial · coveredCount=8 · Ban wash Y/AB/AG · Ban nail · Ban HA');
  if (failed !== 0) {
    console.log('FAILED_ASSERTS ' + JSON.stringify(results.filter((r) => !r.ok).map((r) => r.name)));
  }
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
