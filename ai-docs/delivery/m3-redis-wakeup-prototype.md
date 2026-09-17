# M3 — Redis Streams wakeup 最小原型

> **2026-09-17 (~01:15 PT) · orthogonal under PG-retained**  
> Meetwise ruled **Postgres (+pgvector + PostgresSaver)** retained; MySQL relational + Qdrant vector cutovers **STOPPED**.  
> **Redis wake remains separately evaluable** — this knife is **NOT** canceled by the PG-retained ruling.  
> Former framing that required MySQL sole relational / Qdrant sole vector as prereq for wakeup eval is **superseded**; wakeup may be evaluated against the retained Postgres business path.  
> `releaseEvidence=false` · ≠HA · ≠suite green · Ban treating this note as wakeup cutover authorized.


**状态**：prototype · **releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁 / ≠ cutover**  
**选型依据**：`ai-docs/delivery/m3-queue-wakeup-selection.md`（Q1 Redis Streams 优选）  
**Harness**：`ai-docs/delivery/harness/redis-streams-wakeup.prototype.md`

## 硬约束

- **不切生产 wakeup**：`apps/worker/src/job-wakeup-listener.ts` 的 PG `LISTEN` / `pg_notify` 路径保持完整；`main.ts` 仍无条件启动 PG listener。
- 新路径 **feature-flag 默认关**：`MEETWISE_WAKEUP_REDIS_STREAMS=0`（未设 / `0` / 其它非显式真值 → 关）。关时零行为变化。
- Wake 载荷仍仅为固定 token **`wake`**（字段 `payload`），无 owner / job / user / PII。
- 队列表 + claim 租约仍是 durable 工作源；周期 reconcile 仍覆盖漏通知窗口。

## 交付物

| 路径 | 角色 |
|------|------|
| `packages/db/src/worker-job-wakeup.ts` | PG channel + Redis stream/group/field 常量 |
| `apps/worker/src/worker-job-wakeup-redis.ts` | `XADD` publish + `XREADGROUP` consume helpers；flag gate |
| `apps/worker/src/main.ts` | **additive** Redis listener（仅 flag=1 且 URL 就绪）；PG 不关 |
| `scripts/mysql-stack.redis-wakeup.proof.mjs` | 静态钉 + 对 `:63809` 发/收一条 wake |
| root `pnpm worker-wakeup-redis:prove` | harness 同名 CMD |

## Prove

```bash
docker compose -f docker/compose.mysql-local.yml up -d redis   # :63809
pnpm worker-wakeup-redis:prove   # 期望 EXIT=0
```

## 非目标

- 不宣称队列 / MODEL-OP reconciler 已切；不自批 cutover；不勾 `controlPlaneClosed=true`。
