---
name: meetwise-nestjs
description: Meetwise NestJS(api)代码生成规范——分层(controller→service→db 仓储)、契约优先(共享 zod 源 + zod-openapi 生成 Swagger)、RLS、全局异常过滤、限流、缓存、SSE。生成/重构 api 模块时遵循。
---

# Meetwise NestJS 规范(api)

> 由专家审计沉淀。**违反这些 = 返工**(见 expert-review-gate)。生成任何 api 端点/模块前对照。

## 分层(P0 铁律:controllers don't orchestrate)
三层,职责单一:
1. **Controller**:只做 解析/校验输入(zod 契约)→ 调 `service.method(principal, dto)` → 映射 HTTP。**禁止**在 controller 里写 SQL、开 `asPrincipal` 事务、拼业务编排、调模型。
2. **Application Service**(`*.service.ts`,`@Injectable`,DI 注入 DbService/其他 service):拥有业务编排 + `asPrincipal` 事务边界。SQL 尽量委托 `packages/db` 仓储函数(`reserveEntitlement`/`getReport`…),不在 service 裸写一次性 SQL(除非确属该模块私有)。
3. **packages/db 仓储函数**:纯 SQL ops,接 `Client`(已在 principal 上下文),返领域类型。

```ts
// ✅ controller 薄
@Post(':id/begin') @HttpCode(202)
begin(@Param('id') id: string, @Req() req: any, @Headers('resume-id') resumeId: string) {
  return this.interviews.begin(req.principal, id, resumeId);   // 业务在 service
}
// ❌ controller 里 asPrincipal + 多语句 SQL + reserve + enqueue(当前反例)
```

## 契约优先(多端确定:zod 当源 + 生成 OpenAPI 当 load-bearing 多端契约)
- **单一真相 = `packages/contracts` 的 zod4 schema**,前后端都 import(同 schema 两端真运行时校验,零漂移)。不许手写 `if (!b?.x...)`。
- controller 用 `@Body(new ZodValidationPipe(Dto))` 真校验;响应也走契约类型。
- **`zod-openapi` 从 zod 自动生成 `/openapi.json` + Swagger UI,这份生成 spec 是正式多端契约**(喂 TS web 之外的异构端):
  - TS web(PC/H5):直接 import zod,免 codegen + 运行时校验。
  - iOS/Android/小程序/其他:从生成的 `openapi.json` 跑 codegen。生成物永不漂移(从 zod 编出)。
  - **不手写 OpenAPI 当源、不做 web 端 codegen**(api 是 TS,手写源是回退)。异构端 codegen 管线**留 seam**,第一个真异构端落地再接,不提前造空壳。
- 建议加 gate 断言 controller 引用契约(防再次腐化成死代码——审计实发 F2；当前尚无此 gate)。
- **多端硬前提**:业务逻辑必须在 api service 层后(经契约暴露),任何端(web/原生)都不许重抄押题/扣费/状态机——见上"分层 F1"。

## RLS / 安全(强项,保持)
- 业务读写一律 `db.asPrincipal(principal, c => repo(c, ...))`(非 owner `app_role` + `SET LOCAL` + FORCE RLS)。
- 跨用户特权(admin)才用 `db.pool`,且必过 `AdminGuard`。
- `x-user-id` dev 旁路只 `AUTH_DEV_HEADER=1`;密码 scrypt+常量时间;令牌 HMAC fail-closed。
- **webhook(支付回调)不挂 PrincipalGuard**:独立无登录态路由 → 验 HMAC → 查单 owner → 特权入账(不靠调用方 principal)。审计 F4。

## 全局异常过滤(P1)
- 注册 `ExceptionFilter`:统一信封 `{ error, issues? }`;DB unique 违反→409 显式映射;其余 mask 成 500 `internal_error`(**绝不泄露表名/约束名**)。`catch` 要窄(signup 只 catch unique)。

## 性能
- 池设 `statement_timeout` / `idle_in_transaction_session_timeout` / `connectionTimeoutMillis` / `idleTimeoutMillis`;`max` 由 env。
- 公共/静态 GET(products/legal/roles)加 `Cache-Control`+`ETag`;列表 keyset 分页;避免 handler 内 O(n²)。
- SSE 用短事务取历史,**不长持池连接**做 live-tail。

## SSE(P1:不能重放即关)
- `/events`:重放 `seq>lastEventId` → **hold 连接 tail 新事件**(LISTEN/NOTIFY 或轮询)到终态/断开;发心跳;终态事件(report/interview_unavailable)必发,前端不死等。

## 反模式(审计实发,别犯)
controller 裸 SQL/事务/编排(F1)· 契约死代码手写 if(F2)· 占位假分数 `score:68` 流进真链路(F10,真评分走 worker invoke)· 限流只一端点+内存 Map(F7)· SSE 重放即关(F5)· 池无超时(F6)。
