# Harness — **GAP-UC011-REFUND-CALLBACK · refund-callback product mouth**（Line Z · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · row stays partial · Ban wash ADV into covered）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding product · Ban prove 执行 · Ban self-approve · Ban invent covered · Ban wash ADV covered via this REQUEST · this commit is not coding authorization and is not a prove）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`f43bea1`** / full `f43bea12fc7f2e28e7bb0052b6a80811eac47e91`
**Knife**: **GAP-UC011-REFUND-CALLBACK（Line Z）· UC-E2E-011 refund-callback 产品口** —— 可测产品口落地 **或** 诚实 ADR 降级合同；**EXIT0 ≠ covered**
**Gap id**: **`GAP-UC011-REFUND-CALLBACK`**（§1b#1 · harness `uc-e2e-011-report-refund.md` · Line V nail 明示 stays **OPEN** · product mouths = this knife）
**Case id**: **product-mouth**（非 NHP-011-ADV-01；ADV 刀已 nailed honesty-of-red · **Ban** 借本刀洗 ADV→covered）
**Row**: **`UC-E2E-011`** · not UC-E2E-018 · not UC-E2E-052 · not UC-E2E-025 · not UC-E2E-004
**Experts**: `mw-e2e-ha` + `mw-model-op`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban SSOT edit · Ban coding product · Ban prove 执行（pre-exec dual PASS 后由协调方授权）

## 现状如实陈述（先读证据 · 行号按本树 `f43bea1`）

矩阵 `e2e-requirement-coverage-matrix.md:117` row **`UC-E2E-011`**：NEG **partial** · FAULT **partial** · BOUND **partial** · ADV **gap** / `case-only` · 读法「缺 refund-callback；ADV=`case-only`（NHP-011-ADV-01）；≠ covered」。

矩阵 nail 注 `e2e-requirement-coverage-matrix.md:414` / backlog `gap-bug-backlog.md:463-468`：Line V **NHP-011-ADV-01** nailed as **honesty of red**（`post_prove_dual_pass` · PROVE_EXIT **1** · 三口 **404** · A1/A2 **UNREACHABLE**）· **`GAP-UC011-ADV-01`** + **`GAP-UC011-REFUND-CALLBACK`** stay **OPEN** · product mouths = **other knife**（= 本刀）· Ban 互借关闭 · UC-E2E-011 stays **partial** · coveredCount=**8**.

backlog `e2e-covered-path-backlog.md:34` / `:45`：UC-011 HTTP 额度 H1–H5 已挂；**H5=GAP+PREREQ ≠ 产品口**；仍缺 refund-callback 产品口 / balance-ui；**≠ covered**.

scenarios `e2e-scenarios.md:238` UC-E2E-011：E3 退款幂等「退款回调重复 → 幂等键 ON CONFLICT DO NOTHING → 仅退一次」（:248）；验收 A3「重复退款回调仅退一次」（:251）；契约 `POST /payment/refund-callback`、`GET /wallet`（:253）；TC-E2E-011-refund-idem（:258）。

既有 harness `harness/uc-e2e-011-report-refund.md` §1b#1（:69）：**支付退款回调产品口** = `POST /payment/refund-callback`（或等价 webhook）+ `payment_order`/`ConsumptionRecord` confirmed→refunded（或红冲）CAS + 幂等键（支付单号+流水）集成证明 · `GAP-UC011-REFUND-CALLBACK`。H4/H5 钉三口 **404** + 静态 pay-only；PREREQ 打印 ≠ 产品口已落。

Line V harness/nail：ADV prove `pnpm uc011:adv:prove` **EXIT 1** 诚实保留；**Ban wash 404=pass**；产品口属独立 `GAP-UC011-REFUND-CALLBACK`。

**结论**：产品口仍缺失（三口 404 · 无 `markOrderRefunded`）= `GAP-UC011-REFUND-CALLBACK` **OPEN**。本刀求 **产品口落地（可测）或诚实 ADR 降级合同** 的 docs REQUEST 授权。本 turn **零代码**。**Ban** 把本 REQUEST / 后续口绿洗成 ADV covered / §1.1 covered。

## Quoted from the files

`gap-bug-backlog.md:468`：**STILL_OPEN** · `GAP-UC011-REFUND-CALLBACK`（`POST /payment/refund-callback` + `markOrderRefunded` / webhook refund 产品口未落）stays **OPEN** · product mouths = **other knife**.

`e2e-requirement-coverage-matrix.md:117`：缺 refund-callback；ADV=`case-only`；≠ covered。

`e2e-scenarios.md:248-258`：E3/A3/TC-E2E-011-refund-idem + 契约 `POST /payment/refund-callback`.

`harness/uc-e2e-011-report-refund.md:69` §1b#1：支付退款回调产品口 = 抬 covered 前置 · `GAP-UC011-REFUND-CALLBACK`.

## 产品口合同（本刀 · 两选一 · 不发明新验收）

### Path A — 可测产品口落地（授权后才写码 · 本 commit 不写）

