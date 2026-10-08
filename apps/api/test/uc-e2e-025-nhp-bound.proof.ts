/**
 * UC-E2E-025 · BOUND column only · NHP-025-BOUND-01 · GAP-UC025-BOUND-01 (Line W)
 * TC-E2E-025-version-mismatch / E-简历变更: a quiz artifact whose resumeVersion pin
 * (0061 typed reference `resume_quiz.resume_id` + `privacy_epoch`) does not match the
 * resume used at interview begin must be refused.
 *
 * HTTP/error pin (this knife): 409 CONFLICT · { error: 'resume_version_mismatch' }
 * thrown before any resume-binding write, entitlement reservation, or queue enqueue.
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false
 * gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false
 * PG-retained · public DELETE stays 503 · canHonestlyFlip=false
 *
 * Not NEG (B'' stale_quiz is CLOSED and frozen; NEG EXIT0 is not BOUND evidence).
 * Not FAULT. Not ADV. Not UC-E2E-018/052/004. Does not edit the coverage matrix or
 * any SSOT. No nail. EXIT 0 = case-level evidence ≠ covered ≠ whole row. Row stays gap.
 *
 * Evidence layers (both must pass):
 *   S — static inventory of controller/service/schema (BOUND throw shape + ordering).
 *   R — in-process run of the real InterviewService.begin against a recording fake
 *       DB client (no PostgreSQL, no network, no model, no secrets). This is NOT an
 *       HTTP/DB end-to-end run; it proves the service-level guard semantics only.
 * If the guard is unwired, prints an explicit GAP marker and exits 1. Do not invent a pass.
 */
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CMD = 'pnpm uc025:nhp-bound:prove';
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

console.log('UC-E2E-025 NHP-025-BOUND-01 resumeVersion pin mismatch at interview begin (BOUND column only)');
console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · DELETE=503');
console.log('Not NEG (frozen) · Not FAULT · Not ADV · no nail · matrix not edited\n');

// ── S: static inventory ─────────────────────────────────────────────
const ctrl = read('apps/api/src/modules/interview/interview.controller.ts');
const svc = read('apps/api/src/modules/interview/interview.service.ts');
const mig61 = read('packages/db/migrations/0061_resume_derivative_reference_guard.sql');
const sql20 = read('packages/db/sql/20_resume_quiz.sql');

const bStart = svc.indexOf('begin(principal');
const bEnd = svc.indexOf('turn(principal', bStart);
const region = bStart >= 0 && bEnd > bStart ? svc.slice(bStart, bEnd) : '';
A('S0-begin-region-parseable', region.length > 0);

const cbAt = ctrl.indexOf('begin(@Param');
const ctrlBegin = cbAt >= 0 ? ctrl.slice(cbAt, ctrl.indexOf('\n  }', cbAt)) : '';
A('S1-controller-forwards-quiz-id', /@Headers\('quiz-id'\)\s*quizId/.test(ctrlBegin) && /\.begin\([^)]*quizId\s*\)/.test(ctrlBegin));

const BOUND_THROW_RE = /throw\s+new\s+HttpException\s*\(\s*\{\s*error:\s*'resume_version_mismatch'\s*\}\s*,\s*HttpStatus\.CONFLICT\s*\)/;
const boundThrowAt = region.search(BOUND_THROW_RE);
const wired = boundThrowAt >= 0;
A('S2-bound-throw-409-resume_version_mismatch', wired);

const pinReadAt = region.search(/q\.resume_id[\s\S]{0,120}q\.privacy_epoch[\s\S]{0,200}FROM\s+resume_quiz\s+q/);
A('S3-reads-quiz-resumeVersion-pin(resume_id+privacy_epoch)', pinReadAt >= 0 && (!wired || pinReadAt < boundThrowAt));

