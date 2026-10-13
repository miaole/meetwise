# E2E-SCENE-409 — 选岗/身份 409/误判场景 E2E 补刀（#133/#195 409 退役行为面 + #270 静默误判现状锚 · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）→ **`executed:awaiting_post_prove_dual`**（EXEC 落卷 `line/e2e-scene-409` @`3735d6b9`·恰 1 件 157+/0−·EXEC 席状态行未随翻·nail 席如实补登）→ **nailed**（post-prove 双席 BOTH PASS @2026-10-12·裁 A 扩面授权链追认终局）

**席位**：E2E 场景补刀起草席（北星 loop · E2E 覆盖缺口盘点处方 7-②·P1 消零成本最低项）。
**基线**：`feat/mysql-schema-skeleton` @ `f92a5035`（主线 tip·`git log -1` 实测=merge(e2e-assert-refresh) S1 85 断言绿+UI 18P/0F 落主线）。分支 `line/e2e-scene-409` · 工作树 `meetwise-e2sc`（`git worktree add meetwise-e2sc -b line/e2e-scene-409` 仓根同级 worktree·本起草席已立·建前实查均不存在：`git worktree list` 八树无 e2sc·`git rev-parse --verify refs/heads/line/e2e-scene-409` exit 128 BRANCH_ABSENT）。
**防重双对表（亲证）**：`rg -l "e2e-scene|409.*scene|scene-409" ai-docs/delivery/harness/ ai-docs/delivery/execution-master-checklist.md` → **EXIT=1 零命中**（harness 目录与 checklist 双零）——本刀卷名 `e2e-scene-409-REQUEST.md` 全仓唯一。
**蓝本**：①审计三件原文=更正版 issues-master `issues-master.md`（外部审计总表·本机外部件·不入仓·仓外路径如实登记）**#133=:203 / #195=:179 / #270=:352**（逐字誊录要点见 §0.1·引文锚点列为本刀授权面）②形制沿 `ai-docs/delivery/harness/e2e-assert-refresh-REQUEST.md`（rev2 形·Ban/pins 同源誊录见 §5）③场景先例=`e2e/full.e2e.ts` 红① 显式耗尽两步形（`:333-388` 区·trial 正面行使+402 诚实化）+ g7fix1 DB 直连断言形（`:435-455` 区 pg Client）。

## §0 现状锚（起草席亲读·base `f92a5035`·file:line 逐条 sed/rg/实跑复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 审计三件原文要点（issues-master 更正版逐字誊录·行号亲读）

| # | :line | 原文一句话（逐字） | 修法列要点 | 状态列 |
|---|---|---|---|---|
| #133 | :203 | 「候选人简历路由分类器词典过宽（typescript/javascript/html/css 归前端、”测试“归 qa、”算法“归 ai_ml），典型 Node.js+TS、Java+测试、Python+算法 后端简历被判 ambiguous，0 叶命中也未决 → begin 同步 409 candidate_route_undecided；前端只显示 begin_failed、无手选岗位出口（原 #195 用户侧，已并入）」 | 第 0 批：收窄泛词；歧义与 0 叶命中都降级为 backend/general 默认路由而非 409，并补样本回归集（含 #270 反例） | 仍存在（写于 2fab7946 时点） |
| #195 | :179 | 「候选人路由词典过粗（TS/JS 归前端、”测试“归 qa），典型 Node.js 后端简历被判 ambiguous → begin 409 candidate_route_undecided；前端只显示 begin_failed，也不能手选岗位（与 #133 同根）」 | 与 #133 一起改；歧义时让用户选目标岗位（#259）而不是 409 | 已并入 #133（编号保留） |
| #270 | :352 | 「候选人路由静默误判：backend/general 与唯一另一叶并存时直接取该叶，后端简历只因提到”自动化测试“就被静默分到 qa/quality_engineering 题库（实跑”后端开发 Redis MySQL 自动化测试“→qa），用户无感知、不报 409（与 #133 方向相反：不是拒绝而是悄悄错路）」 | general+单叶时若该叶为 qa/ai_ml 需更强证据；补回归样本；面试页展示“本场按 X 方向出题”（随 #259） | 仍存在（写于 2fab7946 时点） |

### 0.2 实树现状（f92a5035 重盘·全亲读）

