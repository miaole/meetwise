# Harness — **C-WORD-NEG · UC-018 follow-up 词面负例（覆盖状态解析器词面边界 NEG）起草任务书**（Line CWN · docs REQUEST · **`closed`**（post 双审双 PASS 放行 · 2026-10-30 收官并线翻面 · 前值 `executed:awaiting_post_prove_dual` 史录不洗）· NEG 臂设计起草卷 · rev r8 + §9-EXEC + §10 收官登记 · 2026-10-30 收官并线）

**Status**: **`closed`**（**2026-10-30 收官并线席翻面**：post-prove dual **两席均 PASS** 放行并线；两席 P2×6 + P3 批合并去重**九件**已登记（§10·含 post-EXEC 重锚表）；前值 `executed:awaiting_post_prove_dual` 史录不洗（2026-10-30 EXEC 落卷翻面：EXEC 续做席沿半成品续做·11 函数主臂接线 + 17 臂恰红 + B0≡B1 + 三门亲跑·§9-EXEC 七字段在卷；原值 `draft:awaiting_pre_exec_dual` 史录不洗 · 2026-10-26 起草落卷 · rev r1 回炉修订 2026-10-30（双席 FAIL 同判·修订清单九件全采纳·§0.0.2）· rev r2 回炉修订 2026-10-30（r2 双席 FAIL 互盲同判·两席清单合并去重全采纳·窗形裁决＝后向邻接·§0.0.3）· **rev r3 回炉修订 2026-10-30**（r3 双席 FAIL 互盲同判：①span 正则 `m.index` 指向行 ID 致否定判定空转 ②验收面仅覆 4/11 函数·两席清单合并去重全采纳·锚点按 site 分形钉死·§0.0.4）· **rev r4 回炉修订 2026-10-30**（r4 双席 FAIL 互盲同判：①ARM-7a「基线 true」系假值——现行 span 形 `|` 后紧接 `**partial**`，合成行 status 格 `not **partial**` 不命中 ②site 10 `nhpLoadPartial` 无臂 ③第二通路 `not still X` 中 `still` 不在分隔符类、不在邻接语义内；两席清单合并去重全采纳·§0.0.5）· **rev r5 回炉修订 2026-10-30**（r5 席1 FAIL·**零 P0/P1**·仅 P2×2+P3×5 全采纳：锚点/描述与机制源逐字更正·§0.0.6）· **rev r6 终轮回炉 2026-10-30**（r6 双席 FAIL 互盲同判·协调方时间盒裁决**最后一轮**：site 3 `case-only` 锚点 `:73`→**`:74`** 修正 + 采席2 方案 (b) 子臂登记排除（不补臂）·两席清单合并全采纳·§0.0.7）· **rev r7 回炉修订 2026-10-30**（r7 双席 FAIL 互盲同判 P1×1·协调方裁决**采方案 A**：负验证步前移至「最终还原 H0」之前·三宿主 delta 4/10/3=17·§0.0.8）· **rev r8 终落卷席 2026-10-30**（r8 双席 FAIL 互盲同判·**协调方时间盒硬裁决：本轮按两席处方逐字落卷后即收敛、不再派双审、本轮后直接放行 EXEC**·席1 P1×1+席2 P1×2+P2×6+P3 批合并去重 11 件全采纳·§0.0.9）· docs-only 起草卷·本步零码面零 NEG 臂零收据件·后继 EXEC 待协调方派单 + fresh pre-exec dual 放行·alone≠dual·Ban self-approve）。
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null`（十值零翻转·本刀全卷不改）。
**Date**: 2026-10-30
**Base / tip**: 起草时点 `origin/main` **`af273901a`** / full `af273901a165c910fe16cfef675d122812d3e779`（#181 isob 合卷已落）；**r2 现场漂移如实采（2026-10-30 r2 亲跑·`git fetch origin` EXIT=0）**：`origin/main` 届值 **`44f624253`**（#177 uc50 二轮并线已落·cap 届值 `MAX_FILES=2_452` 亲证）——**`af273901a` 已非 origin/main 届值**，本卷不重定基线、不 rebase、不追并线（EXEC 立项日按当时届值重导·§4）；**r4 现场漂移如实采（2026-10-30 r4 亲跑·`git fetch origin` EXIT=0）**：`origin/main` 届值 **`3af835ad4`**（#183 uc2b 并线已落·cap 届值 `MAX_FILES=2_455` 亲证）——r2 的 `44f624253`/2452 亦已推移，**两代届值均只登不用**；worktree `meetwise-cwn` · branch `line/cwn-draft` · ⛔动主仓 · ⛔push。
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

## 0.0.1 防重双对表 + 在飞交叠登记（r2 turn 实测 · r3 补正计数）

- `git worktree list` 本 turn **16 树**（r4 实测 `git worktree list | wc -l` = 16·含主仓；较 r3 的 15 树**新增 `meetwise-uc3m`**（`line/uc3m-draft` @`dc6f733b6`）一处——r4 如实刷新；r2 稿「47 树」不确·r3 已更正）——`meetwise-cwn` 恰 1 命中＝本席；`git ls-files ai-docs/delivery/harness/ | grep cwn` **除本卷外零命中**（r3 更正口径：该 grep 在落卷后必命中本卷，r2 稿「零命中」系**落卷前基线**表述；防重正申明＝**除 `harness/cwn-REQUEST.md` 外无同名卷**，r3 亲跑 `git ls-files … | grep -v 'harness/cwn-REQUEST.md' | grep cwn` 零输出）。
- **工作树独占申明**：本席只认领 `meetwise-cwn` 树（`line/cwn-draft`）；`meetwise-evap` / `meetwise-r5mr` 等他席树**只读不写**。**EXEC 立项日必做**：`git status --porcelain` **清场核** + `git rev-parse origin/main` 届值亲点（本 Header Base/tip 节）。
- **untracked 件定性（r2 更正·非「环境遗留物」）**：`ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-covered-lift-evidence.json` 系 **gate run artifact（lift 每次跑必重现）**——`scripts/uc-e2e-018-covered-lift.proof.mjs:218` `evidencePath` + `:220` `writeFileSync` 每次执行无条件重写（内容含 `datePT` 动态字段 → 逐跑不同）。r2 实测：两次 lift 亲跑产出 hash **`34521e42…`** → **`9e541f5e…`**（同件重写·非本刀产物）。**处置三分（钉死）**：①**临时移出校验**（为过 porcelain 门）须**逐字节还原**并给 hash 核验——r2 两轮实测 `H0=H1=9e541f5e2d4e165df661031a49e7e40f5ab2c452290f943cdfb50515caac922a`（criterion/reassess/docs:check 三轮移出→还原均一致）；②**凑绿永久删改**（删件/改件/改 `.gitignore` 掩盖/抬 cap 吃红）**在 Ban 内**；③该件归属与最终处置归协调方，本刀零处置。**受管计面后果**：该件在场时 docs:check 现扫 2449>cap 2448 红（§6）。
- **同 tip 并行席（evap·rev r4 复核）**：`line/evap-draft` **r4 亲读 @`e5fbc9271`**（推进链 `34e06b070`→`64440511e`→**`e5fbc9271`**：`docs(test): 更正评测解析任务书实现形与主门断言`）——名形近姊妹刀 `GAP-EVAL-PARSER-DETAILS-UNCLOSED`（EVAL-PARSER）域，本席**已越树亲读其卷**（`git show line/evap-draft:ai-docs/delivery/harness/evap-REQUEST.md`）：其 §0 对同批四 prove 的届值/三类先在红承登（38 archive + 1 drift + `:584` 崩溃 + 零断言输出 + 21 FAIL 分解）与本卷 r2 **互证一致**；其 r2 亦采「EXIT=1 且 FAIL 集合逐字恒等」邻面门口径（§0.0.4）——两刀**环境先在红分口同判**、`CAP-SANCTION-2448` 同号并留（§4）。**EXEC 立项日必做**：`git diff --name-only <届时 origin/main>..line/evap-draft` 逐文件复核，任一触面撞本刀面（§1.1 七 site 解析器文件 + 本卷）即触「现场漂移」停手上报。
- **同 tip 并行席（r5mr）**：`line/r5mr-draft` @`ebce6ff56`（cap `CAP-SANCTION-2448` 同号承登线之一·§4）——**工作树 `meetwise-r5mr` r4 实测已撤**（`git worktree list` 16 树不含其名；r2 时在列，r4 如实刷新·分支 ref 仍在）；r2 复核 `git merge-base --is-ancestor 0e42adb21 origin/main` **EXIT=0** 亲证（收官 commit 已并入 main），故本刀与其**已无并线竞争**，但**同号 2448 出处分立须双留**（§4）。触面复核口径同上。
- **陈旧长线**：`line/ag18-draft`（ahead 2588/behind 3305）· `line/cap-2272`（ahead 2590/behind 3305）· `line/campaign-state`（ahead 2593/behind 324）对解析器面有历史 commit，但三支全远滞非活跃竞争面（沿 pay-neg §0.0.1 长线陈旧支判例）。
- **零重叠正申明**：本刀不认领任何 `NHP-018-*` 行（产品 NEG/FAULT/BOUND/ADV/PERF/LOAD 面各有其证·§1.4）、不改双矩阵格值、不改 backlog/gap 登记行状态、不代偿姊妹 DETAILS 刀。

## 0.0.2 rev r1 回炉（2026-10-30 · 双席 FAIL 同判 · 九件全采纳 · 卷内落点索引）

- **入卷因由**：pre-exec dual r1 **两席均 FAIL**，且**互盲同判**——①P1 基线假绿（ARM-4「四 prove 全 EXIT=0」与实测/矩阵 `:306` known-RED 直接矛盾）②P1 否定词表缺口（`banNear` `:103` 无 `no`/`non-`/`非`，`no gap` 修后仍返 gap）③P1 ARM-2 归法二义（hit 级 skip vs cell 级 fail-closed 未钉死）。裁决：**两席修订清单合并去重九件全采纳**，卷内逐条落点如下。
- **修订索引**：①[P1] ARM-4 重定界 → §2 ARM-4 + §1.4 + §6；②[P1] 否定词表裁定项 → §2「否定词表预登」；③[P1] ARM-2 归法钉死 → §2「归法」+ ARM-2 行；④[P2] ARM-1/ARM-3 改标 + 真红拉低形 + `#4` 注入 → §2 表；⑤[P2] 窗形钉全 + partially/fence 登记 + `:752`/`:764` 兜底交互 → §1.1-3 + §2 断言补注；⑥[P2] cap 三线同号 + 漂移 + EXEC 并线预期 + dual-keep 义务 → §4（+ Header Base/tip）；⑦[P2] 并行席表补 r5mr + 清场核 → §0.0.1；⑧[P3] 卷头 Date + gatherer `cellStatus` 可测性登记 → Header + §2 可测性项；⑨ rev r1 小节 → 本 §0.0.2。
- **STOP 维持**：卷内三处（标题 · Status · 卷尾注）仍 `draft:awaiting_pre_exec_dual`——r1 只改卷面事实与设计钉，**不放行 EXEC**；再放行须 fresh dual。
- **零证据面翻转**：Pins 十值零翻转；`apps/*/src`/`packages/*/src` 零 diff；本 rev 只改本卷 `.md` 一件（§9）。

## 0.0.3 rev r2 回炉（2026-10-30 · r2 双席 FAIL 互盲同判 · 两席清单合并全采纳 · 卷内落点索引）

- **入卷因由**：r2 pre-exec dual **两席均 FAIL**，互盲同判三条 P1——①否定词表**未钉死**（「扩展/收窄」二择一活口 + 与「钉死一支」自相矛盾）；②hit 级 skip 取 **前 48/后 16 对称窗**与 ARM-2/3 期望自相矛盾——按该窗形实测 `**case-only**（not partial）`→`unknown`、`still **gap**（not partial）`→`unknown`、`still **partial**（not gap）`→`unknown`，**三臂全 MISMATCH**；③ARM-4「真矩阵逐列解析值恒等」**不可满足**——裸 `未` 对「未进/未齐」、裸 `非` 对「非空」误触发，实矩阵行 `:125`/`:182`/`:190` 解析值变化（r2 复算更正：r1 窗形变化面实为 gatherer 17 行、legacy018 9 行、conservative 8 行，三行均在其内）。
- **协调方裁决（两席独立验证同判）**：**采后向邻接判定形**——否定词元紧邻 hit 之前才弃 hit，**永不检查 hit 后缀**、**不做 48 字回看**；该形下 ARM-2/3 三臂全绿、**60 UC 行/312 非空格零变化**（§2 模拟表；**r3 更正**：r2 稿「全矩阵零变化」不确——全表 200 行/858 非空格另有 `matrix:202` 1 格**预期**翻转，见 §2.3「全表 sweep」）。r1「前 48/后 16」窗形**作废**，本卷不再保留为备选。
- **修订索引（9 件·去重合并）**：①[P1] 否定词表钉死唯一形（删「收窄备选」活口 + 删 ARM-1 条件句 + status 臂独立表 + 裸 `未` 收窄登记）→ §2「词元表钉死」；②[P1] 窗形改后向邻接（删 48/16 + ARM-2/3 三臂期望表作验收锚 + 全臂模拟表作 EXEC 前门）→ §2「判准形」+ §2 模拟表；③[P1] ARM-4 拆 4a/4b（FAIL 文字集恒等 / 被断言格解析值恒等 + 门序钉死）→ §2 ARM-4a/4b；④[P1 补] 解析器清单补三 site（reassess `:177-182` cell102 · `:172-175` nhpPerf/nhpLoad · lift `:132` advIsBlind）+ 单列 pin 断言 site 零触名单 → §1.1；⑤[P2] 单一 helper 落位 + per-cell 切格 + `no covered` 入守卫臂 + min 措辞 → §2；⑥[P2] 宿主钉 cite（删二择一·criterion 只登记不承载·可测性取①）→ §2「交付面」；⑦[P2] untracked 件定性改 gate run artifact + 还原 hash 义务 → §0.0.1 + §6；⑧[P2] diff 命令改 `git show --numstat` + evap 标 rev r2 + `pnpm lint` 改 N/A → §6 + §0.0.1；⑨ 本小节。
- **STOP 维持**：卷内三处仍 `draft:awaiting_pre_exec_dual`——r2 只改卷面事实与设计钉，**不放行 EXEC**；再放行须 fresh dual（r1/r2 均未放行）。
- **零证据面翻转**：Pins 十值零翻转；`apps/*/src`/`packages/*/src` 零 diff；本 rev 只改本卷 `.md` 一件（§9）。

## 0.0.4 rev r3 回炉（2026-10-30 · r3 双席 FAIL 互盲同判 · 两席清单合并去重全采纳 · 卷内落点索引）

- **入卷因由**：r3 pre-exec dual **两席均 FAIL**，互盲同判两条 P1——
  - ①**span 正则 `matchIndex` 语义错**（两席同判交叉印证）：r2 稿要求 §1.1「七 site 统一签名 `isNegatedHit(text, matchIndex, matchLen)`」，但 `reassess :172` 的 `/NHP-018-PERF-01[\s\S]{0,400}?\|\s*\*\*partial\*\*/` 的 `m.index` 指向**行 ID**（真文本实测 `m.index=14344` 指向 `NHP-018-PERF-01`、`matchLen=404`、`**partial**` 在 match 内 `+393`）——直调 `isNegatedHit(text, m.index)` 判的是行 ID 之前约 14KB 前缀 → **恒不命中（空转）**，或上一行行尾恰有否定词元时**跨行误弃**；`lift :125` `advBlind` 同类（行内 `m.index=0`、`matchLen=315`、`**blind**` 在 `+306`）。即 r2 版对该两类 site **写了等于没写**。
  - ②**验收面仅覆 4/11 函数**：§2 注入臂只落在 `cellStatusLegacy018` / `cellStatusConservative` / gatherer `cellStatus` / `parseNhpRow` 四处；**site 5（reassess `cellStatus`）/ 6（`advIsBlind`/`advIsPartial`）/ 7（`nhpPerf*`/`cell102`）零注入臂** → 「只修一处冒充全修」在本卷**不可证伪**。
- **协调方裁决**：**两席修订清单合并去重全采纳**（席1 P1×1+P2×9 / 席2 P1×2+P2×8+P3×6，去重后见下表）——锚点**按 site 分形钉死**、验收面**扩到 11 函数**、全矩阵口径**收窄到 60 UC 行/312 非空格**并登记 1 格预期翻转。
- **修订索引（10 件·去重合并）**：①[P1] span 锚点分形钉死（per-cell / hit 子偏移）→ §1.1 site 6/7 + §2.1「锚点规则」；②[P1] 验收覆盖 11 函数（site 5/6/7 各补注入臂）→ §2.3.1 + §2.5 + §2.6；③[P2] 全矩阵口径收窄 + `matrix:202` 预期翻转 1 格 + absence 断言族入零触 → §2.3「全表 sweep」+ §1.1 note d-1 + §2.6；④[P2] 门序修正（criterion 亦 DIRTY_TREE）→ §2.4；⑤[P2] 第二通路（honesty-pin `:461`）走 helper + 复合守卫子句登记为已知例外 → §2.1「第二通路与守卫子句」；⑥[P2] 中文否定缺口收窄登记（`不是/无/没有`）+ `\bnon-?` 字面统一 + 分隔符类措辞 → §2.1「词元表钉死」；⑦[P2] cite 缓冲措辞（`:821` flush）→ §1.4；⑧[P2] 400 字预算登记（per-cell ⇒ 消）→ §2.1「per-cell 落地」；⑨[P3] `HEAD~2..HEAD` + grep 口径 + raw split index 7 + 删未用 `matchLen` + r1 窗形 17/9/8 标量级示意 → §6 + §0.0.1 + §2.1 + §2.3；⑩ 本小节。
- **STOP 维持**：卷内三处（标题 · Status · 卷尾注）仍 `draft:awaiting_pre_exec_dual`——r3 只改卷面事实与设计钉，**不放行 EXEC**；再放行须 fresh dual（r1/r2/r3 均未放行）。
- **零证据面翻转**：Pins 十值零翻转；`apps/*/src`/`packages/*/src` 零 diff；本 rev 只改本卷 `.md` 一件（§9）。

## 0.0.5 rev r4 回炉（2026-10-30 · r4 双席 FAIL 互盲同判 · 两席清单合并去重全采纳 · 卷内落点索引）

