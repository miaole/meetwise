# H3 LEVEL-SCHEME EXEC 收据 · 2026-10-11 · h3-exec 席（北星 loop · 批2 · H1 解锁首实施刀）

**Status**: `executed:awaiting_post_prove_dual`（七条+⑦三推论全落·门禁全绿·markers=0·est live=0·⛔push · Ban self-approve · alone≠dual · prove EXIT=0 ≠ DONE·claimDone=false·走 post-prove 双审+nail）

**基线**：rebase 后分支 tip（rebase 前 96d4a7c9 → rebase 后 478d0634）·主线 `feat/mysql-schema-skeleton` @ `2cd33cf3`（H4 nail 在卷）·merge-base=`36ded20a`。

---

## §1 rebase 漂移表（EXEC 立项重 pin·@2cd33cf3 实测）

| 锚 | REQUEST 所载（@36ded20a） | rebase 后实测（@2cd33cf3） | 影响 |
|---|---|---|---|
| page.tsx LEVEL_LABEL 定义/消费 | :31/:327 | **:32/:353**（H4 R1 report 页上方插入 ~22 行） | ④ 锚随行·语义零漂 |
| interview.service 契约冻结注释 | :725 | **:747** | ⑤ 零触面内容零 diff（亲证） |
| interview.service seam selectCareerPathDerive | :747 | **:769**（import 仍 :5） | ⑤ seam 零 diff 判定（见 §2⑤） |
| controller career-path 端点 | :234/:240 | **:236/:242** | 零触面内容零 diff（亲证） |
| contracts CONSENT_PURPOSES 区 | :469-471 | **:472-473**（② 镜像插入后定义区 :484-544） | ② 落位随行 |
| adaptive-interview CONF_ENOUGH 定义 | :132 | **:147**（H4 R3 derivedFocusSoftBudget 上方插入·#38 族内容零 diff） | 零触面·亲证零字节 |
| career.ts `overall >= 75` | :12 | **:12 成立**（rebase 时点·③ 落码后该行退役·见 §2③） | ③ 改造面本体 |
| growth-generation ON CONFLICT 三行 | :50/:66/:86 | **:50/:66/:86 不变** | ⑥ 零触面·亲证零字节 |
| 迁移编号 | 0160 起 | **0160 空闲**（0146-0159 已占·0152 双号并存史实沿用） | ① 文件名 0160 |
| `level_policy_version`/`candidate_level_assessment` 全仓 | 零码命中 | **仅 docs 命中**（码面仍零） | ① 全新建表确认 |
| GAP :16 / CONF_ENOUGH 消费面九行 | :16/:132 区 | **:16 不变 / :147-:465**（H4 漂移·本刀零触） | 无 |

rebase 执行：`git rebase feat/mysql-schema-skeleton` **零冲突**（h3 分支仅 1 .md·H4 未触该文件·2/2 重放成功）。

## §2 七条逐条（file:line = 落码后实测）

### ① 0160 迁移 `packages/db/migrations/0160_level_policy_version.sql`（新建·零冲突落位）
- DDL 照 H1 §4.1=A.4 形：:34-45 `CREATE TABLE IF NOT EXISTS level_policy_version`——`id uuid pk default uuidv7()` :35 · `scheme_version text NOT NULL UNIQUE` :36 · `status CHECK in ('draft','calibrating','active','retired')` :37 · 五 jsonb（levels/weights/thresholds/evidence_requirements/confidence_map）:38-42 · `prompt_version` :43 · `calibration_release_id uuid` :44 · `created_at` :45。
- append-only 触发器沿 0100:294-296 先例：函数 :48-53（`RAISE EXCEPTION 'level_policy_version_immutable' USING ERRCODE='23514'`）+ `REVOKE ALL ... FROM PUBLIC, app_role` :55 + `level_policy_version_immutable_guard` BEFORE UPDATE OR DELETE :56-58。
- seed v2 行 :61-90：附录 A' 16 字段逐字照抄入五 jsonb 列（levels←tiers/scoreFloor/labels · weights←weightByDifficulty/shrinkage/capabilityWeight · thresholds←coreFloor/consistencyMargin/highestPassedDifficultyLine/belowL1Reference/milestoneSimulationPass/gapLine · evidence_requirements←minCards/minCoverage/hardEvidence · confidence_map←confidenceCaps·计 16）+ `status='calibrating'` :64 + `prompt_version/calibration_release_id` 置 NULL :87-88 + `ON CONFLICT (scheme_version) DO NOTHING` 幂等 :90。
- 形制：`SET LOCAL lock_timeout = '2s'` :32（0155/0157 同形）·expand-only·先建表落种子后收紧 RLS（自举序：FORCE RLS 下种子 INSERT 不与 RLS 相互作用）·app_role 仅 SELECT（:93）+ `level_policy_version_read FOR SELECT USING (true)` :95-97。
- 形制与 H1 DDL 符合性：**PASS**（停止条件核查⑤）。

