# UC003X REQUEST — UC-E2E-003 简历域残面起草卷（NEG=gap + FAULT=blind + P1-6 locale=en DOM partial 残 · 批 A `NHP-003-ADV-01` 零重叠核 · docs-only REQUEST 卷·起草落卷即停）

**Status**: **`closed`**（2026-10-27 post 落卷收官翻面·并线刀形一卷收口·STOP 三处钉已闭：本 Status 行 + §8 + 卷尾注 同值 `closed`·前值史录零字洗：`draft:awaiting_pre_exec_dual`（2026-10-26 起草落卷）→ `executed:awaiting_post_prove_dual`（2026-10-27 EXEC 落卷·前置链=pre-exec dual r2 两独立外席双 PASS→协调方明示 EXEC 授权+N1b 形制裁决（**采 gap-register 形**：Case 1 EXIT=0·N1b 两码显式 gap 臂登记非 EXIT1·encrypted/magic_mismatch 产品契约缺口移交 backlog）→§9-EXEC 落卷）→ `closed`（同日 §9-post 双审双 PASS 会签·两独立外席·翻面权归协调方随令行使））· alone≠dual 已解（会签在卷 §9-post）· 本 commit 不预 claim 任何 covered 升格（EXIT0=case≠covered · coveredCount=8 零动）· 后继=并线席随令 fetch/merge/push/PR。

**席位**：UC-003 残面起草席（docs-only · 协调方总盘派单序第 13 项 R5/R6/R7 授权 · 认领 `e2e-requirement-coverage-matrix.md` §1.0.1 `:114` UC-E2E-003 行 NEG 格 gap + FAULT 格 blind + §1.0.2 `:174`/P1-6 `:274` locale=en DOM partial 残 · 与批 A 已落 ADV 面、各 UC 专属线行级互斥）。
**基线**：`origin/main` @ **`9c31c0ccc`**（full `9c31c0ccce2c5b7a82f80fa7dca332087491ad89` · `git fetch origin` 本 turn 成功 · 分支 `line/uc003x-draft` 零独有 commit · worktree `meetwise-uc003x`）· `node scripts/ai-docs/check-docs.mjs` 本树起草前亲跑 **EXIT=0 · scanned 2410**——**恰等 cap 2410 零余量**（`public-text-policy.mjs:171` `MAX_FILES=2_410` 亲证）· 本卷 REQUEST +1 必越 → **cap 恰等步进 2410→2411 已随刀落码**（§2-1 承登）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 / §1.0.1 `:114` / §1.0.2 `:174` / P1-6 `:274` / §1.0.3 `:166` 双表同步令）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（用例 SSOT·本刀 EXEC 补 §1.3 新行）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-E2E-003 `:101` A1/A2 验收 · TC-E2E-003-ui-en）→ 批 A 卷 `harness/nhp-batch-a-REQUEST.md`（Row 2 `NHP-003-ADV-01` §0.1/§1/§2 · 零重叠对面）→ 涉事机制源 `apps/api/src/modules/resume/resume.service.ts` / `apps/web/lib/resume/ocr-preview-ui.ts` / `apps/web/app/resume/actions.ts` / `apps/web/i18n/request.ts` / `apps/web/app/resume/ResumeUploadForms.tsx` → 既有 prove `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs`（S1–S6+G3'）· `apps/web/test/uc-e2e-003-nhp-adv.proof.ts`（批 A ADV 臂）· `apps/web/e2e-ui/uc003-i18n-locale.spec.ts`（DOM spec·UI 门先例收据 `receipts/uc003-followup/01-ui-live-rerun-wave78.log` 红→`02-ui-live-close-wave79.log` 绿）→ L-01 先例 `harness/micro-batch-REQUEST.md`（privacyPreview namespace 迁移形·已并主线 S6 在证）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①协调方派单令（总盘派单序第 13 项 R5/R6/R7 · docs-only 起草授权 · 「越限沿先例步进承登预授权」随令）；②`e2e-requirement-coverage-matrix.md` §1.0.1 `:114` UC-E2E-003 行 NEG=**gap**/FAULT=**blind** 残格 + §1.0.2 `:174` 分面行 partial（「Playwright DOM **降次/未接线**」措辞在卷）+ P1-6 `:274`（「仍缺 Playwright locale=en DOM」残面 SSOT）；③§1.0.3 `:166` 双表同步令（改行必同步双表 · 缺列=未完成 G2/G6）；④结构范本=`harness/nhp-batch-c-REQUEST.md`（§0–§9 形制 · closed 在树）。

---

## 残余盘点（UC-003 三面 · 本席逐格亲读 @`9c31c0ccc`）

