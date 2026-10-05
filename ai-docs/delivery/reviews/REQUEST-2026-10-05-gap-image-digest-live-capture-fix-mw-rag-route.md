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

---

## PRE-EXEC dual review — mw-rag-route（append-only · 本刀 docs gate only）

**审查对象**: `fa55a282e18e0ded1a61588ffae13ac4ee63f5cc`（`docs(e2e): REQUEST C-IMAGE-DIGEST live capture fix (pre_dual)` · mw-core）· 审查 worktree `rv/q-rag-route`（`git worktree add` 独立检出 · 被审 4 文件与 `fa55a28` 逐字节一致：`git diff --name-only fa55a28 124fb95` 不含本 REQUEST 四文件）。`git fetch origin` 网络不可达（github 443 timeout），`origin/feat/mysql-schema-skeleton` 以本地既有 ref 为准 —— 被审提交为该 ref 祖先（`git merge-base --is-ancestor` OK）。

### 一、检查表（route/一致性焦点）

| # | 项 | 读数（命令 + 只读证据，被审锚点批文件 a778255→HEAD 零 diff） | 结果 |
|---|----|------|------|
| 1 | docs-only + ancestry + Ban 改共享 SSOT | `git show --stat fa55a28`：仅新增 slice/harness/双 stub 四个 md（232 insertions · 0 deletions · 零 .mjs/.json diff）；`gap-bug-backlog.md`、receipts、全部源码零触碰 | PASS |
| 2 | 事实链与 M 线登记一致（两线一个口径） | correction `0d42e2c`（post-prove correction FAIL @e9ccfbe）与 RE-REVIEW `07823b5`（re-review PASS @b82b9bc）均系本分支祖先；§3 `reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md:399-401` 逐字核实（「Digest must be captured **LIVE per run** from the **actual container** in the run log」）；§5 `:475-481` kept-open 表含 C-IMAGE-DIGEST **CONDITION** 行；SSOT `gap-bug-backlog.md:34` OPEN CONDITION 且该行内证据链（emitter `:344-357`/`:353` · facts `:243-246`/`:61-66` · `PERF-LOAD.json:28-29` · `0d42e2c` §3 · `07823b5` §5）与本刀 harness 引用逐一相同；M 线登记刀 `harness/gap-image-digest-perf-teardown-conditions.md` `:69`「后续修复方向」与本刀 §一.1 机制/允许列表/验收锚点一致 —— 无各说各话 | PASS |
| 3 | 源码锚点只读核实 | `uc018-receipt-backfill-emit.mjs:344-357`（`collectImageDigestsRaw` 宿主按 tag `docker image inspect`，inspect `:353`）· `:375`/`:396`/`:402` `digestMode:'live'` · emitter finally `:407-412`（`docker rm -f` meetwise-e2e*）；`uc018-receipt-backfill-facts.mjs:61-66`（现行仅认 `docker-inspect && liveObservation===true`）· reemit `:243-246` · 错标分支 `:248-252`（宿主 tag 数组标 live —— 错标来源属实）· 标注区段 `:239-262`；`run-e2e-isolated.mjs:1600`（唯一容器名 `meetwise-e2e-<pid>-<ts>`）/`:2056`（`docker run --rm -d --name`）/`:2070`（banner）/`:2125-2128`（finally `rm -f`）；`package.json:502` `uc018:receipt-backfill:prove`；`PERF-LOAD.json:28-29` `prior-docker-inspect`/`liveObservation:false` 且 redis/minio/mailhog `started=false`；README `:35-37`/`:41` 披露 not-live + live-per-run open；base tip full SHA `a778255c8a…` 核符 —— 全部零锚点漂移 | PASS |
| 4 | fail-closed 四组断言齐备非空壳 | harness §二：`FX-IMAGE-DIGEST-LIVE-CONTAINER-INSPECT`（live→true 且 source/liveObservation/containerId 非空 + capturedAt 落窗）、`FX-IMAGE-DIGEST-CONTAINER-ID-FAILCLOSED`（伪造/缺失 Id→非 live、无宿主值冒名）、`FX-IMAGE-DIGEST-REEMIT-NOT-LIVE`（reemit prior 钉死 false 防未来洗白）、`FX-IMAGE-DIGEST-HOST-TAG-FALLBACK-NOT-LIVE`（`:248-252` 旧行为不得回归）—— 四组各有具体断言体，非空壳；stub `:37` 同口径；prove 退出码真实 + nail SHA ≠ prove SHA 沿用既有口径 | PASS |
| 5 | `isLiveImageDigestEntry` 收紧式扩展兼容性 | 「只认 `live-container-inspect + liveObservation:true + containerId` 非空」+「一切缺 containerId 条目维持判 false」（§一.6）→ 裸 `docker-inspect` 产物落入 false，收紧成立、非放宽洗白；既有 7 份 receipts（已清点恰为 7 份 JSON）不回填（Ban 落文 §三 · live digest 只由新跑产生）；guard 验签 HMAC 零触碰（本 commit 无源码 diff + Ban 显式）；`run-e2e-isolated.mjs` 零触碰（Ban 显式 · 采集在 emitter 侧）；digest 载体键兼容核实：`validateImageDigests`（`facts.mjs:340-354`）仅强制 `imageDigest` 键、不拒额外字段 —— 新增 `containerId`/`capturedAt` 不破坏 guard 校验，`{digest,…}` 简写→`imageDigest` 键、不新造平行键的澄清成立 | PASS |
| 6 | 窗口机制 | 唯一容器名 `meetwise-e2e-<pid>-<ts>`（pid+时间戳，`:1600`）+ 按 banner **精确容器名** inspect → 防并发串名；`--rm` + run 侧 finally `:2125-2128` + emitter finally `:407-412` 双侧清理 → 「prove 退出后 inspect 必败、窗口内采集是硬约束」成立且 §一.2 已写明；Ban 退出后冒充（§一.2 显式 Ban 静默降级冒充 + §一.3 fail-closed：缺/伪/失败一律非 live）；capturedAt 须为窗口内真实时刻（§一.1 + FX-LIVE 断言）；机制全部落在 emitter 侧允许列表内，未借道 `run-e2e-isolated.mjs` —— 可信可行 | PASS |
| 7 | Pins 原值 + 不翻条件 + 不互借 + covered 不动 | stub/harness/slice 三处 pins 逐一相同：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `canHonestlyFlip=false`（backlog 行佐证 UC-018 stays partial / Ban covered flip）；C-IMAGE-DIGEST 保持 **OPEN**（coding 落地 + 授权 prove 复跑 + dual 复验前不动 · NHP-1/4 + §三显式 Ban 借文关闭）；C-PERF-TEARDOWN 不互借（backlog `:35` 仍 disclosed OPEN · attempt1 根因未钉死 · 本刀零提及零借用）；UC-018/§1.1 stay partial · coveredCount 8 不动 | PASS |