const bindAt = region.indexOf('UPDATE interview i');
const reserveAt = region.indexOf('reserveEntitlement(');
const enqueueAt = region.indexOf('enqueueInterviewJob(');
A('S4-throw-before-bind/reserve/enqueue',
  wired && bindAt > boundThrowAt && reserveAt > boundThrowAt && enqueueAt > boundThrowAt,
  `throw=${boundThrowAt} bind=${bindAt} reserve=${reserveAt} enqueue=${enqueueAt}`);

const catchBlocks = [...region.matchAll(/catch\s*\(([^)]*)\)\s*\{([\s\S]*?)\n\s*\}/g)];
const swallow = catchBlocks.some((m) => (m.index ?? 0) < (boundThrowAt < 0 ? 0 : boundThrowAt) + 1 && /resume_version_mismatch/.test(m[2] ?? ''));
A('S5-no-local-catch-swallows-bound-throw', wired && !swallow);

A('S6-schema-pin-columns(0061+sql/20)',
  /ALTER TABLE resume_quiz\s+ADD COLUMN IF NOT EXISTS resume_id uuid,\s+ADD COLUMN IF NOT EXISTS privacy_epoch bigint/.test(mig61)
  && /resume_id uuid/.test(sql20) && /privacy_epoch bigint/.test(sql20));

// NEG frozen inventory (read-only, not counted as BOUND evidence): the B'' stale block text is untouched.
const negBlockIntact = /SELECT status, expires_at FROM resume_quiz WHERE id=\$1 AND owner_user_id=\$2/.test(region)
  && /throw new HttpException\(\{ error: 'stale_quiz' \}, HttpStatus\.CONFLICT\)/.test(region);
console.log(`NOTE  NEG B'' stale block text present/untouched=${negBlockIntact} (frozen · not BOUND evidence)`);

if (!wired) {
  console.log('\nGAP  GAP-UC025-BOUND-01  NHP-025-BOUND-01 unwired: interview begin has no resumeVersion pin mismatch refusal');
  console.log('ROW_STILL_GAP  UC-E2E-025 BOUND remains gap. The row is still gap. coveredCount=8.');
  console.log(`\nCMD=${CMD} EXIT=1`);
  process.exit(1);
}

// ── R: in-process run of the real InterviewService.begin (recording fake client) ──
delete process.env.MODEL_API_KEY;
delete process.env.MODEL_BASE_URL;
delete process.env.MEETWISE_PUBLIC_PREVIEW;
const { InterviewService } = await import('../src/modules/interview/interview.service.ts');

const IV = 'IV_BOUND_01';
const OWNER = 'userBound';
const R_A = '11111111-1111-4111-8111-111111111111';
const R_B = '22222222-2222-4222-8222-222222222222';
const Q = 'quiz-bound-01';
class ReachedBind extends Error { constructor() { super('REACHED_BIND'); } }

type Pin = { pinned_resume_id: string | null; pinned_epoch: number | null; current_epoch: number | null };
function run(resumeId: string, quizId: string | undefined, pin: Pin): Promise<{ kind: 'ok' | 'err'; v?: any; e?: any; log: string[] }> {
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
      // GODFN-1c 合并后单查:NEG/FAULT(status,expires_at)与 BOUND pin(JOIN)列同回一行。
      // IO 桩随产品 SQL 形状对齐;R 断言(R1-R6 预期错误码/顺序/零 quiz 读)逐字未改。
      if (s.startsWith('SELECT q.status, q.expires_at') && s.includes('FROM resume_quiz q')) {
        return {
          rowCount: 1,
          rows: [{
            status: 'ready',
            expires_at: new Date(Date.now() + 86_400_000),
            pinned_resume_id: pin.pinned_resume_id,
            pinned_epoch: pin.pinned_epoch,
            current_epoch: pin.current_epoch,
          }],
        };
      }
      if (s.startsWith('UPDATE interview i')) throw new ReachedBind();
      throw new Error(`UNEXPECTED_SQL ${s.slice(0, 80)}`);
    },
  };
  const db = { asPrincipal: async (_p: string, fn: (c: any) => Promise<any>) => fn(client) };
  const svcInst = new (InterviewService as any)(db, {}, {}, {}, {});
  return svcInst.begin(OWNER, IV, resumeId, 'req-bound', quizId).then(
    (v: any) => ({ kind: 'ok' as const, v, log }),
    (e: any) => ({ kind: 'err' as const, e, log }),
  );
}
const sideEffect = (log: string[]) => log.some((s) => /entitlement|interview_job|^UPDATE|^INSERT/i.test(s));
const isMismatch = (r: any) => r.kind === 'err' && typeof r.e?.getStatus === 'function'
  && r.e.getStatus() === 409 && r.e.getResponse()?.error === 'resume_version_mismatch';
