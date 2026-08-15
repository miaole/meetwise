import { cn } from '@/lib/utils';

/**
 * 内容形状的骨架占位(amber/serif design-kit)。服务端取数/导航时填充版面,绝不死白屏。
 * mw-skeleton 暖纸微光,reduced-motion 自动降级为静态柔底(见 globals.css)。aria-hidden:纯装饰,不读屏。
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('mw-skeleton rounded-md', className)} />;
}

/** 多行文本骨架:最后一行更短,贴近真实段落。 */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

/** 卡片形状骨架:发丝线边 + 暖底,与真实内容卡同构,避免布局抖动。 */
export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', className)} aria-hidden>
      <Skeleton className="mb-3 h-4 w-1/3" />
      <SkeletonText lines={lines} />
    </div>
  );
}
