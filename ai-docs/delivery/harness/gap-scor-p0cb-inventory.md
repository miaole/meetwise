# Harness — **Line SCOR · Phase 7 产品诚实首刀 · GAP-PROD-01 `:77`（SCOR）+ GAP-PROD-02 `:78`（P0-CB）盘点立卷**（docs-only REQUEST · 立卷 executed · **`executed:awaiting_post_prove_dual`** · Ban coding · Ban prove 执行 · Ban 实现 · 队列「**SCOR then P0-CB**」顺序写死 · 零实现）

**Status**: **`executed:awaiting_post_prove_dual`**（PRE dual BOTH PASS（mw-e2e-ha `0617a15`≡主线 `8345f3c2` · patch-id `d73298d3…` 两副本等同 + mw-privacy-int `1c1b28d`≡主线 `cd908eff` · patch-id `339c9ed2…` 两副本等同 · 均 ∈ exec base 祖先）+ 协调方 AUTHORIZE 后 exec landed · REQUEST 自身即完整立卷产物 · exec = lifecycle 元行推进 + 双审 Conditions docs-side 落实（§1b/§2b/§2c/§3/§4/§9）· **Ban self-write `post_prove_dual_pass`**（POST 双审 + 协调方 nail 专属）· alone ≠ dual · 本刀零执行：零 coding · 零 prove 执行 · 零 live · 零 SSOT · **Ban SCOR-01…08 实现借道** · **Ban P0-CB 实现借道** · **GAP-PROD-01 `:77` / GAP-PROD-02 `:78` OPEN**）

> **Draft-era status（historical · retained）**: **`draft:awaiting_pre_exec_dual`**（empty review stubs · Ban self-approve · alone ≠ dual · 本刀零执行：零 coding · 零 prove 执行 · 零 live · 零 SSOT · **Ban SCOR-01…08 实现借道** · **Ban P0-CB 实现借道** · **GAP-PROD-01 `:77` / GAP-PROD-02 `:78` OPEN**）
**Date**: 2026-10-07（Asia/Shanghai）
**Base**: `origin/feat/mysql-schema-skeleton` · **`313e04a7`** / `313e04a7fc0ca91ef60fb229802dd374f85cc93d`（fetch 后 origin tip · NHP-016-FAULT-01 nail）
**Wave**: Line **SCOR**（queue `REMAINING-NORTH-STAR-QUEUE.md:43-44`：「## Phase 7 product / **SCOR then P0-CB**」——先盘后动 · 本刀 = Phase 7 首刀 **盘点立卷刀**（沿 MOP03/MOP01/MOP02 先例）：诚实清单（现状/缺口/接线图）+ 修复切片定义（不实现）+ 「SCOR then P0-CB」顺序写死）
**Experts**: `mw-e2e-ha` + `mw-privacy-int`（按域选审 · 选审理由见 §1b · PRE dual awaiting · Ban self-approve · alone ≠ dual · Ban nail）
**Knife**: **GAP-PROD-01 `:77` + GAP-PROD-02 `:78`（+ BUG-SCORE-LEGACY `:103` 同列防回归）盘点立卷**——按 backlog 原文把 SCOR 与 P0-CB 两工作面立卷（docs 定义）：SCOR 现状诚实清单 + P0-CB 现状诚实清单（含 audit 文档 stale 面如实登记）+ 修复切片定义（每片：目标/触碰面/prove 拟案/依赖顺序），**零实现**、**零迁移**、**零接线**
**Gap id**: **`GAP-PROD-01`**（backlog `:77`@本基线 `313e04a7` · P0 · **OPEN**）+ **`GAP-PROD-02`**（backlog `:78` · P0 · **OPEN**）+ **`BUG-SCORE-LEGACY`**（`:103` · P0 · 防回归同列）

## 0. backlog 原文（只读引用 · 零改写）

**`:77` GAP-PROD-01**（本基线 `313e04a7` 行号 · 实辖表头 `:55` = `| ID | P0/P1 | 现状 | 目标 | 归属域 | 拟切片 | 所需 harness 路径 |` · base 实测同位）：

> | GAP-PROD-01 | P0 | PRD-TEST-015 / SCOR：无冻结 rubric/cohort/calibration；B 端数值分暂停；依赖 INT-TRANSCRIPT 事实根 | 先 INT-TRANSCRIPT-00/01；再 SCOR-01…08 IssuedQuestionContract + AnswerVersion；校准前无排序/自动决策 | product / privacy | EXEC-01 / SCOR 包（前置 INT） | scor/int transcript prove；公开写门 inventory |

**`:78` GAP-PROD-02**：

> | GAP-PROD-02 | P0 | C/B 产品审计 P0：申请↔面试无不可替代绑定；同意边界；B 端浏览器闭环不足（`product-readiness-c-b-audit` P0-CB-01…03） | application-bound session/snapshot；目的限定同意/撤回；三主体浏览器矩阵进 CI | product / e2e | P0-CB-01→02→03 顺序 | 浏览器 E2E harness + 现有 HTTP/数据门 |

**`:103` BUG-SCORE-LEGACY**（B 节 · 防回归同列）：

> | BUG-SCORE-LEGACY | P0 | 历史公开伪评分路径已 410/止血，但可比评分/校准未建；题目均分不可作同尺度排名（PRD-TEST-001/015） | 保持 B 端 `assessment_unavailable` / 无自动决策直至 SCOR+校准 | product / e2e | 与 GAP-PROD-01 同列；防回归 | `pnpm scor-00:http:prove`；公开写门 prove |

列语义（表头 `:55`）：缺口列实名「现状」· 归属域 GAP-PROD-01 = **product / privacy**、GAP-PROD-02 = **product / e2e** · 下一刀列 = 「EXEC-01 / SCOR 包（前置 INT）」与「P0-CB-01→02→03 顺序」——顺序约束原文自带，本刀将其与队列「SCOR then P0-CB」一并**写死**（§2c/§3）。

## 1. 解读（implementer 解读 · 双审裁决点）

