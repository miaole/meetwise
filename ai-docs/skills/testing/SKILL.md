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

总入口命令（**必跑顺序固定**，flag 可组合，省略的车道记 `not_run`，禁止 skip-as-pass）：

1. **always-on**（默认）：无 Key、无 Docker 的文档 / helper / 回执 / 架构 / api smoke，以及 `package.json` 里已存在的静态守卫
2. **`--core`**：行走骨架隔离门（需要 Docker / 临时 Postgres）
3. **`--live`**：真供应商 HTTP E2E；缺或空白 `MODEL_API_KEY` 必须非零退出

```bash
pnpm regression                 # 只跑 always-on
pnpm regression --core          # always-on 之后再跑行走骨架
pnpm regression --live          # always-on 之后再跑 HTTP E2E
pnpm regression --core --live   # 仍按 always-on → core → live
pnpm regression --dry-run       # 只打印计划，不执行
```

浏览器层不在本入口内：需先 `pnpm -C apps/web build` 再 `pnpm e2e:ui:isolated`。

## 生成前门禁（本技能自身）

改测试配方、E2E harness 或 golden-tasks 时同样适用：

| 字段 | 本轮结论 |
| --- | --- |
| 范围 | 测试技能、HTTP E2E helpers、golden-task 登记、策略文档对齐、`pnpm regression` |
| 来源 | `test-strategy.md`、`test-authoring.md`、`e2e/full.e2e.ts`、`scripts/run-e2e.mjs`、CI `verify` / `nightly` |
| 明确不做 | 不在无 Key 的 CI 里假绿 live E2E；不把 always-on 绿写成 `--core` / `--live` 通过；不把 Playwright 写成 HTTP 全链路的唯一实现；不把 planned golden-task 标成已通过 |
| 领域对象 | 无业务对象变更 |
| 状态机 | 无 |
| 契约 | 无 |
| 数据库 | 无 schema 变更；隔离 E2E 仍走完整迁移 |
| 测试计划 | `pnpm regression:prove`、`pnpm regression --dry-run`、`pnpm e2e-helpers:prove`、`pnpm e2e-receipt:prove`、`pnpm golden-tasks:check`、`pnpm docs:check` |
| 验证 | `pnpm regression:prove`；always-on 用 `pnpm regression --dry-run` 或 `pnpm regression`。`pnpm regression --live` / `pnpm e2e:isolated` 仅在有 `MODEL_API_KEY` 时；缺 Key 必须非零退出 |

## 铁律（先读再跑）

- 控制器/页面绿了不算业务完成。断言状态机落点、账本、隔离、终态事件。
- HTTP 全链路 E2E 是 `e2e/full.e2e.ts` + `scripts/run-e2e.mjs`（fetch / SSE），**不是** Playwright。Playwright 只覆盖 `pnpm e2e:ui:isolated` 的浏览器层。
- `run-e2e.mjs` 在 `E2E_ISOLATED=1` 且存在 `MODEL_API_KEY` 时才启动；`VOICE_FAKE` / `OCR_FAKE` / `E2E_FAKE_MODEL` 直接失败。
- 回执恒为 `releaseEvidence=false`。没有受信 runner、不可变对象存储和独立验签，就不能写发布通过。
- golden-tasks 第一批已建档；未映射到可跑门的条目状态必须是 `planned` 或 `unmapped`，禁止标 `passed`。
