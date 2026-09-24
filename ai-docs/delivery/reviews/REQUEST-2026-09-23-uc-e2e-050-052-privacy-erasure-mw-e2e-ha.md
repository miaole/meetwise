# REQUEST — **UC-E2E-050–052 privacy erasure · GAP-PRIV-ERASURE-CLOSURE** · pre-exec · mw-e2e-ha

**Expert**: `mw-e2e-ha`（E2E / isolated-prove / NHP 完整性 · adversarial pre-exec）  
**Pair**: `REQUEST-2026-09-23-uc-e2e-050-052-privacy-erasure-mw-privacy-int.md`（peer · **PENDING / empty stub at gate** · alone≠dual · **不代签** privacy-int）  
**Date**: 2026-09-23 (~20:16 PT)  
**Line**: **B**  
**Knife**: UC-E2E-050–052 privacy erasure · first knife = **UC-052 internal authorized erasure** · `GAP-PRIV-ERASURE-CLOSURE`  
**Cited（fresh re-read · not rubber-stamp）**:  
- `harness/uc-e2e-050-052-privacy-erasure.md`（as of `cd5a4de` via `git show`）  
- `uc-e2e-050-052-privacy-erasure.slice.md`  
- `e2e-requirement-coverage-matrix.md` §0.5 / §1.0 / §1.1 UC-E2E-050–052 rows  
- `testing/conventions/e2e-directory-contract.md`  
- `architecture/ai/privacy-deletion-sink-inventory.md` §3  
- `scripts/run-e2e-isolated.mjs` · `package.json` privacy prove scripts  
- real sinks: `privacy.controller.ts` / `privacy.service.ts` · migrations `0047`/`0048`/`0058`/`0091`/`0096`/`0125` · `apps/api/test/privacy-erasure-http.proof.ts` · `apps/worker/src/privacy-erasure-worker.ts`  
- NHP matrix rows `NHP-050-NEG-01` / `NHP-050-FAULT-01`  
**REQUEST tip（review against · MUST MATCH）**: `cd5a4de874797a49af77879b390215c248f137a6` / `cd5a4de`  
**Author of tip**: `meetwise-core` · subject `docs(privacy): REQUEST UC-E2E-050-052 privacy erasure Line B (pre_dual)`  
**Base / parent**: `f07663ae6b3279eaa9aa1ec9dca2216a62ff4379` / `f07663a` · ancestor **YES**  
**Branch**: `feat/mysql-schema-skeleton` · repo `/workspace/meetwise`  
**Status claimed by REQUEST**: **`draft:awaiting_pre_exec_dual`**

---

## 0. Verdict（top）

| Key | Value |
|-----|-------|
| **Verdict** | **PASS** |
| **blockers** | **无阻塞**（tip MATCH · docs-only · NHP 主族齐全 · 首刀 UC-052 deletion only · DELETE=503 保留 · pins 保留 · matrix 本 tip 未动 · 见 CONDITIONS） |
| **authorizeCoding** | **false** · Do NOT authorize coding |
| **authorizeProve** | **false** · Ban prove this open |
| **authorizeNail** | **false** · Ban harness self-nail · Ban flip matrix covered |
| **claimUc050051052Covered** | **false** |
| **openPublicDelete** | **false** · DELETE **503** retained |
| **haStatus** | **NOT_HA** |
| **releaseEvidence** | **false** |
| **claimProductionHA** | **false** |
| **gR45Closed** | **true** retained |
| **coveredCount** | **8** retained |
| **ms3EqualsR4Closed** | **false** retained |
| **Stack** | **PG-retained** |
| **alone≠dual** | **YES** · 不代签 `mw-privacy-int` |
| **Dual PASS ≠ coding** | **YES** |
| **Dual PASS ≠ covered** | **YES** |
| **Dual PASS ≠ open DELETE** | **YES** |
| **Dual PASS ≠ nail** | **YES** |

**Explicit**: Do NOT authorize coding · Do NOT run planned prove · Do NOT open public DELETE · Do NOT flip UC-050/051/052 covered · Do NOT edit shared SSOT this open · Do NOT touch Line A / Meridian / `.env*` · Ban自批 · alone≠dual.

