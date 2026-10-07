# REQUEST — **#103 `chore/mem00-int00-prove-path` INFLIGHT 落地刀（INT/MEM control plane honesty）** · pre dual · `mw-privacy-int`

**Status**: **PENDING** / `draft:awaiting_pre_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-privacy-int`（INT-00 隐私域邻接 · 必选席）
**Knife**: `harness/gap-i103-prove-path.md` · `gap-i103-prove-path.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `50423a6fa` / `50423a6fa6f18d4c9d193611cf84c4702e067208`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Peer stub**: `reviews/REQUEST-2026-10-07-gap-i103-prove-path-mw-e2e-ha.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

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
| public DELETE | **503**（冻结 · GAP-PRIV-02 backlog `:58`） |
| backlog `:58`/`:59`/`:60`/`:64` | **OPEN** 原样（503 冻结 · GAP-PRIV-03 · GAP-PRIV-04 · EXTERNAL-SINK-RETENTION） |
| backlog `:101` BUG-CP-CLAIM | **open**（#103 正防此类 · #103 落地不自动关行 · 关闭须另行证据+nail） |
| UC-052 | **partial**（≠ covered ≠ 控制面已关） |
| INT-TRANSCRIPT-00 / 01 | **◐ / blocked**（checklist `:173`「这**不**授权 `INT-TRANSCRIPT-01` 生产 cutover」· `:176` 两道不可拆 release gate） |
| `INT-P0-RAW-QUEUE` | **open**（legacy `/turn` plaintext payload 不可洗） |
| INT01 harness §4 `:121` | **「属 #103 INFLIGHT、合入后方可称已存在」原样**（改回「已存在」属 #103 合入后后续 nail · 本刀零触碰） |
| coveredCount 扩面 | **无**（本刀零 matrix edit · covered 不动） |

## Scope（待审 · privacy / INT-00 邻接视角）

docs-only REQUEST：#103 INFLIGHT 落地立卷（prove-path 只编排与诚实分类，不关闭控制面）。待审要点：**证明目标诚实性**（backlog `:24`/`:45`/`:101`「#103 正防越权勾 `controlPlaneClosed`」→ 回执常量 `controlPlaneClosed=false` + `releaseEvidence=false` + `publicDeleteStill503Required=true` + 静态门机器可检，Ban 宣称控制面已关/00 已关/MEM-00 已关）· **INT01 C-1 义务链边界**（本刀 = C-1 指名的 INFLIGHT 本体落地；INT01 harness §4 `:121`/`:163` 注记本刀与 exec 零触碰，改回「已存在」属合入后**后续 nail**——Ban self-close 义务链）· **草稿继承 D1**（`3c7f99cb` scripts×2+package.json 继承重放 · SSOT hunks 弃用且 exec 期亦不碰 SSOT、留 nail；#104 `fix/privacy-authorization-lease-takeover` 不在范围）· **0091/lease 面零借动**（isolated 步只**跑既有** `privacy-authorization:prove:raw` / `privacy-erasure:http:prove:raw` 入口并全录结果，不新增不修改其判据；公开 DELETE=503 语义零松动）· **EXIT 契约**（attempts 全录 · 诚实失败原样入账 · Ban retry-to-green `:68` 先例 · blocked/skipped ≠ pass · EXIT0 ≠ 控制面关 ≠ DELETE 开放 ≠ `releaseEvidence=true`）· **历史回执纪律**（`memory:prove` 2026-08-10 旧回执 ≠ 当前树证明 · exec 期须重证 · Ban 抄草稿旧结论）· 零 live（无网络/云/vendor/spend · Ban secrets/`.env*` · Ban `pnpm db:up`）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · Ban `pnpm db:up` · Ban 绕隔离壳直连 · **Ban 翻 SSOT 行**（covered flip · coveredCount 变动 · `:24`/`:45` INFLIGHT→landed 自行迁移 · exec 只碰 `scripts/*`+`package.json` · SSOT 留 nail 阶段）· **Ban 借刀动 INT01 立卷合同**（`:121`/`:163` 零触碰）· **Ban 借刀动 PRIV4/AR 产物**（`:60`/`:64` · `stub≠cloud` 口径）· Ban 碰 #104 lease-takeover 面 · **禁碰已占用行**（backlog `:58`/`:59`/`:60`/`:64`/`:68`/`:100`/`:101`/`:102`/`:123` · checklist `:154`/`:167`-`:176` · UC-052 partial · `INT-P0-RAW-QUEUE` open · 七类 TC planned/unmapped）· **Ban 宣称控制面已关** · Ban 公开 DELETE 开放（503 冻结）· Ban 0129 preview 回执写成完成 · Ban rehearsal purge 称删除闭环 · Ban blocked/skipped 写成 pass · Ban 历史回执当当前通过 · Ban retry-to-green · Ban 单 attempt 窗外重跑 · Ban 碰 sibling AN 文件 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push** · Ban self-approve（alone ≠ dual）

本 stub 未跑 prove、未起容器、未连远程环境、未改产品码 / migrations / scripts、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE dual BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre dual · STOP*
