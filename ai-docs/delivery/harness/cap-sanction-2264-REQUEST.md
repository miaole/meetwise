# CAP-SANCTION-2264 文档帽步进刀 REQUEST（mini·快速链·沿 a75736a0/e9f99940/51abfe78/89074c5d/b7dde404/5ec0cf6d0/e5ea355ca 七先例形）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 已行使·门矩阵七门全绿·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · 前值 `draft:awaiting_pre_exec_dual` @draft `523306c3a` 史录保留于 §8/卷尾注 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（届时树亲算·966cef38 届时值）

- **基线**：`origin/feat/mysql-schema-skeleton` @ `966cef38`（打卡键校验刀并线 tip·fetch 后 tip≥`966cef38a` 派单下界**成立亲证**——届 tip 实测恒等 `966cef38a`·下界等号承登）。支线 `line/cap-sanction-2264`（worktree `meetwise-cap64`·基线即 966cef38a·upstream 未设防误推亲证）。
- **锚A** `scripts/ai-docs/public-text-policy.mjs` blob `bbab53ff`（=e5ea355ca 2256 落点 blob 恒等·届 tip 零漂移亲证）：
  - `:110-111` sanction 注记栈现值 latest=`cap 2248→2256`（2026-10-18·新条目置顶形·e5ea355ca 落点）；
  - `:116` `const MAX_FILES = 2_256;`（常量唯一定义点）；
  - `:328` `if (paths.length > MAX_FILES)` 早返回臂 → 错误串 `PTP_FILE_LIMIT:${paths.length}`（常量引用·字面量零现）；
  - `:385` `listed.paths.length > MAX_FILES` 臂同上（零字面量）。
- **锚B** `scripts/ai-docs/public-text-policy.proof.mjs` blob `125a9f6b`（=e5ea355ca 2256 落点 blob 恒等·届 tip 零漂移亲证）·越限臂（E11 内 `:299-:319`）：
  - `:299-:301` CAP-SANCTION-2256 随刀注记三行（e5ea355ca 落点）；`:302-:304` CAP-SANCTION-2248 随刀注记三行（5ec0cf6d0 落点）；
  - `:306` fabricated 环 `for (let i = 0; i < 2_256; i += 1)`；
  - `:313` `assert.equal(atCap.scannedFiles, 2_256)`（恰 cap 臂）；
  - `:314` 注记「第 2257 个注入路径触发早返回」；`:315` 注记「错误串恰为 `PTP_FILE_LIMIT:2257`」；
  - `:316` 越限注入路径 `'ai-docs/f-2256.md'`；
  - `:319` `assert.deepEqual(overCap.errors, [\`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2257\`])`（**3cd159dd 教训行·a75736a0 已亲跟 2209·e9f99940 已亲跟 2217·51abfe78 已亲跟 2225·89074c5d 已亲跟 2233·b7dde404 已亲跟 2241·5ec0cf6d0 已亲跟 2249·e5ea355ca 已亲跟 2257·本刀续跟 2265·自审 grep 全量清零为准**）。
- **计数锚**：本支线届树 `node scripts/ai-docs/check-docs.mjs` 基线亲跑 EXIT=0 `public text policy scanned 2256 managed worktree files`（=cap 2256 **恰等零余量**·派单 brief 前提亲证成立）。
- **联动面普查**：`grep -rlnE '2_256|2256'`（mjs/ts/js/json/md 全量）码面恰两文件命中=锚A+锚B·第三联动面零存在亲证（余命中全史录/谱系注记面豁免）。
- **计数谱系**：届树实测 **2256**=cap 恰等零余量（亲测）→ 派单 brief 在飞刀并线算术=**deploy:check 修复刀（+1 REQUEST）=+1** → **2256+1=2257 超限**（brief 颁定算术·在飞刀投影不含本卷 REQUEST）→ 协调方 sanction **+8（2256→2264）先手**承登·本卷 REQUEST +1=2257（draft 树实测红停承登）≤2264 余 7·在飞刀并线后余量面归 post 注视/下一帽刀如实重 pin（本刀不越派单颁定值自升·帽算术修正沿 2232 刀漏计勘误先例形走勘误承登）。

