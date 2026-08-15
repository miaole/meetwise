import type { Client } from './principal.ts';

/**
 * Creates the immutable thread → owner enrollment before the first LangGraph
 * checkpoint operation. The INSERT is executed in the same RLS principal
 * boundary as the interview, so an arbitrary worker cannot claim another
 * user's thread by merely knowing its identifier.
 */
export interface CheckpointThreadEnrollment { threadId: string; fenceEpoch: number }

export async function enrollCheckpointThread(c: Client, owner: string, threadId: string): Promise<CheckpointThreadEnrollment> {
  const result = await c.query(
    `INSERT INTO checkpoint_thread_enrollment(thread_id, owner_user_id)
       SELECT id, owner_user_id FROM interview WHERE id=$1 AND owner_user_id=$2
       ON CONFLICT (thread_id) DO NOTHING
       RETURNING thread_id, fence_epoch`,
    [threadId, owner],
  );
  if (result.rowCount === 1) return { threadId, fenceEpoch: Number(result.rows[0].fence_epoch) };
  const existing = await c.query<{ thread_id: string; access_state: string; fence_epoch: number }>(
    'SELECT thread_id,access_state,fence_epoch FROM checkpoint_thread_enrollment WHERE thread_id=$1', [threadId],
  );
  // Existing own enrollment is idempotent. RLS hides another owner's mapping,
  // so both a cross-owner collision and a nonexistent/foreign interview fail
  // with the same non-enumerating code.
  if (existing.rowCount !== 1)
    throw Object.assign(new Error('checkpoint_thread_owner_conflict'), { code: 'checkpoint_thread_owner_conflict' });
  const enrollment = existing.rows[0];
  if (!enrollment)
    throw Object.assign(new Error('checkpoint_thread_owner_conflict'), { code: 'checkpoint_thread_owner_conflict' });
  if (enrollment.access_state !== 'active')
    throw Object.assign(new Error('checkpoint_privacy_fenced'), { code: 'checkpoint_privacy_fenced' });
  return { threadId, fenceEpoch: Number(enrollment.fence_epoch) };
}
