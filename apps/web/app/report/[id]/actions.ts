'use server';
import { serverFetch } from '../../../lib/api/server';
import { revalidatePath } from 'next/cache';

/** Server Action:重试报告生成。失败也不抛崩整页——下一次渲染会拉到最新状态而优雅降级。 */
export async function retryReportAction(id: string) {
  try {
    await serverFetch('/interview/' + id + '/report/retry', { method: 'POST' });
  } catch {
    /* 降级:重试请求失败也不卡死,revalidate 后页面会重新拉状态 */
  }
  revalidatePath('/report/' + id);
}

/** Server Action:仅刷新(重新拉取服务端状态),用于「生成中」轮询式手动刷新。 */
export async function refreshReportAction(id: string) {
  revalidatePath('/report/' + id);
}
