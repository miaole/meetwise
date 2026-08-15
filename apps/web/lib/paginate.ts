/**
 * 服务端列表"加载更多"窗口(极端场景:无界长列表)。
 *
 * 设计取舍:后端列表接口当前不保证 offset/cursor 分页,若在服务端按 limit 截断**再向后端要下一页**会有丢行风险
 * (后端忽略未知 query 时返回全量;强制 limit 时又无游标拿剩余)。因此这里在**已取全量、且已被 API/RLS 限定**的数组上
 * 做窗口化:只渲染前 `limit` 行,"加载更多"用 `?limit` 自增的链接驱动 RSC 重渲染(`scroll={false}` 保位)。
 * 这样:① 初始 DOM 行数有界(500+ 行不会一次性渲染 → 消除布局/绘制卡顿);② 永不丢行(切片发生在完整数组上,
 * 增大 limit 只会揭示更多);③ 不改 RLS、不加客户端 bundle、Server Action 行仍是服务端渲染。
 */
export function listWindow<T>(items: readonly T[], rawLimit: string | undefined, pageSize: number) {
  const parsed = rawLimit != null ? Number(rawLimit) : NaN;
  const limit = Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), items.length || 1) : pageSize;
  const shown = items.slice(0, limit);
  const remaining = items.length - shown.length;
  return { shown, hasMore: remaining > 0, remaining, nextLimit: limit + pageSize, total: items.length };
}

/** 在保留现有 query 参数的前提下,生成把分页键(默认 `limit`)设为 `nextLimit` 的链接。
 *  `key` 可换成别的键(如同页第二个列表用 `alimit`),并把 `current` 里的同名旧值丢弃后重设。 */
export function withLimitHref(base: string, current: Record<string, string | undefined>, nextLimit: number, key = 'limit'): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) if (v && k !== key) q.set(k, v);
  q.set(key, String(nextLimit));
  return `${base}?${q.toString()}`;
}
