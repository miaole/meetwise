# SECRET-CHECKER-NUL-GUARD REQUEST — checker NUL 整文件跳过盲区修复刀（受管文本扩展拒收 fail-closed·二进制照旧跳·NUL-ESCAPE 连环发现承登链承接归位·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 已行使·门矩阵全绿·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·est live=0·⛔push ⛔merge 主线·§9-EXEC append 保史）

**席位**：SECRET-CHECKER-NUL-GUARD 起草席（meetwise 战役「SECRET-CHECKER-NUL-GUARD checker NUL 盲区修复刀」起草席·nul-escape-visibility 卷连环发现承登链「归后继工具刀」承接）。
**基线**：`origin/feat/mysql-schema-skeleton` @ `d186dffc`（=sbg nail 收官 tip·本席 fetch 后 REMOTE tip 亲证·NUL nail `0036ddd8` 在祖 `git merge-base --is-ancestor` 亲证 YES）· 分支 `line/secret-checker-nul-guard`（本起草席 `git worktree add ../meetwise-scn -b line/secret-checker-nul-guard origin/feat/mysql-schema-skeleton` 亲立·HEAD 落 `d186dffc` 亲证）· 工作树 `meetwise-scn`（仓根同级）。注：主仓本地 HEAD=`1824b2d9`（cap sanction 卷·落后 origin tip 6 提交）——本支线直锚 origin tip 非主仓 HEAD。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（SECRET-CHECKER-NUL-GUARD·背景=`scripts/check-staged-secrets.mjs:67` 对含 NUL 文件整文件跳过=credential 规则盲区·全仓 NUL 已清零 19→0 正是修 checker 窗口期）；②NUL-ESCAPE-VISIBILITY 卷 `§9-EXEC-5-D7` 承登（盲区活体行为实录：改前 neg-auth 夹具靠 NUL 整文件跳过免扫·NUL 根治后首扫即曝 `:413/:418`→wave78 微扩面处置——盲区被该卷如实承登为连环发现）；③NUL nail `0036ddd8` P2-1 行号勘正（checker 跳过机制 :66→**:67**·「连环发现行号口径以此为准**归后继工具刀**」）+checklist「Line nul-escape-visibility nail」段同链登记——**本卷即该后继工具刀**；④结构范本 `ai-docs/delivery/harness/nul-escape-visibility-REQUEST.md`（§0-§9 形制·基线树在卷亲证）。

## §0 现状锚（起草席亲读亲证 @`d186dffc`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 **34 树**（主仓+33 含本 scn 树）——无第二 secret-checker 同名树；`git branch --list "line/secret-checker-nul-guard"` 恰 1 命中=本席分支。
- `ls ai-docs/delivery/harness/ | grep secret-checker` 建前 **0 命中**→落卷后唯一同名卷=本卷。
- **在飞交叠复核**：全 `line/*` 分支对双触面文件（checker+policy）merge-base..tip 扫描——唯一命中=`line/uc003-followup` 其触面提交系纯并线 merge `500eb39a`（其卷自记 merge-base=支线 tip·零独有码改）·对 policy 树 diff +1/−3 系其缺主线 `1824b2d9` cap 2176 sanction 注记（滞后向·非新增改写）·**checker 文件零 diff**。并线序=先到先并·后并方改锚。**cap sanction 高频面注记**：policy `:40-95` cap 注记块系 sanction 高频写入域·本刀 policy 触面仅 `:39` 恰 1 token·与注记块不相交·冲突预期零。
- **在飞重扫协议（EXEC 立项日必做）**：重跑本节全 `line/*` 扫描+§0.1 blob 对表·任一漂移→照 §8 现场漂移款停·重 pin 回炉。

### 0.1 blob 锚表（`git hash-object` 亲算 @`d186dffc`）

