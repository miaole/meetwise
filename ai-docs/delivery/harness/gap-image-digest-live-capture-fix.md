# Harness — **Q-IMAGE-DIGEST-LIVE-CAPTURE-FIX**（C-IMAGE-DIGEST 修复刀 · LIVE per-run 镜像 digest 采集 · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · 本 open 不改 emitter / facts / guard 源码）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove · Ban push · Dual PASS ≠ coding · Dual PASS ≠ CONDITION close · Dual PASS ≠ UC covered）
**Date**: 2026-10-05
**Base / parent tip**: origin `feat/mysql-schema-skeleton` **`a778255`** / full `a778255c8a600304001207a514621323e77da3d2`（`docs(delivery): NAIL GAP-E2E-ISO-BANNER-PG-RETAINED align post_prove_dual_pass`）
**Knife name**: **Q-IMAGE-DIGEST-LIVE-CAPTURE-FIX · gap-image-digest-live-capture-fix**（Line Q · C-IMAGE-DIGEST 修复刀 · 本 commit docs only，coding 须 pre-exec dual PASS + 协调方授权后另 commit）
**CONDITION 出处（证据链）**: Line A UC-E2E-018 RECEIPT-BACKFILL post-prove correction dual **`0d42e2c`** §3 — `reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md:399-401`（「Digest must be captured **LIVE per run** from the **actual container** in the run log」）· RE-REVIEW **`07823b5`**（tip `b82b9bc`）§5 `:475-481` kept **CONDITION** open · SSOT 登记 `ai-docs/delivery/gap-bug-backlog.md:34`（**OPEN** CONDITION）· M 线登记刀 `harness/gap-image-digest-perf-teardown-conditions.md`（本刀是其「后续修复方向」第一条的正式 REQUEST）
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **gR45Closed=true** retained · coveredCount **8** retained · **ms3EqualsR4Closed=false** retained · PG-retained · public DELETE stays **503** · **canHonestlyFlip=false** · UC-018 / §1.1 stay **partial**
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — 本 commit docs REQUEST only · status `draft:awaiting_pre_exec_dual` · Ban secrets / `.env*` · Ban force-push · **Ban UC-018 covered flip** · coding / prove / push 须经 pre-exec dual PASS + coordinator authorize
**Honesty**: 本刀写的是**修复 REQUEST**（方案 + prove 契约 + 边界），不是修复本身。C-IMAGE-DIGEST 在 coding commit 落地并经其 prove 之前保持 **OPEN**；本 REQUEST 文本不构成修复完成、不构成 CONDITION 关闭、不构成 UC-018 状态变化。

---

## Gap（C-IMAGE-DIGEST 现状 · 源码只读核实 @ `a778255`）

**要求（correction `0d42e2c` §3 `:399-401`）**: digest 必须 **LIVE per-run** 从 run log 里的**实际容器** `docker inspect`（container Id）采集。

