# H3 LEVEL-SCHEME REQUEST（五档级别方案 EXEC 任务书 · 批2 · H1 解锁首实施刀）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工）

**席位**：H3 LEVEL-SCHEME EXEC 任务书起草席（北星 loop · 批2 · H1 nail @`141da56f` 解锁后的派单起草）。
**基线**：`feat/mysql-schema-skeleton` @ `36ded20a`（主线最新 tip·`git log -1` 实测；`141da56f` H1 nail 已核验为其祖先）。分支 `line/h3-level-scheme`·工作树 `meetwise-h3`（`git -C meetwise worktree add ../meetwise-h3 -b line/h3-level-scheme 36ded20a` 本起草席已立）。
**蓝本**：H1 阈值决议（`ai-docs/delivery/harness/h1-thresholds.md` 主线在卷·五档 v2+scheme_version 协议+附录 A' 冻结抄写面 16 字段+发布门数值）+ 更正版 issues-master #45 族（**实测 :330-341**·#45:332/#102:339/#104:340/#124:341/#38:330·#105:471/#125:472 另行亲读核对）+ H1 §1 散点表全锚 @`36ded20a` rg 重 pin（§2 各条）。

## §0 任务一句话

按 H1 决议 §3（scheme_version 协议）/§4（单一出处立法+附录 A' 冻结抄写面）/§5（样本不足不出级别）/§6（发布门数值·本刀不执行）逐条兑现：**迁移 level_policy_version 表+seed v2 行 → contracts TS 镜像单源 → career.ts 五档化 → report page 五档标签 → interview.service derive seam 接线 v2 → growth-generation ON CONFLICT 原位保持**；「样本不足不出级别」三推论落码 derive 端。**契约冻结零触（interview.service:725 成功体/409 信封/500/GET 语义）**。

## §1 上游锚核验记录（起草席亲读重 pin·base `36ded20a`）

相对 H1 决议基线 `9f6edf8f` 的漂移（EXEC 立项时以本表为起点再重 pin）：

| 锚 | H1 所载（@9f6edf8f） | @36ded20a 实测 | 影响 |
|---|---|---|---|
| `packages/contracts/src/index.ts` CONSENT_PURPOSES 先例 | :449-450 | **:469-471**（:470 z.enum·:471 z.infer type） | ② 镜像落位区随行号更新 |
| 迁移编号（H1 §3.6「0152 起顺延·EXEC 立项 ls 重 pin」） | 0152 起 | **0152-0159 已占**（0152 双号并存=consent_revoke_grant+resume_soft_delete_fence·0155:4-5 已登记回填史实）→ **0160 起** | ① 迁移文件名 0160 |
| 其余散点（career.ts/page.tsx/assessment.ts/interview.service/controller/growth-generation/adaptive-interview） | §1 表 | **全部原行号成立**（§2 逐条列证） | 无漂移 |

表现状实测：`level_policy_version` 与 `candidate_level_assessment` **均不存在**（rg 全仓零命中）——① 为全新建表，非改列。DDL 形制上游原文=`~/Documents/Meetwise学习与审查/03-原始清单与评审/refactor-backlog.md:744`（A.4：单字段+版本号 2026-10-09 修订形态）；A.3.2 五档主表 :661-671 逐值零漂核对；append-only 触发器先例=0100:294-296（assert_question_rubric_immutable·BEFORE UPDATE/DELETE 拒·ERRCODE 23514）+0103 append-only 纵深同构。

## §2 改动清单（六接口项+样本不足条款·file:line 实锚）

### ① 迁移 `packages/db/migrations/0160_level_policy_version.sql`（新建）

- DDL 照 H1 §4.1（=refactor-backlog:744 A.4 形）：`id uuid pk` · `scheme_version text UNIQUE` · `status text CHECK in ('draft','calibrating','active','retired')` · `levels/weights/thresholds/evidence_requirements/confidence_map` 五 jsonb · `prompt_version text` · `calibration_release_id uuid NULL` · `created_at`。expand-only·lock_timeout（H1 §3.6）。
- **发布后不可变**：append-only 触发器沿 question_rubric 做法（0100:294-296 同形·BEFORE UPDATE/DELETE 一律拒）。prove 须含 UPDATE/DELETE 被拒断言。
- **seed v2 行**：附录 A' **16 字段逐字照抄**（tiers/scoreFloor/minCards/minCoverage/hardEvidence/coreFloor/consistencyMargin/weightByDifficulty/shrinkage/capabilityWeight/confidenceCaps/highestPassedDifficultyLine/belowL1Reference/labels/milestoneSimulationPass/gapLine·字段名即契约）入对应 jsonb 列；`status='calibrating'`（H1 §3.4·黄金集校准前 v2 不得 active）；`calibration_release_id`/`prompt_version` 置 NULL。prove 含 seed 行对附录 A' 逐字段零漂 diff。
- 迁移编号 **0160**（§1 漂移表）；EXEC 立项时 `ls packages/db/migrations` 重 pin（并行线可能再占号）。

