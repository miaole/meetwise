# UC003-ARM4-ALLOWLIST-FILTER REQUEST — 门⑥臂④红微刀（TreeWalker SHOW_TEXT 无 filter 口径缺陷+SSR `<title>` 具名挂靠·恰 1 spec 文件 3 hunk·纯测试文件零产品码·起草落卷即停）

**Status**: **`executed:stopped_gate_red_escalated`**（2026-10-16 EXEC 落卷即停手上报·门 1 主门环境红分类退出=pre-flight `live_provider_key_missing`·§8 停止条件「验收红不可修」命中·门 2-6 全绿+修法三 hunk 恒等落卷 blob `2cc3e5f0`·七字段 EXEC 记录见 §9·STOP 沿 safewrite-backpressure EXEC 停上报先例形·裁决权归协调方·alone≠dual · est live=0 · ⛔push）

**席位**：UC003-ARM4-ALLOWLIST-FILTER 起草席（分诊定谳承接+起草双责·协调方派·门⑥臂④红微刀）。
**基线**：`feat/mysql-schema-skeleton` @ `7ac68ed7`（=fetch 后 origin tip 亲证恒等=主线 tip·docs:check 基线 2149≤cap 2152 本树亲跑 EXIT=0）· 分支 `line/uc003-arm4-filter`（本起草席 `git worktree add ../meetwise-u3 -b line/uc003-arm4-filter origin/feat/mysql-schema-skeleton` 亲立·HEAD 落 `7ac68ed7`）· 工作树 `meetwise-u3`（仓根同级）。**基线注记（如实）**：主仓本地 checkout 落于 `f417d8e7`（origin tip 祖先态·落后 10 commits=docs/receipts/db-acl2 面）——本支线按本仓「origin tip 亲证」惯例（db-acl-residual/cost-columns 先例形）直基于 origin ref 落 `7ac68ed7`；该 10 commits 与本刀锚面（spec/layout/page/证据）零交叠（`git diff --stat` 亲证零 spec 命中）。
**立项出处**：①协调方分诊定谳（派单简报在案：UC003 门⑥臂④红=TreeWalker(SHOW_TEXT) 无 filter 口径缺陷（spec `:141` 第三参缺省）混入 7 条 RSC Flight script 数据面（a 类）+1 条真实 SSR `<title>` zh（b 类·`resume/page.tsx` static title × `layout.tsx` template））；②分诊证据=主仓工作树 untracked `apps/web/test-results/uc003-i18n-locale-UC003-I1-6cd9b-码-en-断言-具名-allowlist-全页残留清点-chromium/error-context.md`（blob `fe975f37` 亲算·**untracked 不随 worktree 携带·易失面**·本席全文亲读·8 条 UNKNOWN 归类表转录于 §0.2 防失）；③spec 头注政策句 `:10-12`（「every CJK text node found on /resume must belong to a named unmigrated face」=每条 CJK 必属具名未迁移面）；④形制范本 `ai-docs/delivery/harness/db-acl-residual-REQUEST.md`（§0-§8 形制）。

