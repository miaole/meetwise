# REQUEST — **`product-readiness-c-b-audit.md` stale 更正刀（erratum · 双登记不改写）** · pre-exec · `mw-privacy-int`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-privacy-int`
**Knife**: `harness/gap-cb-audit-erratum.md` · `gap-cb-audit-erratum.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `50423a6f` / `50423a6fa6f18d4c9d193611cf84c4702e067208`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Peer stub**: `reviews/REQUEST-2026-10-07-gap-cb-audit-erratum-mw-e2e-ha.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

## Pins（原值全抄 · retained 写死）

| Pin | 值 |
|-----|-----|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| public DELETE | **503**（冻结 · W3 DELETE=503 freeze remains · Ban 开 DELETE） |
| backlog `:78` GAP-PROD-02 | **OPEN**（更正 ≠ 闭合 · P0-CB-02 同意边界零代码面零漂移） |
| backlog `:77` GAP-PROD-01 / `:103` BUG-SCORE-LEGACY | **OPEN / 防回归同列** |
| INT-TRANSCRIPT-01 | **blocked**（S-SCOR-0 前置门不弱化 · erratum 零触碰该面） |
| B 端数值暂停 | **保持**（`assessment_unavailable`/score=NULL 至校准 release + 人工复核 · ADR-0020 §3） |
| audit frontmatter `version: 1`/`status: active` | **零触碰**（erratum 双登记 · 原文零字节改） |

## Scope（待审 · privacy/INT 视角）

docs-only REQUEST：audit 文档 erratum 式更正（4 条编号项 binding 口径：E-1/E-3/E-4 全 stale + E-2 部分 superseded）。待审要点：**P0-CB-02 同意边界零代码面零漂移亲证**（`git grep -iE 'sharegrant|share_grant' -- ':!ai-docs'` = 0 hit · `consent_version|consentVersion` = 0 hit @ `50423a6f`——audit `:117-138` 缺口逐字仍成立、本刀对该面**零 erratum 项**是否如实）· **E-3 的 privacy 语义**（finalize 不接受客户端 interviewId + DB 反查 + `not_ready`→409 + calibration hold 下 outcome 恒 `assessment_unavailable`——更正措辞不得被读成「B 端数值分恢复」或「同意边界已建」）· **immutable `CandidateEvaluationSnapshot` 族 0 hit**（产品码口径 `-- ':!ai-docs'`）与 SCOR §2b#1「缺口重心=验收证据面」口径一致、C-EH-3「不可替代绑定」语义终裁面仍冻结于 S-CB-1（本刀不代办）· **同根复述点登记**（`:59`/`:60`/`:62`/`:89`/`:91`/`:245`/`:254`）无 privacy 面误伤（`:119`「现有 RLS 已证明 recruiter 不能直接读取 C 端 transcript」基线句仍真、未被 erratum 波及）· **原文保留铁律**（audit 文档零字节触碰）· **Ban 翻状态**（`:78` OPEN · DELETE=503 冻结 · INT-TRANSCRIPT-01 stays blocked）· **SCOR 换审冻结不受影响**（未来 S-CB-2 第一顺位仍 mw-privacy-int · 本刀不预授权任何切片）· EXIT 契约（attempts 全录 · Ban retry-to-green）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · **Ban 改写/删除/加注 audit 原文（含 frontmatter）** · Ban `:77`/`:78`/`:103` flip · Ban matrix/checklist/queue/backlog 翻行 · Ban coveredCount 变动 · Ban「同意边界已建/ShareGrant 已接线/撤回链路已闭环」宣称 · Ban B 端数值恢复/排序/自动决策 · Ban 开 DELETE（W3 freeze remains · 公开 DELETE=503）· Ban INT-TRANSCRIPT-01 blocked 摘除 · Ban 0091/0092/0096 形状触碰 · Ban S-SCOR-*/S-CB-* 实现借道（含 S-CB-2 预授权）· Ban SCOR nail 待办代办（OB①/OB② 属协调方）· Ban SSOT edit · Ban 碰 sibling 立卷工件（W6 链/MOP 链/AN 系列/reviews 既有文件）· Ban 审降级/换默认（dual = mw-e2e-ha + mw-privacy-int · 未来 S-CB-2 换审冻结不因本刀松动）· Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push · Ban self-approve（alone ≠ dual）

本 stub 未跑 prove、未起容器、未连远程环境、未改产品码 / migrations / scripts / `package.json`、未读 `.env*`、audit 文档零字节触碰；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

