# KILL-SWITCH-ENTRY REQUEST — 内容安全开关 applications.start 第三入口收口刀（D6 #239-① 后继收口·闸放 beginInterviewCore 核首语句共享位·起草卷）

**Status**: **`executed:awaiting_post_prove_dual`**（四处钉：本 Status 行 + §8 + §9 + 卷尾注 · 2026-11-05 起草席落卷 · 2026-11-06 pre-exec 双审行使：ksw-2 证伪 PASS+ksw-1 架构 FAIL→修订席同刀 re-pin 落 `607013edb`→会签 PASS·EXEC 授权随令行使（只吸收会签 P2 卷文字+§0 对届 tip 重 pin·零产品码新增）·门读数落 §9-7 · 待 post-prove dual）。

**席位**：内容安全开关绕过修复起草席（协调方派单·主仓 meetwise main `92a82a944` cap 2486·worktree `../meetwise-ksw` 分支 `line/ksw-draft`）。本刀 = uc50 卷 §1.5 (a)「产品接线刀清单登记归用户裁决队列」的后继行使：applications.start 绕行残余的产品码收口（登记面证据已由 uc50 卷 EXEC 三证据臂落卷·本刀只做接线收口+负臂证明）。
**基线**：`origin/main` @ **`92a82a944`**（#209 perf-status-pin 并线点·`git fetch origin` 本 turn EXIT=0·worktree `git worktree add ../meetwise-ksw -b line/ksw-draft origin/main` 亲立）· `node scripts/ai-docs/check-docs.mjs` 本树起草前亲跑 **EXIT=0 · scanned 2486=cap 2486 恰等零余量**· `pnpm install --frozen-lockfile` EXIT=0。
**出处（不自建 SSOT 行）**：①uc50 卷 §1.5 (a) 清单（产品接线刀登记归用户裁决队列·本刀=协调方对该队列的派单行使）；②killsw 卷 §1.1/§1.3-⑤/§3-1 三处显式留「修复=产品码触·出域归产品刀」；③协调方派单令（本卷任务书·步骤 1-8 含「写复现断言修复前确实开始面试并产生预留/入队」「枚举所有入口逐个判定」「负测三态」「cap 两 policy 脚本步进 main 届扫+1（预期 2487）」）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse/rg 亲算 @`92a82a944`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

**EXEC 重 pin 已兑现（2026-11-06·届 tip `607013edb`）**：`git fetch origin main` EXIT=0（网络两连中断后重试成）·origin/main 仍 `92a82a944` 未前进=零 rebase 零冲突·cap union 实测=本树 tip 届扫 2487=cap 2487 恰等；下表 blob/行锚全按 tip 重算如实更新（基线值括注）——六件漂移（interview.service/neg-interview/uc050 proof/两 policy 脚本+REQUEST 自身）·五件同 blob（applications.service/controller/content-safety/i6/kill proof/_neg-harness）·**机制结论零翻**（闸接线形状=方法闸恰 2+核首语句共享闸 1·两生产者同闸·start 直调面已入闸·§0.2 rg 亲证承旧值更新）。

### 0.0 防重 + 在飞交叠登记

- `git ls-tree` 全本地 refs rg `kill-switch-entry` 零命中（本卷落卷后唯一同名卷）；`line/ksw-draft` 本 turn 亲立零前史。
- 本刀触面：`apps/api/src/modules/interview/interview.service.ts`（行内 additive+映射体模块化）+ `apps/api/test/neg-interview.proof.ts`（§11 additive）+ 两 policy 脚本（cap 步进·链注追加不改写既有注记）+ 本卷 1 .md。`apps/api/src/modules/jobs/applications.service.ts`/`applications.controller.ts` **零触**（修法=核首语句共享位·start 的 catch 对非 enterprise HttpException 原样重抛→503 具名码透传·产品面零改）。
- 在飞如实采（上注 CAP-SANCTION-2486 届枚举承旧）：pay/uc31 各 ahead=1 两 policy 零触；其余已并/已撤/ancient 不预采。

### 0.1 blob 锚表（**2026-11-06 EXEC 对届 tip `607013edb` 重 pin**·`git rev-parse 607013edb:<path>` 亲算·8 hex·行数亲点·基线 `92a82a944` 值括注）

