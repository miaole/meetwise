# REQUEST — **PRIV4 · GAP-PRIV-04 vector erase** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-privacy-int`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/gap-priv-04-vector-erase.md` · slice `gap-priv-04-vector-erase.slice.md`
**Parent tip**: `14c14a31`（full `14c14a316477745d142bbd02ba383e477888adde` · `origin/feat/mysql-schema-skeleton` MOP01 nail tip · not a prove tip · 开工时点 origin 最新 tip；首测 `2fd78ea1` 被并发 nail 前移 · delta 恰 MOP01 立卷 append · 与本刀面零交集）
**边界 cite**: AR 线 `71713718`（GAP-PRIV-EXTERNAL-SINK async purge nail · backlog `:64` **OPEN** · stub≠cloud · cloudVendorDeleted=false · NB-3 · Ban count-as-erased）——**只读边界 · Ban 借证据/状态 · Ban 洗 OPEN 钉**
**Date**: 2026-10-07
**Line**: **PRIV4**（队列 Phase 3 privacy · vector erase）

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained**（Ban Qdrant / replace-pgvector cutover） |
| Public DELETE | **503**（stays · GAP-PRIV-02 冻结） |
| backlog `:60` GAP-PRIV-04 | **OPEN**（本 commit 零 SSOT 编辑 · Ban close via docs alone） |
| backlog `:64` AR external sink | **OPEN**（cite only） |
| UC-052 | **partial**（Ban covered flip） |
| cloudVendorDeleted 类 | **false**（本地/隔离擦除 ≠ 云端真删 · 沿 AR 口径） |

## 请审什么（mw-privacy-int）

1. **候选裁定诚实性**：A 软删标记 / B 物理删除（0125 同形）/ C 擦除收据链三候选利弊是否如实（B 的 HNSW 索引内部页/WAL/备份不在证据面披露 · A 的「非物理擦除 · Ban soft-as-erased」）· 实现方倾向（B 主体 + C receipt 收尾）是否被正确标为**非绑定、交双审裁**。
2. **0091 主链边界**：候选 C 是否写死「复用 0091 `privacy_deletion_receipt` **现有**形状/函数 · **0091 语义不动除非显式申报**」——Ban 借刀动 authorization/issuer 主链（issuer 快照 / `privacy_epoch`+`target_set_digest` / completed guard L516–545 语义不动）。
3. **向量面 vs AR `:64` external 面边界**：PG 向量面证据 ≠ oss/redis/langfuse async purge 证据 · Ban 借 AR 证据/状态 · Ban 洗 `:64` OPEN 钉 · 两面 receipt 互不抵扣。
4. **fail-closed 断言充分性**：未授权擦除拒绝（fence/403 红）+ 授权后 subject 向量 recall=0 + 行数=0 + 残留快照=0 + 跨 subject/qbank intact + `privacy-erasure:http:prove` DELETE=503 同列入账。
5. **范围边界**：Ban 删 `kind='qbank'`/共享语料 · Ban 假造 INT `sink='vector'` 面试作用域键（无键=诚实不建 target 现状保持）· `eraseInterviewData` 503 一字不动 · GAP-PRIV-01/`:68` 面不动。
6. **诚实条款**：Ban 把本地/隔离擦除写成「数据已彻底删除」· cloudVendorDeleted=false 披露沿 AR 口径 · EXIT1 诚实失败路径（做不出→保留 · attempts 全录 · Ban retry-to-green）。
7. **docs-only 边界**：本 commit 恰 4 文件 · 零产品码/migration/script · 零 SSOT 翻行（`:60`/`:64`/checklist/matrix）· Ban coding until PRE dual BOTH PASS + coordinator AUTHORIZE。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban push · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban 借刀动 authorization/issuer 主链（0091 语义不动除非显式申报）· Ban 开公开 DELETE（DELETE=503）· Ban 把 soft 标记/fence 写成 erased/彻底删除 · Ban 借 AR `:64` 证据/状态 · Ban 洗 `:64` OPEN 钉 · Ban count-as-erased · Ban flip UC-050/051/052 covered · Ban SSOT 翻行 · Ban Qdrant / replace-pgvector cutover（PG-retained）· Ban 删 qbank/共享语料 · Ban retry-to-green · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签 · Ban claiming PRE PASS · Ban product/infra code。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-privacy-int` · implementer 不得填写）

---

*Stub · awaiting expert pre-exec dual · awaiting_pre_exec_dual · STOP*
