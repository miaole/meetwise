# STATUS-RECON REQUEST（harness REQUEST 状态对账刀——274 卷全量普查·executed*/proofed* 160 卷逐份并线考证·四类归类·executed 历史台账债分批翻面计划·起草落卷即停·零字节翻面·行使留 EXEC 期）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-11-03 EXEC 行使落卷·前值 `draft:awaiting_pre_exec_dual`（起草 2026-11-03 落卷·rev r1 回炉修订 2026-11-03 落卷（§6）史录保留·rev r2 post-prove 回炉修订 2026-11-03 落卷（§6b·席2 P0 漏翻证伪零漏翻→两读制算法化复跑·B5 增批 21 卷待行使·dual r3 复核位）史录保留）·EXEC=131 卷四批行尾 additive 翻面注行使已落（§9-EXEC 记录·pre-exec 双审 r2 两席 BOTH PASS+协调方裁定 131 明示 EXEC 授权）·B5 增批行使待 dual r3（§2/§9-EXEC）·est live=0·Ban self-approve·alone≠dual·⛔push·状态钉三处：本行+§8+卷尾·同值）

**席位**：北星「STATUS-RECON」REQUEST 状态对账刀起草席（协调方派单·主会话四门复评实测移交·本席只起草不行使）。
**基线**：`origin/main` @ `e647fcffa`（fetch 后亲证 `git rev-parse origin/main`=`e647fcffaccb8c955b9538c85d12a643999ae1ee`=PR #191 ha1 并线点）·分支 `line/rc-draft`·工作树 `meetwise-rc`（仓根同级·`git worktree add ... -b line/rc-draft origin/main` 本席亲立·`-b` 成功即分支建前不存在的机证·EXEC 期 rebase 对届后 LOCAL_PATH 门修：绝对路径字面沿 flip-REQUEST 先例改省略形·语义不变）。
**性质**：机械对账刀（零产品码·零迁移·零 proof 改动·唯本卷 1 tracked 新件）·每份 executed/proofed 状态 REQUEST 核其分支/PR 是否已并 origin/main→已并者拟批量翻面（行使留 EXEC）·未并/停摆/不可考者如实保留归类。
**pins（十一值照抄零翻）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false · alone≠dual · Ban self-approve · Dual PASS ≠ 开工。

## §0 现状锚（普查只读·全数亲证 @`e647fcffa`·每条给命令+读数·禁凭印象）

### 0.0 防重三查 + 在飞交叠复核

- `git worktree list`：建后实测主仓+13 树（mw-main-check/meetwise-ag18/ag20/audit/cap72/flip/ha1/led/loadw/nk1/pay/scoringeval/sse2/state/uc31/rc 本席）——**零第二 rc 树**。
- `git rev-parse --verify refs/heads/line/rc-draft`：建前 BRANCH_ABSENT 亲证——**零同名刀卷/分支**（`ls ai-docs/delivery/harness/ | grep -i '^rc-'` 于 `e647fcffa` 零命中）。
- 在飞交叠：本刀只触 `ai-docs/delivery/harness/rc-REQUEST.md` 一新件·**与全部在飞线（sse2 `5272ae7f0`/flip `ba38b7356`/nk1/pay/scoringeval/uc31/campaign-state 等）触面零交集**（各线 WORKTREE 均在·`git merge-base --is-ancestor` 亲证 sse2/flip 两 tip 均 NOT ancestor of origin/main=在飞未并如实采）。

### 0.1 普查方法（命令在案·锚定本卷基线提交·可复跑）

1. 卷全集：`git ls-tree -r --name-only e647fcffa -- ai-docs/delivery/harness/ | grep REQUEST` → **274 份**（`wc -l` 亲证·**命令锚定基线提交**——origin/main 届 tip 已进 `36740147b` 后树增 sse2 一件·锚定基线方保可复跑）。
2. 状态提取（**rev r2 回炉两读制算法化**·全量可复算·复跑校验=274 卷恰等登记读数）：对每份 `git show e647fcffa:<path>` 取 canonical 状态 token（`executed/closed/draft/proofed/stopped/exec_landed/post_prove_dual_pass` 及 `:子值`/`_revN` 形·backtick/bold 包裹剥除后判）·**每卷两读·raw≠注记即出双向差异清单**（①向=raw 读 executed 而清单漏收·r1 已修·rev r2 复验零残；②向=raw 读 draft 而卷内权威注记翻 executed 族·rev r2 新修 21 卷=席2 post-prove 举证 15+全量复跑新增 6）。**raw 读法=六锚优先级**（取首中锚行的首个 canonical token·行中嵌入 token 一律 prose 混入不取）：R1 卷首 title 行 `STOP=` 赋值（event-ttl `:1`/ai-graphs-cycle-break `:1` 形）→ R2 Status/状态 头行（首个 `**Status**:`/`**状态**:` 形行·后于 STOP 行出现仍压 STOP 锚：ci-wiring2 `:128`/baseline-red5 `:3`/ag-cost5 `:3`/ag24-langfuse-model `:3` 形）→ R3 行首裸 token 行=token 前后零 prose（行内除 token 本体与 wrap 记号外零其他字·resume-reread-status `:1`/money-status-proof §8 `:108/:112/:114`/quiz-loopback-host §8 `:174/:178/:180`/closed-job-start `:1`/boundary-rule-single §8 `:76/:80/:82` 形）→ R4 行首态行=行首 wrap token+紧随括注（2026-10-15 滞后翻面批 closed 行形：negresume-driver-fix/obs-logging/obs-ready `:3`）→ R5 其余 `STOP=` 赋值行（baseline-red5 `:29` 形·被 R2 压）→ R6 `STOP ·` 值行（ci-wiring `:86` 形）；六锚全空=无状态行（g7-enoent-fix）。**校验亲证**：六锚读法对 274 卷复跑=closed 99/executed 族 134/draft 族 35/proofed 4/post_prove_dual_pass 1/无状态行 1·与登记读数恰等（r0「携带 Status/状态/STOP 字样的行」全行取词口径过宽=resume-reread-status/money-status-proof 误归根因·史录）。**注记终值读法（有效态层·全卷扫·取末条命中行）**：权威翻面注记行=链形（token → token·取最后 `→` 后首 token）∪ 强标记形（`Status 翻面`/`STOP 现值|终值|终态`/`本注记为权威`/`现以 §`/`post 双审会签 PASS`/`post-prove 双席 BOTH PASS`/`Status 链补全|演进补登`/`EXEC 期终态注记`·取行首 token）∪ `STOP=` 赋值附记形。**rev r1 手工例举三形（附记-乙「本注记为权威」smoke-env-fix `:3`/附记-丙「撤回+现以 §」money-status-proof §10/§11/附记-丁「→ `closed` 终态注记」uc003-arm4-filter `:3`）降为该算法的特例校验样本**——r1 只手挑三卷应用、未做②向全量扫描=post-prove 席2 P0 根因。**增批三判据（同时满足方入翻面清单）**：①注记终值 ∈ executed 族（`executed:*`/`nailed`/post-PASS/`nail:closed`）②carrier merge 亲证（C_last walk 首中或 squash 本体）③逐卷亲读核定；trio 3 卷各缺一判据保持桶位注记（§0.2·处置权归协调方）。提取对 274 份全跑·计数见 §0.2；**EXEC 复跑沿用本节同一口径·禁另起口径**（保持可复算性）。
3. 并线考证（executed*/proofed* 137 份逐份）：①取卷最新触卷 commit：`git log e647fcffa --full-history --no-merges -1 --format='%H' -- <path>`；②找承载 PR merge：沿 `git rev-list --first-parent --merges e647fcffa`（97 记）自新向旧逐个测 `git merge-base --is-ancestor <C_last> <M>^2` 且 **NOT** `--is-ancestor <C_last> <M>^1`（带入判据·防 rebase 后支线 tip 恒真假阳）→ 首中即承载 merge·PR 号取其 subject；③无承载 merge 者回查 C_last 本体 subject（squash 形携 `(#N)` 号）。
4. 代码级抽验（佐证「卷并=刀并」机械代理）：ag17→`git grep -c schema_invalid origin/main -- packages/ai-runtime/src/trace.ts`=1 且 schema_retry 旧值=0（改名真落）·worker-hang-guard→`git grep -c watchdog origin/main -- apps/worker/src/drain-loop.ts`=18（watchdog 真落）·boundary-rule-single→`git grep -c UNTRUSTED_DATA_BOUNDARY_RULE origin/main -- packages/ai-runtime/src/model-client.ts`=0（第二份文案已按刀清除）。

