# CMOP03-POST7B-RESTART · GAP-CMOP03-POST7B 复盘/重启 REQUEST（docs-only）

status: **`draft:awaiting_pre_exec_dual`**（复盘/重启 REQUEST 就绪 · 预执行双审未做 · meetwise 未授权 · 本 commit 零码零埋点零实跑——本刀=盘点+REQUEST 起草 · 修复范围=空集）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · r1Closed=false（十一值照抄）

## 0. Base 与前链披露

- **前链（本分支 `line/cmop03-post7b-discriminator` · HEAD `5e2e32fb`）**：REQUEST `3aa494db`（≡ origin 孪生 `bfcdcc6d` · patch-id c55c0072）→ EXEC `3434f82b`（M1-M7 七埋点落树）→ merge `c19b638e` → nail `5e2e32fb`（红点 `:236` 窗外升级 · `GAP-CMOP03-7A-DOWNGRADE` 立行 P1 OPEN · `GAP-CMOP03-POST7B` P1 OPEN 维持）。本文为该链的**复盘/重启 REQUEST**（append-only 新文 · 前链四文零改写）。
- fetch 2026-10-09：`origin/feat/mysql-schema-skeleton` = `2fab7946`（2026-10-09 17:42 +0800）。**base 分叉披露**：本线分支基于早期主线（`cb89c23d`→`b5101df4` era），落后主线 132 commit——本 commit 仅落本线分支（docs-only · 零 rebase 零 force-push）；EXEC 面运行基点归协调方裁（推荐=主线 tip 或 G7TRIO-2 线 `line/g7-trio2-full` 同点）。
- **G7TRIO-2 在卷引用（只读零触碰）**：trio 全景重跑 REQUEST rev2 `c76cad4b`（分支 `line/g7-trio2-full` · base=`2fab7946` · `draft_rev2:awaiting_pre_exec_dual` · 未 EXEC · 未落主线 · 帽提升 200→300 前置申请在卷）。
- 立项出处：协调方 POST7B 复盘/重启指令（G7FIX-1/2/4/5 四刀修复落主线 + CMD1 首次 EXIT=0 全绿后）——承接 G7FIX-1/G7FIX-2 nail STILL OPEN 在卷排序「POST7B（重锚后评估）」。
- REQUEST-era blob/行号锚（`git ls-tree`/逐行亲读 @ `2fab7946`，非转录）：

| 文件 | blob @ 2fab7946 |
| --- | --- |
| `e2e/full.e2e.ts` | `c2f0778ce648a1366529893c951bb2cecadd2c00` |
| `e2e/helpers/failure-class.mjs` | `102d0f3ad34c30eb28bcb734b3c4bf5de53b0846`（与原 REQUEST era 全等未变 · `REVIEW_LEDGER_LIMIT=32` @ `:55` 未变） |
| `e2e/helpers/assert.ts`（反伪造钉②） | `975fbb3848c2df29cbf6e891bfa5e0926cf57bdc`（未变） |
| `e2e/helpers/sse.ts`（反伪造钉①） | `f41719a297bb3e3a6c82563e6dd0d8dd8bcff570`（原 `9bba015d` **漂移** · 漂移链=tscgate2 `7a8fd22c` e2e tsc 类型修 + tokstream `3acc6fb5` FORBIDDEN_SCORE_KINDS 注册 · 均已 nail 授权线在卷） |
| `scripts/run-e2e-isolated.mjs`（反伪造钉③） | `6fa7238f8c59c7b8a3661f90a765cc0541f4ccb2`（原 `13dbfc43` **漂移** · 漂移链=rcpt1 `e75833da` 收据路径修正 + g7fix4 `47fcc36d` runner 注册等授权链在卷） |
| `packages/ai-runtime/src/model-operation-registry.ts`（反伪造钉④） | `63af556fd16696c8756ddefb8a6317d9495f05ff`（未变） |

EXEC 面四钉按当值 blob 重钉前后全等亲算（原值 retained 在卷零冲销）。

