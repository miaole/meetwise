/**
 * @meetwise/db · 生产向量库 ops(pgvector HNSW)。隐私:只收向量+ref_id+hash,不收原文。检索返回 ref_id,由业务层取文。
 */
import type { PoolClient as Client } from 'pg';

const vec = (e: number[]) => `[${e.join(',')}]`;   // pgvector 字面量

/** 写入/去重一个向量块(同 owner+kind+hash 幂等覆盖)。 */
export async function upsertVectorChunk(
  c: Client, owner: string, x: { id: string; kind: 'qbank' | 'memory'; refId: string; contentHash: string; embedding: number[] },
): Promise<void> {
  await c.query(
    `INSERT INTO vector_chunk(id, owner_user_id, kind, ref_id, content_hash, embedding)
       VALUES ($1,$2,$3,$4,$5,$6::vector)
       ON CONFLICT (owner_user_id, kind, content_hash) DO UPDATE SET embedding=EXCLUDED.embedding, ref_id=EXCLUDED.ref_id`,
    [x.id, owner, x.kind, x.refId, x.contentHash, vec(x.embedding)]);
}

/** ANN 检索:HNSW 余弦近邻 top-k。返回 ref_id + 距离(越小越近)。RLS 自动按 owner 隔离。 */
export async function annSearch(
  c: Client, owner: string, kind: 'qbank' | 'memory', queryEmbedding: number[], k: number,
): Promise<{ refId: string; distance: number }[]> {
  const r = await c.query(
    `SELECT ref_id, embedding <=> $1::vector AS dist FROM vector_chunk
       WHERE kind=$2 ORDER BY embedding <=> $1::vector LIMIT $3`,
    [vec(queryEmbedding), kind, k]);
  return r.rows.map((row) => ({ refId: row.ref_id as string, distance: Number(row.dist) }));
}
