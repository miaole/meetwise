# Harness — **Line AUDIT · `product-readiness-c-b-audit.md` stale 更正刀（erratum · 双登记不改写）**（docs-only REQUEST · **`draft:awaiting_pre_exec_dual`** · Ban coding · Ban prove 执行 · Ban 改写 audit 原文 · Ban 翻 `:77`/`:78` 状态 · 零实现）

**Status**: **`draft:awaiting_pre_exec_dual`**（empty review stubs · Ban self-approve · alone ≠ dual · 本刀零执行：零 coding · 零 prove 执行 · 零 live · 零 SSOT · **Ban 借更正翻 `:78`/`:77` 状态** · **Ban 宣称 P0-CB-01/02/03 closed 或 covered**）
**Date**: 2026-10-07（Asia/Shanghai）
**Base**: `origin/feat/mysql-schema-skeleton` · **`50423a6f`** / `50423a6fa6f18d4c9d193611cf84c4702e067208`（fetch 后 origin tip · SCOR nail）
**Wave**: Line **AUDIT**——SCOR 线 `50423a6f` 显式遗留的「未来 docs 刀」：`harness/gap-scor-p0cb-inventory.md` §9 C-EH-4（binding 口径）+ §9 OB①「audit 文档正文口径更正留 nail / audit 文档自身的更正属未来 docs 刀/协调方」+ §4 表行「**tip 部分现状证据 stale**（§2b#1 · D4 · 本刀不改写该文档）」。本刀即对该遗留的兑现：对 audit 本文档做 **erratum 式更正**（原文保留 + 更正声明并存）。
**Experts**: `mw-e2e-ha` + `mw-privacy-int`（沿 SCOR 线同席：GAP-PROD-02 `:78` 归属域 product / **e2e**——E-4 消费者链与 P0-CB-03 浏览器矩阵面裁决权在 mw-e2e-ha；P0-CB-02 **同意/撤回**面与 DELETE=503 冻结裁决权在 mw-privacy-int）
**Knife**: **audit stale 更正刀**——`ai-docs/requirements/use-cases/product-readiness-c-b-audit.md`（审查日期 2026-08-02）P0-CB-01 现状证据 4 条编号项（audit `:82-85`）在 tip `50423a6f` 已被代码 superseded：**第 1/3/4 条全 stale + 第 2 条部分 superseded**（binding 口径 = SCOR §9 C-EH-4）。本刀逐条 erratum（原文引用 + tip 实况 + 证据 @SHA），**不改写 audit 原文一个字**、**Ban 借更正翻 `:78`/`:77` 状态**。

## 0. erratum 模式铁律（本刀生死线 · 双审裁决点）

1. **原文保留**：audit 文档（含 frontmatter `version: 1` / `status: active` / 审查日期行 `:22`）零字节触碰；本 erratum 以独立文档承载「原文引用 + 更正声明」双登记。Ban 改写 · Ban 删除 · Ban 在 audit 文档内加注 · Ban 改 frontmatter。
2. **Ban 翻状态**：GAP-PROD-01 `:77` **OPEN** · GAP-PROD-02 `:78` **OPEN** · BUG-SCORE-LEGACY `:103` 防回归同列 · matrix `:234` GAP-PROD-02 **partial** · backlog/matrix/checklist/queue 零触碰（SSOT 登记属协调方 nail 阶段）。**更正 ≠ 闭合**：更正只降「现状证据面 stale」，**缺口重心仍在验收证据面**（SCOR §9 D1 裁决原样继承：「只降基底缺口、不降验收证据面缺口」）。
3. **Ban 借更正越权叙事**：Ban「P0-CB-01 已闭 / 绑定已建成 / C/B 闭环 / 三主体矩阵 covered / `releaseEvidence=true`」——tip 事实是**绑定基底实存**（存储+路由+反查+消费者），而 audit 验收表（`:110-115`：20 并发恰 1 会话 / 错配 409 / 重放恰 1 / 真实浏览器 C→B 全链路 1 条必过）**无任何 named prove 收据**，immutable `CandidateEvaluationSnapshot` 与 `consent_version` **产品码 0 hit**。
4. **Ban 实现借道**：SCOR 线 §2c S-SCOR-*/S-CB-* 切片定义、「SCOR then P0-CB」顺序、S-SCOR-0 前置门（INT-TRANSCRIPT-00/01 stays blocked）、S-CB-2 换审冻结（第一顺位 mw-privacy-int）全部原样继承；本刀零触碰该面，任何实现仍须未来各自 REQUEST。
5. **路径勘误（更正卷自证）**：任务/队列口径曾写 `ai-docs/delivery/product-readiness-c-b-audit.md`；tip 实况唯一实体路径为 **`ai-docs/requirements/use-cases/product-readiness-c-b-audit.md`**（`git log --follow` 全历史仅此路径 · frontmatter `id: requirements_product_readiness_c_b_audit`；`ai-docs/delivery/` 下无同名文件）。本卷引用一律用实路径；SCOR harness §0 原文口径（`product-readiness-c-b-audit` 短名）不受影响。

