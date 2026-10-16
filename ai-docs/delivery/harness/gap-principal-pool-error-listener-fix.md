# Harness — **GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER · 产品修复刀**（Line P · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · backlog 行 stays OPEN）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve · this commit is not coding authorization and is not a prove）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`a778255`** / full `a778255c8a600304001207a514621323e77da3d2`
**Knife**: **GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER 产品修复刀**（Line P）——C'' 刀（`GAP-UC004-FAIL-A3` fault real evidence prove）发现并双审确认的**真实产品缺陷**；本刀为其求修复方案授权与回归 prove 契约，不是 A3 关闭刀
**Gap id**: **`GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER`**（backlog `gap-bug-backlog.md:355` · P1 · OPEN · 本刀不改名、不翻行）
**Experts**: `mw-privacy-int`（principal.ts 属隐私/授权根域）+ `mw-e2e-ha`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding

## 缺陷如实陈述（REQUEST 先陈述 · 证据链全引）

`packages/db/src/principal.ts:837-850` `createPool()` 构造 pg Pool 时**零 `pool.on('error')` 监听**。pg-pool@3.14.0 `makeIdleListener` 对 client 连接错误会 `pool.emit('error', err, client)`——无监听器 → Node uncaughtException → **API 进程整体崩溃**。触发条件包括（不限于）：`pg_terminate_backend`、网络断、PG failover 时 idle/活跃 client 连接被终止。

崩溃链已由 C'' prove FI-1 实证（`ATTEMPT-2-FI1-CONNECTION-BREAK`，exit=1）：

- 无 HTTP 降级：请求侧 `transport_closed: UND_ERR_SOCKET`，进程死前无任何 HTTP 可解释响应；
- 子进程 `exit_code=1 signal=null`；stderr 崩溃帧：`Emitted 'error' event on Client instance` @ pg@8.22.0 `client.js:199/417`（`Connection terminated unexpectedly`）；
- F2/F3 侧干净：SQL `career_path` rows=0（语句级原子，无半写）、账本 before/after 逐行相等（净变 0）、`graph_run_rows=0`（无伪造 run）。

**证据链**：receipt `receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`（§2 attempt 表 / §4 Findings / §Appendix run4 全量 stdout）· post-prove dual `aafdffbe`（mw-rag-route）+ `4d8dc5d`（mw-e2e-ha）BOTH PASS（含独立 grep：`principal.ts` 全文件无 `on('error')` / `uncaughtException` 兜底）· 协调方 nail `a27e384`（NAIL GAP-UC004-FAIL-A3 fault evidence EXIT1 honest post_prove_dual_pass）· backlog `gap-bug-backlog.md:355`（P1 · OPEN）。

**定性**：真实可用性/降级缺陷（P1）。单条 PG 后端连接被终止即等于 API 全实例不可用。修复属产品工作，C'' 铁律「Ban invent fix」已遵守——本刀即该修复的 REQUEST。

## Quoted from the files

backlog `gap-bug-backlog.md:355` **GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER**：**Status: OPEN**（not fixed · not mitigated）·「修复方向（仅供未来产品刀评估，非授权）：池级 `error` 监听 + 坏客户端报废 + 进程健康兜底；修复须独立 REQUEST + 授权 + 自身 prove + dual。」

C'' post-prove dual（`4d8dc5d`）Condition：「FI-1（pg 池无 error 监听 → 连接断即进程崩溃）为真实产品可用性缺陷，修复必须走独立产品刀 + 授权；Ban 在 review/prove 层顺手修。」

C'' receipt Findings.2：「此为真实可用性/降级缺陷证据；修复属产品工作，须另刀授权（Ban invent fix），本 prove 只记录。」

## 修复方案候选（本 REQUEST 写清 · 执行阶段按双审裁决选 · 本 commit 不写码）

**唯一修复面**：`packages/db/src/principal.ts` `createPool()` 工厂（:837-850）内为返回的 pool 挂 `error` 监听。工厂层一处修复覆盖全部池（API、worker、测试、LISTEN 单例池同源 `createPool`），Ban 在各调用点散改。

| 候选 | 内容 | 取舍 |
|------|------|------|
| **A · 最小观测型** | `pool.on('error', (err) => { … })`：error 级结构化日志（脱敏后）· 无其他副作用 | 最小面；只堵 uncaught crash；观测靠日志 |
| **B · A + 结构化指标** | A + `pool_error_total` 计数（可按 pool 用途维度）供健康观测 | 观测可聚合；仍不自动重建池 |
| **C · B + 重建/降级联动** | B + 达阈值触发池重建或内部降级标志 | 风险最高：联动不当会把连接断伪装成自愈（fail-open）；重建涉及并发与 GUC 语义，超出最小面。默认不推荐，除非双审给出强理由 |

**fail-closed 铁律（所有候选共同约束 · 违反任一 = 执行层 FAIL）**：

1. 监听**只防 uncaught crash，不吞错误**：请求路径错误仍按原语义失败（统一 500 `internal_error` 信封，同 FI-2 实测形态），**Ban 把连接断伪装成成功**、Ban 200-假成功、Ban 静默重试。
2. **Ban 加全局 `uncaughtException` / `unhandledRejection` 兜底**——进程级兜底会掩盖别处 bug，超出本刀边界。
3. 日志/指标**脱敏**：不含 connectionString、密码、SQL 绑定参数；pg 侧错误消息本身（如 `Connection terminated unexpectedly`）可记。
4. 监听语义 = **故障观测，非健康证明**：Ban 把「有监听」叙述为「连接可靠」「自愈」。
5. 行为改变最小化：不改 `createPool` 现有连接参数（statement_timeout / idle 超时 / TLS / max 等）、不改 GUC/角色语义（`asPrincipal` / `asPrivacyWorkerPrincipal` / `asPrivacyWorkerExecutor` / `rebindDatabaseLogin` 原样）。
6. 候选间待裁项（双审裁决）：日志级别（error 定档）· 是否计数（B/C）· 是否触发池重建（C，默认否）· 计数暴露面。