| 项 | 合同（锚定已有原文 · 非发明） |
|----|------------------------------|
| HTTP 口 | `POST /payment/refund-callback` **或** 等价 webhook（`/commerce/webhook/refund/:id` / `/commerce/orders/:id/refund-callback` 之一，由实现裁并在 prove 钉死）——须 **非 404** |
| DB / 域 | `markOrderRefunded`（或等价）：paid→refunded CAS；Consumption/权益 confirmed→refunded（或红冲）与 D1 对齐；幂等键（支付单号+流水）exactly-once |
| 验签 | fail-closed（错签拒；无双退）——与 scenarios E3/A3 + 后续 ADV 重跑前提对齐 |
| 可测 prove | 拟 CMD（授权后新增，形态对齐 `uc011:report-refund:http:prove` / `uc011:adv:prove` 隔离壳）：至少 **M1 合法回调一次退** + **M2 同键重放幂等**；口仍缺 → EXIT1 诚实 |
| 静态废止条件 | 口浮出后 **禁止**继续用 H4/H5 404 GAP 叙事冒充闭环（既有 PREREQ-6） |

### Path B — 诚实 ADR 降级合同（若产品决定不落该口）

| 项 | 合同 |
|----|------|
| ADR | 正式 ADR：声明 scenarios 契约 `POST /payment/refund-callback` / TC-E2E-011-refund-idem **降级或改口径**（例如仅 entitlement 释放路径、无支付回调口） |
| 证据 | ADR 文本 + 双审引用；矩阵/scenarios/harness 后续由协调方 nail 对齐（**本 REQUEST 零 SSOT edit**） |
| Ban | Ban 把「未落口 + 无 ADR」写成已关闭；Ban 把 ADR 降级洗成 UC-011 **covered**；Ban 静默删 E3/A3 |

两 path **择一**；未授权前本 turn 只 REQUEST。双 path 均 **EXIT0 ≠ covered** · UC-011 stays **partial** 直至 **独立 covered-lift**。

## EXIT 契约（授权后才执行 · 本 commit 不跑）

- **EXIT 0**（Path A prove）= 产品口可测真证据成立（非 404 + M1/M2）。EXIT0 **≠** UC-011 covered · **≠** ADV 自动翻 partial/covered · **≠** 关 `GAP-UC011-ADV-01` · **≠** 独立 covered-lift。coveredCount=**8** 不变。**Ban invent covered** · **Ban wash ADV into covered via this REQUEST**.
- **EXIT 1** = 诚实保留（口仍缺 / 断言不成立）。打印 `GAP-UC011-REFUND-CALLBACK` 明细；**Ban** 修 prove 迁就、Ban 改断言洗绿。
- Path B：无 prove EXIT；关闭条件 = ADR + dual + 协调方 nail；仍 **≠ covered**.

## 与 Line V / ADV 的边界（硬钉）

- Line V `NHP-011-ADV-01` = honesty of red（EXIT1 · 三口 404）已 nail · **本刀不重开 ADV prove**、不改写该 nail。
- 产品口落地 **后**，ADV 错签/重放真证据属 **独立后续刀**（可复跑 `uc011:adv:prove`）；**Ban** 声称「口绿 = ADV covered」。
- **Ban washing ADV covered via this REQUEST** · Ban 互借关 `GAP-UC011-ADV-01` · Ban 借口绿翻 §1.1 covered。
- balance-ui / wallet / fail HTTP mouth / UC-019 / sole-stack = **其它缺口** · 本刀不关。

## 行语义（冻结 · 本 REQUEST 与后续 coding 均不翻行）

- `UC-E2E-011` 整行 stays **partial** 直至独立 covered-lift + dual + 协调方 nail。
- `GAP-UC011-REFUND-CALLBACK` 本 REQUEST **不预claim** CLOSED。
- `GAP-UC011-ADV-01` stays **OPEN**（本刀不关）。
- ADV 列 stays **gap** / `case-only`（本刀不洗）。
- Ban 翻 §1.1 covered · Ban invent covered · Ban SSOT edit（docs REQUEST 阶段零矩阵/backlog/checklist diff）。
- Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 任何行/文件。

## Ban 列表

- **Ban coding product**（本 turn docs-only）；**Ban prove 执行**；Ban force-push；Ban secrets / `.env*`.
- **Ban flip UC-011 to covered** · Ban invent covered · **Ban wash ADV into covered via this REQUEST** · Ban 把 H4/H5 404 / PREREQ 打印洗成产品口已落。
- Ban 互借关 `GAP-UC011-ADV-01` · Ban 碰 `principal.ts` · Ban live 模型 · Ban retry-to-green · Ban 记 flake。
- Ban Meridian · Ban HA cloud buy · Ban self-approve（alone ≠ dual）· Ban self-nail。
- Ban 借本刀关 balance-ui / wallet / UC-019 / PERF blind。

## Scope / Not

只做 `GAP-UC011-REFUND-CALLBACK` 产品口（可测落地 **或** 诚实 ADR 降级）REQUEST。Not ADV 重跑刀。Not covered-lift。Not balance-ui。Not UC-018/025/004。Not PERF/LOAD。不发明新验收标准——以 scenarios E3/A3 + §1b#1 原文为准。

## Non-claims

Not a pass · not run · not covered · not ADV partial/covered · not 产品口已落 · not ADR 已批 · not HA · not releaseEvidence · not nail · EXIT0 ≠ covered · H4/H5 404 ≠ 产品口 · alone ≠ dual · Line V ADV nail ≠ 本刀关闭

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · UC-011 stays partial · ADV stays gap/case-only · STOP

*Harness · GAP-UC011-REFUND-CALLBACK · product mouth · awaiting_pre_exec_dual · EXIT0≠covered · Ban wash ADV covered · STOP*
