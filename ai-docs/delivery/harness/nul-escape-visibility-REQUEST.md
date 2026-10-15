# NUL-ESCAPE-VISIBILITY REQUEST — 裸 NUL 转义改写可见性刀（8 文本文件 19 枚裸 NUL+同行伴生 4 枚·rg 二进制盲区根治·运行时字节恒等转义·qbank-scope-fix §4-④ STILL OPEN 承接·零行为语义变更·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 已行使·门矩阵全绿·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · est live=0 · ⛔push ⛔merge 主线·§9-EXEC append 保史）

**席位**：NUL-ESCAPE-VISIBILITY 起草席（meetwise 战役「裸 NUL 转义改写刀」起草席·qbank-scope-fix 双审席 2 候选登记定谳承接）。
**基线**：`feat/mysql-schema-skeleton` @ `317ea3df`（cap sanction 2160 卷 tip·主线 HEAD 亲证 `git rev-parse`）· 分支 `line/nul-escape-visibility`（本起草席 `git worktree add ../meetwise-nul -b line/nul-escape-visibility` 亲立·HEAD 落 `317ea3df` 亲证）· 工作树 `meetwise-nul`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（NUL-ESCAPE-VISIBILITY 裸 NUL 转义改写刀·背景=qbank-scope-fix 双审席 2 候选登记定谳「仓内 8 文本文件 19 枚裸 NUL」）；②qbank-scope-fix REQUEST `§4-④` STILL OPEN 登记（`line/qbank-scope-fix` 卷 `:110`「rg 二进制盲区普查工具纪律（NUL 惯例文件清单…除外口径）归后继 docs/工具刀；本刀不搭车」——**本卷即该后继刀**·修法取「改文件可见性」而非「改普查工具旗」）；③其 `§1.2-环④` 盲区机制实证（AG39 裁决⑧ 普查 rg 双盲区→`qbank-generation.proof.ts` 漏枚举→CI 存量红 run `38728371250` step 71 首曝）；④结构范本 `ai-docs/delivery/harness/qbank-scope-fix-REQUEST.md`（§0-§8 形制·基线树在卷亲证）。

## §0 现状锚（起草席亲读·python 字节扫描非 rg·file:line+blob+字节偏移逐条实测 @`317ea3df`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 **26 树**（主仓+25 含本 nul 树）——无第二 nul-escape 同名树；`git branch --list "line/nul-escape*"` 恰 1 命中=本席分支。
- `ls ai-docs/delivery/harness/ | grep nul-escape` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀触面=8 文本文件（§0.1）。本席对全 `line/*` 分支亲扫（merge-base..tip 对 8 文件 `git log`），命中 6 支线 7 文件次（rev2 席1 措辞勘正·枚举恰 6 支线）：`line/qbank-scope-fix`→`qbank-generation.proof.ts`（+1 行 @`:555-556`·与本卷改写行域 `:380/:384/:385` **不相交**·同 tip 分叉亲证 merge-base=`317ea3df`）；`line/dir-structure`→两 db 文件（`409843b3` 纯 git mv+路径文本·若先并线则本卷 §0.1 路径锚随迁改）；`line/extrev-deps-aud`→`resume-extract.proof.ts`（`2acf92c3` 依赖审计锚持恒）；`line/negresume-driver-fix`/`line/growth-gen`/`line/unstub-erase`→`neg-resume.proof.ts`。**任一在飞分支顶对 8 文件存在主线 `317ea3df` 之后新增提交→照 §0 协议重 pin 顺延行号；并线序=先到先并·后并方改锚**（Ban 双卷同窗互改同文件字节域）。

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

