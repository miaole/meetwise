# I263-PREVIEW REQUEST（B 端「内部预览」标注收口小刀 · #263 挂起解除独立收编 · 纯 web 文案+docs 口径·零后端零迁移零行为）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀 docs-only 起草阶段恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + 协调方明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）。

**席位**：I263-PREVIEW 小刀起草席（#263 挂起解除·协调方今裁「解除挂起·独立小刀收编」·评估席残面清册承接·北星 loop）。
**基线**：`feat/mysql-schema-skeleton` @ `d12439d8`（主线 tip·`git log -1` 实测 2026-10-12 17:08:55 +0800·docs(ssot) LEDGER 批5 卷·零码面）。分支 `line/i263-preview`·工作树 `meetwise-i263`（`git worktree add ../meetwise-i263 -b line/i263-preview` 本起草席已立·建前 worktree list + branch 双查实测不存在）。
**立项出处（不自建 SSOT 行——#263 行翻面权归协调方 SSOT 刀）**：①**I5 卷裁决②全文引**：`ai-docs/delivery/harness/i5-caliber-REQUEST.md` §0.3-2（本树在卷）：「**#263 转挂起**：决策面（D4 保留）已闭、动作面两半全外部依赖（#110 收口/#218 I2 交付）。**终裁建议**：不收编·转挂起登记，触发条件=B 端最小闭环（#218）nail 后由协调方重排（半行文案改·任何在飞 web 刀可顺手收或独立微刀）」+ §0.1 #263 行（「决策面已闭·动作面挂起」）+ §3-1（「#263 不收——`login/page.tsx` 零触」）+ §8 裁决项⑨（「#263 挂起登记措辞与触发点（#218 nail 后重排）」）；②**挂起登记**：`product-campaign-LEDGER.md` `:72`（「#263 📄 挂起（I5 裁决②零触·决策面已闭动作面挂 #110/#218）」）+`:211`（批3 22/23「残 1：#263」）+`:316`（I5 口径刀行「#263 挂起零触不计」）+`:330`（残 2 复述）+ `TASK-SOP-v2.md` `:73`（「文案口径（#262+#263+#264+#267）| 分数命名+入口标注+承重话术」位图行）；③**解除三证（本起草席 `git merge-base --is-ancestor` 对 HEAD 亲证·三证全 EXIT=0）**：#218 nail @`505180e4`（「#218 正式解除」·**触发条件兑现**）IS ancestor·#110 收口 @`79aeb04b`（B110 nail·「e2e:isolated 解冻条件已满足」）IS ancestor·#271 全通 @`df12a054`（「#271 全通·P0 四链全通宣告」）IS ancestor——I5 裁决②所挂两外部依赖全部闭结；④**协调方今裁**：「解除挂起·独立小刀收编」——本卷即独立微刀向之起草兑现；⑤**评估席简报**：残面清册（12 处标注跨 web 8 文件+同族口径面 4 面·本卷 §0.2 全数重 pin）。

## §0 现状锚（起草席亲读·base `d12439d8`·file:line 逐条 rg/sed/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（已终局·强制项）

- `git worktree list`：10 树实测（主仓+5e/authz/blite/e2sc/i6/entpay/parity2/ttlwire+本树）——建前**无 i263 树**。
- `git branch -a | grep -iE "i263|263"` EXIT=1——建前**无 line/i263-preview 分支**。
- `rg -n "i263|#263" ai-docs/delivery/harness/` 命中面逐一判定（LEDGER `:72`/`:211`/`:297`/`:316`/`:330` 挂起登记行+I5 卷裁决②/§3-1 让渡面+I6 卷零触注记与断言窗+5E 卷零触登记+I4 卷归槽注记+B110 卷零触面+TASK-SOP-v2 `:73` 位图行）——**全系让渡/零触/挂起登记面·零同名刀卷**。→ **停止条件未触发·可建树落卷**。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`d12439d8`）

