# Harness — **C-WORD-NEG · UC-018 follow-up 词面负例（覆盖状态解析器词面边界 NEG）起草任务书**（Line CWN · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · NEG 臂设计起草卷 · rev r2 · 起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-10-26 起草落卷 · rev r1 回炉修订 2026-10-30（双席 FAIL 同判·修订清单九件全采纳·§0.0.2）· **rev r2 回炉修订 2026-10-30**（r2 双席 FAIL 互盲同判·两席清单合并去重全采纳·窗形裁决＝后向邻接·§0.0.3）· docs-only 起草卷·本步零码面零 NEG 臂零收据件·后继 EXEC 待协调方派单 + fresh pre-exec dual 放行·alone≠dual·Ban self-approve）。
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null`（十值零翻转·本刀全卷不改）。
**Date**: 2026-10-30
**Base / tip**: 起草时点 `origin/main` **`af273901a`** / full `af273901a165c910fe16cfef675d122812d3e779`（#181 isob 合卷已落）；**r2 现场漂移如实采（2026-10-30 r2 亲跑·`git fetch origin` EXIT=0）**：`origin/main` 届值 **`44f624253`**（#177 uc50 二轮并线已落·cap 届值 `MAX_FILES=2_452` 亲证）——**`af273901a` 已非 origin/main 届值**，本卷不重定基线、不 rebase、不追并线（EXEC 立项日按当时届值重导·§4）；worktree `meetwise-cwn` · branch `line/cwn-draft` · ⛔动主仓 · ⛔push。
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

## 0.0.1 防重双对表 + 在飞交叠登记（r2 turn 实测）

- `git worktree list` 本 turn **47 树**——`meetwise-cwn` 恰 1 命中＝本席；`git ls-files ai-docs/delivery/harness/ | grep cwn` **零命中** → 落卷后唯一同名卷＝本卷。
- **工作树独占申明**：本席只认领 `meetwise-cwn` 树（`line/cwn-draft`）；`meetwise-evap` / `meetwise-r5mr` 等他席树**只读不写**。**EXEC 立项日必做**：`git status --porcelain` **清场核** + `git rev-parse origin/main` 届值亲点（本 Header Base/tip 节）。
- **untracked 件定性（r2 更正·非「环境遗留物」）**：`ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-covered-lift-evidence.json` 系 **gate run artifact（lift 每次跑必重现）**——`scripts/uc-e2e-018-covered-lift.proof.mjs:218` `evidencePath` + `:220` `writeFileSync` 每次执行无条件重写（内容含 `datePT` 动态字段 → 逐跑不同）。r2 实测：两次 lift 亲跑产出 hash **`34521e42…`** → **`9e541f5e…`**（同件重写·非本刀产物）。**处置三分（钉死）**：①**临时移出校验**（为过 porcelain 门）须**逐字节还原**并给 hash 核验——r2 两轮实测 `H0=H1=9e541f5e2d4e165df661031a49e7e40f5ab2c452290f943cdfb50515caac922a`（criterion/reassess/docs:check 三轮移出→还原均一致）；②**凑绿永久删改**（删件/改件/改 `.gitignore` 掩盖/抬 cap 吃红）**在 Ban 内**；③该件归属与最终处置归协调方，本刀零处置。**受管计面后果**：该件在场时 docs:check 现扫 2449>cap 2448 红（§6）。
- **同 tip 并行席（evap·rev r2 复核）**：`line/evap-draft` **r2 亲读 @`34e06b070`**（较 r1 登记的 `de71ca40d` 又推进一件：`docs(test): 更正评测解析任务书夹具与邻面基线`）——名形近姊妹刀 `GAP-EVAL-PARSER-DETAILS-UNCLOSED`（EVAL-PARSER）域，本席**已越树亲读其卷**（`git show line/evap-draft:ai-docs/delivery/harness/evap-REQUEST.md`）：其 §0 对同批四 prove 的届值/三类先在红承登（38 archive + 1 drift + `:584` 崩溃 + 零断言输出 + 21 FAIL 分解）与本卷 r2 **互证一致**；其 r2 亦采「EXIT=1 且 FAIL 集合逐字恒等」邻面门口径（§0.0.4）——两刀**环境先在红分口同判**、`CAP-SANCTION-2448` 同号并留（§4）。**EXEC 立项日必做**：`git diff --name-only <届时 origin/main>..line/evap-draft` 逐文件复核，任一触面撞本刀面（§1.1 七 site 解析器文件 + 本卷）即触「现场漂移」停手上报。
- **同 tip 并行席（r5mr）**：`line/r5mr-draft` @`ebce6ff56`（cap `CAP-SANCTION-2448` 同号承登线之一·§4）——工作树 `meetwise-r5mr`；r2 复核 `git merge-base --is-ancestor 0e42adb21 origin/main` **EXIT=0** 亲证（收官 commit 已并入 main），故本刀与其**已无并线竞争**，但**同号 2448 出处分立须双留**（§4）。触面复核口径同上。
- **陈旧长线**：`line/ag18-draft`（ahead 2588/behind 3305）· `line/cap-2272`（ahead 2590/behind 3305）· `line/campaign-state`（ahead 2593/behind 324）对解析器面有历史 commit，但三支全远滞非活跃竞争面（沿 pay-neg §0.0.1 长线陈旧支判例）。
- **零重叠正申明**：本刀不认领任何 `NHP-018-*` 行（产品 NEG/FAULT/BOUND/ADV/PERF/LOAD 面各有其证·§1.4）、不改双矩阵格值、不改 backlog/gap 登记行状态、不代偿姊妹 DETAILS 刀。

## 0.0.2 rev r1 回炉（2026-10-30 · 双席 FAIL 同判 · 九件全采纳 · 卷内落点索引）

- **入卷因由**：pre-exec dual r1 **两席均 FAIL**，且**互盲同判**——①P1 基线假绿（ARM-4「四 prove 全 EXIT=0」与实测/矩阵 `:306` known-RED 直接矛盾）②P1 否定词表缺口（`banNear` `:103` 无 `no`/`non-`/`非`，`no gap` 修后仍返 gap）③P1 ARM-2 归法二义（hit 级 skip vs cell 级 fail-closed 未钉死）。裁决：**两席修订清单合并去重九件全采纳**，卷内逐条落点如下。
- **修订索引**：①[P1] ARM-4 重定界 → §2 ARM-4 + §1.4 + §6；②[P1] 否定词表裁定项 → §2「否定词表预登」；③[P1] ARM-2 归法钉死 → §2「归法」+ ARM-2 行；④[P2] ARM-1/ARM-3 改标 + 真红拉低形 + `#4` 注入 → §2 表；⑤[P2] 窗形钉全 + partially/fence 登记 + `:752`/`:764` 兜底交互 → §1.1-3 + §2 断言补注；⑥[P2] cap 三线同号 + 漂移 + EXEC 并线预期 + dual-keep 义务 → §4（+ Header Base/tip）；⑦[P2] 并行席表补 r5mr + 清场核 → §0.0.1；⑧[P3] 卷头 Date + gatherer `cellStatus` 可测性登记 → Header + §2 可测性项；⑨ rev r1 小节 → 本 §0.0.2。
- **STOP 维持**：卷内三处（标题 · Status · 卷尾注）仍 `draft:awaiting_pre_exec_dual`——r1 只改卷面事实与设计钉，**不放行 EXEC**；再放行须 fresh dual。
- **零证据面翻转**：Pins 十值零翻转；`apps/*/src`/`packages/*/src` 零 diff；本 rev 只改本卷 `.md` 一件（§9）。

