# 审查归档 — G7 · **chromium / UI runner prerequisite** · 执行前文档闸 · mw-e2e-ha

**日期**：2026-09-16 ~23:57 PT  
**审稿人**：`mw-e2e-ha`（对抗独立审 · 执行前第二域；**实现方自批无效 / 拒绝**；本审 **零 prove · 零 coding · 零 install · 零 Live re-run · 零 invent Key · 零 HA**）  
**送审**：`reviews/REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-mw-e2e-ha.md`  
**对照（全文只读）**：
- `harness/g7-chromium-ui-runner-prereq.md`（本刀 canonical harness · M1–M6 · CR-A–D）
- `g7-chromium-ui-runner-prereq.slice.md`
- `eval/g7-chromium-ui-runner-prereq.eval.md`（`REQUEST-ready / not_run:pre_dual`）
- `harness/g7-key-live-x3.md` §2（A′ Key-set `e2e:ui:isolated` EXIT=1 · Playwright chromium missing · `client_exited` · ≠ UI covered）
- `eval/g7-key-live-x3.eval.md`（UI honesty_red row）
- `harness/g6-e2e-iso-blocked.md`（LIVE UI Set · G6 still OPEN · R5 fixture orthogonal）
- Spot（只读）：`package.json` `e2e:ui` / `e2e:ui:isolated` · `scripts/run-e2e-ui.mjs` · **未**跑 install · **未**读 `.env*` · **未**复跑 A′ trio
**配对**：`REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-mw-rag-route.md`（**须独立签**；冲突取更严；**本审不代签 / 不等待**）  
**结论**：**pass**（**仅** 执行前文档闸）  
**批准范围**：**仅**同意本刀 harness/slice/eval/双 REQUEST 够格定义 **chromium / UI runner prereq honesty**（CR-A–D；from A′ Key-set UI EXIT=1）· 硬钉 **≠ suite green · ≠ G6 closed · ≠ R5 closed · ≠ HA · Key set ≠ UI green · `releaseEvidence=false` · no invent Key · R5 pgvector-legacy SEPARATE** · **no** `mw-model-op` · **install not authorized** until **dual PASS + separate authorize** · CMD/install/Live **`not_run:pre_dual` / not authorized** · 本审 **≠** install/Live/coding authorize · **≠** 本刀 done · **Ban claiming suite/G6/R5/UI green**  
**不批**：suite green · G6 closed · R5 closed/retired · UI green · family green · HA · `releaseEvidence=true` · 本审 = 授权 `playwright install chromium` / Live re-run · 实现方自批 · invent Key · 把本刀写成 R5 closed · 把 A′ honesty_red 写成 UI/suite green · sole cutover / G1 flip  
**硬钉**：`releaseEvidence=false` · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **Key set ≠ UI green** · **R5 SEPARATE** · planned install **`not_run:pre_dual` · not authorized** · **本审零 install · 零 Live · 零 coding · 零 invent Key** · **拒绝自批** · **须配对 `mw-rag-route` 独立** · install needs **dual PASS + separate authorize**

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **执行前文档闸 only** — NOT install · NOT Live re-run · NOT coding · NOT suite green · NOT G6 closed · NOT R5 closed · NOT UI green · NOT HA · NOT this knife done |
| 实现方自批 / REQUEST 预写 | **无效 / 拒绝**；本审独立裁定 |
| Knife / CMD | **`REQUEST-ready / not_run:pre_dual`**；`playwright install chromium` **未授权 · 未跑**；Live UI **未复跑** |
| A′ prior | **`post_prove_dual_pass:honesty_red`** · UI EXIT=1 chromium miss · Key set · **≠** UI/suite green · **≠** G6 closed |
| Install / Live | **仍 blocked** — 本 pre-exec dual pass **后**仍须 **separate authorize**；本审 **≠** authorize |
| Experts | `mw-e2e-ha` + `mw-rag-route` only · **no** `mw-model-op` |
| G6 / R5 / suite / UI | **仍 OPEN / 未绿** · R5 = **SEPARATE** |
| `releaseEvidence` | **false** |
| HA | **≠HA** |
| 阻塞（本域文档闸） | **无阻塞**（见 §5；配对域独立；install/Live 仍 gated） |

---

## 1. 已读 / 对照（只读 · 零 install · 零 Live）

| 角色 | 路径 | 观察 |
|------|------|------|
| REQUEST（本域） | `REQUEST-…-mw-e2e-ha.md` | Q1–Q5 清晰；硬钉完整；禁自批；install gated；R5 SEPARATE；Key set ≠ UI green |
| Harness | `harness/g7-chromium-ui-runner-prereq.md` | §0–§5：CR-A–D · M1–M6 · A′ evidence · install gate · no model-op · R5 SEPARATE · Ban suite/G6/R5/UI green |
| Slice | `g7-chromium-ui-runner-prereq.slice.md` | products 齐；硬钉齐；zero coding/install/Live this prep |
| Eval | `eval/g7-chromium-ui-runner-prereq.eval.md` | E1–E7 stubs · fake-green checklist · install/Live **not_run** |
| A′ harness | `g7-key-live-x3.md` §2 | UI EXIT=1 · chromium `Executable doesn't exist` · Key set · ≠ UI covered |
| G6 | `g6-e2e-iso-blocked.md` | G6 still OPEN · UI in LIVE Set · fixture R5 orthogonal |
| Pair REQUEST | `REQUEST-…-mw-rag-route.md` | 已备；本审 **不代签** |

### 1.1 Spot（只读 · 不跑 install / Live）

