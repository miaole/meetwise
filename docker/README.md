# Docker

当前 Docker 目录先定义本地基础设施和演示约束。应用代码创建后，再把 `web`、`api`、`worker` 三个服务接入 `compose.demo.yml`。

## Commands

```bash
pnpm compose:demo
pnpm compose:down
```

## Services

- Postgres + pgvector：主业务库、LangGraph checkpoint、向量索引。
- Redis：RAG 热缓存、嵌入计算缓存与单飞锁（及默认关闭的 Streams 唤醒原型）。**不是**任务队列。限流当前落 PG 共享桶表，Redis 限流未接线。
- MinIO：简历、报告附件和导出物。
- Mailhog：compose 仍有该服务；应用未接线 SMTP / nodemailer，不能当成现行邮件栈。

## Ports

| Service | Port |
| --- | --- |
| Postgres | `54329` |
| Redis | `63799` |
| MinIO API | `9009` |
| MinIO Console | `9010` |
| Mailhog SMTP | `10259` |
| Mailhog Web | `8029` |

## HA dual (local only · Not HA)

- `compose.ha-dual.skeleton.yml` — skeleton static shape
- `compose.ha-dual.yml` — real local api-a/api-b (bind-mount + `meetwise-backend:ha-dual-local`)
- `compose.ha-dual.shared.yml` — C3 overlay attaching dual APIs to sole-stack MySQL/Redis network
- `Dockerfile.ha-dual` — local image shell for the tag above

**releaseEvidence=false** · **Not HA** · requires `MEETWISE_HA_DUAL_AUTHORIZED=1` + image build via `pnpm ha:dual:build-image`. C3 shared also needs sole-stack up + `MEETWISE_HA_SHARED_AUTHORIZED=1` + `pnpm ha:dual:compose-shared` / `pnpm ha:prove:shared`. See `ai-docs/delivery/harness/ha-track.multi-instance.md`. Do not merge into production topology.