| 面 | 矩阵锚（亲读行号） | 现值 | 本刀处置 |
|---|---|---|---|
| NEG | §1.0.1 `:114` 第 2 列 | **gap** | **认领 → Case 1 `NHP-003-NEG-01`**（API 上传链 NEG 码域 ↔ web en 映射链契约对账 · 离线纯函数+静态源对账 · 零 PG 零外呼） |
| FAULT | §1.0.1 `:114` 第 3 列 | **blind** | **薄缝如实定标**：i18n 静态管道故障注入=**零可测缝 NOT claimed**（§1.3）；client abort/timeout 薄缝 → 并入 Case 1 F1 臂（**FAULT 列不因 F1 翻动**·沿批 A「NEG 列不因 N-臂翻动」同纪律） |
| locale=en DOM | §1.0.2 `:174` + P1-6 `:274` | **partial**（「仍缺 Playwright locale=en DOM」） | **认领 → Case 2 `NHP-003-DOM-01`**（UI 门行使 `uc003:i18n-locale-ui:prove` 旋钮 + spec test-only 增 D1 本地拒 en 臂 · wave79 绿先例在树） |
| ADV | §1.0.1 `:114` 第 5 列 | blind/`case-only`（**批 A nail 已落 #144 merge 祖先亲证**） | **零重叠零触**（§0.3 对面锚亲证·Ban 互借） |
| BOUND | §1.0.1 `:114` 第 4 列 | **partial**（key parity） | 零触（S2/S4 既有 · Ban 借本刀收据 wash） |
| case-matrix | 全卷 204 行 | **零 NHP-003 行**（grep 亲证零命中·批 A ADV 行亦未登记=双表同步缺位如实登记·补行裁决权归协调方） | 本刀 EXEC 补 §1.3 两新行 `NHP-003-NEG-01`/`NHP-003-DOM-01`（批 A 缺行只登记不代补） |

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`9c31c0ccc`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **38 树**实测——`uc003x` 恰 **1** 命中=本席；`ai-docs/delivery/harness/` 落卷前**零 `uc003x-REQUEST.md`** → 落卷后唯一同名卷=本卷。
- UC-003 历史三线 `line/uc003-i18n` / `line/uc003-followup` / `line/uc003-arm4-filter` 各卷已收口在树（i18n/followup/arm4-filter REQUEST·followup closed `e48f64a5` nail 祖先亲证在卷）· **在飞零 UC-003 线**。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0 + cap 步进对 2 件（`public-text-policy.mjs`/`public-text-policy.proof.mjs`·派单预授权随令）；EXEC 期触面=两 case 新 proof/spec 增臂+注册行（root+apps/web package.json）+runner 注册位+双表行内改（矩阵 `:114/:174/:274` 邻区+case-matrix §1.3 两新行）。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树复核，任一分支顶对任一触面存在 `9c31c0ccc` 之后新增提交 → 触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `28048fce`（521） | **§1.0.1 `:114`（UC-E2E-003 · NEG gap+FAULT blind+BOUND partial+ADV blind/case-only 批 A nail）· §1.0.2 `:174`（i18n/locale 结构面 partial ·「Playwright DOM 降次/未接线」）· P1-6 `:274`（「仍缺 Playwright locale=en DOM + 错误码 en 产品映射」）** · §0.5 `:47-84`（covered 禁填 `:80`）· §1.0.3 `:166` 双表同步令 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `c71bf78b`（204） | **零 NHP-003 行**（`NHP-003` grep 亲证零命中）· §1.3 表=本刀 EXEC 补行落位 |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | —（UC-E2E-003 `:101`） | A2 验收「后端校验错误以 en 文案呈现（错误码→i18n 映射断言）」· A1 DOM 无中文残留（UI 框架文案）· TC-E2E-003-ui-en · 「模型产出语言跟随 locale」已移出 e2e（本刀零触） |
| `ai-docs/delivery/harness/nhp-batch-a-REQUEST.md` | `1a8a7977`（333） | Row 2 `NHP-003-ADV-01`（§0.1 `:81-87` / §1 `:115-120` / §2 `:154`）——**零重叠对面锚** |
| `apps/api/src/modules/resume/resume.service.ts` | `952482e5`（327） | **上传链 NEG 码域 18 码=16⊆20+encrypted/magic_mismatch 两码缺位（blob 级亲证·resume.service.ts:64/:68 两码 zh/en 全域零命中走 upload_failed 兜底·产品契约缺口如实预登记·backlog 移交协调方）**：`:40` 429 `too_many_requests` · `:47` 400 `empty_file` · `:48` 413 `file_too_large` · `:52` 503 `server_busy`（PARSE_MAX 缺省 6）· `:60` 415 `unsupported_file_format` · `:64` 422 `encrypted` · `:68` 422 `magic_mismatch` · `:74` 422 `parse_failed` · `:80` 400 `extracted_too_short` · `:81` 413 `extracted_too_long` · `:96` 422 `image_ocr_unavailable` · `:107/:214` 403 `consent_required` · `:112` 402 `insufficient_entitlement` · `:120` 409 `ocr_duplicate` · `:137` 422 `ocr_failed` · `:145` 422 `ocr_binding_missing` · `:158` 422 `ocr_binding_invalid` · `:165` 422 `ocr_no_content`（`:38-40` uploadGate 令牌桶 15/0.1 · `:44` uploadFile 门区起点 · 信封携 zh `message`/`hint`/`filename`/`format`/`requested`/`available`/`purpose`/`reason` 字段） |
| `apps/web/lib/resume/ocr-preview-ui.ts` | `2aa3bdb3`（144） | **action-error 映射单源**：`:19` zh `ERROR_MESSAGES` 20 键 · `:45` en `ERROR_MESSAGES_EN` 20 键 · `:68-70` `locale==='en'?EN:ZH` 二值 · `:123` `readResumeUploadErrorCode`（transcript 形忽略·空/非对象→`upload_failed`）· `:129` `mapResumeUploadError`（`:131` 413 状态优先 · `:133` `messages[error] ?? messages.upload_failed` fail-closed 回退）· `:137` `mapResumeUploadAbort` · `:142` `isUploadTimeoutError`（AbortError/TimeoutError）· `:8/:9` 超时常量 8s/35s · **web 侧独有 4 码**=`ocr_preview_format`/`public_preview_read_only`/`upload_timeout`/`upload_failed`（非上传链 API 产出） |
| `apps/web/app/resume/actions.ts` | `99878fe0`（171） | `:31-37` `UPLOAD_MESSAGES` 五键双语载体 · `:40-42` `resumeUploadLocale()`（cookie-only 契约）· `:89-93` `readUploadFailure`→映射单源 · `:113-136` `uploadResumeFileAction`（`:116` chooseFile · `:117` fileTooLarge · **`:119` `resumeImageRefusedLocally(locale)` 本地拒·DOM 可达** · `:120` `resumePreviewFormatRefused(locale)`·需 preview env · `:130` API 败臂→单源 · `:133` abort→`mapResumeUploadAbort`） |
| `apps/web/app/resume/ResumeUploadForms.tsx` | `9b6296f3`（92） | `:56` `<p id="resume-upload-error" role="alert">{message}</p>`——**action-error DOM 单源消费面** |
| `apps/web/i18n/request.ts` | `df8e06c1`（13） | `:6` `DEFAULT_LOCALE='zh'` · `:10-11` cookie allowlist `includes` 守卫（伪造 locale 回退默认·动态 import 无注入缝=FAULT 管道零缝依据） |
| `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` | `08ffaf9c`（312） | S4 `:102-156`（en map 20/20 parity+locale 参+五键双语载体·静态）· S6 `:217` `privacyPreview` 十键注册在证（L-01 已并主线）· **G3' `:194-202`「Static presence ≠ DOM green (UI gate runs separately)」=DOM 残面 SSOT 依据** |
| `apps/web/test/uc-e2e-003-nhp-adv.proof.ts` | `8a935fe3`（157） | 批 A 臂域：PC 20 码 en 目录 `:56-60`（合成极小信封 `{error:code}`·钉非回退+CJK-free·**零 exact 文案钉零真信封形零状态耦合**）· N1 `:63-73` · V1 未知码 `:76-92` · V2 伪造 locale `:95-107` · V3 对抗信封 `:110-135` · V4 413 状态优先 `:138-148` |
| `apps/web/test/web-logic.proof.ts` | `4a844308`（2171） | TC-RES-081-timeout `:765-775`：`isUploadTimeoutError` 三形分类+`mapResumeUploadAbort()` **zh 缺省单臂**——**en abort 面+locale 参显式形零命中=FAULT 薄缝空点亲证** |
| `apps/web/e2e-ui/uc003-i18n-locale.spec.ts` | `7ab1ffd1`（166） | `:24-25`「`:98/:99` local-refusal arms ARE reachable via setInputFiles·may strengthen en-DOM assertions in a later knife」（行号漂移现 `actions.ts:119/:120` 如实登记）· `:27` grep anchor `UC003-I18N-locale-en` · `:89` addCookies locale=en · `:124-134` 空文件臂 en DOM（`Please choose a file to upload`）· `:130` `#resume-upload-error` · `:141-165` 具名 allowlist 全页残留清点 · `:18-22` **DOM 不可达臂自钉**（API-response 臂 no-API-stub Ban·>8MB bodySizeLimit·delete 四臂） |
| `receipts/uc003-followup/01-ui-live-rerun-wave78.log` / `02-ui-live-close-wave79.log` | — | UI 门先例收据：wave78 **RUN_EXIT=1**（1 failed·红账留痕）→ wave79 **RUN_EXIT=0**（1 passed·allowlist 清点绿）——spec 可行使+红绿台账在树先例 |
| `package.json`（root） | `5d1f966a`（740） | `:147-148` `uc003:nhp-adv:prove`/`:raw`（批 A）· `:263-265` `uc003:i18n-locale:prove`/`:raw`/`uc003:i18n-locale-ui:prove`（**UI 门旋钮在树**：`E2E_UI_GREP=UC003-I18N-locale-en E2E_UI_PROJECT=chromium E2E_UI_SKIP_WORKER=1`→`run-e2e-isolated.mjs e2e:ui`·`LIVE_E2E_TARGETS` 含 `e2e:ui`） |
| `scripts/ai-docs/public-text-policy.mjs` | 落卷 blob 见 diff | `:171`-区 `MAX_FILES` **2410→2411 已随刀落码**（§2-1）+ 注记两行 |

