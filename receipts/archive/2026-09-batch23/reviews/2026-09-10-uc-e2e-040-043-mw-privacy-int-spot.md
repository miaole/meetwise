# 审查归档 — UC-E2E-040–043 批/题库/席位 · mw-privacy-int spot

**日期**：2026-09-10
**结论**：**pass**（**限诚实 gap mark-red / B-C spot**）
**releaseEvidence=false** · **≠ UC-E2E-040–043 covered** · **≠ 批任务 RLS/双签 PII/席位 CAS 已通** · 实现方不自审

## 对照
- `harness/uc-e2e-040-043-batch-qbank-seat.md`
- `eval/uc-e2e-040-043-batch-qbank-seat.eval.md`
- `apps/api/test/uc-e2e-040-043-batch-qbank-seat.proof.mjs`
- 矩阵行 `UC-E2E-040–043`（**partial**=单岗位绑定旁证；批/导入/席位须保持 **gap**）

## 本机复跑
| CMD | EXIT |
| --- | --- |
| `pnpm uc040-043:batch-qbank-seat:prove` | **0**（S1–S5 PASS；6×G-GAP 印出；`EXIT=0=mark-red ≠ closed`；R5；`release_evidence=false`） |

## 隐私 / B-C spot
| 检查 | 判定 |
| --- | --- |
| 批任务 **RLS** 已证？ | **否（诚实）** — `GAP-UC040-043-E2E` 明示 BatchJob 跨租户 RLS **unproven**；无 batch 表/路由 |
| 双签 / **PII** 已通？ | **否** — `GAP-UC042-DUAL-SIGN`；无 QuestionBankItem 双签 CAS 产品路径 |
| 席位 **CAS** 已通？ | **否** — `GAP-UC043-SEAT-CAS`；无 SeatLedger |
| 冒充单岗位绑定 **covered** | **否** — S4 钉 full.e2e/recruiting-bound=旁证≠本 UC；假绿表禁上抬 |
| privacy `partial_failed` 冒充 BatchJob | **否** — S3 显式分离 |

## 仍 block / 不得宣称
- UC-E2E-040–043 **covered** / 批匹配·导入·席位产品闭环
- 批任务 RLS 0 行已证 / 双签 PII / 席位无超卖
- 产品删除闭环 / `releaseEvidence=true` / sole-stack 已迁

## 一句话
诚实缺口钉 **pass**；**禁止**把本绿写成批 RLS/双签/席位已通或 covered。
