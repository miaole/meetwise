# SSE-API-FAMILY 5C 子刀（#139 SSE 掉线唤醒+补偿拉取 · #14/#216 invoke 站点 service 补全 · #172 trace 丢失率分母 · EXEC REQUEST · 落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 落卷即停 · post 双审两独立外席待开 · alone≠dual · Ban self-approve · post BOTH PASS ≠ push · ⛔push · ⛔merge主线）
**席位**：SSE-API-FAMILY 子刀起草席（协调方派单·5C 拆刀排程第三发·授权沿 Q1 先例=LEDGER :87 组标签+checklist 锚定·⛔push·⛔merge主线）。
**基线**：`feat/mysql-schema-skeleton` @ `935899f1`（dbacl2-ci-shallow-fix nail·origin tip 亲证=本席 fetch 后 `git worktree add` 直落·docs:check 2183≤cap 2192 本席本树亲跑 EXIT=0）· 分支 `line/sse-api-family`（本席 `git worktree add ../meetwise-sse -b line/sse-api-family` 亲立·建树即 origin tip·零 ff 随动需求）· 工作树 `meetwise-sse`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（2026-10-16·5C 拆刀排程：SSE-API 靶=#172/#14/#216/#139·#139 在 rkw 波前已列·#172/#14/#216 归属核=本卷 §0.2 逐行亲证归属成立）；②LEDGER `product-campaign-LEDGER.md` :87 组标签（5C 行「#36/#37/#17 ✅ …/#139 多实例（留 5C-SSE-API 子刀）」+「#248/#245/#246/#172/#14/#216 — 🆕 分 4 子刀（OBS/QUEUE/SSE-API/API-HARDEN）」两段本席亲读在卷）；③issues-master（仓外 `~/Documents/Meetwise产品审计-更正版/issues-master.md`）四行原文=**:263**（#139）/`:366`（#14）/`:429`（#216）/`:417`（#172）·四行组列逐行同标签「第5批-C 可靠性/运维/API」=组标签锚定成立；④checklist STILL OPEN 锚=:2624 形（5C 子刀残面在册·QUEUE-SHUTDOWN nail 段「四行全闭还须 Q2+ 各子刀」同语式）。

---

## §0 现状锚（起草席亲读·file:line+`git hash-object` blob+基线活体 run 实测 @`935899f1`·**EXEC 立项照本节对届时 tip 全量重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git branch --list "line/sse-api*"` 恰 1 命中=本席分支；`git worktree list` 中 sse 词面恰 1=本 `meetwise-sse`（`meetwise-swb`=safewrite-backpressure 已并主线零独有 commit·`meetwise-ssd`=session-summary-deepen·均非本刀触面）——无第二同名树。
- `ls ai-docs/delivery/harness/ | grep sse-api` 建前零命中→落卷后唯一同名卷=本卷。
- 本刀在飞相 stock 面：`line/obs-family` 对 origin tip 恰 1 docs commit（obs-family-REQUEST.md·三面=health.service/run-e2e 脚本/logger·与本刀零文件交集亲证）；`line/api-harden-family` 对 origin tip 恰 0 commit（起草中）——两并行席零交叠（§3）。
- **撞号勘误（如实登记）**：issues-master :117「#215 | 原 #216（产品偏差）| 撞号合并」——该原 #216 已并入 #215 报告页行，**不涉本刀**；本刀 #216=:429「第5批-C」押题 invoke service 行，编号指称唯一。

### 0.1 blob 锚表（`git hash-object` 亲算 @`935899f1`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/api/src/platform/sse-notify.service.ts` | `655746c1`（414 行） | **`:325-331` `loseClient(reason)`：detach+degrade+scheduleReconnect——零唤醒等待者=缺口正身①**·`:333-346` `degrade()`（降级转变结构化日志·约束②）·`:174-186` `waitFor()`（entry=self-removing resolve·edge-trigger·回调内零 SQL 纪律）·`:132` `router Map<string,Set>`（等待者路由）·`:348-397` `establish()`（双 LISTEN+trigger 实证+健康翻面）·`:223-238` `stop()`（计划内关停·不打降级日志）·`:285-295` `onNotification`（同流多等待者全醒 P-4） |
| `apps/api/src/platform/sse-pump.ts` | `21f52b34`（208 行·**本刀零字节零触**） | `:70` `HEALTHY_FALLBACK_MS=30_000`（SSE-PUSH Opt1 协调方裁决钉值·**零触**）·`:71` `DEGRADED_POLL_MS=2_000`·`:171-174` waitMs 每循环迭代读 `notify.health().healthy`（降级即时回落机制**已在**）·`:91-119` #132 SAFEWRITE-BACKPRESSURE 面（`bpTripped`/`bpBytes`/`SSE_BACKPRESSURE_MAX_BYTES=1_048_576`·**零触承载**）·`:182` `wait.promise.then(()=>{notifyWoke=true;settle()})`（唤醒→取数臂=补偿拉取通道**现成**）·`:195` `fetchMore(lastSeq)`（seq>lastSeq 拉取本体） |
| `apps/api/src/platform/sse-registry.ts` | `94eb93d5`（82 行·零触） | HA-2 C1 进程级注册表（R1 口径·drainAll 同步置旗） |
| `apps/worker/src/interview-service.ts` | `4c963993`（367 行） | **`:175` 评估 invoke（interview.answer-scoring.v1·缺 service=#14 面）**·`:153-156` `evaluationModel`→`getPrompt('mock-interview.evaluate')`（service 自然值单源）·**:245 押题 invoke（interview.quiz-generation.v1·缺 service=#216 面）**·`:287-288` 诊断 invoke（**已带** `service:'resume-diagnosis.generate'`=既有先例形）·`:346` 报告 invoke（report.narrative.v1·缺 service） |
| `apps/worker/src/adaptive-interview-service.ts` | `757d7f95`（771 行） | **`:323` 规划 invoke（interview.competency-planning.v1·缺 service）**·`:328` `promptedModel(model,'planner.competencies',…)`·**:543 出题 invoke（interview.question-generation.v1·缺 service）**·`:559` `promptedModel(d.model,'interviewer.ask',…)` |
| `packages/ai-runtime/src/invoke.ts` | `2320a0f2`（1210 行） | `:233` `service?: string`（API 契约可选·**契约零改**）·`:320-323` `registryPromptVersion`（service∈registry→version 派生·AG-19 单源）·`:444` digest **legacy 本地脚本分支**才用 spec.service（生产五站点均走 `:438-441` content-digest 分支=**加 service 对 digest 零影响**）·**:522-545 `persistTraceBestEffort`（UC-028 fail-open 旁路：`:528` `METRIC.aiTracePersistFailures` inc+`:533` 单行 JSON 日志——只有失败分子无分母=#172 缺口正身②**）·`:1170` `if (!error) await persistTraceBestEffort(...)`（仅成功路径调 trace） |
| `packages/ai-runtime/src/metrics.ts` | `c5a3d39e`（183 行） | `:109` `aiTracePersistFailures:'ai_trace_persist_failures_total'`·`:162` 零预填行（**缺分母常量=#172 修法落点**） |
| `packages/ai-runtime/src/prompts.ts` | `899be6f2`（242 行） | REGISTRY 键单源：`:65` `'resume-quiz.generate'`·`:101` `'planner.competencies'`·`:133` `'interviewer.ask'`·`:176` `'mock-interview.evaluate'`·`:219` `'report.generate'`（五 service 值=注册表键逐字·AG-19 prompt_version 顺势点亮） |
| `apps/api/test/sse-push-notify.proof.ts` | `1a5f5a6f`（663 行·**48 臂亲跑全绿**） | `:432-455` P-2b healthy 臂（注入 fallbackMsHealthy=250+fakePgClient 连接缝）·`:457-477` G2 notify 主推臂·`:479-502` P-2c degraded 臂·`:504-520` 退避读数臂——本刀新 P-2d 掉线唤醒臂族的**既有缝与形制蓝本** |
| `packages/ai-runtime/test/ag19-prompt-version.proof.ts` | `d8dfb822`（356 行·**亲跑全绿**） | `:88` promptVersions() 八 service 对表臂·`:117-119` 透传臂·`:142` 「缺省 service:DB 落 NULL」臂（直调 invoke·**源级门不触此臂=API 契约可选性维持**）——#14/#216 源级门新臂落此 |
| `apps/api/test/uc-e2e-028-nhp-fault.proof.ts` | `4f082e77`（323 行·**EXIT=0 亲跑**） | `:218-219` F1 `ai_trace_persist_failures_total=1` 臂·`:236-262` F2a/F2b 真相写失败臂（计数仍=1·attempts 不动）·F3 正控（无注入全绿）——#172 attempts 新臂落此 |
| `packages/ai-runtime/test/metrics.proof.ts` | `a447b9f3`（81 行） | 零预填+常量名 `_total` 纪律臂形制蓝本 |
| `scripts/ai-docs/public-text-policy.mjs` | —（`:100` `MAX_FILES=2_192`） | docs cap（实测基线 2183·本卷 +1→2184·余量 8） |

