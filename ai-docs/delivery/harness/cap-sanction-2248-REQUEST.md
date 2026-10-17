# CAP-SANCTION-2248 文档帽步进刀 REQUEST（mini·快速链·沿 a75736a0/e9f99940/51abfe78/89074c5d/b7dde404 五先例形）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 已行使·门矩阵七门全绿·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · 前值 `draft:awaiting_pre_exec_dual` @draft `42cf5f12` 史录保留于 §8/卷尾注 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（届时树亲算·7c602df0 届时值）

- **基线**：`origin/feat/mysql-schema-skeleton` @ `7c602df0`（reserve-renew-fix nail 波 tip·fetch 后 tip≥`7c602df0` 派单下界**等号成立**亲证——届 tip 实测恰 `7c602df0`·本 turn origin 远端 fetch 访问受限零新波如实登记·下界以本地 origin ref 恒等承登）。支线 `line/cap-sanction-2248`（worktree `meetwise-cap48`·基线即 7c602df0·upstream 未设防误推亲证）。
- **锚A** `scripts/ai-docs/public-text-policy.mjs` blob `f9fcbbf5`（=b7dde404 2240 落点 blob 恒等·届 tip 零漂移亲证·届值恰等派单 brief 锚）：
  - `:109-110` sanction 注记栈现值 latest=`cap 2232→2240`（2026-10-17·新条目置顶形·b7dde404 落点）；
  - `:112` `const MAX_FILES = 2_240;`（常量唯一定义点）；
  - `:324` `if (paths.length > MAX_FILES)` 早返回臂 → 错误串 `PTP_FILE_LIMIT:${paths.length}`（常量引用·字面量零现）；
  - `:381` `listed.paths.length > MAX_FILES` 臂同上（零字面量）。
- **锚B** `scripts/ai-docs/public-text-policy.proof.mjs` blob `0189d91b`（=b7dde404 2240 落点 blob 恒等·届 tip 零漂移亲证）·越限臂（E11 内 `:296-:313`）：
  - `:296-:298` N-19 随刀注记三行（b7dde404 落点）；
  - `:300` fabricated 环 `for (let i = 0; i < 2_240; i += 1)`；
  - `:307` `assert.equal(atCap.scannedFiles, 2_240)`（恰 cap 臂）；
  - `:308` 注记「第 2241 个注入路径触发早返回」；`:309` 注记「错误串恰为 `PTP_FILE_LIMIT:2241`」；
  - `:310` 越限注入路径 `'ai-docs/f-2240.md'`；
  - `:313` `assert.deepEqual(overCap.errors, [\`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2241\`])`（**3cd159dd 教训行·a75736a0 已亲跟 2209·e9f99940 已亲跟 2217·51abfe78 已亲跟 2225·89074c5d 已亲跟 2233·b7dde404 已亲跟 2241·本刀续跟 2249·自审 grep 全量清零为准**）。
- **计数锚**：本支线届树 `node scripts/ai-docs/check-docs.mjs` 基线亲跑 EXIT=0 `public text policy scanned 2240 managed worktree files`（=cap 2240 **恰等零余量**·派单 brief 前提亲证成立）。
- **联动面普查**：`grep -rln "2_240|FILE_LIMIT:2241|f-2240.md"`（mjs/cjs/ts/yml/yaml/json 全量）恰两文件命中=锚A+锚B·第三联动面零存在亲证。
- **计数谱系**：届树实测 **2240**=cap 恰等零余量（亲测）→ 派单 brief 在飞并线算术=**DB-HOTSPOT（+3：0206 迁移+read-tier proof+REQUEST）+TRACE-RECON（+4：0207+trace-recon.ts+proof+REQUEST·枚举函数已在 0207 内不另计）+#101 供应链（+1）+#185 打卡键（+1）=+9** → **2240+9=2249 超限**（brief 颁定算术·四刀投影不含本卷 REQUEST）→ 协调方 sanction **+8（2240→2248）先手**承登·本卷 REQUEST +1=2241（draft 树实测）≤2248 余 7·在飞四刀并线后余量面归 post 注视/下一帽刀如实重 pin（本刀不越派单颁定值自升·帽算术修正沿 2232 刀漏计勘误先例形走勘误承登）。