## 0.0.3 rev r2 回炉（2026-10-30 · r2 双席 FAIL 互盲同判 · 两席清单合并全采纳 · 卷内落点索引）

- **入卷因由**：r2 pre-exec dual **两席均 FAIL**，互盲同判三条 P1——①否定词表**未钉死**（「扩展/收窄」二择一活口 + 与「钉死一支」自相矛盾）；②hit 级 skip 取 **前 48/后 16 对称窗**与 ARM-2/3 期望自相矛盾——按该窗形实测 `**case-only**（not partial）`→`unknown`、`still **gap**（not partial）`→`unknown`、`still **partial**（not gap）`→`unknown`，**三臂全 MISMATCH**；③ARM-4「真矩阵逐列解析值恒等」**不可满足**——裸 `未` 对「未进/未齐」、裸 `非` 对「非空」误触发，实矩阵行 `:125`/`:182`/`:190` 解析值变化（r2 复算更正：r1 窗形变化面实为 gatherer 17 行、legacy018 9 行、conservative 8 行，三行均在其内）。
- **协调方裁决（两席独立验证同判）**：**采后向邻接判定形**——否定词元紧邻 hit 之前才弃 hit，**永不检查 hit 后缀**、**不做 48 字回看**；该形下 ARM-2/3 三臂全绿、全矩阵零变化（§2 模拟表）。r1「前 48/后 16」窗形**作废**，本卷不再保留为备选。
- **修订索引（9 件·去重合并）**：①[P1] 否定词表钉死唯一形（删「收窄备选」活口 + 删 ARM-1 条件句 + status 臂独立表 + 裸 `未` 收窄登记）→ §2「词元表钉死」；②[P1] 窗形改后向邻接（删 48/16 + ARM-2/3 三臂期望表作验收锚 + 全臂模拟表作 EXEC 前门）→ §2「判准形」+ §2 模拟表；③[P1] ARM-4 拆 4a/4b（FAIL 文字集恒等 / 被断言格解析值恒等 + 门序钉死）→ §2 ARM-4a/4b；④[P1 补] 解析器清单补三 site（reassess `:177-182` cell102 · `:172-175` nhpPerf/nhpLoad · lift `:132` advIsBlind）+ 单列 pin 断言 site 零触名单 → §1.1；⑤[P2] 单一 helper 落位 + per-cell 切格 + `no covered` 入守卫臂 + min 措辞 → §2；⑥[P2] 宿主钉 cite（删二择一·criterion 只登记不承载·可测性取①）→ §2「交付面」；⑦[P2] untracked 件定性改 gate run artifact + 还原 hash 义务 → §0.0.1 + §6；⑧[P2] diff 命令改 `git show --numstat` + evap 标 rev r2 + `pnpm lint` 改 N/A → §6 + §0.0.1；⑨ 本小节。
- **STOP 维持**：卷内三处仍 `draft:awaiting_pre_exec_dual`——r2 只改卷面事实与设计钉，**不放行 EXEC**；再放行须 fresh dual（r1/r2 均未放行）。
- **零证据面翻转**：Pins 十值零翻转；`apps/*/src`/`packages/*/src` 零 diff；本 rev 只改本卷 `.md` 一件（§9）。

## 1. 产品面侦察（只读取证 · file:line 全引 · blob 对 tip `af273901a` 亲算）

### 1.0 blob 锚表

| 文件 | blob（行数） | 本刀关联锚 |
|---|---|---|
| `scripts/eval-harness-matrix-cite.proof.mjs` | `36cefcba`（824） | `:418-426` STATUS_RANK · `:429-437` legacy018 · `:452-473` conservative · `:475-492` parseSection101Facets · `:594-624` 自测 |
| `scripts/lib/uc-covered-real-gatherer.mjs` | `3971e436`（807） | `:70-77` cellStatus · `:79-88` parseNhpRow · `:93-108` gapClosedInText 否定窗先例（`:103` banNear）· `:448` assertCleanPorcelain（export）· `:519` gatherRealUc018 · `:539-543`/`:618`/`:752`/`:772` 消费点 |
| `scripts/lib/uc-covered-evaluator.mjs` | `ec62c4c2`（340） | `:118` status 直等比较（不吃词面正则）· `:30-31` STATUS_NOT_COVERED |
| `scripts/uc-e2e-018-covered-lift-reassess.proof.mjs` | `5f67d2ac`（527） | `:107-114` cellStatus 同形 · `:172-175` nhpPerf/nhpLoad 判定 · `:177-182` cell102 |
| `scripts/uc-e2e-018-covered-lift.proof.mjs` | `afd6b928`（380） | `:132` advIsBlind · `:139` `advIsPartial` · `:218`/`:220` evidence artifact 写出 |
| `ai-docs/delivery/gap-bug-backlog.md` | `33ba0d86`（959） | `:37` C-WORD-NEG P2 行 · `:36` 姊妹行 |
| `ai-docs/delivery/e2e-covered-path-backlog.md` | `05a76401`（55） | `:44` 执行序尾 follow-ups 提点 |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `1a1844eb`（522） | `:123` §1.0.1 行 · `:183` §1.1 行 · `:270` P0-8 · `:306` known-RED 承登 · `:312` live-prove 表 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `64988114`（218） | `:78-83` NHP-018 六行 |
| `ai-docs/delivery/harness/uc-e2e-018-receipt-backfill.md` | `d02fc169`（101） | `:61` register-only |
| `scripts/ai-docs/public-text-policy.mjs` | （本刀步进后 `:263` `MAX_FILES = 2_448`） | §4 cap |

### 1.1 C-WORD 词面语义源＝解析器族 **七 site**（逐件亲读 · 词面臂逐条 · r2 补三）

