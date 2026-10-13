# Receipt — **NHP-028-FAULT-01 · UC-028 FAULT trace-fail-open**（Line X · coding+prove · **awaiting_post_prove_dual** · row stays gap · FAULT 列 stays gap · EXIT0≠covered）

**Date**: 2026-10-07（Asia/Shanghai · runs 2026-10-06T17:31Z–17:41Z）
**Line**: **X** · implementer `mw-core`（commit identity `mw-core <mw-core@meetwise.local>`）
**Knife**: harness `harness/nhp-028-fault-01-trace-fail-open.md` · slice `nhp-028-fault-01-trace-fail-open.slice.md`
**Gap / Case**: `GAP-UC028-FAIL-OPEN` · `NHP-028-FAULT-01`（**A1 only** · A2 recon / A3 对照 E2E 不在本刀）
**REQUEST**: `496d275a` / `8231fc1a`（同补丁等价 · docs-only pre_dual）
**PRE dual BOTH PASS**: mw-e2e-ha（REQUEST `18a54b2` 审段 PASS · Conditions C-HA-1..4）+ mw-rag-route（REQUEST `496d275a` 审段 PASS · Conditions C-1..3）——两份审查段已随链并入 origin tip `017a178d`
**Authority**: coordinator meetwise — Line X coding+probe 授权（域边界 C-HA-1 binding）· Ban push · Ban SSOT edit · Ban 翻行 · Ban live · Ban fake-green · Ban retry-to-green · Ban self-approve/self-nail
**STOP**: 本 receipt 提交后停下等 **post-prove 双审**（协调方另派 · 禁自批）

---

## Pins（unchanged · 冻结）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · `actualSpendCny=null`（无任何 live 模型调用 · 两本账分离未触碰）

**Row**: `UC-E2E-028` 行 stays **gap**（NEG/FAULT/BOUND）· **blind**（ADV）· FAULT 列**未翻** · **EXIT0 ≠ covered ≠ e2e:isolated suite green ≠ A2/A3 闭合** · `GAP-UC028-RECON` / `GAP-UC028-TRUTH-BLOCK-E2E` / `GAP-UC028-INJECT` 仍 open · SSOT / 矩阵 / backlog 零触碰 · UC-018/052/025/004/011/014/026/002/001 零触碰 · `interview-graph-lease.ts` / principal 零触碰

---

## Base / rebase（C-1 · C-HA-3 disposal）

| 项 | 值 |
|----|----|
| 分叉时声明 parent | `4766d4fc`（harness 声明 · 前置网络失败仅本地 ref） |
| rebase 前实测 | `line/x-next-knife` ahead 1 / behind 159 vs `origin/feat/mysql-schema-skeleton` |
| **EXEC 前 rebase（C-1 必办）** | `git fetch origin` 成功（本次网络通）→ `git rebase origin/feat/mysql-schema-skeleton` → 旧 REQUEST `18a54b29` 与主线 `8231fc1a` 同补丁 **自动 drop**（git: `skipped previously applied commit 18a54b29`）|
| rebase 后 tip | **`017a178d`** = origin tip（与协调方简报一致）· rebase 后 `git status` clean |
| seam 复核 | rebase 后 `packages/ai-runtime/src/invoke.ts`：`:345 persistTrace` · `:696 settleAiTextCost` · `:703-707 completeModelInvocation` · `:708 if (!error) await persistTrace(...)` · `:736 return { error: 'external_outcome_unknown' }` —— 与两份 PRE-EXEC 审查所核行号逐一吻合 → **C-1「rebase 后若 invoke.ts 受影响须回炉」不触发** · C-HA-3 关闭 |

---

## Product diff（C-HA-1 边界自证 · 逐 file:line）

**总面**：`git diff HEAD` = 2 产品文件 34 insertions / 1 deletion + 3 接线文件 + 1 新 prove。**仅** persistTrace 拆旁路 + 结构化观测，**无** settle/complete/breaker MODEL-OP-02/dispatch/catch 族任何语义变化。

