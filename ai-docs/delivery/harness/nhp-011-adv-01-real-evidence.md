# Harness — **NHP-011-ADV-01 · UC-011 ADV case-only → real evidence**（Line V · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · row stays partial · ADV stays gap/case-only）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve · Ban invent covered · this commit is not coding authorization and is not a prove）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`6a79946`** / full `6a79946ae5bb4b2148e0d63d3b7f66d64a1e51df`
**Knife**: **NHP-011-ADV-01（Line V）· UC-E2E-011 ADV 列 · refund-callback 错签/重放 real evidence** —— 一刀一 ADV case；case-only → 真证据；**EXIT0 ≠ covered**
**Gap id**: **`GAP-UC011-ADV-01`**（本刀具名 · 服务 NHP-011-ADV-01；不改既有 `GAP-UC011-REFUND-CALLBACK` 产品口缺口名）
**Case id**: **`NHP-011-ADV-01`**
**Row**: **`UC-E2E-011`** ADV 列 · not UC-E2E-018 · not UC-E2E-052 · not UC-E2E-025 · not UC-E2E-004
**Experts**: `mw-e2e-ha` + `mw-model-op`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding · Ban prove 执行（pre-exec dual PASS 后由协调方授权）

## 现状如实陈述（先读证据 · 行号按本树 `6a79946`）

矩阵 `e2e-requirement-coverage-matrix.md:117` row **`UC-E2E-011`**：NEG **partial** · FAULT **partial** · BOUND **partial**（幂等误 release）· ADV **gap** / `case-only` · 读法「缺 refund-callback；ADV=`case-only`（NHP-011-ADV-01）；压测仍 blind；≠ covered」。

NHP `non-happy-path-perf-load-case-matrix.md:58` row **`NHP-011-ADV-01`**：`011 | ADV | api | refund-callback 错签/重放 | 拒；无双退 | **gap**→**case-only** | 产品口缺失 = 仍 gap 执行面`。

backlog `e2e-covered-path-backlog.md:34` / `:45`：UC-011 HTTP 额度 H1–H5 已挂；**H5=GAP+PREREQ ≠ 产品口**；仍缺 refund-callback 产品口 / balance-ui；**≠ covered**。

scenarios `e2e-scenarios.md:238` UC-E2E-011：E3 退款幂等「退款回调重复 → 幂等键 ON CONFLICT DO NOTHING → 仅退一次」；验收 A3「重复退款回调仅退一次」；契约 `POST /payment/refund-callback`、`GET /wallet`；TC-E2E-011-refund-idem（:258）。

既有 harness `harness/uc-e2e-011-report-refund.md`：H4 honesty probe `POST /payment/refund-callback` / `GET /wallet` / `POST /commerce/webhook/refund/:id` → **404**；payment_order CHECK 有 `refunded` 但无 API；**产品口缺失** = `GAP-UC011-REFUND-CALLBACK`（§1b#1）。H1–H3/R1–R3 已绿 ≠ ADV 真证据。

**结论**：ADV 列仍是 **case-only / gap 执行面**——错签/重放无专用 prove、无机器可复核收据。本刀求 **ADV real-evidence prove 授权**（docs only 本 turn）。产品口缺失是诚实前提，**不**在本 REQUEST 冒充已接线。

## Quoted from the files

`non-happy-path-perf-load-case-matrix.md:58`：**NHP-011-ADV-01**「refund-callback 错签/重放 | 拒；无双退 | **gap**→**case-only** | 产品口缺失 = 仍 gap 执行面」。

`e2e-requirement-coverage-matrix.md:117`：ADV **gap** / `case-only`；「缺 refund-callback；ADV=`case-only`（NHP-011-ADV-01）；≠ covered」。

`e2e-scenarios.md:250-258`（E3/A3/TC）：退款回调幂等 + 契约 `POST /payment/refund-callback`。

`harness/uc-e2e-011-report-refund.md` H4/§1b#1：`POST /payment/refund-callback` **产品缺失**（运行时 404）；抬 covered 仍缺退款回调产品口。

## ADV 注入表（本刀恰一类 case · 错签 + 重放两腿）

