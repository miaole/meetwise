import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
// 404 页(修审计 #6):找不到的路由有可读出口,不落默认裸 404。
export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('message')}</p>
      <div className="mt-5 flex justify-center gap-3">
        <Button asChild><Link href="/">{t('backHome')}</Link></Button>
        <Button asChild variant="outline"><Link href="/dashboard">{t('toOverview')}</Link></Button>
      </div>
    </div>
  );
}