### ② TS 镜像落 contracts（`packages/contracts/src/index.ts` · CONSENT_PURPOSES :469-471 同区追加）

- 命名冻结（H1 §4.3）：`LEVEL_SCHEME_VERSIONS`（v1/v2 注册表）· `LEVEL_SCHEME_V2`（附录 A' 16 字段·`as const`）· `LEVEL_LABELS`（五档中文标签）· `LEVEL_SCHEME_ACTIVE_VERSION`（**初值 'v1'·本刀不翻**——翻指针=独立刀+双审）。
- 形沿 CONSENT_PURPOSES:469-471 先例（`as const` + `z.enum` 派生 + z.infer type）；`LevelTier` 五枚 zod（junior/mid/senior/staff/principal）；**理由码枚举并入**（H1 §4.4+§2.3 码表照录）：`insufficient_cards`/`insufficient_coverage`/`insufficient_hard_evidence`/`hard_question_underperform`/`core_competency_floor`/`inconsistent_profile`/`model_disagreement`/`voice_low_quality`/`language_not_applicable`/`suggested_above_max`/`suggested_below_rule`/`top_tier_manual`/`calibration_missing` + 信息/状态码 `below_l1_reference`/`capped_by_evidence`/`review_required`。
- **「占位·待校准」标记必须可见**（注释注记或非数值元字段均可·不得新增第 17 个数值字段改动冻结抄写面；不得宣称已校准——DB 行 `status='calibrating'` 为权威承载·H1 §4.4/§7.3）。
- 字面量散布禁绝沿 GAP 先例（assessment.ts:12-15 注记形态+rg 门）：v2 数值全仓仅此一处 TS 出定义+DB policy 表单源。

### ③ career.ts 五档化（`packages/domain/src/career.ts`）

- :6 `CareerPath.level` 联合类型 `'junior'|'mid'|'senior'` → 五档（读 ② 镜像派生）。
- :12 三档分桶 `overall >= 75 ? 'senior' : overall >= 50 ? 'mid' : 'junior'` → **v2 阶梯**：S≥85→principal · ≥75→staff · ≥65→senior · ≥50→mid · 无下限→junior；数值读 `LEVEL_SCHEME_V2.scoreFloor`·**禁字面量**（H1 §4.2）。
- **新增域内 v2 政策评估纯函数**（evidence profile + overall → judgment{tier,status,reasonCodes}）：承载 ⑦ 三推论+R8 信息码+§2.3 守卫行（卡数/覆盖/封顶）——**只消费** evidence profile；从原始作答**生产** profile 归范围外（§3.3）。deriveCareerPath（冻结签名+冻结返回形）投影 judgment 至既有 {readiness,level,milestones}。
- :13 readiness 文案映射随五档机械扩（staff/principal 文案 EXEC 按既有语气补写·纯展示文案）。
- :17 `level !== 'senior'` 里程碑条件随五档顶档语义一行机械对齐（「未到顶建议进阶」·v2 顶档=principal）；**:16 「完成 3 场达标(≥70)模拟面试」字面与数值零触**（milestoneSimulationPass 规则改造=范围外 §3.1）。
- :11 `fail('insufficient_evidence')` 与 `requireTrustedPracticeOverall` 通路零触。
- **v1 转历史只读**：函数切 v2 单路径·既有 `career_path` 行 v1 值不改写不迁移（显示承接归 ④）·禁 v1/v2 双写（H1 §3.2/3.3）。
- S<30 → 附 `below_l1_reference` 信息码（R8·信息码非下限·落在纯函数 judgment 面+prove·**HTTP 体零增键**——见 ⑤ 冻结）。

### ④ report page（`apps/web/app/report/[id]/page.tsx` :31/:327 · #125）

- :31 `LEVEL_LABEL` 三档字面量 → 读 contracts `LEVEL_LABELS`（单源·禁重抄）五档。
- :327 兜底 `?? career.level`（裸英文枚举直出）→ **未知值中文兜底**（#125 验收原文「未知级别直接显示原始英文枚举」收敛）。
- 旧三档显示映射：v1 三枚举为五档表子集同文（junior→初级/mid→中级/senior→高级）·随五档映射天然成立；**「旧版判定」小标不在本刀**（行级 scheme_version 溯源缺位·随 #124 candidate_level_assessment 溯源刀·§3.6）。

