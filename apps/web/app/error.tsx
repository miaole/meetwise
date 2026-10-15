'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
// 根错误边界(修审计 #6,无死胡同铁律):任何 RSC/Server Action 抛错都落这里,给可读信息 + 重试 + 回家。
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errorBoundary');
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('description')}</p>
      {error?.digest && <p className="mt-1 text-xs text-muted-foreground">{t('digestLabel', { digest: error.digest })}</p>}
      <div className="mt-5 flex justify-center gap-3">
        <Button onClick={reset}>{t('retry')}</Button>
        <Button asChild variant="outline"><Link href="/dashboard">{t('backToDashboard')}</Link></Button>
      </div>
    </div>
  );
}
