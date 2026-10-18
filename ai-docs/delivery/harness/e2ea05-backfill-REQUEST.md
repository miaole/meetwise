# E2EA-05 恒真清单回填 REQUEST（docs-only·恒真 ×15 逐点定性+漏网扫描·零码面·量级微）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve · est live=0 · actualSpendCny=null · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（tree 级 @ `c4bd89132`·现树逐处亲证·2026-10-16）

- **基线**：`origin/feat/mysql-schema-skeleton` @ `c4bd89132`（fetch 后 rev-parse 亲证·**届条件 tip≥`7c602df02` 派单下界等号成立**：merge-base --is-ancestor YES 亲跑）。支线 `line/e2ea05-backfill`（worktree `meetwise-eb` 亲立·upstream 随建随设防误推注意·⛔push）。
- **登记出处**：`ai-docs/delivery/gap-bug-backlog.md:931` E2EA-05 行（「另有恒真 `A(...,true)` ×15（猎杀席扫描读数·登记席未复现逐点位清单）……逐点清单归猎杀席卷/后继刀回填」——**本卷即该回填刀**·登记行翻面/销案权归协调方·本卷不自翻）。
- **先期刀承续**：`ai-docs/delivery/harness/assert-strengthen-REQUEST.md`（恒真治理刀·已 nail）——升格 3（H1/H2/H3）+弱断言 4（W1–W4）+声明钉 pin 注记 12（H4–H15）已全部落树亲证（EXEC `f6d068823`·nail `a0b013053`·主线携入 commit `1b0136676`）。先期刀 §0.1 已有 15 处锚表，**残面=登记行明载的「逐点清单回填」在 E2EA-05 行侧无指针载体+现树态逐点定性+漏网补扫**——本卷以现树 `c4bd89132` 全量重证回填。

### §0.1 恒真 `A(...,true)` ×15 逐点清单（现树 `c4bd89132` 亲证·逐点定性）

| # | 文件 | 原登行 | 现树行 | 现树态（亲证逐字） | 逐点定性 | 处置现状 |
|---|------|--------|--------|---------------------|----------|----------|
| H1 | apps/api/test/ha-2-drain.proof.ts | :104 | :104 | `A('unregister 幂等（不抛·二次移除后 count 仍 0）', r.count() === 0);` | 可达性钉→已升格（幂等效果入验） | **升格已落**·true 面已离 |
| H2 | apps/api/test/ha-2-drain.proof.ts | :296 | :296 | `A('未排水 readiness ok', okBody.status === 'ok');`（:295 `assert.deepEqual` 全形钉在位） | 可达性钉→已升格（重申形·rev-⑤(c) 口径） | **升格已落**·true 面已离 |
| H3 | apps/api/test/trial-grant.proof.ts | :267 | :270-271 | `A('0154/裸 SQL 文本双 apply 不抛（…重申可重跑）', reapplyPins.rows[0]?.ok === true);`（:267-269 `to_regclass`/`to_regproc` 存活臂在位·A 在 :270-271） | 可达性钉→已升格（artifact 存活入验） | **升格已落**·true 面已离 |
| H4 | apps/api/test/report-retry-http.proof.ts | :269 | :270 | `A('honesty: HTTP prove 绿 ≠ 全链路 covered（钉语义翻转+频控行使 only）', true);` | 声明钉（honesty 申报·防 EXIT=0→covered wash） | pin 注记在位·保留 |
| H5 | apps/api/test/uc-e2e-001-nhp-adv.proof.ts | :465 | :466 | `A('V3 JD/quiz text ingress = absent (documented; no invent)', true);` | 声明钉（documented-absence 申报·无值可检） | pin 注记在位·保留 |
| H6 | apps/api/test/uc-e2e-001-nhp-fault.proof.ts | :503 | :504 | `A('F3 Ban-borrow disclosure recorded (Y/AB/AG/report:prove ≠ this case)', true);` | 声明钉（:499-:502 `E('F3-BAN',…)` 收据打印的断言流登记形） | pin 注记在位·保留 |
| H7 | apps/api/test/uc-e2e-011-report-refund-http.proof.ts | :351 | :352 | `A('H5 honesty: EXIT=0 ≠ UC-E2E-011 covered / ≠ ADV covered', true);` | 声明钉（:350 真值臂紧邻在上） | pin 注记在位·保留 |
| H8 | 同上 | :363 | :365 | `A('honesty: HTTP prove 绿 ≠ UC-E2E-011 covered（mouth landed ≠ covered-lift）', true);` | 声明钉（GAP pins 打印块收尾申报） | pin 注记在位·保留 |
| H9 | apps/api/test/uc-e2e-018-adv.proof.ts | :381 | :382 | `A('honesty: ADV prove 绿 ≠ UC-E2E-018 covered（§1.1 partial retained · ADV alone ≠ covered）', true);` | 声明钉 | pin 注记在位·保留 |
| H10 | 同上 | :382 | :384 | `A('honesty: Ban invent green · real HTTP hit abandon route', true);` | 声明钉（real-HTTP 由 ADV-Inject 409 腿承证·指向申报） | pin 注记在位·保留（另携承证半句） |
| H11 | apps/api/test/uc-e2e-018-user-abandon-http.proof.ts | :264 | :265 | `A('honesty: HTTP prove 绿 ≠ UC-E2E-018 covered（…UI alone ≠ covered）', true);` | 声明钉 | pin 注记在位·保留 |
| H12 | apps/api/test/uc-e2e-019-report-regenerate-http.proof.ts | :308 | :309 | `A('honesty: HTTP prove 绿 ≠ UC-E2E-019 covered（GAP pins 已印）', true);` | 声明钉（:298-:299 真值臂在位·rev-⑤(a)/rev-⑦ 口径） | pin 注记在位·保留 |
| H13 | apps/worker/test/r4-eg1-dual-claim-evidence.proof.ts | :100 | :101 | `A('E3 ≠ claim EG1 closed from emit alone', true);` | 声明钉（E2 段八件旗面真值臂全在） | pin 注记在位·保留 |
| H14 | 同上 | :101 | :103 | `A('E3 ≠ idle 5×meta as close', true);` | 声明钉 | pin 注记在位·保留 |
| H15 | 同上 | :102 | :105 | `A('E3 Ban forge · Ban G-R4-5/R4/题域 closed', true);` | 声明钉 | pin 注记在位·保留 |

