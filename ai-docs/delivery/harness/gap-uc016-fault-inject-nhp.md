# Harness — **NHP-016-FAULT-01 · UC-016/029 诊断/押题显式失败注入**（Line Y2 · **`draft:awaiting_pre_exec_dual`** · EXIT0≠covered）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · stub · Ban self-approve · alone ≠ dual · **Ban coding · Ban prove · Ban push**）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`14c14a31`** / full `14c14a316477745d142bbd02ba383e477888adde`（`git fetch origin` 本 turn **两次成功**（开工 `2fd78ea1` · 写前 origin 前进一枚 MOP-01 nail → 已 `--ff-only` 到 `14c14a31` · 该 nail 仅触 `execution-master-checklist.md` + `gap-bug-backlog.md` · 本刀引证行号 post-ff 复核未位移）· pre-exec 前仍须复核线上 tip 未前进）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-y2`（branch `line/y2-next-nhp`）
**Knife**: **NHP-016-FAULT-01（Line Y2）· 诊断/押题显式失败注入（explicit failure injection at model seam → `*_unavailable` 终态 · 无死胡同）· gap→case/prove 显式化**
**Gap id**: **`GAP-UC016-FAULT-01`**（本刀具名认领 · 全仓 grep `GAP-UC016`/`GAP-UC029` 零既有钉 · 不发明 covered）
**Case id**: **`NHP-016-FAULT-01`**
**Row**: **`UC-E2E-016 / 029`** FAULT 分面（§1.0.1）· not UC-017-LOAD（Line Y 已钉）/ 015-FAULT / 031/032 / 033 / 040–043 / 027 / R4-PERF / R5-PERF / RAG-LOAD / UI-PAY / CLOUD-KILL / HA-RTO · **Ban** UC-E2E-018 / 052 / 025 / 004 / 011 / 014 / 026 / 002 / 001 / 028 / 017
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual · 非隐私域 · 不换 privacy-int · 见「专家对」节）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding · Ban live · Ban fake-green suite

## 选刀（Phase 2 item 12 · remaining NHP rows one-knife-one-row · K/R/Y 线标准）

队列 `REMAINING-NORTH-STAR-QUEUE.md` Phase 2 item 12「remaining NHP rows one-knife-one-row · highly parallel」→ 本回合 Line Y2 = 下一 NHP 行 REQUEST（docs-only）。选行标准（沿 Line K/R/Y 先例）：**需求源三件套齐 + 产品接线真实 + 无 Key 依赖**（Key-blocked 类留 Phase 1）。选 **NHP-016-FAULT-01**（Line Y `harness/gap-uc017-load-sweep-nhp.md:28` 对本行显式「留后刀」→ 本刀即该后刀）。

### 排除清单（硬禁选 · 已占用/FINAL）

**UC-018 / UC-052(050–052) / UC-025 / UC-004 / UC-011 / UC-014 / UC-026 / UC-002 / UC-001 / UC-028 / UC-017(LOAD 面)**（各有已钉证据或进行中线：018 ADV/BOUND/PERF/LOAD/FAULT 钉 · 052 deletion/checkpoint/pool-role 钉 · 025 NEG/FAULT/BOUND/ADV/FAULT-isolated 五面钉 · 004 FI-1/FI-3 钉 · 011 ADV main-mouth 钉 · 014/026 ADV 七类钉（Line K）· 002 ADV 钉（Line R）· 001 NEG/BOUND/ADV/FAULT 四面钉 · 028 persistTrace fail-open 钉（Line X）· 017 LOAD_w 具名真证据已落（Line Y · `pnpm uc017:nhp-load:prove` EXIT=0 · post-dual `adcbe17`/`f8b68a9` BOTH PASS））。

### 其余 gap|blind 行落选理由（诚实留痕）

