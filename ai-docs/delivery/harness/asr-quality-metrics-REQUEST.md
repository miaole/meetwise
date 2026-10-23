# ASR-QUALITY-METRICS REQUEST（#73 批3 ASR 质量指标真实化刀——Asr 接口结构化质量载荷+qwen-audio 诚实申报 unavailable+裁决映射 low 分支就位·'low' 生产者缺位正身·零迁移·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-22 落卷·pre-exec 双审两独立外席待派→Dual PASS→协调方授权 EXEC 落码·est live=0·Ban self-approve·alone≠dual·⛔push·翻面权归协调方）

**席位**：meetwise 批表下一刀起草席（标的 **#73（批3）**：ASR 置信度/时长/语种不返回不落库，评分无法区分转写错误与答错——质量指标真实化）。
**基线**：`origin/main` @ `65a9c40f`（派单令要求届 tip≥`acf046db`·`git fetch origin` 后 `git rev-parse` 亲证 `65a9c40f407eb6a7e5f04bc627254cb20fc1faf6`·其含 `acf046db` 与 2338 帽联动笔 `848d7a84` 双祖先）。分支 `line/asr-quality-draft`·工作树 `meetwise-iss73`。
**立项出处（三层蓝本·不自建 SSOT 行——LEDGER/batch-residual-plan #73 行翻面权归协调方/卷主）**：①**派单令给定标的**=#73（批3）·标题与修法方向如上；②**批表原文不可读如实承登**：批表原文存于 iCloud·本席不可读（定性席已登记）——本卷以**仓内定性链**定性：`ai-docs/delivery/harness/product-campaign-LEDGER.md:59`「余 #38/#73/#185/#49 🆕 各归域刀或 5E」（#73 括注「ASR 质量」）+`ai-docs/delivery/harness/batch-residual-plan.md:62`/:102（H7 挂账行列 #73·散件族注「ASR 来源」）；③**部分收敛前刀**=`730d03b0`「fix(scoring): 纯文本转写不再把语音质量写成合格」（`git show --stat` 亲证：删 `0216_scoring_write_final_voice_quality.sql`+`0217_interview_question_asr_transcript.sql` 两迁移·改 score-writer/interview-question/scoring-evidence-conflict 等）——**止假 ok 已收敛·正身（质量指标真实化）未动**；④形制沿 `ag18-sampling-temperature-REQUEST.md`（同席位同工序先例·STOP 三处·blob 锚表·门矩阵预申明形）。

## §0 现状锚（起草席亲读·base `65a9c40f`·file:line/blob 逐条 grep/sed/Read/`git rev-parse HEAD:<path>` 实测·**EXEC 立项照届时 tip 全量重 pin——漂移如实改锚·结论不变则只更行号**）

### 0.0 防重三查 + 在飞交叠复核

- `git worktree list`：**8 树**实测（主仓 meetwise·本席 meetwise-iss73·meetwise-ag34/cap2338/iss249/nextfix/wssport·临时 land 树×3）——零第二 asr-quality 树。
- `git branch -a | grep -i asr` 恰 1 命中=本席 `line/asr-quality-draft`；`ls ai-docs/delivery/harness/ | grep -i asr` EXIT=1——**零同名刀卷零同名分支**。→ 停止条件未触发·可落卷。
- 在飞交叠：`git log --all --oneline --grep='语音质量|ASR'` 修复笔恰 `730d03b0`（部分收敛前刀·已入 main）零在飞同面刀；`line/voice-final-sentence-draft`（`voice-final-sentence-REQUEST.md` @`executed:awaiting_post_prove_dual`·5 笔越基 tip `084d1692` 未并 main）与本刀在 `packages/contracts/src/index.ts` **一面相交**（彼线自述「多句最终识别」=TTS/流式语音面·`56861f34` contracts 触笔自述「服务端行为不改」——与本刀 ASR 质量申报触点同文件异触点·EXEC 以并线后届值重 pin）。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·全 40 hex @`65a9c40f`）