const reachedBind = (r: any) => r.kind === 'err' && r.e instanceof ReachedBind;

const r1 = await run(R_B, Q, { pinned_resume_id: R_A, pinned_epoch: 1, current_epoch: 1 });
A('R1-resume-changed(pin R_A, begin R_B) → 409 resume_version_mismatch', isMismatch(r1), String(r1.e?.message ?? r1.kind));
A('R1-no-bind/reserve/enqueue-before-refusal(interview not active · quota untouched)', !sideEffect(r1.log));

const r2 = await run(R_A, Q, { pinned_resume_id: R_A, pinned_epoch: 1, current_epoch: 2 });
A('R2-epoch-drift(pin epoch 1, current 2) → 409 resume_version_mismatch', isMismatch(r2), String(r2.e?.message ?? r2.kind));
A('R2-no-side-effect', !sideEffect(r2.log));

const r3 = await run(R_A, Q, { pinned_resume_id: R_A, pinned_epoch: 1, current_epoch: null });
A('R3-pinned-resume-gone(current null) → 409 resume_version_mismatch', isMismatch(r3), String(r3.e?.message ?? r3.kind));

const r4 = await run(R_A.toUpperCase(), Q, { pinned_resume_id: R_A, pinned_epoch: 1, current_epoch: 1 });
A('R4-accept-asymmetry(pin matches, case-insensitive uuid) → passes guard, reaches bind', reachedBind(r4), String(r4.e?.message ?? r4.kind));

const r5 = await run(R_B, Q, { pinned_resume_id: null, pinned_epoch: null, current_epoch: null });
A('R5-legacy-unpinned-quiz(NULL pin) → not false-rejected, reaches bind', reachedBind(r5), String(r5.e?.message ?? r5.kind));

const r6 = await run(R_B, undefined, { pinned_resume_id: R_A, pinned_epoch: 1, current_epoch: 1 });
A('R6-no-quiz-id → zero resume_quiz reads, behaviour unchanged, reaches bind',
  reachedBind(r6) && !r6.log.some((s: string) => /resume_quiz/.test(s)), String(r6.e?.message ?? r6.kind));

console.log('');
if (fail === 0) {
  console.log('PASS  NHP-025-BOUND-01  interview begin refuses a resumeVersion-pin mismatch with 409 resume_version_mismatch before bind/reserve/enqueue');
  console.log('HTTP_ERROR_PIN  status=409 CONFLICT · error=resume_version_mismatch');
  console.log('ROW_STILL_GAP  UC-E2E-025 BOUND column not flipped. FAULT gap · ADV blind · NEG frozen. coveredCount=8.');
  console.log('NOTE  service-level in-process evidence (fake DB client) ≠ HTTP/PG end-to-end ≠ covered ≠ nail ≠ HA');
  console.log(`\nCMD=${CMD} EXIT=0`);
  process.exit(0);
}
console.log(`GAP  GAP-UC025-BOUND-01  ${fail} check(s) failed; BOUND not proven`);
console.log('ROW_STILL_GAP  UC-E2E-025 BOUND remains gap. coveredCount=8.');
console.log(`\nCMD=${CMD} EXIT=1`);
process.exit(1);
