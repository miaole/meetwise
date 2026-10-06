# REQUEST — **NHP-028-FAULT-01 · UC-028 FAULT trace-fail-open** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
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

## 为何 mw-rag-route（域说明）

UC-028 面 = **ai-runtime invoke→settle→complete 链路的可观测旁路**（`ai_invocation_trace` 写失败语义）：trace 是调用链/路由可观测性的账本，其失败处理直接影响 retrieval/调用链降级叙事的可信度；属 mw-rag-route 域内（调用链/路由观测耦合）。**非隐私域**（非 PII 擦除/导出/checkpoint）→ 不换 mw-privacy-int。peer = `mw-e2e-ha`（隔离证据层主场）；不代签。

## 选刀摘要（为何非 ① / 非 banned UCs）

Line X · ② 下一 NHP = **NHP-028-FAULT-01**（UC-E2E-028 FAULT · trace 写失败不阻塞业务 · A1 only）。① 判无实义：UC-001 无 covered-criterion 脚本（全仓仅 `scripts/uc-e2e-018-covered-criterion.proof.mjs` + evaluator）且 AB nail `6b878da` 后 UC-001 矩阵行逐列诚实（NEG/BOUND blind/case-only · FAULT partial · ADV blind · coveredCount=8）→ 无判据可对齐；且 UC-001 行被 Line AG（`NHP-001-ADV-01` · `626e0605`）占用。UC-028：backlog 下一刀顺序 #3（#1 025 / #2 004 排除）· NHP 矩阵 `:107` 具名 gap case · §1.0.1 `:127` 全 gap/blind 行 · seam=`packages/ai-runtime/src/invoke.ts:707-708`（persistTrace 与 settleAiTextCost/completeModelInvocation 同事务 · trace 失败连坐 `external_outcome_unknown` ≠ `e2e-scenarios.md` UC-E2E-028 spec fail-open）。排除清单：**018/052/025/004/011/014/026/002/001**。

## 请审什么（mw-rag-route · 调用链观测旁路诚实 · Ban fake-green suite · Ban live）

1. **选刀**：UC-028 FAULT（A1 fail-open）vs ① 复核刀 / 027 blocked / 016-029 / 012-024 / 031-032 / 040-043 — 裁决是否成立；排除清单是否被遵守。
2. **trace 语义合同**：F1（trace INSERT 必败 → 业务 completed + 额度 confirmed + 非 trace 连坐 `external_outcome_unknown` + 失败 trace 结构化观测，不得静默无痕）是否与 spec「trace 是旁路非真相」一致；旁路拆出后**不得反向污染** settle/retrieve 的 fail-closed 叙事（G-R2-5 等既有裁决不动、不洗）。
3. **NEG 硬闸**（G7）：**F2** 业务真相写失败必须阻塞 · **F4** 无双扣/无重复入账 · **F5** 失败 trace 不要求已补写（`GAP-UC028-RECON` stays gap · 不冒充 recon）。缺任一 = 合同不成立。
4. **F3 positive control**：无注入同路径全绿；对照缺失 = Ban 假绿。
5. **product diff 声明**：本刀 WILL touch `packages/ai-runtime/src/invoke.ts`（persistTrace 拆出 settle 事务为 best-effort 旁路 + 失败结构化观测；可选 production-off seam 沿 FI-3 先例）——与 AB prove-only 不同；coding 仅在 PRE dual PASS + 协调方授权后。
6. **老静态 prove 绊线**：接线后 `pnpm uc028:trace-fail-open:prove` 预期按自带 refuse 条款翻转 EXIT=1 = 设计绊线非回归；更新属另刀；Ban 静默改老 proof。
7. **EXIT0 ≠ covered**：EXIT0 = F1–F5 全绿具名 case 证据 ≠ covered ≠ suite green ≠ A2/A3 闭合；UC-028 行/FAULT 保持 gap 措辞；coveredCount=8 冻结。**EXIT1 = 诚实保留**；attempts 全记录；Ban retry-to-green · Ban flake 记绿 · Ban 改断言迁就。
8. **PERF/LOAD**：不适用 → 显式 blind；Ban claim 容量/SLO。
9. **隔离与 Ban live**：isolated 真 PG · 零 live 模型 · 不加载 MODEL_API_KEY；Ban live default · Ban fake-green suite · Ban 伪造模型输出质量断言（质量归 ai-eval，本刀不测质量）。
10. docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual 审查段（mw-rag-route · 2026-10-07 · route/ai-runtime 域边界焦点）

