# G4 FAILURE-PATH EXEC 收据（#59 错误裸透传 + #209 空题全额扣费 · 扣费诚实刀）

**席**: g4-exec（G4 FAILURE-PATH EXEC）· **Date**: 2026-10-10 · **Status**: `executed:awaiting_post_prove_dual`
**Base**: rebase 后 `feat/mysql-schema-skeleton` @`af13c627`（主线 tip；9cac8778 之后落 G2/G3-begin-guard(541a8f20)/HA-2(64522c62)/EVIDENCE/G3 merge+nail(af13c627)）· 分支 `line/g4-failure-path`（工作树 `meetwise-g4`）
**Rebase**: 零冲突（本分支仅 2 个 docs 提交=REQUEST 起草+rev2，新文件不与主线撞面）· 重 pin 全部码面锚后动刀
**交割**: W1（#59 分码映射·裁定①形制 A+裁定② voice 收编全兑现）+ W2（#209 空结果失败退额·裁定③ throw 落点全兑现）+ 断言落槽（§4.2/§4.3 rev2 形）+ 五门禁亲跑全绿 · est live=0 · 零 secrets · 零迁移 · markers=0 · pins 十一值零翻转

---

## §1 锚点重定位漂移表（@9cac8778 REQUEST 原锚 → @af13c627 EXEC 实树·逐锚亲读）

| 锚 | REQUEST 原值 | EXEC 实树（rebase 后） | 漂因/注 |
|---|---|---|---|
| InterviewPanel 提交失败臂 | :247-252（j+toast :247-248） | **:252-266**（:253 `const j=`/:254 原 toast 行→改 :256 `turnSubmitFeedback`） | G3 刀（进度徽标 :96-:99 canAnswer/progressBadge 区）整体 +4 行·与 W1 编辑区零重叠实证 |
| InterviewPanel 裸透传 toast | :248 | **:254（原）→ 已撤除**；现 :256 `const fb = turnSubmitFeedback(res.status, …)` | 本刀撤除 |
| InterviewPanel 回滚三行形 | :249-251 | **:260-262**（回滚回显/clearSubmitBridge/return·形不变） | +4 漂·形零改 |
| InterviewPanel voice 臂 message 死读数 | :196 | **:202**（已撤除·固定文案逐字兜底） | 裁定②收编 |
| InterviewPanel catch 文案「提交未成功，请重试」 | :256（rev2 勘误③→:258） | **:268** | 主线漂移累计 +10（G3 +4·本刀失败臂 +6 注记/映射行）；文案逐字零改（proof 静态接线④ PASS） |
| InterviewPanel 成功臂（setAnswer('')） | :255-256（rev2 席2③⑩） | **:264-265** | +9 漂·零改 |
| quiz-lifecycle facts | :26 | **:26 零漂** | — |
| quiz-lifecycle binding 块 | :28-38 | **:28-38 零漂** | — |
| quiz-lifecycle 事务开/confirm | :48/:50 | **:50/:57**（本刀 +3 注记行于 :47-49 与 :51-55·facts 拦截 +3 行于 :39-41） | 本刀自身行漂 |
| quiz-lifecycle 空题 throw | （新增） | **:56**（事务内·confirm(:57) 前·裁定③落点） | 新增 |
| quiz-lifecycle facts 拦截 throw | （新增） | **:42**（binding(:38) 后 dispatch(:47) 前） | 新增 |
| diagnosis-lifecycle facts | :32 | **:32 零漂** | — |
| diagnosis-lifecycle binding 块 | :34-44（rev2 勘误⑦） | **:34-44 零漂** | — |
| diagnosis-lifecycle empty_report 检 | :50 | **:57**（本刀上方 +7：facts 拦截 :45-48 + 注记） | — |
| diagnosis-lifecycle grounded throw | （新增） | **:58**（:57 empty_report 现检后、:60 事务开前·裁定③对称位） | 新增 |
| quiz-consumer catch 三件套 | :36-60（rev2 勘误⑨）·具名 :52/:55/:57/:59 | **:36-60 零漂**（具名 :52 markFailed/:55 failed/:57 终态事件/:59 release） | 消费者零改·退额走既有路径 |
| diagnosis-consumer catch 三件套 | :44-58 | **:36-58 区·具名 :51/:54/:56/:58 零漂** | 同上 |
| commerce.ts confirm/release/payerRouted/failInterviewAndRelease | :166/:203/:215/:224-227/:280（rev2 席2②④） | **全零漂·全文件零触**（git diff 实证 0 行） | 只新增调用点不改协议 |
| resume-quiz validate 滤空 | :25-30 | **:25-31（核心滤空 :29-30）** | 闭合行外扩 1·核心零漂 |
| resume-diagnosis groundedCount 字段/finalize 求和 | :41/:84 | **:41/:84 零漂** | — |
| interview-service 生成器闸两行 | :238/:275 | **:238/:275 零漂**（'empty_quiz'/'blank_question'·'empty_diagnosis'） | 鉴别子对照物 |
| interview-service 接地闸 | :261-284（rev2 勘误⑥→:261-286） | **:261-286 零漂** | 零触 |
| action-error.ts 410 常量 | :45 | **:47**（本刀 +2 注记行于 :45-46·export 补于 :47·值零改） | rev2 注记⑤授权面 |
| api interview.service `interview_not_active` 判定 | :325（rev2 勘误⑤称 :326） | **:325**（:324=answerableError 签名） | 见 §3 勘误之勘误⑤ |
| privacy.service 503 throw | :70（rev2 勘误⑧） | **:70 零漂**（controller :61-62 零漂） | pin 面只读实证 |
| server.ts 401 跳登录同参形 | :30（rev2 勘误②） | **:30 零漂** | — |
| quiz/page.tsx 简历名 select | :83（rev2 勘误⑪） | **:85**（`resumeOptionLabel(r)`） | G3 三页过滤刀改页致漂·G2 域零触（如实记账） |
| web-logic.proof ERRMSG-MAP section | :807-837 | **:811 起** | 主线 EVIDENCE+G3 dual-keep 卷并入致漂·既有断言零删改 |
| 蓝本 G4 行/清点表 | meetwise-line-entpay :89/:28/:30 | 未重读（席2 代证逐字命中 rev2 已落卷·本刀零依赖蓝本新增面） | — |

