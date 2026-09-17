# 审查请求 — UC-E2E-025 押题产物过期作面试输入 · mw-e2e-ha + mw-rag-route

**日期**：2026-09-10（PT）  
****非专家结论** — 实现方审请包（禁止自审顶替）**：**gap OK（honest mark-red）· ≠ covered** — 请 `mw-e2e-ha` + `mw-rag-route`（quiz 域）独立确认  
**releaseEvidence=false** · Not HA · **禁止 covered / 假 partial-closed / 全链路 E2E covered**

## Prove（实测）

| CMD | EXIT | 备注 |
|-----|------|------|
| `pnpm uc025:stale-quiz-expiry:prove` | **0** | S1–S4 + G-GAP×4；R5-MARKED-RED pgvector；receipt `release_evidence=false`（`.tmp/isolated-proof-receipts/2026-09-10T08-54-29-810Z-…`） |
| `pnpm eval-harness-matrix-cite:prove` | **0** | harness+eval 引用 UC-E2E-025；钉 gap / R5 / stale-quiz / version-pin / quiz:prove 旁证 |
| `pnpm quiz:prove` | 旁证 | 押题图本身 ≠ 过期作面试输入 |

## 硬钉（请专家勾）

- [ ] 矩阵保持 **gap**（honest）；未升 **covered** / 假 **partial**-closed
- [ ] EXIT=0 = GAP mark-red（STALE-REJECT / VERSION-PIN / REGEN / ACCEPT），**非** A1/A2 产品闭环
- [ ] 钉 **R5 green-risk**；本绿 ≠ 全链路 E2E covered
- [ ] `quiz:prove` / full.e2e quiz 标为旁证 ≠ covered
- [ ] 搜码诚实：`interview.begin` 无 quizId；`resume_quiz` 无 expires_at

## 建议

- 维持 **gap**（honest mark-red）
- 升 **partial** 须 HTTP：过期产物开面试被拒 + resumeVersion 失配拦 + 重押题入口（再谈 covered 更远）

## 对照

`harness/uc-e2e-025-stale-quiz-expiry.md` · `eval/uc-e2e-025-stale-quiz-expiry.eval.md` · 矩阵行 `UC-E2E-025` · P1-8