- **行号漂移全登记**：H4–H15 现树行=原登行+上位钉注记累计（+1 至 +3·如 H15 :102→:105=自身钉+H13/H14 两钉累计）·diff 对 `2c257eb0` 面亲证=12 码面恰 12 钉行零他行（adv 文件 +2、refund 文件 +2、eg1 文件 +3、余五文件各 +1）·**内容零漂**。计数对齐：登记读数 ×15 = H1–H15（第 15 处=H6 nhp-fault·先期同口径闭合计数）·3 已离 true 面+12 在面=现树 E2EA-05 谱系恒真残余 **12 处全数声明钉**。

### §0.2 漏网点登记 ×7（先期登记面外·本卷补扫新增+rev 席双审定谳增补 M7·逐点定性）

猎杀席卷原口径=单行 `A('.*', true)` grep·先期 §0.3 域外普查组①–⑤未列下列七处。**七处出生均早于 E2EA-05 登记（非治理刀后新增·系枚举/口径漏计）**·定性全数=声明钉族（各有上位或下位真值腿承证）：

| # | 文件:行 | 原文（逐字·多行形折行以 `\n` 示） | 逐点定性 | 建议处置（归后继刀·本卷零码面） |
|---|---------|-----------------------------------|----------|--------------------------------|
| M1 | packages/db/test/tenant-enforcement.proof.ts:301 | `A('optional PG path skipped (no DATABASE_URL / PG* target) — unit prove sufficient', true);` | 声明钉（optional-PG skip 臂申报·分支条件 `!hasUrl && !hasComponents` 即真值面） | pin 注记评估（同 H4–H15 形） |
| M2 | packages/db/test/privacy-authorization.proof.ts:122 | `A('catalog gate: privacy_issuer/privacy_guard_owner 非登录/非继承/非超管且 membership 封闭(L11)', true);` | 声明钉（:121 `assertPrivacyAuthorizationIssuerIdentity(admin)` 真检紧邻在上·断言流登记形=H6 同构） | pin 注记评估 |
| M3 | apps/worker/test/nhp-r4-adv-covered.proof.ts:172-173 | `A('C4 composition: covered prove EXIT=0 ≠ matrix covered ≠ R4 closed',\n  true); // narrative pin; matrix assert above keeps partial` | 声明钉（:170 `liveExit === 0`+:171 `unitExit === 0` 真值臂紧邻在上·行尾注释自承 narrative pin） | pin 注记评估 |
| M4 | apps/worker/test/r2-p-fake-route-classify.proof.ts:122-123 | `A('F4 inventory: no alternate apps production classify path without MODEL-OP',\n  true); // filled by scan below` | 声明钉（「filled by scan below」·:126+ P-FAKE 真检腿承证·同区 :118-:120 F3 真值臂在案） | pin 注记评估 |
| M5 | apps/worker/test/r4-wrong-track-adv-live-pg.proof.ts:632-633 | `A('L8 this prove must not claim R4 closed / covered / HA',\n  true); // enforced by printed honesty summary below` | 声明钉（下位 honesty summary 打印承证·同文件 :361 L1=先期组②已登·L8 系同文件第二点漏计） | pin 注记评估 |
| M6 | packages/domain/test/r4-p-planner.proof.ts:266-267 | `A('T5 note: REAL-WIRE may wire dispatch (unit prove does not require zero call sites)',\n  true, \`callSites=\${dispatchCalls}\`);` | 声明钉三参形（第二参恒真+第三参 detail 携读数·「T5 owned by REAL-WIRE-IMPL」归属注记·packages/domain 为先期扫描未报告目录） | pin 注记评估（三参形需 A 契约核） |
| M7 | packages/db/test/tenant-enforcement.proof.ts:321-322 | `A('optional PG path unavailable (unit prove still green)', true,\n  String((e as Error).message).slice(0, 120));` | 声明钉族（catch 臂 :319-322 skip 申报·detail 折行三参形·真值腿=同函数 try 臂 :314-315 `bound === 'tenant-proof-user'` 真检在位·与 M1 同函数 `optionalPgAsPrincipal` 同族） | pin 注记评估（与 M1 同族·三参形需 A 契约核） |

