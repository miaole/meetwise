# CAP-SANCTION-2338 文档上限步进记录（mini·快速链·沿 cap-sanction-2272/2280 与 2296/2304/2312/2320 sanction +8 系先例形）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 已行使·门矩阵七门全绿·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · 前值 `draft:awaiting_pre_exec_dual`（起草态·本刀单 commit 直落未成独立 draft commit·随派单令「只 commit 一次」颁定）史录保留于 §8/卷尾注 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（届时树亲算·b3c9ede2 届时值）

- **基线**：`origin/main` @ `b3c9ede2`（全 hash `b3c9ede21c0f6f68294a9b90d551bfa95145bec7` 派单基线恒等亲证·HEAD 恰等零漂移）。分支 `line/cap-sanction-2338`（worktree `meetwise-cap2338`·基线即 b3c9ede2·⛔push 纪律承引防误推）。
- **锚A** `scripts/ai-docs/public-text-policy.mjs` blob `4c888532`（=b3c9ede2 届值亲证·b4213d4f 落点 blob 恒等）：
  - `:110-:111` sanction 注记栈现值 latest=`cap 2312→2320`（2026-10-20·新条目置顶形·2320 落点）；
  - `:132` 上限对齐单行注释「上限与当前受管扫描数对齐为 2330。」（b4213d4f 2330 对齐落点·现值 live 描述行·非注记栈谱系条目）；
  - `:133` `const MAX_FILES = 2_330;`（常量唯一定义点）；
  - `:345` `if (paths.length > MAX_FILES)` 早返回臂 → 错误串 `PTP_FILE_LIMIT:${paths.length}`（常量引用·字面量零现）；
  - `:402` `listed.paths.length > MAX_FILES` 臂同上（零字面量）。
- **锚B** `scripts/ai-docs/public-text-policy.proof.mjs` blob `0cc13b60`（=b3c9ede2 届值亲证·b4213d4f 落点 blob 恒等）·越限臂（E11 内 `:249-:341`）：
  - `:299` MANAGED-FILE-CEILING-2320 随刀注记（栈顶·2026-10-20 落点）；`:308-:310` CAP-SANCTION-2280 随刀注记三行（2280 落点）；
  - `:324` fabricated 环 `for (let i = 0; i < 2_330; i += 1)`；
  - `:331` `assert.equal(atCap.scannedFiles, 2_330)`（恰 cap 臂）；
  - `:332` 注记「第 2331 个注入路径触发早返回」；`:333` 注记「错误串恰为 `PTP_FILE_LIMIT:2331`」；
  - `:334` 越限注入路径 `'ai-docs/f-2330.md'`；
  - `:337` `assert.deepEqual(overCap.errors, [\`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2331\`])`（**3cd159dd 教训行·a75736a0 已亲跟 2209·e9f99940 已亲跟 2217·51abfe78 已亲跟 2225·89074c5d 已亲跟 2233·b7dde404 已亲跟 2241·5ec0cf6d0 已亲跟 2249·e5ea355ca 已亲跟 2257·2adcb0078 已亲跟 2265·cap-sanction-2272 已亲跟 2273·cap-sanction-2280 已亲跟 2281·b4213d4f 对齐步已亲跟 2331·本刀续跟 2339·自审 grep 全量清零为准**）。
