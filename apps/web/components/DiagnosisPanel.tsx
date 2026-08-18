'use client';
/**
 * 简历诊断面板:消费 useDiagnosisStream(SSE 驱动)。据简历逐维度诊断,边生成边渲染——结构/完整性/亮点/风险/岗位匹配度
 * + **可改写建议**(红笔批注:原句→改写句,只优化表达、绝不虚构经历)。每条结论带**接地依据**(refs,非幻觉)。
 * 无死胡同由 diagnosis-state 视图模型保证:加载/错误/空/不可用都有出口(重试/返回)。amber/serif design-kit。
 */
import Link from 'next/link';
import { Loader2, ListChecks, Sparkle, AlertTriangle, Target, FileText, PencilLine, CheckCircle2 } from 'lucide-react';
import { useDiagnosisStream } from '@/lib/hooks/useDiagnosisStream';
import { Markdown } from '@/components/Markdown';
import { Thinking } from '@/components/ui/Thinking';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { DiagSection } from '@/lib/stream/diagnosis-state';

const KIND_META: Record<string, { label: string; Icon: typeof ListChecks; tone: string }> = {
  structure: { label: '结构与排版', Icon: ListChecks, tone: 'text-brand-deep' },
  completeness: { label: '完整性', Icon: FileText, tone: 'text-brand-deep' },
  highlight: { label: '亮点', Icon: Sparkle, tone: 'text-primary' },
  risk: { label: '风险 / 硬伤', Icon: AlertTriangle, tone: 'text-destructive' },
  match: { label: '岗位匹配度', Icon: Target, tone: 'text-brand-deep' },
};

/** 维度评分条(amber 描画,稀缺地落在分数)。 */
function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} className="h-1.5 w-24" />
      <span className="text-xs font-semibold tabular-nums text-primary">{Math.round(score)}</span>
    </div>
  );
}

