# RECHECK — R2 P-WORKER binding prove fix → mw-model-op

**状态**：**RECHECK / 待复审**（实现方；**禁止自批 pass**）  
**专家**：`mw-model-op`  
**对照回执**：`reviews/2026-09-16-r2-p-worker-route-classify-mw-model-op.md`（conditional：须修陈旧 binding prove）  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **≠ R2 closed** · **≠ 路由已生效** · **P-API 仍开**

## 已修（本刀）

- `packages/ai-runtime/test/job-route-classify-binding.proof.ts`：去掉「apps api+worker 零 classifyJobRoute(」假断言  
- 新钉：**Worker sole ≥1**（`route-classify-consumer.ts`）+ **API=0**；binding fail-closed 不变  
- 域注释同步：`packages/domain/src/sealed-job-route-classify-binding.ts`

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm job-route-classify-binding:prove` | **0**（API=0；Worker sole≥1；≠ R2 关） |
| `pnpm r2-p-worker-route-classify:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0** |

## 请专家确认

1. conditional 条件 #1（binding prove 诚实）是否已满足？  
2. 是否同意在 binding EXIT=0 后可将本切片叙事从 conditional 推进（仍 **仅** P-WORKER；**禁止** R2 / 路由已生效 / HA）？

## 非宣称

- 本 RECHECK **不是** pass · 不自批 · 不关 R2 / P-API
