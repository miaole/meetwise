# REQUEST — **G7 trio 新鲜跑刀**（committed SHA 新鲜 CMD+EXIT 收据 + 逐 case FAIL 明细）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/g7-trio-fresh-run.md` · slice `g7-trio-fresh-run.slice.md`
**Parent tip**: `377e7fc`（fetch 后 origin tip 实测 · `377e7fc4fa1b35b85ebf524b668469caf66de2bc` · not a prove tip）
**Date**: 2026-10-05

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
| `g7SuiteGreen` | **false**（retained） |
| `r1Closed` | **false**（retained） |
| `techRoleFailClosedOptOutG7Only` | **true**（retained） |

## 请审什么（mw-e2e-ha 视角）

Line U · trio 三条 CMD 历史 **EXIT 1/1/1**（末次实跑 = FIX 2026-09-17 · prove `a4e3de5` · A″ `e697c81` 先于 FIX），自 FIX 后零实跑、trio **OPEN 1/1/1**（`gap-bug-backlog.md:128/:181` · `execution-master-checklist.md:492`）。本刀产出新鲜 CMD+EXIT 收据 + 逐 case FAIL 明细，为修复刀排队。请审：

1. **历史失败明细基线是否如实钉定**（harness §2 · 引归档收据零改写）：
   - `pnpm e2e:isolated`（`package.json:246` @`377e7fc`）：FIX 21s · Key set 下 live chat **403 `AllocationQuota.FreeTierOnly`** → `questions=0` · `interview_unavailable` / `generation_provider_not_configured` · `failureClass=api` · R5-MARKED-RED pgvector-legacy；夹具面 **BUG-E2E-ISO**（`gap-bug-backlog.md:98`：宽 iso/perf 默认绑同一 pgvector 镜像 · 云 serial runner 拒全套）· **G6 still OPEN**。
   - `pnpm e2e:ui:isolated`（`:247`）：FIX 143s · **10 passed / 2 failed / 10 skipped** · recruiting-bound chromium+mobile `waitForURL(/interview/iv_…)` 30s timeout（live interview start 被同 quota 403 阻断）· `E2E_FAILURE class=frontend code=client_exited` · voice 诚实 capability skip · **chromium ran ≠ UI green**（UI′ `post_prove_dual_pass:honesty_red` retained）。
   - `pnpm verify:e2e-performance`（`:250`）：FIX 77s · migrate runner PASS 后 **HTTP full E2E fail**（`e2e_performance_suite_failed:HTTP full E2E:exit=1`）· ≠ SLO ≠ LOAD ≠ HA ≠ suite green。
2. **attempt 台账契约**：三条 CMD **各自**独立 attempt 记录——CMD + EXIT + 时间戳（开始/结束）+ **实跑 code SHA**（worktree HEAD 实测；receipt commit ≠ 实跑 SHA）；`pnpm install --frozen-lockfile` EXIT 亦记录；**每条 CMD 恰一次，红了不重跑**；**Ban retry-to-green · Ban 只留绿 attempt · Ban 把 EXIT=1 记 flake / 环境偶发冲销**。
3. **预期 EXIT=1（诚实）**：本刀不是翻绿刀；EXIT 全部如实（1 就是 1）；失败明细**逐 case 列出**（case 名 + 失败原因 + 分类 api / fixture / env-gap / frontend），粒度须可让后续修复刀直接排队，Ban 散文式「部分失败」带过。
4. **环境缺口的诚实定性**：无 Key（Ban live，本刀不加载）→ Key-blocked / fail-closed 路径失败是**预期**，定性为 **env-gap / api 类 FAIL 原因入账**，**Ban 顺手装 Key / 改环境蒙混 / 把 env-gap 冲销成 not_run**；playwright chromium **可装**（测试浏览器非 Key），install/version/smoke 逐条记录入 receipt，**CR chromium prereq 关 ≠ UI green**（0/0/0 先例 + UI′ honesty_red retained）；夹具面 BUG-E2E-ISO / G6 OPEN 限制如实披露，不 wash。
5. **收据落点与卫生**：`ai-docs/delivery/receipts/g7-trio-fresh/`（`e2e-isolated.md` / `e2e-ui-isolated.md` / `verify-e2e-performance.md` / `SUMMARY.md`）；每份含 CMD 原文、EXIT、时间戳、实跑 SHA、worktree/branch、install 记录、逐 case FAIL 明细、环境缺口披露、Ban live 声明（调用 0 次）；原始日志落 `.tmp/` 不入 git；**Ban secrets / Key / `.env*` 内容入树入 receipt**；`SUMMARY.md` 汇总 EXIT 表 + `g7SuiteGreen=false` 等口径原值；evidenceOfRecord / SSOT 登记留 nail 阶段。
6. **诚实条款与禁翻状态**：`g7SuiteGreen=false` 保持；**跑绿任何一条也绝不宣称 suite green**（三条全绿才讨论，且仍须 post-run dual + 协调方授权 + nail 登记）；**EXIT=0 ≠ covered ≠ suite green ≠ HA ≠ 0 BUG ≠ fixed**；收据不自动翻转 trio 状态（OPEN 1/1/1 翻转留 nail）；**Ban 假绿 suite 叙事**。
7. **边界**：零产品代码改动 · 零 prove 脚本改动（`run-e2e*.mjs` / `package.json` / lockfile 零触碰）；SSOT 零触碰；历史收据（A″ / FIX / FR3 / Line C）零改写；**push 禁止**；Disclosure-1 retained（`techRoleFailClosedOptOutG7Only=true` 持续披露）。

