/** @meetwise/db · 站内通知 ops。系统内部 insert(报告就绪等);用户列/读。 */
import type { PoolClient as Client } from 'pg';
export async function insertNotification(c: Client, owner: string, id: string, kind: string, payload: unknown): Promise<void> {
  await c.query('INSERT INTO notification(id, owner_user_id, kind, payload) VALUES ($1,$2,$3,$4)', [id, owner, kind, JSON.stringify(payload)]);
}
export async function listNotifications(c: Client, owner: string, limit = 20): Promise<{ id: string; kind: string; payload: any; read: boolean }[]> {
  const r = await c.query('SELECT id, kind, payload, read FROM notification ORDER BY created_at DESC LIMIT $1', [limit]);
  return r.rows;
}
export async function markNotificationRead(c: Client, owner: string, id: string): Promise<boolean> {
  const r = await c.query('UPDATE notification SET read=true WHERE id=$1', [id]);
  return r.rowCount === 1;
}
export async function unreadCount(c: Client, owner: string): Promise<number> {
  const r = await c.query('SELECT count(*)::int n FROM notification WHERE read=false');
  return r.rows[0].n;
}
/** 全部标记已读(RLS 限己)。返回标记数。 */
export async function markAllNotificationsRead(c: Client, owner: string): Promise<number> {
  const r = await c.query('UPDATE notification SET read=true WHERE read=false');
  return r.rowCount ?? 0;
}