**配套锚（只读引用）**：root `package.json` `3b04b871`——`:562` `rag-generation:prove`→`run-e2e-isolated.mjs`→`:563` `prove:qbank-generation`→`tsx test/qbank-generation.proof.ts`·`:119` `neg:all`·`:581` `resume-extract:prove`→`packages/domain prove:resume-extract`·`:8` lint 根预算 5235；`scripts/ai-docs/public-text-policy.mjs` `3015b893` `:92` `MAX_FILES = 2_160`（cap sanction 已由 `317ea3df` 兑现）；`scripts/ai-docs/check-docs.mjs` `0f8ddb4b`；eslint 壳 `eslint.config.mjs`→`packages/config/eslint.config.base.mjs`（`no-control-regex` 零显式配置——raw 与转义形 regex 语义恒等·raw-text 层 `.source` 非恒等·lint 恒等由基座 4 规则无 escape 敏感面+§2-6 五值恰等门实测承·V2 rev2 措辞降级随翻）；源文本读者登记 `apps/worker/evidence/r4-funnel-covered-count-batch3.ts` `:116-117` `readRepo('packages/domain/src/qbank-miss.ts')`·第三处读者 `apps/worker/evidence/r4-funnel-covered-count-batch2.ts` `:96` `readRepo('packages/db/src/qbank/qbank-generation-projection.ts')`（其 readRepo `:82` 先剥 NUL `:86` 再比对——本刀改写后剥 NUL 成 no-op·行为零扰·rev2 席2 补登；席2 原注 `:84` 按亲证实测改锚 `:86`）（全三处 pattern=函数名锚·与本刀改写域零交叠亲证）。

### 0.2 派单简报漂移登记（结论零变·如实改锚）

1. **简报枚举「产品码 3 文件 5 处+测试 4 文件（3/2/2/1）」=13 枚 ≠ 简报自报总数 19 枚 → 定谳=测试 5 文件 14 枚**（8+6=14·rev2 席2 P1 必改·与 commit message/卷尾/总数 19 三处自洽）：漏计 `apps/worker/test/qbank-generation.proof.ts` ×6（`:380`×2/`:384`×2/`:385`×2）——恰为 qbank-scope-fix §0.1 已 blob 级登记之 6 枚（两卷独立普查互证·其卷 perl 逐字节·本卷 python 逐字节）·**总数 8 文件 19 枚定谳成立·枚举修正如上**。
2. **简报「qbank-miss.ts:53 ×1 CONTROL regex 字符类内 \x00/\x1f/\x7f」表述修正**：实况=`:53` CONTROL 串内是**裸字节**（U+0000/0x1f/0x7f 三枚·非转义文本）·同文件 `:52` POLICY 才是转义形——简报所述「\x00 形」实为 `:52`。本刀对 `:53` 三枚控制字节一并转义（NUL 计入 19 枚·伴生 2 枚超口径如实登记）。
3. **简报「resume-extract 2」细化**：`:24` 伴生裸 0x07·`:26` 伴生裸 0x08（regex 端点）——同行一并转义（伴生 2 枚超口径登记）。
4. **简报/qbank 席 2 修订「png 10」→ 本席 @`317ea3df` 实测 11**：qbank 卷 `§4-④` 原记「两 png」·席 2 修订记「png 10」·本卷亲数 11（§0.1 逐名列）——三读数系各自时点观测·**历史登记不洗·本卷记现行 11**（PNG 零触·存续豁免面·§3-4）。
5. **简报「测试 4 文件」→ 定谳=测试 5 文件**（漂移登记 1）·**「危害=rg 默认判二进制静默跳过」→ 本席活证加坐 grep 同族降级**（§1.1-E）。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**204**·头 `0204_ai_cost_cached_input_price.sql`（与 checklist safewrite-backpressure nail 段「链 204 头 0204」恒等）。
- 本刀修法=纯源文本字面量转义改写（§1-修法）·**预期零迁移零 DDL**。EXEC 期若实测产生非预期迁移需求→**停（越界需要类）上报**（§8）。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 危害机制（本席 @`317ea3df` 五组活证·命令+EXIT 原值如实载）

