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

# POST-PROVE dual 审查段 · mw-rag-route（LIVE digest 采集修复复验 @ `8b07308`）

**审查对象**: `line/q-image-digest-live` tip **`8b07308`**（`8b0730831e717caf61f4ce0d3edaef124ec5f209` · author mw-core）· 恰 3 文件 +544/−22
**审查方式**: 独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-qp-rag-route`（分支 `rv/qp-rag-route`）· 只读核验 + 单次 fresh re-run + append-only 本段
**角色声明**: 本段为 `mw-rag-route` **单签（alone）**，**alone ≠ dual**，不代签 `mw-e2e-ha`；dual 是否成立由协调方裁定。

## 1. 包完整性核验 @ `8b07308`

- `git show --numstat`：恰 3 文件 —— emitter `scripts/uc018-receipt-backfill-emit.mjs` +154/−6 · facts `scripts/lib/uc018-receipt-backfill-facts.mjs` +156/−13 · prove `scripts/uc-e2e-018-receipt-backfill.proof.mjs` +234/−3，合计 +544/−22 ✓ 与包描述一致。
- guard（HMAC）`scripts/uc018-receipt-backfill-guard.mjs` 零 diff ✓；`scripts/run-e2e-isolated.mjs` 零 diff ✓；既有 7 份 receipts（`ai-docs/delivery/receipts/uc018-receipt-backfill/` ADV/FULL-E2E/GRAPH/PERF-LOAD/SOLE/TTL/UI.json）零 diff ✓；SSOT `ai-docs/delivery/gap-bug-backlog.md` 零 diff ✓；`package.json` 零改动（prove 复用 `:502` 既有 CMD）✓。
- **C-Q-RAG-2 核验**：`RUNTIME_STACK_SOURCES`（facts `:51-54`，数组仅 `'log-parse'`/`'docker-inspect'`）零改动 ✓；diff 中仅新增注释「'live-container-inspect' is deliberately NOT added to RUNTIME_STACK_SOURCES」与新常量 `LIVE_CONTAINER_INSPECT_SOURCE`（`facts:66`，**未入列**）——live 不计 stack MET 的边界保持，未越界（FX-SOURCE-PINS 亦有同向断言）。

## 2. C-Q-RAG-1 裁决：**成立（PASS）**

- fixture (b)（`uc-e2e-018-receipt-backfill.proof.mjs:312-350`）已同步改写为 `live-container-inspect`+containerId 口径：**旧错标条目保留且断言翻非 live** —— `legacyMislabel`（`docker-inspect`/`liveObservation:true`/无 containerId，`:330`）断言为 `!isLiveImageDigestEntry(legacyMislabel)` → pass（`:336-339`），非删除；`(a)` 与 `(b)-prior` 原样保留；`:325` 注释明示「rewritten to the tightened semantics, not deleted or weakened」。
- prove diff 的 −3 行恰为旧错标正向断言 `if (isLiveImageDigestEntry(live)) pass('(b) live docker-inspect still live')` 的移除，由收紧式三例组（prior 非 live / 错标非 live / live-container-inspect+containerId 为 live，`:344-350`）替代 —— 旧断言语义被纠正而非削弱。
- 全文件 grep（skip/todo/.only/relax/loosen/weaken/吞错放行等模式）无「为保绿放松收紧门」迹象；命中行均为 fail-closed 语义（exit=1 → backfill-failed 等）。
- facts 侧收紧门一致：`isLiveImageDigestEntry`（`facts:149-157`）仅认 `source==='live-container-inspect' && liveObservation===true && containerId 非空`；`isValidLiveCaptureRecord`（`:123-139`）入库前重验（containerId 64-hex、ISO capturedAt、running）；reemit 模式忽略 liveCaptures（无 run 窗口即无 live）；失败采集显式 `live-container-inspect-failed`/`imageDigest='unobserved'`，宿主值不冒名；宿主 tag inspect 降级 `host-tag-inspect-fallback`/`liveObservation:false`，错标分支（旧 `facts:248-252`）已移除（FX-SOURCE-PINS 源级断言）。

## 3. M/A/Q 线口径一致性（逐锚比对）：**一致**

| 锚点 | 实文核对 | 本刀引用处 |
|---|---|---|
| correction dual `0d42e2c` §3 → `reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md:399-401`（「Digest must be captured **LIVE per run** from the **actual container** in the run log」） | ✓ 实文一致 | 本 REQUEST `:28` · harness `gap-image-digest-live-capture-fix.md:7/:17/:28/:31` · slice `:8` |
| RE-REVIEW `07823b5` §5 `:475-481` C-IMAGE-DIGEST kept open（CONDITION · prior-docker-inspect · isLiveImageDigestEntry 拒之 · Not closed on prose） | ✓ 实文一致 | 同上各处 |
| SSOT `ai-docs/delivery/gap-bug-backlog.md:34`（C-IMAGE-DIGEST 行 · **OPEN** CONDITION · prior-docker-inspect is not live） | ✓ `:34` 恰为该行 | 同上各处 |
| M 线登记刀 `harness/gap-image-digest-perf-teardown-conditions.md`「后续修复方向」第一条（run log 解析实际容器 → 容器仍存活窗口内 `docker inspect` → capturedAt 绑定 run 窗口 → 允许列表 emitter+facts） | ✓ 与本刀实现逐点吻合 | — |

## 4. Fresh re-run（单次 · 未重试）

- `pnpm install --frozen-lockfile` EXIT=0（pnpm 10.18.0 / node 22.22.3，独立 worktree）。
- `pnpm uc018:receipt-backfill:prove` **恰好运行一次**：**EXIT=0 · 58 PASS / 0 FAIL**，与包声称（58/58）一致；输出含 `FX-IMAGE-DIGEST-LIVE-CONTAINER-INSPECT`（含 unstarted 保持 not-started）、`FX-IMAGE-DIGEST-CONTAINER-ID-FAILCLOSED`（4 项）、`FX-IMAGE-DIGEST-REEMIT-NOT-LIVE`（含伪造 capture 亦不可翻转）、`FX-IMAGE-DIGEST-HOST-TAG-FALLBACK-NOT-LIVE`、`FX-SOURCE-PINS` 5 项全部 PASS。运行后 `git status` 零输出（无残留物）。
- 独立复核（node 直读）：7 份已入库 receipts 过新收紧门 → 全部 **0 live entries**（sources 仍 prior-docker-inspect/log-parse），零回填 ✓；`PERF-LOAD.json:26-30` 原状（prior-docker-inspect/liveObservation:false）✓。

## 5. 条件裁决表（pre-exec C-Q-RAG-1~3）

| 条件 | 裁决 | 依据 |
|---|---|---|
| C-Q-RAG-1（fixture (b) 收紧式改写 · 无放松门） | **解除（PASS）** | §2：旧错标条目保留断言翻非 live；−3 行恰为旧错标断言；grep 无放松 |
| C-Q-RAG-2（RUNTIME_STACK_SOURCES frozen · live 不计 stack MET） | **解除（PASS）** | §1：`facts:51-54` 零改动；live-container-inspect 未入列；越界即 FAIL 的红线未触碰 |
| C-Q-RAG-3（条件纪律：C-IMAGE-DIGEST OPEN · 不互借 · covered 不动 · pins 原值） | **解除（PASS）** | §6：C-IMAGE-DIGEST 保持 OPEN；C-PERF-TEARDOWN 本刀 3 文件零提及；UC-018/§1.1 partial、coveredCount=8 不动；docs/SSOT/receipts 零 diff |

## 6. Pins 复核（原值不动）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · Stack **PG-retained** · public DELETE stays **503** · canHonestlyFlip=**false** · UC-018/§1.1 stay **partial** · **C-IMAGE-DIGEST 保持 OPEN**（本刀=代码+prove 侧修复落地；「真实 emit 全链路落得 live 三要素才算实证闭合」的 e2e-ha 侧条件，本审认可状态判定权在协调方）· **C-PERF-TEARDOWN OPEN**（不同 scope，不互借）· guard 验签语义/HMAC 零触碰 · UC-018 covered 不动。

## Blockers

无。

## Conditions

- **解除**：C-Q-RAG-1 / C-Q-RAG-2 / C-Q-RAG-3（见 §5 表）。
- **保持 OPEN**：C-IMAGE-DIGEST（后续由 SSOT 对齐刀处理，非本审文本可关）· C-PERF-TEARDOWN（不同 scope）。
- 残留提示（非 blocker）：本审 prove 为合成 fixture 侧验证；真实 `uc018:receipt-backfill:emit` 全链路产生 live 三要素（source=`live-container-inspect`/`liveObservation=true`/非空 `containerId`）的实证归属协调方/e2e-ha 侧判定，本审不据此关闭任何条件。

## 中文三行摘要

- 包完整性全绿：恰 3 文件 +544/−22；guard、`run-e2e-isolated.mjs`、7 份 receipts、SSOT、`RUNTIME_STACK_SOURCES`（facts `:51-54`）零改动，C-Q-RAG-2 的 stack MET 边界未越。
- fixture (b) 收紧式改写成立：旧错标条目保留且断言翻非 live、非删除，全文件无放松迹象；三锚点（correction `0d42e2c` §3 / RE-REVIEW `07823b5` §5 / backlog `:34`）与 M 线口径逐字一致。
- fresh re-run 单次 EXIT=0（58 PASS/0 FAIL，未重试）；C-Q-RAG-1~3 全部解除，C-IMAGE-DIGEST/C-PERF-TEARDOWN 保持 OPEN，pins 原值、canHonestlyFlip=false；本审 alone 单签，dual 由协调方裁定。

Verdict: PASS
