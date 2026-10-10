# H1 阈值决议（LEVEL-SCHEME v2 · 批2 首交付物 · docs-only 决议件）

**席位**：H1 阈值决议起草席（北星 loop · 批2 派序首刀）。
**基线**：`feat/mysql-schema-skeleton` @ `9f6edf8f`（主线最新 tip·分支 `line/h1-thresholds`·工作树 meetwise-h1）。
**蓝本**：`batch-residual-plan.md:96` H1 行（`line/batch1-residual` @ `ab02d499` 实树亲读）——「fix-roadmap 批2 §0：facts 召回率+κ+高估率数值与样本集·附录 A 数值全为提议初值——纯 docs 决议件·LEVEL-SCHEME 验收前置」。
**上游三源（均亲读原文）**：
1. issues-master **更正版**（`/Users/miaole/Documents/Meetwise产品审计-更正版/issues-master.md`）：**#45**(:332「级别判定粗糙：只用 overall 平均分 ≥75/≥50 三档…按 fix-roadmap『级别判定最终方案』改造（五档+scheme_version+离线对比+规则把关）」)·**#102**(:339「成长链三套规则四个数值互不关联：弱项 GAP=60、级别 75/50、里程碑达标≥70 · 阈值集中到版本化策略配置（scheme_version）」)·#104(:340 读面 v2)·#105(:471「阈值与标度匹配无数据·在离线校准中验证并重设阈值」)·#124(:341)·#125(:472 LEVEL_LABEL 五档)·#38(:330 自适应常量·关联)。
   > 行号注记：任务书锚「:250 区」为派单转抄口径；更正版实树 #45 族实测位于 **:330-341**（`:248-252` 区为 #111-#115 鉴权条目·已核对非本族）。「三套规则四阈值」原文出 #102(:339)，≥75/≥50 出 #45(:332)。
2. fix-roadmap **更正版**（同目录）：批2 §0(:82 阈值决议=本批首个交付物·复核新增)·批2 验收(:94 「facts 召回率 ≥ 阈值（**阈值待『阈值决议』确定，当前未定义**）」·:95-96 κ/高估率门槛+calibration release 才切 active)·**附录 A**(:155-167 级别判定最终方案摘要·以 refactor-backlog A.9 修订与决策记录为准)。
3. refactor-backlog（`03-原始清单与评审/`）：**A.3.1** 加权与收缩·**A.3.2** 五档与每档判定证据要求（数值全表）·**A.3.4** 规则把关表·**A.3.5** 置信度与状态机·**A.3.6** 校准四步与发布门·**A.9** 2026-10-09 评审修订（Lmin 取消/S≥30 unavailable 更正/单字段+版本号+离线对比）。

**决议地位**：本档=**数值立法**（决议初值 + 版本化协议 + 单源规范 + 校准修订协议）。解锁 H3 LEVEL-SCHEME（#45/#102/#104/#105/#124/#125/#211/#186/#47/#188）验收判据；本档零码动，实施归 H3 EXEC（边界裁决见 §8）。

---

## §0 决议一览

| 决议项 | 裁定 | 出处 |
|---|---|---|
| 档位制 | 五档 L1-L5（junior/mid/senior/staff/principal）·中文标签入配置不入 DB CHECK | 附录 A 第 1 条 |
| v2 分档分数阈值 | S≥85→L5 · S≥75→L4 · S≥65→L3 · S≥50→L2 · 无下限→L1 | A.3.2 表（决议采纳为 v2 初值） |
| scheme_version | `'v1'`（现行三档·转历史只读）与 `'v2'`（五档·候选→active）·按版本追加不双写 | 附录 A 第 2 条 |
| 单一出处 | 数值运行时单源=`level_policy_version` 表（发布后不可变）；TS 侧镜像常量落 `packages/contracts`（沿 CONSENT_PURPOSES 先例）·形态按 §4 附录 A' 冻结抄写面由 H3 EXEC 一次落码 | #102 修法 + A.4 + contracts:449 先例 |
| 样本不足不出级别 | `unavailable` 只在卡数或覆盖不足时触发·低分不是无数据 | 附录 A 第 5 条原文（§5 全引） |
| 发布门 | 加权 κ≥0.60 · 高估率≤5% · 相邻档以外错判率≤1% · L5 100% review_required · 黄金集 ≥150 场每档 ≥20 | 附录 A 第 3 条 + A.3.6（数值为本决议补定·§6） |
| facts 召回率 | 初值 ≥0.70 · 样本简历集 ≥20 份（金标待建） | 更正版 fix-roadmap :94（阈值上游未定义·本决议补定初值·§6.3） |
| 落地边界 | **裁决 B：本刀仅决议文档**·常量固化+三散点改读单源归 H3 LEVEL-SCHEME EXEC | §8（理由四条） |

