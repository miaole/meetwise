# CAP-SANCTION-2354 文档上限步进记录（mini·快速链·沿 cap-sanction-2272/2264 与 +8 系先例形）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 已行使·门矩阵七门全绿·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · 前值 `draft:awaiting_pre_exec_dual`（起草态·两 commit 形首笔独立 draft commit `65d2b62c4`）史录保留于 §8/卷尾注 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（届时树亲算·47dd6be5 届时值）

- **基线**：`origin/main` @ `47dd6be5`（全 hash `47dd6be56d5f3b59ccf5dc0c827b0bdc2e6952de` 派单基线恒等亲证·HEAD 恰等零漂移）。分支 `line/cap-2354`（worktree `meetwise-cap2354`·⛔push 纪律承引防误推）。
- **锚A** `scripts/ai-docs/public-text-policy.mjs` blob `333d4db8`（=47dd6be5 届值亲证）：
  - `:110-:111` sanction 注记栈现值 latest=`cap 2338→2346`（2026-10-22·新条目置顶形·2346 落点）；
  - `:136` 上限对齐单行注释「上限经 2338→2346 步进（见上注记）。恰达上限仍通过，多一个仍拒绝。」（现值 live 描述行·非注记栈谱系条目）；
  - `:137` `const MAX_FILES = 2_346;`（常量唯一定义点）；
  - `:349` `if (paths.length > MAX_FILES)` 早返回臂 → 错误串 `PTP_FILE_LIMIT:${paths.length}`（常量引用·字面量零现）；
  - `:406` `listed.paths.length > MAX_FILES` 臂同上（零字面量）。
- **锚B** `scripts/ai-docs/public-text-policy.proof.mjs` blob `2d3e8bfd`（=47dd6be5 届值亲证）·越限臂（E11 内 `:249-:347`）：
  - `:299-:301` CAP-SANCTION-2346 随刀注记（栈顶·2026-10-22 落点）；
  - `:330` fabricated 环 `for (let i = 0; i < 2_346; i += 1)`；
  - `:337` `assert.equal(atCap.scannedFiles, 2_346)`（恰 cap 臂）；
  - `:338` 注记「第 2347 个注入路径触发早返回」；`:339` 注记「错误串恰为 `PTP_FILE_LIMIT:2347`」；
  - `:340` 越限注入路径 `'ai-docs/f-2346.md'`；
  - `:343` `assert.deepEqual(overCap.errors, [\`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2347\`])`（**3cd159dd 教训行·历刀已亲跟 2209/2217/2225/2233/2241/2249/2257/2265/2273/2281/2331/2339/2347（cap-sanction-2346 卷载谱系）·本刀续跟 2355·自审 grep 全量清零为准**）。
- **计数锚**：基线树 `node scripts/ai-docs/check-docs.mjs` 亲跑 **EXIT=0** `public text policy scanned 2341 managed worktree files`（≤2346 余 5·**brief 颁定「2328 恰等零余量」勘误如实**：2328 系 LEDGER `:702` 历史行（id-order-scope 行·cap-2328 时代「扫描 2328，余 0」）实录值非届树现值·届树亲跑实测 2341 余 5·偏离①显耀登记）。基线 proof 全量 12/12 EXIT=0 先证。
- **联动面普查**：`git grep -l '2_346\|2346\|2347'` 命中 **32 文件**——码面活面恰 **2**=锚A+锚B·余 **30** 全史录豁免（harness 史录含 cap-sanction-2346/ag39/batch5b/cmop03 两卷+product-campaign-LEDGER 台账+execution-master-checklist 台账+gap-bug-backlog 台账·ai-docs/testing/governance-audit-index.json=sha256 digest/运行号子串·packages/db/test/dbhy1.proof.ts=sha256 digest 子串·receipts/archive 20=时间戳/digest/数值子串）。逐类抽查亲证（backlog `83234709` commit 子串·audit-index `sha256:…72346826ac…` digest 子串·`32422346601` 运行号子串）。第三联动面零存在亲证。
- **计数谱系**：2346 落点（`0c034b010` PR #121 并线 2026-10-22·后继 #122 `47dd6be5` 届树现值 2341 余 5）→ 在飞六条 E2E 缺口领包卷各 ≥1 并线必越（2341+6=2347>2346·**恰等零余量前提勘误后先手算术仍成立**）+ 本卷 1 → 2341+6+1=**2348 ≤ 2354 余 6**（brief 颁定 +8 先手·算术如实形）→ 协调方 sanction **+8（2346→2354）随本刀承登**·§9 门2 树内实测随录。

## §1-修法（三文件·沿 cap-sanction-2346 形制逐节同构）

