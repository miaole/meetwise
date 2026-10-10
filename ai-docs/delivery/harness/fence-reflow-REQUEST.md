# FENCE-REFLOW — #241+#238（+#253·新-#274）+#243 围栏回流刀（审计批 1·P1 · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（本 REQUEST 只送审 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 自动开工 · 须 meetwise 明示授权才进 EXEC）
**Date**: 2026-10-10
**Base**: `origin/feat/mysql-schema-skeleton` @`f47670e6` · 分支 `line/fence-reflow`（工作树 `/Users/miaole/Desktop/golucky/meetwise-line-fencereflow`）
**Base-rev2 追加（rebase 前置）**: **EXEC 前先 rebase 至 `origin/feat/mysql-schema-skeleton` 现 tip `6a7a3acc+`**；post-rebase 必重验 worker main.ts（席1 实测区间 `f47670e6..6a7a3acc` :177 块净 +7 行·§0-2 `:712` 预期漂移须复测）、root package.json（区间 :99 净 +1 行·§4-1 `:203` 预期漂移须复测）及 §0 全锚。席1 亲证结论（`git diff --stat f47670e6..6a7a3acc`：107 files +7205/-251）：**区间变更面与本刀 C1-C11 码改面交集=0·预期干净重放**；如实登记两处锚引文件在区间内有改但均不在锚行本体——`apps/worker/src/main.ts`（#204 growth-gen 接线）与 `packages/db/src/index.ts`（`:388` 起 growth-generation 导出·C5 所引 `:70` commerce 导出面零触）；0076/0058/0059/0062 迁移零触。
**蓝本**: fix-roadmap `:63` 原文（「create 复用查询加 `interview_privacy_active` 过滤；遇未结束面试给『继续/放弃后重来』；……对账把围栏面试回收与 `settleOutbox` 拆开（只释放不写事件），连续失败打错误日志并计数告警；存量用一次性运维脚本修复；#253（回收空壳）同 PR；#243（410 映射一句中文文案、SSE 410 不重连直接给出口，复用第 0 批 actionErrorMessage）……先上 #238 而不带 #241 会把用户引向已围栏面试 → 410，故不得拆开上线」）+ issues-master #241(`:196`)/#238(`:313`)/#253(`:437`)/#243(`:322`) 行 + 协调方 LEDGER rev2 追加**新-#274**指令 + 协调方审计定谳誊录。**唯一蓝本，逐条忠实，禁自由发挥。**
**Honesty**: 本档全部 file:line 锚点在 `line/fence-reflow` @`f47670e6` 实树亲读验证（interview.service/commerce.ts/commerce-reconcile.ts/worker main、0058/0059/0062/0076 围栏迁移、web action-error/actions/page/sse-cursor/interview-stream/view-model、privacy 页两文件、product-campaign-EXECUTION-SOP、NORTH-STAR §1 pins、上游审计 fix-roadmap.md/issues-master.md——行号错=审席 FAIL）；审计引行号漂±逐条登记于 §0。

---

## §0 立靶

**批 1 定位（上游事实源）**：`product-campaign-EXECUTION-SOP.md:16`（#241+#238 围栏回流=首批主攻）·`:26`（W1 主路径：「#241+#238+#243（同 PR）」）·`:49`（批 1 验收：「#241 围栏后 create 返新面试」）· fix-roadmap `:63`（同 PR 令+不得拆开上线）·`:72`（#241 验收三条原文）。

**审计定谳（亲验后誊录）+ 机制链亲验 @`f47670e6`**：

