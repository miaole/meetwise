import 'server-only';
import { redirect } from 'next/navigation';

/**
 * 岗位页 Server Action 硬失败统一出口（#61/W5,C8）。
 * SSE-RESILIENCE：401(会话过期)→ 跳 `/login?expired=1`——与 serverGet(lib/api/server.ts:30)逐字对齐,
 * 过期不再抛 action_failed_401 落根错误边界只见"出错了"。402(额度不足)→ 明确不可用;
 * 其余非 ok(且不在容忍集)→ 抛错落根错误边界(可读 + 重试),绝不静默 revalidate 让按钮"点了没反应"。
 * 容忍集 tolerate:幂等/竞态类(如已投递 409)无需打扰用户。
 *
 * server-only 标注：客户端误 import 本模块=构建期硬失败(next 打包面走内建 alias·零包安装);
 * web prove 经 test/server-only-hooks.mjs 窄桩可导入(tsx 裸解析面拦截),redirect 语义与调用点零改——
 * redirect 仍来自真 next/navigation(抛 NEXT_REDIRECT),prove 依旧真实断言 401 分支。
 */
export function ensureOk(res: Response, need: string, tolerate: number[] = []) {
  if (res.status === 401) redirect('/login?expired=1');
  if (res.status === 402) redirect(`/jobs?error=${need}_credits_unavailable`);
  if (!res.ok && !tolerate.includes(res.status)) throw new Error(`action_failed_${res.status}`);
}