### ② TS 镜像 `packages/contracts/src/index.ts`（CONSENT_PURPOSES :472-473 同区追加 :480-545）
- 四冻结名：`LEVEL_SCHEME_VERSIONS` :492（v1/v2 注册表+LevelSchemeVersion z.enum :493-494）· `LEVEL_SCHEME_V2` :519-543（附录 A' 16 字段 `as const` 逐字照抄）· `LEVEL_LABELS` :544（= LEVEL_SCHEME_V2.labels 单源引用·禁重抄）· `LEVEL_SCHEME_ACTIVE_VERSION` :496 **= 'v1' 不翻**。
- 枚举：`LEVEL_TIERS` :498+`LevelTier` z.enum :499-500；理由码 `LEVEL_REASON_CODES` :510-514（16 码照录：13 关卡码+below_l1_reference/capped_by_evidence/review_required）+ `LevelJudgmentStatus` :505-508（A.3.5 派生四态·additive）。
- **「占位·待校准」标记**：:484 注记块行（rg 门可见性自证 PASS——白名单命中集内）·DB 权威承载=0160 行 `status='calibrating'`·零「已校准」宣称。
- 字面量散布禁绝：rg 门落 prove（`packages/domain/test/level-policy.proof.ts` rg 门 6 断言·operative 面零命中）。

### ③ career.ts 五档化 `packages/domain/src/career.ts`
- :6 `CareerPath.level`：`'junior'|'mid'|'senior'` → `LevelTier` 五档（读镜像派生·:14）。
- :12 旧三档分桶行**退役**→ v2 阶梯 `ladderTier` :52-60（S≥floor.principal→principal·≥staff→staff·≥senior→senior·≥mid→mid·无下限→junior·**数值读 `LEVEL_SCHEME_V2.scoreFloor` 零字面量**·rg 门 PASS）。
- 新增域内政策评估纯函数 `evaluateLevelPolicy` :104-163（`EvidenceProfile` :28-42 + `LevelJudgment` :47-52·域 index 导出 additive）：承载 ⑦ 三推论+R8 信息码+§2.3 卡数/覆盖/封顶守卫行+L4 kind=scenario 门（:78-89·question_kind 未就绪 scenarioPassed=undefined=未测→只封顶）+L5 强制复核（:130-131/:162-163）。**只消费 evidence profile·不生产**（R1-R9 生产面零触）。
- **profile 缺省语义 (a) 落卷**：:107-122——缺省（无 evidence）=「证据面未接入」→跳过卡数/覆盖/封顶门控走纯分数阶梯；**缺省 profile 不产生 unavailable、不产生伪 capped_by_evidence**（全 S 域 0..100 扫描 prove 断言 PASS）；卡数/覆盖门控仅对显式传入非空 evidence profile 生效（:124 起）。
- :13 readiness 五档机械扩：`readinessFor` :165-171（v1 三枚原文保留·staff/principal 按既有语气补写·纯展示）。
- :17 里程碑条件 `level !== 'senior'` → `level !== 'principal'` :188（未到顶建议进阶·v2 顶档=principal·机械对齐一行）；**:16 「完成 3 场达标(≥70)模拟面试」:187 字面与数值零触**（亲证字节零改）。
- :11 `fail('insufficient_evidence')` :179 与 requireTrustedPracticeOverall 通路零触（:105 校验行语义同构保留）。
- v1 转历史只读禁双写：函数切 v2 单路径·既有 career_path 行不改写（level 列无 CHECK·五档值可入·⑦⑥ 写入面沿 ⑥ 原状）。
- S<30 → `below_l1_reference` 信息码 :121/:160（judgment 面·HTTP 体零增键）。

### ④ report page `apps/web/app/report/[id]/page.tsx`（:18/:32-34/:355-356）
- :18 import 增 `LEVEL_LABELS`（contracts 单源）。
- :32-34 旧三档字面量对象**删除**→ `LEVEL_LABEL = LEVEL_LABELS`（单源引用·禁重抄·v1 三枚为五档表子集同文）。
- :355-356 未知值中文兜底 `?? '未知级别'`（#125「未知级别直接显示原始英文枚举」收敛·v1 三档映射天然成立）。「旧版判定」小标**未加**（行级 scheme_version 溯源缺位·随 #124·§3.6 范围外钉死）。

