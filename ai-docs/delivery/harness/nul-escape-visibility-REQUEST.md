# NUL-ESCAPE-VISIBILITY REQUEST — 裸 NUL 转义改写可见性刀（8 文本文件 19 枚裸 NUL+同行伴生 4 枚·rg 二进制盲区根治·运行时字节恒等转义·qbank-scope-fix §4-④ STILL OPEN 承接·零行为语义变更·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·pre-exec 双审两独立外席待派·alone≠dual·Dual PASS ≠ 开工·Ban self-approve · est live=0 · ⛔push ⛔merge 主线）

**席位**：NUL-ESCAPE-VISIBILITY 起草席（meetwise 战役「裸 NUL 转义改写刀」起草席·qbank-scope-fix 双审席 2 候选登记定谳承接）。
**基线**：`feat/mysql-schema-skeleton` @ `317ea3df`（cap sanction 2160 卷 tip·主线 HEAD 亲证 `git rev-parse`）· 分支 `line/nul-escape-visibility`（本起草席 `git worktree add ../meetwise-nul -b line/nul-escape-visibility` 亲立·HEAD 落 `317ea3df` 亲证）· 工作树 `meetwise-nul`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（NUL-ESCAPE-VISIBILITY 裸 NUL 转义改写刀·背景=qbank-scope-fix 双审席 2 候选登记定谳「仓内 8 文本文件 19 枚裸 NUL」）；②qbank-scope-fix REQUEST `§4-④` STILL OPEN 登记（`line/qbank-scope-fix` 卷 `:110`「rg 二进制盲区普查工具纪律（NUL 惯例文件清单…除外口径）归后继 docs/工具刀；本刀不搭车」——**本卷即该后继刀**·修法取「改文件可见性」而非「改普查工具旗」）；③其 `§1.2-环④` 盲区机制实证（AG39 裁决⑧ 普查 rg 双盲区→`qbank-generation.proof.ts` 漏枚举→CI 存量红 run `38728371250` step 71 首曝）；④结构范本 `ai-docs/delivery/harness/qbank-scope-fix-REQUEST.md`（§0-§8 形制·基线树在卷亲证）。

## §0 现状锚（起草席亲读·python 字节扫描非 rg·file:line+blob+字节偏移逐条实测 @`317ea3df`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 **26 树**（主仓+25 含本 nul 树）——无第二 nul-escape 同名树；`git branch --list "line/nul-escape*"` 恰 1 命中=本席分支。
- `ls ai-docs/delivery/harness/ | grep nul-escape` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀触面=8 文本文件（§0.1）。本席对全 `line/*` 分支亲扫（merge-base..tip 对 8 文件 `git log`），命中 5 树 7 文件次：`line/qbank-scope-fix`→`qbank-generation.proof.ts`（+1 行 @`:555-556`·与本卷改写行域 `:380/:384/:385` **不相交**·同 tip 分叉亲证 merge-base=`317ea3df`）；`line/dir-structure`→两 db 文件（`409843b3` 纯 git mv+路径文本·若先并线则本卷 §0.1 路径锚随迁改）；`line/extrev-deps-aud`→`resume-extract.proof.ts`（`2acf92c3` 依赖审计锚持恒）；`line/negresume-driver-fix`/`line/growth-gen`/`line/unstub-erase`→`neg-resume.proof.ts`。**任一在飞分支顶对 8 文件存在主线 `317ea3df` 之后新增提交→照 §0 协议重 pin 顺延行号；并线序=先到先并·后并方改锚**（Ban 双卷同窗互改同文件字节域）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`317ea3df`·字节偏移=文件首字节起算·python `bytes.find(b'\x00')` 亲扫）

**文本面 8 文件 19 枚裸 NUL（+同行伴生 4 枚非 NUL 裸控制字节·如实超计口径登记）**：

