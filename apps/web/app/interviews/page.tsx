import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerToken, serverGet } from '../../lib/api/server';
import { startInterviewAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { listWindow, withLimitHref } from '@/lib/paginate';
import { interviewDisplayStatus, interviewProgressLabel, isInterviewEnterable } from '@/lib/interview/progress';
import { interviewContextTitle, interviewResumeLabel, interviewTimeLabel } from '@/lib/interview/context';
import { resumeOptionLabel } from '@/lib/resume/display';
import { InterviewList, ResumeList, type InterviewView as Interview, type ResumeRef as Resume } from '@meetwise/contracts';

const PAGE = 20;          // 初始/每次"加载更多"渲染条数,封顶首屏 DOM(极端长列表防卡)

export const metadata = { title: '面试 · 知面' };          // App Router Metadata API(SEO,服务端注入)

/** 面试列表 + 开始新面试:服务端鉴权 + 服务端取数(GET /interview、/resume),Server Action 启动面试。 */
const STATUS_LABEL: Record<string, string> = {
  created: '待开始', active: '进行中', running: '进行中', waiting_user: '等你作答',
  completed: '已完成', abandoned: '已放弃', failed: '已失败',
};

function statusBadge(status: string) {
  const variant = status === 'failed' ? 'destructive' : status === 'completed' ? 'success' : 'secondary';
  return <Badge variant={variant}>{STATUS_LABEL[status] ?? '状态未知'}</Badge>;
}

export default async function InterviewsPage({ searchParams }: { searchParams: Promise<{ limit?: string; error?: string }> }) {
  if (!(await getServerToken())) redirect('/login');       // 服务端鉴权门(无 cookie 直接服务端跳转,不发任何页面 JS)
  const { limit, error } = await searchParams;

  // 真服务端取数:在 RSC 里 await,HTML 服务端渲染好再发(首屏即有数据,无客户端 fetch 闪烁)。
  const data = await serverGet<unknown>('/interview');
  const resumesRaw = await serverGet<unknown>('/resume');

  const parsedInterviews = InterviewList.safeParse(data);
  const interviews: Interview[] | null = parsedInterviews.success ? parsedInterviews.data.interviews : null;
  const parsedResumes = ResumeList.safeParse(resumesRaw);
  const resumes: Resume[] = parsedResumes.success ? parsedResumes.data.resumes : [];

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">面试 · 知面</h1>

      {error === 'create_failed' && (
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          创建面试失败,请稍后重试;若反复出现请确认额度与网络。
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">开始新面试</CardTitle>
          <CardDescription>选择一份简历,开启一场自适应模拟面试。</CardDescription>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              还没有简历。
              <Link href="/resume" className="font-medium text-foreground underline-offset-4 hover:underline">先去上传简历 →</Link>
            </p>
          ) : (
            <form action={startInterviewAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="text-sm text-muted-foreground" htmlFor="resumeId">选择简历</label>
              <select
                id="resumeId"
                name="resumeId"
                defaultValue={resumes[0]?.id}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:flex-1"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{resumeOptionLabel(r)}</option>
                ))}
              </select>
              <SubmitButton pendingLabel="启动中…">开始新面试</SubmitButton>
            </form>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">我的面试{interviews ? `(${interviews.length})` : ''}</h2>
        {interviews === null ? (
          <Card><CardContent className="py-8 text-center text-sm text-destructive">面试列表暂不可用,请确认 API 已启动。</CardContent></Card>
        ) : interviews.length === 0 ? (
          <Card className="border-dashed"><CardContent className="py-10 text-center text-sm text-muted-foreground">还没有面试,上方开始一场。</CardContent></Card>
        ) : (
          (() => {
            const { shown, hasMore, remaining, nextLimit } = listWindow(interviews, limit, PAGE);
            return (
              <>
                <Card className="overflow-hidden">
                  <ul>
                    {shown.map((it, i) => (
                      <li key={it.id}>
                        {i > 0 && <Separator />}
                        <div className="flex flex-wrap items-center gap-3 p-4">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{interviewContextTitle(it.job_title)}</div>
                            <div className="truncate text-xs text-muted-foreground">{interviewResumeLabel(it.resume_display_name)} · {it.display_code} · {interviewTimeLabel(it.created_at)}</div>
                          </div>
                          {statusBadge(interviewDisplayStatus(it))}
                          <span className="text-xs text-muted-foreground tabular-nums">{interviewProgressLabel(it)}</span>
                          {it.status === 'completed' ? (
                            <Button asChild variant="outline" size="sm"><Link href={`/report/${it.id}`}>查看报告 →</Link></Button>
                          ) : !isInterviewEnterable(it.status) ? (
                            <Button variant="outline" size="sm" disabled>{it.status === 'abandoned' || it.status === 'failed' ? '已结束' : '状态待同步'}</Button>
                          ) : (
                            <Button asChild variant="outline" size="sm"><Link href={`/interview/${it.id}`}>进入 →</Link></Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
                {hasMore && (
                  <div className="text-center">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={withLimitHref('/interviews', {}, nextLimit)} scroll={false}>加载更多(还有 {remaining} 场)</Link>
                    </Button>
                  </div>
                )}
              </>
            );
          })()
        )}
      </section>

      <p className="text-sm">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">← 返回控制台</Link>
      </p>
    </main>
  );
}