| 文件 | blob | 关键行锚 |
|---|---|---|
| `packages/ai-runtime/src/voice.ts` | `fc50d524ce4e7d3b1236640b1961e0d770adcd65` | `:17` `export interface Asr { transcribe(...): Promise<string>; }`——**接口只回纯文本·质量载荷无处安放=判词载体一**·`:419` `dashscopeAsr`·`:444` `const content = j.choices?.[0]?.message?.content;`+`:446` `requireNonEmptyText(content, 'asr_malformed')`——**解析面恰 content 一字段·置信/时长/语种零读=判词载体二**（qwen-audio 兼容端点响应面本无更多字段·非漏读） |
| `packages/ai-runtime/src/interview-voice-seams.ts` | `290e332f0be9fc00ca16f9b5d674661265cb71b8` | `:65-73` `failClosedAsr` 唯一校验 `typeof text !== 'string'`→`asr_malformed`（fail-closed 形先例·本刀沿形不猜值）·`:117` `asr = failClosedAsr(dashscopeAsr())` |
| `apps/worker/src/voice-turn.ts` | `11725186413f7b317c1ff64dd663ca529500ab70` | `:15` `const transcript = await deps.asr.transcribe(audioIn);`——语音轮次唯一消费位·转写仍纯文本喂图（modality-agnostic 内核零触的边界锚） |
| `packages/contracts/src/index.ts` | `ed82a759aa5c699ffa1b71268bae9fbcdc659e23` | `:159-160` 注释「**speakerAttribution/wordTimestamps 是能力声明而非模型猜测**」（件⑤扩形约束原文）·`:163-171` `TranscribeResult.capture{mode single_local_microphone, speakerAttribution not_diarized, wordTimestamps not_available}.strict()`·`:689` `LEVEL_REASON_CODES` 含 `'voice_low_quality'`（**非测试码面全仓恰此 1 处=枚举声明本体·零生产者**） |
| `apps/api/src/modules/interview/interview-voice.ts` | `b369538706dc6b91799aa41dfc9c2eee653bb908` | `:59-75` `transcribeAnswer`：返回 `{text, capture{...not_diarized/not_available}}`·catch 臂 `asr_not_configured`→503 `asr_unavailable` 优雅降级（前端回落文字作答） |
| `packages/db/src/interview/interview-question.ts` | `08b00a9ead0aca3f149b41d2a9087e3fa59c3133` | `:153` `TEXT_ONLY_ASR_OUTCOME='word_timestamps_not_available'`·`:178` `rememberIssuedQuestionTranscript`（`:186-190` output 恰 `transcriptSha256`/`trimmedSha256`/`wordTimestamps:'not_available'`——**sha256 摘要管线·原文零落=隐私界**）·`:205` `loadTranscribedAnswerJobPayload`（`:226-231` 答案 sha 与双摘要比对中才标 token·取走后删暂存） |
| `packages/domain/src/scoring-evidence-conflict.ts` | `1f4f5ce990e4ef0e263f71b8bf82ff735116eb68` | `:54` `UNCERTAINTY_VOICE_QUALITY_VALUES=['ok','low','unavailable']`·`:67-70` `voiceQualityFromAsrOutcome` 恒返 `'unavailable'|undefined`（**非空即 unavailable·low 分支缺位=正身载体**）·`:138-139` 注释「unavailable 表示无语音…只有 low 触发 review」·`:151` `u.voiceQuality === 'low'` review 臂 |
| `apps/worker/src/score-writer.ts` | `97e1fd955efab17735198209638e52cb2a775613` | `:29` import `voiceQualityFromAsrOutcome`·`:111` 唯一调用位·`:117` `...(voiceQuality !== undefined ? { voiceQuality } : {})` 条件展开（缺省不写列=文字作答照旧） |
| `packages/db/src/scoring/scoring-aggregation.ts` | `5553b4df6aff62ea52068e6b4bd23382931755f1` | `:38` `voiceQuality?: 'ok'|'low'|'unavailable'`（写卡输入三元并集已齐）·`:70-72` `low||unavailable`→`adjudicateScoreCard`（low/unavailable 双臂就位·本刀**零触**） |
| `packages/db/migrations/0109_scoring_evidence_conflict_uncertainty.sql` | `2fe4eca91e1e73fe8d2c8a0d9757a8cdc27fcfbf` | `:126-127` `uncertainty_voice_quality text NOT NULL DEFAULT 'ok' CHECK IN ('ok','low','unavailable')`·`:451` 裁决块 `u_voice_quality = 'low'`→`review_required`（**low→review 触发器已就位·零迁移依据**） |
| `package.json`（根） | `049fa96c8dab6c397750335935e9a827b710b75b` | `:37-38` `provider-egress:inventory`/`:prove` 两门在册（门⑦依据） |

### 0.2 正身定谳（起草席三读码面·**成立维持·未被近期刀顺带修复**）

1. **'low' 生产者缺位**：非测试码面 `voiceQuality` 生产链唯一=`score-writer.ts:111`←`voiceQualityFromAsrOutcome`（`:67-70` 恒 `'unavailable'|undefined`）→ 列写值域现网恒 {缺省 ok（文字作答）·unavailable}——**`'low'` 零写入者**（grep 亲证零他生产）。
2. **review 触发结构性不可达**：`resolveScoreCardAdjudication:151` low 臂·0109 `:451` 触发器 low 臂·contracts `:689` `'voice_low_quality'` 理由码——三件皆就位而恒假恒不发。评分现网**无法区分「转写质量差（ASR 听错）」与「答错」**：判词逐字成立。
3. **质量载荷可得性**：qwen-audio OpenAI 兼容 chat 端点响应面解析恰 `:444` content 一字段——置信度/时长/语种三元现适配器**不可得**，诚实申报 `unavailable` 是唯一不谎值；真置信信号（换 paraformer/qwen3-asr 等）不在本刀（§3-3 残面）。
4. **730d03b0 三界承登（本刀不回退）**：①纯文本转写→`unavailable` 而非 ok（止假）；②转写原文零落·只 sha256 双摘要；③打字/改写作答→无 asrOutcome→四参数照旧。本刀在其上做加法·三界逐件申明保持。