### 0.2 认领格登记（行号+现值·亲读逐字）

| 锚 | 现值（亲读） | 本刀补 | 零重叠核 |
|---|---|---|---|
| §1.0.1 `:114` NEG 格 | **`gap`** | Case 1 NEG 主面·N1 源→map 键域=**16⊆20+encrypted/magic_mismatch 两码缺位（blob 级亲证·resume.service.ts:64/:68 两码 zh/en 全域零命中走 upload_failed 兜底·产品契约缺口如实预登记·backlog 移交协调方）**（gap→case-only 措辞仅经 EXEC·EXIT0=case≠covered） | 批 A ADV=纯函数**对抗健壮性**（伪造码/伪造 locale/对抗信封/413 优先·合成极小信封·零 exact 文案钉）；Case 1=**契约符合性**（API 码域对账+真信封逐字+真状态耦合+exact en 文案钉）——臂面 reason 级可分 |
| §1.0.1 `:114` FAULT 格 | **`blind`** | F1 薄臂并入 Case 1（列措辞不动·blind 保持） | 批 A 零 abort/timeout 臂；web-logic 仅 zh 缺省单臂——en abort 面=新证据点非重铺 |
| §1.0.1 `:114` ADV 格 | blind/`case-only`（批 A nail） | **零触** | 本刀零 ADV 臂·Ban 互借（批 A 收据不入本刀列） |
| §1.0.2 `:174` + P1-6 `:274` | partial（DOM 降次/未接线·仍缺 locale=en DOM） | Case 2 UI 门行使+D1 增臂（措辞翻面权归协调方） | 批 A D3 钉「A1 DOM 残留扫描不重铺（Playwright 降次未接线照旧）」=批 A 自认 DOM 面未行使——Case 2 恰为其留后刀面 |

---

## §1 修法（两 case · 一行两面各一 case · 零产品码触 · 零 invent covered · 零 live key）

**修法形状**（沿批 A uc003 case + uc003-i18n UI 门先例）：Case 1 = 新 proof 文件（`apps/web/test/uc-e2e-003-nhp-neg.proof.ts` · 离线纯函数+静态源对账 · 零 PG 零外呼零 key·`env -u` 三键具名：`MODEL_API_KEY`/`DASHSCOPE_API_KEY`/`DASHSCOPE_COMPAT_BASE_URL`）+ root `package.json` `uc003:nhp-neg:prove`/`:raw` 双行 + apps/web `prove:uc003-nhp-neg` 一行 + runner 注册位（SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 四位全登记·批 A 第四位教训承登）；Case 2 = 既有 spec **test-only 增 D1 臂**（`apps/web/e2e-ui/uc003-i18n-locale.spec.ts` 零产品码）+ 既有 UI 门旋钮行使（零新注册位·`e2e:ui` 已在 `LIVE_E2E_TARGETS`）。收据 `.tmp/<case>-receipts/` + tracked `ai-docs/delivery/receipts/<case>/`（implementer pre-commit runs · **not evidence of record**）。行状态/列状态一字不动：EXIT0=case≠covered · coveredCount=8 不变 · 升格仅经 coordinator nail。

### Case 1 · `NHP-003-NEG-01`（UC-003 · NEG 主面 + F1 FAULT 薄臂）

- **需求源**：`e2e-scenarios.md:101` A2「后端校验错误以 en 文案呈现（错误码→i18n 映射断言）」——NEG 格 gap 的可测面=**API 上传链 NEG 产出码域与 web 映射链的契约符合性**（供给侧全域对账+真信封形），非批 A 的对抗健壮性重铺。
- **证据层**：离线纯函数行使（映射单源 `2aa3bdb3`）+ 静态源对账（`resume.service.ts` 信封字面源读）——零 PG 零外呼（沿批 A 同壳）。
- **臂**：
  - **N1 契约对账臂（源→map 键域·两段形）**：源扫 `resume.service.ts` 上传链 HttpException `error:` 字面 → **18 码枚举**（§0.1 锚表逐字）——**方法级 scope 钉=uploadFile/uploadImageViaOcr/uploadInTransaction 三方法门区**（`:44`/`:95`/`:206`·**排除 `not_found_or_forbidden` list/get/delete 面** `:257/:298/:305/:320/:323`=非上传链产出零入扫）；web 侧独有 4 码（`ocr_preview_format`/`public_preview_read_only`/`upload_timeout`/`upload_failed`）如实披露为 web/守卫/兜底面非 API 产出。两段：
    - **N1a 已映射段（16 码·绿断言）**：16 码逐码断言 ∈ zh map 键 ∧ ∈ en map 键（`ERROR_MESSAGES`/`ERROR_MESSAGES_EN` 各 20 键·双侧）——**16⊆20 亲证成立=本段绿**（方向钉死=API⊆map·API 新增码缺映射即本段红=契约缺口诚实暴露）。
    - **N1b 缺位段（2 码·显式 gap 臂）**：`encrypted`（`:64` 422）/`magic_mismatch`（`:68` 422）断言 ∉ map（zh/en 双侧零键·blob 级亲证）——**产品契约缺口如实预登记·backlog 移交协调方**（§8 纪律预申报形·形制留协调方裁决）。
  - **N2 真信封逐字臂**：真信封形（zh `message`/`hint` 等字段**逐字 pin 自 resume.service `:40-:165`+`:214`**·blob 锚钉）× `locale='en'` 分两形——**16 已映射码=exact en 文案钉**（`ERROR_MESSAGES_EN` 对应值全等比较·非批 A 的非回退+CJK-free 弱断言）；**2 缺位码（`encrypted`/`magic_mismatch`）=fallback 形臂**（`error` 码透传+`message`=upload_failed en 逐字+CJK-free·`ocr-preview-ui.ts:133` fail-closed 路径）+ **zh `message`/`hint` 字段零透传**（两形结果串 CJK-free·en 用户面零 zh 泄漏）。
  - **N3 状态耦合臂**：真实状态↔码配对行使（429→`too_many_requests` · 503→`server_busy` · 415→`unsupported_file_format` · 422→`encrypted`/`magic_mismatch`/`parse_failed`/OCR 族 · 403→`consent_required` · 402→`insufficient_entitlement` · 409→`ocr_duplicate` · 400 族 · 413 族）——批 A 仅铺 413 状态优先（V4），本臂铺全状态域。
  - **N4 zh 对照子臂**：抽样真信封 × zh → zh 文案（对照 · 列不翻纪律同批 A N1）。
  - **F1 FAULT 薄臂**：合成 `AbortError`/`TimeoutError` 故障注入形 → `isUploadTimeoutError` 三形分类（含非超时 `Error('network')` 负判）+ `mapResumeUploadAbort('en')` → **en `upload_timeout` 文案 exact 钉+CJK-free** + `('zh')` zh 对照 + 超时常量关系（35s>8s·`web-logic:765-775` zh 缺省臂旁证零改动互不替代）——**FAULT 列不因 F1 翻动（blind 保持·薄缝首行使非列翻面）**。
- **非替代申明**：批 A `NHP-003-ADV-01`（对抗健壮性）· web-logic TC-RES-081（zh 缺省面）· 静态 S4（map 内部 parity）=旁证互不替代 · Ban 互借关列 · **Ban 借本 case 收据洗 UC-015/批 C ADV 列**（注入机械同形臂本刀零取·§1.3）。

### Case 2 · `NHP-003-DOM-01`（UC-003 · locale=en DOM 残面 · P1-6 `:274`）

