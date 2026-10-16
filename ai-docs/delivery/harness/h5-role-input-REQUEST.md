# H5-ROLE-INPUT REQUEST（ROLE-INPUT 后继刀：S2a 入口 + S2b 引导最小形 + #230 押题岗位输入 + api proof 8 红修锚与证据件替换 · 批2 残39 首组）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工）

**Status 链补全（nail 席 append-only 一次补登·2026-10-11）**：`draft:awaiting_pre_exec_dual` → executed:awaiting_post_prove_dual（EXEC e54fc551·翻面滞后由 nail 补登·如实记）→ **nailed**（post-prove 双席 BOTH PASS @2026-10-11·H5 簿记更正程序链追认终局：次桩系协调方修正·勘误 085f941a 为 EXEC 直接父提交·席1 时序亲证）。上文原 draft 态文字照录不改。

**席位**：ROLE-INPUT 后继刀起草席（北星 loop · 批2 残39 首组：ROLE-INPUT S2a/S2b/S3 + #266/#268/#199/#230/#133UI/#270 · 派单口径 2026-10-11；LEDGER C 表 :209 末印「批2 残 42」后 H4 六件+diag #213 等收口后的现行水位·以协调方对账为准）。
**基线**：`feat/mysql-schema-skeleton` @ **`f3a54577`**（本地主线 tip·`git log -1` 实测=merge(g7trio2) trio 全景重跑刀全链并主线）。**如实登记：`origin/feat/mysql-schema-skeleton` tip `6a7a3acc` 未含 route-dict 及其后全链而本地已含——以本地为 pin**（沿 role-input 卷 rev4 同款登记）。分支 `line/h5-role-input` · 工作树 `meetwise-h5`（仓根同级 worktree·`git worktree add` 本起草席已立·建前实查不存在·树/分支名均新）。
**蓝本**：①审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md`（#133=:203·#230=:307·#270=:352·#199=:435·#266=:441·#268=:442·六行行号实测核对一致）②ROLE-INPUT 刀史卷 `ai-docs/delivery/harness/role-input-REQUEST.md`（S1 已 nail:closed @`fb077b19`·S2a/S2b/S3 切片裁后继在卷 §1）③TASK-SOP-v2.md:57 批2 表行「ROLE-INPUT（#259+#266+#268+#199+#230）…已起草 @75238907」④LEDGER B-3（ROLE-INPUT @e0208e9f→@8fb2de35→@fb077b19「S2a/S2b/S3 slice 后继」）+2026-10-11 主层事件登记第2/4条（#270 可并 #201「并入裁定以本条为准」·role-input 证据件替换债「归原席」）⑤形制沿 `diag-honesty-REQUEST.md`@`790bd22c`（meetwise-diag 树·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读实测·base `f3a54577`·file:line 逐条 rg/sed/实跑复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 九件盘点总表（派单九件·逐件已解决?/归槽/触面聚类判定）

| 件 | issues-master | 现状实测（@f3a54577） | 判定 | 归槽 |
|---|---|---|---|---|
| api prove:role-input 红面（S1 落码后证据链修复债） | —（LEDGER 事件4「role-input 证据件替换债归原席」·H4 卷 post-prove 勘误①②） | **实跑 8 FAIL**（§0.2）·worker/web 两段全绿（§0.3） | 开放·修复归原席=本刀 | **片1-A（必做）** |
| S2a = #268 | :442 | Nav `candidateLinks`（Nav.tsx:35-45）与 dashboard `QUICK_ACTIONS`（dashboard/page.tsx:31-38）**零 `/roles` 链接**（全 web grep 仅 middleware/robots/页面自身）；roles/page.tsx 匹配结果行（:71-78）仅 title+匹配度徽·**无「用这个方向开始面试」CTA** | 开放（S1 未并·预写清单 C9 在旧卷） | **片1-C（必做）** |
| S2b = #266（本刀仅最小形） | :441 | login/page.tsx:14-58 signup 仅 email/password/身份 Tabs；auth-actions.ts:35 signup 成功直 `redirect('/dashboard')`·**零引导位**；画像存求职意向**无存储位**（user_account 零现成列） | 部分开放：引导位可零迁移落·**画像存储半=后刀**（存储位产品决策未决） | **片1-D（最小形）**+存储半后刀 |
| S3 = #199 | :435 | `is_default\|defaultResume\|default_resume` 全 db/api grep **零命中**；数量上限零（仅 8MB 单文件+dedup）；interviews/quiz 两表单 `defaultValue={eligibleResumes[0]?.id}`（page.tsx:93/:125·quiz:81）仅为 UI 首份默认非持久偏好 | 开放·**需迁移+「默认 vs 记住上次」产品口径**（旧卷 S3 裁后刀两理由均在） | **后刀**（本刀零触） |
| #230 | :307 | quiz 链全链无岗位输入：quiz.controller.ts:27-28 begin 仅 `resume-id` 头；quiz.service.ts:27/:63 begin→`enqueueQuizJob(c,owner,id,resumeId,privacyEpoch)` 零 role；quiz/actions.ts:11-19 同；quiz/page.tsx:76-87 仅简历 select；worker quiz-consumer.ts:33→quiz-lifecycle.ts:25 runQuiz 六参零 role→:48 quizGenerator(facts…)；**prompt `resume-quiz.generate` v1（prompts.ts:46-51）buildData 仅拼 facts·零岗位段**（对照 `resume-diagnosis.generate` :59-63 buildData 已有 `目标岗位:` 条件段=诊断链先例） | 开放·修法列明言「与『求职意向』（#259）共用目标岗位输入」=S1 同形镜像 | **片1-B（必做）** |
| #133 UI 面 | :203 | 三面均已被近期刀收口：**第0批词典面**=ROUTE-DICT v3 降级臂（candidate-profile-route.ts:29 policy `:v3`·:111-122 degraded decided 非 409）·LEDGER B-1/C 表批0「#133+#195+#270 ROUTE-DICT @9b8e7c4c·批0 15/15 全收口」；**第2批 UI 面（「目标岗位」可改 UI）**=S1 已落（interviews/page.tsx:133-136 Input+actions.ts:33-44 头）；**错误码必达面**=#251 码透传（interviews/actions.ts:24-28 映射命中透传原码·page.tsx:55-57 actionErrorMessage 渲染·action-error.ts:41/:85 ROUTE_UNDECIDED_TEXT 注记「rev3 后结构性不可达·映射行保留防御」） | **已解决（逐面列证）·本刀零新增改动** | §3 登记闭卷 |
| #270 | :352 | 路由静默误判面=v3 降级臂+泛词需上下文已收（同上 @9b8e7c4c·批0 账面收口）；**残余「与岗位叶子相关性校验」面**=LEDGER 2026-10-11 事件2 明裁「**#270 可并 #201**（issues-master :436/:475/:478 三行亲读·并入裁定以本条为准）」·#201（:475·planner 输出上限与相关性校验·adaptive-interview-service.ts 域）待 H2 EXEC 落线后立项（同文件相邻） | **本刀剔除·登记归 #201 后刀** | §3 登记转出 |
| worker role-input proof | — | 静态段 9 PASS；fixture 段须隔离 PG（bare tsx 跑 `database_config_invalid`=fail-closed 设计非锚损）·**`node scripts/run-e2e-isolated.mjs role-input:prove:raw` 实测全绿**（receipt .tmp/isolated-proof-receipts/2026-10-11T12-32-11-*.json） | 绿账在卷 | §0.3 只读 |
| H4 已落面查重 | — | weakness 线 R1-R8 已 nail @`9c4c0f9e`（h4 卷 nail 节·分支已清）·本刀不重做；#259 S1 已 nail @`fb077b19`；G7FIX 系已落（LEDGER 门4/背景节）；EVIDENCE #237/#255 已收（LEDGER 批1 终核 @`74895b7c`） | 全部不重做 | §3 登记闭卷 |

### 0.1 ROLE-INPUT 刀史（红面预存登记链·亲读）

S1（#259 消费面）已走完全协议：`nail:closed`（role-input-REQUEST.md :212）·merge @`8fb2de35`·nail @`fb077b19`·S2a/S2b/S3 切片裁定「可裁后刀」在其卷 §1（S2a 预写清单 C9：Nav+dashboard+i18n 两键）。TASK-SOP-v2.md:57 行「已起草 @75238907」**滞后于 S1 已 nail 现状**（SSOT 只读·本刀不改·EXEC nail 时由协调方另裁刷新）。

### 0.2 api prove:role-input 红面（**实测 8 FAIL·非登记口径 7**·本工作树实跑 `pnpm -C apps/api prove:role-input` EXIT=1）

FAIL 全集=**S3·S5·S6·S8·R1·R2·R3·R5**（PASS=S1·S2·S4·S7·R4）。红因三源定谳（逐源亲读）：

| 源 | 机制 | 实证 |
|---|---|---|
| **B271 片2 beginInterviewCore 抽取**（S5/S6/S8） | begin 事务体模块化：`interview.service.ts:96` `export async function beginInterviewCore(`·归一化 `:105` `const targetRoleNormalized = (targetRole ?? '').trim().slice(0, 100) \|\| undefined;`·payload 条件键改 startPayload 对象形 `:263-266`（`if (targetRoleNormalized) startPayload.targetRole = …`·不再逐字节返回旧三元表达式）；begin 本体 `:380-382` 纯委托 | proof 锚窗 `svc.indexOf('begin(principal')`→`'turn(principal'` 只罩住三行委托体——S5/S6/S8 三正则全部落空 |
| **B271 片2 扣额归一 DB 函数**（R1/R2/R3/R5） | `interview.service.ts:246-248` applicationId 非空走 `reserveEntitlementForApplication`→`packages/db/src/commerce/commerce.ts:117` `SELECT gateway_entpay_reserve($1,$2,$3,$4,$5) AS r`（0157·返回 `rows[0].r` 串 `kind:…` 形·:129-130 解析）；本刀 fixture=B 端绑定形（application_id='APP_BOUND'）恒走企业臂 | 一次性诊断脚本实测：begin 抛 `UNEXPECTED_SQL SELECT gateway_entpay_reserve(…)`——proof fake 桩单无此语句（旧桩=INSERT/SELECT/UPDATE entitlement_* 四件·已被函数取代）→ 未到 INSERT 即 throw→零 insert 捕获→R1/R2/R3/R5 FAIL；R4（alreadyBegun 短路在预留之前）不受影响。fake 桩单除 `SELECT gateway_entpay_reserve(` 主桩外，**必补** `SELECT status, allocations FROM entitlement_consumption WHERE id=$1`（commerce.ts:134 读回）次桩，返回 `{ rowCount:1, rows:[{ status:'reserved', allocations:[] }] }` 形（service 仅判 `rr.status`，allocations 空数组达标·照 commerce.ts:135 `?? []`）——单补主桩则 gateway 放行后 ：134 二次 UNEXPECTED_SQL，R1/R2/R3/R5 仍红。 |
| **H4 additive focus 第 7 参**（S3） | `interview.controller.ts:29` begin 尾参 `@Headers('focus') focus?: string`·`:30` 委托调用尾=`targetRole, focus)` | proof S3 正则 `/this\.interviews\.begin\([\s\S]*targetRole\)/` 要求调用以 `targetRole)` 收尾→落空 |

**登记对账**：h4 EXEC 账面称 7 FAIL·h4 post-prove 席1 勘误①（h4-weakness-REQUEST.md「post-prove 席1 勘误登记」节）已改判 **8 FAIL**（base=7·focus 参使 :48 S3 锚 PASS→FAIL）——与本席实测逐位一致。**证据件替换债**：`receipts/h4-weakness/api-role-input-preexisting-red.log` 实读=wrong-cwd ENOENT 空跑（`ERROR ENOENT … lstat '<zcode-workspace>/default/apps'`）不构成证据（h4 卷勘误②在案·LEDGER 事件4「归 B271 原席」）→ 本刀片1-A2 兑现替换。

**勘误登记（pre-exec 双审席2 处方落卷·2026-10-11）**：席2 窄面 FAIL 唯一阻断项=**R 组桩单缺读回次桩申报**·席2 处方句已逐字增补三处（本节 R 组红因行/§1-A1 R 条/§2.1 第 1 条）。程序链闭合说明：协调方已据席1 预警+席2 处方向 EXEC 下发两桩修正指令（EXEC 收据将登记「次桩系协调方修正补入」）。本勘误 docs-only·八断言判据/修法主体/§5 Ban/pins 零动·Status 维持 `draft:awaiting_pre_exec_dual`。

### 0.3 绿账基线（本工作树 2026-10-11 实测·EXEC 重跑更新）

worker role-input proof（apps/worker/test/role-input.proof.ts·静态 9 PASS+隔离库 ①②③④ 全绿，经 `run-e2e-isolated.mjs role-input:prove:raw`·runner :496/:504 已登记 worker+api 双 proof 文件白名单）；web 段 ROLE-INPUT 断言 `apps/web/test/web-logic.proof.ts:865-882`（5 断言）·`pnpm -C apps/web prove` 实测全绿 EXIT=0。**EXEC 门禁基线数以开工实测为准·禁引历史值**（沿 role-input 卷 §4⑤ 纪律）。

### 0.4 #230 押题链逐环锚（S1 镜像四段+图/prompt 两段·全亲读）

| 环 | 锚点 | 现状 |
|---|---|---|
| Q1 表单 | `apps/web/app/quiz/page.tsx:76-87` | `<form action={startQuizAction}>` 仅 resumeId select（:81 UI 首份默认） |
| Q2 action | `apps/web/app/quiz/actions.ts:8-19` | :9 仅读 resumeId·:18 begin 头仅 `'resume-id'` |
| Q3 controller | `apps/api/src/modules/quiz/quiz.controller.ts:27-28` | begin 仅 `@Headers('resume-id')` |
| Q4 service | `apps/api/src/modules/quiz/quiz.service.ts:27-28/:63` | begin(principal,id,resumeId)·:63 `enqueueQuizJob(c, owner, id, resumeId, privacyEpoch)` 零 role |
| Q5 传输 | `packages/db/src/jobs/quiz-jobs.ts:16-18`（enqueue）+ claim 读侧同文件 | 入队零 payload 形（列注释 :13「New jobs carry no JSON resume locator or role; both live in typed tables」——**该注释语义=简历 locator 禁令**；targetRole 为用户主动声明标量非 locator·照 S1 interview_job payload 先例豁免·收据须显式登记此解释） |
| Q6 worker 消费 | `apps/worker/src/quiz-consumer.ts:33` | `runQuiz(d.pool, owner, job.quizId, job.resumeId!, job.privacyEpoch!, d.model)` 六参 |
| Q7 lifecycle | `apps/worker/src/quiz-lifecycle.ts:25-48` | runQuiz 六参·:48 `buildResumeQuizGraph({ generate: quizGenerator(pool, owner, facts, …) })` 仅 facts |
| Q8 generator | `apps/worker/src/interview-service.ts:233` | `quizGenerator(pool, owner, resumeFacts, idempotencyKey, model, progressStream?)` 零 role 形参 |
| Q9 prompt | `packages/ai-runtime/src/prompts.ts:46-51` | `resume-quiz.generate` **v1** system「仅依据 <data> 内的简历事实出 3 道…」buildData 仅拼 facts·零岗位段；**同文件先例** `resume-diagnosis.generate` :59-63 buildData `const role = v.role ? \`目标岗位:${String(v.role)}\n\` : ''` 条件拼段 |
| 先例链 | diagnosis 全链（§0.0/旧卷 R14） | diagnosis.controller.ts:27-28 头→service :26-28 归一化→**typed 列 target_role 落库**（:100 读回·diagnosis-jobs.ts:13「role live in typed tables」）→diagnosis-lifecycle.ts:20-28 父行读→generator 第 4 参→prompt 条件段。**注意**：诊断链走 typed 列（有迁移）·押题链本刀走 **job payload 标量（零迁移）**=S1 interview 链先例——两先例并存·本刀择 payload 形并在收据登记择由 |

