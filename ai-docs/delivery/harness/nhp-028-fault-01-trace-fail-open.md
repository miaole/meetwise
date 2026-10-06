# Harness — **NHP-028-FAULT-01 · UC-028 FAULT trace-fail-open**（Line X · **`draft:awaiting_pre_exec_dual`** · EXIT0≠covered）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · stub · Ban self-approve · alone ≠ dual · **Ban coding · Ban prove · Ban push**）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`4766d4fc`** / full `4766d4fc2a9d06f2d95a7ab7759430c4cc494bfc`（`git fetch origin` 当次网络失败：curl 28 连不上 github.com:443 · 以本地 origin ref 为准 = 恰为预期下限 ≥`4766d4fc` · pre-exec 前须复核线上 tip 未前进）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-x`（branch `line/x-next-knife`）
**Knife**: **NHP-028-FAULT-01（Line X）· trace/账本写失败不阻塞业务（A1 fail-open）· gap→case/prove 显式化**
**Gap id**: **`GAP-UC028-FAIL-OPEN`**（本刀具名 · 服务 NHP-028-FAULT-01；`GAP-UC028-RECON` / `GAP-UC028-TRUTH-BLOCK-E2E` / `GAP-UC028-INJECT` 仍 open · 不发明 covered）
**Case id**: **`NHP-028-FAULT-01`**
**Row**: **`UC-E2E-028`** FAULT 列 · not UC-027 / 016/029 / 012/024 / 031/032 / 040–043 · **Ban** UC-E2E-018 / 052 / 025 / 004 / 011 / 014 / 026 / 002 / 001
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding · Ban live · Ban fake-green suite

## 选刀（① covered-criterion 复核 vs ② 下一 NHP · 先读再定）

**选择 = ② 下一 NHP（UC-E2E-028 · NHP-028-FAULT-01）**。①（UC-001 BOUND 后 covered-criterion 复核刀）判为**无实义**，理由三：

1. **UC-001 无 covered-criterion 脚本**：全仓仅 UC-018 有 covered-criterion 线（`scripts/uc-e2e-018-covered-criterion.proof.mjs` + `scripts/lib/uc-covered-evaluator.mjs` / `uc-covered-real-gatherer.mjs`）；`package.json` 中 uc001 仅 `uc001:live-blocked:prove` / `uc001:nhp-neg:prove` / `uc001:nhp-bound:prove`，无 `uc001:covered-criterion:prove` 类 → 无列可新增/更新。
2. **矩阵 UC-001 行已诚实**（AB nail `6b878da` 后逐列读回）：NEG=blind/case-only（Line Y 真证据已落 · 措辞保持 blind/case-only）· FAULT=partial（isolated worker 注入下 report 未必 ready · 诚实理由在文）· BOUND=blind/case-only（Line AB 真证据已落 · 措辞保持 blind/case-only）· ADV=blind/case-only · 行整体 partial/blocked · coveredCount=8 不变 → 无失实、无 covered 宣称、无判据脚本需对齐。
3. **碰撞回避**：UC-001 行正被 Line AG 占用（`NHP-001-ADV-01` re-PRE REQUEST `626e0605`，status `draft:awaiting_pre_exec_dual`）——此时动 UC-001 行文档必与 AG 撞行。

### ② 排除清单（硬禁选）

**UC-018 / UC-052(050–052) / UC-025 / UC-004 / UC-011 / UC-014 / UC-026 / UC-002 / UC-001**（AB 已钉 001 BOUND；001 ADV=Line AG 在办；其余各线已覆盖/在办）。

### ② 选 UC-028 FAULT 理由

| 依据 | 读法 |
|------|------|
| backlog `e2e-covered-path-backlog.md`「下一刀顺序」#3（#1 UC-025、#2 UC-004 均被排除/占用） | 「UC-028 trace/账本失败不阻塞（honest gap prove 已挂；抬 covered 见下）」——顺序上**下一可办行** |
| NHP 矩阵 `non-happy-path-perf-load-case-matrix.md:107` | **NHP-028-FAULT-01**「028 · FAULT · api · persistTrace 失败 · 主链路不阻塞（目标）；现 gap · **gap** · 静态 G-GAP」——具名 case 已在矩阵 |
| 矩阵 §1.0.1 `e2e-requirement-coverage-matrix.md:127` | `UC-E2E-028` NEG=**gap** · FAULT=**gap** · BOUND=**gap** · ADV=**blind** ·「fail-open 本是 FAULT UC；未接线」→ status=gap 合格 |
| 既有诚实钉 | `harness/uc-e2e-028-trace-ledger-fail-open.md` S1–S5 + G-GAP（FAIL-OPEN/RECON/TRUTH-BLOCK-E2E/INJECT）· **GAP-UC028-FAIL-OPEN 本刀认领** |
| 需求锚 | `ai-docs/requirements/use-cases/e2e-scenarios.md` UC-E2E-028：trace 失败**不回滚业务事务**→业务照常 completed；失败 trace 进重写/标记缺失；**反例守卫：业务真相（钱/状态）写失败必须阻塞** |
| 代码 seam | `packages/ai-runtime/src/invoke.ts:345` `persistTrace`；`:707-708` 在与 `completeModelInvocation` / `settleAiTextCost` **同一事务**内调用 → trace INSERT 失败会连坐整个事务（`external_outcome_unknown` 族 fail-closed）**≠ spec 的 fail-open** |
| 邻刀先例 | Line W `NHP-025-FAULT-01` isolated 真 PG/HTTP 证据层刚 nail（tip `4766d4fc`）——隔离注入型 FAULT NHP 的 lifecycle 先例可循 |