1. **`eval-harness-matrix-cite.proof.mjs:429-437` `cellStatusLegacy018`**（首hit 形）：`:431` blind 臂 `/\*\*blind\*\*|\bblind\b/i`（且无 `**partial**`/`**covered**` 粗体排除）· `:432` covered 粗体臂 · **`:433` partial 臂 `/\*\*partial\*\*|\bpartial\b/i` ← 残余本体**（`\bpartial\b` 词面臂无否定判定）· `:434` gap 臂 `\bgap\b` 同形 · `:435` `not_run|case-only|blocked` 臂。审注「same shape as legacy018 L433」即此行。
2. **`eval-harness-matrix-cite.proof.mjs:452-473` `cellStatusConservative`**（min-rank 形）：`:456` `stillRe` still-残留收集 · `:462-465` 词面臂循环 `\\b<name>\\b`（covered/partial/honesty-pin/case-only/gap/blind 六词·**同样无否定判定**）→ `:470-472` minStatus 取最弱。负例形：输入 `not partial` → found=`['partial']` → 返 `'partial'`（无更低 rank 可兜）。
3. **`uc-covered-real-gatherer.mjs:70-77` `cellStatus`**（真矩阵 gatherer · 首hit 形·**最锐暴露面**）：`:72` covered 粗体臂 → **`:73` partial 臂 `/\*\*partial\*\*|\bpartial\b/i`** → `:74` `case-only` 臂 → `:75` blind 臂 → `:76` gap 臂。负例形：`**case-only**（not partial）` → partial 词面臂先于 case-only 臂首hit → **返 `'partial'`（case-only 在场仍被抢占）**。消费点：`:539-543`（NHP 行族）· `:752`（§1.1 statusCell 兜底）· `:772`（§1.0 BOUND 格）——真矩阵格值直读面。
4. **`uc-covered-real-gatherer.mjs:79-88` `parseNhpRow`**：partial 用粗体-only 臂（`:82`），non-bold 「not partial」落末行返 unknown——粗体否定形 `not **partial**` 可误hit（词形面同族，登记入臂面）。**r2 补**：该函数现扫整行（自 ID 至行尾），落地须**先按未转义竖线切格只取 status 格**（§2 per-cell 钉）。
5. **`uc-e2e-018-covered-lift-reassess.proof.mjs:107-114` `cellStatus`**（legacy 首hit 同形·`:111` partial 臂）——同源同病，独立复制件（非 import）。
6. **`uc-e2e-018-covered-lift.proof.mjs:125-139` `advBlind`/`advIsBlind`/`advIsPartial`**（r2 补 `:132`）：`:132` `advIsBlind = /\*\*blind\*\*/.test(advCell) || advCell === 'blind'` · `:139` `advIsPartial = /\*\*partial\*\*/.test(advCell) || /\bpartial\b/.test(advCell)`（裸 `\bpartial\b`·同族）· `:125` advBlind 跨行正则。
7. **`uc-e2e-018-covered-lift-reassess.proof.mjs:172-182`（r2 补）**：`:172-175` `nhpPerfPartial`/`nhpLoadPartial`/`nhpPerfCaseOnly`/`nhpLoadCaseOnly`（`NHP-018-PERF-01[\s\S]{0,400}?\|\s*\*\*partial\*\*` 跨 400 字跨格判定·**词面 hit 无否定判定**）· `:177-182` `cell102`（`**partial**`/`case-only`/`blind` 三臂）。

**（note a）evaluator 本体 `uc-covered-evaluator.mjs:118`** 吃的是已解析 status 字符串直等比较——**词面风险不在 evaluator 层**，在 gatherer/cite 解析层（空窗定界＝本条，Ban 把修法错落 evaluator）。

**（note b）仓内否定感知先例（修向模板·但 status 臂不复用其词表）**：`uc-covered-real-gatherer.mjs:93-108` `gapClosedInText`——CLOSED/已关 匹配配 **banNear 否定窗**（`:103` 词表逐字：`不得|禁止|\bBan\b|不可|未|不得写已关|\bnot\b|not\s+closed|≠\s*closed`）逐 hit 回看 **前 48 字 / 后 16 字**窗（`:108` `m.index - 48` · `:109` `+ 16` 亲证），窗内否定词即弃该 hit。该窗形服务的是**成对词**（CLOSED/已关 与否定词可相隔成句）语义，**与 status 词的紧邻否定语义不同**——r2 裁决 status 臂另立邻接表且**不复用 banNear**（§2）。

**（note c）`:752`/`:764` unknown→partial 兜底交互**：真矩阵 §1.1 statusCell 消费点 `:752` `cellStatus(row11?.[2] || row11?.[1] || 'partial')`（缺格时以字面 `'partial'` 兜底），返回 `'unknown'` 时又在 `:764` `status: s11Status === 'unknown' ? 'partial' : s11Status` 二次兜底为 `partial`。**后果**：否定感知修法若取「hit 级 skip → 全臂耗尽返 unknown」，§1.1 面**仍会由 :764 归为 partial**——故：①ARM 断言不得写「§1.1 由 partial 翻 unknown」；②§1.1 的否定形只能断言「不经 :752 的 `cellStatus` 直调结果」；③此交互属**登记**，改不改兜底链归协调方（本刀零触 :752/:764 代码）。

**（note d）pin 断言 site 零触名单（r2 单列·非状态解析）**：以下 `\bpartial\b` 命中系**文档 pin 断言**（对 harness/eval/backlog 文本做词面在场断言），**不是状态解析**；**仓级 `\bpartial\b` 替换/统一改写会打断 pin 门**（把断言词一起改掉）——EXEC 修法须逐 site 定向改解析函数，**Ban 全仓 find-replace**：
- `uc-e2e-018-sole-stack-pg-retained.proof.mjs:144` / `:181` / `:239`
- `uc-e2e-018-covered-lift.proof.mjs:265` / `:344` / `:357`
- `uc-e2e-018-covered-lift-reassess.proof.mjs:396` / `:474` / `:491`
- `eval-harness-matrix-cite.proof.mjs:35` / `:322`（assertPins 文档 pin 块区，跨 `:35–:322`）

### 1.2 活词面实证（等形探针 · node 亲跑 · 字面量与源逐字同源 · stdout 即弃）

`node -e` 对 `:433`/`:73` 字面量等形复算：`legacy018 形('not partial')` = **`'partial'`** · `gatherer 形('**case-only**（not partial）')` = **`'partial'`**（case-only 在场仍被抢占·最锐形）· `gatherer 形('not partial')` = **`'partial'`** · `legacy018 形('≠ covered')` = `'unknown'`（`≠` 词形不在任何臂·对照）。即：残余**现行即红**（对含否定词形的输入），唯「live matrix vocabulary unused」（审注 `:250` 亲读）——真矩阵现存格无否定词形，故未实际误判；**审查文档词形已在卷**（`REQUEST-2026-09-23-uc-e2e-018-adv-mw-rag-route.md:112`「§1.0 ADV **case-only**（not partial）」逐字亲读），该词形一旦入矩阵格即现行误判。**r2 补**：补测 `no gap`→`gap` · `non-partial`→`partial` · `非 partial`→`partial` · `not blind`→`blind` · `not covered`→`unknown`（covered 仅粗体臂·出生即绿）——缺口四形全部现红（§2 表）。

### 1.3 矩阵 UC-018 行 fresh 亲点（C-WORD 批注现状）

- `e2e-requirement-coverage-matrix.md:123`（§1.0.1）：`| UC-E2E-018 | **partial** | **case-only**（NHP-018-FAULT-01） | **partial**（CAS waiting_user · **NHP-018-BOUND-01**） | **partial** | …` 行尾 follow-ups 提点 `… · C-WORD-NEG · RECEIPT-BACKFILL nailed …`——NEG/FAULT/BOUND/ADV 四格值与 C-WORD 提点**原样亲点在位**（blob `1a1844eb`）。
- `:183`（§1.1 UC-018 行）· `:270`（P0-8）· `:312`（live-prove 表）三处同提点亲点在位；UC-018 stays **partial** 全表一致。
- **本刀零格值触碰**：C-WORD 是矩阵解析器的残余，不是矩阵行的新格值——本刀与后继 EXEC 均 Ban 动 `:123`/`:183` 四格值与 stays partial 旗。

### 1.4 既有收据覆盖面（NEG/FAULT/BOUND 现状 + parser 测试面 → 未证空窗定位）

