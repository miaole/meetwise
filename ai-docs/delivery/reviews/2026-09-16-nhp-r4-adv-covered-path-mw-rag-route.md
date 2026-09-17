# Review — NHP-R4-ADV-01 **covered path**（执行前验收门 · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~19:47 PT；本审只读 · **零 coding · 零 prove**）  
**结论**：**pass**（限：covered 路径定义门 docs/REQUEST 诚实够格；**partial ≠ covered**；**LIVE_PG dual ≠ 本刀完成**；本刀正确不 coding/prove）  
**硬钉**：**≠ R4 关** · **≠ 题域已隔离** · **≠ covered** · **LIVE_PG ADV `post_prove_dual_pass` ≠ this knife complete** · **releaseEvidence=false** · **≠HA** · **通过前禁 coding/prove**  
**配对**：mw-e2e-ha · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-nhp-r4-adv-covered-path-mw-rag-route.md`  
对照：`harness/nhp-r4-adv-covered-path.md` · `eval/nhp-r4-adv-covered-path.eval.md` · `nhp-r4-adv-covered-path.slice.md` · matrix **NHP-R4-ADV-01**（仍 **partial**/honesty-pin）· status §12 · 前序 ADV honesty / LIVE_PG dual（旁证 ≠ covered）

---

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 升 NHP-R4-ADV-01 → covered 是否需要本专用路径（eval→matrix→CMD），超出 honesty / LIVE_PG？ | **同意**。unit+map honesty 与 LIVE_PG Worker+PG dual 均止于 partial/honesty；covered 须显式 C1–C4 + matrix 钉 + 冻结 `pnpm nhp-r4-adv-covered:prove` + **本刀** dual 链。 |
| 2 | LIVE_PG ADV `post_prove_dual_pass` ≠ covered path done（RAG 视角）？ | **同意**。即便 LIVE_PG dual receipts 已落地（honesty），亦 **≠** 本 covered 刀完成 · **≠** matrix 升 covered。 |
| 3 | C3（G-R2-5 保留 / 禁 P-FAKEPLAN / 禁 unscoped·sibling·legacy_unrouted）须留在 covered 接受条件？ | **同意**。缺 snapshot/非法须 fail-closed retrieve；covered 不得弱化该钉。 |
| 4 | ≠ R4 closed / ≠ 题域已隔离 / ≠ production wrong_track=0 closed？ | **同意**。本刀即使日后 dual+prove+post-prove dual 全绿，亦 **不**关 R4 / **不**宣称题域已隔离 / **不**关生产 wrong_track=0。 |
| 5 | `not_run:pre_dual` · 无 prove · 无 coding · 禁自批 · `releaseEvidence=false`？ | **同意**。package.json **无** `nhp-r4-adv-covered:prove`（planned only）；本审零 prove/coding；实现方禁自写 pass。 |

### RAG / 题域焦点（补充）

| 点 | 裁定 |
|----|------|
| **covered vs partial** | **partial**/honesty-pin = ADV unit+map 与/或 LIVE_PG full-path 旁证已绿，但 **未**完成「本刀」eval→matrix→CMD 全闸。**covered** = 仅当本刀 pre-exec dual **pass** + authorize + prove + **post-prove dual** 后，matrix 才可 partial→covered。 |
| **false-green 禁** | 禁：ADV honesty dual→covered；LIVE_PG dual→covered；wire CALL_SITES=1→covered；提前升 matrix；宣称 R4/题域关；本 prep 跑 prove / 伪造 EXIT=0；实现方自批。 |
| **unit ADV vs LIVE_PG vs 本刀** | unit ADV = honesty pin；LIVE_PG = live Worker+PG 旁证（仍 ≠ covered）；本刀 = NHP covered 升格定义与后续 prove 闸。三者分层，不可坍缩。 |
| **harness honesty 是否够？** | **对本 pre-exec 文档门：够**。C-R1–C-R6 / E1–E8 / fake-green checklist 已钉清。**不够**声称 covered 已达成——那须本刀后续 dual+prove+post-prove dual（且仍 ≠ R4 关）。 |

---

## 批准范围

**批**：covered-path **定义门**（harness+eval+slice+REQUEST）；partial≠covered / LIVE_PG dual≠本刀完成 / ≠R4关 / ≠题域已隔离；零 coding/prove；C3 保留。

**不批**：covered 已达成、matrix 提前升 covered、R4 关、题域已隔离、production wrong_track=0 closed、把 LIVE_PG dual 写成 covered close、本 dual 自动 authorize coding/prove、HA、`releaseEvidence=true`、实现方自批。

---

## 仍开

- NHP-R4-ADV-01 **仍 partial**/honesty-pin；**covered knife opened but not complete**
- 本刀链：pre-exec dual（本审为 rag 侧）→ authorize → 实现 CMD/prove → **post-prove dual**（均未完成）
- planned CMD `pnpm nhp-r4-adv-covered:prove` = **`not_run:pre_dual`**（未实现）
- R4 / 题域隔离 **NOT closed**
- LIVE_PG dual（honesty）**≠** 本 covered 完成（旁证保留，不升格）

---

## 非宣称

禁止：R4 closed、题域已隔离、covered complete、LIVE_PG dual = 本刀完成、HA、`releaseEvidence=true`、本 prep 已 prove/coding、实现方自批、companion NEG/FAULT/BOUND 因本刀自动升 covered。

---

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-nhp-r4-adv-covered-path-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-nhp-r4-adv-covered-path-mw-rag-route.md`
- 对照：harness/eval/slice · matrix NHP-R4-ADV-01（partial）· status §12
- LIVE_PG 旁证：`post_prove_dual_pass`（honesty）· **≠ covered**
- HEAD：`639134f`
- **零 prove · 零 coding · releaseEvidence=false · ≠HA**

---

*Review · mw-rag-route · NHP-R4-ADV covered path pre-exec · 2026-09-16 ~19:47 PT · pass（docs gate only）· ≠ covered · R4 open*