## §0 现状锚（起草席亲证·file:line+blob 逐条 Read/rg/git hash-object/实跑实测 @`7ac68ed7`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 **25 树**实测——uc003 同名树恰 1=本席 `meetwise-u3`；`git branch --list "line/uc003*"` 三命中=`line/uc003-arm4-filter`（本席·唯一 arm4）+`line/uc003-followup`+`line/uc003-i18n`（两前刀·已并线血统支线）；`ls ai-docs/delivery/harness/ | rg uc003-arm4` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核（本席已跑·EXEC 立项日重跑）**：本刀唯一码触面=`apps/web/e2e-ui/uc003-i18n-locale.spec.ts`（现 blob `968e3f25`·158 行·末次变更=`f93b3613` line/uc003-followup EXEC·已在主线）。本席对全仓 42 个曾触该 spec 的分支逐一 `git log -1 -- <spec>`+`merge-base --is-ancestor` 扫描：**spec 触顶全数为 HEAD 祖先=零「非祖先新触」·零在飞交叠**。届时同法重跑，任一在飞分支出现非祖先 spec 触顶→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 亲算 @`7ac68ed7`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/web/e2e-ui/uc003-i18n-locale.spec.ts` | `968e3f25`（158 行·**本刀唯一码触面**） | **`:10-:12` 头注政策句（具名 allowlist 残留口径=hunk③ 改形对象）·`:23` grep 锚 `UC003-I18N-locale-en`·`:26` CJK 正则·`:31-:76` `ALLOWED_CJK_FACES` 九具名面（`:32` navHardcodedLabels/`:33-:37` resumePageHeader/`:38` resumePageUploadCard/`:39-:44` resumePagePersonalization/`:45-:53` resumePageListChrome/`:54-:64` resumePageConsentGate/`:65` resumeUploadFormsLiterals/`:66-:73` deleteResumeButtonLiterals/`:74` resumeStatusLabels/`:75` localeSwitcher）·`:78` `ALLOWED_CJK` Set·`:80` 测试名·`:100-:113` 臂①②元素级 pins（`:105` help span CJK-free·`:109-:113` banner 条件臂）·`:115-:129` 臂③空文件 en（`:128-:129` 双断言）·`:131-:134` login smoke·`:136-:157` 臂④全页残留清点（`:140-:148` `page.evaluate` TreeWalker 块·`:140` evaluate 入口·**:141 `const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);` 第三参缺省=红根**·`:149` 去重·`:150` unknown 过滤·`:151-:156` inventory+attachment·`:157` `expect(unknown).toEqual([])` 断言=臂④红点）** |
| 分诊证据 `error-context.md`（主仓 untracked·易失） | `fe975f37` | `:14-:41` Error details（**:27-:28 diff 行数口径 `-1/+10`=接收数组 8 元素+`[`/`]` 括号 2 行**·`:31-:40` 接收数组 8 条逐条=§0.2 转录底稿·`:23`/`:39` 独立 title 文本）·`:45-:105` Page snapshot（可见 DOM zh 全数具名面对照底稿）·`:109-:213` Test source（`:141` 红根同上） |
| `apps/web/app/layout.tsx` | `c9599893`（51 行·**零触·b 类词源×**） | `:17` `title: { default: 'Meetwise 知面 · 预览版', template: '%s · 知面 Meetwise' }`（b 类合成右半）·`:12` `DESC`（zh 全句）·`:19` keywords 六值 zh·`:20` applicationName·`:23-:24` openGraph/twitter title+description zh 词面 |
| `apps/web/app/resume/page.tsx` | `2f2208b8`（128 行·**零触·b 类词源本体**） | `:17` `export const metadata = { title: '简历 · 知面' };`（静态 export·b 类合成左半） |
| `package.json` | `3b04b871`（675 行） | `:217` `uc003:i18n-locale-ui:prove` 接线（`E2E_UI_GREP=UC003-I18N-locale-en`·chromium·`run-e2e-isolated.mjs e2e:ui`）·`:342` `e2e:ui`——本刀零触 |
| `apps/web/package.json` | `30723cd4`（67 行·零触） | `:7` lint 预算行 `--max-warnings 601`·`:10` `prove:uc003-i18n-locale`·`:22` `typecheck: tsc --noEmit` |
| `scripts/ai-docs/public-text-policy.mjs` | `bdfd4142`（388 行·零触） | `:90` `MAX_FILES = 2_152`（cap·591d07cf sanction 落值·门 4 依据） |
| `scripts/run-e2e-isolated.mjs` | `0787a7ff`（3201 行·零触） | 门 1 isolated runner 接线（e2e:ui 包装） |

### 0.2 分诊证据转录（error-context.md `fe975f37` · 8 条 UNKNOWN 归类表·本席逐条亲读转录防易失）

证据 run：`uc003:i18n-locale-ui:prove`（chromium·grep `UC003-I18N-locale-en`）·红臂=臂④ `:157` `expect(unknown).toEqual([])` deep equality **Expected `[]` / Received 8 元素**（diff 行数口径 `-1/+10`=8 元素+括号 2 行）。接收数组逐条归类：

| # | 归类 | 接收元素（截形） | 判定 |
|---|---|---|---|
| 1 | **a** | `self.__next_f.push([1,"0:…` | Flight chunk `0`：框架树+skeleton+loading 载荷（含 加载中/加载中… 词面=§6-4 loading 面词源副本） |
| 2 | **a** | `self.__next_f.push([1,"10:…` | Flight chunk `10`：next-intl messages（locale=en）序列化载荷（含 `common.zh=中文` 词面） |
| 3 | **a** | `self.__next_f.push([1,"12:…` | Flight chunk `12`：Nav SSR 树载荷（押题/找工作/岗位匹配=`navHardcodedLabels` 具名面词源副本） |
| 4 | **a** | `self.__next_f.push([1,"13:…` | Flight chunk `13`：layout notFound 槽位 JSX 序列化（页面不存在/你要找的页面不存在或已移动。/返回首页/进入总览=§6-3 四词词源） |
| 5 | **a** | `self.__next_f.push([1,"24:…` | Flight chunk `24`：LocaleSwitcher SSR 树载荷（中=`localeSwitcher` 具名面词源副本） |
| 6 | **a** | `self.__next_f.push([1,"5:…` | Flight chunk `5`：/resume 页 SSR 树载荷（简历 · 知面/上传简历/我的简历 等=`resumePage*` 具名面词源副本） |
| 7 | **a** | `self.__next_f.push([1,"9:…` | Flight chunk `9`：metadata 流载荷（title=简历 · 知面 · 知面 Meetwise+description/keywords/applicationName zh 全家词面） |
| 8 | **b** | `简历 · 知面 · 知面 Meetwise` | **真实 SSR `<title>` 文本节点**（`resume/page.tsx:17` static title × `layout.tsx:17` template 合成·非 script 载荷）→hunk② 具名挂靠 |