- **入卷因由**：r4 pre-exec dual **两席均 FAIL**，互盲同判——
  - **①[P1] ARM-7a「基线 true」系假值**：现行 span 形 `/NHP-018-PERF-01[\s\S]{0,400}?\|\s*\*\*partial\*\*/` 要求 `|` 后**紧接** `**partial**`；r3 合成行 status 格 ` not **partial** ` 的 `|` 后是 `not` → 现行正则返回 **false**，与所写基线 `true` 矛盾（两席亲跑同判）。故该臂**不具备判别力**，且谎报基线。
  - **②[P1] site 10 `nhpLoadPartial` 无臂**：§2.6 表列 11 函数却在 §2.3.1 只给 9/11 注入臂（`nhpLoadPartial` 仅「随 9 同改·可选」）——与 §2.6「不设豁免活口」自相矛盾。
  - **③[P1] 第二通路空转**：`not still honesty-pin` 的前缀 `not still ` 中 `still` **不在分隔符类** → helper 拦不住；r3「第二通路必修·否则该形仍被推入 found」的定性不成立（邻接语义本就管不到 `not still X`）。
- **协调方裁决**：**两席修订清单合并去重全采纳**（席1 P1×1+P2×6+P3×4 / 席2 P1×2+P2×8+P3×6）——ARM-7a **采席2 夹具形**（注入格 `**partial**` + status 格 `not **partial**`：旧 span 自 **行 ID 偏移 2** 起命中→true，per-cell 取 **cell 7** 被否定→false，基线 true/期望 false 成立且能识别未接 per-cell）；site 10 **补同形镜像臂**（恰红集 16→**17**）；第二通路**采席2 (b) 最简**（删「必修」定性，登记 `not still X` 不在邻接语义内·不设臂）。
- **修订索引（13 件·去重合并）**：①[P1] ARM-7a 夹具替换 + site 10 镜像臂 + §2.5 恰红集 17 → §2.3.1 + §2.5 + §2.6；②[P1] 第二通路定性改登记 → §2.1「第二通路与守卫子句」；③[P2] 编号错标（§1.1→§2.6 · 三形→四形）→ §2.1 + §2.3.1；④[P2] lift 事实修正（lift 无 porcelain 门）→ §1.4 + §2.6；⑤[P2] 门序第 0 步（落码先 commit）→ §2.4；⑥[P2] 分拆 alt 伪证删除（`*` 在分隔符类内）→ §2.1 + §8；⑦[P2] `matrix:202` 措辞改 sweep 观测面 + sweep 行集定义 → §2.3；⑧[P2] 提取清单补 `advIsBlindOf`/`advIsPartialOf` + `advBlindOf(text)` → §2.1 + §2.6；⑨[P2] 整行哨兵公式 `toLowerCase()` + 末位登记 + alt3 表述 → §2.1；⑩[P2] note d-1 补 cite `:673-813` 整块 + eval-uc `:36`/`:63` → §1.1 note d-1 + §8；⑪[P2] §2.4 引述失实删除 → §2.4；⑫[P3] 现场漂移刷新（工作树 16 / origin/main `3af835ad4` / cap 2455 / evap `e5fbc9271` / r5mr 树撤 / 删「2453 至少」下界 / 尾臂否定判定钉死 / criterion 探针残留 / 切格器 `\|`）→ Header + §0.0.1 + §2.1 + §2.4 + §4 + §5 + §7；⑬ 本小节。
- **STOP 维持**：卷内三处（标题 · Status · 卷尾注）仍 `draft:awaiting_pre_exec_dual`——r4 只改卷面事实与设计钉，**不放行 EXEC**；再放行须 fresh dual（r1/r2/r3/r4 均未放行）。
- **零证据面翻转**：Pins 十值零翻转；`apps/*/src`/`packages/*/src` 零 diff；本 rev 只改本卷 `.md` 一件（§9）。

## 0.0.6 rev r5 回炉（2026-10-30 · r5 席1 FAIL · **零 P0/P1** · P2×2 + P3×5 全采纳 · 卷内落点索引）

- **入卷因由**：r5 pre-exec dual **席1 FAIL**，但**零 P0/P1**——仅 **P2×2 + P3×5**，全部为卷面锚点/描述与机制源逐字不符，**无设计面或裁决面冲突**。**r4 三 P1 全闭合确认**：①ARM-7a 假基线已消（注入格 `**partial**` + status 格 `not **partial**`：旧 span 自 **行 ID 偏移 2** 起匹配→`true`、per-cell 取 **cell 7** 被否定→`false`·§2.3.1）；②site 10 无臂已补（ARM-7c 镜像臂·恰红集 **17**·§2.5/§2.6）；③第二通路空转已改登记（删「必修」定性·`not still X` 不在邻接语义内·§2.1「第二通路与守卫子句」）。
- **机制源复核（r5 逐字亲点·全对 tip `d5ba5b428`）**：`eval-uc-e2e-001-002-cite.proof.mjs` 否定形 pin 实为 **`:33`/`:60`**；`:36`/`:63` 实为 `matrixStatusRe`（`:37`/`:64` 为 `matrixForbidCovered`）；gatherer `cellStatus` **`:70-77` 无末位臂**（`partial` 臂 **`:73`**、`case-only` 分支在 **`:74`** 自返 `case-only`）；cite absence 块为 **`:673-819`**（含 `:807-818` 的 UC-E2E-031/032 + releaseEvidence）；criterion 探针 **`:518` 写 / `:527` finally / `:528` rmSync**；`not partial · partial` 第二正向 hit 在 **index 14**；conservative `still **partial**（not gap）` 的 found＝`['partial','partial','gap']`（弃 `gap` 后 min 由 `gap` 抬到 `partial`）。
- **修订索引（7 件·全采纳）**：①[P2] note d-1 锚点错位（eval-uc `:36`/`:63`→**`:33`/`:60`**，并把原 `:36`/`:63` 描述改回真实内容）→ §1.1 note d-1 + §2.6 + §8-7；②[P2] site 3 尾臂描述失实（拆开 site 1/5 与 site 3；site 3 无 `/not_run|case-only|blocked/→'blind'` 末位臂）→ §2.1「尾臂否定判定钉死」+ §2.6 行 3；③[P3] cite absence 块边界（`:673-813`→**`:673-819`**）→ §1.1 note d-1 + §2.6 + §8-7；④[P3] 分拆反例 index（第二正向 hit **12→14**）→ §2.1「实现钉死」+ §8-6；⑤[P3] criterion 探针锚（`:516` 写/`:529` finally rmSync → **`:518` 写/`:527` finally/`:528` rmSync**）→ §2.4-1；⑥[P3] artifact 移出崩溃路径（崩溃/被杀未还原→只许从副本还原·Ban 重跑 lift 复位 hash）+ 归法 min 重算措辞 + 清场核范围显式 → §2.4-1/2/4 + §2.1「归法」；⑦ 本小节。
- **处方逐字偏差（r6 更正·按机制源落）**：r5 清单 ① 附注「`:36`=matrixForbidCovered」与源不符（源 `:36`=matrixStatusRe、`:37`=matrixForbidCovered）——本卷按源写全两行，未按附注落；② r5 本卷曾把 `case-only` 分支写成 `:73`，并据此把正确附注「`:74`」判为错——r6 逐字复点更正：源 `uc-covered-real-gatherer.mjs` `:73` 为 **partial 臂**（`if (/\*\*partial\*\*|\bpartial\b/i.test(c)) return 'partial'`）、**`:74` 为 `case-only` 臂**（`if (/case-only/i.test(c)) return 'case-only'`）；**附注 `:74` 与源一致，r5 的「源 `:73`」系误点**。**语义与修向零改**（仅行号逐字校正），不构成修订与机制源冲突。
- **STOP 维持**：卷内三处（标题 · Status · 卷尾注）仍 `draft:awaiting_pre_exec_dual`——r5 只改卷面锚点与描述，**不放行 EXEC**；再放行须 fresh dual（r1–r5 均未放行）。
- **零证据面翻转**：Pins 十值零翻转；`apps/*/src`/`packages/*/src` 零 diff；本 rev 只改本卷 `.md` 一件（§9）。

## 0.0.7 rev r6 终轮回炉（2026-10-30 · r6 双席 FAIL 互盲同判 · 协调方时间盒裁决最后一轮 · 两席清单合并全采纳 · 卷内落点索引）

- **入卷因由**：r6 pre-exec dual **两席均 FAIL**，互盲同判 **P1 同根**——site 3 `case-only` 臂**锚点错位**：源 `uc-covered-real-gatherer.mjs` **`:74`** 为 `case-only` 臂（`:73` 为 partial 臂），而本卷四处（§0.0.6 机制复核 · §0.0.6 偏差登记 · §2.1 尾臂 · §2.6 行 3）曾写 `:73`，§0.0.6 还把正确附注「`:74`」判为错；且该子臂**零验收臂**——17 臂在「`partial` 臂已接 · `case-only` 臂未接」半修态仍全绿。
- **协调方裁决（时间盒·本卷为最后修订轮）**：**采席2 方案 (b) 登记排除形**——**不补臂**，明文把 `case-only` 子臂排除出验收，并以**正确锚点 `:74`** 登记「仅 probe 复现 · 不设臂」；理由：时间盒（P3 级小刀已 6 轮）·补臂需连带改 17→18/19 多处计数再引新一轮风险。
- **修订索引（两席 P1×1-2 + P2×4 + P3×6 合并去重·全采纳）**：①[P1] `case-only` 锚点 `:73`→**`:74`**（四处）+ §0.0.6 偏差登记重写 → §0.0.6 + §2.1 + §2.6；②[P1 裁决 b] 子臂验收排除登记（§2.3.1/§2.5/§2.6 三处·17 集不变·「11 函数全覆盖」限定主臂）→ §2.3.1 + §2.5 + §2.6；③[P2] lift 前 H0 副本 + lift 前/后两目标区分 → §2.4-3b/4；④[P2] ARM-5 负验证净树（临时 neuter commit→三宿主 delta 4/10/3=17→还原；排 ARM-4 后·r7 校准）→ §2.4（r7 重排后 **-4**）+ §2.5；⑤[P2] 第 1 步清场核重写（先移出 evidence 保 H0 副本 + 清探针→清场核→cite；崩溃轮输出作废重跑）→ §2.4-1/2；⑥[P2] **整行哨兵末位登记（现 :172）** 论据更正（真 `matrix:123` 含 1 处叙事性 `**blind**`·advBlind 修前修后恒 true）→ §2.1；⑦[P2] `.test()` 禁令限定「状态词臂单点替代」+ helper 本体 `.test()` 不受禁 + exec `lastIndex` 卫生 → §2.1 + §8-6；⑧[P2] 收据只落 `.tmp/`（`.gitignore:15`）或仓外 → §9；⑨[P3] 函数编号 #1–#11 统一 + 60/312 行集定义 + ARM-7 夹具 index 改述 + parseNhpRow `:82`→**`:86`**/`:79-88`→**`:79-90`** + §2.6 行 2 补 `:467` + §6 diff「本次/上一 commit」口径 → §2.3/§2.3.1/§2.6/§6；⑩ 本小节。
- **STOP 维持**：卷内三处（标题 · Status · 卷尾注）仍 `draft:awaiting_pre_exec_dual`——r6 只改卷面事实与验收口径，**不放行 EXEC**；再放行须 fresh dual（r1–r6 均未放行）。**本卷为协调方时间盒裁决的最后修订轮**；后继仍待协调方派单 + fresh pre-exec dual。
- **零证据面翻转**：Pins 十值零翻转；`apps/*/src`/`packages/*/src` 零 diff；本 rev 只改本卷 `.md` 一件（§9）。

## 0.0.8 rev r7 回炉（2026-10-30 · r7 双席 FAIL 互盲同判 P1×1 · 协调方裁决采方案 A · 两席清单合并去重全采纳 · 卷内落点索引）

- **入卷因由**：r7 pre-exec dual **两席均 FAIL**，互盲同判 **P1 同根**——§2.4 负验证（原第 7 步）排在「最终还原 H0」（原第 4 步）**之后**：跑到负验证时树内 artifact 已在场，`reassess :70-76` `assertCleanPorcelain` 早退 `exit(1)`（**零断言**），且 neuter 临时 commit 清不掉 untracked artifact → **四臂恰红不可得**；r6「负验证 4 FAIL」在门序上**不可达**。
- **协调方裁决（采席2 方案 A·门序重排）**：**负验证步前移**到「最终还原 H0」**之前**（artifact 仍在工作区外时跑）；末步改为「**移出 H′ → 从 H0 副本逐字节还原 → 核 hash `9e541f5e…`**」。**同一 neuter commit 下三宿主顺序跑（r8 更正：原「并跑」→ `reassess→cite→lift` 固定序·lift 末位）**：reassess `21+4=25` / cite `39+10=49` / lift `15+3=18`，**三件 delta 合计 17** 后方可回滚 neuter commit（**回修法 commit B1 态·非基线 tip**）；**只报 reassess 4 格＝以 4 冒充 17**，违本卷 Ban。
- **修订索引（两席 P1×1 + P2×3 + P3×5 合并去重·全采纳）**：
  ①[P1 方案 A] 门序重排（负验证前移·末步移出 H′→还原 H0→核 hash）+ reassess 基线 **21+4=25 FAIL**（差集逐字·4 为臂 delta·Ban 断言总数 4）→ §2.4-4/5 + §2.5；
  ②[P2] 三宿主**顺序** delta **4/10/3=17**（r8 更正「并跑」；cite 先保 artifact 在工作区外·`criterion :749` 同族 porcelain 门）→ §2.4-4 + §2.5 + §8；
  ③[P2] 清场核三类（+reassess 探针 `.tmp-lift-porcelain-probe-uc018.txt`·`:336` 定义/`:338` 写/`:344` rmSync·**仓根**·`.gitignore:15` 的 `.tmp/` 不覆盖）+ `find <root> -maxdepth 1 -name '.tmp-*probe*'` 复核 → §2.4-1 + §5；
  ④[P2] ARM-4a 同树修前 B0：0a 清场后取 B0（artifact 已移出）/ 0b 落码 commit / 0c 跑 B1 / 0d B0≡B1；r2 的 39/15/21 降为交叉校验不作恒等锚 → §2.4-0；
  ⑤[P3] 「不设豁免口」限定函数级（子臂按下一目登记）· §2.6 行 3 注入臂 ARM-1/2→**ARM-2** · §2.3 `#4` 整行夹具（status 格 index 7=`not **partial**`；原「防 fail-closed 假绿」已由 r8 删）· note d-1 `:676-677`/`:681-682`/`:690-691` · §0.0.7⑥ 锚点改「整行哨兵末位登记（现 :172）」· §3/§6 量化锚（**+1.82ms/858 格×3 parser·3.63→5.45ms·零 I/O 零轮询零锁**）· criterion 探针改「`:517` try / `:527` finally / `:528` rmSync」块（r8 锚点精化·r7 稿 `:526-528` 不确）→ §2.6 + §2.3 + §1.1 + §0.0.7 + §3 + §6 + §2.4-1；
  ⑥ 本小节。
- **行号口径**：本条及 r7 清单中的行号锚对 **r6 卷面**（§0.0.8 插入前）亲点；插入后正文行号顺延，语义锚以节名/函数名为准。
- **处方逐字偏差（r7 更正·按机制源落）**：派单 ② 括注「cite … 免 `:749` porcelain FAIL」——机制源 `:749` 属 **criterion**（`uc-e2e-018-covered-criterion.proof.mjs:749` `assertCleanPorcelain`）；**cite 宿主自身无 porcelain 门**（`eval-harness-matrix-cite.proof.mjs` 零 `assertCleanPorcelain`/零 `DIRTY_TREE`）。本卷按源记为「`criterion :749` 同族门」，**移出 artifact 的动作与三宿主 delta 口径零改**（仅归属与行号校正，不构成修订与机制源冲突）。
- **门值口径（r8 补）**：r7 门只含 **docs:check / PTP / markers**（四 prove 未复跑·沿用 r2 值）；r7 门值当轮**未单列落卷**，§6 以 **r8 本轮同树复跑值**承登（同口径：docs:check 清场核后 EXIT=0/scanned 2448、PTP EXIT=0 12/12、markers hits=0）。
- **STOP 维持**：卷内三处（标题 · Status · 卷尾注）仍 `draft:awaiting_pre_exec_dual`——r7 只改卷面门序与计数口径，**不放行 EXEC**；再放行须 fresh dual（r1–r7 均未放行）。r6「时间盒最后一轮」经协调方 r7 派单延续修订。
- **零证据面翻转**：Pins 十值零翻转；`apps/*/src`/`packages/*/src` 零 diff；本 rev 只改本卷 `.md` 一件（§9）。

## 0.0.9 rev r8 终落卷席（2026-10-30 · r8 双席 FAIL 互盲同判 · 协调方时间盒硬裁决「本轮按两席处方逐字落卷后即收敛·不再派双审」 · 两席清单合并去重全采纳 · 卷内落点索引）