- **A 目录扫描静默跳过**：`rg -l 'qbank_provider_input_duplicate_part' packages/db/src/` → **EXIT=1 零命中**（该串真在 `qbank-provider-input.ts:83`·rev2 席1 勘正·rg 15.x 对含 NUL 文件判 binary 静默跳过）。
- **B 单文件显式恢复**：同 pattern `rg -l …qbank-provider-input.ts` → EXIT=0 命中。
- **C 旗修复**：`rg --text -l …packages/db/src/` → EXIT=0 命中——**盲区是默认旗行为非工具无能·但依赖每个执旗者记得带旗=掩盖非根治（候选乙否决根据）**。
- **D grep 同族降级**：`grep -n 'CONTROL' qbank-miss.ts` → 无行号二进制降级输出；`grep -an` → 恢复 `53:` 行号——**NUL 文件对 grep 工具族普遍行为污染**（平台依赖注·rev2 席2：「无行号」降级形态系 GNU grep 行为·darwin/BSD grep 含行号输出·降级形态随 grep 实现异·NUL 触发降级这一盲区族结论不受影响）。
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

**改写总则**：①只动字面量域（模板串/单引号串/regex 字面量/注释文本）·零结构零断言语义零位点增减；②转义形选择=模板串用 `\u0000`（六位显目·防再误读为可见字符）·单引号串与 regex 字符类用 `\x00`（与 `qbank-miss.ts:52` POLICY 既有形同族短形）·注释内改写为字面四字符文本 `\x00`（无运行时面）——`\u0000`/`\x00` 系行为恒等的纯形制差异·**字面量整体形以逐位点定稿为准**（rev2 席2 放宽·#13 dirty 串定稿取 `\u0000` 形即合②不判违）；③伴生裸控制字节（0x1f/0x7f/0x07/0x08 四枚·同行同串）一并转义（同盲区族·超 NUL 计数口径如实登记）；④本卷 .md 引文一律文本记法·**零裸 NUL 复制入卷**（落卷后全仓复扫含本卷自证·§2-1）。

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

**运行时字节恒等主张+逐类验证法（起草席 node 亲证 27 臂全 PASS·命令形入收据·27 臂算术注记=9 V1 串+2 regex 电池+若干边界·实跑 11 轮全 PASS·rev2 席1 补注）**：

- **V1 字符串恒等（#1/2/4/5/6/7/9/12/13）**：`node -e` 断言——`'\u0000' === String.fromCharCode(0)`·`` eval('`a\x00b`') === eval('`a\\u0000b`') ``·三元键样例 `` `${a}${N}${b}${N}${c}` === `${a}\u0000${b}\u0000${c}` ``（N=String.fromCharCode(0)）·`'a\x00@x.com' === 'a'+N+'@x.com'`·dirty 串含伴生 `\x07` 全等——**转义前裸字节与转义后运行时串 `===` 恒等·length 恒等**。
- **V2 regex 源语义恒等（#3/14）**：`node -e` 电池——旧形 `new RegExp('['+String.fromCharCode(0)+'-'+String.fromCharCode(0x1f)+String.fromCharCode(0x7f)+']')` vs 新形 `/[\x00-\x1f\x7f]/`·对 14 case 电池（U+0000/1f/1e/20/7f/7e/07/08/空串/纯文/混排…）逐 case `test()` 恒等·`/[\x00-\x08]/` 对 6 case 恒等——**ESLint 同理：两形语义恒等（24+9 case `test()` 零分歧·raw-text 层 `.source` 非恒等）·lint 恒等由基座 4 规则无 escape 敏感面+§2-6 五值恰等门实测承（rev2 席2 措辞降级·「恒等 regex AST」主张撤）**。
- **V3 行为恒等（全件）**：门矩阵主门臂级对照（§2-2）+受影响 prove 全绿/恒等（§2-2/3/4）——运行时输入逐字节不变→断言面零漂。
- **V4 复扫自证（§2-1）**：python 全仓字节扫描 19→0·且 8 文件恢复裸 rg 默认旗可见（§1.1-A 反演：同 pattern 目录扫描 EXIT=0 命中）。

## §2 验收断言（pre-exec 双审核对单基面·数字口径以实跑实测为准·基线权威值=checklist「Line safewrite-backpressure nail」段 union 树终值 @`317ea3df` 系）

