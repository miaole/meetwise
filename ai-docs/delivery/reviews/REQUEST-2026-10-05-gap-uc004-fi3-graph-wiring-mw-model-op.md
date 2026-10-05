# REQUEST — **GAP-UC004-FI3-GRAPH-WIRING · 产品接线** · pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-model-op`（图执行/派发预算域）
**Knife**: `harness/gap-uc004-fi3-graph-wiring.md` · slice `gap-uc004-fi3-graph-wiring.slice.md`
**Parent tip**: `377e7fc`（full `377e7fc4fa1b35b85ebf524b668469caf66de2bc` · origin/feat/mysql-schema-skeleton）
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

## 请审什么（mw-model-op 视角：图执行/派发预算域）

本刀为 FI-3 接线授权（候选 A 图包装 derive 推荐 / B 仅失败记账 / C 完整图化）。career-path 今日是同步 `deriveCareerPath`（`packages/domain/src/career.ts` **纯逻辑无 IO**）+ 单条 upsert，零模型调用。请审：

1. **零模型调用边界（本审核心）**：Candidate A/B 下 derive 保持纯本地计算——career-path 图 dep = 注入的本地 derive 函数，**零模型调用路径、零 live 调用、零 model-op 预算影响、零 `ai_invocation_trace` 写入**（Ban 伪造 trace）；图包约定「不引 db/contracts 运行时；模型/checkpointer 经注入」不变；`@meetwise/ai-runtime` 的 model-client / model-operation-registry / model-operation-binding / prompts / router 零触碰（Line C 域，Ban 借刀）。
2. **成本申报纪律**：若双审裁决含任何模型调用的方案（如 Candidate C 校验/生成节点变体），必须显式申报（调用点 / 操作类型 / 预算归属 / 是否走既有 model-operation 通道）且**默认禁 live**；未申报的模型调用路径出现于执行提交 = FAIL；`mw-model-op` 一票否决。
3. **注入 seam 的预算面**：thread-scoped、env-gated dep 覆写（默认关闭）是 TC-E2E-004-fail `graph(fake-model)` 注入法的落点——seam 只允许使 dep **失败**，不得开启任何 live 模型端点/真实凭据路径；prove 隔离容器无模型端点运行，接线不得引入对模型端点的依赖。
4. **派发/执行形态**：Candidate A 为 API 进程内同步单节点图（无 worker 派发、无队列、无 checkpointer 新增依赖）；`apps/worker/src/*` lifecycles 零触碰；若后续真实图化/异步派发（worker 化）属其它刀，Ban 借本刀引入。
5. **prove 契约与 EXIT 诚实**：复跑 `uc004:career-path-fault:prove`（三层隔离壳不变）；期望四 attempt 全 0 → 全量 EXIT 1→0；实测若非如此按实际行为断言如实落 receipt；Ban 修 prove 迁就产品、Ban 改断言洗绿、Ban retry-to-green、Ban 记 flake；FI-1/FI-2 既有断言零减项，`FI1-NO-FAKE-GRAPH-RUN` 等强改写须双审裁。
6. **A3 关闭路径**：本刀 prove EXIT0 + post-prove dual PASS + 协调方 nail 三段全链；EXIT0 ≠ A3 closed（C'' 原钉）；**本 REQUEST 不预claim**、本 stub 不授权 coding / prove / push。

Row `UC-E2E-004` FAULT column stays gap · Case `NHP-004-FAULT-01` stays gap · 本行其余 gap（E2E-MAIN/GRAPH/GROWTH-A1A2/UNCERTAINTY）不因本刀关闭 · **Ban covered** · **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（UC-052 stays partial）· Ban 翻任何 SSOT 行。

pre-exec dual PASS 后由协调方授权 coding；implementer 不自批。Dual PASS ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual 审查 — mw-model-op（图执行/派发预算域）· append-only