### 0.2 靶行原文清点（issues-master 四行·组标签「第5批-C 可靠性/运维/API」逐行同锚）

| 行号 | 原文（忠实节要） | 修法列原文 | 依赖列 | 现状列 |
|---|---|---|---|---|
| :263 #139 P2 技术缺陷·面试中 | 健康通道下 SSE 兜底变 30s，LISTEN 掉线不唤醒等待者，丢失的 NOTIFY 无补偿（锚 `sse-pump.ts:75-84`；`sse-notify.service.ts:190-199,216-250`——行号系审计时点·现漂亲证见 §0.2-勘误） | 「loseClient 时唤醒所有等待者并立即补一次 seq>lastSeq 拉取」 | #17 | 仍存在·已核实（延迟幅度推断） |
| :366 #14 P3 技术缺陷·运维/部署 | 面试出题/规划/评估/报告的 invoke 不传 service，ai_invocation_trace.service 为 NULL（锚 `invoke.ts:345-366`；`adaptive-interview-service.ts:150-161`；`interview-service.ts:295-302`——审计时点行号） | 「各 invoke 调用点传 service 名（如 interview.ask/evaluate/report），并加非空断言」 | #172 | 仍存在·已核实 |
| :429 #216 P3 技术缺陷·传简历 | 押题的 invoke 不带 service（诊断带 resume-diagnosis.generate），trace 的 service 列为空，按服务聚合成本/排障会漏掉押题（锚 `interview-service.ts:204-208 vs :240-241`；`invoke.ts:308,359,389`——审计时点行号） | 「押题 invoke 补 service」 | #14 | 仍存在·已核实（读码） |
| :417 #172 P3 技术缺陷·运维/部署 | trace 写入 fail-open 后无对账回补，trace 丢失即永久丢（不影响计费真相）（锚 `invoke.ts:370-395,897`——审计时点行号） | 「加失败 trace 的补写队列**或**在指标中暴露丢失率」 | #14 | 仍存在·已核实 |

**行号漂移勘误（如实）**：审计锚行号对 `935899f1` 现势全数漂移（逐行现锚见 §0.1）——机制本体零漂：①`sse-pump.ts` 健康兜底 `HEALTHY_FALLBACK_MS=30_000` 现居 `:70`（审计 `:75-84` 时点尚无 TOKSTREAM/背压增面）；②`loseClient` 现居 `sse-notify.service.ts:325-331`；③五 invoke 缺 service 站点现锚 `:175/:245/:287/:346`（interview-service）+`:323/:543`（adaptive）——`persistTrace`/`persistTraceBestEffort` 现锚 `invoke.ts:492-545`。**归属核裁决（brief「#172/#14/#216 归属核」兑现）**：三行组列均=「第5批-C 可靠性/运维/API」，与 :87 批表「#248/#245/#246/#172/#14/#216 分 4 子刀」中 SSE-API 位拼合成立；#139=「#36/#37/#17 ✅ /#139 多实例（留 5C-SSE-API 子刀）」明示留本刀——四行归属全数核毕无歧义。
**依赖自洽**：#14↔#172 互指（issues-master 依赖列双向）=同刀内部件序；#216 dep #14=同刀；#139 dep #17——**#17 已翻**（API-HARDEN nail @`809cd46e`·SSE 槽 `gateway_slot_lease` 单语句原子占·LEDGER :87 在卷）=依赖已满足。

### 0.3 迁移号登记（预期零·实证后定）

- 主线链顶实存 max 0204（COST-COLUMNS 0204_ai_cost_cached_input_price.sql·本树 `ls packages/db/migrations | tail` 口径）·本刀**预期零迁移**：service 列已存在（`ai_invocation_trace.service`/`ai_model_invocation.service` 均既有列·INSERT 既有通道）·#172 指标=进程内 counter 零 SQL——全刀零 DDL 零新表零 wrapper。
- **协调规则**：若 EXEC 期复判确需迁移→认领号=EXEC 立项日按届时主线链顶顺延实测·零硬编码本卷号·Ban 抢号 Ban 私占（沿 queue-shutdown §0.3 同款）。

## §1 红事实（机制链·源级亲证·基线读数·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 #139 缺口正身（`loseClient` 零唤醒）

