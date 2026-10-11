# PTP-ARCHIVE REQUEST（公共文本 FILE_LIMIT 清债刀 · 处方 A 清债刀 · M 体量 · git-mv+docs 恰 1 commit 零码动）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀触面=git mv 重命名+checklist 债行+ADR 增补+proof 边界用例·**迁移集零内容改写**。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工）〖勘误席 2026-10-11 落卷：pre-exec 双审席1 FAIL（闭卷判据背离）+席2 PASS（五登记项）合并处方一次落卷——闭卷名单逐件机检重造（终局 174 迁/155 留）·活治理面硬排除增补·§4 例外句改写·链条 3028/2510/1897/1898 重算·残留错误集机检如实改 pin（§0.5）·Status 仍 `draft:awaiting_pre_exec_dual` 待复审〗

**席位**：北星 loop 处方 A 清债刀（「A 清债刀+B-lite 治理随行」之 A 件）EXEC 任务书起草席。
**基线**：`feat/mysql-schema-skeleton` @ `c7142596`（主线最新 tip · 2026-10-11 `git log -1` 实测）。分支 `line/ptp-archive`·工作树 `meetwise-ptp`（`git worktree add ../meetwise-ptp -b line/ptp-archive` 本起草席已立·建前实查不存在）。
**蓝本**：①盘点席只读盘点处方（A 清债刀+B-lite 治理随行）②形制沿 `diag-honesty-REQUEST.md`（meetwise-diag 树 @`c745e0f0`·Ban/pins 同源誊录见 §5）③惯例先例 `217dde27`（2026-10-10 顶屋 `receipts/` 落点·§0.3 亲证）。

## §0 现状锚（起草席亲读·base `c7142596`·file:line 逐条实跑实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号/数字）

### 0.1 红根因（亲证实测）

| 锚 | 实测 |
|---|---|
| 门红 | `node scripts/ai-docs/check-docs.mjs` **EXIT=1**·输出恰两行：`ai-docs check failed:` + `- public_text_policy:PTP_FILE_LIMIT:4407`（唯一错误·本起草席实跑回执） |
| 门禁 HEAD 实测 | `aea02634`（本卷落卷后 tip）实跑同命令 **EXIT=1**·`PTP_FILE_LIMIT:4408` = base `4407`+本卷恰 1 件——EXEC 立项照本节时点重 pin（勘误席机检回执·席2 登记项④） |
| cap | `scripts/ai-docs/public-text-policy.mjs:40` `const MAX_FILES = 2_048;` |
| 提前返回 | 实测 `:309` 条件行/`:310` 返回行（盘点席报 `:308`·±1 微漂登记）：`listed.paths.length > MAX_FILES` → `{valid:false, errors:[PTP_FILE_LIMIT:<n>], scannedFiles:0}`——**超限即早退·内容规则（署名/代码托管 URL/LOCAL_PATH/云端标识/API key 形状）整卷跳过** |
| cap 引入 | `git log -L 40,40` 实测 = `e621235b` 2026-08-18「chore(build): 门禁脚本、CI、docker 与根配置」（引入后未修订） |
| 停摆起点 | `30d93dc7` 2026-09-18「docs(delivery): nail R1-SSOT real-close prove…」起 tracked>2048 首红（盘点席席记 2050；commit 存在性与日期亲证）——**内容规则自该日起被 FILE_LIMIT 早退遮蔽整卷停摆** |

### 0.2 元凶计数（base `c7142596` 实测·与盘点席漂移表）