**Reviewer**: `mw-model-op` · Date 2026-10-05 · 独立 worktree `rv/t-model-op` @ base `feat/mysql-schema-skeleton`（tip `1c57bb3`，被审 REQUEST `f4b95fe` 为其祖先，已核 `git merge-base --is-ancestor`）。
**独立性声明**: 本审未读 `REQUEST-...-mw-e2e-ha.md` 任何正文（alone ≠ dual，不代签 peer；peer 裁决以其自身文件为准）。仅依本 stub + harness + slice + 产品代码只读核证独立裁决。
**方法**: 只读（Ban live、Ban coding、Ban product edit、Ban SSOT edit、Ban 改共享文件；git 写仅限本 worktree）。

### 0. REQUEST 形态核验

- `f4b95fe` diff = 恰 4 个 docs 文件（slice 35 行 / harness 108 行 / e2e-ha stub 41 行 / model-op stub 40 行，224 insertions / 0 deletions）；**零产品码、零 SSOT diff**（矩阵/checklist/backlog 未触碰）→ docs-only 属实。
- 引文核对：`e2e-scenarios.md:125`（E-gen-fail 原文含「career-path 不计费，D1」）、`:133`（TC-E2E-004-fail `graph(fake-model)` 原文）、矩阵 `:115`（FAULT **gap** + coveredCount=8 明示）、`:173`（P 线 FI-1 1→0 链 + 行状态不动）——harness 引文与 SSOT 逐字一致，无断章。
- Pins 全部原值保持：haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503**。本 stub 的 pre-exec 审不翻任何行。

### 1. 零模型调用论断 — 独立核证（本审核心）

| # | 论断 | 核证证据（本树只读） | 结果 |
|---|------|---------------------|------|
| 1.1 | `deriveCareerPath` 纯本地无 IO | `packages/domain/src/career.ts:1-19`：全文件**零 import**、零 fetch/http/db、纯算术+字符串构造；`insufficient_evidence` 为本地 throw（`career.ts:11`），非远程校验 | **属实** |
| 1.2 | ai-graphs 包无法触达模型端点 | `packages/ai-graphs/package.json` deps = `@meetwise/domain` + `@langchain/langgraph` 仅此两项；**无 `@meetwise/ai-runtime`**。Candidate A 新增 `career-path.ts` 落在该包内，物理上引不到 model-client，除非新增依赖——而 model-client/registry/binding（Line C 域）在触碰面 Ban 列 | **属实** |
| 1.3 | 零 `ai_invocation_trace` 写入 | 全仓 trace INSERT 仅 `packages/ai-runtime/src/invoke.ts:357/:363`（模型 invoke 关口）；Candidate A 调用链 = service → domain 纯函数，不经过 invoke；且 harness 铁律 5 + Ban 列显式 Ban 伪造 trace | **结构性成立**（以触碰面冻结为前提） |
| 1.4 | Candidate A 图包装不引入模型 dispatch/embedder/rerank 路径 | A 方案 dep = 注入的 `deriveCareerPath`（纯函数）；`graph(fake-model)` 注入语义是**使 dep 失败**，方向与模型 dispatch 相反；无 worker 派发、无队列、无 checkpointer 新增（stub 第 4 条 + harness 铁律） | **属实** |
| 1.5 | prove 零 live | 三层隔离壳 + 隔离容器无模型端点（harness §成本披露）；断言 ④ 账本 before/after 净变 0 | **契约在案** |

**零模型调用裁决：Candidate A/B 下「零模型调用、零 live、零预算影响、零 `ai_invocation_trace` 写入」论断独立核证成立。** 该论断成立的前提=触碰面冻结（harness §触碰面 + §Ban 借刀改清单）在执行提交中原样保持；前提破缺即触发 §4 Fail-trigger。本审不否决 Candidate A；不推荐引入任何模型调用的变体（Candidate C 本刀拒绝口径维持）。

### 2. 两本账边界（I 线 spend-ledger vs ai_graph_run）

