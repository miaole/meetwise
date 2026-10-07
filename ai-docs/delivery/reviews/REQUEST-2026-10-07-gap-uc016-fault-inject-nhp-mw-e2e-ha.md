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

---

## PRE-EXEC dual review — **mw-e2e-ha**（2026-10-07 · 独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-y2-e2e-ha` @ branch `rv/y2-e2e-ha` base `b2e0eae`=被审 REQUEST 本体 · docs gate only · 本审零 prove 零 coding 零 docker 零 .env 零 SSOT edit · append-only · Ban push）

**审域**：adversarial evidence-honesty · FAULT 焦点 · alone≠dual（mw-rag-route 并行审看不到也不代签）· 本 PASS ≠ 授权 coding/prove/nail/covered。

### 检查表（逐项亲证）

1. **REQUEST 定位/镜像/docs-only**：`git log --all --grep='NHP-016'` 双命中 `b2e0eae`（本地 `feat/mysql-schema-skeleton` 链 · parent=`08825639`）+ `bbdd9c4`（`line/y2-next-nhp` · parent=`14c14a31`=declared base）；四文件 blob 级双镜像全等亲算（slice `b0c13bd0` · harness `0488217d` · 本 stub `166b6867` · peer `0e741adf`）。被审提交 diff 恰 4 新增 md +253/−0 全在 `ai-docs/delivery`——**零产品码零 SSOT 零触碰禁碰清单文件**（docs-only 成立）。**祖先后备记录**：`git fetch origin` 成功（EXIT0），但 origin tip `14c14a31`（16:14 MOP-01 nail）**不含** REQUEST（16:28；`git branch -r --contains` 空）；本地/origin 自 `2fd78ea1` 分叉（本地多 PRIV-04/MOP-02/RAG-02-post-dual · origin 多 MOP-01 nail）→ 按 fallback 以本地链为准，worktree 钉 `b2e0eae`，erratum 交协调方记账（C-HA-7 · F-1）。
2. **选刀与排除清单**：queue `REMAINING-NORTH-STAR-QUEUE.md:28` item 12 逐字 ✓；NHP 矩阵 `non-happy-path-perf-load-case-matrix.md:82` 逐字 ✓；§1.0.1 `e2e-requirement-coverage-matrix.md:121` 逐字 ✓（两矩阵 FAULT=gap 一致 · 无跨矩阵仲裁需求）；Line Y `gap-uc017-load-sweep-nhp.md:28`「留后刀」逐字 ✓；`GAP-UC016`/`GAP-UC029` 全仓 grep 仅命中本刀自家两文件=零既有钉 ✓；`uc016`/`uc-e2e-016` 在 root+worker package.json 及 `run-e2e-isolated.mjs` 零命中=零命名冲突+prove 未接线（Ban prove 自洽）✓；排除行旁证抽验（uc018/uc025/uc028/uc017 等 runner 注册行 `run-e2e-isolated.mjs:141/:689/:1482`）实存 ✓。
3. **接线真实性（只读）**：`quiz-consumer.ts:13` `QuizConsumerDeps{pool;model:ModelClient;leaseOwner}` / `:24` `drainQuizJobOnce` / `:56` `quiz_unavailable` 终态事件（:55「北极星:无静默死胡同」注释） / `:58` `releaseConsumption` 逐行全中；`diagnosis-consumer.ts:13/:55/:57` 同构全中；`:54`/`diagnosis:53` CAS `status NOT IN ('ready')`（N3 锚）✓；`quiz-consumer.ts:71` reaper「非 ready 才退,不倒退已交付」自证 ✓；`quiz-lifecycle.ts:40-41`/`diagnosis-lifecycle.ts:46-47`「模型在注入边界外」✓。
4. **零 live 论证（结构性成立）**：`model-client.ts:137` `scriptedModelClient` 逐字 ✓（纯进程内 · attempt-aware `(attempt:number)=>ModelResult` · 未知 service 默认 `{ok:false,kind:'deterministic'}`）；注入缝=deps `model` 字段（:13）生产既有注入口，proof 自建 deps 即零 provider 构造；`quiz.proof`/`diagnosis.proof` 先例亲读（`reserveEntitlement`→`enqueueQuizJob`/`enqueueDiagnosisJob` 造数 + `okModel`/`failModel` scripted）✓；`env -u MODEL_API_KEY` + 双保险：即便误构 provider client，缺 key 时 `model-client.ts:364` 返 transient `known_not_executed` 不外呼 ✓；full.e2e.ts 旁证定性亲读（poll 接受任一终态 · `A(quizTerm!=='')` 不强迫 `*_unavailable` 分支）=「有终态无显式失败注入」gap 定性准确 ✓。
5. **F1–F6+N1–N4 机检性**：attempts 列实存（`0007_resume_quiz.sql:23`/`0008_resume_diagnosis.sql:24`）→ N4「从 DB 读」可行；`invoke.ts:154` 亲读「Billable external attempts are never automatically retried」→ F3/N4 有界有结构性基础；reaper attempts 上限闸实存（`quiz-jobs.ts:82`/`diagnosis-jobs.ts:80` `attempts >= $2` 终结分支）→ F5 requeue/终结二态边界真实；`sweepStuckQuizJobs`/`sweepStuckDiagnosisJobs` 导入实存 ✓；reaper.proof ②③⑥ 逐条实读与 harness 引用一致（⑥ already_confirmed→不发假终态/不重复退款）✓；N1 非空转：drain 路径 `releaseConsumption(...).catch(()=>{})` 吞错——若退预留失败账面即不净 0，N1 必红 ✓；N2 语义正确（死胡同反向行使）但键面与 N1 场景存在合同内张力 → **C-HA-1**（见下）；N3/N4 断言可机检 ✓；PC 对照闸防假绿 ✓；F6 收据契约 ✓。
6. **D1–D4 披露 vs 代码事实**：D1 事实基础亲证——spec `e2e-scenarios.md` UC-E2E-016 E1 字面「重试（failed→pending）」，而 `quiz.controller.ts`/`diagnosis.controller.ts` 仅 `@Post()/:id/begin/:id/abandon`+三 `@Get`（:17/:24/:31/:37/:42/:49）**无 failed→pending 重启口**；D2/D3/D4 边界措辞落实；Ban「宣称字面口已验」「冒充 AiGraphRun/AssessmentReport 字面表已验」两处落字 ✓。
7. **EXIT 契约诚实**：EXIT0 五不等（≠covered≠suite green≠行升格≠PERF/LOAD/SLO/HA≠HA）+ `:82`/`:121` 行措辞冻结 + coveredCount=8 + capacityRepresentative=false ✓；EXIT1 五触发 + attempts 全记录 + Ban retry-to-green + **EXIT1 不记 flake** + Ban 改断言迁就 ✓；Non-claims 节在位（not run/not covered/not live）✓。
8. **隔离壳与禁碰**：三层壳先例实存（root script→`run-e2e-isolated.mjs` raw 注册→worker `prove:*`，`:141` uc028 先例 + `assertIsolatedTestTarget` 在两老 proof 亲见）；receipt 双落点沿 UC-017/018「not evidence of record」措辞 ✓；禁碰清单（UC-018/052/025/004/011/014/026/002/001/028/017 行与文件、SSOT）在本 REQUEST diff 零命中 ✓；老 prove（quiz/diagnosis/reaper/full.e2e）零改动声明与本 diff 一致 ✓。
9. **Pins 对账**：stub/slice/harness 三处八字段逐一相等且与 SSOT 在案原值一致（matrix `:99`/`:100` nail 行 + backlog 行 verbatim：haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · PG-retained · public DELETE=**503**）✓ 零漂移。

