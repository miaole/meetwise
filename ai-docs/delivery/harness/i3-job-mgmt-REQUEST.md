# I3 JOB-MGMT REQUEST（批3 段18 首组 · B 端作业管理面 · #219/#220/#258/#197 · M-L 体量）

**Status**: **`executed:awaiting_post_prove_dual`**（I3 EXEC 落卷 2026-10-11·三簇实施+§2 七条断言全 EXIT=0+§2-6 回归集六目标绿+基线专用 worktree 双绿收据·详见 `receipts/i3-job-mgmt/exec-receipt.md`·prove EXIT=0 ≠ DONE·走 post-prove 双审+nail · ⛔push）。原文：**`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）

**席位**：#批3 段18 I3 JOB-MGMT EXEC 任务书起草席（北星 loop · 批3 残余组 · B 端作业管理面 · M-L 体量）。
**基线**：`feat/mysql-schema-skeleton` @ `f3a54577`（主线最新 tip·`git log -1` 实测 2026-10-11 20:15 +0800·merge(g7trio2)）。分支 `line/i3-job-mgmt`·工作树 `meetwise-i3`（`git worktree add ../meetwise-i3 -b line/i3-job-mgmt` 本起草席已立·建前 worktree list 实查不存在）。
**蓝本**：①审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` 候选九件（#218=:187/#220=:303/#221=:304/#222=:450/#223=:450/#131=:257/#62=:381/#227=:452/#258=:294·原文+证据列+修法列逐字誊录见 §0.2/§1）②分组蓝本=batch-residual-plan @`ab02d499`「批3 残余 → 6 组」表 I3 行（**I3=「#219/#220/#258/#197+#227」**·锚点线索逐字）③LEDGER `product-campaign-LEDGER.md` :210 批3 段（3/23·残 20）④形制沿 `diag-honesty-REQUEST.md`（meetwise-diag 树 @`790bd22c`·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `f3a54577`·file:line 逐条 rg/sed 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 已终局防重检查记录（今日教训·强制项）

- `rg -l "i3|JOB-MGMT|job-mgmt" ai-docs/delivery/harness/ ai-docs/delivery/execution-master-checklist.md`（base `f3a54577` 实跑）→ 命中 **2 件**：①`execution-master-checklist.md`——逐处核验 :646/:745/:749 均为 **FI3**（GAP-UC004-FI3-GRAPH-WIRING）子串撞车，**非 I3 JOB-MGMT 终局节**；②`harness/i2-b-deliverable-REQUEST.md`——:79 分槽注记「#219/#220/#258/#197（I3 JOB-MGMT）/ #221/#222/#265（I4）」+:137 同域排程注记，**非终局卷**。
- harness/ **无同名卷** `i3-job-mgmt-REQUEST.md`（ls 全表实测）。→ **停止条件未触发·可建树落卷**。
- i2-b 卷 :137 并发预警照录：I3 与 I4 同触 recruiter 域——行号以 EXEC 时实树重 pin 为准；并发照 G4 例登记零重叠。

### 0.1 盘点总表（候选九件+防漏三件·逐件已解决?/归槽判定·双表对勘=LEDGER :210 残 20 单×batch-residual-plan 批3 残余 I1-I6 组）

