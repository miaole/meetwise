# 审查归档 — BUG-FAKE-R5 mark-red · mw-e2e-ha（对照 harness）

**日期**：2026-09-10（PT）  
**结论**：**conditional**  
**releaseEvidence=false** · Not HA · 本绿 ≠ 夹具退役 ≠ sole-stack · 静态标红 ≠ 完整 E2E

## Prove
| CMD | EXIT |
|-----|------|
| `pnpm mysql-stack:r5-mark-red:prove` | **0**（专家复跑属实） |

## 定性
- 静态标红门；harness/inventory/prove 均禁止冒充完整 E2E

## 假绿家族覆盖
- **有钉**：夹具根 / 宽 E2E / vectorstore / 经 isolated 的 RAG·memory·qbank
- **漏**：`rag:adversarial:pg-eval` 不经 isolated、无 R5-MARKED-RED；perf 套件仅 vectorstore 步显式标红；叶子多不均

## 仍缺整套 E2E（blocked / 应复跑未跑）
`e2e:isolated`、`e2e:ui:isolated`、`verify:e2e-performance`、`privacy-erasure:*`、`scor-00:*`、`vectorstore:prove` live、rag03–07、rag-generation/qbank/memory、pg-eval、worker wakeup/INT 等

## 阻塞
- BUG-E2E-ISO 未做；BUG-FAKE-R5 仍 **INFLIGHT:mark-red**
- `mysql-stack:*` **禁止**并入全量 E2E 绿叙事

## 对照
`harness/r5-pgvector-fixture-mark-red.md` · `e2e-case-inventory.md` · rag 审 `reviews/2026-09-10-r5-mark-red-mw-rag-route.md`
