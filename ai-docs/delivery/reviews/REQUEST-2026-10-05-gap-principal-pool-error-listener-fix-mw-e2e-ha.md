# REQUEST — **GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER · 产品修复** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-principal-pool-error-listener-fix.md` · slice `gap-principal-pool-error-listener-fix.slice.md`
**Parent tip**: `a778255`（full `a778255c8a600304001207a514621323e77da3d2` · origin/feat/mysql-schema-skeleton）
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

## 请审什么（mw-e2e-ha 视角）

C'' 刀 post-prove dual（`4d8dc5d`）钉明：FI-1（pg 池无 error 监听 → 连接断即进程崩溃）为真实产品可用性缺陷，修复须独立产品刀 + 授权。本刀（Line P）即该 REQUEST：`packages/db/src/principal.ts:837-850` `createPool()` 补池级 `error` 监听（fail-closed）+ 回归 prove 契约。请审：

1. **修复面收敛（e2e/可用性边界）**：仅 `createPool()` 工厂内挂监听（+ `packages/db/test/` 必要测试）；Ban 借刀改其他 outbound 主链（HTTP client / ai-graphs / qdrant / redis 等）；Ban 全局 `uncaughtException`/`unhandledRejection` 兜底；Ban 改 `createPool` 现有连接参数（statement_timeout=15000ms 等为 C'' FI-2 实测口径的一部分，不得动）。
2. **fail-closed**：监听只防 uncaught crash、不吞错误——请求路径仍按原语义失败（统一 500 信封）；Ban 伪装成功、Ban 自动重试、Ban 候选 C 型重建/降级联动（除非双审给出强理由）。
3. **prove 回归契约**：复用 C'' FI-1 注入手法（锁占位 + `pg_terminate_backend` 杀 INSERT backend）复跑 `uc004:career-path-fault:prove`：修复后同一注入 **API 进程不崩**（无 exit_code=1）**且有 HTTP 层可观测响应**（5xx 或降级，**按真实行为断言**——预期与 FI-2 同形 500 `{"error":"internal_error"}`，实测为准，Ban 编造）+ F2 无半写（SQL rows=0 + GET 404 双证）+ F3 账本净变 0（before/after 实测快照）+ `graph_run_rows=0`。
4. **EXIT 诚实契约**：attempt 级预期 `ATTEMPT-2-FI1-CONNECTION-BREAK` exit **1 → 0**；全量 EXIT 是否转 0 按 C'' 原契约裁决——**FI-3 结构性不可达不变**（同步 derive、无图接线），全量 EXIT 大概率仍 1；两种结果如实落 receipt。**Ban 修 prove 迁就产品、Ban 改既有断言语义洗绿、Ban 把 EXIT1 记成 flake**；prove 层首选零改动复跑，若需把「child 存活」升为显式断言行（如 `FI1-CHILD-SURVIVES`）属工具层最小增量，须明示并交双审裁。
5. **隔离惯例**：复跑沿用 `scripts/run-e2e-isolated.mjs` 三层包装 + per-run 随机容器 + 动态端口 + loopback/nonce attestation（同 C'' C-1 条款）；attempts 全记录 · one-shot · Ban retry-to-green · machine receipts 落 `.tmp/isolated-proof-receipts/`。
6. **边界互不借**：**Ban 关闭 C-PERF-TEARDOWN**（backlog `:35`，prove 基建层，M 线已钉——同族不同 scope）；**Ban invent「已修复 HA」**：本刀是单实例崩溃边界修复（可用性卫生），不是 HA、不是 multi-instance，`haStatus=NOT_HA` 与 `releaseEvidence=false` 不变。

Row `UC-E2E-004` FAULT column stays gap. Case `NHP-004-FAULT-01` stays gap（A3 关闭仍走 C'' 自己的 post-prove dual + 协调方授权路径，本刀不关 A3）。Backlog `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER` stays **OPEN**. **Ban covered**. **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（UC-052 stays partial）。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 coding；implementer 不自批。Dual PASS ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual 审查 · **mw-e2e-ha**（adversarial evidence-honesty · docs gate only）

