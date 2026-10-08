/**
 * GODFN-1c · begin() 三守卫合并新增断言面(harness 设计 §2.3:抛序等价 + resume_quiz 查询次数 3→1 计数)。
 *
 * 被断言面:interview.service.ts begin() 源押题工件三守卫块(NEG stale_quiz / FAULT missing_quiz_expiry /
 * BOUND resume_version_mismatch)由三刀各自 SELECT(前两刀 SQL 字节级重复)合并为**单查**。
 *
 * Evidence layers (both must pass):
 *   S — static:begin region 内 resume_quiz 查询语句恰 1 条;三错误码抛点顺序 = 现行精确顺序
 *       (404 → stale_quiz → missing_quiz_expiry(NULL) → missing_quiz_expiry(NaN fold) → resume_version_mismatch),
 *       查询先于三抛点,三抛点先于 bind/reserve/enqueue。
 *   R — in-process real InterviewService.begin + recording fake client(计数 resume_quiz 查询):
 *       带 quizId → 恰 1 次 resume_quiz 查询(合并前为 3);不带 → 0 次;九行输入矩阵逐一断言
 *       与合并前等价的错误码/抛序/放行语义(对齐 nhp-neg/fault/bound 三 prove 的语义面)。
 *
 * Pins(照抄设计 §4):haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false。
 * 纯断言新增面:不改任何旧断言、不翻任何 SSOT/backlog、零 DB/网络/模型依赖。
 */
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CMD = 'pnpm prove:begin-guard-merge';
const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(apiRoot, '../..');
const read = (rel: string) => {
  const p = resolve(repoRoot, rel);
  assert.equal(existsSync(p), true, `missing file: ${rel}`);
  return readFileSync(p, 'utf8');
};

let fail = 0;
const A = (name: string, cond: boolean, detail = '') => {
  if (cond) console.log(`PASS  ${name}`);
  else { fail++; console.log(`FAIL  ${name}${detail ? `: ${detail}` : ''}`); }
};

console.log('GODFN-1c begin() three-guard merge · throw-order equivalence + resume_quiz query count 3→1');
console.log('haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · PG-retained · DELETE=503 · r1Closed=false\n');

// ── S: static inventory ─────────────────────────────────────────────
const svc = read('apps/api/src/modules/interview/interview.service.ts');
const bStart = svc.indexOf('begin(principal');
const bEnd = svc.indexOf('turn(principal', bStart);
const region = bStart >= 0 && bEnd > bStart ? svc.slice(bStart, bEnd) : '';
A('S0-begin-region-parseable', region.length > 0);

// 单查计数(3→1):begin region 内 resume_quiz 查询语句恰一条(FROM resume_quiz 仅出现于该查询)。
const quizFromCount = (region.match(/FROM\s+resume_quiz/g) || []).length;
A('S1-single-resume-quiz-statement(3→1 static)', quizFromCount === 1, `FROM resume_quiz count=${quizFromCount}`);
A('S2-merged-query-carries-neg-fault-bound-columns',
  /SELECT q\.status, q\.expires_at[\s\S]{0,240}pinned_resume_id[\s\S]{0,240}current_epoch[\s\S]{0,120}FROM\s+resume_quiz\s+q/.test(region));

const notFoundAt = region.indexOf("error: 'not_found_or_forbidden'", region.indexOf('FROM resume_quiz'));
const staleAt = region.indexOf("error: 'stale_quiz'");
const nullExpiryAt = region.indexOf('if (rawExpiry == null)');
const nanAt = region.indexOf('Number.isNaN(expiryMs)');
const firstMissingAt = region.indexOf("error: 'missing_quiz_expiry'", nullExpiryAt);
const secondMissingAt = region.indexOf("error: 'missing_quiz_expiry'", firstMissingAt + 1);
const boundAt = region.indexOf("error: 'resume_version_mismatch'");
const quizQueryAt = region.indexOf('FROM resume_quiz');
A('S3-throw-order-404-before-stale(merged-guard 404)', notFoundAt >= 0 && notFoundAt > quizQueryAt && staleAt > notFoundAt);
A('S4-throw-order-stale-before-missing-expiry', staleAt >= 0 && firstMissingAt > staleAt);
A('S5-nan-folds-into-missing-expiry', nanAt > nullExpiryAt && firstMissingAt > nullExpiryAt && secondMissingAt > nanAt);
A('S6-throw-order-missing-expiry-before-bound', secondMissingAt >= 0 && boundAt > secondMissingAt);
A('S7-single-query-precedes-all-three-throws', quizQueryAt >= 0 && quizQueryAt < staleAt && quizQueryAt < secondMissingAt && quizQueryAt < boundAt);
const bindAt = region.indexOf('UPDATE interview i');
const reserveAt = region.indexOf('reserveEntitlement(');
const enqueueAt = region.indexOf('enqueueInterviewJob(');
A('S8-throws-before-bind/reserve/enqueue', bindAt > boundAt && reserveAt > boundAt && enqueueAt > boundAt);
A('S9-error-code-orthogonality(三码同区共存)',
  /error:\s*'stale_quiz'/.test(region) && /error:\s*'missing_quiz_expiry'/.test(region) && /error:\s*'resume_version_mismatch'/.test(region));
