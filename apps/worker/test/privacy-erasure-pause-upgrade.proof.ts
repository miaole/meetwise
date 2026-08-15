/**
 * Prefix-upgrade proof for the 0075/0076 emergency privacy pause.
 *
 * It first creates a 0075-era request/target ledger through the historical
 * privileged fixture path.  A production upgrade must not let the separate
 * physical-erasure worker continue that work merely because it was queued
 * before the public admission API was disabled.
 */
import { fileURLToPath } from 'node:url';
import {
  asPrincipal, asPrivacyWorkerExecutor, asPrivacyWorkerPrincipal, assertPrivacyWorkerExecutorIdentity,
  enrollCheckpointThread, isInterviewPrivacyActive, createPool, loadMigrations,
  provisionPrivacyWorkerLogin, provisionRuntimeLogin, runMigrations,
} from '@meetwise/db';
import { initializePrivacyWorkerStartup } from '../src/privacy-worker-runtime.ts';

const admin = createPool();
const runtimeRole = `privacy_pause_runtime_${process.pid}`;
const workerRole = `privacy_pause_worker_${process.pid}`;
const miswiredWorkerRole = `privacy_pause_miswired_${process.pid}`;
const runtimePassword = 'privacy-pause-runtime-proof-password-2026';
const workerPassword = 'privacy-pause-worker-proof-password-2026';
const miswiredWorkerPassword = 'privacy-pause-miswired-proof-password-2026';
const owner = `privacy-pause-owner-${process.pid}`;
const thread = `privacy-pause-thread-${process.pid}`;
const dispatchThread = `privacy-pause-dispatch-thread-${process.pid}`;
const requestId = '00000000-0000-4000-8000-000000000076';
const checkpointTargetId = '00000000-0000-4000-8000-000000000077';
const leasedTargetId = '00000000-0000-4000-8000-000000000078';
const retentionTargetId = '00000000-0000-4000-8000-000000000079';
const failedTargetId = '00000000-0000-4000-8000-000000000080';
const orphanRequestId = '00000000-0000-4000-8000-000000000081';
const dispatchRequestId = '00000000-0000-4000-8000-000000000082';
const dispatchTargetId = '00000000-0000-4000-8000-000000000083';
const purgingRequestId = '00000000-0000-4000-8000-000000000084';
const pendingExternalRequestId = '00000000-0000-4000-8000-000000000085';
const partialFailedRequestId = '00000000-0000-4000-8000-000000000086';
const completedRequestId = '00000000-0000-4000-8000-000000000087';
const purgingTargetId = '00000000-0000-4000-8000-000000000088';
const pendingExternalTargetId = '00000000-0000-4000-8000-000000000089';
const partialFailedTargetId = '00000000-0000-4000-8000-000000000090';
const completedTargetId = '00000000-0000-4000-8000-000000000091';
const pausedParentRequestId = '00000000-0000-4000-8000-000000000092';
const pausedParentTargetId = '00000000-0000-4000-8000-000000000093';
const partialFailedParentRequestId = '00000000-0000-4000-8000-000000000095';
const partialFailedParentTargetId = '00000000-0000-4000-8000-000000000096';
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

