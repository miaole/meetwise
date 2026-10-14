# UC003-I18N REQUEST（UC-E2E-003 i18n 收口刀 · 错误码 en 产品映射 + 热库去硬编码 zh + Playwright locale=en DOM spec · 三面收口 · 零迁移 · 单日级）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席写完即停·零码动·恰 1 .md·待 pre-exec 双审两外席 BOTH PASS 落卷 + 协调方明示授权方开工 · **Ban self-approve** · **alone≠dual** · **Dual PASS ≠ 开工**）。

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
| 4 | `apps/web/lib/resume/ocr-preview-ui.ts` | `ca8e2000`（全 `ca8e2000fff75586f75a583be4e8fded9032baa9`·全 102 行） | `:17-38` `ERROR_MESSAGES: Record<string, string>` **恰 20 键全 zh**（image_ocr_unavailable/ocr_failed/ocr_no_content/ocr_duplicate/ocr_binding_missing/ocr_binding_invalid/consent_required/insufficient_entitlement/extracted_too_short/ocr_preview_format/extracted_too_long/file_too_large/empty_file/unsupported_file_format/parse_failed/too_many_requests/server_busy/public_preview_read_only/upload_timeout/upload_failed）· `:58-62` `resumeFileHelpText` zh 字面 · `:64-68` `resumeUploadCardDescription` zh 字面 · `:70-72` `resumeOcrPreviewBanner` zh 字面 · `:75` `resumeImageRefusedLocally` · `:79` `resumePreviewFormatRefused` · `:89-93` `mapResumeUploadError(status, body)`（**无 locale 参**·`:90` 413 分支·`:92` `ERROR_MESSAGES[error] ?? ERROR_MESSAGES.upload_failed`）· `:97` `mapResumeUploadAbort` |
| 5 | `apps/web/lib/view-model.ts` | `5953fb3d`（全 `5953fb3d64e83204709fb3f3354dbbd5f7f15427`·全 145 行） | `:9-13` `signalConcludePracticeCopy`（zh 字面 2 分支）· `:29` `interviewDisplay(v)`（zh 文案 return 面约 30 行：连接过多/服务恢复中/正在切换连接/网络中断/练习连接已停止等）· `:34` 注释自证「游标与绝对上限（缺省）保持原文案逐字（**既有断言锚定**）」· 起草席复刻 prove 扫描器实测 **CJK 字符串字面量行=35** |
| 6 | `apps/web/lib/stream/interview-state.ts` | `3a4f198f`（全 `3a4f198f8565fdd926694251ed819947655d1eab`·全 200 行） | `:9` `ALL_PHASES` 9 值 · `:22` `StreamStopReason` 5 值 · `:61` `initialView` · CJK 命中 7 行**全为行尾注释**（`:130/:131/:137/:155-157/:159`·**零 zh 字符串字面量文案**）——纯扫描器尾注假阳性面 |
| 7 | `apps/web/lib/interview/progress.ts` | `0af64d21`（全 46 行） | `:18` `interviewProgressLabel` 回落 `'进度待同步'` zh 字面（**hot 三件之外**·本刀范围外·§3-1） |
| 8 | `apps/web/messages/en.json` | `f664a91c` | 5 namespace：nav/home/login/common/features · flatten 叶 **145**（起草席 python 实测）· S3 allowlist 面=`home.footBrand`+`common.zh`（proof `:18`） |
| 9 | `apps/web/messages/zh.json` | `d9195a0a` | 同 5 namespace · flatten 叶 **145**（与 en parity·S2 现绿前提） |
| 10 | `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` | `776c0465`（全 `776c04650910b00ee2bb8ac5ab21c827f4d21152`·全 173 行） | `:18` `EN_CJK_ALLOW = Set(['home.footBrand','common.zh'])` · `:42-52` S1-i18n-plumbing · `:54-62` S2-message-key-parity · `:64-74` S3-en-json-no-unexpected-cjk · `:76-100` **G-GAP-error-code-en-map**（`:85-89` zhOnly 全量且无 locale 分支→pin `GAP-UC003-ERROR-CODE-EN-MAP`；`:99` 断言 `mapResumeUploadError` 签名无 locale 参）· `:102-126` **G-GAP-hardcoded-zh-ui**（`:103-107` hot 三件清单=view-model/ocr-preview-ui/interview-state·`:121` `assert.ok(cjkLines > 0, 'expected known hard-coded zh UI surfaces (inventory honesty)')`——**现值断言为红事实在场**）· `:128-145` **G-GAP-dom-e2e-ui**（`:137-141` specs 无 locale 命中→pin `GAP-UC003-DOM-E2E-UI`）· `:170` `failed===0 → exit 0`（EXIT=0=诚实钉≠产品闭环） |
| 11 | `apps/web/test/web-logic.proof.ts` | `7b53aeaa`（全 `7b53aeaa7d8565948fa08b217aec6d20d1de9898`） | `:12` import interviewDisplay/signalConcludePracticeCopy · `:162` 断言 `interviewProgressLabel(...) === '进度待同步'`（zh 逐字锚）· `:480` 断言 reconnecting 臂 `d.message.includes('重连')` · `:591` quiz 断线臂同款 `includes('重连')`——**zh 缺省输出逐字节不变硬约束的机证锚** |
| 12 | `apps/web/app/resume/actions.ts` | `3a94ca9e` | `:14` import `mapResumeUploadError` · `:73` **全仓唯一生产调用点** `return mapResumeUploadError(res.status, body);`（rg 实测：components/page 侧零调用） |
| 13 | `apps/web/app/resume/ResumeUploadForms.tsx` | `24c25b9f` | `:1` `'use client'` · `:8` import resumeFileAccept/resumeFileHelpText/resumeOcrPreviewBanner · `:65` `{resumeOcrPreviewBanner()}` · `:73` `{resumeFileHelpText(ocrPreview)}`——客户端组件直调 zh 文案纯函数 |
| 14 | `apps/web/e2e-ui/`（目录） | —（7 spec 亲列） | `golden.spec.ts` / `online-public.spec.ts` / `recruiting-bound.spec.ts` / `screenshots.spec.ts` / `stream-window.spec.ts` / `uc018-abandon.spec.ts` / `voice-duplex.spec.ts` 恰 **7** 件；`rg -ln "locale|i18n" apps/web/e2e-ui/` **EXIT=1 零命中**——locale=en DOM spec **缺席机证**；`uc018-abandon.spec.ts:11` Grep anchor 形制（`UC018-UI-abandon`）·`:70` test 名携锚 |
| 15 | `apps/web/playwright.config.ts` | `321b80e0` | `testDir: './e2e-ui'` · projects `chromium`+`mobile` · `workers: 1` · `retries: 0` · **`use` 块无 locale 配置** · baseURL `http://127.0.0.1:3100` |
| 16 | `apps/web/package.json` | `9e060d12` | `:8` `"prove": "tsx test/web-logic.proof.ts"` · `:9` `prove:public-copy` · `:10` `"prove:uc003-i18n-locale": "node test/uc-e2e-003-i18n-locale.proof.mjs"` · `:29` `"typecheck": "tsc --noEmit"` · `:42` `"next-intl": "^4.13.0"` · devDeps `@playwright/test ^1.61.1` · `tsconfig.json` include=`app/components/lib` **exclude `test`·e2e-ui 不在任何 tsconfig include 面**（`6ef17061` 亲证）；根 `tsconfig.e2e.json`（`339c2a45`）include=`e2e/**/*` 恰——e2e-ui spec **现无 typecheck 载体** |
| 17 | `package.json`（仓根） | `bc950902` | `:141` `uc018:ui:prove` = `E2E_UI_GREP=UC018-UI-abandon E2E_UI_PROJECT=chromium E2E_UI_SKIP_WORKER=1 node scripts/run-e2e-isolated.mjs e2e:ui`（**UI 单 spec 门注册先例**）· `:215-216` `uc003:i18n-locale:prove` → `:prove:raw` → `pnpm -C apps/web prove:uc003-i18n-locale` · `:259` `web:prove` = `pnpm -C apps/web prove` · `:339/:341` `e2e:ui` / `e2e:ui:isolated` |
| 18 | `scripts/run-e2e-ui.mjs` | `84f9cd2d` | `:46` `if (env.E2E_ISOLATED !== '1') throw ...('e2e_ui_isolation_required')`（**e2e:ui 强制隔离栈**）· `:141-144` `E2E_UI_SKIP_WORKER` · `:222-227` `E2E_UI_GREP`/`E2E_UI_PROJECT` 透传 playwright `--grep`/`--project` |
| 19 | `scripts/eval-harness-matrix-cite.proof.mjs` | `36cefcba` | `:163` `rowIds: ['UC-E2E-003']` · `:735-738` **绊线**：matrix UC-E2E-003 匹配 `**covered**` → fail；匹配 `**partial**` → pass——**矩阵翻 covered 即此门红** |
| 20 | `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `0cf6ae18` | `:114` §1.0.1 行（NEG=gap/FAULT=blind/BOUND=partial(key parity)/ADV=blind）· `:172` §1.1 挂载行 · `:272` §3 P1-6（立项出处①） |
| 21 | `ai-docs/delivery/e2e-covered-path-backlog.md` | `05a76401` | `:32` 「003 | 错误码 en 映射产品接线；热库去硬编码 zh；Playwright locale=en DOM」（立项出处②） |
| 22 | `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3` | `:101-113` UC-E2E-003 场景原文：`:104` 角色求职者(locale=en) · `:105` 触发「以 `Accept-Language: en` / 用户设置 en」 · `:106` 主流程（UI 全 en/错误码按 locale 映射/report 页 en 渲染） · `:107` 验收 A1 关键页面无中文残留（**针对 UI 框架文案，不针对模型产出**）+ A2 后端校验错误 en 文案 · `:108` 测试层纠偏（模型语言归 ai-eval） · `:112` TC-E2E-003-ui-en |
| 23 | `ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md` | `18b43a93` | `:33-35` G-GAP-1/2/3 三钉表 · `:44` 非目标「全页面 hard-coded zh 清零……全仓清扫属后续」· `:52` `pnpm uc003:i18n-locale:prove` 期望 EXIT=0（isolated 包装·静态体不读写 DB） |
| 24 | `receipts/archive/2026-09-batch23/eval/uc-e2e-003-i18n-locale.eval.md` | `16e36de9` | `:26` prove 0/0 台账 · `:49-51` GAP 三钉登记 · `:53` BLOCKED 清单（前三项=本刀） · `:69` 「是否列为下一刀产品 P1」双问——本卷即其承接 |

### 0.2 锚勘误如实登记（登记面与本席实测之差·结论零变）

1. **eval 卷实际路径**：矩阵 `:172` 引用形 `eval/uc-e2e-003-i18n-locale.eval.md`——实测真实路径 `receipts/archive/2026-09-batch23/eval/uc-e2e-003-i18n-locale.eval.md`（blob `16e36de9`）。同物异径·本卷全锚按实测路径钉。
2. **interview-state CJK 计数**：粗扫 rg 面 8 行 vs 复刻 prove 扫描器 7 行——差 1 行系行首空行/注释起始位差；以扫描器口径 **7 行全为行尾注释假阳性**（§0.1-6）为准。
3. **hot 三件 CJK 字符串字面量行合计**：view-model **35** + ocr-preview-ui **25** + interview-state **7** = **67**（起草席复刻 prove 扫描器逐文件实测·EXEC 以扩面 prove 实跑为准·偏差熔断见 §2-7）。
4. **scenario 触发措辞 vs 产品契约**：`e2e-scenarios.md:105` 触发含 `Accept-Language: en`；产品现形 `i18n/request.ts:10-11` **仅读 locale cookie**（Accept-Language 零读取）——非本刀扩权面·处置见 §8 裁决⑤。

---

## §1 红事实（三残余机证·全 @`ea6cd6a1` 实测）

### 1.1 残余①错误码 zh-only map（A2 未闭环）

`ERROR_MESSAGES`（`ocr-preview-ui.ts:17-38`）**恰 20 键·值全 zh·零 en 映射·零 locale 分支**；`mapResumeUploadError(status, body)`（`:89-93`）无 locale 参；全仓唯一生产调用点 `resume/actions.ts:73`（server action·可读 cookie 零障碍）。客户端侧 zh 文案纯函数同文件伴生（`:58-72` help text/card description/banner 三件·`ResumeUploadForms.tsx:65/:73` 客户端直调）。prove G-GAP-1（proof `:76-100`）据实 pin `GAP-UC003-ERROR-CODE-EN-MAP`。→ locale=en 用户触发上传校验错误仍见 zh 文案·A2（scenario `:107`）未闭环。

### 1.2 残余②热库硬编码 zh（A1 结构面）

hot 三件（G-GAP-2 钉面 proof `:103-107`）CJK 字符串字面量行 **67**（view-model 35 真文案为主 / ocr-preview-ui 25 全真文案 / interview-state 7 全行尾注释假阳性）——locale=en 时此等文案绕过 `messages/*.json` 管道恒 zh。`view-model.ts:34` 自证文案被既有断言逐字锚定（web-logic `:162/:480/:591`）。**全仓面**：`rg -l "[\u4e00-\u9fff]" apps/web/{lib,app,components,hooks}` 实测 **152 文件**（含注释面）——全仓清零=harness `:44` 明文非目标·backlog `:32` 口径=「**热库**去硬编码 zh」·本刀只锁 hot 三件。→ prove G-GAP-2 pin `GAP-UC003-HARDCODED-ZH-UI`。

### 1.3 残余③Playwright locale=en DOM spec 缺席（G-GAP-3）

`apps/web/e2e-ui/` 恰 7 spec·**零 locale/i18n 断言**（rg EXIT=1 机证）；`playwright.config.ts` `use` 块无 locale 配置；e2e:ui 强制隔离栈（`run-e2e-ui.mjs:46`）。UI 门注册先例在位（`package.json:141` uc018:ui:prove = GREP+PROJECT+SKIP_WORKER 三旋钮）。→ prove G-GAP-3 pin `GAP-UC003-DOM-E2E-UI`。

### 1.4 绊线与既存锚（本刀 must-not-break 面）

①矩阵绊线：`scripts/eval-harness-matrix-cite.proof.mjs:735-738`——UC-E2E-003 写 covered 即红·**本刀后矩阵必须仍 partial**（三面收口后残留仍多：全仓 zh 面/模型语言面/full.e2e 面）；②zh 缺省输出逐字节锚：web-logic `:162`（`'进度待同步'`）+`:480`/`:591`（`includes('重连')`）+public-copy `:290`（`requireText(resumeActions,'mapResumeUploadError',...)` 源名断言）；③S1–S3 现绿面（key parity 145/145·en CJK allowlist 2 键）；④GAP 三钉翻面语义：G-GAP 断言从「红事实在场」翻「绿事实在场」须同件 prove 内可复核·**EXIT=0 语义不变=诚实钉≠covered**。

---

## §1-修法（三件·零迁移·零 DDL·零新存储面·模型面零触）

### 修法① 错误码 en 产品映射（A2 收口）

- **案A（推荐）co-located en map + locale 参**：`ocr-preview-ui.ts` 增 `ERROR_MESSAGES_EN: Record<string, string>`（**键集与 zh map 恰 20 键 parity·值 CJK-free**）；`mapResumeUploadError(status, body, locale: Locale = 'zh')` 增第三可选参（缺省 'zh'·现调用点零改即编译绿）；体内按 locale 选 map（`locale === 'en' ? ERROR_MESSAGES_EN : ERROR_MESSAGES`·unknown code 回落 `upload_failed` 同构）；`resumeImageRefusedLocally`/`resumePreviewFormatRefused`/`mapResumeUploadAbort`（`:75/:79/:97`）同款增 locale 参；生产接线=唯一调用点 `resume/actions.ts:73` 读 locale cookie（`cookies().get('locale')`·server action 域合法）传参。最小 diff·`messages/*.json` 与 S3 allowlist 面零扰动。
- **案B 双语迁 messages namespace**（`resumeErrors.*` 入 en/zh.json·组件/Action 走 `getTranslations`）：S2 parity 面扩 20 键·调用链扰动大·不推荐。
- **伴生三件 zh 文案函数**（help text/card description/banner `:58-72`）归修法② messages 迁移面（非 en map 面）。

### 修法② 热库去硬编码 zh（hot 三件·A1 结构面收口）

- **范围=hot 三件恰（G-GAP-2 钉面 + backlog「热库」口径）**：`view-model.ts` / `ocr-preview-ui.ts` / `interview-state.ts`。**全仓 152 文件面=范围外**（§3-1）。
- **案A（推荐）labels 参 + zh.json 缺省 bundle**：文案迁 `messages/{zh,en}.json` 新 namespace（候选名 `interview` / `resumeUpload`·命名归 §8 裁决②）；lib 函数改「labels 参」形——`interviewDisplay(v, labels?)` / `signalConcludePracticeCopy(code, labels?)` / `resumeFileHelpText(ocrPreview, labels?)` 等（**labels 缺省 = lib 内 `import zh from '../messages/zh.json'` 取对应域**·`resolveJsonModule` 已开·纯函数可单测形不变）；**zh 缺省输出逐字节不变**（zh.json 值=现字面逐字誊·web-logic `:162/:480/:591` 与 public-copy `:290` **零改绿为验收线**·任何测试改动=越界即停回炉）；生产接线=客户端 `useInterviewStream.ts:78`（`interviewDisplay(view)` 全仓唯一生产调用点）经 `useTranslations` 取 labels 传入；服务端组件同形 `getTranslations`。zh 值经 messages 管道后·**en 侧同步可得 en 文案**（值 CJK-free）。
- **案B keys 返回 + 渲染层查表**：`interviewDisplay` 返回 message key·组件层翻译——纯函数签名破坏面大（Display 结构即消费契约）·不推荐。
- **interview-state.ts 恰 7 行全为行尾注释假阳性**（§0.1-6）——修法②扫描器口径收严后自动归零（见修法③扩面 S5）·**零文案迁移**·**注释文本零动**（禁为凑数改注释=Ban 列）。

### 修法③ Playwright locale=en DOM spec + 静态 prove 扩面（G-GAP-3 收口）

- **新 spec**：`apps/web/e2e-ui/uc003-i18n-locale.spec.ts`·test 名携 Grep 锚 **`UC003-I18N-locale-en`**（沿 `uc018-abandon.spec.ts:11/:70` 形制）。步骤：①context 预置 `locale=en` cookie（`context.addCookies`·cookie-only 契约·§8 裁决⑤）→ ②走 golden 形注册/登录 → `/resume` → 断言**本刀迁移区**（上传表单 help/banner 区 + 触发的校验错误消息区）DOM 文本 CJK **零残留** → ③触发一校验错误（空文件/超限上传→修法① en 错误文案断言=A2 DOM 面·NEG 负路径断言收口）→ ④`/login` 或落地页 en 渲染冒烟（既有 messages namespace 面）→ ⑤全页其余 chrome 残留**具名 allowlist**（Nav zh 字面标签等未迁移面·逐项清点计数**入收据=残留诚实登记**·不冒充全页 A1 已闭环；全页 A1=后续刀）。
- **静态 prove 扩面（同件 `uc-e2e-003-i18n-locale.proof.mjs` 改）**：
  - `G-GAP-error-code-en-map` → **S4**：断言 `ERROR_MESSAGES`/`ERROR_MESSAGES_EN` 键集 parity（20/20）+ en 值 CJK-free + `mapResumeUploadError` locale 参在场（`:99` 无参断言反转为有参断言）；
  - `G-GAP-hardcoded-zh-ui` → **S5**：扫描器口径收严（测前剥离行尾 `//` 注释·消除 interview-state 7 行尾注假阳性）后断言 hot 三件真文案行 **= 0**（现 `:121` 的 `cjkLines > 0` 在场断言反转为零断言）；
  - `G-GAP-dom-e2e-ui` → **G3'**：断言 `apps/web/e2e-ui/` 存在具名 `uc003-i18n-locale.spec.ts` 且含 locale cookie 预置 + DOM CJK 扫描 + 错误码 en 断言三要素（静态存在性·**≠ DOM 实跑绿**）；
  - S1–S3 原值零动；EXIT 语义零动（EXIT=0=结构绿≠covered·header 注记保留）。
- **UI 门注册（§8 裁决③落名）**：候选名 `uc003:i18n-locale-ui:prove` · 形制沿 `package.json:141` 先例：`E2E_UI_GREP=UC003-I18N-locale-en E2E_UI_PROJECT=chromium E2E_UI_SKIP_WORKER=1 node scripts/run-e2e-isolated.mjs e2e:ui`。**docker 隔离栈依赖如实申明**（`run-e2e-ui.mjs:46` 强制）——环境有 docker 则本刀内实跑 EXIT=0；环境缺 docker = spec 已落 + G3' 静态绿 + 「DOM 首跑收据 pending」残留诚实登记（**矩阵不动仍 partial**）。
- **spec typecheck 载体（§8 裁决④）**：e2e-ui 现不在任何 tsconfig include 面（§0.1-16）——推荐扩 `apps/web/tsconfig.json` include +`"e2e-ui/**/*"`（`@playwright/test` devDep 在位·小配置改·一行）。

