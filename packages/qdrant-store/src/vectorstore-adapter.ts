/**
 * Thin Qdrant-backed vectorstore adapter (G2 sub-slice · real path).
 *
 * Mirrors packages/db retrieval-store shapes (upsertVectorChunk / annSearch)
 * onto live Qdrant — additive only. Does NOT replace retrieval-store.ts,
 * does NOT flip E2E_ISOLATION_STACK default, does NOT claim RAG/memory covered.
 *
 * Tenant model (adapter-level payload filter, not Postgres RLS):
 *   - kind='qbank'  → shared read (filter kind only)
 *   - kind='memory' → owner-only (filter owner_user_id + kind)
 *
 * Idempotent upsert key = owner + kind + contentHash → deterministic point UUID.
 * Distance = 1 - cosine_score (align with pgvector <=> style; lower = nearer).
 *
 * Fail-closed: requireReadyz() / ensureReady() throw when /readyz is not OK.
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ 已迁 · ≠ fixtures retired
 */
import { createHash } from 'node:crypto';
import { QDRANT_VECTOR_SIZE } from './constants.ts';
import { QdrantStore, createQdrantStore } from './store.ts';
import type {
  QdrantErasureReceipt,
  QdrantSearchFilter,
  QdrantStoreConfig,
  VectorChunkInput,
  VectorChunkKind,
  VectorSearchHit,
} from './types.ts';

const PAYLOAD_OWNER = 'owner_user_id';
const PAYLOAD_KIND = 'kind';
const PAYLOAD_REF = 'ref_id';
const PAYLOAD_HASH = 'content_hash';
const PAYLOAD_LOGICAL_ID = 'logical_id';

/** Deterministic UUID (version-5-ish) so ON CONFLICT semantics overwrite same point. */
export function pointIdForChunk(owner: string, kind: VectorChunkKind, contentHash: string): string {
  const h = createHash('sha1').update(`${owner}\0${kind}\0${contentHash}`, 'utf8').digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0')}${h.slice(18, 20)}-${h.slice(20, 32)}`;
}

function buildKindFilter(kind: VectorChunkKind, owner: string): QdrantSearchFilter {
  const must: Array<Record<string, unknown>> = [{ key: PAYLOAD_KIND, match: { value: kind } }];
  if (kind === 'memory') {
    must.push({ key: PAYLOAD_OWNER, match: { value: owner } });
  }
  return { must };
}

export class QdrantVectorStoreAdapter {
  readonly store: QdrantStore;

  constructor(config: QdrantStoreConfig = {}) {
    this.store = createQdrantStore(config);
  }

  get collection(): string {
    return this.store.collection;
  }

  get url(): string {
    return this.store.url;
  }

  /** Fail-closed readiness probe. */
  async requireReadyz(): Promise<void> {
    let ok = false;
    try {
      ok = await this.store.readyz();
    } catch (e) {
      throw new Error(`qdrant_vectorstore_adapter_readyz_error: ${(e as Error).message}`);
    }
    if (!ok) {
      throw new Error(`qdrant_vectorstore_adapter_readyz_failed: ${this.url}/readyz`);
    }
  }

  async ensureCollection(): Promise<{ created: boolean; collection: string }> {
    await this.requireReadyz();
    return this.store.ensureCollection();
  }