## Verdict

**PENDING**（awaiting 本席亲审 · alone ≠ dual · 不代签 peer mw-e2e-ha）

---

## PRE-EXEC dual 审查（mw-privacy-int · privacy/INT 焦点 · append-only · 2026-10-07）

**审席**：`mw-privacy-int`（独立 worktree `rv/audit-privacy-int` @ origin tip `8c6860e3` · 被审 REQUEST = origin `23b2ceb5`）· 禁自批 · alone ≠ dual · 本审段为 append-only 追加，前 40 行基线 4394 字节（md5 `b636fe7697e21a7e46890e8eb32bbf49`）机检 byte-intact。

**D0 · 被审对象与祖先（亲证）**：origin REQUEST `23b2ceb54ef6`（parent `78c35592`）∈ origin tip `8c6860e3` 祖先亲证（merge-base PASS）；line 孪生 `e258fe30`（parent `50423a6f` = SCOR nail）patch-id `03e2f145e7ee…313c66f3` 双侧亲算全等。docs-only 机检：恰 4 文件全 A、+242/−0、全 `ai-docs/*.md`、零产品码零迁移零 `package.json` 零 SSOT 零审 stub 触碰。

**D1 · 生死裁决（privacy 焦点）：erratum 更正未稀释 privacy 缺口面 —— 成立**
- **P0-CB-02 同意边界零漂移亲证**：`git grep -iE 'sharegrant|share_grant' -- ':!ai-docs'` 与 `consent_version|consentVersion` @`50423a6f` 与 @origin tip **双时点 rc=1（0 hit）亲算**；整树字面 grep 仅命中 ai-docs .md 语境文件（C-I-1 口径诚实，非实现）。audit `:117-138`（含 `:119` RLS 基线句）**无任何 erratum 项**；harness §2c 第一行如实登记「原文缺口逐字仍成立」。同根复述点仅 `:59`/`:60`/`:62`/`:89`/`:91`/`:245`/`:254`——**`:90`（处理目的/同意风险条）刻意不在列**，其前提属同意面而非绑定面，本刀不予 stale 化，正确。
- **DELETE=503 冻结 + B 端数值暂停保持**：E-3 更正原文写死「calibration hold 下任何完成收口 `assessment_unavailable`（outcome 恒定），B 端数值分暂停不被绕过」——@`50423a6f` 亲读 `recruiter.ts` `finalizeApplication`（`:182` 五向反查 JOIN）`score=NULL,status='assessment_unavailable'`、`0082_b_side_score_calibration_hold.sql` 头注「Hold every bound completion at the existing scoreless review terminal until SCOR-01..08 ship」逐字在位；backlog `:770` 登记行「W3 DELETE=503 freeze remains」+「S-CB-2→mw-privacy-int 第一顺位」原样。E-3 措辞不得读成「数值分恢复预告」（C-P4 绑定）。
- **UC-052/INT 面零触碰**：INT-TRANSCRIPT-01 **blocked**（stub Pins + SCOR S-SCOR-0 前置门）原样写死；erratum 零触碰该面；0091/0092/0096 形状在 Ban 列。
- **immutable snapshot / 验收证据面缺口保留**：`candidate_evaluation|evaluation_snapshot|application_snapshot` 产品码口径双时点 0 hit 亲算；验收表（audit `:110-115`）无 named prove 收据口径继承；「缺口重心=验收证据面」（SCOR §2b#1/D1）逐字继承——**更正只降现状证据面 stale，不降验收证据面缺口，四条更正无一处暗示同意面/快照面已闭合**。

