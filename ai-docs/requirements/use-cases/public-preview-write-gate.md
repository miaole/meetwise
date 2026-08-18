---
id: UC-public-preview-01
name: 公开预览拒绝敏感写入
status: planned
owner: platform
---

# UC-public-preview-01 · 公开预览拒绝敏感写入

## 目标与范围

公开预览只展示项目界面与能力边界。部署显式启用 `MEETWISE_PUBLIC_PREVIEW=1` 时，API 在任何控制器、认证、解析、队列或模型调用之前拒绝所有会改变状态的 HTTP 请求。该门不替代完整删除、授权、RLS 或发布验收；它只防止公开预览收集新的敏感输入。

- 角色 Actor：公开访客、已持有会话的浏览器、API 运行时。
- 前置 Precondition：公开部署显式配置 `MEETWISE_PUBLIC_PREVIEW=1`；页面、静态目录和运行时使用同一发布清单。
- 触发 Trigger：公开预览收到任意 HTTP 请求。
- 明确不做：不把该门作为生产删除证明；不允许 Pages 代理 API；不开放真实简历、回答、音频、订单、同意记录或其他写入。

## 契约与状态机

| 项 | 契约 |
| --- | --- |
| 模式 | `MEETWISE_PUBLIC_PREVIEW=1` 为只读；未设置或 `0` 仅用于非公开受控环境；其他值使启动失败。 |
| 拒绝 | 除精确 allowlist 外的**任何** HTTP 方法（包括未来扩展、`COPY`、`MOVE`、`TRACE` 或自定义方法）均在 HTTP ingress 返回 `503` 与固定错误 `public_preview_read_only`。 |
| 允许 | 只有 `GET`、`HEAD`、`OPTIONS` 可继续到其现有路由；它们不得藉由查询参数或请求体改变状态。 |
| 账本 | 拒绝请求不写数据库、队列、模型调用、同意记录、订单或审计业务账本；仅保留既有低敏 HTTP 指标。 |
| 部署 | Pages 只发布静态内容，绝不代理 API。主项目链接在 ECS 身份、健康、镜像摘要、公开 listener 的精确 `MEETWISE_PUBLIC_PREVIEW=1` 证明进入发布清单前保持禁用。公开 listener 不直接暴露 API 业务路由；允许读取不等于公开数据授权。 |

本用例没有业务对象迁移：请求在 ingress 被拒绝，任何领域状态机均保持原状态。机制为 HTTP 前置拒绝与失败关闭配置，不以 UI 隐藏或客户端提示替代。

## 主流程 Main

1. ECS 以精确值 `MEETWISE_PUBLIC_PREVIEW=1` 启动 API。
2. 访客请求公开页面或只读端点，现有读取路径按既有认证与授权规则执行。
3. 访客或已有会话对任一路由使用非 allowlist HTTP 方法。
4. ingress 在控制器和所有副作用之前返回 `503 public_preview_read_only`。
5. 请求不会创建用户、同意记录、简历、答案、任务、订单、模型调用或其他业务账本行。

## 备选流 Alternate

A1. 非公开的受控开发或内部环境仅在变量缺失或为 `0` 时按原有路由行为运行；它不能被 Pages 目录或公开 ECS 入口引用。

## 异常流 Exception

- E1 重复请求（幂等）：重复写请求均在 ingress 拒绝，业务账本增量为 0；机制：前置拒绝。
- E2 高并发：并发写请求全部拒绝，handler 执行计数为 0；机制：前置拒绝，无需 CAS。
- E3 逃逸通道：携带 cookie、Authorization、伪造查询参数、改写路径、重放 body 或使用未知 HTTP 方法均不能跳过 allowlist；机制：请求方法在路由前判定。
- E4 配置失败：变量为非约定值时启动失败，不能不确定地变为公开可写；机制：失败关闭配置解析。
- E5 特殊方法：`OPTIONS` 仅服务跨域预检，不能执行 handler 写入；`GET` 与 `HEAD` 仍受既有认证和 RLS 约束；机制：HTTP method allowlist。
- E6 断线与超时：客户端在收到或未收到 503 后重试仍为拒绝，且无可恢复业务副作用；机制：前置拒绝。

## 验收与测试矩阵

| 类别 | TC | 断言层 |
| --- | --- | --- |
| 正常 | TC-public-preview-01-main | 只读 `GET` 到达既有 handler；handler 写入计数为 0。 |
| 异常 | TC-public-preview-01-E1 | `POST` 返回固定 503，handler 与副作用计数均为 0。 |
| 特殊 | TC-public-preview-01-E2 | 只有精确值 `1` 启用；`0`/缺失按非公开模式，未知值启动失败。 |
| 逃逸通道 | TC-public-preview-01-E3 | `POST`/`PUT`/`PATCH`/`DELETE`、未知方法与自定义方法携带身份、查询、body 均在路由前拒绝。 |
| 高并发 | TC-public-preview-01-E4 | 20 个并发写请求全部 503，handler 执行 0 次。 |
| 复杂 | TC-public-preview-01-E5 | `OPTIONS` 预检与 `HEAD` 无写副作用，读取与写入分支不混淆。 |
| 刁钻 | TC-public-preview-01-E6 | 配置畸形、重试和 path 变体均不能产生业务写入。 |

## 关联

- 运行事实：`ai-docs/architecture/current-runtime-truth.md`
- 部署边界：`ai-docs/architecture/devops/local-demo-deployment.md`
- 公开文案门：`apps/web/test/public-copy.proof.mjs`
- API ingress 实现与 proof：`apps/api/src/platform/public-preview.ts`、`apps/api/test/public-preview-write-gate.proof.ts`
- 生产不变量：失败关闭、RLS、事件账本；本用例不声称它们已由本门替代。