// C-1 窄保留:NULL 不得抛 stale_quiz —— stale 判定仍要求 expires_at != null 才参与过期比较。
A('S10-c1-null-not-stale(narrow retain)', /quizExpired = quiz\.rows\[0\]\.expires_at != null/.test(region));

// ── R: in-process real begin + counting fake client ─────────────────
delete process.env.MODEL_API_KEY;
delete process.env.MODEL_BASE_URL;
delete process.env.MEETWISE_PUBLIC_PREVIEW;
const { InterviewService } = await import('../src/modules/interview/interview.service.ts');

const IV = 'IV_GODFN1C_MERGE';
const OWNER = 'userMerge';
const R_A = '11111111-1111-4111-8111-111111111111';
const R_B = '22222222-2222-4222-8222-222222222222';
const Q = 'quiz-merge-01';
class ReachedBind extends Error { constructor() { super('REACHED_BIND'); } }

type MergedRow = {
  status?: string | null;
  expires_at?: Date | string | null;
  pinned_resume_id?: string | null;
  pinned_epoch?: number | null;
  current_epoch?: number | null;
};
function run(resumeId: string, quizId: string | undefined, row: MergedRow | null): Promise<{ kind: 'ok' | 'err'; v?: any; e?: any; log: string[] }> {
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
      // GODFN-1c 合并后单查(与生产 SQL 形状对齐的 IO 桩);记录 resume_quiz 查询次数。
      if (s.startsWith('SELECT q.status, q.expires_at') && s.includes('FROM resume_quiz q')) {
        if (!row) return { rowCount: 0, rows: [] };
        return { rowCount: 1, rows: [row] };
      }
      if (s.startsWith('UPDATE interview i')) throw new ReachedBind();
      throw new Error(`UNEXPECTED_SQL ${s.slice(0, 80)}`);
    },
  };
  const db = { asPrincipal: async (_p: string, fn: (c: any) => Promise<any>) => fn(client) };
  const svcInst = new (InterviewService as any)(db, {}, {}, {}, {});
  return svcInst.begin(OWNER, IV, resumeId, 'req-merge', quizId).then(
    (v: any) => ({ kind: 'ok' as const, v, log }),
    (e: any) => ({ kind: 'err' as const, e, log }),
  );
}
const quizQueryCount = (log: string[]) => log.filter((s) => /resume_quiz/.test(s)).length;
const sideEffect = (log: string[]) => log.some((s) => /entitlement|interview_job|^UPDATE|^INSERT/i.test(s));
const errCode = (r: any, code: string, status = 409) => r.kind === 'err' && typeof r.e?.getStatus === 'function'
  && r.e.getStatus() === status && r.e.getResponse()?.error === code;
const reachedBind = (r: any) => r.kind === 'err' && r.e instanceof ReachedBind;
const future = new Date(Date.now() + 86_400_000);
const past = new Date(Date.now() - 86_400_000);
const base = { status: 'ready', expires_at: future, pinned_resume_id: R_A, pinned_epoch: 1, current_epoch: 1 };

// 计数面:带 quizId → 恰 1 次 resume_quiz 查询(合并前同路径为 3 次:NEG/FAULT 同 SQL 两遍 + BOUND pin 一遍)。
const rc = await run(R_A, Q, { ...base });
A('R0-resume_quiz-query-count-3→1(quizId present → exactly 1)', quizQueryCount(rc.log) === 1, `count=${quizQueryCount(rc.log)}`);