### 0.2 普查读数（274 = 以下六桶·rev r2 回炉两读制重列：raw 提取层史录+有效态层现值·差异清单与增批三判据见 §0.1-2）

| 桶 | 计数 | 明细 |
|---|---|---|
| `closed` | 99 | 含 2026-10-15 协调方授权批量滞后卷对账翻面批（negresume-driver-fix/obs-logging/obs-ready 等先例）与 uc004-e2e 等 |
| executed 族 | **155** | 有效态层=raw 层 134（子桶 `executed:awaiting_post_prove_dual` 127〔含裁定 131 增补 2：closed-job-start `:1` bare/quiz-loopback-host §8 `:174/:178/:180` 三处 bare·史录；r1 读数史录含 resume-reread-status `:1` 卷首 bare + money-status-proof §8 三处 bare 勘正；含 stream-known-executed §8 `:119` 实值〕+`executed:awaiting_post` 5+dual_pass_nail 1+stopped_gate_red_escalated 1·史录）+ **rev r2 回炉注记终值入簇 21 卷**（B5 增批·§1 逐卷证据表）：终值 `executed:awaiting_post_prove_dual` 7（obs-family/bill1-topic-fields/bill2-shadow-meter/bill3-settlement/bill4-ledger-list/db-acl-residual/ci-red-clear）+`nailed` 13+post-PASS 1（ai-graphs-cycle-break）+`nail:closed` 1（g2-report-page）⇒ 有效态子桶 awaiting_post_prove_dual 134+awaiting_post 5+nail 1+stopped 1+**nail 终值 14**=**155** |
| draft 族 | **14** | 有效态层=raw 层 35 − rev r2 回炉移出 21 = 14·净 draft 11（ag25-replay-residual-erratum/ag35-legacy-api-erratum/entpay-slice2/errmsg-map/extrev-deps-audit/extrev-score-writer/growth-gen/h5-role-input/resume-grounding/tokstream-s4a+safewrite-backpressure `draft:rev3` 形）+ **桶位注记 3 卷（安全向如实注·两读层桶计均不动·处置权归协调方）**：event-ttl 卷 `:3` Status 权威已翻 `closed` 族（2026-10-26 协调方收官翻面·PR #135 merged `36c41ac35`·缺增批判据①·判据②在卷）、b110 卷 `:3` Status 链 `exec_landed:awaiting_dual_review`（缺判据①）、evidence-delivery 卷 `:3` Status 链终值 `nailed`（post-prove 双席 BOTH PASS @2026-10-11·carrier 未立证缺判据②）·史录：r1 37−裁定 131 移出 2=35·裸 draft 3（b110/evidence-delivery/resume-grounding）+`draft:rev3` 形 1 |
| `proofed:dual_pass` | 4 | ha1 / led / nk1 / quizdx |
| `post_prove_dual_pass` | 1 | uc017（PR #138 已并） |
| 无状态行 | 1 | g7-enoent-fix（全卷零状态 token·亲证） |
| **合计** | **274** | 99+155+14+4+1+1=274 `git ls-tree` 计数恰等·rev r2 回炉两读制重列（raw 层史录读数 99/134/35/4/1/1 仍按 §0.1-2 六锚可复跑） |
| 卷内权威裁定（不另计·EXEC 行使按此排除） | 3 卷 | smoke-env-fix→closed（附记-乙）· money-status-proof→draft（附记-丙）· uc003-arm4-filter→closed（附记-丁） |

r0 桶表 executed 129/裸 draft 7 系提取法漏（§0.1-2 根因·发布桶无法由在案方法复算）·机器真值（席1 全量复算）executed **132**/裸 draft **5**·差额恰此 2 卷误归·rev r1 勘正并如实登记。

**r1 子桶不合勘误登记（rev r2·协调方裁定 131 回执）**：r1 executed 行总 **132** 与其子桶行 125+4+1+1=**131** 不合（子桶行漏列 smoke-env-fix·awaiting_post 实为 5）·r2 按 §0.1-2 同口径对 274 卷全量复算子桶真值 **127/5/1/1=134**（亲跑在案）：awaiting_post_prove_dual 127 = r1 125 + 裁定增补 2（closed-job-start `:1` bare/quiz-loopback-host §8 三处 bare——两卷 r1 未入 §1 ① 清单：前者漏斗同 resume-reread-status 形·后者 §8 bare token 读法分歧）·awaiting_post 5 = r1 4 + smoke-env-fix 漏列勘正·nail/stopped 子桶 1+1 恰等。draft 族行 r1 37 → r2 35 = 274−99−134−4−1−1（账目自洽兜数·含 quiz-loopback-host/closed-job-start 移出；event-ttl 真值复算归 closed 族其桶位注记已如实落上行·桶计终裁归协调方）。

**rev r2 回炉复跑登记（post-prove 席2 P0·2026-11-03）**：r1「注记优先读法」系手工例举（只手挑附记-乙/丙/丁三卷·只处理「raw executed 清单漏收」①向·未做「raw draft 但卷内注记翻 executed 族」②向全量扫描）——席2 post-prove 实测证伪「零漏翻」举证 ≥14+1 卷。本席按 §0.1-2 算法对 274 卷双向全量复跑：①向复验零残（raw executed 134 = ① 131+附记-乙/丙/丁 3·集合恰等亲证）；②向命中 **21 卷**（席2 举证 15 卷逐卷亲读全数成立+全量复跑新增 6 卷：authz-harden `:3`/diag-honesty `:3`/h2-qbank-corpus `:3` 同形 nail 补登链、ci-red-clear `:203` STOP 终态、g2-report-page `:97` Status `nail:closed`、ha-6-companion `:171` → `nailed`·六卷 carrier 均亲证 #108 `112e6d26f`）·逐卷证据表见 §1·桶表重列 155/14·① 131→**152**·②③④ 维持 0/0/0。

### 0.3 与四门复评口径差异（两侧同法同盲区·非独立佐证·差异归属如实登记）

四门复评席实测（closed 103 / executed 130 / draft 32 / proofed 3 / 无状态行 5 = 273）vs 本席机扫（§0.2 = 274）。r0 曾以「executed 恰等 130」为两读数独立佐证——**rev r1 撤销该宣称**：四门 executed 130 = 本席新读法 132 − 同漏 2 卷（resume-reread-status/money-status-proof）·两侧同法同盲区·130 系假阳契合·非独立佐证。其余差异归属如实登记不猜（符号=本席−四门）：总数 +1（ha1-REQUEST.md 于四门扫后由 PR #191 并入=最可能项·四门扫描时点不可考）；closed −3~−4（本席 99 vs 四门 103：批量滞后卷对账翻面批登记面口径差·四门口径未附逐卷清单·本刀不代裁）；draft +5（本席 37 vs 四门 32：本席族口径将裸 draft 5+rev3 归 draft 族）；proofed +1（本席 4 vs 四门 3：ha1 #191 并入转 proofed:dual_pass 时点）；无状态 −4（本席 1 vs 四门 5：无 Status 头行古卷形读法差——boundary-rule-single 形凭 §8 `:76/:80/:82` 行首 token 读 executed·本席不计无状态行）。四门口径未附逐卷清单·本刀不代裁·EXEC/协调方可按 §0.1 口径复跑对账。**复算独立 ≠ 算法独立（rev r2 补申明）**：席1 r1 全量复算系复用同一提取算法的重跑——复算独立（同算法重跑同数）不构成对算法偏置的独立校验；算法偏置唯能由算法变更消化（rev r2 两读制双向扫描即算法变更本体）·不能由同算法复算消化·本申明撤净一切「复算=独立佐证」残余暗示。

