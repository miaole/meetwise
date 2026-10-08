/**
 * DBSB-1 src boilerplate convergence proof (P1–P6).
 *
 * P1 runAs semantics: role entry per wrapper, GUC visibility, error rollback,
 *   connection recycling, format-regex fail-closed, nonexistent-role PG
 *   backstop, scoring-fact-root exclusion (negative).
 * P2 export-surface freeze: names + arity of the converged wrappers/modules.
 * P3 job-queue factory: emitted SQL character-for-character equal to the
 *   pre-convergence literals (snapshots copied verbatim from 8241ba3a) for
 *   3 queues × 5 operations, plus bind params.
 * P4 withSavepoint: per-site statement-order assertions against the four
 *   production call sites × three error modes (rev2 defect B).
 * P5 static gates: principal.ts SET LOCAL ROLE site census, one-line wrapper
 *   delegates, no inline five-piece SQL in *-jobs.ts, r4 zero relocation.
 * P6 r4 alias preservation: every prove:r4-* alias resolves to an existing
 *   file; retirement assessment doc exists.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PoolClient as Client } from 'pg';
import {
  assertIsolatedTestTarget, createPool, runAs, withSavepoint,
  asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor, asQbankControlExecutor,
  asRagControlExecutor, asOnlineJudgeScheduler, asOnlineJudgeExecutor, asGateway,
} from '../src/index.ts';
import type { DbPool } from '../src/index.ts';
import {
  claimNextInterviewJob, markJobDone, markJobFailed, renewInterviewJobLease, sweepStuckInterviewJobs,
} from '../src/interview-jobs.ts';
import {
  claimNextQuizJob, markQuizJobDone, markQuizJobFailed, renewQuizJobLease, sweepStuckQuizJobs,
} from '../src/quiz-jobs.ts';
import {
  claimNextDiagnosisJob, markDiagnosisJobDone, markDiagnosisJobFailed, renewDiagnosisJobLease, sweepStuckDiagnosisJobs,
} from '../src/diagnosis-jobs.ts';
import { persistResumeProfile } from '../src/resume.ts';
import type { IngestedProfile } from '../src/resume.ts';
import { markOrderPaidAndCredit, markOrderRefunded } from '../src/payment.ts';
import { submitInterviewAnswer } from '../src/int-transcript.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

/* ---------- P3 snapshots: pre-convergence literals, verbatim from 8241ba3a ---------- */
const SNAP = {
  claimQuiz: `UPDATE quiz_job SET status='running', lease_owner=$2, lease_expires_at=now()+($3||' seconds')::interval, attempts=attempts+1, version=version+1
       WHERE id = (
         SELECT j.id FROM quiz_job j
          WHERE j.owner_user_id=$1
            AND (j.status='queued' OR (j.status='running' AND j.lease_expires_at < now() AND j.attempts < $4))
            AND NOT EXISTS (SELECT 1 FROM quiz_job r WHERE r.quiz_id=j.quiz_id AND r.status='running' AND r.lease_expires_at >= now())
          ORDER BY j.created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1)
     RETURNING id, quiz_id, resume_id, privacy_epoch, reference_schema_version, attempts`,
  doneQuiz: "UPDATE quiz_job SET status='done', lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3",
  failedQuiz: "UPDATE quiz_job SET status='failed', last_error=$4, lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3",
  renewQuiz: `UPDATE quiz_job SET lease_expires_at = now() + ($4||' seconds')::interval
       WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`,
  sweepFailedQuiz: `UPDATE quiz_job SET status='failed', last_error='reaped:worker_died', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts >= $2
     RETURNING quiz_id`,
  sweepRequeueQuiz: `UPDATE quiz_job SET status='queued', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts < $2`,
  claimDiagnosis: `UPDATE diagnosis_job SET status='running', lease_owner=$2, lease_expires_at=now()+($3||' seconds')::interval, attempts=attempts+1, version=version+1
       WHERE id = (
         SELECT j.id FROM diagnosis_job j
          WHERE j.owner_user_id=$1
            AND (j.status='queued' OR (j.status='running' AND j.lease_expires_at < now() AND j.attempts < $4))
            AND NOT EXISTS (SELECT 1 FROM diagnosis_job r WHERE r.diagnosis_id=j.diagnosis_id AND r.status='running' AND r.lease_expires_at >= now())
          ORDER BY j.created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1)
     RETURNING id, diagnosis_id, resume_id, privacy_epoch, reference_schema_version, attempts`,
  doneDiagnosis: "UPDATE diagnosis_job SET status='done', lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3",
  failedDiagnosis: "UPDATE diagnosis_job SET status='failed', last_error=$4, lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3",
  renewDiagnosis: `UPDATE diagnosis_job SET lease_expires_at = now() + ($4||' seconds')::interval
       WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`,
  sweepFailedDiagnosis: `UPDATE diagnosis_job SET status='failed', last_error='reaped:worker_died', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts >= $2
     RETURNING diagnosis_id`,
  sweepRequeueDiagnosis: `UPDATE diagnosis_job SET status='queued', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts < $2`,
  claimInterview: `UPDATE interview_job SET status='running', lease_owner=$2, lease_expires_at=now()+($3||' seconds')::interval, attempts=attempts+1, version=version+1
       WHERE id = (
         SELECT j.id FROM interview_job j
          WHERE j.owner_user_id=$1
            AND interview_privacy_active(j.interview_id)
            AND (j.status='queued' OR (j.status='running' AND j.lease_expires_at < now() AND j.attempts < $4))
            AND NOT EXISTS (SELECT 1 FROM interview_job r WHERE r.interview_id=j.interview_id AND r.status='running' AND r.lease_expires_at >= now())
            -- 僵尸兄弟守卫(专家审计 F3):同面试任一 job 已终态 failed → 面试已死(已发 interview_unavailable+退款),
            -- 绝不再领其后续 seq job(否则对已宣告不可用/已退款的面试乱序跑答题 → 重复假终态 + churn)。
            AND NOT EXISTS (SELECT 1 FROM interview_job f WHERE f.interview_id=j.interview_id AND f.status='failed')
            -- Cap counts unexpired running only. Expired running is reclaimable:
            -- the same tick reaps first, then this predicate must still admit a
            -- replacement claim. Counting expired rows would pin an owner at cap
            -- until sweep succeeded on every replica.
            AND (
              SELECT count(*)::int FROM interview_job live
               WHERE live.owner_user_id=$1
                 AND live.status='running'
                 AND live.lease_expires_at >= now()
            ) < $5
          ORDER BY j.seq ASC, j.created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1)
     RETURNING id, interview_id, kind, seq, resume_id, resume_privacy_epoch, reference_schema_version, attempts`,
  doneInterview: "UPDATE interview_job SET status='done', lease_owner=NULL, payload=payload-'answer', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3",
  failedInterview: "UPDATE interview_job SET status='failed', last_error=$4, lease_owner=NULL, payload=payload-'answer', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3",
  renewInterview: `UPDATE interview_job SET lease_expires_at = now() + ($4||' seconds')::interval
       WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`,
  sweepFailedInterview: `UPDATE interview_job SET status='failed', last_error='reaped:worker_died', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts >= $2
     RETURNING interview_id`,
  sweepRequeueInterview: `UPDATE interview_job SET status='queued', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts < $2`,
};

