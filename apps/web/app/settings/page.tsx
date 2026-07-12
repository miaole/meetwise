import { redirect } from 'next/navigation';
import { getServerToken, serverGet } from '../../lib/api/server';
import { saveSettingsAction, deactivateAction } from './actions';
import { ChangePasswordForm } from './ChangePasswordForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Label } from '@/components/ui/label';

export const metadata = { title: '设置 · 知面' };

type Profile = { id: string; email: string; status: string; preferences: Record<string, any> };

export default async function SettingsPage() {
  if (!(await getServerToken())) redirect('/login');

  const profile = await serverGet<Profile>('/profile');

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="mb-2 text-xl font-bold tracking-tight sm:text-2xl">账户设置</h1>
        <p className="text-sm text-muted-foreground">
          账户信息暂不可用,请
          <a href="/settings" className="text-primary hover:underline">重试</a>
          或
          <a href="/login" className="text-primary hover:underline">重新登录</a>
          。
        </p>
      </div>
    );
  }

  const pref = profile.preferences || {};
  const lang = typeof pref.lang === 'string' ? pref.lang : 'zh';
  const notify = pref.notify !== false;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="mb-2 text-xl font-bold tracking-tight sm:text-2xl">账户设置</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        邮箱:{profile.email} ・ 状态:{profile.status}
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>偏好设置</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveSettingsAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lang">界面语言</Label>
                <select
                  id="lang"
                  name="lang"
                  defaultValue={lang}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </div>
              <Label htmlFor="notify" className="flex items-center gap-2 font-normal">
                <input
                  id="notify"
                  type="checkbox"
                  name="notify"
                  defaultChecked={notify}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                接收邮件通知
              </Label>
              <SubmitButton pendingLabel="保存中…">保存偏好</SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">账户注销(危险操作)</CardTitle>
            <CardDescription className="text-destructive/80">
              注销后账户将被停用,需重新激活方可继续使用。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={deactivateAction}>
              <SubmitButton variant="destructive" pendingLabel="注销中…">注销账户</SubmitButton>
            </form>
          </CardContent>
        </Card>
        <p className="text-sm"><a href="/privacy" className="text-muted-foreground hover:text-foreground">隐私与数据(导出 / 删除我的数据)→</a></p>
      </div>
    </div>
  );
}
