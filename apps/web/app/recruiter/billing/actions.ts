'use server';
import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/api/server';

/** B271 #271 片1:企业商品(ent_ 前缀·enterprise 域)订单真实开放——招聘方企业充值页专用;
 *  C 端(pack_*)保持公开预览封闭语义零变(购买/支付/退款仍不开放,原拒绝文案逐字保留)。
 *  channel:'offline'=对公转账单(停 created·admin 人工确认入账);缺省 online(线上回调链)。
 *  幂等:idempotencyKey 由调用方(充值页 per 商品+意图)提供,网络重试收敛同单。 */
export async function createOrderAction(
  productId: string,
  opts: { channel?: 'online' | 'offline'; idempotencyKey?: string } = {},
): Promise<{ ok?: boolean; error?: string; orderId?: string; amountCents?: number; channel?: string }> {
  if (typeof productId !== 'string' || !productId.startsWith('ent_')) {
    return { ok: false, error: '预览环境未开放订单、支付或额度购买。' };
  }
  try {
    const res = await serverFetch('/commerce/orders', {
      method: 'POST',
      body: JSON.stringify({ productId, channel: opts.channel ?? 'online' }),
      headers: opts.idempotencyKey ? { 'idempotency-key': opts.idempotencyKey } : undefined,
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 403) return { ok: false, error: '企业充值需审核通过的招聘方账户。' };
      return { ok: false, error: body.error ?? `下单失败(${res.status})` };
    }
    const body = (await res.json().catch(() => ({}))) as { orderId?: string; amountCents?: number; channel?: string };
    revalidatePath('/recruiter/billing');
    return { ok: true, orderId: body.orderId, amountCents: body.amountCents, channel: body.channel };
  } catch {
    return { ok: false, error: '下单请求失败，请稍后重试。' };
  }
}

/** 开票资料维护(approved recruiter·RLS 仅本人)。 */
export async function saveInvoiceProfileAction(input: {
  title: string; taxId: string; addressPhone?: string; bankAccount?: string; email: string;
}): Promise<{ ok?: boolean; error?: string }> {
  try {
    const res = await serverFetch('/commerce/invoice-profile', {
      method: 'POST', body: JSON.stringify(input), signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 403) return { ok: false, error: '开票资料需审核通过的招聘方账户。' };
    if (!res.ok) return { ok: false, error: `保存失败(${res.status})` };
    revalidatePath('/recruiter/billing');
    return { ok: true };
  } catch {
    return { ok: false, error: '保存请求失败，请稍后重试。' };
  }
}

/** 开票申请(仅 paid 订单·DB 触发器具名门;一单至多一张)。 */
export async function submitInvoiceRequestAction(orderId: string): Promise<{ ok?: boolean; error?: string }> {
  if (!orderId) return { ok: false, error: '缺少订单号。' };
  try {
    const res = await serverFetch('/commerce/invoice-requests', {
      method: 'POST', body: JSON.stringify({ orderId }), signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 409) return { ok: false, error: '仅已支付订单可申请开票（或该订单已申请过）。' };
    if (res.status === 403) return { ok: false, error: '开票申请需审核通过的招聘方账户。' };
    if (!res.ok) return { ok: false, error: `提交失败(${res.status})` };
    revalidatePath('/recruiter/billing');
    return { ok: true };
  } catch {
    return { ok: false, error: '提交请求失败，请稍后重试。' };
  }
}
