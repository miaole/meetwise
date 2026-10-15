# UC003-FOLLOWUP REQUEST（UC003 i18n 后刀 · 观察面五项收口 = error.tsx 错误壳 + Nav 招聘方三标签 + PublicPreviewNav 六面 + deleteResumeAction 四消息迁 messages + 已具名面维持 · 零迁移 · 单日级）

**Status**: **`executed:awaiting_post_prove_dual`**（rev1 起草席落卷→pre-exec 双审两外席**双 FAIL**（席1 R1+R2/R3/R4/R5+席2 P1/P2①②③·同判 P1=案A S6 裸针结构性永红）→ **rev2 修订席八项处置落卷**（§9 处置摘要）→ 窄域复审 agent_9aee3bf6 八项全过+协调方授权 EXEC → **EXEC 执行完毕**（§9.1 执行记录·并线 `ed0cee41`+修法四件+门矩阵七门全绿）·**待 post-prove 双审** · **Ban self-approve** · **alone≠dual**）。

**席位**：UC003-FOLLOWUP i18n 后刀 REQUEST 起草席（协调方派单 brief：UC003-i18n 收口刀 nail 后 checklist STILL OPEN 后刀观察清单五项收口·源出处=`ai-docs/delivery/execution-master-checklist.md:2729` STILL OPEN ④ 逐字 + `apps/web/e2e-ui/uc003-i18n-locale.spec.ts:73-82`（post 重审席2 P2 在树登记物：deleteResumeActionLiterals 具名 known-residual 四条+`<status>` 运行时插值占位形+失败路径不触声明）+ `uc003-i18n-REQUEST.md` §9.5 P1-1(d) 登记出处。docs-only 起草卷·⛔push·⛔改产品码）。

**基线**：`feat/mysql-schema-skeleton` @ `3b32b6c8`（全 hex `3b32b6c8066527b77343f8021d13978e6d25f382`·`git fetch` 后 origin tip 与本地 tip 同指亲证零漂）。分支 `line/uc003-followup`·工作树 `meetwise-u3f`（`git worktree add ../meetwise-u3f -b line/uc003-followup feat/mysql-schema-skeleton` 本起草席已立）。**rev2 基线漂移登记（席2-P2③）**：主线 tip 已前移——`619f0a92`（ag04-consumer-fix nail merge·`git merge-base --is-ancestor 3b32b6c8 619f0a92` EXIT=0 祖先链亲证·619f0a92 非本分支 HEAD 祖先=fork 后主线独立前行）·rev2 落笔时刻本/origin `feat/mysql-schema-skeleton` tip 实测已至 `5bd92ce8`（619f0a92 之上 ag04 SSOT 收官一件·`--is-ancestor 619f0a92 5bd92ce8` EXIT=0 亲证）——本卷 §0.1 blob/行号锚系 `3b32b6c8` 基线实测·**EXEC 立项照本节头注重 pin 条款覆盖此前移**（重 pin 以当刻 origin tip 实测为准·结论不变则只更行号）。

**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①`ai-docs/delivery/execution-master-checklist.md:2729`「Line uc003-i18n nail」段 STILL OPEN ④ 逐字：「后刀观察面（spec 具名 allowlist 既登残面·非本刀 Ban 面）：error.tsx 五处 zh 面+Nav 招聘方分支三面+PublicPreviewNav+delete 四消息 en 化（`deleteResumeActionLiterals` 四条·`<status>` 运行时插值占位形登记）+`<status>` 占位迁 messages+插值型 3 行（'连接面试'/'本题得分'/'本次练习反馈'）整行残留+`ocr-preview-ui.ts` 客户端共享件携全量 zh.json bundle 观察项+Accept-Language locale 源管道 wiring 登记另刀」——本刀承接其中**五项**（error.tsx 五处/Nav 招聘方三面/PublicPreviewNav/delete 四消息+`<status>` 占位迁 messages/已具名面维持不扩）；**同条内插值型 3 行、ocr-preview-ui bundle 观察项、Accept-Language wiring 三项零触**（§3-4）。②`apps/web/e2e-ui/uc003-i18n-locale.spec.ts:73-82`（席2 P2 在树登记物·④ 迁移后随卷移面）。③`ai-docs/delivery/harness/uc003-i18n-REQUEST.md` §9.5 P1-1(d)（allowlist 11 面登记出处·允许变动面=恰本卷 §2-移面条款）。

---

## §0 现状锚（起草席亲读·base `3b32b6c8`·file:line 逐条 rg/Read/git ls-tree 实测·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.3 EXEC 重 pin（2026-10-15·协调方授权 EXEC 后并线实测）

并线 `git merge --no-ff feat/mysql-schema-skeleton`→**merge `ed0cee41`**（双亲 `2e38f4e9`+`8ae2a93e`·ort 零冲突）：①origin tip 实测 `8ae2a93e`（协调方预告 `8ae2a93e+` 恰中）；②**apps/web 十八锚全零漂**（merge 13 文件涉 ai-docs/api·worker test/根 package.json/迁移 0202/scripts·ai-docs——`apps/web/**` 零文件·§0.1 全锚行号逐条 Read 复核恒等·结论零变只更本节）；③**漂移三值如实改锚**：根 lint 预算行 5224→**5235**（#13 漂移·sanction 随并线落行·门⑥ root 任务转 EXIT=0 硬绿·裁决4 无需 EXEC 行使）；cap 2120→**2128**（#15 漂移·`public-text-policy.mjs` MAX_FILES=2_128·d49865ee 落值）；迁移链 201→**202**（`0202_interview_event_kind_score_card_written.sql` 在树）；④**复审 P2 正字**：`spec.ts:29` 系 **navHardcodedLabels 行**（`navHardcodedLabels: ['押题','找工作','岗位匹配']` 三字面行）非 resumePageHeader 首条字面行——§1.2/§9-3 两处面名随 pin 正字；⑤并线后基线三门复跑：S2 parity 194/194+prove raw EXIT=0（6/6）+public-copy 14/14+docs:check 2122≤2128 全过。

### 0.0 防重双对表

- `git worktree list`（主仓）：起草前 **25 树实测·无 u3f 树**（本席建树后恰一本树在册）；`git branch --list`：建前无 `line/uc003-followup` 分支。
- `rg -l "uc003-followup-REQUEST" ai-docs/`：**EXIT=1 零命中**（建卷前实测）——**零同名卷**。→ 停止条件未触发·可落卷。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`3b32b6c8`）