| 文件 | blob（8 hex） | 行数 | 本刀触面/引用锚 |
|---|---|---|---|
| `scripts/check-staged-secrets.mjs` | `73fbaba4` | 88 | **修法主面**。行图：`:2` import policy 三符（单一事实源先例注释 `:25-27`）·`:4-23` credentialPatterns 恰 5 规则（Alibaba AccessKey/AWS access key/GitHub token/sk-style API key/`:21` credential assignment 引号字面量形·`:15-19` 双误报放行注释）·`:28-34` cloudIdentifierPatterns（filter PRIVATE_KEY+CLOUD_IDENTIFIER→恰 4 正则·API_KEY 类由 credentialPatterns 覆盖不重入）·`:36-44` stagedFiles（`git diff --cached --name-only -z --diff-filter=ACMR`）·`:46-49` isForbiddenEnvironmentFile（.env/.env.* 非 *.example）·`:51-57` stagedContent（`git show :path`·异常→null）·`:59` findings 数组·`:61-64` env finding·**`:66-67` 盲区位（`content===null \|\| content.includes('\\0')` → continue 整文件跳）**·`:68-70` credential 规则 test·`:71-79` identifier matchAll+isSyntheticIdentifier 放行（SYNTHETIC 2 形精确放行）·`:82-86` findings>0→banner+逐条+exit 1·`:88` 过闸 log（隐式 exit 0） |
| `.githooks/pre-commit` | `247c4290` | 4 | 接线锚：`set -euo pipefail`+`node scripts/check-staged-secrets.mjs`·生效机制=`core.hooksPath=.githooks`（repo config·worktree 共享 common dir·`git config core.hooksPath` 亲证）——交付 commit 自身即过本门 |
| `package.json` | `3b04b871` | 675 | `:42` `"secrets:check-staged": "node scripts/check-staged-secrets.mjs"`（手跑路径）·`:8` lint 根预算 5235·`:119` `neg:all` |
| `scripts/ai-docs/public-text-policy.mjs` | `b7281d11` | 394 | **修法副面（恰 1 token）**。`:39` TEXT_EXTENSIONS 恰 23 扩展（.md/.mdx/.mjs/.cjs/.js/.ts/.tsx/.mts/.cts/.json/.yaml/.yml/.sql/.sh/.toml/.conf/.service/.timer/.html/.css/.txt/.pem/.py·现系模块私有 const）·`:96` MAX_FILES 2_176（cap 2176 sanction 已在祖·**零触**）·`:191-199` CLOUD_IDENTIFIER_RULES 7 条·`:202-208` SYNTHETIC_IDENTIFIER_PATTERNS 2 条+isSyntheticIdentifier·`:376-391` scanPublicTextPolicy 循环对 NUL 内容**无跳过逻辑**（§1.1-C 对照用） |
| `.gitleaks.toml` | `323de9b0` | 33 | 第二扫描面配置：`[extend] useDefault=true`+FP allowlist（7 paths+3 regexes·头注 Ban 藏真凭据句）·**零触** |
| `.github/workflows/ci.yml` | `97252708` | 361 | `:18-19` gitleaks-action pinned SHA（v2）=CI 全历史默认规则面·**零触** |

**窗口期不变量亲证（本席 python 字节扫 @`d186dffc`·TEXT_EXTENSIONS 23 扩展同口径）**：tracked 文本扩展文件 **4781**·裸 NUL **0 枚 0 文件**（11 PNG 二进制豁免面恒等）——nul-escape 根治不变量在 tip 成立·「修 checker 窗口期」主张亲证。迁移链 204 头 `0204_ai_cost_cached_input_price.sql`。

### 0.2 派单简报漂移登记（结论零变·如实改锚）

1. **简报「:67 跳过机制」**：@`d186dffc` 亲证零漂（`:67` 恒等·checker 触面对主仓 HEAD `1824b2d9` 亦零 diff）·零勘正。
2. **简报「.md/.ts/.mjs/.sql 受管文本扩展才拒」→ 定谳=TEXT_EXTENSIONS 规范 23 扩展全集**：简报 4 枚系子集示例；拒收面若窄于 census 口径（nul-escape §0.1 即按全 23 扩展全扫定谳 19→0）则 .json/.yml/.sh/.tsx 等扩展的 NUL 回潮仍静默跳过=盲区留半窗。定谳取单一事实源 import——checker `:25-27` 自家先例注释同款原则（避免两处正则漂移）·**扩展集双处复制=本刀所灭疾病的同族复发路径·Ban**。
3. **简报「diff 恰 1 tracked」→ 双读数定谳**：起草 turn=恰 1 tracked（本卷 .md·本 commit 满足）；EXEC 码面=**恰 2 tracked**（policy `:39` export 1 token+checker 守卫·单一事实源必需）·另本卷 .md append 随卷。多任何 tracked 即停。
4. **简报「候选甲/乙/丙」三分 → 本席加列甲′（本地复制扩展集）与乙′（照扫不剥）两变体**并入 §1.3 淘汰登记·防 EXEC 期重开。

### 0.3 迁移号登记（预期零迁移）

主线链顶实测 `ls packages/db/migrations | wc -l`=**204**·头 `0204_ai_cost_cached_input_price.sql`（与 checklist sbg nail 段「applied=204」恒等）。本刀修法=纯提交门脚本守卫·**零迁移零 DDL**。EXEC 期若实测产生迁移诉求→停（越界需要类）上报（§8）。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 危害机制（本席 @`d186dffc` 活证·命令+EXIT 原值如实载）

