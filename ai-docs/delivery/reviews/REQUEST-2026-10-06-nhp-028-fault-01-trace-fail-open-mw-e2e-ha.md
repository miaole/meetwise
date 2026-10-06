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
