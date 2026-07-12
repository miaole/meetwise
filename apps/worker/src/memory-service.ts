/**
 * 记忆服务（生产,worker 侧）：长期/情景记忆的写入与语义召回。复用 vector_chunk(pgvector) + embedder seam。
 *   rememberFact: 派生事实 → 落 user_memory + 向量化进 vector_chunk(kind=memory)。
 *   recallMemories: 语义检索相关记忆,喂给出题/评估做个性化(成长档案);RLS 天然隔离不串户。
 * 隐私:只存派生摘要(技能/弱项/主题),非简历原文 PII。
 */
import { randomUUID, createHash } from 'node:crypto';
import { asPrincipal, insertMemory, getMemoriesByRefIds, episodeSeen, historicalWeakDimensions, normalizeQuestion, upsertVectorChunk, annSearch, type DbPool, type MemoryKind, type MemoryRow } from '@meetwise/db';
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

/** 情景记忆:这道题该候选人是否问过(防重复出题)。**精确归一化匹配,无向量/语义**(见 memory-store.episodeSeen)。 */
export async function wasAsked(pool: DbPool, owner: string, question: string): Promise<boolean> {
  return asPrincipal(pool, owner, (c) => episodeSeen(c, owner, question));
}

/* ───────── 记忆 lean MVP(经 2 位专家审计砍瘦):两件事、都零非确定性,不用 embedding/语义/信念库 ───────── */

/** 跨会话精确判重的**写入源**:conclude 后把本场问过的题落 episode(content=归一化题面 = **我方生成的题**,非答案/PII;
 *  source_id=interviewId 作 provenance)。同批按归一化去重避免重复行。**绝不写答案/分数/PII**(隐私铁律)。 */
export async function recordAskedQuestions(pool: DbPool, owner: string, questions: string[], interviewId: string): Promise<void> {
  const uniq = [...new Set(questions.map(normalizeQuestion).filter((q) => q.length > 0))];
  if (uniq.length === 0) return;   // 无题(不可能的收尾/空转写)→ 空写=no-op
  await asPrincipal(pool, owner, async (c) => {
    for (const content of uniq) await insertMemory(c, owner, { id: randomUUID(), kind: 'episode', content, sourceId: interviewId });
  });
}

/** 弱项读取投影(**只读,不写信念库**):历史 assessment_report 里 gap=true 的能力维度名。
 *  成长曲线唯一真相仍是 assessment_report→deriveGrowth;这里只借"历史弱项名"给出题做**软偏置**(见 adaptive-interview-service.planCompetencies),
 *  绝不据此设 confidence(confidence 只来自本场证据)。冷启动无历史 → 空数组 → 上层自然退化成现状。 */
export async function pastWeakDimensions(pool: DbPool, owner: string): Promise<string[]> {
  return asPrincipal(pool, owner, (c) => historicalWeakDimensions(c, owner));
}
