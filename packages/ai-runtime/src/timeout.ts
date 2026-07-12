/**
 * 超时原语（北极星:快速恢复)。外部依赖慢/挂 → 不无限等,到点中断 → 降级。
 *  - withTimeout: 给任意 Promise 加超时(到点 reject + 回调清理)。
 *  - timeoutSignal: 给 fetch 用的 AbortSignal,到点 abort(连接真断,不只逻辑放弃)。
 */
export async function withTimeout<T>(p: Promise<T>, ms: number, onTimeout?: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => { onTimeout?.(); reject(new Error('timeout')); }, ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

/** fetch 超时:返回 { signal, clear }。到 ms 自动 abort(底层连接断)。用完 clear() 清定时器。 */
export function timeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(t) };
}

/** 带超时的 fetch:外部依赖统一护栏,到点 abort,不无限挂。 */
export async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = Number(process.env.HTTP_TIMEOUT_MS ?? 30_000)): Promise<Response> {
  const to = timeoutSignal(ms);
  try { return await fetch(url, { ...init, signal: to.signal }); }
  finally { to.clear(); }
}
