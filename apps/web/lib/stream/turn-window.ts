/**
 * 长会话只能保留一个固定大小的 DOM 窗口。第一页永远是最新内容，
 * 用户查看历史时窗口整体平移而不是不断追加，因而 10,000 条历史也不会变成 10,000 个 React 子树。
 */
export const VISIBLE_TURN_LIMIT = 80;

export interface TurnWindow {
  page: number;
  maxPage: number;
  start: number;
  end: number;
  size: number;
}

export function interviewTurnWindow(total: number, requestedPage: number, limit = VISIBLE_TURN_LIMIT): TurnWindow {
  const safeTotal = Math.max(0, Math.floor(total));
  const safeLimit = Math.max(1, Math.floor(limit));
  const maxPage = Math.max(0, Math.ceil(safeTotal / safeLimit) - 1);
  const page = Math.min(maxPage, Math.max(0, Math.floor(requestedPage)));
  const end = Math.max(0, safeTotal - page * safeLimit);
  const start = Math.max(0, end - safeLimit);
  return { page, maxPage, start, end, size: end - start };
}
