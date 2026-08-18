---
id: adr_0021_ecs_full_stack_preview_runtime
name: ECS 完整应用预览运行时
description: 决定以原生 systemd 在单台 ECS 运行 Web、API、Worker，并把可写预览限制为合成数据和受管测试数据面。
type: architecture
scope: shared
level: decision
status: draft
owner: platform
version: 1
related:
  - ../../requirements/use-cases/ecs-full-stack-preview-runtime.md
  - ../../delivery/cloud-resource-inventory.md
tags:
  - adr
  - ecs
  - preview
  - systemd
---

# ADR-0021：ECS 完整应用预览运行时

## 状态

Draft。expert-audit 与 spec-gate 未通过前不得实施或宣称发布。

## 决策

完整预览由一台 ECS 上的三个独立、非 root systemd 服务组成：Next.js Web、NestJS API、Worker。Nginx/Tailscale 是唯一公网入口；API、Worker、metrics、RDS 和 Tair 只走 loopback/VPC。一次性迁移服务与常驻服务分离。

预览允许 API/Worker 写入同一受管 RDS 实例内的独立数据库 `meetwise_preview`，但只接受固定合成主体和合成内容。固定验收库 `meetwise_cloud_test` 继续只读，不执行迁移。删除链、raw answer artifact、支付、真实模型 operation、OSS 生命周期尚未闭合，因此公开注册、真实简历/回答/录音、支付、招聘邀请、OCR 与删除完成承诺保持不可用。

## 选择理由

- 用户需要从 GitHub Pages 进入可交互的完整前后端，而不是静态页面。
- 原生 systemd 满足当前“ECS 禁止 Docker”的约束，并能把三个进程、凭据和重启策略分开。
- 合成数据可证明数据库写入、队列、Worker 和 UI 恢复链路，同时避免在删除能力不可用时接收真实个人信息。
- Pages 保持无密钥、无 API、无认证职责，只消费签名发布清单。公网激活不是 ECS 自证：控制面先发布 Pages 不会启用的 `public-full-stack-probe` manifest，再生成一次性 nonce 和 60 秒 deadline；外部验证器通过公网 HTTPS 验证签名 manifest 与 root/login 摘要后，控制面才能签发 `public-full-stack` 最终 manifest。超时器在取得发布锁前先物理关闭 Web/Funnel；若与确认并发，只对已持久确认的最终 manifest 恢复边缘。撤销期间 Web 先停，Nginx/Funnel 仅保留 revoked manifest，Pages 回执精确匹配后才关闭公网映射。

## 备选方案与取舍

1. **只部署静态 Pages**：风险最低，但不能验证 API/Worker/数据库写入，不满足目标。
2. **匿名开放全部功能**：最快展示，但会接收无法完整删除的个人信息，并扩大模型、支付和滥用风险，拒绝。
3. **继续使用 Docker Compose**：已有编排，但违背本环境禁用 Docker 的明确约束，拒绝。
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
- RDS 连接预算冻结为 API 6、Worker 每个普通池 4、LISTEN 1；迁移期间常驻服务必须停止。
- 运行服务必须通过低权数据库 session identity 与 schema revision 启动校验，迁移账号不得挂载到 API/Worker。
- Worker 必须通过生产启动门；若模型治理配置未闭合，发布可以停在内部健康或明确的非 AI 降级，不得伪造完整 AI 可用。
- 后续开放真实用户数据前，必须完成 transcript/删除、模型 operation、评分和内存治理的独立工作包。
