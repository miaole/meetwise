# SCREG REQUEST — scoring registry 键域修正任务书（E2EA-01 件① EXEC 红停浮出真缺陷·评分评测样本键域中文组 ID × registry businessRevision ASCII 白名单 fail-closed → 71 请求 100% transient 零评分·修法=案(b) 基键规范化·docs-only 起草卷·落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs-only REQUEST·本 commit 零产品码触·**STOP 三处钉=本 Status 行+§8+卷尾同值·alone≠dual·Ban self-approve·⛔push ⛔merge ⛔force-push·est live=0（起草 turn）·本 commit 不预 claim 任何 post-commit EXIT**）

**席位**：meetwise 战役「scoring registry 键域修法刀」起草席（诊断+起草双责·协调方授权派单·docs-only 起草落卷即停·EXEC 归后派）。
**基线**：`origin/main` @ **`7c5aa7445`**（merge #162 perfweb-draft·`git fetch origin` 本 turn 成功·分支 `line/screg-draft` 新建零独有 commit·工作树 `meetwise-screg` 仓根同级）· `node scripts/ai-docs/check-docs.mjs` 本树起草前亲跑 **EXIT=0 · scanned 2420 = cap 2420 恰等零余量**（§2-1 cap 预算核·随刀先手步进见 §2-1）。
**立项出处（四源）**：①**E2EA-01 件① EXEC 红停收据** `line/scoring-eval-exec` @`bed65e869`（`ai-docs/delivery/receipts/scoring-eval-exec/01-scoring-eval-stdout.log` blob `fc861681`·真跑评分请求 71·实际供应商调用 5·跳过(model_transient) 71(100%)·主因=`model_operation_revision_invalid` 58（显式 54+MI clean base 静默 4·§0.3 对账）→ 红停如实录·本卷=该红停浮出的真缺陷修法刀）；②E2EA-01 行 `ai-docs/delivery/gap-bug-backlog.md:931`（P2 OPEN·「配 key 后真跑面…须核」承其红事实·修法权随本刀起草面落卷）；③**键字符集约束存档注记** `apps/worker/src/interview-service.ts:317-320`（自证「idempotencyKey 作为 registry businessRevision 派发时必须满足 `/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/`…否则 invoke 以 `model_operation_revision_invalid` fail-closed…存续调用面 invokeEvaluationOnce 的 baseIdempotencyKey 同受辖」——**约束系调用方义务面·非 registry 缺陷·唯 scoring-eval 构造点违约束**）；④协调方派单（本卷·docs-only 起草·commit 净消息 `docs(test): 起草评分键域修正任务书`）。**结构范本**=`ai-docs/delivery/harness/nhp-batch-c-REQUEST.md`（§0-§9 形制）+`uc003x-REQUEST.md` 起草刀 cap 恰等步进先形（`public-text-policy.mjs:194-196` 注记在树亲证）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`7c5aa7445`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **35 树**实测（`| wc -l` 亲数）——`line/screg-draft` 恰 1 命中=本席；`ls ai-docs/delivery/harness/ | grep screg` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **缺陷源在飞线亲读**：`line/scoring-eval-exec` @`bed65e869`（E2EA-01 件① EXEC 红停收据卷·`git diff --name-only origin/main...line/scoring-eval-exec` 恰 2 tracked=checklist+收据 .log·**触面与本卷零重叠**；其 EXEC 已红停·重行使归本卷修法后 EXEC·非同文件并发）。
- **在飞面逐支机检**（worktree-backed 非主线祖先支×`git diff --name-only origin/main...<b>` 触面 grep·亲跑）：**EXEC 主修法面 `apps/worker/smoke/scoring-eval.ts` 在飞支零命中**（`ag14/ag18f/ag20/ag20s/av/cap2354/bookkeeping×2/campaign-state/inject/job-autovacuum/ledger-tidy/loadw/mop03×4/online-pay/pay-neg/queue×3/rag02×2/state/tlfix/uc31/perfweb 等全 NO_SURFACE_OVERLAP 亲证）·`line/scoring-eval-exec` 仅触收据+checklist；**policy 两件（本卷起草触面）有五支历史叠加**：`line/ag18-draft` @`4c2ea4c9f`·`line/cap-2272` @`52846f9d8`·`line/webhook-fault-draft` @`981964d9d`·`line/x16-adv-draft` @`dffe472fb`·`line/x33-adv-draft` @`5a560411a`——均系 cap 注记/步进历史叠加（x16/x33 EXEC commit 自载 CAP-SANCTION-2420 已行使·`git log` 亲证）·本卷 +1 步进注记为新增注释行·并线冲突沿 perfweb/x33「policy 注释 dual-keep 双留」先形处置·语义 additive。
- **本卷起草 turn 产品触面=0**；EXEC 期触面=§2-3 登记面·届时对各在飞分支 `git log -1 -- <触面文件>` 逐件复核，任一分支顶对任一触面存在 `7c5aa7445` 之后新增提交 → 触 §8 停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·全 hash 截前 8 hex）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `packages/ai-runtime/src/model-operation-registry.ts` | `f07688cb`（343） | **`:213` `OPERATION_ID_PATTERN`·`:214` `BUSINESS_REVISION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/`（ASCII 白名单·本缺陷 deny 面）**·`:292-296` `resolveModelOperation`（**:295 fail-closed 分支 `return { ok: false, error: 'model_operation_revision_invalid' }`**）·`:300` `logicalNodeKey = ${MODEL_OPERATION_REGISTRY_VERSION}:${operationId}:${businessRevision}`·`:305-316` `isRegistryLogicalNodeKey`（同谓词复用 `:314-315`）·卷头 `:7-9` 设计自证「a caller cannot invent, reuse or widen a node by passing arbitrary key text」·`MODEL_OPERATION_REGISTRY_VERSION='model-op-registry-v1'`（`:23`） |
| `apps/worker/src/interview-service.ts` | `66953d01`（373） | **`:127-130` `evaluationIdempotencyKey = ${baseKey}:answer:${sha256hex(answer)}`**·`:168` `primaryIdempotencyKey = evaluationIdempotencyKey(input.baseIdempotencyKey, …)`·**:179 `operation: { id: 'interview.answer-scoring.v1', businessRevision: primaryIdempotencyKey }`**·`:314-321` 键字符集约束存档注记（`:317-320` 自证约束=调用方义务·存续强制面=invoke registry 层） |
| `apps/worker/smoke/scoring-eval.ts` | `f284b550`（200·对 `micro-batch2-REQUEST.md:16` 登记值恒等亲证零漂） | **`:74` `baseIdempotencyKey: \`scoring-eval:v3:${key}\``（本缺陷修法唯一落点）**·key 五构造点 **`:99`(`${g.id}:${c.tier}`)·`:130`(`${g.id}:v${i}`)·`:146`(`o.id`)·`:165`(`${g.id}:clean`)·`:173`(`${g.id}:poison:${i}`)**·`:16` 自 skip 臂（零触）·`:39` profile 钉值 `dashscope-cn-beijing`（零触） |
| `apps/worker/test/scoring-golden.ts` | `eb09b1c4`（200） | 中文组 ID 十四：**:22 `MG-限流`·:32 `MG-分布式锁`·:42 `MG-支付幂等`·:52 `MG-RAG缓存`·:62 `MG-图恢复并发`·:72 `MG-评分可信`·:85 `PG-限流-good`·:94 `PG-分布式锁-good`·:103 `PG-支付幂等-good`·:112 `PG-RAG缓存-good`·:162 `MI-限流-中文尾巴`·:170 `MI-锁-英文尾巴`·:178 `MI-支付-角色伪造`·:186 `MI-RAG-伪截断`**·:135-152 `OT-01..OT-18` 纯 ASCII（红跑中模型路由 13 请求失败族的唯一样本集·5 真达供应商+8 熔断拒·§0.3） |
| `packages/contracts/src/index.ts` | `17740454` | **`:57` `questionId: z.string().regex(/^q-v\d+-t\d+-c\d+$/)`（生产问题身份 ASCII 钉·生产 assess 键域安全实证）** |
| `apps/worker/src/adaptive-interview-service.ts` | `71c9a502` | `:329` plan 键 `${threadId}:plan`·`:331` plan businessRevision·`:635-637` ask 键（registry `:308-310` 注释自证 `${threadId}:ask:t3` 形·threadId=LangGraph UUID）·`:813-815` assess 基键 `${d.threadId}:eval:q:${questionId}:v:${stateVersion}:t:${turn}`（三组分全 ASCII 钉面） |
| `packages/ai-runtime/src/job-route-classify.ts` | `3b1e70818` | `:154` 幂等键 `${input.jobId}:${input.revision}:${digest}`·`:166` businessRevision 同基（jobId=DB id） |
| `packages/ai-runtime/src/resume-ocr.ts` | `b2c514258` | `:135-136` businessRevision=图字节 HMAC（hex） |
| `packages/ai-runtime/src/invoke.ts` | `f61024332` | `:455/:738` `resolveModelOperation(spec.operation.id, spec.operation.businessRevision)` 两消费点·`:229` spec 类型 |
| `packages/ai-runtime/src/model-admission.ts` | `f6bc58ee4` | `:71-74` 共享准入 resolver 第三消费点 |
| `scripts/run-e2e-isolated.mjs` | `95101ada` | `:765` `scoring:eval:raw` SOURCE_PATHS·`:2635` targets 名单·`:3379` isolatedCommand 臂·**:3713 `scoring:eval:raw` 缺 `MODEL_API_KEY` 即 skip 臂（loader 通道·EXEC 期 Key 经此注入）** |
| `.github/workflows/nightly.yml` | `95d77505b` | `:57-:65` scoring 步（`:58` continue-on-error·`:65` in-run `::warning::` 诚实守卫）——零触只读 |
| `scripts/ai-docs/public-text-policy.mjs` | `acb89fa3` | **`:201` `MAX_FILES = 2_420`**·`:188/:192/:198` 常设预授权「cap/lint 以合并树实测为准恰等步进免再询」注记在树·`:194-196` uc003x 起草刀 +1 恰等步进先形 |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `5228c6f0` | **`:399`（`i < 2_420`）·`:406`（`atCap.scannedFiles, 2_420`）·`:409`（`f-2420.md`）·`:412`（`PTP_FILE_LIMIT:2421`）=越限臂四联动点·cap 步进必随改** |
| `ai-docs/delivery/gap-bug-backlog.md` | `2f1c18086` | E2EA-01 行 **`:931`**（micro-batch2 §9 勘误后现值·EXEC 日重 pin） |
| `line/scoring-eval-exec:ai-docs/delivery/receipts/scoring-eval-exec/01-scoring-eval-stdout.log` | `fc861681` | 红停收据（§0.3） |

