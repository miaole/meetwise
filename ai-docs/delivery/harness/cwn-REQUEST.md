# Harness — **C-WORD-NEG · UC-018 follow-up 词面负例（覆盖状态解析器词面边界 NEG）起草任务书**（Line CWN · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · NEG 臂设计起草卷 · 起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-10-26 起草落卷 · **rev r1 回炉修订 2026-10-30**（双席 FAIL 同判·修订清单九件全采纳·§0.0.2）· docs-only 起草卷·本步零码面零 NEG 臂零收据件·后继 EXEC 待协调方派单 + pre-exec dual 放行·alone≠dual·Ban self-approve）。
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null`（十值零翻转·本刀全卷不改）。
**Date**: 2026-10-30
**Base / tip**: 起草时点 `origin/main` **`af273901a`** / full `af273901a165c910fe16cfef675d122812d3e779`（#181 isob 合卷已落）；**r1 现场漂移如实采（2026-10-30 亲跑·`git fetch origin` EXIT=0）**：`origin/main` 届值已推进至 **`44f624253`**（#177 uc50 二轮并线已落·cap 届值 `MAX_FILES=2_452` 亲证）——**`af273901a` 已非 origin/main 届值**，本卷不重定基线、不 rebase、不追并线（EXEC 立项日按当时届值重导·§4）；worktree `meetwise-cwn` · branch `line/cwn-draft` · ⛔动主仓 · ⛔push。
**卷源（登记三处 + 提点三处 · 对 tip 亲点）**: `ai-docs/delivery/gap-bug-backlog.md:37`（P2 残余行本体）+ `ai-docs/delivery/e2e-covered-path-backlog.md:44`（执行序 follow-ups 尾提点）+ `ai-docs/delivery/e2e-requirement-coverage-matrix.md:123`（§1.0.1 UC-E2E-018 行尾 follow-ups 提点）+ `ai-docs/delivery/harness/uc-e2e-018-receipt-backfill.md:61`（register-only bullet）。
**本卷性质**: docs-only 起草卷。认领 **C-WORD-NEG** 残余行（P2 · e2e 域 · follow-up · covered-criterion review residual）＝覆盖状态解析器**词面（word-boundary）负例**未证空窗：`\bpartial\b` 词面臂误匹配否定词形「not partial」——登记在案、无人认领、无测试臂。本卷起草 NEG 臂设计与修向预登，为后继 EXEC（修法 + NEG 臂落码）拟定交付面。登记≠修复≠定谳≠关闭；行翻面权归协调方。
**Knife id**: **`C-WORD-NEG`**（非 GAP-* 编号——gap-bug-backlog `:37` 以残余行 ID 直登，姊妹行 `GAP-EVAL-PARSER-DETAILS-UNCLOSED` `:36` P1 另刀，零代偿零并卷）。
**Experts**: `mw-e2e-ha` + `mw-rag-route`（沿 COVERED-CRITERION / RECEIPT-BACKFILL 双审对形·`matrix:123` dual 史录亲证 · stub PENDING · Ban self-approve · alone ≠ dual）。
**Authority**: meetwise — docs REQUEST open only · Ban secrets / `.env*` · Ban force-push · Ban SSOT 行翻转（本 commit）· Ban push。

---

## 0. 本刀在谱系中的位置 + 语义源辨析（先读再写的事实链）

- **谱系**：COVERED-CRITERION 刀（`GAP-UC018-COVERED-CRITERION` CLOSED · runner `22790a8` · dual `fc7dc24`/`6d2841c` · mutation 423/423）→ post 审（`receipts/archive/2026-09-batch23/reviews/REQUEST-2026-09-23-uc-e2e-052-checkpoint-physical-mw-e2e-ha.md`）**fail-open hunt** 在 `:250` 登记残余：`\bpartial\b` 亦匹配英文 **"not partial"**（与 legacy018 L433 同形）· **live matrix vocabulary unused**（当时真矩阵无此词形·潜在不现行）→ `:260` 定性 **Residual note only** · **not B1/B2 reopen** → 登记面三处（gap-bug-backlog `:37` / backlog 执行序 `:44` 尾 / coverage-matrix `:123` 行尾）+ harness register-only `:61`（「register only; fix may be later」）。RECEIPT-BACKFILL 与 ADV 审查词面（`:112`「§1.0 ADV **case-only**（not partial）」）即该词形在卷实录。
- **本刀（Line CWN）**＝总盘 #9 P3 小刀对该残余的 NEG 起草席：①语义源亲读定界（§1）②NEG 臂设计（§2）③keyless/cap/重叠/est live 四核（§3–§5）。
- **派单词面 vs 仓内登记语义·如实辨析（SSOT 优先）**：派单 gloss 作「follow-up 追问链中敏感词/禁词/边界词形的拒绝行为」；仓内登记本体（gap-bug-backlog `:37` 逐字：`\bpartial\b` 误匹配 「not partial」·目标列 word-boundary / negation-aware status parse）系**覆盖状态解析器**的词面边界残余，**非**面试追问链语义、**非**产品敏感词面。本卷按仓内 SSOT 登记起草（登记行是唯一可认领实体）；「边界词形」义相合，「追问链/敏感词」义与登记不符，如实上报分歧，Ban 自建 SSOT 行。
- **停止条件预判（派单：触模型分类器 keyless 不可达即红停）**：C-WORD 面＝纯 regex 文本解析（node + git + fs），零模型分类器、零 MODEL_API_KEY、零 docker——**keyless 全可达，停止条件未触发**（§3 亲证）。

## 0.0.1 防重双对表 + 在飞交叠登记（起草 turn 实测）

- `git worktree list` 本 turn **47 树**——`meetwise-cwn` 恰 1 命中＝本席；`git ls-files ai-docs/delivery/harness/ | grep cwn` **零命中** → 落卷后唯一同名卷＝本卷。
- **工作树独占申明（r1 改写）**：本席只认领 `meetwise-cwn` 树（`line/cwn-draft`）；`meetwise-evap` / `meetwise-r5mr` 等他席树**只读不写**。**EXEC 立项日必做**：`git status --porcelain` **清场核**（r1 亲测：本树现存 1 件 untracked 环境件 `ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-covered-lift-evidence.json` → 受管 `--others` 计面使 docs:check 现扫 2449>cap 2448 红·§6；该件非本刀产物·归属协调方处置，Ban 删/移/改以凑绿）＋ `git rev-parse origin/main` 届值亲点（r1 已实测推进·本 Header Base/tip 节）。
- **同 tip 并行席**：`line/evap-draft`（起草时 @`af273901a`·0 commits ahead；**r1 实测已推进至 `de71ca40d`**（rev r1 回炉 commit·`evap-REQUEST.md` 单件）——名形近姊妹刀 `GAP-EVAL-PARSER-DETAILS-UNCLOSED`（EVAL-PARSER）域——**如实登记不可读性**，若系姊妹刀则在飞触面＝FX-DUAL-DETAILS-UNCLOSED 结构解析臂（`<details>` 未闭合/诊断），与本刀否定词面臂**行级同域、臂级互斥**（不同残余行不同 fixture）。**r1 已亲读其卷面**：其 §0 对同批四 prove 的届值/三类先在红承登与本卷 r1 **互证一致**（38 archive + 1 drift + `:584` 崩溃）→ 两刀**环境先在红分口同判**、`CAP-SANCTION-2448` 同号并留（§4）。**EXEC 立项日必做**：`git diff --name-only <届时 origin/main>..line/evap-draft` 逐文件复核，任一触面撞本刀面（§1 五件解析器文件 + 本卷）即触「现场漂移」停手上报。
- **同 tip 并行席（r1 补登·r5mr）**：`line/r5mr-draft` @`ebce6ff56`（收官并线支·cap `CAP-SANCTION-2448` 同号承登线之一·§4）——工作树 `meetwise-r5mr`；r1 实测其收官 commit `0e42adb21` 已并入 `origin/main`（`git merge-base --is-ancestor 0e42adb21 origin/main` **EXIT=0** 亲证），故本刀与其**已无并线竞争**，但**同号 2448 出处分立须双留**（§4）。触面复核口径同上：EXEC 日 `git diff --name-only <届时 origin/main>..line/r5mr-draft` 逐文件核，撞本刀面即停手上报。
- **陈旧长线**：`line/ag18-draft`（ahead 2588/behind 3305）· `line/cap-2272`（ahead 2590/behind 3305）· `line/campaign-state`（ahead 2593/behind 324）对解析器面有历史 commit，但三支全远滞非活跃竞争面（沿 pay-neg §0.0.1 长线陈旧支判例）；本支触面文件（§1 五件 + policy 双件）在 `af273901a..支顶` 区间无新增提交者仅此三支历史区间，非本 turn 竞争。
- **零重叠正申明**：本刀不认领任何 `NHP-018-*` 行（产品 NEG/FAULT/BOUND/ADV/PERF/LOAD 面各有其证·§1.4）、不改双矩阵格值、不改 backlog/gap 登记行状态、不代偿姊妹 DETAILS 刀。

## 0.0.2 rev r1 回炉（2026-10-30 · 双席 FAIL 同判 · 九件全采纳 · 卷内落点索引）

- **入卷因由**：pre-exec dual r1 **两席均 FAIL**，且**互盲同判**——①P1 基线假绿（ARM-4「四 prove 全 EXIT=0」与实测/矩阵 `:306` known-RED 直接矛盾）②P1 否定词表缺口（`banNear` `:103` 无 `no`/`non-`/`非`，`no gap` 修后仍返 gap）③P1 ARM-2 归法二义（hit 级 skip vs cell 级 fail-closed 未钉死）。裁决：**两席修订清单合并去重九件全采纳**，卷内逐条落点如下。
- **修订索引**：①[P1] ARM-4 重定界 → §2 ARM-4 + §1.4 + §6；②[P1] 否定词表裁定项 → §2「否定词表预登」；③[P1] ARM-2 归法钉死 → §2「归法」+ ARM-2 行；④[P2] ARM-1/ARM-3 改标 + 真红拉低形 + `#4` 注入 → §2 表；⑤[P2] 窗形钉全 + partially/fence 登记 + `:752`/`:764` 兜底交互 → §1.1-7 + §2 断言补注；⑥[P2] cap 三线同号 + 漂移 + EXEC 并线预期 + dual-keep 义务 → §4（+ Header Base/tip）；⑦[P2] 并行席表补 r5mr + 清场核 → §0.0.1；⑧[P3] 卷头 Date + gatherer `cellStatus` 可测性登记 → Header + §2 可测性项；⑨ rev r1 小节 → 本 §0.0.2。
- **STOP 维持**：卷内三处（标题 · Status · 卷尾注）仍 `draft:awaiting_pre_exec_dual`——r1 只改卷面事实与设计钉，**不放行 EXEC**；再放行须 fresh dual。
- **零证据面翻转**：Pins 十值零翻转；`apps/*/src`/`packages/*/src` 零 diff；本 rev 只改本卷 `.md` 一件（§9）。

