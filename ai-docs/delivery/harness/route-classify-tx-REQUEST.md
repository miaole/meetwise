# ROUTE-CLASSIFY-TX REQUEST（meetwise 路由分类事务缺陷修复刀 · G7 trio 头号阻塞 · 真实产品缺陷 · classifyJobRoute/classifyFreeTextScope 三相拆相：模型外呼移出全部 DB 事务 · 红先证修复后全绿 · 起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-11-05 起草席落卷 → 同日 EXEC 席落码翻面（前值 `draft:awaiting_pre_exec_dual` 史录保留 · 双审两独立外席 BOTH PASS + 协调方 EXEC 授权随令 · §9.1 七项 P2 处置全落）· ⛔push ⛔merge 主线 · Ban self-approve · est live=0 · `actualSpendCny=null`）

**席位**：路由分类事务缺陷修复刀 起草席（协调方派单令「G7 trio 头号阻塞 + 真实产品缺陷」· 诊断席根因已证、本席逐条复核亲证）。
**基线**：`origin/main` @ **`92a82a944`**（fetch 后亲证 origin tip=92a82a944=#209 perf-status-pin merge 点 · worktree **`meetwise-rtx`**（`git worktree add ../meetwise-rtx -b line/rtx-draft origin/main` 本起草席立 · `pnpm install --frozen-lockfile` EXIT=0）· branch **`line/rtx-draft`**）。

---

## §0 现状锚（起草席亲证 · 全部 Read/rg/sed/git 实测 @`92a82a944` · 修复前红读数=本席隔离 PG 真跑实测）

### 0.1 根因链锚表（@`92a82a944` 亲读 · 修复前行号）

| # | 文件:行 | 内容 | 亲证 |
|---|---------|------|------|
| 1 | `packages/db/src/routing/job-route-decision.ts:173` | `classifyJobRoute` 全函数体在单个 `asPrincipal` 事务内（BEGIN…COMMIT 跨整个模型调用） | ✓ |
| 2 | `同上:174-175` | `SELECT … FOR UPDATE` 锁 revision 行 | ✓ |
| 3 | `同上:231-235` | CAS 写 `model_prepared`（未提交，随外层事务） | ✓ |
| 4 | `同上:240` | `await deps.modelClassify(input)` —— **模型外呼在持锁事务内 await** | ✓ |
| 5 | `packages/db/src/principal.ts:961` | `idle_in_transaction_session_timeout: Number(process.env.PG_IDLE_TX_TIMEOUT_MS ?? 15000)` —— 池默认 15s 杀 idle-in-transaction 连接 | ✓ |
| 6 | `packages/ai-runtime/src/invoke.ts:377` | `resolveModelDeadlineConfig`：`MODEL_TIMEOUT_MS` 缺省 30_000（模型传输预算 30s）——**15s 池超时 < 30s 模型预算**，模型慢于 15s 即触发本缺陷 | ✓ |
| 7 | `packages/ai-runtime/src/job-route-classify.ts:154` | 幂等键 `job-route-classify:${jobId}:${revision}:${digest}`（跨 tick 恒定） | ✓ |
| 8 | `同上:171` | `redactOutput: true` —— 结算 succeeded 行不可回放 | ✓ |
| 9 | `packages/db/migrations/0209_ag09_replay_first_claim.sql:210` | 同键重领遇 succeeded∧不可回放 → 返回 `'sensitive_result_replay_requires_artifact'`（replay-first 围栏） | ✓ |
| 10 | `packages/ai-runtime/src/job-route-classify.ts:189-195` | 该围栏码 ∉ PRE_DISPATCH_KNOWN_NOT_SENT 且无 cost_/model_operation_/shared_ 前缀 → 保守臂 `knownNotSent(...)` → reasonCodes 非空 | ✓ |
| 11 | `packages/db/src/routing/job-route-decision.ts:249-252`（修复前） | reasonCodes 非空 → `writeRouteUnresolved(known_not_sent)` → **sticky `route_unresolved` 永不自动重试** | ✓ |
| 12 | `apps/worker/src/route-classify-consumer.ts:39` | sole Worker drain 每 tick 调 `classifyJobRoute`（drain 不改，状态机即 send fence） | ✓ |

