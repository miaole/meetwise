# UC3M REQUEST — UC-003 NEG-01 收据 N1b 显式 gap 臂收口：`encrypted`/`magic_mismatch` 两码 web 双侧产品映射（backlog `:953` 兑现 · 刀型裁决=产品映射小刀 · docs-only 起草卷 · 起草落卷即停）

**Status**: **`closed`**（起草落卷态→rev r1 席1 FAIL P1×3·裁决=处方全采纳·回炉修订落卷（§0.0.1）→rev r2 席1 FAIL P1×1+P2×6·裁决=处方全采纳·回炉修订落卷（§0.0.2）→rev r3 席1 FAIL P1×1+P2×3·裁决=处方全采纳·回炉修订落卷（§0.0.3）→rev r4 双席分歧（席1 PASS · 席2 FAIL P1×3+P2×7）·裁决=按席2 处方全采纳（席1 P2×2 并入）·回炉修订落卷（§0.0.4）→**rev r5 双席分歧（席1 PASS · 席2 FAIL P1×1+P2×9）·裁决=按两席处方合并（席1 P2×5 去重并入）·回炉修订落卷（§0.0.5）**→**rev r6 双审 P2 批随立项日履行 + EXEC 落码（§0.0.6/§9-EXEC·pre dual r6 双 PASS 放行·协调方授权）**·EXEC 落码已行使·**post-prove 双审双 PASS 放行（2026-10-30·P2×14 合并登记见 §9-POST）**·翻面权归协调方（已行使）·alone≠dual（pre/post 均已满足）·前值史录零字洗：`executed:awaiting_post_prove_dual`→`closed`·STOP 三处钉：本 Status 行 + §8 + 卷尾·push/PR 随收官令）。

**席位**：meetwise「UC-003 encrypted/magic_mismatch 两缺位码映射」REQUEST 起草席（总盘 #5 · P2 · 协调方裁决派产品映射小刀或 docs 钉刀 · docs-only 起草 · ⛔动主仓 ⛔push）。
**基线**：`origin/main` @ **`3af835ad4`**（full `3af835ad427176983c08d939ea9d71288c04b4d4` = PR #183 `line/uc2b-draft` 并线点 · `git fetch origin` 本 turn EXIT=0 · 分支 `line/uc3m-draft` **起草前**零独有 commit（起草+r1/r2/r3 修订 **4 commits**·本 r5 落卷后 6·史录措辞·不逐次重数） · worktree `meetwise-uc3m`）· `node scripts/ai-docs/check-docs.mjs` 本树起草前亲跑 **EXIT=0 · scanned 2455**（= cap `2_455` 恰等零余量 · `scripts/ai-docs/public-text-policy.mjs:275` `MAX_FILES = 2_455` 亲证）→ 本卷新 .md +1 必越 → **恰等步进 2455→2456 随刀落码**（§2-1 承登·四联动点已同步 `public-text-policy.proof.mjs`）。

