import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

// 路由级加载态:简历页同构占位——标题段 + 上传卡 + 简历行。
export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <SkeletonCard lines={3} />
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        ))}
      </div>
    </main>
  );
}
