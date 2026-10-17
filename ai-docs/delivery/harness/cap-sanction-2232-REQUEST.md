# CAP-SANCTION-2232 文档帽步进刀 REQUEST（mini·快速链·沿 a75736a0/e9f99940/51abfe78 三先例形）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 已行使·门矩阵七门全绿·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · 前值 `draft:awaiting_pre_exec_dual` @draft `6571d0f9` 史录保留于 §8/卷尾注 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（届时树亲算·e8439631 届时值）

- **基线**：`origin/feat/mysql-schema-skeleton` @ `e8439631`（cap-sanction-2224 nail 波 tip·fetch 后 tip≥2c257eb0 亲证=`git merge-base --is-ancestor 2c257eb0 origin/feat/mysql-schema-skeleton` EXIT=0·届 tip 实测 `e8439631`·progress-write nail 波 tip `2c257eb0` 与 cap-2224 EXEC `51abfe78` 均在谱系内双亲证）。支线 `line/cap-sanction-2232`（worktree `meetwise-cap32`·基线即 e8439631·upstream 未设防误推）。
- **锚A** `scripts/ai-docs/public-text-policy.mjs` blob `dfab50c4`（=51abfe78 2224 EXEC 落点 blob 恒等·62ce7dbc 并线+e8439631 nail 零漂移亲证）：
  - `:87-88` sanction 注记栈现值 latest=`cap 2216→2224`（2026-10-16·新条目置顶形·51abfe78 落点）；
  - `:108` `const MAX_FILES = 2_224;`（常量唯一定义点）；
  - `:320` `if (paths.length > MAX_FILES)` 早返回臂 → 错误串 `PTP_FILE_LIMIT:${paths.length}`（常量引用·字面量零现）；
  - `:377` `listed.paths.length > MAX_FILES` 臂同上（零字面量）。
- **锚B** `scripts/ai-docs/public-text-policy.proof.mjs` blob `4afb3cb6`（=51abfe78 2224 EXEC 落点 blob 恒等·此后零漂移亲证）·越限臂（E11 内 `:296-:311`）：
  - `:297` fabricated 环 `for (let i = 0; i < 2_224; i += 1)`；
  - `:304` `assert.equal(atCap.scannedFiles, 2_224)`（恰 cap 臂）；
  - `:305` 注记「第 2225 个注入路径触发早返回」；`:306` 注记「错误串恰为 `PTP_FILE_LIMIT:2225`」；
  - `:307` 越限注入路径 `'ai-docs/f-2224.md'`；
  - `:310` `assert.deepEqual(overCap.errors, [\`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2225\`])`（**3cd159dd 教训行·a75736a0 已亲跟 2209·e9f99940 已亲跟 2217·51abfe78 已亲跟 2225·本刀续跟 2233·自审 grep 全量清零为准**）。
- **计数锚**：本支线届树 `node scripts/ai-docs/check-docs.mjs` 基线亲跑 EXIT=0 `public text policy scanned 2214 managed worktree files`（=cap-2224 nail 工序3 届树实测 2214 恰等·实测值权威）。
- **联动面普查**：`grep -rln "2_224|FILE_LIMIT:2225|f-2224.md"`（mjs/cjs/ts/yml/yaml/json 全量）恰两文件命中=锚A+锚B·第三联动面零存在亲证。
- **勘误源（承登依据）**：cap-2224 post 双审=席1 PASS+席2 排程维 FAIL（码面本体双席一致认可·协调方裁决=PASS 准 nail·排程面归协调方·LEDGER 配套管线 cap-sanction-2224 nail 行在卷）。席2 R1 勘误=**2224 帽算术漏计 progress-write +1**（2224 算术按主线 92086586=2212 预判 2213+11=2224；progress-write nail 波 `99770ff0`/`2c257eb0` 并线携入 REQUEST 受管件 +1·届主线实值 2213）→ **AG-15（+5）落地 2225>2224 必红**（2213+1+4+2+5=2225）→ 协调方 sanction +8（2224→2232）先手承登勘误·本刀即该排程面处置。
- **计数谱系**：e8439631 届树实测 **2214**（=92086586 2212+progress-write REQUEST 1〔2224 帽算术漏计项〕+cap-2224 REQUEST 1）→ 本卷 REQUEST +1=**2215**（draft 树实测）→ 在飞 AG-16（+4：REQUEST+proof+收据）/幽灵脚本（+2：REQUEST+新 proof）/AG-15（+5：REQUEST+3 码面+收据）三刀并线 2215+11=**2226**≤2232 余 6（无本刀时=2225>2224 必红·AG-15 落地即红）→ 协调方 sanction +8 步进 2224→2232 先手承登。

## §1-修法（两文件·沿 51abfe78 形制逐字节同构）

