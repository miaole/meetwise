# UC003-I18N REQUEST（UC-E2E-003 i18n 收口刀 · 错误码 en 产品映射 + 热库去硬编码 zh + Playwright locale=en DOM spec · 三面收口 · 零迁移 · 单日级）

**Status**: **`closed`**（2026-10-15 卷主翻面·协调方授权批量滞后卷 Status 对账翻面·沿 ag37/ag-cost5/ha-6 状态行翻面先例·一行依据=checklist「Line uc003-i18n nail」段 :2724 已载 post 双审双 FAIL→修复 bfcd3fab→重审双 PASS+nail merge @`68ffcb58`（对 HEAD `git merge-base --is-ancestor` 亲证 EXIT=0）——原 `executed:awaiting_post_prove_dual` 系滞后登记 · est live=0 · Ban self-approve · alone≠dual · ⛔push）

**席位**：UC-E2E-003 i18n 收口刀 REQUEST 起草席（E2E 矩阵侦察席定谳：UC-E2E-003 行 NEG=**gap** / FAULT=**blind** / BOUND=**partial**（key parity）/ ADV=**blind**；残余三面=错误码 en 产品映射 + 硬编码 zh UI 去除 + Playwright locale=en DOM spec；NEG 面用错误码负路径断言收；无 Key 无 Docker 重依赖（本地 Chromium）·单日级 · 北星 loop）。

**基线**：`feat/mysql-schema-skeleton` @ `ea6cd6a1`（全 hex `ea6cd6a141812221ba26d1b19bf531a16513d351`·主线 tip·`git pull --ff-only` 实测 **Already up to date**·docs(ssot) BATCH2-C1 nail 收官随翻卷）。分支 `line/uc003-i18n`·工作树 `meetwise-uc003`（`git worktree add ../meetwise-uc003 -b line/uc003-i18n ea6cd6a1` 本起草席已立·建前 `git worktree list` + `git branch --list` 双查实测不存在）。

**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①`ai-docs/delivery/e2e-requirement-coverage-matrix.md` §3 **P1-6** `:272` 逐字（「**静态 prove 已挂** `pnpm uc003:i18n-locale:prove` + harness（S1–S3 管道/键对齐/en CJK allowlist；G-GAP 错误码 en map + 硬编码 zh UI + DOM e2e-ui 缺席）；**仍缺 Playwright locale=en DOM + 错误码 en 产品映射**」）+ §1.0.1 行 `:114`（NEG=gap/FAULT=blind/BOUND=partial(key parity)/ADV=blind）+ §1.1 `:172`（挂载行·G-GAP 三钉在册）；②`ai-docs/delivery/e2e-covered-path-backlog.md:32`（「003 | 错误码 en 映射产品接线；热库去硬编码 zh；Playwright locale=en DOM」三残余逐字在册）；③`ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md:33-35`（G-GAP-1/2/3 三钉）+ `receipts/archive/2026-09-batch23/eval/uc-e2e-003-i18n-locale.eval.md:53`（BLOCKED 清单逐字：「e2e-ui locale=en DOM 扫描、错误码 en map 产品接线、view-model 等硬编码 zh 迁入 i18n、模型语言跟随 locale（ai-eval）」——前三项即本刀·第四项归 ai-eval 轨零触）。

---

## §0 现状锚（起草席亲读·base `ea6cd6a1`·file:line 逐条 rg/sed/Read/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（已终局·强制项）

- `git worktree list`：21 树实测（主仓 + 5cq/5eb/a34/ag38/ag39/ag39q/apid/b2c1/b5m/bgp/ciw2/cost4/cost5/g7k/g7w/line-entpay/lintc/obsr/red5/s4b）——起草前**无 uc003 树**（本席建树后恰一本树在册）。
- `git branch --list`：建前无 `line/uc003-i18n` 分支（本席 `worktree add -b` 创建·建后恰一）。
- `rg -l "uc003-i18n-REQUEST|UC003-I18N REQUEST" ai-docs/`：**EXIT=1 零命中**（建卷前实测）——**零同名卷**。→ 停止条件未触发·可建树落卷。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`ea6cd6a1`）

