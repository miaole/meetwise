'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/** 切换语言:设 locale cookie(next-intl 据此选文案)。无路由重构,刷新当前页即生效。 */
export async function setLocaleAction(formData: FormData) {
  const locale = formData.get('locale') === 'en' ? 'en' : 'zh';
  (await cookies()).set('locale', locale, { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' });
  revalidatePath('/', 'layout');
}