## 1. 产品面侦察（只读取证 · file:line 全引 · blob 对 tip `af273901a` 亲算）

### 1.0 blob 锚表

| 文件 | blob（行数） | 本刀关联锚 |
|---|---|---|
| `scripts/eval-harness-matrix-cite.proof.mjs` | `36cefcba`（824） | `:418-426` STATUS_RANK · `:429-437` legacy018 · `:452-473` conservative · `:475-492` parseSection101Facets · `:594-624` 自测 |
| `scripts/lib/uc-covered-real-gatherer.mjs` | `3971e436`（807） | `:70-77` cellStatus · `:79-88` parseNhpRow · `:93-108` gapClosedInText 否定窗先例（`:103` banNear）· `:539-543`/`:618`/`:752`/`:772` 消费点 |
| `scripts/lib/uc-covered-evaluator.mjs` | `ec62c4c2`（340） | `:118` status 直等比较（不吃词面正则）· `:30-31` STATUS_NOT_COVERED |
| `scripts/uc-e2e-018-covered-lift-reassess.proof.mjs` | `5f67d2ac`（527） | `:111` 同形 legacy 首hit |
| `scripts/uc-e2e-018-covered-lift.proof.mjs` | `afd6b928`（380） | `:139` `advIsPartial = /\*\*partial\*\*/.test(advCell) || /\bpartial\b/.test(advCell)` |
| `ai-docs/delivery/gap-bug-backlog.md` | `33ba0d86`（959） | `:37` C-WORD-NEG P2 行 · `:36` 姊妹行 |
| `ai-docs/delivery/e2e-covered-path-backlog.md` | `05a76401`（55） | `:44` 执行序尾 follow-ups 提点 |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `1a1844eb`（522） | `:123` §1.0.1 行 · `:183` §1.1 行 · `:270` P0-8 · `:312` live-prove 表 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `64988114`（218） | `:78-83` NHP-018 六行 |
| `ai-docs/delivery/harness/uc-e2e-018-receipt-backfill.md` | `d02fc169`（101） | `:61` register-only |
| `scripts/ai-docs/public-text-policy.mjs` | （本刀步进后 `:263` `MAX_FILES = 2_448`） | §4 cap |

