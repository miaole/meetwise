# UUID-ID-CHECK REQUEST（#85 残面承接 · 语义表外模块 id 校验归一小刀 · 件①单源机械归一+件②语义表扩行登记 · 触 prod 恰 2 文件零行为 · 体量 S）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-10-16 起草席落卷·普查定稿+修法定稿即停·⛔push ⛔merge主线 · 未授权 EXEC · alone≠dual · Ban self-approve · est live=0）

**席位**：#85 残面「UUID-ID-CHECK 归一小刀」诊断+起草席（LEDGER `:89` 翻面注记 #85 承接指针「语义表外模块 id 校验归一归后继 5C 行为小刀」之承接·北星 loop）。
**基线**：`feat/mysql-schema-skeleton` 主线 tip @ `a9a8dcd9`（fetch 后 `origin/feat/mysql-schema-skeleton` 同值亲证·`git merge-base --is-ancestor 3cd159dd a9a8dcd9` **EXIT=0** 亲证=cap sanction 2200 波落点 `3cd159dd` 下界「tip≥3cd159dd」兑现·本席亲跑 `git fetch origin`+双锚亲证）。分支 `line/uuid-id-check`·工作树 `meetwise-uid`（`git worktree add ../meetwise-uid -b line/uuid-id-check a9a8dcd9` 本席已立·建后 tip `a9a8dcd9` 亲证）。
**蓝本**：①LEDGER `ai-docs/delivery/harness/product-campaign-LEDGER.md` `:89` 行 #85 token（「#85=uuid.ts:1-9 错误码两形两码刻意差异语义表在卷·残面 STILL OPEN 承接指针=语义表外模块 id 校验归一归后继 5C 行为小刀」本席对工作树逐字亲证在卷）②邻卷=`5e-cleanup-sweep-REQUEST.md` §0.1 #85 行+§1-簇A #85 token（主面文档化裁闭先例=「两形两码刻意差异」以语义表落定·残面=表外模块归一）③单源现值=`apps/api/src/platform/uuid.ts`（:1-10 头注语义表+:11 `UUID_RE`+:12 `UUID_V7_RE`·本席全文亲读）④审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` `:388`（#85 原行·外部只读蓝本）⑤邻卷=`dbid1-id-v7-unify.md`（DB 层 ID 纪元收敛域·生成侧 `packages/db/src/ids.ts` uuidV7Hex·与本刀服务守卫层域相邻零交叠）。

## §0 现状锚+普查定稿（三源对勘=LEDGER `:89` token 词面 × 单源现值全文 × 实树 grep 亲证 @`a9a8dcd9`）

### 0.0 防重检查记录（强制项·起草席实跑）

- `ls ai-docs/delivery/harness/ | grep -iE "uuid|id-check"` → **EXIT=1 零命中**（本席亲跑·无同名卷/无同域刀卷；`dbid1-id-v7-unify.md` 不含 uuid/id-check 词面不命中·系 DB 生成侧域邻卷非同域）。
- 单源与三表内服务均在本支线基线祖先：`apps/api/src/platform/uuid.ts`+interview/roles/resume 三 service 现值 @`a9a8dcd9` 亲读在树——零在飞依赖。
- 邻刀占有复核：近波 obs-family（main.ts/health/三 runner 脚本面）+5e-cleanup-sweep（LEDGER 单行面）与本刀触面（uuid.ts 头注+privacy.service.ts 两行）**零交叠**→ 停止条件未触发·可落卷。

### 0.1 普查定稿三项

**a) 单源语义表现值（`apps/api/src/platform/uuid.ts` 全文亲读）**：:1-10 头注=「资源 id UUID 校验单源（#85 归一·5E 批量清理刀 2026-10-12）」+错误码语义表两行（两形两码差异**刻意**·零行为裁闭形）：行① interview.service → `UUID_V7_RE`+400 `invalid_resume_id`（面试域 begin 的 resume-id·格式错=请求错·V7 严形与 `@meetwise/db` ids.ts uuidV7Hex 生成口径对齐）；行② roles.service/resume.service → `UUID_RE`+404 `not_found_or_forbidden`（B 端面·非 uuid 22P02→500 兜 404·不泄漏 id 存在性）。:11 `UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`（通用形）·:12 `UUID_V7_RE`（V7 严形 `[89ab]` 变位锁）。**表内消费点=3 服务 4 调用位**：interview.service.ts:27（`UUID_V7_RE as UUID_RE` 别名 import）+:107 守卫；roles.service.ts:3+:23；resume.service.ts:16+:294+:316（本席逐行亲证）。