## 1. 原始范围 · 压后原因 · 解除条件清单（REQUEST 必写①）

### 1.1 原始范围（CMOP03-D 鉴别刀 · 2026-10-08 卷面）

- **对象行**：`GAP-CMOP03-POST7B` **P1 OPEN**（CMOP03-FIX 刀① nail 立行 · append-only）——旅程末段红，死亡窗 **∈(:256, :356]**（blob `7d65d0f3` REQUEST era / `1fededa5` EXEC era · 行锚全等）· **class=api** · **78798ms** 首达 · 首达定性 T-1 H-T2（`:201-203` 后全段历史上从未执行）。**×3 窗红原值 retained 零冲销**：78798（CMOP03-FIX 刀① prove）+ 101906（G7Y CMD1 · marker era 窗 (:256,:361] · ledger 恰 11 行末心跳 M5）+ 67369（G7Y CMD3 HTTP · 同形 11 行末心跳 M5）。
- **两岔**：岔A = step8/9 区 `(:256, :301]` driver 面；岔B = 专家评审段 `(:301, :356]`（含 **boundLoop 内部 throw** 与 **`:356` 死胡同断言** 两子型）。不可判根因：`A()` 默认 class=api 与 `client_uncaught` 同族同色 · 精确致死行 withhold 契约内不可回读。
- **机制①** driver 分段埋点 M1-M7（恰 7 行 `reviews.record({class:'worker',code:'seg_*'})` · `E2E_REVIEW` 通道 · 零 A() 断言变更）——已由原 EXEC `3434f82b` 落树。**机制②** sidecar 账本实测臂（G7X T-1 冻结投影 · `ai_model_invocation` 账本 · 预注册 R1/R2 读数）。
- **预注册双向映射**：末心跳 M1/M2→岔A；M3→空隙不可判升级；M4/M5→岔B；M6→子型1；M7→子型2。单 attempt · 红 retained ≠ 判别失败 · Ban retry-to-green · 两臂冲突/不可判→升级协调方。
- **§5 残留（原 REQUEST）**：`:357` provenance 计数断言（非澄清感知计数形态 · 与 C-MO-P3 同族）候修登记归协调方。
- **纪律**：零归因零修复 · 共享 SSOT 只读 · 反伪造四钉 · Key name-only · `.env*` ABSENT。

### 1.2 压后原因（时序链）

1. **判别 run2 输入缺失**（EXEC `3434f82b` · nail `5e2e32fb`）：红点 `:236`（7a 兜底断言 · failLoop terminal=`interview_unavailable` ≠ 期望 `report_unavailable`）在预注册窗**外**（57837ms · M1-M7 全未达）→ 预注册升级条款行使 → `GAP-CMOP03-7A-DOWNGRADE` 立行（三候选产生面并列零归因）→ POST7B 两岔判据仍无有效输入。
2. **G7Y trio 复跑**：POST7B 窗红 ×3 复现（读数见 §1.1）→ 岔B 相容但未定谳 → 子段收敛 (:337,:351) marker era（=旧纪元 (:333,:345) 岗位绑定 start/幂等/begin 子段）→ finer markers（CMOP03-F F1-F4）立项。
3. **CMOP03-F run 段外再升级**：红点更早（恰 4 行 ledger 零心跳 · M5 未达）= 7A 形状第 2 次独立复现 → 段外升级条款再次行使 · POST7B ×3 未复现原值 retained。
4. **协调方裁定 G7 间歇红线先行**：跨 run 形状漂移（窗红 / `:236` 7A / 409 route / post-M7 ≥4 形状）使判别 run 输入不可期 → G7P-1 nail「POST7B stays deferred until targeted」· G7P-2 nail「consent-target first / POST7B stays deferred」· G7FIX-1 nail 排序「POST7B 复评（旧窗坐标漂移重锚）」殿后 → **POST7B 压后**。