**Reviewer**: `mw-e2e-ha`（独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-p-e2e-ha`，分支 `rv/p-e2e-ha` ← `origin/feat/mysql-schema-skeleton` @ `d89aaf3`）· **Date**: 2026-10-02（审查执行日）· 审对象 = REQUEST 提交 **`587b128`**（`587b128c1ff0c918dd015db73d5377a317eee21e`，4 files +206/−0，docs-only）。Ban prove 执行 · Ban coding · Ban product edit · Ban 改共享 SSOT。alone ≠ dual，不代签 mw-privacy-int（其审在并行，本审未读其结论、不依赖其存在）。

## A. 审前独立复核（命令 + EXIT + 可复现证据）

1. **祖先关系**：`git merge-base --is-ancestor 587b128 origin/feat/mysql-schema-skeleton` → **EXIT 0**（587b128 在 origin 主干上）。父提交实测 = `a778255c8a600304001207a514621323e77da3d2`，与 slice/harness 申报的 Base **逐字节一致**。
2. **docs-only 实证**：`git diff-tree --no-commit-id --name-status -r 587b128` → 恰 4 个**新增** `.md`：`gap-principal-pool-error-listener-fix.slice.md` · `harness/gap-principal-pool-error-listener-fix.md` · 两份 review stub。零 `.ts`/`.json`/`.mjs` diff；SSOT 三件（e2e-requirement-coverage-matrix / execution-master-checklist / gap-bug-backlog）**零触碰**。本 commit 不构成 coding/prove/push 授权（harness 顶部明示 "this commit is not coding authorization and is not a prove"）。
3. **缺陷在本树独立复证**：`packages/db/src/principal.ts:837-850` `createPool()` 返回 `new Pool({…})`（:838），**全文件零 `pool.on('error')`**（grep EXIT 1）。仓库级对抗扫描：非测试代码 `new Pool(` 仅 **2 处**——`principal.ts:838`（本刀修复面）与 `apps/worker/src/cloud-smoke-runner.ts:47`（**已自带** `database.on('error', …)` @ :57，且刻意不走 connectionString）。→ harness「工厂层一处修复覆盖全部池」**实质成立**（worker 运行时 / migrate-cli / LISTEN 单例同源 `createPool`，实测 grep 证实），且唯一旁路站点已被保护，不属于本 GAP 面。
4. **backlog `:355` 原文核验**：`GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER`（2026-10-03 新增 · 建议 P1 · **OPEN**），含「修复方向（仅供未来产品刀评估，**非授权**）…修复须独立 REQUEST + 授权 + 自身 prove + dual」——harness 引文逐字忠实。本 commit 后该行仍 OPEN（未翻行）。
5. **C'' 证据链核验**：nail `a27e384`（NAIL GAP-UC004-FAIL-A3 · EXIT1 honest · post_prove_dual_pass）、post-prove dual `aafdffbe`（mw-rag-route）+ `4d8dc5d`（mw-e2e-ha）均存在；harness 对 dual `4d8dc5d` Condition 与 receipt Findings.2 的引文**逐字忠实**（本审重读两原文比对）。
6. **C'' prove 现状通读**（`apps/api/test/uc-e2e-004-career-path-fault.proof.ts` 347 行 · 只读）：FI-1 断言集实测为 `FI1-F1-HTTP-EXPLAINABLE`（`kind==='http' && status>=400 && body.error==='internal_error'`，:283）/ `FI1-F2A-SQL-NO-HALF-WRITE`（rows=0）/ `FI1-F2B-GET-NO-FAILED-PRODUCT`（404 not_found）/ `FI1-F3-LEDGER-NET-0`（before===after 全行快照）/ `FI1-NO-FAKE-GRAPH-RUN`（rows=0）。**child 退出目前是观察项**（`childState` 只入 detail/evidence，:289/293），非断言行——harness「`FI1-CHILD-SURVIVES` 升级须明示并交双审裁」的表述与代码现状**准确一致**。evidence 已含 `child_stderr_tail`（:293）→「错误被观测」具备零改动落证通道。
7. **EXIT 契约核验**：prove `:333-336` `exitZeroEligible` 要求四 attempt 全 0 且 FI-3 可达；FI-3 结构性不可达（interview.service.ts 同步 derive、无图接线，prove/receipt/nail 三处 file:line 证据一致）→ 产品修复后**全量 EXIT 大概率仍 1**。harness 如实陈述 attempt 级 1→0、全量两种结果都落 receipt——与 C'' 原契约（harness/gap-uc004-fault-real-evidence.md §EXIT 契约）**零偏离**。
8. **隔离壳核验**：`pnpm uc004:career-path-fault:prove` = 三层包装不变（root package.json:153 → `:raw` → apps/api `prove:uc004-career-path-fault`，`scripts/run-e2e-isolated.mjs` 未被本 commit 触碰）；per-run 随机容器/动态端口/attestation 同 C'' fresh run 实录（dual `4d8dc5d` §B：容器 `meetwise-e2e-44529-…` @ 端口 52677，`ISOLATED_TARGET_ATTESTATION ok`）。
9. **Pins 核验**：stub 表 8 项与 SSOT 现值（NOT_HA / false / false / true / 8 / false / PG-retained / DELETE=503）逐一相符；C-PERF-TEARDOWN 实测在 backlog 表（disclosed OPEN · e2e 域），harness/slice 均 Ban 借刀关闭。

## B. 检查表（evidence-honesty / EXIT 契约焦点）

| # | 检查项 | 结果 |
|---|--------|------|
| 1 | `587b128` 为 origin 祖先且 docs-only（零产品/零 SSOT diff） | **PASS**（A.1/A.2） |
| 2 | 缺陷陈述与证据链（receipt §2/§4 · dual `aafdffbe`/`4d8dc5d` · nail `a27e384` · backlog :355）引文忠实、无夸大 | **PASS**（A.4/A.5） |
| 3 | 修复面收敛：仅 `createPool()` 工厂 + `packages/db/test`；Ban 全局 uncaughtException 兜底；Ban 改连接参数/GUC/角色语义 | **PASS**（fail-closed 铁律 1-6 明文；A.3 佐证面判断正确） |
| 4 | Ban 修 prove 迁就产品 / Ban 改断言洗绿：REQUEST 明文三方 Ban，且「断言按真实行为重写但不得放宽」边界写清（Ban 200-假成功、Ban transport_closed 计为可解释） | **PASS**（附 C-4 条件收紧） |
| 5 | EXIT 诚实契约：attempt 级 1→0 预期与全量大概率仍 1 并陈；Ban retry-to-green；attempts 全记录；EXIT≠0 不记 flake；EXIT 不翻行 | **PASS**（A.7） |
| 6 | fail-closed 可验证性：「不崩」不得单独作为绿——错误须被观测（F1 HTTP 可解释 + db 级测试断言日志/计数 + stderr tail 通道在位） | **PASS**（附 C-6 条件） |
| 7 | `FI1-CHILD-SURVIVES` 升级路径：如实标注为「观察项→断言行」最小增量并交双审裁 | **PASS**（本审裁决见 C-5） |
| 8 | 隔离壳三层包装不动 + machine receipts 落 `.tmp/isolated-proof-receipts/` | **PASS**（A.8） |
| 9 | 行语义冻结：backlog :355 stays OPEN · A3/NHP-004-FAULT-01 stays gap · A3 关闭不归本刀 · C-PERF-TEARDOWN / UC-018/052/025 不碰 · Ban covered | **PASS** |
| 10 | Pins 原值 8/8 · Ban invent「已修复 HA」（NOT_HA 语义框架正确：单实例崩溃边界修复 ≠ HA ≠ releaseEvidence） | **PASS** |
| 11 | 不代签 peer：mw-privacy-int stub 保持 PENDING · alone ≠ dual 明文 | **PASS** |

## C. Fail-trigger audit（触发即 FAIL · 独立逐项排查）

1. REQUEST 内夹带 coding/prove/push 授权 → **未触发**（docs-only 实证；授权路径明文归协调方，pre-exec dual PASS 之后）。
2. REQUEST 预先放宽 C'' 断言（如接受 `transport_closed` 为 F1 通过、或「崩了也算不崩」）→ **未触发**：F1 契约保持 `kind==='http' && status>=400` 可解释失败硬门槛，「进程不崩」保留为独立要求，200-假成功明文 Ban。
3. 修复叙事升格为 HA/releaseEvidence/covered → **未触发**（「可用性卫生」定性 + NOT_HA/releaseEvidence=false/Ban covered 三重钉）。
4. 承诺翻行（backlog :355 / A3 / UC-E2E-004 FAULT 列）→ **未触发**（fix + prove + post-prove dual + 协调方 nail 四道门后才可翻；A3 关闭明文归 C'' 自己的路径）。
5. EXIT1 洗成 flake / 环境问题 → **未触发**（Ban 明文 + 两种 EXIT 结果都如实落 receipt 的诚实条款）。
6. 借刀改其他 outbound 主链或关 C-PERF-TEARDOWN → **未触发**（Ban 列表点名 HTTP client/ai-graphs/qdrant/redis；C-PERF-TEARDOWN 同族不同 scope Ban 互借，M 线已钉）。
7. 断言「不崩」却不查「错误被观测」（吞错洗绿通道）→ **未触发**（铁律 1 + 必要测试断言「错误被观测（日志/计数）」+ C-6 条件补齐 e2e 层）。
8. 隐患扫描（非阻断）：候选 C（重建/降级联动）若被采纳且联动不当，存在把连接断伪装成自愈的 fail-open 风险——harness 已默认不推荐；本审**明确拒绝候选 C**（C-3），除非双审另给出本审未见的强理由。

## D. Blockers

无。

## E. Conditions（PASS 附带条件 · 违反任一 = 执行层/后续 dual FAIL）

- **C-1（dual 有效性）**：本 PASS 仅为 mw-e2e-ha 一票；须 mw-privacy-int 独立签署后方可交协调方授权 coding。本 stub 的 PENDING 状态由本段晋升为本审结论，**不代签、不改写 peer stub**。本 PASS ≠ prove ≠ nail ≠ 行翻转。
- **C-2（修复面）**：执行期修复面仅 `packages/db/src/principal.ts` `createPool()`（+ `packages/db/test/pool-error-listener.proof.ts`）。唯一 `new Pool(` 旁路站点 `apps/worker/src/cloud-smoke-runner.ts:47` 已自带 `on('error')`（:57）——**Ban 触碰**；执行提交中出现任何工厂外新增池构造 = FAIL。
- **C-3（fail-closed 裁决）**：候选 C（池重建/降级联动）**本审拒绝**——联动不当会把连接断伪装成自愈（fail-open），超出最小面；执行采纳 A（最小观测型）或 B（A + 计数）。监听 Ban 吞错、Ban 自动重试、Ban 全局 `uncaughtException`/`unhandledRejection`、Ban 改 createPool 连接参数与 GUC/角色语义。
- **C-4（断言完整性）**：回归复跑用**未放宽**的 C'' 断言集（F1+不崩 + F2 双证 + F3 净变 0 + `graph_run_rows=0`）。F1 仅可按**实测行为**重写为等强形式：必须保留 `kind==='http'`、`status>=400`、具体实测错误响应体三要素，receipt 须披露改写前后断言原文与实测证据；`transport_closed` 计为通过、2xx 计为通过、删除断言项 = FAIL。**「进程不崩」不得吸收/替代「错误被观测」**。
- **C-5（CHILD-SURVIVES 裁决）**：将 child 存活从观察项升为显式断言行 `FI1-CHILD-SURVIVES` **原则批准**——属加严不减的工具层最小增量，须（a）由 `api.done` 实际观测推导，不得假设；（b）零改动既有断言语义；（c）receipt 明示该增量。若不加，零改动复跑亦可（F2B GET 可达 + `child=still_running` 证据已隐含存活）。
- **C-6（observed-not-swallowed）**：复跑 receipt 除「进程不崩」外，必须**原文引用错误被观测的记录**（child stderr tail / 新监听的结构化日志行 / 计数增量之一，现有 `child_stderr_tail` 证据通道可直接承载）；只有「不崩」而无观测记录 = post-prove dual FAIL。
- **C-7（EXIT 诚实）**：attempt 级 `ATTEMPT-2-FI1-CONNECTION-BREAK` 预期 1→0；全量 EXIT 按 C'' 原契约裁决（FI-3 不可达 → 大概率仍 1）——两种结果均如实落 `ai-docs/delivery/receipts/`，attempts 全记录 · one-shot · Ban retry-to-green · EXIT≠0 不记 flake · EXIT 值不翻任何 SSOT 行。
- **C-8（行冻结）**：backlog `:355` 在 fix 落地 + prove 复跑 + post-prove dual PASS + **协调方 nail 授权**前 stays OPEN；`UC-E2E-004` FAULT 列 / `NHP-004-FAULT-01` / A3 stays gap（A3 关闭走 C'' 自己的路径）；C-PERF-TEARDOWN、UC-018/052/025、SSOT 全部不碰；Pins 8 项原值。

## 中文三行摘要

1. 独立复核 `587b128`：origin 祖先、恰 4 个新增 md 全 docs-only、SSOT 三件与产品源码零触碰，缺陷（principal.ts:838 池零 error 监听）在本树 grep 复证，backlog `:355`/C'' dual `4d8dc5d`/receipt 引文逐字忠实。
2. 回归契约与 C'' prove 现状（347 行全读）零偏离：F1/F2/F3 原断言不减项、attempt 级 FI-1 1→0 与全量 EXIT 大概率仍 1 并陈如实、`FI1-CHILD-SURVIVES` 升级路径诚实标注并经本审按加严增量原则批准（C-5），Ban 洗绿/Retry/记 flake 三方明文。
3. 裁决：PASS 附 8 条件——修复面仅 `createPool()`（唯一旁路站点 cloud-smoke-runner 已自保护，Ban 触碰）、拒绝候选 C、断言仅可按实测等强重写、「不崩」必须伴随错误被观测记录（C-6），backlog `:355` 与 A3 行冻结原值；alone ≠ dual，待 mw-privacy-int 独立签署后交协调方。

Verdict: PASS
