# AG18-SAMPLING-TEMPERATURE REQUEST（AG-18 采样温度钉低温刀——route-classify/resume.vision 入 SERVICE_TEMPERATURE+MODEL_EVAL_TEMPERATURE 非法值启动失败·采样确定性最小收口·零迁移·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-19 落卷·pre-exec 双审两独立外席待派→Dual PASS→协调方授权 EXEC 落码·est live=0·Ban self-approve·alone≠dual·⛔push·翻面权归协调方）

**席位**：AG 能力复核台账下一刀起草席（**自数 done 31/half 2/open 15**·台账管线行亲证：`:632` ag09 行「done 29→30」+`:636` ag17 行「**done 30→31**[AG-17 翻面·协调方翻面笔随令行使·**half 2/open 15**]」·half 2 维持登记。选标序 P1>P2>P3 同级别小编号：P1 open 唯余 AG-40——台账 `:695` 验证席定谳「**AG-40 对现 tip 不成立：已被 634eb645 §1⑥ 修复——改判『不成立（现状）·历史成立』**」=停止条件「标的已修复」**跳过**；P2 open 唯余 AG-13——issues-final `:193` CRAG 阈值校准需线上分布数据·沿上刀挂起纪律**跳过**；依赖未修前置项同跳（AG-32 语音契约/AG-36 vendor 迁移各待前置）。顺延 **P3 最小号 AG-18**=Prompt 轨·台账 AG-18 **零命中**（grep 亲证）=零在飞零收编·协调方派单·北星 loop）。
**基线**：`origin/feat/mysql-schema-skeleton` @ `7a4288fb137bbd162e176e3020f16b085f046bb2`（派单令给定·`git rev-parse` 亲证恰等）。分支 `line/ag-next2-draft`·工作树 `meetwise-agN2`（仓根同级·`git worktree add -B line/ag-next2-draft ../meetwise-agN2 origin/feat/mysql-schema-skeleton` 本席亲立·`-B` 成功即分支新建机证）。
**立项出处（三层蓝本·不自建 SSOT 行——issues-final AG-18 行翻面与 LEDGER 刀位图翻面权归协调方/卷主）**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-18 总览 `:30`+详情 `:250-257`（P3·Prompt·判词「出题、OCR、路由分类都没设温度（用供应商默认），路由分类是约束性任务却没钉低温；MODEL_EVAL_TEMPERATURE 填了非法值会变成 NaN，序列化后是 temperature:null」·修法两肢「route-classify 和 vision 设 0–0.1；env 解析时校验是否为有限数，非法就启动失败」——本刀两肢全行使·判词三半全落见 §3-3）；②同族纪律仓内指针=`apps/worker/src/model-invocation-reconcile.ts:37-41` boundedInteger+「Invalid reconciliation timing is a startup error」+`apps/worker/src/usage-calibration-reconcile.ts:47-61`（`:61` 注释原文「沿 model-invocation-reconcile.ts:41 同族纪律·**AG-18**：非法 env 启动失败,绝不静默回退默认」——本刀即该纪律对本判词 env 的本体行使）+`ai-docs/delivery/harness/ag-cost1-bleed-observe-REQUEST.md:80` 同形引；③形制沿 `ag17-REQUEST.md`（同席位同工序先例·STOP 三处·blob 锚表·门矩阵预申明形）。

## §0 现状锚（起草席亲读·base `7a4288fb`·file:line/blob 逐条 grep/sed/Read/git rev-parse 实测·**EXEC 立项照届时 tip 全量重 pin——漂移如实改锚·结论不变则只更行号**）

### 0.0 防重三查 + 在飞交叠复核

- `git worktree list`：建后 **4 树**实测（主仓 meetwise/本席 meetwise-agN2/meetwise-cap80/meetwise-hotfix）——零第二 ag18 树。
- `git branch -a | grep -i ag18` EXIT=1；`ls ai-docs/delivery/harness/ | grep -i ag18` EXIT=1——**零同名刀卷零同名分支**。→ 停止条件未触发·可落卷。
- 在飞交叠：`git log --all --oneline --grep="AG-18"` 恰 2 笔（`31df8aa1`/`e6dc3ba7` 均 AG-07 止血刀**引述**「AG-18 纪律」字样·非 AG-18 修复刀）——AG-18 无在飞修复；同基线在飞两线亲证零交集：`line/cap-sanction-2280` 越基 0 笔、`line/ci-egress-registry-hotfix` 越基 1 笔（`62712996`·`git diff HEAD... --name-only` 亲证仅 `ai-docs/architecture/ai/provider-egress-inventory.json`+`scripts/provider-egress-inventory.proof.mjs` 两文件）与本刀触面（model-client+新 proof+两 package.json+runner+本卷）**零交集**。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·全 40 hex @`7a4288fb`）

