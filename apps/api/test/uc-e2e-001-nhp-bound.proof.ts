/**
 * NHP-001-BOUND-01 · UC-E2E-001 BOUND column · blind→case（Line AB）
 *
 * Harness: ai-docs/delivery/harness/nhp-001-bound-01-blind-to-case.md（REQUEST c6dd1a67）
 * Pre-exec dual: mw-e2e-ha d448da9 PASS + mw-rag-route 64252be PASS.
 *
 * Honesty (rag-route §3): product ALREADY has begin idempotency (interview id key ·
 * advisory lock · alreadyBegun · reserveEntitlement ON CONFLICT). This knife = BOUND
 * prove of non-zero wiring / dedicated UC-001 receipt — NOT inventing a product mouth.
 *
 * Real HTTP + real migrated isolated PostgreSQL（run-e2e-isolated.mjs · least-privilege
 * runtime login · RLS on · in-process NestJS createApp）. No worker, no model gateway,
 * no live provider. Ban live · Ban MODEL_API_KEY.
 *
 *   B1 same-interview repeat begin（idempotency key = interview id, NOT HTTP header）
 *      B1a first begin → 202 accepted + exactly one ConsumptionRecord（key=interview id）
 *      B1b second begin → 202 alreadyBegun + same jobId · ledger byte-identical · no 双扣
 *   B2 boundary: UC-017 / commerce orphan prove ≠ this receipt（this file does not call them）
 *
 * EXIT 0 = B1 case-level evidence only. EXIT0 ≠ covered · ≠ UC-E2E-001 covered · ≠
 * e2e:isolated suite green · ≠ trio green · coveredCount=8 · happy path may stay blind.
 * Ban wash Line Y NEG / FUNNEL / G-R4-5 · Ban touch 018/052/025/004/011.
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · interview DELETE closed(503)·resume/account DELETE=202 软删受理(purge_pending).
 *
 *   pnpm uc001:nhp-bound:prove                 (isolated; MODEL_API_KEY must be absent)
 *   pnpm -C apps/api prove:uc001-nhp-bound     (raw; needs isolated PG env from the runner)
 */
import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertIsolatedTestTarget, createPool, provisionRuntimeLogin } from '@meetwise/db';

const CMD = 'pnpm uc001:nhp-bound:prove';
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

console.log('NHP-001-BOUND-01 UC-E2E-001 BOUND blind→case prove (B1 same-interview repeat begin · interview-id idempotency)');
console.log('Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=202 软删受理(purge_pending)');
console.log('NOTE: EXIT0 = case evidence ≠ covered ≠ suite green ≠ trio green · Ban live · Ban MODEL_API_KEY · UC-017/Y-NEG 旁证 ≠ this receipt');
console.log('NOTE: product already has begin idempotency (interview id key · advisory · alreadyBegun · ON CONFLICT) — this prove wires BOUND evidence only');

// ── Ban live / Ban MODEL_API_KEY: fail closed if the operator leaked a key into this process ──
const keyPresentOnEntry = String(process.env.MODEL_API_KEY ?? '').trim().length > 0;
const baseUrlPresentOnEntry = String(process.env.MODEL_BASE_URL ?? '').trim().length > 0;
delete process.env.MODEL_API_KEY;
delete process.env.MODEL_BASE_URL;
A('L0 Ban live: MODEL_API_KEY absent on entry (not loaded)', !keyPresentOnEntry);
E('L0-ENV', { model_api_key_present_on_entry: keyPresentOnEntry, model_base_url_present_on_entry: baseUrlPresentOnEntry });

