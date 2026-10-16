# REQUEST — **G7 trio fresh run** · post-prove · mw-rag-route

**Status**: post-prove · 2026-10-05T23:28:47+08:00
**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 mw-e2e-ha / mw-model-op · 不 nail
**审查对象**: REQUEST `1c57bb3` · receipt `9ff3daf`（`ai-docs/delivery/receipts/g7-trio-fresh/`）· prove tip `e8c63a9`
**origin tip（落笔）**: `7c631c26a1d173cd47f2543287ead287ef00fd23`（含后续 G7 nail 文档；本审仍判 receipt @ `e8c63a9`/`9ff3daf`）。
**NORTH-STAR-EXECUTION-LOOP**: **未找到**。门参考 = `north-star-hard-gates.md` + harness/slice。
**预执行**: mw-model-op `ad8d68e`、mw-e2e-ha `e8c63a9`。peer post-prove mw-model-op `4562644`（只读，末行 `Verdict: PASS`，不代签）。

## 实际命令（临时 worktree `/tmp/mwrr-e8c63a9` @ `e8c63a9` · **不用** `sg docker`，对齐 receipt 的 docker 组缺口）

| CMD | EXIT | 原因（本审） |
|-----|------|----------------|
| `pnpm e2e:isolated` | **1** | `E2E_FAILURE class=db code=database_not_ready`（uid `box` 不在 docker 组；直接 docker 不可用） |
| `pnpm e2e:ui:isolated` | **1** | 同 `database_not_ready`，未进 Playwright 用例 |
| `pnpm verify:e2e-performance` | **1** | web `next build` 成功后 `schema migration/deploy evolution` EXIT=1 → `e2e_performance_suite_failed:schema migration/deploy evolution:exit=1` |

**Trio 本审**: **1 / 1 / 1**，与 receipt SUMMARY 一致。未设任何模型 key（Ban live）。

说明：本机可用 `sg docker` 绕过组缺口；本审故意不绕，以复现 receipt 的 env-gap。`sg docker` 路径不作为洗绿依据。

## 检查结果

1. Receipt `SUMMARY.md` 明示 EXIT **1/1/1**、`g7SuiteGreen=false`、trio OPEN、Ban retry-to-green、attempts×1。iso/ui 归因 docker.sock 权限 / db not ready；perf 归因 migrate 在 web build 之后失败。本审复现同形。
2. 各子收据点名 `targetSha=e8c63a9`、ranAt、诚实红。无把 EXIT 洗成 0。
3. 无产品/脚本 diff（Line U prove-only）。不宣称 G7 绿、不宣称 HA、不宣称 covered。pins 原值。
4. peer `4562644` 已 PASS；本文件是本角色一半，alone ≠ dual。

## 条件

1. 本 PASS = 诚实红 trio 与 harness 一致，**≠** G7 绿 ≠ HA ≠ covered ≠ nail。
2. 若日后用 `sg docker` 跑出不同 EXIT，须新账披露，不得回改本 receipt。
3. UC-018/§1.1 仍 partial；coveredCount=8。不代签 peer。

Verdict: PASS
