# REQUEST — **GAP-MOP-01 `:74` wakeup work face + BUG-NOTIFY-REC `:95`** · pre-exec · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_re_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-mop-01-wakeup-notify-rec.md` · `gap-mop-01-wakeup-notify-rec.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `4804c3dc` / `4804c3dc54e696b5f7af17574d21e1bbe68482a4`
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
| public DELETE | **503** |
| PG LISTEN | **retained** |
| actualSpendCny | **null**（两本账分离沿 I 线 · 费率非承诺） |
| GAP-MOP-01 `:74` | **OPEN** · Ban flip CLOSED |
| BUG-NOTIFY-REC `:95`（本基线行号 · MOP03-era `:93`） | **OPEN** · Ban flip CLOSED |

## Scope（待审）

docs-only REQUEST：按 backlog `:74` 原文把 GAP-MOP-01 wakeup 工作面立卷——(a) §2a wakeup 生产诚实清单（LISTEN/NOTIFY `meetwise_worker_wakeup_v1` lossy hint · additive Redis 旁路 value-gated flag 关 · 既有周期兜底扫描实存（drain-loop 周期 tick + 五 consumer loop `WORKER_JOB_RECONCILE_INTERVAL_MS` 默认 5s 认领 + dual reconciler 30s/60s → 漏唤醒 = 有界延迟窗 · `main.ts:452` 仅字面事实引用）· **强制 periodic reconcile 未在 sole stack 证明** = BUG-NOTIFY-REC `:95` 保持 OPEN 依据（未证明 ≠ 不存在））；(b) §2b M3 切流包 wakeup 侧内容定义（flag 审后开程序 · 保留 reconcile · wakeup prove 不命名不授权 · 本绿≠已迁随包输出）；(c) §2c 旧 `worker-wakeup:prove` 标红/换夹具处置计划。**与 MOP03 立卷边界**：nail `e29d8f93` 六门准入合同**只读引用不再立法**（Ban 重复立卷）——MOP03 立准入门，MOP01 立工作面；未来 wakeup 切流 REQUEST 须同时过六门与切流包内容。本刀零执行；prove 计划 named-not-run（`worker-wakeup:prove` / `worker-wakeup-redis:prove` named for clarity · 未来 cutover Redis wakeup prove 不命名不授权）· EXIT 契约预声明（attempts 全记录 · 诚实失败 · Ban retry-to-green · EXIT0≠已迁≠cutover）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · **Ban Redis cutover**（wakeup/queue/claim 切流 · flag 开启 · Redis prove 授权 · MOP03 六门不因本刀松动）· **Ban MODEL-OP closed claim** · Ban SLO forge / fake green · Ban 删 PG LISTEN · Ban `:74`/`:95` flip CLOSED · **Ban 重复立卷**（六门要素 2–5 只读引用）· Ban GAP-MOP-02 `:75` 认领 · Ban self-approve（alone ≠ dual）· Ban 四专家审降级 · Ban SSOT edit · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push

## 裁决点（expert 裁量）

- **D1（生死点）· 与 MOP03 立卷重叠裁决**：本刀「互补不重复」读法是否成立（MOP03 准入合同 vs MOP01 `:74` 工作面）；若判实质重叠 → 本刀显式改写收窄为「仅诚实登记」（逃生门 harness §1-D1/§3 · Ban 重复立卷 · Ban 静默换范围）。
- D2：切流包内容口径（`:74`「M3 切流包（非本选型切片）：flag 默认关→审后开；保留 reconcile」= 未来授权 REQUEST 的 wakeup 侧交付清单定义 · 非本刀执行 · flag 开启动作 Ban）是否如 REQUEST 所述。
- D3：Redis 语义边界（本刀只立卷不切流 · 选型/原型/INFLIGHT:redis-wakeup-wip 只读 cite · Redis wake deferred ≠ STOPPED 沿 W5）。

本 stub 未跑 prove、未改产品码、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*
