# LINT-CAP-STEP-242 lint 帽步进刀 REQUEST（mini·快速链·sanction 随令直落形·沿 lint-cap-step 先例形·#185 件③冻结文本 +2 归因·root 5240→5242+api 1421→1423）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷·门矩阵五门预标定·EXEC 随本席一体行使·sanction 随令直落形 pre-exec 双审由派单 brief 承载 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（届时树亲算·349c33e90 届时值）

- **基线**：`origin/feat/mysql-schema-skeleton` @ `349c33e90`（S30 弱点修复刀并线 SSOT 登记 tip·fetch 后 tip≥349c33e90 等号成立亲证=`git merge-base --is-ancestor 349c33e90 HEAD` EXIT=0）。支线 `line/lint-cap-step-242`（worktree `meetwise-lc242`·基线即 349c33e90·upstream 已 `--unset-upstream` 防误推·⛔push）。
- **锚A** `package.json`（root）blob `779aed33`：`:8` `"lint": "eslint . --max-warnings 5240",`。
- **锚B** `apps/api/package.json` blob `9ec7b830`：`:7` `"lint": "eslint . --max-warnings 1421",`。
- **十二任务现帽全表（届时树亲读·`git grep --max-warnings` 12/12）**：root **5240** / web **601** / api **1421** / worker **959** / ai-runtime **628** / db **1042** / contracts **265** / domain **115** / qdrant-store **27** / ai-graphs **47** / config **0** / db-mysql **0**（=turbo lint 12 任务·config/db-mysql 帽 0=零容忍面）。
- **届实测（本席亲测·净树口径·恰等贴线余 0 全表）**：`pnpm turbo lint --force` **12 successful/12·0 cached EXIT=0**·逐包 raw problems 亲读=**恰等现帽贴线**：root 5240/contracts 265/qdrant 27/ai-runtime 628/db 1042/domain 115/ai-graphs 47/web 601/**api 1421**/worker 959/config 0/db-mysql 0·**全 0 errors**（errors=0 红线维持）·新支线树 `pnpm install --frozen-lockfile` 门前置 EXIT=0（Done in 35m15.6s·pnpm-lock 零字节）。
- **归因注记（#185 件③冻结文本 +2·本席亲证）**：#185 打卡键 EXEC `da3414b0d`（`line/checkin-key`）件③ `apps/api/test/validate.ts` 冻结定稿文本 +2 臂（新 `:473` 无计划打卡→409 plan_required 臂+新 `:486` 计划存在而 topic∉维度→400 invalid_topic 臂）各带 `{ 'x-user-id': 'userA' }` 对象字面量键 → `@typescript-eslint/naming-convention` warning +1/臂=**+2**。本席隔离壳亲证：base validate.ts 换 `da3414b0d` 版裸跑 `eslint .`（apps/api）=`1423 problems (0 errors, 1423 warnings)`=1421+2 恰等·warning 落点亲读 `473:64`+`486:66` 两行 naming-convention 恰两条新增臂·余零漂移（测毕原版回写·树净零残留 `git status --porcelain` 空）。root 面同源 +2（root `eslint .` 全树口径含 apps/api·5240+2=5242>5240 同破）。= `da3414b0d` 门9 红停承登「api 1423>1421+root 5240 帽破」复现一致。
- **裁决承登（协调方·甲）**：帽步进 +2（root 5240→5242·api 1421→1423）·归因本刀冻结文本·沿 RESERVE 净 +5 勘误步进先例形（lint-cap-step `89885f783` root +5=RESERVE +3 预登记+stash +2 余量吸收取宽值安全侧·帽≥在飞实测承登先例）·修改定稿文本=回炉乙案不行使（Ban 自升帽值对偶面=Ban 改定稿文本消 warning）。
- **docs:check 锚**：届树亲跑 EXIT=0 `scanned 2250 managed worktree files` ≤ cap **2256**（`scripts/ai-docs/public-text-policy.mjs:116` `MAX_FILES = 2_256`·cap-sanction-2256 步进后值）。本卷 REQUEST +1 → draft 树 **2251** 余 5（package.json 改零增受管文件·EXEC 树同值）。

## §1-修法（两文件两行·步进对照表）

| # | 任务 | 落点 | 旧帽 | 届实测(净树) | 新帽 | Δ | 处置 |
|---|------|------|------|------|------|---|------|
| 1 | root | `package.json:8` | 5240 | 5240 | **5242** | +2 | 改 |
| 2 | api | `apps/api/package.json:7` | 1421 | 1421 | **1423** | +2 | 改 |
| 3 | web | `apps/web/package.json:7` | 601 | 601 | 601 | 0 | 零改贴线 |
| 4 | worker | `apps/worker/package.json:7` | 959 | 959 | 959 | 0 | 零改贴线 |
| 5 | ai-runtime | `packages/ai-runtime/package.json:14` | 628 | 628 | 628 | 0 | 零改贴线 |
| 6 | db | `packages/db/package.json:11` | 1042 | 1042 | 1042 | 0 | 零改贴线 |
| 7 | contracts | `packages/contracts/package.json:12` | 265 | 265 | 265 | 0 | 零改贴线 |
| 8 | domain | `packages/domain/package.json:10` | 115 | 115 | 115 | 0 | 零改贴线 |
| 9 | qdrant-store | `packages/qdrant-store/package.json:11` | 27 | 27 | 27 | 0 | 零改贴线 |
| 10 | ai-graphs | `packages/ai-graphs/package.json:10` | 47 | 47 | 47 | 0 | 零改贴线 |
| 11 | config | `packages/config/package.json:8` | 0 | 0 | 0 | 0 | 零改零容忍 |
| 12 | db-mysql | `packages/db-mysql/package.json:8` | 0 | 0 | 0 | 0 | 零改零容忍 |

