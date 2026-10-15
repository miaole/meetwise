# ADMIN-DISABLE-EVICT EXEC 收据（00-exec · 2026-10-14 · 席位=EXEC · 授权链=rev2 pre-exec 双审会签 PASS 席1 agent_ba62a3f4+席2 agent_ff74cef6+协调方明示 EXEC 授权开工）

**基线**：立项基线=merge **`e1d1b368`**（`git merge --no-ff feat/mysql-schema-skeleton` @主线 tip **`148cf83b`**·ort 零冲突 auto-merge·62 文件 +10372/-233·分支 `line/admin-disable-evict`·工作树 `meetwise-ade`）。改前树=HEAD `e1d1b368`（stash 基线跑亲证用同一 commit 树）。

## 一、工序（执行序逐步）

1. `git fetch`（主线 tip 实测 `148cf83b` 恒等任务书）+ `git merge --no-ff feat/mysql-schema-skeleton` → merge **`e1d1b368`**（ort 零冲突自动解·任务书预告恒等：negbend 已改 recruiterDecision 区·disable 函数不同区域 auto-merge）。
2. §0.0 三项重 pin 落卷（REQUEST .md 内「EXEC 立项日三项重 pin 亲证落值」段+§2-8/§2-9/§4-2/§0.1 跨线锚随翻）。
3. EXEC 件② 落树（neg-bend.proof.ts 纯增三处+簿记两行·既有 178 臂断言本体零字节）。
4. **改前必做 run**（件③①·恰一次判定·EXIT=1·178 PASS/1 FAIL 唯一红=新臂）+ 修前 evictU 复请求指纹实测（诊断探针·非判定 attempt）。
5. EXEC 件① 落树（admin.service.ts 净 +1 行·import 免重·§4-2 已吸收支）。
6. 门矩阵十二门全跑（下表）·本收据+REQUEST §9 落卷·STOP=`executed:awaiting_post_prove_dual`。

## 二、门 1 改前必做 run + 修前 evictU 指纹（机制判据）

- **attempts 全台账**（判定 run 恰一次·前置基建红两次如实登·零断言面 retry）：
  - attempt#0a=`pnpm -C apps/api neg:bend` 直跑 → EXIT=1 `ERR_MODULE_NOT_FOUND @swc-node/register`（worktree 新建 node_modules ABSENT·零臂执行）→ `pnpm install --frozen-lockfile` EXIT=0（门 12 本要求）。
  - attempt#0b=直跑复试 → EXIT=1 `env_schema_invalid: database_target_missing`（隔离环境未注入·零臂执行）→ 改走仓内既定根 wrapper `pnpm neg:bend`（=run-e2e-isolated.mjs·内层命令恒等·偏离登记 ②）。
  - **attempt#1=有效改前判定 run（恰 1）**：EXIT=1·**178 PASS/1 FAIL**·总臂 179·FAIL 名恰=新臂 `admin disable 后该用户下一请求即时 401(本进程守卫缓存 evict·非 60s TTL 兜底)`·stdout 全量 tee=`judgment-run-prechange-stdout.log`。**不红即停判据未触=红名与预期逐字恒等**。
- **修前 evictU 复请求指纹**（一次性隔离 PG 容器+诊断探针·非 prove run·探针容器用后即弃）：
  - 填充腿 `GET /admin/users`（Bearer）→ **403 `{"error":"admin_required"}`**（principal guard Bearer 支路 accountState 读 miss→DB active→回填缓存→过 status 检查→AdminGuard 403）；
  - 停用腿 `POST /admin/users/evictU/disable`（adm dev 头）→ **200 `{"disabled":true}`**；
  - **复请求腿（修前·即时）→ `403 {"error":"admin_required"}`（非 401）**——与卷 §1-修法件②-2 rev2 Bearer 形机制推定恒等（无本地 evict→吃陈旧 active 缓存→status 检查过→AdminGuard 403）。停止条件「机制不满足」零触发。
- **改后 prove run**：门 1 表 EXIT=0 **179/179**·PASS 名单 diff 恰 +1（下节）。

## 三、门矩阵 §2 十二门（全表·EXIT 原值）

