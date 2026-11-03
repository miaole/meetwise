# ERRATA-SWEEP REQUEST — 六刀 nail 期/双审期累积登记面 P2/P3 勘误扫尾起草卷（docs-only · 起草落卷即停 · ⛔EXEC ⛔push ⛔动主仓）

**Status**: **`drafted:awaiting_pre_exec_dual`**（2026-11-03 起草落卷即停 · pre-exec 双审两独立外席待派 → Dual PASS → 协调方明示授权后始有 EXEC（行使面=§2 七处登记：ha1/flip/led 三卷 §9 各 append 一条勘误注 + sse2 收据勘误件一枚 `.log` + SHA 分注纪律登记 + rc 卷四子项勘误预登移交）· alone≠dual · Ban self-approve · est live=0 · markers=0 · 状态钉三处：本行 + §8 + 卷尾 · 同值）

**席位**：meetwise 北星「ERRATA-SWEEP」P2 勘误扫尾刀起草席（docs-only 起草 · 协调方派单「六刀 nail 期/双审期累积 P2/P3 登记面勘误一次扫尾 · 逐条亲读核定 · 全部 additive · 只起草不 EXEC」 · ⛔push ⛔EXEC ⛔动主仓）。

**基线**：`origin/main` @ **`b66e113f8`**（full `b66e113f8a` 系 12hex 短缩 · = PR #193 `line/flip-draft` 并线点 · `git fetch origin` 本 turn EXIT=0 · worktree `meetwise-err` 由 `git worktree add ... -b line/err-draft origin/main` 亲立 · HEAD 落 `b66e113f8` 亲证）。**普查一律以 `git show origin/main:<path>` 亲读最新版为据（本地 main checkout 可能陈旧勿直读）**。起草前本树三门亲跑：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2474 = cap `2_474` 恰等零余量**（`scripts/ai-docs/public-text-policy.mjs:291` `const MAX_FILES = 2_474` 亲读）；`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**；markers 门=改动集五类标记词（词面运行时组装防自指 · 同 `scripts/i6-239-gates.proof.mjs` §2-7 口径 · 本卷不复抄词面）+ 行首冲突标记 **0 命中**（净树零改动集恒零）。**本卷 +1 受管件必越 ⇒ 起草 commit 即行使 CAP-SANCTION-2475（cap 2474→2475 恰等零多放 · §3 预登沿 nk1/flip 形 · 两 policy 脚本四联动点随本 commit 落位）**。

## §0 认领核对与在飞对账

1. **认领唯一性**：`ai-docs/delivery/harness/` 无 `err-REQUEST.md` 同名卷（落卷前 `ls | grep err-REQUEST` EXIT=1 亲跑）→ 落卷后唯一同名卷=本卷；勘误卷先例=`ag35-legacy-api-erratum-REQUEST.md`/`ag25-replay-residual-erratum-REQUEST.md`（勘的是登记面引注非行状态 · 同律）。
2. **在飞 cap 对账**：rc-draft @`be17eceb8` 承 **2_476** 在飞未落 main（亲读其树 `scripts/ai-docs/public-text-policy.mjs` `const MAX_FILES = 2_476` + `git merge-base --is-ancestor be17eceb8 origin/main` EXIT≠0 亲跑）不预采——届值如实采=唯一豁免项（并线期 union 沿常设预授权届时重算承登：rc 先并则本支 rebase 对届 2476+1=2477 · 同触两 policy 脚本=已知共享热面 dual-keep 先例形）；其余在飞如实承列沿 `CAP-SANCTION-2474` 注记枚举（ag18 `4c2ea4c9f` 承 2_264/ag20 `4cea5010c` 承 2_354/audit `d97d1c173` 承 2_438/cap72 `52846f9d8` 承 2_272/loadw `62f75399d` 承 2_402/pay `fdaa1ecf0` 承 2_354/scoringeval `bed65e869` 承 2_416/state `9f642762d` 承 2_354/uc31 `112ac8af0` 承 2_354 · 均 merge-base 落后多轮 · 排除依据=陈旧度沿 CAP-SANCTION-2461 EVAP ag18 先例）。
3. **本席 lane 铁律**：rc 卷在飞他线（worktree `meetwise-rc`/branch `line/rc-draft`）——本席对其**零字节零触**；条目 7 勘误以「预登移交制」登记于 §2-7（落点=rc 卷自身 · 承并时由 rc 勘误轮/双审行使 · 届时若 rc 已自修则免勘）。

