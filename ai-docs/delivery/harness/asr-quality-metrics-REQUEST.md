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

---

卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·起草 2026-10-22 落卷·基线 `origin/main`@`65a9c40f`·分支 `line/asr-quality-draft`·工作树 `meetwise-iss73`·批表原文 iCloud 不可读已承登（仓内定性链=LEDGER `:59`+batch-residual-plan `:62`/:102+`730d03b0` 部分收敛亲证）·正身='low' 生产者缺位致 review 触发结构性不可达·est live=0·actualSpendCny=null·pre-exec 双审两独立外席待派·翻面权归协调方·alone≠dual·Ban self-approve·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。
