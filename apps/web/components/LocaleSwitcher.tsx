import { getLocale } from 'next-intl/server';
import { setLocaleAction } from '@/app/locale-actions';
import { LocaleSwitchButton } from '@/components/LocaleSwitchButton';

/** 语言切换(Server Component + Server Action):中/英,当前语言高亮;提交态由 LocaleSwitchButton 给即时反馈。 */
export async function LocaleSwitcher() {
  const locale = await getLocale();
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <LocaleSwitchButton action={setLocaleAction} value="zh" label="中" active={locale === 'zh'} />
      <span>/</span>
      <LocaleSwitchButton action={setLocaleAction} value="en" label="EN" active={locale === 'en'} />
    </span>
  );
}