- **A 整文件免扫（盲区本体）**：`:67` `content.includes('\\0') → continue` 位于全部规则（5 credential+4 identifier）**之前**——文件含一枚 NUL 即对 9 规则整体免扫。.env 禁入面（`:61`）在 content 读取之前·不受此盲区影响（唯一例外面·如实登记）。
- **B credential 穿洞活证（A/B 对偶·scratch repo `.tmp/scn-blindproof/`·`.gitignore:15` `.tmp/` gitignored 亲证）**：staged `leak.md`=credential 赋值形字面量（键名 token+引号值·值=openssl rand 现构 20 字节随机·零真实凭据）+**尾随一枚 NUL** → 现行 checker **EXIT=0「Secret gate passed」静默放行**（stderr 全文在收据位 §7-③）；同字面量**去 NUL** 另文件重 staged → **EXIT=1 `- leak2.md: credential assignment` 命中**——**±1 NUL 字节翻转过/拒=盲区最小复现对**·nul-escape D7「改前 neg-auth 靠此免扫」实录机制本席重演加坐。
- **C 两套扫描面分工（读码定谳）**：提交面=check-staged-secrets（staged 内容·自定义 9 规则·fail-closed exit 1·hook 经 core.hooksPath 每次 commit 实跑+package.json `:42` 手跑路径）；CI 面=gitleaks（ci.yml `:18-19` 全历史·useDefault+.gitleaks.toml FP allowlist）——两面互补·**提交面 `:67` 洞 CI 面不自动补**（gitleaks 对 NUL 文件行为本卷未实测·不作主张·诚实登记）。邻面对照：policy 的 docs:check 扫描循环（`scanPublicTextPolicy`）对含 NUL 文件内容**无跳过**（readFileSync 全读·正则全跑）——同仓内 policy 扫描器不盲而 checker 盲·反证 `:67` 系 checker 局部 binary 噪声规避手段（防正则跑二进制误报）·非必要语义·**分面修复=保其原意灭其过宽**。
- **D exitCode 语义现状**：findings>0→console.error+逐条+exit 1（fail-closed 家族）；stagedContent 异常→null→静默 continue（race fail-open·既有边界·本卷零触如实存续）；过闸→log+隐式 0。

### 1.2 归因链（nul-escape 卷承登链·承接非搭车）

- **环①（成因）**：checker 全史恰 2 提交（`e621235b` 门禁脚本入仓→`cc83424b` 审计修订）·以整文件跳过规避 binary 噪声误报·**未设文本/二进制分面**——规避手段（凡 NUL 即跳）宽于必要语义（二进制才需跳）。
- **环②（实录承登）**：nul-escape EXEC `§9-EXEC-5-D7`：其交付 commit 被 secret gate 拦——改前 neg-auth 夹具靠 NUL 免扫·NUL 转义根治后首扫即曝 `:413/:418` 两行→wave78 微扩面处置——**盲区在仓内工具面的活体行为被实录承登为连环发现**。
- **环③（行号勘正+移交）**：NUL nail `0036ddd8` P2-1 勘正 `:66`→`:67`+「归后继工具刀」+checklist 同链——**本卷=该后继工具刀**·承接受权面=协调方派单 brief·行翻面/nail 归协调方。
- **环④（窗口期）**：全仓文本面 NUL 0/0 亲证（§0.1）·11 PNG 豁免恒等——此刻修 checker 零存量面扰动；拖后则任何 NUL 回潮文件继续免扫·census 不变量（19→0）永无执法点（checker=提交时最后一道闸）。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=受管文本扩展拒收 fail-closed**：staged 文件含 NUL 且扩展∈TEXT_EXTENSIONS（23 枚·单一事实源 import）→ NUL 臂·console.error「NUL bytes detected — run nul census」+逐路径+exit 1；二进制/未知扩展照旧整文件跳过（行为恒等）。最严且与 census 不变量对齐：文本面 NUL 本身即已根治条件的回潮·拒收即执法点；NUL 先决拒收使「剥扫放行」无存在空间。
- **候选甲′（否决·Ban）=本地复制扩展集（单文件 diff 诱惑）**：TEXT_EXTENSIONS 双处复制=漂移温床——policy 集合任何后续增删（受管面演进属常态）checker 侧静默脱同步·恰为本刀所灭「工具静默盲区」病的同族复发路径·违 checker `:25-27` 单一事实源自家原则。代价对比：export 1 token 零行为变更 vs 永久漂移面——定谳取 import（漂移登记 §0.2-2/3）。
- **候选乙（否决·Ban）=剥 NUL 后扫**（`content.replace(/\\0/g,'')` 再跑规则）：①宽容面缺陷——NUL 文件静默过闸·文本面 census 不变量失执法点·rg/grep 二进制盲区（qbank-scope-fix §1.2 环④ CI 红逃检实锤）随每枚回潮 NUL 复发；②假修复面——credential 正则 `{12,}/{16,}/{20,}` 连续计数遇 NUL 断键·剥除后**变可命中**·看似增强实为把「结构异常文件」洗成「普通文件」放行·结构问题零报告；③非对价——甲下文件先拒根本不到规则扫描·乙的检测增益被甲完全覆盖·反向不成立。
- **候选乙′（否决·Ban）=照扫不剥**（NUL 内容直接跑规则不跳过）：同乙①②·NUL 静默回仓；且若 binary 面也照扫·PNG 等二进制噪声入正则=新增误报面（`:67` 原始规避意图被无据推翻·越权改二进制语义）。
- **候选丙（否决·Ban）=维持现状+文档**：盲区维持·nul-escape 承登链无收口·D7 实录行为永久化·窗口期（0/0 不变量）空耗——Ban。

## §1-修法（两文件定稿·预期恰 2 tracked 码面·零迁移零产品行为语义变更）

