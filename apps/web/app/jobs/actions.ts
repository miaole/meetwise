'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api/server';

/** 硬失败统一出口:额度不足(402)→ 引导购买;其余非 ok(且不在容忍集)→ 抛错落根错误边界(可读 + 重试),
 *  绝不静默 revalidate 让按钮"点了没反应"。容忍集 tolerate:幂等/竞态类(如已投递 409)无需打扰用户。 */
function ensureOk(res: Response, need: string, tolerate: number[] = []) {
  if (res.status === 402) redirect(`/billing?need=${need}`);
  if (!res.ok && !tolerate.includes(res.status)) throw new Error(`action_failed_${res.status}`);
}

/** 候选人投递岗位(C 端):服务端读 cookie 加 Bearer → POST /jobs/:id/apply(岗位已关闭/不存在 → 404)。投递后刷新岗位广场。 */
export async function applyAction(jobId: string) {
  if (!jobId) return;
  const res = await serverFetch(`/jobs/${jobId}/apply`, { method: 'POST' });
  ensureOk(res, 'apply', [409]);   // 409 已投递:UI 已防重复入口,容忍
  revalidatePath('/jobs');
}

/** 候选人开始受邀面试(状态机 invited→in_progress):刷新"我的投递"。面试本体走通用面试引擎(候选人用自己额度)。 */
export async function startApplicationAction(appId: string) {
  if (!appId) return;
  const res = await serverFetch(`/applications/${appId}/start`, { method: 'POST' });
  ensureOk(res, 'interview', [409]);
  revalidatePath('/jobs');
}

/** 候选人婉拒邀请(状态机 invited→declined,终态):刷新"我的投递"。无死胡同——受邀后给出明确出口。 */
export async function declineApplicationAction(appId: string) {
  if (!appId) return;
  const res = await serverFetch(`/applications/${appId}/decline`, { method: 'POST' });
  ensureOk(res, 'apply', [409]);
  revalidatePath('/jobs');
}