- **入卷因由**：r8 pre-exec dual **两席均 FAIL**，互盲同判——**席1 P1×1**：§2.6 行 1 把 `cellStatusLegacy018` 记为 `ARM-1/2/3`，照表落臂会造**恒红**（ARM-2 `**case-only**（not partial）` 在 legacy018 修后返 `'blind'`（r8 探针按 §2.1 判准形复算），而 §2.2 期望 `case-only`）与**零 delta**（ARM-3 拉低 `still **partial**（not gap）` 在 legacy018 基线 `'partial'`、修后 `'partial'`＝期望同值）→ **17 格恰红不可达**；**席2 P1×2**：①§2.4-0a/0c 四 prove 含 `lift`（`:220` 无条件写盘）与批内后序 porcelain 门自相矛盾 ②「三宿主并跑」与负验证净树/门序矛盾（lift 写盘后任何后序 porcelain 门必 `DIRTY_TREE`）。
- **协调方时间盒硬裁决**：本轮**按两席处方逐字落卷后即收敛**，**不再派双审**；**本轮落卷后由协调方直接放行 EXEC**——卷面 STOP 值**不自行翻面**（翻面动作归协调方），fresh dual 步骤按本裁决免除。
- **修订索引（11 件·合并去重·全采纳）**：
  ①[P1 席1] §2.6 行 1 改 `ARM-1（五）· cite` + §2.3.1 补 cite 分账 `10 = #1 五 + #2 二 + #3 二 + #4 一` + §2.3 表注/§2.3.1 宿主行钉「**臂→函数以 §2.3 对码列为准·§2.6 列不得扩展**」；
  ②[P1 席2-A] §2.4-0a/0c 批内固定序 **cite→criterion→reassess→lift**（lift 末位）·批末把树内产物（H′）移入**独立弃置区**（与 H0 保管区路径不同）·**H0 保管区只在首轮清场写一次·明文 Ban 覆盖**·第 1 步「核 hash」对象明示为 **H0 保管副本**；
  ③[P1 席2-B]「并跑」改「**同一 neuter commit 下顺序跑 reassess→cite→lift**（lift 末位·其后不得再跑任何 porcelain 门）」+ §8 Ban「三宿主真并发」；
  ④[P2] §2.4-0b pathspec：只 `git add scripts/*.mjs`（+本卷若需）·**Ban `git add -A`/`git add .`**（0a 后树内有 untracked H′，误 add 即脏）；
  ⑤[P2] neuter 语义钉死：「**保留函数提取与臂接线·仅令 `isNegatedHit` 恒 false**」（Ban 回退修复前源码→`ReferenceError`）；
  ⑥[P2] 17 强制证据面：EXEC 收据**强制列三宿主逐字差集 `25−21`/`49−39`/`18−15`（17 行）或集合 hash**；
  ⑦[P2] neuter commit 回滚路径：`git log -1` 自检 neuter 标记 + 反向 commit/reset **回修法 commit（B1 态）**；
  ⑧[P2]「还原 commit」二义消解：「回基线 tip」→「**回到修法 commit（B1 态）**」+ 还原后实证（HEAD 断言 + 17 臂复绿）；
  ⑨[P2] `STATUS-NOT-COVERED` 假阳性登记（`\bnot\b` 对 SCREAMING-KEBAB 枚举误触发·当前被同格 GAP 掩蔽·**登记例外·不改 matcher**）；
  ⑩[P3 批] `#4` 表注删「防 fail-closed 假绿」过度声明 · 探针锚精度（criterion `:517` try/`:527` finally/`:528` rmSync；reassess `:343` finally/`:344` rmSync）· §2.4-4 cite 括注改「同批 reassess `:72` + 末段 docs:check 计面」· find 复核 `|| exit 1` · §6 补 r7 门值 + 口径句 · 量化锚 #6 全 matrix 面显式排除 · `.`/`。` 不入分隔符类·`not. partial` 不承诺 · ARM-6c 本体/buggy 复跑措辞区分 · §2.6 宿主分工改函数编号 #9/#10/#11 · 臂文案唯一性（每臂一条断言·文案含臂名）；
  ⑪ 本小节。
- **STOP 维持**：卷内三处（标题 · Status · 卷尾注）仍 `draft:awaiting_pre_exec_dual`——r8 只改卷面臂归属与门序路径，**翻面归协调方**（时间盒裁决：本轮后直接放行 EXEC）。
- **零证据面翻转**：Pins 十值零翻转；`apps/*/src`/`packages/*/src` 零 diff；本 rev 只改本卷 `.md` 一件（§9）。

## 1. 产品面侦察（只读取证 · file:line 全引 · blob 对 tip `af273901a` 亲算）

### 1.0 blob 锚表

| 文件 | blob（行数） | 本刀关联锚 |
|---|---|---|
| `scripts/eval-harness-matrix-cite.proof.mjs` | `36cefcba`（824） | `:418-426` STATUS_RANK · `:429-437` legacy018 · `:452-473` conservative · `:475-492` parseSection101Facets · `:594-624` 自测 |
| `scripts/lib/uc-covered-real-gatherer.mjs` | `3971e436`（807） | `:70-77` cellStatus · `:79-90` parseNhpRow · `:93-108` gapClosedInText 否定窗先例（`:103` banNear）· `:448` assertCleanPorcelain（export）· `:519` gatherRealUc018 · `:539-543`/`:618`/`:752`/`:772` 消费点 |
| `scripts/lib/uc-covered-evaluator.mjs` | `ec62c4c2`（340） | `:118` status 直等比较（不吃词面正则）· `:30-31` STATUS_NOT_COVERED |
| `scripts/uc-e2e-018-covered-lift-reassess.proof.mjs` | `5f67d2ac`（527） | `:107-114` cellStatus 同形 · `:172-175` nhpPerf/nhpLoad 判定 · `:177-182` cell102 |
| `scripts/uc-e2e-018-covered-lift.proof.mjs` | `afd6b928`（380） | `:125-127` advBlind 整行哨兵 · `:132` advIsBlind · `:139` `advIsPartial` · `:218`/`:220` evidence artifact 写出 |
| `ai-docs/delivery/gap-bug-backlog.md` | `33ba0d86`（959） | `:37` C-WORD-NEG P2 行 · `:36` 姊妹行 |
| `ai-docs/delivery/e2e-covered-path-backlog.md` | `05a76401`（55） | `:44` 执行序尾 follow-ups 提点 |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `1a1844eb`（522） | `:123` §1.0.1 行 · `:183` §1.1 行 · `:270` P0-8 · `:306` known-RED 承登 · `:312` live-prove 表 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `64988114`（218） | `:78-83` NHP-018 六行 |
| `ai-docs/delivery/harness/uc-e2e-018-receipt-backfill.md` | `d02fc169`（101） | `:61` register-only |
| `scripts/ai-docs/public-text-policy.mjs` | （本刀步进后 `:263` `MAX_FILES = 2_448`） | §4 cap |

### 1.1 C-WORD 词面语义源＝解析器族 **七 site＝11 个函数**（逐件亲读 · 词面臂逐条 · r2 补三 site · r3 展开函数名并钉锚点）

1. **`eval-harness-matrix-cite.proof.mjs:429-437` `cellStatusLegacy018`**（首hit 形）：`:431` blind 臂 `/\*\*blind\*\*|\bblind\b/i`（且无 `**partial**`/`**covered**` 粗体排除）· `:432` covered 粗体臂 · **`:433` partial 臂 `/\*\*partial\*\*|\bpartial\b/i` ← 残余本体**（`\bpartial\b` 词面臂无否定判定）· `:434` gap 臂 `\bgap\b` 同形 · `:435` `not_run|case-only|blocked` 臂。审注「same shape as legacy018 L433」即此行。
2. **`eval-harness-matrix-cite.proof.mjs:452-473` `cellStatusConservative`**（min-rank 形）：`:456` `stillRe` still-残留收集 · `:462-465` 词面臂循环 `\\b<name>\\b`（covered/partial/honesty-pin/case-only/gap/blind 六词·**同样无否定判定**）→ `:470-472` minStatus 取最弱。负例形：输入 `not partial` → found=`['partial']` → 返 `'partial'`（无更低 rank 可兜）。
3. **`uc-covered-real-gatherer.mjs:70-77` `cellStatus`**（真矩阵 gatherer · 首hit 形·**最锐暴露面**）：`:72` covered 粗体臂 → **`:73` partial 臂 `/\*\*partial\*\*|\bpartial\b/i`** → `:74` `case-only` 臂 → `:75` blind 臂 → `:76` gap 臂。负例形：`**case-only**（not partial）` → partial 词面臂先于 case-only 臂首hit → **返 `'partial'`（case-only 在场仍被抢占）**。消费点：`:539-543`（NHP 行族）· `:752`（§1.1 statusCell 兜底）· `:772`（§1.0 BOUND 格）——真矩阵格值直读面。
4. **`uc-covered-real-gatherer.mjs:79-90` `parseNhpRow`**：partial 用粗体-only 臂（**`:86`**），non-bold 「not partial」落末行返 unknown——粗体否定形 `not **partial**` 可误hit（词形面同族，登记入臂面）。**r2 补**：该函数现扫整行（自 ID 至行尾），落地须**先按未转义竖线切格只取 status 格**（§2 per-cell 钉）。
5. **`uc-e2e-018-covered-lift-reassess.proof.mjs:107-114` `cellStatus`**（legacy 首hit 同形·`:111` partial 臂）——同源同病，独立复制件（非 import）。
6. **`uc-e2e-018-covered-lift.proof.mjs:125-139` `advBlind`/`advIsBlind`/`advIsPartial`**（r2 补 `:132`）：**`:125-127` `advBlind`＝整行哨兵**（三 alt：`/\|\s*UC-E2E-018\s*\|[^\n]*\*\*blind\*\*/` 作用于 `m018NegFaultBoundAdv`（`matrix.match(/\| UC-E2E-018 \|[^\n]+/)?.[0]` 单行）+ `/UC-E2E-018[^\n]*ADV[^\n]*\*\*blind\*\*/i` + `/\| UC-E2E-018 \|[^\n]*\|\s*\*\*blind\*\*\s*\|/` 作用于全 matrix）· `:132` `advIsBlind = /\*\*blind\*\*/.test(advCell) || advCell === 'blind'` · `:139` `advIsPartial = /\*\*partial\*\*/.test(advCell) || /\bpartial\b/.test(advCell)`。**r3 锚点实测**：`advBlind` alt1 行内 `m.index=0`、`matchLen=315`、`**blind**` 在 match 内 `+306` → **整段 match 起点判否定＝空转**（§2.1 锚点规则·此形取 hit 子偏移）。三者为 inline 派生常量，须提为可调用纯函数方可注入（§2.6）。
7. **`uc-e2e-018-covered-lift-reassess.proof.mjs:172-182`（r2 补·r3 展开）**：`:172-175` `nhpPerfPartial`/`nhpLoadPartial`/`nhpPerfCaseOnly`/`nhpLoadCaseOnly`（`NHP-018-PERF-01[\s\S]{0,400}?\|\s*\*\*partial\*\*` 跨 400 字**跨格跨行**判定·词面 hit 无否定判定）· `:177-182` `cell102`（`**partial**`/`case-only`/`blind` 三臂）。**r3 锚点实测**：`:172` 真 NHP 文本 `m.index=14344`（指向 `NHP-018-PERF-01` 行 ID）· `matchLen=404` · `**partial**` 在 match 内 `+393`（ID 至 `\| **partial**` 的懒量 gap 实测 **376/400 = 94.00%**·r3 复算；r2 稿「371/92.75%」不确）→ **整段 match 起点判否定＝空转 / 跨行误弃**；此形改 **per-cell**（§2.1）。

**（note a）evaluator 本体 `uc-covered-evaluator.mjs:118`** 吃的是已解析 status 字符串直等比较——**词面风险不在 evaluator 层**，在 gatherer/cite 解析层（空窗定界＝本条，Ban 把修法错落 evaluator）。

**（note b）仓内否定感知先例（修向模板·但 status 臂不复用其词表）**：`uc-covered-real-gatherer.mjs:93-108` `gapClosedInText`——CLOSED/已关 匹配配 **banNear 否定窗**（`:103` 词表逐字：`不得|禁止|\bBan\b|不可|未|不得写已关|\bnot\b|not\s+closed|≠\s*closed`）逐 hit 回看 **前 48 字 / 后 16 字**窗（`:108` `m.index - 48` · `:109` `+ 16` 亲证），窗内否定词即弃该 hit。该窗形服务的是**成对词**（CLOSED/已关 与否定词可相隔成句）语义，**与 status 词的紧邻否定语义不同**——r2 裁决 status 臂另立邻接表且**不复用 banNear**（§2）。

**（note c）`:752`/`:764` unknown→partial 兜底交互**：真矩阵 §1.1 statusCell 消费点 `:752` `cellStatus(row11?.[2] || row11?.[1] || 'partial')`（缺格时以字面 `'partial'` 兜底），返回 `'unknown'` 时又在 `:764` `status: s11Status === 'unknown' ? 'partial' : s11Status` 二次兜底为 `partial`。**后果**：否定感知修法若取「hit 级 skip → 全臂耗尽返 unknown」，§1.1 面**仍会由 :764 归为 partial**——故：①ARM 断言不得写「§1.1 由 partial 翻 unknown」；②§1.1 的否定形只能断言「不经 :752 的 `cellStatus` 直调结果」；③此交互属**登记**，改不改兜底链归协调方（本刀零触 :752/:764 代码）。**§10-③ 收官扩登（终态行号 `:890`/`:902`）**：gatherer `buildCol` `:756` 兜底式 `nhpRow?.status !== 'unknown' ? … : cellStatus(statusCell)` **同属掩蔽链**——`parseNhpRow` 的否定弃尽 `unknown` 被 matrix 格重算覆盖，故 #9/#10 的 NHP 面 `unknown` 经 `gatherRealUc018` **不可观测**；否定形断言只对直调 `parseNhpRow`/`cellStatus` 成立。

**（note d）pin 断言 site 零触名单（r2 单列·非状态解析）**：以下 `\bpartial\b` 命中系**文档 pin 断言**（对 harness/eval/backlog 文本做词面在场断言），**不是状态解析**；**仓级 `\bpartial\b` 替换/统一改写会打断 pin 门**（把断言词一起改掉）——EXEC 修法须逐 site 定向改解析函数，**Ban 全仓 find-replace**：
- `uc-e2e-018-sole-stack-pg-retained.proof.mjs:144` / `:181` / `:239`
- `uc-e2e-018-covered-lift.proof.mjs:265` / `:344` / `:357`
- `uc-e2e-018-covered-lift-reassess.proof.mjs:396` / `:474` / `:491`
- `eval-harness-matrix-cite.proof.mjs:35` / `:322`（assertPins 文档 pin 块区，跨 `:35–:322`）

**（note d-1）absence 断言族（r3 增列·r4 补全·同属零触）**：以下系「must not be **covered**」类**缺席断言**（对矩阵/文档文本做反向在场断言），既非状态解析、也不得吃否定感知逻辑——它们扫的是**整行/全文**（`m.index` 指向行首 ID，正是本刀要消灭的锚点病）；而 `matrix:202` 行尾 `非 covered` 与状态格同处一行，套上 helper 会让 `:676` 类断言**改判**（假通过/假失败两向都有可能）。该格正是本刀 sweep 观测面（§2.3「全表 sweep」）——**断言层与解析层必须分开动**。**零触**：
- `eval-harness-matrix-cite.proof.mjs:676-677`（PRIVACY-HTTP must not be false covered）/ `:681-682`（UC-E2E-017）/ `:690-691`（UC-E2E-015）
- **`eval-harness-matrix-cite.proof.mjs:673-819` 整块**（r4 补全·r5 更正边界：matrix absence/negative 断言族整段，含 `:676`/`:681`/`:690` 与 `:807-818`（UC-E2E-031/032 + `releaseEvidence=false`）；该块统一以 `[^\n]*\*\*covered\*\*`/`\*\*partial\*\*` 整行判，**整块零触**）
- `uc-e2e-018-sole-stack-pg-retained.proof.mjs:205`（`[/UC-E2E-018[^\n]*\*\*partial\*\*/i, …]` assertPins）
- `uc-e2e-018-covered-lift.proof.mjs:305`（`canHonestlyFlip=false` 分支的 stays-**partial** 断言）
- **`eval-uc-e2e-001-002-cite.proof.mjs:33` / `:60`**（**r5 更正锚点**：`[/≠\s*covered|不得.*covered|禁止.*covered|非.*covered/i, '≠ covered honesty']` 类否定形 pin 在 `:33`（UC-001）与 `:60`（UC-002·尾支 `partial\s*≠\s*covered`）；属文档 pin 非状态解析，**零触**。原 r4 稿引 `:36`/`:63` **错位**——该两行实为 `matrixStatusRe`（`UC-E2E-001/002[^\n]*\*\*partial\*\*` 行内 partial 在场断言），其邻行 `:37`/`:64` 为 `matrixForbidCovered`；同属文档 pin·**零触**）

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
- **r2 补测·host 层可承载性（决定 NEG 臂宿主·r3 更正措辞·r4 修正 lift 事实）**：criterion 的断言走 `lines.push` 缓冲、崩于 `:584` 前不 flush → **0 PASS/0 FAIL**（零断言输出）——该宿主**不能承载**任何 NEG 臂断言（崩前零可见）。**cite** 无 `:584` 类崩溃点 → 缓冲**必达** `:821` `console.log(lines.join('\n'))` flush（r3 亲点 `:821`）→ 可承载；**criterion 崩前不 flush** → 不可承载。`reassess` 同走缓冲、flush 于 `:517`（r3 亲点），**已 import** `assertCleanPorcelain`（`:21`）→ 会 `DIRTY_TREE` 拒跑，仅清场后承载。`lift` 同走缓冲、flush 于 `:371`（r3 亲点），**无 porcelain 门**（**r4 更正**：`:20-22` 仅 import `node:fs`/`node:path`/`node:url`，未 import `assertCleanPorcelain`）→ **不会 `DIRTY_TREE` 拒跑**；其置门序末位仅因 `:220` `writeFileSync` 产物写盘（§2.4）。**criterion 仍零承载**（§2.6 三宿主分工）。

### 1.5 登记原文三处（逐字亲读）

- gap-bug-backlog `:37`：`| C-WORD-NEG | P2 | \bpartial\b 误匹配 「not partial」 | word-boundary / negation-aware status parse | e2e | follow-up | covered-criterion review residual |`
- harness/uc-e2e-018-receipt-backfill `:61`：`- **C-WORD-NEG**: \bpartial\b matches 「not partial」— register only; fix may be later`
- 残余出处 review `:250`/`:260`（`receipts/archive/2026-09-batch23/reviews/…uc-e2e-052-checkpoint-physical-mw-e2e-ha.md`·append-only 引证零触）。

## 2. NEG 臂设计（rev r4 钉死 · 后继 EXEC 拟面 · 本卷零码动）

**修向（登记目标列逐字）**：word-boundary / negation-aware status parse——给 status 词面 hit 加否定判定；**修法落 gatherer/cite 解析层七 site＝11 个函数（§1.1 · §2.6 逐一列名），Ban 落 evaluator**。注入→断言**拒收**（具名形：拒归 `partial`/`covered` 等被否定 status）。

### 2.1 判准形（r2 裁决「后向邻接」+ r3 锚点分形钉死）

