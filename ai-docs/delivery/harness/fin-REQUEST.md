# FIN REQUEST — meetwise 台账收官刀（U5a/U5b/U5c/U6/U7/U8/U10 七项 + G7K 勘误一次性收口·起草+行使随令同卷·docs-only）

**Status**: **`proofed:dual_pass`**（2026-11-05 post-prove 双席两独立外席 BOTH PASS 落卷·详 §9 post-prove 记录 · 前值 `executed:awaiting_post_prove_dual`（起草+行使随令同卷落卷 2026-11-05·协调方终裁授权「除买云外全部完结」随令行使（沿 err-REQUEST §9-1 df 卷转录先例形·在席双审记录以协调方台账为准·本席按令转录）·行使面=§2-§7 七项 additive（U5a regw 终裁注/U5b rc 四子项勘误注/U5c backlog G7K 定性勘误注/U6 两卷翻面 closed+两卷残面注+一卷维持承登/U7 普查正形登记注）+§6 U8 登记表（只登记不删）+§7 U10 成文落位·alone≠dual·Ban self-approve·post-prove 双审留协调方派席·翻面/关账权归协调方·est live=0·markers 新增字节 0·⛔push ⛔动主仓）史录保留 · alone≠dual · 翻面/关账权归协调方）【状态钉三处：本行+§8+卷尾·同值】
**Date**: 2026-11-05
**Base**: `origin/main` @ **`edda65a44`**（#198 l13-draft 已并·fetch 亲证 tip 恰等·main 届扫 2479=cap 2479 恰等=CAP-SANCTION-2479 L-13 承值）
**工作区**: worktree `meetwise-fin`（branch `line/fin-draft`·按派单令 remove --force 重建于 origin/main 届 tip·工作树 0 脏亲证后落卷）
**性质**: docs-only·零产品码·零迁移·零测试触面·禁 E2E 场景·禁长驻服务；除本卷 REQUEST 1 件外全为既有受管面 in-place additive 注（原文字节零改写）+两 policy 脚本 cap 联动四点
**Authority**: meetwise 用户终裁授权令「除买云外全部完结」——本刀行使协调方终裁：U5a/U5b/U5c/U6/U7 行使·U8 只登记不删·U10 成文落位

---

## §0 亲读核定（origin/main 现值·逐项 file:line 亲跑·停止条件未触发）

1. 届值：`git fetch origin` EXIT=0·`git rev-parse --short=9 origin/main`=**`edda65a44`**（与派单预期「现 tip 应 `edda65a44` 或更新」恰等）。
2. U5a：regw-REQUEST.md `:3` 亲读——STATUS-RECON 翻面注（`closed`·2026-11-03）与 errata 扫尾补转注（`proofed:dual_pass`·2026-11-03）并存·补转注居行尾后位·§9-EXEC `:497` post-prove 双席 BOTH PASS 亲读在卷。
3. U5b：rc-REQUEST.md 已并 #194（merge `82b0cd4ee` 亲证）·blob `3f467328`→现树 410 行·四子项 `:44`/`:21`/`:245`/`:230` 同位亲证仍在（err-REQUEST §2-7 条目 7 预登移交·`§8` 排除钉「移交 rc 勘误轮」原文亲读）；受管提取器 `node scripts/ai-docs/request-status-recon.mjs` 只读实跑 EXIT=0——「两读差异卷=31（25+1+1+2+1+1·残差=0）」+resume-grounding raw=R2:185+ci-wiring raw=R2:98 三值亲证。
4. U5c：gap-bug-backlog.md `:109` GAP-G7K-API-REDS 行亲读（P1 OPEN·三红旧形）·`:803` G7K-REDS-REMAP 勘误注亲读；qgen-critique-resilience-REQUEST.md 与 submit-flow-competency-wire-REQUEST.md 两卷翻面注 `有效态翻面→closed` 亲读在树。
5. U6 五卷逐卷全文亲读（b110 178 行/errmsg-map 125 行/extrev-deps-audit 201 行/extrev-score-writer 145 行/money-status-proof §8-§11 区段）——裁定证据见 §4。
6. U7：g7-enoent-fix-REQUEST.md 72 行全文亲读——全卷零 canonical 状态 token（rc 普查「无状态行 1」桶唯一卷·`rc-REQUEST.md §0.2 :34` 亲读）。
7. U8：八树逐树亲跑 `git merge-base`/`rev-list --count`/`diff --stat`/first-parent 自有面（读数见 §6 表）；八树 `merge-base --is-ancestor origin/main` EXIT≠0 亲证（全部未并）。
8. U10：task-sop.md 95 行全文亲读（§1-§10 十节·frontmatter version 1）·err-REQUEST §2-6 纪律全文亲读（`:65`）。