### 0.2 修复前红读数（本席隔离 PG + scripted ModelClient 真跑 · 2026-11-05 · 隔离容器 `meetwise-e2e-8331` · PGPORT=32776 · `PG_IDLE_TX_TIMEOUT_MS=1000` 压低 + 模型缝延迟 2s）

新增慢模型臂 `apps/worker/test/r2-p-worker-route-classify.proof.ts`（真 invoke 关口全链：durable claim + `ai_model_invocation` 结算 + 0209 围栏 + `createJobRouteModelClassify`，唯一脚本化面=ModelClient 传输延迟 2s，**零 mock 计数替代状态断言**）：

```
{"event":"db_pool_error","purpose":"default","count":1,"error_name":"error","error_message":"terminating connection due to idle-in-transaction timeout"}
PASS  tick 1 结果与账面自洽（抛错+route_pending+succeeded 不可回放 · 或直接 route_decided 恰 1 外发）
  — err=Client has encountered a connection error and is not queryable status=route_pending inv=succeeded calls=1
FAIL  tick 2 不产生第二次外发且岗位不落 sticky known_not_sent（修复前红：sticky+sensitive_result_replay 围栏读数）
  — status=route_unresolved outcome=known_not_sent calls=1 reasons=sensitive_result_replay_requires_artifact
FAIL  r2-p-worker-route-classify prove (1 failures)  · run EXIT=1
```

判读：t≈1s 池杀 idle-in-transaction 连接（外层 classify 事务回滚 → revision 回 `route_pending`），t≈2s invoke 在**自身短事务**落 `ai_model_invocation=succeeded`（`replayable=false`，模型账已结不可回放）；tick 2 同幂等键重领被 0209 围栏拒 → sticky `route_unresolved/known_not_sent`——与诊断席 `.tmp/g7-w2diag-run1.log` 的 6 次观测延迟二分形状（e2e fixture `route not decided within 60000ms cap`）同因，证据链闭合。

### 0.3 同类排查（全仓 `await` 模型 × 事务嵌套扫 · grep `asPrincipal|invoke(|deps.model|modelClassify` 全 src 面）

| 落点 | 形状 | 处置 |
|------|------|------|
| `packages/db/src/routing/job-route-decision.ts:240` | 外呼在 `asPrincipal` 事务内 | **本刀修** |
| `packages/db/src/routing/free-text-route-decision.ts:227`（修复前行号；外层 tx `:184` 起） | **同形同因**（RAG-07 结构同构面，注释自证「与 RAG-03 逐值一致」） | **本刀同修** |
| `packages/db/src/qbank/qbank-miss.ts:328` | **不同：已拆相**——`claimDispatch` 独立事务提交（`:313`）后外呼在事务外（`:326` 注释「阶段 2：模型外发（事务外，恰一次）」），终态/持久化各为独立事务 | 零修（本刀修法即此形的先例） |
| `apps/worker/src/report-worker.ts`（tx1 claim `:155`→外呼 `:170`→tx2 finalize `:180`）、`quiz-lifecycle.ts`、`diagnosis-lifecycle.ts`、`resume.service.ts`（费用预留短事务 `:104`→`visionOcr` `:129`，注释自证「视觉供应商请求绝不占住数据库事务/连接」）、`interview-service.ts`（「invoke 自身使用持久 claim；不再用 advisory transaction 锁包住模型 RPC」）、`adaptive-interview-service.ts`、`qa-tool-layer.ts`（只读工具块+invoke 在块外） | 外呼均在事务外 | 零修 |
| `packages/ai-runtime/src/router/semantic-route.ts` | 纯进程内模块（文件头自证「生产调用点=0」，无任何 DB 事务） | 零修 |