1. **#241（P1 隐私门卡路径）**：隐私页删除预览能把一场面试永久围栏，之后 C 端练习面试无法再新建（create 复用查询不排除围栏面试→用户永久 410）。机制链亲验：围栏=privacy_checkpoint_target × privacy_erasure_request 七状态判定（0058 `:47-54`；0076 `:88-115` v2 增 `authorization_paused` `:109`〔rev2 勘误：原引 `:107` 系漂移·亲读 0076 `:109`=`r.status IN ('requested','fenced','purging','pending_external','completed','partial_failed','authorization_paused')` 判定行·正为 `:109`〕；audit 更正注：「0076 的状态=CHECK 全集，全仓无解除路径」）；`guardInterviewPrivacy` interview.service.ts `:151-162` 对围栏抛 410 `interview_privacy_fenced`（`:158-159`）；而 **create() 复用查询 `:531-532` 无 `interview_privacy_active` 过滤**——`SELECT id, status FROM interview WHERE status NOT IN ('completed','abandoned','failed') ORDER BY id DESC LIMIT 1`（对照同文件 list() `:573-574` 已带 `interview_privacy_active(i.id)`）→ 围栏尸被当「进行中」复用 → begin/abandon 全 410 → C 端永久无法新建。审计引 `:513-527`/更正注 `:519-521` → 现树 create=`:525-538`/复用查询=`:531-532`，**漂 +12/+10 登记**。
2. **#238（P2·与 #241 同 PR）**：对账把围栏面试回收与 settleOutbox 拆开（只释放不写事件），连续失败打错误日志计数告警。机制链亲验：`reconcileOwner`（apps/worker/src/commerce-reconcile.ts `:25-72`）单 `asPrincipal` 事务 = `reconcile()`（`:27`；packages/db/src/commerce.ts `:384-388` 耦合 `sweepExpiredReservations` `:341-356` + `settleOutbox` `:363-380`）→ swept 逐条业务写 `:36-69`（`appendEvent('interview_unavailable')` `:65` 等）→ **0059 `:96-99` interview_event 写护栏〔rev3 勘误：原引 `:95-98`·亲读 0059 `:96`=DROP TRIGGER·`:97-99`=CREATE TRIGGER interview_event_privacy_projection_write_guard（BEFORE INSERT OR UPDATE + EXECUTE）·正为 `:96-99`〕 + 0062 `:59-61` RLS WITH CHECK 对围栏流 RAISE `interview_privacy_fenced`（0062 RAISE 实位 `:74-77`·原引 :71-74 漂+3 登记）** → 整事务 ROLLBACK（释放+结算入账全丢）→ 每 30s（`runCommerceReconciler` `:95-98`）同拍重演；`commerceReconcileTick` `:75-93` 吞错仅 `console.error`（`:88-90`）；worker main.ts `:690` 接线 + `:712` `commerceLoop.ready()` 恒绿〔rev2 勘误：原引 `:706-708` 实为 gaugeLoop 块·亲读正为 `:712`（workerReady 就绪链内 `commerceLoop.ready()`）〕 → 无告警（audit 原文「每 30s 重试仅打日志，就绪检查保持绿」）。审计引 `:21-67,76-92` → 现树 `:25-72,:75-93`，**漂 +4/+1 登记**。
3. **#253（P3·同 PR）**：回收空壳。亲验：create `:534-535` 先落 `'created'` 空壳 → begin 402/非 2xx 失败（interviews/actions.ts `:19-27`·create:13·begin:18·402:19·401:20·非2xx:21-27·码解析:24-26·全长30行）→ 壳残留 → 列表页 `:118-123` `isInterviewEnterable('created')`（lib/interview/progress.ts `:32-34`）→「进入 →」→ 幽灵场次。
4. **#243（P2·提到本批同 PR）**：410 映射一句中文文案、SSE 410 不重连直接给出口。亲验：action-error.ts（ERRMSG-MAP 已落）**无 410 行** → begin 410 body 码 `interview_privacy_fenced` → `actionErrorMessage` 返 null → interviews/actions.ts `:24-26`（漂修正） 落 `begin_failed` 兜底「启动面试失败（未预留额度）,请稍后重试…」（action-error.ts `:49`·漂+1 登记）——永久围栏给重试指引=教用户白点；SSE 面：代理 `apps/web/app/api/interview/[id]/events/route.ts:61` → `sseProxyFailureResponse`（sse-cursor.ts `:60-69`·非 400 原样透传 410 状态）→ `iterateSseBody` `:47-55` 只特判 400（`:42-45`）→ 410=空结束 → 驱动重连（interview-stream.ts `:30-31` max=3/maxTotal=100 · `:96-98` 耗尽 degraded）→ view-model.ts `:35/:40` 泛化「网络中断/练习连接已停止」无围栏出口。audit 更正注核实：非死循环，重连有界（≤3 次）后降级。
5. **新-#274（协调方 LEDGER rev2 追加·亲验成立）**：create 复用查询 `:531-532` 不区分 `application_id`——B 端岗位绑定面试（recruiter.ts `:446` 直插·audit #241 更正注①引）同为非终态时会被 C 端练习 create 捞走。并入 F1 同查询面。