**解读（一句话）**：队列 Phase 7「SCOR then P0-CB」= 产品域两行 P0 的**先盘后动**序列；本刀为盘点立卷刀，把两面的 tip 实况（含 `product-readiness-c-b-audit.md` 三条 P0-CB-01 现状证据已被 tip 代码部分 superseded 的 stale 面）如实盘点 + 定义修复切片 + 写死实现顺序，**不实现任何一片**。

### 1a. 本刀与 W6 honesty close 的边界（Ban 重复立卷）

`harness/w6-p0-cb-scor-honesty.md`（2026-09-17 · `post_prove_dual_pass` · dual SHA `a6ca9e31`）已做 **docs honesty close**（P0-CB + SCOR 诚实清单级 close · W3 DELETE=503 freeze 绑定 · `SCOR-00 ≠ SCOR-01…08` · matrix SCOR-00 **partial** / GAP-PROD-02 **partial**）。本刀**不重复立法** W6 pins（只读 cite 原样继承），增量仅三点：(i) **tip `313e04a7` 代码级现状盘点**（W6 为指针式 close，未做逐锚盘点；且 P0-CB-01 绑定基底在 tip 已实存）；(ii) **修复切片定义**（每片目标/触碰面/prove 拟案/依赖顺序——W6 无）；(iii) **「SCOR then P0-CB」实现顺序写死**（W6 钉 P0-CB-01→02→03 内序，未钉两域间序）。W6 的 P0-CB-01→02→03 内序原样继承。

### 1b. 选审理由（按域判 · 任务允许 mw-e2e-ha + mw-model-op 默认或按域判）

**选 `mw-e2e-ha` + `mw-privacy-int`，非默认 mw-model-op**：(a) backlog `:77` 归属域原文即 **product / privacy**——SCOR 生产实现唯一前置是 INT-TRANSCRIPT-00/01（privacy fact root · canonical artifact + 0091 授权 + 0096 逐 sink receipt · checklist `:194`），ScoreCard 面 fence 绑定 `assert_interview_answer_fact_active`/`assert_interview_privacy_active`（mig `0100` 头注）与 W3 **DELETE=503 freeze**（W6 hard dependency）——该依赖面裁决权在 mw-privacy-int；(b) GAP-PROD-02 的 **P0-CB-02 同意/撤回面**同属 privacy 域（purpose-bound consent/撤回/在途终止）；(c) mw-model-op 对 SCOR-03/04 的 MODEL-OP 面（operation/预算/unknown）在本刀**仅为 ADR-0020/checklist 原文转述、无立法无裁决负担**——届时 **S-SCOR-3 实现切片 REQUEST 的 dual 第一顺位换入 mw-model-op，S-CB-2 第一顺位 mw-privacy-int——换审冻结（C-EH-5 · 届时不得降级/缺席/换默认 · §2c/§3 同步写死）**。GAP-PROD-02 的 e2e 面由 mw-e2e-ha 覆盖（浏览器矩阵 + CI 面）。

**裁决点（留给 PRE dual）**：

1. **D1（生死点）· P0-CB-01 现状属向裁决**：backlog `:78` 缺口列「申请↔面试**无不可替代绑定**」写于审计时点（`product-readiness-c-b-audit.md` 审查日期 2026-08-02）；tip `313e04a7` 实况为**绑定基底已实存**（§2b#1：mig `0028` 双 partial UNIQUE + CHECK + FK + fail-closed；`startApplicationInterview` 行锁同事务绑定；finalize 不接受客户端 interviewId、DB 反查绑定；web 已有 finalize 消费者）——implementer 读法：**backlog 行语义按原文 OPEN 不变（P0 · 未关），盘点按 tip 实况分项登记，缺口重心移至「验收证据面」**（immutable 评分快照零代码、consent_version 零代码、验收表各项无 named prove 收据、浏览器矩阵未进 CI）。若双审判「无不可替代绑定」在 tip 仍逐字成立（如判 DB 反查绑定 ≠ 不可替代绑定），本刀显式改写收窄为「仅诚实登记」（逃生门写死于此 · Ban 静默换范围 · Ban 任何实现不因改写解禁）。
2. **D2 · 「SCOR then P0-CB」顺序语义**：队列 `:43-44` 仅两行无细粒度。读法 A = 实现顺序（SCOR 修复切片先启动，P0-CB 后）；读法 B = 盘点顺序（先盘 SCOR 后盘 P0-CB）。implementer 读法：**B 对本刀成立**（盘点非实现、两域同卷不抢实现序），**同时把 A 写死进切片启动门**（§2c：S-SCOR-* 包先于 S-CB-* 包启动，无一豁免）——两读法下本刀产物等价，歧义零实现风险。
3. **D3 · SCOR 生产前置判定**：INT-TRANSCRIPT-00 **◐**（checklist `:167`/`:173`：issuer + 0091 账本在源码落地 · 无 JWS 验签 · 无真实组合根回执 · DELETE 503）、INT-TRANSCRIPT-01 **blocked**（`:176`）→ SCOR-01/02 生产实现的 P0 前置**不满足**（checklist `:194` 原文「SCOR-01/02 的生产实现明确依赖 INT-TRANSCRIPT-00/01 … 真实组合根证明」）；树上 mig `0100/0103/0109` 存储侧与隔离证明（`scor-01/02/03.proof.ts`）**不构成**前置闭合。模糊处（`listScorableScoreCards` 读面收窄是否属 S-SCOR-2 消费迁移范围）留双审裁决。
4. **D4 · audit 文档 stale 面处置**：`product-readiness-c-b-audit.md` §2-P0-CB-01 三条现状证据（start 不建会话 / finalize 收任意本人 interviewId / finalize 前端消费者 0）在 tip 均已被代码 superseded（§2b#1）——本刀**不改写 audit 文档**（SSOT 零触碰），只在 §2b 如实双登记（audit 原文口径 vs tip 实况口径），audit 文档自身的更正属未来 docs 刀/协调方。

## 2. 本刀范围（docs · 授权后可执行面）