| 文件 | blob（8 hex） | 裸 NUL 位点（偏移·行·枚数） | 改写域行锚 |
|---|---|---|---|
| `packages/db/src/qbank/qbank-provider-input.ts` | `07bf4cb1`（116 行） | `:82` ×2（偏移 4161·4174） | `:82` duplicate-part 键模板串 `` `${part.refId}\x00${part.role}\x00${part.ordinal}` ``（记法·实为裸字节）·`:63-89` validatePart |
| `packages/db/src/qbank/qbank-generation-projection.ts` | `03342846`（174 行） | `:134` ×2（偏移 5642·5666） | `:134` byKey 分组键模板串（同上形）·`:130-150` 投影分组循环 |
| `packages/domain/src/qbank-miss.ts` | `9b130578`（260 行） | `:53` ×1（偏移 3279·**伴生裸 0x1f·0x7f 两枚同串**） | `:53` `const CONTROL = /[裸NUL-裸1f裸7f]/;`（grep 裸字节无行号降级活证）·使用点 `:195/:198/:242/:245`（`question_control_chars` 拒答面）·**:52 `POLICY=/^[^\x00-\x1f\x7f]{1,64}$/` 已是转义形——同文件双形并存=本刀可行性同文件活证** |
| `apps/worker/test/qbank-generation.proof.ts` | `02f1675b`（640 行） | `:380` ×2（偏移 26104·26125）·`:384` ×2（偏移 26473·26476）·`:385` ×2（偏移 26597·26600） | `:380` byRefScope 期望键模板串·`:384/:385` `'qgen:rate\x00v1\x00backend/general'` 字面键 ×2 行（metadataHash/contentHash 断言臂）——**cache-key 分隔符语义数据·qbank-scope-fix §0.1 已登记同 blob `02f1675b` 互证** |
| `apps/api/test/neg-auth.proof.ts` | `ab4eb1d5`（465 行） | `:206` ×1（偏移 12023） | `:206` signup `email: 'a\x00@x.com'`（记法）负测串 |
| `apps/api/test/neg-input.proof.ts` | `7458d2a8`（327 行） | `:199` ×1 注释（偏移 16860）·`:200` ×1 串（偏移 17021）·`:315` ×1 注释（偏移 26666） | `:200` `text: 'valid head ' + '\x00' + ' tail padding…'`（记法）E1 臂·`:199/:315` 注释叙述字节 |
| `apps/api/test/neg-resume.proof.ts` | `be27e63f`（364 行） | `:122` ×1 注释（偏移 8780）·`:123` ×1 串（偏移 8909） | `:123` `text: '…' + '\x00' + '…'`（记法）null 字节臂 |
| `packages/domain/test/resume-extract.proof.ts` | `c355f392`（115 行） | `:24` ×1（偏移 1740·**伴生裸 0x07**）·`:26` ×1（偏移 1864·**伴生裸 0x08**） | `:24` dirty 串 `'Java\x00\x07 工程师…'`（记法）·`:26` 清洗断言 regex `/[裸NUL-裸08]/` |

**非文本面（豁免存续·零触）**：含 NUL 二进制文件共 **11 枚 PNG**=apps/web/docs/screenshots/{01-landing·02-login·03-dashboard·04-resume·04a-resume-consent·05-interviews·06-pricing·07-features·08-growth·m1-landing-mobile·m2-dashboard-mobile}.png（全 tracked 亲证·PNG 格式天然含 NUL·非本刀面）。`.sql` 迁移面 **零 NUL 命中**（全仓 `.ts/.tsx/.mjs/.sql/.js/.json/.md/.yml/.sh` 等文本扩展全扫·**第 9 文件不存在**·8 文件即全量定谳）。

**配套锚（只读引用）**：root `package.json` `3b04b871`——`:562` `rag-generation:prove`→`run-e2e-isolated.mjs`→`:563` `prove:qbank-generation`→`tsx test/qbank-generation.proof.ts`·`:119` `neg:all`·`:581` `resume-extract:prove`→`packages/domain prove:resume-extract`·`:8` lint 根预算 5235；`scripts/ai-docs/public-text-policy.mjs` `3015b893` `:92` `MAX_FILES = 2_160`（cap sanction 已由 `317ea3df` 兑现）；`scripts/ai-docs/check-docs.mjs` `0f8ddb4b`；eslint 壳 `eslint.config.mjs`→`packages/config/eslint.config.base.mjs`（`no-control-regex` 零显式配置——raw 与转义形 regex 解析为恒等 AST→lint 计数结构性恒等）；源文本读者登记 `apps/worker/evidence/r4-funnel-covered-count-batch3.ts` `:116-117` `readRepo('packages/domain/src/qbank-miss.ts')`（全 pattern=函数名锚·与本刀改写域零交叠亲证）。

