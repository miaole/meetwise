# REQUEST — **G5 SCOR-S3 残面收尾刀**（ADR-0020 未闭合四项盘点 · 读面 `practice_eligible` 收窄 + GET 重闸 · B 端校准/C 端可见性切换显式排除 · 起草 docs-only）

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（docs-only 起草 · Ban coding · Ban prove 执行 · Ban self-approve · alone ≠ dual · 不代签 peer）→ **`executed:awaiting_post_prove_dual`**（G5 EXEC 席 g5-exec 2026-10-11 · 协调方明示授权 EXEC+D1 收窄形制 EXEC 落卷 · rebase 主线 20186718 零重定位 · 项2=0161+TS 谓词镜像（D1 落卷）·项3=GET 读后校验重闸（D2 落卷）· 项1/项4 显式排除零触 · 12 门 EXIT 绿+tsc 基线 120=120 全同+docs:check 预存红 PTP 4402 如实 · 停止条件三查未触发 · 收据 `receipts/g5-scor-s3/`（漂移表/EXIT 表/D1-D3 落卷/est live=0）· markers=0 · ⛔push · post-prove 双审待并行）
**Line**: **G5 SCOR-S3 残面收尾**（G1 刀 `3d61c091` 已落主线：#42 scor-parity 57 断言对拍 + #43 `0158_score_card_insert_guard.sql` INSERT 守门 + #41 ADR-0020 翻 accepted——本刀收 G1 **未覆盖**的 S3 残面，即 `adr/0020-*.md:85` 未闭合四项中可码面收口的两项；蓝本 `batch-residual-plan.md:86` G1 行 @ `line/batch1-residual` `ab02d499` 承接）
**Base tip**: `20186718`（`feat/mysql-schema-skeleton` 主线 tip 2026-10-11 实测 · 本 worktree `line/g5-scor-s3` · 本文全部 file:line 于本 tip **亲读重 pin**）
**Author**: `g5-draft`（REQUEST 起草席 · 实现不自批）
**Date**: 2026-10-11
**依据**: ①`adr/0020-scorecard-authority-and-eligibility.md:84-85`（accepted 状态段 + 未闭合四项段）·`:54`（收窄目标态）·`:56`（GET 不重闸 + 相位只来自 SSE）·`:57`（B 端只读 unavailable/NULL + CalibrationRelease+人工复核门）②G1 收据 `receipts/g1-score-s3/` + G1 REQUEST rev2/EXEC/nail 落卷（scor-parity 57 · 0158 守门 · docs:check 预存红 PTP cap 2048 vs 4327）③`batch-residual-plan.md:86`（G1 组=M·#42/#43/#41）·`:98`（H1 阈值决议=B 端校准数值前置）

---

## §0 立靶（ADR-0020 未闭合四项现状盘点 · 逐项亲读 @20186718 · 判定「本刀收 / 留校准期后」）

ADR `:85` 原文亲证：「仍未闭合（另刀，不在本 ADR 验收面）：完整 C 端可见性切换、只读 `practice_eligible` 收窄、GET 重闸与 B 端校准——其 `INT-TRANSCRIPT-00/01` 真实数据/删除前置已闭合，剩余为产品/用途门推进项。」四项逐项现状如下。

### 项1 完整 C 端可见性切换 —— 判定：**留校准期后（另刀 · 产品门）· 本刀显式排除**

