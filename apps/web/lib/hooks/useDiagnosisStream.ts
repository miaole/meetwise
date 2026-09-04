'use client';
/**
 * React 桥:把已测的 runDiagnosisStream 驱动包进 effect。组件只拿 view + display,不碰 SSE 细节。
 * 卸载用 AbortController 取消;掉线驱动自动重连;无静默死胡同由 diagnosis-state 视图模型保证。对齐 useQuizStream。
 */
import { useEffect } from 'react';
import { runDiagnosisStream } from '../stream/diagnosis-stream';
import { initialDiagnosisView, diagnosisDisplay, type DiagnosisViewState, type DiagnosisDisplay } from '../stream/diagnosis-state';
import { iterateSseBody, lastEventIdHeaderValue } from '../stream/sse-cursor';
import { useFrameCoalescedState } from './useFrameCoalescedState';

/** 打开 SSE 流:走同源 Next 代理 `/api/diagnosis/:id/events`,浏览器自动带 httpOnly cookie,代理服务端加 Bearer。 */
async function* openSse(diagnosisId: string, lastEventId: number, signal?: AbortSignal): AsyncGenerator<string> {
  const headers: Record<string, string> = {};
  const cursor = lastEventIdHeaderValue(lastEventId);
  if (cursor !== undefined) headers['last-event-id'] = cursor;
  const res = await fetch(`/api/diagnosis/${encodeURIComponent(diagnosisId)}/events`, { headers, signal });
  yield* iterateSseBody(res); // 400 非法游标抛错 → 驱动停转;401/404/502 空结束 → 驱动重连
}

export interface UseDiagnosisStream { view: DiagnosisViewState; display: DiagnosisDisplay }

export function useDiagnosisStream(diagnosisId: string): UseDiagnosisStream {
  const { state: view, publish, cancelPending, replaceImmediately } = useFrameCoalescedState<DiagnosisViewState>(initialDiagnosisView);
  useEffect(() => {
    const ac = new AbortController();
    replaceImmediately(initialDiagnosisView);
    runDiagnosisStream({
      open: (lastEventId, signal) => openSse(diagnosisId, lastEventId, signal),
      onView: publish,
      signal: ac.signal,
    });
    return () => { ac.abort(); cancelPending(); };
  }, [diagnosisId, publish, cancelPending, replaceImmediately]);
  return { view, display: diagnosisDisplay(view) };
}
