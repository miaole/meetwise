# EVAP REQUEST — `GAP-EVAL-PARSER-DETAILS-UNCLOSED` 评测解析收口任务书（eval-harness-matrix-cite UC-018 facet[2] known RED 现形侦察 + 刀型三择一裁决=产品小刀解析器修复 · `<details>` 未闭合 fail-open → 应收 null + fixture + 诊断 · docs-only REQUEST 卷 · 起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷态·EXEC 落码/翻面权均归协调方·alone≠dual·STOP 三处钉：本 Status 行 + §8 + 卷尾·⛔push ⛔动主仓）。

**席位**：meetwise「GAP-EVAL-PARSER-DETAILS-UNCLOSED」REQUEST 起草席（总盘 #8 · P3 小刀 · docs-only 起草 · 协调方授权令 · ⛔push ⛔动主仓）。
**基线**：`origin/main` @ **`af273901a`**（full `af273901a165c910fe16cfef675d122812d3e779` · 2026-10-28 15:32:07 +0800 · `git fetch origin` 本 turn 成功 · 本地 main `47dd6be56` 落后 345 commit 如实采 origin/main 届值 · 分支 `line/evap-draft` 零独有 commit · worktree `meetwise-evap`）· `node scripts/ai-docs/check-docs.mjs` 本树起草前亲跑 **EXIT=0 · scanned 2447**（=cap 2_447 恰等零余量 · `public-text-policy.mjs:261` `MAX_FILES = 2_447` 行亲证 · §2-1 预算核 · 本卷新 .md +1 必越 → 随刀恰等步进 2_447→2_448 承登后终态 2448=cap 恰等）。

**必读清单（EXEC 立项前逐件亲读·显式路径）**：`ai-docs/delivery/gap-bug-backlog.md`（`:36` `GAP-EVAL-PARSER-DETAILS-UNCLOSED` GAP 行=本刀立项 SSOT）→ `ai-docs/delivery/harness/uc-e2e-018-receipt-backfill.md`（`:60` GAP 同文 cite）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（`:306` `eval harness cite` known RED 承登行 · `:123` UC-E2E-018 §1.0.1 行 FAULT=**case-only**（NHP-018-FAULT-01）· `:132` UC-E2E-050–052 行 NEG cell）→ `scripts/eval-harness-matrix-cite.proof.mjs`（`:642-:657` UC-018 facet[2] 断言 · `:628-:635` 050–052 facets 断言 · `:14-:343` units[] 路径表）→ `scripts/lib/uc-covered-real-gatherer.mjs`（`:266-:364` 解析器产品面主锚）→ `scripts/lib/uc-covered-evaluator.mjs`（六列纯求值器 · `:91-:101` dualVerdict unparseable⇒missing）→ `scripts/uc-e2e-018-covered-criterion.proof.mjs`（`:459-:466` dual fixture null-want 断言区 · `:584` runNeg cpSync 崩点）→ `scripts/fixtures/uc-covered-dual/`（既有 dual fixture 族）→ 先例卷 `ai-docs/delivery/harness/xrep-REQUEST.md`（形制）· r5mr 先例卷（`meetwise-r5mr` 树 `ai-docs/delivery/harness/r5mr-REQUEST.md`·断言追真话三要素出处）。

**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`gap-bug-backlog.md:36` 逐字：「`GAP-EVAL-PARSER-DETAILS-UNCLOSED` | P1 | 未闭合 `<details>` 在 last-line 前 ⇒ 应收 null；缺 `unparseable reviewer file` 诊断 | fixture FX-DUAL-DETAILS-UNCLOSED + diagnostic follow-up | e2e | with RECEIPT-BACKFILL if small | covered-criterion r5b known follow-up」——**GAP 行自带修法处方=fixture+诊断**；②`e2e-requirement-coverage-matrix.md:306` 逐字：「`eval harness cite` | `pnpm eval-harness-matrix-cite:prove` | **1**（known RED） | UC-052 facets PASS；FAIL=`UC-018 facet[2]`（Line A · `GAP-EVAL-PARSER-DETAILS-UNCLOSED` bisect）· ≠ UC-052 nail green · ≠业务 covered」——known RED 承登处；③`uc-e2e-018-receipt-backfill.md:60`：「`GAP-EVAL-PARSER-DETAILS-UNCLOSED`： unclosed `<details>` before last line ⇒ null · fixture **FX-DUAL-DETAILS-UNCLOSED** · plus `unparseable reviewer file` diagnostic」；④协调方派单令（本 turn：「GAP-EVAL-PARSER-DETAILS-UNCLOSED REQUEST 起草席 · P3 小刀 · 三择一裁决 · 停止条件=须产品码大改如实红停上报」）。

