/**
 * Minimal Qdrant HTTP client (fetch). Additive prototype — no @qdrant SDK required.
 * Targets compose.mysql-local qdrant :6333.
 */
import {
  DEFAULT_COLLECTION,
  DEFAULT_QDRANT_URL,
  QDRANT_DISTANCE,
  QDRANT_VECTOR_SIZE,
} from './constants.ts';
import type { QdrantSearchFilter, QdrantStoreConfig, SearchHit, UpsertPoint } from './types.ts';

export class QdrantHttpError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, body: string, path: string) {
    super(`qdrant_http_${status}:${path}: ${body.slice(0, 400)}`);
    this.name = 'QdrantHttpError';
    this.status = status;
    this.body = body;
  }
}

export class QdrantClient {
  readonly url: string;
  readonly collection: string;

  constructor(config: QdrantStoreConfig = {}) {
    this.url = (config.url ?? process.env.QDRANT_URL ?? DEFAULT_QDRANT_URL).replace(/\/$/, '');
    this.collection = config.collection ?? process.env.QDRANT_COLLECTION ?? DEFAULT_COLLECTION;
  }

  private async request(method: string, path: string, body?: unknown): Promise<unknown> {
    const res = await fetch(`${this.url}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) throw new QdrantHttpError(res.status, text, path);
    if (!text) return null;
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new QdrantHttpError(res.status, `invalid_json:${text.slice(0, 200)}`, path);
    }
  }

  async readyz(): Promise<boolean> {
    const res = await fetch(`${this.url}/readyz`);
    return res.ok;
  }

  async collectionExists(): Promise<boolean> {
    const res = await fetch(`${this.url}/collections/${encodeURIComponent(this.collection)}`);
    if (res.status === 404) return false;
    if (!res.ok) {
      const text = await res.text();
      throw new QdrantHttpError(res.status, text, `/collections/${this.collection}`);
    }
    return true;
  }

  /**
   * Ensure collection with vector size 512 + Cosine (match pgvector recipe).
   * Idempotent: create if missing; if exists, verify size/distance or throw.
   */
  async ensureCollection(): Promise<{ created: boolean; collection: string }> {
    if (await this.collectionExists()) {
      const info = (await this.request('GET', `/collections/${encodeURIComponent(this.collection)}`)) as {
        result?: { config?: { params?: { vectors?: { size?: number; distance?: string } } } };
      };
      const vectors = info?.result?.config?.params?.vectors;
      const size = vectors?.size;
      const distance = vectors?.distance;
      if (size !== QDRANT_VECTOR_SIZE || distance !== QDRANT_DISTANCE) {
        throw new Error(
          `qdrant_collection_mismatch: expected size=${QDRANT_VECTOR_SIZE} distance=${QDRANT_DISTANCE}, got size=${size} distance=${distance}`,
        );
      }
      return { created: false, collection: this.collection };
    }
    await this.request('PUT', `/collections/${encodeURIComponent(this.collection)}`, {
      vectors: { size: QDRANT_VECTOR_SIZE, distance: QDRANT_DISTANCE },
    });
    return { created: true, collection: this.collection };
  }

  async upsert(points: UpsertPoint[]): Promise<void> {
    for (const p of points) {
      if (!Array.isArray(p.vector) || p.vector.length !== QDRANT_VECTOR_SIZE) {
        throw new Error(`qdrant_vector_size_invalid: expected ${QDRANT_VECTOR_SIZE}, got ${p.vector?.length ?? 'n/a'}`);
      }
      if (!p.vector.every(Number.isFinite)) throw new Error('qdrant_vector_non_finite');
      if (typeof p.id !== 'string' || p.id.trim().length === 0) throw new Error('qdrant_point_id_required');
    }
    await this.request('PUT', `/collections/${encodeURIComponent(this.collection)}/points?wait=true`, {
      points: points.map((p) => ({
        id: p.id,
        vector: p.vector,
        payload: p.payload ?? {},
      })),
    });
  }

  async search(vector: number[], limit = 10, filter?: QdrantSearchFilter): Promise<SearchHit[]> {
    if (!Array.isArray(vector) || vector.length !== QDRANT_VECTOR_SIZE) {
      throw new Error(`qdrant_query_vector_size_invalid: expected ${QDRANT_VECTOR_SIZE}`);
    }
    const body: Record<string, unknown> = { vector, limit, with_payload: true };
    if (filter !== undefined) body.filter = filter;
    const raw = (await this.request(
      'POST',
      `/collections/${encodeURIComponent(this.collection)}/points/search`,
      body,
    )) as { result?: Array<{ id: string | number; score: number; payload?: Record<string, unknown> | null }> };
    const rows = raw?.result ?? [];
    return rows.map((r) => ({ id: r.id, score: r.score, payload: r.payload ?? null }));
  }

  /**
   * Delete points by id. Returns Qdrant operation status; caller builds erasure receipt.
   * Note: Qdrant delete op status does not include a deleted_count — callers must verify.
   */
  async deletePoints(ids: string[]): Promise<{ status: string }> {
    if (!Array.isArray(ids) || ids.length === 0) throw new Error('qdrant_delete_ids_required');
    const raw = (await this.request(
      'POST',
      `/collections/${encodeURIComponent(this.collection)}/points/delete?wait=true`,
      { points: ids },
    )) as { status?: string; result?: { status?: string } };
    return { status: raw?.status ?? raw?.result?.status ?? 'unknown' };
  }

  /**
   * Retrieve which of the given ids currently exist in the collection.
   * Used for honest deleted_count (pre/post erase verification).
   */
  async retrieveIds(ids: string[]): Promise<string[]> {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const unique = [...new Set(ids.map((id) => id.trim()).filter((id) => id.length > 0))];
    if (unique.length === 0) return [];
    const raw = (await this.request(
      'POST',
      `/collections/${encodeURIComponent(this.collection)}/points`,
      { ids: unique, with_payload: false, with_vector: false },
    )) as { result?: Array<{ id?: string | number } | null> | null };
    const rows = raw?.result ?? [];
    const present: string[] = [];
    for (const row of rows) {
      if (row == null || row.id === undefined || row.id === null) continue;
      present.push(String(row.id));
    }
    return present;
  }

  /**
   * Scroll point ids matching a payload filter (paginated).
   * Used for subject-scoped erase inventory (owner_user_id / kind).
   */
  async scrollPointIds(filter: QdrantSearchFilter, limit = 128): Promise<string[]> {
    if (!Number.isSafeInteger(limit) || limit <= 0 || limit > 1024) {
      throw new Error('qdrant_scroll_limit_invalid');
    }
    const ids: string[] = [];
    let offset: string | number | null | undefined = undefined;
    // Cap pages to avoid runaway on huge collections in prove/prototype use.
    for (let page = 0; page < 64; page++) {
      const body: Record<string, unknown> = {
        filter,
        limit,
        with_payload: false,
        with_vector: false,
      };
      if (offset !== undefined && offset !== null) body.offset = offset;
      const raw = (await this.request(
        'POST',
        `/collections/${encodeURIComponent(this.collection)}/points/scroll`,
        body,
      )) as {
        result?: {
          points?: Array<{ id?: string | number } | null>;
          next_page_offset?: string | number | null;
        };
      };
      const points = raw?.result?.points ?? [];
      for (const p of points) {
        if (p == null || p.id === undefined || p.id === null) continue;
        ids.push(String(p.id));
      }
      const next = raw?.result?.next_page_offset;
      if (next === undefined || next === null) break;
      offset = next;
    }
    return [...new Set(ids)];
  }

}
