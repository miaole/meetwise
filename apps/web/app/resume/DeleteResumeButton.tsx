'use client';

import { useActionState, useState } from 'react';
import { deleteResumeAction, type ResumeDeleteActionResult } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';

/**
 * 删除按钮 + 二次确认（UNSTUB-ERASE rev2）。确认文案如实披露软删语义：
 * 「立即从你的账号中移除并停止一切处理；后台清除稍后完成」——绝不说「已彻底删除」。
 * 结果 toast 含 purgePending 如实态。
 */
export function DeleteResumeButton({ resumeId }: { resumeId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState<ResumeDeleteActionResult, FormData>(
    async (_prev, _formData) => deleteResumeAction(resumeId),
    { ok: false, message: '' },
  );

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-destructive/40 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
        data-testid="resume-delete-start"
      >
        删除
      </button>
    );
  }

  if (state.ok) {
    return (
      <p role="status" className="max-w-xs text-xs text-muted-foreground">
        已受理：该简历已停止处理并从你的账号移除；后台清除稍后完成（不影响你的使用与隐私隔离）。
      </p>
    );
  }

  return (
    <form action={formAction} className="max-w-xs space-y-2 rounded-md border border-destructive/40 p-2">
      <p className="text-xs text-muted-foreground">
        删除后立即从你的账号中移除并停止一切处理；后台清除稍后完成（不影响你的使用与隐私隔离）。
      </p>
      <div className="flex gap-2">
        <SubmitButton
          variant="outline"
          size="sm"
          pendingLabel="删除中…"
          className="border-destructive/40 text-destructive"
        >
          确认删除
        </SubmitButton>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground"
        >
          取消
        </button>
      </div>
      {state.ok === false && state.message ? (
        <p role="alert" className="text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}
