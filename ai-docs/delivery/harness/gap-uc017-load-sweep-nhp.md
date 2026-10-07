# Harness — **NHP-017-LOAD-w-01 · UC-017 LOAD 大量孤儿预占回收**（Line Y · **`draft:awaiting_pre_exec_dual`** · EXIT0≠covered）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · stub · Ban self-approve · alone ≠ dual · **Ban coding · Ban prove · Ban push**）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`1c4588f9`** / full `1c4588f952b77e6173acfadf7f3351c311b0cff0`（`git fetch origin` 本 turn **成功**（区别于 Line X 当次 curl 28）· pre-exec 前仍须复核线上 tip 未前进）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-y`（branch `line/y-next-nhp`）
**Knife**: **NHP-017-LOAD-w-01（Line Y）· 大量孤儿预占回收（bulk/concurrent orphan-reservation sweep）· blind→case/prove 显式化**
**Gap id**: **`GAP-UC017-LOAD-01`**（本刀具名认领 · 全仓 grep 无既有 `GAP-UC017-*` 钉 · 不发明 covered）
**Case id**: **`NHP-017-LOAD-w-01`**
**Row**: **`UC-E2E-017`** LOAD_worker 分面（§1.0.2）· not UC-015 / 016/029 / 031/032 / 033 / 040–043 / 027 / R4-PERF / R5-PERF / RAG-LOAD / UI-PAY / CLOUD-KILL / HA-RTO · **Ban** UC-E2E-018 / 052 / 025 / 004 / 011 / 014 / 026 / 002 / 001
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual · 非隐私域 · 不换 privacy-int）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding · Ban live · Ban fake-green suite

## 选刀（Phase 2 item 12 · remaining NHP rows one-knife-one-row · K/R 线标准）

队列 `REMAINING-NORTH-STAR-QUEUE.md` Phase 2 item 12「remaining NHP rows one-knife-one-row · highly parallel」→ 本回合 Line Y = 下一 NHP 行 REQUEST（docs-only）。选行标准（沿 Line K/R 先例）：**需求源三件套齐 + 产品接线真实 + 无 Key 依赖**（Key-blocked 类留 Phase 1）。选 **NHP-017-LOAD-w-01**。

### 排除清单（硬禁选 · 已占用/FINAL）

**UC-018 / UC-052(050–052) / UC-025 / UC-004 / UC-011 / UC-014 / UC-026 / UC-002 / UC-001**（各有已钉证据或进行中线：018 ADV/BOUND/PERF/LOAD partial 钉 · 052 deletion/checkpoint/pool-role 钉 · 025 NEG/FAULT/BOUND/ADV 四面钉 · 004 FI-1/FI-3 钉 · 011 ADV main-mouth 钉 · 014/026 ADV 七类钉 · 002 ADV 钉 · 001 NEG/BOUND/ADV/FAULT 四面钉）。

### 其余 gap|blind 行落选理由（诚实留痕）

| 候选行 | 当前旗 | 落选理由 |
|--------|--------|----------|
| NHP-015-FAULT-01 / LOAD | blind→case-only | Batch3 两次显式 deferred（`harness/nhp-batch3-fault-bound.md:89/106`「**无既有 prove 锚**」）；OCR 管线注入面无既有锚 → 落地性低于 UC-017 |
| NHP-016-FAULT-01 | gap→case-only | full.e2e 终态旁证存在，但显式失败注入属 model-op 邻域（生成链路），本刀选纯 DB/worker 零 Key 面；留后刀 |
| NHP-031-ADV-01 | gap(e2e)/partial(eval) | 质量断言归 ai-eval · **禁 fake-model 冒充**；e2e 结构面依赖 guardrail 接线证据，弱于 UC-017 |
| NHP-033-FAULT-01 | blind→case-only | A3 **live** worker 越权 job RLS 闭环 · W1≠闭环 —— live 面 + 重；留后刀 |
| NHP-040-BOUND-01（040–043） | gap | 席位 CAS/批 partial_failed = 静态 G-GAP（`GAP-UC043-SEAT-CAS` 等 honest pin · 接线未证）→ 先接线后 prove，非本刀 |
| NHP-027-NEG-01 | gap/blocked | 产品未接线（blocked） |
| NHP-R4-PERF-01 / NHP-R5-PERF-01 | blind / blind/green-risk | pgvector 机械绿禁令 · green-risk 标红；RAG PERF 留 RAG 线 |
| NHP-RAG-LOAD-01 | blind | 检索并发 LOAD 重且兼 R4 LOAD 盲区，单刀吃不下；留后刀 |
| NHP-UI-PAY-NEG-01 | gap/out-of-scope | UI 域 + Chromium runner 前置（G7 prereq），另刀 |
| NHP-CLOUD-KILL-FAULT-01 / NHP-HA-FAILOVER-RTO-01 | gap/out-of-scope/blocked | 云授权 Phase 1/8 · Ban buy cloud |
| NHP-LOAD-WORKER-SUITE | case-only/blind | 跨 UC 总册行，非单行一刀；由 UC 行逐个落地后汇总 |