- **产品 NHP-018 面（case-matrix `:78-83` 亲读）**：NEG-01 **partial** · FAULT-01 **case-only**（D2）· BOUND-01 **partial** · ADV-01 **partial**（`post_prove_dual_pass`）· PERF-01/LOAD-01 **partial**——**产品负例面各有其证，与本刀零交**（本刀＝覆盖度量工具面的词面负例，e2e 域 P2）。
- **parser 现有测试面（空窗定位亲读）**：cite 自测 `:594-624`——still-残留 min 形断言在钉 · bare blind/partial · unparseable⇒unknown · UC-018 plain-cell conservative≡legacy 恒等——**无一条否定词面注入臂**；covered-criterion prove `:242-267` **gap 闭判定已有否定窗测试**——**同文件族内 status 词面臂无对应否定臂＝恰为本刀未证空窗**；mutation 423/423 不含否定词面变异位。
- **r2 补测·四 prove 届值（2026-10-30 r2 亲跑·环境先在红）**：`eval-harness-matrix-cite:prove` **EXIT=1 · 39 FAIL**（15 eval-missing + 1 harness-missing + 20 missing-pin + 2 dependent + 1 drift）／`uc018:covered-criterion:prove` **EXIT=1 · 崩 `:584:7` cpSync ENOENT · 零断言输出（0 PASS/0 FAIL）**（树脏时先崩 `DIRTY_TREE` @gatherer `:522`）／`uc018:covered-lift:prove` **EXIT=1 · 15 FAIL**（并重写 untracked evidence artifact）／`uc018:covered-lift-reassess:prove` **EXIT=1 · 21 FAIL**（树脏时 `DIRTY_TREE` 拒跑·零断言）。
- **r2 补测·host 层可承载性（决定 NEG 臂宿主）**：criterion 的断言走 `lines.push` 缓冲、崩于 `:584` 前不 flush → **0 PASS/0 FAIL**（零断言输出）——该宿主**不能承载**任何 NEG 臂断言（崩前零可见）；cite 无 `:584` 类崩点且断言即时输出 → **cite 为唯一可承载宿主**（§2 交付面）。

### 1.5 登记原文三处（逐字亲读）

- gap-bug-backlog `:37`：`| C-WORD-NEG | P2 | \bpartial\b 误匹配 「not partial」 | word-boundary / negation-aware status parse | e2e | follow-up | covered-criterion review residual |`
- harness/uc-e2e-018-receipt-backfill `:61`：`- **C-WORD-NEG**: \bpartial\b matches 「not partial」— register only; fix may be later`
- 残余出处 review `:250`/`:260`（`receipts/archive/2026-09-batch23/reviews/…uc-e2e-052-checkpoint-physical-mw-e2e-ha.md`·append-only 引证零触）。

## 2. NEG 臂设计（rev r2 钉死 · 后继 EXEC 拟面 · 本卷零码动）

**修向（登记目标列逐字）**：word-boundary / negation-aware status parse——给 status 词面 hit 加否定判定；**修法落 gatherer/cite 解析层七个 site（§1.1），Ban 落 evaluator**。注入→断言**拒收**（具名形：拒归 `partial`/`covered` 等被否定 status）。

### 2.1 判准形（r2 裁决·两席独立验证·形名「后向邻接」）

- **判定**：否定词元**紧邻 status hit 之前**（中间只允许空白/标点/星号/下划线/波浪/破折号/冒号/中英文括号/方括号/花括号/竖线/逗号顿号分号）→ **弃该 hit**；**永不检查 hit 后缀**；**不做 48 字回看**（r1 的「前 48/后 16」对称窗**作废**，本卷不留备选）。
- **matcher 逐字（单一 helper·gatherer export）**：

```js
// scripts/lib/uc-covered-real-gatherer.mjs —— 新增 export（唯一判定入口）
const NEG_STATUS = /(?:\bnot\b|\bno\b|\bnon-?|非)[\s*_~\-–—:：()（）\[\]{}|,，、；;]*$/i;
export function isNegatedHit(text, matchIndex, matchLen) {
  // matchLen 仅为调用点对称性保留（§1.1 七 site 统一签名）；
  // 实现**不得**使用 matchLen 检查 hit 后缀 —— r2 钉死。
  return NEG_STATUS.test(text.slice(0, matchIndex));
}
```

- **词元表钉死（status 臂独立表·不复用 banNear）**，逐项：
  - `\bnot\b` · `\bno\b` · `\bnon-?\b` · `非`（**仅邻接形**：`非` 与 hit 之间只能隔分隔符；等价旧建议式 `非\s*(?=status)`，但统一由本 matcher 的 `非` 分支承担）。
  - **`未` 不入表**：r2 实测裸 `未` 对「未进/未齐」误触发（`未进 e2e:isolated；**gap**` → 48/16 窗下 unknown；`七类未齐；**partial**` → unknown）——**扩展前先收窄**，裸 `未` 留待专刀；`不得`/`禁止`/`Ban`/`不可` 同不入 status 表（仅 `gapClosedInText` 的 banNear 保留）。
  - **裸 `非` 禁全文匹配**：只许本 matcher 邻接分支；`非常 **partial**` / `非空 **gap**` 不误抑（r2 实测邻接形 base≡adj）。
  - **为何不复用 banNear**：banNear 服务 `gapClosedInText` 的**成对词窗**语义（CLOSED/已关 与否定词可相隔 ≤48/16 字仍算成对），与 status 词的**紧邻否定**语义不同；共享会把闭包判定拖进 status 域（同一 `no` 在两域含义不同），且会连带把 `未`/`≠ closed` 等闭包专用词元带入 status 臂。**两表独立维护**：改 status 表不动 banNear，反之亦然。
  - **单一 helper 落位**：`isNegatedHit` 落 `uc-covered-real-gatherer.mjs` 并 export；§1.1 七 site 全共用（cite legacy018/conservative 与 reassess/lift 各件从 gatherer import——gatherer 为纯模块、顶层零副作用，已有 `assertCleanPorcelain` import 先例）。**修法即测法**：同一 helper 既实现又作为断言对象，杜绝两处实现漂移。
- **per-cell 落地（`parseNhpRow`·r2 钉死）**：
  - **先按未转义竖线切格**（实现＝negative lookbehind：反斜线 + 竖线 不切），**status 格＝整行第 8 列**（`| id | UC | facet | owner | injection | expectation | status | notes |`；0-based split index 7），**只对该格取否定窗**；列数不足 → fail-closed `unknown`（登记）。
  - **实证必要性**：`NHP-018-BOUND-01` 注入格含 `` `created\|active\|waiting_user` ``（转义竖线）；裸 `split('|')` 会把 status 格错位到 expectation 列 → 解析值 `partial`→`unknown`（r2 实测），**直接破 ARM-4b**。故切格必须忽略 `\|`，否则 per-cell 落地自身制造回归。
- **归法**：**hit 级 skip**——对每个词面臂的每个 hit 用 `isNegatedHit` 判定，命中否定则**弃该 hit、续查同一臂的后续 hit，臂尽续后续臂**；**全臂耗尽仍无正向 hit 才返 `unknown`**。conservative 侧同法：否定 hit 不入 `found`，**按剩余 `found` 重算 min、结果可能不变**（不短路、不额外抬 rank）。**Ban cell 级 fail-closed**——整格直判 `unknown` 与 ARM-2 期望直接矛盾，禁用。
- **可测性（r2 钉死·不再二择一）**：取 **①直 import**——gatherer 增 export `cellStatus` / `parseNhpRow` / `isNegatedHit`，cite prove 直调断言。**②公共入口不可用**：`gatherRealUc018` 的 `:752`/`:764` 会把 `unknown` 兜成 `partial`，ARM-2 期望的 `unknown` 在公共入口**不可观测**。
- **窗形与免疫面**：①**窗形＝后向邻接**（r2 改钉）；②**作用域＝per-cell**（每格/每行独立·跨格不借窗、不累计、不跨行）；③**`partially` 已免疫＝伪问题（词边界）**：`\bpartial\b` 不匹配 `partially`——**登记为已免疫·不设注入臂**；④**fence/引文窗边界＝不承诺形**：代码围栏/行内引文/HTML 注释内的否定词是否入窗本卷**不承诺**；EXEC 断言只对 plain cell 文本成立，**Ban 把 fence 内形态写成已闭**。

