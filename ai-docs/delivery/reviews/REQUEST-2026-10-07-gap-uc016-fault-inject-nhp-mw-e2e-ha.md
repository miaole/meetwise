# REQUEST — **NHP-016-FAULT-01 · UC-016/029 诊断/押题显式失败注入** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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

Line Y2 · 下一 NHP = **NHP-016-FAULT-01**（UC-E2E-016/029 FAULT 分面 · 诊断/押题显式失败注入 · gap→case/prove 显式化 · Line Y `harness/gap-uc017-load-sweep-nhp.md:28` 显式「留后刀」）。排除清单：**018/052/025/004/011/014/026/002/001/028 + UC-017-LOAD 面（Line Y 已钉）**。其余 gap|blind 行落选理由见 harness 表（015-FAULT 无 prove 锚 · 031 eval 域禁 fake-model · 033-FAULT live 重面 · 040–043 接线未证 · 027 blocked · 030-BOUND case-only 非新认领 · R4/R5-PERF green-risk · RAG-LOAD 重 · UI-PAY runner 前置 · CLOUD-KILL/HA-RTO blocked）。行引证：NHP 矩阵 `:82`（`gap`→case-only · 锚「full.e2e 终态旁证」）· §1.0.1 `:121`（`gap│gap│partial(0题)│blind`「有终态无显式失败注入」· 两矩阵 gap 一致）· 需求源 `e2e-scenarios.md:163-181`（E1/E2/E3 · A1/A2/A3 · TC ×3 显式登记）· seam `quiz-consumer.ts:13/:24/:56/:58` + `diagnosis-consumer.ts:13/:55/:57` + `model-client.ts:137` `scriptedModelClient`。零 Key 依赖（scripted 注入 + `env -u MODEL_API_KEY` · K/R/Y 线标准：三件套齐+接线真实+无 Key 优先）。

## 请审什么（mw-e2e-ha · 隔离证据层诚实 · Ban fake-green suite · Ban live）

1. **选刀**：UC-016/029 FAULT（gap · 两矩阵一致 · Line Y 显式留后刀）vs 015/031/033/040–043/027/030/R 系/UI-PAY/CLOUD/HA — 裁决是否成立；排除清单是否被遵守；是否与他线在办撞行（UC-017-LOAD 面 = Line Y 已钉 · 本刀不触）。
2. **注入合同**：真产品路径造数（`reserveEntitlement` → `enqueueQuizJob`/`enqueueDiagnosisJob` → 真消费循环 `quizDispatchTick`/`diagnosisDispatchTick` · **Ban 裸 INSERT 绕过产品路径**）下 **PC** 正对照（成功 scripted 模型先跑全绿 · 对照缺失=Ban 假绿）+ **F1** quiz 模型缝抛错（`quiz_job` failed CAS 租约守卫 + `resume_quiz` failed 仅非 ready + `quiz_unavailable` 事件 + `releaseConsumption` 恰一次 → 净 0）+ **F2** diagnosis 同族 + **F3** E3 非法 JSON → `invoke` 双校验第一层拒绝 → **确定性拒绝收敛**（attempts 有界 · 不无限重试 · 分类按既有语义只读行使）+ **F4** 失败后重建到 ready（D1 映射）+ **F5** 无 stuck running 残留 / reap 幂等 0 增量 / 每 failed 恰一终态事件 + **F6** 收据（≠SLO≠容量≠HA）是否机检可断言。
3. **NEG 硬闸**（G7）：**N1** spec A3 全程额度不变（reserve→failed→release 净 0 · 无双重退款 · 已结算对象晚到失败不重复退/不发假终态 = `reaper.proof` ⑥ 负向行使）· **N2** 任一 failed 无 `*_unavailable` 终态事件 = EXIT1（「无静默死胡同」产品条款反向行使 · Ban 沉默失败）· **N3** 已 ready 对照组不得被晚到失败倒退（CAS `status NOT IN ('ready')` 负向行使 · `quiz-consumer.ts:71` 自证条款）· **N4** E3 确定性拒绝收敛 attempts 有界（Ban 超时/异常冒充分类）。缺任一 = 合同不成立。
4. **零 Key / 零 live**：`scriptedModelClient`（`model-client.ts:137` 生产既有工具）注入 throw / 非法 JSON；run 时 `env -u MODEL_API_KEY`；零 provider 外呼；**Ban 真 live 模型冒充注入**；full.e2e 旁证需 live Key 且不 force 失败分支（`full.e2e.ts:246-254` 仅断言到终态）→ 本刀 force 失败分支且零 Key，恰补「显式失败注入」gap。
5. **披露映射 D1–D4**：D1 retry=重建（POST /quiz、POST /diagnosis 新实例）+ 终结前 reaper requeue，**非字面 failed→pending 状态机口**（controller 无该口）· Ban 宣称字面口已验；D2 `AssessmentReport/AiGraphRun` ≙ `resume_diagnosis/diagnosis_job`/`resume_quiz/quiz_job` 表名映射；D3 零模型质量断言（质量归 ai-eval · 禁 fake-model 冒充质量/安全闭环）；D4 UC-029 0 题 BOUND 面（partial）不碰。
6. **product diff 声明**：本刀拟 **prove-only**（新 proof 文件 `apps/worker/test/uc-e2e-016-nhp-fault.proof.ts` + `apps/worker/package.json` + root `package.json` script 注册 + `run-e2e-isolated.mjs` 注册 · 零 `apps/*/src`/`packages/*/src` diff 意向）；注入实证缺陷（账破/死胡同/倒退/不收敛）→ EXIT1 + backlog，修复另刀，**Ban 借刀改 `quiz-consumer`/`diagnosis-consumer`/`ai-runtime`**。coding 仅在 PRE dual PASS + 协调方授权后。
7. **老 prove 关系**：`quiz:prove` / `diagnosis:prove` / `reaper:prove` / `full.e2e.ts` 零改动；业务校验失败面（空押题/虚构经历）与崩溃面（reaper）≠ 模型缝显式注入收据（失败族不同层）；Ban 静默改老 proof/断言文本。
8. **EXIT0 ≠ covered**：EXIT0 = PC+F1–F6+N1–N4 全绿+收据 = 具名 case 证据 ≠ covered ≠ suite green ≠ 行升格（升格仅经 coordinator nail）≠ PERF/LOAD 面填补；§1.0.1 `:121` / NHP 矩阵 `:82` 措辞不动；coveredCount=8 冻结。**EXIT1 = 诚实保留**；attempts 全记录；Ban retry-to-green · Ban flake 记绿 · Ban 改断言迁就 · **EXIT1 不记 flake**。
9. **PERF/LOAD 适用性**：本行 = FAULT（适用 · 主证）；UC-016/029 在 §1.0.2 **无分面行** → PERF_api/PERF_web/LOAD_worker = 显式 blind（未列册）保持不动；Ban 借 FAULT 收据宣 PERF/LOAD/容量/SLO/HA。
10. docs-only 本 turn；PRE dual PASS ≠ coding ≠ prove ≠ nail；专家对 mw-e2e-ha + mw-rag-route（非隐私域不换 privacy-int · D3 非模型质量域不换 model-op）是否成立。

---

*Stub · awaiting expert pre-exec dual · STOP*