| 口径 | 盘点席 | 本 tip 实测 | 漂移登记 |
|---|---|---|---|
| ai-docs/delivery 受管合计 | 2703 | **3231** | +528（期间落刀收据） |
| delivery/receipts | 963 | **1491** | +528 |
| delivery/reviews | 1103 | **1103** | 零漂 |
| delivery/harness | 334 | **334** | 零漂 |
| delivery/eval | 77 | **77** | 零漂 |
| delivery/living-loose | 196 | **0** | 全仓 `git ls-files \| grep -i living-loose` 零命中·`--diff-filter=D` 亦零记录——盘点席口径物件在本分支不可寻（或居他分支树）·登记不考古 |
| delivery 散片（顶层散件） | 30 | **226**（=slice 194+非 slice 32） | +196 与 living-loose 消失数吻合（疑似口径并入）·登记 |
| 其余全仓（域−delivery） | 1704 | **1176** | 随 delivery 涨对冲 |
| 扫描域合计 | 4407（报错值） | **4407**（实测=报错数字逐字吻合） | 零漂（域内增减恰抵） |

扫描域口径（`listTrackedPublicTextPaths` 源码亲读）：MANAGED_ROOTS 十根（ai-docs/apps/packages/scripts/docker/e2e/.github/.claude/ops/docs）+ROOT_FILES 三件（README/AGENTS/CLAUDE）·TEXT_EXTENSIONS 27 种·`git ls-files --cached --others --exclude-standard` 剔 working-tree deleted。
勘误注记：上表=base `c7142596` 口径；HEAD `aea02634` 起扫描域合计 **4408**（=4407+本卷·§0.1 行二·EXEC 照时点重 pin）。

### 0.3 惯例漂移先例（亲证）

`217dde27` 2026-10-10「docs(unstub-erase): EXEC 收据+REQUEST 状态行 append-only…」：`git show --stat` 亲证 7 文件=**6 件收据附件落顶屋 `receipts/unstube-erase/`**+**第 7 件=刀文书本体 `harness/unstube-erase.md` 在 harness 原位**（勘误席2 措辞精化·原句「7 文件全在顶屋」不确）·顶屋 `receipts/` 现存 15 刀目录 **142 件**·**不在 MANAGED_ROOTS → 天然出扫描域**。

### 0.4 治理面（亲证）

- ADR-0019 `ai-docs/architecture/adr/0019-public-text-policy-static-governance.md`：`:8` `status: proposed`（标题行同带 proposed）·**全文无 2048/cap 数字**（grep 实测零命中）。
- proof `scripts/ai-docs/public-text-policy.proof.mjs`：`grep -c FILE_LIMIT` = **0**（零覆盖）·唯一 scannedFiles 断言 `:130`（`>=1`）·TC 注册表=main+E1..E10 共 11 案·runner `:253-256` 自动遍历（新案入 `checks` 对象即注册）。
- checklist 债行五处（`ai-docs/delivery/execution-master-checklist.md`·2266 行·本 tip 实测）：
  - `:2060` `- [ ] **STILL OPEN**：…sibling 债（e2e-parity:check·docs:check PTP_FILE_LIMIT）…`（**勾销目标行**）
  - `:2202` Erratum-ENV2「docs:check PTP_FILE_LIMIT=基线仓库级超限 inherited-red（base 4585 tracked>2048 cap…）」
  - `:1451` 「docs:check 预存红 `PTP_FILE_LIMIT:3804`（MAX_FILES=2048）base 即红非本刀产物 · retained 不洗」
  - `:1598` 「`docs:check` PTP_FILE_LIMIT **3877→3881**…→**3882**」
  - `:1825` 「docs:check 预存红（PTP_FILE_LIMIT 3964）未落本收据正文…」

### 0.5 预演（起草席只读复演·真扫描器注入 trackedPaths·**勘误席两轮如实改 pin**）

