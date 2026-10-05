# REQUEST — **G7 env-gap honest fix track**（越过 env-gap → 业务断言 / 或钉清 blocker · ≠ suite green）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/g7-env-gap-honest-fix.md` · slice `g7-env-gap-honest-fix.slice.md`
**Parent tip**: `f43bea1`（full `f43bea12fc7f2e28e7bb0052b6a80811eac47e91` · not a prove tip）
**Date**: 2026-10-06
**Line**: **AC**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained · Ban flip true unless future authorize） |
| Disclosure-1 / R1 | **OPEN**（retained） |
| Trio | **OPEN 1/1/1**（retained） |

## 请审什么（mw-e2e-ha · env-gap / isolation / EXIT 诚实 · Ban fake green）

Line AC · 承接 Line U nail `7c631c2`（prove tip NAILED TO `9ff3daf` · code `e8c63a9` · EXIT 1/1/1 · FAIL class **env-gap**）。请审：

1. **证据基线**：iso/ui `database_not_ready` + docker.sock permission denied（uid `box` ∉ docker group）· perf web build 0 → migrate EXIT1 → HTTP E2E not_run —— 是否与 `receipts/g7-trio-fresh/` 一致、是否正确归类 **env-gap**（非 flake、非 Key-blocked 业务红、非 chromium 缺失）。
2. **目标二选一是否可验收**：(A) 越过 DB/migrate 门并真撞业务断言或 Key-blocked fail-closed；(B) 钉清不可逾越 blocker（约束：Ban buy cloud · Ban Meridian · Ban secrets · Ban 越权提权）。**成功 ≠ suite green**。
3. **Branch A remediation 契约**：任何 docker/group/socket/rootless/预置 fixture 路径须可复现、可探针记录（`groups` / sock ACL / `docker info`）；**Ban** secrets 入树；越过门后 Keys unset 下 EXIT=1（Key-blocked）仍算「撞到业务路径」诚实红，**Ban** 叙述为 suite green。
4. **Branch B blocker 钉法**：证据链是否足以支持「本 host/class 在禁云禁 Meridian 下不可达」；Ban 用 blocker 当假绿借口。
5. **attempt 纪律**：授权后 trio 三条各恰一次 · Ban retry-to-green · Ban flake wash · 收据分清 env-gap vs business-assert。
6. **状态冻结**：`g7SuiteGreen=false` · Disclosure-1/R1 OPEN · coveredCount=8 · Ban invent covered · Ban SSOT 擅自翻行 · G6/R5-MARKED-RED 不因本刀关闭。
7. **边界**：本 turn docs-only；Dual PASS ≠ coding ≠ prove ≠ nail ≠ suite green；Ban live · Ban buy cloud · Ban Meridian · Ban force-push · Ban `g7SuiteGreen=true`。

Trio stays **OPEN 1/1/1**. `g7SuiteGreen=false`. Disclosure-1 **OPEN**. R1 **OPEN**. Line U EXIT **1/1/1** retained. **Ban covered** · coveredCount=8. **Ban 假绿 suite 声明**.

本 stub 不授权 coding / prove / live / push / buy cloud；pre-exec dual PASS 后由协调方授权执行；implementer 不自批。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC review — mw-e2e-ha（Line AC · G7 env-gap honest fix · docs gate only）

**Reviewer**: `mw-e2e-ha`（独立审 · 不代签 mw-model-op · alone ≠ dual）
**Reviewed at**: 2026-10-06 00:11 CST
**REQUEST tip**: `94a8b2a` / `94a8b2aead1b7087115a0ac1af9f790ef2a8f177` · **git parent** `448a33e` / `448a33e2460f919b15af1db6c9c44497dc585b62`（verified · detached checkout）
**Files read**: harness `harness/g7-env-gap-honest-fix.md` · slice `g7-env-gap-honest-fix.slice.md` · this stub · Line U receipts `receipts/g7-trio-fresh/{SUMMARY,e2e-isolated,e2e-ui-isolated,verify-e2e-performance}.md` · backlog Line U 段 `gap-bug-backlog.md:397+`
**Scope**: docs gate only · zero coding · zero prove · zero live · zero buy cloud · no `.env*` · no Meridian

