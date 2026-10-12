# AG-B-CLASSIFY REQUEST（AG 修复轨·失败语义刀 B · AG-06 确定性失败结算分类 + AG-14 解析层折叠（同文件同刀）· 沿既有 settled-failed 先例路由接线 · 零新结算语义）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席写完即停零码动·本刀恰 1 .md·⛔push·待预执行双审两外席·**Ban self-approve** · **alone≠dual** · **Dual PASS ≠ 开工**）。

**席位**：AG 修复轨刀 B 起草席（EXPERT-REVIEWS §七 失败语义轨刀 B 承接·**先于一切重试刀**·协调方常设 loop）。
**基线**：`feat/mysql-schema-skeleton` @ `ce021b22`（主线 tip·`git log -1` 实测·ttl-wire merge commit·零码面）。分支 `line/ag-b-classify`·工作树 `meetwise-agb`（`git worktree add ../meetwise-agb -b line/ag-b-classify ce021b22` 本起草席已立·建前 worktree list + branch 双查实测不存在·HEAD 落 `ce021b22` 亲证）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：三层蓝本全部精读引用——①`ai-docs/delivery/ai-capability-review/issues-final.md`（blob `dac7f58c`·43 条版）AG-06 条目 `:114-123`（P1·file:line+触发例+修法）+ AG-14 条目 `:202-211`（P2·三口径 file:line+修法「缺字段时统一视为 usage_missing，按上限结算并打标」）+ AG-01 条目 `:59-68`（链下游·范围外）+ AG-12 条目 `:180-189`（校准因子面·§1.3 消费者）；②同目录 `EXPERT-REVIEWS.md`（blob `5d446552`·与刀 A 引用同 blob 未漂移）§四 `:27-37`「统一结算状态机」=**修法权威**（四态图 `:29-34` + 三条修法要旨 `:35-37`：known_executed 缺失/usage 带出 catch/管道改造点=dispatchOnce 返回与 parse 之间/finish_reason==='length' 补读/usage 缺失归并既有 provider_usage_invalid 不新造语义/**invoke 成功相位已有完全同形先例**（schema_validation_failed 路径 settle 真实 token+breaker success）——修法本质是路由接线非新机制/AG-14 折叠进解析层 usage_missing 按上限打标绝不按 0·打标行被校准配对剔除（口径 1 现状会污染 AG-12 因子=max/estimate 假样本·即 AG-14 为 AG-12 的上游数据质量））+ §七 `:61` 刀 B 计划（「model-client 分类+接线既有 settled-failed 臂·usage 带出 catch·finish_reason——先于一切重试刀（否则重试风暴搅浑验证窗口）」）+ `:60` 刀 A（前置·已另卷落 `ag-a-resume-REQUEST.md`·零文件交点）+ §六 EG-B1 `:51`（unknown ageing=后继·范围外）；③同目录 `review-log.md`（blob `ea66a06e`）AC-F14 `:80`（P1 成立·AG-06 源编号行·model-client.ts:446-448,471-473,523）+ AC-F15 `:81`（P2 成立·AG-14 源编号行·invoke.ts:339-347；model-client.ts:452；rag-cost-governance.ts:127）。

## §0 现状锚（起草席亲读·base `ce021b22`·file:line 逐条 rg/sed/Read/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（已终局·强制项）

- `git worktree list`：11 树实测（主仓+5e/**aga**/authz/blite/e2sc/i263/i6/entpay/parity2/ttlwire）——**无 agb 树**（aga=刀 A 树·互不交叠）。
- `git branch --list "line/ag-b-classify"` 空输出——**无同名分支**。
- `rg -l "ag-b-classify|AG-06" ai-docs/delivery/harness/` EXIT=1 **零命中**（主仓与 agb 树同查）；`ai-capability-review/` 四件+INDEX 系蓝本登记卷非刀卷。→ **停止条件未触发·可建树落卷**。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`ce021b22`）

