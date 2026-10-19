# AG17-SCHEMA-SPAN REQUEST（AG-17 结构化输出观测诚实化刀——span 档名 schema_retry→schema_invalid·「暗示有重试实际没有」最小收口·零行为变更·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-19 落卷·pre-exec 双审两独立外席待派·est live=0·Ban self-approve·alone≠dual·⛔push·翻面权归协调方）

**席位**：AG 能力复核台账下一刀起草席（done 30/half 2/open 16·AG-13 需线上分布数据挂起·顺延选标 **AG-17**=P3 Prompt 轨·协调方派单·北星 loop）。
**基线**：`origin/feat/mysql-schema-skeleton` @ `4c2ea4c9f`（`git fetch` 后亲证：`origin/line/ag-next-draft`=`4c2ea4c9f` 恰等·`git rev-list --count 4c2ea4c9f..origin/main`=0 即 origin/main 为其祖先·派单下界「origin tip≥4c2ea4c9f」**成立**）。分支 `line/ag17-draft`·工作树 `meetwise-ag17`（仓根同级·`git worktree add ../meetwise-ag17 -b line/ag17-draft 4c2ea4c9f` 本席亲立·`-b` 成功即分支建前不存在的机证）。
**立项出处（三层蓝本·不自建 SSOT 行——issues-final AG-17 行翻面与 LEDGER 刀位图翻面权归协调方/卷主）**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-17 总览 `:29` + 详情 `:239-248`（P3·Prompt·判词「结构化输出只用 response_format=json_object，schema 只写在 prompt 里；schema 失败不重试但照常计费；span 名 schema_retry 暗示有重试，实际没有」·修法三肢「支持的模型改用 json_schema(strict)；span 改名为 schema_invalid；重试策略见 AG-02」——本刀取第二肢最小面·第一肢否决留后继刀见 §1.3-甲·第三肢=AG-02 领地已落 ag-f-reroll 承接登记见 §0.2-5）；②`ai-docs/delivery/ai-capability-review/README.md` `:51`（「结构化输出 | json_object + 本地 zod 校验，失败不重试（AG-17）」+对照列 OpenAI Structured Outputs=json_schema+strict）+`:65`（「线上 JSON 失败率」系依赖部署环境无法离线判定面=甲否决依据）；③形制沿 `ag09-replay-first-REQUEST.md`（同席位同工序先例·STOP 三处·blob 锚表·门矩阵预申明形）。

## §0 现状锚（起草席亲读·base `4c2ea4c9f`·file:line/blob 逐条 rg/sed/Read/git rev-parse 实测·**EXEC 立项照届时 tip 全量重 pin——漂移如实改锚·结论不变则只更行号**）

### 0.0 防重三查 + 在飞交叠复核

- `git worktree list`：建后 **6 树**实测（主仓/本席 meetwise-ag17/5ag/errc/pgp/thcal）——零第二 ag17 树。
- `git branch -a | grep ag17` 恰本席 `line/ag17-draft` 一条；`ls ai-docs/delivery/harness/ | grep -i ag17` EXIT=1——**零同名刀卷**。→ 停止条件未触发·可落卷。
- 在飞交叠：`git log --all --oneline --grep="AG-17"` **0 笔**——AG-17 无在飞修复刀；同基线在飞三线（errc/pgp/thcal·均无越基 commit）+upload-guards（触面 domain/resume/api·`git diff HEAD...line/upload-guards-draft --name-only` 亲证）与本刀触面（ai-runtime trace/invoke+新 proof+注册+本卷）**零交集**。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·全 40 hex @`4c2ea4c9f`）

