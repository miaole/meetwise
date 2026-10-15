# COST-COLUMNS REQUEST — 价格列刀（#48/#49 结算区分 cached_input 与普通 input 价·0203 熔单 expand-only+TS 结算贯通+价格配置扩展·cost-columns 战役·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷·pre-exec 双审两外席待派·alone≠dual·Ban self-approve·Dual PASS ≠ 开工·⛔push）

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
| `packages/db/migrations/0188_ag11_cost_reserve_least_and_settle_relax.sql` | `c06ef6d5`（382 行） | **`:282-:344` `ai_cost_settle_text` 五参现行体（`:303-:315` header 冻结 join·`:320-:321` 上限守卫·`:323-:325` 公式 `CEIL(input×input价/1e6)+CEIL(output×output价/1e6)`——cached 与普通 input 同价整算=缺口③·`:335-:341` GREATEST 单调不缩史值）·`:354-:366` scoped wrapper 五参·`:371-:372` ACL（REVOKE PUBLIC+GRANT app_role·全链唯一显式 ACL 面——核心 settle_text 零显式 ACL rg 亲证）** |
| `packages/db/src/model-op/ai-cost-governance.ts` | `54302901`（106 行） | **`:56-:59` `settleAiCost`（embed 路径·出界零触）·`:68-:74` `settleAiTextCost` 五参（SQL `ai_cost_settle_text_scoped($1..$5)`·零 cached 入参=缺口④）** |
| `packages/ai-runtime/src/invoke.ts` | `44e137f6`（1204 行） | **`:69-:75` `cachedInputTokens` 字段（三端点兼容读取注释+「**settle/validUsage/预留/结算不读此字段（价格本无缓存价）**」自证缺口）·`:469-:482` `validUsage`（`:475-:477` input/output 三查·零 cached 校验）·`:738` tracer 观测（AG-COST1/AG-24 已落半·零字节保持）·`:1038`/`:1145` 两 settle 调用点（只传 input/output）** |
| `apps/worker/src/model-cost-governance.ts` | `f777c642`（202 行） | **`:31-:40` `ModelCostPriceBinding`（`:36` priceRevision·`:37-:38` input/output 价·零 cached）·`:46-:47` binding→row 映射·`:114-:117` env 解析（`_PRICE_REVISION`/`_INPUT_MICRO_CNY_PER_MILLION`/`_OUTPUT_MICRO_CNY_PER_MILLION`/`_PRICE_SOURCE_URL`）·`:179-:193` seed INSERT（ON CONFLICT DO NOTHING）+回读断言（不等→`model_cost_price_revision_conflict`）** |
| `apps/worker/test/ag11-settle-relax.proof.ts` | `9284e4a0`（324 行） | **八臂（α-η·0188 补证 b2b7d337 本体）·`:295` η 臂 `to_regprocedure('ai_cost_settle_text_scoped(text,text,text,integer,integer)')` 五参 identity 串钉（`signature_exists` 断言 `:309`）——本刀六参改形必伴生重钉处（AG-COST3 B2「ag19 seam 正则收尾形」先例同款）** |
| `apps/worker/src/rag-cost-governance.ts` | `84ea559a` | `:117-:121` reserve·`:139` `settleAiCost`（embed 路径·**范围外零触**§3-2） |
| `packages/ai-runtime/test/model-usage-cache-observe.proof.ts` | `245d6db8` | **28 臂（AG-COST1 观测半本体·parse 层·零 DB）·fixtures `:42/:44` cached_tokens 故意>prompt_tokens（parse 层三态证明与 settlement 校验分层互不影响——本刀 zero touch 此文件§3-5）** |
| `packages/ai-runtime/test/runtime-kernel.proof.ts` | —（只读引用） | `:254` usage `{input:100,output:200,cached:77}`（cached≤input·新校验不破）·`:260-:261` AG-24 三标量位断言 |
| `scripts/run-e2e-isolated.mjs` | —（行锚·本刀六处 +1 行） | **预迁移单含 0083/0188 成本链的恰六条目（rg 亲证分母）：`uc028:nhp-fault:prove:raw`（`:181-:199`）·`model-cost:prove:raw`（`:230-:244`）·`model-invocation-reconcile:prove:raw`（`:245-:257`）·`model-op00:prove:raw`（`:371-:383`）·`ag11-settle:prove:raw`（`:385-:401`·0188 在 `:400`）·`failover-price-policy:prove:raw`（`:402-:418`）——隔离库按单施迁移，缺 0203 即六参函数缺席硬红** |
| `packages/db/migrations/0144_db_trigfam_unify.sql` | —（只读引用） | `:554-:566` `ai_cost_reserve_text_scoped` 现行体=纯委托（`RETURN QUERY SELECT * FROM ai_cost_reserve_text(...)` `:562-:563`）——reserve_text 体改经此自动贯通·零字节 |
| `scripts/ai-docs/public-text-policy.mjs` | —（只读引用） | `:75` `MAX_FILES = 2_136`（docs:check cap 红停线） |

