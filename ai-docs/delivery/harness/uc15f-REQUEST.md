# NHP-015 FAULT REQUEST — 简历 OCR 管线故障注入臂 case 起草卷·UC-E2E-015 FAULT cell 残余面（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-10-26 起草落卷即停·三处钉：本 Status 行 + §8 + 卷尾注·pre-exec 双审两独立外席双 PASS 在前·alone≠dual·EXEC 收据/翻面权归协调方·⛔push）· 修法=恰 1 具名 case `NHP-015-FAULT-01`（visionOcr 缝故障注入→产品降级形状·case-matrix `:94` 锚「—」全族唯一零命令零收据 case·批 C 卷 `:21`/`:131`「OCR DI `OCR_VISION_CLIENT` 缝…留后刀」之 FAULT 半）。

**席位**：UC-015 FAULT 起草席（docs-only 起草·总盘 P2 小刀·协调方授权·与在飞各线互斥零重叠·主仓零触）。
**基线**：`origin/main` @ **`7ea825ff9`**（full `7ea825ff93f21a27e2153fa69ee2aef86762692b` · `git fetch origin` 本 turn 成功·分支 `line/uc15f-draft` 零独有 commit·worktree `meetwise-uc15f`（主仓仓根同级）·`HEAD is now at 7ea825ff9` 亲证=#174 perf2 并线点）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2436**（stdout「public text policy scanned 2436 managed worktree files」亲读）· cap=**2438**（`scripts/ai-docs/public-text-policy.mjs:240` `MAX_FILES = 2_438` 亲证）——**余量 1**·本卷新 .md +1=**2437≤2438 越限不触发 → 零步进零 sanction 行使·policy 两 .mjs 零触**（与 webhook-fault 卷 3-tracked 形区别如实承登：本卷起草 commit 恰 1 tracked）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 #12 `:28` one-knife-one-row）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§1.0.1 `:108` 表头/`:120` UC-015 行·§1.0.2 `:142`/`:151`·§1.0.3 `:160`/`:180`·§0.5 强制列）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.3 `:88-97` 015 五行·`:210` batch3 排除句）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-015 `:140-161`）→ 涉事机制源 `apps/api/src/modules/resume/resume.service.ts`（`uploadImageViaOcr :95-198`·**visionOcr 调用 `:127-131`**·**降级形状 `:132-137`**）→ `packages/ai-runtime/src/resume-ocr.ts`（`visionOcr :117-148`）→ `packages/ai-runtime/src/invoke.ts`（执行/三 error 出口 `:1022-1130`·doubleValidate `:1164-1169`）→ `packages/ai-runtime/src/model-client.ts`（`:723-743` 未配置未派发）→ `packages/ai-runtime/src/timeout.ts`（`:8-30`）→ `apps/api/src/modules/resume/ocr-model-client.ts`（`isOcrFeatureEnabled :27-29`）→ `apps/api/src/app.module.ts`（`:45` 组合根）→ 旁证先例（全只读零触）`apps/worker/test/ocr.proof.ts`（visionOcr 单元面）· `apps/api/test/uc-e2e-015-nhp-adv.proof.ts`（同口 ADV 30 断言）· `apps/api/test/neg-resume.proof.ts`（闸面 B1 `:48-52`）· `apps/api/test/sse-principal-slot.proof.ts`（最小模块先例 `:112-131`）· `apps/api/test/uc-e2e-017-orphan-http-sse.proof.ts`（boot+最小模块同进程先例 `:344-356`）· `apps/api/test/_neg-harness.ts`（`:52-57` OCR 硬钉·`:63/:29-37` 无 override 缝锚）→ 在飞姊妹先例卷 `harness/webhook-fault-REQUEST.md`（FAULT 族形制范本·closed）+ `harness/nhp-batch-c-REQUEST.md`（`:21`/`:131` 留后刀令亲点）。

---

## 认领核对（fresh 行号亲点 @`7ea825ff9`·逐 cell 亲读·零重叠核对）