- **需求源**：P1-6 `:274`「仍缺 Playwright locale=en DOM」+ `:174`「Playwright DOM 降次/未接线」+ spec `:24-25` 预登可达臂 + G3'「Static presence ≠ DOM green」——**en 渲染断言可行使性已亲证**：UI 门旋钮在树（root `:265`）· wave79 绿先例收据在树 · spec 既有 en DOM 臂（空文件臂 `:124-134`）绿形在证。
- **证据层**：production Next + 真隔离栈 + Playwright chromium（`uc003:i18n-locale-ui:prove` 既有旋钮 · 零新注册位）。
- **臂**：**D0 既有 spec 零改动复跑**=回归基（迁移区三点 CJK 零残留+空文件臂 en+`/login` en smoke+具名 allowlist 残留清点·清点清单入收据）；**D1 本地拒 en 臂（test-only 新增）**：非 preview env `setInputFiles` png → `actions.ts:119` `resumeImageRefusedLocally(locale)` → `#resume-upload-error`（role=alert·`ResumeUploadForms.tsx:56` DOM 单源）渲染 en `image_ocr_unavailable` 文案——**exact en 文案钉+CJK-free+`error` 码透传断言**（action-error 映射单源→DOM 全链首行使）。
- **DOM 不可达臂如实登记（NOT claimed·spec `:18-22` 自钉）**：mapResumeUploadError API-response 臂（no-API-stub Ban——其 en 面由 Case 1 N2 纯函数承接·非 DOM）· >8MB 臂（Server Action bodySizeLimit 前置拦截）· delete 四臂（happy path 不触发）· **D2 preview-format 臂（`actions.ts:120`）需 OCR preview env 接线=首刀 NOT claimed**（§1.3·留后刀）。
- **非替代申明**：静态 S 锚（G3' spec 存在性）≠ DOM 绿 · wave79 历史收据=先例非本刀 evidence of record · 本刀收据=EXEC 届时 fresh 行使。

---

## §1.3 否决表（落选/NOT claimed 如实留痕）

| 落选项 | 否决/登记理由 |
|---|---|
| **FAULT i18n 静态管道故障注入面** | **零可测缝 NOT claimed**：messages 系构建期 bundle（`import zhJson`/动态 `import(../messages/${locale}.json)`·locale allowlist `request.ts:10-11` 堵 import 注入）· 零运行时资源 fetch/加载失败缝——无断言可造不硬造（批 A「静态管道故障面薄·留后刀」侦察的本席收口定标）。FAULT 认领面收窄至 client abort/timeout 薄缝（F1·映射层非管道层·如实切面）。 |
| Case 1 运行级 API NEG 注入（isolated 真 PG 真 HTTP 重铺 429 突发/503 解析槽/魔数） | 与批 C `NHP-015-ADV-01` 已落主线臂注入机械同形（wash 风险）+ Case 1 离线契约面已闭合 A2 映射域 → 本刀不取（ Ban 借重铺洗两列）。 |
| **encrypted/magic_mismatch 映射补齐（web 侧 map 增键）** | 产品码修复出本刀界（本刀 test-only 零产品码触·§3-1）——N1b 显式 gap 臂如实预登记·backlog 移交协调方。 |
| D2 preview-format DOM 臂 | 需 web 进程 `OCR_ENABLED=1`+`OCR_PREVIEW=1` env 接线（runner 旋钮面）→ 首刀 NOT claimed 留后刀。 |
| BOUND 列 / S2-S6 静态面重铺 | 零触（partial=key parity 既有·Ban 借本刀收据 wash）。 |
| spec allowlist 11 具名 zh 残面迁移（navHardcodedLabels/resumePageHeader 等） | 产品码 namespace 迁移域（L-01 privacyPreview 先例形可循）——出本刀 test-only 界 · 留后刀独立裁量。 |
| en map 20 键逐码 CJK-free 重铺 | 批 A PC `:56-60` 已铺 · Ban 重复。 |
| 模型产出语言跟随 locale | `e2e-scenarios.md:101` 测试层纠偏已移出 e2e → 归 ai-eval · 零触。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准**）

