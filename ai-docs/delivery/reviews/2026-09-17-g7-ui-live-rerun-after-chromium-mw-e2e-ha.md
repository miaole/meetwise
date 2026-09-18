# 审查归档 — G7 · **UI Live re-run after chromium** · 执行前文档闸 · mw-e2e-ha

**日期**：2026-09-17 ~00:09 PT  
**审稿人**：`mw-e2e-ha`（对抗独立审 · 执行前文档闸；**实现方自批无效 / 拒绝**；本审 **零 Live · 零 coding · 零 install · 零 invent Key · 零 commit · 零 HA**）  
**送审**：`reviews/REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-mw-e2e-ha.md`  
**对照（全文只读）**：
- `harness/g7-ui-live-rerun-after-chromium.md`（本刀 canonical · UI-A–D · M1–M7 · CMD=`pnpm e2e:ui:isolated` only）
- `g7-ui-live-rerun-after-chromium.slice.md`
- `eval/g7-ui-live-rerun-after-chromium.eval.md`（`REQUEST-ready / not_run:pre_dual`）
- `harness/g7-chromium-ui-runner-prereq.md`（**`post_prove_dual_pass`** · version/smoke 0/0/0 · Live **`not_run:this_knife`** · **chromium prereq ≠ UI green**）
- `reviews/2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-e2e-ha.md`（CR post-prove **pass**）
- `harness/g7-key-live-x3.md` §2（A′ **`post_prove_dual_pass:honesty_red_key_set`** · UI EXIT=**1** chromium miss · Key set · **retained**）
- `harness/g6-e2e-iso-blocked.md`（G6 still **OPEN**）
- R5 / sole：`harness/r5-retirement-sole-stack-status.md`（sole allowlist **恰 5** · default **pgvector-legacy** · R5 **SEPARATE**）
- Spot（只读）：`package.json` `"e2e:ui:isolated": "node scripts/run-e2e-isolated.mjs e2e:ui"` · loader path exists（**未** source · **未**读 `.env*` · **未**跑 Live）
**配对**：`REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-mw-rag-route.md`（**须独立签**；冲突取更严；**本审不代签 / 不等待**）  
**结论**：**pass**（**仅** 执行前文档闸）  
**批准范围**：**仅**同意本刀 harness/slice/eval/双 REQUEST 够格定义 **UI Live re-run after chromium**（`pnpm e2e:ui:isolated` only · Key loader path · ≠ full trio · ≠ CR reinstall）· 硬钉 **chromium prereq ≠ UI green · Key set ≠ UI green · A′ honesty_red retained · R5 SEPARATE · sole 恰 5 · Ban fake green · `releaseEvidence=false` · no invent Key · ≠ suite/G6/R5/UI/HA green** · **no** `mw-model-op` · Live **`not_run:pre_dual`** until **dual PASS + separate meetwise execute authorize** · 本审 **≠** Live/coding authorize · **≠** 本刀 done  
**不批**：suite green · G6 closed · R5 closed/retired · UI green · family green · HA · `releaseEvidence=true` · 本审 = 授权 Live `e2e:ui:isolated` · 实现方自批 · invent Key · 把 CR `post_prove_dual_pass` 写成 UI green · 改写 A′ honesty_red 为绿 · sole cutover / G1 flip · full Key×3 trio  
**硬钉**：`releaseEvidence=false` · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **chromium prereq ≠ UI green** · **Key set ≠ UI green** · **install/start ≠ suite/G6/R5/UI green** · **A′ honesty_red retained** · **R5 SEPARATE** · **sole 恰 5** · Live **`not_run:pre_dual` · not authorized** · **本审零 Live · 零 coding · 零 invent Key** · **拒绝自批** · **须配对 `mw-rag-route` 独立** · execute needs **dual PASS + separate authorize**

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **执行前文档闸 only** — NOT Live · NOT coding · NOT install · NOT suite green · NOT G6 closed · NOT R5 closed · NOT UI green · NOT HA · NOT this knife done · NOT execute authorize |
| 实现方自批 / REQUEST 预写 | **无效 / 拒绝**；本审独立裁定 |
| Knife / CMD | **`REQUEST-ready / not_run:pre_dual`**；Exact CMD = **`pnpm e2e:ui:isolated` only**；**未**跑 Live |
| Prior CR | **`post_prove_dual_pass`** · runner-prereq honesty only · **≠** UI green |
| A′ prior | **`post_prove_dual_pass:honesty_red_key_set`** · UI EXIT=1 chromium miss · Key set · **retained** · **not** rewritten green |
| Live / Key inject | **仍 blocked** — pre-exec dual pass **后**仍须 **separate authorize**；本审 **≠** authorize |
| Experts | `mw-e2e-ha` + `mw-rag-route` only · **no** `mw-model-op` |
| G6 / R5 / suite / UI | **仍 OPEN / 未绿** · R5 = **SEPARATE** · sole **恰 5** |
| `releaseEvidence` | **false** |
| HA | **≠HA** |
| 阻塞（本域文档闸） | **无阻塞**（见 §5；配对域独立；Live 仍 gated） |

