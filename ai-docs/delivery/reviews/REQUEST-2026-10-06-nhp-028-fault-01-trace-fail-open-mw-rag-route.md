# REQUEST — **NHP-028-FAULT-01 · UC-028 FAULT trace-fail-open** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/nhp-028-fault-01-trace-fail-open.md` · slice `nhp-028-fault-01-trace-fail-open.slice.md`
**Parent tip**: `4766d4fc`（full `4766d4fc2a9d06f2d95a7ab7759430c4cc494bfc`；`git fetch origin` 当次网络失败 curl 28 · 本地 origin ref 为准 = 预期下限 · pre-exec 前复核线上 tip 未前进）
**Date**: 2026-10-06

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

UC-028 面 = **ai-runtime invoke→settle→complete 链路的可观测旁路**（`ai_invocation_trace` 写失败语义）：trace 是调用链/路由可观测性的账本，其失败处理直接影响 retrieval/调用链降级叙事的可信度；属 mw-rag-route 域内（调用链/路由观测耦合）。**非隐私域**（非 PII 擦除/导出/checkpoint）→ 不换 mw-privacy-int。peer = `mw-e2e-ha`（隔离证据层主场）；不代签。

## 选刀摘要（为何非 ① / 非 banned UCs）

Line X · ② 下一 NHP = **NHP-028-FAULT-01**（UC-E2E-028 FAULT · trace 写失败不阻塞业务 · A1 only）。① 判无实义：UC-001 无 covered-criterion 脚本（全仓仅 `scripts/uc-e2e-018-covered-criterion.proof.mjs` + evaluator）且 AB nail `6b878da` 后 UC-001 矩阵行逐列诚实（NEG/BOUND blind/case-only · FAULT partial · ADV blind · coveredCount=8）→ 无判据可对齐；且 UC-001 行被 Line AG（`NHP-001-ADV-01` · `626e0605`）占用。UC-028：backlog 下一刀顺序 #3（#1 025 / #2 004 排除）· NHP 矩阵 `:107` 具名 gap case · §1.0.1 `:127` 全 gap/blind 行 · seam=`packages/ai-runtime/src/invoke.ts:707-708`（persistTrace 与 settleAiTextCost/completeModelInvocation 同事务 · trace 失败连坐 `external_outcome_unknown` ≠ `e2e-scenarios.md` UC-E2E-028 spec fail-open）。排除清单：**018/052/025/004/011/014/026/002/001**。

## 请审什么（mw-rag-route · 调用链观测旁路诚实 · Ban fake-green suite · Ban live）

1. **选刀**：UC-028 FAULT（A1 fail-open）vs ① 复核刀 / 027 blocked / 016-029 / 012-024 / 031-032 / 040-043 — 裁决是否成立；排除清单是否被遵守。
2. **trace 语义合同**：F1（trace INSERT 必败 → 业务 completed + 额度 confirmed + 非 trace 连坐 `external_outcome_unknown` + 失败 trace 结构化观测，不得静默无痕）是否与 spec「trace 是旁路非真相」一致；旁路拆出后**不得反向污染** settle/retrieve 的 fail-closed 叙事（G-R2-5 等既有裁决不动、不洗）。
3. **NEG 硬闸**（G7）：**F2** 业务真相写失败必须阻塞 · **F4** 无双扣/无重复入账 · **F5** 失败 trace 不要求已补写（`GAP-UC028-RECON` stays gap · 不冒充 recon）。缺任一 = 合同不成立。
4. **F3 positive control**：无注入同路径全绿；对照缺失 = Ban 假绿。
5. **product diff 声明**：本刀 WILL touch `packages/ai-runtime/src/invoke.ts`（persistTrace 拆出 settle 事务为 best-effort 旁路 + 失败结构化观测；可选 production-off seam 沿 FI-3 先例）——与 AB prove-only 不同；coding 仅在 PRE dual PASS + 协调方授权后。
6. **老静态 prove 绊线**：接线后 `pnpm uc028:trace-fail-open:prove` 预期按自带 refuse 条款翻转 EXIT=1 = 设计绊线非回归；更新属另刀；Ban 静默改老 proof。
7. **EXIT0 ≠ covered**：EXIT0 = F1–F5 全绿具名 case 证据 ≠ covered ≠ suite green ≠ A2/A3 闭合；UC-028 行/FAULT 保持 gap 措辞；coveredCount=8 冻结。**EXIT1 = 诚实保留**；attempts 全记录；Ban retry-to-green · Ban flake 记绿 · Ban 改断言迁就。
8. **PERF/LOAD**：不适用 → 显式 blind；Ban claim 容量/SLO。
9. **隔离与 Ban live**：isolated 真 PG · 零 live 模型 · 不加载 MODEL_API_KEY；Ban live default · Ban fake-green suite · Ban 伪造模型输出质量断言（质量归 ai-eval，本刀不测质量）。
10. docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail。

---

*Stub · awaiting expert pre-exec dual · STOP*
