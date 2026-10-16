# Harness — Redis Streams wakeup 最小原型

> **2026-09-17 (~01:15 PT) · orthogonal under PG-retained**  
> Meetwise ruled **Postgres (+pgvector + PostgresSaver)** retained; MySQL relational + Qdrant vector cutovers **STOPPED**.  
> **Redis wake remains separately evaluable** — this knife is **NOT** canceled by the PG-retained ruling.  
> Former framing that required MySQL sole relational / Qdrant sole vector as prereq for wakeup eval is **superseded**; wakeup may be evaluated against the retained Postgres business path.  
> `releaseEvidence=false` · ≠HA · ≠suite green · Ban treating this note as wakeup cutover authorized.


**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁**  
**硬约束**：不切生产 `job-wakeup-listener` / `pg_notify`；新路径默认 flag 关（`MEETWISE_WAKEUP_REDIS_STREAMS=0`）。

## 交付物（须与本表 CMD 同名）

| 路径 | 角色 |
|------|------|
| `packages/db/src/worker-job-wakeup.ts` | PG channel + Redis stream/group/field 常量（payload 仍为 `wake`） |
| `apps/worker/src/worker-job-wakeup-redis.ts` | `XADD` + `XREADGROUP` helpers；flag gate |
| `apps/worker/src/main.ts` | additive Redis 旁路（flag 开才连）；**PG LISTEN 无条件保留** |
| `scripts/mysql-stack.redis-wakeup.proof.mjs` | 静态钉 + `:63809` 发/收一条 wake；打印 `CMD=` / `EXIT=` |
| `ai-docs/delivery/m3-redis-wakeup-prototype.md` | 短交付说明 |
| root `package.json` script | **`worker-wakeup-redis:prove`** |

## 前置
- `docker compose -f docker/compose.mysql-local.yml up -d redis`（端口 **63809**）
- redis PING OK

## 命令与期望 EXIT
| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm worker-wakeup-redis:prove` | **0** | Streams 发一条 wake 并可消费；PG listener 代码仍在；flag 默认关 |

等价入口（与上表同脚本，非另名）：

- `node scripts/mysql-stack.redis-wakeup.proof.mjs`

## 非目标
- 不宣称 reconciler/队列已切；Q4 双 reconciler 门仍挡切流
- 不自批 cutover；不勾 `controlPlaneClosed=true` / HA / `releaseEvidence=true`

## 审查
- 专家：`mw-model-op`；结论落 `ai-docs/delivery/reviews/`