| File | Line | Change |
|------|------|--------|
| `packages/ai-runtime/src/invoke.ts` | `:371-397` | **新增 `persistTraceBestEffort`**：独立 `asPrincipal` 事务内调 `persistTrace`；`.catch` 中 (a) `getMetrics().inc(METRIC.aiTracePersistFailures)` 计数 (b) `console.error` 单行 JSON 结构化日志（`event/service/idempotencyKey/errorName/pgCode`——只放稳定标量，无 owner/原文/堆栈，脱敏同 metrics 纪律）。函数注释显式声明：不回滚业务事务、不改写成功终态、不冒充 A2 recon |
| `packages/ai-runtime/src/invoke.ts` | `:708`（原行删除）→ `:735-738`（注释）+ `:739`（新调用） | 原 `if (!error) await persistTrace(c, ...)` **移出 settle/complete 事务**；事务体内留注释声明拆出原因（A1 spec 锚）；事务提交后 `if (!error) await persistTraceBestEffort(pool, owner, spec, stored, settledUsage, latencyMs, requestId)`。**settleAiTextCost（`:723`）/ persistValidatedOutput（`:729`）/ completeModelInvocation（`:730-734`）逐字节未动**；catch 族（`:747-767`，返回 `external_outcome_unknown`）逐字节未动 |
| `packages/ai-runtime/src/metrics.ts` | `:98-99`（METRIC 常量）+ `:141`（基线注册） | 新增 `aiTracePersistFailures: 'ai_trace_persist_failures_total'`（指标名单一真源 · Prom 命名约定）+ `registerBaselineMetrics` 注册 0 序列。alerts-lint 白名单不受影响（无 alert 引用） |

**Seam 可选 production-off 测试 env：未采用**（DB 层注入为 harness 首选，零产品 seam 即可全量注入 → 产品 diff 最小化；与 REQUEST「产品 diff 只承担 fail-open 旁路本身」一致）。

## Prove 层 diff（三层隔离壳 · C-3 同构接线）

| File | Change |
|------|--------|
| `apps/api/test/uc-e2e-028-nhp-fault.proof.ts` | **新 prove**（F1–F5 + ISO + PIN，40 断言）· `assertIsolatedTestTarget` 容器 nonce 实证 · 01_schema + 0033/0035/0036/0037/0056/0057/0083/0085/0088/0119/0130 迁移齐跑 · fake provider 面（prepare→call 同构路由 · 零外呼）· DB 层三触发器 scoped 注入 |
| `package.json` `:163-164` | `uc028:nhp-fault:prove` → `node scripts/run-e2e-isolated.mjs uc028:nhp-fault:prove:raw`；`...:raw` → `pnpm -C apps/api prove:uc028-nhp-fault` |
| `apps/api/package.json` `:60` | `prove:uc028-nhp-fault` = `node --import @swc-node/register/esm-register test/uc-e2e-028-nhp-fault.proof.ts` |
| `scripts/run-e2e-isolated.mjs` `:141-163`（receipt 来源表）+ `:1539`（target allowlist） | 新 target `uc028:nhp-fault:prove:raw` 注册（同 `uc025:nhp-fault-isolated:prove:raw` 先例同构） |

**老 prove 零改动**：`apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs` 不在 git 变更列表（C-3 达成）。

---

## 新 prove 证据

**CMD**: `pnpm uc028:nhp-fault:prove`（三层壳：`run-e2e-isolated.mjs` → `pnpm -C apps/api prove:uc028-nhp-fault` → proof）
**隔离**：`[R5-MARKED-RED] E2E_PG_IMAGE=pgvector/pgvector:pg16`（legacy fixture 叙事）· 容器 `meetwise-e2e-*` 一次性 · `E2E_ISOLATED=1` + `E2E_TEST_CONTAINER/E2E_TEST_TARGET_TOKEN` nonce 实证 · 动态 PGPORT · `MODEL_API_KEY`/`DASHSCOPE_API_KEY` 防御性删除并断言缺席（零 live）· 本机镜像 digest 比对：`pgvector/pgvector:pg16` 与 `docker.m.daocloud.io/pgvector/pgvector:pg16` 同 image ID `7b822b0aac60`（无网络拉取）