| 文件 | blob（行数）@tip | 关键行锚（tip 值） |
|---|---|---|
| `apps/api/src/modules/interview/interview.service.ts` | `3970bca1`（933·基线 `a8ae0d15`/918） | **`:112-120` `beginInterviewCore` 头注自钉「begin 端点与 applications.start 合一事务共用本函数」=同核双生产者**（基线 :93-101 段）· `:121` core 导出 · `:128` 核首语句共享闸 `denyContentSafetyKilledShared()`（`:125-127` 注·先于 `:129-130` resumeId 校验=基线 :106-107 校验前零 kill 检查已随修复合法翻转）· `:308` `enqueueInterviewJob('start')`（产品 src 全树唯一 start 入队生产者·基线 :285）· `:93-110` 共享映射体模块化（`:98` 导出·`:102-107` 具名码+503=基线 `:335-347` 映射体上移）· `:360-362` `private denyContentSafetyKilled()` 委托共享体 · `:440` begin 口 / `:451` turn 口（基线 :425/:436）·**`this.denyContentSafetyKilled();` 全树恰 2 处**（tip 亲 rg）· `:486` `enqueueInterviewJob('answer')`（唯一 answer 入队生产者·基线 :471） |
| `apps/api/src/modules/jobs/applications.service.ts` | `e1bf8ff0`（121·**同基线零触**） | `:44` `start()` · `:45` preview 写门（非 kill 闸）· `:53-54` asPrincipal 合一事务 `startApplicationInterview` CAS · `:56-63` try/catch（`:57` `beginInterviewCore` 直调=基线绕行面·**修复后由核 `:128` 共享闸覆盖**·`:59-61` catch 仅 `enterprise_insufficient_balance`→402 映射·**余者原样重抛**=503 透传承接面）· `:66-86` 状态分码表 · `:83` noop 空壳 200 行（core 前短路·核闸不可达=边界面 §1.4-⑤） |
| `apps/api/src/modules/jobs/applications.controller.ts` | `e12e76fd`（39·**同基线零触**） | `:21-26` `@Post(':id/start')` `@HttpCode(OK)`→`applications.start`·controller 零闸零中间件 |
| `apps/api/src/platform/content-safety.ts` | `50f8c9c3`（43·同基线） | `:4-9` 契约文注「at the api begin/turn entries」「nothing model-facing is enqueued while it is on」· `:15-21` 三态 fail-closed（unset/`0`=off·`1`=engaged·余者 throw `invalid_meetwise_content_safety_kill_switch`）· `:27-33` 专名错误类 · `:39-43` assert 闸（env 词面全树恰 `:16`/`:40` 两处·tip 亲 rg） |
| `scripts/i6-239-gates.proof.mjs` | `339f92f4`（201·同基线零触） | `:52-53` `callSites`（interview.service.ts 单文件 `this.denyContentSafetyKilled();` 计数）硬钉 `=== 2`（tip 实测 2 恒绿）· `:119` applications.service.ts 零触断言 · 改动集恰符申报清单臂（对本刀外来改动集按设计红=预期形非本刀门·§9-3 承登） |
| `apps/api/test/neg-interview.proof.ts` | `4f7e5f62`（805·基线 `afd63185`/674=§11 additive 落码 +131） | §1-§10 既有臂零动·§11 KSE 三口负臂在场（合计注按 runtime 实测更正承登 §9-4·`:797-803`）·§10 背压闸臂=本刀 §11 前驱（IV_BPT/IV_ACTB 夹具复用）·`_neg-harness` `:61-62` 模型钥自剥（harness 同基线） |
| `apps/api/test/uc-e2e-050-nhp-start-bypass.proof.ts` | `11f6cb30`（564·基线 `e51a280f`/537=同刀 re-pin §9-6①） | **re-pin 后形状**：SB1 kill=1 start→503 具名码+零放行形状（start 腿 iv 缺省 `'none'` `:135`·双口差分「同 interviewId」成名义=描述面·会签 P2 承登）·SB2 off 四元字节保真零动·SB3 kill 臂全零净账+off 臂谓词保真且加强（桶 +1.00 仅 off 臂·CAS 拆两臂=极性必改·会签 P2 承登）·SB4 形状锚行号无关（方法闸恰 2 首处 begin 次处 turn/共享体+private 委托在场/核首语句先于 resumeId/start 零内联闸改名承自共享位）·SB5 i6 `callSites === 2` 一致性·47 断言（基线 46·零删减）·**基线「绕行残余在」登记已被本刀合法翻转·EXEC 亲跑 EXIT=0 47/47（§9-6①/§9-7）** |
| `apps/api/test/uc-e2e-050-nhp-kill.proof.ts` | `641000dd`（599·同基线零触） | begin/turn 双口 kill 收据先例（K1/K2 503 具名码·K3 off 对照·K4 非法值 500 opaque·K5 双闸优先序·env 窗仅测试进程）——本刀 §11 臂形承源·零触只读 |
| `scripts/ai-docs/public-text-policy.mjs` | `006d288d`（609·基线 `6f6ec8aa`/608=链注追加 +1） | `:311` `MAX_FILES = 2_487`（cap 恰等亲证·基线 :310 `2_486`）·`:310` CAP-SANCTION-2487 链注追加落点（既有注记零改写） |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `1578107c`（522·基线 `1fb5103a`/521=链注追加 +1） | `:452` loop `i < 2_487` · `:459` atCap `2_487` · `:461` overCap 错误串 `PTP_FILE_LIMIT:2488` · `:503` `f-2487.md`（四联动点 tip 亲点·基线 `2_486`/`f-2486.md`/`:2487`）·`:502` CAP-SANCTION-2487 链注追加 |
| `apps/api/test/_neg-harness.ts` | `9768b323`（330·同基线） | `boot()` 只灌 sql 01..23 镜像+选载迁移（0104/0123 不在内=§11 夹具幂等直载的依据）·`:61-62` 模型钥自剥 |

