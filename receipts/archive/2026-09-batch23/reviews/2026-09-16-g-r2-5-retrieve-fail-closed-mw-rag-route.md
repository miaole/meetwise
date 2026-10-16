# Review — G-R2-5 Worker retrieve missing snapshot fail-closed（第二域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限 **G-R2-5 retrieve-side**；**≠ R2 fully closed** · **≠ R4 / 题域已隔离** · **≠ wrong_track=0** · **≠ P-START closed** · **≠ 路由已生效**）  
**releaseEvidence=false** · Not HA

覆盖 REQUEST：`REQUEST-g-r2-5-retrieve-fail-closed-mw-rag-route.md`（本文件为专家结论；REQUEST 本身仍非 pass）

## 对照

- Status：`r2-classify-job-route-status.md` G-R2-5；`r4-domain-isolation-status.md` G-R4-1 / P4 / P9
- 源：`apps/worker/src/qbank-retrieve-scope.ts`（`decideRouteSnapshotRetrieve`）
- 源：`apps/worker/src/interview-consumer.ts`（allowed → scoped `localRetrieve`；denied → `degradedRetrieval(reason)`）
- Prove：`apps/worker/test/g-r2-5-retrieve-fail-closed.proof.ts`
- CRAG：`packages/domain/src/crag.ts`（`availability: 'degraded'` → `deny_external`，不走空命中 `fallback_web`）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 缺失/非法 `InterviewRouteSnapshot` 是否确实 fail-closed，且没有 silent unscoped retrieve？ | **是**。`decideRouteSnapshotRetrieve(null|空|非法叶)` → `{ allowed:false, reason:'route_snapshot_missing' }`；consumer 仅在 `allowed` 时调用 `adaptive.localRetrieve(owner, q, scope)`，否则直接 `[degradedRetrieval(...)]`，**不进入** unscoped `cachedQbankSearch`。 |
| 2 | `degradedRetrieval` 是否阻止 CRAG 将缺 snapshot 误判为空题库并外发 web？ | **是**。`degradedRetrieval` 产出 `availability:'degraded'` + `score:-1`；`gradeRetrieval` 优先命中 degraded → `action:'deny_external'`（明确区分于 `scored.length===0` 的 `fallback_web`）。prove 钉 observable degraded ref 含 `route_snapshot_missing`。 |
| 3 | 是否同意仅登记 **G-R2-5 retrieve-side CLOSED**，不宣称 R2、P-START 或 R4 关闭？ | **同意**。本刀只关 retrieve-side 缺 snapshot 缺口；R2 overall / P-START / R4 仍按 status 另计。禁止用本绿假关 R4。 |
| 4 | full dispatch/recheck、per-turn planner leaf、wrong_track=0 与 R4 PREREQ 是否仍正确保持开放？ | **是**。有效 snapshot 仍仅 primary max-bps leaf → scoped search；**零** `dispatchTrackLocalRetrieval`；`g4-dispatch-recheck-prereq:prove` / `mysql-stack:r4-domain-isolation:prove` 仍钉 R4 NOT closed · ≠ wrong_track=0。 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** |
| `pnpm g4-production-scoped-retrieve:prove` | **0**（partial P-WIRE + 缺 snapshot fail-closed；≠ R4） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（无 production dispatch/recheck） |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 NOT closed overall） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0**（≠ R4 / 题域已隔离） |

## 接线核验（摘要）

1. **决策函数**：缺失 / 空 allocations / 非法 leaf / 非法 taxonomy → deny `route_snapshot_missing`；合法主叶 → `QbankServingScopeInput`。
2. **Consumer**：注释与实现一致 — retrieve-side only；禁 unscoped；显式 ≠ 题域已隔离 / ≠ wrong_track=0。
3. **主叶仍 partial**：有 snapshot 时 scoped `cachedQbankSearch`；无 full plan + recheck。
4. **P-START**：本刀未改 start path（REQUEST 自认；prove 钉 retrieve-side only / P-START separate）。

## 非宣称

禁止：R2 fully closed、路由已生效、R4 / 题域已隔离、wrong_track=0、full P-WIRE、假绿关 R4、HA、`releaseEvidence=true`、实现方自批。  
本 pass **仅**覆盖 G-R2-5 **retrieve-side** 缺 snapshot fail-closed。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-g-r2-5-retrieve-fail-closed-mw-rag-route.md`
- 结论文件：`ai-docs/delivery/reviews/2026-09-16-g-r2-5-retrieve-fail-closed-mw-rag-route.md`
- HEAD：`639134f`（workspace `/workspace/meetwise` → `/workspace/projects/meetwise`）