---

## §2 验收断言候选（pre-exec 双审核对单基面·门预申明）

1. **门①（扩面 prove）**：`pnpm uc003:i18n-locale:prove` **EXIT=0**——S1–S3 原值绿 + S4/S5/G3' 新面绿；S4=20/20 键 parity + en 值零 CJK + locale 参在场；S5=hot 三件真文案行 **0**（剥离行尾注口径）；G3'=具名 spec 三要素在场。
2. **门②（web:prove·zh 缺省逐字节线）**：`pnpm web:prove` **EXIT=0**——web-logic 全臂原值·`:162` `'进度待同步'` 与 `:480/:591` `includes('重连')` 锚**零改绿**（tests 零 diff 断言：`git diff --exit-code apps/web/test/web-logic.proof.ts apps/web/test/public-copy.proof.mjs`）。
3. **门③（typecheck）**：`pnpm typecheck` **EXIT=0**（root `typecheck:e2e`）+ 若裁决④扩 include 则 `pnpm -C apps/web typecheck` **EXIT=0** 同绿。
4. **门④（docs:check）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0**（基线树亲跑现值 **2077 ≤ cap 2080**·本卷 +1 文件预期 **2078**）。
5. **附条件门⑤（public-copy）**：`pnpm -C apps/web prove:public-copy` **EXIT=0**（`:290` `requireText(resumeActions,'mapResumeUploadError',...)` 源名断言兼容性回归·修法①触其断言对象文件·必跑）。
6. **附条件门⑥（UI 实跑·docker 环境）**：`uc003:i18n-locale-ui:prove`（裁决③定名）**EXIT=0**；环境缺 docker=残留登记「spec 已落·首跑收据 pending」·**不得虚报 EXIT**。
7. **偏差熔断**：S5 计数若 ≠ 0 且差异源=非本刀触面新增 zh 字面 → 停（现场漂移）；S2 parity 若基线已 ≠145/145 → 停（基线漂移重 pin）；prove 若出现非本卷预申明的新 FAIL → 停（验收红不可修）。
8. **markers=0（§7）+ est live=0（§6）双声明入收据**；改面清点入收据（预期触面：`apps/web/lib/` 三件 + `apps/web/messages/{en,zh}.json` + `apps/web/app/resume/actions.ts` + `apps/web/lib/hooks/useInterviewStream.ts` + 消费组件若干 + `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` + 新 spec 一件 + 仓根 `package.json` 门注册 + 视裁决④ `apps/web/tsconfig.json`）。

