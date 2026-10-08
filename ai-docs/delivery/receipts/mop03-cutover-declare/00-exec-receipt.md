# EXEC receipt — **MOP03-C · MODEL-OP #102 域 cutover 宣告刀 · G1 fresh Q4/Q5 同列 prove + G3 value-gate 审前 unset 核验**（EXEC 面 · 窗内单轮）

**Date**: 2026-10-08 · Asia/Shanghai (+08:00)
**Knife**: `ai-docs/delivery/harness/mop03-cutover-declare.md`（REQUEST `16e2a821` + rev2 `6a37459e` · 七门合同 G1–G7）
**Authorization**: meetwise 协调方 EXEC 授权 · 生效日 **2026-10-08** · attempt 窗 **2026-10-08 20:00–23:59 +08 单轮**（预声明 · harness §2 G1）· 前置预执行双审 BOTH PASS 已承卷（REQUEST 卷声明 + 协调方授权裁决）。
**Worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-mop03decl` · `line/mop03-cutover-declare`
**CODE_SHA（prove window）**: **`6a37459e5468343d2534d6fdf8ee7eebaa952ea7`**（short `6a37459e`）· **两 CMD 同一 SHA** · 窗前/窗内/跑后三次核验 HEAD 不变 · porcelain=0（tree clean 全程）。
**Face scope（协调方指令）**: 窗内跑 Q4+Q5 各单次 attempt + G3 unset 核验 + 收据落账 + commit + push · **不含** G2 wakeup prove（未跑 · 归后续面）· **零** harness/slice/reviews/SSOT 状态行改动 · **Ban nail / Ban 自 nail** · EXIT0 ≠ cutover 成立。

## Pins（照抄 · 原值写死 · 本 EXEC 面零翻转）

haStatus=NOT_HA · releaseEvidence=**false** · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=**null** · PG LISTEN retained · Ban Redis cutover · Ban MODEL-OP fake closed · backlog `:76` **OPEN** · alone ≠ dual

## G3 · value-gate 审前 unset 核验（EXEC 面 · 落 prove 前后）

| Field | 核验值 | 时刻 (+08) | 方法 |
|-------|--------|-----------|------|
| `MEETWISE_WAKEUP_REDIS_STREAMS` | **unset** | 17:44:36 / 20:01:23（跑前）/ 20:03:45（跑后） | `printenv` → rc=1（三次一致 · presence-only · 值未读改） |
| 根目录 `.env` | **absent** | 17:46 / 20:01:23 / 20:03:45 | 存在性 `ls`（absent · 未读内容 · Ban `.env*` 读改遵守） |
| `MODEL_API_KEY` / `MODEL_BASE_URL` | **unset / unset** | 20:01:23 | `printenv` → rc=1 · 两 CMD 入面 `env -u MODEL_API_KEY -u MODEL_BASE_URL -u MEETWISE_WAKEUP_REDIS_STREAMS` |
| value-gate 语义锚 | `worker-job-wakeup-redis.ts:21`（env 名）+ `:52`（`'1'/'true'/'on'` trim+lowercase · default off） | 20:03:15 rg 复验 | 逐字保持 · 零改动 · Ban 改门遵守 |

## G1 · attempts 全账（预声明窗内 · 每 CMD 单次 attempt · 失败成功同列 · 原样零改）

| # | CMD | EXIT | CODE_SHA | 起 (+08) | 止 (+08) | 判定与备注 |
|---|-----|------|----------|----------|----------|-----------|
| 0 | `pnpm model-op00:usage-reconciler:prove`（协调方指令直译串） | **254** | `6a37459e`（未执行任何代码） | 20:01:55 | 20:01:56 | **披露行 · 误触发**：pnpm `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command not found`（log 原样 `02-q5-misfire-exit254.log.txt`）。该串非本仓脚本 · **零执行**（未起容器 · 未跑测试 · 非 prove 红果）。预宣告 Q5 CMD = `package.json:202` 的 **`model-op00-usage-reconciler:prove`**（连字符版 · harness §2 G1 原文）。本行**不计入** Q5 预宣告单次 attempt（Ban retry-to-green 针对「执行后红果重跑洗绿」· 本行无执行可洗）；是否改判归四专家审/协调方裁决，本账原样保留。 |
| **Q4-1** | `pnpm model-invocation-reconcile:prove`（Q4 · `package.json:198`） | **0** | `6a37459e` | 20:01:38 | 20:01:50 | 预宣告 CMD 单次 attempt · 12s · isolated receipt `04-q4-isolated.json`（outcome=passed · exitCode=0 · release_evidence=false） |
| **Q5-1** | `pnpm model-op00-usage-reconciler:prove`（Q5 · `package.json:202` 预宣告 CMD） | **0** | `6a37459e` | 20:02:38 | 20:02:43 | 预宣告 CMD 单次 attempt · 5s · isolated receipt `05-q5-isolated.json`（outcome=passed · exitCode=0 · release_evidence=false） |

**同列判定（G1）**: Q4/Q5 双 EXIT **0/0** · **同一 CODE_SHA `6a37459e`** · 起止全落窗内（20:01–20:02 +08 ⊂ 20:00–23:59）· attempts 全账如上原值（`.exit`/log 零改）· 无 retry-to-green（Q4/Q5 预宣告 CMD 各恰一次）。

## Runner 与隔离层（诚实标注）

- `node scripts/run-e2e-isolated.mjs <target>`（package.json 198/:202 wrapper）· 一次性 `meetwise-e2e-*` docker 容器 · 镜像 `pgvector/pgvector:pg16`（**legacy fixture · R5-MARKED-RED · ≠ sole-stack truth · ≠ cutover 证据 · local green ≠ HA**）· 跑后容器已自清（`docker ps` 无残留）。
- 两 prove 均离线门：零 live · 零 Key 消耗 · 零网络付费 · 零 console spend（G6 · actualSpendCny=null）。

## rg 复验（EXEC 面 · 20:03:15–20:03:45 +08 · 只读 · 四专家审可独立复跑）

- Q4 CMD `package.json:198` = `node scripts/run-e2e-isolated.mjs model-invocation-reconcile:prove:raw` ✓
- Q5 CMD `package.json:202` = `node scripts/run-e2e-isolated.mjs model-op00-usage-reconciler:prove:raw` ✓
- 双 reconciler wired：`apps/worker/src/main.ts:677`（runModelInvocationReconciler）· `main.ts:680`（runUsageCalibrationReconciler）✓
- Q4 `FOR UPDATE SKIP LOCKED` @ `apps/worker/src/model-invocation-reconcile.ts:68` ✓
- Q5 insert-only `ON CONFLICT (owner_user_id,service,model,estimator,factor_version) DO NOTHING` @ `packages/db/src/usage-calibration.ts:74` ✓
- PG LISTEN retained：`packages/db/src/worker-job-wakeup.ts:15`（`meetwise_worker_wakeup_v1`）· `:7`「Production still uses LISTEN/NOTIFY until an independent cutover is approved」✓（零摘除零绕过）
- value-gate：`apps/worker/src/worker-job-wakeup-redis.ts:21` + `:52` ✓
- SSOT 原钉只读在位：backlog `gap-bug-backlog.md:76` GAP-MOP-03 行原样（**OPEN** · porcelain=0 = 零 diff）

## 镜像 SHA 披露（沿 MOP01/MOP03-B 先例 · EXEC 落账披露）

**B 链（MOP03-B 材料包刀）origin 镜像 nail `6006d2e8`**（origin parent `cde75f3c` · 已在本刀 base `9265e4d8` 祖先 · 本地 nail `b2948f20`）。

## 环境与执行披露（全窗诚实账）

- 窗前就绪（17:44–17:49 +08 · 窗外零 prove 执行）：`pnpm install --frozen-lockfile`（5.1s · exit 0 · porcelain 仍 0）· 镜像本地已在（无拉取）· 锚点只读预检。
- 等窗：nohup sleep 至 20:00:40+08（两段挂载各被 ~1h 看门狗 SIGKILL 后重算续挂 · 末段 400s epoch 心算误差致 19:54 早醒一次 · **早醒点仍在窗外 · 零执行** · 修正后 20:00:41 醒）。
- 窗口 Ban 遵守：20:00:00 前零 prove 执行 · 窗内（20:01:38–20:02:43）全部 attempt 完成。

## Files（本 EXEC 面落账）

| Path | Role |
|------|------|
| `receipts/mop03-cutover-declare/00-exec-receipt.md` | 本收据 |
| `receipts/mop03-cutover-declare/01-q4-run.log.txt` | Q4 attempt 1 全量 log（原样） |
| `receipts/mop03-cutover-declare/02-q5-misfire-exit254.log.txt` | #0 误触发行 log（原样 · EXIT=254） |
| `receipts/mop03-cutover-declare/03-q5-preregistered-run.log.txt` | Q5 attempt 1 全量 log（原样） |
| `receipts/mop03-cutover-declare/04-q4-isolated.json` | Q4 isolated receipt 归档（wrapper 产物副本） |
| `receipts/mop03-cutover-declare/05-q5-isolated.json` | Q5 isolated receipt 归档（wrapper 产物副本） |

**Untouched**: 产品码 / infra · harness / slice / reviews stubs（状态行未进阶——协调方指令面=收据落账）· backlog / matrix / checklist / queue（SSOT 零 diff · `:76` OPEN 零触碰）· `MEETWISE_WAKEUP_REDIS_STREAMS` flag（**未开启**——开启只在 meetwise AUTHORIZE 后）· PG LISTEN（retained）· `.env*`（absent · 未读改）· sibling 刀文件。

## Non-claims

EXIT 0/0 同列 **≠** MODEL-OP closed **≠** SLO **≠** cutover 成立 **≠** Redis cutover **≠** HA **≠** suite green **≠** coveredCount 扩面 · GAP-MOP-03 **OPEN** · 本收据 = EXEC 面 G1（+G3 核验）证据落账 · **四专家审未开**（按合同 EXEC 后召集）· meetwise AUTHORIZE 未发生 · nail 未发生（`:76` 翻转仅在全链后的单独 nail 面）· alone ≠ dual · #0 误触发行留审裁决 · Ban retry-to-green（未重试任何预宣告 CMD）· Ban 洗前钉。

*EXEC receipt · MOP03-C cutover declare · 2026-10-08 · Q4/Q5 EXIT 0/0 @CODE_SHA `6a37459e` · G3 unset 核验三时点一致 · PG LISTEN retained · GAP-MOP-03 OPEN · STOP（awaiting 四专家审召集 · Ban nail · Ban 自 nail）*
