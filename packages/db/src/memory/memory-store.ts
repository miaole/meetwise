/**
 * @meetwise/db · 长期记忆存储 ops。content=派生摘要(非 PII)。向量化在 memory-service(注入 embedder),这里只管行存取。
 */
import type { PoolClient as Client } from 'pg';

export type MemoryKind = 'skill' | 'weakness' | 'topic' | 'preference' | 'episode';
export interface MemoryRow { id: string; kind: MemoryKind; content: string; salience: number; sourceId: string | null }

/** 写入口。#217 写侧如实注 2026-10-12：现役生产唯一调用链（apps/worker/src/memory-service.ts）只产
 *  kind='episode'；MemoryKind 其余值（skill/weakness/topic/preference）是 0001 user_memory CHECK 的
 *  前向兼容位——评估弱项实际经 assessment_report 派生读投影（historicalWeakDimensions），不落本表。
 *  0001 表注释所列多 kind 语义=建表期预留，非现役写侧事实（迁移本体 checksum 铁律不可改，以此注为准）。 */
export async function insertMemory(
  c: Client, owner: string, m: { id: string; kind: MemoryKind; content: string; salience?: number; sourceId?: string },
): Promise<void> {
  await c.query(
    `INSERT INTO user_memory(id, owner_user_id, kind, content, salience, source_id) VALUES ($1,$2,$3,$4,$5,$6)`,
    [m.id, owner, m.kind, m.content, m.salience ?? 1.0, m.sourceId ?? null]);
}

/** 取回召回到的记忆内容(按 vector_chunk.ref_id),保持传入顺序(检索相关度序)。 */
export async function getMemoriesByRefIds(c: Client, owner: string, refIds: string[]): Promise<MemoryRow[]> {
  if (!refIds.length) return [];
  // owner 必须进 WHERE（RLS 之上再加一道租户硬过滤）：此前 owner 参数被忽略，调用方传任一
  // ref_id 即可读到**他人**的 user_memory 行（RLS 若被漏绑 principal 即构成越权读）。
  const r = await c.query('SELECT id, kind, content, salience, source_id FROM user_memory WHERE id = ANY($1) AND owner_user_id = $2', [refIds, owner]);
  const byId = new Map(r.rows.map((x) => [x.id, { id: x.id, kind: x.kind, content: x.content, salience: Number(x.salience), sourceId: x.source_id }]));
  return refIds.map((id) => byId.get(id)).filter(Boolean) as MemoryRow[];
}

/** 题面归一化(**跨会话精确判重**用,确定性、无语义):压缩内部空白 + 去首尾空白 + 小写。
 *  绝不做向量/语义相似——语义会误挡合法的不同题、且毁掉引擎确定性。归一化是唯一真相,写读两侧共用。 */
export function normalizeQuestion(q: string): string {
  return (q ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/** 情景记忆判重:这道题该候选人是否问过(防重复出题)。**精确匹配**——把存量 content 与传入题面都按 normalizeQuestion 归一后比对
 *  (SQL 内 collapse+btrim+lower 与 JS 侧一致),小写/空白差异不漏判,但绝不用相似度(合法不同题不误挡)。 */
export async function episodeSeen(c: Client, owner: string, content: string): Promise<boolean> {
  // owner 必须进 WHERE（RLS 之上再加一道租户硬过滤）：此前 owner 参数被忽略，调用方传任一
  // 题面即可判出**他人**的 user_memory episode 行（RLS 若被漏绑 principal 即构成跨租户判重泄漏）。
  const r = await c.query(
    "SELECT 1 FROM user_memory WHERE kind='episode' AND lower(btrim(regexp_replace(content, '\\s+', ' ', 'g'))) = $1 AND owner_user_id = $2 LIMIT 1",
    [normalizeQuestion(content), owner]);
  return r.rowCount! > 0;
}

/** 弱项读取投影(**只读,不新建信念表**):历史 assessment_report 里 gap=true 的能力维度名(去重)。
 *  仅取 status='ready' 的已生成报告;显式按 owner 过滤(RLS 之上再加一道,防越权/防误串户)。
 *  R4 读面过滤(UNSTUB-ERASE rev2):已围栏面试的评估不再给出题软偏置——与列表/导出/成长档案
 *  同一 interview_privacy_active 谓词,账户级删除后弱项偏置零泄漏。
 *  **只返回维度名**(标签),绝不带分数/答案/时间——成长曲线唯一真相仍是 assessment_report→deriveGrowth,这里只借"历史弱项名"给出题做软偏置。
 *  H4 R6(#206 时间衰减·读投影层落,零新持久化):**固定窗口 N=WEAKNESS_DECAY_WINDOW_SESSIONS 场**(最近 N 份
 *  ready 报告;固定初值,不依赖 H1 校准)。窗口内每维度取**最新一场** gap 定去留:最新一场达标(gap=false)→ 移出;
 *  最新一场未达标(gap=true)→ 保留;窗口内不再出现(最新出现早于窗口)=时间衰减移出。冷启动(零历史)→ 空数组 →
 *  上层稳定分区恒等(非特殊分支)。historicalWeakDimensions 形参 additive 可选(默认窗口值),旧调用方逐字节兼容。 */
export const WEAKNESS_DECAY_WINDOW_SESSIONS = 5;
export async function historicalWeakDimensions(c: Client, owner: string, windowSessions: number = WEAKNESS_DECAY_WINDOW_SESSIONS): Promise<string[]> {
  const window = Number.isInteger(windowSessions) && windowSessions > 0 ? windowSessions : WEAKNESS_DECAY_WINDOW_SESSIONS;
  // 窗口 = 最近 N 份 ready+privacy-active 报告(created_at DESC,id DESC 同拍 tiebreak 确定性);
  // DISTINCT ON(维度) 取该维度在窗口内**最新一份**报告的 gap 值,再由 JS 侧只留 gap=true(达标移出/未达标保留)。
  const r = await c.query(
    `WITH recent AS (
       SELECT ar.id
         FROM assessment_report ar
        WHERE ar.owner_user_id = $1 AND ar.status = 'ready'
          AND interview_privacy_active_read(ar.interview_id)
        ORDER BY ar.created_at DESC, ar.id DESC
        LIMIT $2
     )
     SELECT DISTINCT ON (dim) dim AS dimension, gap
       FROM (
         SELECT ar.created_at, ar.id, btrim(d->>'dimension') AS dim, coalesce(d->>'gap', 'false') AS gap
           FROM assessment_report ar, jsonb_array_elements(ar.dimensions) d
          WHERE ar.owner_user_id = $1 AND ar.status = 'ready'
            AND interview_privacy_active_read(ar.interview_id)
            AND coalesce(btrim(d->>'dimension'), '') <> ''
            AND ar.id IN (SELECT id FROM recent)
       ) occ
      ORDER BY dim, created_at DESC, id DESC`,
    [owner, window]);
  return r.rows.filter((x) => x.gap === 'true').map((x) => String(x.dimension));
}