### 0.2 派单简报漂移登记（结论零变·如实改锚）

1. **简报基线「现≈bb1627d8+」**：实测 origin tip=`109e3eb1`（§0.0 第三条·按「以 origin tip 为基」执行）。
2. **简报「#48/#49（批5-5C?）」批次归属勘误**：#48/#49 系**批2 残挂账**（LEDGER :210/:299 批2 残名在案）·非 5C——语义以 issues-final :550 为准（简报自注「LEDGER 行语义为准」）。
3. **简报「迁移 +1 新列（cached_input_price 或 tokens_cached 列）」细化**：结算必需面=**两表同名列 `cached_input_micro_cny_per_million`**（价格本+预留·捕获式结算架构所必需·见 §1.2-裁决）；`ai_model_invocation` 观测持久列（tokens_cached）非结算必需（cached 实量经 provider usage→validUsage→settle 参数贯通·观测半已 metrics/Langfuse 落）→**不入本刀**（§3-4·裁决 (a) 列数=2 非 1·如实登记）。

### 0.3 迁移号登记（预期恰 1 熔单迁移·占位 0203）

- 主线链顶实测：`ls packages/db/migrations/*.sql | wc -l`=**202**·头 `0202_interview_event_kind_score_card_written.sql`（`node scripts/check-migration-version-uniqueness.mjs` 本树亲跑=`files=202 violations=0 exemptions=0143,0152,0160` EXIT=0）。
- 本刀占位 **`0203_ai_cost_cached_input_price.sql`**（顺延实测规则：EXEC 立项日对届时主线链顶 `ls packages/db/migrations` 亲数+在飞分支题面复核后取最小未占号·零硬编码沿 AG39 改占/cost4「顺延规则优先」先例·Ban 抢号 Ban 私占）。修法=expand-only 熔单（§1-修法件①·0149/0192 先例形）·零新表零 DROP COLUMN 零 ALTER COLUMN TYPE 零 NOT NULL 回填零存量行触碰。

## §1 红事实（缺口三点定位·全部亲证）

### 1.1 观测半已落（非缺口·零字节保持面）

- `invoke.ts:69-:75` cachedInputTokens 三端点字段兼容读取（OpenAI `cached_tokens` ∥ DeepSeek `prompt_cache_hit_tokens` ∥ 百炼 `prompt_tokens_details.cached_tokens`）+`:738` tracer→METRIC 两键+Langfuse `input_cached`——AG-COST1 `6f2ed876` 收官（checklist :2361·只观测零计费）+AG-24 落面。**该字段注释自证缺口**：「settle/validUsage/预留/结算不读此字段（价格本无缓存价）」（`:73`）。
- DB 侧零 cached 列：`rg -n "cached_tokens|cached_input" packages/db/migrations/*.sql` 零命中亲证（观测不经库）。

### 1.2 缺口三点（「价格列/结算面未区分」的机证分解）

- **缺口① 价格面（列缺→配置缺）**：`ai_cost_price_book` 仅 `input_micro_cny_per_million`（0033:12）+`output_micro_cny_per_million`（0036:10-12）——**无 cached_input 价列**，价格配置面（model-cost-governance.ts :31-40/:114-117/:179-193）随之无键可配。issues-final :550「价格本没有缓存价」逐字直证。
- **缺口② 预留捕获面**：`ai_cost_reserve_text`（0083:66-:94）捕获双价入预留行，零 cached 价捕获——结算的不可变单价源（「结算按预留行捕获单价」rag-cost-governance.ts :115-116 注释自证架构）无处取缓存价。
- **缺口③ 结算公式面**：`ai_cost_settle_text`（0188:323-325）`CEIL(input×input价/1e6)+CEIL(output×output价/1e6)`——cached 命中部分按全价整算（#48/#49「cached_tokens 不计量」的结算本体）。
- **缺口④ TS 贯通面**：`settleAiTextCost`（ai-cost-governance.ts :68-74）五参零 cached；`invoke.ts:1038/:1145` 两调用点零 cached 实参；`validUsage`（:469-:482）零 cached 校验（cached>input 的畸形 usage 将直通结算）。
- **裁决 = (a) 迁移 +1 熔单（0203·expand-only）+价格配置扩展+结算区分**。理由：**(b) 纯查询/配置面不成立**——价格本无列（缺口①机证），无列即无价可配，结算区分无从谈起；**(c) 其他不适用**——观测半已落（AG-COST1），缺口精确收敛于「价格列+捕获+公式+贯通」四点，一张 expand-only 熔单+三 TS 文件+两伴生面可闭，无需动观测层与 embed 路径。

