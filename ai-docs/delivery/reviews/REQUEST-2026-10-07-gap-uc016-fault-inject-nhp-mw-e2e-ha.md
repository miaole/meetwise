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

---

## POST-PROVE dual review — **mw-e2e-ha**（2026-10-07 · 独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-y2p-e2e-ha` @ branch `rv/y2p-e2e-ha` · 本审=Line Y2 coding+prove 双审的 mw-e2e-ha 侧 · alone≠dual 不代签 mw-rag-route（并行审看不到）· append-only（PRE-EXEC stub 92 行 byte-intact · blob `8e26127e` 全等亲证）· Ban push）

**被审对象**：Y2 coding 链 `2051d12a`（新 proof `apps/worker/test/uc-e2e-016-nhp-fault.proof.ts` 337 行 + 三层壳注册）→ `20fe852d`（attempt-1 接线修复）→ `12a350f7`（receipts）· 本机 branch `line/y2-next-nhp` · base=`1b85b58a`（∈ origin HEAD 链亲证 · merge-base 亲算）· 链长恰 3 commit（`rev-list --count`=3 亲证）。

### F-P1 链拓扑 erratum（协调方简报与机器事实不符 · 非阻断）

协调方简报称「origin tip `972c6c2f` 已含 Y2 coding」——**机器复核为不实**：`git branch -r --contains` 对 `2051d12a`/`20fe852d`/`12a350f7` 全部为空；origin tip 树内无 `uc-e2e-016-nhp-fault.proof.ts`、root `package.json` 无 `uc016` 脚本（Y2 coding 链仅存于本机 `line/y2-next-nhp`）。origin **实际已含**的 Y2 关联物=PRE-EXEC 审镜像 `a0f2e3b2`（本审文件 blob `8e26127e` 与 `be05a3ae` 全等）+ micro-patch 镜像 `87c57517`（patch-id `e79a8734…` ≡ `95b1fd95` 亲算全等 · 双双 parent=`bab29111`）。**处置**：fresh re-run 按被审链本钉 coding tip `12a350f7`（树=base+恰申报 7 文件）；delta `1b85b58a..972c6c2f`（P4 隐私线）与 uc016 proof 语义零交集（receipt-sources 交集仅 `run-e2e-isolated.mjs` 一文件 · 两链 hunk 除 `:2277` 单行 migrate-list 追加外不同区 · root `package.json` 两链 hunk 异区 `:109` vs `:338`）→ 协调方后续镜像 origin 时须做一次 additive 文本合并（非本包缺陷）。与 PRE-EXEC F-1 同族（实现方 receipt 本就诚实申报「本机 line/y2-next-nhp · 禁 push」，不实点在简报侧）→ **非阻断 · 交协调方记账 + C-HA-7 续用**。

### 包完整性（机器机检）

- 恰申报文件：`git diff --name-status 1b85b58a..12a350f7` = 恰 7 文件——A proof（337 行）· M `apps/worker/package.json`（+1 `prove:uc016-nhp-fault`）· M root `package.json`（+2 `uc016:nhp-fault:prove(:raw)`）· M `scripts/run-e2e-isolated.mjs`（恰 4 处注册：receipt-sources :475-486 / allowlist :1557 / isolatedCommand :1585-1586 / migrate-with-recovery 单行表 :2295）· A 3 receipt docs。
- **零产品码**：变更清单逐行过筛 `apps/*/src`/`packages/*/src`/migrations → 0 hit；**零 SSOT**（backlog/matrix/checklist/queue 不在 diff）· UC-016/029 行措辞零触碰 · coveredCount=8 冻结（proof :28/:311/:331 + receipt :4/:65）。

### micro-patch `95b1fd95` 兑现（C-HA-1 裁决=FULFILLED）

双镜像 patch-id 全等亲算（`95b1fd95`≡origin `87c57517` = `e79a8734f486df2b8e1e831be6b817842b1aff73`）· 内容恰 harness N2/F5 两行键面对齐（+2/−2 · 1 文件）：键面=「failed **且对象非 ready** 的注入面 job 恰一条 `*_unavailable` 终态事件」，alreadySettled 显式豁免+负向兜底（N1 不重复退/不发假终态 + N3 ready 不倒退）+「Ban 藉本键面把已 ready 倒退合法化」落字——与 PRE-EXEC 处方 (a) 逐字吻合、恰限两行、无越面。proof 逐字兑现：`keyFace()` :105-109 双集合返回 · 键面内 :260-264 · 键面外 :265-268 · 头注 :9-13 原文引用。

