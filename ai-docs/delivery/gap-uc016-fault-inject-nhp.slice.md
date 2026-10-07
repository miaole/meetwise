# Slice — **NHP-016-FAULT-01 · UC-016/029 诊断/押题显式失败注入**（Line Y2 · **`draft:awaiting_pre_exec_dual`** · EXIT0≠covered）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · stub · Ban coding · Ban prove · Ban push · alone ≠ dual）
**History**: docs REQUEST（本 commit）→ PRE dual（mw-e2e-ha + mw-rag-route）→ prove 接线+prove（授权后）→ POST dual → coordinator nail（后续，均未发生）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-07
**Base**: `origin/feat/mysql-schema-skeleton` · `14c14a316477745d142bbd02ba383e477888adde`（`git fetch origin` 本 turn 两次成功 · 开工 `2fd78ea1` → 写前 origin 前进一枚 MOP-01 nail `14c14a31` 已 `--ff-only` 跟进 · pre-exec 前复核 tip 未前进）
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban push · Ban self-approve

## One-line

选 **NHP-016-FAULT-01**（UC-E2E-016/029 · FAULT · api · **诊断/押题显式失败注入 → `*_unavailable` 终态 · 无死胡同**；**非** 015-FAULT / 031-ADV / 033-FAULT / 040–043-BOUND / 027 / 030-BOUND / R4-PERF / R5-PERF / RAG-LOAD / UI-PAY / CLOUD-KILL / HA-RTO / LOAD-WORKER-SUITE）。队列 `REMAINING-NORTH-STAR-QUEUE.md` Phase 2 item 12「remaining NHP rows one-knife-one-row」· NHP 矩阵 `:82` 具名行 `gap`→case-only（锚「full.e2e 终态旁证」）· §1.0.1 `:121` `gap│gap│partial(0题)│blind`「有终态无显式失败注入」（两矩阵 gap 一致）· 需求源 `e2e-scenarios.md:163-181` UC-E2E-016（E1/E2/E3 · A1/A2/A3 · TC-E2E-016-diagnose-fail/quiz-schema/no-credit ×3 显式登记）· Line Y `:28` 对本行显式「留后刀」· 产品接线真实：`quiz-consumer.ts:13/:24/:56/:58` + `diagnosis-consumer.ts:13/:55/:57`（失败=终态 + `*_unavailable` 终态事件「北极星:无静默死胡同」+ 幂等退预留）+ `model-client.ts:137` `scriptedModelClient`（生产注入缝已存在）。零 Key 依赖（scripted 注入 + `env -u MODEL_API_KEY` · 零 live 模型）。本刀 = **FAULT 面显式化**：**PC** 正对照 + **F1** quiz 模型缝抛错（failed+事件+退预留）+ **F2** diagnosis 同族 + **F3** E3 非法 JSON 确定性拒绝收敛（不无限重试）+ **F4** 失败后重建到 ready（D1 映射披露）+ **F5** 无悬挂消费/reap 幂等 + **F6** 收据 + **NEG 硬闸 N1 全程额度净 0/无双重退款 · N2 无终态事件=EXIT1 · N3 已 ready 不倒退 · N4 attempts 有界**（G7）。披露 D1（retry=重建非字面 failed→pending）· D2（产品表名映射）· D3（零模型质量断言 · 禁 fake-model 冒充）· D4（UC-029 0 题 BOUND 不碰）。prove-only（零产品码 diff 意向 · 缺陷→EXIT1+backlog · **Ban 借刀改 consumer/ai-runtime**）。**Ban live** · **Ban fake-green suite** · EXIT0 ≠ covered · coveredCount=8。Dual = mw-e2e-ha + mw-rag-route（非隐私域 · 非模型质量域 · 不换 privacy-int/model-op）。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-uc016-fault-inject-nhp.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-uc016-fault-inject-nhp-mw-e2e-ha.md`（PENDING stub） |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-07-gap-uc016-fault-inject-nhp-mw-rag-route.md`（PENDING stub） |
| Prove receipt（授权后） | `receipts/2026-10-XX-gap-uc016-fault-inject-nhp-prove.md`（未创建 · 授权后另片） |

## Choice

**NHP-016-FAULT-01** over 015-FAULT（Batch3 两次 deferred「无既有 prove 锚」· OCR 注入面零锚）/ 031-ADV（禁 fake-model · eval 域 · G7 邻域）/ 033-FAULT（live worker 重面 · privacy 域换审）/ 040–043-BOUND（席位 CAS 接线未证）/ 027（blocked 产品未接线）/ 030-BOUND（case-only 非新认领）/ R4-PERF·R5-PERF（green-risk 机械绿禁）/ RAG-LOAD（重 · 兼 R4 盲区）/ UI-PAY（out-of-scope · runner 前置）/ CLOUD-KILL·HA-RTO（blocked · Phase 1/8）。Documented in harness。Ban UC-018/052/025/004/011/014/026/002/001/028 与 UC-017-LOAD 面（Line Y 已钉）。

## EXIT 契约（一句话）

`pnpm uc016:nhp-fault:prove`（isolated 真 PG · `scriptedModelClient` 注入零 live 模型 · `env -u MODEL_API_KEY` · 真产品路径造数）**EXIT0 = PC+F1–F6+N1–N4 全绿+收据 = NHP-016-FAULT-01 具名真证据 ≠ covered ≠ suite green ≠ PERF/LOAD/容量/SLO/HA ≠ 模型质量闭环**，§1.0.1 `:121` / NHP 矩阵 `:82` 行措辞不动、coveredCount=8；**EXIT1 = 诚实保留**（额度账破/死胡同/已 ready 倒退/E3 不收敛/对照不齐 → attempts 全记录 · Ban retry-to-green · EXIT1 不记 flake · 盲区不翻行 · 缺陷登记 backlog 修复另刀 · **Ban 借刀改 `quiz-consumer`/`diagnosis-consumer`/`ai-runtime`**）。

## Ban

Ban coding（产品码）· Ban prove · Ban push · Ban live · Ban live default · Ban fake-green suite · Ban covered · Ban SSOT 翻行 · Ban self-approve · Ban self-nail · Ban Meridian · Ban HA cloud buy · Ban retry-to-green · Ban flake 记绿 · Ban invent covered · Ban 借刀改 `quiz-consumer`/`diagnosis-consumer`/`quiz-lifecycle`/`diagnosis-lifecycle`/`ai-runtime` · Ban 静默改老 `quiz:prove`/`diagnosis:prove`/`reaper:prove`/`full.e2e.ts` · Ban 裸 INSERT 绕过产品路径造数 · Ban 真 live 模型冒充注入 · Ban fake-model 冒充质量/安全闭环 · Ban 宣称字面 failed→pending 口已验（D1）· Ban 冒充 AiGraphRun/AssessmentReport 字面表已验（D2）· Ban 碰 UC-029 0 题 BOUND 面（D4）· Ban 借 FAULT 收据宣 PERF/LOAD/容量/SLO/HA · Ban 碰 018/052/025/004/011/014/026/002/001/028 行、UC-017-LOAD 面（Line Y）与他线在办文件。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503.

---

*Slice · NHP-016-FAULT-01 · draft:awaiting_pre_exec_dual · EXIT0≠covered · coveredCount=8 · STOP*
