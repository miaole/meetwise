---
name: run-meetwise
description: 从干净环境起 Meetwise 栈并跑全部验证 gate。Use to bring up the dev stack (Postgres via docker compose) and run the five reproducible validation gates that prove the four primitives, the durable resumable interview kernel on real LangGraph, the request path + SSE, and the end-to-end resume→quiz pipeline.
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

# 3) 跑五个验证 gate（任一 FAIL 即非零退出）
pnpm db:prove      # 四原语：CAS恰一个赢 / 幂等 / RLS越权=0 fail-closed(FORCE) / 事件seq
pnpm runtime:prove   # 运行内核：invoke双校验·重试·exactly-once / 状态机 / 租约拒并发 / 重启纯DB恢复 / 幻觉拦截
pnpm graph:prove  # 真LangGraph：interrupt + Postgres checkpointer + 换实例续会话 + 多thread隔离
pnpm api:validate  # 请求路径+SSE：principal注入 / RLS 401·404不泄露存在性 / HTTP幂等 / Last-Event-ID重放
pnpm pipeline:prove      # 端到端：简历摄取(注入拦截·PII脱敏) → 押题图 → factuality歪曲门 → 报告

# 关停
pnpm compose:down
```

## 期望

每个 gate 全 PASS、退出码 0；故意改错期望值应以非零退出（验证非造假式）。详见 `ai-docs/delivery/production-backlog.md` 的「代码验证现状」。