---

## 1. 已读 / 对照（只读 · 零 Live · 零 invent Key）

| 角色 | 路径 | 观察 |
|------|------|------|
| REQUEST（本域） | `REQUEST-…-mw-e2e-ha.md` | Q1–Q5 清晰；硬钉完整；禁自批；Live gated；R5 SEPARATE；chromium ≠ UI green；A′ retained |
| Harness | `harness/g7-ui-live-rerun-after-chromium.md` | §0–§6：UI-A–D · M1–M7 · CMD only `e2e:ui:isolated` · Key loader · Ban fake green · gate dual⇒authorize⇒execute⇒post-prove |
| Slice | `g7-ui-live-rerun-after-chromium.slice.md` | products 齐；Exact CMD 冻；硬钉齐；zero Live this prep |
| Eval | `eval/g7-ui-live-rerun-after-chromium.eval.md` | E1–E7 · fake-green checklist · Live **`not_run:pre_dual`** |
| CR harness | `g7-chromium-ui-runner-prereq.md` | **`post_prove_dual_pass`** · Live deferred · next = this knife |
| CR post-prove | `2026-09-17-…-post-prove-mw-e2e-ha.md` | **pass** · 0/0/0 · Live `not_run:this_knife` · A′ retained |
| A′ | `g7-key-live-x3.md` §2 | EXIT=**1** · chromium miss · Key set · honesty_red **retained** |
| G6 | `g6-e2e-iso-blocked.md` | G6 still **OPEN** |
| R5 / sole | `r5-retirement-sole-stack-status.md` + `SOLE_WIRING_ALLOWLIST` | sole **恰 5** · default pgvector-legacy · R5 **SEPARATE** |
| Pair REQUEST | `REQUEST-…-mw-rag-route.md` | 已备；本审 **不代签** |

### 1.1 Spot（只读 · 不跑 Live / 不 source Key）

| 点 | 观察 | 读法 |
|----|------|------|
| Exact CMD | `package.json` → `"e2e:ui:isolated": "node scripts/run-e2e-isolated.mjs e2e:ui"` | **冻** · ≠ `e2e:isolated` · ≠ `verify:e2e-performance` · ≠ full trio |
| Key loader | `/home/box/.meetwise-secrets/load-model-api-key.sh` **exists** · mode private | ONLY authorized path · 本审 **未** source · **未** print value · **未** invent |
| CR prereq | `post_prove_dual_pass` · install/version/smoke 0/0/0 | **runner honesty only** · **≠** UI green |
| A′ UI | EXIT=1 · chromium miss · Key set · honesty_red | **retained** · 禁 rewrite green without fresh receipts |
| Sole allowlist | `SOLE_WIRING_ALLOWLIST` = wiring/ping/qdrant-backed/adapter/vectorstore-qdrant | **恰 5** · 本刀 **未**扩 |
| G6 / R5 | G6 OPEN · R5 pgvector-legacy SEPARATE | UI Live alone **≠** close |
| Live this prep | harness/eval/slice/REQUEST 均钉 `not_run:pre_dual` | **属实** · 本审 **未**跑 |

**Repo**：`/workspace/meetwise` · HEAD `639134f`。**未**读 `.env*`。**未** invent Key。**未** commit。**未**跑 `pnpm e2e:ui:isolated`。

---

## 2. REQUEST Q1–Q5（对抗答）

| # | 问题 | 本审答 | 对抗要点 |
|---|------|--------|----------|
| **Q1** | Agree this knife = **UI Live re-run after chromium**（`e2e:ui:isolated` only · Key loader path · ≠ full trio · ≠ CR reinstall）? | **同意** | Scope = authorized Key-loader-path re-run of **`pnpm e2e:ui:isolated` only** after CR `post_prove_dual_pass` · **≠** full Key×3 · **≠** chromium reinstall · **≠** HTTP/perf |
| **Q2** | Agree **chromium prereq ≠ UI green** · **install/start ≠ suite/G6/R5/UI green** · **Key set ≠ UI green** · **A′ honesty_red retained**? | **同意（硬钉）** | CR dual-closed = runner-prereq honesty only · A′ UI EXIT=1 honesty_red **保留** · Key presence **≠** UI green |
| **Q3** | Agree Key inject = `source …/load-model-api-key.sh` only · NEW_SHELL_STATUS name-only · **no invent Key** / no `.env*`? | **同意（硬钉）** | ONLY authorized loader · name-only probe · never paste Key · never invent · never read `.env*` · unset → fail-closed stop |
| **Q4** | Agree Live stays **`not_run:pre_dual`** until dual PASS + **separate meetwise execute authorize** · then EXIT honesty + post-prove dual · no self-approve? | **同意（硬钉）** | 本 REQUEST / 本审 pass **≠** authorize Live · 须 **dual PASS + separate authorize** · then EXIT honesty · post-prove · Ban fake green |
| **Q5** | Agree **R5 isolated still SEPARATE** · sole 恰 5 · **Ban fake green** · `releaseEvidence=false` · **no** model-op · Ban suite/G6/R5/UI/HA green from this prep? | **同意** | R5 = orthogonal SEPARATE · sole allowlist **恰 5** 未扩 · omit `mw-model-op` 正确 · `releaseEvidence=false` · ≠HA · Ban suite/G6/R5/UI green |