**修法总则**：①policy 模块除 `:39` export token 外**零字节**（其自身扫描行为与全部 PTP 规则零变·isManagedPath 内部引用零改）；②checker 三编辑=import 行（+TEXT_EXTENSIONS·新增 `extname`）+`:59` 邻加 `nulFindings` 数组+`:66-67` 盲区位改 NUL 分面臂+`:82` credential banner 块**之前**插拒收 banner 块；③规则面（5 credential+4 identifier+.env 禁入+isSyntheticIdentifier 放行）断言语义零字节；④二进制/未知扩展与 content===null race 语义零字节（照旧跳·既有边界如实存续）；⑤exitCode 语义：NUL 臂与 credential 臂同级 blocking（fail-closed 家族·NUL banner 前置=结构问题先修语义·混合双罪时 NUL 先报·修 NUL 后次跑 credential 面自然曝出=两罪不脱漏）。

**定稿（EXEC 逐字节套用·fenced 块为唯一权威形）**——

编辑1·policy `:39`（恰 1 token）：
```js
export const TEXT_EXTENSIONS = new Set(['.md', '.mdx', '.mjs', '.cjs', '.js', '.ts', '.tsx', '.mts', '.cts', '.json', '.yaml', '.yml', '.sql', '.sh', '.toml', '.conf', '.service', '.timer', '.html', '.css', '.txt', '.pem', '.py']);
```
（改前同行少 `export ` 一词·集合成员逐字节不动）

编辑2·checker import 区（`:2` 改+新增 `node:path` 行）：
```js
import { CLOUD_IDENTIFIER_RULES, PUBLIC_TEXT_POLICY_CODES, TEXT_EXTENSIONS, isSyntheticIdentifier } from './ai-docs/public-text-policy.mjs';
import { extname } from 'node:path';
```

编辑3·checker `:59` 邻加数组+`:66-67` 盲区位改分面臂（env 块 `:61-64` 零动）：
```js
const nulFindings = [];
```
```js
  const content = stagedContent(path);
  if (content === null) continue;
  if (content.includes('\0')) {
    // Managed-text extension carrying NUL = the eradicated condition (nul census 19→0) regressing: fail closed.
    // Binary/unknown extensions keep the legacy whole-file skip (gitleaks CI surface's jurisdiction, not this text gate).
    if (TEXT_EXTENSIONS.has(extname(path))) nulFindings.push(path);
    continue;
  }
```

编辑4·checker `:82` credential 块之前插拒收块（banner 串含派单指定语「run nul census」·五要件=〔NUL bytes detected/run nul census/逐路径列表/盲区机理提示/exit 1〕不可缺·其余文案 EXEC 可微调）：
```js
if (nulFindings.length > 0) {
  console.error('NUL bytes detected in staged text files — run nul census. NUL in a text file re-opens the rg/grep binary blind spot; escape or remove the bytes (see ai-docs/delivery/harness/nul-escape-visibility-REQUEST.md).');
  for (const path of nulFindings) console.error(`- ${path}`);
  process.exit(1);
}
```

**行为恒等主张与验证法**：①改前基线=blob `73fbaba4` 行为（§2-1 改前对照臂亲取）；②二进制/无扩展/未知扩展/env 面/规则面五域改前改后行为恒等（battery 对照臂承）；③唯一行为增量=受管文本扩展+NUL → 由静默过闸翻为 exit 1（§1.1-B 对偶反演直证）；④policy 模块 export 前=后模块图恒等（import 面零变·`node --check` 双文件 PASS）。

## §2 验收断言（pre-exec 双审核对单基面·数字口径以实跑实测为准·门序=起草卷既登基线）

1. **fixture battery 八臂（scratch repo `.tmp/` 内·git 隔离仓·cwd 即仓·checker 以绝对路径调·值一律 openssl/head 现构零真实凭据零落卷）**：
   - 臂1 拒收断言：staged `.md` 含 NUL → 改后 checker **EXIT=1**+stderr 含「NUL bytes detected」与「run nul census」+`- <path>` 列表。
   - 臂2 既有规则恒等：同 credential 赋值形字面量**无 NUL** → EXIT=1 `credential assignment`（本席起草对偶活证 §1.1-B 已证改前值·改后同值）。
   - 臂3 二进制照旧跳：staged 构造 `.png`（PNG 签名+NUL 字节）→ **EXIT=0**（跳过语义恒等直证）。
   - 臂4 剥扫否定断言：NUL 文本文件且剥 NUL 后含 credential 形 → **EXIT=1 且 banner=NUL 臂**（非剥扫放行·非 credential 先报）——候选乙/乙′否定断言。
   - 臂5 env 面恒等：staged `.env` → EXIT=1 `environment file must stay local`。
   - 臂6 全净恒等：仅干净文本 staged → EXIT=0+「Secret gate passed」串恒等。
   - 臂7 残余边界行为恒等：**无扩展名文件**含 NUL → EXIT=0（照旧跳·§3-2 残余盲区边界·非缺陷如实承登）。
   - 臂8 改前对照：同 battery 对改前 blob `73fbaba4` 版 checker 复跑——臂1/臂4 改前 **EXIT=0 静默**（盲区直证）·臂3/5/6/7 改前改后同值——A/B 翻转域恰=受管文本扩展 NUL 面。
