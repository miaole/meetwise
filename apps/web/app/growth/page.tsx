import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react';
import { getServerToken, serverGet } from '@/lib/api/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScoreRing } from '@/components/ScoreRing';
import { AbilityBar } from '@/components/AbilityBar';
import { GrowthChart } from '@/components/GrowthChart';
import { listWindow, withLimitHref } from '@/lib/paginate';

const PAGE = 20;          // 训练历程时间线封顶首屏渲染(曲线仍用全量点,见 GrowthChart 抽样)

export const metadata = { title: '成长档案 · 知面' };

interface GrowthPoint { at: string; interviewId: string; overall: number | null; dims: Record<string, number> }
interface GrowthView {
  points: GrowthPoint[];
  dimensions: string[];
  totals: { sessions: number; answered: number; bestScore: number | null; latestScore: number | null; trend: 'up' | 'down' | 'flat' | 'none' };
}

const TREND: Record<string, { label: string; Icon: typeof TrendingUp; variant: 'success' | 'destructive' | 'secondary' }> = {
  up: { label: '上升中', Icon: TrendingUp, variant: 'success' },
  down: { label: '有回落', Icon: TrendingDown, variant: 'destructive' },
  flat: { label: '持平', Icon: Minus, variant: 'secondary' },
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 真服务端取数:RSC 内拉 /profile/growth(读侧聚合,RLS 限己),渲染能力曲线 + 时间线 + 汇总。 */
async function GrowthArchive({ limit }: { limit?: string }) {
  const g = await serverGet<GrowthView>('/profile/growth');

  // 取数失败:降级而非死白(无死胡同)。
  if (!g) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-muted-foreground">成长数据暂不可用,稍后再试。</p>
          <Button asChild variant="outline"><Link href="/dashboard">返回主页</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const { points, totals } = g;

  // 鼓励态:不足两场画不出曲线(0/1 场不臆造方向)。
  if (points.length < 2) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          {totals.latestScore != null ? <ScoreRing score={totals.latestScore} size={96} /> : (
            <div className="grid size-24 place-items-center rounded-full border-[6px] border-muted text-xs text-muted-foreground">尚无评分</div>
          )}
          <div className="space-y-1">
            <p className="font-serif text-lg font-bold">再完成一场,这里就会画出你的成长曲线</p>
            <p className="text-sm text-muted-foreground">
              {points.length === 1 ? '已经有第一场了,再来一场就能看到趋势对比。' : '完成模拟面试并生成评估,即可开始记录能力演进。'}
            </p>
          </div>
          <Button asChild><Link href="/interviews">开始模拟面试 <ArrowRight className="size-4" /></Link></Button>
        </CardContent>
      </Card>
    );
  }

  const trend = TREND[totals.trend];
  // 时间线:最新在上;delta = 本场 overall − 上一场 overall(按时间序)。
  const timeline = points
    .map((p, i) => ({ p, delta: i > 0 && p.overall != null && points[i - 1].overall != null ? p.overall - (points[i - 1].overall as number) : null }))
    .reverse();
  const tlWin = listWindow(timeline, limit, PAGE);
  const latest = points[points.length - 1];
  const latestDims = Object.entries(latest.dims).sort((a, b) => a[1] - b[1]); // 弱项在前

  return (
    <div className="space-y-10">
      {/* ── 汇总头:最新水平 + 趋势 + 最佳 ── */}
      <header>
        <span className="text-xs font-medium uppercase tracking-wide text-primary">成长档案</span>
        <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">综合能力随训练演进</h1>
        <p className="mt-2 text-sm text-muted-foreground">基于 {totals.sessions} 场已评估面试的真实综合得分,逐场画出你的进步轨迹。</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          {totals.latestScore != null ? <ScoreRing score={totals.latestScore} size={92} label="最新" /> : <div className="grid size-[92px] place-items-center rounded-full border-[6px] border-muted text-xs text-muted-foreground">—</div>}
          <div>
            <div className="text-[13px] text-muted-foreground">最新综合分</div>
            {trend && <Badge variant={trend.variant} className="mt-1 gap-1"><trend.Icon className="size-3" />{trend.label}</Badge>}
          </div>
        </Card>
        <Card className="flex flex-col justify-center p-5">
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground"><Trophy className="size-3.5" />最佳成绩</div>
          <div className="mt-1 text-[30px] font-extrabold tabular-nums">{totals.bestScore ?? '—'}<span className="ml-1 text-sm font-normal text-muted-foreground">/100</span></div>
        </Card>
        <Card className="flex flex-col justify-center p-5">
          <div className="text-[13px] text-muted-foreground">训练量</div>
          <div className="mt-1 text-[30px] font-extrabold tabular-nums">{totals.sessions}<span className="ml-1 text-sm font-normal text-muted-foreground">场</span></div>
          <div className="mt-0.5 text-xs text-muted-foreground">累计答题 {totals.answered} 道</div>
        </Card>
      </section>

      {/* ── 综合能力曲线(实线=综合分,真实纵向信号);维度多场复现时叠加虚线 ── */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight">综合能力曲线</h2>
          <span className="text-xs text-muted-foreground">实线为历次综合得分</span>
        </div>
        <Card className="p-5">
          <GrowthChart points={points} />
        </Card>
      </section>

      {/* ── 最近一场各项表现(本场各题得分,非跨场能力维度;偏低项加强标注) ── */}
      {latestDims.length > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-bold tracking-tight">最近一场 · 各项表现</h2>
          <p className="mb-4 text-xs text-muted-foreground">本场各考察项的得分,偏低项(&lt;60)着重标注。</p>
          <Card className="space-y-2.5 p-5">
            {latestDims.map(([label, value]) => (
              <AbilityBar key={label} label={label} value={value} em={value < 60} />
            ))}
          </Card>
        </section>
      )}

      {/* ── 历程时间线 ── */}
      <section>
        <h2 className="mb-4 text-lg font-bold tracking-tight">训练历程</h2>
        <Card className="overflow-hidden">
          <ul>
            {tlWin.shown.map(({ p, delta }, i) => (
              <li key={p.interviewId}>
                {i > 0 && <Separator />}
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <span className="w-24 shrink-0 text-sm text-muted-foreground tabular-nums">{fmtDate(p.at)}</span>
                  <Badge variant={p.overall != null && p.overall >= 60 ? 'success' : 'secondary'} className="tabular-nums">{p.overall ?? '—'} 分</Badge>
                  {delta != null && delta !== 0 && (
                    <span className={`inline-flex items-center gap-0.5 text-xs tabular-nums ${delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                      {delta > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}{delta > 0 ? '+' : ''}{delta}
                    </span>
                  )}
                  <span className="flex-1" />
                  <Button asChild variant="outline" size="sm"><Link href={`/report/${p.interviewId}`}>查看报告 →</Link></Button>
                </div>
              </li>
            ))}
          </ul>
          {tlWin.hasMore && (
            <div className="border-t p-3 text-center">
              <Button asChild variant="ghost" size="sm">
                <Link href={withLimitHref('/growth', {}, tlWin.nextLimit)} scroll={false}>加载更多(还有 {tlWin.remaining} 场)</Link>
              </Button>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

function GrowthSkeleton() {
  return (
    <div className="space-y-10" aria-hidden>
      <header className="space-y-3"><Skeleton className="h-3 w-20" /><Skeleton className="h-9 w-2/3" /><Skeleton className="h-4 w-1/2" /></header>
      <section className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <Card key={i} className="p-5"><Skeleton className="h-16 w-full" /></Card>)}</section>
      <section className="space-y-4"><Skeleton className="h-6 w-24" /><Card className="p-5"><Skeleton className="h-56 w-full" /></Card></section>
    </div>
  );
}

export default async function GrowthPage({ searchParams }: { searchParams: Promise<{ limit?: string }> }) {
  if (!(await getServerToken())) redirect('/login');
  const { limit } = await searchParams;
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Suspense fallback={<GrowthSkeleton />}>
        <GrowthArchive limit={limit} />
      </Suspense>
    </main>
  );
}
