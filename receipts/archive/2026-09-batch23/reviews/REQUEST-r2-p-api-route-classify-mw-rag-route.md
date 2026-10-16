# REQUEST — R2 P-API wakeup（R2 仍可能开）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **R2 仍 NOT closed**（直至 dual-review + 闭环证据）· **≠ 路由已生效**

## 对照

- P-MODEL CLOSED：`job.route-classify.v1` + `bindJobRouteClassify` + `0131`
- P-WORKER CLOSED（pending dual-review）：sole `route-classify-consumer` → `classifyJobRoute(` + MODEL-OP
- P-API CLOSED（pending dual-review）：`RecruiterService.create` → `notifyWorkerJobWakeup` + `0133` `route_pending` trigger；**API 零** `classifyJobRoute(`
- Status：`harness/r2-classify-job-route-status.md`（P-API closed；G-R2-1/3 闭环 / bind→snapshot 仍诚实开）
- Prove：`pnpm r2-p-api-route-classify:prove` · `pnpm r2-classify-job-route-prereq:prove`

## 切片立场

P-API 关闭 **不等于** R2 关闭。无 classify→`route_decided`→bind→snapshot 生产闭环可证 → **不得**宣称路由已生效。  
禁止把 wakeup 绿写成 R2 / R4 / HA。禁止第二分类路径绕过 Worker。

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-p-api-route-classify:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（Worker sole；API wakeup；R2 NOT closed） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（R2 仍可为 dispatch 阻塞；≠ R4 关） |

## 请专家回答

1. Inventory I3 是否正确改为 API wakeup 组合根已接线，而 Worker 仍 sole classify？  
2. 是否同意 **保持 R2 NOT closed**（因闭环 / P-START / 缺 dual-review 诚实证据），即使 P-API 关？  
3. 是否禁假绿：wakeup 绿 ≠ 路由已生效 ≠ R2 关 ≠ R4？  
4. G-R2-1/3 关闭条件（classify→bind→snapshot 生产闭环可证）是否仍正确未宣称达成？

## 非宣称

- 不宣称 R2 closed · 不宣称路由已生效 · 不关 R4  
- 不假闭环 · 不 flip / cutover / HA / `releaseEvidence=true`  
- 本 REQUEST **不是** pass 结论 · **禁止自批**