- **判定**：否定词元**紧邻 status 词元之前**（中间只允许空白/标点/星号/下划线/波浪/破折号/冒号/中英文括号/方括号/花括号/竖线/逗号顿号分号）→ **弃该 hit**；**永不检查 hit 后缀**；**不做 48 字回看**（r1 的「前 48/后 16」对称窗**作废**，本卷不留备选）。
- **锚点规则（r3 P1·单一规则·按 site 作用域分四形）**：否定判定的作用点是**状态词元自身的起始 offset**，**不是整段 match 的起点**。r2 稿「七 site 统一签名 `isNegatedHit(text, matchIndex, matchLen)`」对跨格/整行正则**不成立**（实测反证见下），r3 分形钉死；r4 更正为**四形**（下表四行：单 token / 多 token / 跨格跨行 / 整行哨兵）：

  | 作用域 | 赋值形 | 适用函数（§2.6 编号） |
  |---|---|---|
  | 单元格·**单 token 臂** | 臂内 hit 起点 `m.index`（此时 match 起点 ≡ 词元起点） | 1 legacy018 · 3 gatherer cellStatus · 4 parseNhpRow（per-cell 后）· 5 reassess cellStatus · 7 advIsBlind · 8 advIsPartial · 11 cell102 |
  | 单元格·**多 token 臂** | **词元子偏移**（stillRe 取 group 2 偏移；`still…honesty-pin` 取 `honesty-pin` 偏移） | 2 cellStatusConservative（`:456` · `:461`；终态行号见 §10 重锚表 `:458` · `:466`）——**§10-① 收官登记：该臂对终值结构性冗余（generic 六词循环同判）·判别力主张撤回·不补 ARM-3b** |
  | **跨格/跨行** | **per-cell**：先按未转义竖线切格，只对 status 格（index 7）取判定 | 9 nhpPerfPartial · 10 nhpLoadPartial（r3 择形·r4 维持） |
  | **整行哨兵** | **hit 子偏移** `m.index + m[0].toLowerCase().lastIndexOf('**blind**')`（r4 更正：`/i` 正则匹配与 `lastIndexOf` 大小写先统一小写；alt1/alt2 以 `**blind**` 收尾、alt3 以 `**blind**\s*\|` 收尾，`lastIndexOf('**blind**')` 仍返回词元起点） | 6 advBlind（r3 择形·r4 公式更正） |

- **择形理由（钉死·不再二择一活口）**：①`reassess :172-175` 取 **per-cell**——推荐形，**同时消 400 字预算耦合**（§「400 字预算」）；②`lift :125` `advBlind` 取 **hit 子偏移**——其为**整行哨兵**（三 alt 中 alt2 带 `ADV` 邻近约束、alt3 带整格锚），强行 per-cell 须重定义 alt2 语义（越出本刀），而子偏移**保持三 alt 字面量与真值语义不变、只换锚点**，最小改；③**Ban 把整段 match 起点直传 `isNegatedHit`**（即 r2 形），两类 site 均属此禁。
- **整行哨兵末位登记（r4 P2·r6 事实更正）**：公式取**行内最后一个 `**blind**`**（`lastIndexOf`）——**ARM-6c 依赖该次序**（合成行只有一个 `**blind**`）；**登记副作用**：若真实行内先有正向 `**blind**`、后跟叙事性否定 `not **blind**`，末位取到的是被否定词元 → 哨兵可能由 true 翻 false（**叙事性否定可翻哨兵**）。**r6 事实更正**：真 §1.0.1 `matrix:123` **并非「无 `**blind**`」**——其备注叙事含 **1 处 `**blind**`**（「refuse ADV was **blind** · tip `abfbbc0` · retained」）；`advBlind` **修前修后均 `true`**，由该叙事词驱动（`was` 非否定词元·per-hit 否定不弃）。故 **EXEC 断言不得写「真行无 `**blind**`」、不得对真行断言 `advBlind=false`**——**只对合成行（ARM-6c）断言 false**，或对真行**只 pin 现值 `true`**（修前修后恒等）；**Ban 把该末位规则写成对任意多 `**blind**` 行恒真**。
- **实测反证（r3 亲跑·`node` 对真仓文本）**：①`reassess :172` 字面量对 `non-happy-path-perf-load-case-matrix.md` 实测 `m.index=14344`（指向 `NHP-018-PERF-01` 行 ID）、`matchLen=404`、`**partial**` 在 match 内 `+393` → `isNegatedHit(text, m.index)` 判的是**行 ID 之前约 14KB 前缀** → 恒不命中（**空转**），或上一行行尾恰有否定词元时**跨行误弃**；②`lift :125` alt1 对真 §1.0.1 行实测行内 `m.index=0`、`matchLen=315`、`**blind**` 在 `+306` → 同为空转。故 r3 **必禁**整段 match 起点形。
- **matcher 逐字（单一 helper·gatherer export·r3 删未用 `matchLen` 形参）**：

```js
// scripts/lib/uc-covered-real-gatherer.mjs —— 新增 export（唯一判定入口）
const NEG_STATUS = /(?:\bnot\b|\bno\b|\bnon-?|非)[\s*_~\-–—:：()（）\[\]{}|,，、；;]*$/i;
export function isNegatedHit(text, hitIndex) {
  // hitIndex = 状态词元的起始 offset（§2.1 锚点规则；非整段 match 起点）
  // 不使用 matchLen / 不检查 hit 后缀 —— r2 裁决保留，r3 删形参（no-unused-vars 风险）
  return NEG_STATUS.test(text.slice(0, hitIndex));
}
```

- **实现钉死（r3·单 arm 单正则 exec 循环·r4 更正伪证）**：每个臂必须用**一条正则 + `exec` 循环**，命中被弃后 `lastIndex` **已越过整段 match** 才续查。**r4 更正**：r3 稿「分拆 alt 会假绿（`not **partial**` 在 index 6 命中内层 `partial`，前导 `**` 非否定）」**实测不成立**——`*`/空格均在分隔符类内，index 6 裸 hit 同样被否定 → 本例分拆与单正则**同值**。保留单正则 exec 的**唯一理由＝降低漏接 helper 的实现漂移风险**（每臂一处循环），**不再主张判别力差异**；**若坚持 Ban 分拆须给真反例**（本卷未发现，故**不 Ban 分拆**）。**真反例在 `.test()` 单点判**：`not partial · partial` 对 `\bpartial\b` 的**首个** hit 在 index 4 被否定，`.test()` 单点判会整体返 false → **漏掉 index 14 的第二个正向 hit**（exec 循环实测返 `partial`；**r5 更正**：原稿 index 12 不确）——故 **Ban 以状态词臂的 `.test()` 单点判定替代 `exec` 循环**（**r6 限定**：禁令只针对「用 `.test()` 判状态词臂命中并据以短路/赋值」；**helper 本体内部的 `.test()` 不受禁**，如 `isNegatedHit` 的 `NEG_STATUS.test(...)`）。**exec 循环 `lastIndex` 卫生（r6 补）**：`g`/`y` 正则弃 hit 续查前须令 `lastIndex` **越过整段 match**，或**每次迭代重置 `re.lastIndex = 0` / 每臂新建正则**——沿 `cellStatusConservative` `:462-465` 逐词 `new RegExp` 先例；**Ban 复用上轮残留 `lastIndex` 导致漏 hit**。
- **词元表钉死（status 臂独立表·不复用 banNear）**，逐项：
  - `\bnot\b` · `\bno\b` · `\bnon-?` · `非`（**仅邻接形**：`非` 与 hit 之间只能隔分隔符；等价旧建议式 `非\s*(?=status)`，但统一由本 matcher 的 `非` 分支承担）。**字面统一（r3）**：唯一形 `\bnon-?`（**无尾 `\b`**）；r2 稿词表写 `\bnon-?\b` 与实码 `:136` 不一致——实测 `\bnon-?\b$` 对 `non-` **不成立**（`-` 与串尾之间无 `\b`），故**以实码形 `\bnon-?` 为准**。
  - **`未` 不入表**：r2 实测裸 `未` 对「未进/未齐」误触发——**扩展前先收窄**，裸 `未` 留待专刀；`不得`/`禁止`/`Ban`/`不可` 同不入 status 表（仅 `gapClosedInText` 的 banNear 保留）。
  - **中文否定收窄登记（r3 增列·留待专刀）**：实测 `不是 **partial**` / `无 **partial**` / `没有 **partial**` **仍返 `partial`**（未入表＝已知缺口·与 `未` 同格登记）；**`并非 **partial**` 不属缺口**（r3 实测返 `unknown`——`非` 邻接分支连带命中），r3 稿曾误列，**如实更正·勿重复登记**。
  - **裸 `非` 禁全文匹配**：只许本 matcher 邻接分支；`非常 **partial**` / `非空 **gap**` 不误抑（r3 复测仍成立）。
  - **分隔符类＝「标点」措辞对齐（r3）**：本卷「标点」一律指 `[\s*_~\-–—:：()（）\[\]{}|,，、；;]`（空白/星号/下划线/波浪/破折/连接号/冒号/中英括号/方括/花括/竖线/逗号顿号分号）——**该字符类即定义，别处不再另立「标点」义**。**（r8 登记）`.`/`。` 不入该类**——`not. partial` **不承诺**被否定（点号切断邻接），EXEC 不得为该形设臂、不得扩类收编。
  - **`\bnot\b` 对 SCREAMING-KEBAB 枚举的假阳性登记（r8 P2·登记例外·不改 matcher）**：`matrix:177`（UC-E2E-011）备注格含 `STATUS-NOT-COVERED`，`\bnot\b` 会命其中 `NOT`，再借分隔符类中的 `-` 紧邻其后的 `covered` 正向 hit → **误判为否定**（r8 探针：该格 `covered` 命中在字符偏移 **1317** 处被弃）。**当前被同格 GAP 掩蔽**——同一格另有多枚 `gap` 正向命中，conservative min 仍 `gap`、解析值不变，**非现行误判**。**本卷如实登记为例外**；matcher 未加 `(?![A-Z])` 上下文排除（零语义变更·时间盒）；EXEC 若采上下文排除，须重跑 §2.3 全表 sweep 并复核本格。
  - **为何不复用 banNear**：banNear 服务 `gapClosedInText` 的**成对词窗**语义（CLOSED/已关 与否定词可相隔 ≤48/16 字仍算成对），与 status 词的**紧邻否定**语义不同；共享会把闭包判定拖进 status 域（同一 `no` 在两域含义不同），且会连带把 `未`/`≠ closed` 等闭包专用词元带入 status 臂。**两表独立维护**：改 status 表不动 banNear，反之亦然。
  - **单一 helper 落位**：`isNegatedHit` 落 `uc-covered-real-gatherer.mjs` 并 export；**11 个函数全共用**（cite legacy018/conservative 与 reassess/lift 各件从 gatherer import——gatherer 为纯模块、顶层零副作用，已有 `assertCleanPorcelain` import 先例）。**修法即测法**：同一 helper 既实现又作为断言对象，杜绝两处实现漂移。
- **第二通路与守卫子句（r3 P2·r4 改定性）**：
  - **第二通路同走 helper（非「必修」定性）**：`cite :461` `if (/still[^\n]{0,40}honesty-pin/i.test(c)) found.push('honesty-pin')` **绕过 `:456` exec 循环** → 为统一实现**同走 helper**（取 `honesty-pin` 词元子偏移）。**r4 更正**：该通路**拦不住** `not still honesty-pin`——其前缀 `not still ` 中 `still` **不在分隔符类**，否定词元并未紧邻 `honesty-pin`；该形**不在邻接语义内·不设臂**（与「否定词元紧邻 status 词元」总则自洽）。主通路同形 `not still partial`（conservative `:456` stillRe）**同样不被否定**（r4 实测返 `partial`），**一并登记·不设臂**。r3 稿「否则该形仍被推入 found」的**必修定性删除**（不构成缺口）。
  - **复合守卫子句明文登记为已知例外（不改）**：`cite :431` / `reassess :109` 的 `!/\*\*partial\*\*|\*\*covered\*\*/.test(c)` 裸守卫**保持裸判**——该子句只决定 blind 臂**优先级**、不赋 status；保持裸判只会**少赋**（否定 `**partial**` 在场时 blind 臂被让位，最终落 `unknown`/更弱），**方向为 fail-closed**，不会多赋。**不对称登记在此**：EXEC 不改该守卫、不为该形设注入臂；若协调方要求统一，须另立注入臂并重测（本卷不预登）。
- **per-cell 落地（`parseNhpRow` · r2 钉死 · r3 补 index 口径）**：
  - **先按未转义竖线切格**（r4 钉死口径：**只把 `\|`（反斜线紧邻竖线）视为非分隔**；其余 `|` 一律切格；单个反斜线若其后非 `|`，不改变后续 `|` 的分隔性），**status 格＝整行第 8 列**（`| id | UC | facet | owner | injection | expectation | status | notes |`；0-based index 7），**只对该格取否定判定**；列数不足 → fail-closed `unknown`（登记）。
  - **index 口径（r3）**：`split('|')` 的**首元素是空串**（行首 `|`），故 status 在 **index 7**（非 6）；`|` 分隔共 10 段（含首尾空串）。
  - **实证必要性**：`NHP-018-BOUND-01` 注入格含 `` `created\|active\|waiting_user` ``（转义竖线）；**裸 `split('|')` 该行得 12 段、status 漂到 index 9 → 解析值 `partial`→`unknown`**（r3 实测 12 vs 未转义切格 10），**直接破 ARM-4b**。故切格必须忽略 `\|`，否则 per-cell 落地自身制造回归。
- **400 字预算（r3）**：**采 per-cell ⇒ `[\s\S]{0,400}?` 预算耦合消除**（不再有「中段余量耗尽即漏判」面）。登记原字面量实测余量以备查：`reassess :172` 懒量 gap **376/400 = 94.00%**（r2 稿「371/400=92.75%」不确·r3 逐字符复算：`matchLen 404 = ID 15 + gap 376 + tail 13`）；沿用 span 形则须登记「行编辑须复测·跨行误中下一行 status 仍 true 假绿」——**本卷不采 span 形**。
- **归法**：**hit 级 skip**——对每个词面臂的每个 hit 用 `isNegatedHit` 判定，命中否定则**弃该 hit、续查同一臂的后续 hit，臂尽续后续臂**；**全臂耗尽仍无正向 hit 才返 `unknown`**。conservative 侧同法：否定 hit 不入 `found`，**按剩余 `found` 重算 min**——**若被否定的是最低 rank 词元，则 min 抬升**（`ARM-3` 拉低形即此：`still **partial**（not gap）` 的 `gap` 被弃后 `gap→partial`）；不短路。**Ban cell 级 fail-closed**——整格直判 `unknown` 与 ARM-2 期望直接矛盾，禁用。
- **尾臂否定判定钉死（r4 P3·r5 拆开 site 3）**：**site 1/5**（cite `cellStatusLegacy018` `:435` · reassess `cellStatus` `:113`）的末位臂 `/not_run|case-only|blocked/i → 'blind'` **同为词面臂、同走 helper，不设豁免活口**；conservative 的 found-空兜底 `/not_run|blocked/`（`:467`）同形。**site 3（gatherer `cellStatus:70-77`）无此末位臂**——其 `case-only` 分支（**`:74`**）自身即返 `'case-only'`，其后仅 blind/gap/unknown。**登记行为变更**：site 1/5 的 `not case-only` / `not blocked` 由 **`blind`→`unknown`**（否定命中被弃、无更低臂可兜）；**site 3** 的 `not case-only` 由 **`case-only`→`unknown`**（`case-only` 臂同接 helper·r5 实测），`not blocked` / `not_run` 基线已 `unknown`·**无变化**；site 1/5 的 `not_run` **不受影响**（`_` 为词字符，`\bnot\b` 在 `not_run` 内不成立，且其 hit 前缀为空）——r5 实测三形如上。如协调方要求保留 `blind`，须另立例外并重测（**本卷不预登、不设臂**）。
- **可测性（r3 扩到 11 函数·r4 补提取签名）**：取 **①直 import**——gatherer 增 export `cellStatus` / `parseNhpRow` / `isNegatedHit`，引用件直调断言。**②公共入口不可用**：`gatherRealUc018` 的 `:752`/`:764` 会把 `unknown` 兜成 `partial`，ARM-2 期望的 `unknown` 在公共入口**不可观测**。**③inline 派生须提函数（r4 补全）**：`advBlind`（lift `:125-127`）→ **`advBlindOf(text)`**（**签名收 `text` 而非 `line`**：alt2/alt3 作用于**全 matrix**，若收单行会**静默丢弃他行命中面**；生产调用传全 `matrix`，**ARM-6c 传合成行**）；`advIsBlind`（`:132`）→ **`advIsBlindOf(cell)`**；`advIsPartial`（`:139`）→ **`advIsPartialOf(cell)`**；`nhpPerfPartial`·`nhpLoadPartial`（reassess `:172-173`）→ **`nhpRowPartial(text, id)`**（同为 inline 常量，不提函数则注入臂不可写）。`cell102` 已是箭头函数、`nhpPerfCaseOnly`/`nhpLoadCaseOnly` 随 9/10 同改（臂为 `case-only`·不另立注入臂）。宿主分工见 §2.6。
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
| `#4` | **整行夹具** `\| NHP-018-FAULT-01 \| 018 \| FAULT \| api \| inj \| exp \| not **partial** \| notes \|`（status 格 **index 7**=`not **partial**`） | `partial` | `unknown` | `unknown` | `:86` | 真红（粗体否定·整行夹具） |

**（`#4` 标注更正 r8 P3）**：该臂期望值＝`unknown`，**不能区分「恰接 per-cell 否定」与「全格 fail-closed」**——原标注「防 fail-closed 假绿」系**过度声明·已删**；正向方向由 ARM-1 五臂 / ARM-2 / ARM-3 的**非 unknown 期望值**承担。**不得**据此臂宣称 fail-closed 判别力（补正向臂须另立并重算 17）。

**（表注 r3·r6 统一 §2.6 函数编号）** 上表 13 行仅覆 **§2.6 函数 #1–#4**（cite legacy018/conservative/`#4`→gatherer parseNhpRow）——**函数 #5–#11 零臂**，故 r3 增列下表 2.3.1（两席 P1 同判：验收面 4/11 不可证伪）。**本卷此后以 §2.6 函数编号 #1–#11 指代，不再用易混的 site 编号指代函数。** **臂→函数以本 §2.3/§2.3.1 对码列为准·§2.6「注入臂 / 宿主」列不得扩展（r8 P1）**：§2.6 行 1 曾写 `ARM-1/2/3`，照该列落臂会造**恒红**（ARM-2 `**case-only**（not partial）` 在 legacy018 修后返 `'blind'`，§2.2 期望 `case-only`）与**零 delta**（ARM-3 拉低 `still **partial**（not gap）` 基线 `'partial'`＝修后 `'partial'`）→ 17 格恰红不可达。