---

## §3 范围外（边界清单·越界即 FAIL）

1. **全仓 zh 清扫**：152 文件 CJK 面（`rg -l` 实测）——本刀只 hot 三件（G-GAP-2 钉面+backlog `:32`「热库」口径·harness `:44` 明文非目标）；`lib/interview/progress.ts:18` `'进度待同步'` 等热三件外文案零触（DOM spec 以具名 allowlist 承其残留·§1-修法③）。
2. **Accept-Language 产品 wiring**：scenario `:105` 前半触发措辞 vs `request.ts:10-11` cookie-only 契约——本刀 spec 走 cookie 预置·**Ban 顺带改 i18n 管道 locale 源**（§8 裁决⑤）。
3. **模型产出语言跟随 locale**：归 ai-eval 轨（scenario `:108/:113`·fake-model 禁令）——本刀零触。
4. **矩阵/backlog/harness/eval 行翻面**：UC-E2E-003 stays **partial**（cite 绊线 `:735-738` 在位）·coveredCount=8 不变·翻面权归协调方——本刀 EXEC 不得改四卷 SSOT 行（可 append 执行注记沿先例）。
5. **迁移/DDL/新存储面**：零（迁移号预期 **零**·`packages/db/migrations/` 零新增零改）。
6. **既有 7 spec 与 playwright.config 零触**：golden/online-public/recruiting-bound/screenshots/stream-window/uc018-abandon/voice-duplex 零 diff·config projects/workers/timeout 零改（locale 断言在 spec 内 context 级）。
7. **API/worker/domain 产品面零触**：本刀纯 web 面 + test 面 + messages 面 + 门注册两行。
8. **web-logic/public-copy 测试文件零改**（§1-修法②硬约束·§2-2 git diff 断言）。