| 件 | issues-master | 已解决? | 实树判定锚（`f3a54577` 实测） | 归槽 |
|---|---|---|---|---|
| #218 | :187 P1 面完即 assessment_unavailable 零定性产出 | **已闭**（I2 B-DELIVERABLE 已落面） | `recruiting/recruiter.ts:155-178` held/failed 两态派生·`:367-369`/`:430-442` `application_held_not_retryable` 守卫·`jobs/page.tsx:35-36`「已面完 · 待校准」徽·`:50`/`:182` `b_qualitative_share` 同意门·`applications.service.ts` 拒因 409 | 已闭·本刀零触 |
| #219 | P1 route_unresolved 终态无重试/招聘方不可见 | **开放** | §0.3 | **I3 收** |
| #220 | :303 P2 岗位编辑/下线只有 DB 函数无 HTTP/UI | **开放** | §0.4 | **I3 收** |
| #221 | :304 P2 邀请文案忽略真实状态/无通知 | **部分面** | 文案面已随 b110 中性化（`recruiter/jobs/actions.ts:52-56`「已受理；若对方是注册求职者将收到邀请」恒定壳·非「已邀请」宣称）；**通知残面开放**（invitation 零写 notification·模块现 `packages/db/src/notification/notification.ts`） | 留 **I4** |
| #222 | :450 P3 listOpenJobs 回包过宽 | **开放** | `recruiting/recruiter.ts:17/:21` COLS 仍含 `owner_user_id, description`；同意面 D6/D7 已并入 #81 purpose（I2 W3 已落候选人侧） | 留 **I4** |
| #223 | :450 P3 候选人仅 8 位 id 不可识别 | **开放** | `recruiter/jobs/[id]/page.tsx:79` + `recruiter/talent/page.tsx:103` `slice(0, 8)` 双锚亲证；第三锚 `recruiter/jobs/[id]/applications/[applicationId]/page.tsx:131`（照席1/席2 登记 EXEC 更锚补录·非本刀触面·留 I4） | 留 **I4**（招聘方候选人识别） |
| #227 | :452 P3 start/begin 两调用间隙 | **已闭**（随 #271 片2 解除·LEDGER :210 nail 宣告） | `applications.service.ts:47-53` 注释「B271 片2 S2-C4（修法⑤·#227 缺陷收口）：start+begin 服务端动作合一——企业预留与申请状态迁移同一事务」（:44-51→:47-53 照席1/席2 登记 EXEC 更锚·只更行号）亲证 | 已闭·转本刀依赖上下文（§4） |
| #258 | :294 P2 岗位输入过薄/JD 匹配宣称 | **开放** | §0.4 | **I3 收** |
| #131 | :257 P2 大小写邮箱邀不到 | **开放·非本刀** | 邀请侧 `recruiter.service.ts:121` trim+toLowerCase·注册侧 `auth.service.ts:34/:39` 原样存储——错位仍在 | 留 **5A**（硬依赖 #111 邮箱归一含存量迁移·非作业管理面） |
| #62 | :381 P3 Server Action 路径未编码 | **开放·非本刀** | `jobs/actions.ts:13` `` `/jobs/${jobId}/apply` `` 无 encodeURIComponent | 留 **5E 批量**（一致性小改·非行为缺陷） |
| #197 | :474 P3 岗位输入不进 planner（防漏件） | **开放** | §0.5 | **I3 收** |
| #224 | :305 /jobs 静默 402（防漏件） | **已闭** | `jobs/page.tsx:42-44` searchParams 读 error + `:71-73` actionErrorMessage 渲染亲证（批0 15/15 口径） | 已闭·零触 |
| #265 | settings 通知开关无发送（防漏件） | 开放 | 归 I4 族（residual plan I4 行原文含 #265） | 留 **I4** |

**归槽结论**：I3 JOB-MGMT 收编恰 **4 件 = #219/#220/#258/#197**（与 residual plan I3 行五件中 #227 已闭解除后的净面一致；与 i2-b 卷 :79 分槽注记完全对勘）。LEDGER :210 残 20 中 #218 已由 I2 落面（待总对账席刷新）、#225/#233/#234/#235/#262-264/#267→I5、#239→I6、#239 外通知族→I4——本刀均零触。

### 0.2 漂移登记（issues-master 证据列旧锚 @`2fab7946` vs `f3a54577` 实测·DIR-B2 域文件夹化 @`8262d976` 主因）

