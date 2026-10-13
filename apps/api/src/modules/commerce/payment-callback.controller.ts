import { Controller, Post, Body, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { CommerceService } from './commerce.service';

/**
 * 退款回调主口（GAP-UC011-ADV-01 · scenarios 契约字面路径 `POST /payment/refund-callback`）。
 * **独立无登录态控制器**（不挂 PrincipalGuard）——PSP 服务端异步回调没有 user session，
 * 对齐 `commerce-webhook.controller.ts:4-7` 安全模型。
 *
 * **薄适配层**：与 Path A mouth（`POST /commerce/webhook/refund/:id`）共用同一个
 * `CommerceService.refundWebhook` 单管道（400/403/404/CAS/409/200 全链路只此一份）。
 * 本控制器唯一差异 = id 来源 path→body（scenarios 主口无 `:id` 段）：只做 orderId 字段存在性
 * 校验（缺 → 400 `invalid_callback`，先于 HMAC），随后原样委托；Ban 自做 HMAC/owner 查询/CAS
 * （安全关键面唯一化，Ban 复制第二套守卫）；签名仍绑定订单 id（5A-2 #100 起 HMAC 载荷
 * `${orderId}:${providerTxn}:refunded:${ts}`·±300s 防重放窗，Ban 从 providerTxn 反查单弱化绑定）。
 *
 * **body 白名单**：只读 `{orderId, providerTxn, sig, ts}` 四字段并只把这四个字段传给 service——
 * 任何额外字段（含金额形字段）结构性忽略（无金额通道，对齐 UC014 C3 DISCLOSED 口径）。
 * （5A-2 #100：ts=签名毫秒时刻随白名单透传，防重放窗在 verifyCommerceSig 单源内裁决。）
 */
@Controller('payment')
export class PaymentCallbackController {
  constructor(private readonly commerce: CommerceService) {}

  @Post('refund-callback')
  @HttpCode(HttpStatus.OK)
  refundCallback(@Body() b: { orderId?: string; providerTxn?: string; sig?: string; ts?: number }) {
    // 白名单解构：只取四字段，额外字段（含 amountCents/units/refundAmount 等）在此结构性丢弃。
    const orderId = b?.orderId;
    const providerTxn = b?.providerTxn;
    const sig = b?.sig;
    const ts = b?.ts;
    if (!orderId) throw new HttpException({ error: 'invalid_callback' }, HttpStatus.BAD_REQUEST);
    return this.commerce.refundWebhook(orderId, { providerTxn, sig, ts });
  }
}