- **现状**：C 端报告页读 persisted report + GET assessment（`apps/web/app/report/[id]/page.tsx:24-27` 类型 · `:57-59` `assessmentUnavailable`/`overall` 派生 · `:90-92` `ScoreRing` 挂载 · `:180` unavailable 横幅 · `:249-255` `serverGet('/interview/:id/assessment')`）；`assessment_unavailable` 相位**只来自 SSE 终态集合**（`apps/api/src/modules/interview/interview.controller.ts:265` `isTerminal`），页面不自动切换（ADR `:56` 明示此为既定行为）；逐题练习反馈现走 SSE `answer_evaluated.score` practice-hint 闸（`apps/web/lib/stream/scoring-honesty.ts:36-56` `practiceHintScore`·SCOR-00H 已落）。
- **缺口**：逐题 ScoreCard 无任何 C 端 HTTP 读出口——`listScorableScoreCards` 全仓调用面仅 `packages/db/src/growth-generation.ts:44`（评估核心）与 `apps/worker/src/main.ts:178`（报告 loadSummary），均非 C 端读 API。「完整切换」= 逐题反馈源从 event hint 换到 ScoreCard 事实 + 页面相位切换，需**新增 C 端读面 API + SSE 合同/页面交互产品决议**。
- **排除理由**：产品门推进项（ADR `:85` 自classification）· 新 API 面 + 前端相位切换超出 M 收尾刀体量 · 与校准无依赖但与 C 端产品交互强耦合，归后刀（建议与 #104 读面 v2 / I2 C 面同域另裁）。

### 项2 只读 `practice_eligible` 收窄 —— 判定：**本刀收**（纯码面 · ADR `:54` 目标态钉死 · 不依赖校准发布）

- **现状（读面双态，SCOR-00H 未收窄）**：
  - SQL 读面：`packages/db/migrations/0103_scoring_deterministic_aggregation.sql:330-355` `scoring_list_scorable_score_cards`（`:348` `AND c.status IN ('practice_eligible','b_review_eligible')`）+ `:312-320` `scoring_aggregate_interview_scores`（`:315/:316/:318/:320` 四处双态 FILTER）。
  - TS 镜像：`packages/domain/src/scoring-fact-root.ts:70-72` `isScoreCardScorable`（双态 true）→ 复用点 `packages/domain/src/scoring-aggregation.ts:158`（`deriveScoreCardAssessment` 过滤）·`:193`（`deriveScoreCardAssessmentLegacy` 过滤）·`packages/domain/src/scoring-honesty.ts:161`；db 侧读面类型 `packages/db/src/scoring/scoring-aggregation.ts:96-110`（`:101` status 联合 `'practice_eligible'|'b_review_eligible'`）。
  - 消费面：`packages/db/src/growth-generation.ts:44`（`generateAssessmentReportCore` · POST assessment 与 worker 自动路径共享单源）·`apps/worker/src/main.ts:172-189`（报告 loadSummary `scores`/`items` 直映 cards）。
  - 断言面：`packages/db/test/scor-02.proof.ts:120-127`「两张可评分卡 → overall 90」其中 q2=`b_review_eligible` 计入——收窄后该期望须翻转为 80（逐值披露，见 §1 行4）。
- **目标态**（ADR `:54` 亲证）：「**目标**：只有 `practice_eligible` 可用于 C 端本轮练习反馈。**当前读面** `listScorableScoreCards` 仍含 `practice_eligible` **和** `b_review_eligible`（SCOR-00H 未收窄）。」
- **收法**：新顺延迁移 CREATE OR REPLACE 0103 两函数收窄为 `practice_eligible` 单态（Ban 复写 0103 原文）+ TS 镜像同收 + 消费/断言面随改随核。形制归 **D1**（§1 行1）。

### 项3 GET 重闸 —— 判定：**本刀收**（纯码面 · 写路径已有闸可对照）

