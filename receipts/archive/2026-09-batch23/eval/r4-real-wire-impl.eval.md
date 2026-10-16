# 评测证明 — R4 **REAL-WIRE-IMPL**（post_prove_dual_pass · wire honesty only）

**日期**：2026-09-16（~19:05 PT）  
**run-status**：**`post_prove_dual_pass`（wire honesty only）**  
**CALL_SITES=1** · **releaseEvidence=false** · **Not HA** · **≠ covered** · **wire 绿 ≠ R4 已关** · **≠ 题域已隔离** · **≠ wrong_track=0** · **next=LIVE_PG await dual（ADV honesty dual-closed）**  
**对照 harness**：`ai-docs/delivery/harness/r4-real-wire-impl.md`  
**对照切片**：`ai-docs/delivery/r4-real-wire-impl.slice.md`  
**对照父轨**：`harness/r4-domain-isolation.md` §6c / §6e · `r4-domain-isolation-status.md`  
**前序**：pre-exec dual **pass** · meetwise authorize coding+prove  
**双审**：post-prove **dual pass（wire honesty only）**；实现方禁止自批
**reviews**：`ai-docs/delivery/reviews/2026-09-16-r4-real-wire-impl-post-prove-mw-e2e-ha.md` · `ai-docs/delivery/reviews/2026-09-16-r4-real-wire-impl-post-prove-mw-rag-route.md`

---

## 1. 本文件用途

交付「REAL-WIRE-IMPL 接线实现 + prove」的专家勾选材料。  
**禁止**：把 EXIT=0 写成 R4 关、wrong_track=0、或 HA。

---

## 2. 执行记录（实现方）

| CMD / 动作 | 期望 | 实测 EXIT | 读法 |
|------------|------|-----------|------|
| `pnpm r4-real-wire-impl:prove` | **0** | **0** | CALL_SITES=1；fail-closed；≠ R4 关 |
| `pnpm r4-p-planner-unit:prove` | **0** | **0** | unit 合同仍绿 |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | **0** | FLIPPED CALL_SITES=1；≠ R4 关 |
| 实现方自签 post-prove pass | **禁** | **未做** | 专家独立写 reviews/ |

---

## 3. 条目 ↔ harness 映射（关闭 R4？一律否）

| ID | 评测点 | 关闭 R4？ |
|----|--------|-----------|
| E1 | planner → validate → assemble（generationId/recipeId）→ dispatch → recheck | 否 |
| E2 | **P-FAKEPLAN 禁止** | 否 |
| E3 | **G-R2-5 保留** | 否 |
| E4 | `recheck_failed` **fail-closed** | 否 |
| E5 | **接线绿 ≠ R4 closed ≠ wrong_track=0** | 否 |
| E6 | CALL_SITES=1 in `apps/worker/src` | 否 |
| E7 | NHP-R4 六列 **不升格 covered**；ADV 仍 gap | 否 |
| E8 | `releaseEvidence=false` · Not HA · 禁 flip / open DELETE | 否 |
| E9 | post-prove dual **pass（wire honesty only）**；实现方不自批 | 否 |
| E10 | P-PLANNER unit 仍 EXIT=0 | 否 |

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 CALL_SITES≥1 / prove 绿写成 **R4 / 题域已隔离 / wrong_track=0**
- [ ] 未允许 P-FAKEPLAN / 削弱 G-R2-5 / recheck 回退 unscoped
- [ ] 未升格 NHP-R4 covered / HA / `releaseEvidence=true`
- [ ] 未由实现方自写 pass review

---

## 5. 专家请确认（摘要）

1. 请 **独立复跑** `pnpm r4-real-wire-impl:prove`（及旁证 unit / flipped g4），附 CMD+EXIT。  
2. CALL_SITES≥1 是否成立且路径为 planner→assemble→dispatch（非 P-FAKEPLAN）？  
3. `recheck_failed` / G-R2-5 fail-closed 是否仍成立？  
4. EXIT=0 是否仍钉 **≠ R4 closed / ≠ wrong_track=0**？  
5. 是否同意 LIVE_PG_GAP / covered / R4 仍为剩余缺口？

详见双 post-prove reviews。

---

*Eval · R4 REAL-WIRE-IMPL · 2026-09-16 ~19:10 PT · post_prove_dual_pass（wire honesty only）· CALL_SITES=1 · releaseEvidence=false · ≠HA · ≠ R4 closed · next=LIVE_PG await dual（ADV honesty dual-closed）*