- **【勘误后口径·勘误席 HEAD `aea02634` 机检】**迁移集（§1-① 闭卷名单收严后）实测 **3028 件**（含 518 件非文本收据附件 .log/.json 等；其中入扫描域文本件 2510）·残留域 = `4407 − 2510`（base 口径）= **1897**（≤2048·余量 151；HEAD 时点 `4408−2510=1898` 含本卷）。
- **真扫描器重演（注入 trackedPaths=生产文本清单−迁移集·同起草席方法）**：`valid:false` · `scannedFiles:1898` · errors 实测 **60 处 = 57 PTP_LOCAL_PATH + 2 PTP_EXTERNAL_REFERENCE_LINK + 1 PTP_CODE_HOST_URL**（外链两处 `harness/g7-key-x3-freetieronly-reprove.md:195-196`·托管 URL 一处 `harness/ha-track.multi-instance.md:50`·api.github.com artifact URL 非 self-canonical 豁免外）·复审席孤证实证+勘误席同法注入重演确认（改写前同法实测 61 处·含本卷旧文自指 2 处·随本次勘误消除字面形归零）·**EXEC 落地前照本节同法机检重 pin 终值清单**。
- **【勘误·作废登记】**起草席原预演「迁移 3183·残留 1742（余量 306）·errors 恰 7 处全 PTP_LOCAL_PATH」系闭卷名单未收严时口径：155 件门未结/无状态刀卷随旧集出域·其停摆期积欠的本机绝对路径潜伏红（57 处）与外链红（2 处）随之被遮蔽——名单收严后如实浮出·全在**留置集**（在飞卷/门未结卷/活 SOP/状态板/本卷引注）。**三轮口径来源如实登记（沿作废登记形制）**：首轮「恰 7 处」=盘点席口径未含 CODE_HOST 族+名单未收严→二轮「59 处」=勘误席机检·系统性漏计 CODE_HOST 族（其改写前口径 61 处=含本卷自指 2 处）→本轮「恰 60 处」=复审席孤证实证+勘误席重演确认·**终值**。
- **【EXEC 改 pin·2026-10-11·协调方裁决选 2 授权·现终值】**闭卷集按 §1-①-4「以 EXEC 逐件机检为准」条款执行=**171 件**（强机检终局 155+边界裁断终局 15+本卷随迁 1；harness 全量 335=171 迁+164 留置[硬排除 19+eval-honesty 板 12+无状态行 10+非终局状态 123]）。**四轮口径来源扩记**：7（盘点）→59（二轮·漏 CODE_HOST）→60（三轮·复审孤证终值@其机检集）→**61（EXEC 时点机检终值@171 严留置集·本轮）**=58 PTP_LOCAL_PATH+2 PTP_EXTERNAL_REFERENCE_LINK+1 PTP_CODE_HOST_URL。**差集 4 件具名登记（钉值 174 机检集超出本 171 集之件·推断重构——钉值清单未落卷不可复现·数学约束=该 4 件恰载 1 处 LOCAL_PATH 红·与「恰 1 红载体」吻合的弱词翻转集如下·精确成员不可证）**：`e2efail-import-knife.md`（末条状态行=「本刀 ≠ G7 三绿 ≠ `:107` 关闭（判别 run 结果决定后续）≠ 刀② 落地 ≠ C-MO-P3 收口（erratum 登记后收口材料待判别 run）」·弱词「收口」现于否定语境）·`gap-begin-snapshot-supply-fix.md`（末条状态行=「*Harness · G7S 通用 begin 供给面收口产品刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · … · STOP*」·弱词「收口」现于卷题·**恰载本刀 61 处之 1 处 LOCAL_PATH 红=差集红载体**）·`gap-priv-01-tenant-rls.md`（末条状态行=「*Harness · PRIV01 GAP-PRIV-01 tenant≠RLS · `executed:awaiting_post_prove_dual` · … · Ban self-write `post_prove_dual_pass`*」·Ban 剥离后无终局 token）·`unstub-inventory.md`（末条状态行=「3. 翻桩完成后：…在同一刀内收口，禁分刀留半。」·计划语态）。四件按卷面判据（draft/awaiting/否定语境/计划语态）一律留置原位——**更严留置方向·其 1 处潜伏红保持可见**。scannedFiles 终值 **1901=1898+4−1**（+4 组成差留置·−1 本卷随迁）·余量 147。**流程教训句**：终局名单须随卷落卷（git 之内）方可供 EXEC 时点复现对账——「机检如实改 pin」以可复现为前提·本刀以 §1-①-4「以 EXEC 逐件机检为准」条款收束。
- **盘点席「残留 1704 · valid:true errors:0」在本 tip 不成立**（原勘误维持）：内容规则停摆期积欠的潜伏红在 FILE_LIMIT 摘除后必然浮出·本刀验收=错误集如实登记改 pin（§2-3）·全绿清欠归 B-lite 治理随行件（§3-5）。
- 形状随迁登记：迁移集含本机绝对路径或托管 URL 形状（**六域口径**=github/gitlab/bitbucket/gitee/codeberg/sourceforge 全文件 grep·勘误席2 登记项③）**461 件**随迁出扫描域（勘误前值 500=四域口径+未收严集·范围缩减如实登记）。