| 旧锚 | 现锚（实测） |
|---|---|
| `packages/db/src/recruiter.ts` | `packages/db/src/recruiting/recruiter.ts`（域文件夹化 pure-mv） |
| `packages/db/src/job-route-decision.ts` | `packages/db/src/routing/job-route-decision.ts` |
| `packages/db/src/notification.ts` | `packages/db/src/notification/notification.ts` |
| `recruiter.ts:79-111`（closeJob/updateJob） | `recruiting/recruiter.ts:79`（closeJob）/:90（updateJob）——**且两函数已带 `assertPrincipal(c, owner)` owner 谓词**（#220 备注所列「closeJob UPDATE 无应用层 owner 谓词」已在域文件夹化面内修复·updateJob `:95` `WHERE id=$1 AND owner_user_id=$2 FOR UPDATE`） |
| `recruiter.ts:21,128-131`（listOpenJobs COLS） | `recruiting/recruiter.ts:17`（JobPosting 接口）/:21（COLS 串） |
| `job-route-decision.ts:181,235-236,286-313` | `routing/job-route-decision.ts:181`（noop already_unresolved）/:226-236（dispatched_unknown/known_not_sent 落 unresolved）/:104/:118/:124（:119→:118 照席1/席2 登记 EXEC 更锚·只更行号） |
| `interview-consumer.ts:343-355` | `interview-consumer.ts:380`（`snap?.allocations?.[0]?.leafTrackId`·planner 面仍取 [0]）；#:281 检索面用全部 allocations 加权（#197 备注更正面·如实照录） |
| `contracts index.ts:297-301,1103,1123-1128,290-293,1121-1125` | `contracts/src/index.ts:362-366`（JobView）/:367（JobList）/:1332（registry createJob `response: JobView`）——CreateJobDto description ≤8000 字面未逐行重 pin（EXEC 重 pin） |

**重 pin 免责**：本节锚为起草席 base `f3a54577` 一次性亲读；EXEC 立项/双审照例全量重 pin，漂移只更行号不改结论；I2/I2-B 卷 :137 同款先例。

### 0.3 #219 实锚（路由 sticky 终态·招聘方零可见零重试）

- `routing/job-route-decision.ts:14` 头注逐字：「dispatched_unknown / known_not_sent / validation_rejected 是 **sticky 终态，永不自动重试**」；`:29` `JOB_SEMANTIC_REVISION_STATUSES` 含 `route_unresolved`；`:104` 返回形 `{ status: 'route_unresolved'; decisionId; attemptOutcome: 'known_not_sent'|'dispatched_unknown'|'validation_rejected'; reasonCodes; modelCalls }`。
- 落库：`:119` INSERT / `:124` UPDATE `status='route_unresolved'`；`:226-236` dispatched_unknown（seam 显式）与 known_not_sent（模型主动拒分）两臂。
- 重试闸：`:181` `if (r.status === 'route_unresolved') return { status: 'noop', reason: 'already_unresolved' }`——**unresolved 后同 revision 重跑被 noop 拦死**（修法须解锁重试形·EXEC 裁决项）。
- 招聘方可见面零命中：`rg route_unresolved|route_status|routing apps/web/app/recruiter/jobs/ apps/api/src/modules/recruiter/` → 零命中（exit=1 实测）——招聘方看不到路由状态，岗位仍显示招聘中，候选人 start 恒 409 `interview_ineligible_route`（`applications.service.ts` 拒面·B271 期已配诚实 message「该岗位路由尚未就绪…请待岗位补充描述并完成路由后再试」·候选人侧已诚实·**招聘方侧管理面零出口**=#219 核心）。
- drain 管道已备：`recruiter.service.ts:15/:29` createJob 后 `notifyWorkerJobWakeup`（R2 P-API）→ `apps/worker/src/main.ts:643-644` sole worker route-classify consumer 常驻 drain（R2 P-WORKER）——**route_pending 新 revision 会被自动 drain**，重路由管道在·缺的是触发触达与可见性。

### 0.4 #220/#258 实锚（岗位编辑/下线+JD 表单）

