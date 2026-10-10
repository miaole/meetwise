'use client';
/**
 * React 桥:把已测的 runInterviewStream 驱动包进 effect。组件只拿 view + display + retry,不碰 SSE 细节。
 * 卸载用 AbortController 取消(驱动已支持);掉线驱动自动重连;无静默死胡同由 view-model 保证。
 *
 * SSE-RESILIENCE(C4)：① openSse 分类透传（iterateInterviewSseBody:非 OK 抛 SseOpenStatusError 驱动按状态码分支;410 围栏抛 InterviewPrivacyFencedError 停转不重连,F6）;
 * ② 挂浏览器 resumeSignals（window online / document visibilitychange,SSR 守卫;随驱动退出路径 dispose）;
 * ③ 401 停转（streamStopReason='auth'）→ 本层执行 /login?expired=1 跳转（驱动框架无关不碰 location）;
 * ④ retry()（W2 :489 去 reload 出口）：驱动在跑 → resume 信号(立即重连+重置退避);驱动已退出 → 重启驱动。绝不 location.reload。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { runInterviewStream, type ResumeSignals } from '../stream/interview-stream';
import { initialView, type InterviewView } from '../stream/interview-state';
import { iterateInterviewSseBody, lastEventIdHeaderValue } from '../stream/sse-cursor';
import { interviewDisplay, type Display } from '../view-model';
import { useFrameCoalescedState } from './useFrameCoalescedState';

/** 打开 SSE 流:走**同源 Next 代理** `/api/interview/:id/events`,浏览器自动带 httpOnly cookie,代理服务端加 Bearer(修审计 P0:不再 x-user-id:'demo')。 */
async function* openSse(resultId: string, lastEventId: number, signal?: AbortSignal): AsyncGenerator<string> {
  const headers: Record<string, string> = {};
  const cursor = lastEventIdHeaderValue(lastEventId);
  if (cursor !== undefined) headers['last-event-id'] = cursor;
  const res = await fetch(`/api/interview/${encodeURIComponent(resultId)}/events`, { headers, signal });
  yield* iterateInterviewSseBody(res); // 400 非法游标抛错 → 驱动停转('cursor');410 围栏抛错 → 驱动停转不重连直接围栏出口(F6);401/404/429/5xx 抛 SseOpenStatusError → 驱动分类消费(#56)
}

/** 浏览器 resumeSignals 实现(SSR 守卫;dispose 即解绑)。onRetry 由本 hook 的 retry() 触发。三 hooks 共用(同构面单源)。 */
export function browserResumeSignals(fireRetry: (cb: () => void) => () => void): ResumeSignals {
  return {
    onOnline: (cb) => {
      if (typeof window === 'undefined') return () => {};
      window.addEventListener('online', cb);
      return () => window.removeEventListener('online', cb);
    },
    onVisible: (cb) => {
      if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
      const h = () => { if (document.visibilityState === 'visible') cb(); };
      document.addEventListener('visibilitychange', h);
      return () => document.removeEventListener('visibilitychange', h);
    },
    onRetry: fireRetry,
  };
}

export interface UseInterviewStream { view: InterviewView; display: Display; retry: () => void; }

export function useInterviewStream(resultId: string): UseInterviewStream {
  const { state: view, publish, cancelPending, replaceImmediately } = useFrameCoalescedState<InterviewView>(initialView);
  const router = useRouter();
  const [nonce, setNonce] = useState(0);
  const fireRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    const ac = new AbortController();
    // 资源切换不携带旧 resultId 的水位或尚未落帧的快照。
    replaceImmediately(initialView);
    const signals = browserResumeSignals((cb) => {
      fireRef.current = cb;
      return () => { if (fireRef.current === cb) fireRef.current = null; };
    });
    runInterviewStream({
      open: (lastEventId, signal) => openSse(resultId, lastEventId, signal),
      onView: publish,
      signal: ac.signal,
      resumeSignals: signals,   // online/visible/手动重试 → 驱动立即重连+重置退避(注入式,框架无关)
    });
    return () => { ac.abort(); cancelPending(); fireRef.current = null; }; // 卸载即停,不在死组件上 setState;驱动 finally 亦 dispose signals
  }, [resultId, nonce, publish, cancelPending, replaceImmediately]);
  // #56 W4:401 停转 → 跳登录(与 serverGet:30 逐字对齐;驱动框架无关,跳转在 React 层执行)。replace 防回退键落回死页。
  useEffect(() => {
    if (view.streamStopReason === 'auth') router.replace('/login?expired=1');
  }, [view.streamStopReason, router]);
  // W2 :489 retry 出口:驱动在跑 → resume 信号;已退出(degraded/终态) → 重启驱动(重放,凭服务端账本)。绝不整页刷新。
  const retry = useCallback(() => {
    if (fireRef.current) fireRef.current();
    else setNonce((n) => n + 1);
  }, []);
  return { view, display: interviewDisplay(view), retry };
}