## §1 逐条核定表（七条 · 逐条亲读 origin/main 现值 · 禁凭派单简报转述 · 结论=修/已修复免勘误/不适用）

| # | 派单条目 | 核定结论 | 证据（file:line 亲读 · 基线 `b66e113f8`） |
|---|---|---|---|
| 1 | ha1 §9「席2 三条可选下刀携带项」错源登记 | **修**（§2-1） | `ha1-REQUEST.md:733`（post-prove 复审记录行）「席2 三条可选下刀携带项（沿本卷 §2-18 既有「后续刀三件」登记 · 本卷零行使 · 归属 prove 方法学后续刀）：①attempts 留 raw `.log`…②live 函数计划采样臂…③tally 显式分隔行防误数」——**席2 实际携带恰 2 条**=同段 P2 登记「席2 ①逐采样 scan_shape 全量入收据（不只终态汇总）②ratio 门若日后启用判红须先钉参考段形」；三条系 rev r7 §2-18（`:586`）既有登记之承引非席2 携带·错源登记在案。**勘误轮补 refScanShape 键名细节**：逐采样 scan_shape 收据实形=`ai-docs/delivery/receipts/ha1/06-job-queue-index-reprove-rev-r7.log:126`-`:133`（`b31_*_samples_ms=… scan_shape=["Index Only Scan:ix_*"]` 四表逐采样）+ wallclock registry JSON 键 **`refScanShape`**（同 log `:127`/`:129`/`:131`/`:133` · 码面 `packages/db/test/job-queue-index.proof.ts:557`/`:602`/`:606`/`:618` 亲读）——席2 ①的登记形即此键名 |
| 2 | flip §2 item 3 与 §6 附加钉「三处翻面注文本=§2」 | **修**（§2-2） | `flip-REQUEST.md:96`（§6 附加钉）「三处翻面注文本=§2」——落卷形亲读+机证：**F1 与 §2 逐字节全等**（post-prove 机证 314=314 · `:116` 在案 · 模板引注 nightly.yml `:33`/`:41`/`:50`/`:58` 零漂故全等）；**F2 落卷形=§2 模板+§9 重 pin 行号代换**（difflib 亲跑恰 3 处 replace：`recruiting-bound.spec.ts:76-77`→`:77-78` · `uc018-abandon.spec.ts:66`→`:67` · `:110`→`:112`——与 `:112` §9 重 pin 记录行书作 `:77-:78`/`:67`/`:112` 同值异写）；**F3 落卷形=§2 模板+§9 重 pin 行号代换+席2 P2-1 半句**（difflib 亲跑恰 3 处 replace+1 处 insert：`ci.yml:196-:197`→`:197-:198` · `:198-:200`→`:199-:200` · 汇总重钉笔 `:129`→`:130` + insert「·db-acl:prove 孪生面纳入归另批（载体=DBACL2-CI-WIRE REQUEST §1.3-丁）」·落卷原形 `gap-bug-backlog.md:918` 亲读 · F1/F2 落位顺延 `:936`/`:939` 亲读）——复合口径括注在案（席1 P2① 已登记「§2 规范文本与执行注文本收敛建议留后刀」 `:116` · 本勘误即该登记面兑现） |
| 3 | sse2 收据 07 H12 误标（`@@ -52,7` 应为 §1.1-E6 成员行） | **修**（§2-3 · 落后续 `.log`） | `ai-docs/delivery/receipts/sse2-blindspot/07-hunk-audit.log:19` H12 标「context-only hunk … -> n/a (no member line; see stale-note below)」——**实改行重放**：`git diff d1e405e1 b77334904:apps/api/test/sse-reg-window.proof.ts` 亲跑，`@@ -52,7 +54,7` 恰改 ARM_IDS 成员行（RW-0 行尾 +`'RW-0-7a', 'RW-0-7b', 'RW-0-7c'`）→ 应标 **[4] §1.1-E6 成员行**（E6 定义=`ai-docs/delivery/harness/sse2-REQUEST.md:76`·ARM_IDS 按 `:55`-`:67` 分组次序插 RW-0-7a/7b/7c 点名在案）；`:28` AUDIT VERDICT「19/19 hunks in-list」**不受影响**（H12 改行属在册类 [4]，H13 同类映射已在）；`:30`-`:33` stale-note（A() helper docstring「不入 48 台账」未同步）零触维持。收据 append-only ⇒ 勘误落新 `.log` 件（§2-3） |
| 4 | sse2 收据 05 `:33` prior-PIN 引注不精确 | **修**（§2-3 同件） | `ai-docs/delivery/receipts/sse2-blindspot/05-gates.log:33`「PINs: zero_window_delivery_ms=12 dispose_to_fire_delivery_ms=11 degraded_delivery_ms=2001 mirror_window_delivery_ms=61 (prior receipt 12/21/2002/61 - all in original assertion windows)」——**prior 收据实值=13/14/2002/61**（`01-regw-main.log:39` `zero_window_delivery_ms=13`/`:47` `dispose_to_fire_delivery_ms=14`/`:71` `degraded_delivery_ms=2002`/`:92` `mirror_window_delivery_ms=61` 逐行亲读）；本跑四值 12/11/2001/61 不变；「两轮均在原断言窗内」结论不受影响——纯引注值勘误 |
| 5 | led §9.3 前缀恒等机证范围（LEDGER `:136` 系授权行内插入形） | **修**（§2-5） | `ai-docs/delivery/harness/led-REQUEST.md:124`（§9-3）「零既有字节改写机证 git diff 逐行前缀恒等」未限定机证范围——post-prove 席2 P2①（`:129`）已登记「§9.3 前缀恒等机证范围=backlog 13 注+对账表 · LEDGER `:136` 系授权行内插入形」；§9-3 行本体无该限定词 ⇒ 勘误=additive 注挂限定（范围=backlog 13 注逐行前缀恒等 +13/-13 + 对账表落位文件尾纯尾增 18 行 +18/-0；LEDGER `:136` 系协调方授权行使面行内插入形 · 后行顺延属预期 · 非前缀恒等机证对象）——史录字零改 |
| 6 | 后继刀 SHA 引用纪律（支线 nail SHA 与主线携入 SHA 分注 · 多刀通用） | **登记**（§2-6 · 本卷为登记载体） | 首例形在案：`flip-REQUEST.md` §1-F3「卷载短 sha `7ac68ed7` 系 skeleton 线号（main 历史重建不携原 commit 对象 · `git cat-file -t` 在 `ccl/*` refs 侧亲证）——内容面以 SSOT 段+现树脚本/接线注为准（沿「支线 nail SHA 与主线携入 SHA 分注」纪律如实分注）」+ post-prove 席2 P2② 登记为通用纪律（`:116`）——本卷 §2-6 登记纪律全文（后续各刀卷内引用双值分注 · 禁单值混引）；SOP 级成文落位（TASK-SOP-v2/harness 惯例区）归协调方裁决 · 本卷不代改 |
| 7 | rc-REQUEST 四子项（`:44` 33→31 · `:21`/`:245` 锚 `:186`→`:185`/`:188`→`:187` · ci-wiring R6→R2） | **不适用（未并线）+ 预登移交**（§2-7） | rc 未并线：`git merge-base --is-ancestor be17eceb8 origin/main` EXIT≠0 + origin/main 树零 `rc-REQUEST.md`（ls-tree 亲跑零命中）⇒ 勘误落点=rc 卷自身（在飞 `line/rc-draft` @`be17eceb8` rev r3 形 · `ai-docs/delivery/harness/rc-REQUEST.md` blob `9c94da5d` 408 行亲算）；**四子项均以 rev r3 受管提取器只读实跑机证**（`scripts/ai-docs/request-status-recon.mjs` · rev r3 钉「复跑以脚本输出为准」）：①`:44`「两读差异 33 卷」→脚本输出「两读差异卷=**31**（②向 raw-draft→executed族=25 · raw-draft→closed=1 · raw-executed→draft=1 · raw-executed→closed=2 · executed族内值移=1 · 非态字链末=1 · 残差=0）」且 `:44` 行内自列枚举 25+1+1+2+1+1=31 自洽（33 系 r2 时点值残留）；②`:21` R2 例「resume-grounding `:3` 空头→`:186` 形」→脚本 raw=R2:**:185**（对普查基线 `e647fcffa` 亲跑）；③`:245` 表行「`:188` 「EXEC 状态行」节+`:189`」→对基线 `e647fcffa` 亲读 `:187`=「## EXEC 状态行」节头/`:188`=空行/`:189`=态字行（`:189` 自引恒等零改）⇒ `:188`→`:187`；④`:230` ci-wiring 表行 raw 读 cell「draft（R6 STOP ·）」→脚本 raw=**R2:98**（`:98` Status 演进补登链携 canonical token · R2「后于 STOP 行出现仍压 STOP 锚」规则命中）——`:21` R6 例「（ci-wiring `:86` 形）」系 R6 锚类正形（`e647fcffa` `:86` 确为 `STOP ·` 值行亲读）但该卷选定读法应为 R2 ⇒ 表行 cell 与 R6 例注随勘 |