### §0.3 治理刀后新增面扫描（nail `a0b013053`..HEAD·结论=零新增）

- 窗内被改 proof 面 9 文件（ag11-settle-relax / graph-fence-write / model-invocation-reconcile / model-op00-db-state / reserve-renew / tokenstream-progress / dbhy1 / interview-privacy-read-tier / uc-e2e-002-cross-device-lease）**无一含新增 `A(...,true)` 行**（全量重扫亲证）。
- 唯一行漂=packages/db/test/dbhy1.proof.ts :256→:258（`09fb031c5` +2 行=注记+登记数组项·A 行内容零变·diff 亲证）——先期组⑤ dbhy1 行号随之校准。
- §5 治理钉②「可达性钉禁新增」窗内零违例=承证在卷。

### §0.4 现树全域读数（口径承登）

单行形 `A('…', true)`=**98**（apps/api 9=H4–H12+apps/web 2=组①+apps/worker 81=r4 申报族③[含组②:361]+packages/db 6=组⑤ 4+漏计 M1/M2）·折行/多行形=**5**（M3–M7·其中三参形 ×2=M6/M7）·packages/db 域计 **7**=组⑤ 4+漏计 M1/M2/M7·**全域恒真形读数 103**（rev 席双审定谳后届树重扫亲证·M7 原漏计=折行三参形逃逸单行 grep（无闭括号）与「引号\n true」多行两口径）。先期「~90」系族级约数·本卷承登现值 81 不追史差。`e2e/` 顶层与 `scripts/`（parity digest 域七文件）**零命中**=digest 冻结域无恒真面·先期 §0.4 定稿免重算承续成立。

## §1-修法（docs-only·量级微·码面零触）

