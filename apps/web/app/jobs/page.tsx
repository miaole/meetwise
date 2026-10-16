import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerToken, serverGet } from '@/lib/api/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { applyAction, startApplicationAction, declineApplicationAction, consentQualitativeShareAction, withdrawQualitativeShareAction } from './actions';
import { listWindow, withLimitHref } from '@/lib/paginate';
import { resumeOptionLabel } from '@/lib/resume/display';
import { applicationScoreVisible } from '@/lib/recruiter/surface';
import { actionErrorMessage } from '@/lib/errors/action-error';
import { MyApplications, ResumeList, type ResumeRef as Resume } from '@meetwise/contracts';

const PAGE = 20;          // 岗位广场可能很多:封顶首屏渲染,"加载更多"递增 ?limit

export const metadata: Metadata = { title: '岗位广场 · 知面', description: '浏览招聘中的岗位并投递申请。' };

interface Job { id: string; title: string; competencies: string[]; status: string }
type Application = (typeof MyApplications)['_output']['applications'][number];

const STATUS_LABEL: Record<string, { text: string; variant: 'success' | 'outline' | 'secondary' | 'destructive' }> = {
  invited: { text: '待开始', variant: 'outline' },
  in_progress: { text: '面试中', variant: 'secondary' },
  completed: { text: '已完成', variant: 'success' },
  // I2 W1（裁定⑤）：assessment_unavailable 拆两态——held=「已面完 · 待校准」neutral 徽、
  // failed=「面试失败 · 可重试」destructive。此表只留无派生信号的兜底（不承诺可重试·fail-closed）。
  assessment_unavailable: { text: '评分暂不可用', variant: 'destructive' },
  declined: { text: '已婉拒', variant: 'destructive' },
};

/** I2 W1 两态徽（E3 派生口径：仅 a.status='assessment_unavailable' × 绑定面试 status 派生）。 */
function terminalStatusLabel(status: string, terminalKind: 'held' | 'failed' | null | undefined): { text: string; variant: 'success' | 'outline' | 'secondary' | 'destructive' } {
  if (status === 'assessment_unavailable' && terminalKind === 'held') return { text: '已面完 · 待校准', variant: 'outline' };
  if (status === 'assessment_unavailable' && terminalKind === 'failed') return { text: '面试失败 · 可重试', variant: 'destructive' };
  return STATUS_LABEL[status] ?? { text: '状态未知', variant: 'outline' };
}