- **件①** 锚A `:108`：`const MAX_FILES = 2_224;` → `const MAX_FILES = 2_232;`（注记两行置顶后届时行 `:110`·两消费臂 `:320/:377`→`:322/:379` 常量引用零字节零触）。
- **件②** 锚A `:87` 前插 sanction 注记两行（沿 51abfe78/e9f99940/a75736a0 新条目置顶形·注记栈历史零洗·勘误承登）：
  - `// cap 2224→2232（2026-10-17 协调方 sanction·+8 沿 +8 先例形：2224 帽算术漏计 progress-write +1·`
  - `// AG-15（+5）落地 2225>2224 必红·本刀补 +8）。`
- **件③** 锚B 越限臂六处数字联动（cap 数字行为断言 **2232/2233 全行使**·语义不变强度不减）：
  - `:297` `i < 2_224` → `i < 2_232`；
  - `:304` `scannedFiles, 2_224` → `scannedFiles, 2_232`；
  - `:305` 「第 2225 个」→「第 2233 个」；`:306` `PTP_FILE_LIMIT:2225` → `PTP_FILE_LIMIT:2233`；
  - `:307` `'ai-docs/f-2224.md'` → `'ai-docs/f-2232.md'`；
  - `:310` `deepEqual ... :2225` → `:2233`。
- **语义申明**：cap 数字预算联动·零门语义变更·零产品码零迁移零 lockfile·越限臂 fabricated 数随 cap 联动同步·proof 强度不减·est live=0。

## §1.3 否决

1. **跳步 +16/+24 一步到位（含 2216→2232 直跳）**：违 +8 步进纪律（3cd159dd/a75736a0/633e3f48/e9f99940/51abfe78 谱系全 +8·2224 已落线唯 +8 可承）·否决。
2. **上限无界化（删 cap/`MAX_FILES=Infinity`）**：恰 cap 臂+越限错误码形状断言两臂失语义·proof 强度减·否决。
3. **proof 越限臂不联动（留 2_224/2225）**：届时 atCap 臂 `valid=false` 必红·假红污染门矩阵·否决。
4. **注记栈旧值洗除/历史行重写（含对 `:87-88` 2224 行就地标改"补救"）**：历史 sanction 注记为计数谱系 SSOT·append 置顶不洗旧·勘误承登唯 append 置顶形（51abfe78 同形）·否决。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 §9+commit message 记）