### 2.2 验收锚（ARM-2/3 三臂·邻接形下期望值·r2 模拟亲证全绿）

| 臂 | 注入 | 邻接形期望 | 基线现值 | r2 模拟 | r1 48/16 形 | r1 判定 |
|---|---|---|---|---|---|---|
| ARM-2（最锐） | `**case-only**（not partial）` | `case-only` | `partial` | `partial`→`case-only` | `unknown` | **MISMATCH**（hit 后 16 窗把 `not` 计入→连 case-only 臂一起弃） |
| ARM-3 守卫 | `still **gap**（not partial）` | `gap` | `gap` | `gap`→`gap` | `unknown` | **MISMATCH**（still 命中后窗含 `（not`→弃 still→全臂尽） |
| ARM-3 真红拉低 | `still **partial**（not gap）` | `partial` | `gap` | `gap`→`partial` | `unknown` | **MISMATCH**（partial 命中后窗含 `not`→弃→found 空） |

### 2.3 全臂模拟表（拟议 matcher 对全部臂 · r2 实测 · **EXEC 前门**）

> 复算口径：字面量与源逐字同源；脚本落 `/tmp`（不入库·stdout 即弃）；EXEC 立项日须以同一表复跑对钉（表不符即停手）。

| 臂 | 注入词面 | 基线 | 邻接形 | r1 48/16 形 | 对码 | 标注 |
|---|---|---|---|---|---|---|
| ARM-1 | `not partial` | `partial` | `unknown` | `unknown` | `:433` | 真红 |
| ARM-1 | `not blind` | `blind` | `unknown` | `unknown` | `:431` | 真红 |
| ARM-1 | `no gap` | `gap` | `unknown` | `unknown` | `:434` | 真红 |
| ARM-1 | `non-partial` | `partial` | `unknown` | `unknown` | `:433` | 真红 |
| ARM-1 | `非 partial` | `partial` | `unknown` | `unknown` | `:433` | 真红 |
| ARM-1 守卫 | `not covered` | `unknown` | `unknown` | `unknown` | `:432` | 守卫臂·出生即绿·不计红→绿 |
| ARM-1 守卫 | `no covered` | `unknown` | `unknown` | `unknown` | `:432` | 守卫臂（r2 移入·出生即绿） |
| ARM-2 | `**case-only**（not partial）` | `partial` | `case-only` | `unknown` | `:73` | 真红·最锐 |
| ARM-2 | `not partial` | `partial` | `unknown` | `unknown` | `:73` | 真红 |
| ARM-3 | `not partial` | `partial` | `unknown` | `unknown` | `:462-465` | 真红 |
| ARM-3 守卫 | `still **gap**（not partial）` | `gap` | `gap` | `unknown` | `:456`/`:462-465`/`:470-472` | 守卫臂（出生即绿） |
| ARM-3 拉低 | `still **partial**（not gap）` | `gap` | `partial` | `unknown` | 同上 | 真红（拉低形） |
| `#4` | `not **partial**` | `partial` | `unknown` | `unknown` | `:82` | 真红（粗体否定） |

**真矩阵面（邻接形恒等性·r2 实测）**：

| 解析器 | 邻接形变化面 | r1 48/16 形变化面 |
|---|---|---|
| gatherer `cellStatus` | **0 格 / 0 行**（全 60 UC 行 × 312 非空格） | 24 格 / 17 行 |
| cite `cellStatusLegacy018` | **0 / 0** | 12 格 / 9 行 |
| cite `cellStatusConservative` | **0 / 0** | 9 格 / 8 行（含 `:182`、`:190`） |
| `parseNhpRow`（NHP-018 六行） | **0**（whole-row 与 status-cell 同值） | `NHP-018-LOAD-01` partial→unknown |
| reassess `nhpPerfPartial`/`nhpLoadPartial` | **0**（true→true） | true→false |
| lift `advIsBlind`/`advIsPartial` | **0** | **0**（ADV 格 `**partial**` hit 在格首·前 48 无否定词元·r2 亲核） |

**r1 窗形反证（为何「逐列恒等」不可满足）**：r1 窗形下变化面**不止两席列举的 `:125`/`:182`/`:190` 三行**——r2 复算 gatherer 17 行/24 格、legacy018 9 行/12 格、conservative 8 行/9 格（三行均在其内），且 `NHP-018-LOAD-01` 与 PERF/LOAD 判定同期翻转；**根因**＝48 字回看把叙事文本里的 `未`/`not`/`NO` 等计入（`未改 proof`、`未进`、`七类未齐`、`≠ covered` 旁证），**窗形与「紧邻否定」语义不匹配**。结论方向与两席同判一致（r1 形不可满足恒等），**仅量级更正**（三行为子集，非全集）——r2 已按裁决改钉邻接形。

### 2.4 ARM-4（r2 拆两条·基线假绿已撤）

**ARM-4a｜四 prove FAIL 文字集恒等**（修正法前后同件同集·零新增零消失）。**口径**：绝对路径前缀 `<worktree>/` 归一化后逐字比对（EXEC 树路径不同不影响集合恒等）；`EXIT=1` 为现值锚，但**只在 FAIL 集合逐字恒等时**才算恒等通过。

- **cite**：**EXIT=1 · 39 FAIL** = 15 `eval missing` + 1 `harness missing` + 20 `missing pin` + 2 dependent + 1 drift。非-missing 三行逐字：
  - `FAIL  uc-e2e-018-user-abandon: must cite matrix row UC-E2E-018`
  - `FAIL  uc-e2e-018-user-abandon: documents expected EXIT=0`
  - `FAIL  live 050–052 NEG ⇒ honesty-pin (min residual) (got case-only want honesty-pin)`
  - 15 eval-missing 样例形：`FAIL  privacy-erasure-http-503-pin: eval missing ai-docs/delivery/eval/privacy-erasure-http-503-pin.eval.md`；20 pin 样例形：`FAIL  uc-e2e-018-user-abandon: missing pin — pins partial`。
