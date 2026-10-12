import { Controller, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommerceService } from './commerce.service';

/**
 * 支付 webhook(修审计 F4):**独立无登录态控制器**(不挂 PrincipalGuard)——PSP 服务端异步回调没有 user session。
 * 鉴权靠 HMAC 验签(在 service 内,fail-closed)+ owner 从 DB 查,不信调用方身份。
 */
@Controller('commerce/webhook')
export class CommerceWebhookController {
  constructor(private readonly commerce: CommerceService) {}

  @Post('pay/:id')
  @HttpCode(HttpStatus.OK)
  // 5A-2 #100：body 注解随 verifyCommerceSig 契约补 ts?（签名毫秒时刻·仅注解保真，运行时透传不受影响）。
  pay(@Param('id') id: string, @Body() b: { providerTxn?: string; sig?: string; ts?: number }) {
    return this.commerce.payWebhook(id, b);
  }

  /** 退款 webhook · GAP-UC011-REFUND-CALLBACK · 对偶 pay/:id（HMAC 标签 refunded）。 */
  @Post('refund/:id')
  @HttpCode(HttpStatus.OK)
  refund(@Param('id') id: string, @Body() b: { providerTxn?: string; sig?: string; ts?: number }) {
    return this.commerce.refundWebhook(id, b);
  }
}