---

## 认领核对 · 登记处 fresh 亲点（本卷核心盘点 · 逐行对 `origin/main` @`af273901a` 亲读亲跑·file:line 逐字）

| 登记处 | 对树行使证据（亲读/亲跑逐字） | 判定 |
|---|---|---|
| GAP 行本体 | gap-bug-backlog.md `:36`（引文见立项出处①·P1 · 处方=fixture FX-DUAL-DETAILS-UNCLOSED + diagnostic）· execution-master-checklist **无** `GAP-EVAL-PARSER-DETAILS-UNCLOSED` 行（`:518-:597` 区仅 CITE_EXIT Non-claims 族·grep 亲证零命中） | **开**（亲点维持） |
| known RED 承登 | matrix `:306` expected EXIT=**1**（known RED）· FAIL=`UC-018 facet[2]` | **承登在**（但 FAIL 构成已漂——见下行） |
| **known RED 现形（fresh 亲跑）** | `node scripts/eval-harness-matrix-cite.proof.mjs` 本树亲跑 **EXIT=1**（届值=承登值恒等）· **但 `UC-018 facet[2]` 断言 PASS**：「`PASS live UC-018 FAULT ⇒ case-only (D2 · NHP-018-FAULT-01 authoritative)`」（proof `:642-:657` want case-only · matrix `:123` FAULT cell=`**case-only**（NHP-018-FAULT-01）` 在位——D2 COVERED-CRITERION nail `17e7654` 翻面后断言已随行重 specify）· fresh EXIT=1 实际构成=**(a)** 38× PTP-archive 迁移余波 FAIL：`units[]`（proof `:14-:343`）仍指 `ai-docs/delivery/eval/*.eval.md`（13 件）+`ai-docs/delivery/harness/uc-e2e-018-user-abandon.md`（含其 22 pins+cite+EXIT-doc）——俱已迁 `receipts/archive/2026-09-batch23/eval|harness/`（`e3502c0b6` 2026-10-11 PTP 清债刀 git mv 3025 件 R100 · eval 侧 77 件亲数在档）；**(b)** 1× `FAIL live 050–052 NEG ⇒ honesty-pin (min residual) (got case-only want honesty-pin)`（proof `:628-:635` · matrix `:132` NEG cell 2026-10-27 开关刀 EXEC 加入 `case-only` 词面 → conservative min(case-only=3, honesty-pin=4)=case-only） | **承登行 FAIL 构成漂移**（现形如实登记·处置权归协调方·本刀零触 matrix-cite proof） |
| 解析器产品面 | `scripts/lib/uc-covered-real-gatherer.mjs:343-:364` `parseReviewFileVerdict`（last-non-empty-line 严格单行 Verdict 解析·`:286` `REVIEW_VERDICT_LINE_RE=/^(\*\*)?Verdict: (PASS|FAIL)(\*\*)?$/`·bold 平衡校验）· 纵深防御现面=**未闭合 `<!--`**（`:288-:311` `htmlCommentDefenseFails`）+**未闭合 fence ```/~~~**（`:314-:337` `unterminatedFenceFails`）· docstring `:266-:285` 自钉 fail-closed 姿态 · 消费侧 `uc-covered-evaluator.mjs:91-:101` `dualVerdict`：slot null/unparseable ⇒ `'missing'` ⇒ `MISSING-DUAL`（fail-closed 链完好） | 解析器细节面=**`<details>` 缺席**（GAP 实锤·见下行亲证） |
| **fail-open 亲证（node 直 import 亲跑）** | `parseReviewFileVerdict('review body ok\n<details>\nVerdict: PASS\n')` ⇒ **`PASS`**（GAP 契约应收 **null**——verdict 行坐落未闭合 `<details>` HTML 块内 · fail-open）· 对照组：closed-details（`</details>` 收尾）⇒ null · unclosed `<!--` ⇒ null · unterminated fence ⇒ null（三者防御在位·唯 `<details>` 缺席——同族不一致实锤） | **GAP 真·开**（亲证维持） |
| fixture 面 | `scripts/fixtures/uc-covered-dual/FX-DUAL-DETAILS-BLOCK.md` 在（`Verdict: PASS` 后随 `</details>` → verdict 非末行 ⇒ null · `uc-e2e-018-covered-criterion.proof.mjs:460-:466` null-want 列表在）· **`FX-DUAL-DETAILS-UNCLOSED` 全树零命中**（`find`+`git ls-tree` 亲证）——GAP 处方 fixture 未落 | 处方件缺（本刀 EXEC 补） |
| 宿主 proof 环境态 | `node scripts/uc-e2e-018-covered-criterion.proof.mjs` 亲跑 **EXIT=1 崩溃形**（非优雅 FAIL）：`ENOENT ... ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-sole-stack-pg-retained-evidence.json` @ `:584` `runNeg` cpSync——PTP-archive 迁移余波同源（receipts 已迁 `receipts/archive/2026-09-batch23/receipts/`）· `:584` 先于 `:459-:466` 解析器断言区执行序之后的双向 fixture 区——宿主当前基线上不可整跑 | **环境先在红如实承登**（非本刀引入·Ban 本刀代偿·处置见 §1.3/§8） |

**定性沿承（红因分口·如实三类·不可混同）**：①**GAP 真 red**=`parseReviewFileVerdict` 对未闭合 `<details>` fail-open（verdict 行在未闭合 HTML 块内仍收 PASS）——违反 GAP 行契约「应收 null」与解析器自钉 fail-closed 姿态（`<!--`/fence 同族均 null）· **绿完整性面**：双审 review 文件 verdict 被 `<details>` 包裹即计入 dual PASS 证据=防御漏洞；②**承登漂移**（非本刀红）=matrix `:306` 承登 FAIL=`UC-018 facet[2]` 已过时（D2 翻面+断言随行后 facet[2] PASS）+ archive 迁移余波 38 FAIL + 050–052 NEG case-only 漂移——三类俱属 matrix-cite proof/承登面对齐议题（**r5mr 同形候选**：产品文档演进而断言锚未随行）；③**宿主崩溃**（非本刀红）=covered-criterion proof `:584` cpSync ENOENT（archive 迁移余波）——本刀 EXEC 若需宿主整绿即触停止条件「越界需要」。

---

## §0 刀型裁决（三择一 · 协调方令要求 · 本席建议附理由与否决表）

**建议=产品小刀（解析器 bug 修复）**：EXEC 面=①`scripts/lib/uc-covered-real-gatherer.mjs` `parseReviewFileVerdict` 增未闭合 `<details>` fail-closed 防御（同 `:288-:337` 两防御同形：末个 `<details>` 无配对 `</details>` ⇒ null · Ban 松 normalize）；②增 `unparseable reviewer file` 诊断（additive 可观测：defense-tripped「文件不可解析」与「末行非 verdict」两因可分——**两因 verdict 俱 null ⇒ MISSING-DUAL 链不变**·诊断零改绿路径·Ban 诊断成为放行臂）；③新 fixture `scripts/fixtures/uc-covered-dual/FX-DUAL-DETAILS-UNCLOSED.md`（GAP 行处方具名件·形状=正文+未闭合 `<details>`+末行 `Verdict: PASS`——修前 parse=PASS 实证 fail-open·修后=null）；④`uc-e2e-018-covered-criterion.proof.mjs:459-:466` null-want 列表 additive 一行 + 诊断断言；⑤EXEC 验收=直 import keyless node 复跑（修前 PASS→修后 null·三对照组恒 null）入收据 + 宿主 proof 解析器断言区（宿主 `:584` 先在崩溃如实承登不洗·宿主整绿非本刀门）。

**理由（对三择一）**：(a) GAP 行自带修法处方=「fixture FX-DUAL-DETAILS-UNCLOSED + diagnostic follow-up」——产品小刀即处方兑现行，零自建议程；(b) fail-open 是**解析器行为背离自身已登记契约**（GAP 行「应收 null」+docstring fail-closed 姿态），不存在可「追」的产品真话——r5mr 形（断言追产品现行真话·横幅措辞诚实演进而锚过期）在本 GAP **不成立**：此处现行行为（PASS）恰是缺陷本体，断言对齐=把 fail-open 洗成锚=Ban； (c) docs 钉（known RED 恒持+收口注记）被否：`<details>` fail-open 是双审证据链绿完整性洞，钉红=把洞常驻化，违背 fail-closed 家族姿态； (d) 体量合 P3 小刀：单函数+同形防御+1 fixture+1 断言行·零产品码（`apps/*/src`、`packages/*/src`、migrations 零 diff 意向）· keyless · est live=0——停止条件「须产品码大改」零命中。

**否决表（诚实留痕）**：

| 落选项 | 否决/登记理由 |
|---|---|
| 修复=断言/解析器对齐（r5mr 形 · `eval-harness-matrix-cite.proof.mjs` 对齐产品文档现文） | 方向本身合法（r5mr 三要素=授权链+恒等数核+产品面零触）但**面错位**：r5mr 形适用 ②类承登漂移（archive 迁移 38 FAIL+050–052 NEG+`:306` 承登行）——该对齐刀涉及 77 件 eval 档案路径+matrix 承登行语义，超 P3 小刀单函数面；本卷将其**如实登记为协调方独立裁决候选**（§8 现场漂移条款引用），本刀零触 matrix-cite proof。若协调方裁决对齐方向，须另刀沿 r5mr 先例（显式授权+恒等数核+`apps/packages` 零触三要素全验）。 |
| docs 钉（known RED 恒持+GAP 收口注记） | 见 §0(c)——fail-open 洞常驻化违背 GAP 行自带修法处方·**否**。 |
| 解析器小刀顺带修宿主崩溃（`:584` cpSync 路径改档） | archive 迁移余波面（receipts/reviews/eval 77+ 件路径+宿主断言内容态）超本刀面·触「越界需要」→ 停·另刀。 |
| evaluator 契约改动（REFUSE_REASONS 增枚举等） | GAP 行处方仅 fixture+诊断·`dualVerdict` unparseable⇒MISSING-DUAL 链已 fail-closed 完好·零需改 evaluator——越处方即停。 |

---

## §1 EXEC 修法预注册（起草席定形 · EXEC 落码前仍须 pre-exec 双审 + 协调方授权）

1. **防御函数**：`uc-covered-real-gatherer.mjs` 内新私有 `unclosedDetailsFails(text)`（同 `unterminatedFenceFails` 同形：扫描 `<details>`/`</details>` 配对·栈式或计数式·末个 open 无配对 close ⇒ true）· `parseReviewFileVerdict` 入口第三道防御（`htmlCommentDefenseFails`→`unterminatedFenceFails`→`unclosedDetailsFails` 序）· docstring `:266-:285` Defense in depth 清单 additive 一行（Ban 删史录行）。
2. **诊断**：新增导出（候选形 `diagnoseReviewFile(text) ⇒ { verdict: 'PASS'|'FAIL'|null, reason: 'ok'|'unclosed-details'|'unclosed-comment'|'unterminated-fence'|'no-verdict-line'|'empty' }` 或同义 additive 字段）——`parseReviewFileVerdict` 现签名/返回值**零改**（消费侧 `dualFromReviewFiles:415` 零触）· 诊断仅 additive 可观测·`uc-e2e-018-covered-criterion.proof.mjs` 断言「unclosed-details ⇒ verdict null 且 reason=unclosed-details」+「no-verdict-line ⇒ null 且 reason=no-verdict-line」（两因可分=GAP「缺 unparseable 诊断」收口）。
3. **fixture**：`scripts/fixtures/uc-covered-dual/FX-DUAL-DETAILS-UNCLOSED.md`（具名=GAP 处方名·内容形状见 §0-③·**修前 parse=PASS** 的 fail-open 实证形随收据留痕）。
4. **断言接线**：`uc-e2e-018-covered-criterion.proof.mjs:459-:466` null-want 列表 additive `['FX-DUAL-DETAILS-UNCLOSED', unclosedDetails]` 一行 + 诊断两断言（§1-2）· 既有 fixture 族零触零删。
5. **面冻结**：`apps/*/src`+`packages/*/src`+migrations 零 diff · `eval-harness-matrix-cite.proof.mjs`/matrix/`:306` 承登行/gap-bug-backlog `:36` 行零触（对齐处置权归协调方·GAP 行翻面权归协调方）· `evaluator.mjs` 零触（§1.3）。

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 届值重 pin）

1. **docs:check + cap 预算核（亲跑亲算）**：起草前亲跑 **EXIT=0 · scanned 2447**=cap 2_447（`public-text-policy.mjs:261` 亲证）恰等零余量 → 本卷 harness/evap-REQUEST.md 受管 1 件=2448 必越 → **协调方派单常设预授权「越限沿常设预授权恰等步进预登」随令行使 +1 恰等零多放：cap 2_447→2_448（CAP-SANCTION-2448）随本起草 commit 落**——四联动点恰等改：①`public-text-policy.mjs:261` `2_447→2_448`+链区注记置顶；②`public-text-policy.proof.mjs:441` `i < 2_448`；③`:448` `atCap.scannedFiles, 2_448`；④`:454` `f-2448.md`+`:457` `FILE_LIMIT:2449`+proof 链区 `:439` 注记 CAP-SANCTION-2448 置顶 · **在飞同号如实采**：r5mr 收官并线支 `0e42adb21` 已承 CAP-SANCTION-2448（union 2447→2448·在飞未落 main）→ 并线时同号取大恒 2448 零再步进·注记 dual-keep 双留（沿 CAP-SANCTION-2446 isob+UC3F 三线同号先例形）· **EXEC 期算式预登**：2448+1（FX-DUAL-DETAILS-UNCLOSED.md 受管 .md）=2449 必越 → **EXEC 期恰等步进预登 CAP-SANCTION-2449**（届时届值如实采·常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令·沿 CAP-SANCTION-2433 EXEC 期再步进预登先例形·届时在飞各线 cap 步进并线 union 取大重算零再询）· 语义申明：计数预算联动零门语义变更·越限臂 fabricated 数随 cap 联动同步·proof 强度不减。
2. **markers 五类零命中 + est live=0**：本刀改动集五类标记词（`scripts/i6-239-gates.proof.mjs:159-163` 词面运行时组装口径·不复抄卷内防自指）+行首冲突标记严格形 grep 零命中（起草席亲跑·回执随 EXEC 收据）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat` **恰 3 tracked 路径**=本卷 .md+`public-text-policy.mjs`+`public-text-policy.proof.mjs`；EXEC 期 diff 面=本卷+gatherer+fixture 1 件+covered-criterion proof+policy 联动（若 EXEC 期再步进）——届时逐件登记·多任何未登记 tracked 路径即停。
4. **EXEC 验收（届时重 pin）**：直 import keyless 复跑=修前 `FX-DUAL-DETAILS-UNCLOSED` parse **PASS**（fail-open 实证留痕）→修后 **null** 且诊断 reason=unclosed-details·三对照组（closed-details/unclosed-comment/unterminated-fence）恒 null·`FX-DUAL-DETAILS-BLOCK`/既有 dual fixture 族全绿不回退 · 宿主 covered-criterion proof：解析器断言区绿为门·宿主 `:584` 先在崩溃如实承登（环境红非本刀红·Ban 借机修路径·Ban 洗白）· 邻面不回退：`uc018:receipt-backfill:prove`（若届值可跑）按届时 SSOT 口径恒等 · **行/列冻结**：EXIT0=case≠covered·coveredCount=8 零翻转·UC-018 stays **partial**·matrix `:306` 承登行零触（其构成漂移处置权归协调方）。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源+migrations 零 diff（§1-5）。
2. **matrix-cite 对齐面零触**：`eval-harness-matrix-cite.proof.mjs`/`e2e-requirement-coverage-matrix.md`/gap-bug-backlog/covered-path-backlog 零改——archive 迁移余波（38 FAIL）、050–052 NEG 漂移、`:306` 承登构成漂移三件俱登记不处置（§0 否决表·协调方独立裁决）。
3. **宿主崩溃零代偿**：covered-criterion proof `:584` 路径/archive 对齐零触（越界即停·另刀）。
4. **evaluator 契约零触**：`uc-covered-evaluator.mjs`/REFUSE_REASONS/`dualVerdict` 零改（§1.3）。
5. **HA/云/Key/发布叙事零涉** · covered/queue 翻面零预支 · `receipts/archive/2026-09-batch23/` 档案件零改写（legacy 不洗·沿 RECEIPT-BACKFILL 先例）。