2. **真仓 staged 面 gate PASS**：EXEC 交付 commit 过 `.githooks/pre-commit` 实跑（core.hooksPath 共享亲证 §0.1）EXIT=0+干树 `pnpm secrets:check-staged` EXIT=0。
3. **neg:all**：`pnpm neg:all` 隔离容器全绿·总臂 **687**（90/90/91/102/179/135·派单指定+§1.2 承登卷在册基线·**±2 熔断上报**·本刀零触测试/产品码·邻面不回退门）。
4. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached）。
5. **lint**：`pnpm turbo lint` 12/12·五值恰等 web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（恰等·任一越值即停）。
6. **docs:check ≤cap 2176**：起草改前基线 EXIT=0 **scanned 2160**（本席亲跑·§7-①）→落卷后 2161 预期；EXEC 码面 2 文件均已在册（零新受管件）→EXEC 期 2161 ≤ 2176 绿。
7. **markers 五类零命中**：本刀改动集（本卷 .md+2 码面）五类标记词+冲突标记对运行时组装词面 grep 零命中（i6-239 口径·词面不复抄卷内防自匹配·命令与回执随 §9-EXEC 落卷）。
8. **diff 面机检**：`git diff --numstat <base>` EXEC 码面恰 **2 tracked**（policy 恰 1 token 行+checker 守卫域）+本卷 .md（EXEC 仅 §9-EXEC append·不洗 §0-§8）——多任何 tracked 路径即停（越界需要类）。
9. **全仓 NUL 不变量复扫**：§0.1 同款 python 字节扫 → 文本扩展 **0 枚 0 文件**恒等（4781 基数登记·11 PNG 豁免恒等）——本刀零引入 NUL。
10. **静态语法门**：`node --check` 双改文件 PASS。
11. **卫生**：est live=0（battery 为 .tmp 隔离 scratch git 仓零外呼·neg:all/typecheck/lint 隔离容器或本地·零模型外呼）·0 Key 值·`.env*` ABSENT 双向记录·`actualSpendCny=null`。
12. **贴边注意（三条·EXEC 必读）**：①改前对照臂必做（臂8·零冲销纪律）；②battery 全程在 `.tmp/` scratch 仓·不触真仓 index（真仓 staged 面只经门2 自然 exercised）；③cap sanction 并线若触 policy `:40-95` 注记块→`:39` 行号照 §0 协议重 pin（触面不相交·零文本冲突预期）。

## §3 范围外（边界清单·越界即 FAIL）

1. **gitleaks CI 面零触**：.gitleaks.toml/ci.yml 零字节——两套扫描面分工维持（§1.1-C）·gitleaks 对 NUL 文件行为不在本卷主张。
2. **残余盲区如实登记非缺陷**：无扩展名/罕见扩展文本文件含 NUL 仍照旧整文件跳（TEXT_EXTENSIONS 外延外）——凭证面由 gitleaks 全历史面管辖·扩面归后继刀候选（归协调方另裁）·本卷不搭车。
3. **规则语义零触**：5 credential+4 identifier 正则·isSyntheticIdentifier 放行·env 禁入·`:82-86` banner 文案·exit 语义全部零字节（§1-修法总则③④⑤仅新增不修改）。
4. **policy 扫描语义零触**：docs:check 面/PTP 全码/scanPublicTextPolicy 循环/MAX_FILES cap 面零字节（唯一触面=`:39` export token）。
5. **11 PNG 二进制豁免面零触**：行为恒等（臂3 直证）。
6. **产品码零触**：apps/packages 零字节·零迁移零 DDL 零依赖升级。
7. **共享 SSOT 零改**：checklist/LEDGER/north-star/backlog 只读引用——批表行翻面权归协调方 nail；nul-escape 卷零回改（其 §9-EXEC-5-D7 系历史登记·本卷承接关系单向在案）。

## §4 依赖

- **①NUL-ESCAPE-VISIBILITY nail（已主线 `0036ddd8` 在 tip 祖）**：本卷=其连环发现承登链「归后继工具刀」承接·窗口期不变量（0/0）系本刀前提（§1.2-环④）。
- **②qbank-scope-fix 卷（已主线）**：rg 盲区逃检实锤（§1.3 候选乙①引证源）·本卷零回改其卷面。
- **③cap 2176 sanction 已兑现**（`1824b2d9` 在祖·本卷余量 16→落卷后 15·零 sanction 诉求）。
- **④`line/uc003-followup`（在飞·滞后向）**：§0.0 已定性零真实交叠·先到先并纪律覆盖。
- **⑤行翻面与 nail 排序归协调方**。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban merge 主线（并线权归协调方 nail）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 触规则正则语义（§3-3·5+4 规则逐字节零动）；Ban 触 env 禁入面语义；Ban 触二进制/未知扩展/null-race 跳过语义（§3-2/§1-修法④）；Ban 剥扫/照扫变体（§1.3 乙/乙′否决）；Ban 扩展集本地复制（§1.3 甲′否决）；Ban 触 policy cap 面 `:40-95` 与 `:96`（§3-4）；Ban 触 gitleaks/ci.yml（§3-1）；Ban 裸 NUL 复制入本卷 .md（沿 nul-escape 总则④·自污染即违本刀主题）；Ban 真实凭据入卷入 fixture（fixture 值一律现构零落卷）；Ban retry-to-green（§2 门恰 run 纪律）；Ban 迁移 Ban DDL（§0.3）；Ban 改共享 SSOT/翻批表（行翻面权归协调方）；Ban 触 nul-escape 卷面（§3-7）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因红靶外新红（邻面新红→如实登记升级）；Ban 造 .env*/写 Key 值；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0 注记