## §1 修法（五件 additive·**fail-closed 不猜值不回退·零迁移**·触面矩阵见 §1.2）

### 件① Asr 接口结构化（`packages/ai-runtime/src/voice.ts:17`）

`Promise<string>` → 结构化 `AsrTranscription { text: string; quality: AsrQualityDeclaration }`；`AsrQualityDeclaration` = 置信度/时长/语种三字段·每字段**字面量申报形**（`'unavailable'` 起步·为真值留可区分 union 臂）。消费位同步改读：`voice-turn.ts:15`（`.text` 喂图——graph/resume 入口仍纯文本·内核零触）、`interview-voice.ts:59-75`（`.text`+capture 增申报回传）、`interview-voice-seams.ts:65-73`（fail-closed 改校 `text` 串+`quality` 对象形·非法即 `asr_malformed`·**不猜值不补默认**）。`disabledAsr` 抛错语义零触。

### 件② qwen-audio 适配器诚实申报（`voice.ts:419-461`）

`:444-446` 解析保持恰 content 一字段（响应面无更多·不伪造解析）；`quality` 三字段常量申报 `'unavailable'`；**请求体零新增字段零 prompt 改动**（est live 增量为零的依据）·超时/abort/http 错误臂逐字保持。

### 件③ 裁决映射表（`packages/domain/src/scoring-evidence-conflict.ts:67-70`）

`voiceQualityFromAsrOutcome` 改映射表形：asrOutcome token→`'ok'|'low'|'unavailable'|undefined`——既有 `word_timestamps_not_available` token 仍映射 `unavailable`（730d03b0 行为零回退）；**新增 low 臂**（真置信申报 token 到达时取 low·结构就位）；映射不到/非法输入 fail-closed `undefined`（调用方不写列·沿 `:67` 现契约）。

### 件④ 写卡链载荷扩形（`interview-question.ts:178-243`+`score-writer.ts:111-117`）

`rememberIssuedQuestionTranscript` output jsonb 增质量申报字段（sha256 双摘要与「原文零落」**逐字节零回退**）；`loadTranscribedAnswerJobPayload` token 扩形携带申报；`score-writer.ts:111-117` 透传形零改（映射内聚件③）；`scoring-aggregation.ts` 零触（`:38` 三元并集已齐）。

### 件⑤ contracts capture 能力声明扩形（`packages/contracts/src/index.ts:163-171`）

`TranscribeResult.capture` 增 asr 质量申报字段——**严守 `:159-160` 注释约束「能力声明而非模型猜测」**：只收字面量申报·**零模型自报数值字段进 C 端 DTO**；`.strict()` 保持·openapi 形随件⑥ prove:openapi 承证。

### 件⑥ 新 prove 两支+注册 additive（沿 ag18 件③同形）

`packages/ai-runtime/test/asr-quality-declaration.proof.ts`（接口形+适配器 unavailable 申报+fail-closed 非法臂·本地脚本 provider）·`packages/domain/test/asr-quality-mapping.proof.ts`（映射表全臂含 low 分支+undefined 缺省·纯函数）；注册=两 `package.json` prove 键+根 `package.json` 两行+`scripts/run-e2e-isolated.mjs` 四处（清单臂/白名单 `:2297` 位/派发臂/migrate 白名单——沿 ag18 D1 四处实况预申明·缺席即隔离库首跑红）。

### §1.2 触面矩阵

恰 **14 tracked**：voice.ts+seams+voice-turn+interview-voice(api)+interview-question(db)+scoring-evidence-conflict(domain)+score-writer(worker)+contracts/index.ts 共 8 产品面+新 prove 2+两 package.json 2+run-e2e 1+本卷 1。**零迁移零 SQL**；`scoring-aggregation.ts`/`disabledAsr`/TTS 面（dashscopeTts/vstream/stream-preview）零触。

### §1.3 否决（四面）

- **甲=直采供应商自报置信分**：qwen-audio 兼容端点响应面无置信字段（`:444` 亲证）——采信自报分即把不可得写成可得·或逼出对响应面的伪造解析·Ban（残面归 §3-3）。
- **乙=伪造 ok/把 unavailable 升格 ok**：直触 730d03b0 止假界·`0109:126` DEFAULT 'ok' 缺省已系「无语音」语义·再升格即评分谎·Ban。
- **丙=落转写原文以供事后质量核验**：隐私回归——sha256 摘要管线（`interview-question.ts:186-190`）零回退·原文零落承登·Ban。
- **丁=启发式猜 low（转写长度/时长/截断启发）**：无真信号·猜值即谎·且污染 review 队列·Ban。

## §2 门矩阵（EXEC 立项届树亲跑·预申明十二门）

