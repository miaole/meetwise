export type QdrantDistance = 'Cosine';
export type QdrantVectorSize = 512;

export interface QdrantStoreConfig {
  /** Qdrant HTTP base URL. Default http://127.0.0.1:6333 (compose.mysql-local). */
  url?: string;
  /** Collection name. Default meetwise_m4_proto_v512. */
  collection?: string;
}

export interface UpsertPoint {
  /** Point id (UUID string preferred). */
  id: string;
  /** Dense embedding; length must equal QDRANT_VECTOR_SIZE (512). */
  vector: number[];
  payload?: Record<string, unknown>;
}

export interface SearchHit {
  id: string | number;
  score: number;
  payload?: Record<string, unknown> | null;
}

/**
 * Erasure sink receipt contract (prototype).
 * Core shape (kept): { id, collection, deleted_count, at }.
 * Batch (additive): when erasing multiple ids, `batch_digest` is required —
 * sha256 hex of sorted unique target ids (UTF-8, joined by "\n").
 * `deleted_count` MUST reflect verified removals (pre/post retrieve), NOT ids.length.
 * Align with relational privacy ledger (0091) before any vector-truth cutover —
 * this shape alone ≠ 0091 ledger aligned.
 */
export interface QdrantErasureReceipt {
  /** Erasure target id (single) or batch key `batch:<digest16>` when multi. */
  id: string;
  collection: string;
  /** Verified removals from Qdrant pre/post retrieve — not blind ids.length. */
  deleted_count: number;
  /** ISO-8601 timestamp when the sink reported delete. */
  at: string;
  /**
   * Present when request covered >1 distinct id.
   * sha256(sortedUniqueIds.join("\n")) hex — verifiable set of all targets (勿丢其余).
   */
  batch_digest?: string;
  /**
   * Additive subject key (owner_user_id) when erase was subject-scoped.
   * Prototype only — ≠ 0091 privacy_deletion_receipt (request_id/target_id/receipt_kind/…).
   */
  subject_id?: string;
}

/** Kind aligned with packages/db retrieval-store vector_chunk.kind. */
export type VectorChunkKind = 'qbank' | 'memory';

/** Thin adapter upsert shape (mirrors retrieval-store upsertVectorChunk fields; no pg Client). */
export interface VectorChunkInput {
  id: string;
  kind: VectorChunkKind;
  refId: string;
  contentHash: string;
  embedding: number[];
}

/** Thin adapter search hit (mirrors annSearch return; distance = 1 - cosine_score). */
export interface VectorSearchHit {
  refId: string;
  distance: number;
}

/** Optional Qdrant payload filter passed through to /points/search. */
export type QdrantSearchFilter = Record<string, unknown>;