| 文件 | blob（全 40 hex） | 关键行锚 |
|---|---|---|
| `apps/web/app/login/page.tsx` | `032bc0ef7e26a79bd98c6f12831ae4642e8ef6dd` | `:27-28` recruiter cookie 码注释（「只进内部预览骨架」）· `:35` tab 后缀 `{t('recruiter')}（内部预览）` · `:38-40` 警示段窗（`:39` 句「招聘方入口是内部预览骨架，不是已上线产品，也不是与求职者对等的第二套产品。」）· `:51-53` I6 已落 D6 年龄声明注释块（`:52` 内含「行级避开上方 :27-28/:38-40 内部预览标注面(#263 域·零重叠)」边界注记）· `:54` `{t('ageDeclaration')}` 声明行（I6 域·本刀零触） |
| `apps/web/components/Nav.tsx` | `3d220bd266a1c9220a65be4ff8038e90ebe14e88` | `:23` 码注释（「recruiter cookie 只切到内部预览骨架」）· `:61` 品牌旁注 `<span>· 内部预览</span>`（isRecruiter 条件渲染） |
| `apps/web/app/recruiter/jobs/page.tsx` | `37341700725ac94c938528648158ca84ae23a802` | `:12` metadata（title「岗位骨架 · 内部预览 · 知面」+description「内部岗位骨架。不是招聘方产品…」）· `:26` h1「岗位骨架 · 内部预览」 |
| `apps/web/app/recruiter/jobs/[id]/page.tsx` | `ee1780e03bbea37a112bc7dbf6875d70dd5d70cf` | `:17` metadata（「岗位投递 · 内部预览 · 知面」）· `:50` 说明段（「内部预览：投递/受邀该岗位的最小流程状态…」） |
| `apps/web/app/recruiter/jobs/[id]/applications/[applicationId]/page.tsx` | `71feadbdf7ef34ead694fc83526f6d2dc38bc456` | `:18` metadata title「申请状态 · 内部预览 · 知面」· `:19` description（「内部预览：查看岗位申请的必要流程状态…」） |
| `apps/web/app/recruiter/talent/page.tsx` | `f16a574f608c86501ea80430fda7016bae662a0a` | `:15` metadata（「投递骨架 · 内部预览 · 知面」）· `:60` h1「投递骨架 · 内部预览」 |
| `apps/web/app/recruiter/how-it-works/page.tsx` | `22c2bd5cd9e9f41c8efa1ea10f3a1458fb6be947` | `:10` metadata title「架构笔记 · 内部预览 · 知面」 |
| `apps/web/components/InviteCandidateDialog.tsx` | `70fbf7edd26e57d49a9855f0051ee6f0ee1a3f9d` | `:30` 对话框说明（「内部预览邀请。填已注册练习账号的邮箱…不得用于自动筛选、排名、拒绝或录用决定。」） |
| `apps/web/messages/zh.json` | `acf35882b896a9a53f97fb57a6535639a683d94d` | `:93` `"footDesc": "预览版。按真实经历练面试。招聘不在本预览范围。"` · `:105` `login.subtitle`（「公开预览不开放账号注册…」） |
| `apps/web/messages/en.json` | `edee5e76c53c0f614626c5d7563a950c49619abf` | `:93` `"footDesc": "Preview. Practice from real experience. Hiring is out of scope for this preview."` · `:105` `login.subtitle`（「Public preview does not open registration…」） |
| `README.md` | `06d1cd87c5aa700726e56f66970b2ab7c7b8a1a0` | `:3` 「**预览版。** 按真实经历练面试：出题、追问、留下点评。招聘不在本预览范围。」 |
| `apps/web/test/public-copy.proof.mjs` | `639edb6a96852856abae387a5855aedfb6e6f883` | **消费面**：`:217` `requireText(recruiterTalent, '内部预览', …)` · `:258` `requireText(recruiterJobs, '内部预览', …)` · `:262` `requireText(loginPage, '内部预览', …)` · `:263` `requireText(loginPage, '不是与求职者对等的第二套产品', …)`（警示句尾·随 :39 联动）· `:98` `requireText(homeZh, '招聘不在本预览范围', …)`（homeZh=`messages/zh.json`·该句唯一出处=footDesc `:93`=F16 排他绑定·随裁决项③） · `:99` `requireText(homeEn, 'Hiring is out of scope', …)`（homeEn=`messages/en.json`·唯一出处=footDesc `:93`=F17 排他绑定·随裁决项③） |

### 0.2 残面清册重 pin + 预期漂移登记（评估席清册 vs 本席实测·结论零翻转·非停止条件）

1. **评估席点名 12 位姿逐一在证（零失配）**：login `:35`✓/`:38-40`✓（句在 `:39`）·Nav `:61`✓（清册已注旧锚 `:48-50` 漂·实测即 `:61`·与审计原始锚 `:48-50` 之漂如实沿登记）·jobs `:12`/`:26`✓·jobs/[id] `:17`/`:50`✓·applications `:18`/`:19`✓·talent `:15`/`:60`✓·how-it-works `:10`✓·InviteCandidateDialog `:30`✓；同族口径面 4 面✓：README `:3`·zh `:93`·en `:93`·en `:105`。
2. **计数口径勘误（如实登记）**：清册「12 处跨 10 文件」系 applications `:18-19` 计 1 位姿口径；本席逐位点名实为 **13 位姿跨 web 8 文件**（login 计 2）+同族 3 文件 4 面；另 `rg -c "内部预览" apps/` 原始命中 **19 处跨 9 文件**（13 位姿+码注释 2 处 `login:27-28`/`Nav:23`+I6 边界注记 `login:52`+消费断言 3 处 `public-copy.proof.mjs:217/:258/:262`——13+2+1+3=19 自洽）——清册点名全数在证·增补面如实入册·零结论翻转。
3. **增补面（清册外·本席重 pin 新增·如实入册）**：①码注释两处 `login/page.tsx:27-28`+`Nav.tsx:23`（同族口径码注释·处置随裁决项①逐面裁）；②I6 边界注记 `login/page.tsx:52`（I6 已 nail 卷面产物·引「:27-28/:38-40 内部预览标注面(#263 域·零重叠)」——F1/F2 若动·该注记行号措辞连带·处置随裁决）；③**公共文案门消费断言三处** `public-copy.proof.mjs:217/:258/:262`+`:263` 句尾断言——**requireText 反向消费（断言文案必须在场）·标注值若裁去·门断言必须同刀同裁更新·否则 prove:public-copy 必红**；另**footDesc 族消费断言两处** `:98`（`requireText(homeZh, '招聘不在本预览范围')`·zh.json 唯一出处=`:93` footDesc=F16）+`:99`（`requireText(homeEn, 'Hiring is out of scope')`·en.json 唯一出处=`:93`=F17）——随裁决项③联动（§1-修法 C5/C6·rev2 补全）；④zh `:105` `login.subtitle`（en `:105` 的中文孪生面·清册仅列 en·双语同键必同裁·裁决项④）；⑤`scripts/i6-239-gates.proof.mjs:109-110`+`receipts/i6-239/`（I6 闸脚本与收据对 #263 面的历史登记面·**已 nail 卷面不改写**·§3 零触·仅登记其存在）。
4. **login 页两次漂移前科（EXEC 立项必须重 pin 该文件）**：前科一=I5 rev2 勘误（tab `:36`→`:35`）；前科二=I6 起草钉 `:33-38`→EXEC 现势 `:27-28`/`:38-40`（I6 卷 `:44` 勘误在案·I6 落面后窗现含 `:51-54` 年龄声明区）。
5. **闸名勘误（同物异名·如实更锚）**：派单简报作「i18n-locale 门」——实测注册名 **`prove:uc003-i18n-locale`**（`apps/web/package.json:9`·运行形 `pnpm -C apps/web prove:uc003-i18n-locale`）。

## §1 红事实（#263 残面机证·全 @`d12439d8` 实测）

### 1.1 标注清册逐处机证（`rg -n "内部预览" apps/` 基线树实跑·19 命中全列）

- **login/page.tsx 4 命中**：`:27-28` 码注释·`:35` tab 后缀「（内部预览）」·`:38-40` 警示段窗（`:39` 句）·`:52` I6 边界注记。
- **Nav.tsx 2 命中**：`:23` 码注释·`:61` 品牌旁注「· 内部预览」（isRecruiter 条件）。
- **recruiter/jobs/page.tsx 2 命中**：`:12` metadata·`:26` h1。
- **recruiter/jobs/[id]/page.tsx 2 命中**：`:17` metadata·`:50` 说明段。
- **recruiter/jobs/[id]/applications/[applicationId]/page.tsx 2 命中**：`:18` title·`:19` description。
- **recruiter/talent/page.tsx 2 命中**：`:15` metadata·`:60` h1。
- **recruiter/how-it-works/page.tsx 1 命中**：`:10` metadata title。
- **InviteCandidateDialog.tsx 1 命中**：`:30` 对话框说明。
- **test/public-copy.proof.mjs 3 命中**：`:217`/`:258`/`:262` requireText 消费断言（+`:263` 警示句尾断言联动面）。

### 1.2 同族口径面（「招聘不在本预览范围」语义族·机证逐条）

`README.md:3`「招聘不在本预览范围」·`zh.json:93` footDesc「招聘不在本预览范围。」·`en.json:93` footDesc「Hiring is out of scope for this preview.」·`en.json:105`+`zh.json:105` login.subtitle「（公开预览）不开放账号注册 / does not open registration」。四（对）面同承「招聘不在本预览范围」口径——#263 审计行原始代码锚即含 `README.md:3`+`zh.json（footDesc）`（更正版 issues-master `:513` 亲读）。

### 1.3 决策面已闭·动作面已解锁（挂起解除三证亲证）

D4 已决保留入口（issues-master `:513` 备注栏 2026-10-09 用户决策更新亲读：「B 端保留，招聘方注册入口不隐藏」）——**入口去留非本刀面**；动作面两半外部依赖全闭：`git merge-base --is-ancestor` 对 HEAD 亲证三证全 EXIT=0——#218 nail @`505180e4`（触发条件兑现）·#110 @`79aeb04b`·#271 @`df12a054`。I5 裁决②挂起条件已全数兑现·协调方今裁解除收编——本刀即「独立微刀」向。

### 1.4 值二义源（修法列向 vs 备注向·逐处亲读）

issues-master `:513` #263 行**修法列**作「B 端最小闭环交付后**更新**『内部预览』标注」（更新向·未定目标值）；**备注栏**作「B 端最小闭环（#218/#271）交付后再**去掉**『内部预览』标注」（去掉向）。两向并存且目标值未定——**EXEC 不得自选值·全部升裁决项（§8 逐面裁·未裁面=零触）**。

### 1.5 「纯 web 文案+docs 口径·零后端零迁移零行为」钉（沿 I5 卷 §3-7 同款）

本刀全部触面=「渲染字面量+metadata+码注释+i18n 值+README 行+同刀消费断言更新」——**零 `apps/api`/`apps/worker`/`packages/db`/contracts 码动·零迁移·零 DDL·零新路由·零新组件结构·零行为语义变化**（isRecruiter 条件渲染逻辑/cookie 门/signup 链/邀请链全部零字节·只动其渲染文案与标注值）。`rg` 机证：19 命中面全在 `apps/web` 文案层与一处 test 消费面·后端全目录零命中。

## §1-修法（逐面修法列·值裁二义全部升裁决项·EXEC 不得自选值）

**总形**：每一面独立可裁「**去掉**」或「**更新为 XX**」（§8 裁决项①逐面裁）——两向均合法源（§1.4）·裁值未落的面**零字节触**。逐面修法列：

| 面 | 现值锚 | 修法两向（值=裁决项） |
|---|---|---|
| F1 | `login/page.tsx:35` tab 后缀「（内部预览）」 | 去=删后缀留 `{t('recruiter')}` / 更=裁后逐字值（裁决项①） |
| F2 | `login/page.tsx:38-40` 警示段（`:39` 句） | 去=整段删（窗内零残留）/ 更=裁后逐字值（裁决项①·`:263` 句尾消费断言随裁联动） |
| F3 | `login/page.tsx:27-28` 码注释 | 去/更随裁决项①（码注释层·非渲染面） |
| F4 | `login/page.tsx:52` I6 边界注记（行号措辞） | F1/F2 落刀后注记行号措辞连带同步（如「标注面已收口 @本刀」或保留原文·裁决项①子项·**I6 注释语义零降级**） |
| F5 | `Nav.tsx:61`「· 内部预览」旁注 | 去=删 span（isRecruiter 条件骨架零动）/ 更=裁后逐字值（裁决项①） |
| F6 | `Nav.tsx:23` 码注释 | 去/更随裁决项① |
| F7 | `recruiter/jobs/page.tsx:12` metadata | 去/更随裁决项①+②（标题值族） |
| F8 | `recruiter/jobs/page.tsx:26` h1 | 去/更随裁决项①+② |
| F9 | `recruiter/jobs/[id]/page.tsx:17` metadata | 同 F7 形（裁决项①+②） |
| F10 | `recruiter/jobs/[id]/page.tsx:50` 说明段 | 去/更随裁决项①（非标题族·说明句） |
| F11 | `applications/[applicationId]/page.tsx:18-19` metadata | 去/更随裁决项①+② |
| F12 | `recruiter/talent/page.tsx:15` metadata | 去/更随裁决项①+② |
| F13 | `recruiter/talent/page.tsx:60` h1 | 去/更随裁决项①+② |
| F14 | `recruiter/how-it-works/page.tsx:10` metadata title | 去/更随裁决项①+② |
| F15 | `InviteCandidateDialog.tsx:30` 说明 | 去/更随裁决项①（**「不得用于自动筛选、排名、拒绝或录用决定」合规承诺语义零降级——更新向不得弱化**） |
| F16/F17 | `zh.json:93`/`en.json:93` footDesc 双语 | 去=删「招聘不在本预览范围」句·保留「预览版/Preview」框架 / 更=裁决项③双语逐字值（**zh/en 必同裁同落**） |
| F18/F19 | `zh.json:105`/`en.json:105` login.subtitle | 去/更随裁决项④（「不开放账号注册」句的处置与双语同步值） |
| F20 | `README.md:3` 口径行 | 去/更随裁决项⑤（README 口径值·「招聘不在本预览范围」句处置） |
| C1-C3 | `public-copy.proof.mjs:217/:258/:262` 消费断言 | **随裁必联动**：对应面裁去→断言删除或改负断言；裁更新→requireText 改裁后值；**未裁面断言原值零动**（裁决项①连带·非独立裁决面） |
| C4 | `public-copy.proof.mjs:263` 句尾断言 | 随 F2 裁值联动（同上） |
| C5 | `public-copy.proof.mjs:98` homeZh 断言「招聘不在本预览范围」 | **随裁决项③联动**：③取「去」向⇒断言同刀同步改（删/改负断言）·③取「更新」向⇒requireText 改裁后值；zh.json 唯一出处=footDesc `:93`（=F16）排他绑定·非独立裁决面 |
| C6 | `public-copy.proof.mjs:99` homeEn 断言「Hiring is out of scope」 | **随裁决项③联动**（同 C5 形）；en.json 唯一出处=footDesc `:93`（=F17）排他绑定·非独立裁决面 |

**零语义面**：全部触面=文案/标注/注释/断言值层；任何「去掉/更新」均**不得**改条件渲染逻辑、路由、cookie 门、i18n 键名（键名零动·只动值——zh/en 键位互洽不破·§2-4）、i18n 消费面（`t('…')` 调用零动·footDesc/subtitle 键若整行删除则须连消费面同裁——**倾向只改值不删键**·删键向若裁须 EXEC 呈报连带面后行）。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3·评估席四条为基·值随 §8 裁决落）

1. **「内部预览」apps 域残留计数静态断言（裁后目标值·主断言形=`apps/` 域）**：`rg -c "内部预览" apps/` 计数=裁决目标值——全去向→`apps/web` 零残留（EXIT=1 形）；部分更新向→未裁面原值在场逐面点名+裁去面零残留。基线原值=19 处跨 9 文件（§1.1·EXEC 立项重 pin）。**全树形不采为主断言**（rev2 口径收敛）——全树含 ai-docs 历史登记 6+ 处+`scripts/ai-docs/check-docs.mjs:175` 必须在场词+receipts 常量非零面·计数非裁值单变量；若裁决需全树形·须附常量基线值对账（历史登记/check-docs 在场词/receipts 常量三项恒在场·基线值落卷后静态对账）。
2. **login 面窗 diff 断言（I6 断言③形反向）**：I6 钉「`:38-40` 区零删改（纯插入·deletions=0）」——本刀反向：`git diff --numstat` 断言删行**只**落在 §1-修法已裁面窗（`:27-28`/`:38-40`/`:35` 等裁决点名窗·全去向删行=窗内行数逐窗对账）·**未裁面零删改**+`:51-54` I6 年龄声明区零字节（删行=0 实证·沿 I6 同款 numstat 形）。
3. **公共文案门+i18n 门回归原值**：`pnpm -C apps/web prove:public-copy` EXIT=0 + `pnpm -C apps/web prove:uc003-i18n-locale` EXIT=0（基线 @`d12439d8` 双门 EXIT=0 本席亲跑在案·EXEC 复跑对账）——C1-C6 断言随裁更新后双门仍绿（i18n 键位互洽含在内）。
4. **zh/en 键位互洽断言**：`zh.json`/`en.json` 键集合零增删（值可变）·footDesc/subtitle 双语同键同裁落位静态断言（若裁「删键」向则双文件同步删+消费面同裁·断言改键集对账形）。
5. markers=0（§7）+ est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **年龄声明面零触**：`login/page.tsx:51-54`（I6 D6-③ 已 nail 落面·`t('ageDeclaration')` 消费链与 `zh/en.json` ageDeclaration 键值全零字节）。
2. **后端/迁移零触**：零 `apps/api`/`apps/worker`/`packages/db`/contracts 码动·零迁移零 DDL（§1.5 钉）。
3. **#218 B 端功能面本身不收编**：本刀只动标注/口径层——B 端最小闭环功能语义（岗位/投递/人才域行为）零触；**#110 注册审核/邀请制域零触**（signup 链/邀请闸语义零字节）。
4. **入口去留零触**：D4 已决保留——不隐藏、不下线、不改招聘方入口可达性（isRecruiter 条件/cookie 门/middleware 零动）。
5. **I6 已 nail 卷面与闸零触**：`scripts/i6-239-gates.proof.mjs`+`receipts/i6-239/**`+`i6-239-REQUEST.md` 零字节（历史登记不改写）。
6. **共享 SSOT 零触**：LEDGER（含 `:72`/`:211` #263 挂起行）/batch-residual-plan/execution-master-checklist/issues-master/TASK-SOP-v2 行与统计只读引用——#263 行「📄 挂起→闭」翻面权归协调方 SSOT 刀。
7. **合规承诺措辞零降级**：F15 既有「不得用于自动筛选、排名、拒绝或录用决定」与各面「不是招聘方产品/看不到面试内容」承诺语义——更新向只可换形不可弱化（沿 I5 卷「弱化或虚化既有产品承诺措辞」Ban 同源）。
8. **e2e 场景面零新增**：既有 `apps/web/e2e-ui/**` 零改（全树 grep 实测 e2e 面零消费「内部预览」字面量·天然零交）。
9. est live=0（§6）。

## §4 依赖

**零未决硬依赖**。①前置全兑现：#110 @`79aeb04b`+#271 @`df12a054`+#218 nail @`505180e4` 三证 is-ancestor HEAD 亲证（§0 立项出处③）——挂起条件闭结·无前置刀；②零迁移编号交点（零迁移）；③双门基线现成：prove:public-copy+prove:uc003-i18n-locale @`d12439d8` EXIT=0 本席亲跑（§2-3 原值锚）；④**并发面**：在飞树逐一判定——ttl-wire（apps/worker 域·零文件交）·parity2/e2sc/blite/entpay（域零交）·authz 5A（I6 卷 §4 登记零文件交在案）——本刀 12 文件触面无在飞刀同文件交登记面；I5/I6 均已 nail 并线（本树在卷）·`login/page.tsx` 现势即 I6 落面后状态（`:51-54` 在证）。下游无硬闸（TASK-SOP-v2 `:73` 位图行系组级标注·组内 #262/#264/#267 已由 I5 收编·本刀收最后残件 #263·组闭）。

## §5 Ban 列表 + pins（沿 I5/I6 卷 §5 同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用·#263 行翻面权归协调方）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（本刀零迁移·迁移冲动=停手上报）；Ban 触其他工作树（meetwise-5e/authz/blite/e2sc/i6/entpay/parity2/ttlwire 零触）；Ban 伪造已问/已验来源；**本刀增补**：Ban 自选文案值（§8 裁决项①-⑤未裁面零字节触——**「去掉」vs「更新为 XX」两向及逐字值全系裁决面·EXEC 不得自裁自落**）；Ban 触年龄声明面（`login/page.tsx:51-54`+ageDeclaration 键值·I6 域·§3-1）；Ban 触入口去留/可达性（D4 已决保留·isRecruiter 条件/cookie 门/middleware 零动·§3-4）；Ban 触注册闸/邀请制域（#110/#271/#218 功能语义·§3-3）；Ban 触 I6 已 nail 闸与收据（`scripts/i6-239-gates.proof.mjs`+`receipts/i6-239/**`·§3-5）；Ban 弱化或虚化既有合规承诺措辞（§3-7·F15 承诺语义零降级）；Ban 删改 i18n 键名（值层操作·删键向须呈报连带面后行·§1-修法零语义面）；Ban 顺手改 B 端功能面（#218 域·本刀只动标注层·§3-3）；Ban 未同步消费断言落刀（C1-C6 随裁必联动·漏联动=prove 必红=FAIL——含 C5/C6 footDesc 族·随裁决项③）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全静态/既有门回归·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：全部断言=静态源断言+既有双门回归（prove:public-copy/prove:uc003-i18n-locale·纯本地 Node 脚本）——零生产操作·零 secrets·零 SMTP·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（起草阶段恰 1 .md·`ai-docs/delivery/harness/i263-preview-REQUEST.md`）五类标记词 grep 本文件零命中（起草席自检·亲跑 EXIT=1·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 I3/I4/I5/I6/ttl-wire 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀起草阶段恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（「解除挂起·独立小刀收编」裁示承接·本卷非授权本身）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.2 漂移/增补/闸名勘误如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项（五组·值裁二义全在此·EXEC 不得自选值·未裁面=零字节触）**：
①**逐面「去掉」vs「更新为 XX」**（issues-master 备注向=去掉 vs 修法列向=更新·**F1-F20 逐面可分别裁**·含 F3/F4/F6 码注释与 I6 边界注记处置·每面裁值=逐字目标值或「去」）——**F2 后果披露（rev2）**：F2 取「去/改写」向 ⇒ `scripts/i6-239-gates.proof.mjs:110` 断言「招聘方入口是内部预览骨架，不是已上线产品」逐字在场**必红**——该门非常设（CI/回归零接线·root `package.json:611` 手动脚本 `i6-gates:prove`·全树仅此一处引用）·EXEC 须同刀随裁更新该断言或申明门退役；②**recruiter/* 族标题值**（F7-F9/F11-F14 metadata title/description 与 h1 逐字值·「· 知面」尾缀与「内部预览」字样处置）；③**footDesc 双语值**（zh `:93`/en `:93` 逐字值·zh/en 必同裁同落）；④**login.subtitle 同步值**（zh `:105`/en `:105`「不开放账号注册 / does not open registration」句处置与双语逐字值）；⑤**README 口径值**（`:3`「招聘不在本预览范围」句处置与逐字值）。
**连带钉（非独立裁决面）**：C1-C6 消费断言值随①-⑤对应裁值同刀同落（§1-修法·其中 C5/C6 随③：③取「去」向⇒断言同步删/改负·③取「更新」向⇒断言随新值）·§2-1 残留计数目标值随①-⑤裁值合成。

---

*I263-PREVIEW REQUEST · 2026-10-12 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`d12439d8`（git log -1 实测 2026-10-12 17:08:55 +0800）· 分支 `line/i263-preview` · 工作树 `meetwise-i263`（git worktree add 本起草席立·建前 worktree list+branch 双查不存在）· 立项出处=I5 卷裁决②全文引（§0.3-2·触发条件=#218 nail 后协调方重排）+挂起登记（LEDGER :72/:211/:316/:330+TASK-SOP-v2 :73）+解除三证 is-ancestor HEAD 亲证（#218 nail @505180e4·#110 @79aeb04b·#271 @df12a054 全 EXIT=0）+协调方今裁「解除挂起·独立小刀收编」+评估席残面清册（不自建 SSOT 行）· 防重双对表过（命中面全系让渡/零触/挂起登记·零同名卷）· 残面清册重 pin：点名 12 位姿零失配+同族 4 面✓·增补 5 类（码注释 2+I6 边界注记+公共文案门消费断言 6 含 :98/:99+zh:105 孪生）·原始命中 19 处跨 9 文件·login 两次漂移前科在案（I5 rev2 tab :36→:35·I6 窗 :33-38→:38-40）·闸名勘误 prove:uc003-i18n-locale · 红事实=标注清册逐处机证+值二义源亲读（修法列「更新」vs 备注「去掉」）+纯 web 文案零后端零迁移零行为钉 · §1-修法 F1-F20 逐面两向+C1-C6 消费断言随裁联动（C5/C6 随③）·值裁二义全部升裁决项·EXEC 不得自选值·未裁面零触 · 断言候选五条（残留计数裁后值+login 面窗 I6 形反向+双门回归原值+zh/en 键位互洽+双声明）· 范围外九条（年龄声明/I6 卷面/入口去留/#218 功能面/SSOT 全零触）· 零未决硬依赖·在飞树零文件交 · Ban+pins 十一值照抄 · est live=0 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

*rev2 · 2026-10-12 · 修正席（docs-only 窄面修订·恰 1 .md 零码动·结论零变·§8-③ 冻结条款（zh/en 必同裁同落）维持原文零动·STOP draft:awaiting_pre_exec_dual 维持·markers=0（修订后复跑 EXIT=1）·pins 十一值零翻·⛔push）——**双审席1 FAIL 处置摘要（1 blocking+3 errata·四处落点）**：①blocking「C 消费断言补全」——§1-修法 C 清册补 C5/C6 两行（`public-copy.proof.mjs:98` requireText homeZh「招聘不在本预览范围」·zh.json 唯一出处=footDesc `:93`=F16 排他绑定·`rg` 单命中亲证；`:99` homeEn「Hiring is out of scope」·en.json `:93`=F17 排他绑定·均随裁决项③联动——③「去」⇒断言同步删/改负·③「更新」⇒断言随新值）+Ban「未同步消费断言落刀」穷举集改 C1-C6+§0.1 消费面/§0.2-3③/§2-3/§8 连带钉/尾注同集合同步；②erratum 算术——§0.2-2「码注释 3 处」勘为 2 处（19=13+2+1+3 自洽·尾注「码注释 2」本即在证）；③erratum 披露——§8 裁决项① F2 处补后果披露一句（F2 取「去/改写」⇒ `i6-239-gates.proof.mjs:110` 「招聘方入口是内部预览骨架，不是已上线产品」逐字在场断言必红·该门非常设=CI/回归零接线+root `package.json:611` 手动脚本 `i6-gates:prove` 全树唯一引用·EXEC 须同刀随裁更新该断言或申明门退役）；④erratum 口径——§2-1「（或全树）」收敛·apps/ 形为主断言（全树含 ai-docs 历史登记 6+ 处+`scripts/ai-docs/check-docs.mjs:175` 必须在场词+receipts 常量非零面·计数非裁值单变量·若需全树形须附常量基线值对账）。docs:check 修订前后恒 EXIT=0。*