## §1 四类考证结论（executed*/proofed* 160 卷逐份全考·零凭印象·rev r1 勘正·裁定 131 增补·rev r2 回炉增批重列）

**对账判据（机械代理声明）**：「刀已并线」= 卷最新触卷 commit（full-history 无剪枝）已属 origin/main 可达集·落定形态为 PR merge commit 或携号 squash commit。卷文本（含 §9-EXEC 落码记录与 blob 锚）既已在 main·其支线 EXEC 落码内容并线即为该 merge 所携带——代码级抽验三卷佐证（§0.1-4）。

### ① 已并→可翻 closed：**152 卷**（r1 129 + 裁定 131 增补 2 + rev r2 回炉增批 21 = 113 + 31 + 8·三类承载证据全列·B1-B4 已行使 131·B5 增批 21 待行使（§2·dual r3 复核位））

##### ①-甲 PR #110 merge `26ec18425` 承载 113 卷（108 + 裁定 131 增补 2 + rev r2 回炉增批 3）
- 5c-behavior-trio — line/5c-behavior-trio — PR #110 merged 26ec18425
- 5e-cleanup-sweep-2 — line/5e-cleanup-sweep-2 — PR #110 merged 26ec18425
- 5e-cleanup-sweep — line/5e-cleanup-sweep — PR #110 merged 26ec18425
- ag09-replay-first — line/ag-next-draft — PR #110 merged 26ec18425
- ag15-observability — line/ag15-observability — PR #110 merged 26ec18425
- ag16-resume-proof — line/ag16-resume-proof — PR #110 merged 26ec18425
- ag17 — line/ag-next-draft — PR #110 merged 26ec18425
- ag18-sampling-temperature — line/ag-next2-draft — PR #110 merged 26ec18425
- ai-graphs-cycle-break —  — PR #110 merged 26ec18425（rev r2 回炉增批·C_last `b88d497d3` walk 首中亲证·`:66/:103/:105`·B5）
- ag43-dual-half — line/ag43-dual-half — PR #110 merged 26ec18425
- api-harden-family — line/api-harden-family — PR #110 merged 26ec18425
- assert-strengthen — line/assert-strengthen — PR #110 merged 26ec18425
- boot-validate — line/boot-validate — PR #110 merged 26ec18425
- boundary-rule-single —  — PR #110 merged 26ec18425（古卷无 Status 头行·状态凭 §8 `:76/:80/:82` 行首 token 读·归簇登记不另立类别）
- cap-sanction-2208 — line/cap-sanction-2208 — PR #110 merged 26ec18425
- cap-sanction-2216 — line/cap-sanction-2216 — PR #110 merged 26ec18425
- cap-sanction-2224 — line/cap-sanction-2224 — PR #110 merged 26ec18425
- cap-sanction-2232 — line/cap-sanction-2232 — PR #110 merged 26ec18425
- cap-sanction-2248 — line/cap-sanction-2248 — PR #110 merged 26ec18425
- cap-sanction-2256 — line/cap-sanction-2256 — PR #110 merged 26ec18425
- cap-sanction-2264 — line/cap-sanction-2264 — PR #110 merged 26ec18425
- cap-sanction-2272 — line/cap-sanction-2272 — PR #110 merged 26ec18425
- cap-sanction-2280 — line/cap-sanction-2280 — PR #110 merged 26ec18425
- checkin-key — line/checkin-key — PR #110 merged 26ec18425
- checkpoint-config-batch —  — PR #110 merged 26ec18425
- checkpoint-terminal-slim —  — PR #110 merged 26ec18425
- closed-job-start —  — PR #110 merged 26ec18425（裁定 131 增补·`:1` bare token·walk 首中 `26ec18425` 亲证·LEDGER `product-campaign-LEDGER.md:698` 回执·①-甲同组）
- config-reject-local — line/config-reject-draft — PR #110 merged 26ec18425
- contact-header-line — line/contact-header-draft — PR #110 merged 26ec18425
- context-byte-truncation — line/context-byte-cap-draft — PR #110 merged 26ec18425
- csp-headers — line/csp-headers — PR #110 merged 26ec18425
- db-hotspot — line/db-hotspot — PR #110 merged 26ec18425
- dbacl2-ci-shallow-fix — line/dbacl2-ci-shallow-fix — PR #110 merged 26ec18425
- dbacl2-ci-wire — line/dbacl2-ci-wire — PR #110 merged 26ec18425
- dbhy1-reg-fix — line/dbhy1-reg-fix — PR #110 merged 26ec18425
- deploy-check-harden — line/deploy-check-harden — PR #110 merged 26ec18425
- drop-cascade-guard —  — PR #110 merged 26ec18425
- e2ea05-backfill — line/e2ea05-backfill — PR #110 merged 26ec18425
- fail-queued-job — line/fail-queued-job-draft — PR #110 merged 26ec18425
- failed-interview-score —  — PR #110 merged 26ec18425
- fenced-score-average — line/fenced-score-average-draft — PR #110 merged 26ec18425
- g7w-diag-needles — line/g7w-tail-seg-emit — PR #110 merged 26ec18425
- g7w-tail-contract-ruling — line/g7w-tail-diag — PR #110 merged 26ec18425
- g7w-tail-seg-emit — line/g7w-tail-diag — PR #110 merged 26ec18425
- gitleaks-archive-expand — line/gitleaks-archive-expand — PR #110 merged 26ec18425
- gitleaks-placeholder-remedy — line/gitleaks-placeholder-remedy — PR #110 merged 26ec18425
- graph-fence — line/graph-fence — PR #110 merged 26ec18425
- graph-invoke-depth —  — PR #110 merged 26ec18425
- graph-lease-existing-failed —  — PR #110 merged 26ec18425
- graph-lease-failed-interview —  — PR #110 merged 26ec18425
- graph-lease-terminal —  — PR #110 merged 26ec18425
- graph-release-marker —  — PR #110 merged 26ec18425
- growth-null-overall — line/growth-null-overall-draft — PR #110 merged 26ec18425
- hmac-consolidate — line/hmac-consolidate — PR #110 merged 26ec18425
- interview-event-statement-notify — line/notify-statement-draft — PR #110 merged 26ec18425
- interview-job-autovacuum — line/autovacuum-tuning-draft — PR #110 merged 26ec18425
- invocation-output-after-fence —  — PR #110 merged 26ec18425
- lint-cap-step-242 — line/lint-cap-step-242 — PR #110 merged 26ec18425
- lint-cap-step — line/lint-cap-step — PR #110 merged 26ec18425
- managed-file-ceiling-2288 — line/managed-file-ceiling-draft — PR #110 merged 26ec18425
- managed-file-ceiling-2296 — line/managed-file-ceiling-2296-draft — PR #110 merged 26ec18425
- managed-file-ceiling-2304 — line/managed-file-ceiling-2304-draft — PR #110 merged 26ec18425
- managed-file-ceiling-2312 — line/managed-ceiling-2312-draft — PR #110 merged 26ec18425
- managed-file-ceiling-2320 — line/managed-ceiling-2320-draft — PR #110 merged 26ec18425
- managed-file-ceiling-2328 — line/managed-file-ceiling-2328-draft — PR #110 merged 26ec18425
- n19-stale-comment — line/audit-status-notes — PR #110 merged 26ec18425
- nightly-recall-fix — line/nightly-recall-fix — PR #110 merged 26ec18425
- obs-family —  — PR #110 merged 26ec18425（rev r2 回炉增批·C_last `76259bbaa` walk 首中亲证·`:3/:137/:184`·B5）
- offline-order-status —  — PR #110 merged 26ec18425
- outbox-partial-index — line/outbox-partial-index-draft — PR #110 merged 26ec18425
- pgp-key-param — line/pgp-key-param-draft — PR #110 merged 26ec18425
- provision-lock-release — line/provision-lock-release-draft — PR #110 merged 26ec18425
- q2-validate-scene-fix — line/q2-validate-scene-fix — PR #110 merged 26ec18425
- quiz-loopback-host —  — PR #110 merged 26ec18425（裁定 131 增补·§8 `:174/:178/:180` 三处 bare token·walk 首中 `26ec18425` 亲证·LEDGER `product-campaign-LEDGER.md:665` 回执·①-甲同组）
- qgen-critique-resilience — line/qgen-critique-resilience — PR #110 merged 26ec18425
- queue-closeout — line/worker-hang-guard — PR #110 merged 26ec18425
- queue-enqueue-bp — line/queue-enqueue-bp — PR #110 merged 26ec18425
- queue-shutdown-phases — line/queue-shutdown-phases — PR #110 merged 26ec18425
- rag-embed-missing-usage — line/rag-embed-usage-draft — PR #110 merged 26ec18425
- rag-query-cache —  — PR #110 merged 26ec18425
- raw-answer-lease —  — PR #110 merged 26ec18425
- ready-derivative-unavailable —  — PR #110 merged 26ec18425
- readyz-privacy-wire — line/readyz-privacy-wire — PR #110 merged 26ec18425
- recruiter-band-after-fence —  — PR #110 merged 26ec18425
- replay-side-effect —  — PR #110 merged 26ec18425
- repo-hygiene — line/repo-hygiene — PR #110 merged 26ec18425
- requeue-fixture-fix — line/requeue-fixture-fix — PR #110 merged 26ec18425
- reserve-renew-fix — line/reserve-renew-fix — PR #110 merged 26ec18425
- resume-id-case —  — PR #110 merged 26ec18425
- resume-reread-status —  — PR #110 merged 26ec18425（rev r1 勘补·`:1` 卷首 bare executed token·walk 首中 26ec18425 亲证·①-甲同组）
- route-fast-model —  — PR #110 merged 26ec18425
- route-leaf-weight —  — PR #110 merged 26ec18425
- score-span-answer —  — PR #110 merged 26ec18425
- session-summary-deepen — line/gitleaks-archive-expand — PR #110 merged 26ec18425
- ssd-egress-manifest — line/ssd-egress-manifest — PR #110 merged 26ec18425
- sse-api-family — line/sse-api-family — PR #110 merged 26ec18425
- sse-api-sub — line/on — PR #110 merged 26ec18425
- sse-fetch-failure —  — PR #110 merged 26ec18425
- stream-known-executed —  — PR #110 merged 26ec18425
- submit-flow-competency-wire — line/submit-flow-competency-wire — PR #110 merged 26ec18425
- supply-chain — line/supply-chain — PR #110 merged 26ec18425
- sweep-failed-interview —  — PR #110 merged 26ec18425
- tenant-owner-trim —  — PR #110 merged 26ec18425
- terminal-interview-graph — line/terminal-interview-graph-draft — PR #110 merged 26ec18425
- threshold-calibration — line/threshold-calibration-draft — PR #110 merged 26ec18425
- trace-service-wire — line/trace-service-wire — PR #110 merged 26ec18425
- unstube-erase-diag — line/unstube-erase-diag — PR #110 merged 26ec18425
- upload-guards — line/upload-guards-draft — PR #110 merged 26ec18425
- uuid-id-check —  — PR #110 merged 26ec18425（rev r2 回炉增批·C_last `63262d02f` walk 首中亲证·`:144/:150`·B5）
- voice-final-sentence —  — PR #110 merged 26ec18425
- weakness-s30-fix — line/weakness-s30-fix — PR #110 merged 26ec18425
- worker-hang-guard — line/worker-hang-guard — PR #110 merged 26ec18425
- worker-shutdown-seq — line/worker-shutdown-seq — PR #110 merged 26ec18425