## §4 依赖

①上游已满足：GAP 行在卷（`:36`）· 解析器/evaluator/fixture 族在树（§0 亲点）· 防御同形先例在函数内（`:288-:337`）· 起草随刀恰等步进先例（CAP-SANCTION-2442 isob/UC3F · :439-:441 亲点）。②同文件并发：起草 turn 恰 1 新 .md+两 policy 联动零交涉面；EXEC 期触 `uc-covered-real-gatherer.mjs`+covered-criterion proof=UC-018 高汇聚区——**在飞交叠复核必做**：policy 脚本区 7 在飞支顶触（ag18-draft/cap-2272/r5mr-draft/campaign-state/uc2b-draft/uc33p-draft/uc50-draft·本 turn 亲点）→ union dual-keep 注记并留+届值取大重算（常设预授权免再询）；gatherer/proof 触面届时 `git log -1 -- <触面>` 逐在飞支复核，任一支顶新增提交触 §8「现场漂移」。③下游：GAP `:36` 行翻面（EXEC 修复收据供协调方评估）· matrix `:306` 承登构成刷新与 matrix-cite 对齐刀归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 动主仓；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green；Ban invent covered（含升格 partial/借本刀收据 wash 任何 RED）；Ban live key（est live=0·零 `.env*`）；Ban 触产品码面/migrations/matrix-cite 对齐面/宿主崩溃面/evaluator 契约/archive 档案件（§3·越界停）；Ban 断言迁就（修 `parseReviewFileVerdict` 时 Ban 放宽既有 `<!--`/fence/单行严格防御迁就新防御；诊断 Ban 成放行臂）；Ban 把承登漂移三类（archive 余波/050–052 NEG/`:306` 构成）记成本刀红或本刀收口对象（§0 定性分口）；Ban 顺带升级依赖包；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban cap 越值行使（恰等步进预登值外数值=红停上报）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。
**本卷附加钉（零翻转）**：UC-018 stays **partial**（解析器修复≠covered≠UC 翻面·GAP 行翻面权归协调方）· EXIT0=case≠covered · known-RED 承登 `:306` 零触（构成漂移如实登记待协调方处置）· fail-closed 姿态只增不减（`<!--`/fence/单行严格防御全保留）。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑外呼零模型调用零 Key 加载零生产操作零 secrets（本 turn 亲跑面=check-docs/两 policy 无关 proof/eval-harness-matrix-cite/covered-criterion crash 复现/node 直 import 解析器·全静态本地零外呼）；EXEC 期：est live=**0**（解析器+fixture+断言全静态·零 PG 零容器零模型）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md+两 policy script 恰等联动·起草 turn）五类标记词+行首冲突标记 grep **零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装口径·不复抄卷内防自匹配——沿 xrep §7 同形制）。

