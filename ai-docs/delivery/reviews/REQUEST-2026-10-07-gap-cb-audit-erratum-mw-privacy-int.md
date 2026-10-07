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
