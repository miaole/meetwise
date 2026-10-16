# I4 INVITE-FACE REQUEST（批3 段 · B 端邀约/通知/列表面 · #221/#222/#223/#265 · M 体量）

**Status**: **`draft:awaiting_pre_exec_dual`**（**rev2** pre-exec 勘误落卷 2026-10-11·双审席1+席2 窄 FAIL 八处方+两席登记全落·**待复审**·原 rev1 起草席落卷即停·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）

**Status 链补全（nail 席 append-only 一次补登·2026-10-11）**：`draft:awaiting_pre_exec_dual`（rev2 落卷·上行原文照录零改）→ `executed:awaiting_post_prove_dual`（EXEC 落卷 @`f5fa2f52` 15 文件·迁移 0165/0166·EXEC 未翻本 Status 行·照实补登）→ **nailed**（post-prove 双席 BOTH PASS @2026-10-11·两裁决项①SECURITY DEFINER④形①协调方裁·随落·merge 主线 nail·错峰等 I3 merge(i3-job-mgmt) @`c042729b` 可见后动手·loop 协调方本次派单即 nail 授权）。上文原 Status 行文字照录不改。

**席位**：#批3 段 I4 INVITE-FACE EXEC 任务书起草席（北星 loop · 批3 残余组 · B 端邀约/通知/列表面 · M 体量）。
**基线**：`feat/mysql-schema-skeleton` @ `83a940c7`（主线最新 tip·`git log -1` 实测 2026-10-11·merge(diag-honesty) #213）。分支 `line/i4-invite-face`·工作树 `meetwise-i4`（`git worktree add ../meetwise-i4 -b line/i4-invite-face` 本起草席已立·建前 worktree list 实查不存在）。
**蓝本**：①审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` 候选四件+防漏两件（#221=:304/#222=:449/#223=:450/#265=:440/#131=:257/#62=:381·原文+证据列+修法列逐字誊录见 §0.1/§1）②分组蓝本=batch-residual-plan @`ab02d499`「批3 残余 → 6 组」表 I4 行（**I4=INVITE-FACE 刀·「#221/#222/#223/#265」·锚点线索逐字**）③LEDGER `product-campaign-LEDGER.md` :210 批3 段（3/23·残 20）④界线衔接=I3 卷 `i3-job-mgmt-REQUEST.md` §0.1 留置清单/§3-1 划界（I3 收 #219/#220/#258/#197·留 I4 恰本刀四件）⑤形制沿 `i3-job-mgmt-REQUEST.md`（同段先例·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `83a940c7`·file:line 逐条 rg/sed 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 已终局防重检查记录（强制项）

- `rg -l "I4|INVITE-FACE|invite-face" ai-docs/delivery/harness/ ai-docs/delivery/execution-master-checklist.md`（base `83a940c7` 实跑）→ 命中 **4 件**逐一核验：①`r4-real-wire-impl.md`:49 ②`r4-p-planner.md`:62 ③`r2-classify-job-route.md`:30——三处均为表行 **I4 阶段标签**（Retrieve 主路径/Unit prove/申请受邀 bind 的第 4 阶段）子串撞车·非本卷；④`i2-b-deliverable-REQUEST.md`（:45/:78/:79/:119/:137）——I2 卷范围外留置注记「#221/#222/#265（I4）」+同域排程预警·**非终局卷**。
- `execution-master-checklist.md` **零命中**（exit=1 实测）——无 I4/INVITE-FACE 终局节。
- harness/ **无同名卷** `i4-invite-face-REQUEST.md`（ls 全表实测）。→ **停止条件未触发·可建树落卷**。
- i2-b 卷 :137 并发预警照录：I3 与 I4 同触 recruiter 域——行号以 EXEC 时实树重 pin 为准；并发照 G4 例登记零重叠（I3 已立树 `meetwise-i3` @`0f2ff494`·同段并发派程见 §4）。

### 0.1 盘点总表（候选四件+防漏两件·逐件已解决?/归槽判定·双表对勘=LEDGER :210 残 20 单×batch-residual-plan :110 I4 行）

| 件 | issues-master | 已解决? | 实树判定锚（`83a940c7` 实测） | 归槽 |
|---|---|---|---|---|
| #221 | :304 P2 用例偏差 B端-邀请/投递「『邀请成功』文案忽略服务端真实状态（已婉拒/已面完也提示『已邀请』）；邀请不触发任何通知，候选人只能自己打开 /jobs 发现」修法列「按回包 status 给文案；邀请写站内通知（邮件见 #265）」 | **部分面**（文案子面**已闭**随 b110；**通知残面开放**） | 文案面：API 恒定壳 `recruiter.service.ts:137` `return { received: true }`（零 status 出参）+ web 受理文案中性化 `recruiter/jobs/actions.ts:57`「已受理；若对方是注册求职者将收到邀请」（b110 注释 :56 明示不宣称已送达/候选人存在）——修法列前半「按回包 status 给文案」前提已消（回包无 status 可依）。通知面：invite 链（`recruiter.service.ts:111-141` → `inviteCandidate` `recruiting/recruiter.ts:339-360`）**零 insertNotification**；全仓通知写侧唯一 caller=`apps/worker/src/report-worker.ts:169`（kind='report_ready'·`ntf_${claim.reportId}` 形）；C 端读侧管道全在（`notification/notification.ts` 5 函数 + API 4 端点 `notification.controller.ts:19-40` + web `/notifications` 页 `KIND_LABELS`:19 + Nav :41）——**缺的只是邀请时写侧** | 通知残面 **I4 收** |
| #222 | :449 P3 用例偏差 B端-邀请/投递「listOpenJobs 回包过宽：返回招聘方 owner_user_id 与 description（经 web 创建的岗位 description 恒空，主要是 API 直调面）…投递前同意缺口见 #81」修法列「回包去掉 owner_user_id；投递前展示 JD 与用途并记录同意」 | **部分面**（同意子面**已闭**随 #81·I2 落；**回包子面开放**） | 回包面：`recruiting/recruiter.ts:21` `COLS` 仍含 `owner_user_id, description`（`:16` JobPosting 接口同形）；候选人侧 `listOpenJobs` `:128-132` 用全 COLS 跨租户公开读；API 零投影直透 `jobs/jobs.service.ts:14`；契约 `contracts/src/index.ts:362-366` `JobView` 含 `owner_user_id`+`description` 且 `:1338` browseJobs 共用 `JobList`。web 页面本地接口 `jobs/page.tsx:21` 只声明 `{id,title,competencies,status}`（渲染 :99/:102-103·回包过宽字段渲染零消费=纯 API 直调面）。同意面：`CONSENT_PURPOSES` `contracts:505` 含 `b_qualitative_share`（I2 W3 落·`jobs/page.tsx:51` 候选人侧同意态已接） | 回包子面 **I4 收** |
| #223 | :450 P3 用例偏差 B端-面试与结果「招聘方无法识别候选人：列表/状态页只显示 candidate_user_id 前 8 位，邀请按邮箱，二者对不上；无备注/导出」修法列「显示招聘方自己输入的邀请邮箱/备注（候选人同意后）」 | **开放** | `recruiter/jobs/[id]/page.tsx:79` + `recruiter/talent/page.tsx:103` `slice(0, 8)` 双锚亲证（i2-b 卷 :45 先证·本席复核未漂移）；`TalentRow` `recruiting/recruiter.ts:122-126` 含 `candidate_user_id` 零识别替代字段；**邀请邮箱不落库**（`gateway_active_candidate` `sql/23_api_gateway.sql:83-104` 瞬时解析 email→id·rg `invite_email|invited_email|note|remark` 全仓零命中）——修法列「显示自己输入的邀请邮箱」无数据源·需裁决（§1-③）；最小化披露为有意设计（talent :15 metadata 自称「内部预览·不是人才库」·issues-master 备注同源） | **I4 收** |
| #265 | :440 P3 产品偏差 注册/登录「设置页『接收邮件通知』开关没有发送实现：非测试代码无 SMTP/mailer，通知只写站内表」修法列「无实现时隐藏开关」 | **开放** | `settings/page.tsx:64-73` checkbox「接收邮件通知」（:72 逐字）·`:36` `notify = pref.notify !== false`（**默认开=空值语义**·rev2 席2-①）；`settings/actions.ts:7-13` 发 `{lang,notify}` → `profile.controller.ts:33` + `contracts:312-321` `.strict()` 恒 400 **notify 不落库·保存钮 base 已红**（链详 §0.6）；全仓 `smtp|nodemailer|sendmail|mailer` **代码+依赖零命中**（`docker/README.md:27`/`dependency-footprint.md:99` docs 字样除外·rev2 席2-⑤）；`preferences.notify` 消费方仅 settings 页自读（rg 实测·零后端消费） | **I4 收** |
| #131 | :257 P2 技术缺陷 大小写邮箱邀不到 | **开放·非本刀** | 错位仍在：注册侧 `auth.service.ts:34/:39` `const email = b.email` 原样存储 vs 邀请侧 `recruiter.service.ts:121` `trim().toLowerCase()`·gateway `:101` `u.email = p_candidate_email` 精确匹配——含大写邮箱候选人恒邀不到 | 留 **5A**（硬依赖 #111 邮箱归一含存量迁移·任务书既定不收·I3 卷 :29 同判） |
| #62 | :381 P3 技术缺陷 Server Action 路径未编码 | **开放·非本刀** | `jobs/actions.ts`（候选人侧文件·非本刀触面）jobId/appId 直拼路径 | 留 **5E 批量**（任务书既定不收·I3 卷 :30 同判） |

**归槽结论**：I4 INVITE-FACE 收编恰 **4 件 = #221（通知残面）/#222（回包子面）/#223/#265**（与 residual plan :110 I4 行四件完全一致；与 I3 卷 :35 归槽结论「留 I4 四件」完全对勘）。防漏逐件判批3（`rg "第3批 \|" issues-master.md` 实测 **26 行=去重唯一条目 23 件**·与 :80 汇总行「第3批 | 23」对勘——rev2 席1 R-1 计数措辞对实测·原「全 24 行」系把汇总行与批注交叉引用行混计的措辞疵·防漏结论不变）：#110/#271/#227 已闭（LEDGER :210）·#218 I2 落面在飞·#224 批0 已闭·#219/#220/#258/#197=I3·#225/#233/#234/#235/#212/#231/#262/#263/#264/#267=I5/W9/5E（#263 招聘方入口 D4 已决保留·#231 押题追问模板·#264 工程话术——均非邀约/通知/列表域）·#239=I6·#131=5A/#62=5E——**邀约/通知/列表域无第六件**。防漏观察一项：web `KIND_LABELS`:20 有 `assessment_ready` 标签而全仓零写侧（rg 实测）——非 issues-master 条目·登记不收（归 5E 或后继观察·零触）。**批3 残量口径登记（rev2 席2）**：残量=LEDGER :210「3/23·残 20」**含 I3 四件（#219/#220/#258/#197）——I3 @`0f2ff494` 未并主线**·I4 并线前主线残量维持 20 口径·I4 收四件后的残量更新归 LEDGER SSOT（本刀只读引用·Ban 改 SSOT）。

### 0.2 漂移登记（issues-master 证据列旧锚 @`2fab7946` vs `83a940c7` 实测·DIR-B2 域文件夹化 @`8262d976` 与 b110 反枚举重构为主因）

| 旧锚 | 现锚（实测） |
|---|---|
| `packages/db/src/notification.ts:14` | `packages/db/src/notification/notification.ts`（域文件夹化·insertNotification 现 `:13`·表 DDL/RLS `sql/14_notification.sql`） |
| `packages/db/src/recruiter.ts:21,128-131`（COLS/listOpenJobs） | `packages/db/src/recruiting/recruiter.ts:21`（COLS）/:128（listOpenJobs）/:16（JobPosting 接口） |
| `packages/db/src/recruiter.ts:172-176`（人才库行） | `recruiting/recruiter.ts:122-126`（TalentRow 接口） |
| `recruiter/jobs/actions.ts:46-55`（邀请文案） | b110 重构后 `recruiter/jobs/actions.ts:37-57`（inviteCandidateAction）·中性化文案 `:57`·404 分支退役注释 :54-55 |
| `recruiter.service.ts:60-81`（invite） | b110 反枚举重构后 `recruiter.service.ts:111-141`（限流 :114-117·对称解析 :120-121·归属预检 :123·gateway 解析 :125-128·恒定壳 `:137` `received:true`） |
| `contracts index.ts:297-301`（JobView） | `contracts/src/index.ts:362-366`（JobView）/:367（JobList）/:1338（browseJobs 注册） |
| `jobs/page.tsx:69-76/:55/:61` | `jobs/page.tsx:21`（本地 Job 接口已窄）/:68（非正式招聘披露）/:99/:102-103（title/competencies 渲染） |
| `settings/page.tsx:71` | `settings/page.tsx:64-72`（checkbox 块）·「接收邮件通知」文本仍 `:72`（任务书 :71 差一行·同块） |
| 任务书行号 #222「:305」 | **实测 :449**（:305 为 #224 行·批0 已闭件·如实更正） |
| 任务书行号 #265「:444?」 | **实测 :440** |
| rev2 席1 R-3 实测 ±1 更正（四处·只更行号不改结论） | `contracts` updateSettingsSchema 实测 **:312-321**（双审摘文 :311-319）·`settings/page.tsx` checkbox 块实测 **:64-73**（卷面 :64-72·文案仍 :72）·`recruiter.service.ts` invite 函数体实测 **:111-138**（卷面 :111-141·:141 已入 talent 签名行）·`settings/actions.ts` 发送体实测 **:7-13**（卷面 :5-9） |

**重 pin 免责**：本节锚为起草席 base `83a940c7` 一次性亲读；EXEC 立项/双审照例全量重 pin，漂移只更行号不改结论；I3 卷 §0.2/i2-b 卷同款先例。

**跨树引用事实登记（rev2 席2）**：本卷多处引 I3 卷 `i3-job-mgmt-REQUEST.md`——该卷在 `meetwise-i3` 树 @`0f2ff494`、**不在本树**（本 base harness/ `ls` 实测零该文件）：I3 卷行号引用以 i3 树卷面为准、本刀不代重 pin。**文档漂移登记（rev2 席2）**：`ai-docs/architecture/dependency-footprint.md:99` `nodemailer` 行与实树依赖（代码+pnpm-lock 零命中·§0.6）漂移——归 **5E 批量**·登记不收。

### 0.3 #221 实锚（通知残面·含真缝：RLS WITH CHECK 限自插）

- **读侧管道全在**：db `notification/notification.ts:13-36`（insertNotification/listNotifications/markNotificationRead/unreadCount/markAllNotificationsRead·PRIV01-C 显式 owner 谓词第二层）；API `notification.controller.ts:19-40`（GET /notifications·GET unread-count·POST read-all·POST :id/read）；web `/notifications` 页（`KIND_LABELS`:19-23 现仅 report_ready/assessment_ready 两标签）+ Nav :41 入口。
- **写侧唯一先例**：`report-worker.ts:167-172`——`asPrincipal(pool, owner, …)` **以 owner 本人上下文**插入（RLS WITH CHECK 过）·id=`ntf_${reportId}` 幂等形。
- **真缝（EXEC 必裁）**：`sql/14_notification.sql:17` `WITH CHECK (owner_user_id = current_setting('app.principal_user', true))` + FORCE RLS——invite 链运行于**招聘方 principal 上下文**（`recruiter.service.ts:134` asPrincipal(principal)），**无法直插候选人 owned 通知行**。两形：①SECURITY DEFINER gateway 函数（0155/0160 先例齐：`gateway_active_candidate`/`gateway_b_qualitative_projection`·函数内复核 recruiter active+approved）=新迁移文件（**函数级·零表结构变更**）；②worker lane（事件/outbox→worker 以 owner 上下文补插）=异步延迟+新管道。倾向①（同步性+先例齐·§8 裁决项①）。
- **b110 红线**：恒定壳下未命中（幽灵 email）零信号——通知写侧**只在 candidateId 命中分支**（`recruiter.service.ts:133-135`）触发·未命中零写零差别；web 文案 `:57` 中性化零回退。

### 0.4 #222 实锚（browseJobs 回包收窄）

- 泄漏链全亲证：`recruiting/recruiter.ts:21` COLS → `:128-132` listOpenJobs（跨租户公开读·无 assertPrincipal——候选人视角）→ `jobs.service.ts:14` 零投影直透 → `contracts:1338` browseJobs 注册 `response: JobList`（JobView 含 owner_user_id+description）。
- 渲染面零消费：`jobs/page.tsx:21` 本地接口只取 4 字段——过宽字段纯 API 直调暴露面（issues-master 备注同源）。
- description 现状注记：web 创建恒空仍成立（`recruiter/jobs/actions.ts:21-23` 只发 {title,competencies}）；**但 I3 JOB-MGMT 若落 JD 表单则 web 创建将带 description 真值**——本刀回包收窄裁决**独立于 I3 时序成立**（§4）；I3 的 createJob JobView 契约错位是 I3 §1-① 裁决面·本刀零触。

### 0.5 #223 实锚（招聘方候选人识别·数据源裁决）

- **三锚亲证（rev2 席1-① 勘误：双锚→三锚）**：`recruiter/jobs/[id]/page.tsx:79`（申请列表行 `c.candidate_user_id.slice(0, 8)`）+ `recruiter/talent/page.tsx:103`（人才库行 `t.candidate_user_id.slice(0, 8)`）+ `recruiter/jobs/[id]/applications/[applicationId]/page.tsx:131`（申请详情页 `application.candidate_user_id.slice(0, 8)`）——i2-b 卷 :45 先证「两页」口径系漏计详情页；rev2 勘误席 rg 全仓 `candidate_user_id.slice(0, 8)` 实测恰三处命中（无第四处）——8 位截断为最小化有意设计（talent :15 metadata·issues-master 复核备注同源），**修法≠显示完整 id**=给替代识别手段。
- 数据源缺口：邀请邮箱瞬时解析不落库（`gateway_active_candidate` 23_api_gateway.sql:83-104·rg invite_email/note/remark 零命中）——修法列「显示自己输入的邀请邮箱/备注」两半均无现状存储。三形：①持久化邀请邮箱/备注=**新列=迁移**（默认零迁移纪律冲突·默认不入）；②**候选人邮箱同意门显示**=`CONSENT_PURPOSES`（contracts:505）加 purpose 零迁移（consent_record.n 为 text）+ 0160 gateway 投影先例 fail-closed（无同意零出参）——倾向②（§8 裁决项③）；③登记不动（识别面留置）。备注功能同①默认不入。

### 0.6 #265 实锚（开关诚实化）

- **#265 链如实改述（rev2 席2-① 勘误·原「actions 落 preferences.notify/默认开」表述失实）**：web 保存链=`settings/actions.ts:7-13` 发 `{lang, notify}` → `profile.controller.ts:33` PATCH settings 经 `ZodValidationPipe(updateSettingsSchema)` → `contracts/src/index.ts:312-321` 白名单（locale/theme/notifications）`.strict()` **拒绝未知键恒 400**——**notify 不落库**；保存链在 base 即断=**settings 保存钮 base 已红（既有红面·登记不洗）**；`settings/page.tsx:36` `notify = pref.notify !== false`「默认开」系**空值语义**（`preferences.notify` 恒 undefined）；checkbox 块实测 `settings/page.tsx:64-73`（文案仍 :72）。
- **全仓 SMTP/mailer 口径更正（rev2 席2-⑤）**：**代码+依赖零命中**（`docker/README.md:27` Mailhog 端口表·`ai-docs/architecture/dependency-footprint.md:99` nodemailer 行——docs 字样除外·代码+pnpm-lock rg exit=1 实测）；`preferences.notify` 零后端消费（仅 settings 页自读回显）。
- **「存量 notify 值」改述（rev2 席2-①）**：非泛指存量 `preferences.notify` 键——系 **F6 收紧前 legacy DB 行可能残留 `notify`/`lang` 脏键**（profile.service 落库时把已存 prefs 投影到白名单键自愈·`profile.service.ts:11` 注释/:85 settings 亲证）·下次成功保存即被洗去·「无人读零害」结论不变。
- 修法列「无实现时隐藏开关」两形（**裁决项④扩形·rev2 席2-①**）：①隐藏 checkbox——**须同刀修 payload**（actions.ts 发送体 `lang→locale`·删 `notify` 键·`locale` 已在白名单·零后端改动）**或显式登记保存面残面另刀**；②文案改「接收站内通知」=新承诺（站内通知无用户级开关·须接真开关=偏好语义扩展）——倾向①（§8 裁决项④·若协调方裁「#221 通知落地带偏好开关」则②升级为准·仍零迁移）。

## §1 修法（四触面簇·修法列逐条固化·file:line 实锚·EXEC 立项重 pin）

### ① 邀请站内通知写侧面（#221 修法列逐字：「邀请写站内通知（邮件见 #265）」）

- **写侧接线**：invite 命中分支（`recruiter.service.ts:133-135`）真实建申请/幂等复用后写一条候选人站内通知——形制=EXEC 裁决项①（倾向 SECURITY DEFINER `gateway_notify_invited` 函数·0155/0160 先例：函数内复核 active recruiter+approved·`0162+` 函数级迁移文件**零表结构变更**；备选 worker lane 异步·若裁②则登记同步性残面）。
- **通知形制**（沿 report-worker `ntf_${reportId}` 先例）：id=`ntf_<applicationId>`（幂等·重邀请/幂等复用零堆积）·kind 命名=裁决项①附项（倾向 `job_invited`·沿 KIND_LABELS 形制 web 标签同步加一行）·payload 最小集 `{jobId, jobTitle}`（零邮箱零 PII 扩散——候选人自己有申请行可查详情）。
- **b110 恒定壳零破**：未命中分支零写零信号（§0.3 红线）；API 响应形 `received:true`（:137）与 web 中性文案（actions.ts:57）**字节零动**——本簇只加写侧·零改应答面。
- **读侧零新管道**：notification 表/API/web 页/Nav 全在（§0.3）——只补 `KIND_LABELS` 一行标签·零新读路径。

### ② browseJobs 回包收窄面（#222 修法列逐字：「回包去掉 owner_user_id」）

- **收窄形**（裁决项②·倾向 A）：**形 A 读侧投影**——listOpenJobs 增候选人侧窄投影（`{id, title, competencies, status, created_at}`·去 owner_user_id；description 去留=裁决项②附项·倾向随窄投影保留供投递前可见·I3 落 JD 后有真值须如实）+ contracts 新 `JobPublicView`/browseJobs 注册换 response（`JobList` 保留给 recruiter listJobs/getJob 自有面零动）·或 db 层新读函数二选一 EXEC 定。**形 B 共享 COLS 本体改**——波及 recruiter 自有列表（owner 看自身 id 无害但面大）·不倾向。
- **owner_user_id 必去**（修法列原意·跨租户暴露内部 id）；**同意面零重做**（#81/D6-D7 已落 I2·contracts:505 + jobs/page.tsx:51 亲证·本簇零触同意机制）·收窄形锚集（COLS :21/listOpenJobs :128-132/jobs.service :14/contracts :362-366+:1338）照 §0 重 pin 免责 **EXEC 立项全量重 pin**（rev2 席1 R-2 登记）。

### ③ 招聘方候选人识别面（#223 修法列逐字：「显示招聘方自己输入的邀请邮箱/备注（候选人同意后）」）

- **主形（裁决项③·倾向 b）**：**同意门邮箱显示**——`CONSENT_PURPOSES` 加候选人侧 purpose（命名=裁决·如 `recruiter_contact_share`）零迁移（consent_record.n text·枚举校验 privacy.controller 既有 400 形自动生效）+ **新增独立同形投影函数**（0160 `gateway_b_qualitative_projection` 为形制先例·**Ban 改 0160 本体**：其函数体+ACL 与 `23_api_gateway.sql` 镜像逐字节同文系 I2B-0d/0e 承重墙——rev2 席2-③ 钉死消歧·Ban 改 gateway_b_qualitative_projection 本体）出参加候选人邮箱（**fail-closed：无同意零出参**）+ 招聘方识别列渲染**三页枚举**（`jobs/[id]/page.tsx:79`/`talent/page.tsx:103`/`jobs/[id]/applications/[applicationId]/page.tsx:131` 邻位渲染·文案=裁决项⑤——rev2 席1-② 扩形随 §0.5 三锚）。
- **默认不入**：邀请邮箱持久化（无现状存储·新列=迁移）与招聘方备注功能（新列=迁移）——零迁移纪律下留置；协调方若裁入=**回炉补审**（Ban 迁移越权同 I3 §3-6）。
- **零越界**：8 位 id 截断形制本身零改（有意设计·§0.5）——识别列是**加**替代手段非**改**最小化披露。

### ④ 设置页开关诚实化面（#265 修法列逐字：「无实现时隐藏开关」）

- 倾向**隐藏 checkbox**（`settings/page.tsx:64-73` 移除 notify 项·**同刀修 `settings/actions.ts` 发送体：`lang→locale`·删 `notify` 键（`locale` 已在 contracts:312-321 白名单·零后端改动）**；F6 前 legacy 残留脏键无人读零害·下次成功保存被白名单投影自愈洗去·零迁移——rev2 席2-① 扩形·只删 checkbox 不修 payload=保存钮红面原样留存·须显式登记残面另刀）；若裁「通知落地带偏好开关」则改形为站内通知真开关（§8 裁决项④）。
- **宣称-兑现对齐纪律**：修后 settings 页零「邮件通知」宣称残留（静态源可断言·§2-4）。

## §2 验收断言候选（api prove/neg:bend/recruiter:prove/web 静态形制·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **#221 通知写侧断言（rev2 席2-② harness 重钉·三层分落）**：**应答臂归 `neg:bend`**——未命中幽灵 email → 恒定壳 200 `received:true` 断言（`:306-307` 先例同形·`Object.keys=1` 键集钉死沿 `:310` 形；应答面落 db prove 系层级错位故重钉）；**api 接线臂（新增）归 `neg:bend` 或具名 api prove**（EXEC 立项按 harness 实况定）——认证 HTTP invite 命中 → 候选人 notification 行落库断言（owner=candidate·kind 随裁决·payload 含 jobId）·未命中 → 零行断言；**db 机制臂留 `recruiter:prove`**（根 `package.json:209-210` → `packages/db` recruiter-depth.proof）——幂等重邀请零重复行断言（`ntf_<applicationId>` 形）·招聘方 principal 直插候选人通知行被拒断言（WITH CHECK 语义证明·写侧必经裁决形通道）·gateway 函数行为断言。
2. **#222 回包收窄断言（rev2 席2-④ 落点具名）**：browseJobs 响应零 `owner_user_id` 键断言——**HTTP 收窄臂落 `neg:bend` 新增认证 GET /jobs 臂**（现 `:137` 系无鉴权 401 臂·零已认证响应形臂可承；`h.req`+`Object.keys` 键集断言形沿 `:310` 先例）·契约校验层（新 JobPublicView 随裁决②）为辅面可入具名 api prove；recruiter listJobs/getJob 自有面零回归断言（JobList 原形·随裁决②）；web jobs 页渲染零回归静态断言。
3. **#223 同意门断言**：无同意 → 招聘方读面**零候选人邮箱出参**（fail-closed neg 臂·gateway 投影层）；同意后 → 读面含识别列断言；`CONSENT_PURPOSES` 新 purpose 注册断言（contracts 静态）+ 非法 purpose 400 零回归；web **三页**识别列静态源断言（rev2 席1-② 随 §1-③ 三页枚举·`apps/web` prove `ln()/正则 .test(readSrc)` 先例·`web-logic.proof.ts` 同形制）。
4. **#265 宣称对齐断言**：settings 页静态源断言——「接收邮件通知」宣称存在 ⇒ 兑换源存在，或宣称零残留（随裁决项④·沿 I3 §2-4 宣称对齐形制）。
5. **回归面随改随核**：`pnpm neg:bend`（`package.json:107` per-push 既有）+ `pnpm recruiter:prove` + **`i2b:prove`（rev2 席2-③ 增列：i2-b EXEC 落卷 prove·本 base `package.json` 零该脚本行=跨树物·EXEC 立项实树重 pin；I2B-0a 末位迁移钉 0160 断言在本 base 已因 `0161_practice_only_read_narrowing.sql` 同红——照 E5 登记不洗·I2B-0d/0e 0160 镜像承重墙断言须 EXIT 原值）** + notification 既有读面 prove + applications/jobs 既有 prove 全 EXIT 原值·base 同红登记不洗（E5 流程·批前实测基线入收据）；b110 恒定壳面（`actions.ts:57` 文案/api `:137` received）与 #81 同意面零翻零触（§5 增补 Ban）。
6. markers=0（§7）+ est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **I3 JOB-MGMT 界线（划清·I3 卷 §3-1 镜像）**：#219/#220/#258/#197（岗位编辑/关闭接线/路由可见重试/JD 表单/JD 喂 planner）与 createJob JobView 契约错位裁决面——**全不触**；`recruiter.controller.ts`/`recruiter.service.ts` 的 updateJob/closeJob 增端点面、`JobCreateForm.tsx`、`dashboard/page.tsx` 宣称、`interview-consumer.ts` 零触；同文件并发照 G4 例登记零重叠（§4）。
2. **#131 不并**（5A·硬依赖 #111 邮箱归一含存量迁移）；**#62 不顺手**（5E 批量·防面混）——I3 卷 :29-/:30 同判逐字承袭。
3. **邮件/SMTP 面零引入**：#221 修法列「邮件见 #265」与 #265 修法列本意=邮件发送**无实现**——本刀只做站内通知+开关诚实化，零 SMTP/mailer 依赖引入；企业邮件通知若未来立项另开刀。
4. **#223 邀请邮箱持久化/备注列默认不入**（新列=迁移·§1-③·裁决越出=回炉）。
5. **E2E 场景面归矩阵循环刀**（I3 §3-2 同形制）：本刀 prove 只认 neg:bend/recruiter:prove/web 静态先例（§2 形制）·零新增 Playwright 场景。
6. **已闭面零触**：#218 I2 held 两态/`b_qualitative_share` 同意门既有 purpose 语义、#227 start/begin 合一链、#224 jobs 页 402 面字节零动——只作回归面（§2-5）。
7. **I5 文档三态/I6 合规/批1·批2 残余零触**；`assessment_ready` 空标签观察登记不收（§0.1 防漏结论·零触）。
8. **est live=0**：零模型真实外呼（本刀无模型触面）·零 SMTP 真发·零生产操作·零 secrets。

## §4 依赖

**零未决硬依赖**。①通知读侧管道全在（db 5 函数/API 4 端点/web 页/Nav·§0.3 亲证）——本刀=写侧接线面；②同意机制先例已在主线：I2 W3 `b_qualitative_share`（contracts:505/0160 投影函数/jobs 页 :51）**已合入 `83a940c7` 祖先**（本席在 i4 树亲证）——#223 同意门与 #222 同意面零前置刀；③#227/#271 已闭=上下文非阻塞（I3 卷 §4 同源）。**并发面（与 I3 同段并行可 EXEC）**：同 recruiter 域——文件交集登记三处：`contracts/src/index.ts`（I3=createJob 注册如实化 · I4=JobView/JobPublicView/browseJobs 行·**不同注册行**）、`recruiter.service.ts`（I3=updateJob/closeJob 新端点接线 · I4=invite 函数体内加通知调用·**不同函数**）、`packages/db/src/index.ts` 桶导出（**rev2 席2-⑤ 申报收窄：仅若裁决形需新 db 导出（如新增投影函数）才动·否则本刀零触桶文件**；动则两边各行各的导出行·仍函数/导出行级零重叠）——照 i2-b 卷 :137 注记与 G4 例登记**函数/注册行级零重叠**；I3 的 JD 表单落地时序不影响本刀裁决独立成立（§0.4）；行号以 EXEC 时实树重 pin 为准。

## §5 Ban 列表 + pins（沿 I3 卷 §5 同源·逐字誊 + 本刀面增补）

**Ban 列表**（I3 卷 §5 同源逐字誊 + 本刀面增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（本刀默认唯一准入迁移=#221 通知 gateway 函数文件·函数级零表结构变更·表结构/新列零建——邀请邮箱列/备注列不建·迁移冲动=停手上报）；Ban 触其他工作树（meetwise-i3/i2/entpay/ptp/h2q/h5/e2ar 零触）；Ban 伪造已问/已验来源（零机制现状不假称既有）；**本刀增补**：Ban 破 b110 反枚举恒定壳（invite 未命中零信号零写·`received:true` 应答形与 `actions.ts:57` 中性文案字节零动）；Ban 动 notification 表 RLS 语义本体（`14_notification.sql` p_owner WITH CHECK/FORCE RLS 零改·写侧只经裁决形通道·**Ban 拆 RLS/Ban 关 FORCE**）；Ban 触 I3 面（岗位编辑/关闭/路由/JD 表单/createJob 契约错位·§3-1 零触）；Ban 引入 SMTP/邮件发送面（§3-3）；Ban 触 #81 既有同意 purpose 语义（b_qualitative_share 及其余三 purpose 语义零改·只增不改）；Ban 8 位 id 截断形制改动（识别=加替代手段·非展开完整 id）；Ban 通知 payload 携带候选人 PII 扩散（最小集纪律·§1-①）；Ban planner/评分/sticky 路由语义触碰（本刀零相关）；Ban 保留无兑现源宣称（#265 宣称-兑现对齐·§1-④）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 mock/静态·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：①通知写侧断言=db prove（真库假数据·零外呼）②回包收窄/同意门断言=db prove+契约静态③web 面断言=静态源断言（web:prove 先例）。prove 全 mock/静态/本地库·零 SMTP 真发·零生产操作·零 secrets·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/i4-invite-face-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检+rev2 勘误席复检·全卷+diff 增行双过·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 I3 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：①#221 通知写侧形（倾向 a=SECURITY DEFINER `gateway_notify_invited` 函数级迁移·0155/0160 先例；备选 b=worker lane 异步）+ kind 命名（倾向 `job_invited`）与 payload 最小集（倾向 `{jobId, jobTitle}`·id=`ntf_<applicationId>`）；②#222 收窄形（倾向 A=读侧窄投影+contracts 新 JobPublicView·JobList 保留 recruiter 自有面）+ description 去留（倾向窄投影内保留供投递前可见·与 I3 时序独立）；③#223 识别形（倾向 b=CONSENT_PURPOSES 加候选人侧 purpose 同意门邮箱显示·零迁移 fail-closed；邀请邮箱持久化/备注列默认不入）+ purpose 命名（EXEC 定·倾向 `recruiter_contact_share`）；④#265 形（倾向 a=隐藏 checkbox——**rev2 席2-① 扩形：形 a 须同刀修 `settings/actions.ts` 发送体（`lang→locale`·删 `notify` 键·`locale` 已在 contracts 白名单·零后端改）或显式登记保存面残面另刀（只删 checkbox 不修 payload=保存钮红面原样留存·不得沉默）**；若裁「通知带偏好开关」则 b=改站内通知真开关）；⑤web 文案逐字值（KIND_LABELS 新标签/招聘方识别列文案——**rev2 席1-③ 邻接补句：详情页识别列文案随本项同裁**（识别列三页枚举见 §1-③）/设置页隐藏后措辞）；⑥迁移文件编号与命名（若裁①a·0162+ 函数级·EXEC 立项时按最新迁移序实 pin）。

---

*I4 INVITE-FACE REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`83a940c7` · 分支 `line/i4-invite-face` · 工作树 `meetwise-i4` · 蓝本=更正版 issues-master 候选四件+防漏两件（#221=:304/#222=:449/#223=:450/#265=:440/#131=:257/#62=:381 原文/修法列逐字）+ batch-residual-plan @`ab02d499` I4 行（#221/#222/#223/#265·INVITE-FACE·M）+ LEDGER :210 批3 段 + I3 卷 §0.1/§3-1 留置界线 + 形制 i3-job-mgmt-REQUEST（Ban/pins 同源誊录）· 收编四件=#221 通知残面（文案面已闭 b110）/ #222 回包子面（同意面已闭 #81）/ #223 / #265（四触面簇=通知写侧/回包收窄/同意门识别/开关诚实化）· 已闭子面零触=b110 恒定壳/#81 同意/I2 两态/#227 合一链 · 留槽=#131→5A/#62→5E · 真缝亲证=notification RLS WITH CHECK 限自插（§0.3）· 防重检查过（三处 I4 阶段标签+i2-b 留置注记·非终局·无同名卷）· 与 I3 函数/注册行级零重叠可并行 · est live=0 · pins 十一值照抄 · markers=0 · **rev2=2026-10-11 pre-exec 双审窄 FAIL×2 勘误落卷**（席1 三处方=#223 双锚→三锚 ：131 详情页/§1-③ 识别列三页枚举/§8⑤ 详情页文案邻接同裁；席2 五处方=#265 链如实改述 {lang,notify}→:33+contracts:312-321 .strict() 恒 400·notify 不落库·保存钮 base 红登记+裁决项④扩形同刀修 payload/§2-1 harness 三层重钉 neg:bend 应答臂+api 接线臂/§1-③ 新增独立同形投影函数消歧+0160 本体 Ban+§2-5 i2b:prove 入回归/§2-2 HTTP 收窄臂落点具名 :137→:310 形/smtp docs 例外+桶导出申报收窄；两席登记=R-1 计数 26 行 23 件/R-2 收窄锚重 pin/R-3 四处 ±1/残量口径 LEDGER 残 20 含 I3 未并主线/跨树引用事实/dependency-footprint 漂移归 5E——修法主干/四收范围/划界/§5 Ban+pins 实质零变） · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

---

## §10 nail 收据勘误与登记项随落（nail 席·2026-10-11·post-prove 双席 BOTH PASS）

**nail 面登记**：错峰探测后 `git merge --no-ff line/i4-invite-face` @ 主线 tip `c042729b`（merge(i3-job-mgmt)）——探测时 I3 nail 席 merge 中态（MERGE_HEAD 在场），60s 轮询 3 轮至 merge(i3-job-mgmt) 可见+锁释放后动手（22:41）。待并分支 tip `f5fa2f52`（EXEC 单提交，基线 080dc6a5=docs rev2·merge-base `83a940c7` 实测）。冲突 **3 文件逐块 dual-keep**（与派单预判清单有两处出入·照实登记）：① `apps/web/app/recruiter/jobs/[id]/page.tsx` 接口并集 hunk **keep-both**（HEAD/I3 侧 Job.description 字段 + I4 侧 Candidate.contactEmail 字段·两 interface 异字段零重叠·并后 `job.description`(:94)/`c.contactEmail`(:133) 双消费面亲证在位）；② `apps/web/test/web-logic.proof.ts` 尾位双追加 **keep-both**（I3 JOB-MGMT §2-4 节 I3-4a..4j 十断言与 I4 INVITE-FACE §A-§D 节 i4-265/221/222/223 七断言·两边断言节逐字全保留·I3 节中缝补自身收括号·I4 节沿用原共享收括号）；③ `packages/db/test/recruiter-depth.proof.ts` 两 hunk **keep-both**（断言节：I3 §2-1/2-2/2-3 十八断言 + I4 ⑧ 通知 gateway/识别投影九断言顺序并置·I4 节消费的 appId/inv3/TAG/pendRec 种子均共享区在位亲证；cleanup 节：I3 路由面夹具清理三表+job_posting ANY 超集删（覆盖 I4 侧 IN(jobA,jobB) 窄删=等价并集·I4 窄删行不重抄）+ I4 notification/consent_record/user_account 清理三行照录）。**派单预判①neg-bend.proof.ts「高概率冲突」实际自动合并零冲突**（实因：I3 侧从未动计数注释行仍 157·I4 侧 157→170 单侧改行·git 平凡并·两刀臂区不同位：I3 四端点负臂落 §1/§3 内部+I4 14a/14b/14c 独立节·keep-both 语义由 auto-merge 恰好达成·并后 `A(` 静态计数 178=157+8(I3)+13(I4) 算术互证）；contracts（createJob :1398 I3 / browseJobs :1409 I4 不同注册行）与 recruiter.service 不同函数零冲突=预判兑现。**意外冲突即上列②③两件·逐块 dual-keep 无语义纠缠·停止条件零触发。**

**复验五键（merge 后主线态实跑·nail 亲跑·keep-both 全量为准）**：`neg:bend` EXIT=0（**178 条负路径全绿**·计数注释行照实改写 170→178·§1 22→26/§3 10→14 系并入 I3 臂 4+4·照实注记）· `recruiter:prove` EXIT=0（**66 断言**=基线 39+I3 18+I4 ⑧ 九断言·算术互证）· `openapi:prove` EXIT=0（**92 断言**）· `web:prove` EXIT=0（**392 PASS**·I3 §2-4 节与 I4 §A-§D 节同跑全绿）· `migrate:prove` EXIT=0（**95 PASS**=既有机制锚零增减·fresh 全链含 0162/0163（在树）+0165/0166（I4）应用·再部署全链 skip 幂等·**0164 留白照实**（mig-runner 卷既定 claim·非本刀占用）·0165/0166 函数面另经 recruiter:prove/neg:bend 直证在位）——零新红零翻红·停止条件零触发。

**登记项随落（双席登记四件·disposition 节）**：
1. **markers「302 增行」口径勘误**：EXEC 收据口径「302 增行」系不含新件口径；`git show f5fa2f52 --numstat` 实测 **15 文件 434+/34−（含新件 0165/0166 迁移+23_api_gateway.sql 增量 194 行）**。实质 markers=0 双席独立复证维持（nail 席第三次复证见下 markers 门行）。
2. **收据锚漂三处照更（合并后主线态实测）**：恒定壳 `received:true` 收据锚 :143 → **recruiter.service.ts:189**；browseJobs 注册行收据锚 :1357 → **contracts/src/index.ts:1409**；CONSENT_PURPOSES 收据锚 :524 → **contracts/src/index.ts:571**（I3 并线致 contracts/recruiter.service 行号后移·三锚语义零漂·纯行号照更）。
3. **收据形备裁**：本刀无 `receipts/i4-invite-face/` 目录·收据取 **EXEC commit message（f5fa2f52）收据形照登备裁**（沿派单既定处置）·nail 面实跑读数以本节「复验五键」为准。
4. **R-席2-a/b/c 照登**：R-席2-a 通知 payload 不直显（`{jobId,jobTitle}` 键集=2·零 PII·web 读侧 KIND_LABELS 承接）=零 PII 纪律一致·后继观察项；R-席2-b 识别列显示邮箱=**账号邮箱非邀请原文**（邀请邮箱不落库·#131 大小写错位留 5A 边界不变·同卷 §0.1 判定）；R-席2-c base 同红三重印证（settings 保存钮 base 红等）系基线同红非独立复跑·如实保留口径。

**markers 门**：merge 新增行（`git diff c042729b..HEAD` 加行）五类标记词 grep 零命中 EXIT=1 亲证（命令与读数留本 commit）· est live=0 · ⛔push。
