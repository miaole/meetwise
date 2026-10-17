# ASSERT-STRENGTHEN 断言强度治理小刀 REQUEST（test-only·E2EA-05 跟进·恒真升格+弱断言收紧·零产品码）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 落卷·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · est live=0 · actualSpendCny=null · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（blob 级·届时树 2c257eb0 亲证·12 文件 19 点位）

- **基线**：`origin/feat/mysql-schema-skeleton` @ `2c257eb0`（fetch 后 rev-parse 亲证·**届条件 tip≥92086586 等号成立**：`git merge-base --is-ancestor 92086586 2c257eb0` YES 亲跑）。支线 `line/assert-strengthen`（worktree `meetwise-as` 亲立·`git worktree add -b` 直接落 origin tip·upstream 已解除防误推）。
- **登记出处**：`ai-docs/delivery/gap-bug-backlog.md` E2EA-05（line/e2e-audit-backlog `87b8dc22` 登记·猎杀席扫描读数「恒真 `A(...,true)` ×15」+「弱断言四处」·登记席未复现逐点位清单=本卷 §0.1/§0.2 回填）。
- **§0.1 恒真 `A(...,true)` ×15 逐处锚表**（blob=本届时值·行号届时亲证·原文全录）：

| # | 锚文件 | blob | line | 原文（逐字） | 定性 | 处置 |
|---|--------|------|------|--------------|------|------|
| H1 | apps/api/test/ha-2-drain.proof.ts | `2a2f0828` | :104 | `A('unregister 幂等（不抛）', true);` | **可达性钉**（:103 二次 unregister 真行使·断言恒真不验效果） | 升格 §1.1-A1 |
| H2 | apps/api/test/ha-2-drain.proof.ts | `2a2f0828` | :296 | `A('未排水 readiness ok', true);` | **可达性钉**（:294 `okBody` 真值在场·恒真行不携检查） | 升格 §1.1-A2 |
| H3 | apps/api/test/trial-grant.proof.ts | `e8dc43d4` | :267 | `A('0154/裸 SQL 文本双 apply 不抛（IF NOT EXISTS + CREATE OR REPLACE + REVOKE/GRANT 重申可重跑）', true);` | **可达性钉**（:266 re-apply 真行使·「可重跑」语义无值验证） | 升格 §1.1-A3 |
| H4 | apps/api/test/report-retry-http.proof.ts | `6b276571` | :269 | `A('honesty: HTTP prove 绿 ≠ 全链路 covered（钉语义翻转+频控行使 only）', true);` | 声明钉 | pin 注记 §1.1 |
| H5 | apps/api/test/uc-e2e-001-nhp-adv.proof.ts | `ae16fe5d` | :465 | `A('V3 JD/quiz text ingress = absent (documented; no invent)', true);` | 声明钉（documented-absence 申报·JD/quiz 口不存在=被申报事实本身·无值可检） | pin 注记 §1.1 |
| H6 | apps/api/test/uc-e2e-001-nhp-fault.proof.ts | `01ce35b3` | :503 | `A('F3 Ban-borrow disclosure recorded (Y/AB/AG/report:prove ≠ this case)', true);` | 声明钉（:499-:502 `E('F3-BAN',…)` 收据打印的断言流登记形） | pin 注记 §1.1 |
| H7 | apps/api/test/uc-e2e-011-report-refund-http.proof.ts | `cef42e35` | :351 | `A('H5 honesty: EXIT=0 ≠ UC-E2E-011 covered / ≠ ADV covered', true);` | 声明钉（:349 同题真值臂已在场） | pin 注记 §1.1 |
| H8 | apps/api/test/uc-e2e-011-report-refund-http.proof.ts | `cef42e35` | :363 | `A('honesty: HTTP prove 绿 ≠ UC-E2E-011 covered（mouth landed ≠ covered-lift）', true);` | 声明钉（GAP pins 打印块收尾申报） | pin 注记 §1.1 |
| H9 | apps/api/test/uc-e2e-018-adv.proof.ts | `1aec6200` | :381 | `A('honesty: ADV prove 绿 ≠ UC-E2E-018 covered（§1.1 partial retained · ADV alone ≠ covered）', true);` | 声明钉 | pin 注记 §1.1 |
| H10 | apps/api/test/uc-e2e-018-adv.proof.ts | `1aec6200` | :382 | `A('honesty: Ban invent green · real HTTP hit abandon route', true);` | 声明钉（real-HTTP-hit 已由 :368-:373 ADV-Inject `is(…,409…)` 真往返腿承证·本行=指向申报·无独立值可检） | pin 注记 §1.1 |
| H11 | apps/api/test/uc-e2e-018-user-abandon-http.proof.ts | `81115ea4` | :264 | `A('honesty: HTTP prove 绿 ≠ UC-E2E-018 covered（FULL-E2E+waiting_user+GRAPH+TTL+UI 已关；sole-stack 仍缺 → partial · UI alone ≠ covered）', true);` | 声明钉 | pin 注记 §1.1 |
| H12 | apps/api/test/uc-e2e-019-report-regenerate-http.proof.ts | `14fa4d82` | :308 | `A('honesty: HTTP prove 绿 ≠ UC-E2E-019 covered（GAP pins 已印）', true);` | 声明钉（:303 真值臂 `!hasRegenAttempt && names.includes('status')` 已在场） | pin 注记 §1.1 |
| H13 | apps/worker/test/r4-eg1-dual-claim-evidence.proof.ts | `f2cf9100` | :100 | `A('E3 ≠ claim EG1 closed from emit alone', true);` | 声明钉（E2 段 :85-:98 旗面真值臂全在：`gR45DualClaimClosed===false` 等八件） | pin 注记 §1.1 |
| H14 | apps/worker/test/r4-eg1-dual-claim-evidence.proof.ts | `f2cf9100` | :101 | `A('E3 ≠ idle 5×meta as close', true);` | 声明钉 | pin 注记 §1.1 |
| H15 | apps/worker/test/r4-eg1-dual-claim-evidence.proof.ts | `f2cf9100` | :102 | `A('E3 Ban forge · Ban G-R4-5/R4/题域 closed', true);` | 声明钉 | pin 注记 §1.1 |