### 1.1 C-WORD 词面语义源＝解析器族五件（逐件亲读 · 词面臂逐条）

1. **`eval-harness-matrix-cite.proof.mjs:429-437` `cellStatusLegacy018`**（首hit 形）：`:431` blind 臂 `/\*\*blind\*\*|\bblind\b/i`（且无 `**partial**`/`**covered**` 粗体排除）· `:432` covered 粗体臂 · **`:433` partial 臂 `/\*\*partial\*\*|\bpartial\b/i` ← 残余本体**（`\bpartial\b` 词面臂无否定窗）· `:434` gap 臂 `\bgap\b` 同形 · `:435` `not_run|case-only|blocked` 臂。审注「same shape as legacy018 L433」即此行（起草时点行号 `:433`→现 `:433` 亲证未漂）。
2. **`eval-harness-matrix-cite.proof.mjs:452-473` `cellStatusConservative`**（min-rank 形）：`:456` `stillRe` still-残留收集 · `:462-465` 词面臂循环 `\\b<name>\\b`（covered/partial/honesty-pin/case-only/gap/blind 六词·**同样无否定窗**）→ `:470-472` minStatus 取最弱。负例形：输入 `not partial` → found=`['partial']` → 返 `'partial'`（无更低 rank 可兜）。
3. **`uc-covered-real-gatherer.mjs:70-77` `cellStatus`**（真矩阵 gatherer · 首hit 形·**最锐暴露面**）：`:72` covered 粗体臂 → **`:73` partial 臂 `/\*\*partial\*\*|\bpartial\b/i`** → `:74` `case-only` 臂 → `:75` blind 臂 → `:76` gap 臂。负例形：`**case-only**（not partial）` → partial 词面臂先于 case-only 臂首hit → **返 `'partial'`（case-only 在场仍被抢占）**。消费点：`:539-543`（NHP 行族）· `:752`（§1.1 statusCell 兜底）· `:772`（§1.0 BOUND 格）——真矩阵格值直读面。
4. **`uc-covered-real-gatherer.mjs:79-88` `parseNhpRow`**：partial 用粗体-only 臂（`:82`），non-bold 「not partial」落末行返 unknown——粗体否定形 `not **partial**` 可误hit（词形面同族，登记入臂面）。
5. **同形复制件**：`uc-e2e-018-covered-lift-reassess.proof.mjs:111`（legacy 首hit 同形）· `uc-e2e-018-covered-lift.proof.mjs:139`（`advIsPartial` 裸 `\bpartial\b`）——三处词面臂同源同病，EXEC 修法须逐一同步或显式豁免登记。
6. ** evaluator 本体 `uc-covered-evaluator.mjs:118`** 吃的是已解析 status 字符串直等比较——**词面风险不在 evaluator 层**，在 gatherer/cite 解析层（空窗定界＝本条，Ban 把修法错落 evaluator）。
7. **仓内否定感知先例（修向模板）**：`uc-covered-real-gatherer.mjs:93-108` `gapClosedInText`——CLOSED/已关 匹配配 **banNear 否定窗**（`:103` 词表逐字：`不得|禁止|\bBan\b|不可|未|不得写已关|\bnot\b|not\s+closed|≠\s*closed`）逐 hit 回看 **前 48 字 / 后 16 字**窗（`:108` `m.index - 48` · `:109` `+ 16` 亲证），窗内否定词即弃该 hit——**同一文件内已有否定感知先例，C-WORD 修向沿此形**（status 词面臂命中处加同形否定窗），非新技术引入。**（r1 补：词表缺口与窗形）** 该词表**不含** `\bno\b` / `\bnon-?\b` / `非`——`no gap` / `non-partial` / `非 partial` 修后仍会被判为正向命中（即 `no gap` 仍返 `gap`）；词表扩展或注入集收窄**列为 pre-exec dual 裁定项**（§2「否定词表预登」），**Ban 起草席自裁**。
8. **（r1 补）`:752`/`:764` unknown→partial 兜底交互**：真矩阵 §1.1 statusCell 消费点 `:752` `cellStatus(row11?.[2] || row11?.[1] || 'partial')`（缺格时以字面 `'partial'` 兜底），返回 `'unknown'` 时又在 `:764` `status: s11Status === 'unknown' ? 'partial' : s11Status` 二次兜底为 `partial`（r1 亲证行号；派单作 `:765` 系邻行勘误）。**后果**：否定感知修法若取「hit 级 skip → 全臂耗尽返 unknown」，§1.1 面**仍会由 :764 归为 partial**——该修法在 §1.1 面**无可见翻转**，故：①ARM 断言不得写「§1.1 由 partial 翻 unknown」；②§1.1 的否定形只能断言「不经 :752 的 `cellStatus` 直调结果」或「经兜底后仍为 partial（兜底优先，非误判）」；③此交互属**登记**，改不改兜底链归协调方（本刀零触 :752/:764 代码）。

