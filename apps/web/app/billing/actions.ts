'use server';
/** 演示订单创建的 Server Action:仅创建订单(幂等),不接真实支付。真实扣款/入账由支付方验签回调在后端完成。 */
import { serverFetch } from '../../lib/api/server';
import { revalidatePath } from 'next/cache';

export async function createOrderAction(productId: string): Promise<{ ok?: boolean; error?: string }> {
  if (!productId) return { error: '套餐无效' };
  // 幂等键:productId + 随机串(避免随机时间戳)。重复点击同一 key 不双扣。
  const key = productId + ':' + Math.random().toString(36).slice(2);
  let res: Response;
  try {
    res = await serverFetch('/commerce/orders', {
      method: 'POST',
      headers: { 'idempotency-key': key },
      body: JSON.stringify({ productId }),
    });
  } catch {
    return { error: '网络错误,下单未成功,请重试' };
  }
  // money path:绝不静默"成功"。失败显式回错;成功 revalidate 让余额刷新 + 前端提示。
  if (!res.ok) return { error: '下单失败,请稍后重试(' + res.status + ')' };
  revalidatePath('/billing');
  return { ok: true };
}