1. **清单文档化=本卷自身**：§0.1 十五处逐点定性锚表+§0.2 漏网七处登记表落 `ai-docs/delivery/harness/e2ea05-backfill-REQUEST.md`·恰 1 tracked·E2EA-05 登记行的「逐点清单回填」欠账由此有指针载体（登记行本体注记/翻面权归协调方·本卷不动 backlog）。
2. **漏网扫描已行使**：单行+多行（「引号\n true」折行形）+**折行三参形（M6/M7 形·rev 席双审定谳后已行使口径·补扫 M7 入 §0.2）**+双引号（零命中）+`A(` 跨行开形全口径扫毕·七处漏网入 §0.2·治理刀后窗口 §0.3 零新增承登。
3. **后续指针**：M1–M7 处置（pin 注记/升格评估）+H4–H15 保留态维持·均归协调方/后继刀·本卷不落码。

## §1.3 否决

1. **十五处断言全升格=大改·否决**：12 处声明钉升格需逐处设计真值臂+触 9 码面+十门 proof 重跑+pass 计数语义再扰动·与先期刀 §5 治理钉①「声明钉=设计意图申报非缺陷」直接冲突·升格评估归逐点后继另议。
2. **漏网七处直接落码（pin/升格）·否决**：越本刀 docs-only 域·且 M6/M7 三参形需 A 契约核先行的·登记归后继。
3. **全树 r4 族 81 处逐点列表化·否决**：族级承登+计数口径足矣·体量爆炸无增益。
4. **史读数对账（~90 vs 81）·否决**：洗史面·不追踪史读·现值承登。
5. **E2EA-05 登记行自行翻面/销案·否决**：翻面权归协调方。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 commit message 记）

1. **markers**：改动集新增行五类运行时组装词面+全树行首冲突标记对 grep **零命中** EXIT=0（词面不入卷防自匹配）。
2. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 scanned ≤ 届树 `MAX_FILES` 现值 **2248**（`scripts/ai-docs/public-text-policy.mjs:114` 亲证·draft 树预期 **2245**=基线 2244+本卷 1·余 3）。
3. **diff 面**：EXEC commit 恰 **1 tracked**（本卷）·零码面零产品码零迁移零 lockfile 零 env 闸。

**停止条件**：markers 命中·docs:check>2248·diff 超 1 tracked·现树锚漂移超注记级（H1–H15/M1–M7 任一行内容变）。

## §5 pins（零翻转·承续）

- 既有 pins 零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null（本卷 docs-only 零触）。
- 治理钉承续：①声明钉=设计意图申报非缺陷（H4–H15+M1–M7 同族适用·删/弱=红旗）；②可达性钉禁新增（新 prove 恒真行=红停面·§0.3 窗内零违例承证）；③parity digest 域零恒真面承证（§0.4·扩容刀指针不变）。

## §8 STOP

- **开工条款**：本卷=起草落卷·EXEC（若派）仅限本卷 1 tracked 文件域+§2 三门·越 §1.3 否决面即红停回炉；pre-exec 双审两独立外席待派（§0.1 现树行号+§0.2 七处漏网定性+§0.3 零新增结论三处必核）·alone≠dual·Ban self-approve。
- **STOP = `draft:awaiting_pre_exec_dual` 三处同值**（Status 头+本节+卷尾注）·翻面权归协调方·本刀不宣称关闭。
- 卫生：est live=0（docs-only 零外呼零 secrets）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase 未用。
- 卫生异常登记（rev 席承登）：双审窗内 worktree `meetwise-eb` 被外部 checkout 一件（HEAD detached @ `6308bc348`）——`line/e2ea05-backfill` ref 完好零损（同指 `6308bc348` rev-parse 亲证·工作树 clean 零丢面）·建议双审窗内独占管护工作树防再发。

### §9-rev 修订注记（rev 席·双审双 FAIL 互盲收敛 M7·文面修订零码面·2026-10-16）

