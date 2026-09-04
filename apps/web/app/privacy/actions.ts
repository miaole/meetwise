'use server';

import { createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { PrivacyPreviewBeginDto, PrivacyPreviewReceipt } from '@meetwise/contracts';
import { serverFetch } from '../../lib/api/server';

export type PreviewActionState = {
  ok?: boolean;
  error?: string;
  receipt?: PrivacyPreviewReceipt;
};

export async function requestPrivacyPreviewAction(
  _prev: PreviewActionState,
  formData: FormData,
): Promise<PreviewActionState> {
  const parsed = PrivacyPreviewBeginDto.safeParse({
    scope: String(formData.get('scope') ?? ''),
    subjectId: String(formData.get('subjectId') ?? '').trim() || undefined,
  });
  if (!parsed.success) return { error: '请选择范围；面试删除预览需要填写面试标识。' };

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
    return { error: '网络错误，请稍后重试。' };
  }
  if (res.status === 401) return { error: '登录已过期，请重新登录。' };
  if (res.status === 404) return { error: '找不到该面试，或你无权预览它的删除回执。' };
  if (res.status === 409) return { error: '同一预览请求与已有目标冲突，请更换范围或面试。' };
  if (res.status === 503) {
    const body = await res.json().catch(() => ({}));
    if (body?.error === 'public_preview_read_only') return { error: '公开预览部署为只读，不能受理删除预览。' };
    return { error: '预览删除暂不可用，未伪装为已完成。' };
  }
  if (!res.ok) return { error: `预览请求未受理（${res.status}）。` };

  const receipt = PrivacyPreviewReceipt.safeParse(await res.json());
  if (!receipt.success) return { error: '回执形状不合法，未当作删除完成。' };
  if (receipt.data.productionSloClaimed !== false || receipt.data.completeness !== 'preview_incomplete') {
    return { error: '回执宣称了生产完成态，已拒绝展示。' };
  }
  revalidatePath('/privacy');
  return { ok: true, receipt: receipt.data };
}
