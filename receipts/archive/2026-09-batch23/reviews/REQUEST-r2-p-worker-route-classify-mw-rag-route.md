# REQUEST — R2 P-WORKER sole classify Worker（R2 仍开）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **R2 仍 NOT closed** · **≠ 路由已生效** · **P-API 仍开**

## 对照

- P-MODEL CLOSED：`job.route-classify.v1` + `bindJobRouteClassify` + `0131`
- P-WORKER CLOSED（pending dual-review）：`route-classify-consumer.ts` sole → `classifyJobRoute(` + MODEL-OP `createJobRouteModelClassify`
- P-API **仍开**：`apps/api` **零** `classifyJobRoute(`；建岗后无 enqueue/wakeup 组合根证据
- Status：`harness/r2-classify-job-route-status.md`（P-WORKER closed；G-R2-1 仍因 P-API / 闭环未齐）
- Prove：`pnpm r2-p-worker-route-classify:prove` · `pnpm r2-classify-job-route-prereq:prove`

## 切片立场

P-WORKER 关闭 **不等于** R2 关闭。无 API 触发 / 完整 classify→bind→snapshot 生产闭环可证 → **不得**宣称路由已生效。  
禁止用规则-only 假 Worker 冒充 R2 关（P-FAKE）。禁止把本绿写成 R4 / HA。

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-p-worker-route-classify:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（Worker≥1 sole；API=0；R2 NOT closed） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（R2 仍为 dispatch 阻塞之一；≠ R4 关） |

## 请专家回答

1. Inventory I2 是否正确改为 sole Worker 已接线，而 I3（API）仍缺？  
2. 是否同意 **保持 R2 NOT closed**（因 P-API / 闭环 / P-START）？  
3. 是否禁假绿：Worker classify 绿 ≠ 路由已生效 ≠ R2 关 ≠ R4？  
4. G-R2-1 关闭条件（classify→`route_decided`→bind→snapshot 生产闭环 + API/触发可证）是否仍正确未宣称达成？

## 非宣称

- 不宣称 R2 closed · 不宣称路由已生效 · 不关 R4  
- 不假 API 接线 · 不 flip / cutover / HA / `releaseEvidence=true`  
- 本 REQUEST **不是** pass 结论
