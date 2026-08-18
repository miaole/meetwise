'use client';
/**
 * React 桥:把已测的 runQuizStream 驱动包进 effect。组件只拿 view + display,不碰 SSE 细节。
 * 卸载用 AbortController 取消;掉线驱动自动重连;无静默死胡同由 quiz-state 视图模型保证。对齐 useInterviewStream。
 */
import { useEffect } from 'react';
import { runQuizStream } from '../stream/quiz-stream';
import { initialQuizView, quizDisplay, type QuizViewState, type QuizDisplay } from '../stream/quiz-state';
import { useFrameCoalescedState } from './useFrameCoalescedState';

/** 打开 SSE 流:走同源 Next 代理 `/api/quiz/:id/events`,浏览器自动带 httpOnly cookie,代理服务端加 Bearer。 */
async function* openSse(quizId: string, lastEventId: number, signal?: AbortSignal): AsyncGenerator<string> {
  const headers: Record<string, string> = {};
  if (lastEventId) headers['last-event-id'] = String(lastEventId);
  const res = await fetch(`/api/quiz/${encodeURIComponent(quizId)}/events`, { headers, signal });
  if (!res.ok || !res.body) return;   // 非 200(401/404/502)→ 结束本次连接,交给驱动重连/降级(不把错误正文当事件流喂解析器)
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    yield dec.decode(value, { stream: true });
  }
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
