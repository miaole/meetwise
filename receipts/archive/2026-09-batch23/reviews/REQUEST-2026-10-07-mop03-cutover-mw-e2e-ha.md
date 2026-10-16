# REQUEST — **MOP03-B · MODEL-OP #102 域 cutover 独立审材料包** · pre-exec · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/mop03-cutover-independent-review.md` · `mop03-cutover-independent-review.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `fe218b7a` / `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9`
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
| actualSpendCny | **null**（两本账分离沿 I 线 · 费率非承诺） |
| PG LISTEN | **retained** |
| GAP-MOP-03 | **OPEN** · backlog `:76` · Ban flip CLOSED 本刀 |

## Scope（待审）

docs-only REQUEST：为「MODEL-OP #102 域 cutover」组装独立审材料包——①承卷证据清单（AN-MOP-Q45 Q4/Q5 同列 EXIT 0/0 @`66a77ed` · wiring 锚 `main.ts:677/:680/:694/:712` · PG LISTEN retained 锚 · Redis unset + value-gate default-off 锚 · model-operation-registry 面）；②独立审判据七门（fresh Q4/Q5 同列 · wakeup prove + 强制周期 reconcile · flag 默认关→审后开 · PG LISTEN retained 至最后 · 独立审 ≥ dual + BUG-REV-COND 四专家审不降级 · 两本账沿 I 线 · 诚实非 claims）；③审后残留义务（行翻转另 nail · PG LISTEN 退役另步 · GAP-MOP-01/02 不搭车 · 矩阵/账本纪律 · Redis 只评估不切）。执行面 = 材料包核验 + 引用面 rg 实证（只读）。

## Ban（待审确认）

Ban coding · Ban prove 执行 · Ban live · **Ban Redis cutover**（PG LISTEN/NOTIFY 保留 · Redis 只评估不切 · 不启 flag · 不写 Redis prove 授权）· **Ban MODEL-OP fake closed**（本刀不关 `:76` 行 · 行翻转 = 独立审 BOTH PASS 后另 nail）· **Ban 洗掉「prove EXIT 同列绿 禁止宣称 MODEL-OP/SLO/cutover 已关」原钉** · **Ban 改共享 SSOT** · Ban #102 借本刀合入 · Ban 独立审降级 · Ban self-approve（alone ≠ dual）· Ban 互相代签 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push

## 裁决点（expert 裁量）

- D1：承卷证据清单 A–E 锚是否完备且可解析（file:line / SHA / EXIT），C-E2E-2（flag value-gated 按代码门重述）/ C-E2E-3（`worker-wakeup-redis:prove` EXIT0 ≠ cutover 证据）/ C-E2E-5（PG LISTEN retained）是否原样携带。
- D2：独立审判据七门是否忠于六门合同（`harness/gap-mop-03-successor.md` §2b）不加不减、不降级；EXIT 契约（attempts 全记录 · Ban retry-to-green · not_run 不计 pass）是否预声明完整。
- D3：审后残留义务是否诚实覆盖（行翻转另 nail · PG LISTEN 退役另步 + 回滚预案 · Line C 口径 wiring 级绿 ≠ suite ≠ 域 close 持续约束）。

本 stub 未跑 prove、未起容器、未改产品码、未读 `.env*`；承卷 AN-MOP-Q45 链（`d269761`/`e2db4bc`/`66a77ed`/`a1f3614`/`67050c0`/`a41c575`/`e29d8f93`）只读 cite 不重跑。执行须 PRE BOTH PASS + meetwise AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*
