/**
 * SSE-RESILIENCE #53（C1）：full-jitter 指数退避纯函数，三驱动（interview/quiz/diagnosis-stream）共用，
 * 杜绝三份复制粘贴漂移。生产钉值：base=500ms · factor=2 · cap=30s（注入 rand 可确定性单测）。
 *
 * full-jitter（AWS 架构博客口径）：delay = random(0, min(cap, base·factor^(attempt-1)))——
 * 随机化避免多客户端同拍重连的惊群；attempt 从 1 起，指数封顶 cap 后不再增长（永续慢速档同用此形状）。
 */

export interface JitteredBackoff {
  (attempt: number): number;
}

/**
 * SSE-RESILIENCE #53(W1①)·#54(W2)：浏览器/调用方恢复信号缝（三驱动共用,**注入式**——驱动保持无浏览器全局可单测）。
 * 注册回调返回 dispose;驱动在全部退出路径上 dispose（注记B）。
 * online：网络恢复 → 唤醒退避等待并重置退避;visible：回到前台 → 若在退避等待立即唤醒;
 * retry：手动重试（W2 去 reload 出口）→ 同 online（立即重连+重置退避,绝对上限不重置）。
 */
export interface ResumeSignals {
  onOnline(cb: () => void): () => void;
  onVisible(cb: () => void): () => void;
  onRetry(cb: () => void): () => void;
}

/** 缺省 no-op 实现：注册即返回空 dispose,回调永不触发。 */
export function noopResumeSignals(): ResumeSignals {
  return { onOnline: () => () => {}, onVisible: () => () => {}, onRetry: () => () => {} };
}

/** 干净 end（轮换/收尾）短固定重连间隔；连续无进展 clean end 计入失败预算前的宽限次数（补钉1,建议 5-10）。 */
export const CLEAN_END_RECONNECT_MS = 1_000;
export const CLEAN_END_NO_PROGRESS_BUDGET = 5;
/** 生产钉值：full-jitter 指数退避 base/cap 与慢速永续 cap 档。 */
export const SSE_BACKOFF_BASE_MS = 500;
export const SSE_BACKOFF_CAP_MS = 30_000;

/** full-jitter 指数退避。rand 缺省 Math.random；注入 rand=()=>0.5 等可得确定性包络。 */
export function jitteredBackoff(baseMs: number, factor: number, capMs: number, rand: () => number = Math.random): JitteredBackoff {
  return (attempt: number) => {
    const a = Number.isFinite(attempt) && attempt > 0 ? Math.floor(attempt) : 1;
    const ceiling = Math.min(capMs, baseMs * factor ** (a - 1));
    return Math.min(ceiling, Math.floor(rand() * (ceiling + 1)));   // [0, ceiling] 闭区间(rand=1 边界钳回 ceiling)
  };
}

/** cap 档慢速永续退避（#53 W1②：连续无进展耗尽转入慢速永续；#56 429 停升级慢速重试同用）。 */
export function capJitterBackoff(capMs: number, rand: () => number = Math.random): JitteredBackoff {
  return () => Math.min(capMs, Math.floor(rand() * (capMs + 1)));
}
