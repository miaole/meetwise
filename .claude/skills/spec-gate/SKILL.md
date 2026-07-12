---
name: spec-gate
description: 实现任何功能前的用例/测试门禁。Use before writing implementation code for a feature — verify the feature has business use cases (per use-case-conventions) and test cases covering all seven categories (正常/异常/特殊/逃逸通道/高并发/复杂/刁钻), with every exception/tricky flow mapped to a production-invariant primitive and testable acceptance. Blocks coding if the gate fails.
allowed-tools:
  - Read
  - Grep
  - Glob
---

# spec-gate · 落代码前的用例 / 测试门禁

顺序铁律：**用例 → 契约 → 状态机 → 测试 → 代码**。没有定稿用例（含异常流）+ 对应测试用例，不写实现代码。

## 步骤

1. 定位该功能的业务用例（`ai-docs/requirements/use-cases/<domain>.md`，命名 `UC-<module>-<seq>`）。没有 → **gate 失败**，先用 `/usecase-gen` 产出。
2. 校验每条相关 UC 满足 [用例规范](../../../ai-docs/requirements/use-case-conventions.md)：
   - 含 角色/前置/触发/主流程/备选流/**异常流(强制枚举)**/后置(状态机落点+写哪些账本)/验收(可测)/关联。
   - **七类 case 都覆盖**（缺 逃逸通道/高并发/刁钻 任一即不合格）。
   - 每条异常/刁钻流**落到一个机制**：状态机迁移 或 [四原语](../../../ai-docs/rules/global/production-invariants.md)（CAS/幂等键/RLS/事件日志）。
3. 校验测试用例（[test-authoring](../../../ai-docs/testing/conventions/test-authoring.md)）：主流程 + **每条异常流各 ≥1 个 TC**；强制负向集（失败退款/重复幂等/并发CAS/越权RLS=0/schema失败/幻觉/断线重连/降级）；正确测试层。
4. **禁假验收检查**：断言不能只测 HTTP 200 / 只开页 / mock 证质量 / AI 自评 / 只 happy path。
5. 输出 `PASS`（可进契约/代码）或 `BLOCKED + 缺口清单`。

## 不通过怎么办

回退到用例/测试补全，不前进。复杂功能的方案还需先过 `/expert-audit`（P0）。
