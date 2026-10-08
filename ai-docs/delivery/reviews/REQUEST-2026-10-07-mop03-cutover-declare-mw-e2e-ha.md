# REQUEST — **MOP03-C · MODEL-OP #102 域 cutover 宣告刀** · pre-exec · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/mop03-cutover-declare.md` · `mop03-cutover-declare.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `9265e4d8` / `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）

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
| 公开 DELETE | **503** |
| g7SuiteGreen | **false** |
| actualSpendCny | **null**（两本账分离沿 I 线 · 费率非承诺 · 仅 console-cited actual 可写） |
| PG LISTEN | **retained**（退役另步 + 回滚预案） |
| GAP-MOP-03 | **OPEN** · backlog `:76` · Ban flip CLOSED 本 REQUEST 面 |

## Scope（待审）

docs-only REQUEST（七门合同 G1–G7 全部行使方案书）：**G1** EXEC 面新跑 Q4 `model-invocation-reconcile:prove` + Q5 `model-op00-usage-reconciler:prove` 同列 EXIT 0/0 · 同一 CODE_SHA · 预声明 attempt 窗（Asia/Shanghai · EXEC 授权当日 20:00–23:59 +08 · 每 CMD 单次 attempt）· attempts 全账 · Ban retry-to-green · 承卷 `66a77ed` EXIT0 仅背景不可替代；**G2** wakeup prove **PG-unit 层诚实标注**（≠ Redis 侧证据 · `worker-wakeup-redis:prove` EXIT0 ≠ cutover 证据）+ 强制周期 reconcile 证据面 + 「未在 sole stack 证明」诚实清单携带（backlog `:101`/`:84` · MOP01 §2a `:50`）；**G3** value-gate 审前 unset + 开启只在 AUTHORIZE 后（`worker-job-wakeup-redis.ts:21/:49-52` `'1'/'true'/'on'` 逐字 · default off）；**G4** PG LISTEN retained 至最后（`worker-job-wakeup.ts:7/:15` · `main.ts:633/:640-641`）· 退役另步 + **回滚预案**（PG fallback 回切 · 无预案不受理）；**G5** ≥ dual + 四专家审四席（EXEC 后召集 · ADR 隐私 prove 清单全绿核对 cite-only）· 换审冻结；**G6** 两本账；**G7** 诚实 Non-claims（Line C 口径 backlog `:183-191`）。本面零 prove 执行。

## Ban（待审确认）

Ban coding · Ban prove 执行（授权前禁跑 fresh Q4/Q5）· Ban live · **Ban Redis cutover**（PG LISTEN/NOTIFY 保留 · Redis 只评估不切 · 不启 flag · 不写 Redis prove 授权 · PG LISTEN 退役另步）· **Ban MODEL-OP fake closed**（本 REQUEST 不关 `:76` 行）· **Ban 洗「prove EXIT 同列绿 禁止宣称 MODEL-OP/SLO/cutover 已关」原钉**（backlog `:76` 原文 · checklist `:1031`/`:1132`）· **Ban 改共享 SSOT**（`:76` 行翻转 = 本刀全链 + 四专家审 BOTH + 单独 nail + 协调方 AUTHORIZE 后的 nail 面动作 · 缺一不可）· Ban secrets / `.env*` 读改 · Ban Meridian · Ban buy cloud · Ban force-push · Ban 独立审降级 · Ban self-approve（alone ≠ dual）· Ban 互相代签 · Ban 静默换审

## 裁决点（expert 裁量 · e2e/HA 口径优先）

- D1：G2/G4 层面标注是否诚实——`worker-wakeup:prove` PG-unit 层 only、`worker-wakeup-redis:prove` EXIT0 ≠ cutover 证据、PG LISTEN retained 至最后 + 退役另步 + 回滚预案是否钉死；PG/Redis 两层 Ban 顶替是否成立。
- D2：G3 value-gate 语义（trim+lowercase `'1'/'true'/'on'` · default off · 审前 unset 核验入 receipt · 开启只在 AUTHORIZE 后）是否与代码门逐字一致；锚 @`9265e4d8`（`package.json:198/:202/:391/:486` · `main.ts:633/:640-641/:677/:679-680/:694/:712` · `worker-job-wakeup.ts:7/:15` · `worker-job-wakeup-redis.ts:21/:49-52`）是否可解析。
- D3：G5 审规格（≥ dual + 四席 · 换审冻结 · 不互相代签）+ G7 Non-claims（EXIT0 ≠ suite ≠ HA ≠ coveredCount · Line C 口径）+ attempts 全账 / Ban retry-to-green（`:68` 先例）是否忠实不降级；`:76` 翻转仅限 nail 面是否钉死。

本 stub 未跑 prove、未改产品码、未读 `.env*`；承卷 AN-MOP-Q45 链 + MOP03 立卷 + MOP03-B 材料包链只读 cite 不重跑。EXEC 须 PRE BOTH PASS + meetwise AUTHORIZE；四专家审面 EXEC 后按合同召集。

*Stub · awaiting expert pre-exec dual · STOP*
