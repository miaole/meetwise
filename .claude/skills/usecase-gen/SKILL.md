---
name: usecase-gen
description: 为一个能力生成业务用例 + 测试用例（七类 case）。Use when adding a capability — produce its use cases following use-case-conventions (角色/前置/触发/主流程/备选流/异常流/后置/验收/关联), with mandatory coverage of all seven categories (正常/异常/特殊/逃逸通道/高并发/复杂/刁钻), each exception/tricky flow mapped to a production-invariant primitive, plus a test case per flow.
allowed-tools:
  - Read
  - Write
  - Task
---

# usecase-gen · 业务用例生成（七类 case）

产出某能力的用例，写入 `ai-docs/requirements/use-cases/<domain>.md`，遵循 [用例规范](../../../ai-docs/requirements/use-case-conventions.md)。

## 模板（每条 UC 必含全部字段）

```
UC-<module>-<seq> · <标题>
- 角色 / 前置 / 触发
- 主流程 Main：编号步骤，每步可观测
- 备选流 Alternate
- 异常流 Exception（强制枚举）：E1 重复(幂等) E2 并发(CAS) E3 越权(RLS=0) E4 失败回滚/退款 E5 降级 E6 超时/断线重连
- 后置：落到哪个 status + 写哪些账本(审计/成本/事件)
- 验收 Acceptance：可测断言
- 关联：契约 endpoint · 状态机对象 · 命中的[四原语](../../../ai-docs/rules/global/production-invariants.md) · 安全规则
- 七类覆盖标注：正常/异常/特殊/逃逸通道/高并发/复杂/刁钻
```

## 硬规则

1. **七类都要有**；涉及钱/状态/隔离的 UC 必须显式写 E1–E6 适用项。只写 happy path = 不合格。
2. **每条异常/刁钻流落到机制**（状态机迁移 或 四原语），不能停在"会处理好"。
3. **每条 UC 配测试用例**（TC-<UC-id>-<flow> + 测试层）。
4. 复杂域用 Task 派对口业务专家枚举 + 对抗评审（接 `/expert-audit`），别 freehand。
5. 源参考库功能**一个不丢**（功能覆盖），但实现一律按 Meetwise 标准。
