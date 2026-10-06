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