### 0.2 机制锚（rg 亲证·基线 @`92a82a944` 起草·**EXEC 对届 tip `607013edb` 重算**·结论零翻行号随 tip 更）

- `beginInterviewCore` 调用面（apps+packages·非 spec）：`interview.service.ts:446`（begin 口·闸后）+ `applications.service.ts:57`（start 合一事务·基线**零闸前置**=结构性绕行亲证·修复后由核首语句共享闸 `:128` 覆盖）=同核双生产者·**修复后恰两生产者同闸**（tip 亲 rg）。
- `enqueueInterviewJob` 生产面（产品 src 全树）：`interview.service.ts:308`（'start'）+ `:486`（'answer'）**恰 2 处**=模型面入队全图；worker src 零 enqueueInterviewJob 调用（worker 只消费·`claimNextInterviewJob` 侧）。
- `MEETWISE_CONTENT_SAFETY_KILL_SWITCH` 词面全树恰 `content-safety.ts:16`/`:40` 两处（tip 亲 rg）；不在 env-schema 注册（设计内·三态自校）；不在 provider-egress 清单环境名集（`provider-egress-policy.mjs` rg 0 命中亲证=本刀 proof 引用零登记义务）；`RAG_JOB_ROUTE_INPUT_HASH_KEY` 同（neg-bend 先例形测试值补齐）。

### 0.3 认领登记

认领=uc50 (a) 产品接线刀的 applications.start 收口面（本卷）；**不认领**：UC-052 擦除/导出域、UC-018 图面、killsw/uc50 卷史录（零洗零触）、backlog 直书（翻面权归协调方）、worker 消费面与 preview 写门（§1.4 判定为语义外·只登记不接线）。

---

## §1 交付面（机制链亲证 @`92a82a944`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 入口全景枚举（能启动面试或推进作答的全部入口·逐个判定闸覆盖）

