/**
 * 进程内 embedding 去重优化：同一 (model, dim, 文本) 在单个进程内只嵌一次。
 * 它不带 recipe/deployment identity、跨实例 lease、费用 attempt、输入 HMAC、向量校验或删除回执，
 * 因而不是 Redis/Tair/PG production compute cache，也不能决定 generation 或 serving 可见性。
 * 命中后仍保序返回；未命中只对 miss 子集调用 inner，再回填本地 store。
 */
import { createHash } from 'node:crypto';
import type { Embedder } from './embedder.ts';

export interface EmbeddingStore {
  getMany(keys: string[]): Promise<(number[] | null)[]>;
  putMany(items: { key: string; vec: number[] }[]): Promise<void>;
}

export function inMemoryEmbeddingStore(): EmbeddingStore {
  const m = new Map<string, number[]>();
  return {
    async getMany(keys) { return keys.map((k) => m.get(k) ?? null); },
    async putMany(items) { for (const it of items) m.set(it.key, it.vec); },
  };
}

/** 本地 seam：contentKey = sha256(model:dim:text)，只对未命中子集调用 inner 并回填 store。 */
export function cachingEmbedder(inner: Embedder, store: EmbeddingStore): Embedder {
  const keyOf = (t: string) => `${inner.id}:${inner.dim}:${createHash('sha256').update(t).digest('hex')}`;
  const embed = async (texts: string[]): Promise<number[][]> => {
      const keys = texts.map(keyOf);
      const cached = await store.getMany(keys);
      const miss: { i: number; t: string }[] = [];
      texts.forEach((t, i) => { if (!cached[i]) miss.push({ i, t }); });
      if (miss.length) {
        const fresh = await inner.embed(miss.map((m) => m.t));
        await store.putMany(miss.map((m, j) => ({ key: keys[m.i]!, vec: fresh[j]! })));
        miss.forEach((m, j) => { cached[m.i] = fresh[j]!; });
      }
    return cached as number[][];
  };
  const embedWithUsage = async (texts: string[]): Promise<{ vectors: number[][]; inputTokens?: number }> => {
      const keys = texts.map(keyOf);
      const cached = await store.getMany(keys);
      const miss: { i: number; t: string }[] = [];
      texts.forEach((t, i) => { if (!cached[i]) miss.push({ i, t }); });
      let inputTokens = 0;
      let sawUsage = false;
      if (miss.length) {
        const fresh = inner.embedWithUsage
          ? await inner.embedWithUsage(miss.map((m) => m.t))
          : { vectors: await inner.embed(miss.map((m) => m.t)) };
        if (fresh.inputTokens !== undefined) { inputTokens += fresh.inputTokens; sawUsage = true; }
        await store.putMany(miss.map((m, j) => ({ key: keys[m.i]!, vec: fresh.vectors[j]! })));
        miss.forEach((m, j) => { cached[m.i] = fresh.vectors[j]!; });
      }
    return { vectors: cached as number[][], ...(sawUsage ? { inputTokens } : {}) };
  };
  return { dim: inner.dim, id: inner.id + '+cache', embed, embedWithUsage };
}
