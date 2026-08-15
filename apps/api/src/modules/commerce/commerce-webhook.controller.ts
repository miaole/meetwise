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
  pay(@Param('id') id: string, @Body() b: { providerTxn?: string; sig?: string }) {
    return this.commerce.payWebhook(id, b);
  }
}
