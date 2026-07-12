'use server';
import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/api/server';

/** 发布岗位(B 端,多租户):服务端读 cookie 加 Bearer → POST /recruiter/jobs(契约校验 title≥2)。 */
export async function createJobAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  if (title.length < 2) return;
  const competencies = String(formData.get('competencies') ?? '')
    .split(/[,，]/).map((s) => s.trim()).filter(Boolean);
  const res = await serverFetch('/recruiter/jobs', { method: 'POST', body: JSON.stringify({ title, competencies }) });
  if (!res.ok) throw new Error(`create_job_failed_${res.status}`);   // 失败显式落错误边界,不静默 revalidate 让岗位"没发出去也没提示"
  revalidatePath('/recruiter/jobs');
}

/**
 * 邀请候选人面试(B 端企业纵深):服务端读 cookie 加 Bearer → POST /recruiter/jobs/:id/invite。
 * 用同一面试引擎,数据严格隔离(招聘方永不见候选人 transcript)。候选人邮箱→后端解析成用户 id。
 * 返回 {ok,msg} 给 useActionState 渲染反馈(无死胡同:成功/未找到/失败都有文案)。
 */
export async function inviteCandidateAction(_prev: { ok?: boolean; msg?: string }, formData: FormData): Promise<{ ok?: boolean; msg?: string }> {
  const jobId = String(formData.get('jobId') ?? '').trim();
  const candidateEmail = String(formData.get('candidateEmail') ?? '').trim().toLowerCase();
  if (!jobId || !candidateEmail) return { ok: false, msg: '请填写候选人邮箱' };
  let res: Response;
  try {
    res = await serverFetch(`/recruiter/jobs/${jobId}/invite`, { method: 'POST', body: JSON.stringify({ candidateEmail }) });
  } catch { return { ok: false, msg: '网络错误,请确认 API 已启动' }; }
  if (res.status === 404) return { ok: false, msg: '未找到该候选人(需对方已注册为求职者)' };
  if (res.status === 400) return { ok: false, msg: '不能邀请自己 / 参数无效' };
  if (!res.ok) return { ok: false, msg: '邀请失败:' + res.status };
  revalidatePath(`/recruiter/jobs/${jobId}`);
  revalidatePath('/recruiter/talent');
  return { ok: true, msg: '已邀请,候选人将用同一引擎面试,结果回填后你可见状态与评分(不含面试内容)' };
}
