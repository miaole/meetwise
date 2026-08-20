---
id: delivery_cloud_resource_inventory
name: 云资源清单
description: 记录 Meetwise 预览环境当前实际存在的云资源、用途、连接边界和验证状态（脱敏公开版：实例 ID / IP / hostname / Tailscale / release 均为占位符）；不保存任何密钥。
type: delivery
scope: shared
level: reference
status: active
owner: devops
version: 1
tags:
  - cloud
  - inventory
  - ecs
  - rds
  - tair
  - oss
---

# 云资源清单

> 本文为脱敏公开版：所有实例 ID、IP、hostname、Tailscale 与 release 标识均为占位符，不对应任何真实云资源。

## 1. 使用规则

本文记录当前实际存在的测试/预览资源。它不是生产发布证明，也不包含密码、API Key、私钥、数据库连接串或用户数据。

状态口径：

- **已验证**：已从指定 ECS 对真实云资源完成所述只读或最小连通验证。
- **已配置待接线**：资源存在且配置已核对，但完整应用尚未使用它。
- **未启用**：资源存在，但当前部署不应访问。
- **发布阻断**：仍缺少运行时、数据或安全验收，不能对外宣称完整能力可用。

最近核对时间：2026-08-20（America/Los_Angeles）。

## 2. 资源总览

| 类别 | 资源 | 地域/网络 | 当前用途 | 状态 |
| --- | --- | --- | --- | --- |
| ECS | `<ecs-instance-id>` / `<ecs-instance-name>` | 杭州 K；`<vpc-id>`；`<vsw-id>` | Web、API、Worker 的预览运行主机 | 已验证运行中 |
| RDS PostgreSQL | `<rds-instance-id>` | 杭州 K；同 VPC | 当前 legacy 预览实际连接 `meetwise_cloud_test`；`meetwise_preview` 保留历史合成回执 | 已验证但身份漂移待收口 |
| RDS PostgreSQL | `<rds-rag-eval-instance-id>` / `meetwise-rag-eval-test` | 杭州 | 独立 RAG 评测候选库 | 未启用（实例已停止） |
| Tair | `<tair-instance-id>` / `meetwise-rag-cache-test` | 杭州 B；同 VPC | RAG 检索缓存、并发锁和短期热数据 | 已验证 |
| OSS | `<oss-bucket-name>` | 杭州 | 未来的受控 RAG/对象工件存储 | 已配置待接线 |
| GitHub | `miaole/meetwise` | GitHub | 源码、Pull Request、CI 与 Pages 构建来源 | 已配置 |
| GitHub Pages | `miaole.github.io/meetwise` | GitHub Pages | 公开项目介绍与预览版入口 | 当前由旧 manifest 临时启用；非最新发布证据，过期/撤销后自动禁用 |
| Tailscale Funnel | `<tailscale-funnel-host>` | ECS 边缘入口 | HTTPS 预览入口 | 已验证，公开 HTTPS 200 |

## 3. ECS

| 属性 | 当前值 |
| --- | --- |
| 实例 ID | `<ecs-instance-id>` |
| 实例名称 | `<ecs-instance-name>` |
| 状态 | 运行中 |
| 规格 | `ecs.e-c1m2.large`，2 vCPU / 约 3.5 GiB 可见内存，另有 4 GiB swap |
| 系统 | Alibaba Cloud Linux |
| 系统盘 | 40 GiB；核对时约 24 GiB 可用 |
| 公网 IPv4 | `<public-ipv4>` |
| 私网 IPv4 | `<private-ipv4>` |
| 带宽 | 1 Mbps |
| 计费 | 按量付费 |

当前主机已经安装 Node.js 22 与 pnpm，release `<release-ref>` 已落盘。现状 app 仍由 legacy systemd 运行；本次 CD successor 将以 ACR digest + Docker Compose 接管 Web/API/Worker，首次成功切换后旧 app 单元必须 inactive+disabled。Nginx 与发布控制面继续由宿主 systemd 运行。Web/API 宿主映射、Worker metrics 与 Nginx upstream 仅监听 loopback，公网只通过 Tailscale Funnel 暴露 HTTPS Web 入口。

