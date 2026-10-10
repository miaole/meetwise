# REQUEST — G-R2-5 Worker retrieve missing snapshot fail-closed → mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **≠ R2 fully closed** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0**

## 对照

- `ai-docs/delivery/harness/r2-classify-job-route-status.md`（G-R2-5）
- `ai-docs/delivery/harness/r4-domain-isolation-status.md`（G-R4-1 partial）
- `apps/worker/src/qbank-retrieve-scope.ts`
- `apps/worker/src/interview-consumer.ts`
- `apps/worker/test/g-r2-5-retrieve-fail-closed.proof.ts`

## 当前实现 / 证据

- `getInterviewRouteSnapshot` 缺失或 snapshot leaf 非法 → `route_snapshot_missing`。
- Worker retrieve 闭包返回 `degradedRetrieval('route_snapshot_missing')`，不调用 `adaptive.localRetrieve`，因此不进入 unscoped `cachedQbankSearch`。
- 有效 snapshot 仍只取 primary max-bps leaf → scoped `cachedQbankSearch`；仍无 per-turn planner / `dispatchTrackLocalRetrieval` + recheck。
- P-START 未改：start path 仍是独立刀；本刀不拒绝 start、不改 `interview_ineligible_route`。

## 请专家复跑

| CMD | 期望 EXIT |
|---|---:|
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** |
| `pnpm g4-production-scoped-retrieve:prove` | **0** |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** |

## 请专家回答

1. 缺失/非法 `InterviewRouteSnapshot` 是否确实 fail-closed，且没有 silent unscoped retrieve？
2. `degradedRetrieval` 是否阻止 CRAG 将缺 snapshot 误判为空题库并外发 web？
3. 是否同意仅登记 **G-R2-5 retrieve-side CLOSED**，不宣称 R2、P-START 或 R4 关闭？
4. full dispatch/recheck、per-turn planner leaf、wrong_track=0 与 R4 PREREQ 是否仍正确保持开放？

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass 结论；专家未审前不得合入/自批。
- 不改 P-START / start path；不宣称 R2 fully closed 或 route effective。
- 不宣称 R4 / 题域隔离 / wrong_track=0 / covered / HA。
- 不切 qbank/向量真相；不 flip default；不开 DELETE。