Trio stays **OPEN 1/1/1**（收据不自动翻转状态）. `g7SuiteGreen=false`. R1 **OPEN**. Disclosure-1 **OPEN**. 历史 EXIT **1/1/1** retained · 预期实跑 **EXIT=1（诚实）**. **Ban covered** · coveredCount=8. **Ban 假绿 suite 声明**。本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方授权 prove 执行；implementer 不自批。Dual PASS ≠ coding ≠ 实跑 ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual · G7 trio 新鲜跑刀 · mw-e2e-ha（docs gate only · Ban prove · Ban coding · Ban product edit · Ban 改共享 SSOT · Ban live · Ban 授权实跑）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · alone ≠ dual · 不代签 `mw-model-op`）
**Review date**: 2026-10-05
**Worktree**: `/workspace/meetwise`（detached at tip `ad8d68e` · branch target `feat/mysql-schema-skeleton`）
**被审 SHA**: `1c57bb3`（`1c57bb36e79a34b9152bf05d47275e90bfa4c58b` · `docs(model-op): REQUEST G7 trio fresh run (pre_dual)`）
**Peer alone PASS**: `mw-model-op` @ tip `ad8d68e`（`ad8d68e5f2536e83668ea07f6c1e224c23b32442` · 仅追加 model-op 审体；e2e-ha REQUEST / harness / slice 自 `1c57bb3` 起字节未变）
**Docs-only 核实**: `git show --stat --oneline 1c57bb3` = 恰 4 个新增 md（slice / harness / REQUEST·model-op / REQUEST·e2e-ha），+214/−0；零代码 / 零 `package.json` / 零 lockfile / 零 SSOT / 零收据触碰。
**祖先关系**: `git merge-base --is-ancestor 1c57bb3 HEAD` EXIT=0。**fetch-now**（2026-10-05 ~23:10 +0800）：`origin/feat/mysql-schema-skeleton` = `ad8d68e`（peer PASS 已入 tip）。Parent tip 钉 `377e7fc` 仍为 docs 基线，not a prove tip。
**本审未跑**: 零 `pnpm e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance`；零 Key；零 `.env*`；零 model API。本 PASS **不授权**实跑。

## 检查表（file:line 证据 · 本 worktree 实读）

1. **wiring @`377e7fc` 独立重数**（`git show 377e7fc:package.json | grep -n`）：`e2e:isolated`=`:246` · `e2e:ui:isolated`=`:247` · `verify:e2e-performance`=`:250`。与本 stub:31–33 / harness §1 / slice 表一致。`1c57bb3` docs-only 未动 `package.json`。
2. **历史失败基线如实**（harness §2 · stub:31–33）：三 CMD 历史 EXIT **1/1/1** · FIX 末次实跑 · iso 21s quota-403 · ui 10P/2F/10S · perf HTTP full E2E fail。**不**把历史 EXIT 写成现状绿；trio stays **OPEN 1/1/1**。
3. **attempt 台账 / 恰一次 / 预期 EXIT=1**：stub:34–35 · harness §3.3 · slice:24–25 · Ban retry-to-green · Ban 只留绿 · Ban EXIT=1→flake · env-gap 须入 FAIL 原因。本审不预claim 任何 post-commit EXIT。
4. **Ban live**：stub:36 · harness §3.5/§5 · slice:24–28 贯穿。零 Key 加载安排；`actualSpendCny=null`；Key-blocked / `g7_path_disabled` ≠ pass/not_run wash；chromium 可装且 **chromium ran ≠ UI green**。
5. **收据落点**：`receipts/g7-trio-fresh/` 四文件约定在 harness §3.7 / stub:37；**本审实测该目录 ABSENT**（不预建不预填属实）。
6. **诚实条款 / pins**：`g7SuiteGreen=false` · Disclosure-1 OPEN · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · coveredCount=**8** · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 —— stub Pins 表:14–24 · harness:7–8 · slice:47–50 **无翻转**。跑绿一条 ≠ suite green；EXIT=0 ≠ covered ≠ HA；quota-403 removed ≠ suite green。
7. **边界**：零产品 / 零 prove 脚本 / 零 SSOT / 历史收据零改写 / nail 另授权 / Dual PASS ≠ coding ≠ 实跑 ≠ nail（stub:41 · harness:59–64 · slice:47–50）。
8. **强制 erratum 抽查**（独立 git）：
   - `cc8050d` = 2026-09-23 · `feat(g7): wire FreeTierOnly guards…`
   - `82981ff` = 2026-09-23 · `fix(g7): guard all outbound model paths…`
   - `b1d7b22` = **2026-10-02** · `test(g7): drop fail-open tautology…` · **1 file / 2-line test only** · = `offlineProvesAtCodeSha` · **≠** quota-403 移除
   - SSOT `gap-bug-backlog.md:367`：**禁止写「`b1d7b22` @ 2026-09-23」**；正确归因 **2026-09-23 `cc8050d`→`82981ff`**
   - **违写仍在**：harness `g7-trio-fresh-run.md:32` 写「quota-403 移除（`b1d7b22` @ 2026-09-23）」；peer model-op stub:31 同款。**本 e2e-ha REQUEST stub + slice 无该禁写配对**。按 erratum「归档不改写」+ peer C-2 先例 → **Condition C-2**，非 Blocker。

