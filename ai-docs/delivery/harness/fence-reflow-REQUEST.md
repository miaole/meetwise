# FENCE-REFLOW — #241+#238（+#253·新-#274）+#243 围栏回流刀（审计批 1·P1 · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（本 REQUEST 只送审 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 自动开工 · 须 meetwise 明示授权才进 EXEC）
**Date**: 2026-10-10
**Base**: `origin/feat/mysql-schema-skeleton` @`f47670e6` · 分支 `line/fence-reflow`（工作树 `/Users/miaole/Desktop/golucky/meetwise-line-fencereflow`）
**蓝本**: fix-roadmap `:63` 原文（「create 复用查询加 `interview_privacy_active` 过滤；遇未结束面试给『继续/放弃后重来』；……对账把围栏面试回收与 `settleOutbox` 拆开（只释放不写事件），连续失败打错误日志并计数告警；存量用一次性运维脚本修复；#253（回收空壳）同 PR；#243（410 映射一句中文文案、SSE 410 不重连直接给出口，复用第 0 批 actionErrorMessage）……先上 #238 而不带 #241 会把用户引向已围栏面试 → 410，故不得拆开上线」）+ issues-master #241(`:196`)/#238(`:313`)/#253(`:437`)/#243(`:322`) 行 + 协调方 LEDGER rev2 追加**新-#274**指令 + 协调方审计定谳誊录。**唯一蓝本，逐条忠实，禁自由发挥。**
**Honesty**: 本档全部 file:line 锚点在 `line/fence-reflow` @`f47670e6` 实树亲读验证（interview.service/commerce.ts/commerce-reconcile.ts/worker main、0058/0059/0062/0076 围栏迁移、web action-error/actions/page/sse-cursor/interview-stream/view-model、privacy 页两文件、product-campaign-EXECUTION-SOP、NORTH-STAR §1 pins、上游审计 fix-roadmap.md/issues-master.md——行号错=审席 FAIL）；审计引行号漂±逐条登记于 §0。

---

## §0 立靶

**批 1 定位（上游事实源）**：`product-campaign-EXECUTION-SOP.md:16`（#241+#238 围栏回流=首批主攻）·`:26`（W1 主路径：「#241+#238+#243（同 PR）」）·`:49`（批 1 验收：「#241 围栏后 create 返新面试」）· fix-roadmap `:63`（同 PR 令+不得拆开上线）·`:72`（#241 验收三条原文）。

**审计定谳（亲验后誊录）+ 机制链亲验 @`f47670e6`**：

