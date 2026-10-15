# I18N-METADATA-SSR REQUEST（UC003 i18n 漏项迁移刀 · SSR 元数据与漏项四文件级收口 = layout metadata 三锚 generateMetadata + resume meta title + not-found 四词 + loading/Spinner 加载面 + messages 键增 + UC003 spec 词条联动定谳 · 零迁移 · 单日级）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷·⛔push·零码动——本卷恰 1 .md 落卷即停）。

**席位**：I18N-METADATA-SSR 漏项迁移刀 REQUEST 起草席（协调方派单 brief：UC003-arm4 §6 漏项登记定谳·真实 i18n 漏项 4 文件级——①`apps/web/app/layout.tsx` metadata 三锚 ②`apps/web/app/resume/page.tsx:17` static title ③`apps/web/app/not-found.tsx:7-11` 四词 ④加载面 `loading.tsx:6`+`Spinner.tsx:7`·修法方向=UC003-arm4 §6 候选 ii「generateMetadata 读 locale 供 per-locale title/description/og:locale+词面迁 messages+t() 替换」。docs-only 起草卷·⛔push·⛔改产品码）。

**基线**：`feat/mysql-schema-skeleton` @ `77ba32ab`（全 hex `77ba32ab01539d57a101ee9bd7df208c3223811a`·`git fetch` 后 `origin/feat/mysql-schema-skeleton` tip 与派单锚 `77ba32ab` **恰等值**（tip≥锚 前置满足·本支线树 HEAD 同指亲证）。分支 `line/i18n-metadata-ssr`·工作树 `meetwise-i18n`（`git worktree add ../meetwise-i18n -b line/i18n-metadata-ssr origin/feat/mysql-schema-skeleton` 本起草席已立·届时本地 `feat/mysql-schema-skeleton` behind origin 6——故基座取 origin tip 非本地 HEAD·如实登记）。**EXEC 立项照 §0 头注重 pin 条款**：基线漂移如实改锚·结论不变则只更行号。

**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief 引 **UC003-arm4 §6 漏项登记定谳**（四文件级漏项原文·arm4 卷宗不在本仓——`rg -l "arm4" ai-docs/` 仅 cost-columns/uc184 等无干命中·如实登记为仓外出处·四漏项已在本树逐条机证坐实=§1 红事实）；②在树登记迹**两处**（本刀系其承接刀）：`uc003-followup-REQUEST.md` §0.1-4 范围外注记「`:12` DESC 与 `:17-24` metadata title/keywords/OG 全 zh 系 SEO 元数据面（五面清单外·§3-2 零触）」+同卷 §3-3「not-found.tsx/loading.tsx 及其余全仓 zh 面……本刀只锁五面」；③`uc003-i18n-REQUEST.md` harness 全仓清扫=非目标既登口径延续。

---

## §0 现状锚（起草席亲读·base `77ba32ab`·file:line 逐条 rg/Read/git ls-tree 实测·**EXEC 立项照本节重 pin**）

### 0.0 防重双对表

- `git worktree list`（主仓）：建树前 **27 树实测·无 i18n 树**（本席建树后恰一本树在册=28）；`git branch --list line/i18n-metadata-ssr`：建前不存在。
- `rg -l "i18n-metadata-ssr-REQUEST" ai-docs/`：**EXIT=1 零命中**（建卷前实测）——**零同名卷**。→ 停止条件未触发·可落卷。

### 0.1 i18n 机制读码定稿（起草席读码结论·EXEC 沿此勿另考）

- **next-intl `^4.13.0`**（`apps/web/package.json:43`）·**无路由重构**（无 `[locale]` 段·`i18n/request.ts:8` 注释自证「无路由重构」）。
- **locale 侦测=cookie-only**：`i18n/request.ts:10-11` 读 `locale` cookie·合法值 `['zh','en']`（`:4` `LOCALES`）·缺省 `zh`（`:6` `DEFAULT_LOCALE`）·`Accept-Language` 零读取（另刀既登观察项·本刀禁触）。SSR 侧 locale API=`getLocale()`（next-intl/server·`layout.tsx:34` 在用）·RSC 译文 API=`getTranslations(namespace)`（`page.tsx:30`/`features/page.tsx:32`/`resume/page.tsx:37` 先例）·客户端=`useTranslations`（`error.tsx`/`ResumeUploadForms` 先例）；`layout.tsx:40` `NextIntlClientProvider` 零参形态继承全 messages。
- **messages 双侧**：`apps/web/messages/{en,zh}.json` 各 234 行·flatten 叶 **212/212** parity（本席 node 实测·S2 现绿前提）·10 namespace（nav 18/home 82/login 13/common 4/features 31/interview 44/resumeUpload 5/errorBoundary 5/publicPreview 6/resumeDelete 4=212）。
- **metadata 现机制=static export**：`layout.tsx:15` `export const metadata: Metadata`（全站 SEO·模块级常量·零 locale 依赖）+`resume/page.tsx:17` `export const metadata = { title: '简历 · 知面' }`（页级·child title 走 layout `:17` template `%s · 知面 Meetwise`）。全仓 `generateMetadata` 现状=**零处**（rg 亲证）——本刀为首引·App Router root layout 与 page 均合法挂点。

### 0.2 blob 锚表（`git ls-tree HEAD` 亲算·全 @`77ba32ab`）

