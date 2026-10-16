'use client';

import { useActionState, useState } from 'react';
import { deactivateAction, type DeactivateActionState } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * 注销确认卡（UNSTUB-ERASE rev2）：密码二次确认 + 如实披露。披露先行——
 * 「注销后立即登出且无法再登录；关联数据停止一切处理与访问，后台清除稍后完成；
 * 清除完成前同一邮箱无法重新注册」。受理后由 server action 硬导航到登录页。
 */
export function DeactivateForm() {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState<DeactivateActionState, FormData>(deactivateAction, {});

  if (!confirming) {
    return (
      <button
        type="button"
        data-testid="deactivate-start"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
      >
        注销账户
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        注销后立即登出且无法再登录；关联数据停止一切处理与访问，后台清除稍后完成；清除完成前同一邮箱无法重新注册。
      </p>
      <div className="space-y-2">
        <Label htmlFor="deactivate-password">输入密码以确认注销</Label>
        <Input
          id="deactivate-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 max-w-xs text-base"
        />
      </div>
      <div className="flex gap-2">
        <SubmitButton
          pendingLabel="注销中…"
          variant="outline"
          className="border-destructive/40 text-destructive"
        >
          确认注销
        </SubmitButton>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md border px-3 py-2 text-sm text-muted-foreground"
        >
          取消
        </button>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
