# REQUEST — **GAP-UC018-WAITING-USER tip run** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）  
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`  
**Knife**: `harness/gap-uc018-waiting-user-tip.md` · slice `gap-uc018-waiting-user-tip.slice.md`  
**Parent tip**: `315870e`（series open · not a prove tip）  
**Date**: 2026-10-02 (~21:00 PT)

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
| Public DELETE | **503**（stays） |

Ban historical prove tip · Ban edits to backfill JSON and the emitter · matrix §1.1 UC-E2E-018 **partial**.

Dual PASS ≠ coding ≠ covered ≠ nail · No coding is authorized by this stub.

---

*Stub · awaiting expert pre-exec dual · STOP*


---

## 预执行审 · `23f5641` · 2026-10-02 (~21:07 PT)

**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 peer · 本段只追加 stub · 不改 harness  
**审的 SHA**: `23f5641`（`GAP-UC018-WAITING-USER` tip run · L0 docs）· 该 SHA 是 `origin/feat/mysql-schema-skeleton` 的祖先  
**分支已前移**: 点名 tip `5cd6cbc` 亦为祖先，不是当前 tip（当前 `49ef158`）。本文件自 `23f5641` 后无再改。按点名 SHA 审，不按后移 tip 另读。  
**性质**: pre-exec only · 本刀尚未跑 prove · Dual PASS ≠ coding ≠ nail ≠ covered

### 对照上轮裁定

上轮：`waiting_user` = **MISSING-EVIDENCE**。只有执行时的新 tip 跑数。禁止挑选任何历史 tip。禁止用 receipt-backfill JSON / emitter 造这份证据。

### 计划是否守禁

| 要求 | 文档 |
|------|------|
| 新跑，不钉历史 SHA | harness Goal：不复用 `85d36c7` / `f06dcba` / `549da9c` / `e88d386` / `23f98d3` / `bdc5993` / `b29c191` 及任何历史 SHA；Prove target 写「branch tip at execution」；「SHA chosen from history → dual fail-closed」 |
| 不覆盖旧收据 | 新目录 `receipts/uc018-waiting-user-tip/`；Ban 编辑 `uc018-receipt-backfill/**` 与 emitter |
| 不抬 UC-018 | Status `draft:awaiting_pre_exec_dual`；§1.1 **partial** retained；Ban invent covered / Ban flip §1.1 |
| pins | NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · 未改口 |
| ranAt / targetSha / wrapperSha | **未写这三项**。示例只有 `gitSha` 与 `runAt` |

示例把 `exit` 写成 0，正文另说非 0 要记下、不得 retune。示例不是默认成功。`evidenceOfRecord` 在 post-prove dual 前保持 false，不假关。空 `stack` 不得当成栈 MET。本 commit 不改 evaluator / 矩阵。

### 裁定

禁令已写进文档，历史 SHA 不能顶替新证据，UC-018 不抬。字段名缺口用条件钉死，不因此 FAIL。

### Conditions（post-prove 必须看见，否则不算证据）

1. 干净 worktree 的当时 `origin/feat/mysql-schema-skeleton` HEAD。禁止 checkout 历史 prove tip。  
2. 收据必须同时有 `ranAt`、`targetSha`、`wrapperSha`。只有 `runAt` / `gitSha` 不够。  
3. 路径不得落在 `uc018-receipt-backfill/`，不得调用现有 emitter 生产本证据。旧收据字节不变。  
4. `exit` 以实跑为准。非 0 不得洗成 0。示例里的 0 无效。  
5. `evidenceOfRecord` 在双方 post-prove 前保持 false。空 stack 不是 MET。  
6. 不改 evaluator、覆盖矩阵、§1.1。UC-018 保持 **partial**。pins 保持上表。  
7. EXIT=0 ≠ 产品绿 ≠ HA。Dual PASS ≠ coding ≠ nail ≠ covered。

### signature

**mw-rag-route** · 2026-10-02 (~21:07 PT) · WAITING-USER tip run pre-exec **PASS** @ `23f5641`（条件化）

Verdict: PASS
