# PTP-ARCHIVE REQUEST（公共文本 FILE_LIMIT 清债刀 · 处方 A 清债刀 · M 体量 · git-mv+docs 恰 1 commit 零码动）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀触面=git mv 重命名+checklist 债行+ADR 增补+proof 边界用例·**迁移集零内容改写**。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工）

**席位**：北星 loop 处方 A 清债刀（「A 清债刀+B-lite 治理随行」之 A 件）EXEC 任务书起草席。
**基线**：`feat/mysql-schema-skeleton` @ `c7142596`（主线最新 tip · 2026-10-11 `git log -1` 实测）。分支 `line/ptp-archive`·工作树 `meetwise-ptp`（`git worktree add ../meetwise-ptp -b line/ptp-archive` 本起草席已立·建前实查不存在）。
**蓝本**：①盘点席只读盘点处方（A 清债刀+B-lite 治理随行）②形制沿 `diag-honesty-REQUEST.md`（meetwise-diag 树 @`c745e0f0`·Ban/pins 同源誊录见 §5）③惯例先例 `217dde27`（2026-10-10 顶屋 `receipts/` 落点·§0.3 亲证）。

## §0 现状锚（起草席亲读·base `c7142596`·file:line 逐条实跑实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号/数字）

### 0.1 红根因（亲证实测）

| 锚 | 实测 |
|---|---|
| 门红 | `node scripts/ai-docs/check-docs.mjs` **EXIT=1**·输出恰两行：`ai-docs check failed:` + `- public_text_policy:PTP_FILE_LIMIT:4407`（唯一错误·本起草席实跑回执） |
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

### 0.3 惯例漂移先例（亲证）

`217dde27` 2026-10-10「docs(unstub-erase): EXEC 收据+REQUEST 状态行 append-only…」：新刀文书落点已迁顶屋 `receipts/unstube-erase/...`（`git show --stat` 亲证 7 文件全在顶屋）·顶屋 `receipts/` 现存 15 刀目录 **142 件**·**不在 MANAGED_ROOTS → 天然出扫描域**。

### 0.4 治理面（亲证）

- ADR-0019 `ai-docs/architecture/adr/0019-public-text-policy-static-governance.md`：`:8` `status: proposed`（标题行同带 proposed）·**全文无 2048/cap 数字**（grep 实测零命中）。
- proof `scripts/ai-docs/public-text-policy.proof.mjs`：`grep -c FILE_LIMIT` = **0**（零覆盖）·唯一 scannedFiles 断言 `:130`（`>=1`）·TC 注册表=main+E1..E10 共 11 案·runner `:253-256` 自动遍历（新案入 `checks` 对象即注册）。
- checklist 债行五处（`ai-docs/delivery/execution-master-checklist.md`·2266 行·本 tip 实测）：
  - `:2060` `- [ ] **STILL OPEN**：…sibling 债（e2e-parity:check·docs:check PTP_FILE_LIMIT）…`（**勾销目标行**）
  - `:2202` Erratum-ENV2「docs:check PTP_FILE_LIMIT=基线仓库级超限 inherited-red（base 4585 tracked>2048 cap…）」
  - `:1451` 「docs:check 预存红 `PTP_FILE_LIMIT:3804`（MAX_FILES=2048）base 即红非本刀产物 · retained 不洗」
  - `:1598` 「`docs:check` PTP_FILE_LIMIT **3877→3881**…→**3882**」
  - `:1825` 「docs:check 预存红（PTP_FILE_LIMIT 3964）未落本收据正文…」

### 0.5 预演（本起草席只读复演·真扫描器注入 trackedPaths·**勘误盘点席结论**）

- 迁移集（§1-① 口径）实测 **3183 件**（含 518 件非文本收据附件 .log/.json 等；其中入扫描域文本件 2665）。
- 残留域 = `4407 − 2665`（在飞留置件在内）= **1742**（≤2048·余量 306）。
- 真扫描器实跑：**`valid:false` · errors 恰 7 处全 PTP_LOCAL_PATH**——`ai-docs/delivery/PARALLEL-DISPATCH-2026-10-02.md:24` · `execution-master-checklist.md:634` · `harness/NORTH-STAR-EXECUTION-LOOP.md:4` · `:8` · `harness/g2-report-page-REQUEST.md:5` · `:8` · `receipts/evidence-delivery/2026-10-10-exec-prove.md:4`（逐条 sed 亲读·全为 `/Users/miaole/...` 本机绝对路径·全在**留置集**：活卷 SOP/活账本/在飞卷/在飞收据）。
- **盘点席「残留 1704 · valid:true errors:0」在本 tip 不成立**：数字漂 1704→1742；且内容规则停摆期积欠的 LOCAL_PATH 潜伏红在 FILE_LIMIT 摘除后必然浮出（恰 7 处）。本刀验收据此**如实改 pin（§2-2/§2-3）**·全绿清欠归 B-lite 治理随行件（§3-5）。
- 形状随迁登记：迁移集含 `/Users/` 或托管 URL 形状（`/Users/` 与 github/gitlab/bitbucket/codeberg 四域全文件 grep）**500 件**随迁出扫描域（盘点席 165·口径放宽如实登记范围缩减）。

