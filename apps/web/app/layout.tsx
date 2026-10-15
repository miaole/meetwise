import './globals.css';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { Nav } from '../components/Nav';
import { PublicPreviewNav } from '../components/PublicPreviewNav';
import { Toaster } from '../components/ui/sonner';
import { resolvePublicSiteUrl } from '@/lib/public-site';
import { resolvePublicPreview } from '@/lib/public-preview';

const SITE = resolvePublicSiteUrl();
// og:locale 是结构 locale tag(zh_CN/en_US),非用户文案,走代码映射不入 messages;非 en 一律按缺省 zh。
const OG_LOCALE = { zh: 'zh_CN', en: 'en_US' } as const;

/** 全站 SEO 元数据(服务端注入):title 模板、description、Open Graph、Twitter、canonical、robots。RSC 已让内容可爬,这里补元数据层。文案走 messages meta namespace,随 cookie locale 出 zh/en。 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  const locale = await getLocale();
  return {
    metadataBase: SITE ?? undefined,
    title: { default: t('titleDefault'), template: t('titleTemplate') },
    description: t('description'),
    keywords: t('keywords').split(',').map(s => s.trim()).filter(Boolean),
    applicationName: t('applicationName'),
    authors: [{ name: 'Meetwise' }],
    alternates: SITE ? { canonical: '/' } : undefined,
    openGraph: { title: t('titleDefault'), description: t('description'), type: 'website', locale: OG_LOCALE[locale === 'en' ? 'en' : 'zh'], siteName: t('siteName'), url: SITE?.toString() },
    twitter: { card: 'summary_large_image', title: t('titleDefault'), description: t('description') },
    robots: SITE ? { index: true, follow: true, googleBot: { index: true, follow: true } } : { index: false, follow: false },
  };
}

/** 多端 viewport:device-width 适配 PC/H5,允许放大(无障碍)。themeColor=琥珀(design-kit 主色)。 */
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 5, themeColor: '#B5651D' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const publicPreview = resolvePublicPreview(process.env.MEETWISE_PUBLIC_PREVIEW);
  const previewReleaseDigest = publicPreview ? process.env.MEETWISE_PREVIEW_RELEASE_DIGEST : undefined;
  const locale = await getLocale();          // i18n:locale 取自 cookie
  return (
    <html lang={locale}>
      <head>{previewReleaseDigest ? <meta name="meetwise-preview-release" content={previewReleaseDigest} /> : null}</head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* NextIntlClientProvider 把文案传给客户端组件;Server Component 用 getTranslations */}
        <NextIntlClientProvider>
          {/* Nav 通栏(自带全宽 sticky 头部 bar);主体内容单独居中容器 */}
          {publicPreview ? <PublicPreviewNav /> : <Nav />}
          <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:px-6">
            {children}
          </div>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
