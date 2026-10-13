'use client';
/**
 * React 桥:把已测的 runDiagnosisStream 驱动包进 effect。组件只拿 view + display + retry,不碰 SSE 细节。
 * 卸载用 AbortController 取消;掉线驱动自动重连;无静默死胡同由 diagnosis-state 视图模型保证。对齐 useQuizStream。
 *
 * SSE-RESILIENCE(C4)：① openSse 分类透传(SseOpenStatusError → 驱动按状态码分支);
 * ② 浏览器 resumeSignals(SSR 守卫,单源 useInterviewStream);③ 401 停转 → /login?expired=1 跳转(React 层);
 * ④ retry() 去 reload 出口(驱动在跑→resume 信号;已退出→重启驱动)。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { runDiagnosisStream } from '../stream/diagnosis-stream';
import { initialDiagnosisView, diagnosisDisplay, type DiagnosisViewState, type DiagnosisDisplay } from '../stream/diagnosis-state';
import { iterateSseBody, lastEventIdHeaderValue } from '../stream/sse-cursor';
import { useFrameCoalescedState } from './useFrameCoalescedState';
import { browserResumeSignals } from './useInterviewStream';

/** 打开 SSE 流:走同源 Next 代理 `/api/diagnosis/:id/events`,浏览器自动带 httpOnly cookie,代理服务端加 Bearer。 */
async function* openSse(diagnosisId: string, lastEventId: number, signal?: AbortSignal): AsyncGenerator<string> {
  const headers: Record<string, string> = {};
  const cursor = lastEventIdHeaderValue(lastEventId);
  if (cursor !== undefined) headers['last-event-id'] = cursor;
  const res = await fetch(`/api/diagnosis/${encodeURIComponent(diagnosisId)}/events`, { headers, signal });
  yield* iterateSseBody(res); // 400 游标 → 停转('cursor');401/404/429/5xx → SseOpenStatusError 分类(#56)
}

export interface UseDiagnosisStream { view: DiagnosisViewState; display: DiagnosisDisplay; retry: () => void; }

export function useDiagnosisStream(diagnosisId: string): UseDiagnosisStream {
  const { state: view, publish, cancelPending, replaceImmediately } = useFrameCoalescedState<DiagnosisViewState>(initialDiagnosisView);
  const router = useRouter();
  const [nonce, setNonce] = useState(0);
  const fireRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    const ac = new AbortController();
    replaceImmediately(initialDiagnosisView);
    const signals = browserResumeSignals((cb) => {
      fireRef.current = cb;
      return () => { if (fireRef.current === cb) fireRef.current = null; };
    });
    runDiagnosisStream({
      open: (lastEventId, signal) => openSse(diagnosisId, lastEventId, signal),
      onView: publish,
      signal: ac.signal,
      resumeSignals: signals,
    });
    return () => { ac.abort(); cancelPending(); fireRef.current = null; };
  }, [diagnosisId, nonce, publish, cancelPending, replaceImmediately]);
  // 401 停转 → 跳登录(React 层;与 useInterviewStream 同构)。replace 防回退键落回死页。
  useEffect(() => {
    if (view.streamStopReason === 'auth') router.replace('/login?expired=1');
  }, [view.streamStopReason, router]);
  const retry = useCallback(() => {
    if (fireRef.current) fireRef.current();
    else setNonce((n) => n + 1);
  }, []);
  return { view, display: diagnosisDisplay(view), retry };
}