### 1. Evidence baseline（Line U U-anchor 交叉核对）— **PASS**

| Harness claim | Line U receipt | Match |
|---------------|----------------|-------|
| NAIL `7c631c2` · prove tip `9ff3daf` · code `e8c63a9` · REQUEST `1c57bb3` | SUMMARY :5–:10 · all four SHAs are ancestors of `94a8b2a` | **hit** |
| EXIT **1/1/1** | SUMMARY :22–:26 | **hit** |
| iso `E2E_FAILURE class=db code=database_not_ready` · zero cases（`assertionCount=null`） | `e2e-isolated.md:37` | **hit** |
| uid `box` ∉ `docker` · `docker.sock` permission denied | `e2e-isolated.md:29` | **hit** |
| ui same `database_not_ready` before Playwright · chromium 1.61.1/v1228 ≠ UI green | `e2e-ui-isolated.md:36` `:49` `:53` | **hit** |
| perf web build 0 → `migrate:prove` EXIT **1** → HTTP E2E **not_run** | `verify-e2e-performance.md:37–:38` `:44–:45` | **hit** |
| R5-MARKED-RED pgvector-legacy · G6 OPEN | receipts :37 / :50 / :44 | **hit** |
| ERRATUM 观察=`3424dc1` · 消除轮=`82981ff` · Ban `quota-403=82981ff` | SUMMARY :51–:60 | **hit**（verbatim retained） |

归类 **env-gap** 正确：非 flake（×1 · EXIT 诚实）· 非 Key-blocked 业务红（未到 chat 断言 · Keys unset）· 非 chromium 缺失 · 非 FreeTierOnly 403 重演。harness §3 "不是" 列表与收据一致；perf migrate EXIT1 归 cascaded env-gap 与 receipt :44 同口径。

**Advisory read-only probe（非 prove · 非 remediation · 仅佐证 env-gap 仍在）**: review 时本 host `id` → `uid=1000(box) groups=1000(box),997(orbitd)`（∉ docker）· `ls -l /var/run/docker.sock` → `srw-rw---- root docker`。与 Line U 门控事实一致；未跑 `docker info`、未尝试任何提权。

### 2. Path A vs Path B 合同 — **PASS**

- **A（remediable env → 真撞业务断言 / Key-blocked fail-closed）**：成功判据 = 越过 isolation DB/migrate 门 + case 级明细或 Key-blocked fail-closed 业务路径 FAIL；EXIT 照实（预期多为 1）；`g7SuiteGreen` stays false（harness §2 表 · §4 · §4 末段 "非绿" 诚实预期）。可验收。
- **B（impassable blocker nail）**：判据 = Ban buy cloud / Meridian / secrets / 越权提权 约束下无合规可达 isolation DB；须证据链（sock mode/owner/group · uid/groups · `docker info` · Line U 交叉引）；trio stays OPEN 1/1/1；Ban 用 blocker 当绿借口（§2 · §4）。可验收。
- 两路均明写 **成功 ≠ suite green**；§2 Ban 列表含 "把 env-gap 冲销成 flake / not_run-as-pass / 环境偶发洗绿"。

### 3. Ban wash U red into suite green — **PASS**

harness §1 零改写复述 U 红；§6 trio OPEN 1/1/1 · Line U prove tip NAILED TO `9ff3daf` · Ban 更晚 tip 冒充；§8 Non-claims 全列。无任何 suite / trio / family green、R1 closed、Disclosure-1 closed、G6 closed、covered 宣称。

### 4. `g7SuiteGreen=false` · Disclosure-1 / R1 OPEN — **PASS**

