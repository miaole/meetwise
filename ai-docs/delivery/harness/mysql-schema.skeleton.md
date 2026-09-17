# Harness — MySQL schema 骨架

> **2026-09-17 (~01:15 PT) · STOPPED / superseded by PG-retained direction**  
> Meetwise ruling (**hard**): **NO business DB migration to MySQL.** Relational DB + LangGraph checkpoint **keep Postgres** (`PostgresSaver` / RLS / migration **0043** path retained).  
> `packages/db-mysql` / `compose.mysql-local` are **NOT** sole cutover targets. Ban knives that replace PG business tables with MySQL.  
> Prior status preserved below for history; **do not delete**. Further MySQL-relational cutover work on this artifact is **banned**.  
> Qdrant vector cutover likewise superseded (see sibling pins); **Redis wake** remains separately evaluable (not canceled).  
> `releaseEvidence=false` · ≠HA · ≠suite green · Ban implementing cutover from this pin · Dual PASS ≠ authorize coding.

**Prior status (historical)**: active skeleton harness · review `2026-09-10-mysql-schema-mw-e2e-ha.md` **conditional** · INFLIGHT:mysql-schema-prove / GAP-SCH-01


**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁 / ≠ cutover**  
**硬约束**：不删 PG migrations；不弱化 RLS / `principal.ts` `set_config`；不切向量。  
**应用层 tenant ≠ RLS 等价物**（`owner_user_id` 列就绪 ≠ 授权根已迁）。

## 交付物（须与本表 CMD 同名）

| 路径 | 角色 |
|------|------|
| `packages/db-mysql/migrations/0001_skeleton.sql` | utf8mb4 / InnoDB 骨架：`mw_schema_migrations` + `owner_principal` + `job_queue`（含 `owner_user_id`） |
| `scripts/mysql-migrate-local.mjs` | 对 `127.0.0.1:33069`（compose.mysql-local）应用迁移 |
| `scripts/mysql-schema.skeleton.proof.mjs` | 连通/迁移/SHOW TABLES prove；打印 `CMD=` / `EXIT=` |
| root `package.json` scripts | `mysql:migrate:local` · `mysql-schema:skeleton:prove` |

## 前置

- `docker compose -f docker/compose.mysql-local.yml up -d mysql`（host **33069**；redis/qdrant 可选）
- mysql **healthy**（prove 可代启 mysql；compose 插件缺失必须红）
- 无 `.env*` 密钥入 git（本地占位口令仅 compose 同类）

## 命令与期望 EXIT

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm mysql:migrate:local` | **0** | 对 localhost:33069 应用 `packages/db-mysql/migrations/*.sql`（幂等；记入 `mw_schema_migrations`） |
| `pnpm mysql-schema:skeleton:prove` | **0** | mysql healthy（或 compose up mysql）；跑 migrate；`SELECT 1`；`SHOW TABLES` 含 `mw_schema_migrations` / `owner_principal` / `job_queue`；打印 `CMD=` / `EXIT=` |

等价入口（与上表同脚本，非另名）：

- `node scripts/mysql-migrate-local.mjs`
- `node scripts/mysql-schema.skeleton.proof.mjs`

## 非目标

- 非全量 ~130 PG 迁移移植；非破坏性切「唯一真相库」
- 不宣称 RLS 等价、隐私 prove 已绿、队列/MODEL-OP/RAG 已切、HA、`controlPlaneClosed=true`
- `EXIT=0` **≠** cutover；**≠** 授权根已迁

## 审查

- 结论落入 `ai-docs/delivery/reviews/`；合入权在协调/用户；禁止自批切流