| # | 入口 | file:line（基线锚） | 闸覆盖判定 |
|---|---|---|---|
| ① | `POST /interview/:id/begin`（C 端练习·原路径） | controller `:30-31` → `InterviewService.begin` `:424-432`（`:425` 方法闸 → `:431` 调核） | **覆盖（双闸）**：方法层 `:425`（先于 owner 校验/事务）+ 修复后核层 `:128`（共享位·幂等复闸） |
| ② | `POST /applications/:id/start`（招聘绑定入口·合一事务直调核） | controller `:21-26` → `ApplicationsService.start` `:44-94`（`:57` 直调 `beginInterviewCore`） | **修复前零闸=绕行**（kill=1 仍 200+CAS+预留+入队·§1.3 复现亲证）；**修复后核首语句 `:128` 闸覆盖**（合一事务内抛=整体回滚零悬账） |
| ③ | `POST /interview/:id/turn`（作答提交·含语音转写后的提交） | controller `:39` → `InterviewService.turn` `:435-481`（`:436` 方法闸 → `:471` 入队 'answer'） | **覆盖**：方法层 `:436`（先于 zod 校验/限流/事务） |
| ④ | 语音 `POST /interview/:id/transcribe`（ASR 转写） | controller → `interview-voice.ts` `transcribeForIssuedQuestion`（`:104-139`） | **开关语义外·零模型面入队**：转写只产文本+转写持久化，作答提交恒经 ③（已闸）；无 start/answer job 生产（rg 亲证） |
| ④-b | TTS `POST /interview/:id/speak`、`/speak/stream` | controller `:78`/`:105` → `InterviewService.speak`/`speakStreamPrepare`（`interview-voice.ts` 合成尾段） | **开关语义外·零模型面入队**：TTS 纯渲染既有题面文本（付费模型调用但零新内容·零出题零作答零 interview_job 生产）——与 ④ 同形如实登记（ksw-2 P2 补登） |
| ⑤ | `applications.start` 的 `noop` 短路（申请缺行或已终态 completed/declined） | `applications.service.ts:83`（`startApplicationInterview` `recruiter.ts:519` 缺行/`:521` 终态 → noop 在核调前返回） | **核闸不可达=语义内零模型工作**：noop 不建会话不入队不扣额；in_progress 且绑定完好走 `reused`（`recruiter.ts:536`）仍过核闸（`applications.service.ts:55` 放行 → `:57` 直调核=共享闸覆盖）；重入已在途会话的提交面恒经 ③（已闸）——如实登记为边界（kill=1 下 noop 仍 200 noop·零新模型工作）（⑤ 行描述勘误承 ksw-2 P2） |
| ⑥ | 重试/恢复：`POST /interview/:id/report/retry` | controller `:186-189` → `retryReport` | **开关语义外**：报告重试（worker 报告 job）非面试出题/作答提交——如实登记不接线 |
| ⑦ | worker 消费侧（start/answer job 执行·模型调用） | `apps/worker/src/interview-consumer.ts` 等 | **生产者已全闸=语义满足**：模型面 job 全树恰两生产者（core `:285` 'start' + turn `:471` 'answer'·rg 亲证）均闸后；开关契约文注自钉「nothing model-facing **is enqueued** while it is on」=入口入队暂停语义·开关翻转前已入队 job 的消费不在本刀语义面（如实登记·零触 worker）。**drain 语义（ksw-2 P2 补登）**：worker 进程零读此 env 零 import content-safety（开关翻转=API 各副本重启生效·worker 永不受牵连）——翻转前已入队/在飞 job 在开启后仍被消费跑至模型，上界有界（per-owner queued ≤3 `interview-jobs.ts:25` + 1 inflight × ≤5 attempts `:15`·退避封顶 300s `:18`·claim tick 5s `drain-loop.ts:76`）=语义是**暂停入队**非立即停队；「worker claim 侧闸」登记归用户裁决队列为可选后继（ksw-1/ksw-2 同债） |
| ⑧ | preview 提交 `submitPreviewAnswer`（`interview.service.ts:487-`） | preview 写门（`requirePublicPreviewControlledWrite`）独立闸 | **开关语义外·零入队**：不 enqueue /turn job（其文注自钉）；score_request 属评分链非出题/作答口——如实登记不接线 |

**结论**：修法把闸放到 ①② 共用的 `beginInterviewCore` 首语句（=所有 begin 侧入口共用位·后继新调用方自动入闸·Ban 再漏），③ 方法闸保持，④⑤⑥⑦⑧ 逐个判定为零模型面/语义外并如实登记——全图无剩余绕行缝。

### 1.2 修法形状（最小 additive·零迁移零配置零新表）