| # | 文件 | blob（前 8 hex） | 关键行锚 |
|---|---|---|---|
| 1 | `apps/web/app/layout.tsx` | `c9599893`（全 51 行·RSC） | `:4` `import { getLocale } from 'next-intl/server'`（**locale API 已在位·零新增 import 面**）· `:11` `const SITE = resolvePublicSiteUrl()`（public-copy E4 锁 `resolvePublicSiteUrl` 字面在场+`https://meetwise.example` 禁入·**迁移后必须保活**）· `:12` `const DESC = '知面预览版：按真实经历练面试。下一题跟着回答走，进度能留下来，点评只供复盘。'`（**漏项①-a·DESC 被 `:18/:23/:24` 三处复用**）· `:15` `export const metadata: Metadata` · `:17` `title: { default: 'Meetwise 知面 · 预览版', template: '%s · 知面 Meetwise' }`（**漏项①-b 双值**）· `:18` `description: DESC`（**漏项①-c**）· `:19` `keywords: ['模拟面试','面试准备','简历整理','技术面试','知面','Meetwise']`（**漏项①-d 六项**）· `:20` `applicationName: 'Meetwise 知面'`（**漏项①-e**）· `:21` `authors: [{ name: 'Meetwise' }]`（ASCII·**非漏项零触**）· `:23` `openGraph: { title: 'Meetwise 知面 · 预览版', description: DESC, type: 'website', locale: 'zh_CN', siteName: 'Meetwise 知面', url: … }`（**漏项①-f·`locale: 'zh_CN'` 硬编码**）· `:24` `twitter: { card: 'summary_large_image', title: 'Meetwise 知面 · 预览版', description: DESC }`（**漏项①-g**）· `:29` viewport（零触）· `:34` `getLocale()`（html lang 注入·零触） |
| 2 | `apps/web/app/resume/page.tsx` | `2f2208b8`（全 128 行·async RSC） | `:3` `import { getTranslations } from 'next-intl/server'`（已 in use `:37`）· `:17` `export const metadata = { title: '简历 · 知面' }`（**漏项②·b 类词源本体**）· `:43` `<h1 …>简历 · 知面</h1>`（**同词形 h1·spec `resumePageHeader` 具名面在册·非本刀漏项·零触**——与 `:17` 同词异面如实区分） |
| 3 | `apps/web/app/not-found.tsx` | `770d92c9`（全 15 行·同步 RSC·零 i18n import） | **漏项③四词**：`:7` `页面不存在`（h1）/`:8` `你要找的页面不存在或已移动。`（p）/`:10` `返回首页`（Link href=/）/`:11` `进入总览`（Link href=/dashboard）——rg 四词 test/e2e-ui/scripts **零测试锁定**（机证 EXIT 空）·root app/not-found 在 App Router 渲染于 root layout 内（NextIntlClientProvider 覆盖域）→ `getTranslations` 合法 |
| 4 | `apps/web/app/loading.tsx` | `2f82ded6`（全 9 行·同步 RSC） | `:6` `<Spinner />加载中…`（**漏项④-a·可见文本**·zh 逐字=`common.loading` 现值）· aria-busy 容器零触 |
| 5 | `apps/web/components/ui/Spinner.tsx` | `353ca001`（全 15 行·无 'use client'·双域共享件） | `:7` `label = '加载中'`（**漏项④-b·默认参硬编码 zh·无省略号**）· 全仓调用点恰四：`loading.tsx:6`（**唯一不传 label 者=默认值唯一生效面**）+`SubmitButton.tsx:45`/`ResumeUploadForms.tsx:16`/`JobCreateForm.tsx:65`（均显式 `label=""`）· `:5` 注释「仍是清晰的"加载中"形态」（注释面·扫描器剥离·零触） |
| 6 | `apps/web/messages/en.json` / `zh.json` | `6c53673d` / `3b9ea4bf`（各 234 行） | flatten 叶 **212/212** parity（实测）· `common.loading` zh=`加载中…` en=`Loading…`（**在册·漏项④-a 复用源**）· `errorBoundary.backToDashboard` zh=`返回总览`（**≠漏项③ `进入总览`·逐字节不等·禁复用**）· `features.ctaHome` zh=`返回首页`（与漏项③ 同词形但异 namespace 面·禁跨面复用）· `nav.resume` zh=`简历`（**≠ `简历 · 知面`·禁复用**） |
| 7 | `apps/web/e2e-ui/uc003-i18n-locale.spec.ts` | `968e3f25`（全 158 行） | `:4-24` 头注（migrated zone+named-allowlist 政策原文「every CJK text node found on /resume must belong to a named unmigrated face」）· `:31-76` `ALLOWED_CJK_FACES` **恰 10 具名面**（navHardcodedLabels 3/resumePageHeader 3/resumePageUploadCard 1/resumePagePersonalization 4/resumePageListChrome 7/resumePageConsentGate 9/resumeUploadFormsLiterals 5/deleteResumeButtonLiterals 6/resumeStatusLabels 7/localeSwitcher 1=46 值）· `:33-37` `resumePageHeader` 首条 `'简历 · 知面'`（**=h1 `:43` 词条·非 metadata title 词条**）· `:140-148` TreeWalker **`document.body` 限域**（`<head><title>` 恒不入扫·metadata title 结构性不在清点域）· `:149-157` `unknown` 判定+`expect(unknown).toEqual([])`（**零 UNKNOWN 硬线**） |
| 8 | `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` | `8c3cfd4f`（全 286 行） | S1–S6+G3' 七查现绿（本树 raw 裸 node 亲跑 **EXIT=0**）· S6 定界针域=error.tsx/Nav/PublicPreviewNav/actions.ts（**本刀触面零交集·proof 整文件零必迁断言面**）· S2 parity/S3 en CJK-free 扫全目录（messages 增键自动入扫）· 本树 `resumePageMetaTitle` 词 **rg 全仓 EXIT=1 零命中**（proof/spec/messages 均无此词条·**摘除联动=空集定谳见 §1.5**） |
| 9 | `apps/web/test/public-copy.proof.mjs` | `dd2b1638`（全 356 行） | `:24` 读 layout 源·`:161` E4 锁 `resolvePublicSiteUrl` 在场+`https://meetwise.example` 禁入（**generateMetadata 改写保活即恒绿**）· 本树亲跑 **EXIT=0 selected=14/14** · metadata zh 词面零锁定（rg 机证） |
| 10 | `apps/web/i18n/request.ts` | `df8e06c1`（全 13 行） | `:4` `LOCALES=['zh','en']` · `:6` `DEFAULT_LOCALE='zh'` · `:10-11` cookie-only 契约（**S1 钉死·本刀禁触**）· `:12` 按 locale 动态 import messages |
| 11 | `package.json`（仓根） | `3b04b871` | `:8` lint `--max-warnings 5235`（**预算行已落行=root 任务 EXIT=0 硬绿·followup 裁决4 已行使态**）· `:9` docs:check · `:215-217` uc003 三门注册（`:215` i18n-locale:prove isolated/`:216` raw/`:217` **i18n-locale-ui:prove** 三旋钮 `E2E_UI_GREP=UC003-I18N-locale-en E2E_UI_PROJECT=chromium E2E_UI_SKIP_WORKER=1`） |
| 12 | `scripts/ai-docs/public-text-policy.mjs` | `3015b893` | `:92` `MAX_FILES = 2_160`（cap 2160·77ba32ab 落值）——本树基线 **2153**（本席亲跑 EXIT=0 亲证）+本卷 1 件=**2154 预期·余 6** |
| 13 | lint 五值预算行 | web `30723cd4` 等 | web 601（`apps/web/package.json:7`）/root 5235（`package.json:8`）/api 1421（`apps/api/package.json:7`）/worker 954（`apps/worker/package.json:7`）/ai-runtime 628（`packages/ai-runtime/package.json:14`）——**五值恰等=门⑥ 线** |
| 14 | 迁移链 | —（`packages/db/migrations/` 树侧实测） | 头 **0204**（`0204_ai_cost_cached_input_price.sql` 在树）——本刀零迁移零 DDL·链深 204 零变 |