| 证据 | file:line | 读数 |
|------|-----------|------|
| Emitter 宿主按 tag inspect | `scripts/uc018-receipt-backfill-emit.mjs:344-357`（`collectImageDigestsRaw`）· inspect 语句 `:353` | `docker image inspect <tag> --format '{{json .RepoDigests}}'` 对 `pgvector/pgvector:pg16` / `redis:7-alpine` / `minio/minio:latest` / `mailhog/mailhog:v1.0.1` 四个 **host 镜像 tag**；无 run-log 容器解析、无 container inspect |
| 宿主读数被当作 prove 期 digest | `scripts/uc018-receipt-backfill-emit.mjs:375`（`imageDigestsPre`）、`:396`（prove 后 merge `collectImageDigestsRaw(wtPath)`）、`:402`（`digestMode:'live'`） | `mode='live'` 传给 `buildImageDigests` 的数组仍是宿主 tag inspect 产物 |
| Live 标签分支错标 | `scripts/lib/uc018-receipt-backfill-facts.mjs:248-252` | `priorDigestStr && mode==='live'` → `source='docker-inspect'` · `liveObservation=true` · `capturedAt` —— 但取值是**宿主 tag** inspect，**非** run 内实际容器 |
| Re-emit 沿用 prior | `scripts/lib/uc018-receipt-backfill-facts.mjs:243-246`（`buildImageDigests` reemit 分支） | `priorDigestStr` 沿用 → `source='prior-docker-inspect'` · `liveObservation=false` · `priorCapturedAt` 继承首采时刻 |
| LIVE 判定门 | `scripts/lib/uc018-receipt-backfill-facts.mjs:61-66`（`isLiveImageDigestEntry`） | `liveObservation===false` / `source==='prior-docker-inspect'` 一律判 false；仅认 `source==='docker-inspect' && liveObservation===true`（即上述错标分支）—— 已入库条目**不满足** LIVE-in-run-log |
| 已入库 receipt 读数 | `ai-docs/delivery/receipts/uc018-receipt-backfill/PERF-LOAD.json:28-29` | `"source": "prior-docker-inspect"` · `"liveObservation": false`（pg16 `sha256:ccc6e83d…fb4d6b`）；redis/minio/mailhog `started=false` 从未启动 |
| 披露 | `ai-docs/delivery/receipts/uc018-receipt-backfill/README.md:35-37` · `:41` | 「Re-emitted digests carry `source: prior-docker-inspect`, `liveObservation: false` … **not** live per-run docker observations」·「live-per-run stays an open CONDITION (not closed)」 |
| SSOT 登记 | `ai-docs/delivery/gap-bug-backlog.md:34` | `C-IMAGE-DIGEST | P1 | live-per-run image digest not observed | **OPEN** CONDITION · prior-docker-inspect is not live · not closed by this nail` |
| 容器生命周期（修复须正视） | `scripts/run-e2e-isolated.mjs:1600`（`meetwise-e2e-${pid}-${Date.now()}`）、`:2056`（`docker run --rm -d --name`）、`:2070`（banner `E2E isolated PostgreSQL: <container> on 127.0.0.1:<port>`）、`:2125-2128`（finally `docker rm -f`）；emitter 自身 finally `uc018-receipt-backfill-emit.mjs:407-412` 亦 `docker rm -f` | run 容器**只存在于 run 窗口内**：banner 输出唯一容器名，run 结束容器即被删除。**prove 子进程退出后**再 `docker inspect <container>` 必然失败 —— 这是修复方案必须处理的硬约束 |

**为何仍 OPEN**: emitter 全链路没有任何路径从 run log 解析实际容器并 inspect 之；已入库 digests 是 re-emit 沿用的 prior 采集（`isLiveImageDigestEntry` 判 false）；`mode='live'` 分支把宿主 tag inspect 错标为 live；自 correction `0d42e2c` 与 RE-REVIEW `07823b5` 后无修复落地。CONDITION 不能由 REQUEST 文本关闭。

---

## 一、修复方案（coding 阶段 · 经授权后执行 · 本节为 REQUEST 契约）

**目标**：emitter 产出的 digest 条目必须能被 `isLiveImageDigestEntry` 以**真实 per-run 容器观察**的口径判 true；宿主 tag inspect 与 prior 沿用永远不再冒充 live。

1. **LIVE per-run 采集路径（主路径）**: emitter 在 prove 运行时，从 run log 的实际容器标识（`run-e2e-isolated.mjs:2070` banner 输出的唯一容器名 `meetwise-e2e-<pid>-<ts>`，即 run log 中实际容器的 container 标识）解析出本次 run 的容器，对该**容器**执行 `docker inspect <container>`，取 `.Image` digest 与容器 `.Id`，落到 `imageDigests.<svc>`，条目形如 `{digest, source:'live-container-inspect', liveObservation:true, containerId}`。
   - **Schema 澄清（供双审裁定）**: 既有条目的 digest 载体键是 `imageDigest`（guard/evaluator 按该键读取）。实现保留 `imageDigest` 键承载 live 容器 digest，另加 `containerId` 字段、`source:'live-container-inspect'`、`liveObservation:true`、`capturedAt`（落在本 run 时间窗内）。本刀行文中的 `{digest,…}` 简写即映射到该 `imageDigest` 键 —— **不**新造平行键。