**选择声明**：Line X = **NHP-028-FAULT-01**（UC-028 FAULT trace-fail-open，A1 面优先）。理由：backlog 顺序 #3、NHP 矩阵具名 gap case、全 gap 行中唯一带产品 seam 明确锚（`invoke.ts:707-708` 同事务耦合）且 spec A1 可单面独立成证；Ban 借刀排除清单各行；本刀**只做 A1**，A2 recon / A3 对照 E2E 留 open。

## 本刀面（A1 only · 显式边界）

| 今日 | 本 REQUEST | 授权后 |
|------|------------|--------|
| FAULT=gap；trace 失败=整事务 fail-closed（`external_outcome_unknown` 族）；无注入 prove；无 fail-open 旁路 | docs：具名 harness + F1–F5 注入合同 + dual stubs；**拟 product diff 范围显式声明**（见下） | coding（persistTrace 拆出 settle 事务为 best-effort 旁路）→ `pnpm uc028:nhp-fault:prove`（隔离 · **Ban live**）→ POST dual → coordinator nail |

**与 Line AB 的差异（诚实声明）**：AB = prove-only（zero `apps/api/src`，产品口 pre-existing）；本刀 **WILL touch product**（`packages/ai-runtime/src/invoke.ts` —— 把 persistTrace 拆出 settle 事务成为失败不回滚业务的旁路 + 失败结构化观测日志/计数；如需测试 seam 则 production-off env · 沿 `MEETWISE_CAREER_PATH_FAIL_THREAD_ID` 先例）。coding 仅在 pre-exec dual PASS + 协调方授权后进行；本 turn = docs-only。

**注入优先序（prove 期）**：首选 **DB 层注入零产品 seam**——isolated 真 PG 上对 `ai_invocation_trace` 挂 BEFORE INSERT trigger raise（或 REVOKE INSERT），使 trace INSERT 必败且不依赖产品代码；产品 diff 只承担 fail-open 旁路本身。Ban 用「不跑 trace」冒充「trace 失败」。

## 注入合同（F1–F5 · NEG 列必含 · G7 硬闸）

| id | 列 | 注入 | 期望观察 |
|----|----|------|----------|
| **F1** | **FAULT**（A1 主证） | isolated 真 PG：trace INSERT 必败（trigger raise / REVOKE INSERT）→ 走一次 ai-runtime invoke→settle→complete 路径 | 业务事务**不被 trace 失败回滚**：业务终态 completed + 额度 settle 成功（ConsumptionRecord/账本 confirmed · 净变恰一次）+ **非** trace 连坐的 `external_outcome_unknown`；失败 trace 有结构化观测（日志/计数），**不得静默无痕** |
| **F2** | **NEG**（反例守卫 · A3 真相面） | 同路径注入**业务真相写失败**（settle/钱/状态写必败） | **必须阻塞**（fail-closed 保持）：业务不得 completed、钱账不得 confirmed——Ban 把 fail-open 泛化到真相写；** Ban 把 F2 的失败洗成 flake** |
| **F3** | positive control | 无注入同路径 | 全绿（trace 成功写入 + 业务 completed）→ 证明 F1 的失败确由注入引起；Ban 假绿对照缺失 |
| **F4** | **NEG**（边界/幂等） | F1 注入路径下账面复核 | 无双扣/无重复入账；额度净变恰一次；trace 失败不产生任何替代性扣费 |
| **F5** | 边界声明 | 失败 trace 的后续 | **不要求已补写**（A2 recon 队列不在本刀）：失败 trace 仅被观测记录；**Ban 宣称 recon 已闭环** · `GAP-UC028-RECON` stays gap |

**NEG 列合规**：F2 + F4 + F5 三行为 NEG 面硬闸行（G7）——缺任一即本合同不成立。

