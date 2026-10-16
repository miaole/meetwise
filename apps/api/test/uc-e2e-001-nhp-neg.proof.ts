/**
 * NHP-001-NEG-01 · UC-E2E-001 NEG column · blind→case（Line Y）
 *
 * Harness: ai-docs/delivery/harness/nhp-001-neg-01-blind-to-case.md（REQUEST 48e2a3b）
 * Pre-exec dual: mw-e2e-ha 78be465 PASS + mw-rag-route ad37608 PASS.
 *
 * Real HTTP + real migrated isolated PostgreSQL（run-e2e-isolated.mjs · least-privilege runtime login ·
 * RLS on · in-process NestJS createApp）. No worker, no model gateway, no live provider.
 *
 *   N1 insufficient entitlement on the golden-path open（POST /interview/:id/begin）
 *      N1a zero-entitlement principal           → 402 insufficient_entitlement
 *      N1b exhausted principal（1.0 used by a prior begin）→ 402 insufficient_entitlement
 *      observe: interview stays `created`（never active）, resume binding rolled back, zero start job,
 *               ledger unchanged / no double reservation, zero model-invocation / trace rows.
 *      anchor: interview.service.ts reserveEntitlement → HttpStatus.PAYMENT_REQUIRED（rag C-3 :284-289）
 *   N2 authentication failure on the same open（PrincipalGuard）
 *      N2a no credential · N2b malformed bearer · N2c wrong-secret bearer · N2d expired bearer ·
 *      N2e x-user-id spoof with dev header disabled → 401 (invalid_token | unauthenticated)
 *      observe: no interview mutation, no job, no ledger write; a later authenticated control on the
 *               SAME interview returns 202 → the 401s are the guard, not another precondition.
 *      anchor: interview.controller.ts @UseGuards(PrincipalGuard)（:15）· principal.guard.ts invalid_token
 *              （:54）/ unauthenticated（:68）
 *
 * EXIT 0 = N1+N2 case-level evidence only. EXIT0 ≠ covered · ≠ UC-E2E-001 covered · ≠ e2e:isolated suite
 * green · ≠ trio green · coveredCount=8 · happy path may still be blind. EXIT 1 = honest red（Ban
 * retry-to-green · Ban flake label · Ban loosening asserts）. neg:auth / neg:interview / neg:commerce /
 * UC-011 / UC-017 are 旁证 and are NOT this receipt; this file does not import _neg-harness.
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · interview DELETE closed(503)·resume/account DELETE=202 软删受理(purge_pending).
 *
 *   pnpm uc001:nhp-neg:prove                 (isolated; MODEL_API_KEY must be absent)
 *   pnpm -C apps/api prove:uc001-nhp-neg     (raw; needs isolated PG env from the runner)
 */
import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { signToken } from '@meetwise/domain';
import { assertIsolatedTestTarget, createPool, provisionRuntimeLogin } from '@meetwise/db';

const CMD = 'pnpm uc001:nhp-neg:prove';
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

console.log('NHP-001-NEG-01 UC-E2E-001 NEG blind→case prove (N1 insufficient_entitlement · N2 PrincipalGuard)');
console.log('Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=202 软删受理(purge_pending)');
console.log('NOTE: EXIT0 = case evidence ≠ covered ≠ suite green ≠ trio green · Ban live · Ban MODEL_API_KEY · neg:auth/011/017 旁证 ≠ this receipt');

// ── Ban live / Ban MODEL_API_KEY: fail closed if the operator leaked a key into this process ──
const keyPresentOnEntry = String(process.env.MODEL_API_KEY ?? '').trim().length > 0;
const baseUrlPresentOnEntry = String(process.env.MODEL_BASE_URL ?? '').trim().length > 0;
delete process.env.MODEL_API_KEY;
delete process.env.MODEL_BASE_URL;
A('L0 Ban live: MODEL_API_KEY absent on entry (not loaded)', !keyPresentOnEntry);
E('L0-ENV', { model_api_key_present_on_entry: keyPresentOnEntry, model_base_url_present_on_entry: baseUrlPresentOnEntry });

