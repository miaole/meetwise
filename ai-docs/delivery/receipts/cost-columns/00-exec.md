# COST-COLUMNS EXEC 收据 — 00-exec（价格列刀·0204 熔单+TS 结算贯通+伴生面·2026-10-15）

**授权链**：rev2 落卷 `74d7e0d6` → pre-exec 窄域复审 PASS `agent_02a7bfd0` → 协调方 EXEC 明示授权（0204 立项·0203 归 reconcile-retry 已 nail 落主线链 203 头 0203·本刀 0204 连续合法）→ EXEC 本卷。
**并线**：`git merge --no-ff feat/mysql-schema-skeleton` → **`0b12224e`**（支线 tip `575b428e`=origin tip 亲证·merge-base `109e3eb1`·merge-tree 预演零冲突（conflict-marker 计数 0）实测零冲突零 dual-keep 需·⛔pull --rebase 未用·⛔force push）。**链顶亲数**：merge 后 `ls packages/db/migrations/*.sql | wc -l`=**203**·头 `0203_gateway_model_invocation_backlog.sql`·uniqueness `files=203 violations=0` EXIT=0 → 件① 占 **0204** 恰=203+1 连续合法确认。
**工作区**：`meetwise-ccl`（line/cost-columns）·pnpm install --frozen-lockfile EXIT=0（23.2s·lockfile 零改亲证）·est live=**0**（门矩阵 proof 全离线脚本+隔离容器·零模型外呼零 secrets 零生产操作·`actualSpendCny=null`）·`.env*` ABSENT 双向记录（ls no matches）。

## 一、§0 全量重 pin（立项日对 merge 树 `0b12224e` 实测）

| 锚 | 卷 pin blob | 实测 blob | 结论 |
|---|---|---|---|
| `0033_ai_cost_governance.sql` | `2cce4019` | `2cce4019` | 同·:7-17 价本/:12 单价列/:16 PK 恒等 |
| `0036_ai_text_cost_governance.sql` | `68770a26` | `68770a26` | 同·:184 REVOKE 五参原形逐字亲证 |
| `0083_ai_text_cost_price_revision_binding.sql` | `fe6d5de1` | `fe6d5de1` | 同·:66 %ROWTYPE/:88-94 双价捕获恒等·:66-68 绑定谓词 cached 失明=设计恒等亲证 |
| `0188_ag11_cost_reserve_least_and_settle_relax.sql` | `c06ef6d5`（382 行） | `c06ef6d5`（382 行） | 同·:282-344 六参承载底本/:287 SECURITY DEFINER/:353-372 scoped+ACL 逐字亲证 |
| `ai-cost-governance.ts` | `54302901`（106 行） | `54302901`（106 行） | 同 |
| `invoke.ts` | `44e137f6`（1204 行） | `44e137f6`（1204 行） | 同·:1038/:1145 两调用点/validUsage :469-482/:738/:1201 注记全亲证 |
| `model-cost-governance.ts` | `f777c642`（202 行） | `f777c642`（202 行） | 同·:31-40/:46-47/:114-117/:179-193 全亲证 |
| `ag11-settle-relax.proof.ts` | `9284e4a0`（324 行） | `9284e4a0`（324 行） | 同·8 调用点恰 :134/:155/:174/:191/:231/:252/:273/:274（:26 import 非调用）·8 臂断言行 α:158/β:177/β-0:193/γ:208/δ:234/ε:262/ζ:287/η:307·η :295 五参串全亲证 |
| `rag-cost-governance.ts` | `84ea559a` | `84ea559a` | 同（出界零触） |
| `model-usage-cache-observe.proof.ts` | `245d6db8` | `245d6db8` | 同（28 臂·zero touch 保持） |
| `0144_db_trigfam_unify.sql` | `29afdf46` | `29afdf46` | 同·:554-566 纯委托亲证（reserve 体改经此自动贯通） |
| `public-text-policy.mjs` | `01749caf` | `01749caf` | 同·:75 区 MAX_FILES 现值 **2144**（见偏离①） |
| `run-e2e-isolated.mjs` | 行锚（blob 未钉） | `e69e317a`（3189 行） | 条目集亲测=**13 命中/恰 12 条目·无第 13 条**（预授权条款不触发）·七处区间漂移如实更锚（§0.1 行随 pin 更·其中 :245-:256/:402-:417 系 P2-2 校正） |