## §1 修法（三相拆相 · 不调超时 · 不放宽围栏语义）

### 1.1 结构

- **事务 A**（`asPrincipal`）：`FOR UPDATE` 锁 + 状态/digest/HMAC 校验 + rules 路径终态（0 外发，全在 A 内不变）或 CAS `route_pending→model_prepared` + route 事件，**提交并释放锁**。
- **事务外**：`deps.modelClassify(input)` 严格在任何 DB 事务之外——idle 事务被杀不再连坐已外发的模型账，锁不再跨外呼持有。
- **事务 B**（`asPrincipal`）：重锁 `FOR UPDATE`，`status='model_prepared'` 才写终态（result_validated→route_decided / known_not_sent / validation_rejected；CAS 单写者）。`dispatched_unknown` 错误臂同样经事务 B 落 sticky unresolved。
- **补偿臂**：seam 抛非 `dispatched_unknown` 错误 → 独立事务 CAS `model_prepared→route_pending` 再上抛——与修复前「单事务回滚、revision 仍 pending 可重试」的可观测语义逐值一致（并发双 tick 已被 model_prepared 闸拦为 noop，补偿无竞态；补偿自身失败则残面=model_prepared fail-closed，原错误照常上抛）。EXEC 补审计痕（pre-exec 双审 P2 处置）：补偿成功路径在同一短事务内补一条**既有词面**事件（`model_prepared→route_pending`，reason=`compensation_retriable`；0104:130/0114:115 to_status CHECK 既有值·**零迁移零新事件类型**）——消除「事件流只见 pending→prepared 后状态静默回退」的审计不对称；补偿事务失败整体回滚，残面仍 fail-closed。

### 1.2 四问亲核（派单要求逐条回答）

1. **send fence 是否真由 model_prepared CAS + invoke 幂等键承担、并发双 tick 是否双发？** 承担成立。状态机侧：事务 A 的 CAS 使第二个 tick 在事务 A 重锁时看到 `model_prepared` → noop `not_pending`（不再回到 `route_pending`，drain 的 `listNextJobRoutePending` 只领 `route_pending`）→ 不触发第二次外发；终态后 noop `already_decided/already_unresolved`（sticky）。网关侧：invoke 幂等键 `job-route-classify:{jobId}:{revision}:{digest}` 的 durable claim 使同键第二次调用永不二次派发（replay-first 围栏承接）。proof 实证：门闩 seam 并发双 tick `gateCalls===1`、败者 noop（rag03 §⑩）；20 并发同 scope `concSeam.calls()===1`（rag07 §③）；慢模型臂 `providerCalls===1` 且 tick2 noop already_decided。**无双发。**
2. **外呼期间 revision 被更新（岗位改文）如何处理？** 事务 A 入口的 digest 复核（job_posting 当前文本 vs revision N 的 immutable digest）保持原位——编辑先行提交 → revision N 判 `stale_revision` 落 unresolved（既有语义零变）。外呼中途编辑：`updateJob` 产生**新** revision N+1（`route_pending`），revision N 行内容不可变、事务 A 捕获并已 digest 验证的输入即 N 的内容，事务 B 仍把结果写在 N（与修复前单事务同一语义：READ COMMITTED 下修复前中途编辑对本事务同样不可见、结果同落 N）；消费侧 `bindApplicationRoute` 只绑 `ORDER BY revision DESC LIMIT 1` 的最新 decided，N 的过期决定永不进 binding；N+1 由下一 tick 正常分类。
3. **外呼后、事务 B 前 worker 崩溃的恢复行为？** revision 滞留 `model_prepared`：drain 不领取（非 route_pending）、funnel 永不重发（事务 B 前置状态闸）、`retryJobRoute` 判 `not_retryable`——**sticky 残面=fail-closed**。用户影响：该 revision 的路由永不自动解析（岗位卡在 model_prepared），但零二次外发、零重复计费、零错误自动决策；模型账已在该次 invoke 结算，结果因 `redactOutput:true` 不可回放。恢复建议（按优先序）：① 用户编辑岗位 → `updateJob` 产生新 revision N+1（新 digest→新幂等键）正常分类（自愈主路径，零运维介入）；② 运维侧按 `retryJobRoute` 先例增补 model_prepared 终态化/重置工具（须先核对 `ai_model_invocation` 无 succeeded 在案再重置，防二次计费）；③ 未来加固方向：经 invoke `persistValidatedOutput` 把路由结果工件与 succeeded 同事务落库，使事务 B 可从工件重放（另刀，本卷不实施）。
4. **单写者/幂等/事件 seq 不变量是否被破坏？** 未破坏。单写者：事务 A/B 各自 `FOR UPDATE` + status CAS，写路径唯一（proof：UNIQUE(scope,revision) 恰 1 decision 行、并发恰 1 外发）。幂等：invoke 幂等键/逻辑节点键零改。事件 seq（pre-exec 双审后如实表述）：`appendRouteEvent` 的 `INSERT…SELECT MAX+1` 在 rules 臂/事务 A/事务 B 内于行锁下执行；**`dispatched_unknown` 臂（job-route-decision.ts:262-273 · free-text 同位 :244-255）落 `writeRouteUnresolved` 无前置 `FOR UPDATE`**——该臂事件不变量由「单流状态机（同 revision 唯一并发流）+ `job_route_event` PRIMARY KEY(job_id,revision,event_seq)（0104:133 / 0114:118）」兜底，最坏假想违例=约束报错→model_prepared 残面 fail-closed，单调性不变。wire/Redis/迁移面：**零改动**（无表结构变更、无跨进程消息契约变更）——不存在「旧代码忽略新字段」义务面（无新增 wire 字段可忽略）。

