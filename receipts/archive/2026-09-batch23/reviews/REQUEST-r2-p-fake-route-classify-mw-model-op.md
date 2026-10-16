# REQUEST — R2 P-FAKE ban fake rule-only Worker / MODEL-OP pin → mw-model-op

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-model-op`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ 路由已生效** · **≠ claim R2 fully closed** until dual-review + harness gates · **≠ R4**

## 对照

- Sole Worker：`apps/worker/src/route-classify-consumer.ts` → `classifyJobRoute` + **`createJobRouteModelClassify`**（MODEL-OP `job.route-classify.v1`）
- Binding：`packages/ai-runtime/src/job-route-classify.ts` — honest modelClassify；Key-unset → `known_not_sent` fail-closed
- Contract：`packages/db/src/job-route-decision.ts` — `deps.modelClassify` **必填**；rules unique leaf 仍在漏斗内（≠ P-FAKE）
- Inventory fake-green：`rag03-route` / rag04/rag05 isolation fake seams；docs 假绿表
- Prove：`pnpm r2-p-fake-route-classify:prove`
- Harness：`harness/r2-classify-job-route.md` · status · eval
- 前序 CLOSED：P-MODEL / P-WORKER / P-API / P-LOOP（dual-passed）/ P-START（dual-passed · 真拒启）/ G-R2-5 retrieve-side

## 切片立场

本刀 = **P-FAKE 禁假绿钉**：  
- **钉死**生产 sole path 必须 `createJobRouteModelClassify`（禁止规则-only 伪 Worker / 任意缺 MODEL-OP 路径宣称 R2 关 / 路由已生效）  
- **Inventory** isolation fake seams（允许作证明夹具；**禁止**外推生产 R2 绿）  
- **不**发明第二分类路径；**不** flip default；**不开** DELETE  
- **禁止自批** P-FAKE dual-passed / R2 关 / 路由已生效

Legitimate UC：`rule_unique_leaf` → `modelCalls=0` **在**已绑定 MODEL-OP 的 Worker 调用 `classifyJobRoute` **之后**发生 = **不是** P-FAKE。

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-p-fake-route-classify:prove` | **0** |
| `pnpm r2-p-worker-route-classify:prove` | **0**（sole + MODEL-OP 仍绿） |
| `pnpm job-route-classify-binding:prove` | **0**（Key-unset fail-closed） |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 NOT closed overall） |

## 请专家回答

1. 生产 sole consumer 是否诚实强制 `createJobRouteModelClassify` / `job.route-classify.v1`，且 apps 无缺 MODEL-OP 的 `classifyJobRoute(` 旁路？  
2. Key-unset / binding fail-closed（`known_not_sent`）是否仍持有，且 isolation fake seams **未**被写成生产 R2 绿？  
3. 是否同意 **P-FAKE CLOSED pending dual-review only**，且 **禁止**写成 R2 关 / 路由已生效 / HA / `releaseEvidence=true` / 自批 dual-passed？  
4. 第二域 `mw-rag-route` 是否仍需确认假绿表 Inventory + R2 overall 余项（≠ 路由已生效 / harness live gates）？

## 非宣称

- 不宣称 R2 / R4 关 · 不宣称 路由已生效 · 不宣称 P-FAKE dual-passed  
- 不宣称 live invoke / Key / 预算实测 · `releaseEvidence=false` · Not HA  
- 本 REQUEST **不是** pass 结论 · **禁止自批**