### 0.3 锚勘误如实登记

1. **layout.tsx 行号口径**：派单锚「`:19-20` keywords+applicationName」「`:21-23` openGraph locale」实测 openGraph 全值在 **`:23`** 一行（authors `:21`/alternates `:22` 均非 CJK 漏项）·twitter 在 `:24`（派单未列·**同面同性质漏项·本刀并入①-g 如实扩登**）——行号漂移零·归类勘正如实登记。
2. **spec allowlist 面数**：UC003-FOLLOWUP 卷登记 11 面（含 deleteResumeActionLiterals 4 条）——该面已随 followup 移面整除·现树 **10 面 46 值**（§0.2-7 实测）·本卷全锚按现树钉。

---

## §1 红事实（六面逐面·全 @`77ba32ab` 实测）

### 1.1 面① layout.tsx metadata 三锚全 zh 硬编码（全站 SEO 面·locale 零响应）

`export const metadata` 模块级常量（`:15-26`）七处 zh 面（§0.2-1 逐字）+`locale: 'zh_CN'` 硬编码（`:23`）·**全站每路由 `<head>` 注入**（title default/template+description+keywords+applicationName+og 六子面+twitter 三子面）。locale=en 用户（cookie=en·`request.ts:10-11` 契约·`layout.tsx:36` `lang={locale}` 已 en）见全 zh 元数据面——**爬虫/分享卡/浏览器标签同染**。零测试锁定零 public-copy 锁定（§0.2-9 rg 机证）·`generateMetadata` 全仓零处在册（§0.1）——**断言真空即漏项成因**（UC003 两刀扫描域=DOM body 文本+指定源文件·metadata 面两域均未覆盖）。

### 1.2 面② resume/page.tsx:17 static title `简历 · 知面`（b 类词源本体）

页级 metadata static title（`:17`）走 layout template 渲染 `<title>简历 · 知面 · 知面 Meetwise</title>`（zh）。**b 类词源本体**=与 `:43` h1 同词形·但 h1 系 `resumePageHeader` 具名未迁移面（spec `:33-37` 在册·**本刀零触**）·metadata title 系**独立面**（head 域·不在 spec 清点域·§0.2-7）。零测试锁定。

### 1.3 面③ not-found.tsx:7-11 四词 zh 硬编码

`:7` 页面不存在/`:8` 你要找的页面不存在或已移动。/`:10` 返回首页/`:11` 进入总览 四词（§0.2-3）。root 404 面全路由可达·locale=en 用户 404 即见全 zh。`进入总览` ≠ `errorBoundary.backToDashboard` zh `返回总览`（**逐字节不等·复用即改 zh 渲染面·禁**）·`返回首页` 与 `features.ctaHome` 同词形但异 namespace 面（跨面复用=耦合·禁·§1.3）。零测试锁定。

### 1.4 面④ 加载面 loading.tsx:6 `加载中…` + Spinner.tsx:7 默认参 `加载中`

loading.tsx `:6` 可见文本（zh 逐字=`common.loading` 现值 `加载中…`·**复用在册键零新键**）+Spinner `:7` 默认参（无省略号·**≠`common.loading` 逐字节**→需新键 `common.loadingAria` zh=`加载中`）。Spinner 默认值唯一生效面=`loading.tsx:6`（其余三调用点均显式 `label=""`·§0.2-5）——**漏项④-b 的运行时影响域=恰加载面**。零测试锁定。