1. **#241（P1 隐私门卡路径）**：隐私页删除预览能把一场面试永久围栏，之后 C 端练习面试无法再新建（create 复用查询不排除围栏面试→用户永久 410）。机制链亲验：围栏=privacy_checkpoint_target × privacy_erasure_request 七状态判定（0058 `:47-54`；0076 `:88-115` v2 增 `authorization_paused` `:107`；audit 更正注：「0076 的状态=CHECK 全集，全仓无解除路径」）；`guardInterviewPrivacy` interview.service.ts `:151-162` 对围栏抛 410 `interview_privacy_fenced`（`:158-159`）；而 **create() 复用查询 `:531-532` 无 `interview_privacy_active` 过滤**——`SELECT id, status FROM interview WHERE status NOT IN ('completed','abandoned','failed') ORDER BY id DESC LIMIT 1`（对照同文件 list() `:573-574` 已带 `interview_privacy_active(i.id)`）→ 围栏尸被当「进行中」复用 → begin/abandon 全 410 → C 端永久无法新建。审计引 `:513-527`/更正注 `:519-521` → 现树 create=`:525-538`/复用查询=`:531-532`，**漂 +12/+10 登记**。
2. **#238（P2·与 #241 同 PR）**：对账把围栏面试回收与 settleOutbox 拆开（只释放不写事件），连续失败打错误日志计数告警。机制链亲验：`reconcileOwner`（apps/worker/src/commerce-reconcile.ts `:25-72`）单 `asPrincipal` 事务 = `reconcile()`（`:27`；packages/db/src/commerce.ts `:384-388` 耦合 `sweepExpiredReservations` `:341-356` + `settleOutbox` `:363-380`）→ swept 逐条业务写 `:36-69`（`appendEvent('interview_unavailable')` `:65` 等）→ **0059 `:95-98` interview_event 写护栏 + 0062 `:59-61` RLS WITH CHECK 对围栏流 RAISE `interview_privacy_fenced`（0062 `:71-74`）** → 整事务 ROLLBACK（释放+结算入账全丢）→ 每 30s（`runCommerceReconciler` `:95-98`）同拍重演；`commerceReconcileTick` `:75-93` 吞错仅 `console.error`（`:88-90`）；worker main.ts `:690` 接线 + `:706-708` `commerceLoop.ready()` 恒绿 → 无告警（audit 原文「每 30s 重试仅打日志，就绪检查保持绿」）。审计引 `:21-67,76-92` → 现树 `:25-72,:75-93`，**漂 +4/+1 登记**。
3. **#253（P3·同 PR）**：回收空壳。亲验：create `:534-535` 先落 `'created'` 空壳 → begin 402/非 2xx 失败（interviews/actions.ts `:31-37`）→ 壳残留 → 列表页 `:118-123` `isInterviewEnterable('created')`（lib/interview/progress.ts `:32-34`）→「进入 →」→ 幽灵场次。
4. **#243（P2·提到本批同 PR）**：410 映射一句中文文案、SSE 410 不重连直接给出口。亲验：action-error.ts（ERRMSG-MAP 已落）**无 410 行** → begin 410 body 码 `interview_privacy_fenced` → `actionErrorMessage` 返 null → interviews/actions.ts `:33-36` 落 `begin_failed` 兜底「启动面试失败（未预留额度）,请稍后重试…」（action-error.ts `:48`）——永久围栏给重试指引=教用户白点；SSE 面：代理 `apps/web/app/api/interview/[id]/events/route.ts:61` → `sseProxyFailureResponse`（sse-cursor.ts `:60-69`·非 400 原样透传 410 状态）→ `iterateSseBody` `:47-55` 只特判 400（`:42-45`）→ 410=空结束 → 驱动重连（interview-stream.ts `:30-31` max=3/maxTotal=100 · `:96-98` 耗尽 degraded）→ view-model.ts `:35/:40` 泛化「网络中断/练习连接已停止」无围栏出口。audit 更正注核实：非死循环，重连有界（≤3 次）后降级。
5. **新-#274（协调方 LEDGER rev2 追加·亲验成立）**：create 复用查询 `:531-532` 不区分 `application_id`——B 端岗位绑定面试（recruiter.ts `:446` 直插·audit #241 更正注①引）同为非终态时会被 C 端练习 create 捞走。并入 F1 同查询面。

**与 UNSTUB-ERASE 落线后的现状对账 —— #242 面作废登记**：亲读隐私页现状——`PreviewErasureForm.tsx:52-60` 范围下拉只剩 `account_data`（`:58`）/`resume_data`（`:59`）两项，**无「一份面试（interview_data）」选项**；`:62` `subjectId` 为 hidden 空值；`privacy/page.tsx:57` 文案明示「单份简历删除在简历页、账户注销在设置页受理」；git 主线 `f9383f76`（UNSTUB-ERASE S1 EXEC）commit 明载「**#242 隐私页瘦身（PreviewErasureForm 摘除「一份面试」误围栏触发点）**」。→ **#242 面作废登记：本刀隐私页零改动**。残留如实登记：API 面 `/privacy/erasure-preview` 仍受 `interview_data`+subjectId（privacy.service.ts `:135-140`；UI 入口已闭、触发需手填完整面试 id——audit #241 更正注②同判：误触概率低，且 F1 create 过滤后即使再发生也不再卡死 create）；该面归 W5 D6 域另管（§2-3）。

## §1 范围（六件·同 PR）

**F1 create 三过滤=既有 status NOT IN+新 interview_privacy_active+新 application_id IS NULL（禁加 resume/任何第三谓词——破 :523 单会话幂等立法）·不得拆开上线