### ⑤ interview.service seam 接线（零 diff 判定）
- **:747 契约冻结零触**：注释块+成功体/409/500/GET 全部零 diff（git diff 亲证空）·`career-path.proof.ts` **SUCCESS-RESPONSE-SHAPE-FROZEN PASS**（ai-graphs prove 直跑 16 断言全绿 EXIT=0）。
- :769 seam（C-HA-2）默认 dep=deriveCareerPath（③ 已 v2 化）→ **derive 走 v2 决议自动成立**；deriveCareerPath **冻结签名 (overall, weaknesses)+冻结返回形**（REQUEST §2③ 钉死）→ career-path.ts:4/:23/:40 dep 注入边界 `DeriveCareerPath` 类型**零适配需求=最小适配（零 diff）**·fail-seam 语义零触（SEAM-EXACT-MATCH-FAIL-ONLY 等 16 断言全绿）。
- unavailable 复用既有 409 `insufficient_evidence` 信封：:780-784 tx1 catch（requireTrustedPracticeOverall 通路）零 diff；纯函数 unavailable→`fail('insufficient_evidence')` 同码通道（career.ts:182 防御守门）·**零新增响应码零新增响应键**（neg:interview 97 含 career-path 409/404 全绿）。
- 证据面：**卡数证据生产面为空·零伪造**——tx1 assessment_report 查询（:774 区）dimensions 只投 weaknesses（原样）·evidence profile 不传入 derive（(a) 语义权威承载）·三推论 prove 以合成 profile 断言（纯函数面·零 live 面）。
- controller :236/:242 零 diff（亲证）。

### ⑥ growth-generation 保持（零 diff 亲证）
- `packages/db/src/growth-generation.ts` **git diff 空**——:84-86 ON CONFLICT (owner_user_id, interview_id) DO UPDATE 原位覆盖原样（重算覆写沿 ⑥ 语义·完整只读保护随 #124）。
- :82 `deriveCareerPath(overall, weaknesses)` 调用自动获得 v2 派生（五档枚举值可入 career_path.level·level 列无 CHECK·零行号改动）·growth:prove 31 PASS 零退化。

### ⑦ 「样本不足不出级别」三推论落码（derive 端=③ 纯函数）
1. **推论1 穷举**（career.ts:127-133）：unavailable 触发条件穷举=insufficient_cards ∪ insufficient_coverage（唯一出口=L1 门 :127-131）·任何分数路径不得产生 unavailable（低分→L1+below_l1_reference）。
2. **推论2 只封顶不判低**（:137-146 hardEvidenceVerdict :62-97）：insufficient_hard_evidence→`capped_by_evidence`（补测引导）；未测（n_d=0/不足额·'untested'）≠测了没过（'underperform'→hard_question_underperform 否定证据·降档非 capped 非 unavailable）。
3. **推论3 反证判据**（prove 硬断言）：卡×覆盖×S 网格穷举扫描（10×7×7=490 格）——unavailable ⇔ 卡<3 ∪ 覆盖<2 **双向硬断言** PASS；存在 S 低但卡数/覆盖充分却输出 unavailable 的样本=0。
- L4 kind=scenario 门（:80-84）与 R9 暂不开放集语义落为纯函数规则行（常量随 ① seed·零 R1-R9 算法实现）。

## §3 EXIT 总账（门禁全跑·原值亲证·日志 receipts/h3-level-scheme/）

| 门 | 命令 | EXIT | 计数 |
|---|---|---|---|
| scoring-honesty（:102-105 零翻核） | `pnpm run scor-00-honesty:prove` | **0** | 21 scenarios·:102-105 面 PASS（log:25「合法 overall 才允许 career 分层」） |
| **新增** level-policy（⑦三推论+rev2(a)+rg 门） | `pnpm run level-policy:prove` | **0** | 28 断言 |
| web prove | `pnpm run web:prove` | **0** | 全绿零翻 |
| typecheck（root e2e） | `pnpm typecheck` | **0** | — |
| interview:prove | `pnpm run interview:prove` | **0** | 57 PASS（v64 全链） |
| neg:interview | `pnpm run neg:interview` | **0** | 97 全绿（career-path 409/404/401 在卷） |
| scor-parity | `pnpm run scor-parity:prove` | **0** | 57 PASS |
| migrate:prove | `pnpm run migrate:prove` | **0** | 95 PASS（0160 在目录·幂等面含） |
| growth:prove | `pnpm run growth:prove` | **0** | 31 PASS·growth-generation.ts 零字节 |
| **新增** level-policy-migrate（0160） | `pnpm run level-policy-migrate:prove` | **0** | 34 断言（隔离 PG 真迁移） |
| 回归面② api:validate（validate.ts:496） | `pnpm run api:validate` | **0** | log:451「生成职业路径 → 200(overall=60→mid)」PASS |
| career-path.proof.ts（ai-graphs·SHAPE-FROZEN） | tsx 直跑 | **0** | 16 断言全绿 |

