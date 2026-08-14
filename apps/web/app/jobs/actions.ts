'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api/server';

/** 硬失败统一出口:额度不足(402)→ 明确不可用;其余非 ok(且不在容忍集)→ 抛错落根错误边界(可读 + 重试),
 *  绝不静默 revalidate 让按钮"点了没反应"。容忍集 tolerate:幂等/竞态类(如已投递 409)无需打扰用户。 */
function ensureOk(res: Response, need: string, tolerate: number[] = []) {
  if (res.status === 402) redirect(`/jobs?error=${need}_credits_unavailable`);
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
export async function startApplicationAction(appId: string, formData: FormData) {
  if (!appId) return;
  const resumeId = String(formData.get('resumeId') ?? '');
  if (!resumeId) throw new Error('resume_required_for_application_interview');
  const res = await serverFetch(`/applications/${appId}/start`, { method: 'POST', body: JSON.stringify({ resumeId }) });
  if (res.status === 402) redirect('/jobs?error=interview_credits_unavailable');
  if (!res.ok) throw new Error(`application_start_failed_${res.status}`);
  const body = await res.json().catch(() => ({} as { redirectTo?: string; interviewId?: string }));
  if (!body.redirectTo || typeof body.redirectTo !== 'string' || !body.interviewId || typeof body.interviewId !== 'string') throw new Error('application_start_missing_interview_binding');
  // 绑定创建与通用面试启动分层：前者在 application 行锁事务内原子完成；后者复用既有 begin 的额度 saga。
  // begin 自身以 interviewId 幂等，网络重试/刷新绝不重复 reserve 或入队。
  const begun = await serverFetch(`/interview/${encodeURIComponent(body.interviewId)}/begin`, { method: 'POST', headers: { 'resume-id': resumeId } });
  if (begun.status === 402) redirect('/jobs?error=interview_credits_unavailable');
  if (!begun.ok) throw new Error(`application_interview_begin_failed_${begun.status}`);
  // redirectTo 由 API 从已落库的 application binding 生成，包含唯一 interviewId；不由浏览器拼接可替换的历史会话 ID。
  redirect(body.redirectTo);
}

/** 候选人婉拒邀请(状态机 invited→declined,终态):刷新"我的投递"。无死胡同——受邀后给出明确出口。 */
export async function declineApplicationAction(appId: string) {
  if (!appId) return;
  const res = await serverFetch(`/applications/${appId}/decline`, { method: 'POST' });
  ensureOk(res, 'apply', [409]);
  revalidatePath('/jobs');
}
