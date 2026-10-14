/**
 * TOKSTREAM S4b/R6 · UX-A 打字机 pacing（纯逻辑·框架无关可确定性单测）。
 * 分层承接 §E-⑥ 三层 coalesce：L1=worker 合帧（token-stream.ts·~100ms/≤4KB）；L2=api 环有界
 * （sse-pump.ts·256 帧丢旧）；L3=本面+既有 rAF 桥——`makeFrameCoalescer`（frame-coalescer.ts 复用，
 * 经 useFrameCoalescedState 已承载全部视图发布的每浏览器帧至多一次提交），本面在其下承 UX-A
 * 逐字揭示节奏。终态权威覆盖=缓冲清空后本面自然退场（streamingTextDisplay → undefined）。
 */

/** 打字机游标：attemptKey 键控（缓冲换代不互毒——attemptKey 变=揭示从头）。 */
export interface TypewriterCursor {
  attemptKey: string;
  /** 已揭示字符数（≤ 已缓冲量；单调不减·同 attemptKey 内）。 */
  revealedChars: number;
}

/** 每 tick 推进揭示：预算 charsPerTick，绝不超出已缓冲量（min 上界）；重复 tick（rAF 抖动/重放）
 *  由 min(base+budget, buffered) 幂等收口，不回退。 */
export function advanceTypewriter(
  cursor: TypewriterCursor | undefined, attemptKey: string, bufferedChars: number, charsPerTick: number,
): TypewriterCursor {
  const base = cursor && cursor.attemptKey === attemptKey ? cursor.revealedChars : 0;
  const budget = Math.max(0, charsPerTick);
  return { attemptKey, revealedChars: Math.min(Math.max(0, bufferedChars), base + budget) };
}

/** 揭示面切片（可见文本=全量缓冲的前 revealedChars 个码元；越界安全收口）。 */
export function typewriterVisible(bufferedText: string, cursor: TypewriterCursor): string {
  return bufferedText.slice(0, Math.max(0, Math.min(cursor.revealedChars, bufferedText.length)));
}