- **criterion**：**EXIT=1 · 崩点 `scripts/uc-e2e-018-covered-criterion.proof.mjs:584:7` · `cpSync` · `errno: -2 · code: 'ENOENT' · syscall: 'lstat'` · ENOENT 路径逐字 `<worktree>/ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-sole-stack-pg-retained-evidence.json` · 零断言输出（0 PASS / 0 FAIL——断言缓冲未 flush）**。**树脏时另一先在形**：`throws DIRTY_TREE @ scripts/lib/uc-covered-real-gatherer.mjs:522`（r2 实测·零断言输出）。
- **lift**：**EXIT=1 · 15 FAIL**（逐字）：
  - `FAIL  parent missing: <worktree>/ai-docs/delivery/harness/uc-e2e-018-user-abandon.md`
  - `FAIL  knife missing: <worktree>/ai-docs/delivery/harness/uc-e2e-018-covered-lift.md`
  - `FAIL  slice missing: <worktree>/ai-docs/delivery/uc-e2e-018-covered-lift.slice.md`
  - `FAIL  evalDoc missing: <worktree>/ai-docs/delivery/eval/uc-e2e-018-user-abandon.eval.md`
  - `FAIL  missing file: <worktree>/ai-docs/delivery/harness/uc-e2e-018-user-abandon.md`
  - `FAIL  missing file: <worktree>/ai-docs/delivery/harness/uc-e2e-018-covered-lift.md`
  - `FAIL  missing file: <worktree>/ai-docs/delivery/uc-e2e-018-covered-lift.slice.md`
  - `FAIL  missing file: <worktree>/ai-docs/delivery/eval/uc-e2e-018-user-abandon.eval.md`
  - `FAIL  §1b #1 FULL-E2E must cite tip c36b032 + CLOSED (gap GAP-UC018-FULL-E2E)`
  - `FAIL  §1b #2 GRAPH must cite tip 08650ea + CLOSED (gap GAP-UC018-GRAPH)`
  - `FAIL  §1b #3 TTL must cite tip d698282 + CLOSED (gap GAP-UC018-TTL)`
  - `FAIL  §1b #4 waiting_user must be cited CLOSED`
  - `FAIL  §1b #5 UI must cite tip 1990b12 + CLOSED (gap GAP-UC018-UI)`
  - `FAIL  knife-harness: must record executed:awaiting_post_prove_dual or post_prove_dual_pass`
  - `FAIL  knife-slice: must record executed:awaiting_post_prove_dual or post_prove_dual_pass`
- **reassess**：**脏树拒跑（`DIRTY_TREE`·零断言）或 21 FAIL 集逐字**（清场后 r2 实测 21 FAIL，逐字）：
  - `FAIL  parent missing: <worktree>/ai-docs/delivery/harness/uc-e2e-018-user-abandon.md`
  - `FAIL  knife missing: <worktree>/ai-docs/delivery/harness/uc-e2e-018-covered-lift-reassess.md`
  - `FAIL  priorLift missing: <worktree>/ai-docs/delivery/harness/uc-e2e-018-covered-lift.md`
  - `FAIL  advHarness missing: <worktree>/ai-docs/delivery/harness/uc-e2e-018-adv.md`
  - `FAIL  slice missing: <worktree>/ai-docs/delivery/uc-e2e-018-covered-lift-reassess.slice.md`
  - `FAIL  evalDoc missing: <worktree>/ai-docs/delivery/eval/uc-e2e-018-user-abandon.eval.md`
  - `FAIL  missing file: <worktree>/ai-docs/delivery/harness/uc-e2e-018-user-abandon.md`
  - `FAIL  missing file: <worktree>/ai-docs/delivery/harness/uc-e2e-018-covered-lift-reassess.md`
  - `FAIL  missing file: <worktree>/ai-docs/delivery/harness/uc-e2e-018-covered-lift.md`
  - `FAIL  missing file: <worktree>/ai-docs/delivery/harness/uc-e2e-018-adv.md`
  - `FAIL  missing file: <worktree>/ai-docs/delivery/uc-e2e-018-covered-lift-reassess.slice.md`
  - `FAIL  missing file: <worktree>/ai-docs/delivery/eval/uc-e2e-018-user-abandon.eval.md`
  - `FAIL  §1b #1 FULL-E2E must cite tip c36b032 + CLOSED (gap GAP-UC018-FULL-E2E)`
  - `FAIL  §1b #2 GRAPH must cite tip 08650ea + CLOSED (gap GAP-UC018-GRAPH)`
  - `FAIL  §1b #3 TTL must cite tip d698282 + CLOSED (gap GAP-UC018-TTL)`
  - `FAIL  §1b #4 waiting_user must be cited CLOSED`
  - `FAIL  §1b #5 UI must cite tip 1990b12 + CLOSED (gap GAP-UC018-UI)`
  - `FAIL  knife-harness: must retain executed:awaiting_post_prove_dual or post_prove_dual_pass`
  - `FAIL  knife-slice: must retain executed:awaiting_post_prove_dual or post_prove_dual_pass`
  - `FAIL  adv harness must retain GAP-UC018-ADV`
  - `FAIL  prior covered-lift harness must retain non-flip pin`

**ARM-4b｜被断言格解析值恒等**（r2 **删**「全矩阵逐列恒等·live vocabulary unused」不可满足断言——r1 窗形下广义变化面已实测 ≥17 行，该断言与任何回看窗形互斥；邻接形虽实测全矩阵零变化，但**断言口径仍只锁被断言格**，不写全矩阵）。断言面＝**被断言格**：§1.0.1 UC-018 四格（`:123` NEG/FAULT/BOUND/ADV）· §1.1 UC-018 格（`:183` row11）· NHP-018 六行 `parseNhpRow` status · reassess PERF/LOAD 判定 · lift `advIsBlind`/`advIsPartial` · cite 自测既有输入（`:594-624` 零删改·additive restatement）· **`gapClosedInText` / `businessPathMet` / `openGaps` 真实输入恒等**（banNear 零触、helper 独立表 → 结构上 byte-identical，仍须断言亲证）。**r2 实测锚**：邻接形对 60 UC 行/312 非空格 × 3 parser 零变化；NHP-018 六行零变化；PERF/LOAD true→true；`advIsBlind` 零变化。

**ARM-4 门序钉死（r2·顺序本身即断言）**：
1. `git status --porcelain` **清场核**（未过即停手，不得带脏跑门）；
2. **reassess 先于 lift**（porcelain 门先跑；reassess 脏树会 `DIRTY_TREE` 拒跑）；
3. **lift 后清产物**（lift `:220` 必重写 untracked evidence artifact → 树变脏）：此后任何 porcelain 门须**临时移出该 artifact → 跑 → 逐字节还原 + hash 核验**（r2 两轮 `H0=H1=9e541f5e…`）；或把 lift 置为门序末位；
4. `DIRTY_TREE` **≠** 恒等通过——拒跑记作 `BLOCKED` 并停手上报，**不得**当作「无新增 FAIL」记绿；
5. 四 prove 的 FAIL 集合逐字比对后才可报 ARM-4a 恒等；被断言格逐格等值后才可报 ARM-4b 恒等。

**ARM-4 基线三类先在红承登（r2 不处置·沿 evap §0 分口）**：①**PTP-archive 迁移余波**（`e3502c0b6` git mv 后 proof 旧径读空——cite 38 FAIL + criterion `:584` 崩 + lift 15 + reassess 21 同因）；②**050–052 NEG case-only 漂移**（cite 唯一 1 drift FAIL·2026-10-27 开关刀 EXEC 副作用）；③**宿主/环境面**（criterion `cpSync` ENOENT 属宿主面先在崩溃；reassess/criterion 在本树 untracked artifact 在场时 `DIRTY_TREE` 拒跑属环境面）。**三类均系环境先在红·非本刀红**：本刀只承担「修法前后构成恒等」，**Ban 代偿**（不修 archive 路径、不修 050-052 断言、不删/移/改 `receipts/` 件以凑绿、不重建 `ai-docs/delivery/receipts/` 下缺失件）·**对齐与处置权归协调方**。**matrix `:306` 零触**：其 `EXIT 1（known RED）· FAIL=UC-018 facet[2]` 登记**构成已漂移**（facet[2] 现 PASS；红＝38 archive + 1 drift），本卷**只登记不改行**，**ARM-4 断言不得引该行为绿基线**（引之即假绿再现）。

