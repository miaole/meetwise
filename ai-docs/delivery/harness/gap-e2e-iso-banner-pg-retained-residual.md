# Harness — **GAP-E2E-ISO-BANNER-PG-RETAINED residual · banner ≠ PG-retained truth**（Line AL · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · docs gate only · ≠ sole cutover）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban cutover narrative · Ban rewriting business truth · Ban claiming sole cutover · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`71ad2a7`** / full `71ad2a7fccaa3dd43b47e2c54b9823890aaabdf9`（wave AI–AM start · includes Line AE nail `3409862` / `340986214ad2a32b1cb678caa612c6a50f305861` as ancestor · tip advanced past AE by Line AG re-PRE2 review commits only · Ban touch AG）
**Wave**: Lines **AI–AM** REQUEST wave（5 independent docs REQUEST commits stacked sequentially · this = Line **AL**）
**Experts**: `mw-e2e-ha` + `mw-privacy-int`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · status `draft:awaiting_pre_exec_dual`
**Knife**: **GAP-E2E-ISO-BANNER-PG-RETAINED residual（Line AL）**——Line N 对齐刀（ADR 补注 + `E2E_ISO_STACK_NOTE` 纯新增）nail 之后，**R5-MARKED-RED banner 字符串本体仍写 MySQL+Qdrant+Redis 为 intended sole**；本刀开残余 docs gate，未来 **可能** 授权 banner-string align only（另需 AUTHORIZE）
**Gap id**: **`GAP-E2E-ISO-BANNER-PG-RETAINED`**（`gap-bug-backlog.md:63` · P1 · Line B N1 named gap · 行状态本刀不改）

## 0. 为何新开文件（Line N 身份保全）

`harness/gap-e2e-iso-banner-pg-retained.md` / `gap-e2e-iso-banner-pg-retained.slice.md` 为 **Line N** 文件（REQUEST `8cd5ed2` → align `fe058fa` / `fe058fa673fc95b93a88f4a83809e3418dc96629` → POST dual `56ed11c`（mw-e2e-ha）+ `e75d418`（mw-privacy-int）→ NAIL `a778255` / `a778255c8a600304001207a514621323e77da3d2`）。本刀 **不覆盖 Line N 身份 · 不声称 Line N nail 属于本刀**，新开 `harness/gap-e2e-iso-banner-pg-retained-residual.md`，旧文件只读引用。

## 1. 张力如实陈述（只读 @ `71ad2a7` · 零改写）

**(a) backlog `gap-bug-backlog.md:63` 逐字要点**：「`run-e2e-isolated.mjs` R5-MARKED-RED banner 仍写 MySQL+Qdrant+Redis 为 intended sole · **≠** `adr-postgres-retained` 真相」·「收据/审查 **不得** 引用该 banner 作 stack truth；SOLE_STACK 对齐另包」· e2e / privacy · Line B N1 named gap。

**(b) `adr-postgres-retained.md` Decision（hard · 2026-09-17）**：1 Relational = **Postgres**（NO business DB migration to MySQL）· 2 **PostgresSaver** · 3 Vector = **pgvector**（NO cutover to Qdrant as sole）· 4 `packages/db-mysql` / `compose.mysql-local` / qdrant-store = historical/experimental only。`:39` Line N 补注：isolated banners = **test infrastructure narration**，isolated test PG ≠ product stack change ≠ cutover evidence；stale `sole stack = MySQL+Qdrant+Redis` wording = known named gap（补注所引 `@L1694-1697` / `@L2068` 为 Line N 时行号 · 已漂移）。

**(c) `scripts/run-e2e-isolated.mjs` @ `71ad2a7`（行号执行时重核）**：

| 位置 | 内容（摘） | 读法 |
|------|------------|------|
| `:5` 头注释 | `Intended sole default = mysql-qdrant-redis (MySQL+Qdrant+Redis)` | stale-era 叙事 |
| `:1674` | `const SOLE_STACK = 'mysql-qdrant-redis';` | dual-track 代码路径常量 · **非** 本刀对象（SOLE_STACK 对齐另包） |
| `:1765-1768` | `[R5-MARKED-RED] … (dual-track; intended sole default=${SOLE_STACK}) … (sole stack = MySQL+Qdrant+Redis). Local green ≠ RAG migrated. …` | **张力本体** · banner 字符串仍宣示 intended sole = MySQL+Qdrant+Redis |
| `:2139` / `:2141` | `E2E isolated PostgreSQL: …` + Line N 新增 `E2E_ISO_STACK_NOTE … product stack pin = adr-postgres-retained.md` | Line N 已落补注 · 与 `:1765` 并存 |

**结论（docs gate）**：banner ≠ PG-retained truth；Line N 只补注不改写，`:1765-1768` 字符串原样 → backlog `:63` 仍为 open named gap。

## 2. 本刀目标（docs gate only）

| 今日 | 本 REQUEST | 未来（**须另 AUTHORIZE** · 本刀不授权） |
|------|------------|------------------------------------------|
| banner 字符串 stale · ADR 补注 + STACK_NOTE 已落 | docs：张力三方引用 + 残余范围界定 + dual stubs | **可能** banner-string align only（仅改 `:1765-1768` 文案为不宣示 sole 的措辞 · 零行为变更 · `node --check` · 零 e2e 运行）|

**明确非目标**：Ban 改 `SOLE_STACK` 常量 / allowlist / dual-track 逻辑 · Ban 删 R5-MARKED-RED（BUG-FAKE-R5 marked-red 须保留）· Ban 改 ADR Decision · Ban cutover narrative。

## 3. 验收判据草案（供 PRE dual 审 · 不执行）

1. 未来 align diff 仅限 banner 字符串 hunk；ADR Decision 逐字不变。
2. 文案须同时保留 `releaseEvidence=false · Not HA · Local green ≠ RAG migrated` 语义。
3. 不得出现「已迁 PG」「sole = Postgres cutover 完成」等 cutover 叙事。
4. backlog `:63` 行状态只在 post-align dual + 协调方授权后另起更新 · 本 REQUEST 零 SSOT edit。

## 4. Ban 列表

- **Ban cutover narrative** · **Ban rewriting business truth**（ADR Decision / PG-retained 不动）· **Ban claiming sole cutover**（任一方向：MySQL+Qdrant 或 PG）
- Ban 覆盖 Line N 文件身份 · Ban 声称 Line N nail · Ban 改 `SOLE_STACK` 逻辑 · Ban 删 marked-red
- Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban SSOT edit of matrix/backlog（REQUEST = zero matrix/backlog edits）· Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban 碰 Line AG `nhp-001-adv-01*` / `REQUEST-2026-10-06-nhp-001-adv*` 文件 · Ban 改写既有 nailed harness 的 nail 状态 · Ban product/infra code

## 5. Non-claims

Not a pass · not aligned · not closed · not cutover · not nail · not HA · not `releaseEvidence=true` · docs gate only · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · backlog `:63` open named gap · STOP

*Harness · GAP-E2E-ISO-BANNER-PG-RETAINED residual · banner ≠ PG-retained truth · Line AL · 2026-10-06 · draft:awaiting_pre_exec_dual · Ban coding until PRE BOTH PASS + AUTHORIZE · alone ≠ dual · STOP*
