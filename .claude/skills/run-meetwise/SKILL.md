---
name: run-meetwise
description: 从干净环境起 Meetwise 栈并跑起栈最小五门验证 gate。Use to bring up the dev stack (Postgres via docker compose) and run the minimum five bring-up gates: four primitives, runtime kernel, mock-interview graph on real LangGraph, request path + SSE, resume→quiz graph. 全量 gate 见 ai-docs/architecture/current-runtime-truth.md §10。
disable-model-invocation: true
allowed-tools:
  - Bash
---

# run-meetwise · 起栈 + 跑验证 gate

从干净环境把 Meetwise 跑起来，并跑通全部可复跑验证 gate。手动触发（`/run-meetwise`）。

## 配方

```bash
# 1) 依赖
pnpm install --frozen-lockfile

# 2) 起 Postgres(pgvector)（dev compose）
pnpm db:up
# 等就绪
for i in $(seq 1 30); do docker exec meetwise-postgres-dev pg_isready -U meetwise -d meetwise && break; sleep 2; done

# 3) 跑起栈最小五门（任一 FAIL 即非零退出；全量 gate 见 ai-docs/architecture/current-runtime-truth.md §10）
pnpm db:prove      # 四原语：CAS恰一个赢 / 幂等 / RLS越权=0 fail-closed(FORCE) / 事件seq
pnpm runtime:prove   # 运行内核：invoke双校验·重试·exactly-once / 状态机 / 租约拒并发 / 重启纯DB恢复 / 幻觉拦截
pnpm graph:prove  # mock-interview 图：interrupt + Postgres checkpointer + 换实例续会话 + 多thread隔离（生产自适应图另跑 pnpm adaptive-graph:prove）
pnpm api:validate  # 请求路径+SSE：principal注入 / RLS 401·404不泄露存在性 / HTTP幂等 / Last-Event-ID重放 + 押题/诊断非法游标 400
pnpm pipeline:prove      # resume-quiz 纯图（无 DB/checkpointer）：简历摄取清洗(注入拦截·PII脱敏) → 押题图 → factuality歪曲门（无报告）

# 关停（停 db:up 起的 dev 栈；compose:down 只停 demo 栈，停不到 dev postgres）
docker compose -f docker/compose.dev.yml down
```

## 期望

每个 gate 全 PASS、退出码 0；故意改错期望值应以非零退出（验证非造假式）。全量 gate 与「证明什么/不证明什么」见 `ai-docs/architecture/current-runtime-truth.md` §10。
