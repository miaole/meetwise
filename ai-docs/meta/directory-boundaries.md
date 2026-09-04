---
id: meta_directory_boundaries
name: 目录职责边界
description: 定义 Meetwise ai-docs 一级目录职责，避免文档重复和落位混乱。
type: rule
scope: shared
level: guide
status: active
owner: architecture
version: 2
tags:
  - meta
  - boundaries
---

# 目录职责边界

## 总原则

- 一个结论只维护一处。
- 业务语义、实现规则、执行脚本不要混在同一篇文档里。
- 需求说明和长期产品共识分开：本次做什么写 `requirements`，长期是什么写 `product`。
- 单次执行工单放 `.tmp`，不要提交到 `ai-docs`。

## 一级目录

| 目录 | 回答的问题 | 不放什么 |
| --- | --- | --- |
| `meta` | 这套知识怎么找、怎么用 | 业务正文、实现细节 |
| `product` | 业务是什么，为什么存在 | 单次迭代清单、DDL |
| `requirements` | 这次具体做什么 | 长期工程规则 |
| `architecture` | 技术上如何长期组织 | 本次任务 todo。删除回执 sink 盘点只维护在 `architecture/ai/privacy-deletion-sink-inventory.md`；盘点七类矩阵在 `requirements/use-cases/privacy-deletion-sink-inventory.md`；预览路径用例在 `requirements/use-cases/privacy-erasure-preview-path.md`，不另写一份“已删除”声明。 |
| `rules` | 长期稳定约束是什么 | 一次性讨论 |
| `skills` | 这类工作怎么做。测试仪式在 `skills/testing/sop.md` | 产品定义、测试策略正文 |
| `testing` | 怎么验证：策略、TC 规范、golden-tasks、证据 | 实现正文；变更后怎么跑门写在 `skills/testing/` |
| `delivery` | 怎么发布和复盘 | 需求原文 |
| `observability` | 怎么观察 AI 和系统质量 | 用户敏感数据 |

## 测试文档落位（一个结论一处）

- 分层与禁止伪验收 → `testing/strategy/test-strategy.md`
- 如何写 TC、层映射（HTTP 主层 / Playwright 次层） → `testing/conventions/test-authoring.md`
- 改完功能后审核、选层、跑命令 → `skills/testing/SKILL.md`
- 实跑回执与结论边界 → `testing/e2e-performance-evidence.md`
- AI 代码/输出不得默认信任：收束公式 → `skills/testing/fail-closed-gate.md`；长期指针 → `rules/global/ai-generated-review.md`
- E2E 平台集成分支的核实合并顺序 → `delivery/e2e-platform-integration.md`
- 当前短流程面试长度政策（软预算 + 绝对杀开关） → `requirements/use-cases/adaptive-interview-length.md`；一到两小时 blueprint 仍在 `requirements/use-cases/expert-long-interview-runtime.md`，二者不得写成同一完成项
- SCOR-00H 消费诚实闸 → `requirements/use-cases/interview-scoring-measurement.md`；不得另写第二套「无证据可伪造 0 分」规则
- 答题双写互斥 / 切换图 → `architecture/backend/interview-answer-dual-write-cutover.md`；用例在 `requirements/use-cases/interview-answer-dual-write-fence.md`。0126 围栏 ≠ `INT-TRANSCRIPT-01`，不得另写第二套「明文已停用」声明
- 预览 OCR binding → `requirements/use-cases/resume-ocr-binding.md`。0127 双旗预览 ≠ 生产视觉 SLO，不得另写第二套「OCR 已上线」声明
- 面试公平调度 → `architecture/backend/worker-dispatch-fairness.md`；用例在 `requirements/use-cases/worker-event-driven-dispatch.md`。0128 轮转 ≠ 集群全局 inflight / 延迟 SLO，不得另写第二套「调度已公平」声明
- 隐私删除预览路径 → `requirements/use-cases/privacy-erasure-preview-path.md`。0129 预览回执 ≠ 生产删除 / 跨存储 SLO，不得另写第二套「删除已开放」声明
- 面试控制信号（SIGNAL-01） → `requirements/use-cases/interview-control-signals.md`。`observeInterviewSignals` / `early_weak` / `thrashing` 是终止 hook，不是能力等级校准，不得另写第二套「INT-LEVEL-01 已关闭」声明
- HTTP E2E 可执行目录契约 → `testing/conventions/e2e-directory-contract.md`（叙事 SOP 在 `skills/testing/e2e-platform/`，禁止第三套目录故事）
- e2e 用例/断言 parity floors → `testing/e2e-parity-baseline.md`
