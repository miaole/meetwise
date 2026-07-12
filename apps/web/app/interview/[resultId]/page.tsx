'use client';
import { use } from 'react';
import { InterviewPanel } from '../../../components/InterviewPanel';

export default function InterviewPage({ params }: { params: Promise<{ resultId: string }> }) {
  const { resultId } = use(params);
  // SSE/答题走同源 /api/interview/* 代理(服务端读 httpOnly cookie 加 Bearer),无需 baseUrl(修审计 P0 鉴权)。
  return <InterviewPanel resultId={resultId} />;
}
