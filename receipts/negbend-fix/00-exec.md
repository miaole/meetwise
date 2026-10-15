# NEGBEND-FIX EXEC 收据（件③·七字段）——negbend-fix 战役 EXEC 席 · 2026-10-14

工作树 `meetwise-nbf` · 分支 `line/negbend-fix` · 授权链=pre-exec 双审 BOTH PASS（席1 `agent_b1c540a6`+席2 `agent_68a4c9e9`）+协调方 EXEC 授权（committed SHA 重钉=`cfc68287`）· est live=0（零模型外呼·neg 面全离线·零 Key 加载·零生产操作）· `actualSpendCny=null` 零支出记录。

## ① 门矩阵全表（十二门·EXIT 原值·并线树 `1ce04516` 基·门矩阵于 commit 2=`1e686576` 状态实测）

| # | 门 | 判据 | 实测 | EXIT | 结论 |
|---|---|---|---|---|---|
| 1 | neg:bend | 178/178·熔断 0 容差·PASS 名单 diff 恰 4 | `node scripts/run-e2e-isolated.mjs neg:bend`：`✓ neg:bend: 178 条负路径用例全绿`·PASS 178/FAIL 0 | 0 | 绿 |
| 2 | neg:all 六段 | 全绿·邻面 PASS 名单 diff=∅ | auth 90+commerce 90+resume 91+interview 102+bend 178+input 135=**686/686**（input 本轮首达·改前收据 fail-fast NOT_REACHED 故卷面 551 为五段旧分母·实测如实更）·邻四套件 diff=∅ 亲证（auth/commerce/resume/interview 对基线 `/tmp/neg-all-run.log` 547 PASS 逐套 diff 恒等） | 0 | 绿 |
| 3 | api-harden:prove | 不回退·26 臂维持 | EXIT=0·**PASS 31/FAIL 0**——proof 文件自卷面基线 `cf501273` 零字节变更（`git diff cf501273 HEAD --stat` 空）→31 测线与本刀改前基线产值恒等=不回退实质绿；「26」系沿 `f31d56d1` EXEC 期旧登记（`c31fd11e` 修复增 N1/T1 臂后实为 31）·口径滞后如实更·非现场漂移 | 0 | 绿 |
| 4 | migrate:prove | 链头实测 | `pnpm migrate:prove` 全部 PASS（字节序/事务臂/唯一性/豁免面）·链 `ls packages/db/migrations`=**201 头 0201_qbank_fusion_owner_rank_org_dedup.sql**（并线后预期值恒等） | 0 | 绿 |
| 5 | drift:prove | 零漂移 | `node scripts/schema-drift-check.mjs`：`✓ schema 无漂移`（豁免 2 项=0145 dbhy1 既登恒等） | 0 | 绿 |
| 6 | uniqueness | violations=0 | `files=201 violations=0 exemptions=0143,0152,0160`（201=并线后链深恒等） | 0 | 绿 |
| 7 | typecheck | 8/8 | `pnpm turbo typecheck --force`：`Tasks: 8 successful, 8 total`·`Cached: 0 cached, 8 total` | 0 | 绿 |
| 8 | lint 承登 | 双红恒等既登·零第三红 | 12 任务 10 成功 2 失败=**恰双红**：api `1431 problems (0 errors)`>1421 + root `✖ 5212 problems (0 errors, 5212 warnings)`>5200——与并线携入既登 AUTHZ 基线（ag39q 并线树口径 `root 5212>5200`+`api 1431>1421`）逐字恒等·零第三红 | 1（承登红） | 绿（承登口径） |
| 9 | docs:check | ≤cap | `scanned 2100 managed worktree files`≤cap **2104**（并线后 cap 2088→2104 恒等口径） | 0 | 绿 |
| 10 | markers 五类 | 改动集零命中 | 改动集新增行（`git diff 1ce04516 -U0` `^+` 口径·词族=TODO/FIXME/XXX/HACK/冲突标记 i6-239 门）**零命中** | 1（零命中） | 绿 |
| 11 | diff 面机检 | 恰 2 tracked 路径 | `git diff --numstat 1ce04516`=恰 `apps/api/src/modules/admin/admin.service.ts`（2+/0-）+`ai-docs/delivery/harness/negbend-fix-REQUEST.md`（rev3+§9）+收据目录 untracked 三件（00-exec.md+01/02/03 raw log）；**运行副效应登记**：typecheck 门运行曾翻动 `apps/web/tsconfig.tsbuildinfo`（tsbuildinfo 增量构建状态·1/1 行）——已 `git checkout` 回滚基线（撤销运行副效应·非交付面·零内容改动） | — | 绿 |
| 12 | 卫生 | 四件 | `pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录（仓根/apps/api/packages/db 三查均 No such file）·`actualSpendCny=null`·est live=0 | 0 | 绿 |

## ② 改前改后 PASS 名单 diff + 四臂指纹（rev3 义务）

**改前必做 run**（commit 1 后·commit 2 前·同树 `4ac521ac`·不计入 prove·恰一次）：EXIT=1·**174 PASS/4 FAIL**·红名单恰四臂：
1. `approve 后同账户 create→200(解锁)`（:463 臂①）
2. `approve 后同账户 invite→200 恒定壳`（:465 臂②）
3. `reject 后恒 403 recruiter_rejected(分码断言)`（:473 臂③）
4. `reject 后 GET /recruiter/talent 恒 403 recruiter_rejected`（:474 臂④）

**四臂实测 body.error 指纹（全部=`recruiter_pending_review`·与 §1.2 推定形逐字相符·机制归因链闭面）**：
```
[NBF-OBS] t=…616 POST /recruiter/jobs uid=pendU status=403 error=recruiter_pending_review          ←臂①(approve 后)
[NBF-OBS] t=…617 POST /recruiter/jobs/undefined/invite uid=pendU status=403 error=recruiter_pending_review  ←臂②(级联·URL 含 undefined)
[NBF-OBS] t=…619 POST /recruiter/jobs uid=pendU status=403 error=recruiter_pending_review          ←臂③(reject 后·status 达标码层错)
[NBF-OBS] t=…620 GET  /recruiter/talent uid=pendU status=403 error=recruiter_pending_review        ←臂④
```
观测法=树外零侵入直通 fetch 日志 preload（`NODE_OPTIONS=--require /tmp/nbf-observer.cjs`·纯直通 clone 读 error 字段·不改请求/响应·随该次 run 顺载=不构成第二 run·零树内文件触碰·观测件全文随卷登记于下方）。前置六臂填充段（:408-:418）观测同码 `recruiter_pending_review`=缓存填充点亲证；adminU approve/reject decision 200 与留痕臂 PASS 在 174 PASS 内（audit `updated_rows>0` 门控）。

**改后 prove run**（恰一次·零 retry）：EXIT=0·178/178 全绿。**PASS 名单 diff（`sort` 后逐条 diff·改前 174 分母本树自证）**：
```
> PASS  approve 后同账户 create→200(解锁)
> PASS  approve 后同账户 invite→200 恒定壳
> PASS  reject 后 GET /recruiter/talent 恒 403 recruiter_rejected
> PASS  reject 后恒 403 recruiter_rejected(分码断言)
```
恰 4 条·全为翻绿新增·**零删减零弱化**（第 5 条未现·门1 判据恒等达成）。

## ③ diff numstat（对并线基线 `1ce04516`）

```
14  3  ai-docs/delivery/harness/negbend-fix-REQUEST.md   ←rev3（commit 1=4ac521ac）+§9 EXEC 记录（commit 3）
 2  0  apps/api/src/modules/admin/admin.service.ts      ←件①（commit 2=1e686576·import+调用行带注释）
