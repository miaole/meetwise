import { cn } from '@/lib/utils';

/**
 * "AI 思考中…" 等待态(amber/serif design-kit):柔脉冲文案 + 三点错相呼吸。
 * 用于「提交答案↔下一题」「押题生成中」「报告生成中」等模型在算、有明确进展预期的间隙——不是死白屏也不是裸 spinner。
 * 纯展示组件(无 'use client'),RSC/客户端通用。role=status + aria-live=polite:读屏可感知。reduced-motion 自动静态化。
 */
export function Thinking({ label = 'AI 思考中', className }: { label?: string; className?: string }) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <span className="mw-pulse-soft">{label}</span>
      <span className="inline-flex items-end gap-0.5 pb-0.5" aria-hidden>
        <span className="mw-dot size-1 rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
        <span className="mw-dot size-1 rounded-full bg-primary" style={{ animationDelay: '160ms' }} />
        <span className="mw-dot size-1 rounded-full bg-primary" style={{ animationDelay: '320ms' }} />
      </span>
    </span>
  );
}