- **现状（GET 零复核）**：`apps/api/src/modules/interview/interview-assessment.ts:44-51` `getAssessmentFor` 直读 `assessment_report` 返回 ·`:53-60` `getCareerPathFor` 直读 `career_path` 返回——两 GET 均不复核底层卡现行资格（ADR `:56` 亲证：「`GET assessment` / `GET career-path` **不**重跑诚实闸」）；路由 `apps/api/src/modules/interview/interview.controller.ts:211`（`@Get(':id/assessment')`）·`:242`（`@Get(':id/career-path')`）。
- **对照（写路径已闸，先例形制）**：POST assessment fail-closed `interview-assessment.ts:35-38`（`no_scorable_cards`→409）；POST career-path `interview.service.ts:758-764`（`requireTrustedPracticeOverall` → `insufficient_evidence`→409）。
- **缺口**：卡在 GET 时点可被 fence/supersede/撤权（ADR `:39`「答案替换、题目撤销、privacy epoch 变化或授权撤回…只能 fence 后续 request/card」），persisted ready 报告可能已失配现行卡资格——GET 仍原样发出。
- **收法**：GET 读面重跑诚实闸（事务内复核现行可评分卡资格，fail-closed）。失败返回语义与复核形制归 **D2**（§1 行3）。

### 项4 B 端校准 —— 判定：**留校准期后 · 本刀显式排除**

- **现状**：B 端读面恒 `assessment_unavailable`/`score=NULL`——`apps/api/src/modules/jobs/applications.service.ts:16,118`（finalize `outcome: 'assessment_unavailable' as const`）·`apps/web/lib/recruiter/surface.ts:14,25-26,31,45`（`applicationScoreVisible` 恒 `false` · 两态文案）；`b_review_eligible` 卡全仓**无 B 端数值消费**（B 端定性投影 `packages/db/migrations/0160_b_qualitative_projection.sql:94` 仅定性 scorable_ok 面，I2 已落域）。
- **门**（ADR `:57` 亲证）：「即使 future card 为 `practice_eligible`，也必须同时满足独立 CalibrationRelease 与人工复核才可进入 `b_review_eligible`；本 ADR 不授权数值排序、阈值、自动录用或拒绝。」校准基建现态：`packages/db/migrations/0160_level_policy_version.sql`（`calibration_release_id` 列 · level scheme `status='calibrating'` 恒不翻）+ 数值前置=H1 阈值决议（`batch-residual-plan.md:98`，S 体量 docs 决议件）。
- **排除理由**：依赖 CalibrationRelease 发布 + H1 数值 + 人工复核基建（产品/用途门三重前置），非码面可收项；`0160` 两文件 B 端/校准面本刀零触。

---

## §1 范围（可收项修法清单 · 仅项2/项3 · file:line 全亲读 @20186718）

