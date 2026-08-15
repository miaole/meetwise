import './globals.css';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { Nav } from '../components/Nav';
import { Toaster } from '../components/ui/sonner';
import { resolvePublicSiteUrl } from '@/lib/public-site';

const SITE = resolvePublicSiteUrl();
const DESC = 'Meetwise 知面项目预览：围绕真实经历进行简历练习、模拟面试与个人复盘；实际开放能力以页面说明为准。';

/** 全站 SEO 元数据(服务端注入):title 模板、description、Open Graph、Twitter、canonical、robots。RSC 已让内容可爬,这里补元数据层。 */
export const metadata: Metadata = {
  metadataBase: SITE ?? undefined,
  title: { default: 'Meetwise 知面 · AI 面试准备', template: '%s · 知面 Meetwise' },
  description: DESC,
  keywords: ['AI面试', '模拟面试', '面试准备', '简历优化', '技术面试', '押题', '知面', 'Meetwise'],
  applicationName: 'Meetwise 知面',
  authors: [{ name: 'Meetwise' }],
  alternates: SITE ? { canonical: '/' } : undefined,
  openGraph: { title: 'Meetwise 知面 · AI 面试准备', description: DESC, type: 'website', locale: 'zh_CN', siteName: 'Meetwise 知面', url: SITE?.toString() },
  twitter: { card: 'summary_large_image', title: 'Meetwise 知面 · AI 面试准备', description: DESC },
  robots: SITE ? { index: true, follow: true, googleBot: { index: true, follow: true } } : { index: false, follow: false },
};

/** 多端 viewport:device-width 适配 PC/H5,允许放大(无障碍)。themeColor=琥珀(design-kit 主色)。 */
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 5, themeColor: '#B5651D' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();          // i18n:locale 取自 cookie
  return (
    <html lang={locale}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* NextIntlClientProvider 把文案传给客户端组件;Server Component 用 getTranslations */}
        <NextIntlClientProvider>
          {/* Nav 通栏(自带全宽 sticky 头部 bar);主体内容单独居中容器 */}
          <Nav />
          <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:px-6">
            {children}
          </div>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
