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

/** 情景记忆判重:这道题该候选人是否问过(防重复出题)。 */
export async function episodeSeen(c: Client, owner: string, content: string): Promise<boolean> {
  const r = await c.query("SELECT 1 FROM user_memory WHERE kind='episode' AND content=$1 LIMIT 1", [content]);
  return r.rowCount! > 0;
}
