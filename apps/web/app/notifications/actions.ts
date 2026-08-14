'use server';
/** 通知页 Server Actions:标记已读后 revalidate,触发 RSC 重新拉取最新计数/列表。 */
import { serverFetch } from '../../lib/api/server';
import { revalidatePath } from 'next/cache';

export async function markAllReadAction() {
  const res = await serverFetch('/notifications/read-all', { method: 'POST' });
  if (!res.ok) throw new Error(`mark_read_failed_${res.status}`);   // 不静默:失败落根错误边界(可读+重试),不让"点了没反应"
  revalidatePath('/notifications');
}

export async function markReadAction(id: string) {
  const res = await serverFetch('/notifications/' + id + '/read', { method: 'POST' });
  if (!res.ok) throw new Error(`mark_read_failed_${res.status}`);   // 同上:不静默吞掉失败
  revalidatePath('/notifications');
}