### 0.5 S2a/S2b 落点锚（全亲读）

Nav `apps/web/components/Nav.tsx:35-45` candidateLinks 九项零 /roles；dashboard `apps/web/app/dashboard/page.tsx:31-38` QUICK_ACTIONS 六项零 /roles；i18n `apps/web/messages/zh.json`/`en.json` 零岗位匹配键（Nav 标签混用 t() 与字面中文——/roles 行可循 :40-41「押题/找工作」字面中文先例·i18n 压力可免·EXEC 裁）。roles 匹配结果行 roles/page.tsx:71-78（`matches.map` title+Badge）——CTA 落点；interviews 表单 searchParams 现读 `{ limit?, error?, reused? }`（interviews/page.tsx:34-36）——prefill 形 additive 加一键。S2b 引导位落点=dashboard/page.tsx 顶部（Candidate 卡区上方）·与 S2a **同文件强相邻**（QUICK_ACTIONS 同文件）故并片1；auth-actions.ts:35 redirect('/dashboard') 为既有落点零改。

### 0.6 漂移登记与重 pin 免责

issues-master 六行行号（:203/:307/:352/:435/:441/:442）实测**零漂**；LEDGER :238 派单引称「role-input 7 checks 预存红在 LEDGER :238」**行号漂**——真身=h4 `901dc223` 提交注记「预存红如实登记（api prove:role-input 7 checks=…）」+h4 卷 post-prove 勘误节+LEDGER 2026-10-11 事件4，逐处亲读在案。旧 role-input 卷全部行号基于 `3c3406bd`/`9b8e7c4c` 旧基线·本卷全锚重实测；EXEC 立项照 §0 重 pin（漂移如实改锚·结论不变只更行号）。

