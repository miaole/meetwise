# REQUEST — **NHP-017-LOAD-w-01 · UC-017 LOAD 大量孤儿预占回收** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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

## 选刀摘要（Phase 2 item 12 · 非 banned UCs）

Line Y · 下一 NHP = **NHP-017-LOAD-w-01**（UC-E2E-017 LOAD_worker 分面 · 大量孤儿预占回收 · blind→case/prove 显式化）。排除清单：**018/052/025/004/011/014/026/002/001**（已占用/FINAL）。其余 gap|blind 行落选理由见 harness 表（015-FAULT 无 prove 锚 · 016-FAULT model-op 邻域 · 031 eval 域禁 fake-model · 033-FAULT live 重面 · 040–043 接线未证 · 027 blocked · R4/R5-PERF green-risk · RAG-LOAD 重 · UI-PAY runner 前置 · CLOUD-KILL/HA-RTO blocked）。行引证：NHP 矩阵 `:63`（`blind`→case-only · 锚「—」）· §1.0.1 `:122` · §1.0.2 `:148` LOAD_worker blind · 需求源 `e2e-scenarios.md:197`（高并发/逃逸 spec 明文）· seam `commerce.ts:341/:384/:359`。零 Key 依赖（K/R 线标准：三件套齐+接线真实+无 Key 优先）。

## 请审什么（mw-e2e-ha · 隔离证据层诚实 · Ban fake-green suite · Ban live）

1. **选刀**：UC-017 LOAD_worker（blind · 锚「—」）vs 015/016/031/033/040–043/027/R 系/UI-PAY/CLOUD/HA — 裁决是否成立；排除清单是否被遵守；是否与他线在办撞行。
2. **负载合同**：诚实造数（真 `reserveEntitlement` → 置 lease 过期 · **Ban 裸 INSERT 绕过 CAS/bucket 账面**）下 **L1** 回收完成（稳态残留=0 · spec A3）+ **L2** 无漏扣（bucket 回补=allocations · `availableUnits` 净变 0 · 无负值 · spec A1）+ **L3** C 并发 reconcile 释放集互斥/恰一次 released + **L4** 幂等重跑零增量 + **L5** 收据（吞吐/backlog/error rate · ≠SLO≠容量≠HA）是否机检可断言。
3. **NEG 硬闸**（G7）：**N1** 并发无双放/无双退/无重复入账（settlement_ledger exactly-once 保持）· **N2** 任何漏扫/回补不齐 = EXIT1（Ban 洗 flake）· **N3** 新鲜（heartbeat 活）reserved **不得被扫**（commerce.ts:341 头注释自证条款 · Ban 全扫冒充回收完成）· **N4** 重跑无二次副作用。缺任一 = 合同不成立。
4. **PC positive control**：小规模单 sweep（镜像 O2）先跑全绿；对照缺失 = Ban 假绿。
5. **product diff 声明**：本刀拟 **prove-only**（新 proof 文件 + `package.json` script 注册 · 零 `apps/api/src`/`packages/db/src` diff 意向）；LOAD 实证缺陷 → EXIT1 + backlog，修复另刀，**Ban 借刀改 `commerce.ts`**。coding 仅在 PRE dual PASS + 协调方授权后。
6. **老 prove 关系**：`uc017:orphan:prove`（O1–O4）零改动；单孤儿 ≠ bulk；Ban 静默改老 proof/断言文本。
7. **EXIT0 ≠ covered**：EXIT0 = PC+L1–L5+N1–N4 全绿+收据 = 具名 case 证据 ≠ covered ≠ suite green ≠ PERF_api/PERF_web 面填补 ≠ 容量/SLO/HA；UC-017 行/§1.0.2 LOAD_worker 措辞不动（升格仅经 coordinator nail）；coveredCount=8 冻结。**EXIT1 = 诚实保留**；attempts 全记录；Ban retry-to-green · Ban flake 记绿 · Ban 改断言迁就。
8. **PERF/LOAD 适用性**：本行 = LOAD_worker（适用 · 主证）；PERF_api **不适用 → 显式 blind**、PERF_web n/a(非 UI 主) 保持不动；Ban 借 LOAD 收据宣 PERF。
9. **隔离与 Ban live**：isolated 真 PG（`run-e2e-isolated` 三层壳 + `assertIsolatedTestTarget` 先例）· 零 live 模型 · 不加载 MODEL_API_KEY · 拟名 `uc017:nhp-load:prove` / `prove:uc017-nhp-load` / `uc-e2e-017-nhp-load.proof.ts` 无命名冲突。
10. docs-only 本 turn；PRE dual PASS ≠ coding ≠ prove ≠ nail；专家对 mw-e2e-ha + mw-rag-route（非隐私域 · 不换 privacy-int）是否成立。

---

*Stub · awaiting expert pre-exec dual · STOP*