| 文件 | blob | 关键行锚 |
|---|---|---|
| `packages/ai-runtime/src/trace.ts` | `debd3cfcd5d5a3c4b41d53e23db3c8556f9d593f` | `:6-13` `ModelCallOutcome` 五值联合·**:10 `| 'schema_retry'  // schema 不过,将重试`（注释自述「将重试」与本层零重试实现矛盾=判词第三半载体）**·`:29` `outcome: ModelCallOutcome` 字段位·`:8` `transient_retry`（同族措辞但非本判词面·Ban 触） |
| `packages/ai-runtime/src/invoke.ts` | `44340f3988ce5cbf1ce5013e24e5810d529b2350` | `:231` `/** Retained for source compatibility. Billable external attempts are never automatically retried. */`（maxRetries 兼容位·**判词第二半权威注释**）·`:613` `InvokeSpanFn`（outcome 参数型别）·`:1016-1083` known_executed 确定性失败臂（`:1017` AG-06 修法⑤注释·`:1045` `settleAiTextCost` 真实结算·`:1060` `feeStatus: 'settled'`·**:1082 注释「观测沿既有 settled-failed 先例的 schema_retry 档（确定性输出失败·允许换 revision 重试·不重试同 key）」+`:1083` `span(1, 'schema_retry', latencyMs, settledUsage)`**）·`:1134` `doubleValidate(spec.schema, spec.businessValidate, result.raw)`（zod 仅本地）·`:1138-1139` `schema_validation_failed`/`business_validation_failed` 码·**:1203 `span(1, error.startsWith('business:') ? 'business_error' : 'schema_retry', latencyMs, settledUsage)`** |
| `packages/ai-runtime/src/model-client.ts` | `61471ed4156873b8a1154161e138b8a317c40384` | `:741`（非流式 dispatchOnce body）与 `:940`（流式 streamBody）**两处硬编 `response_format: { type: 'json_object' }`**·`:162-166` `RESPONSE_FORMAT_RESERVE_TOKENS=64` 注释（自述 provider-side structured-output machinery）·`:1178` `modelFor(client, { service, system, userData, images, rag })`（CompletionRequest 构成位·**无 schema 形参=甲否决依据①**） |
| `packages/ai-runtime/src/prompts.ts` | `96acf9c3414f8dd19b781d795f8d04e779e04c5c` | `:33/:72/:84/:120/:162/:199/:221/:229` 八处「只返回 JSON: {…}」**schema 全文以 prompt 文本承载**（判词第一半·schema 只写在 prompt 里） |
| `packages/ai-runtime/src/validators/index.ts` | `959c2419077ab5b9e61691b9e5234105b7d9e9fe` | `:13-23` `doubleValidate`（`schema.safeParse` 本地 zod·businessValidate 二段·**校验只在响应后本地·provider 侧零 schema 约束**） |
| `packages/ai-runtime/src/langfuse-v5.ts` | `63d5466c698a6f5a37fb13b271e13d441708a2d6` | `:73` `outcome: span.outcome`（透传）·`:186` 仅 `=== 'ok' || === 'cached'` 分支——**全仓唯一观测后端适配对旧值零字面依赖=改名安全面** |
| `packages/ai-runtime/src/text-endpoint-config.ts` | `005c68ccce6398f97d5931723e77dbfd5cb68901` | `:22` `TextEndpointProfile` 闭集两值（deepseek-cn-public/dashscope-cn-beijing）·`:37-40` host 冻结注册表——**两 profile 的 json_schema(strict) 供应商侧能力在仓内零证据（甲否决依据②）** |
| `apps/worker/test/ag-b-classify.proof.ts` | `c58d1cd038156e82d1acc6746422a208e62b85c8` | `:151/:203-204/:217-218` 断言 error 码/账本态·**零 span 档名断言=件① 零回归证据**（门②预申明依据） |
| `packages/ai-runtime/package.json` | `ba3714d13f8341414ac391c68397ebe3f4616a68` | `:58-60` `prove:ag19-prompt-version`/`prove:ag09-replay-first` 注册先例（件③同形） |
| `package.json`（根） | `e9054ddca084ec87f66581c88fabef48b80346d0` | `:259-260` `ag09-replay-first:prove`/`:prove:raw` 注册先例（件③同形） |
| `scripts/run-e2e-isolated.mjs` | `c633bb81a6ae2504889d9af559a4080aaf2a78dc` | `:896-898` 文件清单臂/`:2178` gate 清单/`:2510-2511` 派发臂（ag19-prompt-version 同形三触点+清单尾 append=件③四处） |
| `ai-docs/delivery/ai-capability-review/issues-final.md` | `7bf0f03d00db44959af7c1983e7926d25d67e514` | AG-17 总览 `:29`+详情 `:239-248`（判词/触发例/修法原文）——只读蓝本 |
| `scripts/ai-docs/public-text-policy.mjs` | `056d645947f613269f2824595e522bb7a7819321` | `:118` `MAX_FILES = 2_264`（cap 现值·本席届树 docs:check 实测 **2261**·余 3） |
| `pnpm-workspace.yaml` | `f14e7fc25f68f8042023be164c94ee867d7b5c42` | `:11` `zod: 4.4.3`（甲否决依据③：zod4 原生 `z.toJSONSchema` 在版=后继刀零新依赖可行，但本刀不用） |

