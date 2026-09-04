---
id: use_cases_privacy_erasure_preview_path
name: 隐私删除预览路径（预览版）
description: 把已有 request / sink 盘点 / receipt 原语接成可用的预览删除路径；标明预览版，不宣称跨存储生产删除 SLO。
type: requirements
scope: shared
level: spec
status: active
owner: platform
version: 1
related:
  - ../../architecture/ai/privacy-deletion-sink-inventory.md
  - ./privacy-deletion-sink-inventory.md
  - ./resume-erasure-lifecycle.md
  - ./checkpoint-privacy-erasure.md
  - ../use-case-conventions.md
  - ../../rules/global/production-invariants.md
tags:
  - privacy
  - deletion
  - preview
  - receipt
  - testing
---

# 隐私删除预览路径（预览版）

## 生成前门禁

| 字段 | 内容 |
| --- | --- |
| 任务范围 | 接线已有删除原语：受理预览请求 → 按盘点枚举 sink → 返回诚实回执。面试范围可启动已有 `interview_projection_begin_erasure`（0096）；账户范围可启动已有 `memory_vector_chunk_begin_erasure`（0125）。公开 `DELETE /privacy/interview-data/:id` 与 `DELETE /privacy/resume-data` 保持 503。 |
| 来源证据 | main #70 / 0125 盘点只做清单+围栏；`PrivacyService` 两入口 503；web `/privacy` 删除按钮 disabled；0096 `interview_projection_begin_erasure` 与 0125 `memory_vector_chunk_begin_erasure` 已授 `app_role`；issuer 未接公开 DELETE。 |
| 明确不做 | 不重开生产 DELETE；不接线 issuer 为生产授权根；不写 OSS/Redis/Langfuse/备份执行器；不把任一预览回执标 `completed` 或 `productionSloClaimed=true`；不占用 0128（0126/0127 已在 main）；不把公开预览部署（`MEETWISE_PUBLIC_PREVIEW=1`）改成可写。 |
| 领域对象 | `privacy_preview_request`、`privacy_preview_sink_line`、预览回执、既有 `privacy_erasure_request`（仅作被链接的本地 sweep）。 |
| 状态机影响 | 预览请求：`inventoried` / `local_fenced`。禁止 `completed`。外部/未闭合 sink 使 `completeness=preview_incomplete`。 |
| 接口契约影响 | `POST /privacy/erasure-preview`、`GET /privacy/erasure-preview`、`GET /privacy/erasure-preview/:requestId`。形状进 `packages/contracts`，OpenAPI 标明预览版。生产 DELETE 路径仍不进 OpenAPI。 |
| 数据库影响 | 迁移 `0129_privacy_erasure_preview_path.sql`：预览请求/行表、RLS、begin/get 安全定义者函数。不改 0125 sink CHECK。 |
| 测试计划 | 域 pin（无库）+ 契约负向 + 隔离 PostgreSQL 七类 + HTTP：预览 202/重放/越权，生产 DELETE 仍 503。 |
| 验证命令 | `pnpm -C packages/domain prove:privacy-erasure-preview`；`pnpm -C packages/contracts prove:privacy-erasure-preview`；`pnpm privacy-erasure-preview:prove`（需隔离库）；`pnpm privacy-erasure:http:prove`；`pnpm docs:check`。无容器时不得把隔离库写成已验证发布。`releaseEvidence=false`。 |

盘点正文只维护在 [`privacy-deletion-sink-inventory.md`](../../architecture/ai/privacy-deletion-sink-inventory.md)。

## UC-PRIVACY-PREVIEW-01 · 候选人取得预览删除回执

