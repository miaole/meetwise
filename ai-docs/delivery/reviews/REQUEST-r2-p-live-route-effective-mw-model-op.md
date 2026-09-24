# REQUEST — R2 P-LIVE 路由已生效收据（Key-unset structural）→ mw-model-op

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-model-op`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ verbal 生效** · **≠ claim 路由已生效** until dual-review + harness agree · **≠ R4**

## 对照

- Sole Worker：`apps/worker/src/route-classify-consumer.ts` → `classifyJobRoute` + **`createJobRouteModelClassify`**（MODEL-OP `job.route-classify.v1`）
- Binding：`packages/ai-runtime/src/job-route-classify.ts` — Key-unset → `known_not_sent` fail-closed（**无 live Key 要求**）
- Contract：`packages/db/src/job-route-decision.ts` — rules-unique → `route_decided` `modelCalls:0`（ALLOW structural 无 Key）
- Start：`startApplicationInterview` — REFUSE `interview_ineligible_route`（INSERT 前）/ ALLOW snapshot→`started`
- Prove：`pnpm r2-p-live-route-effective:prove`
- Harness：`harness/r2-classify-job-route.md` · status · eval · **G-R2-7**
- 前序 dual-passed：P-MODEL / P-WORKER / P-API / P-LOOP / P-START / **P-FAKE**；G-R2-5 retrieve-side CLOSED

## 切片立场

本刀 = **P-LIVE 可测 路由已生效收据**（classify→bind→snapshot→refuse/allow）：  
- **优先** Key-unset fail-closed structural path（rules-unique ALLOW + REFUSE 拒启；model 路径 known_not_sent）  
- **不**要求 live Key / live model invoke；若需 live Key 则须钉 BLOCKED/PREREQ（禁止假绿）  
- **禁止**口头「生效」；仅 CMD+EXIT 收据  
- **禁止自批** P-LIVE dual-passed / R2 关 / 路由已生效

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-p-live-route-effective:prove` | **0** |
| `pnpm r2-p-fake-route-classify:prove` | **0**（P-FAKE dual-passed 仍绿） |
| `pnpm r2-p-start-route-classify:prove` | **0**（真拒启仍绿） |
| `pnpm job-route-classify-binding:prove` | **0**（Key-unset fail-closed） |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 NOT closed overall） |

## 请专家回答

1. Key-unset / `createJobRouteModelClassify` fail-closed（`known_not_sent`）是否仍持有，且本刀 **未**假称 live Key invoke 已绿？  
2. rules-unique `modelCalls:0` ALLOW structural 与 REFUSE（`interview_ineligible_route` 在 INSERT 前）是否构成可复跑的 classify→bind→snapshot→refuse/allow 收据？  
3. 是否同意 **P-LIVE CLOSED pending dual-review only**，且 **禁止**写成 R2 关 / verbal 生效 / HA / `releaseEvidence=true` / 自批 dual-passed？  
4. 第二域 `mw-rag-route` 是否仍需确认 G-R2-7 harness 关闸叙述 + R2 overall 仍开？

## 非宣称

- 不宣称 R2 / R4 关 · 不宣称 路由已生效（至 dual-review + harness）· 不宣称 P-LIVE dual-passed  
- 不宣称 live Key / live model invoke / 预算实测 · `releaseEvidence=false` · Not HA  
- 本 REQUEST **不是** pass 结论 · **禁止自批**
