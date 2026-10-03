# Harness — **GAP-UC004-FAIL-A3 · FAULT real evidence**（NHP-004-FAULT-01 fault-injection prove · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · row stays gap）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve · Ban invent a fix · this commit is not coding authorization and is not a prove）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-03
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`f3cf84c`** / full `f3cf84ccbd6ff0341fe198aa4cadd8cff417e69b`
**Knife**: **GAP-UC004-FAIL-A3 / NHP-004-FAULT-01 真故障注入证据**（C' FINAL `0652a08` 只钉「FAULT 仍 gap」；本刀求可复现 fault-injection prove，不是把 `uc004:career-path` EXIT0 当 A3 关闭）
**Gap id**: **`GAP-UC004-FAIL-A3`**（同名沿用 C'；本刀不改名、不开新 gap id）
**Case id**: **`NHP-004-FAULT-01`**
**Row**: **`UC-E2E-004`** · not UC-E2E-018 · not UC-E2E-052 · not UC-E2E-025
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban invent a fix · Ban coding

## Quoted from the files

C' FINAL `0652a08`（`gap-uc004-fail-a3-nhp.slice.md` / `harness/gap-uc004-fail-a3-nhp.md` FINAL NAIL）：docs status **`post_prove_dual_pass`** · **FINAL NAIL for the docs status only** · FAULT column stays **gap** · UC-E2E-004 row stays **gap** · **A3 is not closed** · "Do not treat `pnpm uc004:career-path:prove` EXIT 0 as A3 closed."

`e2e-requirement-coverage-matrix.md` §1.0.1 row **`UC-E2E-004`**: NEG **gap** · FAULT **gap** · BOUND **gap** · ADV **blind** · readout「整行 gap；A3 失败降级未接线」. §3 P1-9：「仍缺 e2e HTTP 主路径 + AiGraphRun/ADR + GrowthTimeline + A3」.

`non-happy-path-perf-load-case-matrix.md` row **`NHP-004-FAULT-01`**: `004 | FAULT | api | A3 失败降级 | 可解释；无假 completed | **gap** | 静态 G-GAP`.

`ai-docs/requirements/use-cases/e2e-scenarios.md` UC-E2E-004：E-gen-fail「`AiGraphRun active→failed`，业务事实保全 · 用户可见降级文案 + 可重试，不消耗权益（career-path 不计费，D1）」；TC-E2E-004-fail「graph(fake-model) · 注入图失败，断言 `AiGraphRun=failed` + UI 降级 + 额度不变」；后置「失败 → 无业务事实污染」.

`scripts/run-e2e-isolated.mjs` 头注自认口径：「local green ≠ HA · need multi-instance + **fault-inject** for releaseEvidence」.

## 现有 prove 缺什么（读源码结论 · 本刀的靶）

`apps/api/test/uc-e2e-004-career-path.proof.mjs`（`pnpm uc004:career-path:prove`）是**静态盘点 + GAP mark-red**：S1–S5 只读源码文件做正则断言，G-GAP 只打印 5 个 `GAP-UC004-*` 文本（其中 G-GAP-4 打印 `GAP-UC004-FAIL-A3`「no E2E for graph fail→AiGraphRun=failed + UI degrade + retry + quota unchanged」）。它：

- 不起 HTTP、不运行 `generateCareerPath`、**不注入任何故障**；
- 不观察 `AiGraphRun=failed`、不观察降级文案/重试、不观察额度净变 0；
- 所以其 EXIT 0 只证明「缺口被诚实钉住」，对 NHP-004-FAULT-01 是**零运行时 FAULT 证据**——这正是 C' 原钉「EXIT0 ≠ A3 关闭」的技术根据。

产品现状（同树读码）：`interview.service.ts` `generateCareerPath` = 同步 `deriveCareerPath` + 单条 `INSERT INTO career_path`，无 AiGraphRun(career-path) 接线、无 career-path 图文件、无 GrowthTimeline 写。即 FI-3 所需的图失败状态机**今天不存在**。

## FAULT 注入点（inject what · 三个）