/** 候选人(C 端)岗位广场:浏览招聘中的岗位 → 一键申请;并查看自己的投递状态。RSC + Server Action,无 client。 */
export default async function JobsPage({ searchParams }: { searchParams: Promise<{ limit?: string; alimit?: string; error?: string }> }) {
  if (!(await getServerToken())) redirect('/login');
  const { limit, alimit, error } = await searchParams;

  const [jobsRes, appsRes, resumesRes, qualConsentRes] = await Promise.all([
    serverGet<{ jobs: Job[] }>('/jobs'),
    serverGet<unknown>('/applications'),
    serverGet<unknown>('/resume'),
    // I2 W3（裁定④落点）：候选人侧 b_qualitative_share 同意态（per-user·触发面在 held 行内）。
    serverGet<{ consented: boolean }>('/privacy/consent?purpose=b_qualitative_share'),
  ]);
  const qualConsented = qualConsentRes?.consented === true;
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
        <p className="mt-1 text-muted-foreground">浏览练习岗位并投递。这不是正式招聘，对侧列表只是内部骨架，不构成录用评估。</p>
      </div>

      {/* #224：jobs actions 写下的 ?error=（apply/interview_credits_unavailable → 402 行）至此有人渲染；其余码 null 不渲染空壳 */}
      {(() => {
        const actionError = actionErrorMessage('jobs', 0, error ?? null);
        if (!actionError) return null;
        return (
          <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {actionError.text}
            {actionError.href && (
              <Link href={actionError.href} className="ml-1 font-medium underline underline-offset-4">额度说明</Link>
            )}
            {actionError.note && <span className="mt-1 block text-xs opacity-80">{actionError.note}</span>}
          </p>
        );
      })()}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">招聘中的岗位（{jobs.length}）</CardTitle>
          <CardDescription>选择岗位投递。对侧只能看到流程状态，不是招聘方产品，也不是正式招聘流程。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* D6 #239-④ PIPL24 流程内披露+静态受理入口(mailto·零端点零新表):披露如实引用
              applications.service scoreless 校准 hold 现状;不虚称工单/独立复核通道
              (与 how-it-works「校准和人工复核工单还没开放」/legal「自动招聘决定尚未开放」互洽零矛盾)。
              受理邮箱=法务复核保留项(上线前由运营确认实际邮箱)。 */}
          <div className="rounded-lg border p-3 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">自动化处理说明与你的权利</p>
            <p className="mt-1">
              本页申请由人工查看：岗位面试评分处于校准期，分数不用于筛选、排名或录用决定，也不存在仅由自动化作出的录用结论。
              依据《个人信息保护法》第24条，你有权要求人工复核，或拒绝仅通过自动化方式作出决定；如需行使，请发送邮件至{' '}
              <a className="text-primary hover:underline" href="mailto:privacy@meetwise.app">privacy@meetwise.app</a>
              （人工受理，暂无专用工单通道）。
            </p>
          </div>
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
            const st = terminalStatusLabel(app.status, app.terminalKind);
            const invited = app.status === 'invited';
            // I2 W1 修法④ startable 收窄（裁定③/E3）：`assessment_unavailable` 只在派生为
            // failed（绑定面试 failed·系统失败·预留已释放）时提供重试入口；held（绑定面试
            // completed·已面完待校准）不再显示「继续岗位面试」——服务端守卫
            // （application_held_not_retryable·409）与 UI 同源收窄，拦 UI 不拦 API 的穿面已封。
            // 无派生信号（缺绑定/旧响应）不提供重试=fail-closed。额度处理以结算事件为准：
            // evaluation_unscored=预留已释放，no_eligible_scored_answer=已扣费结算（不释放）。
            // 重试必须显式由用户发起，服务端会创建新的 attempt，不会复活或覆盖旧会话。
            const startable = app.status === 'invited' || app.status === 'in_progress'
              || (app.status === 'assessment_unavailable' && app.terminalKind === 'failed');
            const isHeld = app.status === 'assessment_unavailable' && app.terminalKind === 'held';
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
                  {/* I2 W3①：held 中性注记——非时间承诺（§7 Non-claims·held 语义=校准完成后与结果一起提供）。 */}
                  {isHeld && <p className="w-full text-xs text-muted-foreground">本场面试已完成；评分校准完成后与结果一起提供，不提供重试。</p>}
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
                      {/* B271 片3 P1-a 修法⑥（文案逐字=b271 REQUEST:44/§4.3-3）：企业支付静态知情行——非状态位零查询。
                          I2 W3②：held 行 startable=false 时本块不渲染——知情行随 startable 块自然收敛（零语义改动核对项）。 */}
                      <p className="w-full text-xs text-muted-foreground">本场由企业支付，不消耗你的额度</p>
                    </>
                  )}
                  {/* I2 W3③（裁定④）：候选人同意触面——招聘方定性投影可见性门（0160 函数内 fail-closed 承重·Ban 旁路）。
                      与 W1 两态徽同区（held 行现场语境）：候选人由此知道「招聘方将看到什么」。 */}
                  {isHeld && (
                    <div className="w-full space-y-1">
                      {qualConsented ? (
                        <form action={withdrawQualitativeShareAction}>
                          <SubmitButton size="sm" variant="outline" pendingLabel="处理中…">撤回同意（招聘方查看能力概要）</SubmitButton>
                        </form>
                      ) : (
                        <form action={consentQualitativeShareAction}>
                          <SubmitButton size="sm" variant="outline" pendingLabel="处理中…">同意招聘方查看能力概要</SubmitButton>
                        </form>
                      )}
                      <p className="text-xs text-muted-foreground">同意后招聘方仅可见能力维度与强/中/弱/证据不足档位，不含数字评分、答题内容与证据摘录原文；可随时撤回，撤回后立即停止展示。</p>
                    </div>
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