| 文件 | blob | 关键行锚 |
|---|---|---|
| `packages/ai-runtime/src/model-client.ts` | `61471ed4156873b8a1154161e138b8a317c40384` | `:152` 注释「生成性任务(出题)**不列** = 不设 temperature = 留供应商默认求多样」（生成性不设=刻意设计·甲否决依据）·**:155-159 `SERVICE_TEMPERATURE` 恰 3 键**（`:156` `'mock-interview.evaluate': Number(process.env.MODEL_EVAL_TEMPERATURE ?? 0.2)`——**裸 Number() 零有限数校验=判词第三半载体**；`:157` planner 0.2·`:158` resume-diagnosis 0.3）·`:742`（非流式 body）与 `:941`（流式 streamBody）两处 spread `...(SERVICE_TEMPERATURE[req.service] !== undefined ? { temperature: … } : {})`——**未映射服务零 temperature 键=判词第一半载体**·`:1139-1140` digest 显式绑 `temperature: SERVICE_TEMPERATURE[req.service] ?? null`（注释自述「温度变则输出语义变,须进摘要」——**NaN 时 `?? null` 不触发·JSON.stringify 序列化 NaN→null 恒真=判词第三半**）·`:1175-1178` `promptedModel` 传 service 入 CompletionRequest（钉温 seam 通路） |
| `packages/ai-runtime/src/job-route-classify.ts` | `3b1e7081863fafdc39f001bc251672b0868e4f0b` | `:36` `JOB_ROUTE_CLASSIFY_PROMPT_SERVICE = SEALED_JOB_ROUTE_CLASSIFY_PROMPT_CONTRACT`·`packages/domain/src/sealed-job-route-classify-binding.ts:27` 契约字面量 **`'job.route-classify.v1'`**（blob `e291780da3e1ff482d175cc2803dfa81e683826e`）·`:155/:170` promptedModel/invoke 两调用位 service 全走该键——**SERVICE_TEMPERATURE 新键字面量以此为准** |
| `packages/ai-runtime/src/resume-ocr.ts` | `b2c5142585bd09d2f40e592cfde4f22b90164920` | `:140` `service: 'resume.vision'`（OCR 走 invoke 全链·vision 同键——`prompts.ts:218` blob `96acf9c3414f8dd19b781d795f8d04e779e04c5c` 注册 `service: 'resume.vision', version: 'v2'` 同源）——**OCR+vision 同键一名·一钉双落** |
| `apps/worker/src/usage-calibration-reconcile.ts` | `707272a40b2facfb0b6145fbe9486354724b1667` | `:47-59` `boundedInteger`/`boundedBoolean`（非法 throw code 先例形）·`:61` 注释明指 AG-18 纪律（②蓝本） |
| `apps/worker/src/model-invocation-reconcile.ts` | `7877f3092f8052fc4598576bb2c0198bbd3d078f` | `:37-41` boundedInteger+「startup error, not a silent policy change」权威注释（②蓝本原生） |
| `packages/ai-runtime/src/router/semantic-route.ts` | `f4ade4daf56feaf54fa1703cda9a18387eb06328` | `:28` 「H19 temperature=0 + 固定 prompt 版本 + 决策持久化」——Stage L 前置·**生产未接线三前置未清（同文件 `:30-38`）=乙否决依据** |
| `packages/db/migrations/0209_ag09_replay_first_claim.sql` | `e562520a1e993022389ba1cfb8db41f850b344f8` | `:11-20` 上提臂对照表「succeeded ∧ replayable + digest 漂移 → **cached 回放**（零二次外呼零新结算）」——**本刀温变 digest 漂移零误杀的机制依据** |
| `packages/ai-runtime/package.json` | `00ed0cd0e22272e4f233eb5b89d8bcd1a07eb127` | `:71-76` `prove:*` 注册先例（件③同形·`:14` lint 帽 628 亲证） |
| `package.json`（根） | `697bc71de8e9ddb7ec2aa457a0b8ac78a054b316` | `:259-262` `ag09-replay-first`/`ag17-schema-span` 双行注册先例（件③同形）·`:37-38` `provider-egress:inventory`/`:prove` 两门在册（门④依据） |
| `scripts/run-e2e-isolated.mjs` | `d1fa0485954db5b2487315d317f80ed04d6d0f2b` | `:932-941` ag17 清单臂新键同形·`:2297` gate/migrate 白名单数组尾（ag17 append 位·数组 `:3183-3187` 含内联注释单数组=ag17 D1 四处实况）·`:2536-2538` ag17 派发臂同形（件③三编辑+白名单 append 沿 D1=四处） |
| `ai-docs/delivery/ai-capability-review/issues-final.md` | `7bf0f03d00db44959af7c1983e7926d25d67e514` | AG-18 总览 `:30`+详情 `:250-257`（判词/触发例/修法原文）——只读蓝本 |
| `scripts/ai-docs/public-text-policy.mjs` | `b9b46bb68ffb057735dfd298fb8d01c7b54b3ca2` | `:120` `MAX_FILES = 2_272`（cap 现值·本席届树 docs:check 实测 **2270**·余 2） |

