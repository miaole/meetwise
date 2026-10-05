# Harness — G7 · **trio 新鲜跑刀**（Line U · NAIL · **`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**（Line U nail · honesty of red · trio stays **OPEN 1/1/1** · `g7SuiteGreen=false` · Disclosure-1 **OPEN** · R1 **OPEN** · Ban fake green / Ban suite green / Ban covered flip · Ban coding · Ban live · Ban Meridian · Ban self-approve beyond this authorized nail）

> **REQUEST-era note（historical · retained）**: this file began as REQUEST `pending:awaiting_pre_exec_dual`. Prove tip **`9ff3daf`** · code **`e8c63a9`** · EXIT **1/1/1** · post dual mw-model-op `4562644` + mw-e2e-ha `580edc7` BOTH PASS（honesty of red）. Lifecycle advanced to **`post_prove_dual_pass`** by Line U nail only.
**Date**: 2026-10-05
**授权链（待走）**：Line U REQUEST（本 commit）→ pre-exec dual **mw-model-op + mw-e2e-ha BOTH PASS** → 协调方授权 prove 执行 → 才允许在独立 worktree 实跑三条 CMD。**本 commit 不预claim 任何 post-commit EXIT。**
**产物定位**：G7 北星硬闸要求**全量 CMD+EXIT 收据**；冻结 trio（`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance`）**OPEN 1/1/1** 且自 FIX（2026-09-17，prove `a4e3de5`）后**零实跑**——在 committed SHA 上首次产出 trio 三条 CMD 的新鲜 CMD+EXIT 收据，是当前 G7 最大缺口之一。L 线产物（`harness/g7-trio-current-state-alignment.md` · `harness/g7-trio-offline-receipt-index-alignment.md`）已备好全部未来跑纪律，本刀即按其三要素执行。
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained**: `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 **OPEN**（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` = non-production role path · **never counts toward R1**）· trio **OPEN 1/1/1**

---

## 1. trio 三条 CMD wiring（行号钉定 · 一律附 @SHA）

| 行号 | @`320c07b`/`0345315`（L 线钉定 base） | @`0cf8591`/`8dde8e3`（+2 漂移） | **@`377e7fc`（本刀 base · fetch 后 origin tip · 实测）** |
|------|-----------------------------------|-------------------------------|------------------------------------------------------|
| `e2e:prove` | `:238` | `:240` | **`:244`** |
| `e2e:ui` | `:239` | `:241` | **`:245`** |
| `e2e:isolated` | `:240` | `:242` | **`:246`** |
| `e2e:ui:isolated` | `:241` | `:243` | **`:247`** |
| `verify:e2e-performance` | `:244` | `:246` | **`:250`** |

解析链不变：`e2e:isolated` = `run-e2e-isolated.mjs e2e:prove` → `run-e2e.mjs`；`e2e:ui:isolated` = `run-e2e-isolated.mjs e2e:ui` → `run-e2e-ui.mjs`；`verify:e2e-performance` = `run-e2e-performance-suite.mjs`。**若授权实跑时 origin tip 再前移，按纪律「按当 tip 重核行号」重测后回填收据；实跑 code SHA 以 worktree HEAD 实测为准。**

## 2. 三条 CMD 现状与历史 EXIT（诚实基线 · 状态不变）

| CMD | 状态 | 历史 EXIT | 历史失败明细（引用归档收据 · 零改写） |
|-----|------|-----------|--------------------------------------|
| `pnpm e2e:isolated` | **OPEN** · `not_run:no_coding_authorize`（自 FIX 后零实跑） | **1** | FIX（Key set · 21s）：live chat **403 `AllocationQuota.FreeTierOnly`** → `questions=0` · `interview_unavailable` / `generation_provider_not_configured` · `failureClass=api` · R5-MARKED-RED pgvector-legacy（`receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md` CMD#1）；夹具面 BUG-E2E-ISO（`gap-bug-backlog.md:98`）：宽 iso/perf 默认绑同一 pgvector 镜像 · 云 serial runner 拒全套 · **G6 still OPEN** |
| `pnpm e2e:ui:isolated` | **OPEN** · `not_run:no_coding_authorize` | **1** | FIX（Key set + chromium ran · 143s）：**10 passed / 2 failed / 10 skipped** · recruiting-bound chromium+mobile `waitForURL(/interview/iv_…)` 30s timeout（live interview start 被同quota 403 阻断）· `E2E_FAILURE class=frontend code=client_exited` · voice skipped（无 TTS/ASR Key，诚实 capability skip）· **chromium ran ≠ UI green**（同上 CMD#2；UI′ `post_prove_dual_pass:honesty_red` retained） |
| `pnpm verify:e2e-performance` | **OPEN** · `not_run:no_coding_authorize` | **1** | FIX（77s）：migrate runner PASS 后 **HTTP full E2E fail** → `e2e_performance_suite_failed:HTTP full E2E:exit=1`（同上 CMD#3）· **≠ SLO ≠ LOAD ≠ HA ≠ suite green** |