---

## §1 修法（按触面聚类四片·逐件修法列誊录·file:line 实锚·EXEC 立项重 pin）

### 片1-A 红面修复组（归原席债·零产品码·必做）

- **A1 proof 修锚**（`apps/api/test/role-input.proof.ts`·八断言判据全数保留·只修锚不弱化）：
  - S3：controller 透传锚随 7 参现状更新（`…, targetRole, focus)` 收尾形·正则照 :30 实锚改写·断言语义「targetRole 仍透传 service」零变）。
  - S5/S6/S8：锚窗改罩 `beginInterviewCore` 函数体（`:96` 起）——S5 归一化表达式锚 `:105`；S6 改断 **startPayload 条件键**（`:265` `if (targetRoleNormalized) startPayload.targetRole = targetRoleNormalized;`·缺省零新键=现状字节语义保持·具体串照实锚）；S8 alreadyBegun 相对位锚随新窗重算（`:221/:226` 在 normalize 之后的既有查询面语义保持）。
  - R1/R2/R3/R5：fake 桩单补 `SELECT gateway_entpay_reserve(` 前缀桩（返回 `{ rowCount:1, rows:[{ r: 'reserved:…' }] }` 形·串面形制照 `commerce.ts:129-140` 解析实测钉；旧行 record INSERT 面不变）——**断言对象（payload JSON 三形+截断+幂等）逐字节保留**。fake 桩单除 `SELECT gateway_entpay_reserve(` 主桩外，**必补** `SELECT status, allocations FROM entitlement_consumption WHERE id=$1`（commerce.ts:134 读回）次桩，返回 `{ rowCount:1, rows:[{ status:'reserved', allocations:[] }] }` 形（service 仅判 `rr.status`，allocations 空数组达标·照 commerce.ts:135 `?? []`）——单补主桩则 gateway 放行后 ：134 二次 UNEXPECTED_SQL，R1/R2/R3/R5 仍红。