**D2 · erratum 四条证据链（@SHA 亲证 · 与 SCOR 盘点一个口径）**：E-1 `applications.service.ts:35-56`（start 返 `interviewId`+`redirectTo` :50-57 窗）+ `recruiter.ts:354-430`（`FOR UPDATE` 行锁同事务 · `uq_interview_application_binding` 复用 · `bindApplicationRoute` P-LOOP · `interview_ineligible_route` fail-closed · attempt 单调）✓；E-2 `interviews/actions.ts:10-17` practice 仅 `resumeId` 半句仍真 + mig `0028` 双 partial UNIQUE + CHECK + 三 FK + 触发器（`:42` 函数/`:75` FOR EACH ROW）实存 ✓；E-3 `applications.service.ts:66-78`（`:67` denyPublicPreviewWrite · `:68-69` 注释「不接受客户端 interviewId。DB 会验证 application↔interview↔job↔resume↔owner」逐字 · `:71` `not_ready`→409 `cannot_finalize`）✓；E-4 `InterviewPanel.tsx:92-107`（fetch 恰 `:103` · `finalizedApplicationRef` 去重 · 失败 toast 非静默）+ 同源代理 route 头注「浏览器只给 applicationId；上游 strict DTO 拒绝 interviewId」逐字 ✓。binding 口径与 SCOR `gap-scor-p0cb-inventory.md` §9 C-EH-4「4 条编号项（1/3/4 全 stale + 第 2 条部分 superseded）」**逐字同口径**；OB①（「三条」措辞）OB②（「15 文件」cite）留 nail 未被代办（该文件本刀零 diff）；D4 遗留「audit 文档自身更正属未来 docs 刀」即本刀，衔接成立。E-1…E-4 verbatim 引用与 audit `:82-85` 逐字一致。

**D3 · 原文保留铁律（机检）**：audit 文档 blob `8393c67ba3fa…03cb` 在 `54cf5956`（末触）/`50423a6f`/origin tip **三时点全等**；REQUEST diff name-status 4A 不含该文件——零字节触碰由 diff 结构性保证；frontmatter `version: 1`/`status: active`/审查日期 `:22` 原样。

**D4 · Pins 原值零漂移（亲读）**：backlog `:77` GAP-PROD-01 / `:78` GAP-PROD-02 / `:103` BUG-SCORE-LEGACY 防回归同列亲读在位、OPEN 维持（`:770` 登记行）；matrix `e2e-requirement-coverage-matrix.md:234`「**partial**｜单链路有；三主体矩阵进 CI 仍缺」原文实位；coveredCount=8（rag-funnel matrix `:3`）；haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 全部原值（backlog `:32` pins 行同口径互证）；`package.json:98` `neg:bend`/`:194` `recruiter:prove`/`:273` `openapi:prove` 实中且本刀零新增零执行。

**P1–P12 检查表**：P1 祖先 ✓ · P2 docs-only 4A ✓ · P3 孪生 patch-id 全等 ✓ · P4 audit 原文零触碰 ✓ · P5 verbatim ✓ · P6 E-1 锚 ✓ · P7 E-2 锚 ✓ · P8 E-3 锚 ✓ · P9 E-4 锚 ✓ · P10 privacy 三面 0 hit 双时点 ✓ · P11 SCOR C-EH-4 同口径+OB 不代办 ✓ · P12 Pins 八项+`:77`/`:78`/`:103`+`:234` partial ✓。

**Fail-trigger audit（8 项 · 全 0 hit 机检）**：①借更正宣称同意面已闭合/ShareGrant 已接线/撤回闭环/「C/B 物理隔离可承诺」= 0；②`:77`/`:78`/`:103`/matrix/coveredCount 翻行 = 0（REQUEST 零 SSOT diff）；③DELETE=503 冻结松动/开 DELETE = 0；④audit 原文/frontmatter 改写加注 = 0；⑤B 端数值恢复/排序/自动决策宣称 = 0；⑥SCOR nail OB①② 代办 = 0；⑦S-SCOR-*/S-CB-* 借道实现/预授权/换审冻结松动 = 0；⑧status flip/`releaseEvidence=true`/HA 叙事 = 0。

**Blockers**：无。