- **件①** 锚A `:137`：`const MAX_FILES = 2_346;` → `const MAX_FILES = 2_354;`（注记两行置顶插后届时行 `:139`·两消费臂 `:349/:406`→`:351/:408` 常量引用零字节零触·届时行号亲证）。
- **件②** 锚A `:110` 前插 sanction 注记两行（沿 cap-sanction-2346 等先例新条目置顶形·注记栈历史零洗）：
  - `// cap 2346→2354（2026-10-26 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346 十八先例形·快速链·授权随令）：`
  - `// 届树亲跑 2341 余 5（brief 颁「2328 恰等零余量」系 LEDGER :702 历史行值·勘误如实）·在飞六条 E2E 缺口领包卷并线必越（2341+6=2347>2346·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。`
- **件②附** 锚A `:136` 现值 live 描述行随值最小翻新：「上限经 2338→2346 步进（见上注记）。」→「上限经 2346→2354 步进（见上注记）。」（该行描述当前上限非历史注记·值翻后原句自相矛盾且成门6 旧值残留·随值翻新·偏离如实登记 §9）。
- **件③** 锚B 越限臂六处数字联动+随刀注记（cap 数字行为断言 **2354/2355 全行使**·语义不变强度不减）：
  - 注记随卷（`:299` 前三行·沿 CAP-SANCTION-2346 注记形·置顶不洗旧）；
  - `:330` `i < 2_346` → `i < 2_354`（届时 `:333`）；
  - `:337` `scannedFiles, 2_346` → `scannedFiles, 2_354`（届时 `:340`）；
  - `:338` 「第 2347 个」→「第 2355 个」（届时 `:341`）；`:339` `PTP_FILE_LIMIT:2347` → `PTP_FILE_LIMIT:2355`（届时 `:342`）；
  - `:340` 系推 `'ai-docs/f-2346.md'` → `'ai-docs/f-2354.md'`（届时 `:343`）；
  - `:343` 系推 `deepEqual ... :2347` → `:2355`（届时 `:346`）。
- **件④** 本卷新增 `ai-docs/delivery/harness/cap-sanction-2354-REQUEST.md`（沿 cap-sanction-2346 卷结构同构·两 commit 形=本卷 draft commit 首笔+EXEC 码面/§9 回填/STOP 翻面第二笔）。
- **语义申明**：cap 数字预算联动+记录卷新增·零门语义变更·零产品码零迁移零 lockfile·越限臂 fabricated 数随 cap 联动同步·proof 强度不减·est live=0。

## §1.3 否决

1. **跳步 +16 或直调恰余量/更大值**：违 +8 步进纪律（2208→2346 sanction 谱系全 +8）·派单颁定值即 +8·本席无权上调（越值=红停上报非自升）·否决。
2. **上限无界化（删 cap/`MAX_FILES=Infinity`）**：恰 cap 臂+越限错误码形状断言两臂失语义·proof 强度减·否决。
3. **proof 越限臂不联动（留 2_346/2347）**：届时 atCap 臂 `valid=false` 必红·假红污染门矩阵·否决。
4. **注记栈旧值洗除/历史行重写**：历史 sanction 注记为计数谱系 SSOT·append 置顶不洗旧·否决。
5. **依 brief 颁「2328 恰等零余量」原文直录注记**：届树亲跑实测 2341 余 5·SSOT 注记栈为计数谱系·明知与亲跑实测不符仍落卷即伪造算术（2328 系 LEDGER :702 cap-2328 时代历史行值）·沿「算术如实」纪律以实测值落注记+勘误与偏离显耀登记代之·否决。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 §9+commit message 记）

