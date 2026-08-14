# Docker

当前 Docker 目录先定义本地基础设施和演示约束。应用代码创建后，再把 `web`、`api`、`worker` 三个服务接入 `compose.demo.yml`。

## Commands

```bash
pnpm compose:demo
pnpm compose:down
```

## Services

- Postgres + pgvector：主业务库、LangGraph checkpoint、向量索引。
- Redis：任务队列、缓存、限流。
- MinIO：简历、报告附件和导出物。
- Mailhog：本地邮件预览。

## Ports

| Service | Port |
| --- | --- |
| Postgres | `54329` |
| Redis | `63799` |
| MinIO API | `9009` |
| MinIO Console | `9010` |
| Mailhog SMTP | `10259` |
| Mailhog Web | `8029` |
