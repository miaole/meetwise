# Harness — **M-CONDITIONS-REGISTRY**（C-IMAGE-DIGEST · C-PERF-TEARDOWN 诚实登记刀 · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · 本 open 不改 emitter / guard / facts / evaluator 源码）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove · Ban push · Dual PASS ≠ coding · Dual PASS ≠ CONDITION close · Dual PASS ≠ UC covered）
**Date**: 2026-10-03
**Base / parent tip**: origin `feat/mysql-schema-skeleton` **`8dde8e3`** / full `8dde8e3c795178395b4fb9bf0e759aeb11693b90`（`review(e2e): NHP-014-ADV-01 webhook ADV pre_exec_dual_pass (mw-rag-route) docs gate only`）
**Knife name**: **M-CONDITIONS-REGISTRY · gap-image-digest-perf-teardown-conditions**（Line M · C-IMAGE-DIGEST / C-PERF-TEARDOWN 两个 CONDITION 的登记/对齐刀 · docs only）
**Parent CONDITIONS 出处**: Line A UC-E2E-018 RECEIPT-BACKFILL post-prove dual correction 段 — `reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md:341-425`（§3 `C-IMAGE-DIGEST` `:399-401` · §2 `C-PERF-TEARDOWN` `:369-397`）· correction dual SHA **`0d42e2c`** / `0d42e2c4eaf4e537b80de894e20434be6f79fb1a`（post-prove correction FAIL @ `e9ccfbe`）· RE-REVIEW **`07823b5`**（tip `b82b9bc`）§5 两 CONDITION 均 **kept open**
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **gR45Closed=true** retained · coveredCount **8** retained · **ms3EqualsR4Closed=false** retained · PG-retained · public DELETE stays **503** · **canHonestlyFlip=false** · UC-018 / §1.1 stay **partial**
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST open only · status `draft:awaiting_pre_exec_dual` · Ban secrets / `.env*` · Ban force-push · **Ban UC-018 covered flip** · Ban coding / prove / push until pre-exec dual PASS + coordinator authorize
**Honesty**: 本刀只做**登记/对齐文档**。两个 CONDITION 保持 **OPEN** · 不关 · 不升级 · 不借登记暗示已修复。登记动作本身（backlog/checklist 行对齐）属**执行阶段**，须经 pre-exec dual PASS + 协调方授权后另 commit 完成。

---

## Gap（登记对象 · 两 CONDITION 现状 + 证据链）

### C-IMAGE-DIGEST — **OPEN CONDITION**（未关 · 未升级）

**要求（correction `0d42e2c` §3）**: 镜像 digest 必须 **LIVE per-run** 从 run log 里的**实际容器** `docker inspect`（container Id）采集。

**现状（源码只读核实 @ `8dde8e3`）**:

| 证据 | file:line | 读数 |
|------|-----------|------|
| Emitter 宿主按 tag inspect | `scripts/uc018-receipt-backfill-emit.mjs:344-357`（`collectImageDigestsRaw`）· inspect 语句在 `:353` | `docker image inspect <tag> --format '{{json .RepoDigests}}'` 对 `pgvector/pgvector:pg16` / `redis:7-alpine` / `minio/minio:latest` / `mailhog/mailhog:v1.0.1` 四个 **host 镜像 tag**；**无** run-log 容器 Id 解析、**无** container inspect |
| Re-emit 沿用 prior | `scripts/lib/uc018-receipt-backfill-facts.mjs:212`（`buildImageDigests`）· reemit 分支 `:243-246` | `priorDigestStr` 沿用 → `source='prior-docker-inspect'` · `liveObservation=false` · `priorCapturedAt` 继承首采时刻 |
| Live 标签分支仍来自宿主 | 同上 `:248-252` | `mode='live'` 时 `source='docker-inspect'` · `liveObservation=true`，但取值仍是 prove 模式下宿主 tag inspect 传入的 `priorDigestStr`，**非** run 内实际容器 |
| LIVE 判定门 | `scripts/lib/uc018-receipt-backfill-facts.mjs:61-66`（`isLiveImageDigestEntry`） | `liveObservation===false` / `source==='prior-docker-inspect'` 一律判 false —— 已入库 digest 条目**不满足** LIVE-in-run-log |
| 已入库 receipt 读数 | `ai-docs/delivery/receipts/uc018-receipt-backfill/PERF-LOAD.json:28-29` | `"source": "prior-docker-inspect"` · `"liveObservation": false`（pg16 `sha256:ccc6e83d…fb4d6b` · `priorCapturedAt=2026-09-24T04:38:14.481Z`）；redis/minio/mailhog `started=false` 从未启动 |
| 披露 | `ai-docs/delivery/receipts/uc018-receipt-backfill/README.md:35-37` · `:41` | 「not a live per-run docker observation」·「live-per-run stays an open CONDITION (not closed)」 |
| SSOT 登记现状 | `ai-docs/delivery/gap-bug-backlog.md:34` · `ai-docs/delivery/execution-master-checklist.md:441` | 均已登记 **OPEN CONDITION**，但证据指针仅指 README，无 file:line + dual SHA 完整链 |