| # | 文件 | blob（前 8 hex） | 关键行锚 |
|---|---|---|---|
| 1 | `apps/web/i18n/request.ts` | `df8e06c1`（全 `df8e06c12c3982cf5bee4bfcf8eda03efd3f4812`·全 13 行） | `:4` `LOCALES = ['zh','en']` · `:6` `DEFAULT_LOCALE: Locale = 'zh'` · `:10-11` **locale 仅取自 cookie**（`cookies().get('locale')`·非 cookie 值回落 DEFAULT_LOCALE·**Accept-Language 零读取**）· `:12` 按 locale 动态 import `../messages/${locale}.json` |
| 2 | `apps/web/app/locale-actions.ts` | `cae79b66`（全 10 行） | `:6-10` `setLocaleAction`（`formData.get('locale') === 'en' ? 'en' : 'zh'`·cookie `path:'/' maxAge:365d sameSite:'lax'`·`revalidatePath('/', 'layout')`） |
| 3 | `apps/web/components/LocaleSwitchButton.tsx` | `ef1e69b6`（全 45 行） | `:28-45` 表单提交式切换钮（hidden input `locale`·'zh'/'en' 二值） |
| 4 | `apps/web/lib/resume/ocr-preview-ui.ts` | `ca8e2000`（全 `ca8e2000fff75586f75a583be4e8fded9032baa9`·全 102 行） | `:17-38` `ERROR_MESSAGES: Record<string, string>` **恰 20 键全 zh**（image_ocr_unavailable/ocr_failed/ocr_no_content/ocr_duplicate/ocr_binding_missing/ocr_binding_invalid/consent_required/insufficient_entitlement/extracted_too_short/ocr_preview_format/extracted_too_long/file_too_large/empty_file/unsupported_file_format/parse_failed/too_many_requests/server_busy/public_preview_read_only/upload_timeout/upload_failed）· `:58-62` `resumeFileHelpText` zh 字面 · `:64-68` `resumeUploadCardDescription` zh 字面 · `:70-72` `resumeOcrPreviewBanner` zh 字面 · `:75` `resumeImageRefusedLocally` · `:79` `resumePreviewFormatRefused` · `:89-93` `mapResumeUploadError(status, body)`（**无 locale 参**·`:90` 413 分支·`:92` `ERROR_MESSAGES[error] ?? ERROR_MESSAGES.upload_failed`）· `:97` `mapResumeUploadAbort`（rev3 P2-⑤ 读法注记：`:75/:79/:97` 均为**函数体 return 行**·签名行在 `:74/:78/:96`·三函数 message 均引自 `ERROR_MESSAGES` 成员·非内联字面）· `:36` `upload_timeout` 值含「不会编造文字」（E11 `:282` 针留守存活面·rev3 P2-4 亲证） |
| 5 | `apps/web/lib/view-model.ts` | `5953fb3d`（全 `5953fb3d64e83204709fb3f3354dbbd5f7f15427`·全 145 行） | `:9-13` `signalConcludePracticeCopy`（zh 字面 2 分支）· `:29` `interviewDisplay(v)`（zh 文案 return 面约 30 行：连接过多/服务恢复中/正在切换连接/网络中断/练习连接已停止等）· `:50` 注释自证「游标与绝对上限（缺省）保持原文案逐字（**既有断言锚定**）」（rev2 勘误：rev1 误书 `:34`·sed 亲证 `:50`）· 起草席复刻 prove 扫描器实测 **CJK 字符串字面量行=35**（rev2 复刻亲证：其中 `${}` 插值型恰 **3 行** `:94/:109/:117`·静态 32 行） |
| 6 | `apps/web/lib/stream/interview-state.ts` | `3a4f198f`（全 `3a4f198f8565fdd926694251ed819947655d1eab`·全 200 行） | `:13` `ALL_PHASES` 9 值 · `:23` `StreamStopReason` 5 值 · `:77` `initialView`（rev2 勘误：rev1 误书 `:9/:22/:61`·rg -n 亲证）· CJK 命中 7 行**全为行尾注释**（`:130/:131/:137/:155-157/:159`·**零 zh 字符串字面量文案**）——纯扫描器尾注假阳性面 |
| 7 | `apps/web/lib/interview/progress.ts` | `0af64d21`（全 46 行） | `:18` `interviewProgressLabel` 回落 `'进度待同步'` zh 字面（**hot 三件之外**·本刀范围外·§3-1） |
| 8 | `apps/web/messages/en.json` | `f664a91c` | 5 namespace：nav/home/login/common/features · flatten 叶 **145**（起草席 python 实测·rev2 node 复测 145 同值）· S3 allowlist 面=`home.footBrand`+`common.zh`（proof `:18`） |
| 9 | `apps/web/messages/zh.json` | `d9195a0a` | 同 5 namespace · flatten 叶 **145**（与 en parity·S2 现绿前提·rev2 复测同值） |
| 10 | `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` | `776c0465`（全 `776c04650910b00ee2bb8ac5ab21c827f4d21152`·全 173 行） | `:18` `EN_CJK_ALLOW = Set(['home.footBrand','common.zh'])` · `:42-52` S1-i18n-plumbing · `:54-62` S2-message-key-parity · `:64-74` S3-en-json-no-unexpected-cjk · `:76-100` **G-GAP-error-code-en-map**（`:85-89` zhOnly 全量且无 locale 分支→pin `GAP-UC003-ERROR-CODE-EN-MAP`；`:95-97` else 分支措辞 `unexpected — re-check product`；`:99` 断言 `mapResumeUploadError` 签名无 locale 参）· `:102-126` **G-GAP-hardcoded-zh-ui**（`:103-107` hot 三件清单=view-model/ocr-preview-ui/interview-state·`:121` `assert.ok(cjkLines > 0, 'expected known hard-coded zh UI surfaces (inventory honesty)')`——**现值断言为红事实在场**）· `:128-145` **G-GAP-dom-e2e-ui**（`:137-141` specs 无 locale 命中→pin `GAP-UC003-DOM-E2E-UI`）· `:163-168` 尾部 NOTE 块（`no GAP pins emitted — unexpected for current tree`）· `:170` `failed===0 → exit 0`（EXIT=0=诚实钉≠产品闭环） |
| 11 | `apps/web/test/web-logic.proof.ts` | `7b53aeaa`（全 `7b53aeaa7d8565948fa08b217aec6d20d1de9898`） | `:12` import interviewDisplay/signalConcludePracticeCopy · `:162` 断言 `interviewProgressLabel(...) === '进度待同步'`（**import 自 `lib/interview/progress.ts`——progress 锚·非 view-model 面**·rev2 归因改述）· `:480` 断言 reconnecting 臂 `d.message.includes('重连')`（**`interviewDisplay` 真锚=view-model 面 web-logic 唯一 zh 逐字锚**）· `:591` quiz 断线臂同款 `includes('重连')`（**`lib/stream/quiz-state.ts` `quizDisplay` 锚·非 view-model.ts**·rev2 归因改述）· `:660` diagnosis 断线臂同款 `includes('重连')`（**`lib/stream/diagnosis-state.ts` `diagnosisDisplay` 锚**·rev2 归因补全）——**zh 缺省输出逐字节不变硬约束的机证锚**（view-model 真锚 `:480`·其余三锚属热三件外零触面·连带零改绿） |
| 12 | `apps/web/app/resume/actions.ts` | `3a94ca9e` | `:14` import `mapResumeUploadError` · `:73` **全仓唯一生产调用点** `return mapResumeUploadError(res.status, body);`（rg 实测：components/page 侧零调用）· rev2 增锚+rev3 P2-1 补全：同 action 文件**内联 zh user-facing message 九处**——上传面五处 `:78/:88/:95/:96/:113` + `deleteResumeAction` 四处 `:138/:141/:142/:145`（逐字亲证·`DeleteResumeButton.tsx:15` useActionState 绑定消费·见 §1.1/修法①·本刀迁移面=上传面五处·delete 四处零触） |
| 13 | `apps/web/app/resume/ResumeUploadForms.tsx` | `24c25b9f` | `:1` `'use client'` · `:8` import resumeFileAccept/resumeFileHelpText/resumeOcrPreviewBanner · `:55` 错误 p（`id="resume-upload-error"`·`role="alert"`）· `:64-66` banner p（`role="note"`）`{resumeOcrPreviewBanner()}` · `:73` help span `{resumeFileHelpText(ocrPreview)}`（rev2 元素级三锚补登·spec 步骤②用）· 组件本地 zh 字面五处 `:15/:54+:68/:76/:78/:83`（§3-1 allowlist 残留） |
| 14 | `apps/web/e2e-ui/`（目录） | —（7 spec 亲列） | `golden.spec.ts` / `online-public.spec.ts` / `recruiting-bound.spec.ts` / `screenshots.spec.ts` / `stream-window.spec.ts` / `uc018-abandon.spec.ts` / `voice-duplex.spec.ts` 恰 **7** 件；`rg -ln "locale|i18n" apps/web/e2e-ui/` **EXIT=1 零命中**——locale=en DOM spec **缺席机证**；`uc018-abandon.spec.ts:11` Grep anchor 形制（`UC018-UI-abandon`）·`:70` test 名携锚 |
| 15 | `apps/web/playwright.config.ts` | `321b80e0` | `testDir: './e2e-ui'` · projects `chromium`+`mobile` · `workers: 1` · `retries: 0` · **`use` 块无 locale 配置** · baseURL `http://127.0.0.1:3100` |
| 16 | `apps/web/package.json` | `9e060d12` | `:8` `"prove": "tsx test/web-logic.proof.ts"` · `:9` prove:public-copy · `:10` `"prove:uc003-i18n-locale": "node test/uc-e2e-003-i18n-locale.proof.mjs"` · `:21` `"typecheck": "tsc --noEmit"`（rev2 勘误：rev1 误书 `:29`·rg 亲证）· `:42` `"next-intl": "^4.13.0"` · devDeps `@playwright/test ^1.61.1` · `tsconfig.json` include=`app/components/lib` **exclude `test`·e2e-ui 不在任何 tsconfig include 面**（`6ef17061` 亲证）；根 `tsconfig.e2e.json`（`339c2a45`）include=`e2e/**/*` 恰——e2e-ui spec **现无 typecheck 载体** |
| 17 | `package.json`（仓根） | `bc950902` | `:141` `uc018:ui:prove` = `E2E_UI_GREP=UC018-UI-abandon E2E_UI_PROJECT=chromium E2E_UI_SKIP_WORKER=1 node scripts/run-e2e-isolated.mjs e2e:ui`（**UI 单 spec 门注册先例**）· `:215-216` `uc003:i18n-locale:prove` = `node scripts/run-e2e-isolated.mjs uc003:i18n-locale:prove:raw` → `:prove:raw` = `pnpm -C apps/web prove:uc003-i18n-locale`（**rev2 亲证补全：外层经 run-e2e-isolated 包装=隔离栈依赖**）· `:259` `web:prove` = `pnpm -C apps/web prove` · `:339/:341` `e2e:ui` / `e2e:ui:isolated` |
| 18 | `scripts/run-e2e-ui.mjs` | `84f9cd2d` | `:46` `if (env.E2E_ISOLATED !== '1') throw ...('e2e_ui_isolation_required')`（**e2e:ui 强制隔离栈**）· `:141-144` `E2E_UI_SKIP_WORKER` · `:222-227` `E2E_UI_GREP`/`E2E_UI_PROJECT` 透传 playwright `--grep`/`--project` |
| 19 | `scripts/eval-harness-matrix-cite.proof.mjs` | `36cefcba` | `:163` `rowIds: ['UC-E2E-003']` · `:735-738` **绊线**：matrix UC-E2E-003 匹配 `**covered**` → fail；匹配 `**partial**` → pass——**矩阵翻 covered 即此门红**；rev2 基线实测：门整体 **EXIT=1**（FAIL 38/PASS 303·缺文件/pins 面·UC-E2E-003 两子项 `:139`/`:333` 双 PASS——§1.4① 如实登记） |
| 20 | `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `0cf6ae18` | `:114` §1.0.1 行（NEG=gap/FAULT=blind/BOUND=partial(key parity)/ADV=blind）· `:172` §1.1 挂载行 · `:272` §3 P1-6（立项出处①） |
| 21 | `ai-docs/delivery/e2e-covered-path-backlog.md` | `05a76401` | `:32` 「003 | 错误码 en 映射产品接线；热库去硬编码 zh；Playwright locale=en DOM」（立项出处②） |
| 22 | `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3` | `:101-113` UC-E2E-003 场景原文：`:104` 角色求职者(locale=en) · `:105` 触发「以 `Accept-Language: en` / 用户设置 en」 · `:106` 主流程（UI 全 en/错误码按 locale 映射/report 页 en 渲染） · `:107` 验收 A1 关键页面无中文残留（**针对 UI 框架文案，不针对模型产出**）+ A2 后端校验错误 en 文案 · `:108` 测试层纠偏（模型语言归 ai-eval） · `:112` TC-E2E-003-ui-en |
| 23 | `ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md` | `18b43a93` | `:33-35` G-GAP-1/2/3 三钉表 · `:44` 非目标「全页面 hard-coded zh 清零……全仓清扫属后续」· `:52` `pnpm uc003:i18n-locale:prove` 期望 EXIT=0（isolated 包装·静态体不读写 DB） |
| 24 | `receipts/archive/2026-09-batch23/eval/uc-e2e-003-i18n-locale.eval.md` | `16e36de9` | `:26` prove 0/0 台账（`prove:raw` 同日先例） · `:49-51` GAP 三钉登记 · `:53` BLOCKED 清单（前三项=本刀） · `:69` 「是否列为下一刀产品 P1」双问——本卷即其承接 |

### 0.2 锚勘误如实登记（登记面与本席实测之差·结论零变）

1. **eval 卷实际路径**：矩阵 `:172` 引用形 `eval/uc-e2e-003-i18n-locale.eval.md`——实测真实路径 `receipts/archive/2026-09-batch23/eval/uc-e2e-003-i18n-locale.eval.md`（blob `16e36de9`）。同物异径·本卷全锚按实测路径钉。
2. **interview-state CJK 计数**：粗扫 rg 面 8 行 vs 复刻 prove 扫描器 7 行——差 1 行系行首空行/注释起始位差；以扫描器口径 **7 行全为行尾注释假阳性**（§0.1-6）为准。
3. **hot 三件 CJK 字符串字面量行合计**：view-model **35** + ocr-preview-ui **25** + interview-state **7** = **67**（起草席复刻 prove 扫描器逐文件实测·EXEC 以扩面 prove 实跑为准·偏差熔断见 §2-7）。
4. **scenario 触发措辞 vs 产品契约**：`e2e-scenarios.md:105` 触发含 `Accept-Language: en`；产品现形 `i18n/request.ts:10-11` **仅读 locale cookie**（Accept-Language 零读取）——非本刀扩权面·处置见 §8 裁决⑤。
5. **view-model 自证注释行号（rev2 勘误）**：§0.1-5 rev1 误书 `:34`——sed 亲证实为 **`:50`**（`:34` 为 SSE-RESILIENCE 注释行）。结论零变。
6. **interview-state 三锚行号（rev2 勘误）**：§0.1-6 rev1 误书 `:9/:22/:61`——rg -n 亲证实为 **`:13`**（ALL_PHASES）/**`:23`**（StreamStopReason）/**`:77`**（initialView）。结论零变。
7. **web pkg typecheck 行号（rev2 勘误）**：§0.1-16 rev1 误书 `:29`——rg 亲证实为 **`:21`**。结论零变。
8. **web-logic 三锚归因（rev2 改述+补全）**：`:162` 实锚 `interviewProgressLabel`（import 自 `lib/interview/progress.ts:18`·热三件外）；`:591` 实锚 `quizDisplay`（`lib/stream/quiz-state.ts`）；`:660` `diagnosisDisplay`（`lib/stream/diagnosis-state.ts`）同款断线臂锚 rev2 **补全**入册——view-model 面真锚唯 **`:480`**（sed 逐行亲证原文）。硬约束面（web-logic 全零改绿）不变·归因如实的正名。

---

## §1 红事实（三残余机证·全 @`ea6cd6a1` 实测）

### 1.1 残余①错误码 zh-only map（A2 未闭环）

`ERROR_MESSAGES`（`ocr-preview-ui.ts:17-38`）**恰 20 键·值全 zh·零 en 映射·零 locale 分支**；`mapResumeUploadError(status, body)`（`:89-93`）无 locale 参；全仓唯一生产调用点 `resume/actions.ts:73`（server action·可读 cookie 零障碍）。**rev2 增补**：同 action 文件伴生**内联 zh user-facing message 五处**——`uploadResumeAction` `:78`（`'简历正文至少需要 20 个字符。'`）/:88（`'上传暂未完成，请检查网络后重试；不会重复扣费。'`）·`uploadResumeFileAction` `:95`（`'请选择要上传的文件。'`）/:96（`'文件超过 8MB 上限。'`）/:113（`'文件上传暂未完成，请检查文件和网络后重试。不会编造识别结果。'`）——逐字亲证·其中 `:95/:96` 预检返回于 `readUploadFailure`/map 之前（§1-修法③ 步骤③ 机理·rev3 改形）。**rev3 增补（P2-1）**：`deleteResumeAction` 另有内联 zh user-facing message 四处——`:138`（`'网络错误，请稍后重试；简历未被删除。'`）/:141（`'找不到这份简历，或它已被删除。'`）/:142（`'删除请求未受理（'+status+'），未当作已删除。'`）/:145（`'删除受理形状不合法，未当作已删除。'`）——逐字亲证·`DeleteResumeButton.tsx:15` useActionState 绑定消费（message 于其 `:62-63` `role="alert"` 渲染）·内联面**实为九处非五处**；本刀迁移面仍=**上传面五处**·delete 四处零触（越界面）·S4「内联面 en 文案零 CJK」作用域钉死=上传面五处逐处（禁 actions.ts 文件级扫描——文件级扫描必撞 delete 四处现存 zh 红·防误伤条款）。客户端侧 zh 文案纯函数同文件伴生（`:58-72` help text/card description/banner 三件·`ResumeUploadForms.tsx:65/:73` 客户端直调）。prove G-GAP-1（proof `:76-100`）据实 pin `GAP-UC003-ERROR-CODE-EN-MAP`。→ locale=en 用户触发上传校验错误仍见 zh 文案·A2（scenario `:107`）未闭环。

### 1.2 残余②热库硬编码 zh（A1 结构面）

hot 三件（G-GAP-2 钉面 proof `:103-107`）CJK 字符串字面量行 **67**（view-model 35 真文案为主 / ocr-preview-ui 25 全真文案 / interview-state 7 全行尾注释假阳性）——locale=en 时此等文案绕过 `messages/*.json` 管道恒 zh。`view-model.ts:50` 自证文案被既有断言逐字锚定（web-logic `:480` interviewDisplay 真锚；`:162/:591/:660` 实锚 progress/quiz/diagnosis——热三件外零触面·rev2 归因改述+补全）。**全仓面**：`rg -l "[\u4e00-\u9fff]" apps/web/{lib,app,components,hooks}` 实测 **152 文件**（含注释面）——全仓清零=harness `:44` 明文非目标·backlog `:32` 口径=「**热库**去硬编码 zh」·本刀只锁 hot 三件。→ prove G-GAP-2 pin `GAP-UC003-HARDCODED-ZH-UI`。

### 1.3 残余③Playwright locale=en DOM spec 缺席（G-GAP-3）

`apps/web/e2e-ui/` 恰 7 spec·**零 locale/i18n 断言**（rg EXIT=1 机证）；`playwright.config.ts` `use` 块无 locale 配置；e2e:ui 强制隔离栈（`run-e2e-ui.mjs:46`）。UI 门注册先例在位（`package.json:141` uc018:ui:prove = GREP+PROJECT+SKIP_WORKER 三旋钮）。→ prove G-GAP-3 pin `GAP-UC003-DOM-E2E-UI`。

### 1.4 绊线与既存锚（本刀 must-not-break 面）

①矩阵绊线：`scripts/eval-harness-matrix-cite.proof.mjs:735-738`——UC-E2E-003 写 covered 即红·**本刀后矩阵必须仍 partial**（三面收口后残留仍多：全仓 zh 面/模型语言面/full.e2e 面）；**cite 门整体基线红如实登记（rev2 亲测）**：本树实跑 **EXIT=1**（FAIL **38**/PASS **303**·全为既存 harness/eval 缺文件与 pins 缺失面：uc-e2e-018/015/017/privacy-erasure-http-503-pin 等·与 UC-E2E-003 无交连——其两子项 `:139` harness cite + `:333` matrix partial **双 PASS**）——**非本刀引入·本刀不修不扩**·验收口径=UC-E2E-003 子项维持 PASS（§2-7 熔断）；②zh 缺省输出逐字节锚：web-logic `:480`（`interviewDisplay` 断线臂 `includes('重连')`·**view-model 真锚**）+ `:162`/`:591`/`:660`（实锚 progress.ts/quiz-state.ts/diagnosis-state.ts——热三件外零触连带面·rev2 归因改述+补全）+ public-copy `:288-290`（`resumeImageRefusedLocally`/`isPreviewOcrImage`/`mapResumeUploadError` 源名断言——修法①后符号名在场义务）；③S1–S3 现绿面（key parity 145/145·en CJK allowlist 2 键）；④GAP 三钉翻面语义：G-GAP 断言从「红事实在场」翻「绿事实在场」须同件 prove 内可复核·**EXIT=0 语义不变=诚实钉≠covered**·翻面注记义务见 §1-修法③（harness append）。

