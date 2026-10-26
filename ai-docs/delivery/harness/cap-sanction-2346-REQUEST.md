# CAP-SANCTION-2346 文档上限步进记录（mini·快速链·沿 cap-sanction-2272/2280 与 2296/2304/2312/2320/2338 sanction +8 系先例形）

**Status**: **`closed`**（2026-10-26 协调方批表翻面笔-3 滞后卷 Status 对账翻面·沿 tokstream-s4b/ag37/ag-cost5/ha-6 状态行翻面先例·一行依据=checklist「Line cap-sanction-2346 nail」段已载 post-prove 双审会签 PASS×2（席1 agent_fef276d4+席2 agent_8337e888 双零 P2）+nail PR #121 merge `1ace8a9c`（对 HEAD `git merge-base --is-ancestor` 亲证 EXIT=0）——原 `executed:awaiting_post_prove_dual` 系滞后登记 · 前值 `draft:awaiting_pre_exec_dual`（起草态·本刀单 commit 直落未成独立 draft commit·随派单令「只 commit 一次」颁定）史录保留于 §8/卷尾注 · est live=0 · ⛔force push ⛔pull --rebase）

## §0 锚（届时树亲算·4ec27f55 届时值）

- **基线**：`origin/main` @ `4ec27f55`（全 hash `4ec27f55e9e90c5471ceee867d1e84857831c5d2` 派单基线恒等亲证·HEAD 恰等零漂移）。分支 `line/cap-sanction-2346`（worktree `meetwise-cap2346`·⛔push 纪律承引防误推）。
- **锚A** `scripts/ai-docs/public-text-policy.mjs` blob `f3b183ee`（=4ec27f55 届值亲证）：
  - `:110-:111` sanction 注记栈现值 latest=`cap 2330→2338`（2026-10-22·新条目置顶形·2338 落点）；
  - `:134` 上限对齐单行注释「上限经 2330→2338 步进（见上注记）。恰达上限仍通过，多一个仍拒绝。」（现值 live 描述行·非注记栈谱系条目）；
  - `:135` `const MAX_FILES = 2_338;`（常量唯一定义点）；
  - `:347` `if (paths.length > MAX_FILES)` 早返回臂 → 错误串 `PTP_FILE_LIMIT:${paths.length}`（常量引用·字面量零现）；
  - `:404` `listed.paths.length > MAX_FILES` 臂同上（零字面量）。
- **锚B** `scripts/ai-docs/public-text-policy.proof.mjs` blob `6f9be8c3`（=4ec27f55 届值亲证）·越限臂（E11 内 `:252-:344`）：
  - `:299` CAP-SANCTION-2338 随刀注记（栈顶·2026-10-22 落点）；
  - `:327` fabricated 环 `for (let i = 0; i < 2_338; i += 1)`；
  - `:334` `assert.equal(atCap.scannedFiles, 2_338)`（恰 cap 臂）；
  - `:335` 注记「第 2339 个注入路径触发早返回」；`:336` 注记「错误串恰为 `PTP_FILE_LIMIT:2339`」；
  - `:337` 越限注入路径 `'ai-docs/f-2338.md'`；
  - `:340` `assert.deepEqual(overCap.errors, [\`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2339\`])`（**3cd159dd 教训行·历刀已亲跟 2209/2217/2225/2233/2241/2249/2257/2265/2273/2281/2331/2339（cap-sanction-2338 卷载谱系）·本刀续跟 2347·自审 grep 全量清零为准**）。