- **A2 证据件替换**：以本刀红面对照跑真实日志替换 `receipts/h4-weakness/api-role-input-preexisting-red.log`（修后该文件应记录：修复前 8 FAIL 全输出+CMD+EXIT=1·修复后 EXIT=0 对照·或按 h4 卷勘误②「真实对照跑日志」口径落双段）·替换为纯收据面动作·零码。

### 片1-B #230 押题岗位输入组（S1 同形镜像·修法列「与 #259 共用目标岗位输入」）

| 项 | 锚点 | 目标 |
|---|---|---|
| B-1 表单 | quiz/page.tsx:76-87 | 简历 select 下加「目标岗位」可选 Input：`name="targetRole"`·`maxLength={100}`·placeholder 镜像 interviews 形制（「可选，如：后端工程师（留空按简历出题）」） |
| B-2 action | quiz/actions.ts:9/:18 | :9 增读 targetRole（trim）·:18 begin 头真值门增 `'target-role'`（空/缺省不发头=现状字节） |
| B-3 controller | quiz.controller.ts:27-28 | 增 `@Headers('target-role') targetRole?: string` 透传 |
| B-4 service | quiz.service.ts:27/:63 | begin 增可选参+归一化 `(targetRole ?? '').trim().slice(0, 100) || undefined`（诊断 :28 同形）·:63 `enqueueQuizJob` 增可选 payload 实参（undefined→现状字节） |
| B-5 传输 | packages/db/src/jobs/quiz-jobs.ts（enqueue+claim） | enqueue 增可选 `targetRole`（在场才写 payload 键）；claim 读侧 additive 补 `payload->>'targetRole'`（resume locator 语义/查询形状/lease 复核零动·沿 interview-jobs S1-4 additive 同门） |
| B-6 consumer | quiz-consumer.ts:33 | 增读 role 实参下传（undefined 容忍·旧 job 缺键零崩） |
| B-7 lifecycle | quiz-lifecycle.ts:25/:48 | runQuiz additive 第 7 参→:48 传入 generator |
| B-8 generator | interview-service.ts:233 | quizGenerator additive role 形参→promptedModel 变量增 `role`（缺省 undefined=现状字节） |
| B-9 prompt | prompts.ts:46-51 | `resume-quiz.generate` **v1→v2**：buildData 增 `目标岗位:` 条件段（镜像 resume-diagnosis :59 形·role 缺省逐字节回退 v1 产物·system 出题边界句零弱化「仅依据简历事实/refs 接地」全句保留） |