| 点 | 观察 | 读法 |
|----|------|------|
| A′ UI fail | Key **set** · Playwright chromium missing · `client_exited` · 18 failed | CR-A **诚实** · **Key set ≠ UI green** |
| Planned install | harness 登记 `pnpm exec playwright install chromium` · **未授权 · 未跑** | **`not_run:pre_dual`** — 禁 invent EXIT / 禁本审 install |
| Live re-run | 本刀 **明确** no Live re-run this prep | **属实** · 禁复跑 trio 冒充新绿 |
| G6 / R5 | G6 OPEN · R5 pgvector-legacy **SEPARATE** still open | 本刀 **不得**宣称关 |
| Key / env | 本审 **未读** `.env*` · **未** invent Key · **未** paste Key | **属实** |

---

## 2. REQUEST Q1–Q5（对抗答）

| # | 问题 | 本审答 | 对抗要点 |
|---|------|--------|----------|
| **Q1** | Agree this knife = chromium / UI runner prereq honesty（CR-A–D；from A′；≠ suite/G6/R5 close）？ | **同意** | A′ UI EXIT=1 chromium miss = env/prereq gap；CR-A–D 钉 honesty · **≠** suite/G6/R5 close knife |
| **Q2** | Agree ≠ suite green · ≠ G6 closed · ≠ R5 closed · ≠ HA · Key set ≠ UI green？ | **同意（硬钉）** | Key present 仍 UI fail · install alone later **仍 ≠** G6/R5/suite/HA |
| **Q3** | Agree **no** `mw-model-op`？ | **同意** | Domain = UI runner / Playwright browser prereq honesty · **无** MODEL-OP need |
| **Q4** | Agree install not authorized until dual PASS + separate authorize · no install/Live this prep？ | **同意（硬钉）** | 本 REQUEST / 本审 pass **≠** authorize install / Live re-run；须 **dual PASS + separate authorize** |
| **Q5** | Agree R5 SEPARATE · must not claim R5 closed · `releaseEvidence=false` · no invent Key · Ban suite/G6/UI green？ | **同意** | R5 pgvector-legacy = **orthogonal SEPARATE knife** · 本刀 **禁**宣称 R5 closed；`releaseEvidence=false` · ≠HA · no invent Key |

---

## 3. 对抗：假绿 / 偷关 / 冒充

| 风险说法 | 裁定 |
|---------|------|
| 「chromium 文档闸 / REQUEST-ready = suite green / G6 closed / UI green」 | **假绿 / 禁** |
| 「Key set / A′ dual = UI green / family green」 | **假绿 / 禁** — Key set ≠ UI green（chromium miss） |
| 「本审 pass = 已授权 `playwright install chromium` / Live re-run」 | **禁** — 须 **separate authorize** after dual PASS |
| 「install EXIT=0 later = G6 closed / R5 closed / suite green / HA」 | **假绿 / 禁** |
| 「本刀 = R5 closed / R5 retired / sole cutover」 | **假绿 / 禁** — R5 **SEPARATE** |
| 「实现方预写 REQUEST = 专家 pass」 | **禁** — 拒绝自批 |
| 「本域 pass = dual 齐」 | **禁** — 须配对 `mw-rag-route` 独立 |
| 「invent Key / 读 `.env*` 来证明 UI」 | **禁** — no invent Key |

**本审**：送审 artefacts **未**把 suite/G6/R5/UI/HA 写成已关；假绿面在 **叙事外推** 与 **install/Live 偷开**。文档闸诚实即可控。

---

## 4. 边界 vs A′ / G6 / R5 / suite

| 层 | 状态（只读） | 与本刀关系 |
|----|--------------|------------|
| A′ live Key×3 | `post_prove_dual_pass:honesty_red` · EXIT 1/1/1 | **证据源** · UI chromium miss · **≠** UI green · **≠** this knife done |
| A Key-blocked×3 unset | `post_change_dual_pass` retained | complementary · **not** rewritten |
| G6 | **still OPEN** | install alone **≠** G6 closed |
| R5 pgvector-legacy | **still open · SEPARATE** | **not** this knife close surface |
| Suite / HA / sole | **未绿 / ≠HA / sole ≠ retired** | **not** claimed |

---

## 5. 阻塞 / 批准边界

| 类 | 裁定 |
|----|------|
| **本域文档闸阻塞** | **无阻塞** |
| 配对 `mw-rag-route` | **独立进行**；本审不代签；dual = 两域齐 |
| install / Live re-run / coding | **仍禁** 直至本刀 **pre-exec dual PASS** + meetwise **separate authorize** |
| G6 / R5 / suite / UI / HA | **仍开 / 未绿关** · R5 SEPARATE |
| this knife done | **否** — 仅 docs gate pass |
| planned install | `pnpm exec playwright install chromium` = **`not_run:pre_dual` · not authorized** |

---

## 6. 签名

**Verdict**: **pass**  
**Scope**: **执行前文档闸 only**  
**Expert**: `mw-e2e-ha`  
**Confirm**: zero install · zero Live · zero coding · zero invent Key · suite **not green** · G6 **OPEN** · R5 **OPEN SEPARATE** · UI **not green** · `releaseEvidence=false` · **≠HA** · Key set **≠** UI green · 本审 **≠** install/Live authorize · install needs **dual PASS + separate authorize** · 拒绝自批 · 配对 `mw-rag-route` 独立 · **Ban claiming suite/G6/R5/UI green**

---

*Review · mw-e2e-ha · G7 chromium UI runner prereq · 2026-09-16 ~23:57 PT · pass（执行前文档闸 only）· not_run:pre_dual · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · Key set ≠ UI green · R5 SEPARATE · install still needs dual PASS + separate authorize · Ban suite/G6/R5/UI green*