**旁证（可见 DOM 面）**：Page snapshot `:45-:105` 亲读——可见页 zh（押题/找工作/岗位匹配/简历 · 知面/上传简历/面试出题个性化：/未同意（…）/我的简历/还没有简历,粘贴上传。/← 返回首页/提取并上传/或粘贴文本/在此粘贴简历原文…/中/加载中…）**全数 ∈ 既有 `ALLOWED_CJK`**（即未入 unknown 数组的余量全具名）——证据 run 走到 `:157` 前臂①②③（+login smoke）全绿。

### 0.3 迁移号登记（预期零迁移）

- 本刀修法=纯 spec 测试文件改形（§1-修法三 hunk）·**预期零迁移零 DDL 零 schema 触**。EXEC 期若实测产生非预期迁移需求→停（越界需要类）上报。

## §1 红事实（机制链·全部亲证·分诊证据承 §0.2）

### 1.1 臂④红根（file:line）

- **红根=spec `:141` `createTreeWalker(document.body, NodeFilter.SHOW_TEXT)` 第三参 `filter` 缺省**→TreeWalker 对候选文本节点零过滤→`<script>` 子树文本（Next.js App Router RSC Flight 注入的 `self.__next_f.push` 数据管道·7 条整段载荷各为 1 文本节点）与 `<title>` 文本（React 19 流式 metadata）**一并入选** `:140-:148` 采集集→`:149` 去重、`:150` 仅对 `ALLOWED_CJK` 集合差集——数据面整段词面与 title 合成词在任何具名面外→`unknown` 8 条→`:157` 红。**口径缺陷属测试采集面（spec）·非产品渲染回归**：臂①②③ 与可见 DOM 逐点对照全绿（§0.2 旁证）。
- 臂账（证据 run）：臂① help span CJK-free（`:105`）绿·臂② banner（`:109-:113`）绿·臂③ 空文件 en 双断言（`:128-:129`）绿·**臂④ 全页残留清点（`:157`）红=8 UNKNOWN**。

### 1.2 归因分诊（a=7 / b=1 / c=0·分类依据=文本节点父链判定）

- **a 类=7（script 数据面）**：判据=文本节点父链 parentElement 为 `<script>`（`self.__next_f.push` Flight 数据管道）——属**数据面非渲染 chrome**，其携带 zh 词面为两型：（i）具名面词源副本（chunk `5`/`12`/`24` ↔ resumePage*/navHardcodedLabels/localeSwitcher·本体已具名）；（ii）未迁移产品词面载荷（chunk `0` loading 词面/chunk `10` messages `common.zh`/chunk `13` not-found 四词/chunk `9` metadata 全家——词源本体登记 §6 归后刀）。处置=hunk① filter 剔除候选资格·**零 allowlist 词条新增**（a 类不占具名面）。
- **b 类=1（真实 SSR `<title>`）**：判据=独立文本节点·父=`<title>`（React 19 hoistable metadata 随流式响应在 body 内发出·HTML parser 不回搬 head·`document.title` 同源可读）——**真实可见元数据非数据面**：hunk① filter 不可剔（剔之=假绿·浏览器标签页仍 zh）；词源=`resume/page.tsx:17` static title『简历 · 知面』×`layout.tsx:17` template『%s · 知面 Meetwise』合成『简历 · 知面 · 知面 Meetwise』（静态 export 非运行时数据·构建期可逐字钉）→hunk② 具名挂靠 `resumePageMetaTitle`·与 spec 头注 `:10-12`「每条 CJK 必属具名未迁移面」政策自洽（title=未迁移面·如实挂靠待后刀迁移）。
- **c 类=0**：接收数组恰 8 元素=7a+1b·**零剩余零第三类**；可见 DOM 余量全具名（§0.2 旁证）。hunk①+② 落地后预期 unknown=[]·臂④翻绿。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=三 hunk 测试口径收窄**（§1-修法）：采集面剔 script/style 数据面（口径修复）+b 类如实具名挂靠（政策自洽）+头注口径成文——改动面恰 1 spec 文件·零产品码零门接线。
- **候选乙（否决·Ban）=纯 allowlist 不加 filter**：8 条全进具名面→7 条整段 Flight 载荷文本升格「具名未迁移面」=把数据面词面塞进具名面清单·**稀释 spec `:10-:12` 政策**（具名面语义=页面 chrome 残留清单·非任意数据字符串倾倒场）；且 Flight 载荷随构建/请求漂移·整段逐字钉=结构性脆红（任一新增 zh 数据字串即新爆 UNKNOWN）。Ban。
- **候选丙（否决·本刀·另立后刀）=真修 `generateMetadata` per-locale 产品刀**（layout metadata+resume page title 走 next-intl）：修的是 b 类词源本体·属产品码刀=**越本刀范围**（本刀纯 spec 测试文件）·已登记 §6 候选 `i18n-metadata` 刀·**本刀 Ban 触产品码**。