1. `interview.service.ts` 新增模块级 `denyContentSafetyKilledShared()`（`denyContentSafetyKilled` 映射体模块化·503+`content_safety_kill_switch_active`+诚实文案逐字沿用现有形——**错误码/文案/状态字零新造**）；`begin`/`turn` 方法闸与 `beginInterviewCore` 核闸三处共用同一映射（`this.denyContentSafetyKilled();` 全树仍恰 2 处=i6 `:52-53` 计数与 `:60-62` 闸序正则**恒绿**·`:51` 闸定义在场恒绿）。
2. `beginInterviewCore` 首语句（resumeId 校验/绑写/扣额/入队**之前**）调共享闸——kill 优先序与 begin 口一致（先于一切校验）。
3. **`applications.service.ts`/controller 零触**：核闸抛 HttpException(503)→start 的 catch 非 enterprise 原样重抛→客户端收 503 `{error:'content_safety_kill_switch_active', message:'内容安全开关已开启：面试出题与作答提交暂停'}` 与 begin/turn 口逐字同形。
4. `neg-interview.proof.ts` §11 additive 三口负臂（20 断言·`draft` 状态即本卷唯一 proof 面）。

### 1.3 复现证据（修复前红→修复后绿·本 turn 亲跑·isolated PG）

- **红（基线·fix revert 后跑）**：`pnpm neg:interview` **EXIT=1 · 9/128 失败**（`/tmp/ksw-neg-red3.log`·attempt1 夹具缺 0104/0123 面 EXIT=1 crash + attempt2 测试臂非法值窗未复原致 KSE4 误红·两夹具/自校准红次如实留痕零谓词迁就）——失败恰为 **KSE1×6（kill=1 start 竟 200 且 interview+1/start job+1/预留+1/企业桶 reserved+1.00/申请 CAS invited→in_progress=绕行放行铁证）+ KSE3×3（kill='2' start 竟非 500=非法值不 fail-closed）**；既有 108 臂全绿·KSE2 begin 503 同窗差分 PASS=「同核双生产者恰一者未接线」runtime 复证。
- **绿（fix apply 后跑）**：`pnpm neg:interview` **EXIT=0 · 128/128 全绿**（`/tmp/ksw-neg-green.log`）——KSE1 start→503 具名码+诚实文案逐字+五面零副作用（interview/job/预留/企业桶/申请状态全净）·KSE3 非法值 500 opaque `{error:'internal_error'}`（与 uc050-K4 begin 口现状同形）·KSE4 turn→503+题仍 issued+answer job 零增·KSE5 off 臂 start 走至企业扣费守卫 402 `application_enterprise_pay_unavailable`（分码面零翻·核链在场旁证）+零悬账·env 窗收窗复原。
- **邻面**：`pnpm neg:bend` EXIT=0（off 零变·B 端全负路径族绿）。

### 1.4 语义与错误码（沿用现有形·零新造）

kill=1 → 503 `content_safety_kill_switch_active` + `内容安全开关已开启：面试出题与作答提交暂停`（三口逐字同形）；kill='2'/非法值 → 500 `{error:'internal_error'}` opaque（fail-closed·begin 口 K4 现状同形）；kill=0/unset → 现状字节零翻（§1.3 绿跑全量负路径族+KSE5 旁证）；开关与平台级既有开关（runaway/写门/熔断/成本治理/preview）语义零翻（i6 ①-⑤ 静态臂恒绿承证）。

---

## §2 验收门矩阵（起草门本 commit 亲跑·数字口径以实跑实测为准）