harness :23 / §6 / Pins · slice Pins · stub pins 表三处一致：`g7SuiteGreen=false`（Ban true 除非未来协调方显式授权）· Disclosure-1 OPEN（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` 永不计入 R1）· R1 OPEN · trio OPEN 1/1/1。

### 5. attempt 纪律 / 收据 — **PASS**

§5.4 每条恰一次 · 红不重跑 · Ban flake 记法 · Ban 只留绿 attempt；§5.5 门控探针前后必录且 Ban 打印 Key / `.env*`；§5.6 收据须分清 env-gap vs business-assert；§5.8 SSOT 零触碰。

### 6. Pins — **PASS（原值）**

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 —— harness / slice / stub 三处原值，无翻转。

### Blockers

- **None.**

### Conditions（执行前 / 执行时必须遵守 · 非 blocker）

- **C-1 parent-cite drift**：harness :6 / slice :6 / stub :7 写 base `f43bea1`，而 `94a8b2a` 的 git parent 为 `448a33e`（中间 `bb1721b`/`448a33e` = Line Z/AA docs-only · 无 trio 相关代码）。§5.1 已要求执行时 fetch 后重钉 committed SHA —— 执行收据须以实跑 SHA 为准，Ban 把 `f43bea1` 当实跑 code SHA。
- **C-2 package.json 行号 / 代码漂移**：Line U prove @ `e8c63a9` 钉 `:246/:247/:250`；@ `94a8b2a` 已为 `e2e:isolated :251` · `e2e:ui:isolated :252` · `verify:e2e-performance :255`。`e8c63a9..94a8b2a` 间 `scripts/run-e2e-isolated.mjs` 仅 additive 新 target（Line V `uc011:adv` / Line Y `uc001:nhp-neg`），未触 trio 的 `e2e:prove`/`e2e:ui`/`migrate:prove` 分派。执行收据须写新行号 + 新 code SHA，**Ban** 与 Line U prove code `e8c63a9` 混称。
- **C-3 docker group = root-equivalent**：Branch A 例 "runner uid 加入 `docker` group" 实质等同 root 权限。合规条件：须由主机运营/协调方**显式、带外**授予并在收据记录授予人/时间/前后探针；implementer **Ban** 自行 sudo / setfacl / chmod sock / newgrp 越权 —— 自授 = §4 "越权提权" → 必须走 Branch B。rootless docker / 预置 fixture 同须双审可复现。
- **C-4 per-CMD 分类（混合结果）**：A/B 须逐 CMD 判定。若 docker 可达后某 CMD 仍红于 DB/migrate 门（例：perf `migrate:prove` 因 schema/migration 自身失败），须登记为 **新 FAIL class（migrate/schema red）**，**Ban** 继续标 env-gap、**Ban** 计为 A 成功。A 成功（逐 CMD）最低证据 = `assertionCount≠null` 或 case 级行，或具名 Key-blocked fail-closed 码（如 `generation_provider_not_configured`）出现在收据。
- **C-5 fixture**：越过门若仍用 `pgvector-legacy` 隔离栈，R5-MARKED-RED 披露须保留；≠ G6 / R5 关闭。
- **C-6 授权链**：本 PASS 仅为 PRE-EXEC 单方 docs 门；执行须 mw-model-op 独立 PRE PASS（不代签）+ 协调方授权；任何 trio EXIT=0 仍 ≠ suite green（须 post-run dual + 协调方 nail 授权）。

### Non-claims

PASS ≠ coding ≠ prove ≠ suite green ≠ trio green ≠ nail ≠ HA · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not covered（coveredCount=8）· not `releaseEvidence=true` · not live（0 model calls · Keys unset · `actualSpendCny=null`）· not buy cloud · `g7SuiteGreen=false` · trio OPEN 1/1/1 · Line U EXIT 1/1/1 retained · alone ≠ dual

### 中文三行摘要

1. Line AC 合同把 Line U 钉死的 env-gap（iso/ui `database_not_ready` + docker.sock 拒绝 · perf migrate EXIT1→HTTP not_run）原样锚定，Path A（合规修 env→真撞业务断言/Key-blocked fail-closed）与 Path B（约束下钉清不可逾越 blocker）判据清晰可验收。
2. 无任何把 U 红洗成 suite green 的叙述；`g7SuiteGreen=false`、Disclosure-1/R1 OPEN、trio OPEN 1/1/1、8 项硬 pins 全部原值保留。
3. 无 blocker；条件：重钉实跑 SHA/新行号（:251/:252/:255）、docker 组授予须协调方带外显式授予（自授=越权→B）、逐 CMD 分类且 migrate 自身红须新登记；PASS ≠ coding ≠ suite green，alone ≠ dual。

Verdict: PASS