| 面 | 锚（实测） | 现状 |
|---|---|---|
| ROUTE-DICT v3 词典面 | `packages/domain/src/candidate-profile-route.ts:29` `CANDIDATE_ROUTE_POLICY_VERSION = 'candidate-route-2026-10-frozen:v3'`；`:52-78` 词典（html/css/javascript/typescript→`backend/general`；裸 go/测试/算法 移除·上下文化 token 接管·qa 叶收「自动化测试/测试工程师/软件测试」等自述级 token）；`:133-145` `classifyCandidateProfileByRule` | **#133 rev3 已落主线**（merge 链 `127ffbcd` feat(route-dict)·42 fixture 回归语料·candidate-route:prove 75 断言）。除 `profile_empty` 外恒 decided |
| 409 退役降级臂 | 同文件 `:139-144`：general+唯一 specific 叶 → 取 specific；≥2 specific / 0 命中 → `backend/general` 兜底 + `degraded:true`（`degradedFrom: 'ambiguous_language_evidence'\|'no_signal_hit'`）。`packages/db/src/routing/candidate-route.ts:32` undecided 仅 `profile_unavailable\|no_signal_hit\|ambiguous_language_evidence`（后两 v3 下结构不可达·防御保留）；`:56-68` 简历缺失/解密失败→`profile_unavailable` | **旧症状（歧义→409）主线结构性不可达**。`apps/api/src/modules/interview/interview.service.ts:233-236` 409 仅 undecided 映射面保留 |
| begin 供给链 | `interview.service.ts:233-236`（通用面 `application_id == null` 才供给·同事务先于扣额/入队）→ `routing/candidate-route.ts:71-105`（decision+snapshot 双行 INSERT·表 `candidate_profile_route_decision`/`candidate_profile_route_snapshot`=迁移 0142 `:25/:49`）→ worker `adaptive-role-resolve` 门读 snapshot | 供给端到端链路在握·**E2E 全卷零行使路由断言面**（见 0.4） |
| #270 v4 更强证据闸 | **`git merge-base --is-ancestor bb7ba6b6 f92a5035` 实测=非祖先**。policy v4（`candidate-route-2026-10-frozen:v4`·qa/ai_ml general 并存须岗位自述级强证据·词典本体零改）只存在于工作树 `meetwise-qp` 分支 `line/qbank-planner-honesty` @`bb7ba6b6` | **处方背景漂移如实登记**：处方 7-② 背景「policy v4 歧义兜底·bb7ba6b6 已并主线」与实树不符——主线 tip 现为 **v3**，#270 静默误判路径在主线**仍可复现**（§0.3 E 实测 qa）。本刀场景设计对 v3/v4 两态分别定谳（§1 R3 随演条款），**Ban 预断 v4 行为** |
| S1 码透传（H4 面） | `git merge-base --is-ancestor e0208e9f f92a5035` 实测=在主线。`interview.service.ts:263-268` startPayload 仅在场写 `targetRole`/`focus` 键（缺省零新键） | #259 S1 已落·本刀零触（§3） |
| UI 面 | #133 用户侧出口=v3 409 退役（歧义简历不再 begin_failed）+ #259 目标岗位输入（e0208e9f）共同收口 | 本刀不做 UI spec（apps/web/e2e-ui 零 diff·§3）——UI 面归 UI 矩阵刀 |

### 0.3 定谳表（分类器纯函数实测·2026-10-11·`npx tsx` 两树亲跑·fixture 即本刀 E2E 语料）