| 行号（tip 亲点） | 行原文关键值（逐字） | 现列值 | 本刀认领 |
|---|---|---|---|
| 矩阵 §1.0.1 **`:120`** | `UC-E2E-015 ｜ partial ｜ partial ｜ partial（0字节/超大）｜ blind / case-only（NHP-015-ADV-01 真证据已落…）｜ F1–F5 ≠ 负载；扫描件 reason 缺` | **NEG=partial · FAULT=partial · BOUND=partial（0字节/超大）· ADV=blind/case-only**（§1.0.1 表头 `:108` 四列序亲读） | **FAULT cell 残余亚层**（visionOcr 缝故障注入面·具名 case 1·**格值 partial 保持零翻**·仅随 EXEC 收据 additive 注记·EXIT0=case≠covered）——partial 系 `:95` 卷头令「继承 §1.1/§1.2 已登记的负路径/失败族 prove，不是新发明的 covered」之继承格值·Ban 升 covered |
| 矩阵 §1.0.3 **`:180`** | `UC-E2E-015 ｜ 简历摄取失败族 ｜ full.e2e.ts OCR 成功+duplicate 409（成功面）；uc015:ingest-failures:prove（F1–F5…）；neg:resume / ocr:prove 旁证 ｜ partial ｜ …扫描件 reason/UI + Resume failed 枚举全铺仍缺…` | 工具列**无 OCR 故障注入命令**（全表亲读·`uc015:nhp-fault` 零命中） | 工具列 additive 注记随 EXEC 收据（`uc015:nhp-fault:prove` 登记·格值 partial 保留） |
| case-matrix §1.3 **`:94`** | `NHP-015-FAULT-01 ｜ 015 ｜ FAULT ｜ worker ｜ OCR 管线宕 ｜ 可解释失败；无悬挂消费 ｜ blind→case-only ｜ —` | **锚「—」**·旗 blind→case-only 措辞 | **§1.3 一行 additive 注记随 EXEC**（锚「—」→命令+收据随收据 additive·旗措辞零动）；**layer 列值差如实承登**：fresh 产品面亲读=OCR 管线**同步运行于 API 请求路径内**（`resume.service.ts:95-198`·visionOcr `:127` 同步 await·`grep` worker 源零 OCR 消费路径亲证·`apps/worker/test/ocr.proof.ts` 系 visionOcr 单元直调证明非 worker 管线）——layer=worker 系注册期读法·**Ban 就地改格值**（翻面权归协调方·EXEC 注记如实携带值差） |
| case-matrix **`:210`** | `…不含 LOAD / PERF-CLOUD / HA / UI-pay / cloud-kill / wrong_track ADV covered / 015-FAULT runnable（无 prove 锚）…` | batch3 排除面亲点 | 本刀即补该 prove 锚（EXEC 期·锚随收据 additive） |
| 批 C 卷 **`:21`/`:131`** | `NHP-015-FAULT-01 / NHP-015-LOAD-w-01 ｜ 已注册零执行收据（锚 —）｜ 有缝（OCR DI 缝/限流缝）但同 UC-015 行多面 → 本批不取（防多面同刀 wash）· 留后刀`（`:131` 亲点 `OCR_DI OCR_VISION_CLIENT 缝`） | 留后刀令在卷 | **本刀=该留后刀之 FAULT 半**（OCR DI 缝）；LOAD-w 半已红停归中大工程排期（case-matrix `:95`·总盘 R37 亲读）·本刀零触 |
| **派单令值差承登** | 派单令「锚「—」全族唯一零命令零收据 case」 | fresh 亲证**成立零值差**：`git grep 'uc015:nhp-fault'/'uc-e2e-015-nhp-fault'` 对 origin/main **0 命中**·`:94` 锚列=「—」逐字·`:210` 排除句亲点 | 如实登记零值差 |

**与已钉/在飞面零重复申明（逐臂对码·每条亲读非推定）**：

- **已覆盖（本刀零申明）**：
  1. **NHP-015-NEG-01（case-matrix `:92`·F1–F5）**：加密/0字节/超大413/畸形/415——输入形状负路径·文本/文件层·零 vision 触点（`uc-e2e-015-resume-ingest-failures.proof.ts:128` 自注「still needs e2e:isolated for OCR success+409」）——本刀零臂落入；
  2. **NHP-015-BOUND-01（`:93`）**：0字节/超大入口拒——边界面·零 vision 触点；
  3. **NHP-015-ADV-01（`:96`·`uc-e2e-015-nhp-adv.proof.ts` 30 断言亲读）**：magic_mismatch fail-closed（`:66-69` 先于解析）/429（`:38-41`）/503（`:50-52`）/NUL——**全臂止于 visionOcr 调用之前**·零臂触 OCR 失败路径（proof 头注 `:7-10` scope 亲读）；
  4. **NHP-015-LOAD-w-01（`:95`）**：红停归排期（worker 吞吐/积压刚性面·需中大工程环境）——**两形状互不替代**（`Ban` 借本刀 F 臂冒充负载收据·`Ban` 借其排期状态稀释本刀面）；
  5. **NHP-015-PERF-api-01（`:97`）**：文本链嘴延迟（resume→quiz→begin）——延迟形状·零 vision 故障面；
  6. **worker `ocr.proof.ts`**：visionOcr **单元级直调**（成功 confirmed/幂等/下游门/redactOutput/失败 released——失败臂=手搓 `releaseConsumption` 非服务层自动释放·零 HTTP 口·零 422 形状·零 throw/超时/空三形）——异层异管道·互不替代互不借用；
  7. **`neg-resume.proof.ts:48-52` B1**：`OCR_ENABLED=0` 闸面 422 `image_ocr_unavailable`（harness 硬钉形）——闸形状非 visionOcr 失败降级·重铺 wash 零申明；
  8. **`full.e2e.ts` OCR 成功+duplicate 409（矩阵 `:180`）**：live-key 成功面（无 Key blocked）——本刀 PC 臂仅证承载活性·`Ban` 借 PC 宣成功面新证据；
  9. **web 侧 `uc-e2e-003-nhp-neg.proof.ts:106`/`web-logic.proof.ts:747-751`**：`ocr_failed` 前端文案枚举/伪造响应拒收面——异层（前端信封面 vs API 产品口行为面）·零借用。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`7ea825ff9`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **40 树**实测——`meetwise-uc15f` 恰 1 命中=本席（`line/uc15f-draft` 唯一）；`harness/` 落卷前 `uc15f` **零命中** → 落卷后唯一同名卷=本卷。**零碰撞**：`git grep 'uc015:nhp-fault'/'uc-e2e-015-nhp-fault'` 对 origin/main 亲跑 **0 命中**；`NHP-015-FAULT` 活面命中=case-matrix `:94` 行+批 C 卷+gap 卷+历史 receipts archive（零活 case 卷）。
