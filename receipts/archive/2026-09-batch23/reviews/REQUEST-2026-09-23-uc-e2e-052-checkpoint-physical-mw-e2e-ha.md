# REQUEST — **UC-E2E-052 checkpoint physical · GAP-PRIV-CHECKPOINT-FENCE-ONLY** · pre-exec · mw-e2e-ha

**Status**: **FAIL** / `draft:awaiting_pre_exec_dual`（pre-exec r0 · Ban自批 · Ban coding auth · alone ≠ dual）  
**Line**: **B**  
**Expert**: `mw-e2e-ha`  
**Pair**: `REQUEST-2026-09-23-uc-e2e-052-checkpoint-physical-mw-privacy-int.md`（peer `c0f0a51` FAIL · **不代签** · 本角独立复判）  
**Knife**: `harness/uc-e2e-052-checkpoint-physical.md` · slice `uc-e2e-052-checkpoint-physical.slice.md`  
**REQUEST tip**: **`41cffea`** / full `41cffead31cc032648bfc044d9055dbdbe4ae072`  
**Base SHA（REQUEST parent）**: **`21780af`** / full `21780af7a098fe7d8116b2be038b8698e15991b3`（ancestor ✓）  
**Date reviewed**: 2026-09-23 (~21:05 PT)

---

## Pins（retained · 未翻转）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503** retained |
| Ban | invent **covered** · open DELETE · wash `privacy-erasure:prove` as this gap · alone≠dual |

---

## 0. Tip 检查（41cffea）

| 检查 | 结果 |
|------|------|
| `git fetch` + on `origin/feat/mysql-schema-skeleton` | **YES**（ancestor of tip branch；后继含 peer `c0f0a51`） |
| `git show --stat 41cffea` | **4 files · docs only** · `+264` · author meetwise-core |
| name-status vs parent `843b8ca` | **A×4** · 无代码 / 无 SSOT 矩阵改动 · **Ban coding 本 tip 已守** |
| 文件列表 | `harness/uc-e2e-052-checkpoint-physical.md` · `uc-e2e-052-checkpoint-physical.slice.md` · dual stubs `…-mw-e2e-ha.md` / `…-mw-privacy-int.md` |
| 内容读取 | 经 `git show 41cffea:<path>`（HEAD 可漂移） |

### CMD|EXIT（本角录）

| CMD | EXIT |
|-----|------|
| `git fetch origin` | **0** |
| `git rev-parse --abbrev-ref HEAD` | **0** |
| `git log -1 --oneline 41cffea` | **0** |
| `git show --stat 41cffea` | **0** |
| `git show --name-status --format="" 41cffea` | **0** |
| `git show 41cffea:ai-docs/delivery/harness/uc-e2e-052-checkpoint-physical.md` | **0** |
| `git show 41cffea:ai-docs/delivery/uc-e2e-052-checkpoint-physical.slice.md` | **0** |
| `git show 41cffea:…-mw-e2e-ha.md` / `…-mw-privacy-int.md` | **0** |
| `git merge-base --is-ancestor 41cffea origin/feat/mysql-schema-skeleton` | **0** |
| `git merge-base --is-ancestor 21780af 41cffea` | **0** |
| `git merge-base --is-ancestor 8602cea 41cffea` | **0** |
| `git merge-base --is-ancestor 3c4847a 41cffea` | **0** |
| `rg cellStatus / UC-E2E-050 / rowIds`（scripts） | **0** |
| `sed`/`rg` inventory `0048` L429–433 · `0078` · `0096` L576–583 · `checkpoint-privacy.ts` L72+ · `0043` migrations 表 | **0** |
| `rg` prove 名碰撞 `package.json` / apps / packages（tip tree） | **0**（无 `uc052:checkpoint-physical`） |
| `git show 3e39c1e` / `08d54f8` post-prove 收据 | **0** |
| `git show c0f0a51:…-mw-privacy-int.md`（peer · 不采信代签） | **0** |
| `git pull --rebase origin feat/mysql-schema-skeleton` | **0** |

