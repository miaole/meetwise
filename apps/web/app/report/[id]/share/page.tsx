import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getServerToken, serverGet } from '@/lib/api/server';
import { SharePoster, type PosterDim } from '@/components/SharePoster';

export const metadata = { title: '分享海报 · 知面' };

type ReportStatus = 'queued' | 'running' | 'ready' | 'failed' | 'quarantined';
type Report = { status: ReportStatus; content: { overall: number; sections: Array<{ title: string; body: string }> } | null };
type Dimension = { dimension: string; score: number; gap?: boolean; evidence?: string };
type Assessment = { status?: string; dimensions?: Dimension[]; overall?: number };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meetwise.example';

/** 按综合分给一句【通用】文案——无任何 PII / 简历 / 回答内容,仅按分档选词。 */
function tastefulLine(overall: number): string {
  if (overall >= 85) return '稳扎稳打,结构与表达都立住了';
  if (overall >= 70) return '在知面认真练过,临场更稳了';
  if (overall >= 55) return '正在把面试能力一点点磨出来';
  return '每一场练习,都是离 offer 更近一步';
}

/**
 * 裂变分享海报路由(运营层 §5)——owner 主动为自己的 READY 报告生成可分享海报。
 *
 * 鉴权 / 越权:复用已 RLS 收口的报告取数。未登录 → /login;
 * 非本人(RLS 命中不到)→ 上游 api 返 404/403 → serverGet 返 null → 走"暂不可用"出口,
 * 绝不可能渲染到他人分数。
 *
 * 隐私白名单:仅把【overall(整数)+ 维度名 + 维度分】挑出来传给客户端海报组件,
 * 显式丢弃 evidence(点评)、sections(正文)、gap 等一切可能携带简历/回答语义的字段。
 */
export default async function SharePosterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await getServerToken())) redirect('/login');

  const eid = encodeURIComponent(id);
  const report = await serverGet<Report>('/interview/' + eid + '/report');
  // Number.isFinite:typeof NaN === 'number' 会放过 NaN/Infinity,这里真校验,避免海报显示 "NaN"。
  const ready = report?.status === 'ready' && report?.content && Number.isFinite(report.content.overall);

  // 报告未就绪 / 不可用 / 越权 → 明确出口,不死等不死白屏。
  if (!ready) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="text-xs font-medium uppercase tracking-wide text-primary">分享海报</div>
        <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight">报告就绪后可生成海报</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          这场面试的报告还没生成完成,等报告就绪后再回来,就能一键生成专属的能力评估海报。
        </p>
        <Link
          href={'/report/' + id}
          className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> 返回报告
        </Link>
      </main>
    );
  }

  // ── 隐私白名单提取(关键审计点):只取聚合数值 + 维度名,丢弃一切文本/PII ──
  const overall = Math.max(0, Math.min(100, Math.round(report!.content!.overall)));
  const assessment = await serverGet<Assessment>('/interview/' + eid + '/assessment');
  const rawDims = Array.isArray(assessment?.dimensions) ? assessment!.dimensions! : [];
  // 隐私铁律(审计致命项):上游 `dimension` 实为「简历接地的面试题原文」——
  // packages/domain assessment.ts 取 question.slice(0,40),题面里嵌有雇主/项目/技术栈等简历事实。
  // 对外可分享海报【绝不渲染该字符串】:只保留聚合分值,维度名用中性序号占位,杜绝简历/PII 外泄。
  const dims: PosterDim[] = rawDims
    .filter((d) => d && typeof d.score === 'number' && Number.isFinite(d.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((d, i) => ({ name: '能力维度 ' + (i + 1), value: Math.max(0, Math.min(100, Math.round(d.score))) }));

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href={'/report/' + id}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> 返回报告
        </Link>
      </div>

      <header className="mb-7 text-center">
        <div className="text-xs font-medium uppercase tracking-wide text-primary">运营 · 分享海报</div>
        <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-3xl">生成你的能力评估海报</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          一张克制好看的成绩卡,只含综合评分与能力维度,不含任何简历或回答内容。分享到社交平台,邀请朋友一起练。
        </p>
      </header>

      <SharePoster overall={overall} dims={dims} line={tastefulLine(overall)} siteUrl={SITE} product="知面" />
    </main>
  );
}
