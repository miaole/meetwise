/**
 * Minimal opt-in bridge — product-facing vectorstore API shape → QdrantVectorStoreAdapter.
 *
 * ## Product selector (P14)
 * Thin factory: `packages/db/src/retrieval-backend.ts` · `RETRIEVAL_VECTOR_BACKEND=qdrant`
 * (default remains pgvector). Closes the **selector** PREREQ; does NOT flip defaults.
 *
 * ## PREREQ (honest · no fake-green)
 * `packages/db/src/retrieval-store.ts` remains the pgvector SQL path and cannot absorb
 * full Qdrant feature parity without a large rewrite:
 *   - pg `PoolClient` + SQL `vector_chunk` / HNSW
 *   - qbank generation pointer + `qbank_generation_ann_search`
 *   - Postgres RLS / principal session
 * This module is the **prove-path bridge only**. It is NOT wired into retrieval-store.ts,
 * apps/*, or default `vectorstore:prove` / `rag*` / `memory*`.
 *
 * ## Opt-in
 * CMDs (fail-closed EXIT=3 without live Qdrant):
 *   - `pnpm vectorstore:qdrant:prove` (P12)
 *   - `pnpm rag:qdrant:prove` / `pnpm memory:qdrant:prove` (P13 minimal slices)
 *   - `pnpm retrieval-store:qdrant:prove` (P14 selector)
 * Defaults `vectorstore:prove` / `rag*` / `memory*` remain `run-e2e-isolated` → pgvector (G2 still open).
 *
 * releaseEvidence=false · Not HA · ≠ G2 closed · ≠ RAG/memory covered · ≠ fixtures retired
 *
 * @see ai-docs/delivery/harness/qdrant-vectorstore-prove.md
 * @see ai-docs/delivery/harness/qdrant-rag-prove.md
 * @see ai-docs/delivery/harness/qdrant-memory-prove.md
 * @see ai-docs/delivery/harness/retrieval-backend-qdrant.md
 */
import {
  QdrantVectorStoreAdapter,
  createQdrantVectorStoreAdapter,
} from './vectorstore-adapter.ts';
import type { QdrantStoreConfig, VectorChunkInput, VectorChunkKind, VectorSearchHit } from './types.ts';

/**
 * Product-shaped facade over the thin adapter.
 * Method names align with retrieval-store field contracts (owner + chunk / annSearch hits),
 * minus the pg Client — product env selector is P14 `retrieval-backend.ts` (default still pgvector).
 */
export class ProductVectorStoreQdrantBridge {
  readonly adapter: QdrantVectorStoreAdapter;

  constructor(config: QdrantStoreConfig = {}) {
    this.adapter = createQdrantVectorStoreAdapter(config);
  }

  get url(): string {
    return this.adapter.url;
  }

  get collection(): string {
    return this.adapter.collection;
  }

  /** Fail-closed readiness — prove entry must call before live ops. */
  async requireReadyz(): Promise<void> {
    await this.adapter.requireReadyz();
  }

  async ensureCollection(): Promise<{ created: boolean; collection: string }> {
    return this.adapter.ensureCollection();
  }

  /** Mirrors retrieval-store `upsertVectorChunk(owner, chunk)` field shape (no pg Client). */
  async upsertVectorChunk(owner: string, chunk: VectorChunkInput): Promise<{ pointId: string }> {
    return this.adapter.upsertVectorChunk(owner, chunk);
  }

  /** Mirrors retrieval-store / annSearchLegacy hit shape: `{ refId, distance }`. */
  async annSearch(
    owner: string,
    kind: VectorChunkKind,
    queryEmbedding: number[],
    k: number,
  ): Promise<VectorSearchHit[]> {
    return this.adapter.annSearch(owner, kind, queryEmbedding, k);
  }
}

export function createProductVectorStoreQdrantBridge(
  config?: QdrantStoreConfig,
): ProductVectorStoreQdrantBridge {
  return new ProductVectorStoreQdrantBridge(config);
}