### 0.2 派单简报漂移登记（结论零变·如实改锚）

1. **简报枚举「产品码 3 文件 5 处+测试 4 文件（3/2/2/1）」=13 枚 ≠ 简报自报总数 19 枚 → 定谳=测试 5 文件 13 枚**：漏计 `apps/worker/test/qbank-generation.proof.ts` ×6（`:380`×2/`:384`×2/`:385`×2）——恰为 qbank-scope-fix §0.1 已 blob 级登记之 6 枚（两卷独立普查互证·其卷 perl 逐字节·本卷 python 逐字节）·**总数 8 文件 19 枚定谳成立·枚举修正如上**。
2. **简报「qbank-miss.ts:53 ×1 CONTROL regex 字符类内 \x00/\x1f/\x7f」表述修正**：实况=`:53` CONTROL 串内是**裸字节**（U+0000/0x1f/0x7f 三枚·非转义文本）·同文件 `:52` POLICY 才是转义形——简报所述「\x00 形」实为 `:52`。本刀对 `:53` 三枚控制字节一并转义（NUL 计入 19 枚·伴生 2 枚超口径如实登记）。
3. **简报「resume-extract 2」细化**：`:24` 伴生裸 0x07·`:26` 伴生裸 0x08（regex 端点）——同行一并转义（伴生 2 枚超口径登记）。
4. **简报/qbank 席 2 修订「png 10」→ 本席 @`317ea3df` 实测 11**：qbank 卷 `§4-④` 原记「两 png」·席 2 修订记「png 10」·本卷亲数 11（§0.1 逐名列）——三读数系各自时点观测·**历史登记不洗·本卷记现行 11**（PNG 零触·存续豁免面·§3-4）。
5. **简报「测试 4 文件」→ 定谳=测试 5 文件**（漂移登记 1）·**「危害=rg 默认判二进制静默跳过」→ 本席活证加坐 grep 同族降级**（§1.1-E）。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**204**·头 `0204_ai_cost_cached_input_price.sql`（与 checklist safewrite-backpressure nail 段「链 204 头 0204」恒等）。
- 本刀修法=纯源文本字面量转义改写（§1-修法）·**预期零迁移零 DDL**。EXEC 期若实测产生非预期迁移需求→**停（越界需要类）上报**（§8）。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 危害机制（本席 @`317ea3df` 五组活证·命令+EXIT 原值如实载）

- **A 目录扫描静默跳过**：`rg -l 'qbank_provider_input_duplicate_part' packages/db/src/` → **EXIT=1 零命中**（该串真在 `qbank-provider-input.ts:79`·rg 15.x 对含 NUL 文件判 binary 静默跳过）。
- **B 单文件显式恢复**：同 pattern `rg -l …qbank-provider-input.ts` → EXIT=0 命中。
- **C 旗修复**：`rg --text -l …packages/db/src/` → EXIT=0 命中——**盲区是默认旗行为非工具无能·但依赖每个执旗者记得带旗=掩盖非根治（候选乙否决根据）**。
- **D grep 同族降级**：`grep -n 'CONTROL' qbank-miss.ts` → 无行号二进制降级输出；`grep -an` → 恢复 `53:` 行号——**NUL 文件对 grep 工具族普遍行为污染**。
- **E 多文件枚举漏席**：`rg -l 'const CONTROL' packages/domain/src/` → 仅 `mem07-injection-fence.ts`（qbank-miss.ts 缺席）；`rg --text` 同扫 → 两文件齐——**与 qbank-scope-fix §1.2-环④「全仓两次 rg 普查命中清单均无此文件」同机制重演**。

### 1.2 归因链（AG39 盲区机制 + qbank-scope-fix 实证·承接非搭车）