##### ①-乙 PR #108 squash `112e6d26f` 承载 31 卷（13 + rev r2 回炉增批 18·subject 携 PR 号·无 merge commit·承载 commit 实际还承载增批卷的 EXEC 落卷附记）
- cache-observe-repin — line/cache-observe-repin — PR #108 squash-merged 112e6d26f
- cost-columns — line/cost-columns — PR #108 squash-merged 112e6d26f
- e2e-runner-stale-build-guard — line/e2e-runner-stale-build-guard — PR #108 squash-merged 112e6d26f
- g7k-reds-remap — line/g7k-reds-remap — PR #108 squash-merged 112e6d26f
- i18n-metadata-ssr — line/i18n-metadata-ssr — PR #108 squash-merged 112e6d26f
- iso-dotenv-isolation — line/iso-dotenv-isolation — PR #108 squash-merged 112e6d26f
- nul-escape-visibility — line/nul-escape-visibility — PR #108 squash-merged 112e6d26f
- perfload-env-fix — line/perfload-env-fix — PR #108 squash-merged 112e6d26f
- qbank-integrity-chain — line/qbank-integrity-chain — PR #108 squash-merged 112e6d26f
- qbank-pipeline-scope — line/qbank-pipeline-scope — PR #108 squash-merged 112e6d26f
- qbank-scope-fix — line/qbank-scope-fix — PR #108 squash-merged 112e6d26f
- runtime-kernel-wire — line/runtime-kernel-wire — PR #108 squash-merged 112e6d26f
- secret-checker-nul-guard — line/secret-checker-nul-guard — PR #108 squash-merged 112e6d26f
- authz-harden —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:3` 链 draft→executed→nailed·B5）
- bill1-topic-fields —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:132/:134`·B5）
- bill2-shadow-meter —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:126`·B5）
- bill3-settlement —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:170`·B5）
- bill4-ledger-list —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:181/:199`·B5）
- ci-red-clear —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:203` STOP 终态·B5）
- ci-wiring —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:98` 演进补登链·B5）
- db-acl-residual —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:143/:181`+§8 `:135` 未随翻·B5）
- diag-honesty —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:3` 链 draft→nailed·B5）
- e2e-assert-refresh —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:5` 链补全·B5）
- e2e-scene-409 —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:3/:129`·B5）
- e2e-scene-batch2 —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:3` 链·B5）
- g2-report-page —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:97` `nail:closed`·B5）
- h2-qbank-corpus —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:3` 链 draft→nailed·B5）
- ha-6-companion —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:171` → nailed·B5）
- i4-invite-face —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:5` 链补全·B5）
- mig-runner —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:3` 链·B5）
- qbank-planner-honesty —  — PR #108 squash-merged 112e6d26f（rev r2 回炉增批·last-touch 恰为 #108 本体·`:3` 链·B5）

##### ①-丙 单线 PR 承载 8 卷
- ag34-lock-hold — line/ag34-lock-hold-draft — PR #115 merged fae1c0997
- asr-quality-metrics — line/asr-quality-draft — PR #118 merged 508450c14
- cap-sanction-2338 — line/cap-sanction-2338 — PR #113 merged 65a9c40f4
- cap-sanction-2354 — line/cap-2354 — PR #123 merged ab282ba81
- config-reject-guidance — line/config-reject-guidance-draft — PR #116 merged 5123019e5
- lease-attempts-cap — line/lease-attempts-cap-draft — PR #119 merged 4ec27f55e
- progress-write — line/progress-write — PR #139 merged 5e5c6658a
- regw — line/regw-draft — PR #187 merged 5c94266b1

##### rev r2 回炉增批 21 卷逐卷证据表（§0.1-2 增批三判据·逐卷亲读核定·非席2 转述·内容锚定基线 `e647fcffa`）

| 卷 | raw 首读 | 注记行（file:line 亲读） | 注记终值 | carrier merge | B5 形态 |
|---|---|---|---|---|---|
| obs-family | `draft:awaiting_pre_exec_dual` | `:3` Status 自带 draft→executed 翻面+`:137` EXEC 期终态注记+`:184` ⑦STOP | `executed:awaiting_post_prove_dual` | #110 `26ec18425`（C_last `76259bbaa` walk 首中） | executed 终值组·同形翻 |
| ai-graphs-cycle-break | draft（title `STOP=`） | `:66` EXEC 落卷 STOP 现值+`:103` ⑦STOP →+`:105` §9-补 post 双审会签 PASS | executed（post-PASS） | #110 `26ec18425`（C_last `b88d497d3`） | direct closed 组 |
| bill1-topic-fields | `draft:awaiting_pre_exec_dual` | `:132` §9 EXEC 附记+`:134` Status 翻面（append） | `executed:awaiting_post_prove_dual` | #108 squash `112e6d26f`（last-touch 本体） | executed 终值组 |
| bill2-shadow-meter | 同上 | `:126` Status 翻面（append） | 同上 | #108 `112e6d26f` | executed 终值组 |
| bill3-settlement | 同上 | `:170` Status 翻面（append） | 同上 | #108 `112e6d26f` | executed 终值组 |
| bill4-ledger-list | 同上 | `:181` 卷尾 §9-EXEC 施工附记 Status 翻面+`:199` post-errata 维持 | 同上 | #108 `112e6d26f` | executed 终值组 |
| ci-red-clear | `draft:awaiting_pre_exec_dual` | `:203` STOP 终态=`executed` | `executed:awaiting_post_prove_dual` | #108 `112e6d26f` | executed 终值组 |
| db-acl-residual | 同上 | `:143` §9 EXEC 记录+`:181` 卷尾 EXEC 落卷 STOP=`executed`（§8 `:135` STOP 未随翻·B5 一并补登） | 同上 | #108 `112e6d26f` | executed 终值组 |
| ci-wiring | draft（R6 STOP ·） | `:98` Status 演进补登链 draft→executed→nailed | `nailed` | #108 `112e6d26f` | direct closed 组 |
| e2e-scene-409 | `draft:awaiting_pre_exec_dual` | `:3` 链 draft→executed→nailed+`:129` R-1 nail 补登注 | `nailed` | #108 `112e6d26f` | direct closed 组 |
| e2e-scene-batch2 | 同上 | `:3` 链 draft→executed→nailed | `nailed` | #108 `112e6d26f` | direct closed 组 |
| e2e-assert-refresh | 同上 | `:5` Status 链补全（nail 席 append-only）draft→executed→nailed | `nailed` | #108 `112e6d26f` | direct closed 组 |
| i4-invite-face | 同上 | `:5` Status 链补全（nail 席 append-only）draft→executed→nailed | `nailed` | #108 `112e6d26f` | direct closed 组 |
| uuid-id-check | 同上 | `:144` STOP 终态=`executed`+`:150` post 双审会签 PASS·终值 nail 落卷 | executed→nailed | #110 `26ec18425`（C_last `63262d02f`） | direct closed 组 |
| mig-runner | 同上 | `:3` 链 draft→executed（EXEC 席状态行未随翻·nail 席如实补登）→nailed | `nailed` | #108 `112e6d26f` | direct closed 组 |
| qbank-planner-honesty | 同上 | `:3` 链同 mig-runner 形 | `nailed` | #108 `112e6d26f` | direct closed 组 |
| authz-harden | 同上 | `:3` 链 draft→executed（nail 席如实补登）→nailed | `nailed` | #108 `112e6d26f` | direct closed 组 |
| diag-honesty | 同上 | `:3` 链 draft→nailed（post-prove 双席 BOTH PASS） | `nailed` | #108 `112e6d26f` | direct closed 组 |
| h2-qbank-corpus | 同上 | `:3` 链 draft→nailed（BOTH PASS @2026-10-11） | `nailed` | #108 `112e6d26f` | direct closed 组 |
| g2-report-page | draft（`PENDING`/draft 形） | `:97` Status=`nail:closed`（BOTH PASS·merge 落主线 `b11d6d12`） | `nail:closed` | #108 `112e6d26f` | direct closed 组 |
| ha-6-companion | `draft:awaiting_pre_exec_dual` | `:171` → `nailed`（BOTH PASS·nail 席 merge `90258ec3`） | `nailed` | #108 `112e6d26f` | direct closed 组 |

派单组别勘正：席2 派单预设 obs-family/ai-graphs-cycle-break/uuid-id-check 三卷「入①-乙 #108 组或单线组按各自 carrier」——亲证 C_last walk 首中均=`26ec18425`（#110）⇒ 归 **①-甲**（三卷 C_last `76259bbaa`/`b88d497d3`/`63262d02f` 系支线触卷 commit·非承载 squash）·增批总数 21 不变。


### ② 在飞未并：**0 卷**

普查集（origin/main 树上 executed/proofed 160 卷·rev r2 回炉复跑重列）内零「在飞未并」——每卷均有 §① 或附记（甲/乙/丙/丁）落定证据（③ 经 rev r1 判空集）。在飞竞争如实列（非本普查对象·归 §3 cap 竞争登记）：`line/flip-draft` @ `ba38b7356`（meetwise-flip 本地树·NOT ancestor 亲证·承 cap 2466=派单如实采）——sse2 `line/sse2-draft` 已于 rev r1 时点并线（origin/main tip `36740147b`=PR #192·出在飞名单·r0 §0.0 未并读数系 r0 时点 @`e647fcffa` 如实采）；flip REQUEST 卷不在 main 普查集内。

### ③ STOPPED/废弃：**0 卷（rev r1 勘正·r0 读数 1 系假读数）**

r0 读数 1（uc003-arm4-filter）系普查未对普查集内此卷应用本卷 §5 已登记的「注记优先读法」之假读数——该卷 `:3` Status 自带权威终翻「→ `closed`（post 双审会签 PASS 终态注记·nail 期补翻）」与附记-乙 smoke-env-fix `:3`「本注记为权威」完全同形 → 有效态=closed·移出本类入附记-丁（终翻注记权威·零触免处置）·本类空集零字节保留·处置权归协调方。

### ④ 无法考证：**0 卷**

160 份全部考证到 PR/commit 级证据（① 152 + 附记-甲 5 + 附记-乙 1 + 附记-丙 1 + 附记-丁 1·账目自洽·rev r2 回炉重列）。

### 附记-甲 proofed 档 5 卷（已并·档位高于 executed·**翻面权归协调方·本刀零触零字节**）

- ha1 — `proofed:dual_pass` — PR #191 merged e647fcffa（本基线 tip 本体）
- led — `proofed:dual_pass` — PR #190 merged 4751aab28
- nk1 — `proofed:dual_pass` — PR #189 merged da1dae1de
- quizdx — `proofed:dual_pass` — PR #188 merged 2e808c9e3
- uc017 — `post_prove_dual_pass` — PR #138 merged ea0fa0a0a

### 附记-乙 smoke-env-fix（有效终翻 closed·移出翻面清单）

普查首 token 读数 `executed:awaiting_post`·但卷 `:3` 终翻注记权威载「STOP 值终翻为 nail 落卷（closed）·本注记为权威·上文旧值史录保留」→ 有效态=closed（落定证据 PR #110 merged `26ec18425`）·不入 ① 清单·如实登记防 EXEC 双翻。

### 附记-丙 money-status-proof（三态矛盾显式裁定：有效态=draft·不翻面·留协调方确认位·rev r1 新增）

普查 raw 首 token 读数 `executed:awaiting_post_prove_dual`（§8 `:108/:112/:114` 三处 bare token·r0 误归裸 draft 族）·卷内三态矛盾零处置：§8 executed×3 vs §10「未提交把 §8 那三处状态改成 `executed:awaiting_post_prove_dual` 不算通过……这三处已改回 `draft:awaiting_pre_exec_dual`，三处同值。这是撤回未提交的状态翻转」vs §11「现以 §11 为准」。显式裁定：沿附记-乙「注记为权威」先例 → §10 撤回+§11 权威条款为准 ⇒ **有效态=`draft:awaiting_pre_exec_dual`·不翻面（EXEC 禁触）**·落定证据 PR #110 merged `26ec18425`（walk 首中亲证）·**留协调方确认位**：卷内 §8 字节态 executed 与 §10 撤回注记并存·字节态与注记态不一致的终裁归协调方。

### 附记-丁 uc003-arm4-filter（r0 ③ 假读数勘正：有效态=closed·零触免处置·rev r1 新增）

普查 raw 首 token 读数 `executed:stopped_gate_red_escalated`（2026-10-16 EXEC 落卷即停手上报·门 1 主门环境红分类退出=pre-flight `live_provider_key_missing`）·但卷 `:3` Status 自带权威终翻「→ `closed`（post 双审会签 PASS 终态注记·nail 期补翻）」与附记-乙 `:3`「本注记为权威」完全同形——本卷 §5 自己登记了「注记优先读法」却未对普查集内此卷应用 ⇒ r0 ③「STOPPED 1」为假。显式裁定：终翻注记权威 ⇒ **有效态=closed**·移出 ③ 入本附记·零触免处置·落定证据 PR #108 squash `112e6d26f`·③ 计数 1→0。

## §2 修法（EXEC 期分批行使·本席起草期零字节翻面）

**翻面先例形**（沿 obs-logging / obs-ready / negresume-driver-fix 2026-10-15 协调方授权批量滞后卷 Status 对账翻面批·及 ag37/ag-cost5/ha-6 状态行翻面先例）：每卷凡承载活值状态 token 的行（Status 头行 / §8 STOP·状态节行 / 卷尾注行——各卷形态 3~4 行·EXEC 逐卷 rg 状态 token 出现行核实后翻·**不钉死行数**）由 `executed:<子值>` 翻 **`closed`**·行尾 additive 注记·前值括注史录零洗史·格式：

> **`closed`**（20XX-XX-XX 协调方授权批量滞后卷 Status 对账翻面·沿 obs-logging/obs-ready/negresume-driver-fix 先例·对账判据=卷最新触卷 commit 已并 origin/main·<证据>·前值 `executed:<原值>` 史录保留）

其中 `<证据>` 按承载类：`PR #110 merged 26ec18425` / `PR #108 squash-merged 112e6d26f` / `PR #N merged <sha 短 9 位>`（①-丙逐卷见 §1 ①-丙清单）。零内容改动·零触产品码·零触 policy 脚本·零迁移。

