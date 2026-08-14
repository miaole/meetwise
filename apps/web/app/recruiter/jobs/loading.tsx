import { Skeleton } from '@/components/ui/Skeleton';

// 路由级加载态:招聘方岗位页同构占位——标题 + 发布卡 + 我的岗位列表。
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <Skeleton className="mb-1 h-5 w-32" />
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg border p-3">
            <div className="flex items-center justify-between"><Skeleton className="h-4 w-36" /><Skeleton className="h-5 w-16 rounded-full" /></div>
            <div className="mt-2 flex gap-1"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