> 逐条结论汇总：修=6（条目 1/2/3/4/5 + 条目 7 之预登移交）；登记=1（条目 6）；已修复免勘误=0；不适用=0（条目 7 系「落点改挂 rc 卷」非免勘）。勘误条目数=**7**（其中落新文件=1 件 `.log` 勘误件 · 其余 6 处均为既有卷/登记面 additive 注）。

## §2 修法（EXEC 期行使内容 · 全部 additive 勘误注 · 原文不洗 · 落点行号随届时 tip 重 pin · 漂则如实采新值）

1. **ha1-REQUEST §9 尾 append 勘误注记录行**（`:733` post-prove 复审记录行之后 · 沿该节 append-only 记录行惯例 · 零既有字节改写）：
   > 【勘误注 2026-11-03（ERRATA-SWEEP 扫尾刀 · 登记面勘误 · append-only · 上行零字节改写）】: 上行「席2 三条可选下刀携带项」系错源登记——席2 实际携带 **2 条**=①逐采样 scan_shape 全量入收据（不只终态汇总）②ratio 门若日后启用判红须先钉参考段形（上行同段席2 P2 登记两点原样）；所列三条（①attempts 留 raw `.log` ②live 函数计划采样臂（`v_cutoff` 运行时证据）③tally 显式分隔行防误数）系沿本卷 §2-18（rev r7 登记）既有「后续刀三件」之承引·非席2 携带——携带源勘正·三件内容与归属（prove 方法学后续刀·协调方立项裁决）不变。随勘补 refScanShape 键名细节：逐采样 scan_shape 已以四表逐采样 PIN 形入收据（`receipts/ha1/06-job-queue-index-reprove-rev-r7.log:126`-`:133` `b31_*_samples_ms=… scan_shape=["Index Only Scan:ix_*"]`）+ wallclock registry JSON 键 `refScanShape`（同 log `:127`/`:129`/`:131`/`:133` · 码面 `packages/db/test/job-queue-index.proof.ts:557`/`:602`/`:606`/`:618`）——席2 ①「逐采样 scan_shape 全量入收据」的登记形即此键名（登记形非改码 · proof 行为零触）。】

