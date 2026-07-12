---
id: architecture_devops_local_demo_deployment
name: 本地演示与部署架构
description: 定义 Docker Compose 一键演示、本地开发、线上部署和长期运维策略。
type: reference
scope: shared
level: guide
status: active
owner: devops
version: 1
tags:
  - devops
  - docker
  - deployment
---

# 本地演示与部署架构

## 目标

Meetwise 必须从第一阶段就能一键本地演示：

```bash
docker compose -f docker/compose.demo.yml up --build
```

演示环境启动后，应包含：

- Web
- API
- Worker
- Postgres
- Redis
- MinIO
- Mailhog 或测试邮件服务
- seed 数据

## Compose 文件规划

```text
docker/
  compose.dev.yml
  compose.demo.yml
  compose.observability.yml
  env/
    api.env.example
    web.env.example
    worker.env.example
  seed/
    demo-user.json
    demo-resume.md
    demo-role.md
```

## compose.dev.yml

用于日常开发，只启动基础设施：

- Postgres + pgvector
- Redis
- MinIO
- Mailhog

Web/API/Worker 在本机用 pnpm dev 启动。

## compose.demo.yml

最终用于完整演示：

- build web/api/worker 镜像
- 自动执行 migration
- 自动 seed demo 数据
- 健康检查通过后输出访问地址

当前文档阶段先提供基础设施版 `compose.demo.yml`，用于启动 Postgres、Redis、MinIO 和 Mailhog。应用服务会在工程骨架阶段接入，接入前不得把 compose 演示视为完整产品验收。

## compose.observability.yml

可选：

- Prometheus
- Grafana
- OpenTelemetry Collector
- Jaeger/Tempo
- Langfuse 或 LangSmith 本地/远端配置

## 本地演示验收

| 项 | 验收 |
| --- | --- |
| 数据库 | migration 成功，seed 成功 |
| 登录 | demo 用户可登录 |
| 简历 | demo 简历可查看和解析 |
| 押题 | 可生成或使用 mock provider 生成问题 |
| 模拟面试 | 可开始、回答、暂停、恢复、结束 |
| 报告 | 可生成报告 |
| 恢复 | 重启 API/Worker 后会话可恢复 |
| 观测 | 能看到 API health、worker health、graph run trace |

## 环境策略

| 环境 | 目的 | 部署 |
| --- | --- | --- |
| local | 开发自测 | pnpm + compose.dev |
| demo | 一键演示 | compose.demo |
| preview | PR 预览 | Vercel web + hosted API 或容器 |
| staging | 联调和回归 | Docker/K8s |
| production | 正式使用 | Vercel web + container API/worker + managed Postgres/Redis/S3 |

## 线上部署建议

第一阶段：

- Web：Vercel。
- API/Worker：Railway/Fly.io/Render 或自有 VPS Docker Compose。
- DB：Managed Postgres。
- Redis：Managed Redis。
- Object Storage：S3/R2/OSS。

长期：

- API 和 Worker 容器化。
- 数据库迁移走 CI。
- Worker 可横向扩容。
- Graph checkpoint 使用生产级 Postgres。
- 对支付回调、报告生成、模型调用加告警。

## 发布门禁

上线前必须具备：

- `.env.example` 完整。
- migration 可重复执行。
- seed 不污染生产。
- healthcheck。
- rollback 文档。
- contract test。
- E2E smoke。
- AI golden tasks。
- 支付沙箱验证。
- 敏感日志扫描。