### 0.2 判词复核定谳（起草席四读码面·**成立维持·未被近期刀顺带修复**）

1. **「只用 json_object·schema 只在 prompt」**：两派发路径 `:741`/`:940` 硬编 `response_format:{type:'json_object'}`·全仓产品码 `json_schema` **零命中**（`grep -rn json_schema packages apps --include=*.ts`（滤测试）EXIT=1 亲证）；schema 全文以 `prompts.ts` 八处「只返回 JSON: {…}」prompt 文本承载·zod 仅 `validators/index.ts:13-23` 响应后本地 `safeParse`。**判词第一半逐字成立**。
2. **「失败不重试但照常计费」**：`:231` 权威注释「Billable external attempts are never automatically retried」（maxRetries 仅兼容保留）；schema 失败路径 `:1134`→`:1138` `schema_validation_failed`→`:1016` known_executed 臂 `:1045` `settleAiTextCost` 真实结算+`:1060` `feeStatus:'settled'`+`:1083` span 携 settledUsage——**token 已付费零产出·判词第二半逐字成立**（计费语义本身系 AG-06 修法⑤ 既有 settled-failed 先例·本刀不改其语义只正其名）。
3. **「span 名暗示有重试实际没有」**：档名发射恰 **4 处**（`invoke.ts:1082` 注释+:1083+:1203+`trace.ts:10`·全仓 ts/mjs/yml/yaml/json/md 穷举 grep 亲证·测试/配置/告警零消费）；`trace.ts:10` 注释自述「schema 不过,**将重试**」与本层 `:231` 零自动重试权威注释直接矛盾；langfuse-v5 `:73` 纯透传+`:186` 仅 ok/cached 分支。**判词第三半逐字成立**。
4. **未被顺带覆盖**：ag-b-classify（AG-06）塑形 settle 臂时保留旧档名（`:1082` 注释原样）；ag-f-reroll（AG-02）落的是 worker 层换 revision 族循环=修法第三肢「重试策略见 AG-02」领地·非本条面；`json_schema` 零采用·档名零改。**选标有效·停止条件「标的已修复」未触发**。
5. **行号漂移登记（注记级）**：issues-final 引值系复核快照 `2fab7946` 树——本席 `git show 2fab7946` 逐处亲证：`model-client.ts:415`=json_object 行（现树漂至 `:741`/`:940`·tokstream S4a 流式通道+G7 演进所致·语义恒等 `git log -S` 溯源 `fc472d970` 同源笔）；`invoke.ts:154`=never automatically retried 注释（现树 `:231`）；`invoke.ts:927`=schema_retry span（现树 `:1083`+`:1203` 两臂·ag-b-classify `ae478bc6b` 拆臂所致）。**三锚快照树字节级吻合·现树漂移均模块演进行漂·判词零变=注记级·非停止条件**。

## §1 修法（issues-final AG-17 修法第二肢最小面·零行为变更·恰 3 tracked 产品/测试面）

### 件① 档名改名（schema_retry → schema_invalid）

- `packages/ai-runtime/src/trace.ts` `:10`：`'schema_retry'` → `'schema_invalid'`·注释「schema 不过,将重试」→「schema 不过,确定性失败（本层零自动重试·同键不重试·换 revision 重掷归 worker 族循环 AG-02）」——与 `:231` 权威注释口径对齐。
- `packages/ai-runtime/src/invoke.ts`：`:1082` 注释同步（schema_retry 档→schema_invalid 档·保留「允许换 revision 重试·不重试同 key」原语义句）；`:1083` 与 `:1203` 两处字面量 `'schema_retry'` → `'schema_invalid'`。
- **零语义变更声明**：span 档名纯观测标签·唯一后端适配 langfuse-v5 纯透传零字面依赖（§0.1 langfuse 行）·结算/熔断/账本/幂等链路零触（`:613` 型别随联合体自动跟随·五值→五值换名）·`:8` `transient_retry` 等其余四值字节零触。