- **主仓零触**（本刀全部操作在 worktree `meetwise-uc15f`）。
- **在飞交叠**：本树=本 turn 新建唯一支（`git branch --list 'line/uc15f*'` 恰 1）·起草 commit 触面=**恰 1 tracked**（本卷 .md）——对零在飞分支构成同文件并发；EXEC 期 matrix `:120`/`:180` 与 case-matrix `:94` 邻区 additive 直并规则（§4）。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·8 hex·行数 wc -l）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `apps/api/src/modules/resume/resume.service.ts` | `952482e5`（327） | **`:26` `OCR_VISION_CLIENT` DI token·`:35` ctor `@Inject` 注入·`:96` `isOcrFeatureEnabled()` 闸·`:97-98` imgHash/ocrKey 幂等锚·`:104-124` consent→reserve 短事务·`:127-131` visionOcr seam 调用本体·`:132-137` 降级形状本体（release `:134`+deleteArtifact `:135`+422 `ocr_failed` `:137`）·`:142-148` binding 缺失 422·`:152-159` binding 无效退费·`:160-166` `ocr_no_content` 退费·`:197` 成功返回形** |
| `packages/ai-runtime/src/resume-ocr.ts` | `b2c51425`（148） | **`:117-148` `visionOcr`**（`:122-130` fail-closed 前哨·`:132` promptedModel·`:133-145` invoke 调用·**:138 `businessValidate` ≥ `MIN_OCR_CHARS`**·`:25` `MIN_OCR_CHARS=10`·`:146` `'error' in r → {ok:false,reason}`） |
| `packages/ai-runtime/src/invoke.ts` | `f6102433`（1250） | **`:1022-1024` 执行包裹（throw→catch→`transient/unknown`）·`:1029-1044` knownNotExecuted 臂（`:1044` `provider_rejected`）·`:1046-1114` known_executed 臂（`:1114` errorCode 返回）·`:1116-1122` unknownReason（timeout→`model_execution_timeout` `:1120` 入账）·`:1130` 恒返 `external_outcome_unknown`·`:1164-1169` doubleValidate（`business:` 前缀 error/errorCode 分离）·`:1199` persistValidatedOutput 仅 validated.ok·`:1241-1243` business 臂返回** |
| `packages/ai-runtime/src/model-client.ts` | `f9fd3105`（1233） | `:655-674` openAICompatibleClient（vision→`resolveVisionEndpointConfig` `:663`）· **`:731` `!baseUrl || !apiKey → {transient, known_not_executed}`（未配置→未派发·零外呼）** |
| `packages/ai-runtime/src/timeout.ts` | `a5a4e46d`（237） | `:8-14` `withTimeout`（到点 onTimeout+reject）·`:23-30` `withAbortTimeout`（abort+onTimeout） |
| `packages/ai-runtime/src/vision-endpoint-config.ts` | `7fa73f4d`（77） | `:50-68` resolve（`:55` assert 收进 resolve·`:74-77` Key 未挂载跳过=fail-open 组合可启动） |
| `apps/api/src/modules/resume/ocr-model-client.ts` | `9f1dbc7e`（54） | **`:27-29` `isOcrFeatureEnabled`（`OCR_ENABLED=1 ∧ OCR_PREVIEW=1 ∧ 非生产锁`·call-time 读 process.env）**·`:31-54` createOcrVisionClient |
| `apps/api/src/app.module.ts` | `309734ed`（48） | `:45` 组合根 `{ provide: OCR_VISION_CLIENT, useFactory: createOcrVisionClient }` |
| `apps/api/src/platform/principal.guard.ts` | （旁证） | Bearer 验签+`AUTH_DEV_HEADER=1` x-user-id 回退（最小模块真守卫承载） |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `ae75e564`（522） | §1.0.1 `:108`/`:120`·§1.0.2 `:142`/`:151`·§1.0.3 `:160`/`:180` |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `606f2195`（215） | §1.3 `:88`/`:92-97`（**`:94` FAULT 行**）·`:209-210` batch3 排除句 |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648） | UC-015 `:140-161`（异常流 `:146-151`·验收 `:155` **A3 全程无扣费**·TC `:159-161`） |
| 旁证（零触只读） | `apps/worker/test/ocr.proof.ts`=`c772280f`（106·单元失败臂 `:86-99`）·`apps/api/test/uc-e2e-015-nhp-adv.proof.ts`=`485cc45f`（291·R6 `:123-127`·进程窗 `:48-50`）·`apps/api/test/sse-principal-slot.proof.ts`=`692c4d01`（204·最小模块 `:112-131`）·`apps/api/test/uc-e2e-017-orphan-http-sse.proof.ts`=`0fb8f654`（438·boot+最小模块同进程 `:344-356`）·`apps/api/test/_neg-harness.ts`=`9768b323`（330·**`:52-57` OCR_ENABLED='0' 硬钉**·`:63/:29-37` 无 override 缝三锚）·`scripts/ai-docs/public-text-policy.mjs`=`60de4976`（538·`:240` cap） | 零重叠对码基面 |