## Fail-trigger audit

- F1 历史绿暗示现状绿：未触发。
- F2 R1/TECH_ROLE 洗白：未触发（Disclosure-1 OPEN retained）。
- F3 live / Key 安排：未触发。
- F4 `g7SuiteGreen` 翻转 / 假绿 suite：未触发。
- F5 改 SSOT / covered / UC 行：未触发（`1c57bb3` 恰 4 md）。
- F6 retry-to-green / flake 记法：未触发。
- F7 预claim EXIT / 预建收据：未触发（目录 ABSENT）。
- F8 erratum 口径倒退：**部分触发（Condition）**——harness:32（+ peer stub:31）复写禁写「`b1d7b22` @ 2026-09-23」；「≠ suite green」结论正确；材料事实不变；登记 C-2。

## Blockers

无。

## Conditions

- **C-1（双签 / alone≠dual）**：Peer `mw-model-op` PASS @`ad8d68e` 在本签前为 alone。本 PASS = `mw-e2e-ha` 半签。双签齐后仍须**协调方另行授权**方可实跑；Ban live 贯穿；implementer 不自批。Dual PASS ≠ coding ≠ 实跑 ≠ nail。本文件不代签 peer。
- **C-2（强制 erratum · quota-403 归因）**：harness `g7-trio-fresh-run.md:32`（+ peer stub:31）违写「`b1d7b22` @ 2026-09-23」。正确：quota-403 移除 = **2026-09-23 `cc8050d`→`82981ff`**；`b1d7b22` = **2026-10-02** FR2 tautology drop / `offlineProvesAtCodeSha` only。归档 stub/harness 不改写；凡 receipt/`SUMMARY` 涉 quota-403 root cause 须正确归因并连带引用 `gap-bug-backlog.md:367`；nail 阶段 SSOT 登记本违写与更正指引（须协调方另行授权）。
- **C-3（恰一次 · EXIT 如实）**：三 CMD 各一次；红了不重跑；Ban retry-to-green / 只留绿 / EXIT=1→flake；预期 EXIT=1；env-gap 入 FAIL 原因。
- **C-4（Ban live）**：零 Key / 零 `.env*` / 零 model API；`actualSpendCny=null`；Key-blocked / `g7_path_disabled` ≠ pass/not_run wash；chromium 可装但 chromium ran ≠ UI green。本审自身未跑、不授权实跑。
- **C-5（收据卫生）**：落点 `receipts/g7-trio-fresh/` 四文件；逐 case FAIL（case 名+原因+分类）；Ban secrets；原始日志 `.tmp/`。
- **C-6（禁假绿 / pins）**：`g7SuiteGreen=false` · trio OPEN 1/1/1 · Disclosure-1 OPEN · pins 原值全保持；历史 EXIT≠suite green；quota-403 removed ≠ trio/suite green；EXIT=0 ≠ covered ≠ HA。
- **C-7（零产品 / 零 SSOT）**：Ban product/prove/`package.json`/lockfile/SSOT 改动；nail 另授权；历史收据零改写。
- **C-8（行号时效）**：wiring 以授权时 tip 重核；实跑 SHA = worktree HEAD；receipt commit ≠ 实跑 SHA。

## 中文三行摘要

1. 被审 `1c57bb3` docs-only 四 md；wiring `@377e7fc` `:246/:247/:250` 独立重数属实；历史 EXIT 1/1/1 基线如实；收据目录未预建；pins / Ban live / 恰一次 / 预期 EXIT=1 全在。
2. Blockers 无。主 Condition：harness:32 违写禁写「`b1d7b22` @ 2026-09-23」——正确归因 `cc8050d`→`82981ff`（C-2）；本 e2e-ha stub/slice 无该禁写。
3. 本 PASS = docs gate 半签，与 peer 合为 dual 材料；alone≠dual 已消，但仍须协调方授权才可实跑。Dual PASS ≠ coding ≠ 实跑 ≠ nail ≠ G7 green ≠ HA。coveredCount=8。

Verdict: PASS