### 0.6 在飞五线清册（tip 实测存在性·§1-① 硬排除名单）

| 线 | 卷/收据在本 tip | 处置 |
|---|---|---|
| H2（h2-qbank-corpus） | 卷不在 tip（meetwise-h2q 树 @`11191e9e`） | 名单留档硬排除 |
| HA6（ha-6-companion） | 卷不在 tip（meetwise-ha6 树 @`90258ec3`） | 同上 |
| #213（diag-honesty） | 卷不在 tip（meetwise-diag 树 @`c745e0f0`） | 同上 |
| G2（g2-report-page） | 卷在 tip harness（1 文件） | **硬排除不迁** |
| EVIDENCE（evidence-delivery） | 卷在 tip harness + 收据目录 11 件（`delivery/receipts/evidence-delivery/`） | **硬排除不迁** |

另：harness 三件常驻 SOP（`NORTH-STAR-EXECUTION-LOOP.md`/`RESOURCE-HYGIENE.md`/`TASK-SOP-v2.md`）非刀卷·不属闭卷集·留置。
勘误增补（活治理面硬排除·逐件亲证在树+活跃性）：`product-campaign-LEDGER.md`（活总账）·`product-campaign-EXECUTION-SOP.md`（9-agent loop 唯一执行依据）·`extreview-fix-campaign-SOP.md`（EXTREV 在飞）·`ha-4-backup-runbook.md`·`ha-track.skeleton.md`·`ha-track.multi-instance.md`·`r4-domain-isolation-status.md`（G4/R4 Status 对照板）·eval-honesty 系列状态板 12 件·`obs-envschema-REQUEST.md`（post-dual FAIL 修复中·exec:awaiting_post_prove_dual）等**优先于状态判据无条件留置**——亲证与机械口径见 §1-①-4。

## §1 修法（四件·file:line 实锚·EXEC 立项重 pin·零码动）

### ① git mv 迁移（R100·内容逐字不动·零改写）

