import { Skeleton } from '@/components/ui/Skeleton';

// 路由级加载态:计费页同构占位——标题 + 余额卡 + 商品卡网格。
export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-8" aria-busy="true">
      <Skeleton className="h-8 w-32" />
      <div className="mt-6 rounded-lg border bg-card p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-8 w-20" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-4 h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </main>
  );
}
