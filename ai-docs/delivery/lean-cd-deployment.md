# 精简单机 CD（当前生效的部署方式）

> 这是**当前生效**的持续部署实现。原「全栈事务化预览 CD」（`deploy-full-stack.yml` +
> 27 步 token 事务链 + 外部签名回执 + Pages 链接态绑定 + `meetwise-cd-root.sh` 控制器 +
> 合成数据重灌）已**退役**：对单机 demo 属过度工程且长期无法稳定收敛。相关工作流已
> `gh workflow disable`（文件暂留仓库、不再触发），其设计文档见
> `ecs-full-stack-cd-implementation-plan.md` / `adr/0021-ecs-full-stack-preview-runtime.md`，
> 仅作历史背景，**不再代表运行现状**。

## 目标与边界

单机 Aliyun ECS 上跑 demo/预览，`push main`（CI 通过后）自动部署。只保留必须的可靠性：
镜像内容寻址身份、幂等迁移、健康门槛、失败自动回滚。**不做**多代事务账本、密码学回执、
Pages 门控、每次部署重灌合成数据（数据库为持久卷，合成数据是一次性手动初始化）。

## 数据流

```
push main → CI(ci.yml 全绿) → deploy.yml:
  1. 构建 web + backend 镜像，按 @sha256 摘要推送到 Aliyun ACR
  2. 接入临时 Tailscale 节点（ECS 仅 tailnet 可达，无公网 SSH）
  3. scp compose.prod.yml + compose.prod.override.yml 到 ECS
  4. ssh 跑 ops/deploy/remote-deploy.sh：
       .env 原地改两行镜像摘要 → docker compose pull
       → run --rm migrate（幂等，只应用新增迁移）
       → up -d --no-deps --wait api worker web（等内建健康检查）
       → 失败自动回滚上一版镜像摘要
公网入口：Tailscale Funnel 443 → 宿主 nginx:80 → web 容器 3000
```

镜像身份 = `@sha256` 内容摘要（不是可变 tag）：被部署的事实即摘要。4G 内存的 ECS 本地
`next build` 会 OOM，故镜像**必须在 CI 构建**，ACR 是 ECS 唯一可拉取源。

## 文件清单

| 文件 | 作用 |
|---|---|
| `.github/workflows/deploy.yml` | CD 工作流（`workflow_run [ci] main success` + 手动） |
| `ops/deploy/remote-deploy.sh` | 机器侧部署：pull→migrate→up --wait→失败回滚 |
| `docker/compose.prod.yml` | 受治理的容器契约（api/worker/web/migrate；镜像 `@sha256` 注入） |
| `docker/compose.prod.override.yml` | 非治理叠加层：部署期运行时旋钮（当前：`web HOSTNAME=0.0.0.0`） |
| `ops/deploy/nginx.conf` | 宿主 nginx，恒定反代 web:3000（`default_server`） |
| `ops/deploy/bootstrap-ecs.sh` | 机器一次性切换脚本（见下） |

## 机器一次性切换（`bootstrap-ecs.sh`）

以 root 在 ECS 跑一次，把机器从旧 controller 切到普通 compose 部署（幂等、不删数据、不动
`.env` 凭据）：停用旧 CD 的全部 `meetwise-*` systemd 单元 → 建 `meetwise-deploy` 账号
（docker 组）并装 CI 部署公钥 → 摘除发行版 nginx 的 `default_server` 并装本站 conf。
另需一次性：把 ACR 登录凭据给 `meetwise-deploy`（`docker login` 或复制 root 的
`~/.docker/config.json`），使 `compose pull` 免登录。

## Secrets（GitHub `preview-cd` 环境）

`ACR_REGISTRY` / `ACR_NAMESPACE` / `ACR_USERNAME` / `ACR_PASSWORD`、
`TAILSCALE_OAUTH_CLIENT_ID` / `TAILSCALE_OAUTH_SECRET`、
`ECS_DEPLOY_KEY`（`meetwise-deploy` 私钥）、`ECS_CD_SSH_HOST`、`ECS_CD_KNOWN_HOSTS`。
机器上的 `/srv/meetwise-compose/.env` 持有 DB/模型等全部运行时密钥（一次性 provision），
部署过程只改写其中 `BACKEND_IMAGE` / `WEB_IMAGE` 两行。

## 运维

- 手动部署 / 重试：`gh workflow run deploy.yml`。
- 回滚：`remote-deploy.sh` 在任一步失败时自动恢复上一版 `.env` 镜像摘要并重起；亦可手动
  把 `.env` 两行摘要改回上一版后 `docker compose ... up -d --wait`。
- 健康：api `/readyz/api`、worker `/readyz/worker`、web `/login`（compose 内建 healthcheck）。
- 调部署期运行时参数：改 `compose.prod.override.yml`（非治理，无需 governance 仪式）；
  改容器契约本身才动受治理的 `compose.prod.yml`。