**与 UNSTUB-ERASE 落线后的现状对账 —— #242 面作废登记**：亲读隐私页现状——`PreviewErasureForm.tsx:52-60` 范围下拉只剩 `account_data`（`:58`）/`resume_data`（`:59`）两项，**无「一份面试（interview_data）」选项**；`:62` `subjectId` 为 hidden 空值；`privacy/page.tsx:57` 文案明示「单份简历删除在简历页、账户注销在设置页受理」；git 主线 `f9383f76`（UNSTUB-ERASE S1 EXEC）commit 明载「**#242 隐私页瘦身（PreviewErasureForm 摘除「一份面试」误围栏触发点）**」。→ **#242 面作废登记：本刀隐私页零改动**。残留如实登记：API 面 `/privacy/erasure-preview` 仍受 `interview_data`+subjectId（privacy.service.ts `:135-140`；UI 入口已闭、触发需手填完整面试 id——audit #241 更正注②同判：误触概率低，且 F1 create 过滤后即使再发生也不再卡死 create）；该面归 W5 D6 域另管（§2-3）。

## §1 范围（六件·同 PR）

**F1 create 三过滤=既有 status NOT IN+新 interview_privacy_active+新 application_id IS NULL（禁加 resume/任何第三谓词——破 :523 单会话幂等立法）·不得拆开上线

**F2 遇未结束面试给「继续/放弃后重来」（#238 C 面·fix-roadmap 批 1 验收「有未结束面试时点『开始新面试』出现选择，而不是『请稍后重试』」）**：create 返回 `reused=true` 时 startInterviewAction 透传信号 → /interviews 页渲染选择面（继续=进既有会话；放弃后重来=POST `:id/abandon` 后重跑 create+begin）。文案沿 errmsg-map 家族 `BINDING_CONFLICT_TEXT`（action-error.ts `:36`「你有一场未结束的面试：继续/放弃后重来」〔rev2 勘误：原引 `:34`·亲读正为 `:36`〕）——**不新增第三文案**。交互形 EXEC 审定（banner/确认层），契约=`reused` 必达页面+两出口可达；无未结束面试时行为 byte 级不变。

**F3 对账拆分——定谳形 A（围栏先检分支·单事务保持）五钉：(i) commerce.ts/index.ts 零改；(ii) 先检=SELECT 布尔 interview_privacy_active($1)·禁 assertInterviewPrivacyActive（其 RAISE 即毒化）；(iii) 围栏跳过=两分支全跳（B 端 :46-49 块同跳）；(iv) 围栏跳过不计连续失败计数（fence-skip=正常出口·skip 判据=围栏谓词·禁 catch-all 吞咽）；(v) ReconcileOutcome 增 fencedSkipped 计数。**rev2 审计对齐定谳（席1 读码后裁：保持形 A·不改单笔隔离事务·等价性论证登记）**：审计第五章建议 2 原文=「围栏面试走独立“只释放额度、不写事件”分支，按单笔隔离事务，避免一笔失败毒化同用户整批对账；连续失败打错误日志并计数告警」（product-audit-report.md §5.2 第 2 条·亲读）。①毒化源唯一=围栏行业务写撞 0059 `:95-98`/0062 `:74-77` RAISE → 整 owner 事务回滚；(ii)+(iii) 落地后围栏行零 DML·无 RAISE 可达·「一笔失败毒化整批」对围栏行**结构不可达**=审计防毒化意图全数兑现；②「单笔隔离」字面落地须把释放从 `reconcile()` 耦合 sweep（commerce.ts `:341-356`+`:384-388`·owner 单事务内先 sweep 释放后消费）拆出另立事务→违 (i) commerce.ts 零改 / C5 已裁「本文件零改」/ §2-7 saga byte 级不动三重既有立法，且围栏行到消费环（commerce-reconcile.ts `:36-69`）时释放已由 sweep 完成·本无「只释放」独立事务可包；③语义等价：形 A 围栏分支=「只释放（sweep 已释放）·不写事件（两分支全跳）」=审计分支语义逐字兑现·仅事务边界异。残留如实登记：非围栏行失败仍回滚 owner 批（现状行为·审计围栏分支域外·C4「非围栏路径 byte 级不变」保护）

