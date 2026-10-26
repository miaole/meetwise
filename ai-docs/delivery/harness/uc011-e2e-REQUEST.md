# UC-E2E-011 E2E 缺口 REQUEST（ADV 面隔离收据+六列补齐+covered-lift 评估·量级 M）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷 2026-10-26·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve · est live=0 · actualSpendCny=null·§9-rev 修订已回卷 2026-10-26：双审席2 FAIL P1×3+P2×4 纯文面修订·rev 后重派双审第二轮以 §9-rev 为基）

## §0 锚（tree 级 @ `47dd6be56`·现树逐处亲证·锚 blob 亲算·2026-10-26）

- **基线**：`origin/main` @ `47dd6be56`（`47dd6be56d5f3b59ccf5dc0c827b0bdc2e6952de`·fetch 后 rev-parse 亲证恰等派单下界）。支线 `line/uc011-draft`（worktree `meetwise-uc011` 亲立·⛔push）。
- **登记出处**：`ai-docs/delivery/e2e-requirement-coverage-matrix.md`（blob `0cf6ae184d41`）§1.0.1 :117 UC-E2E-011 行 ADV 列 **gap**/`case-only` + §3 :270 P1-2 行（保留缺口）——未闭亲证（六列无一 covered·coveredCount=8）。
- **历史 nail SHA 可达性诚实注记（亲跑 merge-base）**：UC-011 谱系历史对象——Line V main-mouth nail `5aae104`/feat `40a4f6c`/code-prove `2535b31`/REQUEST `d58b05b`、Line V honesty-of-red `79825b2`、Line Z Path A `244b812`/CODE `bf1fdb2`、Line AF covered-lift-reassess tip `350f7a4`/REQUEST `3dca5de`/post-dual `ac590ab`/`e38a7c4`——**全数库内对象而非 main tip 祖先**（merge-base --is-ancestor 逐一亲跑 NOT-ancestor）。main 侧全部内容经 #108 squash `112e6d26f` 单点进树（matrix/controller/proof 三面 `git log` 同 commit 亲证）。**故 EXEC tip 隔离复跑收据 = 本刀主件**：历史 EXIT0 读数只作叙事，Ban 当 live cite。

### §0.0 撞行登记（在飞批 B 并行草案·§9-rev P1-3 新增·2026-10-26 rev 落卷）

批 B 草案 `line/nhp-batch-b-draft` @ `bfda3c53c`（`ai-docs/delivery/harness/nhp-batch-b-REQUEST.md`·「新增覆盖矩阵盲区第 4-6 行处置起草卷」·其 rev `c77057d6f` 已单侧预裁定在飞）认领矩阵 §1.0.1 行 4-6（UC-E2E-004/010/011），触及本卷工作面：matrix :115-117（行 6=UC-E2E-011）+ :147-148（PERF/LOAD 分面行）+ case-matrix（`ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`）:46-59/:83。**格权分界四条**（rev 裁定落文·互 Ban 越格）：

1. **:148 翻面权归批 B**：matrix :148 PERF/LOAD 格（+:59 收据+新 NHP-011-PERF-api-01 行）翻面/措辞处置权归批 B 行 6 子刀；本卷 :148 指令（§1-件二「保持 blind 零宣称」）改域为「**本刀 tip 不翻**」——本卷仅在 EXEC tip 维持零翻转零宣称，:148 后续措辞处置不属本刀面。
2. **case-matrix :58 归本卷·批 B 只读**：NHP-011-ADV-01 行（case-matrix :58·ADV 面）与本卷 §1-件二 ADV 列处置归本卷；批 B 对 ADV 列与 :58 过时句**只读**。
3. **EXEC 串行本卷先**：两卷若同获 EXEC，串行且本卷（UC-011）先行；批 B 行 6 子刀在其后按其 re-pin 纪律处置（本卷落卷锚若被批 B 并线漂移，按其 re-pin 后现值重锚）。
4. **EXEC 立项日逐树互查**：两卷各自 EXEC 立项日对当时树逐锚互查（对方是否已并线、锚 blob/行号是否漂移）·漂移超注记级即红停回炉交协调方。