- **环①（成因）**：仓内 cache-key 以 NUL 为分隔语义数据（三产品文件模板串+proof 期望键·§0.1）·负测/清洗断言以裸控制字节直书 regex 与测试串——**源文本合法含 NUL → 一切默认旗 rg 目录普查对该文件整体失明**。
- **环②（实证=CI 红逃检）**：AG39 EXEC `1408d8c2` 裁决⑧ 九文件枚举+「rg 普查」兜底双双漏 `qbank-generation.proof.ts`（6 枚裸 NUL·qbank-scope-fix §1.2-环④ 亲证）→ directSqlBoundary 臂未获 owner GUC 供给→存量红潜伏≥60 轮 CI·`0c06033d` 清欠后 step 71 首曝（run `38728371250`·qbank-scope-fix 卷已修未并·PR #108 已知红线）——**普查工具盲区致真实红逃检的仓内实锤**。
- **环③（承接）**：qbank-scope-fix `§1.3` 候选丙否决（该卷不触 NUL·cache-key 语义保护）+`§4-④` 移交 STILL OPEN「归后继 docs/工具刀」——**本卷=该后继刀·取道③（转义改写·文件可见性根治）·非其否决的丙道（拔 NUL 改语义）**。承接受权面=起草派单 brief·行翻面/nail 归协调方。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=转义序列改写**：模板串/单引号串内裸 NUL→`\u0000`/`\x00`·regex 字符类→`\x00` 形（与 `qbank-miss.ts:52` POLICY 既有转义形同族）·注释内裸 NUL→字面转义文本。**运行时字符串字节恒等**（转义序列与裸字节在 JS/TS 字面量中编译为同一 code unit·V1 亲证）·regex 源语义恒等（V2 电池亲证）·文件恢复 rg 默认旗可见。零运行时行为语义变更·零 cache-key 形状变更。
- **候选乙（否决·Ban）=全局普查旗纪律化（rg --binary/--text 强制入 SOP）**：掩盖非根治——旗不改变文件二进制性·任何新席/新 CI 步/新工具（grep 族已证同污染 §1.1-D）仍裸跑即盲；qbank-scope-fix 逃检实证恰恰说明「靠执旗纪律」不可持续。工具纪律可另刀（归 docs/工具·§4-③）·**本刀以文件可见性根治基准面**。
- **候选丙（否决·Ban）=拔除/替换 NUL 分隔符**（改 `|`/`\u001f` 等）：NUL 系 cache-key 分隔语义数据——改分隔符即改 cache-key 字符串形状→缓存键全量换形·qbank-generation 邻面爆炸（qbank-scope-fix 候选丙否决沿承·其 §3-3「NUL 字节零触」与本卷互为镜像条款）。**转义改写下 NUL 运行时值原样保留·该冲突消解**。
- **候选丁（否决·Ban）=`.gitattributes` binary 标注/ignore 豁免**：把盲区合法化·与可见性目标反向。

## §1-修法（逐处转义改写定稿·预期恰 8 文件·零迁移零产品行为语义变更）

**改写总则**：①只动字面量域（模板串/单引号串/regex 字面量/注释文本）·零结构零断言语义零位点增减；②转义形选择=模板串用 `\u0000`（六位显目·防再误读为可见字符）·单引号串与 regex 字符类用 `\x00`（与 `qbank-miss.ts:52` POLICY 既有形同族短形）·注释内改写为字面四字符文本 `\x00`（无运行时面）；③伴生裸控制字节（0x1f/0x7f/0x07/0x08 四枚·同行同串）一并转义（同盲区族·超 NUL 计数口径如实登记）；④本卷 .md 引文一律文本记法·**零裸 NUL 复制入卷**（落卷后全仓复扫含本卷自证·§2-1）。