**并存语义**：押题 role 纯消费面（无路由/无门）——留空=v1 现状逐字节；填=进 prompt data 段·**不改 factuality 门/额度/结算/事件链**（quiz-lifecycle :52-90 零触）。

### 片1-C #268 入口组（S2a·修法列「加入口与『用这个方向开始面试』」）

- C-1 `Nav.tsx:35-45` candidateLinks 增 `{ href: '/roles', label: '岗位匹配' }`（位置 EXEC 裁·建议 /jobs 邻位）。
- C-2 `dashboard/page.tsx:31-38` QUICK_ACTIONS 增 `/roles` 行（Icon 沿既有 lucide 集·d 文案含「匹配」可断言）。
- C-3 roles/page.tsx 匹配结果行（:71-78）增「用这个方向开始面试」链接=`/interviews?targetRole=<m.title>`（encodeURIComponent）；interviews/page.tsx:34-36 searchParams additive 增 `targetRole?`·Input :136 `defaultValue` 消费（仅初值·用户可改=修法列「可改的 UI」语义；码面校验照旧零新增）。
- C-4 i18n：Nav 标签循 :40-41 字面中文先例可零 i18n 改动；若 EXEC 裁走 t() 则 `messages/zh.json`/`en.json` 各加一键（二选一·收据注明）。

