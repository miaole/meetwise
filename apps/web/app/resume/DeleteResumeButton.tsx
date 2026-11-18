'use client';

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import { deleteResumeAction, type ResumeDeleteActionResult } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';

/**
 * 删除按钮 + 二次确认（UNSTUB-ERASE rev2）。确认文案如实披露软删语义：
 * 「立即从你的账号中移除并停止一切处理；后台清除稍后完成」——绝不说「已彻底删除」。
 * 结果 toast 含 purgePending 如实态。
 * 六个面走 resumeDelete namespace（zh 逐字节沿用迁移前字面，en CJK-free），
 * 由 uc-e2e-003-i18n-locale.proof S6 组件面断言钉住。
 */
export function DeleteResumeButton({ resumeId }: { resumeId: string }) {
  const t = useTranslations('resumeDelete');
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
        {t('start')}
      </button>
    );
  }

  if (state.ok) {
    return (
      <p role="status" className="max-w-xs text-xs text-muted-foreground">
        {t('accepted')}
      </p>
    );
  }

  return (
    <form action={formAction} className="max-w-xs space-y-2 rounded-md border border-destructive/40 p-2">
      <p className="text-xs text-muted-foreground">
        {t('confirmBody')}
      </p>
      <div className="flex gap-2">
        <SubmitButton
          variant="outline"
          size="sm"
          pendingLabel={t('pending')}
          className="border-destructive/40 text-destructive"
        >
          {t('confirm')}
        </SubmitButton>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground"
        >
          {t('cancel')}
        </button>
      </div>
      {state.ok === false && state.message ? (
        <p role="alert" className="text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}