### 0.2 码面锚（注入缝 · 机制推定逐条 file:line · symbol 级位移按 symbol 重钉）

**Case · `NHP-015-FAULT-01`（case-matrix `:94` · visionOcr seam 注入失败→产品降级形状）**

| 注入形 | 传播链（逐条 file:line 亲读） | 产品降级形状推定（期望值） |
|---|---|---|
| **F1 throw 形**（scripted 客户端 throw） | invoke `:1024` catch → `{transient, unknown}` → `:1116`（未超时）→ `:1130` return `external_outcome_unknown` → resume-ocr `:146` → resume.service `:132` `ocr.ok===false` | **HTTP 422 `{error:'ocr_failed', reason:'external_outcome_unknown', hint}`**（`:137`）+ `releaseConsumption`（`:134`）+ `deleteResumeOcrArtifact`（`:135`）+ resume 表零新行 + `ai_model_invocation` 终态 `unknown`/error=`external_outcome_unknown`（`:1120` → `model-invocation.ts:199-204` `ai_model_terminalize_scoped`） |
| **F2 超时形**（scripted 挂起+`MODEL_EXECUTION_TIMEOUT_MS=1000` 进程窗·下界 `invoke.ts:376` bounded 1_000） | `withAbortTimeout` timeout.ts `:8-14` 到点 reject+`:23-30` abort → onTimeout 置 `executionTimedOut` → invoke `:1024` catch → `:1116` `unknownReason='model_execution_timeout'` → `:1120` 入账 → `:1130` **恒返 `external_outcome_unknown`** | HTTP 422 同 F1 码面（**`:1130` 恒返·HTTP 面两形同码=推定如实承登**）+ **DB 账本 reason 级可分**（`ai_model_invocation` unknown/error=`model_execution_timeout`）+ release/工件零行/resume 零行同 F1 |
| **F3 空转写形**（scripted 返回 `{ok:true, raw:{text:'   '}}`·<`MIN_OCR_CHARS=10`） | resume-ocr `:138` businessValidate `'ocr_text_too_short'` → invoke `:1164-1169`（error=`business:ocr_text_too_short`·errorCode=`business_validation_failed`）→ `:1199` persistValidatedOutput **跳过**（工件零写入）→ `:1241-1243` return `business:ocr_text_too_short` → resume-ocr `:146` → resume.service `:132` | **HTTP 422 `{error:'ocr_failed', reason:'business:ocr_text_too_short', hint}`** + release（`:134`）+ `resume_ocr_artifact` 零行（写入从未发生·`:135` 删除幂等）+ resume 零行 + invocation completed error=`business_validation_failed` |
| （对照）**PC 管道活性**（scripted 成功 ≥10 字含 Go/Redis 事实） | resume.service `:127-131` 全链 → `:160` facts>0 → `:171-196` 事务 confirmed | 200 `{status:'ingested', format:'image', chars, ocr:true}`（`:197`）+ consumption confirmed 恰 1 + 成功后工件已删（`:194`）——non-claim 仅证承载 |
| **降级形状事实（派单令一问亲答）** | 产品**有** OCR 失败路径且**有真降级**：visionOcr 返回 typed 结果（`{ok:false,reason}`）→ 服务层**退费+清工件+422 可解释信封**——非裸 500、非 queued、非 fallback 文本链（无编造转写·`ocr-model-client.ts:12-14`「Missing Key / transport / schema / empty transcript stay fail-closed — callers must not invent OCR text」亲读）；扫描 PDF 文本层空→`extracted_too_short` 400（`:79-80`）；闸未开→422 `image_ocr_unavailable`（`:96`） | 需求源对码：`e2e-scenarios.md:155` A3「全程无任何扣费记录」+ case-matrix `:94`「可解释失败；无悬挂消费」——推定形=产品自钉非 invent |
| **seam 可达性判定（派单令三问亲答）** | **产品自带注入口·零产品码改动即达**：`OCR_VISION_CLIENT` Symbol DI token（`resume.service.ts:26`）+ ctor `@Inject`（`:35`）+ 组合根 useFactory（`app.module.ts:45`）——测试经最小模块 `{provide: OCR_VISION_CLIENT, useValue: scripted}` compile 期覆盖（先例 `sse-principal-slot.proof.ts:112-131`·`uc-e2e-017-orphan-http-sse.proof.ts:344-356` boot+最小模块同进程）·**零 module mocking 需求**；`scriptedModelClient` 公开测试缝在树（`@meetwise/ai-runtime` 导出·worker ocr.proof `:27-28` 消费先例）；env 闸=进程窗后置（boot 返回后置 `OCR_ENABLED=1+OCR_PREVIEW=1`·`:96` call-time 读·ADV `RESUME_PARSE_MAX=1` 进程窗先例 `:48-50`·neg-resume `:48` harness 钉 0 先例·PERF2 卷 `:152` `OCR_ENABLED=0` 双进程 env 先例） | **红停未触发**（seam 可达·零产品码改动·零真实外呼：scripted 注入零出站+`model-client.ts:731` 未配置即未派发承登） |

