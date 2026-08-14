'use client';
import { useActionState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { changePasswordAction } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * 改密码表单(客户端):useActionState 驱动,提交态由 SubmitButton 给即时反馈,
 * 结果走 aria-live 文案 + toast——成功/旧密码错/网络错都有显式反馈,绝不静默死点击。
 */
export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, {} as { ok?: boolean; error?: string });
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) { formRef.current?.reset(); toast.success('密码已修改'); }
    else if (state.error) { toast.error(state.error); }
  }, [state.ok, state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="oldPassword">旧密码</Label>
        <Input id="oldPassword" name="oldPassword" type="password" required autoComplete="current-password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">新密码(≥8位)</Label>
        <Input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <SubmitButton pendingLabel="修改中…">修改密码</SubmitButton>
      <p role="status" aria-live="polite" className={`text-sm ${state.error ? 'text-destructive' : 'text-primary'}`}>
        {state.error ?? (state.ok ? '密码已修改。' : '')}
      </p>
    </form>
  );
}