async function main() {
  const migrations = loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url)));
  const legacy = migrations.filter((migration) => migration.version <= '0075_privacy_erasure_authorization_pause');
  A('fixture ends at the reviewed 0075 public-admission pause and has the 0076–0078 pause, worker-dispatch, and parent-guard suffixes',
    legacy.at(-1)?.version === '0075_privacy_erasure_authorization_pause'
    && migrations.some((migration) => migration.version === '0076_privacy_erasure_legacy_request_pause')
    && migrations.some((migration) => migration.version === '0077_privacy_worker_dispatch_rls')
    && migrations.some((migration) => migration.version === '0078_privacy_worker_parent_request_guard'));
  if (failures) throw new Error('privacy_pause_upgrade_manifest_invalid');

  await runMigrations(admin, legacy);
  await provisionRuntimeLogin(admin, { roleName: runtimeRole, password: runtimePassword });
  await provisionPrivacyWorkerLogin(admin, { roleName: workerRole, password: workerPassword });
  const runtime = createPool({ user: runtimeRole, password: runtimePassword });
  const worker = createPool({ user: workerRole, password: workerPassword });
  let miswiredWorker: ReturnType<typeof createPool> | undefined;
  try {
    const initializedWorker = await initializePrivacyWorkerStartup(
      { PRIVACY_WORKER_DATABASE_URL: 'postgresql://privacy-worker.test/meetwise' },
      { createPool: () => worker, assertIdentity: assertPrivacyWorkerExecutorIdentity },
    );
    A('a provisioned privacy worker login has exactly the reviewed executor capability', initializedWorker === worker);
    await admin.query(
      "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
      [thread, owner],
    );
    await admin.query(
      `INSERT INTO checkpoint_thread_enrollment(thread_id,owner_user_id,access_state,fence_epoch,revoked_at)
       VALUES ($1,$2,'revoked',2,now())`,
      [thread, owner],
    );
    await admin.query(
      `INSERT INTO privacy_erasure_request(id,owner_user_id,scope,subject_id,idempotency_key_hash,status)
       VALUES ($1,$2,'interview_data',$3,$4,'fenced')`,
      [requestId, owner, thread, 'a'.repeat(64)],
    );
    // A crash can leave a pre-0076 requested row before its children are
    // inserted.  It still represents an old authorization and must not be
    // replayable after the emergency pause.
    await admin.query(
      `INSERT INTO privacy_erasure_request(id,owner_user_id,scope,subject_id,idempotency_key_hash,status)
       VALUES ($1,$2,'interview_data',$3,$4,'requested')`,
      [orphanRequestId, owner, `${thread}-orphan`, '9'.repeat(64)],
    );
    await admin.query(
      `INSERT INTO privacy_deletion_target(id,request_id,sink,resource_hmac,status,lease_owner,lease_token,lease_expires_at)
       VALUES
         ($1,$5,'checkpoint_rows',$6,'pending',NULL,NULL,NULL),
         ($2,$5,'oss',$7,'leased','legacy-worker','00000000-0000-4000-8000-000000000081',now()+interval '5 minutes'),
         ($3,$5,'redis',$8,'retention_pending',NULL,NULL,NULL),
         ($4,$5,'langfuse',$9,'failed',NULL,NULL,NULL)`,
      [checkpointTargetId, leasedTargetId, retentionTargetId, failedTargetId, requestId,
        'b'.repeat(64), 'c'.repeat(64), 'd'.repeat(64), 'e'.repeat(64)],
    );
    await admin.query(
      `INSERT INTO privacy_erasure_request(id,owner_user_id,scope,subject_id,idempotency_key_hash,status)
       VALUES
         ($1,$5,'interview_data',$6,$7,'purging'),
         ($2,$5,'interview_data',$8,$9,'pending_external'),
         ($3,$5,'interview_data',$10,$11,'partial_failed'),
         ($4,$5,'interview_data',$12,$13,'completed')`,
      [purgingRequestId, pendingExternalRequestId, partialFailedRequestId, completedRequestId, owner,
        `${thread}-purging`, '2'.repeat(64), `${thread}-external`, '3'.repeat(64),
        `${thread}-partial`, '4'.repeat(64), `${thread}-completed`, '5'.repeat(64)],
    );
    await admin.query(
      `INSERT INTO privacy_deletion_target(id,request_id,sink,resource_hmac,status,last_error_code)
       VALUES
         ($1,$5,'oss',$6,'pending',NULL),
         ($2,$7,'redis',$8,'retention_pending',NULL),
         ($3,$9,'langfuse',$10,'failed','legacy_retry_exhausted'),
         ($4,$11,'checkpoint_rows',$12,'erased',NULL)`,
      [purgingTargetId, pendingExternalTargetId, partialFailedTargetId, completedTargetId,
        purgingRequestId, '6'.repeat(64), pendingExternalRequestId, '7'.repeat(64),
        partialFailedRequestId, '8'.repeat(64), completedRequestId, '9'.repeat(64)],
    );
    await admin.query(
      `INSERT INTO privacy_checkpoint_target(target_id,request_id,owner_user_id,thread_id,fence_epoch)
       VALUES ($1,$2,$3,$4,2)`,
      [checkpointTargetId, requestId, owner, thread],
    );

    // Simulate a worker that already has the target id from a prior dispatch
    // iteration.  It may claim under the old schema, so merely revoking the
    // public API in 0075 is insufficient for an upgrading database.
    const legacyClaim = await asPrivacyWorkerPrincipal(worker, owner, (c) => c.query(
      'SELECT * FROM privacy_claim_checkpoint_target($1,$2,$3)', [checkpointTargetId, 'legacy-worker', 60]));
    A('pre-upgrade fixture proves an already-dispatched legacy target remains claimable', legacyClaim.rowCount === 1);

    await runMigrations(admin, migrations);

    const paused = await admin.query<{
      request_status: string; status: string; lease_token: string | null; lease_owner: string | null; last_error_code: string | null;
    }>(
      `SELECT r.status AS request_status,t.status,t.lease_token::text,t.lease_owner,t.last_error_code
         FROM privacy_erasure_request r
         JOIN privacy_deletion_target t ON t.request_id=r.id
        WHERE r.id=$1
        ORDER BY t.id`,
      [requestId],
    );
    const pausedOrphan = await admin.query<{ status: string }>(
      'SELECT status FROM privacy_erasure_request WHERE id=$1', [orphanRequestId]);
    const pausedParentStates = await admin.query<{ request_id: string; request_status: string; target_status: string }>(
      `SELECT r.id::text AS request_id,r.status AS request_status,t.status AS target_status
         FROM privacy_erasure_request r
         JOIN privacy_deletion_target t ON t.request_id=r.id
        WHERE r.id = ANY($1::uuid[])
        ORDER BY r.id`,
      [[purgingRequestId, pendingExternalRequestId, partialFailedRequestId]],
    );
    const completedState = await admin.query<{ request_status: string; target_status: string }>(
      `SELECT r.status AS request_status,t.status AS target_status
         FROM privacy_erasure_request r JOIN privacy_deletion_target t ON t.request_id=r.id
        WHERE r.id=$1`, [completedRequestId]);
    const preservedFailure = await admin.query<{ last_error_code: string | null }>(
      'SELECT last_error_code FROM privacy_deletion_target WHERE id=$1', [partialFailedTargetId]);
    A('0076 pauses every unfinished parent state and target, clears leases, and leaves completed receipts unchanged',
      paused.rows.length === 4
      && paused.rows.every((row) => row.request_status === 'authorization_paused'
        && row.status === 'authorization_paused' && row.lease_token === null && row.lease_owner === null
        && row.last_error_code === 'privacy_erasure_authorization_paused')
      && pausedOrphan.rows[0]?.status === 'authorization_paused'
      && pausedParentStates.rows.length === 3
      && pausedParentStates.rows.every((row) => row.request_status === 'authorization_paused' && row.target_status === 'authorization_paused')
      && completedState.rows[0]?.request_status === 'completed' && completedState.rows[0]?.target_status === 'erased'
      && preservedFailure.rows[0]?.last_error_code === 'legacy_retry_exhausted');

    const staleClaim = await asPrivacyWorkerPrincipal(worker, owner, (c) => c.query(
      'SELECT * FROM privacy_claim_checkpoint_target($1,$2,$3)', [checkpointTargetId, 'post-upgrade-worker', 60]));
    A('a worker that claimed a target before upgrade cannot claim or resume it after the pause commits', staleClaim.rowCount === 0);

    const fenced = await asPrincipal(runtime, owner, (c) => isInterviewPrivacyActive(c, thread));
    await admin.query('DELETE FROM checkpoint_thread_enrollment WHERE thread_id=$1', [thread]);
    const reEnrollRejected = await rejects(() => asPrincipal(runtime, owner, (c) => enrollCheckpointThread(c, owner, thread)));
    A('authorization_paused preserves the existing interview fence and blocks re-enrollment', fenced === false && reEnrollRejected);

    // This fixture is inserted only by the privileged upgrade-test setup; the
    // public erasure endpoint remains 503.  It proves the dedicated worker's
    // intended future dispatch feed works under FORCE RLS while revealing no
    // checkpoint locators or payloads to the executor.
    await admin.query(
      "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
      [dispatchThread, owner],
    );
    await admin.query(
      `INSERT INTO privacy_erasure_request(id,owner_user_id,scope,subject_id,idempotency_key_hash,status)
       VALUES ($1,$2,'interview_data',$3,$4,'fenced')`,
      [dispatchRequestId, owner, dispatchThread, 'f'.repeat(64)],
    );
    await admin.query(
      `INSERT INTO privacy_deletion_target(id,request_id,sink,resource_hmac,status)
       VALUES ($1,$2,'checkpoint_rows',$3,'pending')`,
      [dispatchTargetId, dispatchRequestId, '1'.repeat(64)],
    );
    await admin.query(
      `INSERT INTO privacy_checkpoint_target(target_id,request_id,owner_user_id,thread_id,fence_epoch)
       VALUES ($1,$2,$3,$4,2)`,
      [dispatchTargetId, dispatchRequestId, owner, dispatchThread],
    );
    // A paused request must remain non-dispatchable even if an operator or a
    // future bug incorrectly creates a new pending child below it.  0078
    // joins the parent status in list, claim, and purge—not merely in 0076's
    // one-time migration update.
    await admin.query(
      `INSERT INTO privacy_erasure_request(id,owner_user_id,scope,subject_id,idempotency_key_hash,status)
       VALUES ($1,$2,'interview_data',$3,$4,'authorization_paused')`,
      [pausedParentRequestId, owner, `${thread}-paused-parent`, 'a'.repeat(63) + 'b'],
    );
    await admin.query(
      `INSERT INTO privacy_deletion_target(id,request_id,sink,resource_hmac,status,lease_owner,lease_token,lease_expires_at)
       VALUES ($1,$2,'checkpoint_rows',$3,'leased','bad-operator',$4,now()+interval '5 minutes')`,
      [pausedParentTargetId, pausedParentRequestId, 'f'.repeat(64), '00000000-0000-4000-8000-000000000094'],
    );
    await admin.query(
      `INSERT INTO privacy_checkpoint_target(target_id,request_id,owner_user_id,thread_id,fence_epoch)
       VALUES ($1,$2,$3,$4,2)`,
      [pausedParentTargetId, pausedParentRequestId, owner, `${thread}-paused-parent`],
    );
    await admin.query(
      `INSERT INTO privacy_erasure_request(id,owner_user_id,scope,subject_id,idempotency_key_hash,status)
       VALUES ($1,$2,'interview_data',$3,$4,'partial_failed')`,
      [partialFailedParentRequestId, owner, `${thread}-partial-failed-parent`, 'a'.repeat(63) + 'c'],
    );
    await admin.query(
      `INSERT INTO privacy_deletion_target(id,request_id,sink,resource_hmac,status,lease_owner,lease_token,lease_expires_at)
       VALUES ($1,$2,'checkpoint_rows',$3,'leased','bad-operator',$4,now()+interval '5 minutes')`,
      [partialFailedParentTargetId, partialFailedParentRequestId, '0'.repeat(64), '00000000-0000-4000-8000-000000000097'],
    );
    await admin.query(
      `INSERT INTO privacy_checkpoint_target(target_id,request_id,owner_user_id,thread_id,fence_epoch)
       VALUES ($1,$2,$3,$4,2)`,
      [partialFailedParentTargetId, partialFailedParentRequestId, owner, `${thread}-partial-failed-parent`],
    );
    const dispatchFeed = await asPrivacyWorkerExecutor(worker, (c) => c.query<{
      target_id: string; owner_user_id: string;
    }>('SELECT * FROM privacy_list_claimable_checkpoint_targets($1)', [32]));
    const pausedClaim = await asPrivacyWorkerPrincipal(worker, owner, (c) => c.query(
      'SELECT * FROM privacy_claim_checkpoint_target($1,$2,$3)', [pausedParentTargetId, 'bad-operator', 60]));
    const pausedPurgeRejected = await rejects(() => asPrivacyWorkerPrincipal(worker, owner, (c) => c.query(
      'SELECT * FROM privacy_purge_checkpoint_target($1,$2)', [pausedParentTargetId, '00000000-0000-4000-8000-000000000094'])));
    const partialFailedClaim = await asPrivacyWorkerPrincipal(worker, owner, (c) => c.query(
      'SELECT * FROM privacy_claim_checkpoint_target($1,$2,$3)', [partialFailedParentTargetId, 'bad-operator', 60]));
    const partialFailedPurgeRejected = await rejects(() => asPrivacyWorkerPrincipal(worker, owner, (c) => c.query(
      'SELECT * FROM privacy_purge_checkpoint_target($1,$2)', [partialFailedParentTargetId, '00000000-0000-4000-8000-000000000097'])));
    const workerRawReadRejected = await rejects(() => asPrivacyWorkerExecutor(worker, (c) =>
      c.query('SELECT * FROM privacy_checkpoint_target')));
    A('worker executor receives only an active-parent target feed',
      dispatchFeed.rows.length === 1 && dispatchFeed.rows[0]?.target_id === dispatchTargetId
      && dispatchFeed.rows[0]?.owner_user_id === owner);
    A('a paused-parent child cannot be claimed even when it is manually put into leased state', pausedClaim.rowCount === 0);
    A('a paused-parent child cannot be physically purged with a manually supplied lease token', pausedPurgeRejected);
    A('partial_failed is terminal: a manually leased child cannot claim or purge',
      partialFailedClaim.rowCount === 0 && partialFailedPurgeRejected);
    A('worker executor receives no raw target ledger read capability', workerRawReadRejected);

    // A credential accidentally granted the definer owner can SET ROLE and
    // read the dispatch ledger.  The startup catalog gate must reject that
    // exact mis-mount before this worker loop can start.
    await provisionPrivacyWorkerLogin(admin, { roleName: miswiredWorkerRole, password: miswiredWorkerPassword });
    const grantOwner = await admin.query<{ statement: string }>(
      "SELECT format('GRANT privacy_worker_owner TO %I', $1::text) AS statement", [miswiredWorkerRole]);
    await admin.query(String(grantOwner.rows[0]?.statement));
    miswiredWorker = createPool({ user: miswiredWorkerRole, password: miswiredWorkerPassword });
    const miswiredClient = await miswiredWorker.connect();
    let miswiredRawRead = false;
    try {
      await miswiredClient.query('BEGIN');
      await miswiredClient.query('SET LOCAL ROLE privacy_worker_owner');
      const result = await miswiredClient.query('SELECT target_id FROM privacy_checkpoint_target LIMIT 1');
      await miswiredClient.query('COMMIT');
      miswiredRawRead = result.rowCount === 1;
    } catch (error) {
      await miswiredClient.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally { miswiredClient.release(); }
    const miswiredPool = miswiredWorker;
    const miswiredIdentityRejected = await rejects(() => initializePrivacyWorkerStartup(
      { PRIVACY_WORKER_DATABASE_URL: 'postgresql://miswired-privacy-worker.test/meetwise' },
      { createPool: () => miswiredPool, assertIdentity: assertPrivacyWorkerExecutorIdentity },
    ));
    // The startup helper closes a rejected pool by contract.
    miswiredWorker = undefined;
    A('a privacy worker credential with definer-owner membership is rejected before it can expose raw target rows',
      miswiredIdentityRejected && miswiredRawRead);

    // Role attributes and function grants drift independently from table ACLs.
    // Each must reject a mounted URL before a drain loop can run.
    await admin.query(`ALTER ROLE ${workerRole} REPLICATION`);
    const replicationPool = createPool({ user: workerRole, password: workerPassword });
    const replicationRejected = await rejects(() => initializePrivacyWorkerStartup(
      { PRIVACY_WORKER_DATABASE_URL: 'postgresql://replication-privacy-worker.test/meetwise' },
      { createPool: () => replicationPool, assertIdentity: assertPrivacyWorkerExecutorIdentity },
    ));
    await admin.query(`ALTER ROLE ${workerRole} NOREPLICATION`);
    A('a privacy worker login with replication capability is rejected at startup', replicationRejected);

    await admin.query('GRANT EXECUTE ON FUNCTION privacy_begin_checkpoint_erasure(text,text) TO privacy_worker_executor, PUBLIC');
    const destructiveFunctionPool = createPool({ user: workerRole, password: workerPassword });
    const destructiveFunctionRejected = await rejects(() => initializePrivacyWorkerStartup(
      { PRIVACY_WORKER_DATABASE_URL: 'postgresql://destructive-function-privacy-worker.test/meetwise' },
      { createPool: () => destructiveFunctionPool, assertIdentity: assertPrivacyWorkerExecutorIdentity },
    ));
    await admin.query('REVOKE EXECUTE ON FUNCTION privacy_begin_checkpoint_erasure(text,text) FROM privacy_worker_executor, PUBLIC');
    A('a privacy worker URL is rejected when old GUC destructive admission is granted to executor or PUBLIC', destructiveFunctionRejected);
  } finally {
    if (miswiredWorker) await miswiredWorker.end();
    await runtime.end();
    await worker.end();
    await admin.query(`DROP ROLE IF EXISTS ${runtimeRole}`);
    await admin.query(`DROP ROLE IF EXISTS ${workerRole}`);
    await admin.query(`DROP ROLE IF EXISTS ${miswiredWorkerRole}`);
    await admin.end();
  }
  console.log(failures === 0
    ? '\n✓ privacy legacy request pause prefix-upgrade contract passed (local isolated evidence only)'
    : `\n✗ ${failures} privacy legacy request pause prefix-upgrade assertions failed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end().catch(() => undefined); process.exit(1); });
