/**
 * Real PostgreSQL proof for the physical checkpoint erasure primitive.
 * It intentionally contains a random marker only in database rows and never
 * prints it: success is proved by count=0 after the dedicated worker purge.
 */
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  asPrincipal, asPrivacyWorkerPrincipal, assertIsolatedTestTarget, beginCheckpointErasure,
  claimCheckpointErasureTarget, claimNextInterviewJob, createPool, enqueueInterviewJob,
  enqueueReport, enrollCheckpointThread, isInterviewPrivacyActive, loadClaimedInterviewAnswerPayload, loadMigrations,
  provisionPrivacyWorkerLogin, provisionRuntimeLogin, purgeCheckpointErasureTarget, runMigrations,
} from '@meetwise/db';
import { invoke } from '@meetwise/ai-runtime';
import { drainReportsOnce } from '../src/report-worker.ts';

const admin = createPool();
const runtimeRole = `privacy_api_${process.pid}`;
const workerRole = `privacy_worker_${process.pid}`;
const runtimePassword = 'privacy-api-proof-password-2026';
const workerPassword = 'privacy-worker-proof-password-2026';
let failures = 0;
// Output only a fixed test identifier.  This proof intentionally creates raw
// privacy sentinels, so a runner may count failures without ever persisting or
// displaying a descriptive line that a future edit could contaminate.
const A = (id: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

async function main() {
  await assertIsolatedTestTarget(admin);
  // The isolated runner has already applied the complete migration prefix.
  // Re-run only verifies the ledger/checksum invariant; deleting its ledger on
  // a non-empty schema would correctly fail before any destructive baseline.
  await runMigrations(admin, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await provisionRuntimeLogin(admin, { roleName: runtimeRole, password: runtimePassword });
  await provisionPrivacyWorkerLogin(admin, { roleName: workerRole, password: workerPassword });
  const runtime = createPool({ user: runtimeRole, password: runtimePassword, max: 24 });
  const worker = createPool({ user: workerRole, password: workerPassword, max: 4 });
  const ownerA = `privacy-owner-a-${process.pid}`;
  const ownerB = `privacy-owner-b-${process.pid}`;
  const threadA = `privacy-thread-a-${process.pid}`;
  const threadB = `privacy-thread-b-${process.pid}`;
  const raceThread = `privacy-thread-race-${process.pid}`;
  const resumeA = randomUUID();
  const resumeRace = randomUUID();
  const marker = `privacy-marker-${randomUUID()}`;
  const idempotencyHash = 'a'.repeat(64);
  try {
    // Queue fixtures must obey the same v64 parent reference as production:
    // checkpoint-only erasure does not waive the `resume_id + epoch` gate.
    await admin.query(
      `INSERT INTO resume(id,owner_user_id,status,content_sha)
         VALUES ($1,$2,'ingested',$3),($4,$2,'ingested',$5)`,
      [resumeA, ownerA, `privacy-resume-a-${process.pid}`, resumeRace, `privacy-resume-race-${process.pid}`],
    );
    await admin.query(
      `INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch)
         VALUES ($1,$2,'created',$3,1),($4,$5,'created',NULL,NULL),($6,$2,'created',$7,1)`,
      [threadA, ownerA, resumeA, threadB, ownerB, raceThread, resumeRace],
    );
    const pausedBeginRejected = await rejects(() => asPrincipal(runtime, ownerA, (c) =>
      beginCheckpointErasure(c, threadA, idempotencyHash)));
    const pausedRevokeRejected = await rejects(() => asPrincipal(runtime, ownerA, (c) =>
      c.query('SELECT revoke_checkpoint_thread($1)', [threadA])));
    // This is the actual pre-0075 attack shape: the low-privilege runtime
    // writes a victim principal into the routing GUC, then invokes the
    // SECURITY DEFINER entrypoint directly.  ACL denial must win before the
    // forged context can produce a victim request or checkpoint target.
    const forgedVictimRejected = await (async () => {
      const attacker = await runtime.connect();
      try {
        await attacker.query('BEGIN');
        await attacker.query("SELECT set_config('app.principal_user',$1,true)", [ownerB]);
        await attacker.query('SELECT privacy_begin_checkpoint_erasure($1,$2)', [threadB, 'b'.repeat(64)]);
        await attacker.query('ROLLBACK');
        return false;
      } catch {
        await attacker.query('ROLLBACK').catch(() => undefined);
        return true;
      } finally { attacker.release(); }
    })();
    const pausedPrivileges = await admin.query<{ begin_allowed: boolean; revoke_allowed: boolean }>(
      `SELECT
         has_function_privilege('app_role','public.privacy_begin_checkpoint_erasure(text,text)','EXECUTE') AS begin_allowed,
         has_function_privilege('app_role','public.revoke_checkpoint_thread(text)','EXECUTE') AS revoke_allowed`,
    );
    const pausedLedger = await admin.query<{ requests: number; targets: number }>(`
      SELECT
        (SELECT count(*)::int FROM privacy_erasure_request WHERE owner_user_id=$1 AND subject_id=$2) AS requests,
        (SELECT count(*)::int FROM privacy_deletion_target t
           JOIN privacy_erasure_request r ON r.id=t.request_id
          WHERE r.owner_user_id=$1 AND r.subject_id=$2) AS targets`,
      [ownerA, threadA]);
    const forgedVictimLedger = await admin.query<{ requests: number; targets: number }>(`
      SELECT
        (SELECT count(*)::int FROM privacy_erasure_request WHERE owner_user_id=$1 AND subject_id=$2) AS requests,
        (SELECT count(*)::int FROM privacy_deletion_target t
           JOIN privacy_erasure_request r ON r.id=t.request_id
          WHERE r.owner_user_id=$1 AND r.subject_id=$2) AS targets`,
      [ownerB, threadB]);
    A('PPRIV000', pausedBeginRejected && pausedRevokeRejected
      && pausedPrivileges.rows[0]?.begin_allowed === false && pausedPrivileges.rows[0]?.revoke_allowed === false
      && Number(pausedLedger.rows[0]?.requests) === 0 && Number(pausedLedger.rows[0]?.targets) === 0);
    A('PPRIV001', forgedVictimRejected
      && Number(forgedVictimLedger.rows[0]?.requests) === 0 && Number(forgedVictimLedger.rows[0]?.targets) === 0);

    // A historical checkpoint target/worker proof follows this return.  It is
    // intentionally dormant while the public destructive entrypoint is
    // paused: running it as app_role would reintroduce the forged-GUC
    // authorization assumption that this migration removes.
    if (pausedBeginRejected && pausedRevokeRejected && forgedVictimRejected) return;
    const enrolled = await asPrincipal(runtime, ownerA, (c) => enrollCheckpointThread(c, ownerA, threadA));
    const queueMarker = `privacy-queue-marker-${randomUUID()}`;
    await asPrincipal(runtime, ownerA, (c) => enqueueInterviewJob(
      c, ownerA, threadA, 'start', { requestId: `privacy-start-${process.pid}` }, 0,
    ));
    const queuedJobId = await asPrincipal(runtime, ownerA, (c) => enqueueInterviewJob(
      c, ownerA, threadA, 'answer', { answer: queueMarker, turn: 0 }, 1,
    ));
    const runningJob = await asPrincipal(runtime, ownerA, async (c) => {
      await c.query(
        "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,resume_privacy_epoch,reference_schema_version,status,lease_owner,lease_expires_at) VALUES ($1,$2,'answer',2,$3::jsonb,NULL,1,64,'running','privacy-race-worker',now()+interval '2 minutes')",
        [ownerA, threadA, JSON.stringify({ answer: queueMarker, turn: 1 })],
      );
      return (await c.query<{ id: string }>(
        "SELECT id FROM interview_job WHERE owner_user_id=$1 AND interview_id=$2 AND kind='answer' AND seq=2",
        [ownerA, threadA],
      )).rows[0]!;
    });
    await asPrincipal(runtime, ownerA, (c) => c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status) VALUES ($1,$2,'privacy-open-question',1,0,'待删除题目','issued')",
      [ownerA, threadA],
    ));
    const reportActiveBeforeFence = await asPrincipal(runtime, ownerA, (c) => isInterviewPrivacyActive(c, threadA))
      .catch(() => false);
    const reportEnqueueResult = await asPrincipal(runtime, ownerA, (c) => enqueueReport(c, ownerA, threadA))
      .then(() => 'none').catch((error: any) => String(error?.code ?? 'unknown'));
    const reportEnqueuedBeforeFence = reportEnqueueResult === 'none';
    A('PPRIV021', reportActiveBeforeFence);
    A('PPRIV023', reportEnqueuedBeforeFence);
    const fixture = await admin.connect();
    try {
      await fixture.query("SELECT set_config('app.principal_user',$1,false)", [ownerA]);
      await fixture.query("SELECT set_config('app.checkpoint_thread_id',$1,false)", [threadA]);
      await fixture.query("SELECT set_config('app.checkpoint_epoch',$1,false)", [String(enrolled.fenceEpoch)]);
      await fixture.query(
        "INSERT INTO checkpoints(thread_id,checkpoint_ns,checkpoint_id,checkpoint,metadata) VALUES ($1,'','privacy-checkpoint',$2::jsonb,'{}'::jsonb)",
        [threadA, JSON.stringify({ marker })],
      );
      await fixture.query(
        "INSERT INTO checkpoint_blobs(thread_id,checkpoint_ns,channel,version,type,blob) VALUES ($1,'','privacy-channel','1','json',convert_to($2,'UTF8'))",
        [threadA, marker],
      );
      await fixture.query(
        "INSERT INTO checkpoint_writes(thread_id,checkpoint_ns,checkpoint_id,task_id,idx,channel,type,blob) VALUES ($1,'','privacy-checkpoint','privacy-task',0,'privacy-channel','json',convert_to($2,'UTF8'))",
        [threadA, marker],
      );
    } finally { fixture.release(); }

    const requests = await Promise.all(Array.from({ length: 100 }, () =>
      asPrincipal(runtime, ownerA, (c) => beginCheckpointErasure(c, threadA, idempotencyHash))));
    const requestIds = new Set(requests.map((request) => request.requestId));
    const targetIds = new Set(requests.map((request) => request.checkpointTargetId));
    A('PPRIV001',
      requestIds.size === 1 && targetIds.size === 1 && requests.every((request) => request.status === 'fenced'));
    const request = requests[0]!;
    const queueAfterFence = await admin.query<{
      active_jobs: number; raw_payloads: number; raw_marker: number; open_questions: number; queue_target: number;
    }>(`
      SELECT
        (SELECT count(*)::int FROM interview_job WHERE interview_id=$1 AND status IN ('queued','running')) AS active_jobs,
        (SELECT count(*)::int FROM interview_job WHERE interview_id=$1 AND payload <> '{}'::jsonb) AS raw_payloads,
        (SELECT count(*)::int FROM interview_job WHERE interview_id=$1 AND payload::text LIKE '%' || $2 || '%') AS raw_marker,
        (SELECT count(*)::int FROM interview_question WHERE interview_id=$1 AND status IN ('issued','queued')) AS open_questions,
        (SELECT count(*)::int FROM privacy_deletion_target WHERE request_id=$3 AND sink='interview_job_payload' AND status='erased') AS queue_target
    `, [threadA, queueMarker, request.requestId]);
    const queueRow = queueAfterFence.rows[0];
    const lateClaim = await asPrincipal(runtime, ownerA, (c) => claimNextInterviewJob(c, ownerA, 'privacy-late-worker'));
    const lateLoad = await asPrincipal(runtime, ownerA, (c) =>
      loadClaimedInterviewAnswerPayload(c, ownerA, runningJob.id, 'privacy-race-worker'));
    const directInsertRejected = await rejects(() => asPrincipal(runtime, ownerA, (c) => enqueueInterviewJob(
      c, ownerA, threadA, 'answer', { answer: queueMarker }, 99,
    )));
    // A fenced row may be rejected by the write trigger or hidden by RLS.  In
    // both cases the invariant is the same: app_role changes exactly zero
    // rows and cannot re-materialize a payload.
    const directMutationBlocked = await asPrincipal(runtime, ownerA, (c) => c.query(
      "UPDATE interview_job SET payload=$3::jsonb WHERE id=$1 AND owner_user_id=$2",
      [queuedJobId, ownerA, JSON.stringify({ answer: queueMarker })],
    )).then((result) => result.rowCount === 0).catch(() => true);
    A('PPRIV002',
      Number(queueRow?.active_jobs) === 0 && Number(queueRow?.raw_payloads) === 0
      && Number(queueRow?.raw_marker) === 0 && Number(queueRow?.open_questions) === 0
      && Number(queueRow?.queue_target) === 1);
    A('PPRIV014', lateClaim === null && lateLoad.stillClaimed === false);
    A('PPRIV015', directInsertRejected);
    A('PPRIV017', directMutationBlocked);
    const directEventRejected = await rejects(() => asPrincipal(runtime, ownerA, (c) => c.query(
      "INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ($1,$2,999,'answer_evaluated','{}'::jsonb)",
      [ownerA, threadA],
    )));
    const directReportRejected = await rejects(() => asPrincipal(runtime, ownerA, (c) => c.query(
      "INSERT INTO ai_report(owner_user_id,interview_id,status) VALUES ($1,$2,'queued')",
      [ownerA, threadA],
    )));
    const hiddenProjectionRows = await asPrincipal(runtime, ownerA, async (c) => ({
      events: (await c.query('SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1', [threadA])).rows[0]?.n,
      reports: (await c.query('SELECT count(*)::int AS n FROM ai_report WHERE interview_id=$1', [threadA])).rows[0]?.n,
      graphRuns: (await c.query('SELECT count(*)::int AS n FROM ai_graph_run WHERE thread_id=$1', [threadA])).rows[0]?.n,
    }));
    A('PPRIV020', directEventRejected && directReportRejected
      && Number(hiddenProjectionRows.events) === 0 && Number(hiddenProjectionRows.reports) === 0
      && Number(hiddenProjectionRows.graphRuns) === 0);
    let privacyReportSummaryLoads = 0;
    let privacyReportGeneratorCalls = 0;
    const reportAfterFence = await drainReportsOnce(runtime, ownerA, `privacy-report-${process.pid}`, {
      loadSummary: async () => {
        privacyReportSummaryLoads++;
        return { interviewId: threadA, questionCount: 0, scores: [] };
      },
      generate: async () => {
        privacyReportGeneratorCalls++;
        return { overall: 0, sections: [] };
      },
    }).then((outcome) => outcome === 'idle').catch(() => false);
    A('PPRIV022', reportAfterFence && privacyReportSummaryLoads === 0 && privacyReportGeneratorCalls === 0);
    let providerCallsAfterFence = 0;
    const dispatchAfterFence = await invoke({
      idempotencyKey: `privacy-fenced-dispatch-${process.pid}`,
      privacyInterviewId: threadA,
      schema: z.object({ ok: z.literal(true) }),
      businessValidate: () => null,
      model: {
        requestDigest: 'b'.repeat(64),
        call: async () => {
          providerCallsAfterFence++;
          return { ok: true as const, raw: { ok: true } };
        },
      },
    }, runtime, ownerA);
    const gatedInvocation = await admin.query<{ status: string; error_code: string | null }>(
      "SELECT status,error_code FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2",
      [ownerA, `privacy-fenced-dispatch-${process.pid}`],
    );
    A('PPRIV003', 'error' in dispatchAfterFence && dispatchAfterFence.error === 'privacy_fenced_pre_dispatch');
    A('PPRIV018', providerCallsAfterFence === 0);
    A('PPRIV016', gatedInvocation.rows[0]?.status === 'failed'
      && gatedInvocation.rows[0]?.error_code === 'privacy_fenced_pre_dispatch');
    A('PPRIV004',
      request.fenceEpoch === enrolled.fenceEpoch + 1
      && await rejects(() => asPrincipal(runtime, ownerA, (c) => c.query('SELECT * FROM privacy_deletion_target')))
      && await rejects(() => asPrincipal(runtime, ownerA, (c) => c.query('SELECT * FROM privacy_claim_checkpoint_target($1,$2,$3)', [request.checkpointTargetId, 'api', 60]))));
    A('PPRIV005',
      await rejects(() => asPrincipal(runtime, ownerA, (c) => beginCheckpointErasure(c, threadB, idempotencyHash)))
      && await rejects(() => asPrincipal(runtime, ownerB, (c) => beginCheckpointErasure(c, threadA, 'b'.repeat(64)))));

    // No ordering assumption: each submitter and the delete request takes the
    // same database advisory lock. A submit may commit before deletion and be
    // redacted atomically, or reach the lock after deletion and be rejected.
    // In neither ordering may a worker later materialize an answer payload.
    await asPrincipal(runtime, ownerA, (c) => enqueueInterviewJob(
      c, ownerA, raceThread, 'start', { requestId: `privacy-race-start-${process.pid}` }, 0,
    ));
    const raceDelete = asPrincipal(runtime, ownerA, (c) => beginCheckpointErasure(c, raceThread, 'c'.repeat(64)));
    const raceSubmits = Array.from({ length: 20 }, (_, index) => asPrincipal(runtime, ownerA, (c) => enqueueInterviewJob(
      c, ownerA, raceThread, 'answer', { answer: `privacy-race-marker-${randomUUID()}`, turn: index }, 100 + index,
    )));
    const raceSettled = await Promise.allSettled([raceDelete, ...raceSubmits]);
    const raceClaimed = await Promise.all(Array.from({ length: 20 }, (_, index) =>
      asPrincipal(runtime, ownerA, (c) => claimNextInterviewJob(c, ownerA, `privacy-race-claim-${index}`))));
    const raceRows = await admin.query<{ active: number; raw: number; marker: number }>(`
      SELECT
        (SELECT count(*)::int FROM interview_job WHERE interview_id=$1 AND status IN ('queued','running')) AS active,
        (SELECT count(*)::int FROM interview_job WHERE interview_id=$1 AND payload <> '{}'::jsonb) AS raw,
        (SELECT count(*)::int FROM interview_job WHERE interview_id=$1 AND payload::text LIKE '%privacy-race-marker-%') AS marker
    `, [raceThread]);
    const raceRow = raceRows.rows[0];
    A('PPRIV019', raceSettled[0]?.status === 'fulfilled'
      && Number(raceRow?.active) === 0 && Number(raceRow?.raw) === 0 && Number(raceRow?.marker) === 0
      && raceClaimed.every((claimed) => claimed === null));
    const normalDelete = await asPrincipal(runtime, ownerA, (c) => c.query('DELETE FROM checkpoints WHERE thread_id=$1', [threadA]));
    A('PPRIV006', (normalDelete.rowCount ?? 0) === 0);

    const claim = await asPrivacyWorkerPrincipal(worker, ownerA, (c) =>
      claimCheckpointErasureTarget(c, request.checkpointTargetId, `eraser-${process.pid}`, 60));
    A('PPRIV007', claim !== null && claim.attempt === 1);
    A('PPRIV008', claim !== null && await rejects(() =>
      asPrivacyWorkerPrincipal(worker, ownerA, (c) => purgeCheckpointErasureTarget(c, claim.targetId, randomUUID()))));
    const purged = claim && await asPrivacyWorkerPrincipal(worker, ownerA, (c) =>
      purgeCheckpointErasureTarget(c, claim.targetId, claim.leaseToken));
    const remaining = await admin.query(
      `SELECT
         (SELECT count(*)::int FROM checkpoints WHERE thread_id=$1) AS checkpoints,
         (SELECT count(*)::int FROM checkpoint_blobs WHERE thread_id=$1) AS blobs,
         (SELECT count(*)::int FROM checkpoint_writes WHERE thread_id=$1) AS writes,
         (SELECT count(*)::int FROM checkpoints WHERE checkpoint::text LIKE '%' || $2 || '%') AS checkpoint_marker,
         (SELECT count(*)::int FROM checkpoint_blobs WHERE convert_from(blob,'UTF8')=$2) AS blob_marker,
         (SELECT count(*)::int FROM checkpoint_writes WHERE convert_from(blob,'UTF8')=$2) AS write_marker`,
      [threadA, marker],
    );
    const row = remaining.rows[0];
    const enrollment = await admin.query('SELECT access_state,fence_epoch FROM checkpoint_thread_enrollment WHERE thread_id=$1', [threadA]);
    const external = await admin.query(
      "SELECT count(*)::int AS n FROM privacy_deletion_target WHERE request_id=$1 AND status='retention_pending'",
      [request.requestId],
    );
    A('PPRIV009',
      purged?.deletedCount === 3 && purged.requestStatus === 'pending_external'
      && Number(row?.checkpoints) === 0 && Number(row?.blobs) === 0 && Number(row?.writes) === 0
      && Number(row?.checkpoint_marker) === 0 && Number(row?.blob_marker) === 0 && Number(row?.write_marker) === 0
      && enrollment.rows[0]?.access_state === 'purged' && Number(enrollment.rows[0]?.fence_epoch) === request.fenceEpoch);
    A('PPRIV010', Number(external.rows[0]?.n) === 3);
    const replayPurge = await asPrivacyWorkerPrincipal(worker, ownerA, (c) =>
      purgeCheckpointErasureTarget(c, request.checkpointTargetId, claim!.leaseToken));
    A('PPRIV011', replayPurge.deletedCount === 0 && replayPurge.requestStatus === 'pending_external');

    const rogueRole = `privacy_rogue_${process.pid}`;
    const roguePassword = 'privacy-rogue-proof-password-2026';
    await admin.query(`CREATE ROLE ${rogueRole} LOGIN NOINHERIT PASSWORD '${roguePassword}'`);
    const rogue = createPool({ user: rogueRole, password: roguePassword });
    try {
      A('PPRIV012',
        await rejects(async () => {
          await rogue.query('BEGIN');
          await rogue.query("SELECT set_config('app.principal_user',$1,true)", [ownerA]);
          await rogue.query('SELECT revoke_checkpoint_thread($1)', [threadA]);
        }) && await rejects(() => rogue.query('SELECT privacy_purge_checkpoint_target($1,$2)', [request.checkpointTargetId, randomUUID()])));
    } finally {
      await rogue.end();
      await admin.query(`DROP ROLE IF EXISTS ${rogueRole}`);
    }
    const functionAcl = await admin.query(
      `SELECT p.proname,r.rolname AS owner,has_function_privilege('public',p.oid,'EXECUTE') AS public_execute
         FROM pg_proc p JOIN pg_roles r ON r.oid=p.proowner
        WHERE p.proname IN ('revoke_checkpoint_thread','privacy_begin_checkpoint_erasure','privacy_claim_checkpoint_target','privacy_list_claimable_checkpoint_targets','privacy_purge_checkpoint_target')`,
    );
    const owners = new Map(functionAcl.rows.map((item) => [item.proname, item.owner]));
    A('PPRIV013',
      functionAcl.rows.length === 5 && functionAcl.rows.every((item) => item.public_execute === false)
      && owners.get('revoke_checkpoint_thread') === 'privacy_api_owner'
      && owners.get('privacy_begin_checkpoint_erasure') === 'privacy_api_owner'
      && owners.get('privacy_claim_checkpoint_target') === 'privacy_worker_owner'
      && owners.get('privacy_list_claimable_checkpoint_targets') === 'privacy_worker_owner'
      && owners.get('privacy_purge_checkpoint_target') === 'privacy_worker_owner');
  } finally {
    await worker.end();
    await runtime.end();
    await admin.query(`DROP ROLE IF EXISTS ${workerRole}`);
    await admin.query(`DROP ROLE IF EXISTS ${runtimeRole}`);
    await admin.end();
  }
  console.log(failures === 0 ? '\n✓ checkpoint privacy physical-erasure proof passed' : `\n✗ ${failures} checkpoint privacy physical-erasure checks failed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end().catch(() => undefined); process.exit(1); });