- HTTP/UI 零接线：`recruiter.controller.ts` 全端点实测 = `:19` POST /recruiter/jobs·`:25` GET /jobs·`:31` GET /talent·`:40` GET /jobs/:id·`:45` GET /jobs/:id/candidates·`:52` GET qualitative·`:57` POST /jobs/:id/invite——**无 updateJob/closeJob 任何 HTTP 形**（#220 修法列「updateJob/closeJob 无调用方」仍准·全仓 rg 零命中）。
- DB 面已备（只差接线）：`recruiting/recruiter.ts:79` closeJob（`assertPrincipal`+`WHERE status='open'`）·`:90` updateJob（owner 谓词+行锁+`:108` **语义变化即写新 revision `route_pending`**——编辑后自动重路由的 DB 侧管道已在 §0.3 drain 链就位）。
- 契约错位：`contracts/src/index.ts:1332` createJob 注册 `response: JobView`（`:362-366`）而实实现 `recruiting/recruiter.ts:23` 返回 `Promise<{ id: string }>`——#220 第三子面（契约声明 JobView 实际只回 {id}）仍准。
- 表单薄：`JobCreateForm.tsx:42-49` 仅 idempotencyKey hidden + title（`:44-45`）+ competencies（`:48-49`）——**无 description/JD 字段**（后端 `CreateJobDto` description 已支持·仅表单缺=#258 复核更正原话）。
- 宣称仍在：`dashboard/page.tsx:37` 「看岗位,做简历×JD 匹配。」——岗位无 JD 输入且不进 planner，宣称无兑现源（#258 修法列「未实现前删去 JD 匹配宣称」）。

### 0.5 #197 实锚（岗位输入不进 planner）

- `interview-consumer.ts:380` `const primary = snap?.allocations?.[0]?.leafTrackId;`——planner/role 面仍取 allocations[0]（多叶子岗位不按权重分配·#197「不按权重排序」为推断·如实照录）；检索面 `:281` 用全部 allocations 加权（#197 备注更正面·非本条缺陷）。
- 路由快照只含路由产物：worker 只读 route snapshot（#197 证据列原口径），岗位 title/description/competencies 本体不进 planner 输入。
- 注释与实现不符（#197 复核并入面）：`recruiter.service.ts:12` 「岗位 competencies 驱动出题」——实现为路由快照 allocations[0]。

## §1 修法（三触面簇·四件修法列逐条固化·file:line 实锚·EXEC 立项重 pin）

### ① 岗位编辑/下线接线面（#220 修法列逐字：「补编辑/关闭接口与 UI；表单加 JD」）

- **HTTP 面**：`recruiter.controller.ts` + `recruiter.service.ts` 补 updateJob/closeJob 端点（形制沿既有 `:19` POST jobs 同域先例·路由形=EXEC 裁决项①·倾向 `PATCH /recruiter/jobs/:id` + `POST /recruiter/jobs/:id/close`）；service 直接接线既有 DB 函数（`recruiting/recruiter.ts:79/:90`·**owner 谓词已内建零重写**）；contracts registry 补两操作注册。
- **契约如实化**：createJob 注册 `response: JobView` vs 实回 `{id}` 错位（§0.4）——EXEC 裁决项②（倾向 registry response 改 `{id}` 形如实化·或实现扩回 JobView·二选一不并做）。
- **UI 面**：`JobCreateForm.tsx` 加 description（JD）字段（后端已支持·≤8000 字）+ 岗位列表/详情页编辑与关闭入口（`apps/web/app/recruiter/jobs/` 现有页域内）；关闭=二次确认后调 close 端点。
- **编辑后自动重路由**：零新增管道——updateJob 已写新 revision route_pending（`:108`）·sole worker drain 已在（`main.ts:643-644`）——HTTP 接线后链路自通；本簇只接线不重造。

### ② 路由可见+重试面（#219 修法列逐字：「可重试的路由状态 + 招聘方可见；补岗位编辑（#220）后自动重路由」）

- **招聘方可见**：招聘方岗位列表/详情（`GET /jobs`·`GET /jobs/:id` 页域）暴露语义路由状态（`route_pending/route_decided/route_unresolved` 枚举 `job-route-decision.ts:29`）+ reasonCodes/attemptOutcome 摘要——读侧新增（db 读函数+service 透传+web 渲染·零迁移：`job_semantic_revision` 表已在）；文案须含状态可断言字样（EXEC 裁决）。
- **重试入口**：route_unresolved 行加「重试路由」动作——形制=EXEC 裁决项③（倾向 re-enqueue：清 sticky 闸写新 attempt/新 revision 后 `notifyWorkerJobWakeup` 走既有 drain·**不动 sticky 枚举语义本体**）；`:181` noop `already_unresolved` 拦死语义须随重试形解锁（锁「同 revision 原地重跑」·放行「新 attempt/revised 重投」）。
- **Ban 内禀**：known_not_sent/validation_rejected 等终态枚举与 fail-closed 语义零改（模型主动拒分不因重试按钮变成自动无限重试——重试=招聘方显式动作·可计数·有界）。

