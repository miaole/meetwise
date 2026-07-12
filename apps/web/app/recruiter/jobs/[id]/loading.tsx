import { Skeleton } from '@/components/ui/Skeleton';

// 路由级加载态:招聘方岗位详情同构占位——岗位头 + 候选人列表。
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <Skeleton className="mb-1 h-5 w-32" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border p-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