1. **主证（新 proof）**：修复前红（9/128·§1.3）→ 修复后绿（`pnpm neg:interview` EXIT=0 · 128/128）——**双向亲跑兑现·Ban 只交绿**。
2. **邻面**：`pnpm neg:bend` EXIT=0（128 前基线恒等绿）· `apps/api` typecheck EXIT=0 · lint EXIT=0（32 warnings=基线恒等·`--fixable` 行亲对）· `pnpm arch` EXIT=0（0 errors·8 warnings=基线恒等·stash 对照亲证·modules 3766→3769=本刀 3 新 import 解析·零新违例）。
3. **机制静态**：`node scripts/provider-egress-inventory.mjs` EXIT=0（environment_references=401·本刀零新登记义务亲证·§0.2）· markers=0（改动集五类标记词+行首冲突标记零命中·组装口径承 i6 `:152-163`·亲跑）。
4. **cap 预算核**：起草前 `check-docs` EXIT=0 scanned **2486=cap 恰等**→本卷 REQUEST 受管 1 件=2487 必超→**CAP-SANCTION-2487 恰等步进 2486→2487**（两 policy 脚本·四联动点 `2_487`/`f-2487.md`/`:2488` 恰等改·链注追加不改写既有注记）→步进后 `check-docs` EXIT=0 **scanned 2487=cap 2487 恰等零余量**· `public-text-policy:prove` **12/12**。
5. **如实登记（非本刀门）**：`uc050:nhp-start-bypass:prove`（SB1/SB4 钉「残余在/接线恰 2 处行钉」·本刀翻转其登记对象=按设计红·其卷头自钉「(a) 接线刀清单登记归用户裁决队列」即本刀）· `i6-gates:prove` 改动集恰符臂对外来改动集按设计红（其 §①-⑦ 静态臂对本刀恒绿·§9-3 亲证）· 双审翻面流程（pre-exec dual 两独立外席+协调方 EXEC 授权）零预支。
6. **范围外（越界即 FAIL）**：worker 消费面/preview 写门/报告 retry/UC-052 域/共享 SSOT/backlog/env-schema 注册（kill 开关三态自校设计内·沿用现状）/零迁移零 `.env*` 落树。
7. **pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。
8. **Ban**：Ban push/force-push（只本 worktree commit·不动他树）；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（§1.3 红次=夹具/自校准如实留痕·零谓词迁就零极性翻转）；Ban live key（零模型钥加载·`_neg-harness` 自剥·est live=0·隔离 PG+127.0.0.1）；Ban 就地归因门矩阵外新红；Ban 触既有 proof 文件断言（neg-interview §1-§10 既有臂零动·只 additive §11+尾注更注）；Ban 造 `.env*`/写 Key 入树入据；Ban 顺带升级依赖。

---

## §8 STOP（停止条件四类·四处钉之二）

**STOP · `executed:awaiting_post_prove_dual`**（Status 行+本节+§9+卷尾注四处同值·2026-11-06 EXEC 行使后停·待 post-prove dual）。**停止条件（四类·命中即停手上报·Ban 就地处置）·起草期核对**：
- **现场漂移**：起草期对 `92a82a944` 逐锚亲算零漂移（§0.1 全表亲证）——闸接线恰 2（`:425`/`:436`）·core 体内零 kill 检查·start `:57` 直调零闸·i6 `:53` 钉值 2·killsw/uc50 卷 NOT claimed/(a) 注记未被改写——**未触发**。
- **机制不满足**：绕行复现「kill=1 start 竟 200+CAS+预留+入队」与派单线索推定形**恰符**（§1.3 红 KSE1 六臂）=机制面成立·**未触发**。
- **越界需要**：本刀派单面即产品码接线（uc50 (a) 行使·协调方派单令内）·worker/preview/retry/preview-answer 判定为语义外只登记不接线（§1.1 表）·**未触发**（若 EXEC 期判定翻转即停上报）。
- **验收红不可修**：§2 门矩阵全绿（§1.3/§9-2 亲跑 EXIT 原值）·**未触发**。

**EXEC 期核对（2026-11-06·对届 tip `607013edb`）**：四类全未触发——现场漂移=§0 重 pin 如实改锚机制结论零翻；机制不满足=零翻；越界需要=零产品码新增（EXEC 只改卷文字）；验收红不可修=§9-7 门全绿。停于 `executed:awaiting_post_prove_dual`。

---

## §9 落卷附记（起草期台账·四处钉之三）

**STOP · `executed:awaiting_post_prove_dual`**（本节为四处钉之三·同值承守）。

