# MODEL-OP spend-ledger — 现状文档（**implementation doc · not a close**）

**Status**: **`executed:awaiting_post_prove_dual`**（implementation doc · not a close）· **≠ MODEL-OP closed** · **≠ cutover** · **≠ SLO** · **≠ HA**
**Date**: 2026-10-02（PT）
**Line**: **I**（MODEL-OP spend-ledger docs + offline prove hardening）
**Baseline**: `3d7063f`（`feat/mysql-schema-skeleton`）· worktree `line/i-model-op-ledger`
**Pre-exec dual**: PASS（`mw-model-op` + `mw-e2e-ha` @ REQUEST `dfd8443`）· post-prove dual 由独立审查方后置
**Knife**: `harness/model-op-spend-ledger-offline.md` · `model-op-spend-ledger-offline.slice.md`
**Pins（不可改口）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · 公开 DELETE=**503**

---

## 0. 本文档是什么 / 不是什么

本文档是 MODEL-OP 费用账（spend ledger）的**现状盘点**：仓库里实际存在哪几本账、各自记什么、可信到什么程度、缺口在哪。它**不**关闭任何账本，**不**宣称任何未落地能力，**不**把估算当成实付。

三个数字永远分开（harness honesty 原文）：

> **Estimate, cap, and console actual are three different numbers.**

| 数字 | 含义 | 来源 | 本文口径 |
|------|------|------|----------|
| **estimate**（`estimatedCostCny`） | 按价目表×token 估算的单调用/累计成本 | 代码内估算器 | 可离线复现，**非实付** |
| **cap**（`runCostCapCny` / `capCny`） | G7 单次跑的封顶（¥5.00） | 文档定值 + 环境变量覆盖 | 封顶护栏，**不是预算承诺** |
| **console actual**（`actualSpendCny`） | 控制台实付金额 | **只能**由用户/控制台 out-of-band 提供 | 代码内恒为 `null` |

---

## 1. 账本清单：仓库里实际存在两本不同的账（命名并列，不是同一本）

### 1.1 G7 跨进程跑次封顶账（NDJSON）——**这是 harness/REQUEST 正文说的 "spend-ledger"**

- 实现：`packages/ai-runtime/src/g7-freetier-reprove-guard.ts`（本刀**只引用、未改**）。
- 关键面：`G7_RUN_COST_LEDGER_PATH`（环境变量）→ `resolveG7LedgerPath` / `readG7SharedLedger` / `reserveG7CallOnSharedLedger` / `finalizeG7ReservationOnSharedLedger` / `recordG7CallToSharedLedger` / `inspectG7SharedLedger`。
- 形态：api 与 worker 两进程共享一个 **NDJSON 文件**（call / reservation / release 行），文件锁串行化，¥5.00 / 2,000,000 token / 200 call 三重封顶。
- 回执：`buildG7ReceiptFields` 写死 `actualSpendCny: null`、`estimatedCostCny` 取进程内/共享账累计估算、`priceBookCitation` 为常量文案、`releaseEvidence: false`。
- **定性：这是一本"跑次封顶护栏账"（run-cap guard），可写 NDJSON ≠ 已认证花费账。** 它记录的是**估算**与预留，不记录控制台实付。

### 1.2 usage/calibration 生产对账链（PG）——**wired，未 cutover，未关闭 MODEL-OP**

- 实现：`packages/ai-runtime/src/usage-reconciliation.ts`（纯模块）+ `packages/ai-runtime/src/usage-calibration-reconciler.ts`（域级 reconciler + db wrapper）。
- 接线：`apps/worker/src/main.ts` 启动 `runUsageCalibrationReconciler` 与 `runModelInvocationReconciler`（本刀**未改**该文件）。
- 定性（沿用既有 slice/eval `model-op-real-reconciler-wiring` 的明文）：**≠ cutover · ≠ MODEL-OP closed**。真实 worker loop 的定时/事件调度不在该件范围；生产切换从未声称。

### 1.3 两本账的关系（禁止混同）

| 维度 | G7 封顶账（NDJSON） | usage/calibration 账（PG） |
|------|--------------------|---------------------------|
| 目的 | 单次 G7 跑不超 ¥5/2M tok/200 call | 长期 estimate↔provider usage 校准 |
| 存储 | 本地 NDJSON 文件（`G7_RUN_COST_LEDGER_PATH`） | PG（`ai_usage_calibration_*` 表） |
| 认证 | **无 HMAC、无签名**（缺口 GN-SPEND-LEDGER-FILE） | insert-only、内容寻址、幂等落库 |
| 记录金额 | `estimatedCostCny`（估算） | 校准因子与观测（非金额承诺） |
| 状态 | 在用（G7 re-prove 护栏） | wired · **≠ cutover** |

