'use server';

/** Payment and order creation are explicitly unavailable in public preview.
 *  B271 片1 企业充值三 action 已归位 B 端域(app/recruiter/billing/actions.ts·招聘方企业充值页专用),
 *  C 端公开计费面恢复封闭 stub(@ab420f61^ 原形·拒绝文案逐字保留)——REG-FIX 组1 E8 域归位。 */
export async function createOrderAction(productId: string): Promise<{ ok?: boolean; error?: string }> {
  void productId;
  return { ok: false, error: '预览环境未开放订单、支付或额度购买。' };
}