| 文件 | blob（8 hex·全 40 hex 前缀） | 关键行锚 |
|---|---|---|
| `packages/ai-runtime/src/model-client.ts` | `27eb7516`（`27eb7516591b83ba58c3f5856f5f2c5a49cea484`·987 行） | **非流式 complete 主链**：prepare 估算挂 plan :571-577 → complete 守卫群 :580-593（policy 缺/未配置/非 https/预算非法→known_not_executed）→ **dispatchOnce :620-639**（fetchJsonWithTimeout·choices 类型 **:622 只有 `message.content`——无 finish_reason=补读面**·usage 类型 :623）→ g7 预留 :641-655 → try 主链 :657-690：**content 提取 :662 + 空 content 守卫 :663-666**（return transient **unknown** :665——usage 在手亦丢弃）·**usage 构建 :667-670**（`j.usage ? {inputTokens: j.usage.prompt_tokens ?? 0, outputTokens: j.usage.completion_tokens ?? 0} : undefined`——**AG-14 口径 2「字段缺失按 0」的 `?? 0` 在 :669**）·**JSON.parse 在 try 内 :688（g7 臂·带 actualModel）/:690（主臂）**——SyntaxError 直落 catch → **catch :691-741**：429 backoff :692-702·g7 fallback :703-728·ExternalHttpStatusError :733-735（5xx/429/408/425→transient unknown·其余→deterministic known_not_executed）·g7 前缀重抛 :737-739·**非 HTTP 兜底 :740 → transient unknown（JSON.parse 抛错与传输错误同落点·已到手 usage 被丢弃=AG-06 红点）**。**流式面 completeStream :753+**（§D-1 flag 门 :314 `isModelTextStreamPreviewEnabled` 缺省 OFF·恒走非流式——流式 parse :942-943 `catch { raw = acc }` 本就不抛错·形状已异·零改申报）·**测试 override 缝 :536-548**（`NODE_ENV=test`+`MODEL_TEST_TRANSPORT_OVERRIDES=1` 放行本地 http loopback·:586——新 proof 注入缝） |
| `packages/ai-runtime/src/invoke.ts` | `68e3c1f4`（`68e3c1f41bd33ce2890239a278efb521dce94e4e`·933 行） | **ModelResult 类型 :60-63**（`externalOutcome?: 'known_not_executed' \| 'unknown'`——**缺 known_executed 的类型面**·:60 注释「Omission means unknown」）；**validUsage :335-344**（**:336 `usage ?? {inputTokens: maxInput, outputTokens: maxOutput}`=AG-14 口径 1「整体缺失按上限多记」无声回退**·:339 越界→undefined→provider_usage_invalid 臂）；**五相位**：:549 相位 1 resolve+prepare / :601 相位 2 claim（:617 failed/unknown 重放→deterministic_refusal）/:626 相位 3 admit（**:640 共享准入拒绝→failModelInvocationClaim**·AG-01 链终点面·范围外）/:721 相位 4 reserve+dispatch / **:787 相位 5 execute+settle（本刀唯一改造相位）**：**:796 catch → transient unknown 兜底**·known_not_executed 臂 :800-817（breaker no_signal）·**unknown 臂 :818-832**（markAiCostUnknown 预留冻结 :820+markModelInvocationUnknown :822+**breaker failure :826**+error external_outcome_unknown :832）·**provider_usage_invalid 臂 :838-855**（HTTP 200+usage 非法→**breaker success :848**+钱 unknown :850——既有语义归并点）·**既有同形先例（settled-failed）:866-905+:927-929**：doubleValidate :866-871（errorCode `schema_validation_failed`/`business_validation_failed`）→ **settleAiTextCost 真实 token :882 + completeModelInvocation(error 码) :889-892 + breaker success feeStatus settled :901-905** → :927-929 返回 error 不抛——**修法权威指认的「完全同形先例」**·settle 失败臂 :910-926（settlement_or_record_failed→unknown·breaker success） |
| `packages/db/migrations/0119_usage_reconciliation_wiring.sql` | `1922910a`（`1922910a79daf5c8c4059b4faa4d37293acba969`） | 头注 P1/P2/P3 :1-20（estimate 全 outcome 落库）·**P3 配对读函数 `ai_usage_calibration_pairs_scoped` :438-475**（SECURITY DEFINER·注释 :435-436「只产出 estimate 与 provider usage 均可用的配对（成功+校验失败；unknown 无 usage 不配对）」·**配对 SELECT :467-475**：`WHERE estimate_input_tokens IS NOT NULL AND input_tokens IS NOT NULL`——**打标行剔除谓词的落点=新迁移镜像面**·REVOKE/GRANT :474-475） |
| `packages/db/src/model-op/usage-calibration.ts` | `fec7d3a9`（`fec7d3a91cec6b11662f0404ce961674052b68c1`） | UsageCalibrationPair 接口 :23-32（注释「成功+校验失败的可计费调用；unknown 无 usage 不产出」）·**listUsageCalibrationPairs :40-55**（读 `ai_usage_calibration_pairs_scoped($1)` 的 TS 消费面） |
| `packages/ai-runtime/src/usage-calibration-reconciler.ts` | `8b7b257b`（`8b7b257bc84988b30125f1bd3c1d1613514635a4`） | **reconcileUsageCalibration :103 起**（配对消费 :110-113 `listUsageCalibrationPairs`→分组→观测落库——AC-F20 蓝本「:103-140」现行号吻合·打标行剔除后的下游受益面） |
| `packages/ai-runtime/src/usage-calibration-reconciler` 消费侧 | — | AG-12 校准因子（issues-final `:180-189`）+ EXPERT §四 `:37`「口径 1 现状会污染 AG-12 因子=max/estimate 假样本」——§1.3 红事实引用 |
| `apps/worker/src/rag-cost-governance.ts` | `85f477e2`（`85f477e23ea49ed0312e53439bdf62c14858f625`） | :44 `RAG_EMBED_MAX_INPUT_TOKENS` 默认 `16_000`（**AG-14 口径 3**）·:127 `const actualTokens = result.inputTokens ?? cfg.maxInputTokens;`（无 usage 按上限面·蓝本 :127 现位不变·**范围外=EG-B4 领地**） |
| `packages/db/migrations/0120_model_op02_shared_provider_admission_ledger_breaker.sql` | `645a9a73`（`645a9a7347f97507d3e0b3068318ef647febd4f9`） | **:52-58 文本 6 op 阈值表**（并发 4/breaker_threshold **5**/冷却 30000ms——§1.1 链第 6 步「连续 5 次触发 AG-01」机证） |
| `packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql` | `cbc07c09`（`cbc07c09e1aab13be1b8ae7ad8b4a9b5d015496d`） | 状态机迁移（error_code ASCII `^[A-Za-z0-9._:-]{1,120}$` 强约束——新失败码命名约束面·蓝本只读） |
| `apps/worker/test/context-stress.proof.ts` | `d69d287f`（`d69d287fe899570371a1addf45c12f1efb864bbd`） | **脚本 provider proof 形制权威**：:35 `http.createServer` 本地脚本端点 + :146 `MODEL_TEST_TRANSPORT_OVERRIDES='1'` + :148 `openAICompatibleClient({ baseUrl: 'http://127.0.0.1:…' })`——坏 JSON/截断/usage 缺失三臂注入的既有缝 |
| `apps/worker/test/model-op00-db-state.proof.ts` | `073627b6`（`073627b6da71fa7d5123152e6b1bc4b85ca5b4b5`） | model-op 系 proof 形制：头注「Real low-privilege PostgreSQL proof…No provider is contacted」+ `A()` 断言形 + claim/replay 真隔离 PG 驱动（`prove:model-op00-db-state`） |
| `apps/worker/test/model-invocation-reconcile.proof.ts` | `e8f2ccec`（`e8f2ccec6c979f2cbec0ce82d17a269099d415c0`） | 派发后 unknown 冻结面 proof 形制（头注「proves that recovery freezes both the invocation and the billable reservation」——AG-06 unknown 臂既有回归门） |
| `apps/worker/package.json` | `107d3d2d`（`107d3d2dbeec0840450bde9c91046f3a9f3d3b16`） | :15 `prove:stress`（context-stress 注册形）·:25 `prove:model-invocation-reconcile`·:26 `prove:model-op00-db-state`——§2-② 回归门名 |
| 蓝本三件+登记（只读引用） | issues-final `dac7f58c` / EXPERT-REVIEWS `5d446552` / review-log `ea66a06e` / LANDING-INDEX `14783e14` | 见卷首立项出处行锚 |