`SseNotifyService.loseClient(reason)`（`:325-331`）在 LISTEN `error`/`end` 或 trigger 实证失败时执行三步：detach client→`degrade(reason)`→`scheduleReconnect()`——**router 中全部在册等待者零触**。泵侧后果链：`sse-pump.ts:171-174` 的 waitMs 在每轮循环**头部**按 `health()` 现读计算——健康态注入 30s 兜底臂后 LISTEN 掉线，泵的当轮 `Promise.race`（`:176-183`）只剩 30s 计时器可胜出：**掉线窗内泵最长沉睡 30s**，期间该流新事件（interview_event 已持久化）不被推送；30s 到期后循环头重读 `health()` 才回落 2s。此即 issues-master :263 三段事实的机制正身：①「健康通道下 SSE 兜底变 30s」=Opt1 钉值（`HEALTHY_FALLBACK_MS`）；②「LISTEN 掉线不唤醒等待者」=`loseClient` 零唤醒；③「丢失的 NOTIFY 无补偿」=NOTIFY 本 lossy hint，补偿唯一通道=唤醒后的 `fetchMore(lastSeq)`（`:195`·seq>lastSeq 同形）——不唤醒则补偿被押后一个兜底窗。**唤醒→取数通道现成**：`waitFor` 的 entry 即 self-removing resolve（`:178-181`），resolve 后 `notifyWoke=true`（`:182`）→ 泵走权威行取数臂——缺的只是 `loseClient` 侧的触发点。降级可观测（约束②）已在（`degrade` 结构化日志 `:333-346`·本刀零触）；退避重连链已在（`:264-277`·零触）。

### 1.2 #14/#216 缺口正身（5 站点 service 缺失·全宇宙清点）

模型级 `invoke()` billable 站点全宇宙=**8**（本席 `await invoke({` 全仓清点·graph `.invoke(` 非本域）：3 站已带 service=诊断 `interview-service.ts:288`/OCR `resume-ocr.ts:137`/route-classify `job-route-classify.ts:170`；**5 站缺失**=评估 `interview-service.ts:175`/押题 `:245`/报告 `:346`/规划 `adaptive-interview-service.ts:323`/出题 `:543`——与 #14 修法列四域（出题/规划/评估/报告）+#216（押题）**恰一不差**。五站点 service 自然值=`prompts.ts` REGISTRY 键逐字（`mock-interview.evaluate`/`resume-quiz.generate`/`report.generate`/`planner.competencies`/`interviewer.ask`）——与站点内 `promptedModel` 第二参同键（`:155`/`:248`/`:352`/`:328`/`:559`），与既有诊断先例（`:288` service=其 prompt 键）同形。**落库效果面（纯观测）**：`ai_invocation_trace.service` NULL→键值（`:504/:510`）+`ai_model_invocation.service/prompt_version` NULL→键/版本（`:744/:780`·AG-19 `registryPromptVersion` 顺势点亮）+`model_invocation_prompt_version_total` 标签 `(unregistered)`→注册表键（有界值域 `:330-334`）。**行为面零变三证**：①digest 仅 legacy 本地脚本分支含 service（`:444`）·五站点均 content-digest 分支=幂等键零漂；②service 不进 requestDigest（AG-19 契约 `:236-238` 明示）；③无任何生产消费方读 `ai_invocation_trace.service` 作行为分支（全仓 grep 亲证·只 INSERT）。#14 修法列「并加非空断言」落=**源级门机检臂**（§1-件②·对生产 src 全 8 站点断言 service 在场——运行时 throw 形否决见 §1.3-2）。

### 1.3 #172 缺口正身（fail-open 有分子无分母）

UC-028 定谳（`persistTraceBestEffort` JSDoc `:513-520`）：trace=可观测旁路非业务真相——INSERT 失败不回滚业务事务、不改 invoke 终态，失败必须被结构化观测。现观测=分子单腿：`ai_trace_persist_failures_total`（`:528`）+单行 JSON 日志（`:533-541`·service/idempotencyKey/errorName/pgCode）——**丢失率不可导出**（无 attempts 分母·`metrics.ts` 全表 grep 亲证零配对常量）。修法列 OR 分支「在指标中暴露丢失率」=补分母即合规：`persistTraceBestEffort` 入口 inc attempts（成功失败都过入口）·丢失率=failures/attempts（PromQL 侧除法·零新 gauge）。边界亲证：RECONCILE-RETRY（#10·`06d79106`）的 `gateway_model_invocation_backlog` 双 gauge 属 `ai_model_invocation` 台账域（unknown 悬挂面）——与本刀 `ai_invocation_trace` 失败观测**两表两域零重登**（:87 批表 #10 已翻·本刀不触其面）。

### 1.4 基线读数（起草席本树亲跑 @`935899f1`·2026-10-16·全绿在卷·非复绿刀=缺口在门覆盖外）

`node scripts/ai-docs/check-docs.mjs` **2183≤2192 EXIT=0**·`pnpm -C apps/api prove:sse-slot` EXIT=0（5+1 429+shared bucket）·`pnpm -C apps/api prove:s4b-delta-arm` EXIT=0·`pnpm -C apps/api prove:last-event-id` EXIT=0·`pnpm -C packages/ai-runtime prove:metrics` EXIT=0·`pnpm -w run sse-push:notify:prove` **EXIT=0（48 臂全绿·隔离收据 `.tmp/isolated-proof-receipts/2026-10-16T10-12-28-…json`）**·`pnpm -w run uc028:nhp-fault:prove` **EXIT=0**（隔离收据同目录）·`pnpm -w run ag19-prompt-version:prove` **EXIT=0**（隔离收据同目录）·`node scripts/run-e2e-isolated.mjs neg:all` **EXIT=0（auth+90/91/102/179/135 六套全绿·与 CSP-EXEC 门 3 恰等记录 90/90/91/102/179/135 同值域亲证）**·lint 三包亲跑 EXIT=0（api 1421/worker 954/ai-runtime 628 预算贴边全绿·root 5235 承 csp-headers nail 门 9 记录）。即：**既有门全绿=本刀为缺陷修复刀**（#139 唤醒臂/#172 分母臂/五站点断言臂均新增覆盖）。

## §1-修法（一刀四件定稿·零迁移·零业务行为变更——「纯观测面对齐+掉线唤醒」）

