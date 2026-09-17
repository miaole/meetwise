# 审查归档 — UC-E2E-010 R-authz / privacy stub · mw-privacy-int spot

**日期**：2026-09-10
**结论**：**pass**（**限授权 spot**）
**releaseEvidence=false** · **≠ UC-E2E-010 covered** · **≠ 0058 privacy fence covered** · 实现方不自审

## 对照
- `harness/uc-e2e-010-sse-resume.md`
- `eval/uc-e2e-010-sse-resume.eval.md`
- `apps/api/test/uc-e2e-010-sse-resume.proof.ts`
- 矩阵行 `UC-E2E-010`（须保持 **partial**）

## 本机复跑
| CMD | EXIT |
| --- | --- |
| `pnpm uc010:sse-resume:prove` | **0**（R1–R4 + **R-authz 404** + G-GAP；印 `GAP-UC010-PRIVACY-STUB`；R5；`release_evidence=false`） |

## 隐私 / 授权 spot
| 检查 | 判定 |
| --- | --- |
| R-authz 跨用户 | **成立**：userB 订 ownerA 流 → **404** |
| 是否冒充 **0058 privacy fence** | **否（诚实）** — `_neg-harness` 未载 0058；prove 自装 **minimal** `interview_privacy_active`（**仅 owner 匹配**，无 erasure/queue fence）；源码+控制台钉 `GAP-UC010-PRIVACY-STUB` / `≠ 0058 fence covered` |
| 假绿冒充隐私擦除 / 跨租户 covered | **禁止** — R-authz ≠ 删除闭环 / ≠ RLS FORCE 全量 / ≠ 0058；矩阵最多 **partial** |
| covered 上抬 | harness/eval/prove 钉 **≠ covered** |

## 仍 block / 不得宣称
- UC-E2E-010 **covered** / full.e2e mid-interview SSE kill→resume
- 0058 完整 privacy fence / 隐私擦除闭环 / `releaseEvidence=true`
- sole-stack 已迁（fixture=pgvector → green-risk）

## 一句话
跨用户 SSE 404 spot **pass**；**minimal stub ≠ 0058 fence**；≠ covered。