## §1-修法（两文件·沿 b7dde404/89074c5d 形制逐字节同构）

- **件①** 锚A `:112`：`const MAX_FILES = 2_240;` → `const MAX_FILES = 2_248;`（注记两行置顶后届时行 `:114`·两消费臂 `:324/:381`→`:326/:383` 常量引用零字节零触）。
- **件②** 锚A `:109` 前插 sanction 注记两行（沿 b7dde404/89074c5d/e9f99940/a75736a0 新条目置顶形·注记栈历史零洗）：
  - `// cap 2240→2248（2026-10-18 协调方 sanction·+8 沿 2208/2216/2224/2232/2240 五先例形·快速链·授权随令）：`
  - `// 2240 恰等零余量·在飞四刀并线 2249 超限（DB-HOTSPOT +3/TRACE-RECON +4/#101 供应链 +1/#185 打卡键 +1·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。`
- **件③** 锚B 越限臂六处数字联动+随刀注记（cap 数字行为断言 **2248/2249 全行使**·语义不变强度不减）：
  - 注记随卷（`:300` 前三行·沿 b7dde404 N-19 注记形）；
  - `:300` `i < 2_240` → `i < 2_248`（届时 `:303`）；
  - `:307` `scannedFiles, 2_240` → `scannedFiles, 2_248`（届时 `:310`）；
  - `:308` 「第 2241 个」→「第 2249 个」（届时 `:311`）；`:309` `PTP_FILE_LIMIT:2241` → `PTP_FILE_LIMIT:2249`（届时 `:312`）；
  - `:310` `'ai-docs/f-2240.md'` → `'ai-docs/f-2248.md'`（届时 `:313`）；
  - `:313` `deepEqual ... :2241` → `:2249`（届时 `:316`）。
- **语义申明**：cap 数字预算联动·零门语义变更·零产品码零迁移零 lockfile·越限臂 fabricated 数随 cap 联动同步·proof 强度不减·est live=0。

## §1.3 否决

1. **跳步 +16/+24 一步到位（含 2240→2256 直跳）**：违 +8 步进纪律（3cd159dd/a75736a0/e9f99940/51abfe78/89074c5d/b7dde404 谱系全 +8）·派单颁定值即 +8·本席无权上调（越值=红停上报非自升）·否决。
2. **上限无界化（删 cap/`MAX_FILES=Infinity`）**：恰 cap 臂+越限错误码形状断言两臂失语义·proof 强度减·否决。
3. **proof 越限臂不联动（留 2_240/2241）**：届时 atCap 臂 `valid=false` 必红·假红污染门矩阵·否决。
4. **注记栈旧值洗除/历史行重写（含对 `:109-110` 2240 行就地标改"补救"）**：历史 sanction 注记为计数谱系 SSOT·append 置顶不洗旧·否决。
5. **以"在飞四刀未并线"为由缓步（等触顶再 sanction）**：违派单先手令（2240 恰等零余量·任一刀并线即红停·先手 +8 即为此设）·否决。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 §9+commit message 记）

