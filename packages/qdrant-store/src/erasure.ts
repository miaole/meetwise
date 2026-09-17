/**
 * Qdrant erasure sink contract (prototype).
 *
 * Contract (document + prove):
 *   delete points → subsequent search recall=0 for those ids
 *   receipt core shape: { id, collection, deleted_count, at }
 *   deleted_count = verified removals (pre/post retrieve), NOT ids.length
 *   multi-id: batch_digest = sha256(sorted unique ids joined by "\n")
 *
 * Does NOT wire into production privacy ledger yet.
 * This prototype ≠ 0091 privacy_deletion_receipt / ledger aligned.
 * Subject-scoped erase (owner_user_id) is additive G5 sub-slice:
 *   recall=0 + countable receipt ≠ 0091 ledger / ≠ public DELETE open.
 * Does NOT cut pgvector / memory-vector-chunk-erasure paths.
 */
import { createHash } from 'node:crypto';
import type { QdrantClient } from './client.ts';
import type { QdrantErasureReceipt } from './types.ts';

export function batchDigestForIds(ids: string[]): string {
  const sorted = [...new Set(ids.map((id) => id.trim()).filter((id) => id.length > 0))].sort();
  return createHash('sha256').update(sorted.join('\n'), 'utf8').digest('hex');
}

export function buildErasureReceipt(input: {
  id: string;
  collection: string;
  deleted_count: number;
  at?: string;
  batch_digest?: string;
  subject_id?: string;
}): QdrantErasureReceipt {
  if (typeof input.id !== 'string' || input.id.trim().length === 0) {
    throw new Error('qdrant_erasure_receipt_id_required');
  }
  if (typeof input.collection !== 'string' || input.collection.trim().length === 0) {
    throw new Error('qdrant_erasure_receipt_collection_required');
  }
  if (!Number.isSafeInteger(input.deleted_count) || input.deleted_count < 0) {
    throw new Error('qdrant_erasure_receipt_deleted_count_invalid');
  }
  const receipt: QdrantErasureReceipt = {
    id: input.id.trim(),
    collection: input.collection.trim(),
    deleted_count: input.deleted_count,
    at: input.at ?? new Date().toISOString(),
  };
  if (input.batch_digest !== undefined) {
    if (typeof input.batch_digest !== 'string' || !/^[a-f0-9]{64}$/.test(input.batch_digest)) {
      throw new Error('qdrant_erasure_receipt_batch_digest_invalid');
    }
    receipt.batch_digest = input.batch_digest;
  }
  if (input.subject_id !== undefined) {
    if (typeof input.subject_id !== 'string' || input.subject_id.trim().length === 0) {
      throw new Error('qdrant_erasure_receipt_subject_id_invalid');
    }
    receipt.subject_id = input.subject_id.trim();
  }
  return receipt;
}

export function assertErasureReceiptShape(receipt: unknown): asserts receipt is QdrantErasureReceipt {
  if (!receipt || typeof receipt !== 'object') throw new Error('qdrant_erasure_receipt_not_object');
  const r = receipt as Record<string, unknown>;
  for (const key of ['id', 'collection', 'deleted_count', 'at'] as const) {
    if (!(key in r)) throw new Error(`qdrant_erasure_receipt_missing_${key}`);
  }
  if (typeof r.id !== 'string' || r.id.length === 0) throw new Error('qdrant_erasure_receipt_id_invalid');
  if (typeof r.collection !== 'string' || r.collection.length === 0) {
    throw new Error('qdrant_erasure_receipt_collection_invalid');
  }
  if (!Number.isSafeInteger(r.deleted_count) || (r.deleted_count as number) < 0) {
    throw new Error('qdrant_erasure_receipt_deleted_count_invalid');
  }
  if (typeof r.at !== 'string' || Number.isNaN(Date.parse(r.at))) {
    throw new Error('qdrant_erasure_receipt_at_invalid');
  }
  if ('batch_digest' in r && r.batch_digest !== undefined) {
    if (typeof r.batch_digest !== 'string' || !/^[a-f0-9]{64}$/.test(r.batch_digest)) {
      throw new Error('qdrant_erasure_receipt_batch_digest_invalid');
    }
  }
  if ('subject_id' in r && r.subject_id !== undefined) {
    if (typeof r.subject_id !== 'string' || r.subject_id.trim().length === 0) {
      throw new Error('qdrant_erasure_receipt_subject_id_invalid');
    }
  }
}