**Conditions（随卷 binding）**：
- **C-P1（base 重钉）**：REQUEST 声明 Base=`50423a6f`（「fetch 后 origin tip」），origin REQUEST 实际 parent=`78c35592`，差 5 个 commits（`19df4e7f`→`d0754918`→`ae30bd92`→`b85b3b90`→`78c35592` 全为 docs REQUEST pre_dual）。本审亲证该 span 非 ai-docs **0 文件**、50423a6f→origin tip 全部 24 个 drift 文件均 ai-docs，全部代码锚 @`50423a6f` 与 @tip 双时点复核一致——零交集、非阻断；EXEC 授权时由协调方按当时 tip 重钉并沿用本条件登记。
- **C-P2（原文保留全程 binding）**：执行期与后续任何 rebase/镜像中，audit 文档（含 frontmatter、`:22` 审查日期、验收表、§6/§7）零字节触碰；erratum 只存在于 erratum 文档；Ban 在 audit 文档内加注。
- **C-P3（同意边界零稀释）**：P0-CB-02（audit `:117-138`）零 erratum 项为 binding 事实；Ban 借本更正宣称「同意边界已建/ShareGrant 已接线/撤回链路已闭环/可作 C/B 物理隔离或独立同意之商业合规承诺」；`:90` purpose/同意风险条不得在后续刀中被追加登记为 stale（其前提属同意面）。
- **C-P4（数值暂停与 DELETE 冻结）**：finalize outcome 恒 `assessment_unavailable`、score=NULL、`0082` hold 至校准 release + 人工复核（ADR-0020 §3）；E-3 更正措辞不得读成 B 端数值分恢复预告；W3 公开 DELETE=503 freeze remains，Ban 开 DELETE。
- **C-P5（状态翻转冻结）**：`:77`/`:78`/`:103` OPEN · matrix `:201`/`:234` partial · coveredCount=8 · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · ms3EqualsR4Closed=false · INT-TRANSCRIPT-01 blocked · S-CB-2 换审冻结（mw-privacy-int 第一顺位）原样；更正 ≠ 闭合 ≠ covered ≠ 验收证据面收敛（snapshot/consent_version/named proves/三主体矩阵四面缺口原样）。
- **C-P6（SSOT/邻接零触碰）**：backlog/matrix/checklist/queue/W6 链/MOP 链/AN 系列/`reviews/` 既有文件零 diff；SCOR nail 待办 OB①② 归协调方 nail；peer stub（mw-e2e-ha）PENDING 零触碰、不代签。
- **C-P7（EXIT 契约）**：未来授权后跑 named proves 须 attempts 全录（Asia/Shanghai 时间窗 · code SHA · EXIT 值）、EXIT≠0 判 fail、Ban retry-to-green（`GAP-PRIV-AUTHZ-PROVE-FLAKE :68` 先例）；EXIT0 ≠ `:78` closed ≠ covered ≠ HA ≠ `releaseEvidence=true`。

**观察（非阻断）**：OB-1 harness E-1「start 返回体 :50-57」实际 return 语句 :52-:57（:50-51 为收窄 throw 尾）——cite 窗略宽、无实质错引；OB-2 E-2 引「0028:6-24」而 `fk_job_application_resume_binding` 在 :27-31——四件套主张在文件内全数实存，窗口略窄、非弱化方向；OB-3 base 声明漂移已条件化为 C-P1。

**裁决候选**：(a) 放行 erratum 更正本体（原文保留 + 双登记 + 4 条编号项 binding 口径）为执行默认——**本席采 (a)**；(b) 不做须另立 REQUEST——否，SCOR nail D4/OB 已显式遗留本刀；(c) 仅授权部分条目——否，四条与 SCOR C-EH-4 binding 口径一一对应，拆切反而破「两刀一个口径」。

**边界**：本 PASS = PRE-EXEC dual 中 mw-privacy-int 一席半签，alone ≠ dual，不代签也不预签 peer mw-e2e-ha；PRE PASS ≠ coding ≠ prove 执行 ≠ live ≠ AUTHORIZE；执行须 PRE BOTH PASS + 协调方 AUTHORIZE；本审 0 prove run · 0 coding · 0 SSOT edit · 0 `.env*` 读取 · 0 Key 值读取 · 禁 push · 禁 force-push。

**三行中文摘要**：① c-b-audit stale erratum 刀 privacy 面亲审 PASS：更正严格限于 P0-CB-01 现状证据四条（@SHA 证据链逐锚亲算全中），P0-CB-02 同意边界（ShareGrant/consent_version 产品码双时点 0 hit）、`:90` purpose 风险条、DELETE=503 冻结、B 端数值暂停、INT-TRANSCRIPT-01 blocked 全部原样零稀释。② 与 SCOR 立卷一个口径：C-EH-4 四条编号项 binding 完全对齐、OB①② 留 nail 未代办、缺口重心=验收证据面继承写死；Pins 八项原值 + backlog `:77`/`:78`/`:103` + matrix `:234` partial 亲读零漂移。③ docs-only 恰 4 A md、audit 原文 blob 三时点全等（`8393c67b`）；base 声明 `50423a6f` 与实际 parent `78c35592` 差 5 个 docs-only 提交零交集（C-P1 重钉）；0 Blocker，C-P1~C-P7 随卷，alone ≠ dual 不代签 mw-e2e-ha。

Verdict: PASS
