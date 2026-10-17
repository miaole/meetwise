# ASSERT-STRENGTHEN 断言强度治理小刀 REQUEST（test-only·E2EA-05 跟进·恒真升格+弱断言收紧·零产品码）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve · est live=0 · actualSpendCny=null · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

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
- **STOP = `draft:awaiting_pre_exec_dual` 三处同值**（Status 头+本节+卷尾注）→ EXEC commit 翻 `executed:awaiting_post_prove_dual` 三处同值（post-prove 双审两独立外席待派）·批表行/Status 终翻面权归协调方·本刀不宣称关闭。
- **停止条件四类**：现场漂移（blob/行号/script 注册名漂超注记级）/机制不满足（pg 多语句形状等现场实测推翻 §1.1 定稿形）/越界需要（扩面 apps/** parity·A 契约改形等 §1.3 域）/验收红不可修。
- 卫生：est live=0（全门本地静态/隔离·零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase 未用。

---

*ASSERT-STRENGTHEN REQUEST · 2026-10-16 起草 · **`draft:awaiting_pre_exec_dual`**（三处同值：Status 头/§8/本行·pre-exec 双审待派）· base `feat/mysql-schema-skeleton` @`2c257eb0`（届条件 tip≥92086586 等号成立亲证）· 分支 `line/assert-strengthen` · 工作树 `meetwise-as` · 立项出处=E2EA-05（gap-bug-backlog·猎杀席 ×15 读数+弱断言四处·本卷 §0 回填逐点位清单）· 定稿=恒真 15 处（升格 3：ha-2-drain :104/:296+trial-grant :267·声明钉 pin 注记 12）+弱断言 4 处升格（recruiting-bound :77+uc018-abandon :22/:66/:110）+parity digest 免重算定稿（§0.4·七文件封闭集外零联动）· 量级微=net ≈+30 行 test-only 零产品码 · est live=0 · markers=0 · ⛔push ⛔merge 主线 ⛔force push*
