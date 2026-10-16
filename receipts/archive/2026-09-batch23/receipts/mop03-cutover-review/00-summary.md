# EXEC receipt — **MOP03-B · MODEL-OP #102 域 cutover 独立审材料包 · 材料包核验刀**（00-summary · `executed:awaiting_post_dual`）

**Date**: 2026-10-07（Asia/Shanghai）
**Authority**: meetwise 协调方 EXEC standing authorize（PRE dual BOTH PASS：mw-model-op PASS 60+ 锚实测 + mw-e2e-ha rev2 重审 PASS · 按 harness §3⑤）
**Exec branch / HEAD**: `line/mop03-cutover-review` · parent `6774d642` / `6774d642d25f06f1ff9808c9735aac3c28a4fc35` · exec commit = 本收据所在 commit（rg 复验结果全文同入 commit message · post 双审可独立复跑）
**Base 核验**: `git fetch origin` 首两次连接失败（github.com:443 unreachable · 网络瞬断），30s 间隔重试后 fetch OK · origin/feat/mysql-schema-skeleton = **`fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9` 未前进** → **无需 rebase** · HEAD 直接落于 origin tip 之上
**面**: 零 coding · 零 prove 执行 · 零 live · 零容器 · 零 SSOT 翻转 · 零 `:76` 行触碰 · 只读 rg/git 复验（harness §5）

## 复验逐项结果（**46/46 HIT · 0 偏离**）

### §2-A Q4/Q5 prove 同列（承卷 AN-MOP-Q45）

| # | 项 | 锚 | 结果 |
|---|-----|-----|------|
| 1-4 | 四 CMD 实存 | `package.json:198`（Q4）`:202`（Q5）`:389`（worker-wakeup PG 层）`:484`（worker-wakeup-redis） | HIT · 逐字一致 |
| 5-11 | 链 SHA 可解析 ×7 | `d2697617` REQUEST · `e2db4bc9` mw-model-op PRE · `66a77eda` mw-e2e-ha PRE/CODE_SHA · `a1f36144` PROVE · `67050c0a`+`a41c575c` POST dual · `e29d8f93` successor nail | HIT · subject 与 §2-A 表逐一相符 |
| 12 | 主收据实存 | `receipts/2026-10-06-an-mop-q45-gap-mop-03-dual-reconciler-q45-honesty-prove.md`（9163 B） | HIT |
| 13-15 | Q4 isolated JSON | `outcome=passed` · `exitCode=0` · window `2026-10-06T12:21:36.098Z–12:21:49.029Z`（=20:21:36–20:21:49 +08）· `releaseEvidence=false` | HIT · 落于预声明 attempt-1 窗 20:21:35–20:22:00+08 |
| 16-19 | Q5 isolated JSON | `outcome=passed` · `exitCode=0` · window `12:21:49.690Z–12:21:57.997Z`（=20:21:49–20:21:57 +08）· `releaseEvidence=false` | HIT · 与 Q4 窗连续无重叠 · 无 retry |

### §2-B 双 reconciler wiring + registry 面

| # | 项 | 锚 | 结果 |
|---|-----|-----|------|
| 20 | Q4 loop wired | `apps/worker/src/main.ts:677` `runModelInvocationReconciler(pool, resolveModelInvocationReconcileConfig())` | HIT |
| 21 | 同列注释 + Q5 loop | `main.ts:679-680`「Dual reconciler 同列 · ≠ MODEL-OP fake green / ≠ SLO / ≠ Redis cutover / PG LISTEN retained」+ `runUsageCalibrationReconciler(pool)` | HIT |
| 22 | ready 门 | `main.ts:694` 双 loop 均入 `workerReady()` | HIT |
| 23 | SIGTERM drain | `main.ts:712` 双 loop 均在 stop 链（grep 字面命中） | HIT |
| 24 | SKIP LOCKED | `apps/worker/src/model-invocation-reconcile.ts:68` | HIT |
| 25 | insert-only | `packages/db/src/usage-calibration.ts:74` `ON CONFLICT (owner_user_id,service,model,estimator,factor_version) DO NOTHING` | HIT |
| 26-27 | registry 面 | `packages/ai-runtime/src/model-operation-registry.ts:22` `MODEL_OPERATION_REGISTRY_VERSION='model-op-registry-v1'` · `:14-15` `wired:false` fail-closed（`:148` 实例行） | HIT |

### §2-C PG LISTEN retained

| # | 项 | 锚 | 结果 |
|---|-----|-----|------|
| 28 | 生产 wakeup 会话 | `main.ts:633` `startWorkerJobWakeupListener(createPool({ max: 1 }), …)` | HIT |
| 29 | additive 不替代注释 | `main.ts:640-641`「…never replaces the PG LISTEN session above.」 | HIT |
| 30 | retained 声明 | `packages/db/src/worker-job-wakeup.ts:7`「Production still uses LISTEN/NOTIFY until an independent cutover is approved.」 | HIT |
| 31 | 通道名 | `worker-job-wakeup.ts:15` `WORKER_JOB_WAKEUP_CHANNEL = 'meetwise_worker_wakeup_v1'` | HIT |

