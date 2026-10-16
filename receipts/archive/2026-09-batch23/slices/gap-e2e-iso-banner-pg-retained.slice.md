# Slice — **GAP-E2E-ISO-BANNER-PG-RETAINED 一致性对齐刀**（Line N · docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Date**: 2026-10-03
**Base**: `origin/feat/mysql-schema-skeleton` · `8dde8e3c795178395b4fb9bf0e759aeb11693b90`（本地 origin ref · docs tip · not a prove tip）
**Authority**: meetwise — L0 docs only · Ban coding（除 harness §5 申报的纯文案新增行外零代码） · Ban prove · Ban self-approve · Ban secrets / `.env*` · Ban push

## One-line

Line N：把 isolated e2e 隔离壳 banner（`scripts/run-e2e-isolated.mjs:2068`「E2E isolated PostgreSQL: …」与 stale 的 `:1694-1697`「sole stack = MySQL+Qdrant+Redis」）与 `ai-docs/delivery/adr-postgres-retained.md:9-11`（Postgres / PostgresSaver / pgvector retained）的口径对齐——**隔离壳是测试基础设施，PG-retained 是产品栈钉，两者并存且互不否定**；对齐措辞硬含「**隔离测试 PG ≠ 产品栈变更 ≠ cutover 证据**」。**≠ sole cutover**、零产品行为变更；gap 状态不 flip。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-e2e-iso-banner-pg-retained.md`（§1 张力 file:line 全引 · §4/§5 diff 预览） |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-03-gap-e2e-iso-banner-pg-retained-mw-e2e-ha.md` |
| Dual `mw-privacy-int` | `reviews/REQUEST-2026-10-03-gap-e2e-iso-banner-pg-retained-mw-privacy-int.md` |

## Chain

- `gap-bug-backlog.md:63` 已登记 named gap：R5-MARKED-RED banner 仍写 MySQL+Qdrant+Redis 为 intended sole，**≠** `adr-postgres-retained` 真相；缓解=收据/审查不得引用该 banner 作 stack truth；**SOLE_STACK 对齐另包**。
- matrix 头部 L4（stale「栈裁定」）与 L99+ 的 2026-10-02 nails（`PG-retained` pin）新旧口径并存 —— 只读佐证，本刀不改矩阵。
- 本刀（Line N）：docs 口径对齐 REQUEST（ADR 补注 + banner 附加说明行，均为 additive-only）；**不改** ADR Decision 本体、**不改** SOLE_STACK 常量/既有 banner 字符串（另包）、**不碰** UC-018/052/025/004 行。

## 流程（§3 loop 第③步 → 第④步）

1. 本 commit：docs-only REQUEST（harness + slice + 两个 pre-exec stub，PENDING）。
2. 预执行双审：`mw-e2e-ha` + `mw-privacy-int` **BOTH PASS**（alone ≠ dual · Ban self-approve · 不代签 peer）。
3. 协调方（meetwise bot）显式授权 → 实现方按 harness §4（ADR 补注）与 §5（banner 说明行，唯一申报的产品面触碰点 · 纯文案 · 零行为）执行；任一方案被双审砍掉即不做。
4. 执行后 post-align docs supplement + post-align 双审另起；SSOT 更新只在彼时、只按彼时授权。

## Ban（逐条）

1. Ban 把对齐写成 sole cutover / MySQL 切流暗示（零栈迁移语义 · ADR supersede 关系不反转）。
2. Ban 改 PG-retained pin 本体（`adr-postgres-retained.md` L7-14 逐字不动）。
3. Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 行（及其 nails · `coveredCount=8` 不变）。
4. Ban SSOT edit（matrix / backlog / checklist 本刀零改动）。
5. Ban 改 `SOLE_STACK`/`LEGACY_STACK`/`SOLE_APPROVED_FIXTURE_CONFIG`（L1603-1606）与 R5-MARKED-RED 既有字符串（L1694-1697）——SOLE_STACK 对齐另包。

Ban coding（除申报的纯文案新增行外）· Ban prove · Ban push · Ban force-push · Ban self-approve · 本 commit 不运行任何 e2e。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503.

*Slice · GAP-E2E-ISO-BANNER-PG-RETAINED 一致性对齐刀 · draft:awaiting_pre_exec_dual · ≠ sole cutover · 零产品行为变更 · STOP*
