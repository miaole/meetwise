/**
 * 记忆服务（生产,worker 侧）· **lean MVP(经 2 位专家审计砍瘦定稿)**:只做确定性、零非确定性的事,
 * **不用 embedding/语义召回/信念库**(那套曾被审计判为"既过度工程又防御不足":L2 双增长源 + confirmation-bias 回路 + 毁引擎确定性)。
 *   ① 跨会话精确判重(episode):wasAsked/recordAskedQuestions —— 归一化题面 exact match,防重复出题。
 *   ② 历史弱项只读投影:pastWeakDimensions —— 从 assessment_report 读 gap=true 维度名,给能力选择做软偏置(不动分数/难度/成长曲线)。
 *   ③ 近期已问题面只读列表:recentAskedStems —— 最近若干场 episode 的归一化题面(一行一道题,按 source_id 计场),给出题不可信数据,不做语义相似。本场题目由调用侧接上,截断也在调用侧。
 * 隐私:episode 只存**我方生成的归一化题面**(非答案/非 PII);弱项只借"维度名"标签。
 */
import { randomUUID } from 'node:crypto';
import { SESSION_QUESTION_MAX_CHARS } from '@meetwise/ai-graphs';
import { asPrincipal, insertMemory, episodeSeen, historicalWeakDimensions, normalizeQuestion, recentAskedStems as loadRecentAskedStems, type DbPool } from '@meetwise/db';

/** 情景记忆:这道题该候选人是否问过(防重复出题)。**精确归一化匹配,无向量/语义**(见 memory-store.episodeSeen)。 */
export async function wasAsked(pool: DbPool, owner: string, question: string): Promise<boolean> {
  return asPrincipal(pool, owner, (c) => episodeSeen(c, owner, question));
}

/* ───────── 记忆 lean MVP(经 2 位专家审计砍瘦):都零非确定性,不用 embedding/语义/信念库 ───────── */

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
 *  绝不据此设 confidence(confidence 只来自本场证据)。冷启动无历史 → 空数组 → 上层自然退化成现状。
 *  H4 R6(#206):historicalWeakDimensions 增固定衰减窗 N=5 场(最新一场达标即移出·窗外衰减·冷启动恒等)——仍只读投影,零新持久化。
 *  H4 R7(#203):消费侧匹配升级为确定性相似度(adaptive-interview-service.weaknessMatches·禁 embedding·lean MVP 注记照守)。 */
export async function pastWeakDimensions(pool: DbPool, owner: string): Promise<string[]> {
  return asPrincipal(pool, owner, (c) => historicalWeakDimensions(c, owner));
}

/** 库内近场已问题面。经 asPrincipal 读该候选人自己的 episode;不截断。精确判重仍是 wasAsked。 */
export async function recentAskedStems(pool: DbPool, owner: string): Promise<string[]> {
  return asPrincipal(pool, owner, (c) => loadRecentAskedStems(c, owner));
}

/** 按会话题面字数上限截断,不把代理对切成半个字符。 */
function clipAskedStem(stem: string): string {
  const max = SESSION_QUESTION_MAX_CHARS;
  if (stem.length <= max) return stem;
  let end = max;
  const code = stem.charCodeAt(end - 1);
  if (code >= 0xd800 && code <= 0xdbff) end -= 1;
  return stem.slice(0, end);
}

/** 本场已传入的题目在前,库内近场题面在后。归一化后相同题面只留第一次。
 *  截断在调用侧。库内列表为空时仍保留本场题目。两边都空则返回空数组。 */
export function recentAskedForPrompt(stored: readonly string[], asked?: readonly string[] | null): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (raw: string): void => {
    const normalized = normalizeQuestion(raw);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    const stem = clipAskedStem(normalized);
    if (stem) out.push(stem);
  };
  for (const q of asked ?? []) push(q);
  for (const q of stored) push(q);
  return out;
}
