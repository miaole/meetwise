/**
 * Match existing Meetwise embedding recipe: vector(512) + cosine
 * (see packages/db/migrations/0001_baseline.sql / 0029_qbank_generation_hybrid_retrieval.sql).
 * Additive prototype only — does not cut pgvector serving.
 */
export const QDRANT_VECTOR_SIZE = 512 as const;
export const QDRANT_DISTANCE = 'Cosine' as const;
export const DEFAULT_QDRANT_URL = 'http://127.0.0.1:6333';
/** Local prototype collection — not a production serving name. */
export const DEFAULT_COLLECTION = 'meetwise_m4_proto_v512';