### 1.2 活词面实证（等形探针 · node 亲跑 · 字面量与源逐字同源 · stdout 即弃）

`node -e` 对 `:433`/`:73` 字面量等形复算：`legacy018 形('not partial')` = **`'partial'`** · `gatherer 形('**case-only**（not partial）')` = **`'partial'`**（case-only 在场仍被抢占·最锐形）· `gatherer 形('not partial')` = **`'partial'`** · `legacy018 形('≠ covered')` = `'unknown'`（`≠` 词形不在任何臂·对照）。即：残余**现行即红**（对含否定词形的输入），唯「live matrix vocabulary unused」（审注 `:250` 亲读）——真矩阵现存格无否定词形，故未实际误判；**审查文档词形已在卷**（`REQUEST-2026-09-23-uc-e2e-018-adv-mw-rag-route.md:112`「§1.0 ADV **case-only**（not partial）」逐字亲读），该词形一旦入矩阵格即现行误判。

### 1.3 矩阵 UC-018 行 fresh 亲点（C-WORD 批注现状）

- `e2e-requirement-coverage-matrix.md:123`（§1.0.1）：`| UC-E2E-018 | **partial** | **case-only**（NHP-018-FAULT-01） | **partial**（CAS waiting_user · **NHP-018-BOUND-01**） | **partial** | …` 行尾 follow-ups 提点 `… · C-WORD-NEG · RECEIPT-BACKFILL nailed …`——NEG/FAULT/BOUND/ADV 四格值与 C-WORD 提点**原样亲点在位**（blob `1a1844eb`）。
- `:183`（§1.1）· `:270`（P0-8）· `:312`（live-prove 表）三处同提点亲点在位；UC-018 stays **partial** 全表一致。
- **本刀零格值触碰**：C-WORD 是矩阵解析器的残余，不是矩阵行的新格值——本刀与后继 EXEC 均 Ban 动 `:123`/`:183` 四格值与 stays partial 旗。

### 1.4 既有收据覆盖面（NEG/FAULT/BOUND 现状 + parser 测试面 → 未证空窗定位）

- **产品 NHP-018 面（case-matrix `:78-83` 亲读）**：NEG-01 **partial**（api abandon 后复活拒·`uc018` http）· FAULT-01 **case-only**（D2）· BOUND-01 **partial**（CAS waiting_user·D1）· ADV-01 **partial**（`post_prove_dual_pass`）· PERF-01/LOAD-01 **partial**——**产品负例面各有其证，与本刀零交**（本刀＝覆盖度量工具面的词面负例，e2e 域 P2）。
- **parser 现有测试面（空窗定位亲读）**：cite 自测 `:594-624`——still-残留 min 形断言在钉（`still gap ⇒ gap (not partial)` 三条·括注系测试消息非注入词面）· bare blind/partial · unparseable⇒unknown · UC-018 plain-cell conservative≡legacy 恒等——**无一条否定词面注入臂**；covered-criterion prove `:242-267` **gap 闭判定已有否定窗测试**（`gapClosedInText: positive CLOSED/已关 + negation Ban/不得/禁止/不可/未/not` 在钉）——**同文件族内 status 词面臂无对应否定臂＝恰为本刀未证空窗**；mutation 423/423 不含否定词面变异位。

### 1.5 登记原文三处（逐字亲读）

- gap-bug-backlog `:37`：`| C-WORD-NEG | P2 | \bpartial\b 误匹配 「not partial」 | word-boundary / negation-aware status parse | e2e | follow-up | covered-criterion review residual |`
- harness/uc-e2e-018-receipt-backfill `:61`：`- **C-WORD-NEG**: \bpartial\b matches 「not partial」— register only; fix may be later`
- 残余出处 review `:250`/`:260`（`receipts/archive/2026-09-batch23/reviews/…uc-e2e-052-checkpoint-physical-mw-e2e-ha.md`·append-only 引证零触）。