- **计数锚**：本支线届树 `node scripts/ai-docs/check-docs.mjs` 基线亲跑 EXIT=0 `public text policy scanned 2330 managed worktree files`（=cap 2330 恰等零余量亲证）。
- **联动面普查**：`git grep -ln '2_330\|2330'` 命中 **23 文件**——码面活面恰 **2**=锚A+锚B（scripts/ packages/ apps/ 三面亲证恰两 script）·余 **21** 全史录豁免（receipts/archive 10=时间戳/digest/数值子串·receipts 现档日志 3=运行输出·ai-docs/testing 2=governance-audit-index.json/e2e-parity-baseline.json sha256 digest 子串·ai-docs 史录 5=cap-sanction-2264/bill3-settlement 两历史卷+gap-flake-rootcause 调查记录+product-campaign-LEDGER 台账+execution-master-checklist 台账·后五面命中均为 draft hash `523306c3a` 子串与谱系记载数字）。逐类抽查亲证。第三联动面零存在亲证。
- **计数谱系**：2320→2328（`b5b59628` 极简形）/2328→2329（`b665fcac` 实测对齐）/2329→2330（`b4213d4f` 实测对齐+迁移 +1）三步沿极简对齐形落码·未留注记栈条目（对齐特例非 sanction +8 形）→ 届树实测 **2330**（cap 2330 恰等零余量·亲测）→ 派单 brief 在飞算术=**在飞新卷 ≥1（AG 下一刀）** → **2330+1=2331 超 2330**（brief 颁定算术·先手步进触发）→ 协调方 sanction **+8（2330→2338）先手**承登·本卷 REQUEST +1=2331（≤2338 余 7）·余量面归 post 注视/下一帽刀如实重 pin（本刀不越派单颁定值自升）。

## §1-修法（两文件·沿 cap-sanction-2280 形制逐字节同构）

- **件①** 锚A `:133`：`const MAX_FILES = 2_330;` → `const MAX_FILES = 2_338;`（注记两行置顶后届时行 `:135`·两消费臂 `:345/:402`→`:347/:404` 常量引用零字节零触·届时行号亲证）。
- **件②** 锚A `:110` 前插 sanction 注记两行（沿 cap-sanction-2280 等先例新条目置顶形·注记栈历史零洗）：
  - `// cap 2330→2338（2026-10-22 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328 十六先例形·快速链·授权随令）：`
  - `// 主线已扫 2330 余量 0·在飞新卷 ≥1（AG 下一刀）并线=2331 必超（2330+1=2331>2330·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。`
- **件②附** 锚A `:132` 现值 live 描述行随值最小翻新：「上限与当前受管扫描数对齐为 2330。」→「上限经 2330→2338 步进（见上注记）。」（该行描述当前上限非历史注记·值翻后原句自相矛盾且成 gate-6 旧值残留·随值翻新·偏离如实登记 §9）。
- **件③** 锚B 越限臂六处数字联动+随刀注记（cap 数字行为断言 **2338/2339 全行使**·语义不变强度不减）：
  - 注记随卷（`:299` 前三行·沿 CAP-SANCTION-2280 注记形·置顶不洗旧）；
  - `:324` `i < 2_330` → `i < 2_338`（届时 `:327`）；
  - `:331` `scannedFiles, 2_330` → `scannedFiles, 2_338`（届时 `:334`）；
  - `:332` 「第 2331 个」→「第 2339 个」（届时 `:335`）；`:333` `PTP_FILE_LIMIT:2331` → `PTP_FILE_LIMIT:2339`（届时 `:336`）；
  - `:334` 系推 `'ai-docs/f-2330.md'` → `'ai-docs/f-2338.md'`（届时 `:337`）；
  - `:337` 系推 `deepEqual ... :2331` → `:2339`（届时 `:340`）。
- **语义申明**：cap 数字预算联动·零门语义变更·零产品码零迁移零 lockfile·越限臂 fabricated 数随 cap 联动同步·proof 强度不减·est live=0。

## §1.3 否决

