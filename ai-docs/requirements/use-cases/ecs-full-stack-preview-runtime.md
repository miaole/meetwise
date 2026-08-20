---
id: use_cases_ecs_full_stack_preview_runtime
name: ECS 完整应用预览运行时用例
description: 定义 Web、API 与 Worker 接入受管测试 RDS/Tair、完成合成写入闭环并经 Pages 跳转公开预览的范围、状态机与七类验收。
type: requirements
scope: shared
level: spec
status: active
owner: platform
version: 2
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

> 本文定义目标合同，不把候选代码或旧手工部署写成已经完成的 CD 证据。2026-08-20 的真实状态是：
> ECS 仍运行 legacy systemd Web/API/Worker；远程 `main` 没有 `deploy-full-stack` workflow；Pages 指向
> 旧 commit `97d5aee` 的签名清单；ACR 只有后端候选镜像，Web 镜像、ECS Compose/controller 与完整 CD
> Secrets 尚未就绪。因此本用例当前为 **implementation_blocked**，`releaseEvidence=false`。

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
  1. GitHub 只接受 `ci` 对受保护 `main` 的同一 `head_sha` 成功回执；stale SHA、PR run、失败或取消 run 均不得部署；
  2. CI 从该 Git tree 的干净只读输入构建后端/Web 镜像，推入 ACR，并冻结 OCI digest、commit、tree 和 Web 构件摘要；错误 ACR/Tailscale/SSH/controller 身份必须在撤权前失败；
  3. ECS 建立持久发布 owner 和 predecessor 快照；首发显式处理无 predecessor，升级则先取得旧 publication/Compose/legacy owner 的完整恢复材料；
  4. 控制面关闭 Funnel/Web，并确认旧 API、Worker、Web/legacy 或 Compose 常驻写者全部停止；随后一次性 migrate 容器复核 live database identity/schema ledger 并只向前迁移；
  5. ECS 从 ACR 拉取按 digest 固定的镜像，先在公网关闭状态启动 API、Worker、Web；三者通过 schema revision、运行身份、RDS/Tair TLS、连接池预算和 readiness 后，才生成页面/运行时摘要；
  6. 受控预览用户通过固定合成主体走 API/Worker 写入闭环；pre/post receipt 必须绑定同 release、DB、schema、禁止项与 target，失败保持边缘关闭；
  7. 控制面发布 Pages 不启用的签名 `public-full-stack-probe` manifest，再生成一次性 256-bit `probeNonce` 和 10 分钟硬 deadline；耗时的 B/C、API/Worker/RLS/测试库写闭环已在公网关闭状态完成并形成签名组合回执，外部固定版本 verifier 仅重验 root/login/manifest、受保护路由、版本身份、该组合回执摘要与 nonce，签名私钥不进入候选 workflow；
  8. 控制面只接受同 generation、nonce、fingerprint 且未过 deadline 的回执，签发 final manifest；随后触发 Pages 并等待 **同一 final fingerprint 的 enabled receipt**，成功后才提交 publication、清理 predecessor 快照；
  9. 任一步失败进入持久 `failed_closed/rollback_pending`，停止候选并恢复 predecessor 或留下可自动前滚的维护态；不得只依赖当前 GitHub job 的 shell trap。
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
  1. Web、API、Worker 容器均使用非 root 用户、固定 OCI digest 和最小显式环境；宿主 systemd 仅运行发布控制面/Nginx，旧 app 单元为 inactive+disabled；
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

- `spec-gate`：**implementation_blocked**，`releaseEvidence=false`。
- 必须先闭合：Web 在 publish 前内网启动；迁移前静默所有旧写者；首发 provisioning；完整 predecessor rollback；
  Pages final exact receipt；controller live bundle；ACR/Tailscale secrets 与只读 pull 身份；`0121` 已在线迁移纳入源码，
  `0122` 补齐 pgcrypto 可选参数 ACL，中文上下文迁移改为 `0123`。
- 必须补真实 GitHub/ECS 组合根：clean-host 首发、legacy 接管、第二次升级、每 phase SIGKILL/重启、ACR/迁移/
  readiness/synthetic/verifier/Pages 故障、B/C 登录与测试库写入。静态 regex proof 不算 release evidence。

## Expert-audit 收敛项

1. 固定验收库 `meetwise_cloud_test` 继续只读；所有预览迁移与合成写入进入同实例独立库 `meetwise_preview`。
2. API、Worker、迁移、QBank/RAG control、隐私 worker 使用分离账号；API/Worker 启动前校验实际 session identity 与 schema revision。
3. 连接预算冻结为 API 6、Worker 普通池每池 4、LISTEN 1；迁移期间停止常驻服务，RDS 50 连接上限保留余量。
4. 公开入口只允许预置合成账号；真实简历、回答、录音、支付、OCR/ASR/TTS 与删除完成声明继续关闭。
5. 迁移只前进，代码回滚不宣称数据库回滚；迁移、成本配置、运行身份 post-flight 任一步失败均不得启动三服务或启用 Pages 链接。