/**
 * Delete points and return a contract receipt with honest deleted_count.
 *
 * Honesty: count points present before delete vs after (retrieve), not ids.length.
 * Batch: when >1 distinct id, set batch_digest over all targets and id=`batch:<digest16>`
 * so ids beyond [0] are not dropped from the receipt surface.
 */
export async function erasePoints(
  client: QdrantClient,
  ids: string[],
): Promise<QdrantErasureReceipt> {
  if (!Array.isArray(ids) || ids.length === 0) throw new Error('qdrant_erase_ids_required');
  const unique = [...new Set(ids.map((id) => String(id).trim()).filter((id) => id.length > 0))];
  if (unique.length === 0) throw new Error('qdrant_erase_ids_required');

  const before = await client.retrieveIds(unique);
  const beforeSet = new Set(before);
  const presentBefore = unique.filter((id) => beforeSet.has(id)).length;

  await client.deletePoints(unique);

  const after = await client.retrieveIds(unique);
  const afterSet = new Set(after);
  const presentAfter = unique.filter((id) => afterSet.has(id)).length;
  const deleted_count = presentBefore - presentAfter;
  if (deleted_count < 0) throw new Error('qdrant_erase_deleted_count_negative');

  if (unique.length === 1) {
    return buildErasureReceipt({
      id: unique[0]!,
      collection: client.collection,
      deleted_count,
    });
  }

  const batch_digest = batchDigestForIds(unique);
  return buildErasureReceipt({
    id: `batch:${batch_digest.slice(0, 16)}`,
    collection: client.collection,
    deleted_count,
    batch_digest,
  });
}

/** Payload key aligned with vectorstore-adapter owner tenant model. */
export const ERASURE_SUBJECT_PAYLOAD_KEY = 'owner_user_id';

/**
 * Subject-scoped erase (G5 sub-slice): delete all points whose payload
 * owner_user_id matches subjectId; return countable receipt.
 *
 * Honesty: deleted_count via erasePoints pre/post retrieve (not ids.length).
 * Empty subject → deleted_count=0 receipt (idempotent).
 *
 * ≠ 0091 privacy_deletion_receipt / ledger aligned.
 * ≠ public DELETE /privacy/* open (still 503 fail-closed product path).
 */
export async function eraseSubjectPoints(
  client: QdrantClient,
  subjectId: string,
  opts?: { kind?: 'memory' | 'qbank' },
): Promise<QdrantErasureReceipt> {
  if (typeof subjectId !== 'string' || subjectId.trim().length === 0) {
    throw new Error('qdrant_erase_subject_id_required');
  }
  const subject = subjectId.trim();
  const must: Array<Record<string, unknown>> = [
    { key: ERASURE_SUBJECT_PAYLOAD_KEY, match: { value: subject } },
  ];
  if (opts?.kind !== undefined) {
    must.push({ key: 'kind', match: { value: opts.kind } });
  }
  const filter = { must };
  const ids = await client.scrollPointIds(filter);
  if (ids.length === 0) {
    return buildErasureReceipt({
      id: `subject:${subject}`,
      collection: client.collection,
      deleted_count: 0,
      subject_id: subject,
    });
  }
  const receipt = await erasePoints(client, ids);
  // Always attach verifiable digest of inventoried subject point ids (even if 1).
  const digest = receipt.batch_digest ?? batchDigestForIds(ids);
  return buildErasureReceipt({
    id: `subject:${subject}`,
    collection: receipt.collection,
    deleted_count: receipt.deleted_count,
    at: receipt.at,
    batch_digest: digest,
    subject_id: subject,
  });
}