// 抛序等价矩阵(逐行对齐合并前 NEG/FAULT/BOUND 三 prove 的语义面):
const r1 = await run(R_A, Q, null);
A('R1-row-missing → 404 not_found_or_forbidden(first, before all three codes)', errCode(r1, 'not_found_or_forbidden', 404), String(r1.e?.message ?? r1.kind));
A('R1-no-side-effect', !sideEffect(r1.log));

const r2 = await run(R_A, Q, { ...base, status: 'draft' });
A('R2-status-not-ready → 409 stale_quiz(NEG first)', errCode(r2, 'stale_quiz'), String(r2.e?.message ?? r2.kind));
A('R2-no-side-effect', !sideEffect(r2.log));

const r3 = await run(R_A, Q, { ...base, expires_at: past });
A('R3-past-expiry → 409 stale_quiz(NEG before FAULT/BOUND)', errCode(r3, 'stale_quiz'), String(r3.e?.message ?? r3.kind));
A('R3-no-side-effect', !sideEffect(r3.log));

const r4 = await run(R_A, Q, { status: 'ready', expires_at: null, pinned_resume_id: R_B, pinned_epoch: 1, current_epoch: 1 });
A('R4-NULL-expiry+pin-mismatch → 409 missing_quiz_expiry(FAULT before BOUND · C-1 NULL≠stale)', errCode(r4, 'missing_quiz_expiry'), String(r4.e?.message ?? r4.kind));
A('R4-no-side-effect', !sideEffect(r4.log));

const r5 = await run(R_A, Q, { status: 'ready', expires_at: 'not-a-valid-date', pinned_resume_id: R_B, pinned_epoch: 1, current_epoch: 1 });
A('R5-NaN-expiry+pin-mismatch → 409 missing_quiz_expiry(NaN fold before BOUND)', errCode(r5, 'missing_quiz_expiry'), String(r5.e?.message ?? r5.kind));
A('R5-no-side-effect', !sideEffect(r5.log));

const r6 = await run(R_B, Q, { ...base });
A('R6-resume-changed(pin R_A, begin R_B) → 409 resume_version_mismatch', errCode(r6, 'resume_version_mismatch'), String(r6.e?.message ?? r6.kind));
A('R6-no-side-effect', !sideEffect(r6.log));

const r7 = await run(R_A, Q, { ...base, current_epoch: 2 });
A('R7-epoch-drift(pin 1, current 2) → 409 resume_version_mismatch', errCode(r7, 'resume_version_mismatch'), String(r7.e?.message ?? r7.kind));
A('R7-no-side-effect', !sideEffect(r7.log));

const r8 = await run(R_A, Q, { status: 'ready', expires_at: future, pinned_resume_id: null, pinned_epoch: null, current_epoch: null });
A('R8-legacy-unpinned-quiz(NULL pin) → not false-rejected, reaches bind', reachedBind(r8), String(r8.e?.message ?? r8.kind));

const r9 = await run(R_A.toUpperCase(), Q, { ...base });
A('R9-accept-asymmetry(case-insensitive uuid pin) → reaches bind', reachedBind(r9), String(r9.e?.message ?? r9.kind));

// 计数面(负门):不带 quizId → 零 resume_quiz 查询(整块跳过,行为与接线前一致)。
const r10 = await run(R_A, undefined, { ...base });
A('R10-no-quiz-id → zero resume_quiz reads, reaches bind', reachedBind(r10) && quizQueryCount(r10.log) === 0, `count=${quizQueryCount(r10.log)}`);

console.log('');
if (fail === 0) {
  console.log('PASS  GODFN-1c begin() 三守卫合并:三错误码抛序等价(404→stale_quiz→missing_quiz_expiry→NaN fold→resume_version_mismatch)+ resume_quiz 查询 3→1 计数断言');
  console.log('NOTE  in-process evidence(fake DB client)·零 DB/网络/模型依赖 · ≠ HTTP/PG E2E ≠ covered ≠ nail ≠ HA');
  console.log(`\nCMD=${CMD} EXIT=0`);
  process.exit(0);
}
console.log(`GAP  GODFN-1c  ${fail} check(s) failed; merge equivalence not proven`);
console.log(`\nCMD=${CMD} EXIT=1`);
process.exit(1);
