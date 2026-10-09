'use server';
import { redirect } from 'next/navigation';
import { serverFetch } from '../../lib/api/server';
import { revalidatePath } from 'next/cache';

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

/**
 * 账户注销 + 发起账户级删除（UNSTUB-ERASE rev2 · #236 语义）：POST /profile/deactivate
 * （密码复核）→ 202 {mode:'logical', purgePending:true, deletedAt}。注销后立即登出且
 * 无法再登录；关联数据停止一切处理与访问，后台清除稍后完成；清除完成前同一邮箱无法
 * 重新注册——本 action 只受理,绝不宣称「已彻底删除」。
 */
export type DeactivateActionState = { ok?: boolean; error?: string };

export async function deactivateAction(
  _prev: DeactivateActionState,
  formData: FormData,
): Promise<DeactivateActionState> {
  const password = String(formData.get('password') ?? '');
  if (!password) return { error: '请输入密码以确认注销。' };
  let res: Response;
  try {
    res = await serverFetch('/profile/deactivate', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  } catch {
    return { error: '网络错误,请稍后重试;账户未注销。' };
  }
  if (res.status === 400) return { error: '请输入密码以确认注销。' };
  if (res.status === 401) return { error: '密码不正确,账户未注销。' };
  if (res.status === 404) return { error: '账户状态异常,未执行注销。' };
  if (res.status !== 202) return { error: '注销请求未受理(' + res.status + '),未当作已注销。' };
  const body = await res.json().catch(() => null) as { mode?: string; purgePending?: boolean } | null;
  if (body?.mode !== 'logical' || body?.purgePending !== true) {
    return { error: '注销受理形状不合法,未当作已注销。' };
  }
  revalidatePath('/settings');
  // 会话已被服务端吊销:硬导航到登录页,带注销完成态(不伪装成「数据已彻底删除」)。
  redirect('/login?deactivated=1');
}
