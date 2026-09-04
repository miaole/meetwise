import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerToken, serverGet } from '@/lib/api/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { applyAction, startApplicationAction, declineApplicationAction } from './actions';
import { listWindow, withLimitHref } from '@/lib/paginate';
import { resumeOptionLabel } from '@/lib/resume/display';
import { applicationScoreVisible } from '@/lib/recruiter/surface';
import { MyApplications, ResumeList, type ResumeRef as Resume } from '@meetwise/contracts';

const PAGE = 20;          // 岗位广场可能很多:封顶首屏渲染,"加载更多"递增 ?limit

export const metadata: Metadata = { title: '岗位广场 · 知面', description: '浏览招聘中的岗位并投递申请。' };

interface Job { id: string; title: string; competencies: string[]; status: string }
type Application = (typeof MyApplications)['_output']['applications'][number];

const STATUS_LABEL: Record<string, { text: string; variant: 'success' | 'outline' | 'secondary' | 'destructive' }> = {
  invited: { text: '待开始', variant: 'outline' },
  in_progress: { text: '面试中', variant: 'secondary' },
  completed: { text: '已完成', variant: 'success' },
  assessment_unavailable: { text: '评分暂不可用（可重试）', variant: 'destructive' },
  declined: { text: '已婉拒', variant: 'destructive' },
};

/** 候选人(C 端)岗位广场:浏览招聘中的岗位 → 一键申请;并查看自己的投递状态。RSC + Server Action,无 client。 */
export default async function JobsPage({ searchParams }: { searchParams: Promise<{ limit?: string; alimit?: string }> }) {
  if (!(await getServerToken())) redirect('/login');
  const { limit, alimit } = await searchParams;

  const [jobsRes, appsRes, resumesRes] = await Promise.all([
    serverGet<{ jobs: Job[] }>('/jobs'),
    serverGet<unknown>('/applications'),
    serverGet<unknown>('/resume'),
  ]);
  const jobs = jobsRes?.jobs ?? [];
  const parsedApplications = MyApplications.safeParse(appsRes);
  const parsedResumes = ResumeList.safeParse(resumesRes);
  const applications: Application[] = parsedApplications.success ? parsedApplications.data.applications : [];
  // 已投递的岗位 id 集合 → 避免重复投递入口(基于全量 applications,与窗口无关,故不漏判)
  const appliedJobIds = new Set(applications.map((a) => a.job_id));
  const jobsWin = listWindow(jobs, limit, PAGE);
  const appsWin = listWindow(applications, alimit, PAGE);     // 投递列表独立分页(?alimit),两窗互不影响
  const eligibleResumes: Resume[] = (parsedResumes.success ? parsedResumes.data.resumes : []).filter((r) => r.status === 'ingested');

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Briefcase className="size-6 text-primary" />岗位广场</h1>
        <p className="mt-1 text-muted-foreground">浏览招聘中的岗位并投递。投递后将按岗位目标能力安排面试评估。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">招聘中的岗位（{jobs.length}）</CardTitle>
          <CardDescription>选择岗位投递申请,招聘方会看到你的投递。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {jobsRes === null ? (
            <p className="text-sm text-muted-foreground">岗位列表暂不可用,请稍后重试。</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无招聘中的岗位,过段时间再来看看。</p>
          ) : jobsWin.shown.map((job) => (
            <div key={job.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{job.title}</span>
                <Badge variant={job.status === 'open' ? 'success' : 'outline'}>{job.status === 'open' ? '招聘中' : '已关闭'}</Badge>
              </div>
              {job.competencies?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">{job.competencies.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div>
              )}
              <div className="mt-3">
                {appliedJobIds.has(job.id) ? (
                  <Badge variant="secondary">已投递</Badge>
                ) : (
                  <form action={applyAction.bind(null, job.id)}>
                    <SubmitButton size="sm" pendingLabel="投递中…">申请</SubmitButton>
                  </form>
                )}
              </div>
            </div>
          ))}
          {jobsWin.hasMore && (
            <div className="text-center">
              <Button asChild variant="ghost" size="sm">
                <Link href={withLimitHref('/jobs', { alimit }, jobsWin.nextLimit)} scroll={false}>加载更多(还有 {jobsWin.remaining} 个岗位)</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><FileText className="size-4 text-muted-foreground" />我的投递（{applications.length}）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {appsRes === null ? (
            <p className="text-sm text-muted-foreground">投递记录暂不可用,请稍后重试。</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">你还没有投递任何岗位,在上方选一个岗位申请吧。</p>
          ) : appsWin.shown.map((app) => {
            const st = STATUS_LABEL[app.status] ?? { text: '状态未知', variant: 'outline' as const };
            const invited = app.status === 'invited';
            // `assessment_unavailable` 是无可信分数且已退款的可恢复终态；重试必须显式由
            // 用户发起，服务端会创建新的 attempt，不会复活或覆盖旧会话。
            const startable = app.status === 'invited' || app.status === 'in_progress' || app.status === 'assessment_unavailable';
            // 申请 score 即使历史非空也不得渲染：校准 hold 下它不是可比较评分。
            const showScore = applicationScoreVisible(app.score);
            return (
              <div key={app.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                <span className="text-sm font-medium">
                  {app.job_title}
                  {app.source === 'invited' && <Badge variant="secondary" className="ml-2 align-middle">招聘方邀请</Badge>}
                </span>
                <div className="flex items-center gap-2">
                  {showScore ? <span className="text-sm text-muted-foreground">申请分暂不展示</span> : null}
                  <Badge variant={st.variant}>{st.text}</Badge>
                  {/* 岗位面试必须显式选择一份已摄取简历；服务端会把 resume/job/application 原子绑定到唯一会话。 */}
                  {startable && (
                    <>
                      {eligibleResumes.length > 0 ? (
                        <form action={startApplicationAction.bind(null, app.id)} className="flex items-center gap-1">
                          <select name="resumeId" defaultValue={eligibleResumes[0]?.id} aria-label="选择用于本岗位面试的简历" className="h-8 max-w-36 rounded border bg-background px-1 text-xs">
                            {eligibleResumes.map((r) => <option key={r.id} value={r.id}>{resumeOptionLabel(r)}</option>)}
                          </select>
                          <SubmitButton size="sm" pendingLabel="启动中…">{invited ? '开始面试' : '继续岗位面试'}</SubmitButton>
                        </form>
                      ) : (
                        <Link href="/resume" className="text-xs text-primary underline underline-offset-2">先上传并完成解析简历</Link>
                      )}
                      {invited && <form action={declineApplicationAction.bind(null, app.id)}>
                        <SubmitButton size="sm" variant="outline" pendingLabel="处理中…">婉拒</SubmitButton>
                      </form>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {appsWin.hasMore && (
            <div className="text-center">
              <Button asChild variant="ghost" size="sm">
                <Link href={withLimitHref('/jobs', { limit }, appsWin.nextLimit, 'alimit')} scroll={false}>加载更多(还有 {appsWin.remaining} 条投递)</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm"><a href="/dashboard" className="text-muted-foreground hover:text-foreground">← 返回总览</a></p>
    </div>
  );
}