| # | 文件 | blob（前 8 hex） | 关键行锚 |
|---|---|---|---|
| 1 | `apps/web/app/error.tsx` | `77a3612c`（全 17 行·`'use client'` `:1`） | `:4` 注释自证「根错误边界(修审计 #6,无死胡同铁律):任何 RSC/Server Action 抛错都落这里」· **五处 zh 面**：`:8` `出错了`（h1）/`:9` `页面遇到一个错误,可以重试;若反复出现请稍后再来。`（p）/`:10` `错误标识:` + `{error.digest}`（p·**运行时插值 error.digest**）/`:12` `重试`（Button onClick=reset）/`:13` `返回总览`（Link href=/dashboard）——rg `出错了\|返回总览\|错误标识` 全仓 test/e2e/scripts **零测试锁定**（机证 EXIT 空） |
| 2 | `apps/web/components/Nav.tsx` | `c96ee336`（全 140 行·Server Component） | `:28` `isRecruiter = ck.get('mw_role')?.value === 'recruiter'`（**mw_role cookie 条件面**）· `:29` `getTranslations('nav')`（**既有 nav namespace 已在用**）· `:39-41` 押题/找工作/岗位匹配（#268 S2a 裁定零 i18n 键面·`:41` 注释自证·**⑤ 维持面**）· `:48-53` recruiterLinks：`:49` `{ href: '/recruiter/jobs', label: '岗位' }`/`:50` `{ href: '/recruiter/talent', label: '投递' }`/`:51` `{ href: '/recruiter/how-it-works', label: '笔记' }`/`:52` settings 走 `t('settings')` · `:55` `appLinks = isRecruiter ? recruiterLinks : candidateLinks`·`:64-71` authed 分支内渲染——**三标签零测试锁定**（rg `'岗位'\|'投递'\|'笔记'` test/e2e/scripts EXIT 空） |
| 3 | `apps/web/components/PublicPreviewNav.tsx` | `2ca23596`（全 31 行·Server Component 无 'use client'） | **六面**：`:10-13` links 数组四 label（`首页`/`产品能力`/`常见问题`/`数据边界`）+`:19` `aria-label="预览导航"`+`:20` 品牌名 `知面 Meetwise`· `:22` `links.slice(1)` 渲染后三个（`:10` `首页` 字面在场不渲染·源面残留同锁）——**六面零测试锁定零 public-copy 锁定**（rg 双证 EXIT 空）· 消费面唯一=`app/layout.tsx:6`（import）+`:42`（渲染）· `:3-8` 文件头注释自证 public preview 独立导航防登录/billing 链误入 |
| 4 | `apps/web/app/layout.tsx` | `c9599893`（全 51 行） | `:32` `publicPreview = resolvePublicPreview(process.env.MEETWISE_PUBLIC_PREVIEW)`（**环境条件源**）· `:42` `{publicPreview ? <PublicPreviewNav /> : <Nav />}`（**三元条件渲染**）· `:40` `NextIntlClientProvider` 零参形态（全 messages 继承·UC003 §9.1 先例同机证）· `:34` `getLocale()` cookie 读法 · **范围外注记**：`:12` DESC 与 `:17-24` metadata title/keywords/OG 全 zh 系 **SEO 元数据面**（五面清单外·§3-2 零触） |
| 5 | `apps/web/app/resume/actions.ts` | `97cd5ccb`（全 168 行·'use server'） | `:27-28` 注释自证「作用域=上传面五处;**deleteResumeAction 的四处内联文案不在本刀迁移面,零触**」（UC003 刀零触条款·**本刀解禁面**）· `:29-35` `UPLOAD_MESSAGES` zh/en 双语载体（上传面五处·上刀迁移产物·零触）· `:38-40` `resumeUploadLocale()`（**locale 读法先例=仅取 cookie**·与 `i18n/request.ts:10-11` 同契约）· `:43-45` `assertOk`（非 ok 抛 Error→根错误边界·**面① 可达性源**）· assertOk 调用点 `:59/:61/:75/:137`（/resume 域 UI 真实触发）· `:152` `deleteResumeAction`·**四处内联 zh message（本刀④迁移面）**：`:157` `'网络错误，请稍后重试；简历未被删除。'`（fetch catch 臂）/`:160` `'找不到这份简历，或它已被删除。'`（404 臂）/`:161` `'删除请求未受理（' + res.status + '），未当作已删除。'`（非 202 臂·**运行时插值 res.status**）/`:164` `'删除受理形状不合法，未当作已删除。'`（body 形状臂）——**行号漂移如实登记**：UC003 卷基线锚 `:138/:141/:142/:145` 系 UPLOAD_MESSAGES 增量位移前·现树实测 `:157/:160/:161/:164`（spec allowlist `:77-82` 已按位移后登记·结论零变） |
| 6 | `apps/web/app/resume/DeleteResumeButton.tsx` | `f7745856`（全 67 行·'use client'） | `:14-17` `useActionState` 绑定 `deleteResumeAction`·`:62-64` `state.ok === false && state.message` 时 `role="alert"` 渲染 `state.message`（**④ 消息唯一 DOM 消费面**）· 组件自身 zh 字面（`删除`/确认文案/`删除中…`/`确认删除`/`取消`）=spec `deleteResumeButtonLiterals` allowlist 面（**⑤ 维持面零触**）· `/resume/page.tsx:113` 挂载点 |
| 7 | `apps/web/components/LocaleSwitcher.tsx` | `082f02c5`（全 15 行） | `:10` `label="中"`（**⑤ 维持面代表**·spec `:72` `localeSwitcher: ['中']` 承接）· `:12` `label="EN"`（CJK-free）——本刀零触 |
| 8 | `apps/web/messages/en.json` | `15d6dc46`（210 行） | **7 namespace·flatten 叶 194**（起草席 python 实测）：nav 15/home 82/login 13/common 4/features 31/**interview 44/resumeUpload 5**（后两键数与派单 brief 口径恰等） |
| 9 | `apps/web/messages/zh.json` | `471d2475`（210 行） | 同 7 namespace·flatten 叶 **194**（与 en parity·S2 现绿前提·实测同值） |
| 10 | `apps/web/e2e-ui/uc003-i18n-locale.spec.ts` | `50f6b738`（全 165 行） | `:28-83` `ALLOWED_CJK_FACES` **恰 11 具名面**（navHardcodedLabels 3/resumePageHeader 3/resumePageUploadCard 1/resumePagePersonalization 4/resumePageListChrome 7/resumePageConsentGate 9/resumeUploadFormsLiterals 5/deleteResumeButtonLiterals 6/resumeStatusLabels 7/localeSwitcher 1/**deleteResumeActionLiterals 4**=50 值）· `:73-76` 注释块（failure-paths-only+`<status>` 占位声明）· `:77-82` `deleteResumeActionLiterals` 四条（第三条 `<status>` 占位形·UNKNOWN 有意哨兵）· `:85` `ALLOWED_CJK` Set·`:157-164` UNKNOWN 判定与失败断言——**本刀允许变动面=恰 `:73-82` 移面块**（§2-移面条款·其余 10 面零动） |
| 11 | `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` | `7337108c`（全 211 行） | S1–S5+G3' 六查在册（UC003 修法③ 翻面产物·现绿）· **`:120` 注释**「(deleteResumeAction keeps its four zh messages untouched; never file-scan actions.ts)」· **`:134-135` S4 内零触守卫针**：`for (const needle of ['网络错误，请稍后重试；简历未被删除。', '找不到这份简历，或它已被删除。', '删除请求未受理（', '删除受理形状不合法，未当作已删除。']) assert.ok(actions.includes(needle), 'deleteResumeAction zh message must stay untouched: ...')`——**④ 迁移必迁断言面**（守卫针反转·§1-修法④·否则门① 必红）· `:170` EXIT 语义（EXIT=0=结构绿≠covered） |
| 12 | `apps/web/test/public-copy.proof.mjs` | `dd2b1638`（全 356 行） | **14/14 现绿**（本树亲跑 EXIT=0·`selected=14/14`）· **五面零锁定机证（rev2 首查收窄勘误·R3）**：原首查宽 alternation `PublicPreviewNav\|首页\|产品能力\|常见问题\|数据边界\|预览导航\|知面` 在 test/e2e-ui/scripts **有具名面子串命中**（rev2 逐处实测：`spec.ts:31` `简历 · 知面`/`:33` `← 返回首页`/`:58` `数据边界说明`·`online-public.spec.ts:10` 注释/:26 首页品牌正则·`golden.spec.ts:11/:13`·`scripts/ai-docs/check-docs.mjs:92`·`public-text-policy.mjs:123`——均系他面既有锁/策略词面·非本六面锁定）→ **逐面定界形收窄机证**：`PublicPreviewNav`/`label: '首页'`/`label: '产品能力'`/`label: '常见问题'`/`label: '数据边界'`/`预览导航` 六查 test/e2e-ui/scripts EXIT 空（唯 `知面 Meetwise` 命中 `online-public.spec.ts:26`——公开落地页品牌面既有锁·非 PublicPreviewNav 源面锁·如实登记）·`出错了\|返回总览\|错误标识` 与 `label: '岗位'\|label: '投递'\|label: '笔记'`（rev2 定界形）两查 EXIT 空——唯 `:137` 锁 `DeleteResumeButton` 确认文案（⑤ 维持面·零触）——本刀 public-copy **零断言改·纯回归守护门** |
| 13 | `package.json`（仓根） | `35611a1f` | `:8` `"lint": "eslint . --max-warnings 5224"`——**sanction 5235 已授未落行**（tokstream-s4b nail `checklist:2784` ⑨ 亲证「root 任务 EXIT=1=预算行 5224 未随 sanction 落行·sanction 5224→5235 已授·落行与消偿归后继」=**根 lint 任务现基线红承登**）· `:9` `docs:check` · `:215-217` `uc003:i18n-locale:prove`（isolated 包装）/`:prove:raw`/`uc003:i18n-locale-ui:prove`（UI 门三旋钮）· `:262` `web:prove` |
| 14 | `apps/web/package.json` / `apps/api/package.json` | `30723cd4` / — | web `:7` lint `--max-warnings 601`+`:8-10` prove/prove:public-copy/prove:uc003-i18n-locale+`:21` `typecheck`；api `:7` lint `--max-warnings 1421`——**lint 三值预算行=web 601/root 5224/api 1421**（root 现值红承登如 #13） |
| 15 | `scripts/ai-docs/public-text-policy.mjs` | `84e17dd3` | `:63-65` **cap 2112→2120**（2026-10-14 协调方 sanction·+8 S4b 先例形）——docs:check 红停线=managed > **2120**；本树基线 **2117**（余 3·本树亲跑 EXIT=0 亲证） |
| 16 | `ai-docs/delivery/execution-master-checklist.md` | `326d3ff7` | `:2724`「Line uc003-i18n nail」段头 · `:2726` 授权链（EXEC `200af27e`→修复 `bfcd3fab`→重审双 PASS→nail merge `68ffcb58`）· `:2729` STILL OPEN ④（**立项出处①·五观察面原文**） |
| 17 | `apps/web/i18n/request.ts` | —（UC003 §0.1-1 同物零漂） | `:10-11` locale **仅取 cookie**（`cookies().get('locale')`·Accept-Language 零读取）·`:12` 按 locale 动态 import messages——locale 契约先例 |
| 18 | `apps/web/lib/resume/ocr-preview-ui.ts` | —（UC003 §0.1-4 增量后） | **四导出函数 locale 参先例**：`:112` `resumeImageRefusedLocally(locale)`/`:117` `resumePreviewFormatRefused(locale)`/`:129` `mapResumeUploadError(status, body, locale)`/`:137` `mapResumeUploadAbort(locale)`（缺省 `'zh'`·rg 实测恰四）——④ 修法 locale 参机制同构源 |

### 0.2 锚勘误如实登记

1. **delete 四消息行号漂移**：UC003 卷/`spec.ts:77-82` 注释所引基线锚 `:138/:141/:142/:145` 为 UPLOAD_MESSAGES 增量位移前基线·本树实测 **`:157/:160/:161/:164`**（Read 逐行亲证）——spec allowlist 值本身已按位移后字面登记（§9.5 P1-1(d) 已勘）·本卷全锚按实测行号钉。
2. **PublicPreviewNav `:10` `首页` 渲染性**：`:22` `links.slice(1)` 起切——`首页` 字面**在场不渲染**（href=/ 品牌链由 `:20` 承担）·登记为源面残留同锁面·迁移时随 links 数组整迁·不单列。
3. **`'岗位'`/`'投递'`/`'笔记'` 三字面全仓唯一性**：rg 全 web 面（app/components/lib）实测 Nav.tsx `:49-51` 唯一在产（recruiter 路由页自身文案不在本面）——迁移无同名撞键。

---

## §1 红事实（五面逐面·全 @`3b32b6c8` 实测）

### 1.1 面① error.tsx 五处 zh 面（en 用户见 zh 错误壳·真实可达）

根错误边界（`:4` 自证任何 RSC/Server Action 抛错落此）五处 zh 字面（`:8/:9/:10/:12/:13`·§0.1-1 逐字）；其中 `:10` 含 `{error.digest}` **运行时插值**。**可达性链**：`/resume` 域 `assertOk`（`actions.ts:43-45` def·调用点 `:59/:61/:75/:137`）对任意非 ok 响应抛 Error → error.tsx 真实可达（如重新解析臂 `:137` API 非 ok）——locale=en 用户（cookie=en·`request.ts:10-11` 契约）此刻见全 zh 错误壳（重试/返回总览操作面不可读）。**DOM 断言不可达定谳**：error 臂需真实 API 故障注入·spec 无 stub 手段（UC003 rev3 P2-④ 同款 Ban 口径）→ en 面由静态门承接·known-residual 登记（§8 裁决5）。零测试锁定零 public-copy 锁定（§0.1-1/:12 双 rg 机证）。

### 1.2 面② Nav.tsx:49-51 招聘方分支三标签（mw_role cookie 条件面）

`:49 岗位`/`:50 投递`/`:51 笔记` 三裸 zh 字面在 `recruiterLinks`（`:48-53`）·同清单 `:52` settings 已走 `t('settings')`·同文件 `:29` 已用 `getTranslations('nav')`——**同构 i18n 面内唯一裸字面区**。渲染条件=`authed && mw_role cookie==='recruiter'`（`:27/:28/:55/:64`）——**条件面**：spec 流程（golden 注册/登录→/resume·零 mw_role cookie）恒走 candidateLinks → 三标签 DOM 不可达·spec allowlist 亦未含此三面（引语锚 rev2 勘误=`ai-docs/delivery/harness/uc003-i18n-REQUEST.md:297(a)` P1-1(a) 登记语「recruiter 三面 `:49-51` 仅 recruiter cookie 渲染·不在本 spec 流程 DOM·不入列」——`spec.ts:29` 实测为 navHardcodedLabels 行（EXEC §0 重 pin 正字·复审 P2·非注语）。`:39-41` 押题/找工作/岗位匹配系 #268 S2a 裁定零 i18n 键面（`:41` 注释）=**⑤ 维持面零触**。零测试锁定（§0.1-2 机证）。

### 1.3 面③ PublicPreviewNav 六面（环境条件面）

四链接 label（`:10-13`）+`aria-label="预览导航"`（`:19`）+品牌名 `知面 Meetwise`（`:20`）六面（§0.1-3）。**环境条件**：唯一消费点 `layout.tsx:42` 三元·条件源 `:32` `process.env.MEETWISE_PUBLIC_PREVIEW`——常规环境（含 spec/e2e 隔离栈）恒渲染 Nav → 六面 DOM 不可达。零测试锁定零 public-copy 锁定（§0.1-3/:12 双证）。Server Component 无 'use client' → `getTranslations` 同构可用（Nav.tsx:29 先例）。

### 1.4 面④ deleteResumeAction 四失败消息 en 化（`<status>` 占位迁 messages）

四处内联 zh message `:157/:160/:161/:164`（§0.1-5 逐字·行号漂移勘误见 §0.2-1）；`:161` 含 `'...（' + res.status + '）...'` **运行时插值**。DOM 消费面唯一=`DeleteResumeButton.tsx:62-64`（useActionState `:14-17` 绑定→`role="alert"` 渲染 `state.message`）·挂载点 `/resume/page.tsx:113`。locale=en 用户删除失败四臂全见 zh——A1/A2 同源残余。**UC003 刀零触条款解禁**：`actions.ts:27-28` 注释「不在本刀迁移面,零触」系上刀作用域声明·本刀即其承接刀·该注释随迁移**同步改写**（§8 裁决6）。**两处断言面必迁**：proof `:134-135` 守卫针（四 needle `must stay untouched` 断言——迁移后必红·**反转/改形为迁移断言**）+spec `:73-82` allowlist `deleteResumeActionLiterals` 四条+注释块（迁移后死条目·**移面**）。spec 流程 happy-path 永不触发 delete（`spec.ts:73-74` 自证）→ DOM 断言不可达·en 面静态承接。

### 1.5 面⑤ '中' LocaleSwitcher 等已具名面维持（不扩）

`LocaleSwitcher.tsx:10` `label="中"`（spec `:72` 承接）+其余 9 具名 allowlist 面（§0.1-10 枚举）——**本刀零触零扩**。`settings/page.tsx:60` `'中文'` option（§9.5 P1-1(b) 勘误已归位）范围外（§3-1）。

### 1.6 must-not-break 面（本刀硬约束锚）

①**S2 key parity 194/194 现绿**（§0.1-8/9 实测）——新 namespace 落地后 parity 同步扩·**迁移前基线若 ≠194/194 → 停（基线漂移重 pin）**；②**web-logic.proof.ts 全文件零改**（UC003 zh 缺省逐字节硬线延续·本刀触面不含 view-model/progress/quiz/diagnosis 任何函数·`git diff --exit-code` 门）——**web-logic 交面（rev2 增补·R4）**：`:933` 读 Nav 源·唯一 Nav 断言 `:940-941` 锁 `href: '/roles', label: '岗位匹配'`（`:41` ⑤ 零触面）——`:49-51` 迁移零扰·`:41` 零动即恒绿；`:1865-1866` zh/en messages 读入用法全 `includes` 子串形（`:1950-1960`）·无键数断言——messages 增 namespace/键=增量安全；③**public-copy 14/14 零断言改**（五面零锁定机证 §0.1-12）；④**S1–S5+G3' 六查现绿**（本树 prove raw EXIT=0 亲跑）；⑤**spec 其余 10 具名面零动**（允许变动=恰 `:73-82` 移面块）；⑥**矩阵 UC-E2E-003 stays partial**（cite 绊线在位·`coveredCount=8` 不翻）；⑦**i18n locale 源管道零改**（cookie-only 契约·Accept-Language wiring 另刀既登）。

---

## §1-修法（四件·①-④ 逐面·⑤ 明文不动·零迁移·零 DDL·零新存储面·模型面零触）

### 修法① error.tsx 五面 en 化（错误壳收口）

- **载体（推荐）**：`messages/{zh,en}.json` 新 namespace **`errorBoundary`**（5 键：title/description/digestLabel/retry/backToDashboard——命名归 §8 裁决2·名定即冻）；zh 值=现字面逐字誊（含 `:9` 半角逗号+半角分号原样——`页面遇到一个错误,可以重试;若反复出现请稍后再来。` 两枚半角标点逐字·rev2 增注·R5）·en 值 **CJK-free**；`:10` 插值形=zh `错误标识:{digest}` / en 同构 ICU 具名插值·渲染面 `t('digestLabel', { digest: error?.digest })`（digest 缺席分支 `:10` 条件渲染零改）。
- **机制**：`'use client'` 组件（`:1`）→ `useTranslations('errorBoundary')`（`NextIntlClientProvider` layout `:40` 零参形态继承全 messages·UC003 §9.1 `ResumeUploadForms` 同形先例）——**locale 读法沿 UC003 先例零新管道**（cookie→request.ts→provider 自动生效·禁改 request.ts）。
- 五处字面零残留由静态门 S6 逐处断言承接（§1-修法④ S6 段）；DOM en 断言不可达（§1.1 定谳）·known-residual 登记。

### 修法② Nav.tsx:49-51 三标签入既有 nav namespace

- `messages/{zh,en}.json` **既有 `nav` namespace +3 键**（候选 `recruiterJobs`/`recruiterTalent`/`recruiterNotes`·15→18）——推荐**扩既有 namespace**（最小 diff·`getTranslations('nav')` `:29` 零改调用面）vs 新 `navRecruiter` namespace（备选·裁决2）；zh 值逐字誊·en CJK-free；`:49-51` 改 `t('recruiterJobs')` 等三键（`t` 已在 `:29` 取得·零新 import）。
- `:39-41` 押题/找工作/岗位匹配 **零触**（⑤·#268 S2a 裁定面·`spec.ts:29` navHardcodedLabels 承接不动）。

### 修法③ PublicPreviewNav 六面入新 namespace

- 新 namespace **`publicPreview`**（6 键：brand/home/features/faq/legal/previewNavAria——命名归裁决2）；zh 值逐字誊（含 `:20` `知面 Meetwise` 品牌双语形原样）·en CJK-free。
- **机制**：Server Component → `async function` + `await getTranslations('publicPreview')`（Nav.tsx 同形·`layout.tsx:42` 调用面零改·async 化后 JSX 零结构变）；`links` 数组改由 `t()` 取值（数组常量改函数体内构造·`:9-14` 结构语义不变）。
- **环境条件面如实申明**：`MEETWISE_PUBLIC_PREVIEW` 环境外的 DOM 恒不渲染 → en 面由 S6 静态断言承接·DOM known-residual 登记（裁决5）·**Ban 为 DOM 断言在 e2e 栈开该 env**（环境条件面扩界）。

### 修法④ deleteResumeAction 四消息迁 messages namespace（`<status>` 占位落 ICU）

- **载体（派单定向·推荐确认）**：`messages/{zh,en}.json` 新 namespace **`resumeDelete`**（4 键：networkError/notFound/notAccepted/invalidShape——命名归裁决2）vs 备选 co-located 双语 const（`UPLOAD_MESSAGES` 同形·**不推荐**——上刀已确立 user-facing 面走 messages 管道方向·插值形 const 载体需手写替换函数背驰 next-intl 管道）；zh 值逐字誊·en CJK-free。
- **`:161` 插值形（派单钉点）**：messages 值 zh `删除请求未受理（{status}），未当作已删除。`/en 同构·action 内 `t('notAccepted', { status: res.status })`——ICU 具名插值（next-intl ^4.13 在位·`apps/web/package.json:42`）·`res.status` 数字插值零字符串拼接。
- **locale 读法沿 UC003 先例**：server action 域=cookie 读法（`resumeUploadLocale` `actions.ts:38-40` 同形·可复用该函数或同构私有件·**禁改 `i18n/request.ts`**）+ 四导出函数 locale 参缺省 'zh' 同构（`ocr-preview-ui.ts:112/:117/:129/:137` 先例）；`getTranslations`（next-intl/server）在 server action 域亦合法·两形择一随裁决1 落定·**locale 源恒=cookie 零新管道**。
- **断言面必迁两件（rev2 justification 分级·R2·同件断言迁移面·非凑绿）**：(a) proof `:134-135` 守卫针**反转**=**门① 硬阻塞（必迁）**——不迁则门① 必红——四 needle `includes` 在场断言改形为**三支**：「① actions.ts 源面四消息零残留 + ② `resumeDelete` 四键在 en/zh 双侧在册且 en 值 CJK-free + **③ zh 值逐字钉**（zh.resumeDelete 四值 === 原四字面逐字·第三值 ICU 形 `删除请求未受理（{status}），未当作已删除。`——源拼接形 `（' + res.status + '）` 唯一变为 `{status}` 占位·其余三值零变）」——**缺 ③ 则「断言迁移非放宽」申明在 zh 内容维度不成立**（rev2 增补·席2-P2①）；`must stay untouched` 语义翻面·`:120` 注释同步改写；(b) spec `:73-82` **移面**=**死条目卫生+一致性义务（非门① 因子·仍强制）**——`deleteResumeActionLiterals` 键+注释块整块移除（迁移后 locale=en 下该四臂 DOM 若现即 en CJK-free·allowlist 死条目·留置即卫生违例）。
- `actions.ts:27-28` 注释「deleteResumeAction 的四处内联文案不在本刀迁移面,零触」**随迁移失效·同步改写**（裁决6）。
- 四臂 DOM 断言不可达（happy-path 不触 delete·`spec.ts:73-74` 自证·无 stub Ban）→ en 面静态承接·known-residual 登记。

### 修法⑤（明文不动条款）

`LocaleSwitcher.tsx:10` `'中'`+其余 9 具名 allowlist 面+`settings/page.tsx:60` `'中文'`+`Nav.tsx:39-41` 三字面+`DeleteResumeButton.tsx` 组件字面+`ResumeUploadForms.tsx` 五处字面——**全部零触**（§3-1）。本刀 Ban 借观察面名义扩清扫面。

### 静态门载体（S 系扩展 vs 沿 UC003 prove 形·裁决3）

- **案A（推荐）同件扩 S6**：`uc-e2e-003-i18n-locale.proof.mjs` 增 **S6** 段（S1–S5+G3' 原值零动）——断言面=四新 namespace 键在双侧在册+en 值 CJK-free（沿 S3/S4 口径）+error.tsx/Nav.tsx/PublicPreviewNav.tsx/actions.ts 五面源锚**逐处断言**（`出错了`/`页面遇到一个错误`/`错误标识:`/`重试</Button>`/`返回总览`/`label: '岗位'`/`label: '投递'`/`label: '笔记'`/`label: '首页'`/`预览导航`/`知面 Meetwise`/产品能力/常见问题/数据边界/四 delete 消息源形——源文件 `includes` **零命中**断言·沿 S4 逐处形·**禁文件级 CJK 扫描**（注释面含 zh·文件级必撞红——UC003 rev3 P2-1 同款防误伤条款））——**防误伤 rationale（rev2·席1+席2 同判 P1）**：S6 针一律取**定界形·禁裸词面**——裸 `重试` 撞 error.tsx `:4` 文件头注释「…+ 重试 + 回家」（注释面不迁移·裸针迁移后 `includes=true` 结构性永红）→ 定界 `重试</Button>`（`:12` 唯一渲染形·`:4` 注释无此形）；裸 `岗位` 撞 Nav.tsx `:41` `label: '岗位匹配'`（⑤ 零触面子串·迁移后 includes=true 同永红）→ 引号定界 `label: '岗位'`（`'` 收口定界·非 `label: '岗位匹配'` 子串·席2 模拟实证：裸 `岗位` includes=true 永红·`label: '岗位'` =false）·`投递`/`笔记` 同形；`label: '首页'`=PublicPreviewNav `:10` 面收口针（在场不渲染面同锁·§0.2-2 随 links 数组整迁·rev2 增补·R5）；+④ 守卫针反转断言（三支·见修法④(a)）；`S2` parity 断言自动扩至新键集（预期 **212/212**=194+3 nav+5 errorBoundary+6 publicPreview+4 resumeDelete·**数值随裁决2 键数冻结·以 node flatten 实测为准**）。
- **案B 新 proof 文件**：`test/uc003-followup-i18n.proof.mjs`+`package.json` 门注册（沿 UC003 prove 形）——多一件受管文件+一门注册行·docs:check 余量消耗大（§2-4 贴边）·不推荐。

---

## §2 验收断言候选（pre-exec 双审核对单基面·门预申明）

1. **门①（静态 prove）**：载体按裁决3——案A `node apps/web/test/uc-e2e-003-i18n-locale.proof.mjs`（raw）**EXIT=0**：S1–S5+G3' 原值绿+S6 新面绿（四 namespace 键双侧在册+en CJK-free+五面源锚零残留逐处断言+守卫针反转断言（三支·含 zh 值逐字钉·修法④(a)））+S2 parity **212/212**（按推荐键数·裁决2 定值后随卷冻结）；isolated 口径 `pnpm uc003:i18n-locale:prove` 与 raw **恒等**（§2-7 双口径条款沿 UC003 先例·静态体不读写 DB）。
2. **门②（web:prove·zh 缺省逐字节线）**：`pnpm web:prove` **EXIT=0** 全臂原值+`git diff --exit-code apps/web/test/web-logic.proof.ts` **过（全文件零改）**+`git diff apps/web/test/public-copy.proof.mjs` **空 diff（全文件零改）**——本刀两 proof 均零断言改（§0.1-12 五面零锁定机证）·唯一例外=裁决3 案A 下 proof 同件 S6/守卫针迁移块（窄 diff 逐 hunk 须恰 §1-修法④ (a) 块+裁决6 注释块·块外 hunk>0=停）。
3. **门③（typecheck）**：`pnpm typecheck`（root）+`pnpm -C apps/web typecheck` **双 EXIT=0**。
4. **门④（docs:check·红停线）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 且 managed ≤ cap 2120**（`public-text-policy.mjs:63-65` sanctioned）——基线 **2117**（本树亲跑 EXIT=0 亲证）+本卷 1 件=**2118 预期**；案B 新 proof 则 2119；**managed > 2120 或 EXIT≠0 → 红停上报**（零自升·cap sanction 权归协调方）。
5. **门⑤（public-copy 回归守护）**：`pnpm -C apps/web prove:public-copy` **EXIT=0 14/14**——零断言改（裁决3 案A 亦零触此文件）·纯回归门。
6. **门⑥（lint 三值）**：web `pnpm -C apps/web lint` **EXIT=0 且 warnings=601 恰等**+api `pnpm -C apps/api lint` **EXIT=0 且 warnings=1421 恰等**+root `pnpm lint` **warnings 实测=5235 恰等**（tokstream-s4b nail sanctioned 值·预算行 5224 现状下 root 任务 EXIT=1 **基线红承登沿例** `checklist:2784` ⑨ 口径——落行裁决4 行使后转 EXIT=0）；**三值任一漂移 → 红停逐文件归因上报**（非本刀归因→协调方 sanction·勿自升）。本刀预期零漂移（messages/tsx 字面迁移非 warning 源·如实以实跑为准）。
7. **门⑦（markers=0+est live=0）**：改动集五类标记词**零命中**（四英数标记词组装式直扫+冲突标记对·词面组装防自指沿 `i6-239-gates.proof.mjs:155-163` 先例）+est live=0 双声明入收据。
8. **附（绊线承登）**：`node scripts/eval-harness-matrix-cite.proof.mjs` 基线红 **EXIT=1（FAIL 38/PASS 303 既登）承登不修不扩**·UC-E2E-003 两子项（harness cite+矩阵 partial）双 PASS 口径维持·矩阵 stays partial。
9. **偏差熔断**：S2 迁移前基线 ≠194/194 → 停（基线漂移重 pin）；新 namespace 键数/名 ≠裁决2 冻结值 → 停（越界）；en 值含 CJK → 停；prove 出现非本卷预申明的新 FAIL → 停（验收红不可修）；spec allowlist 除 `:73-82` 移面块外任一条目变动或新增裸字符串条目 → 停（allowlist 越权）；web-logic/public-copy 零改断言破坏 → 停（越界）；门④ managed>2120 → 红停；门⑥ 三值漂 → 红停归因；cite 门 UC-E2E-003 子项任一转 FAIL → 停（绊线触发）；raw 与 isolated 两口径不一致 → 停（环境口径漂移）。

**EXEC 预期触面清点**：`apps/web/app/error.tsx`+`apps/web/components/Nav.tsx`+`apps/web/components/PublicPreviewNav.tsx`+`apps/web/app/resume/actions.ts`+`apps/web/messages/{en,zh}.json`+`apps/web/test/uc-e2e-003-i18n-locale.proof.mjs`（案A：S6+守卫针迁移+注释同步）+`apps/web/e2e-ui/uc003-i18n-locale.spec.ts`（移面块）+本卷+视裁决4 root `package.json`（预算行一行）+视裁决3 案B 新 proof 件+门注册——**零迁移零 DDL**（`packages/db/migrations/` 零新增零改）。

---

## §3 范围外（边界清单·越界即 FAIL）

1. **⑤ 已具名面十面+伴生维持面零触**：`LocaleSwitcher.tsx:10` '中'（spec `:72`）/`Nav.tsx:39-41` 押题·找工作·岗位匹配（spec `:29`）/resumePageHeader/resumePageUploadCard/resumePagePersonalization/resumePageListChrome/resumePageConsentGate/resumeUploadFormsLiterals/deleteResumeButtonLiterals（`spec.ts:63-70` 含 `DeleteResumeButton` 全组件字面）/resumeStatusLabels/`resumeUploadFormsLiterals`（`ResumeUploadForms.tsx` 五处字面+`:57` 字符串比较耦合）/`settings/page.tsx:60` '中文' option——全部零字节未触。
2. **layout.tsx SEO/元数据 zh 面**：`:12` DESC+`:17-24` title/keywords/OG/Twitter（§0.1-4 范围外注记）——五面清单外·零触。
3. **not-found.tsx/loading.tsx 及其余全仓 zh 面**：全仓清扫=harness `:44` 明文非目标（UC003 既登口径延续）·本刀只锁五面。
4. **checklist `:2729` ④ 同条内其余观察项**：插值型 3 行（'连接面试'/'本题得分'/'本次练习反馈' 整行残留·S5 豁免枚举既登）/`ocr-preview-ui.ts` 客户端共享件携全量 zh.json bundle 观察项/Accept-Language locale 源管道 wiring（另刀既登）——三项零触。
5. **lint 消偿**：warnings 数值下降归后继单独立刀（多 nail 既登口径）——本刀只守门⑥ 三值恰等+裁决4 落行。
6. **矩阵/backlog/harness/checklist/LEDGER SSOT 行翻面**：UC-E2E-003 stays partial·`coveredCount=8` 不变·翻面权归协调方（EXEC 注记 append 除外）。
7. **迁移/DDL/新存储面/env 闸/依赖升级**：零（迁移号预期 **零**）。
8. **i18n locale 源管道**：`i18n/request.ts`/`locale-actions.ts`/middleware locale 面零字节未触（cookie-only 契约·Accept-Language=§3-4）。
9. **既有 e2e spec 与 playwright.config 零触**：7+1 spec 中唯 `uc003-i18n-locale.spec.ts` 允许 `:73-82` 移面 hunk·其余（golden/online-public/recruiting-bound/screenshots/stream-window/uc018-abandon/voice-duplex）与 config 零 diff。

---

## §4 依赖

**零未决硬依赖**：①`next-intl ^4.13.0` 在位·messages 双语管道+`NextIntlClientProvider`（layout `:40` 零参形态）+`getTranslations`/`useTranslations` 全机制现成（Nav/ResumeUploadForms 先例）——无前置刀；②零迁移编号交点；③**环境前置如实申明**：本树 `node_modules` 缺失（worktree 未装·起草席亲测）——门②/③/⑥ 需先 `pnpm install --frozen-lockfile`；门① raw 口径/门④ docs:check/门⑤ public-copy 裸 `node` 可跑（**起草席基线三门亲跑全过**：prove raw EXIT=0·docs:check EXIT=0 2117≤2120·public-copy EXIT=0 14/14）；门⑥ root 值基线红承登见门⑥ 条。下游无硬闸。

---

## §5 Ban 列表 + pins

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT 行翻面（matrix/backlog/harness/eval/checklist/LEDGER 只读引用·翻面权归协调方·EXEC 注记 append 除外）；**Ban 写 covered**（矩阵 UC-E2E-003 stays partial·三面后刀收口≠UC covered≠矩阵翻面）；**Ban ⑤ 面扩扫**（借观察面名义触 §3-1 十具名面+§3-2 SEO 面+§3-3 全仓面=越界）；Ban 无具名登记的 spec allowlist 扩面（增面仅限 EXEC 期 DOM 新证残面逐条具名+裁决登记·移面仅限 `:73-82` 块）；Ban 改 web-logic.proof.ts（全文件零改·门②）；Ban 改 public-copy.proof.mjs（全文件零改·门②）；Ban 改 i18n locale 源管道（`i18n/request.ts` cookie-only 契约·Accept-Language wiring=§3-4 禁）；Ban 为 DOM 断言开 `MEETWISE_PUBLIC_PREVIEW` env 或造 delete 故障 stub（§1.1/§1.3 定谳+§8 裁决5）；Ban 触模型产出语言面与 fake-model 冒充（ai-eval 轨）；Ban 新增迁移/DDL/新存储面/env 闸（§3-7）；Ban 删断言/降断言强度凑绿（守卫针反转=断言迁移非放宽·窄 diff 门② 承接；措辞同步仅限裁决6 三处失效注释）；Ban 顺带升级依赖包；Ban 门④ cap 自升（managed>2120 红停上报·sanction 权归协调方）；Ban 伪造已问/已验来源。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全静态/本地·零模型外呼·零消耗）

---

## §6 est live=0

本刀零模型真实外呼：门①静态 prove（raw 裸 node 或 isolated 包装·静态体不读写 DB）；门②/③/⑤/⑥本地 node/tsx/eslint；门④docs 静态扫描——零 MODEL_API_KEY·零 secrets·零生产操作·零消耗（pins 脚注同源·EXEC 收据逐门登记零外呼口径）。

## §7 markers=0（卫生声明）

起草改动集=**恰 1 .md**（`ai-docs/delivery/harness/uc003-followup-REQUEST.md`）——五类标记词（四英数标记词组装式引用+冲突标记对）改动集直扫**零命中**（起草席自检·命令与回执留 prove·词面组装防自指沿 `i6-239-gates.proof.mjs:155` 先例）。EXEC 预期改动集（§2 触面清点）同扫零命中入收据。

---

## §8 STOP（开工三条款 + 裁决项）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（授权出处=checklist `:2729` STILL OPEN ④ 观察面在册承接·本卷非授权本身）；③EXEC 立项**不得改 §1-修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.2 两处锚勘误如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项（六项·各带推荐）**：

1. **修法④ 载体与插值形**：messages namespace `resumeDelete` 4 键+ICU `{status}` 具名插值（推荐=派单定向·user-facing 面 messages 管道方向延续）vs co-located 双语 const（`UPLOAD_MESSAGES` 同形·插值需手写替换·不推荐）；locale 读法两形（`resumeUploadLocale` 同形 cookie 读法 vs `getTranslations`）择一落定·locale 源恒=cookie。
2. **namespace 命名与键数冻结**：`errorBoundary`(5)/`publicPreview`(6)/`resumeDelete`(4)/`nav`+3（`recruiterJobs`/`recruiterTalent`/`recruiterNotes`·推荐——S2 parity 预期 **212/212**）vs 备选名（errorNav/previewNav/resumeDeleteMsg 等）vs ② 走新 `navRecruiter` namespace——**名定即冻**·S2/S6 断言面随之·EXEC 不得擅改名改键数。
3. **静态门载体**：案A 同件 `uc-e2e-003-i18n-locale.proof.mjs` 扩 **S6**（推荐——六查在册同件·零新门注册·零受管文件增量·docs:check 余量友好）vs 案B 新 proof+script 注册（沿 UC003 prove 形·多一门注册+一受管件·门④ 贴边余量消耗）。
4. **根 lint 预算行落行**：root `--max-warnings` **5224→5235** 随本刀 EXEC 一行 `package.json`（推荐——sanction 已授 `checklist:2784` ⑨「落行与消偿归后继」·落行使根 lint 门转 EXIT=0 可作硬验收线·消偿仍归后继单独立刀）vs 不落行（根 lint 任务 EXIT=1 基线红承登沿例·门⑥ 以三值恰等实测判定）。
5. **三环境面 DOM 断言定谳**：面①（error 臂需故障注入·无 stub Ban）/面②（mw_role cookie spec 流程不设）/面③（`MEETWISE_PUBLIC_PREVIEW` env 条件）——静态承接+known-residual 登记（推荐·沿 UC003 rev3 P2-④ 口径）vs spec 扩环境臂/cookie 臂（不推荐——env 扩界+isolated 栈 live key 缺既登门⑥环境受阻先例）。
6. **措辞同步条款（同件断言迁移面·非凑绿）**：`actions.ts:27-28` 注释（「不在本刀迁移面,零触」失效改写为已迁移口径）+proof `:120` 注释（`keeps its four zh messages untouched` 失效改写）+spec `:73-76` 注释块（随移面整除）——三处随迁移同步·窄 diff 门② 承接·块外零改——**spec 头注 `:14-18` 处置口径（rev2 增补·席2-P2②）**：该头注（Known DOM-unreachable arms 注记块·rev2 亲证今文无 delete 面语）**明文零触**；EXEC 若增 delete 面注记一行（en 面由 S6 承接口径同句申明）·该增行=措辞同步面内·头注其余行零动。

---

## §9 rev2 处置摘要（2026-10-14 · pre-exec 双审双 FAIL 收敛同一 P1·八项全数处置·每处 rg/sed/Read/git 亲证后落笔·STOP=`draft:awaiting_pre_exec_dual` 待复审维持）

**双审输入**：席1 FAIL（R1 P1+R2/R3/R4/R5）+席2 FAIL（P1+P2①②③）——两席同判 P1=案A S6 裸针结构性永红（裸 `重试` 撞 error.tsx `:4` 注释「…+ 重试 + 回家」·裸 `岗位` 撞 Nav.tsx `:41` `label: '岗位匹配'`——迁移后 includes=true 恒红）。处置八项（落点·亲证）：

1. **P1（R1·席1+席2 同判）→ §1-静态门载体案A 针清单改定界形**：`重试`→`重试</Button>`（error.tsx `:4` 注释在场亲证·注释面不迁移）·`岗位/投递/笔记`→`label: '…'` 引号定界（Nav.tsx `:41` `label: '岗位匹配'` 亲证·`label: '岗位'` 非其子串——席2 模拟实证：裸 `岗位` 迁移后 includes=true 永红·`label: '岗位'` =false）+防误伤 rationale 一句（针取定界形·禁裸词面）。
2. **R2 → §1-修法④ 断言面两件 justification 分级**：(a) proof 守卫针反转=**门① 硬阻塞（必迁）**·(b) spec allowlist 移面=**死条目卫生+一致性义务（非门① 因子·仍强制）**。
3. **R3 → §0.1-12 首查收窄+§1.2 引语锚勘误**：宽 alternation 首查在 test/e2e-ui/scripts 有具名面子串命中（rev2 逐处实测登记：`spec.ts:31/:33/:58`·`online-public.spec.ts:10/:26`·`golden.spec.ts:11/:13`·`scripts/ai-docs/check-docs.mjs:92`·`public-text-policy.mjs:123`）→ 改逐面定界形六查 EXIT 空（唯 `知面 Meetwise` 命中 `online-public.spec.ts:26` 首页品牌既有锁·如实登记非本面锁）；引语「recruiter 三面仅 recruiter cookie 渲染…」归属由 `spec.ts:29` 改 `uc003-i18n-REQUEST.md:297(a)`（spec.ts:29 实测=navHardcodedLabels 行·EXEC §0 重 pin 正字·复审 P2·非注语）。
4. **R4 → §1.6-② web-logic 交面一行**：`:933` 读 Nav 源+唯一 Nav 断言 `:940-941` 锁 `href: '/roles', label: '岗位匹配'`（`:41` 零触面·迁移零扰）+`:1865-1866` messages 读入全 `includes` 子串形（`:1950-1960`）·无键数断言=messages 增键增量安全（grep -n 行号亲证）。
5. **R5 → 案A 增 `label: '首页'` 针+修法① `:9` 半角分号注记**：PublicPreviewNav `:10` 面收口（在场不渲染面同锁·§0.2-2）；`:9` 亲证「可以重试;」半角 `;` 在场——注记并入逐字誊（半角逗号+半角分号两枚标点原样）。
6. **席2-P2① → §1-修法④(a) 反转断言补第三支 zh 值逐字钉**：zh.resumeDelete 四值 === 原四字面（四值 verbatim 亲证 `actions.ts:157/:160/:161/:164`·第三值 ICU 形 `删除请求未受理（{status}），未当作已删除。`）——缺此支则「断言迁移非放宽」申明在 zh 内容维度不成立；§2-1 门① 同步注（三支）。
7. **席2-P2② → §8 裁决6 增 spec 头注 `:14-18` 处置口径**：亲证头注（Known DOM-unreachable arms 注记块）今文无 delete 面语 → **明文零触**；EXEC 若增 delete 面注记一行（en 面由 S6 承接口径同句申明）·该增行=措辞同步面内·头注其余行零动。
8. **席2-P2③ → 基线段主线 tip 前移登记**：`619f0a92`（ag04-consumer-fix nail merge·祖先链 `--is-ancestor 3b32b6c8 619f0a92` EXIT=0 亲证）·rev2 落笔时刻本/origin tip 实测 `5bd92ce8`（619f0a92 之上 ag04 SSOT 收官一件）——**EXEC 立项照 §0 头注重 pin 条款覆盖此前移**。

**rev2 自检**：改动集=恰 1 .md（本卷）·docs:check **EXIT=0**（**2118** managed ≤ cap 2120·本树亲跑）·五类标记词+冲突标记对改动集直扫零命中·STOP=`draft:awaiting_pre_exec_dual`（**待复审**）维持·⛔push。

### §9.1 EXEC 执行记录（2026-10-15 · 协调方授权 EXEC·rev2 pre-exec 复审 PASS+窄域复审 agent_9aee3bf6 八项全过）

**开工三条款**：①rev2 pre-exec 复审 PASS（原双审双 FAIL 同 P1 收敛+窄域复审八项全过）落卷；②协调方明示授权 EXEC（EXEC 席派单 brief）；③§1-修法清单与 §5 Ban/pins 零改（照 §0 逐条重 pin·§0.3 落档）。

**并线**：`git fetch`→origin tip 实测 `8ae2a93e`（与本地 tip 同指零漂）→`git merge --no-ff feat/mysql-schema-skeleton`→**merge `ed0cee41`**（全 hex `ed0cee41d1db1f3b4a64095a5aac810354465e46`·双亲 `2e38f4e9`+`8ae2a93e`·ort 策略**零冲突**·13 文件 627+/14-·apps/web 零文件）。

**修法四件落点**（案A S6 定界针形）：①`error.tsx` 五面 en 化（`useTranslations('errorBoundary')` 沿 ResumeUploadForms 客户端先例·`:9` 半角逗号+分号逐字誊 zh·`:10` digest 条件分支保留=`t('digestLabel',{digest:error.digest})`·`:4` 注释零触）；②`Nav.tsx:49-51` 三标签 `t('recruiterJobs'/'recruiterTalent'/'recruiterNotes')`（`:29` 既有 t 零新 import·`:39-41` ⑤ 面零触·`:41` `label: '岗位匹配'` 零动）；③`PublicPreviewNav` 六面 `async`+`getTranslations('publicPreview')`（Nav 先例形·links 数组随迁函数体内构造·`layout.tsx:42` 调用面零改）；④delete 四消息迁 `resumeDelete` namespace（`getTranslations({locale:await resumeUploadLocale(),namespace:'resumeDelete'})` cookie 读法先例·`notAccepted` 走 ICU `{status}` 零拼接·四臂 `t()` 形·`actions.ts:27-28` 注释随迁改写=裁决6）+proof 守卫针反转三支（源零残留+双侧在册 en CJK-free+zh 四值逐字钉含 ICU 形）+`:120` 注释同步+spec `:73-82` 移面整除+spec 头注增 delete 面 S6 承接一句（裁决6 限措辞同步面内）+S6 新增（定界针清单全 false+四 namespace 注册双侧+en CJK-free+S5 插值恰 3 行维持）。messages parity 194→**212/212**（nav 15→18+errorBoundary 5+publicPreview 6+resumeDelete 4·恰裁决2 冻结值）。

**门矩阵七门全绿**：①prove raw EXIT=0（S1–S6+G3' 七查全 PASS·S5 插值恰 3 行·S6 定界针全 false）+isolated `pnpm uc003:i18n-locale:prove` EXIT=0 恒等（双口径一致）；②`pnpm web:prove` EXIT=0 全臂原值+`web-logic.proof.ts`/`public-copy.proof.mjs` `git diff` **双空**（零断言改）；③`turbo typecheck` **8/8** EXIT=0+`pnpm -C apps/web typecheck` EXIT=0；④docs:check **EXIT=0（2122 managed ≤ cap 2128**·协调方更新线）；⑤public-copy **EXIT=0 selected=14/14**；⑥lint 五值恰等 EXIT=0：**web 601/root 5235/api 1421/worker 954/ai-runtime 628**（root 预算行 5235 随并线落行·门⑥ root 任务 EXIT=0 硬绿·裁决4 无需行使）；⑦markers 五类+冲突标记对改动集直扫**零命中**（九文件改动集·词面组装式）+est live=0（全门静态/本地·零模型外呼零消耗）。附：`migrate:prove` EXIT=0（链 **202**·0202 在树）；绊线 cite 承登未触（本刀零涉 eval-harness-matrix-cite 改动）。**spec 步骤⑤ UI 实跑诚实登记**：`uc003:i18n-locale-ui:prove` 环境受阻（isolated 栈 live `MODEL_API_KEY` 缺·本环境未设）→**pending 不虚报**沿 UC003 先例·en 面 S6 静态承接+known-residual 登记（裁决5）。

**pins 十一值零翻**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

**STOP=`executed:awaiting_post_prove_dual`**（EXEC 修法+门矩阵毕·待 post-prove 双审·Ban self-approve·alone≠dual）·⛔push。

---

*UC003-FOLLOWUP REQUEST · 2026-10-14 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`3b32b6c8`（全 hex `3b32b6c8066527b77343f8021d13978e6d25f382`·fetch 后 origin tip 同指亲证）· 分支 `line/uc003-followup` · 工作树 `meetwise-u3f`（git worktree add 本起草席立·建前 worktree list+branch 双查不存在）· 立项出处=checklist `:2729` STILL OPEN ④ 五观察面+`spec.ts:73-82` 席2 P2 在树登记+UC003 REQUEST §9.5 P1-1(d)（不自建 SSOT 行·翻面权归协调方）· 防重双对表过（rg EXIT=1 零同名卷）· 红事实五面机证（error.tsx `:8/:9/:10/:12/:13` 五处+digest 插值·Nav `:49-51` 三标签 mw_role 条件·PublicPreviewNav `:10-13/:19/:20` 六面 env 条件·delete 四消息 `:157/:160/:161/:164`+`<status>`/res.status 插值·'中' LocaleSwitcher `:10` 维持）· 行号漂移勘误 `:138/:141/:142/:145`→`:157/:160/:161/:164` 如实在案· messages 7 namespace 194/194 实测（interview 44/resumeUpload 5 与 brief 恰等）· locale 读法沿 UC003 先例（cookie-only+四导出 locale 参 `:112/:117/:129/:137`）· must-not-break 面（S2 194/194·web-logic/public-copy 零改·S1-S5+G3' 现绿·allowlist 其余 10 面零动·守卫针 `proof:134-135` 必迁断言面钉死）· 修法四件+⑤ 明文不动·零迁移·est live=0·markers=0·pins 十一值照抄零翻·门预申明七门+绊线承登+偏差熔断十款（门④ 2120 红停·门⑥ 三值 601/5235/1421 恰等·root 基线红承登沿例）· §8 六裁决项· 基线三门起草席亲跑全过（prove raw/docs:check 2117≤2120/public-copy 14/14）· **rev2 八项处置落卷**（§9·docs:check EXIT=0 2118≤2120 本树亲跑·STOP=awaiting 复审维持）· ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