### fresh re-run（C-DUAL-FROM-FRESH · 恰一次 · 禁重试遵守）

本审 worktree detach 至 `12a350f72032123fcd49afd67d50c2388c18f29f` → `pnpm install --frozen-lockfile` EXIT=0 → **恰好一次** `MW_GIT_SHA=12a350f72032123fcd49afd67d50c2388c18f29f env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm uc016:nhp-fault:prove` → **EXIT=0** · **45 PASS / 0 FAIL**（机器计数 · 分段 6/9/7/6/8/7/2 恰和 45）· fresh isolated PG boot→**migrations applied=140 skipped=0** · `[R5-MARKED-RED]` 隔离横幅在位 · 本地镜像 `pgvector/pgvector:pg16` Id `7b822b0aac60` ≡ receipt 申报 digest 逐字同（无 pull）· fresh 收据 `envModelApiKeyUnset=true`（两处）· overall=PASS · failedAsserts=0 · run 后 tracked 树零脏（receipts 落 `.tmp` 未跟踪）。**与实现方 #2 申报完全一致 → 零分歧**。

### 断言抽查（proof.ts file:line @`12a350f7`）

- **N1**（已结算晚到失败 · 不重复退/不发假终态）：:183（F1+F2 退款落账 · 非空转注记「drain release 吞错则本断言必红」）· :244-245（ASett `*_unavailable` 仍=0 假终态负向）· :246（余额不变）· :275-278（全程 avail===3.00 对账 + 台账 confirmed=6/released=3）。**键面外豁免全链负向**：:239-240（收割 happened requeued=0）· :241（job 终结 failed）· :242-243（对象仍 ready）· :265-268（failedReady 恰 2 且逐 job 0 事件）。
- **N2**（键面内逐 job 恰一事件）：:105-109 `keyFace` · :260-261（恰 3 且 stream 前缀钉 F1/F2/F3）· :262-264（逐 job `evCount===1` 任一缺失即红）。
- **N3**（六 ready 对照零倒退）：:269-271（PC/F4/ASET × quiz/diag 六对象全仍 ready）+ :242-243（ASett 即时）+ :216-217（旧失败对象停 failed 不复活）。
- **N4**（attempts 有界）：:181-182（F1/F2=1）· :201（F3 二次调度 attempts 仍=1 零重跑）· :202（上界=`MAX_QUIZ_JOB_ATTEMPTS` 产品常量）· :233-234（ASett 夹具 attempts=MAX 经 reap 收敛）。
- **D1 映射标记**：:214-215（F4 断言文本带「D1 映射标记…非字面 failed→pending 状态机口」）· :220/:306（mapping/disclosure）。**措辞裁决**：子串「字面口已验」仅出现于禁令式「**Ban 宣称**字面口已验 / Ban 宣称字面 failed→pending 已验」，从无肯定式宣称 → C-HA-4 三绑定（映射标记/禁字面口已验措辞/终态稳定断言 :216-218 未省略）**全部成立**。

### attempts #1→#2 裁决（本审独立裁定）

**裁=wiring 修复成立 · 非断言迁就 · 非 retry-to-green**。依据：(1) #1 EXIT1 失败点=夹具种子段 ref UPDATE（proof :143-144 前身）SQL 占位符（`$3,$4` + IN `$5..$9`）与参数数组 `[OWNER,resumeId,epoch,…ids]` 错位 → PG `could not determine data type of parameter $2`（$2 未引用）；失败发生于 seeding，**早于首条 `A()` 断言（:157）→「断言未行使」为真**。(2) `20fe852d` 恰 2 行替换、仅占位符重编号（`$3→$2/$4→$3/$5..→$4..`）对齐**既有**参数数组，参数数组与全部断言零改动（diff 机检）。(3) 修复方向=让夹具达成 harness 合同既定语义（对象须引用 resume+privacy_epoch 才能走真产品路径），不存在任何曾绿的断言可「迁就」；#1 EXIT1 已诚实入 receipt attempts 台账。**Ban retry-to-green 不适用于此类确定性夹具缺陷修复**（无绿可追 · 非 flake 重跑）。

### 条件裁决（C-HA-1~7 逐条）