---

## 1. HEAD / tip / ancestry / docs-only（gate）

| Check | Observed | Ruling |
|-------|----------|--------|
| REQUEST tip `cd5a4de` | At first fetch **exact HEAD**；gate write 时 HEAD 已前进至 Line A `1cae8f6`（`feat(e2e): UC018 covered-criterion…`）· `git merge-base --is-ancestor cd5a4de HEAD` **YES** · 审阅对象 = **`git show cd5a4de:<path>`** | **MATCH** · note HEAD moved |
| Author tip | `meetwise-core <meetwise-core@users.noreply.github.com>` | **PASS** |
| Subject | `docs(privacy): … Line B (pre_dual)` | docs REQUEST · not coding · not prove |
| Parent `f07663a` | ancestor of tip **YES** | **PASS** |
| `git show --stat cd5a4de` | **4 files · ai-docs only** · harness + slice + 2 dual stubs · `+381` · **A** | **docs-only PASS** |
| Tip name-status | **no** `scripts/` · **no** `src/` · **no** `package.json` · **no** matrix | **PASS** |
| Matrix diff in tip | empty（本 tip 未改 `e2e-requirement-coverage-matrix.md`） | **PASS** · Ban invent matrix move |
| Peer stub | `…-mw-privacy-int.md` still **PENDING** empty | **HOLD** · 不代签 |
| Line A concurrent | `1cae8f6` after tip · Ban cite Line A evidence into this Line B | **PASS** · Ban wash |

**CMD|EXIT（recorded）**:
1. `git fetch origin` → **EXIT:0**
2. `git rev-parse HEAD`（初）→ `cd5a4de…` **EXIT:0**
3. `git merge-base --is-ancestor cd5a4de HEAD` → **EXIT:0**（YES）
4. `git show --stat cd5a4de` → **EXIT:0** · 4 ai-docs files
5. `git show --name-status cd5a4de` → **EXIT:0** · A×4 · no product
6. `git show cd5a4de -- matrix` → empty **EXIT:0**
7. `git merge-base --is-ancestor f07663a HEAD` → **EXIT:0**
8. `rg` / `Read` inventory paths → **EXIT:0**（见 findings）
9. gate re-check `git rev-parse HEAD` → `1cae8f6…` **EXIT:0** · tip still ancestor

**Gate**: tip **MATCH** · **docs-only** · matrix untouched · **未触发 BLOCK**.

---

## 2. Findings (a)–(d)

### (a) Non-happy completeness and ordering · file:line

| Case | Harness cite | Adjudication |
|------|--------------|--------------|
| **FAULT-01** partial sink failure | harness L162 · L138 | **PRESENT** · no false erased/completed · ledger partial · retry resumes。**缺口**：未钉死真实枚举 `privacy_deletion_target.status='failed'` + request `partial_failed`（0047 L35–57）— **CONDITION** |
| **FAULT-02** retry idempotency | L163 | **PRESENT** · stable target ids/counts · no double effects |
| **NEG-02** unauthorized | L164 | **PRESENT** · refuse · zero side effects |
| **NEG-03** cross-tenant | L165 | **PRESENT** · A cannot erase B · B intact |
| **BOUND-01** concurrent | L166 | **PRESENT** · single winner / serialize · no dup corruption。**偏软**：未显式 assert 无 deadlock / 单 ledger request — **CONDITION** |
| **NEG-01** public DELETE 503 | L167 · controller L51–54 · service L53–56 | **PRESENT** · retained pin · real 503 |
| **HP-050-01** happy last | L168 | **PRESENT** · ordered last · Ban UC covered |
| Ordering | §3 table FAULT→…→NEG-01→HP | **PASS** · happy last |

**Missing / deferred（非阻塞 · CONDITIONS）**:
- **Already-erased subject** 再请求：未独立成案（FAULT-02≠completed 后再擦）→ 编码前补 NHP 或并入 FAULT-02 边界
- **Residual / later sinks**（vector 占位、OSS/Redis/Langfuse、backups、`user_memory`、trace）：harness §5 L187–188 **已披露 gap** · 不得计入 first-knife sinks
- **Audit log retention vs erasure** · **TTL**：未入 NHP · 归后刀 / privacy-int 域旁证 · 本刀不洗成 covered