### 选 NHP-017-LOAD-w-01 理由

| 依据 | 读法 |
|------|------|
| NHP 矩阵 `non-happy-path-perf-load-case-matrix.md:63` | 逐字：`NHP-017-LOAD-w-01 │ 017 │ LOAD │ worker │ 大量孤儿预占回收 │ 回收完成+无漏扣；收据 │ **blind**→**case-only** │ —` —— 具名 case、flag 含 **blind**、锚「—」（零执行零旁证）→ status=blind 合格 |
| coverage 矩阵 §1.0.1 `e2e-requirement-coverage-matrix.md:122` | `UC-E2E-017 │ **partial** │ **partial** │ **partial**（sweeper） │ **blind** │ HTTP/SSE 注入未进 isolated` —— 行合格 |
| coverage 矩阵 §1.0.2 `:148` | `UC-E2E-011 / 017 / 019（钱/对账） │ **blind** │ **n/a**(非 UI 主) │ **blind** │ 无并发退款/对账负载收据` —— LOAD_worker 分面 blind 具名 |
| 需求源 `ai-docs/requirements/use-cases/e2e-scenarios.md:197` | `UC-E2E-017 · 扣费预占后会话/SSE 创建失败 → 孤儿预占对账【评审必补#4·核心分布式洞】`；七类覆盖自列「**高并发 ✅（对账 vs 重试竞态）· 逃逸 ✅（对账 sweeper）**」；验收 A3「sweeper 跑后无超 TTL 孤儿 reserved 残留」；TC-E2E-017-sweeper —— **LOAD 面是 spec 明文**，需求源三件套第三件齐 |
| 产品接线真实 | `packages/db/src/commerce.ts:341` `sweepExpiredReservations`（状态翻转与 lease 复核**同一条原子 UPDATE** · 行锁下再判 `lease_expires_at` · 自证 TOCTOU 杜绝）；`:384` `reconcile`（周期性后台对账 = sweep + `:359` `settleOutbox` SKIP LOCKED + ledger UNIQUE ON CONFLICT exactly-once 入账）—— 非静态 G-GAP，sweeper 真实可跑 |
| 无 Key 依赖 | 纯 PG/worker 面（reserve→lease 过期→sweep），零模型调用 · 零 MODEL_API_KEY → 符合「无 Key 优先」 |
| 既有 lifecycle 先例 | `pnpm uc017:orphan:prove`（package.json:108-109 三层壳 `scripts/run-e2e-isolated.mjs` → `pnpm -C packages/db prove:uc017-orphan` → `packages/db/test/uc-e2e-017-orphan-reservation.proof.ts` O1–O4 · `assertIsolatedTestTarget`）—— 同 UC 同壳先例完整可沿 |

**选择声明**：Line Y = **NHP-017-LOAD-w-01**（UC-017 LOAD_worker 分面 · 大量孤儿预占回收）。O1–O4 为**单孤儿** integration ladder（partial 阶梯），**不含任何 bulk/并发负载面**；本刀 = additive LOAD 面（盲区原文「无并发退款/对账负载收据」）。本刀**只做 LOAD_worker 面**，NEG/FAULT/BOUND/ADV 列与 §1.1 行不动。

## 本刀面（LOAD_worker only · 显式边界）

| 今日 | 本 REQUEST | 授权后 |
|------|------------|--------|
| LOAD_worker=blind/case-only（锚「—」）；O1–O4 单孤儿旁证；无 bulk/并发 sweep 收据 | docs：具名 harness + L1–L5/N1–N4 负载合同 + dual stubs | prove 接线（新 proof 文件 + `package.json` script 注册 · **prove-only**）→ `pnpm uc017:nhp-load:prove`（隔离 · Ban live）→ POST dual → coordinator nail |

