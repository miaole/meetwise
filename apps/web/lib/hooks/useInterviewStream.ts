'use client';
/**
 * React 桥:把已测的 runInterviewStream 驱动包进 effect。组件只拿 view + display,不碰 SSE 细节。
 * 卸载用 AbortController 取消(驱动已支持);掉线驱动自动重连;无静默死胡同由 view-model 保证。
 */
import { useEffect, useRef } from 'react';
import { runInterviewStream } from '../stream/interview-stream';
import { initialView, type InterviewView } from '../stream/interview-state';
import { iterateSseBody, lastEventIdHeaderValue } from '../stream/sse-cursor';
import { interviewDisplay, type Display } from '../view-model';
import { useFrameCoalescedState } from './useFrameCoalescedState';

/** 打开 SSE 流:走**同源 Next 代理** `/api/interview/:id/events`,浏览器自动带 httpOnly cookie,代理服务端加 Bearer(修审计 P0:不再 x-user-id:'demo')。 */
async function* openSse(resultId: string, lastEventId: number, signal?: AbortSignal): AsyncGenerator<string> {
  const headers: Record<string, string> = {};
  const cursor = lastEventIdHeaderValue(lastEventId);
  if (cursor !== undefined) headers['last-event-id'] = cursor;
  const res = await fetch(`/api/interview/${encodeURIComponent(resultId)}/events`, { headers, signal });
  yield* iterateSseBody(res); // 400 非法游标抛错 → 驱动停转;401/404/502 空结束 → 驱动重连
}

export interface UseInterviewStream { view: InterviewView; display: Display; }

export function useInterviewStream(resultId: string): UseInterviewStream {
  const { state: view, publish, cancelPending, replaceImmediately } = useFrameCoalescedState<InterviewView>(initialView);
  const acRef = useRef<AbortController | null>(null);
  useEffect(() => {
    const ac = new AbortController();
    acRef.current = ac;
    // 资源切换不携带旧 resultId 的水位或尚未落帧的快照。
    replaceImmediately(initialView);
    runInterviewStream({
      open: (lastEventId, signal) => openSse(resultId, lastEventId, signal),
      onView: publish,
      signal: ac.signal,
    });
    return () => { ac.abort(); cancelPending(); }; // 卸载即停,不在死组件上 setState
  }, [resultId, publish, cancelPending, replaceImmediately]);
  return { view, display: interviewDisplay(view) };
}
