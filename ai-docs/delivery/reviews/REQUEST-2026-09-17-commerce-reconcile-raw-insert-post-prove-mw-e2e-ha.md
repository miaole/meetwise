# REQUEST — Knife **commerce-reconcile raw INSERT / missing `interviewId`** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~00:57 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠ R5/G6** · **≠ suite green** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ sole cutover** · **≠ flip default**  
**Pair**: `REQUEST-2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-rag-route.md`  
**Hard**: meetwise authorize coding+prove · EXIT=0 ≠ suite绿 ≠ R5/G6/HA · no self-approve · Ban secrets in repo  
**PR**: #108 · branch `feat/mysql-schema-skeleton`  
**Knife**: `pnpm commerce-reconcile:prove`；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `apps/worker/test/commerce-reconcile.proof.ts` | B 端 seed：createJob → rule-classify → invite → start → reserve(真实 interviewId) |
| `packages/db/src/commerce.ts` | `reserveEntitlement` 拒空 `idempotency_key`（adaptive-life 遗留守卫；本刀未改） |
| Pre-exec dual | `2026-09-17-commerce-reconcile-raw-insert-mw-e2e-ha.md` + `…-mw-rag-route.md` → pass（docs gate） |
| R2 P-START / `startApplicationInterview` | 无 `route_decided` → `interview_ineligible_route`（无 interviewId） |

---

## Stance（E2E-HA）

同形 adaptive-life B 端 CI/prove 对齐（≠ suite 绿 · ≠ R5/G6/HA）：

1. **根因**：B 端 proof 旧 raw `job_posting` INSERT 跳过 semantic revision / classify → `startApplicationInterview` 拒启 → `reserveEntitlement(undefined)` → SQL NULL 撞 NOT NULL / 或守卫拒。  
2. **修法**：seed 对齐 R2（`createJob` + `classifyJobRoute` rule path）+ 调用方断言非空 `interviewId`；**不**放松 schema NOT NULL；**不**改 production routing。  
3. **诚实**：本绿 = `commerce-reconcile:prove` EXIT=0 一点；**≠** suite green · **≠** R5/G6/HA · **≠** releaseEvidence。

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm commerce-reconcile:prove`** | **0** | §⑦ B 端 rule-classify + interviewId + orphan release + attempt=2 全 PASS；≠ suite绿 ≠ R5/G6/HA |

**未跑（禁）**：全 suite 绿关 · HA 绿关 · 把本绿写成 R5/G6/HA / releaseEvidence。  
**Key**：unset production secrets。Test-only `RAG_JOB_ROUTE_INPUT_HASH_KEY` 与 adaptive-life/rag03/r4 proof 同款非生产字面量。

---

## Please answer

1. 请 **独立复跑** `pnpm commerce-reconcile:prove`，附 CMD+EXIT。  
2. 根因读法是否成立（raw INSERT 跳过 classify → 缺 interviewId）？修法是否诚实（createJob → rule-classify → assert id → reserve）？  
3. EXIT=0 是否仍钉 **≠ suite green / ≠ R5 / ≠ G6 / ≠ HA / releaseEvidence=false**？  
4. 是否引入 secrets / `.env*` / 自批 pass？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 suite green / R5 / G6 / HA / releaseEvidence  
- **await post-prove dual**

---

*REQUEST · mw-e2e-ha · commerce-reconcile raw INSERT post-prove · 2026-09-17 ~00:57 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠suite green · awaiting dual*