/* ---------- probe client ---------- */
type ProbeCall = { sql: string; params?: unknown[] };
interface ProbeAction { rowCount?: number; rows?: Record<string, unknown>[]; code?: string }
type ProbeRoute = { match: (sql: string) => boolean; action: ProbeAction | ((call: ProbeCall) => ProbeAction) };

function makeProbe(routes: ProbeRoute[], log: ProbeCall[]): Client {
  return {
    query: async (sql: string, params?: unknown[]) => {
      log.push({ sql, params });
      for (const route of routes) {
        if (!route.match(sql)) continue;
        const action = typeof route.action === 'function' ? route.action({ sql, params }) : route.action;
        if (action.code) { const e: Error & { code?: string } = new Error(`probe:${action.code}`); e.code = action.code; throw e; }
        return { rowCount: action.rowCount ?? 0, rows: action.rows ?? [] };
      }
      return { rowCount: 0, rows: [] };
    },
  } as unknown as Client;
}

const kind = (sql: string): string => {
  const s = sql.trimStart();
  if (s.startsWith('SAVEPOINT')) return 'SP';
  if (s.startsWith('ROLLBACK TO SAVEPOINT')) return 'RB';
  if (s.startsWith('RELEASE SAVEPOINT')) return 'RL';
  return 'WORK';
};

