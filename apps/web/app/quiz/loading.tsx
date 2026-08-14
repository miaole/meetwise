import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

// 路由级加载态:押题入口页同构占位——标题 + 选简历卡 + 历史押题列表。
export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6" aria-busy="true">
      <Skeleton className="h-8 w-32" />
      <SkeletonCard lines={2} />
      <ul className="divide-y divide-border rounded-lg border">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </li>
        ))}
      </ul>
    </main>
  );
}