| Face | 本 REQUEST（拟） | 仍须保留 |
|------|------------------|----------|
| **SCOR 现状诚实清单** | §2a 代码锚实测 @base `313e04a7`（SCOR-00/00H 已止血+消费诚实；SCOR-01/02/03 存储侧在树但零生产写路径；INT 前置未闭合） | GAP-PROD-01 `:77` OPEN · Ban 写成 SCOR 已建/可评分 |
| **P0-CB 现状诚实清单** | §2b 逐项（P0-CB-01/02/03）+ audit stale 双登记 | GAP-PROD-02 `:78` OPEN · Ban 写成 C/B 闭环 |
| **修复切片定义** | §2c S-SCOR-0…4 + S-CB-1…3（每片：目标/触碰面/prove 拟案/依赖顺序 · docs 定义非执行） | 未来 proves 不命名不授权 · 属未来各自 REQUEST |
| **顺序写死** | 「SCOR then P0-CB」+ P0-CB-01→02→03 内序（§2c/§3） | 无一豁免 · 双审可收紧不可放宽 |
| **prove/EXIT 契约** | §5 named proves 零执行 + EXIT 契约预声明（attempts 全记录 · 诚实失败路径） | named ≠ 授权（I2 先例） |

### 2a. SCOR 现状诚实清单（GAP-PROD-01 `:77` · 代码锚实测 @base `313e04a7`）

| # | 事实 | 代码锚 | 诚实含义 |
|---|------|--------|----------|
| 1 | **SCOR-00 止血 + SCOR-00H 消费诚实已立且已证**：legacy `/answer` 固定 410；消费面诚实闸（域+转写/POST 评估/POST career/SSE）接线；`refuseMappedBSideScore` 域侧恒失败 | `package.json:396`（`scor-00:http:prove`）· `:397`（`scor-00-honesty:prove`）· `:398`（`scor-00:sole-fixture:prove`）· `packages/domain/src/scoring-honesty.ts`（`refuseMappedBSideScore`）· checklist `:198`/`:199` [x] · matrix `:201` SCOR-00 = **partial** | 止血 ≠ 评分建成；`releaseEvidence=false`；**≠ SCOR-01…08 ≠ 校准 ≠ B 端可比较**（BUG-SCORE-LEGACY `:103` 防回归同列） |
| 2 | **SCOR-01 存储侧在树、零生产写路径**：mig `0100` 两阶段评分事实根（`IssuedQuestionContract` issue 阶段只冻题不冻答案、schema 层无 answer 列、显式状态机、fence 复用 0091/0096、`scoring_worker_executor` 角色分离）；db 层纯数据访问 | `packages/db/migrations/0100_scoring_fact_root.sql`（头注「**不接任何生产写路径**、不做确定性聚合、不调模型」）· `packages/db/src/scoring-fact-root.ts`（`asScoringWorkerPrincipal` · 头注同口径）· 隔离证明 `packages/db/test/scor-01.proof.ts` | 事实根表/状态机可证（隔离库），但**发题事务未接合同落库、提交未接 AnswerVersion/ScoreRequest**——生产组合根零回执；ADR-0020 状态 **proposed** |
| 3 | **SCOR-02 聚合/读面在树、消费迁移未做**：mig `0103` ScoreEvidence + 专用 score-writer + C 端只读聚合；读面 `listScorableScoreCards` 已有 5 处消费者 | `packages/db/migrations/0103_scoring_deterministic_aggregation.sql`（头注「SCOR-02：确定性聚合 + 专用 score-writer + 消费迁移」）· `packages/db/src/scoring-aggregation.ts:96`（`listScorableScoreCards`）· 消费点 `apps/api/src/modules/interview/interview.service.ts:728`/`:750` · `apps/worker/src/main.ts:160` · 隔离证明 `scor-02.proof.ts` | 消费点在用但**写路径未接**（无卡可读 → 现状走 SCOR-00H 诚实闸 fail-closed）；ADR-0020 §3：读面仍含 `practice_eligible` + `b_review_eligible`（**SCOR-00H 未收窄**）；checklist `:202` [ ] |
| 4 | **SCOR-03 证据/冲突/uncertainty 写路径语义在树**（同类：隔离可证、零生产接线） | `packages/db/migrations/0109_scoring_evidence_conflict_uncertainty.sql`（头注「SCOR-03」）· `packages/db/src/scoring-evidence-conflict.ts` · 隔离证明 `scor-03.proof.ts` · `packages/domain/src/scoring-operation-routing.ts` | SCOR-03/04 还依赖 **MODEL-OP-01**（checklist `:204`/`:205` 原文「在 MODEL-OP-01 后」）——双前置（INT + MODEL-OP） |
| 5 | **B 端数值暂停基底实存**：岗位绑定面试停 `assessment_unavailable`/score=NULL；no-eligible 终态；恢复面 | mig `0082_b_side_score_calibration_hold.sql` · `0046_application_assessment_recovery.sql` · `0051_application_no_eligible_score_terminal.sql` · `markApplicationNoEligibleScore`/`markApplicationAssessmentUnavailable`（`packages/db/src/index.ts:80`）· 消费面 `assessment_unavailable` 15 文件（`apps/web/lib/recruiter/surface.ts` 等） | 「B 端数值分暂停」原文成立且**必须保持**至校准 release + 人工复核（ADR-0020 §3 · checklist `:65`） |
| 6 | **生产前置未闭合（生死依赖）**：INT-TRANSCRIPT-00 ◐ / 01 blocked | checklist `:167`/`:173`（00 ◐：0091 issuer+账本在源码 · 无 JWS 验签 · 无组合根回执 · DELETE 503）· `:174`（0126 双写围栏 ≠ 01）· `:176`（01 blocked）· `:194`（依赖原文）· checklist `:201-209` SCOR-01…08 全 `[ ]` | **SCOR-01…08 全部未实施**（checklist 口径）；树上的存储侧/隔离证明 ≠ 生产接线 ≠ 前置闭合——本刀零触碰该前置面（INT/privacy 线域） |

### 2b. P0-CB 现状诚实清单（GAP-PROD-02 `:78` · 逐项 · 代码锚实测 @base `313e04a7`）