1. **policy.proof 全绿 12/12 届时值**：`node scripts/ai-docs/public-text-policy.proof.mjs` → `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·全量一次行使即全 proof 邻面·零 --case 单臂跳跑·2248/2249 双值全行使绿）EXIT=0。
2. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 `scanned ≤2248`（draft 树预期 2241=基线 2240+本卷 1·EXEC 树同值零新增文件·余 7）。
3. **typecheck**：`pnpm turbo typecheck --force` 8/8（0 cached）EXIT=0。
4. **lint**：`pnpm turbo lint --force` 12/12 五值恰等既有基线（0 新增 error）EXIT=0。
5. **markers 五类**：改动集（2 script+本卷）运行时组装词面扫描零命中（四词 join 形+冲突标记对·词面不入卷防自匹配·i6-239 口径）+全树行首冲突标记严格形零命中。
6. **自审 grep 清零证**：`grep -n "2_240\|2240\|2241\|2248\|2249"`（+下划线形 `2_248\|2_249` 补扫）两 script 全量逐处核——live 码/断言行旧值残留清零（深核 `deepEqual`/`assert.equal` 行·`deepEqual` 行届时 `:316` 亲跟 `:2249`）·历史注记行既有谱系值豁免登记（非残留）。
7. **diff 恰 3 tracked**：EXEC commit 面=锚A+锚B+本卷（§9 append+STOP 翻面）·零第四文件·零产品码零迁移零 lockfile·tsbuildinfo 副产物（`apps/web/tsconfig.tsbuildinfo` tracked）如翻动 checkout 回滚不入 commit。

**停止条件（命中即停手上报）**：proof 任一臂红·docs:check>2248·diff 超 3 tracked·自审 grep 出非豁免旧值命中。

## §8 STOP（开工条款 + 翻面形）

- **开工条款（sanction 直落形）**：①协调方派单 brief 即 sanction 授权（`2240→2248` 步进值+修法+门矩阵由 brief 颁定·在飞四刀并线算术=DB-HOTSPOT +3/TRACE-RECON +4/#101 供应链 +1/#185 打卡键 +1=2249 超·+8 先手）；②快速链诊断+起草+EXEC 一体席·沿五先例 sanction 刀单波直落先例·pre-exec 双审由 sanction 形制承载；③EXEC 不得越 §1-修法三件落点与 §1.3 否决面（越则红停回炉）。
- **STOP = `executed:awaiting_post_prove_dual` 三处同值**（Status 头+本节+卷尾注·前值 `draft:awaiting_pre_exec_dual` @draft `42cf5f12` 史录保留零字洗）·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·Dual PASS≠关闭·批表行/Status 终翻面权归协调方·本刀不宣称关闭。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

## §9 EXEC 记录（快速链一体席·2026-10-18·门矩阵七门 EXIT 原值）

1. **授权链**：协调方派单 brief（CAP-SANCTION-2248 文档帽步进刀·sanction 2240→2248 直落刀·在飞四刀并线算术·快速链诊断+起草+EXEC 一体席）→ draft commit `42cf5f12`（本卷 §0-§8+STOP 三处 draft 史录·58db74b1 初稿经 amend 修正见偏离⑤）→ EXEC 本席落码。
2. **码面落点**（恰 2 文件·沿 §1-修法逐处定稿·零越面）：锚A `scripts/ai-docs/public-text-policy.mjs`=:110-:111 置顶注记两行（cap 2240→2248·2240 恰等零余量·在飞四刀并线 2249 超限·注记栈 append 不洗旧）+:114 `MAX_FILES = 2_248`（:326/:383 消费臂常量引用零字节）·锚B `scripts/ai-docs/public-text-policy.proof.mjs`=:299-:301 随刀注记三行+:303 `< 2_248`+:310 `scannedFiles, 2_248`+:311 第 2249 个+:312 `PTP_FILE_LIMIT:2249`+:313 `f-2248.md`+:316 `deepEqual ...:2249`（六处六行全行使 2248/2249 双值）。
3. **门矩阵七门全绿**：①policy.proof 全量 `static_preflight_valid: selected=12/12`（TC-quality-04-main+E1..E11·零 --case 跳跑·2248/2249 双值全行使绿）EXIT=0；②docs:check EXIT=0 `scanned 2241 managed worktree files`≤2248 余 7（draft 树红停 2241>2240 承登→EXEC 随刀行使即复绿·N-19 b7dde404 同形·EXEC 树与 draft 树同值 2241 零新增文件）；③`pnpm turbo typecheck --force` 8 successful/8·0 cached EXIT=0（新支线树 `pnpm install --frozen-lockfile` 门前置·pnpm-lock 零字节）；④`pnpm turbo lint --force` 12 successful/12·0 cached EXIT=0·全 0 errors·root 5240 恰等既有基线（任务级 max-warnings 预算门 12/12 全过即各包 warnings≤预算·web/api/worker/ai-runtime 同基线）；⑤markers 五类改动集（2 script+本卷）运行时组装词面扫描 `changed files=3 hits=0` EXIT=0+全树行首冲突标记严格形零命中；⑥自审 grep 清零证=两 script 全量 `2_240|2240|2241|2248|2249`（+下划线形 `2_248|2_249` 补扫）共 14 命中逐处核·**live 码/断言行旧值残留零命中**（`deepEqual` 行 :316 已跟 `:2249`=3cd159dd 教训行承续·a75736a0 已跟 2209/e9f99940 已跟 2217/51abfe78 已跟 2225/89074c5d 已跟 2233/b7dde404 已跟 2241 本刀续跟）·余命中 11 处全注记/新值行（policy.mjs :110 本刀新注记 from 值+:111 谱系叙事+:112 谱系 SSOT+:114 `2_248` 新值·proof.mjs :296 N-19 谱系+:299-:300 本刀新注记+:303/:310/:311/:312/:313/:316 六处全新值 2248/2249）；⑦diff 面恰 3 tracked（锚A+锚B+本卷 .md §9 append+STOP 翻面）·pnpm-lock 零字节·tsbuildinfo 门副产零翻动。
4. **proof 臂账**：越限臂 fabricated 数 2_248 恰 cap 臂 `valid=true`+`scannedFiles=2_248`·第 2249 注入路径早返回 `valid=false`+`scannedFiles=0`+错误串恰 `PTP_FILE_LIMIT:2249` 三断言全行使绿·cap 数字预算联动语义不变强度不减。
5. **偏离**：①本卷 §2 门5 起草稿四词字面误入卷（词面自匹配面·markers 门预跑抓获 hits=4）→ draft commit amend 修正恢复「词面不入卷防自匹配」纪律（58db74b1→42cf5f121·文面一处·零码面影响·§9 落卷后终扫 hits=0 亲证）；②新支线树依赖安装门前置（2232 刀同形·非码面偏差）；③draft 树 2241>2240 红停为 sanction 随刀预期面非偏离（§0 已承登）；④origin 远端 fetch 本 turn 访问受限（下界以本地 origin ref=7c602df0 恒等承登·§0 已登记）；⑤其余零（落点/门矩阵/STOP 形全沿 §1/§2/§8 定稿·零越面）。
6. **卫生**：est live=0（七门全本地静态/隔离 fixture·零外呼零 secrets 零模型调用）·actualSpendCny=null·零迁移零 DDL 零 env 闸·pins 不适用（本刀无 pins 面）。
7. **STOP 终态**：三处（Status 头/§8/卷尾注）同值 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行与 Status 终翻面权归协调方·本刀不宣称关闭·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

*CAP-SANCTION-2248 REQUEST · 2026-10-18 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-18 EXEC 落码·§9·前值 `draft:awaiting_pre_exec_dual` @draft `42cf5f12` 史录）· base `feat/mysql-schema-skeleton` @`7c602df0`（reserve-renew-fix nail 波 tip·≥7c602df0 派单下界等号成立亲证）· 分支 `line/cap-sanction-2248` · 工作树 `meetwise-cap48` · 立项出处=协调方派单 brief（CAP-SANCTION-2248 文档帽步进刀·快速链席·2240→2248·+8 沿五先例形）· 修法=MAX_FILES 2_240→2_248+sanction 注记置顶两行（含「2240 恰等零余量·在飞四刀并线 2249 超限」）+proof 越限臂六处 2248/2249 全行使（deepEqual 行亲跟 2249）· 门矩阵七门全绿=proof 12/12 EXIT=0+docs:check 2241≤2248 EXIT=0+typecheck 8/8 0cached+lint 12/12 0cached 全 0 errors+markers hits=0+自审 grep 清零证+diff 恰 3 tracked · est live=0 · markers=0 · ⛔push ⛔merge 主线*