**为何仍 OPEN**: emitter 全链路没有任何路径从 run log 解析实际容器并 inspect 之；已入库 digests 是 re-emit 沿用的 prior 采集（`isLiveImageDigestEntry` 判 false）；自 correction `0d42e2c` 与 RE-REVIEW `07823b5` 后**无**新的授权 prove 复跑；CONDITION 不能由 prose/登记关闭。

### C-PERF-TEARDOWN — **OPEN CONDITION**（disclosed · 未洗 · 未关）

**要求（correction `0d42e2c` §2）**: PERF-LOAD@`b29c191` attempt1 EXIT=1（prove 内 pg Client unhandled `Connection terminated`，mid-prove 崩溃 **非** SUMMARY 后 teardown）须作为条件诚实保留；attempt2 复现 EXIT=0 **不洗** attempt1。

**证据链（review 侧 · correction `0d42e2c`）**:

| 证据 | 位置 | 读数 |
|------|------|------|
| attempt1 崩溃日志 | `/workspace/mw-rv-bf-results/PERF-LOAD-prove.log` L17–20 / L22–37 / L42–43（correction 段 `REQUEST-2026-09-23-…mw-e2e-ha.md:371-380` 引用） | run1+run2 `passed=true` → `Unhandled 'error' event` · **`Error: Connection terminated unexpectedly`** on `pg/lib/client.js` → `ELIFECYCLE Command failed with exit code 1` · `RAW_EXIT=1`；**无** `SUMMARY allPass`、**无** run3 —— 崩在 declared runs=3 的 run2 之后 = **mid-prove**，非 post-SUMMARY teardown |
| 退出路径 | `scripts/uc018-perf-load-capped-child.mjs:202-204`（`8dde8e3` 现读） | `docker start -a` proof container → `process.exit(start.status ?? 1)`；未处理 pg Client error ⇒ Node 非零 ⇒ **prove 本身 EXIT=1**（失败在 prove exit path 内，非隔离器 teardown wash） |
| attempt2（恰一次） | correction 段 `:384-391` | 干净 wt `/workspace/mw-rv-bf-perf2-b29c191` @ `b29c191` · porcelain 0 · `pnpm install --frozen-lockfile` EXIT=0 · 新鲜隔离 PG `meetwise-e2e-1935146-1790226020641` @ `127.0.0.1:33046` · LIVE container inspect → run1–3 `passed=true` · `SUMMARY allPass=true` · **RAW_EXIT=0** |
| Per-SHA 裁定 | correction 段 `:393-397` · `:414` | PERF-LOAD@`b29c191`: **FAIL-UNREPRODUCED-ON-FIRST** (attempt1=1, attempt2=0) — condition **C-PERF-TEARDOWN** · PERF 保持 **local partial** · Ban elevate · C-PERF-CAP-PARTIAL retained · **非** B-PERF-FRESH-MISMATCH |
| Receipt 读数 | `ai-docs/delivery/receipts/uc018-receipt-backfill/PERF-LOAD.json:12` | `"exit": 0` 是 committed-log EOR（re-emit 写出），**不是**对 attempt1 的 wash（RE-REVIEW `07823b5` §5 原话） |
| 披露 | `ai-docs/delivery/receipts/uc018-receipt-backfill/README.md:39-41`（`c295731` 落地） | attempt1 EXIT 1（pg Client terminated inside prove）· attempt2 EXIT 0 ·「Do not claim the second exit washes the first」 |
| SSOT 登记现状 | `ai-docs/delivery/gap-bug-backlog.md:35` · `ai-docs/delivery/execution-master-checklist.md:442` | 均已登记 disclosed OPEN，但同样缺 file:line + dual SHA 完整链 |

**为何仍 OPEN**: attempt1 的 pg Client `Connection terminated unexpectedly` 根因**未钉死**（无修复、无归因）；attempt2 一次绿只证明「未复现」，不构成根因结论（同 GAP-PRIV-AUTHZ-PROVE-FLAKE 的 honesty 先例：not root-caused）；自 correction `0d42e2c` / RE-REVIEW `07823b5` 后**无**新的授权 PERF 复跑；条件关闭只能经新的授权修复/复跑刀，登记文档不能关。

