'use client';
import { use } from 'react';
import { InterviewPanel } from '../../../components/InterviewPanel';

export default function InterviewPage({ params, searchParams }: { params: Promise<{ resultId: string }>; searchParams: Promise<{ applicationId?: string }> }) {
  const { resultId } = use(params);
  const { applicationId } = use(searchParams);
  // SSE/答题走同源 /api/interview/* 代理(服务端读 httpOnly cookie 加 Bearer),无需 baseUrl(修审计 P0 鉴权)。
  // applicationId 只用于触发同源 finalize；API 仍从 DB 反查一对一 binding，URL 被篡改不会改变任何 B 端分数。
  return <InterviewPanel resultId={resultId} applicationId={applicationId} />;
}