### ③ JD 供给 planner+宣称如实化面（#258 修法列逐字：「岗位表单加 JD/级别/必考能力并喂给 planner；未实现前删去『JD 匹配』宣称」+#197 修法列逐字：「岗位 competencies/JD 摘要作为 planner 输入；多叶子按权重分配」）

- **表单**：JD/description 字段已并入 §1-①；**级别/题库/评分口径输入默认不入本刀**（须新列=迁移·默认零迁移纪律见 §3-6/§5；EXEC+协调方若裁入则回炉补审）——「必考能力」=competencies 既有字段已覆盖。
- **喂 planner（#197）**：`interview-consumer.ts:380` planner/role 面输入补岗位 competencies（+JD 摘要·摘要形制=EXEC 裁决项⑥）——经路由快照/绑定链透传，不破「worker 只读快照」取数纪律（新字段进 snapshot 或经 job_posting 读侧·EXEC 定）；多叶子按权重分配为**顺手面**（allocations 权重已在快照·若快照缺权重列则登记残面不硬造）。
- **注释如实化**：`recruiter.service.ts:12` 「岗位 competencies 驱动出题」随实现到位后改为如实表述（或实现兑现注释·二选一·EXEC 裁决）。
- **宣称如实化（#258）**：`dashboard/page.tsx:37` 「看岗位,做简历×JD 匹配。」——EXEC 裁决项⑤：JD 喂 planner 落地后**兑现**（匹配面真实存在）或删宣称；**禁保留无兑现源宣称**（修法列原意）。

## §2 验收断言候选（api prove/neg:bend 形制·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **updateJob 语义变更→重路由断言**：`recruiter:prove`（根 `package.json:209-210` → `packages/db` recruiter prove）新增：updateJob 改 competencies/description → 新 revision `route_pending` 落库断言（`recruiting/recruiter.ts:108` 链）；unchanged 编辑零 revision 断言（`recruiting/recruiter.ts:101-103` unchanged 短路·:98-99→:101-103 照席1/席2 登记 EXEC 更锚·只更行号）。
2. **closeJob owner/状态谓词断言**：他主 close → false/404；closed 后再 close → false；close 后候选人 apply/start 拒（404/409 族·与既有 interview_ineligible_route 拒面并列·neg 臂）。
3. **#219 可见+重试断言**：mock model 拒分（known_not_sent）→ 岗位读面含 `route_unresolved`+reasonCodes 断言（招聘方视角）；重试动作 → drain 后状态翻转断言（mock model·**不实调 LLM**）；未决岗位候选人 start 409 面零回归（既有断言 EXIT 原值）。
4. **#258/#197 供给断言**：表单含 description 字段静态源断言（沿 `apps/web` prove `A('…', /正则/.test(readSrc(…)))` 静态先例）；planner 输入含岗位 competencies/JD 摘要断言（worker prove·mock·断言 prompt/输入组装产物非模型输出）；dashboard 宣称与实现对齐断言（宣称文案存在 ⇒ 匹配供给面存在的同源断言·或宣称删除断言·随裁决项⑤）。
5. **契约面断言**：contracts registry 两新操作注册断言 + createJob response 如实化断言（随裁决项②方向）。
6. **回归面随改随核**：`pnpm neg:bend`（`package.json:107`·`ci.yml:152` per-push 既有）+ `pnpm recruiter:prove` + applications/jobs 既有 prove 全 EXIT 原值·base 同红登记不洗（E5 流程·批前实测基线入收据）；I2 已闭面（held 两态/`application_held_not_retryable`）零翻零触（§5 增补 Ban）。
7. markers=0（§7）+ est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **I4 INVITE-FACE 界线（划清）**：#221（邀请状态文案残面+站内通知）/#222（listOpenJobs 回包去 owner_user_id）/#223（候选人识别·slice(0,8) 双锚）/#265（通知开关）——**全不触**（residual plan I4 行原文四件·i2-b 卷 :79 分槽同源）；本刀触 recruiter/jobs 域仅限岗位本体面（创建/编辑/关闭/路由），邀请/候选人列表渲染面零触；同文件并发照 G4 例登记零重叠。
2. **E2E 场景面归矩阵循环刀**：recruiting-bound.spec 纳入 per-push/nightly（#226·5D CI 面）与 B 端 E2E 场景扩充归矩阵循环刀——本刀 prove 只认 api prove/neg:bend/recruiter:prove/web 静态先例（§2 形制）·零新增 Playwright 场景。
3. **#131/#111 邮箱归一不并**（5A·含存量迁移）；**#62 encodeURIComponent 不顺手**（5E 批量·独立小改防面混）。
4. **#218/#224/#227 已闭零触**：I2 held 两态面/`application_held_not_retryable` 守卫/b_qualitative_share 同意门（`recruiting/recruiter.ts:155-178/:430-442`·`jobs/page.tsx` 两态渲染）与 start/begin 合一链（`applications.service.ts:44-77`）语义字节零动——只作回归面（§2-6）。
5. **#271 企业付费面零触**（I1=片3 打磨 R1-R4 残面·LEDGER §D 表）；企业额度/预留语义零改（§1-① 接线不碰 commerce 面）。
6. **级别/题库/评分口径新列不入**（默认零迁移·§1-③）；任何迁移冲动=停手上报回炉（Ban 迁移越权）。
7. **I5 文档三态（#225/#233/#234/#235/#262-264/#267）/I6 合规（#239）零触**；bend-recruiting.md 规格文档不随本刀改（归 I5·如 EXEC 收据需注记实现状态只列行不入卷）。
8. **est live=0**：零模型真实外呼（重试/供给断言全 mock·§6）·零生产操作·零 secrets。