---

## §1-修法（三件·零迁移·零 DDL·零新存储面·模型面零触）

### 修法① 错误码 en 产品映射（A2 收口）

- **案A（推荐）co-located en map + locale 参**：`ocr-preview-ui.ts` 增 `ERROR_MESSAGES_EN: Record<string, string>`（**键集与 zh map 恰 20 键 parity·值 CJK-free**）；`mapResumeUploadError(status, body, locale: Locale = 'zh')` 增第三可选参（缺省 'zh'·现调用点零改即编译绿）；体内按 locale 选 map（`locale === 'en' ? ERROR_MESSAGES_EN : ERROR_MESSAGES`·unknown code 回落 `upload_failed` 同构）；`resumeImageRefusedLocally`/`resumePreviewFormatRefused`/`mapResumeUploadAbort`（`:75/:79/:97`·函数体 return 行读法注记 rev3 P2-⑤——签名行在 `:74/:78/:96`·message 引自 map 成员）同款增 locale 参；生产接线=唯一调用点 `resume/actions.ts:73` 读 locale cookie（`cookies().get('locale')`·server action 域合法）传参。**rev2 扩面（F1/B1 处置·裁决 (a)）**：`actions.ts` 上传 user-facing message **内联面五处**（`§1.1` 亲证 `:78/:88/:95/:96/:113`·同文件实为九处——另四处 `deleteResumeAction` `:138/:141/:142/:145` **零触**·rev3 P2-1）**入迁移面**——`mapResumeUploadError` 同款 locale 参机制扩及内联面（actions 域内读 locale cookie·内联 locale 分支或小型双语 map·载体随 §8 裁决①同构落地）·其 en 面 CJK-free 由门① S4 扩一条静态断言承接。**rev2 定谳（F2/B2 处置）**：zh `ERROR_MESSAGES` **留 `ocr-preview-ui.ts` 文件内**（co-located·不迁 messages）·S5 对该文件 map 块豁免（见修法③ S5 口径）·门⑤ `:288-290` 源名断言义务=修法①后三符号名零改名。最小 diff·`messages/*.json` 与 S3 allowlist 面零扰动。
- **案B 双语迁 messages namespace**（`resumeErrors.*` 入 en/zh.json·组件/Action 走 `getTranslations`）：S2 parity 面扩 20 键·调用链扰动大·不推荐。
- **伴生三件 zh 文案函数**（help text/card description/banner `:58-72`）归修法② messages 迁移面（非 en map 面）。

### 修法② 热库去硬编码 zh（hot 三件·A1 结构面收口）

- **范围=hot 三件恰（G-GAP-2 钉面 + backlog「热库」口径）**：`view-model.ts` / `ocr-preview-ui.ts` / `interview-state.ts`。**全仓 152 文件面=范围外**（§3-1）。
- **案A（推荐）labels 参 + zh.json 缺省 bundle**：文案迁 `messages/{zh,en}.json` 新 namespace（候选名 `interview` / `resumeUpload`·命名归 §8 裁决②）；lib 函数改「labels 参」形——`interviewDisplay(v, labels?)` / `signalConcludePracticeCopy(code, labels?)` / `resumeFileHelpText(ocrPreview, labels?)` 等（**labels 缺省 = lib 内 `import zh from '../messages/zh.json'` 取对应域**·`resolveJsonModule` 已开·纯函数可单测形不变）；**zh 缺省输出逐字节不变**（zh.json 值=现字面逐字誊·web-logic 全文件零改绿——view-model 真锚 `:480`·`:162/:591/:660` 归属热三件外文件连带零改·public-copy `:288-290` 源名断言在场·rev2 归因改述）。**rev2 随迁条款（F0/P0 处置）**：`public-copy.proof.mjs` TC-PUBLIC-COPY-E11 `:281-283` 三条 `requireText(resumeOcrUi, '不是生产视觉质量承诺'|'不会编造文字'|'图片识别未开放', ...)` **源文断言随本修法迁移失锚**——requireText 目标**随迁改指 `messages/zh.json` 源文或双源**（载体=§8 裁决⑥）·该文件零改 Ban 解除但**限此断言迁移块**（§2-2 窄 diff·禁删断言禁改断言强度）。**rev3 登记（P2-③）**：随迁范围=仅 requireText 三针——E11 **forbid 面**（proof `:279` 禁 `['求职者','面试官']` / `:280` 禁 `['OCR 接线中','image/*']` / `:292` 禁 `['扫描型 PDF 请改传清晰图片','仅预览环境']`）**不随迁**——扫描目标仍指 `read()` 源文件（proof `:30-33` 亲证）·迁出文案离开扫描面后 forbid 覆盖空转·**不覆盖 `messages/{zh,en}.json`**（该面由 S2 key parity+S4 CJK-free 接管·防「forbid 面仍守迁移文案」误认）。**rev2 插值残留（F3/F4 处置）**：view-model `${}` 插值型文案 3 行（`:94/:109/:117`·扫描器复刻亲证）**不迁**·zh 残留登记 known-residual·en 侧对插值段零承诺（§8 裁决⑦·labels 参机制只覆盖静态 32 行）；生产接线=客户端 `useInterviewStream.ts:78`（`interviewDisplay(view)` 全仓唯一生产调用点）经 `useTranslations` 取 labels 传入；服务端组件同形 `getTranslations`。zh 值经 messages 管道后·**en 侧同步可得 en 文案**（值 CJK-free·插值段除外）。
- **案B keys 返回 + 渲染层查表**：`interviewDisplay` 返回 message key·组件层翻译——纯函数签名破坏面大（Display 结构即消费契约）·不推荐。
- **interview-state.ts 恰 7 行全为行尾注释假阳性**（§0.1-6）——修法②扫描器口径收严后自动归零（见修法③扩面 S5）·**零文案迁移**·**注释文本零动**（禁为凑数改注释=Ban 列）。

### 修法③ Playwright locale=en DOM spec + 静态 prove 扩面（G-GAP-3 收口）

- **新 spec**：`apps/web/e2e-ui/uc003-i18n-locale.spec.ts`·test 名携 Grep 锚 **`UC003-I18N-locale-en`**（沿 `uc018-abandon.spec.ts:11/:70` 形制）。步骤：①context 预置 `locale=en` cookie（`context.addCookies`·cookie-only 契约·§8 裁决⑤）→ ②走 golden 形注册/登录 → `/resume` → 断言**本刀迁移区·元素级三点钉死（F4 处置·rev2）**：help span（`ResumeUploadForms.tsx:73` `{resumeFileHelpText(ocrPreview)}` 之 `<span>`）+ banner p（`:64-66` `role="note"` 之 `<p>`）+ 错误 p（`:55` `#resume-upload-error`·`role="alert"` 之 `<p>`）——三点 DOM 文本 CJK **零残留**·**禁全页文本扫描冒充迁移区闭环**（全页面=步骤⑤ allowlist）→ ③触发一校验错误（**触发例钉空文件臂单臂（rev3 P1 改钉·承 F1/B1·裁决 (a)+(b) 并用）**：空文件臂 `actions.ts:95` `file.size === 0`——0 字节附件过 `ResumeUploadForms.tsx:70` `required`（HTML 约束=已选文件·不校验 size）·submit 链 `ResumeUploadForms.tsx:35-49` 零客户端 size/空预校验（rev3 亲证）→ DOM 可达·（`:95` 返回于 `readUploadFailure`/`mapResumeUploadError`（`:73`）之前·消息属内联迁移面）——**(a)** 迁移后于 `ResumeUploadForms.tsx:55` `#resume-upload-error`（`role="alert"`）断言 **en**=A2 DOM 面·**保 en 断言**·NEG 负路径断言收口；**超限臂（`:96` `size > RESUME_MAX_BYTES`=8MB）登记 known-residual**：Next Server Action `bodySizeLimit` 默认 1MB 框架阻断（`next.config.mjs` 全 45 行零 `experimental.serverActions` 覆盖·next `15.5.27`·rev3 亲证）→ >1MB 提交先于 action 体被框架拒·`:96` 臂消息 DOM 不可达·其 en 面由 S4 静态断言承接；**(b) allowlist 残留登记（rev3 P2-④ 改形·rev3.1 席2 复审 P2 措辞精确化）**：mapResumeUploadError API 响应臂与 `:88/:113` 网络失败内联面无 stub 不可达（无 API stub 手段·Ban）→ known-residual·en 面由 S4 静态断言承接；**本地拒绝臂 `:98/:99`（preview 布尔二选一）经 setInputFiles 实为可触·后刀可强化 en-DOM 断言**（本刀零扩·触发例仍钉空文件臂单臂）；`:88/:113` 网络失败内联面与超限臂 `:96`（框架阻断）均 DOM 不可触·并入 allowlist 残留）→ ④`/login` 或落地页 en 渲染冒烟（既有 messages namespace 面）→ ⑤全页其余 chrome 残留**具名 allowlist**（Nav zh 字面标签等未迁移面 + **rev2 增补具名面**：`ResumeUploadForms` 五处组件字面（§3-1）·view-model 插值型行 3 行（含行内静态成员·`:94/:109/:117`·裁决⑦·rev3 P2-3 改措）·actions.ts map 不可达/网络失败内联面+超限臂 `:96` 框架阻断（步骤③(b)·rev3 P1）·逐项清点计数**入收据=残留诚实登记**·不冒充全页 A1 已闭环；全页 A1=后续刀）。
- **静态 prove 扩面（同件 `uc-e2e-003-i18n-locale.proof.mjs` 改）**：
  - `G-GAP-error-code-en-map` → **S4**：断言 `ERROR_MESSAGES`/`ERROR_MESSAGES_EN` 键集 parity（20/20）+ en 值 CJK-free + `mapResumeUploadError` locale 参在场（`:99` 无参断言反转为有参断言）+ **内联面 en 文案零 CJK（rev2 扩一条·修法① (a) 验收承载）——作用域钉死=上传面五处逐处断言（rev3 P2-1·禁 actions.ts 文件级扫描：`deleteResumeAction` 四处 `:138/:141/:142/:145` zh 现存零触·文件级扫描必撞红）**；
  - `G-GAP-hardcoded-zh-ui` → **S5**：扫描器口径收严（测前剥离行尾 `//` 注释·消除 interview-state 7 行尾注假阳性）后**分文件断言（F2/B2 处置·rev2 定谳）**：`view-model.ts` **非插值型文案行=0**（插值豁免枚举钉死 rev3 P2-②：插值型 CJK 行**恰=3 且行号 ∈{:94,:109,:117}**·行内静态成员随行豁免·计数≠3 或行号出集=现场漂移→停·裁决⑦ known-residual）·`interview-state.ts` **=0**（剥离行尾注）·`ocr-preview-ui.ts` **非 map 块文案行=0**（`ERROR_MESSAGES` zh/en 两 map 块豁免——zh map 留文件定谳·由 S4 键 parity+CJK-free 断言接管）——现 `:121` 的 `cjkLines > 0` 在场断言按此口径反转为零断言；
  - `G-GAP-dom-e2e-ui` → **G3'**：断言 `apps/web/e2e-ui/` 存在具名 `uc003-i18n-locale.spec.ts` 且含 locale cookie 预置 + DOM CJK 扫描 + 错误码 en 断言三要素（静态存在性·**≠ DOM 实跑绿**）；
  - **措辞同步条款（F6/F7 处置·rev2）**：同件 `:95-97` else 分支措辞 `'PASS  ERROR_MESSAGES appears locale-clean (unexpected — re-check product)'` 与 `:163-168` 尾部 NOTE 块（`no GAP pins emitted — unexpected for current tree` / `EXIT=0 with GAP pins = honest mark-red …`）随 S4/S5/G3' 翻面**同步改写**（`unexpected` 语义翻面后失效）——属同件断言迁移面·非凑绿；**翻面注记义务**：EXEC 落地后须在 `ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md` **append**「G-GAP-1/2/3 → S4/S5/G3' 翻面注记」（append-only·不改 `:33-35` 表行本体·沿 §3-4 注记先例）·防 harness 表与 prove 实态矛盾；
  - S1–S3 原值零动；EXIT 语义零动（EXIT=0=结构绿≠covered·header 注记保留）。
