import { Controller, Get, Post, Param, Body, Headers, Header, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateOrderDto, InvoiceProfileDto, InvoiceRequestDto } from '@meetwise/contracts';
import { PrincipalGuard } from '../../platform/principal.guard';
import { ZodValidationPipe } from '../../platform/zod.pipe';
import { CommerceService } from './commerce.service';

/**
 * 交易 HTTP 适配层(薄):解析输入 → 调 CommerceService → 映射 HTTP。**不碰 SQL/事务/验签**(修审计 F1)。
 * 承重逻辑(HMAC 验签 + CAS 幂等 exactly-once 入账)全在 service。
 */
@Controller('commerce')
export class CommerceController {
  constructor(private readonly commerce: CommerceService) {}

  @Get('products')
  @Header('Cache-Control', 'public, max-age=300')   // 公开近静态(性能:前端/CDN 可缓存,审计 F9)
  products() { return this.commerce.products(); }

  // B271 片1(前席发现②):企业商品独立端点——公开目录 C 端域零触,企业面走本端点(approved recruiter 门)。
  @Get('enterprise-products')
  @UseGuards(PrincipalGuard)
  enterpriseProducts(@Req() req: any) {
    return this.commerce.enterpriseProducts(req.principal);
  }

  @Post('orders')
  @UseGuards(PrincipalGuard)
  @HttpCode(HttpStatus.OK)
  // 下单用共享契约 CreateOrderDto({productId})真校验(修审计 F2)。
  create(@Req() req: any, @Body(new ZodValidationPipe(CreateOrderDto)) b: CreateOrderDto, @Headers('idempotency-key') idem?: string) {
    return this.commerce.createOrder(req.principal, b, idem);
  }

  @Post('orders/:id/pay-callback')
  @UseGuards(PrincipalGuard)
  @HttpCode(HttpStatus.OK)
  callback(@Param('id') id: string, @Req() req: any, @Body() b: { providerTxn?: string; sig?: string }) {
    return this.commerce.payCallback(req.principal, id, b);
  }

  @Get('orders/:id')
  @UseGuards(PrincipalGuard)
  order(@Param('id') id: string, @Req() req: any) {
    return this.commerce.getOrder(req.principal, id);
  }

  @Get('entitlement')
  @UseGuards(PrincipalGuard)
  balance(@Req() req: any) {
    return this.commerce.entitlement(req.principal);
  }

  // ── B271 片1 开票面（RLS 仅本人 + 仅-paid 触发器门·薄适配层不碰 SQL 语义）──────────────
  @Get('invoice-profile')
  @UseGuards(PrincipalGuard)
  invoiceProfile(@Req() req: any) {
    return this.commerce.getInvoiceProfile(req.principal);
  }

  @Post('invoice-profile')
  @UseGuards(PrincipalGuard)
  @HttpCode(HttpStatus.OK)
  saveInvoiceProfile(@Req() req: any, @Body(new ZodValidationPipe(InvoiceProfileDto)) b: InvoiceProfileDto) {
    return this.commerce.saveInvoiceProfile(req.principal, b);
  }

  @Get('invoice-requests')
  @UseGuards(PrincipalGuard)
  invoiceRequests(@Req() req: any) {
    return this.commerce.listInvoiceRequests(req.principal);
  }

  @Post('invoice-requests')
  @UseGuards(PrincipalGuard)
  @HttpCode(HttpStatus.OK)
  submitInvoiceRequest(@Req() req: any, @Body(new ZodValidationPipe(InvoiceRequestDto)) b: InvoiceRequestDto) {
    return this.commerce.submitInvoiceRequest(req.principal, b.orderId);
  }
}
