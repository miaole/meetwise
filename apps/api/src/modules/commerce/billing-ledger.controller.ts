import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PrincipalGuard } from '../../platform/principal.guard';
import { CommerceService } from './commerce.service';

/**
 * 积分明细列表 HTTP 适配层(薄·billing-redesign §3.13 升 P1 面)：解析输入 → 调 CommerceService →
 * 映射 HTTP。**不碰 SQL/事务/门语义**（承重全在 service：C 端 RLS 直读·B 端 approved recruiter 门
 * + 0185 受控 DEFINER 读函数）。additive 新控制器——既有 commerce.controller 零触。
 */
@Controller('billing')
export class BillingLedgerController {
  constructor(private readonly commerce: CommerceService) {}

  // C 端本人逐笔（PrincipalGuard 挂面先例同 commerce entitlement 读端点）。分页入参：cursor 不透明
  // 逐字回显·days 时间窗（默认 90/上限 365·越界 fail-closed 400）。
  @Get('ledger')
  @UseGuards(PrincipalGuard)
  ledger(@Req() req: any, @Query('cursor') cursor?: string, @Query('days') days?: string) {
    const windowDays = days === undefined || days === '' ? undefined : Number(days);
    return this.commerce.listMyLedger(req.principal, { cursor: cursor ?? null, windowDays });
  }

  // B 端企业维度（approved recruiter 门在 service·零 payer 形参=伪造入口被 0185 硬谓词遮蔽）。
  @Get('ledger/enterprise')
  @UseGuards(PrincipalGuard)
  enterpriseLedger(@Req() req: any) {
    return this.commerce.listEnterpriseLedger(req.principal);
  }
}
