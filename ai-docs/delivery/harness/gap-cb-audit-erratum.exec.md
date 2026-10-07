# EXEC — **Line AUDIT · c-b-audit stale erratum 执行登记（harness §2/§3 落地 · 生效 erratum）**（docs-only · **`executed:awaiting_post_prove_dual`** · audit 原文零字节 · 零 coding · 零 prove 执行 · 零 SSOT）

**Status**: **`executed:awaiting_post_prove_dual`**（PRE dual BOTH PASS + 协调方 AUTHORIZE（2026-10-07）后 exec landed · 本文件即执行产物 · **Ban self-write `post_prove_dual_pass`**（POST 双审 + 协调方 nail 专属）· alone ≠ dual · **Ban push**）
> **REQUEST-era lifecycle（historical · retained）**: harness `gap-cb-audit-erratum.md` / slice `gap-cb-audit-erratum.slice.md` 状态行保持 REQUEST 时点 **`draft:awaiting_pre_exec_dual`** 原样零触碰（C-AE-1 binding：EXEC diff 全数 `ai-docs/delivery/` 下 **A 状态**新登记文件，任何 M 即违约）——本刀 lifecycle 推进由本 exec 登记承载。
**Date**: 2026-10-07（Asia/Shanghai）
**Knife**: `harness/gap-cb-audit-erratum.md`（REQUEST · §2 四条编号项 + §2b 同根复述点 + §3 更正声明头）· `gap-cb-audit-erratum.slice.md`
**Erratum 对象**: `ai-docs/requirements/use-cases/product-readiness-c-b-audit.md`（审查日期 2026-08-02 · 本执行**零字节触碰**）
**REQUEST**: `e258fe30`（line/cb-audit-erratum 孪生 · parent `50423a6f` SCOR nail）≡ origin 镜像 **`23b2ceb5`**（patch-id **`03e2f145e7ee7f43e166c81fafe2c6cb313c66f3`** 两副本实测全等）
**PRE dual BOTH PASS（0 Blocker）**:
- `mw-e2e-ha`：rv 本机 **`925d1a70`** ≡ origin 链 **`86af8b30`**（patch-id **`0f105c4c87e08e3bd7f4771b1e32f4f693784ebe`** 两副本实测全等）
- `mw-privacy-int`：rv 本机 **`3e8c303e`** ≡ origin 链 **`951f7267`**（patch-id **`3929257f226ba8980bb905e077d2628e7c7052df`** 两副本实测全等）
**EXEC base（C-P1 重钉）**: origin tip **`ee7563a2`** / `ee7563a2675f7afb7b6b33407531b66f52f20fec`（fetch 后 origin/feat/mysql-schema-skeleton 最新 · REQUEST 申报 base `50423a6f` 与重钉 tip 的差集对本刀全部证据锚零交集 · 逐锚双 base 复证见 §3）

## §1 落位与 rebase 登记

- `line/cb-audit-erratum` rebase `origin/feat/mysql-schema-skeleton`（`ee7563a2`）：`e258fe30` **skipped previously applied**（git rebase 机检 skip · 与镜像 `23b2ceb5` patch-id 全等亲算）· exec HEAD base = `ee7563a2`。
- `50423a6f..ee7563a2` delta 机检：全 `ai-docs/` + **恰 1 非 ai-docs** = `scripts/run-e2e-isolated.mjs`（SS2 EXEC `ee7563a2` 头注 `:5-6` PG-retained 注释对齐 · comment-only · `package.json` 零 diff 机检 0 字节）——不碰本刀任何证据锚（§3 逐锚复证全中）。
- `reviews/` 既有文件零触碰：两 stub 已由双审 PASS 版（`86af8b30`/`951f7267`）在链上落定，本执行零 diff（C-P6/C-AE-6）。SCOR 卷 `harness/gap-scor-p0cb-inventory.md` 正文零触碰（OB①② 归协调方 nail）。
- 本 EXEC diff = **恰 1 个 A 状态文件**（本文件）· 零 M · 零 SSOT · 零产品码（C-AE-1 绑定自证）。