**必读清单（EXEC 立项前逐件亲读·显式路径）**：`ai-docs/delivery/gap-bug-backlog.md:953`（本刀立项 SSOT 行·逐字见「立项出处①」）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§1.0.1 `:114` UC-E2E-003 行 NEG 格 · §1.0.2 `:174` i18n/locale 结构面行 · P1-6 `:274` · §1.0.3 `:166` 双表同步令）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md:109`（`NHP-003-NEG-01` 用例 SSOT 行·N1b gap 臂原文）→ `apps/web/test/uc-e2e-003-nhp-neg.proof.ts`（`:184-194` N1b 缺位段·`:269-284` F1 相邻域·`:79-87` 码表常量）→ `apps/web/lib/resume/ocr-preview-ui.ts`（`:19-40` zh 表 · `:42-66` en 表 · `:123-135` 映射链）→ `apps/api/src/modules/resume/resume.service.ts:56-69`（两码 422 抛点）→ `packages/domain/src/resume-extract.ts`（`:79` · `:160` · `:174` 三抛点）→ `packages/errors/src/index.ts:30`（`errCode`）→ `apps/web/app/resume/actions.ts:87-96`/`:113-136`（server action 唯一调用点）→ `apps/web/app/resume/ResumeUploadForms.tsx:56`（DOM 单源）→ `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs:100-113`（S4 键数常量 20）→ `apps/web/test/uc-e2e-003-nhp-adv.proof.ts`（`:39-42` `KNOWN_CODES` + `:56-59` concat 恰等 20 键全集 · `:76-92`/`:109-135` V1/V3 兜底承接面 · 本刀第 3 件测试资产）→ 形制先例卷 `harness/uc003x-REQUEST.md`（本 gap 的登记卷 · `closed` · 只读）· `harness/evap-REQUEST.md`（刀型裁决节形制 · 在飞支 `line/evap-draft`）。

**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`gap-bug-backlog.md:953` 逐字：「**2026-10-26 · UC-003x resume 上传链 encrypted/magic_mismatch 两码 web 双侧映射缺位 P2 产品契约缺口登记**：API 侧两可解释 422 出码点亲证在树——`apps/api/src/modules/resume/resume.service.ts:64`（`error:'encrypted'`+zh hint）与 `:68`（`error:'magic_mismatch'`+zh hint）；web 双侧 i18n 键域 `apps/web/lib/resume/ocr-preview-ui.ts` zh 表与 en 表（各 20 机读码键……）均零此二键（grep 亲证=0）→ 兜底链 …… 使 en 用户撞加密 PDF/魔数不符文件只得泛化 `upload_failed`，API 侧 zh hint 产品契约在 en 面落空 · 无数据/无资金影响 · **修法=两键 zh/en 双侧落键**（沿 uc003-i18n parity 先例形·动 messages 键域前同步核 L-02 #264 全文件负断言面）· 登记≠修复·修复/行使/翻面权归协调方·Pins 零动。」；②`non-happy-path-perf-load-case-matrix.md:109`：「N1b encrypted/magic_mismatch 显式 gap 臂（产品契约缺口·backlog 移交协调方·非 EXIT1·零断言放宽）」；③`e2e-requirement-coverage-matrix.md:114` NEG 格：「**N1b `encrypted`/`magic_mismatch` 两码显式 gap 臂（产品契约缺口如实登记·backlog 移交协调方·非 EXIT1·零断言放宽·fail-closed 走 upload_failed 兜底为现行产品行为如实行使）**」；④协调方派单令（本 turn：「UC-003 encrypted/magic_mismatch 两缺位码映射 REQUEST 起草席 · P2 · 协调方裁决派产品映射小刀或 docs 钉刀」·停止条件「改动面跨多包/须迁移——如实红停上报」）。

---

## 登记处 fresh 亲点（本卷核心盘点 · 逐行对 `origin/main` @`3af835ad4` 亲读亲跑·file:line 逐字）

| 登记处 | 亲读证据 | 判定 |
|---|---|---|
| backlog 行本体 | `gap-bug-backlog.md:953` 单行在（本卷只读·append-only 卷·行统计 959 行亲数） | **开**（本刀兑现行） |
| 矩阵 NEG 格 | `e2e-requirement-coverage-matrix.md:114` 第 2 列值=`**gap**→**case-only**`（NHP-003-NEG-01 case 证据已落 2026-10-27 EXEC·129 断言）· 词面含 N1b gap 臂全文 | **开**（格值不动·EXEC 仅 additive） |
| 用例 SSOT 行 | `non-happy-path-perf-load-case-matrix.md:109` `NHP-003-NEG-01` 行（行首「18 码枚举恰等·16⊆20 亲证」为届时真话） | **开**（EXEC additive 注记） |
| 收据 N1b 臂 | `apps/web/test/uc-e2e-003-nhp-neg.proof.ts:184-194`（8 断言：2 码 × ∉zh/∉en/兜底 en/兜底 zh）· 追踪收据 `ai-docs/delivery/receipts/nhp-003-neg-01/01-gate-uc003-nhp-neg.stdout.log:23-24`「映射单源 zh/en map 恰 20 键」PASS 在卷 | **gap 显式在证**（非隐失） |
| F1 相邻域 | `uc-e2e-003-nhp-neg.proof.ts:269-284` 恰 9 断言（abort/timeout 薄臂·`upload_timeout` web 独有码·与本刀两码不同族）——本刀零触 | 旁证（零重叠） |
| 两码 API 出码点 | `resume.service.ts:63-65`（`encrypted` 422 + zh hint）/`:66-69`（`magic_mismatch` 422 + zh hint） | **现形**（见 §0.1） |
| web 双侧键域 | `ocr-preview-ui.ts:19-40` zh 20 键 · `:45-66` en 20 键 · 两码零命中（`grep -c` 亲跑 = 0） | **缺位**（见 §0.2） |

---

## §0 产品面侦察（起草席亲读亲跑 · file:line + blob 逐条（锚基见下））

**blob 锚（`git rev-parse HEAD:<path>` 亲算·8 hex·锚基=HEAD（本 turn 实测 @`6b512b0d7`（r3 基底）·rev r1–r3 仅动本卷，所列源件 blob 值恒等；r4/r5 重算逐件同值·HEAD `d5c4a33a0`））**：`apps/web/lib/resume/ocr-preview-ui.ts` **`2aa3bdb3`**（144 行）· `apps/api/src/modules/resume/resume.service.ts` **`952482e5`**（327 行）· `packages/domain/src/resume-extract.ts` **`a03ccb85`** · `packages/errors/src/index.ts` **`d505f0d0`**（33 行）· `apps/web/test/uc-e2e-003-nhp-neg.proof.ts` **`a5dd5980`**（306 行）· `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` **`08ffaf9c`**（312 行）· `apps/web/test/uc-e2e-003-nhp-adv.proof.ts` **`8a935fe3`**（157 行）· `apps/web/app/resume/actions.ts` **`99878fe0`**（171 行）· `apps/web/app/resume/ResumeUploadForms.tsx` **`9b6296f3`**（92 行）· 矩阵 **`6706ad56`**（522 行）· case-matrix **`5dc8d97c`**（221 行）· backlog **`33ba0d86`**（959 行）。

**EXEC 立项重 pin（2026-10-30·merge `41ea16eef`）**：§0 十二件逐件亲算——**8 件恒等**（`resume.service.ts` `952482e5`/327 行、`resume-extract.ts` `a03ccb85`、`errors/index.ts` `d505f0d0`、`actions.ts` `99878fe0`、`ResumeUploadForms.tsx` `9b6296f3`、矩阵 `6706ad56`、case-matrix `5dc8d97c`、backlog `33ba0d86`）；**4 件为本刀改动面**（post-change 锚：`ocr-preview-ui.ts` `db303c75`/148 行 · `nhp-neg` `1b1324f6`/321 行 · `i18n-locale` `58fadf74`/312 行 · `nhp-adv` `c88b095a`/158 行）。

**本刀改动件锚分标（防 §8 自触漂移红停）**：policy `scripts/ai-docs/public-text-policy.mjs` **锚基=EXEC 立项 HEAD（@`41ea16eef`）`fa09c182`（575 行 = 并线后值·cap 取大 2_461 + UC3M 2456/EVAP 2461 双注记 dual-keep）**；起草届 post-change `edb3b73e`（574 行）与基线锚 `3af835ad4:` `bd992a6f`（573 行）为史录。policy proof `scripts/ai-docs/public-text-policy.proof.mjs` **锚基=EXEC 立项 HEAD `9069bd35`（489 行 = 并线后值·四联动点 2_461/f-2461.md/:2462）**；起草届 `f89b78ad`（487 行）与基线 `f16d8dfd`（485 行）为史录。**§8 漂移判据只认锚基=HEAD 值**；基线锚仅作起草前史录，不得混作当前锚（原混标会自触）。

### 0.0.1 rev r1 修订登记（r1 席1 FAIL P1×3+P2×9·裁决=处方全采纳·2026-10-30 回炉席落卷）

- **r1 判读**：pre-exec 席1 判 **FAIL**（P1×3 · P2×9）；协调方裁决=处方**全采纳**，本席按清单逐条落卷，零裁量改判。
- **P1 三条**：① 改动面漏第 3 件测试资产 `uc-e2e-003-nhp-adv.proof.ts`（`KNOWN_CODES`+concat 恰等 20 键全集·+2 码即 +4 断言 67→71）→ §1.4 第 8 件 + §2-5；② §0 blob 锚表基线/HEAD 混标（policy 两件会自触 §8 漂移红停）→ 分标「锚基=HEAD / 基线锚 `3af835ad4:`」；③ 退役 N1b zh 兜底臂无继任者 → §1.6 补未知码兜底臂 ×2 locale（`some_unknown_code` 逐字钉 `EN_UPLOAD_FAILED`/`ZH_UPLOAD_FAILED`），强度改述为「兜底属性由 ADV V1/V3（en）+本臂（zh）承接」。
- **P2 九条**：④ §1.5 硬约束 3→5（禁与 API hint 逐字/包含·单行禁 ASCII 单引号）；⑤ lint 预算删「仅 en 表计 +2」推定改 +4（zh/en 同权）·退役常量若留再 +2；⑥ §1.2「首次全等」→「首次全覆盖（18⊆22·仍非等集）」；⑦ 双表注记内容钉死（`:274`「错误码 en 产品映射残余已闭（22 键）/Playwright locale=en DOM 仍缺」·`:114`/`:109` 带日期 `16⊆20→18⊆22 @2026-10-30`·格值/行值零动）；⑧ §3-4 增 `harness/uc-e2e-003-i18n-locale.md:99`（「20/20 键 parity」append-only 历史注记·零触）；⑨ §0.2/§1.2 登记双 SSOT 无耦合门为接受风险；⑩ §1.5 encrypted 补尾句「若文件确未加密请改传其他文件」+启发式继承风险登记；⑪ 在飞 pin 重测（evap `e5fbc9271` 父 `64440511e`·cwn `d5ba5b428`·uc2b 已并 main 出名单）+ §0.1 行号三处（`:170→:171`/`:158-163→:157-163`/`:87-93→:89-93`）；⑫ 本节（rev r1 登记+清单索引）。
- **冲突核**：全部修订对机制源逐条亲证零冲突（§8 停止条件未触发）。**门（本修订 commit 前亲跑）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2456 = cap 2456**；`pnpm public-text-policy:prove` **12/12 EXIT=0**；改动集 marker/conflict grep **零命中**；est live=0。修订 commit diff 面 **恰 1 tracked 路径**（本卷·policy 零动）。

### 0.0.2 rev r2 修订登记（r2 席1 FAIL P1×1+P2×6·裁决=处方全采纳·2026-10-30 回炉席落卷）

- **r2 判读**：pre-exec 席1 判 **FAIL**（P1×1 · P2×6）；协调方裁决=处方**全采纳**，本席按清单逐条落卷，零裁量改判。
- **P1 一条（证据链虚假）**：约束④所引「禁与 API hint 逐字相同」机制不成立——N2「zh hint 零透传」臂（`nhp-neg:217-219`·原 gap 段 `:224` 同谓词）实以 `locale='en'` 取值，`mapResumeUploadError` 从不读 `hint`（`ocr-preview-ui.ts:129-135`），该门比较「en 文案是否包含 zh hint」，在 CJK-free 成立后恒真·对 zh 列完全不可见；拟落 zh 文案与 API hint 仅差句读+尾句＝「声明禁止的东西」与「交付的东西」只隔一个标点。**修订**：④ 重写为「en 列由 ① CJK-free 机械兜住；zh 列无机械门，逐字同文禁令为纯语义纪律，须 post-prove 席人工核对（援引该臂作 zh 面证即伪证）」＋ §1.5 `encrypted` zh 首句按 (a) 改写（不与 hint 仅隔句读/尾句）。
- **P2 六条**：② §1.4 第 4 件 `:274` 注记措辞改「Playwright locale=en DOM **对两码**仍缺（DOM-01 收据已挂 case-only·矩阵 `:174` 在案·未升格）」（矩阵 `:174` 与 `e2e-ui/uc003-i18n-locale.spec.ts:85` 已证 locale=en DOM 门存在·2026-10-27 EXIT=0 双 fresh）；③ lint 预算：r2 处方钉「恒 **+4**」（zh/en 同权推定）——**r3 机制核证伪**（见 §0.0.3）：`isCamelCase`=首字符小写且不含 `_`，`encrypted` 通过→0 warning、`magic_mismatch` 含 `_`→1 warning/表 × 2 表 ⇒ **+2** → web **605→607** / root **5408→5410**（UPPER_CASE const 不产 naming warning；`GAP_2` 空数组零引用另计 +1·见 §1.4）；④ §8 漂移判据只认锚基=HEAD 值（基线锚为起草前史录，不参与判据）；⑤ §1.4 第 8 件备注补 `nhp-adv` 头注释 `:4-7` 的 `ocr-preview-ui.ts` 行号引用随插键 +4 重锚（`:68-70→:72-74`·`:123→:127`·`:129→:133`·`:133→:137`）；⑥ §0.1 抛点 1 行号 `:174-176`→`:173-175`；⑦ §1.4 #6 GAP 兑现行锚＝EXEC 门绿后第二个 commit（或 PR 号）·禁同 commit 内自引 SHA；⑧ 本节（rev r2 登记+清单索引）。
- **冲突核**：**除 lint 预算「恒 +4」一条外**全部修订对机制源逐条亲证零冲突（该条为 r2 处方推定·r3 机制核证伪=+2·见 §0.0.3；§8 停止条件未触发）。**门（本修订 commit 前亲跑）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2456 = cap 2456**；`pnpm public-text-policy:prove` **12/12 EXIT=0**；改动集 marker/conflict grep **零命中**；est live=0。修订 commit diff 面 **恰 1 tracked 路径**（本卷·policy 零动）。

### 0.0.3 rev r3 修订登记（r3 席1 FAIL P1×1+P2×3·裁决=处方全采纳·2026-10-30 回炉席落卷）

- **r3 判读**：pre-exec 席1 判 **FAIL**（P1×1 · P2×3）；协调方裁决=处方**全采纳**，本席按清单逐条落卷，零裁量改判。
- **P1 一条（机制证伪·lint 预算）**：r1 ⑤/r2 ③ 的「恒 +4」不成立——`packages/config/eslint.config.base.mjs:76-79` `memberLike→camelCase` 亲读；`@typescript-eslint` 的 `isCamelCase` 判据=**首字符小写且不含 `_`**（上游实现行 `name[0] === name[0].toLowerCase() && !name.includes('_')` 亲核）：`encrypted`（全小写无 `_`）**通过→0 warning**；`magic_mismatch`（含 `_`）违规→**1 warning/表 × 2 表** ⇒ 增量 **+2**（web **605→607** / root **5408→5410**），非 +4。卷引先例（`execution-master-checklist.md:2729` 的 +20）只覆盖全含 `_` 的 snake_case 键，**不可外推**。**落点三处**：§1.4 lint 预算段（机制核+新值+`GAP_2` 连带）、§0.0.2 ③（史录改如实）、卷尾（新值）。
- **P2 三条**：② §1.6 净断言数 N2 hint 扩后补注——该臂为整串 `includes(env.hint)`，新 zh 文案不含完整 hint（「请先解除」断开「请解除」子串），即便未来加 zh 变体亦为绿，**不得据此声称 zh 面同文已机械证**（与 ④「即伪证」口径闭环）；③ §0「分支零独有 commit」→「**起草前**零独有 commit」（HEAD 已 3 commits·史录措辞）；④ §1.4 第 2 件 `GAP_2`→空/`MAPPED_18` 实为 **2 条常量行**——写明取形（`const GAP_2: string[] = []` + `const MAPPED_18 = EXPECTED_18`）及「空数组是否仍被引用」对 `no-unused-vars` 的影响（与 lint 预算一并）。
- **冲突核**：全部修订对机制源逐条亲证零冲突（§8 停止条件未触发）。**门（本修订 commit 前亲跑）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2456 = cap 2456**；`pnpm public-text-policy:prove` **12/12 EXIT=0**；改动集 marker/conflict grep **零命中**；est live=0。修订 commit diff 面 **恰 1 tracked 路径**（本卷·policy 零动）。

### 0.0.4 rev r4 修订登记（双席分歧：席1 **PASS** · 席2 **FAIL** P1×3+P2×7 · 裁决=按席2 处方全采纳（席1 P2×2 并入）· 2026-10-30 回炉席落卷）

- **r4 判读**：pre-exec 双席 r4 —— **席1 PASS**、**席2 FAIL**（P1×3 · P2×7）；协调方裁决=**按席2 处方全采纳**，席1 两条 P2 并入清单（取更严形），本席零裁量改判。
- **P1 三条（席2）**：① **§4 在飞交叠核重 pin**：evap @`2f54b0ddf`（父链已重写·`64440511e` 非祖先）/ cwn @`976f019ed`；evap 触面改 **7 件**（REQUEST+收据+两 policy+fixture+gatherer+proof）+ evap cap **2461**；删「均只触 harness+两 policy」；保留「产品触面零重叠（16 worktree 扫描支撑）」+ 补「EXEC 立项前重跑 `git diff --name-only` 与 cap 取大·禁按预登行使」→ §4②。② **改动面枚举补全**：footer `PIN nhp-neg:303`「N1b 产品契约缺口」/ N1a 段 `:177-178`「16 已映射码」/ 头注释 `:14-15`「两段形 16 码」/ 标签 `:158-161`「20 键」与 `:215`「16 码 CJK-free」（**席2 记作 `:219`·本树 `a5dd5980` 306 行实测为 `:215`·`grep -n` 复证·`:219` 为该臂闭合行**）/ `i18n-locale:111`「20/20 parity」/ `case-matrix:111`（FAULT 行「129 断言+blob `a5dd5980`+`:269-284`」）；catch-all 换**显式 grep 清单**（逐条改写或保留理由）→ §1.4 第 2/3/4/5 件 + 表后「断言面存量真话清单」+ §2-5。③ **`GAP_2` 空循环防呆**：新 N1b 臂迭代源只许字面两码数组或 `EXPECTED_18` 显式补集；`GAP_2` 若保留只可用于 `GAP_2.length === 0` 类负向断言·**禁作 `for...of` 源**（**r5 定谳取代**：删 `GAP_2` 声明·**不设该负向臂**——若设即 140，与 139 冲突，见 §0.0.5 ⑤/§1.4 第 2 件/§1.6）（**r5 补算式**：按 EXEC 新臂形投影 139−12=127；现树直改 `GAP_2` 空（r5 席2 实测）**125 总/6 FAIL**·`MAPPED_16` 由 `GAP_2` 推导⇒N1a/N2 exact 反红；=125+2 未知码臂=127）→ §1.4 第 2 件 + §2-5 门槛 **139（±0）**。
- **P2 七条（合并清单·席2 P2×7；席1 P2×2 并入取更严形·不另列）**：④ §1.6 第 4/5 条 N2 口径统一（旧 4 退役→既有 exact en loop +2/既有 hint loop +2·zh exact 在 N1b 内不重复计·**净 139**）；⑤ docs 注记补 `129→139` + blob/行号重锚 + `:274` 追加「本条更新上句『仍缺错误码 en 映射』为已闭」+ `case-matrix:111` 史录说明；⑥ §2-5 补 `pnpm -C apps/web prove:public-copy`；⑦ 收据介质钉（仅 `.log`/`.tmp`·落 `.md` 须先 union 实测恰等步进 cap）；⑧ `EN_EXACT`/`ZH_EXACT` 保持 `new Map([[...]])` 禁改 object literal；⑨ §0 分支 commit 计数改 **4**（起草+r1–r3·不逐次重数）；⑩ §1.5 `magic_mismatch` zh 行补「最小换词形」说明 + post-prove 两码逐行比对结论入收据。
- **冲突核**：全部修订对机制源逐条亲证零冲突（§8 停止条件未触发）。实测：evap `2f54b0ddf` **7 件**/cap **2461**（本 turn tip `631698706`=8 件/cap 恒 2461）· cwn `976f019ed` **3 件**/cap **2448** · **origin/main 2455**（`origin/main:scripts/ai-docs/public-text-policy.mjs:275`=`MAX_FILES = 2_455`）· 本支起草步进后 **2456**（`HEAD:276`）· `nhp-neg` `a5dd5980` 306 行命中行与清单逐条对齐 · `i18n-locale:110-111` · `case-matrix:109`/`:111` 行在 · §0 blob 锚 12 件逐件同值。
- **门（本修订 commit 前亲跑）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2456 = cap 2456**；`pnpm public-text-policy:prove` **12/12 EXIT=0**；改动集 marker/conflict grep **零命中**；est live=0。修订 commit diff 面 **恰 1 tracked 路径**（本卷·policy 零动）。

### 0.0.5 rev r5 修订登记（双席分歧：席1 **PASS** · 席2 **FAIL** P1×1+P2×9 · 裁决=按两席处方合并（席1 P2×5 去重并入）· 2026-10-30 回炉席落卷）

- **r5 判读**：pre-exec 双席 r5 —— **席1 PASS**、**席2 FAIL**（P1×1 · P2×9；席1 P2×5 合并去重后并入清单），协调方裁决=**按两席处方合并**，本席零裁量改判。
- **P1 一条（真话面缺口）**：`ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md:88` P1-6 行「静态 prove 已挂；DOM e2e-ui + 错误码 en map 产品闭环仍缺」——本刀使「错误码 en 产品映射」由缺转闭，但 §1.4 原八件不含该文件 ⇒ EXEC 后该行留假话；补注记又撞 §2-4「多未登记路径即停」⇒ 二择一必返工。**修订**：§1.4 增**第 9 件**（该卷 §6 append-only 一条·上文表行本体零改）+ §2-4/§8 八件→**九件** + §3-4 改「表行本体零改·允许 append-only 注记」。
- **P2 十一条（合并去重：席2 P2×9 + 席1 P2×5 去重后 11 条）**：② main cap 口径三处（`:60`/`:212`/`:236`）「main 2456」→「**origin/main `:275`=2_455** · 本支起草步进后 2456（`HEAD:276`）」；③ 127/127 补算式（`:58`/`:138`/`:216`）=「EXEC 新臂形投影 139−12=127 · 现树直改 `GAP_2` 空（r5 席2 实测）**125 总/6 FAIL** · =125+2 未知码臂」（r6 拆树：投影树/实验树分开述·禁混算）；④ `:274` 引文逐字（仅「**错误码 en 产品映射**」子句闭·禁引不存在的整串「仍缺错误码 en 产品映射」）；⑤ `GAP_2` 负向臂与 139 冲突消解=**删自许**（删 `GAP_2` 声明·不设 `GAP_2.length===0` 臂·禁两头都写）；⑥ 迭代源收紧=只许字面 `['encrypted','magic_mismatch']`（明禁 `GAP_2`/任何可空集合/`EXPECTED_18.filter` 派生·点名「`MAPPED_18` 忘改仍 16=131（N1a −4+N2 −4）」）；⑦ 12 条新臂逐字谓词（§1.6·含「码路径 422 真信封透传」定义·判据「恒真谓词/同数替换计数门拦不住」）；⑧ §2-5 归因操作形（收据 9 段值 `9/6/36/14/33/19/8/9/5` 逐段对齐·<139 按段差集归因）；⑨ FAULT 格注记口径（log `6fbacc29:148-156` 不可变/ proof blob 与 `:269-284` 按届值重锚·F1 仍 9 条）+ case-matrix `:111` 并置 + policy「两 proof」起草届史录实际三件；⑩ `unstub-inventory:33/:125` 行号指针随插键 +2/+4 → §3 显式接受过期（不新增 §1.4 件外路径）；⑪ §4 措辞放宽「两线」→「**凡触两 policy 脚本者取大**」+ ag18 `2_264`/cap-2272 `2_272` 实测 + cwn pin 记 `976f019ed`（现 tip `9a94f3ba5`·面/cap 恒等）；⑫ 本节（rev r5 登记+清单索引）。
- **冲突核**：全部修订对机制源逐条亲证零冲突（§8 停止条件未触发）。实测：`origin/main:policy:275`=2_455 / `HEAD:276`=2_456 · ag18 `4c2ea4c9f` 233 件/cap **2_264** · cap-2272 `52846f9d8` 234 件/cap **2_272** · cwn `976f019ed` 3 件/2_448 ≡ r5 席实测 tip `9a94f3ba5`（续做席复核：该线已 EXEC 前进至面 7 件/cap 2456·仍 < evap 2461）· 4 线产品触面（`ocr-preview-ui.ts`+三 UC-003 proof）**零命中** · 收据 log `6fbacc29:148-156` 9 PASS 亲点 · `uc-e2e-003-i18n-locale.md` 99 行（`:88` P1-6 行/`:93` §5 产品债行·评审记 `:94`·本树 `grep -n` 实测 `:93`）。
- **门（本修订 commit 前亲跑）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2456 = cap 2456**；`pnpm public-text-policy:prove` **12/12 EXIT=0**；改动集 marker/conflict grep **零命中**；est live=0。修订 commit diff 面 **恰 1 tracked 路径**（本卷·policy 零动）。

### 0.0.6 rev r6 修订登记（pre-exec 双审 r6 双 PASS 放行 · P2 批随立项日履行 · 2026-10-30·EXEC 同 turn 落卷）

- **r6 判读**：pre-exec 双审 r6 **双 PASS 放行**（协调方授权 EXEC）；P2 批（席1 P2×3 + 席2 P2×12 合并去重）随立项日履行，本席零裁量改判。
- **优先四条**：① **MAPPED_18 忘改算式更正 131**（§1.4 第 2 件 / §0.0.5 ⑥）：仍 16 码过滤 = **N1a −4 + N2 −4 = −8 → 131 总断言且 EXIT=0**（N2 因过滤面收窄同时丢 exact +2 与 hint +2·计数门拦不住）；§2-5 差集归因补 **N2 段**（先定段、再定臂）。② **12 条谓词 #5/#6 可鉴别化**（§1.6）：#5 加 `typeof EN_MAP.get(code) === 'string'` 前置；#6 增 `'hint' in env.body` + `mapResumeUploadError(env.status, env.body, 'en').message === EN_EXACT.get(code)`（真信封全链 exact）。③ **exact 钉自证性降调**（§1.6）：明「两码 `EN_EXACT`/`ZH_EXACT` 为同源复制·exact 只证存在且与表一致·文案正确性由 §1.5 逐字 pin + post-prove 人工比对」。④ **§2-5 增机检门**：proof 逐行 diff 清单对齐 §1.4 第 2 件增删枚举（−8/+12/+2/−4/+2/+2 / 2 常量 / 4 标签 / 2 迭代源）+ 12+2 断言名 `grep -F` 清单。
- **其余 P2（合并去重）**：⑤ 127/125 两棵树拆开（投影树 139−12 与实验树 125 总/6 FAIL 分述·禁混算）；⑥ FAULT 列标改**第 3 列**（`:114`）；⑦ cap 链措辞统一 `max{…}`（§2-1/§4）；⑧ 第 9 件注记措辞避撞禁令（「**产品侧缺位已补·非本 harness 绿·≠covered**」）；⑨ lint 预算补 `EN_UPLOAD_FAILED`/`ZH_UPLOAD_FAILED` 失引用 +2 路径（609/5412·本刀保留引用→607/5410）；⑩ 9 段取数命令形（`^────────` 切段·精确匹配 `N1` 不吞 `N1a`·UTF-8 感知 perl/python3）；⑪ 未知码兜底臂换强形（`upload_failed` 双表 exact：`EN_MAP.get('upload_failed')` 与常量双比）；⑫ case-matrix `:111` 拆句（①②③④ 四项分列）；⑬ 闭卷史录零触规则一般化（凡 closed/收官史录卷正文与表行零改·仅 §1.4 明列 append-only 面）；⑭ 收据范围更正 `:148-156`（9 PASS 断言区·`:147` 为节标题）。
- **冲突核**：r6 P2 批逐条对机制源亲证零冲突（§8 停止条件未触发）。
- **EXEC 实落**：见 §9-EXEC（同 turn 落码九件面 + 门矩阵亲跑）。

### 0.1 API 侧两码现形链（抛点 → 码 → 信封 → 路由）

**抛点两处均为可解释 422（fail-closed·非 5xx·非裸崩）**：

1. `packages/domain/src/resume-extract.ts:173-175` —— `format === 'pdf'` 且 `looksLikeEncryptedPdf(buffer)` → `Object.assign(new Error('encrypted'), { code: 'encrypted' })`（加密 PDF 快拒·不喂解析器·不计 OCR 费）。
2. 同文件 `:157-163` `mapPdfExtractError` —— pdf-parse 抛出命中 `ENCRYPT_HINT` → 同一 `code: 'encrypted'`（引擎侧加密兜底）。
3. 同文件 `:76-80` + 调用点 `:171` `assertMagicMatchesDeclaration` —— 声明格式 vs 实际字节（magic bytes）不符 → `Object.assign(new Error('magic_mismatch'), { code: 'magic_mismatch' })`（`#109`·分派最前置·先于加密扫描与任何解析 spawn）。