## §1-修法（恰 1 文件 `apps/web/e2e-ui/uc003-i18n-locale.spec.ts` 三 hunk·零产品码零其他测试·blob `968e3f25` 为基·**起草席已三 hunk 逐字应用实算：预期 numstat +9/−2·改后 blob `2cc3e5f0`·红根行改后落 `:145`·独立 tsc（strict+DOM lib+@playwright/test 实型映射）EXIT=0 类型验证过——验证后已 `git restore` 还原 `968e3f25` pristine·EXEC 以实跑为准**）

- **hunk①（红根修复·`:141` 单行→四行 filter 形）**：
  - 改前：
    ```ts
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    ```
  - 改后：
    ```ts
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) =>
            node.parentElement?.closest('script,style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
        });
    ```
  - 语义：script/style 子树文本候选→`FILTER_REJECT`（a 类 7 条剔出候选集·零 allowlist 词条）；其余候选照旧 `FILTER_ACCEPT`——`<title>`（b 类）不受此 filter 影响（closest 不命中 script/style）。
- **hunk②（b 类具名挂靠·`:32` navHardcodedLabels 行后·`:33` resumePageHeader 前插 1 行）**：
  - 插入行（逐字）：
    ```ts
      resumePageMetaTitle: ['简历 · 知面 · 知面 Meetwise'], // SSR <title>: static page title × layout template (React 19 streams the hoistable <title> into body)
    ```
  - 语义：b 类词挂新具名面 `resumePageMetaTitle`——注释锚定词源（静态 page title × layout template）与机制（React 19 流式落 body）·头注政策自洽；值=构建期静态合成串可逐字钉·非运行时漂移面。
- **hunk③（头注口径成文·`:12` 单行→四行）**：
  - 改前：
    ```ts
     * run log as residual receipt. Full-page zh clearance is a later knife — matrix stays partial.
    ```
  - 改后：
    ```ts
     * run log as residual receipt. Scan scope excludes script/style data payload: the TreeWalker
     * rejects text candidates inside <script>/<style> (RSC Flight payload is data, not rendered
     * chrome), so the inventory counts visible page chrome only. Full-page zh clearance is a
     * later knife — matrix stays partial.
    ```
  - 语义：把 hunk① 的采集口径写进头注·与「每条 CJK 必属具名未迁移面」政策句并立成文——清点=可见 chrome 残留账·数据面不入账亦不豁免产品词面（词源本体仍登记 §6 待迁）。
- **改形后行号顺延预注**：hunk③ +3 行→`:31-:76` 区顺延；hunk② +1 行→`:141` 红根行改后落 `:145`（起草席应用实算验证·与 numstat +9/−2 及改后 blob `2cc3e5f0` 同上·EXEC 以实落为准如实记）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵六门·数字口径以届时实跑实测为准）

1. **门 1 `uc003:i18n-locale-ui:prove` 臂④红翻绿·臂①②③零影响**：`pnpm uc003:i18n-locale-ui:prove`（`package.json:217`→run-e2e-isolated isolated 栈）EXIT=0——**臂④（全页残留清点·spec 内步骤⑤·`:157`）红翻绿**（hunk①+a 类剔除·hunk②+b 类挂靠·预期 unknown=[]）·**臂①②③零影响**（help span `:105`/banner `:112`/空文件 en `:128-:129`——filter 只作用于清点臂候选集·innerText 元素级面零触·语义零弱化）·恰 1 run 零 retry-to-green·inventory 照旧落 run log+attachment（残留回执口径不废）。
2. **门 2 web typecheck**：`pnpm -C apps/web typecheck` EXIT=0（`apps/web/tsconfig.json:11` include `e2e-ui/**/*` 覆盖本 spec·hunk① filter 形入检）。
3. **门 3 lint web 值**：`pnpm -C apps/web lint` EXIT=0·0 errors·预算行 `:7` `--max-warnings 601` 贴线·warning 实数对届时基线偏差如实登记（第三态出现即停）。
4. **门 4 docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·**≤届时 cap**（起草时点 cap=2152=`public-text-policy.mjs:90`·基线 2149 本树亲跑·本卷落卷后预期 2150·**>cap 红停上报**）。
5. **门 5 markers 五类零命中**：本刀改动集五类标记词 grep 零命中（词面运行时组装扫描·沿 `i6-239-gates.proof.mjs:151-163` 形·词面不复抄卷内防自匹配）。
6. **门 6 diff 面机检**：码面**恰 1 tracked spec 文件**=`apps/web/e2e-ui/uc003-i18n-locale.spec.ts`（预期 numstat +9/−2·改后 blob 预期 `2cc3e5f0`）+本卷 .md=刀卷面·零第三 tracked 路径——多任何 tracked 即停（越界需要类）。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码零触**：`apps/web/app/layout.tsx`（`c9599893`）/`apps/web/app/resume/page.tsx`（`2f2208b8`）/`apps/web/app/not-found.tsx`（`770d92c9`）/`apps/web/app/loading.tsx`（`2f82ded6`）/`apps/web/components/ui/Spinner.tsx`（`353ca001`）/`apps/web/components/Nav.tsx`（`35deb3fe`）零字节——b/c 词源本体归 §6 候选 `i18n-metadata` 刀（候选丙否决承此·**本刀 Ban 触产品码**）。
2. **metadata 全家零触**：layout `:17-:24` metadata 对象（title default+template/description/keywords/applicationName/og/twitter）与 resume page `:17` static title——b 类挂靠词面≠修词源授权。
3. **spec 既有臂零弱化**：`:100-:134`（臂①②③+login smoke）零改形；`:31-:76` 既有九具名面词条**逐字恒等**（Ban 借机清词条——清词条=迁移刀权柄）；`:26` CJK 正则零触；`:23` grep 锚零触。
4. **门接线零触**：`package.json`（`3b04b871`）/`apps/web/package.json`（`30723cd4`）/`run-e2e-isolated.mjs`（`0787a7ff`）/`run-e2e-ui.mjs` 零字节。
5. **共享 SSOT 零改**：LEDGER/checklist/归置卷只读引用——门⑥臂④行翻面权归协调方 nail。
6. **零迁移零 DDL 零依赖升级零 .env 零 CI/wiring 改**（§0.3 承）。