### 1.5 面⑤ UC003 臂④与 metadata 面断言关系定谳（**resumePageMetaTitle 词条摘除=空集·防假修条款**）

- **臂④命名钉**：`uc003:i18n-locale-ui:prove` 单 test 五步骤·**断言臂四臂**=臂①迁移区三点 CJK 零残留（步骤②）·臂②空文件 en 错误码（步骤③）·臂③/login en 冒烟（步骤④）·**臂④=全页残留清点**（步骤⑤·`unknown` 判定 `:149-157`·「每条 CJK 必属具名未迁移面」政策所在）。步骤① cookie 预置系 setup 非臂。
- **摘除定谳（派单问 2d·读码定稿）**：`resumePageMetaTitle` 具名面词条**在 spec 不存在**（rg 全仓 EXIT=1·§0.2-8 机证）——metadata `<title>` 系 head 域·spec 清点器 TreeWalker **`document.body` 限域**（`:140-148`）→ **结构性不入清点**·上两刀 allowlist 亦从未收录·spec `:33-37` `resumePageHeader` 首条 `'简历 · 知面'` 系 **h1（`:43`）词条**而非 metadata 词条。故：**「摘除联动」空集成立**——无词条可摘·**Ban 为摘除而伪增后删**（§5）；h1 词条**必须维持**（h1 未迁移·摘之则臂④ `unknown=['简历 · 知面']` 即红）。本刀落码后臂④零 UNKNOWN 前提=①四漏项迁移不向 /resume body 引入任何新 CJK 文本节点（messages 管道 en 渲染 CJK-free）②allowlist 10 面 46 值零动。spec 允许变动面=**恰头注 `:4-24` 措辞同步**（§1-修法⑥·零断言改）。
- **spec 具名面政策执行核**：迁移面四件（layout/resume-meta/not-found/loading+Spinner）修复后均**非未迁移面**→ 政策要求下它们**不得入 allowlist**（现状未入=恒合规·零动作）·**正向覆盖**由静态门承接（S2/S3 全目录 parity+CJK 扫·messages 新键自动入扫）·UI 门臂④维持零 UNKNOWN 即结构绿。

### 1.6 must-not-break 面（本刀硬约束锚）

①**S2 key parity 212/212 现绿**——新 namespace 落地后 parity 同步扩·**迁移前基线若 ≠212/212 → 停（基线漂移重 pin）**；②**proof `uc-e2e-003-i18n-locale.proof.mjs` 全文件零改**（S1–S6+G3' 七查零必迁断言面·§0.2-8·`git diff --exit-code` 门）·web-logic.proof.ts/public-copy.proof.mjs 全文件零改（**web-logic `:264` 负断言地雷既登条款执行核**：本刀不迁任何 namespace 进 web-logic 读面·`:1865-1866` messages 读入全 `includes` 子串形·增键增量安全·零扰）；③**public-copy E4 layout 交面**：`resolvePublicSiteUrl` 字面保活+`https://meetwise.example` 恒禁入（§0.2-9）；④**i18n locale 源管道零改**（`i18n/request.ts`/`locale-actions.ts`/middleware cookie-only 契约·S1 钉死）；⑤**spec allowlist 10 面 46 值零动**+臂①-③零动；⑥**viewport/authors/robots/metadataBase/alternates 五 locale 无关子面语义零变**（值与形保持·仅载体由 const 转 generateMetadata 返回对象）；⑦**矩阵 UC-E2E-003 stays partial**（coveredCount=8 不翻）。

---

## §1-修法（六件·①-⑥ 逐面·零迁移·零 DDL·零新存储面·模型面零触）

### 修法① layout.tsx：`export const metadata` → `export async function generateMetadata(): Promise<Metadata>`

- **形（定稿）**：`:4` import 增 `getTranslations`（同源 `next-intl/server`·`getLocale` 已在）；`:12` `DESC` const **随迁摘除**；`:15-26` 改 `export async function generateMetadata(): Promise<Metadata> { const t = await getTranslations('meta'); const locale = await getLocale(); … }`——函数体内构造返回对象·**九子面逐一对应**：`metadataBase: SITE ?? undefined`（`:11` SITE 保活·public-copy E4 恒绿）·`title: { default: t('titleDefault'), template: t('titleTemplate') }`·`description: t('description')`·`keywords: t('keywords').split(',').map(s => s.trim()).filter(Boolean)`（**数组→messages 逗号串 split 复原形**·zh 六项逐字 preserves·如实登记）·`applicationName: t('applicationName')`·`authors: [{ name: 'Meetwise' }]`（原样）·`alternates/robots`（原条件形原样）·`openGraph: { title: t('titleDefault'), description: t('description'), type: 'website', locale: OG_LOCALE[locale], siteName: t('siteName'), url: SITE?.toString() }`（**`locale: 'zh_CN'` 硬编码→代码映射 `{ zh: 'zh_CN', en: 'en_US' } as const`·locale tag 非文案不入 messages**）·`twitter: { card: 'summary_large_image', title: t('titleDefault'), description: t('description') }`。`viewport`（`:28-29`）与 RootLayout 体零触。
- **zh 值逐字节线**：`meta.titleDefault` zh=`Meetwise 知面 · 预览版`·`meta.titleTemplate` zh=`%s · 知面 Meetwise`·`meta.description` zh=`知面预览版：按真实经历练面试。下一题跟着回答走，进度能留下来，点评只供复盘。`（`:12` 逐字）·`meta.keywords` zh=`模拟面试, 面试准备, 简历整理, 技术面试, 知面, Meetwise`（六项逐字·连接形 `, ` 如实登记）·`meta.applicationName` zh=`Meetwise 知面`·`meta.siteName` zh=`Meetwise 知面`——**缺省 zh 渲染面逐字节恒等**。en 值全 CJK-free（S3 扫全域）：`Meetwise · Preview`/`%s · Meetwise`/`Meetwise preview: practice interviews built on real experience. The next question follows your last answer, progress stays resumable, and notes are only for your own recap.`/`mock interview, interview preparation, resume tidy-up, technical interview, Meetwise`/`Meetwise`/`Meetwise`。
- **ICU 口径**：`%s · …` 过 next-intl t() 字面透传（`%`/`s` 非 ICU 特殊符·双语值零撇号防 ICU 引号转义）。

