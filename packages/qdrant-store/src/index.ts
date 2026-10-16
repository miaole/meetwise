/**
 * @meetwise/qdrant-store — additive Qdrant client + collection + erasure sink + vectorstore adapter + opt-in product prove bridge (M4/G2) + G5 P16 ledger-receipt map (≠ 0091 write).
 *
 * HARD: Does NOT cut production vector truth / pgvector paths
 * (retrieval-store.ts annSearch, vectorstore.proof, E2E_PG_IMAGE).
 * Feature-flag / separate package only. Opt-in vectorstore/rag/memory:qdrant:prove ≠ default flip.
 * P14 product selector lives in @meetwise/db retrieval-backend.ts (RETRIEVAL_VECTOR_BACKEND); G2 still open.
 * releaseEvidence=false. Not HA. 本绿 ≠ 已迁.
 *
 * @see ai-docs/delivery/m4-qdrant-prototype-impl.md
 * @see ai-docs/delivery/harness/qdrant-store.prototype.md
 */
export {
  QDRANT_VECTOR_SIZE,
  QDRANT_DISTANCE,
  DEFAULT_QDRANT_URL,
  DEFAULT_COLLECTION,
} from './constants.ts';
export type {
  QdrantStoreConfig,
  UpsertPoint,
  SearchHit,
  QdrantErasureReceipt,
  QdrantDistance,
  QdrantVectorSize,
  QdrantSearchFilter,
  VectorChunkKind,
  VectorChunkInput,
  VectorSearchHit,
} from './types.ts';
export { QdrantClient, QdrantHttpError } from './client.ts';
export { QdrantStore, createQdrantStore } from './store.ts';
export {
  buildErasureReceipt,
  assertErasureReceiptShape,
  erasePoints,
  eraseSubjectPoints,
  batchDigestForIds,
  ERASURE_SUBJECT_PAYLOAD_KEY,
} from './erasure.ts';
export {
  QdrantVectorStoreAdapter,
  createQdrantVectorStoreAdapter,
  pointIdForChunk,
} from './vectorstore-adapter.ts';

export {
  ProductVectorStoreQdrantBridge,
  createProductVectorStoreQdrantBridge,
} from './product-vectorstore-bridge.ts';

export {
  LEDGER_0091_RECEIPT_COLUMNS,
  P15_PROTOTYPE_RECEIPT_FIELDS,
  CONTRACT_PRIVACY_DELETION_RECEIPT_FIELDS,
  RECEIPT_FIELD_MAP,
  LEDGER_WRITE_PREREQS,
  assertQdrantLedgerNotWritable,
  deriveCandidateReceiptHash,
  mapPrototypeReceiptToward0091,
  summarizeReceiptFieldMap,
} from './ledger-receipt-map.ts';
export type {
  LedgerMapStatus,
  LedgerFieldMapEntry,
  LedgerWritePrereq,
  LedgerWriteReadiness,
  PrototypeToLedgerMapResult,
} from './ledger-receipt-map.ts';