- 起草 turn（本卷）：est live=**0**——零 prove 实跑（全部证据=python 字节扫/node 静态/git hash-object/scratch git 仓 battery/rg·docs:check 与 markers 为本地零外呼脚本·零模型外呼零 Key 加载零 secrets 零消耗）。fixture battery 的 scratch 仓在 `.tmp/scn-blindproof/`（gitignored）·真仓 index 零触（staged 操作全在 scratch 仓内）。
- EXEC 期：battery 同款 scratch 面+neg:all 隔离容器+typecheck/lint 本地——零模型外呼·est live=0（§2-11）。

## §7 markers=0 + 起草自检登记（如实载）

- 本刀改动集（起草 turn=本卷 1 .md）**五类标记词+冲突标记对零命中**（起草席亲跑·运行时组装词面+冲突标记对·词面不复抄卷内防自匹配·回执随 EXEC 收据留痕）。
- **起草自检登记**：①`node scripts/ai-docs/check-docs.mjs` 改前基线 EXIT=0 `scanned 2160`（本席亲证·≤cap 2176 余 16）·落卷后实测值随 commit 记（预期 2161）；②markers 五类亲跑零命中；③盲区 A/B 对偶活证 EXIT 原值在卷 §1.1-B（含 NUL→EXIT=0 静默放行/去 NUL→EXIT=1 `credential assignment`）；④全仓 census 亲证 4781 文件 0/0 在卷 §0.1；⑤`git merge-base --is-ancestor` NUL nail 在祖亲证 YES（基线段）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `executed:awaiting_post_prove_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本卷不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1-修法四编辑定稿与 §5 Ban/pins 与 §1.2 归因结论**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞重扫必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/位点漂移（尤 `:67`/`:39`/`:96`）·或 TEXT_EXTENSIONS 集合成员变动·或 cap sanction 并线触 `:39` 邻域·或 §0.0 在飞重扫命中新增改写→停·重 pin 回炉。
- **机制不满足**：battery 任一臂断言 FAIL（拒收不响/二进制误拒/既有规则回归/剥扫否定臂失败/A-B 对偶不复现）→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 2 码面（需触 gitleaks/ci.yml/规则正则/产品码/迁移/扩展集复制/残余盲区扩面）→停·另刀或协调方裁决（§1.3 否决沿承）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 五值越/docs:check>cap/neg 臂数漂超熔断）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

### §9-EXEC EXEC 执行记录（2026-10-16·七字段·头行按项级标签·§0-§8 原文零字节改·append 保史·STOP 三处置定）

**授权链**：pre-exec 双审会签 PASS（席1 agent_7a614e68+席2 agent_264853fe）→ 协调方明示 EXEC 授权（派单七序）→ 本席 EXEC。**§1-修法四编辑定稿/§5 Ban/pins/§1.2 归因链零字节零触**（§8 条款③）。并线 merge **`2bdfde8b`**（`--no-ff` 双亲 `2a54d68c`+`fc64c7c9`·届时 tip=fc64c7c9≥派单下界恰等·零冲突 9 files +664/−4·禁 pull --rebase 遵守·qbank-pipeline-scope/qbank-integrity-chain/uc003-followup 三波随并·qpl/ISO/REMAP 波对双触面两文件零字节零触亲证见字段①）。

1. **重 pin 全表**（对 `2bdfde8b`·`git hash-object` 亲证）：双触面 blob 与 §0.1 恒等——checker `73fbaba4`（88 行）/policy `b7281d11`（394 行）零漂移；行锚全表零更位（checker `:2` import/`:59` findings/`:66-67` 盲区位/`:82` banner+policy `:39` TEXT_EXTENSIONS/`:96` MAX_FILES 2_176）；`git diff 2a54d68c 2bdfde8b` 对两文件空 diff=并线波零触亲证；`core.hooksPath=.githooks` 亲证在位；TEXT_EXTENSIONS 23 扩展集合成员与 §0.1 逐字节恒等；迁移链 204 头 0204·cap 2176 在祖亲证。
2. **四编辑落点（§1-修法 fenced 定稿逐字节·恰 2 码面）**：policy `:39` `const`→`export const`（恰 1 token·集合成员逐字节不动·numstat 1+/1−）；checker 三编辑——`:2` import 行加 `TEXT_EXTENSIONS`+新增 `import { extname } from 'node:path';`·`:59` 邻加 `const nulFindings = [];`（**字节级锚=紧跟 `const findings = [];` 行后**·P4 兑现 diff hunk 亲证）·`:66-67` 盲区位改分面臂（`content===null` continue 保留=null-race 语义零字节；`content.includes('\0')` 臂内 `TEXT_EXTENSIONS.has(extname(path))`→nulFindings.push 后 continue·二进制/未知扩展照旧整文件跳）·`:82` credential 块之前插 NUL banner 块（五要件齐=NUL bytes detected/run nul census/逐路径 `- ${path}`/盲区机理提示含 nul-escape 卷引用/exit 1·banner 串逐字节同 fence）；checker numstat 16+/2−；规则面（5 credential+4 identifier+env 禁入+isSyntheticIdentifier 放行）diff 零字节亲证。
3. **battery 八臂（§2-1 定稿·scratch 仓 `.tmp/scn-blindproof/repo`·值一律 openssl rand -hex 20 现构零落卷）**：改后七臂全 PASS——臂1 `.md`+尾随 NUL EXIT=1+stderr「NUL bytes detected … run nul census」+`- leak-nul.md` 列表；臂2 credential 形无 NUL EXIT=1 `credential assignment`（既有规则恒等）；臂3 `.png`（PNG 签名+8 枚 NUL+32B 随机）EXIT=0（二进制照旧跳）；臂4 NUL 文本且剥 NUL 含 credential 形 EXIT=1 且 banner=NUL 臂（非剥扫放行·非 credential 先报=乙/乙′否定直证）；臂5 `.env` EXIT=1 `environment file must stay local`；臂6 全净 EXIT=0+「Secret gate passed」；臂7 无扩展名+NUL EXIT=0（§3-2 残余盲区边界如实存续）。**改前对照（臂8·`git cat-file blob 73fbaba4`+`b7281d11` 提取对·hash-object 回环恰等亲证）**：臂1/臂4 改前 **EXIT=0 静默放行**（盲区直证·A/B 翻转域恰=受管文本扩展 NUL 面）；臂2/3/5/6/7 改前改后同值。合计 14/14 PASS 零 FAIL。
4. **门矩阵全表（EXIT 原值）**：neg:all **687 全绿 EXIT=0**（六段 90/90/91/102/179/135 与 §2-3 基线逐位恰等零漂·隔离容器 meetwise-e2e-92641-1792104569436@127.0.0.1:61634）；typecheck --force **8/8（0 cached）EXIT=0**；lint **12/12 EXIT=0 五值恰等** web 601/root 5235/api 1421/worker 954/ai-runtime 628（根 lint 本树 cache miss 实跑覆盖改面·余 11 任务输入未变 cache hit 合法）；docs:check **EXIT=0 2163≤2176**（起草基线 2160→落卷 2161→并线携 2 新受管件→本树实测 2163·P3 注记见字段⑤）；markers 五类+冲突标记对运行时组装词面 `grep -a` 改动集零命中（EXIT=1·词面不入卷防自匹配·i6-239 口径）；diff 面 `git diff --numstat 2bdfde8b` 恰 **2 码面**（policy 1+/1−+checker 16+/2−）+本卷 .md（EXEC 仅本节 append+STOP 三处·§0-§8 其余原文零字节）——typecheck 副产 `apps/web/tsconfig.tsbuildinfo` checkout 回滚（nul-escape 卷同款先例·不入交付面）；NUL census 复扫 **0 枚 0 文件恒等**（4784 文本扩展=起草基数 4781+本卷 1+并线 2·11 PNG 豁免恒等·确切命令行见字段⑥）；node --check 双改文件 PASS；卫生 est live=0（battery scratch 仓零外呼+neg:all 隔离容器+typecheck/lint 本地·零模型外呼零 Key 值）·`.env*` ABSENT 双向（ls 无匹配+git ls-files 零命中）·actualSpendCny=null；真仓 gate=交付 commit 自身过 `.githooks/pre-commit` EXIT=0+commit 后干树 `pnpm secrets:check-staged` EXIT=0（§2-2 双件兑现·commit hash 见卷尾）。
5. **P2 四件落点（pre-exec 双审随卷勘误注记·append 不洗 §0-§8 原文）**：**P1（§3-2 补）**残余盲区面增补=大小写变体扩展（`.MD`/`.Ts` 等）——`extname` 大小写敏感·TEXT_EXTENSIONS 23 成员全小写·故大写变体扩展文件含 NUL 照旧整文件跳（与无扩展名文件同属 §3-2 残余盲区边界·非缺陷如实承登·凭证面由 gitleaks 全历史面管辖·扩面归后继刀候选归协调方另裁·本卷不搭车）；**P2（§2-9 增款）**EXEC 回执落 census 确切命令行——兑现见字段⑥；**P3（§2-6 注）**2161 系起草落卷树时值非硬常量——本 EXEC 树实测 2163（并线携 2 新受管件·门=≤cap 2176 恒绿）；**P4（§1-修法编辑3 补字节级锚）**「紧跟 `const findings = [];` 行后」——字段②已按锚兑现（diff hunk 亲证 `const findings = [];` 后紧跟 `const nulFindings = [];`）。
6. **census 确切命令行（§2-9 新款兑现·verbatim）**：
```
python3 -c '
import os, subprocess
exts = {".md",".mdx",".mjs",".cjs",".js",".ts",".tsx",".mts",".cts",".json",".yaml",".yml",".sql",".sh",".toml",".conf",".service",".timer",".html",".css",".txt",".pem",".py"}
out = subprocess.run(["git","ls-files","-z"],capture_output=True).stdout
files = [f for f in out.split(b"\x00") if f]
text = [f for f in files if os.path.splitext(f)[1].decode() in exts]
png = [f for f in files if f.lower().endswith(b".png")]
nul_files = 0; nul_bytes = 0
for f in text:
    with open(f,"rb") as h: data = h.read()
    c = data.count(b"\x00")
    if c: nul_files += 1; nul_bytes += c
