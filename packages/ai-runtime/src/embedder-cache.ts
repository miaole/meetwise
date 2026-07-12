/**
 * Embedding 缓存（内容寻址）：同一 (model, dim, 文本) 只嵌一次。语料嵌入本就落 pgvector 不重算;
 * 此缓存盖查询侧与重复文本——省钱省延迟。store seam:内存(测/单机)→ 生产换 pg/redis 不动调用方。
 * 命中后仍保序返回;未命中只对 miss 子集打模型,再回填。
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

/** 包一层缓存:contentKey = sha256(model:dim:text)。只对未命中子集调用 inner,回填 store。 */
export function cachingEmbedder(inner: Embedder, store: EmbeddingStore): Embedder {
  const keyOf = (t: string) => `${inner.id}:${inner.dim}:${createHash('sha256').update(t).digest('hex')}`;
  return {
    dim: inner.dim, id: inner.id + '+cache',
    async embed(texts) {
      const keys = texts.map(keyOf);
      const cached = await store.getMany(keys);
      const miss: { i: number; t: string }[] = [];
      texts.forEach((t, i) => { if (!cached[i]) miss.push({ i, t }); });
      if (miss.length) {
        const fresh = await inner.embed(miss.map((m) => m.t));
        await store.putMany(miss.map((m, j) => ({ key: keys[m.i], vec: fresh[j] })));
        miss.forEach((m, j) => { cached[m.i] = fresh[j]; });
      }
      return cached as number[][];
    },
  };
}