---

## §1 现状盘点（v1 散点定位表·基线 `9f6edf8f` 实测 rg 重 pin）

### 1.1 阈值散点（判定面本体）

| # | file:line | 现值 | 语义 | v2 去向 |
|---|---|---|---|---|
| S1 | `packages/domain/src/career.ts:12` | `overall >= 75 ? 'senior' : overall >= 50 ? 'mid' : 'junior'` | v1 三档级别分桶（#45 判定面） | 读单源；五档化归 H3（#45 EXEC） |
| S2 | `packages/domain/src/career.ts:16` | `完成 3 场达标(≥70)模拟面试` | 里程碑达标线（#102 第四值） | 注册入策略表（MILESTONE 类·待校准登记项 §2.3） |
| S3 | `apps/web/app/report/[id]/page.tsx:31`（消费 :327） | `LEVEL_LABEL = { junior:'初级', mid:'中级', senior:'高级' }` | 前端档位标签三档（#125） | 五档+旧版显示映射+未知值中文兜底归 H3（#125 EXEC） |
| S4 | `packages/domain/src/assessment.ts:16` | `export const GAP = 60` | 达标线单源（**已单源先例**·EXTREV-1 SCORE-WRITER rev2 D5(i)「60 一处定义，全仓复用禁字面量散布」） | 保持；消费钉 `packages/domain/src/scoring-aggregation.ts:15,204`（:187 三钉注记）；A.3.1 最高通过难度线 s_i≥60 沿用同值·**语义分立**（§2.3 R3） |

### 1.2 关联面（非散点·本决议不触·列作 H3 边界坐标）

| file:line | 内容 | 归属 |
|---|---|---|
| `apps/api/src/modules/interview/interview.service.ts:725,728` | generateCareerPath facade·:725「对外契约冻结:成功体 {readiness,level,milestones} / 409 信封 / 500 internal_error / GET 语义全部原样」 | H3 改造时按 A.9-7 单字段+版本号协议换约·非本刀 |
| `apps/api/src/modules/interview/interview.service.ts:746-747` | derive seam（C-HA-2·selectCareerPathDerive 注入点） | H3 规则化改造的天然接缝 |
| `apps/api/src/modules/interview/interview.controller.ts:234,240` | `POST/GET :id/career-path` 端点（#124「按需 POST·ON CONFLICT 原位覆盖」审计锚） | H3（#124 EXEC） |
| `packages/db/src/growth-generation.ts:84-86` | `INSERT INTO career_path … ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET level=…`（v1 原位覆盖写入路径） | H3 改 `candidate_level_assessment` 追加式（附录 A 第 2 条） |
| `packages/ai-graphs/src/career-path.ts:4,23` | career-path 单节点图 dep 注入边界 | H3 换 derive 实现面 |
| `packages/db/migrations/0103_scoring_deterministic_aggregation.sql:14-16,235,277` | 确定性公式 band∈{below,meets,exceeds}·score=50×band（0/50/100 三档标度·#104「颗粒粗」） | H3 读面 v2（#104）·非阈值表项 |
| `packages/db/migrations/0100_scoring_fact_root.sql:57,102` | `difficulty smallint CHECK 1..5` 冻结列（rubric 发题两侧） | v2 证据条件的数据前置（已具） |
| `packages/domain/src/adaptive-interview.ts:132-139` | CONF_ENOUGH=0.7/CONF_WEAK=0.4/PROBE_CAP 3·2/LOW_SCORE=40/OFFRAMP_LOW=2/HOOK_CAP=0.6 | #38 族（自适应常量·自带回放评测集校准）·**不并入本决议数值表**·仅登记关联 |

### 1.3 先例（单源形态参照）