### 0.2 漂移登记（蓝本锚=意见书对照 tip `f547444e`/刀 A 落卷基线 `d46cdd21` → 现 tip `ce021b22`·结论零变·EXEC 重 pin 时同协议处理）

1. **issues-final blob 漂移**：`3fe698fe`（刀 A 引）→ `dac7f58c`（landing-sync 两批 AG-39~43 增补·43 条版）——AG-06/AG-14 条目现位 `:114-123`/`:202-211`·条目文字与修法语义零变；LANDING-INDEX `d0fc9d59`→`14783e14` 同因（刀卷登记面·本卷不自建行）。
2. **model-client 红锚**：AC-F14/issues-final `:119` 载 `:446-448`（无 content→unknown）→ 现 **:662-666**；`:471/:473`（JSON.parse 在 try 内）→ 现 **:688/:690**；`:523`（非 HTTP 异常→transient unknown）→ 现 **:740**。EXPERT §四 `:35` 自行标注「（:471-473→现 :688-690）」与现 tip 逐位吻合——专家意见与现码零冲突。
3. **invoke 红锚**：issues-final `:119` 载 `:795,817-831`（unknown+breaker failure）→ 现 **:796/:818-832**（markAiCostUnknown :820·breaker failure :826）。AG-01 链锚 `:634-646`（共享准入拒绝→failModelInvocationClaim）→ 现 **:632-660 区·failModelInvocationClaim 现位 :640**（:632 注释自证 unknown/blocked/breaker_open/concurrency_exhausted 确定性拒绝）。
4. **AG-14 锚**（AC-F15/issues-final `:207`）：`invoke.ts:339-347`（validUsage 回退为上限）→ 现 **:335-344**（回退 :336）；`model-client.ts:452`（?? 0）→ 现 **:669**；`rag-cost-governance.ts:127` → 现 **:127 不变**（:44 默认 16_000 伴锚）。
5. **AC-F20 伴锚**：「usage-calibration-reconciler.ts:103-140」→ 现实径 `packages/ai-runtime/src/usage-calibration-reconciler.ts`·`reconcileUsageCalibration` 现 :103 起（吻合）。
6. **配对函数锚**：0119 `ai_usage_calibration_pairs_scoped` 现 **:438-475**（配对 SELECT :467-475）——蓝本未载行号·本卷首钉。