**审查方法**：独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-x2-rag-route`（branch `rv/x2-rag-route`，base=`origin/feat/mysql-schema-skeleton` tip `71713718`）· REQUEST `496d275a` 全文以 `git show 496d275a:<path>` 核对 · 产品码只读双面（`invoke.ts` @`496d275a` 与 @`71713718`）· 未读 peer（mw-e2e-ha）stub 原文、独立审 · 本段 append-only · 所有结论附可复现命令证据。

### 检查表（16 项 · 逐项证据）

| # | 维度 | 结论 | 证据（可复现） |
|---|------|------|----------------|
| 1 | docs-only | ✅ | `git show --stat 496d275a` = 4 个新增 .md（harness/slice/双 stub）· 235 insertions · 0 deletions · 零产品码/零 SSOT/零禁碰行文件 |
| 2 | seam 真实性 | ✅ | `invoke.ts:345` persistTrace 定义；`:696` `settleAiTextCost`、`:703` `completeModelInvocation`、`:708` `if (!error) await persistTrace(...)` 同一 `asPrincipal` 事务；catch 分支 `feeStatus:'unknown'`·`reasonCode:'settlement_or_record_failed'` → `:736` return `external_outcome_unknown` —— 与 REQUEST「trace 失败连坐」描述逐字吻合 |
| 3 | seam 对当前 tip 仍有效 | ✅ | `git diff 416b6a5b 71713718 -- packages/ai-runtime/src/invoke.ts` 为空（fork→现 tip 字节不变）；@`71713718` 同为 `:708` |
| 4 | 域边界最小性 | ✅ | 声明产品 diff 仅 persistTrace 拆旁路 + 失败结构化观测 + 可选 production-off seam；`MEETWISE_CAREER_PATH_FAIL_THREAD_ID` 先例实测存在（`apps/api/src/modules/interview/interview.service.ts` + `apps/api/test/uc-e2e-004-career-path-fault.proof.ts`）；settle/complete/breaker/dispatch（Line C 域）零触碰 |
| 5 | trace=审计账语义 | ✅ | F1 期望含「失败 trace 结构化观测（日志/计数）· 不得静默无痕」→ Ban 静默丢已入合同；Ban 反向污染 settle/retrieve fail-closed（G-R2-5 等既有裁决不动、不洗） |
| 6 | 老 prove 绊线如实预披露 | ✅ | 老 proof `apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs:15`「若产品浮出…→ 拒 EXIT=0」+ `:168` PRODUCT_SURFACE refuse 条款实测在 —— 「接线后翻转 EXIT=1」系自带条款的如实转述；stub #6 + slice Ban 静默改老 proof ✓ |
| 7 | spec 锚 | ✅ | `ai-docs/requirements/use-cases/e2e-scenarios.md:548` UC-E2E-028：A1 trace 失败不回滚业务 → completed+额度 confirmed；反例守卫=真相（钱/状态）写失败必须阻塞；A2=对账补写 —— F1/F2/F5 与 spec 1:1 |
| 8 | 矩阵引用 | ✅ | NHP 矩阵 `:107` NHP-028-FAULT-01=**gap**；覆盖矩阵 `:127` UC-E2E-028 gap/gap/gap/blind —— @`496d275a` 与 @`71713718` 逐字一致 |
| 9 | gap 认领边界 | ✅ | 仅认领 `GAP-UC028-FAIL-OPEN`；`GAP-UC028-RECON/TRUTH-BLOCK-E2E/INJECT` 仍 open（既有 harness `uc-e2e-028-trace-ledger-fail-open.md` S1–S5+G-GAP-1..4 实测在）→ F5 recon 不冒充 ✓ |
| 10 | F1–F5 可机检 | ✅ | F1/F3/F4 = isolated 真 PG 状态断言（completed/settle confirmed/净变恰一次/无注入对照全绿）；F2 = 真相写必败注入 + 阻塞断言；F5 = 失败 trace 观测存在性 + recon 缺席断言；NEG 硬闸三行（F2/F4/F5）缺一即合同不成立 —— 断言均可机检 |
| 11 | 零 live | ✅ | 注入=DB 层（BEFORE INSERT trigger / REVOKE INSERT）不触模型、不依赖产品码；Ban「不跑 trace」冒充「trace 失败」在案；驱动走 fake provider 面 + Ban 加载 `MODEL_API_KEY`（可 env 断言） |
| 12 | 隔离壳三层 | ✅ | 先例 `uc025:nhp-fault-isolated:prove` 实测在（package.json `:161-162` → `scripts/run-e2e-isolated.mjs` → `prove:uc025-nhp-fault-isolated` → proof.ts）；拟 `uc028:nhp-fault:prove` 同构 |
| 13 | EXIT 契约诚实 | ✅ | EXIT0≠covered≠suite green≠A2/A3 闭合；UC-028 行/FAULT 保持 gap 措辞；coveredCount=8 冻结；EXIT1 诚实保留；attempts 全台账；Ban retry-to-green/flake 记绿/改断言迁就 |
| 14 | Pins 原值 | ✅ | 与共享台账 `ai-docs/delivery/PARALLEL-DISPATCH-2026-10-02.md:3`（所有线共用·禁止改口）@`71713718` 逐字一致：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（实测 `privacy.service.ts:56,67` SERVICE_UNAVAILABLE） |
| 15 | 禁碰 | ✅ | `496d275a` 只新增 4 个 nhp-028 具名文件；UC-018/052/025/004/011/014/026/002/001 行与文件、AG/W/AB 在办文件、SSOT 均零触碰 |
| 16 | 权限卫生 | ✅ | docs-only 本 turn · Ban coding/prove/push/force-push/secrets · alone≠dual · Ban self-approve/self-nail · 非隐私域论证在案（peer=mw-e2e-ha，不代签） |

### Fail-trigger audit（触发 FAIL 的情形 · 逐一排查）

- seam 引用失实（行号/同事务关系错）→ 实测吻合（#2/#3），未触发。
- 老 prove 无 refuse 条款却预披露「翻转 EXIT=1」→ 条款实测在（#6），未触发。
- 借刀扩域（动 settle/complete/breaker/dispatch 或真相写语义）→ 声明范围最小且 F2 显式 Ban 泛化 fail-open（#4/#5），未触发。
- 拆旁路后 trace 静默丢（无观测）→ F1 合同含结构化观测硬断言（#5），未触发。
- F1–F5 不可机检 / NEG 缺行 / 缺 positive control → F2/F4/F5 硬闸 + F3 对照齐备（#10），未触发。
- EXIT0 偷翻 covered / 行翻 gap → 契约冻结 + 矩阵行两 ref 一致（#13/#8/#9），未触发。
- Pins 改口 → 与共享台账逐字一致（#14），未触发。
- base tip 前进而未复核 → **触发为事实**（见 C-1）：tip 已前进，但 docs 自带「pre-exec 前复核」条款在案，且复核结果 seam/矩阵/Pins 全部存活 → 降级 Condition，不构成 FAIL。

### Blockers

无。

### Conditions

- **C-1（base 前进 · EXEC/coding 前必办）**：REQUEST 声明 parent tip=`4766d4fc` 并自带「pre-exec 前复核线上 tip 未前进」条款。实测：origin tip 已前进至 `71713718`；X 链（`45e1ac42`→`496d275a`）自 `416b6a5b` 分叉，`4766d4fc` 非 `496d275a` 祖先，`496d275a..71713718` = 178 commits。缓解实测：`packages/ai-runtime/src/invoke.ts` fork→tip 字节不变、矩阵 `:107`/`:127` 行不变、共享 Pins 台账不变 → seam 锚与全部引用存活。**EXEC/coding 授权前**：X 链须 rebase 至当前 origin tip（或协调方显式改派 base）、重申 parent tip 并复核 seam 行号；rebase 后若 `invoke.ts` 受影响，本 dual 须回炉重审。
- **C-2（审位披露）**：本 dual 于独立 worktree（base=tip `71713718`）执行；REQUEST `496d275a` 以 `cherry-pick -x`（author=mw-core 保留，本 worktree 映射为 `a7629052`）引入以作 append 审查——仅为审查副本，不改写 X 正链（`rv/x-e2e-ha`）；正式链仍以其为准。
- **C-3（prove 期冻结项）**：授权后 prove 须保持三层隔离壳同构接线（`run-e2e-isolated.mjs` → raw → proof）；新脚本零改动老 `uc-e2e-028-trace-ledger-fail-open.proof.mjs`——其接线后翻转 EXIT=1 为设计绊线，须如实入 receipt，Ban 借新刀静默改老 proof（本条即 stub #6 的执行形态）。

### 三行中文摘要

1. REQUEST `496d275a` 全部可核引用实测为真：seam（`invoke.ts:708` persistTrace 与 settle/complete 同事务、失败连坐 `external_outcome_unknown`）、老 prove 自带 refuse 条款、spec/矩阵/gap 认领边界、Pins 共享台账逐字一致，docs-only 零越界。
2. F1–F5 注入合同与 spec A1/A3 反例守卫/A2 边界 1:1：NEG 硬闸（F2 真相写必须阻塞 · F4 无双扣 · F5 recon 不冒充）+ F3 对照齐备可机检；DB 层注入零 live；EXIT0≠covered、UC-028 行 stays gap、coveredCount=8 冻结，EXIT 契约诚实。
3. 唯一实质发现 = base tip 已前进（声明 `4766d4fc` → 实测 tip `71713718`，X 链 fork=`416b6a5b`，落后 178 commits），docs 自带复核条款触发，但 seam 文件字节不变、全部引用存活 → 降级为 EXEC 前 rebase 条件 C-1，非 Blocker。

Verdict: PASS

---

## POST-PROVE dual 审查段（mw-rag-route · 2026-10-07 · route/ai-runtime 域边界焦点）

**审查方法与审位（C-2 披露）**：独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-xp-rag-route`（branch `rv/xp-rag-route` · 自 `line/x-next-knife` tip `b16916fe65c54125ae2fbec0a6ff6f6bfcc7ec54` 新建），直接审 committed tip 状态；产品码只读零改动；git 写操作仅限本 worktree 本审查提交（Ban push）；未读 mw-e2e-ha 审段原文、独立审；**不代签 mw-e2e-ha · alone≠dual**。本段 append-only。审查对象 = 收包申报 commit `b16916fe`（`git rev-parse line/x-next-knife` 实测一致；其 parent `017a178dedbf37fe4bd44874dfebf3f0e56d99a4` = `origin/feat/mysql-schema-skeleton` 实测值）。