**禁止**把 G7 `estimatedCostCny` 写成 `actualSpendCny`；**禁止**把 G7 封顶账当成校准账已切换的证据。离线 prove（§3）对这条有专门断言。

---

## 2. 费用/费率数字：来源与非承诺性

- 价目表 `G7_CONSOLE_PRICE_BOOK` 内所有费率（如 deepseek-v4-flash input ¥1 / 1M tok、embed ¥0.5 / 1M tok、qwen-audio-turbo ¥0.00024 / sec 等）的**唯一出处**是源码头注与 `G7_PRICE_BOOK_CITATION` 常量：**`console-reported by user via coordinator 2026-09-23`**，即用户经协调方口头/控制台报告，**未经独立核验**（guard 源码自陈 `NOT independently verified`）。
- 因此本文档引用的任何费率/封顶数字都是**非承诺性**的：不构成定价、账单、成本上限承诺或 SLO。控制台实付以云厂商控制台为准。
- free 模型（qwen3.8-flash 等）费率为 0 的含义是"免费额度 wiring"（`freeQuota: true`），**不是**生产模型/性能/容量证据（`evidenceLabel: 'free-tier model; not production-model evidence; not perf SLO evidence'`）。
- ¥5.00 封顶（`G7_RUN_COST_CAP_CNY = 5`）是 G7 re-prove 的护栏定值，**不是**月度/项目预算承诺。

## 3. 离线 prove（本刀新增，全部离线）

落点：`packages/ai-runtime/test/model-op-spend-ledger.proof.ts`（**新**离线脚本；import 只引用 guard 导出，未改任何 `src/` 文件）。运行：

```
pnpm --filter @meetwise/ai-runtime prove:model-op-spend-ledger
```

覆盖 harness `:41` 四条 plan checks 与 NHP 1–4：

| # | NHP | 断言 |
|---|-----|------|
| 1 | NEG | 缺 `G7_RUN_COST_LEDGER_PATH` → `resolveG7LedgerPath` / `readG7SharedLedger` / `recordG7CallToSharedLedger` 全部 fail-closed（`g7_cost_ledger_path_missing`） |
| 2 | FAULT | fixture 账本已达/超封顶 → 再一次估算调用被拒（`g7_cost_cap_exceeded`），账本字节不变（无静默写入、无 live 重试；全测试无网络无 Key） |
| 3 | BOUND | `buildG7ReceiptFields` 无论累计估算多少，`actualSpendCny` 恒为 `null`；估算器/账本行只产生 `estimatedCostCny` 字段，永不产生 `actualSpendCny` 字段 |
| 4 | ADV | 改写过的 NDJSON（无签名）会被 `readG7SharedLedger` 读入并移动封顶读数 → **证明缺口存在**；harness 侧策略函数拒绝无控制台出处的伪造实付（harness-only，不入 `src/`） |

补充断言（mw-model-op pre-exec §5 要求）：G7 封顶账与 usage/calibration reconciler **分开证明**——回执里 `estimatedCostCny` 是数字而 `actualSpendCny` 是 null；回执含 `releaseEvidence: false` 且不含任何 "closed/cutover" 声明字段。

**EXIT 0 ≠ MODEL-OP 关闭 ≠ cutover ≠ SLO。** prove 只证明上述离线策略行为。

## 4. 缺口（gap notes，原样保留）

| Gap | 事实 | 状态 |
|-----|------|------|
| GN-SPEND-ACTUAL-NULL | 进程回执写 `actualSpendCny: null`；估算累计 ≠ 控制台实付 | **OPEN**（本刀不改主链） |
| GN-SPEND-LEDGER-FILE | NDJSON 账本无 HMAC/签名；改写文件可移动封顶读数 | **OPEN**（prove #4 演示并拒绝当证据） |
| GN-SPEND-PRICE-REV | `priceRevision` 位于 invoke 出站链，Line C 正在编辑 | **OPEN**（本刀不 retune、不触碰） |

缺口修复去向：SSOT backlog（`e2e-covered-path-backlog.md` 等）本刀**禁改**，由协调方/后续刀收口。

## 5. 边界与未声称清单（Non-claims）

本文档与对应 prove **不**声称：

- ≠ MODEL-OP-00 closed · ≠ spend reconciled · ≠ cutover
- ≠ production spend ledger（G7 NDJSON 只是跑次护栏）
- ≠ HA · `haStatus=NOT_HA` · `claimProductionHA=false`
- `releaseEvidence=false` · G7 free-tier 绿 ≠ 生产模型/性能/容量证据
- ≠ suite green · ≠ SLO · prove EXIT 0 不升级任何 pin
- 公开 DELETE 仍 503 · PG retained · coveredCount 仍 8

---

*MODEL-OP spend-ledger implementation doc · Line I · 2026-10-02 · executed:awaiting_post_prove_dual · Ban live · actualSpendCny stays null*