## 2. NEG 臂设计（后继 EXEC 拟面 · 本卷零码动 · 沿 NEG 族先例形）

**修向（登记目标列逐字）**：word-boundary / negation-aware status parse——沿 `gapClosedInText` banNear 否定窗先例（§1.1-7）给 status 词面臂加否定窗；**修法落 gatherer/cite 解析层五件（§1.1-1/2/3/4/5），Ban 落 evaluator**。注入→断言**拒收**（具名形：拒归 `partial`/`covered` 等被否定 status）。

**否定词表预登（[P1] r1 裁定项·二择一卷内钉死·倾向扩展形）**：
- **已覆盖**（`:103` 现表 `不得|禁止|\bBan\b|不可|未|不得写已关|\bnot\b|not\s+closed|≠\s*closed`）：`not partial` / `not blind` / `not covered` / `not closed` / `≠ closed` 均命中。
- **缺口（r1 亲证·现表未覆盖）**：`\bno\b`（`no gap` → 现仍返 `gap`）· `\bnon-?\b`（`non-partial`）· `非`（`非 partial`）。
- **主选＝扩展形（倾向）**：status 词面臂否定窗补 `\bno\b` / `\bnon-?\b` / `非`，**逐项列**：ARM-1 注入集 `not partial` / `not blind` / `no gap` 全闭；新增 `non-partial` / `非 partial` / `no covered` 三形纳入断言。**风险预登**：`非` 无词界，裸加会误抑「非常 …」（如「非常 partial」）——扩展形须钉作用域（建议 `非\s*(?=partial|covered|blind|gap)` 或等价邻接形，具体形由 dual 同项钉死）。**共享面抉择**：若直接扩 `banNear` 本体（`gapClosedInText` 共用）则 CLOSED 判定同步改变（`no CLOSED` / `非 CLOSED` 将不再算闭）——dual 须显式择「共享词表扩展」vs「status 臂独立否定词表」。
- **备选＝收窄注入集**：ARM-1/2/3 只保留现表已覆盖形（`not …`），把 `no gap` / `non-partial` / `非 partial` **如实登记为不闭残余**（登记≠修复≠关闭·C-WORD-NEG 行不翻面）。
- **卷内约束**：不论择哪支，**钉死一支·Ban 两义并存**；本卷倾向扩展形，最终归 pre-exec dual。

**归法（[P1] r1 钉死·ARM-2 归法唯一解）**：**hit 级 skip**——对每个词面臂的每个 hit 取否定窗（前 48 / 后 16·§1.1-7），窗内见否定词则**弃该 hit、续后续臂**；**全臂耗尽仍无正向 hit 才返 `unknown`**（conservative 侧同法：否定 hit 不入 `found`，少一词后 `min` **自然上移**，不短路、不额外抬 rank）。**Ban cell 级 fail-closed**——整格直判 `unknown` 与 ARM-2「`**case-only**（not partial）` 必返 `case-only`」断言直接矛盾，禁用。

**可测性预登（[P3] r1）**：`uc-covered-real-gatherer.mjs` 的 `cellStatus` / `parseNhpRow` 系**模块私有**（现无 `export`·r1 亲证）——NEG 臂落码二择一：①导出供 prove 直 import 断言；②经公共入口 `gatherRealUc018` + fixture 驱动。**二择一为 pre-exec dual 裁定项**，本卷不预判；若取 ② 则 fixture 落 tempdir + `skipPorcelainCheck` 形（沿 `covered-criterion.proof.mjs:575-600` 先例），**Ban 在真矩阵上原地改格驱动**。

**窗形与免疫面（[P2] r1 钉全）**：①**窗形＝前 48 / 后 16**（`uc-covered-real-gatherer.mjs:108` `m.index - 48` · `:109` `+ 16` 亲证——不是 48/48、不是 48/0）；②**作用域＝per-cell**（每格/每行独立取窗·跨格不借窗、不累计、不跨行）；③**`partially` 已免疫＝伪问题（词边界）**：`\bpartial\b` 不匹配 `partially`（`partial` 后接 `l` 无词界）——**登记为已免疫·不设注入臂**（避免双臂重复计红）；④**fence/引文窗边界＝不承诺形**：代码围栏（三个反引号）/行内引文/HTML 注释内的否定词是否入窗，本卷**不承诺**（修法未定·dual 裁定）；EXEC 断言只对 plain cell 文本成立，**Ban 把 fence 内形态写成已闭**。