- **UI 门注册（§8 裁决③落名）**：候选名 `uc003:i18n-locale-ui:prove` · 形制沿 `package.json:141` 先例：`E2E_UI_GREP=UC003-I18N-locale-en E2E_UI_PROJECT=chromium E2E_UI_SKIP_WORKER=1 node scripts/run-e2e-isolated.mjs e2e:ui`。**docker 隔离栈依赖如实申明**（`run-e2e-ui.mjs:46` 强制）——环境有 docker 则本刀内实跑 EXIT=0；环境缺 docker = spec 已落 + G3' 静态绿 + 「DOM 首跑收据 pending」残留诚实登记（**矩阵不动仍 partial**）。
- **spec typecheck 载体（§8 裁决④）**：e2e-ui 现不在任何 tsconfig include 面（§0.1-16）——推荐扩 `apps/web/tsconfig.json` include +`"e2e-ui/**/*"`（`@playwright/test` devDep 在位·小配置改·一行）。

---

## §2 验收断言候选（pre-exec 双审核对单基面·门预申明）

1. **门①（扩面 prove）**：`pnpm uc003:i18n-locale:prove` **EXIT=0**——S1–S3 原值绿 + S4/S5/G3' 新面绿；S4=20/20 键 parity + en 值零 CJK + locale 参在场 + 内联面 en 文案零 CJK（**上传面五处**·rev2 扩一条·rev3.1 席2 复审 P2 补限定词）；S5=**view-model 非插值型文案行 0（插值豁免恰=3·行号 ∈{:94,:109,:117}·rev3 P2-② 钉死）· interview-state 0（剥离行尾注口径）· ocr-preview-ui 非 map 块文案行 0（两 map 块由 S4 键 parity+CJK-free 断言接管·rev2 定谳）**；G3'=具名 spec 三要素在场。**复跑环境约束预申明（F9 处置·rev2）**：`uc003:i18n-locale:prove` 经 `run-e2e-isolated.mjs` 包装（root pkg `:215` 亲证·隔离栈依赖）——环境有 docker 走包装口径；环境缺 docker 走 **`pnpm uc003:i18n-locale:prove:raw` 直跑**（静态体不读写 DB·eval `:26` 同日先例·rev2 基线亲跑 EXIT=0/3 GAP pins）·收据注明所用口径·两口径断言面恒等。
2. **门②（web:prove·zh 缺省逐字节线）**：`pnpm web:prove` **EXIT=0**——web-logic 全臂原值·`:480` `includes('重连')`（view-model 真锚）与 `:162` `'进度待同步'`（progress 锚）/`:591`/`:660`（quiz/diagnosis 锚）**零改绿**；**git-diff 断言改窄（F0 处置·rev2）**：`git diff --exit-code apps/web/test/web-logic.proof.ts`（**全文件零改**）+ `public-copy.proof.mjs` 窄 diff——`git diff apps/web/test/public-copy.proof.mjs` 逐 hunk 须**恰为 E11 `:281-283` 断言迁移块**（§8 裁决⑥随迁·禁删断言禁改断言强度·迁移块外 hunk>0=停）。
3. **门③（typecheck）**：`pnpm typecheck` **EXIT=0**（root `typecheck:e2e`）+ 若裁决④扩 include 则 `pnpm -C apps/web typecheck` **EXIT=0** 同绿。
4. **门④（docs:check）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0**（rev1 落卷后本树亲跑现值 **2078 managed files ≤ cap 2080**·rev2 零新增文件→**2078 维持**·rev2 落笔前后各亲测一次 EXIT=0）。
5. **附条件门⑤（public-copy）**：`pnpm -C apps/web prove:public-copy` **EXIT=0**——修法①符号名在场义务（`:288-290` `resumeImageRefusedLocally`/`isPreviewOcrImage`/`mapResumeUploadError` 源名断言）+ 修法②迁出的 `:281-283` 源文断言**随迁后复跑绿**（F0/P0 处置·requireText 目标改指 messages 源文/双源·裁决⑥·**必跑**·rev2 基线亲跑 EXIT=0 裸 node 可跑）。
6. **附条件门⑥（UI 实跑·docker 环境）**：`uc003:i18n-locale-ui:prove`（裁决③定名）**EXIT=0**；环境缺 docker=残留登记「spec 已落·首跑收据 pending」·**不得虚报 EXIT**。
7. **偏差熔断**：S5 计数按门① 收严口径若 ≠ 0 且差异源=非本刀触面新增 zh 字面 → 停（现场漂移）；S2 parity 若基线已 ≠145/145 → 停（基线漂移重 pin·rev2 亲测现值 145/145）；prove 若出现非本卷预申明的新 FAIL → 停（验收红不可修）；**rev2 增补**：public-copy 窄 diff 出现断言迁移块外 hunk → 停（越界）；cite 门 UC-E2E-003 子项（harness cite/矩阵 partial）任一转 FAIL → 停（绊线触发·翻面越权）；门① raw 与 isolated 两口径结果不一致 → 停（环境口径漂移）。
8. **markers=0（§7）+ est live=0（§6）双声明入收据**；改面清点入收据（预期触面：`apps/web/lib/` 三件 + `apps/web/messages/{en,zh}.json` + `apps/web/app/resume/actions.ts` + `apps/web/lib/hooks/useInterviewStream.ts` + 消费组件若干 + `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` + 新 spec 一件 + 仓根 `package.json` 门注册 + 视裁决④ `apps/web/tsconfig.json` + **rev2 增补**：`apps/web/test/public-copy.proof.mjs`（限断言迁移块·裁决⑥）+ `ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md`（append 翻面注记·修法③））。

---

## §3 范围外（边界清单·越界即 FAIL）

1. **全仓 zh 清扫**：152 文件 CJK 面（`rg -l` 实测）——本刀只 hot 三件（G-GAP-2 钉面+backlog `:32`「热库」口径·harness `:44` 明文非目标）；`lib/interview/progress.ts:18` `'进度待同步'` 等热三件外文案零触（DOM spec 以具名 allowlist 承其残留·§1-修法③）；**rev2 登记**：`ResumeUploadForms.tsx` 五处组件本地 zh 字面（`:15` `上传中…` / `:54`+`:68` `提取并上传` / `:76` `或粘贴文本` / `:78` `上传简历` / `:83` placeholder `在此粘贴简历原文(至少 20 字)…`·亲证）allowlist 残留零触·其 `:54` `button === '提取并上传'` 字符串比较与字面耦合一并登记（裁决⑦）；`quiz-state.ts`/`diagnosis-state.ts`（web-logic `:591`/`:660` 锚所在）同属零触面。
2. **Accept-Language 产品 wiring**：scenario `:105` 前半触发措辞 vs `request.ts:10-11` cookie-only 契约——本刀 spec 走 cookie 预置·**Ban 顺带改 i18n 管道 locale 源**（§8 裁决⑤）。
3. **模型产出语言跟随 locale**：归 ai-eval 轨（scenario `:108/:113`·fake-model 禁令）——本刀零触。
4. **矩阵/backlog/harness/eval 行翻面**：UC-E2E-003 stays **partial**（cite 绊线 `:735-738` 在位）·coveredCount=8 不变·翻面权归协调方——本刀 EXEC 不得改四卷 SSOT 行（可 append 执行注记沿先例）。
5. **迁移/DDL/新存储面**：零（迁移号预期 **零**·`packages/db/migrations/` 零新增零改）。
6. **既有 7 spec 与 playwright.config 零触**：golden/online-public/recruiting-bound/screenshots/stream-window/uc018-abandon/voice-duplex 零 diff·config projects/workers/timeout 零改（locale 断言在 spec 内 context 级）。
7. **API/worker/domain 产品面零触**：本刀纯 web 面 + test 面 + messages 面 + 门注册两行。
8. **web-logic.proof.ts 全文件零改**（§1-修法②硬约束·§2-2 git diff --exit-code 断言）；**public-copy.proof.mjs 零改 Ban 解除·限 E11 `:281-283` 断言迁移块**（F0/P0 处置·§8 裁决⑥随迁·块外零改·§2-2 窄 diff 断言）。

---

## §4 依赖

**零未决硬依赖**：①`next-intl ^4.13.0` 在位（`apps/web/package.json:42`）·messages 双语目录+管道+切换 action 全在位（§0.1-1/2/8/9）——无前置刀；②零迁移编号交点（零 DDL）；③`e2e:ui` LIVE 目标与 GREP/PROJECT/SKIP_WORKER 旋钮在位（`run-e2e-isolated.mjs:89`·`run-e2e-ui.mjs:222-227`）·uc018 先例在位（`package.json:141`）；④`@playwright/test ^1.61.1` devDep 在位·Chromium 本地可装；⑤既有 prove 基线（S1–S3 现绿·web-logic·public-copy）现成可复跑。**可选 UI 门**需 docker 隔离栈（如实申明·非本刀硬依赖·§1-修法③）。**rev2 环境前置如实申明（F9/E 处置）**：本树 `node_modules` 缺失（worktree 未装·rev2 亲测）——门② web:prove/门③ typecheck/门⑥ playwright 需先 `pnpm install --frozen-lockfile`；门① raw 口径/门④ docs:check/门⑤ public-copy/cite 裸 `node` 可跑（rev2 四门亲测通过）；**cite 门基线红如实登记**：本树亲测 EXIT=1（FAIL 38/PASS 303·UC-E2E-003 两子项双 PASS）——非本刀依赖面·不修不扩（§1.4①·§2-7）。下游无硬闸。

