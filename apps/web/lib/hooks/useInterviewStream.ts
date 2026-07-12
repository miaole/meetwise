'use client';
/**
 * React 桥:把已测的 runInterviewStream 驱动包进 effect。组件只拿 view + display,不碰 SSE 细节。
 * 卸载用 AbortController 取消(驱动已支持);掉线驱动自动重连;无静默死胡同由 view-model 保证。
 */
import { useEffect, useRef, useState } from 'react';
import { runInterviewStream } from '../stream/interview-stream';
import { initialView, type InterviewView } from '../stream/interview-state';
import { interviewDisplay, type Display } from '../view-model';

/** 打开 SSE 流:走**同源 Next 代理** `/api/interview/:id/events`,浏览器自动带 httpOnly cookie,代理服务端加 Bearer(修审计 P0:不再 x-user-id:'demo')。 */
async function* openSse(resultId: string, lastEventId: number, signal?: AbortSignal): AsyncGenerator<string> {
  const headers: Record<string, string> = {};
  if (lastEventId) headers['last-event-id'] = String(lastEventId);
  const res = await fetch(`/api/interview/${encodeURIComponent(resultId)}/events`, { headers, signal });
  if (!res.body) return;
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    yield dec.decode(value, { stream: true });
  }
}

export interface UseInterviewStream { view: InterviewView; display: Display; }

export function useInterviewStream(resultId: string): UseInterviewStream {
  const [view, setView] = useState<InterviewView>(initialView);
  const acRef = useRef<AbortController | null>(null);
  useEffect(() => {
    const ac = new AbortController();
    acRef.current = ac;
    runInterviewStream({
      open: (lastEventId, signal) => openSse(resultId, lastEventId, signal),
      onView: setView,
      signal: ac.signal,
    });
    return () => ac.abort();            // 卸载即停,不在死组件上 setState
  }, [resultId]);
  return { view, display: interviewDisplay(view) };
}