## §4 依赖

**零未决硬依赖**。①#227 已闭=上下文非阻塞：start/begin 合一先例与企业预留同事务形制已在（`applications.service.ts:44-77` 亲证·本刀零回归触）；②#271/#40c 已解锁（residual plan I3 行 🔒 记原文：「🔒#271 已解锁·企业预留同事务」）；③重路由管道已备（`recruiting/recruiter.ts:108` revision 写入 + `main.ts:643-644` sole drain·§0.3）——本刀=接线面·无前置刀。**并发面**：与 I4 同域（recruiter 域）若并发派程·照 i2-b 卷 :137 同域排程注记与 G4 例登记零重叠（本刀=岗位本体面·I4=邀请/候选人识别面·文件交集见 §3-1）。

## §5 Ban 列表 + pins（沿 diag 卷 §5 同源·逐字誊 + 本刀面增补）

**Ban 列表**（diag 卷 §5 同源逐字誊 + 本刀面增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（本刀默认零迁移·级别/题库/评分口径列不建·迁移冲动=停手上报）；Ban 触其他工作树；Ban 伪造已问/已验来源（零机制现状不假称既有）；**本刀增补**：Ban 触 I4 面（邀请文案/站内通知/owner_user_id 回包/候选人识别·§3-1 四件零触）；Ban 动 I2 已闭面与 start/begin 合一链（#218/#224/#227·§3-4 零回归触）；Ban 改 sticky 终态枚举语义（known_not_sent/validation_rejected/dispatched_unknown fail-closed 本体零改·只加重试触发与可见性）；Ban 无界自动重试（重试=招聘方显式动作·有界可计数）；Ban planner 面伪造岗位侧输入（JD/competencies 供给须真实接线·禁 mock 数据进生产路径）；Ban 保留无兑现源宣称（「JD 匹配」宣称与实现须对齐·§1-③）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 mock·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：①路由可见/重试断言=mock model（§2-3）②planner 供给断言=输入组装面静态/mock 断言（§2-4·不实调 LLM）③编辑/关闭/契约断言=db prove+静态源断言。prove 全 mock/静态·零生产操作·零 secrets·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/i3-job-mgmt-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 diag 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：①closeJob/updateJob HTTP 路由形（推荐 PATCH /recruiter/jobs/:id + POST /recruiter/jobs/:id/close）；②createJob 契约 JobView vs 实回 {id} 如实化方向（推荐 registry response 如实化）；③#219 重试形（推荐清 sticky 闸写新 attempt/revision + notifyWorkerJobWakeup 走既有 drain·`:181` noop 解锁仅对新 attempt 放行）；④级别/题库/评分口径输入是否入本刀（推荐不入·零迁移·留后继）；⑤dashboard「JD 匹配」宣称兑现 vs 删除（随③供给落地度·推荐兑现）；⑥JD 喂 planner 的摘要形制与快照透传路径（快照扩字段 vs 读侧 join·EXEC 定·禁破 worker 只读快照纪律）；⑦两态可见文案逐字值（路由状态徽/重试按钮/关闭确认）。

