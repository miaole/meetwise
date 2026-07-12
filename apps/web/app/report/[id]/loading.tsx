import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

// 路由级加载态:报告页同构占位——返回条 + 报告头(标题 + 分数环) + 小结卡。
export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6" aria-busy="true">
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
      <header className="mb-8">
        <Skeleton className="h-3 w-16" />
        <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="size-[112px] shrink-0 rounded-full" />
        </div>
      </header>
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <Skeleton className="mb-3 h-4 w-1/3" />
            <SkeletonText lines={3} />
          </div>
        ))}
      </div>
    </main>
  );
}