### §0.1 UC-011 行六列现状（现树亲证读数）

| 面 | 现状 | 锚 |
|----|------|----|
| NEG | **partial** | matrix :117 |
| FAULT | **partial** | matrix :117 |
| BOUND | **partial**（幂等误 release） | matrix :117 |
| **ADV** | **gap** / `case-only`（`GAP-UC011-ADV-01` CLOSED（wired）·列措辞保留） | matrix :117 · NHP `non-happy-path-perf-load-case-matrix.md`（blob `bbbe217dc514`）:58 |
| PERF / LOAD 分面 | PERF_api **blind** · PERF_web **n/a**(非 UI 主) · LOAD_worker **blind** | matrix :148 |
| §1.1 / backlog | **partial**（canHonestlyFlip=false · Line AF 评估-only）· P1-2 保留缺口（balance-ui / fail HTTP mouth / full.e2e / regenerate / PERF-LOAD / residual audit+amount） | matrix :175 · :270 |

### §0.2 ADV 列缺口形状（现树四读亲证·blob 亲算）

1. **产品双口在树**：`POST /payment/refund-callback`（`apps/api/src/modules/commerce/payment-callback.controller.ts` blob `37b8af4670f4`·`@Controller('payment')`+`@Post('refund-callback')`·白名单 `{orderId,providerTxn,sig,ts}`）+ Path A `POST /commerce/webhook/refund/:id`（`commerce-webhook.controller.ts` blob `2b9766020ac4`·`@Post('refund/:id')`）→ 同一 `CommerceService.refundWebhook` 单管道（`commerce.service.ts` blob `f55d414c1cb7` :151）。场景语义源=`ai-docs/requirements/use-cases/e2e-scenarios.md`（blob `9976f9c38208`）:238-259（E1–E4 / A1–A3 / `POST /payment/refund-callback` 契约）。
2. **主口 ADV prove 在树**：`apps/api/test/uc-e2e-011-refund-callback-adv.proof.ts`（blob `c9ba96b69863`）·七类注入 A1–A7+新鲜 INV+X+ZREG · `A(` 断言亲算 **68** · 隔离命令 `pnpm uc011:refund-callback-adv:prove`（root package.json :159 → `run-e2e-isolated` 允许表 `:2237` 在表·`scripts/run-e2e-isolated.mjs` blob `f89fb27ca397`）· ZREG 臂原样子进程重跑冻结 Path A proof（proof :98）。
3. **Path A mouth prove 在树**：`uc-e2e-011-refund-callback-mouth.proof.ts`（blob `b3301f6273ee`）· `pnpm uc011:refund-callback:prove` · `A(` 断言亲算 **41**。
4. **旧 ADV prove 基线红预期（陈旧前提在册）**：`uc-e2e-011-adv-refund-callback.proof.ts`（blob `888264792e6b`·Line V honesty-of-red 首注册 · 18 臂）INV 腿 :85-:94 断言「无 refundWebhook / 无 refund 路由 / 口缺失」——与 §0.2-1 现树产品双口**相反**，现 tip 亲跑预期基线红（陈旧清单 INV+A1/A2 命中真口非 404）。此为**前提过时非产品回归**（feat 支线 `ea35b27b9` P8 在册同型定性先例·该支线 merge-base --is-ancestor 亲跑 NOT-ancestor=非 main 祖先·对其引用属**叙事引注**非 live 树证·§9-rev P2-4）· 本刀只诚实登记不修不洗 · 退役/重锚归另议。
5. **NHP 矩阵 :58 锚文本过时**：`ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（blob `bbbe217dc514`）:58「产品口缺失 = 仍 gap 执行面」与现树双口在树不符（旗 `gap→case-only` 本体保留·路径补全 §9-rev P2-3）。
6. **收据面（evidence-of-record 口径·§9-rev P1-1 改写）**：`ai-docs/delivery/receipts/` 无 uc011 收据目录；历史读数另存于 **main 可达非本 tip 收据三件**——`receipts/authz-harden/uc011-refund-callback-adv-rev2-68arms.log`（68/68 EXIT0）+ `receipts/archive/2026-09-batch23/receipts/2026-10-06-gap-uc011-adv-main-mouth-wiring-prove.md`（68/68）+ `receipts/archive/2026-09-batch23/receipts/2026-10-06-gap-uc011-refund-callback-product-mouth-prove.md`（41/41）——均钉死非祖先 tip（`2535b31`/`244b812` 谱系·§0 merge-base 注记）·非 EXEC tip evidence-of-record·故**现 tip 无可复核 ADV 隔离收据**结论不变=缺口核心（三件登记在卷·rev 席 ls-tree 亲证三件 origin/main 树可达）。
7. **covered-lift 现值**：Line AF `canHonestlyFlip=false`（refuse five：MISSING-NHP(PERF)/CASE-ONLY(ADV+LOAD)/STATUS-NOT-COVERED/S11-NOT-MET/OPEN-GAP）· 评估-only · 翻面权归协调方 · evaluator `scripts/lib/uc-covered-evaluator.mjs`（blob `ec62c4c247a8`）read-only。

## §1-修法（三件·docs+prove 收据·零产品码零迁移）

1. **件一·ADV 面隔离收据**：EXEC tip 亲跑 `pnpm uc011:refund-callback-adv:prove`（68 臂）+ `pnpm uc011:refund-callback:prove`（41 臂）双隔离收据（`run-e2e-isolated` 隔离真 PG）落 `ai-docs/delivery/receipts/uc011-adv/`（EXIT+臂计+attempt 台账逐次记录·ZREG 内层 mouth 子进程=68 收据组成臂·attempt 台账随该次 68 收据 run 计·**不计独立 attempt**·§9-rev P2-2）；`pnpm uc011:adv:prove`（旧 18 臂）基线红如实登记一件（前提过时定性·不修不洗·不 retry）。
2. **件二·六列补齐（SSOT 措辞更新·行状态零翻转）**：matrix §1.0.1 :117 ADV 列+快乐读法列按真收据改注记（case registration only 措辞·**保持 gap/`case-only` 旗·禁升 covered/partial·coveredCount=8 不变**）；§1.1 :175 与 §3 :270 P1-2 同步注记；§1.0.2 :148 PERF/LOAD **保持 blind 零宣称**（Ban n/a 偷关）；NHP 矩阵 :58 停用「产品口缺失」过时句改现势措辞（旗仍 case-only）。
3. **件三·covered-lift 评估**：EXEC tip 上按 evaluator 枚举 Branch A 手算（承 Line AF 形·零码面·evaluator read-only），六列+§1b+残余①audit/②amount 映射 refuse 枚举如实重算；**评估落卷=非翻面**（预期 canHonestlyFlip=false·若计算结果非 false 须红停回炉交协调方裁决，Ban 自行翻行）。

## §1.3 否决

1. **invent covered**：ADV 收据+六列补齐不得翻转任何行为 covered；coveredCount=8 不变；Ban 假关/Ban 顺手洗绿/Ban 借 wired 抬列。
2. **live key 解锁**：Ban 用 live provider key/买云/live 外呼换绿；隔离收据-only；Ban secrets/`.env*`。
3. **retry-to-green**：收据红不得重跑到绿了事；attempt 台账逐次如实（含首跑红）；Ban flake 标签。
4. **旧 adv proof 改断言凑绿/直接删除**：否决（改形或退役归另刀评估；本刀仅登记）。
5. **残余 ①audit absent ②amount 显式复核 假称已闭**：否决（随注记保留·Ban 改口「已实现金额复核」）。
6. **§1.1 / P1-2 / §1.0.1 行翻面**：否决（翻面权归协调方·本刀评估-only）。

## §2 门矩阵（EXEC 席亲跑·EXIT 原值随 commit message 记）

1. **markers**：改动集新增行五类运行时组装词面+全树行首冲突标记对 grep **零命中** EXIT=0（词面不入卷防自匹配）。
2. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 scanned ≤ `MAX_FILES` 现值 **2346**（`scripts/ai-docs/public-text-policy.mjs:137` 亲证·draft 基线亲跑 **2341**·本卷 +1 → 预期 **2342**·余 4）。**EXEC 收据预算（§9-rev P1-2）**：EXEC 阶段收据面预列恰 **3 件**（68 臂收据+41 臂收据+旧 18 臂基线红登记）→ post-EXEC 预测 scanned=**2345**（2342+3）；越顶（>cap）走 **cap sanction 上报路径**（上报协调方步进·Ban 自行改 cap/Ban 删收据凑数）。cap 2346=本支线 base 亲证值；cap-2354 步进 **PR #123 rev 时点已并线**（merge `ab282ba81`·origin/main `MAX_FILES=2354` 亲证·主线 scanned rev 时点亲跑 2342）——届值以 EXEC 立项日 fetch 为准·帽或为 2354。
3. **diff 面**：起草 commit 恰 **1 tracked**（本卷）·EXEC 阶段=本卷+SSOT 措辞面（matrix/NHP 两文件）+收据件·**零产品码零迁移零 lockfile 零 env 闸**。
4. **prove 双收据门（EXEC）**：`pnpm uc011:refund-callback-adv:prove` **EXIT=0 68/68** 且 `pnpm uc011:refund-callback:prove` **EXIT=0 41/41** @ EXEC tip（首跑红→如实定性红停·Ban retry-to-green·EXIT0≠covered）。

**停止条件**：markers 命中 · docs:check > 2346 · 双收据任一红未定性 · 现树锚漂移超注记级（§0.1/§0.2 任一 blob 或行内容变）。

## §5 pins（零翻转·承续）

- haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · **coveredCount=8** · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（注：adv proof :169/:469 树内现值打点「DELETE=202 软删受理(purge_pending)」——与 SSOT pin 503 出入属**既有树况非本刀面**·pin 零翻转·§9-rev P2-1） · **canHonestlyFlip=false**（Line AF 承续·本刀评估-only） · actualSpendCny=null。
- 残余承续：①audit emit 点 absent（disclosed-not-blocking·接线=另刀）②amount 显式复核不存在（AMT DISCLOSED·新刀）· 均随注记保留 Ban wash。

## §8 STOP

- **开工条款**：本卷=起草落卷。EXEC（若派）仅限 §1 三件域+§2 四门·越 §1.3 否决面即红停回炉。pre-exec 双审两独立外席待派（§0.1 六列读数+§0.2 缺口形状七点+§1 三件域三处必核）· alone≠dual · Ban self-approve。
- **STOP = `draft:awaiting_pre_exec_dual` 三处同值**（Status 头+本节+卷尾注）。
- **rev 落卷**：2026-10-26 pre-exec 双审席 2 FAIL（P1×3+P2×4）→ §9-rev 修订回卷（纯文面·零码动）·STOP 不翻（rev 落卷非开工许可）·rev 后**重派 pre-exec 双审两独立外席第二轮**·窄域=§9-rev 落点复验 · alone≠dual · Ban self-approve。
- 卫生：est live=0（隔离收据+docs-only·零模型外呼零 secrets 零生产操作）· actualSpendCny=null · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §9-rev（rev 回路落卷·2026-10-26·纯文面）

**回路**：pre-exec 双审席 2 FAIL（P1×3+P2×4）→ rev 席修订回卷。本节为 rev append+落点行内改·零产品码零迁移零新增受管文件（同卷 append）·STOP 维持不翻（Status 头+§8+卷尾注三处同值）。

- **P1-1 收据 evidence-of-record 口径**（落点 §0.2-6 改写）：原「仅存于非 main 可达」措辞废止——历史读数另存于 **main 可达非本 tip 收据三件**：①`receipts/authz-harden/uc011-refund-callback-adv-rev2-68arms.log` 68/68 EXIT0 ②`receipts/archive/2026-09-batch23/receipts/2026-10-06-gap-uc011-adv-main-mouth-wiring-prove.md` 68/68 ③`receipts/archive/2026-09-batch23/receipts/2026-10-06-gap-uc011-refund-callback-product-mouth-prove.md` 41/41。**三件登记在卷**·均钉死非祖先 tip（`2535b31`/`244b812` 谱系）·非 EXEC tip evidence-of-record →「现 tip 无可复核 ADV 隔离收据」**结论不变**。rev 席亲证：三件 `git ls-tree origin/main` 树可达·68/68 与 41/41 EXIT0 读数文件内亲读。
- **P1-2 EXEC 预算**（落点 §2-2 追加）：EXEC 收据面预列恰 3 件（68/41/旧红登记）→ post-EXEC 预测 scanned=**2345**（2342+3）·越顶→cap sanction 上报路径一行；cap 2346（本支线 base `public-text-policy.mjs:137` 亲证）·cap-2354 步进 **PR #123 rev 时点已并线**（`ab282ba81`·origin/main `MAX_FILES=2354` 亲证）·届值以 EXEC 立项日 fetch 为准·帽或为 2354。
- **P1-3 撞行登记节**（落点 §0.0 新增）：批 B `line/nhp-batch-b-draft` @ `bfda3c53c` 认领行 4-6 触 :115-117+:147-148+case-matrix :46-59/:83·格权分界四条裁定落文 §0.0（:148 翻面权归批 B·本卷 :148 指令改域「本刀 tip 不翻」/ case-matrix :58 归本卷·批 B 只读 / EXEC 串行本卷先·批 B 行 6 子刀后按其 re-pin 纪律 / EXEC 立项日逐树互查）。
- **P2-1 DELETE=202 软删受理注**（落点 §5 行内注）：adv proof :169/:469 树内现值打点「DELETE=202 软删受理(purge_pending)」（rev 席 :169/:469 亲读）·与 SSOT pin「公开 DELETE=503」出入属既有树况**非本刀面**·pin 零翻转。
- **P2-2 ZREG 内层 mouth 子进程 attempt 口径**（落点 §1-件一括注）：ZREG 臂原样子进程重跑 Path A mouth proof（proof :98）属 68 收据**组成臂**·attempt 台账随该次 68 收据 run 计·**不计独立 attempt**（防台账双记）。
- **P2-3 NHP 矩阵锚补全路径**（落点 §0.2-5）：锚补全为 `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（blob `bbbe217dc514` 亲证 HEAD 恒等）:58。
- **P2-4 `ea35b27b9` 非 main 祖先叙事引注记**（落点 §0.2-4 行内注）：`ea35b27b9` merge-base --is-ancestor 亲跑 NOT-ancestor=非 main 祖先·对其 P8 同型定性引用属**叙事引注**非 live 树证·不构成 EXEC 收据面。
- **rev 工序记录**：markers 五类探针（i6-239 词族·词面运行时组装防自指不入卷）改动集净增行+全树行首冲突标记双扫 **0/0 EXIT=0**（本席亲跑）·docs:check EXIT=0 scanned **2342**≤cap 2346（append 零新增受管文件·append 前后同值亲跑·余 4）·`git diff --numstat` 恰 1 tracked 本卷 .md·est live=0·pins 零翻。

---

*UC011-E2E REQUEST · 2026-10-26 起草 · **`draft:awaiting_pre_exec_dual`**（三处同值：Status 头/§8/本行）· base `origin/main` @`47dd6be56` · 分支 `line/uc011-draft` · 工作树 `meetwise-uc011` · 立项出处=覆盖矩阵 §1.0.1 :117 UC-E2E-011 ADV 列 gap/case-only + §3 :270 P1-2（未闭亲证）· 定稿=ADV 面缺口形状七点（产品双口/68+41 臂 prove 在树/旧 18 臂前提过时基线红预期/NHP :58 过时锚/现 tip 零可复核收据/历史 SHA 全数非 main 祖先）+修法三件（隔离收据/六列补齐措辞/covered-lift 评估-only）+否决六条+门四条 · 量级 M · est live=0 · markers=0 · rev=§9-rev 2026-10-26（双审席2 FAIL P1×3+P2×4 回卷·纯文面·rev 后重派双审第二轮） · ⛔push ⛔merge 主线 ⛔force push*
