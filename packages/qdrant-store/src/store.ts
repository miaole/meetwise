/**
 * App-facing Qdrant store API (additive M4 prototype).
 *
 * 应用侧 API — ensureCollection / upsert / search / erasePoints.
 * Does not replace packages/db retrieval-store annSearch / pgvector serving.
 */
import { QdrantClient } from './client.ts';
import { erasePoints, eraseSubjectPoints } from './erasure.ts';
import type { QdrantErasureReceipt, QdrantSearchFilter, QdrantStoreConfig, SearchHit, UpsertPoint } from './types.ts';

export class QdrantStore {
  readonly client: QdrantClient;

  constructor(config: QdrantStoreConfig = {}) {
    this.client = new QdrantClient(config);
  }

  get collection(): string {
    return this.client.collection;
  }

  get url(): string {
    return this.client.url;
  }

  async readyz(): Promise<boolean> {
    return this.client.readyz();
  }

  async ensureCollection(): Promise<{ created: boolean; collection: string }> {
    return this.client.ensureCollection();
  }

  async upsert(points: UpsertPoint[]): Promise<void> {
    return this.client.upsert(points);
  }

  async search(vector: number[], limit = 10, filter?: QdrantSearchFilter): Promise<SearchHit[]> {
    return this.client.search(vector, limit, filter);
  }

  /** Erasure sink: delete → receipt; caller must prove recall=0. */
  async erasePoints(ids: string[]): Promise<QdrantErasureReceipt> {
    return erasePoints(this.client, ids);
  }

  /**
   * Subject-scoped erase (G5): delete points with payload owner_user_id=subjectId.
   * Countable receipt; ≠ 0091 ledger aligned; ≠ public DELETE open.
   */
  async eraseSubjectPoints(
    subjectId: string,
    opts?: { kind?: 'memory' | 'qbank' },
  ): Promise<QdrantErasureReceipt> {
    return eraseSubjectPoints(this.client, subjectId, opts);
  }
}

export function createQdrantStore(config?: QdrantStoreConfig): QdrantStore {
  return new QdrantStore(config);
}