| 候选行 | 当前旗 | 落选理由 |
|--------|--------|----------|
| NHP-015-FAULT-01 / LOAD-w-01 | blind→case-only | Batch3 两次显式 deferred（`harness/nhp-batch3-fault-bound.md`「**无既有 prove 锚**」）；OCR 管线注入面零既有锚、扫描件 reason 产品面缺 → 落地性低于 UC-016（后者有 full.e2e 终态旁证 + 既有 worker 证明族可沿） |
| NHP-031-ADV-01 | gap(e2e)/partial(eval) | 质量断言归 ai-eval · **禁 fake-model 冒充**；guardrail 接线证据弱 · G7/Key 邻域 |
| NHP-033-FAULT-01 | blind→case-only | A3 **live** worker 越权 job RLS 闭环 · W1≠闭环 —— live 面重且 privacy/authz 域（若后续选须换 privacy-int）；留后刀 |
| NHP-040-BOUND-01（040–043） | gap | 席位 CAS/批 partial_failed = 静态 G-GAP（接线未证）→ 先接线后 prove，非本刀 |
| NHP-027-NEG-01 | gap/blocked | 产品未接线（blocked · 申诉口不存在） |
| NHP-030-BOUND-01 | case-only | 已具名注册（MAIN 刀）非 gap\|blind 新认领；时钟漂移面留其 prove 刀 |
| NHP-R4-PERF-01 / NHP-R5-PERF-01 | blind / blind/green-risk | pgvector 机械绿禁令 · green-risk 标红（r5-mark-red）；RAG PERF 留 RAG 线 |
| NHP-RAG-LOAD-01 | blind | 检索并发 LOAD 重且兼 R4 LOAD 盲区，单刀吃不下；留后刀 |
| NHP-UI-PAY-NEG-01 | gap/out-of-scope | UI 域 + Chromium runner 前置（G7 prereq），另刀 |
| NHP-CLOUD-KILL-FAULT-01 / NHP-HA-FAILOVER-RTO-01 | gap/out-of-scope/blocked | 云授权 Phase 1/8 · Ban buy cloud · stub ≠ HA |
| NHP-LOAD-WORKER-SUITE | case-only/blind | 跨 UC 总册行，非单行一刀；由 UC 行逐个落地后汇总 |

### 选 NHP-016-FAULT-01 理由

| 依据 | 读法 |
|------|------|
| NHP 矩阵 `non-happy-path-perf-load-case-matrix.md:82` | 逐字：`NHP-016-FAULT-01 │ 016/029 │ FAULT │ api │ 诊断/押题显式失败注入 │ unavailable 终态；无死胡同 │ **gap**→**case-only** │ full.e2e 终态旁证` —— 具名 case、flag 含 **gap**、旁证非执行 → status=gap 合格 |
| coverage 矩阵 §1.0.1 `e2e-requirement-coverage-matrix.md:121` | 逐字：`UC-E2E-016 / 029 │ **gap** │ **gap** │ **partial**（0 题） │ **blind** │ 有终态无显式失败注入` —— 两矩阵对 FAULT=gap **一致**（无跨矩阵措辞差需仲裁）· 盲区原文「有终态无显式失败注入」= 本刀正中面 |
| 需求源 `ai-docs/requirements/use-cases/e2e-scenarios.md:163-181` | UC-E2E-016「诊断 / 押题生成失败（前两棒失败降级）【评审必补#3】」：E1 诊断失败 `generating→failed` + 降级重试 · E2 押题失败 `active→failed` · E3 押题 schema 失败 非法 JSON → 双校验第一层拒绝 → 重试分类（transient 重试 / 确定性拒绝不重试）；后置「失败对象停在 `failed`，可重试；**无额度变动**」；验收 A1/A2 降级+重试后可成功 · **A3 全程额度不变**；TC ×3 显式登记（`TC-E2E-016-diagnose-fail` graph 注入失败断言 failed+重试成功 · `TC-E2E-016-quiz-schema` graph 确定性拒绝不无限重试 · `TC-E2E-016-no-credit` integration 额度不变）—— **需求源三件套第三件齐** |
| Line Y deferral（`harness/gap-uc017-load-sweep-nhp.md:28`） | 逐字：`full.e2e 终态旁证存在，但显式失败注入属 model-op 邻域（生成链路），本刀选纯 DB/worker 零 Key 面；留后刀` —— 显式留给后刀，本刀接棒（D3 见下：注入不触真模型，model-op 邻域不构成本刀禁选理由） |
| 产品接线真实 | `apps/worker/src/quiz-consumer.ts:13` `QuizConsumerDeps { pool; model: ModelClient; leaseOwner }`（**模型即注入边界 · 生产依赖注入口已存在**）· `:24` `drainQuizJobOnce`（失败路径：markFailed CAS 含租约守卫 → resume_quiz 非 ready 置 failed → `:56` `quiz_unavailable` 终态事件（注释原文「北极星:无静默死胡同」）→ `:58` `releaseConsumption` 幂等退预留）· `apps/worker/src/diagnosis-consumer.ts:13/:55/:57` 同族 · `quiz-lifecycle.ts:40-41` / `diagnosis-lifecycle.ts:46-47`「模型在注入边界外」—— 非静态 G-GAP，消费循环真实可跑 |
| 无 Key 依赖 | 注入 = `scriptedModelClient`（`packages/ai-runtime/src/model-client.ts:137` · **既有生产工具函数**，`quiz.proof`/`diagnosis.proof` 已用）—— 抛错/畸形 JSON 均为脚本注入，**零 live 模型 · 零 MODEL_API_KEY**（run 时 `env -u MODEL_API_KEY`）；「有终态无显式失败注入」的 gap 恰因 full.e2e 需 live Key 才跑且不force 失败分支（`e2e/full.e2e.ts:246-254` 仅断言到终态，`A(quizTerm !== '')` 不强迫 `*_unavailable` 分支）—— 本刀以脚本注入 force 失败分支且零 Key |
| 既有 lifecycle 先例 | `apps/worker/test/quiz.proof.ts`（`prove:quiz` · 成功面 + 业务校验失败「空押题」）· `apps/worker/test/diagnosis.proof.ts`（`prove:diagnosis` · `fabricated_experience` 失败）· `apps/worker/test/reaper.proof.ts`（`prove:reaper` · ②requeue 不双增 ③poison-pill 终结+退款 ④押题线同构 ⑥已结算不重复退款）· `apps/worker/package.json:15-16` 注册先例 —— 同壳同仓同生产件先例完整可沿 |