- 目标落点=顶屋 `receipts/archive/2026-09-batch23/`（出 MANAGED_ROOTS 即出扫描域·批次名沿协调方处方）·子目录分域：`receipts/`·`reviews/`·`eval/`·`harness/`·`slices/`。
- 迁移集（base `c7142596` 口径实测 **3028 件**·勘误前值 3183=闭卷名单未收严口径·如实作废登记）：
  1. `ai-docs/delivery/receipts/**` **硬排除** `ai-docs/delivery/receipts/evidence-delivery/**`（11 件在飞收据）→ `…/receipts/`（1480 件）
  2. `ai-docs/delivery/reviews/**`（1103 件·五线名零命中）→ `…/reviews/`
  3. `ai-docs/delivery/eval/**`（77 件·五线名零命中）→ `…/eval/`
  4. harness 闭卷（**勘误席重造名单·pre-exec 席1 FAIL 根因修复**）：判据=逐件机读刀卷**末条 append-only 状态行**，仅收**终局态**——`post_*_dual_pass` 族（post_prove_dual_pass/post_dual_pass/post_change_dual_pass 等）/executed+nail（`nail:closed`/`nailed:closed`/`*_nail:closed`/`nail:post_dual_*`/`executed:nail`）/收口终局/`SUPERSEDED`——及其同卷收据附件；`draft*`/`PENDING`/`awaiting_*`/`exec_blocked`/无状态行者一律**留置**。机械口径硬排除五件：`g2-report-page-REQUEST.md`（在 tip）·`evidence-delivery-REQUEST.md`（在 tip）+常驻 SOP 三件·另 `h2-qbank-corpus-REQUEST.md`/`diag-honesty-REQUEST.md` 本 tip 不在（名单留档保险）·本卷自身 `ptp-archive-REQUEST.md`（draft 在卷刀文书）留置。
     **活治理面硬排除（勘误席增补·逐件亲证在树+活跃性·优先于状态判据）**：`product-campaign-LEDGER.md`（活总账·base tip `c7142596` 本身触面）·`product-campaign-EXECUTION-SOP.md`（9-agent loop 唯一执行依据·`c70496ff` 2026-10-11）·`extreview-fix-campaign-SOP.md`（EXTREV 在飞·`5e1e7fde`·extrev-deps-audit-REQUEST 在飞处方记账）·`ha-4-backup-runbook.md`（活 runbook·实机启用待另行授权）·`ha-track.skeleton.md`（skeleton landed·prove path 未开）·`ha-track.multi-instance.md`（工具轨活面·`7fddebe8`）·`r4-domain-isolation-status.md`（G4/R4 Status 对照板·`ba1b8aa8`）·**eval-honesty 系列状态板 12 件**（机械口径=`**状态**：eval-honesty` 头·含 `qdrant-g5-ledger-map`/`r5-retirement-sole-stack-status` 两 superseded 板）·`obs-envschema-REQUEST.md`（post-dual FAIL 修复中·`exec:awaiting_post_prove_dual`）——及其 sibling pins 族四件（`mysql-schema.skeleton.md`/`privacy-erasure-http-503-pin.md`/`qdrant-store.prototype.md`/`redis-streams-wakeup.prototype.md`·同族 `r5-pgvector-fixture-mark-red`/`qdrant-erase-count-honesty`）。
     → 其余 **174 件**（`git ls-files` 机检清单·EXEC 照 §0 重 pin）→ `…/harness/`；**留置 155 件**=无状态行 23+eval-honesty 状态板 12+draft/PENDING/awaiting_*/exec_blocked/门未结 120（如 `exec:awaiting_post_prove_dual`/`exec:done_prove_green`/`exec_blocked_cross_knife_acl`/`pre_exec_dual_PASS` 已授权未执行）。收据附件随主卷逐件独立机读（如 `dbid1-id-v7-unify.exec.md`=nail 终局随迁·其父 REQUEST 仍 draft 留置——如实登记）；席1 预记拆分（~33+~124 等）与实测 174 不符处以本席逐件机检为准。
  5. 散片 slice=delivery 顶层 `*.slice.md` **194 件**（五线名零命中）→ `…/slices/`
  6. 散片非 slice **32 件本批留置**（活账本/队列/backlog/matrix/ADR/规划混居·甄别归后续批次·如实登记）——含 `execution-master-checklist.md`（§1-② 触面·活卷禁迁）。
- 通用硬闸：任何路径名匹配五线 pattern（`h2-qbank-corpus`/`ha-6-companion`/`diag-honesty`/`g2-report-page`/`evidence-delivery`）者**无条件留置**（本 tip 实测零漏网·EXEC 重 pin）。
- 手法=先 `mkdir -p` 目标子目录·逐件 `git mv`（保 R100 rename 记录）·迁移集内容**逐字节零改写**（Ban 触内容·§5）。

