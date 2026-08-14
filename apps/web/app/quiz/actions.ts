'use server';
import { serverFetch } from '../../lib/api/server';
import { redirect } from 'next/navigation';

/** Server Action:选简历 → POST /quiz 创建 → /begin(resume-id 头)启动押题 → 服务端跳转进押题页。 */
export async function startQuizAction(formData: FormData) {
  const resumeId = String(formData.get('resumeId') ?? '');
  if (!resumeId) return;
  const created = await serverFetch('/quiz', { method: 'POST', body: '{}' });
  if (created.status === 401) redirect('/login?expired=1');
  if (!created.ok) redirect('/quiz?error=create_failed');           // 创建失败 → 回列表带错(不抛白屏/不进 /quiz/undefined)
  const { quizId } = await created.json().catch(() => ({ quizId: undefined }));
  if (!quizId) redirect('/quiz?error=create_failed');
  const begin = await serverFetch('/quiz/' + quizId + '/begin', { method: 'POST', headers: { 'resume-id': resumeId } });
  if (begin.status === 402) redirect('/quiz?error=credits_unavailable');
  redirect('/quiz/' + quizId);
}