### 0.2 缺陷链码面锚（六环逐环亲读·因果单向）

1. **白名单**：`model-operation-registry.ts:214` `BUSINESS_REVISION_PATTERN=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/`——首字符 ASCII 字母数字、余下仅 `._:-`；**中文字符不在字符类 → `.test()`=false**。
2. **fail-closed 分支**：`:295` `if (!BUSINESS_REVISION_PATTERN.test(businessRevision ?? '')) return { ok: false, error: 'model_operation_revision_invalid' }`——派发前确定性拒绝（零外呼零消耗·绝不静默吞）。
3. **键流上游一**：`interview-service.ts:127-130` `evaluationIdempotencyKey(baseKey, answer)=`${baseKey}:answer:${sha256hex}`——answer 段纯 hex 安全；**污染源=baseKey 原文透传**。
4. **键流上游二**：`interview-service.ts:168/:179` baseIdempotencyKey 直入 `operation.businessRevision`。
5. **违约束构造点**：`smoke/scoring-eval.ts:74` `` `scoring-eval:v3:${key}` ``——`${key}` 五构造点（`:99/:130/:146/:165/:173`）插入 fixture 组 ID；**组 ID 中文域实证**：`scoring-golden.ts:22-186` 十四个 MG/PG/MI 组 ID 含中文字符（§0.1 表）。
6. **调用方义务自证**：`interview-service.ts:317-320` 存档注记明文该字符集约束及其 fail-closed 语义——**scoring-eval 构造点是全仓唯一违约束调用面**（全仓 `baseIdempotencyKey`/`idempotencyKey:` 模板字面非 ASCII 词面 grep **零命中**亲证·中文经 fixture 变量注入·非字面）。

**生产面零涉亲证**（案(b) 安全面·六路调用方逐路 ASCII）：①assess `adaptive-interview-service.ts:815`=threadId(UUID)+questionId(`contracts:57` regex `^q-v\d+-t\d+-c\d+$`)+stateVersion/turn(数字)；②plan `:329/:331`=threadId+`:plan`；③ask `:635-637`=threadId+`:ask:t{n}`；④quiz/diagnosis/report `interview-service.ts:249/:292/:351`=DB UUID 键；⑤OCR `resume-ocr.ts:136`=HMAC hex；⑥job-route `job-route-classify.ts:166`=jobId(DB id)+revision。**键域缺陷面=评测 harness 样本键·生产六路全安全**。

### 0.3 红停收据锚（`line/scoring-eval-exec` @`bed65e869`·blob `fc861681` 亲读·数字口径原值）

- 汇总行原值：**评分请求 71 · 实际供应商调用 5 · quote 二次调用 0（固定） · 确定性短路 5 · 跳过(model_transient) 71(100%)**（汇总行节选注·原行另含「quote 拒绝 0 · 业务/证据拒绝 0」两零值字段·此处省略零值不涉数字口径）·判 `INCONCLUSIVE`（跳过率>20%·不下质量结论）。
- 拒因分布（`grep -o "reason=…"/"rejected=…"` 亲数）：`model_operation_revision_invalid` 显式 **54** 行·`external_outcome_unknown` **5**·`model_circuit_open` **8**。
- **主因 58 对账**：58=显式 54+**静默 4**（71−54−13=4 差额·恰=4 个 MI 组 clean base 请求 `:165` 失败不打印·由 §④「无足够真模型结果」行旁证）——58/71=81.7% 请求死于 registry 键域 fail-closed 零外呼。
- **五调用分币级先例**：实际供应商调用 5=`OT-01/03/04/05/06` ASCII 样本真达供应商侧（qwen-turbo 快模型·failover 后 `external_outcome_unknown` ×5 触共享熔断阈 5 → 余 8 请求 `model_circuit_open`——该 13 请求失败系**供应商当日抖动族**非键域·与本缺陷独立·`model_operation_revision_invalid` 零熔断计数（派发前拒绝））→ EXEC 期 est live 量级锚（§6）。

---

## §1 修法（案(b) 定标：基键规范化·构造点唯一落点·registry 契约零触）

**定标结论**：二择一取 **案(b) 基键规范化**——`smoke/scoring-eval.ts` 恰 1 码面文件·构造点 `:74` 前置规整；**案(a) registry 键域扩展否决**（§1.3 逐条）。

**修法形状**：
1. **规整规则钉**：`scoring-eval.ts` 内新增纯函数（形如 `evalKey(key)=createHash('sha256').update(key,'utf8').digest('hex')`）——**sha256 hex 全长 64·零截断**：①全 ASCII 纯集过 `BUSINESS_REVISION_PATTERN`（`:214` 首字符+字符类+长度三段全满足）；②确定性（同输入同键）；③唯一性=原键域恒等映射（2^256 碰撞面·n≈90 样本 Birthday 界可忽略→样本幂等键两两异·破 cache 语义零损）；④总 revision 长=`scoring-eval:v3:`(16)+64+`:answer:`(8)+64=**152≤256**（`:214` 长度界内·`logicalNodeKey` 全长≈201 仅入 `registryLogicalNodeKeyDigest`（`:318-320` sha256→DB digest 列 0130 `!~ '^[0-9a-f]{64}$'` 拒面零涉））。EXEC 期如缝要求微调形（如带前缀 `screg-`）·不变量三件套（ASCII+确定性+两两唯一）不减·如实落卷。
2. **落点**：`:74` 构造点 `${key}` → `${evalKey(key)}`（或等价前置变量）·**五构造点共用一 helper**；**fixture 组 ID 与显示词面零触**（`:101/:106/:131/:134/:153/:176` 等 console 印刷仍用 `g.id` 原文·可读性零损）。
3. **约束注记语义保持**：`interview-service.ts:317-320` 存档注记零改——调用方义务面由构造点兑现·约束知识不随删失载原则维持。
4. **registry/产品码/迁移/DB 零触**：`packages/ai-runtime/src` 零 diff 意向（`BUSINESS_REVISION_PATTERN`/`resolveModelOperation`/`isRegistryLogicalNodeKey` 字节零动）·`apps/worker/src` 零 diff 意向·零迁移零配置。
5. **修法 proof 形（按缝双收）**：**主收=真跑重行使**（沿 E2EA-01 件① 收据形 `micro-batch2-REQUEST.md:84` 四度量读数+样本量+skip 率+profile 读数+est live 实数：`pnpm scoring:eval`·门=①`model_operation_revision_invalid` 计数=0 ②跳过率<20% 且汇总行非 `INCONCLUSIVE` ③评分请求 71 恒等（分母不缩）④确定性短路 5 恒等 ⑤实际供应商调用 ≥1（真外呼实证）——红=信号如实收（脚本非阻断 `:200` exit 0 语义·质量臂不阻断合并·Ban retry-to-green））；**辅收=离线单测臂**（零外呼·规整函数 ASCII 性/确定性/唯一性/稳定性断言·落点 EXEC 缝定标：`apps/worker/test/` 新 proof 或既有 scoring-golden 族增臂·沿 nhp 族 prove-only 注册形）——双 fresh 照 pre-exec/EXEC 协议。

---

## §1.3 否决表（落选项诚实留痕·含案(a) 否决证据面·翻案权归协调方）

| 落选项 | 否决理由 |
|---|---|
| **案(a) registry 键域扩展**（`BUSINESS_REVISION_PATTERN` 放非 ASCII·NFC+长度界+字符类扩） | **触面九 src+五 proof**：谓词双点（`:214`+`isRegistryLogicalNodeKey :305-316` 同正则）×消费面 `invoke.ts:455/:738`+`model-admission.ts:74`+`operation-binding`+`catalog/index`+`interview-voice-seams`+`resume-ocr`+`job-route-classify`+`index.ts` re-export·proof 面 `model-operation-registry/operation-binding/job-route-classify-binding/g7fix4-reroll/ag-f-reroll` 五件（`isRegistryLogicalNodeKey`/`registryLogicalNodeKeyDigest` 词面 grep 亲证）。**契约面**：`MODEL_OPERATION_REGISTRY_VERSION='model-op-registry-v1'`（`:23`）冻结契约+卷头 `:7-9`「caller cannot invent, reuse or widen a node」设计令——扩域=**平台级 fail-closed 准入语义变更**（MODEL-OP-00/01/02/03 家族复审链）。**规范化决策面四件独立设计**：NFC/NFKC 选型·char 界 vs utf8 字节界（0038 `char_length 1..256` 先例语义）·控制字符/bidi/homoglyph 混排面·trace/audit 中文词面污染（langfuse/receipt 节点名）。**收益比**：为 harness 一样本键域改全平台节点身份契约=不相称·影响面**非不可控但显著超本缺陷需求**→否决留痕·翻案须协调方另刀。 |
| 案(b) 变体·transliteration（拼音/音译） | 多字歧义→不同组名同音=**真碰撞风险**（唯一性语义不保）+转写库依赖+库版本漂移=映射不稳定 → sha256 全长完胜。 |
| 案(b) 变体·16hex 截断 | 64-bit Birthday 面（n≈90→~2e-13 可忽略但**无必要**）→ 全长 64hex 零成本取零碰撞面。 |
| 三层 skip 臂（wrapper `:3713`/self-skip `:16`/nightly `:58`） | E2EA-01 登记面既有·本刀零触（修法对象=键域非 skip 链·摘 continue-on-error=改信号臂定位·Ban）。 |
| OT 族 13 请求失败族（`external_outcome_unknown` ×5=OT-01/03/04/05/06+`model_circuit_open` ×8） | 供应商当日抖动族非键域·`model_operation_revision_invalid` 零熔断计数（派发前拒绝）·归 E2EA-01 真跑信号面如实报·不入本刀修法。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面·起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin·**数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）+ cap 预算核（亲算·随刀先手步进）**：本树起草前亲跑 `node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2420 = cap 2420**（`public-text-policy.mjs:201` `MAX_FILES=2_420` 亲证）恰等零余量·本卷 1 件=2421 必超（`PTP_FILE_LIMIT:2421>2420` 形）→ **cap 2420→2421 随刀先手步进（+1 恰等零多放·uc003x 起草刀 `:194-196` 单件恰等先形+pay-neg #155 先形·常设预授权「cap/lint 以合并树实测为准恰等步进免再询」在树 `:188/:192/:198` 承登）**·越限臂四联动点 `public-text-policy.proof.mjs:399/:406/:409/:412` 2_420→2_421/f-2421.md/:2422 恰等改+注记·本 commit 亲跑 **PTP proof 12/12 EXIT=0 + docs:check EXIT=0 scanned 2421≤2421**。EXEC 期若在飞并线致 union 再超 → 常设预授权同形再步进·如实承登。**EXEC 期终端算式**：主修法面=既有 `smoke/scoring-eval.ts` 增改零新件·真跑收据 .log 非扫描面（TEXT_EXTENSIONS 外）——**辅收臂落新 .ts 件则 cap 再 +1→2422 恰等步进（同预授权先形·届时越限臂四联动点再联动）/落既有文件增臂则 +0·恰等 2421**。
2. **markers 五类零命中 + est live=0**：本刀改动集（本卷 .md+policy 两件）五类标记词（五类标记词词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:154` 词组组装+`:163` 断言行亲读·**不复抄卷内防自指**——批 C §2-2/§7 同令）grep 零命中（起草席亲跑·回执入 EXEC 收据）·起草 turn est live=0（§6）。
3. **diff 面机检（如实登记·偏离批 C「恰 1」形承登）**：起草 commit `git diff --numstat 7c5aa7445` **恰 3 tracked 路径**=本卷 `ai-docs/delivery/harness/screg-REQUEST.md`+`scripts/ai-docs/public-text-policy.mjs`+`public-text-policy.proof.mjs`（cap 步进随刀·§2-1）·**零产品码零 registry 触面**亲证；EXEC 期 diff 面=本卷+`apps/worker/smoke/scoring-eval.ts` 修法+离线单测臂新件+**`apps/worker/package.json` 注册行 1 行（辅收臂若落新 proof·届时启用 script 注册·本行即预登记免「多未登记路径」假红）**+真跑收据（untracked 不入库沿 E2EA-01 EXEC 口径·或 .log tracked 非扫描面沿批 C 收据先形）——届时逐件登记·多任何未登记 tracked 路径即停。
4. **EXEC 预基面（届时重 pin·真跑=主收）**：①前置=MODEL_API_KEY 已配（loader 通道 wrapper `:3713` skip 臂解除·Key 经进程环境·Ban .env* Ban 值入树入据）+**完整集执行·`SCORING_EVAL_IDS` 未设（`scoring-eval.ts:28` 分片复核通道零启用·分母 71 恒等）**+协调方 EXEC 授权（live spend 授权沿 micro-batch2 件① U2 形·**Ban 未授权抢跑**）；②主收五字段=§1-5 门①…⑤全过+收据留 CMD/EXIT/汇总行原值；③辅收离线单测臂 EXIT=0 双 fresh（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）；④邻面不回退：`scoring-eval:prove`（度量数学）+`scoring-golden:prove` 按届时 SSOT 口径 EXIT=0；⑤任一门红 → §8 停止条件。
5. **键域不变量（设计内自证门）**：规整键全 ASCII+两两唯一+同输入同键断言在辅收臂内；fixture 组 ID 与脚本显示词面零改（`git diff` 词面核）；`scoring-eval.ts:16` 自 skip/`:39` profile 钉值/`:200` 非阻断 exit 语义零动。

## §3 范围外（越界即 FAIL）

1. **registry 契约零触**：`packages/ai-runtime/src/model-operation-registry.ts` 及全 `packages/ai-runtime/src` 零 diff 意向（案(a) 翻案权归协调方·须另刀）。
2. **产品码零触**：`apps/worker/src`/`apps/api/src`/`packages/*/src` 零 diff 意向（EXEC 期仅 `smoke/scoring-eval.ts`+单测臂+注册行·prove-only 形）。
3. **三层 skip 臂+nightly.yml 零触**（§1.3）·**fixture 组 ID 零改**（`scoring-golden.ts` 只读·显示词面=可读性资产）。
4. **共享 SSOT 零改**：gap-bug-backlog（E2EA-01 行翻面权归协调方）/execution-master-checklist/product-campaign-LEDGER 只读引用。
5. **零迁移零配置零 cap 再步进外数值改动**（`MAX_FILES` 恰等步进外 Ban 触 policy 语义面）。

## §4 依赖

**①上游已满足**：缺陷链六环全在树（§0.1/§0.2 blob 亲算）+红停收据在卷（§0.3）+生产面六路 ASCII 钉实证（`contracts:57` 等）+uc003x cap 先形+常设预授权在树。**②同文件并发**：起草 turn 恰 1 新 .md+policy 两件零交涉面（policy 两件在飞线零触碰亲证 §0.0）；EXEC 期触 `smoke/scoring-eval.ts`——在飞 `line/scoring-eval-exec` 已红停不再触该文件（收据卷 diff 恰 2 件亲证）·零重叠。**③下游**：本卷修法 EXEC 绿=E2EA-01 件① 重行使前提兑现（核验刀真跑面由红停转可判·E2EA-01 行翻面权归协调方）；键域规整先形供后继评测刀（qbank-pipeline 等）引用。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban 未授权抢跑真跑（EXEC 期 live spend 须协调方授权+Key 供给·Ban 自造 Key Ban .env* Ban 值入树入据）；Ban retry-to-green（真跑红=信号如实收·attempts 台账·Ban 改断言/改阈值迁就）；Ban 摘三层 skip 臂/continue-on-error；Ban 触 registry 契约/产品码/迁移/共享 SSOT/fixture 组 ID；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 发明金额（`actualSpendCny=null` 保持·收据只记调用计数/时长·金额入账须协调方另给计价依据）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · **actualSpendCny=null（EXEC 真跑面亦保持·调用计数如实·不发明金额）**。

## §6 est live（起草 turn=0·EXEC 期>0·量级披露沿 E2EA-01 五调用先例）

- **起草 turn（本 commit）**：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗。
- **EXEC 期披露**：est live=**>0**·量级=模型路由评测请求 **71**（分母恒等不缩·`:67-70` 确定性短路 return 先于 `:71 evaluationRequests++`·71 系派发界分母·66 系重复扣减）×每请求恰 1 dispatch（`maxDispatches:1` 冻结+quote 二次调用固定 0·收据原值「quote 二次调用 0（固定）」）·**计费上界=71 dispatch（`unknown` 冻结零重试 `invoke.ts:7`）**；模型=qwen-turbo 快模型（`:40` 生产正常路径·failover 备援零加价面）·**分币级**（E2EA-01 红跑先例：5 次调用实发·qwen-turbo 单价量级）；`actualSpendCny=null` 保持（无计价数据源·No invented spend）·以收据实测调用计数为准·超协调方预算即停如实记中止（不洗 not_run）。

## §7 markers=0（卫生声明）

本刀改动集（起草 turn 3 tracked：本卷 1 .md+policy 两件）五类标记词 + 行首冲突标记 grep **零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装口径 `i6-239-gates.proof.mjs:154/:163`·不复抄卷内防自指——沿批 C §7 同形制）。

## §8 STOP（三处 draft + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual`（三处钉：本节+Status 头+卷尾·同值零翻）· alone≠dual · 开工三条款（EXEC 期）：①pre-exec 双审 BOTH PASS 落卷 ②协调方明示 EXEC 授权+live spend 授权（§6 量级披露承审）③§1 修法面/§5 Ban/pins/§1.3 否决面零改动·§0 对开工 tip 全量重 pin。** 停止条件（四类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（`:214` 白名单或 `:295` fail-closed 语义被他刀改写 · 构造点 `:74` 漂移 · fixture 组 ID 改写 · policy cap 值被他刀步进·`line/scoring-eval-exec` 并线改收据锚）→ 停·重 pin 回炉。
- **机制不满足**：**按因分布归因**——EXEC 真跑 `model_operation_revision_invalid` 仍>0 → 根因诊断被证伪 → 停·如实升级；`model_operation_revision_invalid`=0 且跳过率仍高/100% → 键域修法已证·失败族按 reason 分布归因（`external_outcome_unknown`/`model_circuit_open`=供应商/熔断族·红跑当日复现时 5 连击落头 5 dispatch 会级联罩全部 71 请求）→ **改期重行使**（非归因证伪·如实收红·**红=信号诚实保留·Ban retry-to-green·Ban 改阈值洗 inconclusive**）。
- **越界需要**：修法诉求超出 `smoke/scoring-eval.ts` 构造点面（需触 registry 契约/生产码/迁移/cap 恰等步进外数值/共享 SSOT）→ 停·另刀或协调方裁决（案(a) 翻案同此通道）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check 超 cap 且步进预授权不覆盖 / 邻套件新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（2026-10-26 起草落卷·docs-only 恰 3 tracked 零产品码·cap 2420→2421 随刀恰等步进承登 §2-1·起草门 4 门亲跑全绿 §2·est live=0·markers=0·EXEC 未派·pre-exec 双审未行使·本 commit 不预 claim 任何 EXEC EXIT）· 状态翻面权归协调方 · 并线 PR 走 main（终验后 push 权归协调方·⛔push）。

---

*SCREG REQUEST · 2026-10-26 起草 · **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行）· E2EA-01 件① EXEC 红停（`line/scoring-eval-exec` @`bed65e869`·71 请求 100% transient·主因 `model_operation_revision_invalid` 58=显式 54+MI clean base 静默 4）浮出真缺陷=registry businessRevision ASCII 白名单（`model-operation-registry.ts:214`+fail-closed `:295`）× scoring-eval 样本基键中文组 ID（`scoring-eval.ts:74` 构造点×`scoring-golden.ts` 十四中文组 ID）· 调用方义务面自证（`interview-service.ts:317-320` 约束存档注记）· 修法=案(b) 基键规范化 sha256hex 全长（ASCII+确定性+唯一性+152≤256 长度界·构造点唯一落点·fixture 显示词面零触）· 案(a) registry 键域扩展否决留痕（九 src+五 proof 触面+model-op-registry-v1 冻结契约+四件规范化决策面·翻案权归协调方 §1.3）· 生产六路 ASCII 钉零涉亲证（`contracts:57` questionId regex 为锚）· 修法 proof 双收=真跑重行使（主收·五字段门 §2-4）+离线单测臂（辅收·双 fresh）· est live 起草=0/EXEC>0（71 请求×1 dispatch·计费上界=71 dispatch·`unknown` 冻结零重试 `invoke.ts:7`·qwen-turbo·分币级沿五调用先例·actualSpendCny=null 不发明金额）· cap 预算核=2420 恰等零余量+本卷必超→2420→2421 随刀恰等步进（uc003x 起草刀先形+常设预授权在树·越限臂四联动点 `public-text-policy.proof.mjs:399/:406/:409/:412` 恰等改）· 起草 commit 恰 3 tracked（本卷+policy 两件·偏离批 C「恰 1」形如实承登 §2-3）· 分支 `line/screg-draft` · 工作树 `meetwise-screg` · 基线 `origin/main` @`7c5aa7445` · pins 十一值零翻 · markers=0 · alone≠dual · ⛔push*