1. **跳步 +16 或直调恰余量/更大值**：违 +8 步进纪律（2208→2320 +8 系谱系全 +8·2328/2329/2330 三步为实测对齐特例非上调先例）·派单颁定值即 +8·本席无权上调（越值=红停上报非自升）·否决。
2. **上限无界化（删 cap/`MAX_FILES=Infinity`）**：恰 cap 臂+越限错误码形状断言两臂失语义·proof 强度减·否决。
3. **proof 越限臂不联动（留 2_330/2331）**：届时 atCap 臂 `valid=false` 必红·假红污染门矩阵·否决。
4. **注记栈旧值洗除/历史行重写（含对 `:110-:131` 诸行就地标改"补救"）**：历史 sanction 注记为计数谱系 SSOT·append 置顶不洗旧·否决。
5. **以"在飞新卷未落地"为由缓步（等触顶再步进）**：违派单先手令（2330 恰等零余量·任一登记落地即触·先手 +8 即为此设）·否决。
6. **沿 `b4213d4f` 极简形不落注记（只改 MAX_FILES+proof 六处）**：派单 brief 明令 sanction 注记两行+随刀注记置顶·且本刀为先手步进非实测对齐·算术谱系必须留卷·否决。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 §9+commit message 记）

1. **policy.proof 全绿 12/12 届时值**：`node scripts/ai-docs/public-text-policy.proof.mjs` → `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·全量一次行使即全 proof 邻面·零 --case 单臂跳跑·2338/2339 双值全行使绿）EXIT=0。
2. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 `scanned ≤2338`（EXEC 树预期 2331=届树 2330+本卷 1·余 7）。
3. **typecheck**：`pnpm turbo typecheck --force` 8/8（0 cached）EXIT=0。
4. **lint**：`pnpm turbo lint`（真实退出码无管道直取）EXIT=0 全 0 errors（0 新增 error·各包预算恰等不抬）。
5. **markers**：改动集（两 script 新增行+本 commit message）词面运行时组装扫描（词面不入卷防自匹配）零命中+全树行首冲突标记严格形零命中。
6. **自审 grep 清零证**：`grep -n "2_330\|2330\|2331"`（+下划线形 `2_331` 补扫）两 script 全量逐处核——live 码/断言行旧值残留清零（深核 `deepEqual`/`assert.equal` 行·`deepEqual` 行届时 `:340` 亲跟 `:2339`）·历史注记行既有谱系值豁免登记（非残留）。
7. **diff 恰 3 tracked**：EXEC commit 面=锚A+锚B+本卷（§9 append+STOP 翻面）·零第四文件·零产品码零迁移零 lockfile·tsbuildinfo 副产物（`apps/web/tsconfig.tsbuildinfo` tracked）如翻动 checkout 回滚不入 commit。

**停止条件（命中即停手上报）**：proof 任一臂红·docs:check>2338·diff 超 3 tracked·自审 grep 出非豁免旧值命中。

## §8 STOP（开工条款 + 翻面形）

- **开工条款（sanction 直落形）**：①协调方派单 brief 即 sanction 授权（`2330→2338` 步进值+修法+门矩阵由 brief 颁定·在飞新卷 ≥1（AG 下一刀）算术=2330+1=2331 必超·+8 先手）；②快速链诊断+起草+EXEC 一体席·沿先例 sanction 直落先例·pre-exec 双审由 sanction 形制承载·本刀单 commit 直落（随派单令「只 commit 一次」颁定·draft 态未成独立 draft commit）；③EXEC 不得越 §1-修法落点与 §1.3 否决面（越则红停回炉）。
- **STOP = `executed:awaiting_post_prove_dual` 三处同值**（Status 头+本节+卷尾注·前值 `draft:awaiting_pre_exec_dual` 史录保留零字洗·本刀单 commit 直落形·draft 态未成独立 draft commit 随派单令「只 commit 一次」颁定）·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行/Status 终翻面权归协调方·本刀不宣称关闭。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §9 EXEC 记录（快速链一体席·2026-10-22·门矩阵七门 EXIT 原值）

1. **授权链**：协调方派单 brief（CAP-SANCTION-2338 文档上限步进·sanction 2330→2338 直落·在飞新卷 ≥1（AG 下一刀）算术 2330+1=2331 必超·快速链席·+8 沿先例形·先手步进）→ 本席起草（`draft:awaiting_pre_exec_dual` 起草态史录·单 commit 直落未成独立 draft commit 随派单令颁定）→ EXEC 本席落码。
2. **码面落点**（恰 2 文件·沿 §1-修法逐处定稿·零越面）：锚A `scripts/ai-docs/public-text-policy.mjs`=:110-:111 置顶注记两行（cap 2330→2338·主线已扫 2330 余量 0·在飞新卷 ≥1（AG 下一刀）并线=2331 必超·注记栈 append 不洗旧）+:134 现值描述行随值翻新（「上限经 2330→2338 步进（见上注记）」·见偏离②）+:135 `MAX_FILES = 2_338`（:347/:404 消费臂常量引用零字节零触亲证）·锚B `scripts/ai-docs/public-text-policy.proof.mjs`=:299-:301 随刀注记三行+:327 `< 2_338`+:334 `scannedFiles, 2_338`+:335 第 2339 个+:336 `PTP_FILE_LIMIT:2339`+:337 `f-2338.md`+:340 `deepEqual ...:2339`（六处六行全行使 2338/2339 双值·届时行号与 §1 预标定逐处恰等亲证）。
3. **门矩阵七门全绿**：①policy.proof 全量 `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·零 --case 跳跑·2338/2339 双值全行使绿）EXIT=0（改动前基线 12/12 EXIT=0 先证·改动后双跑·§9 回填后三跑同值）；②docs:check EXIT=0 `scanned 2331 managed worktree files`≤2338 余 7（=届树 2330+本卷 1·派单预期恰等·§9 回填后复跑同值 EXIT=0）；③`pnpm turbo typecheck --force` 8 successful/8·0 cached EXIT=0（Time 8.927s·退出码直取）；④`pnpm turbo lint` 真实退出码直取 EXIT=0 12 successful/12（11 cached/1 fresh·fresh=root `//` 面恰覆盖两 script·Time 6.71s）·0 errors/5242 warnings（日志 'error' 字样 74 处逐核全为既存 warning 面 naming-convention/no-unused-vars 标识符字样（`error_code`/`retry_error`/`errorOfAsync` 等）与路径字样·零 error 级；两 script 直扫 `eslint` EXIT=0 零输出零新增）；⑤markers=词面运行时组装主扫（11 词面：支线/并入/复核/会签/STOP/门矩阵/批表/帽/计件/起草/评审·词形不入卷防自匹配）commit 消息+两 script diff 引入行 hits=0；逐词全 16 词面补扫=commit 消息 0 命中·script 新增行 5 行 7 词次（卷×2/刀×3/sanction×2）全落本刀新注记行（派单 brief 颁定注记内容与先例同形卷面文体·沿 cap-sanction-2280 同面先例·非 live 码非断言）；全树行首冲突标记严格形 `git grep` 0 命中+diff 新增行 0 命中；⑥自审 grep 清零证=两 script 全量 `2_330|2330|2331|2_331` 共 5 命中逐处核·**live 码/断言行旧值残留零命中**（`deepEqual` 行 :340 已跟 `:2339`=3cd159dd 教训行承续·a75736a0 已跟 2209/e9f99940 已跟 2217/51abfe78 已跟 2225/89074c5d 已跟 2233/b7dde404 已跟 2241/5ec0cf6d0 已跟 2249/e5ea355ca 已跟 2257/2adcb0078 已跟 2265/cap-sanction-2272 已跟 2273/cap-sanction-2280 已跟 2281/b4213d4f 对齐步已跟 2331·本刀续跟）·命中构成=policy :110/:111 本刀新注记 from 值与算术+:134 现值描述行步进谱系+proof :299/:300 本刀新注记；新值 `2_338|2338|2339` 在位亲证（policy :135·proof :327/:334/:335/:336/:337/:340）；⑦diff 面恰 3 tracked（锚A+锚B+本卷 .md §9 回填+STOP 终态）·pnpm-lock 零字节·tsbuildinfo 门副产零翻动（`git status --porcelain`=1 A+2 M 亲证）。
4. **proof 臂账**：越限臂 fabricated 数 2_338 恰 cap 臂 `valid=true`+`scannedFiles=2_338`·第 2339 注入路径早返回 `valid=false`+`scannedFiles=0`+错误串恰 `PTP_FILE_LIMIT:2339` 三断言全行使绿·cap 数字预算联动语义不变强度不减（改动前基线 proof 12/12 EXIT=0 先证·改动后同跑 12/12 EXIT=0 双跑亲证·回填后三跑同值）。
5. **偏离**：①注记日期：派单 brief 字面颁「2026-10-19」·实际行使日为 2026-10-22·且注记栈最新既有条目已为 2026-10-20（2026-10-19 落栈将成逆序假记录）·沿「诚实第一」取 2026-10-22 落注记（policy :110/proof :299）·如实登记；②锚A :132 现值描述行随值翻新：brief 修法面仅列 MAX_FILES+注记两行·该行为现值 live 描述（「上限与当前受管扫描数对齐为 2330」）·值翻后原句自相矛盾且成门6 旧值残留·随值最小翻新（仍在锚A 内·零第四文件）·如实登记；③先例形计数：brief 颁「+8 沿先例形」未 pin 计数·按 +8 系谱系 2208/2216/…/2328 计十六先例形（2328 步 `b5b59628` 系 +8 极简形无注记条目·已入 §0 谱系清单）·如实登记；④计数谱系：2320→2328/2328→2329/2329→2330 三步（`b5b59628`/`b665fcac`/`b4213d4f`）均极简形未留注记栈条目·与本刀 sanction 注记形不同源·§0 如实载；⑤markers 逐词全 16 词面补扫 5 行 7 词次命中（全落本刀新注记行·主扫口径=绿·沿 cap-sanction-2280 先例判定·补扫非零命面如实登记）；门4 沿派单原样未加 --force（11 cached/1 fresh·fresh=root 面恰覆盖两 script·另两 script 直扫 eslint EXIT=0 零输出补强）·如实登记；门2/⑦在 §9 回填前后双跑同值（2331/3 tracked 恒定·回填不改计数面）·如实登记；⑥其余零（落点/门矩阵/STOP 形全沿 §1/§2/§8 定稿·零越面零 amend）。
6. **卫生**：est live=0（七门全本地静态/隔离 fixture·零外呼零 secrets 零模型调用）·actualSpendCny=null·零迁移零 DDL 零 env 闸·pins 不适用（本刀无 pins 面）。
7. **STOP 终态**：三处（Status 头/§8/卷尾注）同值 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行与 Status 终翻面权归协调方·本刀不宣称关闭·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

*CAP-SANCTION-2338 记录 · 2026-10-22 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-22 EXEC 落码·§9·前值 `draft:awaiting_pre_exec_dual`（起草态·单 commit 直落未成独立 draft commit）史录）· base `main` @`b3c9ede2`（派单基线恒等亲证）· 分支 `line/cap-sanction-2338` · 工作树 `meetwise-cap2338` · 立项出处=协调方派单 brief（CAP-SANCTION-2338 文档上限步进·快速链席·2330→2338·+8 沿先例形·先手步进）· 修法=MAX_FILES 2_330→2_338+sanction 注记置顶两行（含「主线已扫 2330 余量 0·在飞新卷 ≥1（AG 下一刀）并线=2331 必超」）+:132 现值描述行随值翻新+proof 越限臂六处 2338/2339 全行使（deepEqual 行亲跟 2339·谱系承续）· 门矩阵七门=proof 12/12+docs:check 2331≤2338+typecheck 8/8 0cached+lint 全 0 errors+markers 词面零命中+自审 grep 清零证+diff 恰 3 tracked · est live=0 · ⛔push ⛔merge 主线*
