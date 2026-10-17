# LINT-CAP-STEP lint 帽步进刀 REQUEST（mini·快速链·沿 cap-sanction-2232 sanction 直落先例形·lint 门协议 P1-b 届 tip 重测步进·AG-15/SSE 期已立）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 已行使·门矩阵五门全绿·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·前值 `draft:awaiting_pre_exec_dual` @draft `7ed020077` 史录保留于 §8/卷尾注 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（届时树亲算·ce4bfd1d0 届时值）

- **基线**：`origin/feat/mysql-schema-skeleton` @ `ce4bfd1d0`（dbhy1-reg-fix nail 波 tip·fetch 后 tip≥ce4bfd1d0 等号成立亲证=`git merge-base --is-ancestor ce4bfd1d0 HEAD` EXIT=0）。支线 `line/lint-cap-step`（worktree `meetwise-lcap`·基线即 ce4bfd1d0·upstream 未设防误推·⛔push）。
- **锚A** `package.json`（root）blob `002b6f2a`：`:8` `"lint": "eslint . --max-warnings 5235",`。
- **锚B** `apps/worker/package.json` blob `ba0c157c`：`:7` `"lint": "eslint . --max-warnings 954",`。
- **十二任务现帽全表（届时树亲读）**：root **5235** / web **601** / api **1421** / worker **954** / ai-runtime **628** / db **1042** / contracts **265** / domain **115** / qdrant-store **27** / ai-graphs **47** / config **0** / db-mysql **0**（=turbo lint 12 任务·config/db-mysql 帽 0=零容忍面）。
- **届实测（本席亲测·净树口径）**：12 任务逐包 raw `eslint .` 亲跑=**恰等现帽贴线·余 0 全表**：root 5235/contracts 265/qdrant 27/ai-runtime 628/db 1042/domain 115/ai-graphs 47/web 601/api 1421/worker 954/config 0/db-mysql 0·**全 0 errors**·`pnpm turbo lint --force` 12 successful/12·0 cached EXIT=0（新支线树 `pnpm install --frozen-lockfile` 门前置·pnpm-lock 零字节）。
- **双口径如实登记（不洗史）**：派单 brief stash 口径亲测 worker 956/954·root 5237/5235（三刀 +2/+2 未吸收预判）vs 本席净树亲测恰等 954/954·5235/5235——差 +2/+2 与 stash 在飞态最契合（RESERVE 部分在飞态；三刀净增在净树口径未复现）·两口径并存·帽值取派单颁定宽值安全侧（959/5240·覆盖一切实测/预判态）。
- **三刀归因注记（届基线在先）**：①AG-15 观测 proof=`439381cc`（worker adaptive-lifecycle+graph-run-observability.proof +136 行/ai-runtime metrics/db 0205 迁移）②SSE 看门狗=`30276543e`（sse-notify.service LISTEN 活性探针+客户端空闲看门狗+两 proof+web 三面）③恒真治理=`1b0136676`（e2e 恒真升格 3+弱断言收紧 4+声明钉 12·root 域 e2e/）——三刀 nail 波届基线在先，净树口径实测 lint 增量=0（954/5235 恰等维持）。
- **RESERVE 在飞预登记**：本刀 RESERVE 净增 +3（worker→959·root→5240·派单口径）尚未并线——本帽步进先手承登（沿 cap-sanction-2232 在飞三刀 +11 预登记先例形）。
- **docs:check 锚**：届树亲跑 EXIT=0 `scanned 2234 managed worktree files` ≤ cap **2240**（`public-text-policy.mjs:112` `MAX_FILES = 2_240`·b7dde4049 步进后值）。本卷 REQUEST +1 → draft 树 **2235** 余 5（package.json 改零增受管文件·EXEC 树同值）。

## §1-修法（两文件两行·逐包步进对照表）

