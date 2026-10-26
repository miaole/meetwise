'use server';

import { createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { PrivacyPreviewBeginDto, PrivacyPreviewReceipt } from '@meetwise/contracts';
import type { Locale } from '../../i18n/request';
import { serverFetch } from '../../lib/api/server';

export type PreviewActionState = {
  ok?: boolean;
  error?: string;
  receipt?: PrivacyPreviewReceipt;
};

// locale 仅取自 cookie(i18n/request.ts 同契约;沿 resume/actions.ts resumeUploadLocale 先例形)。
async function privacyPreviewLocale(): Promise<Locale> {
  return (await cookies()).get('locale')?.value === 'en' ? 'en' : 'zh';
}

export async function requestPrivacyPreviewAction(
  _prev: PreviewActionState,
  formData: FormData,
): Promise<PreviewActionState> {
  const t = await getTranslations({ locale: await privacyPreviewLocale(), namespace: 'privacyPreview' });
  const parsed = PrivacyPreviewBeginDto.safeParse({
    scope: String(formData.get('scope') ?? ''),
    subjectId: String(formData.get('subjectId') ?? '').trim() || undefined,
  });
  if (!parsed.success) return { error: t('scopeRequired') };

  const idempotencyKey = createHash('sha256')
    .update(`preview:${parsed.data.scope}:${parsed.data.subjectId ?? 'self'}`)
    .digest('hex');
  let res: Response;
  try {
    res = await serverFetch('/privacy/erasure-preview', {
      method: 'POST',
      headers: { 'idempotency-key': idempotencyKey },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { error: t('networkError') };
  }
  if (res.status === 401) return { error: t('sessionExpired') };
  if (res.status === 404) return { error: t('notFound') };
  if (res.status === 409) return { error: t('conflict') };
  if (res.status === 503) {
    const body = await res.json().catch(() => ({}));
    if (body?.error === 'public_preview_read_only') return { error: t('readOnlyDeployment') };
    return { error: t('previewUnavailable') };
  }
  if (!res.ok) return { error: t('notAccepted', { status: res.status }) };

  const receipt = PrivacyPreviewReceipt.safeParse(await res.json());
  if (!receipt.success) return { error: t('invalidShape') };
  if (receipt.data.productionSloClaimed !== false || receipt.data.completeness !== 'preview_incomplete') {
    return { error: t('productionClaimRejected') };
  }
  revalidatePath('/privacy');
  return { ok: true, receipt: receipt.data };
}