function SectionCard({ s }: { s: DiagSection }) {
  const meta = KIND_META[s.kind] ?? { label: s.title || s.kind, Icon: ListChecks, tone: 'text-brand-deep' };
  const { Icon } = meta;
  return (
    <li>
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${meta.tone}`}><Icon className="size-4" />{s.title || meta.label}</span>
            {typeof s.score === 'number' && <span className="ml-auto"><ScoreBar score={s.score} /></span>}
          </div>
          {s.findings.length === 0 ? (
            <p className="text-xs text-muted-foreground">该维度无显著发现。</p>
          ) : (
            <ul className="space-y-2.5">
              {s.findings.map((f, i) => (
                <li key={i} className="text-sm leading-relaxed">
                  <div className="font-serif"><Markdown>{f.text}</Markdown></div>
                  {f.refs.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">依据</span>
                      {f.refs.map((r, k) => (
                        <Badge key={k} variant="outline" className="border-primary/30 bg-secondary/60 px-1.5 py-0 text-[11px] text-brand-deep">{r}</Badge>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </li>
  );
}

export function DiagnosisPanel({ diagnosisId }: { diagnosisId: string }) {
  const { view, display } = useDiagnosisStream(diagnosisId);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header className="flex items-center justify-between border-b pb-3">
        <h2 className="font-serif text-lg font-semibold tracking-tight">简历诊断 · 结构 / 亮点 / 风险 / 匹配度</h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={`size-1.5 rounded-full ${view.connection === 'live' && view.phase !== 'ready' ? 'animate-pulse bg-primary' : view.phase === 'ready' ? 'bg-primary' : 'bg-muted-foreground'}`} />
          {view.connection === 'reconnecting' ? '重连中…' : view.phase === 'ready' ? '已完成' : view.phase === 'generating' ? '诊断中' : '连接中'}
        </span>
      </header>

      {/* 练习反馈数值：不是能力认证或招聘用途评分。 */}
      {view.phase === 'ready' && typeof view.overall === 'number' && (
        <Card className="border-primary/20 bg-accent">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex items-baseline gap-0.5">
              <span className="text-4xl font-extrabold tracking-tight text-primary tabular-nums">{Math.round(view.overall)}</span>
              <span className="text-sm text-muted-foreground">/100 · 练习反馈</span>
            </div>
            <div className="flex-1 space-y-1 text-sm leading-relaxed text-accent-foreground">
              {view.summary && <p>{view.summary}</p>}
              <p className="text-xs text-muted-foreground">仅供个人复盘，不代表经校准的能力评定，也不能用于招聘筛选、排名或录用决定。</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 逐维度诊断:边到边渲染 */}
      <ol className="space-y-4">
        {view.sections.map((s, i) => <SectionCard key={i} s={s} />)}
      </ol>

      {/* 可改写建议(红笔批注:原句 → 改写句,只优化表达、绝不虚构经历) */}
      {view.rewrites.length > 0 && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-1.5 font-serif text-base font-semibold text-brand-deep"><PencilLine className="size-4 text-primary" />可改写建议</h3>
          <ul className="space-y-3">
            {view.rewrites.map((r, i) => (
              <li key={i}>
                <Card className="overflow-hidden">
                  <div className="bg-secondary px-4 py-2 text-xs text-muted-foreground line-through decoration-destructive/50">{r.before}</div>
                  <Separator />
                  {/* 红笔批注块:主色左边线 + 暖底,签名视觉母题。 */}
                  <div className="rounded-r-md border-l-2 border-primary bg-accent px-4 py-3 text-[13px] leading-relaxed text-ink2">
                    <b className="text-primary">改写批注</b>　<span className="font-serif">{r.after}</span>
                    {r.refs.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">锚定真实经历</span>
                        {r.refs.map((x, k) => <Badge key={k} variant="outline" className="border-primary/30 bg-background px-1.5 py-0 text-[11px] text-brand-deep">{x}</Badge>)}
                      </div>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground">改写仅优化表达与量化措辞,均锚定你简历中的真实经历——绝不为你编造未曾有过的经历。</p>
        </section>
      )}

      {/* 生成中(有明确进展预期才转圈;复用共享 Thinking) */}
      {display.spinner && (
        view.phase === 'generating'
          ? <Thinking label={display.message} />
          : <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin motion-reduce:hidden" />{display.message}</p>
      )}
      {/* 重连/连接态出口(即便未 degraded 也给手动重试) */}
      {!display.degraded && display.action.kind === 'retry' && (
        <Button variant="outline" onClick={(e) => { e.currentTarget.disabled = true; e.currentTarget.setAttribute('aria-busy', 'true'); location.reload(); }} className="disabled:cursor-not-allowed disabled:opacity-50">{display.action.label}</Button>
      )}

      {/* 完成总结 / 空诊断出口 */}
      {view.phase === 'ready' && (
        <Card className="border-primary/20 bg-accent">
          <CardContent className="p-4 text-sm text-accent-foreground">
            <p className="flex items-center gap-2 font-medium text-brand-deep"><CheckCircle2 className="size-4" />{display.message}</p>
            {(view.total ?? view.sections.length) === 0 ? (
              <p className="mt-2 text-muted-foreground">本次未能从简历中提取到可诊断的内容。请完善简历后<Link href="/diagnosis" className="font-medium text-primary underline-offset-4 hover:underline">重新诊断</Link>。</p>
            ) : view.sections.length === 0 && (
              <button onClick={(e) => { e.currentTarget.disabled = true; e.currentTarget.setAttribute('aria-busy', 'true'); location.reload(); }} className="mt-2 text-sm text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50">内容加载不全？点此重新加载</button>
            )}
            <Button asChild variant="link" className="mt-2 h-auto p-0"><Link href="/quiz">据这份简历去押题 →</Link></Button>
          </CardContent>
        </Card>
      )}

      {/* 降级/出错:始终给出口(重试/返回),绝不死等 */}
      {display.degraded && (
        <div role="alert" className="space-y-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <p className="font-medium">{display.heading}</p>
          <p>{display.message}</p>
          <div className="flex gap-3 pt-1">
            <Button asChild variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"><Link href="/diagnosis">{display.action.label}</Link></Button>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link href="/dashboard">返回主页</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