- **角色 Actor：** 已登录候选人。
- **前置 Precondition：** 账户存在；面试范围须拥有该面试。公开生产 DELETE 仍 503。
- **触发 Trigger：** `POST /privacy/erasure-preview`，Bearer 登录令牌 + `Idempotency-Key` + `{ scope, subjectId? }`。
- **主流程 Main：**
  1. API 校验幂等键，HMAC 后进库，原文永不落账。
  2. 短事务按 owner RLS 建或重放 `privacy_preview_request`。
  3. 按冻结盘点写入全部 sink 行（0125 CHECK 全集 + `user_memory` / `ai_invocation_trace` / `backup_pitr`）。
  4. `scope=interview_data`：同事务调用既有 `interview_projection_begin_erasure`，链接其子请求；对应 sink 标 `local_begin_started`。
  5. `scope=account_data`：同事务调用既有 `memory_vector_chunk_begin_erasure`，链接其子请求。
  6. `scope=resume_data`：只盘点，不启破坏性 begin（尚无单简历异步状态机）。
  7. 返回 `202` 预览回执：`edition=preview` / 文案「预览版」，`productionSloClaimed=false`，`completeness=preview_incomplete`，`status` ∈ {`inventoried`,`local_fenced`}。
- **备选流 Alternate：** 同 owner+hash 重放返回同一 `requestId`，`replayed=true`，不双写行、不二次 begin。
- **异常流 Exception：**
  - **E1 重复：** `UNIQUE(owner, idempotency_key_hash)` + `ON CONFLICT` 回读，并发只 1 行并按重放返回。
  - **E2 并发：** 行锁 + 子 sweep 自己的唯一键；同 key 不同 scope/subject → `409`。
  - **E3 越权：** 跨 owner 面试 / 读他人 request = `404`，预览行增量=0（RLS + definer 双校验）。
  - **E4 失败：** begin 任一失败整事务回滚；不得留下半套盘点或半套围栏。
  - **E5 降级：** 生产 DELETE 仍 503；公开预览写门对 POST 仍 503；缺幂等键 400；回执不得变 `completed`。
  - **E6 重连：** 同 key 重放同一 `requestId`；GET 读同一快照。
- **后置 Postcondition：** 预览请求可查询；sink 行齐全；外部/未闭合 sink 仍诚实；生产 DELETE 无新 request/target。
- **验收 Acceptance：** 见七类矩阵。禁止只断言 HTTP 200/202。
- **关联：** 四原语（CAS / 幂等键 / RLS / 预览账本）；盘点 §3/§4；不替代 issuer 生产删除。
- **七类覆盖：** 正/异/特/逃/并/复/刁。

### 七类测试覆盖

| 类 | 证明层 | 能失败的断言 |
| --- | --- | --- |
| 正 | 隔离 PostgreSQL + HTTP | 面试预览 202；恰好一份预览请求；0096 子请求已链接；`interview_privacy_active=false`；`/turn` 410；回执含全量 sink 且 `completeness=preview_incomplete` |
| 异 | 隔离 PostgreSQL | 非 64-hex hash 拒；begin 失败后预览行=0 |
| 特 | 域 pin + 契约 | 简历范围不启本地 sweep；缺 subject 的面试范围拒；`completed` / `productionSloClaimed=true` schema 拒 |
| 逃 | HTTP + 源码 pin | 生产两 DELETE 仍 503 且 request=0；公开预览模式 POST 503 |
| 并 | 隔离 PostgreSQL | 同 key 并发恰 1 预览请求；`ON CONFLICT` 回读同一 requestId |
| 复 | 隔离 PostgreSQL | 账户预览启动 0125 后，`user_memory` / `backup_pitr` 仍 `honest_unresolved`；一份子 request `fenced` ≠ 账户删除完成 |
| 刁 | 隔离 PostgreSQL + HTTP | 跨 owner=0；原始幂等键不入库；登录令牌仍不能打开生产 DELETE |

## 诚实边界

- 本路径是**预览版**产品能力，不是跨存储生产删除 SLO。
- 登录 HMAC 令牌可以受理预览请求；它**不是** `PrivacyAuthorizationIssuer` 生产授权根。
- 本地 sweep 只复用已有 begin，不在本切片实现 purge worker 改道 0091。
- `local_fenced` 只表示已启动并围栏对应本地 sink，不表示外部副本已删。