### Fresh re-run（恰好一次 · 禁重试遵守）

- CMD：`pnpm uc028:nhp-fault:prove`（本 worktree · 先 `pnpm install --frozen-lockfile`）· **EXIT=0 · `CHECKS=40 FAIL=0`** · 恰一次运行 · 零重试。日志 `.tmp/mw-rag-route-fresh-rerun.log` + 隔离收据 `.tmp/isolated-proof-receipts/2026-10-06T18-10-23-734Z-44522-2088abb9-bb91-49fe-802f-22f95d332d36.json`（本 worktree 落盘实证）。
- 隔离实证（本 run 原文）：`ISO_SHELL  PGPORT=64145 E2E_ISOLATED=1 E2E_TEST_CONTAINER=meetwise-e2e-44522-1791310218191`；零 live key 双断言 PASS（MODEL_API_KEY / DASHSCOPE_API_KEY 缺席）；DB 层 trigger 注入；fake provider 面。
- **Ban 静默丢——结构化观测实读（不采信 receipt 转述）**：本 run 自产 `OBSERVATION_LOG_LINE  {"event":"ai_trace_persist_failed","service":"uc028-fault-probe","idempotencyKey":"uc028-f1:muwzuubawjpuhm","errorName":"error","pgCode":"P0001"}`；F1 计数断言 `ai_trace_persist_failures_total=1` PASS；F2a/F2b 真相失败不误触发（计数仍=1）；F5 观测不丢失（仍=1）。→ 旁路失败被 **计数 + 单行 JSON** 双通道观测，无静默无痕路径；且日志只含稳定标量、无 owner/原文/堆栈（脱敏纪律实测）。

