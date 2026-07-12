'use server';
import { serverFetch } from '../../lib/api/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function saveSettingsAction(formData: FormData) {
  const preferences = {
    lang: String(formData.get('lang') ?? 'zh'),
    notify: formData.get('notify') === 'on',
  };
  await serverFetch('/profile/settings', {
    method: 'PATCH',
    body: JSON.stringify({ preferences }),
  });
  revalidatePath('/settings');
}

/** 改密码:**显式反馈**(useActionState)。旧密码错 / 弱密码 / 网络错都返回可读 error,绝不静默吞掉
 *  (安全敏感操作静默"成功"是最坏的死点击)。成功返回 {ok} 供前端清表单 + 提示。 */
export async function changePasswordAction(
  _prev: { ok?: boolean; error?: string },
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const oldPassword = String(formData.get('oldPassword') ?? '');
  const newPassword = String(formData.get('newPassword') ?? '');
  if (newPassword.length < 8) return { error: '新密码至少 8 位' };
  let res: Response;
  try {
    res = await serverFetch('/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  } catch {
    return { error: '网络错误,请稍后重试' };
  }
  if (res.status === 400 || res.status === 401) return { error: '旧密码不正确,请重新输入' };
  if (!res.ok) return { error: '修改失败,请稍后重试(' + res.status + ')' };
  revalidatePath('/settings');
  return { ok: true };
}

export async function deactivateAction() {
  const res = await serverFetch('/profile/deactivate', { method: 'POST' });
  if (!res.ok) throw new Error(`deactivate_failed_${res.status}`);   // 注销失败 → 落错误边界,**绝不假装成功还把人登出**(误成功比报错更糟)
  (await cookies()).delete('mw_token');
  redirect('/login');
}