---

## §4 依赖

**零未决硬依赖**：①`next-intl ^4.13.0` 在位（`apps/web/package.json:42`）·messages 双语目录+管道+切换 action 全在位（§0.1-1/2/8/9）——无前置刀；②零迁移编号交点（零 DDL）；③`e2e:ui` LIVE 目标与 GREP/PROJECT/SKIP_WORKER 旋钮在位（`run-e2e-isolated.mjs:89`·`run-e2e-ui.mjs:222-227`）·uc018 先例在位（`package.json:141`）；④`@playwright/test ^1.61.1` devDep 在位·Chromium 本地可装；⑤既有 prove 基线（S1–S3 现绿·web-logic·public-copy）现成可复跑。**可选 UI 门**需 docker 隔离栈（如实申明·非本刀硬依赖·§1-修法③）。下游无硬闸。

---

## §5 Ban 列表 + pins

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT 行翻面（matrix/backlog/harness/eval/checklist/LEDGER 只读引用·翻面权归协调方·EXEC 注记 append 除外）；**Ban 写 covered**（矩阵 UC-E2E-003 stays partial·cite `:735-738` 绊线在位·三面收口≠全链路 E2E covered≠UC covered）；Ban 全仓 zh 清扫越界（§3-1·只 hot 三件）；Ban 动热三件外任何产品文案（progress.ts 等）；Ban 改 web-logic.proof.ts / public-copy.proof.mjs 凑绿（zh 缺省逐字节线·§2-2 git diff 断言·违者回炉重审）；Ban 动既有 7 个 e2e-ui spec 与 playwright.config（§3-6）；Ban 改 i18n locale 源管道（Accept-Language wiring=裁决⑤前禁止·§3-2）；Ban 触模型产出语言面与 fake-model 冒充（ai-eval 轨·§3-3）；Ban 新增迁移/DDL/新存储面/env 闸（§3-5）；Ban 为凑 S5 计数改注释文本（注释零动·扫描器口径收严为正途·§1-修法③）；Ban 顺带升级依赖包；Ban 伪造已问/已验来源。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全静态/本地 Chromium/隔离栈·零模型外呼·零消耗）