### 1.3 解除条件清单（2026-10-09 主线 · 全部达成）

| # | 条件 | 证据（全链已 nail 落主线） |
| --- | --- | --- |
| C1 | route 时序错位致死面（409 `interview_ineligible_route` · 窗内 bound-start 子段）码面定谳并修复 | G7P-5 nail 码面定谳 + G7FIX-1（EXEC `c691efda`+nail）+13/−0 SELECT-only route 轮询 · **start 死点消灭** |
| C2 | boundLoop 孪生断言未同步 C-MO-P3（机制缺陷在树）修复 | G7FIX-2（EXEC `f83e12e3`+nail）`:388` 孪生同步 · `identities ≡ questions+clarifications` 构造恒等在 vivo 定谳 4=2+2 |
| C3 | sidecar 仪器缺陷（v2 停针过严 + correlation 硬 pin）修复 | G7FIX-2 sidecar **v3** correlation 前缀匹配 · match=true 首次 |
| C4 | finalize 409 契约缺口（generation 族不对称发射）码面归因+产品面修复 | G7P-6 skew 读至代码行级 + G7FIX-3（归因**代码级闭合**：`generation_duplicate_question` 判重后果语义过严·非竞态）+ G7FIX-4（产品码恰两文件：adaptive-lifecycle.ts generation 族**对称标记** + recruiter.ts **mark-then-recover** 单触点） |
| C5 | driver 臂与产品新契约对齐 | G7FIX-5（EXEC `1caafeeb`+nail）+2/−6 收敛式回改 · 恢复通路端到端亲证（retry 200/started/新 interviewId） |
| C6 | **CMD1 主旅程首次全程绿** | G7FIX-5 恰 1 run **EXIT=0 passed 80706ms 74 断言**（nail 原文「G7 间歇红全部修复后 CMD1 主旅程首次全程绿」） |
| C7 | 判别仪器绿证可用 | M1-M7+F 链留树全程 hit（G7FIX-2/5 绿收据 **19 行 ledger ≤ 32** · 段标全绿 · 12 段标+7 记账逐项对上） |
| C8 | 协调方在卷排序指令可行化 | G7FIX-1/G7FIX-2 nail STILL OPEN「POST7B（重锚后评估）」——重锚已由本文 §3 完成 REQUEST-era 部分 |

**结论**：POST7B 原始阻塞（判别 run 输入被 G7 间歇红夺走/窗外变形）已消除 → 重启可行。余下唯一前置=排序（G7TRIO-2 在先 · §4 run 来源裁定）。

## 2. 更新版范围（REQUEST 必写②）：仍适用 vs 已被 G7FIX 系覆盖

### 2.1 仍适用（本重启刀继承）

- `GAP-CMOP03-POST7B` 行本体 **P1 OPEN**（×3 窗红原值 retained · 两岔未分）——处置权归协调方 · 本刀 Ban 翻行。
- **M1-M7 预注册双向映射**（岔A/空隙/岔B/子型1/子型2）——判读协议原样继承（坐标按 §3 重锚）。
- 单 attempt · 红绿皆原值记账 · **Ban retry-to-green** · 升级条款（窗外红/两臂冲突/机制不可判 → 如实升级）。
- sidecar 账本实测臂（**v3 形态** · SELECT-only · 仅计数+时间戳入收据）。
- 三零纪律（零 A() 断言变更 · 零 withhold 触碰 · 零产品码）与反伪造四钉。
- Key name-only · `.env*` ABSENT · est 硬帽遵协调方现行裁定 · `actualSpendCny=null` · alone ≠ dual。

### 2.2 已被 G7FIX 系覆盖/消解（本刀零重复修复）