### 0.2 判词复核定谳（起草席三读码面·**成立维持·未被近期刀顺带修复**）

1. **「路由分类/OCR/vision 没设温度」**：`SERVICE_TEMPERATURE` 恰 3 键（`:155-159`）·`'job.route-classify.v1'` 与 `'resume.vision'` **两键零命中**（grep 亲证）→ `:742`/`:941` spread 臂不成立→请求体零 temperature 字段=供应商默认。判词第一/二半逐字成立。
2. **「MODEL_EVAL_TEMPERATURE 非法值→NaN→temperature:null」**：`:156` 裸 `Number()` 无 `Number.isFinite` 校验——`Number('abc')=NaN`·`:742` 判 `!== undefined` 恒真→`temperature: NaN` 入 body·`JSON.stringify` 序列化 NaN→`null` 发供应商；`:1140` digest 同型 NaN→null。全仓 `MODEL_EVAL_TEMPERATURE` 恰 2 处（`:153` 注释+`:156`·grep 亲证）零他消费零测试钉。判词第三半逐字成立。
3. **未被顺带覆盖**：ag17-schema-span（本日）改的是 outcome 档名·ag09-replay-first（本日）改的是 0209 claim 臂序·均零触温度面；`semantic-route.ts:28` H19 系未接线前置申明非实现。**选标有效·停止条件「标的已修复」未触发**。
4. **行号漂移登记（注记级）**：issues-final 引值系快照 `2fab7946` 树——`model-client.ts:154-158`（快照）现树 `:155-159`（+1 行模块演进行漂）；`:416`（快照·body 构成位）现树 `:742`/`:941` 两派发位（tokstream S4a 流式通道演进拆分·ag17 卷 §0.2-5 同源登记·语义恒等）。**两锚漂移均注记级·判词零变·非停止条件**。

## §1 修法（issues-final AG-18 修法两肢全行使·**非零行为刀——行为面增量=修法本体·逐件如实申明**·恰 3 tracked 产品/测试面）

### 件① 温度钉低温+env 校验（`packages/ai-runtime/src/model-client.ts` 恰一文件）

- `:155-159` map 恰 3 键→**恰 5 键**：3 旧键逐字节原值保留（`:157` 0.2/`:158` 0.3 原值零触）+新增 **`'job.route-classify.v1': 0`** 与 **`'resume.vision': 0`**（值取 0·修法「0–0.1」域内·H19 同族先例 `semantic-route.ts:28`·两案并陈见 §3-1）。
- `:156` 行 `Number(process.env.MODEL_EVAL_TEMPERATURE ?? 0.2)` → **`resolveEvalTemperatureOverride(process.env)`**；map 字面量上方新增导出函数 `resolveEvalTemperatureOverride(env: NodeJS.ProcessEnv = process.env): number`——缺省（undefined/空串）0.2 **原值**·`Number(raw)` 后 `!Number.isFinite(value) || value < 0 || value > 2` → **`throw new Error('model_eval_temperature_invalid')`**（域 [0,2] 两案并陈见 §3-2·形沿 `boundedInteger` 同族=②蓝本）。**启动失败语义**：`SERVICE_TEMPERATURE` 系模块顶层 const·map 字面量 import 求值即调 resolver→非法值进程启动即 throw=fail-fast（绝无静默回退）。
- `:152` 注释 append 一句（约束性 route-classify/vision 已列·生成性仍不列）·注释级零行为。
- **行为面申明（逐条·非零行为刀的诚实边界）**：①`'job.route-classify.v1'`/`'resume.vision'` 新调用请求体**新增 `temperature: 0`**=修法本体预期变更（分类/抽取确定性提升）；②`:1140` digest：该两 service temperature 由 `null`→`0`→**request digest 变**——旧 succeeded∧replayable 行走 **0209 上提臂 cached 回放**（0209 `:18` 对照表「digest 漂移→cached 回放」亲证）**零 payload_mismatch 误杀**；succeeded∧NOT replayable 行照旧 digest 墙（与价版/prompt 演进同型漂移同类·零新增类别）；③非法 env：旧=NaN→`temperature:null` 发供应商+digest null（判词第三半缺陷态）·新=启动 throw（预期变更·同族纪律）；④**合法 env 值与未映射服务（生成性三件 interviewer.ask/resume-quiz.generate/report.generate+其余全部）请求体与 digest 字节零变**；⑤`:742`/`:941`/`:1139-1140` 四位**零字节改**（自动跟随 map·零编辑）。

