/**
 * Thin retrieval vector **backend selector** (G2 sub-slice · P14 · product-selector PREREQ).
 *
 * Env: `RETRIEVAL_VECTOR_BACKEND`
 *   - unset / empty / `pgvector` / `pg` → **pgvector** (DEFAULT · intact)
 *   - `qdrant` → Qdrant HTTP adapter path (explicit opt-in)
 *   - anything else → throw (fail-closed; no silent unknown)
 *
 * ## What this closes
 * Product-selector PREREQ called out by P12/P13: callers can **choose** Qdrant via
 * explicit env/flag without flipping the product/isolated default.
 *
 * ## What stays open (honesty · no fake-green)
 * - Default remains pgvector (`retrieval-store.ts` SQL/HNSW path intact).
 * - Qdrant path covers the thin adapter subset only: upsert + ANN for
 *   kind=`memory`|`qbank` (no generation pointer / no hybrid / no HNSW plan /
 *   no Postgres RLS / no serving_scope). Those still need larger rewrites.
 * - G2 remains OPEN until `vectorstore:prove` / `rag*` / `memory*` **defaults** migrate.
 * - releaseEvidence=false · Not HA · ≠ fixtures retired · ≠ cutover · 本绿 ≠ 已迁
 *
 * @see ai-docs/delivery/harness/retrieval-backend-qdrant.md
 * @see ./retrieval-store.ts (pgvector path — NOT replaced)
 */
import {
  createQdrantVectorStoreAdapter,
  type QdrantStoreConfig,
  type QdrantVectorStoreAdapter,
  type VectorChunkInput,
  type VectorChunkKind,
  type VectorSearchHit,
} from '@meetwise/qdrant-store';

export const RETRIEVAL_VECTOR_BACKEND_ENV = 'RETRIEVAL_VECTOR_BACKEND' as const;

export type RetrievalVectorBackendId = 'pgvector' | 'qdrant';

export type ResolveRetrievalVectorBackendOptions = {
  /** Defaults to `process.env`. */
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
};

/**
 * Resolve backend id from env. Default = pgvector.
 * Unknown values throw (fail-closed).
 */
export function resolveRetrievalVectorBackend(
  opts: ResolveRetrievalVectorBackendOptions = {},
): RetrievalVectorBackendId {
  const env = opts.env ?? process.env;
  const raw = String(env[RETRIEVAL_VECTOR_BACKEND_ENV] ?? '')
    .trim()
    .toLowerCase();
  if (raw === '' || raw === 'pgvector' || raw === 'pg') return 'pgvector';
  if (raw === 'qdrant') return 'qdrant';
  throw new Error(
    `retrieval_vector_backend_unknown:${raw || '(empty)'} (want unset|pgvector|pg|qdrant)`,
  );
}

/** Pgvector handle — callers keep using retrieval-store.ts + PoolClient. */
export type PgvectorRetrievalBackend = {
  backend: 'pgvector';
  mode: 'client-bound';
  /**
   * Honesty pin: pg path stays in retrieval-store.ts (SQL/HNSW/RLS/qbank generation).
   * This factory does not re-bind PoolClient ops.
   */
  note: 'use packages/db retrieval-store upsertVectorChunk/annSearch with PoolClient';
};

/** Qdrant handle — thin adapter subset (explicit opt-in). */
export type QdrantRetrievalBackend = {
  backend: 'qdrant';
  mode: 'http-adapter';
  adapter: QdrantVectorStoreAdapter;
  url: string;
  collection: string;
  requireReadyz(): Promise<void>;
  ensureCollection(): Promise<{ created: boolean; collection: string }>;
  upsertVectorChunk(owner: string, chunk: VectorChunkInput): Promise<{ pointId: string }>;
  annSearch(
    owner: string,
    kind: VectorChunkKind,
    queryEmbedding: number[],
    k: number,
  ): Promise<VectorSearchHit[]>;
};

export type RetrievalVectorBackend = PgvectorRetrievalBackend | QdrantRetrievalBackend;

export type CreateRetrievalVectorBackendOptions = ResolveRetrievalVectorBackendOptions & {
  /** Override Qdrant URL (else `QDRANT_URL` / adapter default). */
  qdrantUrl?: string;
  /** Override Qdrant collection name. */
  collection?: string;
  /**
   * When true (default for qdrant path in prove), call requireReadyz before return.
   * Fail-closed: bad URL / down Qdrant → throw (prove maps to EXIT=3).
   */
  requireReadyz?: boolean;
};

/**
 * Create the selected backend.
 * - Default / pgvector → client-bound handle (no network; no Qdrant).
 * - qdrant → live adapter; optional requireReadyz (default true).
 */
export async function createRetrievalVectorBackend(
  opts: CreateRetrievalVectorBackendOptions = {},
): Promise<RetrievalVectorBackend> {
  const backend = resolveRetrievalVectorBackend(opts);
  if (backend === 'pgvector') {
    return {
      backend: 'pgvector',
      mode: 'client-bound',
      note: 'use packages/db retrieval-store upsertVectorChunk/annSearch with PoolClient',
    };
  }

  const config: QdrantStoreConfig = {};
  if (typeof opts.qdrantUrl === 'string' && opts.qdrantUrl.trim()) {
    config.url = opts.qdrantUrl.trim();
  } else {
    const fromEnv = String((opts.env ?? process.env).QDRANT_URL ?? '').trim();
    if (fromEnv) config.url = fromEnv;
  }
  if (typeof opts.collection === 'string' && opts.collection.trim()) {
    config.collection = opts.collection.trim();
  }

  const adapter = createQdrantVectorStoreAdapter(config);
  const requireReadyz = opts.requireReadyz !== false;
  if (requireReadyz) {
    await adapter.requireReadyz();
  }

  return {
    backend: 'qdrant',
    mode: 'http-adapter',
    adapter,
    url: adapter.url,
    collection: adapter.collection,
    requireReadyz: () => adapter.requireReadyz(),
    ensureCollection: () => adapter.ensureCollection(),
    upsertVectorChunk: (owner, chunk) => adapter.upsertVectorChunk(owner, chunk),
    annSearch: (owner, kind, queryEmbedding, k) =>
      adapter.annSearch(owner, kind, queryEmbedding, k),
  };
}