## §1 U5a 行使（regw `:3` 终裁注·additive）

落点=`ai-docs/delivery/harness/regw-REQUEST.md:3` 行尾 append。行使文本（逐字已落卷）：

> 【终裁注 2026-11-05（fin 台账收官刀 U5a·协调方终裁授权行使·append-only·本行既有字零字节改写）: 本行并存两注——STATUS-RECON 翻面注（有效态翻面→`closed`·2026-11-03）与 errata 扫尾补转注（状态补转 `proofed:dual_pass`·2026-11-03）——终值裁定=**`proofed:dual_pass`**（取时间后位+授权精度：补转注居行尾后位·post-prove 双席 BOTH PASS 在卷（§9-EXEC `:497` 亲读）·nail #187 merged `5c94266b1` 承并亲证（merge-base --is-ancestor origin/main EXIT=0）——两注并存史录零洗·本注只钉终值读序非二次翻面·翻面/收官权归协调方】

## §2 U5b 行使（rc 四子项勘误注·err §2-7 移交兑现·additive）

落点=ai-docs/delivery/harness/rc-REQUEST.md 四处行尾/行内 cell append（各行既有字零字节改写）：

1. `:21`——①R2 例「resume-grounding `:3` 空头→`:186` 形」实锚=`:185`（`:185`=`- Status:` 形行亲读+提取器 raw=R2:185 复现）；②R6 例「（ci-wiring `:86` 形）」系 R6 锚类正形但 ci-wiring 卷选定读法=R2（提取器 raw=R2:98·「R2 后于 STOP 行出现仍压 STOP 锚」规则命中）——随 `:230` 同勘。
2. `:44`——「两读差异 33 卷」系 r2 时点值残留→提取器只读实跑复现 **31**（25+1+1+2+1+1·残差=0）·行内自列枚举 31 自洽·§1 附录 `:253`「两读差异 31 卷」互证。
3. `:230`——ci-wiring 表行 raw 读 cell「draft（R6 STOP ·）」应读 **R2**（提取器 raw=R2:98）·终值层 nailed 不变。
4. `:245`——「`:188` 「EXEC 状态行」节」实锚=`:187`（`:187`=节头/`:188`=空行/`:189`=态字行·`:189` 自引恒等零改）。

四注均钉：勘的=登记面引注非行状态·零翻面·err-REQUEST §2-7 条目 7 预登移交兑现（届时若 rc 已自修则免勘——现值亲证四子项残留·逐条如实勘）。

## §3 U5c 行使（backlog `:109` G7K 定性收官勘误注·additive）

落点=`ai-docs/delivery/gap-bug-backlog.md` 文件尾落位（沿 ID→唯一行对账表「落位=文件尾为零位移」先例形）·`:109` 行与既有各注原文零字节改写。行使文本（逐字已落卷）：

