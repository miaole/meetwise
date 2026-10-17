# CAP-SANCTION-2256 文档帽步进刀 REQUEST（mini·快速链·沿 a75736a0/e9f99940/51abfe78/89074c5d/b7dde404/5ec0cf6d0 六先例形）

**Status**: **`draft:awaiting_pre_exec_dual`**（sanction 直落形·快速链诊断+起草+EXEC 一体席·pre-exec 双审由 sanction 形制承载·越面红停 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（届时树亲算·57f5fab7 届时值）

- **基线**：`origin/feat/mysql-schema-skeleton` @ `57f5fab7`（trace 对账回补波 tip·fetch 后 tip≥`7b8bc1029` 派单下界**成立亲证**——届 tip 实测 `57f5fab7` 高于下界一波·下界等号升级为届 tip 恒等承登）。支线 `line/cap-sanction-2256`（worktree `meetwise-cap56`·基线即 57f5fab7·upstream 未设防误推亲证）。
- **锚A** `scripts/ai-docs/public-text-policy.mjs` blob `19aa5ef9`（=5ec0cf6d0 2248 落点 blob 恒等·届 tip 零漂移亲证·派单 brief 锚 `f9fcbbf5` 为 2240 届值已随 2248 刀漂移·以届值 `19aa5ef9` 承登）：
  - `:110-111` sanction 注记栈现值 latest=`cap 2240→2248`（2026-10-18·新条目置顶形·5ec0cf6d0 落点）；
  - `:114` `const MAX_FILES = 2_248;`（常量唯一定义点）；
  - `:326` `if (paths.length > MAX_FILES)` 早返回臂 → 错误串 `PTP_FILE_LIMIT:${paths.length}`（常量引用·字面量零现）；
  - `:383` `listed.paths.length > MAX_FILES` 臂同上（零字面量）。
- **锚B** `scripts/ai-docs/public-text-policy.proof.mjs` blob `346cbfb1`（=5ec0cf6d0 2248 落点 blob 恒等·届 tip 零漂移亲证）·越限臂（E11 内 `:296-:316`）：
  - `:296-:298` N-19 随刀注记三行（b7dde404 落点）；`:299-:301` CAP-SANCTION-2248 随刀注记三行（5ec0cf6d0 落点）；
  - `:303` fabricated 环 `for (let i = 0; i < 2_248; i += 1)`；
  - `:310` `assert.equal(atCap.scannedFiles, 2_248)`（恰 cap 臂）；
  - `:311` 注记「第 2249 个注入路径触发早返回」；`:312` 注记「错误串恰为 `PTP_FILE_LIMIT:2249`」；
  - `:313` 越限注入路径 `'ai-docs/f-2248.md'`；
  - `:316` `assert.deepEqual(overCap.errors, [\`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2249\`])`（**3cd159dd 教训行·a75736a0 已亲跟 2209·e9f99940 已亲跟 2217·51abfe78 已亲跟 2225·89074c5d 已亲跟 2233·b7dde404 已亲跟 2241·5ec0cf6d0 已亲跟 2249·本刀续跟 2257·自审 grep 全量清零为准**）。
- **计数锚**：本支线届树 `node scripts/ai-docs/check-docs.mjs` 基线亲跑 EXIT=0 `public text policy scanned 2248 managed worktree files`（=cap 2248 **恰等零余量**·派单 brief 前提亲证成立）。
- **联动面普查**：`grep -rlnE '2_248|FILE_LIMIT:2249|f-2248\.md'`（mjs/cjs/ts/yml/yaml/json 全量）恰两文件命中=锚A+锚B·第三联动面零存在亲证。
- **计数谱系**：届树实测 **2248**=cap 恰等零余量（亲测）→ 派单 brief 在飞五刀并线算术=**S30（+1 REQUEST）+#101 供应链（+1）+#185 打卡键（+1）+UNSTUBE（+1 REQUEST）+恒真回填（+1 REQUEST）=+5** → **2248+5=2253 超限**（brief 颁定算术·五刀投影不含本卷 REQUEST）→ 协调方 sanction **+8（2248→2256）先手**承登·本卷 REQUEST +1=2249（draft 树实测红停承登）≤2256 余 7·在飞五刀并线后余量面归 post 注视/下一帽刀如实重 pin（本刀不越派单颁定值自升·帽算术修正沿 2232 刀漏计勘误先例形走勘误承登）。

## §1-修法（两文件·沿 5ec0cf6d0/b7dde404 形制逐字节同构）

- **件①** 锚A `:114`：`const MAX_FILES = 2_248;` → `const MAX_FILES = 2_256;`（注记两行置顶后届时行 `:116`·两消费臂 `:326/:383`→`:328/:385` 常量引用零字节零触）。
- **件②** 锚A `:110` 前插 sanction 注记两行（沿 5ec0cf6d0/b7dde404/89074c5d/e9f99940/a75736a0 新条目置顶形·注记栈历史零洗）：
  - `// cap 2248→2256（2026-10-18 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248 六先例形·快速链·授权随令）：`
  - `// 2248 恰等零余量·在飞五刀并线 2253 超限（S30 +1 REQUEST/#101 供应链 +1/#185 打卡键 +1/UNSTUBE +1 REQUEST/恒真回填 +1 REQUEST·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。`
