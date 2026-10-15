# COST-COLUMNS REQUEST — 价格列刀（#48/#49 结算区分 cached_input 与普通 input 价·0204 熔单 expand-only+TS 结算贯通+价格配置扩展·cost-columns 战役·rev2 修订落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 落卷·授权链=rev2 落卷 74d7e0d6→pre-exec 窄域复审 PASS agent_02a7bfd0→协调方 EXEC 明示授权 0204 立项（0203 归 reconcile-retry 已 nail 落主线链 203 头 0203·本刀 0204 连续合法）→merge `0b12224e` 并 `feat/mysql-schema-skeleton`@`575b428e` 零冲突→四件落码+门矩阵实跑→§9 EXEC 记录 append 保史·观测两门红（①②-b 语义翻转 vs 零触负臂词面钉=卷内矛盾上报+②bleed sha256 pin 基线先断）与两邻门基线红（stash 对照亲证）如实登记待 post 双审/协调方裁决·alone≠dual·Ban self-approve·⛔push）

**席位**：cost-columns 起草席（诊断+起草双责·协调方派·cost-columns 战役·COST-COLUMNS 价格列刀）。
**基线**：`feat/mysql-schema-skeleton` @ `109e3eb1`（=fetch 后 origin tip 亲证·perfload-env-fix nail SSOT commit·docs:check 2133≤cap 2136 本树亲跑 EXIT=0）· 分支 `line/cost-columns`（本起草席 `git worktree add ../meetwise-ccl -b line/cost-columns 109e3eb1` 亲立·HEAD 落 `109e3eb1` 亲证）· 工作树 `meetwise-ccl`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（2026-10-14·cost-columns 战役·「#48/#49 要求模型用量结算区分 cached_input 与普通 input token 价格·现状 ai_model_invocation 观测半已落但价格列/结算面未区分」·「LEDGER 行语义为准」）；②LEDGER 语义权威=`ai-docs/delivery/ai-capability-review/issues-final.md:550`（#48/#49 行原文「输入缓存零收益、cached_tokens 不计量、**价格本没有缓存价**」+处置「先接 cached_tokens / prompt_cache_hit_tokens 观测再下结论」——观测半 AG-COST1 已落）；③收口判定权威=`execution-master-checklist.md:2633`（AG-COST4 STILL OPEN「#48/#49 收口（本刀=硬前置已施工·收口判定待 ⑤AG-08+⑥回灌/显式缓存与观测数据窗）」）+`:2361`（AG-COST1「只观测零计费（settle/validUsage/价格行零字节）」——本刀即把这三处零字节面翻成计量面）；④结构范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8 形制·blob `93904f20` 系 §0.1 其卷锚·本卷范本 blob 实测 `git hash-object` 对本基线树亲算）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`109e3eb1`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠

