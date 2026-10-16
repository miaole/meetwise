# 审查归档 — UC-E2E-018 abandon 配额/预留 · mw-privacy-int spot

**日期**：2026-09-10  
**结论**：**pass**（**限隐私/租户配额旁证 spot**）  
**releaseEvidence=false** · **≠ UC-E2E-018 covered** · **≠ 产品删除闭环** · 实现方不自审

## 对照
- `harness/uc-e2e-018-user-abandon.md`
- `eval/uc-e2e-018-user-abandon.eval.md`
- `packages/db/test/uc-e2e-018-user-abandon.proof.ts`
- 矩阵行 `UC-E2E-018`（须保持 **partial**）

## 本机复跑
| CMD | EXIT |
| --- | --- |
| `pnpm uc018:abandon:prove` | **0**（A1–A3 全 PASS；`reserved→released`；额度净变 0；二次 abandon noop；complete 拒复活；∉ in-progress；R5 banner；`release_evidence=false`） |

## 隐私 / 租户配额诚实性 spot
| 检查 | 判定 |
| --- | --- |
| 是否假绿冒充 **隐私删除闭环** | **否（若遵守标红）** — 本切片是 entitlement `reserve/release` + interview `abandoned`，**不碰** `privacy_erasure_*` / DELETE / 0091 receipt；公开 DELETE 仍须 503 另轨 |
| 是否假绿冒充 **配额/删除产品闭环** | **配额**：仅证明 abandon 路径 `released` + 额度净变 0（db 集成）；**≠** 全 commerce 闭环 / HTTP 放弃口 covered。**删除**：不得把「额度回补」写成 erasure complete |
| 租户边界 | 断言经 `asPrincipal(owner, …)`；按 `owner_user_id` 读 consumption/interview — 旁证 owner 隔离，**≠** RLS 已可弃 |
| covered 上抬 | harness/eval/prove 钉 **≠ covered**；矩阵 **partial** 可接受 |

## 仍 block / 不得宣称
- UC-E2E-018 **covered** / full.e2e HTTP `POST …/abandon`
- 产品隐私删除闭环 / `releaseEvidence=true` / controlPlaneClosed
- sole-stack 已迁（fixture=pgvector → green-risk）

## 一句话
abandon 配额旁证 **pass**；**禁止**与隐私 DELETE/擦除账本混读。