- **§9-1 红绿双向亲跑**：红 `pnpm neg:interview` EXIT=1 · 9/128（KSE1×6+KSE3×3 恰=绕行面）→绿 EXIT=0 · 128/128；红次台账=attempt1 夹具缺 0104 route 表族+0123 快照列（`job_title_snapshot` 42703·crash）→attempt2 KSE4 误红（本刀测试臂非法值窗未复原·沿 uc050-K4 收窗先例补 `= '1'` 复原行·**自校准红次如实留痕**）→attempt3 形如 §1.3——三 attempt 全零谓词迁就零极性翻转。
- **§9-2 门矩阵 EXIT 原值**：neg:interview 绿 EXIT=0·neg:bend EXIT=0·typecheck EXIT=0·lint EXIT=0（warnings 32=基线）·arch EXIT=0（warnings 8=基线 stash 对照）·egress EXIT=0（references=401·零新登记）·check-docs 步进前 EXIT=0 scanned 2486→步进后 EXIT=0 scanned 2487=cap 恰等·PTP 12/12·markers=0。
- **§9-3 设计红如实登记（非本刀门）**：`uc-e2e-050-nhp-start-bypass.proof.ts`（SB1 kill=1 start→200 断言对修复后 503 红·SB4 行钉 `:335-347`/`:425`/`:436`/core 体内零 kill 词元断言对本刀 additive 红——其登记边界「残余在」被本刀合法翻转·后继 re-pin 权归其卷 follow-up 刀/协调方·本刀零触该文件）· `scripts/i6-239-gates.proof.mjs` 改动集恰符臂（本刀改动集含 REQUEST/两 policy 脚本/neg-interview=申报清单外→按设计红；其 ①kill-switch 静态七臂对本刀恒绿亲证：`callSites===2` 恒等·闸定义在场·503+文案在场·begin/turn 闸序正则恒等·零触 applications.service.ts·邻面零触·SSOT 四卷零触）。
- **§9-4 勘误承登（史录留痕）**：neg-interview 基线断言注记「合计:107」对 runtime 实测 108 存在 +1 史实漂（§11 前 done() 基线）——本刀更注按实测承登（107→128·只更注零臂动·漂因=前刀增臂未更注的同类先例形）。
- **§9-5 cap 承登**：CAP-SANCTION-2487 两 policy 脚本链注追加（**既有注记零改写**·数值行恰等改）·union 算式=main 届扫 2486+本卷 REQUEST 受管 1 件=2487 恰等零多放·产品码面=既有文件行内 additive 零新受管文件→terminal 2487 零新增。
- **§9-6 修订注记（2026-11-06 修订席·登记源=两路 pre-exec 审查 ksw-1 架构评审+ksw-2 证伪审查）**：①**P1-1（ksw-1）同刀 re-pin 兑现**：`apps/api/test/uc-e2e-050-nhp-start-bypass.proof.ts` 极性重钉——SB1/SB3 从「绕过存在（kill=1 start 200/预留/入队）」翻为「开关开启时 start → 503 具名码+诚实文案+零放行形状+合一事务整体回滚零副作用（interview/job/预留/个人桶全零·申请仍 invited）」、SB4 行钉 `:425/:436`/`:335-347` 改形状锚（方法闸 `this.denyContentSafetyKilled();` 恰 2·首处 begin 口次处 turn 口·共享映射体 `denyContentSafetyKilledShared`+private 委托在场·核首语句共享闸先于 resumeId 校验·start 零内联闸改名承自共享位）、core 零检断言翻正、尾停止条件翻为「kill=1 start 竟 200/放行形状=绕行回归→停」、头注/receipt arms/honesty 同步——断言数 46→47 零删减·off 既有行为断言=**SB2 全部零动；SB3 off 臂「谓词保真且加强」而非零动**（企业桶净账 +2.00→+1.00 仅 off 臂贡献·原「两申请 CAS invited→in_progress」单断言拆 kill 仍 invited/off in_progress 两臂=系极性必改非可选·原 kill 臂四元绑定谓词移至 off 对照臂保真+payer 显式加强）·**SB1 双口差分「同 interviewId」随 kill=1 start 腿 iv 缺省 `'none'` 成名义**（断言体仅钉 begin→503·id 短语=描述面非活谓词）·亲跑 EXIT=0 · 47/47（attempts=1 首跑绿·零谓词迁就）——**前句「SB3 off 臂零动」措辞过头已由会签 P2（2026-11-06）承登更正·只改卷文字零码触**——**§9-3 所登「uc050 proof 按设计红·re-pin 权归后继」就此翻销·合入零必红 proof（§9-3/§2-5/§0.1 史录原文零改写·以本注记为准）**；②覆盖矩阵 `:132`/`:154` 只追加「已修复」注记（格值/状态词/coveredCount=8 零动）+uc50 卷 §1.5 (a) 已接线注记（closed 史录零洗）；③**ksw-2 P2 勘误三项随本节落卷**：§1.1⑤ noop 行描述改实形（in_progress 绑定完好走 `reused` 过核闸·noop 仅缺行 `:519`/终态 `:521`）、§1.1 补 ④-b speak/TTS 行（TTS 纯渲染既有题面·零新内容零入队=语义外）、§1.1⑦ 补 worker drain 语义（worker 零读 env·已入队 job 继续消费至有界上界=暂停入队非立即停队）。本修订零产品码触·零臂删减·Status 四处钉随 §9-7 翻 `executed:awaiting_post_prove_dual` 承守。
- **§9-7 EXEC 行使台账（2026-11-06·协调方 EXEC 授权随令）**：`git fetch origin main` EXIT=0（HTTP2 framing 中断两连后重试成·port 443 连接超时一次·第三次成）——origin/main 仍 `92a82a944` 未前进=**零 rebase 零冲突**（两 policy dual-keep 条款未触发·cap union 实测=本树 tip 届扫·下注 check-docs 恰等亲证）；会签 P2 措辞两项随 §9-6① 承登（只改卷文字零码触）；§0 重 pin 对届 tip 如实更锚（六件 blob 漂移·五件同 blob·行号随 tip·机制结论零翻）。**门读数（全部亲跑 EXIT 原值）**：`pnpm uc050:nhp-start-bypass:prove` **EXIT=0 · 47/47（attempts=1）**· `pnpm uc050:nhp-kill:prove` **EXIT=0 · 59/59（attempts=1）**· `pnpm neg:interview` **EXIT=0 · 128/128** · `pnpm neg:bend` **EXIT=0 · 179/179** · apps/api typecheck **EXIT=0** · lint **EXIT=0**（0 errors/1545 warnings=`--max-warnings` 上限恒等·fixable 32）· `pnpm arch` **EXIT=0**（0 errors/8 warnings=基线恒等·modules 1191/dependencies 3772·较 ksw-1 届读 3769 +3 归因未定如实记·零新违例）· `node scripts/provider-egress-inventory.mjs` **EXIT=0**（references=401 零新登记）· `node scripts/ai-docs/check-docs.mjs` **EXIT=0 scanned 2487=cap 2487 恰等零余量** · `node scripts/ai-docs/public-text-policy.proof.mjs` **EXIT=0 · 12/12** · markers **=0**（改动集六件亲扫：REQUEST+interview.service+neg-interview+uc050 proof+两 policy 脚本）· 浏览器 UI runner 未跑（派单令外）· commit 一行大白话落本树·⛔push ⛔他树触。

