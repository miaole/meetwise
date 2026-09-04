/**
 * @meetwise/db · 记忆向量块删除 sink（0125）存储侧。
 *
 * 为 `vector_chunk.kind='memory'` 补账户删除等价 sweep（begin → 受约束 claim →
 * 物理 purge → 删后 kind=memory 残留=0）。**不**删除 qbank，**不**重实现删除根。
 */
import type { Client } from './principal.ts';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

export interface MemoryVectorChunkErasureTarget { sink: string; resourceHmac: string }
export interface BegunMemoryVectorChunkErasure {
  requestId: string;
  requestStatus: string;
  privacyEpoch: number;
  targetSetDigest: string;
  targets: MemoryVectorChunkErasureTarget[];
  replayed: boolean;
}

export async function beginMemoryVectorChunkErasure(
  c: Client, idempotencyKeyHash: string,
): Promise<BegunMemoryVectorChunkErasure> {
  const r = await c.query<{
    request_id: string; request_status: string; privacy_epoch: string | number;
    target_set_digest: string; sink: string; resource_hmac: string; replayed: boolean;
  }>('SELECT * FROM memory_vector_chunk_begin_erasure($1)', [idempotencyKeyHash]);
  if (r.rowCount === 0) fail('memory_vector_chunk_begin_erasure_failed');
  const first = r.rows[0]!;
  const privacyEpoch = Number(first.privacy_epoch);
  if (!Number.isSafeInteger(privacyEpoch) || privacyEpoch < 1) fail('memory_vector_chunk_begin_erasure_failed');
  return {
    requestId: first.request_id,
    requestStatus: first.request_status,
    privacyEpoch,
    targetSetDigest: first.target_set_digest,
    targets: r.rows.map((row) => ({ sink: row.sink, resourceHmac: row.resource_hmac })),
    replayed: first.replayed === true,
  };
}

export interface ClaimedMemoryVectorChunkTarget { targetId: string; leaseToken: string; attempt: number }

export async function claimMemoryVectorChunkTarget(
  c: Client, jti: string, targetId: string, worker: string, leaseSeconds = 60,
): Promise<ClaimedMemoryVectorChunkTarget | null> {
  const r = await c.query<{ target_id: string; lease_token: string | null; status: string; attempt: number }>(
    'SELECT * FROM privacy_authorization_claim_memory_vector_chunk_target($1,$2,$3,$4)',
    [jti, targetId, worker, leaseSeconds],
  );
  const row = r.rows[0];
  if (!row || row.status === 'erased') return null;
  if (!row.lease_token || !Number.isSafeInteger(Number(row.attempt)))
    fail('memory_vector_chunk_target_claim_invalid');
  return { targetId: row.target_id, leaseToken: row.lease_token, attempt: Number(row.attempt) };
}

export interface PurgedMemoryVectorChunkTarget {
  targetId: string; status: string; deletedCount: number; requestStatus: string;
}

export async function purgeMemoryVectorChunkTarget(
  c: Client, targetId: string, token: string,
): Promise<PurgedMemoryVectorChunkTarget> {
  const r = await c.query<{
    target_id: string; status: string; deleted_count: string | number; request_status: string;
  }>('SELECT * FROM privacy_purge_memory_vector_chunk_target($1,$2)', [targetId, token]);
  const row = r.rows[0];
  if (!row?.target_id) fail('memory_vector_chunk_target_purge_failed');
  return {
    targetId: row.target_id,
    status: row.status,
    deletedCount: Number(row.deleted_count),
    requestStatus: row.request_status,
  };
}

export async function isMemoryVectorChunkErasureActive(c: Client, owner: string): Promise<boolean> {
  const r = await c.query<{ active: boolean }>('SELECT memory_vector_chunk_erasure_active($1) AS active', [owner]);
  return r.rows[0]?.active === true;
}