**选择声明**：Line Y2 = **NHP-016-FAULT-01**（UC-E2E-016/029 FAULT 分面 · 诊断/押题显式失败注入）。既有 `quiz:prove`/`diagnosis:prove` 失败面为**业务校验失败**（空押题/虚构经历），reaper 为**进程崩溃 orphan 面**；**模型缝显式注入**（throw / 非法 JSON schema 失败）+ **E3 重试分类收敛** + **A3 全程额度审计** + **A1/A2 失败后重建到 ready** 作为具名 NHP case **未被任何既有 prove 具名行使**（`grep -c` 逐项见 REQUEST）。本刀**只做 FAULT 面**，NEG/BOUND/ADV/PERF/LOAD 列与 §1.1 行不动；UC-029 0 题 BOUND 面（partial）不碰（D4）。

## 本刀面（FAULT only · 显式边界）

| 今日 | 本 REQUEST | 授权后 |
|------|------------|--------|
| FAULT=gap/case-only（旁证 full.e2e 终态 · 显式注入零执行）；quiz:prove/diagnosis:prove 业务校验失败面、reaper 崩溃面为旁证族 | docs：具名 harness + PC/F1–F6 注入合同 + N1–N4 NEG 硬闸 + dual stubs | prove 接线（新 proof 文件 + `package.json` script 注册 + runner 注册 · **prove-only**）→ `pnpm uc016:nhp-fault:prove`（隔离 · Ban live）→ POST dual → coordinator nail |

**与既有刀的差异（诚实声明）**：`quiz:prove` / `diagnosis:prove` / `reaper:prove` / `full.e2e.ts` **零改动**（回归锚沿用 · Ban 静默改老 proof/断言文本）；本刀为**新 proof 文件 + script/runner 注册**，拟**零产品码改动**（`apps/*/src`/`packages/*/src` 零 diff 意向）。若注入实证产品缺陷（额度账破/死胡同/倒退/无限重试任一被打破）→ **EXIT1 诚实保留 + 缺陷登记 backlog**，修复属另刀（**Ban 借刀改 `quiz-consumer.ts`/`diagnosis-consumer.ts`/`ai-runtime`**）——与 Line X（WILL touch product）不同，本刀 prove-only。

## 披露映射（诚实 · D1–D4 · Ban 冒充字面）