### 件② 新 proof：`packages/ai-runtime/test/ag17-schema-span.proof.ts`（沿 ag-b-classify 形·本地 http 脚本 provider+隔离 PG 全链 invoke·est live=0）四臂

- **A（承重）**：scripted provider 返 HTTP 200+usage 但缺 schema 必填字段 → invoke 返回 `schema_validation_failed`·recording tracer 恰记 `outcome='schema_invalid'`（非 schema_retry）·账本 `feeStatus='settled'` 结算额>0（照常计费语义原样保留=判词第二半的诚实观测）。
- **B**：businessValidate 不过 → `business_error` 档名原值（同 `:1203` 三元臂回归）。
- **C（机械钉）**：静态读 `trace.ts` 源——`schema_retry` 零命中+`schema_invalid` 恰一命中+`transient_retry`/`business_error`/`deterministic_refusal`/`exhausted`/`cached`/`ok` 六值原样（五值联合零增零删）。
- **D**：ok 路径 → `ok` 档名原值（正向回归）。

### 件③ 注册 additive 四面（沿 ag19-prompt-version 同形）

`packages/ai-runtime/package.json` +`"prove:ag17-schema-span": "tsx test/ag17-schema-span.proof.ts"`；根 `package.json` +`"ag17-schema-span:prove": "node scripts/run-e2e-isolated.mjs ag17-schema-span:prove:raw"`+`"ag17-schema-span:prove:raw": "pnpm -C packages/ai-runtime prove:ag17-schema-span"`；`scripts/run-e2e-isolated.mjs` 四触点（`:896-898` 文件清单臂同形+`:2178` gate 清单 append+`:2510-2511` 派发臂同形+清单尾 append）。

### §1.2 触面矩阵

恰 **7 tracked**：trace.ts 1+invoke.ts 1+新 proof 1+两 package.json 2+run-e2e-isolated 1+本卷 1——**零历史迁移·零 db 面零 app/worker 产品触·零 env 闸零新增**。

### §1.3 否决（五面）

- **甲=修法第一肢「支持的模型改用 json_schema(strict)」本刀不行使**：①seam 不通——zod schema 在 InvokeSpec（invoke 层）·CompletionRequest 构成位 `model-client.ts:1178` 无 schema 形参·threading 须动 Model/ModelCallPlan 接口面=跨全操作横切面；②能力无据——两 profile（`text-endpoint-config.ts:22` 闭集）的 json_schema-strict 供应商侧支持仓内零证据·README `:65` 明列「线上 JSON 失败率」属依赖部署环境无法离线判定面（AG-13 同类挂起纪律）；③收益不可测——strict 仅提高 provider 侧合规率·本地 doubleValidate 恒在·降多少 schema 失败离线不可证。→ 留后继刀（live 能力验证前置·zod 4.4.3 原生 toJSONSchema 零新依赖可行已登记 §0.1）·本刀不越权。
- **乙=手写 zod→JSON Schema 序列化或引新依赖**：同甲①②·且新依赖违 DEPS 纪律·Ban。
- **丙=顺手改 `transient_retry`/`exhausted` 等同族措辞**：非 AG-17 判词面·零越面纪律·Ban。
- **丁=改 `ai-docs/requirements/use-cases/expert-interview-coach-evaluation.md:991` `'schema_retry_exhausted'`**：历史需求卷非产品 token·不同标识符·零触。
- **戊=直改 issues-final/LEDGER 行**：翻面权归协调方·本刀零 SSOT 触。

## §2 门矩阵（EXEC 立项届树亲跑·预申明九门）

①`pnpm -C packages/ai-runtime prove:ag17-schema-span` EXIT=0（四臂全绿）；②`ag-b-classify` 全链回归 EXIT=0 原值（nearest invoke 全链 proof·零 span 断言零漂 §0.1 亲证）；③`ag09-replay-first:prove` EXIT=0 原值（invoke 全链第二回归）；④`langfuse-evaluation-contract` 相关 prove EXIT=0 原值（透传面）；⑤`turbo typecheck --force` 全绿 0 cached；⑥`turbo lint --force` 全绿·root/ai-runtime 计数恰等 cap；⑦`docs:check` ≤2264（起草树实测 2261+本卷=2262·余 2·EXEC 届值如实录）；⑧markers 改动集五类标记词+行首冲突标记 0 命中亲跑（词面运行时组装）；⑨`git diff --stat` 恰 7 tracked。零迁移故无 uniqueness/migrate 门（触面矩阵零迁移亲证随⑨）。