### 修法② resume/page.tsx:17：static metadata → `generateMetadata`

- `:17` `export const metadata = { title: '简历 · 知面' }` → `export async function generateMetadata() { const t = await getTranslations('resumeMeta'); return { title: t('title') }; }`（`:3` import 已在·零新增）。zh=`简历 · 知面`（逐字·b 类词源本体入卷）·en=`Resume`（CJK-free·template 下渲染 `Resume · Meetwise`）。**`:43` h1 与 `resumePageHeader` 具名面零触**（§1.5 定谳）。

### 修法③ not-found.tsx 四词入新 namespace `notFound`

- 组件改 `async` + `const t = await getTranslations('notFound')`（root not-found 渲染于 root layout 内·RSC 管道合法·§0.2-3）·四词 `t('title')`/`t('message')`/`t('backHome')`/`t('toOverview')`。zh 逐字：`页面不存在`/`你要找的页面不存在或已移动。`/`返回首页`/`进入总览`·en CJK-free：`Page not found`/`The page you are looking for does not exist or has moved.`/`Back to home`/`Go to overview`。**禁复用** `errorBoundary.backToDashboard`（返回≠进入·§1.3）与 `features.ctaHome`（跨面耦合·§1.3）。

### 修法④ 加载面两处：loading.tsx t() 复用 + Spinner label 必选化

- **loading.tsx**：组件改 `async` + `const t = await getTranslations('common')` → `<Spinner label={t('loadingAria')} />{t('loading')}`——`common.loading`（zh=`加载中…` **在册复用零新值**）+新键 `common.loadingAria`（zh=`加载中` **逐字=原默认参**·en=`Loading`）。
- **Spinner.tsx:7**：默认参摘除·`label` 改**必选** `{ className, label }: { className?: string; label: string }`——其余三调用点均显式 `label=""`（§0.2-5 机证）·typecheck 强制收口·**零硬编码 zh 残留**；`:5` 注释零触（注释面剥离口径）。

### 修法⑤ messages 键增（双侧同构·parity 212→**224/224**）

- 新 namespace `meta` 6 键（titleDefault/titleTemplate/description/keywords/applicationName/siteName）+新 namespace `resumeMeta` 1 键（title）+新 namespace `notFound` 4 键（title/message/backHome/toOverview）+既有 `common` +1 键（loadingAria）=**恰 +12 键**·en/zh 双侧同名同构（S2 parity 224/224·**数值随裁决1 冻结·以 node flatten 实测为准**）·en 全 CJK-free（S3 恒绿·`EN_CJK_ALLOW` 两键零动）。

### 修法⑥ UC003 spec 词条联动（spec 1 文件·头注措辞同步·零断言改）

- **摘除联动=空集**（§1.5 定谳·rg EXIT=1 机证）——无 `resumePageMetaTitle` 词条·Ban 伪增后删·allowlist 10 面 46 值零动。
- **头注 `:4-24` 措辞同步（恰 1-2 行）**：增一句申明「metadata title/og 与 not-found/loading/Spinner 面已迁 messages 管道（en 侧 S2/S3 静态承接）；metadata `<title>` 系 head 域非 body 文本节点·结构性不在本 spec 清点域·allowlist 无 metadata 词条属结构正确非遗漏」——**防后刀审计重复发现同一"漏项"**·头注其余行零动。断言/allowlist/步骤①-⑤ 逻辑**零字节零动**（臂①-④ 全部原样）。

### §1.3 候选否决（每条带否决理由·EXEC 不得复活）

1. **否决「static metadata + middleware 按 locale 改写 HTML」**：metadata 在 RSC 渲染层注入·middleware 改写响应体=新拦截层+与 CSP nonce 响应头形互相踩（`middleware.ts:30`）·扩界。
2. **否决「`[locale]` 路由重构」**：`request.ts:8` 「无路由重构」既定契约·S1 结构断言钉死 cookie-only·重构级越界。
3. **否决「resume meta title 复用 `nav.resume`」**：zh=`简历` ≠ `简历 · 知面`·违 zh 逐字节线。
4. **否决「`进入总览` 复用 `errorBoundary.backToDashboard`」**：zh=`返回总览` ≠ `进入总览`·逐字节不等·复用即改 zh 渲染面（与上刀 zh 缺省逐字节硬线同源）。
5. **否决「`返回首页` 复用 `features.ctaHome`」**：同词形异面·跨 namespace 耦合（页面语义变更互相牵连）·沿「新面新 namespace」先例（errorBoundary/publicPreview/resumeDelete 三先例）。
6. **否决「loading 复用 `common.loading` 兼作 Spinner aria-label」**：`加载中…`（带省略号）≠原默认参 `加载中`（无省略号）·aria 面逐字节变形 → 新键 `loadingAria`。
7. **否决「Spinner 默认参改 `''` 或 `'Loading'`」**：空 aria-label=无障碍回退；`'Loading'`=zh 缺省渲染回退（硬编码换形非迁移·同罪）。
8. **否决「en 保留品牌 CJK（`知面`）+扩 `EN_CJK_ALLOW`」**：S3 en CJK-free 现绿面扩权=断言放宽（Ban 删断言/降强度同类）·en 品牌统一走 `Meetwise`（zh 面品牌 CJK 全保留）。
9. **否决「本刀顺迁 resume 页 h1/页面体 zh 面（resumePageHeader 等具名面）」**：不在四漏项清单·spec 臂④ 零 UNKNOWN 的 allowlist 前提即其未迁移在册·顺迁=越界（§3-1）。
10. **否决「og:locale 入 messages」**：locale tag（`zh_CN`/`en_US`）系结构值非用户文案·代码映射最直（零 messages 键膨胀·零 ICU 面）。
11. **否决「案B 新 proof 文件承载本刀静态断言」**：本刀**零必迁断言面**（四漏项零测试锁定机证·S2/S3 自动覆盖新键）·新 proof=多受管件+门注册+docs:check 余量消耗（沿 followup 裁决3 口径）→ **proof 整文件零触**（§1.6-②）。