### ⑤ interview.service seam 接线（`apps/api/src/modules/interview/interview.service.ts` :725/:746-747）

- **:725 契约冻结零触**：成功体 `{readiness,level,milestones}` / 409 信封 / 500 internal_error / GET 语义全部原样；`packages/ai-graphs/test/career-path.proof.ts:84` `SUCCESS-RESPONSE-SHAPE-FROZEN` 必须保持 PASS。
- :747 seam（C-HA-2·selectCareerPathDerive）默认 dep=deriveCareerPath（③ 已 v2 化）→ **derive 走 v2 决议**；fail-seam 语义与 career-path 单节点图 dep 注入边界（`packages/ai-graphs/src/career-path.ts:4,:23,:40`）随 derive 签名扩展最小适配。
- unavailable/insufficient 路径**复用既有 409 `insufficient_evidence` 信封**（:740 catch 已有）·零新增响应码零新增响应键。
- 证据面最小接线：tx1 既有 `assessment_report` 查询（:735 区）返回的 dimensions 承载覆盖能力数；**卡数证据生产面为空**（0100 score_card 生产空·#40 未接通·H1 §6.2）——EXEC **不得伪造卡数**；三推论 prove 在纯函数面以合成 evidence profile 断言。
- `interview.controller.ts` :234/:240（POST/GET career-path 端点·#124 审计锚）**零触**。

### ⑥ growth-generation 保持（`packages/db/src/growth-generation.ts` :84-86 · 零触项·H1 边界坐标）

- `INSERT INTO career_path … ON CONFLICT (owner_user_id, interview_id) DO UPDATE …` **原位覆盖保持原样**——本刀不改追加式（candidate_level_assessment 表+追加写入归 #124 后刀·§3.6）。
- :82 `deriveCareerPath(overall, weaknesses)` 调用自动获得 v2 派生（五档枚举值可入 career_path.level·零行号改动）。

### ⑦ 「样本不足不出级别」落码（附录 A 第 5 条+H1 §5 三推论·derive 端=③ 纯函数）

1. **推论1 穷举**：`unavailable` 触发条件穷举 = `insufficient_cards` ∪ `insufficient_coverage`；**任何分数路径不得产生 unavailable**（低分→L1+below_l1_reference·不得把答得差伪装成无数据）。
2. **推论2 只封顶不判低**：`insufficient_hard_evidence` → `capped_by_evidence`（补测引导语义）；**未测（n_d=0·只封顶）≠ 测了没过（P_d 低·否定证据）**。
3. **推论3 反证判据**（prove 硬断言）：任何 unavailable 判定必满足「有效卡数 <3 ∪ 覆盖能力 <2」；存在 S 低但卡数/覆盖充分却输出 unavailable 的样本 = FAIL。
- L4 kind=scenario 门（question_kind 冻结列未就绪前 L4 不开放·A.3.2）与 R9 暂不开放集语义落为纯函数规则行（常量已随 ① seed·**不涉 R1-R9 算法实现**）。

## §3 范围外（边界清单·越界即 FAIL）

1. **milestoneSimulationPass 规则改造（#102）**：常量随 16 字段 seed 照抄·但 `career.ts:16` 「≥70」字面/行为零触（待校准登记项·H1 §2.3 四值关系裁定）。
2. **#104/#105 评分卡读面 v2**（difficulty/question_kind/uncertainty 读面·career path 消费面·0103 band 三档标度）。
3. **R1-R9 算法实现**（w(d) 加权/R2 收缩/α_c/S 聚合/R5 置信度计算/R6 一致性/R7 通过难度统计·含与 adaptive-interview softBudget 联动）归后刀——本刀政策函数只消费 evidence profile·不生产。
4. **发布门执行**（κ≥0.60/高估率≤5%/相邻档以外错判率≤1%/L5 100% review_required/黄金集 ≥150 场每档 ≥20·H1 §6）：校准期后；本刀 v2 恒 `calibrating`·`LEVEL_SCHEME_ACTIVE_VERSION='v1'` 不翻；金集「已建」叙事禁止。
5. **adaptive-interview :132-139 常量**（#38 族·CONF_ENOUGH 0.7/CONF_WEAK 0.4/PROBE_CAP 3·2/LOW_SCORE 40/OFFRAMP_LOW 2/HOOK_CAP 0.6）零触。
6. **candidate_level_assessment 表+追加式写入+#124/#125「旧版判定」小标**（行级 scheme_version 溯源缺位·随溯源后刀）；growth-generation :84-86 追加化同禁。