## §2 生效 erratum（原文 verbatim 引用块 + tip 实况 + 证据 @SHA 链 · audit 原文零改写双登记）

**ERRATUM（生效声明 · 2026-10-07 · exec base `ee7563a2`）**：`ai-docs/requirements/use-cases/product-readiness-c-b-audit.md`（审查日期 2026-08-02）§2-P0-CB-01「现状证据」4 条编号项（audit `:82-85`）中**第 1/3/4 条全 stale、第 2 条部分 superseded**——audit 时点证据当时属实（@`4b6be6cc` 亲证），2026-08-18 绑定基底落地后被代码 superseded，tip 实况逐条如下。audit 原文按原样保留（双登记不改写）；本声明不改变任何 backlog/matrix/checklist 状态（§5 Pins）；更正后缺口重心=**验收证据面**。audit 文档实体路径勘误已由 harness §0.5 登记（`ai-docs/requirements/use-cases/` 唯一实体 · Ban 移动文件本体）。

**E-1 · audit `:82` 第 1 条 — STALE**
> 1. `POST /applications/:id/start` 仅把申请 `invited → in_progress`。

tip 实况：start 经 `startApplicationInterview` 行锁同事务「看绑定 → 建 interview → 回写 application」，返回 `interviewId` + `redirectTo: /interview/:interviewId?applicationId=…`；route 未决 fail-closed `interview_ineligible_route`（409）· attempt 单调。锚：`apps/api/src/modules/jobs/applications.service.ts:35-56`（返回体 `:52-57`）· `packages/db/src/recruiter.ts:354-430`（`FOR UPDATE` 行锁）。**证据 @SHA 链**：引入 `d9394e91`（mig `0028_application_bound_interview.sql` · 2026-08-18，晚于 audit 审查日 2026-08-02=时点论证）→ 存续至 `50423a6f` ≡ exec base `ee7563a2`（`git diff` 零触碰亲证）。

**E-2 · audit `:83` 第 2 条 — 部分 superseded（practice 面仍真 · application 面已覆盖）**
> 2. 普通面试创建入口只接收简历，不接收 `applicationId/jobId`。

tip 实况：practice 面入口仍只收 `resumeId`（`apps/web/app/interviews/actions.ts:10-17`——半句仍真）；application 面已被 mig `0028` 覆盖：`resume_id` 强制 + 双 partial UNIQUE（`uq_interview_application_binding`/`uq_job_application_interview_binding`）+ CHECK 三件套（`ck_interview_application_binding_complete`）+ 三 FK + 不可变收口 trigger——普通面试入口不再构成 application 域旁路（E-3 反查兜底）。**证据 @SHA 链**：`d9394e91` → `50423a6f` ≡ `ee7563a2`（`0028:6-33` 双 base 亲读）。与 SCOR C-EH-4 binding 口径逐字对齐（practice 面在 tip 仍存在）。

**E-3 · audit `:84` 第 3 条 — STALE**
> 3. `finalizeApplication` 接受候选人任意本人 `interviewId`，只要存在已评估事件就会把其平均分写回该岗位申请。

tip 实况：finalize **不接受客户端 interviewId**（service 源注释 `:68-69` 逐字「不接受客户端 interviewId。DB 会验证 application↔interview↔job↔resume↔owner」）；DB 五向反查绑定不一致/未完成 → `not_ready` → 409 `cannot_finalize`（`:71`）；calibration hold 下 outcome 恒 `assessment_unavailable`、score=NULL（`0082_b_side_score_calibration_hold.sql` · `recruiter.ts:182` 五向反查 JOIN）——**B 端数值分暂停不被绕过，本条不得读成数值分恢复预告（C-P4）**。**证据 @SHA 链**：`d9394e91` → `50423a6f` ≡ `ee7563a2`。

**E-4 · audit `:85` 第 4 条 — STALE**
> 4. 前端运行时代码没有调用 finalize；本次静态计数为 **0** 个消费者。