**授权判据差异申明（rev r1·防 `closed` 双审闭环语义被稀释）**：本批翻面的判据=**机械代理**（卷最新触卷 commit 已并 origin/main·§0.1-3 walk 首中）·非 obs-logging/obs-ready/negresume-driver-fix 先例批的 **checklist BOTH PASS 载线**。`closed` 语义承载双审闭环——本批属状态台账对账补登（卷内容已并线·双审史录在卷）·不新授任何双审结论·两种判据差异如实并陈·EXEC 行使逐批引用本申明。

**分批计划（每批 ≤40 卷·批间独立可验）**：

| 批 | 范围 | 卷数 | 独立可验 |
|---|---|---|---|
| B1 | ①-甲 #110 组第 1–36 卷（§1 清单序） | 36 | 本批独立 commit + 三门 + `git diff --stat` 卷数=36·触面仅 harness 36 卷 |
| B2 | ①-甲 #110 组第 37–72 卷 | 36 | 同上 |
| B3 | ①-甲 #110 组第 73–108 卷 | 36 | 同上 |
| B4 | ①-乙 #108 组 13 卷 + ①-丙单线 8 卷 + 裁定 131 增补 2 卷（closed-job-start/quiz-loopback-host·①-甲同组 #110 承载） | 23 | 同上 |
| B5 | rev r2 回炉增批 21 卷（①-甲 3 + ①-乙 18·§1 逐卷证据表）：nail 终值/post-PASS/`nail:closed` 14 卷沿 baseline-red5「滞后登记对账翻面」先例直接翻 `closed`（证据字段=各卷承载 merge）·`executed` 终值 7 卷沿 B1-B4 先例形同构翻·db-acl-residual §8 `:135` STOP 未随翻一并补登 | 21 | 同上 |

