# 审查归档 — G7 · **UI Live re-run after chromium** · **post-prove** · mw-e2e-ha

**日期**：2026-09-17 ~00:19 PT  
**审稿人**：`mw-e2e-ha`（对抗独立 post-prove；**拒绝实现方自批**；**零 invent Key**；**未读 `.env*`**；**零 commit secrets**；**未**重跑 Live / **未** source Key loader）  
**送审**：`reviews/REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-e2e-ha.md`  
**前序 pre-exec**：`reviews/2026-09-17-g7-ui-live-rerun-after-chromium-mw-e2e-ha.md`（**pass** · 执行前文档闸 only）  
**配对**：`REQUEST-…-post-prove-mw-rag-route.md` / `2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-rag-route.md`（**须独立写**；冲突取更严；**本审不代签**）  
**刀状态**：`executed:awaiting_post_prove_dual` → 本审落地后可记本域 post-prove **honesty_of_red_with_chromium+Key**  
**结论**：**pass**（**仅** Live UI EXIT=1 收据诚实 · chromium **ran** + Key **set** 仍红 · docs **未**假绿 UI/suite/G6/R5/HA · A′ honesty_red **retained** · **≠** UI green）  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ UI green** · **Key set ≠ UI green** · **chromium ran ≠ UI green** · **EXIT=1 ≠ suite/G6/R5/HA** · **A′ honesty_red retained** · **R5 SEPARATE** · **sole 恰 5** · **no invent Key** · **Ban fake green**

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **批准范围** | **仅**「Key-set · chromium-present · UI Live EXIT=1」诚实：CMD+EXIT 与 receipt/logs 一致；docs **未**把 UI/suite/G6/R5/HA 写成绿；A′ historical chromium-miss honesty_red **未**改写为绿；本刀 **≠** full trio |
| **明确不批** | UI green · suite green · G6 closed · R5 closed/retired · family green · HA · `releaseEvidence=true` · invent Key · 实现方自批 · chromium prereq/ran = UI green · Key set = UI green · rewrite A′ honesty_red → green · sole cutover |
| NEW_SHELL_STATUS | **set**（name-only · 本审 **未** source loader · **未** print value） |
| `pnpm e2e:ui:isolated` | **EXIT=1** · 14 failed / 4 passed / 4 skipped · chromium **ran** · `client_exited` · dominant `状态:ingested` timeout |
| A′ prior | `post_prove_dual_pass:honesty_red_key_set` · UI EXIT=1 chromium miss · Key set · **retained** · **not** rewritten to green |
| 实现方自批 | **无效 / 拒绝** |
| `releaseEvidence` | **false** |
| 阻塞（本域 post-prove honesty） | **无** |
| 阻塞（UI / suite / G6 / R5 / HA） | **仍开** — EXIT=1 · 本刀 **不**关这些面 |

---

## 1. 已读 / 对照

| 角色 | 路径 | 观察 |
|------|------|------|
| REQUEST post-prove | `REQUEST-…-post-prove-mw-e2e-ha.md` | 预写 · 禁自批 · Q1–Q6 · 硬钉齐 · EXIT=1 · A′ retained |
| Harness / slice / eval | `harness/g7-ui-live-rerun-after-chromium.md` · slice · eval | 本刀 = `e2e:ui:isolated` only · Key loader · Ban fake green（harness 文首仍标 pre_dual 草稿态；**以 receipt + `.tmp` 为 execute 权威**） |
| Receipt | `receipts/2026-09-17-g7-ui-live-rerun-after-chromium.md` | CMD+EXIT · NEW_SHELL_STATUS=set · EXIT=1 · hard pins · awaiting_post_prove_dual |
| Raw | `.tmp/g7-ui-live-rerun-after-chromium-20260917-001117/` | `EXIT.txt` · `e2e-ui-isolated-full.log` |
| Playwright artifacts | `apps/web/test-results/` · 14 fail dirs still present | fail screenshots/traces align with log |
| Pre-exec | `2026-09-17-g7-ui-live-rerun-after-chromium-mw-e2e-ha.md` | **pass** docs gate only |
| Prior CR | `g7-chromium-ui-runner-prereq` post-prove dual **pass** | runner-prereq only · **≠** UI green |
| A′ | `harness/g7-key-live-x3.md` | honesty_red_key_set · UI EXIT=1 chromium miss · **retained** |
| G6 | `g6-e2e-iso-blocked.md` | G6 **still OPEN** |
| R5 / sole | R5 mark-red / pgvector-legacy / `SOLE_WIRING_ALLOWLIST` | **SEPARATE** · sole **恰 5** |