2. **flip-REQUEST §9 尾 append 勘误注记录行**（`:116` post-prove 记录之后 · append-only · 零既有字节改写）：
   > 【勘误注 2026-11-03（ERRATA-SWEEP 扫尾刀 · 登记面勘误 · append-only · 上行零字节改写）】: §6 附加钉「三处翻面注文本=§2」按落卷形精确化——F1 与 §2 逐字节全等（机证 314=314 · 上行关键读数在案 · 模板引注 nightly.yml `:33`/`:41`/`:50`/`:58` 零漂故全等）；F2/F3 落卷形=**复合口径**=§2 模板文本 + §9 重 pin 行号代换（difflib 亲跑：F2 恰 3 处=`recruiting-bound.spec.ts:76-77`→`:77-78`/`uc018-abandon.spec.ts:66`→`:67`/`:110`→`:112` · F3 恰 3 处=`ci.yml:196-:197`→`:197-:198`/`:198-:200`→`:199-:200`/汇总重钉笔 `:129`→`:130`）+ F3 另含席2 P2-1 半句「db-acl:prove 孪生面纳入归另批（载体=DBACL2-CI-WIRE REQUEST §1.3-丁）」（`gap-bug-backlog.md:918` 落卷形亲读）——落卷注零改·本注仅把附加钉口径对齐落卷形（沿上行席1 P2①「规范文本与执行注文本收敛建议留后刀」登记兑现 · 登记形不改史录）。】