**错误码枚举 source（码怎么从 domain 流到 HTTP）**：`packages/errors/src/index.ts:30` `errCode(e)` 读结构化 `e.code`（string 才取）→ `apps/api/src/modules/resume/resume.service.ts` 的 `uploadFile` catch 分支按码重抛 HttpException：

- `:63-65` → `HttpException({ error: 'encrypted', hint: '文件已加密，无法解析；请解除密码保护后重传或粘贴文本' }, 422)`
- `:66-69` → `HttpException({ error: 'magic_mismatch', hint: '文件内容与声明的格式不符，请确认文件类型后重传' }, 422)`

**信封形状**：`{ error: <码>, hint: <zh 文案> }`（无 `message` 字段——与 429/503 两码的 `message` 形不同·本两码仅 `hint`）。**路由**：`apps/api/src/modules/resume/resume.controller.ts:23` `@Post('file')`（`@Controller('resume')` `:11`）。**上传链码域基数**：方法级 scope（`uploadGate`/`uploadFile`/`uploadImageViaOcr`/`uploadInTransaction`）扫得 **18 码**（`uc003x-REQUEST.md §9-EXEC` 由 post 席2 独立复算「19 抛点/18 码」在卷），本两码即 18 码中 web 唯一缺位的两枚。

**用户可达性**：`apps/web/app/resume/actions.ts:130` `if (!res.ok) return readUploadFailure(res, locale)` → `:89-93` `readUploadFailure` → `mapResumeUploadError(res.status, body, locale)`。加密 PDF 与「扩展名/声明类型与实际字节不符」是**常见真实用户错误**（非构造性边角），两码均在正常上传面可达。

### 0.2 web 侧映射现状（双侧零键 + 兜底链 + 单源消费）

- **双语表（产品源·单文件）**：`apps/web/lib/resume/ocr-preview-ui.ts:19-40` `ERROR_MESSAGES`（zh·20 键）与 `:45-66` `ERROR_MESSAGES_EN`（en·20 键）；`:42-44` 注释自述「same 20 machine codes… Unknown codes fall back to `upload_failed`」。**两码在两张表零命中**（`grep -c 'encrypted\|magic_mismatch'` 对 `:1-144` 全文 = **0**——文件内两串零出现，非仅键域缺位）。
- **兜底链**：`:123-127` `readResumeUploadErrorCode`（非对象/空 → `upload_failed`）→ `:129-135` `mapResumeUploadError`（`:131` 413 状态优先）→ **`:133` `messages[error] ?? messages.upload_failed`**。两码走到 `??` 右侧：`error` 码透传（`ResumeUploadFailure.error`），`message` 为泛化兜底。
- **DOM 单源**：`ResumeUploadForms.tsx:56` `<p id="resume-upload-error" role="alert">{message}</p>` —— **只渲染 `message`**；`error` 码不进 DOM。
- **双 SSOT 接受风险（登记）**：API `hint`（`resume.service.ts:63-65`/`:66-69`）与 web copy（`ocr-preview-ui.ts` 两表）是两处独立文案源，**无编译期/断言耦合门**——本刀只保证语义对齐（§1.5），不承诺逐字耦合；后续 API hint 改动不会自动使 web 文案翻红。接受理由：耦合两源会把展示层绑到 API 内部字段（§1.7 已否决直传），收益低于越界成本。可选加强（EXEC 裁量·本卷不预支）：在 proof 增关键指令词耦合断言（两语均含「密码/解除」「格式/类型」词根）。
- **结论（关键实况·较 backlog 措辞更严）**：缺位的后果**不是裸码泄漏**（无任何路径把 `encrypted` 字面渲给用户），而是**两侧同时丢掉可执行指引**——
  - en：`'The file upload did not complete. Check the file and network and try again. Recognition results are never invented.'`
  - zh：`'文件上传暂未完成，请检查文件和网络后重试。不会编造识别结果。'`
  - 对「密码保护 PDF」而言，这两种文案都指向**错误的自救动作**（重试/查网络永远不会成功，正解是去密码或改粘贴文本）；API 侧已有的 zh `hint`（`:64`/`:68`）在**中英两语**均被丢弃（`mapResumeUploadError` 从不读 `hint`）。故 backlog 行「en 面落空」的表述**偏窄**：zh 面同样落空，缺陷是 locale 对称的。
- **web 独有 4 码**（非 API 上传链产出·如实披露）：`ocr_preview_format` / `public_preview_read_only` / `upload_timeout` / `upload_failed`。补两键后键域 = **22**，其中 18 = API 上传链码域全命中、4 = web 独有。
- **`messages/*.json` 不涉**：`apps/web/messages/zh.json`/`en.json` 的 `resumeUpload` namespace 只有 5 个 UI 文案键（`helpPreview`/`helpStandard`/`cardPreview`/`cardStandard`/`banner`·亲读），**不含机读错误码键**。故本刀「i18n 表」= `ocr-preview-ui.ts` **单文件内的两张字面表**，非 `messages` 键域 → **L-02 #264 全文件负断言面不触发**（backlog 修订处方中该前置条件不适用·如实标注）。

### 0.3 N1b gap 臂原文亲读 + 相邻域边界

`uc-e2e-003-nhp-neg.proof.ts:184-194`（逐字）：`section('N1b · encrypted/magic_mismatch 缺位段（显式 gap 臂 · 产品契约缺口如实登记）')` → 每码 4 断言：`∉ zh map 键（blob 级亲证）` / `∉ en map 键` / `en 面 fail-closed 走 upload_failed 兜底（error 码透传+文案兜底）` / `zh 面同兜底`；`:194` `console.log('PIN N1b 产品契约缺口登记：…… 产品码修复出本刀界 · 零断言放宽 · gap→case-only 措辞仅经 EXEC')`。同文件 `:158-161` 前置锚另有「zh map 恰 20 键 / en map 恰 20 键 / 20/20 parity / en 20 值 CJK-free」四断言；`:79-87` `EXPECTED_18`/`GAP_2`/`MAPPED_16`（`MAPPED_16 = EXPECTED_18.filter(!GAP_2.includes)`）。

**F1 相邻域（`:269-284`·9 断言）**：`isUploadTimeoutError` 三形分类 + `mapResumeUploadAbort` 的 `upload_timeout` en/zh exact 钉 + 8s/35s 常量关系——**全为 web 侧独有码/故障臂，与本刀两码不同族、不同源、不同断言行**，本刀零触（零重叠已亲证）。

**另一处受管常量**：`apps/web/test/uc-e2e-003-i18n-locale.proof.mjs:110` `assert.equal(zh.size, 20, 'zh map must keep exactly 20 machine codes')` —— 补两键即红，**属同一真话的常量同步面**（详见 §1.1 改动面表）。

