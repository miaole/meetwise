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

> 当前部署目标正在切换为“静态预览目录 + ECS 应用运行时”。本文保留 Compose 的历史开发说明，不能把它当成云端验收、发布证据或数据面测试入口。GitHub Pages 静态目录和 ECS 环境尚未配置完成，所有相关状态均为 `planned`。

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
| local | 纯逻辑、静态文档与前端样式开发 | 不接真实数据面；当前不作为云端验证替代 |
| demo | 历史一键演示兼容路径 | `compose.demo`；不得作为发布或 ECS 验收证据 |
| preview | 公开、无敏感信息的项目导航目录 | GitHub Pages 纯静态产物；实际入口只在经核验的 HTTPS ECS 环境可用时显示 |
| staging | 联调和回归 | 受控 ECS 运行时 + 受管数据服务；尚未配置，不得宣称可用 |
| production | 正式使用 | ECS Web/API/Worker + 受管 PostgreSQL/Redis/对象存储；当前不得发布 |

## 线上部署建议

预览目录：

- 静态目录只包含项目简介、受控入口状态和已核验的 HTTPS 链接；不得包含 API 调用、iframe、环境变量、连接串、令牌、数据服务地址或用户数据。
- 目录必须由受保护分支的最小权限发布任务生成。没有仓库地址、签名目录清单、ECS 健康回执、不可变镜像摘要和到期时间的入口保持禁用。
- 目录不是认证层；实际 ECS 预览环境独立执行认证，入口链接不携带 token、query 或 fragment。
- 首次 controller 安装是单独的 root 信任仪式：先由非 root 用户验证 GitHub Actions 的 controller archive 构件证明，再从已验证 archive 取出 installer；禁止对 checkout、release 目录或任意本机文件直接使用 sudo。controller 之后只接受 root-owned staging archive，并在验签后拒绝链接、特殊成员和路径逃逸。

只读 Web 预览：

- `UC-ecs-public-preview-web-ingress-01` 的 Web 只能监听 ECS 回环端口；受信 HTTPS 边缘只可转发到回环 Nginx，不能把 API、Worker、metrics 或数据服务暴露给公网。
- Nginx 在反代之前只允许 `GET`、`HEAD`、`OPTIONS`；其余 HTTP 方法必须直接返回固定 503，因此 Next Server Action 和任何 API 代理都不会收到公开请求。
- 该工作包不启动 API/Worker、不授予数据面凭据、不迁移数据库。只有 Web 构建摘要、回环健康、HTTPS 地址和入口过期时间均被受控 release 清单验证后，Pages 才能渲染链接。
- HTTPS 的完整黑盒必须在公开签名记录前完成；若失败，不会出现短暂有效的 Pages 链接。撤销与 Pages 的禁用回执以 canonical signed-manifest 摘要匹配，而不是依赖 JSON 格式。

应用运行时：

- Web、API 与 Worker 部署于受控 ECS；仅 HTTPS Web 入口对外暴露，API 不直出，Worker 没有公网入站。公开预览 listener 必须以精确 `MEETWISE_PUBLIC_PREVIEW=1` 启动，并在应用 ingress allowlist 只读方法；变量缺失或为 `0` 的运行时只能放在私网受控 listener。
- 数据库、缓存和对象存储只接受 ECS VPC 内的最小网络路径与工作负载身份。
- 云端数据面测试由独立 ECS executor 执行，使用 run-owned 目标、恢复账本和清理回执；在对应 `CLOUD-TEST-01…05` 通过前，Docker 路由不删除，且不得把本地回执冒充云端通过。

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
- 静态目录链接与受控 ECS 环境的镜像摘要、健康回执、访问策略和过期时间一致；失配、过期、撤销或健康失败时入口不可点击。