**F4 ops/recovery/ 存量修复脚本：(i) dry-run 默认+--apply 幂等；(ii) 每条 SELECT/UPDATE 强制 application_id IS NULL 谓词+dry-run 报 B 端围栏跳过计数；(iii) 关终态 guard 钉 status IN (created/active/waiting_user)（=abandonInterviewAndRelease :297 同枚举·二跑 0 行）；(iv) principal=逐 owner asPrincipal(app_role)·禁 superuser/privacy_api_owner 旁路；(v) 导出 dryRun/apply 供 prove import

**F5 空壳回收（best-effort：abandon 非 2xx 不阻塞带码 redirect·不重试）（#253）**：begin 非 2xx（401 跳登录除外）→ 回收空壳（POST `:id/abandon`·`'created'` 无消费走 commerce.ts `:274-277` NOT EXISTS 分支→`'abandoned'`·列表 `:120` 显示「已结束」）→ 再 redirect 带码。审计两 option「begin 成功再落壳，或失败回收空壳」→ EXEC 择**失败回收**（begin 需 interview id 先存在，「成功再落壳」在现行 API 形下不可行·如实登记）；402 壳与确定性失败壳同覆盖。

**F6 #243：410 一句文案 + SSE 410 不复连直接出口**：action-error.ts 增 410 行——`interview_privacy_fenced` → **「该面试已进入数据删除流程，请新建面试」**（审计第五章 §5.2 建议 3 原文逐字·product-audit-report.md §5.2 第 3 条亲读佐证；issues-master #243 旧引无「数据」二字·以审计更正版为准·interviews 页域）；interviews/actions.ts 现有码解析（`:24-26`·漂修正）自动直达（映射命中→不再落 begin_failed 兜底）。SSE：iterateSseBody/驱动新增 fence 停转通道（**沿 `InvalidLastEventIdError` 先例** sse-cursor.ts `:13-29`、`:42-45` 增 410）→ 驱动 catch 分支（interview-stream.ts `:77-84`）停转**不重连** → view-model 围栏出口（同一句话·复用 `:40` degraded 出口形）；代理 `sseProxyFailureResponse :60-69` 已原样透传 410·零改。#243 复用第 0 批 actionErrorMessage（fix-roadmap `:63` 原文）。

## §2 非范围

1. **#247/#236 账户级删除已另刀**（UNSTUB-ERASE S1 已落 `f9383f76`·W5 续作）；删除授权/围栏建立语义零触。
2. **零迁移**：本刀零 schema 变更；围栏立法（0058/0059/0062/0076）零字节。唯一例外=运维脚本实证需索引时按 expand-only 0152+ 另批（预期不需要）。
3. **API interview_data scope 面零触**（privacy.service.ts `:135-140`·W5 D6 域）；#242 面作废（§0·隐私页零改）。
4. **#59/#88 统一信封/message 改造零触**（issues-master #243 修法明示「信封加 message 不在本条做」）；InterviewPanel.tsx `:205` toast 面零触。
5. **quiz/diagnosis SSE 流不扩**（#243 审计域=interview 流；useQuizStream/useDiagnosisStream 零改）。
6. **B 端面零触**：recruiter 启动/岗位面试写面零字节（audit #241 更正注①「B 端投递不受影响」）；`application_id` 只加读过滤（F1）零写。
7. **commerce saga 语义零改**：reserve/confirm/release/`abandonInterviewAndRelease` 既有路径 byte 级不动（F3 只改 swept 消费方的围栏分支·F5 只新增 action 侧调用既有 abandon 端点）。
8. **SSOT 零触**：CLAUDE.md/backlog/coverage matrix/SOP/NORTH-STAR §1 pins 行零改。

## §3 清单（file:line 现状→目标·全数亲读 @`f47670e6`）

