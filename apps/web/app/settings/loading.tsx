import { Skeleton } from '@/components/ui/Skeleton';

// 路由级加载态:设置页同构占位——标题 + 资料卡。
export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6" aria-busy="true">
      <Skeleton className="h-7 w-24" />
      <div className="mt-5 space-y-4 rounded-lg border bg-card p-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}