- **计数锚**：基线树 `node scripts/ai-docs/check-docs.mjs` 亲跑 **EXIT=1** `public_text_policy:PTP_FILE_LIMIT:2339`（=main 现值 2339 已越 2338 一文件·红停亲证·本刀红热修直接因由·**基线红随刀复绿** §9 如实录）。
- **联动面普查**：`git grep -ln '2_338\|2338'` 命中 **20 文件**——码面活面恰 **2**=锚A+锚B·余 **18** 全史录豁免（harness 史录 9=ag16/ag34/ag35/asr-quality/bill3/config-reject-guidance/lease-attempts/cap-sanction-2338 八记录+product-campaign-LEDGER 台账·execution-master-checklist 台账 1·ai-docs/testing/e2e-parity-baseline.json 1=sha256 digest 子串·packages/db/test/dbhy1.proof.ts 1=sha256 digest 子串 `:165` 亲证·receipts/archive 5=时间戳/digest/数值子串·receipts/e2e-assert-refresh 运行日志 1）。逐类抽查亲证。第三联动面零存在亲证。
- **计数谱系**：2338 落点（=4ec27f55·五刀 ag34-lock-hold/#249/ag35-legacy-api-erratum/asr-quality-metrics/lease-attempts-cap **各自并线时点各对其 cap 基线合规**·累计并入越限一文件·**协调方累计账失察**）→ main 现值实测 **2339**（>2338·main CI 红停 `PTP_FILE_LIMIT:2339`）→ 在飞 AG-25 勘误卷 1 + 本卷 1 → 2339+1+1=**2341 ≤ 2346 余 5**（brief 颁定算术）→ 协调方 sanction **+8（2338→2346）红热修步进随本刀承登**·§9 门2 树内实测 2340 余 6（AG-25 在飞未落）。

## §1-修法（三文件·沿 cap-sanction-2338 形制逐节同构）

- **件①** 锚A `:135`：`const MAX_FILES = 2_338;` → `const MAX_FILES = 2_346;`（注记两行置顶插后届时行 `:137`·两消费臂 `:347/:404`→`:349/:406` 常量引用零字节零触·届时行号亲证）。
- **件②** 锚A `:110` 前插 sanction 注记两行（沿 cap-sanction-2338 等先例新条目置顶形·注记栈历史零洗）：
  - `// cap 2338→2346（2026-10-22 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338 十七先例形·快速链·授权随令）：`
  - `// main 现值 2339 已越 2338 一文件（五刀 ag34/#249/ag35/asr-quality/lease-attempts 各自基线合规·累计并入越限·协调方累计账失察）+ 在飞 AG-25 勘误卷 1 + 本卷 1 = 2341 ≤ 2346 余 5（main CI 红热修 PTP_FILE_LIMIT:2339>2338·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。`
- **件②附** 锚A `:134` 现值 live 描述行随值最小翻新：「上限经 2330→2338 步进（见上注记）。」→「上限经 2338→2346 步进（见上注记）。」（该行描述当前上限非历史注记·值翻后原句自相矛盾且成门6 旧值残留·随值翻新·偏离如实登记 §9）。
- **件③** 锚B 越限臂六处数字联动+随刀注记（cap 数字行为断言 **2346/2347 全行使**·语义不变强度不减）：
  - 注记随卷（`:299` 前三行·沿 CAP-SANCTION-2338 注记形·置顶不洗旧）；
  - `:327` `i < 2_338` → `i < 2_346`（届时 `:330`）；
  - `:334` `scannedFiles, 2_338` → `scannedFiles, 2_346`（届时 `:337`）；
  - `:335` 「第 2339 个」→「第 2347 个」（届时 `:338`）；`:336` `PTP_FILE_LIMIT:2339` → `PTP_FILE_LIMIT:2347`（届时 `:339`）；
  - `:337` 系推 `'ai-docs/f-2338.md'` → `'ai-docs/f-2346.md'`（届时 `:340`）；
  - `:340` 系推 `deepEqual ... :2339` → `:2347`（届时 `:343`）。
- **件④** 本卷新增 `ai-docs/delivery/harness/cap-sanction-2346-REQUEST.md`（沿 cap-sanction-2338 卷结构同构·§9 EXEC 记录 + STOP 三处翻面同 commit 内落）。
- **语义申明**：cap 数字预算联动+记录卷新增·零门语义变更·零产品码零迁移零 lockfile·越限臂 fabricated 数随 cap 联动同步·proof 强度不减·est live=0。

## §1.3 否决