| 臂 | 注入词面 | 断言（拒收形） | 对码 | 标注（r1） |
|---|---|---|---|---|
| **ARM-1** legacy 否定拒收 | `not partial` · `not blind` · `no gap`（扩展形择定后加 `non-partial` · `非 partial`） | `cellStatusLegacy018(x)` ∉ {被否定 status}：`not partial`→≠partial · `not blind`→≠blind · `no gap`→≠gap（现状各自误返——红→修→绿）；**若 dual 择「收窄注入集」则 `no gap` 移入不闭残余、不出断言** | `:429-437` `:433`/`:431`/`:434` | 真红 |
| **ARM-1 守卫臂** | `not covered` | ∉ {covered}——**出生即绿**（`:432` covered 仅粗体臂，非粗体 `not covered` 本不命中） | `:432` | 守卫臂（出生即绿）·**不计入红→绿** |
| **ARM-2** gatherer 首hit 拒收（最锐） | `**case-only**（not partial）` · `not partial` | 前者 gatherer `cellStatus` 返 `'case-only'`；后者经 hit 级 skip 全臂耗尽 → `unknown`（∉{partial,covered}）——case-only 在场不得被 partial 词面臂抢占 | `:70-77` `:73`；消费 `:752`/`:772` | 真红·归法=hit 级 skip（§2「归法」） |
| **ARM-3** conservative 否定 | `not partial` | 非 `partial`（skip 后 `found` 空 → `unknown`） | `:452-473` `:462-465` | 真红 |
| **ARM-3 守卫臂** | `still **gap**（not partial）` | min 仍 `gap`——**出生即绿**（`:463` 词面臂对 `not partial` 命中 partial，但 `min(gap,partial)=gap`，否定词面未拉低/顶高 min） | `:456`/`:462-465`/`:470-472` | 守卫臂（出生即绿） |
| **ARM-3 真红拉低形** | `still **partial**（not gap）` | 期望 `partial`；现状 `min(partial,gap)=gap`（否定形 `not gap` 把 min **拉低**）——红→修→绿 | `:456`/`:462-465`/`:470-472` | 真红（拉低形） |
| **#4 注入形**（parseNhpRow 粗体臂） | `not **partial**` | `parseNhpRow` status ∉ {partial}；现状 `:86` 粗体臂先 hit → `partial`（红） | `:79-88` `:86` | 真红（粗体否定形） |
| **ARM-4** 真矩阵回归不变臂 | 修法前后真矩阵 §1.0/§1.1/NHP 行逐列解析值恒等（live vocabulary unused 保持·零现行格误判）＋ **四 prove 逐件 EXIT 现值 + FAIL 构成恒等（零新增零消失）**——起草/修订时点实测届值（2026-10-30 亲跑·环境先在红）：`eval-harness-matrix-cite:prove` **EXIT=1 · 39 FAIL** ／ `uc018:covered-criterion:prove` **EXIT=1 · 崩 `:584`**（cpSync ENOENT）／ `uc018:covered-lift:prove` **EXIT=1 · 15 FAIL** ／ `uc018:covered-lift-reassess:prove` **EXIT=1 · 21 FAIL**（树脏时改以 `DIRTY_TREE` 拒跑、零断言）。**EXEC 日亲跑重导届值**，断言＝同件同 FAIL 文字集恒等；cite 自测 `:594-624` 既有断言零删改（additive restatement 申明） | §1.4 空窗两侧 + §6 | 基线假绿已改定界（r1 P1） |
| **ARM-5** 负验证 | 摘除否定窗（还原裸词面）→ **对期望矩阵逐格恰红**：ARM-1/2/3 真红行、ARM-3 拉低形、#4 每格 FAIL **逐格可见（不多不少）** → 原样还原复绿 | 假绿证伪＝否定臂有真实检出力 | pay-neg §9-EXEC 换序 FAIL 还原先例形 | 恰红口径（r1 改） |

**ARM-4 基线三类先在红承登（r1·本刀不处置·沿 evap §0 分口）**：①**PTP-archive 迁移余波**（`e3502c0b6` git mv 后 proof 旧径读空——cite 38 FAIL + criterion `:584` 崩 + lift 15 + reassess 21 同因）；②**050–052 NEG case-only 漂移**（cite 唯一 1 FAIL `live 050–052 NEG ⇒ honesty-pin (min residual) (got case-only want honesty-pin)`·2026-10-27 开关刀 EXEC 副作用）；③**宿主/环境崩溃面**（criterion `cpSync` ENOENT 属宿主面先在崩溃；reassess 在本树 untracked 收据件在场时 `DIRTY_TREE` 拒跑属环境面）。**三类均系环境先在红·非本刀红**：本刀只承担「修法前后构成恒等」，**Ban 代偿**（不修 archive 路径、不修 050-052 断言、不删/移/改 `receipts/` 件以凑绿、不重建 `ai-docs/delivery/receipts/` 下缺失件）·**对齐与处置权归协调方**（沿 evap §0「三类承登不处置·协调方独立裁决」分口）。**matrix `:306` 零触**：`e2e-requirement-coverage-matrix.md:306` `eval harness cite … EXIT **1**（known RED）· FAIL=UC-018 facet[2]` 系 known-RED 登记本体——r1 实测其**构成已漂移**（facet[2] 现 PASS；红＝38 archive + 1 drift），本卷**只登记不改行**（SSOT 翻面归协调方），**ARM-4 断言不得引该行为绿基线**（引之即假绿再现）。

**交付面**：NEG 臂 additive 进既有 prove 文件（cite 与 covered-criterion 二择一或双落·pre-exec dual 裁定）；修法触 `scripts/` 解析函数本体——**`apps/*/src`/`packages/*/src` 产品码零 diff 意向**（prove-only+tooling 刀）。同形复制件（§1.1-5）修-断-或-豁免登记三择一随 pre-exec dual，Ban 只修一处冒充全修。
**非目标**：姊妹 `GAP-EVAL-PARSER-DETAILS-UNCLOSED`（`<details>` 结构解析/诊断·P1 另刀）；NHP-018 产品行补证；双矩阵/backlog 行文与行状态（SSOT 翻面权归协调方·EXEC 收据呈报后由协调方裁）。

## 3. keyless 判定（停止条件核）