**§0.0 在飞复扫**：全部分支（local+remote·排除本席分支）`git rev-list HEAD..b -- <五文件>` 逐支亲测——**零非吸收命中**（残枝全被吸收·无现场漂移）。
**复审 P2 随 pin 落**：P2-1 机制注记=**0073:1342 `ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`**（全局默认特权按创建角色收回 PUBLIC EXECUTE·迁移角色所建函数 DROP+CREATE 实际不获 PUBLIC）——件① 第三语句 REVOKE 仍系正确显式收敛（默认特权按创建角色生效非表级恒等·app_role 面+非迁移角色创建路径的显式 fail-closed 不依赖默认特权推导·0036:184 原设 ACL 随 DROP 湮灭须显式补发）；注记已落 0204 文件头+本收据。P2-2 两区间端点 :402-417/:245-256 已对树亲证校正落卷（§0.1 行）。

## 二、门矩阵十二门全表（EXIT 原值）

| # | 门 | 命令 | 结果 | 关键行 |
|---|---|---|---|---|
| 1 | migrate:prove | `pnpm migrate:prove` | **EXIT=0 绿** | `✓ 迁移运行器 全部通过`·隔离链 `applied=204 skipped=0`（ag11 隔离 run 亲证）·链头 0204 |
| 2 | drift:prove | `pnpm drift:prove` | **EXIT=0 绿** | `✓ schema 无漂移`（豁免 2 项登记面恒等） |
| 3 | uniqueness | `node scripts/check-migration-version-uniqueness.mjs` | **EXIT=0 绿** | `files=204 violations=0 exemptions=0143,0152,0160` |
| 4 | ag11-settle:prove | `pnpm ag11-settle:prove` | **EXIT=0 绿·12/12 臂** | 既有 8 臂（α/β/β-0/γ/δ/ε/ζ/η）断言零改全绿（η 六参重钉后绿）+新增 ι/κ/λ/μ 全绿（ι cached=0 恒等 100·κ 捕获 400_000+分账 88·λ NULL 回退 100·μ cached>input raise 原码）·`✓ AG-11 settle 放宽体十二臂行为级补证全部通过` |
| 5a | model-op00:prove | `pnpm model-op00:prove` | **EXIT=0 绿** | `✓ MODEL-OP-00 …全部通过` |
| 5b | model-op02:prove | `pnpm model-op02:prove` | **EXIT=0 绿** | `✓ MODEL-OP-02 …全部通过` |
| 5c | model-op02-endpoint-partition:prove | `pnpm model-op02-endpoint-partition:prove` | **EXIT=0 绿** | `✓ AG-08 端点分域相位+对表全部通过` |
| 5d | failover:prove | `pnpm failover:prove` | **EXIT=0 绿** | `✓ failover：仅发送前选健康端点…` |
| 5e | model-cost:isolated:prove | `pnpm model-cost:isolated:prove` | **EXIT=1 红（基线同红·非本刀引入）** | 败臂=`准入超时后迟到取得的 lease 会自释放…`（1 项失败）·**stash 对照**（`git stash push --include-untracked`→基线 `0b12224e` 恰一次）同臂同数 EXIT=1·真实时钟竞态臂（admit 60ms vs timeout 35ms vs 观察窗 70ms）·本刀 diff 零触 admit 相位 |
| 5f | bill3-settlement:prove | `pnpm bill3-settlement:prove` | **EXIT=1 红（基线同红·非本刀引入）** | 败臂 2=`隔离库真迁移链全链 applied（185 版本在账…）`+`0173 → GRANT EXECUTE TO PUBLIC 语义保留…`·**stash 对照**基线恰一次同 2 臂 EXIT=1·链深 pin 陈旧于链 186 起（BILL4 nail 185 后历刀未随翻）·0173 ACL 面早于本刀漂移（ci-wiring2 `86303901` 系 batch-base `109e3eb1` 祖先亲证）·§3-5 bill3 零触保持 |
| 6a | model-usage-cache-observe | `pnpm -C packages/ai-runtime prove:model-usage-cache-observe` | **EXIT=1 红（28 臂恒等保持·27 绿 1 红·卷内矛盾上报）** | 败臂=`零计费负臂：invoke.ts 中 cachedInputTokens 词面恰三处（…settle/validUsage 仍零读…）`——本刀件②-b 授权语义翻转（结算读·词面 3→7）使该负臂前提被证伪；臂文本属 §0.1 zero-touch 文件（§3-5）+§2-6「臂数≠28 即停」=卷内矛盾（缺口④ closure 必然翻此臂）·**Ban 就地改**·升级协调方/post 双审裁决（先例：该臂自注「计数随 AG-24 语义翻转登记不洗」=语义翻转随翻重钉有先例·须授权） |
| 6b | prove:usage-calibration-bleed | `pnpm -C apps/worker prove:usage-calibration-bleed` | **EXIT=1 红（26 臂保持·25 绿 1 红·基线先断）** | 败臂=`域级本体 sha256 pin：usage-calibration-reconciler.ts == AG-12 施工后 re-pin 值`——实测 sha256 `fcc5cf4a…` ≠ pin（AG-12 re-pin `b7846641`）·该文件末次触面=ci-wiring2 `86303901`（`git merge-base --is-ancestor` 亲证=batch-base `109e3eb1` 祖先）→红先于本刀·本刀 diff 零触该文件（git status 亲证） |
| 7 | typecheck | `pnpm turbo typecheck --force` | **EXIT=0 绿** | `Tasks: 8 successful, 8 total · Cached: 0 cached, 8 total` |
| 8 | lint 五值恰等 | `npx eslint . --max-warnings 99999`（五域） | **绿·恰等** | web `601`/api `1421`/worker `954`/ai-runtime `628`/root `5235`——五值与 §2-8 钉值逐一恰等·全域 0 errors·`pnpm turbo lint` EXIT=0 |
| 9 | docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0 绿** | `scanned 2143 managed worktree files` ≤ cap **2144**（cap 漂移见偏离①） |
| 10 | markers 五类 | 词面运行时组装（`['T','O','D','O'].join('')` 等四词+冲突标记对·同 `scripts/i6-239-gates.proof.mjs:151-163` 形·词面不入卷防自匹配） | **零命中** | 改动集 7 tracked+收据目录全文件 grep EXIT=1（零命中）·落卷后复扫 |
| 11 | diff 面机检 | `git diff --numstat` | **恰 7 tracked+收据 untracked** | 见下表 |
| 12 | 卫生 | install/--env/tsbuildinfo | **绿** | `pnpm install --frozen-lockfile` EXIT=0 lockfile 零改·`.env*` ABSENT 双向·`apps/web/tsconfig.tsbuildinfo` 运行翻动 checkout 归位不入 commit·actualSpendCny=null |