1. **跳步 +16 或直调恰余量/更大值**：违 +8 步进纪律（2208→2338 sanction 谱系全 +8）·派单颁定值即 +8·本席无权上调（越值=红停上报非自升）·否决。
2. **上限无界化（删 cap/`MAX_FILES=Infinity`）**：恰 cap 臂+越限错误码形状断言两臂失语义·proof 强度减·否决。
3. **proof 越限臂不联动（留 2_338/2339）**：届时 atCap 臂 `valid=false` 必红·假红污染门矩阵·否决。
4. **注记栈旧值洗除/历史行重写**：历史 sanction 注记为计数谱系 SSOT·append 置顶不洗旧·否决。
5. **以「基线红属主线累计账」为由缓步（等下一刀再修）**：main CI 已红 `PTP_FILE_LIMIT:2339` 属红热修优先级·缓步使红持续且在飞卷继续落地越幅扩大·否决。
6. **只改 MAX_FILES+proof 六处不落本刀算术注记**：派单 brief 明令注记两行+算术如实（基线红 2339>2338·五刀各自合规·累计并入越限·协调方累计账失察必须登记）·注记栈为谱系 SSOT·否决。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 §9+commit message 记）

1. **policy.proof 全绿 12/12 届时值**：`node scripts/ai-docs/public-text-policy.proof.mjs` → `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·全量一次行使即全 proof 邻面·零 --case 单臂跳跑·2346/2347 双值全行使绿）EXIT=0。
2. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 `scanned ≤2346`（EXEC 树预期 2340=基线 2339+本卷 1·树内余 6；brief 算术 2341≤2346 余 5 含在飞 AG-25 勘误卷 1）。**基线树红 2339>2338 随刀复绿·如实录**。
3. **typecheck**：`pnpm turbo typecheck --force` 8/8（0 cached）EXIT=0。
4. **lint**：`pnpm turbo lint`（真实退出码无管道直取）EXIT=0 全 0 errors（0 新增 error·各包预算恰等不抬）。
5. **markers**：改动集（两 script 新增行+本 commit message）词面运行时组装扫描（词形不入卷防自匹配）主扫零命中+全树行首冲突标记严格形零命中（注记行既有谱系/颁定文本命中沿先例判定豁免·如实登记）。
6. **自审 grep 清零证**：`grep -n "2_338\|2338\|2339"`（+下划线形 `2_339` 补扫）两 script 全量逐处核——live 码/断言行旧值残留清零（深核 `deepEqual`/`assert.equal` 行·`deepEqual` 行届时 `:343` 亲跟 `:2347`）·历史注记行既有谱系值豁免登记（非残留）。
7. **diff 恰 3 tracked**：EXEC commit 面=锚A+锚B+本卷（新增+§9 回填+STOP 翻面同 commit）·零第四文件·零产品码零迁移零 lockfile·tsbuildinfo 副产物如翻动 checkout 回滚不入 commit。

**停止条件（命中即停手上报）**：proof 任一臂红·docs:check>2346·diff 超 3 tracked·自审 grep 出非豁免旧值命中。

## §8 STOP（开工条款 + 翻面形）

- **开工条款（sanction 直落形）**：①协调方派单 brief 即 sanction 授权（`2338→2346` 步进值+修法+门矩阵由 brief 颁定·main 现值 2339 已越 2338 一文件+在飞 AG-25 勘误卷 1+本卷 1=2341≤2346 余 5 算术随令颁定·+8 红热修）；②快速链诊断+起草+EXEC 一体席·沿先例 sanction 直落先例·pre-exec 双审由 sanction 形制承载·本刀单 commit 直落（随派单令「只 commit 一次」颁定·draft 态未成独立 draft commit）；③EXEC 不得越 §1-修法落点与 §1.3 否决面（越则红停回炉）。
- **STOP = `executed:awaiting_post_prove_dual` 三处同值**（Status 头+本节+卷尾注·前值 `draft:awaiting_pre_exec_dual` 史录保留零字洗·本刀单 commit 直落形·draft 态未成独立 draft commit 随派单令「只 commit 一次」颁定）·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行/Status 终翻面权归协调方·本刀不宣称关闭。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §9 EXEC 记录（快速链一体席·2026-10-22·门矩阵七门 EXIT 原值）

1. **授权链**：协调方派单 brief（CAP-SANCTION-2346 文档上限步进·sanction 2338→2346 直落·main CI 红热修优先级（基线 `PTP_FILE_LIMIT:2339`>2338·五刀各自基线合规·累计并入越限·协调方累计账失察）·快速链席·+8 沿先例形·算术如实颁定）→ 本席起草（`draft:awaiting_pre_exec_dual` 起草态史录·单 commit 直落未成独立 draft commit 随派单令颁定）→ EXEC 本席落码。
2. **码面落点**（恰 3 文件·沿 §1-修法逐处定稿·零越面）：锚A `scripts/ai-docs/public-text-policy.mjs`=:110-:111 置顶注记两行（cap 2338→2346·main 现值 2339 已越 2338 一文件算术·注记栈 append 不洗旧）+:136 现值描述行随值翻新（「上限经 2338→2346 步进（见上注记）」·见偏离⑤）+:137 `MAX_FILES = 2_346`（:349/:406 消费臂常量引用零字节零触亲证）·锚B `scripts/ai-docs/public-text-policy.proof.mjs`=:299-:301 随刀注记三行+:330 `< 2_346`+:337 `scannedFiles, 2_346`+:338 第 2347 个+:339 `PTP_FILE_LIMIT:2347`+:340 `f-2346.md`+:343 `deepEqual ...:2347`（六处六行全行使 2346/2347 双值·届时行号与 §1 预标定逐处恰等亲证）+本卷 `cap-sanction-2346-REQUEST.md` 新增。
3. **门矩阵七门全绿**：①policy.proof 全量 `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·零 --case 跳跑·2346/2347 双值全行使绿）EXIT=0（改动前基线 12/12 EXIT=0 先证·改动后双跑·§9 回填后复跑同值）；②docs:check：改动前基线树亲跑 **EXIT=1** `public_text_policy:PTP_FILE_LIMIT:2339`（=2339>2338 红停亲证·**基线红随刀复绿**·偏离①如实录）→ cap 步进后（卷回填前）EXIT=0 `scanned 2339 managed worktree files` → §9 回填后复跑 EXIT=0 `scanned 2340`（=2339+本卷 1·≤2346 树内余 6·brief 算术 2341≤2346 余 5 含在飞 AG-25 勘误卷 1）；③`pnpm turbo typecheck --force` 8 successful/8·0 cached EXIT=0（退出码直取）；④`pnpm turbo lint` 真实退出码直取 EXIT=0 12 successful/12（9 cached/3 fresh·turbo 输入哈希随本刀 script 改动失效面扩大·0 errors 不变）·0 errors/5242 warnings（既存 warning 面·`  error  ` 级字样 0 命中逐核）；两 script 直扫 `pnpm exec eslint` EXIT=0 零输出零新增；⑤markers=词面运行时组装主扫（commit 消息+两 script live 码/断言新增行·词形不入卷防自匹配）hits=0；两 script 新增行 5 行注记面命中 12 词次（并入×2/卷×4/刀×3/sanction×3·sanction 含 proof :299 `CAP-SANCTION-2346` 前缀大写形 ×1·全落本刀新注记行 policy :110-:111/proof :299-:301·派单 brief 颁定注记内容与算术如实文本·沿 cap-sanction-2338/2280 同面先例判定：注记行非 live 码非断言非 commit 消息·主扫口径=绿·见偏离②）；全树行首冲突标记严格形（`^<{7}|^>{7}|^={7} `）`git grep` 0 命中+diff 新增行 0 命中（宽形 `^={7,}` 26 行全在 receipts 既存运行日志·非本刀改动面·非冲突线形）；⑥自审 grep 清零证=两 script 全量 `2_338|2338|2339|2_339` 共 8 行命中逐处核·**live 码/断言行旧值残留零命中**（policy :110/:111/:112/:136 与 proof :299/:300/:301/:302 全为注记/注释行·`deepEqual` 行 :343 已跟 `:2347`=3cd159dd 教训行承续·历刀已跟 2209/2217/2225/2233/2241/2249/2257/2265/2273/2281/2331/2339·本刀续跟）·新值 `2_346|2346|2347` 在位亲证（policy :137·proof :330/:337/:338/:339/:340/:343）；⑦diff 面恰 3 tracked（锚A+锚B+本卷 .md）·pnpm-lock 零字节·tsbuildinfo 门副产零翻动。
4. **proof 臂账**：越限臂 fabricated 数 2_346 恰 cap 臂 `valid=true`+`scannedFiles=2_346`·第 2347 注入路径早返回 `valid=false`+`scannedFiles=0`+错误串恰 `PTP_FILE_LIMIT:2347` 三断言全行使绿·cap 数字预算联动语义不变强度不减（改动前基线 proof 12/12 EXIT=0 先证·改动后同跑 12/12 EXIT=0 双跑亲证·回填后复跑同值）。
5. **偏离**：①**基线红随刀复绿+教训登记**：基线树（4ec27f55）docs:check EXIT=1 `PTP_FILE_LIMIT:2339`（五刀 ag34/#249/ag35/asr-quality/lease-attempts 各自并线时点各对其 cap 基线合规·累计并入越限一文件·**协调方累计账失察**——cap 预算记账须核累计并集面而非单刀增量面·先手 +8 形此番为被动红热修而非真先手·后继帽步进派单应即时核累计账+在飞卷并集算术）·本刀随 cap 步进复绿（门② EXIT=0 scanned 2340≤2346）·brief 已颁红热修优先级·如实录；②markers 注记面命中 12 词次（面目门⑤·主扫 0 命中·沿先例判定·补扫非零命面如实登记）；③先例形计数：brief 颁「+8 沿先例形」未 pin 计数·按 +8 系谱系 2208/2216/…/2338 计十七先例形·如实登记；④门4 沿派单原样未加 --force（9 cached/3 fresh·0 errors 不变·两 script 直扫 eslint EXIT=0 补强）·如实登记；⑤锚A :136 现值描述行随值翻新：brief 修法面仅列 MAX_FILES+注记两行·该行为现值 live 描述·值翻后原句自相矛盾且成门6 旧值残留·随值最小翻新（仍在锚A 内·零第四文件）·如实登记；⑥其余零（落点/门矩阵/STOP 形全沿 §1/§2/§8 定稿·零越面零 amend）。
6. **卫生**：est live=0（七门全本地静态/隔离 fixture·零外呼零 secrets 零模型调用）·actualSpendCny=null·零迁移零 DDL 零 env 闸·pins 不适用（本刀无 pins 面）。
7. **STOP 终态**：三处（Status 头/§8/卷尾注）同值 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行与 Status 终翻面权归协调方·本刀不宣称关闭·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

*CAP-SANCTION-2346 记录 · 2026-10-22 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-22 EXEC 落码·§9·前值 `draft:awaiting_pre_exec_dual`（起草态·单 commit 直落未成独立 draft commit）史录）· base `main` @`4ec27f55`（派单基线恒等亲证）· 分支 `line/cap-sanction-2346` · 工作树 `meetwise-cap2346` · 立项出处=协调方派单 brief（CAP-SANCTION-2346 文档上限步进·快速链席·2338→2346·+8 沿先例形·main CI 红热修）· 修法=MAX_FILES 2_338→2_346+sanction 注记置顶两行（含「main 现值 2339 已越 2338 一文件…2341 ≤ 2346 余 5」算术如实）+:136 现值描述行随值翻新+proof 越限臂六处 2346/2347 全行使（deepEqual 行亲跟 2347·谱系承续）+本卷新增 · 门矩阵七门=proof 12/12+docs:check 2340≤2346（基线红 2339 随刀复绿如实录）+typecheck 8/8 0cached+lint 全 0 errors+markers 主扫零命中+自审 grep 清零证+diff 恰 3 tracked · est live=0 · ⛔push ⛔merge 主线*