| # | 文件:行 | 枚数 | 改前（U+0000 记法标注裸字节位） | 改后（定稿） |
|---|---|---|---|---|
| 1 | `qbank-provider-input.ts:82` | 2 | `` `${part.refId}␀${part.role}␀${part.ordinal}` `` | `` `${part.refId}\u0000${part.role}\u0000${part.ordinal}` `` |
| 2 | `qbank-generation-projection.ts:134` | 2 | `` `${row.ref_id}␀${row.taxonomy_version}␀${row.serving_scope_id}` `` | `` `${row.ref_id}\u0000${row.taxonomy_version}\u0000${row.serving_scope_id}` `` |
| 3 | `qbank-miss.ts:53` | 1（+伴生 2） | `const CONTROL = /[␀-␛␡]/;` | `const CONTROL = /[\x00-\x1f\x7f]/;`（与 `:52` POLICY 同族） |
| 4 | `qbank-generation.proof.ts:380` | 2 | `` `${p.refId}␀${p.taxonomyVersion}␀${p.servingScopeId}` `` | `` `${p.refId}\u0000${p.taxonomyVersion}\u0000${p.servingScopeId}` `` |
| 5 | `qbank-generation.proof.ts:384` | 2 | `'qgen:rate␀v1␀backend/general'` | `'qgen:rate\x00v1\x00backend/general'` |
| 6 | `qbank-generation.proof.ts:385` | 2 | `'qgen:rate␀v1␀backend/general'` | `'qgen:rate\x00v1\x00backend/general'` |
| 7 | `neg-auth.proof.ts:206` | 1 | `email: 'a␀@x.com'` | `email: 'a\x00@x.com'` |
| 8 | `neg-input.proof.ts:199` | 1 | 注释「Postgres text 不容 ␀」 | 注释内改字面文本 `\x00` |
| 9 | `neg-input.proof.ts:200` | 1 | `text: 'valid head ' + '␀' + ' tail padding…'` | `text: 'valid head ' + '\x00' + ' tail padding…'` |
| 10 | `neg-input.proof.ts:315` | 1 | 注释「若 Postgres 拒 ␀ 抛错未拦」 | 注释内改字面文本 `\x00` |
| 11 | `neg-resume.proof.ts:122` | 1 | 注释「Postgres text 拒 ␀」 | 注释内改字面文本 `\x00` |
| 12 | `neg-resume.proof.ts:123` | 1 | `text: '…' + '␀' + '…'` | `text: '…' + '\x00' + '…'` |
| 13 | `resume-extract.proof.ts:24` | 1（+伴生 1） | `'Java␀␇ 工程师…'` | `'Java\u0000\x07 工程师…'` |
| 14 | `resume-extract.proof.ts:26` | 1（+伴生 1） | `/[␀-␈]/` | `/[\x00-\x08]/` |

（␀=U+0000·␛=0x1f·␡=0x7f·␇=0x07·␈=0x08·表内记法防裸字节入卷——EXEC 实施以 §0.1 字节偏移+blob 锚对照为准）

**运行时字节恒等主张+逐类验证法（起草席 node 亲证 27 臂全 PASS·命令形入收据）**：

- **V1 字符串恒等（#1/2/4/5/6/7/9/12/13）**：`node -e` 断言——`'\u0000' === String.fromCharCode(0)`·`` eval('`a\x00b`') === eval('`a\\u0000b`') ``·三元键样例 `` `${a}${N}${b}${N}${c}` === `${a}\u0000${b}\u0000${c}` ``（N=String.fromCharCode(0)）·`'a\x00@x.com' === 'a'+N+'@x.com'`·dirty 串含伴生 `\x07` 全等——**转义前裸字节与转义后运行时串 `===` 恒等·length 恒等**。
- **V2 regex 源语义恒等（#3/14）**：`node -e` 电池——旧形 `new RegExp('['+String.fromCharCode(0)+'-'+String.fromCharCode(0x1f)+String.fromCharCode(0x7f)+']')` vs 新形 `/[\x00-\x1f\x7f]/`·对 14 case 电池（U+0000/1f/1e/20/7f/7e/07/08/空串/纯文/混排…）逐 case `test()` 恒等·`/[\x00-\x08]/` 对 6 case 恒等——**ESLint 同理：两形解析为恒等 regex AST→lint 计数结构性恒等（§2-6 恰等根据）**。
- **V3 行为恒等（全件）**：门矩阵主门臂级对照（§2-2）+受影响 prove 全绿/恒等（§2-2/3/4）——运行时输入逐字节不变→断言面零漂。
- **V4 复扫自证（§2-1）**：python 全仓字节扫描 19→0·且 8 文件恢复裸 rg 默认旗可见（§1.1-A 反演：同 pattern 目录扫描 EXIT=0 命中）。

## §2 验收断言（pre-exec 双审核对单基面·数字口径以实跑实测为准·基线权威值=checklist「Line safewrite-backpressure nail」段 union 树终值 @`317ea3df` 系）

