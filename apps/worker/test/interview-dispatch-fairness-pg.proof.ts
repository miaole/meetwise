/**
 * Isolated PostgreSQL proof for interview dispatch fairness and claim fences.
 * Must run via scripts/run-e2e-isolated.mjs after versioned migrations.
 * releaseEvidence=false.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, asPrincipal, asGateway, claimNextInterviewJob, createPool,
  createResumeWithBlob, completeIngestion, enqueueInterviewJob, gatewayDispatchOwners,
  markJobDone, markJobFailed, requeueInterviewJob, transitionResume, MAX_INTERVIEW_JOB_ATTEMPTS,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';
import { fairDrainInterviewOwners } from '../src/interview-dispatch-fairness.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const RESUME = ['工作经历', '负责订单限流与可靠性改造。'].join('\n');

async function seedOwner(owner: string, interviewIds: string[]): Promise<void> {
  const resumeId = await asPrincipal(pool, owner, async (c) => {
    const created = await createResumeWithBlob(c, owner, RESUME);
    await transitionResume(c, owner, created.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, owner, created.resumeId, ingestResume(RESUME));
    return created.resumeId;
  });
  const epoch = await asPrincipal(pool, owner, async (c) => Number((
    await c.query<{ privacy_epoch: number }>('SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [resumeId, owner])
  ).rows[0]!.privacy_epoch));
  for (const interviewId of interviewIds) {
    await asPrincipal(pool, owner, async (c) => {
      await c.query(
        "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,$4)",
        [interviewId, owner, resumeId, epoch],
      );
      await enqueueInterviewJob(c, owner, interviewId, 'start', { requestId: `fair-${interviewId}` }, 0);
    });
  }
}

async function claimAsLease(owner: string, leaseOwner: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE app_role');
    await client.query("SELECT set_config('app.principal_user', $1, true)", [owner]);
    const job = await claimNextInterviewJob(client, owner, leaseOwner, MAX_INTERVIEW_JOB_ATTEMPTS, { perOwnerInflight: 1 });
    await client.query('COMMIT');
    return job;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  await assertIsolatedTestTarget(pool);
  const suffix = `${process.pid}-${Date.now()}`;
  const ownerA = `fair-a-${suffix}`;
  const ownerB = `fair-b-${suffix}`;
  const interviewsA = [`ia1-${suffix}`, `ia2-${suffix}`, `ia3-${suffix}`];
  const interviewsB = [`ib1-${suffix}`];
  await seedOwner(ownerA, interviewsA);
  await seedOwner(ownerB, interviewsB);

  const owners = await gatewayDispatchOwners(pool, 'interview');
  const fairOwners = owners.filter((owner) => owner === ownerA || owner === ownerB);
  A('gateway 只返回 owner id 且按最老等待排序', fairOwners.length === 2 && fairOwners[0] === ownerA && fairOwners[1] === ownerB);

  const claimOrder: string[] = [];
  await fairDrainInterviewOwners(
    { perOwnerInflight: 1 },
    fairOwners,
    { perOwnerInflight: 1, globalInflight: 1 },
    async (budget, owner) => {
      const job = await asPrincipal(pool, owner, (c) =>
        claimNextInterviewJob(c, owner, `fair-worker-${owner}`, MAX_INTERVIEW_JOB_ATTEMPTS, budget));
      if (!job) return 'idle';
      claimOrder.push(owner === ownerA ? 'A' : 'B');
      await asPrincipal(pool, owner, (c) => markJobDone(c, owner, job.id, `fair-worker-${owner}`));
      return job.kind;
    },
    (result) => result === 'idle',
  );
  A('TC-WORKER-002-main 领取顺序恰好是 A,B,A,A', claimOrder.join(',') === 'A,B,A,A');

  const ownerC = `fair-c-${suffix}`;
  const interviewC = `ic-${suffix}`;
  await seedOwner(ownerC, [interviewC]);
  const first = await asPrincipal(pool, ownerC, (c) => enqueueInterviewJob(c, ownerC, interviewC, 'start', { requestId: 'dup' }, 0));
  const second = await asPrincipal(pool, ownerC, (c) => enqueueInterviewJob(c, ownerC, interviewC, 'start', { requestId: 'dup-2' }, 0));
  const rows = await asPrincipal(pool, ownerC, (c) => c.query('SELECT count(*)::int AS n FROM interview_job WHERE interview_id=$1', [interviewC]));
  A('TC-WORKER-002-E1 重复 enqueue 不增行', first === second && Number(rows.rows[0]?.n) === 1);

  const ownerF = `fair-f-${suffix}`;
  const interviewsF = [`if1-${suffix}`, `if2-${suffix}`];
  await seedOwner(ownerF, interviewsF);
  const [left, right] = await Promise.all([
    claimAsLease(ownerF, 'lease-f1'),
    claimAsLease(ownerF, 'lease-f2'),
  ]);
  const winners = [left, right].filter((job) => job !== null);
  const fStatus = await asPrincipal(pool, ownerF, (c) => c.query<{ status: string }>(
    "SELECT status FROM interview_job WHERE owner_user_id=$1 ORDER BY created_at",
    [ownerF],
  ));
  A(
    'TC-WORKER-002-E2 两连接 cap=1 恰一赢 另一场保持 queued',
    winners.length === 1
      && fStatus.rows.filter((row) => row.status === 'running').length === 1
      && fStatus.rows.filter((row) => row.status === 'queued').length === 1,
  );

  const ownerD = `fair-d-${suffix}`;
  const interviewsD = [`id1-${suffix}`, `id2-${suffix}`];
  await seedOwner(ownerD, interviewsD);
  const d1 = await asPrincipal(pool, ownerD, (c) => claimNextInterviewJob(c, ownerD, 'lease-d', MAX_INTERVIEW_JOB_ATTEMPTS, { perOwnerInflight: 1 }));
  const d2 = await asPrincipal(pool, ownerD, (c) => claimNextInterviewJob(c, ownerD, 'lease-d2', MAX_INTERVIEW_JOB_ATTEMPTS, { perOwnerInflight: 1 }));
  const queuedLeft = await asPrincipal(pool, ownerD, (c) => c.query("SELECT count(*)::int AS n FROM interview_job WHERE owner_user_id=$1 AND status='queued'", [ownerD]));
  A('TC-WORKER-002-E5 cap=1 时第二场保持 queued', d1 !== null && d2 === null && Number(queuedLeft.rows[0]?.n) === 1);

  const stolenDone = d1
    ? await asPrincipal(pool, ownerD, (c) => markJobDone(c, ownerD, d1.id, 'not-the-owner'))
    : true;
  const stolenFail = d1
    ? await asPrincipal(pool, ownerD, (c) => markJobFailed(c, ownerD, d1.id, 'not-the-owner', 'nope'))
    : true;
  const stolenRequeue = d1
    ? await asPrincipal(pool, ownerD, (c) => requeueInterviewJob(c, ownerD, d1.id, 'not-the-owner'))
    : true;
  const stillRunning = d1
    ? await asPrincipal(pool, ownerD, (c) => c.query("SELECT status, lease_owner FROM interview_job WHERE id=$1", [d1.id]))
    : { rows: [] };
  A('TC-WORKER-002-E4 非持租 CAS=0', stolenDone === false && stolenFail === false && stolenRequeue === false
    && stillRunning.rows[0]?.status === 'running' && stillRunning.rows[0]?.lease_owner === 'lease-d');

  const ownerE = `fair-e-${suffix}`;
  const interviewE = `ie-${suffix}`;
  await seedOwner(ownerE, [interviewE]);
  const startE = await asPrincipal(pool, ownerE, (c) => claimNextInterviewJob(c, ownerE, 'lease-e'));
  const answerId = await asPrincipal(pool, ownerE, (c) => enqueueInterviewJob(c, ownerE, interviewE, 'answer', { answer: 'not-yet' }, 1));
  const nextWhileStartRunning = await asPrincipal(pool, ownerE, (c) => claimNextInterviewJob(c, ownerE, 'lease-e2'));
  const seq1 = await asPrincipal(pool, ownerE, (c) => c.query<{ status: string }>(
    "SELECT status FROM interview_job WHERE id=$1 AND owner_user_id=$2",
    [answerId, ownerE],
  ));
  A('TC-WORKER-002-E6 同面试 start running 时不领后序且 seq1 保持 queued', startE !== null && answerId.length > 0 && nextWhileStartRunning === null && seq1.rows[0]?.status === 'queued');

  const cross = await asPrincipal(pool, ownerA, (c) => claimNextInterviewJob(c, ownerE, 'cross'));
  A('TC-WORKER-002-E3 跨 owner claim 为 0', cross === null);

  const noPrincipalClient = await pool.connect();
  let noPrincipalRows = -1;
  let noPrincipalError = false;
  try {
    await noPrincipalClient.query('BEGIN');
    await noPrincipalClient.query('SET LOCAL ROLE app_role');
    const visible = await noPrincipalClient.query("SELECT id FROM interview_job WHERE owner_user_id=$1", [ownerE]);
    noPrincipalRows = visible.rowCount ?? 0;
  } catch {
    noPrincipalError = true;
    noPrincipalRows = 0;
  } finally {
    await noPrincipalClient.query('ROLLBACK').catch(() => undefined);
    noPrincipalClient.release();
  }
  const victimStillQueued = await asPrincipal(pool, ownerE, (c) => c.query<{ status: string }>(
    "SELECT status FROM interview_job WHERE id=$1",
    [answerId],
  ));
  A(
    '无 principal 的 app_role 读不到作业且受害行仍 queued',
    (noPrincipalError || noPrincipalRows === 0) && victimStillQueued.rows[0]?.status === 'queued',
  );

  const migration = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0124_interview_dispatch_fairness.sql', import.meta.url)), 'utf8');
  const interviewBranch = migration.slice(migration.indexOf("WHEN 'interview' THEN"), migration.indexOf("WHEN 'quiz' THEN"));
  A(
    '0124 面试枚举按最老等待排序且只投影 owner id',
    interviewBranch.includes('ORDER BY min(j.created_at) ASC, j.owner_user_id ASC')
      && interviewBranch.includes('SELECT j.owner_user_id::text')
      && !/\bpayload\b/.test(interviewBranch.replace(/--[^\n]*/g, ''))
      && migration.includes('GRANT EXECUTE ON FUNCTION gateway_dispatch_owners(text) TO app_gateway_role'),
  );
  const gatewayCols = await asGateway(pool, (c) => c.query("SELECT * FROM gateway_dispatch_owners('interview') LIMIT 1"));
  A('gateway 结果列只有 owner_user_id', gatewayCols.fields.length === 1 && gatewayCols.fields[0]?.name === 'owner_user_id');

  console.log(`\n${failures === 0 ? '✓ interview dispatch fairness PG proof passed' : `✗ ${failures} failures`}; releaseEvidence=false`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