---

## §2 处方 10 条兑现表（rev2 落卷）

| # | 处方 | 兑现 |
|---|---|---|
| 1 | 洞A 处方①：401/409×2/410/兜底各行改 `turnSubmitFeedback` 纯函数输出断言（mock res 仅输入叙述·不做组件端到端 mock 执行） | ✅ web-logic.proof :1435 新 section 六断言纯函数输出（:1437-:1448 区）·EXIT=0 |
| 2 | 洞A 处方①：「作答保留+回滚零回归」改静态接线断言（read-file 四件）+「无 DOM 载体·静态+人工对账」记账 | ✅ 静态①-④ 四件全 PASS + 记账断言明写·`turnSubmitFeedback(` 失败臂接线/`j?.message` 全文件零残留/回滚三行形/:268 catch 文案逐字 |
| 3 | 洞B 处方②：0 题判据必走滤后路径（scripted items 全幻觉 refs:['Go']→图 validate 滤空）| ✅ quiz.proof :126 section ⑦ `allHallucinatedModel`（2 题全 refs:['Go']）→ 滤空 → throw |
| 4 | 洞B 处方②：诊断滤后 groundedCount=0 路径 | ✅ diagnosis.proof :185 section ⑧ `zeroGroundedModel`（3 维度 findings 全幻觉 refs·非空幻觉 refs 构造要点注记——非声明维度空 refs 是合法豁免面滤不掉）|
| 5 | 洞B 处方②：断言 `last_error==='quiz_empty_questions'`/`'diagnosis_no_grounded_finding'` **非**生成器闸 empty_quiz/empty_diagnosis | ✅ 两鉴别子断言逐字 PASS（quiz.proof :136-:137 / diagnosis.proof :194-:195 区）|
| 6 | 洞B 处方②：confirm 零调用 spy 放宽为等效观测（units 不变+consumed 账零新增） | ✅ 两处「等效观测」断言：`availableUnits` 回到 before + `entitlement_consumption.status==='released'`（quiz ⑦/diagnosis ⑧）|
| 7 | 席2 微漂①：catch 臂 :256→:258 | ✅ 实树终验 :268（累计漂移照录 §1）·文案逐字零改 |
| 8 | 席2 微漂②：登录跳转沿 server.ts:30 同参形 | ✅ :258 `router.push('/login?expired=1')`·server.ts:30 亲读零漂 |
| 9 | 席2 微漂③④：partial 判定 commerce.ts:203·payerRouted :224-227 | ✅ 只读对账零触（§1 表）·releaseConsumption 既有 payerRouted 路由自动正确（0157 企业行同走退额）|
| 10 | rev2 注记⑤：action-error.ts:45 常量补 export=非文案行·410 同一性走「import 单源」 | ✅ :47 `export const`（值零改）·turn-submit-error.ts 与 proof 同引 `INTERVIEW_PRIVACY_FENCED_TEXT`（同一性断言 PASS）|

