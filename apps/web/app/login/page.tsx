'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { authAction } from '@/app/auth-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

/** 登录/注册:**Server Action**(useActionState)——提交进服务端,成功设 httpOnly cookie 并服务端跳转,失败回错误态。i18n via useTranslations。 */
export default function LoginPage() {
  const t = useTranslations('login');
  const [state, formAction, pending] = useActionState(authAction, {} as { error?: string });
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
      <Card className="w-full">
        <CardHeader className="space-y-1.5">
          <CardTitle className="font-serif text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            {/* recruiter cookie 只进内部预览骨架，不是第二套对等产品。
                Server Action 从 form data 读 role,故保留隐藏 input 同步 Tabs 选中值。 */}
            <input type="hidden" name="role" value={role} />
            <div className="space-y-2">
              <Label>{t('iAm')}</Label>
              <Tabs value={role} onValueChange={(v) => setRole(v as 'candidate' | 'recruiter')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="candidate">{t('candidate')}</TabsTrigger>
                  <TabsTrigger value="recruiter">{t('recruiter')}（内部预览）</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs leading-5 text-muted-foreground">
                招聘方入口是内部预览骨架，不是已上线产品，也不是与求职者对等的第二套产品。
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" name="password" type="password" placeholder={t('passwordHint')} required />
            </div>
            <div className="flex gap-3">
              <Button name="mode" value="login" type="submit" disabled={pending} className="flex-1">{t('loginBtn')}</Button>
              <Button name="mode" value="signup" type="submit" variant="outline" disabled={pending} className="flex-1">{t('signupBtn')}</Button>
            </div>
            <p role="status" aria-live="polite" className={`text-sm ${state.error ? 'text-destructive' : 'text-muted-foreground'}`}>
              {pending ? t('submitting') : (state.error ?? '')}
            </p>
          </form>
          <Separator className="my-5" />
          <p className="text-sm"><Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">{t('backHome')}</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