| # | 项 | tip 实况 | 代码锚 | 诚实含义 |
|---|----|----------|--------|----------|
| 1 | **P0-CB-01 绑定** | **基底已实存**（audit 2026-08-02 三条现状证据 stale · D1/D4）：`interview.application_id/job_id/resume_id` + 双 partial UNIQUE（`uq_interview_application_binding`/`uq_job_application_interview_binding`）+ CHECK 三件套 + FK + 旧无绑定 fail-closed；`startApplicationInterview` 行锁同事务「看绑定→建 interview→回写」+ route 绑定 fail-closed（`interview_ineligible_route`）+ attempt 单调；finalize **不接受客户端 interviewId**、DB 反查 application↔interview↔job↔resume↔owner、`not_ready`→409；web 已有 finalize 消费者（终态自动触发） | `packages/db/migrations/0028_application_bound_interview.sql` · `packages/db/src/recruiter.ts:354-430`（`startApplicationInterview`）· `apps/api/src/modules/jobs/applications.service.ts:35-56`（start→interviewId+redirectTo）/`:66-78`（finalize）· `apps/web/components/InterviewPanel.tsx:88-111` + `apps/web/app/api/applications/[id]/finalize/route.ts`（消费者）· `:68` 注释「不接受客户端 interviewId」 | **缺口重心 = 验收证据面**：immutable `CandidateEvaluationSnapshot`/评分快照（rubric/model/prompt/qbank 版本 + evidence hash）**代码域零命中**（产品码口径 `git grep -inE 'candidate_evaluation\|evaluation_snapshot\|application_snapshot' -- ':!ai-docs'` = 0 hit · C-EH-1/C-I-1 范围注记）；consent_version 绑定事务零代码（属 #2 面 · **C-EH-3 语义终裁面**）；audit 验收表（20 并发恰 1 会话 / 错配 interviewId 409 / 完成重放恰 1 / 真实浏览器 C→B 全链路 1 条必过）**无 named prove 收据**（`recruiter:prove` 29 断言为邀请/CAS/分数推导面、`neg:bend` 109 为负向面——audit 口径，非 P0-CB-01 验收面）——**绑定基底 ≠ P0-CB-01 关闭** |
| 2 | **P0-CB-02 同意边界** | **零实现**：`ShareGrant`/`share_grant` **代码域（产品码 · 非 ai-docs）0 hit**（`git grep -i 'sharegrant\|share_grant' -- ':!ai-docs'` = 0 hit · 整树字面 grep 仅命中 ai-docs 语境文件 · C-I-1 范围注记）；purpose-bound 同意/岗位快照版本/expiry/撤回/在途 `terminated_consent`/全数据面（DB/缓存/向量/SSE/checkpoint/trace）清理观测均无接线 | `git grep -i 'sharegrant\|share_grant' -- ':!ai-docs'` = 0 hit · consent 面仅 memory/隐私治理 mig（`0093`/`0095`/`0105`/`0107` 等非 C/B 申请域） | 原文缺口逐字成立（「同意边界」全开）——S-CB-2 将与隐私线联动（撤回 worker resume 竞态） |
| 3 | **P0-CB-03 浏览器矩阵** | **单链路 spec 在树、三主体矩阵未进 CI**：两独立 cookie context 的 C→B 真浏览器闭环（真实 HMAC webhook 额度 + production UI finalize + 评分暂不可用断言）已写；matrix 行 **partial** | `apps/web/e2e-ui/recruiting-bound.spec.ts`（头注：两 context、production Next UI、Ban 前端伪造额度）· matrix `:234`「**单链路有；三主体矩阵进 CI 仍缺**」· `golden.spec.ts` | 单链路 ≠ 三主体矩阵 ≠ CI 收据 ≠ `releaseEvidence=true`；`recruiter:prove`（`package.json:194`）/`neg:bend`（`:98`）/`openapi:prove`（`:273`）为 HTTP/数据/契约底座，**不得被新 E2E 取代**（audit §6.3） |

### 2c. 修复切片定义（docs 立卷 · 非本刀执行 · 每片：目标/触碰面/prove 拟案/依赖顺序）

**顺序写死（「SCOR then P0-CB」· 无一豁免）**：S-SCOR-0…4 包先于 S-CB-1…3 包启动；P0-CB 内序 **01→02→03**（backlog `:78` + audit §6 原文 + W6 继承）。每片须未来独立 REQUEST + 独立审（≥dual · 按 §1b 域选审 · S-SCOR-3 换入 mw-model-op 第一顺位 · S-CB-2 由 mw-privacy-int 第一顺位）· **Ban 借本定义启动任何实现**。