## 1. 背景（先读再写的事实链）

| 事实 | 锚 |
|------|-----|
| audit 文档落库 | `4b6be6cc`（2026-08-03「docs(oss): add training guides and terminology gate」）· 自述审查日期 **2026-08-02**（`:22`）· 末触 `54cf5956`（2026-09-04 内部预览架构笔记） |
| 绑定基底引入 | **`d9394e91`**（2026-08-18 · mig `0028_application_bound_interview.sql` 等）+ **`37602676`**（2026-08-18 · web finalize 同源代理路由）——**晚于** audit 审查日期，audit 当时证据属实、此后被代码 superseded |
| SCOR binding 口径 | `harness/gap-scor-p0cb-inventory.md` §9 C-EH-4：「audit 现状证据以 **4 条编号项**口径登记（1/3/4 三条全 stale + 第 2 条部分 superseded：practice 面入口在 tip 仍存在、application 面已被 `startApplicationInterview` 绑定路径覆盖）」+ OB①②（「三条」措辞统一与「15 文件」cite 更正归 nail · 本刀不代办） |
| W6 边界 | `harness/w6-p0-cb-scor-honesty.md`（2026-09-17 `post_prove_dual_pass` · dual `a6ca9e31`）指针式 honesty close 不重复立法；本刀 = audit 文档级 erratum，与其互补 |
| tip 亲证方式 | 本节与 §2 全部代码锚由 implementer 在 worktree `line/cb-audit-erratum` @ `50423a6f` 逐一亲算（文件读 + `git grep` 实测 + `git show 4b6be6cc:…` 对照 audit 时点源码）；非转述 |

## 2. 逐条 erratum（核心 · 4 条编号项 binding 口径 · 原文 verbatim + tip 实况 + 证据 @SHA）

### E-1 · audit `:82` 第 1 条 — **STALE**

- **原文（verbatim · 零改写）**：
  > 1. `POST /applications/:id/start` 仅把申请 `invited → in_progress`。
- **audit 时点（2026-08-02 · `4b6be6cc` 亲证）**：属实——当时 `startApplicationInterview(c, candidate, appId)` 为单条 `UPDATE job_application SET status='in_progress' … AND status='invited'`（@`4b6be6cc` `packages/db/src/recruiter.ts:150-156`）。
- **tip 实况（@`50423a6f`）**：start 经 `startApplicationInterview` 行锁同事务「看绑定 → 建 interview → 回写 application」，返回 `interviewId` 与 `redirectTo: /interview/:interviewId?applicationId=…`；route 未决即 fail-closed `interview_ineligible_route`（409），attempt 单调递增。
  - 证据：`apps/api/src/modules/jobs/applications.service.ts:35-56`（start 返回体 `:50-57`）· `packages/db/src/recruiter.ts:354-430`（`FOR UPDATE` 行锁 + `uq_interview_application_binding` 复用/新建 + `bindApplicationRoute` P-LOOP）· `packages/db/migrations/0028_application_bound_interview.sql`（引入 `d9394e91`）· 均在 worktree @ `50423a6f` 亲读。

### E-2 · audit `:83` 第 2 条 — **部分 superseded（practice 面仍真 · application 面已覆盖）**

- **原文（verbatim · 零改写）**：
  > 2. 普通面试创建入口只接收简历，不接收 `applicationId/jobId`。