## §3 裁决项（三件·两案并陈处标推荐）

1. **观测历史兼容**：档名改名后 Langfuse 新观测 metadata.outcome=新值·历史卷面保留旧值。**推荐=净改名**（零消费方分支旧值·旧值自然沉降·零双发复杂度）；协裁要兼容查询则**双发别名臂**（新值主发+旧值 alias 一过渡期·须双审定过渡窗）。
2. **proof 载体**：**推荐=新立 `ag17-schema-span.proof.ts`**（独立小刀独立卷）；协裁并入 ag-b-classify 则触他刀在卷 proof 文件须预申明 carve-out。
3. **残余面归属**：修法第一肢 json_schema(strict)=后继独立刀（live 能力验证前置）·本刀收口观测半；issues-final AG-17 行按「观测半收口·结构半留后继」如实翻半或留开·翻面权归协调方。

## §5 Ban 面

历史迁移 0001-0209 零字节·零新迁移；结算/熔断/账本/幂等链路零语义触（`:1016-1083` 臂内除 `:1082-1083` 标签外字节零改·`:1203` 仅换字面量）；其余五档 outcome 值零触；prompts.ts/model-client.ts/validators 零触（甲否决面=后继刀领地）；SSOT 四卷+issues-final 零触；⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 停止条件与 STOP

- 停止四类：现场漂移超注记级/机制不满足/越界需要/验收红不可修——**起草期均未触发**（§0.2-5 漂移注记级亲证·§0.0 防重三查零撞）。
- **本卷 STOP=`draft:awaiting_pre_exec_dual`**（三处同值：Status 头+本节+卷尾注）·pre-exec 双审两独立外席待派·Dual PASS≠开工·开工授权权归协调方·alone≠dual·Ban self-approve。
- **est live=0**（proof=本地 http 脚本 provider+隔离 PG·零模型外呼零 DNS·0 Key 值·`actualSpendCny=null`）·零 env 闸零新增。
- **STOP=draft:awaiting_pre_exec_dual**（与 Status 头/§8 同值第三处）·起草落卷即停·⛔push。

## §9-rev rev 修订注记（pre-exec 双审第一轮 FAIL 两席合并修订清单 P1 一件甲+P2 六件乙/丙/丁/戊/己/庚回路 · rev 席落卷 2026-10-19 · **append 注记形 · 上文 §0-§8 一字不洗** · EXEC 期与上文冲突处以本节为准读）

**rev 缘由**：pre-exec 双审第一轮回卷 FAIL 定谳两席合并清单（P1 一件+P2 六件）·本席逐位届树亲证后按 rev 回路落卷（只改本卷·纯文面零码动·码面/migrations/LEDGER/SSOT/他卷零触·落卷形=append 不洗·EXEC 期以下列修正句为准读）。其中 P2-丁 行号半经届树复核**不成立**（证据随条登记·不落修正只登记）；余六件半/件均成立落修正。**STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值零翻**（Status 头/§8/卷尾注）·**rev 落卷后重派 pre-exec 双审两独立外席第二轮·窄域=本节落点复验·alone≠dual·Ban self-approve**。

### §9-rev.1 修订①（P1-甲）——ModelCallOutcome 七值联合计数统一（四处词面一并勘误）

- **届树亲证**：`packages/ai-runtime/src/trace.ts:6-13`（blob `debd3cfcd5d5a3c4b41d53e23db3c8556f9d593f` 恰等 §0.1 锚）——`:6` `export type ModelCallOutcome =`+七成员逐行：`:7` `| 'cached'`/`:8` `| 'ok'`/`:9` `| 'transient_retry'`/`:10` `| 'schema_retry'`/`:11` `| 'business_error'`/`:12` `| 'deterministic_refusal'`/`:13` `| 'exhausted';`——**恰七值**。卷件② C 臂六值枚举（transient_retry/business_error/deterministic_refusal/exhausted/cached/ok）逐值与树吻合=「其余六档」枚举本身正确，仅其括注计数词面误。
- **修正句（统一为「七值联合·schema_retry 外其余六档」）**：§0.1 trace.ts 行「`ModelCallOutcome` 五值联合」→「`ModelCallOutcome` **七值联合**」；件① 零语义变更声明「五值→五值换名」→「**七值→七值换名**」；件② C 臂「（五值联合零增零删）」→「（**七值联合**零增零删·六值枚举原样不变）」；§5 Ban 面「其余五档 outcome 值零触」→「**其余六档** outcome 值零触」。四处计数口径（五值联合/五值→五值/其余四值/其余五档）互斥就此归一；结论面（改名零增零删·其余档零触）不变·纯计数勘误。

