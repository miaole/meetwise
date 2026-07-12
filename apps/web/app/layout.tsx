import './globals.css';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { Nav } from '../components/Nav';
import { Toaster } from '../components/ui/sonner';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meetwise.example';
const DESC = 'AI 驱动的面试准备:简历分析与优化、真题接地押题、自适应模拟面试(文字/语音)、能力评估与成长报告。';

/** 全站 SEO 元数据(服务端注入):title 模板、description、Open Graph、Twitter、canonical、robots。RSC 已让内容可爬,这里补元数据层。 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Meetwise 知面 · AI 面试准备', template: '%s · 知面 Meetwise' },
  description: DESC,
  keywords: ['AI面试', '模拟面试', '面试准备', '简历优化', '技术面试', '押题', '知面', 'Meetwise'],
  applicationName: 'Meetwise 知面',
  authors: [{ name: 'Meetwise' }],
  alternates: { canonical: '/' },
  openGraph: { title: 'Meetwise 知面 · AI 面试准备', description: DESC, type: 'website', locale: 'zh_CN', siteName: 'Meetwise 知面', url: SITE },
  twitter: { card: 'summary_large_image', title: 'Meetwise 知面 · AI 面试准备', description: DESC },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
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