**旁注（P3 级观察·零触如实登记）**：`_neg-harness.ts:53-54` 注释「OCR lacks a typed MODEL-OP-01 binding」系陈旧读法——`resume.ocr.v1` 冻结 binding 在树（`resume-ocr.ts:9/:26`·`MODEL_OPERATION_REGISTRY` wired）——非本刀面·Ban 借机修。

### 0.3 认领 cell 登记（行号+case 名+缺列·亲读逐字）

| 行号 | 用例名 | 现列值（亲读） | 本刀补 |
|---|---|---|---|
| **矩阵 §1.0.1 `:120`** | UC-E2E-015（简历摄取失败族） | NEG=partial · **FAULT=partial** · BOUND=partial（0字节/超大）· ADV=blind/case-only | **FAULT cell 残余亚层**（具名 case·格值 partial 零翻·additive 注记随 EXEC 收据·EXIT0=case≠covered）；NEG/BOUND 零触·ADV 已钉批 C·PERF/LOAD `:151` 留各自裁量 |
| **矩阵 §1.0.3 `:180`** | UC-E2E-015 工具行 | 成功面+F1–F5+旁证在列·**零故障注入命令** | EXEC additive（`uc015:nhp-fault:prove` 登记） |
| **case-matrix `:94`** | `NHP-015-FAULT-01` | 旗 blind→case-only·**锚「—」**·layer=worker | EXEC additive 注记+锚随收据（gap→case-only 已在旗措辞·零翻）；layer 值差如实携带（§0.2） |

---

## §1 修法（一 cell 一 case · 零产品码触 · 零 invent covered · 零 live key · 零真实外呼）

**修法形状**（沿 `uc015:nhp-adv:prove` 及 webhook-fault `uc014:nhp-fault` 族先例）：新 proof `apps/api/test/uc-e2e-015-nhp-fault.proof.ts` + root `package.json` 双行（`uc015:nhp-fault:prove`/`:raw`）+ `apps/api/package.json` script 一行 + runner 注册位（`scripts/run-e2e-isolated.mjs` 五位全登记：SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单/resource-caps 条件——位5 resource-caps 非 PERF 不适用承登）+ egress 环境引用登记（additive·**零新增条目预期**·proof 文件零环境变量词面目标）· **prove-only · `apps/*/src`/`packages/*/src` 零 diff 意向**。行/列状态一字不动：EXIT0=case≠covered·coveredCount=8 不变。

### Case · `NHP-015-FAULT-01`（case-matrix `:94` · `apps/api/test/uc-e2e-015-nhp-fault.proof.ts`）