| 切片 | 目标 | 触碰面 | prove 拟案（未来 REQUEST 自带 · 本刀不命名不授权） | 依赖顺序 |
|------|------|--------|------------------------------------------------------|----------|
| **S-SCOR-0（前置门 · 非本线实现）** | INT-TRANSCRIPT-00/01 真实组合根闭合（canonical artifact + 删除授权 + 逐 sink receipt + 删后 read=0）——SCOR-01/02 生产实现唯一 P0 前置 | INT/privacy 线已有队列（checklist `:173`/`:176`）· 本线零触碰 | 属隐私/INT 线各自 REQUEST | **全局硬前置**（未闭合前 S-SCOR-1+ 一律不得启动） |
| **S-SCOR-1（SCOR-01 生产接线）** | 发题事务落 `IssuedQuestionContract`（只冻题不冻答案）；提交后以 canonical artifact 追加 `AnswerVersion`/`ScoreRequest` + answer HMAC + delete-wins permit | `packages/db/src/scoring-fact-root.ts` 接线 + interview 发题/提交 service + additive mig（如需）· Ban 碰 0091/0092/0096 形状 | issue→submit→fence 全链 prove（原始 SQL 逃逸 0 · 旧 worker 0 · 跨 owner 0 · 并发重放 · 答案替换 · 删除/撤权先赢 · 迟到结果丢弃——ADR-0020 §后果验证面） | 前置 S-SCOR-0 |
| **S-SCOR-2（SCOR-02 score-writer + 消费迁移 + 读面收窄）** | 专用 score-writer 原子切换 C 端 assessment/report/profile/memory 全部消费者；只消费资格化 ScoreCard；legacy event 均分切除；读面收窄（`b_review_eligible` 须独立 CalibrationRelease + 人工复核才可进） | mig `0103` 面 + `scoring-aggregation.ts` + `interview.service.ts:728/:750` + `worker main.ts:160` + 域 fail-closed 面 | 消费切换 prove（无资格卡 fail-closed：`409 no_scorable_cards`/`insufficient_evidence` · 空≠0 分 · GET 不重闸口径保持） | 前置 S-SCOR-1 |
| **S-SCOR-3（SCOR-03/04 证据/冲突/uncertainty + 评分 operation）** | 证据 span/hash/coverage/uncertainty 写路径（mig `0109` 面）+ criterion 级模型 operation/预算/unknown/`review_required`/`score_excluded` 语义 | `scoring-evidence-conflict.ts` + `scoring-operation-routing.ts` + MODEL-OP 面 | 证据复验/冲突→review_required（非 0 分）+ operation attempt/unknown 语义 prove | 前置 S-SCOR-2 + **MODEL-OP-01**；**换审冻结：dual 第一顺位 mw-model-op**（C-EH-5 · §1b · 不得降级/缺席/换默认） |
| **S-SCOR-4（SCOR-05/06/07/08 校准与 B 端门）** | 金标/双盲标注/cohort 稳定性；calibration release + 双盲人工复核；B 端用途硬门（无校准不得影响申请/列表/人才库/通知/导出）；真实组合根全验证 | 校准/复核/门禁面（届时立项） | 校准 release prove + 反事实公平集 + 决策审计 | 前置 S-SCOR-3；**校准不通过 → B 端保持暂停（`assessment_unavailable`/score=NULL 无限期合法）** |
| **S-CB-1（P0-CB-01 收口）** | 不可替代绑定**验收证据面**闭合：immutable `CandidateEvaluationSnapshot`（score/rubric/model/prompt/qbank 版本 + evidence hash）建模；audit 验收表逐项（20 并发恰 1 会话/错配 409/重放恰 1/浏览器 C→B 必过 1 条）；**自带「不可替代绑定」语义终裁（含 `consent_version` 事务绑定面——tip 代码域零命中 · C-EH-3 冻结；若届时判 DB 绑定 ≠ 审计意义不可替代〔snapshot 层不可变证据〕，范围以未来 REQUEST 重立——依赖列逃生门认可并冻结）** | `recruiter.ts`/`applications.service.ts` + additive mig + web 面 · Ban 动摇 `0028` 既有约束语义 | 验收表逐项 named proves + 浏览器 E2E（含刷新/双击/断网恢复） | **S-SCOR 包启动门之后**（「SCOR then P0-CB」写死）· D1 若判绑定语义仍有缺口，范围以未来 REQUEST 重立 |
| **S-CB-2（P0-CB-02 同意边界）** | purpose-bound `ShareGrant` + 岗位/简历快照版本 + expiry/retention + 可撤回 + 在途 `terminated_consent` + 全数据面清理观测 | additive mig + recruiter/applications 面 + **隐私线联动**（撤回与 worker resume 竞态） | 撤回后各数据面 0 命中 + 并发 20 次终态一致 + 已授权可见字段仅来自 snapshot | S-CB-1 后 · 01→02→03 内序写死 · **换审冻结：第一顺位 mw-privacy-int**（C-EH-5） |
| **S-CB-3（P0-CB-03 浏览器矩阵进 CI）** | 三主体浏览器矩阵（recruiter/candidate/第三租户 + 越权读 0 + 撤回后结果 0）进 CI；Ban mock API/DB | `apps/web/e2e-ui/` + CI profile · 保留 `recruiter:prove`/`neg:bend`/`openapi:prove` 底座 | 矩阵 ≥7 条全过收据（audit §4.2 阈值）· `releaseEvidence` 仍 false | S-CB-2 后 · 内序写死 |

### 2d. 现存 prove 面处置（docs 声明 · 本刀不执行）

现存 SCOR/CB 相关 prove（§5 全表）均为**局部面证据**（SCOR-00 止血/消费诚实、recruiter HTTP/数据门、B 端负向、契约发现），**不构成** §2c 任何切片的替代；隔离库证明（`scor-01/02/03.proof.ts`）≠ 生产组合根回执。本刀不新增脚本、不改 `package.json`、不跑不标红任何现存 prove；未来切片 REQUEST 落地时按其范围决定沿用/新建（G1：CMD+EXIT，叙事 ≠ 证据）。

## 3. 顺序与边界合同（写死 · Ban 放宽）

| 合同 | 内容 | 来源 |
|------|------|------|
| 两域间序 | **SCOR 包（S-SCOR-0…4）先于 P0-CB 包（S-CB-1…3）启动** | queue `:43-44`「SCOR then P0-CB」（本刀写死） |
| P0-CB 内序 | **P0-CB-01→02→03** | backlog `:78` 拟切片列 + audit §6 + W6 pins #4（继承） |
| SCOR 硬前置 | S-SCOR-1+ 一律以 S-SCOR-0（INT-TRANSCRIPT-00/01 组合根闭合）为启动门；S-SCOR-3 另加 MODEL-OP-01 | checklist `:194`/`:204`/`:205` + ADR-0020 |
| B 端冻结 | 校准 release + 人工复核前：B 端 `assessment_unavailable`/score=NULL、无排序/自动决策、`refuseMappedBSideScore` 恒失败 | backlog `:77`/`:103` + ADR-0020 §3 |
| W6 边界 | W6 honesty close pins 只读继承不重复立法；本刀 = inventory + slice definition | §1a |
| 隐私冻结 | **W3 DELETE=503 freeze remains** · SCOR 可比/B 端排序不得借隐私/擦除任何本地绿解锁叙事 | W6 hard dependency + BUG-PRIV-503（继承） |
| 审规格 | 本刀 dual = mw-e2e-ha + mw-privacy-int（§1b）；未来切片按域换审不降级（≥dual · 关键片 ≥2 域对抗 · G4）· **换审冻结：S-SCOR-3→mw-model-op / S-CB-2→mw-privacy-int 第一顺位（C-EH-5 · 不得降级/缺席/换默认）** | G4 + §1b |

## 4. 相关历史（只读 cite · 零改写）