## §1 红事实（机制链现 tip 重 pin·全 @`ce021b22` 实测·源=AC-F14/AI-01（部分）→AG-06+AC-F15→AG-14）

### 1.1 AG-06 机制链：HTTP 200+坏 JSON/截断/空 content → transient unknown → 预留冻结+breaker failure → 连续 5 次触发 AG-01 全站熔断

逐行链（现 tip 行号）：

1. **截断发生**：报告长输出被 max_tokens 截断 → `choices[0].message.content` 为半个 JSON 文本（issues-final `:120` 触发例）——非流式主链是生产实走面（completeStream §D-1 :314 缺省 OFF 恒走非流式）。
2. **JSON.parse 在 try 内**：model-client **:688/:690** `return { ok: true, raw: JSON.parse(content), usage }`——SyntaxError 直落 catch；空 content 面更早：**:663-666 守卫先返回 unknown**（usage 未及构建）。
3. **catch 兜底归一**：**:740** 非 HTTP 异常 → `{ ok: false, kind: 'transient', externalOutcome: 'unknown' }`——**解析错误与传输错误同落点**；`:667-670` 已构建的 usage 在异常穿越后**被整体丢弃**（HTTP 200+已到手 usage 的事实失证——EXPERT §四 `:35`「必须把已到手 usage 带出」指认的管道缺口·改造点=dispatchOnce 返回与 parse 之间）。
4. **invoke 相位 5 接 unknown 臂**：`:818-832`——`markAiCostUnknown` **:820**（预留冻结不释放·#10 幽灵预留）+ `markModelInvocationUnknown` :822 + **breaker failure :826** + 返回 `external_outcome_unknown` :832。
5. **钱面终局**：unknown 预留**零清算出口**（EG-B1 `:51`）——月度预算被幽灵预留逐步占满 → 误报 budget_exhausted（issues-final `:121`）。
6. **熔断计数**：0120 `:52-58` 文本 6 op 阈值=**5 次失败开闸 30s**——格式问题连续 5 次即触发。
7. **AG-01 雪崩链**：熔断打开期间一切出题/报告调用在相位 3 被准入拒绝 → **:640** `failModelInvocationClaim`（固定幂等键 failed 终态）→ 0130 :179-180 failed 重放失败 → 在面用户整场 generation_unavailable——**格式问题被放大成全站熔断+批量误杀**（settled_failed 不计熔断=本刀切断该链）。

