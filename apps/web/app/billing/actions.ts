'use server';

/** Payment and order creation are explicitly unavailable in public preview. */
export async function createOrderAction(productId: string): Promise<{ ok?: boolean; error?: string }> {
  void productId;
  return { ok: false, error: '预览环境未开放订单、支付或额度购买。' };
}