---

## §2 验收断言候选（pre-exec 双审核对单基面·门预申明）

1. **门①（静态 prove·双口径）**：`node apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` raw **EXIT=0**（S1–S6+G3' 七查全 PASS·proof 零改·S2 parity **224/224**·S3 en CJK-free 恒绿）+isolated `pnpm uc003:i18n-locale:prove` EXIT=0 **恒等**（静态体不读写 DB·双口径条款沿 UC003 先例）。基线：raw 本树亲跑 EXIT=0（212/212）。
2. **门②（UI 门·全四臂绿）**：`pnpm uc003:i18n-locale-ui:prove` **EXIT=0 四断言臂全绿**（臂①迁移区三点+臂②空文件 en+臂③/login smoke+**臂④全页残留清点零 UNKNOWN**（`expect(unknown).toEqual([])`·allowlist 10 面 46 值零动+`resumePageMetaTitle` 词条=空集定谳 §1.5·spec 头注措辞同步不触断言））——**环境受阻处置**：isolated 栈缺 live `MODEL_API_KEY` 时沿 UC003 §9.1 先例 **pending 诚实登记不虚报**（en 面由门① S2/S3 静态承接·known-residual 登记·矩阵 stays partial）·docker 在场则实跑。基线：本刀起草期 UI 门未跑（pnpm 环境未装·EXEC 期按门③前置 install 后行）。
3. **门③（web:prove+public-copy 双零改回归）**：`pnpm web:prove` **EXIT=0**+`git diff --exit-code apps/web/test/web-logic.proof.ts` 过+`git diff --exit-code apps/web/test/public-copy.proof.mjs` 过（**两 proof 全文件零改**·web-logic `:264` 地雷核 §1.6-②）+`pnpm -C apps/web prove:public-copy` **EXIT=0 selected=14/14**（E4 layout 交面 `resolvePublicSiteUrl` 保活核）。
4. **门④（typecheck）**：root `pnpm typecheck`（turbo **8/8**）+`pnpm -C apps/web typecheck` **双 EXIT=0**（Spinner label 必选化与 generateMetadata 形编译收口·e2e-ui spec 入 typecheck 面）。
5. **门⑤（docs:check·红停线）**：`pnpm docs:check` **EXIT=0 且 managed ≤ cap 2160**（`public-text-policy.mjs:92`）——基线 **2153**（本席亲跑 EXIT=0 亲证）+本卷 1 件=**2154 预期·余 6**；**managed > 2160 或 EXIT≠0 → 红停上报**（零自升·cap sanction 权归协调方）。
6. **门⑥（lint 五值恰等）**：web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628** 全 EXIT=0 且 warnings 恰等（root 预算行 5235 已落行=硬绿·followup 裁决4 已行使态承登）；**任一值漂移 → 红停逐文件归因上报**（本刀预期零漂移·messages/tsx 字面迁移非 warning 源·如实以实跑为准）。
7. **门⑦（markers=0+est live=0）**：改动集五类标记词（`i6-239-gates.proof.mjs:155-163` 组装式四英数标记词+冲突标记对）**零命中**+est live=0 双声明入收据。
8. **附（绊线承登）**：`migrate:prove` EXIT=0（链 **204**·头 0204·本刀零迁移零变）；`eval-harness-matrix-cite` 基线红既登承登不修不扩（UC-E2E-003 两子项双 PASS 口径维持·矩阵 stays partial）。
9. **diff 面**：`git diff --name-only <base>` **恰 9 tracked**=`apps/web/app/layout.tsx`+`apps/web/app/resume/page.tsx`+`apps/web/app/not-found.tsx`+`apps/web/app/loading.tsx`+`apps/web/components/ui/Spinner.tsx`+`apps/web/messages/en.json`+`apps/web/messages/zh.json`+`apps/web/e2e-ui/uc003-i18n-locale.spec.ts`（头注措辞同步块）+本卷——**零第二 tracked**（proof/web-logic/public-copy 零改门内嵌于门③）。
10. **偏差熔断**：S2 迁移前基线 ≠212/212 → 停（重 pin）；新 namespace 键数/名 ≠裁决1 冻结值 → 停（越界）；en 值含 CJK → 停；zh 值与 §1-修法 逐字基准任一不等 → 停（逐字节线）；spec 头注外任一字节变动（allowlist/断言/步骤体） → 停（越界）；`resumePageMetaTitle` 词条被增删 → 停（伪修·§1.5 Ban）；proof/web-logic/public-copy 任一 diff 非空 → 停（越界）；门⑤ managed>2160 → 红停；门⑥ 五值任一漂 → 红停归因；diff 面 ≠恰 9 tracked → 停（触面越权）；raw 与 isolated 不一致 → 停（口径漂移）；UI 门臂④出现 UNKNOWN → 红停归因（新 CJK 残面=本刀引入·禁 allowlist 扩面消音·逐条具名上报）。