**Repo**：`/workspace/meetwise` · receipt HEAD `db0d513`（当前 tip may advance；**本审以 `.tmp` + receipt 为权威**）。**未**读 `.env*`。**未** invent Key。**未** commit secrets。**未**重跑 Live。**未** source Key loader。

---

## 2. 收据核验（权威 · 独立 spot · 不采信自批绿 · **不**重跑）

| # | CMD / artifact | 实现方 | 本审独立核验 | 诚实读法 |
|---|----------------|--------|--------------|----------|
| 1 | NEW_SHELL_STATUS probe | **set** | **确认** · `EXIT.txt` = `… NEW_SHELL_STATUS=set` · log L1 `NEW_SHELL_STATUS=set` | Key present · **≠** UI green · 本审 **未** print value |
| 2 | **`pnpm e2e:ui:isolated`** | **EXIT=1** | **确认 1** · `EXIT.txt` · log footer `CMD=… EXIT=1` · `ELIFECYCLE … exit code 1` · `E2E_FAILURE class=frontend code=client_exited` | Live **ran** · **≠** UI green ≠ suite/G6/R5/HA |
| 3 | Playwright summary | 14 fail / 4 pass / 4 skip | **确认** · log `14 failed` / `4 skipped` / `4 passed (5.4m)` · chromium+mobile projects executed（**无** `Executable doesn't exist`） | chromium **present & ran** · still EXIT=**1** |
| 4 | Fail theme | ingested timeout | **确认** · dominant `getByText(/状态:ingested/)` 20s timeout · stream-window `toContainText` fail | fail class = ingest/status · **≠** A′ chromium-miss class |
| 5 | R5 banner | R5-MARKED-RED pgvector-legacy | **确认** · log L6 `[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy` | R5 **SEPARATE** · UI Live ≠ R5 closed |
| 6 | `.last-run.json` | receipt claimed `status=failed` · 14 failedTests | **caveat**：当前文件 mtime **晚于** EXIT（~00:18 PT）且内容为 `status=passed` / `failedTests=[]` — **不得**采信为绿；权威 = `EXIT.txt` + full.log + 14 fail dirs | Ban fake green from stale overwrite |

**未做（禁）**：重跑 Live · source Key loader · invent Key · 读 `.env*` · 宣称 UI/suite/G6/R5/HA green · 改写 A′ honesty_red · 实现方自批。

**本审动作**：核对 receipt + `.tmp` EXIT/log + fail dirs · docs 假绿扫描 · sole allowlist spot（恰 5）· **零** Live re-run · **零** Key loader。

---

## 3. REQUEST Q1–Q6（对抗答）