- **§0.2 弱断言 ×4 逐处锚表**（truthy→升格类型断言·E2EA-05 登记四处全数对齐）：

| # | 锚文件 | blob | line | 原文（逐字） | 处置 |
|---|--------|------|------|--------------|------|
| W1 | apps/web/e2e-ui/recruiting-bound.spec.ts | `2f73a54e` | :77 | `expect(token, '注册后 browser httpOnly cookie 中应存在 Bearer token').toBeTruthy();` | 升格 §1.2（string 类型钉+非空串） |
| W2 | apps/web/e2e-ui/uc018-abandon.spec.ts | `0a2e1c1e` | :22 | `expect(token, '注册后 browser httpOnly cookie 中应存在 Bearer token').toBeTruthy();` | 升格 §1.2（同 W1 形） |
| W3 | apps/web/e2e-ui/uc018-abandon.spec.ts | `0a2e1c1e` | :66 | `expect(ready?.id, '至少一份可用简历').toBeTruthy();` | 升格 §1.2（同形） |
| W4 | apps/web/e2e-ui/uc018-abandon.spec.ts | `0a2e1c1e` | :110 | `expect(interviewId, 'create → interviewId').toBeTruthy();` | 升格 §1.2（同形） |

- **§0.3 范围外普查登记（完备性·本刀零触）**：全树 `A('.*', true)` 扫描余面=①`apps/web/test/web-logic.proof.ts` :1559/:1735（「记账:组件行为面无 DOM 载体」声明钉·web 单测面非 e2e 面）；②`apps/worker/test/r4-wrong-track-adv-live-pg.proof.ts` :361（L1 isolated PG attestation 声明钉·r4 live 独立面）；③`apps/worker/test/r4-*` prove 族恒真钉 ~90 处（R4/MS4/P3/B6/E3/D3/C3/B5/B3 申报族·gap-bug-backlog :642 已登记「异面非同源」）；④`recruiting-bound.spec.ts` :59（审批队列元素查找 truthy）/:333（poll 判别 truthy）——非 Bearer token 登记面·如实登记不扩面（后继刀候选）。计数对齐：登记读数 ×15 = 本表 H1–H15（派单 brief 明列 14 处+「等」·**第 15 处=H6 nhp-fault :503**·同 uc-e2e-001-nhp 家族闭合计数）·out-of-family 三组不计入。
- **§0.4 parity digest 联动核（定稿=免重算）**：`scripts/e2e-parity-check.mjs` 封闭集=`PARITY_SOURCE_PREFIXES ['e2e/','scripts/']`（:24）+`walkE2eFiles` 仅走顶层 `e2e/`（:621-:624）+`CRITICAL_PROVE_SCRIPTS` 两件 → digest 域恰七文件（`ai-docs/testing/e2e-parity-baseline.json` `files` 键亲列：`e2e/full.e2e.ts`/`e2e/helpers/assert.ts`/`e2e/helpers/e2e-helpers.proof.ts`/`e2e/helpers/interview.ts`/`e2e/performance.e2e.ts`/`scripts/bounded-command.proof.mjs`/`scripts/local-e2e-receipt.proof.mjs`）。**本刀 12 触面文件全在 `apps/` 下=封闭集外 → conditionDigest/testCount/assertionCount floors（39/428 effectiveFloors）零联动 → baseline 免重算**（不走「digest 同步重算」分支·机制核亲证：起草席 `node scripts/e2e-parity-check.mjs` EXIT=0 `valid=true fileCount=7 testCount=39 assertionCount=428 allowlistCount=9`）。如实披露：恰因 19 触面在 digest 冻结面外，parity 冻结对本刀域无守护（E2EA-05「冻结缓解删除/削弱面」的覆盖空隙即此）——本刀落码即空隙部分收口；**全树 digest 扩容（apps/** 纳管）=独立刀域，本卷 §1.3 否决**。

## §1-修法（test-only·量级微·升格只增不减·零产品码零迁移零 lockfile 零 env 闸）

### §1.1 恒真 15 处定稿（升格 3 + pin 注记 12）

- **A1（H1 ha-2-drain :104）升格**：`:103` 二次 `r.unregister('k1', e1);` 保留零字节·`:104` 改
  `A('unregister 幂等（不抛·二次移除后 count 仍 0）', r.count() === 0);`
  （`true`→`r.count() === 0`·抛出语义由行使位承底·幂等效果入验·量级微 1 行）。
- **A2（H2 ha-2-drain :296）升格**：改 `A('未排水 readiness ok', okBody.status === 'ok');`
  （`okBody`=:294 `const okBody = await controller.apiReady();` 在场·`status` 系 `'ok'|'draining'|'degraded'|…` 字面量联合·比较类型安全·:295 `assert.deepEqual` 全形钉保留零触·1 行）。
- **A3（H3 trial-grant :267）升格**：`:266` `await h.pool.query(migSql);` 保留零字节·其后插 artifact 存活验证：
  ```ts
  const reapplyPins = await h.pool.query(
    `SELECT to_regclass('public.uq_bucket_trial_one_per_owner') IS NOT NULL
        AND to_regproc('public.gateway_auth_signup') IS NOT NULL AS ok`);
  A('0154/裸 SQL 文本双 apply 不抛（IF NOT EXISTS + CREATE OR REPLACE + REVOKE/GRANT 重申可重跑）',
    reapplyPins.rows[0]?.ok === true);
  ```
  （「可重跑」语义=re-apply 后 0154 两 artifact 仍存活·`to_regclass/to_regproc`+`rows[0]?.ok` 形沿 nhp-adv :296/qbank-retrieval-eval-pg :137 在树先例·+5 行·**EXEC 首跑若此臂红=形状/属主现场漂移·红停上报非放宽**）。
- **pin 注记形（H4–H15 十二处·保留 `A(..., true)` 原文逐字零改）**：每处 A 行上方插一行注释（统一词面·逐字）：
  `// [E2EA-05·assert-strengthen pin] 恒真声明钉：语义=申报入 prove 断言流（非值检查）·删除/弱化=红旗·升格评估见本卷 §1.1`
  （H10 另加半句 `real-HTTP 由 ADV-Inject is(…,409…) 腿承证`；量级微 12 行 comment-only）。

### §1.2 弱断言 ×4 定稿（truthy→类型钉+非空串·playwright `expect(actual, message)` 形制在树承用）

- **W1/W2（tokenOf ×2）**：单 expect 拆双 expect——
  ```ts
  expect(typeof token, '注册后 browser httpOnly cookie 中应存在 Bearer token（string 类型钉）').toBe('string');
  expect(token?.length ?? 0, 'Bearer token 非空串').toBeGreaterThan(0);
  ```
- **W3**：`expect(typeof ready?.id, '至少一份可用简历（id string 类型钉）').toBe('string');` + `expect(ready?.id?.length ?? 0, '简历 id 非空串').toBeGreaterThan(0);`
- **W4**：`expect(typeof interviewId, 'create → interviewId（string 类型钉）').toBe('string');` + `expect(interviewId?.length ?? 0, 'interviewId 非空串').toBeGreaterThan(0);`
- 函数尾 `return token!`/`ready!.id`/`interviewId!` 非空断言符保留零触（运行时钉已前移·TS 收窄面不变）。

### §1.3 否决

1. **删断言/删恒真行**：声明钉是 prove 输出流的申报面（EXIT=0≠covered 语义防 wash·GAP/ honesty 谱系在案）·删除=申报面收窄+pass 计数骤降假信号·否决。
2. **parity 扩容（apps/** 纳入 digest 域）**：`e2e-parity-baseline.json`/allowlist/proof floors 全链重算+`MAX_FILES` 联动·体量与授权均越本刀·登记后继独立刀·本卷否决。
3. **A(...) 签名改形/引入恒真 lint 规则**：改 `A(name, ok)` 契约=全树 ~200 prove 文件锚面重写·量级爆炸·否决（后继可登记 ESLint no-constant-condition 局域候选另议）。
4. **弱断言只改一处/同文件 :59/:333 顺带扩面**：W1–W4 恰四处=登记面·:59/:333 系元素查找/poll 判别不同语义·未登记不扩·否决。
5. **升格臂放宽（红即调形放宽断言）**：A1–A3/W1–W4 任一红=现场漂移信号·红停上报·禁放宽换绿·否决。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 §9+commit message 记）

1. **受影响 proof 十门全绿**（升格臂/注记行所在卷·registration 形）：`pnpm -C apps/api prove:ha2-drain`（A1/A2）·`pnpm trial:grant:prove`（root `:109`·A3）·`pnpm report-retry:http:prove`（root `:166`）·`pnpm uc001:nhp-adv:prove`（root `:203`）·`pnpm uc001:nhp-fault:prove`（root `:205`）·`pnpm uc011:report-refund:http:prove`（root `:152`）·`pnpm uc018:adv:prove`（root `:146`）·`pnpm uc018:abandon:http:prove`（root `:134`）·`pnpm uc019:report-regenerate:http:prove`（root `:162`）·`pnpm r4-eg1-dual-claim:prove`（root `:619`）。
2. **UI 双门**：`pnpm uc018:ui:prove`（=root `:141` chromium·W2–W4）+ `E2E_UI_GREP='C→B' E2E_UI_PROJECT=chromium pnpm e2e:ui:isolated`（W1·run-e2e-ui :210/:301 admin 播入形）。
3. **parity**：`node scripts/e2e-parity-check.mjs` EXIT=0（§0.4 基线读数恒等·免重算亲证）+ `node scripts/e2e-parity.proof.mjs` EXIT=0。
4. **typecheck**：`pnpm turbo typecheck --force` 8/8（0 cached）EXIT=0。
5. **lint**：`pnpm turbo lint --force` 12/12 五值恰等既有基线（0 新增 error）EXIT=0。
6. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 scanned ≤ **2216**（cap=`scripts/ai-docs/public-text-policy.mjs:106` `MAX_FILES = 2_216` 亲证·draft 树预期 **2214**=基线 2213+本卷 1·EXEC 树零新增文件同值·余 2）。
7. **markers 五类**：改动集（12 码面文件+本卷）运行时组装词面 grep 零命中（`['T','O','D','O'].join('')` 等五类+冲突标记对·词面不入卷防自匹配）。
8. **diff 面**：EXEC commit = **12 码面文件**（§0.1/§0.2 blob 表 12 文件·零第 13 码面）+本卷（§9 append）+SSOT append ≤ **15 tracked**·零产品码零迁移零 lockfile·tsbuildinfo 副产 checkout 回滚不入 commit。

**停止条件（命中即停手上报）**：任一升格臂红（A3 `reapplyPins` 形状臂优先核）·docs:check>2216·diff 超 15 tracked·markers 命中·现场 blob/行号漂移超注记级。

## §5 pins（零翻转 + 治理钉新增）

- **既有 pins 零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null（本刀 test-only·旗面/计数面零触）。
- **新增治理钉（本卷立·后继刀承）**：①恒真声明钉=设计意图申报非缺陷（H4–H15 删/弱=红旗）；②可达性钉禁新增（新 prove 恒真行=红停面·E2EA-05 谱系）；③e2e-ui spec 断言最低强度=类型钉+非空串（truthy 裸断言=红停面）；④19 触面在 parity digest 域外=已知空隙（扩容归独立刀）。

## §8 STOP（开工条款 + 翻面形）

- **开工条款**：①本卷=起草落卷·落码权归 EXEC 席（协调方派单后行）·落点不得越 §1 修法三组（A1–A3 升格/H4–H15 注记/W1–W4 升格）与 §1.3 否决面（越则红停回炉）；②pre-exec 双审两独立外席待派（§0 锚表+§0.4 parity 定稿+§1.1 A3 形状臂三处必核）·alone≠dual·Ban self-approve·Dual PASS≠开工。
- **STOP = `executed:awaiting_post_prove_dual` 三处同值**（Status 头+本节+卷尾注·EXEC commit 翻面·前值 `draft:awaiting_pre_exec_dual` 史录·post-prove 双审两独立外席待派）·批表行/Status 终翻面权归协调方·本刀不宣称关闭。
- **停止条件四类**：现场漂移（blob/行号/script 注册名漂超注记级）/机制不满足（pg 多语句形状等现场实测推翻 §1.1 定稿形）/越界需要（扩面 apps/** parity·A 契约改形等 §1.3 域）/验收红不可修。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase 未用。

## §9-rev（pre-exec 快速修订落卷·2026-10-16 rev 席·席1 FAIL P1 门矩阵树口径矛盾定谳+席2 PASS 会签·协调方裁决=席1 P1 成立·本节 append 注记形·与前文冲突处**本节为准**·rev 后待席1 复核确认）

- **rev-0 定谳（P1·门矩阵树口径矛盾）**：原 §2 门 4「8/8」/门 5「12/12」系 tip@`7d71a64f` 树读数·门 6「cap 2216/scanned 2214」系分支@`2c257eb0` 树读数——无单一届树两读同时成立（两树口径混排=门矩阵自相矛盾·席1 亲证·协调方定谳 P1 成立·门计数面按本节校准）。
- **rev-①（席1-①·门 4/门 5 届树口径）**：门 4/门 5 计数判据改「任务数=届树 `pnpm turbo typecheck --dry-run` / `pnpm turbo lint --dry-run` 亲数·验收=EXIT=0 且 0 cached·任务集以届树 dry-run 输出为准」·席1 审计时点读数（分支@`2c257eb0` typecheck 7/lint 10·tip@`7d71a64f` 并线后 8/12）仅系审时值存档·EXEC 以届树亲数为验收·不引旧数。§8 停止条件随补一条：「**门计数按届树口径核·不跨树比数**」。
- **rev-②（席1-②·门 6 届树口径）**：门 6 改「`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 scanned ≤ 届树 `MAX_FILES` 现值」·删「cap 2216/scanned 2214」单值硬编码。现值亲证：分支 `scripts/ai-docs/public-text-policy.mjs:106` `MAX_FILES = 2_216`·tip@`7d71a64f` 同文件 `:108` `MAX_FILES = 2_224`。
- **rev-③（席1-③·§0.3 第五组）**：域外普查补第五组 `packages/db/test` ×4（行号分支届树亲证）：`qbank-control-sec.proof.ts :35`（CS-0 隔离目标实证恒真钉）/`dbhy1.proof.ts :256`（P0 隔离目标实证）/`pool-error-listener.proof.ts :86`（POOL-ERROR-PROCESS-SURVIVES-IDLE-BREAK）/`db-trigfam-unify.proof.ts :350`（StageB 恰只应用 0144）·同「域外异面不计入」口径·§0.3 尾句「out-of-family 三组不计入」随之校准为「**五组不计入**」。
- **rev-④（席1-④·E2EA-05 登记行树位·落 §0/§8）**：注记「E2EA-05 登记行现不在本线分支树（分支 `ai-docs/delivery/gap-bug-backlog.md` grep 零命中亲证）·在 tip@`7d71a64f` 树该文件 `:931`·**随并线入本线**」。并线前本卷对登记行的引用以登记源（line/e2e-audit-backlog `87b8dc22`）为准·并线后以届树行位为准。
- **rev-⑤（席1-⑤·锚校准三件）**：(a) **H12 真值臂行号 :303→:298-:299**——`!hasRegenAttempt && names.includes('status')` 系 :298-:299 两行臂·表达式收束于 :299·:303 实系 PIN console 打印行非断言臂·blob `14fa4d82` :308 锚位不变；(b) **walkE2eFiles 行号 :621-:624→:621-:628**——`isParityE2eFile` :621-:623+`walkE2eFiles` 声明 :625·顶层 `e2e/` resolve :627-:628·仅走顶层面结论不变；(c) **A2 定性校准**——H2 恒真行 :296 紧邻上位 :295 `assert.deepEqual(okBody, { status: 'ok', … })` 全形值检已在场：定性由「恒真行不携检查」校准为「**:295 全形钉已承值检·恒真行=断言流申报重申位**」·§1.1-A2 升格处置不变（强度只增不减·升格语义=对 :295 的重申非新增检查面）·`status` 字面校准：controller ok 臂返回体 status 恒 `'ok'`（`draining`/`degraded` 系 throw 臂异常体·不在返回联合）·`okBody.status === 'ok'` 类型安全成立。
- **rev-⑥（席2-a·pin 注记嵌卷路径）**：§1.1 pin 注记尾词「升格评估见本卷 §1.1」→「升格评估见 `ai-docs/delivery/harness/assert-strengthen-REQUEST.md` §1.1」（码面 comment 内「本卷」无指涉·嵌卷路径逐字落·十二处统一词面随之）。
- **rev-⑦（席2-b·H12 行号）**：与 rev-⑤(a) 同源并落：席2 口径 :303→:299（收束位）·席1 口径 :303→:298-:299（区间）·两读不分歧·记法=区间 :298-:299·收束位 :299。
- **rev-⑧（席2-c·walkE2eFiles 区间）**：与 rev-⑤(b) 同源并落：席2 口径 :621-:628（函数族区间）·席1 口径 :625（声明位）·两读不分歧·记法=区间 :621-:628·声明位 :625。
- **rev-⑨（席2-d·SSOT 后继刀指针）**：SSOT（`ai-docs/delivery/execution-master-checklist.md`）载明后继刀指针：「**`apps/**` digest 扩容刀**——`scripts/e2e-parity-check.mjs` `PARITY_SOURCE_PREFIXES` 增 `apps/` 域·`ai-docs/testing/e2e-parity-baseline.json` files 键/allowlist/proof floors/`MAX_FILES` 全链重算·立项出处=本卷 §0.4 如实披露的 digest 冻结覆盖空隙（§1.3-2/§5-④ 同源三处）」。append 权归协调方——本 rev 注记形不触 SSOT 行（shared SSOT 只读 Ban 在卷·指针载体由此条载明）。
- **rev-终态**：本节纯注记零码面（tracked 改动=本卷 1 文件）·STOP 保持 `draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/卷尾注）·**rev 后待席1 复核确认**·est live=0·markers=0（五类词面+冲突标记对届树 grep 零命中·词面不入卷防自匹配）。

## §9-EXEC（EXEC 落卷·2026-10-16 EXEC 席·重派续作[前席超时中断·HEAD=e9073e94 树净无半成品 commit 亲证=全序重跑]·双审会签有效[席1 FAIL P1→rev `e9073e94` 修订+席2 PASS+rev 复核 CONFIRMED]·协调方授权 EXEC·授权附加[rev 复核席 F1：存档读数 7/10 未复核·门 4/5 判据以届树亲数为准——行使兑现见门 4/门 5]）

- **序1 并线**：fetch 亲证 `origin/feat/mysql-schema-skeleton`=`23e80b40`（届 tip≥23e80b40 **等号成立**亲证·merge-base --is-ancestor 双下界 YES）→merge `cfc06b06` --no-ff 零冲突（merge-tree --write-tree 预演 EXIT=0·23 files 携入·12 触面零交叠 stat 亲证·⛔pull --rebase 未用）。
- **序2 §0 全量重 pin**：**12/12 blob 恒等**（§0.1/§0.2 表 12 值届树逐点亲证=并线零触面兑现）·**19/19 点位行号恒等零漂移**·rev-⑤(a) H12 真值臂 :298-:299 收束 :299 亲证·rev-⑤(b) walkE2eFiles 区间亲证·rev-⑤(c) :295 `assert.deepEqual` 全形钉在场+A2 机制亲证（fake apiReady 返三值枚举 `'ok'`·controller 组全形返回体）·cap 现值亲证=`public-text-policy.mjs:110` `MAX_FILES = 2_232`（并线携入 cap-sanction-2232·rev-②「届树现值」判据行使）·E2EA-05 登记行随并线入树 `gap-bug-backlog.md:931`（rev-④ 预言兑现）。
- **序3 落码**：恰 12 码面 19 点位=A1 ha-2-drain :104 `true`→`r.count() === 0`+A2 同卷 :296 `true`→`okBody.status === 'ok'`+A3 trial-grant :267 后插 `reapplyPins`（`to_regclass('public.uq_bucket_trial_one_per_owner')`/`to_regproc('public.gateway_auth_signup')`+`rows[0]?.ok === true`·+5 行）+W1 recruiting-bound :77/W2 uc018-abandon :22/W3 :66/W4 :110 双 expect 升格（typeof==='string'+length>0）+H4–H15 十二处行上 pin 注记（rev-⑥ 嵌卷路径统一词面·H10 另加 real-HTTP 承证半句）·net **+27/−7**·零产品码零迁移零 lockfile 零 env 闸。
- **序4 门矩阵届实跑**（EXIT 原值·2026-10-16 本席亲跑）：
  - **门1 十门=七绿+三红（红均他刀基线·单列承登非本刀验收失败）**：绿=ha2-drain EXIT=0 PASS=47 FAIL=0（届树亲数·授权语存档 58 系他树读数·rev-① 不跨树比数行使）+trial-grant EXIT=0 27 全绿（**A3 `reapplyPins` 形状臂 PASS=红停面未触发**·0154 两 artifact 存活承证）+report-retry EXIT=0 38 全绿+uc011 EXIT=0 53 全绿+uc018:adv EXIT=0 76 全绿+uc018:abandon:http EXIT=0 46 全绿+uc019 EXIT=0 35 全绿；红=①`uc001:nhp-adv` EXIT=1+②`uc001:nhp-fault` EXIT=1——**裸基线亲证**（stash 本刀 12 面后重跑同红：begin→409 `candidate_route_undecided/profile_unavailable` 级联 LEDGER-SNAP/POSITIVE·与纯注记行无涉·并线携入基线红·修法越本刀触面=留协调方/后继刀）·③`r4-eg1` EXIT=1 恰 2 FAIL 均 E0 存档路径锚（ptp-archive `426e0b28` git mv 3025 件迁 `harness/g-r4-5-eg1-eg2-true-evidence-impl.md`→`receipts/archive/2026-09-batch23/harness/`·proof `harnessPath` 仍指旧位·该文件 HEAD/`e9073e94` 双树 absent 机证=**并线前已红**·本刀 E3 三注记臂全 PASS）。
  - **门2 UI 双门=环境能力顶未跑成**：`run-e2e-ui.mjs:53` 硬闸 `MODEL_API_KEY` 缺失（`live_provider_key_missing`·:26 在册注记「Key-unset 快速失败必达不被 .env 静默绕过」+fake 模式禁令）·EXEC 零 secrets·如实披露留 post-prove 席在供钥宿面行使。
  - 门3 parity：`e2e-parity-check.mjs` EXIT=0（`valid=true fileCount=7 testCount=39 assertionCount=428 effectiveFloors 39/428`·§0.4 档案读数恒等=**封闭集零联动免重算亲证**）+`e2e-parity.proof.mjs` EXIT=0（22 scenarios）。
  - 门4 typecheck（rev-① 届树口径）：dry=json 亲数 plan 13 面（`//#typecheck`+12 包·其中 config/db-mysql/errors/qdrant-store/ai-graphs 五包无 script 实跑过滤=**8 面可执行**）→`turbo typecheck --force` EXIT=0 **`Tasks: 8 successful, 8 total`·`Cached: 0 cached, 8 total`**（28.2s）。
  - 门5 lint（同口径）：plan 13 面→12 面可执行→`turbo lint --force` EXIT=0 **`12 successful, 12 total`·`Cached: 0 cached`**·全包 0 errors·五值恰等既有基线 root 5235/web 601/api 1421/db 1042/worker 954（ai-runtime 628 同档·31.1s）。
  - 门6 docs:check：EXIT=0 **scanned 2223 ≤ 届树 MAX_FILES 2232**（余 9·谱系=并线届树 2222+本卷 §9-EXEC append 零新增受管·SSOT append 零新增受管）。
  - 门7 markers：改动集 27 新增行五类词+冲突标记对**零命中** EXIT=0（node 运行时组装词面·词面不入卷防自匹配）。
  - 门8 diff 面：**12 码面**（零第 13 码面）+本卷（§9-EXEC append+STOP 三处翻面）+SSOT append=`14 tracked ≤ 15`（零新增受管文件·tsbuildinfo 门副产 checkout 回滚不入卷·r4-eg1 证明收据 untracked 不入卷）。
- **停止条件核**：§2 五条逐条核=**全未触发**（升格臂 A1/A2/A3+W1–W4 全绿/docs≤cap/diff≤15/markers 零命中/blob 行号零漂移）·门 1 三红系与所改无关基线红（stash 裸基线亲证+双树 absent 机证）·UI 环境顶如实披露。
- **STOP 翻面**：`draft:awaiting_pre_exec_dual` → **`executed:awaiting_post_prove_dual`** 三处同值（Status 头/§8/卷尾注）·post-prove 双审两独立外席待派（届时建议补核：三门基线红归因+UI 双门供钥宿面行使）·批表行/Status 终翻面权归协调方·本刀不宣称关闭。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase 未用。

---

*ASSERT-STRENGTHEN REQUEST · 2026-10-16 起草 · **`executed:awaiting_post_prove_dual`**（三处同值：Status 头/§8/本行·post-prove 双审待派·前值 draft:awaiting_pre_exec_dual 史录）· base `feat/mysql-schema-skeleton` @`2c257eb0`（届条件 tip≥92086586 等号成立亲证）· 分支 `line/assert-strengthen` · 工作树 `meetwise-as` · 立项出处=E2EA-05（gap-bug-backlog·猎杀席 ×15 读数+弱断言四处·本卷 §0 回填逐点位清单）· 定稿=恒真 15 处（升格 3：ha-2-drain :104/:296+trial-grant :267·声明钉 pin 注记 12）+弱断言 4 处升格（recruiting-bound :77+uc018-abandon :22/:66/:110）+parity digest 免重算定稿（§0.4·七文件封闭集外零联动）· 量级微=net ≈+30 行 test-only 零产品码 · est live=0 · markers=0 · ⛔push ⛔merge 主线 ⛔force push*