## 本刀做与不做

**做（本 REQUEST commit · docs only）**:
1. 新建本 harness + slice + 两份 PENDING dual stub —— 把两 CONDITION 的现状、file:line、dual SHA（`0d42e2c` correction / `07823b5` re-review）完整登记为一页可引证据链。
2. 声明执行阶段（经授权后）的动作范围：**仅**对 `ai-docs/delivery/gap-bug-backlog.md:34-35` 与 `ai-docs/delivery/execution-master-checklist.md:441-442` 做**对齐补强**（把证据指针从「README only」补成本 harness + file:line + dual SHA），**保持 OPEN / disclosed 原状**。

**不做（Ban）**:
- **Ban** 关闭任一 CONDITION（含借登记措辞暗示已修复/已降级）。
- **Ban** 升级（C-PERF-TEARDOWN 保持 CONDITION，不升 BLOCKER；C-IMAGE-DIGEST 保持 CONDITION，不并 GAP）。
- **Ban** UC-018 covered flip · `canHonestlyFlip=false` · coveredCount **8** 不动 · UC-018 / §1.1 stay **partial**。
- **Ban** 碰 `scripts/uc018-receipt-backfill-emit.mjs` / `scripts/lib/uc018-receipt-backfill-facts.mjs` / `scripts/lib/uc018-receipt-backfill-guard.mjs` / `scripts/lib/uc-covered-evaluator.mjs` / `scripts/lib/uc-covered-real-gatherer.mjs` / `scripts/uc018-perf-load-capped-child.mjs` 及一切源码 —— 修复须**另刀**。
- **Ban** 改写任何已入库 receipt JSON / log（含 `PERF-LOAD.json`、`receipts/uc018-receipt-backfill/README.md`）。
- **Ban** prove / prove-as-acceptance / retry-to-green / push。

## 后续修复方向（仅供评估 · 非授权 · 修复须另立 REQUEST + dual + authorize）

- **C-IMAGE-DIGEST（LIVE digest 采集路径）**: emitter 在 prove/re-emit 时从 run log 解析实际容器标识（如 `E2E isolated PostgreSQL: <container-name>` 行 / docker 容器 Id），对该**容器**执行 `docker inspect` 取 `Image`+`RepoDigests`，并把 `capturedAt` 绑定到本次 run 时间窗；允许列表若双审同意仅限 emitter（+facts 标签分支）。验收锚点：`isLiveImageDigestEntry` 对新条目返回 true 且 cite 指向本次 run log 行。
- **C-PERF-TEARDOWN（teardown 根因方向）**: 定位 prove 内 pg Client `Connection terminated unexpectedly` 的来源（候选：run-e2e-isolated 子进程内 client 未显式 end / 隔离 PG 容器生命周期与 capped-child `docker start -a` 竞态 / pg idle 处理），修复落在 prove 基建层；随后一次新的授权 PERF-LOAD prove 记账（attempt3 · Ban retry-to-green 叙事）。注意：这与 `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER`（产品 API 池无 error 监听）同族**不同 scope**，不得互相借关。

## NHP（本刀 = 登记刀 · 无 prove · NHP 仅登记诚实约束）

| Order | Item |
|-------|------|
| 1 NEG | 登记后两 CONDITION 状态字段仍为 OPEN / disclosed —— 登记不改变状态 |
| 2 FAULT | 若登记文本与源码/receipt 读数不符（如引用行漂移）→ 本刀 FAIL |
| 3 BOUND | 执行阶段允许列表仅 backlog `:34-35` + checklist `:441-442` 两处行级对齐 |
| 4 ADV | 借登记措辞暗示已修复/已关/covered → FAIL |
| HP last | 登记完整 · 状态不变 · pins 不变 · STOP |

## Dual stubs

| Expert | Path | Status |
|--------|------|--------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-03-gap-image-digest-perf-teardown-conditions-mw-e2e-ha.md` | **PENDING** |
| `mw-rag-route` | `reviews/REQUEST-2026-10-03-gap-image-digest-perf-teardown-conditions-mw-rag-route.md` | **PENDING** |

## Pins

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · PG-retained · public DELETE stays **503** · **canHonestlyFlip=false** · C-IMAGE-DIGEST **OPEN** · C-PERF-TEARDOWN **OPEN** · Ban 关闭/升级/covered flip/源码修改 · STOP

*Harness · M-CONDITIONS-REGISTRY · C-IMAGE-DIGEST / C-PERF-TEARDOWN · docs REQUEST · draft:awaiting_pre_exec_dual · no code no prove this open · STOP*