| fixture | 语料（逐字） | v3（主线 f92a5035 实测） | v4（meetwise-qp 树实测） | 定谳 |
|---|---|---|---|---|
| A 现有 happy path 语料 | 「后端工程师 3 年。负责高并发订单系统,用 Redis 做分布式锁与限流,MySQL 分库分表,消息队列削峰。」 | `backend/general` decided non-degraded | — | 现有套件全卷从不触歧义/降级面=**缺口坐实** |
| B 规整+语言叶（R1 语料） | 「3 年 Node.js 后端开发，使用 NestJS、MySQL、Redis，负责订单服务。」 | `backend/nodejs` decided non-degraded | 同 v3（语言叶不受闸） | **v3/v4 不变量**·可跨版本断言 |
| C 旧 #133 复核样本 | 「Java Spring Boot 后端，负责单元测试与接口测试」 | `backend/java` decided non-degraded | — | v3 收窄后**旧歧义样本不再歧义**——409 旧症状对历史样本亦不可复现 |
| D 歧义·qa 泛词+语言叶（R2 语料） | 「自动化测试工程师，负责 Python 测试工具与接口测试平台开发。」 | `backend/general` **degraded** `ambiguous_language_evidence` | 同 v3（双 specific 不入 v4 闸） | **定谳=degraded 兜底正常开·非 409**（处方二选一按此落断言）·v3/v4 不变量 |
| E #270 误判样本（R3 语料） | 「后端开发 Redis MySQL 自动化测试」 | **`qa/quality_engineering` non-degraded（静默误判在主线仍可复现）** | `backend/general` degraded（v4 闸关闭误判） | **随演面**：预期叶以 EXEC 时点主线 policy 实测定谳（v3→qa 现状锚 / ≥v4→general 降级）·Ban 写死单值 |

### 0.4 缺口证实（full.e2e.ts 全卷亲读）

- 全卷简历语料 3 段（`:49` 主用户/:71 OCR 预期/:349 trial 用户）全为 A 型规整语料——`rg -n "candidate_profile_route|candidate_route|leaf_track" e2e/full.e2e.ts` **零命中**：begin→202 后路由决策落库/降级臂/误判面全卷零断言。
- `ai-docs/delivery/e2e-requirement-coverage-matrix.md` 全卷 rg 无候选路由/选岗行（#133/#195/#270 编号零命中）——**矩阵登记缺口**（本刀 SSOT 只读·更新建议见 §2-6 登记条款）。

## §1 场景设计（三场·全落 `e2e/full.e2e.ts` 追加段·产品码零字节·file:line 实锚·EXEC 立项重 pin）

**插入锚**：`e2e/full.e2e.ts:388`（`[异常] 402 后额度零泄漏` 断言）之后、`:390`（`order2` 下单）之前——沿红① 显式耗尽形后继位，同区新注册用户先例（`signupOrLogin('e2eN_…')`）。

**公共形（沿红① 先例+0154 trial 语义）**：每场独立新注册用户（`e2e4_`/`e2e5_`/`e2e6_`+tag·trial 1.00 恰够一场·零下单依赖）→ `consentResumeProcessing` → `uploadTextResume`（语料逐字照 §0.3）→ `POST /interview` → `begin`（`resume-id` 头）。DB 断言沿 g7fix1 先例 pg Client 直连（PG* env contract 同形·SELECT-only·连接 finally 释放）。

### R1 规整差分锚（`e2e4_`·fixture B·begin-face）

1. begin → `202 accepted`（`jobId` string）；
2. DB `candidate_profile_route_decision WHERE interview_id` 恰 1 行：`route_outcome='route_decided'` ∧ `leaf_track_id='backend/nodejs'` ∧ `allocation_bps=10000`；`policy_version` 读取入收据（软记录·版本升级=他刀语义变更不碎本刀，见 §5 Ban 预断条款）；
3. DB `candidate_profile_route_snapshot WHERE interview_id` 恰 1 行：`status='interview_snapshotted'` ∧ `leaf_track_id` 与 decision 行同值（双行一致性）；
4. abandon → `abandoned+released`（UC018 `:107-:118` 同形·释放还池如实记账·本场后续零消费）。

### R2 歧义 P1 旅程面（`e2e5_`·fixture D·全旅程）

1. begin → **硬断言 `r.status===202 && b.accepted===true`**（#133/#195 P1 旅程不变量定谳面：歧义简历 begin **不再 409/begin_failed**·409 退役降级臂行为；`409 candidate_route_undecided` 仅 `profile_unavailable` 防御可达=本夹具结构不可触发）；
2. DB decision 行：`route_outcome='route_decided'` ∧ `leaf_track_id='backend/general'`（降级臂兜底·§0.3 D 定谳）∧ snapshot 同叶；
3. `driveInterviewToTerminal` 全旅程（真出题真作答·服务端 question identity 口径零改）→ 终态 ∈ `INTERVIEW_TERMINALS`——**降级兜底叶可开成完整面试=「无死胡同」用户旅程第 4 断点修复的 E2E 行为证**。