---

## 1. Ruling 1 — 合并行 annotation（矩阵诚实）

**annotation ruling: FAIL**（阻断编码授权；非刀计划本体）

### 前置（UC-052 deletion 是否已赚 partial）

| Dual | SHA | 终态 |
|------|-----|------|
| mw-e2e-ha post-prove fix-round | `3e39c1e` | **PASS** |
| mw-privacy-int post-prove r2 | `08d54f8` | **PASS**（`### VERDICT r2: **PASS**`） |

→ **前置满足**：UC-052 deletion 已双审 PASS，**可以**诚实写「UC-052 deletion → partial」。**不可以**把 050/051 一并抬升。

### 脚本是否把聚合行读成 050/051 partial？

| 消费者 | 行为 | 风险 |
|--------|------|------|
| `scripts/eval-harness-matrix-cite.proof.mjs` **L19** `rowIds: ['UC-E2E-050', …]` + **L367–368** `both.includes(row)` | **只验字符串子串存在**；活矩阵 id `UC-E2E-050–052` **包含** `UC-E2E-050` → cite 绿；**不读**格状态 | **潜伏脚枪**：未来若「找含 UC-E2E-050 的行再 `cellStatus`」会吃到 `partial` |
| `scripts/lib/uc-covered-real-gatherer.mjs` `cellStatus`（L64–71：`/\*\*partial\*\*|\bpartial\b/i`） | 用于 **UC-E2E-018** 路径；**未**发现绑定 `UC-E2E-050`/`050–052` 并读格状态的 covered 机评 | 当前 **不**抬升 050/051；仍无 per-UC 机读子状态 |
| 人读 §1.0.1 **L124** | 三格裸 **`partial`**；备注列已写 Ban 050/051，但**格内**无「仅 052」 | **人可读成 050/051 已 partial** |

### 为何 annotation 方案不能 PASS

1. **提案文案方向正确**（after：每格 `partial（UC-052 deletion only; 050/051 still gap/blind）`）且 cite 因 substring 可在不拆行下保持绿——**但默认 SSOT-at-nail** 把修正推迟到本刀钉合，**编码窗口**活矩阵仍保持裸 `partial`。
2. **偏好**：拆行更机读清晰；若坚持 annotate，须 **docs-only 先于编码授权**落地，且 cite **精确**绑 `UC-E2E-050–052`（消除子串误绑）；任何未来 parser 须把合并行状态按 **minimum / 仅 052 面** 保守解释，**Ban** 推导 050/051 partial。
3. **与 peer 同向**：peer `c0f0a51` Item1 FAIL（B1 活矩阵裸 partial；B2 cite 子串）——本角独立确认，**不代签**。

### Blockers（Item 1）

| ID | 要求 |
|----|------|
| **B1-MATRIX** | 编码授权前 docs-only SSOT：**（a）** 按提案标注 §1.0.1 每一抬升格「仅 UC-052 deletion；050/051 仍 gap/blind」**或（b）** 拆行 `UC-E2E-050`/`051`/`052` 并同步 cite/harness/NHP。**Ban** 裸 `partial` 开编码。 |
| **B2-CITE** | `scripts/eval-harness-matrix-cite.proof.mjs` L19：`UC-E2E-050` → 精确 **`UC-E2E-050–052`**（与活矩阵行 id / harness 对照一致）。 |

---

## 2. Knife review（GAP-PRIV-CHECKPOINT-FENCE-ONLY）

**刀计划：PASS（附编码条件）** — 不单独开绿灯；总判因 Item1 FAIL。

### Inventory（file:line · 对照 tip 声明）

