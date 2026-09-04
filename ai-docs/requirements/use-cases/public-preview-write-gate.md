---
id: UC-public-preview-01
name: 公开预览拒绝敏感写入
status: active
owner: platform
---

# UC-public-preview-01 · 公开预览拒绝敏感写入

## 目标与范围

公开预览只展示项目界面与能力边界。部署显式启用 `MEETWISE_PUBLIC_PREVIEW=1` 时，除一条受控账本写外，任何能写**面试或评分状态**的公开/预览路径必须失败关闭。当前实现分两层语义：**(1) 运行时** NestJS(Fastify) HTTP 方法入站门拒绝一切非 `GET`/`HEAD`/`OPTIONS` 请求，并额外放行 `POST /interview/:id/answers`（预览账本，见 `UC-INT-TRANSCRIPT-PREVIEW-SUBMIT`）；**(2) 清单** 只审计 `interview-and-scoring-state` 写面，未登记会使 `pnpm public-preview-write:inventory` 失败，不是运行时的唯一挡板。其它面试/评分写方法另有服务层 `assertPublicPreviewWritesClosed`；`/answers` 用 `assertPublicPreviewControlledWriteAllowed`（非预览 404）。Web 中间件仍挡代理与 Server Action（本包不加 Web 代理）。该门不替代完整删除、授权、RLS（行级安全）或发布验收，也不等于 `INT-TRANSCRIPT-01`。机制已在本仓库接线；治理 TC 仍为 planned/unmapped，本地 proof 不是 ECS（云服务器）或发布证据。

- 角色 Actor：公开访客、已持有会话的浏览器、API 运行时。
- 前置 Precondition：公开部署显式配置 `MEETWISE_PUBLIC_PREVIEW=1`；页面、静态目录和运行时使用同一发布清单。
- 触发 Trigger：公开预览收到任意 HTTP 请求，或进程内调用面试/评分写方法。
- 明确不做：不把该门作为生产删除证明；不允许静态站代理 API；不开放真实简历、回答、音频、订单、同意记录或其他写入；不把本地 proof 当作 ECS（云服务器）listener（监听器）/镜像摘要/健康回执。

## 契约与状态机

| 项 | 契约 |
| --- | --- |
| 模式 | `MEETWISE_PUBLIC_PREVIEW=1` 为只读；未设置或 `0` 仅用于非公开受控环境；其他值 **fail-closed**（故障关闭）：API 在 `createApp()` 拒绝启动，Web `resolvePublicPreview`（middleware 与 layout 共用）在解析时抛错，不能静默变成可写应用。 |
| 拒绝 | 除精确 allowlist 外的**任何** HTTP 方法（包括未来扩展、`COPY`、`MOVE`、`TRACE` 或自定义方法）均在 HTTP ingress 返回 `503` 与固定错误 `public_preview_read_only`。 |
| 允许 | `GET`、`HEAD`、`OPTIONS` 可继续到其现有路由；它们不得藉由查询参数或请求体改变面试/评分状态。另允许预览受控 `POST /interview/:id/answers` 落 0092 账本。清单中的 `readOnlyGetHandlers` 若出现写 SQL（结构化查询语言）或入队，静态门失败。 |
| 服务层 | `assertPublicPreviewWritesClosed` 在 `InterviewService` 的面试/评分写方法与 `ApplicationsService.start` 进入 `asPrincipal` 之前再次拒绝；未知配置值仍抛 `invalid_meetwise_public_preview`。 |
| Web | 预览中间件对非安全方法返回同一 `503`；非展示路径（含 `/api/interview/*`、`/interviews`、`/report/:id`、`/jobs`）对 GET 也返回 `404 public_preview_path_unavailable`。 |
| 账本 | 拒绝请求不写数据库、队列、模型调用、同意记录、订单或审计业务账本；仅保留既有低敏 HTTP 指标。 |
| 部署 | 主项目链接在 ECS 身份、健康、镜像摘要、公开 listener 的精确 `MEETWISE_PUBLIC_PREVIEW=1` 证明进入发布清单前保持禁用。公开 listener 不直接暴露 API 业务路由；允许读取不等于公开数据授权。 |

本用例没有业务对象迁移：请求在 ingress 或服务层被拒绝，任何领域状态机均保持原状态。机制为 HTTP 前置拒绝、服务层失败关闭与静态写面清单，不以 UI 隐藏或客户端提示替代。

## 主流程 Main

1. 运行时以精确值 `MEETWISE_PUBLIC_PREVIEW=1` 启动 API 与 Web。
2. 访客请求公开展示页或只读端点，现有读取路径按既有认证与授权规则执行。
3. 访客或已有会话对清单中的面试/评分写面使用非 allowlist HTTP 方法，或进程内调用 `generateAssessment` / `turn` / `create` / `start` 等写方法。
4. ingress 在控制器和所有副作用之前返回 `503 public_preview_read_only`；若有人绕过 HTTP，服务层围栏在数据库之前抛同一错误。
5. 除受控 `/answers` 外，请求不会创建面试、答案作业、评分卡、能力评估、申请绑定面试或其他业务账本行。`/answers` 只写 0092 rehearsal 账本，不入队 plaintext `/turn` job。

