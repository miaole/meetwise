import { getTranslations } from 'next-intl/server';
import { Spinner } from '@/components/ui/Spinner';
// 根加载态(配合 RSC 流式 SSR):导航/取数时给即时反馈,不白屏。品牌琥珀环 + reduced-motion 安全。
export default async function Loading() {
  const t = await getTranslations('common');
  return (
    <div className="flex items-center gap-2 py-12 text-muted-foreground" aria-busy="true">
      <Spinner label={t('loadingAria')} />{t('loading')}
    </div>
  );
}