### 0.6 在飞五线清册（tip 实测存在性·§1-① 硬排除名单）

| 线 | 卷/收据在本 tip | 处置 |
|---|---|---|
| H2（h2-qbank-corpus） | 卷不在 tip（meetwise-h2q 树 @`11191e9e`） | 名单留档硬排除 |
| HA6（ha-6-companion） | 卷不在 tip（meetwise-ha6 树 @`90258ec3`） | 同上 |
| #213（diag-honesty） | 卷不在 tip（meetwise-diag 树 @`c745e0f0`） | 同上 |
| G2（g2-report-page） | 卷在 tip harness（1 文件） | **硬排除不迁** |
| EVIDENCE（evidence-delivery） | 卷在 tip harness + 收据目录 11 件（`delivery/receipts/evidence-delivery/`） | **硬排除不迁** |

另：harness 三件常驻 SOP（`NORTH-STAR-EXECUTION-LOOP.md`/`RESOURCE-HYGIENE.md`/`TASK-SOP-v2.md`）非刀卷·不属闭卷集·留置。

## §1 修法（四件·file:line 实锚·EXEC 立项重 pin·零码动）

### ① git mv 迁移（R100·内容逐字不动·零改写）

- 目标落点=顶屋 `receipts/archive/2026-09-batch23/`（出 MANAGED_ROOTS 即出扫描域·批次名沿协调方处方）·子目录分域：`receipts/`·`reviews/`·`eval/`·`harness/`·`slices/`。
- 迁移集（base `c7142596` 实测 3183 件）：
  1. `ai-docs/delivery/receipts/**` **硬排除** `ai-docs/delivery/receipts/evidence-delivery/**`（11 件在飞收据）→ `…/receipts/`（1480 件）
  2. `ai-docs/delivery/reviews/**`（1103 件·五线名零命中）→ `…/reviews/`
  3. `ai-docs/delivery/eval/**`（77 件·五线名零命中）→ `…/eval/`
  4. harness 闭卷（判据=状态已 executed/nail/收口终局的卷+其收据日志）机械口径=harness 刀卷文件 **硬排除五件**：`g2-report-page-REQUEST.md`（在 tip）·`evidence-delivery-REQUEST.md`（在 tip）+常驻 SOP 三件·另 `h2-qbank-corpus-REQUEST.md`/`diag-honesty-REQUEST.md` 本 tip 不在（名单留档保险）→ 其余 **329 件** → `…/harness/`
  5. 散片 slice=delivery 顶层 `*.slice.md` **194 件**（五线名零命中）→ `…/slices/`
  6. 散片非 slice **32 件本批留置**（活账本/队列/backlog/matrix/ADR/规划混居·甄别归后续批次·如实登记）——含 `execution-master-checklist.md`（§1-② 触面·活卷禁迁）。
- 通用硬闸：任何路径名匹配五线 pattern（`h2-qbank-corpus`/`ha-6-companion`/`diag-honesty`/`g2-report-page`/`evidence-delivery`）者**无条件留置**（本 tip 实测零漏网·EXEC 重 pin）。
- 手法=先 `mkdir -p` 目标子目录·逐件 `git mv`（保 R100 rename 记录）·迁移集内容**逐字节零改写**（Ban 触内容·§5）。

### ② checklist 债行结账（恰五行触面·原文保留）

- `:2060` STILL OPEN 行：行内 `docs:check PTP_FILE_LIMIT` sibling 债**勾销**——以行尾追加结账注落（原字符零改写）：`（结账注 <日期>·line/ptp-archive：sibling 债 docs:check PTP_FILE_LIMIT 已勾销——FILE_LIMIT 红根除·残留 7 处 PTP_LOCAL_PATH 潜伏红归 B-lite 清欠另刀·见 ptp-archive-REQUEST §2）`。
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

## §2 验收断言（pre-exec 双审核对单基面·EXEC 立项重 pin·**含对处方一处勘误**）