3. **sse2 收据 07 H12 勘误件**（收据 append-only · 01-07 零字节改写 · 落新件 `ai-docs/delivery/receipts/sse2-blindspot/08-hunk-audit-erratum.log` · `.log` ∉TEXT_EXTENSIONS 不计扫描面）——件体（EXEC 期逐字落）：
   ```
   == erratum to 07-hunk-audit.log (append-only receipt preserved byte-identical · ERRATA-SWEEP sweep knife · 2026-11-03) ==
   E1: line 19 H12 label WRONG ("context-only hunk ... -> n/a (no member line; see stale-note below)").
       ACTUAL: @@ -52,7 +54,7 modifies an ARM_IDS member line: +'RW-0-7a', 'RW-0-7b', 'RW-0-7c' appended to the RW-0 row.
       Correct mapping: H12 -> [4] sse2-REQUEST.md 1.1-E6 member line (E6 names the RW-0-7a/7b/7c insertion; sse2-REQUEST.md:76).
       Machine evidence: git diff d1e405e1 b77334904:apps/api/test/sse-reg-window.proof.ts (single replaced member line at old file line 55).
       AUDIT VERDICT line 28 (19/19 hunks in-list; zero out-of-list) UNAFFECTED: the modified member line belongs to in-list
       category [4] 1.1-E6 (same mapping class already carried by H13). stale-note lines 30-33 (A() helper docstring
       "aux 自证不入 48 台账" unsynced) NOT TOUCHED and stands (receipt append-only).
   ```
4. **sse2 收据 05 prior-PIN 引注勘误**（同件续块）：
   ```
   E2: erratum to 05-gates.log line 33 prior-receipt citation:
       "(prior receipt 12/21/2002/61 - all in original assertion windows)" -> prior receipt (01-regw-main.log) actuals are
       13/14/2002/61 (line 39 zero_window_delivery_ms=13 / line 47 dispose_to_fire_delivery_ms=14 / line 71
       degraded_delivery_ms=2002 / line 92 mirror_window_delivery_ms=61).
       This-run values 12/11/2001/61 unchanged; "all in original assertion windows" holds for BOTH runs. Citation-value
       erratum only; no gate/assertion semantic change.
   ```
5. **led-REQUEST §9 尾 append 勘误注**（`:129` post-prove 记录行之后 · append-only · 零既有字节改写）：
   > 【勘误注 2026-11-03（ERRATA-SWEEP 扫尾刀 · 登记面勘误 · append-only · 上行零字节改写）】: §9-3「零既有字节改写机证 git diff 逐行前缀恒等」的机证范围按上行席2 P2① 登记精确化=**backlog 13 注逐行前缀恒等（+13/-13）+ 对账表及注记落位文件尾纯尾增 18 行（+18/-0）**；LEDGER `:136` 九号九标签修正+行尾勘误注系**协调方授权行使面之行内插入形**（非前缀恒等机证对象·零删改既有字节·插入致后行顺延属预期）——两口径并存如实·本注不改史录字·仅把 §9-3 机证范围限定词挂明（沿上行双席 P2 登记兑现 · 登记形）。】

