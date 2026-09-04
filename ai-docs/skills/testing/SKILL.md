---
name: meetwise-testing
description: 功能改动后必须走完的审核→测试→回归。选择 unit/contract/prove/E2E，跑隔离门与（有 Key 时的）真供应商 E2E，并检查 AI 出处。禁止把本地绿写成发布证据。
---

# 测试技能 · 审核 → 测试 → 回归

**每做完一处功能改动，先读本文件，再写“已验证”。** 顺序不可跳：

1. [变更审核](./post-change-review.md)
2. [选测试层](./layer-selection.md)
3. 按层跑命令：[门禁目录](./run-gates.md)
4. 按触达面补回归：[回归矩阵](./regression-selection.md)
5. 若改动碰到模型/评分/题面/报告：[出处检查](./ai-provenance.md)
6. 写结论前对照：[诚实规则](./honesty-rules.md)

总入口命令：

```bash
pnpm regression          # 无 Key 也可跑的事后回归（文档 + helper + 回执/运行器证明）
pnpm regression --core   # 再加行走骨架隔离门（需要 Docker / 临时 Postgres）
pnpm regression --live   # 真供应商 HTTP E2E；缺 MODEL_API_KEY 必须非零退出。浏览器层需先 `pnpm -C apps/web build` 再 `pnpm e2e:ui:isolated`
```

## 生成前门禁（本技能自身）

改测试配方、E2E harness 或 golden-tasks 时同样适用：

| 字段 | 本轮结论 |
| --- | --- |
| 范围 | 测试技能、HTTP E2E helpers、golden-task 登记、策略文档对齐、`pnpm regression` |
| 来源 | `test-strategy.md`、`test-authoring.md`、`e2e/full.e2e.ts`、`scripts/run-e2e.mjs`、CI `verify` / `nightly` |
| 明确不做 | 不在无 Key 的 CI 里假绿 live E2E；不把 Playwright 写成 HTTP 全链路的唯一实现；不把 planned golden-task 标成已通过 |
| 领域对象 | 无业务对象变更 |
| 状态机 | 无 |
| 契约 | 无 |
| 数据库 | 无 schema 变更；隔离 E2E 仍走完整迁移 |
| 测试计划 | `pnpm e2e-helpers:prove`（含失败分类账本）、`pnpm e2e-receipt:prove`、`pnpm golden-tasks:check`、`pnpm docs:check`、`pnpm regression` |
| 验证 | 上列命令；`pnpm e2e:isolated` 仅在有 `MODEL_API_KEY` 时 |

## 铁律（先读再跑）

- 控制器/页面绿了不算业务完成。断言状态机落点、账本、隔离、终态事件。
- HTTP 全链路 E2E 是 `e2e/full.e2e.ts` + `scripts/run-e2e.mjs`（fetch / SSE），**不是** Playwright。Playwright 只覆盖 `pnpm e2e:ui:isolated` 的浏览器层。
- `run-e2e.mjs` 在 `E2E_ISOLATED=1` 且存在 `MODEL_API_KEY` 时才启动；`VOICE_FAKE` / `OCR_FAKE` / `E2E_FAKE_MODEL` 直接失败。
- 回执恒为 `releaseEvidence=false`。没有受信 runner、不可变对象存储和独立验签，就不能写发布通过。
- golden-tasks 第一批已建档；未映射到可跑门的条目状态必须是 `planned` 或 `unmapped`，禁止标 `passed`。
