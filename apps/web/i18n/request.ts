import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const LOCALES = ['zh', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'zh';

/** i18n 请求配置(无路由重构):locale 取自 cookie,默认中文;按 locale 加载文案。 */
export default getRequestConfig(async () => {
  const cookie = (await cookies()).get('locale')?.value;
  const locale: Locale = (LOCALES as readonly string[]).includes(cookie ?? '') ? (cookie as Locale) : DEFAULT_LOCALE;
  return { locale, messages: (await import(`../messages/${locale}.json`)).default };
});