> **2026-11-05 · G7K-REDS 定性收官勘误注（fin 台账收官刀 U5c·协调方终裁授权行使·append-only · 文件尾落位（沿 ID→唯一行对账表「落位=文件尾为零位移」先例形）· `:109` GAP-G7K-API-REDS 行与既有各注原文零字节改写 · 行状态零翻转——P1 OPEN 维持 · 本注只更新定性非翻面）**: 产品语义已落卷闭合——QGEN-CRITIQUE-RESILIENCE（PR #108 `112e6d26f`·帽内换序降格）与 SUBMIT-FLOW-COMPETENCY-WIRE（PR #110 `26ec18425`·submit 补供）两产品语义 REQUEST 卷均已 EXEC 落码且 STATUS-RECON 对账刀翻面 `closed`（两卷卷内翻面注亲读在树·`有效态翻面→closed`）；`:803` G7K-REDS-REMAP 行勘误注（红② abandon 409 verified-green·红①③残余收敛「出题批判门单发即终场」新根）与本注定性相承不悖——**本行剩余面=trio 三红 live 复验（归 G7 trio 执行）**；行关闭仍须其自身修复刀全链（沿行原文口径·本注不翻面·翻面/销案权归协调方）· trio/`g7SuiteGreen=false`/Pins 零动。

## §4 U6 五 draft 亲读处置（裁定+落点）

| 卷 | 卷载证据（亲读行号） | 裁定 | 落点 |
|---|---|---|---|
| b110-REQUEST | `:3` 链（EXEC `exec_landed`→backfill_mw-core post-dual 双席 BOTH PASS 席1 `cbc89a72`+席2 `1da18412`）+§9.1 亲读+§9.2 重编号 0152→0155+§9.3 主线复跑 | **翻 `closed`** | `:3` 行尾 append 翻面注·承并亲证=`packages/db/migrations/0155_recruiter_approval_gate.sql` blob `670a4a266` ls-tree 亲跑·残面如实注（neg:auth 3 预存红/e2e 适配面后继刀/push 冻结标的随承并消解） |
| errmsg-map-REQUEST | `:108-116` rev2 双审 BOTH PASS+`:118-124` EXEC 收口（`exec:done_prove_green`·web:prove 第 1 次 EXIT=0 199 PASS·attempts=1） | **翻 `closed`** | `:3` 行尾 append 翻面注·承并亲证=`apps/web/lib/errors/action-error.ts` blob `c27014844` ls-tree 亲跑·rc 普查「`:120` 纯复述行」史录如实注·收据源卷自述如实注 |
| extrev-deps-audit-REQUEST | `:181-189` S1 EXEC done（critical 3→0）+`:191-199` S2 EXEC done（deps-audit.yml+renovate.json）——S3 未起·双审后 post-prove 未行使 | **维持 draft+残面注** | 卷尾 append 残面登记注（零翻面·派单简报「S2 未起」与卷载 S2 已落不符按卷载如实裁定） |
| extrev-score-writer-REQUEST | `:122-132` S1 EXEC+续作+`:134-143` S2 EXEC 落地（interview:prove 33 PASS·scoring-integrity base 红同形）——S3 未起·冲突裁决面结构性不可达·post-prove 未行使 | **维持 draft+残面注** | 卷尾 append 残面登记注（零翻面） |
| money-status-proof-REQUEST | `:142` §10 撤回（三处改回 draft·撤回未提交的状态翻转）+`:160` §11「现以 §11 为准」·rc 附记-丙已钉 | **维持 draft（零字节·零新注）** | 附记-丙承登即本裁定·本刀零触该卷 |

净翻面=恰两卷（b110/errmsg-map）·与派单令「U6 可翻两卷」恰等。

## §5 U7 行使（g7-enoent-fix 普查正形登记注·additive·原卷零字节）

落点=ai-docs/delivery/harness/g7-enoent-fix-REQUEST.md 文件尾 append（原卷 72 行零字节改写）。行使文本（逐字已落卷）：

> **2026-11-05 · fin 台账收官刀 U7 普查裁定登记注（append-only · 文件尾落位 · 原卷零字节改写 · 无状态行=正形维持 · 零翻面）**: STATUS-RECON 对账刀普查（274 卷·`scripts/ai-docs/request-status-recon.mjs` 六锚口径·锚定基线 `e647fcffa`）对本卷裁定「无状态行」桶=**正形**（普查读数「无状态行 1·g7-enoent-fix（全卷零状态 token·亲证）」在 `rc-REQUEST.md §0.2` 亲读·六锚全空亲证）——本注只登记裁定·**不补状态行**（补行=改卷形·非本注职权）·卷内既有证明面原样维持·处置/翻面权归协调方·Pins 零动。