| # | 门 | 命令 | 结果 | 关键读数 |
|---|---|---|---|---|
| 0 | 卫生 install | `pnpm install --frozen-lockfile` | 绿 | EXIT=0·lockfile 零改（status 零 pnpm-lock 条目）·Done in 4.9s |
| 1 | 命门 neg:bend（改后 prove） | `pnpm neg:bend`（根 wrapper） | **绿 179/179** | EXIT=0·`✓ neg:bend: 179 条负路径用例全绿`·stdout tee=`gate1-negbend-prove-stdout.log`·熔断 0 容差未触 |
| 2 | neg:all 全量 | `pnpm neg:all`（根 wrapper） | **绿 687/687** | EXIT=0·六段=auth 90+commerce 90+resume 91+interview 102+bend **179**+input 135·邻五套件 PASS 名单对改前 diff=**∅×5**（stash 基线跑逐套件对照·偏离登记 ④）·stdout tee=`gate2-negall-stdout.log` |
| 3 | api-harden 不回退 | `pnpm api-harden:prove`（根 wrapper） | 绿 31/0 | EXIT=0·PASS=31 FAIL=0·零回退·stdout tee=`gate3-api-harden-stdout.log` |
| 4 | migrate:prove | `pnpm migrate:prove` | 绿 | EXIT=0·`✓ 迁移运行器 全部通过`·链 **201** 头 **0201_qbank_fusion_owner_rank_org_dedup.sql**·零新迁移·stdout tee=`gate4-migrate-stdout.log` |
| 5 | drift:prove | `pnpm drift:prove` | 绿 | EXIT=0·`✓ schema 无漂移`（0145 两豁免恒等既登）·stdout tee=`gate4b-drift-stdout.log` |
| 6 | uniqueness | `node scripts/check-migration-version-uniqueness.mjs` | 绿 | `files=201 violations=0 exemptions=0143,0152,0160` EXIT=0 |
| 7 | typecheck | `pnpm turbo typecheck --force` | 绿 | **8 successful, 8 total / 0 cached** EXIT=0·stdout tee=`gate7-typecheck-stdout.log` |
| 8 | lint 贴边 | `pnpm turbo lint` | 绿 12/12 | EXIT=0·root **5224**/web **601**/api **1421** 全恰等贴线（0 errors·api+root 两任务 cache miss 新跑实测量·余 10 任务 cache hit 输入未变）·零 +1 消费·stdout tee=`gate8-lint-stdout.log` |
| 9 | docs:check | `node scripts/ai-docs/check-docs.mjs` | 绿（终态） | 中间态 2109（重 pin 后·收据落卷前）→终态 **2110≤cap 2112** EXIT=0（本收据 1 件 untracked 经 --others 扫计入·ssepush 先例形·见 §9 后终态复跑记录） |
| 10 | markers 五类 | 五类标记词（i6-239-gates §2-7 同源运行时组装·词面不入卷）+冲突标记改动集直扫 | 绿 | **HITS=0**（改动集=本卷 .md+件① .ts+件② .ts 三 tracked·收据 untracked 不入集） |
| 11 | diff 面机检 | `git diff --numstat <merge>` | 绿 | 恰 **3 tracked 路径**（下节 numstat）·typecheck 副产物 `apps/web/tsconfig.tsbuildinfo` 一次翻动已 `git checkout` 回滚（§2-11 预案内·negbend EXEC §9 先例形） |
| 12 | 卫生 | `.env*`+est live | 绿 | `.env*` ABSENT 双向亲证（根 glob 零命中+find top-3 零命中）·est live=**0**（全门静态/本地/隔离容器·零模型外呼零 Key 加载零消耗）·`actualSpendCny=null` |

## 四、改前改后 PASS 名单 diff（门 1 协议）

- 协议：改前判定 run（attempt#1）stdout `^PASS` 178 行 vs 改后 prove run（门 1）179 行·各自 `sed 's/^PASS  //' | sort` 后 `diff`。
- **diff 全文（恰 1 行·零弱化）**：
  ```
  51a52
  > admin disable 后该用户下一请求即时 401(本进程守卫缓存 evict·非 60s TTL 兜底)
  ```
- 其余 178 条零弱化（diff 出第 2 条即停判据未触·全量两名单在 `judgment-run-prechange-stdout.log`/`gate1-negbend-prove-stdout.log` 可复现）。

## 五、diff numstat（门 11·对 merge `e1d1b368`）

```
28  9  ai-docs/delivery/harness/admin-disable-evict-REQUEST.md   （重 pin 落值+§9 EXEC 记录·本卷 .md）
 1  0  apps/api/src/modules/admin/admin.service.ts               （件①·import 免重·净 +1 调用行）
11  4  apps/api/test/neg-bend.proof.ts                           （件②·纯增三处+簿记两行·既有 178 臂断言本体零字节改）
```
（+11/−4 分解：+7=新臂块 7 行·+4/−4=件②-1 注释尾追加 1 行+种子行逐字改 1 行+件②-3 簿记两行改写。）

## 六、重 pin 全表（§0.0 rev2 三项·EXEC 立项日落值）

