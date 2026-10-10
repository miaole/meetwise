# 评测证明 — R4 **wrong_track=0 ADV · LIVE_PG**（post_prove_dual_pass · honesty only）

**日期**：2026-09-16（~19:45 PT）  
**run-status**：**`post_prove_dual_pass`（honesty only）**  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ R4 已关** · **≠ 题域已隔离** · **unit ADV ≠ LIVE_PG covered** · **LIVE_PG_GAP dual receipts landed（honesty）· 仍 ≠ R4 closed ≠ covered ≠ HA** · **sole 未翻** · **R5/pgvector-legacy honesty 保留**  
**对照 harness**：`ai-docs/delivery/harness/r4-wrong-track-adv-live-pg.md`  
**对照切片**：`ai-docs/delivery/r4-wrong-track-adv-live-pg.slice.md`  
**对照父轨**：`harness/r4-domain-isolation.md` §6g · `r4-domain-isolation-status.md` §11  
**前序**：ADV `post_prove_dual_pass`（ADV honesty only）；LIVE_PG pre-exec dual PASS；meetwise authorize coding+prove  
**双审**：pre-exec **pass**；post-prove **dual pass（honesty only）** — `reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-rag-route.md` + `reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-e2e-ha.md`；实现方禁止自批

---

## 1. 本文件用途

交付「LIVE_PG full-path ADV」实现+prove 的专家勾选材料；现已 **post_prove_dual_pass（honesty only）**。  
**禁止**：把 EXIT=0 / dual honesty / 前序 ADV 写成 covered / R4 关 / HA。

---

## 2. 执行记录（本刀）

| CMD / 动作 | 期望 | 实测 | 读法 |
|------------|------|------|------|
| `pnpm r4-wrong-track-adv-live-pg:prove` | 0（真 PG）或 ≠0+LIVE_PG_GAP | **EXIT=0**（真击中 isolated PG） | live retrieveVia；≠ covered；≠ R4 关；dual receipts landed（honesty） |
| `pnpm r4-wrong-track-adv-live-pg:prove:raw`（无 PG） | EXIT≠0 · LIVE_PG_GAP | **EXIT=1** | skip≠pass；禁 in-memory 假绿 |
| 实现方自签 pass | **禁** | **未做** | 专家独立写 reviews/ |

旁证（**≠** 本刀）：`pnpm r4-wrong-track-adv:prove` EXIT=0 = unit+map ADV honesty only。

### 2.1 实现方实测（填入 prove 后）

| CMD | EXIT | 尾注 |
|-----|------|------|
| `pnpm r4-wrong-track-adv-live-pg:prove` | **0** | isolated PG (`E2E_ISOLATED=1` · pgvector-legacy fixture · host 127.0.0.1) · `retrieveViaDispatchTrackLocal` · L1–L8 PASS · honesty: LIVE_PG_GAP dual receipts landed · ≠ covered · ≠ R4 closed · R5 green-risk retained · ~19:37 PT |
| `pnpm r4-wrong-track-adv-live-pg:prove:raw`（no-PG） | **1** | fail-closed LIVE_PG_GAP · skip≠pass · ~专家复跑 |

---

## 3. 条目 ↔ harness 映射（关闭 R4？一律否）

| ID | 评测点 | 关闭 R4？ |
|----|--------|-----------|
| E1 | L1 live wired path（真 PG · retrieveVia） | 否 |
| E2 | L2 wrong_track=0 live 可观测 | 否 |
| E3 | L3 A3 对抗面 live | 否 |
| E4 | L4 fail-closed / G-R2-5 / 禁 P-FAKEPLAN | 否 |
| E5 | L5 禁 rag04 / pgvector 冒充 LIVE_PG covered | 否 |
| E6 | L6 unit ADV ≠ LIVE_PG closed | 否 |
| E7 | L7 NHP-R4-ADV-01 仍 partial ≠ covered | 否 |
| E8 | L8 LIVE_PG 绿 ≠ R4 closed | 否 |
| E9 | `releaseEvidence=false` · Not HA · 禁 flip / DELETE | 否 |
| E10 | run-status=`post_prove_dual_pass`（honesty only）；不自批；≠ covered | 否 |

---

## 4. 假绿标红（审查勾选）

- [x] 未把 unit ADV / 本 EXIT=0 / dual honesty 写成 covered / R4 关 / HA
- [ ] 未把 rag04 旁证写成 Worker retrieveVia LIVE_PG covered
- [ ] 未允许 P-FAKEPLAN / 削弱 G-R2-5 / 回退 unscoped
- [ ] 未升格 NHP-R4 covered / `releaseEvidence=true`
- [ ] 未由实现方自写 pass review
- [ ] 未宣称 R4 closed
- [ ] 无 PG 时未假绿（EXIT≠0 / LIVE_PG_GAP）

---

## 5. 专家请确认（摘要 · post-prove）

1. 请 **独立复跑** `pnpm r4-wrong-track-adv-live-pg:prove`，附 CMD+EXIT。  
2. L1–L4 是否诚实成立（真 PG · retrieveVia · A3 live · fail-closed）？  
3. LIVE_PG_GAP 是否仍钉 **开**直至 dual（EXIT=0 ≠ gap dual-closed）？  
4. NHP-R4-ADV-01 是否仅可 **partial**/honesty-pin，**不得** covered？  
5. EXIT=0 是否仍钉 **≠ R4 closed / ≠ 题域已隔离 / ≠ HA**？  
6. unit ADV ≠ 本刀？  
7. 实现方是否错误自批？（期望：**否**）

收据：`reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-rag-route.md`（pass）· `reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-e2e-ha.md`（pass）。

---

*Eval · R4 wrong_track ADV LIVE_PG · 2026-09-16 ~19:45 PT · post_prove_dual_pass（honesty only）· releaseEvidence=false · ≠HA · ≠ covered · ≠ R4 closed · LIVE_PG_GAP dual receipts landed（honesty）· sole 未翻 · R5/pgvector-legacy honesty retained*