// ── Static anchors (rag-route C-3 / prove nail points): product mouth already present ──
function lineOf(src: string, re: RegExp, from = 0): number {
  const lines = src.split('\n');
  for (let i = from; i < lines.length; i++) if (re.test(lines[i]!)) return i + 1;
  return -1;
}
{
  const svc = readFileSync(resolve(repoRoot, 'apps/api/src/modules/interview/interview.service.ts'), 'utf8');
  const ctrl = readFileSync(resolve(repoRoot, 'apps/api/src/modules/interview/interview.controller.ts'), 'utf8');
  const commerce = readFileSync(resolve(repoRoot, 'packages/db/src/commerce.ts'), 'utf8');
  const beginLine = lineOf(svc, /^\s*begin\(principal: string, id: string, resumeId: string/);
  const advisoryLine = lineOf(svc, /pg_advisory_xact_lock\(hashtext\(\$1\), hashtext\(\$2\)\).*\[\s*'begin'\s*,\s*id\s*\]/, Math.max(0, beginLine - 1));
  // fallback if comment-style match fails — match the lock call near begin
  const advisoryLine2 = advisoryLine > 0 ? advisoryLine : lineOf(svc, /SELECT pg_advisory_xact_lock\(hashtext\(\$1\), hashtext\(\$2\)\)/, Math.max(0, beginLine - 1));
  const alreadyBegunLine = lineOf(svc, /return \{ accepted: true, jobId: existing\.rows\[0\]\.id, alreadyBegun: true \}/, Math.max(0, beginLine - 1));
  const reserveLine = lineOf(svc, /reserveEntitlement\(c, principal, id, 'mock_interview', 1\.0\)/, Math.max(0, beginLine - 1));
  const enqueueLine = lineOf(svc, /enqueueInterviewJob\(c, principal, id, 'start'/, Math.max(0, beginLine - 1));
  const beginRouteLine = lineOf(ctrl, /@Post\(':id\/begin'\)/);
  const http202Line = lineOf(ctrl, /@HttpCode\(202\)/, Math.max(0, beginRouteLine - 1));
  const onConflictLine = lineOf(commerce, /ON CONFLICT \(owner_user_id, idempotency_key\) DO NOTHING/);
  const duplicateLine = lineOf(commerce, /status: 'duplicate'/);
  const reserveFnLine = lineOf(commerce, /export async function reserveEntitlement\(/);
  const anchors = {
    'interview.service.ts:begin': beginLine,
    'interview.service.ts:pg_advisory_xact_lock(begin,id)': advisoryLine2,
    'interview.service.ts:alreadyBegun': alreadyBegunLine,
    'interview.service.ts:reserveEntitlement(interviewIdKey)': reserveLine,
    'interview.service.ts:enqueueInterviewJob(start)': enqueueLine,
    'interview.controller.ts:@Post(:id/begin)': beginRouteLine,
    'interview.controller.ts:@HttpCode(202)': http202Line,
    'commerce.ts:reserveEntitlement': reserveFnLine,
    'commerce.ts:ON CONFLICT DO NOTHING': onConflictLine,
    'commerce.ts:duplicate status': duplicateLine,
  };
  for (const [k, v] of Object.entries(anchors)) console.log(`ANCHOR ${k}=${v}`);
  A('ANCHOR-B1 begin serializes on advisory(begin,id) then alreadyBegun short-circuit before second reserve',
    beginLine > 0 && advisoryLine2 > beginLine && alreadyBegunLine > advisoryLine2 && reserveLine > alreadyBegunLine && enqueueLine > reserveLine);
  A('ANCHOR-B1 reserveEntitlement idempotency_key = interview id (3rd arg = id); ON CONFLICT DO NOTHING + duplicate in commerce',
    reserveLine > 0 && reserveFnLine > 0 && onConflictLine > reserveFnLine && duplicateLine > 0);
  A('ANCHOR-B1 POST :id/begin returns HttpCode 202',
    beginRouteLine > 0 && http202Line === beginRouteLine + 1);
  // B2: this proof must not wash UC-017 orphan prove / Line Y NEG into BOUND covered
  // Documentary Ban-wash mentions in comments/logs are allowed; only executable imports/calls are forbidden.
  const thisSrc = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const executableWash = /(?:from\s+['"][^'"]*(?:uc-e2e-001-nhp-neg|_neg-harness|uc017)[^'"]*['"]|import\s*\(\s*['"][^'"]*(?:uc-e2e-001-nhp-neg|_neg-harness|uc017)|(?:spawn|exec|execFile)\s*\([^)]*(?:uc017:orphan|uc001:nhp-neg|prove:uc017|prove:uc001-nhp-neg)|pnpm\s+uc001:nhp-neg|pnpm\s+uc017:orphan)/;
  A('B2 boundary: this receipt does not import/call uc017 orphan prove or nhp-neg proof',
    !executableWash.test(thisSrc));
}

// ── Runtime: isolated PG + least-privilege runtime login + real NestJS app ──
const admin = createPool();
const role = `uc001_nhp_bound_${process.pid}`;
const password = `uc001-nhp-bound-runtime-${randomUUID()}`;
const AUTH_SECRET = `uc001-nhp-bound-auth-${randomUUID()}`;
let runtime: ReturnType<typeof createPool> | undefined;

type Res = { status: number; body: any };

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
    RESUME_ENC_KEY: 'uc001-nhp-bound-resume-enc-key', RESUME_HASH_SECRET: 'uc001-nhp-bound-resume-hash-secret',
    OCR_ENABLED: '0', PGUSER: role, PGPASSWORD: password,
  });
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
    return { status: res.status, body: await res.json().catch(() => ({})) };
  };
  const signup = async (tag: string) => {
    const r = await call('POST', '/auth/signup', {}, {
      email: `uc001-nhp-bound-${tag}-${process.pid}@example.test`, password: `uc001-nhp-bound-${tag}-pw-2026`, role: 'candidate',
    });
    if (r.status !== 200 || typeof r.body?.userId !== 'string' || typeof r.body?.token !== 'string')
      throw new Error(`uc001_nhp_bound_signup_failed:${tag}:${r.status}`);
    return { userId: r.body.userId as string, token: r.body.token as string };
  };
  const q = async (sql: string, params: unknown[] = []) => (await admin.query(sql, params)).rows;
  const n = async (sql: string, params: unknown[] = []) => Number((await q(sql, params))[0]?.n ?? 0);
  const ledger = async (owner: string) => JSON.stringify({
    bucket: await q(`SELECT id::text, kind, units_total::text, units_reserved::text, units_consumed::text, version
                       FROM entitlement_bucket WHERE owner_user_id=$1 ORDER BY id`, [owner]),
    consumption: await q(`SELECT idempotency_key, service_type, units_requested::text, status
                            FROM entitlement_consumption WHERE owner_user_id=$1 ORDER BY idempotency_key`, [owner]),
  });
  const ivState = async (id: string) => (await q(
    `SELECT status, resume_id::text AS resume_id, resume_privacy_epoch::text AS epoch, version::text AS version
       FROM interview WHERE id=$1`, [id]))[0] ?? null;
  const jobs = (id: string) => n('SELECT count(*)::int AS n FROM interview_job WHERE interview_id=$1 AND kind=$2', [id, 'start']);
  const sideEffects = async () => ({
    ai_model_invocation: await n('SELECT count(*)::int AS n FROM ai_model_invocation'),
    ai_invocation_trace: (await q("SELECT to_regclass('public.ai_invocation_trace') IS NOT NULL AS e"))[0]?.e
      ? await n('SELECT count(*)::int AS n FROM ai_invocation_trace') : -1,
  });
  const seedResume = async (owner: string, tag: string) => {
    const id = randomUUID();
    await admin.query("INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind) VALUES ($1,$2,'ingested',$3,'text')",
      [id, owner, `uc001-nhp-bound-${tag}-${process.pid}`]);
    return id;
  };
  const seedInterview = async (owner: string, id: string) => {
    await admin.query("INSERT INTO interview(id,owner_user_id,status,questions) VALUES ($1,$2,'created','[]'::jsonb)", [id, owner]);
  };
  const begin = (id: string, headers: Record<string, string>) => call('POST', `/interview/${id}/begin`, headers);

  const fxStart = await sideEffects();
  try {
    // ════════════════ B1 · same principal + same interview id（idempotency key）repeat begin ════════════════
    {
      const u = await signup('b1');
      const rid = await seedResume(u.userId, 'b1');
      // Interview id IS the commerce idempotency key (reserveEntitlement 3rd arg) — not an HTTP Idempotency-Key header.
      const iv = `uc001-nhp-bound-b1-${process.pid}`;
      await seedInterview(u.userId, iv);
      // Enough units that a double-charge WOULD be visible (reserved would become 2.00) — Ban exhaustion false-positive.
      await admin.query(
        "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '7 days')",
        [u.userId],
      );
      const auth = { authorization: `Bearer ${u.token}`, 'resume-id': rid };
      const ledgerBefore = await ledger(u.userId);
      const ivBefore = await ivState(iv);

      const first = await begin(iv, auth);
      const ledgerAfterFirst = await ledger(u.userId);
      const afterFirst = JSON.parse(ledgerAfterFirst);
      const j1 = await jobs(iv);
      const ivAfterFirst = await ivState(iv);
      E('B1a', {
        http: first,
        interview_before: ivBefore,
        interview_after: ivAfterFirst,
        start_jobs: j1,
        ledger_before: JSON.parse(ledgerBefore),
        ledger_after: afterFirst,
        idempotency_key_expected: iv,
      });
      A('B1a first begin → HTTP 202 accepted with jobId',
        first.status === 202 && first.body?.accepted === true && typeof first.body?.jobId === 'string' && first.body?.alreadyBegun !== true);
      A('B1a exactly one ConsumptionRecord · idempotency_key === interview id · status reserved · 1.00 unit',
        afterFirst.consumption.length === 1
        && afterFirst.consumption[0].idempotency_key === iv
        && afterFirst.consumption[0].service_type === 'mock_interview'
        && afterFirst.consumption[0].units_requested === '1.00'
        && afterFirst.consumption[0].status === 'reserved');
      A('B1a bucket reserved exactly 1.00 (of 5.00) · version bumped once',
        afterFirst.bucket.length === 1
        && afterFirst.bucket[0].units_total === '5.00'
        && afterFirst.bucket[0].units_reserved === '1.00'
        && afterFirst.bucket[0].units_consumed === '0.00'
        && afterFirst.bucket[0].version === 1);
      A('B1a exactly one start job enqueued', j1 === 1);
      A('B1a interview bound to resume (created stays until worker; resume_id set)',
        ivAfterFirst?.resume_id === rid && ivAfterFirst?.status === 'created');

      // B1b · sequential replay — same principal + same interview id key
      const second = await begin(iv, auth);
      const ledgerAfterSecond = await ledger(u.userId);
      const afterSecond = JSON.parse(ledgerAfterSecond);
      const j2 = await jobs(iv);
      const ivAfterSecond = await ivState(iv);
      E('B1b', {
        http: second,
        interview_after: ivAfterSecond,
        start_jobs: j2,
        ledger_after_first: afterFirst,
        ledger_after_second: afterSecond,
      });
      A('B1b second begin → HTTP 202 alreadyBegun with SAME jobId (idempotent safe)',
        second.status === 202
        && second.body?.accepted === true
        && second.body?.alreadyBegun === true
        && second.body?.jobId === first.body?.jobId);
      A('B1b ledger byte-identical after replay (no 双扣 · no second ConsumptionRecord)',
        ledgerAfterSecond === ledgerAfterFirst);
      A('B1b still exactly one ConsumptionRecord keyed by interview id',
        afterSecond.consumption.length === 1 && afterSecond.consumption[0].idempotency_key === iv);
      A('B1b still exactly one start job (no double enqueue)', j2 === 1);
      A('B1b interview state unchanged by replay (same resume_id/status/version)',
        ivAfterSecond?.resume_id === ivAfterFirst?.resume_id
        && ivAfterSecond?.status === ivAfterFirst?.status
        && ivAfterSecond?.version === ivAfterFirst?.version);

      // Third replay — still stable (reinforces idempotent mouth, still B1 face)
      const third = await begin(iv, auth);
      const ledgerAfterThird = await ledger(u.userId);
      E('B1c', { http: third, ledger_after_third: JSON.parse(ledgerAfterThird), start_jobs: await jobs(iv) });
      A('B1c third begin still alreadyBegun · same jobId · ledger still identical',
        third.status === 202
        && third.body?.alreadyBegun === true
        && third.body?.jobId === first.body?.jobId
        && ledgerAfterThird === ledgerAfterFirst
        && (await jobs(iv)) === 1);
    }

    const fxEnd = await sideEffects();
    E('ZERO-MODEL-SIDE-EFFECTS', { start: fxStart, end: fxEnd });
    A('L1 zero ai_model_invocation / ai_invocation_trace rows created (no model path reached · Ban live)',
      fxEnd.ai_model_invocation === fxStart.ai_model_invocation && fxEnd.ai_invocation_trace === fxStart.ai_invocation_trace);
  } finally {
    await app.close();
    await runtime?.end();
    await admin.query(`DROP ROLE IF EXISTS ${role}`).catch(() => undefined);
    await admin.end();
  }
}

main().then(() => {
  const exit = failures === 0 ? 0 : 1;
  console.log('');
  console.log(`SUMMARY asserts=${results.length} failed=${failures}`);
  if (exit === 0) {
    console.log('CASE  NHP-001-BOUND-01 B1(same-interview-id repeat begin → single ConsumptionRecord / alreadyBegun / no 双扣) real HTTP+PG evidence = blind→case');
    console.log('NOTE  EXIT0 ≠ covered · ≠ UC-E2E-001 covered · ≠ e2e:isolated suite green · ≠ trio green · coveredCount=8 · happy path may stay blind');
  } else {
    console.log('GAP   GAP-UC001-BOUND-01 EXIT=1 honest red retained (Ban retry-to-green · Ban flake label · Ban loosening asserts)');
  }
  console.log('NOTE  releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · PG-retained · DELETE=202 软删受理(purge_pending) · no SSOT flip · no nail');
  console.log(`CMD=${CMD} EXIT=${exit}`);
  process.exit(exit);
}).catch(async (error) => {
  console.error(error);
  console.log(`GAP   GAP-UC001-BOUND-01 EXIT=1 prove aborted: ${error instanceof Error ? error.message : String(error)}`);
  console.log(`CMD=${CMD} EXIT=1`);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
