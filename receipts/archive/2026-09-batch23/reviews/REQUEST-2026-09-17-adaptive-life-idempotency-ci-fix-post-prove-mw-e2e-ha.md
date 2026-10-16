# REQUEST — CI fix · `adaptive-life:prove` idempotency_key NOT NULL **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~00:40 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠ R5/G6** · **≠ suite green** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ sole cutover** · **≠ flip default**  
**Pair**: `REQUEST-2026-09-17-adaptive-life-idempotency-ci-fix-post-prove-mw-rag-route.md`  
**Hard**: meetwise authorize coding+prove · EXIT=0 ≠ suite绿 ≠ R5/G6/HA · no self-approve · Ban secrets in repo  
**PR**: #108 · branch `feat/mysql-schema-skeleton`  
**Knife**: `pnpm adaptive-life:prove`；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `apps/worker/test/adaptive-lifecycle.proof.ts` | B 端 seed：createJob → rule-classify → invite → start → reserve(真实 interviewId) |
| `packages/db/src/commerce.ts` | `reserveEntitlement` 拒空 `idempotency_key`（schema NOT NULL 对齐） |
| CI run `35194388216` / job verify | 失败根因：`null value in column "idempotency_key" of relation "entitlement_consumption"`（B 端段） |
| R2 P-START / `startApplicationInterview` | 无 `route_decided` → `interview_ineligible_route`（无 interviewId） |

---

## Stance（E2E-HA）

CI 绿点修复（≠ suite 绿 · ≠ R5/G6/HA）：

1. **根因**：B 端 proof 旧 raw `job_posting` INSERT 跳过 semantic revision / classify → `startApplicationInterview` 拒启 → `reserveEntitlement(undefined)` → SQL NULL 撞 NOT NULL。  
2. **修法**：seed 对齐 R2（`createJob` + `classifyJobRoute` rule path）+ 调用方非空 key 守卫；**不**放松 schema NOT NULL。  
3. **诚实**：本绿 = `adaptive-life:prove` EXIT=0 一点；**≠** suite green · **≠** R5/G6/HA · **≠** releaseEvidence。

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm adaptive-life:prove`** | **0** | B 端 unresolved 收口 + A/quote/fail 段全 PASS；≠ suite绿 ≠ R5/G6/HA |

**未跑（禁）**：全 suite 绿关 · HA 绿关 · 把本绿写成 R5/G6/HA / releaseEvidence。  
**Key**：unset（未 invent production secrets）。Test-only `RAG_JOB_ROUTE_INPUT_HASH_KEY` 与 rag03/r4 proof 同款非生产字面量。

---

## Please answer

1. 请 **独立复跑** `pnpm adaptive-life:prove`，附 CMD+EXIT。  
2. 根因读法是否成立（caller/seed 缺 key · schema NOT NULL 正确）？  
3. EXIT=0 是否仍钉 **≠ suite green / ≠ R5 / ≠ G6 / ≠ HA / releaseEvidence=false**？  
4. 是否引入 secrets / `.env*` / 自批 pass？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-17-adaptive-life-idempotency-ci-fix-post-prove-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 suite green / R5 / G6 / HA / releaseEvidence  
- **await post-prove dual**

---

*REQUEST · mw-e2e-ha · adaptive-life idempotency CI fix post-prove · 2026-09-17 ~00:40 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠suite green · awaiting dual*