### 件② 新 proof：`packages/ai-runtime/test/ag18-sampling-temperature.proof.ts`（沿 ag17-schema-span 形·本地 http 脚本 provider+隔离 PG 全链·est live=0）四臂

- **A（承重·抓包断言）**：scripted provider 捕获请求体四断言——route-classify service→`body.temperature===0`；resume.vision→`===0`；interviewer.ask→**body 零 `temperature` 键**（未映射语义原样钉）；mock-interview.evaluate env 缺省→`===0.2` 原值。
- **B（env 失败语义·直接调 resolver）**：`'abc'`/`'NaN'`/`'Infinity'`/`'-1'`/`'3'` → throw `model_eval_temperature_invalid`；`undefined`/`''`→0.2；`'0'`/`'0.1'`/`'2'`→值原样。
- **C（机械钉·静态读源）**：`model-client.ts` 源——`SERVICE_TEMPERATURE` 键集**恰 5**（3 旧+2 新·逐键断言）+`:742`/`:941` spread 位与 `:1139-1140` digest 位行级原样锚+生成性三 service 键集零命中+`resolveEvalTemperatureOverride` 恰一导出+`semantic-route.ts` 零触。
- **D（digest 漂移零误杀·引证臂）**：静态锚 `:1139-1140` temperature 进 digest 原样+0209 上提臂语义由**门③ ag09-replay-first 回归承证**（本刀零迁移零 SQL·不重复造臂）。

### 件③ 注册 additive（沿 ag17 同形·run-e2e 四触点照 ag17 D1 实况预申明）

`packages/ai-runtime/package.json` +`"prove:ag18-sampling-temperature": "tsx test/ag18-sampling-temperature.proof.ts"`；根 `package.json` +`"ag18-sampling-temperature:prove"`/`":prove:raw"` 两行（`:259-262` 同形）；`scripts/run-e2e-isolated.mjs` **四处**（`:932-941` 清单臂新键同形+`:2297` 白名单数组尾 append+`:2536-2538` 派发臂新臂同形+migrate 白名单 `:3183-3187` 数组尾 append——**沿 ag17 偏离 D1 教训直接预申明四处**·缺席即隔离库不跑迁移首跑红）。

### §1.2 触面矩阵

恰 **6 tracked**：model-client.ts 1+新 proof 1+两 package.json 2+run-e2e-isolated.mjs 1+本卷 1——**零历史迁移零 SQL·零 env 键新增·零 app/worker/domain/db 产品触·index.ts 零触**（proof 直 import src·零新导出面）。

### §1.3 否决（五面）

- **甲=生成性三 service（interviewer.ask/resume-quiz.generate/report.generate）一并钉温**：`:152` 注释自述「生成性任务(出题)不列=留供应商默认**求多样**」=刻意设计非缺陷·修法原文只含 route-classify/vision——越判词面·Ban。
- **乙=semantic-route Stage L H19（temperature=0）行使/接线**：生产未接线三前置（invoke 关口/abort 语义/ledger 持久化·`semantic-route.ts:30-38` 在案）未清=**依赖未修前置**·Ban。
- **丙=MODEL_EVAL_TEMPERATURE 迁 `apps/api` env-schema.ts 统一校验**：ai-runtime 包反向依赖 api 面违结构·且同族先例（model-invocation-reconcile/usage-calibration-reconcile）均包内自持 resolver——Ban。
- **丁=顺手调 `:157` planner 0.2/`:158` resume-diagnosis 0.3 现值**：非判词面·已钉值零越面·Ban。
- **戊=直改 issues-final/LEDGER 行翻面**：翻面权归协调方·本刀零 SSOT 触·Ban。

