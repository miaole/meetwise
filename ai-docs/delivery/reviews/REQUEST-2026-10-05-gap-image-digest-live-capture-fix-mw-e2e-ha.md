# REQUEST — **Q-IMAGE-DIGEST-LIVE-CAPTURE-FIX**（C-IMAGE-DIGEST 修复刀 · LIVE per-run digest 采集）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Expert**: `mw-e2e-ha`
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

---

# POST-PROVE dual（LIVE digest 采集修复复验）· mw-e2e-ha · 2026-10-05

**Status**: **POST-PROVE DUAL COMPLETE**（独立 worktree `rv/qp-e2e-ha` @ tip `8b07308` · author mw-e2e-ha · alone ≠ dual · 不代签 mw-rag-route）
**对象**: `line/q-image-digest-live` tip `8b0730831e717caf61f4ce0d3edaef124ec5f209`（parent `526b4bc7e91ed977a94380f44a6533d121f3e33b` REQUEST）
**审法**: 只认命令 + EXIT + 可复现证据；本审未复用实现方任何输出作为判据，全部机检在审方 worktree 独立复跑。

## 1. Fresh re-run（C-DUAL-FROM-FRESH）

| CMD（审方 worktree，`pnpm install --frozen-lockfile` 后恰一次） | EXIT | 结果 |
|---|---|---|
| `pnpm uc018:receipt-backfill:prove` | **0** | **58 PASS / 0 FAIL**，单次运行，无重试 |

与实现方声称（EXIT=0 · 58 PASS/0 FAIL 单次）**一致**——非重大发现。

**两形态如实记录**：fresh prove 输出走 **fixture/source-pin 路径**——prove 本身不启动 docker，输出中**无** `E2E isolated PostgreSQL` banner、无真实容器 Id/digest 出现；live 采集的"真实 docker 窗口内路径"由 (a) 源码级 `FX-SOURCE-PINS`（流式 spawn + banner 观察 + 宿主 fallback 保留）钉住，(b) 审方独立 seam 实测：以符合 `meetwise-e2e-<pid>-<ts>` 形态的容器名启动一次性运行态容器，跑 emitter 同款 `docker inspect --format '{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.State.Running}}'`，把**真实输出**喂入 `parseContainerInspectOutput → isValidLiveCaptureRecord → buildImageDigests(mode:'live')`，得 `source=live-container-inspect · isLive=true · digest=sha256:7b822b0a… · containerId=fafb1791… · capturedAt=ISO 落当前时刻`——真实 docker inspect 输出与解析管道的 seam 通畅，且 digest `sha256:7b822b0a…` 与实现方 scratch clone 声称独立吻合（同一本地 `pgvector/pgvector:pg16`）。非运行态容器（Running=false）经 `isValidLiveCaptureRecord` 判 false，不冒充 live。

## 2. 包完整性（vs parent `526b4bc`）

| 项 | 结果 |
|---|---|
| 恰 3 文件 | **PASS** — `uc018-receipt-backfill-emit.mjs` (+154/−6) · `lib/uc018-receipt-backfill-facts.mjs` (+156/−13) · `uc-e2e-018-receipt-backfill.proof.mjs` (+234/−3)；合计 +544/−22 |
| guard（HMAC）零 diff | **PASS** |
| `run-e2e-isolated.mjs` 零 diff | **PASS** |
| 既有 7 份 receipts JSON + README + log 零 diff | **PASS**（整个 `ai-docs/` 0 文件变更） |
| package.json / pnpm-lock 零 diff | **PASS** |
| SSOT 零 diff | **PASS** |
| `RUNTIME_STACK_SOURCES`（facts `:51-54`）零改动 | **PASS** — diff hunk 始于 `:57`，frozen 数组未触碰；仅新增注释与 `live-container-inspect` 常量（live 不计 stack MET，`FX-SOURCE-PINS` 亦断言） |

## 3. 机检（审方独立执行）

| 检查 | 结果 |
|---|---|
| `node --check` emit / facts / proof | **PASS**（三文件语法通过） |
| FX-IMAGE-DIGEST-LIVE-CONTAINER-INSPECT 实读 | **PASS** — 合法窗口内 capture → `source=live-container-inspect · liveObservation=true · isLive=true`，digest 非 host fallback 值、`capturedAt` 落 `[runStartedAt, runEndedAt]` 窗口、不继承 `priorCapturedAt`；未启动服务保持诚实 `not-started` |
| FX-IMAGE-DIGEST-CONTAINER-ID-FAILCLOSED 实读 | **PASS** — 伪造（`deadbeef`）/缺失 containerId → `live-container-inspect-failed · imageDigest=unobserved · isLive=false`，host 值不冒充；inspect 空输出/垃圾输出解析 fail-closed；gate 拒空/缺 containerId；capture 记录校验只收 64-hex |
| FX-IMAGE-DIGEST-REEMIT-NOT-LIVE 实读 | **PASS** — reemit 模式即使传入完好 capture 仍 `prior-docker-inspect · isLive=false`（reemit 无 run 窗口，capture 即伪造） |
| FX-IMAGE-DIGEST-HOST-TAG-FALLBACK-NOT-LIVE 实读 | **PASS** — 无 capture 时宿主 tag 读数 `host-tag-inspect-fallback · isLive=false`，诚实保留 digest 值 |
| fixture (b) 改写方向 | **PASS（收紧）** — 旧合成 `docker-inspect + liveObservation:true` 无 containerId 条目**保留**且断言**翻为非 live**（收紧门，非放松）；新 live fixture 须 `live-container-inspect + containerId`；(a) static-doc 门与 (b)-prior 门原样保留 |
| 审方对抗探针（node 直调，只读） | **PASS** — banner 名 `meetwise-e2e-999-1000-extra` / 非数字 pid / 异池名均 `trusted:false`（精确名 `^meetwise-e2e-\d+-\d+$` 防串名）；`running=false` / 非 ISO `capturedAt` → capture 记录无效；对未启动服务注入 capture 仍 `not-started` |

