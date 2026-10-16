# Harness — **NHP-001-BOUND-01 · UC-001 BOUND blind→case**（Line AB · **`post_prove_dual_pass`** · 主链 stays blind · EXIT0≠covered）

**Status**: **`post_prove_dual_pass`**（Line AB nail 2026-10-06 · prove tip NAILED TO `f8cdc82` · CODE `6e96cf5` · EXIT 0 17/17 · POST dual e2e-ha `b060e4e` + rag-route `5adb14f` PASS · EXIT0≠covered · coveredCount=8）
**History**: ~~`draft:awaiting_pre_exec_dual`~~（L0 docs REQUEST `c6dd1a6`）→ PRE dual PASS `d448da9`/`64252be` → coding+prove `6e96cf5`/`f8cdc82` → POST dual PASS → nail
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`94a8b2a`** / full `94a8b2aead1b7087115a0ac1af9f790ef2a8f177`（assigned Line AB start tip `f43bea1` / `f43bea12fc7f2e28e7bb0052b6a80811eac47e91` · rebased over Line Z/AA/AC REQUEST landings · Ban touch Z/AA/AC）
**Knife**: **NHP-001-BOUND-01（Line AB）· 黄金路径 BOUND · 幂等键重复 begin · blind→case/prove 显式化**
**Gap id**: **`GAP-UC001-BOUND-01`**（本刀具名 · 服务 NHP-001-BOUND-01；不发明 covered）
**Case id**: **`NHP-001-BOUND-01`**
**Row**: **`UC-E2E-001`** BOUND 列 · not UC-E2E-003（本刀未选 i18n）· **Ban** UC-E2E-018 / 052 / 025 / 004 / 011
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding · Ban live · Ban fake-green suite

## 选刀（NHP-001-BOUND-01 vs ADV / i18n / 015-FAULT · 诚实裁决）

| 候选 | 矩阵读法 | 优先级 | 裁决 |
|------|----------|--------|------|
| **NHP-001-BOUND-01** | 矩阵 `:112` BOUND=**blind**/case-only；NHP `:38` case-only（UC-017 旁证 ≠ 001）；Line Y 已落 NEG 真证据后 **下一黄金路径非快乐面** | 黄金路径 P0-3 | **本刀选择** |
| NHP-001-ADV-01 | 矩阵 `:112` ADV=blind/case-only；NHP `:39` 委派 031/032 | 黄金路径 ADV | 本刀**不选**（BOUND 更可独立成 001 专用收据；ADV 另刀） |
| UC-003 / i18n blind | 矩阵 `:114` NEG=gap · FAULT/ADV blind；P1 | i18n P1 | 本刀**不选**（P0 > P1） |
| NHP-015-FAULT-01 | NHP `:80` blind→case-only；P0-6 摄取 | 摄取 FAULT | 本刀**不选**（黄金路径 BOUND 优先） |
| UC-018 / 052 / 025 / 004 / 011 | 他线已覆盖 / 禁选 | — | **Ban selecting**（本 REQUEST 硬禁） |

**选择声明**：Line AB = **NHP-001-BOUND-01**（golden-path BOUND blind→case）。理由：Line Y 已钉 NEG case 证据后，BOUND（幂等键重复 begin → 单 ConsumptionRecord / 无双扣）是矩阵仍标 blind/case-only 的下一可独立 prove 面；P0 黄金路径 > P1 i18n；Ban 借刀 banned UCs；Ban wash UC-017 旁证成 001 BOUND covered。

## Quoted from the files

`e2e-requirement-coverage-matrix.md:112`：UC-E2E-001 BOUND **blind**/case-only ·「黄金路径主叙事 = 典型快乐盲区」· NEG 真证据已落（Line Y）· BOUND/ADV 仍无独立进 full.e2e · ≠ covered · coveredCount=8。

`non-happy-path-perf-load-case-matrix.md:38`：**NHP-001-BOUND-01**「幂等键重复 begin | 单 ConsumptionRecord；无双扣 | **case-only** | UC-017 旁证 ≠ 001」。

`e2e-requirement-coverage-matrix.md:263` P0-3：UC-E2E-001 真链路 / live-blocked honesty；抬 covered 仍须 Key→`e2e:isolated`；**Ban live default** 本刀。

`e2e-scenarios.md:59` / `:203-210`：begin 以 `idempotency-key` 预占；同键重发 `ON CONFLICT DO NOTHING` → 不超扣；UC-017 覆盖孤儿预占原子性 **≠** 本 case 专用收据。

## blind→case/prove 显式化

| 今日 | 本 REQUEST | 授权后 |
|------|------------|--------|
| BOUND=blind/case-only；委派 UC-017；无 UC-001 专用 BOUND prove 收据 | docs：具名 harness + 注入合同 + dual stubs | 拟 `pnpm uc001:nhp-bound:prove`（隔离 · **Ban live**） |

