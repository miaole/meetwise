import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, CheckSquare, Square, Share2 } from 'lucide-react';
import { getServerToken, serverGet } from '@/lib/api/server';
import { retryReportAction, refreshReportAction } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScoreRing } from '@/components/ScoreRing';
import { AbilityBar } from '@/components/AbilityBar';
import { AnnotationCard } from '@/components/AnnotationCard';
import { Thinking } from '@/components/ui/Thinking';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { InterviewView } from '@meetwise/contracts';
import { interviewContextTitle, interviewResumeLabel, interviewTimeLabel } from '@/lib/interview/context';

export const metadata = { title: '面试报告 · 知面' };

type ReportStatus = 'queued' | 'running' | 'ready' | 'failed' | 'quarantined' | 'interview_failed' | 'assessment_unavailable';
type Report = { status: ReportStatus; content: { overall: number; sections: Array<{ title: string; body: string }> } | null };
type Dimension = { dimension: string; score: number; gap: boolean; evidence?: string };
type Assessment = { status?: string; dimensions?: Dimension[]; overall?: number };
type LearningPlan = { items: Array<{ topic: string; priority: string; action: string; done: boolean }>; progress: { completed: number; total: number } };
type Milestone = { stage: string; goal: string };
type Career = { readiness?: string; level?: string; milestones?: Milestone[] };