## 备选流 Alternate

A1. 非公开的受控开发或内部环境仅在变量缺失或为 `0` 时按原有路由行为运行；它不能被公开入口引用。
A2. 遗留 `POST /interview/:id/answer` 在非预览下已是认证后 `410` 且不写事件；预览下仍先被方法门 503，不作为写面回退。
A3. Worker（后台进程）`writeFinalScoreCard` 不在公开 HTTP 上；清单标为 `internal-not-public`。预览不入队新作业，但不等于本门关闭已在跑的 worker。
A4. `POST /applications/:id/finalize` 会收口申请评估态，已登记并加服务层围栏；`decline` 只改申请邀请态，不进评分清单，仍被运行时方法门 503。

## 异常流 Exception

- E1 重复请求（幂等）：重复写请求均在 ingress 或服务层拒绝，业务账本增量为 0；机制：前置拒绝 + 服务层围栏。
- E2 高并发：并发写请求全部拒绝，handler 与 `asPrincipal` 执行计数为 0；机制：前置拒绝，无需 CAS。
- E3 逃逸通道：携带 cookie、Authorization、伪造查询参数、改写路径、重放 body、未知 HTTP 方法，或新增未登记的面试写路由，均不能跳过 allowlist/清单；机制：请求方法在路由前判定，静态清单拒绝未登记写面。
- E4 配置失败：变量为非约定值时 API 启动失败、Web 解析抛错，不能不确定地变为公开可写；机制：失败关闭配置解析。Web 与 API 必须使用同一精确 `1`；清单不证明双进程 flag 已由编排锁死。
- E5 特殊方法：`OPTIONS` 仅服务跨域预检，不能执行 handler 写入；`GET` 与 `HEAD` 仍受既有认证和 RLS 约束，且清单禁止 GET 处理函数写面试/评分表；机制：HTTP method allowlist + GET 只读扫描。
- E6 断线、重试与 path 变体：客户端重试仍为拒绝；清单 path 变体与服务层缺围栏均不能产生业务写入；机制：前置拒绝 + 清单/服务层双门。

## 验收与测试矩阵

| 类别 | TC | 断言层 |
| --- | --- | --- |
| 正常 | TC-public-preview-01-main | 只读 `GET` 到达既有 handler；handler 写入计数为 0；清单校验通过且 `releaseEvidence=false`。 |
| 异常 | TC-public-preview-01-E1 | `POST`（含清单中的 `/interview/:id/turn`、`/interview/:id/assessment`）返回固定 503，handler 与 `asPrincipal` 均为 0。 |
| 特殊 | TC-public-preview-01-E2 | 只有精确值 `1` 启用；`0`/缺失按非公开模式，未知值启动失败。 |
| 逃逸通道 | TC-public-preview-01-E3 | `POST`/`PUT`/`PATCH`/`DELETE`、未知方法与自定义方法携带身份、查询、body 均在路由前拒绝；未登记写路由使清单失败。 |
| 高并发 | TC-public-preview-01-E4 | 20 个并发写请求（含真实 `/interview/:id/turn`）全部 503，handler 执行 0 次。 |
| 复杂 | TC-public-preview-01-E5 | `OPTIONS` 预检与 `HEAD` 无写副作用；GET 处理函数保持只读。 |
| 刁钻 | TC-public-preview-01-E6 | 配置畸形、重试、path 变体、缺服务层围栏或把清单标成发布证据均不能产生业务写入。 |

以上 TC 在治理基线中仍为 planned/unmapped；本地 proof 不是发布分母。

## 关联

- 运行事实：`ai-docs/architecture/current-runtime-truth.md`
- 写面清单：`ai-docs/architecture/backend/public-preview-write-inventory.md`、`public-preview-write-inventory.json`
- 部署边界：`ai-docs/architecture/devops/local-demo-deployment.md`
- 公开文案门：`apps/web/test/public-copy.proof.mjs`
- API ingress / 服务层实现与 proof：`apps/api/src/platform/public-preview.ts`、`apps/api/src/modules/interview/interview.service.ts`、`apps/api/src/modules/jobs/applications.service.ts`、`apps/api/test/public-preview-write-gate.proof.ts`；命令 `pnpm public-preview-write-gate:prove`
- Web 中间件：`apps/web/middleware.ts`、`apps/web/lib/public-preview.ts`、`apps/web/test/web-middleware.proof.ts`；命令 `pnpm -C apps/web prove:middleware`
- 静态清单门：`scripts/public-preview-write-inventory.mjs`、`scripts/public-preview-write-inventory.proof.mjs`；命令 `pnpm public-preview-write:inventory` 与 `pnpm public-preview-write:prove`
- 生产不变量：失败关闭、RLS、事件账本；本用例不声称它们已由本门替代。