| # | 码面 | 现状（亲读） | 目标 |
|---|---|---|---|
| C1 | `apps/api/src/modules/interview/interview.service.ts:525-538`（复用查询 `:531-532`） | 三无过滤：无 `interview_privacy_active`·无 `application_id IS NULL`（audit 引 :513-527 漂 +12） | F1 两谓词；注释登记漂移与新-#274；create 其余零改 |
| C2 | `apps/web/app/interviews/actions.ts:10-30（create:13·begin:18·402:19·401:20·非2xx:21-27·码解析:24-26·全长30行登记）` | create→盲 begin→402/失败重定向带码（`:24-26` 码解析已接 errmsg-map） | F2 `reused` 透传；F5 begin 非 2xx（401 除外）→先 POST abandon 回收空壳→再带码 redirect；402 分支码面不变 |
| C3 | `apps/web/app/interviews/page.tsx:100-123` | 列表按钮面（`:118-123` 查看/进入/已结束） | F2 选择面渲染（继续=进既有会话·放弃后重来=abandon+重开）；文案 `:34` 家族不新增 |
| C4 | `apps/worker/src/commerce-reconcile.ts:25-72,:75-93` | 单事务耦合：sweep+settle+业务写同事务（`:27,:36-69`）·吞错仅 console.error（`:88-90`） | F3 围栏分支（定谳形 A（见 F3 五钉））+连续失败计数+error 级日志；非围栏路径 byte 级不变 |
| C5 | `packages/db/src/commerce.ts:341-356,:363-380,:384-388`（+`src/index.ts:70` 导出面） | `reconcile()` 耦合 sweep+settleOutbox | 择型 A：本文件零改；（已裁形 A·本文件零改） |
| C6 | `apps/web/lib/errors/action-error.ts`（无 410 行） | `interview_privacy_fenced`→null→begin_failed 兜底 | F6 410 行（interviews 页域·文案逐字「该面试已进入数据删除流程，请新建面试」·rev2 随 F6 改字）；既有行零改 |
| C7 | `apps/web/lib/stream/sse-cursor.ts:42-55,:60-69` | 只特判 400（`:42-45`）；410 随「空结束」透传 | F6 410 fence 停转通道（沿 `InvalidLastEventIdError` 先例）；`sseProxyFailureResponse` 零改 |
| C8 | `apps/web/lib/stream/interview-stream.ts:30-31,:77-84,:96-98` + `apps/web/lib/hooks/useInterviewStream.ts:19` | 410 当普通断流重连≤3 次后 degraded | 驱动 catch 分支对 fence 错停转不重连直接出口；`:19` 注释同步 |
| C9 | `apps/web/lib/view-model.ts:34-47`（+interview-state 视需要） | 泛化「网络中断/练习连接已停止」无围栏文案 | 围栏出口 view（一句话·复用 `:40` degraded 出口形）；其余 face 零改 |
| C10 | `ops/recovery/fence-reflow-repair.*`（新目录新文件） | 无 | F4：dry-run 默认+`--apply`+幂等；样例输出在卷；零产品面引用 |
| C11 | `apps/web/test/web-logic.proof.ts`（新 section）+ `apps/worker/test/commerce-reconcile.proof.ts`（增围栏场景）〔rev3 同步增行：+ `apps/api/test/privacy-erasure-http.proof.ts`（增「create 三过滤」section·P1 落槽）+ `apps/web/test/interviews-actions.proof.ts`（具名新 proof·P2 F5 落槽）+ `apps/worker/test/fence-reflow-repair.proof.ts`（具名新 proof·P3 C10 prove 导入方）〕 | 既有断言面 | §4 断言矩阵；既有 section 零删改 |

## §4（补强：①围栏行零 interview_event 写+interview 保持非终态断言；②F6 fence 判据=status 410 状态基非 body 码基·sse 代理 :60-69 换 body） prove

