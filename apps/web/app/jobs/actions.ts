'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api/server';
import { applicationStartFailureMessage, applicationStartRedirectError } from '@/lib/jobs/application-start-error';
// SSE-RESILIENCE #61(W5,C8)：ensureOk 单源抽至 lib/jobs/ensure-ok.ts(纯模块,prove4 可导入断言 401→NEXT_REDIRECT);
// 401 → /login?expired=1 与 serverGet:30 逐字对齐。:18/:50 调用点自动受益。
import { ensureOk } from '@/lib/jobs/ensure-ok';

/** 候选人投递岗位(C 端):服务端读 cookie 加 Bearer → POST /jobs/:id/apply(岗位已关闭/不存在 → 404)。投递后刷新岗位广场。 */
export async function applyAction(jobId: string) {
  if (!jobId) return;
  const res = await serverFetch(`/jobs/${jobId}/apply`, { method: 'POST' });
  ensureOk(res, 'apply', [409]);   // 409 已投递:UI 已防重复入口,容忍
  revalidatePath('/jobs');
}

/** 候选人开始受邀面试(状态机 invited→in_progress):刷新"我的投递"。岗位面试=企业支付(B271 片2 起·S2-C4 合一)·练习面试=候选人额度。 */
export async function startApplicationAction(appId: string, formData: FormData) {
  if (!appId) return;
  const resumeId = String(formData.get('resumeId') ?? '');
  if (!resumeId) throw new Error('resume_required_for_application_interview');
  const res = await serverFetch(`/applications/${appId}/start`, { method: 'POST', body: JSON.stringify({ resumeId }) });
  if (res.status === 401) redirect('/login?expired=1');   // #61 W5:内联同面,过期同跳登录
  // B271 片2 S2-C6：start（已合一 begin）402=企业支付不可用 → 新分码 redirect（白名单 application-start-error.ts）；
  // 未知 402 分码回落 legacy interview_credits_unavailable（C 端 402 语义零改·防御面）。
  if (res.status === 402) {
    const b402 = await res.json().catch(() => ({} as { error?: string }));
    redirect(`/jobs?error=${applicationStartRedirectError(b402?.error)}`);
  }
  const body = await res.json().catch(() => ({} as { redirectTo?: string; interviewId?: string; error?: string }));
  if (!res.ok) {
    const msg = applicationStartFailureMessage(res.status, body);
    // Surface the specific 409 subclass in logs so UI-409 gaps are diagnosable (not status-only).
    console.error('[application_start_failed]', { status: res.status, message: msg, body });
    throw new Error(msg);
  }
  if (!body.redirectTo || typeof body.redirectTo !== 'string' || !body.interviewId || typeof body.interviewId !== 'string') throw new Error('application_start_missing_interview_binding');
  // B271 片2 S2-C4（修法⑤·#227 收口）：begin 已并入 /applications/:id/start 同一服务端事务
  // （企业预留与申请状态迁移原子提交·候选人零扣）——两跳 begin 独立调用删除（#227 缺陷=begin 402
  // 后申请悬停 in_progress，合一后不可能）。redirectTo 由 API 从已落库的 application binding 生成，
  // 包含唯一 interviewId；不由浏览器拼接可替换的历史会话 ID。
  redirect(body.redirectTo);
}

/** 候选人婉拒邀请(状态机 invited→declined,终态):刷新"我的投递"。无死胡同——受邀后给出明确出口。 */
export async function declineApplicationAction(appId: string) {
  if (!appId) return;
  const res = await serverFetch(`/applications/${appId}/decline`, { method: 'POST' });
  ensureOk(res, 'apply', [409]);
  revalidatePath('/jobs');
}
