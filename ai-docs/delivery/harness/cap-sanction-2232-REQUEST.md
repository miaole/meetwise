# CAP-SANCTION-2232 文档帽步进刀 REQUEST（mini·快速链·沿 a75736a0/e9f99940/51abfe78 三先例形）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷·EXEC 待协调方 sanction 形制开工授权·alone≠dual·Ban self-approve · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

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
- **STOP = `draft:awaiting_pre_exec_dual` 三处同值**（Status 头+本节+卷尾注·draft commit 时点史录保留零字洗）→ **EXEC commit 翻 `executed:awaiting_post_prove_dual` 三处同值**（Status 头+本节+卷尾注·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·Dual PASS≠关闭·批表行/Status 终翻面权归协调方·本刀不宣称关闭）。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

*CAP-SANCTION-2232 REQUEST · 2026-10-17 起草 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`e8439631`（cap-sanction-2224 nail 波 tip·≥2c257eb0 亲证）· 分支 `line/cap-sanction-2232` · 工作树 `meetwise-cap32` · 立项出处=协调方派单 brief（AG-15 前置·承 2224 漏计勘误·席2 R1：AG-15 +5 落地 2225>2224 必红）· 修法=MAX_FILES 2_224→2_232+sanction 注记置顶两行（含漏计勘误承登）+proof 越限臂六处 2232/2233 全行使（沿 51abfe78 形制·两 blob dfab50c4/4afb3cb6 零漂移）· est live=0 · ⛔push ⛔merge 主线*