- **tip 实况（@`50423a6f`）**：practice 面入口在 tip 仍只收 `resumeId`（`apps/web/app/interviews/actions.ts:10-17`——该半句仍真 · C-EH-4 口径「practice 面入口在 tip 仍存在」）；但 **application 面已被绑定路径覆盖**：`startApplicationInterview` 强制 `dto.resumeId` 且 DB 侧三 FK（`fk_interview_application_binding` / `fk_interview_job_binding` / `fk_interview_resume_binding`）+ CHECK 三件套（`ck_interview_application_binding_complete`）+ 双 partial UNIQUE 锁死 application↔interview↔job↔resume 一一对应——「普通面试入口」不再构成 application 域旁路（E-3 反查兜底）。该条不再支持「申请与面试无绑定」的整体结论，仅余 practice 面语义。
  - 证据：`packages/db/migrations/0028_application_bound_interview.sql:6-24` @ `50423a6f` 亲读。

### E-3 · audit `:84` 第 3 条 — **STALE**

- **原文（verbatim · 零改写）**：
  > 3. `finalizeApplication` 接受候选人任意本人 `interviewId`，只要存在已评估事件就会把其平均分写回该岗位申请。
- **audit 时点（2026-08-02 · `4b6be6cc` 亲证）**：属实——当时 `finalizeApplication(c, candidate, appId, interviewId)` 签名收客户端 `interviewId`，avg 本人 `answer_evaluated` 后 `UPDATE job_application … SET interview_id=$2, score=s.score, status='completed'`（@`4b6be6cc` `packages/db/src/recruiter.ts` finalizeApplication 函数体亲读）。
- **tip 实况（@`50423a6f`）**：finalize **不接受客户端 interviewId**（service 源码注释原文「不接受客户端 interviewId。DB 会验证 application↔interview↔job↔resume↔owner」）；DB 反查绑定不一致/未完成 → `not_ready` → 409 `cannot_finalize`；calibration hold 下任何完成收口 `assessment_unavailable`（`outcome` 恒定），B 端数值分暂停不被绕过。
  - 证据：`apps/api/src/modules/jobs/applications.service.ts:66-78`（`:67` denyPublicPreviewWrite · `:68-69` 注释 · `:71` `not_ready`→409）· `packages/db/src/recruiter.ts` `finalizeApplication` 反查实现 · `0082_b_side_score_calibration_hold.sql` · 均在 worktree @ `50423a6f` 亲读。

### E-4 · audit `:85` 第 4 条 — **STALE**

- **原文（verbatim · 零改写）**：
  > 4. 前端运行时代码没有调用 finalize；本次静态计数为 **0** 个消费者。
- **audit 时点（2026-08-02 · `4b6be6cc` 亲证）**：属实——当时 `git grep finalize -- apps/web` 0 命中（亲测）。
- **tip 实况（@`50423a6f`）**：web 已有终态自动触发消费者：`apps/web/components/InterviewPanel.tsx`（finalize useEffect：phase ∈ `report_ready`/`report_unavailable`/`assessment_unavailable` 且未确认过时 POST `/api/applications/:id/finalize`，body `'{}'`，成功后 `finalizedApplicationRef` 去重；失败 toast 不静默伪造）+ 同源代理 `apps/web/app/api/applications/[id]/finalize/route.ts`（头注原文「浏览器只给 applicationId；上游 strict DTO 拒绝 interviewId」）。
  - 证据：`InterviewPanel.tsx:92-107`（fetch 调用 `:103`）· route 文件全文亲读 @ `50423a6f`（引入 `37602676` 2026-08-18）。

### 2b. 同根 stale 复述点（登记 · 原文零改写 · 逐条指针到 E-x 根）