| # | 任务 | 落点 | 旧帽 | 届实测(净树) | 新帽 | Δ | 处置 |
|---|------|------|------|------|------|---|------|
| 1 | root | `package.json:8` | 5235 | 5235 | **5240** | +5 | 改 |
| 2 | worker | `apps/worker/package.json:7` | 954 | 954 | **959** | +5 | 改 |
| 3 | web | `apps/web/package.json:7` | 601 | 601 | 601 | 0 | 零改贴线 |
| 4 | api | `apps/api/package.json:7` | 1421 | 1421 | 1421 | 0 | 零改贴线 |
| 5 | ai-runtime | `packages/ai-runtime/package.json:14` | 628 | 628 | 628 | 0 | 零改贴线 |
| 6 | db | `packages/db/package.json:11` | 1042 | 1042 | 1042 | 0 | 零改贴线 |
| 7 | contracts | `packages/contracts/package.json:12` | 265 | 265 | 265 | 0 | 零改贴线 |
| 8 | domain | `packages/domain/package.json:10` | 115 | 115 | 115 | 0 | 零改贴线 |
| 9 | qdrant-store | `packages/qdrant-store/package.json:11` | 27 | 27 | 27 | 0 | 零改贴线 |
| 10 | ai-graphs | `packages/ai-graphs/package.json:10` | 47 | 47 | 47 | 0 | 零改贴线 |
| 11 | config | `packages/config/package.json:8` | 0 | 0 | 0 | 0 | 零改零容忍 |
| 12 | db-mysql | `packages/db-mysql/package.json:8` | 0 | 0 | 0 | 0 | 零改零容忍 |

- **件①** 锚A `:8`：`--max-warnings 5235` → `--max-warnings 5240`。
- **件②** 锚B `:7`：`--max-warnings 954` → `--max-warnings 959`。
- **三刀归因注记（记卷·JSON 面零注释位沿 c8ca5f0f4 lint 预算行先例形）**：AG-15 观测 proof/SSE 看门狗 proof/恒真治理注记三刀届基线在先·净树口径实测零净增；worker/root +5 = RESERVE 在飞净增 +3 预登记（959=956+3·5240=5237+3 派单口径）+ 三刀 stash 口径 +2 余量吸收（净树口径未复现如实登记·取宽值安全侧·帽 ≥ 净树+RESERVE 预判 957/5238 亦覆盖）。
- **语义申明**：`--max-warnings` 只放宽 warnings 计数·**errors=0 红线不变**（eslint error 恒硬失败与该参数无关）·零门语义变更·零产品码零迁移零 lockfile·est live=0。

## §1.3 否决

1. **零步进（维持 954/5235）**：RESERVE 并线即红（≥957/5238 > 954/5235）·恰等贴线零余量违在飞预登记义务·否决。
2. **上限无界化（删参数/无穷值）**：违贴线纪律·warnings 增量失控面·否决。
3. **顺带修 warnings（5235 处批量 --fix）**：巨 diff 越授权面·非本刀·否决。
4. **逐包普涨（12 包同 +N）**：实测恰等十包零增量依据·违「逐包照届实测」·否决。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 §9+commit message 记）

1. **lint 全绿新值**：`pnpm turbo lint --force` 12/12（0 cached）EXIT=0·worker 954≤959·root 5235≤5240·余 10 包恰等贴线·全 0 errors（errors=0 红线维持）。
2. **typecheck**：`pnpm turbo typecheck --force` 8/8（0 cached）EXIT=0。
3. **markers 五类**：改动集（两 package.json+本卷）运行时组装词面（`['T','O','D','O'].join('')`/`['F','I','X','M','E'].join('')`/`['X','X','X'].join('')`/`['H','A','C','K'].join('')`+冲突标记对组装形·词面不入卷防自匹配·i6-239 口径）零命中+全树行首冲突标记严格形零命中。
4. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 `scanned ≤2240`（预期 2235=届 2234+本卷 1·余 5）。
5. **diff 面**：draft commit 恰 1 tracked（本卷）·EXEC commit 恰 3 tracked（锚A+锚B+本卷 §9 append+STOP 翻面）·零产品码零迁移零 lockfile·零第四文件。

**停止条件（命中即停手上报）**：lint 任一包红·typecheck 红·docs:check>2240·diff 超 3 tracked·markers 非零命中。

## §8 STOP（开工条款 + 翻面形）

- **开工条款（sanction 直落形）**：①协调方派单 brief 即 sanction 授权（步进值 worker 959/root 5240+三刀归因+RESERVE 在飞预登记由 brief 颁定·lint 门协议沿 cap-sanction 先例 P1-b 届 tip 重测步进·AG-15/SSE 期已立）；②快速链诊断+重测+起草+EXEC 一体席·沿 sanction 刀单波直落先例·pre-exec 双审由 sanction 形制承载；③EXEC 不得越 §1 两行落点与 §1.3 否决面（越则红停回炉）。
- **STOP = `draft:awaiting_pre_exec_dual` 三处同值**（Status 头+本节+卷尾注·draft commit `7ed020077` 时点史录保留零字洗）→ **EXEC commit 翻 `executed:awaiting_post_prove_dual` 三处同值**（Status 头+本节+卷尾注·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·Dual PASS≠关闭·批表行/Status 终翻面权归协调方·本刀不宣称关闭）。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §9 EXEC 记录（快速链一体席·2026-10-17·门矩阵五门 EXIT 原值）