每批四步：①逐卷翻面（§2 先例形·复跑沿用 §0.1-2 同一提取口径——注记优先+token 锚定·禁另起口径）；②`git diff --stat` 校验恰本批卷集·每卷 3~4 行级改动；③三门复跑（docs:check 记 scanned / PTP 12/12 / markers=0——markers 口径同 `scripts/i6-239-gates.proof.mjs` §2-7：四词面+行首冲突标记零命中·词面运行时组装防自指·卷内不复抄字面）；④批 commit（单行净描述）。131 卷翻面零新件（rev r1 129 + 裁定增补 2）——cap 零再步进（§3 预登 2473 已含本卷 REQUEST +1·rebase 对届按 §3 并线实测更新重算·rev r2 实测承 **2475**·步进已随 EXEC 前置 commit 兑现·详 §9）。B5 增批 21 卷同为纯 in-place 行尾 additive 翻面·零新受管件·cap 2475 零再步进（rev r2 预登申明·§3）·翻面注前值按各卷注记终值如实记（`nailed`/post-PASS/`nail:closed`/`executed:*`）·「131 卷」表述自 rev r2 起读作「B1-B4 已行使 131+B5 待行使 21=152」。

**翻面行使前置（硬门）**：EXEC 期须 pre-exec 双审 BOTH PASS + 协调方明示授权·Ban self-approve·alone≠dual·⛔push（push/收官权归协调方）。③类卷（rev r1 起为空集）与附记-甲/乙/丙/丁卷本刀**零触**。**B5 增批授权位（rev r2 修订席裁定）**：仍留协调方授权位——rc 刀整体对账授权已覆盖 B5 增批·dual r3 复核位保留·行使仍走逐批三门+diff 恰符硬校验·Ban self-approve·alone≠dual。

## §3 cap 预登（CAP-SANCTION-2473·随届值如实采·禁按预登值行使）

- main `e647fcffa` 届扫 **2472 = cap 2_472 恰等**（CAP-SANCTION-2472 ha1 收官并线承登·`scripts/ai-docs/public-text-policy.mjs:289` `MAX_FILES = 2_472` 亲证）。
- 本卷 REQUEST +1 ⇒ **预登 2473（CAP-SANCTION-2473）**。起草树四联动点保持 `2_472/f-2472.md/:2473` 原形零改（沿 nk1 §10 CAP-SANCTION-2464 预登先例形：本行仅注记预登数值零改·PTP 12/12 本树亲跑）——docs:check 本树越限红（`PTP_FILE_LIMIT:2473>2472`）即预登证据·如实记录于 §4·非阻塞红。
- **行使条件**：并线期沿协调方常设预授权「并线期 union 越限恰等步进」对**届时届值如实采**重算（fetch 后亲跑届值 detached docs:check）·恰等零多放·**禁按预登值行使**。
- **并线实测更新（rev r1）**：sse2 #192 已并实测——origin/main 届 tip 已进 `36740147b`（PR #192 sse2 并线·`scripts/ai-docs/public-text-policy.mjs` `MAX_FILES = 2_473` 届值亲证）→ 本卷 rebase 对届后届值 **2474**（2473+本卷 REQUEST 1·四联动点届时恰等改 2_474/`f-2474.md`/`:2475`）·**EXEC 按届重算·禁按预登 2473 行使**。
- **多在飞竞争如实列**（按合并序逐个恰等步进）：本卷 rebase 后承 **2474** · flip 承 2466 将步 2474（`line/flip-draft` @`ba38b7356` 本地树未推未并·承值出处=派单如实采）——sse2 承 2465 已于 #192 并线落 main（届值承登 2473·出在飞名单）·并线序以实际 merge 为准·每方并线时对届值如实采重算·越限臂 fabricated 数随 cap 联动同步。
- **rev r2 回炉预登（2026-11-03）**：B5 增批 21 卷翻面=纯 in-place 行尾 additive 注记·零新增 tracked 文件·零新受管件 ⇒ cap **2475 零再步进**·预登申明在案·届值如实采原则不变（禁按预登值行使）。