**EXEC 预期触面清点（触面如实列全·恰 9 文件）**：metadata 面=**恰 2 文件**（`layout.tsx`+`resume/page.tsx`）+**messages 2 文件**（`en.json`+`zh.json`）+**spec 1 文件**（`uc003-i18n-locale.spec.ts` 头注同步）+**t() 替换面 3 文件**（`not-found.tsx`+`loading.tsx`+`Spinner.tsx`）+本卷 1 件——**零迁移零 DDL 零 env 闸零依赖升级**（§3-7）。

---

## §3 范围外（边界清单·越界即 FAIL）

1. **resume 页 body 面**：`:43` h1 `简历 · 知面`/`:45` p/`:89-125` 列表区/`resumePageHeader` 等 spec 10 具名面全零触（§1.3-9 否决条）。
2. **layout.tsx 非 metadata 面**：`:34` `getLocale()`/`:36` html lang/`:40-47` provider/Nav/Toaster/`:28-29` viewport 零字节未触。
3. **i18n locale 源管道**：`i18n/request.ts`/`locale-actions.ts`/middleware locale 面（cookie-only 契约·Accept-Language wiring=另刀既登）零触。
4. **三 proof 整文件**：`uc-e2e-003-i18n-locale.proof.mjs`/`web-logic.proof.ts`/`public-copy.proof.mjs` 零 diff（门③/门① 内嵌）。
5. **SSOT 翻面**：matrix/backlog/harness 旧卷/checklist/LEDGER 只读引用（翻面权归协调方·EXEC 注记 append 除外）——本刀**无批表行**·行翻面权归协调方。
6. **lint 消偿**：warnings 数值下降归后继单独立刀——本刀只守门⑥ 五值恰等。
7. **迁移/DDL/新存储面/env 闸/依赖升级**：零（迁移号预期 **零**·链 204 恒）。
8. **全仓其余 zh 面**（settings `'中文'` option/Nav `:39-41` 三字面/`LocaleSwitcher` `'中'`/DeleteResumeButton/ResumeUploadForms 字面/insert 插值 3 行等）：UC003 既登口径延续·全仓清扫非本刀目标·零触。
9. **既有 e2e spec 其余 7 件与 playwright.config**：零 diff（spec 允许变动=恰 `uc003-i18n-locale.spec.ts` 头注措辞同步块）。

---

## §4 依赖

**零未决硬依赖**：①next-intl `^4.13.0` 在位·`getTranslations`/`getLocale` 全机制现成（layout `:4` 已 import getLocale·page.tsx 三先例）——无前置刀；②零迁移编号交点（链 204 恒）；③**环境前置如实申明**：本树 `node_modules` 缺失（worktree 未装·起草席亲测）——门②/③/④/⑥ 需先 `pnpm install --frozen-lockfile`；门① raw 口径/门⑤ docs:check/门⑤ public-copy 裸 `node`/`pnpm -C` 可跑——**起草席基线三门亲跑全过**（prove raw EXIT=0 212/212·docs:check EXIT=0 2153≤2160·public-copy EXIT=0 14/14）；门② UI 门 isolated 栈 docker+live key 前置沿 UC003 §9.1 先例如实处置。下游无硬闸。

---

## §5 Ban 列表 + pins

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT 行翻面（matrix/backlog/harness 旧卷/eval/checklist/LEDGER 只读引用·翻面权归协调方）；**Ban 写 covered**（矩阵 UC-E2E-003 stays partial·本刀收口≠UC covered≠矩阵翻面）；**Ban allowlist 任何增删改**（含 resumePageMetaTitle 词条伪增后删/`resumePageHeader` h1 词条摘除=臂④ 必红伪修·§1.5 定谳）；**Ban spec 断言/步骤体/allowlist 外扩面**（允许变动=恰头注措辞同步 1-2 行）；Ban 改三 proof（proof/web-logic/public-copy 全文件零改·门①③）；Ban 改 i18n locale 源管道（cookie-only 契约·Accept-Language=§3-3 禁）；Ban 触 §3-1/§3-2/§3-8 维持面（h1/具名 10 面/viewport/全仓其余 zh 面）；Ban 删断言/降断言强度凑绿（S3 `EN_CJK_ALLOW` 扩权=§1.3-8 否决）；Ban zh 值非逐字节（§1-修法 各 zh 基准=逐字节硬线）；Ban 新增迁移/DDL/新存储面/env 闸/依赖升级（§3-7）；Ban 顺带 lint 消偿/预算行改动（§3-6）；Ban 门⑤ cap 自升（managed>2160 红停上报·sanction 权归协调方）；Ban 为 UI 门开 env 扩界或伪造 locale 上下文（沿 UC003 裁决5 口径）；Ban 触模型产出语言面与 fake-model 冒充（ai-eval 轨）；Ban 伪造已问/已验来源。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全静态/本地·零模型外呼·零消耗）

---

## §6 est live=0

本刀零模型真实外呼：门①静态 prove（raw 裸 node/isolated 包装·静态体不读写 DB）；门②UI 门=本地隔离栈 Playwright（零模型推理面）；门③/④/⑥本地 node/tsx/eslint；门⑤docs 静态扫描——零 MODEL_API_KEY 消耗面·零 secrets·零生产操作（pins 脚注同源·EXEC 收据逐门登记零外呼口径）。