### D1 映射裁决（本审主裁点）

**裁决：采纳（mapping ACCEPTABLE · 有 C-HA-4 三绑定）**。理由：(a) 事实基础亲证成立——字面 failed→pending 口产品不存在（控制器六端点亲列），按字面断言才是捏造，重建映射是唯一诚实可执行替身；(b) 等价性边界守住——F4 行使的是 spec **验收语义**（A1/A2 重试后可成功 + A3 额度不变）的可观察面，且附带「旧失败对象停 failed 不复活（终态稳定 · 二次 drain 不改写）」断言把映射差异（重建≠同实例复活）钉死不冒充；(c) 诚实结构四落字（harness §披露映射 D1 行 + slice One-line「（D1 映射披露）」+ stub 请审 5 + Ban「宣称字面口已验」）预先封死洗白通道；(d) 因 spec 验收判据可经重建路径完整行使（字面迁移面除外且已如实排除），**EXIT1 保留/re-scope 非必需**——采纳映射+Ban 冒充即正确姿势；Ban 改产品凑 spec 未被触碰（prove-only 零产品码 diff 意向 · 缺陷→EXIT1+backlog 另刀）。**drift 起点（越界即 POST dual 应拒）**：receipt/proof 的 F4 断言文本必须带 D1 映射标记、不得出现「failed→pending 已验」类措辞、旧对象终态稳定断言不得省略（C-HA-4）。