| 条件 | 裁决 | 依据 |
|------|------|------|
| C-HA-1 micro-patch 键面 | **FULFILLED** | patch-id 全等 · 恰 2 行 · proof 逐字兑现（上两节） |
| C-HA-2 Pins 原值 | **HELD** | receipt :4 / proof :27-28,:311,:331 八值原值 · SSOT 零 diff · coveredCount=8 |
| C-HA-3 造数诚实 | **HELD** | 消费全经真产品 API（:151-156/:168-173/:190-192/:208-213/:224-229）· 夹具申报+先例锚（:125-137 · orphan :232-235=reaper.proof:35-40 同款） |
| C-HA-4 D1 三绑定 | **FULFILLED** | 映射标记 + 禁令措辞 + 终态稳定断言未省略（:214-218/:220/:306） |
| C-HA-5 零 live 三缝 | **HELD** | scriptedModelClient 全注入 · fresh run env -u 三键 · envModelApiKeyUnset=true · `model-client.ts:364` fail-closed 在位（未触发亦在位） |
| C-HA-6 prove 纪律 | **HELD** | attempts #1 EXIT1/#2 EXIT0 全录 · 本审 fresh 单次 EXIT0 45/0 · EXIT0≠covered≠翻行≠suite green≠PERF/LOAD/容量/SLO/HA |
| C-HA-7 base 重钉/erratum 记账 | **CARRIED+** | F-P1 新增（origin 不含 Y2 coding · 简报不实）交协调方记账+镜像；镜像落地前任何复跑须钉 coding tip |

### 非阻断观察

- **OB-1**（cosmetic · docs 侧可选修）：receipt 逐类表为叙事性归组、存在跨类重复归属（逐行加总≈47>45；「F3 8 PASS」vs 实际分段 7）——headline 45/0 为机器精确计数且本审 fresh 复验逐字一致，无诚实性问题。
- **OB-2**：`MW_GIT_SHA` 仅被 uc017 收据消费（`uc-e2e-017-nhp-load.proof.ts:142`）；uc016 侧为纯 provenance env，无害。

### Blockers

**无（0 Blocker）**。F-P1 链拓扑 erratum 非阻断（见专节 · 与 PRE-EXEC F-1 同族 · 内容审全链自洽）。

### Conditions（持续至协调方 nail）

- **C-PHA-1**：EXIT0 ≠ covered ≠ 行升格 ≠ suite green ≠ PERF/LOAD/容量/SLO/HA ≠ HA ≠ 模型质量闭环；UC-016/029 行措辞与 §1.0.1 :121 / 矩阵 :82 冻结；coveredCount=8 冻结；升格仅经 coordinator nail。
- **C-PHA-2**：alone≠dual——本审不代签 mw-rag-route（其 POST-PROVE 审并行另出）；nail 与 origin 镜像属协调方。
- **C-PHA-3**：协调方镜像 `line/y2-next-nhp` → origin 时按 F-P1 做 additive 合并（`run-e2e-isolated.mjs` :2277 单行表 + allowlist 相邻区）并记账 F-P1；镜像落地前复跑一律钉 coding tip `12a350f7`。
- **C-PHA-4**：OB-1 receipt 逐类表归组如后续修订限 docs 侧、禁触 proof 断言面。
- **C-HA-2~6 原值续用**（Pins/造数诚实/D1 绑定/零 live/prove 纪律）至 nail。

### 三行中文摘要

1. POST-PROVE dual（mw-e2e-ha 侧）通过：包完整性机检成立（恰 7 文件 · 零产品码 · 零 SSOT · 链长恰 3）· micro-patch `95b1fd95`≡`87c57517` patch-id 全等兑现且 proof `keyFace` 逐字落地 · **fresh re-run 恰一次 EXIT=0 · 45 PASS/0 FAIL · fresh PG migrations=140 · envModelApiKeyUnset=true**，与实现方 #2 零分歧。
2. N1-N4/D1 断言逐锚亲证成立（键面外豁免有全链负向断言 · 六 ready 对照 · attempts 有界 · F4 带映射标记且「字面口已验」仅存于 Ban 禁令式）；attempts #1→#2 裁=wiring 修复（种子期断言未行使 · 恰 2 行占位符重编号 · 非断言迁就 · 非 retry-to-green）。
3. 唯一新发现 **F-P1（非阻断 erratum）**：协调方简报「origin tip 972c6c2f 已含 Y2 coding」不实——coding 链仅在本机 `line/y2-next-nhp`（base `1b85b58a` ∈ origin · origin 已含 PRE-EXEC 镜像与 micro-patch 镜像），fresh re-run 按被审链本钉 `12a350f7`，镜像与记账交协调方（C-PHA-3）· OB-1 receipt 逐类表归组 cosmetic · 0 Blocker · EXIT0≠covered · alone≠dual 不代签 mw-rag-route。

alone ≠ dual —— 本审不代签 mw-rag-route；EXIT0 ≠ covered/nail/HA；PASS ≠ 授权 covered/行升格；Ban push。

Verdict: PASS