## §1-修法（价格列刀·expand-only·行为保持铁律见下）

**行为保持铁律（⛔ 不得更改·全件适用）**：①供应商**未回报** cached 计量（字段缺席）→cached 按 0 结算→与现行公式**逐位恒等**（保守多计方向不变·parse 层「缺席≠零铁律」零触·model-client 零字节）；②价格行 cached 价为 **NULL**（未设缓存价·含全部存量行）→结算 COALESCE 回 input 价=现行为；③存量已 settled 行不可变零触碰；④GREATEST 单调不缩史值与 header 冻结上限双守卫（0188:303-:321/:335-:341）零字节（cached≤input 被 input 上限自然覆盖）。

- **件①（0203 熔单·新增 `packages/db/migrations/0203_ai_cost_cached_input_price.sql`·占位实测规则 §0.3·头 `-- @migration-mode multi-statement` 沿 0192:6 形·两段式 ADD COLUMN（PG16 fast-default 元数据形零全表 rewrite）+ADD CONSTRAINT NOT VALID+VALIDATE 独立语句沿 0192:12-13 先例形）**：
  - 段 1-3 `ai_cost_price_book`：`ADD COLUMN IF NOT EXISTS cached_input_micro_cny_per_million bigint`（nullable·NULL=未设缓存价）→`ADD CONSTRAINT ai_cost_price_book_cached_input_check CHECK (cached_input_micro_cny_per_million IS NULL OR cached_input_micro_cny_per_million >= 0) NOT VALID`→`VALIDATE CONSTRAINT`。
  - 段 4-6 `ai_cost_reservation` 同形（列同名·约束 `ai_cost_reservation_cached_input_check`）。
  - 段 7 `CREATE OR REPLACE FUNCTION ai_cost_reserve_text`（9 参签名+RETURNS TABLE 零变=REPLACE 合法零 DROP）：体逐字承载 0083 现行形·仅 INSERT 列集与 VALUES 增 `cached_input_micro_cny_per_million`/`price.cached_input_micro_cny_per_million` 恰两处（`SELECT * INTO price` :66 %ROWTYPE 自扩展零改）。
  - 段 8-9 `DROP FUNCTION ai_cost_settle_text(text,text,text,integer,integer);` + `CREATE FUNCTION ai_cost_settle_text(p_scope_id text,p_request_owner text,p_idempotency_key text,p_actual_input_tokens integer,p_actual_output_tokens integer,p_actual_cached_input_tokens integer) RETURNS bigint`——**六参无 DEFAULT（fail-closed·漏改调用点即 SQL 报错显形·禁 overload 双存沿 0188「恰一 DROP+CREATE」先例）**·体=0188 :282-:344 逐字承载+恰三处扩：①入参守卫段加 `p_actual_cached_input_tokens IS NULL OR < 0 OR > p_actual_input_tokens → RAISE 'ai_cost_cached_exceeds_input'（check_violation）`；②公式改 `CEIL((input−cached)×input价/1e6)+CEIL(cached×COALESCE(r.cached_input_micro_cny_per_million, r.input_micro_cny_per_million)/1e6)+CEIL(output×output价/1e6)`（cached=0 时逐位恒等现行值）；③settle UPDATE 零加列（`input_tokens_actual` 存 input 全量语义维持·cached 实量持久化=§3-4）。header join/上限守卫/GREATEST 段零字节。核心函数零显式 ACL（§0.1 0188 行锚亲证）→新身份默认 ACL=现行为恒等·零补发。
  - 段 10-13 `DROP FUNCTION ai_cost_settle_text_scoped(text,text,text,integer,integer);` + `CREATE FUNCTION ai_cost_settle_text_scoped(六参) RETURNS TABLE(micro_cny bigint, overage boolean)`（0188 :354-:368 体逐字·传参 +1·回读形零变·⛔ 禁 OUT overload）+ ACL 恰两行随发（`REVOKE ALL ... FROM PUBLIC; GRANT EXECUTE ... TO app_role;`·0188 :371-:372 同形换六参签名）。