| # | 问 | 本审 |
|---|----|------|
| **Q1** | Confirm EXIT：**NEW_SHELL_STATUS=set** · **`pnpm e2e:ui:isolated` EXIT=1** · and **EXIT≠0 ≠ UI green ≠ suite green ≠ G6 closed ≠ R5 closed ≠ HA**? | **确认。** EXIT=**1** · Key **set** · **≠** UI/suite/G6/R5/HA green。 |
| **Q2** | Agree **chromium prereq ≠ UI green** · chromium **ran** this turn still **≠ UI green**（EXIT=1）? | **同意（硬钉）。** CR dual-closed + this Live chromium-ran still EXIT=1 · **≠** UI green。 |
| **Q3** | Agree **A′ honesty_red_key_set retained** · do **not** rewrite historical chromium-miss red to green? | **同意（硬钉）。** A′ = chromium-miss honesty_red **保留**；本刀 fresh EXIT=1（ingest/status）**不得** spin 成 A′→green。 |
| **Q4** | Agree **R5-MARKED-RED** / pgvector-legacy on iso · **R5 SEPARATE** · **G6 still OPEN** · sole 恰 5 · this knife ≠ full trio? | **同意（硬钉）。** banner 属实 · R5 SEPARATE · G6 OPEN · sole **恰 5**（wiring/ping/qdrant-backed/adapter/vectorstore-qdrant）· UI-only ≠ full trio。 |
| **Q5** | Agree Key inject = authorized loader only · **no invent Key** · never echo/commit Key · `releaseEvidence=false` · Ban fake green? | **同意。** 未见 invent/echo/commit Key；`releaseEvidence=false` · Ban fake green。 |
| **Q6** | Confirm implementer did **not** self-approve · **post-prove dual** required? | **确认。** REQUEST 为预写 awaiting · 本审独立裁定 · **拒绝自批** · 配对 `mw-rag-route` 独立。 |

---

## 4. Hard pins（再钉）

- **chromium prereq ≠ UI green** · **chromium ran ≠ UI green** · **Key set ≠ UI green**
- **EXIT=1 ≠ UI green ≠ suite green ≠ G6 closed ≠ R5 closed ≠ HA**
- **A′ honesty_red retained** · do **NOT** rewrite historical chromium-miss red → green
- **R5 pgvector-legacy SEPARATE** · Ban claiming R5 closed by this
- **sole 恰 5** · `releaseEvidence=false` · **no invent Key** · **no self-approve**
- **Ban claiming suite green / G6 closed / R5 closed / UI green / HA**
- This knife = **UI only**（≠ full trio）

---

## 5. 假绿扫描（docs）

| 风险说法 | 裁定 |
|---------|------|
| chromium ran / CR dual = UI green | **假绿 / 禁** — docs **未**如此宣称；EXIT=1 |
| Key set = UI green / suite green | **假绿 / 禁** — Key set · EXIT=1 · Ban |
| EXIT=1 = rewrite A′ honesty_red → green | **假绿 / 禁** — A′ **retained**；fail class 不同 |
| 本刀 = R5 closed / sole cutover / G6 closed | **假绿 / 禁** — R5 SEPARATE · G6 OPEN · sole 恰 5 |
| 当前 `.last-run.json` passed = suite/UI green | **假绿 / 禁** — stale overwrite · 权威 EXIT=1 |
| 实现方预写 REQUEST = 专家 pass | **禁** — 拒绝自批 |

**本审**：receipt / REQUEST / harness pins **诚实钉红**；未见假绿宣称。

---

## 6. 签名

**Verdict**: **pass**  
**Scope**: **post-prove honesty of red-with-chromium+Key only**（EXIT=1 receipts match · docs no UI/suite/G6/R5/HA green claim · A′ retained）  
**Expert**: `mw-e2e-ha`  
**Independent verify**: EXIT.txt + full.log · **no Live re-run** · **no Key loader**  
**Confirm**: chromium ran ≠ UI green · Key set ≠ UI green · EXIT=1 ≠ suite/G6/R5/HA · A′ honesty_red retained · R5 SEPARATE · sole 恰 5 · `releaseEvidence=false` · ≠HA · no invent Key · 拒绝自批 · 配对 `mw-rag-route` 独立 · **Ban fake green**

---

*Review · mw-e2e-ha · G7 UI Live re-run after chromium post-prove · 2026-09-17 ~00:19 PT · **pass** (honesty of red-with-chromium+Key only) · EXIT=1 · NEW_SHELL_STATUS=set · 14 failed/4 passed/4 skipped · chromium ran · R5-MARKED-RED · client_exited · releaseEvidence=false · ≠HA · ≠ suite/G6/R5/UI green · A′ honesty_red retained · R5 SEPARATE · sole 恰 5 · Ban fake green · no invent Key*
