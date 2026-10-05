# REQUEST — **Q-IMAGE-DIGEST-LIVE-CAPTURE-FIX**（C-IMAGE-DIGEST 修复刀 · LIVE per-run digest 采集）· pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-image-digest-live-capture-fix.md` · slice `gap-image-digest-live-capture-fix.slice.md`
**Base tip**: `a778255` / `a778255c8a600304001207a514621323e77da3d2`（origin `feat/mysql-schema-skeleton`）
**Date**: 2026-10-05

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
| C-IMAGE-DIGEST | **OPEN CONDITION**（coding 落地 + 授权 prove + dual 复验前不动） |
| C-PERF-TEARDOWN | **OPEN CONDITION**（不同 scope · 不互借） |

## 请求审什么（docs-only REQUEST · 修复方案 + prove 契约 + 边界）

CONDITION 出自 Line A UC-018 RECEIPT-BACKFILL post-prove correction dual `0d42e2c` §3（`reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md:399-401`：digest 须 LIVE per-run 从 run log 实际容器 `docker inspect`）· RE-REVIEW `07823b5` §5 `:475-481` kept open · SSOT `gap-bug-backlog.md:34`。

**现状（源码只读核实 @ `a778255`）**:
- emitter `collectImageDigestsRaw`（`scripts/uc018-receipt-backfill-emit.mjs:344-357` · inspect `:353`）是宿主按 tag `docker image inspect` —— 非 run log 实际容器的 LIVE inspect；prove 期传入的也是宿主读数（`:375`/`:396`/`:402` `digestMode:'live'`）。
- facts `buildImageDigests`（`scripts/lib/uc018-receipt-backfill-facts.mjs:243-246`）re-emit 沿用 `priorDigestStr` 标 `prior-docker-inspect`/`liveObservation=false`；`:248-252` 却把宿主 tag 数组在 `mode='live'` 下标成 `docker-inspect`/`liveObservation=true`（错标 live 的直接来源）；`isLiveImageDigestEntry`（`:61-66`）对已入库条目判 false。
- 已入库 `PERF-LOAD.json:28-29` = `prior-docker-inspect` / `liveObservation:false`；README `:35-37`/`:41` 已披露 not-live、CONDITION 未关。

**REQUEST 定义的修复方案（一句话）**: emitter 按 run log 实际容器（`run-e2e-isolated.mjs:2070` banner 唯一容器名 `meetwise-e2e-<pid>-<ts>`）在容器仍存在的 run 窗口内（`docker run --rm` `:2056` · finally `docker rm -f` `:2125-2128`、emitter finally `:407-412` —— prove 退出后 inspect 必败，故窗口内采集是硬约束）`docker inspect <container>` 取 `.Image` digest 与容器 Id，落 `imageDigests.<svc>={imageDigest(live), source:'live-container-inspect', liveObservation:true, containerId, capturedAt(run 窗口)}`；宿主 tag inspect 仅作 fallback 且永远 `liveObservation:false`（移除 `:248-252` 错标分支）；re-emit prior 不变差、Ban 静默沿用 `priorDigestStr` 冒充 live；缺失/伪造容器 Id fail-closed；`isLiveImageDigestEntry` 收紧式扩展只认 `live-container-inspect + liveObservation:true + containerId` 非空。

**prove 契约（一句话）**: 复用 `pnpm uc018:receipt-backfill:prove`（`package.json:502`）加 4 组 fail-closed 断言 —— `FX-IMAGE-DIGEST-LIVE-CONTAINER-INSPECT`（live 产物 `isLiveImageDigestEntry=true`）、`FX-IMAGE-DIGEST-CONTAINER-ID-FAILCLOSED`（伪造/缺失容器 Id 非 live）、`FX-IMAGE-DIGEST-REEMIT-NOT-LIVE`（reemit prior 永不标 live）、`FX-IMAGE-DIGEST-HOST-TAG-FALLBACK-NOT-LIVE`（宿主 fallback 永不标 live）；或按 harness §二 新增 prove CMD，由实现陈述、双审确认。

**边界**: coding 允许列表仅 emitter（digest 采集）+ facts（标注分支 `:239-262`、`isLiveImageDigestEntry :61-66`）+ prove/测试三处；**Ban** guard 验签语义、**Ban** 既有 receipts JSON/log/README 改写（新跑才产生 live digest）、**Ban** 碰 `run-e2e-isolated.mjs`、**Ban** 借刀关 C-PERF-TEARDOWN、**Ban** UC-018 covered 变化、**Ban** 本 REQUEST 文本关闭 C-IMAGE-DIGEST。

## 对照禁令（审者对照用）

- **Ban coding / prove / push**：本 commit 零源码 diff —— 仅 harness + slice + 两 stub 四个新文件；修复须 pre-exec dual PASS + 协调方授权后另 commit。
- **Ban 状态变化**：C-IMAGE-DIGEST 在 coding 落地并经授权 prove 复跑 + dual 复验前保持 **OPEN**；Ban 借 REQUEST 措辞宣称修复完成 / 已关 / 已降级。
- **Ban C-PERF-TEARDOWN 互借**：不同 scope（attempt1 pg Client 根因未钉死），本刀零提及即零借用。
- **Ban UC-018 covered flip**：UC-018 / §1.1 stay **partial** · `canHonestlyFlip=false` · coveredCount **8** 不动。
- **Ban guard 验签语义改动**：GAP-HMAC 是独立缺口，本刀不触碰 `uc018-receipt-backfill-guard.mjs` 的 HMAC/signature 语义。

Dual PASS ≠ coding ≠ close ≠ covered ≠ nail · alone ≠ dual · 本 stub 无 Verdict。

---

*Stub · awaiting expert pre-exec dual · STOP*