| 来源 | 口径 |
|------|------|
| `product-readiness-c-b-audit.md` | P0-CB-01…03 验收 + 浏览器合约 + §6 实施顺序；**tip 部分现状证据 stale**（§2b#1 · D4 · 本刀不改写该文档） |
| `harness/w6-p0-cb-scor-honesty.md` + slice/eval | 2026-09-17 docs honesty close `post_prove_dual_pass`（dual `a6ca9e3`）· W3 DELETE=503 freeze 绑定 · P0-CB-01→02→03 序 · SCOR-00≠SCOR-01…08 |
| `adr/0020-scorecard-authority-and-eligibility.md` | **proposed**：已发题合同唯一输入根 + 专用 score-writer + 资格化消费 + score-excluded 默认；`listScorableScoreCards` 未收窄 |
| `architecture/ai/scoring-measurement-runtime.md` | status **draft**（目标架构 · 非现状） |
| `execution-master-checklist.md` | `:198-209`（SCOR-00 [x] · 00H [x] · 预览 UI ◐ · SCOR-01…08 全 [ ]）· `:167`/`:173`/`:174`/`:176`（INT-TRANSCRIPT ◐/blocked）· `:194`（依赖）· `:124` EXEC-01 ◐ |
| `e2e-requirement-coverage-matrix.md` | `:201` SCOR-00 **partial** · `:234` GAP-PROD-02/P0-CB **partial**「单链路有；三主体矩阵进 CI 仍缺」· `:264` P0-4 隐私 pin/评分止血 |
| `../north-star-hard-gates.md`（`ai-docs/delivery/north-star-hard-gates.md` · delivery 根实锚 · C-EH-2/C-I-2(a) exec 落实） | G1-G7 生效（门禁强制）：本刀 docs-only 走 G4 独立审；G2/G3 对未来切片的强制列（NEG/FAULT/BOUND/ADV/PERF/LOAD）在各自 REQUEST 落 |
| `harness/w3-int-transcript-delete-503-freeze.md` | DELETE=503 freeze（继承写死） |
| `REMAINING-NORTH-STAR-QUEUE.md:43-44` | 「## Phase 7 product / SCOR then P0-CB」（本刀认领） |
| PRD-TEST-015（remediation register `:54`） | 原文：先 INT-TRANSCRIPT-00/01 再 SCOR-01…08；同包切除 legacy event 消费；公开 DELETE 保持 503 |

## 5. prove 计划（named · **本 REQUEST 零执行**）+ EXIT 契约

| Command | State | 说明 |
|---------|-------|------|
| `pnpm scor-00:http:prove`（`package.json:396`） | 已存在 · 本 REQUEST **不跑** | SCOR-00 止血面（410 · 消费/事件/job/report/application 增量 0）· 局部证据 ≠ SCOR-01…08 |
| `pnpm scor-00-honesty:prove`（`package.json:397`）/ `pnpm scor-00:sole-fixture:prove`（`package.json:398`） | 已存在 · 本 REQUEST **不跑** | 消费诚实闸 / sole-fixture 诚实 · 同上 |
| `pnpm recruiter:prove`（`package.json:194`）· `pnpm neg:bend`（`package.json:98`）· `pnpm openapi:prove`（`package.json:273`） | 已存在 · 本 REQUEST **不跑** | audit 底座（29/109/67 断言 · audit 口径）· ≠ P0-CB-01 验收面 ≠ 三主体矩阵 |
| 隔离库证明 `scor-01/02/03.proof.ts` | 在树 · 本 REQUEST **不跑** | 存储侧隔离可证 ≠ 生产接线 ≠ 前置闭合（§2a#2-4） |
| S-SCOR-1…4 / S-CB-1…3 各片 proves | **待建 · 不命名 · 不授权** | 属未来各自 REQUEST 自带（§2c）· 含 G2/G6 六列（NEG/FAULT/BOUND/ADV/PERF/LOAD） |

本 REQUEST 不新增脚本、不改 `package.json`、不跑任何 prove。命名以上命令仅为双审 clarity（I2 先例：**named proves ≠ coding/prove 授权**）。

**EXIT 契约（预声明 · 适用于未来授权后的 prove · 本 REQUEST 零执行）**：

- **attempts 全记录**：每次 prove 尝试逐条入 receipt（attempt 序号 · Asia/Shanghai 时间窗 · code SHA · EXIT 值）；失败与成功同列入账。
- **诚实失败路径**：EXIT≠0 → 原样记录 → 判 fail → **Ban retry-to-green**（GAP-PRIV-AUTHZ-PROVE-FLAKE `:68` 先例）；如需重跑须新 REQUEST + 双审。
- **EXIT0 ≠** SCOR 已建 ≠ P0-CB 已闭 ≠ 校准完成 ≠ B 端可比较 ≠ covered ≠ `:77`/`:78`/`:103` closed ≠ HA ≠ suite green ≠ `releaseEvidence=true`（G5/G7 口径）。

## 6. Pins（原值全抄 · retained 写死）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **public DELETE=503** · **GAP-PROD-01 `:77` OPEN** · **GAP-PROD-02 `:78` OPEN** · **BUG-SCORE-LEGACY `:103` 同列** · matrix SCOR-00 **partial** / GAP-PROD-02 **partial** · B 端数值暂停保持（`assessment_unavailable`/score=NULL）· **SCOR then P0-CB 顺序写死** · W3 DELETE=503 freeze remains · INT-TRANSCRIPT-01 blocked

## 7. Ban 列表

- **Ban coding**（本刀 docs-only）· **Ban prove execution** · **Ban live**（无 Key/网络/付费/控制台 spend）· **Ban 任何 S-SCOR-*/S-CB-* 切片借本立卷启动实现/迁移/接线**
- **Ban SCOR 越权叙事**：Ban SCOR-01…08 已建/closed · Ban 校准完成 · Ban B 端数值恢复/排序/自动决策 · Ban 读面收窄宣称 · Ban 隔离证明冒充生产组合根
- **Ban P0-CB 越权叙事**：Ban C/B 闭环宣称 · Ban 三主体矩阵 covered · Ban `recruiter:prove`/`neg:bend`/`openapi:prove` 底座被取代 · Ban audit 文档被本刀改写
- **Ban 触碰前置面**：INT-TRANSCRIPT-00/01 · 0091/0092/0096 形状 · MODEL-OP 面（S-SCOR-3 届时另 REQUEST）· **Ban 开 DELETE**（W3 freeze remains）
- **Ban SSOT edit**（backlog/matrix/checklist/queue/audit 本刀零改 · SSOT 登记属协调方 nail 阶段）· Ban 碰 sibling 立卷工件（W6 链/MOP 链/AN 系列）
- Ban self-approve（alone ≠ dual）· Ban 审降级（未来切片 ≥dual 按域换审 · G4）· Ban 顺序调换（SCOR then P0-CB · 01→02→03 无一豁免；双审可收紧不可放宽）
- Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push**