---

## §5 Ban 列表 + pins

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT 行翻面（matrix/backlog/harness/eval/checklist/LEDGER 只读引用·翻面权归协调方·EXEC 注记 append 除外）；**Ban 写 covered**（矩阵 UC-E2E-003 stays partial·cite `:735-738` 绊线在位·三面收口≠全链路 E2E covered≠UC covered）；Ban 全仓 zh 清扫越界（§3-1·只 hot 三件）；Ban 动热三件外任何产品文案（progress.ts/quiz-state.ts/diagnosis-state.ts/ResumeUploadForms.tsx 等）；Ban 改 web-logic.proof.ts 凑绿（全文件零改·§2-2 git diff --exit-code 断言）；Ban 改 public-copy.proof.mjs 断言迁移块（E11 `:281-283` requireText 目标随迁·§8 裁决⑥）以外任何块·随迁块**禁删断言/禁改断言强度**（§2-2 窄 diff 断言·违者回炉重审）；Ban 动既有 7 个 e2e-ui spec 与 playwright.config（§3-6）；Ban 改 i18n locale 源管道（Accept-Language wiring=裁决⑤前禁止·§3-2）；Ban 触模型产出语言面与 fake-model 冒充（ai-eval 轨·§3-3）；Ban 新增迁移/DDL/新存储面/env 闸（§3-5）；Ban 为凑 S5 计数改注释文本（注释零动·扫描器口径收严为正途·§1-修法③）；Ban 顺带升级依赖包；Ban 伪造已问/已验来源。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全静态/本地 Chromium/隔离栈·零模型外呼·零消耗）

---

## §6 est live=0

本刀零模型真实外呼：门①静态 inventory（isolated 包装·静态体不读写 DB·harness `:52` 同口径·缺 docker 环境 raw 直跑同口径）；门②/③/⑤本地 node/tsx；门④docs 静态扫描；门⑥（可选）本地 headless Chromium + docker 隔离 PG——零 MODEL_API_KEY·零 secrets·零生产操作·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

