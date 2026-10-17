# CAP-SANCTION-2224 文档帽步进刀 REQUEST（mini·快速链·沿 a75736a0/e9f99940 两先例形）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 已行使·门矩阵七门全绿·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · 前值 `draft:awaiting_pre_exec_dual` @draft `6a18415d` 史录保留于 §8/卷尾注 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（届时树亲算·92086586 届时值）

- **基线**：`origin/feat/mysql-schema-skeleton` @ `92086586`（requeue-backoff 夹具刀 tip·fetch 后 tip≥92086586 等号成立亲证）。支线 `line/cap-sanction-2224`（worktree `meetwise-cap24`·基线即 92086586·upstream 已解除防误推）。`git merge-base --is-ancestor e9f99940 92086586` YES+`6c92ef4c` YES（2216 EXEC/nail 落点在谱系内双亲证）。
- **锚A** `scripts/ai-docs/public-text-policy.mjs` blob `4509bf68`（=e9f99940 2216 EXEC 落点 blob 恒等·此后零漂移亲证）：
  - `:87-88` sanction 注记栈现值 latest=`cap 2208→2216`（2026-10-16·新条目置顶形·e9f99940 落点）；
  - `:106` `const MAX_FILES = 2_216;`（常量唯一定义点）；
  - `:318` `if (paths.length > MAX_FILES)` 早返回臂 → 错误串 `PTP_FILE_LIMIT:${paths.length}`（常量引用·字面量零现）；
  - `:375` `listed.paths.length > MAX_FILES` 臂同上（零字面量）。
- **锚B** `scripts/ai-docs/public-text-policy.proof.mjs` blob `d7026551`（=e9f99940 2216 EXEC 落点 blob 恒等·此后零漂移亲证）·越限臂（E11 内 `:296-:311`）：
  - `:297` fabricated 环 `for (let i = 0; i < 2_216; i += 1)`；
  - `:304` `assert.equal(atCap.scannedFiles, 2_216)`（恰 cap 臂）；
  - `:305` 注记「第 2217 个注入路径触发早返回」；`:306` 注记「错误串恰为 `PTP_FILE_LIMIT:2217`」；
  - `:307` 越限注入路径 `'ai-docs/f-2216.md'`；
  - `:310` `assert.deepEqual(overCap.errors, [\`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2217\`])`（**3cd159dd 教训行·a75736a0 已亲跟 2209·e9f99940 已亲跟 2217·本刀自审 grep 全量清零为准**）。
- **计数锚**：本支线届树 `node scripts/ai-docs/check-docs.mjs` 基线亲跑 EXIT=0 `public text policy scanned 2212 managed worktree files`（=派单背景口径 2212 恰等·实测值权威）。
- **联动面普查**：`grep -rln "2_216|FILE_LIMIT:2217|f-2216.md"`（mjs/cjs/ts/yml/yaml/json 全量）恰两文件命中=锚A+锚B·第三联动面零存在亲证。
- **计数谱系**：a75736a0 sanction 2208（REQUEST 落卷 2195）→ 10799a3e 2203 → 633e3f48 本 2216 REQUEST 落卷 2204 → e9f99940 2216 EXEC → 主线各刀并入递推 → 92086586 2212 余 4 → 本刀 REQUEST 落卷 +1=2213 → 在飞 AG-16（+4：REQUEST+proof+收据）/幽灵脚本（+2：REQUEST+新 proof）/AG-15（+5：REQUEST+3 码面+收据）三刀并线 2213+11=2224（派单口径 2212+11=2223 同超）→ **>2216 必越限** → 协调方 sanction +8 步进 2216→2224 先手落主线。

## §1-修法（两文件·沿 e9f99940 形制逐字节同构）

- **件①** 锚A `:106`：`const MAX_FILES = 2_216;` → `const MAX_FILES = 2_224;`（注记两行置顶后届时行 `:108`·两消费臂 `:318/:375`→`:320/:377` 常量引用零字节零触）。
- **件②** 锚A `:87` 前插 sanction 注记两行（沿 e9f99940/a75736a0 新条目置顶形·注记栈历史零洗）：
  - `// cap 2216→2224（2026-10-16 协调方 sanction·+8 沿 +8 先例形：主线 92086586 2212·`
  - `// 在飞 AG-16（+4）/幽灵脚本（+2）/AG-15（+5）三刀并线即 2223 超限）。`