| 原始范围项 | 现状 | 覆盖刀 |
| --- | --- | --- |
| 岔B·bound-start 409 时序错位（G7Y 子段收敛面） | **已修复**（start 死点消灭 · 窗内新增 route 轮询等待机制） | G7P-5 定谳 + **G7FIX-1** |
| 岔B·子型1 boundLoop 内部 throw 族（孪生断言未同步） | **已修复**（`identities ≡ q+c` 构造恒等 · 4=2+2 vivo） | **G7FIX-2** |
| `:357` 同族 provenance 计数残留（原 REQUEST §5 候修） | **已修复**（当值 `:400` · 同刀孪生同步一并落地） | **G7FIX-2** |
| `:236` 7A-DOWNGRADE 混杂形状（判别 run2 窗外红） | **归因代码级闭合 + 产品面可恢复**（terminal 翻转 `assessment_unavailable`+score NULL+retry started） | G7P-6 + **G7FIX-3+G7FIX-4+G7FIX-5**（行关闭归协调方） |
| sidecar v2 仪器缺陷 | **已修复**（v3 correlation match=true 先例） | **G7FIX-2** |
| M1-M7 埋点处方（原 EXEC 唯一 coding 项） | **已在树且绿证**（非「待落」） | 原链 EXEC `3434f82b` 落树 · G7FIX 系全程 armed 延续 |
| parity baseline 预存红（原 EXEC 披露项） | **已再生闭环**（PARITY-B · `e2e-parity:prove` EXIT=0 · 22 scenarios） | PARITY-B 线 |

⇒ **更新版修复范围=空集**：本重启刀无 coding 面（零码零埋点零修）——EXEC 面只剩重锚复核 + 判别读数 + 登记。工作树注记：本线工作树（旧基）含 M1-M7 七埋点；主线 tip 另含 F1-F4（CMOP03-F）+ route 轮询（G7FIX-1）+ 7a 探针（G7P-6）等——EXEC 基点=主线/trio2 线时 M+F 全在树（G7FIX-5 绿收据 19 行 ledger 亲证）。

## 3. 判别窗重锚（marker 语义优先 · 行号系 REQUEST-era 读数 @ blob `c2f0778c`）

| 语义位 | 原坐标（`7d65d0f3`/`1fededa5`） | G7Y/CMOP03-F marker era | 当值坐标（`c2f0778c` @ `2fab7946`） | 备注 |
| --- | --- | --- | --- | --- |
| 7a 兜底断言（7A-DOWNGRADE 面） | `:236` | — | `:250` | G7P-6 探针 `:239-:248` 在其前 |
| 窗开（diag 终态记账后） | `:255`-`:256` | `:256` | `:268` 后 | M1=`:270` |
| M2 / M3 / M4 / M5 | `:258/:301/:303/:333` | `:256/:301/:303/:337` | `:273 / :317 / :320 / :350` | |
| route 轮询（G7FIX-1 · **窗内新增机制**） | —（不存在） | — | `:351`-`:365` | 修复在窗内——窗内时序形状已被改变 |
| F1/F2/F2.5/F3/F4 | —（不存在） | `:340/:342/—/:350/:354` | `:367/:369/:373/:379/:383` | CMOP03-F 落树 |
| M6 / boundLoop call / recordTerminal / M7 | `:346/:346-:354/:355/:355` | `:351/:352-:354/—/—` | `:384 / :385 / :394 / :395` | |
| 死胡同断言（窗闭·含） | `:356` | `:361` era 窗上界 | `:398` | 状态机断言 |
| 孪生 provenance（原 `:357` 残留） | `:357` | — | `:400` | G7FIX-2 修正形 `q+c` |

- **窗重定义（坐标无关）**：窗 = 〔diag 终态记账后 .. boundLoop 状态机断言含〕；当值行域 ≈ **(:268, :398]**。G7Y 子段（M5..M6 间）当值 ≈ **(:350, :384)**——恰为 G7FIX-1 route 轮询插入区 + F1-F4 仪器区。
- **EXEC 复核条款**：行号以 EXEC 运行树 blob 亲算为准；判读永远按 **marker/ledger 序位**非裸行号（原链 BUG-E2E-FAILUNIMPORT 折扣注记先例 · failureClass 窗内零鉴别力结论 retained）。