汇总口径：trio **OPEN 1/1/1** = `gap-bug-backlog.md:128`；「not_re_run · historical exit 1 · stay OPEN」= `gap-bug-backlog.md:181` · `execution-master-checklist.md:492`（均 @`0345315`，本刀实测 `377e7fc` 行号相同）。末次 trio 实跑 = **FIX**（2026-09-17 ~20:04–20:17 PT · prove `a4e3de5` · dual tip `5f591ea`）；时序 A″（`e697c81`）→ FIX（L 线已钉）。quota-403 移除（`b1d7b22` @ 2026-09-23）**≠ suite green**（G7 FR3 nail 原文口径）。

## 3. 跑法（未来授权实跑 · 纪律三要素全量落地）

1. **跑在 committed SHA 上**：`git fetch origin` 后记录实际 origin tip（本刀 REQUEST 时实测 **`377e7fc`**）；实跑一律在**独立 worktree**（先例 `/Users/miaole/Desktop/golucky/meetwise-line-u`，branch `line/u-g7-trio-fresh`）内进行；若协调方授权时 tip 已前移，以协调方重钉的 committed SHA 为准并逐 receipt 记录。
2. **依赖安装**：`pnpm install --frozen-lockfile`（先例 EXIT=0 记录；禁改 lockfile）。
3. **每条 CMD 恰一次**：三条 CMD **各自独立** attempt 记录——**CMD + EXIT + 时间戳（开始/结束）+ 实跑 code SHA**（worktree HEAD 实测；**receipt commit ≠ 实跑 code SHA** 惯例不变）。**红了不重跑**（Ban retry-to-green）；**Ban 只留绿 attempt**；**Ban 把 EXIT=1 记为 flake / 环境偶发**。
4. **预期 EXIT=1（诚实）**：本刀目的**不是翻绿**——是在 committed SHA 上产出 G7 要求的新鲜 CMD+EXIT 收据，并**精确定位三条 CMD 各自的 FAIL 明细（哪些 case、什么原因）**，为后续修复刀排队。EXIT 全部如实记录，1 就是 1。
5. **Ban live（硬）**：真实模型 API 调用**零次**（chat/embed/rerank/asr/tts/stream 全族）；**不加载 Key**、不跑 NEW_SHELL_STATUS probe、不读 `.env*`、不计算 Key fingerprint；无 Key 时相关路径按产品既有 fail-closed 行为如实记录为 FAIL 原因（Key-blocked / `generation_provider_not_configured` 等），**Ban 顺手装 Key / 改环境蒙混**。`actualSpendCny=null`（No invented spend）。
6. **环境缺口如实记录**：若某条 CMD 需要缺失环境（Key / playwright 浏览器版本等），该缺口**如实记为该 CMD 的 FAIL 原因（环境缺口类）**，不洗、不掩盖。**唯一例外：playwright chromium 可安装**（那是测试浏览器，不是 Key）；chromium 安装动作（install/version/smoke）逐条记录入对应 receipt，且 **chromium ran ≠ UI green** 惯例不变。
7. **收据落点**：`ai-docs/delivery/receipts/g7-trio-fresh/`——三份 per-CMD receipt + 一份汇总：
   - `e2e-isolated.md` · `e2e-ui-isolated.md` · `verify-e2e-performance.md` · `SUMMARY.md`
   - 每份 per-CMD receipt 必含：CMD 原文、EXIT、时间戳、实跑 code SHA、worktree/branch、install 记录、**逐 case FAIL 明细**（case 名 + 失败原因 + 分类：api / fixture / env-gap / frontend…）、环境缺口披露、Ban live 声明（调用 0 次）。
   - `SUMMARY.md` 汇总三条 EXIT 表 + 逐条一句话原因 + `g7SuiteGreen=false` 等口径原值；**evidenceOfRecord 与 SSOT 登记留待 nail 阶段**（本刀禁碰 SSOT）。
8. **输出日志**：原始 stdout/stderr 落 worktree `.tmp/`（不入 git），receipt 引用其路径与关键行摘录；**Ban secrets / Key / `.env*` 任何内容入树入 receipt**。

## 4. 诚实条款（硬钉）