## §4 依赖/执行前置

**①无前置**：纯 spec 测试文件改形·零迁移零 env 零 secrets 零新依赖；门 1 栈供给=既有 e2e:ui isolated runner（api+worker+web production start）。**②在飞交叠复核**（EXEC 立项日重跑·本席已跑零触见 §0.0）。**③迁移号**：§0.3 预期零。**④环境供给史风险（如实登记）**：`line/uc003-followup` EXEC 卷证「spec 步骤⑤ UI 实跑环境受阻（isolated 栈 live MODEL_API_KEY 缺）诚实登记 pending 不虚报」——若 EXEC 期门 1 同因受阻=停止条件「验收红不可修」如实登记停上报·**Ban 虚报翻绿·Ban 为凑跑擅改隔离栈/注入 Key**。**⑤下游**：门⑥臂④翻绿后翻面权归协调方；§6 漏项段为后继 `i18n-metadata` 刀立项输入（本刀只登记不立项）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（门 1 恰 1 prove run·红不重跑冲销）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 触产品码/metadata 词源（§3-1/3-2·候选丙否决沿承）；Ban 纯 allowlist 凑绿/加 a 类词条稀释具名面（候选乙否决·§1.3）；Ban 弱化既有臂/既有 allowlist 词条（§3-3）；Ban 触门接线/共享 SSOT/其他工作树（§3-4/3-5）；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因新红（门矩阵若现新红→如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据·Ban 为凑跑擅改隔离栈（§4-④）；Ban 顺带升级依赖包。

**pins（十一值照抄 SSOT 同 tip 系·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 b/c 真实漏项登记段（本刀只登记不立项·候选 `i18n-metadata` 刀输入·量级=小中）

**清单（4 文件级·blob 为 `7ac68ed7` 时点）**：
1. **`apps/web/app/layout.tsx`（`c9599893`）metadata 三锚**：`:17` title default『Meetwise 知面 · 预览版』+template『%s · 知面 Meetwise』·`:18` description=`DESC`（`:12` zh 全句）·`:19-:20` keywords 六值/applicationName（`:23-:24` og/twitter zh 词面复用同词源）——修法候选=`generateMetadata` per-locale（next-intl 注入）。
2. **`apps/web/app/resume/page.tsx`（`2f2208b8`）`:17` static `metadata.title`**『简历 · 知面』——本刀 b 类词源本体·per-locale 需改 generateMetadata（或接 template 键组合语义）。
3. **`apps/web/app/not-found.tsx`（`770d92c9`）4 词**：`:7` 页面不存在 · `:8` 你要找的页面不存在或已移动。 · `:10` 返回首页 · `:11` 进入总览（证据 run 经 Flight chunk `13` 载荷现形）——该刀须同判 layout notFound 槽位词面归属。
4. **加载面 2 词源**：`apps/web/app/loading.tsx`（`2f82ded6`）`:6` 加载中… + `apps/web/components/ui/Spinner.tsx`（`353ca001`）`:7` default `label='加载中'`（aria-label·SSR 流式骨架期可见）。
5. **零动作登记（防重复立项）**：`apps/web/components/Nav.tsx`（`35deb3fe`）`:39-:41` 押题/找工作/岗位匹配——**已在具名面 `navHardcodedLabels`**·非漏项。
6. **零动作登记（防重复立项·pre-exec 席2 P2-a 补登·append 条目原文不洗）**：`apps/web/messages/en.json:124` + `apps/web/messages/zh.json:124`（两处 locale 名词面 `"zh": "中文"`）+ `apps/web/app/settings/page.tsx:60`（locale 选择器选项词面 `<option value="zh">中文</option>`）——**by-design 候选标注**：语言自称词面（「中文」=语言名本体·非 chrome 漏译）·拟列 by-design 不迁候选·随候选 `i18n-metadata` 刀一并归协调方裁决·本刀零动作。