**必要测试**（随 fix 授权的测试面，仅此）：`packages/db/test/` 新增 pool error listener proof（拟 `pool-error-listener.proof.ts`），在隔离 PG 上杀 client 断言：进程不崩 · 错误被观测（日志/计数）· 池后续仍可用（新连接成功）· 请求路径错误语义不变。Ban 借测试面改其他模块。

## prove 方案（回归契约 · 授权后才执行）

- **注入法**：复用 C'' 刀 FI-1 连接断注入（锁占位后 `pg_terminate_backend` 杀 INSERT backend），对修复后同一树**定期回归**。
- **断言（沿用 F2/F3 原断言，Ban 减项）**：
  - **进程不崩**：同一注入下 API 子进程不退出（无 exit_code=1）；
  - **HTTP 层可观测响应**：注入请求有可解释的失败响应（5xx 或降级，**按真实行为断言**——预期与 FI-2 同形的 500 `{"error":"internal_error"}` 信封；若实测为其他形态，如实记录并按其断言，Ban 假设、Ban 编造、Ban 200-假成功）；
  - **F2**：`career_path` 无本次半写行 + GET 不返回失败产物；
  - **F3**：额度/计费账本 before/after 实测快照净变 0（非口径假设）；
  - **FI-1-NO-FAKE-GRAPH-RUN**：`graph_run_rows=0` 保持。
- **CMD**：拟复跑 `pnpm uc004:career-path-fault:prove`（三层隔离壳包装不变：per-run 随机容器 + 动态端口 + attestation，同 C'' 惯例）。
- **EXIT 期望（诚实契约）**：attempt 级预期部分转绿——`ATTEMPT-2-FI1-CONNECTION-BREAK` exit **1 → 0**（FI1-F1-HTTP-EXPLAINABLE 与 server-alive 观测转 PASS）；**全量 EXIT 是否 1 → 0 由实际运行按 C'' 原契约裁决**：C'' EXIT 0 要求 FI-1+FI-2 全过 **且 FI-3 可达**，而 FI-3 结构性不可达（同步 derive、无图接线）不变，故全量 EXIT 大概率仍为 1——**两种结果都如实落 receipt，Ban 修 prove 迁就产品、Ban 改断言洗绿、Ban 把 EXIT1 记成 flake**。prove 层首选**零改动复跑**；若确需把「child 存活」从观察项升为显式断言行（如 `FI1-CHILD-SURVIVES`），属工具层最小增量，须在本 REQUEST 范围内明示并交双审裁，Ban 动既有断言语义。
- **receipt 落点**：`ai-docs/delivery/receipts/`（复跑 receipt，命名随执行日）；attempts 全记录 · one-shot · Ban retry-to-green · machine receipts 落 `.tmp/isolated-proof-receipts/`。

## 行语义（冻结 · 本刀不翻任何行）

- `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER` 在 backlog **stays OPEN**：fix 落地 + prove 复跑 + post-prove dual PASS + **协调方 nail 授权**后方可翻转；本 REQUEST 及其后续 coding 提交均不翻行。
- `UC-E2E-004` FAULT 列 / `NHP-004-FAULT-01` / A3：**stays gap**（C'' `a27e384` 原钉不变）——本刀修产品缺陷**不等于** A3 关闭；A3 关闭仍走 C'' 自己的 post-prove dual + 协调方授权路径。
- coveredCount=**8** 不变；haStatus=**NOT_HA** 不变。

## Ban 列表

- **Ban coding**（本 turn docs-only）；**Ban prove 执行**（pre-exec dual PASS 后由协调方授权）；**Ban push**。
- **Ban 借刀改其他 outbound 主链**：HTTP client / ai-graphs / qdrant / redis 等一切 outbound 错误处理不动；修复面仅 `packages/db/src/principal.ts` pool 错误处理（+ `packages/db/test/` 必要测试）。
- **Ban 关闭 C-PERF-TEARDOWN**（backlog `:35` · e2e 域 · disclosed OPEN · M 线已钉）——prove 基建层与产品修复层同族不同 scope，**Ban 互借**。
- **Ban invent「已修复 HA」叙事**：haStatus=NOT_HA 不变；本刀是单实例崩溃边界修复（可用性卫生），不是 HA、不是 multi-instance、不构成 releaseEvidence 依据（releaseEvidence=false 不变）。
- Ban 在监听内吞错/伪装成功/自动重试（fail-closed 铁律 1-4）· Ban 全局 uncaughtException 兜底 · Ban 改 createPool 连接参数与 GUC/角色语义。
- Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件 · Ban 翻任何 SSOT 行 · Ban covered。
- Ban 修 prove 迁就产品 · Ban 改断言洗绿 · Ban 把 EXIT1 记成 flake。
- Ban secrets / `.env*` · Ban force-push · **Ban self-approve（alone ≠ dual）**。

## Scope / Not

只做 `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER`（backlog `:355`）的产品修复 REQUEST + 回归 prove 契约。Not A3 关闭刀。Not HA 刀。Not C-PERF-TEARDOWN。不 widen 到其他 backlog 行。不发明新验收标准——回归断言以 C'' receipt F1/F2/F3 口径原文为准。

## Pins

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · backlog `:355` stays OPEN · row stays gap · STOP

*Harness · GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER · pool error listener fix · awaiting_pre_exec_dual · OPEN · STOP*
