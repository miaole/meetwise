# Slice — **NHP-017-LOAD-w-01 · UC-017 LOAD 大量孤儿预占回收**（Line Y · **`draft:awaiting_pre_exec_dual`** · EXIT0≠covered）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · stub · Ban coding · Ban prove · Ban push · alone ≠ dual）
**History**: docs REQUEST（本 commit）→ PRE dual（mw-e2e-ha + mw-rag-route）→ prove 接线+prove（授权后）→ POST dual → coordinator nail（后续，均未发生）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-07
**Base**: `origin/feat/mysql-schema-skeleton` · `1c4588f952b77e6173acfadf7f3351c311b0cff0`（`git fetch origin` 本 turn 成功 · pre-exec 前复核 tip 未前进）
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban push · Ban self-approve

## One-line

选 **NHP-017-LOAD-w-01**（UC-E2E-017 · LOAD · worker · **大量孤儿预占回收**；**非** 015-FAULT / 016-FAULT / 031-ADV / 033-FAULT / 040–043-BOUND / 027 / R4-PERF / R5-PERF / RAG-LOAD / UI-PAY / CLOUD-KILL / HA-RTO）。队列 `REMAINING-NORTH-STAR-QUEUE.md` Phase 2 item 12「remaining NHP rows one-knife-one-row」· NHP 矩阵 `:63` 具名行 `blind`→case-only（锚「—」）· §1.0.2 `:148` LOAD_worker blind「无并发退款/对账负载收据」· 需求源 `e2e-scenarios.md:197` UC-E2E-017（七类自列「高并发 ✅（对账 vs 重试竞态）· 逃逸 ✅（对账 sweeper）」· 验收 A1 额度恢复原值 / A3 无超 TTL 孤儿残留）· 产品接线真实：`commerce.ts:341` `sweepExpiredReservations`（翻转与 lease 复核同一条原子 UPDATE）+ `:384` `reconcile`（sweep + `:359` `settleOutbox` exactly-once）。零 Key 依赖 · O1–O4 单孤儿旁证 ≠ bulk 负载。本刀 = **additive LOAD 面显式化**：**PC** 正对照 + **L1** 回收完成（残留=0）+ **L2** 无漏扣（净变 0 · 无负值）+ **L3** 并发互斥无双放 + **L4** 幂等重跑 + **L5** 收据（吞吐/backlog/error rate · ≠SLO≠容量≠HA）+ **NEG 硬闸 N1 无双放/无双退/无重复入账 · N2 漏扫漏补=FAIL · N3 误扫活会话=FAIL · N4 幂等**（G7）。prove-only（零产品码 diff 意向 · 缺陷→EXIT1+backlog · **Ban 借刀改 `commerce.ts`**）。**Ban live** · **Ban fake-green suite** · EXIT0 ≠ covered · coveredCount=8。Dual = mw-e2e-ha + mw-rag-route（非隐私域 · 钱/对账域 · 不换 privacy-int）。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-uc017-load-sweep-nhp.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-uc017-load-sweep-nhp-mw-e2e-ha.md`（PENDING stub） |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-07-gap-uc017-load-sweep-nhp-mw-rag-route.md`（PENDING stub） |
| Prove receipt（授权后） | `receipts/2026-10-XX-gap-uc017-load-sweep-nhp-prove.md`（未创建 · 授权后另片） |

## Choice

**NHP-017-LOAD-w-01** over 015-FAULT（Batch3 两次 deferred「无既有 prove 锚」）/ 016-FAULT（model-op 邻域 · 留后刀）/ 031-ADV（禁 fake-model · eval 域）/ 033-FAULT（live worker 重面）/ 040–043-BOUND（席位 CAS 接线未证）/ 027（blocked 产品未接线）/ R4-PERF·R5-PERF（green-risk 机械绿禁）/ RAG-LOAD（重 · 兼 R4 盲区）/ UI-PAY（out-of-scope · runner 前置）/ CLOUD-KILL·HA-RTO（blocked · Phase 1/8）。Documented in harness。Ban UC-018/052/025/004/011/014/026/002/001。

## EXIT 契约（一句话）

`pnpm uc017:nhp-load:prove`（isolated 真 PG · 零 live 模型 · 诚实造数经真 reserve→置 lease 过期）**EXIT0 = PC+L1–L5+N1–N4 全绿+收据 = NHP-017-LOAD-w-01 具名真证据 ≠ covered ≠ suite green ≠ PERF/容量/SLO/HA**，UC-017 行与 §1.0.2 LOAD_worker 措辞不动、coveredCount=8；**EXIT1 = 诚实保留**（双放/漏扫/误扫活会话/幂等破防/对照不齐 → attempts 全记录 · Ban retry-to-green · EXIT1 不记 flake · 盲区不翻行 · 缺陷登记 backlog 修复另刀）。

## Ban

Ban coding（产品码）· Ban prove · Ban push · Ban live · Ban live default · Ban fake-green suite · Ban covered · Ban SSOT 翻行 · Ban self-approve · Ban self-nail · Ban Meridian · Ban HA cloud buy · Ban retry-to-green · Ban flake 记绿 · Ban invent covered · Ban 借刀改 `commerce.ts` · Ban 静默改老 `uc017:orphan:prove` O1–O4 · Ban 裸 INSERT 绕过 CAS 账面造数 · Ban 全扫冒充回收完成 · Ban 借 LOAD 收据宣 PERF/容量/SLO/HA · Ban 碰 018/052/025/004/011/014/026/002/001 行与他线在办文件。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503.

---

*Slice · NHP-017-LOAD-w-01 · draft:awaiting_pre_exec_dual · EXIT0≠covered · coveredCount=8 · STOP*