6. **多刀通用 SHA 引用纪律登记**（本卷为登记载体 · 零目标卷改动 · SOP 成文落位归协调方裁决）：后续各刀卷内凡引 commit SHA 须按线别**分注双值**——「支线 nail SHA」（skeleton/ccl 线 commit · 含仅存在于 `ccl/*` refs 侧、main 历史重建不携对象者：须注明 refs 侧与 `git cat-file -t` 形）与「主线携入 SHA」（merge/squash 并线后落 main 之 commit：须注明 `git merge-base --is-ancestor` 亲证）——**禁单值混引**；内容权威面恒以 SSOT 段+现树脚本/接线注现值为准（SHA 仅为引注）。首例形=flip §1-F3 `7ac68ed7` 分注+flip post-prove 席2 P2② 登记（`flip-REQUEST.md:116`）。
7. **rc 卷勘误预登（移交制）**（落点=rc 卷自身 · 在飞 `line/rc-draft` @`be17eceb8` rev r3 形 · 本席零触他线 · 由 rc 勘误轮/双审承并时行使 · 届时若 rc 已自修则逐条免勘）：
   - ① `rc-REQUEST.md:44`「两读差异 33 卷」→「**31**」（行内 additive 括注形）：本卷 rev r3 受管提取器 `scripts/ai-docs/request-status-recon.mjs` 实跑输出「两读差异卷=31（②向 raw-draft→executed族=25 · raw-draft→closed=1 · raw-executed→draft=1 · raw-executed→closed=2 · executed族内值移=1 · 非态字链末=1 · 残差=0）」· 且 `:44` 行内自列枚举 25+1+1+2+1+1=31 自洽——33 系 r2 时点值残留。
   - ② `:21` R2 例「resume-grounding `:3` 空头→`:186` 形」→「→`:185` 形」（对普查基线 `e647fcffa`：`:185`=`- Status: `draft_rev3:…`` 行 · `:186`=空行——提取器实跑 raw=R2:185 亲证）。
   - ③ `:245` resume-grounding 表行「`:188` 「EXEC 状态行」节+`:189`」→「`:187` 「EXEC 状态行」节+`:189`」（基线现值 `:187`=节头/`:188`=空行/`:189`=态字行 · `:189` 自引恒等零改）。
   - ④ `:230` ci-wiring 表行 raw 读 cell「draft（R6 STOP ·）」→「draft（R2 `:98`）」（提取器实跑 raw=R2:98 亲证 · `:98` Status 演进补登链携 canonical token · R2「后于 STOP 行出现仍压 STOP 锚」规则命中）；`:21` R6 例「（ci-wiring `:86` 形）」随之 additive 补注「ci-wiring `:86` 系 R6 锚类正形 · 该卷选定读法=R2:98 压之 · R6 终选形例宜另选六锚仅 R6 命中卷」（例卷替换与最终措辞归 rc 席对 274 卷复算择定 · 本预登不代裁）。

**零改承诺**：ha1/flip/led 三卷 Status/§8/§9 既有字零字节改写（勘误注全为行尾/节尾 append · 不携状态字零翻面）· sse2 收据 01-07 逐字节零改（append-only · 勘误走新 `.log` 件）· backlog/LEDGER/checklist/matrix 零触 · rc 卷及一切在飞线零字节（预登移交制）· 行统计数值零改 · pins 零翻 · 产品码/迁移/runner/既有 proof 零触 · 行号引用沿「时点行号 · EXEC 期重 pin」纪律。

## §3 cap 预登（本卷 REQUEST +1 ⇒ CAP-SANCTION-2475 · 沿 nk1/flip §3-C2/C3 预登形 · 随届值如实采=唯一豁免项）

| 号 | 文件 | 内容 |
|----|------|------|
| C1 | `ai-docs/delivery/harness/err-REQUEST.md` | 本卷新增受管 1 件（起草 commit 即触 2474→2475）· EXEC 期零新增受管文件（勘误全为既有卷 in-place append 注 + 一枚 `.log` 勘误件 ∉TEXT_EXTENSIONS 不计）→ EXEC terminal=2475 零新增 |
| C2 | `scripts/ai-docs/public-text-policy.mjs` | `const MAX_FILES = 2_474` → **`2_475`** + 链区 `CAP-SANCTION-2475` 注记（本 rev 已随起草 commit 落 · 算术=main 届扫 2474=cap 2474 恰等（detached worktree 对 `b66e113f8` docs:check EXIT=0 scanned 2474 亲跑）+本卷 1=2475 恰等零多放 · 在飞如实采按届重枚举：rc-draft `be17eceb8` 承 2_476 未落 main 不预采（并线期 union 届时重算承登）· 陈旧在飞九树沿 CAP-SANCTION-2474 注记承列）· `MANAGED_ROOTS`/`TEXT_EXTENSIONS`/扫描面零改（语义不变强度不减） |
| C3 | `scripts/ai-docs/public-text-policy.proof.mjs` | 四联动点随起草 commit 已落 **2475 形**：`i < 2_475` / `scannedFiles, 2_475` / `'ai-docs/f-2475.md'` / `${FILE_LIMIT}:2476` + 相邻注释两处（第 2476 个注入路径 / `PTP_FILE_LIMIT:2476`）同步 + 链区 `CAP-SANCTION-2475` 注记 · PTP 12/12 亲跑（§4）· 四处同一届值禁一处手改 |
| C4 | 收据面 | 门读数 stdout 留痕落 `.log`（∉TEXT_EXTENSIONS 不计）· 本刀唯一收据性产出=08 勘误件（沿 `.log` 惯例）· Ban 落 `.md`/`.txt`/`.json` 收据 |

