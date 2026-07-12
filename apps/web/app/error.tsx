'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// 根错误边界(修审计 #6,无死胡同铁律):任何 RSC/Server Action 抛错都落这里,给可读信息 + 重试 + 回家。
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="text-2xl font-bold">出错了</h1>
      <p className="mt-2 text-muted-foreground">页面遇到一个错误,可以重试;若反复出现请稍后再来。</p>
      {error?.digest && <p className="mt-1 text-xs text-muted-foreground">错误标识:{error.digest}</p>}
      <div className="mt-5 flex justify-center gap-3">
        <Button onClick={reset}>重试</Button>
        <Button asChild variant="outline"><Link href="/dashboard">返回总览</Link></Button>
      </div>
    </div>
  );
}