**既有同形先例（专家指认·修法本质=路由接线非新机制）**：invoke 成功相位 **:866-905+:927-929**——provider 200+usage 有效+输出不过 schema 时：`settleAiTextCost` 真实 token :882 + `completeModelInvocation(error 码)` :889-892 + breaker success feeStatus settled :901-905 + 返回 error :927-929。**「已执行、确定性失败、按实际结算」的臂已存在且在产**——AG-06 缺的只是把坏 JSON/截断/空 content 三态从 unknown 臂接进来。

### 1.2 AG-14 三口径分裂（同文件同刀折叠面）

- **口径 1**：invoke `validUsage` **:336** `usage ?? {inputTokens: maxInput, outputTokens: maxOutput}`——usage 整体缺失**无声**按上限多记；
- **口径 2**：model-client **:669** `prompt_tokens ?? 0`——usage 存在但缺字段按 **0** 少记（校准样本被污染·issues-final `:208` 触发例）；
- **口径 3**：rag-cost-governance **:44/:127**——embedding 无 usage 按 16000 结算（**范围外**·EG-B4 领地）；
- **下游污染**：0119 配对函数 **:467-475** 对口径 1/2 行**不加区分全量配对** → AG-12 校准因子吃进 max/estimate 假样本（EXPERT §四 `:37`）——AG-14 即 AG-12 的上游数据质量。

### 1-修法（严格按 EXPERT-REVIEWS §四 `:29-37` 四态状态机·refused/sent→settled|settled_failed|unknown·改造面=model-client.ts 非流式主链+invoke.ts 相位 5 路由+（裁决后）0119 镜像迁移）

- **① model-client outcome 增 known_executed**：`ModelResult`（invoke.ts :60-63）失败臂扩展 `externalOutcome: 'known_executed'`·**携带已到手 usage+finish_reason**——四态里「已派发已执行」的显式分类面（现类型只有 known_not_executed|unknown 两极·:60 注释「Omission means unknown」的反面缺口）。
- **② 解析失败三态改分类**：JSON.parse 抛错/截断/空 content 在 **HTTP 200+usage 存在**时 → `known_executed`+确定性失败码（码名沿 0088 ASCII 约束·具体命名=裁决项）——**管道改造点=dispatchOnce 返回与 parse 之间**（EXPERT §四 `:35` 原话）：把 parse 从「落 :740 兜底」的 try 语义中分离（或 catch 内区分 SyntaxError 与传输错误）·usage 必须带出。
- **③ finish_reason==='length' 补读**：dispatchOnce 类型 :622 choices 增 finish_reason 字段·:662 content 检查处补读——截断从「半个 JSON 撞 parse 抛错」的间接面变显式判据。
- **④ usage 缺失/字段缺失 → usage_missing 按上限打标（AG-14 折叠·绝不按 0）**：:669 `?? 0` 改缺失字段→usage_missing 标记+按上限（policy max）结算；usage 整体缺失归并**既有 provider_usage_invalid** 臂（:838-855）**不新造语义**（EXPERT §四 `:35`）——两句分工=分类面归既有臂·钱面统一 usage_missing 按上限打标（§四 `:37`）·**绝不按 0**。
- **⑤ invoke 侧路由**：`known_executed` → settle 真实 usage+`completeModelInvocation(error)`+breaker success（**沿既有 settled-failed 先例 :879-905 接线**）——unknown 臂只留「仅网络层不确定」（状态机 :33·断连/5xx/超时面 :733-740/:796 零回归）。
- **⑥ 打标行被校准配对剔除**：0119 配对函数 :467-475 WHERE 增打标剔除谓词——**新迁移面**：沿「历史迁移零字节改+新迁移镜像」铁律（新迁移 `CREATE OR REPLACE FUNCTION` 逐字镜像 0119 仅增谓词·AG-11 三件套同形·迁移形状=裁决项③）。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）