---

*I3 JOB-MGMT REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`f3a54577` · 分支 `line/i3-job-mgmt` · 工作树 `meetwise-i3` · 蓝本=更正版 issues-master 候选九件（#218=:187/#220=:303/#221=:304/#222/#223/#131=:257/#62=:381/#227=:452/#258=:294 原文/修法列逐字）+ batch-residual-plan @`ab02d499` I3 行（#219/#220/#258/#197+#227）+ LEDGER :210 批3 段 + 形制 diag-honesty-REQUEST（meetwise-diag 树·Ban/pins 同源誊录）· 收编四件=#219/#220/#258/#197（三触面簇=编辑下线接线/路由可见重试/JD 供 planner+宣称如实化）· 已闭三件零触=#218(I2)/#224(批0)/#227(片2) · 留槽=I4 四件/#131→5A/#62→5E · 防重检查过（FI3 撞车非终局·无同名卷）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

---

*§9 EXEC 附记（2026-10-11·§0-§8 原文零改·仅 §0 免责条款授权的四处行号更锚与本状态行 append-only）*：预执行双审 BOTH PASS（席1 盘点裁定+席2 验收回归·互盲独立）后协调方派单开工。三簇全落：簇① contracts 四注册（updateJob PATCH+closeJob POST+getJobRoute GET+retryJobRoute POST）+createJob response 如实化 JobView→JobCreated（裁决②）+UpdateJobDto 原样前移（TDZ·冻结语义零改）+controller 四端点+UI JD 字段/编辑/下线（二次确认）/重试入口；簇② db 读面两函数+retryJobRoute（裁决③ 新 revision+显式动作·sticky 闸 :181 字节零动·`job-route-decision.ts` 全文件零 diff 亲证）+web 文案单源含可断言枚举字样（裁决⑦）；簇③ prompt planner.competencies v3→v4（job 缺省与 v3 逐字节一致四态断言）+读侧 join 供给（裁决⑥·RLS+快照同源 digest 门）+allocations[0] 改道条件化（最高权重·#197 顺手面）+dashboard 宣称兑现向（裁决⑤·I3-4j 同源蕴含断言）。§2 七条全 EXIT=0（recruiter:prove 57 PASS 含席2④ noop already_unresolved 显式断言·neg:bend 165 条·openapi 92·web/i3-jd-supply/r2-prereq/binding/wakeup 全绿）·基线专用 worktree 双绿（neg 157/recruiter 39·主树批前 4 次 boot infra 红如实登记非产品红）·est live=0（全 mock/静态·零 Key 零外呼）·markers=0（改动集 grep EXIT=1 亲证）·零迁移（迁移冲动零发生·H2 占 0162/0163 不入本树）·pins 十一值零翻转·SSOT 零触·I4/I2 已闭/enterprise/邮箱归一/encodeURIComponent 全零触 · 冲突预判清单+陷阱自检表+增强回归四条（adaptive-consumer/role-input/g7fix4-finalize/resume-grounding）见 `receipts/i3-job-mgmt/exec-receipt.md` · ⛔push · claimDone=false 走 post-prove 双审+nail · alone≠dual*
