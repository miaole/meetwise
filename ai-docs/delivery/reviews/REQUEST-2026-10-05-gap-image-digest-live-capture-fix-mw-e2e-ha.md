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

# PRE-EXEC dual · Q-IMAGE-DIGEST-LIVE-CAPTURE-FIX · mw-e2e-ha（docs gate only · Ban prove · Ban coding · Ban product edit · Ban 改共享 SSOT）

**被审 REQUEST**: `fa55a282e18e0ded1a61588ffae13ac4ee63f5cc`（`docs(e2e): REQUEST C-IMAGE-DIGEST live capture fix (pre_dual)`，origin 上）
**审查基线**: origin/feat/mysql-schema-skeleton（`fa55a28` 经 `git merge-base --is-ancestor fa55a28 HEAD` 验证为祖先，ANCESTOR_OK）。
**docs-only 验证**: `git show --stat fa55a28` = 4 文件 / +232 / -0，全部位于 `ai-docs/delivery/`（slice · harness · 两份 expert stub）；零产品代码、零 proof、零 emitter/facts/guard diff、零 SSOT（`gap-bug-backlog.md` 未触碰）、零 receipts 改动。
**审查者**: mw-e2e-ha（adversarial evidence-honesty · 独立审 · alone ≠ dual · 不代签 mw-rag-route · 本段仅 docs gate）。
**Reviewer worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-q-e2e-ha` @ `d89aaf3`（`rv/q-e2e-ha`）；基线 `a778255..d89aaf3` 区间 `scripts/`、`package.json` 零 diff（`git diff --stat a778255..HEAD -- scripts/ package.json` 为空），故全部源码锚点读数即 `a778255` 读数。
**审查方法**: 只读静态核验（`git show`/`sed`/`grep` + EXIT 确认），非交付 prove receipt；未跑任何 prove。

## 检查表（file:line 证据，全部在本 worktree 实读核验）

| # | 审查项 | 证据 | 结论 |
|---|--------|------|------|
| 1 | docs-only、祖先关系 | `git show --stat fa55a28`（4 文件 +232/-0 全 docs）；`merge-base --is-ancestor` OK | ✅ |
| 2 | 现状事实（宿主 tag inspect 冒充 live） | `scripts/uc018-receipt-backfill-emit.mjs:344-357`（`collectImageDigestsRaw`，四宿主 tag）· inspect `:353` `docker image inspect <tag> --format '{{json .RepoDigests}}'` · `:375` `imageDigestsPre` · `:396` prove 后 merge · `:402` `digestMode:'live'`（`:385` install-fail 路径同） | ✅ 与 harness Gap 表逐条相符 |
| 3 | facts 错标分支 | `scripts/lib/uc018-receipt-backfill-facts.mjs:248-252`（`priorDigestStr && mode==='live'` → `docker-inspect`/`liveObservation=true`/`capturedAt`）—— 宿主数组被标 live 的直接来源，属实 | ✅ |
| 4 | reemit 沿用 prior | `facts.mjs:243-246`（`mode==='reemit'` → `prior-docker-inspect`/`liveObservation=false`/`priorCapturedAt`）属实 | ✅ |
| 5 | LIVE 判定门 | `facts.mjs:61-66` `isLiveImageDigestEntry`：`liveObservation===false`/`prior-docker-inspect` 判 false，仅认 `docker-inspect && liveObservation===true`；已入库条目判 false 属实 | ✅ |
| 6 | 已入库回执与披露 | `receipts/uc018-receipt-backfill/PERF-LOAD.json:28-29`（`prior-docker-inspect`/`liveObservation:false`，digest `sha256:ccc6e83d…fb4d6b`，cite logLine 37）；README `:35-37`+`:41` 披露 not-live/CONDITION 未关；回执 JSON 恰 7 份（ADV/FULL-E2E/GRAPH/PERF-LOAD/SOLE/TTL/UI） | ✅ |
| 7 | SSOT 登记 | `gap-bug-backlog.md:34` C-IMAGE-DIGEST **OPEN** CONDITION，evidence chain 指向 `0d42e2c`/`07823b5` 与本刀引用一致 | ✅ |
| 8 | CONDITION 出处 | `0d42e2c` 存在（`git cat-file` + `%s` = post-prove correction FAIL）；其 review 文件 `:399-401`「Digest must be captured **LIVE per run** from the **actual container** in the run log」实读在位；RE-REVIEW `07823b5` 存在，`§5 :475-481` Conditions kept open 含 C-IMAGE-DIGEST 行实读在位；M 线登记 `harness/gap-image-digest-perf-teardown-conditions.md` 存在 | ✅ 无锚点漂移（NHP FAULT 未触发） |
| 9 | 容器生命周期硬约束（前提真实性） | `run-e2e-isolated.mjs:1600`（`meetwise-e2e-${pid}-${Date.now()}`）· `:2056`（`docker run --rm -d --name`）· `:2070` banner · `:2125-2128` finally `docker rm -f`（`:2127`）；emitter finally `:407-412`（`:411` `docker rm -f` 过滤 meetwise-e2e/meetwise-uc018）—— 「prove 退出后 inspect 必败」前提**核实为真** | ✅ |
| 10 | 采集窗口机制（见下专节裁决） | banner 实际流入 emitter 捕获流：`logs/PERF-LOAD-b29c191.log:37` 含 `E2E isolated PostgreSQL: meetwise-e2e-1857918-1790224698505 on 127.0.0.1:33018`；6 份 committed log 均含该 banner；`package.json:126-127` `uc018:perf-load:prove` → `run-e2e-isolated` 接线属实 | ✅ 可信且可行（附 C-1/C-3） |
| 11 | fail-closed 四组断言 | harness §二 `:51-60`：`FX-IMAGE-DIGEST-LIVE-CONTAINER-INSPECT`（live 产物 `isLive=true`+`source='live-container-inspect'`+`liveObservation===true`+`containerId` 非空+`capturedAt` 在 run 窗口）/ `FX-IMAGE-DIGEST-CONTAINER-ID-FAILCLOSED`（伪造+缺失 → 非 live、无宿主值冒名、诚实记失败）/ `FX-IMAGE-DIGEST-REEMIT-NOT-LIVE` / `FX-IMAGE-DIGEST-HOST-TAG-FALLBACK-NOT-LIVE`（`:248-252` 旧分支不得回归）—— 四组齐备且方向全为 fail-closed | ✅ |
| 12 | `isLiveImageDigestEntry` 收紧式扩展向后兼容 | harness §一.6：新增仅认 `live-container-inspect && liveObservation===true && containerId` 非空；prior/宿主 fallback/not-started/unpinned/unobserved 及缺 containerId 条目维持 false；§一.8 + Ban 既有 7 份 receipts 不回填改写——既有条目在任何读法下仍 false，向后兼容成立（附 C-2 读法澄清） | ✅ |
| 13 | guard 验签零触碰 / `run-e2e-isolated.mjs` 零触碰 | harness §三 Ban `:70`（GAP-HMAC 语义零改动）· `:72`（Ban 碰 run-e2e-isolated，采集在 emitter 侧）；`fa55a28` diff 实证未触任何脚本 | ✅ |
| 14 | digest 载体键兼容 | harness §一.1 Schema 澄清：保留 `imageDigest` 键承载 live 容器 digest、另加 `containerId`，**不**新造平行键——guard/evaluator 按既有键读取，兼容 | ✅ |
| 15 | Pins 原值 + canHonestlyFlip=false | harness `:8`/`:97` · slice `:4` · stub `:4`/`:12-24` 逐字一致：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE stays 503 · canHonestlyFlip=false · UC-018/§1.1 stay partial | ✅ |
| 16 | C-IMAGE-DIGEST 保持 OPEN / C-PERF-TEARDOWN 不互借 / UC-018 covered 不动 | harness `:75`（Ban 本 REQUEST 文本关闭 C-IMAGE-DIGEST，关闭只能在 coding+授权 prove+dual 复验后）· `:73`（Ban 借刀关 C-PERF-TEARDOWN）· `:74`（Ban covered flip，coveredCount=8 不动）· stub `:23-24` · slice `:25` | ✅ |
| 17 | alone ≠ dual / 不代签 | 本段只签 mw-e2e-ha；`REQUEST-…-mw-rag-route.md` 保持 PENDING 原状未被触碰 | ✅ |

## 窗口内采集机制裁决（本刀成立前提 · 重点裁定）

**裁决：机制可信且在 `--rm` 生命周期内可行；REQUEST 无须改方案即可进入 coding。** 依据（全部实测）：

1. **前提为真**：run 容器 `docker run --rm`（`run-e2e-isolated.mjs:2056`）+ finally `docker rm -f`（`:2125-2128`）+ emitter finally 兜底清理（`:407-412`）——prove 子进程退出后对 run 容器 `docker inspect` 必然失败。实现方自报的难题成立，不是借口。
2. **banner 确实流入 emitter 捕获流**：`uc018:perf-load:prove`（`package.json:126`）→ `node scripts/run-e2e-isolated.mjs …`，banner 由 run-e2e-isolated 自身 `console.log`（`:2070`）打印到其 stdout → pnpm → emitter `sh()` 捕获的 prove stdout；committed `logs/PERF-LOAD-b29c191.log:37` 实读含完整 banner + 唯一容器名，6 份 committed log 均含 banner。容器名即 run log 中实际容器标识，解析源存在且唯一（`pid-timestamp` 天然防并发串名）。
3. **窗口足够宽**：banner 在容器已就绪（`waitForPostgres` 通过）后打印，容器存活至 run-e2e-isolated finally 清理为止——窗口 = 整个测试运行期（分钟级），「观察 banner 即刻 inspect」落在窗口内绰绰有余；即使容器中途自毁（`--rm` 语义），§一.3 fail-closed 兜住。
4. **现实现的唯一缺口已被 REQUEST 显式列为 coding 契约**：emitter 现用 `sh()`=`spawnSync`（`uc018-receipt-backfill-emit.mjs:39-44`、`:389`）缓冲捕获，输出仅在进程退出后可得——**今天的 emitter 无法在窗口内观察 banner**。REQUEST §一.2 已明文要求「实现须在 emitter 侧于 run 窗口内观察子进程输出 / banner 行并即刻 inspect，或等效的窗口内采集机制」并 Ban 把退出后 inspect 失败静默降级为宿主 tag 冒充 live。改流式管道/轮询属 emitter digest 采集范围（允许列表内），不触碰 `run-e2e-isolated.mjs`。机制写清、可行、无更诚实的替代出口被隐瞒。
5. **无 banner 的 cmd 不受骗**：不经 `run-e2e-isolated` 的 prove（如 `uc018:sole:prove` `package.json:120`、`uc018:receipt-backfill:prove` `:502`）不启动容器 → §一.7 维持诚实非 live 条目，方案无越权伪造面。

## Fail-trigger audit（逐项排查，均未触发）

- 锚点漂移（NHP FAULT #2）→ 无：上表 #2-#10 全部 file:line 实读相符。
- docs commit 内夹带 coding/prove/push → 无（4 docs 文件 +232/-0）。
- 改共享 SSOT / 回执 / README → 无（`gap-bug-backlog.md`、`PERF-LOAD.json` 等 7 份、README 零 diff）。
- 借 REQUEST 措辞宣称修复完成 / CONDITION 已关 / UC-018 covered（NHP ADV #4）→ 无（harness `:11` Honesty + `:75` 显式否认；状态 `draft:awaiting_pre_exec_dual`）。
- 借刀关 C-PERF-TEARDOWN → 无（仅以不互借口径提及，harness `:73`）。
- guard HMAC 验签语义触碰 → 无（Ban `:70` + diff 实证）。
- 给宿主 fallback / reemit prior 留 live 后门 → 无（§一.4 移除/改写 `:248-252`、§一.5 reemit 不变差、FX-FALLBACK/REEMIT 双断言钉死；`liveObservation:false` 强制）。
- Pins 漂移 → 无（三份文档逐字一致，上表 #15）。
- 把 dual PASS 写成 coding 授权 → 无（harness `:3`/`:10`、slice `:3`/`:7` 显式：coding 须 pre-exec dual PASS + 协调方授权后另 commit）。

## Blockers

无。REQUEST 文档事实与源码、CONDITION 证据链、SSOT 现状全部对得上；采集窗口机制前提真实、契约可行、fail-closed 四组断言齐备。

## Conditions（C-*，coding/post-prove 阶段必须满足，非本 docs gate 的 FAIL 项）

- **C-1（窗口内采集的落地形态）**: 现行 `sh()`=`spawnSync` 缓冲捕获下「窗口内观察」不可达——coding 必须把 prove 子进程改为流式管道逐行观察（async spawn + banner 行解析后**即刻** `docker inspect` 该 banner 解析出的**精确**容器名），或等效窗口内机制。Ban：prove 退出后 inspect 失败改用宿主 tag 值冒充 live；Ban：按 name 前缀轮询可能误中并发 run 的容器（只认 banner 解析出的唯一名）；banner 后 inspect 仍失败（容器早亡）→ §一.3 fail-closed 非 live 并如实记失败原因。
- **C-2（`isLive` 收紧读法 + 既有 fixture 共改）**: harness §一.6「一切缺 containerId 的条目维持判 false」存在两种读法；若取全局严格读法（任何 `liveObservation:true` 且缺 `containerId` → false），既有合成 fixture 断言 `uc-e2e-018-receipt-backfill.proof.mjs:318-326`（`docker-inspect`+`live=true` 无 containerId → "live docker-inspect still live"）将翻红——该 prove 文件在允许列表内，coding 须在同一 commit 内诚实共改该合成用例并注明读法，**Ban** 静默删除/削弱 (a) 与 (b)-prior 断言；若取窄读法（仅新 source 要求 containerId），FX 断言仍须钉死任何 producer 路径不得给宿主/reemit 条目标 live。任一读法下 7 份已入库回执均维持 false 且不回填（§一.8）。
- **C-3（无 banner cmd 的诚实条目）**: 不经 `run-e2e-isolated` 的 prove CMD 不产生 banner——对应服务维持 `not-started`/`unobserved` 诚实条目（§一.7），**Ban** 从 tag、其他 run 的容器或任何旁路伪造 `containerId`/`liveObservation:true`。
- **C-4（capturedAt 诚实）**: live 条目 `capturedAt` 必须是 run 窗口内实际 inspect 时刻（FX-1 已断言），**Ban** 继承 `priorCapturedAt` 或以 emit 时刻冒充窗口内时刻。

## 中文三行摘要

1. `fa55a28` 纯 docs（4 文件 +232/-0，零代码零 SSOT 零回执），C-IMAGE-DIGEST 修复 REQUEST 的事实链（emitter 宿主 tag inspect `:344-357`、facts 错标分支 `:248-252`、reemit prior `:243-246`、`isLiveImageDigestEntry :61-66`、7 份回执 prior-docker-inspect、SSOT OPEN）逐条实读相符，出处 `0d42e2c` §3 与 `07823b5` §5 锚点在位，无漂移。
2. 核心裁决：`--rm`+finally 清容器的「prove 退出后 inspect 必败」前提核实为真，而 banner 确实流入 emitter 捕获流（PERF-LOAD committed log :37 实读含唯一容器名，6 份 log 在证）、窗口为分钟级——「流式观察 banner 即刻 inspect」机制可信可行，唯一缺口（现行 spawnSync 缓冲捕获）已被 REQUEST §一.2 显式列为 coding 契约并 Ban 静默降级，无需改方案；fail-closed 四组 FX 断言齐备，`isLive` 收紧式扩展向后兼容 7 份既有回执且不回填。
3. 无 Blocker；附条件 C-1 coding 必须落地流式窗口内采集且只认 banner 精确容器名、C-2 `isLive` 全局严格读法须共改既有合成 fixture（禁静默削弱）、C-3 无 banner cmd 维持诚实非 live 禁伪造 containerId、C-4 capturedAt 须为窗口内真实时刻；Pins 八项原值 + canHonestlyFlip=false，C-IMAGE-DIGEST 保持 OPEN（coding+授权 prove+dual 复验前不动）、C-PERF-TEARDOWN 不互借、UC-018 covered 不动；Verdict PASS 仅本 docs gate，不授权 coding/prove/push，不代签 mw-rag-route。

Verdict: PASS