1. **授权链**：协调方派单 brief（lint 帽按届实测步进·三刀 nail 届基线在先+RESERVE 在飞净增 +3 预登记·lint 门协议沿 cap-sanction 先例 P1-b 届 tip 重测步进·快速链诊断+重测+起草+EXEC 一体席）→ draft commit `7ed020077`（本卷 §0-§8+STOP 三处 draft 史录·恰 1 tracked）→ EXEC 本席落码。
2. **码面落点**（恰 2 文件·沿 §1 对照表·零越面）：件① root `package.json:8` `--max-warnings 5235`→`--max-warnings 5240`·件② `apps/worker/package.json:7` `--max-warnings 954`→`--max-warnings 959`·余十包实测恰等零改贴线（web 601/api 1421/ai-runtime 628/db 1042/contracts 265/domain 115/qdrant 27/ai-graphs 47/config 0/db-mysql 0）。
3. **门矩阵五门全绿**：①`pnpm turbo lint --force` **12 successful/12·0 cached EXIT=0**（worker 954≤959·root 5235≤5240·余十包恰等贴线·全 0 errors=红线维持）；②`pnpm turbo typecheck --force` **8 successful/8·0 cached EXIT=0**（新支线树 `pnpm install --frozen-lockfile` 门前置·pnpm-lock 零字节）；③markers 五类改动集（两 package.json+本卷）运行时组装词面扫描 `words=0 conflict=0 hits=0`+全树行首冲突标记严格形 `TREE-CONFLICT-FILES=0`；④`node scripts/ai-docs/check-docs.mjs` EXIT=0 `scanned 2235 managed worktree files` ≤2240 余 5（=届 2234+本卷 REQUEST 1·EXEC 树与 draft 树同值·package.json 改零增受管文件）；⑤diff 面 EXEC commit 恰 3 tracked（两 package.json+本卷 §9 append+STOP 翻面）·零产品码零迁移零 lockfile。
4. **双口径账**：届实测净树口径 12/12 恰等贴线（本席亲测·基线绿零余量）；brief stash 口径 956/5237 差 +2/+2 如实登记归 stash 在飞态不洗史；步进幅度 +5/+5 = RESERVE 在飞净增 +3 预登记 + stash 口径 +2 余量吸收·取派单颁定宽值安全侧（帽 ≥ 净树+RESERVE 预判 957/5238 亦覆盖）·RESERVE 并线后预期恰等贴线 959/5240。
5. **偏离**：零（落点/门矩阵/STOP 形全沿 §1/§2/§8 定稿·两行逐字节落定·零越面零程序性偏差·新支线树依赖安装系门前置非码面偏差）。
6. **卫生**：est live=0（五门全本地静态·零外呼零 secrets 零模型调用）·actualSpendCny=null·零迁移零 DDL 零 env 闸·pins 不适用（本刀无 pins 面）·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。
7. **STOP 终态**：三处（Status 头/§8/卷尾注）同值 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行与 Status 终翻面权归协调方·本刀不宣称关闭。

---

*LINT-CAP-STEP REQUEST · 2026-10-17 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-17 EXEC 落码·§9·前值 `draft:awaiting_pre_exec_dual` @draft `7ed020077` 史录）*· base `feat/mysql-schema-skeleton` @`ce4bfd1d0`（dbhy1-reg-fix nail 波 tip·等号成立亲证）· 分支 `line/lint-cap-step` · 工作树 `meetwise-lcap` · 立项出处=协调方派单 brief（三刀 nail 届基线在先+RESERVE 在飞净增 +3 预登记）· 修法=worker 954→959+root 5235→5240 两行（余十包实测恰等零改贴线·errors=0 红线不变）· 门矩阵五门=lint 12/12 新值 EXIT=0+typecheck 8/8+markers 零命中+docs:check 2235≤2240+diff 恰 3 tracked · est live=0 · ⛔push ⛔merge 主线*