- **件①** 锚A `:8`：`--max-warnings 5240` → `--max-warnings 5242`。
- **件②** 锚B `:7`：`--max-warnings 1421` → `--max-warnings 1423`。
- **余十包**：届实测恰等贴线·零改（web 601/worker 959/ai-runtime 628/db 1042/contracts 265/domain 115/qdrant 27/ai-graphs 47/config 0/db-mysql 0）。
- **随刀注记两行（记卷·JSON 面零注释位沿 `c8ca5f0f4` lint 预算行先例形·注记不入 JSON）**：
  1. **归因 #185 件③ +2 naming-convention**：`da3414b0d` 冻结定稿文本两臂 `x-user-id` 对象键 naming-convention warning +2（api 1421→1423·root 5240→5242 同源）·本帽步进恰等归因增量·零宽值余量（+2=+2 非宽值）。
  2. **RESERVE 5240 先例承续**：lint-cap-step（`89885f783`）root +5 勘误步进形（帽≥净树+RESERVE 预判承登）承续——本刀 +2 系在飞 #185（已 EXEC 红停承登待并线）净增承登·并线后预期恰等贴线 5242/1423。
- **语义申明**：`--max-warnings` 只放宽 warnings 计数·**errors=0 红线不变**（eslint error 恒硬失败与该参数无关）·零门语义变更·零产品码零迁移零 lockfile·est live=0。

## §1.3 否决

1. **无界化（删 `--max-warnings` 参数/无穷值）**：违贴线纪律·warnings 增量失控面·否决。
2. **洗旧（修订 #185 件③定稿文本消 warning=回炉乙案）**：协调方裁决乙案不行使·冻结文本不可改·Ban 改定稿文本消 warning·否决。
3. **越值 +4（root→5244/api→1425 或单臂 +4 双臂 +2）**：超归因增量 +2·违恰等步进（+2=+2）·否决。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 §9+commit message 记）

1. **lint 全绿新值**：`pnpm turbo lint --force` 12/12（0 cached）EXIT=0·root 5240≤5242·api 1421≤1423·余 10 包恰等贴线·全 0 errors（errors=0 红线维持）·**恰等新帽承登**：新帽−届实测=+2 恰等 #185 归因增量·在飞并线后预期恰等贴线 5242/1423。
2. **typecheck**：`pnpm turbo typecheck --force` 8/8（0 cached）EXIT=0。
3. **markers 五类**：改动集（两 package.json+本卷）运行时组装词面（`['T','O','D','O'].join('')`/`['F','I','X','M','E'].join('')`/`['X','X','X'].join('')`/`['H','A','C','K'].join('')`+冲突标记对组装形·词面不入卷防自匹配·i6-239 口径）零命中+全树行首冲突标记严格形零命中。
4. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 `scanned ≤2256`（预期 2251=届 2250+本卷 1·余 5）。
5. **diff 面**：draft commit 恰 1 tracked（本卷）·EXEC commit 恰 3 tracked（锚A+锚B+本卷 §9 append+STOP 翻面）·零产品码零迁移零 lockfile·零第四文件。

**停止条件（命中即停手上报）**：lint 任一包红·typecheck 红·docs:check>2256·diff 超 3 tracked·markers 非零命中。

## §8 STOP（开工条款 + 翻面形）

- **开工条款（sanction 随令直落形）**：①协调方派单 brief 即 sanction 授权（步进值 root 5242/api 1423 各 +2+归因 #185 件③冻结文本+裁决甲=帽步进·乙案=回炉修订定稿文本不行使·沿 RESERVE 净 +5 勘误步进先例形·lint 门协议沿 cap-sanction/lint-cap-step 先例 P1-b 届 tip 重测步进）；②快速链起草+EXEC 一体席·沿 sanction 刀单波直落先例·pre-exec 双审由 sanction 随令形制承载；③EXEC 不得越 §1 两行落点与 §1.3 否决面（越则红停回炉）。
- **STOP = `draft:awaiting_pre_exec_dual` 三处同值**（Status 头+本节+卷尾注·draft commit 时点史录保留零字洗）→ **EXEC commit 翻 `executed:awaiting_post_prove_dual` 三处同值**（Status 头+本节+卷尾注·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·Dual PASS≠关闭·批表行/Status 终翻面权归协调方·本刀不宣称关闭）。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

---

*LINT-CAP-STEP-242 REQUEST · 2026-10-16 起草 · **`draft:awaiting_pre_exec_dual`**（本卷 §0-§8·EXEC 随本席一体行使）· base `feat/mysql-schema-skeleton` @`349c33e90`（S30 弱点修复刀并线 SSOT 登记 tip·等号成立亲证）· 分支 `line/lint-cap-step-242` · 工作树 `meetwise-lc242` · 立项出处=协调方派单 brief（#185 件③冻结文本 +2 归因·root 5240→5242+api 1421→1423·裁决甲·RESERVE 5240 先例承续）· 修法=root 5240→5242+api 1421→1423 两行（余十包实测恰等零改贴线·errors=0 红线不变）· 门矩阵五门=lint 12/12 新值 EXIT=0+typecheck 8/8+markers 零命中+docs:check 2251≤2256+diff 恰 3 tracked · est live=0 · ⛔push ⛔merge 主线*
