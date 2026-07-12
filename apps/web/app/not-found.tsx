import Link from 'next/link';
import { Button } from '@/components/ui/button';
// 404 页(修审计 #6):找不到的路由有可读出口,不落默认裸 404。
export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="text-2xl font-bold">页面不存在</h1>
      <p className="mt-2 text-muted-foreground">你要找的页面不存在或已移动。</p>
      <div className="mt-5 flex justify-center gap-3">
        <Button asChild><Link href="/">返回首页</Link></Button>
        <Button asChild variant="outline"><Link href="/dashboard">进入总览</Link></Button>
      </div>
    </div>
  );
}
