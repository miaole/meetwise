# 评测证明 — R4 **wrong_track=0 ADV**（post_prove_dual_pass · ADV honesty only）

**日期**：2026-09-16（~19:22 PT）  
**run-status**：**`post_prove_dual_pass`（ADV honesty only）**  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **wire 绿 ≠ wrong_track=0 closed** · **ADV 绿 ≠ R4 已关** · **≠ 题域已隔离** · **LIVE_PG_GAP 仍开**  
**对照 harness**：`ai-docs/delivery/harness/r4-wrong-track-adv.md`  
**对照切片**：`ai-docs/delivery/r4-wrong-track-adv.slice.md`  
**对照父轨**：`harness/r4-domain-isolation.md` §6f · `r4-domain-isolation-status.md`  
**前序**：REAL-WIRE-IMPL `post_prove_dual_pass`（wire honesty only）；ADV pre-exec dual **PASS**；meetwise authorize coding+prove  
**双审**：post-prove **dual PASS（ADV honesty only）**；实现方禁止自批  
**reviews**：`reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-rag-route.md` · `reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-e2e-ha.md`  
**next**：LIVE_PG = `post_prove_dual_pass`（honesty only · §6g）；**LIVE_PG_GAP dual receipts landed（honesty）**；仍 ≠ covered

---

## 1. 本文件用途

交付「ADV wrong_track=0 实现+prove」的专家勾选材料（已 dual-close）。  
**禁止**：把 EXIT=0、wire 绿、或 dual pass 写成 covered / R4 关 / HA / full live Worker+PG ADV 已关。

---

## 2. 执行记录（实现方 · ~19:15 PT · 专家独立复跑 ~19:19 PT）

| CMD / 动作 | 期望 | 实测 | 读法 |
|------------|------|------|------|
| `pnpm r4-wrong-track-adv:prove` | EXIT=0 | **0**（专家独立复跑） | wired CALL_SITES=1；A1–A8 honesty；LIVE_PG_GAP；≠ covered；≠ R4 closed |
| domain assert hooks | 有 | `countWrongTrackHits` / `assertWrongTrackZero` / `R4_WRONG_TRACK_RECHECK_REASONS` | 生产可调用 |
| Worker enforce | 有 | `enforceWrongTrackZeroOnServed` / `mapRecheckFailedToRefs` | fail-closed |
| 实现方自签 pass | **禁** | **未做** | 专家独立写 reviews/ |

OK 行：`OK  r4-wrong-track-adv prove (wired path CALL_SITES=1; wrong_track assert; A3 surfaces unit+map; fail-closed; LIVE_PG_GAP honesty; ≠ covered; ≠ R4 closed; releaseEvidence=false)`

---

## 3. 条目 ↔ harness 映射（关闭 R4？一律否）

| ID | 评测点 | 关闭 R4？ |
|----|--------|-----------|
| E1 | A1 wired path CALL_SITES≥1 | 否 |
| E2 | A2 wrong_track assert hooks | 否 |
| E3 | A3 五类对抗面（unit+map；**LIVE_PG_GAP 仍开**） | 否 |
| E4 | A4 fail-closed / G-R2-5 / 禁 P-FAKEPLAN | 否 |
| E5 | A5 无 pgvector 假绿 sole | 否 |
| E6 | A6 wire ≠ ADV | 否 |
| E7 | A7 NHP-R4-ADV-01 **partial**/honesty-pin ≠ covered | 否 |
| E8 | A8 ADV 绿 ≠ R4 closed | 否 |
| E9 | `releaseEvidence=false` · Not HA · 禁 flip / DELETE | 否 |
| E10 | post-prove dual **pass（ADV honesty only）**；实现方不自批 | 否 |

---

## 4. 假绿标红（审查勾选）

- [x] 未把 REAL-WIRE / CALL_SITES 写成 ADV covered
- [x] 未把本刀 EXIT=0 / dual pass 写成 R4 关 / covered / HA
- [x] 未把 LIVE_PG dual honesty 写成 covered / R4 关（**dual receipts landed ≠ covered**）
- [x] 未把 rag04 旁证写成 Worker retrieveVia ADV covered
- [x] 未允许 P-FAKEPLAN / 削弱 G-R2-5 / 回退 unscoped
- [x] 未升格 NHP-R4 covered / `releaseEvidence=true`
- [x] 未由实现方自写 pass review

---

## 5. 专家已确认（摘要 · 见 dual reviews）

1. 独立复跑 `pnpm r4-wrong-track-adv:prove` → EXIT=0。  
2. A1–A4 诚实：wired path + wrong_track assert + A3 unit+map + fail-closed。  
3. LIVE_PG_GAP dual receipts landed（honesty）≠ covered ≠ R4 closed ≠ HA。  
4. NHP-R4-ADV-01 仅 **partial**/honesty-pin，**不得** covered。  
5. EXIT=0 / dual pass 仍钉 **≠ R4 closed / ≠ 题域已隔离**。  
6. `releaseEvidence=false`；禁 flip / open DELETE / HA。

详见：`2026-09-16-r4-wrong-track-adv-post-prove-mw-rag-route.md` · `2026-09-16-r4-wrong-track-adv-post-prove-mw-e2e-ha.md`。

---

*Eval · R4 wrong_track=0 ADV · 2026-09-16 ~19:45 PT · post_prove_dual_pass（ADV honesty only）· releaseEvidence=false · ≠HA · ≠ covered · LIVE_PG=post_prove_dual_pass（honesty only）*
