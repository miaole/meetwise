import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * 服务端取数(RSC / Server Action 用):从 **httpOnly cookie** 读令牌 → 带 Bearer 调 api。
 * 这正是 App Router 的核心——数据在服务端拉、HTML 服务端渲染,首屏快、少客户端 JS、可流式。
 * 客户端 localStorage 读不到 httpOnly cookie(防 XSS 偷令牌),所以服务端取数必须走这里。
 */
const API_BASE = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';

export async function getServerToken(): Promise<string | undefined> {
  return (await cookies()).get('mw_token')?.value;
}

export async function serverFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getServerToken();
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  // **只在有 body 时才声明 json content-type**:无 body 的 POST(如 /begin)若带 json content-type,
  // Fastify 会把空体当非法 JSON → 400(而非业务码 402)——曾导致"开始面试"经 UI 永远 400→进死会话页/不提示额度。真测才抓到。
  if (init.body != null && headers['content-type'] === undefined) headers['content-type'] = 'application/json';
  if (token) headers['authorization'] = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, { ...init, headers, cache: 'no-store' });   // 用户态数据不缓存
}

/** 服务端 GET JSON。401(令牌过期)→ 跳登录(不把过期当"暂不可用"假死,修审计 #3);其余失败返 null 让 RSC 降级渲染。 */
export async function serverGet<T = unknown>(path: string): Promise<T | null> {
  let r: Response;
  try { r = await serverFetch(path); } catch { return null; }      // 网络层失败 → 降级
  if (r.status === 401) redirect('/login?expired=1');               // redirect 抛 NEXT_REDIRECT,需在 try 外传播
  if (!r.ok) return null;
  try { return (await r.json()) as T; } catch { return null; }
}
