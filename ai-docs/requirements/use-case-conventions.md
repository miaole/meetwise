---
id: requirements_use_case_conventions
name: 业务用例编写规范（先用例后代码）
description: 每个能力先写成业务用例（含强制异常流），用例驱动契约、状态机、测试、代码。不允许只写 happy path。
type: rule
scope: global
level: must
status: active
owner: product
related:
  - ../testing/conventions/test-authoring.md
  - ../rules/global/status-machine.md
  - ../rules/global/production-invariants.md
---

# 业务用例编写规范

> 顺序铁律：**用例 → 契约 → 状态机 → 测试 → 代码**。没有定稿用例（含异常流）不写实现代码。用例是契约/测试/代码的共同上游。

## 1. 标识与归属

- ID：`UC-<module>-<seq>`（如 `UC-interview-03`）。module 取后端模块边界里的 seam。
- 一个用例只描述一个用户目标；跨多目标拆开。

## 2. 模板（每条用例必须含全部字段）

```
UC-<module>-<seq> · <标题>
- 角色 Actor：求职者 / 企业HR / 系统 / AI图
- 前置 Precondition：
- 触发 Trigger：
- 主流程 Main：1) … 2) … （编号步骤，每步可观测）
- 备选流 Alternate：A1 …（合法但非默认路径）
- 异常流 Exception（**强制枚举，缺失即用例不合格**）：
    E1 重复请求（幂等）  E2 并发冲突（CAS）  E3 越权（RLS=0行）
    E4 失败回滚/退款     E5 降级（依赖失效/模型拒答）  E6 超时/断线重连
    （按用例取适用项，钱/状态/隔离相关的必须出现）
- 后置 Postcondition：状态机落到哪个 status；写了哪些账本（审计/成本/事件）
- 验收标准 Acceptance：可测的断言（驱动测试用例）
- 关联：契约 endpoint · 状态机对象 · 命中的生产不变量原语 · 隐私/安全规则
- 七类覆盖标注：正/异/特/逃/并/复/刁（见 §4 七类 case 覆盖）
```

## 3. 硬规则

1. **异常流是一等内容，不是补充。** 涉及钱/状态/隔离的用例，必须显式写出 E1–E6 中适用的每一条；只写 happy path 的用例**不予通过**（对应测试策略「禁止假验收」）。
2. **每条异常流必须落到机制**：指向一个状态机迁移 或 一个[生产不变量](../rules/global/production-invariants.md)原语（CAS/幂等/RLS/事件日志），不能停在"会处理好"。
3. **后置必须声明状态与账本**：用例结束时对象处于哪个显式 status、写了哪些不可丢账本。
4. **验收标准必须可测**：每条 Acceptance 能直接转成一个测试断言（见 [test-authoring](../testing/conventions/test-authoring.md)）。
5. **可追溯**：用例 ↔ 契约 ↔ 测试用例 ↔ 代码 双向可查（ID 互引）。

## 4. 七类 case 覆盖（强制）

> 七类图例：**正**=正常 · **异**=异常(回滚/退款) · **特**=特殊(边界/空/首次/i18n) · **逃**=逃逸通道(降级/fallback/kill-switch/人工接管/安全终止) · **并**=高并发(双击/并发/竞态CAS·租约) · **复**=复杂(saga/跨聚合/部分失败) · **刁**=刁钻(注入/越狱/刷分/泄题/降型逃费/PII/畸形/对抗)。

1. **每条 UC 标注七类覆盖**（正/异/特/逃/并/复/刁），域级汇总成覆盖矩阵自检（范例见 [interview-modality 附录 A](./use-cases/interview-modality.md)）。
2. **七类都要有覆盖**：涉及钱/状态/隔离的用例，缺 逃逸通道/高并发/刁钻 任一即不合格；只写正常+异常 = 不合格。
3. **每条异常/刁钻流落机制**：状态机迁移 或 一个[生产不变量](../rules/global/production-invariants.md)原语（与 §3 第 2 条一致），不能停在"会处理好"。

## 5. 范例

见 [UC 范例：提交答案](./use-cases/UC-interview-submit-answer.md)——展示异常流如何逐条落到原语，并对应到已有验证 gate 的断言。