- **需求源**：`e2e-scenarios.md:146-151`（E1/E2 可重传降级·不计费）+ `:155`（A3 全程无扣费）+ case-matrix `:94`（「可解释失败；无悬挂消费」）——本 case=**visionOcr 缝故障注入证据层**（产品降级形状确定性），非输入形状负路径重铺非负载延迟。
- **承载（双层·如实承登）**：`boot()`（`_neg-harness`）供隔离池+迁移链+AUTH env+**consent 产品路径种子**（`h.post('/privacy/consent')`·ADV `:103-104` 先例）——**boot() 硬钉 `OCR_ENABLED='0'`（`:52-57` Object.assign 无条件覆写）→ boot HTTP 层不可承载 OCR 臂**（闸 `:96` 先应 422 `image_ocr_unavailable`=neg-resume B1 已钉面）——**共享 harness 面零触**（改 `_neg-harness` 系越界·webhook-fault/uc017 rev 先例）→ OCR 臂全走**最小模块同进程承载**（`sse-principal-slot.proof.ts:112-131`+`uc-e2e-017-orphan-http-sse.proof.ts:344-356` 先例形·boot() 无 override 缝三锚 `_neg-harness.ts:63/:29-37`）：`@Module{ controllers:[ResumeController], providers:[PrincipalGuard, DbService(真隔离池 wrapper), RateLimitService(Map 模式·`new RateLimitService()` 无 DbService 先例), ResumeService(useFactory), **{ provide: OCR_VISION_CLIENT, useValue: scripted }**] }` + `NestFactory.create`+`AllExceptionsFilter`+`listen(0,'127.0.0.1')`；**env 窗后置**（boot 返回后进程窗 `OCR_ENABLED=1`+`OCR_PREVIEW=1`——`:96` call-time 读·窗值披露：产品组合根不受窗影响（最小模块不触组合根））；`MODEL_EXECUTION_TIMEOUT_MS=1000` 进程窗（下界 `invoke.ts:376`·产品缺省 35_000 不改）；`MODEL_API_KEY`/`MODEL_BASE_URL` 进程内自删+pre/post-boot ISO 断言（ADV `:123-127` R6 先例形）· est live=0。
- **臂**（拒臂全程五面快照 before/after 恒等：resume 表行数 / `entitlement_consumption` confirmed 行数 / `resume_ocr_artifact` 行数 / 桶可用额度 / `ai_model_invocation` 终态）：
  - **PC = 管道活性对照（non-claim）**：scripted 成功（≥10 字·含 Go/Redis 事实文本过 `ingestResume` 下游门）→ **200 `{status:'ingested', format:'image', ocr:true}`**（`:197`）+ consumption confirmed 恰 1 + 成功后工件已删（`:194`）——仅证 harness 承载非假阴性（成功面=full.e2e live-key 已登记矩阵 `:180`·本臂 zero claim·Ban 借 PC 宣成功面新证据）；
  - **F1 = throw 形**：scripted `resume.vision` throw → **422 `ocr_failed` reason=`external_outcome_unknown`**（非 500 非静默）+ 五面快照恒等（resume 零行·confirmed 零行·工件零行·额度回升）+ `ai_model_invocation` unknown/error=`external_outcome_unknown`；
  - **F2 = 超时形**：scripted 挂起（永不 resolve）+ `MODEL_EXECUTION_TIMEOUT_MS=1000` → **422 `ocr_failed` reason=`external_outcome_unknown`**（`:1130` 恒返·HTTP 面与 F1 同码=推定如实承登）+ **`ai_model_invocation` unknown/error=`model_execution_timeout`**（`:1120` 账本 reason 级可分=本形独立断言面）+ 五面快照恒等；
  - **F3 = 空转写形**：scripted 返回 `{ok:true, raw:{text:'   '}}` → **422 `ocr_failed` reason=`business:ocr_text_too_short`** + 工件**零写入**（`:1199` 跳过·非删后残留）+ confirmed 零行 + invocation completed error=`business_validation_failed` + 五面快照恒等；
  - **N = 净账臂**：F1–F3 全程 `entitlement_consumption` 零 confirmed 净账（reserve→release 闭环·可用额度逐臂回升）——`e2e-scenarios.md:155` A3+`:94`「无悬挂消费」对码。
- **种子豁免枚举（具名·枚举外零裸 INSERT）**：①consent=产品路径 `POST /privacy/consent`（boot app 层）；②`entitlement_bucket` 直 INSERT（每臂独立 principal 一桶·worker `ocr.proof.ts:31-33` 先例形）——新增豁免须先回炉修订本卷。
- **非替代申明（防洗句·两形状互不替代·沿 case-matrix `:95`/`:97` 句族+`uc017-REQUEST.md:148` 承载司法句形）**：FAULT=visionOcr 缝注入→**产品降级形状**（422+release+工件卫生）≠ NEG/BOUND/ADV=输入形状拒（全在 vision 调用**之前**止步）≠ LOAD=并发吞吐（红停归排期）≠ PERF=延迟链 ≠ worker ocr.proof=单元直调+手搓 release ≠ web 侧=文案枚举/伪造信封面——互不替代互不借用 · **Ban 借 F 臂宣「OCR 失败自动重试已证」**（`:132-137` 面无重试语义·422 即确定性终态回应·重传=用户重发请求非系统重试·Ban 发明）· **Ban 借 F 臂宣 OCR 成功面/转写质量背书**（本 case 只证失败降级形状）· **Ban 借 F1/F2 同码面宣「两成因在 HTTP 口可区分」**（`：1130` 恒返·区分面=账本 reason·如实承登）。

---

## §1.3 否决表（落选缝/落选臂诚实留痕 · 含停止条件登记 · 与认领核对互补）