## §4 三门预申明（本树起草期亲跑·读数见交付报告）

1. `node scripts/ai-docs/check-docs.mjs`（docs 记 scanned）——预期 `scanned 2473`+`PTP_FILE_LIMIT:2473` 越限红 EXIT=1（预登形态·§3·如实记录不作绿宣称）。
2. `node scripts/ai-docs/public-text-policy.proof.mjs`（PTP）——预期 **12/12 EXIT=0**（proof 未触·cap 形保持）。
3. markers 门——本卷改动集（唯 rc-REQUEST.md 一件）五类标记词+行首冲突标记 **0 命中**（口径同 `scripts/i6-239-gates.proof.mjs` §2-7·词面运行时组装防自指）。

## §5 对账义务与边界

- 本卷对账只读·翻面行使权留 EXEC 期·逐批授权制（§2）。
- 「旧代码忽略仍正确」：本刀零 wire 契约/Redis 结构变更（纯文档状态行）·无消费者兼容义务。
- 后续刀登记：①（rev r1 已消化）注记优先读法已入 §0.1-2 提取口径·普查集内同类三卷已按此处置（附记-乙/丙/丁）；②附记-丁 uc003-arm4-filter 终态 closed 已随卷 `:3` 注记成卷·零触免处置（字节态与注记态一致性复核权归协调方）；③四门/本席口径差（§0.3）如需终裁建议出对账总表卷；④（rev r2 回炉）算法化后差异清单全量消化——21 卷入 B5（§1 逐卷证据表·§2 分批）；trio 3 卷（event-ttl 终值 closed 族/b110 终值 exec_landed 族/evidence-delivery carrier 未立证）不满足增批三判据·保持桶位注记·处置权归协调方；B5 行使授权位与 dual r3 复核位见 §2。
- 分批翻面期若遇届 tip 前进（flip/他线并线·sse2 已于 #192 并线）：对届 rebase·已翻批次不重翻·未翻批次按届重算 cap（§3）·冲突沿两 policy 注记 dual-keep 先例形。

## §6 rev r1 回炉修订记录（dual 复核并集消化·2026-11-03·本节为修订留痕·对账骨架与 pins 十一值零翻）

**dual r1：席1 FAIL（P1×2 + P2×2）/ 席2 PASS（P2×2）→ 回炉·并集全消化**。逐条落法：

| 级 | 发现（两席证据） | 落法（落点节） |
|---|---|---|
| P1-1 | 普查漏斗漏 2 卷·「可复跑」被证伪（席1 全量复算实测）：resume-reread-status `:1` 卷首即 executed token·承载 walk 首中 `26ec18425`（PR #110·①-甲同组）全卷零出现于本卷；money-status-proof §8 executed×3（`:108/:112/:114`）vs §10 撤回 vs §11 权威条款三态矛盾零处置；连带 §0.2 executed 129/裸 draft 7 vs 机器真值 132/5（差额恰此 2 卷误归）·§0.3「executed 恰等 130」系两侧同盲区假阳契合·§④ 全集 135 漏 2（真 137）·§0.1「命令在案可复跑」不成立 | ①§0.1-2 提取法补「注记优先读法」+token 锚定 Status/§8 节或行首·排除 prose 混入（根因修复）②§1-① 清单 +resume-reread-status（①-甲 #110 组·128→129）③新增附记-丙 money-status-proof（三态矛盾显式裁定：沿附记-乙「注记为权威」先例 → §11 撤回为准 ⇒ 归 draft 不翻·留协调方确认位）④§0.2 桶表按新读法重算（132/5·差额恰此 2 卷误归如实登记）⑤§0.3 改「两侧同法同盲区·非独立佐证」+差异归属 ⑥§④ 全集 135→137 账目重列 ⑦§2 分批表按新清单重切（仍 ≤40） |
| P1-2 | uc003-arm4-filter 误归类③：`:3` Status 自带权威终翻「→ closed（post 双审会签 PASS 终态注记·nail 期补翻）」与附记-乙 smoke-env-fix `:3`「本注记为权威」完全同形·本卷 §5 自己登记了注记优先读法却未对普查集内此卷应用 ⇒ ③「STOPPED 1」为假（有效态=closed） | 移出 ③ 入附记-丁（终翻注记权威 closed·零触免处置）·③ STOPPED 1→0 |
| P2-1 | `:3`「状态钉四处」vs §9 无 token vs 卷尾「三处」钉位口径不一 | 钉位口径对齐三处：`:3` 改「状态钉三处：本行+§8+卷尾」（§9 保持 append-only 纯声明节不钉状态值） |
| P2-2 | §2 授权注缺判据差异申明·防 `closed` 双审闭环语义被稀释 | §2 补「机械代理判据（最新触卷 commit 已并 main）vs 先例 checklist BOTH PASS 载线」差异申明·申明本批属状态台账对账补登不新授双审结论 |
| P2-3（席2） | cap 时点：sse2 #192 已并实测（origin/main `36740147b`·MAX_FILES=2_473） | §3 补并线实测更新：rebase 后届值 2474·EXEC 按届重算·禁按预登 2473 行使·在飞竞争名单同步（sse2 出列） |
| P2-4（席2） | EXEC 复跑须沿用同一提取脚本口径保持可复算性 | §0.1-2 钉死 EXEC 复跑同一口径（注记优先+token 锚定·优先 Status/状态/STOP 行·回落首 token 行）·禁另起口径 |
| P2-5（席2） | boundary-rule-single 无状态古卷 | ①-甲 条目加注（无 Status 头行·状态凭 §8 `:76/:80/:82` 行首 token 读·归簇登记不另立类别） |

**r1 后自检**：三门亲跑（docs 本树红=预登形态如实登记 / PTP 12/12 / markers 0·读数见交付报告）·清单 129 份+分批 36/36/36/21 全卷一致·四类计数 ①129/②0/③0/④0·pins 十一值零翻·STOP 三处 `draft:awaiting_pre_exec_dual` 同值·diff 恰 1 tracked。

## §6b rev r2 回炉修订记录（post-prove 席2 P0 漏翻回炉·2026-11-03·本节为修订留痕·对账骨架与 pins 十一值零翻）

**post-prove：席1 PASS / 席2 FAIL（P0）→ 回炉**。（编号注：派单轮次称 rev r2；§0.1-2/§0.2/§1/§9-EXEC 内既有「rev r2」字样系裁定 131 回执期标签（EXEC 期落卷）·两轮以本节与 §9-EXEC 增批条为界。）

| 级 | 发现 | 落法（落点节） |
|---|---|---|
| P0-1 | 「注记优先读法」手工例举式证伪：r1 只手挑附记-乙/丙/丁三卷+只处理「raw 读 executed 但清单漏收」①向·从未对「raw 读 draft 但卷内注记翻 executed」②向做全量扫描 | §0.1-2 两读制算法化（raw 六锚优先级+注记终值扫描+双向差异清单·274 卷复跑恰等登记读数校验）·r1 手工例举三形降为算法特例校验样本 |
| P0-2 | ②向漏收实测 ≥14+1 卷（席2 举证·全部满足本卷自设判据：卷内权威注记裁定有效态=executed 族+交付实物已并 origin/main）·本席逐卷亲读核定 15 卷全数成立+算法全量复跑新增 6 卷=**21 卷** | §0.2 桶表两读重列（executed 族 134→155·draft 族 35→14）·§1 ①+21（①-甲 3/①-乙 18·派单单线组预设经 walk 亲证修正归①-甲）+逐卷证据表·① 131→**152** |
| P0-3 | 漏翻 21 卷无行使批次 | §2 新增 **B5 批**（21 卷≤40 单批·nail 终值/post-PASS 14 卷沿 baseline-red5「滞后登记对账翻面」先例直接翻 closed+executed 终值 7 卷 B1-B4 同形翻·db-acl-residual §8 `:135` 未随翻一并补登）·授权位=rc 刀整体对账授权覆盖增批（rev r2 修订席裁定）·dual r3 复核位保留 |
| P1 | §0.3「复算独立性」暗示未撤净 | §0.3 补申明「复算独立 ≠ 算法独立」（席1 r1 复算复用同一算法·不构成对算法偏置的独立校验） |
| P2 | post-prove 发现与修订须留痕；cap；分批表 | §9-EXEC append 登记（与 B2 基线词面预存条并列）·§3 B5 零新受管件 cap 2475 零再步进预登·§2 分批表增 B5 行 |