### ② checklist 债行结账（恰五行触面·原文保留）

- `:2060` STILL OPEN 行：行内 `docs:check PTP_FILE_LIMIT` sibling 债**勾销**——以行尾追加结账注落（原字符零改写）：`（结账注 <日期>·line/ptp-archive：sibling 债 docs:check PTP_FILE_LIMIT 已勾销——FILE_LIMIT 红根除·残留潜伏红（本机路径形+外链形·见 ptp-archive-REQUEST §0.5 机检清单·EXEC 时点重 pin）归 B-lite 清欠另刀）`。
- `:2202`/`:1451`/`:1598`/`:1825` 四披露行：**原文逐字保留**·各自行尾追加同形制结账注（历史口径已由本刀收口·现值见 EXEC 收据实测）。
- 行号=本 tip 实测·EXEC 落注前照 §0.4 重 pin（行号漂移以内容定位·零盲改）。

### ③ ADR-0019 增补（status 仍 proposed·不越权翻 accepted）

- `ai-docs/architecture/adr/0019-public-text-policy-static-governance.md`「决定」清单增补约定行：「刀文书默认落点=顶屋 `receipts/`（2026-10-10 `217dde27` 先例·**既成事实登记非新政策**）；历史刀文书归档落 `receipts/archive/<batch>/`，出受管根即出扫描域。」
- 同条附 cap 依据登记：「`MAX_FILES=2048`（`scripts/ai-docs/public-text-policy.mjs:40`·`e621235b` 2026-08-18 引入）为现行静态预检上限；超限早退遮蔽内容规则的事故面由 `line/ptp-archive` 清债刀登记归档（ADR 本体不 pin 数字——数字修订归治理流程）。」
- **status 保持 `proposed` 零动**（`:8` 与标题行零改）——翻 accepted 归用户/治理流程·本刀无依据越权·卷内明注。

### ④ proof 补 FILE_LIMIT 边界用例（沿既有 proof 形制）

- `scripts/ai-docs/public-text-policy.proof.mjs` 增 `TC-quality-04-E11`（入 `checks` 对象·runner 自动注册·尾行计数 11→12）：
  - **cap 数字行为断言**：fixture 注入 `trackedPaths` 恰 **2048** 个真实存在安全小文件（循环造 `ai-docs/f-0000.md`…内容 `'ok'`）→ `valid:true`·`scannedFiles:2048`；
  - **超限错误码形状断言**：同 fixture `trackedPaths` 2049 个 → `valid:false`·错误串**恰含 `PTP_FILE_LIMIT:2049`**（`:310` 形状 `${CODE}:${n}`）·`scannedFiles:0`（早返回形状·`trackedPaths` 注入路径超限先于读盘·免落盘可断言）；
  - 形制沿 E8/E10（`createFixtureRoot`+`expectCode`+`finally rmSync`）·`--case TC-quality-04-E11` 单案可跑。

## §2 验收断言（pre-exec 双审核对单基面·EXEC 立项重 pin·**含对处方/预演/闭卷名单的勘误登记**）