1. **policy.proof 全绿 12/12 届时值**：`node scripts/ai-docs/public-text-policy.proof.mjs` → `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·全量一次行使即全 proof 邻面·零 --case 单臂跳跑·2354/2355 双值全行使绿）EXIT=0。
2. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 `scanned ≤2354`（EXEC 树预期 2342=基线 2341+本卷 1·树内余 12；brief 算术勘误后 2348≤2354 余 6 含在飞六卷）。基线绿 2341≤2346 如实录。
3. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（全 successful·0 cached）。
4. **lint**：`pnpm turbo lint`（真实退出码无管道直取）EXIT=0 全 0 errors（0 新增 error·各包预算恰等不抬）。
5. **markers**：改动集（两 script 新增行+本 commit message）词面运行时组装扫描（词形不入卷防自匹配）主扫零命中+全树行首冲突标记严格形零命中（注记行既有谱系/颁定文本命中沿先例判定豁免·如实登记）。
6. **自审 grep 清零证**：`grep -n "2_346\|2346\|2347"`（+下划线形 `2_347` 补扫）两 script 全量逐处核——live 码/断言行旧值残留清零（深核 `deepEqual`/`assert.equal` 行·`deepEqual` 行届时 `:346` 亲跟 `:2355`）·历史注记行既有谱系值豁免登记（非残留）。
7. **diff 恰 3 tracked**：EXEC commit 面=锚A+锚B+本卷（§9 回填+STOP 翻面同第二笔 commit）·零第四文件·零产品码零迁移零 lockfile·tsbuildinfo 副产物如翻动 checkout 回滚不入 commit。

**停止条件（命中即停手上报）**：proof 任一臂红·docs:check>2354·diff 超 3 tracked·自审 grep 出非豁免旧值命中。

## §8 STOP（开工条款 + 翻面形）

- **开工条款（sanction 直落形）**：①协调方派单 brief 即 sanction 授权（`2346→2354` 步进值+修法+门矩阵由 brief 颁定·+8 先手（在飞六条 E2E 缺口领包卷并线必越·brief 颁「恰等零余量」前提勘误后算术仍成立如实登记））；②快速链诊断+起草+EXEC 一体席·沿先例 sanction 直落形·pre-exec 双审由 sanction 形制承载·两 commit 形=本卷独立 draft commit+EXEC 第二笔（随派单令「两 commit」颁定）；③EXEC 不得越 §1-修法落点与 §1.3 否决面（越则红停回炉）。
- **STOP = `executed:awaiting_post_prove_dual` 三处同值**（Status 头+本节+卷尾注·前值 `draft:awaiting_pre_exec_dual` 史录保留零字洗·两 commit 形第二笔翻面）·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行/Status 终翻面权归协调方·本刀不宣称关闭。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §9 EXEC 记录（快速链一体席·2026-10-26·门矩阵七门 EXIT 原值）

1. **授权链**：协调方派单 brief（CAP-SANCTION-2354 文档上限步进·sanction 2346→2354 直落·+8 先手（在飞六条 E2E 缺口领包卷并线必越·brief 颁「恰等零余量」前提勘误后算术仍成立·偏离①如实录）·快速链席·沿 cap-sanction-2272/2264 先例形·两 commit 颁定）→ 本席起草（`draft:awaiting_pre_exec_dual`·独立 draft commit `65d2b62c4`）→ EXEC 本席落码。
2. **码面落点**（恰 3 文件·沿 §1-修法逐处定稿·零越面）：锚A `scripts/ai-docs/public-text-policy.mjs`=:110-:111 置顶注记两行（cap 2346→2354·届树亲跑 2341 余 5+在飞六卷 2347 必越算术·注记栈 append 不洗旧）+:138 现值描述行随值翻新（「上限经 2346→2354 步进（见上注记）」·见偏离⑤）+:139 `MAX_FILES = 2_354`（:351/:408 消费臂常量引用零字节零触亲证）·锚B `scripts/ai-docs/public-text-policy.proof.mjs`=:299-:301 随刀注记三行+:333 `< 2_354`+:340 `scannedFiles, 2_354`+:341 第 2355 个+:342 `PTP_FILE_LIMIT:2355`+:343 `f-2354.md`+:346 `deepEqual ...:2355`（六处六行全行使 2354/2355 双值·届时行号与 §1 预标定逐处恰等亲证）+本卷 §9 回填/STOP 翻面同第二笔 commit。
3. **门矩阵七门全绿**：①policy.proof 全量 `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·零 --case 跳跑·2354/2355 双值全行使绿）EXIT=0（改动前基线 12/12 EXIT=0 先证·改动后双跑·§9 回填后复跑同值）；②docs:check：基线树（47dd6be5）亲跑 EXIT=0 `scanned 2341`（≤2346 余 5·**brief 颁「2328 恰等零余量」勘误·偏离①**）→ 卷落并码改后 EXIT=0 `scanned 2342`（=2341+本卷 1·≤2354 树内余 12）→ §9 回填后复跑同值 2342 EXIT=0（brief 算术勘误后 2348≤2354 余 6 含在飞六卷）；③`pnpm turbo typecheck --force` 8 successful/8 total EXIT=0（fresh worktree 先 `pnpm install --frozen-lockfile` EXIT=0（1m31s·node_modules gitignored 零 diff 面·见偏离④））；④`pnpm turbo lint` 真实退出码直取 EXIT=0 12 successful/12 total·`  error  ` 级字样 0 命中·0 新增 error·两 script 直扫 `pnpm exec eslint` EXIT=0 零输出；⑤markers=改动集（两 script+本卷）行首冲突标记严格形（`^<{7}|^>{7}|^={7} `）0 命中+diff 新增行 0 命中+两 commit 消息词面运行时组装扫描（sanction/快速链/席/帽/STOP/draft/EXEC/门矩阵/LEDGER/post·词形不入卷防自匹配）hits=NONE（「REQUEST」系卷型文件名描述词沿先例消息族保留）；⑥自审 grep 清零证=两 script 全量 `2_346|2346|2347|2_347` 共 9 行命中逐处核·**live 码/断言行旧值残留零命中**（policy :110-:113/:138 与 proof :299-:300/:302/:304 全为注记/注释/现值描述行·:138 为随值翻新后「2346→2354」正确「自」值非残留·`deepEqual` 行 :346 已跟 `:2355`=3cd159dd 教训行承续·历刀已跟 2209/2217/2225/2233/2241/2249/2257/2265/2273/2281/2331/2339/2347·本刀续跟 2355）·新值 `2_354|2354|2355` 在位亲证（policy :139·proof :333/:340/:341/:342/:343/:346）；⑦diff 恰 3 tracked（锚A+锚B+本卷）·pnpm-lock 零字节·tsbuildinfo 副产物零翻动不入 commit。
4. **proof 臂账**：越限臂 fabricated 数 2_354 恰 cap 臂 `valid=true`+`scannedFiles=2_354`·第 2355 注入路径早返回 `valid=false`+`scannedFiles=0`+错误串恰 `PTP_FILE_LIMIT:2355` 三断言全行使绿·cap 数字预算联动语义不变强度不减（改动前基线 proof 12/12 EXIT=0 先证·改动后同跑 12/12 EXIT=0 双跑亲证·回填后复跑同值）。
5. **偏离**：①**brief 颁「2328 恰等零余量」勘误**：届树亲跑实测 **2341 余 5**（2328 系 LEDGER `:702` id-order-scope 历史行值·cap-2328 时代「扫描 2328，余 0」实录非届树现值）——先手算术勘误后仍成立（2341+在飞六卷=2347>2346 必越·2341+6+本卷 1=2348≤2354 余 6）·注记两行/锚B 随刀注记以实测值落卷+勘误显耀登记（§1.3-⑤ 否决直录原文·沿「算术如实」纪律·同 2346 刀「协调方累计账失察」承 intellectually）·如实录；②注记日期 2026-10-26=实际行使日（brief 未颁日期·沿 2338 刀先例以行使日落）；③先例形计数：brief 颁「+8 先例形」未 pin 计数·按 +8 系谱系 2208/2216/…/2346 计十八先例形·如实登记；④fresh worktree 依赖先行：本刀 worktree 新建无 node_modules·`pnpm install --frozen-lockfile` EXIT=0 先行后方跑门③④（lockfile 零改零入 commit）·如实登记；⑤锚A :138 现值描述行随值翻新：brief 修法面仅列 MAX_FILES+注记两行·该行为现值 live 描述·值翻后原句自相矛盾且成门6 旧值残留·随值最小翻新（仍在锚A 内·零第四文件·沿 2346 刀偏离⑤同面先例）·如实登记；⑥其余零（落点/门矩阵/STOP 形全沿 §1/§2/§8 定稿·零越面零 amend）。
6. **卫生**：est live=0（七门全本地静态/隔离 fixture·零外呼零 secrets 零模型调用）·actualSpendCny=null·零迁移零 DDL 零 env 闸·pins 不适用（本刀无 pins 面）。
7. **STOP 终态**：三处（Status 头/§8/卷尾注）同值 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行与 Status 终翻面权归协调方·本刀不宣称关闭·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

*CAP-SANCTION-2354 记录 · 2026-10-26 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-26 EXEC 落码·§9·前值 `draft:awaiting_pre_exec_dual`（起草态·独立 draft commit `65d2b62c4`）史录）· base `main` @`47dd6be5`（派单基线恒等亲证）· 分支 `line/cap-2354` · 工作树 `meetwise-cap2354` · 立项出处=协调方派单 brief（CAP-SANCTION-2354 文档上限步进·快速链席·2346→2354·+8 先手·在飞六条 E2E 缺口领包并线算术）· 修法=MAX_FILES 2_346→2_354+sanction 注记置顶两行（含「届树亲跑 2341 余 5·在飞六卷并线 2347 必越」算术如实+「2328 恰等零余量」勘误登记）+:138 现值描述行随值翻新+proof 越限臂六处 2354/2355 全行使（deepEqual 行亲跟 2355·谱系承续）+本卷新增 · 门矩阵七门=proof 12/12+docs:check 2342≤2354（基线 2341 余 5 勘误如实录）+typecheck 8/8+lint 12/12 全 0 errors+markers 零命中+自审 grep 清零证+diff 恰 3 tracked · est live=0 · ⛔push ⛔merge 主线*