1. **迁移纯度**：对基线 `git diff --name-status` 迁移集**全 R100**·零 M/A/D 混入；M 恰三件=checklist/ADR-0019/proof（触面收束·§2-5）；本起草席 commit 恰 1 个新 .md（本卷）·零码动。抽 5 件迁移件 `git log --follow` 新旧路径同史在案。
2. **FILE_LIMIT 红根除（硬断言）**：迁移后落地实跑 `node scripts/ai-docs/check-docs.mjs` **零 PTP_FILE_LIMIT 命中**·`scannedFiles≈1743`（=1742+本卷·±EXEC 在飞漂移以实测重 pin）·**硬顶 ≤2048**。
3. **【勘误·改 pin】docs:check 残留错误=且仅=§0.5 pin 的 7 处 PTP_LOCAL_PATH**（逐条 file:line 全等·超集或异集=FAIL）——处方原文「docs:check EXIT=0 / valid:true errors:0」预演证伪（§0.5）：本刀验收=错误集自 `{PTP_FILE_LIMIT:4407}` 收窄为该七处·EXIT=1 如实登记为 base 残留不洗；全绿清欠归 B-lite 另刀。
4. **prove 全绿**：`pnpm public-text-policy:prove` EXIT=0（12 案全过·含新 E11 双断言）。
5. **三件触面收束**：checklist 五行注/勾销·ADR 增补·proof E11——diff 逐处对应 §1-②③④·触面外零 diff（checklist 注释外行零触碰）。
6. **在飞零触**：五线卷/收据+常驻 SOP 三件+散片留置 32 件零触碰（路径级白名单核验）。
7. markers=0（§7）+ est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **cap 数字零动**：`public-text-policy.mjs:40` `MAX_FILES=2_048` 零改（程序面改法归 B 程序另立·Ban 无依据改 `:40`）。
2. **living-loose 零迁**：本 tip 全仓零存在（§0.2 漂移表）·条款留档；若 EXEC 时现形则按在飞留置处置。
3. **在飞五线卷/收据零迁**（§0.6 清册·§1-① 硬闸）·常驻 SOP 三件零迁。
4. **deliveries 内容零改写**：迁移集逐字节零动纯 R100；checklist/ADR/proof 仅 §1-②③④ 触面·其余行零 diff。
5. **七处 PTP_LOCAL_PATH 零修**：潜伏红清欠=B-lite 治理随行件职责（§2-3）·本刀只登记不修。
6. **散片非 slice 32 件零迁**（§1-①-6·甄别归后续批次）。
7. **ADR status 零翻**：proposed 保持（§1-③·翻状态归用户/治理流程）。
8. **est live=0**：零模型外呼（§6）·零生产操作·零 secrets。

## §4 依赖与时序

- **EXEC 前置=零硬闸**：在飞五线（H2/HA6/EVIDENCE/#213/G2）的 harness 在途件已被 move 集硬排除（§0.6 清册）·自然豁免——**可即期 EXEC 立项**（预执行双审 PASS+协调方明示授权照旧）。
- **merge 顺序与 H2 零路径冲突**：H2 在飞触面=其卷与 qbank 码面·本刀迁移集硬排除 H2 名下一切路径·H2 后续只 M 其在途卷·零交集；G2/EVIDENCE 卷留置原位·其 EXEC 收据沿 §1-③ 新约定落顶屋·亦零冲突。
- 例外：若 H2/HA6/diag 在本刀 EXEC 前落线合入主线·其卷/收据按 §1-① 闭卷判据自然入迁（照 §0 重 pin 清册）。

## §5 Ban 列表 + pins（沿 diag 卷同源逐字誊 + 本刀面增补/豁免）

**Ban 列表**（diag 卷 §5 同源逐字誊 + 本刀面增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/issues-master 行与统计只读引用；**本刀精确豁免**：`execution-master-checklist.md` 恰 §1-② 五行触面·其余行仍只读）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（迁移集=§1-① 白名单·越界即 FAIL）；Ban 触其他工作树；Ban 伪造已问/已验来源（零机制现状不假称既有）；**本刀增补**：Ban 改写迁移集任何文件内容（R100 纯度·逐字节零动）；Ban 动 cap 数字（`public-text-policy.mjs:40`）；Ban 迁在飞五线卷/收据与常驻 SOP（§0.6）；Ban 翻 ADR-0019 status（proposed 保持）；Ban 修七处 PTP_LOCAL_PATH（清欠归 B-lite·本刀只登记）；Ban 伪造「docs:check 全绿」宣称（残留七处如实登记·§2-3 勘误）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）

## §6 est live=0

本刀零模型外呼：git mv 纯文件系统/索引操作·checklist/ADR 为 docs·proof E11 为静态夹具断言（零网络零模型）——全静态·零生产操作·零 secrets·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ptp-archive-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove·EXEC 收据复核）。五类标记词不复抄卷内（避免自匹配·沿 diag/h2 卷同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本卷恰 1 .md·恰 1 commit）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——本卷 §0 数字/行号=base `c7142596` 实测·漂移必登记）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

---

*PTP-ARCHIVE REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`c7142596` · 分支 `line/ptp-archive` · 工作树 `meetwise-ptp` · 形制沿 diag-honesty-REQUEST（Ban/pins 同源誊录）· 惯例先例 `217dde27` 顶屋 receipts/ · 四件=①git mv 3183 件→`receipts/archive/2026-09-batch23/`（R100 零改写·五线硬排除·SOP 三件与散片非 slice 32 件留置）②checklist 债行 `:2060` 勾销+四披露行结账注（原文保留）③ADR-0019 增补落点约定+cap 依据登记（status 仍 proposed）④proof `TC-quality-04-E11` FILE_LIMIT 边界双断言 · 预演勘误：残留 1742≤2048（余量 306）·停摆期潜伏 7 处 PTP_LOCAL_PATH 浮出如实改 pin（全绿清欠归 B-lite）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
