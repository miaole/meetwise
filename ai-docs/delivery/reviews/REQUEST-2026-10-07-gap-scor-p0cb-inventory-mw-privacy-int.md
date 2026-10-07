# REQUEST — **Line SCOR · Phase 7 产品诚实首刀 · GAP-PROD-01 `:77`（SCOR）+ GAP-PROD-02 `:78`（P0-CB）盘点立卷** · pre-exec · `mw-privacy-int`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503（W3 freeze remains）
**Expert**: `mw-privacy-int`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/gap-scor-p0cb-inventory.md` · slice `gap-scor-p0cb-inventory.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `313e04a7` / `313e04a7fc0ca91ef60fb229802dd374f85cc93d`（origin tip · fetch 后 ff · 开工时点最新；网络受限下 fetch 4 次失败但 origin-tracking 已在此 tip，预期 ≥`313e04a7` 达成）
**Date**: 2026-10-07
**Line**: **SCOR**（queue Phase 7 product：「SCOR then P0-CB」· 盘点立卷刀）
**选审理由（按域判）**: backlog `:77` GAP-PROD-01 归属域原文 **product / privacy**——SCOR-01/02 生产实现唯一 P0 前置 = INT-TRANSCRIPT-00/01（privacy fact root · canonical artifact + 0091 授权 + 0096 逐 sink receipt · checklist `:194`），ScoreCard 面 fence 绑定 `assert_interview_answer_fact_active`/`assert_interview_privacy_active`（mig `0100` 头注）与 **W3 DELETE=503 freeze**（W6 hard dependency）属 privacy 域裁决权；GAP-PROD-02 的 **P0-CB-02 同意/撤回面**（ShareGrant/expiry/在途 `terminated_consent`/全数据面清理）同属 privacy 域。mw-model-op 对 SCOR-03/04 的 MODEL-OP 面在本刀仅为 ADR-0020/checklist 原文转述、无裁决负担——**S-SCOR-3 实现切片届时换入 mw-model-op 第一顺位**（harness §2c 写死）。

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（W3 freeze remains · Ban open DELETE · Ban forge erasure closed） |
| GAP-PROD-01 `:77` | **OPEN**（本 commit 零 SSOT 编辑 · Ban close via docs alone） |
| GAP-PROD-02 `:78` | **OPEN**（同上） |
| INT-TRANSCRIPT-00/01 | **◐ / blocked**（SCOR-01/02 生产前置 · 本刀零触碰该前置面） |
| B 端数值 | 暂停保持（`assessment_unavailable`/score=NULL） |
| Order | **SCOR then P0-CB** 写死 · P0-CB-01→02→03 内序 |

## 请审什么（mw-privacy-int）

docs-only 盘点立卷（零实现）四面（详见 peer stub Scope 与 harness §2）：(a) SCOR 现状诚实清单 §2a——**privacy 焦点：SCOR 生产前置 INT-TRANSCRIPT-00 ◐ / 01 blocked 的判定（checklist `:167`/`:173`/`:176`/`:194`）· ScoreCard fence 复用 0091/0096 不重实现删除根（mig `0100` 头注 · `scoring-fact-root.ts`）· DELETE=503 freeze 继承写死**；(b) P0-CB 现状诚实清单 §2b——**privacy 焦点：P0-CB-02 同意边界零实现（ShareGrant 全仓 0 hit）· 撤回/在途终止与隐私线联动边界**；(c) 修复切片定义 §2c（S-SCOR-0 前置门 + S-CB-2 隐私联动的范围表述是否诚实、不越权认领隐私线队列）；(d) 顺序写死 §3 + D1-D5 裁决点（D3 SCOR 前置判定为 privacy 焦点生死点之一）。

## 裁决点（expert 裁量 · 摘）

- **D3（privacy 焦点）**：INT-TRANSCRIPT-00 ◐ / 01 blocked → SCOR-01/02 生产前置不满足；树上的存储侧/隔离证明（`scor-01/02/03.proof.ts`）与 fence 复用声明不构成前置闭合、不得被读成隐私根已闭合。
- **D1（生死点）**：P0-CB-01 绑定基底 tip 已实存 vs backlog `:78` 原文——implementer 读法（行 OPEN 不变 · 盘点按 tip 实况 · 缺口重心=验收证据面）与收窄逃生门是否成立。
- **D2**：「SCOR then P0-CB」盘点序读法 + 实现序写死是否等价成立。**D4**：audit stale 双登记不改写 audit 文档是否成立。**D5**：本席按域选入替代默认 mw-model-op 是否成立。

本 stub 未跑 prove、未改产品码、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*
