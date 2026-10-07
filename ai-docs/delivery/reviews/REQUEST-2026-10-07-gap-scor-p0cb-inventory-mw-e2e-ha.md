# REQUEST — **Line SCOR · Phase 7 产品诚实首刀 · GAP-PROD-01 `:77`（SCOR）+ GAP-PROD-02 `:78`（P0-CB）盘点立卷** · pre-exec · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual · 不代签 peer `mw-privacy-int`）
**Expert**: `mw-e2e-ha`
**Peer**: `mw-privacy-int`（独立签 · alone ≠ dual · 按域选审 · 选审理由 harness §1b：`:77` 归属域原文 product/**privacy** + SCOR 前置 INT-TRANSCRIPT 面与 P0-CB-02 同意/撤回面属 privacy 域；mw-model-op 对 SCOR-03/04 的 MODEL-OP 面留待 S-SCOR-3 实现切片换入第一顺位）
**Knife**: `harness/gap-scor-p0cb-inventory.md` · `gap-scor-p0cb-inventory.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `313e04a7` / `313e04a7fc0ca91ef60fb229802dd374f85cc93d`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Line**: **SCOR**（queue Phase 7 product：「SCOR then P0-CB」· 盘点立卷刀）

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
| public DELETE | **503**（W3 freeze remains · Ban open） |
| GAP-PROD-01 `:77` | **OPEN** · Ban flip CLOSED |
| GAP-PROD-02 `:78` | **OPEN** · Ban flip CLOSED |
| BUG-SCORE-LEGACY `:103` | 同列防回归 |
| matrix | SCOR-00 **partial** · GAP-PROD-02/P0-CB **partial** |
| B 端数值 | 暂停保持（`assessment_unavailable`/score=NULL） |
| INT-TRANSCRIPT-01 | **blocked**（SCOR-01/02 生产唯一 P0 前置） |
| Order | **SCOR then P0-CB** 写死 · P0-CB-01→02→03 内序 |

## Scope（待审）

docs-only REQUEST 盘点立卷刀（沿 MOP03/MOP01/MOP02 先例 · 零实现）：(a) **SCOR 现状诚实清单**（harness §2a：SCOR-00 止血 + SCOR-00H 消费诚实已证（`package.json:396-398` · matrix `:201` partial）；SCOR-01/02/03 存储侧在树但零生产写路径（mig `0100`/`0103`/`0109` + `scoring-fact-root.ts` + `scoring-aggregation.ts:96` `listScorableScoreCards` 未收窄 + 隔离证明 `scor-01/02/03.proof.ts` ≠ 生产组合根）；B 端暂停基底（mig `0082`/`0046`/`0051`）；生产前置 INT-TRANSCRIPT-00 ◐ / 01 blocked 未闭合）；(b) **P0-CB 现状诚实清单**（harness §2b 逐项：P0-CB-01 绑定基底 tip 已实存（mig `0028` 双 partial UNIQUE + `recruiter.ts:354` `startApplicationInterview` + finalize DB 反查绑定 + web 消费者 `InterviewPanel.tsx:88-111`）——audit 2026-08-02 三条现状证据 stale 双登记、缺口重心=验收证据面（immutable CandidateEvaluationSnapshot 零代码、验收表无 named prove）；P0-CB-02 同意边界零实现（ShareGrant 全仓 0 hit）；P0-CB-03 单链路 spec 有（`recruiting-bound.spec.ts`）、三主体矩阵未进 CI（matrix `:234` partial））；(c) **修复切片定义**（harness §2c：S-SCOR-0…4 + S-CB-1…3，每片目标/触碰面/prove 拟案/依赖顺序 · docs 定义非执行 · 未来 proves 不命名不授权）；(d) **顺序写死**（「SCOR then P0-CB」+ P0-CB-01→02→03 内序 · harness §3）。**与 W6 边界**：`w6-p0-cb-scor-honesty` docs honesty close 只读继承不重复立法（harness §1a）。本刀零执行；prove 计划 named-not-run（harness §5 · 待建不命名不授权）· EXIT 契约预声明（attempts 全记录 · 诚实失败 · Ban retry-to-green · EXIT0≠已建≠已闭≠校准≠covered）。

## Ban（待审确认）

Ban coding · Ban prove 执行 · Ban live · Ban 任何 S-SCOR-*/S-CB-* 切片借本立卷启动实现/迁移/接线 · Ban SCOR 越权叙事（SCOR-01…08 已建/closed · 校准完成 · B 端数值恢复/排序/自动决策 · 读面收窄宣称 · 隔离证明冒充组合根）· Ban P0-CB 越权叙事（C/B 闭环 · 三主体矩阵 covered · 底座被取代 · audit 文档被本刀改写）· Ban 触碰前置面（INT-TRANSCRIPT-00/01 · 0091/0092/0096 形状 · MODEL-OP 面）· Ban 开 DELETE（W3 freeze remains）· Ban 顺序调换（双审可收紧不可放宽）· Ban SSOT edit · Ban 碰 sibling 立卷工件（W6 链/MOP 链/AN 系列）· Ban self-approve（alone ≠ dual）· Ban 审降级 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push**

## 裁决点（expert 裁量）

- **D1（生死点）· P0-CB-01 现状属向**：backlog `:78`「申请↔面试**无不可替代绑定**」（audit 时点 2026-08-02）vs tip 绑定基底已实存（mig `0028` + `startApplicationInterview` + finalize DB 反查 + web 消费者）——implementer 读法「backlog 行语义按原文 OPEN 不变，盘点按 tip 实况分项登记、缺口重心移至验收证据面」是否成立；若判原文在 tip 仍逐字成立，本刀显式改写收窄为「仅诚实登记」（逃生门 harness §1-D1 · Ban 静默换范围 · Ban 实现不因改写解禁）。
- **D2 · 「SCOR then P0-CB」顺序语义**：读法 A（实现序）vs B（盘点序）——implementer 读法 B 对本刀成立且 A 写死进切片启动门（harness §2c/§3），两读法产物等价；如判歧义有实现风险 → 收窄逃生门。
- **D3 · SCOR 生产前置判定**：INT-TRANSCRIPT-00 ◐ / 01 blocked → SCOR-01/02 生产前置不满足（checklist `:194`）；树上存储侧/隔离证明不构成前置闭合；模糊处（读面收窄是否属 S-SCOR-2 消费迁移范围）留裁决。
- **D4 · audit 文档 stale 面处置**：三条现状证据 stale 双登记不改写 audit 文档（更正属未来 docs 刀/协调方）是否成立。
- **D5 · 选审理由**（harness §1b）：第二席 mw-privacy-int（域判）替代默认 mw-model-op 是否成立；S-SCOR-3 届时换入 mw-model-op 第一顺位的写死是否足够。

本 stub 未跑 prove、未改产品码、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*