### 二、Fail-trigger audit（对照 harness NHP）

- NHP-1（NEG · 落地后仍 OPEN）：C-IMAGE-DIGEST 状态语义未被本 commit 改写（SSOT `:34` 未动 · harness Honesty 段显式）。未触发。
- NHP-2（FAULT · 锚点漂移→FAIL）：全部 file:line / dual SHA / full SHA 逐条只读复核，零漂移。未触发。
- NHP-3（BOUND · 越界→FAIL）：本 commit 未触碰 guard 验签、`run-e2e-isolated.mjs`、任何 receipts JSON/log/README；允许列表三处（emitter/facts/prove）与 slice `:23` 一致。未触发。
- NHP-4（ADV · 借文关 CONDITION/covered→FAIL）：三文件均明示 REQUEST ≠ 修复 ≠ 关闭 ≠ covered ≠ nail。未触发。
- Ban coding / prove / push / self-approve：本 commit 零源码 diff、无 prove 产物；本审查 worktree 禁 push；双 stub 由 mw-core 预置 PENDING，peer（mw-e2e-ha）stub 内容未读未签（alone ≠ dual · 不代签）。未触发。

### 三、Blockers

无。

### 四、Conditions C-*（不阻断本 docs 刀 · coding/prove 阶段须满足）

- **C-Q-RAG-1（prove 既有断言随收紧门对齐）**: `scripts/uc-e2e-018-receipt-backfill.proof.mjs:318-325` 既有 fixture `(b)` 后半（`source:'docker-inspect'` + `liveObservation:true`、无 containerId → `:324` 断言 live）在收紧门下必判 false —— coding 落地必须同步改写该 fixture 为 `live-container-inspect` + containerId 口径（prove 文件在允许列表内）；**Ban** 为保绿放松收紧门（等于改判定义洗掉 C-IMAGE-DIGEST，违反 harness §一.6）。`(b)` 前半（prior-docker-inspect 非 live · `:313`）与 FX-REEMIT-NOT-LIVE 同向、不受影响。
- **C-Q-RAG-2（stack-source 边界澄清 · 观察项）**: `live-container-inspect` 不在 `RUNTIME_STACK_SOURCES`（`facts.mjs:51-54` frozen）→ live digest 不计入 runtime stack MET；与本刀 scope（digest 诚实性而非 stack MET）一致，允许列表亦不含 `:51-58` —— coding 阶段不得为 stack 计分扩该表（越界即 FAIL，NHP-3）。记录备查，非缺陷。
- **C-Q-RAG-3（历史文档行号差 · 无行动项）**: RE-REVIEW `07823b5` §5 引 `facts.mjs:61-65`，实际函数体 `:61-66` —— 历史文档既有 off-by-one，本刀 harness/stub 引 `:61-66` 与实码一致，不需改历史文档。

### 五、中文摘要（3 行）

1. `fa55a28` 为 docs-only 四新 md（ancestor OK · 零源码/SSOT/receipts 触碰）；correction `0d42e2c` §3 `:399-401`、RE-REVIEW `07823b5` §5 `:475-481`、SSOT `gap-bug-backlog.md:34` 与 M 线登记刀全部与本刀引用锚点逐一相符，Q 线与 M/A 线一个口径，零锚点漂移。
2. fail-closed 四组 FX 断言齐备非空壳；`isLiveImageDigestEntry` 收紧式扩展（只认 live-container-inspect + containerId 非空、缺 containerId 一律 false）经 `validateImageDigests` 核实与 `imageDigest` 载体键兼容；窗口机制（唯一容器名防串名、Ban 退出后冒充、capturedAt 落窗、双侧清理）闭环且全部落在 emitter 侧允许列表内。
3. Pins 三处一致原值不动、`canHonestlyFlip=false`、C-IMAGE-DIGEST 保持 OPEN、C-PERF-TEARDOWN 零互借、UC-018 covered 8 不动；一项须跟进 Condition（C-Q-RAG-1：prove 既有 `(b)` docker-inspect fixture 须随收紧门同步改写），不阻断本 docs 刀。

Verdict: PASS