### Attempts 全台账（Ban retry-to-green 合规 · 每次失败原因如实）

| Attempt | EXIT | 结果 |
|---------|------|------|
| 1 | 1 | `unsupported_e2e_target` —— runner target allowlist 未注册（接线缺口，非断言失败） |
| 2 | 1 | proof `repoRoot` 路径少算一级（apps/api/test 需三级上溯）→ 读 schema ENOENT（proof 文件缺陷） |
| 3 | 1 | `CHECKS=40 FAIL=6` —— **prove-harness 两缺陷**：① 三表共用一个 trigger 函数，plpgsql 对 `NEW.status` 的字段解析不随 IF 短路 → 非注入键 trace INSERT 被 42703 污染（实证：F3 日志行 `pgCode=42703`）→ 拆分为每表独立函数；② fakeModel `prepare.execute` 未路由 `model.call` → 派发计数恒 0。**产品码零改动**（两缺陷均在 prove 注入 harness 侧）|
| **4** | **0** | **`CHECKS=40 FAIL=0` · F1–F5 + ISO + PIN 全绿**（`.tmp/uc028-nhp-prove-attempt4.log`）|

### F1–F5 逐类结果（attempt-4 · 40/40）

| id | 结果 | 关键断言（全 PASS） |
|----|------|---------------------|
| **F1**（FAULT · A1 主证） | **绿** | trace INSERT 必败注入生效（f1 键 trace count=0）· 业务事务不被回滚：invoke 返回 value（**非** external_outcome_unknown）· `ai_model_invocation.status=succeeded` · reservation `settled_micro_cny=90` 净变恰一次 · 预算 settled=90 恰一次 · 模型仅派发一次 · **结构化观测：`ai_trace_persist_failures_total=1` + 单行 JSON 日志**（原文见下） |
| **F2**（NEG · 反例守卫） | **绿** | F2a 状态写必败（trigger 拦 `ai_model_invocation` UPDATE→succeeded）→ invoke 返回 `external_outcome_unknown`（fail-closed 保持）· status=unknown 非 succeeded · 钱账 `status=unknown ∧ settled_micro_cny IS NULL` · `error_code=settlement_or_record_failed`（原 catch 族收口语义未动）· F2b 钱写必败（trigger 拦 `ai_cost_reservation` UPDATE→settled）→ 同上全阻塞 · F2 面预算 settled 零净变 · 真相失败**不**触发 trace 观测（计数仍=1，真相失败≠trace 失败）· 无自动重试 |
| **F3**（positive control） | **绿** | 无注入同路径：trace 成功写入（input_tokens=50 · output_tokens=20 · service 命中）· 业务 completed · 额度 settled=90 · 预算累计=180 → **F1 的失败确由注入引起**（对照齐备，无假绿） |
| **F4**（NEG · 边界/幂等） | **绿** | F1 注入路径下：同键 replay 命中 durable claim 缓存返回同一 value · 模型仍只真调一次 · f1 键 reservation 恰一行（settled·90）· `ai_model_invocation` 恰一行 · 预算 settled 不变=180 · **无替代性扣费**（无 released/unknown 转嫁记录）|
| **F5**（边界声明） | **绿** | 失败 trace 未被补写（f1 键 trace 仍=0 · A2 不在本刀）· 观测不丢失（计数仍=1）· invoke.ts 无 missing-trace rewrite/backfill/recon 队列符号 · **`GAP-UC028-RECON` stays gap（不冒充 recon 闭环）** |
| ISO / PIN | **绿** | 隔离实证 3 项 + 产品 diff 边界静态 PIN 4 项（旁路接线在事务外 · settle/complete/catch 族逐字节未动的机器可检证据，供 POST dual 对照）|

### 失败 trace 结构化观测证据（日志行原文 · attempt-4）

```
OBSERVATION_LOG_LINE  {"event":"ai_trace_persist_failed","service":"uc028-fault-probe","idempotencyKey":"uc028-f1:muwyqqix06484v","errorName":"error","pgCode":"P0001"}
```

