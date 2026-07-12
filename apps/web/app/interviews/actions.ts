'use server';
import { serverFetch } from '../../lib/api/server';
import { redirect } from 'next/navigation';

/** Server Action:选简历 → POST /interview 创建 → /begin(resume-id 头)启动 → 服务端跳转进会话。
 *  对齐 startQuizAction:逐步校验,失败给明确出口(回列表带错 / 去登录 / 去购买),
 *  绝不静默跳进 /interview/undefined 这种死会话页(无死胡同)。 */
export async function startInterviewAction(formData: FormData) {
  const resumeId = String(formData.get('resumeId') ?? '');
  if (!resumeId) return;
  const created = await serverFetch('/interview', { method: 'POST', body: '{}' });
  if (created.status === 401) redirect('/login?expired=1');
  if (!created.ok) redirect('/interviews?error=create_failed');          // 创建失败 → 回列表带错,不进 /interview/undefined
  const { interviewId } = await created.json().catch(() => ({ interviewId: undefined }));
  if (!interviewId) redirect('/interviews?error=create_failed');
  const begin = await serverFetch('/interview/' + interviewId + '/begin', { method: 'POST', headers: { 'resume-id': resumeId } });
  if (begin.status === 402) redirect('/billing?need=interview');         // 额度不足 → 引导购买,不静默失败
  redirect('/interview/' + interviewId);
}