### 片1-D #266 最小形组（注册引导位·零迁移零存储）

- D-1 dashboard/page.tsx（C 端·candidate 视角）顶部增一次性引导卡：「完善求职方向，面试更贴你」+两链接（去 /interviews 填目标岗位·去 /roles 匹配方向）——**纯前端静态卡**·零新存储零 API 零迁移；显隐规则从简（EXEC 裁：恒显或沿既有 reused/error 提示位形制）·**不假称已存偏好**（文案禁「已记住你的岗位」类虚假声明）。
- D-2 **画像存储半（user_account 求职意向列+3 步引导流）=后刀**（存储位产品决策未决·旧卷 S2b 裁定理由照录）——本刀不闭合 #266 全项·issues-master 行仍为部分面·nail 登记如实。

**切片裁定建议（起草席）**：片1-A/B/C/D 同刀 EXEC（A 零产品码·B=S1 成熟镜像·C/D 同文件 web 面低风险）；S3(#199) 与 #266 存储半后刀。若协调方裁缩，A 必做（原席债不可再挂）、B 次之、C/D 可拆。

**触碰面收束**：`apps/api/test/role-input.proof.ts`、`receipts/h4-weakness/api-role-input-preexisting-red.log`、`apps/web/app/quiz/{page,actions}.tsx`、`apps/api/src/modules/quiz/{quiz.controller,quiz.service}.ts`、`packages/db/src/jobs/quiz-jobs.ts`、`apps/worker/src/{quiz-consumer,quiz-lifecycle,interview-service}.ts`、`packages/ai-runtime/src/prompts.ts`（**仅 resume-quiz.generate 节**·planner.competencies v3 节=H4 面·零字节）、`apps/web/app/roles/page.tsx`、`apps/web/app/interviews/page.tsx`（仅 searchParams+defaultValue 两处）、`apps/web/components/Nav.tsx`、`apps/web/app/dashboard/page.tsx`、（若裁 i18n 形）`apps/web/messages/{zh,en}.json`、新增 proof 槽位文件（quiz 段断言落槽·§2）+ 相应 package.json/`scripts/run-e2e-isolated.mjs` 白名单登记。**零迁移·零词典/供给链面（candidate-profile-route.ts/candidate-route.ts 零字节）·零 interview 产品链行为变更**。

---

## §2 验收断言候选（api 8 红修复断言设计为重点·pre-exec 双审核对单基面·EXEC 重 pin）

1. **修锚后 8+5 全绿**：`prove:role-input`（api）EXIT=0——S3/S5/S6/S8 锚命中新窗·R1/R2/R3/R5 桩单放行后 payload 断言逐字节同旧判据（R1 截断 100/R2 空白→undefined 零新键/R3 缺省现状字节/R5 trim 写入）；既有 PASS 五项零翻（S1/S2/S4/S7/R4）。fake 桩单除 `SELECT gateway_entpay_reserve(` 主桩外，**必补** `SELECT status, allocations FROM entitlement_consumption WHERE id=$1`（commerce.ts:134 读回）次桩，返回 `{ rowCount:1, rows:[{ status:'reserved', allocations:[] }] }` 形（service 仅判 `rr.status`，allocations 空数组达标·照 commerce.ts:135 `?? []`）——单补主桩则 gateway 放行后 ：134 二次 UNEXPECTED_SQL，R1/R2/R3/R5 仍红。
2. **对照收据**：修前 8 FAIL 全输出+修后 EXIT=0 双段日志落 `receipts/role-input/`·并兑现 A2 证据件替换（h4 证据债闭卷）。
3. **worker/web 回归**：`run-e2e-isolated.mjs role-input:prove:raw` 全绿（worker ①②③④+api proof 双文件白名单已在 runner :496-504）；web-logic.proof :865-882 五断言零翻·`pnpm -C apps/web prove` EXIT=0。
4. **B 片断言（S1 矩阵镜像）**：①填岗位 begin → prompt v2 userData 含 `岗位:<用户串>`（捕获型 ModelClient spy·沿 worker role-input proof 形制）且 facts 接地句零弱化；②留空 → userData 与 v1 逐字节一致（缺省回退负断言）·payload 无 targetRole 键；③归一化三形（超 100 截断/纯空白→undefined/缺省）落 api 侧 quiz 段 proof 或并入 role-input api proof 增段（落槽 EXEC 裁·收据注明）；④幂等/旧 job 缺键容忍不崩。
5. **C/D 片断言**：静态源断言（web-logic.proof 增 section·沿 :875-882 形制）——Nav/dashboard 各含 `/roles` 行；roles 匹配行含「用这个方向开始面试」+href prefill 形；interviews page searchParams 读 targetRole+Input defaultValue 接线；dashboard 引导卡含「目标岗位」文案且**无偏好存储虚假声明**（负断言）。
6. **回归面随改随核**：`pnpm interview:prove`+`neg:interview`+web typecheck EXIT 原值·基线数开工实测禁引历史值（沿 role-input 卷 §4⑤）。
7. markers=0（§7）+est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **#270 剔除登记**：路由误判面已随 ROUTE-DICT @`9b8e7c4c` 收口（批0 账面）·残余「岗位叶子相关性校验」面并 **#201** 后刀——LEDGER 2026-10-11 事件2「并入裁定以本条为准」·本刀零触 adaptive-interview-service 上限/校验面。
2. **#133 闭卷登记**：词典面（route-dict）+UI 面（S1）+码透传面（#251）三面已收（§0.0 逐面列证）·**规则复现样本回归集**归 E2E 刀（派单分工·route-dict prove 75/59 绿账在 LEDGER 门3·E2E 刀可裁增量样本）·本刀零新增。
3. **S3/#199 与 #266 存储半不进本刀**：默认简历（迁移+口径两门）·求职意向画像存储列（存储位产品决策）均后刀·本刀零迁移零新列。
4. **H4 已落面零触**：planner.competencies v3 节/weakness-backfill/memory-store/growth 面（prompts.ts 同文件分节隔离·仅触 resume-quiz.generate 节）。
5. **EVIDENCE/G7FIX 已收面不重做**：#237/#255（@`74895b7c`）·G7FIX 系（LEDGER 门4）零触。
6. **押题链行为边界**：factuality 歪曲门/额度预留结算/事件与 SSE/quiz 题数与评分（resume-quiz 图 validate/make_report 节）零字节·prompt system 出题边界与 refs 接地纪律句零弱化。
7. **ROUTE-DICT 词典与仲裁零触**：candidate-profile-route.ts 词典/policy/降级臂·candidate-route.ts 供给链零字节；interview begin 链（beginInterviewCore 归一化/payload/额度路由）零字节——本刀修锚仅测试文件。
8. **#45 级别/迁移/secrets 零面**；SSOT 只读（LEDGER/TASK-SOP/issues-master 不改·nail 时协调方另裁）。

## §4 依赖

**与 H2（QBANK-CORPUS·meetwise-h2q）零文件交集**（逐文件对照实测：H2 触面=qbank-seed/qbank-ingest/adaptive-interview-service/interview-consumer/routing(job-route-decision·candidate-route)/crag/main/qbank-track-local-*（h2 卷 §5.1 锚复现单亲读）vs 本刀触面（§1 收束）——**零重叠→本刀可独立 EXEC·不须等 H2**）。注记：#200/#201（并 #270）后刀与 H2 同文件相邻（adaptive-interview-service.ts）故排 H2 后——本刀不涉该排队。隔离 PG 依赖：Docker 本机可用（起草席实测 `docker info` OK·runner 全绿）；EXEC 无 Docker 环境时 worker 段按 fail-closed 环境红如实登记禁凑绿。零前置刀·零新库表零迁移零 secrets。

## §5 Ban 列表 + pins（沿 diag 卷 §5 同源逐字誊 + 本刀面增补）

**Ban 列表**（diag 卷 §5 基列逐字誊·diag 自增补条不适用本刀者略·本刀增补随列）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（本节 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（本刀零迁移）；Ban 触其他工作树；Ban 伪造已问/已验来源（零机制现状不假称既有）。**本刀增补**：Ban 弱化既有断言（修锚=换锚不换判据·8 断言判据逐条保留）；Ban 以修锚名义触产品码（interview begin 链零字节）；Ban 词典/供给链触碰（§3-7）；Ban 押题留空面行为漂（v1 缺省回退逐字节）；Ban prompt 边界句弱化（refs 接地/严禁编造句零改）；Ban 偏好存储虚假声明（D-1 卡零「已记住」类文案）；Ban #270/#133/S3/#266存储半 走私入刀（§3-1/2/3）；Ban 证据件替换造假（A2 须真实对照跑日志·ENOENT 空跑不得再充证据）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE /privacy/interview-data/:id=503（supersession 注记：简历/账户轨=202 软删受理沿 UNSTUB-ERASE 现行值·interview-data 面原值不动——沿 h4 卷 :100 最新精确形；**登记差异**：diag 卷 :109 作「公开 DELETE=503」无注记·本卷采 h4 形）· g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼·零消耗）

## §6 est live=0

本刀零模型外呼：①A 片=proof 桩单/锚面修复（fake client·零网络零 Key）②B 片 prompt 断言=捕获型 ModelClient spy/静态（不实调 LLM）③C/D 片=web 静态源断言。零生产操作·零 secrets·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

EXEC 改动集**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 diag/h2 卷同形制）。本卷自身为 docs-only 恰 1 .md。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**（拟 `mw-rag-route`（quiz prompt/图域主审）+`mw-e2e-ha`（web 入口/proof 诚实副审）·实现方禁自审自批）；②**协调方明示授权**（含切片裁定：片1-A/B/C/D 范围·C-3 CTA 与 C-4 i18n 形制·D-1 显隐规则）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

## §9 nail 收据勘误与登记项随落（nail 席·2026-10-11·post-prove 双席 BOTH PASS）

**nail 面登记**：`git merge --no-ff line/h5-role-input` @ 主线 tip fe55a2ab——20 文件 587+/38−·**零冲突**（三交叠文件 web-logic.proof.ts/prompts.ts/run-e2e-isolated.mjs 均不同区域自动合并）；post-prove 双席 BOTH PASS（席1 实现核对+程序链核对 PASS + 席2 验收回归 PASS·互盲独立）·loop 协调方本次派单即 nail 授权（含 H5 簿记更正程序链追认终局）。

**登记一（中间态实证件·席1 独立复现结论记档）**：席1 独立复现——fake 桩单**单补** `SELECT gateway_entpay_reserve(` 主桩（无 `entitlement_consumption` 读回次桩）→ gateway 放行后 `commerce.ts:134` **二次 UNEXPECTED_SQL·insertCount=0** → R1/R2/R3/R5 仍红。与卷 §0.2 R 组红因行/§1-A1 R 条/§2.1 第 1 条「次桩必补」处方三处互证闭合；结论记档入卷（本节）·零码。

**登记二（locator 豁免解释收据/卷注记补一行）**：`quiz-jobs.ts:14-16` 实文「**New jobs never carry a resume locator in JSON.**」（:14-15 主句+:16 触发器复核句）——该句语义=简历 locator 禁令；#230 `targetRole` 为用户主动声明标量非 locator·沿 S1 `interview_job` payload 先例**豁免**（代码侧豁免注释已随 EXEC 在位 quiz-jobs.ts:16-18·本行为收据面补登一行·卷 §0.4 Q5 旧引注 :13 旧文「New jobs carry no JSON resume locator or role; both live in typed tables」已被 EXEC 实文取代·如实记）。

**登记三（行号微漂三处照更·并后 HEAD 实测）**：卷面锚行号照更，结论零变只更行号（沿 §0.6 免责同款）——①consumer `quiz-consumer.ts` runQuiz 调用 :33→**:34**；②generator `interview-service.ts` quizGenerator 定义 :233→**:235**；③quiz service `quiz.service.ts` begin 归一化 :27→**:31**·enqueueQuizJob 实参 :63→**:66**。

---

*H5-ROLE-INPUT REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`f3a54577`（origin `6a7a3acc` 未含如实登记·以本地为 pin）· 分支 `line/h5-role-input` · 工作树 `meetwise-h5` · 九件盘点=S2a/S2b(min)/#230/api 8红修锚+证据件替换入片1·#133 三面已收闭卷登记·#270 剔除归 #201·S3/#199 与 #266 存储半后刀· H2 零文件交集可独立 EXEC · est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