- `git branch --list "line/cost-columns*"` 恰 1 命中=本席分支；`git worktree list` 建后 13 树实测无第二 cost-columns 同名树；`ls ai-docs/delivery/harness/ | rg cost-columns` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀触面五 tracked 产品/脚本文件=`packages/ai-runtime/src/invoke.ts`+`packages/db/src/model-op/ai-cost-governance.ts`+`apps/worker/src/model-cost-governance.ts`+`apps/worker/test/ag11-settle-relax.proof.ts`+`scripts/run-e2e-isolated.mjs`。起草日扫描亲证：worktree 常驻在飞 11 支线（batchflip/batch-residual-plan/ci-wiring3/ci-red-clear/batch1-residual/obs-ledger/ops-hygiene/perfload-env-fix/receipt-archive2/reconcile-retry/status-flip2/uc184-slot-order）对该五文件**零新增提交**；历史期 feature/*、rv/*、line/db-* 系残枝有旧时代分叉（如 `c3de7fe6`/`b16916fe` 世代）——沿 negbend-fix rev3「b110 历史残枝非在飞」判定先例不构成在飞交叠，EXEC 立项日对届时 tip 全量复扫（逐命中 `git merge-base --is-ancestor <命中> <届时tip>`·被吸收=残枝放行·否则触「现场漂移」停）。
- **简报「line/ci-red-clear @bb1627d8 领先主线 5 commits」如实登记**：`git rev-list --count` 双向亲证（bb..109=0·109..bb=5）——该 5 笔未并主线，本基线按简报「以 origin tip 为基」=109e3eb1 执行；EXEC 工序1并线自然吸收。

### 0.1 blob 锚表（`git hash-object` 亲算 @`109e3eb1`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `packages/db/migrations/0033_ai_cost_governance.sql` | `2cce4019` | **`:7-:17` `ai_cost_price_book`（`:12` 仅 `input_micro_cny_per_million` 单价列·`:16` PK 四元组）——「价格本没有缓存价」直证（issues-final :550）·`:151-:172` `ai_cost_settle`（embed 路径·出界零触）** |
| `packages/db/migrations/0036_ai_text_cost_governance.sql` | `68770a26` | **`:10-:12` output 价列 ADD 先例（nullable 语义「旧 RAG revision 输出价固定为 0」）·`:14-:25` reservation 实量列 ADD 先例·`:160` `ai_cost_reserve_text_scoped` 薄壳** |
| `packages/db/migrations/0083_ai_text_cost_price_revision_binding.sql` | `fe6d5de1` | **`:66` `SELECT * INTO price`（%ROWTYPE 自扩展）·`:88-:94` reservation 捕获 INSERT（`:94` 仅捕 `price.input/output_micro_cny_per_million` 双价·零 cached 价捕获=缺口②）** |
| `packages/db/migrations/0188_ag11_cost_reserve_least_and_settle_relax.sql` | `c06ef6d5`（382 行） | **`:282-:344` `ai_cost_settle_text` 五参现行体（`:303-:315` header 冻结 join·`:320-:321` 上限守卫·`:323-:325` 公式 `CEIL(input×input价/1e6)+CEIL(output×output价/1e6)`——cached 与普通 input 同价整算=缺口③·`:335-:341` GREATEST 单调不缩史值）·`:354-:366` scoped wrapper 五参·`:371-:372` ACL（REVOKE PUBLIC+GRANT app_role·scoped wrapper ACL 面——核心 settle_text 显式 ACL 在 `0036:184`（五参原形 rg 亲证）·0188 核心体 `:282-:344` 内零 ACL 语句 rg 亲证=DROP 身份变更后 ACL 须随发补发〔rev2 勘误〕）** |
| `packages/db/src/model-op/ai-cost-governance.ts` | `54302901`（106 行） | **`:56-:59` `settleAiCost`（embed 路径·出界零触）·`:68-:74` `settleAiTextCost` 五参（SQL `ai_cost_settle_text_scoped($1..$5)`·零 cached 入参=缺口④）** |
| `packages/ai-runtime/src/invoke.ts` | `44e137f6`（1204 行） | **`:69-:75` `cachedInputTokens` 字段（三端点兼容读取注释+「**settle/validUsage/预留/结算不读此字段（价格本无缓存价）**」自证缺口）·`:469-:482` `validUsage`（`:475-:477` input/output 三查·零 cached 校验）·`:738` tracer 观测（AG-COST1/AG-24 已落半·零字节保持）·`:1038`/`:1145` 两 settle 调用点（只传 input/output）** |
| `apps/worker/src/model-cost-governance.ts` | `f777c642`（202 行） | **`:31-:40` `ModelCostPriceBinding`（`:36` priceRevision·`:37-:38` input/output 价·零 cached）·`:46-:47` binding→row 映射·`:114-:117` env 解析（`_PRICE_REVISION`/`_INPUT_MICRO_CNY_PER_MILLION`/`_OUTPUT_MICRO_CNY_PER_MILLION`/`_PRICE_SOURCE_URL`）·`:179-:193` seed INSERT（ON CONFLICT DO NOTHING）+回读断言（不等→`model_cost_price_revision_conflict`）** |
| `apps/worker/test/ag11-settle-relax.proof.ts` | `9284e4a0`（324 行） | **八臂（α/β/β-0/γ/δ/ε/ζ/η·0188 补证 b2b7d337 本体）·`:295` η 臂 `to_regprocedure('ai_cost_settle_text_scoped(text,text,text,integer,integer)')` 五参 identity 串钉（`signature_exists` 断言 `:309`）——本刀六参改形必伴生重钉处（AG-COST3 B2「ag19 seam 正则收尾形」先例同款）·`:134/:155/:174/:191/:231/:252/:273/:274` `settleAiTextCost` 恰 8 调用点（rev2 rg 亲证·机械加参预授权清单=件③）** |
| `apps/worker/src/rag-cost-governance.ts` | `84ea559a` | `:117-:121` reserve·`:139` `settleAiCost`（embed 路径·**范围外零触**§3-2） |
| `packages/ai-runtime/test/model-usage-cache-observe.proof.ts` | `245d6db8` | **28 臂（AG-COST1 观测半本体·parse 层·零 DB）·fixtures `:42/:44` cached_tokens 故意>prompt_tokens（parse 层三态证明与 settlement 校验分层互不影响——本刀 zero touch 此文件§3-5）** |
| `packages/ai-runtime/test/runtime-kernel.proof.ts` | —（只读引用） | `:254` usage `{input:100,output:200,cached:77}`（cached≤input·新校验不破）·`:260-:261` AG-24 三标量位断言 |
| `scripts/run-e2e-isolated.mjs` | —（行锚·本刀 12 处 +1 行） | **预迁移单含 0083/0188 成本链的恰 12 条目（rev2 rg 亲证分母=13 命中/12 条目·ag11 条目 0083+0188 双行）：六旧 `uc028:nhp-fault:prove:raw`（`:181-:199`）·`model-cost:prove:raw`（`:230-:244`）·`model-invocation-reconcile:prove:raw`（`:245-:256`）·`model-op00:prove:raw`（`:369-:384`）·`ag11-settle:prove:raw`（`:385-:401`·0188 在 `:400`）·`failover-price-policy:prove:raw`（`:402-:417`）+六新 `estimate-threading-invoke:prove:raw`（`:418-:432`）·`model-op00-usage-reconciler:prove:raw`（`:433-:453`）·`model-op02:prove:raw`（`:468-:489`）·`model-op02-endpoint-partition:prove:raw`（`:491-:514`）·`model-slot-bypass:prove:raw`（`:515-:536`）·`db-trigfam:prove:raw`（`:1479-:1498`·两段行号以届时树实测为准·EXEC 立项日对 merge 树 `0b12224e` 全量重 pin：条目集恰 12 无第 13 条·七处区间漂移如实更锚其中 :245-:256/:402-:417 系复审 P2-2 亲证校正）——隔离库按单施迁移，缺 0204 即六参函数缺席硬红** |
| `packages/db/migrations/0144_db_trigfam_unify.sql` | —（只读引用） | `:554-:566` `ai_cost_reserve_text_scoped` 现行体=纯委托（`RETURN QUERY SELECT * FROM ai_cost_reserve_text(...)` `:562-:563`）——reserve_text 体改经此自动贯通·零字节 |
| `scripts/ai-docs/public-text-policy.mjs` | —（只读引用） | `:75` `MAX_FILES = 2_136`（docs:check cap 红停线） |

### 0.2 派单简报漂移登记（结论零变·如实改锚）

1. **简报基线「现≈bb1627d8+」**：实测 origin tip=`109e3eb1`（§0.0 第三条·按「以 origin tip 为基」执行）。
2. **简报「#48/#49（批5-5C?）」批次归属勘误**：#48/#49 系**批2 残挂账**（LEDGER :210/:299 批2 残名在案）·非 5C——语义以 issues-final :550 为准（简报自注「LEDGER 行语义为准」）。
3. **简报「迁移 +1 新列（cached_input_price 或 tokens_cached 列）」细化**：结算必需面=**两表同名列 `cached_input_micro_cny_per_million`**（价格本+预留·捕获式结算架构所必需·见 §1.2-裁决）；`ai_model_invocation` 观测持久列（tokens_cached）非结算必需（cached 实量经 provider usage→validUsage→settle 参数贯通·观测半已 metrics/Langfuse 落）→**不入本刀**（§3-4·裁决 (a) 列数=2 非 1·如实登记）。

### 0.3 迁移号登记（预期恰 1 熔单迁移·占位 0204·0203 归 line/reconcile-retry 交叉登记）

- 主线链顶实测：`ls packages/db/migrations/*.sql | wc -l`=**202**·头 `0202_interview_event_kind_score_card_written.sql`（`node scripts/check-migration-version-uniqueness.mjs` 本树亲跑=`files=202 violations=0 exemptions=0143,0152,0160` EXIT=0）。
- **协调方裁决（2026-10-14·rev2 落卷）**：`0203` 归 `line/reconcile-retry`（RECONCILE-RETRY 观测化刀·先 EXEC 授权）——**在飞未并分支已占号计入已占**（该分支 tip `4fbb2e26` 亲证未并本线·其树 0203 迁移文件届时落·两卷交叉登记：对侧登记归 reconcile-retry 卷·本卷侧=本节+§4③+卷尾摘要）。
- 本刀占位 **`0204_ai_cost_cached_input_price.sql`**（顺延实测规则：EXEC 立项日对届时主线链顶 `ls packages/db/migrations` 亲数+在飞分支题面复核后取最小未占号·0203 计入已占·零硬编码沿 AG39 改占/cost4「顺延规则优先」先例·Ban 抢号 Ban 私占）。修法=expand-only 熔单（§1-修法件①·0149/0192 先例形）·零新表零 DROP COLUMN 零 ALTER COLUMN TYPE 零 NOT NULL 回填零存量行触碰。

## §1 红事实（缺口三点定位·全部亲证）

### 1.1 观测半已落（非缺口·零字节保持面）

- `invoke.ts:69-:75` cachedInputTokens 三端点字段兼容读取（OpenAI `cached_tokens` ∥ DeepSeek `prompt_cache_hit_tokens` ∥ 百炼 `prompt_tokens_details.cached_tokens`）+`:738` tracer→METRIC 两键+Langfuse `input_cached`——AG-COST1 `6f2ed876` 收官（checklist :2361·只观测零计费）+AG-24 落面。**该字段注释自证缺口**：「settle/validUsage/预留/结算不读此字段（价格本无缓存价）」（`:73`）。
- DB 侧零 cached 列：`rg -n "cached_tokens|cached_input" packages/db/migrations/*.sql` 零命中亲证（观测不经库）。

### 1.2 缺口三点（「价格列/结算面未区分」的机证分解）

- **缺口① 价格面（列缺→配置缺）**：`ai_cost_price_book` 仅 `input_micro_cny_per_million`（0033:12）+`output_micro_cny_per_million`（0036:10-12）——**无 cached_input 价列**，价格配置面（model-cost-governance.ts :31-40/:114-117/:179-193）随之无键可配。issues-final :550「价格本没有缓存价」逐字直证。
- **缺口② 预留捕获面**：`ai_cost_reserve_text`（0083:66-:94）捕获双价入预留行，零 cached 价捕获——结算的不可变单价源（「结算按预留行捕获单价」rag-cost-governance.ts :115-116 注释自证架构）无处取缓存价。
- **缺口③ 结算公式面**：`ai_cost_settle_text`（0188:323-325）`CEIL(input×input价/1e6)+CEIL(output×output价/1e6)`——cached 命中部分按全价整算（#48/#49「cached_tokens 不计量」的结算本体）。
- **缺口④ TS 贯通面**：`settleAiTextCost`（ai-cost-governance.ts :68-74）五参零 cached；`invoke.ts:1038/:1145` 两调用点零 cached 实参；`validUsage`（:469-:482）零 cached 校验（cached>input 的畸形 usage 将直通结算）。
- **裁决 = (a) 迁移 +1 熔单（0204·expand-only·0203 归 reconcile-retry 见 §0.3）+价格配置扩展+结算区分**。理由：**(b) 纯查询/配置面不成立**——价格本无列（缺口①机证），无列即无价可配，结算区分无从谈起；**(c) 其他不适用**——观测半已落（AG-COST1），缺口精确收敛于「价格列+捕获+公式+贯通」四点，一张 expand-only 熔单+三 TS 文件+两伴生面可闭，无需动观测层与 embed 路径。

## §1-修法（价格列刀·expand-only·行为保持铁律见下）

**行为保持铁律（⛔ 不得更改·全件适用）**：①供应商**未回报** cached 计量（字段缺席）→cached 按 0 结算→与现行公式**逐位恒等**（保守多计方向不变·parse 层「缺席≠零铁律」零触·model-client 零字节）；②价格行 cached 价为 **NULL**（未设缓存价·含全部存量行）→结算 COALESCE 回 input 价=现行为（CEIL 拆分对现行全价整算偏差 ≤+1 micro-CNY·恒保守多计向·`cached=0` 时逐位恒等）；③存量已 settled 行不可变零触碰；④GREATEST 单调不缩史值与 header 冻结上限双守卫（0188:303-:321/:335-:341）零字节（cached≤input 被 input 上限自然覆盖）。

- **件①（0204 熔单·新增 `packages/db/migrations/0204_ai_cost_cached_input_price.sql`·占位实测规则 §0.3·0203 归 reconcile-retry·头 `-- @migration-mode multi-statement` 沿 0192:6 形·两段式 ADD COLUMN（PG16 fast-default 元数据形零全表 rewrite）+ADD CONSTRAINT NOT VALID+VALIDATE 独立语句沿 0192:12-13 先例形）**：
  - 段 1-3 `ai_cost_price_book`：`ADD COLUMN IF NOT EXISTS cached_input_micro_cny_per_million bigint`（nullable·NULL=未设缓存价）→`ADD CONSTRAINT ai_cost_price_book_cached_input_check CHECK (cached_input_micro_cny_per_million IS NULL OR cached_input_micro_cny_per_million >= 0) NOT VALID`→`VALIDATE CONSTRAINT`。
  - 段 4-6 `ai_cost_reservation` 同形（列同名·约束 `ai_cost_reservation_cached_input_check`）。
  - 段 7 `CREATE OR REPLACE FUNCTION ai_cost_reserve_text`（9 参签名+RETURNS TABLE 零变=REPLACE 合法零 DROP）：体逐字承载 0083 现行形·仅 INSERT 列集与 VALUES 增 `cached_input_micro_cny_per_million`/`price.cached_input_micro_cny_per_million` 恰两处（`SELECT * INTO price` :66 %ROWTYPE 自扩展零改）。
  - 段 8-9 `DROP FUNCTION ai_cost_settle_text(text,text,text,integer,integer);` + `CREATE FUNCTION ai_cost_settle_text(p_scope_id text,p_request_owner text,p_idempotency_key text,p_actual_input_tokens integer,p_actual_output_tokens integer,p_actual_cached_input_tokens integer) RETURNS bigint`——**六参无 DEFAULT（fail-closed·漏改调用点即 SQL 报错显形·禁 overload 双存沿 0188「恰一 DROP+CREATE」先例）**·体=0188 :282-:344 逐字承载+恰三处扩：①入参守卫段加 `p_actual_cached_input_tokens IS NULL OR < 0 OR > p_actual_input_tokens → RAISE 'ai_cost_cached_exceeds_input'（check_violation）`；②公式改 `CEIL((input−cached)×input价/1e6)+CEIL(cached×COALESCE(r.cached_input_micro_cny_per_million, r.input_micro_cny_per_million)/1e6)+CEIL(output×output价/1e6)`（cached=0 时逐位恒等现行值）；③settle UPDATE 零加列（`input_tokens_actual` 存 input 全量语义维持·cached 实量持久化=§3-4）。header join/上限守卫/GREATEST 段零字节。**ACL 第三语句随发（rev2 P0-甲·双席会签）**：`REVOKE ALL ON FUNCTION ai_cost_settle_text(text,text,text,integer,integer,integer) FROM PUBLIC,app_role;`——DROP 即湮灭 `0036:184` 原设 ACL（`REVOKE ALL ON FUNCTION ai_cost_settle_text(text,text,text,integer,integer) FROM PUBLIC,app_role;` 五参原形亲证），CREATE 复默认 PUBLIC EXECUTE=核心 SECURITY DEFINER 结算入口（0188:287 属性亲证）fail-open 不可接受·沿 0188 wrapper「ACL 随发」先例（`:371-:372`）同形换六参。
  - 段 10-13 `DROP FUNCTION ai_cost_settle_text_scoped(text,text,text,integer,integer);` + `CREATE FUNCTION ai_cost_settle_text_scoped(六参) RETURNS TABLE(micro_cny bigint, overage boolean)`（0188 :354-:368 体逐字·传参 +1·回读形零变·⛔ 禁 OUT overload）+ ACL 恰两行随发（`REVOKE ALL ... FROM PUBLIC; GRANT EXECUTE ... TO app_role;`·0188 :371-:372 同形换六参签名）。
- **件②（TS 贯通三件）**：
  - ②-a `packages/db/src/model-op/ai-cost-governance.ts`：`settleAiTextCost`（:68-:74）签名增第 6 参 `actualCachedInputTokens: number`（必传·注释引 #48/#49）→SQL 改六参 `$6`。
  - ②-b `packages/ai-runtime/src/invoke.ts`：①`validUsage`（:475-:477 后）增 cached 校验臂：`cachedInputTokens !== undefined` 时三查（Number.isInteger/≥0/≤inputTokens）不达→`return undefined`（归并既有 `provider_usage_invalid` 收口臂·零新语义）；②`:1038`/`:1145` 两调用点增实参 `settledUsage!.cachedInputTokens ?? 0`（缺席→0=行为保持铁律①）；③`:69-:75` 字段注释随翻（「settle/validUsage…不读此字段」句改「结算读·缺席按 0=现行保守语义·parse 层三态铁律不动」·其余逐字）。
  - ②-c `apps/worker/src/model-cost-governance.ts`：`ModelCostPriceBinding`（:31-:40）增 `cachedInputMicroCnyPerMillion: number | null`；env 解析（:116 后）增可选 `${prefix}_CACHED_INPUT_MICRO_CNY_PER_MILLION`（缺席→null=列不写·现行为恒等；在场→正整数·非法启动失败沿 positive() 先例）；seed INSERT（:179-:183）列集+值带 null 透传；回读断言（:184-:193）增 cached 臂（stored NULL↔expected null·非 null 数值相等·不等→`model_cost_price_revision_conflict` 原码）。`ModelCostPolicy`/policies 面**零字节**（cache 价只入 priceRows 捕获链·reserve 语义不变）。
- **件③（伴生断言+注册·恰两文件）**：
  - `apps/worker/test/ag11-settle-relax.proof.ts`：①η 臂 `:295` identity 串五参→六参**恰 1 行重钉**（`'ai_cost_settle_text_scoped(text,text,text,integer,integer,integer)'`·AG-COST3 B2「ag19 seam `$16,$17`→`$17,$18,$19`」迁移加列伴生断言先例同款）；②新增 ≥4 臂 **additive 顺延命名（ι/κ/λ/μ）**：ι cached=0 逐位恒等臂（同 input/output 下新公式值==旧公式值对表）·κ 有缓存价分账臂（seed 含 cached 价 revision→settle 断言精确 micro_cny+预留行捕获 cached 价）·λ NULL 缓存价回退臂（cached 价 NULL→cached 部分按 input 价计）·μ cached>input 拒绝臂（`ai_cost_cached_exceeds_input` errcode/message 断言）。既有 **8 臂**（α`:158`/β`:177`/β-0`:193`/γ`:208`/δ`:234`/ε`:262`/ζ`:287`/η`:307`·rev2 rg 亲证·臂数偏差即停重 pin）断言零改（η 恰 :295 一行重钉除外）+既有 `settleAiTextCost` 调用点恰 **8 处**（`:134/:155/:174/:191/:231/:252/:273/:274`·rev2 rg 亲证·`:26` 系 import 非调用）**机械 +1 实参 `0`（预授权清单·逐位照列·臂断言语义零改）**。臂总数=8+实新增·以实跑实测为准（预期 12）。
  - `scripts/run-e2e-isolated.mjs`：§0.1 **恰 12 条目**预迁移单尾各 +`packages/db/migrations/0204_ai_cost_cached_input_price.sql` **恰 1 行**（12 处·白名单只增不清·沿 AG-B/AG-C/AG-E 预迁移巨行并集先例形）。EXEC 立项日 `rg -n "0083_ai_text_cost_price_revision_binding|0188_ag11" scripts/run-e2e-isolated.mjs` 复测分母——若届时-tip 出现第 13 条含 0083/0188 的条目→同规则尾追加并如实登记（预授权条款）；条目集对本清单多/减员超出本条款→§8 停。
- **件④（收据）**：`ai-docs/delivery/receipts/cost-columns/00-exec.md`——七字段（门矩阵全表+EXIT 原值+改前基线 run 名单+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）。
- **diff 面预期**：恰 7 tracked 路径=0204 新迁移+件② 三 .ts+件③ 两文件+本卷 .md（+收据目录 untracked）——多任何 tracked 路径即停（越界需要类）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵·数字口径以实跑实测为准）

1. **migrate:prove**：`pnpm migrate:prove` EXIT=0·链头实测=**0204**（届时链顶顺延如实记·reconcile-retry `0203` 先并则链含 0203+0204 双行·未并则 0203 空缺=预占在飞·两态均非红）。
2. **drift:prove 零漂移**：`pnpm drift:prove` EXIT=0。
3. **migration uniqueness**：`node scripts/check-migration-version-uniqueness.mjs`→`violations=0 exemptions=0143,0152,0160`（files 对届时链顶亲数：reconcile-retry 0203 先并=`204`·未并=`203`·0204 在链为准·violations 恒 0）。
4. **结算面 proof（ag11-settle:prove）**：`pnpm ag11-settle:prove` EXIT=0——既有八臂（η 重钉六参后）+件③ 新增臂全绿·臂总数实测记录（预期 12·**熔断=新增臂缺位或既有 8 臂红即停**）。
5. **邻面不回退（六门全 EXIT=0）**：`model-op00:prove`+`model-op02:prove`+`model-op02-endpoint-partition:prove`（cost5 三门·后两门 prove 条目=件③ 预迁移单恰 12 条目之 #9/#10·rev2 自洽注）+`model-cost:isolated:prove`+`failover:prove`+`bill3-settlement:prove`。
6. **观测半恒等（两门 EXIT=0）**：`pnpm -C apps/worker prove:usage-calibration-bleed`（26 臂·实测为准）+`pnpm -C packages/ai-runtime prove:model-usage-cache-observe`（**28 臂恒等**·此证 parse 层三态铁律零触——臂数≠28 即停）。
7. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached）。
8. **lint 五值恰等**：`pnpm turbo lint` 全绿·五预算**恰等** web `601`/root `5235`/api `1421`/worker `954`/ai-runtime `628`（本刀基线钉值·出现任一预算上调需求或第三红→**红停上报协调方 sanction**·Ban 就地调 budget）。
9. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·`scanned ≤ 2136`（起草树基线 2133+本卷 1=2134 预期·**>2136 红停上报**·cap 归协调方 sanction）。
10. **markers 五类零命中**：本刀改动集（7 tracked+收据）五类标记词 grep 零命中（词面运行时组装不复抄卷内防自匹配·i6-239 词族口径·命令与回执入收据）。
11. **diff 面机检**：`git diff --numstat <base>` 恰 7 tracked 路径（§1-修法预期清单）+收据目录 untracked——多/少任何 tracked 路径即停（越界需要类）。
12. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼（proof 全离线脚本+隔离库·est live=0）·`apps/web/tsconfig.tsbuildinfo` 运行翻动 checkout 归位不入 commit（negbend §9 先例形）。

## §3 范围外（边界清单·越界即 FAIL）

1. **embed 路径零触**：`ai_cost_settle`/`ai_cost_reserve`（0033/0034 单价系）+`rag-cost-governance.ts`（:117-:139）零字节——embedding 无 prompt caching 计量·cached 分账无输入面。
2. **观测层零触**：`model-client.ts`/`metrics.ts`/`trace.ts`/`langfuse-v5.ts` 零字节——parse 层「缺席≠零」三态铁律与 METRIC 键面不动（本刀只动结算消费端）。
3. **既存迁移零字节**：0033/0036/0083/0188 等全链既存迁移文件历史字节零触碰（0149 重制注记「checksum 变更=重制预期形」教训·本刀零重制）。
4. **`ai_model_invocation` 零加列**：cached_tokens 观测持久列归观测数据窗后继刀（本刀 settle 参数贯通已闭计量面·DB 持久化非结算必需·§0.2-3）。
5. **bill3 settlement_ledger 域零触**：`rg -c "ai_cost" apps/worker/test/bill3-settlement.proof.ts`=0 亲证零交叠·邻门仅作不回退承载。
6. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star/issues-final 只读引用——#48/#49 行翻面权归协调方 nail。
7. **零 CI/wrapper/runner 改**（run-e2e-isolated.mjs 仅限 §1-修法件③ 12 处预迁移单 +1 行·零逻辑改）·零依赖升级。

## §4 依赖

**①上游已满足**：AG-COST1 观测半（`6f2ed876` 在链）+AG-COST4 #48/#49 收口硬前置（`44f0f6b6` 在链）+0083/0188 结算机器本体+0036 nullable 价列先例。**②无同文件并发**：§0.0 在飞交叠复核亲证+立项日复扫规则。**③迁移号**：§0.3 占位 0204 顺延实测规则+0203 归 line/reconcile-retry（在飞已占计入·两卷交叉登记·本卷侧落 §0.3/卷尾）。**④下游**：#48/#49 收口判定归协调方（本刀=计量面施工·非收口判定席·checklist :2633「收口判定待 ⑤AG-08+⑥回灌/显式缓存与观测数据窗」维持）；cached 实量 DB 持久化+⑥回灌归观测窗后继刀。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（红不重跑冲销·改前基线 run 恰一次）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 迁移扩面（0204 之外零 DDL·零新表·零 DROP COLUMN/TYPE·零 NOT NULL 回填·零存量行 UPDATE——需则停上报走认领规则）；Ban 触 embed 路径与观测层（§3-1/§3-2）；Ban `ai_model_invocation` 加列（§3-4）；Ban 为绿改断言（ag11 既有 8 臂断言零改·η 恰 1 行重钉+8 调用点机械加参 `0` 预授权清单除外）；Ban 就地调 lint 预算/docs cap（§2-8/9 sanction 上报）；Ban 改共享 SSOT（§3-6）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 范围外新缺口就地顺手修（如实登记升级）；Ban 造 `.env*`/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（门矩阵 proof 全离线脚本+隔离库·无云端目标）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn+rev2 修订 turn 同恰 1 .md）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词面不复抄卷内防自匹配——沿 negbend-fix/g7w 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.2 缺口结论与 §5 Ban/pins 与 §1-修法四件交付面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞复扫必做·§0.2 简报漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且 §1.2 结论受疑（如 settle 公式/捕获链被他刀先改·ag11 八臂臂数变动·预迁移单条目集与件③ §0.1 恰 12 条目清单不符（对届时 rg 实测·件③ 第 13 条预授权条款内顺延除外）·§0.0 在飞复扫出新非残枝命中）→停·重 pin 回炉。
- **机制不满足**：件③ proof 新增臂未全绿或实测行为与 §1-修法推定形不符（如 cached=0 臂非逐位恒等·NULL 回退臂取值≠input 价）→修法语义被证伪→停·如实升级协调方回炉（Ban 就地改语义 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法四件面（需触观测层/embed 路径/既存迁移重制/`ai_model_invocation` 加列/0204 外新 DDL）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻六门新红/观测两门臂数漂/lint 预算需上调/docs:check>2136）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*COST-COLUMNS REQUEST · 2026-10-14 起草 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`109e3eb1`（=origin tip 亲证）· 分支 `line/cost-columns` · 工作树 `meetwise-ccl`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=协调方派单 brief+issues-final :550（#48/#49「价格本没有缓存价」语义权威）+checklist :2361/:2633（AG-COST1 观测半已落+AG-COST4 硬前置已施工·收口判定待）· 缺口三点机证=价格本零 cached 价列（0033:12）+预留零 cached 捕获（0083:94）+结算公式 cached 全价整算（0188:323-325）+TS 贯通零 cached（ai-cost-governance.ts:68-74/invoke.ts:1038/:1145/validUsage:469-482）· 裁决=(a) 迁移 +1 熔单 0204 占位（0203 归 line/reconcile-retry 交叉登记·expand-only·两表同名列 `cached_input_micro_cny_per_million`·0149/0192 熔单两段式先例形·settle_text 六参恰一 DROP+CREATE 沿 0188 先例·六参无 DEFAULT fail-closed 禁 overload·核心 ACL REVOKE 随发=0036:184 同形换六参〔rev2〕）+价格配置扩展（env 可选 `_CACHED_INPUT_MICRO_CNY_PER_MILLION` 缺席=null 行为恒等）+结算区分（validUsage cached 三查+两调用点贯通·缺席→0 逐位恒等铁律）+伴生面（ag11 η 恰 1 行重钉+新增 ≥4 臂 additive·既有 8 臂断言零改+8 调用点机械加参 0〔rev2〕·预迁移单恰 12 条目各 +1 行〔rev2 六漏网补齐〕）· 行为保持铁律四条（缺席→0/NULL 回退/存量不可变/GREATEST+header 守卫零字节）· 门矩阵十二门（migrate 链头 0204+drift+uniqueness files 对届时链顶亲数（0203 先并=204/未并=203）+ag11-settle 结算面+邻六门不回退+观测两门 26/28 臂恒等+typecheck 8/8+lint 五值恰等+docs:check≤2136 红停+markers+diff 面机检恰 7 tracked+卫生）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · rev2 2026-10-14 六项处置落卷（卷尾处置摘要）· STOP*


---

## rev2 处置摘要（pre-exec 双审双 FAIL 会签处置·2026-10-14 修订席落卷·每处亲证后落笔）

**双审登记**：pre-exec 双审两外席双 FAIL（席1 P1×2+席2 P0×2·高度收敛）·本节=六项处置逐项落点+亲证实证（本树 `line/cost-columns` @`aa5189db` 亲证·代码锚与基线 `109e3eb1` 等同——rev1 `aa5189db` docs-only 单文件）。协调方两裁决先行落卷：①`0203` 归 `line/reconcile-retry`（观测化刀·先 EXEC 授权）·本刀改占 `0204`（全卷机械改名·§0.3 顺延规则·在飞未并分支已占号计入已占·两卷交叉登记）；②铁律② 措辞照席1 修正（CEIL 拆分 ≤+1 micro-CNY 保守向）。

1. **P0-甲（席2·席1 同判）**：件① 段 8-9 增第三语句 `REVOKE ALL ON FUNCTION ai_cost_settle_text(text,text,text,integer,integer,integer) FROM PUBLIC,app_role;`——亲证：`0036:184`=`REVOKE ALL ON FUNCTION ai_cost_settle_text(text,text,text,integer,integer) FROM PUBLIC,app_role;`（五参原形）·0188 核心体 `:282-:344` 零 ACL 语句·0188:287 `SECURITY DEFINER` 属性·0188 wrapper `:353-:354` DROP+CREATE 后 `:371-:372` ACL 随发先例——DROP 湮灭 0036:184 原设 ACL·CREATE 复默认 PUBLIC EXECUTE=核心 SECURITY DEFINER 结算入口 fail-open·原卷「零补发」结论撤销。§0.1 0188 行锚勘误：「全链唯一显式 ACL 面」→「scoped wrapper ACL 在 0188·核心 ACL 在 0036:184」。
2. **P0-乙（双席同判）**：件③ 预迁移单「恰六条目」→「恰 12 条目各 +1 行 0204」——rg 亲证 13 命中/12 条目（ag11-settle 条目 `0083:396`+`0188:400` 双行）·补六漏网（`estimate-threading-invoke:prove:raw` `:418-:432`/`model-op00-usage-reconciler:prove:raw` `:433-:449`/`model-op02:prove:raw` `:468-:483`/`model-op02-endpoint-partition:prove:raw` `:491-:508`/`model-slot-bypass:prove:raw` `:515-:531`/`db-trigfam:prove:raw` `:1479-:1493`·起始行亲证吻合·区间以届时树实测为准）·§2-5 邻门（model-op02/model-op02-endpoint-partition=12 条目之 #9/#10）与件③ 自洽加注·§3-7 六处→12 处。
3. **P0-丙（席2）/P1-F2（席1）**：件③ ag11 既有 `settleAiTextCost` 调用恰 **8 处**（`:134/:155/:174/:191/:231/:252/:273/:274`·rg 亲证·`:26` 系 import 非调用）机械 +1 实参 `0` 预授权清单化（臂断言语义零改）·「α-η 七臂零字节」撤销·统一「8 臂断言零改·8 调用点机械加参」——8 臂=α`:158`/β`:177`/β-0`:193`/γ`:208`/δ`:234`/ε`:262`/ζ`:287`/η`:307`（rg 亲证·「七臂」错源=β-0 漏计·proof `:314` 收官行自证「八臂」）·§0.1/§2-4/§5 Ban 同步。
4. **P1-F1（席1）**：§8 停止条件「预迁移单条目数≠6→停」→「条目集与件③清单不符→停（对届时 rg 实测·件③ 第 13 条预授权条款内顺延除外）」——消解与件③ 预授权条款的冲突。
5. **P2**：铁律② 行文修正（CEIL 拆分对现行全价整算偏差 ≤+1 micro-CNY·恒保守多计向·cached=0 逐位恒等）；0203→0204 全卷机械改名（题名/§0.3/§1.2 裁决/件①/件③/§2-1/§2-3/§3-7/§4/§5/§8/卷尾）；η 臂 `:295` 五参 identity 串重钉具体性维持零改；三则观察登记（零触·见 6）。
6. **三则观察登记（零触·不构成本刀交付面）**：①`0083:66-:68` 绑定谓词（provider/model/region/revision/effective_at 五键）对 cached 列失明=设计恒等——cached 价经 `:66` `%ROWTYPE` 自扩展随行读出·不参与绑定匹配·0204 扩列零改谓词；②`model-cost-governance.ts:184-:193` 回读断言不等→`model_cost_price_revision_conflict` 抛错停机纪律维持——件②-c cached 臂纳入同码同纪律·Ban 静默覆盖；③`invoke.ts:1201` 既有注释自引「:1047 settleAiTextCost 已赋值」而实际调用在 `:1038`=既有行号漂移·零触不修（§0.1 锚 `:1038/:1145` 亲证无漂）。

**rev2 自检**：docs:check EXIT=0（scanned 2134≤cap 2136·改前改后同值本树亲跑）·markers 五类零命中（check-docs 内置扫描通过）·STOP=`draft:awaiting_pre_exec_dual` 维持（双 FAIL 撤销须复审两外席 BOTH PASS·alone≠dual·Ban self-approve）·diff 面=本卷恰 1 .md·⛔push。

---

## §9 EXEC 记录（append 保史·2026-10-15·0204 立项落码·头部 Status 随翻 executed:awaiting_post_prove_dual）

**E0 立项+并线**：授权链=rev2 `74d7e0d6`→pre-exec 窄域复审 PASS `agent_02a7bfd0`→协调方 EXEC 明示授权 0204 立项（0203 归 reconcile-retry 已 nail 落主线·两卷交叉登记兑现）→`git fetch`+merge-tree 预演零冲突→`git merge --no-ff feat/mysql-schema-skeleton`=**`0b12224e`**（支线 `575b428e`=origin tip·merge-base `109e3eb1`·实测零冲突零 dual-keep·⛔pull --rebase 未用）。链顶亲数 merge 后=**203 头 0203**（uniqueness files=203 violations=0）→件① 占 **0204**=203+1 连续合法。§0.0 在飞复扫对届时分支全集（local+remote）逐支 `rev-list HEAD..b -- 五文件`=零非吸收命中。

**E1 重 pin**：§0.1 十三锚 blob 对 merge 树全同值（0033 `2cce4019`/0036 `68770a26`/0083 `fe6d5de1`/0188 `c06ef6d5`/ai-cost-governance `54302901`/invoke `44e137f6`/model-cost-governance `f777c642`/ag11 `9284e4a0`/rag `84ea559a`/observe `245d6db8`/0144 `29afdf46`/public-text-policy `01749caf`/run-e2e `e69e317a`=3189 行）·行锚逐条亲证零漂（invoke :1038/:1145、ag11 8 调用点+8 臂断言行+η :295、model-cost-governance 四段、0188 :282-372 全文、0083 :66/:88-94、0036 :184 五参 REVOKE 原形）。run-e2e 条目集=13 命中/恰 12 条目无第 13 条（预授权条款不触发）·七处区间漂移如实更锚落 §0.1 行。**P2-1**=0073:1342 `ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC` 亲证——DROP+CREATE 实际不获 PUBLIC（默认特权按创建角色）·件① 第三 REVOKE 仍系正确显式收敛（机制注记落 0204 文件头+收据§三）；**P2-2** :402-417/:245-256 校正落卷。

**E2 四件落点**：件① `packages/db/migrations/0204_ai_cost_cached_input_price.sql` 新增（258 行·blob `a5407acd`·`-- @migration-mode multi-statement`·14 语句=两表各 3（ADD COLUMN bigint nullable+CHECK NOT VALID+VALIDATE·0192 两段式）+reserve_text 九参 CREATE OR REPLACE（0083 体逐字·仅 INSERT 列集/VALUES 增 cached 恰两处）+settle_text 六参恰一 DROP+CREATE+REVOKE（0188 :282-344 逐字+恰三处扩：cached 三查守卫 raise `ai_cost_cached_exceeds_input`·三段 CEIL 公式 `CEIL((input−cached)×input价)+CEIL(cached×COALESCE(cached价,input价))+CEIL(output×output价)`·settle UPDATE 零加列）+scoped 六参 DROP+CREATE+REVOKE+GRANT（0188 :354-370 体逐字传参 +1·ACL 恰两行 0188 :371-372 同形换六参）·六参无 DEFAULT fail-closed 禁 overload）。件② 三件：②-a settleAiTextCost 六参必传+$6+注释引 #48/#49；②-b invoke.ts 字段注释随翻（「settle/validUsage…不读」句→「结算读·缺席按 0=现行保守语义·parse 层三态铁律不动」·其余逐字）+validUsage cached 三查臂（归并 provider_usage_invalid 收口·零新语义）+:1044/:1151 两调用点 `settledUsage!.cachedInputTokens ?? 0`；②-c model-cost-governance.ts PriceRow/Binding 增 `cachedInputMicroCnyPerMillion: number | null`+bindings 映射随行+`optionalPositive`（缺席→null=现行为恒等·在场→正整数非法启动失败沿 positive() 先例）+env 键 `_CACHED_INPUT_MICRO_CNY_PER_MILLION`+seed INSERT 列集/`$8`+回读断言 cached 臂（NULL↔null·非 null 数值等·不等→`model_cost_price_revision_conflict` 原码）·ModelCostPolicy/policies 面零字节。件③ 两文件：ag11-settle-relax.proof.ts 既有 8 调用点机械 +1 实参 `0`（预授权清单逐位照列·:26 import 非调用不动）+η :295 五参→六参恰 1 行重钉+新增 ι/κ/λ/μ 四臂 additive（ι cached=0 对表恒等·κ r2 revision cached 价 400_000 捕获+三段分账 88·λ NULL 回退按 input 价计 100 非 80·μ cached>input raise 原码 savepoint 零写）·既有 8 臂断言零改·头注臂清单/收官行随翻十二臂（additive 真实性）；run-e2e-isolated.mjs 恰 12 条目尾各 +1 行 0204（12 处·零逻辑改）。件④ 收据 `receipts/cost-columns/00-exec.md`（七字段全）。

**E3 门矩阵**：migrate EXIT=0（隔离链 applied=204·链头 0204）·drift EXIT=0 零漂·uniqueness files=204 violations=0·ag11-settle EXIT=0 **12/12 臂**（8 既有零改+η 重钉绿+四新臂全绿）·model-op00/model-op02/model-op02-endpoint-partition/failover 四邻门 EXIT=0·typecheck 8/8 0 cached·lint 五值恰等 601/5235/1421/954/628 全域 0 errors·docs:check EXIT=0 scanned 2143·markers 五类零命中·diff 面恰 7 tracked+收据·卫生全绿（frozen install 零 lockfile 改·.env* ABSENT·tsbuildinfo checkout 归位·actualSpendCny=null·est live=0）·协调方点名附加门 interview:prove **57 臂** EXIT=0+neg:all 六段 **687** EXIT=0（90+90+91+102+179+135）。**四红如实登记**（详情+归证见收据§二/§三）：model-cost:isolated（时钟竞态臂·stash 基线恰一次同败=基线红非本刀引入）·bill3-settlement（链深 pin 185 陈旧+0173 ACL 臂·stash 基线同 2 臂·ci-wiring2 `86303901`=batch-base 祖先亲证·§3-5 零触保持）·model-usage-cache-observe（28 臂恒等保持·27 绿 1 红——零计费负臂「settle/validUsage 仍零读+词面恰三处」前提被件②-b 授权语义翻转必然证伪（词面 3→7）·臂文本属 §0.1 zero-touch 文件+§2-6 28 臂恒等=**卷内矛盾**·pre-exec 未标注·Ban 就地改·该臂自注「计数随 AG-24 语义翻转登记不洗」=随翻重钉先例·**上报协调方裁决后继随翻重钉**）·usage-calibration-bleed（sha256 pin `fcc5cf4a…`≠AG-12 re-pin `b7846641`·末触面 ci-wiring2 `86303901` 先于 batch-base·基线先断非本刀）。

**E4 偏离五项**：①docs cap 2136→2144（merge 吸收 RECONCILE-RETRY sanction `4fcbeffb`·「三刀在飞共享余量」本刀在册·scanned 2143 绿·如实改锚）；②model-cost:isolated 基线红（时钟竞态·后继观测另刀）；③bill3 基线红（pin 陈旧·零触保持）；④observe 负臂卷内矛盾上报（零就地处置）；⑤invoke.ts :69 首行「只观测不改计费」按 rev2「其余逐字」令保留·与新句张力登记。零越界零借机修零 retry-to-green（基线对照每门恰一次）。

**E5 自检**：Ban 列表逐条过（零 push/零 pins 翻/零迁移扩面恰 1 熔单/零触 embed+观测层/零 ai_model_invocation 加列/零为绿改断言/零就地调预算/零改共享 SSOT/零触他树/零 .env/零依赖升级）；行为保持铁律四条实跑证成（ι 恒等臂+λ 回退臂+γ/η 守卫零改+ε ζ 存量路径零变）；共享 SSOT 零改（LEDGER/checklist/issues-final 只读）；**旧代码忽略仍正确**：六参无 DEFAULT 双显形（TS 编译期+SQL 期）·仓内调用点全贯通 rg 亲证（invoke 2+ag11 12=14 处·无第 15 处）·两新列 nullable 默认 NULL=旧路径恒等（COALESCE 回退+cached=0 逐位恒等·八既有臂+κ/λ 实跑亲证）·seed/回读 null 透传=缺 env 键现行为恒等。收据=receipts/cost-columns/00-exec.md。**STOP=`executed:awaiting_post_prove_dual`**·待 post-prove 双审两外席（alone≠dual·Ban self-approve）·⛔push