## 注入合同（BOUND 一 case）

| id | 注入 | 观察 |
|----|------|------|
| **B1 同幂等键重复 begin** | 同一 principal + 同一 `idempotency-key`（或等价 begin 幂等键）连续两次开面 | **至多一条**有效 `ConsumptionRecord`（或同键复用）；**无双扣**；额度净变可解释（0 或单次预占）；第二次为幂等安全（同 interview / already_* / DO NOTHING 族可解释） |
| **B2 旁证边界** | 对照 `uc017:orphan:prove` / commerce 旁证 | 旁证 **≠** 本 case 专用收据；本刀要求 **UC-001 主链 BOUND 面**可引用 CMD+EXIT，Ban 只甩 017 绿 |

## prove 方案（授权后 · Ban live）

- **拟 CMD**：`pnpm uc001:nhp-bound:prove`（`run-e2e-isolated.mjs`；**不加载 MODEL_API_KEY** · Ban live 模型调用 · **Ban live default**）。
- **EXIT0** = B1 真证据（+ B2 边界声明）；**≠ covered** · **≠** 假绿 suite（`g7SuiteGreen` 不因本刀讨论）· 主链快乐路径仍可 blind · NEG Line Y 收据互不替代。
- **EXIT1** = 诚实保留；Ban retry-to-green · Ban 记 flake · Ban 改断言洗绿。
- **Ban fake-green suite**：本刀任何绿 **不得**叙述为 `e2e:isolated` suite green / trio green / UC-001 covered。

## 专家对（为何非 mw-model-op）

- **mw-e2e-ha** + **mw-rag-route**：BOUND 面 = begin / 幂等键 / ConsumptionRecord 额度 — **api/commerce 面试开面**，非 model-op 校准/调度表面。
- **Ban** 默认改派 `mw-model-op`（无 model-surface 主张）。

## 行语义（冻结）

- UC-E2E-001 stays 其矩阵读法（partial/blocked 叙事保留）；BOUND 升格仅经 prove+dual+nail；**Ban invent covered** · coveredCount=8。
- Ban 碰 UC-003 / 018 / 052 / 025 / 004 / 011 行借刀 · Ban SSOT status 翻写本 turn。
- Line Y `GAP-UC001-NEG-01` / NHP-001-NEG-01 **不动、不洗**。

## Ban 列表

- Ban coding · Ban prove 执行 · Ban push · Ban live · **Ban live default** · **Ban fake-green suite**
- Ban invent covered · Ban wash UC-017/commerce 旁证成 001 BOUND covered · Ban secrets / `.env*` · Ban Meridian · Ban HA cloud buy
- Ban self-approve · Ban self-nail · Ban force-push · Ban SSOT edit
- Ban selecting NHP for UC-018 / 052 / 025 / 004 / 011

## Non-claims

Not a pass · not run · not covered · not live · not suite green · not trio green · not ADV knife · not UC-003 knife · not HA · alone ≠ dual · EXIT0 ≠ covered

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · Ban live · Ban live default · Ban fake-green suite · STOP

## NAIL（2026-10-06 · Line AB · `post_prove_dual_pass` · EXIT0≠covered）

- Lifecycle → **`post_prove_dual_pass`**（authorized coordinator nail · implementer does not self-approve beyond this nail）.
- REQUEST `c6dd1a6`（`c6dd1a67fc6b6ef4c2dfad0f9a5beff9791d657b`）→ PRE dual mw-e2e-ha `d448da9` + mw-rag-route `64252be` PASS → CODE `6e96cf5`（`6e96cf50a8be410a0d2154761afef88cd2368c7a`）→ prove tip **NAILED TO** `f8cdc82`（`f8cdc82748922a15f668993fe742411052cf21fd`）· `pnpm uc001:nhp-bound:prove` **EXIT 0 · 17/17** · isolated 真 PG.
- POST dual BOTH PASS: mw-e2e-ha `b060e4e`（`b060e4e35cfbde00715ff3d8be29ff1d657c9b67`）+ mw-rag-route `5adb14f`（`5adb14f68f43108c09ef277db03c674e9b93bfa3`）· alone≠dual.
- **prove-only** · **zero `apps/api/src`** · product mouth pre-existing; this knife = BOUND prove wiring · 无双扣.
- **EXIT0≠covered** · **SCOPE UC-001 BOUND only** · Ban wash Y / 018 / 052 / 025 / 004 / 011 · UC-E2E-001 BOUND stays blind/`case-only` wording · coveredCount=8.
- Pins: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503.
- Keep siblings（Line AC / Z / AA nails · Line Y NEG）as written. Ban coding · Ban HA · Ban live · Ban Meridian · Ban secrets · Ban force-push · Ban claiming covered.

*Harness · NHP-001-BOUND-01 · UC-001 BOUND blind→case · post_prove_dual_pass · EXIT0≠covered · coveredCount=8 · STOP*
