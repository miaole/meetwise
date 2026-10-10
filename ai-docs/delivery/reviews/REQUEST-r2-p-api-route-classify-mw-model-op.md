# REQUEST — R2 P-API createJob → wakeup sole route-classify Worker → mw-model-op

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-model-op`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ 路由已生效** · **closing P-API ≠ claim R2 fully closed**

## 对照

- API 组合根：`apps/api/src/modules/recruiter/recruiter.service.ts` `create` → `createJob` + `notifyWorkerJobWakeup`（**不**调 `classifyJobRoute`）
- DB helper：`packages/db/src/worker-job-wakeup.ts` `notifyWorkerJobWakeup`（固定 `meetwise_worker_wakeup_v1` / `wake`）
- Trigger：`packages/db/migrations/0133_job_route_pending_worker_wakeup.sql`（`job_semantic_revision.status=route_pending` → NOTIFY）
- Worker sole：`apps/worker/src/route-classify-consumer.ts` → `classifyJobRoute` + MODEL-OP `createJobRouteModelClassify`
- Prove：`pnpm r2-p-api-route-classify:prove`
- Harness：`harness/r2-classify-job-route.md` · status

## 切片立场

本刀 **只**关闭 R2 PREREQ **P-API**（建岗后 wakeup / enqueue 组合根，走既有 worker-job-wakeup 通道）。  
Worker 仍为 **sole** `classifyJobRoute(` 调用方。  
**不**宣称 R2 closed（须 dual-review + classify→bind→snapshot 闭环诚实证据）；**不**宣称路由已生效；**不** flip / open DELETE / HA。

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-p-api-route-classify:prove` | **0** |
| `pnpm r2-p-worker-route-classify:prove` | **0**（Worker sole + MODEL-OP 仍绿） |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（P-API wakeup 齐；API=0 classify；R2 NOT closed） |
| `pnpm job-route-classify-binding:prove` | **0**（prefer fail-closed 无 Key） |

## 请专家回答

1. API 是否仅 wakeup、**未**内联 `classifyJobRoute` / 未另开第二分类路径？  
2. wakeup 是否复用既有 `meetwise_worker_wakeup_v1` + `wake`（0133 trigger + `notifyWorkerJobWakeup`），无租户/作业载荷？  
3. 是否同意 **仅**关闭 P-API，**禁止**写成 R2 / 路由已生效 / HA / `releaseEvidence=true`？  
4. 第二域 `mw-rag-route` 是否仍需确认闭环缺口与 Inventory I3？

## 非宣称

- 不宣称 R2 / R4 / 题域隔离已关 · 不宣称 live classify→bind→snapshot 闭环已证  
- 不宣称 live invoke / Key / 预算实测 · `releaseEvidence=false`  
- 本 REQUEST **不是** pass 结论 · **禁止自批**