**候选刀形**：`i18n-metadata`（generateMetadata per-locale+词面迁移）·量级=**小中**（4-6 文件·零迁移；主要技术风险=Metadata 异步化+template 键组合语义+notFound 槽位词面归属判定）。归协调方立项排程·本刀零授权。

## §7 est live=0 与 markers=0（卫生双声明·起草 turn）

- est live=**0**——零模型外呼零 Key 加载零生产操作零 secrets 零消耗（本刀起草=纯文档+锚亲证+docs:check/markers 机检·EXEC 期门 1-6 亦零模型外呼）。
- 本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·词面运行时组装防自匹配·词面不复抄卷内——沿 db-acl-residual/negbend-fix/g7w/authz-harden 卷 §7 同形制·回执随 EXEC 收据留痕）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.2 归因结论（a=7/b=1/c=0）与 §1.3 候选裁决与 §1-修法三 hunk 定稿面与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 spec blob `968e3f25`/行锚漂移且 §1.2 归因受疑（spec 被并发刀触及/allowlist 词条漂移/证据文件失且无替代 run）→停·重 pin 回炉。
- **机制不满足（主停止条件）**：门 1 改后**臂④仍红**（8 条未清或新 UNKNOWN 现形=a/b 归因被证伪）→停上报·Ban 就地加词面凑绿·Ban 改断言口径。
- **越界需要**：修法诉求超出三 hunk 面（需触产品码/metadata 词源/门接线/其他 spec）→停·§6 候选刀承接·协调方裁决（§1.3 候选丙沿承·Ban 就地扩面）。
- **验收红不可修**：门 2-6 任一红且根因不在本刀交付面（typecheck 红/lint 0 errors 破/docs:check>cap/门 1 环境供给受阻 §4-④）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*UC003-ARM4-ALLOWLIST-FILTER REQUEST · 2026-10-15 起草落卷 · 基线 `feat/mysql-schema-skeleton` @`7ac68ed7`（=fetch 后 origin tip 亲证=主线 tip·主仓本地 checkout 祖先态 10 commits 零锚交叠）· 分支 `line/uc003-arm4-filter` · 工作树 `meetwise-u3` · 修法=恰 1 spec 文件三 hunk（①`:141` reject filter 剔 script/style ②`resumePageMetaTitle` b 类具名挂靠 ③头注 scan-scope 口径成文）· 归因 a=7/b=1/c=0（父链判定·证据 `fe975f37` 转录 §0.2）· 候选乙（纯 allowlist 稀释政策）/候选丙（产品刀越界）否决在卷 · §6 漏项登记 4 文件级+Nav 零动作（候选 `i18n-metadata` 刀·量级小中）· 门矩阵六门（臂④红翻绿·臂①②③零影响·web typecheck+lint web 值+docs:check≤cap 2152+markers+diff 恰 1 tracked spec）· est live=0 · markers=0 · pins 十一值照抄零翻 · STOP=**`draft:awaiting_pre_exec_dual`**（起草时点·史证不洗）→ **`executed:stopped_gate_red_escalated`**（2026-10-16 EXEC 落卷即停手上报·§P2 五条承登+P2-d 重 pin 四值相符+merge `60107578` 零冲突+三 hunk 恒等落卷 blob `2cc3e5f0` +9/−2+门 2-6 绿+门 1 主门环境红 `live_provider_key_missing` pre-flight 恰 1 run 零 retry·§9 EXEC 记录七字段·裁决权归协调方·alone≠dual·⛔push）*

---

## §P2 pre-exec 双审勘正随卷承登（2026-10-16 EXEC 落卷·append 注记形·**原文不洗**·授权链=pre-exec 双审两外席 BOTH PASS（席1 `agent_97818f70`+席2 `agent_42e20001`·会签意见「可授权 EXEC·P2 随卷承登+EXEC 立项重 pin」）+协调方明示 EXEC 授权·五条 P2 全数 P2 级注记=零 §1.2 归因/§1-修法/§5 Ban·pins 触碰）

**席1 P2 两条**：

- **P2-1（§0.2 旁证瑕疵勘正）**：§0.2 旁证清单把「加载中…」列入 Page snapshot 可见 zh 枚举——**瑕疵**：亲核证据 `fe975f37` Page snapshot `:45-:105`，**「加载中…」零命中为 snapshot 文本节点**（snapshot 实含 zh 词条=押题/找工作/岗位匹配/中/简历 · 知面/用于练习的简历内容…长句/上传简历/提取并上传/或粘贴文本/在此粘贴简历原文(至少 20 字)…/面试出题个性化：未同意（…）/我的简历/还没有简历,粘贴上传。/← 返回首页——「加载中」仅以 Flight chunk `0` 载荷内 `aria-label` 词面与流式骨架 fallback 形态在卷）。「加载中…」词条勘离 snapshot 旁证枚举·**旁证结论「余量全具名」不受影响**（snapshot 实余量仍全数 ∈ 既有 `ALLOWED_CJK`）·**§1.2 归因 a=7/b=1/c=0 零改·臂账零改**。
- **P2-2（具名面计数勘正）**：§0.1 spec 锚行「`:31-:76` `ALLOWED_CJK_FACES` **九**具名面」计数笔误勘正为**十**具名面（`:32`-`:75` 逐行实点=navHardcodedLabels/resumePageHeader/resumePageUploadCard/resumePagePersonalization/resumePageListChrome/resumePageConsentGate/resumeUploadFormsLiterals/deleteResumeButtonLiterals/resumeStatusLabels/localeSwitcher 恰 **10** 键）·allowlist 集合本体与机制零影响·零改形（hunk② 落地后如实顺延为十一具名面）。

