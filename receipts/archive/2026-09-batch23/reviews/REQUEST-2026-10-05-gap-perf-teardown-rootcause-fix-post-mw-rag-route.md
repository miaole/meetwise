# REQUEST — **C-PERF-TEARDOWN 根因刀** · post-prove · mw-rag-route

**Status**: post-prove · 2026-10-05T23:28:47+08:00
**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 mw-e2e-ha · 不 nail
**审查对象**: REQUEST `3ca9628` · receipt commit `920666a` · prove @ `e8c63a9`
**origin tip（落笔）**: `7c631c26a1d173cd47f2543287ead287ef00fd23`。
**NORTH-STAR-EXECUTION-LOOP**: **未找到**。门参考 = `north-star-hard-gates.md` + harness/slice。
**本角色预执行**: `0bd7ddf`（`reviews/REQUEST-2026-10-05-gap-perf-teardown-rootcause-fix-mw-rag-route.md`），条件 C-1~C-4。peer 预执行 `5066b5c` 不代签。

## 实际命令

| CMD | Worktree | EXIT | 观测 |
|-----|----------|------|------|
| `pnpm uc018:perf-load:prove`（×1 · `sg docker`） | `/tmp/mwrr-e8c63a9` @ `e8c63a9` | **0** | run1–3 均 `passed=true`；`SUMMARY allPass=true capsEnforced=true`；日志 **无** `Unhandled 'error' event`；**无** `db_pool_error` 行（无真实断连 → Branch A 判据 (c) = N/A） |

本审只复跑 **1** 次（receipt 为 3 次全 0）。条件：未满 3 次独立复跑；以 receipt 台账 + 本 1 次一致为据，不把 1 次外推成 3 次。

## 检查结果

1. **EXIT 台账 / Ban wash**: receipt Attempts 表 A/B/C 各 EXIT **0**，分列时间戳与 machine receipt。Historical attempt1 @ `b29c191` EXIT **1** 专节保留（`:69-76`），Ban wash。无隐藏 retry-to-green。
2. **Branch A 判据未挪球门**: `git diff 3ca9628 920666a` 对 harness/slice **仅**状态注（`post_prove:awaiting_post_prove_dual` + 结果摘要）。关闭判据 (a)(b)(c) 原文未改、未放宽。backlog `gap-bug-backlog.md:35` **C-PERF-TEARDOWN** 仍 `disclosed OPEN` / CONDITION，未关。
3. **产品越界**: `3ca9628..e8c63a9` 对 apps/packages/scripts **空 diff**（Branch A 零码改）。`3ca9628..920666a` 出现的 FI-3 文件属并行 Line T，非本刀。无 RAG/qdrant 假关。principal.ts 未碰。
4. **预执行 C-1~C-4**: receipt 钉 prove SHA `e8c63a9` + 代码等价 `55ede89`（C-1）；attempt1 保留（C-2）；local partial / capacityRepresentative=false / NOT_HA（C-3）；Branch B 未触发（C-4）。
5. **Pins**: NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · DELETE=503 · PG-retained · PERF/LOAD local partial · canHonestlyFlip=false。UC-018/§1.1 仍 partial。

## 条件

1. C-PERF-TEARDOWN **仍 OPEN**。本 PASS ≠ 条件关闭 ≠ nail ≠ covered ≠ HA。关闭仍须 dual（含 peer）+ 协调方授权。
2. 本审仅 1/3 次复跑 EXIT 0；与 receipt 一致但不代替其三账。
3. 无真实断连故未验证 `db_pool_error` 观测路径样本——receipt 已标 N/A；不得把「无断连」说成「观测已证」。
4. alone ≠ dual；不代签 `5066b5c`。

Verdict: PASS
