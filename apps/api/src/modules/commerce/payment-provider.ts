import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * PaymentProvider 接口契约 + 未配置骨架（网关无关·fail-closed 基建面）。
 *
 * 承重边界（安全关键面唯一化）：provider 专属回调格式只能在各自 adapter 内归一，归一产物
 * **只**许喂给 CommerceService.payWebhook / refundWebhook 既有单管道（owner 由网关函数解析 +
 * provider_txn partial UNIQUE + CAS created→paid 通道守卫的 exactly-once 三态）——**Ban** 任何
 * 第二套入账/CAS/直接写 payment_order 或权益桶的路径。
 *
 * 凭证纪律：provider 凭据/标识只从环境变量或密钥服务读取（部署侧由 compose 强制云密钥服务注入）；
 * 缺失/空白 → 骨架拒绝（503/403），**永不**回退测试钥/沙箱钥/默认钥（verifyCommerceSig `?? ''`
 * 恒时序失败形同方向）。零可用凭据字面量入源码/示例/测试。
 *
 * 具体网关适配器落座：必须先由用户拍板选型（渠道/费率/结算周期/退款政策），再按第二期/后继刀
 * 入位；在此之前任何非空 PAY_PROVIDER_ID 一律按配置错误 fail-closed 拒绝，不猜测、不回退。
 * 对账/退款发起/查单轮询等生产承重面属第二期登记，本骨架面交付前在线真实支付禁放产。
 */
export interface PaymentProvider {
  /** provider 标识（与 PAY_PROVIDER_ID 配置值对应；骨架恒 'unconfigured'）。 */
  readonly id: string;
  /** 创建支付会话：adapter 负责与具体网关交互，返回可选跳转地址与网关单号。 */
  createPaymentSession(input: { orderId: string; amountCents: number; subject: string }): Promise<{ redirectUrl?: string; providerOrderRef?: string }>;
  /** 回调归一：原始 headers+body 归一为账务管道输入；验不过 → 结构化拒绝（不抛异常由调用方映射 HTTP）。 */
  verifyCallback(input: { headers: Record<string, string>; rawBody: string }): { orderId: string; providerTxn: string; kind: 'paid' | 'refunded' } | { reject: 'invalid_callback' | 'bad_signature' };
}

/**
 * 未配置骨架：恒拒（fail-closed）。
 * - createPaymentSession 恒 503 `payment_provider_not_configured`（订单状态零变·零外部 IO）；
 * - verifyCallback 恒 `{ reject: 'bad_signature' }`（永不接受任何回调）。
 */
export class UnconfiguredPaymentProvider implements PaymentProvider {
  readonly id = 'unconfigured';

  async createPaymentSession(_input: { orderId: string; amountCents: number; subject: string }): Promise<{ redirectUrl?: string; providerOrderRef?: string }> {
    throw new HttpException({ error: 'payment_provider_not_configured' }, HttpStatus.SERVICE_UNAVAILABLE);
  }

  verifyCallback(_input: { headers: Record<string, string>; rawBody: string }): { orderId: string; providerTxn: string; kind: 'paid' | 'refunded' } | { reject: 'invalid_callback' | 'bad_signature' } {
    return { reject: 'bad_signature' };
  }
}

/**
 * 解析当前生效 provider（fail-closed·不回退）：
 * - `PAY_PROVIDER_ID` 缺失/空白 → 未配置骨架（所有会话创建 503 拒绝·所有回调拒绝）；
 * - 非空 → 503 `payment_provider_unknown`：第一期无任何具体适配器可落座，非空配置即配置错误，
 *   **不**静默回退骨架、**不**按名字猜测适配器。
 * env 形参显式注入（缺省读进程环境）：调用方可传入遮蔽环境，便于隔离面验证凭证来源唯一。
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- env 名为外部 wire 字面值,非代码标识符,不可改名(env-schema.ts 同形豁免)
export function resolvePaymentProvider(env: { PAY_PROVIDER_ID?: string | undefined } = process.env): PaymentProvider {
  const id = env.PAY_PROVIDER_ID?.trim();
  if (!id) return new UnconfiguredPaymentProvider();
  throw new HttpException({ error: 'payment_provider_unknown' }, HttpStatus.SERVICE_UNAVAILABLE);
}
