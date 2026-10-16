# POST-PROVE — GAP-UC018-WAITING-USER · mw-e2e-ha

**Expert**: `mw-e2e-ha`（不代签 `mw-rag-route` · alone ≠ dual）
**Knife**: GAP-UC018-WAITING-USER
**Code/prove**: `6fde8959ec70d23a595ffcea02d62ab10a3a5762`（`6fde895`）
**Receipt commit**: `559f972f87fe89af33424d5e5bc5428edbb7144e`（`559f972`）
**Pre-exec**: `d908ee438246e75c7fd33839d70e306f19dc2fe7` @ REQUEST `23f56415dc041b2563c96b1b1dee22aa7b4fa424`
**Review tip when written**: `origin/feat/mysql-schema-skeleton`（本文件提交前的 tip；两 SHA 均为其祖先）
**Date**: 2026-10-02（fresh run ~21:22 PT）
**Label**: NEW evidence（新目录、当时 HEAD、非 historical backfill）

559f972 里给 `mw-e2e-ha` 的具名路径只有 pre-exec `reviews/REQUEST-2026-10-02-gap-uc018-waiting-user-tip-mw-e2e-ha.md`。该文件不改。本文件是 post-prove 新收据。

## Pins（retained · 本审查不改产品、不改矩阵）

| Pin | Value |
|-----|-------|
| haStatus | NOT_HA |
| releaseEvidence | false |
| claimProductionHA | false |
| gR45Closed | true |
| coveredCount | 8 |
| ms3EqualsR4Closed | false |
| Stack | PG-retained |
| Public DELETE | 503 |
| UC-018 / §1.1 | partial |
| evidenceOfRecord | false |

PASS ≠ covered ≠ nail。本绿不抬 covered。UC-018 仍 partial。

## 刀范围（REQUEST `23f5641` 之后，本刀 = `6fde895` + `559f972`）

`git diff --name-only 6fde895^..559f972` 只有：

- `scripts/uc018-waiting-user-tip-run.mjs`（新增）
- `ai-docs/delivery/receipts/uc018-waiting-user-tip/waiting-user-tip.json`
- `ai-docs/delivery/receipts/uc018-waiting-user-tip/logs/uc018-abandon-prove.log`
- `ai-docs/delivery/receipts/uc018-waiting-user-tip/logs/uc018-abandon-http-prove.log`

未改 `scripts/uc018-receipt-backfill-emit.mjs`、`scripts/lib/uc018-receipt-backfill-facts.mjs`、`scripts/lib/uc018-receipt-backfill-guard.mjs`、`scripts/lib/uc-covered-real-gatherer.mjs`，也未改 `ai-docs/delivery/receipts/uc018-receipt-backfill/`。emitter / facts / gatherer 的 blob 在 `6fde895^`、`559f972`、以及写本审查时的 `origin/feat/mysql-schema-skeleton` 上相同。backfill JSON 不在本刀 diff 里。收据 blob 在 `559f972` 与该 origin tip 上相同。

## SHA 字段（committed receipt）

`runnerCommitSha` = `gitSha` = `targetSha` = `wrapperSha` = `headAtEnd` = `6fde8959ec70d23a595ffcea02d62ab10a3a5762`。
`historicalTip` = false。`evidenceOfRecord` = false。`headDrift` = false。`cmdsRan` = true。
`exit` = 0。`exits`：`uc018:abandon:prove` = 0，`uc018:abandon:http:prove` = 0。
不是旧 SHA 的 backfill。路径在 `uc018-waiting-user-tip/`，不在 `uc018-receipt-backfill/`。禁用前缀（`85d36c7` / `f06dcba` / `549da9c` / `e88d386` / `23f98d3` / `bdc5993` / `b29c191`）未写入 SHA 字段。

## 已提交日志摘要（重算，不是照抄）

对 `559f972` 的 log blob 做 `sha256`：

- abandon log = `71147e6d7620f7c85253beb0d126ee1e299bbfe8a9e7797ec449461ceb03aab7`（收据 `stdoutDigest` 一致）
- http log = `1c9c218e1db86912f312832ac571cab7ad1e16ed9d7e36424db744a2e3a6834f`（收据 `stdoutDigest` 一致）

## Gatherer 不把本收据算作 covered

`uc-covered-real-gatherer.mjs` 只优先读 `uc018-receipt-backfill/*.json`。它不读 `uc018-waiting-user-tip/waiting-user-tip.json`。`WAITING_USER_BACKFILL_STATUS` 仍是 `MISSING-EVIDENCE`。evaluator 要求 `evidenceOfRecord === true` 才算证据；本收据为 false。矩阵 §1.1 UC-E2E-018 仍是 **partial**，`coveredCount` 仍是 **8**，`waiting_user stays MISSING-EVIDENCE`。本刀未改矩阵。

## Fresh run（新 worktree `/workspace/mw-rv-wu` @ `6fde895`，已删除）

`pnpm install --frozen-lockfile`。node `v20.19.2`，pnpm `10.18.0`（与收据记录一致）。脚本经 `run-e2e-isolated.mjs`，所以用了一次性 PG 容器（`pgvector/pgvector:pg16`），跑完由包装器自行删除。未删除其他 agent 的容器。

porcelain before：空。HEAD = `6fde8959ec70d23a595ffcea02d62ab10a3a5762`。

| CMD | claim EXIT | fresh EXIT |
|-----|------------|------------|
| `pnpm uc018:abandon:prove` | 0 | 0 |
| `pnpm uc018:abandon:http:prove` | 0 | 0 |
| `node scripts/uc018-waiting-user-tip-run.mjs` | 0 | 0 |

tip-run 打印：`gitSha=6fde8959ec70d23a595ffcea02d62ab10a3a5762 runnerCommitSha=6fde8959ec70d23a595ffcea02d62ab10a3a5762 exit=0`。fresh 收据同样 `evidenceOfRecord=false`、`historicalTip=false`、两 prove exit 0、`porcelainBefore=[]`、`porcelainAfterProve=[]`（包装器滤掉收据目录）。fresh log digest 与已提交 log 不同（新跑、端口与时间不同），这是新证据，不是复用旧 SHA。porcelain after tip-run：仅未跟踪的 `ai-docs/delivery/receipts/uc018-waiting-user-tip/`（worktree 已 `git worktree remove --force`，未入库）。

## 条件（不构成 FAIL，但不是 nail）

- 本文件只是 `mw-e2e-ha` 单方 post-prove。alone ≠ dual。未签 `mw-rag-route`。
- `evidenceOfRecord=false`。本收据不是 evidence of record。PASS ≠ covered ≠ nail。
- `stack` 为空，`stackIsRuntimeMet=false`。夹具是 pgvector-legacy isolated，不是 sole-stack。
- UC-018 / §1.1 保持 partial。`coveredCount` 保持 8。
- haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。

无 blocker。emitter / backfill JSON 未被本刀改动。EXIT 与声称 0/0/0 一致。SHA 字段等于跑时 HEAD。未把 historical SHA 塞进收据。未把 `evidenceOfRecord` 翻成 true。covered 未移动。

Verdict: PASS
