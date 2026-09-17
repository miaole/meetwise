# REQUEST — Knife **commerce-reconcile raw INSERT / missing `interviewId`** **post-prove** → mw-rag-route

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~00:57 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠ R5/G6** · **≠ suite green** · **≠ R4 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ sole cutover** · **≠ flip default**  
**Pair**: `REQUEST-2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-e2e-ha.md`  
**Hard**: meetwise authorize coding+prove · EXIT=0 ≠ suite绿 ≠ R5/G6/HA · no self-approve · Ban secrets in repo · **RAG orthogonal**  
**PR**: #108 · branch `feat/mysql-schema-skeleton`  
**Knife**: `pnpm commerce-reconcile:prove`；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `apps/worker/test/commerce-reconcile.proof.ts` | B 端：`createJob` + `classifyJobRoute`（rule unique leaf）再 invite/start/reserve |
| `packages/db/src/job-route-decision.ts` / R2 P-START | 无 `route_decided` 不得启动面试 |
| `packages/db/src/commerce.ts` | entitlement INSERT 要求非空 `idempotency_key`（本刀未改守卫） |
| Pre-exec dual | docs-gate pass · RAG-orthogonal=yes |

---

## Stance（rag-route）

本刀触及 **R2 路由前置**（classify → bind → start），但是 **proof seed 对齐**，不是 FUNNEL/R4 关刀；**未改** production routing / qbank / FUNNEL：

1. B 端 seed 必须 rule-decide（nestjs/express/koa → `backend/nodejs`）才有 interviewId。  
2. 空 key 守卫保持；不伪造 route_decided；`modelClassify` 故意 throw 强制 rule path。  
3. EXIT=0 ≠ RAG-FUNNEL-01 closed ≠ R4 closed ≠ 题域已隔离 ≠ HA ≠ suite green。

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm commerce-reconcile:prove`** | **0** | B 端 route seed + orphan release PASS；≠ FUNNEL-01/R4 关 |

**禁**：claim FUNNEL-01/R4 closed · forge route_decided · suite/HA 绿关 · self-approve · touch production routing/qbank/FUNNEL。

---

## Please answer

1. 独立复跑 `pnpm commerce-reconcile:prove`，附 CMD+EXIT。  
2. B 端 seed 是否诚实对齐 R2（createJob → classify → start）且未 forge？生产路由/qbank/FUNNEL 是否正交未改？  
3. EXIT=0 是否仍钉 **≠ FUNNEL-01 closed / ≠ R4 closed / ≠ suite green / ≠ R5/G6/HA / releaseEvidence=false**？  
4. `RAG_JOB_ROUTE_INPUT_HASH_KEY` 是否仅为 proof 非生产字面量（Ban secrets）？

Please write the conclusion to `reviews/`（e.g. `2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 FUNNEL-01 / R4 / suite green / R5 / G6 / HA  
- **await post-prove dual**

---

*REQUEST · mw-rag-route · commerce-reconcile raw INSERT post-prove · 2026-09-17 ~00:57 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠FUNNEL-01 closed · RAG-orthogonal · awaiting dual*