**裁定①②③ 全兑现**：①形制 A（sibling `apps/web/lib/errors/turn-submit-error.ts`·`{text,action}` 异形分层照席1 注记）②voice :202 收编（:197-:199 既有 403/503/502 分码分支零改）③quiz 事务内 confirm 前（:50 事务开后 :57 confirm 前）/diagnosis 对称位（:57 empty_report 后 :60 事务开前）/facts 照原案 binding 后 dispatch 前（quiz :42·diagnosis :48）。

---

## §3 勘误之勘误⑤ 实证（EXEC 终验）

rev2 勘误⑤称「:325 签名行/:326 判定行」；复审勘误之勘误⑤称「:325 原稿已正」。EXEC 终验（`git diff 9cac8778 af13c627 -- apps/api/src/modules/interview/interview.service.ts` = **零 diff**；`sed -n '325p'` = `if (TERMINAL_INTERVIEW.includes(status)) return { code: 409, error: 'interview_not_active' };`；:324=answerableError 签名）：**勘误之勘误⑤ 成立**——rev2 勘误⑤ 系过度勘误，原稿 :325 即判定行。该文件本刀零触（409/410 api 面只读对账）。

## §4 门禁 EXIT 表（全部亲跑·全绿）

| 门 | 命令 | EXIT | PASS/FAIL | 基线对照 |
|---|---|---|---|---|
| web typecheck | `pnpm -C apps/web typecheck` | **0** | —（零新增错） | 基线 0·零回归 |
| web prove | `pnpm -C apps/web prove` | **0** | **309/0** | 基线 298 绿（G3 nail 口径）+ 本刀新增 11（纯函数 6+静态接线 4+记账 1）=309·既有断言零删改 |
| worker quiz（隔离） | `pnpm quiz:prove`（=run-e2e-isolated quiz:prove:raw） | **0** | **31/0** | 既有 23 全绿 + 新增 8（⑦ 鉴别子 4+⑧ facts 拦截 4）·隔离回执 iso-quiz-attempt3-green.json |
| worker diagnosis（隔离） | `pnpm diagnosis:prove`（=run-e2e-isolated diagnosis:prove:raw） | **0** | **43/0** | 既有 35 全绿 + 新增 8（⑧ 鉴别子 5+⑨ facts 拦截 4，其中夹具自证 1）·iso-diagnosis-green.json |
| neg:interview | `pnpm neg:interview` | **0** | **97/0** | 原值 97/97（G3 nail 同值）·零回归 |

隔离环凭据：fresh PG 容器 per attempt（`meetwise-e2e-<pid>-<ts>`·动态端口·nonce GUC）·MODEL_API_KEY/DASHSCOPE 全键族剥离（est live=0·模型面全 scriptedModelClient）·5 份 runner 回执 JSON 随卷（含 2 份红 attempts 存照）。

## §5 attempts 全账（Ban retry-to-green 如实记）

