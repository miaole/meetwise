'use server';
import { serverFetch } from '../../../lib/api/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Server Action:重试报告生成。#229 D2:读返回码,非 2xx **不再静默吞**——
 * redirect `?retry_error=<code>` 让页面渲染明确提示(429 report_retry_limited / 404 no_retriable_report);
 * 成功路径 revalidatePath 原样。redirect 抛 NEXT_REDIRECT,必须在 try/catch 之外传播(吞掉会死循环回本页)。
 */
export async function retryReportAction(id: string) {
  let errorCode: string | null = null;
  try {
    const r = await serverFetch('/interview/' + id + '/report/retry', { method: 'POST' });
    if (!r.ok) {
      errorCode = 'report_retry_failed';
      try {
        const b = (await r.json()) as { error?: string };
        if (b?.error) errorCode = b.error;   // 透传 API 业务码(report_retry_limited / no_retriable_report)
      } catch { /* 响应体非 JSON → 用通用码 */ }
    }
  } catch {
    errorCode = 'report_retry_failed';   // 网络层失败也如实提示(不吞)
  }
  if (errorCode) redirect('/report/' + id + '?retry_error=' + encodeURIComponent(errorCode));
  revalidatePath('/report/' + id);
}

/** Server Action:仅刷新(重新拉取服务端状态),用于「生成中」轮询式手动刷新。 */
export async function refreshReportAction(id: string) {
  revalidatePath('/report/' + id);
}