**协调方门清单口径注**：协调方 EXEC 派单十二门清单=ag11-settle+model-op02+model-op02-endpoint-partition+interview+neg 六段+migrate+drift+uniqueness+typecheck+lint+docs:check+markers+diff 面——**全绿**；卷 §2-5 邻六门之 model-cost:isolated/bill3 与 §2-6 观测两门四红全数如实登记（两红基线亲证+两红卷内矛盾/基线先断·见三）。

**附加门（卷外协调方点名）**：`pnpm interview:prove` **EXIT=0 绿·恰 57 臂**；`pnpm neg:all` **EXIT=0 绿·六段恰 687**（auth 90+commerce 90+resume 91+interview 102+bend 179+input 135·零 FAIL）。

## 三、偏离/上报清单（理想为零·实登记五项·零就地处置）

1. **docs cap 漂移如实改锚（结论不变）**：卷 §2-9 钉 cap 2136·现树 cap=**2144**（`public-text-policy.mjs` 注记：2026-10-15 协调方 sanction·RECONCILE-RETRY EXEC 红停 2137>2136→cap 续作 `4fcbeffb` 2136→2144·「三刀在飞共享余量」=本刀余量已在 sanction 内）·merge 吸收·实测 scanned **2143**≤2144 EXIT=0 绿。非红停（>cap 方红）·登记待 post 双审确认。
2. **model-cost:isolated:prove 红（基线同红）**：真实时钟竞态臂·stash 基线恰一次同败（同臂同数）·本刀零触 admit 相位·Ban 借机修保持·报协调方后继观测/修复另刀。
3. **bill3-settlement:prove 红（基线同红）**：链深 pin 陈旧（185·链 186 起历刀未随翻·BILL4 nail 后该门未入近期波次门单）+0173 ACL 臂同因·stash 基线恰一次同 2 臂·卷 §3-5 bill3 域零触保持。
4. **model-usage-cache-observe 负臂红（卷内矛盾·上报裁决）**：28 臂数恒等保持·败臂前提「settle/validUsage 仍零读+词面恰三处」被本刀件②-b（缺口④ closure·卷 §1-修法授权面）必然证伪（词面 3→7）·臂文本属 §0.1 zero-touch 文件+§2-6 28 臂恒等=卷内矛盾·pre-exec 双审未标注·Ban 就地改零触面·该臂自注「计数随 AG-24 语义翻转登记不洗」示语义翻转随翻重钉先例·**待协调方授权后继随翻重钉**（本刀不动）。
5. **invoke.ts :69 字段注释首行「只观测不改计费」词面维持**：rev2 ②-b-③ 明令「仅改『settle/validUsage…不读此字段』句·其余逐字」→首行 tag 逐字保留·与新句「结算读此字段」存在措辞张力·按令执行如实登记（后继授权可随翻）。