**b) 全仓表外 id 校验形散布（生产码 8 处+zod 层 2 文件+测试镜像 3 处·本席逐处实锚亲证）**：

| # | 实锚（文件:行） | 形 | 失败语义 | 归一判定 |
|---|---|---|---|---|
| 1 | `apps/api/src/modules/privacy/privacy.service.ts:147` | inline 通用形 `/i`（与 `UUID_RE` **byte 恒等**·本席 cmp 亲证） | 400 `privacy_preview_invalid`（HttpException） | **同 app 唯一可机械归一处**→件① |
| 2 | `apps/web/lib/stream/scoring-honesty.ts:9` `WEB_UUID_RE` | V7 严形 `/i`（与 domain 侧 byte 恒等） | fail-closed→undefined（不抛·分不展示） | 刻意孪生：web 头注「与 `@meetwise/domain` scoring-honesty 合同对齐（**不引入 domain 包**）」边界锁定→登记 |
| 3 | `packages/domain/src/scoring-honesty.ts:17` `UUID_RE` | V7 严形 `/i`（#2 对侧） | `fail('score_answer_identity_missing')`（不抛 Http 族） | 同上→登记 |
| 4 | `packages/domain/src/privacy-authorization.ts:286` `UUID` | 通用形 `/i` | 验签 fail-closed→null（:329 jti 校验位） | 域内独立失败形→登记 |
| 5 | `packages/domain/src/qbank-miss.ts:51` `RUBRIC_ID` | 通用形**无 `/i`（大小写敏感漂移**·全仓唯一） | `{ok:false, reason:'rubric_id_invalid'}`（:203） | 生成侧恒小写今日零偏差；收 `/i`=放宽行为变更→**漂移登记+裁量呈报**零触 |
| 6 | `apps/web/app/recruiter/jobs/actions.ts:13` | inline 通用形 `/i` | 表单 message 形（`{ok:false,message}`·非 Http 错误族） | web 表单层+跨包→登记 |
| 7 | `packages/db/src/ids.ts:89` `idUnixMs` | `[0-9a-fA-F]` 大写显形（无 `/i` 等效容忍） | 解码 null（时间戳解码面·**非请求守卫**） | 生成/解码口径面=语义表行① V7 对齐参照**上游**→登记不动 |
| 8 | `packages/contracts/src/index.ts` | `z.string().uuid()` **51 处**（本席 `grep -c` 亲证）+`apps/web/lib/stream/business-events.ts:41` 1 处 | zod DTO parse error | DTO 解析层=另一校验机制族（非服务守卫层）→登记不归一 |

- **非 uuid 族 id 形不在本刀面**：`app_[A-Za-z0-9-]{1,40}`（web surface.ts:8）/`qgen-[0-9a-f-]{36}`/`qrecipe-[0-9a-f]{32}`（qbank-miss.ts:46-47 前缀形）/`Number.isSafeInteger` 数字形（last-event-id.ts 等）——各域内刻意·零触。
- **测试镜像 3 处零触**：`packages/db/test/rag05-qbank-miss.proof.ts:260`（无 `/i` 随 #5 产品形恒等）/`db-id-v7.proof.ts:178`（v7 形随生成口径）/`mem03-summary-tree.proof.ts:381`（通用 `/i`）——镜像随产品形，件①零行为故零需改。
- **否定项亲证**：`ParseUUIDPipe`/`@IsUUID`/`uuid` 包 validator 全仓 **零命中**（本席 grep 亲证）·apps/worker+packages/ai-runtime/ai-graphs/db-mysql/errors/qdrant-store 零 uuid 形正则。

**c) 归一缺口清单+量级（三层裁决）**：**层1 可控机械面**=#1 privacy.service.ts 同 app 单源化（byte 恒等零行为）+件② uuid.ts 语义表扩行（第三行 privacy+表外形显式登记段=沿 #85 主面「差异刻意→表内显式登记」文档化裁闭同型）——触面 2 prod 文件（1 注释块+1 import 行+1 行正则替换）零行为零迁移。**层2 架构决议面**=#2/#3 跨包孪生归一（需 web→domain 依赖或常量迁 contracts=`apps/api/src/platform/uuid.ts` 单源钉位 re-pin）+#5 大小写裁量+#4 失败形跨族——每处踩刻意边界·**呈报归协调方·本刀零触**。**层3 另机制族面**=#7 zod 51+1 处+ids.ts 解码口径——归一=跨 5 包大刀（动包图/动钉位/动行为）**越单刀量级·登记即闭不展开**。