2026-08-20 只读盘点：ECS 尚无 Docker/Compose、`meetwise-cd` 用户、controller bundle、`/etc/meetwise/acr-pull.env`
或 `/srv/meetwise-compose/.env`。线上测试库 `meetwise_cloud_test` 已有 `0121_resume_pgcrypto_runtime_acl`，远程
`main` 仍只到 `0120`；任何 CD 候选必须先把该迁移的精确字节/checksum 纳入源码，`0122` 补齐可选参数
pgcrypto ACL，中文上下文迁移从 `0123` 起。
公开 manifest 仍绑定旧 commit `97d5aee`/旧 schema 声明，与实际 Web/API/Worker/DB 已漂移，不作为最新发布证据。

ACR 当前只确认后端候选 tag 可解析；配套 Web 镜像尚不存在。GitHub `preview-cd` 只具 ECS SSH/origin 四项
secret，缺 ACR push 与 Tailscale OAuth 六项。资源名称存在不证明 secret 值有效，首次撤权前必须完成 pull、
tailnet、host-key、controller live digest 的只读 preflight。

## 4. RDS PostgreSQL

### 4.1 主测试实例

| 属性 | 当前值 |
| --- | --- |
| 实例 ID | `<rds-instance-id>` |
| 引擎 | PostgreSQL 17.0 |
| 规格 | 1 vCPU / 2 GiB；最多 50 个连接 |
| 存储 | 10 GiB 高性能云盘 |
| 数据库 | 当前 legacy Web/API/Worker 实际连接 `meetwise_cloud_test`；`meetwise_preview` 保留历史合成回执，不能再被写成当前运行身份 |
| 内网主机 | `<rds-internal-host>` |
| TLS | 已开启；应用要求 `verify-full` |
| CA | 阿里云 ApsaraDB CA 链；ECS 只保存公开 CA，不在仓库保存凭据 |
| 当前 schema | `meetwise_cloud_test` 为 `0121_resume_pgcrypto_runtime_acl`；仓库纳入相同 0121 后由 0122 successor 继续 |

2026-08-16 的历史 post-verification 累计确认 220 个账号、1,024 个岗位、10,072 条申请、600 份简历和 6,180 场 abandoned 面试；当前定义的 12 项禁止副作用均为 0。该回执属于旧 `large-v1` 容量层，不能证明 2026-08-20 的实际 runtime/database identity，也不能冒充 B/C 深度使用证据。数据均为合成预览数据，不对应真实个人或企业。

连接池必须按 50 连接上限显式分配，API、Worker、迁移和控制面不得各自使用默认大池。

### 4.2 RAG 评测实例

`<rds-rag-eval-instance-id>` 当前为停止状态，并启用释放保护。未完成独立 TargetGrant 和评测执行器前，不得让预览运行时自动启动或访问它。

## 5. Tair

| 属性 | 当前值 |
| --- | --- |
| 实例 ID | `<tair-instance-id>` |
| 名称 | `meetwise-rag-cache-test` |
| 引擎/容量 | Redis 7.0 兼容版，标准 1 GiB |
| 内网主机 | `<tair-internal-host>:6379` |
| TLS | 已开启，TLS 1.2；系统证书有效期到 2029-08-03 |
| 应用账号 | `meetwise_rag_app`，读写 |
| 只读 smoke 账号 | `mw_cloud_smoke`，只读 |
| 白名单 | 包含 ECS 所在 `<private-cidr>` 网段 |

2026-08-16 已轮换 `meetwise_rag_app` 密码，并从 ECS 使用 TLS 连接得到 `PONG`。密码仅保存在 ECS 的 root 配置中，不进入聊天记录、仓库、日志或 Pages 构件。

Tair 只承载可丢弃的缓存和锁，不得作为权益、授权、任务、代际指针或业务终态的真相源。

## 6. OSS

| 属性 | 当前值 |
| --- | --- |
| Bucket | `<oss-bucket-name>` |
| 地域 | 杭州 |
| 存储类型 | 标准存储，同地域冗余 |
| 版本控制 | 已开启 |
| 当前对象量 | 核对时为 0 字节 |

仓库当前没有已验收的 OSS 运行时适配器，也没有为 ECS 配置 OSS 访问身份。完整工件生命周期、最小权限 RAM 身份、加密、删除回执和真实 E2E 完成前，API/Worker 不应写入该 Bucket。