- **件① `sse-notify.service.ts`（#139·掉线唤醒）**：新增私有 `wakeAllWaiters()`：遍历 `router` 全部 `Set` 快照逐 entry()（self-removing resolve·与 `onNotification` P-4 同形·回调内零 SQL 纪律保持）；`loseClient()` 在 `degrade(reason)`+`scheduleReconnect()` 之后追加 `this.wakeAllWaiters()` 一行。**语义**：LISTEN 是全进程单连接·掉线影响所有流→「唤醒所有等待者」跨流全醒=修法列原文直译；被醒泵下一轮循环头读 `health()=false` 即回落 2s cadence+`fetchMore(lastSeq)` 立即补偿拉取（§1.1 通道现成·泵循环零改）。`stop()` 不加唤醒（§1.3-5）；`degrade`/`establish`/退避链/token 通道/evict 通道全部零字节。
- **件② `interview-service.ts`+`adaptive-interview-service.ts`（#14+#216·五站点 service 补全）**：恰 5 处字面量增 `service: '<注册表键>'` 一行——`:175`→`'mock-interview.evaluate'`·`:245`→`'resume-quiz.generate'`（#216）·`:346`→`'report.generate'`·`:323`→`'planner.competencies'`·`:543`→`'interviewer.ask'`。值=§0.1 prompts.ts REGISTRY 键逐字·字段插入位沿 `:288` 诊断先例形（spec 字面量内·不动 operation/schema/model）。**「非空断言」落=源级门**：`ag19-prompt-version.proof.ts` 新增源级臂——对生产 src（`apps/worker/src`+`apps/api/src`+`packages/ai-runtime/src`·test/proof 排除）清点 `await invoke({` 站点逐个断言其字面量块含 `service:`（现势恰 8 站点·机检清点臂）+五新值∈`promptVersions()` 键集臂。API 契约 `service?: string` 可选性零改（`:142` 缺省 NULL 臂照绿=直调通道不受源级门约束）。
- **件③ `metrics.ts`+`invoke.ts`（#172·丢失率分母）**：`METRIC` 增 `aiTracePersistAttempts: 'ai_trace_persist_attempts_total'`（`_total` 纪律沿 `:109` 形）；`registerBaselineMetrics` 于 `:162` 邻位增零预填一行；`persistTraceBestEffort` 入口（`asPrincipal` 前）增 `getMetrics().inc(METRIC.aiTracePersistAttempts);` 一行——catch 内 failures inc 零触。丢失率=failures_total/attempts_total（PromQL 导出·零新 gauge 零告警接线——告警 expr/白名单域 Ban 触·§3）。
- **件④ proof 三件随刀（断言面·EXEC 落值）**：④-a `sse-push-notify.proof.ts` 新 P-2d 掉线唤醒臂族（沿 P-2 unit 既有 fakePgClient/注入缝形制·零新依赖）：N1 掉线即醒臂（健康建立→waitFor→`client.emit('end')`→waiter promise <100ms 内 resolve+`health()=false` reason=listen_down·不等注入 fallback）；N2 跨流全醒臂（双流三 waiter 全 resolve+`waitingCount()===0`）；N3 泵补偿拉取臂（startPump·fallbackMsHealthy=30_000 注入·emit('end') 后 `fetchMore` <1000ms 内被调+后续 cadence≈2s 亲测）；N4 trigger_missing 同醒臂（trigger 查询空臂→loseClient→waiter 醒）；N5 源级臂（`loseClient` 函数体含 wake 词面·`includes` 形沿 sse-delta-arm BP-4 先例·零行号锚）；N6 卫生臂（醒后 entry 自除+既有 48 臂中 P-2b/G2 主推臂回归承载零改）。④-b `ag19-prompt-version.proof.ts` 源级门臂（件②断言面·§1-件②）。④-c `uc-e2e-028-nhp-fault.proof.ts` F 臂扩展：F1 增 attempts=1 臂；F2a/F2b 增 attempts 恒值臂（真相写失败不触 trace 路径·attempts 不动）；F3 正控后 attempts=2 臂（EXEC 对现行 F 序清点后钉值·若有 F4 顺延如实登记）；`metrics.proof.ts` 增零预填 `/ai_trace_persist_attempts_total 0/`+常量名纪律臂。**既有臂数维持逐字冻结**：sse-push 48/ag19 全臂/uc028 F 臂/metrics 全臂——pre/post 首参清单 diff=恰本刀新增臂+既有臂零 diff·多一条即停（沿 queue-shutdown §1-件③ pre/post 清单协议形）。

## §1.3 否决（替代路径·全数否决·越界行使即停止条件）

1. **否决「#172 补写队列」（修法列甲分支）**：新表/新队列/replay 语义超 ≤1 天量级；UC-028 定谳 trace=可观测旁路非业务真相——为观测面再造观测回补链=过度工程；OR 分支「在指标中暴露丢失率」即合规最小面。若协调方裁甲分支→另刀（本卷 §8 停止条件·不就地扩面）。
2. **否决「invoke 入口运行时 fail-closed throw（service 缺失即抛）」**：`service?: string` 是既有 API 契约（`:233`）；全仓 proof/测试直调 invoke 无 service 站点众多（ag19 `:142` 臂即其证），运行时 throw 波及面超 1 天且零生产行为收益——「非空断言」落=源级门机检（件②·对生产 src 全站点）。
3. **否决「service 进 digest/幂等键」**：digest 仅 legacy 本地脚本分支含 service（`:444`）·生产五站点 content-digest 分支——刻意写入=幂等键漂移=重试/重放面行为变更·Ban。
4. **否决「历史 NULL service 行 SQL 回填」**：伪造观测史·零迁移纪律（§0.3）——观测自本刀落点起如实累积。
5. **否决「`stop()` 对称加唤醒」**：计划内关停≠通道故障（`stop()` 现注记即此语义 `:230`）；HA-2 链 registry `drainAll()` 先行置旗醒泵·`SseNotifyLifecycle` 后行收池——泵退出不依赖 notify 唤醒·加唤醒=无收益扩散面。
6. **否决「HEALTHY_FALLBACK_MS 30s 缩短」**：SSE-PUSH Opt1 协调方裁决钉值（「无事件时零 SQL」承诺的载体·sse-pump 头注 `:13-15`）——本刀修「掉线不唤醒」非「兜底太长」；唤醒修法落地后 30s 仅剩纯健康窗兜底职能·缩窗=推翻既裁+SQL 放大。
7. **否决「loseClient 内同步重连后再唤醒」**：修法列只要求唤醒；同步 establish 引入阻塞回调+时序耦合（通知回调零 SQL 零 await 纪律）·退避重连既有链（`:264-277`）零触。

## §2 门矩阵（EXEC 验收·pre-exec 双审核对单基面·全过为绿）

