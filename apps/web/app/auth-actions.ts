'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * 鉴权 Server Actions(变更跑在服务端,表单无需客户端 fetch)。成功 → 设 **httpOnly cookie**(防 XSS 偷令牌)→ 服务端跳转。
 * 这是 App Router 的 Server Action 能力:`<form action={loginAction}>`,提交直接进服务端,RSC 立刻能用 cookie 取数。
 */
const API_BASE = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';

/** 单 action:从表单的提交按钮 name="mode" 读 login/signup(useActionState 友好)。 */
export async function authAction(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const mode = formData.get('mode') === 'signup' ? 'signup' : 'login';
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const role = formData.get('role') === 'recruiter' ? 'recruiter' : 'candidate';   // 注册时选的身份
  if (!email || !password) return { error: '请填邮箱和密码' };
  let body: any = {};
  try {
    const payload = mode === 'signup' ? { email, password, role } : { email, password };
    const res = await fetch(`${API_BASE}/auth/${mode}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    body = await res.json().catch(() => ({}));
    if (!res.ok || !body.token) return { error: '失败:' + (body.error ?? res.status) };
  } catch { return { error: '网络错误,请确认 API 已启动' }; }
  // b110 招聘方审核制(R1 双通道即时侧):signup 模式读 body approvalStatus——recruiter 注册落审核队列,
  // token 虽照发但不在此建会话/不进 /recruiter/jobs 死胡同,分流审核中反馈;approve 后正常登录即可
  // (login 模式无此字段,靠 B 端 API 403 分码感知,晚一跳 UX 让步)。禁新增后端面,渲染落在既有表单状态位。
  if (mode === 'signup' && body.approvalStatus === 'pending') {
    return { error: '招聘方注册已提交:账户进入管理员审核队列,审核通过后即可登录使用招聘方功能。' };
  }
  const c = await cookies();
  c.set('mw_token', body.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 24 * 3600 });
  // mw_role 非 httpOnly:供 Nav/路由按角色渲染(非敏感;真实权限仍由 token + 后端 RLS 把关)。
  const effectiveRole = body.role ?? role;
  c.set('mw_role', effectiveRole, { secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 24 * 3600 });
  // **清整个 layout 树的 Router Cache**:否则 Nav(在 layout 里读 cookie 判登录态)在之前访问过的缓存路由上仍显示登出态 → 页面与登录态不一。redirect 前调(redirect 会 throw)。
  revalidatePath('/', 'layout');
  redirect(effectiveRole === 'recruiter' ? '/recruiter/jobs' : '/dashboard');   // 按角色进不同首页
}

export async function logoutAction(): Promise<void> {
  const c = await cookies();
  c.delete('mw_token');
  c.delete('mw_role');
  revalidatePath('/', 'layout');   // 同理:登出后清 layout 缓存,否则缓存路由的 Nav 仍显示已登录态
  redirect('/login');
}
