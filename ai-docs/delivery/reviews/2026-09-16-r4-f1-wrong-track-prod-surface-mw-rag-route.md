# Review — Knife **F1** · wrong_track **production-surface remaining**（执行前验收门 · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~23:14 PT；本审只读 · **零 coding · 零 prove**）  
**结论**：**pass**（限：F1 harness/slice/REQUEST 文档门诚实够格；**LIVE_PG dual ≠ prod closed**；**NHP covered dual ≠ 本刀完成**；本刀正确不 coding/prove）  
**硬钉**：**≠ R4 关** · **≠ 题域已隔离** · **LIVE_PG dual ≠ prod closed** · **NHP covered dual ≠ 本刀完成** · **releaseEvidence=false** · **≠HA** · **通过前禁 coding/prove**  
**配对**：mw-e2e-ha · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-r4-f1-wrong-track-prod-surface-mw-rag-route.md`  
对照：`harness/r4-f1-wrong-track-prod-surface.md` · `r4-f1-wrong-track-prod-surface.slice.md` · status §11–§13 · `harness/r4-wrong-track-adv-live-pg.md`（honesty only）· `harness/nhp-r4-adv-covered-path.md`（NHP-R4-ADV-01 covered · THIS case only）· `m4-rag-hard-gates.md` §R4

---

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | harness A1–A6 / PS1–PS3 是否诚实：production-surface remaining，且 **不能**被 LIVE_PG honesty 或 NHP covered dual 宣称覆盖？ | **同意**。PS1–PS3 正确钉「生产读面 remaining」：跨域泄漏于非 covered adversary/deploy 形、可观测/fail-closed 逃逸、以及 wrong_track=0 ≠ R4 关。A1–A6 均为 draft / `not_run:pre_dual`，未把既有 dual 写成 prod closed。 |
| 2 | 是否同意：本刀无 coding / 无 prove，仅 harness + slice + REQUEST？ | **同意**。package.json **无** `r4-wrong-track-prod-surface:prove`；**无**对应 proof 文件；CMD = **`not_run:pre_dual` · not implemented**。本审零 coding / 零 prove。 |
| 3 | 是否同意：LIVE_PG dual ≠ prod closed · NHP covered dual ≠ this knife？ | **同意**。LIVE_PG = `post_prove_dual_pass`（**honesty only**）· **≠** production wrong_track=0 closed。NHP covered = `post_prove_dual_pass` · matrix **NHP-R4-ADV-01 covered（THIS case only）** · **≠** F1 完成 · **≠** production wrong_track=0 closed。 |
| 4 | 是否同意：R4 仍 NOT closed；禁宣称 R4 closed / 题域已隔离？ | **同意**。m4 §R4 / status 硬句仍挡；F1 即使日后 dual+prove 全绿亦 **不**关 R4 / **不**宣称题域已隔离。 |
| 5 | 是否同意：coding gate = after MAIN + NHP-ADV covered post-prove dual · 本 REQUEST dual pass **本身不**授权 coding？ | **同意**。status §13：NHP-ADV covered **已** dual-closed；coding **仍** blocked on **MAIN sole∩scor-00** post-prove dual · then **separate authorize**。本 pre-exec dual pass **≠** authorize coding/prove。 |
| 6 | 是否同意：保持 `releaseEvidence=false`；禁 flip default / open DELETE / HA？ | **同意**。`releaseEvidence=false` · ≠HA · sole allowlist 未翻 · 禁 flip default / open DELETE · 禁实现方自批。 |

### RAG / 生产面焦点（补充）

| 点 | 裁定 |
|----|------|
| **F1 相对 LIVE_PG 新增什么** | LIVE_PG 关的是 A3 **LIVE_PG_GAP** 的 live Worker+PG **honesty** 旁证面。F1 钉的是 **production-path remaining**：部署形/非 covered adversary 下 retrieve 面仍可能跨域泄漏（PS1）、可观测与 fail-closed 在 metadata/track flip/cache replay 逃逸 covered 集时仍须诚实（PS2）。**不得**把 LIVE_PG EXIT=0 / dual pass 写成 prod wrong_track=0 closed。 |
| **F1 相对 NHP covered 新增什么** | NHP covered 只升 **NHP-R4-ADV-01（THIS case）** partial→covered；companions **不**自动升。F1 是 follow **production-surface remaining** 刀，**≠** 再跑 covered elevate，**≠** 把 covered dual 写成本刀完成。 |
| **分层（不可坍缩）** | unit ADV honesty → LIVE_PG honesty → NHP-R4-ADV-01 covered（THIS case）→ **F1 production-surface remaining** →（仍开）P-R1 / P-R2 / P-META / P-FIX · **R4 NOT closed**。任一层绿 ≠ 上层关闭。 |
| **false-green 禁** | 禁：LIVE_PG dual→prod closed；NHP covered dual→F1 done / prod wrong_track=0 closed；ADV unit→prod；wire CALL_SITES=1→wrong_track=0 prod；提前宣称 R4/题域已隔离；本 prep 跑 prove / 伪造 EXIT=0；实现方自批；companion NEG/FAULT/BOUND 因本 REQUEST 自动升 covered；本 dual pass 自动 authorize coding。 |
| **G-R2-5 / P-FAKEPLAN** | **保留**。缺 snapshot/非法须 fail-closed retrieve；禁 P-FAKEPLAN；禁 unscoped / sibling / legacy_unrouted。 |
| **文档微漂移（非挡）** | REQUEST/slice 个别处仍写 NHP「in flight」；status §12 + harness 已钉 NHP covered = `post_prove_dual_pass`。**无论读法**，硬钉成立：**NHP covered dual ≠ 本刀**。建议后续 docs 对齐措辞，**不**构成 pre-exec 挡板。 |

---

## 批准范围

**批**：F1 **docs/REQUEST 门**（harness A1–A6 · PS1–PS3 · slice · REQUEST pair）；LIVE_PG dual ≠ prod closed；NHP covered dual ≠ 本刀；≠R4关 / ≠题域已隔离；零 coding/prove；coding gate 仍钉 MAIN sole∩scor-00；`releaseEvidence=false` · ≠HA。

**不批**：production wrong_track=0 closed、R4 关、题域已隔离、把 LIVE_PG/NHP dual 写成 F1/prod close、本 dual 自动 authorize coding/prove、HA、`releaseEvidence=true`、实现方自批、flip default / open DELETE、companion 自动升 covered。

---

## 仍开

- F1 CMD `pnpm r4-wrong-track-prod-surface:prove` = **`not_run:pre_dual`**（未实现）
- coding **仍 gated** on MAIN sole∩scor-00 post-prove dual · then separate authorize
- production wrong_track=0 **未关**；R4 / 题域隔离 **NOT closed**
- P-R1 / P-R2 / P-META / P-FIX 仍开；F2 另刀（F1 may precede F2 · 均 ≠ R4 关）
- LIVE_PG honesty · NHP-R4-ADV-01 covered（THIS case）均为旁证/升格层 · **≠** F1 完成

---

## 非宣称

禁止：R4 closed、题域已隔离、production wrong_track=0 closed、LIVE_PG dual = prod closed、NHP covered dual = 本刀完成、HA、`releaseEvidence=true`、本 prep 已 prove/coding、实现方自批、sole allowlist 已翻、flip default / open DELETE。

---

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-r4-f1-wrong-track-prod-surface-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-r4-f1-wrong-track-prod-surface-mw-rag-route.md`
- 对照：harness/slice · status §11–§13 · LIVE_PG honesty · NHP covered（THIS case）· m4 §R4
- HEAD：`639134f`
- **零 prove · 零 coding · releaseEvidence=false · ≠HA · ≠R4关 · ≠题域已隔离**
- blockers：**无**（本 pre-exec 文档门）；coding/prove **仍禁**直至 MAIN sole∩scor-00 post-prove dual + separate authorize

---

*Review · mw-rag-route · F1 wrong_track prod-surface pre-exec · 2026-09-16 ~23:14 PT · pass（docs gate only）· LIVE_PG/NHP ≠ 本刀 · R4 open · zero prove*
