# REQUEST — **NHP-017-LOAD-w-01 · UC-017 LOAD 大量孤儿预占回收** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-uc017-load-sweep-nhp.md` · slice `gap-uc017-load-sweep-nhp.slice.md`
**Parent tip**: `1c4588f9`（full `1c4588f952b77e6173acfadf7f3351c311b0cff0`；`git fetch origin` 本 turn 成功 · pre-exec 前复核线上 tip 未前进）
**Date**: 2026-10-07

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

## 为何 mw-rag-route（域说明）

UC-017 面 = **对账管线**：`reconcile` = `sweepExpiredReservations`（回收）+ `settleOutbox`（outbox→`settlement_ledger` exactly-once 结算消费 · `SKIP LOCKED` 多消费者不重复处理 · ledger UNIQUE + ON CONFLICT DO NOTHING）——与 retrieval/调用链同属「管线降级/账本叙事」耦合域：负载下 exactly-once 与 backlog 形状的诚实性直接影响管线叙事可信度；属 mw-rag-route 域内。**非隐私域**（钱/额度预占对账 · 非 PII 擦除/导出/checkpoint）→ 不换 mw-privacy-int。peer = `mw-e2e-ha`（隔离证据层主场）；不代签。既有 RAG 裁决（G-R2-5 等）不动不洗。

## 选刀摘要（Phase 2 item 12 · 非 banned UCs）

Line Y · 下一 NHP = **NHP-017-LOAD-w-01**（UC-E2E-017 LOAD_worker 分面 · 大量孤儿预占回收 · blind→case/prove 显式化）。排除清单：**018/052/025/004/011/014/026/002/001**（已占用/FINAL）。其余 gap|blind 行落选理由见 harness 表（015-FAULT 无 prove 锚 · 016-FAULT model-op 邻域 · 031 eval 域禁 fake-model · 033-FAULT live 重面 · 040–043 接线未证 · 027 blocked · R4/R5-PERF green-risk · RAG-LOAD 重 · UI-PAY runner 前置 · CLOUD-KILL/HA-RTO blocked）。行引证：NHP 矩阵 `:63`（`blind`→case-only · 锚「—」）· §1.0.1 `:122` · §1.0.2 `:148` LOAD_worker blind「无并发退款/对账负载收据」· 需求源 `e2e-scenarios.md:197`（高并发/逃逸 spec 明文）· seam `commerce.ts:341`（翻转与 lease 复核同一条原子 UPDATE · 自证 TOCTOU 杜绝）/`:384` `reconcile`/`:359` `settleOutbox`。零 Key 依赖（K/R 线标准：三件套齐+接线真实+无 Key 优先）。

## 请审什么（mw-rag-route · 管线 exactly-once 负载诚实 · Ban fake-green suite · Ban live）

1. **选刀**：UC-017 LOAD_worker（blind · 锚「—」）vs 015/016/031/033/040–043/027/R 系/UI-PAY/CLOUD/HA — 裁决是否成立；排除清单是否被遵守；RAG-LOAD-01 留后刀是否正当（不借本刀洗 R4/RAG LOAD 盲区）。
2. **exactly-once 负载合同**：`settleOutbox` 在并发 reconcile 下 **SKIP LOCKED + ledger UNIQUE ON CONFLICT** 语义真实行使 —— L3 释放集互斥 + N1 无双放/无双退/无重复入账（ledger 恰一次）是否机检可断言；Ban 用「单消费者」绕开并发面。
3. **NEG 硬闸**（G7）：**N1** 无双放/无双退/无重复入账 · **N2** 漏扫/回补不齐 = EXIT1（Ban 洗 flake）· **N3** 新鲜（heartbeat 活）reserved 不得被扫（commerce.ts:341 自证条款 · Ban 全扫冒充回收完成）· **N4** 幂等重跑零增量。缺任一 = 合同不成立。
4. **L4 幂等 + L5 收据读法**：稳态二次 reconcile released 增量=0；收据（吞吐/backlog/error rate）≠ SLO ≠ 生产容量 ≠ HA；**EXIT0 ≠ covered** ≠ suite green ≠ PERF_api/PERF_web 填补；UC-017 行/§1.0.2 措辞不动 · coveredCount=8 冻结。
5. **product diff 声明**：本刀拟 **prove-only**（新 proof + script 注册 · 零产品码 diff 意向）；缺陷 → EXIT1 + backlog · **Ban 借刀改 `commerce.ts`**；既有 RAG/路由裁决零触碰。
6. **老 prove 关系**：`uc017:orphan:prove`（O1–O4）零改动；单孤儿 ≠ bulk；Ban 静默改老 proof。
7. **EXIT1 = 诚实保留**：attempts 全记录；Ban retry-to-green · Ban flake 记绿 · Ban 改断言迁就。
8. **隔离与 Ban live**：isolated 真 PG 三层壳 + `assertIsolatedTestTarget` · 零 live 模型 · 不加载 MODEL_API_KEY。
9. docs-only 本 turn；PRE dual PASS ≠ coding ≠ prove ≠ nail；专家对 mw-e2e-ha + mw-rag-route（非隐私域 · 不换 privacy-int）是否成立。

---

*Stub · awaiting expert pre-exec dual · STOP*