tip 实况：web 已有终态自动触发消费者：`apps/web/components/InterviewPanel.tsx`（fetch `:103` · phase ∈ report_ready/report_unavailable/assessment_unavailable · ref 去重 · 失败 toast 不静默伪造）+ 同源代理 `apps/web/app/api/applications/[id]/finalize/route.ts`（头注「浏览器只给 applicationId；上游 strict DTO 拒绝 interviewId」）。**措辞纪律（C-AE-5）**：「消费者已实存」仅指调用链存在（UI 终态触发 + 同源代理 + strict DTO）——实存 ≠ 闭环 ≠ `:78` 可翻；DB trigger 实存 ≠ 自动 completion 验收通过。**证据 @SHA 链**：引入 `37602676`（web finalize 同源代理 · 2026-08-18）→ `50423a6f` ≡ `ee7563a2`。

**同根复述点 6 处（原文零改写 · 引用落地）**：audit `:59`（→E-1）· `:60`（→E-3）· `:62`（→E-4；「投递后按岗位目标能力安排面试评估不能声称已实现」半句仍成立）· `:89`+`:91`（风险两条前提已变 · 登记不删）· `:245`（基底与自动 completion trigger 已实存 · 剩余=验收证据面）· `:254`（增量证据位 `0028` + finalize route）——全文见 REQUEST harness §2b 表；`:90` purpose/同意风险条**不登记**（前提属同意面 · C-P3 binding）。**P0-CB-02（audit `:117-138`）零 erratum 项**（`sharegrant|share_grant` / `consent_version|consentVersion` / `candidate_evaluation|evaluation_snapshot|application_snapshot` 产品码口径 @`ee7563a2` 复测 rc=1 全 0 hit）· **P0-CB-03 零 erratum 项**（单链路 spec 在树 · 三主体矩阵未进 CI）。

## §3 erratum 铁律自证（C-AE-2 / C-P2 · 机检）

- **audit blob 三时点全等**：`git rev-parse 50423a6f:ai-docs/requirements/use-cases/product-readiness-c-b-audit.md` = `ee7563a2:…` = exec HEAD:… = **`8393c67ba3fa0e73ea6413be13086a5ac8c103cb`**（三时点逐点亲算全等）——零字节触碰（含 frontmatter `version: 1`/`status: active`、`:22` 审查日期、验收表 `:110-115`）。
- **audit `:82-85` verbatim 复核**@`ee7563a2`：四条逐字节与本卷 §2 引用块吻合（亲读）。
- **锚点双 base 复证**@`ee7563a2`：`recruiter.ts:354`（startApplicationInterview）· `applications.service.ts:35`（start）/:66（finalize）· `InterviewPanel.tsx:103`（fetch）· `0028`/`recruiting-bound.spec.ts` 实存 · `package.json:98`/`:194`/`:273` 三 CMD 在位 · matrix `:234` GAP-PROD-02 partial 逐字在位——`50423a6f` ≡ `ee7563a2` 全中。

## §4 Conditions 全集落实（C-P1~C-P7 + C-AE-1~7 · 逐条自评）

