/**
 * 记忆服务（生产,worker 侧）：长期/情景记忆的写入与语义召回。复用 vector_chunk(pgvector) + embedder seam。
 *   rememberFact: 派生事实 → 落 user_memory + 向量化进 vector_chunk(kind=memory)。
 *   recallMemories: 语义检索相关记忆,喂给出题/评估做个性化(成长档案);RLS 天然隔离不串户。
 * 隐私:只存派生摘要(技能/弱项/主题),非简历原文 PII。
 */
import { randomUUID, createHash } from 'node:crypto';
import { asPrincipal, insertMemory, getMemoriesByRefIds, episodeSeen, upsertVectorChunk, annSearch, type DbPool, type MemoryKind, type MemoryRow } from '@meetwise/db';
import type { Embedder } from '@meetwise/ai-runtime';

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

/** 记住一条派生事实(skill/weakness/topic/preference/episode)。返回 memory id。 */
export async function rememberFact(
  pool: DbPool, owner: string, embedder: Embedder,
  m: { kind: MemoryKind; content: string; salience?: number; sourceId?: string },
): Promise<string> {
  const id = randomUUID();
  const [vec] = await embedder.embed([m.content]);
  await asPrincipal(pool, owner, async (c) => {
    await insertMemory(c, owner, { id, kind: m.kind, content: m.content, salience: m.salience, sourceId: m.sourceId });
    await upsertVectorChunk(c, owner, { id: `mem_${id}`, kind: 'memory', refId: id, contentHash: sha(`${owner}:${m.content}`), embedding: vec });
  });
  return id;
}

/** 语义召回最相关的 k 条记忆(按检索相关度序)。用于个性化出题/评估。 */
export async function recallMemories(pool: DbPool, owner: string, embedder: Embedder, query: string, k = 5): Promise<MemoryRow[]> {
  const [qv] = await embedder.embed([query]);
  return asPrincipal(pool, owner, async (c) => {
    const hits = await annSearch(c, owner, 'memory', qv, k);
    return getMemoriesByRefIds(c, owner, hits.map((h) => h.refId));
  });
}

/** 情景记忆:这道题该候选人是否问过(防重复出题)。 */
export async function wasAsked(pool: DbPool, owner: string, question: string): Promise<boolean> {
  return asPrincipal(pool, owner, (c) => episodeSeen(c, owner, question));
}