### 0.2 量级裁决

**收窄子刀可控→起草本卷**：层1 两件（机械归一+扩行登记）落码落卷；层2/层3 呈报登记（§8 裁决项）零触。全量跨包单源化≠本刀（量级 S→M+ 且涉架构决议·非诊断席可裁）。

### 0.3 漂移/出入如实登记

1. **词面行锚漂移**：`neg-commerce.proof.ts:201/:607` 注释词面「interview.service.ts:169 UUID_RE」对现树守卫实锚 `:107`——历史行号残留（注释面·断言零涉）·沿「行号漂移只更锚不改结论」归后继随手笔·本刀零触。
2. **区间锚漂移**：LEDGER `:89`+5e-cleanup-sweep §0.1 词面「uuid.ts:1-9」对现树头注+正则实占 `:1-12`——区间锚不改结论（沿 5E G5「漂移只更行号」先例·EXEC 时点照例重 pin）。
3. **邻卷状态词面**：`dbid1-id-v7-unify.md` Status 行仍 `draft:awaiting_pre_exec_dual` 而其 EXEC 面（ids.ts uuidV7Hex/scoring-honesty DBID-1 注记）已落主线在树——沿「REQUEST STOP 值翻面权归协调方」惯例（5e-cleanup-sweep 卷同态先例）·如实登记零触。
4. **interview.service.ts 头注「顶部 import 别名引入」词面**（:41 附近）与实形（:27 `import { UUID_V7_RE as UUID_RE }`）恒等零漂——亲证在案。

## §1 修法（逐件·EXEC 立项重 pin·**逐字底稿·EXEC 不得改本节**）

### 件① privacy.service.ts 单源机械归一（零行为·byte 恒等是唯一依据）

- **改点 1（import 插入）**：`apps/api/src/modules/privacy/privacy.service.ts` 现 `:10` `import { DbService } from '../../platform/db.service';` 行后插入一行（逐字）：
  `import { UUID_RE } from '../../platform/uuid.ts';   // #85 残面归一(UUID-ID-CHECK 2026-10-16):通用形正则单源·语义表见单源头注`
- **改点 2（正则行替换）**：现 `:147` `    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) {` 整行替换为（逐字）：
  `    if (!UUID_RE.test(requestId)) {   // #85 残面归一:原 inline 正则与 UUID_RE byte 恒等·400 privacy_preview_invalid 语义零改`
- **零行为依据**：改前 inline 正则与 `uuid.ts:11` `UUID_RE` 定义逐字符恒等（本席 cmp 亲证·EXEC 时点改前重证=§2-G5①）·400 `privacy_preview_invalid`+HttpStatus.BAD_REQUEST+调用位（getPreview）全零触。

### 件② uuid.ts 语义表扩行+表外形显式登记（注释块·零码语义）

`apps/api/src/platform/uuid.ts` 头注 docblock 内、现 `:9`（`…沿用各文件既有注释口径）。` 行）之后、`:10` ` */` 之前，逐字插入：

```
 *  - privacy.service → UUID_RE + 400 `privacy_preview_invalid`（#85 残面归一·UUID-ID-CHECK 刀 2026-10-16）：
 *    erasure-preview 回执 requestId 入参，格式错=请求错（400 语义）；原 inline 正则与通用形 byte 恒等，仅单源化零行为。
 *
 * 表外形显式登记（#85 残面普查 2026-10-16 定谳·下列各形**刻意不归入本单源**·语义归各文件头注）：
 *  - packages/domain/src/scoring-honesty.ts UUID_RE（V7 严形）↔ apps/web/lib/stream/scoring-honesty.ts WEB_UUID_RE：
 *    跨包孪生（byte 恒等），web 头注「不引入 domain 包」边界锁定；两侧 fail-closed 不抛（domain fail 码/web undefined）。
 *    跨包归一需架构决议（web→domain 依赖或常量迁 contracts=本单源钉位 re-pin）·裁量归协调方。
 *  - packages/domain/src/privacy-authorization.ts UUID（通用形）：jti 验签面，fail-closed → null（不抛）。
 *  - packages/domain/src/qbank-miss.ts RUBRIC_ID（通用形·无 /i 大小写敏感·全仓唯一漂移）：reason 码返回形；
 *    生成侧恒小写今日零偏差，收 /i=放宽行为变更·裁量归协调方。
 *  - apps/web/app/recruiter/jobs/actions.ts（通用形 inline）：web 表单层，失败=表单 message（非 Http 错误族）。
 *  - packages/db/src/ids.ts idUnixMs（[0-9a-fA-F] 显形）：生成/解码口径面（非请求守卫），系本表 V7 严形对齐参照上游。
 *  - packages/contracts z.string().uuid()（zod 内建 51 处）+ apps/web business-events.ts（1 处）：DTO 解析层另一机制族，不归一。
 *  非 uuid 族 id 形（app_/qgen-/qrecipe- 前缀形、数字形）各域内刻意，不在本表。
```