---

## §6 est live=0

本刀零模型真实外呼：门①静态 inventory（isolated 包装·静态体不读写 DB·harness `:52` 同口径）；门②/③/⑤本地 node/tsx；门④docs 静态扫描；门⑥（可选）本地 headless Chromium + docker 隔离 PG——零 MODEL_API_KEY·零 secrets·零生产操作·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

起草改动集=**恰 1 .md**（`ai-docs/delivery/harness/uc003-i18n-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。EXEC 预期改动集（web lib 三件/messages 双件/actions+hooks+组件接线/prove 同件/新 spec/门注册/视裁决④ tsconfig）五类标记词同扫零命中（不复抄卷内·沿 ttl-wire/authz-harden 卷 §7 同形制）。

---

## §8 STOP（开工三条款 + 裁决项）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（backlog `:32` 三残余 + 矩阵 P1-6 `:272` 在册承接·本卷非授权本身）；③EXEC 立项**不得改 §1-修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 0.2 四处锚勘误如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项（五项·各带推荐）**：

1. **修法①载体**：案A co-located `ERROR_MESSAGES_EN` + `mapResumeUploadError` 第三可选参（推荐——最小 diff·server action cookie 传参·S3 allowlist 零扰动） vs 案B 迁 messages namespace（S2 面扩 20 键·扰动大）。
2. **修法②机制与新 namespace 名**：案A labels 参 + zh.json 缺省 bundle（推荐——纯函数可单测形不变·zh 缺省输出逐字节不变硬约束可满足） vs 案B keys 返回渲染层查表；namespace 候选名 `interview` / `resumeUpload`（EXEC 定名后 S2/S3 断言面随之·名定即冻）；**zh 缺省逐字节线**（web-logic `:162/:480/:591` 零改绿）确认为本刀验收硬线。
3. **UI 门名与本刀内实跑口径**：门名候选 `uc003:i18n-locale-ui:prove`（沿 uc018:ui:prove 三旋钮形制·仓根 package.json 注册）·docker 可用则本刀内实跑 EXIT=0 入收据·缺 docker 则残留登记「spec 已落·首跑收据 pending」（**Ban 虚报 EXIT**·矩阵不动仍 partial）。
4. **spec typecheck 载体**：扩 `apps/web/tsconfig.json` include +`"e2e-ui/**/*"`（推荐·一行配置改·`@playwright/test` devDep 在位） vs 不扩（spec 无 typecheck 面·不推荐）。
5. **Accept-Language 面**：本刀申明 cookie-only 为现行产品契约（spec 走 cookie 预置·`i18n/request.ts:10-11` 零改）·Accept-Language wiring 登记 residual 另刀（推荐——locale 源管道改动=行为面越界） vs 本刀顺带 wire（**越界·不推荐**）。

---

*UC003-I18N REQUEST · 2026-10-14 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`ea6cd6a1`（全 hex `ea6cd6a141812221ba26d1b19bf531a16513d351`·pull --ff-only Already up to date 实测）· 分支 `line/uc003-i18n` · 工作树 `meetwise-uc003`（git worktree add 本起草席立·建前 worktree list+branch 双查不存在）· 立项出处=矩阵 P1-6 `:272` + §1.0.1 `:114` + §1.1 `:172` + backlog `:32` + harness G-GAP `:33-35` + eval BLOCKED `:53`（不自建 SSOT 行·翻面权归协调方）· 防重双对表过（harness 零同名卷·delivery rg EXIT=1）· 红事实三残余机证（ERROR_MESSAGES 20 键全 zh `:17-38`·mapResumeUploadError 无 locale 参 `:89-93`·hot 三件 CJK 字面行 35/25/7=67·e2e-ui 7 spec 零 locale 断言 rg EXIT=1·config 无 locale）· 锚勘误四处如实登记（eval 实径 receipts/archive·interview-state 7 行尾注假阳性·67 复刻实测·scenario Accept-Language vs cookie-only 契约差）· 修法三件（错误码 en map 案A/B 并陈·热库去硬编码 labels 参案A/B 并陈·zh 缺省逐字节硬线·Playwright locale=en spec+prove 扩面 S4/S5/G3'）· 零迁移·零 DDL·est live=0·markers=0·pins 十一值照抄零翻·门预申明四硬+两附条件·§8 五裁决项·⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