**机制注记（P2-1·件① ACL）**：settle_text 核心 ACL 原设 0036:184（REVOKE ALL 五参 FROM PUBLIC,app_role）·函数身份变更五参→六参→恰一 DROP+CREATE（禁 overload）·DROP 湮灭原 ACL·REVOKE 随发显式收敛；CREATE 复默认层面 0073:1342 全局默认特权已按创建角色 REVOKE PUBLIC EXECUTE（DROP+CREATE 实际不获 PUBLIC）·但默认特权按创建角色生效非表级恒等——第三语句仍系正确显式收敛（app_role 面+非迁移角色创建路径 fail-closed 不依赖默认特权推导）·scoped wrapper REVOKE+GRANT 两行沿 0188:371-372 同形换六参·η 臂实跑亲证（app_role EXECUTE=true·PUBLIC=false·恰 1 无 overload）。

## 四、diff 面（numstat 原值·`git diff --numstat` 对 `0b12224e`）

```
18	2	ai-docs/delivery/harness/cost-columns-REQUEST.md   （头部 Status 随翻+§0.1 P2-2 更锚+§9 append·152→168 行）
21	6	apps/worker/src/model-cost-governance.ts           （件②-c：PriceRow/Binding+buffers 映射+optionalPositive+env 键+seed 列集+回读 cached 臂）
99	11	apps/worker/test/ag11-settle-relax.proof.ts        （件③：8 调用点机械 +0+η :295 重钉+ι/κ/λ/μ 四新臂+头注/收官行随翻）
9	3	packages/ai-runtime/src/invoke.ts                  （件②-b：字段注释随翻+validUsage cached 三查臂+两调用点 +1 实参）
5	2	packages/db/src/model-op/ai-cost-governance.ts     （件②-a：六参签名+$6+注释引 #48/#49）
12	0	scripts/run-e2e-isolated.mjs                       （件③：恰 12 条目尾各 +1 行 0204·零逻辑改）
```
新增 untracked→tracked：`packages/db/migrations/0204_ai_cost_cached_input_price.sql`（258 行·blob `a5407acd`·14 语句=两表各 3+reserve OR REPLACE 1+settle DROP/CREATE/REVOKE 3+scoped DROP/CREATE/REVOKE/GRANT 4·`-- @migration-mode multi-statement` 沿 0192:6 形）+`ai-docs/delivery/receipts/cost-columns/`（本收据）。

