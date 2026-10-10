# Review — R4 / G4 REAL-WIRE（执行前 inventory · 第二域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限：§6c inventory 诚实 + **本刀正确不接线** + 有条件接线规则；**≠ 批 coding** · **≠ R4 已关** · **≠ full P-WIRE** · **≠ 题域已隔离** · **≠ wrong_track=0**）  
**releaseEvidence=false** · Not HA · **本审未改代码、未跑 prove**

覆盖 REQUEST：`REQUEST-2026-09-16-r4-real-wire-mw-rag-route.md`  
对照：`harness/r4-domain-isolation.md` §6c · status §7 · eval §7 · case-matrix §1.5

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | W1–W6 是否诚实描述最小生产路径？ | **是**。含 per-turn planner → 完整 `RetrievalPlan`（必含 generationId/recipeId）→ `dispatchTrackLocalRetrieval` → recheck → Worker 消费；`recheck_failed`/缺 snapshot fail-closed；与 domain/db 合同一致。现状钉「未实施 / Worker 零调用」正确。 |
| 2 | 是否同意产品风险高 → **本刀正确不接线**？ | **同意**。**P-PLANNER**（主挡）+ **P-FAKEPLAN**（主叶硬塞 plan = 假绿）未解前，coding 会逼出假接线。批准范围仅 inventory + 不接线 + await PREREQ。 |
| 3 | FOLLOW post-prove dual 是否不得自动批准 coding / 不得写 R4 关？ | **同意**。FOLLOW 仅 honesty / 仍不接线；REAL-WIRE 须本 REQUEST 新批。 |
| 4 | NHP-R4 六列是否不得升 covered；ADV 仍 gap/blocked？ | **是**。§6c.4 相对 FOLLOW **无升格**；`NHP-R4-ADV-01` 仍 gap/blocked。 |
| 5 | 若将来有条件真接线，最低条件？ | **必须**（见下节）。且 **接线绿 ≠ R4 关**。 |
| 6 | 保持 R4 NOT closed；`releaseEvidence=false`；禁 flip/DELETE/HA？ | **同意**。 |

## 接线裁定（本刀）

| 选项 | 裁定 |
|------|------|
| 继续不接线 | **是（本刀批准）** |
| 有条件现在接线 | **否** — P-PLANNER 未落地前禁止 |
| 批 R4 / full P-WIRE 关闸 | **否** |

### 将来有条件接线规则（非本刀授权 coding）

仅当下列 **全部**满足后，才可开 **新** REQUEST 谈 coding（仍须双审；仍 ≠ 自动关 R4）：

1. **真** per-turn `InterviewPlannerOutput`（经 `validatePlannerOutput` 相对 snapshot），**禁止**主叶硬塞（P-FAKEPLAN）  
2. 组装完整 `RetrievalPlan`：含 **generationId** + **recipeId** + snapshot/digest/leaf/taxonomy/competency/difficulty/policyVersion  
3. Worker 唯一消费 `dispatchTrackLocalRetrieval`；处理 `served` / `recheck_failed` / `rejected` / `replayed`  
4. **保留** G-R2-5：缺 snapshot / `recheck_failed` **不**回退 unscoped / 兄弟叶 / legacy_unrouted  
5. **单独** wrong_track=0 prove（NHP-R4-ADV）；调用点绿 ≠ ADV 关 ≠ R4 关  
6. 并列 PREREQ 诚实：P-R2 overall / P-R1 / P-META 仍按 m4 §R4 关闸表，不得叙事绕过  
7. **禁** flip default / open DELETE / HA / `releaseEvidence=true` / 实现方自批

## 静态旁证（无 prove）

- `apps/worker/src`：**零** `dispatchTrackLocalRetrieval(`  
- `InterviewPlannerOutput` / `validatePlannerOutput` 在 domain；Worker **无** per-turn→retrieve 路径  
- 合同 seam 仍在 `packages/db`；≠ 已生产消费

## 非宣称

禁止：本刀 coding、REAL-WIRE 已齐、R4 / 题域已隔离、wrong_track=0、full P-WIRE、FOLLOW 自动批准接线、HA、`releaseEvidence=true`、covered、P-FAKEPLAN、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-r4-real-wire-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-r4-real-wire-mw-rag-route.md`
- HEAD：`639134f`