| audit 行 | 原文要点（缩引 · 非全文） | erratum 根 | tip 实况 |
|------|------------------------------|------|----------|
| `:59` 受邀申请状态行 | 「start 只更新 `job_application.status`，不创建 Interview、不 reserve 面试权益、也不返回可导航的 `interviewId`」 | E-1 | stale：start 建/复用 application-scoped interview 并返回 interviewId + redirectTo（reserve 语义仍属 S-CB-1 验收证据面，本条不宣称） |
| `:60` 回填综合分行 | 「没有约束该 interview 是这份 application/job 的专属会话」 | E-3 | stale：mig `0028` 双 partial UNIQUE + CHECK + FK + finalize DB 反查即该约束 |
| `:62` C 端产品结论 | 「全仓运行时代码对 `/applications/:id/finalize` 的消费者数为 **0**」 | E-4 | stale：web 消费者已实存（终态自动触发）；「投递后按岗位目标能力安排面试评估不能声称已实现」半句**仍成立**（缺口=验收证据面） |
| `:89`/`:91` 风险两条 | 「业务关联伪造」「无出口状态」 | E-1/E-3/E-4 | 前提四条已变：风险由「现状」降为 TARGET 风险叙事；登记不删 |
| `:245` §6.1 第 1 步 | 「引入 application-bound session/snapshot，删除任意 interview 回填入口，接自动 completion」 | E-1/E-3 | 基底与自动 completion（DB trigger `finalize_bound_job_application_on_interview_completion` @ `0028`）已在 tip 实存；剩余=验收证据面（snapshot/consent_version/prove 收据/浏览器 E2E） |
| `:254` §7 证据定位 | 列 `0005_job_application.sql`、`0009_interview_invitation.sql` | E-1/E-3 | 增量证据位（erratum 视角补充，不改原文清单）：`packages/db/migrations/0028_application_bound_interview.sql`、`apps/web/app/api/applications/[id]/finalize/route.ts` |

### 2c. 更正不改变的面（零漂移确认 · 亲证 @ `50423a6f`）

| 面 | tip 实测 | 结论 |
|----|----------|------|
| P0-CB-02 同意边界（audit `:117-138`） | `git grep -iE 'sharegrant|share_grant' -- ':!ai-docs'` = **0 hit**；`git grep -iE 'consent_version|consentVersion' -- ':!ai-docs'` = **0 hit**（亲测 rc=1） | 原文缺口**逐字仍成立**，无 erratum 项 |
| P0-CB-03 浏览器矩阵（audit `:128-138`） | `apps/web/e2e-ui/recruiting-bound.spec.ts` 在树（单链路）· matrix `:234`「**partial**｜单链路有；三主体矩阵进 CI 仍缺」 | 原文口径不变，无 erratum 项 |
| 验收表收据（audit `:110-115`） | `recruiter:prove`（`package.json:194`）/ `neg:bend`（`:98`）/ `openapi:prove`（`:273`）在树，均非 P0-CB-01 验收面 named prove（audit 口径 29/109/67 底座） | 「无 named prove 收据」不变——**P0 未闭结论不变且更稳** |
| immutable 评分快照 | `git grep -inE 'candidate_evaluation|evaluation_snapshot|application_snapshot' -- ':!ai-docs'` = **0 hit**（亲测 rc=1） | SCOR §2b#1 口径原样：缺口重心=验收证据面 |
| B 端数值暂停 | finalize `outcome: 'assessment_unavailable'` 恒定 + `0082` hold | 「B 端数值分暂停」原文成立且必须保持至校准 release（SCOR §2a#5 继承） |

## 3. 更正声明头（本 erratum 生效后读者口径 · 落于本文档头部语义）

> **ERRATUM（2026-10-07 · tip `50423a6f`）**：`ai-docs/requirements/use-cases/product-readiness-c-b-audit.md`（审查日期 2026-08-02）§2-P0-CB-01「现状证据」4 条编号项（`:82-85`）中，**第 1/3/4 条全 stale、第 2 条部分 superseded**——audit 时点证据当时属实，2026-08-18 `d9394e91`/`37602676` 落地绑定基底后被代码 superseded，tip 逐条实况见本文档 §2（E-1…E-4）。audit 原文按原样保留（双登记不改写）；本声明不改变任何 backlog/matrix/checklist 状态：GAP-PROD-02 `:78` stays **OPEN**、GAP-PROD-01 `:77` stays **OPEN**、P0-CB 内序 01→02→03 不变；更正后缺口重心=**验收证据面**（immutable snapshot / consent_version / 验收表 named proves / 三主体浏览器矩阵进 CI）。

## 4. Pins（原值全抄 · retained 写死）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · GAP-PROD-01 `:77` **OPEN** · GAP-PROD-02 `:78` **OPEN** · BUG-SCORE-LEGACY `:103` 同列 · matrix SCOR-00 **partial** / GAP-PROD-02 **partial**（`:234`）· B 端数值暂停保持（`assessment_unavailable`/score=NULL）· W3 DELETE=503 freeze remains · INT-TRANSCRIPT-01 **blocked** · audit frontmatter `version: 1`/`status: active` 零触碰 · coveredCount 零扩面（本刀零 matrix edit）