**Ruling (a)**: 主 NHP 族齐全 · 顺序正确 · **无阻塞** · 缺案作 CONDITIONS。

### (b) DB-level per-sink asserts real · file:line

| Check | Evidence | Ruling |
|-------|----------|--------|
| In-scope sinks named | harness L136：`checkpoint_rows` + `interview_job_payload` + `event` + `report` + `ai_graph_run` + `interview_answer_artifact` | **match** 0125 CHECK（`0125_…sql` L38–41）+ inventory §3.1 |
| Ledger tables real | `privacy_deletion_target` / `privacy_deletion_receipt`（0091 L84+）· request `partial_failed`（0047） | **real PG** |
| Physical purge exists | 0048/0058/0092/0096 resolvers · inventory L80–85 | **real** · Ban invent |
| Assert style in plan | L168/L178「DB-level read=0 per sink」 | **intent PASS** · NHP 行未逐表列出 SQL — **CONDITION**：编码时必须对**每 sink** SQL 断言物理行 gone/tombstoned + ledger status；禁仅 API/内存 flag |
| Non-PG sinks | L105–108 · §5 L188：redis/oss/langfuse/backups/Qdrant **gap / STOPPED** | **disclosed** · faked 不得计入那些 sinks |
| Placeholder | INT `vector` · memory_event/cache/trace **stub** | **honest refuse** · Ban fake erased |

**Ruling (b)**: 目标表真实 · 非 PG 已披露 · **无阻塞** · 逐 sink SQL 清单 = coding CONDITION。

### (c) `pnpm privacy:erasure:prove` via run-e2e-isolated · file:line

| Check | Evidence | Ruling |
|-------|----------|--------|
| Wire plan | harness L178：`run-e2e-isolated.mjs privacy:erasure:prove:raw` · PG only · Ban MemorySaver/MySQL/Qdrant-required | **PASS** intent |
| Isolation | `run-e2e-isolated.mjs` L21「独立临时 PostgreSQL cluster」· prove-shell 车道（directory-contract L44） | **PASS** · fresh DB per run · 无共享业务库 |
| Fail if NHP skipped | L178「EXIT=0 only if all NHP expectations in §3 hold」 | **intent PASS** · **缺显式 case-count / requiredCaseIds assert** — **CONDITION**（prove 必须因跳过非快乐而 FAIL） |
| Receipts | L158：`ai-docs/delivery/receipts/uc050-052-privacy-erasure/` · tracked · redacted · Line B + git SHA | **PASS** named |
| Uncommitted-runner guard | harness **未点名**；UC018 先例：uncommitted runner ≠ evidence of record | **CONDITION**：编码须记 runner commit SHA；uncommitted 不得当 evidence of record |
| Script name collision | 计划 `privacy:erasure:prove` vs 现存 `privacy-erasure:prove`（package.json L260） | **CONDITION**：命名区分 · Ban 洗旧 checkpoint prove 成本刀绿 |
| Public DELETE regression | L179 retained `privacy-erasure:http:prove` | **PASS** |

**Ruling (c)**: 隔离路径诚实 · **无阻塞** · case-count / uncommitted / 脚本名 = CONDITIONS。

### (d) Matrix-move honesty · file:line

| Check | Evidence | Ruling |
|-------|----------|--------|
| Tip matrix diff | none | **PASS** · Ban edit SSOT this REQUEST（harness L13） |
| Current §1.0 | matrix L124：UC-E2E-050–052 NEG **partial** · FAULT **gap** · BOUND/ADV **blind** | unchanged |
| Current §1.1 | L182：**partial** / **blocked** · 本绿≠删除闭环 · 非 covered | unchanged |
| Planned nail delta | harness L203–205：honesty touch · Ban flip covered · register NHP · elevate FAULT-01 if proved | **mostly honest** |
| Wash risk | 聚合行 UC-E2E-050–052 · 「elevate NHP/FAULT」可能洗 050/051/export | **CONDITION**：nail 时**仅** UC-052 **deletion** 面 / `NHP-050-*` 列可动（登记→**case-only**；prove+post-dual 后可 **partial**）；**禁** export · **禁** UC-050/051 · **禁** covered · DELETE=503 列保留 |