### §2-D Redis unset / additive default-off

| # | 项 | 锚 | 结果 |
|---|-----|-----|------|
| 32-33 | 承卷 unset/absent | Q45 收据 `:33` ROOT `.env` absent · `:34` `MEETWISE_WAKEUP_REDIS_STREAMS` unset（另 `:94`/`:112` 复述） | HIT |
| 34-35 | value-gate 代码门 | `apps/worker/src/worker-job-wakeup-redis.ts:21` env 名 · `:49-52` 仅 `'1'/'true'/'on'` 开 · default off | HIT |
| 36 | 默认 disabled listener | `main.ts:642-646` `enabled:false` disabled 起步 · URL 缺失 skip | HIT |
| 37 | flag 门测试 | `apps/worker/test/worker-job-wakeup-redis.proof.ts:27-28` flag 0 off / 1 on | HIT |
| 38 | EXIT0 ≠ cutover 面 | `package.json:484` 实存 · C-E2E-3 口径原样 | HIT |

### 四处原钉逐字一致性

| # | 项 | 锚 | 结果 |
|---|-----|-----|------|
| 39 | backlog `:76` | 「GAP stays OPEN」「#102 域 cutover 仍须独立审」「Ban MODEL-OP closed」「Ban Redis cutover」「cutover 另 REQUEST」「Q4/Q5 EXIT 0/0」「Redis unset」「PG LISTEN retained」八字段逐字命中 · 行状态仍 **OPEN** 未触 | HIT |
| 40 | checklist `:1031` | 「Nail ≠ MODEL-OP domain closed ≠ #102 cutover ≠ SLO closed ≠ Redis cutover ≠ suite green」逐字 | HIT |
| 41 | checklist `:1132` | 「立卷 ≠ 关闭 ≠ MODEL-OP domain closed ≠ Redis cutover ≠ #102 cutover ≠ suite green ≠ HA」逐字 | HIT |
| 42 | matrix `:104` | G7 Line C live chat-only SSOT nail · `post_live_dual_pass` · dual `cd44800`（Line C 口径面在位） | HIT |

### §2-F 订正锚使用确认（EXEC/nail 一律新号 · 旧号未用）

| # | 订正锚 | 实测内容 | 结果 |
|---|-----|-----|------|
| 43 | backlog `:183-191` | `:183` 节头「G7 Line C live chat-only（… post_live_dual_pass）」· `:185`「one settled chat wiring call · not a suite close · not G7 green」 | HIT |
| 44 | backlog `:101` | BUG-NOTIFY-REC 行：Redis Streams hint + **强制** periodic reconcile | HIT |
| 45 | backlog `:84` | MOP01 立卷登记（有界延迟窗 · 强制周期 reconcile 未证明 · 两本账） | HIT |
| 46 | `gap-mop-01-wakeup-notify-rec.md` §2a（`:50`） | 「漏唤醒窗口 = 有界延迟窗…GAP = 强制 periodic reconcile 未在 sole stack 证明」 | HIT |

## 结论与 Non-claims

- **46/46 HIT · 0 偏离** · 承卷证据清单 A–E 在 `fe218b7a` 全部成立；材料包可交付独立审。
- **订正锚确认**：EXEC 复验全程使用 §2-F 新号（`:183-191`/`:101`/`:84`+§2a`:50`）；rev1 行内旧号未用于任何复验结论、nail 沿用禁止已遵守。
- 本 EXEC = docs-only 材料包核验 · **不关 GAP-MOP-03 `:76`** · **不宣称 #102 cutover 成立** · **不切 Redis** · **PG LISTEN retained** · 不洗「prove EXIT 同列绿禁止宣称 MODEL-OP/SLO/cutover 已关」原钉。
- lifecycle 仅推进 `draft:awaiting_pre_exec_dual` → **`executed:awaiting_post_dual`**（harness/slice Status 行 + 历史状态保留 · 零 SSOT）；**Ban self-nail** · post 双审归协调方派（mw-model-op + mw-e2e-ha · alone ≠ dual）。

## Pins（复核 · 原值不变）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · PG LISTEN retained · GAP-MOP-03 **OPEN**

*EXEC receipt · MOP03-B 材料包核验刀 · 2026-10-07 · 46/46 HIT · 0 偏离 · base fe218b7a 未前进无需 rebase · §2-F 订正锚全用新号 · 零 SSOT · `:76` OPEN · executed:awaiting_post_dual · Ban self-nail · STOP*