- **SSOT 币值声明**：件②系**扩行登记非翻案**——原两行（interview/roles+resume）与 :11/:12 正则本体**逐字节零触**；表内三服务注释词面（「#85 单源化(5E 2026-10-12)」三处）零触；LEDGER/5e-cleanup-sweep 卷 `:89` 词面零触（SSOT 登记面归 EXEC 后 nail 随卷·本刀授权面不含）。

## §2 门矩阵（EXEC 断言·断言力≥3）

| # | 门 | 判据 |
|---|---|---|
| G1 | docs:check | `node scripts/ai-docs/check-docs.mjs` EXIT=0 且 managed ≤cap 2200（起草时点基线 2186 本席亲跑 EXIT=0 在案·+本卷 1=2187 预期余 13·EXEC 并线后按实跑如实记） |
| G2 | markers 五类 | 改动集（uuid.ts+privacy.service.ts+本卷 .md）五类标记词+冲突标记零命中 **0/0**（词面运行时组装防自指·沿 i6 门⑦形） |
| G3 | migrations 字节零触 | `git diff <base> -- packages/db/migrations` 空（0 行·checksum 铁律） |
| G4 | diff 面 | EXEC 修法工作面 `git diff --numstat` 恰 2 tracked prod 文件=uuid.ts（注释扩行 +14/−0 级）+privacy.service.ts（+2/−1 级）·零他码面零迁移；本卷 .md 系起草阶段既有不计 EXEC 工作面 |
| G5 | 零行为抽验 | ①改前重证=privacy.service.ts 改前 inline 正则与 UUID_RE 定义 cmp 逐字符恒等；②typecheck（turbo typecheck 8/8）③turbo lint（api 沿五值恰等口径）④`authz5a2-hmac.proof.ts` 形一静态断言（privacy.service.ts createHmac preview-digest 行零触亲证）；e2e 零涉（行为零改·正则 byte 恒等）；LEDGER `:89` 行锚漂移只更行号不改结论 |
| G6 | est live=0 | 零模型外呼·零生产操作·零 secrets·零 SMTP（收据逐门登记·pins 脚注 `actualSpendCny=null` 同源） |

## §3 范围外（边界清单·越界即 FAIL）

1. **表外形七处零触**：#2/#3 孪生两侧+#4 privacy-authorization+#5 qbank-miss RUBRIC_ID+#6 jobs/actions+#7 ids.ts+contracts zod 族——跨包归一/行为裁量归协调方（§8 裁决项呈报）·本刀 `apps/web`/`packages/`（除零触声明外全域）字节零改。
2. **表内三服务零触**：interview/roles/resume 三 service（已在语义表内·#85 主面已裁闭）零字节。
3. **测试镜像 3 proof 零触**（§0.1-b）·`neg-commerce.proof.ts` 注释词面零触（§0.3-1）。
4. **`packages/db/migrations/` 全目录字节零触**（G3·checksum 铁律）。
5. **SSOT 零触**：LEDGER 全卷（:89/:213/:216/刀位图/管线）/execution-master-checklist/TASK-SOP-v2/issues-master 零字节——本刀起草面=恰本卷 1 新增 .md；EXEC 后 nail 面 SSOT 三处（LEDGER 刀位图行+管线行+checklist 段）归协调方派单授权。
6. **DBID-1 域零触**：ids.ts 生成侧/id 纪元/迁移面（邻卷 dbid1 域）。
7. **est live=0**：零模型真实外呼·零生产操作·零 secrets·零 SMTP。
8. **⛔push ⛔merge主线 ⛔force push**（nail/推送归后继席·协调方派单）。

