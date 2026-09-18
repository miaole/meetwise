# Review — G4/R4 dispatch-recheck FOLLOW（执行前 · 第二域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限：FOLLOW **honesty recheck / 仍不接线** 文档完备；**≠ R4 已关** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ full P-WIRE** · **≠ 授权笼统 prove 绿关**）  
**releaseEvidence=false** · Not HA · **本审未跑任何 prove**（遵守通过前禁 prove）

覆盖 REQUEST：`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md`  
对照：`harness/r4-domain-isolation.md` §6b · status §6 · `eval/r4-domain-isolation.eval.md` §6 · case-matrix §1.5 NHP-R4-*

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | harness §6b 差距表是否诚实（G-R2-5 关旧 P-FAILCLOSED；R2 wire≠overall；dispatch/planner 仍无）？ | **是**。D1–D7 与代码一致：Worker **零** `dispatchTrackLocalRetrieval(`；无 per-turn planner→`RetrievalPlan`；G-R2-5 已关缺 snapshot unscoped；R2 wire 齐但 overall NOT closed。 |
| 2 | 是否同意 FOLLOW **仍不接线** full dispatch/recheck（P-PLANNER / P-R2 overall / P-FAKEPLAN）？ | **同意**。假造主叶 `RetrievalPlan` = 假绿；阻塞未解前 **正确不接线**。 |
| 3 | NHP-R4 六列是否够格且 ADV 未写成已关？ | **是**。NEG/FAULT/BOUND/ADV/PERF + LOAD（`NHP-RAG-LOAD-01`）均有旗；`NHP-R4-ADV-01` 仍 **gap/blocked**（wrong_track=0 NOT closed）；PERF/LOAD **blind**。 |
| 4 | 09-10 dual-pass 是否不得自动放行本 FOLLOW prove / 不得写成 R4 已关？ | **同意**。09-10 仅限当时 honesty PREREQ；G-R2-5 / R2 wire 双审亦 **≠** R4 关 / ≠ 本 FOLLOW 自动放行。 |
| 5 | 是否保持 R4 NOT closed；禁 wrong_track=0 / 题域已隔离 / full P-WIRE；`releaseEvidence=false`？ | **同意**。硬钉不变。硬闸文档已生效 **≠** 本刀 prove 笼统开跑。 |

## 生产接线核验（静态 · 无 prove）

| 项 | 结果 |
|----|------|
| `apps/worker/src` `dispatchTrackLocalRetrieval(` | **零**调用（仅注释禁令 + prove 负钉） |
| 合同 seam `packages/db/.../qbank-track-local-retrieval.ts` | **仍在**；≠ Worker 已消费 |
| G-R2-5 retrieve-side | CLOSED → **≠** R4 / 题域已隔离 |
| partial P-WIRE（主叶 scope） | 仍 partial；≠ wrong_track=0 |

## Nit（非阻塞）

§6b D2 / REQUEST 阻塞表仍写「P-LIVE pending dual」。双域 P-LIVE 收据已齐时，建议改为「**P-LIVE dual 收据齐；仍 ≠ 路由已生效**」（与矩阵已改口径一致）。**不**影响本 FOLLOW pass。

## 放行边界

- 本 pass = 文档 / 差距表 / NHP-R4 诚实门 **可进入**双审后专家子集复跑（见 harness §6b.4）。  
- **仍禁**实现方自跑绿关；eval 保持 `not_run:pre_dual_review` 直至双审齐。  
- 复跑 EXIT=0 读法：**≠** R4 关 · **≠** 题域已隔离 · **≠** full wire。

## 非宣称

禁止：R4 / 题域已隔离、wrong_track=0、full P-WIRE、生产 dispatch/recheck 已接线、G-R2-5= R4 关、09-10 自动放行、HA、`releaseEvidence=true`、covered、假造 RetrievalPlan。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md`
- HEAD：`639134f`