起草改动集=**恰 1 .md**（`ai-docs/delivery/harness/uc003-i18n-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。EXEC 预期改动集（web lib 三件/messages 双件/actions+hooks+组件接线/prove 同件/新 spec/门注册/视裁决④ tsconfig/public-copy 限断言迁移块/harness append 注记）五类标记词同扫零命中（不复抄卷内·沿 ttl-wire/authz-harden 卷 §7 同形制）。

---

## §8 STOP（开工三条款 + 裁决项）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（backlog `:32` 三残余 + 矩阵 P1-6 `:272` 在册承接·本卷非授权本身）；③EXEC 立项**不得改 §1-修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 0.2 八处锚勘误如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项（七项·各带推荐/定谳）**：

1. **修法①载体**：案A co-located `ERROR_MESSAGES_EN` + `mapResumeUploadError` 第三可选参（推荐——最小 diff·server action cookie 传参·S3 allowlist 零扰动） vs 案B 迁 messages namespace（S2 面扩 20 键·扰动大）；rev2 增补：`actions.ts` 内联面五处 message 的 locale 载体随本裁决同构定谳（同文件内联面实为九处·另四处 `deleteResumeAction` `:138/:141/:142/:145` 零触·rev3 P2-1）。
2. **修法②机制与新 namespace 名**：案A labels 参 + zh.json 缺省 bundle（推荐——纯函数可单测形不变·zh 缺省输出逐字节不变硬约束可满足） vs 案B keys 返回渲染层查表；namespace 候选名 `interview` / `resumeUpload`（EXEC 定名后 S2/S3 断言面随之·名定即冻）；**zh 缺省逐字节线**（web-logic 全零改绿·view-model 真锚 `:480`）确认为本刀验收硬线。
3. **UI 门名与本刀内实跑口径**：门名候选 `uc003:i18n-locale-ui:prove`（沿 uc018:ui:prove 三旋钮形制·仓根 package.json 注册）·docker 可用则本刀内实跑 EXIT=0 入收据·缺 docker 则残留登记「spec 已落·首跑收据 pending」（**Ban 虚报 EXIT**·矩阵不动仍 partial）。
4. **spec typecheck 载体**：扩 `apps/web/tsconfig.json` include +`"e2e-ui/**/*"`（推荐·一行配置改·`@playwright/test` devDep 在位） vs 不扩（spec 无 typecheck 面·不推荐）。
5. **Accept-Language 面**：本刀申明 cookie-only 为现行产品契约（spec 走 cookie 预置·`i18n/request.ts:10-11` 零改）·Accept-Language wiring 登记 residual 另刀（推荐——locale 源管道改动=行为面越界） vs 本刀顺带 wire（**越界·不推荐**）。
6. **public-copy 断言随迁载体（F0/P0 处置·rev2 新增）**：`public-copy.proof.mjs` E11 `:281-283` 三条 `requireText(resumeOcrUi, '不是生产视觉质量承诺'|'不会编造文字'|'图片识别未开放', ...)` 源文断言随修法②迁移失锚——目标改指 **`messages/zh.json` 源文**（zh 值逐字誊入后源文面转移） vs **双源**（zh.json+en.json 各断言一处·en 值 CJK-free 顺带锁面）——EXEC 落地择一·收据登记（推荐双源）·禁删断言禁改断言强度·**rev3 补钉（P2-2）**：en 侧断言=键存在+值 CJK-free·**不逐字断言 EXEC 自撰译文**；**rev3 登记（P2-③）**：随迁范围=仅 requireText 三针——E11 forbid 面（`:279/:280/:292`）**不随迁**·扫描目标仍指源文件（proof `:30-33` read()）·**不覆盖 `messages/{zh,en}.json`**（S2 parity+S4 CJK-free 接管）。
7. **labels 形状与插值残留（F3/F4 处置·rev2 新增）**：修法② labels 参机制只覆盖静态文案面（view-model 35 行中静态 32 行·rev2 扫描器复刻亲证）——`${}` 插值型行 3 行（`:94/:109/:117`·**含行内静态成员**——残留=整行非仅插值段·rev3 P2-3 改措）**不迁·zh 残留登记 known-residual**·en 侧对插值段零承诺（DOM spec 禁对插值段断言 en）；`ResumeUploadForms.tsx:54` `button === '提取并上传'` 字符串比较与字面耦合登记在案（本刀零触该文件·后刀 labels 化该文件前须先解耦）。

---

*UC003-I18N REQUEST · 2026-10-14 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`ea6cd6a1`（全 hex `ea6cd6a141812221ba26d1b19bf531a16513d351`·pull --ff-only Already up to date 实测）· 分支 `line/uc003-i18n` · 工作树 `meetwise-uc003`（git worktree add 本起草席立·建前 worktree list+branch 双查不存在）· 立项出处=矩阵 P1-6 `:272` + §1.0.1 `:114` + §1.1 `:172` + backlog `:32` + harness G-GAP `:33-35` + eval BLOCKED `:53`（不自建 SSOT 行·翻面权归协调方）· 防重双对表过（harness 零同名卷·delivery rg EXIT=1）· 红事实三残余机证（ERROR_MESSAGES 20 键全 zh `:17-38`·mapResumeUploadError 无 locale 参 `:89-93`·actions.ts 内联 zh message 九处（上传面五处 `:78/:88/:95/:96/:113`+delete 四处 `:138/:141/:142/:145`·rev3 补全）·hot 三件 CJK 字面行 35/25/7=67·e2e-ui 7 spec 零 locale 断言 rg EXIT=1·config 无 locale）· 锚勘误四处如实登记（eval 实径 receipts/archive·interview-state 7 行尾注假阳性·67 复刻实测·scenario Accept-Language vs cookie-only 契约差）+ rev2 行号勘误/归因批四处（view-model `:50`·interview-state `:13/:23/:77`·web pkg `:21`·web-logic `:162/:591` 改述+`:660` 补全）· 修法三件（错误码 en map 案A/B 并陈+内联面五处随迁·热库去硬编码 labels 参案A/B 并陈+插值 3 行残留·zh 缺省逐字节硬线·Playwright locale=en spec+prove 扩面 S4/S5/G3'+措辞同步+harness 翻面注记义务）· public-copy `:281-283` 断言随迁条款（裁决⑥）· 零迁移·零 DDL·est live=0·markers=0·pins 十一值照抄零翻·门预申明四硬+两附条件（门① isolated/raw 双口径预申明·cite 基线红 EXIT=1 如实登记·门② git-diff 改窄）· §8 七裁决项（rev2 +2）· rev3 复审处置落卷（触发例改钉空文件臂单臂·超限臂=Next bodySizeLimit 默认 1MB 框架阻断 known-residual·内联面九处/S4 作用域钉死上传五处·S5 插值豁免枚举钉死·插值型行 3 行含行内静态成员·E11 针 2/3+1·forbid 不随迁登记·F4 重号注记）· ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

---

## rev2 勘误席处置摘要（2026-10-14 · pre-exec 双审两席 FAIL 七条合流处置 · docs-only 恰 1 .md · 每处亲证后落笔）

**输入**：席1 FAIL（B1 spec 步骤③触发例不流经 map 合同内死锁 + B2 门① S5=0 与 co-located zh map 数学互斥 + E1-E5/R1-R5）+ 席2 FAIL（F0 P0 public-copy `:281-283` 源文断言三重锁死 + F1-F5 P1 + F6-F9 P2）。协调方裁决七条·本席逐处 rg/sed/Read/实跑亲证后落卷：

1. **F0/P0 public-copy 随迁条款（修订清单①）**：亲证 `public-copy.proof.mjs` TC-PUBLIC-COPY-E11 `:281-283` 三条 `requireText(resumeOcrUi, '不是生产视觉质量承诺'|'不会编造文字'|'图片识别未开放', ...)` 源文断言锁死 `ocr-preview-ui.ts` 内将迁文案（**rev3 P2-4 补注**：「三重锁死」实情精化——`'不会编造文字'` 针在留守 map `ocr-preview-ui.ts:36`（`upload_timeout` 值）**存活**·实为 **2/3+1**：`'不是生产视觉质量承诺'`（`:60/:71`）与 `'图片识别未开放'`（`:61`）两针锚面随迁失锚+1 针留守存活·随迁条款实际约束面=2 针·结论零变）——修法②不随迁则门⑤必红·随迁则「测试文件零改 Ban」自锁=P0 死锁坐实。落卷：§1-修法②随迁条款（requireText 目标改指 `messages/zh.json` 源文或双源）·§2-2 门② git-diff 改窄（web-logic 全零改 + public-copy 限断言迁移块·禁删断言禁改强度）·§2-5 门⑤随迁复跑绿·§3-8/§5 Ban 条款化解除·§8 裁决⑥。
2. **F1+B1 spec 步骤③ 改形 (a)+(b) 并用**：亲证 `actions.ts:95/:96`（空文件/超限预检）返回于 `readUploadFailure`（`:73`→`mapResumeUploadError`）之前——spec ③ 原触发例不流经 map=合同内死锁坐实。落卷：**(a)** `:78/:88/:95/:96/:113` 五处内联 user-facing message 入迁移面（mapResumeUploadError 同款 locale 参扩及内联面·S4 扩内联 en 零 CJK 静态断言）·spec ③ **保 en 断言**（触发例钉空文件/超限预检面——**rev3 改钉：空文件臂单臂·超限臂 known-residual·见 rev3 摘要第 1 条**）；**(b)** map 合同 DOM 流经不可达 + `:88/:113` 网络失败内联面 → allowlist 残留登记（map en 面由 S4 静态承接）。
3. **F2+B2 zh ERROR_MESSAGES 留守定谳**：亲证互斥机理（zh map 20 键值全 zh 在 `:17-38`——若留守则「hot 三件文案行=0」数学不可达）。落卷：zh map **留文件** + S5 对该文件 map 块豁免——§2-1 门① S5 口径改「view-model 非插值型=0 · interview-state=0（剥离行尾注）· ocr-preview-ui 非 map 块文案行=0 · 两 map 块由 S4 键 parity+CJK-free 断言接管」·修法③ S5 同步·G-GAP-2 翻面口径降格同步。
4. **F3+席2 F4 labels 形状/插值残留**（rev3 P2-① 标号注记：本条「F4」与第 5 条「F4」**标号重号**——两 F4 为不同 finding（本条=labels 形状/插值残留·第 5 条=spec 步骤② 断言面钉元素级）·处置内容各自独立成立·重号系汇编笔误·不影响落点·卷内「F3/F4」引用沿旧·由本注记消歧）：亲证 view-model 35 CJK 字面行中 `${}` 插值型恰 3 行 `:94/:109/:117`（prove 扫描器复刻·静态 32 行）。落卷：插值型不迁·zh 残留登记 known-residual·en 侧插值段零承诺·§8 裁决⑦ + `ResumeUploadForms.tsx:54` `button === '提取并上传'` 字符串比较耦合登记（§3-1）。
5. **F4 spec 步骤② 断言面钉元素级**：亲证三元素锚——help span `ResumeUploadForms.tsx:73` / banner p `:64-66`（`role="note"`）/ 错误 p `:55`（`#resume-upload-error`·`role="alert"`）。落卷：spec ② 三点钉死·禁全页扫描冒充 + `ResumeUploadForms` 五处组件字面（`:15/:54+:68/:76/:78/:83`）allowlist 残留登记。
6. **F6/F7 措辞同步 + 翻面注记义务**：亲证 proof `:95-97`（`unexpected — re-check product`）与 `:163-168`（`no GAP pins emitted — unexpected` NOTE 块）翻面后语义失效。落卷：措辞同步条款（同件断言迁移面·非凑绿）+ `ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md` **append 翻面注记义务**（append-only·不改 `:33-35` 表行本体）。
7. **F8/F9 + 席1 E1-E5/R3/R4/R5 行号勘误批 + 环境预申明**：亲证并落卷——view-model 自证注 `:34`→**`:50`**；interview-state `:9/:22/:61`→**`:13/:23/:77`**；web pkg typecheck `:29`→**`:21`**；web-logic **`:162` 归因改述**（实锚 progress.ts `interviewProgressLabel`·热三件外）/**`:591` 归因改述**（quiz-state.ts `quizDisplay`）/**`:660` 归因补全**（diagnosis-state.ts `diagnosisDisplay` 同款断线臂锚·view-model 真锚唯 `:480`）；**cite 绊线基线红如实登记**（本树亲测 `node scripts/eval-harness-matrix-cite.proof.mjs` **EXIT=1**·FAIL 38/PASS 303·全为既存缺文件/pins 面·UC-E2E-003 两子项 `:139`/`:333` 双 PASS——非本刀引入·不修不扩·验收口径=子项维持 PASS）；**门① 复跑环境约束预申明**（`uc003:i18n-locale:prove` 外层经 `run-e2e-isolated.mjs` 包装 root pkg `:215` 亲证=isolated 栈依赖·或 `uc003:i18n-locale:prove:raw` 直跑口径——eval `:26` 同日先例·rev2 raw 基线亲跑 EXIT=0/3 GAP pins·收据注明口径）；环境前置（本树 `node_modules` 缺失亲测——门②/③/⑥ 需 `pnpm install --frozen-lockfile`；门① raw/④/⑤/cite 裸 node 亲测可跑）。

**rev2 基线亲证实录**（@d8538ff9 工作树）：`uc003:i18n-locale:prove:raw` EXIT=0（3 GAP pins）· `prove:public-copy` EXIT=0（14/14）· docs:check EXIT=0（2078 managed files ≤ cap 2080）· cite EXIT=1（38/303·如上）· en/zh flatten 叶 145/145 · 插值行集 view-model 3/35·ocr-preview-ui 0/25·interview-state 0/7（全行尾注）。

**自检**：docs:check EXIT=0（rev2 落笔前后各亲跑）· 五类标记词 grep 零命中 · STOP=`draft:awaiting_pre_exec_dual` 维持（待双审复审·Ban self-approve · alone≠dual · Dual PASS ≠ 开工）· 恰 1 .md · ⛔push。

---

## rev3 勘误席处置摘要（2026-10-14 · 双审复审席1 PASS（P2×5）/席2 FAIL（P1 超限臂死臂+P2×4）合流处置 · docs-only 恰 1 .md · 每处亲证后落笔）

**输入**：rev2 卷送双审复审——席1 PASS（附 P2×5 随修则）·席2 FAIL（P1×1 超限臂死臂+P2×4）。协调方裁决五条+席1 五则随修·本席逐处 rg/sed/Read/实跑亲证后落卷：

1. **P1 超限臂死臂（spec 步骤③改钉空文件臂单臂）**：死臂机理亲证——Next Server Action `bodySizeLimit` 默认 1MB（next `15.5.27`·`next.config.mjs` 全 45 行零 `experimental.serverActions` 覆盖·rg EXIT=1+全文件 Read 亲证）→ >1MB 附件提交先于 action 体被框架拒·`actions.ts:96`（`size > RESUME_MAX_BYTES`=8MB·`ocr-preview-ui.ts:9` 亲证）臂消息永不达 DOM。空文件臂可达性亲证：`ResumeUploadForms.tsx:70` file input `required`（HTML 约束=已选文件·不校验 size）+ submit 链 `:35-49` 零客户端 size/空预校验 → 0 字节附件过 required 直达 `actions.ts:95`。落卷：spec 步骤③触发例**改钉空文件臂单臂**（(a) 保 en 断言·`ResumeUploadForms.tsx:55` `#resume-upload-error`）·超限臂 `:96` 登记 **known-residual=框架阻断 DOM 不可达**·其 en 面由 S4 静态断言承接。**如实登记**：裁决原文「next.config.ts」系笔误——实测文件名 `next.config.mjs`·无覆盖结论零变。
2. **P2-1 delete 四处补入枚举（内联面实为九处非五处）**：亲证 `deleteResumeAction` 内联 zh user-facing message 四处——`:138`（网络错误，请稍后重试；简历未被删除。）/:141（找不到这份简历，或它已被删除。）/:142（删除请求未受理（+status），未当作已删除。）/:145（删除受理形状不合法，未当作已删除。）·`DeleteResumeButton.tsx:15` useActionState 绑定消费（message 于其 `:62-63` `role="alert"` 渲染）。落卷：§0.1-12/§1.1/修法①/裁决① 枚举补全=九处（上传五+delete 四）·**本刀迁移面=上传面五处**·delete 四处零触（越界面）·S4「内联面 en 文案零 CJK」**作用域钉死=上传面五处逐处**（禁 actions.ts 文件级扫描——文件级扫描必撞 delete 四处现存 zh 红·防误伤条款）。
3. **P2-2 裁决⑥ en 侧 needle 语义补钉**：落卷「en 侧断言=键存在+值 CJK-free·**不逐字断言 EXEC 自撰译文**」（译文属实现自由·逐字断言=过度约束）。
4. **P2-3 裁决⑦残留登记措辞改形**：亲证 `:94/:109/:117` 三行各含行内静态成员（`:94` heading '连接面试'+静态分支'正在建立连接…'+模板前缀 / `:109` '本题得分 '+',正在出下一题…' / `:117` '本次练习反馈 '+'（仅供个人复盘）'）——残留面=**整行**非仅插值段。落卷：「插值段 3 面」→「**插值型行 3 行（含行内静态成员）**」（spec 步骤⑤ allowlist+裁决⑦ 同步）。
5. **P2-4 F0「三重锁死」补注**：亲证 `'不会编造文字'` 针在留守 map `ocr-preview-ui.ts:36`（`upload_timeout` 值）**存活**·实为 **2/3+1**（`'不是生产视觉质量承诺'` `:60/:71` 与 `'图片识别未开放'` `:61` 两针锚面随迁失锚+1 针留守存活）·随迁条款实际约束面=2 针·结论零变（rev2 摘要第 1 条补注落卷）。

**席1 P2 五则随修**：

- **P2-① F 标号重号注记**：rev2 摘要第 4 条「F3+席2 F4」与第 5 条「F4」**标号重号**——两 F4 为不同 finding（前者=labels 形状/插值残留·后者=spec 步骤② 断言面钉元素级）·处置内容各自独立成立·重号系汇编笔误·不影响落点（rev2 摘要第 4 条注记落卷·卷内「F3/F4」引用沿旧由注记消歧）。
- **P2-② S5 插值豁免枚举钉死**：S5 口径补钉「插值型 CJK 行**恰=3 且行号 ∈{:94,:109,:117}**」（node 复刻亲证现值恰 3 行∈集）·计数≠3 或行号出集=现场漂移→停（修法③ S5+§2-1 门① 同步）。
- **P2-③ E11 forbid 面不随迁登记**：亲证 E11 forbid 三面（proof `:279` 禁 `['求职者','面试官']` / `:280` 禁 `['OCR 接线中','image/*']` / `:292` 禁 `['扫描型 PDF 请改传清晰图片','仅预览环境']`）扫描目标=`read()` 源文件（proof `:30-33` 亲证）——**不随迁**·迁出文案离开扫描面后 forbid 覆盖空转·**不覆盖 `messages/{zh,en}.json`**（该面由 S2 key parity+S4 CJK-free 接管）·防「forbid 面仍守迁移文案」误认（修法②随迁条款+裁决⑥ 登记落卷）。
- **P2-④ (b) 措辞随 P1 改形**：spec 步骤③(b) 去「该二预检路径」二元框架——map 合同 DOM 流经不可达（无 API stub·Ban）+ `:88/:113` 网络失败内联面 + 超限臂 `:96`（框架阻断）三路并入 allowlist 残留。
- **P2-⑤ :75/:79/:97 函数体行读法注记**：亲证三行=函数体 return 行（签名行在 `:74/:78/:96`）·三函数 message 均引自 `ERROR_MESSAGES` map 成员（非内联字面）（§0.1-4+修法① 注记落卷）。

**rev3 落笔处清点**（恰 1 .md）：Status 行 rev3 句 · §0.1-4（读法注记+:36 针存活）· §0.1-12（九处枚举）· §1.1（rev3 增补段）· 修法①（九处注+读法注记）· 修法②（forbid 不随迁登记）· 修法③ 步骤③（空文件单臂+超限臂 known-residual+(b) 改形）· 步骤⑤（插值型行 3 行+超限臂入 allowlist）· S4（作用域钉死）· S5（豁免枚举钉死）· §2-1（S5 钉死）· §8 裁决①/⑥/⑦ · rev2 摘要第 1/2/4 条补注 · 卷尾本节 · 页脚 provenance 行。

**rev3 基线亲证实录**（@ae419b33 工作树·rev3 落笔前）：docs:check EXIT=0（2078 managed files ≤ cap 2080）· next `15.5.27`+`next.config.mjs` 无 bodySizeLimit 覆盖（rg EXIT=1+全文件 Read）· view-model 插值型 CJK 行 node 复刻=3 行恰 ∈{:94,:109,:117}（各行含静态成员）· actions.ts 内联 zh message 亲点=9（5 上传+4 delete）· ocr-preview-ui `:36` `upload_timeout` 值含「不会编造文字」· E11 forbid 行 `:279/:280/:292`+源变量 read() `:30-33`。

**自检**：docs:check EXIT=0（rev3 落笔前后各亲跑）· 五类标记词 grep 本刀改动集零命中 · STOP=`draft:awaiting_pre_exec_dual` 维持（待双审复审·Ban self-approve · alone≠dual · Dual PASS ≠ 开工）· 恰 1 .md · ⛔push。

---

## rev3.1 errata（2026-10-14 · EXEC 席开工序 2 · 席2 复审两则 P2 登记随修 · docs-only 恰 1 .md）

协调方授权 EXEC（rev3 双审会签 PASS：席1 agent_83ab47d4 · 席2 agent_4aa3e730）。本节随修席2 复审登记两则 P2·零码动·恰 1 .md：

1. **步骤③(b) 措辞精确化**：原「map 合同 en 流转 DOM 触发不可达」二元措辞不精确——现场亲证 `actions.ts:97-99`：`:98` 本地拒绝臂（`image && !isOcrPreviewEnabled()` → `resumeImageRefusedLocally()`）与 `:99` 格式拒绝臂（`image && !isPreviewOcrImage(...)` → `resumePreviewFormatRefused()`）为 **preview 布尔二选一**的两条 map 合同臂，消息引自 `ERROR_MESSAGES` map 成员（`ocr-preview-ui.ts:75/:79` 函数体 return 行·rev3 P2-⑤ 读法注记），经 `setInputFiles`（选图片文件）**实为 DOM 可触**。改精确措辞：「mapResumeUploadError API 响应臂与 `:88/:113` 网络失败内联面无 stub 不可达；本地拒绝臂 `:98/:99`（preview 布尔二选一）经 setInputFiles 实为可触，后刀可强化 en-DOM 断言」。本刀触发例仍钉空文件臂单臂（`:95`）·本地拒绝臂 en 面 S4 静态断言承接·DOM 强化归后刀。
2. **§2-1 门① S4 子句补「上传面五处」限定词**：「内联面 en 文案零 CJK」补钉作用域=**上传面五处**（与 §1-修法③ S4 rev3 P2-1 作用域钉死同步——禁 actions.ts 文件级扫描·delete 四处现存 zh 零触防误伤条款在卷）。

**自检**：本节改动恰 1 .md（本卷）· 五类标记词零命中 · STOP=`draft:awaiting_pre_exec_dual` 维持（本节为协调方授权 EXEC 后的开工随修·非翻 STOP）· ⛔push。

---

## §9 EXEC 记录（2026-10-14 · UC-E2E-003 i18n 收口刀 · rev3 双审会签 PASS（席1 agent_83ab47d4·席2 agent_4aa3e730）+协调方明示授权后开工 · executed:awaiting_post_prove_dual · Ban self-approve · ⛔push）

### 9.0 立项重 pin（§0 义务·并线后树亲证）

- 并线：`git fetch` + `git merge --no-ff feat/mysql-schema-skeleton`（主线 tip=`cf501273`·merge=`035513cc`·双亲 `dabfd3ce`+`cf501273`）——**零冲突**（主线来面 api/worker/db/scripts/docs 与本刀触面零交叠·cap 行取大/注册行并集惯例未触发）。`merge-base --is-ancestor` 亲证主线 tip 已含。
- §0.1 锚全数重 pin 恒等：view-model 35 CJK 字面行（插值恰 3 ∈{:94,:109,:117}·静态 32）/ocr-preview-ui 25/interview-state 7（全行尾注）/en-zh 145-145 parity/actions.ts 内联 zh message 九处（上传五 `:78/:88/:95/:96/:113`+delete 四 `:138/:141/:142/:145`）/e2e-ui 7 spec 零 locale 断言/prove 基线 raw EXIT=0+3 GAP pins/public-copy 14/14 EXIT=0——与卷记载逐项恒等·**零漂移零改锚**。

### 9.1 逐工序落点

1. **工序1 并线**：merge=`035513cc`（如上·零冲突）。
2. **工序2 rev3.1 errata（commit `d7eb03b7`·docs-only 恰 1 .md）**：席2 复审两则 P2 随修——(a) 步骤③(b) 措辞精确化（现场亲证 `actions.ts:97-99`：`:98/:99` 本地拒绝臂=preview 布尔二选一·消息引自 map 成员·经 setInputFiles 实为可触）；(b) §2-1 门① S4 补「上传面五处」限定词。
3. **工序3 EXEC 施工（commit `200af27e`·恰 14 文件 +533/-141）**：
   - **修法①（案A·裁决①）**：`apps/web/lib/resume/ocr-preview-ui.ts` 增 `ERROR_MESSAGES_EN`（20 键与 zh map parity·值 CJK-free）+ 四导出函数增 locale 可选参缺省 'zh'（unknown code 回落 upload_failed 同构）；locale 参类型以本域 `ResumeUploadLocale='zh'|'en'` 承载（该件被客户端组件共享·禁引 `i18n/request`→`next/headers`·结构恒等·收据登记）；`apps/web/app/resume/actions.ts` 唯一生产调用点 `readUploadFailure` 增 locale 形参+`(await cookies()).get('locale')` 读取（Next 15 async cookies 契约与 `i18n/request.ts:10` 同形）+ 上传面五处入 `UPLOAD_MESSAGES` 双语载体（zh 逐字节=原字面·en CJK-free·恰五 entries）；**delete 四处零字节未触**（diff hunk 核验+S4 内零触守卫针）。
   - **修法②（案A·裁决②⑦）**：namespace 定名 **`interview`**（44 键）+**`resumeUpload`**（5 键）入 `messages/{zh,en}.json`（各 +53 行纯增量·S2 parity 194/194——post-prove R2 勘误：EXEC 原记 198/198 系笔误·node flatten 实测 en=zh=194=145+44 interview+5 resumeUpload）；zh 值逐字节誊写以脚本对 HEAD 旧字面全量比对亲证（byte-identity OK）；`view-model.ts` `interviewDisplay(v, labels?)/signalConcludePracticeCopy(code, labels?)` labels 参形·zh 缺省 bundle=lib 内 import zh.json·**插值型 3 行整行零触**（迁移后 :103/:118/:126·内容钉 '连接面试'/'本题得分'/'本次练习反馈'）；伴生三件 `resumeFileHelpText/resumeUploadCardDescription/resumeOcrPreviewBanner` labels 化；`interview-state.ts` **零 diff**（7 行尾注假阳性由 S5 剥离口径归零·注释零字节未动）；生产接线：`useInterviewStream.ts` `useTranslations('interview')`（layout `NextIntlClientProvider` 零参形态继承全 messages·v4 契约）+`ResumeUploadForms.tsx` `useTranslations('resumeUpload')`（组件五处字面+`:57 button === '提取并上传'` 比较零触）+`resume/page.tsx` `getTranslations('resumeUpload')`。
   - **修法③（裁决③④）**：`test/uc-e2e-003-i18n-locale.proof.mjs` 翻面 **S4**（20/20 parity+en CJK-free+locale 参在场断言（旧 `:99` 无参断言反转）+内联面五处逐处 en CJK-free+delete 零触守卫针）/ **S5**（行尾 `//` 剥离口径·view-model 非插值=0+插值恰 3 内容钉·interview-state=0·ocr-preview-ui 非 map 块=0 两 map 块豁免）/ **G3'**（具名 spec 三要素）·S1–S3 原值零动·EXIT 语义零动·`:95-97`/`:163-168` 措辞同步；新 spec `e2e-ui/uc003-i18n-locale.spec.ts`（Grep 锚 `UC003-I18N-locale-en`·步骤① cookie 预置→② golden 注册/登录+PIPL 同意门→/resume 迁移区三点元素级断言→③ **空文件臂单臂**（0 字节 buffer 过 `required`·`#resume-upload-error` en 断言 CJK-free+needle）→④ /login en 冒烟→⑤ 全页 CJK 文本节点∈具名 allowlist（EXEC 时实为 9 面·post-prove P1-1 增补 navHardcodedLabels+deleteResumeActionLiterals 两面后=11 面·R3 勘误见 §9.5）+清点计数 attach 入收据）；UI 门注册 `uc003:i18n-locale-ui:prove`（root package.json·沿 uc018:ui:prove 三旋钮形制·裁决③定名）；`apps/web/tsconfig.json` include +`"e2e-ui/**/*"`（裁决④·spec 入 typecheck 面）。
   - **裁决⑥（双源·推荐项）**：`public-copy.proof.mjs` E11 两失锚针（'不是生产视觉质量承诺'/'图片识别未开放'）requireText 改指 `messages/zh.json` 源文+en 侧键存在+值 CJK-free（rev3 P2-2 不逐字断言自撰译文）；'不会编造文字' 针留守 map 锚（`ocr-preview-ui.ts:36` upload_timeout 值·rev3 P2-4 2/3+1）**原样零动**；forbid 面 `:279/:280/:292` 不随迁（rev3 P2-③）。窄 diff 逐 hunk 亲证=恰断言迁移块（禁删断言/禁改强度守恒）。
   - **翻面注记义务（F6/F7）**：`ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md` append §6（G-GAP-1/2/3 → S4/S5/G3' 翻面注记·append-only·`:33-35` 表行本体零改）。
