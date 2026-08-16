---
id: use_cases_ecs_full_stack_preview_runtime
name: ECS 完整应用预览运行时用例
description: 定义 Web、API 与 Worker 接入受管测试 RDS/Tair、完成合成写入闭环并经 Pages 跳转公开预览的范围、状态机与七类验收。
type: requirements
scope: shared
level: spec
status: active
owner: platform
version: 1
related:
  - ./cloud-runtime-and-migration.md
  - ./ecs-public-preview-web-ingress.md
  - ../../architecture/adr/0021-ecs-full-stack-preview-runtime.md
  - ../../delivery/cloud-resource-inventory.md
tags:
  - ecs
  - preview
  - web
  - api
  - worker
  - rds
  - tair
---

# ECS 完整应用预览运行时用例

> 本文同时记录已落地的受控预览切片和仍待验收的边界。Web、API、Worker、合成数据与签名入口已在指定 ECS/RDS 上运行；这不是生产可用或完整 AI 能力证明。GitHub Pages 只负责项目介绍和跳转。

## UC-ecs-full-stack-preview-01 · 访问完整应用并完成合成写入闭环

- 角色 Actor：项目审阅者、受控预览用户、Web、API、Worker、发布控制面。
- 前置 Precondition：
  1. release commit、构件摘要、ECS、RDS instance/database、Tair instance、VPC 与 CA 已冻结到 `FullStackPreviewTargetProfile`；
  2. RDS 仅内网可达且 TLS `verify-full`，Tair 仅内网可达且 TLS 1.2；
  3. migration、runtime、QBank/RAG control 和隐私 worker 身份分离；
  4. 公网入口有独立访问门，只允许固定合成主体；公开注册、真实简历/回答/录音、支付、招聘邀请、OCR、删除申请保持不可用；
  5. Pages 主链接仍禁用。
- 触发 Trigger：发布控制面收到受保护 `main` 的已验构件并执行一次 full-stack preview release。
- 主流程 Main：
  1. 一次性迁移任务复核目标档与独立数据库 `meetwise_preview`，运行当前 migration set，写入迁移回执后退出；固定只读验收库 `meetwise_cloud_test` 不执行 DDL/DML；
  2. systemd 以低权身份依次启动 API、Worker、Web，分别只绑定 loopback，Worker metrics 也只绑定 loopback；
  3. 内部健康检查验证 schema revision、运行身份、RDS/Tair TLS、连接池预算和 Worker readiness；
  4. 受控预览用户从 Web 登录固定合成账号，提交一条合成业务动作；API 在 `meetwise_preview` 写入权威状态与 durable job；
  5. Worker 领取该 job，按相同 release/config 处理，并将可见结果写回；Web 经 API/SSE 读取结果；
  6. 控制面先发布 Pages 不会启用的签名 `public-full-stack-probe` manifest，再生成一次性 256-bit `probeNonce` 和 60 秒 deadline，只在该窗口临时启用 Funnel；ECS 外部的无凭据验证器以 `redirect=error` 访问精确 root/login/manifest URL，验证签名 manifest、页面摘要、nonce 与时间后产生回执；
  7. 发布控制面只接受同 generation、同 nonce、同 probe manifest fingerprint 且未过 deadline 的外部回执，随后才签发 `public-full-stack` manifest。超时处理先物理关闭 Web/Funnel，再等待发布锁修复账本；确认与超时并发时，过期处理器只对已持久确认的最终 manifest 恢复一致边缘；Pages 仅对最终模式启用主按钮。
- 备选流 Alternate：模型能力尚未取得合格凭据时，Web/API 可运行并显示能力不可用；Worker 不得伪造模型成功。只有不依赖模型的合成写入链通过时，发布状态最多为 `internal_ready`，不得启用 Pages 的“完整 AI 流程可用”表述。
- 异常流 Exception：
  - E1 重复：同 release/构件重放只复用同一迁移结果；同合成提交幂等键与相同 payload 返回同一结果，不新增 job/消费；同键不同 payload 返回冲突。机制：构件摘要、迁移 revision、幂等键和事件账本。
  - E2 并发：两个发布、20 个双标签提交或两个 Worker 领取时，只有一个 release/提交/租约成为赢家；连接数不突破预算。机制：`flock`/发布 CAS、数据库唯一约束、`FOR UPDATE SKIP LOCKED`、lease fence。
  - E3 越权：非预览主体、跨 owner、伪造 cookie、公开注册、真实上传以及直连 API/metrics/DB/Tair 均为 0 行/不可达；不能靠前端隐藏。机制：边缘访问门、RLS、私网/loopback 与 fail-closed feature gate。
  - E4 失败回滚：迁移失败不启动服务；API/Worker/Web 任一 readiness 或外部黑盒失败不签最终 manifest，并关闭 Funnel/停止候选；激活失败只有在严格确认边缘关闭后才可恢复 probe-ready 状态，否则保持 `edge_probing` 供超时器继续失败关闭；撤销时先发布签名 revoked manifest 并停 Web，只保留 Nginx/Funnel 的静态 manifest 通道，Pages 返回同 fingerprint 的 disabled receipt 后再关闭 Funnel；不执行 down migration。机制：分阶段发布状态机、不可变 release、nonce/deadline 与失败关闭。
  - E5 降级：Tair 不可用时 RAG 缓存 fail-closed；模型/Embedding/OSS/OCR/语音/支付不可用时只显示明确不可用，不回退到跨域题库、Web 或伪数据。机制：typed readiness 与业务终态，不把依赖失败伪装成功。
  - E6 超时/断线：提交响应丢失、SSE 重连、Worker takeover 和发布进程中断后只从 durable DB/ledger 恢复；已派发模型超时为 `unknown`，不换模型重发。机制：幂等 receipt、SSE cursor、lease fence、模型调用账本。
