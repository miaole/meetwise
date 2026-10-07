# REQUEST — **INT-TRANSCRIPT-01 生产 cutover 立卷合同（MOP03 六门先例）** · pre-exec · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-int-transcript-01-cutover-contract.md` · `gap-int-transcript-01-cutover-contract.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `313e04a7` / `313e04a7fc0ca91ef60fb229802dd374f85cc93d`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Peer stub**: `reviews/REQUEST-2026-10-07-gap-int-transcript-01-cutover-contract-mw-privacy-int.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

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

## Scope（待审 · e2e/HA 视角）

docs-only REQUEST：INT-TRANSCRIPT-01 生产 cutover 准入合同立卷（harness §2b 六门 + §2b-0 结构前提）。待审要点：**立卷≠授权**（MOP03 六门先例同构 · Ban 借立卷宣称 cutover ready / Ban 预授权任何一门）· 门 5 公平重放/幂等三项判据在**真实 HTTP/SSE/RLS 组合根**的可证明性（同 key 同体回放幂等 / 同 key 异体冲突显式拒绝 / 同题双 tab 恰一 winner · `:176` 原文）· 0128 dispatch fairness 预览级证据 **≠** 生产组合根证据（checklist `:175`「公开预览下 OCR 组合根仍关」）· 七类 TC planned/unmapped 与 `TC-public-preview-01-main/E1…E6` 不因立卷翻行（`:154`/`:173`）· EXIT 契约（attempts 全录 · 诚实失败 · Ban retry-to-green · 单次 attempt 窗口 · EXIT0 ≠ cutover ≠ suite green · Line C 口径）· HA 语义（NOT_HA / claimProductionHA=false 不动 · DELETE=503 冻结）· PG LISTEN/Redis 无关本刀零改（MOP03 successor 面 PG LISTEN retained 口径不位移）· `INT-P0-RAW-QUEUE` 保留 open（0126 围栏 + dual-write 切换图为 §2b-0c 前提）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · Ban `pnpm db:up` · **Ban 预授权六门任一** · **Ban 宣称 cutover ready** · Ban 把立卷写成授权 · Ban INT-TRANSCRIPT-01 flip/blocked 摘除 · Ban 公开 DELETE 开放（503 冻结）· Ban 0129 preview 回执写成完成 · Ban rehearsal purge 称删除闭环 · Ban `:58`/`:60`/`:64` flip · Ban UC-052 covered flip · Ban coveredCount 变动 · Ban SSOT edit · Ban `INT-P0-RAW-QUEUE` 洗白 · Ban 七类 TC 映射/翻行 · Ban 预览级证据顶替生产组合根证据 · Ban 四专家审降级/代指派（D3）· Ban PG LISTEN/Redis 改动 · Ban 碰 sibling AN 文件 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push · Ban self-approve（alone ≠ dual）

本 stub 未跑 prove、未起容器、未连远程环境、未改产品码 / migrations / scripts、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*