1. **sse 族主门**：`pnpm -w run sse-push:notify:prove` **EXIT=0**——既有 48 臂逐字存活（pre/post 清单 diff=恰 P-2d 新增臂）+新 P-2d 臂族全绿（隔离 runner 通道·收据落 `.tmp/isolated-proof-receipts/`）。
2. **sse 族邻面门**：`pnpm -C apps/api prove:sse-slot` EXIT=0（#17 槽面·API-HARDEN 已落面零回归承载）+`pnpm -C apps/api prove:s4b-delta-arm` EXIT=0（TOKSTREAM S4b）+`pnpm -C apps/api prove:last-event-id` EXIT=0（Last-Event-ID 重放语义·泵收尾零触邻证）。
3. **#172 主门**：`pnpm -w run uc028:nhp-fault:prove` EXIT=0（F 臂+attempts 新臂全绿·fail-open/fail-closed 双面维持）+`pnpm -C packages/ai-runtime prove:metrics` EXIT=0（零预填+常量名臂）。
4. **#14/#216 主门**：`pnpm -w run ag19-prompt-version:prove` EXIT=0（既有全臂含 `:142` 缺省 NULL 臂照绿+源级门新臂全绿）。
5. **worker 邻面门**：`pnpm -C apps/worker prove:interview` EXIT=0（评估/押题/报告站点宿面）+`pnpm -C apps/worker prove:adaptive-life` EXIT=0（ask/plan 站点宿面）。
6. **neg 门**：`node scripts/run-e2e-isolated.mjs neg:all` EXIT=0——基线恰等 auth+90/91/102/179/135（§1.4 本席亲证）·**±2 熔断**（漂移超界即停·沿 CSP-EXEC 门 3 形制）。
7. **typecheck 门**：`pnpm turbo typecheck --force` EXIT=0（8/8 0 cached 口径）。
8. **lint 承登口径**：`pnpm lint`（root max **5235**）+`pnpm -C apps/api lint`（**1421**）+`pnpm -C apps/worker lint`（**954**）+`pnpm -C packages/ai-runtime lint`（**628**）亲跑实测——五站点 1 行+唤醒 1 法+分母 1 行+proof 新臂改动**零新增 warning 为预期**·漂移即如实登记归因（**Ban 借机修 lint**）。
9. **docs:check 门**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（基线 2183·本卷 +1→**2184 ≤ cap 2192**·余量 8·>2192 红即停上报·cap sanction 权归协调方）。
10. **markers 门**：改动集（本卷 .md+四码文件+三 proof）五类标记词零命中+`est live=0` 臂绿（词面见 `i6-239-gates.proof.mjs` §2-7 运行时组装·不入卷防自指）——**恰符臂红=协议形承登**（i6-239 历史刀申报面·沿 queue-shutdown §7+obs-family 同款先例·非本刀新增红）。
11. **diff 面（改动面窄断言）**：EXEC diff（对立项基线）=**恰 10 tracked 文件**——本卷 .md+码 5（`sse-notify.service.ts`/`interview-service.ts`/`adaptive-interview-service.ts`/`invoke.ts`/`metrics.ts`）+proof 4（`sse-push-notify.proof.ts`/`ag19-prompt-version.proof.ts`/`uc-e2e-028-nhp-fault.proof.ts`/`metrics.proof.ts`）（+收据目录可选）——**`sse-pump.ts`/`sse-registry.ts`/`prompts.ts`/`rate-limit.service.ts`/`drain-loop.ts`/worker `main.ts`/migrations/**/共享 SSOT 四卷零文件入 diff**；`sse-pump.ts` 零字节=机检词面断言（#132 背压十锚零触直证）。

## §3 范围外（边界清单·越界即 FAIL）

1. **`sse-pump.ts` 零字节**：#132 SAFEWRITE-BACKPRESSURE 已落面（bpTripped/bpBytes/safeWrite·48 臂在钉）+TOKSTREAM S4b delta 臂+Opt1 兜底常量全零触——本刀 sse 面只触 `sse-notify.service.ts`。
2. **API-HARDEN 已落面零触**：`rate-limit.service.ts` 槽原子占/桶分级共享/守卫缓存·`platform_slot_lease`·双守卫——并行 `line/api-harden-family` 席领地（Ban 触其树）。
3. **QUEUE=Q1 已落面零触**：`drain-loop.ts`/worker `main.ts` 两相排空链（QUEUE-SHUTDOWN nail @`2717e5e7` 波）。
4. **OBS 席三面零触**：`health.service.ts`/run-e2e 脚本重试环/logger serializers（`line/obs-family` 在飞）。
5. **ai_model_invocation 台账域零触**：claim/admit/reserve/settle 五相位·#10 RECONCILE-RETRY backlog 面·AG-D 准入族——`invoke.ts` 触面=仅 `persistTraceBestEffort` 一处 inc（`:444` digest/`:492` persistTrace 本体/五相位编排零字节）。
6. **告警 expr/白名单域零触**：#172 只加 counter 与零预填·接告警 expr=ops 域另裁。
7. **共享 SSOT 零改**：LEDGER（含 :87 组标签行）/checklist/batch-residual-plan/issues-master 只读引用——#139/#14/#216/#172 四行翻面权归协调方 nail·本刀不宣称行关闭。
8. **stub/e2e 场景面零触**：零新 Playwright 场景·零 LIVE 套件（est live=0 §6）。

## §4 依赖

**①上游已满足**：`935899f1` 主线为基线·§0.1 锚 blob 亲证在卷；#17（#139 依赖）已翻 @`809cd46e`。**②无同文件并发**：`git worktree list` 53 树亲证——sse-notify.service.ts/interview-service.ts/adaptive-interview-service.ts/invoke.ts/metrics.ts 五码文件对在飞支线（obs-family 恰 1 .md·api-harden-family 0 commit）零交集（§0.0）。**③迁移号**：§0.3（预期零）。**④下游**：四行批表翻面+checklist 5C 残面核翻·归协调方 nail（本刀交付读数）；Q2+ 子刀（API-HARDEN 席）与本刀无前后序硬依赖。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（⛔push·git 写只本 worktree docs commit）·Ban merge 主线（⛔merge主线）·Ban 自批（pre-exec 双审须独立外席·alone≠dual 不代签）·Ban 弱化断言（既有 48/ag19/uc028/metrics 臂逐字冻结·pre/post 清单 diff=恰新增·§1-件④）·Ban retry-to-green（断言红恰 1 attempt·基建红除外）·Ban 触 `sse-pump.ts`（§3-1·零字节红线）·Ban 触 API-HARDEN/QUEUE/OBS 三面（§3-2/3/4）·Ban 触 ai_model_invocation 台账域与告警 expr 域（§3-5/6）·Ban 触共享 SSOT（§3-7）·Ban 运行时 throw 化 service 断言·Ban service 进 digest/幂等键·Ban 历史 NULL 回填·Ban 抢迁移号 Ban 私占（§0.3）·Ban 借机修 lint/cap/协议形红（§2-8/9/10）·Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）·Ban 顺带升级依赖包·Ban 触其他工作树（含 `meetwise-aph`/`meetwise-obs`/`meetwise-q1s`/`meetwise-swb`）。

**pins（本卷钉值·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼零消耗）——**刀专项**：sse-push 既有臂=**48**（亲跑亲证）·neg:all 基线=**auth+90/91/102/179/135（±2 熔断）**·docs 基线 **2183**≤cap **2192**（本卷 +1→2184）·lint root **5235**/api **1421**/worker **954**/ai-runtime **628**·迁移=**0**·五 service 值=prompts 注册表键逐字（`mock-interview.evaluate`/`resume-quiz.generate`/`report.generate`/`planner.competencies`/`interviewer.ask`）·`HEALTHY_FALLBACK_MS=30_000` 零触·`SSE_BACKPRESSURE_MAX_BYTES=1_048_576` 零触·diff=恰 **10** tracked 文件·est live=0（起草 turn）。

**wave111 sanction 触面清单更新（P-2a 窗勘正·随 EXEC 落卷 §9 字段⑥）**：§1-件④/§2-1「既有 48 臂逐字冻结」对 `sse-push-notify.proof.ts` Phase A P-2a 退化臂行使 sanction 例外=**拆双臂形**（首 ping<1000ms 唤醒即取数（唤醒兑现）+ping 间隔全程 ≤2.1s（唤醒驱动且 legacy 2s 封顶·30s 兜底不可能绿））——语义升级非弱化（首 ping 上界由 [1800,3600] 收紧为 <1000·反 30s 判别义全保持）·其余 47 既有臂+ag19/uc028/metrics 全臂逐字冻结零触·Ban 弱化断言主体零改。

