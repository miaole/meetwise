import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerToken, serverGet } from '../../lib/api/server';
import { startInterviewAction, restartInterviewAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { listWindow, withLimitHref } from '@/lib/paginate';
import { actionErrorMessage } from '@/lib/errors/action-error';
import { interviewDisplayStatus, interviewProgressLabel, isInterviewEnterable } from '@/lib/interview/progress';
import { interviewContextTitle, interviewResumeLabel, interviewTimeLabel } from '@/lib/interview/context';
import { resumeOptionLabel, isEligibleResume, resumeEmptyState } from '@/lib/resume/display';
import { parseEntitlement, entitlementLineView } from '@/lib/commerce/display';
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

export default async function InterviewsPage({ searchParams }: { searchParams: Promise<{ limit?: string; error?: string; reused?: string }> }) {
  if (!(await getServerToken())) redirect('/login');       // 服务端鉴权门(无 cookie 直接服务端跳转,不发任何页面 JS)
  const { limit, error, reused } = await searchParams;

  // 真服务端取数:在 RSC 里 await,HTML 服务端渲染好再发(首屏即有数据,无客户端 fetch 闪烁)。
  const data = await serverGet<unknown>('/interview');
  const resumesRaw = await serverGet<unknown>('/resume');

  const parsedInterviews = InterviewList.safeParse(data);
  const interviews: Interview[] | null = parsedInterviews.success ? parsedInterviews.data.interviews : null;
  const parsedResumes = ResumeList.safeParse(resumesRaw);
  const resumes: Resume[] = parsedResumes.success ? parsedResumes.data.resumes : [];
  // #260:唯一可用谓词 ingested(服务端 begin/bind 同语义·jobs 页同形先例)——两下拉/表单门/默认值全切过滤面。
  const eligibleResumes = resumes.filter(isEligibleResume);
  // #261:余额读数(RSC 服务端消费;401 redirect/非 ok→null/网络失败→null 由 serverGet 内建;形状漂移→safeParse 失败同降级 null)。
  const availableUnits = parseEntitlement(await serverGet<unknown>('/commerce/entitlement'));

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">面试 · 知面</h1>

      {/* #250/#251：?error= 统一走 actionErrorMessage 映射（mapped 码+兜底原文不变；未知码 null 不渲染空壳） */}
      {(() => {
        const actionError = actionErrorMessage('interviews', 0, error ?? null);
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

      {/* FENCE-REFLOW F2(#238 C 面)：create 复用信号（?reused=<id>）→ 选择面（banner 形，EXEC 审定）。
          两出口：继续=进既有会话；放弃后重来=restartInterviewAction（POST :id/abandon 后重跑 create+begin）。
          文案沿 errmsg-map BINDING_CONFLICT 家族（actionErrorMessage 映射取文案，不新增第三文案）。
          无 ?reused= 时本段不渲染，页面 byte 级不变。 */}
      {reused && (() => {
        const reusedId = reused;
        const caption = actionErrorMessage('interviews', 0, 'interview_resume_binding_conflict');
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{caption?.text ?? '你有一场未结束的面试：继续/放弃后重来'}</CardTitle>
              <CardDescription>继续将回到这场未结束的面试；放弃后重来会先结束它，再为你新建一场。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="sm"><Link href={`/interview/${reusedId}`}>继续</Link></Button>
                {eligibleResumes.length > 0 && (
                  <form action={restartInterviewAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input type="hidden" name="priorInterviewId" value={reusedId} />
                    <label className="text-sm text-muted-foreground" htmlFor="restart-resumeId">放弃后重来的简历</label>
                    <select
                      id="restart-resumeId"
                      name="resumeId"
                      defaultValue={eligibleResumes[0]?.id}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:flex-1"
                    >
                      {eligibleResumes.map((r) => (
                        <option key={r.id} value={r.id}>{resumeOptionLabel(r)}</option>
                      ))}
                    </select>
                    <SubmitButton pendingLabel="处理中…" variant="outline">放弃后重来</SubmitButton>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">开始新面试</CardTitle>
          <CardDescription>选择一份简历,可选填目标岗位,开启一场自适应模拟面试。</CardDescription>
        </CardHeader>
        <CardContent>
          {/* #260 空态三臂（纯函数单源）：resumes=0 → 既有「还没有简历」逐字；resumes>0 且 ingested=0 → 新「暂不可用」臂；ingested≥1 → 表单照旧。 */}
          {(() => {
            const empty = resumeEmptyState(resumes);
            return empty === null ? (
              <form action={startInterviewAction} className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="text-sm text-muted-foreground" htmlFor="resumeId">选择简历</label>
                  <select
                    id="resumeId"
                    name="resumeId"
                    defaultValue={eligibleResumes[0]?.id}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:flex-1"
                  >
                    {eligibleResumes.map((r) => (
                      <option key={r.id} value={r.id}>{resumeOptionLabel(r)}</option>
                    ))}
                  </select>
                </div>
                {/* #259 目标岗位输入:可选自由文本(仅限长与脱空白,语义归 planner;镜像 diagnosis/page 同形制)。 */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="text-sm text-muted-foreground" htmlFor="targetRole">目标岗位</label>
                  <Input id="targetRole" name="targetRole" maxLength={100} placeholder="可选,如:后端工程师(留空按简历自动匹配方向)" className="sm:flex-1" />
                </div>
                {/* #261 余额行:读数在→「余额 N · 本次消耗 1 次额度」+预览口径注记;N<1 静态中性提示不拦提交(服务端 402 权威);
                    读数失败/形状漂移→整行不渲染(降级零伪读数,禁「余额 —」类假数)。 */}
                {(() => {
                  const line = entitlementLineView(availableUnits);
                  if (!line) return null;
                  return (
                    <div className="space-y-1" data-testid="entitlement-line">
                      <p className="text-sm text-muted-foreground">{line.balanceLine}</p>
                      <p className="text-xs text-muted-foreground">{line.previewNote}</p>
                      {line.insufficientHint && <p className="text-xs text-muted-foreground">{line.insufficientHint}</p>}
                    </div>
                  );
                })()}
                <div className="flex justify-end"><SubmitButton pendingLabel="启动中…">开始新面试</SubmitButton></div>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                {empty.text}
                <Link href={empty.linkHref} className="font-medium text-foreground underline-offset-4 hover:underline">{empty.linkText}</Link>
              </p>
            );
          })()}
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
