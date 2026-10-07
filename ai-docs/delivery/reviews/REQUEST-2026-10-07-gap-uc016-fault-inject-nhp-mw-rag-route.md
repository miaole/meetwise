# REQUEST — **NHP-016-FAULT-01 · UC-016/029 诊断/押题显式失败注入** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-uc016-fault-inject-nhp.md` · slice `gap-uc016-fault-inject-nhp.slice.md`
**Parent tip**: `14c14a31`（full `14c14a316477745d142bbd02ba383e477888adde`；`git fetch origin` 本 turn 两次成功 · 开工 `2fd78ea1` → 写前 origin 前进一枚 MOP-01 nail `14c14a31` 已 `--ff-only` 跟进 · pre-exec 前复核线上 tip 未前进）
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

Line Y2 · 下一 NHP = **NHP-016-FAULT-01**（UC-E2E-016/029 FAULT 分面 · 诊断/押题显式失败注入 · gap→case/prove 显式化 · Line Y `harness/gap-uc017-load-sweep-nhp.md:28` 显式「留后刀」）。排除清单：**018/052/025/004/011/014/026/002/001/028 + UC-017-LOAD 面（Line Y 已钉）**。其余 gap|blind 行落选理由见 harness 表。行引证：NHP 矩阵 `:82`（`gap`→case-only · 锚「full.e2e 终态旁证」）· §1.0.1 `:121`（`gap│gap│partial(0题)│blind`「有终态无显式失败注入」）· 需求源 `e2e-scenarios.md:163-181`（E1/E2/E3 · TC ×3）。seam：`quiz-consumer.ts:13/:24/:56/:58` · `diagnosis-consumer.ts:13/:55/:57` · `quiz-lifecycle.ts:40-41`/`diagnosis-lifecycle.ts:46-47`（「模型在注入边界外」）· `model-client.ts:137` `scriptedModelClient`。零 Key 依赖。**为何第二审 = mw-rag-route（协调方本刀指定对）**：诊断/押题 = 生成链路（`buildResumeQuizGraph`/`buildResumeDiagnosisGraph` → `invoke` 双校验）降级叙事耦合面，与本域既有 fail-closed/honesty 裁决（G-R2-5 / R4 系列）同构；**非隐私域**（断言面为终态/事件/账本语义 · 非 PII 擦除/导出/checkpoint）→ 不换 privacy-int；**非模型质量域**（D3 · 零质量断言 · 禁 fake-model 冒充）→ 不换 model-op。

## 请审什么（mw-rag-route · 生成链路降级叙事 + invoke 双校验只读行使 · Ban fake-model 质量冒充）

1. **选刀裁决**：UC-016/029 FAULT（gap · 两矩阵一致 · Line Y 留后刀）是否成立；排除清单遵守；与 RAG 域在办（R4-PERF/R5-PERF/RAG-LOAD 落选理由）是否冲突。
2. **注入面只读行使**：F3 = scripted 返回 `ok:true` + schema 外形非法 JSON → `invoke` 双校验第一层拒绝 → **确定性拒绝收敛（attempts 有界 · 不无限重试）**；分类按 `invoke`/`failover-model` **既有语义只读行使**——裁决「只读行使」边界是否守住：**Ban 改分类器/双校验器产品码**、Ban 把 transient/deterministic 分类断言写成产品保证（若实际行为与 spec E3 分类不符 → EXIT1 诚实保留 + backlog，非借刀修）。
3. **降级叙事诚实**：E1/E2 终态语义（`generating→failed` + `*_unavailable` 终态事件 + 幂等退预留）与「无静默死胡同」产品条款（`quiz-consumer.ts:55-56`/`diagnosis-consumer.ts:54-55` 注释原文）的行使是否真；N2（无终态事件=EXIT1）是否足以反证死胡同；F4 重建映射（D1）是否被诚实表述为**映射非字面**。
4. **fake-model 边界**：`scriptedModelClient` 注入仅断言**结构性失败路径**，零模型质量/召回/安全断言（质量归 ai-eval · G7/禁 fake-model 冒充边界保持）；与既有 G-R2-5「fail-closed ≠ 路由已生效」同型的「**失败路径收据 ≠ 生成链路已闭环**」读法是否钉死。
5. **NEG 硬闸机检性**（G7）：N1 额度净 0/无双重退款/已结算不倒退（`reaper.proof` ⑥ 负向行使）· N2 终态事件逐 failed 必有 · N3 已 ready 不可倒退（CAS 负向行使）· N4 attempts 有界从 DB 读——是否机检可断言、缺一即合同不成立。
6. **PC 对照闸**：成功 scripted 模型 quiz+diagnosis 先跑全绿（镜像 `quiz.proof`/`diagnosis.proof` 成功面）为失败断言前置——对照缺失 = Ban 假绿是否成立。
7. **product diff 声明**：prove-only（新 proof + script/runner 注册 · 零产品码 diff 意向）；缺陷 → EXIT1 + backlog；**Ban 借刀改 `quiz-consumer`/`diagnosis-consumer`/`quiz-lifecycle`/`diagnosis-lifecycle`/`ai-runtime`**。
8. **老 prove / 老裁决关系**：`quiz:prove`/`diagnosis:prove`/`reaper:prove`/`full.e2e.ts` 零改动；G-R2-5/R4 既有裁决不动不洗；本刀收据不升 R4/R5 任何面；EXIT0 ≠ covered ≠ suite green ≠ 行升格；§1.0.1 `:121` / NHP 矩阵 `:82` 措辞不动 · coveredCount=8 冻结。
9. **隔离 / PERF-LOAD 边界**：isolated 真 PG（`run-e2e-isolated` 三层壳 + `assertIsolatedTestTarget` 先例）· `env -u MODEL_API_KEY` · 零 live；UC-016/029 §1.0.2 无分面行 → PERF/LOAD 显式 blind 保持 · Ban 借 FAULT 收据宣 PERF/LOAD/容量/SLO/HA；拟名 `uc016:nhp-fault:prove` / `prove:uc016-nhp-fault` / `uc-e2e-016-nhp-fault.proof.ts` / `GAP-UC016-FAULT-01` 无命名冲突（全仓 grep 零既有命中）。
10. docs-only 本 turn；PRE dual PASS ≠ coding ≠ prove ≠ nail；attempts 全记录 · Ban retry-to-green · EXIT1 不记 flake · alone ≠ dual。

---

*Stub · awaiting expert pre-exec dual · STOP*