---

## §1 刀型裁决（二择一 · 协调方令要求 · 本席建议 + 理由 + 否决表）

### 1.1 判据落表（协调方给定判据：裸码泄漏=产品缺陷 / fallback 已覆盖=可接受）

| 判据 | 亲证结果 | 权重 |
|---|---|---|
| 用户可见裸码泄漏？ | **否**。唯一 DOM 消费面 `ResumeUploadForms.tsx:56` 只渲染 `message`；`error` 码仅作返回值流动。无任何路径把 `encrypted`/`magic_mismatch` 字面渲给用户 | 反证「产品缺陷」最强主张 |
| fallback 是否覆盖？ | **形态覆盖·语义不覆盖**。文案存在、CJK-free、不编造（fail-closed 完好）；但内容是「检查文件和网络后重试」，对加密 PDF / 魔数不符是**指错自救方向**——重试恒败 | 指向产品瑕疵 |
| 缺位是否 locale 对称？ | **是**。zh/en 双表同时缺，zh 用户同样落 `upload_failed`（`:194` N1b zh 兜底臂即在证）——非「en 面独缺」的 i18n parity 小疵 | 扩大影响面 |
| 两码可达性/基率 | 高。加密 PDF、改扩展名（把 .docx 改名 .pdf）、扫描件误标为 pdf 均为常见真实输入 | 扩大影响面 |
| 数据/资金/安全影响 | **零**（不落库、不计费、不放过非法字节——fail-closed 面完好） | 定级 P2 |
| 修法体量 | **单产品文件 + 4 行文案**（§1.2 实测表）；零迁移、零跨包、零契约改、零状态机 | 小刀可承 |

### 1.2 裁决建议=**方案 A · 产品映射小刀**（补两键 zh/en · 单文件）

**理由（三点·按判据链）**：

1. **判据不落在「可接受」侧**：协调方判据的另一半太窄——fallback 覆盖了「不泄漏」但没覆盖「不误导」。残缺不是显示层的空，而是**给用户指了一条必败的路**；对 P2 资源而言，4 行文案的代价远低于长期保留错指导。且缺陷 **zh/en 对称**，不是单纯 i18n 补键讨好，而是两语产品体验的真实缺口。
2. **修法边界极窄且不触风险面**：产品码只动 `ocr-preview-ui.ts` 单文件的两张字面表（+4 行、1 行注释改数）+ 引用同一真话的 3 处断言常量/臂形；零迁移、零 DTO/契约改、零 API 改、零 `messages/*.json` 键域动、零新受管依赖。**停止条件「改动面跨多包 / 须迁移」零命中**。
3. **收口语义干净**：这项缺口是 UC-003 NEG-01 收据里唯一被显式登记为「待产品兑现」的臂。此刻补齐后 N1b 从「缺口登记臂」翻为「补齐在证臂」，`16⊆20` 变 `18⊆22`，契约方向（API 码域 ⊆ web 键域）**首次全覆盖（18⊆22·仍非等集·web 独有 4 码）**——比永久保留一条 gap 注记更能说明系统当前真话。**但**：EXIT0 仍 = case ≠ covered，矩阵 NEG 格值 `case-only` 不动，coveredCount=8 不变（§5）。**接受风险**：API hint 与 web copy 双 SSOT 无耦合门（§0.2 登记）——本刀以语义对齐而非逐字耦合处置。

### 1.3 方案 B（docs 钉刀：如实登记为 known gap·不修）留存条件

方案 B 可选，仅当下列任一成立时**改判并如实翻卷**（本席不预支）：

- 协调方判定 P2 资源优先序下「误导性兜底」可接受（判据取「无裸码泄漏即过线」）；或
- EXEC 实测发现改动面越出本卷 §1.4 清单（跨包/须迁移/lint 预算不可授权）→ 触 §8 停止条件，回炉为 B 并只补注记。

**方案 B 的落法（若翻 B）**：零产品码；仅 `gap-bug-backlog.md` 追加一行「维持 known gap · 判据=兜底已覆盖·不修」+ 矩阵 `:114`/case-matrix `:109` 各一行 additive 注记；N1b 臂零动。**代价如实**：用户持续收到指向错误的自救指引，且该缺口将第二次被登记为「已知」——本席不推荐。

### 1.4 改动面实测（方案 A · EXEC 面清单·逐件亲点）

| # | 文件 | 类别 | 改动形（行数） | 备注 |
|---|---|---|---|---|
| 1 | `apps/web/lib/resume/ocr-preview-ui.ts` | **产品源** | `ERROR_MESSAGES` +2 行（zh）· `ERROR_MESSAGES_EN` +2 行（en）· `:42` 注释「same 20 machine codes」→ 22（1 行） | **唯一产品码文件**·单文件·共 +4 行文案 |
| 2 | `apps/web/test/uc-e2e-003-nhp-neg.proof.ts` | 测试资产 | 前置锚 20→22（2 断言值）· **`GAP_2`/`MAPPED_16` 两条常量行改形（r5 定谳：删 `GAP_2` 声明）**（取形：`const MAPPED_18 = EXPECTED_18`；**删 `GAP_2` 声明**——`no-unused-vars` 不触发、lint 增量恒 +2；**不设 `GAP_2.length === 0` 负向臂**：该臂若设即 **140**，与 §1.6/§2-5 的 139 门槛冲突·**禁两头都写**）· `EN_EXACT` +2 · `ZH_EXACT` +2（两码 zh exact）· N1b 段翻为「补齐在证」臂（含未知码兜底继任臂·§1.6）· N2 缺位 fallback 臂（4 断言）退役、改 exact 钉 · **存量真话面逐条改写（rev r4 席2 P1-2 补全·全量清单见表后「断言面存量真话清单」）**：头注释 `:8`「zh/en 20 键」→22 且随机读行号重锚 · `:14-15`「N1 两段形 · N1a 已映射段 16 码」→「单段形 18 码全映射」· `:16-18` N1b 缺口段措辞翻「已补齐在证（18/18）」· `:20`「16 已映射码 exact + 2 缺位码 fallback」→「18 码 exact + 未知码兜底」· 标签 `:158-161`「zh/en 20 键·20/20 parity·20 值 CJK-free」→22/22/22 · N1a 段 `:177-178`「16 已映射码」→18 码 · N1b 段标题/臂 `:184-185` 翻臂 · `:194` 缺口 PIN 撤换为「22 键全映射」· section 标题 `:197`「16 码 exact + 2 缺位 fallback」→「18 码 exact」· `:215`「N2 16 码 en 文案全 CJK-free」→18 码（**该臂过滤面=`MAPPED_18`·非 22 键域·禁一刀切改 22**）· footer `PIN :303`「N1b 产品契约缺口」撤换（**footer 与 `:194` 两处必须同改·漏一处即留旧真话**）· `:34`「NEG gap→case-only」注记按届实改写。**迭代源收紧（r5 席2）**：新 N1b 臂的 `for...of` 源**只许字面** `['encrypted','magic_mismatch']`——**明禁**由 `GAP_2`/任何可空集合派生（含 `EXPECTED_18.filter(...)` 补集派生）；点名形态：**`MAPPED_18` 忘改（仍 16 码过滤）=131 总断言（N1a −4 + N2 −4 = −8）且 EXIT=0**（r6 席2 补正：N2 段因过滤面收窄同时丢 exact +2 与 hint +2——计数门只认总数·拦不住同数替换/空循环）。**算式（r5 补齐·r6 拆树）**：**两棵树须分开述、禁混算**——① **EXEC 新臂形投影树**：139−12=**127**（新 N1b 12 臂若全缺、仅余未知码 2 臂）；② **现树直改 `GAP_2` 空实验树**（r5 席2 实测）：**125 总/6 FAIL**——`MAPPED_16` 由 `GAP_2` 推导⇒N1a 18 码中两码 ∉ 映射（4 FAIL）+ N2 exact 两码无 `EN_EXACT` 值（2 FAIL）；该实验树 +2 未知码臂=127 只是补算，与①数值同而口径异（①投影 / ②实跑），**不得互相引证**（空循环静默零迭代且 `:194`/`:303` 否证 PIN 照旧打印=假绿）。现树两处 `for (const code of GAP_2)`（`:186` N1b / `:220` N2 fallback）**须同时撤除或改源**。**形钉（P2）**：`EN_EXACT`（`:114`）/`ZH_EXACT`（`:136`）**保持 `new Map<string,string>([[...]])` 形**（头注释 `:113` 已述避 naming 噪声），**禁改 object literal**（对象字面量下含 `_` 的键再产 +1 naming warning/对象·推翻 +2 核定）；新增两码只加键值行对。头注释内 `ocr-preview-ui.ts` 行号引用随插键 +4 位移重锚（`:45→:47`·`:129→:133`·`:133→:137`·`:137→:141`·`:142→:146`·机械连带·勿沿用起草行号） | 断言**只增/只强化**，零谓词放宽（§1.6） |
| 3 | `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` | 测试资产 | `:110` `zh.size 20`→`22` + 断言文案「exactly 20 machine codes」→`22` · **`:111` parity 标签「ERROR_MESSAGES_EN keys must be 20/20 parity with zh」→`22/22`**（rev r4 补全·断言谓词不动仅文案；同 `zh.size` 一并改，漏改则断言名留旧真话） | 同真话常量同步 |
| 4 | `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | 文档 | `:114` additive EXEC 注记（带日期 `16⊆20→18⊆22 @2026-10-30`·格值 `case-only` 零动声明·**断言数按届值 `129→139`**）· `:174` additive（两码已映射·产品映射残余闭·`129→139`/18 码↔22 键）· P1-6 `:274` 注记须逐字含「**错误码 en 产品映射残余已闭（22 键）/Playwright locale=en DOM 对两码仍缺（DOM-01 收据已挂 case-only·矩阵 `:174` 在案·未升格）**」＋「**本条更新上句**——**逐字引 `:274` 原文「仍缺 Playwright locale=en DOM + 错误码 en 产品映射」**——其中『**错误码 en 产品映射**』子句为已闭（2026-10-30 EXEC 后）·『**Playwright locale=en DOM**』仍缺」；**禁引不存在的整串**（r4「仍缺错误码 en 产品映射」系拼接误引·本句按 `:274` 逐字校正）· **FAULT 格（`:114` 第 3 列·r6 更正列标）注记口径**：收据 log `6fbacc29:148-156` **不可变（史录）** / proof blob 与 `:269-284` **按 EXEC 届值重锚**（F1 仍 9 条断言）——与 case-matrix `:111` 史录口径**并置同形**（§1.4 第 5 件）· **policy `CAP-SANCTION-2456` 注记「两 proof 断言面」为起草 commit 届史录**（r1 P1 已证实际**三件**：`nhp-neg`/`i18n-locale`/`nhp-adv`）·本卷 §1.4 九件为准·policy 注记不回改（史录） | §1.0.3 双表同步令·三处均零动格值/行值·**注记不得沿用起草届数字**：`129 断言`→**139**、`16 码 en 映射`→**18 码**、`20 键`→**22 键**、proof blob `a5dd5980` 随改后重锚（行号亦按届值重取）——**注释全量 `grep -nE` 清单见表后** |
| 5 | `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | 文档 | `:109` additive 注记（带日期 `16⊆20→18⊆22 @2026-10-30` 兑现·行值零动声明·断言数 `129→139`）· **`:111`（`NHP-003-FAULT-01` 行）additive 史录注记（rev r4 补全）**：该行「`pnpm uc003:nhp-neg:prove` EXIT=0 · **129 断言**·proof blob **`a5dd5980`**·`:269-284` 恰 9 断言」为 **2026-10-27 届值史录**——本刀后 NEG-01 总断言 **139**、proof blob 变更、F1 断言域 **9 条不变**（仅随前段行位移重锚行号）；**史录不回改**（「129」与收据 log `6fbacc29:148-156` **不可变**；proof blob 与 `:269-284` **按 EXEC 届值重锚**·F1 仍 9 条——与矩阵 `:114` FAULT 格**并置同形**），行值/格值零动 | 用例 SSOT 同步·行值不动·**注记不得沿用 `129`/`a5dd5980`/`:269-284` 作当前值**（`129` 与 log `6fbacc29:148-156` 仅可作**不可变史录**引用；**proof blob 与 `:269-284` 须按届值重锚后引用**·F1 仍 9 条） |
| 6 | `ai-docs/delivery/gap-bug-backlog.md` | 文档 | **追加新行**（`append-only`·`:953` 原行零字改）：GAP 已兑现+commit 锚；**GAP 兑现行锚=EXEC 门绿后第二个 commit（或 PR 号）·禁同 commit 内自引 SHA** | 兑现闭环 |
| 7 | `apps/web/package.json` / root `package.json` | 配置 | **仅当 lint 越限**：`--max-warnings` 恰等步进（见下行） | 常设预授权件 |
| 8 | `apps/web/test/uc-e2e-003-nhp-adv.proof.ts` | 测试资产 | `KNOWN_CODES`（`:39-42`）+ concat（`:56-59`）**恰等 20 键全集 → 补两码成 22**（12+10）· `:55` 注释「全量 20」→22 · `:60` 断言名「全 20」→22 · PC 循环 10→12 码 **+4 断言（期望 67→71）** · 头注释 `:4-7` 的 `ocr-preview-ui.ts` 行号引用随插键 +4 重锚（`:68-70→:72-74`·`:123→:127`·`:129→:133`·`:133→:137`） | 第 3 件测试资产·与 §2-5 期望值联动；**不触=须 §3 显式登记「接受覆盖完整键域过期」+理由，Ban 默认沉默略过**——本卷选择触，故不登记过期 |
| 9 | `ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md` | 文档（harness 史录卷） | **§6 「翻面注记（append-only · 上文表行本体零改）」新增一条**：「2026-10-30 UC3M 后：**错误码 en 产品映射残余已闭（22 键）**/Playwright locale=en DOM 对两码仍缺/partial 零动」；同注**交代 `:88`（P1-6 行「静态 prove 已挂；DOM e2e-ui + 错误码 en map 产品闭环仍缺」）与 `:93`（§5 product-sense「`ERROR_MESSAGES` zh-only 列为下一刀产品债」·评审记 `:94`·本树 99 行 `grep -n` 实测 `:93`）同为起草届史录行**，实态以新注记为准 | **上文表行本体零改·仅 append-only 一条**（`:99` 2026-10-14 注记亦零触）；不登记此件则 EXEC 后 `:88` 仍称「仍缺」=留假话，登记则不触 §2-4「多未登记路径即停」· **注记措辞避撞禁令（r6）**：须逐字含「**产品侧缺位已补·非本 harness 绿·≠covered**」，禁出现把本 harness 写成 covered/产品闭环已证/结构绿升格的措辞 |