1. **新 proof（沿 model-op 系 proof 形制）**：载体=本地 http 脚本 provider（context-stress :35/:146/:148 既有缝）+真实隔离 PG 投影（model-op00-db-state 低权 principal 形）·**三臂×分类断言**：①HTTP 200+usage+坏 JSON → known_executed·settle 真实 token（钱 settled 非 unknown）·invocation 落确定性失败码·breaker **success**；②finish_reason='length' 截断 → 同上+截断码；③usage 缺字段 → usage_missing 按上限打标·**绝不 0**·配对剔除；④网络层回归臂：断连/5xx → 仍 unknown+breaker failure（状态机 :33 只剩网络层的反向断言）。
2. **既有 prove 回归原值**：`prove:model-invocation-reconcile`（package.json :25·blob e8f2ccec）+ `prove:model-op00-db-state`（:26·073627b6）+ `prove:stress`（:15·d69d287f）EXIT=0 既有臂零翻。
3. **零行为回归**：known_not_executed/unknown 既有臂（invoke :800-817/:818-832·model-client :580-593/:733-740）分类语义不变——只有新增 known_executed 分支（git diff 审）。
4. **typecheck**：turbo typecheck（ai-runtime+worker 包）EXIT=0。

## §3 范围外（边界清单·越界即 FAIL）

1. **后继刀零触**：AG-01 准入去终态化（刀 D·骑刀 C 骨架——本刀只切断「格式失败→breaker failure」供给链·:640/:617/0130/0120 零改）；AG-04+#4+EG-A2（刀 C）；AG-03+EG-A1 报告键（刀 E）；AG-02 残面 re-roll（刀 F·骑本刀）；报告重试（刀 E）。
2. **EG-B1 unknown ageing 对账器=后继**（EXPERT §六 :51「与状态机同批」指成本轨批次——本刀先立状态机分类·ageing 刀补 unknown 出口·不在本刀）。
3. **invoke 五相位其余触面申报**：相位 1-4（:549/:601/:626/:721）零改——本刀只动相位 5 结算路由；**completeStream 流式面 :753+ 零改**（§D-1 :314 flag 缺省 OFF 恒走非流式·parse :942-943 本就不抛错——形状已异·申报不修）。
4. **rag embedding 面**（AG-14 口径 3 :44/:127·EG-B4 双轨）：蓝本折叠范围=解析层（model-client/invoke 同文件同刀）·embedding 读供应商 usage 归 EG-B4/后继。
5. **AG-12 估算器/回灌**（成本轨③）=打标质量的下游消费者·本刀只保数据质量不动作其面；AG-07 观测面零触。
6. 共享 SSOT（LEDGER/checklist/issues-master/ai-capability-review 四件+INDEX）只读引用零改；API/前端/e2e 产品面零触。
7. est live=0（§6）。

## §4 依赖

**零未决硬依赖·可与刀 A 并线先行**：①刀 A（`line/ag-a-resume` @`5e8fbeb8` 已落卷）触 `adaptive-lifecycle.ts`·本刀触 `model-client.ts`/`invoke.ts`/（裁决后）新迁移——**零文件交点**·且刀 A 卷 §5 已 Ban「动 model-client.ts（刀 B 领地）」互认边界；②EXPERT §七 :61 定序「刀 B 先于一切重试刀（否则重试风暴搅浑验证窗口）」——刀 C/D/E/F 全部下游骑本刀；③0119 若动 SQL=新迁移镜像（§1-修法⑥铁律）·0120/0088/0130 蓝本只读；④既有回归门三件（§2-②）与脚本 provider 缝（:536-548）现成可复跑。下游：AG-12（成本轨③）吃本刀打标质量·EG-B1 ageing 刀接 unknown 出口。