1. **迁移纯度**：对基线 `git diff --name-status` 迁移集**全 R100**·零 M/A/D 混入；M 恰三件=checklist/ADR-0019/proof（触面收束·§2-5）；本起草席 commit 恰 1 个新 .md（本卷）·零码动。抽 5 件迁移件 `git log --follow` 新旧路径同史在案。
2. **FILE_LIMIT 红根除（硬断言）**：迁移后落地实跑 `node scripts/ai-docs/check-docs.mjs` **零 PTP_FILE_LIMIT 命中**·`scannedFiles≈1898`（HEAD 口径=残留 1897+本卷·base `c7142596` 口径=`4407−2510=1897`·余量 151·±EXEC 在飞漂移以实测重 pin）·**硬顶 ≤2048**。残留计数口径注明：**「本卷自身随迁与否」由 EXEC 立项明写**（计入则 +1·不计入则 −1·收据写明取舍——本卷=在卷刀文书·预演按留置计·席2 登记项①）。
3. **【勘误·改 pin】docs:check 残留错误=且仅=§0.5 机检清单**（复审席孤证实证+勘误席重演确认·实测 **60 处=57 PTP_LOCAL_PATH+2 PTP_EXTERNAL_REFERENCE_LINK+1 PTP_CODE_HOST_URL**·验收语言终值口径=**「scannedFiles:1898·errors 恰 60 处逐条 file:line 全等·超集或异集=FAIL」**·EXEC 以 §0.5 同法注入机检重 pin 终值）——处方原文「docs:check EXIT=0 / valid:true errors:0」预演证伪（§0.5）·起草席「恰 7 处」系名单未收严口径·同节作废登记：本刀验收=错误集自 `{PTP_FILE_LIMIT:4407}` 收窄为该机检清单·EXIT=1 如实登记为 base 残留不洗；全绿清欠归 B-lite 另刀。（EXEC 改 pin 2026-10-11·协调方裁决选 2：本条终值按 §0.5 EXEC 块改 pin 恰 **61 处**=60 钉值+1 差集 LOCAL_PATH[差集红载体 `harness/gap-begin-snapshot-supply-fix.md`]·更严留置方向红保持可见比钉值更安全·逐条 file:line 全等·超集或异集=FAIL·**scannedFiles 终值 1901**=1898+4−1 逐项可导·闭卷集 171 件口径同 §0.5 EXEC 块）
4. **prove 全绿**：`pnpm public-text-policy:prove` EXIT=0（12 案全过·含新 E11 双断言）。
5. **三件触面收束**：checklist 五行注/勾销·ADR 增补·proof E11——diff 逐处对应 §1-②③④·触面外零 diff（checklist 注释外行零触碰）。
6. **在飞零触**：五线卷/收据+常驻 SOP 三件+活治理面硬排除件（§1-①-4 勘误增补）+harness 留置 155 件+散片留置 32 件零触碰（路径级白名单核验）。
7. markers=0（§7）+ est live=0（§6）双声明入收据。
8. **断链既定取舍登记**：迁移零改写·留置件原位——迁移收据内相对链至留置件的断链为既定取舍，EXEC 收据须带此登记句（席2 登记项⑤·修链归 B-lite 后续·不构成返工）。

## §3 范围外（边界清单·越界即 FAIL）

1. **cap 数字零动**：`public-text-policy.mjs:40` `MAX_FILES=2_048` 零改（程序面改法归 B 程序另立·Ban 无依据改 `:40`）。
2. **living-loose 零迁**：本 tip 全仓零存在（§0.2 漂移表）·条款留档；若 EXEC 时现形则按在飞留置处置。
3. **在飞五线卷/收据零迁**（§0.6 清册·§1-① 硬闸）·常驻 SOP 三件零迁·**活治理面硬排除件零迁**（§1-①-4 勘误增补清单·优先于状态判据）。
4. **deliveries 内容零改写**：迁移集逐字节零动纯 R100；checklist/ADR/proof 仅 §1-②③④ 触面·其余行零 diff。
5. **潜伏红零修**：§0.5 机检清单（实测 60 处=57 PTP_LOCAL_PATH+2 PTP_EXTERNAL_REFERENCE_LINK+1 PTP_CODE_HOST_URL）清欠=B-lite 治理随行件职责（§2-3）·本刀只登记不修。
6. **散片非 slice 32 件零迁**（§1-①-6·甄别归后续批次）。
7. **ADR status 零翻**：proposed 保持（§1-③·翻状态归用户/治理流程）。
8. **est live=0**：零模型外呼（§6）·零生产操作·零 secrets。

## §4 依赖与时序