| 声明 | 仓库 | 判 |
|------|------|----|
| 物理 DELETE 三表 | `packages/db/migrations/0048_checkpoint_physical_erasure.sql` **L429–433**（`checkpoint_writes`/`checkpoint_blobs`/`checkpoints` by `thread_id`）+ residual **L436–438** → `privacy_checkpoint_residual_rows` | **诚实** |
| `0078` 同源 purge | `0078_privacy_worker_parent_request_guard.sql` ~L133–140 同三表 DELETE + residual | **诚实** |
| TS wrappers | `packages/db/src/checkpoint-privacy.ts` **L72** `beginCheckpointErasure` · **L95** claim · **L112** `purgeCheckpointErasureTarget`（harness「L72–117」≈ wrappers 起止；purge 函数体延至文件末） | **可接受** |
| `privacy_begin_checkpoint_erasure` 禁 app_role | `0096` **L224–227** `REVOKE EXECUTE … FROM app_role`（0075 同源） | **Ban 重 GRANT** 与计划一致 |
| 0096 CASE（请求态） | `0096` **L576–583**：① pending/leased→`purging` · ② external_pending receipt→`pending_external` · ③ retention_pending→`pending_external` · ④/⑤ →`partial_failed` · ELSE `completed` | FAULT/HP 须钉此序（见 C-FAULT-CASE） |
| PostgresSaver 表 | `0043`/`sql/25_langgraph_checkpoint.sql`：`checkpoints`/`checkpoint_blobs`/`checkpoint_writes`；另有 **`checkpoint_migrations`**（`v integer` 版本表 · **非** per-thread） | 计划 **正确排除** migrations；勿误删 |

### NHP 完备性

| ID（harness） | 覆盖 | 缺口/条件 |
|---------------|------|-----------|
| FAULT-01 mid-purge / lease lost | 有 | 须钉请求态循 0096（多为 `pending_external`；若 locals 仍 pending/leased 则为 `purging`）· **Ban** 期望可达 `partial_failed`（externals `retention_pending`） |
| FAULT-02 fence-revive | 有 | 须三表 count 保持 0 + 写拒绝（见 C-REVIVE） |
| FAULT-03 idempotent re-purge | 有 | OK |
| NEG-01 unauthorized / forged JWS / GUC-only | 有 | 与前刀 NEG 编号对调（前刀 NEG-01=DELETE 503）——可接受，须全覆盖 |
| NEG-02 cross-tenant | 有 | 须 SQL 证明他主体三表计数不变 |
| NEG-03 public DELETE 503 | 有 | pin |
| BOUND-01 concurrent claim | 有 | 缺：**purge 中途并发 PostgresSaver 写入**（复活/半残）→ 升条件 C-RACE |
| HP-052-CKPT-01 last | 有 | 三表 admin count=0 · ledger `erased` · request ≠`completed`（期望 `pending_external`） |

**Missing → conditions（非本轮 docs 阻断，编码必须收）**：

- 零 checkpoint 主体 **no-op**（COUNT 已 0 · 无假 erased / 无风暴）
- purge 后 live graph **resurrection**（与 FAULT-02 合并亦可，但须显式）
- **per-table** `SELECT count(*) … WHERE thread_id=?` 分表断言（勿只 assert 合计）
- blobs/writes 孤儿与 pending writes：三表同事务 + residual 已覆盖；prove 仍须分表可见

### Prove / 工程门

| 门 | 计划 | 判 |
|----|------|----|
| CMD `pnpm uc052:checkpoint-physical:prove` | tip `package.json` **无**同名；≠ `privacy-erasure:prove` / `uc052:internal-erasure:prove` | **无碰撞** |
| C-CASECOUNT | harness §3/§4 | 须 code `requiredCaseIds` · skip→EXIT≠0 |
| porcelain dirty guard | success criteria | 对齐前刀 `uc052-internal-erasure.proof.ts` L188–190 |
| runner committed SHA | success criteria | OK |
| tsc `packages/db` baseline **6** · zero new | success criteria | OK（前刀曾因 +25 FAIL） |
| Matrix move | **仅** UC-052 deletion（checkpoint sink）诚实加强 · Ban 050/051/export/covered | OK |
| Ban wash | `privacy-erasure:prove` EXIT=0 ≠ 本 gap 关 | OK |

### 编码条件（刀 PASS 的条件 · Ban 当授权）