- 后置 Postcondition：成功时 `FullStackPreviewRelease=published`，迁移回执、release manifest、内部健康、黑盒验证、合成写入 receipt 与 Pages link state 均绑定同一 commit/digest；失败时为 `failed/revoked`，Pages 链接禁用且边缘关闭。业务数据库只含合成预览数据，不含真实个人资料。
- 验收 Acceptance：
  1. Web、API、Worker 三个独立 systemd 单元均使用非 root 用户、固定 release 和最小 EnvironmentFile；
  2. API/Worker 查询 `current_user` 与预期低权身份相等，RDS 连接 `verify-full`，Tair TLS `PING=PONG`；
  3. 一条合成提交在数据库中恰有一个业务记录、一个 job/receipt 和一个可读终态，响应丢失/重复/20 并发仍不增量；
  4. 公网只开放 HTTPS Web，API 管理路径、metrics、数据库、Tair、Worker 端口不可达；
  5. 真实简历/回答/录音、支付、公开注册、招聘写入与删除完成声明均不可用；
  6. Pages 仅在签名、未过期、健康且同 digest 的 manifest 下渲染入口，失败或撤销后恢复禁用状态。
- 关联：现有 Web/API 共享契约、`interview_job`/事件账本、`PreviewWebRelease`；命中 CAS、幂等键、RLS、事件日志、租约栅栏和失败关闭；安全规则为合成数据、最小权限、私网 TLS、无密钥公共输出。
- 七类覆盖：正常（Main）/异常（E4、E6）/特殊（Alternate、E5）/逃逸通道（E3）/高并发（E2）/复杂（迁移→服务→Worker→SSE→Pages）/刁钻（E1 的同键异 payload、错误 target/digest 与迟到模型结果）。

## 七类测试矩阵

| 类别 | TC | 层 | 核心断言 |
| --- | --- | --- | --- |
| 正常 | `TC-ecs-full-stack-preview-01-main` | ECS 黑盒 + RDS/Tair | 三服务 ready；合成写入→领取→读取闭环恰好一次；Pages 链接同 digest。 |
| 异常 | `TC-ecs-full-stack-preview-01-E1` | ECS 发布故障注入 | migration/readiness/黑盒任一步失败时 Pages=disabled、Funnel=off、候选停止、旧库不做 down。 |
| 特殊 | `TC-ecs-full-stack-preview-01-E2` | HTTP/UI | 模型、OSS、OCR、语音、支付关闭时显示不可用，DB 中无伪成功/伪评分/伪对象。 |
| 逃逸通道 | `TC-ecs-full-stack-preview-01-E3` | 外部网络 + 低权 SQL | 非合成主体、跨 owner、注册/上传/支付、API/metrics/DB/Tair 直连全部拒绝或 0 行。 |
| 高并发 | `TC-ecs-full-stack-preview-01-E4` | ECS 20 路并发 | 发布单赢家、提交单赢家、job/消费单份、连接池不超预算。 |
| 复杂 | `TC-ecs-full-stack-preview-01-E5` | 浏览器 + Worker takeover | response-lost、SSE 重连、Worker 重领后恢复同一结果，不重复模型外呼。 |
| 刁钻 | `TC-ecs-full-stack-preview-01-E6` | 配置/安全负测 | 错误 DB/VPC/CA/账号/commit/digest、过期 manifest、已暴露 Key 均在写入/外呼/公开前拒绝。 |

## 当前门禁

- `spec-gate`：**preview_slice_deployed_pending_extended_acceptance**。当前 release、低权运行身份、独立 `meetwise_preview`、large-v1 合成数据、HTTPS root/login 与签名 full-stack manifest 已形成一次受控证据；Pages 入口只在受保护 main 的 workflow 验签后启用。
- 尚未完成 SIGKILL takeover、RLS 全矩阵、浏览器分页/筛选、持续性能和完整模型/RAG/评分验收；不得据此声称生产高可用、真实用户数据环境或完整 AI 流程可用。

## Expert-audit 收敛项

1. 固定验收库 `meetwise_cloud_test` 继续只读；所有预览迁移与合成写入进入同实例独立库 `meetwise_preview`。
2. API、Worker、迁移、QBank/RAG control、隐私 worker 使用分离账号；API/Worker 启动前校验实际 session identity 与 schema revision。
3. 连接预算冻结为 API 6、Worker 普通池每池 4、LISTEN 1；迁移期间停止常驻服务，RDS 50 连接上限保留余量。
4. 公开入口只允许预置合成账号；真实简历、回答、录音、支付、OCR/ASR/TTS 与删除完成声明继续关闭。
5. 迁移只前进，代码回滚不宣称数据库回滚；迁移、成本配置、运行身份 post-flight 任一步失败均不得启动三服务或启用 Pages 链接。
