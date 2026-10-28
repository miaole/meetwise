# Harness — **C-WORD-NEG · UC-018 follow-up 词面负例（覆盖状态解析器词面边界 NEG）起草任务书**（Line CWN · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · NEG 臂设计起草卷 · 起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-10-26 起草落卷·docs-only 起草卷·本步零码面零 prove 零收据件·后继 EXEC 待协调方派单 + pre-exec dual 放行·alone≠dual·Ban self-approve）。
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null`（十值零翻转·本刀全卷不改）。
**Date**: 2026-10-26
**Base / tip**: `origin/main` **`af273901a`** / full `af273901a165c910fe16cfef675d122812d3e779`（#181 isob 合卷已落·`git fetch origin` 本 turn 成功·HEAD==origin/main 亲证·worktree `meetwise-cwn` · branch `line/cwn-draft` · ⛔动主仓 · ⛔push）。
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
- **同 tip 并行席**：`line/evap-draft` @`af273901a`（0 commits ahead·落卷前意图不可读；名形近姊妹刀 `GAP-EVAL-PARSER-DETAILS-UNCLOSED`（EVAL-PARSER）域——**如实登记不可读性**，若系姊妹刀则在飞触面＝FX-DUAL-DETAILS-UNCLOSED 结构解析臂（`<details>` 未闭合/诊断），与本刀否定词面臂**行级同域、臂级互斥**（不同残余行不同 fixture）。**EXEC 立项日必做**：按 pay-neg §0.0.1 规则对 `line/evap-draft` 顶新 commit `git diff --name-only af273901a..` 逐文件复核，任一触面撞本刀面（§1 五件解析器文件 + 本卷）即触「现场漂移」停手上报。
- **陈旧长线**：`line/ag18-draft`（ahead 2588/behind 3305）· `line/cap-2272`（ahead 2590/behind 3305）· `line/campaign-state`（ahead 2593/behind 324）对解析器面有历史 commit，但三支全远滞非活跃竞争面（沿 pay-neg §0.0.1 长线陈旧支判例）；本支触面文件（§1 五件 + policy 双件）在 `af273901a..支顶` 区间无新增提交者仅此三支历史区间，非本 turn 竞争。
- **零重叠正申明**：本刀不认领任何 `NHP-018-*` 行（产品 NEG/FAULT/BOUND/ADV/PERF/LOAD 面各有其证·§1.4）、不改双矩阵格值、不改 backlog/gap 登记行状态、不代偿姊妹 DETAILS 刀。

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
7. **仓内否定感知先例（修向模板）**：`uc-covered-real-gatherer.mjs:93-108` `gapClosedInText`——CLOSED/已关 匹配配 **banNear 否定窗**（`:103` `不得|禁止|\bBan\b|不可|未|\bnot\b|not\s+closed|≠\s*closed`）逐 hit 回看 48 字窗，窗内否定词即弃——**同一文件内已有否定感知先例，C-WORD 修向沿此形**（status 词面臂命中处加同形否定窗），非新技术引入。

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

**修向（登记目标列逐字）**：word-boundary / negation-aware status parse——沿 `gapClosedInText` banNear 否定窗先例（§1.1-7）给 status 词面臂加否定窗；**修法落 gatherer/cite 解析层五件（§1.1-1/2/3/4/5），Ban 落 evaluator**。注入→断言**拒收**（具名形：拒归 `partial`/`covered` 等被否定 status；可归 `unknown` 或跳过该 hit，归法由 pre-exec dual 裁定，fail-closed 优先）。

| 臂 | 注入词面 | 断言（拒收形） | 对码 |
|---|---|---|---|
| **ARM-1** legacy 否定拒收 | `not partial` · `not blind` · `not covered` · `no gap` | `cellStatusLegacy018(x)` ∉ {被否定 status}（现状误返——红→修→绿） | `:429-437` `:433`/`:431`/`:432`/`:434` 四臂逐一 |
| **ARM-2** gatherer 首hit 拒收（最锐） | `**case-only**（not partial）` · `not partial` | gatherer `cellStatus` 返 `'case-only'`（前例）/ 非 `partial`（后例）——case-only 在场不得被 partial 词面臂抢占 | `:70-77` `:73`；消费点 `:752`/`:772` |
| **ARM-3** conservative min 拒收 | `not partial` · `still **gap**（not partial）` 混合形 | 非 `partial`；混合形 min 不被否定词面拉低也不被顶高 | `:452-473` `:462-465` |
| **ARM-4** 真矩阵回归不变臂 | 修法前后真矩阵 §1.0/§1.1/NHP 行逐列解析值恒等 | live vocabulary unused 保持（零现行格误判）；四 prove 回归 `eval-harness-matrix-cite:prove` / `uc018:covered-criterion:prove` / `uc018:covered-lift:prove` / `uc018:covered-lift-reassess:prove` 全 **EXIT=0**（keyless 本地 node·`package.json:81`/`:194`/`:192`/`:193` 亲证）——cite 自测 `:594-624` 既有断言零删改（additive restatement 申明） | §1.4 空窗两侧 |
| **ARM-5** 负验证 | 摘除否定窗（还原裸词面）→ ARM-1/2/3 恰红（逐臂 FAIL 可见）→ 原样还原复绿 | 假绿证伪＝否定臂有真实检出力 | pay-neg §9-EXEC 换序 FAIL 还原先例形 |

**交付面**：NEG 臂 additive 进既有 prove 文件（cite 与 covered-criterion 二择一或双落·pre-exec dual 裁定）；修法触 `scripts/` 解析函数本体——**`apps/*/src`/`packages/*/src` 产品码零 diff 意向**（prove-only+tooling 刀）。同形复制件（§1.1-5）修-断-或-豁免登记三择一随 pre-exec dual，Ban 只修一处冒充全修。
**非目标**：姊妹 `GAP-EVAL-PARSER-DETAILS-UNCLOSED`（`<details>` 结构解析/诊断·P1 另刀）；NHP-018 产品行补证；双矩阵/backlog 行文与行状态（SSOT 翻面权归协调方·EXEC 收据呈报后由协调方裁）。

## 3. keyless 判定（停止条件核）

**触模型分类器＝否**。C-WORD 面全部为 markdown 字符串 regex 解析（`test()`/`exec()`）· node+git+fs；涉及 prove 四件均本地 node 脚本零 docker 零 MODEL_API_KEY 零外部服务（§1.1/§2 ARM-4 亲证）。**派单停止条件（模型分类器 keyless 不可达→红停）未触发**；est live=0（零 e2e / 零 docker / 零 live key / 零模型调用）。派单 gloss「追问链敏感词/禁词」与仓内登记（覆盖状态解析器词面残余）不符——按 SSOT 登记起草·分歧如实上报（§0）。

## 4. cap 预算核（CAP-SANCTION-2448 起草随刀恰等步进）

- **基线（本 worktree 对 `af273901a` 亲跑）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2447** = `public-text-policy.mjs` `MAX_FILES = 2_447`（基线 `:261` 亲证）**恰等零余量** + 本卷 `harness/cwn-REQUEST.md` 受管 1 件 = **2448 必超**（`PTP_FILE_LIMIT:2448>2447` 形）。
- **随刀步进（常设预授权「越限沿常设预授权恰等步进预登」·沿 CAP-SANCTION-2442 isob 起草随刀单件恰等先例形）**：cap **2447→2448** —— 四联动点 = policy `:263` `MAX_FILES = 2_448`（+`:261-262` CAP-SANCTION-2448 双注记）+ proof `:442` `i < 2_448` / `:449` `scannedFiles, 2_448` / `:456` `f-2448.md` / `:459` `FILE_LIMIT:2449`（+`:440`/`:455` 链注记）· **+1 恰等零多放** · 计数预算非内容策略 · 越限臂 fabricated 数随 cap 联动同步 · 语义不变强度不减。
- **EXEC 期预计 +0 受管计面**（NEG 臂 additive 进既有 prove 文件；若 pre-exec dual 裁定独立 prove 文件则届值如实采·收据 `.log` 非扫描扩展名不计）；**[P1] EXEC 立项并线届值如实采**（fetch EXIT=0 → origin/main 届值亲点·禁止按本预登 2448 行使若届值已推移·预登作废重导沿 isob §6 先例形）。

## 5. 零重叠核 + est live

- **零重叠**：`harness/` 无既有 `cwn*` 件（`git ls-files` 零命中亲证·文件名唯一）；在飞 47 树逐名亲点（§0.0.1——同 tip `line/evap-draft` 不可读性如实登记 + EXEC 日必做复核；三陈旧长线非活跃）；本刀零触 NHP-018 行、双矩阵格值、SSOT 行状态、姊妹 DETAILS 刀、`receipts/` append-only 史录。
- **est live=0**：零 e2e / 零 docker / 零 live key / 零模型调用；门＝三静态门（本地 node 脚本 + grep·§6）· docs:check / PTP 属静态门不计 prove。

## 6. 门矩阵（起草席亲跑原值 + 卷后实测）

| 门 | 命令（树亲证） | 基线（改动前亲跑） | 落卷后（本 commit 实测） | 后继 EXEC |
|----|----------------|--------------------|--------------------------|-----------|
| docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0 · scanned 2447**（=cap 恰等零余量） | **EXIT=0 · scanned 2448**（=新 cap 2448 恰等·§4） | 必跑（届值重导） |
| PTP | `node scripts/ai-docs/public-text-policy.proof.mjs` | **EXIT=0**（12/12 · `static_preflight_valid: selected=12/12; releaseEvidence=false`） | **EXIT=0**（12/12·越限臂 2_448/2449 联动后复跑亲证） | 必跑 |
| markers | 全仓行首冲突标记 grep（`^<<<<<<< ` / `^=======$` / `^>>>>>>> `） | **EXIT=1 零命中**（亲跑） | **EXIT=1 零命中** | 必跑 |
| diff 面 | `git diff --numstat HEAD~1` | — | 恰 **3 tracked**（本卷 .md 新增 + policy 双件·§4）零他件 | 必检 |
| root lint / prove 四件 | `pnpm lint` / §2 ARM-4 四命令 | 本 worktree 无 node_modules 未实跑（**如实登记**·draft 三门不含） | — | 必跑（修法后·NEG 臂 additive 后基线值步进如实登记） |
| 环境供给 | — | est live=0 · 0 Key 值 · `actualSpendCny=null` | 同左 | — |

## 7. 停止条件核（起草席如实登记）

1. **模型分类器不可达**：未触发（§3——纯 regex 解析 keyless 全可达）。
2. **语义源分歧**：派单 gloss 与 SSOT 登记不符——按登记起草·上报裁决（§0），非停止条件形态（有唯一可认领登记实体）。
3. **cap 越限**：已沿常设预授权恰等步进随刀承登（§4·CAP-SANCTION-2448）——非未授权越限。
4. **现场漂移**：起草 turn 零漂（§1.0 blob 表对 `af273901a` 亲算；同 tip evap 席零 commit·EXEC 日复核规则预登 §0.0.1）。
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

diff 恰 3 tracked（本卷 `ai-docs/delivery/harness/cwn-REQUEST.md` 新增 + `scripts/ai-docs/public-text-policy.mjs` + `scripts/ai-docs/public-text-policy.proof.mjs` cap 恰等步进·§4）；commit 净消息 `docs(test): 起草追问词面负例任务书`；⛔push；收据不入库（untracked·stdout 即弃）；实现方不 self-approve · alone≠dual · EXIT0≠covered · 登记≠修复≠定谳≠关闭。

---

*Harness · C-WORD-NEG UC-018 follow-up 词面负例起草任务书 · draft:awaiting_pre_exec_dual（卷尾注 · STOP 三处钉之三 · 与标题/Status 同值 · 起草落卷即停 · 后继 EXEC 待协调方派单 + pre-exec dual 放行）*
