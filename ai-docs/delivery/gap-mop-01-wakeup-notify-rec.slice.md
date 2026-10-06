# Slice — **MOP01 · GAP-MOP-01 `:74` wakeup work face + BUG-NOTIFY-REC `:95`**（docs-only 立卷 · **`draft:awaiting_re_pre_exec_dual`**）

**Status**: **`draft:awaiting_re_pre_exec_dual`**（empty review stubs · Ban self-approve · alone ≠ dual · 零 coding · 零 prove 执行 · 零 live · 零 SSOT · `MEETWISE_WAKEUP_REDIS_STREAMS` **value-gated**（`'1'/'true'/'on'` 开 · `'0'`/空/unset 关 · 本刀 unset）沿代码门重述（`apps/worker/src/worker-job-wakeup-redis.ts:50-53`）· 现存 `worker-wakeup-redis:prove` EXIT0 **≠** cutover 证据 · **PG LISTEN retained** · **Ban Redis cutover** · **Ban MODEL-OP closed** · `:74`/`:95` OPEN · **Ban 重复立卷**（MOP03 六门只读引用不松动））
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · public DELETE=503 · **PG LISTEN retained** · `actualSpendCny=null`
**Date**: 2026-10-07（Asia/Shanghai）
**Base**: `origin/feat/mysql-schema-skeleton` · **`4804c3dc`** / `4804c3dc54e696b5f7af17574d21e1bbe68482a4`
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove execution · Ban live · **Ban Redis cutover** · **Ban MODEL-OP closed claim** · **PG LISTEN retained**

## One-line

backlog `:74` **GAP-MOP-01**（wakeup 生产仍 LISTEN/NOTIFY `meetwise_worker_wakeup_v1` — Q1 · Redis Streams 仅 flag 关旁路原型 · 拟切片「M3 切流包：flag 默认关→审后开；保留 reconcile」）+ `:95` **BUG-NOTIFY-REC**（lossy NOTIFY · reconcile 未在 sole stack 证明 → 漏唤醒窗口）本刀 docs-only **立卷 wakeup 工作面**：§2a 诚实清单（代码锚实测：既有周期兜底扫描实存——drain-loop 周期 tick + 五 consumer loop `WORKER_JOB_RECONCILE_INTERVAL_MS` 默认 5s 认领 + dual reconciler 30s/60s → 漏唤醒 = 有界延迟窗 · **强制 periodic reconcile 未在 sole stack 证明** GAP 仍 OPEN · `main.ts:452` 仅字面事实引用）+ §2b M3 切流包内容定义（flag 审后开 · 保留 reconcile · wakeup prove 不命名不授权 · 旧 prove 标红/换夹具处置）· **不切流** · **不重复立法 MOP03 六门**（`e29d8f93` 准入合同只读引用 · 未来切流 REQUEST 须同时过六门与本刀切流包内容）· `:74`/`:95` stays **OPEN**。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-mop-01-wakeup-notify-rec.md` |
| Dual `mw-model-op` | `reviews/REQUEST-2026-10-07-gap-mop-01-wakeup-notify-rec-mw-model-op.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-mop-01-wakeup-notify-rec-mw-e2e-ha.md` |

## 与 MOP03 立卷的边界（一句话 + 逃生门）

MOP03 nail `e29d8f93` 立「未来 cutover REQUEST **准入合同**六门」（wakeup prove / 强制周期 reconcile / flag 默认关 / PG LISTEN retained 四要素已立法）；MOP01 立「`:74` 原文 **wakeup 工作面**」（诚实清单 + 切流包内容 + 旧 prove 处置）——互补不重复，本刀对四要素**只读引用不再立法**（Ban 重复立卷）；若双审 D1 判实质重叠，本刀显式改写收窄为「仅诚实登记」（逃生门写死于 harness §1-D1/§3）。

## Named proves（clarity only · 本 REQUEST 零执行 · I2 先例：named ≠ 授权）

`pnpm worker-wakeup:prove`（旧 PG 层 · `package.json:379` · §2c 处置对象 named only）· `pnpm worker-wakeup-redis:prove`（原型层 · `package.json:474` · EXIT0 ≠ cutover 证据）· 未来 cutover Redis wakeup prove **不命名不授权** · Q4/Q5 属 MOP03 域本刀零认领。本刀不新增脚本、不改 `package.json`。

## EXIT 契约（预声明 · 未来 prove 适用 · 本 REQUEST 零执行）

attempts 全记录（逐条 EXIT · Asia/Shanghai 时间窗 · code SHA）· 诚实失败路径（EXIT≠0 原样入账 → 判 fail）· **Ban retry-to-green**（`:68` 先例）· EXIT0 ≠ 已迁 ≠ cutover ≠ MODEL-OP closed ≠ SLO ≠ HA ≠ suite ≠ covered（`:74`「本绿 ≠ 已迁」原文）。

## Bans

- **Ban coding** / prove execution / live（Key · 网络 · 付费 · console spend）
- **Ban Redis cutover**（wakeup / queue / claim 切流 · flag 开启 · Redis prove 授权）——MOP03 六门不因本刀松动
- **Ban MODEL-OP closed claim** / SLO forge / fake green / `:74`/`:95` flip CLOSED
- **Ban 删 PG LISTEN** without separately authorized cutover REQUEST
- **Ban 重复立卷**（MOP03 六门要素 2–5 只读引用）· Ban GAP-MOP-02 `:75` 认领（另刀）
- Ban self-approve（alone ≠ dual）· Ban 四专家审降级（BUG-REV-COND 对切流持续绑定）
- Ban SSOT edit（backlog / matrix / checklist / queue 零改）· Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push**

*Slice · MOP01 GAP-MOP-01 :74 wakeup work face + BUG-NOTIFY-REC :95 · `draft:awaiting_re_pre_exec_dual` · 零 coding · 零 prove 执行 · Ban Redis cutover · Ban MODEL-OP closed · Ban 重复立卷 · PG LISTEN retained · `:74`/`:95` OPEN · alone ≠ dual · STOP（awaiting PRE dual）*