①`pnpm --filter @meetwise/ai-runtime prove:asr-quality-declaration` EXIT=0；②`pnpm --filter @meetwise/domain prove:asr-quality-mapping` EXIT=0；③回归 `prove:interview-voice-seams`+`prove:voice-reliability`（ai-runtime·seams/语音邻面）EXIT=0；④回归 `api prove:voice-timeout` EXIT=0（730d03b0 触面·`apps/api/package.json:64` 亲证）；⑤回归 `worker prove:interview` EXIT=0（asrOutcome/写卡链·`apps/worker/package.json:17` 亲证）；⑥回归 `contracts prove:openapi`+`prove:interview-answer-submission` EXIT=0（TranscribeResult 形面·`packages/contracts/package.json:13-15` 亲证）；⑦**`pnpm provider-egress:inventory` EXIT=0+`pnpm provider-egress:prove` EXIT=0**（件①②触 voice.ts=dashscopeAsr **模型调用适配器面——出站两门必列**·根 `package.json:37-38` 亲证）；⑧`turbo typecheck --force` 全绿 0 cached；⑨`turbo lint --force` 全绿 0 cached·警告**恰等**帽（root 5242/api 1423/domain 115/ai-runtime 628/db 1042/worker 959/web 601/contracts 265——各 `package.json --max-warnings` 八值亲证）；⑩`node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned **2331+本卷 1=2332 ≤ cap 2338**（起草树亲跑 2331 亲证·cap=`public-text-policy.mjs:135` 2_338 亲证）；⑪**迁移唯一性申明：零新迁移**（0109 列+触发器已在·0216/0217 已删**空缺勿补**·现 max `0218_remit_invoice_id_v7.sql` 亲证·无 uniqueness/migrate 新门）；⑫`git diff --stat` 恰 **14 tracked**。

## §3 裁决项（三件·两案并陈处标推荐）

1. **接口结构化返回形**：**推荐=案甲**单口 `transcribe(): Promise<AsrTranscription>`（全调用点编译期收口·fail-closed 单口无双口漂移）；协裁渐进则**案乙**保留 `transcribe(): Promise<string>`+并列 `transcribeDetailed()`（旧口不拆·过渡期双口——双口漂移风险自担）。
2. **quality 字段形**：**推荐=案甲**三字段全字面量申报（`'unavailable'` 起步·union 留真值臂·诚实显式）；案乙可空数值/串（absent 即不可得——缺省语义弱·消费端易误读「有值即真」·不推荐）。
3. **残余面归属**：'low' **真生产者接线**（换 paraformer/qwen3-asr 取真置信/时长/语种）不在本刀——本刀只就位接口/映射/触发结构·建议 #73 行翻面注记登记残面（翻面权归协调方·口径由协裁定）。

## §5 Ban 面

历史迁移 0001-0218 零字节·零新迁移·**零回填 0216/0217 空缺号**；sha256 摘要管线与「原文零落」逐字节零回退；graph/agent 内核（modality-agnostic）零触（喂图 transcript 仍纯文本）；730d03b0 行为零回退（纯文本→unavailable·打字四参数）；contracts `:159-160` 能力声明约束（零模型自报数值进 DTO）；`'voice_low_quality'` 枚举与 `:151`/:451 两 low 臂零删改；`scoring-aggregation.ts`/`disabledAsr`/TTS 全面零触；⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 停止条件与 STOP

- 停止四类：现场漂移超注记级/机制不满足/越界需要/验收红不可修——**起草期均未触发**（§0.0 防重三查零撞·在飞一面相交已承登·§0.2 正身亲证成立）。
- **本卷 STOP=`draft:awaiting_pre_exec_dual`**（三处同值：Status 头+本节+卷尾注）·pre-exec 双审两独立外席待派→Dual PASS→协调方授权 EXEC 落码·翻面权归协调方·alone≠dual·Ban self-approve。
- **est live=0**（新 prove=本地脚本 provider+纯函数·质量载荷在真适配器为 unavailable 申报·请求体零新增零 prompt 改=零新模型外呼路径·0 Key 值·`actualSpendCny=null`）·零 env 闸零新增。
- **STOP=`draft:awaiting_pre_exec_dual`**（与 Status 头/§8 同值第三处）·起草落卷即停·⛔push。

## §9-rev rev 修订注记（pre-exec 双审双 FAIL 两席合并清单 P1 两件甲/乙+P2 六件甲-己回路 · rev 落卷 2026-10-22 · **append 注记形 · 上文 §0-§8 一字不洗** · EXEC 期与上文冲突处以本节为准读）

**rev 缘由**：pre-exec 双审第一轮两独立外席双 FAIL（席1：P1-A/P1-B+P2×3·席2：P1-1/P1-2+P2×5）同源合并八条；本席逐位届树亲证（届树=`e7f3497a`·本刀卷笔纯文面新增·产品码面与 base `65a9c40f` 零 diff）后按 rev 回路落卷（只改本卷·纯文面零码动·码面/migrations/LEDGER/SSOT/他卷零触）。**八条全部届树成立落修正·零跳过**；三处届树实测与清单词面之差随条如实登记（rev-2 键集行号 `:807`→`:813` 校正·rev-2/rev-3 合算 17→18·rev-7「触面八包」词面校注）。**STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值零翻**（Status 头/§8/卷尾注）·**rev 落卷后重派 pre-exec 双审两独立外席第二轮·窄域=本节落点复验·alone≠dual·Ban self-approve**。

### rev-1（P1-甲·两席同源）件③ 保守兜底保持+质量申报 token 词表显式 pin

**修正句**：件③ 末句「映射不到/非法输入 fail-closed `undefined`（调用方不写列·沿 `:67` 现契约）」作废，改读——映射三分：①缺省/非串/纯空白→`undefined`（现契约 `scoring-evidence-conflict.ts:67-70` 保持·调用方不写列=文字作答照旧）；②词表命中按下表映射；③**非空而映射不到（自由转写文本/未收编 token）→保持 `'unavailable'` 保守兜底·绝不落缺省**。

**届树亲证（原句必改理据）**：原句把「映射不到」亦归 `undefined`→调用方不写列→列落 `DEFAULT 'ok'`（`0109:126` `uncertainty_voice_quality text NOT NULL DEFAULT 'ok'` 亲证）+裁决缺省 `COALESCE(p_uncertainty->>'voiceQuality','ok')`（`0109:263` 亲证）=未映射非空 token 被写成 ok——**自触 §1.3-Ban-乙「伪造 ok/把 unavailable 升格 ok」**；现行契约即「非空一律 unavailable」（`:68` 仅 `typeof asrOutcome !== 'string' || asrOutcome.trim() === ''` 返 undefined·其余恒 `'unavailable'`+docstring「其余非空文本…都是 unavailable·不返回 ok」）——原句系保守兜底反转。证面必红：`apps/worker/test/interview.proof.ts:741-745` 五个非空 voiceCases 恰等断言列值=`'unavailable'`，纯 token 表无兜底时自由转写文本（`:741` 非固定 token）映射不到→落列 ok→断言红。

**token 词表 pin（现卷未 pin=EXEC 须自行发明 token 名的缺口·本节补齐）**：
- `'unavailable'` 组（既有 token 显式收编+兜底）：`word_timestamps_not_available`（`TEXT_ONLY_ASR_OUTCOME`·`interview-question.ts:153`）·`asr_timeout`/`asr_aborted`/`asr_malformed`/`asr_not_configured`（四失败码·`voice.ts:402`/:410/:446/:30 抛出点亲证·与 domain docstring「四个失败码」同源）·**其余一切非空串兜底 `'unavailable'`**（自由转写文本经 `asrOutcomeForStoredTranscript` `interview-question.ts:164-172` 原文直通入同字段）。
- `'low'` 组（新增臂·token 名 pin）：**`asr_quality_low`**（沿 `asr_*` 失败码命名族；真置信适配器接线前零生产者·结构就位·残面仍归 §3-3；contracts `'voice_low_quality'`（`contracts/src/index.ts:689`）系下游 review 理由码·非 asrOutcome token·两名异位不混用）。
- `'undefined'` 组：缺省/非串/纯空白（现契约保持）。

**门② 断言面随修正**：`prove:asr-quality-mapping` 覆盖四臂——undefined 缺省/空白臂+词表 unavailable 组+`asr_quality_low`→low 臂+非空未收编→unavailable 兜底臂。

### rev-2（P1-乙·两席同源）触面矩阵补 3 既有证明面·fake/fixture 更新形预申明

§1.2 计 14 tracked 漏 3 个既有 test/proof 面——件①（Asr 接口改结构化返回）落码后三处串 fake/fixture 必失配，「恰 14 tracked」与门④⑥⑧绿预申明自相矛盾。届树亲证三面全成立：
- `apps/api/test/voice-timeout.proof.ts`：`:85`/`:129`/`:152` 三处 `{ transcribe: async () => '' }`/`async () => transcript` **串 fake**；`:163-166` 键集恰等断言 `Object.keys(stored).sort().join(',') === 'capture,text'`（恰等行 `:166`）。
- `apps/worker/test/interview.proof.ts`：`:804` `{ transcribe: async () => transcript }` 串 fake；`:811-815` 键集恰等断言 `'capture,text'`（恰等行 `:813`——席面记 `:807`·届树实测校正）；`:939` 等抛错 fake 不触。
- `packages/contracts/test/openapi.proof.ts:66-69`：`TranscribeResult.safeParse` fixture 无新增申报字段。

**预申明更新形**：三处串 fake 改结构化 `AsrTranscription` 形（text+quality 常量申报）；两处键集恰等以「件⑤ 新字段**内嵌 capture**·顶层仍恰 `capture,text`」保持绿（顶层不另立键·预申明）；openapi fixture 随 rev-4 required pin 补申报字段（补后绿）。矩阵 14→17（与 rev-3 合算=18）。

### rev-3（P2-甲·席2）门⑫/§1.2 package.json 计数正算

件⑥ 注册面实为 **3 个 package.json**（ai-runtime prove 键+domain prove 键+根 package.json 两行）——§1.2「两 package.json 2」漏计根 package.json。照件⑥ 正确面重算：8 产品面+新 prove 2+package.json **3**+run-e2e 1+本卷 1+rev-2 证明面 3=**恰 18 tracked**（门⑫「恰 14 tracked」与 §1.2 计数同改 18；席面「14→17」未计本条正算·合算口径以 18 为准）。

### rev-4（P2-乙·席2）件⑤ capture 新增申报字段二择 pin=required

pin 入卷：**required**（`z.literal('unavailable')` 申报常量·与 `TranscribeResult.capture` 既有三字面量字段 `contracts/src/index.ts:163-171` 同形同必填性）。依据：①既有 capture 三字段全 required 字面量·形一致；②§3-2 案乙否决理由「absent 即不可得——缺省语义弱·消费端易误读『有值即真』」对 optional 同样成立·optional 重引入 absent 歧义；③唯一 C 端生产者 `interview-voice.ts:59-75` 在触面矩阵内必随件①写入。openapi.proof fixture 条件性必红面由 rev-2 预申明更新形吸收。

### rev-5（P2-丙·席2）件④「token 扩形携带申报」载体写死=asrOutcome 串内编码·合一读法

件④ `loadTranscribedAnswerJobPayload` token 扩形携带申报的载体写死：**申报以映射 token 形编码于 asrOutcome 单串内·`voiceQualityFromAsrOutcome` 单点解码（合一读法）·不另立 payload 独立键**——封「另立键 vs 串内」歧义。届树亲证连带面（两处不在触面矩阵的依据随本 pin 成立）：
- `interview-jobs.ts:265`/:269/:278/:383-384 剥离键纪律恒 `payload-'answer'-'asrOutcome'`——另立 payload 键则剥离清单漏剥=暂存明文纪律缺口；串内化后剥离纪律零触。
- `adaptive-lifecycle.ts:590` `asrOutcome: input.asrOutcome` 单串透传——另立键则透传丢申报且该文件不在矩阵；串内化后透传零触。
- `score-writer.ts:52`/:111 现读法即单串（`q.asrOutcome`）→件④「透传形零改」申明在串内化下成立。

### rev-6（P2-丁·席2）run-e2e 四锚届值重 pin

件⑥ 四处注册锚按届树（`scripts/run-e2e-isolated.mjs` @`e7f3497a`）重 pin——清单臂 `:962-964`；隔离白名单 **`:2330`**（原卷「`:2297` 位」陈旧·届树 `:2297`=`'mem02-summary:prove:raw'` 亲证·ag18 条目现 `:2330`）；派发臂 `:2574-2575`；migrate 白名单 `:3228`。EXEC 立项仍照届时 tip 全量重 pin（§0 总则不变）。

### rev-7（P2-戊·两席）门⑨ 帽清单口径修正

门⑨ 警告帽断言改口径：**八帽恰等+全门 EXIT=0**——root 5242/api 1423/domain 115/ai-runtime 628/db 1042/worker 959/web 601/contracts 265（八值届树亲读无误·各 `package.json --max-warnings`）+`turbo lint --force` 全门 EXIT=0 覆盖**全仓 12 帽**（另四帽 ai-graphs 47/config 0/db-mysql 0/qdrant-store 27 同闸亲证；`packages/errors` 无 lint 帽亲证=全仓恰 12）。席面「触面八包」词面如实注：八值中 web 非本刀触面包·帽值恰等断言照旧（lint 帽不因本刀改）·本刀触面产品包实为 7（root/api/ai-runtime/domain/db/worker/contracts）——以帽值事实为准落断言。

### rev-8（P2-己·席1）§0.0 两处届树漂移改口径

- 树计数：§0.0「**8 树**实测」改「**树数届时亲跑·不写死值**」——届树实测已漂至 **11 树**（`git worktree list` 亲证：新增 meetwise-ag29/meetwise-ag35·主仓 tip 移至 `45f7ec4f`·临时 land 树更替）·写死值必再漂。
- 修复笔：§0.0「修复笔恰 `730d03b0`」改「**修复笔四笔（`cb32889e`/`c9db9b34`/`6d7cc1d6`/`730d03b0`）均已入 main**」——届树 `git log --all --oneline --grep='语音质量'` 四笔亲证+`git merge-base --is-ancestor` 对 `origin/main` 四笔全真亲证。

### rev 门面与 STOP 补注

- 门② 断言面随 rev-1 四臂；门④⑥⑧ 预申明改「**件①同步修 fake 后绿**」（rev-2 三面）；门⑤ 同性质联动补登：`worker prove:interview` 以 interview.proof.ts:804 fake 同修为绿前提（届树亲证同性质·席面清单未单列·随条补）。
- 门⑫ 恰 **18 tracked**（rev-2+rev-3 合算）。
- **STOP=`draft:awaiting_pre_exec_dual` 维持三处同值零翻**（Status 头/§8/卷尾注）·**rev 落卷后重派 pre-exec 双审两独立外席第二轮·窄域=本节落点复验·alone≠dual·Ban self-approve**。

**rev 自检回执**：`git diff --numstat` 恰 1 tracked 本卷 .md（§0-§8 一字不洗·纯 append+卷尾注行内 append）；`node scripts/ai-docs/check-docs.mjs` EXIT=0（rev 时点亲跑·本卷系既有文件 append 零新增文件）；改动面行首冲突标记直扫 0 命中；码面/migrations/LEDGER/SSOT/他卷零触；est live=0（rev turn 全只读+1 doc append·`actualSpendCny=null` 同源）。

## §9-rev2 rev2 修订注记（双审第二轮席1 合并清单 P1 一件甲+P2 三件乙/丙/丁回路·席2 尚未回卷如另有 P 件由协调方并单再补 rev3 · rev2 落卷 2026-10-22 · **append 注记形 · 上文 §0-§8+§9-rev 零字洗** · EXEC 期与上文冲突处以本节为准读）

**rev2 缘由**：pre-exec 双审第二轮席1 FAIL（P1 一件+P2 三件）合并四条；席2 尚未回卷——本节先按席1 合并清单落卷，席2 回卷后如另有 P 件由协调方并单再补 rev3。本席逐位届树亲证（届树=`19a83b00`·本刀卷两笔纯文面·产品码面与 base `65a9c40f` 零 diff）后落卷（只改本卷·纯文面零码动·码面/migrations/LEDGER/SSOT/他卷零触）。**四条全部届树成立落修正·零跳过**；STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值零翻（Status 头/§8/卷尾注）·**rev2 落卷后重派 pre-exec 双审两独立外席第三轮·窄域=本节落点复验·alone≠dual·Ban self-approve**。

### rev2-1（P1-甲·席1）rev-2 证明面清点穷尽补第 4 处：dashscope-native-config 成功路径断言串比

**修正句**：rev-2 触面清点漏第 4 处既有证明面 `packages/ai-runtime/test/dashscope-native-config.proof.ts`——矩阵补列该面（18→**19 tracked**）并预申明「**件①②同步修该 proof 成功路径断言（`transcribe` 返回值改结构化 `.text`/quality 读法）后绿**」，吸收进门⑧预申明。席面词「成功路径 fake」届树如实注：该面非 rev-2 三处 `transcribe` 串 fake 同形，系真适配器+mocked in-memory transport（文件头注释自述·届树 Read 亲证）下成功路径**返回值断言串比**——修法=断言读法结构化·transport fixture 零涉。

**届树亲证（漏列必补理据）**：`:139` `const transcript = await dashscopeAsr({ timeoutMs: 500 }).transcribe(new Uint8Array([1, 2, 3]), { format: 'wav' });` 成功路径+`:141` 断言 `transcript === '转写文本'` 串比（`:140-142` check 体·届树 Read 亲证）。件①②落码后 `transcribe` 返回结构化 `AsrTranscription`·左值为对象——双路必红：**(a) 编译面**：对象与串字面量无重叠比较=TS2367 编译错，ai-runtime `tsconfig.json` include 恰 `["src","test"]`+`typecheck: tsc -p tsconfig.json --noEmit`（两处届树亲证）→门⑧必红；**(b) 运行时**：tsx 免检直跑下对象 `===` 串恒假→check 败→`prove:dashscope-native-config`（`packages/ai-runtime/package.json:45` 在册亲证）红。同文件 `:196` `asr_not_configured` 错误臂系构造期抛出（`:432`）与返回形零涉·零触——受影响面恰成功路径 `:139-141` 一处。且该面不在 rev-2 三面清单、本卷 grep `dashscope-native-config` 零命中亲证=矩阵零列·无「同步修后绿」预申明——与门⑫「恰 18」自相矛盾（同 rev-2 缘由再现）。

### rev2-2（P2-乙·席1）门⑫ 18 计数口径注记=矩阵触面·score-writer 零强制 diff

**修正句**：门⑫「恰 18 tracked」口径注明为**矩阵触面**（计划触面数·非强制 diff 实算数）——rev 合算 18 计含 `score-writer.ts`（§1.2 八产品面之一），而件④「透传形零改」+rev-5 串内化 pin 下该文件**零强制 diff**（若剔除届时实为 17）；本节 rev2-1 补第 4 证明面→矩阵触面 **19**=实算强制 diff 19−1（score-writer 零强制 diff）=**18**。EXEC 届时以 `git diff --stat` 届树亲证为准如实录：若届树亲证 score-writer 出现实质 diff 行则按矩阵触面 19 口径如实录——两口径并陈·不凭空并数。

**届树亲证（零强制 diff 理据）**：`score-writer.ts` 输入 `asrOutcome?: string` 单串（`:52` 附近类型体亲证）+`:111` `const voiceQuality = voiceQualityFromAsrOutcome(q.asrOutcome);` 单串读法+`:117` 条件展开——rev-5 串内化 pin 下映射 token 编码于 asrOutcome 单串内·该文件现读法零改即成立（与 rev-5 第三 Bullet 同源）；件③ 映射内聚 domain·件④ 对 score-writer 本只申明「透传形零改」。

### rev2-3（P2-丙·席1）件① 补列：voice.ts:387 产品内 fakeAsr 同需结构化改（无计数影响）

**修正句**：件① 消费位清单一并预申明：`voice.ts:387` `export function fakeAsr(transcript: string): Asr { return { async transcribe() { return transcript; } }; }` 产品内确定性 fake 随件① 接口结构化**同需结构化改**（`transcribe` 返 `AsrTranscription` 形·text+quality 常量申报·入参串签名不变）——voice.ts 本在触面矩阵内（同文件 typecheck 强制）·**无计数影响·矩阵不增**。

**届树亲证（消费方零触·无计数影响理据）**：全仓 fakeAsr 触面 grep 恰 5 文件（定义 `voice.ts:387`+消费 `apps/worker/test/voice.proof.ts`+re-export `packages/ai-runtime/test/support/fakes.ts`+名面 proof `test/test-support-fakes.proof.ts`+导出注释 `src/index.ts:152` 亲证）——消费三处全零触：`voice.proof.ts:25`/:28 经 `fakeAsr(ANSWERS[n])` 串入参注入·件① `voice-turn.ts:15` `.text` 读法下转写在 voice-turn 消费点解包仍串·`:14` 返形 `transcript: string` 不变→`t1.transcript === ANSWERS[0]`（`:26`）串比断言零触；`fakes.ts:12` 纯 re-export `export { fakeAsr, fakeTts } from '../../src/voice.ts'` 零触；`test-support-fakes.proof.ts:28` FAKE_NAMES 只查 src/index.ts 名面与返回形零涉·零触。

### rev2-4（P2-丁·席1）rev-1 词面校正：`:402`/:410 系构造器报文定义点非抛出点

**修正句**：rev-1 词「四失败码·`voice.ts:402`/:410/:446/:30 抛出点亲证」词面校正读——`:402` `super('asr_timeout')`/`:410` `super('asr_aborted')` 系 `AsrTimeoutError`/`AsrAbortedError` **构造器报文定义点**（类体内 super 报文·非抛出点）；真抛出点=`:451` `throw new AsrAbortedError()`/`:452` `throw new AsrTimeoutError(timeoutMs)`（届树 grep 亲证）。`:446` `requireNonEmptyText(content, 'asr_malformed')` 与 `:30` `throw new Error('asr_not_configured')` 两锚词面照旧。锚行不漂·四失败码与 domain docstring 同源承登·rev-1 结论零变——纯词面校正。

### rev2 门面与 STOP 补注

- 门⑧ 预申明随 rev2-1 改「件①②同步修 dashscope-native-config.proof 成功路径断言后绿」（与 rev-2 三 fake 面、门⑤ interview.proof 同性质并列第四处）。
- 门⑫ 恰 **18 tracked** 维持·口径=矩阵触面 **19**（rev 合算 18+rev2-1 第 4 证明面）−score-writer 零强制 diff 1=**实算 18**（rev2-2）·届时以 `git diff --stat` 届树亲证为准如实录。
- **STOP=`draft:awaiting_pre_exec_dual` 维持三处同值零翻**（Status 头/§8/卷尾注）·**rev2 落卷后重派 pre-exec 双审两独立外席第三轮·窄域=本节落点复验·alone≠dual·Ban self-approve**。

**rev2 自检回执**：`git diff --numstat` 恰 1 tracked 本卷 .md（§0-§8+§9-rev 一字不洗·纯 append+卷尾注行内 append）；`node scripts/ai-docs/check-docs.mjs` EXIT=0（rev2 时点亲跑·本卷系既有文件 append 零新增文件）；改动面行首冲突标记直扫 0 命中；码面/migrations/LEDGER/SSOT/他卷零触；est live=0（rev2 turn 全只读+1 doc append·`actualSpendCny=null` 同源）。

---

卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·起草 2026-10-22 落卷·基线 `origin/main`@`65a9c40f`·分支 `line/asr-quality-draft`·工作树 `meetwise-iss73`·批表原文 iCloud 不可读已承登（仓内定性链=LEDGER `:59`+batch-residual-plan `:62`/:102+`730d03b0` 部分收敛亲证）·正身='low' 生产者缺位致 review 触发结构性不可达·est live=0·actualSpendCny=null·pre-exec 双审两独立外席待派·翻面权归协调方·alone≠dual·Ban self-approve·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase·rev 修订注记 §9-rev 2026-10-22 落卷（pre-exec 双审第一轮双 FAIL 两席合并清单回卷·P1 两件甲/乙+P2 六件甲-己全成立落修正·零跳过·三处届树实测差随条如实登记·§0-§8 零字洗·STOP 三处同值零翻·第二轮双审待重派）·rev2 修订注记 §9-rev2 2026-10-22 落卷（双审第二轮席1 合并清单回卷·P1 一件甲+P2 三件乙/丙/丁全成立落修正·零跳过·席2 尚未回卷如另有 P 件由协调方并单再补 rev3·矩阵触面 19=实算 18 口径注记·§0-§8+§9-rev 零字洗·STOP 三处同值零翻·第三轮双审待重派）。