**与既有刀的差异（诚实声明）**：O1–O4 既有 prove **零改动**（回归锚沿用）；本刀为**新 proof 文件 + script 注册**，拟**零产品码改动**（`apps/api/src`/`packages/db/src` 零 diff 意向）。若 LOAD 实证并发缺陷（无双放/无漏扣/不误扫任一被打破）→ **EXIT1 诚实保留 + 缺陷登记 backlog**，修复属另刀（**Ban 借刀改 `commerce.ts`**）——与 Line X（WILL touch product）不同，本刀 prove-only。

## 负载合同（L1–L5 + NEG 硬闸 N1–N4 + PC · G7）

**负载形状（登记）**：isolated 真 PG（migrations 齐跑）· **诚实造数**：经真产品路径 `reserveEntitlement` 预占后置 `lease_expires_at` 过期（**Ban 裸 INSERT 绕过 CAS/bucket 账面**——造数必须保持账面自洽，否则 sweep 释放路径未被真实行使）；形状 N owners × M orphans（拟 N=20 × M=5 = 100 · 参数冻结入 receipt）+ C 并发 reconcile workers（拟 C=10）+ 新鲜（未过期）对照组。收据 `.tmp/uc017-perf-load-receipts/` + tracked `ai-docs/delivery/receipts/uc017-perf-load/`（**implementer pre-commit runs · not evidence of record** · 沿 UC-018 PERF/LOAD 先例措辞）。**settled cohort 登记（C-RV-1）**：prove 含 settled cohort（S=10 经真结算产生 outbox 行）+ C=10 并发行使 `settleOutbox`，settlement 半边非空壳。

| id | 列 | 负载/注入 | 期望观察（结构） |
|----|----|-----------|------------------|
| **PC** | positive control | 小规模单 owner 单 sweep（镜像 O2）先跑 | 全绿 → bulk 失败确由负载引起；**对照缺失 = Ban 假绿** |
| **L1** | **LOAD**（主证） | N×M 过期孤儿 + drain 循环至稳态 | 回收完成：稳态后「reserved 且 lease 过期」残留 = 0（spec 验收 A3） |
| **L2** | **LOAD**（账面） | 同 run 全量复核 | 无漏扣：每 bucket `units_reserved` 回补恰等于 allocations 和；全 run `availableUnits` **净变 0**（spec 验收 A1「额度恢复原值」）；无负 `units_reserved` |
| **L3** | **LOAD**（并发互斥） | C 个并发 reconcile 同 owner 集 | 无双放：释放集互斥；每 consumption 恰一次 `released`；总 released == 孤儿数；原子 UPDATE 语义在并发下保持（commerce.ts:341 自证条款的真实行使） |
| **L4** | **LOAD**（幂等） | 稳态后二次 reconcile | released 增量=0 · settlement_ledger 无新增（spec 幂等重发/不超扣） |
| **L5** | **LOAD**（收据） | 全程计时 | 吞吐（orphans/s）· wall time · backlog 形状（逐轮剩余数）· error rate 落 receipt；**≠ 线上 SLO · ≠ 容量 · ≠ HA** |
| **N1** | **NEG**（G7 硬闸 · 钱） | 并发窗口审计 | **无双放/无双退/无重复入账**（settlement_ledger exactly-once 保持）；违者 EXIT1 |
| **N2** | **NEG**（G7 硬闸 · 漏检） | 逐孤儿对账 | 任何过期孤儿漏扫或 bucket 回补不齐 = EXIT1；**Ban 洗 flake** |
| **N3** | **NEG**（G7 硬闸 · 误扫） | 新鲜（lease 未过期 · heartbeat 活）reserved 对照组 | **不得被扫**（sweepExpiredReservations 头注释自证条款）；Ban 用「全扫」冒充回收完成 |
| **N4** | **NEG**（G7 硬闸 · 幂等） | L4 重跑复核 | 无二次副作用；already-released 重入 → 0 行 |

**NEG 列合规**：N1 + N2 + N3 + N4 四行 NEG 硬闸（G7）——缺任一 = 合同不成立。

**老 prove 关系（诚实预告）**：`pnpm uc017:orphan:prove`（O1–O4）保持原样**零改动**；本刀新 proof 可选跑其作回归锚，但**Ban 静默改老 proof / Ban 改其断言文本**；O1–O4 绿 ≠ LOAD 收据（单孤儿 ≠ bulk）。

## prove 方案（授权后 · Ban live）

