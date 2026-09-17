# REQUEST — R2 P-START 真拒启接线（unresolved → interview_ineligible_route）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ 路由已生效** · **≠ claim R2 fully closed** until dual-review + receipts · **≠ R4**

## 对照

- UC / arch：`interview_ineligible_route` · `unresolved_route_start_count=0`
- Inventory I5：start lazy re-bind → 无 binding **拒启** → 有 binding 才 snapshot
- G-R2-4：真拒启接线（CLOSED pending dual-review）；P-FAKE 仍挡 R2 overall（G-R2-5 retrieve-side 另刀 CLOSED）
- Prove：`pnpm r2-p-start-route-classify:prove` · `pnpm r2-classify-job-route-prereq:prove`
- 假绿表：规则-only 假 Worker / rag03 绿 / prove 绿 = R2 关

## 切片立场

审 **真拒启是否够格关 P-START（pending dual-review）**；通过后仍 **不**宣称 R2 closed / 路由已生效。  
R2 overall 仍开：本刀双审收据未齐 + **P-FAKE** + **≠ 路由已生效**。

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-p-start-route-classify:prove` | **0** |
| `pnpm r2-p-loop-route-classify:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0** |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（R2 仍为 R4 阻塞之一；≠ R4 关） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |

## 请专家回答

1. `no_binding` → `interview_ineligible_route` 是否满足 UC「未决绝不启动」与可测等价 `unresolved_route_start_count=0`？  
2. 即使 P-START wire 齐，是否仍保持 **R2 NOT closed**（dual-review 收据 / P-FAKE / ≠ 路由已生效）？  
3. G-R2-4 是否同意标为 **CLOSED pending dual-review**（非自批 dual-passed）？  
4. 是否禁止把本绿写成 R4 / 题域已隔离 / HA / `releaseEvidence=true` / 路由已生效？

## 非宣称

- 不宣称 R2 / R4 / 路由已生效 · 不宣称 wrong_track=0  
- 不 flip default · 不开 DELETE · Not HA · `releaseEvidence=false`  
- 本 REQUEST **不是** pass 结论 · **禁止自批**
