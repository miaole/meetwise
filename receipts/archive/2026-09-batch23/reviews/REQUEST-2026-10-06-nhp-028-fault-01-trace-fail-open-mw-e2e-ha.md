# REQUEST — **NHP-028-FAULT-01 · UC-028 FAULT trace-fail-open** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/nhp-028-fault-01-trace-fail-open.md` · slice `nhp-028-fault-01-trace-fail-open.slice.md`
**Parent tip**: `4766d4fc`（full `4766d4fc2a9d06f2d95a7ab7759430c4cc494bfc`；`git fetch origin` 当次网络失败 curl 28 · 本地 origin ref 为准 = 预期下限 · pre-exec 前复核线上 tip 未前进）
**Date**: 2026-10-06

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

## 选刀摘要（为何非 ① / 非 banned UCs）

Line X · ② 下一 NHP = **NHP-028-FAULT-01**（UC-E2E-028 FAULT · trace 写失败不阻塞业务 · A1 only）。① 判无实义：UC-001 无 covered-criterion 脚本（全仓仅 `scripts/uc-e2e-018-covered-criterion.proof.mjs` + evaluator）且 AB nail `6b878da` 后 UC-001 矩阵行逐列诚实（NEG/BOUND blind/case-only · FAULT partial · ADV blind · coveredCount=8）→ 无判据可对齐；且 UC-001 行被 Line AG（`NHP-001-ADV-01` · `626e0605`）占用。UC-028：backlog 下一刀顺序 #3（#1 025 / #2 004 排除）· NHP 矩阵 `:107` 具名 gap case · §1.0.1 `:127` 全 gap/blind 行 · seam=`packages/ai-runtime/src/invoke.ts:707-708`（persistTrace 与 settle/complete 同事务 · trace 失败连坐 `external_outcome_unknown` ≠ spec fail-open）。排除清单：**018/052/025/004/011/014/026/002/001**。

## 请审什么（mw-e2e-ha · 隔离证据层诚实 · Ban fake-green suite · Ban live）

1. **选刀**：UC-028 FAULT（A1 fail-open）vs ① 复核刀 / 027 blocked / 016-029 / 012-024 / 031-032 / 040-043 — 裁决是否成立；排除清单是否被遵守。
2. **F1 合同**：isolated 真 PG 上 trace INSERT 必败（首选 DB 层 trigger/REVOKE 注入 · 零产品 seam 冒充）→ 业务事务不被连坐：completed + 额度 settle confirmed（净变恰一次）+ 非 trace 连坐 `external_outcome_unknown` + 失败 trace 有结构化观测（不得静默无痕）。
3. **NEG 硬闸**（G7）：**F2** 业务真相（settle/钱/状态）写失败**必须阻塞**（Ban fail-open 泛化到真相）· **F4** 无双扣/无重复入账 · **F5** 失败 trace 不要求已补写（A2 recon 不冒充 · `GAP-UC028-RECON` stays gap）。缺任一 NEG 行 = 合同不成立。
4. **F3 positive control**：无注入同路径全绿，对照缺失即 Ban 假绿。
5. **product diff 声明**：本刀 WILL touch `packages/ai-runtime/src/invoke.ts`（拆旁路）+ 可选 production-off seam（沿 FI-3 先例）——与 AB prove-only 不同；coding 仅在 PRE dual PASS + 协调方授权后。
6. **老静态 prove 绊线**：接线后 `pnpm uc028:trace-fail-open:prove` 预期按自带 refuse 条款翻转 EXIT=1 = 设计绊线非回归；更新属另刀；Ban 静默改老 proof。
7. **EXIT0 ≠ covered**：EXIT0 = F1–F5 全绿具名 case 证据 ≠ covered ≠ e2e:isolated suite green ≠ A2/A3 闭合；UC-028 行/FAULT 保持 gap 措辞；coveredCount=8 冻结。**EXIT1 = 诚实保留**；attempts 全记录；Ban retry-to-green · Ban flake 记绿 · Ban 改断言迁就。
8. **PERF/LOAD**：不适用 → 显式 blind；Ban claim 容量/SLO。
9. **隔离与 Ban live**：isolated 真 PG · 零 live 模型 · 不加载 MODEL_API_KEY；Ban live default · Ban fake-green suite。
10. docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail；专家对 mw-e2e-ha + mw-rag-route（非隐私域 · 不换 privacy-int）是否成立。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual review — mw-e2e-ha（append-only · 2026-10-06）

