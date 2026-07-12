import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, FileText, Sparkle, Stethoscope, MessageSquareText, Briefcase, TrendingUp } from 'lucide-react';
import { getServerToken, serverGet } from '@/lib/api/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScoreRing } from '@/components/ScoreRing';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata = { title: '成长主页 · 知面' };     // App Router Metadata API(SEO,服务端注入)

interface Profile { id: string; email: string; status: string }
interface Overview { interviewsByStatus: Record<string, number>; answered: number; avgScore: number | null; reportsReady: number }
interface Interview { id: string; status: string; current_question_index?: number }

const STATUS_LABEL: Record<string, string> = {
  created: '待开始', running: '进行中', waiting_user: '等你作答',
  completed: '已完成', failed: '已失败',
};

/** 状态徽章:语义色克制——完成=暖色 success、失败=destructive、其余=secondary。 */
function StatusBadge({ status }: { status: string }) {
  const variant = status === 'completed' ? 'success' : status === 'failed' ? 'destructive' : 'secondary';
  return <Badge variant={variant}>{STATUS_LABEL[status] ?? status}</Badge>;
}

const QUICK_ACTIONS: Array<{ href: string; t: string; d: string; Icon: typeof MessageSquareText; primary?: boolean }> = [
  { href: '/interviews', t: '开始模拟面试', d: '自适应追问,逐题点评。', Icon: MessageSquareText, primary: true },
  { href: '/growth', t: '成长档案', d: '能力曲线随训练演进,看哪里在变强。', Icon: TrendingUp },
  { href: '/quiz', t: '押题预测', d: '据简历预测面试题,标考察点与追问。', Icon: Sparkle },
  { href: '/diagnosis', t: '简历诊断', d: '结构/亮点/风险/匹配度 + 接地改写建议。', Icon: Stethoscope },
  { href: '/resume', t: '管理简历', d: '上传与诊断,押题更贴你。', Icon: FileText },
  { href: '/jobs', t: '找工作', d: '看岗位,做简历×JD 匹配。', Icon: Briefcase },
];

/** 真服务端取数:RSC 内并发 await /profile、/profile/overview、/interview,首屏即有数据。 */
async function GrowthHome() {
  const [profile, ov, listRaw] = await Promise.all([
    serverGet<Profile>('/profile'),
    serverGet<Overview>('/profile/overview'),
    serverGet<{ interviews: Interview[] } | Interview[]>('/interview'),
  ]);

  const interviews: Interview[] = listRaw
    ? (Array.isArray(listRaw) ? listRaw : listRaw.interviews ?? [])
    : [];
  const sessions = Object.values(ov?.interviewsByStatus ?? {}).reduce((a, b) => a + b, 0) || interviews.length;
  const recent = interviews.slice(0, 4);

  const stats = [
    { n: ov ? String(ov.answered) : '—', l: '已答题数' },
    { n: ov ? String(ov.reportsReady) : '—', l: '就绪报告' },
    { n: String(sessions), l: '面试场次' },
  ];

  return (
    <div className="space-y-10">
      {/* ── 欢迎头:温暖问候 + 账户态 ── */}
      <header>
        <span className="text-xs font-medium uppercase tracking-wide text-primary">欢迎回来</span>
        <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">继续打磨你的面试表现</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {profile ? (
            <>
              <span>{profile.email}</span>
              <Separator orientation="vertical" className="h-3.5" />
              <span>账户状态</span>
              <Badge variant="outline">{profile.status}</Badge>
            </>
          ) : '账户信息暂不可用'}
        </div>
      </header>

      {/* ── 当前水平(分数环前置)+ stats ── */}
      <section className="grid gap-4 md:grid-cols-[260px_1fr]">
        <Card className="flex items-center gap-5 p-5">
          {ov?.avgScore != null ? <ScoreRing score={ov.avgScore} size={112} /> : (
            <div className="grid size-[112px] shrink-0 place-items-center rounded-full border-[7px] border-muted text-sm text-muted-foreground">尚无评分</div>
          )}
          <div>
            <div className="text-[13px] text-muted-foreground">当前水平</div>
            <div className="mt-1 text-sm leading-relaxed text-foreground">
              {ov?.avgScore != null
                ? '基于历次回答的平均评分,完成更多面试可让它更准。'
                : '完成第一场面试后,这里会画出你的分数。'}
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card key={s.l} className="p-5 transition-colors hover:border-primary">
              <div className="text-[26px] font-extrabold tracking-tight tabular-nums">{s.n}</div>
              <div className="mt-0.5 text-[13px] text-muted-foreground">{s.l}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── 最近面试(真实行:状态 + 进度 + 入口)── */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold tracking-tight">最近面试</h2>
          {recent.length > 0 && (
            <Link href="/interviews" className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline">查看全部 →</Link>
          )}
        </div>
        {recent.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">还没有面试,开始第一场。</p>
              <Button asChild><Link href="/interviews">开始模拟面试 <ArrowRight /></Link></Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <ul>
              {recent.map((it, i) => {
                const done = it.status === 'completed';
                return (
                  <li key={it.id}>
                    {i > 0 && <Separator />}
                    <div className="flex flex-wrap items-center gap-3 p-4">
                      <StatusBadge status={it.status} />
                      <span className="flex-1 text-sm text-muted-foreground">
                        {done ? '已完成 · 报告已就绪' : `进行至第 ${(it.current_question_index ?? 0) + 1} 题`}
                      </span>
                      <Button asChild variant="outline" size="sm">
                        {/* 完成→看报告,未完成→回到面试,避免点进尚未生成的报告(无死胡同)。 */}
                        <Link href={done ? `/report/${it.id}` : `/interview/${it.id}`}>{done ? '查看报告 →' : '继续作答 →'}</Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>

      {/* ── 继续成长(克制 CTA)── */}
      <section>
        <h2 className="mb-4 text-lg font-bold tracking-tight">继续成长</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.href} href={a.href} className="group">
              <Card className="h-full p-5 transition-colors hover:border-primary">
                <div className="flex items-center gap-2">
                  <span className={`grid size-9 place-items-center rounded-md ${a.primary ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground group-hover:text-primary'}`}>
                    <a.Icon className="size-4" />
                  </span>
                  <div className="font-semibold">{a.t}</div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.d}</p>
                <span className={`mt-3 inline-flex items-center gap-1 text-sm ${a.primary ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>前往 <ArrowRight className="size-3.5" /></span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/** 成长主页骨架:与真实版面同构(欢迎头 + 分数环 + stats + 最近面试列表),流式 SSR 时占位不抖动、不死白。 */
function DashboardSkeleton() {
  return (
    <div className="space-y-10" aria-hidden>
      <header className="space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </header>
      <section className="grid gap-4 md:grid-cols-[260px_1fr]">
        <Card className="flex items-center gap-5 p-5">
          <Skeleton className="size-[112px] rounded-full" />
          <div className="flex-1 space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div>
        </Card>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-5"><Skeleton className="h-8 w-12" /><Skeleton className="mt-2 h-3 w-16" /></Card>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <Card className="overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              {i > 0 && <Separator />}
              <div className="flex items-center gap-3 p-4"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-4 flex-1" /><Skeleton className="h-8 w-24 rounded-md" /></div>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}

export default async function DashboardPage() {
  if (!(await getServerToken())) redirect('/login');     // 服务端鉴权门(无 cookie 直接服务端跳转,不发任何页面 JS)
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Suspense 流式 SSR:外壳先到,数据 section 服务端拉完再流式补上 */}
      <Suspense fallback={<DashboardSkeleton />}>
        <GrowthHome />
      </Suspense>
    </main>
  );
}
