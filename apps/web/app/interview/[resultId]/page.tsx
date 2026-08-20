import { redirect } from 'next/navigation';
import Link from 'next/link';
import { InterviewView } from '@meetwise/contracts';
import { InterviewPanel } from '../../../components/InterviewPanel';
import { getServerToken, serverGet } from '@/lib/api/server';
import { interviewContextTitle, interviewResumeLabel, interviewTimeLabel } from '@/lib/interview/context';
import { isInterviewEnterable } from '@/lib/interview/progress';

export default async function InterviewPage({ params, searchParams }: { params: Promise<{ resultId: string }>; searchParams: Promise<{ applicationId?: string }> }) {
  if (!(await getServerToken())) redirect('/login');
  const [{ resultId }, { applicationId }] = await Promise.all([params, searchParams]);
  const parsed = InterviewView.safeParse(await serverGet<unknown>(`/interview/${resultId}`));
  const interview = parsed.success ? parsed.data : null;
  if (interview?.status === 'completed') redirect(`/report/${resultId}`);
  const enterable = interview !== null && isInterviewEnterable(interview.status);
  // SSE/答题走同源 /api/interview/* 代理(服务端读 httpOnly cookie 加 Bearer),无需 baseUrl(修审计 P0 鉴权)。
  // applicationId 只用于触发同源 finalize；API 仍从 DB 反查一对一 binding，URL 被篡改不会改变任何 B 端分数。
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
      <header className="rounded-lg border bg-card p-4">
        <h1 className="text-lg font-semibold">{interviewContextTitle(interview?.job_title)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{interviewResumeLabel(interview?.resume_display_name)} · {interview?.display_code ?? '场次信息同步中'} · {interviewTimeLabel(interview?.created_at)}</p>
      </header>
      {enterable ? (
        <InterviewPanel resultId={resultId} applicationId={applicationId} />
      ) : (
        <section className="rounded-lg border bg-card p-6 text-sm">
          <p>{interview ? '本场面试已结束或状态正在同步，当前不可继续作答。' : '面试上下文暂不可用，请稍后刷新。'}</p>
          <Link href="/interviews" className="mt-3 inline-block font-medium underline underline-offset-4">返回我的面试</Link>
        </section>
      )}
    </main>
  );
}