### §9-rev.2 修订②（P2-乙）——trace.ts `transient_retry` 行锚 :8→:9

- **届树亲证**：`trace.ts:8`=`| 'ok'                     // 双校验通过`·`:9`=`| 'transient_retry'        // 瞬时失败,将重试`——卷 §0.1 trace.ts 行「`:8` `transient_retry`（同族措辞但非本判词面·Ban 触）」与件①「`:8` `transient_retry` 等其余四值字节零触」两处行锚**误**。
- **修正句**：两处 `:8` `transient_retry` →「**`:9`** `transient_retry`」；件① 处「其余四值」随 §9-rev.1 改「**其余六值**」。

### §9-rev.3 修订③（P2-丙）——model-client.ts `RESPONSE_FORMAT_RESERVE_TOKENS` 行锚（席2 口径成立）

- **届树亲证**：`packages/ai-runtime/src/model-client.ts`（blob `61471ed4156873b8a1154161e138b8a317c40384` 恰等 §0.1 锚）——注释块恰 **`:164-167`**（`:164` ``// `response_format` is provider-side structured-output machinery rather than a``→`:167` `// gives every operation its exact schema budget.`）+const 恰 **`:168`**（`const RESPONSE_FORMAT_RESERVE_TOKENS = 64;`·grep -n 亲证）——**席2 词面（注释 :164-167+const :168）届树成立**；席1 词面 :163-167 不确（`:163` 系 `RAG_SECTION_MARKER` const 行）；卷面 `:162-166` 误。
- **修正句**：§0.1 model-client.ts 行「`:162-166` `RESPONSE_FORMAT_RESERVE_TOKENS=64` 注释（自述 provider-side structured-output machinery）」→「**`:164-167` 注释（自述 provider-side structured-output machinery）+`:168` `RESPONSE_FORMAT_RESERVE_TOKENS=64` const 行**」。

### §9-rev.4 修订④（P2-丁）——件③ 四触点收敛三处编辑（行号半不成立·只登记不修正）

- **收敛半·成立**：「gate 清单 append」与「清单尾 append」同物异名届树坐实——run-e2e-isolated.mjs 的 gate 清单系 `:2178` 单行清单（ag19 词面 `'ag19-prompt-version:prove:raw'` 在 `:2178` 行内亲证）·对该清单的 append 即该行尾加项；「清单尾 append」若读作文件清单对象尾新键位次·亦属文件清单臂新键编辑之内——两读均非独立第四编辑。
- **修正句（收敛三处）**：§0.1 run-e2e 行「（ag19-prompt-version 同形三触点+清单尾 append=件③四处）」→「（ag19-prompt-version 同形**三处编辑**=件③全触点）」；件③「四触点（`:896-898` 文件清单臂同形+`:2178` gate 清单 append+`:2510-2511` 派发臂同形+清单尾 append）」→「**三处编辑**（`:896-898` 文件清单臂新键同形+`:2178` gate 清单尾 append+派发臂新臂同形）」；§1.2 触面矩阵 run-e2e 计数 1 不变。
- **行号半·不成立（跳过修正·如实登记）**：届树 `:2509`=`// AG-19(刀 AG-19):ag19-prompt-version 接隔离 PG runner·命令沿 ai-runtime 原生 script 名。`、`:2510`=`: target === 'ag19-prompt-version:prove:raw'`、`:2511`=`? ['pnpm', ['-C', 'packages/ai-runtime', 'prove:ag19-prompt-version']]`——卷面 `:2510-2511` **恰中 target+command 臂体对·非误**；席词「实为 :2509-2510」系「注释+target」窗（blob `c633bb81a6ae2504889d9af559a4080aaf2a78dc` 恰等 §0.1 锚·全臂含引导注释恰 `:2509-2511`）。**全臂窗 `:2509-2511` 如实登记供 EXEC 参照·卷面 `:2510-2511` 锚维持**。

