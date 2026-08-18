'use server';
import { serverFetch } from '@/lib/api/server';

export type CreateJobActionResult = { ok: true } | { ok: false; message: string };

/** 发布岗位(B 端,多租户):服务端读 cookie 加 Bearer → POST /recruiter/jobs(契约校验 title≥2)。 */
export async function createJobAction(formData: FormData): Promise<CreateJobActionResult> {
  const title = String(formData.get('title') ?? '').trim();
  if (title.length < 2) return { ok: false, message: '岗位名称至少需要 2 个字符。' };
  const idempotencyKey = String(formData.get('idempotencyKey') ?? '').trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idempotencyKey))
    return { ok: false, message: '请求标识无效，请刷新页面后重试。' };
  const competencies = String(formData.get('competencies') ?? '')
    .split(/[,，]/).map((s) => s.trim()).filter(Boolean);
  try {
    // Do not make a mutation Action wait for an RSC invalidation/render. Under a real mobile browser this could
    // leave the client transition permanently pending after the API write had already committed. The form performs
    // one authoritative no-store navigation after this small typed result returns.
    const res = await serverFetch('/recruiter/jobs', {
      method: 'POST',
      headers: { 'idempotency-key': idempotencyKey },
      body: JSON.stringify({ title, competencies }),
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 409) return { ok: false, message: '请求标识与另一份岗位内容冲突，请刷新页面后重试。' };
    if (!res.ok) return { ok: false, message: '发布失败，请稍后重试。' };
    return { ok: true };
  } catch {
    return { ok: false, message: '网络暂不可用，请稍后重试。' };
  }
}

/**
 * 邀请候选人面试(B 端企业纵深):服务端读 cookie 加 Bearer → POST /recruiter/jobs/:id/invite。
 * 页面只呈现最小流程状态与人工复核提示，不以本说明宣称云端隔离或招聘决策能力。候选人邮箱由后端解析为用户 id。
 * 返回 {ok,msg} 给 useActionState 渲染反馈(无死胡同:成功/未找到/失败都有文案)。
 */
export async function inviteCandidateAction(_prev: { ok?: boolean; msg?: string }, formData: FormData): Promise<{ ok?: boolean; msg?: string }> {
  const jobId = String(formData.get('jobId') ?? '').trim();
  const candidateEmail = String(formData.get('candidateEmail') ?? '').trim().toLowerCase();
  if (!jobId || !candidateEmail) return { ok: false, msg: '请填写候选人邮箱' };
  let res: Response;
  try {
    // The dialog has its own action-state acknowledgement. Avoid coupling it to an unrelated RSC rerender; the
    // next navigation/reload is authoritative and the API mutation is idempotent at the application boundary.
    res = await serverFetch(`/recruiter/jobs/${jobId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ candidateEmail }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch { return { ok: false, msg: '网络错误,请确认 API 已启动' }; }
  if (res.status === 404) return { ok: false, msg: '未找到该候选人(需对方已注册为求职者)' };
  if (res.status === 400) return { ok: false, msg: '不能邀请自己 / 参数无效' };
  if (!res.ok) return { ok: false, msg: '邀请失败:' + res.status };
  return { ok: true, msg: '已邀请，候选人将用同一引擎面试；评分校准完成前你只会看到状态与人工复核提示（不含面试内容）' };
}