**断言面存量真话清单（rev r4 席2 P1-2 · 显式枚举取代 catch-all）**：命令 `grep -nE "16 码|2 缺位|两段形|缺口|缺位|20 键|20/20|全 20"` 对本刀 4 件代码面本 turn 亲跑 —— **命中 18 行**（`nhp-neg` 16 · `i18n-locale` 1 · `nhp-adv` 1 · `ocr-preview-ui` 0）；另**语义同类补列** 4 行（正则不覆盖：`nhp-neg:161`「20 值全」·`i18n-locale:110`「exactly 20 machine codes」·`nhp-adv:55`「全量 20」·`ocr-preview-ui:42`「same 20 machine codes」）与 **`GAP_2` 迭代源 2 处**（`:186`/`:220`）。取数规则（防一刀切）：**键域面 20→22**（键数/parity/CJK-free 全值）· **上传链已映射段 16→18**（N1a/N2 exact/CJK-free 环）· **缺位面（2 码/gap/PIN）整体翻「补齐在证」或撤换**。

| 命中点 | 现文 | 处置 |
|---|---|---|
| `nhp-neg:8` | 头注释「:19 zh 20 键 · :45 en 20 键」 | 改写 22；`:45→:47` 等行号重锚（+4） |
| `nhp-neg:14-15` | 「N1 契约对账 · 两段形」/「N1a 已映射段 16 码」 | 改写「单段形 · 18 码全映射」 |
| `nhp-neg:16-18` | 「N1b 缺位段 2 码…缺口显式 gap 臂」/「…登记缺口」 | 改写：翻「补齐在证（18/18）」·删缺口语 |
| `nhp-neg:20` | 「16 已映射码 exact…2 缺位码 fallback 形臂」 | 改写：18 码 exact + 未知码兜底 |
| `nhp-neg:158-161` | 「zh/en map 恰 20 键」/「20/20 parity」/「20 值全 CJK-free」 | 改写 22/22/22（`:161` 正则未覆盖·语义补列） |
| `nhp-neg:177-178` | N1a 注释/section「16 码」 | 改写 18 码 |
| `nhp-neg:184-185` | N1b 注释/section「2 码…缺口」 | 改写：翻臂标题 |
| `nhp-neg:186` | `for (const code of GAP_2)`（N1b） | **改源**：字面两码数组（P1-3·禁 `for...of GAP_2`） |
| `nhp-neg:194` | 缺口 PIN | 撤换「22 键全映射」 |
| `nhp-neg:197` | N2 section「16 码 exact + 2 缺位码 fallback 形」 | 改写「18 码 exact + 未知码兜底」 |
| `nhp-neg:215` | 「N2 16 码 en 文案全 CJK-free」 | 改写 18 码（过滤面=`MAPPED_18`·**禁改 22**） |
| `nhp-neg:220` | `for (const code of GAP_2)`（N2 fallback） | **撤除**（fallback 臂退役·勿留空循环） |
| `nhp-neg:303` | footer PIN「N1b 产品契约缺口」 | 撤换「22 键全映射」（与 `:194` 同改） |
| `i18n-locale:110` | 「exactly 20 machine codes」 | 改写 22（语义补列） |
| `i18n-locale:111` | 「20/20 parity」 | 改写 22/22 |
| `nhp-adv:55` | 「全量 20 已知码」 | 改写 22（语义补列） |
| `nhp-adv:60` | 「全 20 已知码」 | 改写 22 |
| `ocr-preview-ui:42` | 「same 20 machine codes」 | 改写 22（§1.4 第 1 件·语义补列） |

**保留理由（不改写·仅 additive 注记）**：矩阵 `:114`/`:174`/`:274` 与 case-matrix `:109`/`:111` 为**历史行文**（记录 2026-10-27 届实况），按 §1.4 第 4/5 件以 additive 注记承登「16⊆20→18⊆22 @2026-10-30 · 129→139」，**行值/格值零动**；档案面 `harness/uc-e2e-003-i18n-locale.md:99`「20/20 键 parity」为 append-only 史录·零触（§3-4）。**EXEC 若复扫出现本清单外命中即回炉登记（Ban 静默略过）**。

**lint 预算（推定·EXEC 实测为准）**：`apps/web/package.json:7` `eslint . --max-warnings 605`、root `package.json:8` `--max-warnings 5408`。先例承登（`execution-master-checklist.md:2729`）已机证「`ERROR_MESSAGES(_EN)` 每新增一条 snake_case 键 +1 warning」（UC003 i18n 刀 en map 20 键=+20 全额归因）——**该先例只覆盖全含 `_` 的 snake_case 键，不可外推**。机制核（`packages/config/eslint.config.base.mjs:76-79` `memberLike→camelCase`；`@typescript-eslint` 的 `isCamelCase`=首字符小写且不含 `_`）：`encrypted`（全小写无 `_`）**通过→0 warning**；`magic_mismatch`（含 `_`）违规→**1 warning/表 × 2 表** ⇒ 增量 **+2** → **web 605→607 / root 5408→5410**（UPPER_CASE const 不产 naming warning）。越限沿常设预授权恰等步进（按届时实测值恰等），**禁多吃**。**若 EXEC 弃置 `GAP_2` 声明（保留空数组而零引用）则 `no-unused-vars` 再 +1 → +3（608/5411）**；删除该声明或继续引用→不加。**r6 补：`EN_UPLOAD_FAILED`/`ZH_UPLOAD_FAILED` 若在新臂形中失引用（未知码兜底臂不再引常量）则 `no-unused-vars` 再 +2 → 609/5412**；本刀未知码兜底臂取强形（`EN_MAP.get('upload_failed')` 与常量**双比**）继续引用两常量 → 不加（实测落地 607/5410）。EXEC 若实测与推定不符，以实测值落步进并在卷内如实改数。

**体量判定**：**单包单文件产品码**（`apps/web`）· 零迁移 · 零跨包 · 零契约/DTO 改 · 零 API 改 · 零新依赖 → 停止条件「改动面跨多包/须迁移」**不触发**（本卷如实绿）。

### 1.5 拟落文案（EXEC 逐字 pin·本卷只给基准形·可微调但须 CJK-free/指引正确）

| 码 | zh（拟·接既有全角句读风格） | en（拟·CJK-free） | 指引要点 |
|---|---|---|---|
| `encrypted` | `该 PDF 受密码保护，系统无法读取其中内容。请先解除密码保护后重新上传，或改为粘贴文本；若文件确实未加密，请改传其他文件。` | `The file is encrypted and cannot be parsed. Remove the password protection and upload again, or paste the text. If the file is not actually encrypted, please upload a different file.` | 语义对齐 API `hint`（`resume.service.ts:64`）但**首句非逐字**（(a) 改写：「受密码保护/无法读取内容」≠「已加密/无法解析」·避 zh 面纯语义纪律违规）；把「解除密码」提到首位；**尾句兜底加密启发式误判**（`looksLikeEncryptedPdf`/`ENCRYPT_HINT` 判据本体零动） |
| `magic_mismatch` | `文件内容与声明格式不符，请确认文件类型后重新上传。` | `The file content does not match its declared format. Please confirm the file type and upload again.` | 对齐 API `hint`（`:68`）语义；zh 行为**最小换词形**（非逐字·非仅句读）：API「文件内容与声明的格式不符，请确认文件类型后**重传**」→ 本行「…与**声明格式**不符…后**重新上传**」（去「的」+「重传」展开），以最小词面差满足 zh 列纯语义纪律；**post-prove 须把两码逐行比对结论（差异点/是否仅句读）记入收据**（`encrypted`=首句 (a) 改写·`magic_mismatch`=最小换词形·两者均非逐字） |

**文案口径五条硬约束**：① en 值 **CJK-free**（`i18n-locale` S4 `:112-113` 与 `nhp-neg` 前置锚 `:161` 双门会扫）；② 两语不得出现「重试/network」类误指（证明缺陷已消除，不是换个壳继续误导）；③ 不引入编造性承诺（不得说「已保存/已识别」——`web-logic.proof.ts:748-760` 反编造族断言会撞）；④ **文案与 API `hint` 的关系（zh 面纯语义纪律·无机械门）**：en 列由 ① **CJK-free 机械兜住**（`i18n-locale:113` / `nhp-neg:161` / `nhp-adv:53` 三处同扫——en 文案既 CJK-free 即不可能包含 zh hint）；**zh 列无机械门**——「与 API `hint` 不得逐字同文」为**纯语义纪律**，须由 **post-prove 席人工核对**（两码逐行对 `resume.service.ts:64`/`:68`；`magic_mismatch` 行已有换词差异，非仅句读）·**核对结论（逐行差异点+「是否仅句读」判定）记入收据**（与 §1.5 `magic_mismatch` 行同口径）。**不得援引 N2「zh hint 零透传」臂**（`:217-219`·原 gap 段 `:224` 同谓词）作 zh 面机械证：该臂实以 `locale='en'` 行使，`mapResumeUploadError` 从不读 `hint`（`ocr-preview-ui.ts:129-135`），其谓词比较「en 文案是否包含 zh hint」，在 CJK-free 成立后**恒真**——对 zh 列完全不可见；**post-prove 若援引该臂即伪证**；⑤ **值须单行且禁 ASCII 单引号**（`nhp-neg` `parseMap` 正则 `'([^']*)'` 与 `i18n-locale` `parseStringMapEntries` 同险——截断即解析失败/键值错位）。

**加密判定启发式风险（登记）**：`looksLikeEncryptedPdf`/`ENCRYPT_HINT` 为启发式判据（本刀零改），可能误报「已加密」；尾句「若文件确未加密请改传其他文件」提供可行动兜底——若届值证明误报常见，归后继产品刀（本卷不预支）。

### 1.6 断言迁移纪律（**前提失效臂退役 ≠ 放宽**）

- N1b 的 8 条 `∉ 键` 断言：其前提（两码不在表内）被产品修复**消灭**，退役属**前提失效**，非为求绿删断言。
- **exact 钉自证性降调（r6 #3）**：两码的 `EN_EXACT`/`ZH_EXACT` 为 `ocr-preview-ui.ts` 两表的**同源复制**——exact 断言只证「键存在且映射值与表一致」，**不证文案正确性**（同源复制可同步错）。文案正确性由 §1.5 逐字 pin + post-prove 人工比对（与 API `hint` 的差异点/是否仅句读记入收据）承担；**禁以 exact 绿宣称文案已审**。
- 替换臂**强度更高：兜底属性由 ADV V1/V3（en）+本臂（zh）承接**：原臂只钉「兜底文案=upload_failed 逐字」；新臂钉「∈zh ∧ ∈en（4）+ en exact 文案（2）+ zh exact 文案（2）+ en CJK-free（2）+ 码路径真行使（2）」——**同一码面上从「否证」变为「存在+逐字」**。**12 条新臂逐字谓词（r5 席2 钉·`code ∈ ['encrypted','magic_mismatch']` 字面迭代·每码 6 条）**：
  1. `N1b ${code} ∈ zh map 键`：`ZH_MAP.has(code) === true`
  2. `N1b ${code} ∈ en map 键`：`EN_MAP.has(code) === true`
  3. `N1b ${code} en 文案 exact 钉（map 本值）`：`mapResumeUploadError(422, { error: code }, 'en').message === EN_EXACT.get(code)`（`EN_EXACT` +2 键值行）
  4. `N1b ${code} zh 文案 exact 钉（map 本值）`：`mapResumeUploadError(422, { error: code }, 'zh').message === ZH_EXACT.get(code)`（`ZH_EXACT` +2 键值行）
  5. `N1b ${code} en 文案 CJK-free`：`typeof EN_MAP.get(code) === 'string' && !CJK.test(EN_MAP.get(code) as string)`（**r6 #5 可鉴别化**：`typeof` 前置使「缺键=undefined」与「空/非字符串」可鉴别，禁裸 `!CJK.test(undefined)` 类恒真形）
  6. `N1b ${code} 码路径 422 真信封透传`：`const env = ENVELOPES.find((e) => e.code === code)!; 'hint' in env.body && env.status === 422 && readResumeUploadErrorCode(env.body) === code && mapResumeUploadError(env.status, env.body, 'en').error === code && mapResumeUploadError(env.status, env.body, 'en').message === EN_EXACT.get(code)`（**r6 #6 可鉴别化**：增 `'hint' in env.body` 钉真信封形 + `message` exact 全链——真信封含 zh `hint` 字段，区别于第 3 条合成最小体；码提取→error 透传→en exact 三链在证）
  **判据（r5 席2）**：每条谓词须**可鉴别**——**恒真谓词**（`GAP_2.length === 0`、与臂无关的常量比较）与**同数替换**（用等量无关断言替换一条）**计数门（139±0）均拦不住**；故 §2-5 收据须**逐臂列名对齐上述 12 条原文**（另 +2 未知码兜底臂），任一名不符即停。