- **EXEC 前置=零硬闸**：在飞五线（H2/HA6/EVIDENCE/#213/G2）的 harness 在途件已被 move 集硬排除（§0.6 清册）·自然豁免——**可即期 EXEC 立项**（预执行双审 PASS+协调方明示授权照旧）。
- **merge 顺序与 H2 零路径冲突**：H2 在飞触面=其卷与 qbank 码面·本刀迁移集硬排除 H2 名下一切路径·H2 后续只 M 其在途卷·零交集；G2/EVIDENCE 卷留置原位·其 EXEC 收据沿 §1-③ 新约定落顶屋·亦零冲突。
- 已落线在飞线（H2/HA6/diag 等·含 HA6 已落主线 merge `88459afb`）仍受 §1-① 五线硬闸留置，**归下一批迁移**——本刀 move 集不因落线即时扩集（闭卷判据与硬排除均以本卷 §0/§1-① 时点机检为准·入迁归后续批次照 §0 重 pin 清册）。〔勘误席改写·原句「若 H2/HA6/diag 在本刀 EXEC 前落线…按闭卷判据自然入迁」与五线硬闸矛盾（HA6 已落线即成现役冲突）·如实作废登记〕

## §5 Ban 列表 + pins（沿 diag 卷同源逐字誊 + 本刀面增补/豁免）

**Ban 列表**（diag 卷 §5 同源逐字誊 + 本刀面增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/issues-master 行与统计只读引用；**本刀精确豁免**：`execution-master-checklist.md` 恰 §1-② 五行触面·其余行仍只读）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（迁移集=§1-① 白名单·越界即 FAIL）；Ban 触其他工作树；Ban 伪造已问/已验来源（零机制现状不假称既有）；**本刀增补**：Ban 改写迁移集任何文件内容（R100 纯度·逐字节零动）；Ban 动 cap 数字（`public-text-policy.mjs:40`）；Ban 迁在飞五线卷/收据与常驻 SOP（§0.6）**及活治理面硬排除件与 harness 留置 155 件（§1-①-4 勘误增补·判据外一律留置）**；Ban 翻 ADR-0019 status（proposed 保持）；Ban 修潜伏红（§0.5 机检清单·清欠归 B-lite·本刀只登记）；Ban 伪造「docs:check 全绿」宣称（残留错误集如实登记·§2-3 勘误）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）

## §6 est live=0

本刀零模型外呼：git mv 纯文件系统/索引操作·checklist/ADR 为 docs·proof E11 为静态夹具断言（零网络零模型）——全静态·零生产操作·零 secrets·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ptp-archive-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove·EXEC 收据复核）。五类标记词不复抄卷内（避免自匹配·沿 diag/h2 卷同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本卷恰 1 .md·恰 1 commit）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——本卷 §0 数字/行号=base `c7142596` 实测·漂移必登记）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

---

*PTP-ARCHIVE REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`c7142596` · 分支 `line/ptp-archive` · 工作树 `meetwise-ptp` · 形制沿 diag-honesty-REQUEST（Ban/pins 同源誊录）· 惯例先例 `217dde27` 顶屋 receipts/（6 附件顶屋+刀文书本体在 harness）· 四件=①git mv 3028 件→`receipts/archive/2026-09-batch23/`（R100 零改写·五线硬闸+活治理面硬排除·harness 闭卷逐件机检 174 迁/155 留·SOP 三件与散片非 slice 32 件留置）②checklist 债行 `:2060` 勾销+四披露行结账注（原文保留）③ADR-0019 增补落点约定+cap 依据登记（status 仍 proposed）④proof `TC-quality-04-E11` FILE_LIMIT 边界双断言 · 勘误席（pre-exec 席1 FAIL+席2 PASS 合并处方）：闭卷名单机检重造·链条 3028/2510/1897/1898 重算（余量 151）·潜伏错误集 60 处（57 本机路径形+2 外链+1 托管 URL 形）如实改 pin（全绿清欠归 B-lite）· §4 例外句改写· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