| 项 | rev2 时值 | EXEC 立项日落值 | 亲证 |
|---|---|---|---|
| ① nbf 引用 | `line/negbend-fix` @`c046262d`/`1e686576`（起草日） | negbend 已 nail 并线·引用改主线 tip **`148cf83b`**（nbf 届时 tip `f3021ab9`=主线祖先·`cat-file -e` 吸收 EXIT=0·blob `923fb426` 即本树现 blob） | `git merge-base --is-ancestor`+`git cat-file -e`+`git hash-object` 三证 EXIT=0 |
| ② 门 8 lint | root 5202（基线时值）·rev2 加注 5224 起 | 判据钉 root ≤**5224**+web ≤**601**+api ≤**1421**（§2-8 已改） | checklist `148cf83b` 树 ssepush/uc003-i18n 承登段+门 8 实跑恰等 |
| ③ 门 9 docs | 预期 2100≤cap 2104（基线时值） | 本合并树亲跑 **2109**≤cap **2112**·收尾预期 **2110**（+untracked 收据 1）（§2-9 已改） | 本树亲跑 EXIT=0 |

随 pin 附记：§4-2 二态裁定=**「已吸收」支**（件① import 行免重·仅增调用行·净 +1）·§0.1 跨线锚升格同树锚（`:87` 先例行本树亲读）·disable 函数域行号 +1 位移改锚（`:62-:67`·守卫 `:65`/return `:66`）·§0.0 交叠重扫=merge 引入集 negbend 之外零 novel 触双径者（62 文件逐览）。

## 七、偏离登记（EXEC 期全量·实质偏离零·形制登记五）

1. **件① 净 +1 行（非 +2）**：§4-2 已吸收支预告形态（卷面「并线 negbend 后 +1 行」同款预告见停止条件条款）·import 免重（blob `923fb426` `:4` 已在）·行号 +1 位移如实改锚——非实质偏离·如实记。
2. **门 1/2/3 命令走根隔离 wrapper**（`pnpm neg:bend`/`pnpm neg:all`/`pnpm api-harden:prove` = `run-e2e-isolated.mjs`）：卷面直跑形 `pnpm -C apps/api …` 需 E2E_ISOLATED 隔离环境与带 nonce 一次性 PG（`assertIsolatedTestEnvironment` 强制·attempt#0b 亲证）——wrapper 系仓内既定同源入口·内层命令逐字恒等·仅代为供给隔离 PG·零机制变化。
3. **基建红两次前置**（attempt#0a node_modules ABSENT→install；#0b 隔离 env 缺→改 wrapper）：零臂执行零判定消耗·判定 run 自身恰一次（红=预期红·零 retry-to-green）。
4. **门 2 改前对照=stash 基线跑**（`git stash push` → HEAD `e1d1b368` 树逐套件 5 run → `stash pop`）：卷 §2-2 未明文跑法·取 §8「stash 对照亲证基线」先例形做全保真 PASS 名单 diff（五套件 diff=∅×5 实测非推断）·stash 前后工作树三文件恒等亲证·零弹入。
5. **门 11 副效应回滚一次**：`apps/web/tsconfig.tsbuildinfo` typecheck 翻动→`git checkout` 回滚（§2-11 点名处置·negbend EXEC §9 先例形）·终态恰 3 tracked。
6. **交付 commit 误纳收据一次→reset 重做**：首次 commit `2960a98a` 误将收据目录 9 件一并提交（diff 面 12 路径·违件④「untracked·§2-11 negbend 口径」钉面）→当场 `git reset HEAD~1`（本地未 push·零远端操作）→按钉面重收 3 tracked 重做=**`32b50110`**（终态 diff 恰 3 tracked·收据留 untracked 含 8 件 .log tee+本收据）·`2960a98a` 系本地悬空对象如实登记防 post 审对疑。

## 八、pins 零翻声明 + 兼容性附记

- **pins 零翻**：§5 pins 十一值（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+`actualSpendCny=null` 本 EXEC 全程零翻转（§5 未触）。
- **旧代码忽略仍正确（兼容附记）**：件① 变更面=进程内守卫缓存清除调用（`evictPrincipalStatus(id)` 单参·进程内 Map）+负测增臂——**零 wire 契约零 Redis 结构零持久化格式零迁移**；未部署本修复的实例上 0189 触发器同事务 pg_notify 广播+60s TTL 兜底上界原样在场（降级窗残留面如实以卷 §1.2 为准），已部署实例行为仅收紧（停用即时 401）——无跨版本互认义务、无回填/丢字段兼容问题。
- **est live=0**：全门=静态扫描+本地 node/tsx+隔离容器·零模型外呼·零 secrets·零生产操作。
