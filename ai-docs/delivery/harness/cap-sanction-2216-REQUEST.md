# CAP-SANCTION-2216 文档帽步进刀 REQUEST（mini·快速链·沿 3cd159dd/a75736a0 两先例形）

**Status**: **`draft:awaiting_pre_exec_dual`**（draft 起草落卷·EXEC 待本席续行使·sanction 直落形 pre-exec 双审由 sanction 形制承载·est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（届时树亲算·10799a3e 届时值）

- **基线**：`origin/feat/mysql-schema-skeleton` @ `10799a3e`（worker-hang-guard nail 波 tip·fetch 后 tip≥10799a3e 等号成立亲证·`git merge-base --is-ancestor a75736a0 10799a3e` YES=上一 sanction 2208 EXEC 落点在谱系内+`3cd159dd` YES 双亲证）。支线 `line/cap-sanction-2216`（worktree `meetwise-cap16`·基线即 10799a3e·upstream 已解除防误推）。
- **锚A** `scripts/ai-docs/public-text-policy.mjs` blob `7bace81c`（=a75736a0 2208 EXEC 落点 blob 恒等·此后零漂移亲证）：
  - `:87-88` sanction 注记栈现值 latest=`cap 2200→2208`（2026-10-16·新条目置顶形·a75736a0 落点）；
  - `:104` `const MAX_FILES = 2_208;`（常量唯一定义点）；
  - `:316` `if (paths.length > MAX_FILES)` 早返回臂 → 错误串 `PTP_FILE_LIMIT:${paths.length}`（常量引用·字面量零现）；
  - `:373` `listed.paths.length > MAX_FILES` 臂同上（零字面量）。
- **锚B** `scripts/ai-docs/public-text-policy.proof.mjs` blob `d50ea438`（=a75736a0 2208 EXEC 落点 blob 恒等·此后零漂移亲证）·越限臂（E11 内 `:296-:311`）：
  - `:297` fabricated 环 `for (let i = 0; i < 2_208; i += 1)`；
  - `:304` `assert.equal(atCap.scannedFiles, 2_208)`（恰 cap 臂）；
  - `:305` 注记「第 2209 个注入路径触发早返回」；`:306` 注记「错误串恰为 `PTP_FILE_LIMIT:2209`」；
  - `:307` 越限注入路径 `'ai-docs/f-2208.md'`；
  - `:310` `assert.deepEqual(overCap.errors, [\`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2209\`])`（**3cd159dd 教训行·a75736a0 已亲跟 2209·本刀自审 grep 全量清零为准**）。
- **计数锚**：本支线届树 `node scripts/ai-docs/check-docs.mjs` 基线亲跑 EXIT=0 `public text policy scanned 2203 managed worktree files`（=worker-hang-guard nail 10799a3e 卷序3 记录 2203 恒等·派单背景口径 2203 恰等·实测值权威）。
- **联动面普查**：`grep -rln "2_208|FILE_LIMIT:2209|f-2208.md"`（mjs/cjs/ts/yml/yaml/json 全量）恰两文件命中=锚A+锚B·第三联动面零存在亲证。
- **计数谱系**：a0f3bd46 2185 → 3cd159dd sanction 2200（+8）→ 中间波次并入递推 → f7caa206 2194 → a75736a0 sanction 2208（REQUEST 落卷 2195·主线各刀并入递推）→ 10799a3e 2203 余 5 → 本刀 REQUEST 落卷 +1=2204 → 在飞 QUEUE/AG-43/G7W/TSW/BV/WSS/AG-16 七 REQUEST+AG-16 proof 族（2 proof+1 收据）十件并线 +10=2214（派单口径 2203+10=2213 同超）→ **>2208 必越限** → 协调方 sanction +8 步进 2208→2216 先手落主线。

## §1-修法（两文件·沿 a75736a0 形制逐字节同构）

- **件①** 锚A `:104`：`const MAX_FILES = 2_208;` → `const MAX_FILES = 2_216;`（注记两行置顶后届时行 `:106`·两消费臂 `:316/:373`→`:318/:375` 常量引用零字节零触）。
- **件②** 锚A `:87` 前插 sanction 注记两行（沿 a75736a0/3cd159dd 新条目置顶形·注记栈历史零洗）：
  - `// cap 2208→2216（2026-10-16 协调方 sanction·+8 沿 +8 先例形：主线 10799a3e 2203·`
  - `// 在飞 QUEUE/AG-43/G7W/TSW/BV/WSS/AG-16 七 REQUEST+AG-16 proof 族三件并线即 2213 超限）。`