| id | 披露 |
|----|------|
| **D1** | spec E1「降级 + 重试（**failed→pending**）」—— 产品**无** failed→pending 重启口（`quiz.controller.ts`/`diagnosis.controller.ts` 仅 `POST ''`/`begin`/`abandon`/`GET*`）；产品 retry 语义 = **重建新实例**（`POST /quiz` / `POST /diagnosis`）+ 终结前 reaper requeue（`reaper.proof` ②）。F4 按**重建映射**断言「失败→新建→ready（重试后可成功）」，**Ban 宣称字面 failed→pending 状态机口已验**（映射披露 · 同 Line R D1 先例） |
| **D2** | spec 状态名 `AssessmentReport(diagnose)` ≙ 产品 `resume_diagnosis`/`diagnosis_job`；`AiGraphRun(resume-quiz)` ≙ 产品 `resume_quiz`/`quiz_job`（spec 为需求语，产品表名映射披露）；断言键全用产品真表/真事件名，Ban 冒充「AiGraphRun 表已验」 |
| **D3** | Line Y :28 deferral 称本面「model-op 邻域（生成链路）」—— 本刀**零模型质量断言**（质量归 ai-eval · **禁 fake-model 冒充安全/质量闭环**）；`scriptedModelClient` 仅注入**结构性失败**（throw / schema 外形非法 JSON），不触 `invoke` 双校验器/`failover-model` 分类器产品码（只读行使其既有语义）；因此不构成 model-op 域侵入 |
| **D4** | UC-E2E-029 的 0 题/空字段 **BOUND 面**（§1.0.1 partial · 0 题）本刀不碰；本刀只引 UC-029 行作为 row id 的一半（016/029 合并行），注入面全部落 UC-016 E1–E3 |

## 故障注入合同（PC + F1–F6 + NEG 硬闸 N1–N4 · G7）

**注入形状（登记）**：isolated 真 PG（migrations 齐跑）· 真产品路径造数（`reserveEntitlement` → `enqueueQuizJob`/`enqueueDiagnosisJob` → 真消费循环 `quizDispatchTick`/`diagnosisDispatchTick` · 沿 `quiz.proof` 造数先例 · **Ban 裸 INSERT 绕过产品路径**）· 模型 = `scriptedModelClient` 脚本注入（**参数冻结入 receipt**：每 case 的 script 行为逐条列明）。收据 `.tmp/uc016-fault-receipts/` + tracked `ai-docs/delivery/receipts/uc016-fault/`（**implementer pre-commit runs · not evidence of record** · 沿 UC-017/018 先例措辞）。

| id | 列 | 注入 | 期望观察（结构） |
|----|----|------|------------------|
| **PC** | positive control | scripted 成功模型 quiz+diagnosis 各一（镜像 `quiz.proof`/`diagnosis.proof` 成功面） | 全绿（ready + 结算）→ 失败断言确由注入引起；**对照缺失 = Ban 假绿** |
| **F1** | **FAULT**（E2 主证 · quiz） | `resume-quiz.generate` 脚本抛错 | `quiz_job` failed（CAS 租约守卫）+ `resume_quiz` failed（**仅非 ready**）+ `quiz_unavailable` 终态事件（`quiz-consumer.ts:56`）+ `releaseConsumption` 恰一次 → `availableUnits` 净 0 |
| **F2** | **FAULT**（E1 主证 · diagnosis） | `resume-diagnosis.generate` 脚本抛错 | 同族：`diagnosis_job` failed + `resume_diagnosis` failed + `diagnosis_unavailable`（`diagnosis-consumer.ts:55`）+ 退预留 → 净 0 |
| **F3** | **FAULT**（E3 · schema） | scripted 返回 `ok:true` + **非法 JSON 外形**（schema 外） | `invoke` 双校验第一层拒绝 → **确定性拒绝收敛**（job failed · attempts 有界 · **不无限重试**）· 可解释 `last_error`；transient/deterministic 分类按 `invoke`/`failover-model` **既有语义只读行使**（Ban 改分类器 · 分类断言按实际行为落 receipt · 若确定性拒绝误入无限 requeue = EXIT1） |
| **F4** | **FAULT**（A1/A2 · 重试后可成功 · D1 映射） | F1/F2 失败后**重建**新 quiz/diagnosis（成功 scripted 模型） | 新实例 `ready`（重试后可成功）；旧失败对象**停在 failed 不复活**（终态稳定 · 二次 drain 不改写） |
| **F5** | **FAULT**（无悬挂消费） | 全注入面收尾审计 | 无 stuck `running` 残留（`sweepStuckQuizJobs`/`sweepStuckDiagnosisJobs` 后 requeue/终结二态与 `reaper.proof` ②③ 边界一致）· 二次 reap 幂等 0 增量 · 每个 failed 且对象**非 ready** 的注入面 job 恰一条 `*_unavailable` 终态事件（fail-closed 键面：alreadySettled 晚到失败对象已结算 ready、故意无终态事件系产品既有语义 → 不在逐 job 断言面内 · Ban 藉本键面把已 ready 倒退合法化——N3 仍守） |
| **F6** | **FAULT**（收据） | 全程记录 | attempts/EXIT/逐 case 断言计数/冻结参数落 receipt；**≠ 线上 SLO · ≠ 容量 · ≠ HA** |
| **N1** | **NEG**（G7 硬闸 · 钱 · spec A3） | 额度账全程审计 | **全程额度不变（净 0）**：reserve→failed→release 精确回补；**无双重退款**；已结算（ready）对象被注入晚到失败 → **不重复退、不发假终态**（`reaper.proof` ⑥ 语义负向行使）；违者 EXIT1 |
| **N2** | **NEG**（G7 硬闸 · 死胡同） | 逐 failed 且对象**非 ready** 的注入面 job 检查 | 任一 failed 且对象非 ready 无 `quiz_unavailable`/`diagnosis_unavailable` 终态事件 = **EXIT1**（产品「无静默死胡同」条款反向行使 · Ban 沉默失败 · fail-closed 键面：alreadySettled 晚到失败对象已结算 ready、故意无终态事件 → 不在本闸计数面，由 N1 负向断言「不重复退、不发假终态」与 N3 ready 不倒退兜底） |
| **N3** | **NEG**（G7 硬闸 · 倒退） | 已 ready 对照组 + 晚到失败注入 | 已 ready 押题/诊断**不得被失败路径倒退**（CAS `status NOT IN ('ready')` 负向行使 · `quiz-consumer.ts:71` 注释「非 ready 才退,不倒退已交付」自证条款）；倒退即 EXIT1 |
| **N4** | **NEG**（G7 硬闸 · 无限重试） | F3 收敛复核 | E3 确定性拒绝必须收敛（attempts 有界断言 · attempts 计数从 DB 读）；Ban 用超时/异常冒充分类；死循环/无界 requeue = EXIT1 |