**席2 P2 三条**：

- **P2-a（§6 补零动作登记条）**：§6 清单补第 6 条（append 条目已承登于 §6 清单末·上文）——`apps/web/messages/en.json:124`+`apps/web/messages/zh.json:124`+`apps/web/app/settings/page.tsx:60` 中文词面（locale 名「中文」自称词面）零动作登记·**by-design 候选标注**（语言名本体非漏译·拟列 by-design 不迁候选·归协调方随 `i18n-metadata` 候选刀裁决）。锚行 @merge 后树亲证承登 §9。
- **P2-b（「加载中…」改注）**：「加载中…」口径改注=**流式期 aria 面·非 snapshot 文本节点**（`apps/web/components/ui/Spinner.tsx:7` default `label='加载中'` 走 `aria-label`+`role="status"` 零文本节点·`apps/web/app/loading.tsx:6` 文本节点仅 SSR 流式骨架窗现形·证据 run 完成态 snapshot 未挂载）——§0.2 旁证面与 §6-4 词源登记面按此注统一读。
- **P2-c（具名面计数勘正·与席1 P2-2 同判）**：§0.1「九具名面」→「**十**」·双席独立实点同判（会签一致）·承登同 P2-2。

## §9 EXEC 记录（EXEC 席落卷即停手上报·2026-10-16·授权链=pre-exec 双审 BOTH PASS（席1 `agent_97818f70`+席2 `agent_42e20001`·会签「可授权 EXEC·P2 随卷承登+EXEC 立项重 pin」）+协调方明示 EXEC 授权·⛔push·七字段沿 negbend-fix §9/件③ 形）

**① 工序与 commit 链**：①§P2 五条勘正随卷承登（append 注记形·原文不洗·本文件上文 §P2 节+§6 清单第 6 条 append）→随本 §9 落卷同 commit；②`git fetch` 后 origin tip=**`317ea3df`** 亲证≥授权预期下限恒等→`git merge --no-ff origin/feat/mysql-schema-skeleton`→merge commit **`60107578`**（ort 策略·**零冲突零手解零 union 行**：incoming 8 commits=safewrite-backpressure 刀+cap sanction·`git diff --name-only HEAD...origin` 亲证与本刀 spec/e2e-ui 面零交叠·⛔pull --rebase 未用）；③`pnpm install --frozen-lockfile` EXIT=0（新 worktree 首装·lockfile 零改）；④修法三 hunk 逐字应用（§1-修法定稿·**实算三值全符**：blob `968e3f25`→**`2cc3e5f0`**·numstat **+9/−2**·红根行改后落 **`:145`**）；⑤本 §9 落卷+Status 翻面=commit 本笔（spec 件①+本卷 .md 恰 2 tracked）。

**② 改前必做（P2-d 重 pin 四值·全数实测相符零偏差）**：见 §P2 P2-d 节——public-text-policy.mjs blob **`3015b893`**+`:92`=**`MAX_FILES = 2_160`**（@origin tip `317ea3df` 亲算）·worktree **26** 树（+1=本刀）·spec 触本地分支 **44**（42→44·44 支 spec 触顶全数 `c5d9f77a`/`317ea3df` 祖先·`merge-base --is-ancestor` 逐支扫描零非祖先=**§0.0 在飞交叠复核重跑零在飞新触**）·docs:check 届时基线=门 4 实测 **2152**≤2160（下表）。spec blob @merge 后 HEAD 复算仍 `968e3f25`（零漂移）·「现场漂移」停止条件未触。

**③ 门矩阵六门终值（修法树=merge `60107578`+三 hunk·blob `2cc3e5f0`）**：