1. **对账拆分（`commerce-reconcile:prove`·隔离库·根 package.json:203）**：构造围栏面试（fence 锚落库）+挂死预留+同户另一笔 pending outbox → 一拍后断言：`settlement_ledger` 行落 + outbox `relayed`（**同户 pending 结算对账入账成功**）；该预留 `released`；**无 `interview_privacy_fenced` 循环报错**（重复 error 计数=0）；非围栏对照 swept 行为 byte 级不变（终态+事件照发）。〔rev3 P4 落卷·§4 标题承诺①②补齐正文〕**围栏行 interview_event 增量=0**（对账拍前后围栏 stream_key 的 interview_event 计数差=0·定谳形 A 两分支全跳零事件写）；**围栏 interview 保持非终态**（status 不被置 abandoned/failed·围栏分支零 DML）。〔rev3 P3 落卷〕**B 端围栏行（`application_id≠NULL`）同跳断言**：零 `assessment_unavailable` 事件（B 端 `:46-49` 块同跳·`appendEvent` `:49` 不触发）+ application 零翻转（`markApplicationAssessmentUnavailable` `:47` 不触·application status 不变）+ 预留 released（sweep `:27` 内已释放·围栏跳过不回滚释放）。
2. **create 三过滤**：围栏非终态面试存在 → create 返回新面试（`reused=false`·新 id）；岗位绑定面试（`application_id≠NULL` 非终态）存在 → C 端 create 仍新建（**新-#274 断言**）；正常未结束练习面试 → 仍复用（`reused=true` 不回归）；并发 advisory 锁面原样（〔rev3 N2 落名〕begin 锁=**`uc-e2e-001-nhp-bound.proof.ts:74-87` 静态断言**（`pg_advisory_xact_lock[begin,id]` lineOf 锚族·原样绿）；create iv-create 锁（interview.service.ts `:530` `[owner,'iv-create']`）**现无 proof 覆盖**——如实改口径并列 prove 补测项：增同款静态 lineOf 断言入本刀 prove 清单）。〔rev3 P1 落槽具名·二择一写死〕四条断言落槽=**`apps/api/test/privacy-erasure-http.proof.ts` 增「create 三过滤」section**（围栏 fixture 已在卷 `:233-247`/:267·跑法 `pnpm privacy-erasure:http:prove`；备选 `uc-e2e-018-user-abandon-http.proof.ts:175` H3 复用面扩展**不取**——H3 无围栏 fixture 须自建全链·弃）：①fenced interview 不被复用返回（create 新 id≠围栏 id·`reused=false`）；②list 一致（list 未结束集合不含围栏 id·与 create 同过滤面）；③guard 410 保留（直连围栏 id begin 仍 410 `interview_privacy_fenced`·guard 路径零回归）；④`application_id IS NULL`（B 端绑定面试不被 C 端 create 捞走=新-#274 落断言）。
3. **web-logic proof 新 section（`pnpm web:prove`）**：`actionErrorMessage('interviews',410,'interview_privacy_fenced')` 文案逐字断言（=「该面试已进入数据删除流程，请新建面试」·rev2 随 F6 改字）；410 不再落 begin_failed 兜底（映射命中断言）；驱动注入 410 open → **0 次重连**+围栏出口 view 断言（停转·不 sleep 重连·沿 HC-GAP-014 注入先例）；既有 section 零删改。
4. **运维脚本**：dry-run 样例输出在卷（SELECT-only 零写断言）；`--apply` 释放+关终态断言+幂等（二跑零变更）；围栏账本（privacy_erasure_request/privacy_checkpoint_target）零触断言。〔rev3 P3 落卷·C10 工具面具名〕**运行命令形**：dry-run 默认 `pnpm exec tsx ops/recovery/fence-reflow-repair.ts`（零写）；实跑 `pnpm exec tsx ops/recovery/fence-reflow-repair.ts --apply`（幂等·二跑 0 行）；`DATABASE_URL` 指向目标库（先隔离库实证再生产）。**prove 导入方**：具名新 proof `apps/worker/test/fence-reflow-repair.proof.ts` `import { dryRun, apply } from '../../../ops/recovery/fence-reflow-repair.ts'`（F4(v)·dry-run 样例输出+`--apply` 释放/关终态/幂等断言在此跑）。**F4(ii) B 端跳过计数断言**：fixture 含 B 端围栏行（`application_id≠NULL`）→ dry-run 输出 B 端围栏跳过计数≥1（逐行可核·`--apply` 同跳零写该行）。**F4(iv) asPrincipal 禁旁路验收形**：静态断言（沿 `uc-e2e-001-nhp-bound.proof.ts:74-87` lineOf 先例）——逐 owner `asPrincipal`(app_role) 连接锚在位 + 脚本全文 grep `privacy_api_owner`/`superuser`/`SET ROLE` 旁路字样=0。
5. **门清单**：一次过 Ban retry-to-green（attempts 全账入收据）·冲突标记门（push 前 `grep '^<<<<<<< \|^=======$\|^>>>>>>> '` 全仓=0）·邻接 `privacy-erasure-http.proof`/`unstube-erase.proof` **既有断言零删改**·全量绿（410 语义零回归）〔rev3 勘误：原措辞「原样绿」——P1/P2 落槽后 privacy-erasure-http.proof.ts/web-logic.proof.ts 增新 section·措辞收窄为「既有断言零删改」以保精确〕·est live=0·零外呼零消耗·收据 `ai-docs/delivery/receipts/fence-reflow/`。
6. **〔rev3 P2 落卷·F2/F5 断言补齐（append-only 追加）〕**：**F2 契约断言**（落 `apps/web/test/web-logic.proof.ts` 新 section「F2 选择面契约」·纯函数断言沿 `:793` ERRMSG-MAP「纯函数输出断言·非浏览器 DOM 证明」先例）：①`reused=true` → 选择面视图态必达（选择面缺失=断言失败）；②两出口可达（继续=进既有会话；放弃后重来=POST `:id/abandon` 后重跑 create+begin·两路径各自可达断言）；③文案=BINDING_CONFLICT 家族「你有一场未结束的面试：继续/放弃后重来」（action-error.ts `:36`·不新增第三文案）；④无未结束面试（`reused=false`）→ 输出与现行为逐字段一致（byte 级不变断言）。**F5 断言**（落具名新 proof `apps/web/test/interviews-actions.proof.ts`·mock fetch+redirect 形·跑法 `pnpm -C apps/web exec tsx test/interviews-actions.proof.ts`，或挂 `prove:interviews-actions` 入 `web:prove` 家族）：①begin 非 2xx（401 除外）→ 恰好一次 POST `:id/abandon`（fetch spy 调用数=1）；②abandon 非 2xx → redirect 仍带原 begin 错误码（不阻塞·best-effort 兑现）；③402 壳覆盖：create 落壳 → begin 402 → abandon → 壳 status=`'abandoned'`（`isInterviewEnterable('abandoned')`=false·列表「已结束」）；④不重试（零 retry 循环·带码 redirect 必达一次）。

