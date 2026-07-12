import { Skeleton } from '@/components/ui/Skeleton';

// 路由级加载态:岗位广场同构占位——标题 + 岗位卡列表 + 我的投递。
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="rounded-lg border bg-card p-4">
        <Skeleton className="mb-3 h-5 w-40" />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="flex items-center justify-between"><Skeleton className="h-4 w-40" /><Skeleton className="h-5 w-16 rounded-full" /></div>
              <div className="mt-2 flex gap-1"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
