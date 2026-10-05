# Slice — **Q-IMAGE-DIGEST-LIVE-CAPTURE-FIX**（C-IMAGE-DIGEST 修复刀 · LIVE per-run 镜像 digest 采集 · docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Date**: 2026-10-05
**Base**: origin `feat/mysql-schema-skeleton` **`a778255`**（`a778255c8a600304001207a514621323e77da3d2`）
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban push · Ban secrets / `.env*`
**CONDITION 出处**: Line A RECEIPT-BACKFILL correction dual `0d42e2c` §3（`reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md:399-401`）· RE-REVIEW `07823b5` §5 `:475-481` kept open · SSOT `gap-bug-backlog.md:34`（OPEN CONDITION）

## One-line

给 C-IMAGE-DIGEST 写修复 REQUEST：emitter 改为按 run log 实际容器（`meetwise-e2e-<pid>-<ts>`）在 run 窗口内 `docker inspect` 采集 LIVE digest（`source='live-container-inspect'` · `liveObservation:true` · `containerId`），宿主 tag inspect 降级为 `liveObservation:false` fallback，re-emit prior 永不冒充 live，缺失/伪造容器 Id fail-closed；prove 契约复用 `uc018:receipt-backfill:prove` 加 4 组 fail-closed 断言。

## Products（本 commit · docs only）

| Role | Path |
|------|------|
| Harness | `harness/gap-image-digest-live-capture-fix.md` |
| Slice | `gap-image-digest-live-capture-fix.slice.md` |
| Dual e2e-ha | `reviews/REQUEST-2026-10-05-gap-image-digest-live-capture-fix-mw-e2e-ha.md` |
| Dual rag-route | `reviews/REQUEST-2026-10-05-gap-image-digest-live-capture-fix-mw-rag-route.md` |

**coding 阶段（pre-exec dual PASS + 协调方授权后另 commit）允许列表**: `scripts/uc018-receipt-backfill-emit.mjs`（digest 采集）+ `scripts/lib/uc018-receipt-backfill-facts.mjs`（标注分支 `:239-262` · `isLiveImageDigestEntry :61-66`）+ prove/测试（`scripts/uc-e2e-018-receipt-backfill.proof.mjs` FX 断言或新 prove CMD）。

**Ban**: guard 验签语义（HMAC 零改动）· 既有 receipts JSON/log/README 改写（新跑才产生 live digest）· `run-e2e-isolated.mjs`（容器生命周期/banner 不动）· 借刀关 C-PERF-TEARDOWN（不同 scope，仍 OPEN）· UC-018 covered flip（`canHonestlyFlip=false` · coveredCount 8）· 本 REQUEST 文本关闭 C-IMAGE-DIGEST。

*Slice · Q-IMAGE-DIGEST-LIVE-CAPTURE-FIX · draft:awaiting_pre_exec_dual · STOP*
