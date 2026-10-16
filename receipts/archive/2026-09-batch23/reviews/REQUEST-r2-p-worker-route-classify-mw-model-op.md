# REQUEST — R2 P-WORKER sole `route-classify` Worker → mw-model-op

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-model-op`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ 路由已生效** · **P-API 仍开**

## 对照

- Consumer：`apps/worker/src/route-classify-consumer.ts` → `classifyJobRoute` + `createJobRouteModelClassify`
- Wire：`apps/worker/src/main.ts` → `runRouteClassifyConsumer` / wake / stop / ready
- MODEL-OP：`createJobRouteModelClassify` + `bindJobRouteClassify`（`job.route-classify.v1`）
- Dispatch：`gateway_dispatch_owners` work=`job_route` + `listNextJobRoutePending` + migration `0132`
- Prove：`pnpm r2-p-worker-route-classify:prove`
- Harness：`harness/r2-classify-job-route.md` §P-WORKER CLOSED（pending dual-review）

## 切片立场

本刀 **只**关闭 R2 PREREQ **P-WORKER**（sole Worker drain `route_pending` → honest MODEL-OP `modelClassify`，**非**规则-only 假 Worker）。  
**不**关 P-API；**不**宣称 R2 closed；**不**宣称路由已生效；**不** flip default / open DELETE / HA。

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-p-worker-route-classify:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（Worker sole classify；API=0；R2 NOT closed） |
| `pnpm job-route-classify-binding:prove` | **0**（P-MODEL 仍绿；prefer fail-closed 无 Key） |

## 请专家回答

1. Worker `modelClassify` 是否诚实走 `createJobRouteModelClassify` / `job.route-classify.v1`（非假规则-only、非冒充 R2 绿）？  
2. `bind` / invoke 路径是否仍 fail-closed（unknown / digest / 无 Key 结构可钉）？  
3. 是否同意 **仅**关闭 P-WORKER，**禁止**写成 R2 / 路由已生效 / HA / releaseEvidence=true？  
4. 第二域 `mw-rag-route` 是否仍需确认 P-API 阻塞与 Inventory？

## 非宣称

- 不宣称 R2 / R4 / 题域隔离已关 · 不宣称 API enqueue/wakeup 已齐  
- 不宣称 live invoke / Key / 预算实测 · `releaseEvidence=false`  
- 本 REQUEST **不是** pass 结论

## 实现方注（binding prove 诚实修复 · 2026-09-16 PT）

陈旧断言「apps api+worker 零 `classifyJobRoute(`」已改为 **API=0 / Worker sole≥1**（见 `packages/ai-runtime/test/job-route-classify-binding.proof.ts`）。  
请对照 conditional 回执 `reviews/2026-09-16-r2-p-worker-route-classify-mw-model-op.md` 复审：`reviews/RECHECK-r2-p-worker-route-classify-mw-model-op.md`。  
**禁止自批** · ≠ R2 closed · P-API 仍开 · releaseEvidence=false · Not HA。