### R3 #270 现状锚（`e2e6_`·fixture E·begin-face·随演条款）

1. begin → `202 accepted`（#270 原文明示「不报 409」——误判面与 409 面互斥·begin 成功本身即两态共同预期）；
2. DB decision 行：`route_outcome='route_decided'` ∧ `leaf_track_id` 按 **EXEC 时点主线 policy 实测定谳**：policy 仍 v3（bb7ba6b6 未并）→ `'qa/quality_engineering'`（现状锚·断言文案须带「#270 静默误判现状·v4 并线后随演」字样）；policy ≥v4（bb7ba6b6 或后继已并）→ `'backend/general'`（v4 闸关闭误判·降级臂）。**EXEC 立项重 pin 时以 `packages/domain/src/candidate-profile-route.ts` 实测 policy 字符串为准·两向皆合法·Ban 凭本卷 §0.3 单值写死不重测**；
3. abandon 释放（同 R1-4）。

**断言力**：三场合计显式 `A()` 断言 ≥10（R1≥6 / R2≥5 含旅程既有断言链消费 / R3≥3）——§2-3 单列下界。**禁 skip-as-pass**：零新增 `test.skip`·DB 断言零行即 FAIL·不设 capability 门控（三 fixture 全文本简历·不依赖 OCR/语音 Key 面）。

## §2 验收断言候选（pre-exec 双审核对单基面·EXEC 立项重 pin）

1. **S1 全卷绿含新段**：`pnpm e2e:isolated` EXIT=0·既有 91 断言面零丢失（nail 基线 91·本刀新增 ≥10→ EXEC 时点 assertionCount ≥101 为下界候选·若基线随他刀漂移照重 pin 实测为准）·reviewLedger capability 类仍恰 2（`image_ocr_unavailable`+`voice_unavailable`）·无新增 skip 类记录。
2. **三场行为断言逐位落码**：R1-1..4 / R2-1..3 / R3-1..2 全行使·R2 终态必达（journey deadline `INTERVIEW_TERMINAL_DEADLINE_MS` 沿既有 420s·禁放宽）。
3. **断言力下界**：新增显式断言 ≥10·其中 DB 路由行断言 ≥6（R1 三行+R2 两行+R3 一行）·HTTP 旅程断言 ≥4；零 test.skip·零既有断言删除/弱化（`git diff` 既有 A() 位逐字保留）。
4. **R3 随演定谳入收据**：EXEC 时点主线 policy 字符串实测值+所选预期叶+依据（bb7ba6b6 祖先关系 `git merge-base --is-ancestor` 实测）三行如实入卷——两向都合法·隐瞒方向即 FAIL。
5. **markers=0（§7）+ est live（§6）双声明入收据**；冲突标记门 grep=0；LIVE 协议三条款（§4）履行实录。
6. **登记建议（本刀 SSOT 只读·登记归协调方）**：覆盖矩阵建议新增「选岗/身份路由（#133/#195/#270）」行=full.e2e 场景段 partial（本刀后）+#270 v4 行为面 residual（v4 并线前主线现状=误判可复现·R3 锚定）——登记建议以本卷 §0.4 为准入矩阵更新工单·Ban 直接改矩阵。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码零改**：apps/api / apps/worker / apps/web / packages 全域零 diff——修法全落 `e2e/full.e2e.ts` 单文件追加段（+必要时 `e2e/helpers` 零新依赖·沿用既有 import 面）。词典/优先序/policy 版本零字节触碰。
2. **v4 并线零触**：`line/qbank-planner-honesty`（meetwise-qp 工作树）为他刀卷·本刀 Ban 触；R3 随演条款只读消费其存在性·不并不催不代落。
3. **#259 UI 刀面零触**：apps/web/e2e-ui 零 diff·目标岗位输入行为不在本刀断言面；「本场按 X 方向出题」展示面（#270 修法列随 #259 项）不在本刀。
4. **OCR/语音 capability 跳过面不动**：既有 ⊘ 披露口径照旧。
5. **SSOT 只读**：execution-master-checklist / product-campaign-LEDGER / issues-master / e2e-requirement-coverage-matrix 行与统计零改（引用只读·§2-6 登记建议只落本卷）。
6. **零迁移零新库表**；零 secrets 入库（`MODEL_API_KEY` 仅进程 env 运行时态）。
7. **断言口径诚实**：R1/R3 abandon 释放=设计内还池·收据如实记账·禁写「零消耗」；R2 全旅程=真模型消耗·照 §6 申报。