### 2.5 ARM-5 负验证（恰红口径）

摘除否定判定（还原裸词面 + helper 变恒 false）→ **对期望矩阵逐格恰红**：ARM-1 五行真红、ARM-2 两行、ARM-3 两行、`#4` 一行 **逐格 FAIL 可见（不多不少）**；守卫臂（`not covered`/`no covered`/`still **gap**（not partial）`）**保持绿**（若转红＝误杀，同样 FAIL 上报）→ 原样还原复绿。假绿证伪＝否定臂有真实检出力（沿 pay-neg §9-EXEC 换序 FAIL 还原先例形）。

### 2.6 交付面（r2 钉死·宿主唯一）

- **NEG 臂 additive 进 `scripts/eval-harness-matrix-cite.proof.mjs`（唯一宿主）**——**删 r1 的「cite 与 covered-criterion 二择一或双落」**。理由：criterion 在 `:584` 崩前只 `lines.push` 缓冲、崩溃即丢（r2 实测 0 PASS/0 FAIL），**零断言输出不可承载任何 NEG 臂**；cite 无该类崩点、断言即时输出，且已 import/可 import gatherer（纯模块）。**criterion 只登记不承载**（其现状 39/15/21/崩 四值仅作 ARM-4a 恒等基线）。
- **修法触 `scripts/` 解析层七个 site（§1.1）**——`apps/*/src`/`packages/*/src` 产品码零 diff 意向（prove-only+tooling 刀）。七 site **逐一同步**（共用 `isNegatedHit`），**Ban 只修一处冒充全修**；同形复制件（§1.1-5/6/7）与主 site 同改，不设「豁免登记」活口。
- **可测性**＝①直 import（§2.1）：cite prove `import { cellStatus, parseNhpRow, isNegatedHit } from './lib/uc-covered-real-gatherer.mjs'` 直调断言；**fixture 落 tempdir** 形仅用于需要整文件输入的 site（沿 `covered-criterion.proof.mjs:575-600` 先例），**Ban 在真矩阵上原地改格驱动**。
- **零触面**：§1.1 note d 的 pin 断言 site **零触**（文档 pin 非状态解析）；`banNear`（`:103`）**零触**；`:752`/`:764` 兜底链**零触**。

**非目标**：姊妹 `GAP-EVAL-PARSER-DETAILS-UNCLOSED`（`<details>` 结构解析/诊断·P1 另刀）；NHP-018 产品行补证；双矩阵/backlog 行文与行状态（SSOT 翻面权归协调方）。

## 3. keyless 判定（停止条件核）

**触模型分类器＝否**。C-WORD 面全部为 markdown 字符串 regex 解析（`test()`/`exec()`）· node+git+fs；涉及 prove 四件均本地 node 脚本零 docker 零 MODEL_API_KEY 零外部服务（§1.1/§2 ARM-4 亲证）。**派单停止条件（模型分类器 keyless 不可达→红停）未触发**；est live=0（零 e2e / 零 docker / 零 live key / 零模型调用）。派单 gloss「追问链敏感词/禁词」与仓内登记（覆盖状态解析器词面残余）不符——按 SSOT 登记起草·分歧如实上报（§0）。

## 4. cap 预算核（CAP-SANCTION-2448 起草随刀恰等步进）

- **基线（本 worktree·r2 亲跑）**：`node scripts/ai-docs/check-docs.mjs` 清场核后 **EXIT=0 · scanned 2448** = `public-text-policy.mjs` `MAX_FILES = 2_448`（`:263`）**恰等零余量**；artifact 在场时 **EXIT=1 · `PTP_FILE_LIMIT:2449`**（2449 > 2448·§0.0.1/§6）。
- **随刀步进（常设预授权「越限沿常设预授权恰等步进预登」·沿 CAP-SANCTION-2442 isob 起草随刀单件恰等先例形）**：cap **2447→2448** —— 四联动点 = policy `:263` `MAX_FILES = 2_448`（+`:261-262` CAP-SANCTION-2448 双注记）+ proof `:442` `i < 2_448` / `:449` `scannedFiles, 2_448` / `:456` `f-2448.md` / `:459` `FILE_LIMIT:2449`（+`:440`/`:455` 链注记）· **+1 恰等零多放** · 计数预算非内容策略 · 越限臂 fabricated 数随 cap 联动同步 · 语义不变强度不减。
- **EXEC 期预计 +0 受管计面**（NEG 臂 additive 进 cite prove；若 pre-exec dual 裁定独立 prove 文件则届值如实采·收据 `.log` 非扫描扩展名不计）；**[P1] EXEC 立项并线届值如实采**（fetch EXIT=0 → origin/main 届值亲点·禁止按本预登 2448 行使若届值已推移·预登作废重导沿 isob §6 先例形）。
- **CAP-SANCTION-2448 三线同号**：①`line/r5mr-draft` 收官并线承 2448（`0e42adb21`·r2 实测 `git merge-base --is-ancestor` **EXIT=0**）；②`line/evap-draft` 起草承 2448；③本支 `line/cwn-draft` 起草承 2448。**三支出处分立、同号并留不冲突**；**dual-keep 双留注记义务**：并线时两 policy 脚本注记/cap 区冲突须**双留**（本支 2448 注记 + main 届值注记并留·**Ban 单向覆盖**），EXEC 收据须列出双留两行原文。
- **现场漂移（r2 实测·只登不改）**：`git fetch origin` **EXIT=0**，`origin/main` = **`44f624253`**（#177 uc50 二轮并线已落·cap `MAX_FILES=2_452` 亲证）。**EXEC 并线按 union 实测预计 CAP-SANCTION-2452+ 恰等步进**（届扫 <届时> + 并入互斥受管目并集；r2 下界估算＝2452 + 本卷 1 = **2453 至少**，evap 若同落再 +1 = 2454——**以合并树实测为准·允许多放则停手上报**）；**禁止**按本预登 2448 或估算值直接行使，届值如实采·预登作废重导。

## 5. 零重叠核 + est live

- **零重叠**：`harness/` 无既有 `cwn*` 件（`git ls-files` 零命中亲证·文件名唯一）；在飞 47 树逐名亲点（§0.0.1）；本刀零触 NHP-018 行、双矩阵格值、SSOT 行状态、姊妹 DETAILS 刀、`receipts/` append-only 史录、§1.1 note d 的 pin 断言 site。
- **est live=0**：零 e2e / 零 docker / 零 live key / 零模型调用；门＝三静态门（本地 node 脚本 + grep·§6）· docs:check / PTP 属静态门不计 prove。

## 6. 门矩阵（r2 亲跑原值 · 原值即报不修饰）