## 8. Non-claims

docs-only REQUEST 立卷 · not SCOR 实现 · not P0-CB 实现 · not 校准 · not B 端可比较/排序 · not C/B 闭环 · not INT-TRANSCRIPT-00/01 闭合 · not MODEL-OP 面 · not DELETE 开放 · not audit 文档更正 · not `:77`/`:78`/`:103` flip CLOSED · not covered · not HA · not suite green · not `releaseEvidence=true` · PG-retained · DELETE=503 · alone ≠ dual · PASS ≠ coding ≠ prove ≠ AUTHORIZE

## 9. exec 登记（2026-10-07 · exec-era · docs-only · lifecycle 元行推进）

**PRE dual BOTH PASS + 协调方 AUTHORIZE 后 exec landed**：REQUEST `895f5ec8`≡origin 镜像 `6b61b734`（patch-id **`28d2806a575851758fc79172384cd4da99ff1487`** 两副本实测等同 · rebase skipped-CherryPicks 实证）· PRE dual PASS = **mw-e2e-ha `0617a15`≡主线 `8345f3c2`（patch-id `d73298d3957940c49562f4f556b8d2c2e6ae36ca` 两副本实测等同）+ mw-privacy-int `1c1b28d`≡主线 `cd908eff`（patch-id `339c9ed2f213a10209c34770454bb8c0ff7103bf` 两副本实测等同）**（两审 0 Blocker）· REQUEST 自身即完整立卷产物（SCOR/P0-CB 盘点 + 切片定义 + 顺序写死）→ 执行 = 本 harness/slice lifecycle 元行推进 **`draft:awaiting_pre_exec_dual` → `executed:awaiting_post_prove_dual`**（旧状态以 Draft-era historical retained blockquote 保留 · token 0 live residue）+ 双审 Conditions docs-side 落实（§1b/§2b/§2c/§3/§4/本节）。

**D1 裁决记录（两审一致 · 生死点 · P0-CB-01 现状属向）**：绑定基底 tip 实存成立（mig `0028` 双 partial UNIQUE + CHECK 三件套 + FK · `recruiter.ts:354` `startApplicationInterview` 行锁同事务 · finalize「不接受客户端 interviewId」DB 反查逐锚亲证）→ implementer 读法成立、收窄逃生门**不触发**、`:78` 按原文 **OPEN** 维持；audit stale 属向校正**只降基底缺口、不降验收证据面缺口**（缺口重心=验收证据面）；privacy 附加写死保留：「不可替代」含 snapshot 面、S-CB-1 验收证据面闭合前 `:78` 不得 flip（C-I-3）。D2/D3/D4/D5 两审全成立（D5：e2e-ha+privacy-int 审席组合两席裁合理；S-SCOR-3 换 mw-model-op 写死足够 → 升格冻结见 C-EH-5 落实）。

**落位与 base 重验（rebase 落 tip 后锚点核对）**：

- **落位**：`line/scor-p0cb-inventory` rebase `feat/mysql-schema-skeleton`（本机主线 @ `cd908eff` · 含 PRIV01/INT01 链 + 本刀双审 `8345f3c2`/`cd908eff`）→ REQUEST 同补丁副本 drop（镜像 `6b61b734` 已 ∈ 祖先 · patch-id 同上）· exec HEAD = **`cd908eff`**（= mw-privacy-int PRE PASS commit · 两 PRE PASS `8345f3c2`+`cd908eff` 均 ∈ exec base 祖先亲证）。
- **零码移复证**：`git diff --name-only 313e04a7..cd908eff` = 12 文件全 `ai-docs/` · `git diff --stat 313e04a7..cd908eff -- src apps packages scripts migrations package.json` = **0 字节** → §2a/§2b 代码锚在新 base 全部继续有效（抽验：mig `0028`/`0046`/`0051`/`0082`/`0100`/`0103`/`0109` 七件实存 · `recruiter.ts:354` · `applications.service.ts:35-56`/`:66-78` · `InterviewPanel.tsx:88-111` · `scoring-aggregation.ts:96` · `scoring-fact-root.ts`/`scoring-evidence-conflict.ts` · `package.json:98`/`:194`/`:273`/`:396`/`:397`/`:398` 六 CMD 实存 · w6 dual SHA `a6ca9e31` `:35` · audit P0-CB-01 编号项 **×4** 实数）。
- **SSOT 行号 tip 实测（只读核对 · 零改）**：backlog `:55` 表头 / `:77` GAP-PROD-01 / `:78` GAP-PROD-02 / `:103` BUG-SCORE-LEGACY · matrix `:201` SCOR-00 partial / `:234` GAP-PROD-02 partial / `:264` P0-4 · checklist `:167`/`:173`/`:174`/`:176`/`:194`/`:198-209`（SCOR-00 [x] · 00H [x] · SCOR-01…08 [ ]）· queue `:43-44`「SCOR then P0-CB」——**base→tip 全部零漂移**（delta 12 文件零触碰上述 SSOT）。
- **named proves**：六条 CMD 行号 tip 实测全在位 · 零跑零新增零 receipt。

**Conditions 落实清单（C-EH-1~8 + C-I-1~7 · 全 docs-side · 零 SSOT 行改动）**：

