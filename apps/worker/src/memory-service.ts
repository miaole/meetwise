/**
 * 记忆服务（生产,worker 侧）· **lean MVP(经 2 位专家审计砍瘦定稿)**:只做两件确定性、零非确定性的事,
 * **不用 embedding/语义召回/信念库**(那套曾被审计判为"既过度工程又防御不足":L2 双增长源 + confirmation-bias 回路 + 毁引擎确定性)。
 *   ① 跨会话精确判重(episode):wasAsked/recordAskedQuestions —— 归一化题面 exact match,防重复出题。
 *   ② 历史弱项只读投影:pastWeakDimensions —— 从 assessment_report 读 gap=true 维度名,给能力选择做软偏置(不动分数/难度/成长曲线)。
 * 隐私:episode 只存**我方生成的归一化题面**(非答案/非 PII);弱项只借"维度名"标签。
 */
import { randomUUID } from 'node:crypto';
import { asPrincipal, insertMemory, episodeSeen, historicalWeakDimensions, normalizeQuestion, type DbPool } from '@meetwise/db';

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