## 五、pins 声明

十一值照抄零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。
Ban 列表全程遵守：零 push/零 retry-to-green（红不重跑冲销·基线对照恰一次每门）/零 pins 翻转/零迁移扩面（恰 1 熔单 0204·零新表零 DROP COLUMN 零 NOT NULL 回填零存量行触碰）/零触 embed 路径与观测层/零 `ai_model_invocation` 加列/零为绿改断言（既有 8 臂断言零改·η 恰 1 行重钉+8 调用点机械 +0 预授权清单逐位照列）/零就地调 lint 预算/docs cap/零改共享 SSOT/零触其他工作树/零 `.env`/零依赖升级。
**旧代码忽略仍正确（wire/结构变更义务）**：①`settleAiTextCost` 六参为 TS 必传+SQL 六参无 DEFAULT（fail-closed·漏改调用点编译期/SQL 期双显形）——仓内全部调用点已贯通（invoke.ts 两处+ag11 proof 8 处机械 +0+新臂 4 处·rg 亲证无第 15 处）；②`ai_cost_price_book`/`ai_cost_reservation` 新列 nullable 默认 NULL——旧 reader（binding 谓词 0083/0144 委托/settle 0188 旧体已换新）对 NULL 列语义=现行为（COALESCE 回退 input 价·cached=0 逐位恒等）·ag11 八既有臂+κ/λ 实跑亲证；③seed INSERT/回读断言 null 透传·缺 env 键=列 NULL=现行为恒等（model-cost 邻门其余臂全绿佐证）。

**STOP=executed:awaiting_post_prove_dual** · 待 post-prove 双审两外席（alone≠dual · Ban self-approve）· ⛔push

## 修复轮（post 双审残余 R1/R2 返工·EXEC 席续任·2026-10-15·append 保史）

**双审残余亲证（修复前三处实锤）**：R1=`0204:253` scoped wrapper 回读谓词 `r.idempotency_key=r.idempotency_key` 恒真（对照 `0188:360` 原文 `r.idempotency_key=p_idempotency_key`——错读行→settledOverage 静默错报面）亲证属实；R2=`0204:59-152` reserve_text OR REPLACE 全量体换掉 `0144:535-551` 薄壳·破 db-trigfam P7 `pg_get_functiondef LIKE '%public.tf_%'` 恰 1 行断言亲证属实——基线全跑（stash 对照·恰一次）`failures=12` 臂红，其中恰 1 臂 `P7 十二薄壳均薄委托 :: ai_cost_reserve_text:0` 系本刀新破未登记，余 11 臂（StageB 恰只应用 0144/P1×2/P4×2/P5×4/P6×2）基线同红=链深陈旧在册面（同 bill3 pin 陈旧类）。

