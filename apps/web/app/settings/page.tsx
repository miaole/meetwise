import { redirect } from 'next/navigation';
import { getServerToken, serverGet } from '../../lib/api/server';
import { saveSettingsAction } from './actions';
import { ChangePasswordForm } from './ChangePasswordForm';
import { DeactivateForm } from './DeactivateForm';
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
  // I4 #265:读回 locale(现保存链落库键);legacy pref.lang 仅作 F6 前旧行回落,下次成功保存即被白名单投影自愈。
  const lang = typeof pref.locale === 'string' ? pref.locale : (typeof pref.lang === 'string' ? pref.lang : 'zh');

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
                <Label htmlFor="locale">界面语言</Label>
                <select
                  id="locale"
                  name="locale"
                  defaultValue={lang}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </div>
              {/* I4 #265:原「邮件通知」开关撤除(宣称-兑现对齐:全仓零 SMTP/mailer 实现,通知只写站内表——
                  无实现不宣称);同刀修 actions 发送体(lang→locale·移除旧开关键·locale 已在 contracts 白名单,
                  零后端改动,顺手清保存 400 既有红)。站内通知无用户级开关。 */}
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

        <Card className="border-destructive/30 bg-muted/40">
          <CardHeader>
            <CardTitle>注销账户并发起数据删除</CardTitle>
            <CardDescription>
              注销即时生效：立即登出、无法再登录，关联数据（简历、面试、记忆）立即停止一切处理与访问。
              后台物理清除为异步流程稍后完成；完成前同一邮箱无法重新注册。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeactivateForm />
          </CardContent>
        </Card>
        <p className="text-sm"><a href="/privacy" className="text-muted-foreground hover:text-foreground">数据边界与导出范围 →</a></p>
      </div>
    </div>
  );
}