## 4. prove 策略（REQUEST 必写③）：CMD1 现绿后的判别面重定义

- **原判别前提消失**：原判别=「预期红 retained · 心跳定窗」——前提=窗红必现。现 CMD1 全程绿（C6）→ 判别面重定义为**绿基线下的间歇复现监视窗**，双臂判读：
- **G 臂（预期主臂）**：授权 run 绿（EXIT=0）→ 读数=「M1-M7+F 段标全达 · 窗内断言全过 · POST7B 窗形状本 run 未复现」。**读数增量 ≠ 关闭**：单 run 绿≠恒绿（G7TRIO 同码一红一绿先例 · G7FIX-5「qualified 义首绿」限定语在卷）；行处置（关行/并 `:107` 族/N 绿后关）归协调方 SSOT 裁。
- **R 臂（窗红复活）**：授权 run 红 → 末心跳/ledger 序位按 §2.1 继承映射定窗：红在窗内 → 两岔判据**首次获得有效输入** · 预注册映射原样行使 + sidecar R1/R2 互证；红在窗外/7A 形状再现 → 预注册升级条款如实升级（零归因零强行归类）。
- **run 来源裁定（协调方二选一）**：**优先=搭 G7TRIO-2 CMD1 收据读数（零增量 run 零增量 live · est 0 live 口径）**；备选=本线 standalone 单 attempt `pnpm e2e:isolated`+sidecar v3（须协调方授权 · live est ≤25 · 链记账遵现行帽裁定 · Ban 未经授权加跑）。两案均零 coding。
- **静态门（EXEC 时 · 运行树）**：`e2e-static-guards:prove`+`:check` EXIT=0 · `e2e-helpers:prove` EXIT=0 · `e2e-case-inventory:prove` EXIT=0 · `e2e-parity:prove` EXIT=0（PARITY-B 再生后绿先例；TSCGATE-2 STILL OPEN 所列 `e2e-parity:check` sibling 债如在卷则如实注记）。
- **收据要件**：reviewLedger 全行（段标序位）+ sidecar v3 投影（correlation 锚 · match 状态）+ `ai_model_invocation` 计数/时间戳（仅计数+时间戳入 prose）+ sourceDigests 对运行树 MATCH + 四钉当值 blob 前后全等亲算。
- **预算与 Key**：est 0 live（搭车案）/ ≤25（standalone 案）· Key 只经进程环境 loader（收据 name-only 零键值）· `.env*` ABSENT · `actualSpendCny=null`。
- **失败兜底**：两臂冲突或机制不可判 → 升级协调方（沿原条款）。

## 5. 风险评估（REQUEST 必写④）

| # | 风险 | 定级 | 缓解 |
| --- | --- | --- | --- |
| R1 | **间歇本体未根除**：duplicate re-roll 根因刀（G7FIX-3 裁定后续②）未落地——`generation_duplicate_question` 触发频率未降，对称标记仅把它从致死变可恢复；单绿 run 读数力有限 | 高影响 · 中概率 | G 臂读数明示「非恒绿」限定；POST7B 关闭强度依赖 trio 三绿；关闭路径归 SSOT 刀 |
| R2 | **跨 run 形状漂移史**：≥5 形状在卷（窗红×3值 / `:236` 7A×2 / 409 route / post-M7 / consume 7F 夹具） | 中 · 中 | R 臂判读按 ledger 序位非 failureClass；升级条款常备；零强行归类 |
| R3 | **坐标/机制漂移**：老窗 blob 已死；G7FIX-1 窗内插入等待机制=窗内时序形状已被改变——原窗红（若含 timing 成分）可能被吸收或变形 | 中 · 确定 | §3 重锚表 EXEC 复核；判读按 marker 语义不按裸行号 |
| R4 | **预算紧**：链累计 166≤200，standalone 案 est ≤25 可容但紧 | 低 · 确定 | 搭车案零增量规避；帽裁定归协调方（G7TRIO-2 已前置申请 200→300） |
| R5 | **双钉漂移**：钉①③ blob 已变（授权链在卷） | 低 · 已发生 | EXEC 按当值 blob 重钉亲算；withhold 契约本体未见触碰读数 · EXEC 复核 |
| R6 | **行治理越界**：POST7B/7A-DOWNGRADE/`:107` 三行 P1 OPEN 处置权全归协调方 | 低 · 纪律 | 本刀全链 Ban 翻行 Ban 并行；`g7SuiteGreen=false` 维持（翻转=trio 三绿后 SSOT 刀） |
| R7 | **base 分叉**：本线落后主线 132 commit | 低 · 已披露 | EXEC 基点须主线或 trio2 线；本 commit 仅落本线 · 零 rebase 零 force-push |