### 域边界核验（核心职责 · 逐行）

`git diff 017a178d b16916fe -- packages/ai-runtime/` 实测 = 仅 `invoke.ts` 2 hunk + `metrics.ts` 2 处，无其它：

| 位置 | 实测 | 判定 |
|---|---|---|
| `invoke.ts:370-395` 新增 `persistTraceBestEffort` | 独立 `asPrincipal` 事务内调 `persistTrace`；`.catch` = `getMetrics().inc(METRIC.aiTracePersistFailures)` + `console.error` 单行 JSON（仅 event/service/idempotencyKey/errorName/pgCode） | ✅ 仅旁路+观测 |
| `invoke.ts:735-738` 注释 + `:739` 新调用 | 事务体内原 `if (!error) await persistTrace(c,…)`（base `@017a178d` 实测在 `:708`）删除、移出事务；settleAiTextCost(`:723`)/persistValidatedOutput(`:729`)/completeModelInvocation(`:730-734` + `model_invocation_complete_state`)/catch 族(`:766` return `external_outcome_unknown`) 全部在位逐字节未动 | ✅ `:708`→`:739` 如实 |
| `metrics.ts:98-99` + `:141` | METRIC 增 `aiTracePersistFailures: 'ai_trace_persist_failures_total'`（单一真源 · Prom 命名）+ `registerBaselineMetrics` 0 序列注册 | ✅ 仅观测 |
| invoke.ts 其余全部 | diff 无其它 hunk → settle/complete/breaker（MODEL-OP-02）/dispatch/catch 族逐字节未动（prove 内 PIN 4 项机检亦全 PASS） | ✅ |