  /**
   * Upsert one vector chunk. Point id is deterministic from owner+kind+contentHash
   * (idempotent overwrite). Payload keeps logical id / ref / hash / owner / kind.
   */
  async upsertVectorChunk(owner: string, chunk: VectorChunkInput): Promise<{ pointId: string }> {
    if (typeof owner !== 'string' || owner.trim().length === 0) {
      throw new Error('qdrant_vectorstore_adapter_owner_required');
    }
    if (!chunk || typeof chunk !== 'object') throw new Error('qdrant_vectorstore_adapter_chunk_required');
    if (chunk.kind !== 'qbank' && chunk.kind !== 'memory') {
      throw new Error(`qdrant_vectorstore_adapter_kind_invalid: ${String(chunk.kind)}`);
    }
    if (typeof chunk.refId !== 'string' || chunk.refId.trim().length === 0) {
      throw new Error('qdrant_vectorstore_adapter_ref_id_required');
    }
    if (typeof chunk.contentHash !== 'string' || chunk.contentHash.trim().length === 0) {
      throw new Error('qdrant_vectorstore_adapter_content_hash_required');
    }
    if (!Array.isArray(chunk.embedding) || chunk.embedding.length !== QDRANT_VECTOR_SIZE) {
      throw new Error(`qdrant_vectorstore_adapter_embedding_size_invalid: expected ${QDRANT_VECTOR_SIZE}`);
    }
    if (!chunk.embedding.every(Number.isFinite)) {
      throw new Error('qdrant_vectorstore_adapter_embedding_non_finite');
    }

    const pointId = pointIdForChunk(owner.trim(), chunk.kind, chunk.contentHash.trim());
    await this.store.upsert([
      {
        id: pointId,
        vector: chunk.embedding,
        payload: {
          [PAYLOAD_OWNER]: owner.trim(),
          [PAYLOAD_KIND]: chunk.kind,
          [PAYLOAD_REF]: chunk.refId.trim(),
          [PAYLOAD_HASH]: chunk.contentHash.trim(),
          [PAYLOAD_LOGICAL_ID]: typeof chunk.id === 'string' ? chunk.id : String(chunk.id ?? ''),
        },
      },
    ]);
    return { pointId };
  }

  /**
   * ANN search over Qdrant. Returns refId + distance (1 - score).
   * memory → owner-scoped; qbank → shared by kind.
   */
  async annSearch(
    owner: string,
    kind: VectorChunkKind,
    queryEmbedding: number[],
    k: number,
  ): Promise<VectorSearchHit[]> {
    if (typeof owner !== 'string' || owner.trim().length === 0) {
      throw new Error('qdrant_vectorstore_adapter_owner_required');
    }
    if (kind !== 'qbank' && kind !== 'memory') {
      throw new Error(`qdrant_vectorstore_adapter_kind_invalid: ${String(kind)}`);
    }
    if (!Number.isSafeInteger(k) || k <= 0) {
      throw new Error('qdrant_vectorstore_adapter_k_invalid');
    }
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== QDRANT_VECTOR_SIZE) {
      throw new Error(`qdrant_vectorstore_adapter_query_size_invalid: expected ${QDRANT_VECTOR_SIZE}`);
    }

    const filter = buildKindFilter(kind, owner.trim());
    const hits = await this.store.search(queryEmbedding, k, filter);
    const out: VectorSearchHit[] = [];
    for (const h of hits) {
      const ref = h.payload?.[PAYLOAD_REF];
      if (typeof ref !== 'string' || ref.length === 0) continue;
      const score = typeof h.score === 'number' && Number.isFinite(h.score) ? h.score : 0;
      // Cosine metric: Qdrant score ≈ similarity; distance ≈ 1 - score (pgvector-style).
      out.push({ refId: ref, distance: 1 - score });
    }
    return out;
  }

  /**
   * Subject-scoped memory vector erase (G5 sub-slice).
   * Deletes points with owner_user_id=owner AND kind=memory; returns countable receipt.
   * Caller must prove post-erase annSearch recall=0 for that owner.
   * ≠ 0091 ledger / ≠ public DELETE 200/202.
   */
  async eraseSubjectMemoryVectors(owner: string): Promise<QdrantErasureReceipt> {
    if (typeof owner !== 'string' || owner.trim().length === 0) {
      throw new Error('qdrant_vectorstore_adapter_owner_required');
    }
    return this.store.eraseSubjectPoints(owner.trim(), { kind: 'memory' });
  }
}

export function createQdrantVectorStoreAdapter(config?: QdrantStoreConfig): QdrantVectorStoreAdapter {
  return new QdrantVectorStoreAdapter(config);
}
