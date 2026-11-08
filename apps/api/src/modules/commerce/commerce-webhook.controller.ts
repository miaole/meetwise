import { Controller, Post, Param, Body, Ip, HttpCode, HttpStatus } from '@nestjs/common';
import { CommerceCallbackDto } from '@meetwise/contracts';
import { ZodValidationPipe } from '../../platform/zod.pipe';
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
  // #84/API-HARDEN-A(NHP-014)：裸 @Body 收编 CommerceCallbackDto（失败信封=域具名词 invalid_callback·
  // pipe 参变词形）——非字符串 sig/providerTxn 此前穿透 falsy 检查直打 Buffer.from/HMAC(TypeError→500)。
  // rev r1(证伪 apih-pre-2 P1-1)：来源 IP 透传 service——验签失败独立按来源计(防暴力)，成本闸只在
  // 验签通过后消费(垃圾签洪水不再挤占真实回调的桶)。
  pay(@Param('id') id: string, @Body(new ZodValidationPipe(CommerceCallbackDto, 'invalid_callback')) b: CommerceCallbackDto, @Ip() ip: string) {
    return this.commerce.payWebhook(id, b, ip);
  }

  /** 退款 webhook · GAP-UC011-REFUND-CALLBACK · 对偶 pay/:id（HMAC 标签 refunded）。 */
  @Post('refund/:id')
  @HttpCode(HttpStatus.OK)
  // #84/API-HARDEN-A：同 pay 收编（NHP-014 对偶口·同词同状态零漂移）。
  refund(@Param('id') id: string, @Body(new ZodValidationPipe(CommerceCallbackDto, 'invalid_callback')) b: CommerceCallbackDto, @Ip() ip: string) {
    return this.commerce.refundWebhook(id, b, ip);
  }
}