## §5 Ban（全列）

1. **Ban self-approve** · **alone≠dual**：本 REQUEST 只送 pre-exec 双审，Dual PASS ≠ 开工。
2. **Ban 动 0058/0076 立法**：`interview_privacy_active`/`assert_interview_privacy_active` 函数、围栏状态集（含 0076 `authorization_paused`）、0059/0062 写护栏与 RLS 全部零字节（只作谓词消费）。
3. **Ban 删除既有围栏数据**：`privacy_erasure_request`/`privacy_checkpoint_target`/围栏墓碑与 checkpoint 账零触；本刀（含 ops 脚本）只释放额度+关终态，物理数据零删。
4. **Ban 围栏解除出口新增**：全仓无解除路径=0076 立法现状（audit 更正注亲验）；本刀不建任何解除/复活面。
5. **Ban retry-to-green**：prove EXIT=0 一次过，attempts 全账如实。
6. **Ban apps/api 信封/message 改造**：#59/#88 另刀；InterviewPanel toast 面零触。
7. **Ban B 端/岗位写面触碰**：`application_id` 只读过滤（F1）；recruiter 面零字节。
8. **Ban SSOT 触碰**：CLAUDE.md/backlog/coverage matrix/SOP/NORTH-STAR §1 零改。
9. **Key name-only**：零 Key 触碰零 live（est live=0）·零 secrets/.env 入库。

## §6 pins（十一值照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=202 软删受理(purge_pending)（UNSTUB-ERASE supersession 现行值·39 文件 pin 头已翻 `c9200502`·NORTH-STAR §1「503」行归 nail 期翻转·本刀沿现行值不改口） · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼·零消耗）