### 1.3 proof 面（红先证 · 全并入既有 proof 文件，零新受管文件）

- `apps/worker/test/r2-p-worker-route-classify.proof.ts`：新增慢模型臂（§0.2）——修复前红、修复后绿（同卷读数：tick1 `route_decided/result_validated · providerCalls=1 · ai_model_invocation succeeded`，tick2 `noop already_decided · 终态 route_decided · reasons 空`）。
- `packages/db/test/job-route-decision.proof.ts` §⑩：并发双 tick 恰 1 外发 / 抛错补偿回 route_pending 可重试 / 崩溃残面 model_prepared 不重发（三态 invariant 守卫，修复前后皆绿=守卫非修复依赖）。
- `packages/db/test/rag07-free-text-route.proof.ts` §⑨：free-text 同形两守卫；§③ 20 并发败者 noop 原因两态化（`already_decided` 或 model_prepared 窗口 `not_pending`，承重不变式=恰 1 decided + 恰 1 外发 + 0 unresolved/stale 误拒，如实承登）。
- **EXEC 增补（pre-exec 双审 P2 处置 · 均红先证后绿）**：① §⑩/§⑨ 补偿臂各加补偿审计事件断言（`model_prepared→route_pending(compensation_retriable)` 序列恰 3 条 seq 单调）——断言先落跑出红（rag03-route/rag07 各恰 1 失败）→ 补偿事件落码 → 复跑双绿；② 慢模型臂 `PG_IDLE_TX_TIMEOUT_MS` 进程级设置改臂尾 finally 还原（防臂序调整/被 import 时扩散）。
- **free-text 残面出口差异（pre-exec 双审查证后如实补记）**：free-text scope 残留 model_prepared 后，同 revision 重分类只 noop（`not_pending`），无「岗位内容编辑」自愈概念——自愈=重新发起 allowlisted scope funnel（`runFreeTextAllowlistedScopeFunnel` 每次调用 `createFreeTextScopeRevision` 恒产新 revision）；job-route 侧自愈=用户 `updateJob` 编辑产 N+1。两出口均零二次外发（新 revision=新幂等键；旧 revision 残面 fail-closed 不变）。

