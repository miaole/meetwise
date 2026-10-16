'use server';
import { serverFetch } from '@/lib/api/server';

export type CreateJobActionResult = { ok: true } | { ok: false; message: string };
/** I3 JOB-MGMT：带可选反馈文案的动作结果（重试路由幂等门 already_* 需在成功态携带诚实说明）。 */
export type JobMutationActionResult = { ok: boolean; message?: string };

/** 发布岗位(B 端,多租户):服务端读 cookie 加 Bearer → POST /recruiter/jobs(契约校验 title≥2)。 */
export async function createJobAction(formData: FormData): Promise<CreateJobActionResult> {
  const title = String(formData.get('title') ?? '').trim();
  if (title.length < 2) return { ok: false, message: '岗位名称至少需要 2 个字符。' };
  const idempotencyKey = String(formData.get('idempotencyKey') ?? '').trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idempotencyKey))
    return { ok: false, message: '请求标识无效，请刷新页面后重试。' };
  const competencies = String(formData.get('competencies') ?? '')
    .split(/[,，]/).map((s) => s.trim()).filter(Boolean);
  // I3 JOB-MGMT（#258）：岗位描述(JD) 随表单透传——后端 CreateJobDto 早已支持（≤8000 字），仅表单此前缺失。
  const description = String(formData.get('description') ?? '').trim();
  try {
    // Do not make a mutation Action wait for an RSC invalidation/render. Under a real mobile browser this could
    // leave the client transition permanently pending after the API write had already committed. The form performs
    // one authoritative no-store navigation after this small typed result returns.
    const res = await serverFetch('/recruiter/jobs', {
      method: 'POST',
      headers: { 'idempotency-key': idempotencyKey },
      body: JSON.stringify(description ? { title, description, competencies } : { title, competencies }),
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
 * I3 JOB-MGMT（裁决①）：编辑岗位——服务端读 cookie 加 Bearer → PATCH /recruiter/jobs/:id。
 * 语义字段（title/description/competencies）真变化时后端自动写新 revision（route_pending）并走既有 drain 重路由。
 * 返回 {ok,msg} 供客户端组件渲染反馈。
 */
export async function updateJobAction(formData: FormData): Promise<CreateJobActionResult> {
  const jobId = String(formData.get('jobId') ?? '').trim();
  if (!jobId) return { ok: false, message: '缺少岗位标识。' };
  const title = String(formData.get('title') ?? '').trim();
  if (title.length < 2) return { ok: false, message: '岗位名称至少需要 2 个字符。' };
  const description = String(formData.get('description') ?? '').trim();
  const competencies = String(formData.get('competencies') ?? '')
    .split(/[,，]/).map((s) => s.trim()).filter(Boolean);
  try {
    const res = await serverFetch(`/recruiter/jobs/${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, description, competencies }),
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 404) return { ok: false, message: '岗位不存在或无权编辑。' };
    if (!res.ok) return { ok: false, message: '编辑失败，请稍后重试。' };
    return { ok: true };
  } catch {
    return { ok: false, message: '网络暂不可用，请稍后重试。' };
  }
}

/** I3 JOB-MGMT（裁决①）：下线岗位——POST /recruiter/jobs/:id/close（仅 open 可关；closed 再关同 404 壳·无存在性信号）。 */
export async function closeJobAction(jobId: string): Promise<CreateJobActionResult> {
  if (!jobId.trim()) return { ok: false, message: '缺少岗位标识。' };
  try {
    const res = await serverFetch(`/recruiter/jobs/${jobId}/close`, {
      method: 'POST',
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 404) return { ok: false, message: '岗位不存在、已下线或无权操作。' };
    if (!res.ok) return { ok: false, message: '下线失败，请稍后重试。' };
    return { ok: true };
  } catch {
    return { ok: false, message: '网络暂不可用，请稍后重试。' };
  }
}

/**
 * I3 JOB-MGMT（#219·裁决③）：显式重试路由——POST /recruiter/jobs/:id/route-retry。
 * 重试=以当前岗位内容写新 revision（route_pending）走既有 drain；sticky 终态本体零改，无界自动重试被 Ban，
 * 本动作是招聘方显式且可计数的一次投递。already_* 为幂等门：非未决态不制造空 revision。
 */
export async function retryJobRouteAction(jobId: string): Promise<JobMutationActionResult> {
  if (!jobId.trim()) return { ok: false, message: '缺少岗位标识。' };
  try {
    const res = await serverFetch(`/recruiter/jobs/${jobId}/route-retry`, {
      method: 'POST',
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 404) return { ok: false, message: '岗位不存在或无权操作。' };
    if (!res.ok) return { ok: false, message: '重试失败，请稍后重试。' };
    const body = (await res.json().catch(() => null)) as { status?: string } | null;
    if (body?.status === 'already_pending') return { ok: true, message: '路由已在队列中，无需重复重试。' };
    if (body?.status === 'already_decided') return { ok: true, message: '路由已就绪，无需重试。' };
    if (body?.status === 'not_retryable') return { ok: true, message: '路由分类进行中，请稍后刷新查看。' };
    return { ok: true, message: '已提交重路由，稍后自动完成。' };
  } catch {
    return { ok: false, message: '网络暂不可用，请稍后重试。' };
  }
}

/**
 * 邀请候选人面试(B 端企业纵深):服务端读 cookie 加 Bearer → POST /recruiter/jobs/:id/invite。
 * 页面只呈现最小流程状态，不以本说明宣称云端隔离、人工审核工单或招聘决策能力。候选人邮箱由后端解析为用户 id。
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
  // b110:404 分支退役——恒定壳后 404 仅剩「岗位不存在/非自有」(归属预检前置),候选人存在性零信号,
  // 不再区分候选人(反枚举);404 落入通用失败文案。400 分支保留(参数无效)。
  if (res.status === 400) return { ok: false, msg: '不能邀请自己 / 参数无效' };
  if (!res.ok) return { ok: false, msg: '邀请失败:' + res.status };
  // b110 受理文案中性化:恒定壳下不宣称邀请已送达/候选人存在;真实受理状态以租户内 candidates 列表为准。
  return { ok: true, msg: '已受理；若对方是注册求职者将收到邀请' };
}