**r2 回炉后自检**：三门亲跑（读数见 §9-EXEC 增批条与交付报告）·桶表两读恰等 274·① 152=113+31+8·B5=21≤40 单批·四类计数 ①152/②0/③0/④0·pins 十一值零翻·STOP 三处同值·diff 恰 1 tracked。

## §8 STOP

**STOP 值 = `executed:awaiting_post_prove_dual`（2026-11-03 EXEC 行使落卷·前值 `draft:awaiting_pre_exec_dual` 史录保留·状态钉三处：Status 行+本节+卷尾·同值）。** EXEC 三条款已履行（pre-exec 双审 r2 两席 BOTH PASS+协调方裁定 131 明示 EXEC 授权随令行使+逐批三门与 diff 恰符校验·§9-EXEC 记录）；post-prove 席1 PASS/席2 FAIL（P0）→ rev r2 回炉落卷（§6b·B5 增批 21 卷待行使·dual r3 复核位）；Ban self-approve；Ban retry-to-green；⛔push（push/收官权归协调方）。

## §9 预登与行使分离声明

本卷 §1 为普查结论（只读亲证）·§2 为行使计划（未行使）·EXEC 期逐批落录于此节（append-only·不改既有字）。起草期门读数如实记于交付报告：docs 记 scanned（越限红=预登证据）/ PTP 12/12 / markers 0。

### §9-EXEC 行使记录（2026-11-03·append-only·pre-exec 双审 r2 两席 BOTH PASS + 协调方裁定 131 明示 EXEC 授权后随令行使）

- **rebase 与 cap 并线（前置 commit `34043e996`）**：`git fetch origin` EXIT=0·届 tip=`b66e113f8`=#193 flip 已并（main 届扫 2474=cap 2474 恰等）·rebase **零 git 冲突**（本支 2 commit 仅触本卷一件·两 policy 脚本本支未触·main 侧 2464/2465/2471/2472/2473/2474 六注记史录全保留）·rebase 后 docs:check 亲跑 `PTP_FILE_LIMIT:2475>2474` 红（真 EXIT=1 亲证）——union 实测 2475=main 届扫 2474+本卷 REQUEST 1=2475 恰等零多放·沿协调方常设预授权「并线期 union 越限恰等步进」行使 **cap 2474→2475**（两 policy 脚本 CAP-SANCTION-2475 注记含算式+proof 四联动点 `2_475/f-2475.md/:2476` 恰等改）·docs 复跑 EXIT=0 scanned **2475=cap** 恰等。同 commit 落裁定 131 回执（① 129→131 增补 closed-job-start `:1` bare/quiz-loopback-host §8 `:174/:178/:180` 三处 bare·各 walk 首中 `26ec18425` 亲证+LEDGER `product-campaign-LEDGER.md:698`/`:665` 回执·桶表 executed 132→134 子桶 **127/5/1/1** §0.1-2 同口径复算亲证·r1 子桶不合勘误登记·④ 137→139·B4 21→23·裸 token 判定加固·draft 族 3 卷桶位安全向注记）+LOCAL_PATH 门修（本卷 `:6` worktree 绝对路径字面沿 flip-REQUEST 先例改省略形·语义不变——该违面起草期被 FILE_LIMIT 早返回遮蔽·cap 恰等后首曝）。
- **四批行使读数（每批独立 commit+三门）**：B1=36 卷/121 行 commit `ddd88dda2` · B2=36 卷/125 行 commit `14ce6b678` · B3=36 卷/129 行 commit `c5e7d183e` · B4=23 卷（①-乙 13+①-丙 8+裁定增补 2）/87 行 commit `d997491d2`——合计 **131 卷/462 行**·`git diff --stat` 逐批校验恰本批卷集零外溢·零跳卷零硬翻（131 卷逐卷考证复核：canon token 全 executed 族·承载证据逐卷亲证）·翻面注=行尾 additive（沿 obs-logging 先例形·append-only·原行留痕·原文零字节改写·前值史录零洗）·submit-flow-competency-wire 两处/e2e-runner-stale-build-guard 两处历史中间态 token（`executed:halted:awaiting_coordinator`/`executed:red_unresolved`/`executed:gate1_green`）非活值承载行零触如实登记。
- **三门四轮读数**：docs EXIT=0 scanned 2475=cap 恰等 ×4 / PTP 12/12 EXIT=0 ×4 / markers=0 ×4（B2 基线项如实登记：lint-cap-step-242 `:71` 卷内门矩阵叙述自带四词面字面（卷内不复抄·防自指口径同 `scripts/i6-239-gates.proof.mjs` §2-7）为 HEAD 预存字节·本批 +行零引入亲证·词面防自指口径对引字卷固有命中原样登记不修）；终轮全门同值。draft/proofed 档 5 卷/附记-甲乙丙丁/smoke-env-fix/uc003-arm4-filter/proofed 档零触亲证（diff 面 131 卷恰符）。
- **状态三处同值转 `executed:awaiting_post_prove_dual`**（Status 行+§8+卷尾·待 post-prove 双审·翻面/关账权归协调方）·est live=0·actualSpendCny=null·⛔push。
- **post-prove 回炉与 B5 增批预登（rev r2·2026-11-03·append-only·与 B2 基线词面预存条并列）**：post-prove 席1 PASS/席2 FAIL（P0 漏翻）→ rev r2 回炉落卷（§6b）：§0.1-2 两读制算法化·274 卷双向全量复跑（①向复验零残·②向 **21 卷**=席2 举证 15 全数亲证成立+新增 6：authz-harden/diag-honesty/h2-qbank-corpus/ci-red-clear/g2-report-page/ha-6-companion·逐卷证据表 §1·派单「单线组」预设经 walk 亲证修正归①-甲）·① 131→152·executed 族 134→155·draft 族 35→14·新增 **B5 批 21 卷**（§2 分批表·cap 2475 零再步进预登 §3）·trio 3 卷不满足增批三判据保持桶位注记（处置权归协调方）·**B5 行使待 dual r3 复核**（授权位=rc 刀整体对账授权覆盖增批·rev r2 修订席裁定·Ban self-approve·alone≠dual·⛔push）；修订轮三门亲跑：docs EXIT=0 scanned 2475=cap 恰等 / PTP 12/12 EXIT=0 / markers=0（读数详见交付报告）。

---

*STATUS-RECON REQUEST · 2026-11-03 起草落卷 · rev r1 回炉修订落卷（§6）· rev r2 裁定 131 回执落卷+EXEC 四批行使落卷（§9-EXEC·2026-11-03）· rev r2 post-prove 回炉修订落卷（§6b·2026-11-03·席2 P0 漏翻证伪→两读制算法化·B5 增批 21 卷待行使·dual r3 复核位）· **`executed:awaiting_post_prove_dual`**（前值 `draft:awaiting_pre_exec_dual` 史录保留·三处同值：Status 头+§8+本卷尾）· base `origin/main` @ `e647fcffa` · EXEC 届 tip `b66e113f8`=#193（cap 2475 恰等步进随行使 commit 兑现）· 分支 `line/rc-draft` · 工作树 `meetwise-rc` · 协调方派单（四门复评实测移交）· pins 十一值照抄零翻（§头）· est live=0 · markers=0 · ⛔push · alone≠dual · Ban self-approve · Dual PASS ≠ 开工*