- **件③** 锚B 越限臂六处数字联动（cap 数字行为断言 **2224/2225 全行使**·语义不变强度不减）：
  - `:297` `i < 2_216` → `i < 2_224`；
  - `:304` `scannedFiles, 2_216` → `scannedFiles, 2_224`；
  - `:305` 「第 2217 个」→「第 2225 个」；`:306` `PTP_FILE_LIMIT:2217` → `PTP_FILE_LIMIT:2225`；
  - `:307` `'ai-docs/f-2216.md'` → `'ai-docs/f-2224.md'`；
  - `:310` `deepEqual ... :2217` → `:2225`。
- **语义申明**：cap 数字预算联动·零门语义变更·零产品码零迁移零 lockfile·越限臂 fabricated 数随 cap 联动同步·proof 强度不减·est live=0。

## §1.3 否决

1. **跳步 +16/+24 一步到位**：违 +8 步进纪律（3cd159dd/a75736a0/633e3f48 谱系全 +8）·否决。
2. **上限无界化（删 cap/`MAX_FILES=Infinity`）**：恰 cap 臂+越限错误码形状断言两臂失语义·proof 强度减·否决。
3. **proof 越限臂不联动（留 2_216/2217）**：届时 atCap 臂 `valid=false` 必红·假红污染门矩阵·否决。
4. **注记栈旧值洗除/历史行重写**：历史 sanction 注记为计数谱系 SSOT·append 置顶不洗旧（e9f99940 同形）·否决。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 §9+commit message 记）