**触模型分类器＝否**。C-WORD 面全部为 markdown 字符串 regex 解析（`test()`/`exec()`）· node+git+fs；涉及 prove 四件均本地 node 脚本零 docker 零 MODEL_API_KEY 零外部服务（§1.1/§2 ARM-4 亲证）。**派单停止条件（模型分类器 keyless 不可达→红停）未触发**；est live=0（零 e2e / 零 docker / 零 live key / 零模型调用）。派单 gloss「追问链敏感词/禁词」与仓内登记（覆盖状态解析器词面残余）不符——按 SSOT 登记起草·分歧如实上报（§0）。

## 4. cap 预算核（CAP-SANCTION-2448 起草随刀恰等步进）

- **基线（起草时点本 worktree 对 `af273901a` 亲跑）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2447** = `public-text-policy.mjs` `MAX_FILES = 2_447`（基线 `:261` 亲证）**恰等零余量** + 本卷 `harness/cwn-REQUEST.md` 受管 1 件 = **2448 必超**（`PTP_FILE_LIMIT:2448>2447` 形）。
- **随刀步进（常设预授权「越限沿常设预授权恰等步进预登」·沿 CAP-SANCTION-2442 isob 起草随刀单件恰等先例形）**：cap **2447→2448** —— 四联动点 = policy `:263` `MAX_FILES = 2_448`（+`:261-262` CAP-SANCTION-2448 双注记）+ proof `:442` `i < 2_448` / `:449` `scannedFiles, 2_448` / `:456` `f-2448.md` / `:459` `FILE_LIMIT:2449`（+`:440`/`:455` 链注记）· **+1 恰等零多放** · 计数预算非内容策略 · 越限臂 fabricated 数随 cap 联动同步 · 语义不变强度不减。
- **EXEC 期预计 +0 受管计面**（NEG 臂 additive 进既有 prove 文件；若 pre-exec dual 裁定独立 prove 文件则届值如实采·收据 `.log` 非扫描扩展名不计）；**[P1] EXEC 立项并线届值如实采**（fetch EXIT=0 → origin/main 届值亲点·禁止按本预登 2448 行使若届值已推移·预登作废重导沿 isob §6 先例形）。
- **CAP-SANCTION-2448 三线同号（[P2] r1 补登）**：①`line/r5mr-draft` 收官并线承 2448（`0e42adb21`·r1 实测已并入 `origin/main`·`git merge-base --is-ancestor` **EXIT=0** 亲证·即「r5mr-on-main」）；②`line/evap-draft` 起草承 2448（`evap-REQUEST.md` §1 逐字）；③本支 `line/cwn-draft` 起草承 2448（本卷）。**三支出处分立、同号并留不冲突**（沿 CAP-SANCTION-2446 isob+UC3F 三线同号先例形·取大恒）；**dual-keep 双留注记义务（沿 2446 先例）**：并线时两 policy 脚本注记/cap 区冲突须**双留**（本支 2448 注记 + main 届值注记并留·号随 merge-tree 重排·**Ban 单向覆盖**），EXEC 收据须列出双留两行原文。
- **现场漂移（[P2] r1 实测·只登不改）**：起草时点 base `af273901a` 已**非** origin/main 届值——2026-10-30 `git fetch origin` **EXIT=0**，`origin/main` 现为 **`44f624253`**（#177 uc50 二轮并线已落·cap `MAX_FILES=2_452` = CAP-SANCTION-2452 已落·`git show origin/main:scripts/ai-docs/public-text-policy.mjs` 亲证）。**EXEC 并线按 union 实测预计 CAP-SANCTION-2452+ 恰等步进**（届扫 <届时>+并入互斥受管目并集；r1 下界估算=2452+本卷 1=**2453 至少**，evap 若同落再 +1=2454——**以合并树实测为准·允许多放则停手上报**）；**禁止**按本预登 2448 或 r1 估算值直接行使，届值如实采·预登作废重导。

## 5. 零重叠核 + est live

- **零重叠**：`harness/` 无既有 `cwn*` 件（`git ls-files` 零命中亲证·文件名唯一）；在飞 47 树逐名亲点（§0.0.1——同 tip `line/evap-draft` 不可读性如实登记 + EXEC 日必做复核；三陈旧长线非活跃）；本刀零触 NHP-018 行、双矩阵格值、SSOT 行状态、姊妹 DETAILS 刀、`receipts/` append-only 史录。
- **est live=0**：零 e2e / 零 docker / 零 live key / 零模型调用；门＝三静态门（本地 node 脚本 + grep·§6）· docs:check / PTP 属静态门不计 prove。

## 6. 门矩阵（rev r1 亲跑原值 + 卷后实测 · 原值即报不修饰）