4. **工序4 门矩阵**：见 9.2。
5. **工序5 本节落卷+STOP 翻面**（`executed:awaiting_post_prove_dual`）。

### 9.2 门矩阵全表（并线后树=035513cc + 施工 commit 200af27e 亲跑）

| 门 | CMD | 结果 | 关键收据 |
|----|-----|------|----------|
| ①prove | `node apps/web/test/uc-e2e-003-i18n-locale.proof.mjs`（raw） | **EXIT=0** | S1–S3+S4+S5+G3' 六查全 PASS·GAP pins=0 |
| ①prove | `pnpm uc003:i18n-locale:prove`（isolated 包装） | **EXIT=0** | 与 raw 断言面/结果恒等（§2-7 双口径一致性过·isolated receipt `.tmp/isolated-proof-receipts/2026-10-14T17-39-20-702Z-*.json`） |
| ②web:prove | `pnpm web:prove` | **EXIT=0** | 全臂绿·zh 缺省逐字节锚全数恒等（`:480` includes('重连')/`:162` 进度待同步/`:591`/`:660`/`:710-732` 伴生三件逐字/`:1183-1270` interviewDisplay 逐字含 `:1270` EXACT 臂） |
| ②git-diff | `git diff --exit-code apps/web/test/web-logic.proof.ts` | **过（零改）** | web-logic 全文件零字节未触 |
| ②窄 diff | `git diff apps/web/test/public-copy.proof.mjs` | **过** | 单 hunk 恰 E11 断言迁移块（+13/-2） |
| ③typecheck | `pnpm typecheck`（root e2e） | **EXIT=0** | — |
| ③typecheck | `pnpm -C apps/web typecheck` | **EXIT=0** | 含 e2e-ui spec（裁决④扩面后） |
| ④docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0** | 80 required files·**2083 managed ≤ cap 2088**（rev3 基线 2078 + 并线主线并集 +3 + 新 spec 1 = 2083·未触顶·零自升） |
| ⑤public-copy | `pnpm -C apps/web prove:public-copy` | **EXIT=0** | 14/14·含 E11 随迁后复跑绿+`:288-290` 源名断言在场 |
| ⑥UI 实跑 | `pnpm uc003:i18n-locale-ui:prove` | **环境受阻→pending 残留登记（不虚报 EXIT）** | docker 在场（隔离 PG migrations applied=189·pre-prove ready×3）·栈 boot 前置红 `class=provider code=live_provider_key_missing`（`run-e2e-ui.mjs:53` 强制 live MODEL_API_KEY·本环境确无·est live=0 与卷 pins 同源·Ban 伪造不虚设）→**Playwright 零执行·spec 未实跑**；spec 已落+G3' 静态绿+typecheck 绿=首跑载体就绪·**DOM 首跑收据 pending**·矩阵 stays partial |
| 绊线 cite | `node scripts/eval-harness-matrix-cite.proof.mjs` | **EXIT=1 基线红承登** | FAIL **38**/PASS **303** 与卷 §1.4①/rev2 登记恒等（零漂移）·UC-E2E-003 两子项 `:139` harness cite+`:333` matrix partial **双 PASS**·绊线零触发 |
| 卫生 markers | 五类标记词改动集直扫（词面组装防自指） | **零命中** | 五类词面=四英数标记词逐字母组装引用+冲突标记对（本收据以组装式叙述代逐字誊写·防后刀改动集直扫自命中·post-prove P2-2）×改动集 14+1 文件 |
| 卫生 est live | 本卷 §6 口径 | **est live=0** | 全门静态/本地 node/tsx/docker 隔离 PG·零 MODEL_API_KEY·零 secrets·零消耗 |

