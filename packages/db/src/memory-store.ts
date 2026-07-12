/**
 * @meetwise/db · 长期记忆存储 ops。content=派生摘要(非 PII)。向量化在 memory-service(注入 embedder),这里只管行存取。
 */
import type { PoolClient as Client } from 'pg';

export type MemoryKind = 'skill' | 'weakness' | 'topic' | 'preference' | 'episode';
export interface MemoryRow { id: string; kind: MemoryKind; content: string; salience: number; sourceId: string | null }

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
  const r = await c.query('SELECT id, kind, content, salience, source_id FROM user_memory WHERE id = ANY($1)', [refIds]);
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
  const r = await c.query(
    "SELECT 1 FROM user_memory WHERE kind='episode' AND lower(btrim(regexp_replace(content, '\\s+', ' ', 'g'))) = $1 LIMIT 1",
    [normalizeQuestion(content)]);
  return r.rowCount! > 0;
}

/** 弱项读取投影(**只读,不新建信念表**):历史 assessment_report 里 gap=true 的能力维度名(去重)。
 *  仅取 status='ready' 的已生成报告;显式按 owner 过滤(RLS 之上再加一道,防越权/防误串户)。
 *  **只返回维度名**(标签),绝不带分数/答案/时间——成长曲线唯一真相仍是 assessment_report→deriveGrowth,这里只借"历史弱项名"给出题做软偏置。 */
export async function historicalWeakDimensions(c: Client, owner: string): Promise<string[]> {
  const r = await c.query(
    `SELECT DISTINCT d->>'dimension' AS dimension
       FROM assessment_report ar, jsonb_array_elements(ar.dimensions) d
      WHERE ar.owner_user_id = $1 AND ar.status = 'ready'
        AND coalesce(d->>'gap', 'false') = 'true'
        AND coalesce(btrim(d->>'dimension'), '') <> ''`,
    [owner]);
  return r.rows.map((x) => String(x.dimension));
}