- `packages/contracts/src/index.ts:449-450`：`export const CONSENT_PURPOSES = ['resume_processing','interview_personalization','voice_capture'] as const;` + `export const ConsentPurpose = z.enum(CONSENT_PURPOSES);` —— 数组常量+派生枚举·包依赖可达性：`apps/api`(:81)/`apps/web`(:22)/`packages/domain`(:45) 均依赖 `@meetwise/contracts`。
- `packages/domain/src/assessment.ts:12-16`：GAP 达标线单源注记形态（「一处定义，全仓复用禁字面量散布」+消费钉计数）。

---

## §2 统一阈值表（scheme v2 · 决议初值）

> **身份声明**：下表数值=附录 A/A.3.2「提议初值」经本决议**采纳为 v2 决议初值**（operative as scheme_version='v2' 的校准前基线）。身份仍为**待校准**：黄金集校准（§6.2）后按 §7 协议升版修订；修订不回改本档（append-only·新版本新行）。
> **任务书示例值披露**：派单任务书示例「<50 junior/<65 mid/<80 senior/<90 staff」与附录 A 数值不一致；任务书自载「按附录 A 方案」，故**以附录 A 为准**（S≥50/65/75/85），示例值不采纳。

### 2.1 五档主表（A.3.2 全量·决议采纳）

| 档 | 内部枚举 | 最低有效卡数 | 最低覆盖能力数 | 难度证据要求（有效卡） | 分数条件 | 其他条件 |
|---|---|---|---|---|---|---|
| L1 初级 | `junior` | 3 | 2 | 无 | **无分数下限**（证据够即可得 L1；S<30 仅附信息码 `below_l1_reference`） | 兜底档；证据（卡数/覆盖）不足才 `unavailable`（§5 条款） |
| L2 中级 | `mid` | 5 | 3 | 至少 2 张 d≥3，且 `P_{≥3} ≥ 0.50` | `S ≥ 50` | 核心能力中得分最低者 `S_c' ≥ 35` |
| L3 高级 | `senior` | 6 | 4 | 至少 3 张 d≥4，且 `P_{≥4} ≥ 0.55` | `S ≥ 65` | 至少 1 个能力最高通过难度 ≥4；不允许任何核心能力 `S_c' < 40` |
| L4 资深 | `staff` | 8 | 4 | 至少 4 张 d≥4 且至少 1 张 d=5；`P_{≥4} ≥ 0.65` | `S ≥ 75` | ≥1 道 kind=scenario 题得分 ≥70（question_kind 冻结列落地前 **L4 不开放**）；跨能力一致性（§2.2 R6） |
| L5 专家 | `principal` | 10 | 5 | 至少 3 张 d=5；`P_5 ≥ 0.60` | `S ≥ 85` | **强制 `review_required`**（首期不允许自动终判）；无模型分歧、无低语音质量标记 |

### 2.2 辅助常数（A.3.1/A.3.5·决议采纳为 v2 初值）

| 编号 | 常数 | 决议初值 | 出处 |
|---|---|---|---|
| R1 | 题目难度权重 `w(d)` | `{1:0.5, 2:0.75, 3:1.0, 4:1.5, 5:2.0}` | A.3.1（提议值·待校准） |
| R2 | 小样本收缩 | `S_c' = (W_c·S_c + k·μ0)/(W_c + k)`·`k=1.5`（中等难度题权重单位）·`μ0=50` | A.3.1 |
| R3 | 能力权重 `α_c` | core=1.0 / 非核心=0.5；**core 落库前一律 α=1 并标 `core_unknown`** | A.3.1+A.9-6 更正 |
| R4 | 整体分 | `S = Σ(α_c·S_c') / Σα_c`（能力权重与题数解耦·题量只经收缩与证据要求起作用） | A.9 评审更正（弃双乘式） |
| R5 | 置信度封顶 | 有效卡数 <8 → confidence ≤ mid；<5 → low（组合分量制·不让模型自报） | 附录 A 第 7 条 + A.3.5 |
| R6 | 跨能力一致性 | 除最强能力外其余 `S_c'` 中位数 ≥ 档位分阈 −10 | A.3.2 注 |
| R7 | 最高通过难度线 | `s_i ≥ 60`（与 GAP 同值**不同义**·独立注册·见 §2.3） | A.3.1 |
| R8 | L1 参考线 | `S<30` 附 `below_l1_reference`（信息码·非下限） | 附录 A 第 5 条 |
| R9 | 暂不开放集 | 读面 difficulty/#104·难度谱/#77·question_kind 冻结列就绪前：**L1/L4/L5 标「暂不开放」**（工程上不可证据支持=判 `unavailable`/`review_required` 是预期行为非 bug） | 附录 A 第 8 条 + A.3.2 依赖注 |

