---
name: spec-gate
description: 实现任何功能前的用例/测试门禁。Use before writing implementation code for a feature — verify the feature has business use cases (per use-case-conventions) and test cases covering all seven case categories, each exception/tricky flow mapped to a production-invariant primitive AND a negative assertion at the correct layer; rejects toy-code/fake-acceptance at the gate. Blocks coding if the gate fails.
allowed-tools:
  - Read
  - Grep
  - Glob
---

# spec-gate · 落代码前的用例 / 测试门禁

顺序铁律：**用例 → 契约 → 状态机 → 测试 → 代码**。没有定稿用例（含异常流）+ 对应测试用例，不写实现代码。

## 步骤

1. 定位业务用例（`ai-docs/requirements/use-cases/<domain>.md`，`UC-<module>-<seq>`）。没有 → **gate 失败**，先用 `/usecase-gen` 产出。
2. 校验每条相关 UC 满足 [用例规范](../../../ai-docs/requirements/use-case-conventions.md)：
   - 含 角色/前置/触发/主流程/备选流/**异常流(强制枚举)**/后置(状态机落点+账本)/验收(可测)/关联。
   - **七类 case 全覆盖**（§4），每类至少一条**能失败的断言**，不是空泛分类。
   - 每条异常/刁钻流**落到机制**：状态机迁移 或 [四原语](../../../ai-docs/rules/global/production-invariants.md)（CAS/幂等键/RLS/事件日志），不能停在"会处理好"。
3. 校验测试用例（[test-authoring](../../../ai-docs/testing/conventions/test-authoring.md)）：主流程 + **每条异常流各 ≥1 TC**；强制负向集（失败退款/重复幂等/并发 CAS 恰一赢/越权 RLS=0/schema 失败/幻觉/断线重连/降级）；**正确测试层**。
4. **层映射校验**：钱/状态/隔离的 `并`/`复`/`逃`/`刁` 至少一条落到 E2E/UI 层，不得全堆集成 gate。
5. **无玩具代码检查**（任一命中即 BLOCKED）：HTTP 200 / 页面打开 / mock 证质量 / AI 自评 / 只 happy path / 单 `main()` 无隔离 / 存在即通过 / 异常流不落机制。
6. 输出 `PASS`（可进契约/代码）或 `BLOCKED + 缺口清单`。

## 不通过怎么办

回退补全用例/测试，不前进。复杂功能方案先过 `/expert-audit`（P0）。

代码落地后只走 [`ai-docs/skills/testing/sop.md`](../../../ai-docs/skills/testing/sop.md)，收束用 [`fail-closed-gate.md`](../../../ai-docs/skills/testing/fail-closed-gate.md)。生成的代码/测试/UI 默认不可信。本技能是生成前的用例/测试门禁，不能替代变更后仪式。