- **拟 CMD**：`pnpm uc017:nhp-load:prove`（壳：`scripts/run-e2e-isolated.mjs` → raw `pnpm -C packages/db prove:uc017-nhp-load` → `packages/db/test/uc-e2e-017-nhp-load.proof.ts`；沿 `uc017:orphan:prove` 三层壳 + `assertIsolatedTestTarget` 先例）。
- **隔离**：isolated 真 PG（migrations 齐跑）· **零 live 模型**（Ban 加载 MODEL_API_KEY · 不触发任何模型调用）· **Ban live default**。
- **attempts 全记录**：每次运行 attempt 序号、EXIT、失败类逐条进 receipt；**Ban retry-to-green**；**EXIT1 不记 flake**；Ban 改断言迁就结果。
- **PERF/LOAD 适用性声明**：本行 = **LOAD_worker 面（适用 · 本刀主证）**；UC-017 的 PERF_api = **不适用 → 显式 blind**（§1.0.2 盲区「无并发退款/对账负载收据」仅由本刀 LOAD 收据填补，PERF_api/PERF_web 面保持 blind/n-a 不动）· PERF_web n/a(非 UI 主)；**Ban 借 LOAD 收据宣 PERF SLO / 生产容量 / HA**。

## EXIT 契约

| EXIT | 语义 |
|------|------|
| **EXIT0** | PC+L1–L5+N1–N4 全绿（isolated 真 PG · 零 live 模型 · attempts 全记录 · 收据落盘）= 具名 case `NHP-017-LOAD-w-01` 真证据 · **EXIT0 ≠ covered** · **EXIT0 ≠ e2e:isolated suite green** · **EXIT0 ≠ UC-017 行 covered/partial 升格**（升格仅经 coordinator nail 的 additive honesty）· §1.0.1 UC-017 行 / §1.0.2 LOAD_worker 列措辞不动 · coveredCount=8 不变 · capacityRepresentative=false · ≠HA |
| **EXIT1** | 诚实保留路径：并发双放 / 漏扫漏补 / 误扫活会话 / 幂等破防 / 对照不齐 / 造数不可信 → 记 attempt、保留 blind、缺陷登记 backlog、Ban retry-to-green、Ban flake 洗绿、Ban 改断言；attempts 全记录后交协调方另裁（修复=另刀 · Ban 借刀改 commerce.ts） |

## 专家对（mw-e2e-ha + mw-rag-route · 为何非 privacy-int）

- **mw-e2e-ha**：隔离 PG 证据层 + 并发/负载 honesty 主场（沿 UC-018 PERF/LOAD、Line W 隔离壳先例）；钱账无双放/无漏扣审计是其 NEG 硬闸主场。
- **mw-rag-route**：`reconcile` = sweep + `settleOutbox` 结算消费链（outbox→ledger exactly-once），属账本/管线降级叙事耦合面；且为协调方指定第二审域；既有裁决（G-R2-5 等）不动不洗。
- **非隐私域**：UC-017 面 = 钱/额度预占对账（entitlement/commerce ledger），非 PII 擦除/导出/checkpoint → **不换 mw-privacy-int**（说明毕）。

## 行语义（冻结）

- UC-E2E-017 §1.0.1 行（partial/partial/partial/blind）与 §1.0.2 LOAD_worker（blind）措辞**不动**；升格仅经 prove+dual+coordinator nail；**Ban invent covered** · coveredCount=8。
- Ban 碰 UC-018 / 052 / 025 / 004 / 011 / 014 / 026 / 002 / 001 行与各线在办文件；`GAP-UC017-LOAD-01` 为本刀新认领，非既有钉翻动。
- 既有 `harness/uc-e2e-017-orphan-reservation.md` + eval 文档 + O1–O4 proof 文件**零改动**。

## Ban 列表

- Ban coding（产品码）· Ban prove 执行 · Ban push · Ban live · Ban live default · Ban fake-green suite
- Ban covered · Ban SSOT 翻行 · Ban invent covered · Ban retry-to-green · Ban flake 记绿 · Ban 改断言迁就
- Ban self-approve · Ban self-nail · Ban force-push · Ban secrets / `.env*` · Ban Meridian · Ban HA cloud buy
- Ban selecting UC-018 / 052 / 025 / 004 / 011 / 014 / 026 / 002 / 001 · Ban 碰他线在办文件
- Ban 借刀改 `commerce.ts`/产品码（LOAD 缺陷 → EXIT1 + backlog，修复另刀）
- Ban 裸 INSERT 绕过 CAS/bucket 账面造数 · Ban 全扫冒充回收完成 · Ban 借 LOAD 收据宣 PERF/容量/SLO/HA

## Non-claims

Not a pass · not run · not covered · not live · not suite green · not PERF_api/PERF_web · not production capacity · not SLO · not HA · alone ≠ dual · EXIT0 ≠ covered · 不宣称 LOAD 面已收据（此为 REQUEST，prove 未跑）