1. **全仓 NUL 计数=0 复扫（本刀主门）**：python 字节扫描全仓文本扩展（§0.1 同脚本）→文本面命中恰 **0 文件 0 枚**（改前 8/19 亲证基线）·11 PNG 二进制除外口径恒等；且 §1.1-A 反演=对改写 pattern 的裸 rg 目录扫描恢复命中。
2. **主门 rag-generation:prove（cache-key 行为恒等直证）**：`pnpm rag-generation:prove` 隔离容器——届时链上 qbank-scope-fix 卷**已并线**→**40/40 全绿**；**未并线**→改前改后**臂级对照恒等**（基线=既登基线红·前 32 臂 PASS+`:556` crash 同签名·qbank 卷在飞承登）+**改后新红才阻塞**——`:380-385` byRefScope cache-key 断言臂双向恒等绿即 **cache-key 行为恒等直证**（键形状运行时未变·V1 承）。红不重跑冲销。
3. **qbank 域九邻面不回退**：`qbank-control-sec:prove`（26 断言）+`ag39-org-qbank:prove`（50/50）+`qbank-handoff-closure:prove`（16/16）+`qbank-control-role:prove`+`dbhy1:prove`（28/28）+`rag03-filter-locus:prove`/`rag03-hnsw-completeness:prove`/`rag03c-exactk-observe:prove`/`rag04-track-local:prove` 全 EXIT=0（臂总数对基线登记值·任一漂移±1 即触「现场漂移」上报）。
4. **neg 邻面+resume-extract**：`neg:all` 六段全绿 EXIT=0·总臂 **687**（90/90/91/102/179/135·±2 熔断上报）·PASS 名单对改前 diff=∅（neg-auth/neg-input/neg-resume 三段直接承载本刀改写·运行时串恒等 V1 承）·`resume-extract:prove` EXIT=0 臂级改前改后恒等（分母以改前 run 实测为准零漂）。
5. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached）。
6. **lint**：`pnpm turbo lint` 12/12·五值恰等 web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（恰等·任一越值即停——raw 与转义 regex AST 恒等→计数结构性恒等·V2 承）。
7. **docs:check ≤cap 2160**：基线实测 `node scripts/ai-docs/check-docs.mjs` EXIT=0 **scanned 2151 ≤ 2160**（本席亲跑·余 9）→落卷后 2152 ≤ 2160 绿（本卷 1 受管件+EXEC 收据目录·cap sanction 已由 `317ea3df` 兑现·零 sanction 诉求）。
8. **markers 五类零新增**：本刀改动集（本卷 .md+件① 8 .ts+收据目录）五类标记词运行时组装词面 grep 零命中（i6-239 口径·词面不复抄卷内防自匹配·命令与回执入收据）。
9. **diff 面机检**：`git diff --numstat <base>` 恰 **8 tracked 路径**（全 .ts·均字面量域行·零结构行）+本卷 .md+收据目录 untracked——多任何 tracked 路径即停（越界需要类）。`git diff --word-diff` 抽查断言改动仅落字面量 token。
10. **卫生**：est live=0（prove 全 run-e2e-isolated 隔离容器·零宿主库直跑）·0 Key 值·`.env*` ABSENT 双向记录·`actualSpendCny=null`。
11. **贴边注意（三条·EXEC 必读）**：①**改前基线 byte-run 必做**——主门与受影响 prove 各取改前一 run 存签名入收据（红绿原值·零冲销纪律·§2-2 二值定谳依据）；②**行号顺延纪律**——qbank 卷先并线则 `qbank-generation.proof.ts` 变 641 行·本刀 `:380/:384/:385` 改写行照 §0 协议重 pin（该卷 +1 行落 `:556` 域·与本刀行域不相交·零文本冲突预期）；③**tsbuildinfo 副产**若被门运行翻动→`git checkout` 回滚保门 9 恰 8 路径（negbend §9 先例形）。

## §3 范围外（边界清单·越界即 FAIL）