// ── Static anchors (rag-route C-3): bind the observed HTTP codes to the product lines that emit them ──
function lineOf(src: string, re: RegExp, from = 0): number {
  const lines = src.split('\n');
  for (let i = from; i < lines.length; i++) if (re.test(lines[i]!)) return i + 1;
  return -1;
}
{
  const svc = readFileSync(resolve(repoRoot, 'apps/api/src/modules/interview/interview.service.ts'), 'utf8');
  const ctrl = readFileSync(resolve(repoRoot, 'apps/api/src/modules/interview/interview.controller.ts'), 'utf8');
  const guard = readFileSync(resolve(repoRoot, 'apps/api/src/platform/principal.guard.ts'), 'utf8');
  const beginLine = lineOf(svc, /^\s*begin\(principal: string, id: string, resumeId: string/);
  const reserveLine = lineOf(svc, /reserveEntitlement\(c, principal, id, 'mock_interview', 1\.0\)/, Math.max(0, beginLine - 1));
  const catch402Line = lineOf(svc, /e\?\.code === 'insufficient_entitlement'.*insufficient_entitlement.*HttpStatus\.PAYMENT_REQUIRED/, Math.max(0, reserveLine - 1));
  const status402Line = lineOf(svc, /rr\.status !== 'reserved'.*insufficient_entitlement.*HttpStatus\.PAYMENT_REQUIRED/, Math.max(0, reserveLine - 1));
  const enqueueLine = lineOf(svc, /enqueueInterviewJob\(c, principal, id, 'start'/, Math.max(0, beginLine - 1));
  const guardDecoLine = lineOf(ctrl, /^@UseGuards\(PrincipalGuard\)\s*$/);
  const ctrlClassLine = lineOf(ctrl, /^export class InterviewController\b/);
  const beginRouteLine = lineOf(ctrl, /@Post\(':id\/begin'\)/);
  const invalidTokenLine = lineOf(guard, /throw new UnauthorizedException\(\{ error: 'invalid_token' \}\)/);
  const unauthLine = lineOf(guard, /throw new UnauthorizedException\(\{ error: 'unauthenticated' \}\)/);
  const devHeaderGateLine = lineOf(guard, /AUTH_DEV_HEADER === '1' && process\.env\.NODE_ENV !== 'production'/);
  const anchors = {
    'interview.service.ts:begin': beginLine,
    'interview.service.ts:reserveEntitlement': reserveLine,
    'interview.service.ts:402(catch insufficient_entitlement)': catch402Line,
    'interview.service.ts:402(rr.status!==reserved)': status402Line,
    'interview.service.ts:enqueueInterviewJob(start)': enqueueLine,
    'interview.controller.ts:@UseGuards(PrincipalGuard)': guardDecoLine,
    'interview.controller.ts:class InterviewController': ctrlClassLine,
    'interview.controller.ts:@Post(:id/begin)': beginRouteLine,
    'principal.guard.ts:401 invalid_token': invalidTokenLine,
    'principal.guard.ts:401 unauthenticated': unauthLine,
    'principal.guard.ts:dev-header gate': devHeaderGateLine,
  };
  for (const [k, v] of Object.entries(anchors)) console.log(`ANCHOR ${k}=${v}`);
  A('ANCHOR-N1 402 insufficient_entitlement emitted inside begin, after reserveEntitlement, before start-job enqueue',
    beginLine > 0 && reserveLine > beginLine && catch402Line > reserveLine && status402Line > catch402Line && enqueueLine > status402Line);
  A('ANCHOR-N2 PrincipalGuard is class-level on InterviewController (covers POST :id/begin)',
    guardDecoLine > 0 && ctrlClassLine === guardDecoLine + 1 && beginRouteLine > ctrlClassLine);
  A('ANCHOR-N2 PrincipalGuard emits 401 invalid_token / unauthenticated; dev header gated',
    invalidTokenLine > 0 && unauthLine > invalidTokenLine && devHeaderGateLine > invalidTokenLine && devHeaderGateLine < unauthLine);
}

// ── Runtime: isolated PG + least-privilege runtime login + real NestJS app ──
const admin = createPool();
const role = `uc001_nhp_neg_${process.pid}`;
const password = `uc001-nhp-neg-runtime-${randomUUID()}`;
const AUTH_SECRET = `uc001-nhp-neg-auth-${randomUUID()}`;
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
  // Dev x-user-id fallback must be OFF so N2e proves the guard, not a test shortcut.
  delete process.env.AUTH_DEV_HEADER;
  Object.assign(process.env, {
    NODE_ENV: 'test', WEB_ORIGIN: 'https://web.example.test', AUTH_SECRET,
    RESUME_ENC_KEY: 'uc001-nhp-neg-resume-enc-key', RESUME_HASH_SECRET: 'uc001-nhp-neg-resume-hash-secret',
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
      email: `uc001-nhp-neg-${tag}-${process.pid}@example.test`, password: `uc001-nhp-neg-${tag}-pw-2026`, role: 'candidate',
    });
    if (r.status !== 200 || typeof r.body?.userId !== 'string' || typeof r.body?.token !== 'string')
      throw new Error(`uc001_nhp_neg_signup_failed:${tag}:${r.status}`);
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
  const jobs = (id: string) => n('SELECT count(*)::int AS n FROM interview_job WHERE interview_id=$1', [id]);
  const activeCount = (owner: string) => n("SELECT count(*)::int AS n FROM interview WHERE owner_user_id=$1 AND status='active'", [owner]);
  const sideEffects = async () => ({
    ai_model_invocation: await n('SELECT count(*)::int AS n FROM ai_model_invocation'),
    ai_invocation_trace: (await q("SELECT to_regclass('public.ai_invocation_trace') IS NOT NULL AS e"))[0]?.e
      ? await n('SELECT count(*)::int AS n FROM ai_invocation_trace') : -1,
  });
  const seedResume = async (owner: string, tag: string) => {
    const id = randomUUID();
    await admin.query("INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind) VALUES ($1,$2,'ingested',$3,'text')",
      [id, owner, `uc001-nhp-neg-${tag}-${process.pid}`]);
    return id;
  };
  const seedInterview = async (owner: string, id: string) => {
    await admin.query("INSERT INTO interview(id,owner_user_id,status,questions) VALUES ($1,$2,'created','[]'::jsonb)", [id, owner]);
  };
  const begin = (id: string, headers: Record<string, string>) => call('POST', `/interview/${id}/begin`, headers);
  const is = (r: Res, status: number, err?: string) => r.status === status && (err === undefined || r.body?.error === err);

  const fxStart = await sideEffects();
  try {
    // ════════════════ N1a · zero-entitlement principal ════════════════
    {
      const u = await signup('n1a');
      const rid = await seedResume(u.userId, 'n1a');
      const iv = `uc001-nhp-neg-n1a-${process.pid}`;
      await seedInterview(u.userId, iv);
      const bucketsBefore = await n('SELECT count(*)::int AS n FROM entitlement_bucket WHERE owner_user_id=$1', [u.userId]);
      A('N1a precondition: principal has zero entitlement buckets', bucketsBefore === 0);
      const ledgerBefore = await ledger(u.userId);
      const ivBefore = await ivState(iv);
      const r = await begin(iv, { authorization: `Bearer ${u.token}`, 'resume-id': rid });
      const ivAfter = await ivState(iv);
      const ledgerAfter = await ledger(u.userId);
      const j = await jobs(iv);
      const act = await activeCount(u.userId);
      E('N1a', { http: r, interview_before: ivBefore, interview_after: ivAfter, start_jobs: j, active_interviews: act,
        ledger_before: JSON.parse(ledgerBefore), ledger_after: JSON.parse(ledgerAfter) });
      A('N1a zero entitlement → HTTP 402 insufficient_entitlement', is(r, 402, 'insufficient_entitlement'));
      A('N1a interview not active (status stays created; resume binding rolled back)',
        ivAfter?.status === 'created' && ivAfter?.resume_id === null && ivAfter?.version === ivBefore?.version);
      A('N1a zero start job enqueued · zero active interviews for principal', j === 0 && act === 0);
      A('N1a ledger unchanged (no bucket, no consumption row)', ledgerAfter === ledgerBefore);
    }

    // ════════════════ N1b · exhausted principal (1.0 consumed by a prior begin) ════════════════
    {
      const u = await signup('n1b');
      const rid1 = await seedResume(u.userId, 'n1b-1');
      const rid2 = await seedResume(u.userId, 'n1b-2');
      const iv1 = `uc001-nhp-neg-n1b-first-${process.pid}`;
      const iv2 = `uc001-nhp-neg-n1b-second-${process.pid}`;
      await seedInterview(u.userId, iv1);
      await seedInterview(u.userId, iv2);
      await admin.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',1.0,now()+interval '7 days')", [u.userId]);
      const auth = { authorization: `Bearer ${u.token}` };
      // Exhaust the only unit through the real product path (control: reservation path reachable).
      const first = await begin(iv1, { ...auth, 'resume-id': rid1 });
      A('N1b setup: first begin consumes the only unit → 202 accepted', first.status === 202 && first.body?.accepted === true && typeof first.body?.jobId === 'string');
      const ledgerExhausted = await ledger(u.userId);
      const exhausted = JSON.parse(ledgerExhausted);
      A('N1b setup: bucket fully reserved (1.00/1.00) with exactly one consumption row',
        exhausted.bucket.length === 1 && exhausted.bucket[0].units_reserved === '1.00' && exhausted.consumption.length === 1);
      const iv2Before = await ivState(iv2);
      const r = await begin(iv2, { ...auth, 'resume-id': rid2 });
      const iv2After = await ivState(iv2);
      const ledgerAfter = await ledger(u.userId);
      const j2 = await jobs(iv2);
      E('N1b', { setup_first_begin: first, http: r, interview_before: iv2Before, interview_after: iv2After, start_jobs_second: j2,
        ledger_exhausted: exhausted, ledger_after: JSON.parse(ledgerAfter) });
      A('N1b exhausted principal → HTTP 402 insufficient_entitlement', is(r, 402, 'insufficient_entitlement'));
      A('N1b second interview not active (status created; resume binding rolled back)',
        iv2After?.status === 'created' && iv2After?.resume_id === null && iv2After?.version === iv2Before?.version);
      A('N1b zero start job for second interview', j2 === 0);
      A('N1b ledger unchanged by the rejected begin (no double reservation, no orphan consumption)', ledgerAfter === ledgerExhausted);
      // Replay of the first begin must not double-charge either.
      const replay = await begin(iv1, { ...auth, 'resume-id': rid1 });
      const ledgerReplay = await ledger(u.userId);
      E('N1b-REPLAY', { http: replay, ledger_after_replay: JSON.parse(ledgerReplay), start_jobs_first: await jobs(iv1) });
      A('N1b replay of first begin is idempotent (alreadyBegun, same job) and ledger unchanged (no 双扣)',
        replay.status === 202 && replay.body?.alreadyBegun === true && replay.body?.jobId === first.body?.jobId
        && ledgerReplay === ledgerExhausted && (await jobs(iv1)) === 1);
      A('N1b no interview reached active (no worker; begin never activates)', (await activeCount(u.userId)) === 0);
    }

    // ════════════════ N2 · authentication failure on the same open (PrincipalGuard) ════════════════
    {
      const u = await signup('n2');
      const rid = await seedResume(u.userId, 'n2');
      const iv = `uc001-nhp-neg-n2-${process.pid}`;
      await seedInterview(u.userId, iv);
      // Target is otherwise beginnable (has entitlement) → any 401 must come from the guard.
      await admin.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '7 days')", [u.userId]);
      const ledgerBefore = await ledger(u.userId);
      const ivBefore = await ivState(iv);
      const now = Math.floor(Date.now() / 1000);
      const wrongSecret = signToken(u.userId, `${AUTH_SECRET}-wrong`, 3600, now, 0);
      const expired = signToken(u.userId, AUTH_SECRET, 60, now - 3600, 0);
      const cases: Array<{ id: string; headers: Record<string, string>; err: string }> = [
        { id: 'N2a no credential', headers: { 'resume-id': rid }, err: 'unauthenticated' },
        { id: 'N2b malformed bearer', headers: { authorization: 'Bearer garbage.token', 'resume-id': rid }, err: 'invalid_token' },
        { id: 'N2c wrong-secret bearer', headers: { authorization: `Bearer ${wrongSecret}`, 'resume-id': rid }, err: 'invalid_token' },
        { id: 'N2d expired bearer', headers: { authorization: `Bearer ${expired}`, 'resume-id': rid }, err: 'invalid_token' },
        { id: 'N2e x-user-id spoof (dev header disabled)', headers: { 'x-user-id': u.userId, 'resume-id': rid }, err: 'unauthenticated' },
      ];
      const observed: Array<{ id: string; http: Res }> = [];
      for (const c of cases) {
        const r = await begin(iv, c.headers);
        observed.push({ id: c.id, http: r });
        A(`${c.id} → HTTP 401 ${c.err}`, is(r, 401, c.err));
      }
      const ivAfter = await ivState(iv);
      const ledgerAfter = await ledger(u.userId);
      const j = await jobs(iv);
      E('N2', { observed, interview_before: ivBefore, interview_after: ivAfter, start_jobs: j,
        ledger_before: JSON.parse(ledgerBefore), ledger_after: JSON.parse(ledgerAfter) });
      A('N2 no interview mutation after 5 rejected opens (status created, unbound, same version)',
        ivAfter?.status === 'created' && ivAfter?.resume_id === null && ivAfter?.version === ivBefore?.version);
      A('N2 zero start job · ledger unchanged (no reservation leaked by unauthenticated calls)', j === 0 && ledgerAfter === ledgerBefore);
      // Control: the SAME interview with a valid credential is accepted → 401s above were the guard.
      const control = await begin(iv, { authorization: `Bearer ${u.token}`, 'resume-id': rid });
      E('N2-CONTROL', { http: control, start_jobs: await jobs(iv), ledger_after_control: JSON.parse(await ledger(u.userId)) });
      A('N2 control: valid bearer on the same interview → 202 (guard, not another precondition, produced the 401s)',
        control.status === 202 && control.body?.accepted === true && (await jobs(iv)) === 1);
    }

    const fxEnd = await sideEffects();
    E('ZERO-MODEL-SIDE-EFFECTS', { start: fxStart, end: fxEnd });
    A('L1 zero ai_model_invocation / ai_invocation_trace rows created (no model path reached)',
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
    console.log('CASE  NHP-001-NEG-01 N1(402 insufficient_entitlement)+N2(401 PrincipalGuard) real HTTP evidence = blind→case');
    console.log('NOTE  EXIT0 ≠ covered · ≠ UC-E2E-001 covered · ≠ e2e:isolated suite green · ≠ trio green · coveredCount=8 · happy path may stay blind');
  } else {
    console.log('GAP   GAP-UC001-NEG-01 EXIT=1 honest red retained (Ban retry-to-green · Ban flake label · Ban loosening asserts)');
  }
  console.log('NOTE  releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · PG-retained · DELETE=202 软删受理(purge_pending) · no SSOT flip · no nail');
  console.log(`CMD=${CMD} EXIT=${exit}`);
  process.exit(exit);
}).catch(async (error) => {
  console.error(error);
  console.log(`GAP   GAP-UC001-NEG-01 EXIT=1 prove aborted: ${error instanceof Error ? error.message : String(error)}`);
  console.log(`CMD=${CMD} EXIT=1`);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