计数证据：`ai_trace_persist_failures_total 1`（`getMetrics().render()` 断言通过；基线 0 序列已注册）。

---

## 老 prove 设计绊线证据（C-3 · `uc028:trace-fail-open:prove` 零改动翻转）

**CMD**: `pnpm uc028:trace-fail-open:prove`（壳接线原样）· **EXIT=1**（`.tmp/uc028-old-prove-flip.log`）

```
PASS S1-persistTrace-inserts-ai_invocation_trace
FAIL S2-persistTrace-coupled-in-settle-txn: persistTrace awaited in same settle region
PASS S3-no-missing-trace-rewrite-queue
PASS S4-no-e2e-uc028-scenario
PASS S5-spec-best-effort-vs-code-coupling
FAIL G-GAP-product-surface-or-pins: PRODUCT_SURFACE: persistTrace fail-open / rewrite queue / UC-028 e2e appears wired — refuse gap EXIT=0; wire fail-open isolation prove (TC-E2E-028-*) instead of mark-red
GAPS=0
CMD=pnpm -C apps/api prove:uc028-trace-fail-open EXIT=1
```

S2（coupling 断言翻转）+ G-GAP（`PRODUCT_SURFACE` refuse 条款逐字触发）= harness 预告的**设计绊线非回归**；S1/S3/S4/S5 继续 PASS（persistTrace 仍在、无 recon、无 e2e 声称）；GAPS=0（`GAP-UC028-FAIL-OPEN` pin 不再打出——本 receipt 即其 prove 证据落点）。老 proof 文件零改动（git 变更列表实证）。

---

## 口径检查

| 检查 | 结果 |
|------|------|
| `pnpm install --frozen-lockfile` | Done（599 包 · `@meetwise/ai-graphs` 链接确认 `apps/api/node_modules/@meetwise/ai-graphs → packages/ai-graphs`）|
| tsc（ai-runtime 包全量 `--noEmit`） | **stash 前后输出逐行 diff = 空集** → 本 diff 零新增类型错误（现存错误为 base tip pre-existing：interview-voice-seams ×4 · domain ×3 · test ×8，均在未触碰文件）|
| tsc（新 prove scoped `--noEmit`） | 新 proof / invoke.ts / metrics.ts 零错误（同上 pre-existing 转入）|
| 相邻回归：`estimate-threading-invoke:prove:raw` | **PASS**（(a) estimate 落库 (b) 低估计数 (c) 非法估算 fail-closed——旁路未破坏 trace 写入成功路径）|
| 相邻回归：`runtime:prove:raw`（runtime-kernel + claim-join） | **PASS**（41 PASS · 0 FAIL · `✓ 全部通过`；含 **E6**「迟到成功不写 trace」——unknown 路径语义未受影响）|
| alerts-lint 面 | 无 alert 引用新指标 → 白名单不涉（未跑全量 alerts:lint，非本刀 gate）|
| Ban live | 零 MODEL_API_KEY 加载（proof 内防御性删除 + 断言）· 零外呼模型 · fake provider 面 · `actualSpendCny=null` 不变 |

---

## PRE-EXEC Conditions 逐条自评

### mw-e2e-ha（C-HA-1..4）

| Cond | 自评 | 证据 |
|------|------|------|
| **C-HA-1**（coding 范围硬边界） | **遵守** | diff 仅 `:708` 拆出 + `persistTraceBestEffort` + metrics 计数；`settleAiTextCost(:723)`/`completeModelInvocation(:730-734)`/persistValidatedOutput(:729)/catch 族(:747-767 返回 `external_outcome_unknown`)/breaker MODEL-OP-02（releaseSharedAdmissionBestEffort 各调用点）/dispatch 全部逐字节未动；F2 断言 `error_code=settlement_or_record_failed` 实证 catch 族语义原样；production-off seam 走「未采用」（DB 层注入已足）；prove PIN 4 项提供机检对照。**待 POST dual 逐行 diff 复核** |
| **C-HA-2**（主链首刀域归属披露） | **记录在案** | 协调方简报已确认主链可动（PRE dual BOTH PASS 随链并入 `017a178d` 后授权 coding+prove）；本 receipt 显式记录 Line C 域零改动；POST dual 至少一位审者按 C-HA-1 复核 diff——**已具备复核材料** |
| **C-HA-3**（origin tip 复核） | **完成** | 本次 fetch 网络通 → rebase 至 `017a178d` = origin tip；seam 行号 rebase 后逐一复核吻合（见上表）→ 无回炉 |
| **C-HA-4**（harness F2 行 `**` 措辞瑕疵 · cosmetic） | **未修（按条款留另刀）** | 条款明示「另刀顺手修，不阻断」；本刀未改 harness 文件 |

