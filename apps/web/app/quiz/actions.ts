'use server';
import { serverFetch } from '../../lib/api/server';
import { redirect } from 'next/navigation';
import { actionErrorMessage } from '../../lib/errors/action-error';

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
  if (!begin.ok) {
    // begin 非 2xx（除已处理的 402）也必须回列表带错——禁止带着未预留的空壳进会话页（沿 interviews/actions 纪律）。
    // 码透传必达页面不折叠丢失；不可解析/未映射 → create_failed 兜底（rev2 E2：interviews 专属 begin_failed 文案不跨页）。
    const body: { error?: unknown } = await begin.json().catch(() => ({}));
    const raw = typeof body.error === 'string' ? body.error : '';
    const code = raw !== '' && actionErrorMessage('quiz', 0, raw) ? raw : 'create_failed';
    redirect(`/quiz?error=${encodeURIComponent(code)}`);
  }
  redirect('/quiz/' + quizId);
}