| attempts | 门 | 红因 | 处置 |
|---|---|---|---|
| web prove #1 | web prove | EXIT=1（309 中 1 FAIL=本刀新静态接线②）——**自陷**：本刀新写的两处代码注释含字面量 `j?.message` token，击穿自己刚落的「零残留」断言 | 注释措辞改写（撤 token 字面·语义不变）→ #2 EXIT=0。非基线红·非 retry-to-green 基线断言 |
| （误入）bare `pnpm -C apps/worker prove:quiz` | — | EXIT=1 `database_config_invalid:database_target_missing`——worker 包内脚本无隔离 runner env 结构性 fail-closed | 改走 root 隔离 runner 入口（既定配方）·非证明性运行 |
| quiz:prove #1（runner） | quiz | EXIT=1 于 section ⑦ enqueue：`resume_derivative_job_reference_parent_mismatch`——夹具 INSERT resume_quiz 行未带 typed reference，0061 trigger 要求 job 引用与父行一致（既有 22 断言全绿·产品码面零红） | 夹具四处 INSERT 补 resume_id/privacy_epoch → #2 |
| quiz:prove #2（runner） | quiz | EXIT=1 FAIL=3 全在 section ⑧ 夹具：`ingestResume('张三 <email> <phone>')` facts 非空——stripPii 先行把 '@' 掩码，联系形态判定失配致该行成 fact（**⑦ 鉴别子 3 断言已全绿**） | `tsx` 探针实证 phone-only 行 facts=[] → 夹具改 `'13800138000'`/`'13900139000'` → #3 EXIT=0 |
| diagnosis:prove #1（runner） | diagnosis | **首跑即绿** EXIT=0 43/0（quiz 侧夹具教训预套用） | — |
| neg:interview #1 | neg | 首跑即绿 EXIT=0 97/0 | — |

## §6 非范围/边界对账

- **扣费语义**：commerce.ts 全文件 0 行 diff（confirmConsumption/releaseConsumption/failInterviewAndRelease/applyAllocationDelta/1.0 常量/0157 路由全零触）——本刀只新增 throw 调用点，退额全走消费者既有 catch 三件套（markFailed+终态事件+release·0157 payerRouted 既有 handled 路由自动正确）。
- **partial 显式弃用**：0 题/grounded=0 全走 release 全退·无 ratio<1 收尾（rev2 §1 W2⑤ Ban 遵守）。
- **#232/#254/#257 归 G2 零触**·G3 显示面/进度徽标区零触·G1 域零触。
- **API 错误体形状零改**（turn 面 `{error:code}` 信封既有·全 API 面信封统一=登记后继非本刀）·接地闸/图语义零触·终态事件 payload 形状零改（reason 值域扩展 'quiz_empty_questions'/'diagnosis_no_grounded_finding'/'quiz_empty_facts'/'diagnosis_empty_facts' 如实记账=面向 job last_error 诊断面）。
- **action-error.ts 既有四页行/文案零改**（仅 :45 常量补 export+2 行注记·值零改·rev2 授权面）。
- **零迁移·零 secrets**·est live=0（W1 纯前端映射零外呼；W2 facts 拦截为减少注定空转外呼——隔离环 trace=0 断言实证）·markers=0·pins 十一值零翻转（privacy 503 throw :70 亲证原值）。
- **行号红线**：⛔push·⛔动主线·⛔触其他工作树·仅本工作树本分支 commit。

## §7 Non-claims

prove EXIT=0 ≠ DONE（claimDone=false·完成判定走 post-prove 双审+nail）·「失败退额」=预留全退（releaseConsumption 既有语义）≠现金退款承诺·`*_unavailable` 终态事件 reason 码≠面向前端的具体失败原因披露（前端文案仍分码中性）·组件行为面无 DOM 载体——静态接线+人工对账（web-logic.proof G4 section 记账断言明写）·410 引常量=文案单源复用≠新语义。

---

*G4 FAILURE-PATH EXEC 收据 · 2026-10-10 · executed:awaiting_post_prove_dual · rebase @af13c627 零冲突·锚重 pin 29 锚（§1 漂移表）·五门禁 EXIT 全 0 · 处方 10 全兑现·勘误之勘误⑤ EXEC 终验成立（:325 判定行·该文件 9cac8778→af13c627 零 diff）· attempts 全账 §5（web 2·quiz runner 3+误入 1·diagnosis 1·neg 1）· est live=0 · ⛔push*