## §4 门矩阵（起草期本席亲跑 · EXEC 期复跑同表）

1. `node scripts/ai-docs/check-docs.mjs` → 起草前 **EXIT=0 scanned 2474=cap 2474 恰等**；落卷后 **EXIT=0 scanned 2475=cap 2475 恰等**（§3 联动已先行落位）。
2. `node scripts/ai-docs/public-text-policy.proof.mjs` → **12/12 EXIT=0**（2475 形 · 落位后亲跑）。
3. markers 门 → 改动集（本卷 3 tracked 净增路径）五类标记词（词面运行时组装防自指 · 同 `scripts/i6-239-gates.proof.mjs` §2-7 口径 · 本卷不复抄词面）+ 行首冲突标记 **0 命中**。
4. 面收敛门 → `git diff --name-status origin/main..HEAD` 恰 `A ai-docs/delivery/harness/err-REQUEST.md` + `M scripts/ai-docs/public-text-policy.mjs` + `M scripts/ai-docs/public-text-policy.proof.mjs`；**产品码/迁移/runner/既有 proof/backlog/LEDGER/ha1/flip/led/sse2 收据/rc 卷零命中**（勘误行使面全留 EXEC 期）。（fetch 时点形 · EXEC 复跑以届时基线计）
5. EXEC 期（授权后）门：第 1-4 条复跑 + 勘误行使面 diff 复核（ha1/flip/led 三卷各恰 1 行 insert 的机证 `git diff` 逐行核 + sse2 收据 01-07 逐字节零改机证 + 08 勘误件恰新件）+ 落点行号对届时 tip 重 pin（漂则如实采新值 · 定性漂移即停）+ §2-7 rc 预登面移交 rc 勘误轮（本卷零触他线）。

## §5 Ban 清单

Ban push/force-push（git 写只本 worktree commit）· Ban 动主仓 · Ban EXEC（勘误行使全留授权后）· Ban 触在飞线（`line/rc-draft` 等一切他线零字节 · §2-7 仅登记移交）· Ban self-approve（pre-exec 双审两独立外席 · alone≠dual）· Ban 翻任一 pin（十一值照抄零翻）· Ban 洗 append-only 历史注与原文（全部 additive · sse2 收据 append-only 尤其）· Ban 改行统计数值 · Ban 触产品码/迁移/runner/既有 proof · Ban 回改历史卷行号引用 · Ban 在代码注释写任务号 · Ban secrets 入树 · Ban 落 `.md`/`.txt`/`.json` 收据（勘误件沿 `.log`）· Ban 借本刀宣称任何 backlog 行状态/卷状态/pins/hard gates 变化（勘的是登记面引注非行状态 · 零翻面）· Ban 直改 rc-REQUEST（在飞他线 · 预登移交制）· Ban 把勘误注写成状态翻面（勘误注不携状态字）。

## §6 pins（十一值照抄同族卷 · EXEC/审查不得改口 · 本刀零翻转 · cap 项唯一豁免=随届值如实采）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务 + PostgresSaver + pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = **503** · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型外呼·零消耗·est live=0）。

**本卷附加钉**：七条核定面逐条亲读（§1 表 · 禁凭派单简报转述）· 勘误注全部 additive（原文/收据零字节改写）· 状态零翻面（ha1/flip/led 三卷状态行零触 · 勘误注不携状态字）· rc 预登移交制（零触他线）· `cap=2475`（起草形恰等 · CAP-SANCTION-2475）· EXEC 期零新增受管件 · 提取器只读实跑系复核动作非行使（rc rev r3 脚本按其自身口径跑 · 本卷零改零再裁）。

## §7 Non-claims

