---
id: adr_0021_ecs_full_stack_preview_runtime
name: ECS 完整应用预览运行时
description: 决定以 ACR 内容寻址镜像和 Docker Compose 在单台 ECS 运行 Web、API、Worker，并把可写预览限制为合成数据和受管测试数据面。
type: architecture
scope: shared
level: decision
status: draft
owner: platform
version: 2
related:
  - ../../requirements/use-cases/ecs-full-stack-preview-runtime.md
  - ../../delivery/cloud-resource-inventory.md
tags:
  - adr
  - ecs
  - preview
  - docker-compose
  - acr
---

# ADR-0021：ECS 完整应用预览运行时

## 状态

Draft / implementation blocked。Compose + ACR 是选定方向，但 2026-08-20 尚未进入远程 `main`，也没有
clean-host/upgrade/rollback 的真实 GitHub Actions 与 ECS 证据；不得称 controlled slice 已由 CD 发布。

## 决策

完整预览由一台 ECS 上的 Docker Compose 项目承载：ACR 中两个按 OCI digest 固定的非 root 镜像分别运行 Web，以及共用后端镜像的 NestJS API、Worker 与一次性 migrate 容器。宿主 systemd 只承载 Nginx、Tailscale 和发布/撤销控制面。Nginx/Tailscale 是唯一公网入口；API、Web 宿主映射、Worker metrics、RDS 和 Tair 只走 loopback/VPC。首次接管必须在关闭边缘后停止并禁用旧 app systemd 单元，禁止双 owner。

预览允许 API/Worker 写入同一受管 RDS 实例内的独立数据库 `meetwise_preview`，但只接受固定合成主体和合成内容。固定验收库 `meetwise_cloud_test` 继续只读，不执行迁移。删除链、raw answer artifact、支付、真实模型 operation、OSS 生命周期尚未闭合，因此公开注册、真实简历/回答/录音、支付、招聘邀请、OCR 与删除完成承诺保持不可用。

## 选择理由

- 用户需要从 GitHub Pages 进入可交互的完整前后端，而不是静态页面。
- 用户后续明确选择阿里云容器镜像仓库和 ECS Compose CD，替代早期“ECS 禁止 Docker”的约束。镜像在 GitHub 托管 runner 构建，ECS 只拉取按 digest 固定的成品，不在本地开发机运行 Docker 测试，也不在 4 GiB ECS 编译 Next.js。
- ACR push 与 ECS pull 使用分离凭据；ECS pull 凭据、RDS/Tair/模型配置只在 root-owned 配置文件中，容器只获得各自显式 environment。
- 合成数据可证明数据库写入、队列、Worker 和 UI 恢复链路，同时避免在删除能力不可用时接收真实个人信息。
- Pages 保持无密钥、无 API、无认证职责，只消费签名发布清单。公网激活不是 ECS 自证：控制面先发布 Pages 不会启用的 `public-full-stack-probe` manifest，再生成一次性 nonce 和 10 分钟 deadline；外部验证器通过公网 HTTPS 验证精确版本与完整应用闭环后，控制面才能签发 `public-full-stack` 最终 manifest。候选 workflow 不得接触签名私钥。成功必须等待 Pages 对 final fingerprint 的 enabled receipt；撤销必须等待 revoked fingerprint 的 disabled receipt。
- 发布顺序冻结为 `CI同SHA → preflight → predecessor snapshot → quiesce all writers → migrate → internal api/worker/web → synthetic/E2E → probe → confirm → Pages exact receipt → commit/cleanup`。回滚快照在最后一步前不得删除。

## 备选方案与取舍

1. **只部署静态 Pages**：风险最低，但不能验证 API/Worker/数据库写入，不满足目标。
2. **匿名开放全部功能**：最快展示，但会接收无法完整删除的个人信息，并扩大模型、支付和滥用风险，拒绝。
3. **原生 systemd 直跑源码**：早期切片已使用，但会让依赖安装、构建产物与运行身份难以形成不可变供应链；由 Compose + ACR digest 取代，旧单元在首次切换后退役。
4. **购买独立 staging 集群**：隔离更好，但增加费用和准备时间；待单机预览完成后再评估，不作为首个切片。

## 失败模式

- 迁移指向错误数据库或用 runtime 身份执行 DDL。
- 50 连接上限被 API、Worker、checkpoint、LISTEN 和控制池耗尽。
- Worker 因模型价格/预算或 QBank definer 漂移启动失败。
- Pages 先公开链接，随后内部服务或写入链才失败。
- 已派发模型超时后换备用模型重发，造成双计费/双结果。
- 删除入口仍为 503 时接受真实简历、回答或录音。

这些失败一律在 release manifest 发布前 fail-closed；数据库 migration 不自动回滚，边缘与候选进程可以撤销。

## 后果

- 首个可交付物是受控、合成数据的完整应用预览，不是生产服务。
- RDS 连接预算冻结为 API 6、Worker 每个普通池 4、LISTEN 1；迁移为一次性容器且必须在新目标档冻结前完成。
- 控制器为带外、root-owned 受审 bundle；应用 CD 只能查询其摘要，不能用候选源码自行升级 root 控制器。
- 运行服务必须通过低权数据库 session identity 与 schema revision 启动校验，迁移账号不得挂载到 API/Worker。
- Worker 必须通过生产启动门；若模型治理配置未闭合，发布可以停在内部健康或明确的非 AI 降级，不得伪造完整 AI 可用。
- 后续开放真实用户数据前，必须完成 transcript/删除、模型 operation、评分和内存治理的独立工作包。
