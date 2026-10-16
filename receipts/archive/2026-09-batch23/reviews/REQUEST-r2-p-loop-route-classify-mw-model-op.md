# REQUEST — R2 P-LOOP classify→bind→snapshot closed-loop → mw-model-op

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-model-op`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ 路由已生效** · **closing P-LOOP ≠ claim R2 fully closed** until dual-review + harness agree

## 对照

- **P-LOOP wire**：`packages/db/src/recruiter.ts` `startApplicationInterview` → **lazy `bindApplicationRoute` then `snapshotInterviewRoute`**（关闭 apply/invite 早于 classify 的竞态）
- Worker sole：`apps/worker/src/route-classify-consumer.ts` → `classifyJobRoute` + MODEL-OP `createJobRouteModelClassify`（规则唯一 leaf = 0 次模型；无 Key fail-closed）
- API wakeup（前序 P-API）：`RecruiterService.create` → `notifyWorkerJobWakeup` + `0133`；API **零** `classifyJobRoute(`
- Prove：`pnpm r2-p-loop-route-classify:prove`
- Harness：`harness/r2-classify-job-route.md` · status · eval

## 切片立场

本刀 **只**关闭 R2 PREREQ **P-LOOP**（classify→`route_decided`→bind→snapshot 生产组合根可证）。  
**不**强制 P-START fail-closed（start 无 binding 仍优雅降级）。  
**不**宣称 R2 closed（须本刀双审 + P-START 等余项）；**不**宣称路由已生效；**不** flip / open DELETE / HA。

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-p-loop-route-classify:prove` | **0** |
| `pnpm r2-p-api-route-classify:prove` | **0**（wakeup 仍绿） |
| `pnpm r2-p-worker-route-classify:prove` | **0**（Worker sole + MODEL-OP 仍绿） |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（P-LOOP CLOSED；R2 NOT closed；≠ 路由已生效） |
| `pnpm job-route-classify-binding:prove` | **0**（prefer fail-closed 无 Key） |

## 请专家回答

1. start 是否在 snapshot **之前**诚实再试 `bindApplicationRoute`（lazy re-bind），且未内联 `classifyJobRoute` / 未造第二分类路径？  
2. Worker 是否仍 sole classify + MODEL-OP；规则唯一 leaf 可无 Key 闭环；ambiguous 无 Key → fail-closed（非假绿）？  
3. 是否同意 **仅**关闭 P-LOOP，**禁止**写成 R2 / 路由已生效 / HA / `releaseEvidence=true`？  
4. 第二域 `mw-rag-route` 是否仍需确认 Inventory I4/I5 与 R2 余项（P-START）？

## 非宣称

- 不宣称 R2 / R4 / 题域隔离已关 · 不宣称 live Key invoke 已测  
- 不宣称 P-START / `interview_ineligible_route` 已落 · `releaseEvidence=false`  
- 本 REQUEST **不是** pass 结论 · **禁止自批**