| Condition | 内容 | 落实位置 |
|----|------|----------|
| C-EH-1 / C-I-1 | 零命中措辞按代码域口径校准（`-- ':!ai-docs'`） | §2b#1（candidate_evaluation 族 · 产品码 0 hit）· §2b#2（ShareGrant · 产品码 0 hit · 整树字面仅 ai-docs 语境）落字 |
| C-EH-2 / C-I-2(a) | hard-gates 路径实锚 delivery 根 | §4 更正 `harness/north-star-hard-gates.md` → `../north-star-hard-gates.md`（`ai-docs/delivery/north-star-hard-gates.md`） |
| C-EH-3 | S-CB-1 自带「不可替代绑定」语义终裁，含 `consent_version` 事务绑定面（冻结） | §2c S-CB-1 目标落字（snapshot 层不可变证据判读逃生门认可并冻结） |
| C-EH-4 | audit 现状证据以 **4 条编号项**口径登记（1/3/4 三条全 stale + 第 2 条部分 superseded：practice 面入口在 tip 仍存在、application 面已被 `startApplicationInterview` 绑定路径覆盖） | **本节登记为 binding 口径**；audit 文档零改写 · audit 文档正文口径更正**留 nail**（协调方 · 本卷正文引作「三条」的措辞统一亦留 nail） |
| C-EH-5 | 审席换审冻结 | §1b/§2c（S-SCOR-3→mw-model-op · S-CB-2→mw-privacy-int 第一顺位 · 不得降级/缺席/换默认）· §3 审规格行 |
| C-EH-6 / C-I-7 | named proves ≠ 授权 · EXIT 契约持续 | §5 原样维持（六 CMD named-not-run · 待建不命名不授权 · attempts 全记录 · 诚实失败 · Ban retry-to-green · EXIT0≠已建≠已闭≠校准≠covered） |
| C-EH-7 | Pins 冻结至 nail | §6 原值零漂移 · SSOT 登记属协调方 nail 阶段 |
| C-EH-8 / C-I-5 | alone ≠ dual 不代签 | 本 exec 零 self-write POST · awaiting POST dual（协调方另派） |
| C-I-2(b) | 「assessment_unavailable 15 文件」cite 漂移（privacy-int 实测：非 ai-docs **34** 文件 · apps/web 内 9） | **归 nail 更正**（本节登记 · 正文留原值 · cite-only · 实质结论零变动） |
| C-I-3 | D1 逃生门写死保留（`:78` 闭合前不 flip · 收窄若触发须显式入卷 Ban 静默换范围） | §1-D1/§2c S-CB-1 原样 + 本节再确认 |
| C-I-4 | 前置门不弱化 · INT-TRANSCRIPT-01 stays **blocked** | §2a#6/§2c S-SCOR-0/§3 原样 + 本节再确认（立卷 ≠ 授权 · SCOR-01…08 / S-SCOR-*/S-CB-* 零借道启动） |
| C-I-6 | append-only（审段）· 被审 stub 前 43 行 byte-intact | 本 exec 零触碰 `reviews/`（exec delta 恰 harness+slice 2 md） |

**OB/遗留（归 nail · docs-side）**：① audit「4 条编号项」口径在正文（§0-D1/§2b#1 引作「三条」）的措辞统一更正——binding 口径见 C-EH-4 行，正文措辞留 nail；② §2a#5「15 文件」→ 非 ai-docs 34（apps/web 9）——留 nail；③ 两件均 cite-only、实质结论零变动，登记不弱化。

**写死保留（未来切片绑定）**：未来任何 S-SCOR-*/S-CB-* 切片 REQUEST 须**同时**满足——(1) 本刀 §2c 内容清单（每片目标/触碰面/prove 拟案）+ §3 顺序合同（「SCOR then P0-CB」· P0-CB-01→02→03 · 无一豁免）；(2) **S-SCOR-0 前置门**（INT-TRANSCRIPT-00/01 真实组合根闭合 · stays blocked 直至授权闭合 · C-I-4 不弱化）；(3) **换审冻结**（C-EH-5）；(4) **§5 EXIT 契约** + G2/G3 六列（NEG/FAULT/BOUND/ADV/PERF/LOAD）——缺一不可；本刀 PRE PASS/exec ≠ 上述任一项预授。

**铁律持续自证**：零实现 · 零 prove 执行 · 零 live · 零产品码（`313e04a7..cd908eff` delta 复证 0 字节 · 本 exec delta 恰 harness+slice 2 md）· **SSOT 零触碰**（backlog/matrix/checklist/queue/audit/W6 链/MOP 链/AN 系列/`reviews/` 零改 · SSOT 登记属协调方 nail 阶段）· **「SCOR then P0-CB」顺序写死** · S-SCOR-0 前置门不弱化（INT-TRANSCRIPT-01 stays blocked）· **Pins 原值零漂移**（§6）· DELETE=503 · **GAP-PROD-01 `:77` / GAP-PROD-02 `:78` OPEN** · **Ban self-write `post_prove_dual_pass`**（POST 双审 + 协调方 nail 专属 · Ban open POST here）。

**STOP——awaiting POST dual（协调方另派 · 禁自批）· Ban push。**

## Review stubs

| Expert | Stub |
|--------|------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-scor-p0cb-inventory-mw-e2e-ha.md` |
| `mw-privacy-int` | `reviews/REQUEST-2026-10-07-gap-scor-p0cb-inventory-mw-privacy-int.md`（按域选审 · 理由 §1b） |

**PRE dual BOTH PASS（mw-e2e-ha `0617a15`≡主线 `8345f3c2` + mw-privacy-int `1c1b28d`≡主线 `cd908eff`）+ 协调方 AUTHORIZE 已兑现 · docs 立卷面已执行 = lifecycle 元行推进至 `executed:awaiting_post_prove_dual` · Ban coding / Ban prove / Ban live 持续 · awaiting POST dual（Ban self-write `post_prove_dual_pass` · Ban open POST here · nail 属协调方 · SSOT 登记属 nail 阶段）。**

*Harness · Line SCOR · Phase 7 产品诚实首刀 · GAP-PROD-01 `:77`（SCOR）+ GAP-PROD-02 `:78`（P0-CB）盘点立卷 · 2026-10-07 · `executed:awaiting_post_prove_dual` · 零 coding · 零 prove 执行 · 「SCOR then P0-CB」顺序写死 · 零实现 · DELETE=503 · `:77`/`:78` OPEN · alone ≠ dual · STOP（awaiting POST dual · Ban self-write）*