## 4. 条件裁决（pre-exec C-1~C-4 逐条）

| 条件 | 内容 | 裁决 | 证据 |
|---|---|---|---|
| C-1 | 流式窗口内采集 + 精确名防串名 + Ban 退出后冒充 | **PASS** | `runProveStreaming`（spawn 逐行 onLine）→ `observeProveLineForLiveDigest` banner 命中即同步 `docker inspect`（子进程存活窗口内，结构保证）；`RUN_CONTAINER_NAME_RE` 精确名 + 审方串名探针全拒；`.State.Running===true` 硬校验 + 容器消失时 inspect 必败 → 失败进 attempts 台账，不冒充 |
| C-2 | 收紧门 + fixture 共改 | **PASS** | `isLiveImageDigestEntry` 三要素（source/liveObservation/containerId 非空）；旧错标分支 `:248-252` 移除（源码 pin 断言无 `source='docker-inspect'` 赋值残留）；fixture (b) 收紧方向改写、(a)/(b)-prior 未删未削弱；4 组 FX + 5 项 FX-SOURCE-PINS 齐备且全过 |
| C-3 | 无 banner cmd 诚实非 live + 禁伪造 | **PASS** | 无 banner → `liveCaptureAttempts` 空 → `host-tag-inspect-fallback`/`not-started`/`unpinned` 诚实非 live；失败尝试逐条 `recordAttempt` 落 `attempts.jsonl`；fresh prove 本身即诚实形态实证（无 banner 场景下 0 FAIL、零伪 live 声明） |
| C-4 | capturedAt 落窗 | **PASS** | `capturedAt` 在 onLine 回调同步 inspect 时刻打点（容器存活即落窗，by construction）+ `ISO_TS_RE` 校验 + FX 断言窗口包含；审方 seam 实测 ISO 时刻落当前运行窗 |

## 5. Blockers / Conditions

**Blockers**: 无。

**Conditions**:
1. prove 契约本体为 fixture/source-pin harness——真实 docker 窗口内采集路径不被 `pnpm uc018:receipt-backfill:prove` 直接执行；其可信度由源码 pin + 审方 seam 实测 + 实现方 scratch E2E 声称三重支撑。**下一次真实 emit（run-e2e-isolated 全链路）落得 `live-container-inspect · containerId · capturedAt` 才算 C-IMAGE-DIGEST 实证闭合**；在此之前 CONDITION 状态判定权在协调方，本审只判代码与 prove 诚实性。
2. emitter 真实端到端（banner 命中 → 窗口内 inspect → receipt 落盘）本审未全链路重放（恰一次 prove 约束 + 不污染既有 receipts）；seam 已实测，剩余风险为组装层（`buildReceiptBody` 接线已实读核对：`liveCaptures: liveCaptureAttempts` 传入 mode:'live'，失败也全量进账）。
3. `git worktree` 探针容器已 `docker rm -f` 清理，无残留。

## 6. 中文三行摘要

1. 独立 fresh re-run `pnpm uc018:receipt-backfill:prove` 恰一次 EXIT=0（58 PASS/0 FAIL），与实现方一致；prove 走 fixture/source-pin 形态，真实 docker seam 由审方以一次性容器实测打通（真实 inspect 输出 → isLive=true，digest `sha256:7b822b0a…` 与实现方声称独立吻合）。
2. 包恰 3 文件 +544/−22，guard/`run-e2e-isolated`/receipts/package/SSOT/RUNTIME_STACK_SOURCES 全零 diff；4 组 FX 断言逐条实读方向正确，fixture (b) 为收紧式改写，(a)/(b)-prior 未削弱，串名/伪造/退出后冒充探针全 fail-closed。
3. C-1~C-4 全 PASS，无 Blockers；真实 emit 全链路落得 `live-container-inspect + containerId + capturedAt` 前 C-IMAGE-DIGEST 不视为实证闭合；本审不代签 mw-rag-route（alone ≠ dual）。

Verdict: PASS
