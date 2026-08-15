import { Skeleton } from '@/components/ui/Skeleton';

// 路由级加载态:通知页同构占位——标题 + 通知行列表。
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6" aria-busy="true">
      <Skeleton className="h-7 w-28" />
      <div className="mt-5 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-16" /></div>
            <Skeleton className="mt-2 h-3.5 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
