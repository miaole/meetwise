'use server';
import { serverFetch } from '../../lib/api/server';
import { redirect } from 'next/navigation';
import { actionErrorMessage } from '../../lib/errors/action-error';

/** Server Action:选简历(+可选目标岗位) → POST /quiz 创建 → /begin(resume-id 头,可选 target-role 头)启动押题 → 服务端跳转进押题页。 */
export async function startQuizAction(formData: FormData) {
  const resumeId = String(formData.get('resumeId') ?? '');
  // #230 目标岗位:trim 归一;空/缺省 → 不发 target-role 头(与现状逐字节一致)。镜像 interviews/actions 同形制。
  const targetRole = String(formData.get('targetRole') ?? '').trim();
  if (!resumeId) return;
  const created = await serverFetch('/quiz', { method: 'POST', body: '{}' });
  if (created.status === 401) redirect('/login?expired=1');
  if (!created.ok) redirect('/quiz?error=create_failed');           // 创建失败 → 回列表带错(不抛白屏/不进 /quiz/undefined)
  const { quizId } = await created.json().catch(() => ({ quizId: undefined }));
  if (!quizId) redirect('/quiz?error=create_failed');
  const headers: Record<string, string> = { 'resume-id': resumeId };
  if (targetRole) headers['target-role'] = targetRole;               // 非空才增头(空串不发头=现状字节,#230)
  const begin = await serverFetch('/quiz/' + quizId + '/begin', { method: 'POST', headers });
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