1. **C-AUTHZ**：物理 purge **仅**经 UC-052 已鉴权链（JWS→consume→claim/0091）· Ban 新 HTTP · Ban app_role 重 GRANT begin · Ban 绕过 ledger 直调 purge。  
2. **C-SQL-3TABLE**：admin 对 `checkpoint_writes`/`checkpoint_blobs`/`checkpoints` **分别** count=0（subject `thread_id`）· NEG-02 异租户不变。  
3. **C-REVIVE / C-RACE**：FAULT-02 +（建议）BOUND/FAULT：purge 后写拒且 count 保持 0；中途并发 saver 写入不得留下残行或假 `erased`。  
4. **C-FAULT-CASE / C-LEDGER**：目标成功前不得 `erased`；失败→`failed` 可重申领；请求终态循 **0096 L576–583**（happy/`pending_external`；Ban `completed`；Ban 期望可达 `partial_failed`）。  
5. **C-CASECOUNT / C-PORCELAIN / C-SHA / C-TSC**：case 全跑 · dirty worktree EXIT≠0 · receipt 记 committed SHA · tsc 相对 baseline 6 **零新增**。  
6. **C-ZERO-CKPT**：零行主体 no-op 诚实。  
7. **C-NO-DIGEST-TRIM**：目标集/签名 digest 全量（含 checkpoint 物理 + externals）· Ban 裁剪洗绿。

---

## 3. 分项与总判

| Item | 结论 |
|------|------|
| Tip 4 docs only @`41cffea` on origin | **PASS** |
| Ruling 1 annotation | **FAIL**（B1-MATRIX · B2-CITE） |
| Knife / NHP / prove 计划 | **PASS**（C-AUTHZ…C-NO-DIGEST-TRIM） |
| Pins | **retained** |
| Peer | `c0f0a51` FAIL · **alone ≠ dual** · 不代签 |

**Blockers**：B1-MATRIX · B2-CITE → **Ban 编码授权**直至 docs-only 闭合。  
**Conditions**：上表 C-*（刀编码期硬门；非对本 tip docs 再改的前置，但授权前须写入 harness/prove 契约）。

**总判**：Item1 FAIL → **FAIL**。闭合 B1/B2 前 **Ban coding / Ban SSOT nail / Ban invent covered / Ban open DELETE**。

Verdict: FAIL

---

## Item 1 re-review（matrix annotation + cite script · mw-e2e-ha）

**Reviewer**: `mw-e2e-ha` · **Date**: 2026-09-23 (~21:20 PT)  
**Scope**: Line B Item 1 only · clears prior **B1-MATRIX** / **B2-CITE** · **≠** knife coding auth · **≠** mw-privacy-int dual（peer r2 `bf3ced1` 不代签）  
**Tips under review**: docs `d147ea1` + `b55b222` · script `4ebdc28` + `89ae929` + `e09d56e`  
**Baseline prior FAIL**: receipt @`2bc9da9` tip then `41cffea` · last line `Verdict: FAIL`

### Tips / chain / origin

| Tip | Full SHA | Files (name-status) | Product code? |
|-----|----------|---------------------|---------------|
| `d147ea1` | `d147ea1de47179e7ab4e418fd95a54a5c69aff77` | `M ai-docs/delivery/e2e-requirement-coverage-matrix.md` | **NO** |
| `b55b222` | `b55b222fee9c64a2c4c1afe49c0dfa30db8f65e3` | `M …/e2e-requirement-coverage-matrix.md` | **NO** |
| `4ebdc28` | `4ebdc283dc30a1d1803e422d5d727a9d2a6b0671` | `M scripts/eval-harness-matrix-cite.proof.mjs` | **NO** |
| `89ae929` | `89ae9299d1e9cec911854de657eff1a3446577fe` | `M scripts/eval-harness-matrix-cite.proof.mjs` | **NO** |
| `e09d56e` | `e09d56e74cd6f58cf4ef3efa3573b03448f5fc77` | `M scripts/eval-harness-matrix-cite.proof.mjs` | **NO** |