- **件②（TS 贯通三件）**：
  - ②-a `packages/db/src/model-op/ai-cost-governance.ts`：`settleAiTextCost`（:68-:74）签名增第 6 参 `actualCachedInputTokens: number`（必传·注释引 #48/#49）→SQL 改六参 `$6`。
  - ②-b `packages/ai-runtime/src/invoke.ts`：①`validUsage`（:475-:477 后）增 cached 校验臂：`cachedInputTokens !== undefined` 时三查（Number.isInteger/≥0/≤inputTokens）不达→`return undefined`（归并既有 `provider_usage_invalid` 收口臂·零新语义）；②`:1038`/`:1145` 两调用点增实参 `settledUsage!.cachedInputTokens ?? 0`（缺席→0=行为保持铁律①）；③`:69-:75` 字段注释随翻（「settle/validUsage…不读此字段」句改「结算读·缺席按 0=现行保守语义·parse 层三态铁律不动」·其余逐字）。
  - ②-c `apps/worker/src/model-cost-governance.ts`：`ModelCostPriceBinding`（:31-:40）增 `cachedInputMicroCnyPerMillion: number | null`；env 解析（:116 后）增可选 `${prefix}_CACHED_INPUT_MICRO_CNY_PER_MILLION`（缺席→null=列不写·现行为恒等；在场→正整数·非法启动失败沿 positive() 先例）；seed INSERT（:179-:183）列集+值带 null 透传；回读断言（:184-:193）增 cached 臂（stored NULL↔expected null·非 null 数值相等·不等→`model_cost_price_revision_conflict` 原码）。`ModelCostPolicy`/policies 面**零字节**（cache 价只入 priceRows 捕获链·reserve 语义不变）。
- **件③（伴生断言+注册·恰两文件）**：
  - `apps/worker/test/ag11-settle-relax.proof.ts`：①η 臂 `:295` identity 串五参→六参**恰 1 行重钉**（`'ai_cost_settle_text_scoped(text,text,text,integer,integer,integer)'`·AG-COST3 B2「ag19 seam `$16,$17`→`$17,$18,$19`」迁移加列伴生断言先例同款）；②新增 ≥4 臂 **additive 顺延命名（ι/κ/λ/μ）**：ι cached=0 逐位恒等臂（同 input/output 下新公式值==旧公式值对表）·κ 有缓存价分账臂（seed 含 cached 价 revision→settle 断言精确 micro_cny+预留行捕获 cached 价）·λ NULL 缓存价回退臂（cached 价 NULL→cached 部分按 input 价计）·μ cached>input 拒绝臂（`ai_cost_cached_exceeds_input` errcode/message 断言）。既有 α-η 七臂零字节（η 恰 :295 一行除外）。臂总数=8+实新增·以实跑实测为准（预期 12）。
  - `scripts/run-e2e-isolated.mjs`：§0.1 六条目预迁移单尾各 +`packages/db/migrations/0203_ai_cost_cached_input_price.sql` **恰 1 行**（白名单只增不清·沿 AG-B/AG-C/AG-E 预迁移巨行并集先例形）。EXEC 立项日 `rg -n "0083_ai_text_cost_price_revision_binding|0188_ag11" scripts/run-e2e-isolated.mjs` 复测分母——若届时-tip 出现第七条含 0083/0188 的条目→同规则尾追加并如实登记（预授权条款）。
- **件④（收据）**：`ai-docs/delivery/receipts/cost-columns/00-exec.md`——七字段（门矩阵全表+EXIT 原值+改前基线 run 名单+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）。
- **diff 面预期**：恰 7 tracked 路径=0203 新迁移+件② 三 .ts+件③ 两文件+本卷 .md（+收据目录 untracked）——多任何 tracked 路径即停（越界需要类）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵·数字口径以实跑实测为准）

1. **migrate:prove**：`pnpm migrate:prove` EXIT=0·链头实测=**203 头 0203**（届时链顶顺延如实记）。
2. **drift:prove 零漂移**：`pnpm drift:prove` EXIT=0。
3. **migration uniqueness**：`node scripts/check-migration-version-uniqueness.mjs`→`files=203 violations=0 exemptions=0143,0152,0160`（files 对届时链顶亲数·violations 恒 0）。
4. **结算面 proof（ag11-settle:prove）**：`pnpm ag11-settle:prove` EXIT=0——既有八臂（η 重钉六参后）+件③ 新增臂全绿·臂总数实测记录（预期 12·**熔断=新增臂缺位或既有七臂红即停**）。
5. **邻面不回退（六门全 EXIT=0）**：`model-op00:prove`+`model-op02:prove`+`model-op02-endpoint-partition:prove`（cost5 三门）+`model-cost:isolated:prove`+`failover:prove`+`bill3-settlement:prove`。
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
7. **零 CI/wrapper/runner 改**（run-e2e-isolated.mjs 仅限 §1-修法件③ 六处预迁移单 +1 行·零逻辑改）·零依赖升级。