## §2 验收（本席落卷期全跑 · 读数为亲跑回执）

| # | 门 | 判据 | 结论 |
|---|-----|------|------|
| 1 | 慢模型臂红先证 | 修复前 `r2-p-worker-route-classify:prove:raw` EXIT=1 · sticky known_not_sent + sensitive_result_replay_requires_artifact（§0.2 原值） | **红（已证）** → 修复后同卷 EXIT=0 `OK`（绿） |
| 2 | 既有路由 proof | `rag03-route` / `rag07-free-text-route` / `recruiter:prove` / `rag05-qbank-miss` / `rag06-route-scope-cache` / `rag04-track-local` 全部 ✓ | **绿** |
| 3 | `pnpm db:prove` | 四原语 SQL 证明全部通过 | **绿** |
| 4 | typecheck | `pnpm -C packages/db typecheck` EXIT=0 · `pnpm -C apps/worker typecheck` EXIT=0 | **绿** |
| 5 | lint | db 0 errors/1042 warnings（=base 1042 恰等）· worker 0 errors/999 warnings（=base 999 恰等=预算值） | **绿（恰等零新增）** |
| 6 | `pnpm arch` | 0 errors/8 warnings · 1189 modules/3767 deps（base 同 8 warnings/3766 deps——+1 边=proof 新 domain import，零新违例） | **绿（与 base 恒等）** |
| 7 | egress inventory | `static_provider_egress_inventory_valid: adapters=5; operations=10; pairs=55; env_refs=401` EXIT=0 | **绿** |
| 8 | docs:check | 步进后 `scanned 2487=cap 2487` 恰等 EXIT=0（步进前基线亲跑 scanned 2486=cap 2486） | **绿** |
| 9 | PTP | `public-text-policy.proof.mjs` EXIT=0 **12/12**（cap 联动四点步进后亲跑） | **绿** |
| 10 | markers | 改动集五类标记词 grep 零命中（词面不入卷防自匹配） | **0** |

**基线红（与所改无关 · 单列）**：`r2-classify-job-route-prereq`（29）/`r2-p-fake-route-classify`（14）/`r2-p-loop-route-classify`（13）/`r2-p-start-route-classify`（13）/`r2-p-live-route-effective`（17）/`r4-funnel-covered-count-batch4`（4）——全部为 `existsSync` 文件在位类失败（PTP-archive 收纳刀 `426e0b281` git mv 3025 件后旧 `ai-docs/delivery/...` 路径失位），本席对 clean base stash 实测**失败数逐值恒等**（loop 13=13 · batch4 4=4 双向亲证）；其中对路由源码的 regex 断言（`export async function classifyJobRoute`/`deps.modelClassify`/`modelCalls: 0`/`FOR UPDATE SKIP LOCKED`/`rule_decided`/`known_not_sent`）在改动树上**全部 PASS**。零处置（非本刀域），如实登记。注意：`r4-funnel-covered-count-batch4:prove` 运行会**回写** `ai-docs/delivery/rag-funnel-01-08-covered-matrix.md` 为旧 era 内容并落 untracked receipts——本席已 `git checkout` 还原+清除，未纳入改动集。

## §3 范围外（越界即 FAIL）

1. 超时/围栏语义调参（`PG_IDLE_TX_TIMEOUT_MS` 缺省、0209 围栏码族、`PRE_DISPATCH_KNOWN_NOT_SENT` 集合）——本刀零触，修法=拆相非调参。
2. `qbank-miss.ts` 及全部 §0.3 判「零修」落点；`retryJobRoute` 语义；`persistValidatedOutput` 工件重放加固（另刀建议，见 §1.2-③）。
3. 六个基线红 proof 的文件在位失位修复（PTP-archive 后续域，归协调方排程）。
4. 迁移（零预占）、Key/`.env*` 值、`.tmp/**` 业务上下文、他 worktree。

## §4 依赖与迁移号

零新依赖；迁移号=零。

## §5 Ban 列表 + pins