| id | 注入什么 | 注入在哪 | 观察什么 |
|----|----------|----------|----------|
| **A1 错签** | 垃圾/错 HMAC sig（合法单形态） | `POST /payment/refund-callback`（或坐标方裁的等价 webhook） | **拒**（4xx 可解释）+ **无双退**（ConsumptionRecord / entitlement / payment_order 零误 released/refunded；DB before/after 快照） |
| **A2 重放** | 同幂等键合法回调顺序重放 | 同 A1 | 首退一次 / 次幂等安全（already / no-op）；余额/额度不变第二次；无双退 |

若产品口仍 404：prove **诚实 EXIT=1**（执行面 UNREACHABLE / GAP），逐项打印 `GAP-UC011-ADV-01` + `GAP-UC011-REFUND-CALLBACK` 明细；**Ban** 把 404 洗成 ADV partial/covered；**Ban** 在本刀内发明产品口。产品口落地属独立刀 `GAP-UC011-REFUND-CALLBACK`（§1b#1），**Ban 互借关闭**。

## prove 方案（授权后才执行 · 本 commit 不写码）

- **拟 CMD**：`pnpm uc011:adv:prove`（待授权新增；走 `scripts/run-e2e-isolated.mjs` 三层隔离壳，形态对齐 `uc011:report-refund:http:prove` / `uc014:webhook-adv:prove` 先例）。本 REQUEST **零代码行**。
- **断言**：A1+A2 HTTP 状态+错误码+DB before/after 快照；attempts 全记录 · one-shot · Ban retry-to-green · Ban 记 flake。
- **EXIT 契约**：
  - **EXIT 0** = A1+A2 真证据成立（拒 + 无双退）。EXIT0 **≠** UC-011 covered · **≠** ADV 自动翻 partial（须 post-prove dual + 协调方 nail）；**Ban invent covered** · coveredCount=**8** 不变。
  - **EXIT 1** = 诚实保留（口缺失 / 断言不成立）。打印 gap 明细；**Ban** 修 prove 迁就、Ban 改断言洗绿。
- **receipt**：`ai-docs/delivery/receipts/`（命名随执行日）+ machine receipts `.tmp/`。

## 行语义（冻结 · 本 REQUEST 与后续 coding 均不翻行）

- `UC-E2E-011` 整行 stays **partial**；ADV 列 stays **gap** / `case-only` 直至 prove + post-prove dual + 协调方 nail。
- `NHP-011-ADV-01` 本 REQUEST **不预claim** 升 partial。
- Ban 翻 §1.1 covered · Ban wash ADV into covered · Ban skip 借本刀关 `GAP-UC011-REFUND-CALLBACK` / balance-ui / PERF blind。
- Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 任何行/文件 · Ban SSOT edit（docs REQUEST 阶段零矩阵/backlog/checklist diff）。

## Ban 列表

- **Ban coding**（本 turn docs-only）；**Ban prove 执行**；**Ban push**；Ban force-push；Ban secrets / `.env*`。
- **Ban flip UC-011 to covered** · Ban invent covered · Ban invent ADV partial without dual+nail · Ban 把 H4 404 / H5 PREREQ 洗成 ADV 真证据。
- Ban 借刀改支付主链产品口（属 `GAP-UC011-REFUND-CALLBACK`）· Ban 碰 `principal.ts` · Ban live 模型 · Ban retry-to-green · Ban 记 flake。
- Ban Meridian · Ban HA cloud buy · Ban self-approve（alone ≠ dual）· Ban self-nail。

## Scope / Not

只做 `NHP-011-ADV-01` / UC-E2E-011 ADV 列 case-only→real-evidence REQUEST。Not refund-callback 产品实现刀。Not balance-ui。Not UC-018/025/004。Not PERF/LOAD。不发明新验收标准——以 scenarios E3/A3 + NHP-011-ADV-01 原文为准。

## Non-claims

Not a pass · not run · not covered · not ADV partial（本 REQUEST）· not refund-callback 产品口已落 · not HA · not releaseEvidence · not nail · EXIT0 ≠ covered · H4 404 ≠ ADV evidence · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · ADV stays gap/case-only · STOP

*Harness · NHP-011-ADV-01 · UC-011 ADV real evidence · awaiting_pre_exec_dual · EXIT0≠covered · STOP*