---

*KILL-SWITCH-ENTRY REQUEST · 2026-11-05 起草席落卷 · **STOP=`executed:awaiting_post_prove_dual`**（四处钉：Status 行+§8+§9+本行·2026-11-06 pre-exec 双审两独立外席行使：ksw-2 PASS+ksw-1 FAIL→修订落 `607013edb` 会签 PASS·EXEC 授权随令行使·门读数落 §9-7·待 post-prove dual）· D6 #239-① 内容安全开关 applications.start 第三入口收口（uc50 卷 (a) 产品接线刀清单登记的后继行使·killsw/uc50 卷史录零洗零触）· 基线 `origin/main` `92a82a944`=#209·main 届扫 2486=cap 2486 恰等·cap 2486→2487 恰等步进（CAP-SANCTION-2487 双件·四联动点恰等改·既有注记零改写）· 修法=闸放 `beginInterviewCore` 核首语句共享位（后继 begin 侧入口自动入闸·Ban 再漏）+begin/turn 方法闸映射体模块化为共享函数（错误码/文案/状态字零新造·`applications.service.ts` 零触=catch 原样重抛透传 503）· 入口全景枚举八面逐个判定（§1.1·④⑤⑥⑦⑧ 语义外如实登记）· 主证双向亲跑：修复前红 9/128（KSE1 kill=1 start 竟 200+CAS+预留+入队=绕行铁证+KSE3 非法值不 fail-closed）→修复后绿 128/128（三口 503 具名码+诚实文案逐字+五面零副作用+非法值 500 opaque 同形+off 402 分码链路零翻+env 窗收窗复原）· 邻面 neg:bend/typecheck/lint/arch/egress/docs:check/PTP/markers 全绿· `uc050:nhp-start-bypass` 按设计红登记已随 §9-6① 同刀 re-pin 翻销（史录原文承旧·EXEC 复跑 47/47 见 §9-7）；`i6` 改动集恰符臂按设计红如实登记（§9-3·非本刀门）· markers=0 · est live=0（隔离 PG·零模型钥·零外呼·零生产操作）· pins 十一值零翻 · coveredCount=8 不变 · ⛔push ⛔force-push（史录承旧不洗）*