## §1-修法（两文件·沿 e5ea355ca/5ec0cf6d0 形制逐字节同构）

- **件①** 锚A `:116`：`const MAX_FILES = 2_256;` → `const MAX_FILES = 2_264;`（注记两行置顶后届时行 `:118`·两消费臂 `:328/:385`→`:330/:387` 常量引用零字节零触）。
- **件②** 锚A `:110` 前插 sanction 注记两行（沿 e5ea355ca/5ec0cf6d0/b7dde404/89074c5d/e9f99940/a75736a0 新条目置顶形·注记栈历史零洗）：
  - `// cap 2256→2264（2026-10-18 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256 七先例形·快速链·授权随令）：`
  - `// 2256 恰等零余量·在飞 deploy:check 修复刀并线必越（deploy:check 修复 +1 REQUEST·2256+1=2257 超·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。`
- **件③** 锚B 越限臂六处数字联动+随刀注记（cap 数字行为断言 **2264/2265 全行使**·语义不变强度不减）：
  - 注记随卷（`:299` 前三行·沿 e5ea355ca CAP-SANCTION-2256 注记形·置顶不洗旧）；
  - `:306` `i < 2_256` → `i < 2_264`（届时 `:309`）；
  - `:313` `scannedFiles, 2_256` → `scannedFiles, 2_264`（届时 `:316`）；
  - `:314` 「第 2257 个」→「第 2265 个」（届时 `:317`）；`:315` `PTP_FILE_LIMIT:2257` → `PTP_FILE_LIMIT:2265`（届时 `:318`）；
  - `:316` `'ai-docs/f-2256.md'` → `'ai-docs/f-2264.md'`（届时 `:319`）；
  - `:319` `deepEqual ... :2257` → `:2265`（届时 `:322`）。
- **语义申明**：cap 数字预算联动·零门语义变更·零产品码零迁移零 lockfile·越限臂 fabricated 数随 cap 联动同步·proof 强度不减·est live=0。

## §1.3 否决

1. **跳步 +16/+24 一步到位（含 2256→2280 直跳）**：违 +8 步进纪律（3cd159dd/a75736a0/e9f99940/51abfe78/89074c5d/b7dde404/5ec0cf6d0/e5ea355ca 谱系全 +8）·派单颁定值即 +8·本席无权上调（越值=红停上报非自升）·否决。
2. **上限无界化（删 cap/`MAX_FILES=Infinity`）**：恰 cap 臂+越限错误码形状断言两臂失语义·proof 强度减·否决。
3. **proof 越限臂不联动（留 2_256/2257）**：届时 atCap 臂 `valid=false` 必红·假红污染门矩阵·否决。
4. **注记栈旧值洗除/历史行重写（含对 `:110-111` 2256 行就地标改"补救"）**：历史 sanction 注记为计数谱系 SSOT·append 置顶不洗旧·否决。
5. **以"在飞 deploy:check 修复刀未并线"为由缓步（等触顶再 sanction）**：违派单先手令（2256 恰等零余量·任一刀并线即红停·先手 +8 即为此设）·否决。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 §9+commit message 记）