- **件③** 锚B 越限臂六处数字联动（cap 数字行为断言 **2216/2217 全行使**·语义不变强度不减）：
  - `:297` `i < 2_208` → `i < 2_216`；
  - `:304` `scannedFiles, 2_208` → `scannedFiles, 2_216`；
  - `:305` 「第 2209 个」→「第 2217 个」；`:306` `PTP_FILE_LIMIT:2209` → `PTP_FILE_LIMIT:2217`；
  - `:307` `'ai-docs/f-2208.md'` → `'ai-docs/f-2216.md'`；
  - `:310` `deepEqual ... :2209` → `:2217`。
- **语义申明**：cap 数字预算联动·零门语义变更·零产品码零迁移零 lockfile·越限臂 fabricated 数随 cap 联动同步·proof 强度不减·est live=0。

## §1.3 否决

1. **跳步 +16/+24 一步到位**：违 +8 步进纪律（f2e8de7b/0ff55592/1824b2d9/fb97734c/317ea3df/591d07cf/3cd159dd/a75736a0 谱系全 +8）·否决。
2. **上限无界化（删 cap/`MAX_FILES=Infinity`）**：恰 cap 臂+越限错误码形状断言两臂失语义·proof 强度减·否决。
3. **proof 越限臂不联动（留 2_208/2209）**：届时 atCap 臂 `valid=false` 必红·假红污染门矩阵·否决。
4. **注记栈旧值洗除/历史行重写**：历史 sanction 注记为计数谱系 SSOT·append 置顶不洗旧（a75736a0 同形）·否决。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 §9+commit message 记）

1. **policy.proof 全绿 12/12 届时值**：`node scripts/ai-docs/public-text-policy.proof.mjs` → `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·全量一次行使即全 proof 邻面·零 --case 单臂跳跑）EXIT=0。
2. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 `scanned ≤2216`（draft 树预期 2204=基线 2203+本卷 1·EXEC 树同值零新增文件·余量 12）。
3. **typecheck**：`pnpm turbo typecheck --force` 8/8（0 cached）EXIT=0。
4. **lint**：`pnpm turbo lint --force` 12/12 五值恰等既有基线（0 新增 error）EXIT=0。
5. **markers 五类**：改动集（2 script+本卷）运行时组装词面 grep 零命中（`['T','O','D','O'].join('')`/`['F','I','X','M','E'].join('')`/`['X','X','X'].join('')`/`['H','A','C','K'].join('')`+冲突标记对·词面不入卷防自匹配·i6-239 口径）。
6. **自审 grep 清零证**：`grep -n "2_208\|2208\|2209\|2216\|2217"` 两 script 全量逐处核——live 码/断言行旧值残留清零（深核 `deepEqual`/`assert.equal` 行·`deepEqual` 行 `:310` 亲跟 `:2217`）·历史注记行既有谱系值豁免登记（非残留）。
7. **diff 恰 3 tracked**：EXEC commit 面=锚A+锚B+本卷（§9 append）·零第四文件·零产品码零迁移零 lockfile·tsbuildinfo 副产物如翻动 checkout 回滚不入 commit。

**停止条件（命中即停手上报）**：proof 任一臂红·docs:check>2216·diff 超 3 tracked·自审 grep 出非豁免旧值命中。

## §8 STOP（开工条款 + 翻面形）

- **开工条款（sanction 直落形）**：①协调方派单 brief 即 sanction 授权（`2208→2216` 步进值+修法+门矩阵由 brief 颁定）；②快速链诊断+起草+EXEC 一体席·沿 3cd159dd/a75736a0 sanction 刀单波直落先例·pre-exec 双审由 sanction 形制承载；③EXEC 不得越 §1-修法三件九行落点与 §1.3 否决面（越则红停回炉）。
- **STOP = `draft:awaiting_pre_exec_dual` 三处同值**（Status 头+本节+卷尾注·draft commit 时点史录保留零字洗）→ **EXEC commit 翻 `executed:awaiting_post_prove_dual` 三处同值**（Status 头+本节+卷尾注·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·Dual PASS≠关闭·批表行/Status 终翻面权归协调方·本刀不宣称关闭）。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

*CAP-SANCTION-2216 REQUEST · 2026-10-16 起草 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`10799a3e`（worker-hang-guard nail 波 tip·sanction 2208 波后）· 分支 `line/cap-sanction-2216` · 工作树 `meetwise-cap16` · 立项出处=协调方派单 brief（主线 docs:check 2203 实测·在飞 QUEUE/AG-43/G7W/TSW/BV/WSS/AG-16 七 REQUEST+AG-16 proof 族三件并线即 2213 超限 2208）· 修法=MAX_FILES 2_208→2_216+sanction 注记置顶两行+proof 越限臂六处 2216/2217 全行使（沿 a75736a0 形制·两 blob 7bace81c/d50ea438 零漂移）· est live=0 · ⛔push ⛔merge 主线*