## §6 est live=0（起草 turn）+ EXEC 门预申明

- **起草 turn（本 commit）**：est live=**0**——零模型外呼零 Key 加载零生产操作零消耗（全部基线 run=纯本地 tsx/隔离 PG 容器用后即焚·本席 throwaway 容器已清）。
- **EXEC 期门预申明（授权后方可行）**：①件①②③④落码落臂；②§2 十一门全跑全落收据（EXIT 逐门入卷）；③`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改；④收据落点 `ai-docs/delivery/receipts/sse-api-family/`（00-exec.md+pre/post 断言清单对照+各门 EXIT 回执·count 纳 docs:check 面——余量 8 内 EXEC 自裁最小集·越即停上报）+harness 本卷推进注记（append-only）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 .md+EXEC 期四码文件+三 proof+收据）**五类标记词 grep 零命中**（起草席落卷时对本卷亲跑直证·回执随 EXEC 收据留痕·五类词面见 `i6-239-gates.proof.mjs` §2-7 运行时组装·不入卷防自指）。**承登（基线红如实）**：`i6-gates:prove` 的「改动集恰符」臂以 i6-239 历史刀申报清单为期望集·任何后继刀必红该臂=**协议形承登**（沿 queue-shutdown-phases §7 先例·非本刀引入）——本刀实质臂=改动集五类词面零命中+`est live=0`+⑤邻面零触+⑤零迁移+⑤SSOT 零触（本刀改动集口径）·全绿为门。

## §8 STOP（开工三条款 + 待双审/EXEC 裁决项）

**STOP · `executed:awaiting_post_prove_dual`（EXEC 落卷即停·post 双审两独立外席待开·alone≠dual·Ban self-approve·post BOTH PASS ≠ push·push 权归协调方·开工三条款已满足（pre-exec 双审 BOTH PASS 落卷+协调方 EXEC 授权+wave111 sanction 随 EXEC 落卷见 §9）·§1-修法定稿契约与 §5 Ban/pins 主体零改。）** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（含 §8 裁决行使落字·committed SHA 重钉）；③EXEC 立项**不得改 §1-修法定稿契约与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·含 §0.2 漂移复核与 §0.3 迁移号实占复核）。**裁决项（双审/协调方裁）**：⑴「非空断言」源级门形追认（vs 运行时形·§1.3-2 否决理由再核）；⑵#172 OR 分支（指标丢失率）择定追认（甲分支补写队列另刀登记·§1.3-1）；⑶五 service 值=注册表键逐字追认（vs 自造名·AG-19 单源理由再核）；⑷零迁移确认（§0.3）；⑸四行关闭效力归协调方确认（§3-7）。**停止条件（四类）**：**现场漂移**=届时 tip 对 §0.1 任一锚 blob/机制漂移（loseClient/waitFor 被他刀改/五站点被改/`sse-pump.ts` 被触）→停·重 pin 回炉；**机制不满足**=件①-④落位后 P-2d 补偿臂/attempts 臂/源级门臂不绿→停·如实升级协调方（Ban 就地改因 Ban 扩面修）；**越界需要**=任何迁移/业务语义/digest/告警域/共享 SSOT 改动诉求→停·另刀或 §8 裁决行使（Ban 就地修）；**验收红不可修**=门矩阵静态红（typecheck/docs:check>cap/lint 漂移/neg 超 ±2）且根因不在本刀交付面→停·如实登记（Ban 借机修）。

## §9 EXEC 记录（EXEC 席落卷·2026-10-16·授权链=pre-exec 双审会签 PASS（席1 agent_c02db93b+席2 agent_b985f5ca·P2 修订随 EXEC 落）→协调方 EXEC 授权→EXEC 首跑门 1 红停手上报→协调方 **wave111 sanction**（P-2a 窗勘正·语义升级定性·REQUEST 内部矛盾实证引）→复绿落卷·收据=`ai-docs/delivery/receipts/sse-api-family/00-exec.md`·est live=0·actualSpendCny=null·⛔push）

**序 1 并线**：merge `82318721` --no-ff 并 origin/feat/mysql-schema-skeleton@`3cd159dd`（届时 tip=派单下界「tip≥3cd159dd」以等号成立亲证·cap sanction 2192→**2200** 随并落 `public-text-policy.mjs` `:100`→`:102` MAX_FILES=2_200·零冲突·冲突沿并集解预置未触发·禁 pull --rebase 遵守）。

### 字段① 门矩阵十一门全表（EXIT 原值内嵌·终态复跑值）

| 门 | 结论 | 证据（EXIT 原值） |
|---|---|---|
| 1 sse-push 主门 | 绿 | `pnpm -w run sse-push:notify:prove` **EXIT=0·57 臂全 PASS**（=47 既有存活+P-2a 拆双臂 2+P-2d N1-N6 新 8·收据 `.tmp/isolated-proof-receipts/2026-10-16T14-16-40-*.json`）·首 ping 55ms<1000（唤醒兑现）+ping 间隔 max 1361ms≤2100（2s 封顶） |
| 2 sse 邻面 | 绿 | prove:sse-slot EXIT=0（5+1 429+shared bucket）·prove:s4b-delta-arm EXIT=0·prove:last-event-id EXIT=0 |
| 3 #172 主门 | 绿 | uc028 EXIT=0（CHECKS=45 FAIL=0）·prove:metrics EXIT=0（18 臂双跑） |
| 4 #14/#216 主门 | 绿 | ag19 EXIT=0（50 臂·源级门「生产 src `await invoke({` 恰 8 站点+逐站点含 `service:`+五值∈注册表」绿） |
| 5 worker 邻面 | 绿 | interview EXIT=0·adaptive-life EXIT=0（经隔离 wrapper `interview:prove`/`adaptive-life:prove` 行使·直连形 `database_target_missing` 裸 worktree 无隔离 target·沿 ssd 收据行使先例） |
| 6 neg 门 | 绿 | `neg:all` EXIT=0·六套 90/90/91/102/179/135 **恰等基线**（±2 熔断零行使） |
| 7 typecheck | 绿 | `pnpm turbo typecheck --force` EXIT=0·8/8·0 cached |
| 8 lint | 绿 | EXIT=0×4·root **5235**/api **1421**/worker **954**/ai-runtime **628** 四值恰等 pin 零漂 |
| 9 docs:check | 绿 | EXIT=0·**2186 ≤ cap 2200**（cap=`3cd159dd` sanction `:102`·本卷 .md+收据 1 已纳计数） |
| 10 markers | 绿 | 五类词面（i6-239 §2-7 组装形）+冲突标记对·改动集（9 码/proof+本卷 .md+收据）grep 零命中·est live=0 面零命中 |
| 11 diff 面 | 绿 | EXEC 落码面=**恰 9 tracked**（码 5+proof 4·P2-A 五码+四 proof 口径）+本卷 .md+收据 1·`sse-pump.ts`/`sse-registry.ts`/`prompts.ts`/rate-limit/drain-loop/worker main.ts/migrations/**/共享 SSOT 四卷零入 diff 机检亲证·`sse-pump.ts` 零字节 |
| 卫生 | 绿 | `pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT·隔离容器用后即焚·est live=0 |

### 字段② EXIT 原值（异常路径备查）

门 1 首跑 **EXIT=1**（P-2a 冻结臂红·停手上报·wave111 复绿后终态 EXIT=0）·门 1 二跑 EXIT=1（sanction 双臂形首版「次 ping≈2s」对 wake-每失败重连触发机制不成立 608ms 红·机制诚实形改写后 EXIT=0·见字段⑥）·余九门首跑即绿零 retry-to-green（断言红恰 1 attempt/形·基建红除外）。

### 字段③ 改前改后臂名清单 diff（sort|uniq 协议·分母=本树 merge 后改前 run @`82318721`）

- sse-push：pre 48 → post **57**·only-in-pre=47 臂+P-2a 旧窗臂（wave111 拆双臂承替）·only-in-post=**P-2d N1-N6 八臂+P-2a 双臂**·P-1 延迟臂同名（时延插值 15ms→11ms 非臂变更）。
- ag19：pre 47 → post **50**（+源级门 3 臂）·uc028：pre 40 → post **45**（+attempts 5 臂·序列 F1=1/F2a=1/F2b=1/F3=2/F5 仍=2）·metrics：pre 16 → post **18**（+常量名/零预填 2 臂）·四套既有臂零 diff。

### 字段④ diff numstat（EXEC turn 终态）

11 files：`sse-notify.service.ts` +6−0·`interview-service.ts` +3−0·`adaptive-interview-service.ts` +2−0·`invoke.ts` +1−0·`metrics.ts` +4−0·`sse-push-notify.proof.ts` +129−3（P-2d N1-N6 8 臂+P-2a 双臂改写）·`ag19-prompt-version.proof.ts` +39−1·`uc-e2e-028-nhp-fault.proof.ts` +10−0·`metrics.proof.ts` +6−0·本卷 .md（Status×3+§5 注记+§9）·收据 1 新增。`apps/web/tsconfig.tsbuildinfo`（typecheck 门跑动构建缓存）已还原不入 diff。

### 字段⑤ 重 pin 全表（对届时 tip `3cd159dd`/merge `82318721`·P2-C/P2-4 承载）

| 锚 | pin 值 | 漂 |
|---|---|---|
| §0.1 十二文件 blob | 全数恒等亲证（`655746c1`/`21f52b34`/`94eb93d5`/`4c963993`/`757d7f95`/`2320a0f2`/`c5a3d39e`/`899be6f2`/`1a5f5a6f`/`d8dfb822`/`4f082e77`/`a447b9f3`·行数同卷） | 无 |
| §1.2 八站点清点次锚 | **OCR=`resume-ocr.ts:133`**（卷面 :137 漂）·**route-classify=`job-route-classify.ts:164`**（卷面 :170 漂·service 字面 :170 在场）·诊断=`interview-service.ts:287-288`✓ | **P2-4 有漂·本字段承载** |
| §1-件② promptedModel 伴锚 | **adaptive `interviewer.ask`=`:561`**（卷面 :559 漂）·`:155/:248/:352/:328` ✓ | **P2-4 有漂·本字段承载** |
| cap 锚 | `public-text-policy.mjs` `:100`→**`:102`** MAX_FILES 2_192→**2_200**（`3cd159dd` sanction 落值） | sanction 随并·已同步 |
| §0.0 在飞计数 | worktree **57**（卷面 53）·obs-family 支 **5 commit**（diff 恰 1 `.md` 零交叠）·api-harden 支 **1 commit**（docs-only 零交叠）·sse 词面 worktree 恰 1 | **P2-C 有漂·本字段承载** |
| 次锚补登 | sse-pump waitMs 实锚 :172-174（卷面 :171-174 首 ±1）·invoke persistTraceBestEffort 实锚 :522-540（卷面 :522-545 尾 −5）·sse-push proof P-2b/G2/P-2c 臂块 ±4 平移（臂名全命中） | 登记不熔断 |
| P2-1 | `0e4f45a4` commit message 实存 1 处 U+200B（`(=​#216)` 位）·⛔amend 遵守原卷零洗·本注记为勘误承载 | 已承载 |

### 字段⑥ wave111 裁决处置（P-2a 窗勘正·语义升级定性）

1. **首跑红**：P-2a 冻结臂「首 ping ∈[1800,3600]」实测 62ms 红·机制链亲证=degraded 期 notify singleton 退避重试 establish→trigger 仍缺席→`loseClient('trigger_missing')`→件① wake→openSse 泵已注册等待者即醒→fetchMore+ping 提前——旧窗 ≥1800ms 下界编码的正是**修前无唤醒行为**。REQUEST 内部矛盾实证=同 run 件④ 自家新臂 `P-2d N4 trigger_missing 同醒` PASS 与冻结臂 P-2a FAIL 同场景反向（N4 必醒 vs P-2a 不早醒不可同时成立）·pre-exec 双审欠裁此交互。
2. **wave111 sanction 行使**：P-2a 拆双臂形（恰 `sse-push-notify.proof.ts` 1 文件）——臂一「首 ping<1000ms 唤醒即取数」（断言强度不降：上界由 ≥1800 收紧为 <1000·唤醒兑现）+臂二「退避节奏保持」。
3. **二跑红→机制诚实形**：sanction 首版「次 ping 间隔≈2s ∈[1800,3600]」实测 608ms 红——**第二处机制发现**=wake 在**每次失败重连**的 loseClient 均触发→退化态早段 ping 间隔=重连退避节奏（<2s·修法目标行为的组成部分·比 legacy 更快非更慢）→backoff 超 2s 后由 legacy 2s 计时器接管。按 sanction 语义目标（退避节奏保持=绝不 30s 兜底沉睡）落机制诚实形=「连续 ≥3 ping 间隔全程 ≤2100ms（唤醒驱动+2s 封顶·30s 兜底不可能绿）+max ≥1000（非热循环）」——反 30s 判别义与封顶纪律全保持·如实登记为对 sanction 臂二字面形的机制性修订（语义目标零偏）。
4. **复绿**：主门 EXIT=0·57 臂全 PASS（首 ping 55ms/间隔 max 1361ms）。

### 字段⑦ 偏离清单 + P2 承载 + pins 零翻声明

1. 字段⑥-3 sanction 臂二字面形→机制诚实形修订（608ms 实证驱动·语义目标零偏·如实登记非隐瞒）。
2. 门 5 行使形=隔离 wrapper（直连形裸 worktree 无 target 基建形·臂集同·沿 ssd 收据先例）·登记非偏离。
3. `tsconfig.tsbuildinfo` 构建缓存还原（门跑动副产物·零源面）·登记非偏离。
4. **P2 承载落点**：P2-A 五码+四 proof 口径=改动集逐字兑现·P2-B 新臂全「P-2d N1…」全串（既有 P-2d 健康翻转族 ：245/:531-544 零歧义）+收据归组单列·P2-C/ P2-4 =字段⑤·P2-1=字段⑤末行·P2-4 件① N3 措辞=件④-a N3 三臂按「补偿失败→泵 break 收尾→客户端 Last-Event-ID 重连重放（既有语义零改·零丢失）」落卷全绿（sse-pump `:195-196` `catch(() => null)→break` 机制本体亲证）。
5. **pins 零翻声明**：§5 pins 十一值+刀专项钉值主体零翻（唯一例外=wave111 sanction 明示的 P-2a 臂形·§5 注记承载）·§1-修法定稿契约零改· Ban 列表主体零改·迁移=**0** 实证（`ls packages/db/migrations` 链顶 0204 零增）·est live=0·共享 SSOT 零改·行关闭效力归协调方未宣称。

### §9-补 post 双审 P2 随卷注记（2026-10-16 nail 席·post 双审会签 PASS 授权（席1 agent_5f69567e+席2 重派 agent_ac102b74）·append 注记形·§0-§9 上文零字节洗改·四件）

- **注记一（席2 P2-a：docs:check 计数勘记 2186→2187）**：本卷 §9 门 9 行与收据 `ai-docs/delivery/receipts/sse-api-family/00-exec.md` 门 9 行所载「2186 ≤ cap 2200」系**卷面笔误**（少计收据受管件 1 件）——EXEC commit 词面「docs:check 2187≤2200」与机检谱系一致：managed 计数谱系=merge-base `3cd159dd` 树 **2185**（ls-tree 亲证）→本支恰 +2 受管新件（本卷 .md+收据 `00-exec.md`）→`9af6bb99` 树 **2187**（ls-tree 亲证）·本 nail 席逐锚复证。cap 判定语义不变（2187≤2200·余 13）·门绿结论不变（勘记仅计数词面 2186→2187）。
- **注记二（席2 P2-b：卷尾注双 STOP 词面注记）**：本卷尾注词面含**两处 STOP token**——前「**STOP=`draft:awaiting_pre_exec_dual`**」=起草期史录（append 形制不洗史）·尾「**STOP=`executed:awaiting_post_prove_dual`（三处同步：Status/§8/footer）**」=权威现值——双词面=史录+现值并存·非状态矛盾非双头·权威值以后者为准（与 Status 行 `:3`/§8 `:137` 同值三处同步）·后继席读卷以现值为准勿以史录词面误判。
- **注记三（席2 P2-c：metrics proof 臂名措辞勘记）**：件④ 新增 metrics.proof.ts 两臂之臂名词面勘记——臂名「registerBaselineMetrics **零预填** ai_trace_persist_attempts_total（开机即有序列·丢失率分母告警不空）」之「零预填」指**修复前缺陷**（attempts 序列此前缺失=丢失率 `failures/attempts` 分母空·告警无从评估）·非断言「基线无序列」：断言实为基线文本含 `ai_trace_persist_attempts_total 0`（开机即注册 0 值序列·failures 分子邻位同值）——臂义全读=「零预填缺陷修复后开机即有序列」·断言语义零改·仅词面读向勘记。
- **注记四（席2 P2-d：commit 锚漂登记）**：本卷 §0 blob 锚（§0.1 表 @`935899f1` 起草亲算·EXEC `82318721` 并线后重 pin）对并线后主线树（本 nail `51a06265`）复证**九锚文件 blob 全 SAME**（`sse-notify.service.ts`/`interview-service.ts`/`adaptive-interview-service.ts`/`invoke.ts`/`metrics.ts`/`metrics.proof.ts`/`ag19-prompt-version.proof.ts`/`sse-push-notify.proof.ts`/`uc-e2e-028-nhp-fault.proof.ts` 逐一 `git rev-parse <tip>:<path>` 双向恒等本席亲证）——锚漂仅在 commit 引用面（base `3cd159dd`→主线已前移 `a9a8dcd9`→本 nail 三 merge `dda107d0`/`9b2b508b`/`51a06265`）·blob 面零漂·重 pin 义务已了·后继席无需再重 pin。

---

*nail 落卷 2026-10-16·post 双审会签 PASS（席1 agent_5f69567e+席2 重派 agent_ac102b74）后协调方派单 nail（本波唯一主线推送席·随 API-HARDEN nail 波顺携并线）·序1 merge --no-ff line/sse-api-family@`9af6bb99` 入主线（merge `9b2b508b` 零冲突 11 files +450/−4·merge-tree 预演 EXIT=0·merge-base `3cd159dd` 亲证·⛔pull --rebase 未用）∥序2 本卷 §9-补 post P2 随卷四件（append 注记形上文零洗=docs 计数 2186→2187 勘记+卷尾双 STOP 词面注记+metrics 臂名措辞勘记+commit 锚漂登记九锚 blob 全 SAME）∥序3 SSOT 三处随卷（LEDGER 刀位图 5C-SSE-API 子刀行+配套管线 sse-api-family nail 行+checklist「Line sse-api-family nail」段·支线树内改主仓路径文件随支线推·⛔主仓单独 commit 未犯）∥P-2a wave111 sanction（语义升级·P-2a 拆双臂）随并落主线·判别 run 与 LIVE 行使权归协调方（两票分立）·est live=0·actualSpendCny=null·⛔force push 未用·⛔pull --rebase 未用*

---

*SSE-API-FAMILY REQUEST · 2026-10-16 起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`935899f1`（origin tip 亲证） · 分支 `line/sse-api-family` · 工作树 `meetwise-sse` · 承接=5C 拆刀排程第三发（QUEUE=Q1 已 EXEC✓@`2717e5e7` 波·OBS 起草中 @`b2a05e8e`·API-HARDEN 另席并行 @`935899f1`=0 commit）· 蓝本=LEDGER :87 组标签两段+issues-master 四行原文（:263/:366/:429/:417·组标签「第5批-C 可靠性/运维/API」同锚）+queue-shutdown-phases-REQUEST 形制（§0-§8 全） · 四件=#139 掉线唤醒+补偿拉取（件① wakeAllWaiters）/ #14 四站点+#216 押题 service 补全（件② 恰 5 行+源级门）/ #172 丢失率分母（件③ attempts_total）/ proof 三件随刀（件④ P-2d+ag19 源级门+uc028 F 臂） · 诊断定稿=量级可控 ≤1 天→一刀四件不拆（沿 obs-family 同形裁决）· 零迁移·零业务行为变更（纯观测面+掉线唤醒）· 基线全绿在卷（§1.4·非复绿刀）· est live=0 · pins 照抄零翻 · markers=0（恰符臂协议形承登） · ⛔push · ⛔merge主线 · Dual PASS ≠ 开工 · alone≠dual · ** STOP=`executed:awaiting_post_prove_dual`（三处同步：Status/§8/footer）**