### Fail-trigger audit（本域六条）

伪造/虚构 EXIT 或收据 **0**；宣称 covered/翻 `:82`/`:121` 行/coveredCount≠8 **0**；live/Key/真模型冒充注入 **0**（scripted 缝+env -u+fail-closed 双保险亲证）；代签 peer mw-rag-route/自批 **0**（两 stub PENDING 原样 · 本审 append-only 不动 peer）；Ban 借刀改 consumer/lifecycle/ai-runtime/裸 INSERT **0**（本刀零产品 diff 意向）；retry-to-green/flake 洗绿安排 **0**（EXIT1 保留+attempts 全录+不记 flake 落字）→ **0/6 hit**。

### Blockers

**无（0 Blocker）**。非 Blocker 记录：**F-1** 链拓扑 erratum（不涉四文件内容）：declared base `14c14a31` 对 line/y2 镜像 parent 为真，但被审提交 `b2e0eae` 在本地 feat 链（parent=`08825639`），且 origin tip 审时不含 REQUEST（fetch 成功 · 本地/origin 自 `2fd78ea1` 分叉）——四 blob 双镜像全等+全部行号锚在 `b2e0eae` 树零位移亲证 → 内容审不受影响，按 fallback 本地链为准（C-HA-7 交协调方记账）。**F-2** nit：spec UC-E2E-016 E1 行尾「（D1）」系 spec 自身额度注记，与 harness D1 披露 id 同名异义——零冲突，无需动。

### Conditions（C-HA-1 为 EXEC/AUTHORIZE 前置硬条件 · 其余持续至 nail）

