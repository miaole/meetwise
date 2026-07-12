import { Skeleton } from '@/components/ui/Skeleton';

// 路由级加载态:导航到主页时(服务端鉴权门阶段)即时占位,随后由页面内 Suspense 接管流式数据。
export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6" aria-busy="true">
      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mt-12 grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-5"><Skeleton className="h-8 w-12" /><Skeleton className="mt-2 h-3 w-16" /></div>
        ))}
      </div>
    </main>
  );
}
