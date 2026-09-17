# 审查归档 — NHP-R4-ADV-01 **covered path** **post-prove** · mw-e2e-ha

**日期**：2026-09-16（PT；本审独立复跑 ~19:54 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · post-prove 第二域；**不采信**实现方自报 EXIT；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-e2e-ha.md`  
**前序 pre-exec**：`reviews/2026-09-16-nhp-r4-adv-covered-path-mw-e2e-ha.md`（**pass** · 执行前文档闸 only；当时零 prove）  
**配对**：`REQUEST-2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-rag-route.md`（**不替代**本域；须独立签；本审**不等待**其完成；截至本审配对 review **ABSENT**）  
**结论**：**pass**（**仅** post-prove honesty：真 PG · C1–C4 composition · with-PG EXIT=0 · no-PG EXIT≠0 · skip≠pass · **禁止**升 NHP-R4-ADV-01 → covered · **await dual**）  
**批准范围**：**仅**「`pnpm nhp-r4-adv-covered:prove` 专家复跑 EXIT=0 + `:prove:raw` 无 PG EXIT≠0 + 真击中 isolated PG（非 in-memory）+ C1–C4 诚实 + sole 未扩 + default stack 未翻 + matrix **仍 partial** + ≠ R4 关 / ≠ covered / ≠ HA / `releaseEvidence=false`」——**不批** matrix covered 升格 · R4 closed · wrong_track=0 production closed · 题域已隔离 · HA · suite green · `releaseEvidence=true` · sole cutover · flip default · open DELETE · 把本绿 / LIVE_PG dual 写成 covered close · 单域本审冒充 dual 齐  
**硬钉**：`releaseEvidence=false` · **≠HA / Not HA** · **≠ covered**（**Ban promoting covered in this review**）· **partial 仍** until **post-prove dual**（both domains）· **单域本审 ≠ promote covered** · **EXIT=0 ≠ matrix covered ≠ R4 closed ≠ production wrong_track=0** · **LIVE_PG dual ≠ this knife done** · **≠ suite green** · **拒绝实现方自批** · HEAD `639134f`

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **post-prove honesty only** — NOT matrix covered promote · NOT R4 closed · NOT wrong_track=0 production closed · NOT HA · NOT suite green · NOT dual 齐 |
| 实现方自批 / REQUEST 预写 | **无效 / 拒绝**；本审独立裁定 |
| With-PG `pnpm nhp-r4-adv-covered:prove` | **EXIT=0**（真 isolated PG · `mode=isolated`） |
| No-PG `pnpm nhp-r4-adv-covered:prove:raw` | **EXIT=1**（`COVERED_PATH_GAP` · skip≠pass） |
| NHP-R4-ADV-01 | **仍 partial**/honesty-pin；**本审明确不升 covered** |
| Matrix | **仍 partial** |
| R4 / 题域 | **仍 NOT closed / 仍开** |
| LIVE_PG ADV `post_prove_dual_pass` | **≠** 本 covered path done（硬钉保留） |
| 本刀 status | harness/eval 仍 `executed:awaiting_post_prove_dual`（须配对齐才可 dual） |
| `releaseEvidence` | **false** |
| HA / suite | **≠HA** · **≠ suite green** |
| Blockers（本域 honesty） | **无阻塞**（见 §6；配对域独立） |

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| 实现方 `pnpm nhp-r4-adv-covered:prove` EXIT=0（eval） | **不采信自报**；本审 **独立复跑 EXIT=0**（§2） |
| 无 PG `:prove:raw` → EXIT≠0（skip≠pass） | **属实**；本审独立复跑 → **EXIT=1** |
| harness `executed:awaiting_post_prove_dual` · matrix 仍 partial | **属实** |
| LIVE_PG dual ≠ this knife done · EXIT=0 ≠ covered ≠ R4 关 | **属实**（硬钉全文） |
| sole 不扩；default 不翻；未 open DELETE | **属实**（SOLE 恰 5；default=`pgvector-legacy`） |
| `releaseEvidence=false` · ≠HA · 禁止自批 · await dual | **属实**；本文件为独立签核 |
| 配对 rag-route post-prove | **ABSENT / 待审**；**不替代**本域；dual = 两域齐 |

对照源：REQUEST post-prove · `harness/nhp-r4-adv-covered-path.md` · `eval/nhp-r4-adv-covered-path.eval.md` · `nhp-r4-adv-covered-path.slice.md` · `harness/r4-domain-isolation-status.md` §12 · `non-happy-path-perf-load-case-matrix.md` NHP-R4-ADV-01 · `apps/worker/test/nhp-r4-adv-covered.proof.ts` · `scripts/run-e2e-isolated.mjs` SOLE · 前序 pre-exec `2026-09-16-nhp-r4-adv-covered-path-mw-e2e-ha.md`

---

## 2. 独立复跑 CMD+EXIT（本审 · ~19:54 PT · HEAD `639134f`）

| # | CMD | EXIT | 诚实读法（本审强制） |
|---|-----|------|----------------------|
| 1 | `pnpm nhp-r4-adv-covered:prove` | **0** | 真击中 **isolated PG**（`run-e2e-isolated` · host `127.0.0.1:32846` · `mode=isolated`）；C0/C4 PASS；spawn unit ADV EXIT=0；spawn LIVE_PG EXIT=0；C1–C4 composition OK；**≠ covered**；**≠ R4 closed**；matrix **仍 partial**；`releaseEvidence=false` |
| 2 | `env -u DATABASE_URL -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE -u E2E_ISOLATED -u E2E_TEST_TARGET_TOKEN pnpm nhp-r4-adv-covered:prove:raw` | **1** | 无 PG → 立即 `COVERED_PATH_GAP` + `skip ≠ pass` + 拒 in-memory 假绿；**skip≠pass** 诚实成立 |

**未跑（禁）**：HA 绿关 · flip default · open DELETE · 全套 `e2e:isolated` 当本刀关闸 · 把本绿当 matrix covered / R4 关 · 本审内升 covered。

### 2.1 With-PG 收据（~19:54 PT）

- 宿主：`node scripts/run-e2e-isolated.mjs nhp-r4-adv-covered:prove:raw`
- R5 标记：`E2E_ISOLATION_STACK=pgvector-legacy` · `E2E_PG_IMAGE=pgvector/pgvector:pg16`（legacy fixture；**≠** sole-stack truth）
- Isolated PG：`meetwise-e2e-1085731-1789613663860 on 127.0.0.1:32846`
- migrate：`applied=133 skipped=0`
- 关键行：`COVERED_PATH LIVE_PG target mode=isolated (real Postgres required; skip≠pass)`
- C4：matrix NHP-R4-ADV-01 still partial PASS；SOLE allowlist not expanded PASS；no invent MODEL_API_KEY PASS
- Spawn unit ADV：`OK  r4-wrong-track-adv prove … ≠ covered; ≠ R4 closed; releaseEvidence=false` → PASS EXIT=0
- Spawn LIVE_PG：`OK  r4-wrong-track-adv-live-pg prove (LIVE_PG hit; retrieveVia; … ≠ covered; ≠ R4 closed; releaseEvidence=false)` → PASS EXIT=0
- 终行：`OK  nhp-r4-adv-covered prove (C1–C4 composition; LIVE_PG+unit; matrix still partial; ≠ covered until post-prove dual; ≠ R4 closed; releaseEvidence=false)`
- honesty summary：`PG mode=isolated · unit ADV exit=0 · LIVE_PG exit=0`；`LIVE_PG ADV post_prove_dual_pass ≠ this covered path done`；`EXIT=0 ≠ covered ≠ R4 closed ≠ production wrong_track=0 closed ≠ HA`
- receipt：`LOCAL_ISOLATED_PROOF_RECEIPT … release_evidence=false`

→ **确认：非 in-memory 假绿**；真 PG + C1–C4 composition。

### 2.2 No-PG 收据（~19:54 PT）

- 打印：`COVERED_PATH_GAP: real Postgres required for nhp-r4-adv-covered prove (C1 live wired).` + `skip ≠ pass — refusing fake-green with in-memory-only.`
- `ELIFECYCLE` exit code **1** → **EXIT=1**
- 读法：无 PG **不得** skip-as-pass；本刀 fail-closed 诚实。

---

## 3. C1–C4 / sole / default / matrix 抽查

| 维度 | 本审结果 |
|------|----------|
| 真 PG | **是** — isolated fixture；`mode=isolated` |
| C1 live wrong_track | **PASS** — via LIVE_PG spawn EXIT=0（retrieveVia · wrong_track=0） |
| C2/C3 unit ADV 旁证 | **PASS** — unit ADV spawn EXIT=0（A3 map + fail-closed） |
| C4 honesty pins | **PASS** — harness C1–C4 · CMD freeze · LIVE_PG≠covered · partial until dual · matrix still partial · R4 NOT closed · SOLE not expanded · no invent key |
| SOLE_WIRING_ALLOWLIST | 恰 **5**：`sole-stack:wiring/ping/qdrant-backed/vectorstore-adapter/vectorstore-qdrant`；**无** `nhp-r4-adv-covered` 入表 |
| `E2E_ISOLATION_STACK` default | **未翻** — 仍 `rawIsolationStack \|\| LEGACY_STACK` → `pgvector-legacy` |
| open DELETE | **未开**（本刀未引入） |
| NHP-R4-ADV-01 | **partial**/honesty-pin；**本审禁止升 covered** |
| status §12 | covered path = `executed:awaiting_post_prove_dual`；R4 **仍 NOT closed**；题域隔离 NOT closed |
| `releaseEvidence=true` 宣称 | **无** |

→ **covered-path prove 诚实绿：真 PG · C1–C4 · 无 PG 诚实失败。**  
→ **EXIT=0 ≠ matrix covered ≠ R4 closed ≠ HA ≠ suite green。**  
→ **本审不升 covered；await post-prove dual。**

---

## 4. 对抗：EXIT=0 / LIVE_PG dual 偷写成 covered / R4关 / HA

| 风险说法 | 裁定 |
|---------|------|
| 「`nhp-r4-adv-covered:prove` EXIT=0 = NHP-R4-ADV-01 covered」 | **假绿 / 禁** — EXIT=0 ≠ matrix covered；**Ban promoting covered in this review**；须 **post-prove dual** |
| 「本域 post-prove pass = dual 齐 / 可升 covered」 | **假绿 / 禁** — 单域 ≠ dual；配对 `mw-rag-route` ABSENT；partial stays until **both domains** |
| 「LIVE_PG ADV `post_prove_dual_pass` = this covered knife done」 | **假绿 / 禁** — LIVE_PG dual ≠ this knife done（C-R2 / L7） |
| 「EXIT=0 = R4 closed / 题域已隔离 / wrong_track=0 production closed」 | **假绿 / 禁** — status §12 NOT closed；pass ≠ 关闸 |
| 「EXIT=0 = HA / suite green / `releaseEvidence=true`」 | **假绿 / 禁** — 全文 `releaseEvidence=false` · ≠HA · ≠ suite green |
| 「in-memory / skip = 绿」 | **假绿 / 禁** — 无 PG EXIT=1 已证 |
| 「sole 因本刀扩面 / flip default / open DELETE」 | **假绿 / 禁** — sole 仍 5；default 未翻；无 open DELETE |
| 「实现方 REQUEST/eval 自报绿 = 专家 pass」 | **禁** — 本文件独立签核；**拒绝自批** |
| 「companions NEG/FAULT/BOUND 因本刀升 covered」 | **禁** — harness §2.2；本审不升格 |

**本审结论**：送审材料与 prove OK/honesty **未**把本绿升格为 covered / R4关 / HA；对抗面在 **叙事外推**。文档与独立复跑诚实。**批准范围钉死：不升 covered · await dual。**

### NHP-R4-ADV-01（独立 · matrix · **明确不升 covered**）

| 列 | 旗（本审核验） |
|----|----------------|
| **NHP-R4-ADV-01** | **仍 partial**/honesty-pin；covered prove EXIT=0 旁证；**≠ covered**；**≠ R4 closed**；**partial stays until post-prove dual（both domains）** |
| companions NEG/FAULT/BOUND | **未**因本刀升 covered |
| 本审是否 promote → covered？ | **否（Ban）** |

status §12：`executed:awaiting_post_prove_dual` · R4 **仍 NOT closed** · next=**await post-prove dual**。

---

## 5. REQUEST Q1–Q7（mw-e2e-ha · post-prove · 对抗答）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 请独立复跑 `pnpm nhp-r4-adv-covered:prove`，附 CMD+EXIT；确认真击中 PG？ | **是**。CMD=`pnpm nhp-r4-adv-covered:prove`；EXIT=**0**；`mode=isolated`；真 PG `127.0.0.1:32846`；OK 行含 C1–C4 · matrix still partial · ≠ covered until post-prove dual。 |
| 2 | C1–C4 是否诚实？无 PG 时是否 fail（非 skip-as-pass）？ | **是**。C0/C4 + spawn unit/LIVE_PG 全 PASS；无 PG raw → EXIT=**1** + `COVERED_PATH_GAP` + `skip ≠ pass`。 |
| 3 | 是否未错误冒充完整 E2E / HA / matrix covered / R4 关？ | **是（未冒充）**。全文钉 `releaseEvidence=false` · ≠HA · ≠ covered · ≠ R4 closed · ≠ suite green。 |
| 4 | LIVE_PG ADV `post_prove_dual_pass` 是否仍钉 ≠ 本 covered path done？ | **是**。C-R2 / honesty summary / 本审硬钉保留。 |
| 5 | NHP-R4-ADV-01 是否仍须 partial 直至本 post-prove dual？ | **是**。**仍 partial**；**本审禁止升 covered**；须 **both domains** dual 后方可考虑升格（另流程）。 |
| 6 | sole allowlist / default stack 是否未被本刀偷翻？ | **未翻**。sole 恰 **5**；default 仍 `pgvector-legacy`；无 open DELETE。 |
| 7 | 实现方是否自批？ | **否**。仅 REQUEST/eval；无实现方 pass review；本文件为 `mw-e2e-ha` 独立对抗审。 |

---

## 6. Blockers

| ID | 项 | 挡本域 post-prove honesty pass？ | 挡 matrix covered / R4 关？ |
|----|-----|----------------------------------|----------------------------|
| — | 本刀 covered-path post-prove honesty | **无阻塞** | — |
| **B-DUAL** | 配对 `mw-rag-route` 须齐 | 本域可独立 pass；**dual = 两域齐** | **是**（covered promote 条件含 dual） |
| **B-COVERED** | NHP-R4-ADV-01 → covered | **否**（本审明确 **不**升） | **仍 partial**；Ban promote in this review |
| **B-R4** | R4 / 题域 / wrong_track=0 production | **否** | **仍开**；EXIT=0 ≠ 关闸 |
| **B-HA** | HA / suite green / releaseEvidence | **否** | 仍 `false` · ≠HA · ≠ suite green |

→ **本域 post-prove honesty：无阻塞 → verdict pass。**  
→ **matrix 仍 partial · R4 仍开 · releaseEvidence=false · ≠HA。**  
→ **await post-prove dual（mw-rag-route）**；单域 ≠ promote covered。

---

## 7. 签名

**Verdict**: **pass**  
**Scope**: **post-prove honesty only**（真 PG · C1–C4 · with-PG EXIT=0 · no-PG EXIT=1 · skip≠pass）  
**Expert**: `mw-e2e-ha`  
**With-PG EXIT**: **0**  
**No-PG EXIT**: **1**  
**Confirm**:
- NHP-R4-ADV-01 **仍 partial** · **本审不升 covered**（Ban promoting covered）
- matrix **仍 partial**
- R4 **仍开 / NOT closed**
- `releaseEvidence=false` · **≠HA** · **≠ suite green**
- LIVE_PG dual **≠** this knife done
- EXIT=0 **≠** matrix covered **≠** R4 closed **≠** production wrong_track=0
- sole allowlist **未扩**（恰 5）· default stack **未翻** · **无** open DELETE
- 拒绝自批 · 配对 `mw-rag-route` **独立 / 仍 ABSENT** · **await dual**
- HEAD `639134f`

---

*Review · mw-e2e-ha · NHP-R4-ADV covered path post-prove · 2026-09-16 ~19:54 PT · pass（honesty only）· Ban promote covered · matrix partial · R4 open · releaseEvidence=false · ≠HA · awaiting dual*