### 2.3 规则把关表（A.3.4·规则只算上限 Lmax·永不抬高）

| 理由码 | 条件 | 动作 |
|---|---|---|
| `insufficient_cards` | 有效卡数 < 目标档最低卡数 | 目标档及以上不可达；不足 L1 则 `unavailable` |
| `insufficient_coverage` | 覆盖能力数 < 档位要求 | 同上按覆盖数降 Lmax |
| `insufficient_hard_evidence` | 高难度卡数不足（n_d 不够） | **只封顶不判低**；状态 `capped_by_evidence`·提示补测 |
| `hard_question_underperform` | `P_{≥4}` 低于档门槛 | 不得上调（Lmax ≤ 低一档） |
| `core_competency_floor` | 任一核心能力 `S_c'` < 档底线 | Lmax 降一档 |
| `inconsistent_profile` | R6 不满足 | Lmax 降一档并 `review_required` |
| `model_disagreement`/`voice_low_quality`/`language_not_applicable` | 0109 不确定性标志命中超阈 | 不降档·置信度降级·可转 `review_required` |
| `suggested_above_max` | 模型建议 > Lmax | 夹到 Lmax·记录统计（高估倾向监测） |
| `suggested_below_rule` | 模型更保守 | **不抬高**·沿用模型建议；低 ≥2 档转 `review_required` |
| `top_tier_manual` | 最终档 = L5 | 强制 `review_required` |
| `calibration_missing` | 该 scheme_version 无 calibration release | 只允许 C 端「练习参考」·**禁止进入 B 端** |

**四值关系裁定（#102「三套规则四数值互不关联」的收束口径）**：GAP=60（逐题/逐能力达标线·弱项标记语义）、v1 75/50（三档分桶·转历史只读）、里程碑 ≥70（模拟实战达标线）、v2 五档 S 阈值——四者**语义分立、各自注册、数值不强行收敛**；「统一」指**同表注册+同源派发+同协议升版**（§4/§7），非合并为同一数值。里程碑 ≥70 与 R7 线 60 列为**待校准登记项**（随黄金集离线校准一并复核·初值维持）。

### 2.4 状态机（A.3.5·决议采纳）

`pending → auto_final`（confidence=high 且无强制复核）｜`capped_by_evidence`（可补测重算）｜`review_required`（低置信/分歧/L5/不一致）｜`reviewed`（记录复核人+原因）｜`unavailable`（证据不足不给任何档）｜`superseded`（重算更正·旧行不改写）｜`fenced`（隐私围栏）。
对用户口径：仅 `auto_final` 显式「级别：X（参考）」；`capped_by_evidence` 显「暂定上限」+补测引导；`unavailable` 显证据不足**而非任何档位**。

---

## §3 scheme_version 版本化协议（附录 A 第 2/11 条·决议采纳）

1. **取值**：`'v1'` = 现行三档（career.ts:12 语义·75/50 分桶）；`'v2'` = 本决议 §2 五档。后续校准升版 `'v3'…` 递增。
2. **存储**：`candidate_level_assessment.level` + `scheme_version` 列；理由（rationale/reason_codes）、证据引用（candidate_level_citation）、置信度同行/邻行存放。**按版本追加：重算=新增一行，旧行置 `superseded`**；不双写、不新增 level_v2、不要 career_path_history。
3. **v1 退役**：既有 `career_path.level`（junior/mid/senior）视为 `scheme_version='v1'` 历史结果**只读保留、不再写入**；展示层对旧三档做显示映射（junior→初级、mid→中级、senior→高级+「旧版判定」小标）。
4. **active 切换**：v2 初期 `status='calibrating'`（只允许 C 端练习参考·§2.3 `calibration_missing`）；**calibration release 记录存在（§6 发布门全绿）后才置 `active`**；B 端一律另走 calibration release（0082）。
5. **回滚**：把上一个 scheme_version 重新置 active，无反向迁移。
6. **迁移编号**：从 0152 起（0152-0155 已被批3 占用者顺延·EXEC 立项时 `ls packages/db/migrations` 重 pin）·expand-only·lock_timeout。

