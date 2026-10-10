import { redirect } from 'next/navigation';
import Link from 'next/link';
import { InterviewView } from '@meetwise/contracts';
import { InterviewPanel } from '../../../components/InterviewPanel';
import { getServerToken, serverGet } from '@/lib/api/server';
import { interviewContextTitle, interviewResumeLabel, interviewTimeLabel } from '@/lib/interview/context';
import { isInterviewEnterable } from '@/lib/interview/progress';

// G3 BEGIN-GUARD #161/#256（REQUEST §2.10）：STRESS 变体 id 族与 events 代理路由同门扩展（e2e-guard-only，
// 仍要求 E2E_UI_STRESS==='1'；原单 id '__e2e_stream_stress__' 语义原样保留于首位移）。
// 变体选择=id 本身（页面 query 不透传 SSE fetch——既有 ?duplicateFrames=1 即死参数实证，见 G3 收据漂移表微漂⑥），
// 零新增生产路由、零 query 通道依赖。
const E2E_STREAM_STRESS_IDS = ['__e2e_stream_stress__', '__e2e_stream_progress__', '__e2e_stream_silent__'];

export default async function InterviewPage({ params, searchParams }: { params: Promise<{ resultId: string }>; searchParams: Promise<{ applicationId?: string }> }) {
  if (!(await getServerToken())) redirect('/login');
  const [{ resultId }, { applicationId }] = await Promise.all([params, searchParams]);
  // Guard-only UI stress seam: when the isolated UI runner enables E2E_UI_STRESS, render the
  // InterviewPanel for the synthetic id without a backend interview row so the hermetic SSE
  // source can exercise the real reducer/DOM window. Never enabled in production.
  const stressEnterable = E2E_STREAM_STRESS_IDS.includes(resultId) && process.env.E2E_UI_STRESS === '1';
  const parsed = stressEnterable ? { success: false as const, data: null } : InterviewView.safeParse(await serverGet<unknown>(`/interview/${resultId}`));
  const interview = parsed.success ? parsed.data : null;
  if (!stressEnterable && interview?.status === 'completed') redirect(`/report/${resultId}`);
  const enterable = stressEnterable || (interview !== null && isInterviewEnterable(interview.status));
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
