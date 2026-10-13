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
// #64 错误码本地化映射（2026-10-12·5E）：后端码 → 用户可读文案；未登记码走状态码兜底文案
// （撤销旧 `'失败:' + body.error` 后端码直拼）。登记码与 API 侧 auth.service 抛出面对齐（invalid_credentials）。
const AUTH_ERROR_COPY: Record<string, string> = {
  invalid_credentials: '邮箱或密码不正确',
};

export async function authAction(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const mode = formData.get('mode') === 'signup' ? 'signup' : 'login';
  // AUTHZ-HARDEN 5A-1 簇①（#111）:web signup 同归一(trim+lower,与 API 端 normalizeEmail 同语义——API 侧仍为主闸,
  // 此处前置让大写/带空白输入在注册/登录两模式都一致归一;API 网关 0168 双闸兜底)。
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const role = formData.get('role') === 'recruiter' ? 'recruiter' : 'candidate';   // 注册时选的身份
  if (!email || !password) return { error: '请填邮箱和密码' };
  // #64 格式/长度前置提示（5E 2026-10-12·镜像 contracts Credentials：email 格式+≤254、password 8-128 位，
  // 防呆在网关前，省一跳 400）：
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { error: '邮箱格式不正确' };
  if (password.length < 8 || password.length > 128) return { error: '密码需 8-128 位' };
  let body: any = {};
  try {
    const payload = mode === 'signup' ? { email, password, role } : { email, password };
    // #64：fetch 超时（沿本文件 logoutAction 的 AbortSignal.timeout 既有形；10s 覆盖 argon2 校验+限流判定）。
    const res = await fetch(`${API_BASE}/auth/${mode}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10_000) });
    body = await res.json().catch(() => ({}));
    if (!res.ok || !body.token) {
      if (res.status === 429) return { error: '尝试过于频繁，请稍后再试' };
      const code = typeof body?.error === 'string' ? body.error : '';
      return { error: AUTH_ERROR_COPY[code] ?? `登录/注册未受理(${res.status})，请稍后重试` };
    }
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
  // AUTHZ-HARDEN 5A-1 #112:登出服务端化接线——持 cookie 令牌尽力调 POST /auth/logout 吊销当前 jti 会话
  // (服务端面;失败/无令牌/legacy 无 jti 令牌[revoked:false]都不阻断登出——客户端清 cookie 照做,两面如实分工)。
  const token = c.get('mw_token')?.value;
  if (token) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST', headers: { authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(3000),
      });
    } catch { /* 登出服务端吊销尽力而为:网络失败不阻断本地登出(如实:令牌若未吊销将活到 TTL/或为 legacy 形) */ }
  }
  c.delete('mw_token');
  c.delete('mw_role');
  revalidatePath('/', 'layout');   // 同理:登出后清 layout 缓存,否则缓存路由的 Nav 仍显示已登录态
  redirect('/login');
}