- `ai_graph_run`（`packages/db/migrations/0001_baseline.sql:30-40`）= 运行状态/fence 账：`status`（free text）+ `version` + `lease_owner`/`lease_expires_at` + `uq_active_run` partial 唯一索引（仅锁 `created/active/waiting_user/migrating/paused`；`failed`/`succeeded` 终态天然让出重试槽）。**不是 spend 账**。
- career-path **不计费（D1，SSOT 原文）**：图行 create/reuse/failed 记账与预算/计费口径**必须保持分离**——图行 version 递增是状态机/fence 证据，**不得**被叙述为计费计数器或 spend 事件；`actualSpendCny=null` 口径保持；prove 断言 ④（账本快照净变 0）是 spend 侧的独立证据，二者互不替代、互不混同。harness §成本/预算披露与 slice §成本边界表述符合此边界。

### 3. env-gated dep seam（IV_FI3）预算面核验

- harness 铁律 6 + stub 第 3 条契约：thread-scoped、env-gated、**默认关闭**、env 未设=零行为差、仅使指定线程 career-path dep **失败**（fail-only），不开任何 live 模型端点/真实凭据路径，同进程其余线程不受影响。seam 键名/解析执行期定、交双审——已兑现「交双审」承诺（本段即该审）。
- fail-only 契约与 `graph(fake-model)` 注入语义一致：注入的是**失败**，不是模型替身；不存在「seam 触发真实模型路径」的结构可能（dep 失败方向与 dispatch 相反；隔离容器无端点）。风险点仅在执行期实现走样 → 归入 §4 Fail-trigger + §5 Conditions。

### 4. Fail-trigger audit（执行提交出现任一 = FAIL / 一票否决）

1. career-path 接线出现任何模型调用路径（model-client / registry / binding / prompts / router / 任何 `@meetwise/ai-runtime` 引用、任何网络端点调用）且未按契约显式申报 → **FAIL + mw-model-op 一票否决**；已申报但未默认禁 live → 同样否决。
2. career-path 接线可达任何 `ai_invocation_trace` INSERT（含「顺手记一条」）→ FAIL（Ban 伪造 trace；trace 只能由模型 invoke 产生，本刀零 invoke）。
3. seam 非默认关（env 未设即有行为差）、或 seam 可读凭据/触网络、或作用于指定线程之外 → FAIL。
4. 图行记账与 spend/预算口径混同（如图行 version 叙述为计费、`actualSpendCny` 非空、账本净变 0 断言被删/放宽）→ FAIL。
5. 无 active 阶段的装饰性 failed 行 / 无 version 递增转换证据 / status 落错（终态写成非终态）→ FAIL（harness 铁律 1；见 C-MO-6）。
6. `FI1-NO-FAKE-GRAPH-RUN` 等强改写弱化（接受 status 任意 / 无 version 证据 / 行数随意）、FI-1/FI-2 既有断言减项、Ban 改断言迁就 / retry-to-green / 记 flake → FAIL。
7. prove 出现任何 live 模型端点调用 → FAIL（Ban live 贯穿）。

### 5. Blockers

**无 Blockers**（pre-exec docs gate 阶段无阻断项）。凡 §4 列项均为执行层 fail-trigger，非本 REQUEST 文档缺陷。

### 6. Conditions（C-* · 执行提交须满足，否则按 §4 裁）