---

## 3. 对抗：假绿 / 偷关 / 冒充

| 风险说法 | 裁定 |
|---------|------|
| 「CR `post_prove_dual_pass` / install/smoke = UI green / suite green」 | **假绿 / 禁** — **chromium prereq ≠ UI green** |
| 「Key set / NEW_SHELL_STATUS=set = UI green」 | **假绿 / 禁** — **Key set ≠ UI green** |
| 「本审 pass = 已授权 `pnpm e2e:ui:isolated`」 | **禁** — 须 **separate authorize** after dual PASS |
| 「UI EXIT=0 later = suite green / G6 closed / R5 closed / HA」 | **假绿 / 禁** — EXIT honesty · still ≠ suite/G6/R5/HA |
| 「改写 A′ honesty_red Key-set UI → green（无 fresh receipts）」 | **禁** — A′ **retained** until execute+post-prove |
| 「本刀 = R5 closed / sole cutover / G1 flip」 | **假绿 / 禁** — R5 **SEPARATE** · sole **恰 5** |
| 「实现方预写 REQUEST = 专家 pass」 | **禁** — 拒绝自批 |
| 「本域 pass = dual 齐」 | **禁** — 须配对 `mw-rag-route` 独立 |
| 「invent Key / 读 `.env*` / 跑 Live this prep」 | **禁** |
| 「full trio / HTTP iso / perf = this knife」 | **禁** — CMD = **`e2e:ui:isolated` only** |

**本审**：送审 artefacts **未**把 suite/G6/R5/UI/HA 写成已关；假绿面在 **叙事外推**（CR→UI 绿）与 **Live 偷开**。文档闸诚实即可控。

---

## 4. 边界 vs CR / A′ / G6 / R5 / suite

| 层 | 状态（只读） | 与本刀关系 |
|----|--------------|------------|
| CR chromium prereq | **`post_prove_dual_pass`** · 0/0/0 · Live `not_run:this_knife` | **prereq met** · **≠** UI green · enables this knife draft |
| A′ live Key×3 | `honesty_red_key_set` · EXIT 1/1/1 · UI chromium miss | **retained** · fresh UI receipts supersede only after execute+post-prove |
| G6 | **still OPEN** | UI Live alone **≠** G6 closed |
| R5 pgvector-legacy | **still open · SEPARATE** | default iso still R5 green-risk · **not** this close surface |
| sole allowlist | **恰 5** | 本刀 **不**扩 sole |
| suite / HA | not green · ≠HA | Ban claiming from this prep |

---

## 5. 阻塞 / 门控

| 类 | 项 |
|----|-----|
| **本域文档闸** | **无阻塞** → **pass**（docs gate only） |
| **配对域** | 须 `mw-rag-route` 独立 pass；冲突取更严；本审 **不代签** |
| **Live execute** | **仍禁**直至 **pre-exec dual BOTH PASS + separate meetwise execute authorize** |
| **post-prove** | n/a until after authorized execute + EXIT honesty |
| **suite / G6 / R5 / UI / HA** | **仍开** — 本刀文档闸 **不**关这些面 |

---

## 6. 非宣称

禁止：suite green、G6 closed、R5 closed/retired、UI green、family green、HA、`releaseEvidence=true`、本审 = Live authorize / knife done、实现方自批、invent Key、把 CR `post_prove_dual_pass` 写成 UI green、把 A′ honesty_red rewrite 为绿、sole cutover / G1 flip、full trio 冒充本刀、Key set = UI green。

---

## 7. 收据

- 专家：`mw-e2e-ha`
- 覆盖：`REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-mw-e2e-ha.md`
- 结论：`ai-docs/delivery/reviews/2026-09-17-g7-ui-live-rerun-after-chromium-mw-e2e-ha.md`
- 对照：harness UI-A–D / M1–M7 · slice · eval · CR `post_prove_dual_pass` · A′ honesty_red retained · G6 OPEN · R5 SEPARATE · sole 恰 5 · CMD=`pnpm e2e:ui:isolated` only · loader exists（未 source）
- **零 Live · 零 coding · 零 invent Key · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · chromium prereq ≠ UI green · Key set ≠ UI green · A′ honesty_red retained · sole 恰 5 · R5 SEPARATE · Ban fake green**
- blockers：**无**（本 pre-exec 文档门）；Live **仍禁**直至 dual PASS + **separate authorize**

---

*Review · mw-e2e-ha · G7 UI Live re-run after chromium pre-exec · 2026-09-17 ~00:09 PT · **pass**（docs gate only）· HEAD `639134f` · chromium prereq ≠ UI green · A′ honesty_red retained · CMD=`pnpm e2e:ui:isolated` only · Live not_run:pre_dual · execute needs dual PASS + separate authorize · Ban fake green · no invent Key · releaseEvidence=false · ≠HA · ≠ suite/G6/R5/UI green · sole 恰 5 · R5 SEPARATE*
