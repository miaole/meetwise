/**
 * Isolation-PG contract for HC-GAP-004: two concurrent claimants on the same
 * owner quiz (and the same-shaped diagnosis job) elect exactly one winner.
 * The loser returns null and must leave attempts/events/entitlement/parent at 0 delta.
 *
 * Requires E2E_CLOUD_ISOLATED=1. Local Docker / loopback is forbidden.
 * Missing remote config fails closed and must not start a local database.
 * releaseEvidence=false.
 *
 *   pnpm quiz-dual-claim:prove
 */
import {
  assertIsolatedTestTarget, asPrincipal, availableUnits, claimNextDiagnosisJob,
  claimNextQuizJob, createPool, createResumeWithBlob, completeIngestion,
  enqueueDiagnosisJob, enqueueQuizJob, markDiagnosisJobDone, markQuizJobDone,
  reserveEntitlement, transitionResume, type Client,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';
import { assertQuizDiagnosisDualClaimRemotePostgres } from '../src/quiz-diagnosis-dual-claim.ts';

let pool: ReturnType<typeof createPool>;
let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const RESUME = ['工作经历', '负责订单限流与可靠性改造。'].join('\n');

async function beginPrincipal(client: Client, owner: string): Promise<void> {
  await client.query('BEGIN');
  await client.query('SET LOCAL ROLE app_role');
  await client.query("SELECT set_config('app.principal_user', $1, true)", [owner]);
}

async function dualClaim<T>(
  owner: string,
  claim: (client: Client, leaseOwner: string) => Promise<T>,
  leaseA: string,
  leaseB: string,
): Promise<[T, T]> {
  const leftClient = await pool.connect();
  const rightClient = await pool.connect();
  try {
    await beginPrincipal(leftClient, owner);
    await beginPrincipal(rightClient, owner);
    const [left, right] = await Promise.all([
      claim(leftClient, leaseA),
      claim(rightClient, leaseB),
    ]);
    await Promise.all([leftClient.query('COMMIT'), rightClient.query('COMMIT')]);
    return [left, right];
  } catch (error) {
    await Promise.all([
      leftClient.query('ROLLBACK').catch(() => undefined),
      rightClient.query('ROLLBACK').catch(() => undefined),
    ]);
    throw error;
  } finally {
    leftClient.release();
    rightClient.release();
  }
}

type JobKind = 'quiz' | 'diagnosis';

interface LedgerSnapshot {
  jobCount: number;
  status: string | undefined;
  attempts: number;
  version: number;
  leaseOwner: string | null;
  events: number;
  parentStatus: string | undefined;
  parentVersion: number;
  units: number;
}

async function snapshot(owner: string, kind: JobKind, id: string): Promise<LedgerSnapshot> {
  const jobTable = kind === 'quiz' ? 'quiz_job' : 'diagnosis_job';
  const idCol = kind === 'quiz' ? 'quiz_id' : 'diagnosis_id';
  const parentTable = kind === 'quiz' ? 'resume_quiz' : 'resume_diagnosis';
  return asPrincipal(pool, owner, async (c) => {
    const job = await c.query<{ status: string; attempts: number; version: number; lease_owner: string | null }>(
      `SELECT status, attempts, version, lease_owner FROM ${jobTable} WHERE owner_user_id=$1 AND ${idCol}=$2`,
      [owner, id],
    );
    const jobs = await c.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM ${jobTable} WHERE owner_user_id=$1 AND ${idCol}=$2`,
      [owner, id],
    );
    const events = await c.query<{ n: number }>(
      'SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1',
      [id],
    );
    const parent = await c.query<{ status: string; version: number }>(
      `SELECT status, version FROM ${parentTable} WHERE id=$1 AND owner_user_id=$2`,
      [id, owner],
    );
    return {
      jobCount: Number(jobs.rows[0]?.n ?? -1),
      status: job.rows[0]?.status,
      attempts: Number(job.rows[0]?.attempts ?? -1),
      version: Number(job.rows[0]?.version ?? -1),
      leaseOwner: job.rows[0]?.lease_owner ?? null,
      events: Number(events.rows[0]?.n ?? -1),
      parentStatus: parent.rows[0]?.status,
      parentVersion: Number(parent.rows[0]?.version ?? -1),
      units: await availableUnits(c, owner),
    };
  });
}

async function seedOwner(owner: string, quizId: string, diagnosisId: string): Promise<void> {
  const resumeId = await asPrincipal(pool, owner, async (c) => {
    const created = await createResumeWithBlob(c, owner, RESUME);
    await transitionResume(c, owner, created.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, owner, created.resumeId, ingestResume(RESUME));
    return created.resumeId;
  });
  const epoch = await asPrincipal(pool, owner, async (c) => Number((
    await c.query<{ privacy_epoch: number }>('SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [resumeId, owner])
  ).rows[0]!.privacy_epoch));
  await asPrincipal(pool, owner, async (c) => {
    await c.query("INSERT INTO resume_quiz(id,owner_user_id,status) VALUES ($1,$2,'created')", [quizId, owner]);
    await c.query(
      "INSERT INTO resume_diagnosis(id,owner_user_id,status,target_role) VALUES ($1,$2,'created','backend')",
      [diagnosisId, owner],
    );
    await c.query(
      'UPDATE resume_quiz SET resume_id=$3,privacy_epoch=$4 WHERE id=$1 AND owner_user_id=$2',
      [quizId, owner, resumeId, epoch],
    );
    await c.query(
      'UPDATE resume_diagnosis SET resume_id=$3,privacy_epoch=$4 WHERE id=$1 AND owner_user_id=$2',
      [diagnosisId, owner, resumeId, epoch],
    );
    await c.query(
      "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',2,now()+interval '1 day')",
      [owner],
    );
    await reserveEntitlement(c, owner, quizId, 'resume_quiz', 1);
    await reserveEntitlement(c, owner, diagnosisId, 'resume_diagnosis', 1);
    await enqueueQuizJob(c, owner, quizId, resumeId, epoch);
    await enqueueDiagnosisJob(c, owner, diagnosisId, resumeId, epoch);
  });
}

function winnerLoser<T>(left: T | null, right: T | null, leaseA: string, leaseB: string) {
  const wins = [left, right].filter((job) => job !== null);
  const winnerLease = left !== null ? leaseA : right !== null ? leaseB : null;
  const loserLease = left === null ? leaseA : right === null ? leaseB : null;
  return { wins, winnerLease, loserLease };
}

async function main() {
  assertQuizDiagnosisDualClaimRemotePostgres();
  pool = createPool();
  try {
    await assertIsolatedTestTarget(pool);
    const suffix = `${process.pid}-${Date.now()}`;
    const owner = `qdc-owner-${suffix}`;
    const other = `qdc-other-${suffix}`;
    const quizId = `qdc-quiz-${suffix}`;
    const diagnosisId = `qdc-diag-${suffix}`;
    await seedOwner(owner, quizId, diagnosisId);
    await asPrincipal(pool, other, async (c) => {
      await c.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',1,now()+interval '1 day')", [other]);
    });

    const quizBefore = await snapshot(owner, 'quiz', quizId);
    const [quizLeft, quizRight] = await dualClaim(
      owner,
      (c, lease) => claimNextQuizJob(c, owner, lease),
      'qdc-quiz-a',
      'qdc-quiz-b',
    );
    const quizRace = winnerLoser(quizLeft, quizRight, 'qdc-quiz-a', 'qdc-quiz-b');
    const quizAfter = await snapshot(owner, 'quiz', quizId);
    const quizWinner = quizLeft ?? quizRight;
    A(
      'TC-WORKER-001-E2-quiz 两连接同押题恰一赢',
      quizRace.wins.length === 1
        && quizWinner?.quizId === quizId
        && quizAfter.status === 'running'
        && quizAfter.jobCount === 1
        && quizAfter.attempts === quizBefore.attempts + 1
        && quizAfter.version === quizBefore.version + 1
        && quizAfter.leaseOwner === quizRace.winnerLease,
    );
    A(
      'TC-WORKER-001-E2-quiz 败者副作用=0',
      (quizLeft === null || quizRight === null)
        && quizAfter.events === quizBefore.events
        && quizAfter.units === quizBefore.units
        && quizAfter.parentStatus === quizBefore.parentStatus
        && quizAfter.parentVersion === quizBefore.parentVersion
        && quizAfter.jobCount === quizBefore.jobCount,
    );
    const quizStolen = quizWinner && quizRace.loserLease
      ? await asPrincipal(pool, owner, (c) => markQuizJobDone(c, owner, quizWinner.id, quizRace.loserLease!))
      : true;
    A('押题败者 lease markDone CAS=0 且仍 running', quizStolen === false && (await snapshot(owner, 'quiz', quizId)).status === 'running');
    const quizThird = await asPrincipal(pool, owner, (c) => claimNextQuizJob(c, owner, 'qdc-quiz-third'));
    A('同押题仍 running 时第三领为 null', quizThird === null);
    const quizCross = await asPrincipal(pool, other, (c) => claimNextQuizJob(c, owner, 'qdc-quiz-cross'));
    A('跨 owner 押题 claim=0', quizCross === null);

    const diagnosisBefore = await snapshot(owner, 'diagnosis', diagnosisId);
    const [diagLeft, diagRight] = await dualClaim(
      owner,
      (c, lease) => claimNextDiagnosisJob(c, owner, lease),
      'qdc-diag-a',
      'qdc-diag-b',
    );
    const diagRace = winnerLoser(diagLeft, diagRight, 'qdc-diag-a', 'qdc-diag-b');
    const diagnosisAfter = await snapshot(owner, 'diagnosis', diagnosisId);
    const diagWinner = diagLeft ?? diagRight;
    A(
      'TC-WORKER-001-E2-diagnosis 两连接同诊断恰一赢',
      diagRace.wins.length === 1
        && diagWinner?.diagnosisId === diagnosisId
        && diagnosisAfter.status === 'running'
        && diagnosisAfter.jobCount === 1
        && diagnosisAfter.attempts === diagnosisBefore.attempts + 1
        && diagnosisAfter.version === diagnosisBefore.version + 1
        && diagnosisAfter.leaseOwner === diagRace.winnerLease,
    );
    A(
      'TC-WORKER-001-E2-diagnosis 败者副作用=0',
      (diagLeft === null || diagRight === null)
        && diagnosisAfter.events === diagnosisBefore.events
        && diagnosisAfter.units === diagnosisBefore.units
        && diagnosisAfter.parentStatus === diagnosisBefore.parentStatus
        && diagnosisAfter.parentVersion === diagnosisBefore.parentVersion
        && diagnosisAfter.jobCount === diagnosisBefore.jobCount,
    );
    const diagStolen = diagWinner && diagRace.loserLease
      ? await asPrincipal(pool, owner, (c) => markDiagnosisJobDone(c, owner, diagWinner.id, diagRace.loserLease!))
      : true;
    A('诊断败者 lease markDone CAS=0 且仍 running', diagStolen === false && (await snapshot(owner, 'diagnosis', diagnosisId)).status === 'running');
    const diagThird = await asPrincipal(pool, owner, (c) => claimNextDiagnosisJob(c, owner, 'qdc-diag-third'));
    A('同诊断仍 running 时第三领为 null', diagThird === null);
    const diagCross = await asPrincipal(pool, other, (c) => claimNextDiagnosisJob(c, owner, 'qdc-diag-cross'));
    A('跨 owner 诊断 claim=0', diagCross === null);

    const noPrincipalClient = await pool.connect();
    let noPrincipalRows = -1;
    let noPrincipalError = false;
    try {
      await noPrincipalClient.query('BEGIN');
      await noPrincipalClient.query('SET LOCAL ROLE app_role');
      const visible = await noPrincipalClient.query('SELECT id FROM quiz_job WHERE owner_user_id=$1', [owner]);
      noPrincipalRows = visible.rowCount ?? 0;
    } catch {
      noPrincipalError = true;
      noPrincipalRows = 0;
    } finally {
      await noPrincipalClient.query('ROLLBACK').catch(() => undefined);
      noPrincipalClient.release();
    }
    const victimStillRunning = await snapshot(owner, 'quiz', quizId);
    A(
      '无 principal 的 app_role 读不到押题作业且受害行仍 running',
      (noPrincipalError || noPrincipalRows === 0) && victimStillRunning.status === 'running',
    );
  } finally {
    await pool.end();
  }
  console.log(`\n${failures === 0 ? '✓ quiz/diagnosis dual-claim PG proof passed' : `✗ ${failures} failures`}; releaseEvidence=false`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