async function main() {
  /* ============================== P1 ============================== */
  const admin = createPool({ purpose: 'dbsb1-prove' });
  await assertIsolatedTestTarget(admin);

  const roleCases: Array<[string, (pool: DbPool, fn: (c: Client) => Promise<unknown>) => Promise<unknown>, string]> = [
    ['asPrincipal', (p, fn) => asPrincipal(p, 'dbsb1_user', fn as never), 'app_role'],
    ['asPrivacyWorkerPrincipal', (p, fn) => asPrivacyWorkerPrincipal(p, 'dbsb1_user', fn as never), 'privacy_worker_executor'],
    ['asPrivacyWorkerExecutor', (p, fn) => asPrivacyWorkerExecutor(p, fn as never), 'privacy_worker_executor'],
    ['asQbankControlExecutor', (p, fn) => asQbankControlExecutor(p, fn as never), 'qbank_control_executor'],
    ['asRagControlExecutor', (p, fn) => asRagControlExecutor(p, fn as never), 'rag_control_executor'],
    ['asOnlineJudgeScheduler', (p, fn) => asOnlineJudgeScheduler(p, fn as never), 'online_judge_scheduler'],
    ['asOnlineJudgeExecutor', (p, fn) => asOnlineJudgeExecutor(p, fn as never), 'online_judge_executor'],
    ['asGateway', (p, fn) => asGateway(p, fn as never), 'app_gateway_role'],
  ];
  let roleOk = true;
  for (const [name, wrap, role] of roleCases) {
    try {
      const seen = await wrap(admin, async (c) => (await c.query('SELECT current_user AS u')).rows[0]?.u);
      if (seen !== role) { roleOk = false; console.log(`  ${name}: current_user=${String(seen)} expected=${role}`); }
    } catch (error) { roleOk = false; console.log(`  ${name}: threw ${String(error)}`); }
  }
  A('P1-1 8 wrappers enter exactly their reviewed role (current_user)', roleOk);

  const gucPrincipal = await asPrincipal(admin, 'dbsb1_user', async (c) =>
    (await c.query<{ v: string | null }>("SELECT current_setting('app.principal_user', true) AS v")).rows[0]?.v ?? null);
  const gucQbank = await asQbankControlExecutor(admin, async (c) =>
    (await c.query<{ v: string | null }>("SELECT current_setting('app.principal_user', true) AS v")).rows[0]?.v ?? null);
  // A pooled connection previously used by asPrincipal may report the custom
  // GUC as an empty string after its SET LOCAL expired (PostgreSQL keeps the
  // placeholder): null or '' both mean "no principal bound".
  A('P1-2 GUC only on principal variants (asPrincipal set / asQbankControlExecutor unbound)',
    gucPrincipal === 'dbsb1_user' && (gucQbank === null || gucQbank === ''));

  const boom = Object.assign(new Error('dbsb1_p1_boom'), { marker: true });
  let rolledBackOk = true; let boomIdentityOk = true;
  try { await asPrincipal(admin, 'dbsb1_user', async () => { throw boom; }); rolledBackOk = false; }
  catch (error) { if (error !== boom) boomIdentityOk = false; }
  // A clean follow-up transaction on the same pool proves no leaked transaction state.
  try { await asPrincipal(admin, 'dbsb1_user', async (c) => { await c.query('SELECT 1'); }); } catch { rolledBackOk = false; }
  A('P1-3 fn throw -> wrapper rejects with same error, connection reusable (no leaked txn)', rolledBackOk && boomIdentityOk);

  const totalBefore = admin.totalCount;
  await asPrincipal(admin, 'dbsb1_user', async (c) => { await c.query('SELECT 1'); });
  A('P1-4 connection recycling (pool totalCount unchanged, all idle)',
    admin.totalCount === totalBefore && admin.idleCount === admin.totalCount);

  const formatOk = await (async () => {
    for (const bad of ['BAD-ROLE', '-bad', 'bad role', 'a'.repeat(64)]) {
      try { await runAs(admin, bad, async () => undefined); return false; }
      catch (error) { if ((error as Error).message !== 'run_as_invalid_role_name') return false; }
    }
    return true;
  })();
  A('P1-5 runAs role format-regex fail-closed (uppercase/leading hyphen/space/64-char reject)', formatOk);

  const ghostOk = await (async () => {
    try { await runAs(admin, 'dbsb1_ghost_role', async () => undefined); return false; }
    catch { return true; }  // well-formed but nonexistent role -> PG SET LOCAL ROLE error backstop
  })();
  A('P1-6 well-formed nonexistent role -> PostgreSQL SET LOCAL ROLE error backstop (no silent accept)', ghostOk);

  const scoringSrc = readFileSync(join(ROOT, 'packages/db/src/scoring-fact-root.ts'), 'utf8');
  A('P1-7 defect-A exclusion held: scoring-fact-root has no runAs value import/call and keeps its rollback-swallow shape',
    !/import\s*\{[^}]*runAs/.test(scoringSrc) && !/\brunAs\(/.test(scoringSrc)
    && scoringSrc.includes("ROLLBACK').catch(() => undefined)"));

  await admin.end();

  /* ============================== P2 ============================== */
  // Function.length counts only params before the first default — expected
  // values below are the *pre-convergence* arities (identical signatures).
  const arityTable: Array<[string, unknown, number]> = [
    ['asPrincipal', asPrincipal, 3], ['asPrivacyWorkerPrincipal', asPrivacyWorkerPrincipal, 3],
    ['asPrivacyWorkerExecutor', asPrivacyWorkerExecutor, 2], ['asQbankControlExecutor', asQbankControlExecutor, 2],
    ['asRagControlExecutor', asRagControlExecutor, 2], ['asOnlineJudgeScheduler', asOnlineJudgeScheduler, 2],
    ['asOnlineJudgeExecutor', asOnlineJudgeExecutor, 2], ['asGateway', asGateway, 2],
    ['runAs', runAs, 3], ['withSavepoint', withSavepoint, 4],
    ['claimNextInterviewJob', claimNextInterviewJob, 3], ['markJobDone', markJobDone, 4],
    ['markJobFailed', markJobFailed, 5], ['renewInterviewJobLease', renewInterviewJobLease, 4],
    ['sweepStuckInterviewJobs', sweepStuckInterviewJobs, 2],
    ['claimNextQuizJob', claimNextQuizJob, 3], ['markQuizJobDone', markQuizJobDone, 4],
    ['markQuizJobFailed', markQuizJobFailed, 5], ['renewQuizJobLease', renewQuizJobLease, 4],
    ['sweepStuckQuizJobs', sweepStuckQuizJobs, 2],
    ['claimNextDiagnosisJob', claimNextDiagnosisJob, 3], ['markDiagnosisJobDone', markDiagnosisJobDone, 4],
    ['markDiagnosisJobFailed', markDiagnosisJobFailed, 5], ['renewDiagnosisJobLease', renewDiagnosisJobLease, 4],
    ['sweepStuckDiagnosisJobs', sweepStuckDiagnosisJobs, 2],
    ['persistResumeProfile', persistResumeProfile, 4],
    ['markOrderPaidAndCredit', markOrderPaidAndCredit, 4], ['markOrderRefunded', markOrderRefunded, 4],
    ['submitInterviewAnswer', submitInterviewAnswer, 2],
  ];
  A('P2 export surface frozen (names exist, arity per pre-convergence signatures)',
    arityTable.every(([, fn]) => typeof fn === 'function') && arityTable.every(([, fn, n]) => (fn as (...a: unknown[]) => unknown).length === n));

  /* ============================== P3 ============================== */
  {
    const log: ProbeCall[] = [];
    const claimRow = { id: 'j1', quiz_id: 'q1', diagnosis_id: 'd1', interview_id: 'i1', kind: 'start', seq: 0, resume_id: null, privacy_epoch: 1, reference_schema_version: 61, attempts: 1, resume_privacy_epoch: 1 };
    const ok = { rowCount: 1, rows: [claimRow] };
    const probe = makeProbe([{ match: () => true, action: ok }], log);
    await claimNextQuizJob(probe, 'o1', 'w1', 5); await markQuizJobDone(probe, 'o1', 'j1', 'w1');
    await markQuizJobFailed(probe, 'o1', 'j1', 'w1', 'e'); await renewQuizJobLease(probe, 'o1', 'j1', 'w1', 90);
    await sweepStuckQuizJobs(probe, 'o1', 5);
    const [c1, c2, c3, c4, c5, c6] = log;
    A('P3-1 quiz five-piece SQL character-identical to 8241ba3a snapshots (+params)',
      c1?.sql === SNAP.claimQuiz && JSON.stringify(c1?.params) === JSON.stringify(['o1', 'w1', '120', 5])
      && c2?.sql === SNAP.doneQuiz && JSON.stringify(c2?.params) === JSON.stringify(['j1', 'o1', 'w1'])
      && c3?.sql === SNAP.failedQuiz && JSON.stringify(c3?.params) === JSON.stringify(['j1', 'o1', 'w1', 'e'])
      && c4?.sql === SNAP.renewQuiz && JSON.stringify(c4?.params) === JSON.stringify(['j1', 'o1', 'w1', '90'])
      && c5?.sql === SNAP.sweepFailedQuiz && c6?.sql === SNAP.sweepRequeueQuiz
      && JSON.stringify(c5?.params) === JSON.stringify(['o1', 5]));

    log.length = 0;
    await claimNextDiagnosisJob(probe, 'o1', 'w1', 5); await markDiagnosisJobDone(probe, 'o1', 'j1', 'w1');
    await markDiagnosisJobFailed(probe, 'o1', 'j1', 'w1', 'e'); await renewDiagnosisJobLease(probe, 'o1', 'j1', 'w1', 90);
    await sweepStuckDiagnosisJobs(probe, 'o1', 5);
    const [d1, d2, d3, d4, d5, d6] = log;
    A('P3-2 diagnosis five-piece SQL character-identical (+params)',
      d1?.sql === SNAP.claimDiagnosis && JSON.stringify(d1?.params) === JSON.stringify(['o1', 'w1', '120', 5])
      && d2?.sql === SNAP.doneDiagnosis && d3?.sql === SNAP.failedDiagnosis && d4?.sql === SNAP.renewDiagnosis
      && d5?.sql === SNAP.sweepFailedDiagnosis && d6?.sql === SNAP.sweepRequeueDiagnosis);

    log.length = 0;
    await claimNextInterviewJob(probe, 'o1', 'w1', 5, { perOwnerInflight: 2 });
    await markJobDone(probe, 'o1', 'j1', 'w1'); await markJobFailed(probe, 'o1', 'j1', 'w1', 'e');
    await renewInterviewJobLease(probe, 'o1', 'j1', 'w1', 90); await sweepStuckInterviewJobs(probe, 'o1', 5);
    const [i0, i1, i2, i3, i4, i5, i6] = log;
    A('P3-3 interview five-piece SQL character-identical incl. privacy/zombie/inflight guards and advisory lock (+$5 param)',
      i0?.sql === 'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))'
      && i1?.sql === SNAP.claimInterview && JSON.stringify(i1?.params) === JSON.stringify(['o1', 'w1', '120', 5, 2])
      && i2?.sql === SNAP.doneInterview && i3?.sql === SNAP.failedInterview
      && JSON.stringify(i3?.params) === JSON.stringify(['j1', 'o1', 'w1', 'e'])
      && i4?.sql === SNAP.renewInterview && i5?.sql === SNAP.sweepFailedInterview && i6?.sql === SNAP.sweepRequeueInterview);
  }

  /* ============================== P4 ============================== */
  {
    const profile: IngestedProfile = { experience: [], skills: [], facts: [], pii: [], blocked: [] };
    // #1 resume persistResumeProfile — success / 23505 / other
    {
      const log: ProbeCall[] = [];
      const probe = makeProbe([
        { match: (s) => s.includes('INSERT INTO resume_profile'), action: { rowCount: 1 } },
      ], log);
      await persistResumeProfile(probe, 'o1', 'r1', profile);
      const seq = log.map((x) => kind(x.sql)).join(',');
      A('P4-1 resume success order [SP,WORK(insert),RL]',
        seq === 'SP,WORK,RL' && ((log[1]?.sql ?? '').includes('INSERT INTO resume_profile')) && log[2]?.sql === 'RELEASE SAVEPOINT resume_profile_insert');
    }
    {
      const log: ProbeCall[] = [];
      const probe = makeProbe([
        { match: (s) => s.includes('INSERT INTO resume_profile'), action: { code: '23505' } },
      ], log);
      await persistResumeProfile(probe, 'o1', 'r1', profile);
      A('P4-2 resume 23505 order [SP,WORK(insert),RB,RL] then swallow-continue (no throw)',
        log.map((x) => kind(x.sql)).join(',') === 'SP,WORK,RB,RL' && log.some((x) => x.sql === 'ROLLBACK TO SAVEPOINT resume_profile_insert'));
    }
    {
      const log: ProbeCall[] = [];
      const probe = makeProbe([
        { match: (s) => s.includes('INSERT INTO resume_profile'), action: { code: '42P01' } },
      ], log);
      let rejected = false;
      try { await persistResumeProfile(probe, 'o1', 'r1', profile); } catch { rejected = true; }
      A('P4-3 resume non-23505 mode① [SP,WORK,RB] then rethrow, no RELEASE',
        rejected && log.map((x) => kind(x.sql)).join(',') === 'SP,WORK,RB' && !log.some((x) => kind(x.sql) === 'RL'));
    }
    // #2 payment markOrderPaidAndCredit — success / 23505 / other(bare throw)
    {
      const log: ProbeCall[] = [];
      const probe = makeProbe([
        { match: (s) => s.startsWith('UPDATE payment_order'), action: { rowCount: 1, rows: [{ units: 10 }] } },
        { match: (s) => s.startsWith('INSERT INTO entitlement_bucket'), action: { rowCount: 1 } },
      ], log);
      const r = await markOrderPaidAndCredit(probe, 'o1', 'ord1', 'txn1');
      A('P4-4 payment paid success [SP,WORK(update),RL,WORK(credit)] -> credited',
        r === 'credited' && log.map((x) => kind(x.sql)).join(',') === 'SP,WORK,RL,WORK'
        && ((log[1]?.sql ?? '').startsWith('UPDATE payment_order')) && log[2]?.sql === 'RELEASE SAVEPOINT payment_provider_txn_claim');
    }
    {
      const log: ProbeCall[] = [];
      const probe = makeProbe([
        { match: (s) => s.startsWith('UPDATE payment_order'), action: { code: '23505' } },
      ], log);
      const r = await markOrderPaidAndCredit(probe, 'o1', 'ord1', 'txn1');
      A('P4-5 payment paid 23505 mode③ [SP,WORK,RB,RL] -> conflict',
        r === 'conflict' && log.map((x) => kind(x.sql)).join(',') === 'SP,WORK,RB,RL');
    }
    {
      const log: ProbeCall[] = [];
      const probe = makeProbe([
        { match: (s) => s.startsWith('UPDATE payment_order'), action: { code: '42601' } },
      ], log);
      let rejected = false;
      try { await markOrderPaidAndCredit(probe, 'o1', 'ord1', 'txn1'); } catch { rejected = true; }
      A('P4-6 payment paid non-23505 mode② bare throw [SP,WORK] (zero RB, zero RL)',
        rejected && log.map((x) => kind(x.sql)).join(',') === 'SP,WORK');
    }
    // #3 payment markOrderRefunded — clawback shortfall sentinel / 23505 / no-hit
    {
      const log: ProbeCall[] = [];
      const probe = makeProbe([
        { match: (s) => s.startsWith('UPDATE payment_order'), action: { rowCount: 1, rows: [{ units: 10 }] } },
        { match: (s) => s.includes('FROM entitlement_bucket'), action: { rowCount: 1, rows: [{ id: 'b1', avail: 3 }] } },
        { match: (s) => s.startsWith('UPDATE entitlement_bucket'), action: { rowCount: 1 } },
      ], log);
      const r = await markOrderRefunded(probe, 'o1', 'ord1', 'rtxn1');
      const kinds = log.map((x) => kind(x.sql)).join(',');
      A('P4-7 payment refund clawback shortfall -> sentinel [SP,WORK,WORK(select),WORK(claw),RB,RL] -> conflict',
        r === 'conflict' && kinds === 'SP,WORK,WORK,WORK,RB,RL'
        && log[4]?.sql === 'ROLLBACK TO SAVEPOINT payment_refund_txn_claim' && log[5]?.sql === 'RELEASE SAVEPOINT payment_refund_txn_claim');
    }
    {
      const log: ProbeCall[] = [];
      const probe = makeProbe([
        { match: (s) => s.startsWith('UPDATE payment_order'), action: { code: '23505' } },
      ], log);
      const r = await markOrderRefunded(probe, 'o1', 'ord1', 'rtxn1');
      A('P4-8 payment refund 23505 mode③ [SP,WORK,RB,RL] -> conflict',
        r === 'conflict' && log.map((x) => kind(x.sql)).join(',') === 'SP,WORK,RB,RL');
    }
    {
      const log: ProbeCall[] = [];
      const probe = makeProbe([
        { match: (s) => s.startsWith('UPDATE payment_order'), action: { rowCount: 0 } },
        { match: (s) => s.includes('FROM payment_order'), action: { rowCount: 0, rows: [] } },
      ], log);
      const r = await markOrderRefunded(probe, 'o1', 'ord1', 'rtxn1');
      A('P4-9 payment refund no-hit [SP,WORK,RL,WORK(cur)] -> not_found (RELEASE inline before readback)',
        r === 'not_found' && log.map((x) => kind(x.sql)).join(',') === 'SP,WORK,RL,WORK'
        && log[2]?.sql === 'RELEASE SAVEPOINT payment_refund_txn_claim');
    }
    // #4 int-transcript submitInterviewAnswer — success / 23505 / other
    const answerInput = {
      interviewId: 'iv_dbsb1', questionId: 'q_dbsb1', stateVersion: 1,
      clientSubmissionKey: 'csk_dbsb1', answer: 'dbsb1-answer-body', privacyEpoch: 1,
    } as Parameters<typeof submitInterviewAnswer>[1];
    const passFences: ProbeRoute[] = [
      { match: (s) => s.includes('assert_interview_privacy_active') || s.includes('assert_interview_answer_fact_active') || s.includes('assert_interview_answer_ledger_write_allowed'), action: { rowCount: 1, rows: [{}] } },
    ];
    {
      const log: ProbeCall[] = [];
      const probe = makeProbe([
        ...passFences,
        { match: (s) => s.includes('INSERT INTO interview_answer_submission'), action: { rowCount: 1 } },
        { match: (s) => s.includes('INSERT INTO interview_answer_artifact'), action: { rowCount: 1 } },
        { match: (s) => s.includes('INSERT INTO interview_answer_job'), action: { rowCount: 1 } },
      ], log);
      const r = await submitInterviewAnswer(probe, answerInput);
      const spBlock = log.slice(3, 6).map((x) => kind(x.sql)).join(',');
      A('P4-10 int-transcript success [SP,WORK(insert),RL,WORK(artifact),WORK(job)] -> accepted_unscored replayed=false',
        r.status === 'accepted_unscored' && r.replayed === false
        && spBlock === 'SP,WORK,RL' && log[5]?.sql === 'RELEASE SAVEPOINT answer_submission_insert'
        && ((log[6]?.sql ?? '').includes('INSERT INTO interview_answer_artifact')));
    }
    {
      const log: ProbeCall[] = [];
      const readbackRow = { submissionId: 's0', artifactId: 'a0', jobId: 'j0', interviewId: 'iv_dbsb1', questionId: 'q_dbsb1', stateVersion: 1, clientSubmissionKey: 'csk_dbsb1', canonicalBodyHmac: '00', privacyEpoch: 1 };
      const probe = makeProbe([
        ...passFences,
        { match: (s) => s.includes('INSERT INTO interview_answer_submission'), action: { code: '23505' } },
        { match: (s) => s.includes('client_submission_key'), action: { rowCount: 1, rows: [readbackRow] } },
      ], log);
      // The readback digest will not match the probe stub — either a replayed
      // receipt or the fail-closed conflict is acceptable; the ORDER of the
      // savepoint block is the assertion target.
      let completedReadback = false;
      try { await submitInterviewAnswer(probe, answerInput); } catch { completedReadback = true; }
      const seq = log.map((x) => kind(x.sql)).join(',');
      completedReadback = completedReadback || log.length > 7;
      A('P4-11 int-transcript 23505 [SP,WORK,RB,RL] then readback path (fences passed, no rethrow of 23505)',
        completedReadback && seq.startsWith('WORK,WORK,WORK,SP,WORK,RB,RL') && log[6]?.sql === 'RELEASE SAVEPOINT answer_submission_insert');
    }
    {
      const log: ProbeCall[] = [];
      const probe = makeProbe([
        ...passFences,
        { match: (s) => s.includes('INSERT INTO interview_answer_submission'), action: { code: '42P01' } },
      ], log);
      let rejected = false;
      try { await submitInterviewAnswer(probe, answerInput); } catch { rejected = true; }
      A('P4-12 int-transcript non-23505 mode① [SP,WORK,RB] rethrow, no RELEASE',
        rejected && log.map((x) => kind(x.sql)).join(',') === 'WORK,WORK,WORK,SP,WORK,RB');
    }
  }

  /* ============================== P5 ============================== */
  {
    const principalSrc = readFileSync(join(ROOT, 'packages/db/src/principal.ts'), 'utf8');
    const codeSites = (principalSrc.match(/^\s*await c\.query\(.*SET LOCAL ROLE/gm) ?? []).length;
    const totalMentions = (principalSrc.match(/SET LOCAL ROLE/g) ?? []).length;
    // Executed sites: runAs generic (1) + provisionQbankControlDefiner
    // special-case (D3, kept) + assertRagControlDefinerOwnership exempted shell
    // (defect-A class, kept) = 3. (harness P5 originally said "=1" — exec-time
    // erratum: that wording predates the D3/D2 exemptions; the 8 former wrapper
    // literals are gone.) Two extra textual mentions live in runAs JSDoc.
    A('P5-1 principal.ts executed SET LOCAL ROLE sites = 3 (runAs 1 + provision special-case 1 + assertRag exempted shell 1; +2 JSDoc mentions)',
      codeSites === 3 && totalMentions === 5);

    const delegates = [
      [/export async function asPrincipal[^{]*\{[^}]*return runAs\(pool, 'app_role', fn, \{ principalUser: user \}\);[^}]*\}/, 'asPrincipal'],
      [/export async function asPrivacyWorkerPrincipal[^{]*\{[^}]*return runAs\(pool, 'privacy_worker_executor', fn, \{ principalUser: user \}\);[^}]*\}/, 'asPrivacyWorkerPrincipal'],
      [/export async function asPrivacyWorkerExecutor[^{]*\{[^}]*return runAs\(pool, 'privacy_worker_executor', fn\);[^}]*\}/, 'asPrivacyWorkerExecutor'],
      [/export async function asQbankControlExecutor[^{]*\{[^}]*return runAs\(pool, 'qbank_control_executor', fn\);[^}]*\}/, 'asQbankControlExecutor'],
      [/export async function asRagControlExecutor[^{]*\{[^}]*return runAs\(pool, 'rag_control_executor', fn\);[^}]*\}/, 'asRagControlExecutor'],
      [/export async function asOnlineJudgeScheduler[^{]*\{[^}]*return runAs\(pool, 'online_judge_scheduler', fn\);[^}]*\}/, 'asOnlineJudgeScheduler'],
      [/export async function asOnlineJudgeExecutor[^{]*\{[^}]*return runAs\(pool, 'online_judge_executor', fn\);[^}]*\}/, 'asOnlineJudgeExecutor'],
      [/export async function asGateway[^{]*\{[^}]*return runAs\(pool, 'app_gateway_role', fn\);[^}]*\}/, 'asGateway'],
    ] as const;
    A('P5-2 8 named wrappers are one-line runAs delegates', delegates.every(([re]) => re.test(principalSrc)));

    const jobsNoInline = ['interview-jobs.ts', 'quiz-jobs.ts', 'diagnosis-jobs.ts'].every((f) => {
      const src = readFileSync(join(ROOT, 'packages/db/src', f), 'utf8');
      return !src.includes('FOR UPDATE SKIP LOCKED') && !src.includes("SET status='done'") && !src.includes("SET status='failed'")
        && !src.includes('lease_expires_at = now() +');
    });
    A('P5-3 three *-jobs.ts modules carry no inline five-piece SQL literals', jobsNoInline);

    const r4Dir = join(ROOT, 'apps/worker/src');
    const r4Count = readdirSync(r4Dir).filter((f) => f.startsWith('r4-') && f.endsWith('.ts')).length;
    A(`P5-4 r4 zero relocation: apps/worker/src/r4-*.ts count still 31 (DIR-1 B3 owns the move)`, r4Count === 31);
  }

  /* ============================== P6 ============================== */
  {
    const workerPkg = JSON.parse(readFileSync(join(ROOT, 'apps/worker/package.json'), 'utf8')) as { scripts: Record<string, string> };
    const r4Aliases = Object.entries(workerPkg.scripts).filter(([k]) => k.startsWith('prove:r4-'));
    const allResolve = r4Aliases.every(([, v]) => {
      const m = /tsx (test\/\S+)/.exec(v);
      return m !== null && existsSync(join(ROOT, 'apps/worker', m[1]!));
    });
    A(`P6-1 worker prove:r4-* aliases (${r4Aliases.length}) all resolve to existing files`, r4Aliases.length >= 35 && allResolve);

    const rootPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> };
    const rootR4 = Object.entries(rootPkg.scripts).filter(([k, v]) => k.includes('r4') && v.includes('worker'));
    A('P6-2 root r4 aggregate aliases still target the worker package', rootR4.length >= 1);

    const assessment = join(ROOT, 'ai-docs/delivery/r4-evidence-retirement-assessment.md');
    const assessmentText = existsSync(assessment) ? readFileSync(assessment, 'utf8') : '';
    A('P6-3 r4 retirement assessment doc exists with retire/retain tables',
      assessmentText.includes('永续集') && assessmentText.includes('可退役候选集') && assessmentText.includes('别名保全契约'));
  }

  console.log(`RESULT failures=${failures}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

void main().catch((error) => { console.error('PROOF_CRASH', error); process.exitCode = 1; });