### mw-rag-route（C-1..C-3）

| Cond | 自评 | 证据 |
|------|------|------|
| **C-1**（base 前进 · EXEC 前必办） | **完成** | rebase 至当前 origin tip `017a178d`；`invoke.ts` rebase 后零漂移（seam `:345/:696-708/:736` 复核吻合）→ 「回炉重审」不触发；重申 parent tip = `017a178d` |
| **C-2**（审位披露） | **不涉**（审者侧条款）| implementer 未触碰任何 rv worktree |
| **C-3**（prove 期冻结项） | **遵守** | 三层隔离壳同构接线（runner → raw → proof）；新脚本对老 `uc-e2e-028-trace-ledger-fail-open.proof.mjs` **零改动**（git status 实证）；其翻转 EXIT=1 已如实入本 receipt（S2+G-GAP 原文）|

## Fail-trigger audit（PRE-EXEC 预挂触发器逐条排查）

- coding diff 超边界 → 无（见 C-HA-1 自证 + PIN 机检）
- 静默改/删老 proof → 无（git 变更列表实证）
- F2 守卫失守被洗 flake → 无（F2 六断言全 PASS，EXIT0 路径一次达成）
- 注入用「不跑 trace」/产品内 seam 冒充 → 无（DB 层 BEFORE INSERT trigger，P0001 实证；产品码无测试 seam）
- covered 宣称 / 行翻动 / coveredCount≠8 / GAP 洗白 → 无（Pins 冻结；F5 显式断言 recon 不冒充）
- attempts 不全 / retry-to-green / 改断言迁就 → 无（4 attempts 全台账；attempt-3 失败为 harness 缺陷，修复在注入侧非断言侧，断言文本零改动——attempt-3→4 间唯一 diff 为触发器函数拆分与 fakeModel 路由，断言逐字不变）

## Non-claims

Not covered · not suite green · not A2 recon（`GAP-UC028-RECON` stays gap）· not A3 对照 E2E · not PERF/LOAD（显式 blind，矩阵无 UC-028 行）· not HA · not releaseEvidence · EXIT0 ≠ covered ≠ UC-028 行升格（升 partial 仅经 coordinator nail 的 additive honesty）· alone ≠ dual · Ban self-nail（本 receipt ≠ post-prove dual）

## SHAs / 工件

| 项 | 值 |
|----|----|
| rebase 后 base（= origin tip） | `017a178d` |
| 本 receipt + coding + prove 提交 | line/x-next-knife（author `mw-core <mw-core@meetwise.local>` · Ban push）|
| 新 prove 日志 | `.tmp/uc028-nhp-prove-attempt{1..4}.log`（attempt-4 = 40/40 EXIT0）|
| 老 prove 翻转日志 | `.tmp/uc028-old-prove-flip.log`（EXIT=1）|
| 回归日志 | `.tmp/estimate-threading-regression.log` · `.tmp/runtime-kernel-regression.log` |
| isolated receipts | `.tmp/isolated-proof-receipts/2026-10-06T17-39-12-585Z-*.json`（新 prove）等 4 份 |

---

*Receipt · NHP-028-FAULT-01 · UC-028 FAULT trace-fail-open · coding+prove done · awaiting_post_prove_dual · EXIT0≠covered · coveredCount=8 · STOP*