**老静态 prove 绊线（诚实预告）**：接线后 `pnpm uc028:trace-fail-open:prove`（S1–S5 静态库存）按其自带 refuse 条款**预期翻转（EXIT=1）**——这是**设计的绊线**（harness uc-e2e-028「产品若浮出…本 prove 拒 EXIT=0；须另刀 fail-open isolation prove」），非回归；更新静态库存属另刀，**Ban 静默改老 proof**。

## prove 方案（授权后 · Ban live）

- **拟 CMD**：`pnpm uc028:nhp-fault:prove`（壳：`scripts/run-e2e-isolated.mjs` → raw `pnpm -C apps/api prove:uc028-nhp-fault` → `apps/api/test/uc-e2e-028-nhp-fault.proof.ts`；沿 `uc025:nhp-fault-isolated:prove` 三层壳先例）。
- **隔离**：isolated 真 PG（migrations 齐跑）· **零 live 模型**（Ban 加载 MODEL_API_KEY；不调外部模型；驱动路径用测试/假 provider 面，与 `_neg-harness` boot 先例一致）· **Ban live default**。
- **attempts 全记录**：每次运行的 attempt 序号、EXIT、失败类逐条进 receipt；**Ban retry-to-green**；EXIT1 不记 flake；Ban 改断言迁就结果。
- **PERF/LOAD**：**不适用 → 显式 blind**。perf/load 矩阵无 UC-028 行；单点注入 ≠ 负载面；Ban claim 容量/SLO。

## EXIT 契约

| EXIT | 语义 |
|------|------|
| **EXIT0** | F1–F5 全绿（isolated 真 PG · 零 live 模型 · attempts 全记录）= 具名 case `NHP-028-FAULT-01` 真证据 · **EXIT0 ≠ covered** · **EXIT0 ≠ e2e:isolated suite green** · **EXIT0 ≠ A1 closed 之外任何面** · UC-E2E-028 行/FAULT 列**保持 gap 措辞**（升 partial 仅经 coordinator nail 的 additive honesty）· coveredCount=8 不变 · `GAP-UC028-RECON` / `TRUTH-BLOCK-E2E` / `INJECT` 仍 open |
| **EXIT1** | 诚实保留路径：注入不可观测 / 业务未 completed / F2 守卫失守（fail-open 泄漏到真相）/ 对照不齐 → 记 attempt、保留 gap、Ban retry-to-green、Ban flake 洗绿、Ban 改断言；attempts 全记录后交协调方另裁 |

## 专家对（mw-e2e-ha + mw-rag-route · 为何非 privacy-int）

- **mw-e2e-ha**：隔离 PG/HTTP 证据层 + fail-open/closed 语义主场（沿 Line W 先例）。
- **mw-rag-route**：ai-runtime invoke/settle 观测旁路与 retrieval/调用链路的耦合面在其域内（trace 失败语义直接影响调用链可观测路由）；且为协调方指定第二审域。
- **非隐私域**：UC-028 面 = 可观测旁路/账本，非 PII 擦除/导出域 → **不换 mw-privacy-int**（说明毕）。

## 行语义（冻结）

- UC-E2E-028 stays **gap**（NEG/FAULT/BOUND）/ **blind**（ADV）措辞；升格仅经 prove+dual+coordinator nail；**Ban invent covered** · coveredCount=8。
- Ban 碰 UC-018 / 052 / 025 / 004 / 011 / 014 / 026 / 002 / 001 行与各线在办文件（含 AG `nhp-001-adv-01-blind-to-case*`、W `nhp-025-fault-*`、AB `nhp-001-bound-01*`）。
- 既有 `GAP-UC028-*` 诚实钉**不动、不洗**；老静态 proof 文件本 turn 零改动。

## Ban 列表

- Ban coding · Ban prove 执行 · Ban push · Ban live · Ban live default · Ban fake-green suite
- Ban covered · Ban SSOT 翻行 · Ban invent covered · Ban retry-to-green · Ban flake 记绿 · Ban 改断言迁就
- Ban self-approve · Ban self-nail · Ban force-push · Ban secrets / `.env*` · Ban Meridian · Ban HA cloud buy
- Ban selecting UC-018 / 052 / 025 / 004 / 011 / 014 / 026 / 002 / 001 · Ban 碰他线在办文件

## Non-claims

Not a pass · not run · not covered · not live · not suite green · not A2 recon · not A3 对照 E2E · not PERF/LOAD · not HA · alone ≠ dual · EXIT0 ≠ covered · 不宣称 fail-open 已实现

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · Ban live · Ban live default · Ban fake-green suite · STOP

---

*Harness · NHP-028-FAULT-01 · UC-028 FAULT trace-fail-open · draft:awaiting_pre_exec_dual · EXIT0≠covered · coveredCount=8 · STOP*