## §4 依赖

**零未决硬依赖**：单源+三表内服务+件①触点全在本支线基线祖先（@`a9a8dcd9` 树亲读在卷）。**并发面**：uuid.ts 头注与 privacy.service.ts :147 区非热点（近波 obs-family/5e-cleanup-sweep/api-harden 触面零交叠亲证）——EXEC 立项照例 fetch 重 pin（锚漂只更行号·§2-G5）。

## §5 Ban 列表 + pins（沿 5e-cleanup-sweep 卷 §5 同源誊录+本卷面增补）

**Ban 列表**：Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT 除本卷授权触面（本卷 .md 外 LEDGER/checklist/TASK-SOP-v2/issues-master 零触）；Ban 触表外形七处任何码面（呈报 only·不 silently 落弃）；Ban 触表内三服务/测试镜像/DBID-1 域（§3）；Ban 迁移越权（migrations 全目录字节零触）；Ban 改 uuid.ts :11/:12 正则本体与原两行语义表词面（扩行登记 only·SSOT 币值声明兑现面）；Ban 改 400/404 错误码与任何响应行为（零行为刀）；Ban 触其他工作树（worktree list 在册零触）；Ban 伪造已问/已验来源；Ban 弱化既有产品承诺或安全语义（fail-closed 形零弱化）；Ban retry-to-green/masking/假绿叙事；Ban secrets/`.env*`（Key name-only）；Ban G7 面/车道/live 套件；Ban Meridian；Ban buy cloud。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全静态/源读/git 亲证·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：全部断言=静态源读/docs 静态断言/git 亲证/typecheck/lint 静态门（§2-G1~G6）；零生产操作·零 secrets·零 SMTP·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐门登记零外呼口径）。

## §7 markers=0（卫生声明）

本卷改动集（起草阶段恰 1 新增 .md=`ai-docs/delivery/harness/uuid-id-check-REQUEST.md`）五类标记词 grep 零命中（起草席自检·命令与回执留 prove·五类标记词不复抄卷内避免自匹配·沿 5e-cleanup-sweep/5E GROUP 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（起草阶段恰 1 新增 .md=本卷·prod 零字节）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin·漂移只更行号不改结论）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC/协调方裁决项**：①**跨包归一架构决议**（层2 呈报：#2/#3 孪生归一=web→domain 依赖 vs 常量迁 contracts=单源钉位 re-pin vs 维持孪生+件②登记即闭——三择归协调方·本刀默认第三择零触）；②**qbank-miss RUBRIC_ID 大小写敏感漂移处置**（维持敏感+登记 vs 收 `/i` 行为放宽·归协调方·本刀零触）；③contracts zod 族是否另立「DTO id 形」后继刀（本刀件②登记即闭/另立两可·归协调方）；④LEDGER/SSOT 三处登记时点与归属（EXEC 后 nail 随卷·沿先例归协调方派单）；⑤EXEC 时点行锚漂移重 pin 行使。

---

*UUID-ID-CHECK REQUEST · 2026-10-16 起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`a9a8dcd9`（fetch 后 origin tip 同值亲证·⊇`3cd159dd` sanction 下界亲证）· 分支 `line/uuid-id-check` · 工作树 `meetwise-uid` · 蓝本=LEDGER `:89` #85 承接 token+5e-cleanup-sweep 卷 §0.1/§1-簇A #85 行+uuid.ts 单源现值+issues-master 更正版 `:388`+dbid1 邻卷 · 普查三项定稿=a) 语义表两行两形现值+表内 3 服务 4 调用位/b) 表外生产码 8 处+zod 51+1 处+测试镜像 3 处（否定项 ParseUUIDPipe/IsUUID/uuid 包零命中）/c) 三层量级裁决 · 修法=件① privacy.service.ts:147 单源机械归一（byte 恒等零行为）+件② uuid.ts 语义表扩行+表外形显式登记（注释块零码语义）· 触 prod 恰 2 文件·零迁移·est live=0 · 门矩阵 G1-G6（docs:check≤cap 2200 基线 2186+markers 0/0+migrations 零触+diff 恰 2 prod+零行为四重抽验+est live=0）· 防重检查过（harness 无同名卷·邻刀零占有）· pins 十一值照抄零翻 · markers=0 · ⛔push ⛔merge主线 ⛔force push · Ban self-approve · alone≠dual · Dual PASS ≠ 开工*
