# REQUEST — R2 P-START 真拒启接线（unresolved → interview_ineligible_route）→ mw-model-op

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-model-op`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ 路由已生效** · **≠ claim R2 fully closed** until dual-review + receipts · **≠ R4**

## 对照

- UC / arch：`interview_ineligible_route` · `unresolved_route_start_count=0`（未决绝不启动）
- 合同：`snapshotInterviewRoute` — `no_binding` → **调用方必须拒绝启动**
- 产品接线：`startApplicationInterview` bind → 无 binding → **`interview_ineligible_route`**（fail-closed；拒启在 INSERT interview 之前）；API `HttpException`
- Prove：`pnpm r2-p-start-route-classify:prove`
- Harness：`harness/r2-classify-job-route.md` · status · eval
- 前序 CLOSED：P-MODEL / P-WORKER / P-API / P-LOOP（dual-passed）
- 前序 honesty PREREQ：`2026-09-16-r2-p-start-route-classify-mw-model-op.md`（pass 仅 honesty；**已被本刀真拒启取代**）

## 切片立场

本刀 = **P-START 真拒启接线**（关闭 honesty 所钉的产品缺口）：  
- **接线** `interview_ineligible_route` 返回 + API 映射  
- **可测等价** `unresolved_route_start_count=0`：未决路径不创建 interview / 不返回 started  
- **不**内联 `classifyJobRoute`；MODEL-OP 路径仍 Key-unset fail-closed（前序）  
- **禁止自批** P-START dual-passed / R2 关 / 路由已生效

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-p-start-route-classify:prove` | **0** |
| `pnpm r2-p-loop-route-classify:prove` | **0**（lazy re-bind 仍绿；拒启与 P-LOOP 共存） |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 NOT closed overall） |
| `pnpm job-route-classify-binding:prove` | **0**（Key-unset fail-closed） |

## 请专家回答

1. 真拒启是否诚实：`no_binding` → `interview_ineligible_route`，且拒启在 INSERT interview 之前（fail-closed）？  
2. start 是否仍 **不**内联 classify，且 MODEL-OP Key-unset fail-closed 未被动摇？  
3. 是否同意 **P-START CLOSED pending dual-review only**，且 **禁止**写成 R2 关 / 路由已生效 / HA / `releaseEvidence=true` / 自批 dual-passed？  
4. 第二域 `mw-rag-route` 是否仍需确认 G-R2-4 / `unresolved_route_start_count=0` 可测等价 + R2 overall 余项（P-FAKE）？

## 非宣称

- 不宣称 R2 / R4 关 · 不宣称 路由已生效 · 不宣称 P-START dual-passed  
- `releaseEvidence=false` · Not HA  
- 本 REQUEST **不是** pass 结论 · **禁止自批**
