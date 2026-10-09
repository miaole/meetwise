/**
 * UC-E2E-025 · FAULT column only · NHP-025-FAULT-01 · GAP-UC025-FAULT-01 (Line AA)
 * Missing / NULL `expires_at` (and illegal/NaN date) on the source quiz artifact
 * must fail closed at interview begin — Ban treating absent expiry as fresh.
 *
 * HTTP/error pin (this knife): 409 CONFLICT · { error: 'missing_quiz_expiry' }
 * thrown before any resume-binding write, entitlement reservation, or queue enqueue.
 *
 * C-1 disposal: supersede — NULL still must NOT throw `stale_quiz` (narrow retain);
 * begin-with-quiz-id now refuses NULL/NaN via this independent FAULT code (fail-closed).
 * NaN policy: fail-closed (folded into the same guard + same error code).
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false
 * gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false
 * PG-retained · interview DELETE closed(503)·resume/account DELETE=202 软删受理(purge_pending) · canHonestlyFlip=false
 *
 * Not NEG (B'' stale_quiz CLOSED frozen; Ban wash). Not BOUND (W nailed evidence;
 * Ban wash). Not ADV. Not UC-E2E-018/052/004. Does not edit coverage matrix / SSOT.
 * No nail. EXIT 0 = case-level evidence ≠ covered ≠ whole row. Row stays gap.
 *
 * Evidence layers (both must pass) — harness choose-one: **in-process** (NOT isolated
 * three-layer shell):
 *   S — static inventory of controller/service (FAULT throw shape + ordering).
 *   R — in-process run of the real InterviewService.begin against a recording fake
 *       DB client (no PostgreSQL, no network, no model, no secrets).
 * Ban narrating this as isolated PG/HTTP E2E or covered.
 * If the guard is unwired, prints an explicit GAP marker and exits 1. Do not invent a pass.
 */
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CMD = 'pnpm uc025:nhp-fault:prove';
const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(apiRoot, '../..');
const read = (rel: string) => {
  const p = resolve(repoRoot, rel);
  assert.equal(existsSync(p), true, `missing file: ${rel}`);
  return readFileSync(p, 'utf8');
};

let fail = 0;
const results: string[] = [];
const A = (name: string, cond: boolean, detail = '') => {
  if (cond) console.log(`PASS  ${name}`);
  else { fail++; console.log(`FAIL  ${name}${detail ? `: ${detail}` : ''}`); }
  results.push(name);
};

console.log('UC-E2E-025 NHP-025-FAULT-01 missing/NULL expires_at fail-closed (FAULT column only)');
console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · DELETE=202 软删受理(purge_pending)');
console.log('Not NEG (frozen) · Not BOUND (Ban wash) · Not ADV · no nail · matrix not edited');
console.log('EVIDENCE_SHAPE  in-process + fake DB · ≠ isolated PG/HTTP E2E · ≠ covered\n');

// ── S: static inventory ─────────────────────────────────────────────
const ctrl = read('apps/api/src/modules/interview/interview.controller.ts');
const svc = read('apps/api/src/modules/interview/interview.service.ts');

const bStart = svc.indexOf('begin(principal');
const bEnd = svc.indexOf('turn(principal', bStart);
const region = bStart >= 0 && bEnd > bStart ? svc.slice(bStart, bEnd) : '';
A('S0-begin-region-parseable', region.length > 0);

const cbAt = ctrl.indexOf('begin(@Param');
const ctrlBegin = cbAt >= 0 ? ctrl.slice(cbAt, ctrl.indexOf('\n  }', cbAt)) : '';
A('S1-controller-forwards-quiz-id', /@Headers\('quiz-id'\)\s*quizId/.test(ctrlBegin) && /\.begin\([^)]*quizId\s*\)/.test(ctrlBegin));

const FAULT_THROW_RE = /throw\s+new\s+HttpException\s*\(\s*\{\s*error:\s*'missing_quiz_expiry'\s*\}\s*,\s*HttpStatus\.CONFLICT\s*\)/;
const faultThrowAt = region.search(FAULT_THROW_RE);
const wired = faultThrowAt >= 0;
A('S2-fault-throw-409-missing_quiz_expiry', wired);

// GODFN-1c 三守卫合并(语义等价拆解刀):begin 源押题工件三守卫块(NEG stale_quiz/FAULT missing_quiz_expiry/
// BOUND resume_version_mismatch)归一为单查(status+expires_at+pin JOIN 一查询回);抛序逐字节保持。
// S3 witness 随合并面更新:begin region 在 FAULT throw 前单查读取 quiz status+expires_at(查询次数 3→1)。
const expiryReadAt = region.search(/SELECT q\.status, q\.expires_at[\s\S]{0,240}FROM\s+resume_quiz\s+q/);
A('S3-reads-quiz-expires_at(single merged query · 3→1)', expiryReadAt >= 0 && (!wired || expiryReadAt < faultThrowAt));

