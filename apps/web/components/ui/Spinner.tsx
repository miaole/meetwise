import { cn } from '@/lib/utils';

/**
 * 品牌转圈(琥珀环):短促、确定性的等待指示,用于按钮内/小范围加载。
 * reduced-motion 下停转为静态环(见 globals.css),仍是清晰的"加载中"形态。
 */
export function Spinner({ className, label = '加载中' }: { className?: string; label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('mw-spin inline-block size-4 shrink-0 rounded-full border-2 border-primary/25 border-t-primary', className)}
    />
  );
}