1. **cache-key 语义零触**：NUL 分隔符**运行时值**逐字节保留（V1 承）——候选丙否决沿承·qbank-scope-fix §3-3「NUL 字节零触」镜像条款（彼卷保护其 blob 内 NUL·本卷以恒等转义承其 STILL OPEN·两卷合观=零语义变更闭环）。
2. **迁移 .sql NUL 面=另行**：本席普查 `.sql` 零 NUL 命中（§0.1）——预期零·EXEC 期若现迁移面 NUL 诉求→停（越界需要类）另刀。
3. **产品行为语义零触**：`CONTROL`/`POLICY` 验证语义·`question_control_chars` 拒答面（`:195/:198/:242/:245`）·cache-key 构造与投影分组行为（V1/V2/V3 三承）零改。
4. **11 PNG 二进制零触**：PNG 格式天然含 NUL·非文本面·豁免存续唯一面（§3-4 与 §2-1 除外口径同源）。
5. **断言本体零触**：8 文件内 A() 位点/臂数/分母/断言语义零增减零改形（仅字面量 token 转义）。
6. **源文本读者零扰**：`r4-funnel-covered-count-batch3.ts:116-117` 等源扫描面全为函数名 pattern·与改写域零交叠（亲证）——EXEC 期若现新读者依赖裸 NUL 源文本→停上报。
7. **共享 SSOT 零改**：checklist/LEDGER/north-star/backlog 只读引用——批表行翻面权归协调方 nail；cap sanction 面 `public-text-policy.mjs` 零字节（§2-7 零诉求）；零迁移零 DDL 零 CI/workflow 改·零依赖升级。

## §4 依赖

- **①qbank-scope-fix 卷（在飞·同 tip `317ea3df` 分叉·merge-base 亲证恒等）**：本卷=其 `§4-④` STILL OPEN 后继刀（§1.2-环③ 承接）·同文件 `qbank-generation.proof.ts` 行域不相交（其 `:555-556` +1 行 vs 本卷 `:380/:384/:385`）·并线序纪律=先到先并后并改锚（§0.0/§2-11②）·其主门红（step 71）与本卷零因果（本卷不改其夹具行）。
- **②AG39 卷（已主线）**：盲区成因卷（§1.2-环② 归因上游）·本卷零回改其卷面。
- **③cap 2160 sanction 已兑现**（`317ea3df` 先行落主线·本卷余量 9→落卷后余 8·零 sanction 诉求）。
- **④工具纪律另刀候选（归协调方另裁）**：rg/grep 普查旗纪律（`grep -a`/`rg --text` 强制条款）可归 docs/工具刀——本刀落码后该纪律降级为「防新 NUL 再入」的守门项·非本刀面（候选乙否决沿承·本卷不搭车）。
- **⑤行翻面与 nail 排序归协调方**。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban merge 主线（并线权归协调方 nail）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 触 NUL 运行时值/替换分隔符（§3-1·候选丙否决）；Ban 触断言本体/位点（§3-5）；Ban 触产品行为语义（§3-3）；Ban 触 11 PNG 与 .sql 面（§3-4/§3-2）；Ban 全局旗纪律就地入 SOP（§4-④·候选乙否决·归另刀）；Ban 裸字节复制入本卷 .md（§1-修法总则④·自污染即违本刀主题）；Ban retry-to-green（§2-2/§2-11① 恰 run 纪律）；Ban 迁移 Ban DDL；Ban 改共享 SSOT/cap sanction 面；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因红靶外新红（邻面新红→如实登记升级）；Ban 造 .env*/写 Key 值；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0 + qbank-scope-fix §4-④ 豁免清单联动处置注记

- 起草 turn（本卷）：est live=**0**——零 prove 实跑（全部数=python 字节扫描/node -e 断言/rg(-a)/sed/Read 静态亲证·docs:check 与 markers 为本地零外呼脚本·零模型外呼零 Key 加载零 secrets 零消耗）；EXEC 期 prove 全隔离容器（§2-10 承）。
- **联动处置注记（派单任务④·处置建议=不动 qbank 卷）**：本刀落码后文本面 NUL 归零→qbank 卷 `§4-④`「六文件+两 png 除外口径」中**文本文件部分全数清空**（其六文件枚举+席 2 补记 resume-extract=本卷 §0.1 七测试/产品文本文件·全经转义恢复可见·豁免不再需要）·PNG 存续面=11（§0.2-4 三时点读数漂移如实登记）。**建议 qbank 卷零回改**：①其 `§4-④` 系 STILL OPEN 候选移交的历史登记（非活性清单）·本卷 §0.1 即现行权威清单·承接关系已双向在卷（其 `§1.3` 候选丙→本卷 `§1.2-环③`）；②该卷已入落卷+pre-exec 双审在途流程·回改卷面=洗史+扰动在途审计；③若双审面要求其卷同步知悉→归协调方沿其 §9 append 先例补一行注记（不改其 §0-§8 原文）。**Ban 本席跨树代改 qbank 卷**。