| 门 | 命令（树亲证） | 基线（改动前亲跑） | 落卷后（r1 本 commit 实测） | 后继 EXEC |
|----|----------------|--------------------|--------------------------|-----------|
| docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0 · scanned 2447**（=cap 恰等零余量） | **EXIT=1 · `public_text_policy:PTP_FILE_LIMIT:2449`**（scanned 2449 > cap 2448）——**唯一成因＝本树 1 件 untracked 环境件 `ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-covered-lift-evidence.json` 受 `--others` 计面**（非本刀产物·非本 commit 引入）；**清场核后实测 EXIT=0 · scanned 2448**（临时移出该件→跑→原样移回·r1 亲证）。归协调方处置（§0.0.1） | 必跑（届值重导 + `git status --porcelain` 清场核先做） |
| PTP | `node scripts/ai-docs/public-text-policy.proof.mjs` | **EXIT=0**（12/12 · `static_preflight_valid: selected=12/12; releaseEvidence=false`） | **EXIT=0**（12/12·r1 复跑亲证·cap 2448 联动值） | 必跑 |
| markers | 全仓行首冲突标记 grep（`^<<<<<<< ` / `^=======$` / `^>>>>>>> `） | **EXIT=1 零命中**（亲跑） | **EXIT=1 零命中**（hits=0·r1 复跑亲证） | 必跑 |
| diff 面 | `git diff --numstat HEAD` | — | r1 恰 **1 tracked**（本卷 `harness/cwn-REQUEST.md` 纯编辑·零他件·policy 双件零 diff） | 必检 |
| root lint / prove 四件 | `pnpm lint` / §2 ARM-4 四命令 | 本 worktree 无 node_modules → `pnpm lint` **未实跑（如实登记）**；**四 prove 纯 node 可跑且 r1 已实跑**：cite **EXIT=1 · 39 FAIL** · criterion **EXIT=1 · 崩 `:584`** · lift **EXIT=1 · 15 FAIL** · reassess **EXIT=1 · 21 FAIL**（树脏则 `DIRTY_TREE` 拒跑）——**基线假绿已撤·三类环境先在红承登（§2 ARM-4 段）** | 同左（本 rev 零码动·四值恒等＝预期） | 必跑（修法后断言＝FAIL 文字集恒等·零新增零消失） |
| 环境供给 | — | est live=0 · 0 Key 值 · `actualSpendCny=null` | 同左 | — |

**§6 口径申明（r1）**：本卷为**起草未实跑修法**之卷——四 prove **纯 node 可跑（keyless/零 docker）**，r1 已亲跑取届值并**如实承登全红**（不是未跑、不是全绿）；**原「四 prove 全 EXIT=0」为假绿基线，已删**。docs:check 红系环境 untracked 件计面（§0.0.1 清场核），非卷内新增受管件——**Ban 以删/移/改该件或抬 cap 凑绿**。

## 7. 停止条件核（起草席如实登记）

1. **模型分类器不可达**：未触发（§3——纯 regex 解析 keyless 全可达）。
2. **语义源分歧**：派单 gloss 与 SSOT 登记不符——按登记起草·上报裁决（§0），非停止条件形态（有唯一可认领登记实体）。
3. **cap 越限**：起草时点已沿常设预授权恰等步进承登 CAP-SANCTION-2448（§4·三线同号）——非未授权越限；**EXEC 期按届时并线届值重导（预计 2452+·§4）**，届值已推移时 2448 预登作废、不得强行使。
4. **现场漂移（r1 实测·已漂·只登不改）**：起草 turn 零漂（§1.0 blob 表对 `af273901a` 亲算）；**r1 turn 漂移成立**——`origin/main` 由 `af273901a` 推进至 `44f624253`（fetch EXIT=0 亲证·§4），且本树存在 1 件 untracked 环境收据件使 docs:check 现红（§6）。处置：**不 rebase、不追并线、不删件凑绿**——届值重导归 EXEC 立项日 + 协调方（沿 evap §0 分口）。
5. 其余（越限未授权/self-approve/push/动主仓）未命中。

## 8. Ban（逐条）

1. **Ban coding**：本 commit 零 scripts 产品面触碰（policy 双件属 cap 计数预算机制面非产品面）·后继 EXEC 亦 `apps/*/src`/`packages/*/src` 零 diff 意向（§2）。
2. **Ban SSOT edit**：gap-bug-backlog `:36-37` · e2e-covered-path-backlog `:44` · coverage-matrix `:123`/`:183` 格值与 stays-partial 旗 · execution-master-checklist——本刀全卷零触碰；C-WORD 行翻面/关闭归协调方。
3. **Ban 认领 NHP-018-\* 行**：产品 NEG/FAULT/BOUND 面（§1.4）各有其证，Ban 互借收据、Ban 冒充产品负例已补。
4. **Ban 代偿姊妹刀**：`GAP-EVAL-PARSER-DETAILS-UNCLOSED` 零代偿零并卷；若 evap 席系该刀，臂面互斥 Ban 互 wash。
5. **Ban 修法落 evaluator**：词面风险在 gatherer/cite 解析层（§1.1-6 定界）；Ban 只修一处冒充全修（五件逐一同步或显式豁免登记）。
6. **Ban prove / e2e / docker / push / force-push / self-approve / secrets / `.env*`**；三门有红即红停上报，Ban retry-to-green · Ban 选择性汇报。
7. **Ban 把本刀写成 UC-018 covered flip 前置或贡献**：EXIT0≠covered·coveredCount=8 不变·UC-018 stays partial·本刀 ≠ nail ≠ 残余关闭。
8. **Ban 触 `receipts/` 史录**（append-only·含 `:250`/`:260` 残余出处件与 adv review `:112` 词形实录件）。

## 9. 卷纪律

r1 rev diff 恰 **1 tracked**（本卷 `ai-docs/delivery/harness/cwn-REQUEST.md` 纯编辑·policy 双件零 diff·cap 不动）；commit 净消息 `docs(test): 修订覆盖解析词面边界回归基线`；⛔push；收据不入库（untracked·stdout 即弃）；实现方不 self-approve · alone≠dual · EXIT0≠covered · 登记≠修复≠定谳≠关闭 · **EXIT1≠本刀红**（三类环境先在红已分口）。

---

*Harness · C-WORD-NEG UC-018 follow-up 词面负例起草任务书 · rev r1 2026-10-30 · draft:awaiting_pre_exec_dual（卷尾注 · STOP 三处钉之三 · 与标题/Status 同值 · 起草/修订落卷即停 · 后继 EXEC 待协调方派单 + fresh pre-exec dual 放行）*