- `g7SuiteGreen=false` **保持**；**跑绿任何一条 CMD 也绝不宣称 suite green**——三条全绿才有资格**讨论** suite green（且仍须 post-run dual + 协调方授权 + nail 阶段 SSOT 登记）。**Ban 假绿 suite 叙事**。
- EXIT 全部如实；失败明细**逐 case 列出**，粒度到「哪个 case / 什么原因 / 哪类（api / fixture / env-gap / frontend）」。
- EXIT=1 是诚实红灯，不是 flake、不是环境偶发措辞掩盖（环境缺口可以如实定性为 env-gap，但**必须**作为 FAIL 原因入账，不得冲销 EXIT=1）。
- EXIT=0 ≠ covered ≠ suite green ≠ HA ≠ 0 BUG ≠ fixed；not_run ≠ pass；`g7_hard_disabled`（mapped not_run label）/ 运行时 `g7_path_disabled:<capability>` 均 ≠ pass。
- quota-403 removed（residual CLOSED）≠ trio green ≠ suite green；Key set ≠ auto green（本刀根本不 set Key）。
- 本 commit（REQUEST）**不预claim 任何 post-commit EXIT**；三份收据的 EXIT 表在实跑后由被授权执行另行落盘，本刀文档零预填。

## 5. 边界（Ban 清单）

- **Ban coding**：零产品代码改动（`apps/` / `packages/` / `scripts/` 零触碰）；**Ban prove 脚本改动**（不改 `run-e2e*.mjs` / `package.json` / 任何 prove 文件）。
- **Ban push**：一切 git 写操作只在独立 worktree 内 commit；不 push、不 force-push。
- **Ban SSOT**：`gap-bug-backlog.md` / `execution-master-checklist.md` / 覆盖矩阵 / north-star **零触碰**；trio 状态翻转、gap id 登记一律留 nail 阶段且须协调方另行授权。
- **Ban live**：见 §3.5；Key 动作 0 次。
- **Ban 改归档**：A″ / FIX / FR3 / Line C 历史收据零改写；本刀只新增 `receipts/g7-trio-fresh/` 新文件。
- **Ban self-approve**：pre-exec dual = mw-model-op + mw-e2e-ha 两方独立签署（alone ≠ dual · 不代签 peer）；dual PASS 后仍须协调方授权 prove 执行；Dual PASS ≠ coding ≠ 实跑 ≠ nail。

## 6. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not suite green · not trio green · not family green · not fixed · not R1 closed · not TECH_ROLE closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail（SSOT 零触碰）· not new evidence · not live · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 OPEN · trio OPEN 1/1/1 · 历史 EXIT 1/1/1 retained · 预期实跑 EXIT=1（诚实）· `actualSpendCny=null`

---

---

## 7. Line U NAIL lifecycle（`post_prove_dual_pass` · 2026-10-05 · additive）

- Lifecycle on this harness/slice/SUMMARY: **`post_prove_dual_pass`**.
- Prove tip NAILED TO: `9ff3daf2ee7b9e5d355212d0e877f5b8be79db38`（do **not** claim a later origin tip as the prove tip）.
- Prove code SHA: `e8c63a913a1e9af285f692bcab16f7593294d144` · **PROVE_EXIT 1/1/1**.
- POST dual BOTH PASS: mw-model-op `456264420d75c4beddd5eed56c31ecd5f956fb86` + mw-e2e-ha `580edc73e1c12271d60d5f0cb4b0ad5d7d2ddb0a`.
- FAIL classes registered: **env-gap**（`database_not_ready` / migrate EXIT1 → HTTP E2E **not_run**）.
- STILL_OPEN: trio **OPEN 1/1/1** · `g7SuiteGreen=false` · Disclosure-1 **OPEN** · R1 **OPEN**.
- Pins unchanged: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503.

### ERRATUM（coordinator wording · corrects REQUEST §2 shorthand）

| Role | SHA |
|------|-----|
| FreeTierOnly **观察** | **`3424dc1`** |
| **消除轮** | **`82981ff`**（`cc8050d`→`82981ff`） |
| Ban | writing shorthand **`quota-403=82981ff`** |
| Ban | writing **`b1d7b22` @ 09-23** for that removal（`b1d7b22` = 2026-10-02 FR2 tautology / offlineProvesAtCodeSha only） |

§2 historical prose that wrote `quota-403 移除（b1d7b22 @ 2026-09-23）` is **superseded by this erratum**（not rewritten in place；correction lives here + SUMMARY + SSOT nail sections）.

---

*Harness · G7 trio 新鲜跑刀 · Line U NAIL · 2026-10-05 · lifecycle post_prove_dual_pass · prove tip 9ff3daf · code e8c63a9 · EXIT 1/1/1 · post dual 4562644+580edc7 PASS · g7SuiteGreen=false · Disclosure-1 OPEN · R1 OPEN · trio OPEN 1/1/1 · Ban fake/suite green · Ban covered flip · Ban live · releaseEvidence=false · STOP*