| 落选项 | 否决理由 |
|---|---|
| **boot() 全栈承载 config-absent 形**（`OCR_ENABLED=1` 进程窗+无 Key→`model-client.ts:731` `provider_rejected`） | **否决**：`_neg-harness.ts:52-57` 硬钉 `OCR_ENABLED='0'`（Object.assign 无条件覆写）·改共享 harness 面=越界（webhook-fault/uc017 rev 先例形）——该形留 harness 缝另刀；本刀三形走最小模块 useValue 注入（同为产品自带注入口·零产品码改动）。**停止条件登记**（非缺陷·承载缝不在本刀触界面）。 |
| **OCR_ENABLED=0 闸臂**（422 `image_ocr_unavailable` `:96`） | 已被 `neg-resume.proof.ts:48-52` B1 臂钉（harness 硬钉形）——重铺 wash 零信息增量·不申明。 |
| **失败后同图重传可达性臂**（release 后 reserve 是否 duplicate→`:115-122` 409 `ocr_duplicate` 形） | `reserveEntitlement` released 态重予約语义未在侦察面亲证·臂期望值不可静态钉——**薄残余如实登记留后刀裁量**（Ban 发明不可达断言）。 |
| **`ocr_no_content`/`ocr_binding_missing`/`ocr_binding_invalid` 降级族臂**（`:142-166`） | 同为降级族但注入面=绑定/结构化面非 visionOcr seam 三形（需 binding 操纵/结构化故障注入）——留后刀独立裁量·如实登记非本刀面。 |
| **worker 层 OCR 管线宕臂** | 产品面亲证 OCR=API 同步路径·worker 无 OCR 消费路径（`:94` layer 值差承登 §0.2）——worker 侧无可注 OCR 管线缝·**Ban 发明不可达断言**。 |
| **015 域 PERF/LOAD 面** | LOAD 红停归排期（`:95`）·PERF_api 已收（`:97`）——零申明。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 3 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check + cap 预算核（亲算·本卷零步进）**：`node scripts/ai-docs/check-docs.mjs` 起草前本树亲跑 **EXIT=0 · scanned 2436**·cap=**2438**（`public-text-policy.mjs:240` 亲证）→ 本卷新 .md +1=**2437≤2438 越限不触发 → 零步进·policy 两 .mjs 零触**（起草后预期 scanned 2437·余量归零如实登记）。EXEC 期 +1 proof 受管=2438 恰达（届时实测·若并线前移沿常设预授权「cap/lint 以合并树实测为准恰等步进免再询」·Ban 就地多放）。
2. **markers 五类零命中 + est live=0**：本刀改动集（1 tracked）四标记词面+冲突标记 grep 零命中（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:157-163`·零字面复抄防自指·回执随 §7）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 1 tracked**=本卷 .md——多任何未登记 tracked 路径即停。EXEC 期 diff 面=本卷落卷+新 proof+注册行（root/apps/api package.json）+runner 五位+egress additive+双表行内 additive（矩阵 `:120`/`:180`·case-matrix `:94`）+收据 tracked 面——届时逐件登记·多任何未登记路径即停。
4. **EXEC 预基面（届时重 pin）**：隔离 prove EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· 邻面不回退恒等集（`uc015:nhp-adv:prove` 30 / `uc015:ingest-failures:prove` / `neg:resume` / `ocr:prove`（若届时隔离面可跑·否则如实登记跳过不硬跑））· 双表同步 additive 逐件登记· 期望值对 §0.2 逐臂对码（**臂收据与推定形不符即根因推定被证伪**·UC-019 静态推定错防线）· 任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:120`/`:180` 与 case-matrix `:94` 仅允许 additive 注记（**FAULT 格 partial 零翻**·case-matrix 旗措辞零动·coveredCount=8 零翻转）· Ban 借收据互 wash（FAULT≠NEG≠BOUND≠ADV≠LOAD≠PERF≠单元面≠web 面）。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增一 test proof 文件+注册行+runner 注册位·沿 uc015-adv/webhook-fault 族 prove-only 先例）。
2. **共享 harness 面零触**：`_neg-harness.ts` 零改（`:52-57` OCR 硬钉/`:63` 无 override 缝全保留——承载绕行见 §1）；既有 proof 文件零触（F1–F5/ADV/neg-resume/worker ocr.proof/sse-principal-slot/uc-e2e-017 全只读）。
3. **其余 §1.0 行零触**：UC-015 NEG/BOUND/ADV/LOAD/PERF 各 cell 及其余全部 §1.0 行·§1.3 落选项全部只读。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方。
5. **covered/queue 翻面零预支** · **零迁移零配置**（Ban 新迁移 Ban 触告警/CI 配置·零 .env 触）。

## §4 依赖

**①上游已满足**：DI seam/闸/invoke 关口/超时原语全在树（§0.1 blob 亲算）+ 最小模块先例两件+boot 无 override 缝三锚+R6/进程窗先例（ADV）+ scriptedModelClient 公开缝+种子先例（worker ocr.proof）。**②同文件并发**：EXEC 期矩阵 `:120`/`:180` 与 case-matrix `:94` 邻区 additive 直并规则（merge 时逐件复核·届时 merge-tree 预演）。**③下游**：FAULT cell 收据供 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评）；config-absent 形/重传语义/绑定面降级族（§1.3 登记）留后刀。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 动主仓；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·Ban 改断言迁就）；Ban invent covered（含升格 partial/借旁证 wash/跨列 wash）；Ban live key（零 `DASHSCOPE_VISION_API_KEY`/零 `MODEL_API_KEY`·进程内自删+ISO 断言）；**Ban 真实外呼**（scripted 注入零出站·`model-client.ts:731` 未配置即未派发承·est live=0）；Ban 触 `_neg-harness.ts`/既有 proof/产品码面/迁移/CI 告警配置（本卷零 cap 步进·policy 两 .mjs 零触）；Ban 改共享 SSOT；Ban 触其余 NHP-015 行与其余 §1.0 行；Ban 裸 INSERT 绕产品路径（豁免=§1 种子枚举①②具名·枚举外裸 INSERT 即违本 Ban·新增豁免须先回炉修订本卷）；Ban 借 F 臂宣「自动重试已证」/「成功面/转写质量背书」/ 借 PC 宣成功面新证据 / 借 F1F2 同码面宣 HTTP 口可区分（四重披露钉）；Ban 就地改矩阵/case-matrix 格值（additive 注记·`:94` layer 值差如实携带·翻面权归协调方）；Ban 洗句（两形状互不替代·§1 申明承守）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（docs:check/PTP proof 系纯文面机检零外呼）。EXEC 期 case 全离线隔离：scripted 客户端注入零出站·两模型 Key 进程内自删+ISO 断言·`OCR_ENABLED` 进程窗≠外呼（`:731` 未配置即未派发·注入面客户端根本不持 Key）·boot() 进程内真栈零 drain 零模型（§2-4 承）。