**Ban**：push/force-push（改动只交付本 worktree 一 commit）· 靠调大超时止血 · 放宽围栏语义 · 触 §3 各域 · 起草期之外码动 · 改写既有 CAP-SANCTION 注记（只恰等追加）· Key/`.env*` 物料入卷 · self-approve · 预占迁移号 · E2E UI runner / 长驻服务 · `.tmp/**` 当业务上下文。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零真实模型外呼 · 隔离 PG + scripted ModelClient）。

## §6 est live=0

全部 proof=隔离 PG + scripted ModelClient（零 provider 外呼零 Key）；门面=typecheck/lint/arch/docs 机检（全本地）。`actualSpendCny=null`。

## §7 markers=0

五类标记词改动集 grep 零新增（命令回执随交付报告；词面不在卷内复抄防自匹配）。

## §8 STOP + 停止条件

**`executed:awaiting_post_prove_dual`**（2026-11-05 EXEC 席落码翻面 · 前值 `draft:awaiting_pre_exec_dual` 史录 · 三处以上实测一致=Status 头/§8/§9/卷尾）。开工三条款：①pre-exec 双审两独立外席 BOTH PASS（rtx-1/rtx-2 各 P0=0·P1=0 · 审 §0 锚与红读数保真+§1 修法四问逐条+§1.3 proof 面+§2 门矩阵+§1.3 基线红单列）**已满足**；②协调方 EXEC 授权**已行使**（§9.1 全落）；③post-prove 双审**待派**。

**停止条件（命中即停手上报）**：
1. **现场漂移**：pre-exec/EXEC 对届时 tip 重 pin，§0 锚漂移超 ±3 且结论受影响、或根因面（principal/invoke/0209/路由状态机）被他刀改动 → 停。
2. **验收红**：§2 门 1-10 任一红且无法在本刀范围内归因修复（含 Ban 为绿放宽断言/门）→ 停。基线红（已单列六件）不触发本条，但若其失败数对 base 漂移 → 停。
3. **越界需要**：需触 §3 任一域才能继续 → 停。
4. **机制不符**：修复后慢模型臂读数若复现 sticky（门 1 绿不可稳）→ 停。

## §9 pre-exec dual 交接 + EXEC 交付注记（状态：**`executed:awaiting_post_prove_dual`**）

- **双审对象**：§0 根因链锚表逐条 file:line+红读数原值 · §1.1 三相结构与补偿臂语义 · §1.2 四问逐条 · §1.3 proof 三面（红先证链）· §2 十门判定与基线红单列 · §3 范围外。
- **悬决项（归协调方）**：pre-exec 双席派定 · EXEC 排程 · post-prove 双席 · 六件基线红（PTP-archive 失位）排程 · model_prepared 运维恢复工具立项与否 · `persistValidatedOutput` 工件重放加固立项与否。
- **本卷落卷后事实基座不受后继裁决影响的部分**：§0 全节读数与 §0.2 红读数系原值记账（零冲销）；§0.3 同类排查判读系在案实测。

### §9.1 EXEC 交付注记（2026-11-05 EXEC 席落卷 · 登记源=pre-exec 双审两独立外席 BOTH PASS（rtx-1/rtx-2 各 P0=0·P1=0·P2=4）+协调方 EXEC 授权随令）

