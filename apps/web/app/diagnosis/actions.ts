'use server';
import { serverFetch } from '../../lib/api/server';
import { redirect } from 'next/navigation';

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
  // 额度不足(402)→ 引导去购买,不静默失败(无死胡同)。
  if (begin.status === 402) redirect('/billing?need=diagnosis');
  redirect('/diagnosis/' + diagnosisId);
}