const LEVEL_LABEL: Record<string, string> = { junior: '初级', mid: '中级', senior: '高级' };

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await getServerToken())) redirect('/login');

  const base = process.env.NEXT_PUBLIC_API_BASE ?? '';
  const [r, interviewRaw] = await Promise.all([
    serverGet<Report>('/interview/' + id + '/report'),
    serverGet<unknown>('/interview/' + id),
  ]);
  const parsedInterview = InterviewView.safeParse(interviewRaw);
  const interview = parsedInterview.success ? parsedInterview.data : null;

  // Server Action 需要绑定 id(Server Component 内不能传内联闭包给 form action)。
  const retry = retryReportAction.bind(null, id);
  const refresh = refreshReportAction.bind(null, id);

  const status = r?.status;
  const ready = status === 'ready' && r?.content;
  const pending = status === 'queued' || status === 'running';
  const unavailable = status === 'failed' || status === 'quarantined';   // **报告生成失败**(才给"重试生成")
  const interviewFailed = status === 'interview_failed';   // **面试本身已中断**(E5:别显示成"继续答题",那是引导用户去答一场已死的面试)
  const assessmentUnavailable = status === 'assessment_unavailable';
  const noReport = !r;   // 报告**还没生成**(面试进行中/未开始)——不是失败,引导回面试继续
  const overall = ready && typeof r?.content?.overall === 'number' ? r!.content!.overall : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/interviews" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> 返回面试列表
        </Link>
        <a href={base + '/interview/' + id + '/report/export'} className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
          <Download className="h-4 w-4" /> 导出 Markdown
        </a>
      </div>

      {/* 报告头:标题 + 分数环(签名时刻)。主色稀缺,仅落在分数与环上。 */}
      <header className="mb-8">
        <div className="text-xs font-medium uppercase tracking-wide text-primary">练习报告</div>
        <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">逐题点评与成长建议</h1>
            <p className="mt-2 text-sm font-medium">{interviewContextTitle(interview?.job_title)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{interviewResumeLabel(interview?.resume_display_name)} · {interview?.display_code ?? '场次信息同步中'} · {interviewTimeLabel(interview?.created_at)}</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              基于本次练习生成的逐题反馈与后续建议。模型生成内容仅供个人复盘，不代表能力认证、招聘结论或录用建议。
            </p>
          </div>
          {overall != null ? (
            <div className="flex shrink-0 flex-col items-center">
              <ScoreRing score={overall} />
              <span className="mt-2 text-center text-xs text-muted-foreground">本次练习反馈<br />不用于招聘决定</span>
              {/* 运营层裂变:报告就绪后,owner 可一键生成可分享海报(仅聚合分数,无 PII)。 */}
              <Link
                href={'/report/' + id + '/share'}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Share2 className="h-3.5 w-3.5" /> 生成练习反馈海报
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      {ready && r?.content && (
        <section className="mb-8 space-y-4">
          {(r.content.sections ?? []).map((s, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <h2 className="text-base font-semibold tracking-tight">{s.title}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink2">{s.body}</p>
              </CardContent>
            </Card>
          ))}
          {(r.content.sections ?? []).length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">本场报告暂无文字小结。</CardContent></Card>
          ) : null}
        </section>
      )}

      {pending && (
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* 报告隔离生成可能耗时:给"生成中"动效 + 内容形状骨架 + 刷新出口,绝不死等也不死白屏。 */}
            <div className="flex items-center justify-between gap-3">
              <Thinking label="报告生成中，正在逐题点评并规划成长路径" />
              <form action={refresh}>
                <SubmitButton variant="outline" size="sm" pendingLabel="刷新中…">刷新</SubmitButton>
              </form>
            </div>
            <div className="mt-5 space-y-4" aria-hidden>
              {[0, 1].map((i) => (
                <div key={i} className="rounded-lg border bg-secondary/30 p-5">
                  <Skeleton className="mb-3 h-4 w-1/3" />
                  <SkeletonText lines={3} />
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">生成完成后将自动呈现，也可随时点「刷新」查看进度。</p>
          </CardContent>
        </Card>
      )}

      {/* 报告还没生成(面试未完成/未开始)——不是失败:不给"重试",而是引导回去把面试做完(无死胡同,但也不误导成"生成失败")。 */}
      {noReport && (
        <Card className="mb-8 border-border bg-secondary/30">
          <CardContent className="p-6 text-center">
            <p className="mb-2 font-semibold">报告还没生成</p>
            <p className="mb-4 text-sm text-muted-foreground">这场面试还没完成——答完题、面试结束后,系统会自动生成你的综合报告。</p>
            <a href={base + '/interview/' + id} className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              继续这场面试 →
            </a>
          </CardContent>
        </Card>
      )}

      {/* 面试已中断(E5):面试本身失败/不可用——不引导"继续答题"(那场面试已死),给回列表/重开的出口。 */}
      {interviewFailed && (
        <Card className="mb-8 border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <p className="mb-2 font-semibold text-destructive">面试已中断</p>
            <p className="mb-4 text-sm text-muted-foreground">这场面试因故未能完成,无法生成报告。你可以回到面试列表重新开始一场。</p>
            <a href={base + '/interviews'} className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              回到面试列表 →
            </a>
          </CardContent>
        </Card>
      )}

      {assessmentUnavailable && (
        <Card className="mb-8 border-amber-300/50 bg-amber-50/50">
          <CardContent className="p-6 text-center">
            <p className="mb-2 font-semibold">本次岗位评估不可用</p>
            <p className="mb-4 text-sm text-muted-foreground">本场练习已结束，但没有形成可用于岗位流程的评估。具体额度处理以账户记录为准，你可以回到“我的投递”重新发起岗位面试。</p>
            <Button asChild><Link href="/jobs">回到我的投递 →</Link></Button>
          </CardContent>
        </Card>
      )}

      {unavailable && (
        <Card className="mb-8 border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <p className="mb-2 font-semibold text-destructive">报告暂不可用</p>
            <p className="mb-4 text-sm text-muted-foreground">生成可能因临时故障被中断,可以重新尝试生成。</p>
            <form action={retry}>
              <SubmitButton pendingLabel="重试中…">重试生成</SubmitButton>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        <Suspense fallback={<SectionFallback label="能力评估加载中…" />}>
          <AssessmentSection id={id} />
        </Suspense>
        <Suspense fallback={<SectionFallback label="学习计划加载中…" />}>
          <LearningSection id={id} />
        </Suspense>
        <Suspense fallback={<SectionFallback label="职业路径加载中…" />}>
          <CareerSection id={id} />
        </Suspense>
      </div>
    </main>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-primary" />
      <h2 className="text-lg font-bold tracking-tight">{children}</h2>
    </div>
  );
}

function SectionFallback({ label }: { label: string }) {
  // 子段(能力评估/学习计划/职业路径)服务端取数时:标题 + 内容形状骨架,平滑占位不抖动。
  return (
    <section>
      <div className="mb-4"><Thinking label={label} /></div>
      <Card aria-hidden>
        <CardContent className="space-y-3 p-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

async function AssessmentSection({ id }: { id: string }) {
  const assessment = await serverGet<Assessment>('/interview/' + id + '/assessment');
  const dims = Array.isArray(assessment?.dimensions) ? assessment!.dimensions! : [];
  if (!assessment || dims.length === 0) return null;

  return (
    <section>
      <SectionHeading>能力评估</SectionHeading>
      {/* 维度总览:每维一条能力条,差距维度(gap)落主色强调 */}
      <Card>
        <CardContent className="space-y-3 p-6">
          {dims.map((d, i) => (
            <AbilityBar key={i} label={d.dimension} value={d.score} em={!!d.gap} />
          ))}
        </CardContent>
      </Card>

      {/* 逐题点评:每维一张签名批注卡。evidence 当点评,gap 维度同时落到能力条强调。 */}
      <div className="mt-5 grid gap-4">
        <div className="text-xs font-medium uppercase tracking-wide text-primary">逐题点评</div>
        {dims.map((d, i) => (
          <AnnotationCard
            key={i}
            question={d.dimension}
            note={d.evidence ?? (d.gap ? '该维度低于达标线(60),建议优先补强。' : '该维度表现达标。')}
            score={d.score}
          />
        ))}
      </div>
    </section>
  );
}

async function LearningSection({ id }: { id: string }) {
  const learning = await serverGet<LearningPlan>('/interview/' + id + '/learning-plan');
  const items = Array.isArray(learning?.items) ? learning!.items : [];
  if (!learning || items.length === 0) return null;
  const completed = learning.progress?.completed ?? items.filter((it) => it.done).length;
  const total = learning.progress?.total ?? items.length;

  return (
    <section>
      <SectionHeading>学习计划</SectionHeading>
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <Progress value={total ? (completed / total) * 100 : 0} className="h-1.5 flex-1" />
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{completed} / {total} 已完成</span>
          </div>
          <div className="divide-y divide-border">
            {items.map((it, i) => (
              <div key={i} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                {it.done ? <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{it.topic}</span>
                    {it.priority === 'high' ? (
                      <Badge variant="success" className="px-1.5 py-0 text-[11px]">优先</Badge>
                    ) : (
                      <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">{it.priority}</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{it.action}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

async function CareerSection({ id }: { id: string }) {
  const career = await serverGet<Career>('/interview/' + id + '/career-path');
  if (!career) return null;
  const milestones = Array.isArray(career.milestones) ? career.milestones : [];
  const levelLabel = career.level ? (LEVEL_LABEL[career.level] ?? career.level) : null;

  return (
    <section>
      <SectionHeading>职业路径</SectionHeading>
      <Card>
        <CardContent className="p-6">
          {(career.readiness || levelLabel) ? (
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {levelLabel ? (
                <Badge variant="success">当前定位 · {levelLabel}</Badge>
              ) : null}
              {career.readiness ? <span className="text-sm text-ink2">{career.readiness}</span> : null}
            </div>
          ) : null}
          {milestones.length > 0 ? (
            <ol className="relative space-y-5 border-l border-border pl-5">
              {milestones.map((m, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[23px] top-1 size-2.5 rounded-full border-2 border-background bg-primary" />
                  <div className="text-sm font-semibold">{m.stage}</div>
                  <div className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{m.goal}</div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">暂无可展示的成长里程碑。</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