2. **采集窗口硬约束（fail-closed 的根据）**: run 容器是 `docker run --rm`（`run-e2e-isolated.mjs:2056`）且 run 结束即 `docker rm -f`（`:2125-2128`；emitter finally `:407-412` 同样清理）。因此对 run-log 容器的 inspect **必须在容器仍存在时完成**（实现须在 emitter 侧于 run 窗口内观察子进程输出 / banner 行并即刻 inspect，或等效的窗口内采集机制）。**Ban** 把「prove 退出后对已删容器的 inspect 失败」静默降级为宿主 tag inspect 冒充 live；采集失败必须 fail-closed。
3. **fail-closed 语义**: 容器 Id 缺失、伪造（inspect 无此容器 / 返回空）、inspect 失败 —— 一律产出**非 live** 条目（digest 诚实记 `unobserved` 或显式失败标记，`liveObservation:false`，不携带 containerId 或如实携带失败原因），并使该路径断言可见地失败。**Ban** 任何把缺失/失败容器观察标成 `liveObservation:true` 的分支。
4. **宿主 tag inspect 降级为 fallback**: `collectImageDigestsRaw`（`emit.mjs:344-357`）保留仅作 fallback，其产物永远 `liveObservation:false`（`source` 诚实标注为宿主 fallback 口径）。facts `:248-252` 现行「`mode==='live'` → 宿主数组标 `docker-inspect`/`liveObservation=true`」分支**必须移除或改写**为 fallback 口径 —— 这是当前错标 live 的直接来源。
5. **re-emit 不变差**: `:243-246` reemit 分支维持 `source='prior-docker-inspect'` · `liveObservation=false` · `priorCapturedAt` 继承。**Ban** 静默沿用 `priorDigestStr` 冒充 live（Ban 给 prior 条目任何 live 标注、Ban 在新跑里把 prior 直接改标 live 而不做真实容器 inspect）。
6. **`isLiveImageDigestEntry` 收紧式扩展**（`facts.mjs:61-66`）: 新增接受 `source==='live-container-inspect' && liveObservation===true && containerId` 非空；`prior-docker-inspect`、宿主 fallback、`not-started`、`unpinned`、`unobserved` 与一切缺 containerId 的条目维持判 false。**Ban** 放宽到接受既有 prior/宿主条目（那等于把 C-IMAGE-DIGEST 用改判定义的方式洗掉）。
7. **适用范围**: live 容器采集适用于 run log 中**实际启动**的 tracked 服务（现状 = 隔离 PG，镜像 `pgvector/pgvector:pg16`，容器名见 banner）；未启动服务维持既有诚实条目（`not-started` 等），不因本刀新增伪造观察。
8. **既有回执不动**: 既有 7 份 receipts JSON（含 `PERF-LOAD.json`）**不回填改写** —— live digest 只由**新跑**（新的授权 prove/emit）产生。历史 SHA 的 prior/not-started 条目维持披露原状。

## 二、回归 prove 契约（CMD 按本 REQUEST 定义）

**CMD**: 复用 **`pnpm uc018:receipt-backfill:prove`**（`package.json:502` → `scripts/uc-e2e-018-receipt-backfill.proof.mjs`），在其 fixture/assert 体系内新增断言；若实现证明需独立 prove（如需真实 docker 容器起停的集成断言），可新增 prove 脚本并在 package.json 挂 CMD —— 二选一由实现陈述、双审确认。**新增断言（fail-closed 方向，全部必须存在且可见）**:

| Fixture | 断言 |
|---------|------|
| `FX-IMAGE-DIGEST-LIVE-CONTAINER-INSPECT` | live 采集路径产物（真实容器名 + containerId + digest + `capturedAt` 在 run 窗口内）→ `isLiveImageDigestEntry=true`；且 `source==='live-container-inspect'`、`liveObservation===true`、`containerId` 非空 |
| `FX-IMAGE-DIGEST-CONTAINER-ID-FAILCLOSED` | 伪造容器 Id（inspect 无此容器）与缺失容器 Id 两个用例 → 条目**非 live**（`liveObservation=false`），无宿主 tag 值被冒名顶替成 live，路径诚实记录失败 |
| `FX-IMAGE-DIGEST-REEMIT-NOT-LIVE` | reemit 模式 + `priorDigestStr` → `source='prior-docker-inspect'` · `liveObservation=false` · `isLiveImageDigestEntry=false`（把现行行为钉成回归断言，防未来洗白） |
| `FX-IMAGE-DIGEST-HOST-TAG-FALLBACK-NOT-LIVE` | 宿主 tag inspect fallback 产物 → `liveObservation=false`，`isLiveImageDigestEntry=false`（`:248-252` 旧行为不得回归） |