1. **policy.proof 全绿 12/12 届时值**：`node scripts/ai-docs/public-text-policy.proof.mjs` → `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·全量一次行使即全 proof 邻面·零 --case 单臂跳跑·2264/2265 双值全行使绿）EXIT=0。
2. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 `scanned ≤2264`（EXEC 树预期 2257=届树 2256+本卷 1·draft 树同值 2257>2256 红停承登随刀复绿·余 7）。
3. **typecheck**：`pnpm turbo typecheck --force` 8/8（0 cached）EXIT=0。
4. **lint**：`pnpm turbo lint --force` 12/12 五值恰等既有基线（0 新增 error）EXIT=0。
5. **markers 五类**：改动集（2 script+本卷）运行时组装词面扫描零命中（四词 join 形+冲突标记对·词面不入卷防自匹配·i6-239 口径）+全树行首冲突标记严格形零命中。
6. **自审 grep 清零证**：`grep -n "2_256\|2256\|2257\|2264\|2265"`（+下划线形 `2_264\|2_265` 补扫）两 script 全量逐处核——live 码/断言行旧值残留清零（深核 `deepEqual`/`assert.equal` 行·`deepEqual` 行届时 `:322` 亲跟 `:2265`）·历史注记行既有谱系值豁免登记（非残留）。
7. **diff 恰 3 tracked**：EXEC commit 面=锚A+锚B+本卷（§9 append+STOP 翻面）·零第四文件·零产品码零迁移零 lockfile·tsbuildinfo 副产物（`apps/web/tsconfig.tsbuildinfo` tracked）如翻动 checkout 回滚不入 commit。

**停止条件（命中即停手上报）**：proof 任一臂红·docs:check>2264·diff 超 3 tracked·自审 grep 出非豁免旧值命中。

## §8 STOP（开工条款 + 翻面形）

- **开工条款（sanction 直落形）**：①协调方派单 brief 即 sanction 授权（`2256→2264` 步进值+修法+门矩阵由 brief 颁定·在飞 deploy:check 修复刀并线算术=+1 REQUEST·2257 超·+8 先手）；②快速链诊断+起草+EXEC 一体席·沿七先例 sanction 刀单波直落先例·pre-exec 双审由 sanction 形制承载；③EXEC 不得越 §1-修法三件落点与 §1.3 否决面（越则红停回炉）。
- **STOP = `executed:awaiting_post_prove_dual` 三处同值**（Status 头+本节+卷尾注·前值 `draft:awaiting_pre_exec_dual` @draft `523306c3a` 史录保留零字洗）·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·Dual PASS≠关闭·批表行/Status 终翻面权归协调方·本刀不宣称关闭。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

## §9 EXEC 记录（快速链一体席·2026-10-18·门矩阵七门 EXIT 原值）

1. **授权链**：协调方派单 brief（CAP-SANCTION-2264 文档帽步进刀·sanction 2256→2264 直落刀·在飞 deploy:check 修复刀并线算术·快速链席·2256→2264·+8 沿七先例形）→ draft commit `523306c3a`（本卷 §0-§8+STOP 三处 draft 史录）→ EXEC 本席落码。
2. **码面落点**（恰 2 文件·沿 §1-修法逐处定稿·零越面）：锚A `scripts/ai-docs/public-text-policy.mjs`=:110-:111 置顶注记两行（cap 2256→2264·2256 恰等零余量·在飞 deploy:check 修复刀并线必越·注记栈 append 不洗旧）+:118 `MAX_FILES = 2_264`（:330/:387 消费臂常量引用零字节）·锚B `scripts/ai-docs/public-text-policy.proof.mjs`=:299-:301 随刀注记三行+:309 `< 2_264`+:316 `scannedFiles, 2_264`+:317 第 2265 个+:318 `PTP_FILE_LIMIT:2265`+:319 `f-2264.md`+:322 `deepEqual ...:2265`（六处六行全行使 2264/2265 双值·届时行号与 §1 预标定逐处恰等亲证）。
3. **门矩阵七门全绿**：①policy.proof 全量 `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·零 --case 跳跑·2264/2265 双值全行使绿）EXIT=0；②docs:check EXIT=0 `scanned 2257 managed worktree files`≤2264 余 7（draft 树红停 2257>2256 承登→EXEC 随刀行使即复绿·N-19 b7dde404 同形·EXEC 树与 draft 树同值 2257 零新增文件）；③`pnpm turbo typecheck --force` 8 successful/8·0 cached EXIT=0（新支线树 `pnpm install --frozen-lockfile` 门前置 EXIT=0·pnpm-lock 零字节）；④`pnpm turbo lint --force` 12 successful/12·0 cached EXIT=0·全 0 errors（任务级 max-warnings 预算门 12/12 全过即各包 warnings≤预算·改动集仅两 script 注记/数字联动行零新增 warning 面）；⑤markers 五类改动集（2 script+本卷）diff 引入行运行时组装词面扫描 `+行五类词面 EXIT=1 零命中`+冲突标记对改动集 hits=0+全树行首冲突标记严格形 `git grep EXIT=1 零命中`（既有四词面命中全 policy 管辖配置/拆写形原文=非本刀引入面既有基线豁免·词面不入卷防自匹配 i6-239 口径）；⑥自审 grep 清零证=两 script 全量 `2_256|2256|2257|2264|2265`（+下划线形 `2_264|2_265` 补扫）共 10 命中逐处核·**live 码/断言行旧值残留零命中**（`deepEqual` 行 :322 已跟 `:2265`=3cd159dd 教训行承续·a75736a0 已跟 2209/e9f99940 已跟 2217/51abfe78 已跟 2225/89074c5d 已跟 2233/b7dde404 已跟 2241/5ec0cf6d0 已跟 2249/e5ea355ca 已跟 2257 本刀续跟）·余命中 10 处全注记/新值行（policy.mjs :110 本刀新注记 from 值+:111 谱系叙事+:112 谱系 SSOT·proof.mjs :299-:300 本刀新注记+:302 谱系 SSOT+:317/:318/:319/:322 四处新值 2264/2265+下划线形 :118/:309/:316 三处新值 `2_264`）；⑦diff 面恰 3 tracked（锚A+锚B+本卷 .md §9 append+STOP 翻面）·pnpm-lock 零字节·tsbuildinfo 门副产零翻动（typecheck/lint 后 `git status` 核验无额外翻动）。
4. **proof 臂账**：越限臂 fabricated 数 2_264 恰 cap 臂 `valid=true`+`scannedFiles=2_264`·第 2265 注入路径早返回 `valid=false`+`scannedFiles=0`+错误串恰 `PTP_FILE_LIMIT:2265` 三断言全行使绿·cap 数字预算联动语义不变强度不减。
5. **偏离**：①基线重 pin=届 origin tip 实测 `966cef38a` 恒等派单下界（打卡键校验刀并线 tip·下界等号承登·§0 已登记）；②新支线树依赖安装门前置（2232/2248/2256 刀同形·非码面偏差）；③draft 树 2257>2256 红停为 sanction 随刀预期面非偏离（§0 已承登）；④其余零（落点/门矩阵/STOP 形全沿 §1/§2/§8 定稿·零越面零 amend）。
6. **卫生**：est live=0（七门全本地静态/隔离 fixture·零外呼零 secrets 零模型调用）·actualSpendCny=null·零迁移零 DDL 零 env 闸·pins 不适用（本刀无 pins 面）。
7. **STOP 终态**：三处（Status 头/§8/卷尾注）同值 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行与 Status 终翻面权归协调方·本刀不宣称关闭·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

*CAP-SANCTION-2264 REQUEST · 2026-10-18 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-18 EXEC 落码·§9·前值 `draft:awaiting_pre_exec_dual` @draft `523306c3a` 史录）· base `feat/mysql-schema-skeleton` @`966cef38a`（打卡键校验刀并线 tip·≥966cef38a 派单下界成立亲证恒等）· 分支 `line/cap-sanction-2264` · 工作树 `meetwise-cap64` · 立项出处=协调方派单 brief（CAP-SANCTION-2264 文档帽步进刀·快速链席·2256→2264·+8 沿七先例形）· 修法=MAX_FILES 2_256→2_264+sanction 注记置顶两行（含「2256 恰等零余量·在飞 deploy:check 修复刀并线必越」）+proof 越限臂六处 2264/2265 全行使（deepEqual 行亲跟 2265·谱系承续）· 门矩阵七门全绿=proof 12/12 EXIT=0+docs:check 2257≤2264 EXIT=0+typecheck 8/8 0cached+lint 12/12 0cached 全 0 errors+markers hits=0+自审 grep 清零证+diff 恰 3 tracked · est live=0 · markers=0 · ⛔push ⛔merge 主线*
