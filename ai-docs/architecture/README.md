---
id: architecture_readme
name: 架构入口
description: Meetwise 技术架构入口。
type: reference
scope: shared
level: guide
status: active
owner: architecture
version: 1
tags:
  - architecture
---

# 架构入口

推荐阅读：

1. `system-blueprint.md`
2. `ai/langgraph-blueprint.md`
3. `devops/local-demo-deployment.md`

答题落点（legacy 明文 job / event / ledger）与 `INT-TRANSCRIPT-01` 之前的互斥围栏：`backend/interview-answer-dual-write-cutover.md`。该页不是 01 完成证明。

后端高并发复核骨架（公平调度、SKIP LOCKED、SSE 槽、模型槽、账本 CAS）：`backend/high-concurrency-review.md`。该页是缺口清单，不是容量或发布证明。`HC-GAP-006`（押题/诊断非法 `Last-Event-ID` HTTP 400）已由 `pnpm api:validate` 关闭；429 槽与跨副本项仍开。