Prove 退出码必须真实（Ban retry-to-green / Ban prove-as-acceptance 语义注水）；prove 产物只证 prove SHA 自身，nail SHA ≠ prove SHA（沿用 RECEIPT-BACKFILL 既有口径）。

## 三、边界（执行允许列表 + Ban）

**允许（coding commit 的全部范围）**:
- `scripts/uc018-receipt-backfill-emit.mjs` —— digest 采集逻辑（live 容器 inspect、窗口内采集、fallback 降级）。
- `scripts/lib/uc018-receipt-backfill-facts.mjs` —— digest 标注分支（`:239-262` 区段内 live/reemit/fallback 语义）与 `isLiveImageDigestEntry`（`:61-66`）。
- prove/测试 —— `scripts/uc-e2e-018-receipt-backfill.proof.mjs` 新增 FX 断言（或按 §二 新增 prove + package.json CMD）。

**Ban**:
- **Ban** 碰 `scripts/lib/uc018-receipt-backfill-guard.mjs` 的**验签语义**（HMAC/signature 语义零改动 —— GAP-HMAC 是另一刀）。
- **Ban** 改写任何既有 receipts JSON / log / README（`PERF-LOAD.json` 等 7 份 + `receipts/uc018-receipt-backfill/README.md` 保持披露原状；新跑才产生 live digest）。
- **Ban** 碰 `scripts/run-e2e-isolated.mjs`（容器命名/生命周期/banner 不动；采集在 emitter 侧实现）。
- **Ban** 借刀关 **C-PERF-TEARDOWN**（不同 scope —— attempt1 pg Client 根因未钉死，仍 OPEN，不得互借互关，沿用 M 线登记口径）。
- **Ban** 宣称 UC-018 covered 变化：UC-018 / §1.1 stay **partial** · `canHonestlyFlip=false` · coveredCount **8** 不动；本刀即使 prove 全绿也只收窄 digest 采集诚实性缺口，不触发 covered flip。
- **Ban** 关闭 C-IMAGE-DIGEST 于本 REQUEST 文本 —— CONDITION 关闭只能发生在 coding 落地 + 授权 prove 复跑 + dual 复验之后的 SSOT 对齐刀。
- Ban secrets / `.env*` / force-push / 未授权 push。

## NHP（REQUEST 刀 · 无 prove · NHP 仅登记诚实约束）

| Order | Item |
|-------|------|
| 1 NEG | 本 REQUEST 落地后 C-IMAGE-DIGEST 状态仍 OPEN —— REQUEST 不是修复 |
| 2 FAULT | 引用的 file:line / dual SHA 与 `a778255` 实际读数不符（锚点漂移）→ 本刀 FAIL |
| 3 BOUND | coding 阶段允许列表 = emitter + facts + prove/测试 三处；guard 验签、run-e2e-isolated、receipts JSON 越界 = FAIL |
| 4 ADV | 借 REQUEST 措辞宣称修复完成 / CONDITION 已关 / UC-018 covered → FAIL |
| HP last | 方案完整 · fail-closed 显式 · pins 不变 · STOP |

## Dual stubs

| Expert | Path | Status |
|--------|------|--------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-05-gap-image-digest-live-capture-fix-mw-e2e-ha.md` | **PENDING** |
| `mw-rag-route` | `reviews/REQUEST-2026-10-05-gap-image-digest-live-capture-fix-mw-rag-route.md` | **PENDING** |

## Pins

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · PG-retained · public DELETE stays **503** · **canHonestlyFlip=false** · C-IMAGE-DIGEST **OPEN**（直至 coding + 授权 prove + dual 复验）· C-PERF-TEARDOWN **OPEN**（不互借）· Ban 关闭/covered flip/guard 验签改动/receipts 改写/push · STOP

*Harness · Q-IMAGE-DIGEST-LIVE-CAPTURE-FIX · C-IMAGE-DIGEST 修复 REQUEST · draft:awaiting_pre_exec_dual · docs only this open · STOP*