## 5. prove 计划（named · **本 REQUEST 零执行**）+ EXIT 契约

| Command | State | 说明 |
|---------|-------|------|
| `pnpm recruiter:prove`（`package.json:194`）· `pnpm neg:bend`（`:98`）· `pnpm openapi:prove`（`:273`） | 已存在 · 本 REQUEST **不跑** | audit 底座（29/109/67 · audit 口径）· 非 P0-CB-01 验收面 · 本刀仅行号实测核对 |
| 未来 S-CB-1…3 各片 proves | **待建 · 不命名 · 不授权** | 属未来各自 REQUEST（SCOR §2c 顺序合同 + 换审冻结原样） |

本 REQUEST 不新增脚本、不改 `package.json`、不跑任何 prove。**EXIT 契约**（未来授权后适用）：attempts 全记录（Asia/Shanghai 时间窗 · code SHA · EXIT 值）· 失败与成功同列入账 · EXIT≠0 → 判 fail → Ban retry-to-green（GAP-PRIV-AUTHZ-PROVE-FLAKE `:68` 先例）· EXIT0 ≠ P0-CB 已闭 ≠ `:78` closed ≠ covered ≠ HA ≠ `releaseEvidence=true`（G5/G7 口径）。

## 6. Ban 列表

- **Ban coding**（docs-only）· **Ban prove execution** · **Ban live**（无 Key/网络/付费/控制台 spend）· **Ban 任何 S-SCOR-*/S-CB-* 切片借本刀启动实现/迁移/接线**
- **Ban 改写 audit 原文**：audit 文档（`ai-docs/requirements/use-cases/product-readiness-c-b-audit.md`）零字节触碰，含 frontmatter、审查日期行、验收表、§6/§7——erratum 只存在于本文档
- **Ban 翻状态**：Ban `:77`/`:78`/`:103` flip · Ban matrix `:234`/`:201` 翻行 · Ban coveredCount 变动 · Ban `releaseEvidence=true`/HA 叙事 · Ban P0-CB-01「已闭/绑定已建成」宣称（绑定基底 ≠ 关闭 · SCOR §9 D1 继承）· Ban B 端数值恢复/排序/自动决策 · Ban 开 DELETE（W3 freeze remains · 公开 DELETE=503）· Ban INT-TRANSCRIPT-01 blocked 摘除
- **Ban SCOR nail 待办代办**：OB①（SCOR 卷正文「三条」措辞统一）与 OB②（「15 文件」cite 更正）属协调方 nail；本刀不触碰 `harness/gap-scor-p0cb-inventory.md` 正文
- **Ban SSOT edit**（backlog/matrix/checklist/queue/audit/W6 链/MOP 链/AN 系列/`reviews/` 既有文件零改）· Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push** · Ban self-approve（alone ≠ dual）· Ban 审降级/换默认（本刀 dual = mw-e2e-ha + mw-privacy-int）

## 7. Non-claims

docs-only REQUEST · not audit 文档改版 · not P0-CB-01/02/03 closed · not `:78`/`:77` flip · not covered · not 绑定验收通过 · not snapshot/consent_version 已建 · not HA · not suite green · not `releaseEvidence=true` · not INT-TRANSCRIPT-00/01 闭合 · not DELETE 开放 · not nail 待办代办 · PG-retained · DELETE=503 · alone ≠ dual · PASS ≠ AUTHORIZE ≠ 状态翻转

## 8. Review stubs

| Expert | Stub |
|--------|------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-cb-audit-erratum-mw-e2e-ha.md` |
| `mw-privacy-int` | `reviews/REQUEST-2026-10-07-gap-cb-audit-erratum-mw-privacy-int.md` |

**STOP——awaiting PRE dual（Ban self-approve · alone ≠ dual · 禁自批）· 预执行双审 PASS 后由协调方授权执行 · Ban push。**

*Harness · Line AUDIT · `product-readiness-c-b-audit.md` stale 更正刀（erratum · 双登记不改写）· 2026-10-07 · `draft:awaiting_pre_exec_dual` · 零 coding · 零 prove 执行 · 原文零触碰 · `:77`/`:78` OPEN · DELETE=503 · alone ≠ dual*