## §7 markers=0（卫生声明）

本刀改动集（1 tracked·起草 turn）五类标记词（四标记词面+冲突标记·词面运行时组装口径 `i6-239-gates.proof.mjs:157-163` 亲读·**本卷零字面复抄防自匹配**）+ 行首冲突标记 grep **零命中**（起草席亲跑·回执随本节留痕——沿批 B/C 与 webhook-fault 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual`（2026-10-26 起草落卷即停·三处钉：本节 + Status 头 + 卷尾注·原值史录不洗）· pre-exec 双审两独立外席双 PASS → 协调方 EXEC 授权后始开工（alone≠dual·Ban 自批）· 停止条件四类对各在飞 step 适用·命中即停手上报·Ban 就地处置：**
- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（`visionOcr` seam/降级块 `:127-137` 被重构 · 矩阵 `:120`/`:180` 或 case-matrix `:94` 邻区被并线改写归属）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期臂收据与 §1/§0.2 推定形不符（如 F1/F2 返 500 非 422 · release 未行使 · 工件残留 · F3 工件被写入 · N 臂出现 confirmed · F2 账本 reason 非 `model_execution_timeout`）→ 根因推定被证伪 → 停·如实升级（**产品降级面缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：修法诉求超出 §1 恰 1 case 面（需触 `_neg-harness`/产品码/已钉族/covered 翻面/共享 SSOT/迁移/cap 多放）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check 越限且无并线 sanction / 邻套件新红 / typecheck/lint 超 / docker 不可用属 blocked 另计）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

**开工三条款**：①立项日 `git fetch origin` 重 pin §0 全锚（漂移如实改锚·结论不变只更行号）；②`docker info` EXIT=0 亲证（隔离 PG 承载前提·不可用=blocked 停上报非验收红）；③每臂期望值对 §0.2 逐条对码后落断言（断言先于运行·Ban 运行后迁就）。

## §9 状态

现值 **`draft:awaiting_pre_exec_dual`**（2026-10-26 起草·三处钉：Status 头+§8+本节前卷尾注·史录不洗）· 起草 commit=本卷 .md（**恰 1 tracked·零 policy .mjs**）· 起草落卷即停 · 后继=pre-exec 双审两独立外席（双 PASS 会签）→ 协调方 EXEC 授权 → EXEC 席落码落卷（proof+注册 runner 五位+双 package.json+双表 additive+收据·届时逐件登记）→ post-prove 双审 → 翻面权归协调方。

---

*NHP-015 FAULT REQUEST · 2026-10-26 起草 · **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行·起草落卷即停·原值史录不洗）· 剩余队列 Phase2 #12 one-knife-one-row · 覆盖矩阵残余 UC-E2E-015 `:120` **FAULT cell 残余亚层**（格值 partial 零翻·additive 注记待 EXEC）+ `:180` 工具行 + case-matrix `:94` 锚「—」全族唯一零命令零收据 case（批 C `:21`/`:131` 留后刀之 FAULT 半）· 修法=恰 1 具名 case（`NHP-015-FAULT-01` visionOcr seam 故障注入→产品降级形状：F1 throw/F2 超时/F3 空转写三形+PC 对照+N 净账·422 `ocr_failed`+release+工件卫生+账本 reason 级可分）· 产品面现形=OCR 失败路径**有真降级**（退费+清工件+422 可解释信封·非裸 500 非 queued 非 fallback 文本链）· seam 可达性=**产品自带 DI 注入口零产品码改动即达**（`OCR_VISION_CLIENT` token+最小模块 useValue 先例形·红停未触发）· boot() 硬钉 OCR_ENABLED='0' 承载值差如实承登（共享 harness 面零触·OCR 臂走最小模块+env 窗后置）· case-matrix layer=worker 值差如实承登（产品面 OCR=API 同步路径）· 与 NEG/BOUND/ADV（输入形状拒·vision 调用前止步）/LOAD（红停归排期）/PERF_api/单元面/web 面零重复申明（两形状互不替代·wash 否决 §1.3）· cap=2438 scanned 2436 余量 1（本卷 2437 零步进·policy 两 .mjs 零触）· est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · EXIT0≠covered · releaseEvidence=false · ≠HA · ⛔push · 后继=pre-exec 双审两独立外席→协调方 EXEC 授权*
