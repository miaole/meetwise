# REQUEST — **INT-TRANSCRIPT-01 生产 cutover 立卷合同（MOP03 六门先例）** · pre-exec · `mw-privacy-int`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-privacy-int`
**Knife**: `harness/gap-int-transcript-01-cutover-contract.md` · `gap-int-transcript-01-cutover-contract.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `313e04a7` / `313e04a7fc0ca91ef60fb229802dd374f85cc93d`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Peer stub**: `reviews/REQUEST-2026-10-07-gap-int-transcript-01-cutover-contract-mw-e2e-ha.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

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
| public DELETE | **503**（冻结 · GAP-PRIV-02 `:58`） |
| backlog `:60` GAP-PRIV-04 | **OPEN**（本地行级证据 ≠ close · Qdrant 未登记为可证明擦除 sink） |
| backlog `:64` GAP-PRIV-EXTERNAL-SINK-RETENTION | **OPEN**（stub≠cloud · `cloudVendorDeleted=false` · NB-3） |
| UC-052 | **partial**（≠ covered ≠ INT-TRANSCRIPT-01） |
| INT-TRANSCRIPT-01 | **blocked**（checklist `:173`「这**不**授权 `INT-TRANSCRIPT-01` 生产 cutover」· `:169`「00 不授权 01 生产写入」） |
| `INT-P0-RAW-QUEUE` | **open**（legacy `/turn` plaintext payload 不可洗） |
| 七类 TC | **planned/unmapped** |
| PG LISTEN / Redis | unchanged（**无关本刀** · MOP03 面保留口径） |
| coveredCount 扩面 | **无**（本刀零 matrix edit · covered 不动） |

## Scope（待审 · privacy 视角）

docs-only REQUEST：把 INT-TRANSCRIPT-01 生产 cutover 的授权口径立卷为六门准入合同（harness §2b）。待审要点：**立卷≠授权**（checklist `:173`/`:169` 硬钉 · Ban 预授权六门任一 · Ban cutover-ready claim）· 六门判据可执行性（① 0091 生产级 issuer key 管理与轮换 + JWS 验签落地 ② 外部 sink 逐个 real-delete 证据 = `:64` 关闭前提 · Ban stub/`external_confirmed`（NB-3）顶替（D2）③ INT 向量 sink 作用域键 + Qdrant 登记 + `0091` receipt 对齐 ④ 公开 DELETE 503→真删除开关合同（issuer/lease + 逐 sink receipt + 删后 read=0）+ 独立审 ⑤ 公平重放/幂等（同 key 同体回放 / 异体冲突 / 双 tab 一 winner · 真实组合根）⑥ BUG-REV-COND 四专家审不降级、名单留 AUTHORIZE（D3））· §2b-0 两道 checklist `:176` 不可拆 release gate + dual-write 切换图切断明文前提 · §2c 现状诚实清单逐条 checklist 原文（0129 preview 盘点面回执固定未完成 · `releaseEvidence=false` · `INT-P0-RAW-QUEUE` · 七类 TC planned/unmapped · UC-052 partial · 0091 无验签/worker 走 0077/HTTP 未接线）· EXIT 契约（attempts 全录 · Ban retry-to-green `:68` 先例 · 远程 Postgres · Ban `pnpm db:up`）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · Ban `pnpm db:up` · **Ban 预授权六门任一** · **Ban 宣称 cutover ready** · Ban 把立卷写成授权 · Ban INT-TRANSCRIPT-01 flip/blocked 摘除 · Ban 公开 DELETE 开放（503 冻结）· Ban 0129 preview 回执写成完成 · Ban rehearsal purge 称删除闭环 · Ban `:58`/`:60`/`:64` flip · Ban UC-052 covered flip · Ban coveredCount 变动 · Ban SSOT edit · Ban `INT-P0-RAW-QUEUE` 洗白 · Ban 七类 TC 映射/翻行 · Ban vendor 证据以 stub/`external_confirmed`/docs 自述顶替（D2）· Ban 四专家审降级/代指派（D3）· Ban PG LISTEN/Redis 改动 · Ban 碰 sibling AN 文件 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push · Ban self-approve（alone ≠ dual）

本 stub 未跑 prove、未起容器、未连远程环境、未改产品码 / migrations / scripts、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*