| Condition | 自评 | 落实/机检 |
|----|------|-----------|
| C-P1 base 重钉 | **满足** | REQUEST 申报 `50423a6f`；EXEC 按协调方授权以 `ee7563a2` 重钉（§1）；锚点双 base 全中（§3）· delta 1 非 ai-docs 为 SS2 comment-only 零交集 |
| C-P2 原文保留全程 binding | **满足** | blob `8393c67b` 三时点全等（§3）· EXEC diff 零 audit 路径 · 后续 rebase/镜像同 binding |
| C-P3 同意边界零稀释 | **满足** | P0-CB-02 零 erratum 项落地（§2 末段）· `:90` 不登记 · Ban 宣称同意边界已建 |
| C-P4 数值暂停与 DELETE 冻结 | **满足** | E-3 写死 outcome 恒 `assessment_unavailable`/score=NULL/`0082` hold · 「不得读成数值分恢复预告」落字 · DELETE=503 冻结（§5） |
| C-P5 状态翻转冻结 | **满足** | `:77`/`:78`/`:103` OPEN · matrix `:201`/`:234` partial · coveredCount=8 · INT-TRANSCRIPT-01 blocked · S-CB-2 换审冻结原样（§5） |
| C-P6 SSOT/邻接零触碰 | **满足** | backlog/matrix/checklist/queue/W6 链/MOP 链/AN 系列/`reviews/` 既有文件零 diff · SCOR OB①② 未代办 · peer stub 零触碰 |
| C-P7 EXIT 契约 | **满足（持续）** | 本 EXEC 零 prove；未来 named proves attempts 全录/Asia/Shanghai/code SHA/EXIT 值 · Ban retry-to-green · EXIT0 ≠ closed ≠ covered ≠ HA ≠ releaseEvidence=true |
| C-AE-1 docs gate 界定 | **满足** | EXEC diff 恰 1 A 文件（本文件 · `ai-docs/delivery/harness/`）· 零非该面文件 · 零 M |
| C-AE-2 audit 零字节收据 | **满足** | blob 机检入卷（§3）· 零「顺手修订」 |
| C-AE-3 Pins 冻结 | **满足** | EXEC diff 零 SSOT 行变动（§5 亲读零漂移） |
| C-AE-4 更正 ≠ 闭合 | **满足** | 全卷 Ban「已闭/绑定建成即闭环/矩阵 covered/浏览器闭环已验/releaseEvidence=true」· 缺口重心=验收证据面写死（§2 声明头 + §5） |
| C-AE-5 E-4 措辞纪律 | **满足** | 「消费者已实存」限定调用链存在性（§2 E-4）· Ban 外推 prove/E2E 授权 |
| C-AE-6 触碰面 | **满足** | SCOR 卷正文/W6 链/MOP 链/AN 系列/reviews 既有文件/sibling stub 零触碰（§1） |
| C-AE-7 alone ≠ dual | **满足** | PRE BOTH PASS 在卷（头部）· REQUEST diff 全 A 机检（`e258fe30` ≡ `23b2ceb5` 恰 4 A md +242/−0）· EXIT 契约持续 · POST 双审由协调方另派 |

双审 OB 7 条（e2e-ha 4 + privacy-int 3 · 全部非阻断保守向：cite 窗口宽窄/`:117-138` 过覆盖/§0.5 仓外前题/「≥2 实存」计法）——全收，无需 exec 动作；不弱化任何 binding。

## §5 Pins（原值零漂移 · 亲读 @`ee7563a2` re-certify）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**（W3 freeze remains）· GAP-PROD-01 `:77` **OPEN** · GAP-PROD-02 `:78` **OPEN** · BUG-SCORE-LEGACY `:103` 同列 · matrix `:201` SCOR-00 partial / `:234` GAP-PROD-02 partial · B 端数值暂停保持（`assessment_unavailable`/score=NULL）· INT-TRANSCRIPT-01 **blocked** · S-CB-2 换审冻结（mw-privacy-int 第一顺位）· SCOR then P0-CB 顺序 + P0-CB-01→02→03 内序写死 · audit frontmatter `version: 1`/`status: active` 零触碰 · coveredCount 零扩面

## §6 零执行声明

零 coding · 零 prove 执行（`recruiter:prove`/`neg:bend`/`openapi:prove` named-not-run）· 零 live · 零容器 · 零 `.env*` 读取 · `package.json` 零改 · 零新增脚本 · EXEC delta 恰本文件 1 个 A md · 全部 `ai-docs/delivery/` 下。

**STOP——awaiting POST dual（协调方另派 · 禁自批 `post_prove_dual_pass` · alone ≠ dual）· Ban push。**

*EXEC · Line AUDIT · c-b-audit stale erratum 执行登记 · 2026-10-07 · `executed:awaiting_post_prove_dual` · 原文零字节 · `:77`/`:78` OPEN · DELETE=503 · POST PASS ≠ AUTHORIZE ≠ nail*