## §5 Ban 列表 + pins（沿 ag-a/authz-harden/ci-wiring/ttl-wire 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件+INDEX 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 新造结算/outcome 语义（known_executed 只在专家四态内·usage 缺失归并既有 provider_usage_invalid·EXPERT §四 :35）；Ban 按 0 结算 usage（:669 `?? 0` 形绝不保留·EXPERT §四 :37「绝不按 0」）；Ban 熔断语义外改（breaker failure 只留网络层不确定·settled_failed=success 只在状态机内·0120 零改）；Ban 历史迁移字节改（0119/0088/0120/0130 等零字节·新迁移镜像铁律）；Ban 触 AG-01 准入面/报告键/consumer（刀 C/D/E 领地）；Ban unknown ageing 出手（EG-B1 后继）；Ban 流式面 completeStream 改动（:753+ 零改·申报不修）；Ban rag embedding 面出手（EG-B4 领地）；Ban AG-12 估算器/回灌出手（下游消费者）；Ban 新增 env 闸/新配置面/新定时器（proof 缝沿既有 :536-548）；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 proof 全本地 http 脚本 provider 假体+隔离库·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof=本地 http 脚本 provider（context-stress :35/:146/:148 既有缝·NODE_ENV=test+MODEL_TEST_TRANSPORT_OVERRIDES=1）+真实隔离 PG 低权投影（model-op00-db-state 形·需 db:up）；typecheck=本地门——零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag-b-classify-REQUEST.md`）**五类标记词 grep 零命中**（起草席亲跑·命令与回执沿 ttl-wire receipts/05-markers 形留执行席收据）。五类标记词不复抄卷内（避免自匹配·沿 authz-harden/ci-wiring/ttl-wire/ag-a 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（EXPERT-REVIEWS §七 :61 刀 B 计划系登记出处·本卷非授权本身）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.2 漂移登记如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**停止条件**：专家边界与现码冲突即停上报（现 tip 重 pin 已核对零冲突——EXPERT §四 :35 自行标注的「:471-473→现 :688-690」与现 tip 逐位吻合·§0.2 六条漂移全登记性）。

**待双审/EXEC 裁决项**：①proof 注入点（推荐=本地 http 脚本 provider 形·沿 context-stress :35/:146/:148 既有缝·真实 PG 投影 vs scripted client 直调无 PG 形备选）；②打标列形状（推荐=`ai_model_invocation` 新短码列（usage_source 类）沿 0119 P1 estimate 列先例 vs 复用既有列不加列——牵动新迁移有无与⑥谓词形状）；③配对过滤迁移形状（推荐=新迁移 `CREATE OR REPLACE FUNCTION ai_usage_calibration_pairs_scoped` 逐字镜像 0119 :438-475 仅 WHERE 增打标剔除谓词·沿 AG-11 三件套「历史迁移零字节改+新迁移镜像」铁律）。

---

*AG-B-CLASSIFY REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`ce021b22`（主线 tip·git log -1 实测）· 分支 `line/ag-b-classify` · 工作树 `meetwise-agb`（git worktree add 本起草席立·建前 worktree list 11 树+branch 双查不存在）· 立项出处三层蓝本=issues-final AG-06 :114-123/AG-14 :202-211（+AG-01 :59-68/AG-12 :180-189 链引用）+EXPERT-REVIEWS §四 :27-37（统一结算状态机=修法权威）+§七 :61（刀 B 计划·先于一切重试刀）+§六 :51（EG-B1 后继）+review-log AC-F14 :80/AC-F15 :81 · 防重双对表过（worktree 无 agb 树·branch 零同名·harness rg ag-b-classify|AG-06 零命中）· §0 blob 锚表 15 行 ls-tree 亲算+§0.2 漂移六条如实登记（issues-final blob 3fe698fe→dac7f58c 等·结论零变·专家 :471-473→:688-690 逐位吻合）· 红事实=AG-06 机制链七步现 tip 重 pin（JSON.parse :688/:690 try 内→catch :740 兜底丢 usage→unknown 臂 :818-832 预留冻结 :820+breaker failure :826→0120 :52-58 阈值 5→:640 failModelInvocationClaim→AG-01 全站熔断）+AG-14 三口径分裂（validUsage :336 上限/`?? 0` :669/rag 16000 :44·配对污染 0119 :467-475）+既有同形先例（schema_validation_failed 路径 :866-905+:927-929 settle 真实 token+breaker success——修法本质=路由接线非新机制）· 修法=严格专家四态六条（①known_executed ②三态分类+确定性失败码·管道改造点=dispatchOnce 返回与 parse 之间 ③finish_reason 补读 ④usage_missing 按上限打标绝不 0·缺失归并 provider_usage_invalid ⑤invoke 路由沿 settled-failed 先例 ⑥配对剔除新迁移镜像铁律）· 断言候选四条（三臂×分类新 proof+网络层反向臂/三既有门回归原值/known_not_executed+unknown 零回归/typecheck）· est live=0 · pins 十一值照抄 · markers=0（亲跑）· ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
