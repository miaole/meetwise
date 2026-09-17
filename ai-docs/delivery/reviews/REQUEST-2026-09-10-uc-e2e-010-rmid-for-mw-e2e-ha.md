# 审查请求 — UC-E2E-010 SSE mid-interview live-tail→LED（wave #4 · R-mid）· mw-e2e-ha

**日期**：2026-09-10（PT）  
****非专家结论** — 实现方审请包（禁止自审顶替）**：**partial OK · ≠ covered** — 请 `mw-e2e-ha` + 第二域（建议 **privacy/int** spot：R-authz + 0058 stub）独立确认  
**releaseEvidence=false** · Not HA · **禁止 covered** · matrix stay **partial**  
**cite**：既有 `pnpm uc010:sse-resume:prove`（本波扩展 R-mid；非新脚本冒充）

## Prove（实测）

| CMD | EXIT | 备注 |
|-----|------|------|
| `pnpm uc010:sse-resume:prove` | **0** | R1–R4 + **R-mid** + R-authz + G-GAP **13 PASS**；R5-MARKED-RED pgvector；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-39-59-633Z-1106168-060d415d-5ae5-4f31-b2d0-cb384f607741.json`（`release_evidence=false`）；印 PRIVACY-STUB + FULL-E2E / A3 / UI / 0058 / CROSS-REPLICA / LAYER |
| `pnpm eval-harness-matrix-cite:prove` | **0** | harness+eval 钉 partial / §1b 抬 covered / R-mid / ≠covered / releaseEvidence=false / Not HA；`matrix: UC-E2E-010 is partial (not covered)` |

## 本波 advanced（请核对）

- **R-mid**（NON-UI HTTP · **无 MODEL_API_KEY**）：hold 开着时账本续写 → live-tail 收 [6,7] → abort → 断线窗口写 [8,9] → `Last-Event-ID=7` 仅续传 [8,9]
- harness **§1b 抬到 covered 还缺** 已挂（full.e2e / A3 / UI / 0058 / 跨副本 / R5）
- 矩阵行 / P1-1 更新为 R-mid 已挂；**仍 partial**

## 硬钉（请专家勾）

- [ ] 矩阵保持 **partial**；未升 **covered**
- [ ] R-mid 绿 = HTTP ledger live-tail 阶，**≠** full.e2e mid-interview / A3 kill+无双扣
- [ ] 未把 `last-event-id:unit` / `sse-slot` / `helpers/sse` / `stream-window` 冒充本 UC covered
- [ ] §1b 仍非空：full.e2e / A3 / UI / 0058 去 stub / 跨副本 / sole-stack
- [ ] privacy stub / R-authz=404 ≠ 0058 fence / 擦除 covered（spot 不放水）
- [ ] 钉 **R5 green-risk**；releaseEvidence=false · Not HA

## 建议

- 维持矩阵 **UC-E2E-010 = partial**
- 升 **covered** 前须关 §1b#1–#6 并复跑绿；勿因 R-mid / cite EXIT=0 回写 covered
- 下一刀：full.e2e mid-interview（需 Key）或 A3 kill+billing；并行 privacy 去 stub

## 对照

`harness/uc-e2e-010-sse-resume.md` §1b · `eval/uc-e2e-010-sse-resume.eval.md` · `apps/api/test/uc-e2e-010-sse-resume.proof.ts` · 矩阵 §1.1 UC-E2E-010 · §3 P1-1