## §7 Non-claims

create 过滤 ≠ 围栏面试被清除（物理数据仍在·软删受理语义·UNSTUB-ERASE S1 口径）≠ 围栏可解除；对账拆分 ≠ 结算 SLO/到账承诺，计数告警 ≠ 告警系统建成（error 日志+计数·ready() 语义零改≠健康宣称）；运维脚本 = 一次性修复工具 ≠ 产品功能 ≠ 常态运维面，dry-run ≠ 已修复；410 文案 ≠ 删除流程已完成（purgePending 恒真直至 S2 逐 sink 回执闭合·`productionSloClaimed=false` 口径继承）≠ 删除进度可查询；410 文案 ≠ 信封统一（#59/#88 泛化 toast/信封残留如实·本刀零触）；F5 空壳回收（best-effort：abandon 非 2xx 不阻塞带码 redirect·不重试） ≠ begin 失败根因修复（402 额度不足根因零触·只是不残留幽灵壳）；F2 选择面 ≠ 多岗位并行练习（#238 修法=「继续/放弃后重来」二出口·并行多开仍非目标）；SSE 410 出口 ≠ quiz/diagnosis 流同款（§2-5 残留）；本 REQUEST ≠ EXEC 编码授权；`actualSpendCny=null`。

## §8 STOP

**STOP · `awaiting_pre_exec_dual` · alone≠dual。** REQUEST 写完即停零码动；EXEC 须双审 PASS + meetwise 明示授权；Ban self-approve；Ban retry-to-green。

---

*FENCE-REFLOW EXEC REQUEST · 2026-10-10 · draft:awaiting_pre_exec_dual · base `origin/feat/mysql-schema-skeleton` @`f47670e6` · 分支 `line/fence-reflow` · 蓝本=fix-roadmap :63 + issues-master #241/#238/#253/#243 + 协调方新-#274 · #242 面作废登记（UNSTUB-ERASE f9383f76 已摘除·隐私页零改）· pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=202 软删受理(purge_pending) · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*

*rev2 状态行（append-only·不改历史行）: `draft_rev2:pre_exec_dual（席1 四处方落卷·待席2 复审）` · 2026-10-10 · 四处方=①410 文案+「数据」（F6/C6/§4-3·审计 §5.2-3 原文权威）②三锚点勘误（§0-1 :107→:109·§0-2 :706-708→:712·F2 :34→:36·各附注记）③Base rebase 前置（6a7a3acc+·post-rebase 重验 main.ts/package.json/§0 全锚·C1-C11 交集=0 席1 亲证登记）④F3 形 A 等价性论证定谳（保持形 A·不改单笔隔离·选择理由见 F3 rev2 段） · 待席2 复审 · Dual PASS ≠ 开工 · Ban self-approve*

*rev3 状态行（append-only·不改历史行）: `draft_rev3:pre_exec_dual（席2 六处方落卷·待授权方复认后 BOTH PASS·可授权 EXEC）` · 2026-10-10 · 六处方=①P1 create 三过滤四断言落槽具名（privacy-erasure-http.proof.ts 增「create 三过滤」section·C11 同步增行·§4-5 措辞改「既有断言零删改」）②P2 F2/F5 断言补齐（web-logic 新 section+具名新 proof interviews-actions.proof.ts）③P3 C10 工具面具名（dry-run/--apply 运行命令形+prove 导入方 fence-reflow-repair.proof.ts+F4(ii) B 端跳过计数断言+F4(iv) asPrincipal 禁旁路验收形+§4-1 B 端同跳断言）④P4 §4-1 补齐标题承诺二断言（围栏行 interview_event 增量=0+围栏 interview 保持非终态）⑤N1 0059 写护栏锚 :95-98→:96-99（一字修·附勘误注记）⑥N2 §4-2 并发 proof 落名（begin 锁=uc-e2e-001-nhp-bound:74-87 静态断言·create iv-create 锁现无 proof 覆盖→列 prove 补测项） · docs-only 零码动·只触 §0-2 一字/§3-C11 一行/§4 面 · Dual PASS ≠ 开工 · Ban self-approve*
