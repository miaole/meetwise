import type { Client } from './principal.ts';

/**
 * The synchronous first phase of a privacy erasure: stop future checkpoint
 * writes immediately and return the new epoch.  Physical deletion remains an
 * asynchronous, receipt-backed workflow and must not be reported as complete
 * by this function.
 */
export async function revokeCheckpointThread(c: Client, threadId: string): Promise<number> {
  const result = await c.query<{ revoke_checkpoint_thread: number }>(
    'SELECT revoke_checkpoint_thread($1) AS revoke_checkpoint_thread', [threadId],
  );
  const epoch = Number(result.rows[0]?.revoke_checkpoint_thread);
  if (!Number.isSafeInteger(epoch) || epoch < 2)
    throw Object.assign(new Error('checkpoint_privacy_fenced'), { code: 'checkpoint_privacy_fenced' });
  return epoch;
}

/**
 * Queue admission and payload reads share this database fence with the delete
 * transaction.  Missing, cross-owner, and deleted interviews intentionally
 * collapse to one opaque error so callers cannot turn it into an oracle.
 */
export async function assertInterviewPrivacyActive(c: Client, interviewId: string): Promise<void> {
  await c.query('SELECT assert_interview_privacy_active($1)', [interviewId]);
}

/**
 * Transaction-safe variant for callers that must record a known-not-sent
 * terminal result after rejection. PostgreSQL exceptions abort their current
 * transaction, so a model dispatcher cannot throw first and then persist its
 * failed claim in the same transaction.
 */
export async function isInterviewPrivacyActive(c: Client, interviewId: string): Promise<boolean> {
  const result = await c.query<{ interview_privacy_active: boolean }>(
    'SELECT interview_privacy_active($1) AS interview_privacy_active', [interviewId],
  );
  return result.rows[0]?.interview_privacy_active === true;
}

export interface CheckpointErasureRequest {
  requestId: string;
  status: 'fenced' | 'purging' | 'pending_external' | 'completed' | 'partial_failed' | 'authorization_paused';
  checkpointTargetId: string;
  fenceEpoch: number | null;
  replayed: boolean;
}

export interface ClaimedCheckpointErasureTarget {
  targetId: string;
  leaseToken: string;
  attempt: number;
}

/** Minimal dispatch feed for the dedicated erasure worker. */
export async function listClaimableCheckpointErasureTargets(
  c: Client, maxItems = 32,
): Promise<Array<{ targetId: string; ownerUserId: string }>> {
  const result = await c.query<{ target_id: string; owner_user_id: string }>(
    'SELECT * FROM privacy_list_claimable_checkpoint_targets($1)', [maxItems],
  );
  return result.rows
    .filter((row) => typeof row.target_id === 'string' && typeof row.owner_user_id === 'string')
    .map((row) => ({ targetId: row.target_id, ownerUserId: row.owner_user_id }));
}

/**
 * Starts the strictly non-destructive API phase.  `idempotencyKeyHash` is an
 * HMAC produced at the HTTP boundary; raw Idempotency-Key values never enter
 * the deletion ledger.  The returned `fenced` state is not a deletion claim.
 */
export async function beginCheckpointErasure(
  c: Client, threadId: string, idempotencyKeyHash: string,
): Promise<CheckpointErasureRequest> {
  const result = await c.query<{
    request_id: string; request_status: CheckpointErasureRequest['status']; checkpoint_target_id: string;
    fence_epoch: string | number | null; replayed: boolean;
  }>('SELECT * FROM privacy_begin_checkpoint_erasure($1,$2)', [threadId, idempotencyKeyHash]);
  const row = result.rows[0];
  if (!row?.request_id || !row.checkpoint_target_id)
    throw Object.assign(new Error('privacy_erasure_request_unavailable'), { code: 'privacy_erasure_request_unavailable' });
  const epoch = row.fence_epoch === null ? null : Number(row.fence_epoch);
  if (epoch !== null && (!Number.isSafeInteger(epoch) || epoch < 2))
    throw Object.assign(new Error('privacy_erasure_epoch_invalid'), { code: 'privacy_erasure_epoch_invalid' });
  return {
    requestId: row.request_id,
    status: row.request_status,
    checkpointTargetId: row.checkpoint_target_id,
    fenceEpoch: epoch,
    replayed: row.replayed === true,
  };
}

/** Background-only CAS claim; API app_role has no EXECUTE privilege. */
export async function claimCheckpointErasureTarget(
  c: Client, targetId: string, worker: string, leaseSeconds = 60,
): Promise<ClaimedCheckpointErasureTarget | null> {
  const result = await c.query<{ target_id: string; lease_token: string | null; status: string; attempt: number }>(
    'SELECT * FROM privacy_claim_checkpoint_target($1,$2,$3)', [targetId, worker, leaseSeconds],
  );
  const row = result.rows[0];
  if (!row || row.status === 'erased') return null;
  if (!row.lease_token || !Number.isSafeInteger(Number(row.attempt)))
    throw Object.assign(new Error('privacy_target_claim_invalid'), { code: 'privacy_target_claim_invalid' });
  return { targetId: row.target_id, leaseToken: row.lease_token, attempt: Number(row.attempt) };
}

/**
 * Background-only physical PostgreSQL cleanup.  It returns pending_external
 * while OSS/Redis/Langfuse targets lack independently verifiable receipts.
 */
export async function purgeCheckpointErasureTarget(
  c: Client, targetId: string, leaseToken: string,
): Promise<{ targetId: string; deletedCount: number; requestStatus: CheckpointErasureRequest['status'] }> {
  const result = await c.query<{
    target_id: string; status: string; deleted_count: string | number; request_status: CheckpointErasureRequest['status'];
  }>('SELECT * FROM privacy_purge_checkpoint_target($1,$2)', [targetId, leaseToken]);
  const row = result.rows[0];
  const deletedCount = Number(row?.deleted_count);
  if (!row?.target_id || row.status !== 'erased' || !Number.isSafeInteger(deletedCount) || deletedCount < 0)
    throw Object.assign(new Error('privacy_target_purge_invalid'), { code: 'privacy_target_purge_invalid' });
  return { targetId: row.target_id, deletedCount, requestStatus: row.request_status };
}
