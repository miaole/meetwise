# HMAC-CONSOLIDATE REQUEST — 批5 5A #100「HMAC 合一」普查定谳刀（乙案·文档化不改·三 controller 面异质定谳+env-schema 消费点锚如实化·恰 1 产品文件注释域·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-10-16 EXEC 落卷·§9-EXEC 七字段·九门全绿·merge `46785ad1`·pre-exec 双审会签 PASS（席1 agent_729de754 rev 六项勘误落卷+席2 agent_1cda42f1 rev 复审确认会签）+协调方 EXEC 授权后开工·post-prove 双审两外席待派 · alone≠dual · Ban self-approve · ⛔push · est live=0 · `actualSpendCny=null`）

**席位**：HMAC-CONSOLIDATE 起草席（批表盘点席 b 类 #100 列名承命·协调方派单 brief 2026-10-14「批表 #100=HMAC 面散布 principal.guard/env-schema/commerce 三 controller 未合一——统一 HMAC 工具面收敛」）。

**基线**：`feat/mysql-schema-skeleton` @ `d186dffc`（fetch 后 `origin/feat/mysql-schema-skeleton` tip 亲证同值=E2E-RUNNER-STALE-BUILD-GUARD nail 收官 SSOT commit·integrity nail 波 tip 恰等下界·docs:check 2160≤cap 2176 该卷序 4 承登）· 分支 `line/hmac-consolidate`（本起草席 `git worktree add ../meetwise-hmac -b line/hmac-consolidate origin/feat/mysql-schema-skeleton` 亲立·HEAD 落 `d186dffc` 亲证·建前 `git branch --list "line/hmac*"` 零命中）· 工作树 `meetwise-hmac`（仓根同级·建后 `git worktree list` 34 树中唯一 hmac 树亲证）· **tip pin=d186dffc**。

**立项出处**：①批表盘点席 b 类列名（#100·批5 5A 行 `product-campaign-LEDGER.md:85`「#67 CSP·#100 HMAC 合一·#108/#109 上传守卫（🔒DEPS S3）·#168 G7 拒绝 — 🆕 AUTHZ-HARDEN 刀」未翻面残件）；②协调方派单 brief（任务书·候选甲/乙/丙裁决权授予起草席「以实测定谳」）；③AUTHZ-HARDEN 5A-2 nail 先例卷（`4a5528a5`·簇④ #100 面=e2e 助手 commerce.ts 四段式+verifyCommerceSig 单源·恰 3 文件零产品码——本刀为该面之后的**产品码侧普查定谳残件**）；④必读清单（EXEC 席开工前全读）：本卷 + `ai-docs/delivery/harness/TASK-SOP-v2.md` + 仓根 `AGENTS.md` + `apps/api/src/platform/env-schema.ts`（修法点本体）+ `apps/api/src/modules/commerce/commerce.service.ts`（verifyCommerceSig 单源）+ `packages/domain/src/auth.ts`（token HMAC 共享 util 既有）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`d186dffc`·**EXEC 立项照本节对届时 tip 再重 pin**——行号漂移如实改锚·结论不变只更行号）

### 0.0 防重双对表 + 在飞交叠预扫（起草日亲扫）

