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

---
卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·起草 2026-10-19 落卷·基线 `4c2ea4c9f`·pre-exec 双审待派·est live=0·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase 未用·翻面权归协调方·alone≠dual·Ban self-approve。