## §7 markers=0（卫生声明）

起草改动集=**恰 1 .md**（本卷）——五类标记词（四英数标记词组装式引用+冲突标记对·`i6-239-gates.proof.mjs:155-163` 先例形）改动集直扫**零命中**（起草席自检·命令与回执留 prove·词面组装防自指）。EXEC 预期改动集（§2 触面清点·9 文件）同扫零命中入收据。STOP 终态与本卷自检：**STOP=`draft:awaiting_pre_exec_dual`**（待 pre-exec 双审·三处在卷=本节+§8+尾注）。

---

## §8 STOP（开工三条款 + 裁决项 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（授权出处=UC003-arm4 §6 漏项登记定谳在案·本卷非授权本身）；③EXEC 立项**不得改 §1-修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.3 两处锚勘误如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项（六项·各带推荐）**：

1. **namespace 命名与键数冻结**：新 `meta`(6)/`resumeMeta`(1)/`notFound`(4)+既有 `common`+1（`loadingAria`）=**+12 → parity 224/224**（推荐·S2 断言面随之）vs 备选名（siteMeta/pageMeta/nf404 等）vs resumeMeta 并入 resumeUpload（否决倾向——上传面语义混载）——**名定即冻**·EXEC 不得擅改名改键数。
2. **Spinner label 形**：必选化 `label: string`（推荐·typecheck 强制·三调用点已显式传参机证）vs 默认 `''`（§1.3-7 否决倾向）vs 保持默认改经 messages（双域共享件引 hook=client 边界强转·不推荐）。
3. **en 品牌词面**：en CJK-free `Meetwise`（推荐·S3 恒绿）vs 扩 `EN_CJK_ALLOW` 保 `知面`（断言放宽·§1.3-8 否决倾向·若裁此须同卷改 S3 proof=触面越权本卷 Ban·须回炉）。
4. **keywords 载体形**：messages 逗号串+代码 split（推荐·单键·zh 六项逐字）vs 六独立键 kw1-kw6（键面膨胀·不推荐）。
5. **spec 头注措辞同步形**：恰 1-2 行增注（推荐·防后刀重复定谳同一"漏项"）vs 头注零触（零同步·后刀审计重复成本自担）——两形均零断言改·allowlist 零动恒。
6. **UI 门环境受阻处置**：pending 诚实登记沿 UC003 §9.1 先例（推荐）vs 补 live key 实跑（env 供给面·非本刀授权）。

**停止条件（四类·触一即停）**：①**基线漂移类**——origin tip≠`77ba32ab` 且祖先关系破坏/S2 基线≠212/212/§0.2 任一 blob 漂移超行号漂移级（结论变）→ 停重 pin；②**越界类**——diff 面≠恰 9 tracked/§3 任一命中/allowlist·proof·locale 管道任一字节变/zh 值非逐字 → 停；③**门红类**——门①-⑦任一 EXIT≠0 或恰等值漂/门⑤ managed>2160/门⑥ 五值漂 → 红停归因上报（验收红不可修·禁就地消音）；④**环境受阻类**——门② isolated 栈缺 live key/docker 缺 → pending 诚实登记不虚报（沿先例·非停卷·en 面静态承接承登）。

---

*UC003-I18N-METADATA-SSR REQUEST · 2026-10-14 · **STOP=`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`77ba32ab`（全 hex `77ba32ab01539d57a101ee9bd7df208c3223811a`·fetch 后 origin/feat/mysql-schema-skeleton tip=派单锚 77ba32ab 恰等值亲证·≥锚 前置满足）· 分支 `line/i18n-metadata-ssr` · 工作树 `meetwise-i18n`（git worktree add 本起草席立·基座=origin tip 非本地 HEAD·本地 behind 6 如实登记）· 防重双对表过（rg EXIT=1 零同名卷）· i18n 机制读码定稿=next-intl ^4.13 cookie-only 无路由重构（getLocale/getTranslations RSC 管道·S1 钉死）· 红事实六面机证（layout metadata 三锚 `:12/:17/:18/:19/:20/:23/:24` 七 zh 面+zh_CN 硬编码·resume `:17` b 类词源本体·not-found `:7-11` 四词·loading `:6`+Spinner `:7` 加载面·四件全零测试锁定=漏项成因·`generateMetadata` 全仓零处首引）· **resumePageMetaTitle 词条摘除=空集定谳**（rg 全仓 EXIT=1·spec TreeWalker document.body 限域·`<title>` 结构性不入清点·`resumePageHeader` 首条=h1 词条非 metadata 词条·h1 词条维持=臂④ 零 UNKNOWN 前提·Ban 伪增后删）· 臂④命名钉=断言臂之四=步骤⑤全页残留清点· 修法六件（layout/resume generateMetadata 形+messages +12 键 parity 224/224+notFound 四词 t()+loading 复用 common.loading+loadingAria 新键+Spinner label 必选化+spec 头注措辞同步 1-2 行）· §1.3 候选否决十一条· 门预申明七门+绊线两附+diff 面恰 9 tracked+偏差熔断十二款· §8 六裁决项+停止条件四类· 触面如实列全=恰 2 metadata 文件+messages 2 文件+spec 1 文件+t() 面 3 文件+本卷 1 件· 起草席基线三门亲跑全过（prove raw 212/212 EXIT=0·docs:check 2153≤2160 EXIT=0·public-copy 14/14 EXIT=0）· 零迁移零 DDL·est live=0·markers=0·pins 十一值照抄零翻· STOP 三处在卷（§7/§8/本尾注）· ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
