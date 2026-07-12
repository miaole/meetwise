'use client';
/**
 * 押题面板:消费 useQuizStream(SSE 驱动)。据简历预测的面试题边生成边渲染——每题含**接地考察点**(refs,非幻觉)+ **追问提示**。
 * 无死胡同由 quiz-state 视图模型保证:加载(spinner)/错误/空/不可用都有出口(重试/返回)。amber/serif design-kit。
 */
import Link from 'next/link';
import { Sparkle, Target, CornerDownRight, CheckCircle2 } from 'lucide-react';
import { useQuizStream } from '@/lib/hooks/useQuizStream';
import { Markdown } from '@/components/Markdown';
import { Thinking } from '@/components/ui/Thinking';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

/** 押题生成中的占位题卡:与真实题卡同构(预测题徽章 + 题干行 + 考察点 pill),边到边时填满版面不抖动。 */
function QuizSkeletonCard() {
  return (
    <Card aria-hidden>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="ml-auto h-3 w-10" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />
        <div className="mt-3 flex gap-1.5 border-t pt-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function QuizPanel({ quizId }: { quizId: string }) {
  const { view, display } = useQuizStream(quizId);

  // 进度:已到题数 / 预期总题数(无 total 时退化为不确定)。
  const total = view.total ?? 0;
  const generating = display.spinner && (view.phase === 'generating' || view.phase === 'connecting');

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header className="flex items-center justify-between border-b pb-3">
        <h2 className="font-serif text-lg font-semibold tracking-tight">押题 · 预测面试题</h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={`size-1.5 rounded-full ${view.connection === 'live' && view.phase !== 'ready' ? 'animate-pulse bg-primary' : view.phase === 'ready' ? 'bg-primary' : 'bg-muted-foreground'}`} />
          {view.connection === 'reconnecting' ? '重连中…' : view.phase === 'ready' ? '已完成' : view.phase === 'generating' ? '生成中' : '连接中'}
        </span>
      </header>

      {/* 生成进度条(已到题 / 预期总题数):有明确总数时给确定进度,边生成边推进。 */}
      {generating && total > 0 && (
        <div className="space-y-1.5">
          <Progress value={Math.min(100, (view.questions.length / total) * 100)} />
          <p className="text-right text-xs text-muted-foreground tabular-nums">{view.questions.length} / {total} 题</p>
        </div>
      )}

      {/* 押题列表:边到边渲染。每题=题干(Markdown)+ 考察点(refs)+ 追问提示。 */}
      <ol className="space-y-4">
        {view.questions.map((q, i) => (
          <li key={i}>
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <Badge variant="success" className="gap-1"><Sparkle className="size-3" />预测题</Badge>
                  <span className="ml-auto text-muted-foreground">第 {i + 1} 题</span>
                </div>
                <div className="font-serif leading-relaxed"><Markdown>{q.q}</Markdown></div>
                {q.refs.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <Separator />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><Target className="size-3.5" />考察点</span>
                      {q.refs.map((r, k) => (
                        <Badge key={k} variant="outline" className="border-primary/30 bg-secondary/60 text-brand-deep">{r}</Badge>
                      ))}
                    </div>
                    {/* 追问提示:UI 派生的备战提示(非模型臆造数据)——答得浅,面试官常就考察点深挖。 */}
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <CornerDownRight className="mt-0.5 size-3.5 shrink-0" />
                      可能追问：就「{q.refs.join('、')}」追问原理、权衡与踩坑，建议准备具体案例与数据。
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
        {/* 生成中的占位题卡:首屏(还没题)给 3 张,边到边后给 1 张暗示"下一题在路上"——平滑、不死白。 */}
        {generating &&
          Array.from({ length: view.questions.length === 0 ? 3 : 1 }).map((_, i) => <li key={`sk-${i}`}><QuizSkeletonCard /></li>)}
      </ol>

      {/* 生成中(有明确进展预期才"思考中",不是裸 spinner) */}
      {display.spinner && (
        <Card className="bg-secondary/40">
          <CardContent className="flex items-center px-3.5 py-3">
            <Thinking label={display.message || '正在押题'} />
          </CardContent>
        </Card>
      )}
      {/* 重连/连接态:即便未 degraded 也给手动出口(专家审计:reconnecting 时 quizDisplay 给 retry,但旧版只在 degraded 块渲染→按钮丢失)。 */}
      {!display.degraded && display.action.kind === 'retry' && (
        <Button variant="outline" onClick={(e) => { e.currentTarget.disabled = true; e.currentTarget.setAttribute('aria-busy', 'true'); location.reload(); }} className="disabled:cursor-not-allowed disabled:opacity-50">{display.action.label}</Button>
      )}

      {/* 完成总结(接地报告) */}
      {view.phase === 'ready' && (
        <Card className="border-primary/20 bg-accent">
          <CardContent className="p-4 text-sm text-accent-foreground">
            <p className="flex items-center gap-2 font-medium text-brand-deep"><CheckCircle2 className="size-4" />{display.message}</p>
            {view.report?.summary && <p className="mt-1 text-muted-foreground">{view.report.summary}</p>}
            {(view.total ?? view.questions.length) === 0 ? (
              <p className="mt-2 text-muted-foreground">本次未能从简历中提取到可接地的题目。请完善简历后<Link href="/quiz" className="font-medium text-primary underline-offset-4 hover:underline">重新押题</Link>。</p>
            ) : view.questions.length === 0 && (
              // 终态已到但题目事件未随重放到达(罕见):给"重新加载"出口,不显示误导的"未提取到题目"。
              <button onClick={(e) => { e.currentTarget.disabled = true; e.currentTarget.setAttribute('aria-busy', 'true'); location.reload(); }} className="mt-2 text-sm text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50">题目加载不全？点此重新加载</button>
            )}
            <Button asChild variant="link" className="mt-2 h-auto p-0"><Link href="/interviews">用这些题去模拟面试 →</Link></Button>
          </CardContent>
        </Card>
      )}

      {/* 降级/出错:始终给出口(重试/返回),绝不死等 */}
      {display.degraded && (
        <div role="alert" className="space-y-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <p className="font-medium">{display.heading}</p>
          <p>{display.message}</p>
          <div className="flex gap-3 pt-1">
            <Button asChild variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"><Link href="/quiz">{display.action.label}</Link></Button>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link href="/dashboard">返回主页</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