## §8 STOP（`draft:awaiting_pre_exec_dual` · 停止条件四类 · 命中即停手上报·Ban 就地处置）

- **现场漂移**：EXEC 立项日对 §0 任一锚漂移且结论受疑（GAP `:36` 行被他刀改写/翻面 · `parseReviewFileVerdict`/防御函数被在飞刀改写 · matrix `:123`/`:132`/`:306` 行锚漂移 · policy cap 被在飞并线推移）→ 停·重 pin 回炉（届值如实采）。
- **机制不满足**：EXEC 期解析器修复与 §1 对码期望不符（未闭合 `<details>` 防御引入后既有 fixture 族新红·诊断无法两因可分·`dualVerdict` 链新红）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记·Ban retry-to-green Ban 断言迁就**）。
- **越界需要**：修法诉求超出 §1 面（宿主整绿需 archive 路径对齐 77+ 件 · 需触 `apps/*/src`/`packages/*/src` · 需改 evaluator 契约 · 需触 matrix-cite 对齐面）→ 停·另刀或协调方裁决（含：若协调方裁决改走「断言对齐」刀型，沿 r5mr 三要素另立 REQUEST）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check > cap 步进值 / 邻套件新红 / markers 命中 / 越界 diff）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（起草落卷·2026-10-26 派单令随令起草落卷·EXEC 落码须 pre-exec 双审双 PASS+协调方明示授权·三 GAP/承登行翻面权全归协调方·alone≠dual·⛔force-push）。

