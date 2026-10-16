# REQUEST — R4 **P-PLANNER** **post-prove**（e2e / HA 边界）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~08:00 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ full P-WIRE** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**配对**：`REQUEST-2026-09-16-r4-p-planner-post-prove-mw-rag-route.md`（双域对抗；冲突以阻塞项为准）  
**硬闸**：`north-star-hard-gates.md` 已生效 · pre-exec dual pass · meetwise authorize coding+prove  
**前序 pre-exec dual（已 pass）**：`2026-09-16-r4-p-planner-mw-{rag-route,e2e-ha}.md`  
**本刀**：P-PLANNER 实现 + unit prove EXIT=0；**实现方不写** pass review；请专家独立复跑并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `harness/r4-p-planner.md` · `eval/r4-p-planner.eval.md` · `r4-p-planner.slice.md` | 本刀 |
| `harness/r4-domain-isolation-status.md` | **题域隔离 NOT closed** |
| Worker retrieve | **仍** primary-leaf + G-R2-5；helper **未接线** |
| dispatch | **仍零** Worker 消费 |

---

## 切片立场（e2e-ha 域）

本刀 **不是** HA / cutover / flip default / open DELETE。  
unit EXIT=0 **仅**证明 planner→RetrievalPlan 组装合同；**不**证明端到端隔离、多实例 HA、或 wrong_track=0 生产。  
REAL-WIRE / ADV 另刀。本 REQUEST **不是** pass。

---

## Post-prove CMD+EXIT（实现方 · ~08:00 PT）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm r4-p-planner-unit:prove` | **0** | ≠ HA；≠ R4 关；≠ wrong_track=0 |
| `pnpm g4-dispatch-recheck-prereq:prove`（旁证） | **0** | 仍零 dispatch |

**未跑（禁）**：`e2e:isolated` · HA dual · flip default · open DELETE · R4 ADV wrong_track=0 关闸。

---

## 请专家回答

1. 请 **独立复跑** `pnpm r4-p-planner-unit:prove`，附 CMD+EXIT（可与 rag-route 交叉核对）。  
2. 是否同意：本绿 **≠HA** / **≠ cutover** / **≠ flip default** / **≠ open DELETE**？  
3. 是否同意：**R4 仍 NOT closed**；dispatch **仍未接线**；retrieve **仍**主叶？  
4. status/eval 是否错误抬升为 covered / HA / `releaseEvidence=true`？（期望：**否**）  
5. 是否同意：follow-on REAL-WIRE 仍须另刀 + wrong_track=0 单独，且 **接线绿 ≠ R4 关**？

请将结论写入 `reviews/`（例如 `2026-09-16-r4-p-planner-post-prove-mw-e2e-ha.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 HA / covered / `releaseEvidence=true` / R4 closed / wrong_track=0 / full P-WIRE。  
- **await post-prove dual**。  

---

*REQUEST · mw-e2e-ha · R4 P-PLANNER post-prove · 2026-09-16 ~08:00 PT · releaseEvidence=false · ≠HA · ≠ R4 closed*