print("tracked=%d text_ext=%d png=%d nul_bytes=%d nul_files=%d" % (len(files), len(text), len(png), nul_bytes, nul_files))
'
```
   → 输出 `tracked=5614 text_ext=4784 png=11 nul_bytes=0 nul_files=0`。
7. **STOP 终态**：三处（Status 头/§8/卷尾）置 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·nail/行翻面归协调方·⛔push ⛔merge ⛔force-push。

---

*SECRET-CHECKER-NUL-GUARD REQUEST · 2026-10-14 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-16 EXEC 落码·§9-EXEC 七字段）· 并线 merge `2bdfde8b` --no-ff 双亲 `2a54d68c`+`fc64c7c9`（届时 tip=fc64c7c9≥派单下界恰等·零冲突·禁 pull --rebase 遵守）· 重 pin 零漂（checker `73fbaba4`/policy `b7281d11` blob 恒等·行锚全表零更位·qpl/ISO/REMAP 波零触双触面）· 修法四编辑逐字节落码=policy `:39` export 恰 1 token（23 扩展集合不动）+checker import/extname+`:59` 邻 nulFindings（紧跟 `const findings = [];` 行后·P4 锚兑现）+`:66-67` 分面臂（TEXT_EXTENSIONS.has(extname) 拒收·content===null race 保留·二进制/未知扩展照旧跳）+`:82` 前 NUL banner 五要件块（恰 2 码面 16+/2−+1+/1−）· battery 八臂+改前对照 14/14 PASS（臂1/臂4 改前 EXIT=0 静默→改后 EXIT=1 NUL banner=翻转域恰受管文本扩展 NUL 面·乙/乙′剥扫否定直证）· 门矩阵全绿：neg:all 687（90/90/91/102/179/135 恰等·隔离容器）+typecheck 8/8 0 cached+lint 12/12 五值恰等 601/5235/1421/954/628+docs:check 2163≤2176+markers 五类零命中+diff 恰 2 码面+本卷 .md+census 0 枚 0 文件恒等（4784 文本扩展·11 PNG）+node --check 双文件+真仓 pre-commit 实跑 EXIT=0+干树 secrets:check-staged EXIT=0+卫生 est live=0·`.env*` ABSENT·actualSpendCny=null · P2 四件落点随卷（P1 §3-2 大小写变体扩展残余盲区增补/P2 §2-9 census 命令行入卷字段⑥/P3 §2-6 2161 系树时值本树 2163/P4 编辑3 字节级锚兑现） · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP · post-prove 双审两独立外席待派 · ⛔push ⛔merge 主线 ⛔force push 未用 · 原 base `origin/feat/mysql-schema-skeleton` @`d186dffc`（sbg nail tip·NUL nail `0036ddd8` 在祖亲证）· 分支 `line/secret-checker-nul-guard` · 工作树 `meetwise-scn`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=协调方派单 brief+nul-escape 卷 `§9-EXEC-5-D7` 连环发现承登链+NUL nail `0036ddd8` P2-1「归后继工具刀」移交 · 盲区定谳=`check-staged-secrets.mjs:67` 含 NUL 文件对全部 9 规则（5 credential+4 identifier）整文件免扫·credential 穿洞 A/B 对偶活证（±1 NUL 字节翻转过/拒·EXIT 原值在卷）· 窗口期=全仓文本面 4781 文件 NUL 0/0 亲证（11 PNG 豁免恒等）· 修法定稿=候选甲受管文本扩展拒收 fail-closed（TEXT_EXTENSIONS 23 扩展单一事实源 import·policy `:39` export 1 token+checker 三编辑·二进制/未知扩展照旧跳·banner 含「run nul census」五要件）· 候选否决=甲′扩展集复制（漂移温床）/乙剥扫（不变量失执法点+断键假修复）/乙′照扫（NUL 静默回仓+binary 误报面）/丙现状（承登链无收口）· 两套扫描面分工定谳（提交面 checker+CI 面 gitleaks 互补·`:67` 洞 CI 面不自动补·policy docs:check 面本无 NUL 跳过=反证）· 门矩阵十二条（battery 八臂含改前对照/真仓 pre-commit 实跑/neg:all 687±2/typecheck 8/8/lint 五值恰等/docs:check 2161≤2176/markers 五类/diff 恰 2 码面+本卷/NUL census 0/0 恒等/node --check/卫生/贴边三条）· 漂移登记四项（4 扩展→23 全集/diff 恰 1→起草 1+EXEC 2/:67 零漂/候选三分→五分）· 预期零迁移（链 204 头 0204）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP · ⛔push ⛔merge 主线*