1. **policy.proof 全绿 12/12 届时值**：`node scripts/ai-docs/public-text-policy.proof.mjs` → `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·全量一次行使即全 proof 邻面·零 --case 单臂跳跑）EXIT=0。
2. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 `scanned ≤2224`（draft 树预期 2213=基线 2212+本卷 1·EXEC 树同值零新增文件·余 11）。
3. **typecheck**：`pnpm turbo typecheck --force` 8/8（0 cached）EXIT=0。
4. **lint**：`pnpm turbo lint --force` 12/12 五值恰等既有基线（0 新增 error）EXIT=0。
5. **markers 五类**：改动集（2 script+本卷）运行时组装词面扫描零命中（四词 join 形+冲突标记对·词面不入卷防自匹配·i6-239 口径）。
6. **自审 grep 清零证**：`grep -n "2_216\|2216\|2217\|2224\|2225"`（+下划线形 `2_224|2_225` 补扫）两 script 全量逐处核——live 码/断言行旧值残留清零（深核 `deepEqual`/`assert.equal` 行·`deepEqual` 行 `:310` 亲跟 `:2225`）·历史注记行既有谱系值豁免登记（非残留）。
7. **diff 恰 3 tracked**：EXEC commit 面=锚A+锚B+本卷（§9 append+STOP 翻面）·零第四文件·零产品码零迁移零 lockfile·tsbuildinfo 副产物（`apps/web/tsconfig.tsbuildinfo` tracked）如翻动 checkout 回滚不入 commit。

**停止条件（命中即停手上报）**：proof 任一臂红·docs:check>2224·diff 超 3 tracked·自审 grep 出非豁免旧值命中。

## §8 STOP（开工条款 + 翻面形）

- **开工条款（sanction 直落形）**：①协调方派单 brief 即 sanction 授权（`2216→2224` 步进值+修法+门矩阵由 brief 颁定·在飞并入算术=AG-16 +4/幽灵脚本 +2/AG-15 +5 即 2223 超 2216）；②快速链诊断+起草+EXEC 一体席·沿 a75736a0/e9f99940 sanction 刀单波直落先例·pre-exec 双审由 sanction 形制承载；③EXEC 不得越 §1-修法三件九行落点与 §1.3 否决面（越则红停回炉）。
- **STOP = `draft:awaiting_pre_exec_dual` 三处同值**（Status 头+本节+卷尾注·draft commit `6a18415d` 时点史录保留零字洗）→ **EXEC commit 翻 `executed:awaiting_post_prove_dual` 三处同值**（Status 头+本节+卷尾注·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·Dual PASS≠关闭·批表行/Status 终翻面权归协调方·本刀不宣称关闭）。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

## §9 EXEC 记录（快速链一体席·2026-10-16·门矩阵七门 EXIT 原值）

1. **授权链**：协调方派单 brief（sanction 2216→2224 直落刀·快速链诊断+起草+EXEC 一体席）→ draft commit `6a18415d`（本卷 §0-§8+STOP 三处 draft 史录）→ EXEC 本席落码。
2. **码面落点**（恰 2 文件·沿 §1-修法逐处定稿·零越面）：锚A `scripts/ai-docs/public-text-policy.mjs`=:87-:88 置顶注记两行（cap 2216→2224·主线 92086586 2212·在飞 AG-16（+4）/幽灵脚本（+2）/AG-15（+5）三刀并线即 2223 超限·注记栈 append 不洗旧）+:108 `MAX_FILES = 2_224`（:320/:377 消费臂常量引用零字节）·锚B `scripts/ai-docs/public-text-policy.proof.mjs`=:297 `< 2_224`+:304 `scannedFiles, 2_224`+:305 第 2225 个+:306 `PTP_FILE_LIMIT:2225`+:307 `f-2224.md`+:310 `deepEqual ...:2225`（六处六行全行使 2224/2225 双值）。
3. **门矩阵七门全绿**：①policy.proof 全量 `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·零 --case 跳跑）EXIT=0；②docs:check EXIT=0 `scanned 2213 managed worktree files`≤2224 余 11（EXEC 树与 draft 树同值·零新增文件）；③`pnpm turbo typecheck --force` 8 successful/8·0 cached EXIT=0；④`pnpm turbo lint --force` 12 successful/12·0 cached EXIT=0·五值恰等既有基线 web 601/api 1421/worker 954/ai-runtime 628/root 5235（全 0 errors·contracts 265/domain 115/qdrant 27/ai-graphs 47 贴线/db 1042 同值）；⑤markers 五类改动集（2 script+本卷）运行时组装词面扫描 `words=4 files=3 hits=0` EXIT=0；⑥自审 grep 清零证=两 script 全量 `2_216|2216|2217|2224|2225`（+下划线形 `2_224|2_225` 补扫）逐处核·**live 码/断言行旧值残留零命中**（旧值专项 `2_216|2217` 复扫全量 EXIT=1 零命中·`deepEqual` 行 :310 已跟 `:2225`=3cd159dd 教训行承续·a75736a0 已跟 2209/e9f99940 已跟 2217 本刀续跟）·余命中 9 处全注记/新值行（policy.mjs :87 本刀新注记 `2216→2224` from 值+:89 `2208→2216` 谱系 SSOT+:108 `2_224` 新值·proof.mjs :297/:304/:305/:306/:307/:310 六处全新值 2224/2225·旧值零命中）；⑦diff 面恰 3 tracked（本 2 .mjs+本卷 .md §9 append+STOP 翻面）·pnpm-lock 零字节·tsbuildinfo 门副产 checkout 回滚不入 commit。
4. **proof 臂账**：越限臂 fabricated 数 2_224 恰 cap 臂 `valid=true`+`scannedFiles=2_224`·第 2225 注入路径早返回 `valid=false`+`scannedFiles=0`+错误串恰 `PTP_FILE_LIMIT:2225` 三断言全行使绿·cap 数字预算联动语义不变强度不减。
5. **偏离**：零（落点/门矩阵/STOP 形全沿 §1/§2/§8 定稿·三件九行逐字节落定·零越面零程序性偏差）。
6. **卫生**：est live=0（七门全本地静态/隔离 fixture·零外呼零 secrets 零模型调用）·actualSpendCny=null·零迁移零 DDL 零 env 闸·pins 不适用（本刀无 pins 面）。
7. **STOP 终态**：三处（Status 头/§8/卷尾注）同值 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行与 Status 终翻面权归协调方·本刀不宣称关闭·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

*CAP-SANCTION-2224 REQUEST · 2026-10-16 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-16 EXEC 落码·§9·前值 `draft:awaiting_pre_exec_dual` @draft `6a18415d` 史录）· base `feat/mysql-schema-skeleton` @`92086586`（requeue-backoff 夹具刀 tip·2216 sanction 波后）· 分支 `line/cap-sanction-2224` · 工作树 `meetwise-cap24` · 立项出处=协调方派单 brief（主线 docs:check 2212 实测·在飞 AG-16 +4/幽灵脚本 +2/AG-15 +5 三刀并线即 2223 超限 2216）· 修法=MAX_FILES 2_216→2_224+sanction 注记置顶两行+proof 越限臂六处 2224/2225 全行使（沿 e9f99940 形制·两 blob 4509bf68/d7026551 零漂移）· 门矩阵七门全绿=proof 12/12 EXIT=0+docs:check 2213≤2224 EXIT=0+typecheck 8/8 0cached+lint 12/12 五值恰等 601/1421/954/628/5235+markers hits=0+自审 grep 清零证+diff 恰 3 tracked · est live=0 · markers=0 · ⛔push ⛔merge 主线*