const bindAt = region.indexOf('UPDATE interview i');
const reserveAt = region.indexOf('reserveEntitlement(');
const enqueueAt = region.indexOf('enqueueInterviewJob(');
A('S4-throw-before-bind/reserve/enqueue',
  wired && bindAt > faultThrowAt && reserveAt > faultThrowAt && enqueueAt > faultThrowAt,
  `throw=${faultThrowAt} bind=${bindAt} reserve=${reserveAt} enqueue=${enqueueAt}`);

const catchBlocks = [...region.matchAll(/catch\s*\(([^)]*)\)\s*\{([\s\S]*?)\n\s*\}/g)];
const swallow = catchBlocks.some((m) => (m.index ?? 0) < (faultThrowAt < 0 ? 0 : faultThrowAt) + 1 && /missing_quiz_expiry/.test(m[2] ?? ''));
A('S5-no-local-catch-swallows-fault-throw', wired && !swallow);

// Orthogonality: FAULT code distinct from NEG/BOUND codes
A('S6-error-code-orthogonal-to-neg-bound',
  wired
  && /error:\s*'stale_quiz'/.test(region)
  && /error:\s*'resume_version_mismatch'/.test(region)
  && /error:\s*'missing_quiz_expiry'/.test(region));

// NEG + BOUND frozen inventory (read-only · not FAULT evidence)
const negBlockIntact = /SELECT status, expires_at FROM resume_quiz WHERE id=\$1 AND owner_user_id=\$2/.test(region)
  && /throw new HttpException\(\{ error: 'stale_quiz' \}, HttpStatus\.CONFLICT\)/.test(region);
const boundThrowIntact = /throw new HttpException\(\{ error: 'resume_version_mismatch' \}, HttpStatus\.CONFLICT\)/.test(region);
console.log(`NOTE  NEG B'' stale block text present/untouched=${negBlockIntact} (frozen · not FAULT evidence)`);
console.log(`NOTE  BOUND resume_version_mismatch throw present/untouched=${boundThrowIntact} (Ban wash · not FAULT evidence)`);

if (!wired) {
  console.log('\nGAP  GAP-UC025-FAULT-01  NHP-025-FAULT-01 unwired: interview begin has no missing/NULL expires_at fail-closed refusal');
  console.log('ROW_STILL_GAP  UC-E2E-025 FAULT remains gap. The row is still gap. coveredCount=8.');
  console.log(`\nCMD=${CMD} EXIT=1`);
  process.exit(1);
}

// ── R: in-process run of the real InterviewService.begin (recording fake client) ──
delete process.env.MODEL_API_KEY;
delete process.env.MODEL_BASE_URL;
delete process.env.MEETWISE_PUBLIC_PREVIEW;
const { InterviewService } = await import('../src/modules/interview/interview.service.ts');

const IV = 'IV_FAULT_01';
const OWNER = 'userfault';
const R_A = '11111111-1111-4111-8111-111111111111';
const Q = 'quiz-fault-01';
class ReachedBind extends Error { constructor() { super('REACHED_BIND'); } }

