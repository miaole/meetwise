/**
 * Compatibility-only raw vector store search. It is deliberately independent of immutable generation retrieval
 * so pre-0029 proof databases do not create a runtime import cycle with the production generation path.
 */
import type { PoolClient as Client } from 'pg';

const SYSTEM_QBANK_OWNER = '__system_qbank__';
let qbankTakeoverPresent = false;
const vec = (e: number[]) => `[${e.join(',')}]`;

export async function annSearchLegacy(
  c: Client, kind: 'qbank' | 'memory', queryEmbedding: number[], k: number,
): Promise<{ refId: string; distance: number }[]> {
  const qvec = vec(queryEmbedding);
  if (kind === 'qbank') {
    if (!qbankTakeoverPresent) {
      const ok = (await c.query("SELECT to_regclass('qbank_visible_ref') IS NOT NULL AS ok")).rows[0].ok as boolean;
      if (ok) qbankTakeoverPresent = true;
      else if (process.env.QBANK_TAKEOVER_REQUIRED === '1')
        throw new Error('qbank_visible_ref 缺失但 QBANK_TAKEOVER_REQUIRED=1:拒绝回落到未过滤 qbank 读(fail-closed 防投毒)');
    }
    if (qbankTakeoverPresent) {
      const r = await c.query(
        `SELECT ref_id, dist FROM (
           SELECT DISTINCT ON (v.ref_id) v.ref_id AS ref_id, v.embedding <=> $1::vector AS dist
             FROM vector_chunk v
             JOIN qbank_visible_ref vr ON vr.ref_id = v.ref_id
            WHERE v.kind='qbank' AND v.owner_user_id=$3
            ORDER BY v.ref_id, v.embedding <=> $1::vector
         ) t ORDER BY dist LIMIT $2`,
        [qvec, k, SYSTEM_QBANK_OWNER]);
      return r.rows.map((row) => ({ refId: row.ref_id as string, distance: Number(row.dist) }));
    }
    const r = await c.query(
      `SELECT ref_id, embedding <=> $1::vector AS dist FROM vector_chunk
         WHERE kind='qbank' ORDER BY embedding <=> $1::vector LIMIT $2`,
      [qvec, k]);
    return r.rows.map((row) => ({ refId: row.ref_id as string, distance: Number(row.dist) }));
  }
  const r = await c.query(
    `SELECT ref_id, embedding <=> $1::vector AS dist FROM vector_chunk
       WHERE kind=$2 ORDER BY embedding <=> $1::vector LIMIT $3`,
    [qvec, kind, k]);
  return r.rows.map((row) => ({ refId: row.ref_id as string, distance: Number(row.dist) }));
}
