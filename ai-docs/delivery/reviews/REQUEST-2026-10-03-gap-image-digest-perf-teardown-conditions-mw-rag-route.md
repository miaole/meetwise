# REQUEST — **M-CONDITIONS-REGISTRY**（C-IMAGE-DIGEST · C-PERF-TEARDOWN 诚实登记）· pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-image-digest-perf-teardown-conditions.md` · slice `gap-image-digest-perf-teardown-conditions.slice.md`
**Base tip**: `8dde8e3` / `8dde8e3c795178395b4fb9bf0e759aeb11693b90`（origin `feat/mysql-schema-skeleton`）
**Date**: 2026-10-03

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `canHonestlyFlip` | **false** |
| C-IMAGE-DIGEST | **OPEN CONDITION**（不动） |
| C-PERF-TEARDOWN | **OPEN CONDITION**（不动） |

## 请求审什么（docs-only 登记）

两个 CONDITION 出自 Line A UC-018 RECEIPT-BACKFILL post-prove correction（dual `0d42e2c` @ tip `e9ccfbe`；RE-REVIEW `07823b5` §5 kept open）：

- **C-IMAGE-DIGEST**：digest 须 LIVE per-run 从 run log 实际容器 `docker inspect`；现状 emitter 是宿主 `docker image inspect <tag>`（`uc018-receipt-backfill-emit.mjs:353`），re-emit 沿用 `priorDigestStr` 标 `prior-docker-inspect` / `liveObservation=false`（facts `:243-246`；`isLiveImageDigestEntry` `:61-66` 判 false）→ 不满足 LIVE-in-run-log，仍 OPEN。
- **C-PERF-TEARDOWN**：PERF-LOAD@`b29c191` attempt1=1（prove 内 pg Client unhandled `Connection terminated unexpectedly`，mid-prove，非 SUMMARY 后 teardown；capped-child `:202-204`）/ attempt2=0（恰一次）→ 条件保留，PERF local partial，attempt2 不洗 attempt1，根因未钉死 → 仍 OPEN。

本 REQUEST commit 只写 harness / slice / 两 stub。**执行阶段**（经授权后）仅对 `gap-bug-backlog.md:34-35` + `execution-master-checklist.md:441-442` 做行级对齐（补 file:line + dual SHA 证据指针）。

## 对照禁令（审者对照用）

- **Ban coding / prove / push**：本刀零源码 diff —— Ban 碰 emitter / facts / guard / evaluator / gatherer / capped-child；Ban 改写 receipt JSON / log / README；修复须另刀。
- **Ban 状态变化**：登记后两 CONDITION 仍 OPEN / disclosed；Ban 关闭、Ban 升级、Ban 借登记措辞暗示已修复或已降级。
- **Ban UC-018 covered flip**：UC-018 / §1.1 stay **partial** · `canHonestlyFlip=false` · coveredCount **8** 不动。
- 修复方向（LIVE digest 采集路径 / PERF teardown 根因）在本刀内**仅供评估**，不构成实现授权。

Dual PASS ≠ coding ≠ close ≠ covered ≠ nail · alone ≠ dual · 本 stub 无 Verdict。

---

*Stub · awaiting expert pre-exec dual · STOP*