---

## §4 单一出处立法（#102 修法「阈值集中到版本化策略配置」）

1. **运行时单源（权威）**：`level_policy_version` 表（A.4 提议 0141 式·`scheme_version` unique·`levels/weights/thresholds/evidence_requirements/confidence_map` jsonb·发布后不可变·append-only 触发器沿 question_rubric 做法）。**数值的唯一权威出处是该表的 active 行**——TS 常量/配置文件不得与之并存第二套 operative 数值。
2. **TS 侧镜像（contracts 常量）**：落 `packages/contracts/src/index.ts`（CONSENT_PURPOSES:449 同区先例：`as const` 数组/对象 + 派生 zod 枚举）。形态按 **附录 A'（冻结抄写面）** 由 H3 EXEC 一次落码；域内纯函数（career.ts 等）与 web 标签面（page.tsx）改读该单源，字面量散布禁绝（沿 GAP 先例「一处定义，全仓复用禁字面量散布」+rg 门）。
3. **命名（冻结）**：`LEVEL_SCHEME_VERSIONS`（v1/v2 注册表）·`LEVEL_SCHEME_V2`（§2 全量数值·字段名与 §2 表列一一对应）·`LEVEL_LABELS`（五档中文标签·附录 A 第 1 条「中文标签放配置，不写进 DB CHECK」）·`LEVEL_SCHEME_ACTIVE_VERSION`（active 指针·初值 `'v1'`·v2 发布门通过后随 calibration release 翻 `'v2'`——翻指针=独立刀+双审，非 H3 EXEC 顺手）。
4. **v2 数值进 TS 常量的时机**：随 H3 EXEC 落码（此时 §2 数值已被黄金集首轮校准复核过或有「占位·待校准」字段标记）——本刀不预落（理由 §8）。`below_l1_reference`/`capped_by_evidence`/`insufficient_*` 等理由码枚举随 EXEC 一并入 contracts。

### 附录 A'：LEVEL_SCHEME_V2 冻结抄写面（H3 EXEC 照抄·字段名即契约）

```
LEVEL_SCHEME_VERSION_V2 = 'v2'
LEVEL_SCHEME_V2 = {
  tiers: ['junior','mid','senior','staff','principal'],        // L1..L5
  scoreFloor:   { junior: null, mid: 50, senior: 65, staff: 75, principal: 85 },
  minCards:     { junior: 3, mid: 5, senior: 6, staff: 8, principal: 10 },
  minCoverage:  { junior: 2, mid: 3, senior: 4, staff: 4, principal: 5 },
  hardEvidence: {
    mid:      { cardsDge3: 2, pDge3: 0.50 },
    senior:   { cardsDge4: 3, pDge4: 0.55 },
    staff:    { cardsDge4: 4, cardsEq5: 1, pDge4: 0.65 },
    principal:{ cardsEq5: 3, p5: 0.60 },
  },
  coreFloor:    { mid: 35, senior: 40 },                        // S_c' 核心底线
  consistencyMargin: 10,                                        // R6：中位数 ≥ 档阈 −10
  weightByDifficulty: { 1: 0.5, 2: 0.75, 3: 1.0, 4: 1.5, 5: 2.0 },  // R1
  shrinkage:    { k: 1.5, mu0: 50 },                            // R2
  capabilityWeight: { core: 1.0, nonCore: 0.5 },                // R3（core 落库前 α=1+core_unknown）
  confidenceCaps: { maxCardsForMid: 8, maxCardsForLow: 5 },     // R5
  highestPassedDifficultyLine: 60,                              // R7（与 GAP 同值不同义）
  belowL1Reference: 30,                                         // R8 信息码线
  labels: { junior:'初级', mid:'中级', senior:'高级', staff:'资深', principal:'专家' },
  milestoneSimulationPass: 70,                                  // S2 注册（待校准登记项）
  gapLine: '@see GAP (packages/domain/src/assessment.ts) = 60', // S4 已单源·不重复定义
}
LEVEL_SCHEME_ACTIVE_VERSION = 'v1'   // v2 过发布门后独立刀翻转
```