## §6 U8 八陈旧树处置登记表（只登记不删·零树零分支零 worktree 触）

| 树/分支 | tip·date | ahead/behind | 自有差异面（亲跑） | 吸收状态（亲证） | 三选一裁定建议 |
|---|---|---|---|---|---|
| ag18 / `line/ag18-draft` | `4c2ea4c9f`·2026-10-18 | 2588/3470（ancient 分叉·含骨架波史膨胀） | 233 files +18999/−381（first-parent 含 AG-09 REQUEST rev1+replay-first 落码+部署校验/打卡键波） | **核心面已被主线承并**：`packages/db/migrations/0209_ag09_replay_first_claim.sql` 在 origin/main 树 ls-tree 亲证 | 归档（worktree 撤·分支留——主线已承核心·分支留史录） |
| ag20 / `line/ag20-residual-draft` | `4cea5010c`·2026-10-26 | 1/503 | **零差异**（树与 merge-base `f0e6612e8` 恰等·`diff --name-only`=0 亲证——空面 merge tip「预演零冲突」） | 空面（承并已实质完成） | 归档（零内容可并入·worktree 撤·分支留） |
| cap72 / `line/cap-2272` | `52846f9d8`·2026-10-26 | 2590/3470（ag18 同窗叠加 2 commit） | cap 步进 2264→2272 两 commit（起草+落字） | **已被 CAP-SANCTION 链吸收**：主线现 cap=2479>2272（`public-text-policy.mjs MAX_FILES` 亲读） | 归档（cap 算术过期·worktree 撤·分支留） |
| loadw / `line/loadw-exec` | `62f75399d`·2026-10-27 | 1/339 | 1 file 1+/1−（case-matrix NHP-015-LOAD-w-01 行红停登记） | **已被主线吸收**：主线该行现文自载「并入自 line/loadw-exec `62f75399d`」（`:98` 行亲读） | 归档（红停登记已承并·worktree 撤·分支留） |
| pay / `line/online-pay-draft` | `fdaa1ecf0`·2026-10-26 | 1/494 | +144（harness/online-pay-REQUEST.md 初稿·provider 契约/适配器骨架/回调幂等） | **未并**（主线树零 `harness/online-pay-REQUEST.md` ls-tree 亲证）——本刀授权面「除买云外」存留线 | **rebase 重入**（唯一存留在飞产品线·归协调方排期——买云面不属本刀「全部完结」授权域） |
| scoringeval / `line/scoring-eval-exec` | `bed65e869`·2026-10-27 | 1/297 | 2 files +136（checklist 15 行+`receipts/scoring-eval-exec/01-scoring-eval-stdout.log` 121 行红停如实录） | **主记录已被主线吸收**：E2EA-01 键域红停承登于主线 checklist `:4495`（screg 卷·红停面已裁）·本支独有=raw stdout log | 废线保留（主记录已承并·raw log 如需补档另行单件移交·不重入） |
| state / `line/campaign-state` | `9f642762d`·2026-10-26 | 2593/489（含主线 merge 波） | 327 files +11598——**326 件=.tmp/\*\*（git 卫生违例面：.tmp 永不进 git 纪律）**+1 件 `apps/worker/test/commerce-reconcile.proof.ts` | 交接快照线（内容已被主线归档路径承并代偿） | **废线保留**（禁重入：rebase/merge 将携 .tmp 面入 git·分支留史录） |
| uc31 / `line/uc31-draft` | `112ac8af0`·2026-10-26 | 1/492 | +114（harness/uc31-REQUEST.md 申请卷·两臂收据+零接线如实登记+套件分期） | **未并**（主线树零 `harness/uc31-REQUEST.md` ls-tree 亲证） | rebase 重入（结构面第一期申请卷·排期/废线归协调方裁量） |