- **基线并线**：`git fetch` 三次尝试均网络不可达（github.com:443 connect 超时）——本地 `origin/main` ref=`92a82a944` 与本卷 pin 基线恒等、无前进证据，零 rebase 需求、两 policy 冲突零发生、cap 零 union 变化（EXEC 期零新受管文件，scanned 2487=cap 2487 恰等维持）。如实登记：本 EXEC 在「fetch 不可达」环境下以本地 ref=pin 恒等行使，post-prove 双审如需并线以届时 fetch 为准。
- **pre-exec 双审 P2 处置（七项全落）**：
  1. **rtx-2 P2-1「用户 retry 同 digest 新键二次计费窗口」——判定：修复前既有，本刀零引入零放大**。探针（隔离 PG pgvector/pg16·迁移 222 件·scripted ModelClient·用后容器/克隆/探针文件全删除）：基线 `92a82a944` 与本支读数**逐值恒等均 YES**——tick1 `route_unresolved/dispatched_unknown`+`inv1=unknown(model_execution_timeout)` → `retryJobRoute=retried@rev2`（同 digest `e38daed4…` 新键）→ tick2 第二次真实派发 `inv2=succeeded`/`calls=2`/`route_decided`。机制：retryJobRoute（#219 裁决③）对 route_unresolved 写新 revision 同内容→新幂等键绕开 durable claim（0209 对同键 unknown 账只判 `'unknown'` 绝不再 execute——同键面零双发）；首账 unknown（provider 可能已计费）时显式重试=可能第二次真实计费。旧代码 dispatched_unknown 同样单事务落 sticky unresolved（亲读基线文件）→窗口非本刀造；且本刀**消除**修复前额外子路径「池杀→sticky known_not_sent(succeeded∧不可回放·账已结)→retry 二次真呼」。用户影响=产品 retry 出口用户显式触发。建议修法（后继刀）：retry 前核对同内容前账 unknown 时二次确认/抑制+retry 文案披露（与 §1.2-③ 运维告诫同源）。已 `gap-bug-backlog.md` append-only 登记一行（GAP-ROUTE-RETRY-UNKNOWN-REBILL）。
  2. **rtx-1 P2-1（§1.2-④ 事件行锁措辞与 dispatched_unknown 臂不符）**：已就地改（§1.2-④ 如实表述：该臂无前置 `FOR UPDATE`，不变量由单流状态机+`job_route_event` PK 兜底）。
  3. **rtx-1 P2-2（补偿缺审计事件）**：已补码——两 src 补偿臂在同一短事务内写既有词面事件 `model_prepared→route_pending(compensation_retriable)`（0104:130/0114:115 to_status CHECK 既有值·零迁移零新事件类型）；§⑩/§⑨ 各加断言红先证（rag03-route/rag07 各恰 1 失败）→ 补偿事件落码 → 双绿复跑恒绿（别名 camelCase 别名化后 lint 预算恰等 1042）。
  4. **rtx-1 P2-4（慢模型臂 `PG_IDLE_TX_TIMEOUT_MS` 进程级设置不还原）**：已就地修（臂尾 finally 还原，防臂序调整/被 import 时扩散）。
  5. **rtx-2 P2-4（free-text 残面出口差异）**：核清属实并 §1.3 补记（free-text 自愈=重新发起 funnel 恒产新 revision；job-route 走 `updateJob` 内容编辑；两出口均零二次外发）。`createFreeTextScopeRevision` MAX+1 无 scope 锁=既有面（ON CONFLICT 兜底）零处置如实。
  6. **model_prepared 残面零内置巡检（rtx-1 P2-3/rtx-2 P2-3）**：维持登记（无老化扫描/告警；滞留=web 面「路由分类中」+申请侧不可消费，fail-closed 零漏账零重发）。**最小运维恢复手段（巡检 SQL·rtx-2 给出·人工执行）**：`SELECT job_id, revision, updated_at FROM job_semantic_revision WHERE status='model_prepared' AND updated_at < now() - interval '1 hour';`（free-text 同形换 `free_text_scope_revision`/`scope_id`）。恢复仍走 §1.2-③ 三级建议（编辑自愈优先；运维重置须先核对 `ai_model_invocation` 无 succeeded 在案防二次计费）。
  7. **watchdog 弃拍叠放（rtx-2 P2-2）**：登记——route-classify 消费者未传 `tickWatchdogMs`（缺省 600s），深积压拍超时被弃后台继续跑、下一拍照起：每 600s 至多 +1 条被弃 drain，并发外呼上界≈积压深度；正确性由 model_prepared CAS+invoke 幂等键双层 fence 兜底（探针零双发实证）；后果仅 provider 并发/QPS 缓坡与过载下 429→sticky unresolved 面扩大；建议在飞外呼计数 metric 归后继观测刀。