- **C-MO-1 触碰面冻结**：执行提交在 `packages/ai-runtime/` 下零 diff；career-path 接线调用链不引入对 `invoke` / model-operation 通道的任何可达路径。`packages/domain/src/career.ts` 零改动（对外契约冻结铁律 2）。
- **C-MO-2 seam 默认关 + fail-only 实证**：随 coding 落「env 未设 → 零行为差」断言（单测或 e2e 层）；seam 生效路径仅注入确定性 dep 失败（无网络、无凭据读取、仅限 IV_FI3 线程）。seam 键名/解析实现须在 receipt 披露（harness 铁律 6「交双审」兑现）。
- **C-MO-3 两本账叙述分离**：receipt 中 `ai_graph_run(career-path)` 行叙述为运行状态/fence 审计证据；spend 侧证据独立由「账本 before/after 净变 0」承载；`actualSpendCny=null` 保持；Ban 任何把图行读作计费的表述。
- **C-MO-4 模型调用方案防火墙**：若后续任何裁决引入含模型调用的变体，须在 coding 授权前显式申报（调用点/操作类型/预算归属/是否走既有 model-operation 通道）且默认禁 live；未申报即出现于执行提交 = 一票否决。
- **C-MO-5 等强改写披露**：`FI1-NO-FAKE-GRAPH-RUN` 改写前后断言原文逐字落 receipt（先例 = FI1-CHILD-SURVIVES 升级路径）；接受形态限于申报的 per-thread 恰一行 `failed` + `version>=2` 转换证据（断言 ②），FI-2 `graph_run_rows` detail 同步 per-thread 化；静态接线证据（`careerInIdx`/`graphFiles`/`regionHasGraphWire`）降为 evidence 字段不作 unreachable 闸门——按 harness §prove 方案原样。
- **C-MO-6 终态语义（本审独立补充的技术条件）**：Candidate A 的 career-path 状态机**不得**复用 `withInterviewGraphFence`/`releaseInterviewGraphFence` 的收尾语义——该 helper（`packages/db/src/interview-graph-lease.ts:10,:81-87`）硬编码 `GRAPH_NAME='adaptive-interview'` 且释放时写 `status='waiting_user'`；`waiting_user` 属 `uq_active_run` 锁定集（非终态）。career-path 终态必须落 `failed`/`succeeded`（终态让出重试槽），复用仅限「latest-row `FOR UPDATE` 复用/接管」惯例本身（铁律 3 原意）。若实现直接借用 fence helper 将同时违反铁律 1（转换证据）与 uq_active_run 语义 → 按 §4.5 裁。
- **C-MO-7 派发形态冻结**：Candidate A 保持 API 进程内同步单节点（无 worker 派发/队列/checkpointer 新增依赖，`apps/worker/src/*` 零 diff）；异步化/worker 化属其它刀，本刀出现即 FAIL。

### 7. 审查结论

docs gate PASS：REQUEST 形态（docs-only、无 SSOT diff、Pins 原值）✓；零模型调用论断独立核证成立（1.1–1.5）✓；两本账边界在案 ✓；seam 契约（默认关 + fail-only + 交双审）✓；prove 等强增量（FI-3 升级 + `FI1-NO-FAKE-GRAPH-RUN` 改写）已如实申报且 Ban 放宽在案 ✓；Ban live / Ban coding / Ban prove / Ban push / alone≠dual 贯穿 ✓。pre-exec dual PASS 仅授权协调方进入下一阶段（coding 授权仍由协调方发出；prove 与 nail 未发生、本审不预claim A3）。

### 摘要（3 行中文）

1. 零模型调用论断独立核证成立：`career.ts` 全文件零 import 纯函数、`@meetwise/ai-graphs` 依赖仅 domain+langgraph 物理引不到模型端点、`ai_invocation_trace` INSERT 仅存于 ai-runtime invoke 关口而本刀零 invoke——Candidate A 图包装是失败注入方向，不构成任何模型 dispatch 路径。
2. `ai_graph_run` 记账与 spend 两本账边界已钉：图行是状态机/fence 审计证据，career-path 不计费（D1），`actualSpendCny=null` 与账本净变 0 断言独立承载 spend 侧；seam 默认关 + fail-only + 仅限 IV_FI3 线程契约在案。
3. Verdict PASS 附 7 条 Conditions（触碰面冻结、seam 实证、账本分离、模型调用防火墙、等强改写披露、终态语义不得借用 adaptive fence 的 `waiting_user` 收尾、派发形态冻结）；无 Blockers；不代签 mw-e2e-ha，A3 不预claim，Ban live 贯穿。

Verdict: PASS
