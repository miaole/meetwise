/**
 * 共享题库灌库(决策 i):策展真题 embed → upsert 进 vector_chunk(kind='qbank',**系统 owner**),全用户公共读。
 * hash 去重幂等(重灌不增行)。原文 PII 不入向量库(只 ref_id+hash+向量);题面原文在业务表/题库源。
 * 这是 CRAG localRetrieve 的数据来源——没灌库则 annSearch 空 → CRAG 优雅降级(按能力出题)。
 */
import { asPrincipal, upsertVectorChunk, type DbPool } from '@meetwise/db';
import type { Embedder } from '@meetwise/ai-runtime';
import { createHash } from 'node:crypto';

export const QBANK_OWNER = '__system_qbank__';   // 系统 owner:策展真题归它

export interface QbankItem { refId: string; text: string }

export async function ingestQbank(pool: DbPool, items: QbankItem[], embedder: Embedder): Promise<number> {
  if (items.length === 0) return 0;
  const vecs = await embedder.embed(items.map((i) => i.text));
  return asPrincipal(pool, QBANK_OWNER, async (c) => {
    for (let i = 0; i < items.length; i++) {
      const hash = createHash('sha256').update(items[i].text).digest('hex').slice(0, 32);
      await upsertVectorChunk(c, QBANK_OWNER, { id: 'qb-' + hash, kind: 'qbank', refId: items[i].refId, contentHash: hash, embedding: vecs[i] });
    }
    return items.length;
  });
}