## §2 门矩阵（EXEC 立项届树亲跑·预申明九门）

①隔离 runner `ag18-sampling-temperature:prove:raw` EXIT=0（四臂全绿·沿 ag17 形）；②`ag17-schema-span:prove` 回归 EXIT=0 原值（**model-client.ts 在其收据清单 `:939` 亲证=本刀邻面回归门**）；③`ag09-replay-first:prove` 回归 EXIT=0 原值（invoke/digest/0209 邻面·D 臂引证承证）；④**`pnpm provider-egress:inventory` EXIT=0+`pnpm provider-egress:prove` EXIT=0**（本刀触 model-client.ts=模型调用面·两门必含·沿本日 CI 红教训）；⑤`turbo typecheck --force` 全绿 0 cached；⑥`turbo lint --force` 全绿 0 cached·计数恰等 cap（root 5242/api 1423/domain 115/ai-runtime 628/db 1042/worker 959/web 601·package.json `--max-warnings` 七值亲证）；⑦`node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned **2270+本卷 1=2271 ≤ cap 2272**（起草树 2270 本席亲跑亲证·cap `:120` 2_272 亲证·**若 EXEC 届时主线已并 2280 帽刀则按届值如实录·届时亲证为准**）；⑧markers 改动集五类标记词+行首冲突标记 0 命中亲跑（词面运行时组装·防自指沿 ag17 形·**本席起草时直扫预登记：唯一命中=产品 service 键 `'mock-interview.evaluate'` 字面引用 2 处——既有 map 键承重锚非标记词用法·新增 marker 词零落**）；⑨`git diff --stat` 恰 **6 tracked**。零迁移故无 uniqueness/migrate 新门（白名单 append 系注册面非迁移件·门①隔离链承证）。

## §3 裁决项（三件·两案并陈处标推荐）

1. **两新键取值**：**推荐=案甲双 0**（`'job.route-classify.v1': 0`+`'resume.vision': 0`——约束性任务确定性最大化·H19 同族先例）；协裁定 0.1 则**案乙**（route 0+vision 0.1·均在修法 0–0.1 域内·proof A 臂断言值随裁同步）。
2. **env 校验域**：**推荐=案甲 [0,2]**（供应商常规全域·只拒非有限数与负/超域）；协裁收紧则**案乙 [0,1]**（低温带硬钉·合法 0.2 缺省仍在域内零影响）。
3. **残余面归属**：修法两肢本刀全行使·判词三半全落（第一半 OCR/vision 半+第二半 route 半=件① 钉 0·生成性半=`:152` 设计申明注释 append+否决甲登记·第三半 NaN=件① resolver 启动失败）——建议 issues-final AG-18 行**整条翻面**·翻面权归协调方。

## §5 Ban 面

历史迁移 0001-0210 零字节·零新迁移；`:742`/`:941`/`:1139-1140` 四位与 `:157`/`:158` 两旧值字节零改；prompts.ts/job-route-classify.ts/resume-ocr.ts/invoke.ts/trace.ts/validators/langfuse-v5/两 endpoint-config 零触；semantic-route.ts 及其三前置零触（乙否决面）；env 键零新增零改名；SSOT 四卷+issues-final 零触；⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 停止条件与 STOP

- 停止四类：现场漂移超注记级/机制不满足/越界需要/验收红不可修——**起草期均未触发**（§0.2-4 漂移注记级亲证·§0.0 防重三查零撞·在飞两线零交集亲证）。
- **本卷 STOP=`draft:awaiting_pre_exec_dual`**（三处同值：Status 头+本节+卷尾注）·pre-exec 双审两独立外席待派→Dual PASS→协调方授权 EXEC 落码·翻面权归协调方·alone≠dual·Ban self-approve。
- **est live=0**（proof=本地 http 脚本 provider+隔离 PG·零模型外呼零 DNS·0 Key 值·`actualSpendCny=null`）·零 env 闸零新增。
- **STOP=draft:awaiting_pre_exec_dual**（与 Status 头/§8 同值第三处）·起草落卷即停·⛔push。

---

卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·起草 2026-10-19 落卷·基线 `7a4288fb`·分支 `line/ag-next2-draft`·工作树 `meetwise-agN2`·选标自数 done 31/half 2/open 15（台账 `:632`/:636 管线行亲证）·AG-40（已修复定谳）/AG-13（线上数据挂起）双跳过亲证入卷·est live=0·actualSpendCny=null·pre-exec 双审两独立外席待派·翻面权归协调方·alone≠dual·Ban self-approve·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。