**Ruling (d)**: 本 tip 未假移矩阵 · **无阻塞** · nail 列范围 COND。

---

## 3. BLOCKERS vs CONDITIONS

### 阻塞项（pre-exec）

**无阻塞**

（抽样支撑：docs-only tip · NHP 主七案齐 · happy last · UC-052 deletion only · DELETE=503 retained · pins · matrix 未动 · sinks∈真实 CHECK · non-PG disclosed）

### CONDITIONS（for coding / post-prove · 非本开授权）

1. **C-CASECOUNT**: `privacy:erasure:prove` 必须断言 required case IDs / count；跳过任一 NHP → **非零退出**（禁 happy-only 假绿）。
2. **C-SQL-PER-SINK**: 每 in-scope sink 写明物理表 + SQL read=0/tombstone + `privacy_deletion_target`/`privacy_deletion_receipt` status；FAULT-01 钉 `failed` / request `partial_failed`。
3. **C-ALREADY-ERASED**: 补「已 erased subject 再请求」幂等/拒绝案（或并入 FAULT-02 边界）。
4. **C-BOUND-HARDEN**: BOUND-01 显式无 deadlock · 单一有效 erasure/ledger · 无重复 target。
5. **C-UNCOMMITTED**: receipts 记 git SHA；uncommitted runner ≠ evidence of record（对齐 UC018 教训）。
6. **C-SCRIPT-NAME**: 新 CMD 与现存 `privacy-erasure:prove` 区分；禁洗旧绿。
7. **C-MATRIX-NAIL**: nail 仅动 UC-052 deletion / NHP-050-*（case-only→partial）；禁 export/050/051/covered；503 保留。
8. **C-NON-PG**: faked/非 PG sinks 不得计入；gap 面保持 gap。

---

## 4. Pins（retained · Ban flip）

| Pin | Value | Ruling |
|-----|-------|--------|
| `haStatus` | **NOT_HA** | **PASS** |
| `releaseEvidence` | **false** | **PASS** |
| `claimProductionHA` | **false** | **PASS** |
| `gR45Closed` | **true** | **PASS** |
| `coveredCount` | **8** | **PASS** |
| `ms3EqualsR4Closed` | **false** | **PASS** |
| Stack | **PG-retained** | **PASS** |
| Public DELETE | **503** retained | **PASS** |
| Line A | out of scope · Ban cite | **PASS** |

---

## 5. Scope / dual meaning

| Statement | Ruling |
|-----------|--------|
| This open | pre-exec docs gate only · `draft:awaiting_pre_exec_dual` |
| First knife | Internal authorized erasure · **UC-052 deletion** · in-scope PG sinks + ledger |
| Not this knife | export · UC-050 · UC-051 · open DELETE · covered · HA · INT-01 cutover · Line A |
| Dual PASS ≠ | coding · prove · covered · open DELETE · nail · next knife |
| alone≠dual | **YES** · peer `mw-privacy-int` **PENDING** · 不代签 |

---

## 6. 三行中文摘要

1. **Verdict=PASS · 无阻塞**：tip `cd5a4de` MATCH（HEAD 后移 Line A 仍为祖先）· docs-only · NHP 主族齐 · 首刀仅 UC-052 内部删除 · DELETE=503/pins 保留。  
2. **条件非阻塞**：编码须 case-count 失败闸、逐 sink SQL、已擦幂等、BOUND 硬化、uncommitted 收据诚实、脚本名避撞、nail 仅动 052 deletion 列。  
3. **alone≠dual**：本收据不代签 `mw-privacy-int` · Dual PASS ≠ coding ≠ covered ≠ open DELETE。

---

**STOP** · Ban coding · Ban prove · Ban flip covered · Ban open DELETE · Ban sign peer.