---

*EVAP REQUEST · 2026-10-26 起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`** · 认领=`GAP-EVAL-PARSER-DETAILS-UNCLOSED`（gap-bug-backlog `:36` · receipt-backfill harness `:60` · matrix `:306` known RED 承登 bisect Line A）· fresh 亲点=known RED EXIT=1 届值恒等但构成漂移（facet[2] 已 PASS（D2 `17e7654` 后断言随行）· fresh 红=38× PTP-archive 迁移余波（`e3502c0b6` git mv 3025 件·77 eval 件在 `receipts/archive/2026-09-batch23/`·proof units[] 旧径）+1× 050–052 NEG case-only 漂移（2026-10-27 开关刀 EXEC）+宿主 covered-criterion `:584` cpSync ENOENT 先在崩溃——三类承登不处置·协调方独立裁决）· **刀型三择一裁决=产品小刀（解析器 bug 修复）**（GAP 行自带处方=fixture FX-DUAL-DETAILS-UNCLOSED+`unparseable reviewer file` 诊断·`parseReviewFileVerdict:343-:364` 未闭合 `<details>` fail-open 亲证（PASS·契约应收 null·`<!--`/fence 同族均 null 防御在位）· r5mr 断言追真话形不适用=现行行为即缺陷本体·docs 钉被否=绿完整性洞常驻化）· EXEC 预注册=防御函数+两因可分诊断+具名 fixture+`:459-:466` additive 断言+直 import keyless 验收· 零产品码零迁移零 Key· cap=起草随刀恰等步进 **2_447→2_448 CAP-SANCTION-2448**（+1 常设预授权随令·四联动点亲点 `:261`/`:441`/`:448`/`:454/:457`·r5mr 在飞同号 2448 取大零再步进·EXEC 期 +1 fixture=2449 预登 CAP-SANCTION-2449）· 基线=`origin/main` `af273901a` · 分支 `line/evap-draft` · 工作树 `meetwise-evap` · 行/列冻结 EXIT0=case≠covered·coveredCount=8·UC-018 stays partial · est live=0 · markers=0 · releaseEvidence=false · Not HA · ⛔push ⛔动主仓 · 起草态 STOP*