| # | 面 | 锚点（亲读） | 改动 | D 决策/备注 |
|---|---|---|---|---|
| 1 | 项2 SQL 读面收窄 | `0103:330-355`（list `:348`）·`0103:312-320`（aggregate 四处） | 新迁移（编号 `0161` 起顺延·EXEC 时重 pin——现树 `0160` 双号并存 `0160_b_qualitative_projection.sql`/`0160_level_policy_version.sql` 为 h3 卷已登记史实）：CREATE OR REPLACE 两函数，list 与 aggregate 均收窄为 `practice_eligible` 单态；权限四件套沿 0109:190-194 同族（OWNER/REVOKE/GRANT app_role 原值保持） | **D1（双审裁）**：迁移形制 vs 函数内单点改；两函数须同刀同收（list 收 aggregate 不收 = 评估与逐题面资格口径分裂，Ban） |
| 2 | 项2 TS 镜像收窄 | `scoring-fact-root.ts:70-72` · 复用点 `domain/scoring-aggregation.ts:158,:193` · `scoring-honesty.ts:161` · `db/scoring/scoring-aggregation.ts:96-110(:101)` | TS 侧资格判定与读面类型同收 `practice_eligible` 单态，与 SQL 收窄后 live 语义对拍一致 | **D1 关联**：`isScoreCardScorable` 本体收窄（波及 honesty/derive 复用面）vs 新增 practice-only 谓词单点替换读面调用——由双审按最小波及面裁；TS 向 SQL 对齐 |
| 3 | 项2 消费面随改随核 | `growth-generation.ts:44` · `apps/worker/src/main.ts:172-189` | 零改预期（消费只映射 `deterministicTotal/questionId/competency/cardId`，不含 status 分支）；若实测检出对 `b_review_eligible` 卡的隐含依赖，如实披露入收据，不静默扩范围 | 消费面零 diff 为默认验收；有 diff 即停止条件 (a) |
| 4 | 项2 断言面翻转披露 | `scor-02.proof.ts:120-127`（overall 90→期望翻转 80）·`:128-130`（NON_SCORING 全体 false 语义仍真零改） | scor-02 期望值翻转 + **新增**收窄正/负断言（`b_review_eligible` 卡不入 C 端读面与聚合·`practice_eligible` 仍入）——翻转逐值披露入收据，非静默改测 | **D3（双审裁）**：翻转形制（原断言原位翻 vs 保留旧断言加 `pre-narrow` 注记）；Ban 删断言 |
| 5 | 项3 GET 重闸 | `interview-assessment.ts:44-51,:53-60` · `controller.ts:211,:242` | 两 GET 在 guard 后、读 persisted 行前（或后）重跑诚实闸：事务内复核现行可评分卡资格（复用收窄后 `aggregateInterviewScores`/卡计数单源），资格为空 fail-closed | **D2（双审裁）**：①失败返回语义（409 `no_scorable_cards` 对齐 POST assessment / career-path 对齐 409 `insufficient_evidence` / 其他）②复核落点（persisted 读前短路 vs 读后校验）③`no_scorable_cards` 已有信封映射 `interview-assessment.ts:38` 复用零新增响应码 |
| 6 | 项3/项2 prove 接线 | 既有 proof 族 additive | 新增/扩展断言覆盖：GET 重闸负测（persisted ready + 底层卡全 fenced/superseded → fail-closed）与正测（资格在 → 原样返回）；收窄对拍断言 | 断言只增不删不弱化；scor-02 行4 翻转按 D3 例外披露 |

## §2 非范围（显式排除 · 划界防双改/扩权）

- **项1 完整 C 端可见性切换**：排除（§0 判定）——Ban 新增 C 端逐题读 API、Ban 动 SSE 合同/`isTerminal` 终态集合（`controller.ts:265`）、Ban 动 `apps/web/lib/stream/scoring-honesty.ts:36-56` practice-hint 闸、Ban 动 report 页相位逻辑（`page.tsx:57-59,:180`）。
- **项4 B 端校准**：排除（§0 判定）——Ban 动 `applications.service.ts:16,:118`、`recruiter/surface.ts:14,:25-26,:31,:45`、Ban 触 CalibrationRelease/`0160_level_policy_version.sql`、Ban 触 B 端定性投影 `0160_b_qualitative_projection.sql:94`（I2 已落域）。
- **S2 已落面零触**：写路径（`write_final`/`record`/`supersede`/`adjudicate`）、公式、状态机、`SCORE_CARD_STATUSES` 10 态枚举、prompt policy——全零触；本刀只收**读面**，Ban 以收窄为名改写路径语义。
- **对拍/守门零触（G1 已落）**：`packages/db/test/scor-parity.proof.ts`（57 断言）与 `0158_score_card_insert_guard.sql` 零字节零触零翻；scor-parity 复跑只作回归旁证。注意：`isScoreCardScorable` 不属对拍基准面（对拍=状态机/公式），若 D1 实测检出牵连如实披露，Ban 静默。
- **已落迁移零重写**：0100/0103/0109/0158/0159/0160×2 原文零字节（收窄走 CREATE OR REPLACE 新迁移）；Ban 动 `migrate.ts` 排序机制。
- **既有 base 红不碰**：`docs:check` PTP_FILE_LIMIT 预存红（G1 nail 登记 cap 2048 vs 4327）本刀 +1 交付物如实披露零语义恶化；其余预存红零 retry-to-green。
- **SSOT 零触**：backlog/matrix/LEDGER/issues-master 状态行不翻（更正版为外部文档·回写归协调方）；Ban secrets/`.env*`；零模型外呼 **est live=0**（`actualSpendCny=null`·0 Key 值接触）。