- **定谳**：M7=packages/db/test/tenant-enforcement.proof.ts:321-322 折行三参形（`A('optional PG path unavailable (unit prove still green)', true,`+detail 折行）·逃逸单行 grep（无闭括号）与「引号\n true」多行两口径·全域实为 **103 非 102**·定性=声明钉族（catch 臂 skip 申报·真值腿 try 臂 :314-315 `bound === 'tenant-proof-user'`·与 M1 同函数同族）。
- **五条落点**：①§0.2 ×6→×7 增 M7 行（行号/原文/定性=声明钉族 catch 臂 skip 申报·真值腿·处置=pin 注记评估与 M1 同族）②§0.4 全域读数 102→103+packages/db 6→7=组⑤ 4+漏计 M1/M2/M7+补口径「三参形 ×2（M6/M7）」③卷尾注「六处」→「七处」读数 103 随改（commit message rev 形同改）④§1.2「全口径扫毕」增补折行三参形已行使口径⑤§8 卫生段登记双审中 worktree 被外部 checkout 异常一件（ref 完好零损·建议双审窗内独占管护）。
- **届树重扫亲证**（@ `6308bc348`·rev 席亲跑）：单行形 98（api 9/web 2/worker 81/db 6）+折行形 5（M3–M7·三参形 ×2）=**103**·`e2e/`+`scripts/` 零命中·双引号形零命中·M1–M6 锚零漂（§0.2 六处原文逐字复核）。
- **STOP 保持 = `draft:awaiting_pre_exec_dual` 三处同值**·rev 仅文面（恰 1 tracked 同文件）·零码面·翻面权归协调方。

### §9-rev2 修订注记（re-dual 单点修订席·席1 FAIL 残 P1×1 收敛+席2 PASS·文面恰 3 处零码面·2026-10-16）

- **re-dual 双席结论引用**：pre-exec 双审重开两独立外席——席1 **FAIL 残 P1×1**（即落点①·余零新 FAIL）·席2 **PASS**（携两观察·落点③承登）·**五条旧 FAIL 全核销**（§9-rev 五条落点逐条复核已落卷）·**103 独立重算双席零差值**（单行 98+折行 5 两席各自独立重算一致）。
- **三条落点**：
  1. **P1**：§0.1 H3 行「现树行」`:267-268`→`:270-271`+同行括注「（:267-270 `to_regclass`/`to_regproc` 存活臂在位）」→「（:267-269 存活臂在位·A 在 :270-271）」——实位亲证 `apps/api/test/trial-grant.proof.ts:270-271`=`A('0154/裸 SQL 文本双 apply…')` 两参折行形·:267-269 为 `const reapplyPins` SQL 臂（存活检）·该文件自 `a0b013053` 起至 HEAD 零 diff 亲证·**非窗内漂移系起草错登**。
  2. **P2**：§9-rev 届树重扫行「§0.2 五处原文逐字复核」→「六处」（M1–M6 计六处·计数笔误）。
  3. **P2 观察**（席2 两观察承登·不改 §0.1）：（a）H6 定性栏承证范围指针建议后继刀校 :499-:502；（b）M7 后继 pin 注记评估刀应附 `catch(e)` 宽捕无类型甄别语义观察（try 臂内非连接类错误亦归 skip 申报·:320 注释自承设计意图·pin 落码时评估类型甄别）。
- **届树实测**（rev2 席亲跑）：markers 改动集新增行字面探针零命中+全树行首冲突标记对零命中 EXIT=0·docs:check EXIT=0 scanned **2245**≤**2248** 余 3·diff 恰 1 tracked（本卷同文件）零码面。
- **STOP 保持 = `draft:awaiting_pre_exec_dual` 三处同值**·rev2 仅文面（恰 1 tracked 同文件）·零码面·翻面权归协调方。

---

*E2EA-05-BACKFILL REQUEST · 2026-10-16 起草 · 2026-10-16 rev 修订（双审双 FAIL 互盲收敛 M7·§9-rev 五条落点·读数 103）· **`draft:awaiting_pre_exec_dual`**（三处同值：Status 头/§8/本行）· base `feat/mysql-schema-skeleton` @`c4bd89132`（届条件 tip≥`7c602df02` 等号成立亲证）· 分支 `line/e2ea05-backfill` · 工作树 `meetwise-eb` · 立项出处=gap-bug-backlog:931 E2EA-05「逐点清单归猎杀席卷/后继刀回填」残面（先期刀 assert-strengthen 已 nail·清单回填无刀认领）· 定稿=十五处逐点定性锚表（3 升格已落+12 声明钉保留·现树全证）+漏网七处登记（M1–M7·枚举/口径漏计非新增·全域恒真形读数 103=单行 98+折行 5）+治理刀后零新增承登（§0.3）· 量级微=恰 1 tracked docs-only 零码面 · est live=0 · markers=0 · ⛔push ⛔merge 主线 ⛔force push*