## §7 markers=0 + 起草自检登记（如实载·含红停）

- 本刀改动集（起草 turn=本卷 1 .md）**五类标记词零命中**（起草席亲跑·运行时组装词面+冲突标记对·回执随 EXEC 收据留痕·词面不复抄卷内防自匹配）。
- **起草自检登记**：①`node scripts/ai-docs/check-docs.mjs` 改前基线 EXIT=0 `scanned 2151`（亲证）·落卷后实测值随 commit 记（预期 2152 ≤ 2160 绿）；②markers 五类亲跑零命中；③V1/V2 恒等断言 27 臂全 PASS（起草席 node 亲证·本席开发树裸跑 node -e·零仓面写入零 prove）·rg 盲区五组活证 EXIT 原值在卷 §1.1。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本卷不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1-修法逐处转义定稿与 §5 Ban/pins 与 §1.2 归因结论**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做·§0.2 漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/位点漂移·或 §0.0 五在飞分支对 8 文件新增提交·或 `:52` POLICY 转义形/`:195-:245` CONTROL 使用点语义变→停·重 pin 回炉。
- **机制不满足**：**转义后任一处字节不恒等即停**（V1/V2 任一 FAIL=转义改写前提被证伪）·或主门改后新红/臂集漂移/`:380-385` cache-key 臂非恒等绿→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 8 文件字面量转义域（需触 NUL 运行时值/断言本体/产品语义/PNG/.sql/迁移/全局旗 SOP）→停·另刀或协调方裁决（§1.3 候选乙/丙/丁否决沿承）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 五值越/docs:check>cap）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*NUL-ESCAPE-VISIBILITY REQUEST · 2026-10-14 起草 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`317ea3df`（cap 2160 sanction 卷 tip）· 分支 `line/nul-escape-visibility` · 工作树 `meetwise-nul`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=协调方派单 brief+qbank-scope-fix 卷 `§1.2-环④`/`§1.3` 候选丙/`§4-④` STILL OPEN 承接链 · 普查定谳=**8 文本文件 19 枚裸 NUL**（python 全仓字节扫描·产品码 3 文件 5 枚+测试 5 文件 14 枚·简报枚举漏计 qbank-generation.proof.ts ×6 已正）+同行伴生 4 枚裸控制字节（0x1f/0x7f/0x07/0x08）+11 PNG 二进制豁免面+.sql 零命中无第 9 文件 · 修法=逐处转义改写定稿 14 位点（模板串 \u0000/串与 regex \x00/注释转义文本·运行时字节恒等 V1 node 断言+regex 语义恒等 V2 电池 27 臂亲证全 PASS·文件恢复 rg 默认旗可见）· 归因=AG39 裁决⑧ rg 普查盲区→qbank-generation.proof.ts 漏枚举→CI 存量红逃检实锤（qbank-scope-fix §1.2-环④ 五组活证本席重演加坐 grep 同族降级）· 候选否决=全局旗纪律化（掩盖非根治）/拔 NUL 换分隔符（cache-key 语义·qbank 卷镜像条款）/gitattributes 豁免（合法化盲区）· 门矩阵（NUL 复扫归零+主门臂级对照二值定谳+qbank 九邻面+neg 687+resume-extract+typecheck 8/8+lint 五值恰等+docs:check 2152≤2160+markers+diff 恰 8 .ts+cache-key 行为恒等直证）· qbank 卷联动=§4-④ 豁免清单文本面全清空·处置建议不动其卷（§6）· 预期零迁移（链 204 头 0204）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设（转义后字节不恒等即停·任一 prove 红即停）· Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP · ⛔push ⛔merge 主线*