| # | 门 | 实测 | EXIT |
|---|---|---|---|
| 1 | `uc003:i18n-locale-ui:prove`（主门） | **环境红·恰 1 run 零 retry**：runner pre-flight 分类退出 `E2E_FAILURE class=provider code=live_provider_key_missing`——`scripts/run-e2e-ui.mjs:53` `MODEL_API_KEY` 缺即抛（**pre-flight·先于 build/start/浏览器/任何测试执行**·臂①②③④ 全数未达·臂④ 断言未执行=「机制不满足」主停止条件未触·a/b 归因未证伪亦未证实）·栈前段=PG 容器起（`meetwise-e2e-41765-*`）+迁移 applied=204+ready×3 全过·红因=本 worktree 零 `.env`（runner `:33-:38` 仓根 `.env` 回灌面·新 worktree 未携带·主仓 `/meetwise/.env` 在故证据 run 当时可达）·**Ban 注入 Key/Ban 造 .env/Ban 擅改隔离栈全数遵守** | **1（环境红·停止上报）** |
| 2 | web typecheck | `tsc --noEmit` 零输出（hunk① filter 形+§3-3 既有臂全检过） | 0 |
| 3 | lint web 值 | `0 errors, 601 warnings`·预算 `--max-warnings 601` **恰等贴线**·零第三态 | 0 |
| 4 | docs:check | `scanned 2152`≤cap **2160**（merge 携入 sanction 新 cap·门 2-4 数字口径=届时值如实记预授权） | 0 |
| 5 | markers 五类 | 改动集（spec 件①+本卷 .md）运行时组装扫描（i6-239 §2-7 形·词面不落卷）**零命中** | 0（零命中） |
| 6 | diff 面机检 | 恰 **2 tracked**=件① `apps/web/e2e-ui/uc003-i18n-locale.spec.ts`（+9/−2·blob `2cc3e5f0` 核过）+本卷 .md（§P2+§9）·零第三 tracked 路径 | 0 |

**④ 口径如实更**：cap 2152→**2160**（merge `317ea3df` sanction 携入·非本刀改）·docs:check 基线 2149→**2152**（merge 新件+本卷落卷后实测）·lint 601 恰等零偏差·臂账口径=本 run 零臂执行（证据 run 的 ①②③ 绿/④ 红账系 `fe975f37` 历史证据·本 run 无新臂账）。

**⑤ 运行副效应登记**：typecheck 门曾翻动 `apps/web/tsconfig.tsbuildinfo`（tracked 构建状态件·1/1）——`git checkout` 回滚基线（沿 negbend-fix §9 同款处置）·终态 diff 面恰 2 tracked；prove 栈 PG 容器 runner 自清（`docker ps -a` 零 `meetwise-e2e-*` 残留）·`.env*` 零造零写·est live=0·零模型外呼。

**⑥ 停止条件判定与零改声明**：命中=**「验收红不可修」**（门 1 环境供给受阻·根因不在本刀交付面=§4-④ 既登风险逐字兑现·沿 uc003-followup EXEC 先例）——§8 处置=停手上报·stash 对照亲证以代码路径证据替代（`:53` pre-flight 先于本刀 spec 面执行·基线树同因必红·**零第二次 prove run**·「恰 1 run」Ban 优先于 stash 重跑形）；「现场漂移」未触（blob 零漂）·「机制不满足」未触（臂④ 未执行·**§1.2 归因 a=7/b=1/c=0 维持未证态·既未证实也未证伪·Ban 虚报翻绿**）·「越界需要」未触（修法恒等三 hunk 面）·§1-修法三 hunk 定稿面/§1.3 候选裁决/§5 Ban 列表/pins 十一值/**§8 原文零改零翻转**。

**⑦ STOP · `executed:stopped_gate_red_escalated` · 修法三 hunk 已恒等落卷（blob `2cc3e5f0`·+9/−2）+五门绿·主门红=环境供给（Key 缺）非断言红·翻绿重跑授权与裁决权归协调方（供给 `.env`/Key 后单次 prove 复跑·或回炉）·post 双审两外席待派于重跑绿后·alone≠dual · ⛔push**

**P2-d EXEC 重 pin（§0 协议四值·2026-10-16·`git fetch` 后 origin tip=`317ea3df` 亲证≥授权预期下限 317ea3df 恒等·四值全数实测相符零偏差）**：

1. **`scripts/ai-docs/public-text-policy.mjs` 重 pin**：blob `bdfd4142`（@`7ac68ed7`）→**`3015b893`**（全值 `3015b8935244fb4beae07217d6b0ce8e1bf02b63`·@origin tip `317ea3df` 亲算）·cap 行 `:90` →**`:92`**=`const MAX_FILES = 2_160;`（cap 2152→**2160**·2160 系 2152→2160 随在飞四卷各 +2 预算 sanction 注记在卷·门 4 依据随新 cap）。
2. **docs:check 届时基线实测**：merge 后终树实测值承登 §9 门 4（预期≤cap 2160）。
3. **worktree 计数重 pin**：起草时 25 树→**26 树**（`git worktree list` 实测·+1=本刀 `meetwise-u3`·uc003 同名树仍恰 1）。
4. **spec 触分支计数重 pin**：起草时 42→**44**（本支线本地分支口径 `git branch` 逐支 `git log -1 -- <spec>` 实测）·44 支 spec 触顶全数 HEAD `c5d9f77a`/origin tip `317ea3df` 祖先（`merge-base --is-ancestor` 逐支扫描零非祖先）=**§0.0 在飞交叠复核重跑零在飞新触**·停止条件「现场漂移」未触。