**NEG 列合规**：N1 + N2 + N3 + N4 四行 NEG 硬闸（G7）——缺任一 = 合同不成立。

**老 prove 关系（诚实预告）**：`quiz:prove` / `diagnosis:prove` / `reaper:prove` / `full.e2e.ts` 保持原样**零改动**；本刀新 proof 可选跑其作回归锚，但**Ban 静默改老 proof / Ban 改其断言文本**；业务校验失败面/崩溃面绿 ≠ 模型缝显式注入收据（失败族不同层）。

## prove 方案（授权后 · Ban live）

- **拟 CMD**：`pnpm uc016:nhp-fault:prove`（壳：`scripts/run-e2e-isolated.mjs` → raw `pnpm -C apps/worker prove:uc016-nhp-fault` → `apps/worker/test/uc-e2e-016-nhp-fault.proof.ts`；沿 `uc028:nhp-fault`/`uc017:nhp-load` 三层壳 + `assertIsolatedTestTarget` 先例；script/runner 注册属 prove 接线，授权后落地）。
- **隔离**：isolated 真 PG（migrations 齐跑）· **零 live 模型**（`scriptedModelClient` 注入 + run 时 `env -u MODEL_API_KEY` · 不触发任何 provider 外呼）· **Ban live default**。
- **attempts 全记录**：每次运行 attempt 序号、EXIT、失败类逐条进 receipt；**Ban retry-to-green**；**EXIT1 不记 flake**；Ban 改断言迁就结果。
- **PERF/LOAD 适用性声明**：本行 = **FAULT 面（适用 · 本刀主证）**；UC-016/029 在 §1.0.2 **无分面行** → PERF_api/PERF_web/LOAD_worker = **显式 blind（未列册）保持不动**；**Ban 借 FAULT 收据宣 PERF/LOAD/生产容量/SLO/HA**。

## EXIT 契约