- **兜底继任臂（zh）**：未知码兜底臂 ×2 locale——合成码 `some_unknown_code`（非 18 码、非 22 键域）分别以 `en`/`zh` 行使，逐字钉 `EN_UPLOAD_FAILED`/`ZH_UPLOAD_FAILED`，既保留既有常量（不删）又守住 fail-closed 兜底属性；en 面另有 ADV V1/V3 承接（`uc-e2e-003-nhp-adv.proof.ts:76-92`/`:109-135`），本臂补 zh 面——**即原 N1b zh 兜底断言的继任者**。
- **N2（rev r4 口径统一）**：N2 旧「缺位 2×2 fallback 形」4 断言同规则退役 → **既有** exact en loop +2（`MAPPED_16`→`MAPPED_18` 过滤面 16→18 码·`EN_EXACT` 补两键值行）· **既有** hint 零透传 loop +2（同过滤面）· **zh exact 在 N1b 新臂内计·N2 不重复计**（不新增 N2 zh exact 臂）；N1a 由 `MAPPED_16`→`MAPPED_18` 自动扩 +4。
- 净断言数：以 EXEC 实跑原值录入（2026-10-27 基线 **129**）；按上述替换清单定 **139（±0）**（+4 N1a · -8 N1b 旧 · +12 N1b 新 · -4 N2 旧 fallback · +2 N2 exact 扩 · +2 N2 hint 扩（该两臂在 CJK-free 成立后为**恒真形制臂**·非鉴别臂——**该臂为整串 `includes(env.hint)`**：新 zh 文案不含完整 hint（「请先解除」断开「请解除」子串），**即便未来加 zh 变体亦为绿**；**不得据此声称 zh 面同文已机械证**，与 ④「即伪证」口径闭环）· +2 未知码兜底臂），**断言谓词零放宽**（只增不减，`uc003x` N2/N4 双面拆分先例形可循）。**不设 `GAP_2.length === 0` 负向臂**——该臂若设即 **140**（与本节/§2-5 的 139 冲突·禁两头都写；r5 定谳=删 `GAP_2` 声明）。**9 段分录对齐（r5 席2·§2-5 收据同形）**：前置锚 **9** / N1 **6** / N1a **36** / N1b **14**（12 新臂 + 2 未知码兜底）/ N2 **33** / N3 **19** / N4 **8** / F1 **9** / D1-PF **5** ⇒ **139**。

---

## §1.7 否决表（落选/NOT claimed 如实留痕）

| 落选项 | 否决理由 |
|---|---|
| **把 API `hint` 直传 web 渲染**（免补文案·一处改） | 否决：`hint` 是 zh-only（`resume.service.ts:64/:68`），en 面直传即 CJK 泄漏，撞 `nhp-neg` N2「zh hint 零透传」与 S4 CJK-free 双门；且把展示文案耦合到 API 内部字段，越界改契约。 |
| 迁 `messages/*.json` namespace 注册两码 | 否决：与 UC003 裁决（`uc003-i18n-REQUEST.md` rev2 定谳「zh map 留 `ocr-preview-ui.ts` 文件内·不迁 messages」）相悖；且触发 L-02 #264 全文件负断言面复检，体量与本 P2 不匹配。 |
| 改 `mapResumeUploadError` 兜底策略（未知码回显码值/400 显式） | 否决：兜底是安全面（fail-closed·不编造），改策略影响全部未知码，远超两码边界。 |
| 顺带为 web 独有 4 码/其余 16 码重铺断言 | 否决：既有臂已铺（`uc003x` §1.3 先例·Ban 重复洗）。 |
| 触碰 `nhp-neg` F1 臂（`:269-284`）或 `web-logic` TC-RES-081 | 否决：不同族不同源（abort/timeout 与两码无交集），零触只读。 |
| 改矩阵 `:114` NEG 格值（`case-only`→其他）或升 covered | 否决：EXIT0 = case ≠ covered；本刀是产品码补齐，不是证据面升格。格值/coveredCount=8 零动。 |
| 顺手改 `uc003x-REQUEST.md`（历史 closed 卷）正文 | 否决：`closed` 卷史录不洗；只在 backlog 追加兑现行。 |

---

## §2 验收门矩阵（起草门本 commit 适用 · EXEC 预基面届时重 pin · 数字以实跑为准）