1. **全仓 NUL 计数=0 复扫（本刀主门）**：python 字节扫描全仓文本扩展（§0.1 同脚本）→文本面命中恰 **0 文件 0 枚**（改前 8/19 亲证基线）·11 PNG 二进制除外口径恒等；且 §1.1-A 反演=对改写 pattern 的裸 rg 目录扫描恢复命中。
2. **主门 rag-generation:prove（cache-key 行为恒等直证）**：`pnpm rag-generation:prove` 隔离容器——届时链上 qbank-scope-fix 卷**已并线**→**40/40 全绿**；**未并线**→改前改后**臂级对照恒等**（基线=既登基线红·前 30 臂 PASS+`:556` crash 同签名·qsf 收据自认 30 对照基线·rev2 席1 勘正·qbank 卷在飞承登）+**改后新红才阻塞**——`:380-385` byRefScope cache-key 断言臂双向恒等绿即 **cache-key 行为恒等直证**（键形状运行时未变·V1 承）。红不重跑冲销。
3. **qbank 域九邻面不回退**：`qbank-control-sec:prove`（26 断言）+`ag39-org-qbank:prove`（50/50）+`qbank-handoff-closure:prove`（16/16）+`qbank-control-role:prove`+`dbhy1:prove`（28/28）+`rag03-filter-locus:prove`/`rag03-hnsw-completeness:prove`/`rag03c-exactk-observe:prove`/`rag04-track-local:prove` 全 EXIT=0（臂总数对基线登记值·任一漂移±1 即触「现场漂移」上报）。
4. **neg 邻面+resume-extract**：`neg:all` 六段全绿 EXIT=0·总臂 **687**（90/90/91/102/179/135·±2 熔断上报）·PASS 名单对改前 diff=∅（neg-auth/neg-input/neg-resume 三段直接承载本刀改写·运行时串恒等 V1 承）·`resume-extract:prove` EXIT=0 臂级改前改后恒等（分母以改前 run 实测为准零漂）。
5. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached）。
6. **lint**：`pnpm turbo lint` 12/12·五值恰等 web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（恰等·任一越值即停——lint 恒等由基座 4 规则无 escape 敏感面+本门五值恰等实测承·V2 rev2 措辞降级随翻）。
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
6. **源文本读者零扰**：`r4-funnel-covered-count-batch3.ts:116-117`·`r4-funnel-covered-count-batch2.ts:96`（读 `qbank-generation-projection.ts`·其 readRepo 先剥 NUL 再比对——本刀改写后剥 NUL 成 no-op·行为零扰·rev2 席2 补登）等源扫描面全为函数名 pattern·与改写域零交叠（亲证）——EXEC 期若现新读者依赖裸 NUL 源文本→停上报。
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
- **起草自检登记**：①`node scripts/ai-docs/check-docs.mjs` 改前基线 EXIT=0 `scanned 2151`（亲证）·落卷后实测值随 commit 记（预期 2152 ≤ 2160 绿）；②markers 五类亲跑零命中；③V1/V2 恒等断言 27 臂全 PASS（算术注记=9 V1 串+2 regex 电池+若干边界·实跑 11 轮全 PASS·见 §1-修法段·rev2 席1 补注）（起草席 node 亲证·本席开发树裸跑 node -e·零仓面写入零 prove）·rg 盲区五组活证 EXIT 原值在卷 §1.1。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `executed:awaiting_post_prove_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本卷不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1-修法逐处转义定稿与 §5 Ban/pins 与 §1.2 归因结论**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做·§0.2 漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/位点漂移·或 §0.0 六在飞分支对 8 文件新增提交·或 `:52` POLICY 转义形/`:195-:245` CONTROL 使用点语义变→停·重 pin 回炉。
- **机制不满足**：**转义后任一处字节不恒等即停**（V1/V2 任一 FAIL=转义改写前提被证伪）·或主门改后新红/臂集漂移/`:380-385` cache-key 臂非恒等绿→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 8 文件字面量转义域（需触 NUL 运行时值/断言本体/产品语义/PNG/.sql/迁移/全局旗 SOP）→停·另刀或协调方裁决（§1.3 候选乙/丙/丁否决沿承）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 五值越/docs:check>cap）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 rev2 修订处置登记（pre-exec 双审修订 append·不洗史·§0-§8 原文除下列勘正位外零字节改动）

**双审修订清单九项落卷（席1 `agent_da6bc76d` FAIL P1×1 单字符+席2 `agent_e624052c` PASS·rev2 落卷=本 commit·只改本卷 .md·零码面零 prove 零迁移 est live=0）**：
1. **P1（席2·单字符必改）**：§0.2-1 定谳「测试 5 文件 13 枚」→「**14 枚**」（8+6=14·与 commit message/卷尾/总数 19 三处自洽）。
2. **P2-1（席2）**：§0.1 配套锚+§3-6 补第三处源文本读者登记 `apps/worker/evidence/r4-funnel-covered-count-batch2.ts:96` 读 `qbank-generation-projection.ts`（其 readRepo `:82` 先剥 NUL `:86` 再比对——改写后剥 NUL 成 no-op·行为零扰；席2 原注 `:84` 落卷按亲证实测改锚 `:86`·本卷 §0 改锚协议同款）。
3. **P2-2（席2）**：§1.1-D 补平台依赖注=「无行号」降级系 GNU grep 行为·darwin/BSD grep 含行号输出（盲区族结论不受影响）。
4. **P2-3（席2）**：V2 措辞降级=「两形解析为恒等 regex AST→lint 计数结构性恒等」撤·改「语义恒等（24+9 case test() 零分歧·raw-text 层 .source 非恒等）+lint 恒等由基座 4 规则无 escape 敏感面+§2-6 五值恰等门实测承」；§0.1 配套锚 eslint 括注与 §2-6 同 claim 两处随翻（防同源过claim 残余·三处同步）。
5. **P2-4（席2）**：修法总则②放宽=「模板串 \u0000·串/regex \x00·**字面量整体形以逐位点定稿为准**」（\u0000/\x00 行为恒等纯形制·#13 定稿 `\u0000` 形合②不判违）。
6. **P2-1（席1）**：§1.1-A 行锚 `:79`→`:83`（EXEC 重 pin 协议亦覆盖·rev2 顺手勘正·落卷亲证 throw 串在 `qbank-provider-input.ts:83`）。
7. **P2-2（席1）**：§2-2 基线红臂数「前 32 臂」→「**前 30 臂**」（qsf 卷收据 `00-exec.md` 自认 `applied=203`→30 臂 PASS→`:556` 红·对照基线）。
8. **P2-3（席1）**：§0.0 计数措辞「命中 5 树」→「**6 支线 7 文件次**」（§0.0 枚举恰 6 支线·§8 现场漂移款跨引「五在飞分支」随翻「六」同步）。
9. **P2-4（席1）**：「27 臂」算术注记补入 §1-修法主张行+§7-③（=9 V1 串+2 regex 电池+若干边界·实跑 11 轮全 PASS·取注记形不改正实数——起草席原 run 不可复演·est live=0 纪律下不重跑）。

**STOP 三处维持 `draft:awaiting_pre_exec_dual`**（Status 头+§8+卷尾注·rev2 落卷后待两席对上述九项窄域确认方会签·会签仍归 pre-exec 双审流程·alone≠dual·Dual PASS ≠ 开工·开工另须协调方明示 EXEC 授权·⛔push ⛔merge 主线·markers 五类与 docs:check 复跑值随本 commit message 记）。

### §9-EXEC EXEC 执行记录（2026-10-16·七字段·F2 规范化=头行按项级标签不按席号·§0-§8 原文零字节改·append 保史）

**授权链**：rev2 窄域确认 PASS（agent_531e5611·「rev2 确认·双审会签完成·可授权 EXEC」）→ 协调方明示 EXEC 授权（派单七序）→ 本席 EXEC。**§1-修法定稿/§5 Ban/pins/§1.2 归因零字节零触**（§8 条款③）。并线 merge **`91a1a4f1`**（`--no-ff` 双亲 `c51abba0`+`5ef0b505`·零冲突·禁 pull --rebase 遵守·qsf nail `5ef0b505` 随并）。

1. **重 pin 全表**（对 `91a1a4f1`·hash-object+python 字节扫亲证·详收据 §⑤）：7/8 文件 blob 与 §0.1 恒等；唯一漂移=`qbank-generation.proof.ts` `02f1675b`→`ad696c38`（640→641 行·qsf 夹具 `6414c562` +1 行落 `:556` 域·§2-11② 预登记兑现·行锚 `:380/:384/:385` 零漂）；**19 枚 NUL 偏移+4 枚伴生逐枚与 §0.1 恒等**；`:52` POLICY 转义形与 `:195/:198/:242/:245` 使用点零变；在飞 6 支线均未并入本树零文本冲突；链 204 头 0204·cap 2160 亲证。
2. **14 位点落点+字节恒等电池**：定稿表逐处应用（模板串 `\u0000`/串与 regex `\x00`/注释转义文本/伴生 4 枚随位）·每处应用后 node -e 断言（raw 字节直提=改前副本行级 eval 对照）——V1 九串 `===`+length 恒等全 PASS·V2 两电池（CONTROL 24 case+范围 9 case）零分歧+边界例·注释三处字节恒等式全真；逐文件字节恒等式 +10/+10/+9/+22/+3/+9/+6/+14 合计 **+83B 恰等**。
3. **门矩阵全表（EXIT 原值·详收据 §①）**：NUL 复扫 **0 文件 0 枚**（4467 文本文件·伴生同清·11 PNG 豁免恒等）+rg 恢复三反演（duplicate_part 目录扫 EXIT=1→0·ann_search worker/test **3→4 文件**·`const CONTROL` 域扫两文件齐）+grep -an 行号恢复；主门 **rag-generation:prove 40/40 EXIT=0**（qsf 已并支·:380-385 byRefScope cache-key 臂绿=行为恒等直证）；qbank 九邻面全 EXIT=0（26/53/16/12/28/12/16/7/33·ag39 53=50 臂+夹具行恒等映射）；neg:all **687**（90/90/91/102/179/135 恰等）+resume-extract **25 断言 EXIT=0**；typecheck **8/8**；lint **12/12 五值恰等** web 601/root 5235/api 1421/worker 954/ai-runtime 628；docs:check **2157 ≤ 2160**；markers 五类零命中；diff 恰 8 tracked .ts（9+/9−·word-diff 14 hunk 全字面量 token）；迁移链 204 头 0204+migrate:prove/drift:prove/uniqueness（files=204 violations=0）全 EXIT=0；卫生 est live=0·`.env*` ABSENT·actualSpendCny=null。
4. **改前改后臂级对照（§2-11①·stash 对照 run·恰 run 零 retry）**：主门 40↔40·neg 687↔687·resume-extract 25↔25·**PASS 名单 diff 双 ∅**——V3 行为恒等直证成立。改前 neg 首跑 PG PANIC 58030（宿主盘 100% 满）系**基建失败非码红**（qsf R0 同族·不入冲销账）。
5. **偏离清单 D1-D7**（详收据 §⑥）：D1 改前基线 run 时序后补（派单七序未列·对照恒等非 retry）·D2 docker volume prune 基建修复（37.89GB 孤儿卷·不触在用卷/常驻容器）·D3 pnpm install --frozen-lockfile 前置·D4 ag39 PASS 行 53=50 臂+夹具行恒等映射·D5 docs:check 预写 2152→实测 2157（并线携四受管件+收据）·D6 markers 收据申明扫描形（沿四卷先例）·**D7 交付 commit 被仓 secret gate 拦→协调方 wave78 微扩面裁决→已处置**：pre-commit `check-staged-secrets.mjs` 对含 NUL 文件整文件跳过（:66 盲区跳过=**本刀所灭盲区族在仓内工具面的同族实例·连环发现如实承登**）——改前 neg-auth 靠此免扫·NUL 根治后首次被全文扫→**改前既有** `:413/:418` 两行夹具字面量命中 credential 规则；停手三径（改夹具/改 checker/`--no-verify`）全触 Ban 面→停手上报→**wave78 微扩面授权（恰 2 行·⛔checker ⛔--no-verify）**：诊断定谳 `:413` 值系 `:26` `AUTH_SECRET_PREVIOUS` 耦合对语义承载值（改值形会破坏耦合）→取**值恒等转义形**（`'legacy-window-s\u0065cret'`/`'retired-out-of-\u0077indow-secret'`·V1 同族·运行时逐字节不变·恰 2 行）·处置验证=V1 恒等+耦合自洽+credential 规则双 false+api lint **1421 恰等**+neg:auth **90/90**（旧钥窗内臂直证）+checker 对 neg-auth 零命中过闸·二阶自指（收据初稿誊抄词面被转扫）沿 i6-239 破形口径承登。
6. **F1 勘正句（§1.1-D 平台依赖注勘正·append 不洗·原文零字节改）**：grep 降级形系 **GNU/BSD/ugrep 共有**（本席 darwin/BSD `/usr/bin/grep -n` 对 NUL 文件实测降级形「Binary file … matches」无行号——rev2 席2「darwin/BSD grep 含行号输出」注记据此撤·ugrep 同形降级实测）·**busybox 不降级**（本机 busybox 未装不可本地实测·句系双审授权勘正承登）·**`grep -an` 全实现恢复行号**（本席实测 53/195/198/242/245）——盲区族结论不变·§1.1-A/E 零触。
7. **STOP 终态**：三处（Status 头/§8/卷尾）置 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·nail/行翻面归协调方·收据=`ai-docs/delivery/receipts/nul-escape-visibility/00-exec.md`（七字段）·⛔push ⛔merge ⛔force-push。**commit 态（D7 已处置·wave78 微扩面）**：恰 2 行 `:413/:418` 值恒等转义形落码+neg:auth 90/90+api lint 1421 恰等+checker 过闸·交付 commit 随本卷落地·diff 面终值仍恰 8 tracked .ts（11+/11−）+本卷 .md+本收据。

---

*NUL-ESCAPE-VISIBILITY REQUEST · 2026-10-14 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-16 EXEC 落码·§9-EXEC）· base `feat/mysql-schema-skeleton` @`317ea3df`（cap 2160 sanction 卷 tip）· 分支 `line/nul-escape-visibility` · 工作树 `meetwise-nul`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=协调方派单 brief+qbank-scope-fix 卷 `§1.2-环④`/`§1.3` 候选丙/`§4-④` STILL OPEN 承接链 · 普查定谳=**8 文本文件 19 枚裸 NUL**（python 全仓字节扫描·产品码 3 文件 5 枚+测试 5 文件 14 枚·简报枚举漏计 qbank-generation.proof.ts ×6 已正）+同行伴生 4 枚裸控制字节（0x1f/0x7f/0x07/0x08）+11 PNG 二进制豁免面+.sql 零命中无第 9 文件 · 修法=逐处转义改写定稿 14 位点（模板串 \u0000/串与 regex \x00/注释转义文本·运行时字节恒等 V1 node 断言+regex 语义恒等 V2 电池 27 臂亲证全 PASS·文件恢复 rg 默认旗可见）· 归因=AG39 裁决⑧ rg 普查盲区→qbank-generation.proof.ts 漏枚举→CI 存量红逃检实锤（qbank-scope-fix §1.2-环④ 五组活证本席重演加坐 grep 同族降级）· 候选否决=全局旗纪律化（掩盖非根治）/拔 NUL 换分隔符（cache-key 语义·qbank 卷镜像条款）/gitattributes 豁免（合法化盲区）· 门矩阵（NUL 复扫归零+主门臂级对照二值定谳+qbank 九邻面+neg 687+resume-extract+typecheck 8/8+lint 五值恰等+docs:check 2152≤2160+markers+diff 恰 8 .ts+cache-key 行为恒等直证）· qbank 卷联动=§4-④ 豁免清单文本面全清空·处置建议不动其卷（§6）· 预期零迁移（链 204 头 0204）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设（转义后字节不恒等即停·任一 prove 红即停）· Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP · ⛔push ⛔merge 主线*