## §4 Prove（pre-exec 双审核对单）

1. **锚复现**（EXEC 立项重跑·期望命中·@`36ded20a` 起草席已验）：
   `rg -n "overall >= 75" packages/domain/src/career.ts` → 12；`rg -n "LEVEL_LABEL" "apps/web/app/report/[id]/page.tsx"` → 31,327；`rg -n "对外契约冻结:成功体" apps/api/src/modules/interview/interview.service.ts` → 725；`rg -n "selectCareerPathDerive" apps/api/src/modules/interview/interview.service.ts` → 747；`rg -n "ON CONFLICT \(owner_user_id, interview_id\)" packages/db/src/growth-generation.ts` → 86；`rg -n "export const GAP" packages/domain/src/assessment.ts` → 16；`rg -n "CONF_ENOUGH" packages/domain/src/adaptive-interview.ts` → 132。
2. **契约冻结断言**：`career-path.proof.ts` SUCCESS-RESPONSE-SHAPE-FROZEN PASS 保持；interview.service :725 注释块语义与 409/500/GET 零 diff；controller :234/:240 零 diff；growth-generation :84-86 零 diff。
3. **三推论 prove**：纯函数合成 profile 断言（低分+充分证据→L1 非 unavailable；每条 unavailable 判定满足卡<3∪覆盖<2；n_d=0 仅 capped_by_evidence；S<30 附 below_l1_reference 且仍得 L1）。
4. **迁移 prove**：0160 幂等面+append-only 触发器 UPDATE/DELETE 拒断言+seed 行 16 字段对附录 A' 逐字段零漂 diff+`scheme_version` unique 断言；本地隔离 PG 执行·零生产操作。
5. **单源 rg 门**：五档阈值字面量（85/75/65/50 阶梯）全仓除 contracts 定义与 0160 seed 外零命中（GAP=60 同值不同义线 60 沿 assessment.ts 单源不重复定义·`gapLine` 字段照抄注记）。
6. markers=0（五类标记词 grep 门·命令留 prove 回执·卷内不复抄避免自匹配）；est live=0（零生产操作·零模型外呼·Key name-only 不适用面如实登记）。

## §5 Ban 列表

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§6 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist 行与统计只读引用）；Ban 触 :725 契约冻结面（成功体/409 信封/500/GET 语义）与 controller :234/:240；Ban 触 growth-generation :84-86 与追加式改造；Ban candidate_level_assessment 表本刀创建；Ban R1-R9 算法实现与 evidence profile 生产面；Ban LEVEL_SCHEME_ACTIVE_VERSION 翻转与 v2 置 active；Ban 发布门/金集「已执行/已建」叙事与「已校准」宣称；Ban adaptive-interview :132-139 与 0103/0100 触面；Ban career.ts:16 里程碑字面触；Ban 伪造卡数/伪造 evidence profile 进 live 面；Ban 触其他工作树；Ban 16 字段抄写面增删改（逐字照抄·字段名即契约）。

## §6 pins（十一值照抄·零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）

## §7 Non-claims

本任务书 ≠ EXEC 实施 ≠ #45/#102/#125 收口 ≠ v2 operative ≠ 发布门通过。v2 数值=H1 决议初值（待校准·§7 升版协议可修订）；黄金集与样本简历集均待建；本刀后 v2 仍 `calibrating`、`LEVEL_SCHEME_ACTIVE_VERSION` 仍 `'v1'`、既有 career_path 行不改写；散点行号系 `36ded20a` 实测·base 漂移须重 pin（§1 漂移表为起抄面）；更正版上游在仓库外（`~/Documents/Meetwise产品审计-更正版/`）·行号以亲读记录为准（#45 族 :330-341/#105:471/#125:472）。

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）；预执行双审两外席 PASS + meetwise 明示授权后，EXEC 方可依本任务书 §2 改动清单立项实施（立项时重 pin §4.1 全锚+迁移编号）。

---

*H3 LEVEL-SCHEME EXEC REQUEST · 2026-10-10 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`36ded20a` · 分支 `line/h3-level-scheme` · 工作树 `meetwise-h3` · 蓝本=H1 决议（nail @`141da56f`）+ 更正版 issues-master #45 族（:330-341 实测）· 范围=六接口项+样本不足三推论·契约冻结零触 · pins 十一值照抄 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