- `git fetch` EXIT=0 · `41cffea..e09d56e` **includes** all five claimed commits (plus unrelated Line A / peer receipts in between) · `e09d56e` **ancestor of** `origin/feat/mysql-schema-skeleton` (**on origin** YES).
- Worktree: `git worktree add /workspace/mw-rv-e09d56e e09d56e` · parity WT `/workspace/mw-rv-41cffea` @`41cffea` · removed after prove.

### CMD|EXIT（clean WT @e09d56e）

| CMD | EXIT | Key |
|-----|------|-----|
| `pnpm install --frozen-lockfile` | **0** | lock up to date |
| `pnpm eval-harness-matrix-cite:prove` | **0** | live 050–052 NEG=`honesty-pin` FAULT=`gap` BOUND=`blind` ADV=`blind` · row-id exact PASS · UC-018 conservative≡legacy PASS |
| `pnpm eval-uc-e2e-001-002-cite:prove` | **0** | static cite |
| `pnpm uc018:covered-lift-reassess:prove` | **0** | `columns NEG=partial FAULT=partial BOUND=partial ADV=partial PERF=partial LOAD=partial` |
| `pnpm uc018:covered-criterion:prove` | **0** | `canHonestlyFlip=false` · pins retained |
| `pnpm uc018:adv:prove` | **0** | 76 ADV cases green · ADV alone ≠ covered |
| Rank-parser self-tests | **embedded in cite prove** | assert via `fail()`→`exitCode=1`（非 print-only） |
| Adversarial mutation (temp): honesty-pin rank ≥ partial | **1** | FAIL `STATUS_RANK: honesty-pin < partial` · FAIL live NEG |
| Adversarial mutation (temp): `cellStatusConservative`→always `partial` | **1** | FAIL merged gap/blind/honesty-pin · FAIL unparseable→unknown · FAIL live facets |
| Manual prefix/min probes (node inline) | **0** | 16/16 · `UC-E2E-05` / `UC-E2E-050` fail-closed vs `050–052` · garbage/`??`/`||`→`unknown` |

### UC-018 parity（Line A shared surface）

| Surface | @`41cffea` | @`e09d56e` | Diff? |
|---------|------------|------------|-------|
| Matrix §1.0.1 `| UC-E2E-018 |` cells | identical text | identical | **NONE** (`diff` empty) |
| `uc018:covered-lift-reassess:prove` printed columns | `NEG=partial FAULT=partial BOUND=partial ADV=partial PERF=partial LOAD=partial` EXIT=0 | same string EXIT=0 | **NONE** |
| `cellStatus` in `uc-e2e-018-covered-lift-reassess.proof.mjs` | legacy first-hit | **byte-identical** function body | **NONE** |
| Cite `cellStatusLegacy018` vs `cellStatusConservative` on live UC-018 NEG/FAULT/BOUND/ADV | n/a（pre-`4ebdc28` cite had **no** facet parser；`both.includes` only） | all four **partial≡partial** | **NO reading change** for UC-018 inputs |
| Cite `both.includes(row)` | present @`41cffea` / `4ebdc28^` L368 | **removed**；replaced by `textCitesExactRowId` / `matrixHasExactRowId` | cite mechanics changed；**UC-018 column statuses unchanged** |

**UC-018 parity result**: **PASS / no unexplained change**. New conservative parser is asserted ≡ legacy018 on UC-018 plain + live facet cells (`scripts/eval-harness-matrix-cite.proof.mjs` ~L606–648 @`e09d56e`).

### Matrix reading（§1.0.1 L124 @`e09d56e` via `git show`）

Human-readable cells（annotation closes bare-partial wash）:

| Facet | Cell text (abbrev) | Human min residual | Parser |
|-------|--------------------|--------------------|--------|
| NEG | `**partial**（**UC-052 deletion only**; 050/051 still **partial**/honesty-pin）` | 050/051 **honesty-pin**（not elevated 052-only partial） | **honesty-pin** |
| FAULT | `… still **gap**` | 050/051 **gap** | **gap** |
| BOUND | `… still **blind**` | 050/051 **blind** | **blind** |
| ADV | `**blind**` | **blind** | **blind** |