**R1 修复**：谓词一词恢复 `p_idempotency_key`（修复后 `0204:275`）——与 0188:360 原文逐字同形。
**R2 修复（协调方裁决选项 a）**：0204 对 `public.tf_ai_cost_reserve_text` 九参全量体 CREATE OR REPLACE（体=EXEC 全量体逐字零变·本席 diff 亲证 BODY IDENTICAL·属性归位 0144:441-448 tf_ 原形=LANGUAGE plpgsql+SET search_path 无 SD·INSERT 增 cached 恰两处保持）+`ai_cost_reserve_text` 薄壳 CREATE OR REPLACE 恢复 0144:535-551 委托形逐字（`RETURN QUERY SELECT * FROM public.tf_ai_cost_reserve_text(九参)`·SD+SET 重声明·本席 diff 亲证 SHELL STATEMENT IDENTICAL TO 0144:535-551）——P7 薄壳委托不变量恢复·reserve 链 cached 价捕获经 tf_ 体贯通（κ 臂 400_000 捕获复跑绿）。**行为语义零变复核**：tf_ 体与 EXEC 全量体逐字节同·薄壳与 0144 薄壳逐字节同·settle 面 R2 零触·R1 仅把回读谓词归位授权底本语义。

**修复轮收据勘误**：
1. **（R3）** §一 表 `run-e2e-isolated.mjs` 行「13 命中/恰 12 条目」勘误为「**12 命中**/恰 12 条目」——`grep -c 0204 scripts/run-e2e-isolated.mjs`=12 亲证（12 条目各恰 1 行·无第 13 处）；「13」实为预迁移单条目集 rg 分母模式（`0083_ai_text_cost_price_revision_binding|0188_ag11`）的命中数（ag11 条目 0083+0188 双行·REQUEST §0.1 行该口径自洽）·非 0204 词面计数·两口径于此切清。
2. **（R4）** §二 门 9 docs:check「scanned 2143≤cap 2144」勘误为本树实测 **scanned 2144=cap 2144·零余量**（收据文件自身入管后 +1·EXIT=0 维持绿）——本修复轮零新增 ai-docs 文件·零余量如实登记：后继任何加管文件即触 2145>2144 红闸。
3. **（随 R2）** §四 0204「258 行·blob `a5407acd`·14 语句」勘误为「**280 行·blob `3648e7d0`·15 语句**」（reserve 链 1→2=tf_ 全量体+薄壳各恰 1·两语句均 OR REPLACE·零 DROP 零新 ACL 面·非扩面）；§二 门 1 链面不变（applied=204 头 0204 恒等）。

**修复轮门矩阵复跑（EXIT 原值·对修复后工作树）**：migrate:prove EXIT=0 绿（0204 15 语句施链绿）·drift:prove EXIT=0 绿·uniqueness EXIT=0 `files=204 violations=0`·ag11-settle:prove EXIT=0 **12/12 臂**（α-μ 全绿·ζ scoped 幂等臂=R1 行为面亲证）·**db-trigfam:prove 12 臂红→11 臂红（`P7 十二薄壳均薄委托` 复绿 PASS·本刀新破臂消）**·余 11 臂与 stash 基线逐臂全同红（链深陈旧·非本刀引入；P6 工作树净脏树期 FAIL=预期·commit 后归位）·model-op02:prove EXIT=0·model-op02-endpoint-partition:prove EXIT=0·interview:prove EXIT=0 恰 57 臂·neg:all EXIT=0 六段 687（90+90+91+102+179+135）·typecheck EXIT=0 8/8 0 cached·lint 五值恰等 601/1421/954/628/5235 全域 0 errors·docs:check EXIT=0 scanned 2144=cap 零余量（R4 勘误行）·markers 五类改动集零命中·卫生：tsbuildinfo 运行翻动 checkout 归位不入 commit。

**修复轮偏离登记（零就地处置外全如实）**：①db-trigfam 余 11 臂基线红不在本刀修复授权面（链深陈旧类·报协调方后继裁决·Ban 借机修）；②0204 语句数 14→15=R2 选项 a 结构必致·如实勘误非扩面；③本收据以 append+勘误注落卷保史（13 命中/2143 两处原值不洗·勘误见上）。零越界零借机修零 retry-to-green（stash 基线对照每门恰一次）。

**STOP=executed:awaiting_post_prove_dual 维持**（修复轮 commit `fix(cost-columns)`·重审归协调方派·alone≠dual·Ban self-approve）·⛔push
