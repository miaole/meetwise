'use client';
/**
 * React 桥:把已测的 runQuizStream 驱动包进 effect。组件只拿 view + display,不碰 SSE 细节。
 * 卸载用 AbortController 取消;掉线驱动自动重连;无静默死胡同由 quiz-state 视图模型保证。对齐 useInterviewStream。
 */
import { useEffect } from 'react';
import { runQuizStream } from '../stream/quiz-stream';
import { initialQuizView, quizDisplay, type QuizViewState, type QuizDisplay } from '../stream/quiz-state';
import { iterateSseBody, lastEventIdHeaderValue } from '../stream/sse-cursor';
import { useFrameCoalescedState } from './useFrameCoalescedState';

/** 打开 SSE 流:走同源 Next 代理 `/api/quiz/:id/events`,浏览器自动带 httpOnly cookie,代理服务端加 Bearer。 */
async function* openSse(quizId: string, lastEventId: number, signal?: AbortSignal): AsyncGenerator<string> {
  const headers: Record<string, string> = {};
  const cursor = lastEventIdHeaderValue(lastEventId);
  if (cursor !== undefined) headers['last-event-id'] = cursor;
  const res = await fetch(`/api/quiz/${encodeURIComponent(quizId)}/events`, { headers, signal });
  yield* iterateSseBody(res); // 400 非法游标抛错 → 驱动停转;401/404/502 空结束 → 驱动重连
}

export interface UseQuizStream { view: QuizViewState; display: QuizDisplay }

export function useQuizStream(quizId: string): UseQuizStream {
  const { state: view, publish, cancelPending, replaceImmediately } = useFrameCoalescedState<QuizViewState>(initialQuizView);
  useEffect(() => {
    const ac = new AbortController();
    replaceImmediately(initialQuizView);
    runQuizStream({
      open: (lastEventId, signal) => openSse(quizId, lastEventId, signal),
      onView: publish,
      signal: ac.signal,
    });
    return () => { ac.abort(); cancelPending(); };
  }, [quizId, publish, cancelPending, replaceImmediately]);
  return { view, display: quizDisplay(view) };
}