**F2 遇未结束面试给「继续/放弃后重来」（#238 C 面·fix-roadmap 批 1 验收「有未结束面试时点『开始新面试』出现选择，而不是『请稍后重试』」）**：create 返回 `reused=true` 时 startInterviewAction 透传信号 → /interviews 页渲染选择面（继续=进既有会话；放弃后重来=POST `:id/abandon` 后重跑 create+begin）。文案沿 errmsg-map 家族 `BINDING_CONFLICT_TEXT`（action-error.ts `:34`「你有一场未结束的面试：继续/放弃后重来」）——**不新增第三文案**。交互形 EXEC 审定（banner/确认层），契约=`reused` 必达页面+两出口可达；无未结束面试时行为 byte 级不变。

**F3 对账拆分——定谳形 A（围栏先检分支·单事务保持）五钉：(i) commerce.ts/index.ts 零改；(ii) 先检=SELECT 布尔 interview_privacy_active($1)·禁 assertInterviewPrivacyActive（其 RAISE 即毒化）；(iii) 围栏跳过=两分支全跳（B 端 :46-49 块同跳）；(iv) 围栏跳过不计连续失败计数（fence-skip=正常出口·skip 判据=围栏谓词·禁 catch-all 吞咽）；(v) ReconcileOutcome 增 fencedSkipped 计数

**F4 ops/recovery/ 存量修复脚本：(i) dry-run 默认+--apply 幂等；(ii) 每条 SELECT/UPDATE 强制 application_id IS NULL 谓词+dry-run 报 B 端围栏跳过计数；(iii) 关终态 guard 钉 status IN (created/active/waiting_user)（=abandonInterviewAndRelease :297 同枚举·二跑 0 行）；(iv) principal=逐 owner asPrincipal(app_role)·禁 superuser/privacy_api_owner 旁路；(v) 导出 dryRun/apply 供 prove import

**F5 空壳回收（best-effort：abandon 非 2xx 不阻塞带码 redirect·不重试）（#253）**：begin 非 2xx（401 跳登录除外）→ 回收空壳（POST `:id/abandon`·`'created'` 无消费走 commerce.ts `:274-277` NOT EXISTS 分支→`'abandoned'`·列表 `:120` 显示「已结束」）→ 再 redirect 带码。审计两 option「begin 成功再落壳，或失败回收空壳」→ EXEC 择**失败回收**（begin 需 interview id 先存在，「成功再落壳」在现行 API 形下不可行·如实登记）；402 壳与确定性失败壳同覆盖。