## 7. 入口与发布关系

```mermaid
flowchart LR
  P["GitHub Pages\n公开项目介绍"] -->|"验收后启用链接"| E["ECS HTTPS Web"]
  E --> A["NestJS API\n仅内网/反代"]
  A --> D[("RDS PostgreSQL\n业务真相")]
  A --> T[("Tair\n缓存与锁")]
  A --> W["Worker\n无公网入口"]
  W --> D
  W --> T
  W -. "工件能力待接线" .-> O[("OSS")]
```

Pages 只提供公开介绍和入口，不承载 Next.js 服务端、API、认证、SSE 或用户数据。当前按钮可能因旧且尚未过期的签名 manifest 指向 ECS；该 manifest 绑定的 commit/schema 与实际 runtime 已漂移，因此只能视为临时可达入口，不能视为最新全栈发布。successor CD 必须先撤销旧指纹，再以同 generation/最终指纹的 Pages 回执重新启用。

## 8. 合成预览数据回执

2026-08-16，`large-v1` 单实例执行成功（下列为当时证据）。**机制已变更**：该次是由 systemd 单元
`meetwise-preview-synthetic-large.service` 以 root 执行的；P0-1「降权执行」后该单元已删除，`large-v1`
改由 CD 的 `synthetic-verify` 经 `runuser -u meetwise-synthetic` 从 release 源码树执行（不再以 root 跑
tarball 上传的 loader）。以下 systemd 行是被取代的历史机制，保留仅作当次装载/耗时/计数的证据留档：

- systemd（历史机制，现已取代）：`Result=success`、`NRestarts=0`，耗时 14 分 30 秒，峰值内存约 150.2 MiB；
- 阶段增量：212 个账号、1,000 个岗位、10,000 条申请、582 份去重简历、6,000 场面试；
- 累计：220 个账号、1,024 个岗位、10,072 条申请、600 份简历、6,180 场面试；
- `verificationDigest=<verification-digest>`；
- `dbReceiptDigest=<db-receipt-digest>`；
- `targetDigest=<target-digest>`；
- `verifiedAt=<verified-at>`；
- 原始回执目录：`/var/lib/meetwise-preview-synthetic/preview-large-v1/`（P0-1 后为 `0700 meetwise-synthetic`
  独占，回执 `0600 meetwise-synthetic`；publisher 以 root 经 fd 化 `syntheticOwnedJson` 只读校验后消费）。

该证据只证明本次合成数据装载、post snapshot、服务恢复和一次 HTTPS 200（0.164 秒）；不证明 SIGKILL takeover、RLS 全矩阵、浏览器全流程、持续性能、模型/RAG/评分能力或生产可用。

## 9. 凭据与配置边界

- 仓库、Pages 构件和本文均不得保存任何密码、API Key、私钥或完整连接串。
- RDS/Tair 运行凭据只保存在 ECS root 可读的 Compose/控制面 EnvironmentFile 中；不进入镜像、仓库或 GitHub artifact。
- ACR 推送和 ECS 拉取使用两个不同的最小权限身份；ECS 拉取凭据位于 root:root 0600 的 `/etc/meetwise/acr-pull.env`。
- 公共 CA 证书可由服务读取，但不替代账号授权、白名单或 RLS。
- 已在聊天中出现过的模型 Key 视为已暴露，不能作为正式部署凭据；接入前必须轮换并按文本、Embedding、语音等能力分域。
- OSS 若启用，优先使用绑定 ECS 的最小权限 RAM 角色，避免长期 AccessKey 落盘。

## 10. 尚未完成

1. 合并并发布 GitHub Pages 主入口，使静态页跳转到已验证的 ECS HTTPS 地址。
2. 完成 SIGKILL takeover、RLS 跨 owner 全矩阵、逐 owner 分布、浏览器分页/筛选和持续性能验收。
3. 配置完整模型运行时密钥；模型节点按 operation 绑定主模型与同操作备用模型。
4. 完成异步任务、SSE、Worker 领取与 Tair 缓存的真实组合根验收。
5. OSS 仍保持未接线，直到对象生命周期和删除回执闭环。