登记纪律：八树 `merge-base --is-ancestor origin/main` EXIT≠0 亲跑（全部在飞未并如实采）·两 policy 脚本触面=g7w-draft 2 件（共享热面）其余六支 0 件亲跑·**零删除零归档动作**（worktree/分支全数原样·处置执行归协调方）。

## §7 U10 成文落位（SHA 分注纪律）

落点=`ai-docs/meta/task-sop.md` 文件尾新增 **§11. SHA 分注纪律（多刀通用 · additive 成文）**——既有 §1-§10 与 frontmatter 零字节改写。内容=err-REQUEST §2-6 登记纪律全文精炼：支线 nail SHA（含 `ccl/*` refs 侧 main 历史重建不携对象者·须注明 refs 侧与 `git cat-file -t` 形）与主线携入 SHA（merge/squash 并线落 main·须注明 `git merge-base --is-ancestor` 亲证）分注双值·禁单值混引·内容权威面恒以 SSOT 段+现树现值为准（SHA 仅为引注）·首例形与成文载体引注 err-REQUEST §2-6。err 卷原钉「SOP 级成文落位归协调方裁决·本卷不代改」——本落位=协调方终裁授权行使。

## §8 STOP / 状态

**STOP · `proofed:dual_pass`（2026-11-05 post-prove 双席两独立外席 BOTH PASS 落卷转·前值 `executed:awaiting_post_prove_dual` 史录保留·详 §9 post-prove 记录） · alone≠dual。** 起草+行使随令同卷落卷（协调方终裁授权「除买云外全部完结」随令行使·沿 err rev r1 转录先例形）；post-prove 双审两独立外席留协调方派席·翻面/关账权归协调方·Ban self-approve·Ban retry-to-green·⛔push ⛔动主仓。状态钉三处：Status 行+本节+卷尾·同值。

## §9 cap 届值步进预登（CAP-SANCTION-2480）

- 届值如实采：origin/main `edda65a44`=#198 l13-draft 已并——main 届扫 **2479**=cap 2479 恰等（fin worktree 落卷前 docs:check EXIT=0 scanned 2479 亲跑）。
- union 算式：main 届扫 2479+本卷 `harness/fin-REQUEST.md` 受管 1 件=**2480** 恰等零多放·协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1（2479→2480）。
- EXEC 期=全部行使面既有 .md in-place append+两 policy 脚本 cap 联动（非受管计面）零新受管文件→**EXEC terminal=2480 零新增**。
- 四联动点恰等改（本 commit 同体兑现）：①`scripts/ai-docs/public-text-policy.mjs` MAX_FILES 2_479→2_480+CAP-SANCTION-2480 注记入链区②`scripts/ai-docs/public-text-policy.proof.mjs` loop（i<2_480）/atCap（scannedFiles 2_480）/overCap（f-2480.md/FILE_LIMIT:2481）三处恰等改+CAP-SANCTION-2480 注记入 proof 链区。
- 在飞如实采按届枚举：df/rc/flip/err/l13/audit/uc011adv 七支**已并出名单**（`merge-base --is-ancestor` EXIT=0 亲跑——l13/uc011adv 本届消·g7w 未并如实列）·g7w-draft `27b5c940b` 未并（两 policy 触面 2 件=已知共享热面 dual-keep 先例形如实列）·ag20/loadw/pay/scoringeval/uc31 各 ahead=1 两 policy 零触·campaign-state 含 .tmp 面如实注·ag18/cap-2272 ancient 分叉不预采（沿 CAP-SANCTION-2479 承列）。
- 先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减·PTP 12/12 亲跑。
- **post-prove 记录（2026-11-05 双席两独立外席 BOTH PASS 落卷 · 本节 append-only 不改既有字）**：post-prove 双席两独立外席 **BOTH PASS**（席1 七项独立复算+席2 证伪未推翻·协调方派单令明示·本席按令转录·沿 l13/df 卷 post-prove 记录先例形）→ 状态三处（Status 行+§8+卷尾）转 **`proofed:dual_pass`**（翻面/关账权归协调方）。关键读数（双席独立亲读同值·落卷时本席对树复认亲跑）：U5a regw `:3` 终裁注在树（两注并存史录零洗·终值=proofed:dual_pass 取时间后位+授权精度）；U5b rc 四子项勘误注在树（提取器只读实跑三值复现 31=25+1+1+2+1+1·resume-grounding raw=R2:185+ci-wiring raw=R2:98）；U5c backlog 文件尾定性收官勘误注在树（`:109` 行 P1 OPEN 维持零翻面·carrier 引注错挂见双席 P2 登记）；U6 b110/errmsg-map 两卷翻面 closed+extrev-deps-audit/extrev-score-writer 两卷残面注+money-status-proof 附记-丙承登零触；U7 g7-enoent-fix 卷尾正形登记注在树（无状态行=正形维持）；U8 八树登记表只登记不删零树触；U10 task-sop §11 SHA 分注纪律在卷；cap **2480 恰等**。origin/main 届核 fetch 亲证=`edda65a44` 恰等本支 base（零前进→零 rebase·cap 2480 维持）。三门落卷时点复认亲跑全绿：门 1 docs **EXIT=0 · scanned 2480 = cap 2480 恰等**；门 2 PTP **12/12 EXIT=0**（`static_preflight_valid`）；门 3 markers=改动集新增字节直扫 **0 命中**（落卷期读数 139 行·词面运行时组装·i6-239 §2-7 口径）。双席 P2 登记（全部登记不修·修法/处置权归协调方·本卷行使面零触）：**席1** ①U5c 引注错置 P2（席2 证伪读数=U5c QGEN carrier=#110 非 #108·§3 行使文本引注 #108 系错挂·留后继勘误）②行数誊写滑差 ③cap 并线冲突前瞻（在飞 g7w 承 2481/r2·idu 承 2480 竞争·常设预授权随届值取大如实采）④P3×2 备查；**席2** ①U5c carrier 错挂同判（QGEN=#110 非 #108）②P3×2 备查（细则以协调方台账为准·本席按令转录）。est live=0 · actualSpendCny=null · ⛔push。