- `git branch --list "line/hmac*"` 建前零命中→落卷后唯一同名分支=本支；`ls ai-docs/delivery/harness/` 建前 `hmac-consolidate` 零命中→落卷后唯一同名卷=本卷。
- **本刀唯一产品触面（`apps/api/src/platform/env-schema.ts`）在飞交叠全量预扫**（全 `line/*` 分支逐支 `git log -1 --format=%h <branch> -- <该径>` 取末触 commit + `git merge-base --is-ancestor <末触> d186dffc` 判吸收态·起草日亲跑）：全分支末触皆 `940bd5b5`（基线祖先·EXIT=0 亲证）——**零 novel 在飞触面**；EXEC 立项日重扫出现新增 novel 触者→触停止条件「现场漂移」停手上报。
- **EXEC 立项重 pin 清单（三项必做·漏做即未完成立项）**：①docs:check 预期值随届时基线适配（基线时值 2160≤cap 2176·本卷 +1 .md 后预期 2161·届时以实测为准·>cap 红停）；②lint 判据随届时各 workspace `package.json --max-warnings` 现值适配（基线时值 root 5235/web 601/api 1421/db 1042·本卷 §2-5 所钉系 `d186dffc` 时值）；③neg:bend 臂数随 `line/admin-disable-evict` 并线态适配（基线时值 **179/179**·rev P2-5 勘误：ade 增臂 `32b50110` 已在 `d186dffc` 祖先链非在飞·merge-base --is-ancestor EXIT=0 亲证·届时并线再 +1 则照 180 判·两态各自恒等自洽保留为前瞻）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`d186dffc`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/api/src/platform/env-schema.ts` | `75bd3790`（126 行） | **`:40-41` AUTH_SECRET 声明行+消费点锚行（4 锚全漂·本刀件① 修法点·逐字原文见 §1-修法）**·`:6` 历史叙述锚（「此前…auth.service.ts:57…principal.guard.ts:52…」系审计 #91 时点快照·过去时语境·零改）·`:49` zod T1 `AUTH_SECRET: nonEmptyAfterTrim`·`:42-:48` 数据库五件套面（零触） |
| `apps/api/src/platform/principal.guard.ts` | `50b38bc5`（112 行） | `:8`/`:11` 头注自证「HMAC 签名会话令牌」语义·**:66-70 `authSecretCandidates()`（`:67` `process.env.AUTH_SECRET ?? ''`+`:68` `AUTH_SECRET_PREVIOUS` 逗号分隔旧钥窗·逐请求读 env）**·`:85-91` 逐候选 `verifyTokenFull`（`@meetwise/domain` 委托·`:91` 全不符 401 invalid_token）——**零 createHmac 计算面（rg 亲证）** |
| `apps/api/src/modules/commerce/commerce.service.ts` | `ae748ce0`（283 行） | **`:26-39` `verifyCommerceSig` #100 HMAC 验签单源（`:32` `process.env.PAY_PROVIDER_SECRET ?? ''`·`:33` `createHmac('sha256', secret).update(\`${id}:${body.providerTxn}:${kind}:${ts}\`).digest('hex')`·`:34-35` 等长+`timingSafeEqual` 恒时序·缺钥 403 fail-closed）**·`:17-24` 头注自证「原 :87/:105/:135 三份复制块收敛于此」+「隐私面零关：privacy.service preview digest 为异用途，不经此函数（席 1 边界·零触）」·`:26` `PAY_SIG_REPLAY_WINDOW_SECONDS=300` |
| `apps/api/src/modules/privacy/privacy.service.ts` | `9aa3f406`（178 行） | `:104-108` `hashPreviewIdempotencyKey`（`:105` `PRIVACY_ERASURE_IDEMPOTENCY_HMAC_KEY ?? AUTH_SECRET` 回退序·`:106` 缺钥 503 `privacy_preview_hmac_unavailable` fail-closed·`:107` `createHmac('sha256', secret).update(\`privacy-preview:${raw}\`).digest('hex')`）——**api 内第四 HMAC 面·5A-2 席 1 边界明裁异用途零触（本刀同裁定承卷·零改）** |
| `packages/domain/src/auth.ts` | `697da7dc`（109 行） | `:74` `signToken`（`createHmac('sha256', secret).update(payload).digest('base64url')`）·`:90` `verifyTokenFull`（同构 expSig 恒时序比对）·`:58-60` `keyIdFor`（`:59` sha256 前 8 hex 密钥指纹·kid 窗）——**token 面 HMAC 共享 util 既有形态**（签发消费=`apps/api/src/platform/auth-session.ts:40/:43`·验签消费=`principal.guard.ts:88`·间接消费=`auth.service.ts:115`/`profile.service.ts:150`）（rev P1-3 勘误·原 `:103 keyIdFor` 锚漂·`:103` 实为 index.ts 导出行） |
| `e2e/helpers/commerce.ts` | `6aa602da`（65 行） | `:26-40` 四段式单源（`:27` `paidWebhookCanonical` 形校验·`:38-39` `createHmac('sha256', secret).update(canonical).digest('hex')`·`:57-58` ts 单次绑定防跨毫秒撕裂）——**5A-2 @`8a8633ce` 交付的 e2e 镜像单源（零产品码先例形）** |

### 0.1-HMAC 全仓普查表（定谳证据本体·产品码实现面 `createHmac` 位点 rg 全量亲证 @`d186dffc`·测试/镜像面另列）

**词面普查口径**：`rg -n "createHmac" --type ts apps packages scripts` 全仓命中 66 行·剔测试/proof/spec/evidence/镜像面后**产品码实现面 18 位点·16 文件**·分解式=api 2/domain 2/db 10/ai-runtime 2/worker 2（=18）·**全数 sha256（18/18·rg 逐行亲证）·密钥源 12+ env 键互异·编码形 3（hex/base64url/base64url 截断）+截断 2（slice(0,32)/slice(0,20)）·载荷框架 5 形并存**（rev P1-1/P1-2 勘误后重数·原 16 位点/14 文件三套数互斥已消·见 §9）。

| # | 位点锚（file:line） | 算法 | 密钥源 | 编码/框架 | 用途 |
|---|---|---|---|---|---|
| 1 | `commerce.service.ts:33`（#100 点名·commerce 面） | sha256 | `PAY_PROVIDER_SECRET`（`:32`·缺钥 403 fail-closed） | hex·四段式 `${id}:${txn}:${kind}:${ts}`+±300s 防重放窗+恒时序 | 支付回调验签（**5A-2 已单源**·原三份复制块收敛） |
| 2 | `privacy.service.ts:107`（**第四处**·api 内） | sha256 | `PRIVACY_ERASURE_IDEMPOTENCY_HMAC_KEY ?? AUTH_SECRET`（`:105` 回退序） | hex·`privacy-preview:` 前缀串 | 预览幂等键摘要（5A-2 席 1 边界明裁异用途·零触） |
| 3 | `domain/auth.ts:74` | sha256 | 调用方传 secret（=`AUTH_SECRET`·auth-session.ts:40） | base64url·`payload.sig` 对偶 | 会话令牌签发（**token 面共享 util 既有**） |
| 4 | `domain/auth.ts:90` | sha256 | 同上（+`AUTH_SECRET_PREVIOUS` kid 窗·guard.ts:67-68） | base64url·恒时序 | 会话令牌验签（principal.guard **零计算·纯消费面**） |
| 5 | `db/context/ctx03-event-source.ts:48` | sha256 | `CONVERSATION_EVENT_HMAC_SECRET`（requireSecret·dev 兜底） | hex·utf8 串 | 会话事件源完整性 |
| 6 | `db/resume/resume.ts:31` | sha256 | `RESUME_HASH_SECRET` | hex·utf8 串 | 简历内容摘要（幂等锚） |
| 7 | `db/transcript/int-transcript.ts:47` | sha256 | `INTERVIEW_ANSWER_HMAC_SECRET` | hex·utf8 串 | answer body 完整性（SCOR-01 契约） |
| 8 | `db/routing/job-route-decision.ts:43` | sha256 | `RAG_JOB_ROUTE_INPUT_HASH_KEY`（≥32·缺即 throw） | hex·`JSON.stringify({v:INPUT_HMAC_VERSION,…})` 规范形 | 路由输入指纹 |
| 9 | `db/routing/free-text-route-decision.ts:54` | sha256 | `RAG_FREE_TEXT_ROUTE_INPUT_HASH_KEY`（≥32） | hex·同 :8 规范形 | 自由文本路由指纹 |
| 10 | `db/qbank/qbank-retrieval-cache.ts:137` | sha256 | `RAG_QBANK_CACHE_HASH_KEY`（≥32·**专用键·Ban 回退 auth/model 键** `:129` 注释自证） | hex·JSON 规范形 | 检索缓存身份铁律 |
| 11 | `db/qbank/qbank-route-scope-cache.ts:64` | sha256 | `RAG_QBANK_CACHE_HASH_KEY`（同键复用 `:81/:89`） | hex·JSON 规范形 | 路由作用域缓存身份 |
| 12 | `db/qbank/qbank-embedding-compute-cache.ts:185` | sha256 | `RAG_QBANK_COMPUTE_CACHE_HASH_KEY` | hex·JSON 规范形 | embedding 计算缓存键（HMAC(scope+recipe+SHA256(input)) 铁律） |
| 13 | `db/qbank/qbank-embedding-compute-cache.ts:206` | sha256 | `RAG_QBANK_COMPUTE_CACHE_VALUE_HASH_KEY` | hex·JSON 规范形 | 计算缓存值键（键/值分键双锚） |
| 14 | `db/privacy/uc052-internal-erasure.ts:64` | sha256 | `keyHash`（运行时派生·非 env 直读） | hex·`${interviewId}:${sink}:${requestId}` | 抹除 permit 摘要 |
| 15 | `ai-runtime/langfuse-v5.ts:52` | sha256 | 运行时注入 secret | base64url·`\u0000` 域分隔链·**slice(0,32) 截断** | 观测侧稳定假名（非授权键·`:54` 注释自证） |
| 16 | `ai-runtime/online-judge-sampling.ts:25` | sha256 | 运行时注入 secret | hex·`\u0000` 域分隔（policyVersion/stratum/attemptId 链） | 在线判题 lot 抽签秩·经 ai-runtime index `index.ts:149` 导出（rev P1-1 补行） |
| 17 | `worker/cloud-readiness.ts:270` | sha256 | `CLOUD_TEST_RECEIPT_HMAC_KEY`（≥32·`:199-200` 校验） | hex·**slice(0,20) 指纹截断** | 云测回执指纹 |
| 18 | `worker/cloud-test-run-ledger.ts:59` | sha256 | 同键（receiptHmacKey 注入） | hex·stableJson 规范形 | 云测台账回执 MAC（防篡改）（原 #16b·rev 重标） |

**测试/镜像面（词面在·实现面为镜像非产品·零改）**：`e2e/helpers/commerce.ts:38-40`（四段式单源·5A-2 交付）+`e2e/full.e2e.ts:557`（错签/未知单臂携新鲜 ts）+`apps/web/e2e-ui/voice-duplex.spec.ts:41`+`recruiting-bound.spec.ts:91/:111`+`uc018-abandon.spec.ts:40`（三 spec 各自镜像四段式·`PAY_PROVIDER_SECRET ?? 'e2e-pay-secret'`）+`apps/api/test/_neg-harness.ts:17`（`paySig`·PAY_SECRET 注入 `:53`）+`validate.ts:492`+`authz5a2-hmac.proof.ts`（钉形 proof）+`uc-e2e-011-report-refund-http.proof.ts:235/:324`（fresh ts 语义臂）+`apps/api/test/_neg-harness.ts:235`（SQL 侧 `hmac()` 内存事实围栏·PG pgcrypto·异机制零触）+`scripts/lib/uc018-receipt-backfill-guard.mjs:142/:166`（**分类注记=工具验签面·非产品码非镜像**·uc018 回执 backfill 守卫 verify/attach 双向 `createHmac('sha256', key)…digest('hex')`·rev P2-4 增注·零触不变）。

**共享工具层现状（packages/*/src 有无 hmac utils）**：`packages/{ai-graphs,ai-runtime,config,contracts,db,db-mysql,domain,errors,qdrant-store}/src` **零 hmac util 文件**（find+rg 文件名/词面双查零命中）——但 token 面已有事实共享 util=`packages/domain/src/auth.ts`（signToken/verifyTokenFull/keyIdFor 对偶单源·经 `@meetwise/domain` `index.ts:103` 导出行·全仓唯二消费）；其余各面密钥/框架/截断各异且各自内聚（db 缓存族同键复用已内聚于本包）。

### 0.2 派单简报漂移登记（结论零变或方向反转如实改锚）

1. 简报「principal.guard/env-schema/commerce 三 controller」：实测**三面无一为 NestJS controller 类**——principal.guard=`CanActivate` 守卫；env-schema=启动期 zod 校验层（`main.ts:104-106` 调用·非 controller）；commerce 面 HMAC 本体在 service（`commerce.service.ts`·controller 仅薄解析层：`commerce-webhook.controller.ts:14-15/:22` 与 `payment-callback.controller.ts:18` 注释自证透传 `verifyCommerceSig`）。结论（三面 HMAC 语义存在且互异）零变·载体名词如实化。
2. 简报「三 controller 未合一」：**普查证伪（方向反转=本刀定谳本体）**——三面间无「同算法同密钥源复制块」：principal.guard 零计算（纯消费·实现面在 domain util）；env-schema 零计算（声明+锚面）；commerce 单点计算且**已单源**（5A-2 @`d1e2a363`/`8a8633ce` 原 :87/:105/:135 三份复制块收敛 `verifyCommerceSig`）。真重复早在真重复处收敛完毕；「未合一」的仅是「跨域通用 util 不存在」——而异质定谳（§1.2）=不应存在。
3. 简报「行数/触面估计」：乙案 EXEC 触面=**1 产品文件注释域 2→3 行（净 +1 行·零 import 零逻辑零行为）**+本卷 .md；est live=0；零迁移。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**204**·头 `0204_ai_cost_cached_input_price.sql`。本刀=注释域如实化+普查落卷·**预期零迁移零 DDL**；EXEC 期若实测产生非预期迁移需求→停（越界需要类）上报·认领号照届时链顶亲数顺延·Ban 抢号。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 三面实态（批表 #100 点名面逐面亲证）

- **principal.guard 面**：零计算面。令牌 HMAC 语义由 `@meetwise/domain` `verifyTokenFull`（`697da7dc:90`）承载；本文件职责=候选钥序（`:66-70`·AUTH_SECRET+PREVIOUS kid 轮换窗·5A-1 #35 交付）+逐候选验签（`:85-91`）+吊销三查（`:93-99`）。轮换窗语义（kid 匹配者胜·移除即窗外 401）系**auth 域安全契约**，与支付/隐私域无涉。
- **env-schema 面**：零计算面。T1 必需键启动 fail-fast 校验（`:49`）+AUTH_SECRET 语义声明与消费点锚（`:40-41`）。**4 个消费点锚全漂**（实测对照）：`auth.service.ts:57`→现行真值 `auth-session.ts:40`（issueSessionToken 签发单源·auth.service `:115`/profile.service `:150` 系经其间接）；`principal.guard.ts:52`→现行真值 `principal.guard.ts:67`（authSecretCandidates·5A-1 kid 窗改写致漂）；`profile.service.ts:111`→现行真值 `profile.service.ts:150`（间接）；`privacy.service.ts:74`→现行真值 `privacy.service.ts:105`。锚漂=5A-1/UNSTUB 域重构后锚未随翻·**唯一可行动作面**。
- **commerce 面**：单计算位点已单源（`:26-39` verifyCommerceSig·5A-2 #100 交付·ts 防重放窗+恒时序+kind 入签+缺钥 fail-closed 四重契约自洽）；e2e 镜像亦单源（`6aa602da:26-40` 四段式·5A-2 @`8a8633ce`）。**本面无残重复可收。**

### 1.2 定谳链（候选甲/乙/丙裁决·任务书「以实测定谳」行使）

**定谳=候选乙（文档化不改）**。判定规则「三处实为同算法同密钥源仅代码重复→甲；异质→乙+理由」实测行使：

1. **算法同**：三面（及全仓 18 位点）全 sha256——唯一同质维度。
2. **密钥源三面三异**：`AUTH_SECRET`+`AUTH_SECRET_PREVIOUS`（kid 轮换窗·会话信任域）vs `PAY_PROVIDER_SECRET`（支付 provider 信任域·防重放窗）vs env-schema（无密钥·声明面）。全仓 12+ env 键互异（§0.1-HMAC 表密钥源列）——「同密钥源」前提**不成立**。
3. **载荷框架即安全契约非重复**：base64url `payload.sig` 对偶（token）/四段式冒键 hex+ts 窗（commerce）/`privacy-preview:` 前缀 hex（privacy）/JSON 规范形（db 缓存族）/\u0000 域分隔链+截断（观测假名）——五形各有域分隔/防重放/规范序列化语义，**非可互替的代码重复**。
4. **甲案否决实质**：新建共享 hmac util 只能得到 `createHmac('sha256', k).update(x).digest(enc)` 一行包装——零去重收益（无重复可去）+把 kid 轮换窗/防重放窗/回退序三种互异契约藏进单一函数签名=逐处保真反而失真+新增 api→新包（或 domain 包扩面）依赖边=**强行合一反而造耦合**（任务书乙案触发条件原文兑现）。
5. **真重复已收敛先例在链**：commerce 内三份复制块→verifyCommerceSig（5A-2 产品码零触的 e2e/注解面收敛）；token 面 domain util 自始单源。本刀普查表（§0.1-HMAC）即「HMAC 工具面」文档化 SSOT=**乙案交付本体**；env-schema 4 锚如实化=唯一残缺陷行使面（件①）。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选乙（采纳）**：文档化不改——普查表落卷（§0.1-HMAC·随本卷）+env-schema `:40-41` 消费点锚如实化（件①·注释域零行为）。
- **候选甲（否决·Ban）=新建共享 hmac util+三面改引**：密钥源三异+框架即契约+零重复可收（§1.2-2/3/4）——强行合一造跨信任域耦合·否决。**Ban EXEC 期新建任何 `*hmac*` util 文件或给 domain 包扩 HMAC 面导出。**
- **候选丙（否决）=仅修锚不落普查表**：普查表即批表 #100「工具面收敛」乙案的本体交付（无表则定谳无载体·盘点席 b 类行无翻面证据）——半丙不完整·否决。
- **候选丁（否决·Ban）=回改 `:6` 历史叙述锚**：「此前…auth.service.ts:57…principal.guard.ts:52…」系审计 #91 时点快照的过去时问题陈述（修复口径叙事·非现行消费点地图）——历史锚如实保留·回改=洗历史·否决。
- **候选戊（否决·Ban）=第四处 privacy.service.ts:105-108 一并「收敛」**：5A-2 席 1 边界明裁异用途（`ae748ce0:24` 注释自证）+专用键优先 AUTH_SECRET 仅回退的 fail 语序系隐私域契约——乙案定谳对其同样成立·零触。

## §1-修法（乙案行使面·恰 1 产品文件注释域 + 本卷普查表·零迁移零 DDL）

- **件①（EXEC 唯一产品码改·`apps/api/src/platform/env-schema.ts` 现 `75bd3790`·` :40-41` 两行整行替换为三行·净 +1 行·零 import 零逻辑零行为）**——`:40-41` 现文逐字：
  ```
   *  - AUTH_SECRET：登录令牌 HMAC 密钥（消费点 auth.service.ts:57 / principal.guard.ts:52 /
   *    profile.service.ts:111 / privacy.service.ts:74 回退）。缺失 = 认证全瘫。
  ```
  替换为（逐字·四锚换现行真值+载体点名）：
  ```
   *  - AUTH_SECRET：登录令牌 HMAC 密钥（消费点 auth-session.ts:40 issueSessionToken 签发单源（auth.service.ts:115
   *    / profile.service.ts:150 经其间接）/ principal.guard.ts:67 authSecretCandidates 候选钥序（+AUTH_SECRET_PREVIOUS
   *    kid 窗）/ privacy.service.ts:105 回退）。缺失 = 认证全瘫。
  ```
  （改后四锚=§1.1 env-schema 面现行真值逐项亲证同源；**:40-41 域外本文件零字节改**·Ban 顺手重排/Ban 触 `:6` 历史锚（候选丁否决）。）
- **件②（SSOT 落卷·随本起草 commit 已落）**：本卷 §0.1-HMAC 全仓普查表=批表 #100「统一 HMAC 工具面收敛」乙案定谳载体与 HMAC 面文档化 SSOT（18 位点/16 文件/全 sha256/密钥源+框架逐处保真登记·rev P1-1 重数）；翻面权（LEDGER :85 5A 行 #100 计件）**归协调方**·本刀不代翻不代 nail 排序。
- **件③（diff 预期）**：起草 commit=本卷恰 1 tracked .md；EXEC 落卷 commit=件① 恰 1 .ts（+2/−2→净 +1 行注释域）；分支对基线终态=**恰 2 tracked 路径**。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵九门·数字口径以实跑实测为准·受影响三面各自 prove/neg 面全行使）

1. **commerce 面 prove/neg**：`pnpm -C apps/api neg:commerce` EXIT=0（**90 臂**·计形口径=非注释行 `A(` 调用数=90（rg 亲数：含 `A(` 行 92−注释行 2=`:438` 文字 ORD_A( 与 `:679` 尾注）·文件尾 `:679` 统计注释同数仅自述非计形依据·rev P2-6 勘误）+`pnpm -C apps/api authz5a2:hmac` EXIT=0（**20 臂** rg 亲数·届时实测为准）+`pnpm uc011:report-refund:http:prove` EXIT=0（**53 臂**·隔离 runner·5A-2 ea35b27b 修至口径）+`pnpm e2e-helpers:prove` EXIT=0（**28 断言**·5A-2 merge 后复验同口径）——注释域改动零行为·四门恒等基线·任一臂翻红即停（验收红不可修类）。
2. **principal.guard 面 prove/neg**：`pnpm -C apps/api neg:bend` EXIT=0（基线时值 **179/179**·rev P2-5 勘误：ade 增臂 `32b50110` 已在 `d186dffc` 祖先链非在飞（merge-base --is-ancestor EXIT=0+`neg-bend.proof.ts` 尾注「共 179 条…+admin-disable-evict 增臂 1」+非注释行 `A(` 亲数 179 同值）·届时并线再 +1 则照 **180/180** 判·两态条款保留为前瞻·§0.0 重 pin ③）+`pnpm -C apps/api prove:api-harden` EXIT=0（**31 臂**·jti/evict 面不回退）。
3. **env-schema 面 prove**：`pnpm -C apps/api prove:env-schema` EXIT=0（**22 臂**·api-harden 卷承登口径）——件① 注释改不触 schema 断言面·恒等基线。
4. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（**8/8**·0 cached 口径沿 SSOT 门矩阵）。
5. **lint 全绿贴边**：`pnpm turbo lint` 12 任务全绿·判据=各 workspace `package.json --max-warnings` 基线时值 root **≤5235**/web **≤601**/api **≤1421**/db **≤1042**（`d186dffc` 时值亲读·贴边零余量——任一 +1 warning 即红→停止条件「验收红不可修」·Ban 借机消偿 Ban 自升 sanction·消偿归协调方·届时值照 §0.0 重 pin ② 适配）。
6. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned ≤cap **2176**（基线时值 2160=d186dffc 序 4 承登·本卷 +1 .md 后预期 **2161**·EXEC 期以届时实测为准·**>2176 红停上报**·cap 张弛归协调方）。
7. **markers 五类+冲突标记零命中**：本刀改动集（起草=本卷 1 .md；EXEC=+件① 1 .ts）五类标记词（沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·**词面不复抄卷内防自匹配**）+冲突标记 grep 零命中（命令与回执入收据）。
8. **diff 面机检**：起草 commit `git diff --numstat <base>` 恰 **1 tracked 路径**（本卷 .md）；EXEC 落卷后分支对基线终态恰 **2 tracked**=本卷 .md+`env-schema.ts`（+2/−2→净 +1·注释域）——多任何 tracked 路径即停（越界需要类·typecheck 增量副效应 `*.tsbuildinfo` 翻动则 `git checkout` 回滚保本门）。
9. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·零模型外呼（全静态·est live=0）·migrate 链头亲数=**204 头 0204**（届时顺延如实记·**零新迁移**·新迁移出现即停）·`node scripts/check-migration-version-uniqueness.mjs` violations=0。

## §3 范围外（边界清单·越界即 FAIL）

1. **全部 HMAC 实现面零触**：§0.1-HMAC 表 18 位点+测试/镜像/工具面全零字节改（乙案定谳·候选甲/戊否决）——含 verifyCommerceSig/domain auth/privacy preview/SQL 侧 pgcrypto hmac/uc018-receipt-backfill-guard 工具验签面。
2. **principal.guard 与 env-schema 逻辑面零触**：件① 限 `:40-41` 注释域·`:6` 历史锚零触（候选丁否决）·zod schema/校验逻辑零触。
3. **e2e 镜像面零触**：`e2e/helpers/commerce.ts`+三 web spec+full.e2e（5A-2 已收敛面·零改）。
4. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star 只读引用——#100 行翻面权归协调方（件②）。
5. **零迁移零 DDL**（§0.3）·零 CI/wrapper/runner 改·零依赖升级·零新 util 文件。

## §4 依赖

1. **上游已满足**：5A-1 kid 窗（#35）+5A-2 #100 e2e/注解面收敛（@`4a5528a5`）+UNSTUB 域 auth-session 单源化均在链（`d186dffc` 亲证）——本刀三面实态即其后续；env-schema 锚漂系该等重构的未随翻残面=本刀行使对象。
2. **同文件在飞**：§0.0 预扫零 novel 触者（`env-schema.ts` 末触 `940bd5b5` 全分支基线祖先亲证）；EXEC 立项日重扫必做。
3. **下游**：普查表为后继 HMAC 域任何刀的引用底图（只读）；#100 翻面/nail 排序归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§2 九门红不重跑冲销）；Ban 翻 pins（十二值+`actualSpendCny=null` 脚注·零翻转）；Ban 触任何 HMAC 实现面（§3-1·候选甲/戊否决）；Ban 新建 `*hmac*` util 文件或 domain 包 HMAC 扩面（候选甲否决）；Ban 触件① `:40-41` 域外任何字节（含 `:6` 历史锚·候选丁否决）；Ban 顺手重排/重格式化 env-schema 其余行；Ban 改共享 SSOT（§3-4）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因新红（任一门新红→如实登记升级·Ban 借机修·含 Ban 借机消偿 lint·sanction 归协调方）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十二值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · env-schema.ts blob=`75bd3790`（件① 落点 `:40-41` 原文逐字承 §1-修法）· docs cap=2176/基线现值 2160 · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑模型外呼零 Key 加载（docs:check/markers 为本地静态机检）·零生产操作·零 secrets·零消耗；EXEC 期 §2 九门亦全离线静态/隔离（est live=0·本卷 §2-9 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词+冲突标记 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·不复抄卷内防自匹配——沿 admin-disable-evict/authz-harden 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `executed:awaiting_post_prove_dual` · alone≠dual。**（2026-10-16 EXEC 翻面·§9-EXEC 七字段·九门全绿·merge `46785ad1`·post-prove 双审两外席待派） 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.2 乙案定谳与 §5 Ban/pins 与 §1-修法件① 唯一注释域改面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·**§0.0 重 pin 清单三项必做**·§0.0 在飞交叠重扫必做·§0.2 简报漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且 §1.1/§1.2 结论受疑（env-schema ≠`75bd3790`/authSecretCandidates 或 verifyCommerceSig 换形/普查表任一行被证伪）→停·重 pin 回炉。
- **机制不满足**：届时树查出「同算法**且**同密钥源复制块」（甲案前提成立=乙案定谳被推翻）或 §0.1-HMAC 表外涌现 api 内第五 HMAC 计算面→停·如实升级协调方回炉改甲/扩面（Ban 就地改定谳）。
- **越界需要**：EXEC 诉求超出「件① env-schema.ts `:40-41` 注释域+本卷 SSOT」面（需触任何实现面/import/其他文件/新 util）→停·另刀或协调方裁决。
- **验收红不可修**：§2 九门任一门红且根因不在本刀交付面（lint 贴边 +1 warning/docs:check 超届时 cap/邻 proof 翻红/迁移链新迁移）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 rev 处置摘要（席1 `agent_729de754` FAIL P1×3+P2×3 落卷·2026-10-16·append 注记形·上文除六项指定勘误面外零字节改）

六项勘误全部行使·本卷 STOP 终态维持 **`draft:awaiting_pre_exec_dual`**（Status/§8/卷尾三处零触·rev 落卷后席 1 复审确认方会签·Ban self-approve 不变·Dual PASS ≠ 开工不变）。逐条处置（落点行锚为 rev 落卷后本卷行号）：

- **P1-1（普查表补行+总量重数）**：§0.1-HMAC 表补 **#16 行 `ai-runtime/online-judge-sampling.ts:25`**（sha256·运行时注入 secret·hex·`\u0000` 域分隔（policyVersion/stratum/attemptId 链）·在线判题 lot 抽签秩·经 ai-runtime index `index.ts:149` 导出——本席 rg 亲证：该行 `createHmac('sha256', secret).update(\`${policyVersion}\u0000${stratum}\u0000${attempt.attemptId}\`, 'utf8').digest('hex')`·stratum 一致性 throw+秩排序取首同函数亲读）；原 **#16a/#16b 重标 #17/#18**（行内容零字节变·`#` 列即 1..18=18 位点·消 a/b 并号歧义）；总量 **16 位点/14 文件→18 位点/16 文件**·sha256 全数口径 16/16→**18/18**（rg 逐行亲证 18 位点全 `createHmac('sha256'`·全仓词面 66 行不变）；重数落点五处：§0.1 前言·§1.2-1·§1-修法件②·§3-1·卷尾。
- **P1-2（分解式）**：§0.1 前言分解式改「**api 2/domain 2/db 10/ai-runtime 2/worker 2（=18）**」——原分解式（apps/api 2+domain 1+db 7+ai-runtime 2+worker 2·和=14）与表行数（17）与总量声称（16）三套数互斥·本式和=18=表行数=总量·互斥消除（db 10=ctx03/resume/int-transcript/job-route/free-text/qbank-retrieval/qbank-route-scope/qbank-embedding×2/uc052·domain 2=auth.ts `:74`+`:90` 同文件双位点）。
- **P1-3（blob 表 keyIdFor 锚勘误）**：blob 表 auth.ts 行「`:103` `keyIdFor`」→「**`:58-60` `keyIdFor`（`:59` sha256 前 8 hex）**」——本席 grep -n 亲证 `auth.ts:58` 函数行/`:59` `createHash('sha256')…slice(0, 8)`/`:60` 闭括号；`:103` 仅作 `packages/domain/src/index.ts:103` 导出行引用（§0.1 共享工具层行同步标注 index.ts·blob `697da7dc`/109 行复核不变）。
- **P2-4（工具验签面增注分类）**：§0.1 测试/镜像面清单补 **`scripts/lib/uc018-receipt-backfill-guard.mjs:142/:166`**（分类注记=工具验签面·非产品码非镜像·uc018 回执 backfill 守卫 verify/attach 双向 `createHmac('sha256', key)…digest('hex')`·本席 grep -n 亲证两行）·零触不变·§3-1 边界句同步点名。
- **P2-5（neg:bend 基线 178→179）**：§0.0-③/§2-2/卷尾 基线时值 **178/178→179/179**——ade 增臂 `32b50110` 已在 `d186dffc` 祖先链非在飞（本席 `git merge-base --is-ancestor 32b50110 d186dffc` EXIT=0 亲证+`neg-bend.proof.ts` 尾注「共 179 条…i4 nail 合并实跑值+admin-disable-evict 增臂 1」+非注释行 `A(` 亲数 179 同值·注释行含 `A(` 零）·「届时并线再 +1 则照 180 判」两态条款保留为前瞻。
- **P2-6（neg:commerce 计形口径）**：§2-1 计形口径改「**非注释行 `A(` 调用数=90**」（本席亲数：含 `A(` 行 92−注释行 2=`:438` 文字 `ORD_A(` 与 `:679` 尾注=90）·文件尾 `:679` 统计注释同数仅自述非计形依据（原「文件尾断言统计注释自证」口径废）。

**rev 自检（本席亲跑·回执随 EXEC 收据留痕）**：①markers 五类+冲突标记=0（沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·词面不复抄·改动集=本卷 1 .md·hits=0）；②docs:check EXIT=0·scanned **2161**≤cap 2176（协调方上限 2184 同绿）；③diff 面：rev commit 恰 1 tracked .md（本卷）·对基线 `d186dffc` 仍恰 1 tracked .md·零产品码零字节触（§3-1 全 HMAC 实现面+工具面零触仍成立·est live=0）。

## §9-EXEC EXEC 记录（2026-10-16·七字段·头行按项级标签·§0-§8 原文零字节改·append 保史·STOP 三处置定）

**授权链**：pre-exec 双审两独立外席 BOTH PASS 落卷（席1 agent_729de754 rev 六项勘误落卷 `94459f47`+席2 agent_1cda42f1 rev 复审确认会签「rev 确认·双审会签完成·可授权 EXEC」）→ 协调方明示 EXEC 授权（派单五序）→ 本席 EXEC。**§1.2 乙案定谳/§5 Ban/pins 十二值/§1-修法件① 唯一注释域改面零字节零触**（§8 条款③）。

1. **并线**：`git fetch`→`git merge --no-ff origin/feat/mysql-schema-skeleton`·届时 tip=`0d9ad4ac`=archive-expand nail 恰等派单下界（merge-base --is-ancestor EXIT=0 亲证）·ort **零冲突** 32 files +3133/−36（`hmac-consolidate` 侧 2 commit 对并线 66 commit）·冲突沿并集解预置未触发·⛔pull --rebase 未用·merge=`46785ad1`；**并线对件① 落点零触亲证**（merge diff 该径空·`env-schema.ts` blob 对届时树恒等 `75bd3790`）。
2. **§0 全量重 pin（届时树 `46785ad1` 实测）**：blob 表六文件全恒等零漂（`env-schema.ts` `75bd3790` 126 行/`principal.guard.ts` `50b38bc5` 112 行/`commerce.service.ts` `ae748ce0` 283 行/`privacy.service.ts` `9aa3f406` 178 行/`domain/auth.ts` `697da7dc` 109 行/`e2e/helpers/commerce.ts` `6aa602da` 65 行·行数逐件恰等）；**四漂锚现行真值逐一亲证恰等**（`auth-session.ts:40`=issueSessionToken 签发单源函数行/`principal.guard.ts:67`=authSecretCandidates 现钥读行/`profile.service.ts:150`=issueSessionToken 经其间接回签行/`privacy.service.ts:105`=专用键 `?? AUTH_SECRET` 回退序行）——**件① fenced 定稿零改锚**；§0.1-HMAC 普查重数恒等（词面 `rg createHmac --type ts apps packages scripts`=66 行·产品码实现面 18 位点/16 文件逐行亲证·全 sha256 18/18·`apps/worker/evidence/r4-funnel-covered-count-batch2.ts:183` 词面系 evidence 面 `/createHmac/.test()` 正则非实现面）；§0.0 重 pin 三项：①docs:check 届时实测 **2173**（=rev 时 2161+并线携入 12 新 harness 卷·逐卷可数）；②lint 四贴线值本树 `package.json` 亲读=root 5235/web 601/api 1421/db 1042 **与 pin 恰等零漂**；③neg:bend 届时态=**179 口径**（ade `32b50110`=HEAD 祖先 merge-base --is-ancestor EXIT=0·非注释行 `A(` 亲数 179 同值·「并线再 +1 照 180 判」两态条款前瞻未触发）；§0.0 在飞交叠重扫：全 `line/*` 89 支逐支末触皆 `940bd5b5`=HEAD 祖先 EXIT=0·**零 novel**；§0.2 简报漂移复核零新形；§0.3 迁移链头 204 头 `0204` 恰等。
3. **件① 落点（§1-修法·恰 1 产品文件 +3/−2 净 +1）**：`apps/api/src/platform/env-schema.ts` `:40-41` 两行整行替换为三行·**§1-修法 fenced 定稿逐字节落卷**（四锚换现行真值+载体点名）·numstat **+3/−2**（净 +1·卷面件③预估形「+2/−2」系起草记形误差·按 §2「数字口径以实跑实测为准」如实重钉·净 +1 不变）·126→127 行·hunk 恰 `@@ -37,8 +37,9 @@` JSDoc 注释域·`:40-41` 域外零字节·零 import 零逻辑零行为·blob `75bd3790`→`0dc10e7c`。
4. **件② 核对（零额外动）**：普查表 rev 落卷态 @`94459f47` 与届时树逐行核对恒等（18 位点/16 文件/全 sha256/框架五形/测试镜像面含 `uc018-receipt-backfill-guard.mjs:142/:166` 工具验签面分类注记/共享工具层零 hmac util 文件结论）——**EXEC 对表零字节动**。
5. **门矩阵九门全表（EXIT 原值）**：**门1** `neg:commerce` ✓ **90/90 全绿 EXIT=0**+`authz5a2:hmac` ✓ **20 断言 0 失败 EXIT=0**+`uc011:report-refund:http:prove` ✓ **53/53 全绿 EXIT=0**+`e2e-helpers:prove` ✓ **28 scenarios EXIT=0**——注释域改动零行为·四门恒等基线；**门2** `neg:bend` ✓ **179/179 全绿 EXIT=0**（届时并线态照 179 判）+`api-harden:prove` ✓ **31 断言全绿 EXIT=0**（隔离 receipt `.tmp/isolated-proof-receipts/2026-10-16T06-08-18-818Z-…json`·releaseEvidence=false）；**门3** `prove:env-schema` ✓ **22 断言全绿 EXIT=0**（件① 注释改零触 schema 断言面兑现·A/B/C/D 四面直跑 PASS+隔离 runner 全量行使）；**门4** `pnpm turbo typecheck --force` ✓ Tasks: **8 successful, 8 total** EXIT=0；**门5** `pnpm turbo lint --force` ✓ **12 successful, 12 total** EXIT=0·四贴线逐 workspace 直跑亲数恰等贴线（root 5235/web 601/api 1421/db 1042 warnings·0 errors·零 +1）；**门6** `node scripts/ai-docs/check-docs.mjs` ✓ EXIT=0 **scanned 2173 ≤ cap 2184**（协调方 sanctioned cap·余量 11）；**门7** markers 五类（`scripts/i6-239-gates.proof.mjs` §2-7 运行时组装四词+冲突标记对·词面不入卷防自匹配）改动集两件 grep **hits=0**（卷尾终扫随落卷前复行使同值）；**门8** diff 面（落卷后对基线 `d186dffc`）恰 **2 tracked**=本卷 .md+`env-schema.ts`·typecheck 副产 `apps/web/tsconfig.tsbuildinfo` 1 翻 `git checkout` 回滚保门（§2-8 预置条款行使·沿先例形）；**门9** `pnpm install --frozen-lockfile` ✓ EXIT=0 零 lockfile 改+`.env*` ABSENT（find=0 双向记录）+迁移链头 204 头 `0204` 恰等零新迁移+`node scripts/check-migration-version-uniqueness.mjs` ✓ violations=0。**行使形登记**：门1a/2a/3/门1c/2b 卷面直跑形（`pnpm -C apps/api …`）在裸 worktree 无隔离 DATABASE_URL 必红（`env_schema_invalid:database_target_missing`@boot·首试即定性=环境整备非基线红·门1b/1d 直跑绿不在其列）——沿仓注册形与本仓 neg:all 先例行使形改沿隔离 runner 包裹（根 `pnpm neg:commerce`/`neg:bend`/`uc011:report-refund:http:prove`/`env-schema:prove`/`api-harden:prove`=`scripts/run-e2e-isolated.mjs` 一次性 fixture·臂计形口径不变 90/179/22/53/31 逐值亲数恰等·非 retry-to-green：红臂定性为供给缺件·同一臂集换注册行使形首跑即绿）。
6. **est live=0**：九门全离线静态/隔离（隔离 runner=一次性本地 fixture 容器·零模型外呼零 Key 值接触零生产操作）·`actualSpendCny=null`·确切命令行 verbatim：`git fetch`+`git merge --no-ff origin/feat/mysql-schema-skeleton`+`pnpm install --frozen-lockfile`+`pnpm neg:commerce`/`pnpm -C apps/api authz5a2:hmac`/`pnpm uc011:report-refund:http:prove`/`pnpm e2e-helpers:prove`/`pnpm neg:bend`/`pnpm api-harden:prove`/`pnpm env-schema:prove`（+直跑对照 `pnpm -C apps/api prove:env-schema`）+`pnpm turbo typecheck --force`+`pnpm turbo lint --force`（+四贴线 workspace `pnpm -C <ws> lint` 亲数）+`node scripts/ai-docs/check-docs.mjs`+markers 五类运行时组装直扫（i6-239 §2-7 口径）+`node scripts/check-migration-version-uniqueness.mjs`。
7. **STOP 终态**：三处（Status 头/§8 头行/卷尾）置 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·⛔push ⛔force push 未用 ⛔pull --rebase 未用。

**偏离清单（理想零·实零实质偏离·两项如实实测重钉随字段登记）**：件③ numstat 记形「+2/−2」→实测 **+3/−2**（净 +1 不变·字段3）；门行使形直跑→隔离 runner 包裹（环境整备·字段5 行使形登记）。

---

*HMAC-CONSOLIDATE REQUEST · 2026-10-16 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-16 EXEC 落卷·§9-EXEC 七字段·九门全绿·merge `46785ad1`·post-prove 双审待派） · base `feat/mysql-schema-skeleton` @`d186dffc`（fetch 后 origin tip 同值·integrity nail 波 tip 恰等·零重 pin）· 分支 `line/hmac-consolidate` · 工作树 `meetwise-hmac`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=批表盘点席 b 类 #100（批5 5A 行 `product-campaign-LEDGER.md:85`「#100 HMAC 合一」未翻残件·5A-2 @`4a5528a5` 已收 e2e/注解面·本刀=产品码侧普查定谳残件）· **定谳=候选乙（文档化不改）**：三面算法同（全 sha256）但密钥源三异（AUTH_SECRET+PREVIOUS kid 轮换窗/PAY_PROVIDER_SECRET 防重放窗/声明面）·载荷框架五形即契约·三面间零复制块（principal.guard 零计算纯消费·env-schema 零计算声明面·commerce 已单源 verifyCommerceSig）·甲案一行包装零去重收益反造跨信任域耦合·真重复已由 5A-2/domain util 先例收敛·第四处 privacy.service.ts:105 席 1 边界明裁零触 · 普查=产品码 18 位点/16 文件全 sha256/密钥源 12+ 键互异/编码形 3+截断 2/框架 5 形（§0.1-HMAC 表 SSOT·rev P1-1/P1-2 重数）+共享工具层零 hmac util 文件（token 面 domain auth.ts 即既有共享 util）· 修法=件① env-schema.ts `:40-41` 消费点锚如实化（4 锚全漂→现行真值·2 行→3 行净 +1·零行为）+件② 普查表落卷（随本卷）· 候选甲（共享 util）/丙（只修锚不落表）/丁（回改历史锚）/戊（privacy 并收）否决在卷 · 门矩阵九门（neg:commerce 90+authz5a2:hmac 20+uc011 53+e2e-helpers 28/neg:bend 179 基线值+api-harden 31/prove:env-schema 22/turbo typecheck 8/8/lint 贴边 root 5235·web 601·api 1421·db 1042 基线值/docs:check 2161≤cap 2176 预期·>2176 红停/markers 五类/diff 面起草 1 .md·终态 2 tracked/卫生零迁移链头 0204）· 零在飞交叠（env-schema.ts 末触 940bd5b5 全分支基线祖先亲证）· 迁移预期零 · est live=0 · markers=0 · pins 十二值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*