## §4 依赖

- **立项/EXEC 码面依赖：零硬闸**——触面文件（`e2e/full.e2e.ts` 单文件）主线在握·可即期 EXEC 立项。
- **LIVE 面协议（照 e2e-assert-refresh §4 同条款照写）**：跑 `e2e:isolated` 真供应商面须 **`MODEL_API_KEY` 只经 loader（`~/.meetwise-secrets/load-model-api-key.sh`）source 注入进程环境** + **`E2E_SKIP_DOTENV=1`**（`scripts/run-e2e.mjs:17-19` 已落码钩·防仓根 .env 残留物回灌）+ **禁 .env 回灌** + 键值零打印零入卷；`scripts/run-e2e.mjs:48` 缺 Key 即 throw fail-closed（`live_provider_key_missing`）·Ban 假服务开关（`scripts/e2e-fake-service-flags.mjs` 门照旧）。
- **裸跑禁令**：验收一律锁 isolated wrapper 口径（`e2e:isolated`）·禁裸跑直呼冒充验收。
- **DB 断言环境**：PG* env 由 isolated runner 注入（g7fix1 同 contract·`:435` 区先例）·缺 env 即 throw（同形 fail-closed·Ban 静默跳过 DB 断言）。
- 无前置刀；bb7ba6b6（v4）非前置（R3 两向定谳·§1-R3-2）。

## §5 Ban 列表 + pins（沿 e2e-assert-refresh 卷 §5 同源誊录 + 本刀增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master/e2e-requirement-coverage-matrix 行与统计只读引用）；Ban 迁移越权（本刀零迁移）；Ban 触其他工作树（含 meetwise-qp v4 卷）；Ban 伪造已问/已验来源；**本刀增补**：Ban 产品码改动（§3-1·api/worker/web/packages 零 diff·词典/policy 零字节）；Ban skip-as-pass（零新增 test.skip·零断言删除·断言力只增不弱）；Ban DB 断言静默跳过（PG* env 缺失即 throw·零行即 FAIL）；Ban v4 行为预断（R3 预期叶以 EXEC 时点主线 policy 实测定谳·Ban 凭本卷或处方背景单值写死）；Ban 幻影定谳（EXEC 收据须载 §2-4 三行·两向如实）；Ban 语料漂移（三 fixture 语料逐字照 §0.3·改语料=改定谳前提须回炉）；Ban R2 旅程窗口放宽（420s deadline 零改）；Ban .env 回灌与键值打印/secrets 入卷；Ban 以本刀 EXIT=0 宣称 LIVE 全绿（既有披露口径照旧）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（账面无实值记录照抄不翻·本刀 est live>0 见 §6——外呼消耗照 EXEC 收据另账如实记账·不冒充零消耗）

## §6 est live（>0 如实申报·1-2 场量级）