- **B1 cleared**: outer `partial` no longer readable as “050/051 all partial” without reading the UC-052-only + still-residual clause；parser mins to residual（conservative）.
- Evidence consistency: UC-052 deletion elevated only after dual EOR `3e39c1e`/`08d54f8`（objects present）· Ban elevate UC-050/051/export · public DELETE **503** · §1.1 stays **partial（UC-052 deletion only）** · coveredCount **8**.
- **`honesty-pin`**: defined in matrix §0.5 legend（L45 + L76 @`e09d56e`）· “静态诚实钉 … 本绿 ≠ 已关”.
- Rank `honesty-pin`(4) **strictly below** `partial`(5): **conservative**（min(partial,honesty-pin)=honesty-pin）· asserted in cite self-test.
- **PERF/LOAD**: §1.0.2 has **no** UC-E2E-050–052 row at `41cffea` **or** `e09d56e`（pre-existing absence；implicit blind / §1.0.3 “无一行全绿”）· **not** a reopen of B1/B2.

### Cite script source review（`scripts/eval-harness-matrix-cite.proof.mjs` @`e09d56e`）

- **Exact row id**: `rowIdVariants` only swaps digit-range separators en-dash↔hyphen（L357–365）· `matrixHasExactRowId` equality / annotation suffix / ` /` merge（L385–394）· **not** substring · self-test: `UC-E2E-050` **does not** match cell `UC-E2E-050–052`；prefix `UC-E2E-05` fail-closed（manual probe）.
- **`textCitesExactRowId`**: regex + `(?![0-9\u2013\-])` bans continuation inside merged id（L400–407）.
- **`both.includes`**: **gone**（B2 cleared）.
- **Min-rank**: `STATUS_RANK` unknown<blind<gap<case-only<honesty-pin<partial<covered（L418–425）· `cellStatusConservative` collects still-residuals + bold/word hits · `minStatus`（L452–471）.
- **Unparseable → unknown**（lowest）· empty/`??`/`||`/garbage cannot become partial/covered（probes + self-test L605）.
- **Fail-open hunt**: no default `'partial'` · no `.every` on empty · `partial→covered` mins to **partial**（conservative）· residual: `\bpartial\b` also matches English **"not partial"**（same shape as legacy018 L433）—**live matrix vocabulary unused**；logged as **C-WORD-NEG** residual，**not** B1/B2 reopen.
- Tests **assert** via `fail()` setting `exitCode=1`（L347）· mutations above prove EXIT=1 on regression.

### Blockers / conditions

| ID | Status |
|----|--------|
| **B1-MATRIX** | **CLEARED**（per-cell UC-052-only + residual annotation · parser mins） |
| **B2-CITE** | **CLEARED**（exact row id · conservative cellStatus · tests） |
| **New Item1 blockers** | **NONE** |
| **C-WORD-NEG** | Residual note only（word-boundary “not partial”） |
| Knife-plan conditions（prior PASS-with-conditions） | **STILL BIND coding** · not waived by this Item1 PASS: **C-SQL-3TABLE**, **C-ZERO-CKPT**, **C-REVIVE/C-RACE**, **C-FAULT-CASE/C-LEDGER**（0096 L576–583）, **C-AUTHZ**, **C-CASECOUNT/PORCELAIN/SHA/TSC(baseline 6)**, **C-NO-DIGEST-TRIM** |
| mw-privacy-int dual | **Do not sign** · peer r2 PASS is their receipt only |

### Pins（restated · unchanged）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **DELETE=503** · **UC-018/§1.1 partial** · **alone≠dual**

### Item1 verdict scope

**PASS** clears **B1/B2 only**. Knife coding authorization remains subject to knife-plan conditions + mw-privacy-int dual. Ban invent covered · Ban open DELETE · Ban wash privacy-erasure:prove as checkpoint gap.

Verdict: PASS