## §4 依赖

**①上游已满足**：AG-COST1 观测半（`6f2ed876` 在链）+AG-COST4 #48/#49 收口硬前置（`44f0f6b6` 在链）+0083/0188 结算机器本体+0036 nullable 价列先例。**②无同文件并发**：§0.0 在飞交叠复核亲证+立项日复扫规则。**③迁移号**：§0.3 占位 0203 顺延实测规则。**④下游**：#48/#49 收口判定归协调方（本刀=计量面施工·非收口判定席·checklist :2633「收口判定待 ⑤AG-08+⑥回灌/显式缓存与观测数据窗」维持）；cached 实量 DB 持久化+⑥回灌归观测窗后继刀。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（红不重跑冲销·改前基线 run 恰一次）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 迁移扩面（0203 之外零 DDL·零新表·零 DROP COLUMN/TYPE·零 NOT NULL 回填·零存量行 UPDATE——需则停上报走认领规则）；Ban 触 embed 路径与观测层（§3-1/§3-2）；Ban `ai_model_invocation` 加列（§3-4）；Ban 为绿改断言（ag11 既有七臂零字节·η 恰 1 行重钉除外）；Ban 就地调 lint 预算/docs cap（§2-8/9 sanction 上报）；Ban 改共享 SSOT（§3-6）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 范围外新缺口就地顺手修（如实登记升级）；Ban 造 `.env*`/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（门矩阵 proof 全离线脚本+隔离库·无云端目标）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词面不复抄卷内防自匹配——沿 negbend-fix/g7w 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.2 缺口结论与 §5 Ban/pins 与 §1-修法四件交付面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞复扫必做·§0.2 简报漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且 §1.2 结论受疑（如 settle 公式/捕获链被他刀先改·ag11 八臂臂数变动·预迁移单含 0083/0188 条目数≠6·§0.0 在飞复扫出新非残枝命中）→停·重 pin 回炉。
- **机制不满足**：件③ proof 新增臂未全绿或实测行为与 §1-修法推定形不符（如 cached=0 臂非逐位恒等·NULL 回退臂取值≠input 价）→修法语义被证伪→停·如实升级协调方回炉（Ban 就地改语义 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法四件面（需触观测层/embed 路径/既存迁移重制/`ai_model_invocation` 加列/0203 外新 DDL）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻六门新红/观测两门臂数漂/lint 预算需上调/docs:check>2136）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*COST-COLUMNS REQUEST · 2026-10-14 起草 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`109e3eb1`（=origin tip 亲证）· 分支 `line/cost-columns` · 工作树 `meetwise-ccl`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=协调方派单 brief+issues-final :550（#48/#49「价格本没有缓存价」语义权威）+checklist :2361/:2633（AG-COST1 观测半已落+AG-COST4 硬前置已施工·收口判定待）· 缺口三点机证=价格本零 cached 价列（0033:12）+预留零 cached 捕获（0083:94）+结算公式 cached 全价整算（0188:323-325）+TS 贯通零 cached（ai-cost-governance.ts:68-74/invoke.ts:1038/:1145/validUsage:469-482）· 裁决=(a) 迁移 +1 熔单 0203 占位（expand-only·两表同名列 `cached_input_micro_cny_per_million`·0149/0192 熔单两段式先例形·settle_text 六参恰一 DROP+CREATE 沿 0188 先例·六参无 DEFAULT fail-closed 禁 overload）+价格配置扩展（env 可选 `_CACHED_INPUT_MICRO_CNY_PER_MILLION` 缺席=null 行为恒等）+结算区分（validUsage cached 三查+两调用点贯通·缺席→0 逐位恒等铁律）+伴生面（ag11 η 恰 1 行重钉+新增 ≥4 臂 additive·预迁移单六条目各 +1 行）· 行为保持铁律四条（缺席→0/NULL 回退/存量不可变/GREATEST+header 守卫零字节）· 门矩阵十二门（migrate 链 203 头 0203+drift+uniqueness files=203+ag11-settle 结算面+邻六门不回退+观测两门 26/28 臂恒等+typecheck 8/8+lint 五值恰等+docs:check≤2136 红停+markers+diff 面机检恰 7 tracked+卫生）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*