本刀 ≠ ha1/flip/led 三卷任何状态翻面 ≠ backlog 行状态任何变化 ≠ F3 落卷注回改（落卷形零触 · 只挂登记注）≠ sse2 两收据字节回改（append-only · 勘误件并行在案）≠ rc 卷任何改动（在飞他线 · 预登移交）≠ SOP/TASK-SOP-v2 任何改动（SHA 纪律成文落位归协调方裁决）≠ refScanShape 或任一 proof 行为变化（键名登记非改码）≠ 提取器口径再裁（脚本输出按 rc rev r3 自身钉「复跑以脚本输出为准」只读采信）≠ pins/hard gates/coveredCount/行统计任一变化 ≠ cap 策略变化（纯计数预算恰等步进）。

## §8 STOP

**STOP 值 = `drafted:awaiting_pre_exec_dual`（2026-11-03 起草落卷即停 · pre-exec 双审两独立外席待派 → Dual PASS → 协调方明示授权后始有 EXEC · 状态钉三处：Status 行 + 本节 + 卷尾 · 同值）。** EXEC 行使三条款（逐项履行后始得行使）：① pre-exec 双审两独立外席 BOTH PASS 落卷（§1 七条逐条证据链对届时 tip 复核 · 含 difflib 机证与提取器只读实跑复现）；② 协调方明示 EXEC 授权（行使面=§2 六处 additive 勘误注 + 一枚 `.log` 勘误件 · rc 预登面移交不属本 EXEC 行使面）；③ 落点行号重 pin 已履行（§2 各落点随届 tip 核对 · 漂则如实采新值 · 定性漂移即停）。

停止条件：`docs:check` scanned > cap（届值）红 → 停；PTP 红 → 停；勘误落点行号与届时 tip 不符且无法重 pin → 停如实登记；任一核定证据在届时树不可复现（含 difflib 机证、提取器实跑输出、收据逐字节等值）→ 停 · 该条退回不适用；需越界（触他线/翻 pins/动产品码/洗 append-only 原文）才能继续 → 停。

---

**卷尾 trace**：任务类型=L1 docs-only 勘误扫尾刀起草（起草落卷即停 · 审核 ∧ 验证收束归协调方 post 双审）· 工作区=`meetwise-err`（`line/err-draft` · 基 origin/main `b66e113f8`=#193）· 来源证据=`git show origin/main:` 逐条亲读（ha1 `:3`/`:586`/`:733` · flip `:67`/`:96`/`:109`-`:117` · led `:124`/`:129` · backlog `:918`/`:936`/`:939` · receipts/sse2-blindspot 01 `:39`/`:47`/`:71`/`:92` · 05 `:33` · 07 `:19`/`:28`/`:30`-`:33` · sse2-REQUEST `:76` · `job-queue-index.proof.ts` `:557`/`:602`/`:606`/`:618` · policy `.mjs:291`/proof `.mjs:452`/`:459`/`:483`/`:486`）+ rc 在飞卷 `be17eceb8` blob `9c94da5d`（`:21`/`:44`/`:230`/`:245`）+ 普查基线 `e647fcffa` 对 `resume-grounding-REQUEST.md:184`-`:190`/`ci-wiring-REQUEST.md:86`/`:98` 亲读 + rev r3 受管提取器只读实跑（`request-status-recon.mjs`：两读差异卷=31 · ci-wiring raw=R2:98 · resume-grounding raw=R2:185）+ difflib 机证（F2 恰 3 replace/F3 恰 3 replace+1 insert/F1 逐字节全等）+ `git diff d1e405e1 b77334904:apps/api/test/sse-reg-window.proof.ts` H12 实改行重放 · 已读=AGENTS.md/ai-docs/README.md/meta/task-sop.md/nk1-REQUEST §3（cap 预登形）/flip-REQUEST（形制蓝本）/ag35-legacy-api-erratum-REQUEST（勘误卷先例形）/i6-239-gates.proof.mjs §2-7（markers 口径）· 跳过=front/backend/rules/skills 域规范索引与 testing/（本刀 docs-only 零产品码零测试触面 · 规范路由未命中）· 结论状态=`drafted:awaiting_pre_exec_dual`（三处同值：Status 行+§8+本行）· 验证=起草前两门亲跑全绿（docs EXIT=0 scanned 2474=cap 2474 恰等/PTP 12/12 EXIT=0）· 落卷后三门复跑（docs EXIT=0 scanned 2475=cap 2475 恰等/PTP 12/12 EXIT=0/markers 0）见 §4 读数 · est live=0 · actualSpendCny=null · ⛔push。