1. **policy.proof 全绿 12/12 届时值**：`node scripts/ai-docs/public-text-policy.proof.mjs` → `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·全量一次行使即全 proof 邻面·零 --case 单臂跳跑）EXIT=0。
2. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 `scanned ≤2232`（draft 树预期 2215=基线 2214+本卷 1·EXEC 树同值零新增文件·余 17）。
3. **typecheck**：`pnpm turbo typecheck --force` 8/8（0 cached）EXIT=0。
4. **lint**：`pnpm turbo lint --force` 12/12 五值恰等既有基线（0 新增 error）EXIT=0。
5. **markers 五类**：改动集（2 script+本卷）运行时组装词面扫描零命中（四词 join 形+冲突标记对·词面不入卷防自匹配·i6-239 口径）+全树行首冲突标记严格形零命中。
6. **自审 grep 清零证**：`grep -n "2_224\|2224\|2225\|2232\|2233"`（+下划线形 `2_232\|2_233` 补扫）两 script 全量逐处核——live 码/断言行旧值残留清零（深核 `deepEqual`/`assert.equal` 行·`deepEqual` 行 `:310` 亲跟 `:2233`）·历史注记行既有谱系值豁免登记（非残留）。
7. **diff 恰 3 tracked**：EXEC commit 面=锚A+锚B+本卷（§9 append+STOP 翻面）·零第四文件·零产品码零迁移零 lockfile·tsbuildinfo 副产物（`apps/web/tsconfig.tsbuildinfo` tracked）如翻动 checkout 回滚不入 commit。

**停止条件（命中即停手上报）**：proof 任一臂红·docs:check>2232·diff 超 3 tracked·自审 grep 出非豁免旧值命中。

## §8 STOP（开工条款 + 翻面形）

- **开工条款（sanction 直落形）**：①协调方派单 brief 即 sanction 授权（`2224→2232` 步进值+修法+门矩阵由 brief 颁定·勘误承登=2224 帽算术漏计 progress-write +1·AG-15（+5）落地 2225>2224·本刀补 +8）；②快速链诊断+起草+EXEC 一体席·沿 a75736a0/e9f99940/51abfe78 sanction 刀单波直落先例·pre-exec 双审由 sanction 形制承载；③EXEC 不得越 §1-修法三件九行落点与 §1.3 否决面（越则红停回炉）。
- **STOP = `draft:awaiting_pre_exec_dual` 三处同值**（Status 头+本节+卷尾注·draft commit `6571d0f9` 时点史录保留零字洗）→ **EXEC commit 翻 `executed:awaiting_post_prove_dual` 三处同值**（Status 头+本节+卷尾注·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·Dual PASS≠关闭·批表行/Status 终翻面权归协调方·本刀不宣称关闭）。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

## §9 EXEC 记录（快速链一体席·2026-10-17·门矩阵七门 EXIT 原值）

1. **授权链**：协调方派单 brief（sanction 2224→2232 直落刀·AG-15 前置·承 2224 漏计勘误·快速链诊断+起草+EXEC 一体席）→ draft commit `6571d0f9`（本卷 §0-§8+STOP 三处 draft 史录）→ EXEC 本席落码。
2. **码面落点**（恰 2 文件·沿 §1-修法逐处定稿·零越面）：锚A `scripts/ai-docs/public-text-policy.mjs`=:87-:88 置顶注记两行（cap 2224→2232·2224 帽算术漏计 progress-write +1·AG-15（+5）落地 2225>2224 必红·本刀补 +8·注记栈 append 不洗旧）+:110 `MAX_FILES = 2_232`（:322/:379 消费臂常量引用零字节）·锚B `scripts/ai-docs/public-text-policy.proof.mjs`=:297 `< 2_232`+:304 `scannedFiles, 2_232`+:305 第 2233 个+:306 `PTP_FILE_LIMIT:2233`+:307 `f-2232.md`+:310 `deepEqual ...:2233`（六处六行全行使 2232/2233 双值）。
3. **门矩阵七门全绿**：①policy.proof 全量 `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·零 --case 跳跑）EXIT=0；②docs:check EXIT=0 `scanned 2215 managed worktree files`≤2232 余 17（EXEC 树与 draft 树同值·零新增文件·谱系=cap-2224 nail 波届主线 2214+本卷 REQUEST 1）；③`pnpm turbo typecheck --force` 8 successful/8·0 cached EXIT=0（新支线树 `pnpm install --frozen-lockfile` 门前置·pnpm-lock 零字节）；④`pnpm turbo lint --force` 12 successful/12·0 cached EXIT=0·五值恰等既有基线 web 601/api 1421/worker 954/ai-runtime 628/root 5235（全 0 errors·contracts 265/domain 115/qdrant 27/ai-graphs 47 贴线/db 1042 同值）；⑤markers 五类改动集（2 script+本卷）运行时组装词面扫描 `words=4 files=3 hits=0` EXIT=0+全树行首冲突标记严格形 EXIT=1 零命中；⑥自审 grep 清零证=两 script 全量 `2_224|2224|2225|2232|2233`（+下划线形 `2_232|2_233` 补扫）逐处核·**live 码/断言行旧值残留零命中**（旧值专项非注释行复扫 EXIT=1 零命中·`deepEqual` 行 :310 已跟 `:2233`=3cd159dd 教训行承续·a75736a0 已跟 2209/e9f99940 已跟 2217/51abfe78 已跟 2225 本刀续跟）·余命中 10 处全注记/新值行（policy.mjs :87 本刀新注记 from 值 2224+:88 勘误叙事 2225>2224+:89 谱系 SSOT 2216→2224+:110 `2_232` 新值·proof.mjs :297/:304/:305/:306/:307/:310 六处全新值 2232/2233·旧值零命中）；⑦diff 面恰 3 tracked（本 2 .mjs+本卷 .md §9 append+STOP 翻面）·pnpm-lock 零字节·tsbuildinfo 门副产 checkout 回滚不入 commit。
4. **proof 臂账**：越限臂 fabricated 数 2_232 恰 cap 臂 `valid=true`+`scannedFiles=2_232`·第 2233 注入路径早返回 `valid=false`+`scannedFiles=0`+错误串恰 `PTP_FILE_LIMIT:2233` 三断言全行使绿·cap 数字预算联动语义不变强度不减。
5. **偏离**：零（落点/门矩阵/STOP 形全沿 §1/§2/§8 定稿·三件九行逐字节落定·零越面零程序性偏差·新支线树依赖安装系门前置非码面偏差）。
6. **卫生**：est live=0（七门全本地静态/隔离 fixture·零外呼零 secrets 零模型调用）·actualSpendCny=null·零迁移零 DDL 零 env 闸·pins 不适用（本刀无 pins 面）。
7. **STOP 终态**：三处（Status 头/§8/卷尾注）同值 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行与 Status 终翻面权归协调方·本刀不宣称关闭·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

*CAP-SANCTION-2232 REQUEST · 2026-10-17 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-17 EXEC 落码·§9·前值 `draft:awaiting_pre_exec_dual` @draft `6571d0f9` 史录）· base `feat/mysql-schema-skeleton` @`e8439631`（cap-sanction-2224 nail 波 tip·≥2c257eb0 亲证）· 分支 `line/cap-sanction-2232` · 工作树 `meetwise-cap32` · 立项出处=协调方派单 brief（AG-15 前置·承 2224 漏计勘误·席2 R1：AG-15 +5 落地 2225>2224 必红）· 修法=MAX_FILES 2_224→2_232+sanction 注记置顶两行（含漏计勘误承登）+proof 越限臂六处 2232/2233 全行使（沿 51abfe78 形制·两 blob dfab50c4/4afb3cb6 零漂移）· 门矩阵七门全绿=proof 12/12 EXIT=0+docs:check 2215≤2232 EXIT=0+typecheck 8/8 0cached+lint 12/12 五值恰等 601/1421/954/628/5235+markers hits=0+自审 grep 清零证+diff 恰 3 tracked · est live=0 · markers=0 · ⛔push ⛔merge 主线*