## §3 Prove

- **主证**：①收窄后 `migrate:prove` 绿（新迁移 DDL/权限/幂等）；②scor-02 复跑 EXIT=0（D3 翻转披露随卷）；③收窄负测/正测绿（`b_review_eligible` 卡不入读面/聚合·`practice_eligible` 入）；④GET 重闸负/正测绿。
- **回归门（EXIT 原值不回退）**：`interview:prove`（写卡链/评估链）·`neg:interview`（97=基线原值）·`scor-parity`（57 零翻）·scor-01/scor-03 零翻·`growth:prove`·`scoring-honesty.proof`（`:102-105` junior/mid 面·若 D1 本体收窄检出翻转即停止条件 (a)）·web `typecheck`/`web:prove`（web 侧零 diff 旁证）。
- 全部 attempts 入账零 retry-to-green；Ban masking/假绿叙事；attempts 一次优先。

## §4 Ban

Ban 触项1/项4 面（§2 逐锚）· Ban 触 S2 已落写路径/公式/状态机 · Ban 触 scor-parity/0158 字节 · Ban 复写已落迁移（新迁移 only·0161 起顺延）· Ban GET 重闸静默放行（fail-closed 是唯一方向）· Ban 收窄仅做单函数（list/aggregate 同刀同收）· Ban 断言删除/弱化（翻转须 D3 逐值披露）· Ban 新增响应码/信封键（复用 `:38` 既有映射）· Ban SSOT 编辑 · Ban model 外呼（est live=0 铁律）· Ban self-approve/代签 peer（alone≠dual）· Ban retry-to-green/masking/假绿 · Ban push 冒充执行 · Ban Meridian · Ban buy cloud。

## §5 Pins（十一值照抄 · 本刀不改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector·禁 MySQL/Qdrant 业务切流叙事）· 公开 DELETE /privacy/interview-data/:id=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false

## §6 Non-claims

读面收窄 ≠ B 端校准推进（`b_review_eligible` 的进入条件仍由 CalibrationRelease+人工复核门控·ADR `:57` 原文零松动）；GET 重闸 ≠ C 端页面相位切换（项1 另刀）；两可收项落卷 ≠ ADR-0020 四项全闭合（项1/项4 仍留 `:85` 未闭合账·收口措辞由 EXEC 在 ADR 状态段 append 按实际收面如实改写，Ban 预写「已闭合」）；收窄 ≠ 历史 `b_review_eligible` 卡数据处置决议（存量卡处置归校准期/另刀·本刀只定义读面不可见）；est live=0 ≠ 零成本主张外延。

## §7 停止条件（触发任一即停·收据如实）

(a) 收窄检出消费面（`growth-generation.ts:44`/`worker main.ts:172-189`）或 `scoring-honesty.proof` 对双态读面的隐含依赖翻转超 D3 披露面；(b) GET 重闸发现 persisted report/career_path 与卡态失配存在合法中间态（如重生成竞态）且无既定返回语义可裁；(c) 迁移编号 `0161` 冲突或 `0160` 双号面再漂。

## §8 STOP

本 REQUEST 为 docs-only 起草，**不授权 coding/prove 执行/实跑/push**。下一步：预执行双审（`awaiting_pre_exec_dual`·建议 db-schema + api-domain 双域——D1 收窄形制归前者·D2 GET 语义/D3 翻转形制归后者）BOTH Verdict: PASS → meetwise 授权 EXEC（含 D1/D2/D3 定值）→ coding+prove 一次优先 → post-prove 双审 → meetwise 授权 nail。implementer 不自批 · **alone ≠ dual** · **STOP**。

---

*REQUEST stub · G5 SCOR-S3 残面收尾刀 · Line line/g5-scor-s3 · g5-draft · 2026-10-11 · PENDING awaiting pre-exec dual · alone ≠ dual · Ban push · STOP*