| id | 注入什么 | 注入在哪 | 观察什么 |
|----|----------|----------|----------|
| **FI-1 连接断** | 请求执行中杀 PG 连接（`pg_terminate_backend` 或等价手段） | `POST /interview/:id/career-path`（`generateCareerPath` 唯一产品路径） | F1 响应可解释（非 200-假成功）· F2 `career_path` 无本次半写行、`GET` 不返回失败产物 · F3 额度/计费账本净变 0 |
| **FI-2 依赖超时** | statement/pool 超时（如 `statement_timeout`、锁占位） | 同 FI-1 路径 | 同 F1/F2/F3 观察集 |
| **FI-3 图失败状态机** | 图级不可恢复失败 → `AiGraphRun(career-path) active→failed` | 图运行器（本树**无此接线**） | `AiGraphRun=failed` + UI 降级文案 + 重试入口 + 额度不变 |

FI-3 **预期今天不可注入也不可观察**（S2/S3 静态断言：无图文件、无 AiGraphRun 接线）。prove 必须如实尝试并报告可达/不可达；不可达 → 不得 EXIT 0，走诚实 EXIT 1 保持 gap。**Ban 伪造 failed 事件、Ban 用同步 derive 路径的 5xx 冒充 `AiGraphRun=failed`。**

## Prove CMD（授权后才存在 · 本 docs commit 不添加任何代码）

- 待授权产物：`apps/api/test/uc-e2e-004-career-path-fault.proof.mjs` + root script `uc004:career-path-fault:prove`（走 `scripts/run-e2e-isolated.mjs` 隔离惯例，同 `uc004:career-path:prove` 包装形态；apps/api 侧 `prove:uc004-career-path-fault`）。本 REQUEST 一个代码行都不加。
- Prove 必须：真实起 api + 隔离 PG、真实执行 FI-1 与 FI-2 注入、逐项断言 F1/F2/F3、如实尝试 FI-3、全输出落 receipt。

## EXIT 契约（含诚实保留路径）

- **EXIT 0 = A3 真证据成立**，当且仅当：FI-1 与 FI-2 每次注入 F1+F2+F3 全部成立，**且** FI-3 可达并观察到 `AiGraphRun=failed` + 降级 + 重试 + 额度不变。EXIT 0 也不自动翻行：A3 关闭还须 post-prove dual PASS + 协调方授权，implementer 不自批。
- **EXIT 1 = 诚实保留 gap**：任一注入做不出/关不了，或 FI-3 因产品未接线而不可达。prove 须打印 `GAP-UC004-FAIL-A3` 明细（哪些 F 项未证、FI-3 不可达原因），如实落 receipt；**保持 gap，Ban invent fix，Ban 把 EXIT1 说成 flake**。
- 与既有 `pnpm uc004:career-path:prove` 的 mark-red EXIT 0 互不替代；后者继续只是静态诚实钉。

## Receipt 落点

`ai-docs/delivery/receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`（prove 全输出 · EXIT 值 · FI-1/FI-2/FI-3 逐项结果 · F1/F2/F3 断言记录）；如 emit 结构化证据另附同名 `.json`。`releaseEvidence=false` 惯例不变。

## Ban 列表

- **Ban coding**（本 turn docs-only）；**Ban prove 执行**（prove 需 pre-exec dual PASS 后由协调方授权）；**Ban push**。
- Ban 把 `pnpm uc004:career-path:prove` EXIT 0 当作 A3 关闭（C' `0652a08` 原钉，继续有效）。
- **Ban covered**：不写 covered、不翻 `UC-E2E-004` 行、不翻 `NHP-004-FAULT-01` 行。
- **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（不 flip UC-018 · UC-052 stays partial · UC-025 系列归其它刀）。
- Ban invent a fix · Ban product code · Ban 伪造 `AiGraphRun=failed` · Ban 把同步 derive 5xx 冒充图失败 · Ban 把 EXIT1 记成 flake/环境问题。
- Ban secrets / `.env*` · Ban force-push · Ban SSOT edit · **Ban self-approve（alone ≠ dual）**。

## Scope

本 REQUEST 只为 `GAP-UC004-FAIL-A3` / `NHP-004-FAULT-01` 求真故障注入证据。不 widen 到 `GAP-UC004-E2E-MAIN` / `GAP-UC004-GRAPH` / `GAP-UC004-GROWTH-A1A2` / `GAP-UC004-UNCERTAINTY`（它们由既有 mark-red 与其它刀承接）。不发明新验收标准——A3 口径以 `e2e-scenarios.md` E-gen-fail / TC-E2E-004-fail 原文为准。

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · row stays gap · STOP

*Harness · GAP-UC004-FAIL-A3 · NHP-004-FAULT-01 · fault real evidence · awaiting_pre_exec_dual · FAULT gap · STOP*