## 6. Ban 列表

Ban 碰产品码（`apps/**` · `packages/**` 零触碰）；Ban 碰 A() 断言本体与埋点（M1-M7/F 链 armed 延续零触碰零增删）；Ban 碰 withhold 契约（stderr 断言原文回读面）；Ban 碰反伪造四钉当值 blob；Ban 碰共享 SSOT 行结构（backlog `GAP-CMOP03-POST7B`/`GAP-CMOP03-7A-DOWNGRADE`/`GAP-G7K-API-REDS :107` 只读引用 · checklist/矩阵只读引用）；**Ban 归因两岔任一岔 · Ban 就地归因既有 OPEN 行 · Ban 行关闭/翻转**（归协调方 SSOT）；Ban 碰 G7TRIO-2 线与 g7 系已 nail 链（只读引用）；Ban retry-to-green · Ban 未经授权加跑（standalone 案须协调方授权）；Ban secrets/键值入收据/invented spend/`.env*`；Ban force-push；Ban self-approve（预执行双审 mw-e2e-ha + mw-model-op 独立席位）；Key name-only · est 0 live（本 commit 零实跑）· pins 十一值照抄。

## 7. 流程声明（REQUEST 必写⑦）

本文（复盘/重启 REQUEST）→ 预执行双审（mw-e2e-ha + mw-model-op · stub 见 §8）→ meetwise 授权 → EXEC（重锚复核 + 判别读数 · 搭 G7TRIO-2 CMD1 或 standalone 按授权）→ post-prove 双审 → meetwise 授权 nail。docs 执行地：worktree `meetwise-line-post7b` · 分支 `line/cmop03-post7b-discriminator`；run 面执行地随协调方基点裁定。

## 8. 交付物与本 commit

- `ai-docs/delivery/harness/cmop03-post7b-restart.md`（本文）
- `ai-docs/delivery/cmop03-post7b-restart.slice.md`（切片速览）
- `ai-docs/delivery/reviews/REQUEST-2026-10-09-cmop03-post7b-restart-mw-e2e-ha.md`（空审 stub · 待审席填写）
- `ai-docs/delivery/reviews/REQUEST-2026-10-09-cmop03-post7b-restart-mw-model-op.md`（空审 stub · 待审席填写）

本 commit = 上述恰 4 文件、零其他 diff；作者/提交者 `mw-core <mw-core@meetwise.local>`。

## 9. Not-a-pass 诚实尾条

Not a pass · not coding（修复范围=空集 · 本 REQUEST docs-only 零码零埋点）· not proven · not run（零实跑零 live 零容器零 sidecar）· not 重启 EXEC（判别读数未发生）· not 定谳（两岔仍未分 · ×3 窗红原值 78798/101906/67369 retained 零冲销）· not 归因（G7FIX 系归因成果系彼等刀卷面 · 本刀零新增归因）· not 修复（§2.2 已覆盖项非本刀功）· not 行处置（三行 P1 OPEN 维持）· not covered · not HA · not releaseEvidence · not nail · not coordinator authorize · not 预执行双审 done · `g7SuiteGreen=false` · `actualSpendCny=null` · alone ≠ dual