## §10 三门读数（落卷时点亲跑·worktree=meetwise-fin）

1. **docs 门**：`node scripts/ai-docs/check-docs.mjs`——落卷前基线 EXIT=0 `scanned 2479`（cap 2479 恰等亲证）；落卷后（本卷+cap 步进同体）EXIT=0 **`scanned 2480`**=cap 2480 恰等。
2. **PTP 门**：`node scripts/ai-docs/public-text-policy.proof.mjs`——EXIT=0 **12/12**（四联动点步进后越限臂/atCap 臂/邻面零触/markers 双声明全绿）。
3. **markers 门**：新增字节直扫口径（本刀 diff added lines）五类标记词（词面沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装防自指口径·本卷不拼词面+行首冲突标记双形）**0 命中**。

## §11 停止条件核查（五条全未触发）

file:line 与实际代码逐条核对相符（§0 五项亲读）/机制满足预期（提取器三值复现）/无验收红（三门全绿·随届值如实采）/零越界（禁改范围=产品码/迁移/在飞他线全未触·U8 只登记不删·.tmp 仅派单令明示路径除外零触）/est live=0。

---

*fin 台账收官刀 · 2026-11-05 · proofed:dual_pass（2026-11-05 post-prove 双席两独立外席 BOTH PASS 落卷转·前值 executed:awaiting_post_prove_dual 起草+行使随令同卷 史录保留） · base origin/main `edda65a44`=#198 · 工作区 meetwise-fin（line/fin-draft） · 行使面=U5a regw 终裁注+U5b rc 四子项+U5c G7K 定性注+U6 两卷翻面两卷残面注一卷维持承登+U7 正形登记注+U8 八树登记不删+U10 task-sop §11 成文 · CAP-SANCTION-2480 恰等步进预登（2479→2480·四联动点恰等改） · 三门 docs 2480=cap/PTP 12/12/markers 新增字节 0 · est live=0 · actualSpendCny=null · post-prove 双审留协调方派席 · 翻面/关账权归协调方 · ⛔push ⛔动主仓 · alone≠dual*