全仓 `git diff --name-status 017a178d b16916fe` = 7 文件：receipt（新）/ root `package.json`（+2 script `:163-164`）/ `apps/api/package.json`（+1 script `:60`）/ `scripts/run-e2e-isolated.mjs`（+target：来源表 `:141-163`、allowlist `:1539`）/ 新 prove `apps/api/test/uc-e2e-028-nhp-fault.proof.ts`（新）/ 上述 2 产品文件 → **零 RAG-FUNNEL / route / 题库路径触碰 · 零禁碰行文件（UC-018/052/025/004/011/014/026/002/001）· 零 SSOT/矩阵改动**。

### F1–F5 × spec 复核 + EXIT 契约 + attempts 裁决

- spec 锚实测：`ai-docs/requirements/use-cases/e2e-scenarios.md:548` 恰为 `## UC-E2E-028` 标题行。主流程 1)「trace 写入失败**不回滚业务事务**」→ F1 八断言（trace=0 · invoke 返回 value 非 `external_outcome_unknown` · status=succeeded · reservation settled=90 净变恰一次 · 预算=90 · 单次派发 · counter=1 · JSON 日志）；反例守卫「业务真相（钱/状态）写失败必须阻塞」→ F2a 状态 / F2b 钱全阻塞（`external_outcome_unknown` · status=unknown · settled_micro_cny IS NULL · `error_code=settlement_or_record_failed` 原 catch 收口不动）；A2 对账补写 → F5 显式不做（trace 仍=0 · invoke.ts 无 recon 符号机检 · `GAP-UC028-RECON` stays gap）。F1–F5 与 harness 注入合同及 spec 1:1；isolated 面无 interview 实体，「额度仍 confirmed」按 harness 合同映射为 reservation settled + 预算账本 settled 恰一次（断言面 receipt 如实披露，非偷换）。
- EXIT 契约诚实：run 输出与 receipt 双面钉死 **EXIT0 ≠ covered ≠ e2e:isolated suite green ≠ A2/A3 闭合** · UC-E2E-028 行/FAULT 列 stays gap · coveredCount=8 冻结 · EXIT1 诚实保留。老 prove 翻转**本席独立复现（恰一次）**：`pnpm uc028:trace-fail-open:prove` → **EXIT=1**，`FAIL S2-persistTrace-coupled-in-settle-txn` + `FAIL G-GAP-product-surface-or-pins: PRODUCT_SURFACE: … refuse gap EXIT=0` 逐字触发，S1/S3/S4/S5 仍 PASS、GAPS=0 —— 与 receipt 记载一致 = **设计绊线非回归**（refuse 条款 @老 proof `:15-16`/`:166-170` 实测在，文件零改动）。
- **attempts 1,1,1,0 裁决：演进非 wash（Ban retry-to-green 不成立）**。依据：(1) attempt-1/2 失败在接线/基础设施层（runner allowlist 未注册 `unsupported_e2e_target` / proof repoRoot 上溯少一级 ENOENT），产品断言均未 evaluated，无洗绿面；(2) attempt-3 六 FAIL 定位到 prove-harness 两缺陷（三表共用 trigger 函数 → plpgsql 对 `NEW.<col>` 字段解析不随 IF 短路 → 42703 污染非注入键，实证 F3 日志 `pgCode=42703`；fakeModel `prepare.execute` 未路由 `model.call` → 派发计数恒 0），修复全在注入 harness 侧（每表独立函数 + 路由），**断言文本零改动、产品码零改动**——最终断言集与 harness 合同 1:1 且全为硬断言（精确值 90/180、`===1`、`P0001`），无弱化迁就；(3) 4 attempts 各留日志（`meetwise-line-x/.tmp/uc028-nhp-prove-attempt{1..4}.log` 实测在，尾部 EXIT 与台账逐一吻合）。