---

## §5 「样本不足不出级别」条款（附录 A 原文全引）

> **附录 A 第 5 条（原文逐字）**：
> 「**L1 不设分数下限**：S<30 只附加 `below_l1_reference`。`unavailable` 只在卡数或覆盖不足时触发，不能把低分伪装成“无数据”。」

**配套原文**（A.3.2 L1 行·2026-10-09 评审更正保留）：「兜底档；**证据**（卡数/覆盖）不足才输出 `unavailable`；证据充分但分数低是 L1（`S<30` 仅附信息码 `below_l1_reference`），不得标成无数据（原 `S≥30` 否则 unavailable 会把“答得差”误标为“无数据”，与 assessment.ts:15-17 方向相反）」。

**决议推论（三条·H3 EXEC 验收判据）**：
1. `unavailable` 的触发条件**穷举**为 `insufficient_cards` ∪ `insufficient_coverage`（A.3.4 前两行）；任何分数路径不得产生 `unavailable`。
2. 证据不足只封顶不判低：`insufficient_hard_evidence` → `capped_by_evidence`（§2.3）——「没问到高难度题」≠「答不出高难度题」，规则区分 `未测`（n_d=0·只能封顶）与 `测了没过`（P_d 低·才是否定证据）。
3. 反证判据：`unavailable` 行的场必满足「有效卡数 <3 或覆盖能力 <2」；存在 S 低但卡数/覆盖充分却输出 unavailable 的样本=判 FAIL。

---

## §6 发布门与样本集（附录 A 第 3 条+A.3.6 第 4 步的数值补定）

### 6.1 级别方案发布门（v2 置 active 的必要条件·黄金集保留集上测）

| 门 | 决议初值 | 度量定义 | 出处 |
|---|---|---|---|
| 加权 κ | **≥ 0.60** | 加权 Cohen κ（线性档距权·v2 vs 人工盲评档）；黄金集标注自身评审者间 κ<0.6 时**先改档位定义再谈阈值**（A.3.6 第 1 步原文） | A.3.6「κ ≥ 目标」+第 1 步 0.6 线 |
| 高估率 | **≤ 5%** | （模型/规则档 > 人工档 ≥1 档）场数 / 总场数 | A.3.6 第 4 步括注定义·阈值本决议补定（B 端消费·合规敏感方向取严） |
| 相邻档以外错判率 | **≤ 1%** | \|v2 档 − 人工档\| ≥2 的场占比（「≈0」的可检验化） | 附录 A 第 3 条「≈0」 |
| L5 硬判据 | **100%** | 最终档=L5 的场 100% `review_required`（非统计门·逐场断言） | fix-roadmap 第 4 批验收原文 |
| calibration release | **必须存在** | `level_calibration_release(scheme_version, dataset_digest, metrics, approved_by/at)` 记录在先·active 在后 | 附录 A 第 3 条原文 |

### 6.2 黄金集规格（A.3.6 第 1 步·决议采纳）

已完成且有评分卡的面试抽样（先 C 端自愿练习数据·隐私同意+脱敏）；**≥150 场·每档 ≥20**（稀有 L5 可合成/补采）；**≥2 名资深面试官盲评**（只看结构化卡片/证据摘录·不看模型建议）；记录评审者间一致性（加权 Cohen κ 或 Krippendorff α）。该数据现在不存在；#40 接通前生产评分卡为空，需 score-writer 跑通或隔离环境造数——黄金集建成前 v2 恒 `calibrating`，不得 active。

### 6.3 facts 召回率（更正版 fix-roadmap :94 阈值补定·RG 线验收）

| 项 | 决议初值 | 说明 |
|---|---|---|
| 阈值 | **召回率 ≥ 0.70** | 金标 facts 命中数 / 金标 facts 总数（命中判据=评测器定义·exact+归一别名匹配·评测器随 RG 刀落地并在 prove 中留 digest） |
| 样本集 | **≥20 份**样本简历（含教育/项目小节与无小节标题样本·金标 facts 标注待建） | fix-roadmap :94 原文规格 |
| 可证伪断言 | 「教育经历」不进 experience（二值·独立于召回率门） | fix-roadmap :94 原文 |
| 升版 | 金集扩展/解析器升级后按 §7 协议修订阈值·不回改本档 | 同 §7 |