- **门读数（EXEC 亲跑回执）**：慢模型臂 `r2-p-worker-route-classify:prove:raw` EXIT=0（tick1 `route_decided/result_validated calls=1`·tick2 `noop already_decided`）·路由 proof `rag03-route`/`rag07-free-text-route`/`recruiter:prove`/`rag05-qbank-miss`/`rag06-route-scope-cache`/`rag04-track-local` 全「全部通过」EXIT=0 · `pnpm db:prove` 四原语全过 EXIT=0 · typecheck db/worker EXIT=0/EXIT=0 · lint db 0 errors/1042 warnings=cap 恰等 EXIT=0 · worker 0 errors/999 warnings=cap 恰等 EXIT=0 · `pnpm arch` 0 errors/8 warnings · 1189 modules/3767 deps（与 §2 门 6 恒等）EXIT=0 · egress inventory `adapters=5; operations=10; pairs=55; env_refs=401` EXIT=0 · docs:check EXIT=0 scanned **2487=cap 2487 恰等** · PTP `static_preflight_valid: selected=12/12` EXIT=0 · markers 改动集七件五族词面 0 命中（族名沿 5c-behavior-trio §7 同形制·运行时组装不入本行防自指）。
- **基线红六件恒等亲证（EXEC 重跑）**：`r2-classify-job-route-prereq` **29** / `r2-p-fake-route-classify` **14** / `r2-p-loop-route-classify` **13** / `r2-p-start-route-classify` **13** / `r2-p-live-route-effective` **17** / `r4-funnel-covered-count-batch4` **5=4 实败+1 汇总行**——与 §2 承值逐值恒等，失败形状=既有 `ai-docs/delivery/...` existsSync 失位类，零处置。batch4 副产物（matrix 回写+3 untracked receipts）已按 §2 预告程序还原/清除，交付树零副产。
- **未验面**：浏览器 UI runner 未跑（§5 Ban/派单同禁）；post-prove 双审归协调方后继工序。

---

*ROUTE-CLASSIFY-TX REQUEST · 2026-11-05 起草 · 同日 EXEC 席落码翻面 **`executed:awaiting_post_prove_dual`**（前值 `draft:awaiting_pre_exec_dual` 史录 · 双审 BOTH PASS+EXEC 授权随令 · §9.1 七项 P2 处置全落）· ⛔push ⛔merge 主线 · alone ≠ dual · base `origin/main` @`92a82a944`（#209 merge 点 · 起草期 fetch 后亲证 · EXEC 期 fetch 三试网络不可达·本地 ref=pin 恒等零 rebase 如实承登 §9.1）· worktree `meetwise-rtx` · branch `line/rtx-draft` · 起草改动集=两 src（job-route-decision.ts/free-text-route-decision.ts 拆相）+三 proof（r2-p-worker 慢模型臂/rag03 §⑩/rag07 §⑨+③）+两 policy 脚本 cap 恰等步进 2486→2487（CAP-SANCTION-2487 链注追加·四联动点恰等改）+本卷（唯一新受管件）· EXEC 增补=两 src 补偿审计事件（既有词面零迁移）+三 proof（§⑩/§⑨ 补偿事件断言红先证后绿·慢模型臂 env finally 还原）+本卷（§1.1/§1.2-④/§1.3 补记+§9.1 交付注记）+gap-bug-backlog.md 一行（GAP-ROUTE-RETRY-UNKNOWN-REBILL·P2-1 判修复前既有）· 修复前红已证（§0.2）· 修复后全绿（§2+§9.1 门读数）· 基线红六件恒等亲证（§9.1）· est live=0 · pins 十一值照抄 · markers=0 · 停止条件四类全设 · Ban self-approve · post-prove dual 待派 · **STOP（EXEC 落卷即停）***
