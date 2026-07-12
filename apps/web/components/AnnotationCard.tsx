import { AbilityBar } from './AbilityBar';

/**
 * 报告批注卡 —— 知面签名组件(设计语言 §3)。
 * 浅色头(题目 + 主色「评估」点)→ 题/我的答案 → 主色左边线的「点评」块(bg-accent)→ 分数 + 能力条。
 * 与首屏 hero 批注卡同一视觉母题。服务端组件友好。
 */
export function AnnotationCard({
  question,
  answer,
  note,
  score,
  dims,
}: {
  question: string;
  answer?: string;
  note?: string;
  score?: number;
  dims?: { label: string; value: number }[];
}) {
  const hasFooter = score != null || (dims && dims.length > 0);
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-[0_1px_0_rgba(26,26,26,.03),0_8px_24px_-18px_rgba(26,26,26,.25)]">
      <div className="flex items-center justify-between border-b bg-secondary px-4 py-3 text-xs text-muted-foreground">
        <span>题目</span>
        <span className="inline-flex items-center gap-1.5 text-primary">
          <span className="size-1.5 rounded-full bg-primary" />评估
        </span>
      </div>
      <div className="p-5">
        <div className="font-medium leading-relaxed">{question}</div>
        {answer ? <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{answer}</div> : null}
        {note ? (
          <div className="mt-4 rounded-r-md border-l-2 border-primary bg-accent px-4 py-3 text-[13px] leading-relaxed text-ink2">
            <b className="text-primary">点评</b>　{note}
          </div>
        ) : null}
        {hasFooter ? (
          <div className="mt-5 flex items-center gap-6">
            {score != null ? (
              <div className="flex items-baseline gap-0.5">
                <span className="text-4xl font-extrabold tracking-tight text-primary tabular-nums">{Math.round(score)}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            ) : null}
            {dims && dims.length > 0 ? (
              <div className="flex-1 space-y-2">
                {dims.map((d) => (
                  <AbilityBar key={d.label} label={d.label} value={d.value} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