| 门 | 命令（树亲证） | r2 亲跑（2026-10-30） | 后继 EXEC |
|----|----------------|------------------------|-----------|
| docs:check | `node scripts/ai-docs/check-docs.mjs` | **树脏（gate artifact 在场）EXIT=1 · `public_text_policy:PTP_FILE_LIMIT:2449`**（scanned 2449 > cap 2448）；**清场核后 EXIT=0 · scanned 2448**（移出→跑→逐字节还原·hash 两轮一致 `9e541f5e…`） | 必跑（`git status --porcelain` 清场核先做；artifact 在场时如实承登红·Ban 凑绿） |
| PTP | `node scripts/ai-docs/public-text-policy.proof.mjs` | **EXIT=0**（12/12 · `static_preflight_valid: selected=12/12; releaseEvidence=false`） | 必跑 |
| markers | 全仓行首冲突标记 grep（`^<<<<<<< ` / `^=======$` / `^>>>>>>> `·md/mjs/json/ts/yml） | **零命中（hits=0）** | 必跑 |
| diff 面 | `git show --numstat HEAD` · `git show --numstat HEAD~1..HEAD`（r2 改：**不用** `git diff --numstat HEAD`——commit 后工作树已净，diff 恒空） | r2 恰 **1 tracked**（本卷 `harness/cwn-REQUEST.md` 纯编辑）；`HEAD~1..HEAD` 见 r1+r2 两 commit 面（各 1 文件·policy 双件零 diff） | 必检 |
| root lint | `pnpm lint` | **N/A**——本 worktree 无 `node_modules`（纯 node 脚本树·未装依赖），命令不可执行；理由如实登记，非「跳过」亦非「绿」 | N/A（同左） |
| prove 四件 | §2 ARM-4a 四命令 | cite **EXIT=1 · 39 FAIL** · criterion **EXIT=1 · 零断言输出 · 崩 `:584:7` cpSync ENOENT**（树脏先 `DIRTY_TREE` @ `:522`）· lift **EXIT=1 · 15 FAIL**（重写 evidence artifact）· reassess **EXIT=1 · 21 FAIL**（树脏 `DIRTY_TREE` 拒跑） | 必跑（修法后断言＝FAIL 文字集恒等 + ARM-4b 被断言格恒等·门序见 §2.4） |
| 环境供给 | — | est live=0 · 0 Key 值 · `actualSpendCny=null` · 零 docker/零模型 | 同左 |

**§6 口径申明（r2）**：本卷为**起草未实跑修法**之卷——四 prove **纯 node 可跑（keyless/零 docker）**，r2 已亲跑取届值并**如实承登全红 + 两类崩溃**（不是未跑、不是全绿）；**「四 prove 全 EXIT=0」为假绿基线，已删**。docs:check 红系 **gate run artifact**（lift 每次跑必重写·§0.0.1）受 `--others` 计面，非卷内新增受管件——**Ban 以删/改该件、改 `.gitignore` 掩盖或抬 cap 凑绿**；允许的唯一动作是**临时移出 + 逐字节还原（hash 核验）**。

## 7. 停止条件核（r2 如实登记）

1. **模型分类器不可达**：未触发（§3——纯 regex 解析 keyless 全可达）。
2. **语义源分歧**：派单 gloss 与 SSOT 登记不符——按登记起草·上报裁决（§0），非停止条件形态（有唯一可认领登记实体）。
3. **cap 越限**：起草时点已沿常设预授权恰等步进承登 CAP-SANCTION-2448（§4·三线同号）——非未授权越限；**EXEC 期按届时并线届值重导（预计 2452+·§4）**，届值已推移时 2448 预登作废、不得强行使。
4. **现场漂移（r2 实测·已漂·只登不改）**：起草 turn 零漂（§1.0 blob 表对 `af273901a` 亲算）；**r2 turn 漂移成立**——`origin/main` = `44f624253`（fetch EXIT=0 亲证），且本树 gate artifact 使 docs:check 现红（§6）。处置：**不 rebase、不追并线、不删件凑绿**——届值重导归 EXEC 立项日 + 协调方（沿 evap §0 分口）。
5. **修订与机制源冲突**：r2 未命中——邻接形与全部七 site 源码语义相容（模拟全臂 + 真矩阵零变化）；source 行号全部亲点未漂（`:433`/`:73`/`:103`/`:132`/`:139`/`:172-182`/`:584`）。
6. 其余（越限未授权/self-approve/push/动主仓）未命中。

## 8. Ban（逐条）

1. **Ban coding**：本 commit 零 scripts 产品面触碰（policy 双件属 cap 计数预算机制面非产品面）·后继 EXEC 亦 `apps/*/src`/`packages/*/src` 零 diff 意向（§2.6）。
2. **Ban SSOT edit**：gap-bug-backlog `:36-37` · e2e-covered-path-backlog `:44` · coverage-matrix `:123`/`:183`/`:306` 格值与 stays-partial 旗 · execution-master-checklist——本刀全卷零触碰；C-WORD 行翻面/关闭归协调方。
3. **Ban 认领 NHP-018-\* 行**：产品 NEG/FAULT/BOUND 面（§1.4）各有其证，Ban 互借收据、Ban 冒充产品负例已补。
4. **Ban 代偿姊妹刀**：`GAP-EVAL-PARSER-DETAILS-UNCLOSED` 零代偿零并卷；臂面互斥 Ban 互 wash。
5. **Ban 修法落 evaluator**：词面风险在 gatherer/cite 解析层（§1.1 note a）；Ban 只修一处冒充全修（七 site 逐一同步）。
6. **Ban 窗形回退**：EXEC **Ban** 恢复前 48/后 16 对称窗、**Ban** 检查 hit 后缀、**Ban** 48 字回看、**Ban** 把 `未`/`不得`/`禁止`/`Ban`/`不可` 加入 status 臂词表（§2.1 钉死）。
7. **Ban 仓级替换 `\bpartial\b`**：§1.1 note d 的 pin 断言 site（sole-stack `:144/:181/:239` · lift `:265/:344/:357` · reassess `:396/:474/:491` · cite `:35/:322`）系文档 pin，全仓 find-replace 会打断 pin 门。
8. **Ban 把 `DIRTY_TREE` 记作恒等通过**（§2.4 门序 4）；**Ban 永久删/改 gate artifact 或抬 cap 凑绿**（临时移出须逐字节还原 + hash 核验）。
9. **Ban prove / e2e / docker / push / force-push / self-approve / secrets / `.env*`**；三门有红即红停上报，Ban retry-to-green · Ban 选择性汇报。
10. **Ban 把本刀写成 UC-018 covered flip 前置或贡献**：EXIT0≠covered·coveredCount=8 不变·UC-018 stays partial·本刀 ≠ nail ≠ 残余关闭。
11. **Ban 触 `receipts/` 史录**（append-only·含 `:250`/`:260` 残余出处件与 adv review `:112` 词形实录件）。

## 9. 卷纪律

r2 rev diff 恰 **1 tracked**（本卷 `ai-docs/delivery/harness/cwn-REQUEST.md` 纯编辑·policy 双件零 diff·cap 不动）；commit 净消息 `docs(test): 更正覆盖解析任务书否定窗口与回归门`；⛔push；收据不入库（untracked·stdout 即弃）；实现方不 self-approve · alone≠dual · EXIT0≠covered · 登记≠修复≠定谳≠关闭 · **EXIT1≠本刀红**（三类环境先在红已分口）。

---

*Harness · C-WORD-NEG UC-018 follow-up 词面负例起草任务书 · rev r2 2026-10-30 · draft:awaiting_pre_exec_dual（卷尾注 · STOP 三处钉之三 · 与标题/Status 同值 · 起草/修订落卷即停 · 后继 EXEC 待协调方派单 + fresh pre-exec dual 放行）*