**§2.3.1 补臂：函数 #5–#11 注入臂（r3 P1 · r4 补 #10·逐个亲测判别力）**

> 判别力口径：**基线值 ≠ 邻接形期望值** 才算「判别（可恰红）」；相等者只作守卫/回归锚，**不得计入 §2.5 恰红集**。全表 r3 以真件字面量亲跑，r4 对 ARM-7a/7c 夹具复跑（`/tmp` 脚本·stdout 即弃）。

| 臂 | 函数·码锚 | 注入 | 基线 | 邻接形期望 | 判别 |
|---|---|---|---|---|---|
| ARM-5 | reassess `cellStatus`（§2.6-5 `:107`/`:109`） | `not **blind**` | `blind` | `unknown` | **判别**（恰红） |
| ARM-6a | lift `advIsBlind`（§2.6-7 `:132`） | `not **blind**` | `true` | `false` | **判别**（恰红） |
| ARM-6b | lift `advIsPartial`（§2.6-8 `:139`） | `**case-only**（not partial）` | `true` | `false` | **判别**（恰红） |
| ARM-6c | lift `advBlind`（§2.6-6 `:125`·整行哨兵·合成行） | `\| UC-E2E-018 \| **partial** \| **partial** \| **partial** \| not **blind** \|` | `true` | `false` | **判别**（恰红·**本体＝hit 子偏移**）；**buggy 复跑另记**：以 buggy 锚点 `m.index` 直传时本臂**必仍 true**（空转反证）——该复跑**非臂、不入 17 格**（§2.5 机制反证）；**本体与复跑两形文案须分开写**，不得混述 |
| ARM-7a | reassess `nhpPerfPartial`（§2.6-9 `:172`·per-cell·合成行·**r4 替换夹具**） | `\| NHP-018-PERF-01 \| 018 \| PERF \| api \| **partial** \| exp \| not **partial** \| notes \|` | `true` | `false` | **判别**（恰红·per-cell 后 span 预算不参与） |
| ARM-7c | reassess `nhpLoadPartial`（§2.6-10 `:173`·per-cell·合成行·**r4 镜像臂**） | `\| NHP-018-LOAD-01 \| 018 \| LOAD \| api \| **partial** \| exp \| not **partial** \| notes \|` | `true` | `false` | **判别**（恰红·与 ARM-7a 同形镜像） |
| ARM-7b | reassess `cell102`（§2.6-11 `:179`） | `not **partial**` | `'partial'` | `'blind'`（cell102 兜底支） | **判别**（恰红·断言写 `!== 'partial'` 亦可） |

- **ARM-7a/7c 夹具替换理由（r4 P1）**：r3 夹具 `… | inj | exp | not **partial** | …` 的 status 格 `|` 后是 `not`，现行 span 形要求 `|` 后**紧接** `**partial**` → 该行 span **返 false**，与「基线 true」矛盾（两席亲跑同判·假值）。r4 采席2 形：注入格置 `**partial**`，使旧 span **自合成行行 ID 偏移 2 起匹配**（`NHP-018-PERF-01` 起始；注入格＝**cell 5**；`**partial**` 绝对偏移 **39**）→ **基线确为 true**；per-cell 修法取 **cell 7** `not **partial**` → helper 否定 → **false**。该形**既判 true→false 翻转、又能识别「未接 per-cell」**（若不切格而整行判，注入格 `**partial**` 仍正向命中 → 臂不红）。ARM-7c 以 `NHP-018-LOAD-01` 同形镜像。
- **不作臂的候选（r3 实测否定）**：`cellStatus('not **blind**（**partial**）')` → 基线与邻接形**同为 `partial`**（blind 臂被复合守卫让位、partial 命中未被否定）→ **非判别·不采用**；其存在即「守卫子句不对称」的实例（§2.1 已登记）。**协调方原示例以此形为 site 5 臂，r3 实测不可恰红，改用 `not **blind**`**（如实上报偏离，非降标）。
- **site 3 `case-only` 子臂登记排除（r6 P1 裁决 (b)·不补臂）**：gatherer `cellStatus` **`:74` `case-only` 子臂**明文**登记排除**——仅以 probe 复现（`not case-only` 基线 `case-only` → 修后 `unknown`，r6 亲跑可达），**不入 17 格恰红集·不设注入臂**；**验收口径＝函数级主臂 + 已声明子臂两级**：11 函数主臂必设注入/同改落点，已声明子臂（本条）只登记 probe。理由：时间盒（P3 级小刀已 6 轮）·补臂需连带改 17→18/19 多处计数再引新一轮风险；**半修态盲区**（`partial` 臂已接 · `:74` 未接 → 17 臂仍全绿）随本条**显式登记**，不构成未登记缺口。
- **宿主**：ARM-5/7a/7c/7b 落 `reassess` prove；ARM-6a/6b/6c 落 `lift` prove；ARM-1/2/3/`#4` 落 `cite` prove（§2.6 三宿主分工）。**cite 10 臂分账（r8 P1·§2.4-4/§2.5 同值）**：**`cite 10 = #1 五（ARM-1）+ #2 二（ARM-3 两红）+ #3 二（ARM-2 两红）+ #4 一`**；**臂→函数以本表对码列为准·§2.6「注入臂 / 宿主」列不得扩展**（§2.6 行 1 只记 `ARM-1（五）`）。

**真矩阵面**（邻接形恒等性·r3 口径收窄为 **60 UC 行 × 312 非空格**；**行集定义（r6 补）**：`e2e-requirement-coverage-matrix.md` 表格行中**首格（行首 `|` 后第一格）以 `UC-E2E` 开头**者＝**60 行**，非空单元格（含首格）合计 **312 格**；r6 亲跑 `node` 复算 60/312 同值——**不得**以「全表 200 数据行/858 非空格」冒充该口径）：

| 解析器 | 邻接形变化面（60 UC 行/312 非空格） | r1 48/16 形变化面（**量级示意·不可逐格复算**） |
|---|---|---|
| gatherer `cellStatus` | **0 格 / 0 行** | 24 格 / 17 行 |
| cite `cellStatusLegacy018` | **0 / 0** | 12 格 / 9 行 |
| cite `cellStatusConservative` | **0 / 0** | 9 格 / 8 行（含 `:182`、`:190`） |
| `parseNhpRow`（NHP-018 六行） | **0**（whole-row 与 status-cell 同值·r3 复测六行） | `NHP-018-LOAD-01` partial→unknown |
| reassess `nhpPerfPartial`/`nhpLoadPartial` | **0**（true→true·r3 复测六行） | true→false |
| lift `advIsBlind`/`advIsPartial` | **0**（真 ADV 格＝`**partial**`） | **0**（r2 亲核） |

**全表 sweep**（r3 新增·**行集定义：剔除 17 条 `|---|` 分隔行后＝200 表格行 / 858 非空单元格**·超 UC 集口径）：conservative **flips=1**——`matrix:202`（PRIVACY-HTTP 行）备注格「业务验收 pin；**本绿≠产品删除闭环**；DELETE=503；BUG-PRIV-503；**非 covered**」`covered → unknown`。**此格为本刀 sweep 观测面：无生产消费点 / 无门输出变化——仅证保守解析对该否定形不再正向赋 `covered`**（conservative 由 row 面 weakest 降为 fail-closed），**不是回归**；gatherer `cellStatus`/`legacy018` 全表 **0 flip**（二者 covered 仅粗体臂，`非 covered` 本不命中）。**登记三条**：①EXEC 全表 sweep **必见**此 1 格——**Ban 当回归处置 / Ban 据此回退修法**；②**Ban 改 `matrix:202` 文本或其格值**（SSOT 行翻面权归协调方）；③absence 断言族（§1.1 note d-1）零触——该格文本恰被 `cite :676` 类缺席断言读取，改解析器不得连带动那批断言。

**r1 窗形反证（为何「逐列恒等」不可满足·数字为量级示意）**：r1 窗形下变化面**不止两席列举的 `:125`/`:182`/`:190` 三行**——r2 复算 gatherer 17 行/24 格、legacy018 9 行/12 格、conservative 8 行/9 格（三行均在其内；**17/9/8 系一次性复算值·不可逐格复现，仅作量级示意**），且 `NHP-018-LOAD-01` 与 PERF/LOAD 判定同期翻转；**根因**＝48 字回看把叙事文本里的 `未`/`not`/`NO` 等计入（`未改 proof`、`未进`、`七类未齐`、`≠ covered` 旁证），**窗形与「紧邻否定」语义不匹配**。结论方向与两席同判一致（r1 形不可满足恒等），**仅量级更正**（三行为子集，非全集）——r2 已按裁决改钉邻接形。

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

**ARM-4b｜被断言格解析值恒等**（r2 **删**「全矩阵逐列恒等·live vocabulary unused」不可满足断言——r1 窗形下广义变化面已实测 ≥17 行，该断言与任何回看窗形互斥；**r3 口径再收窄**：邻接形实测**不是**「全矩阵零变化」，而是「60 UC 行/312 非空格零变化 + 全表 sweep 观测面 1 格（`matrix:202` 备注格·§2.3 全表 sweep·**无生产消费点/无门输出变化**）」），故**断言口径只锁被断言格**、不写全矩阵、也不写「全表恒等」）。断言面＝**被断言格**：§1.0.1 UC-018 四格（`:123` NEG/FAULT/BOUND/ADV）· §1.1 UC-018 格（`:183` row11）· NHP-018 六行 `parseNhpRow` status · reassess PERF/LOAD 判定 · lift `advIsBlind`/`advIsPartial`/`advBlind` · cite 自测既有输入（`:594-624` 零删改·additive restatement）· **`gapClosedInText` / `businessPathMet` / `openGaps` 真实输入恒等**（banNear 零触、helper 独立表 → 结构上 byte-identical，仍须断言亲证）。**r3 实测锚（亲跑）**：邻接形对 **60 UC 行/312 非空格** × 3 parser **零变化**；**全表 sweep（行集定义：剔除 17 条 `|---|` 分隔行＝200 行/858 非空单元格）conservative 恰 1 格变化（`matrix:202`·观测面·非回归·仅证不再正向赋 covered）**；NHP-018 六行零变化（per-cell 六行 status 全等）；PERF/LOAD true→true；`advIsBlind`/`advIsPartial` 零变化。

**ARM-4 门序钉死（r3 修正·r4 加第 0 步·顺序本身即断言）**：
0. **ARM-4a 同树修前 B0 / 修后 B1（r7 P2·判据换锚）**：
   0a. **清场后先取同树修前 B0**：按第 1 步同一动作移出 evidence（**在 H0 保管区落一次副本**·**该区只在本次首轮清场写一次·Ban 覆盖**）+ 清两类探针 → `git status --porcelain` 净（**artifact 已移出**）→ 在**未落修法**的同树上按**固定序 `cite→criterion→reassess→lift`** 跑四 prove，逐字保存 FAIL 文字集 **B0**（criterion 仍崩 `:584`·零断言；**前序 cite/criterion/reassess 均不 `DIRTY_TREE`**）。**批末处置（r8 P1）**：`lift :220` 无条件写盘 → 批末树内必有 **H′**；**跑完即把树内 H′ 移入独立弃置区**（路径与 H0 保管区**不同**；弃置区可清空/覆盖），**不得留在树内**——否则后序任何 porcelain 门（含 0b 提交后自检与 0c）现 `DIRTY_TREE`。
   0b. **落码 commit**（或等价净树）后才进 criterion/reassess 的 porcelain 门：清场核**只针对 gate artifact**（三类·§2.4-1），**不把本刀 tracked diff 当脏**；否则修码本身未提交即触 `DIRTY_TREE`——**自伤误判停手**（r4 P2）。**pathspec 钉死（r8 P2）**：**只 `git add scripts/*.mjs`（+本卷若需）**；**Ban `git add -A` / `git add .`**——0a 批末若尚有 untracked **H′** 在树内，误 add 会把它纳入 index（显示 `A`；随后的移出又显示 `D`）→ porcelain 仍脏且污染 commit。
   0c. **跑 B1**：修法落码后在同一树上按**同一固定序 `cite→criterion→reassess→lift`** 重跑四 prove，逐字保存 FAIL 文字集 **B1**；**批末同 0a 把树内 H′ 移入独立弃置区**（**不得写 H0 保管区**·不得留树内）。
   0d. **B0≡B1**：绝对路径前缀 `<worktree>/` 归一化后逐字比对；`EXIT=1` 为现值锚，但**只在 FAIL 集合逐字恒等时**才算恒等通过。**r2 的 39/15/21 降为交叉校验值，不作恒等锚**（届值/树形可变；三宿主 delta 会改变 PASS 面而不改 FAIL 集）。
1. **先移出 evidence（保 H0 副本）并清两类探针 → find 复核 → 清场核 → cite（r6 重写·r7 补 reassess 探针）**：进任何 porcelain 门前，**先**把 untracked lift evidence（`ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-covered-lift-evidence.json`）**移出工作区**到**固定 H0 保管区**并核 **H0 保管副本** hash（**H0=`9e541f5e…`**；**核 hash 对象＝保管副本·不是树内 artifact**；**H0 保管区只在本次首轮清场写一次·Ban 覆盖**（H′ 一律进独立弃置区））；**再**清理**两类探针**：①criterion `.tmp-porcelain-dirty-probe-uc018.txt`（**`:516` 定义路径 · `:517` `try` · `:518` `writeFileSync` 写 · `:527` `finally` · `:528` `rmSync`**；中断 SIGINT/`process.exit` 跳过 finally 时可能残留）；②reassess `.tmp-lift-porcelain-probe-uc018.txt`（**`:336` 定义 · `:338` `writeFileSync` 写 · `:343` `finally` · `:344` `rmSync`**；落**仓根**——`.gitignore:15` 的 `.tmp/` 只忽略该目录，**不覆盖**仓根同名探针）。清完跑 **`test -z "$(find <worktree-root> -maxdepth 1 -name '.tmp-*probe*' -print -quit)" || exit 1`**（零命中才续行·`|| exit 1` 即命中/失败即中止）；**然后**才跑 `git status --porcelain` **清场核**（未过即停手，不得带脏跑门）；清场核通过后才进 **cite**。**清场核范围（r5 钉死·r7 扩三类）**：**只核三类 gate artifact**——上述 evidence 与两类探针；**不把本刀 tracked diff 当脏**（未提交修码按第 0b 步先 commit/等价净树处理）。**副本保留至 §2.4-5 最终还原**——**Ban 把它当 tracked 改动 / 以它在场凑红凑绿**。**崩溃 gate 本轮输出作废**：清理后**重跑**，不得沿用崩溃轮的部分输出/计数。
2. **门序（r7 重排）＝移出 evidence（保 H0 副本）+ 清两类探针 → 清场核 → cite → criterion → reassess → lift（前先核 H0 保管副本·§2.4-3b）→ 移出 H′（独立弃置区）→ 半场门 → 负验证（§2.4-4）→ 回滚 neuter（→B1 态）→ 还原 H0 + 核 hash（§2.4-5·末步）**。**钉死理由（r3 P2·r4 去引述·r6 补 H0 目标·r7 门序重排）**：
   - **`criterion` 亦 `DIRTY_TREE` 面**——`uc-e2e-018-covered-criterion.proof.mjs:511`/`:521` 直调 `assertCleanPorcelain`（`:749` 亦调），且 `:533` 经 `gatherRealUc018` 命中 gatherer **`:522`** 内建检查（`reassess :72`/`:329` 同构）。**按实测事实**：criterion 与 reassess **均须排在 lift 之前**——lift `:220` 重写 artifact 后二者**必被 `DIRTY_TREE` 挡下** → **误判停手**（r3 稿引 r2「cite→criterion→lift→reassess」序列不实·r4 删，改按本条实测陈述）。
   - **任一 porcelain 门前**若树已含 artifact（例如上一门前序调整或中途 lift），须**先临时移出 → 跑 → 逐字节还原 + hash 核验**（`H0=H1`·r2/r3 两轮 `9e541f5e…`）。**崩溃/被杀路径（r5 补）**：若门中途崩溃或进程被杀死，致 artifact **已移出而未还原**——**只许从先前的副本逐字节还原（保 H0）**；**Ban 以重跑 lift 复位 hash**（`lift :220` 每次重写、`datePT` 变 → hash 变 → **`H0≠H1`**，还原核验失效）。
3. **`lift` 置门序末位**（`lift :220` `writeFileSync` 必重写 untracked evidence artifact → 树变脏）；lift 之后**不再跑任何 porcelain 门**。**r4 更正**：lift **本身无 porcelain 门**（`:20-22` 仅 node 内置 import），末位**只因产物写盘**，不因拒跑。
3b. **lift 前 H0 副本（r6 P2·r8 补保管口径）**：进 `lift` **前**确认 **H0 保管副本**已在**工作区外固定 H0 保管区**（第 1 步已写·**只写一次·Ban 覆盖**），并核**保管副本** hash（`9e541f5e2d4e165df661031a49e7e40f5ab2c452290f943cdfb50515caac922a`·**对象是保管副本**）；**Ban 以树内 artifact 或 H′ 为源重写 H0 保管区**。**两目标区分**：①**lift 前**（树内/移出面 artifact＝**H0**）供 porcelain 门移出/还原，对象是 **H0**；②**lift 后** `:216` `datePT` 变 + `:220` 无条件重写使树内 artifact＝**H'**（hash 必变，只证「lift 已跑」）——**最终还原对象仍是 H0 副本，不是 H'**；否则「保 H0」在 lift 后**不可达**。**Ban 用重跑 lift 复位 H0**（每次 `datePT` 变 → hash 变）。
4. **负验证（r7 方案 A·前移到最终还原 H0 之前·artifact 在工作区外时跑）**：ARM-4a/4b 基线（B0/B1）**先**完成；lift 后先把树内 **H′ 移出工作区**（半场门亦在此净态跑），再做 **ARM-5 负验证**——摘除 helper 须**临时 neuter commit** 使树净（否则 `reassess :72` `assertCleanPorcelain` 直接 `exit(1)`、**零断言**）。**neuter 语义钉死（r8 P2）**：**保留函数提取与臂接线**（`advBlindOf`/`advIsBlindOf`/`advIsPartialOf`/`nhpRowPartial` 等提取形与各臂接线**原样保留**），**仅令 `isNegatedHit` 恒返 `false`**；**Ban 回退到修法前源码**（提取函数消失 → 注入臂 `ReferenceError`，恰红不可得且误判）。
   **同一 neuter commit 下按固定序 `reassess→cite→lift` 顺序跑（r8 P1·不得真并发）**：
   - **reassess 4 臂**：`21+4=25 FAIL`（基线 21 + delta 4＝ARM-5/7a/7c/7b）；**以「25 − 21」逐字差集比对**——**4 是臂 delta，不是断言总数**。
   - **cite 10 臂**：`39+10=49 FAIL`（ARM-1 五 / ARM-2 二 / ARM-3 二 / `#4` 一）；跑前保持 artifact 在**工作区外**（**同批 `reassess :72` 与末段 docs:check 计面**均要求净树；**cite 宿主自身无 porcelain 门**）。
   - **lift 3 臂**：`15+3=18 FAIL`（ARM-6a/6b/6c）；**lift 末位**（`:220` 写盘）——**其后不得再跑任何 porcelain 门**。
   **三件 delta 合计 4+10+3=17**——**17 格恰红齐备后方可回滚 neuter commit**。**17 强制证据面（r8 P2）**：EXEC 收据**必须逐宿主列 `25−21`/`49−39`/`18−15` 的逐字差集（合计 17 行）或列三集合 hash**；只报单宿主或只报总数均不足。**Ban 只报 reassess 4 格＝以 4 冒充 17**（§8）；**Ban 把 25/49/18 记作「断言总数」**（它们是「基线 FAIL + 臂 delta」的 FAIL 计数）；**Ban 在脏树/负验证态下取 ARM-4 基线**（负验证态不得混入基线）；**Ban 三宿主真并发**（写盘/净树互踩）。