- **件③** 锚B 越限臂六处数字联动+随刀注记（cap 数字行为断言 **2256/2257 全行使**·语义不变强度不减）：
  - 注记随卷（`:299` 前三行·沿 5ec0cf6d0 CAP-SANCTION-2248 注记形·置顶不洗旧）；
  - `:303` `i < 2_248` → `i < 2_256`（届时 `:306`）；
  - `:310` `scannedFiles, 2_248` → `scannedFiles, 2_256`（届时 `:313`）；
  - `:311` 「第 2249 个」→「第 2257 个」（届时 `:314`）；`:312` `PTP_FILE_LIMIT:2249` → `PTP_FILE_LIMIT:2257`（届时 `:315`）；
  - `:313` `'ai-docs/f-2248.md'` → `'ai-docs/f-2256.md'`（届时 `:316`）；
  - `:316` `deepEqual ... :2249` → `:2257`（届时 `:319`）。
- **语义申明**：cap 数字预算联动·零门语义变更·零产品码零迁移零 lockfile·越限臂 fabricated 数随 cap 联动同步·proof 强度不减·est live=0。

## §1.3 否决

1. **跳步 +16/+24 一步到位（含 2248→2264 直跳）**：违 +8 步进纪律（3cd159dd/a75736a0/e9f99940/51abfe78/89074c5d/b7dde404/5ec0cf6d0 谱系全 +8）·派单颁定值即 +8·本席无权上调（越值=红停上报非自升）·否决。
2. **上限无界化（删 cap/`MAX_FILES=Infinity`）**：恰 cap 臂+越限错误码形状断言两臂失语义·proof 强度减·否决。
3. **proof 越限臂不联动（留 2_248/2249）**：届时 atCap 臂 `valid=false` 必红·假红污染门矩阵·否决。
4. **注记栈旧值洗除/历史行重写（含对 `:110-111` 2248 行就地标改"补救"）**：历史 sanction 注记为计数谱系 SSOT·append 置顶不洗旧·否决。
5. **以"在飞五刀未并线"为由缓步（等触顶再 sanction）**：违派单先手令（2248 恰等零余量·任一刀并线即红停·先手 +8 即为此设）·否决。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 §9+commit message 记）

1. **policy.proof 全绿 12/12 届时值**：`node scripts/ai-docs/public-text-policy.proof.mjs` → `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·全量一次行使即全 proof 邻面·零 --case 单臂跳跑·2256/2257 双值全行使绿）EXIT=0。
2. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 `scanned ≤2256`（EXEC 树预期 2249=届树 2248+本卷 1·draft 树同值 2249>2248 红停承登随刀复绿·余 7）。
3. **typecheck**：`pnpm turbo typecheck --force` 8/8（0 cached）EXIT=0。
4. **lint**：`pnpm turbo lint --force` 12/12 五值恰等既有基线（0 新增 error）EXIT=0。
5. **markers 五类**：改动集（2 script+本卷）运行时组装词面扫描零命中（四词 join 形+冲突标记对·词面不入卷防自匹配·i6-239 口径）+全树行首冲突标记严格形零命中。
6. **自审 grep 清零证**：`grep -n "2_248\|2248\|2249\|2256\|2257"`（+下划线形 `2_256\|2_257` 补扫）两 script 全量逐处核——live 码/断言行旧值残留清零（深核 `deepEqual`/`assert.equal` 行·`deepEqual` 行届时 `:319` 亲跟 `:2257`）·历史注记行既有谱系值豁免登记（非残留）。
7. **diff 恰 3 tracked**：EXEC commit 面=锚A+锚B+本卷（§9 append+STOP 翻面）·零第四文件·零产品码零迁移零 lockfile·tsbuildinfo 副产物（`apps/web/tsconfig.tsbuildinfo` tracked）如翻动 checkout 回滚不入 commit。

**停止条件（命中即停手上报）**：proof 任一臂红·docs:check>2256·diff 超 3 tracked·自审 grep 出非豁免旧值命中。

## §8 STOP（开工条款 + 翻面形）

- **开工条款（sanction 直落形）**：①协调方派单 brief 即 sanction 授权（`2248→2256` 步进值+修法+门矩阵由 brief 颁定·在飞五刀并线算术=S30 +1/#101 +1/#185 +1/UNSTUBE +1/恒真回填 +1=2253 超·+8 先手）；②快速链诊断+起草+EXEC 一体席·沿六先例 sanction 刀单波直落先例·pre-exec 双审由 sanction 形制承载；③EXEC 不得越 §1-修法三件落点与 §1.3 否决面（越则红停回炉）。
- **STOP = `draft:awaiting_pre_exec_dual` 三处同值**（Status 头+本节+卷尾注）·sanction 直落形 pre-exec 双审由形制承载·EXEC 随刀行使后翻面 `executed:awaiting_post_prove_dual`·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行/Status 终翻面权归协调方·本刀不宣称关闭。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

*CAP-SANCTION-2256 REQUEST · 2026-10-18 起草 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`57f5fab7`（trace 对账回补波 tip·≥7b8bc1029 派单下界成立亲证）· 分支 `line/cap-sanction-2256` · 工作树 `meetwise-cap56` · 立项出处=协调方派单 brief（CAP-SANCTION-2256 文档帽步进刀·快速链席·2248→2256·+8 沿六先例形）· 修法=MAX_FILES 2_248→2_256+sanction 注记置顶两行（含「2248 恰等零余量·在飞五刀并线 2253 超限」）+proof 越限臂六处 2256/2257 全行使（deepEqual 行亲跟 2257）· est live=0 · ⛔push ⛔merge 主线*