### 条件裁决（本席 PRE-EXEC C-1~C-3 · 逐条）

| Cond | 裁决 | 证据 |
|---|---|---|
| **C-1**（base 前进 · EXEC 前 rebase，rebase 后若 invoke.ts 受影响须回炉） | **关闭 · 回炉条款不触发** | rebase 已完成并经协调方集成：`origin/feat/mysql-schema-skeleton` 实测 = `017a178d`（= receipt rebase 落点）；seam 行号按 tip `b16916fe` 复核：base `@017a178d` `:708` 同事务调用（`git show` 实测）→ tip 拆出 `:739`，`persistTrace` def `:345` 两代未移，catch 族 return 在位 → invoke.ts rebase 零漂移 |
| **C-2**（审位披露） | **履行** | 本段于独立 worktree `rv/xp-rag-route`（自 `line/x-next-knife@b16916fe`）执行、直审 committed tip；implementer 未触碰本 worktree；本 worktree 内唯一 git 写 = 本审查提交（author `mw-rag-route` · Ban push） |
| **C-3**（prove 期冻结项：三层壳同构接线 · 老 proof 零改动 · 翻转如实入 receipt） | **遵守** | 三层壳同构接线实测（root `package.json:163-164` → `run-e2e-isolated.mjs` allowlist `:1539` + 来源表 `:141-163` → `apps/api package.json:60` → proof）；老 proof 在 `017a178d..b16916fe` 零改动（`git log -- <path>` 空 + name-status 不含）；翻转 EXIT=1 已如实入 receipt 且本席独立复现逐字一致 |

### Minor（非阻断）

- receipt 产品 diff 表将新增块记为 `:371-397`，tip 实测为 `:370-395`（doc 注释 `:370-376` · 函数 `:377-395`）——2 行内 cosmetic 行号漂移；全部承重行号（`:708`→`:739`、`:723/:729/:730-734/:766`、metrics `:98-99/:141`、runner `:141-163/:1539`、`package.json :163-164/:60`）逐一精确；PIN 机检为 regex 非行号锚，不受影响。

### Blockers

无。

### Conditions（移交协调方/后手）

1. **EXIT0 ≠ covered** 维持：UC-E2E-028 行/FAULT 列 stays gap、coveredCount=8 冻结、`GAP-UC028-RECON / GAP-UC028-TRUTH-BLOCK-E2E / GAP-UC028-INJECT` 仍 open；任何升格仅经 coordinator nail 的 additive honesty。
2. 老 prove `uc028:trace-fail-open:prove` 现处**设计绊线态（EXIT=1）**：其静态库存更新属另刀；Ban 借任何后续刀静默改老 proof（C-3 延续）。
3. POST-PROVE 双审合龙 = 本段 + mw-e2e-ha 段各出自其席，本席不代签 peer；coordinator nail 前，本刀不自宣称 covered / HA / releaseEvidence；PASS ≠ coding ≠ prove ≠ covered ≠ HA。

### 三行中文摘要

1. 域边界实测干净：`git diff 017a178d b16916fe` 全仓 7 文件，ai-runtime 仅 persistTrace 拆旁路（`:708`→`:739`）+ `ai_trace_persist_failures_total` 计数/基线，settle/complete/breaker/dispatch/catch 族逐字节未动，零 RAG-FUNNEL/route/题库路径、零禁碰行、零 SSOT 触碰。
2. 本席 fresh re-run 恰一次 `pnpm uc028:nhp-fault:prove` = **EXIT=0（40 检查 0 失败）**：失败 trace 由计数 + 单行 JSON（pgCode=P0001）双通道实读观测、F2 真相失败不误触发、F5 recon 不冒充；老 prove 翻转 EXIT=1 本席独立复现 = 设计绊线；attempts 1,1,1,0 判演进非 wash（前三败均在 prove-harness 侧、断言与产品码零改动、全台账留痕）。
3. C-1/C-2/C-3 全部关闭：rebase 落 `017a178d` = origin tip、seam 行号按 tip 复核吻合不回炉；独立 worktree 审位披露；老 proof 零改动 + 翻转如实。唯一发现 = receipt 新增块行号 cosmetic 漂移（`:371-397` vs 实测 `:370-395`），非阻断。

Verdict: PASS