5. **末步：回滚 neuter commit（→B1 态）→ 移出 H′ → 还原 H0 → 核 hash（r7 方案 A·r8 补回滚路径）**：**先回滚 neg 验证的临时 neuter commit**——`git log -1 --format=%s` **自检 commit message 含 neuter 标记**（标记缺失即停手上报，不得盲回滚），再 `git revert --no-edit <neuter>` 或 `git reset --hard <B1 commit>`，回修法 commit；**回滚后实证**：`git rev-parse HEAD` 断言＝**B1 commit** 且 **17 臂复绿**（重跑三宿主对码）。**「还原 commit」只指回修法 commit（B1 态）·不是回基线 tip**（§2.5 ③ 同口径）。确认树内 artifact 已移出（H′ 在 §2.4-4 前已移出；若半场门/负验证轮回置则**再移出**），从 **H0 保管副本**逐字节还原到原路径，核 **`9e541f5e2d4e165df661031a49e7e40f5ab2c452290f943cdfb50515caac922a`**。半场门（docs:check 等按受管计面/`--others` 计数的门）须在 artifact 移出态跑（否则 docs:check 现扫 2449 > cap 2448·§6；**r4 届值**：本支 cap 仍 2448，origin/main 届值 2455 未并入）。**Ban 以还原 H′ 冒充 H0**（H′ 不是原始 artifact）。**崩溃/被杀路径（r5 补）**：若门中途崩溃/被杀致 artifact 已移出而未还原，**只许从 H0 副本逐字节还原·Ban 以重跑 lift 复位 hash**（`datePT` 变→hash 变→`H0≠H1`）。**崩溃轮门输出作废**，清理后重跑。
6. `DIRTY_TREE` **≠** 恒等通过——拒跑记作 `BLOCKED` 并停手上报，**不得**当作「无新增 FAIL」记绿。
7. **B0≡B1 与 ARM-4b**：四 prove 的 FAIL 集合逐字比对（§2.4-0d）后才可报 ARM-4a 恒等；被断言格逐格等值后才可报 ARM-4b 恒等。

**ARM-4 基线三类先在红承登（r2 不处置·沿 evap §0 分口）**：①**PTP-archive 迁移余波**（`e3502c0b6` git mv 后 proof 旧径读空——cite 38 FAIL + criterion `:584` 崩 + lift 15 + reassess 21 同因）；②**050–052 NEG case-only 漂移**（cite 唯一 1 drift FAIL·2026-10-27 开关刀 EXEC 副作用）；③**宿主/环境面**（criterion `cpSync` ENOENT 属宿主面先在崩溃；reassess/criterion 在本树 untracked artifact 在场时 `DIRTY_TREE` 拒跑属环境面）。**三类均系环境先在红·非本刀红**：本刀只承担「修法前后构成恒等」，**Ban 代偿**（不修 archive 路径、不修 050-052 断言、不删/移/改 `receipts/` 件以凑绿、不重建 `ai-docs/delivery/receipts/` 下缺失件）·**对齐与处置权归协调方**。**matrix `:306` 零触**：其 `EXIT 1（known RED）· FAIL=UC-018 facet[2]` 登记**构成已漂移**（facet[2] 现 PASS；红＝38 archive + 1 drift），本卷**只登记不改行**，**ARM-4 断言不得引该行为绿基线**（引之即假绿再现）。

### 2.5 ARM-5 负验证（恰红口径）

摘除否定判定（**保留函数提取与臂接线·仅令 `isNegatedHit` 恒返 `false`**；**Ban 回退裸词面/修法前源码**——提取函数消失即 `ReferenceError`）→ **对期望矩阵逐格恰红（r4 恰红集＝17 臂·不多不少；r3 为 16，r4 +ARM-7c）**：
- **site 1/2/3/4（r2 已有）10 臂**：ARM-1 五行真红、ARM-2 两行、ARM-3 两行、`#4` 一行；
- **函数 #5–#11（r3 补主面·r4 加 #10 ARM-7c）7 臂**：ARM-5 一行、ARM-6a/6b/6c 三行、ARM-7a/7c/7b 三行。
- **site 3 `case-only` 子臂（`:74`）登记排除（r6 P1 裁决 (b)）**：该子臂**不入 17 格恰红集**——仅 probe 复现 `not case-only`：基线 `case-only` → 修后 `unknown`（r6 亲跑可达）；**17 格恰红集只覆盖函数级主臂**（§2.6 #1–#11），子臂排除**不改变 17 计数**。**半修态**（`partial` 臂已接、`:74` `case-only` 臂未接 → 17 臂仍全绿）为本条**已登记排除的已知盲区**，**不是**本刀验收失败；如需子臂恰红须另立臂并重算 18/19。
- 合计 **17 格逐格 FAIL 可见**；**守卫臂三条**（`not covered` / `no covered` / `still **gap**（not partial）`）**保持绿**（若转红＝误杀，同样 FAIL 上报）→ 原样还原复绿。另 §2.1 **反误抑形**（`非常 **partial**` / `非空 **gap**`）在修法前后**均须**为 `partial`/`gap`（剥除 helper 后亦然——防「为抑否定而抑掉正形」）。假绿证伪＝否定臂有真实检出力（沿 pay-neg §9-EXEC 换序 FAIL 还原先例形）。
- **机制反证（非臂·r3 单列·r8 措辞区分）**：**ARM-6c 本体**（hit 子偏移·§2.1 整行哨兵形）随修法 `true→false`，是 17 格之一；**buggy 复跑**另记——`isNegatedHit(text, m.index)` 直传整段 match 起点时 ARM-6c **必然仍返回 `true`**（空转），此即两席 P1 的实证。**本体与复跑两条文案分开写、分开计数**：复跑**只作反证、非臂、不入 17 格**（它不随修法转红，因它本身就是错形）。
- **判据**：17 格**全红**才算恰红；**任一格不红＝该 site 未接线**（r2 版即此病：函数 #5–#11 全无臂 → 全修与半修**同绿**；r3 版 #10 无臂 → 同病，r4 补 ARM-7c）。
- **负验证净树门（r6 P2·r7 三宿主与 delta 口径）**：ARM-5 摘除 helper 属**工作树改动** → `reassess :72` `assertCleanPorcelain` 会直接 `exit(1)`、**零断言输出**（`:71-76` catch 仅 `console.error` + `process.exit(1)`）。故负验证按**临时 neuter commit**：①**保留函数提取与臂接线·仅把 `isNegatedHit` 改恒 `false`**（commit message 带 neuter 标记）并 **commit**（净树）；②**同一 neuter commit 下按 `reassess→cite→lift` 顺序跑**（**不真并发**·lift 末位·其后不得再跑任何 porcelain 门）：reassess 记录 **25 FAIL＝基线 21 + 臂 delta 4**（ARM-5/7a/7c/7b·**以 25−21 差集逐字比对**）/ cite **49 FAIL＝39+10**（ARM-1 五 / ARM-2 二 / ARM-3 二 / `#4` 一）/ lift **18 FAIL＝15+3**（ARM-6a/6b/6c）；**三件 delta 合计 4+10+3=17**，收据**须列三宿主逐字差集（17 行）或集合 hash**；③**回滚 neuter commit 回「修法 commit（B1 态）」**（`git log -1 --format=%s` 自检 neuter 标记 → `git revert --no-edit` / `git reset --hard <B1>`），**不是回基线 tip**；回滚后实证 **HEAD＝B1 commit** 且 **17 臂复绿**。**Ban 把 4 写成断言总数**、**Ban 以 reassess 单宿主 4 格冒充 17**、**Ban 三宿主真并发**（§8）。**ARM-5 负验证排在 ARM-4a/4b 基线之后、最终还原 H0 之前（r7 方案 A·§2.4-4/5）**——**负验证态不得混入基线**（否则四 prove FAIL 集与 ARM-4b 被断言格恒等基线被污染）。

### 2.6 交付面（r4 钉死·**11 函数逐一列名** + **三宿主分工**）

- **11 个函数逐一列名**（r3 P1·「七 site」展开·Ban 以「七 site」概括冒充全修/全测）：

| # | 函数 | 件:行 | 修法形（§2.1） | 注入臂 / 宿主 |
|---|---|---|---|---|
| 1 | `cellStatusLegacy018` | `eval-harness-matrix-cite.proof.mjs:429` | 单 token 臂·`m.index` | **ARM-1（五）** · cite |
| 2 | `cellStatusConservative` | 同上 `:452` | 多 token 臂·子偏移（`:456` stillRe · `:461` honesty-pin 第二通路）；**`:467` found-空兜底 `/not_run|blocked/` 同接 helper**（同形·不设豁免） | ARM-3 · cite |
| 3 | `cellStatus` | `lib/uc-covered-real-gatherer.mjs:70` | 单 token 臂·`m.index`；**`case-only` 臂（`:74`）同接 helper**（该件**无末位臂**） | ARM-2 · cite（import） |
| 4 | `parseNhpRow` | 同上 `:79` | **per-cell**（index 7）+ 单 token 臂 | `#4` · cite（import） |
| 5 | `cellStatus` | `uc-e2e-018-covered-lift-reassess.proof.mjs:107` | 单 token 臂·`m.index` | **ARM-5 · reassess** |
| 6 | `advBlind` → **`advBlindOf(text)`** | `uc-e2e-018-covered-lift.proof.mjs:125` | **整行哨兵·hit 子偏移**（提为纯函数·签名收 `text`：alt2/alt3 作用全 matrix） | **ARM-6c · lift** |
| 7 | `advIsBlind` → **`advIsBlindOf(cell)`** | 同上 `:132` | 单 token 臂 | **ARM-6a · lift** |
| 8 | `advIsPartial` → **`advIsPartialOf(cell)`** | 同上 `:139` | 单 token 臂 | **ARM-6b · lift** |
| 9 | `nhpPerfPartial` → **`nhpRowPartial(text,'NHP-018-PERF-01')`** | `reassess:172` | **per-cell**（提为纯函数） | **ARM-7a · reassess** |
| 10 | `nhpLoadPartial` → **`nhpRowPartial(text,'NHP-018-LOAD-01')`** | `reassess:173` | **per-cell**（提为纯函数） | **ARM-7c · reassess**（r4 同形镜像臂·**必设**） |
| 11 | `cell102` | `reassess:177` | 单 token 臂 | **ARM-7b · reassess** |

同族派生 `nhpPerfCaseOnly`/`nhpLoadCaseOnly`（`reassess:174-175`，臂为 `case-only`）**随 #9/#10 同改·不另立注入臂**；同形复制件（#5 对 #1、#6/#7/#8 对 #3）**与主 site 同改**，**函数级不设「豁免登记」活口；函数内子臂按下一目「site 3 `case-only` 子臂登记排除」（r6 卷面 :368）单点登记**——**r4 补 #10 的 ARM-7c 后，11 函数全部有臂或同改落点，无「随 9 可选」的豁免口**。
- **site 3 `case-only` 子臂（`:74`）登记排除（r6 P1 裁决 (b)·不补臂）**：`cellStatus` 的 `case-only` 子臂**不设注入臂、不入 17 格恰红集**——仅 probe 复现（`not case-only` 基线 `case-only`→修后 `unknown`）；**「11 函数全覆盖」＝函数级主臂全覆盖**（每函数至少一条主臂注入或同改落点），**不含**函数内已声明子臂。**半修态**（`partial` 臂已接、`:74` 未接 → 17 臂仍全绿）的盲区**已在本条登记**；补臂须连带改 17→18/19 计数，**时间盒内不做**。
- **宿主分工（r3 修正 r2「cite 唯一宿主」·r4 修正 lift porcelain 事实）**：**cite＝主宿主**（函数 **#1/#2** 本地 + **#3/#4** 直 import gatherer）；**reassess＝函数 #5/#9/#10/#11 宿主**；**lift＝函数 #6/#7/#8 宿主**；**criterion 仍零承载**（`:584` 崩前不 flush·§1.4）。**理由**：函数 **#5/#6/#7** 系各件**本地函数**，**不可从 cite import**——prove 脚本顶层即执行、末尾 `process.exit(exitCode)`，import 即跑门并截断宿主；若为此抽公共 module 则 **+1 受管件**（PTP +1·破 §4「EXEC 期 +0」预算）且 diff 面扩大。故取「各自宿主补臂」最小改，**以 11 函数主臂全覆盖换宿主单一性**（r3 取舍·r6 限定主臂·如实登记）。**宿主脆弱性（r4 更正）**：`reassess` 会 `DIRTY_TREE` 拒跑（`:21` import `assertCleanPorcelain`、`:72`/`:329` 直调，零断言输出）→ **只在门序清场后承载**，拒跑记 `BLOCKED` 非绿（§2.4-6/7）；**`lift` 无 porcelain 门**（`:20-22` 仅 import `node:fs`/`node:path`/`node:url`）→ **不会拒跑**，置门序末位**仅因 `:220` 产物写盘**。
- **可测性**＝①直 import（§2.1）：cite prove `import { cellStatus, parseNhpRow, isNegatedHit } from './lib/uc-covered-real-gatherer.mjs'` 直调断言；**reassess 已 import gatherer 的 `assertCleanPorcelain`（`:21`·先例在位）**，补 import `isNegatedHit` 即可；**lift 未 import porcelain 门**，须新增 `isNegatedHit` import（**不新增文件**·`:20-22` 现仅 node 内置）；**fixture 落 tempdir** 形仅用于需要整文件输入的 site（沿 `covered-criterion.proof.mjs:575-600` 先例），**Ban 在真矩阵上原地改格驱动**。
- **臂文案唯一性（r8 P3）**：**每臂只落一条断言·断言文案含臂名**（`ARM-5`/`ARM-6a`/`ARM-7c`…）——17 格恰红按臂名逐条数；**Ban 一臂多断言 / 多臂同文案**（否则「17 格」计数不可核）。**cite 10 臂分账（r8 P1）**：`10 = #1 五（ARM-1）+ #2 二（ARM-3 两红）+ #3 二（ARM-2 两红）+ #4 一`（与 §2.3.1 宿主行同值）。
- **零触面**：§1.1 note d 的 pin 断言 site（cite `:35`/`:322` 等）**零触**；**§1.1 note d-1 的 absence 断言族（cite `:673-819` 整块含 `:676`/`:681`/`:690`/`:807-818`、sole-stack `:205`、lift `:305`、eval-uc-e2e-001-002-cite `:33`/`:60`）零触**（缺席断言非状态解析·`matrix:202` 文本被其读取）；`banNear`（`:103`）**零触**；`:752`/`:764` 兜底链**零触**；**`matrix:202` 文本零触**（§2.3 全表 sweep 的 1 格变化是**修法结果·观测面**、不是改文本的理由）。

**非目标**：姊妹 `GAP-EVAL-PARSER-DETAILS-UNCLOSED`（`<details>` 结构解析/诊断·P1 另刀）；NHP-018 产品行补证；双矩阵/backlog 行文与行状态（SSOT 翻面权归协调方）。

## 3. keyless 判定（停止条件核）

**触模型分类器＝否**。C-WORD 面全部为 markdown 字符串 regex 解析（`test()`/`exec()`）· node+git+fs；涉及 prove 四件均本地 node 脚本零 docker 零 MODEL_API_KEY 零外部服务（§1.1/§2 ARM-4 亲证）。**派单停止条件（模型分类器 keyless 不可达→红停）未触发**；est live=0（零 e2e / 零 docker / 零 live key / 零模型调用）。派单 gloss「追问链敏感词/禁词」与仓内登记（覆盖状态解析器词面残余）不符——按 SSOT 登记起草·分歧如实上报（§0）。**量化锚（r7 席测）**：邻接判定门内增量 **+1.82ms / 858 非空格 × 3 parser**（**3.63→5.45ms**）·**零 I/O / 零轮询 / 零锁**（纯文本正则判定）——不改变 keyless / est live=0 判定。**口径（r8）**：该计量**只覆盖 3 个逐格 parser**；**函数 #6 `advBlind`（整行/全 matrix 哨兵）显式排除**在本计量之外（不同作用域，不并入 +1.82ms 口径）。

## 4. cap 预算核（CAP-SANCTION-2448 起草随刀恰等步进）