```
收据目录 `ai-docs/delivery/receipts/negbend-fix/`（00-exec.md+01/02/03 raw log）untracked（§2-11 口径）。

## ④ 重 pin 全表（§0 协议·对并线 tip `1ce04516` 全量复核）

| 锚 | 卷面值 | 复核值 | 判定 |
|---|---|---|---|
| §0.1 十锚 blob（f076c99b/61bb1983/50b38bc5/6a9c62cf/2dce92db/b03cb16b/670a4a26/a291b62e/4d4bf7c4/93904f20） | @cf501273 | `git hash-object` 逐一复算恒等 | 零漂移 |
| §0.0 在飞交叠 | 规则必做 | 全 branch 集对 admin.service.ts 扫描·唯一命中 `line/b110-recruiter-gate @ee02bf4d` 判历史残枝（树版 blob e6c102e9 在 cf501273 历史可达+日期 2026-10-10 早基线+recruiterDecision 逐字恒等） | 未触停 |
| admin.service.ts :85 守卫/:86 return | :81-:87 | sed 亲读恒等（件① 落点行亲证） | 零漂移 |
| principal.guard.ts :29/:33/:61 | TTL/导出/回填 | sed 亲读恒等 | 零漂移 |
| principal.ts :998 COMMIT | rev3 新锚 | `packages/db/src/principal.ts:991-1002` fn(c)→COMMIT(:998)→return r 亲读 | 恒等 |
| neg:bend 臂总数 | 178 | 改前改后两 run 实测均 178 | 恒等 |
| api-harden 臂数 | 26 | **31**（proof 文件自基线零字节变更·26 系 f31d56d1 期旧登记·c31fd11e 修复后即 31·如实更） | 口径更 |
| neg:all 臂总数 | 551 | **686**（551=收据 fail-fast 五段分母·input 首达 135·如实更） | 口径更 |
| 迁移链 | 189 头 0189 | **201 头 0201**（并线携入 0190-0201·§2-4 括注「届时链顶顺延如实记」预授权） | 并线预期 |
| uniqueness files | 189 | **201** | 同上 |
| docs:check cap | 2088 | **2104**（并线携入 ag39q sanction·§2-9 括注「>2088 红停」的 2088 为起草时 cap·并线树 cap=2104·实测 2100≤2104） | 并线预期 |
| lint 承登双红 | api 1431>1421+root 5210>5200 | api 1431>1421+root **5212**>5200（ag39q 并线树既登口径恒等·+2 系并线携入非本刀） | 恒等（承登） |

## ⑤ 偏离清单（理想零）

1. **运行副效应回滚 1 件**：typecheck 门运行翻动 `apps/web/tsconfig.tsbuildinfo`（tracked 构建状态件·非交付面）——`git checkout` 回滚基线以保门11「恰 2 路径」；属撤销运行副效应非新增改动·如实登记。
2. **口径如实更 3 处**（非偏离·§2 数字口径「以实跑实测为准」条款内）：api-harden 26→31·neg:all 551→686（input 首达）·cap/链深/唯一性分母随并线翻新——均为卷面预授权括注（「届时值如实记」「实测值对收据」）的登记更新。
3. 其余零偏离：修法=恰 1 产品文件净 +2 行恒等件①；零测试文件零 harness 零迁移零 DDL 零依赖升级零 SSOT 触碰。

## ⑥ pins 零翻声明

十一值照抄零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。§1.2 四臂根因结论/§5 Ban 列表/§8 停止条件四类零改——四类停止条件全数未触（现场漂移=§0.1 十锚零漂移；机制不满足=四臂指纹与推定形逐字相符且全翻绿；越界需要=修法恒等件① 面；验收红不可修=十二门全绿承登恒等）。

## 附：指纹观测件全文（树外 `/tmp/nbf-observer.cjs`·随改前 run 顺载）

```javascript
// negbend-fix EXEC 改前 run 指纹观测件（树外临时件·零侵入直通·不构成第二 run）
(() => {
  const orig = globalThis.fetch;
  if (typeof orig !== 'function') return;
  globalThis.fetch = async (input, init) => {
    const res = await orig(input, init);
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      if (url.includes('/recruiter/')) {
        const hdrs = (init && init.headers) || {};
        const uid = hdrs['x-user-id'] || '';
        const clone = res.clone();
        const text = await clone.text();
        let err = '';
        try { const j = JSON.parse(text); err = (j && j.error) || ''; } catch { err = '<non-json>'; }
        process.stderr.write(`[NBF-OBS] t=${Date.now()} ${(init && init.method) || 'GET'} ${url.replace(/^https?:\/\/[^/]+/, '')} uid=${uid} status=${res.status} error=${err}\n`);
      }
    } catch { /* 观测失败不干预业务直通 */ }
    return res;
  };
})();
```

命令录：改前 `NODE_OPTIONS="--require /tmp/nbf-observer.cjs" node scripts/run-e2e-isolated.mjs neg:bend`（EXIT=1·174/178·raw log=01 号件）；改后 `node scripts/run-e2e-isolated.mjs neg:bend`（EXIT=0·178/178·raw log=02 号件）；`node scripts/run-e2e-isolated.mjs neg:all`（EXIT=0·686/686·raw log=03 号件）。
