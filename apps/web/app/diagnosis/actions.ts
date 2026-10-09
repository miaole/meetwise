'use server';
import { serverFetch } from '../../lib/api/server';
import { redirect } from 'next/navigation';
import { actionErrorMessage } from '../../lib/errors/action-error';

/** Server Action:选简历(+可选目标岗位)→ POST /diagnosis 创建 → /begin 启动诊断 → 服务端跳转进诊断页。对齐 startQuizAction。 */
export async function startDiagnosisAction(formData: FormData) {
  const resumeId = String(formData.get('resumeId') ?? '');
  const targetRole = String(formData.get('targetRole') ?? '').trim();
  if (!resumeId) return;
  const created = await serverFetch('/diagnosis', { method: 'POST', body: '{}' });
  if (created.status === 401) redirect('/login?expired=1');
  if (!created.ok) redirect('/diagnosis?error=create_failed');     // 创建失败 → 回列表带错(不抛白屏/不进 /diagnosis/undefined)
  const { diagnosisId } = await created.json().catch(() => ({ diagnosisId: undefined }));
  if (!diagnosisId) redirect('/diagnosis?error=create_failed');
  const headers: Record<string, string> = { 'resume-id': resumeId };
  if (targetRole) headers['target-role'] = targetRole;
  const begin = await serverFetch('/diagnosis/' + diagnosisId + '/begin', { method: 'POST', headers });
  if (begin.status === 402) redirect('/diagnosis?error=credits_unavailable');
  if (!begin.ok) {
    // begin 非 2xx（除已处理的 402）也必须回列表带错——禁止带着未预留的空壳进会话页（沿 interviews/actions 纪律）。
    // 码透传必达页面不折叠丢失；不可解析/未映射 → create_failed 兜底（rev2 E2：interviews 专属 begin_failed 文案不跨页）。
    const body: { error?: unknown } = await begin.json().catch(() => ({}));
    const raw = typeof body.error === 'string' ? body.error : '';
    const code = raw !== '' && actionErrorMessage('diagnosis', 0, raw) ? raw : 'create_failed';
    redirect(`/diagnosis?error=${encodeURIComponent(code)}`);
  }
  redirect('/diagnosis/' + diagnosisId);
}
