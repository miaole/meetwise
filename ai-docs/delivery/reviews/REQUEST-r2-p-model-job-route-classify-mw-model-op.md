# REQUEST — R2 P-MODEL `job_route_classify` MODEL-OP binding → mw-model-op

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-model-op`  
**日期**：2026-09-10（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ 路由已生效** · **≠ 生产 classify 已接线**

## 对照

- Registry：`packages/ai-runtime/src/model-operation-registry.ts` → `job.route-classify.v1`（UC alias `job_route_classify`）
- Binding：`packages/ai-runtime/src/job-route-classify.ts` → `bindJobRouteClassify`
- Sealed：`packages/domain/src/sealed-job-route-classify-binding.ts`
- Admission：`packages/db/migrations/0131_job_route_classify_admission.sql`
- Prove：`pnpm job-route-classify-binding:prove`
- Harness：`harness/r2-classify-job-route.md` §P-MODEL CLOSED

## 切片立场

本刀 **只**关闭 R2 PREREQ **P-MODEL**（typed binding + sealed provenance + admission 种子）。  
**不**新建分类 Worker；**不**在 apps 调用 `classifyJobRoute(`；**不**宣称 R2 closed。

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm job-route-classify-binding:prove` | **0** |
| `pnpm -C packages/ai-runtime prove:model-operation-registry` | **0** |
| `pnpm -C packages/ai-runtime prove:operation-binding` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（apps classify 仍 =0；P-MODEL closed 钉） |

## 请专家回答

1. `job.route-classify.v1` registry / admission / sealed 字段是否与 MODEL-OP-01 合同一致（无 raw prompt / 无 provider URL / maxDispatches=1）？  
2. `bindJobRouteClassify` 是否诚实 fail-closed（unknown op / 非法 digest / 无 Key）？  
3. 是否同意 **仅**关闭 P-MODEL，**禁止**写成 R2 / 路由已生效 / 生产 classify 已接线？  
4. 第二域 `mw-rag-route` 是否仍需确认 P-WORKER/P-API 阻塞？

## 非宣称

- 不宣称 R2 / R4 / 题域隔离已关 · 不宣称 sole Worker 已跑  
- 不宣称 live invoke / Key / 预算实测 · `releaseEvidence=false`  
- 本 REQUEST **不是** pass 结论
