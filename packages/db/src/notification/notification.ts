/**
 * @meetwise/db · 站内通知 ops。系统内部 insert(报告就绪等);用户列/读。
 *
 * PRIV01-C 应用层 tenant 强制第二层（纵深防御 · 授权根仍为 PG RLS / asPrincipal+set_config）：
 * 用户列/读/写四个入口显式绑定 owner 必选谓词（buildRequiredOwnerFilter — required predicate,
 * not an optional filter hint）。RLS 限己语义不变；显式谓词为第二防御层（应用层 tenant ≠ RLS，
 * must not silently replace the auth root）。insertNotification 为系统内部插入（worker/报告就绪
 * lane），不在本刀接线面（residual · PRIV01 第二波 db 层）。
 */
import type { PoolClient as Client } from 'pg';
import { buildRequiredOwnerFilter } from '../tenant/index.ts';

export async function insertNotification(c: Client, owner: string, id: string, kind: string, payload: unknown): Promise<void> {
  await c.query('INSERT INTO notification(id, owner_user_id, kind, payload) VALUES ($1,$2,$3,$4)', [id, owner, kind, JSON.stringify(payload)]);
}
export async function listNotifications(c: Client, owner: string, limit = 20): Promise<{ id: string; kind: string; payload: any; read: boolean }[]> {
  const f = buildRequiredOwnerFilter(owner, 'notification.list');
  const r = await c.query('SELECT id, kind, payload, read FROM notification WHERE owner_user_id=$2 ORDER BY created_at DESC LIMIT $1', [limit, f.value]);
  return r.rows;
}
export async function markNotificationRead(c: Client, owner: string, id: string): Promise<boolean> {
  const f = buildRequiredOwnerFilter(owner, 'notification.read');
  const r = await c.query('UPDATE notification SET read=true WHERE id=$1 AND owner_user_id=$2', [id, f.value]);
  return r.rowCount === 1; // E5: 单 id 写 0 行 → false → 服务层 404 not_found（fail-closed，不静默转成功）
}
export async function unreadCount(c: Client, owner: string): Promise<number> {
  const f = buildRequiredOwnerFilter(owner, 'notification.unread');
  const r = await c.query('SELECT count(*)::int n FROM notification WHERE read=false AND owner_user_id=$1', [f.value]);
  return r.rows[0].n;
}
/** 全部标记已读(RLS 限己 + 显式 owner 谓词第二层)。返回标记数。 */
export async function markAllNotificationsRead(c: Client, owner: string): Promise<number> {
  const f = buildRequiredOwnerFilter(owner, 'notification.readAll');
  const r = await c.query('UPDATE notification SET read=true WHERE read=false AND owner_user_id=$1', [f.value]);
  return r.rowCount ?? 0;
}