type QuizRow = { status: string; expires_at: Date | string | null };
function run(quizId: string | undefined, quiz: QuizRow | null, pinOk = true): Promise<{ kind: 'ok' | 'err'; v?: any; e?: any; log: string[] }> {
  const log: string[] = [];
  const client = {
    async query(sql: string, _params?: unknown[]) {
      const s = String(sql).replace(/\s+/g, ' ').trim();
      log.push(s);
      if (s.startsWith('SELECT pg_advisory_xact_lock')) return { rowCount: 1, rows: [{}] };
      if (s.startsWith('SELECT status,resume_id,resume_privacy_epoch,application_id FROM interview'))
        return { rowCount: 1, rows: [{ status: 'created', resume_id: null, resume_privacy_epoch: null, application_id: null }] };
      if (s === 'SELECT 1 FROM interview WHERE id=$1') return { rowCount: 1, rows: [{}] };
      if (s.startsWith('SELECT assert_interview_privacy_active')) return { rowCount: 1, rows: [{}] };
      // GODFN-1c 合并后单查:同一行同时携带 NEG/FAULT 列(status,expires_at)与 BOUND pin 列(JOIN)。
      // IO 桩随产品 SQL 形状对齐;R 断言(R1-R5 预期错误码/顺序/副作用)逐字未改。
      if (s.startsWith('SELECT q.status, q.expires_at') && s.includes('FROM resume_quiz q')) {
        if (!quiz) return { rowCount: 0, rows: [] };
        return {
          rowCount: 1,
          rows: [{
            status: quiz.status,
            expires_at: quiz.expires_at,
            pinned_resume_id: pinOk ? R_A : '22222222-2222-4222-8222-222222222222',
            pinned_epoch: 1,
            current_epoch: 1,
          }],
        };
      }
      if (s.startsWith('UPDATE interview i')) throw new ReachedBind();
      throw new Error(`UNEXPECTED_SQL ${s.slice(0, 80)}`);
    },
  };
  const db = { asPrincipal: async (_p: string, fn: (c: any) => Promise<any>) => fn(client) };
  const svcInst = new (InterviewService as any)(db, {}, {}, {}, {});
  return svcInst.begin(OWNER, IV, R_A, 'req-fault', quizId).then(
    (v: any) => ({ kind: 'ok' as const, v, log }),
    (e: any) => ({ kind: 'err' as const, e, log }),
  );
}
const sideEffect = (log: string[]) => log.some((s) => /entitlement|interview_job|^UPDATE|^INSERT/i.test(s));
const isMissingExpiry = (r: any) => r.kind === 'err' && typeof r.e?.getStatus === 'function'
  && r.e.getStatus() === 409 && r.e.getResponse()?.error === 'missing_quiz_expiry';
const isStale = (r: any) => r.kind === 'err' && typeof r.e?.getStatus === 'function'
  && r.e.getStatus() === 409 && r.e.getResponse()?.error === 'stale_quiz';
const reachedBind = (r: any) => r.kind === 'err' && r.e instanceof ReachedBind;

const future = new Date(Date.now() + 86_400_000);
const past = new Date(Date.now() - 86_400_000);

const r1 = await run(Q, { status: 'ready', expires_at: null });
A('R1-NULL-expires_at → 409 missing_quiz_expiry', isMissingExpiry(r1), String(r1.e?.message ?? r1.kind));
A('R1-no-bind/reserve/enqueue-before-refusal(interview not active · quota untouched)', !sideEffect(r1.log));

const r2 = await run(Q, { status: 'ready', expires_at: 'not-a-valid-date' });
A('R2-illegal-date-NaN → 409 missing_quiz_expiry (NaN fail-closed folded)', isMissingExpiry(r2), String(r2.e?.message ?? r2.kind));
A('R2-no-side-effect', !sideEffect(r2.log));

const r3 = await run(Q, { status: 'ready', expires_at: future });
A('R3-positive-control(future-valid expiry) → passes FAULT guard, reaches bind', reachedBind(r3), String(r3.e?.message ?? r3.kind));

const r4 = await run(Q, { status: 'ready', expires_at: past });
A('R4-orthogonal-NEG(past expiry) → 409 stale_quiz (not missing_quiz_expiry)', isStale(r4), String(r4.e?.message ?? r4.kind));

const r5 = await run(undefined, { status: 'ready', expires_at: null });
A('R5-no-quiz-id → zero resume_quiz reads, behaviour unchanged, reaches bind',
  reachedBind(r5) && !r5.log.some((s: string) => /resume_quiz/.test(s)), String(r5.e?.message ?? r5.kind));

console.log('');
if (fail === 0) {
  console.log('PASS  NHP-025-FAULT-01  interview begin refuses missing/NULL/NaN expires_at with 409 missing_quiz_expiry before bind/reserve/enqueue');
  console.log('HTTP_ERROR_PIN  status=409 CONFLICT · error=missing_quiz_expiry');
  console.log('C1_DISPOSAL  supersede · NULL≠stale_quiz retained · fail-closed via missing_quiz_expiry');
  console.log('NAN_POLICY  fail-closed folded into missing_quiz_expiry');
  console.log('ROW_STILL_GAP  UC-E2E-025 FAULT column not flipped. BOUND gap · ADV blind · NEG frozen. coveredCount=8.');
  console.log('NOTE  service-level in-process evidence (fake DB client) ≠ HTTP/PG end-to-end ≠ covered ≠ nail ≠ HA');
  console.log(`\nCMD=${CMD} EXIT=0`);
  process.exit(0);
}
console.log(`GAP  GAP-UC025-FAULT-01  ${fail} check(s) failed; FAULT not proven`);
console.log('ROW_STILL_GAP  UC-E2E-025 FAULT remains gap. coveredCount=8.');
console.log(`\nCMD=${CMD} EXIT=1`);
process.exit(1);
