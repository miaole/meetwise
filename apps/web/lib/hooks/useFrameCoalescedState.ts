'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { makeFrameCoalescer, type FrameCoalescer } from '../stream/frame-coalescer';

type BrowserFrameHandle =
  | { kind: 'animation-frame'; id: number }
  | { kind: 'timeout'; id: ReturnType<typeof setTimeout> };

function scheduleBrowserFrame(flush: () => void): BrowserFrameHandle {
  if (typeof globalThis.requestAnimationFrame === 'function') {
    return { kind: 'animation-frame', id: globalThis.requestAnimationFrame(flush) };
  }
  return { kind: 'timeout', id: globalThis.setTimeout(flush, 0) };
}

function cancelBrowserFrame(handle: unknown): void {
  const frame = handle as BrowserFrameHandle | undefined;
  if (!frame) return;
  if (frame.kind === 'animation-frame') {
    globalThis.cancelAnimationFrame?.(frame.id);
  } else {
    globalThis.clearTimeout(frame.id);
  }
}

/**
 * 高频流的 React 桥：一帧只提交最后一个完整视图，卸载/换资源时撤销尚未提交的视图。
 * 这不是 token 丢弃：流层已经完成全部状态归约，UI 只跳过中间的、不可见价值很低的快照。
 */
export function useFrameCoalescedState<T>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const coalescerRef = useRef<FrameCoalescer<T> | null>(null);
  if (!coalescerRef.current) {
    coalescerRef.current = makeFrameCoalescer(setState, scheduleBrowserFrame, cancelBrowserFrame);
  }

  const publish = useCallback((value: T) => coalescerRef.current?.offer(value), []);
  const cancelPending = useCallback(() => coalescerRef.current?.cancel(), []);
  const replaceImmediately = useCallback((value: T) => {
    coalescerRef.current?.cancel();
    setState(value);
  }, []);

  useEffect(() => () => coalescerRef.current?.cancel(), []);
  return { state, publish, cancelPending, replaceImmediately };
}