- **C-HA-1（前置 EXEC/AUTHORIZE 硬条件 · scoped micro-patch）**：harness 故障注入合同表 **N2 行+F5 行键面与 N1 行必经场景合同内互斥**——N1 强制行使「已结算（ready）对象晚到失败→不重复退、**不发假终态**」（reaper.proof ⑥ 语义），该路径产品行为即 job failed+对象 ready+**故意无事件**（`quiz-consumer.ts:79-83`/`diagnosis-consumer.ts:78-82` 亲读 · alreadySettled 跳过 appendEvent）；而 N2「逐 failed job 检查·任一 failed 无终态事件=EXIT1」与 F5「每个 failed job 恰一条终态事件」按字面在同一 run 内必对该路径误红——要么假 EXIT1、要么 exec 时静默豁免=断言漂移。**处方（二选一 · 恰限 harness N2 行+F5 行措辞对齐 · slice One-line 如需回声则同步 · Ban 越面）**：(a) 键面改「failed **且对象非 ready** 的注入面」计事件（already-settled 显式豁免并反向断言不发假终态，与 N1 同口径）；或 (b) 保留 job 键面+加显式豁免行（already-settled reaper 终结 job 不计入 N2/F5 计数，另以负向断言覆盖无事件+不倒退+不重复退）。双方 dual ack 后方可授权 exec（沿 C-HA-3/C-MOP-6 先例：scoped 一行对齐不重开 RE-PRE）。
- **C-HA-2**：Pins 八值原值持续至 nail；EXIT0≠covered≠suite green≠行升格≠PERF/LOAD/SLO/HA≠HA；`:82`/`:121` 行措辞不动；coveredCount=8 冻结；升格仅经 coordinator nail。
- **C-HA-3**：EXIT1 保留路径硬约束持续——attempts 全记录、Ban retry-to-green、EXIT1 不记 flake、Ban 改断言迁就、缺陷→backlog 修复另刀、Ban 借刀改 `quiz-consumer`/`diagnosis-consumer`/`quiz-lifecycle`/`diagnosis-lifecycle`/`ai-runtime`、Ban 裸 INSERT 绕产品路径、Ban 真 live 模型冒充注入。
- **C-HA-4**：D1 三绑定持续（见 D1 裁决 drift 起点）——F4 断言带映射标记/Ban 字面口已验措辞/旧对象终态稳定断言不省略；D2（产品真表真事件名）· D3（零质量断言 · 禁 fake-model 冒充）· D4（UC-029 0 题 BOUND 不碰）同绑。
- **C-HA-5**：零 live 三重缝持续——deps 注入 `scriptedModelClient`（`:13`/`:137`）+ run 时 `env -u MODEL_API_KEY` + 每 case script 行为逐条冻结入 receipt；isolated 真 PG + `assertIsolatedTestTarget` + 老 prove 四件零改动。
- **C-HA-6**：alone≠dual——本审不代签 mw-rag-route（并行审看不到）；POST dual 另派；nail 属协调方；Ban self-write 任何 PASS/Authorization。
- **C-HA-7**：链拓扑 erratum 由协调方记账（F-1 全文）；后续 exec/nail 的 base 重钉须以当次 origin tip 复核（pre-exec 前线上 tip 未前进复核义务沿 harness 自述）。

### 三行中文摘要

1. NHP-016-FAULT-01 REQUEST 文档门审查通过：选刀三锚（矩阵 `:82`/§1.0.1 `:121`/Line Y `:28`）逐字核实、接线真实（quiz/diagnosis consumer 逐行锚全中、控制器无 retry 口）、`scriptedModelClient` 零 live 缝结构性成立（deps 注入+`env -u`+缺 key fail-closed 双保险）、F1–F6+N1–N4 大体机检可断言、EXIT 契约与八 Pins 与 SSOT 原值零漂移、docs-only 恰 4 md 零产品码零 SSOT。
2. **D1 裁决=采纳**：字面 failed→pending 口经控制器亲证不存在，重建映射（新建→ready）是 spec 验收语义（A1/A2 可成功+A3 额度不变）的唯一诚实可执行替身，且「旧对象停 failed 不复活」断言钉住边界、四处落字封死冒充通道；drift 起点已钉（C-HA-4 三绑定，违者 POST dual 应拒）。
3. 唯一须修点=**C-HA-1（EXEC/AUTHORIZE 前置 scoped micro-patch）**：N2/F5「逐 failed job」键面与 N1 必经的已结算晚到失败场景（代码 ：79-83 故意无事件 · reaper.proof ⑥）合同内互斥，须按处方两选一做键面对齐并双方 dual ack，否则假 EXIT1 或 exec 时静默豁免=断言漂移；另 F-1 链拓扑 erratum（origin tip 不含 REQUEST · 双镜像 blob 全等 · 本地链为准）交协调方记账。0 Blocker · PASS≠授权 coding/prove/nail/covered。

alone ≠ dual —— 本审不代签 mw-rag-route；PASS ≠ 授权 coding/prove/nail/covered；Ban push。

Verdict: PASS
