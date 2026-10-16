/** @meetwise/db · admin 审计(append-only 不可改)。每个特权写操作记一条,问责可追溯。 */
import type { PoolClient as Client } from 'pg';
import type { Pool } from 'pg';
export async function appendAudit(db: Pool | Client, id: string, actor: string, action: string, target: string | null, detail: unknown = {}): Promise<void> {
  await db.query('INSERT INTO admin_audit(id, actor, action, target, detail) VALUES ($1,$2,$3,$4,$5)', [id, actor, action, target, JSON.stringify(detail)]);
}
export async function listAudit(db: Pool | Client, limit = 100): Promise<{ actor: string; action: string; target: string | null; detail: any }[]> {
  const r = await db.query('SELECT actor, action, target, detail FROM admin_audit ORDER BY created_at DESC LIMIT $1', [limit]);
  return r.rows;
}
