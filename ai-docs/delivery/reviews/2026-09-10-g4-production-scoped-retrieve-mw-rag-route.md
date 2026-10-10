# Review — G4 production scoped retrieve（partial P-WIRE）· mw-rag-route

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（限 partial P-WIRE：`localRetrieve`→`cachedQbankSearch(..., scope?)` + consumer snapshot 主叶解析）  
**releaseEvidence=false** · Not HA · **R4 仍未关** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ cutover**

## 对照

- `harness/r4-domain-isolation.md` / `r4-domain-isolation-status.md`
- `apps/worker/src/main.ts` · `qbank-retrieve-scope.ts` · `interview-consumer.ts`
- `apps/worker/test/g4-production-scoped-retrieve.proof.ts`
- REQUEST：`REQUEST-g4-production-scoped-retrieve-mw-rag-route.md`
- GAP-RAG-04 · m4 §R4

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | `main.ts` 是否真实转发 `scope`，consumer 是否从 snapshot 主叶解析？ | **是**。`localRetrieve(owner,q,scope?)` → `cachedQbankSearch(..., { scope })`；consumer：`getInterviewRouteSnapshot` → `resolveServingScopeFromRouteSnapshot` → 传入。 |
| 2 | 是否仅 partial P-WIRE？ | **是**。无 `dispatchTrackLocalRetrieval`；无 per-turn planner leaf；缺 snapshot → `undefined` → unscoped（R2 仍开）。 |
| 3 | 是否保持 R4 NOT closed，禁 wrong_track=0 / 题域已隔离？ | **同意**。本绿 ≠ R4 关；≠ wrong_track=0；≠ 题域已隔离。 |
| 4 | PREREQ（R1/R2/Metadata/full dispatch）仍未齐？ | **是**。R2 classify 生产无调用；full plan+recheck 未接线；Metadata/RAG-FUNNEL-01 仍为关闭 PREREQ；R1 fail-closed 有独立刀但 R4 关闸仍列 PREREQ。 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm g4-production-scoped-retrieve:prove` | **0** |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0**（含 E6 partial wire 钉） |
| `pnpm mysql-stack:m4-rag:prove` | **0**（§R4 仍 NOT closed） |
| `pnpm r1-tech-role-fail-closed:prove` | **0**（R1 子刀；≠ 关 R4） |

## 非宣称

禁止：题域已隔离、R4 关闭、wrong_track=0、full `dispatchTrackLocalRetrieval` 已接线、cutover / flip default / HA / `releaseEvidence=true`。