### 6.4 持续监控（A.3.6 第 5 步·决议初值）

线上监测档位分布、`suggested_above_max` 夹动率、复核改档率；**单档周占比漂移 >10 个百分点**触发告警并冻结自动终判（初值·告警阈值随监控刀可修订）。

---

## §7 校准修订协议（决议值的存活方式）

1. 本档数值（§2/§6）= **决议初值**；修订只经由：黄金集/保留集重测 → 新 scheme_version（`'v3'…`）+ 新 calibration release → §6 门全绿 → active 翻转。**不原地改写任何已发布版本的数值**（append-only·沿 0100 superseded 习惯）。
2. TS 镜像常量与 policy 表的同步：表为准，常量随版本追加新增不改动（旧版本常量保留供历史行解释）。
3. 「待校准登记项」（R1/R2/μ0、里程碑 ≥70、R7 线 60、facts 0.70、监控 10pp）在首轮黄金集校准报告中**必须**给出复核结论（维持/修订+置信区间）。

---

## §8 落地边界（二择一裁决·披露理由）

**裁决：B —— 本刀仅决议文档（docs-only·零码动）；常量固化（contracts 单源+三散点改读）归 H3 LEVEL-SCHEME EXEC 实施。**

理由（四条）：
1. **蓝本定界**：batch-residual-plan H1 行明文「纯 docs 决议件」（S 体量·首交付物·验收前置）；「阈值集中到版本化策略配置」(#102 修法) 的主体改造=五档判定+读面 v2+追加式写入（#45/#102/#104/#124/#125 同域耦合），任何常量先行都会切进 H3 的耦合面。
2. **校准协议冲突**：A.3.2「下表数值全部是初始提议…必须经 A.3.6 离线重算对比并校准后才能当成真值」；A.3.6 第 2 步「区间过宽的阈值标记**『不稳定，不得硬编码』**」。现在把未校准值固化进 contracts=上游明文禁止的硬编码，且校准必改→必产生第二出处，恰破坏本刀「单一出处」的目的。
3. **权威单源在 DB 不在 TS**：A.4 规定 `level_policy_version` 表（thresholds jsonb·发布后不可变）为运行时单源，TS 常量至多是镜像/种子——其最终形态（字段、与 policy 行的同步方式）依赖 H3 的 TS/DB 分工设计；现在立形态必返工。
4. **契约冻结面**：改读单源必触 `career.ts`（对外契约冻结 interview.service.ts:725）/`page.tsx`（#125 归 H3）的产品文件 import 面；docs 刀授权不含产品码触面。

**不白等（决议的立法价值即刻生效）**：§4 附录 A' 冻结抄写面使 H3 EXEC「照抄一次落对」；§5 三条推论与 §6 门数值即为其验收判据；v2 数值在 EXEC 落码时按 §7 与首轮校准复核对表。

---

## §9 Non-claims

本档 ≠ 实施 ≠ #45/#102 收口 ≠ LEVEL-SCHEME 验收通过 ≠ v2 已 active。§2/§6 数值为决议初值·可按 §7 升版修订·非「最终真值」宣称；黄金集与样本简历集均待建，「≥150 场/≥20 份」为规格非存量；`facts 召回率 0.70` 为 RG 线验收阈值·评测器未建前不可作为任何通过条件；v1 散点行号为 `9f6edf8f` 实测·后续 base 漂移须重 pin；更正版上游文档在仓库外（`~/Documents/Meetwise产品审计-更正版/`），本档引用行号以 §header 亲读记录为准。

---

*H1 阈值决议 · 2026-10-10 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`9f6edf8f` · 分支 `line/h1-thresholds` · 蓝本=batch-residual-plan.md:96 H1（@ab02d499）· 上游=更正版 issues-master #45(:332)/#102(:339)+更正版 fix-roadmap 批2 §0(:82)/附录 A(:155-167)+refactor-backlog A.3-A.9 · 裁决=落地边界 B（仅决议文档·理由 §8）· pins 十一值照抄 · ⛔push · 零码动 · Ban self-approve · alone≠dual*