1. **docs:check（红停条款）+ cap 预算核（亲算·承登）**：起草前本树亲跑 **EXIT=0 · scanned 2410 = cap 2410 恰等零余量**（`public-text-policy.mjs:171` 亲证）→ 本卷 +1 必越 → **cap 恰等步进 2410→2411 随刀落码**（`MAX_FILES=2_411`+注记三行·**pay-neg #155 单件恰等先例形·三十先例形链**·协调方派单预授权「越限沿先例步进承登预授权」随令）；越限臂联动同步 `public-text-policy.proof.mjs`（fabricated 数 2_411 + atCap 2_411 + `f-2411.md` + `PTP_FILE_LIMIT:2412`·CAP-SANCTION-2411 注记块）——本树亲跑 **12/12 EXIT=0**；落卷后 docs:check 预期 **scanned 2411 ≤ 2411 恰等**（落卷前实测见 commit 前 gate 复跑·如实录值）。若 EXEC 期在飞并线使届时 scanned+X > 2411 → 触「验收红不可修」停手上报（Ban 就地改 cap·届时按届值重算走协调方）。
2. **markers 五类零命中 + est live=0**：本刀改动集（REQUEST+cap 步进对 3 tracked 路径）五类标记词+行首冲突标记 grep 零命中（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:159-163`·不复抄卷内防自指·回执入 commit 前 gate 复跑）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat origin/main` **恰 3 tracked 路径**=本卷 REQUEST（新件）+ `scripts/ai-docs/public-text-policy.mjs`（cap 行+注记）+ `scripts/ai-docs/public-text-policy.proof.mjs`（越限臂联动）——cap 步进对系派单预授权随令件如实登记；EXEC 期 diff 面=Case 1 proof 新件+Case 2 spec test-only 增臂+注册行（root/apps/web package.json）+runner 注册位（Case 1 四位·Case 2 零新注册如实核）+双表行内改（矩阵 `:114/:174/:274` 邻区+case-matrix §1.3 两新行）+收据 tracked 面——届时逐件登记·多任何未登记 tracked 路径即停。
4. **EXEC 预基面（届时重 pin·两 case EXIT 分列）**：**Case 2 EXIT=0 恒立**——D0 复跑+D1 增臂 prove EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）+收据含 UI 门 CMD+RUN_EXIT+D0/D1 臂名+allowlist 清点附件（缺任一=门红）；**Case 1 EXIT 视 N1 定形**——N1a 16 码已映射段绿断言成立为 EXIT=0 前提（双 fresh 同上）·N1b 缺位 gap 臂形制留协调方裁决·EXIT 口径随裁决（§1 两段形）；邻面不回退（`uc003:i18n-locale:prove` / `uc003:nhp-adv:prove` / `web:prove` 按届时 SSOT 口径恒等）；双表同步 diff 逐件登记（§1.0.3 `:166` 令）；任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:114` NEG 格措辞仅 gap→`case-only` 化（FAULT 格 blind 保持·ADV/BOUND 格零触）· `:174`/`:274` 仅 additive 收据注记（「降次/未接线」措辞翻面权归协调方）· case-matrix 仅 §1.3 两新行 · coveredCount=8 零翻转 · Ban 借两 case 收据互 wash（NEG≠FAULT≠DOM 互不替代）。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test proof + spec test-only 增臂 + 注册行/runner 注册位——Case 2 spec 系 test 资产非产品源·如实归类）。
2. **批 A/批 B/批 C/UC 专属线触面零触**：批 A `NHP-003-ADV-01` 三 proof+收据+注册行 · 矩阵他行 · `uc003-i18n/followup/arm4-filter` 历史卷面——只读；`provider-egress-inventory.json` 若 Case 1 词面出现模型钥名按先例形 additive 登记（离线纯函数预期零词面=零登记臂形·届时如实核）。
3. **其余 §1.0 行零触**（§1.3 落选行全只读）· **共享 SSOT 零改**（REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读——批 A case-matrix 缺行补登只登记不代补·裁决权归协调方）· **covered/queue 翻面零预支** · **零迁移零配置**（超时常量/OCR env 零改·`RESUME_PARSE_MAX` 类 env 本刀零用）。

## §4 依赖

**①上游已满足**：两 case 证据层全在树（§0.1 blob 亲算）· UI 门旋钮+绿先例收据在树 · L-01 privacyPreview 先例形已并主线（S6 在证）。**②同文件并发**：起草 turn 恰 1 新 .md+cap 步进对 2 件零交涉面；EXEC 期触矩阵 `:114/:174/:274` 邻区+case-matrix §1.3——§0.0 在飞交叠复核必做。**③下游**：两行收据供 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评）；批 A case-matrix 缺行观察项移交协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·Ban 改断言迁就——Case 2 沿 wave78 红账先例如实留痕）；Ban invent covered（含升格 partial/借旁证 wash/实例宣伞）；Ban live key（零 Key 面硬跑）；Ban 触批 A/批 B/批 C/UC 专属线触面与其余 §1.0 行；Ban 触产品码面/迁移/CI 告警配置/cap 值（本刀恰等步进已随令落码·再越限停手上报）；Ban 改共享 SSOT；Ban 触既有 proof 文件（`uc-e2e-003-nhp-adv.proof.ts`/`uc-e2e-003-i18n-locale.proof.mjs`/`web-logic.proof.ts` 零触只读；spec 增臂=Case 2 唯一例外·test-only·既有臂零改动）；Ban 裸断言迁就（exact 文案钉以 `2aa3bdb3` 现值为准·map 改值须回炉重 pin 非 Ban 改断言跟跑）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包；Ban 借 Case 1 收据宣 UC-015/批 C 面加强（§1.3）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（docs-only+cap 步进对·policy proof 系 fixture 内合成路径计数零树写）。EXEC 期：Case 1 离线零外呼；Case 2 UI 门走本地隔离栈 production Next+chromium · 零模型零 Key（`E2E_UI_SKIP_WORKER=1`· golden-form 本地 signup 链）· 零生产操作。**post errata 注记（2026-10-27 §9-post P2-D·additive）**：Case 2 UI 门 Key 通道=loader 方式 b 同 shell env 注入（`~/.meetwise-secrets/load-model-api-key.sh`·零 .env 落盘·零 Key 值入树入据）——「零 Key」准出口径=零 Key 落树/落据/落 .env + 零模型外呼（`E2E_UI_SKIP_WORKER=1`）· est live=0 不变。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md + cap 步进对 2 件·起草 turn）五类标记词 + conflict-marker grep **零命中**（起草席 commit 前亲跑·词面运行时组装口径·不复抄卷内防自匹配——沿批 B/C §7 同形制）。

## §8 STOP · **`closed`**（2026-10-27 post 落卷三处翻面·三处钉：本节 + Status 头 + 卷尾注·前值史录零字洗：`executed:awaiting_post_prove_dual`（2026-10-27 EXEC 落卷翻面·开工三条款已履行：①pre-exec dual r2 两独立外席双 PASS 在前 ②协调方明示 EXEC 授权+N1b gap-register 形制裁决随令 ③§1 修法面/§5 Ban/pins/§1.3 否决面零改动+§0 对开工 tip `09363e8fb` 全量重 pin（§9.0·机制源零漂·文档锚漂移如实更）· 再前值 `draft:awaiting_pre_exec_dual`））· post-prove 双审两独立外席双 PASS 会签已落卷 §9-post（席1 attempts 台账机证+断言实质复算 129=9+6+32+8+33+19+8+9+5+九门独立复跑全对·P2×2 · 席2 契约面独立推演 19 抛点/18 码独立划界+N1b fail-closed 真行使非空洞+Case 1 复跑 129/129 fresh 双形+Case 2 loader 通道复跑 14/14·P2×2 含 Case 2 复证须 loader 通道前提注）· P2 errata 三件随卷（§9P.3·非阻断）· 后继=并线席随令 fetch/merge/push/PR（停止条件四类仍对各在飞 step 适用·命中即停手上报·Ban 就地处置）

停止条件（四类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（`:114/:174/:274` 行被他刀改写 · 映射单源 20 键域/门区 18 码域漂移 · UI 门旋钮/`e2e:ui` LIVE 路径漂移 · spec `:24-25` 可达声明失效）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期臂收据与 §1 推定形不符（如 API 码∉map=N1 契约缺口红 · 真信封 en 文案非 exact/zh hint 透传 · 413 状态优先消失 · D1 本地拒 en 臂 DOM 不可达）→ 根因诊断被证伪 → 停·如实升级（**产品契约缺口=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：修法诉求超出 §1 恰 2 case 面（需触产品码/批 A 触面/covered 翻面/共享 SSOT/迁移/cap 再步进）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check >2411 / `uc003:i18n-locale:prove`/`uc003:nhp-adv:prove`/`web:prove` 邻面新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（起草落卷即停 · pre-exec 双审未行使 · alone≠dual）· 后续=pre-exec 双审 → 协调方 EXEC 授权 → EXEC 落卷（两 case+双表同步+收据）→ post-prove 双审 → 翻面权归协调方。卷 draft ≠ covered ≠ 矩阵列升格（coveredCount=8 零动 · EXIT0=case≠covered）· est live=0 · markers=0（commit 前 gate 复跑回执）。

---

## §9-EXEC 落卷（2026-10-27 EXEC 席·协调方授权行使·pre-exec dual r2 双 PASS 在前·N1b gap-register 形制裁决随令·两 case 断言/门矩阵 EXIT 原值/重 pin 落点/attempts 台账如实全录）

### 9.0 立项并线与全量重 pin（§8 ③履行·届值如实采）

- **并线**：`git fetch origin` EXIT=0 · 届值 origin/main **`5356fa8c5`**（#156 pay-neg/#157 裁定排期/#158 rowcut/#159 webhook-neg 四线已并·派单届值「#156-#159 已并」逐值恰等）· merge **`09363e8fb`**（两 policy .mjs 双改冲突→dual-keep 注记双留+**cap 取大 2413→2415 union 恰等步进**随协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」·CAP-SANCTION-2415 承登两 .mjs 随 merge 落值·越限臂 2_415/2416/`f-2415.md` 联动·本刀 EXEC 面 Case 1 proof 1 件受管+本卷 REQUEST 1 件并入·stdout 收据 .log 非扫描面不计·Case 2 spec test-only 增臂零新件）· `pnpm install --frozen-lockfile` **EXIT=0**（544ms·lockfile 零漂亲证）。
- **§0.0 在飞交叠复核**：worktree list `uc003x` 恰 1 命中=本席·并线届值后 §0.0 登记在飞线全部收官并在 main——零未决在飞交叠。
- **§0.1 blob 锚重 pin（开工 tip `09363e8fb` 亲算）**：机制源**零漂**——resume.service `952482e5`/ocr-preview-ui `2aa3bdb3`/actions `99878fe0`/ResumeUploadForms `9b6296f3`/request.ts `df8e06c1`/i18n-locale proof `08ffaf9c`/批 A proof `8a935fe3`/web-logic `4a844308`/spec `7ab1ffd1`（D1 增臂前·本刀唯一触点=test-only 增臂）/e2e-scenarios `9976f9c3`（UC-E2E-003 `:101`）与 §0.1 逐值恰等=停止条件未触发；**文档锚漂移如实更**：矩阵 `28048fce`→**`45dc5c39`**（521 行同·§1.0.1 `:114`/§1.0.2 `:174`/P1-6 `:274`/§1.0.3 `:166` 四锚全未漂——#157-#159 改写他行与本刀锚区零行级交叠）· case-matrix `c71bf78b`→**`9ac7cd7d`**（204→206 行·§1.3 `:85`·零 NHP-003 行复核成立）· root package.json `5d1f966a`→**`c0552909`**（740→746：#156-#159 行并入+本刀 `uc003:nhp-neg` 双行）· policy **`401179ec`**（`MAX_FILES=2_415`）· policy proof **`5fb94f6b`**（越限臂联动已同步）。

### 9.1 egress+两 case 落码与门矩阵亲跑（EXIT 原值·stdout 留痕）

- **egress（零登记臂形履行）**：新 proof 零词面亲证——MODEL_API_KEY/DASHSCOPE_API_KEY/DASHSCOPE_COMPAT_BASE_URL 三键 grep **0 命中**+`process.env`/`import.meta.env` 0+postgres/Pool/DATABASE_URL 0+`fetch(` 0 · `provider-egress:inventory` **EXIT=0 · environment_references=376 届值恒等零新增**（零登记臂形·receipt `.tmp/uc003x-neg-receipts/14`）· `provider-egress:prove` EXIT=0。
- **NHP-003-NEG-01**（`apps/web/test/uc-e2e-003-nhp-neg.proof.ts`·`pnpm uc003:nhp-neg:prove`）：**EXIT=0 · 129 断言全绿·双 fresh**（终形 raw+runner gate 各一次·LOCAL_ISOLATED_PROOF_RECEIPT 在 `.tmp`）· 前置锚 9（scope 四方法标记+uploadGate 令牌桶 15/0.1+两 map 恰 20 键+20/20 parity+en 20 值 CJK-free）· N1 源扫 6（18 码枚举恰等+consent_required ×2+not_found_or_forbidden 排除+web 独有 4 码排除）· N1a 32（16 码×∈zh∧∈en）· N1b 8（2 码×∉双键+fail-closed 兜底 en/zh 双面·**gap-register 形：非 EXIT1·零断言放宽·产品契约缺口 backlog 移交协调方**）· N2 33（16 码 exact en（extracted_too_long 双面：真路由 413 状态优先+map 本值非 413 状态面）+全 CJK-free+zh hint 零透传×10+缺位 2×2+readResumeUploadErrorCode 18 码透传）· N3 19（16 状态↔码配对+413 族 3：状态优先/状态先于 body 码/非 413 负对照）· N4 8（六码 zh exact（extracted_too_long 双面）+en/zh 两形可分）· F1 9（三形分类+非 Error 负判+en exact 钉+CJK-free+zh 对照+8s/35s 常量关系）· D1-PF 5（Case 2 支撑·`resumeImageRefusedLocally` error 码透传落纯函数层·r2 P2-4）· tracked receipt `ai-docs/delivery/receipts/nhp-003-neg-01/01-gate-uc003-nhp-neg.stdout.log`。
- **NHP-003-DOM-01**（spec test-only 增 D1 臂·既有臂零改动·`pnpm uc003:i18n-locale-ui:prove`）：**EXIT=0 双 fresh**（1 passed 1.7s+2.7s·chromium·grep `UC003-I18N-locale-en`）· D0 复跑=迁移区三点 CJK 零残留+空文件臂 en+`/login` en smoke+具名 allowlist 清点 **14 nodes 全 allowlisted（双 fresh 一致）**· D1=非 preview env `setInputFiles` png→`actions.ts:119` `resumeImageRefusedLocally('en')`→`#resume-upload-error`（role=alert）en `image_ocr_unavailable` 文案 `toHaveText` exact 钉+CJK-free（**DOM 层仅 message·error 码透传断言落 Case 1 D1-PF 纯函数层·r2 P2-4**）· Key 通道=**loader 方式 b 同 shell env 注入**（`~/.meetwise-secrets/load-model-api-key.sh`·零 .env 落盘·`E2E_UI_SKIP_WORKER=1` 零模型零外呼·est live=0）· tracked receipt `ai-docs/delivery/receipts/nhp-003-dom-01/01-gate-uc003-i18n-locale-ui.stdout.log`。
- **attempts 台账（红次如实全录·Ban retry-to-green 承守）**：Case 1 **attempt1 红=源读 ENOENT 路径形**（`../../../api` 少一层·纯路径修复零断言变）· **attempt2 红×2=N2/N4 extracted_too_long 真信封@413 走 `:131` 状态优先真路由=file_too_large 文案**（测试设计与真行为未对齐·非产品红·根因=REQUEST N3「413 状态优先真行为如实行使」在 N2 真信封臂的同码投影）→修复=**双面拆分**（真路由面+map 本值非 413 状态面各 exact 钉·断言 127→129 只增不减·零谓词放宽）· attempt3 绿 129/129 · 终形 Map 形转换（lint 形修复·键值对数组避 object literal naming 噪声·同字符串同比较）后 raw+runner 复跑双绿 129/129（零断言谓词变）。Case 2 首跑绿 attempts=1。
- **邻面不回退（§2-4）**：`uc003:i18n-locale:prove` **EXIT=0**（静态 S 面·`.tmp/…/05`）· `uc003:nhp-adv:prove` **EXIT=0 · 67 断言**（批 A ADV 面·`06`）· `web:prove`（web-logic.proof）**EXIT=0**（TC-RES-081 zh 缺省臂零触·`07`）——三邻面恒等绿零回退。
- **机检面**：`pnpm -C apps/web typecheck` **EXIT=0**（含新 proof+spec 增臂）· `pnpm -C apps/web lint` **EXIT=0 · 601 warnings 恰等**（`--max-warnings 601`·新 proof Map 形零 warning·D1 臂零 warning·UI 门 `next build` 副产物 `apps/web/.next` 已清场后终验·构建产物非 lint 扫描源面承登）· PTP proof **EXIT=0 · 12/12**（cap 2415 越限臂联动）· docs:check **EXIT=0 · scanned 2415 恰等**（commit 前终跑）· markers 五类+冲突标记 grep 改动集**零命中**（运行时组装口径 `i6-239-gates.proof.mjs:159-163` 承形·零字面复抄）· diff 面亲读：Case 1 proof 新件+Case 2 spec test-only 增臂+注册行（root+apps/web package.json）+runner 三位注册（批 A `uc003:nhp-adv` 同壳同三位·位4 pre-migrate 非 PG 隔离面不适用承登）+双表行内改+REQUEST 三处翻+§9-EXEC+tracked 收据两件 .log（非扫描面）· **产品源 `apps/*/src`/`packages/*/src` 零 diff 亲证**。

### 9.2 双表同步（§1.0.3 令）+ 范围外核

- 矩阵 §1.0.1 `:114` NEG 格 **gap→case-only 化**+收据注记（N1b 产品契约缺口如实登记）·FAULT 格 **blind 保持**+F1 薄臂注记（列值不动）·BOUND/ADV/末列零触 · §1.0.2 `:174` 工具列 additive 注记+EXEC tip 注记（「降次/未接线」措辞零动）· P1-6 `:274` additive 注记（「仍缺」措辞零动）· case-matrix §1.3 `:99` 邻区两新行 `NHP-003-NEG-01`/`NHP-003-DOM-01`（gap→case-only/case-only·face 值 partial 保持·邻区 additive 零触既有行）· **coveredCount=8 零翻转**。
- pins 十一值零翻转（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · **coveredCount=8** · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null）· N1b encrypted/magic_mismatch 产品契约缺口=**backlog 移交协调方**（共享 SSOT `gap-bug-backlog` 零触只读·§3-2）· 批 A/批 B/批 C/UC 专属线触面零触（只读旁证亲证）· 零迁移零配置零 .env 触· est live=0（Case 1 离线零外呼零模型零 Key 加载·Case 2 本地隔离栈 `E2E_UI_SKIP_WORKER=1` 零模型·Key 通道 loader 方式 b 同 shell 注入零落盘）· ⛔push。
- **post 输入**：§9-EXEC 两 case 门矩阵全绿在卷（三处钉 `executed:awaiting_post_prove_dual`·待 post-prove 双审两独立外席·alone≠dual）→ 双 PASS 会签 → 三处钉（Status 头+§8+卷尾注）翻终态；stdout 全痕目录 `.tmp/uc003x-neg-receipts/`（raw 三形态+runner 双次+UI 门双 fresh+邻面三门+typecheck/lint 双轮+egress 门+PTP 门）+`.tmp/isolated-proof-receipts/`（fresh 收据·gitignored 本地证据）。

---

## §9-post 落卷（2026-10-27 post-prove 双审两独立外席·双 PASS 会签·三处钉随本节同拍翻 `closed`·并线刀钉形·原值史录不洗）

### 9P.1 席1（post-prove 独立外席·attempts 台账机证+断言实质复算+九门独立复跑）— **PASS**

- **attempts 台账机证（127 由红次收据自身证实）**：`.tmp/uc003x-neg-receipts/` 逐件亲读——`01-raw-attempt1.stdout.log` EXIT=1 `ENOENT .../api/src/modules/resume/resume.service.ts`（源读路径形·纯路径修复零断言变）· `01-raw-attempt2.stdout.log` EXIT=1 尾行 **`✗ 2/127 NHP-003-NEG-01 断言失败`**——**红次收据自身计数=127**（断言基线 127 由红收据机证·非 §9.1 单方口径）· `01-raw-attempt3.stdout.log` 绿 `129/129` · `10-raw-attempt4-mapform.stdout.log` EXIT=0 `129/129`——**127→129 只增不减由红/绿收据对读机证**（+2=extracted_too_long 双面拆分·零谓词放宽）。
- **断言实质复算**：`13-runner-gate-final.stdout.log` 分节 PASS 计数亲点——前置锚 9+N1 6+N1a 32+N1b 8+N2 33+N3 19+N4 8+F1 9+D1-PF 5 = **129** 恰等（`grep -c '^PASS'` 同收据=129 恰等）——§9.1 各节断言数逐值复算成立。
- **九门独立复跑全对（本席亲跑 fresh）**：①`pnpm uc003:nhp-neg:prove` EXIT=0 129/129 ②`pnpm uc003:i18n-locale-ui:prove` EXIT=0 1 passed（2.5s）allowlist 14/14 ③`pnpm uc003:i18n-locale:prove` EXIT=0 ④`pnpm uc003:nhp-adv:prove` EXIT=0 67/67 ⑤`pnpm -C apps/web prove`（web-logic）EXIT=0 ⑥`pnpm -C apps/web typecheck` EXIT=0 ⑦`pnpm -C apps/web lint` **首跑红 2913 warnings→根因=EXEC UI 门 `next build` 副产物 `apps/web/.next` 残留在树（464M·gitignored·非扫描源面·§9.1 清场条款对应物）→按既有条款清场后复跑 EXIT=0 · 601 warnings 恰等**（非 retry-to-green：零断言零码变·仅删 gitignored 构建副产物）⑧`node scripts/ai-docs/check-docs.mjs` EXIT=0 scanned **2415 恰等** ⑨`pnpm public-text-policy:prove` EXIT=0 12/12。
- **席1 P2×2（残余如实登记·非阻断）**：**P2-A** lint 门存在未显式化为流程条款的前置——UI 门行使后 `.next` 构建副产物残留即 lint 红（本席实测 2913→清场后 601 恰等）· §9.1 「已清场后终验」系事后记录非门前置条款·建议后继刀将「UI 门后 lint 前清 `apps/web/.next`」升为显式门前置步骤；**P2-B** §9.1 attempts 措辞「attempt3 绿+Map 形 lint 修复复跑双绿」可误读为绿后再红再修复——收据链实形=attempt1 红→attempt2 红×2→attempt3 绿（129/129）→Map 形 lint 形修复+**复跑 1**（attempt4 收据·零断言变）双绿·errata=**「3+复跑1」**（§9P.3 条目②）。

### 9P.2 席2（post-prove 独立外席·契约面独立推演+两 case 复跑 fresh）— **PASS**

- **契约面独立推演（对源重划界·不引 §9.1 口径）**：`resume.service.ts` `new HttpException` 全文件 **24 处**亲数——上传链 scope（uploadGate/uploadFile/uploadImageViaOcr/uploadInTransaction 门区 `:38-:214`）**恰 19 抛点**（`:40/:47/:48/:52/:60/:64/:68/:74/:80/:81/:96/:107/:112/:120/:137/:145/:158/:165/:214`·其中 `consent_required` ×2 `:107`/`:214`）→ 去重**恰 18 码**；`not_found_or_forbidden` ×5（`:257/:298/:305/:320/:323`）系 list/get/delete 面非上传链产出·排除恰等——**19 抛点/18 码独立划界与 proof 上传链枚举臂/`GAP_2` 两码臂逐值恰等**。
- **N1b fail-closed 真行使非空洞**：proof 以真产品函数 `mapResumeUploadError(status, body, locale)` 行使 `encrypted`/`magic_mismatch`（真码∉map 双侧键域）→ `ocr-preview-ui.ts:133` `messages[error] ?? messages.upload_failed` 兜底分支真执行·断言 `error` 码透传+`message`=upload_failed en/zh 逐字+CJK-free+zh `hint` 零透传（真信封携 zh hint 入参·结果串零泄漏）——**fail-closed 臂非硬造常量·兜底分支真实可达且被断言**（与 D1-PF 纯函数面同源互证·r2 P2-4）。
- **Case 1 复跑 fresh**：`pnpm uc003:nhp-neg:prove`（runner gate）EXIT=0 **129/129** + `pnpm -C apps/web prove:uc003-nhp-neg`（raw 形）EXIT=0 **129/129**——双形双 fresh·新收据 `.tmp/isolated-proof-receipts/2026-10-27T09-58-53-…json`（release_evidence=false）。
- **Case 2 loader 通道复跑**：`source ~/.meetwise-secrets/load-model-api-key.sh && pnpm uc003:i18n-locale-ui:prove` EXIT=0 **1 passed（2.5s）**·allowlist **14/14 全 allowlisted**（14 distinct text nodes 亲点·与 EXEC 双 fresh 一致）· D0 既有臂零改动+D1 en 臂绿——**前提注：Case 2 复证须以 loader 方式 b 同 shell env 注入通道为前提**（EXEC §9.1 承登形·本席复跑即经该通道·零 .env 落盘·`E2E_UI_SKIP_WORKER=1` 零模型外呼·est live=0 不变）。
- **席2 P2×2（残余如实登记·非阻断）**：**P2-C** §9.1 UI 门时长「1.7s+2.7s」系 EXEC 双 fresh 收据锚值非不变量——本席复跑 2.5s·时长逐跑漂移·errata=**UI 门时长取收据锚**（§9P.3 条目①·后继引值须注明收据出处·门判定=EXIT+passed+allowlist 清点非时长）；**P2-D** §6「EXEC 期……零模型零 Key」措辞对 Case 2 不够精确——Key 通道实形=loader 方式 b 同 shell env 注入（§9.1 已披露）·「零 Key」准出口径=零 Key 落树/落据/落 .env+零模型外呼·errata=§6 additive 注记一句（**已随本落卷 additive 落入 §6**·est live=0 不变）。

### 9P.3 会签与 P2 errata（随卷三件·非阻断）

- 席1 **PASS** × 席2 **PASS**＝**post-prove 双审双 PASS 会签成立**（两独立外席各自独立形成裁定·复跑收据各自 fresh 互不引用·alone≠dual 已解）；三处钉（Status 头+§8+卷尾注）随本节同拍翻 **`closed`**（并线刀钉形·原值 `executed:awaiting_post_prove_dual`·史录不洗）· EXIT0=case≠covered 口径维持·格值 partial 零翻·coveredCount=8 不变·pins 十一值零翻（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null）· N1b encrypted/magic_mismatch 产品契约缺口 backlog 移交维持（共享 SSOT `gap-bug-backlog` 零触）· est live=0（两席复跑：Case 1 离线零外呼零模型零 Key 加载·Case 2 `E2E_UI_SKIP_WORKER=1` 零模型外呼·loader 通道 shell 注入零落盘）· 后继=并线席随令 fetch origin/main/merge-tree 预演/merge --no-ff/pnpm install --frozen-lockfile/终验五门/push/PR（翻面权归协调方·门红或冲突不可解即停上报）。
- **P2 errata 三件（随卷·非阻断·全为措辞/口径精化·零断言零码零门值变）**：
  1. **UI 门时长取收据锚**：§9.1「1.7s+2.7s」为 EXEC 双 fresh 收据锚值（tracked 收据 `ai-docs/delivery/receipts/nhp-003-dom-01/01-gate-uc003-i18n-locale-ui.stdout.log`=2.7s 一件在树）· post 席2 复跑 2.5s——UI 门时长逐跑漂移·后继引值一律注明收据出处·时长不作为门判定值。
  2. **attempts 措辞「3+复跑1」**：Case 1 attempts 台账口径 errata=**3 attempts（红 ENOENT/红×2 extracted_too_long/绿 129/129）+复跑 1（Map 形 lint 形修复后·零断言谓词变）**·收据链 `01-raw-attempt1/2/3`+`10-raw-attempt4-mapform` 四件亲证·§9.1「attempt3 绿+Map 形 lint 修复复跑双绿」按此读。
  3. **§6 零 Key 措辞 additive 注记一句**：已随本落卷 additive 落入 §6（post errata 注记·Case 2 loader 方式 b 同 shell env 注入·「零 Key」准出口径=零 Key 落树/落据/落 .env+零模型外呼·est live=0 不变）。
- **本 post 落卷 diff 面**：本卷 REQUEST 恰 1 tracked 路径（§9-post 新节+三处钉翻面+§6 additive 注记）· markers 五类标记词+行首冲突标记改动集零命中（运行时组装口径亲跑）· 零产品码触。

---

*UC003X REQUEST · 2026-10-26 起草 · **STOP=`executed:awaiting_post_prove_dual`**（2026-10-27 EXEC 落卷三处翻面·原值 `draft:awaiting_pre_exec_dual` 史录不洗·三处钉：Status 行+§8+本行 · alone≠dual（post-prove 双审两独立外席未行使）· ⛔push）· UC-E2E-003 简历域残面 · 认领=§1.0.1 `:114` NEG 格 gap+FAULT 格 blind（薄缝定标：管道故障零可测缝 NOT claimed·abort/timeout 薄臂 F1）+ §1.0.2 `:174`/P1-6 `:274` locale=en DOM partial 残 · 批 A `NHP-003-ADV-01`（`:114` ADV）零重叠亲证零触 · 修法=恰 2 case（`NHP-003-NEG-01` 契约对账 N1 源→map **16⊆20+encrypted/magic_mismatch 两码缺位（blob 级亲证·resume.service.ts:64/:68 两码 zh/en 全域零命中走 upload_failed 兜底·产品契约缺口如实预登记·backlog 移交协调方）**+N2 真信封逐字 en exact 钉+zh hint 零透传+N3 状态耦合+N4 zh 对照+F1 薄臂 · `NHP-003-DOM-01` UI 门 D0 复跑+D1 本地拒 en 臂 test-only 增臂 · D2/管道故障/API-response DOM 臂 NOT claimed 如实登记）· 零产品码触 · cap 预算=届值 2410 恰等零余量+本卷 1 件必越 → **恰等步进 2410→2411 随刀落码**（pay-neg #155 单件先例形·三十先例形链·派单「越限沿先例步进承登预授权」随令·policy proof 越限臂 2_411/2412 联动本树 12/12 EXIT=0 亲跑）· 双表同步令沿 §1.0.3 `:166` · 基线=`origin/main` `9c31c0ccc` · 分支 `line/uc003x-draft` · 工作树 `meetwise-uc003x` · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · EXIT0≠covered · releaseEvidence=false · ≠HA · **EXEC 落卷附记（2026-10-27·§9-EXEC 全录）**：开工 tip `09363e8fb`（届值 origin/main `5356fa8c5` 并线 #156-#159·cap 届值 2415=union 恰等步进随 merge 落值·2410→2411 起草步进对届值前移如实承登）· 两 case EXIT=0（NEG 129 断言双 fresh·DOM UI 门双 fresh 1 passed×2·attempts 红次 2 台账在卷零断言谓词变）· N1b 采 gap-register 形（协调方裁决·非 EXIT1·零断言放宽）· 门矩阵 web typecheck EXIT=0+web lint 601 恰等 EXIT=0+邻面三门（i18n-locale/ADV 67/web-logic）恒等绿+docs:check scanned 2415 恰等+markers=0+PTP 12/12+inventory 376 恒等· 双表 `:114` gap→case-only（FAULT blind 保持）+`:174`/`:274` additive+case-matrix §1.3 两新行· coveredCount=8 零翻· est live=0· ⛔push*

**`closed`**（卷尾注史录翻面 · 2026-10-27 · 与 Status/§8 同值 · 前值史录零字洗：`draft:awaiting_pre_exec_dual` → `executed:awaiting_post_prove_dual` → `closed` · §9-post 双审双 PASS 会签收口（席1+席2·P2×4 残余登记·errata 三件随卷 §9P.3）· 并线刀钉形 · post 落卷 commit=`docs(test): 简历域残面卷 post 双审双 PASS 会签落卷——uc003x 线翻终态 closed` · 收官净消息（PR 标题）=`test(web): 补齐简历上传错误契约与界面文案测试` · 后继=并线席 fetch origin/main（届值如实采·cap 届值如实采·union 越限沿常设预授权恰等步进）/merge-tree 预演/merge --no-ff/pnpm install --frozen-lockfile/终验五门/push/PR/`gh pr merge --merge --auto`（门红或冲突不可解即停上报））
