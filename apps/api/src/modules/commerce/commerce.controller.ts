import { Controller, Get, Post, Param, Body, Headers, Header, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateOrderDto, InvoiceProfileDto, InvoiceRequestDto, CommerceCallbackDto } from '@meetwise/contracts';
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
  @HttpCode(HttpStatus.OK)
  // #100(AUTHZ-HARDEN 5A-2·裁决项⑤纯签名)收权:移除 PrincipalGuard——本端点原「登录可调 + 以登录态
  // principal 入账」面撤除,与 /commerce/webhook/pay/:id 同管道(纯签名访问·owner 由网关函数解析不信调用方);
  // 签名含 ts 防重放(verifyCommerceSig 单源)。账务 CAS/exactly-once 零触。
  // #84/API-HARDEN-A(NHP-014):裸 @Body 收编 CommerceCallbackDto,失败信封随域具名词 invalid_callback
  // (pipe 参变词形·缺字段仍由 verifyCommerceSig 回同词 400+结构化拒绝日志,词/状态零漂移)——非字符串
  // sig/providerTxn 此前穿透 falsy 检查直打 Buffer.from/HMAC(TypeError→500)。
  callback(@Param('id') id: string, @Body(new ZodValidationPipe(CommerceCallbackDto, 'invalid_callback')) b: CommerceCallbackDto) {
    return this.commerce.payWebhook(id, b);
  }

  // B271 片3 P4：本人订单列表（RLS p_owner 仅本人·开票下拉数据源）。静态段先于参数段，路由不冲突。
  @Get('orders')
  @UseGuards(PrincipalGuard)
  orders(@Req() req: any) {
    return this.commerce.listMyOrders(req.principal);
  }

  @Get('orders/:id')
  @UseGuards(PrincipalGuard)
  order(@Param('id') id: string, @Req() req: any) {
    return this.commerce.getOrder(req.principal, id);
  }

  // 支付会话端点（薄适配层·网关无关 fail-closed）：本人单/created/online 三守卫在 service，
  // 未配置 provider → 503 payment_provider_not_configured（订单状态零变）。回调面零改——adapter
  // 回调归一只喂 payWebhook/refundWebhook 既有单管道。
  @Post('orders/:id/pay-session')
  @UseGuards(PrincipalGuard)
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 薄适配层同控制器既有 @Req() req: any 形（零新增 warning 贴边）
  paySession(@Param('id') id: string, @Req() req: any) {
    return this.commerce.createPaymentSession(req.principal, id);
  }

  // B271 片3 P2：本人对公订单台账（approved recruiter 门 + 0159 受控 DEFINER 本人行读函数）。
  @Get('offline-orders')
  @UseGuards(PrincipalGuard)
  offlineOrders(@Req() req: any) {
    return this.commerce.listMyOfflineOrders(req.principal);
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