**预存红如实登记（零新增翻转）**：`apps/api/test/uc-e2e-004-career-path.proof.mjs` 基线 EXIT=1（FAIL S2/S3/G——GAP-UC004-FI3 图接线刀后清单未跟上·非本刀面）→ 本刀后失败集 **md5 逐字节同**（fefe3d7b…前后一致·PASS S1/S4/S5 不变）·修复归原刀。TS 面：contracts 0 / web 0；ai-graphs/db/api/worker tsc 错误**位置集 before/after 逐包全同**（预存基线红·零新增·level-policy 两 prove 文件自身 0 错）。

**gate 注册（additive）**：`packages/db/package.json` prove:level-policy · `packages/domain/package.json` prove:level-policy · root `level-policy:prove`/`level-policy-migrate:prove` · `scripts/run-e2e-isolated.mjs` 三处（watch 列表 :518-521·隔离集 :1762·isolatedCommand :1850-1852·沿 migrate:prove 同形）。

## §4 (a) 落卷声明（rev2 处方 1·主缺格）

**卡数证据面为空时 profile 缺省语义=「证据面未接入」→跳过卡数/覆盖门控走纯分数阶梯（择 (a)）已落码**：
- 载体：career.ts `evaluateLevelPolicy` :107-122 缺省分支（evidence===undefined→ladderTier 纯分数阶梯·仅 R8 信息码+L5 强制复核两规则行生效）。
- 纯函数断言钉死兑现：缺省 profile **不产生 unavailable**、**不产生伪 capped_by_evidence**——level-policy.proof「rev2(a) 缺省 profile 全域扫描」断言（S=0..100 全扫·零 unavailable 零 capped_by_evidence·阶梯 85/75/65/50 派生 tier·S<30 附 below_l1_reference 仍得 L1）PASS。
- 回归核单三面零翻声明（随改随核亲跑）：① scoring-honesty.proof.ts:102-105（0→junior/60→mid·空 evidence 实参）PASS ② validate.ts:496（POST career-path→200·overall=60→mid）PASS ③ uc-e2e-004-career-path.proof.mjs 失败集零翻（预存红 md5 同）。生产 career-path 不灭活。
- 显式 profile 路径：卡数/覆盖/封顶门控仅对显式传入非空 evidence profile 生效（:124-163）·prove 以合成 profile 断言（纯函数面·零 live 面·零伪造卡数）。

## §5 停止条件核查

1. **锚点重定位**：全锚重 pin 零失败（§1 漂移表·漂移两处=H4 行号平移·内容零漂）→ **未触发**。
2. **prove 新增红**：门禁全绿（§3）·scoring-honesty :102-105 零翻核 PASS → **未触发**。
3. **0160 形制与 H1 DDL 不符**：DDL 十一列/四态 CHECK/五 jsonb/unique/append-only 触发器逐项对照 H1 §4.1=A.4 形 PASS（level-policy-migrate 34 断言）→ **未触发**。
4. 零冲突 rebase（2/2 重放）·零 secrets·零生产操作·零模型外呼。

## §6 卫生回执

- **markers=0**：五类标记词 grep 改动集（8 修改+3 新建+收据）EXIT=1 零命中（亲证·词不复抄避免自匹配）。
- **est live=0**：零生产操作（隔离 PG 即用即灭）·零模型外呼·零 secrets·Key name-only 不适用面（无密钥接触）。
- **pins 十一值零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null（零消耗）。
- **零触面亲证（git diff 空）**：interview.service.ts / interview.controller.ts / growth-generation.ts / adaptive-interview.ts / scoring-honesty.proof.ts / validate.ts / ai-graphs career-path.ts / report-worker.ts / 0100-0159 迁移 / candidate_level_assessment 全仓零码命中（本刀未建·#124 面零触）。
- **范围外六条零触**：#102 milestoneSimulationPass 字面（:16 字节零改）/#104/#105 读面/R1-R9 算法/发布门执行（v2 恒 calibrating·ACTIVE 恒 'v1'）/adaptive-interview #38 族/candidate_level_assessment 追加化。
- ⛔push · ⛔动主线 · ⛔触其他工作树（本收据与提交仅 meetwise-h3 工作树 line/h3-level-scheme 分支）· Ban self-approve · alone≠dual。

---

*H3 LEVEL-SCHEME EXEC 收据 · 2026-10-11 · executed:awaiting_post_prove_dual · rebase 2/2 零冲突 · 七条+三推论全落 · 门禁 12 项全绿 EXIT 原值 · (a) 落卷 · markers=0 · est live=0 · pins 十一值零翻转 · ⛔push · Ban self-approve · alone≠dual · prove EXIT=0 ≠ DONE*