本刀新增段 LIVE 增量 ≈ **2 场量级**：R2 全旅程 ×1（真出题真作答至终态）+ R1/R3 begin-face 各 ≤1 题生成（abandon 前 worker start job 可能已出首题·如实另账）。照 G7Y 口径申报上限 **≤3 场量级**（含一次复跑余量）；套件主体（既有 91 断言面）消耗随 S1 全卷跑照旧·非本刀新增。实耗超限或低于申报均照 EXEC 收据逐跑如实另账（不冒充·不预估入账）；零生产操作；secrets 面=loader 注入进程 env 运行时态（§4）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/e2e-scene-409-REQUEST.md`）五类标记词 grep 零命中（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 diag/h2/e2e-assert-refresh 卷同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 场景清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin·R3 随演定谳三行必落）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**登记建议（pre-exec 双审可核）**：①本刀立项关联处方 7-②（E2E 覆盖缺口盘点·P1 消零成本最低项）；②处方背景「v4 已并主线」漂移已 §0.2 如实登记——若 v4 在本刀 EXEC 前并线·R3 按随演条款定谳为 `backend/general`·零回炉；③覆盖矩阵「选岗/身份路由」行登记建议见 §2-6。

## §9 nail 席登记（post-prove 双席 BOTH PASS·双席登记项随落·disposition/收据勘误节·2026-10-12）

**双席判决照登（互盲独立·2026-10-12）**：席1=实现核对 **PASS**·LIVE 独立复跑 119 断言一次过；席2=验收/风险 **PASS**。loop 协调方本次派单即 nail 授权。nail 并线 `line/e2e-scene-409` @`3735d6b9` → 主线 merge（两卷触 full.e2e.ts 零冲突 ort 自动合并·本卷段 :390-:545·batch2 段随 +157 下移至 :647-:871）。

**席2 登记四条（nail 席逐项实物复核后照登）**：
- **R-1 REQUEST Status 未随 EXEC 演进——nail 补登**：EXEC 落卷时状态行仍 `draft:awaiting_pre_exec_dual` 未随翻·nail 席沿 batch2 先例补登三节点链（draft → executed:awaiting_post_prove_dual → nailed）·本卷 Status 行即补登实物。
- **R-2 §2-6 覆盖矩阵登记建议待登记工单**：「选岗/身份路由」行登记建议（§2-6）未入 `e2e-requirement-coverage-matrix.md`——SSOT 只读纪律下登记归协调方工单·nail 席不代行·待登记。
- **R-3 并线顺序提示（与 batch2 双双触 full.e2e.ts·后并卷重 pin）**：batch2 先并（`f7082391`·第 10 段卷尾 :488 后追加 225 行）·本卷后并（本 merge·:390 后插入 157 行）——两卷锚区 :388-:545 vs :488+ 理论不交叠·实测 ort 零冲突亲证。后并卷重 pin 面见席1 A-1（g7fix1 引用锚随本刀 +157 自移）·batch2 卷内行号引用若涉 :488 后区由 batch2 侧后续刀按 §8 重 pin 条款自理（本卷不越权代改）。
- **R-4 assertionCount 逐跑漂移 [-1 既有]**：assertionCount 逐跑存在既有侧 ±1 漂移（既有终态族 diagnosis_ready/diagnosis_unavailable 两跑异·batch2 EXEC 已登记同源·既有断言族皆收）·本刀新段 28 断言恒在不受漂移影响——nail 复验以 EXIT=0 + 新段全行使 + capability 恰 2 为准·不以单次 assertionCount 绝对值为门。

**席1 锚漂两条（nail 席并后主线实测重 pin 照登）**：
- **A-1 g7fix1 pg Client：引用锚 :408-419 → 实锚 :564-576**：卷内 :406 注释「g7fix1 :408-419 先例同形」在基线 `f92a5035` 时点正确（实测基线 G7FIX-1 块起 :407）·本刀 :390 插入 +157 后并后主线实际 :564-576（comment :564/env 检查 :567/`new Client` :568/finally :576·nail 实测逐一命中）——重 pin 为 :564-576·:406 注释照登为历史引用（注释非断言·断言力零弱化·码面不动保持 EXEC 恰 157+/0− 触面）。
- **A-2 UC018 abandon：:111-116 三态同位仍准**：abandon POST+断言区 :111-116 在基线/EXEC 分支/并后主线三态实测同位（本刀插入点 :390 在其后·零影响）——仍准照登·无需重 pin。

---


*E2E-SCENE-409 REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`f92a5035` · 分支 `line/e2e-scene-409` · 工作树 `meetwise-e2sc` · 蓝本=更正版 issues-master #133=:203/#195=:179/#270=:352（逐字誊录）+ 形制 e2e-assert-refresh-REQUEST（Ban/pins 同源誊录）+ 场景先例红① 显式耗尽形/g7fix1 DB 直连形 · 三场=R1 规整差分锚（backend/nodejs）+R2 歧义 P1 旅程面（degraded backend/general 全旅程·409 退役定谳）+R3 #270 现状锚（v3→qa 现状 / ≥v4→general 随演两向定谳）· 定谳=v3 主线歧义简历 degraded 兜底正常开非 409（分类器纯函数双树实测）· 产品码零改 · v4 并线零触 · est live ≤3 场量级（1-2 场主体·如实另账）· pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
