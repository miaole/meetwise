# Review — R2 P-START 真拒启接线（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-model-op）  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限 **P-START CLOSED pending dual-review**；**≠ R2 fully closed** · **≠ 路由已生效** · **≠ R4 / 题域已隔离** · **≠ 自批 dual-passed**）  
**releaseEvidence=false** · Not HA · **prove 绿 ≠ R2 全关**

覆盖 REQUEST：`REQUEST-r2-p-start-route-classify-mw-rag-route.md`（真拒启版）  

**取代**：同路径前序 honesty PREREQ 回执（优雅降级 / P-START 仍开）— **已被本刀真拒启 supersede**；勿再读旧「P-START 仍开」结论为本刀状态。

## 对照

- UC/arch：`interview_ineligible_route` · `unresolved_route_start_count=0`
- 源：`packages/db/src/recruiter.ts` `startApplicationInterview`（bind → 无 binding 拒启 → 其后才 INSERT）
- API：`apps/api/.../applications.service.ts` → `HttpException` / 同码（无 silent degrade）
- Status：G-R2-4 CLOSED pending dual-review；P-FAKE 仍挡 R2 overall；G-R2-5 retrieve-side 另刀
- 主审：`2026-09-16-r2-p-start-route-classify-mw-model-op.md`（真拒启版）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | `no_binding` → `interview_ineligible_route` 是否满足 UC「未决绝不启动」与可测等价 `unresolved_route_start_count=0`？ | **是**。`StartApplicationResult` 含该码；`bindApplicationRoute` 后 `(binding.rowCount??0)===0` → `return { status:'interview_ineligible_route' }`，且该 return **位于** `INSERT INTO interview` **之前**；未决路径不返回 `started`、不建 interview。snapshot 中途 `no_binding` 另有 belt-and-suspenders 抛错回滚。 |
| 2 | 即使 P-START wire 齐，是否仍保持 **R2 NOT closed**（dual-review 收据 / P-FAKE / ≠ 路由已生效）？ | **是**。本审只合 G-R2-4 / P-START pending dual；R2 overall 仍开：双审收据齐后仍余 **P-FAKE** + harness 同意 + **≠ 路由已生效**。 |
| 3 | G-R2-4 是否同意标为 **CLOSED pending dual-review**（非自批 dual-passed）？ | **同意**。接线已落地且 prove=0；**dual-passed** 须本域 + model-op 双收据齐（本文件即 rag 域收据；不单域自批 dual-passed）。 |
| 4 | 是否禁止把本绿写成 R4 / 题域已隔离 / HA / `releaseEvidence=true` / 路由已生效？ | **禁止**。本绿 ≠ R4；≠ wrong_track=0；Not HA；`releaseEvidence=false`。 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm r2-p-start-route-classify:prove` | **0** |
| `pnpm r2-p-loop-route-classify:prove` | **0**（lazy re-bind 与拒启共存） |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 NOT closed overall） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（≠ R4） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0**（≠ 题域已隔离） |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0**（retrieve-side 另刀；≠ 用本刀关 R4） |

## 接线核验（摘要）

1. **拒启序**：resume ready → `bindApplicationRoute` → 查 binding → 空则 `interview_ineligible_route` → **其后**才 `INSERT INTO interview` → `snapshotInterviewRoute`。
2. **API**：同码 → `HttpException` CONFLICT；无优雅降级成 noop/started。
3. **Worker sole classify** 仍钉（API classify=0）；无内联 `classifyJobRoute` 于 recruiter。
4. **假绿驳回**：规则-only Worker / prove 绿=R2 关 / 仅有字符串无接线 = 假绿（harness 假绿表仍持有）。

## 仍开（挡 R2 overall）

- **P-FAKE** 禁持有  
- **≠ 宣称路由已生效**  
- harness 同意关闸前不得 claim R2 fully closed  
- R4 / 题域 / wrong_track=0 / full dispatch 仍开（本刀不关）

## 非宣称

禁止：R2 fully closed、路由已生效、R4 / 题域已隔离、wrong_track=0、HA、`releaseEvidence=true`、单域自批 P-START dual-passed、假绿关 R2/R4。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-r2-p-start-route-classify-mw-rag-route.md`
- 结论文件：`ai-docs/delivery/reviews/2026-09-16-r2-p-start-route-classify-mw-rag-route.md`
- HEAD：`639134f`