### §9-rev.5 修订⑤（P2-戊）——§1.3-丁 历史卷零触枚举补列 ag24 旧档名 prose 引用

- **届树亲证**：`ai-docs/delivery/harness/ag24-langfuse-model-REQUEST.md:89` 含「`…:976/:980 span exhausted/schema_retry 非 ok 臂…`」——历史卷旧档名行文引用坐实（与 §1.3-丁 `expert-interview-coach-evaluation.md:991` 同口径）。
- **修正句**：§1.3-丁 零触枚举补列 **`ai-docs/delivery/harness/ag24-langfuse-model-REQUEST.md:89`（旧档名 prose 引用·历史卷零触同口径）**。

### §9-rev.6 修订⑥（P2-己）——§0.0 时点机证时移注记（append）

- **届树亲证（rev 时点亲测）**：`git worktree list` 恰 **5 树**（主仓 `4c2ea4c9`/5ag `df150781` detached/本卷 ag17 `1cf4c404`/thcal `67f905a2`/cap72 `442244ac`）——卷记 6 树（errc/pgp 已撤·cap72 新入）；`git branch -a | grep ag17` 现为本地 `line/ag17-draft`+`remotes/origin/line/ag17-draft` 两条（起草时点仅本地一条）——**§0.0 时点机证已时移坐实**。
- **修正句（append 注记）**：§0.0 三查数值系起草时点机证·**EXEC 立项按届时机证重跑三查·勿引陈旧树数**（工作树数/分支现场以 EXEC 届时 `git worktree list`/`git branch -a` 实测为准·漂移照 §0 头注形如实录）。

### §9-rev.7 修订⑦（P2-庚·rev 席裁量**纳为 EXEC 义务**）——件② C 臂扩 trace.ts+invoke.ts 双文件零命中断言

- **技术前提届树亲证**：全仓 ts/mjs（packages/apps/scripts·滤 node_modules）`schema_retry` 恰 **4 处**（`invoke.ts:1082` 注释/`:1083` span/`:1203` 三元臂+`trace.ts:10` 联合体行·本席 grep 亲证恰等 §0.2-3 词面）——件① 改名后 **trace.ts+invoke.ts 双文件 `schema_retry` 零命中**断言可行且近零成本（C 臂已静态读 trace.ts·加读 invoke.ts 同形）。
- **裁量理由**：`:1203` else 臂（schema_retry 支）无运行时臂覆盖（A 臂承 `:1083` 臂/B 臂承 business_error 支/D 臂承 ok 路径）——静态双文件零命中断言补真覆盖面·非冗余，故纳为 EXEC 义务而非观察级。
- **修正句（门矩阵随注同步）**：件② C 臂静态读值域由「`trace.ts` 源」扩为「**`trace.ts`+`invoke.ts` 双文件源**——`schema_retry` 双文件零命中+`schema_invalid` 于 trace.ts 恰一命中+六值原样+invoke.ts 三落点（`:1082` 注释/`:1083`/`:1203`）改名后零旧值」；§2 门①「四臂全绿」**臂数不变**（增量在 C 臂内·门① 词面以本节为准读）。

**rev 自检回执**：markers 五类标记词（四标记词词面运行时组装不落卷面+行首冲突标记严格形）本卷改动文件直扫 **0 命中**（本席亲跑·防自指沿 upload-guards §9-rev 同形制）；`node scripts/ai-docs/check-docs.mjs` **EXIT=0**（rev 时点亲跑·本卷系既有文件 append 零新增文件·计数不变）；`git diff --numstat` 恰 1 tracked 本卷 .md（§0-§8 一字不洗·纯 append+卷尾注行内 append）；码面/migrations/LEDGER/SSOT/他卷零触；est live=0（rev turn 全只读+1 doc append·`actualSpendCny=null` 同源）；STOP 三处同值零翻。

---
卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·起草 2026-10-19 落卷·基线 `4c2ea4c9f`·pre-exec 双审待派·est live=0·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase 未用·翻面权归协调方·alone≠dual·Ban self-approve·rev 修订注记 §9-rev 2026-10-19 落卷（pre-exec 双审第一轮回卷·P1 一件+P2 六件·其中 P2-丁 行号半不成立只登记）·窄域=§9-rev 落点复验·第二轮两独立外席待派。
