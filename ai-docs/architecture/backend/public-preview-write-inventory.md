---
id: public_preview_write_inventory
name: 公开预览面试/评分写面清单
description: 版本化枚举当前仓库里能写面试或评分状态的公开/预览可达面，并要求每条面都有失败关闭围栏；只作观测+围栏门，不构成 ECS 或发布证据。
type: architecture
scope: backend
level: guide
status: active
owner: architecture
version: 1
tags:
  - security
  - preview
  - inventory
  - write-gate
---

# 公开预览面试/评分写面清单

机器可读来源是 [public-preview-write-inventory.json](public-preview-write-inventory.json)。业务用例是 [UC-public-preview-01](../../requirements/use-cases/public-preview-write-gate.md)。它固定登记当前已知的公开 HTTP 写面、Web 代理/Server Action 与内部评分写者；数值由静态验证输出，代码变化后必须重跑，不能手工改写后宣称已围栏。

## 这个门禁能与不能证明什么

执行：

```bash
pnpm public-preview-write:inventory
pnpm public-preview-write:prove
pnpm public-preview-write-gate:prove
pnpm -C apps/web prove:middleware
```

它会拒绝：面试控制器或已纳入范围的申请 `start`/`finalize` 新增 mutating 路由却未登记、Web `interview`/`applications` 树下新增 POST 代理却未登记、`GET` 处理函数写入面试/评分表、登记为 `service-write-fence` 的处理函数缺少 `assertPublicPreviewWritesClosed` / `denyPublicPreviewWrite`、登记为 `preview-controlled-write` 的处理函数缺少 `assertPublicPreviewControlledWriteAllowed`、把清单改成 `enforce` 或 `releaseEvidence=true`。`pnpm public-preview-write:inventory` 校验当前清单；`:prove` 跑克隆清单的负例。

运行时挡板是 NestJS(Fastify) HTTP 方法 allowlist：除受控 `POST /interview/:id/answers` 外，任意 mutating verb 在控制器前 503，**不依赖**本清单才能挡住简历/订单/`decline` 等 scope 外写面。清单只证明 `interview-and-scoring-state` 写面已登记且有第二道服务层、预览受控写或 Web 中间件围栏。

HTTP ingress 在 Fastify `onRequest` 对非 `GET`/`HEAD`/`OPTIONS`（以及预览账本 POST）固定返回 `503 public_preview_read_only`。服务层围栏在 `InterviewService` 其它写方法与 `ApplicationsService.start`/`finalize` 于 `asPrincipal`（主体事务）之前再次失败关闭。`/answers` 必须预览模式，非预览 404。Web 中间件：非安全方法 → 503；安全方法但非展示路径 → `404 public_preview_path_unavailable`。

它**不会**读取密钥、启动 ECS（云服务器）、证明公开 listener（监听器）、镜像摘要或健康回执。因而固定输出 `releaseEvidence=false`（不可作为发布证据）。内部 `writeFinalScoreCard` 只标为 `internal-not-public`：预览部署不入队新作业，但不等于 worker（后台进程）评分写路径已在本门关闭。

## 当前围栏

| 层 | 代码 | 作用 |
| --- | --- | --- |
| HTTP 方法入站门 | `apps/api/src/platform/public-preview.ts` `installPublicPreviewIngressGate` | NestJS(Fastify) 非 allowlist 方法在控制器/鉴权/解析之前 503；预览账本 POST 除外。 |
| 服务层写围栏 | 同文件 `assertPublicPreviewWritesClosed`；`InterviewService.denyPublicPreviewWrite`、`ApplicationsService.start`/`finalize` | 已登记的面试/评分写方法在 `asPrincipal` 前失败关闭；不是所有业务 POST 都有这一层。 |
| 预览受控写 | 同文件 `assertPublicPreviewControlledWriteAllowed`；`InterviewService.submitPreviewAnswer` | 仅 `MEETWISE_PUBLIC_PREVIEW=1` 可写 0092 账本；非预览 404。不是 01 cutover。 |
| Web 中间件 | `apps/web/middleware.ts` + `apps/web/lib/public-preview.ts` | 非安全方法 503；非展示路径的安全方法 404。 |
| 静态清单 | 本目录 JSON + `scripts/public-preview-write-inventory.mjs` | 新写面未登记或 GET 写表即失败。 |

## 维护规则

新增或改动面试/评分写面时，必须在同一变更中：

1. 更新 JSON 中的 surface、fence 与 `readOnlyGetHandlers`；
2. 公开可达的面试/评分写面必须带 `http-method-ingress` 或 `web-middleware`；会改面试/评分/申请评估收口的还须 `service-write-fence`，预览账本提交用 `preview-controlled-write` 且不得再套只读围栏；申请 `decline` 等非评分态仍只靠运行时方法门，不进本清单；
3. 运行以上命令；
4. 在 ECS listener 模式、镜像摘要与健康回执进入同一发布清单前，保持 `mode=observe-and-fence` 和 `releaseEvidence=false`。