**F6 #243：410 一句文案 + SSE 410 不复连直接出口**：action-error.ts 增 410 行——`interview_privacy_fenced` → **「该面试已进入删除流程，请新建面试」**（issues-master #243 修法原文逐字·interviews 页域）；interviews/actions.ts 现有码解析（`:33-34`）自动直达（映射命中→不再落 begin_failed 兜底）。SSE：iterateSseBody/驱动新增 fence 停转通道（**沿 `InvalidLastEventIdError` 先例** sse-cursor.ts `:13-29`、`:42-45` 增 410）→ 驱动 catch 分支（interview-stream.ts `:77-84`）停转**不重连** → view-model 围栏出口（同一句话·复用 `:40` degraded 出口形）；代理 `sseProxyFailureResponse :60-69` 已原样透传 410·零改。#243 复用第 0 批 actionErrorMessage（fix-roadmap `:63` 原文）。

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
| C2 | `apps/web/app/interviews/actions.ts:11-39` | create→盲 begin→402/失败重定向带码（`:31-37` 码解析已接 errmsg-map） | F2 `reused` 透传；F5 begin 非 2xx（401 除外）→先 POST abandon 回收空壳→再带码 redirect；402 分支码面不变 |
| C3 | `apps/web/app/interviews/page.tsx:100-123` | 列表按钮面（`:118-123` 查看/进入/已结束） | F2 选择面渲染（继续=进既有会话·放弃后重来=abandon+重开）；文案 `:34` 家族不新增 |
| C4 | `apps/worker/src/commerce-reconcile.ts:25-72,:75-93` | 单事务耦合：sweep+settle+业务写同事务（`:27,:36-69`）·吞错仅 console.error（`:88-90`） | F3 围栏分支（择型 A/B 登记）+连续失败计数+error 级日志；非围栏路径 byte 级不变 |
| C5 | `packages/db/src/commerce.ts:341-356,:363-380,:384-388`（+`src/index.ts:70` 导出面） | `reconcile()` 耦合 sweep+settleOutbox | 择型 A：本文件零改；择型 B：拆分体导出+index.ts 导出同步（EXEC 审定并登记） |
| C6 | `apps/web/lib/errors/action-error.ts`（无 410 行） | `interview_privacy_fenced`→null→begin_failed 兜底 | F6 410 行（interviews 页域·文案逐字「该面试已进入删除流程，请新建面试」）；既有行零改 |
| C7 | `apps/web/lib/stream/sse-cursor.ts:42-55,:60-69` | 只特判 400（`:42-45`）；410 随「空结束」透传 | F6 410 fence 停转通道（沿 `InvalidLastEventIdError` 先例）；`sseProxyFailureResponse` 零改 |
| C8 | `apps/web/lib/stream/interview-stream.ts:30-31,:77-84,:96-98` + `apps/web/lib/hooks/useInterviewStream.ts:19` | 410 当普通断流重连≤3 次后 degraded | 驱动 catch 分支对 fence 错停转不重连直接出口；`:19` 注释同步 |
| C9 | `apps/web/lib/view-model.ts:34-47`（+interview-state 视需要） | 泛化「网络中断/练习连接已停止」无围栏文案 | 围栏出口 view（一句话·复用 `:40` degraded 出口形）；其余 face 零改 |
| C10 | `ops/recovery/fence-reflow-repair.*`（新目录新文件） | 无 | F4：dry-run 默认+`--apply`+幂等；样例输出在卷；零产品面引用 |
| C11 | `apps/web/test/web-logic.proof.ts`（新 section）+ `apps/worker/test/commerce-reconcile.proof.ts`（增围栏场景） | 既有断言面 | §4 断言矩阵；既有 section 零删改 |

## §4（补强：①围栏行零 interview_event 写+interview 保持非终态断言；②F6 fence 判据=status 410 状态基非 body 码基·sse 代理 :60-69 换 body） prove

1. **对账拆分（`commerce-reconcile:prove`·隔离库·根 package.json:203）**：构造围栏面试（fence 锚落库）+挂死预留+同户另一笔 pending outbox → 一拍后断言：`settlement_ledger` 行落 + outbox `relayed`（**同户 pending 结算对账入账成功**）；该预留 `released`；**无 `interview_privacy_fenced` 循环报错**（重复 error 计数=0）；非围栏对照 swept 行为 byte 级不变（终态+事件照发）。
2. **create 三过滤**：围栏非终态面试存在 → create 返回新面试（`reused=false`·新 id）；岗位绑定面试（`application_id≠NULL` 非终态）存在 → C 端 create 仍新建（**新-#274 断言**）；正常未结束练习面试 → 仍复用（`reused=true` 不回归）；并发 advisory 锁面原样（既有并发 proof 原样绿）。
3. **web-logic proof 新 section（`pnpm web:prove`）**：`actionErrorMessage('interviews',410,'interview_privacy_fenced')` 文案逐字断言；410 不再落 begin_failed 兜底（映射命中断言）；驱动注入 410 open → **0 次重连**+围栏出口 view 断言（停转·不 sleep 重连·沿 HC-GAP-014 注入先例）；既有 section 零删改。
4. **运维脚本**：dry-run 样例输出在卷（SELECT-only 零写断言）；`--apply` 释放+关终态断言+幂等（二跑零变更）；围栏账本（privacy_erasure_request/privacy_checkpoint_target）零触断言。
5. **门清单**：一次过 Ban retry-to-green（attempts 全账入收据）·冲突标记门（push 前 `grep '^<<<<<<< \|^=======$\|^>>>>>>> '` 全仓=0）·邻接 `privacy-erasure-http.proof`/`unstube-erase.proof` 原样绿（410 语义零回归）·est live=0·零外呼零消耗·收据 `ai-docs/delivery/receipts/fence-reflow/`。

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