### 9.3 偏离任务书清单

1. **门⑥ 环境矩阵比 §1-修法③/§2-6 预申明多一维**：卷预申明的附条件仅「docker 有/无」；本环境 docker 在场但 isolated UI 栈 boot 前置还强制 live `MODEL_API_KEY`（`run-e2e-ui.mjs:53`·`live_provider_key_missing`）——同归「环境能力缺失→首跑收据 pending」残留路径（§2-6 申明的残留登记形），如实登记根因差异，非断言红非越界自修。
2. **locale 参类型本域承载**：修法①卷面写 `locale: Locale = 'zh'`；实落 `ResumeUploadLocale = 'zh' | 'en'` 本域类型——`ocr-preview-ui.ts` 为客户端共享件（`ResumeUploadForms` 直 import），引 `i18n/request` 会拖入 `next/headers` 破坏客户端 bundle；结构恒等、机制/缺省/S4 断言面零差。
3. **S5 插值豁免的行号钉以内容钉承接**：rev3 P2-② 钉「行号 ∈{:94,:109,:117}」为迁移前基线锚；施工迁 32 静态行后三插值行位移至 :103/:118/:126（+9 行头注）——S5 以**内容钉**（'连接面试'/'本题得分'/'本次练习反馈' 三行恰在）+计数恰 3 承接同一枚举（行号钉在开工前基线亲证满足 9.0）。基线漂移语义未变：计数≠3 或内容出集→停。
4. **门① S4 修一行 prove 自身缺陷（施工中发现即修）**：内联 entries 解构初版误取 match full 元素+zh 组（致假红）——取组下标修正为 `m[3]`；属同件 prove 构造修正非断言放宽。

### 9.4 自检与终态

恰三 commit（`d7eb03b7` errata·`200af27e` 施工·本节卷 commit）+并线 `035513cc`·零 push·五类标记词零命中·pins 十一值零翻（coveredCount=8 不变·矩阵 stays partial·`actualSpendCny=null`）·Ban 列全守（web-logic 零改/既有 7 spec 与 playwright.config 零 diff（git status 亲证）/i18n locale 源管道零改（cookie-only 契约）/模型面零触/零迁移·DDL/progress.ts·quiz-state.ts·diagnosis-state.ts·ResumeUploadForms 组件字面零触/delete 四处零触）·**STOP=`executed:awaiting_post_prove_dual`**（待 post-prove 双审两外席·Ban self-approve·alone≠dual）。

---

## §9.5 post-prove 修复记录（2026-10-14 · post 双审双 FAIL 七条全数处置 · 码修恰 2 文件+本卷勘误 · 待重审 · ⛔push）

**输入**：post-prove 双审——席1 FAIL（R1·P1+R2/R3/R4/R5 登记）+席2 FAIL（P1-1+P2-2/P2-3）。协调方处置清单七条·本席逐处 rg/sed/Read/node 实跑亲证后落笔：

1. **R1（席1 P1·码修）signalConclude labels 补转发**：亲证 `view-model.ts:40` `interviewDisplay` 内嵌 `signalConcludePracticeCopy(v.signalConcludeReason.code)` 单参调用（漏转 `labels`——en 调用面下 conclude 臂 message 恒落 zh 缺省 bundle）→ 改 `signalConcludePracticeCopy(v.signalConcludeReason.code, labels)`。第二参形亲证：签名 `view-model.ts:18` `labels: CopyLabels = defaultInterviewLabels`（`(key: string) => string` 查表函数·与 `interviewDisplay` 的 `labels` 参同形）·en 键在册亲证（`interview.concludeEarlyWeak`/`interview.concludeSpin` 双语 bundle 均在·en 值 CJK-free）；zh 缺省调用面零扰机证：web-logic `:813`（`interviewDisplay(signalThenReport)` 无参=zh 缺省）+`:818`（`signalConcludePracticeCopy('thrashing')` 单参断言 `includes('换题')`）——缺省缺参机制零动·仅显式转发·门② 复跑全绿佐证。**spec en 断言条件臂判定**：conclude 臂渲染面=面试流视图（`interviewDisplay` 唯一生产调用点 `useInterviewStream.ts:81`·rg 全仓亲证其余命中皆 test/progress 异名面）·本 spec 流程仅覆盖 /login+/resume——**conclude 臂在 spec 流程不可达**→按处置清单「或」支**在卷登记后刀补**（后刀扩面试流 DOM spec 须补 conclude 臂 en 断言）。
2. **P1-1（席2·spec 扩面）ALLOWED_CJK_FACES 增补真实残面四处**：(a) 增 `navHardcodedLabels: ['押题','找工作','岗位匹配']`——Nav.tsx `:39-41` 三 candidate link 字面逐字亲证（recruiter 三面 `:49-51` 仅 recruiter cookie 渲染·不在本 spec 流程 DOM·不入列）；(b) `localeSwitch: ['中文']` → `localeSwitcher: ['中']`（「并入既有键如实命名」支）——'中文' 实为 settings 页 `<option>`（`settings/page.tsx:60`）·/resume DOM 实残面=LocaleSwitcher zh 钮 label '中'·**锚勘误如实登记**：处置清单原书 LocaleSwitcher.tsx `:12`（en 臂行）·'中' 实在 **`:10`**·结论零变；(c) `resumePagePersonalization` 两条合并串 → 按节点三值 `['面试出题个性化：','已同意（简历要点将发送给模型服务商用于出题）','未同意（面试仅使用通用题库）']`——`resume/page.tsx:79-81` 亲证：JSX 文本子+条件表达式子各建文本节点·SSR 以注释分隔·TreeWalker 逐节点 textContent 命中不了合并串（原两条=死条目）·'撤回出题个性化' 保留；(d) 增 `deleteResumeActionLiterals` 具名 known-residual 四条——**行位移勘误**：§0.1-12/§1.1 原钉 `:138/:141/:142/:145` 为施工前基线锚·UPLOAD_MESSAGES 增量位移后实测 **`:157/:160/:161/:164`**（逐字亲证）；第三条源形含 `'…（'+res.status+'）…'` 运行时插值·allowlist 以 `<status>` 占位形登记+spec 内注释声明：**失败路径 happy-path 不触**（本 spec 永不触发 delete·该臂节点若现即 UNKNOWN 有意哨兵）——卷面声明如前句。修订后 allowlist=**恰 11 面**。
3. **R2/R3（记录勘误）**：§9.1 「S2 parity 198/198」→**194/194**（node flatten 实测 en=zh=194=145+44 interview+5 resumeUpload·原记系笔误·S2 断言本身无数值·prove 零改）；§9.1 「具名 allowlist（11 面）」→按修订后实数改写（EXEC 时实为 9 面·P1-1 增 2 面后=11·两态如实分记）。
4. **R4（登记）**：spec 步骤② OCR banner p 断言=**渲染条件下断言**（`banner.count()>0` 方断 CJK-free——该 `<p role="note">` 仅 preview OCR 门在环境中开启时渲染·spec `:100-106` 注释同义在场）——防后刀误读为无条件断言·本卷注记一句如本条。
5. **R5（登记）**：`ocr-preview-ui.ts:6` `import zhMessages from '../../messages/zh.json'`——客户端共享件携入**全量** zh 目录（数 KB 级 bundle 观察项）·缺省 labels 只消费 `resumeUpload` 域·其余键为搭车面——后刀按域子集收敛（本刀零触·仅登记）。
6. **P2-2（席2·卷面词面组装化）**：§9.2 收据表 markers 行 receipts 单元原**逐字引用四英数标记词面**——后刀若对改动集（含本卷 .md）直扫必自命中·已改组装式叙述（「四英数标记词逐字母组装引用+冲突标记对」·不逐字誊写）；改后全卷 rg 四词面逐字零残留亲证。
7. **P2-3（席2·S5 口径注记登记）**：S5 扫描器 `stripTrailingLineComment`（proof `:38-41`）取行内**首个** `//` 截断——盲区=字符串字面量内 `//` 后随 CJK（如 URL 形字面）会被截漏计。**今无实例机证**：hot 三件逐行扫「`//` 前奇数引号+CJK 在 `//` 后」=0 命中（node 脚本亲测·view-model/ocr-preview-ui/interview-state 三件各 0）——登记口径注记：后刀若引入该形字面·须先修扫描器取位（如引号态感知）再信 S5 计数。

### 重跑门矩阵（本修复轮·未提交工作树亲跑·零模型外呼 est live=0）

| 门 | CMD | 结果 | 关键收据 |
|----|-----|------|----------|
| ①prove raw | `node apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` | **EXIT=0** | 六查全 PASS·GAP pins=0（spec allowlist 改面不触 G3' 三要素·亲证） |
| ①prove isolated | `pnpm uc003:i18n-locale:prove` | **EXIT=0** | 与 raw 断言面/结果恒等（§2-7 双口径一致） |
| ②web:prove | `pnpm web:prove` | **EXIT=0** | 全臂绿·zh 缺省逐字节锚恒等（R1 转发零扰佐证·`:813-818` 单参 zh 臂在场） |
| ②git-diff | `git diff --exit-code apps/web/test/web-logic.proof.ts` | **过（零改）** | web-logic 全文件零字节未触 |
| ③typecheck | `pnpm typecheck` + `pnpm -C apps/web typecheck` | **EXIT=0 双绿** | — |
| ④docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0** | 2083 managed ≤ cap 2088（零新增文件） |
| ⑤public-copy | `pnpm -C apps/web prove:public-copy` | **EXIT=0** | 14/14（回归守护·R1 不触其断言面） |
| ⑥UI 实跑 | `pnpm uc003:i18n-locale-ui:prove` | **环境受阻维持 pending（不虚报 EXIT）** | docker 在场·live MODEL_API_KEY 缺（§9.2 同因）→spec 静态载体就绪·DOM 首跑收据仍 pending·矩阵 stays partial |
| 绊线 cite | `node scripts/eval-harness-matrix-cite.proof.mjs` | **EXIT=1 基线红承登** | FAIL 38/PASS 303 恒等·UC-E2E-003 两子项双 PASS·绊线零触发 |
| 卫生 markers | 五类词面改动集组装式直扫 | **零命中** | 本轮 commit 改动集恰 3 文件（view-model.ts/spec.ts/本卷）·直扫实覆盖工作树全 dirty 集 4 文件（含既存 tsbuildinfo 构件·零命中） |

**自检**：本轮 commit 恰 3 文件（`apps/web/lib/view-model.ts` 恰 1 行·`apps/web/e2e-ui/uc003-i18n-locale.spec.ts` allowlist 面·本卷）·五类标记词改动集零命中·pins 十一值零翻（coveredCount=8 不变·矩阵 stays partial·`actualSpendCny=null`）·Ban 列全守（web-logic 零改/既有 7 spec 与 playwright.config 零 diff/i18n locale 源管道零改/delete 四处产品码零触——仅 spec allowlist 登记其字面·模型面零触/零迁移 DDL）·**STOP=`executed:awaiting_post_prove_dual` 维持（修复轮毕·待重审·Ban self-approve·alone≠dual）**·⛔push。
