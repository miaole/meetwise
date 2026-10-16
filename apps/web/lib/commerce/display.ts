/**
 * #261 余额显示面（纯函数，可确定性单测进 web-logic.proof）。
 * 铁律：绝不谎报资金变动——读数缺失/形状漂移一律降级 null（整行不渲染），禁伪读数；
 * 「本次消耗 1」=当前扣费常量如实转述（权威=interview.service reserveEntitlement 1.0），非新承诺非新计价；
 * 「余额 N」=渲染时点读数 ≠ 实时余额保证 ≠ 可购买承诺（预览环境零支付，pricing/faq 口径对齐）。
 */
import { Entitlement } from '@meetwise/contracts';

/** GET /commerce/entitlement 响应 → availableUnits；非 200 形/network 失败由 serverGet 归 null，此处再挡形状漂移（非整数→null）。 */
export function parseEntitlement(raw: unknown): number | null {
  const parsed = Entitlement.safeParse(raw);
  return parsed.success ? parsed.data.availableUnits : null;
}

export interface EntitlementLineView {
  /** 「余额 N · 本次消耗 1 次额度」——N=availableUnits 取整（schema 已 int，floor 只防未来漂移）。 */
  balanceLine: string;
  /** 预览口径注记（与 pricing/faq 对齐，不新增承诺文案）。 */
  previewNote: string;
  /** N<1 → 静态中性提示（不拦提交、不给购买入口、不倒计时恐吓——服务端 402 才是权威）；N≥1 → null 不渲染。 */
  insufficientHint: string | null;
}

export function entitlementLineView(availableUnits: number | null): EntitlementLineView | null {
  if (availableUnits === null || !Number.isFinite(availableUnits)) return null;
  return {
    balanceLine: `余额 ${Math.floor(availableUnits)} · 本次消耗 1 次额度`,
    previewNote: '预览环境额度仅展示，不构成购买',
    insufficientHint: availableUnits < 1 ? '余额不足，开始将无法预留' : null,
  };
}