1. **docs:check（红停条款）+ cap 预算核**：起草前本树亲跑 **EXIT=0 · scanned 2455 = cap 2455 恰等零余量** → 本卷 +1 必越 → **恰等步进 2455→2456 随刀落码**（`MAX_FILES = 2_456` + `CAP-SANCTION-2456` 注记·**单件恰等先例形**·协调方「越限沿常设预授权恰等步进预登」随令）；越限臂四联动点同步 `public-text-policy.proof.mjs`（loop `2_456` / `atCap.scannedFiles 2_456` / 注入路径 `f-2456.md` / 期望码 `:2457` + 链注一行），落卷后 docs:check 预期 **scanned 2456 ≤ 2456 恰等**（本卷 commit 前复跑录值）。**rev r1–r5 修订 commit 前亲跑：EXIT=0 · scanned 2456 = cap 2456 恰等**（修订零新增受管文件·零再步进）。EXEC 若并线使 scanned+X > cap → 触「验收红不可修」停手上报（Ban 就地多吃 cap）。**并线 cap 取大（rev r4·r5 口径校正）**：§4 实测 evap cap **2461** > **origin/main 2455**（`origin/main:scripts/ai-docs/public-text-policy.mjs:275`=`MAX_FILES = 2_455`；本支起草步进后 2456=`HEAD:276`） > cwn 2448（续做席复核 2456） → **取大结论=max{evap 2_461, origin/main 2_461, 本支 2_456}=2_461（零再步进）**；EXEC 立项前重跑各线 `git diff --name-only` 与 cap，**按 union 实测恰等步进·禁按预登数（含本卷 2456）行使**。**EXEC 立项并线实测（2026-10-30 本 turn）**：fetch EXIT=0（origin/main `1ca3ce1da`=#184 evap 已并）→ merge `41ea16eef`；cap 取大 `max{evap 2_461, origin/main 2_461, 本支 2_456}=2_461` **零再步进**；**staged 阶段 docs:check 曾读 `PTP_FILE_LIMIT:2462>2461` 红=两冲突件 stage 冗余（2 文件 × +2 stage·沿 CAP-SANCTION-2430 同形坑）**，`git add` 收敛后重跑 **EXIT=0 · scanned 2458 ≤ 2_461**（零步进·零多吃；§1.4 九件全为既有受管文件行内编辑，零新增受管件）。
2. **PTP 亲跑**：`pnpm public-text-policy:prove` 预期 **12/12 EXIT=0**（越限臂随 cap 联动后仍需全绿）——本 commit 前必跑录值。**rev r1–r5 亲跑：12/12 EXIT=0**。
3. **markers 零命中 + est live=0**：本刀改动集（本卷 + 两 policy 脚本）四类标记词 + 行首冲突标记 grep 零命中（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:154-163`·不复抄卷内防自指）· est live=0（§6）。**rev r1–r5 修订 commit 改动集=本卷 1 件·marker/conflict grep 零命中·est live=0**。
4. **diff 面机检**：起草 commit `git diff --numstat origin/main` **恰 3 tracked 路径**=本卷（新件）+ `scripts/ai-docs/public-text-policy.mjs`（cap 行+注记）+ `scripts/ai-docs/public-text-policy.proof.mjs`（四联动点+链注）。EXEC 期 diff 面按 §1.4 **九件**（第 7 件条件性；第 8 件 nhp-adv；第 9 件 harness 史录卷 append-only·表行本体零改）逐件登记·多任何未登记路径即停。**rev r1–r5 修订 commit diff 面均恰 1 tracked 路径=本卷（policy 零动）**。
5. **EXEC 门（届时重 pin）**：`pnpm uc003:nhp-neg:prove` EXIT=0 且**实跑 139（±0）**——**<139 按 9 段差集归因·未归因即停**（**操作形**：收据列 9 段值 **9/6/36/14/33/19/8/9/5**（前置锚/N1/N1a/N1b/N2/N3/N4/F1/D1-PF）逐段对齐合计 139；**先定段、再定臂**，按段差集逐条归因；>139 亦须逐臂归因登记·禁静默多吃·禁只报总数）；**不得以 EXIT=0 单独放行**（空 `GAP_2` 循环可致 **127**（EXEC 新臂形投影 139−12；现树直改空 `GAP_2`（r5 席2 实测）=125 总/6 FAIL·+2 未知码臂=127）且仍打印缺口 PIN；**且不设 `GAP_2` 负向臂**——若设即 140，与 139 冲突）· 断言名/清单复扫 `grep -nE "16 码|2 缺位|两段形|缺口|缺位|20 键|20/20|全 20"` 对四件（`nhp-neg`/`i18n-locale`/`nhp-adv`/`ocr-preview-ui`）**每个命中项须对应 §1.4 清单的「改写」或「保留理由」**· **12 条新臂名逐条对齐 §1.6 原文（+2 未知码臂）**· `pnpm uc003:i18n-locale:prove` EXIT=0（S4 改数后）· `pnpm uc003:nhp-adv:prove` EXIT=0 **71** 断言零回退（基线 67→补两码 +4）· **`pnpm -C apps/web prove:public-copy` EXIT=0**（`test/public-copy.proof.mjs` 禁词面——两表新文案为新增公开文案面，本地目视无禁词仍须实跑·禁以静态目视代门）· `pnpm -C apps/web prove`（web-logic）EXIT=0 · `pnpm -C apps/web typecheck` EXIT=0 · `pnpm -C apps/web lint` **EXIT=0 且预算恰等步进后零余量**（先例坑：UI 门 `next build` 副产物 `apps/web/.next` 残留会虚增 warnings——**lint 前先清 `.next`**，`uc003x` §9P.1 P2-A 已登记为此为门前置）· **机检门（r6 #4·必跑）**：EXEC 提交前对 `apps/web/test/uc-e2e-003-nhp-neg.proof.ts` 跑 `git diff -U0 -- <file>` 逐行清单，须与 §1.4 第 2 件增删枚举**逐项对齐**——`−8`（N1b 旧否证 8 臂）/`+12`（N1b 新逐字臂）/`+2`（未知码兜底臂）/`−4`（N2 旧 fallback）/`+2`（N2 exact 扩）/`+2`（N2 hint 扩）/`2` 常量行（删 `GAP_2` 声明·`MAPPED_16→MAPPED_18`）/`4` 标签（zh 22 键/en 22 键/22-22 parity/22 值 CJK-free）/`2` 迭代源（N1b 改字面两码数组·N2 fallback 循环撤除）；并对 **12+2 条断言名**跑 `grep -F` 逐条命中（缺一即停·禁以计数门代断言名门）· 双表同步 diff 逐件登记（§1.0.3 `:166` 令）。
6. **行/列冻结**：矩阵 `:114` NEG 格值 `case-only` 零动（仅 additive）· FAULT/BOUND/ADV 格零触 · `:174`/`:274` 仅 additive · case-matrix `:109` 行值零动 · case-matrix `:111` **仅 additive 史录注记**（129/blob/`:269-284` 不回改）· **coveredCount=8 零翻转** · pins 十一值零翻。
7. **收据介质钉（rev r4 P2）**：EXEC 期门 stdout 收据只落 **`.log`/`.tmp`**（`TEXT_EXTENSIONS` 不含二者=非扫描面·`scripts/ai-docs/public-text-policy.mjs:39` 亲证）；若须落 `.md`（受管扫描 **+1**），**须先按届时合并树实测 union 恰等步进 cap** 后方可落卷，**禁以预登记余量充抵、禁多吃**。

## §3 范围外（越界即 FAIL）

1. **API 面零触**：`apps/api/**`、`packages/domain/**`、`packages/errors/**` 零 diff（两码出码行为/HTTP 状态/hint 文案均不动）。
2. **`messages/*.json` 键域零触**：`apps/web/messages/{zh,en}.json` 零 diff（本刀映射留 `ocr-preview-ui.ts` 文件内·L-02 #264 面不触发·如实登记）。
3. **契约/DTO/路由零触**：`resume.controller.ts`、`UploadResumeFileDto`、`serverFetch` 调用形零改。
4. **其他 UC/在飞线触面零触**：`uc003x-REQUEST.md`（closed 卷）正文零改 · `nhp-neg` F1 区（`:269-284`）与 `web-logic` 零触 · **凡 closed/收官史录卷（`uc003x-REQUEST.md`、`uc003-i18n`、`uc003-followup`、`uc003-arm4-filter`、`uc3f`、`evap` 等）正文与表行一律零改——仅允许其自身 append-only 注记面（且须 §1.4 明列）** · **`harness/uc-e2e-003-i18n-locale.md`：上文表行本体零改（`:88` P1-6 行与 `:93` §5 产品债行、`:99`「20/20 键 parity」均为起草/2026-10-14 届史录，不回改）；允许 §6 append-only 新增一条 2026-10-30 注记**（§1.4 第 9 件·实态以该注记为准；「22/22」真话落在 proof/矩阵注记与 §6 新条，不改史录）。
5. **共享 SSOT 零改（backlog 例外形）**：`product-campaign-LEDGER` / `execution-master-checklist` / `REMAINING-NORTH-STAR-QUEUE` 只读；`gap-bug-backlog.md` **仅 append-only 追加一行兑现注记**（`:953` 原行与行统计零字改·沿该卷自钉体例）。矩阵/case-matrix 仅 §1.4 所列 additive 注记。
6. **零迁移零配置**：无 DB/DDL/env/超时常量改动。
7. **键域覆盖完整性**：`uc-e2e-003-nhp-adv.proof.ts` 已列入 §1.4 第 8 件（触面），故不登记「接受覆盖完整键域过期」；若 EXEC 实测放弃触该件，须回炉并在本 §3 显式登记「接受覆盖完整键域过期」+理由（Ban 默认沉默略过）。
8. **`unstub-inventory` 行号指针显式接受过期（r5 席2 ⑩）**：`ai-docs/delivery/harness/unstub-inventory.md:33`/`:125` 引 `ocr-preview-ui.ts:18/:61`——`:18` 不动，`:61` 随 zh/en 两表插键位移 **+2/+4**（视插键位）。本刀**不触该卷**（不新增 §1.4 九件外路径，避 §2-4 停手），显式接受该 doc-side 指针过期；后续 unstub 卷维护刀一并重锚（非产品码/断言面，零功能影响）。

## §4 依赖 · 在飞零重叠核

- **①上游已满足**：两码出码链全在树（§0.1 亲读）；映射单源与两张表在树；断言面清单（3 文件）已逐行定位；形制先例（`evap`/`uc003x`）在树/在飞可循。
- **②在飞交叠核（rev r4 重测 · r5 扩面 · 逐线 pin 重取）**：`git worktree list` **16 树**（含本席）；**凡触两 policy 脚本者**（本 turn 实测 4 线：evap/cwn/ag18/cap-2272）触面与 cap 均按 `git diff --name-only origin/main...<line>` / `git show <line>:scripts/ai-docs/public-text-policy.mjs` 本 turn 亲跑：
  - `line/evap-draft` @**`2f54b0ddf`**（**父链已重写**：原 pin `64440511e` **非祖先**——`git merge-base --is-ancestor 64440511e line/evap-draft` **EXIT=1** 亲证·本支 merge-base=`3af835ad4`）。触面 **7 件**=`harness/evap-REQUEST.md` + `receipts/evap/2026-10-30-evap-1530-r1.md` + `scripts/ai-docs/public-text-policy.mjs` + `scripts/ai-docs/public-text-policy.proof.mjs` + `scripts/fixtures/uc-covered-dual/FX-DUAL-DETAILS-UNCLOSED.md` + `scripts/lib/uc-covered-real-gatherer.mjs` + `scripts/uc-e2e-018-covered-criterion.proof.mjs`（亲跑 7 行）；evap cap **2461**（该点 `MAX_FILES = 2_461` 亲证）。**r5 席实测 tip=`631698706`**（仅 +1 收据 `…-1550-r2.md`·面 8 件·cap 恒 2461）；**续做席复核 tip=`06c508d4a` 仍面 8 件/cap 2461**——EXEC 立项前以届时 tip 重跑。
  - `line/cwn-draft` @**`976f019ed`**（**pin 记 `976f019ed`（r5 席实测）**·当时 tip `9a94f3ba5` 触面 3 件/cap 2448 **恒等**；**续做席复核：该线已 EXEC 前进至面 7 件/cap `2_456`（tip 仍在并发推进）·仍 < evap 2461**）：触面（pin 点）**3 件**=`harness/cwn-REQUEST.md` + 两 policy（亲跑 3 行）；cap（pin 点）**2448**（`MAX_FILES = 2_448` 亲证）。
  - `line/ag18-draft` @**`4c2ea4c9f`**：触面 **233 件**（长史线·含两 policy）· cap **2_264**（`MAX_FILES = 2_264` 亲证）；`line/cap-2272` @**`52846f9d8`**：触面 **234 件**（含两 policy）· cap **2_272**（`MAX_FILES = 2_272` 亲证）——两线 cap 均 < evap 2461，**产品触面零命中**（见下行）。
  - **已知共享热面=两 policy 脚本 cap 区**（先例 `CAP-SANCTION-2446/2448/2450` 多线同号 dual-keep 双留）。**凡触两 policy 脚本者取大（本 turn 实测）**：**origin/main 2455**（`origin/main:scripts/ai-docs/public-text-policy.mjs:275`=`MAX_FILES = 2_455`）· **本支起草步进后 2456**（`HEAD:276`）· evap **2461**· cwn **2448**（续做席复核现 **2456**）· ag18 **2_264**· cap-2272 **2_272** → **取大结论=max{evap 2_461, origin/main 2_461, 本支 2_456}=2_461**；**EXEC 立项前重跑 `git diff --name-only` 与各线 cap 取大**（届时 evap `2461` 为下界候选），**禁按预登行使**（本卷 `2456` 只是本支基线值，不是并线终值）。
  - `line/uc2b-draft` @`2aadf98a4` **已并 main（PR #183=`3af835ad4` 本卷基线）→ 出在飞名单**。
  - **产品触面零重叠（16 worktree 扫描支撑）**：上述 4 线 `git diff --name-only` 对 `apps/web/lib/resume/ocr-preview-ui.ts` 与三个 UC-003 proof **零命中**（evap 8 件全在 `ai-docs/`/`receipts/`/`scripts/`·cwn 3 件同域·ag18 233 件/cap-2272 234 件均零命中）。
  - policy 链注记内承起草时点 pins（`64440511e`/`f7f222b38`）为**史录**（main 卷内不可回改），本卷 §4 以本 turn 实测 repin。
- **③下游**：本卷兑现后，`nhp-neg` N1b 由 gap 臂转在证臂；矩阵 `:114` NEG 格仍 `case-only`（covered 升格权归协调方·本刀 Ban 代评）。

## §5 Ban 列表 + pins

**Ban**：Ban push/force-push（git 写只本 worktree commit）· Ban 自批（pre-exec 双审两独立外席·alone≠dual）· Ban retry-to-green（红即停·attempts 台账留痕）· Ban 为求绿删/松断言（§1.6 前提失效臂退役须逐条申报替换臂强度）· Ban invent covered / 借旁证洗列 / 预支格值翻面 · Ban live key · Ban 触 API/domain/errors/`messages` 键域 · Ban 触 F1 区与 `web-logic` · Ban 改 `uc003x` closed 卷 · Ban 就地多吃 cap·lint 预算（越限只走恰等步进且须实测）· Ban 改共享 SSOT（backlog 仅 append-only 一行）· Ban 造 `.env*`/写 Key 值入树入据 · Ban 顺带升级依赖 · Ban 把 `.next` 残留计入 lint 基线（先清后跑）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（docs-only + cap 步进对·PTP fixture 合成路径计数零树写）。**rev r1–r5 修订 turn**：同为零 live（docs-only·单件本卷·PTP/静态 grep/git 元数据核离线）。EXEC 期：全部为离线静态/纯函数门（`nhp-neg` 纯函数+静态源对账·`i18n-locale` 静态解析·`web-logic` 纯函数）·零 PG 零外呼零 Key · est live=0 不变。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md + cap 步进对 2 件）四类标记词 + conflict-marker grep **零命中**（起草席 commit 前亲跑·词面运行时组装口径·不复抄卷内防自匹配）。**rev r1–r5 修订 commit 改动集均=本卷 1 件**，同样零命中。**本案不在卷内字面书写该四词**（避免自撞门）。

## §8 STOP · **`closed`**

（前值 `executed:awaiting_post_prove_dual` 史录·2026-10-30 post-prove 双审双 PASS 放行后翻面·见 §9-POST）

停止条件（四类+修订回炉一类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：EXEC 届时 tip 对 §0 任一锚漂移且结论受疑（两码出码点消失/状态码变更 · 映射单源两表键域或 `:133` 兜底链形变 · DOM 单源 `{message}` 改为渲染 `error` · `i18n-locale` S4 `:110` 常量已非 22 · 矩阵 `:114`/case-matrix `:109` 行被改写）→ 停·重 pin 回炉。**漂移判据只认锚基=HEAD 值**；§0 基线锚 `bd992a6f`/`f16d8dfd`（`3af835ad4:` 起草前值）为起草前史录，不参与判据。
- **机制不满足**：EXEC 实测发现补两键**不能**消除误导（例如另有路径绕过映射直出原始码）· 或 `hint` 在别处已被渲染（前提被推翻）→ 停·如实升级。
- **越界需要**：修法诉求超出 §1.4 **九件**（**须跨包 / 须迁移 / 须改 API 契约 / 须改 `messages` 键域 / 须改 F1 或 web-logic**）→ **红停上报**（协调方派单明列的停止条件）。
- **验收红不可修**：docs:check > cap 且协调方未授权步进 · PTP 非 12/12 · lint 越限且预算步进未获授权 · 邻面（`nhp-adv`/`web-logic`/`i18n-locale`）新红 → 停·如实登记（Ban 借机修）。
- **修订回炉冲突**：rev r1–r5 处方与机制源冲突（行号/锚/pin 实测不符）→ 停·如实上报（rev r1/r2/r3/r4/r5 均逐条亲证**零冲突·未触发**）。

## §9 状态

**`closed`**（起草落卷→rev r1–r5 回炉落卷（2026-10-30）→ **rev r6 双 PASS 放行 + EXEC 落码（同日·P2 批随立项日履行）**· pre-exec 双审**已行使**（r6 双 PASS·alone≠dual 已满足）· post-prove 双审**已行使·双 PASS**（2026-10-30·P2×14 合并登记见 §9-POST）·前值 `executed:awaiting_post_prove_dual` 史录零字洗）· 后续=push/PR/auto-merge（§9-POST）。卷 executed ≠ covered ≠ 矩阵列升格（coveredCount=8 零动 · EXIT0=case≠covered）· est live=0 · markers=0。

### §9-EXEC（2026-10-30 · pre dual r6 双 PASS 放行 · 协调方授权 · `line/uc3m-draft` @ merge `41ea16eef`）

**落码九件面（EXEC commit diff 面·逐件）**：① `apps/web/lib/resume/ocr-preview-ui.ts`（zh/en 两表各 +2 键·20→22·`:42` 注释改数·post blob `db303c75`/148 行）；② `apps/web/test/uc-e2e-003-nhp-neg.proof.ts`（N1b 翻「补齐在证」12 臂 + 2 未知码兜底继任臂·删 `GAP_2` 声明·`MAPPED_18`·EN/ZH_EXACT 各 +2·4 标签 22·N2 fallback 撤除·头注释/脚注重锚·post blob `1b1324f6`/321 行）；③ `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs`（S4 `zh.size` 20→22 + `:111` parity 标签 22/22·post blob `58fadf74`）；④ `apps/web/test/uc-e2e-003-nhp-adv.proof.ts`（`KNOWN_CODES` 10→12·全集 22·`:55`/`:60` 标签 22·PC 10→12 码 67→71·头注释行号重锚·post blob `c88b095a`/158 行）；⑤ `ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md`（§6 append-only 新条·表行本体零改·含避撞句「产品侧缺位已补·非本 harness 绿·≠covered」）；⑥ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（`:114` NEG 格 + FAULT 格【第 3 列】additive·`:174`/`:274` additive·格值/行值零动）；⑦ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（`:109`/`:111` additive·行值零动·`:111` 拆句）；⑧ `ai-docs/delivery/gap-bug-backlog.md:954`（append 兑现行·`:953` 原行零字改·锚=EXEC 门绿后第二 commit 或合卷 PR 号·禁同 commit 自引 SHA）；⑨ `apps/web/package.json` / root `package.json`（lint 预算恰等步进 605→607 / 5408→5410·实测值·常设预授权件）。另：两 policy 脚本仅在并线 merge commit 内 dual-keep/cap 取大（EXEC commit 零动）；本卷自身为记录面。

**门槛实跑（本 turn 亲跑·数字为实测）**：
- `pnpm uc003:nhp-neg:prove` **EXIT=0 · 139/139（±0）**· 9 段 **9/6/36/14/33/19/8/9/5=139** 逐段对齐（取数形：`^────────` 切段·精确匹配 `N1` 不吞 `N1a`·UTF-8 感知 perl/python3）。
- `pnpm uc003:nhp-adv:prove` **EXIT=0 · 71/71**（基线 67 +4）。
- `pnpm uc003:i18n-locale:prove` **EXIT=0**。
- `pnpm -C apps/web prove:public-copy` **14/14 EXIT=0**。
- `pnpm -C apps/web prove`（web-logic）**EXIT=0** · `pnpm -C apps/web typecheck` **EXIT=0**。
- `pnpm -C apps/web lint` **EXIT=0 · 607 warnings = 预算 607 恰等零余量**（先清 `.next`）· root `pnpm lint` **EXIT=0 · 5410 = 预算 5410 恰等**。
- `node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2458 ≤ cap 2_461**（并线后零步进·staged 冗计 2462 已收敛撤销）· `pnpm public-text-policy:prove` **12/12 EXIT=0**。
- markers/conflict grep 改动集**零命中** · est live=0。
- 机检门：proof 逐行 diff 清单与 §1.4 第 2 件增删枚举逐项对齐（−8/+12/+2/−4/+2/+2 / 2 常量 / 4 标签 / 2 迭代源）；12+2 断言名 `grep -F` **全命中**；§2-5 存量真话词面复扫四件 **0 命中**（原 18 行全部改写/撤除）。

**未齐项（如实登记）**：post-prove 双审未行使（alone≠dual）；`EN_EXACT`/`ZH_EXACT` 文案正确性比对结论待 post 席人工核对（**exact 只证存在且与表一致·不证文案正确**·§1.5 口径）；`unstub-inventory` 行号指针按 §3-8 显式接受过期；门 stdout 收据落 `.tmp/`（非扫描面·零新增受管路径）。

**STOP=`executed:awaiting_post_prove_dual`**（EXEC 届值·2026-10-30 post-prove 双 PASS 放行后翻 `closed`·见 §9-POST·三处钉：Status 行 + §8 + 卷尾）· coveredCount=8 不变 · pins 十一值零翻 · est live=0 · markers=0 · releaseEvidence=false。

### §9-POST（2026-10-30 · post-prove 双审双 PASS 放行 · P2×14 合并登记 · 协调方收官令）

**放行承登**：post-prove 双审两独立外席各自独立裁定 **PASS**（alone≠dual 已满足）；两席 P2 共 14 条合并为下列 10 项登记，逐项如实。产品源、proof、spec、收据零触（本轮仅本卷 + `uc-e2e-003-i18n-locale.md` 一处指针修正）。

**① i18n-locale §6 新条指针修正（已改）**：`ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md:101` 原句「与 `:93`（§5「`ERROR_MESSAGES` zh-only 列为下一刀产品债」·评审记 `:94`）」——`:94` 为空行，评审记实为 `:93`（§5 product-sense 行）；已删除「·评审记 `:94`」，只留 `:93` 单一指针。该卷表行本体零触。

**② total 自门建议（登记·归后继刀·未实施）**：建议在 `apps/web/test/uc-e2e-003-nhp-neg.proof.ts` 末尾加 `if (total !== 139) fail += 1;`（不套 `A()`、不增 `total`，避免自增计入）。本刀不落：现树只有 `process.exit(fail ? 1 : 0)`，无总数自检；新增会改门形与计数口径，归后继刀。当前 139 由逐臂输出 + 9 段归因人工核对保证。

**③ 矩阵/case-matrix 描述列按届值快照读（登记·零改）**：`ai-docs/delivery/e2e-requirement-coverage-matrix.md:114` 与 `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md:109` 的描述列仍含 2026-10-27 届值（`16⊆20`、`20 键`、`129 断言`、`upload_failed fallback` 等）。读法钉死：**描述列为届值快照，不作当前断言**；当前真话以同处 additive 注记（`16⊆20→18⊆22 @2026-10-30`、`129→139`、`22 键`）为准。行值/格值零动、不回写。

**④ ADV「全 22」弱臂披露**：`apps/web/test/uc-e2e-003-nhp-adv.proof.ts` 的 `A('PC 全 22 已知码 en 文案齐备且全 CJK-free', …)` 只断言 `enCatalog` 22 条 message 非空且 CJK-free；对 `KNOWN_CODES` 之外的 10 码不证「非 fallback/非 exact」，仅 12 码另有逐码 PC 臂（`r.message !== FALLBACK`）较强。该「全 22」臂不得单独引作 22 键全覆盖或非兜底证据。

**⑤ ENVELOPES hint 未源钉（登记·后继刀）**：`uc-e2e-003-nhp-neg.proof.ts` 的 `ENVELOPES` 中 `hint`/`body` 为手工副本；proof 只从 `apps/api/src/modules/resume/resume.service.ts` 扫描 `error:` 码（`scanCodes`），不校验 `hint` 与源逐字一致。本轮人工逐条核对：12 条 hint 与源 `:60/:64/:68/:80/:81/:96/:112/:120/:137/:145/:158/:165` 一致；机械源钉归后继刀。

**⑥ 恒真臂 8.6% 口径（12 条 N2 hint 臂）**：`uc-e2e-003-nhp-neg.proof.ts:237-240` 的 12 条 N2「zh hint 零透传」臂断言 `!r.message.includes(env.hint)`；`mapResumeUploadError` 不读 `hint`（`apps/web/lib/resume/ocr-preview-ui.ts:127-137`），故 en 文案 CJK-free 后该 12 条恒真。12/139 = **8.63%**（口径 8.6%），属结构性恒真臂，不计作行为证据；139 总数含此 12 条。

**⑦ fixture 无耦合（登记·接受）**：`ENVELOPES` 为静态手工表，与 `resume.service.ts` 无机械耦合（状态、`hint`、其余字段均非派生）；源漂移只能人工重锚。与 ⑤ 同一残余，接受并登记，后继刀一并源钉。

**⑧ 闭卷 uc3f:91 残留（登记接受·不 append）**：`ai-docs/delivery/harness/uc3f-REQUEST.md:91`「N1b 缺口恒持隔离……」为 2026-10-26 届史录；本刀已补两码映射，该句所述「缺口」现仅存于史录。处置=**登记接受**，不改闭卷（避免为一句史录触发闭卷零触规则与新增路径）；当前真话见 `ai-docs/delivery/gap-bug-backlog.md:954` 兑现行、`uc-e2e-003-i18n-locale.md:101` 与本节。

**⑨ 第 10 件记录面（11 路径 vs 九件字面）**：EXEC commit `70597801c` 实触 **11 tracked 路径**；§1.4 九件中第 7 件为两个 `package.json`（2 路径），其余 8 件各 1 路径=10 路径；第 11 路径=本卷 `uc3m-REQUEST.md` 自身，即**第 10 件记录面**（非产品/测试面）。登记后 diff 面计数闭合：9 件=10 路径 + 记录面 1=11。

**⑩ P3 措辞批（逐条如实）**：
- （a）`uc-e2e-003-i18n-locale.md:101`「评审记 `:94`」→ 已删除（见 ①）。
- （b）本卷 §0.0.5 r5 史录行「评审记 `:94`·本树 `grep -n` 实测 `:93`」：r5 史录保留不改；当前真话以本节与 ① 为准。
- （c）本卷 §9-EXEC「落码九件面」与 11 路径的差异由 ⑨ 登记，不改原文。
- （d）policy `CAP-SANCTION-2456` 注记「两 proof 断言面」：实际三件（`nhp-neg`/`i18n-locale`/`nhp-adv`）；policy 注记为起草届史录，不回改，已见 §1.4 第 4 件备注。
- （e）`uc-e2e-003-i18n-locale.md:99`「20/20 键 parity」：2026-10-14 append-only 史录，零触。

**STOP 三处翻 `closed`**：Status 头 + §8 + 卷尾同值翻面（前值 `draft:awaiting_pre_exec_dual`→`executed:awaiting_post_prove_dual`→`closed` 史录零字洗）· EXIT0=case≠covered 口径维持 · coveredCount=8 零动 · pins 十一值零翻。

**收官并线终验（2026-10-30 亲跑实测）**：`git fetch origin` **EXIT=0**·origin/main 由 `1ca3ce1da`（#184 evap）推进至 **`53cc4a434`（#185 cwn）**→ `git merge --no-ff origin/main` 恰 **2 处冲突=两 policy 脚本注记/cap 区**，dual-keep 双留（CWN 2448/2456 与 UC3M 2456 注记并留）+号按 merge-tree 重排，merge commit **`231d76ad1`**；cap 取大 **`max{cwn 2456, evap 2461, 本支 2461}=2_461` 零再步进**（`public-text-policy.mjs:282` 亲证）。`pnpm install --frozen-lockfile` **EXIT=0**（521ms·lockfile 零漂）。**终验三门**：① `node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2459 ≤ cap 2_461**（余量 2·非恰等）② `pnpm public-text-policy:prove` **EXIT=0 · 12/12** ③ 改动集 **13 路径**（`git diff --name-only origin/main`）五类标记词 + 行首冲突标记运行时组装 grep **零命中**（`scripts/i6-239-gates.proof.mjs:154-163` 口径·字面不复抄）。邻面复跑随录：`pnpm uc003:nhp-neg:prove` **EXIT=0 · 139/139**、`pnpm uc003:nhp-adv:prove` **EXIT=0 · 71/71**、`pnpm uc003:i18n-locale:prove` **EXIT=0**（stdout 落 `.tmp/uc3m-post-receipts/`·非扫描面）。push **EXIT=0**（`line/uc3m-draft`→origin）· PR **#186**（base main）· auto-merge 武装随令。

---

*UC3M REQUEST · 2026-10-30 起草 · rev r1 回炉（同日·P1×3+P2×9 处方全采纳）· rev r2 回炉（同日·P1×1+P2×6 处方全采纳·约束④证据链重写+zh 文案 (a) 改写）· rev r3 回炉（同日·P1×1+P2×3 处方全采纳·lint 预算机制核 +2）· **rev r4 回炉（同日·席1 PASS/席2 FAIL P1×3+P2×7·按席2 处方全采纳：§4 在飞 pin 重取（evap `2f54b0ddf`/7 件/cap 2461·cwn `976f019ed`）+ `GAP_2` 空循环防呆 + nhp-neg 门槛 **139（±0）** + 改动面显式 grep 清单 + public-copy 门 + 收据介质钉）** · **rev r5 回炉（同日·席1 PASS/席2 FAIL P1×1+P2×9·按两席处方合并：§1.4 第 9 件（harness 史录卷 §6 append-only·表行本体零改）+ main cap 口径（origin/main 2455/本支 2456·取大 evap 2461）+ `GAP_2` 删自许·不设负向臂 + 12 条新臂逐字谓词 + 9 段归因 + `:274` 逐字引文 + FAULT/`unstub` 口径）** · **rev r6 + EXEC（同日·P2 批随立项日履行：MAPPED_18 忘改=131 算式 / 12 谓词 #5#6 可鉴别化 / exact 钉自证性降调 / §2-5 机检门 / 127-125 两树拆开 / FAULT 第 3 列 / cap max{} / 第 9 件避撞句 / lint 609-5412 备路径 / 9 段取数命令形 / 未知码强形双表 exact / case-matrix :111 拆句 / 闭卷史录规则一般化 / 收据 :148-156）** · 实跑：`nhp-neg` **139/139 EXIT=0**、`nhp-adv` **71/71**、`i18n-locale` **EXIT=0**、`public-copy` **14/14**、web/root lint **607/5410 恰等**、`docs:check` **2458≤2_461 EXIT=0**、PTP **12/12** · **STOP=`closed`**（三处钉：Status 行 + §8 + 本行 · pre r6 双 PASS 已行使 · post 双审双 PASS 已行使（2026-10-30）· 前值 `executed:awaiting_post_prove_dual` 史录零字洗 · push/PR 随收官令）· **2026-10-30 §9-POST 收官**：P2×14 合并登记 10 项 + 终验三门 + push/PR 随令 · UC-003 NEG-01 收据 N1b 两缺位码映射 · 认领=backlog `:953` + 矩阵 §1.0.1 `:114` NEG 格 N1b gap 臂 + case-matrix `:109` · 刀型裁决**建议=方案 A 产品映射小刀**（产品源单文件 `apps/web/lib/resume/ocr-preview-ui.ts` +2 zh/+2 en + 注释改数 · 测试面 **3 件**断言常量/臂形（`nhp-neg`/`i18n-locale`/`nhp-adv`）· 文档面 3 处 additive + backlog 追加一行 · lint 预算 **+2**（仅 `magic_mismatch` 含 `_` × 2 表·`encrypted` 过 `isCamelCase` 0 warning·UPPER_CASE const 不计）越限沿常设预授权恰等步进（605→607/5408→5410））· 判据实况=**无裸码泄漏但双侧误导性兜底（locale 对称）** → 缺陷成立·小刀可承 · 方案 B（docs 钉刀）留 §1.3 翻面条件 · 零 API/domain/errors/`messages` 触 · 零迁移 · 零跨包 · cap 恰等步进 2455→2456（四联动点已同步）· pins 十一值零翻 · coveredCount=8 不变 · est live=0 · markers=0 · releaseEvidence=false · ≠HA*
