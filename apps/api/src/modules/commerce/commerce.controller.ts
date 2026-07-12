import { Controller, Get, Post, Param, Body, Headers, Header, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateOrderDto } from '@meetwise/contracts';
import { PrincipalGuard } from '../../platform/principal.guard';
import { ZodValidationPipe } from '../../platform/zod.pipe';
import { CommerceService } from './commerce.service';

/**
 * 交易 HTTP 适配层(薄):解析输入 → 调 CommerceService → 映射 HTTP。**不碰 SQL/事务/验签**(修审计 F1)。
 * 承重逻辑(HMAC 验签 + CAS 幂等 exactly-once 入账)全在 service。
 */
@Controller('commerce')
@UseGuards(PrincipalGuard)
export class CommerceController {
  constructor(private readonly commerce: CommerceService) {}

  @Get('products')
  @Header('Cache-Control', 'public, max-age=300')   // 公开近静态(性能:前端/CDN 可缓存,审计 F9)
  products() { return this.commerce.products(); }

  @Post('orders')
  @HttpCode(HttpStatus.OK)
  // 下单用共享契约 CreateOrderDto({productId})真校验(修审计 F2)。
  create(@Req() req: any, @Body(new ZodValidationPipe(CreateOrderDto)) b: CreateOrderDto, @Headers('idempotency-key') idem?: string) {
    return this.commerce.createOrder(req.principal, b, idem);
  }

  @Post('orders/:id/pay-callback')
  @HttpCode(HttpStatus.OK)
  callback(@Param('id') id: string, @Req() req: any, @Body() b: { providerTxn?: string; sig?: string }) {
    return this.commerce.payCallback(req.principal, id, b);
  }

  @Get('orders/:id')
  order(@Param('id') id: string, @Req() req: any) {
    return this.commerce.getOrder(req.principal, id);
  }

  @Get('entitlement')
  balance(@Req() req: any) {
    return this.commerce.entitlement(req.principal);
  }
}