- **基线（本 worktree·r4 亲跑）**：`node scripts/ai-docs/check-docs.mjs` 清场核后 **EXIT=0 · scanned 2448** = `public-text-policy.mjs` `MAX_FILES = 2_448`（`:263`）**恰等零余量**；artifact 在场时 **EXIT=1 · `PTP_FILE_LIMIT:2449`**（2449 > 2448·§0.0.1/§6）。两次 r4 实测均亲跑（绿/红各一），hash `H0=H1=9e541f5e…`。
- **随刀步进（常设预授权「越限沿常设预授权恰等步进预登」·沿 CAP-SANCTION-2442 isob 起草随刀单件恰等先例形）**：cap **2447→2448** —— 四联动点 = policy `:263` `MAX_FILES = 2_448`（+`:261-262` CAP-SANCTION-2448 双注记）+ proof `:442` `i < 2_448` / `:449` `scannedFiles, 2_448` / `:456` `f-2448.md` / `:459` `FILE_LIMIT:2449`（+`:440`/`:455` 链注记）· **+1 恰等零多放** · 计数预算非内容策略 · 越限臂 fabricated 数随 cap 联动同步 · 语义不变强度不减。
- **EXEC 期预计 +0 受管计面**（NEG 臂 additive 进 **cite / reassess / lift 三个既有 prove 件**——§2.6 三宿主分工**不新增文件**；若 pre-exec dual 裁定独立 prove 文件或抽公共 module 则届值如实采·收据 `.log` 非扫描扩展名不计）；**[P1] EXEC 立项并线届值如实采**（fetch EXIT=0 → origin/main 届值亲点·禁止按本预登 2448 行使若届值已推移·预登作废重导沿 isob §6 先例形）。
- **CAP-SANCTION-2448 三线同号**：①`line/r5mr-draft` 收官并线承 2448（`0e42adb21`·r2 实测 `git merge-base --is-ancestor` **EXIT=0**）；②`line/evap-draft` 起草承 2448；③本支 `line/cwn-draft` 起草承 2448。**三支出处分立、同号并留不冲突**；**dual-keep 双留注记义务**：并线时两 policy 脚本注记/cap 区冲突须**双留**（本支 2448 注记 + main 届值注记并留·**Ban 单向覆盖**），EXEC 收据须列出双留两行原文。
- **现场漂移（r4 实测·只登不改）**：`git fetch origin` **EXIT=0**，`origin/main` = **`3af835ad4`**（`Merge pull request #183 from miaole/line/uc2b-draft`·cap `MAX_FILES = 2_455` 亲证）。**r2 的 `44f624253`/2452 已被 `3af835ad4`/2455 取代**——两代届值均只登不用。**EXEC 并线按 union 实测预计 CAP-SANCTION-2455+ 恰等步进**（届扫 <届时> + 并入互斥受管目并集）；**r2 的「2453 至少」下界已失效·删除不引**（届值已推移·任何固定下界都会误导）；evap 若同落再 +1——**以合并树实测为准·允许多放则停手上报**；**禁止**按本预登 2448 或任何估算值直接行使，届值如实采·预登作废重导。

## 5. 零重叠核 + est live

- **零重叠**：`harness/` 除本卷外无 `cwn*` 件（`git ls-files … | grep -v 'harness/cwn-REQUEST.md' | grep cwn` **零输出**亲证·文件名唯一）；在飞 **16 树**（r4 实测·§0.0.1）逐名亲点；本刀零触 NHP-018 行、双矩阵格值、SSOT 行状态、姊妹 DETAILS 刀、`receipts/` append-only 史录、§1.1 note d / note d-1 的 pin 与缺席断言 site。
- **清场核三类 gate artifact（r7 补）**：①lift evidence（`ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-covered-lift-evidence.json`）②criterion 探针 `.tmp-porcelain-dirty-probe-uc018.txt`（`:516` 定义 / `:517` try / `:518` 写 / `:527` finally / `:528` rmSync）③reassess 探针 `.tmp-lift-porcelain-probe-uc018.txt`（`:336` 定义 / `:338` 写 / `:343` finally / `:344` rmSync·**仓根**·`.gitignore:15` 的 `.tmp/` 不覆盖）。复核命令 `test -z "$(find <worktree-root> -maxdepth 1 -name '.tmp-*probe*' -print -quit)" || exit 1`（**须零命中**·命中即中止）；tracked diff 不算脏（§2.4-0b/1）。
- **est live=0**：零 e2e / 零 docker / 零 live key / 零模型调用；门＝三静态门（本地 node 脚本 + grep·§6）· docs:check / PTP 属静态门不计 prove。

## 6. 门矩阵（r4 亲跑原值 · 原值即报不修饰）

| 门 | 命令（树亲证） | r4 亲跑（2026-10-30） | 后继 EXEC |
|----|----------------|------------------------|-----------|
| docs:check | `node scripts/ai-docs/check-docs.mjs` | **树脏（gate artifact 在场）EXIT=1 · `public_text_policy:PTP_FILE_LIMIT:2449`**（scanned 2449 > cap 2448）；**清场核后 EXIT=0 · `80 required files verified; public text policy scanned 2448 managed worktree files`**（移出→跑→逐字节还原·`H0=H1=9e541f5e2d4e165df661031a49e7e40f5ab2c452290f943cdfb50515caac922a` 亲核·r4 复跑同值） | 必跑（`git status --porcelain` 清场核先做；artifact 在场时如实承登红·Ban 凑绿） |
| PTP | `node scripts/ai-docs/public-text-policy.proof.mjs` | **EXIT=0**（12/12 · `static_preflight_valid: selected=12/12; releaseEvidence=false`·r4 复跑同值） | 必跑 |
| markers | 全仓行首冲突标记 grep（`^<<<<<<< ` / `^=======$` / `^>>>>>>> `·md/mjs/json/ts/yml） | **零命中（hits=0）**·r4 复跑 | 必跑 |
| diff 面 | **「本次 commit / 上一 commit」口径（r6）**：提交前 `git diff --numstat`（本次待提交）；commit 后 `git show --numstat HEAD`（本次 commit）与 `git show --numstat HEAD~1..HEAD`（上一 commit→本次 commit）；**不再用固定 `HEAD~2..HEAD` 两代累积** | r6 提交前 `git diff --numstat` 恰 **1 tracked**（本卷纯编辑）；commit 后 `git show --numstat HEAD` 应见**本次 commit 1 文件**，`HEAD~1..HEAD` 同口径（policy 双件零 diff·cap 不动） | 必检 |
| root lint | `pnpm lint` | **N/A**——本 worktree 无 `node_modules`（纯 node 脚本树·未装依赖），命令不可执行；理由如实登记，非「跳过」亦非「绿」 | N/A（同左） |
| prove 四件 | §2 ARM-4a 四命令 | **r2 亲跑值（r3/r4 未复跑·如实标注）**：cite **EXIT=1 · 39 FAIL** · criterion **EXIT=1 · 零断言输出 · 崩 `:584:7` cpSync ENOENT**（树脏先 `DIRTY_TREE` @ `:522`）· lift **EXIT=1 · 15 FAIL**（重写 evidence artifact）· reassess **EXIT=1 · 21 FAIL**（树脏 `DIRTY_TREE` 拒跑） | 必跑（修法后断言＝FAIL 文字集恒等 + ARM-4b 被断言格恒等·门序见 §2.4；**注意**：r3 新增 6 臂/r4 再 +1 臂会改变 PASS 计数与 PASS 文字集，**FAIL 集合恒等口径不变**·ARM-4a 仍只比 FAIL 集） |
| 环境供给 | — | est live=0 · 0 Key 值 · `actualSpendCny=null` · 零 docker/零模型 | 同左 |

**r7 门值承登（r8 P3·r8 本轮同树复跑取得）**：docs:check 清场核后 **EXIT=0 · scanned 2448**（gate artifact 在场时 **EXIT=1 · `PTP_FILE_LIMIT:2449`**）· PTP **EXIT=0 · 12/12**（`static_preflight_valid: selected=12/12; releaseEvidence=false`）· markers **hits=0**。r7 当轮门值未另存，按同口径以此复跑值承登；四 prove 未复跑（沿用 r2 值·见上表）。**口径句**：§6 的 docs:check/PTP/markers 三值只对「artifact 移出态」成立，artifact 在场即如实登记红、不修饰。

**§6 口径申明（r4）**：本卷为**起草未实跑修法**之卷——四 prove **纯 node 可跑（keyless/零 docker）**；r2 已亲跑取届值并**如实承登全红 + 两类崩溃**（不是未跑、不是全绿），**r3/r4 未复跑四 prove（本轮门只含 docs:check/PTP/markers·四值沿用 r2 并已标注）**；**「四 prove 全 EXIT=0」为假绿基线，已删**。docs:check 红系 **gate run artifact**（lift 每次跑必重写·§0.0.1）受 `--others` 计面，非卷内新增受管件——**Ban 以删/改该件、改 `.gitignore` 掩盖或抬 cap 凑绿**；允许的唯一动作是**临时移出 + 逐字节还原（hash 核验）**；r4 实测 `H0=H1=9e541f5e…`（与 r2/r3 各轮同值）。**量化锚（r7·席测·r8 口径）**：三 parser × 858 非空格门内增量 **+1.82ms**（**3.63→5.45ms**）·**零 I/O / 零轮询 / 零锁**；不构成新门、不改四 prove FAIL 集口径。**函数 #6 `advBlind`（整行/全 matrix 哨兵）显式排除**在该计量之外（作用域不同·不并入 +1.82ms）。

## 7. 停止条件核（r4 如实登记）

1. **模型分类器不可达**：未触发（§3——纯 regex 解析 keyless 全可达）。
2. **语义源分歧**：派单 gloss 与 SSOT 登记不符——按登记起草·上报裁决（§0），非停止条件形态（有唯一可认领登记实体）。
3. **cap 越限**：起草时点已沿常设预授权恰等步进承登 CAP-SANCTION-2448（§4·三线同号）——非未授权越限；**EXEC 期按届时并线届值重导（r4 实测 origin/main cap 2455·§4）**，届值已推移时 2448 预登作废、不得强行使。
4. **现场漂移（r4 亲跑 fetch）**：起草 turn 零漂（§1.0 blob 表对 `af273901a` 亲算）；**r4 turn 漂移成立**——`origin/main` = **`3af835ad4`**（#183 uc2b 并线·cap 2455·fetch EXIT=0 亲证），工作树 **16**（新增 `meetwise-uc3m`）、`meetwise-r5mr` 树已撤、evap @`e5fbc9271`；本树 gate artifact 在场时 docs:check 现红（§6）。处置：**不 rebase、不追并线、不删件凑绿**——届值重导归 EXEC 立项日 + 协调方（沿 evap §0 分口）。
5. **修订与机制源冲突（r4 命中核）**：r4 **未命中**——r4 的修订恰是为消 r3 卷内与机制源的冲突：①ARM-7a 旧夹具的 span 实测 false 与「基线 true」矛盾（改用席2 夹具后 span 自行 ID 偏移 2 起匹配→true、per-cell 取 cell 7 否定→false，与源码语义相容）；②site 10 无臂与 §2.6「不设豁免活口」矛盾（补 ARM-7c）；③`not still X` 前缀 `still` 不在分隔符类（改登记、删「必修」定性）；④lift 无 porcelain 门（删除误载）。source 行号全部亲点未漂（`:433`/`:73`/`:103`/`:132`/`:139`/`:172-182`/`:461`/`:511`/`:521`/`:533`/`:584`/`:821`）。**未命中即继续落卷**（命中才停手上报）。
6. 其余（越限未授权/self-approve/push/动主仓）未命中。

## 8. Ban（逐条）

1. **Ban coding**：本 commit 零 scripts 产品面触碰（policy 双件属 cap 计数预算机制面非产品面）·后继 EXEC 亦 `apps/*/src`/`packages/*/src` 零 diff 意向（§2.6）。
2. **Ban SSOT edit**：gap-bug-backlog `:36-37` · e2e-covered-path-backlog `:44` · coverage-matrix `:123`/`:183`/`:306` 格值与 stays-partial 旗 · execution-master-checklist——本刀全卷零触碰；C-WORD 行翻面/关闭归协调方。
3. **Ban 认领 NHP-018-\* 行**：产品 NEG/FAULT/BOUND 面（§1.4）各有其证，Ban 互借收据、Ban 冒充产品负例已补。
4. **Ban 代偿姊妹刀**：`GAP-EVAL-PARSER-DETAILS-UNCLOSED` 零代偿零并卷；臂面互斥 Ban 互 wash。
5. **Ban 修法落 evaluator**：词面风险在 gatherer/cite 解析层（§1.1 note a）；**Ban 只修一处冒充全修**——11 个函数逐一同步（§2.6 表），**Ban 以「七 site」概括了事**。
6. **Ban 窗形回退 / 锚点回退**：EXEC **Ban** 恢复前 48/后 16 对称窗、**Ban** 检查 hit 后缀、**Ban** 48 字回看、**Ban** 把 `未`/`不得`/`禁止`/`Ban`/`不可` 加入 status 臂词表（§2.1 钉死）；**Ban 把整段 match 起点直传 `isNegatedHit`**（r3 P1 病灶·`reassess :172`/`lift :125` 实测空转）；**Ban 以状态词臂的 `.test()` 单点判定替代 `exec` 循环**（r4 真反例：`not partial · partial` 首个 hit 被否定时 `.test()` 单点判漏掉第二个正向 hit（**index 14**）；**r6 限定**：**helper 本体内部 `.test()` 不受禁**，如 `isNegatedHit` 的 `NEG_STATUS.test(...)`；**exec 循环 `lastIndex` 卫生**见 §2.1——每次新建正则或重置 `lastIndex`，**Ban 复用残留 `lastIndex` 漏 hit**；**不 Ban 分拆 alt**——r4 实测分拆与单正则同值，r3 的「假绿」论证已删）。
7. **Ban 仓级替换 `\bpartial\b`**：§1.1 note d 的 pin 断言 site（sole-stack `:144/:181/:239` · lift `:265/:344/:357` · reassess `:396/:474/:491` · cite `:35/:322`）系文档 pin，全仓 find-replace 会打断 pin 门；**note d-1 的 absence 断言族（cite `:673-819` 整块含 `:676`/`:681`/`:690`/`:807-818` · sole-stack `:205` · lift `:305` · eval-uc-e2e-001-002-cite `:33`/`:60`）同禁**。
8. **Ban 把 `DIRTY_TREE` 记作恒等通过**（§2.4-5）；**Ban 永久删/改 gate artifact 或抬 cap 凑绿**（临时移出须逐字节还原 + hash 核验）；**Ban 把 `matrix:202` 的保守切换（covered→unknown·§2.3 全表 sweep）记作回归并据此回退修法**。
9. **Ban prove / e2e / docker / push / force-push / self-approve / secrets / `.env*`**；三门有红即红停上报，Ban retry-to-green · Ban 选择性汇报。
10. **Ban 把本刀写成 UC-018 covered flip 前置或贡献**：EXIT0≠covered·coveredCount=8 不变·UC-018 stays partial·本刀 ≠ nail ≠ 残余关闭。
11. **Ban 触 `receipts/` 史录**（append-only·含 `:250`/`:260` 残余出处件与 adv review `:112` 词形实录件）。
12. **Ban 只报 reassess 单宿主 4 格**（以 4 冒充 17 格恰红集·§2.4-4/§2.5）；**Ban 把 25/49/18 记作断言总数**（＝基线 FAIL + 臂 delta；恰红集只认三件 delta 合计 **17**）；**Ban 在负验证态取 ARM-4 基线**；**收据未列三宿主逐字差集（`25−21`/`49−39`/`18−15`·17 行）或集合 hash 即证据不足**（r8 P2）。
13. **Ban 三宿主真并发**（r8 P1）：负验证三宿主**只许同一 neuter commit 下按 `reassess→cite→lift` 顺序跑**——`lift :220` 写盘与 porcelain 净树互踩；**lift 末位·其后不得再跑任何 porcelain 门**。
14. **Ban `git add -A` / `git add .`**（r8 P2）：0a/0c 批末树内可能仍有 untracked **H′**，误 add 会把产物纳入 index（`A`；移出后 `D`）→ porcelain 仍脏且污染 commit；**只 `git add scripts/*.mjs`（+本卷若需）**。**Ban 覆盖 H0 保管区**（H0 副本只写一次；H′ 一律进独立弃置区）。

## 9. 卷纪律

r8 rev diff 恰 **1 tracked**（本卷 `ai-docs/delivery/harness/cwn-REQUEST.md` 纯编辑·policy 双件零 diff·cap 不动）；commit 净消息 `docs(test): 更正覆盖解析任务书臂归属与门序路径`；⛔push；**收据只落 `.tmp/`（`.gitignore:15` 已忽略）或工作区外**——**Ban 落仓内其他路径**（否则后序 `criterion`/`reassess` porcelain 门现 `DIRTY_TREE` 拒跑）；实现方不 self-approve · alone≠dual · EXIT0≠covered · 登记≠修复≠定谳≠关闭 · **EXIT1≠本刀红**（三类环境先在红已分口）。

## §9-EXEC EXEC 记录（2026-10-30 · 续做席沿半成品续做 · 七字段 + 偏离登记）