**Reviewer**: `mw-e2e-ha`（adversarial evidence-honesty）· 审查文件本段末行 = Verdict · **alone ≠ dual · 不代签 mw-rag-route**（其 stub 仍 PENDING）
**Reviewed REQUEST**: `18a54b294634f4e74481e98152a194d6a42f3ecf`（`docs(e2e): REQUEST NHP-028-FAULT-01 trace-fail-open (pre_dual)`）
**Review worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-x-e2e-ha` · branch `rv/x-e2e-ha`（base = `feat/mysql-schema-skeleton` tip `62ef52bb`）· Ban push · 本审查 = docs-only · 未跑 prove · 未改产品码 · 未改 SSOT

### 链哈希诚实记录（discrepancy · 如实留痕）

- `18a54b2` 实际位于 `line/x-next-knife`，实际 parent = `4766d4fc`（NAIL GAP-UC025-FAULT-ISOLATED）——与本 stub 顶部「Parent tip `4766d4fc`」一致；审查简报所写 parent=`7c523fb` 与 `18a54b2` 实链不符（`7c523fb8` 在另一平行链位），如实记录、不回改。
- 本地 `feat/mysql-schema-skeleton` tip 链带 cherry-pick 等价提交 `496d275a`（同题 · 同 4 文件 · 235 insertions）；4 文件逐一 `git rev-parse <sha>：<path>` blob 比对 **IDENTICAL** → 两版等同审查。
- `git fetch origin` 未成功（github.com:443 不通 · 环境事实）→ 无法核线上 tip 未前进；本地分支为准（继承 harness 条款 → C-HA-3）。

### 检查表（逐项 · 命令/文件+行级证据）

| # | 项 | 证据（本 worktree 只读核实） | 判 |
|---|----|------------------------------|----|
| 1 | docs-only | `git show --stat 18a54b2` = 恰 4 新增 md（harness / slice / ha stub / rag-route stub）· 235 insertions · 零产品码/零 SSOT/零他线文件改动 | PASS |
| 2 | 选刀正当 | NHP 矩阵 `non-happy-path-perf-load-case-matrix.md:107` 逐字 `NHP-028-FAULT-01 · 028 · FAULT · api · persistTrace 失败 · gap · 静态 G-GAP`；coverage 矩阵 `e2e-requirement-coverage-matrix.md:127` UC-E2E-028 = gap/gap/gap/blind「fail-open 本是 FAULT UC；未接线」；backlog「下一刀顺序」#3（#1 UC-025 / #2 UC-004 均排除/占用）| PASS |
| 3 | 碰撞回避 | ① UC-001 无实义三理由核实：uc001 仅 `live-blocked`/`nhp-neg`/`nhp-bound` 三脚本、全仓 covered-criterion 仅 `scripts/uc-e2e-018-covered-criterion.proof.mjs`、AB nail `6b878da` 存在、AG 占行 REQUEST `626e0605`（NHP-001-ADV-01 re-PRE）存在 | PASS |
| 4 | seam 精确 | `packages/ai-runtime/src/invoke.ts:345` = `async function persistTrace(`；`:708` = `if (!error) await persistTrace(...)` 与 `settleAiTextCost`（:696）/`completeModelInvocation`（:703-706）同一 `asPrincipal` 事务；catch（:730-736）→ `markAiCostUnknown`+`markModelInvocationUnknown` → `return { error: 'external_outcome_unknown' }`（:736）。trace 失败连坐业务事务 = spec-code 失配直读成立 | PASS |
| 5 | spec 锚 | `ai-docs/requirements/use-cases/e2e-scenarios.md:548` UC-E2E-028：trace 失败**不回滚业务事务**→completed；A2 补写；A3 反例守卫「业务真相（钱/状态）写失败必须阻塞」——F1/F5/F2 与 spec A1/A2/A3 映射如实 | PASS |
| 6 | 触产品码方向正当 | backlog SSOT UC-028 covered-lift 行**预登记**「persistTrace 旁路 best-effort（与 settle 分事务）」→ 拆旁路 = 预登记方向非借刀发明；scope 声明窄（旁路 + 失败结构化观测 + 可选 production-off seam · 沿 `MEETWISE_CAREER_PATH_FAIL_THREAD_ID` 先例，该 env seam 于 `interview.service.ts:34` + `uc-e2e-004-career-path-fault.proof.ts` 实存）；coding 双闸（PRE dual PASS + 协调方授权）· 本 turn docs-only。边界缺口转 C-HA-1/C-HA-2 | PASS |
| 7 | 设计绊线诚实 | 老 proof `apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs:15-16` 自带 refuse 条款（「若产品浮出…拒 EXIT=0，须另刀 fail-open isolation prove」）+ `:168` 运行时 PRODUCT_SURFACE refuse —— harness/slice/stub 三处均如实预披露「接线后翻 EXIT=1 = 设计绊线非回归 · 更新属另刀 · **Ban 静默改老 proof**」；本 commit 老 proof 零改动 | PASS |
| 8 | F1–F5 机检性 | F1：DB 层 BEFORE INSERT trigger raise / REVOKE INSERT（零产品 seam 冒充 · Ban「不跑 trace」冒充「trace 失败」）→ 断言 completed + settle confirmed 净变恰一次 + 非连坐 `external_outcome_unknown` + 失败 trace 结构化观测（不静默无痕）；F2：真相写失败必须阻塞（业务不得 completed · 钱不得 confirmed · Ban 洗 flake）；F3：positive control 无注入全绿；F4：无双扣/无重复入账/无替代性扣费；F5：不要求补写 · `GAP-UC028-RECON` stays gap。**NEG 硬闸 F2+F4+F5 齐全（G7）** | PASS |
| 9 | EXIT 契约 | EXIT0 = F1–F5 全绿具名 case 证据 ≠ covered ≠ suite green ≠ A2/A3 闭合 · UC-028 行/FAULT stays gap · coveredCount=8 冻结；EXIT1 = 诚实保留；attempts 全台账；Ban retry-to-green / flake 记绿 / 改断言迁就 | PASS |
| 10 | 隔离 + 零 live | 三层壳 `scripts/run-e2e-isolated.mjs` 实存 · `uc025:nhp-fault-isolated:prove` 先例（package.json:161-162）· 拟名 `uc028:nhp-fault:prove` / `prove:uc028-nhp-fault` / `uc-e2e-028-nhp-fault.proof.ts` 无命名冲突 · Ban MODEL_API_KEY · fake provider 面 · DB 层注入不触发模型调用 | PASS |
| 11 | 禁碰 | 4 新文件均非 SSOT/他线在办文件；018/052/025/004/011/014/026/002/001 提及均为 Ban 清单引用非触碰；`GAP-UC028-*` 既有钉不动不洗 | PASS |
| 12 | Pins 原值 | 三文档逐字一致：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · UC-028 行 stays gap | PASS |
| 13 | 专家对 | 非隐私域论证成立（UC-028 = 可观测旁路/账本，非 PII 擦除/导出）；mw-rag-route stub 仍 PENDING 未被代签；Line C 域归属披露缺口 → C-HA-2 | PASS |

### Fail-trigger audit（授权后翻 FAIL 触发器 · 预挂）

- coding diff 超出「persistTrace 拆出 settle 事务为 best-effort 旁路 + 失败结构化观测 + 可选 production-off 测试 seam」任一边界（含 settle/complete/breaker MODEL-OP-02/model dispatch/catch 族语义任何变化 = Line C 域）→ 本 PASS 作废须重审。
- 静默删除/修改老 `uc028:trace-fail-open:prove` 文件或断言（其接线后 EXIT=1 是设计绊线）→ FAIL。
- F2 守卫失守（fail-open 泄漏到真相写）被洗成 flake / EXIT1 不留痕 → FAIL。
- 注入改用「不跑 trace」或产品内 seam 冒充 DB 层 trace 失败 → FAIL。
- 任何 covered 宣称 / UC-028 行翻动 / coveredCount≠8 / `GAP-UC028-RECON`·`TRUTH-BLOCK-E2E`·`INJECT` 被洗 → FAIL。
- attempts 不全记录 / retry-to-green / 改断言迁就 → FAIL。

### Blockers

无。

### Conditions

- **C-HA-1（coding 范围硬边界）**：授权后 coding 仅限 persistTrace 拆出 settle 事务为失败不回滚业务的 best-effort 旁路 + 失败结构化观测（日志/计数）+ 可选 production-off 测试 env seam；**Ban 借刀改 `invoke.ts` 其他区域**（settleAiTextCost / completeModelInvocation / breaker MODEL-OP-02 / model dispatch / catch 族 `external_outcome_unknown` 语义 = Line C 域）；POST dual 须逐行 diff 对照本边界核验。
- **C-HA-2（主链首刀域归属披露）**：本刀 = 全队列首个触 ai-runtime 主链（Line C 域）之刀，harness 专家对论证覆盖了 rag-route 与非隐私域、未披露 Line C 域归属（Line C nail `2f23ed3` post_live_dual_pass 后无冻结条款，但域归属须记录）。coding 授权前协调方须确认主链可动；coding 落地后 POST dual 至少一位审者按 C-HA-1 复核 diff。
- **C-HA-3（origin tip 复核）**：github 443 不通未核线上 tip；coding 授权前须复核 origin `feat/mysql-schema-skeleton` 未前进越 REQUEST 等价位（cherry-pick 链语义下以内容 blob 为准）。
- **C-HA-4（cosmetic）**：harness F2 行存在多余 `**` 措辞瑕疵；另刀顺手修，不阻断本 PASS。

### 三行中文摘要

1. `18a54b2` 4 文档 docs-only，全部锚点逐字核实：seam `invoke.ts:708` persistTrace 与 settle/complete 同事务、trace 失败连坐 `external_outcome_unknown` 直读成立；NHP 矩阵 `:107`、coverage 矩阵 `:127`、backlog #3、spec `e2e-scenarios.md:548` 精确；老 prove refuse 绊线如实预披露；F1–F5 NEG 硬闸齐全可机检；Pins 原值零漂移；禁碰清单遵守。
2. 主链首刀（Line C 域）有正当性：拆 persistTrace 旁路 = backlog SSOT 预登记方向、scope 窄、coding 受 PRE dual + 协调方双闸；但 harness 未显式 Ban 借刀改 invoke 其他逻辑/披露 Line C 域归属 → 转 Conditions C-HA-1/C-HA-2，非 Blocker。
3. 链哈希如实留痕：`18a54b2` 在 `line/x-next-knife`（parent `4766d4fc`），tip 链等价 `496d275a`（4 文件 blob 同），origin 443 不通未核 → C-HA-3；alone ≠ dual · 不代签 mw-rag-route（其 stub 保持 PENDING）。

Verdict: PASS

---

# POST-PROVE dual 复审（mw-e2e-ha · evidence-honesty · 2026-10-07）

**对象**：`line/x-next-knife` @ `b16916fe`（parent=`017a178d` · 7 files +562/−1 · author `mw-core <mw-core@meetwise.local>`）
**审位**：独立 worktree `rv/xp-e2e-ha`（`/Users/miaole/Desktop/golucky/meetwise-rv-xp-e2e-ha`）· 禁 push · 本审段不代签 mw-rag-route（alone ≠ dual）
**焦点**：主链首刀 POST-PROVE —— C-HA-1 逐行 diff 复核 + fresh re-run + 绊线复现 + attempts 裁决

## 1. Fresh re-run（C-DUAL-FROM-FRESH · 审者本机独立复跑）

| Run | CMD（审者侧恰一次有效执行） | EXIT | 结果 |
|-----|------------------------------|------|------|
| `pnpm install --frozen-lockfile` | worktree 内全新安装 | 0 | Done（3.9s） |
| **新 prove** | `pnpm uc028:nhp-fault:prove` | **0** | **CHECKS=40 FAIL=0 (none)** · F1–F5+ISO+PIN 全绿 · 全新容器 `meetwise-e2e-39831-1791309046340` · PGPORT=62091 · nonce 新签（非日志重放）· `OBSERVATION_LOG_LINE {"event":"ai_trace_persist_failed",...,"pgCode":"P0001"}` 实证 |
| 老 prove（invoke-name 失误，如实入账） | `pnpm uc028:trace-ledger-fail-open:prove` | 254 | `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command not found` —— **script 名不存在，prove 未执行任何断言/容器**（正确 script 名为 `uc028:trace-fail-open:prove`；`trace-ledger-fail-open` 仅是 proof 文件名）。非 prove 尝试，不构成 retry |
| **老 prove** | `pnpm uc028:trace-fail-open:prove` | **1** | **S2-persistTrace-coupled-in-settle-txn FAIL + G-GAP-product-surface-or-pins FAIL（`PRODUCT_SURFACE … refuse gap EXIT=0` 逐字触发）· S1/S3/S4/S5 PASS · GAPS=0** —— 与 receipt `.tmp/uc028-old-prove-flip.log` 模式逐行一致，设计绊线独立复现，非回归 |

审者日志留痕：`.tmp/.tmp-rv-ha-uc028-nhp-fresh.log` · `.tmp/.tmp-rv-ha-uc028-old-flip.log`（审者 worktree `.tmp/` 留存 · 按仓惯例不入提交）。与 receipt attempt-4（40/40 EXIT0）一致 → 无重大发现。

## 2. C-HA-1 逐行核验表（`git diff 017a178d b16916fe -- packages/ai-runtime/src/invoke.ts` · 全部 hunk 实读）

Diff 全文件**恰 2 hunk**（机器可复核），逐行对照结论：

| 区域 | receipt 声明行号 | 实测（b16916fe） | 核验 |
|------|------------------|------------------|------|
| 新增 `persistTraceBestEffort`（旁路 + `.catch` 计数 + 单行 JSON 日志） | `:371-397` | `:370-394`（doc 注释 `:370-376` · 函数体 `:377-394`；receipt 行号 ±3 漂移，非实质） | 纯新增。`asPrincipal(pool,…)` 自开独立 BEGIN/COMMIT 事务（`principal.ts:945` 实读）· `.catch` 内 `inc(METRIC.aiTracePersistFailures)` + `console.error(JSON.stringify({event,service,idempotencyKey,errorName,pgCode}))` —— 无 owner/原文/堆栈，脱敏纪律成立 |
| `:708` 原 `if (!error) await persistTrace(c,…)` 移出事务 | `:735-738` 注释 + `:739` 调用 | 事务体内 `:735-737` 注释 · 事务回调闭合 `:738` · `:739` `if (!error) await persistTraceBestEffort(pool,…)` | `if (!error)` 门控条件与原实现逐字一致；调用点在 settle/complete 事务**提交后**旁路执行 |
| `settleAiTextCost` | `:723` 逐字节未动 | `:723` 于 diff 中为未改动上下文行 | 零 diff |
| `persistValidatedOutput` | `:729` 逐字节未动 | `:729` 未改动上下文行 | 零 diff |
| `completeModelInvocation` + `model_invocation_complete_state` | `:730-734` 逐字节未动 | `:730-734` 未改动上下文行 | 零 diff |
| catch 族（`settlement_or_record_failed` → `external_outcome_unknown`） | `:747-767` 逐字节未动 | `:751-767`（`catch {` 在 `:751`）未改动上下文行 | 零 diff；且 F2a/F2b 运行时实证 `error_code=settlement_or_record_failed` + 返回 `external_outcome_unknown`（语义活着且原样） |
| breaker MODEL-OP-02 / dispatch | 未动 | success `:742-746` · catch `:756-759` · 派发路径全部未改动上下文行 | 零 diff；F1/F3/F4 派发计数断言绿 |
| `metrics.ts` 计数注册 | `:98-99` + `:141` | `:99`（`aiTracePersistFailures: 'ai_trace_persist_failures_total'`，注释 `:98`）+ `:141`（基线 0 序列） | 一致；纯 additive |

**业务结算语义裁决**：settle→persistValidatedOutput→complete 原子事务、失败 catch 族 unknown 收口、breaker 相位、钱账/状态真相面全部原样。唯一语义变化即授权边界本身（trace 由同事务原子写变为提交后 best-effort 旁路）：崩溃窗口可能丢 trace（fail-open 设计本意，代码注释 + spec A1 锚显式声明，A2 recon 域不在本刀）；`ON CONFLICT DO NOTHING` 幂等保留，replay 早退于 durable claim（F4 实证无双写）。**C-HA-1 = 遵守，PASS。**

## 3. F1–F5 断言实读（`apps/api/test/uc-e2e-028-nhp-fault.proof.ts` file:line · 40 断言 = ISO3+F1 8+F2 12+F3 4+F4 6+F5 3+PIN 4）

| id | 断言落点 | 实读裁决 |
|----|----------|----------|
| F1 | `:206-236`（8 断言） | trace 必败注入生效（`:222` count=0）· 业务 completed（`:223-225` value/status=succeeded/settled 90）· 非连坐 `external_outcome_unknown`（`:223` 显式）· 观测在案（`:228-235` 计数=1 + JSON 日志 pgCode=P0001）—— 与 fresh re-run 输出一致 |
| F2 | `:238-267`（F2a 6 + F2b 6） | 真相写失败阻塞：`external_outcome_unknown`（`:244/:259`）· status=unknown（`:246/:261`）· 钱账 unknown∧NULL（`:247-248/:262-263`）· **`settlement_or_record_failed` 实证原 catch 族收口**（`:249`）· 真相失败不误触 trace 观测（`:250-251/:265-266`）· F2 面预算零净变（`:264`）· 无自动重试 |
| F3 | `:269-285`（4 断言） | 无注入对照全绿（trace 50/20/service 命中 + settled 90 + 预算 180）→ F1 失败确由注入引起，无假绿 |
| F4 | `:287-299`（6 断言） | 无双扣：replay 命中缓存同 value · 模型恰 1 调 · reservation 恰 1 行 settled·90 · invocation 恰 1 行 · 预算不变 180 · 无 released/unknown 替代性扣费 |
| F5 | `:301-307`（3 断言） | recon 不冒充：f1 trace 仍=0（不补写）· 计数仍=1 · `invoke.ts` 无 rewrite/backfill/recon 符号（`:304-306` 正则机检）· `GAP-UC028-RECON` stays gap（`:307` PIN） |
| PIN | `:310-319`（4 断言） | C-HA-1 机检对照：旁路在事务外 + settle/complete/catch 族符号仍在原区域 —— 与本审逐行 diff 结论互相印证 |

## 4. Attempts 1-4 性质裁决（receipt「全台账」vs 审者实证）

| Attempt | 审者实证 | 裁决 |
|---------|----------|------|
| 1 EXIT1 | `unsupported_e2e_target`（runner allowlist 未注册）—— 产品码未被执行 | 接线缺口，prove-harness 侧 |
| 2 EXIT1 | `repoRoot` 三级上溯缺失 → 读 `apps/packages/db/sql/01_schema.sql` ENOENT —— ISO 断言已过，产品码未触 | proof 文件自身缺陷，prove-harness 侧 |
| 3 EXIT1（40 CHECKS FAIL=6） | attempt3 日志 `:51` 实证 f3 键 trace INSERT 失败 `pgCode=42703`（三表共用 trigger 函数，plpgsql 字段解析不随 IF 短路）→ F3 trace FAIL + F5 计数=2 FAIL 全解释；fakeModel `prepare.execute` 未路由 `model.call` → F1/F2a/F2b/F4 四处「仅派发一次」FAIL 全解释；**同日志 PIN 1-4 全 PASS → 产品码在 attempt-3 时已具最终形态**；两处修复（每表独立 trigger 函数 proof.ts`:175-203` · fakeModel 路由 `:85`）只存在于 proof.ts，committed invoke.ts 无任何 trigger/fakeModel 代码 | 两缺陷均 prove-harness 侧；**产品码零改动**（证据链：attempt-3 PIN PASS + 最终 diff 仅旁路 + 修复落点全在 proof.ts；注：attempts 间产品码无逐字节快照，此为证据链推定而非字节直证，如实记录） |
| 3→4 断言集 | attempt3 vs attempt4 的 40 个断言名 `diff` = 空集（审者机检） | 断言文本零改动 → 修复演进非 wash、非改断言迁就 |

## 5. 条件裁决

| Cond | 裁决 | 依据 |
|------|------|------|
| **C-HA-1**（coding 硬边界） | **满足 · 关闭** | §2 逐行表：diff 恰 2 hunk，settle/complete/catch/breaker/dispatch 零 diff，F2 运行时语义实证，PIN 机检互证 |
| **C-HA-2**（主链首刀域披露） | **满足 · 关闭** | receipt 显式记录 Line C 域；本审逐行复核证实 Line C 域零改动；POST dual「至少一位审者复核」由本段兑现 |
| **C-HA-3**（origin tip 复核） | **满足 · 关闭** | 审者实测 `origin/feat/mysql-schema-skeleton` = `017a178d`（`rev-list --count 017a178d..origin` = 0），parent 链无漂移 |
| **C-HA-4**（harness F2 行 `**` cosmetic） | **开放 · 不阻断**（按条款留另刀） | 本刀未改 harness 文件（7 文件清单实证），与条款一致 |
| **rag C-1**（base 前进） | **满足** | parent `017a178d` = 实测 origin tip；seam 行号与 PRE 审核行号吻合 |
| **rag C-2**（审位披露） | **满足** | 提交 author=mw-core，7 文件无任何 rv/* 审者路径 |
| **rag C-3**（prove 期冻结） | **满足** | 老 prove 文件 parent↔tip MD5 同（`e22048cd…`，git diff 空）；其翻转 EXIT=1 由审者独立复现（§1） |

## 6. Fail-trigger audit（POST 面预挂触发器逐查）

- coding 超边界 → 无（§2）· 静默改/删老 proof → 无（MD5 链）· F2 守卫洗 flake → 无（F2 十二断言 fresh 全绿）· 产品 seam 冒充注入 → 无（DB 层 BEFORE INSERT/UPDATE trigger，P0001 实证）· covered 宣称/行翻动/GAP 洗白 → 无（Pins 冻结 · F5 显式 stays-gap）· retry-to-green/改断言 → 无（attempts 4 次全台账 · 断言集 diff 空集）

## 7. Blockers

无。

## 8. Conditions（移交协调方）

- **CD-1**：C-HA-4（harness `**` cosmetic）仍开放，另刀顺手修，不阻断本 PASS。
- **CD-2**：attempts 1-3 产品码零改动为证据链推定（PIN PASS + 修复落点 + 最终 diff 三点闭合），非逐字节直证；已如实记录于 §4，不影响裁决。
- **CD-3**：审者侧老 prove 曾有一次 script 名打错（`trace-ledger-fail-open` vs 注册名 `trace-fail-open`），prove 未执行即失败，已如实入 §1；有效执行恰一次 EXIT=1。

## 三行中文摘要

1. POST-PROVE dual 独立复验：审者 worktree fresh re-run 新 prove 恰一次 **EXIT=0 · CHECKS=40 FAIL=0**（全新容器 nonce 非重放），老 prove 恰一次 **EXIT=1** 且 S2 耦合断言 + G-GAP refuse 条款逐字翻转复现 receipt 预告的绊线，两跑与台账零分歧。
2. C-HA-1 逐行核验：`invoke.ts` diff 恰 2 hunk（`:370-394` 新增旁路 + `:708→:739` 拆出），settle(`:723`)/persistValidatedOutput(`:729`)/complete(`:730-734`)/catch 族/breaker/dispatch 零 diff 且 F2 `settlement_or_record_failed` 运行时实证原语义；attempts 1-3 三次 EXIT1 全为 prove-harness 侧缺陷（allowlist/repoRoot/42703+路由，日志逐条实证），断言集 diff 空集，修复演进非 wash。
3. 条件全裁决：C-HA-1/2/3 + rag C-1/2/3 关闭，C-HA-4 留另刀；`GAP-UC028-RECON` 等 stays gap、EXIT0≠covered、coveredCount=8 冻结；alone≠dual 不代签 mw-rag-route；本审 worktree 提交禁 push。

Verdict: PASS
