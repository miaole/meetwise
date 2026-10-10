# REQUEST — G4/R4 dispatch-recheck FOLLOW **post-prove** → mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT · ~04:47 post-prove）  
**releaseEvidence=false** · Not HA · **pass ≠ R4 已关** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ full P-WIRE** · **≠ sole cutover**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 非happy prove 笼统开跑  
**配对**：`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md`  
**前序 pre-exec dual（已 pass · ≠ R4 关）**：`2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md` · `2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md`

---

## 对照

| 文件 | 角色 |
|------|------|
| `harness/r4-domain-isolation.md` §6b | FOLLOW；§6b.4 实测 EXIT |
| `harness/r4-domain-isolation-status.md` §6 / §6.1 | post-prove 表 + await post-prove dual |
| `eval/r4-domain-isolation.eval.md` §6.3 | CMD+EXIT 收据 |
| `.tmp/r4-follow-post-prove-20260916/` | 原始 log / `.exit` |
| `apps/worker/src` | **仍零** `dispatchTrackLocalRetrieval(` |

---

## 实现方立场（本刀）

1. **未接线** production `dispatchTrackLocalRetrieval` / recheck / per-turn planner。  
2. pre-exec dual 授权后，跑 honesty subset（下表）；**EXIT=0 仅诚实钉**。  
3. **R4 仍开**；产品阻塞仍挡 full wire：P-PLANNER · P-R2 overall · P-FAKEPLAN · P-WT0。  
4. 本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · HEAD `639134f` · ~04:46–04:47 PT）

| CMD | EXIT | 读法（请专家复核） |
|-----|------|-------------------|
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | ≠ full wire · ≠ R4 关 |
| `pnpm g4-production-scoped-retrieve:prove` | **0** | partial ≠ wrong_track=0 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | ≠ R2/R4 关 |
| `pnpm r2-classify-job-route-prereq:prove` | **0** | R2 overall NOT closed · ≠ 路由已生效 |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | ≠ 题域已隔离 |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R4 NOT closed |

---

## 请专家回答

1. 上表 EXIT=0 是否仅可作 honesty 收据，且 **不得**写成 R4 / 题域已隔离 / wrong_track=0 / full P-WIRE？  
2. Worker 是否仍正确 **不接线** `dispatchTrackLocalRetrieval` / planner→`RetrievalPlan`？  
3. pre-exec dual-pass 是否 **不得**自动升格为 R4 关 / FOLLOW 关闸完成？  
4. 是否同意：**保持 R4 NOT closed**；`releaseEvidence=false`；禁假绿 covered/HA？  
5. NHP-R4-ADV-01 / wrong_track=0 是否仍 gap/blocked（本绿未关）？

（或：专家可自行复跑同子集并附 CMD+EXIT。）

---

## 非宣称

- 不宣称 R4 closed / 题域已隔离 / wrong_track=0 / full wire / 生产 dispatch·recheck 已齐  
- 不宣称 HA / `releaseEvidence=true` / sole cutover / flip default / covered  
- 不把 pre-exec dual 或本绿写成关闸完成  
- **await post-prove dual**（或专家复跑收据）

---

*REQUEST · mw-rag-route · R4 FOLLOW post-prove · 2026-09-16 PT · releaseEvidence=false · ≠HA*