| EXIT | 语义 |
|------|------|
| **EXIT0** | PC+F1–F6+N1–N4 全绿（isolated 真 PG · scripted 注入零 live · attempts 全记录 · 收据落盘）= 具名 case `NHP-016-FAULT-01` 真证据 · **EXIT0 ≠ covered** · **EXIT0 ≠ e2e:isolated suite green** · **EXIT0 ≠ UC-016/029 行 covered/partial 升格**（升格仅经 coordinator nail 的 additive honesty）· §1.0.1 `:121` 行 / NHP 矩阵 `:82` 行措辞不动 · coveredCount=8 不变 · capacityRepresentative=false · ≠HA |
| **EXIT1** | 诚实保留路径：额度账破 / 死胡同（无终态事件）/ 已 ready 倒退 / E3 不收敛无限重试 / 分类断言不成立 / 对照不齐 / 造数不可信 → 记 attempt、保留 gap、缺陷登记 backlog、Ban retry-to-green、Ban flake 洗绿、Ban 改断言；attempts 全记录后交协调方另裁（修复=另刀 · Ban 借刀改 consumer/ai-runtime） |

## 专家对（mw-e2e-ha + mw-rag-route · 为何非 privacy-int / model-op）

- **mw-e2e-ha**：隔离 PG 证据层 + 注入 honesty 主场（沿 Line AI `uc001:nhp-fault`、Line X `uc028:nhp-fault`、Line AA/W `uc025` fault 先例）；钱账净 0/无双重退款/终态事件审计是其 NEG 硬闸主场。
- **mw-rag-route**：诊断/押题 = 生成链路降级叙事耦合面（invoke 双校验/failover 分类只读行使与其既有 G-R2-5/R4 honesty 裁决同域）；且为协调方本刀指定第二审域；既有裁决不动不洗。
- **非隐私域**：UC-016 面 = 生成失败降级 + 额度账（生成内容含 PII 但本刀断言面为终态/事件/账本语义，非 PII 擦除/导出/checkpoint）→ **不换 mw-privacy-int**（说明毕）。**非 model-op**：零模型质量断言（D3 · 禁 fake-model 冒充质量闭环）→ 不换 mw-model-op（说明毕）。

## 行语义（冻结）

- UC-E2E-016/029 §1.0.1 行（gap/gap/partial(0题)/blind）与 NHP 矩阵 `:82`（gap→case-only）措辞**不动**；升格仅经 prove+dual+coordinator nail；**Ban invent covered** · coveredCount=8。
- Ban 碰 UC-018 / 052 / 025 / 004 / 011 / 014 / 026 / 002 / 001 / 028 行与 UC-017-LOAD 面（Line Y 已钉）及各线在办文件；`GAP-UC016-FAULT-01` 为本刀新认领，非既有钉翻动。
- 既有 `apps/worker/test/quiz.proof.ts` / `diagnosis.proof.ts` / `reaper.proof.ts` / `e2e/full.e2e.ts` **零改动**。

## Ban 列表

- Ban coding（产品码）· Ban prove 执行 · Ban push · Ban live · Ban live default · Ban fake-green suite
- Ban covered · Ban SSOT 翻行 · Ban invent covered · Ban retry-to-green · Ban flake 记绿 · Ban 改断言迁就
- Ban self-approve · Ban self-nail · Ban force-push · Ban secrets / `.env*` · Ban Meridian · Ban HA cloud buy
- Ban selecting UC-018 / 052 / 025 / 004 / 011 / 014 / 026 / 002 / 001 / 028 · Ban 碰 UC-017-LOAD 面（Line Y）与他线在办文件
- Ban 借刀改 `quiz-consumer.ts`/`diagnosis-consumer.ts`/`quiz-lifecycle.ts`/`diagnosis-lifecycle.ts`/`ai-runtime`（缺陷 → EXIT1 + backlog，修复另刀）
- Ban 裸 INSERT 绕过产品路径造数 · Ban 真 live 模型冒充注入 · Ban 借 FAULT 收据宣 PERF/LOAD/容量/SLO/HA
- Ban fake-model 冒充模型质量/安全闭环（D3 · 质量归 ai-eval）· Ban 宣称字面 failed→pending 状态机口已验（D1）· Ban 冒充 AiGraphRun/AssessmentReport 字面表已验（D2）· Ban 碰 UC-029 0 题 BOUND 面（D4）

## Non-claims

Not a pass · not run · not covered · not live · not suite green · not PERF_api/PERF_web/LOAD_worker · not production capacity · not SLO · not HA · not model quality closure · alone ≠ dual · EXIT0 ≠ covered · 不宣称 FAULT 面已收据（此为 REQUEST，prove 未跑）· 不宣称 E1/E2/E3 已验（合同待授权后行使）