1. **席位与提交链**：EXEC 续做席（前席超时失联·现场交接·沿半成品续做）· 入口 HEAD **`33c308704`**（CAP-SANCTION-2456 步进·已含 merge `ba55e26da` main `3af835ad4`）→ 落码 commit **`fbb0cadec`**（`test(scripts): 覆盖状态解析增加否定窗口`·4 scripts·186 增 40 删）→ 本卷 docs commit（EXEC 收据 + STOP 翻面）· ⛔push。
2. **半成品审读结论（接手即 `git diff` 逐处核）**：**已落**＝gatherer `NEG_STATUS`/`isNegatedHit`/`nonNegatedMatch`/`splitUnescapedPipes` + `cellStatus` 五臂（含 `:74` `case-only` 子臂·§2.6 行 3 要求同接）+ `parseNhpRow` per-cell（status 格 index 7）；cite `cellStatusLegacy018`/`cellStatusConservative` 接线 + 10 臂 + 守卫 3 + 反误抑 2。**缺**＝①gatherer `cellStatus`/`parseNhpRow` 未 export（cite 直 import 即 `SyntaxError`·接手实测 EXIT=1）②reassess 函数 #5/#9/#10/#11 零接线零臂 ③lift 函数 #6/#7/#8 零接线零臂。**修正**＝补三 export；cite 本地 exec-loop helper 收敛为 gatherer export 的单一 `nonNegatedMatch`（消三宿主复制漂移）；其余半成品与 r8 判准形逐字保留，**无需回退重做**。
3. **11 函数接线终态**：#1 `cellStatusLegacy018`（单 token·`m.index`）· #2 `cellStatusConservative`（stillRe/honesty-pin 子偏移 + found 空兜底 `not_run|blocked`）· #3 gatherer `cellStatus`（五臂·含 case-only）· #4 `parseNhpRow`（未转义 `|` 切格·status 格 index 7）· #5 reassess `cellStatus`（同 #1）· #6 `advBlindOf(text)`（整行哨兵·`lastIndexOf('**blind**')` 子偏移）· #7 `advIsBlindOf` · #8 `advIsPartialOf` · #9/#10 `nhpRowPartial`（per-cell·复用 #4）· #11 `cell102`（partial/case-only/blind 三臂）。`case-only` 子臂按 r6 裁决**登记排除**：接线但不设注入臂、不入 17 格恰红集。
4. **17 臂 + 守卫**：cite 10（ARM-1 五 / ARM-2 二 / ARM-3 二 / `#4` 一）+ 守卫 3（`not covered` / `no covered` / `still **gap**（not partial）`）+ 反误抑 2（`非常 **partial**` / `非空 **gap**`）；reassess 4（ARM-5/7a/7c/7b）；lift 3（ARM-6a/6b/6c）。B1 态全绿；neuter 态 17 格逐格恰红、守卫与反误抑恒绿。
5. **B0≡B1（ARM-4a·同树修前/修后·固定序 `cite→criterion→reassess→lift`）**：B0＝cite **39** / criterion **0**（崩 `:584:7` cpSync ENOENT `.../receipts/2026-09-23-uc-e2e-018-sole-stack-pg-retained-evidence.json`·零断言）/ reassess **21** / lift **15**；B1 同值；绝对路径前缀 `<worktree>/` 归一化后 FAIL 集逐字 `cmp` **四件全 EQUAL**。PASS 面差异仅 22 新增（17 臂 + 守卫 3 + 反误抑 2），**零 PASS 消失**（既有断言与 r8 判准形恒等）。
6. **17 delta 逐字差集（同一 neuter commit `ff1c9ad72`·message 含 NEUTER·顺序 `reassess→cite→lift`）**：
   - reassess `25−21`（+4）：`FAIL  ARM-5 reassess cellStatus: "not **blind**" must ⇒ unknown` · `FAIL  ARM-7a reassess nhpRowPartial: PERF status cell "not **partial**" must ⇒ false` · `FAIL  ARM-7b reassess cell102: "not **partial**" must ⇒ blind (fallback)` · `FAIL  ARM-7c reassess nhpRowPartial: LOAD status cell "not **partial**" must ⇒ false`
   - cite `49−39`（+10）：`FAIL  #4 parseNhpRow: status cell "not **partial**" ⇒ unknown (got partial want unknown)` · `FAIL  ARM-1 legacy018: "no gap" ⇒ unknown (got gap want unknown)` · `FAIL  ARM-1 legacy018: "non-partial" ⇒ unknown (got partial want unknown)` · `FAIL  ARM-1 legacy018: "not blind" ⇒ unknown (got blind want unknown)` · `FAIL  ARM-1 legacy018: "not partial" ⇒ unknown (got partial want unknown)` · `FAIL  ARM-1 legacy018: "非 partial" ⇒ unknown (got partial want unknown)` · `FAIL  ARM-2 gatherer cellStatus: "not partial" ⇒ unknown (got partial want unknown)` · `FAIL  ARM-2 gatherer cellStatus: **case-only**（not partial）⇒ case-only (got partial want case-only)` · `FAIL  ARM-3 conservative: "not partial" ⇒ unknown (got partial want unknown)` · `FAIL  ARM-3 conservative: "still **partial**（not gap）" ⇒ partial (min 抬升) (got gap want partial)`
   - lift `18−15`（+3）：`FAIL  ARM-6a lift advIsBlind: "not **blind**" must ⇒ false` · `FAIL  ARM-6b lift advIsPartial: "**case-only**（not partial）" must ⇒ false` · `FAIL  ARM-6c lift advBlind: synthetic row "not **blind**" must ⇒ false`
   - 合计 **4+10+3=17**，三宿主消失集均为空；回滚 `git reset --hard fbb0cadec` 后 HEAD＝B1 commit、`git log -1` 无 NEUTER 标记、三宿主复跑臂 PASS **4/10/3** 复绿（FAIL 21/39/15）。
7. **ARM-4b 恒等（源切片自 git blob/工作树原文·非手写重实现）**：60 UC 行 / **312** 非空格 × 三 parser **0 flip**；全表 200 行 / **858** 非空格 conservative **恰 1 flip**＝`matrix:202` PRIVACY-HTTP 备注格「非 covered」`covered→unknown`（r8 登记观测面·非回归·无生产消费点·`matrix:202` 文本零触）；NHP-018 六行 `parseNhpRow` status 全等（NEG/BOUND/ADV/PERF/LOAD=partial·FAULT=case-only）；reassess PERF/LOAD `true→true`；lift `advBlind=true`（§1.0.1 叙事词驱动·per-hit 不弃）/ `advIsPartial=true` / `advIsBlind=false` 恒等。零格值触碰 · coveredCount=8 不变 · UC-018 stays partial。
8. **门矩阵 EXIT（清场后·artifact 移出态）**：docs:check **EXIT=0 · `scanned 2456` = cap 2456 恰等**（80 required files verified）；PTP **EXIT=0 · 12/12**（`static_preflight_valid: selected=12/12; releaseEvidence=false`）；markers **hits=0**；diff 面 `git show --numstat HEAD` / `HEAD~1..HEAD` 同口径＝本 commit 恰 4 scripts（`53/9`·`62/11`·`28/13`·`43/7`）；root lint **N/A**（本 worktree 无 `node_modules`·未装依赖，非跳过非绿）。0a/0c 批末 H′ 移出后各见 porcelain 净。
9. **H0/H′ 处置（§2.4-1/3b/5 口径·如实偏离一处）**：入口时 `ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-covered-lift-evidence.json` **不存在**——PTP-archive 迁移余波已将其移入 tracked `receipts/archive/2026-09-batch23/receipts/…`（该 archived 件 hash `fe839964…`，非卷面旧轮 `9e541f5e…`）；故 **H0＝absent**，无 H0 副本可移、H0 保管区不建立（不覆盖）。每次 lift 产物 **H′**（0a `40685c43…` / 0c `65290384…` / 负验证 / 回滚后复跑）均移入工作区外独立弃置区（`/tmp/cwn-discard-*`）；终态旧路径仍 **absent＝H0**，无还原动作、`git status --porcelain` 净，archived tracked 件零触。
10. **STOP 翻面**：三处钉（标题 / Status / 卷尾注）`draft:awaiting_pre_exec_dual`→**`executed:awaiting_post_prove_dual`**·前值史录不洗·post-prove 双审归后继席·⛔push ⛔merge 主线·alone≠dual·EXIT0≠covered·本卷不 claim 任何 covered 升格。

## 10. 收官并线 P2 观察登记（2026-10-30 · post 双审双 PASS 放行 · 两席 P2×6 + P3 批合并去重九件 · 证面冻结零触）

- **入卷口径**：post-prove dual **两席均 PASS**（放行并线）；两席 P2×6 + P3 批观察**合并去重＝九件**。本 § **只落本卷一件 `.md`**：`scripts/**` 四件（gatherer/cite/lift/reassess）**零 diff**、17 臂/17 delta **零改**、`matrix` 格值零触、Pins 十值零翻转。合并 commit 内的 `scripts/**` 改动**全部来自 `origin/main` `1ca3ce1da`（#184 evap）与本线 policy 区 dual-keep 会签**，非本 § 产物。**登记≠修复**：凡属缺口/盲区者一律登记在案、**不入门判据、不设臂、不入 17 计数**。
- **重锚口径（②）**：§1.1/§2.1/§2.6 行号写于 EXEC 前 tip，经 EXEC 落码 `fbb0cadec`（gatherer 增 helper 区）与并线 `1ca3ce1da`（gatherer 审查判定区 +86 行）**双重推移**。下表为**合并树终态亲点**（`grep -n` 逐行·2026-10-30）；**正文旧行号不再重写、只作史录，后继席一律以本表为准**。

| 件 | 函数 / 锚点 | 稿值（§1.1/§2.1/§2.6） | 合并树终态 | 位移 |
|---|---|---|---|---|
| gatherer | `cellStatus` 五臂 | `:70-77` | **`:70-77`**（covered `:72`/partial `:73`/case-only `:74`/blind `:75`/gap `:76`） | 0 |
| gatherer | `NEG_STATUS` 表 | 新增（EXEC） | **`:86`** | 新增 |
| gatherer | `isNegatedHit` / `nonNegatedMatch` / `splitUnescapedPipes` | 新增（EXEC） | **`:94-97` / `:104-112` / `:115-125`** | 新增 |
| gatherer | `parseNhpRow` | `:79-90`（partial 臂 `:86`） | **`:127-141`**（`statusCell` index 7 `:134`；臂 `:136-139`） | +48 |
| gatherer | `gapClosedInText`（`banNear`） | `:93-108`（`:103`） | **`:144-165`**（`banNear` `:154`） | +51 |
| gatherer | `assertCleanPorcelain`（export） | `:448` | **`:586`** | +138 |
| gatherer | `gatherRealUc018` | `:519` | **`:657`** | +138 |
| gatherer | `parseNhpRow` 调用块（NHP 行族） | `:539-543` | **`:677-681`** | +138 |
| gatherer | `buildCol` 状态兜底 | `:618` | **`:755-756`**（兜底式 `:756`） | +138 |
| gatherer | §1.1 `s11Status` | `:752` | **`:890`** | +138 |
| gatherer | §1.1 status 二次兜底 | `:764` | **`:902`** | +138 |
| gatherer | §1.0 `boundCell` | `:772` | **`:910`** | +138 |
| cite | `cellStatusLegacy018` | `:429-437`（臂 `:431/:432/:433/:434/:435`） | **`:430-439`**（臂 **`:433/:434/:435/:436/:437`**） | +1（臂 +2） |
| cite | `cellStatusConservative` | `:452-473` | **`:454-491`** | +2 |
| cite | still 主通路 / honesty-pin 第二通路 | `:456` / `:461` | **`:458-465`**（词元子偏移 `:462`）/ **`:466-473`**（`:469`） | +2 / +5 |
| cite | 六词独立命中循环（`new RegExp` 先例） | `:462-465` | **`:474-483`** | +12 |
| cite | found 空兜底 `not_run\|blocked` | `:467` | **`:484-487`** | +17 |
| lift | `import { isNegatedHit, nonNegatedMatch }` | 无（EXEC 新增） | **`:23`** | 新增 |
| lift | `advBlindOf(text)` | inline `:125-127` | **`:131-143`**（子偏移 `:138`） | 提函数 |
| lift | `advIsBlindOf` / `advIsPartialOf` | inline `:132` / `:139` | **`:144-147` / `:148-151`** | 提函数 |
| lift | 臂 ARM-6a/6b/6c | 新增 | **`:168-175`** | 新增 |
| reassess | `cellStatus`（含末位臂 `:113`） | `:107-114` | **`:107-115`**（臂位不变） | +1（尾行） |
| reassess | `nhpRowPartial` + 常量 | inline `:172-173` | **`:172`** + **`:174-175`** | 提函数 |
| reassess | `cell102` | `:177-182` | **`:179-185`** | 提函数形 |
| reassess | 臂 ARM-5/7a/7c/7b | 新增 | **`:203-212`** | 新增 |

- **① #2 多 token 子偏移＝二择一采「结构冗余登记·删判别力主张」（不补 ARM-3b·17 计数不动）**：cite `:458` stillRe 与 `:466` honesty-pin 两臂取词元子偏移（`:462`/`:469`）后交 `isNegatedHit`；但同格 `:474-483` 六词独立命中循环对**同一词元**另有判定，`found` 为集合、`min` 与顺序无关 ⇒ still 臂的否定判定**不改变任何终值**。**本席探针亲跑（三种实现并排）**：仅关 still 臂判定（generic 循环照留）——`still **partial**（not gap）`＝`partial`、`not still **partial**`＝`partial`、`still **gap**（not partial）`＝`gap`、`still blind（not covered）`＝`blind`，**逐形与全开同值**；仅关 generic 判定才复现修前值（`gap`/`blind`/`partial`）。⇒ **无法构造 ARM-3b 真反例**（与 r4 对「分拆 alt」的伪证同判）。**处置**：§2.1 表「多 token 臂」一行的**判别力主张撤回**，still 臂**保留为防御性重复实现**（不删码、不改计数）；后继若要立 ARM-3b，须先给「still 臂弃而 generic 留且 min 变」的真反例。
- **③ note c 扩登到 gatherer 兜底链（`:756`）**：`buildCol` `:756` `nhpRow?.status && nhpRow.status !== 'unknown' ? nhpRow.status : cellStatus(statusCell)` —— `parseNhpRow` 因否定弃尽而返的 `unknown` 会被 **matrix 格 `cellStatus` 重算覆盖**；即 #9/#10 的 NHP 面 `unknown` **经 `gatherRealUc018` 不可观测**，与 §1.1 的 `:890`/`:902` 双兜底**同链**。故断言口径：**只对直调** `parseNhpRow`/`cellStatus` 成立；Ban 经 `gatherRealUc018` 写「NHP 行翻 `unknown`」。**零触** `:756`/`:890`/`:902`（兜底链改不改归协调方）。
- **④ alt1 作用域放宽登记（有意·不收紧）**：`NEG_STATUS` 首支 `\bnon-?`（r3 钉「无尾 `\b`」）实为**前缀形**——`non` 后接可选连字符、再要求**分隔符收尾** ⇒ 裸 `non partial`（无连字符）亦判否定；`none`/`nonpartial` 不命中（后接非分隔符）。同理 `\bno\b`（`no gap`）与裸 `非`（`非 covered`）亦前缀形，`非常`/`非空` 由「必须紧跟分隔符」挡住（反误抑二臂在案）。**登记为相对「`non-` 严格读法」的有意放宽**；不收紧、不另立形、不设臂。
- **⑤ 量化锚并列实测（并列登记·不设阈值）**：**两席报值**——席1 **`+0.87ms`**（修后总开销量级）、席2 **`#6 0.010→0.212ms`**（`advBlindOf` 全 matrix 单次）。**本席复测（2026-10-30 · node · 本机 · 合并树）**——conservative 全表 200 行/860 列（含空列）200 轮均值 **`2.628→3.112 ms/轮`（+0.48ms/轮）**；`advBlindOf(matrix)` 500 轮均值 **`0.023→0.055 ms`（×2.4 · +0.032ms）**。**口径**：修法**非零成本**；绝对值随机器/负载漂移（与两席报值数量级不同即因于此），**不设阈值、不入门判据、不据此回退**，只登记「有可测开销」事实。
- **⑥ cap 零余量 · lift 复跑即红（时点事实 + 并线后复测）**：**EXEC 收卷时点** `docs:check` 亲跑 **`scanned 2456 = MAX_FILES 2_456`（零余量）**；lift 每次执行**必写** `ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-covered-lift-evidence.json`（lift `:254`/`:256`；`.json` ∈ `TEXT_EXTENSIONS`）⇒ **任何 lift 复跑未移出即 `scanned 2457 > 2456` → `PTP_FILE_LIMIT:2457` EXIT=1**（§9-EXEC 同形红已亲证）。**并线后**（cap 取大 **`2_461`** · `public-text-policy.mjs:281`）本席亲跑 **`scanned 2458`（余量 3）** ⇒ 复跑 lift 得 2459 仍绿——**「零余量」是时点事实，随并线变动**。**门序义务不变**：lift 只作末位宿主，其后任何 `docs:check` 之前**必须把 artifact 移出工作区**（`/tmp/cwn-discard-*`）；Ban 凑绿删件/改 `.gitignore`/抬 cap。
- **⑦ #9/#10 call-site 无臂（登记·与 `case-only` 子臂同格盲区）**：ARM-7a/7c（reassess `:205-210`）只**直调** `nhpRowPartial`；**call-site 等式无臂**——`:174-175` 常量与 `:186-199` 的 `col.PERF`/`col.LOAD` 三分支（`nhpPerfPartial || cell102(...)==='partial'` 等）**无等值断言**。采**登记不补臂**：与 §2.3.1 `case-only` 子臂**同格盲区**（半修/错接仍 17 臂全绿）。补 call-site 等式须引入 matrix fixture 行并重算 17→18/19，**时间盒内不做**；如需补，另刀立臂。
- **⑧ 中英否定缺口补登**：`NEG_STATUS` 未收 **`no longer` / `not yet` / `不再` / `尚未`**（前两者因**第二词打断邻接**；后两者未入表，`未` 系 r3 有意排除）。**实测四形均返正向 status**：`no longer partial` / `not yet partial` / `不再 partial` / `尚未 partial` → 皆 `partial`。**登记为已知缺口**（与 `:226` 的 `不是`/`无`/`没有` 同格），**非回归、不设臂、扩表另刀**；`并非 partial` 仍返 `unknown`（`:226` 已更正，不重复登记）。
- **⑨ 跨件同输入异值登记（既定分叉·不统一臂序）**：同一输入 `**case-only**（not partial）` 四解析器终态——gatherer `cellStatus`＝**`case-only`**；cite `cellStatusLegacy018`＝**`blind`**；reassess `cellStatus`＝**`blind`**；cite `cellStatusConservative`＝**`case-only`**。根因＝**臂序不同**（gatherer `:74` 有独立 case-only 臂；legacy018/reassess 的 case-only 只在末位 `/not_run|case-only|blocked/ → blind` 臂内），**非本次修法引入**。另：`not **blind**` 三处同为 `unknown`；`still **partial**（not gap）` 仅 conservative `gap→partial`。**登记为件间语义分叉**：**断言不得跨件复用期望值**；本刀不统一臂序。

---

*Harness · C-WORD-NEG UC-018 follow-up 词面负例起草任务书 · rev r8 + §9-EXEC + §10 2026-10-30 · **`closed`**（卷尾注 · STOP 三处钉之三 · 与标题/Status 同值 · 2026-10-30 收官并线席翻面：post 双审双 PASS 放行并线·两席 P2×6+P3 批九件登记（§10）+ post-EXEC 重锚表 · 前值 `executed:awaiting_post_prove_dual` 史录不洗（2026-10-30 EXEC 落卷翻面·原值 `draft:awaiting_pre_exec_dual`）· 11 函数接线 + 17 臂恰红 + B0≡B1 + 三门亲跑 + 并线终验三门 · 实现方不 self-approve · alone≠dual · EXIT0≠covered）*
