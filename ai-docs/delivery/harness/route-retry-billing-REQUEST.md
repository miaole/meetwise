# ROUTE-RETRY-BILLING REQUEST（meetwise 路由分类重试二次计费修复刀 · GAP-ROUTE-RETRY-UNKNOWN-REBILL · retryJobRoute 同键前账 unknown 冷却窗抑制闸 · 红先证修复后全绿 · 起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-11-06 起草席落卷 · pre-exec 双审+协调方 EXEC 授权均未行使 · ⛔push ⛔merge 主线 · Ban self-approve · est live=0 · `actualSpendCny=null`）

**席位**：路由分类重试二次计费修复刀 起草席（协调方派单令「起草并实现 · 草稿含代码 · 之后走双审」随令 · 缺陷登记源=rtx 路由分类事务刀 EXEC 期 pre-exec 双审 P2-1 · `ai-docs/delivery/gap-bug-backlog.md` GAP-ROUTE-RETRY-UNKNOWN-REBILL 行 · 机制与建议修法源=`route-classify-tx-REQUEST.md` §9.1-1）。
**基线**：`origin/main` @ **`d549a497b`**（#212 rtx merge 点 · 本 worktree `git rev-parse origin/main` 亲证=派单令文届值恒等 · fetch 两试网络不可达（HTTP2 framing layer / 443 connect 超时）· 本地 ref=令文届值恒等无前进证据零 rebase 如实承登 · worktree **`meetwise-rretry`**（`git worktree add ../meetwise-rretry -b line/rretry-draft origin/main` 本起草席立 · `pnpm install --frozen-lockfile` EXIT=0）· branch **`line/rretry-draft`** · 主仓唯一改动=建此 worktree）。

**小改记（2026-11-06 · 协调方裁定行使 · 本卷同日小改）**：裁定三件事——① 冷却窗缺省 10 分钟→**2 分钟**，保持环境变量 **`ROUTE_RETRY_UNKNOWN_COOLDOWN_MS`** 可覆盖（理由：模型传输超时 30s、超时后供应商仍在处理的情况绝大多数在两分钟内结束；一次快模型路由分类的费用极低，而让招聘方等 10 分钟才能重试，体验代价更大）；② `unknown_pending` 用户文案改说清原因与等待时间（「上一次岗位识别结果尚未确认（为避免重复计费已暂缓重发），请约 2 分钟后再试，或编辑岗位内容触发重新分类。」），前端 `JobAdminPanel` 该状态补最小处理（映射 `ok:false` 不硬刷新·避免文案被 reload 冲掉或显示成通用错误）；③ 依赖 10 分钟的 proof 断言同步调整（常量 pin 120_000·增 env 覆盖臂与 resolver 断言·窗内抑制/窗后放行/known_not_sent 不触闸/并发双击只发一次四覆盖面全保留）。环境变量按仓库约定登记（egress inventory `environment_references=405`·compose.prod.yml + api.env.example 披露）。状态保持 **`draft:awaiting_pre_exec_dual`**（小改不落 EXEC·双审与授权仍未行使）。

---

## §0 现状锚与复现（锚行号=@`d549a497b` base 亲读 · 修复前红读数=本树 base 隔离 PG 真跑实测）

### 0.1 机制锚表（@`d549a497b` 亲读）

| # | 文件:行 | 内容 | 亲证 |
|---|---------|------|------|
| 1 | `packages/ai-runtime/src/job-route-classify.ts:154` | invoke 幂等键 `job-route-classify:${jobId}:${revision}:${digest}`——revision 入键，同内容新 revision=新键 | ✓ |
| 2 | `packages/db/migrations/0209_ag09_replay_first_claim.sql:218-220` | replay-first 围栏：同键 `invocation.status='unknown'` → action=`'unknown'`（error=COALESCE 原码）——**围栏对同键 unknown 恒不再 execute；对异键无知**（异键=新行=全新派发） | ✓ |
| 3 | `packages/ai-runtime/src/invoke.ts:823` | claim action `unknown` → `deterministic_refusal` 终态（同键二次 invoke 永不再派发·`external_outcome_unknown` → seam 抛 `dispatched_unknown`） | ✓ |
| 4 | `packages/db/src/recruiting/recruiter.ts:148-166`（base） | `retryJobRoute`：latest revision=`route_unresolved` → `createJobSemanticRevision` 写**新 revision**（`route_pending`，digest 未变则同 digest）→ api 层 wakeup → drain `listNextJobRoutePending` 认领 → 走模型路径真实外发 | ✓ |
| 5 | `packages/ai-runtime/src/invoke.ts:1116-1122` | execution timeout / transient unknown → `markModelInvocationUnknown`（error=`model_execution_timeout` 等）→ `external_outcome_unknown`——**钱 unknown 待对账：provider 可能已处理并计费** | ✓ |
| 6 | `apps/worker/src/model-invocation-reconcile.ts:4-8` | 对账器「never retries or releases」：只把 stale `dispatching`→`unknown` 并冻结成本行——**unknown 恒 sticky，永不自动解除或重试** | ✓ |
| 7 | `packages/ai-runtime/src/job-route-classify.ts:185-196` | `external_outcome_unknown` → throw `dispatched_unknown` → 事务 B `writeRouteUnresolved(dispatched_unknown)` → sticky `route_unresolved` → **用户侧出现重试出口**（#219 裁决③） | ✓ |

机制一句话：首呼结果 unknown（已外发、结局未知、钱待对账）时，sticky unresolved 把用户带到显式 retry；retry 以同 digest 写新 revision → **新幂等键绕开 0209 durable claim 围栏** → 全新真实派发 → 可能的第二次真实计费。

### 0.2 修复前红读数（本树 base=`d549a497b` 隔离 PG + scripted ModelClient 真跑 · 2026-11-06 · 隔离容器 `meetwise-e2e-*-33316` · `MODEL_EXECUTION_TIMEOUT_MS=MODEL_TIMEOUT_MS=4000` 压低 + scripted 模型悬挂 9s（rtx M2 形）· 新增臂落 `apps/worker/test/r2-p-worker-route-classify.proof.ts` 重试计费闸臂）

```
PASS  tick 1 落 dispatched_unknown sticky 且账 unknown（首呼已真实外发·调用=1） — outcome=dispatched_unknown inv1=unknown(model_execution_timeout) calls=1
FAIL  同内容重试在首账 unknown 冷却窗内被抑制（修复前红：retried@rev2=第二次真实派发·二次计费窗口） — status=retried revision=2 revisions=2 calls=1
FAIL  并发双击重试零新 revision 零外发（只发一次·两路均 unknown_pending） — statuses=already_pending/already_pending revisions=2 calls=1
FAIL  同场景计费恰一次（无第二次真实外发·rev2 账不存在） — calls=2 inv2rows=1 tick2=route_unresolved
FAIL  r2-p-worker-route-classify prove (3 failures)  · run EXIT=1
```

判读：tick1 首呼已真实外发且账 unknown；用户显式 retry 被放行 `retried@rev2`（同 digest 新键 `{jobId}:2:{digest}`）；tick2 第二次真实派发发生（`calls=2`、rev2 账行已建——本探针 scripted 模型同悬挂故 inv2 亦挂 `unknown`；rtx EXEC 探针同机制读数 inv2=`succeeded`·二次真实外发=两者承重面相同）。**红→绿归因于本刀成立**（同臂修复后全绿，§2 门 1）。

## §1 修法与候选比较

### 1.1 选定修法（重试出口冷却闸 · 纯读面 · 不放宽围栏 · 不触 invoke/0088/对账器）

- `packages/db/src/recruiting/recruiter.ts`：`retryJobRoute` 在 `route_unresolved` 臂写新 revision **之前**，以 latest revision 的 digest 原式重构同键（`job-route-classify:{jobId}:{revision}:{digest}`，与 ai-runtime :154 同式——行为级由 worker proof 闸臂对读防漂：若两式漂移则闸读不到账、抑制断言红），在同事务内查 `ai_model_invocation`：`status IN ('unknown','dispatching')` 且 `updated_at >= clock_timestamp() - 冷却窗` → 返回**新枚举 `unknown_pending`**（零新 revision·零外发·零 wakeup）。`dispatching` 并入=覆盖 settle-failure 臂 `markModelInvocationUnknown` best-effort 失败行留 dispatching 的罕见窗（reconcile 120s 老化前该行同样「结果未确认」）。
- 冷却窗缺省 **`ROUTE_RETRY_UNKNOWN_COOLDOWN_MS = 2 分钟`**（2026-11-06 协调方裁定·原起草值 10 分钟据此小改·导出常量·`opts.unknownOutcomeCooldownMs` 可注入供 proof 注入小窗）；db 包 index 导出常量与 **`resolveRouteRetryUnknownCooldownMs`**（环境变量 **`ROUTE_RETRY_UNKNOWN_COOLDOWN_MS`** 同名覆盖 resolver：毫秒整数·0=关闭抑制·上限 3,600,000·非法/越界即抛 `route_retry_unknown_cooldown_invalid`·每次调用读取沿 reconcile resolver 同法）；按仓库约定登记 egress inventory（4 sources·compose.prod.yml x-cloud-runtime-env + deploymentReferences + docker/env/api.env.example 披露）。
- `packages/contracts/src/index.ts`：`JobRouteRetryResult.status` enum additive + `'unknown_pending'`（openapi.proof 既有断言 includes 面 additive 兼容）。
- `apps/web/app/recruiter/jobs/actions.ts`：`unknown_pending` 映射披露文案「上一次岗位识别结果尚未确认（为避免重复计费已暂缓重发），请约 2 分钟后再试，或编辑岗位内容触发重新分类。」——说清原因与等待时间（小改裁定稿）加两出口，不谎报已提交；映射为 **`ok:false`** 使 `JobAdminPanel.runAction` 不硬刷新（该状态零状态变化，原 `ok:true` 形会 `window.location.reload()` 冲掉文案——前端展示面小修补上）。
- `apps/api/src/modules/recruiter/recruiter.service.ts`：`unknown_pending` 原样透传（不 wakeup·零新 revision），注释补锚。
- **known_not_sent（无账或账 `failed`）不触闸照常重试**（任务书要求）；sticky 终态本体/0209 围栏/invoke 语义/对账器零字节动。

### 1.2 四问亲核（派单要求逐条）

1. **是否放宽 replay-first 围栏或 invoke 幂等面？** 否。0209/0088/invoke/对账器零字节改；闸只新增于产品 retry 出口的读面；新 revision 经新键的派发路径与修复前逐字节同形。
2. **闸读会不会与在飞 invoke 竞态？** 不可达竞态。闸仅在 latest revision=`route_unresolved` 时执行；该状态下 revision N 的 invoke 必已终态（unknown/failed/succeeded 三态之一已落账，sticky 写入在 invoke 返回之后），行锁下读值即终值；唯一例外窗=1.1 所述 settle-failure best-effort 失败行留 `dispatching`，已由闸内 `dispatching` 臂覆盖。
3. **会不会让用户永远无法重试？** 不会，三出口：① 冷却过期（缺省 2min·env 可覆盖）后 retry 照常 `retried`（proof 老化臂 `retried@rev2`+快模型走完分类实证·env 覆盖臂同形实证）；② 编辑岗位内容=新 digest 新键，自愈主路径（rtx §1.2-③）零触；③ known_not_sent/failed 完全不触闸（proof 独立臂实证）。
4. **单写者/幂等/事件/迁移面是否被破坏？** 未破坏。闸纯读零新写面；revision 单调仍由 `job_posting FOR UPDATE` 行锁（base 同法）；并发双击两路均 `unknown_pending` 零新 revision（proof 实证——修复前红读数双击一 `retried` 一 `already_pending` 且产生 rev2）；wire 面=contracts additive 枚举+web 文案（无旧端可忽略的新增必读字段）；**零迁移**。

### 1.3 候选比较（产品取舍——**需确认项见末行**）

| 候选 | 判定 | 理由 |
|------|------|------|
| C1 重试出口冷却闸（**选定**） | 采纳 | 闸在用户动作出口、读真实计费账面、保 0209 围栏全语义、三出口不阻塞（1.2-③）；改动面最小（db 一函数+contracts additive+web 文案） |
| C2 同 digest 复用幂等键（键去 revision 化） | 否决 | 同内容 retry 恒撞同键 unknown → 恒 refusal → **用户永远无法重试**（违任务书硬要求）；要解除必须动 0209 状态机放宽 unknown 臂=放宽围栏（Ban） |
| C3 invoke 派发前全局冷却（同 digest 异键 fresh unknown 即拒派） | 否决 | 影响面扩大到 funnel/编辑自愈路径（rtx 明确保留的自愈主路径会被闸住）；超出 retry 出口域 |
| C4 先对账再放行 | 否决 | 对账器语义=只把 dispatching→unknown+冻结成本，**不解歧**（unknown 无自动解除通路）；「先对账」无可实现语义 |

**冷却窗值产品取舍（需确认）**：2min（用户等待短·残余双计费窗较大）/ **10min（起草选定缺省·远大于对账老化窗 120s 与常见供应商重复处理窗·保守且可用）** / 60min（过保守·事实上逼用户改走编辑路径）。本刀按「最保守且不阻塞用户」取 10min 实现；~~窗值与 web 文案措辞为产品确认项，落 §9 悬决~~——**已裁定（2026-11-06 协调方）**：缺省改 **2 分钟**并保持环境变量覆盖（`ROUTE_RETRY_UNKNOWN_COOLDOWN_MS`），理由：模型传输超时 30s、超时后供应商仍在处理的情况绝大多数在两分钟内结束；一次快模型路由分类的费用极低，而让招聘方等 10 分钟才能重试体验代价更大；web 文案同步按裁定改为说清原因与等待时间（「请约 2 分钟后再试」）。改值实现面=一个常量 + env resolver（确认后如需再改仍只动一处缺省）。

### 1.4 proof 面（红先证 · 并入既有 proof 文件零新受管 proof）

- `apps/worker/test/r2-p-worker-route-classify.proof.ts` 新增两臂+常量 pin+env resolver 断言（全真链=真 invoke durable claim + ai_model_invocation 结算 + 0209 围栏 + `createJobRouteModelClassify`，唯一脚本化面=ModelClient）：
  - **重试计费闸臂**：§0.2 红读数（base 树亲跑 EXIT=1）→ 修复后断言绿（suppress `unknown_pending@1·revisions=1·calls=1` / 并发双击两路 `unknown_pending` 零新 revision / 老化放行 `retried@rev2` / 快模型走完分类 `route_decided·calls=2` / sticky 旧 revision 原样留存）。注：老化臂先确定性 sleep 250ms 再以注入 100ms 小窗行使（首次 30ms 无 sleep 版本竞态红过一次如实登记，已改确定性形）。**小改增环境变量覆盖臂**（第二岗位·缺省调用路径）：新缺省 2min 窗内抑制 `unknown_pending` → env `ROUTE_RETRY_UNKNOWN_COOLDOWN_MS=30` + 确定性老化 60ms 后缺省调用放行 `retried@rev2`（覆盖真实流入 SQL 窗口·非仅 opts 注入形·finally 还原 env）。
  - **known_not_sent 不触闸臂**：scripted 确定性拒绝（`{ok:false,kind:'deterministic'}`·known-not-executed）→ sticky `known_not_sent`+账 `failed` → 缺省冷却下 retry 照常 `retried@rev2` → 走完分类。
  - 常量 pin：`ROUTE_RETRY_UNKNOWN_COOLDOWN_MS === 120_000`（小改前原值 600_000）；resolver 断言：缺省回落 120000 / env 数值生效 / 非法（abc/1.5）与越界（-1/3600001）四例全抛。
- 既有臂零动（慢模型臂/stale 臂同卷绿跑原值恒等，§2 门 2 同证）。

## §2 验收（本席落卷期全跑 · 读数为亲跑回执）

| # | 门 | 判据 | 结论 |
|---|-----|------|------|
| 1 | 重试计费闸臂红先证 | base `d549a497b` EXIT=1（§0.2 原值读数·同臂同断言面）→ 修复后终码复跑 `r2-p-worker-route-classify:prove` EXIT=0 `OK`（隔离容器 PGPORT=33376·新两臂+常量 pin 全 PASS：suppress `unknown_pending@1·revisions=1·calls=1` / 双击两路 `unknown_pending` / 老化放行 `retried@rev2` / 走完分类 `route_decided·calls=2` / known_not_sent 臂 `retried@rev2→decided`） | **红（已证）→ 绿** |
| 2 | 既有路由 proof | `rag03-route` / `rag07-free-text-route` / `rag05-qbank-miss` / `rag06-route-scope-cache` / `rag04-track-local` 全「全部通过」EXIT=0；`recruiter:prove` 断言面全过·runner 收据 `outcome=passed, exitCode=0`（通过打印后 cleanup 阶段 best-effort 清理报 `interview_event_immutable` 噪声·不影响 EXIT·不影响断言面·如实登记） | **绿** |
| 3 | `pnpm db:prove` | 「四原语证明全部通过」EXIT=0 | **绿** |
| 4 | typecheck | db / worker / api / web / contracts 全 EXIT=0 | **绿** |
| 5 | lint | db **1042**/worker **999**/contracts **265**/api **1545**/web **607** warnings·0 errors=各包预算恰等零新增（初版 db +1 `naming-convention`（`semantic_digest` 列名逐字回读）与 worker +12（四处新 ModelClient 未用形参）各按文件既有 disable 注释形/去形参收敛至恰等·如实登记） | **绿（恰等）** |
| 6 | `pnpm arch` | 0 errors/8 warnings · **1191 modules/3777 deps**——本席对 base 树（八件改动 `git checkout` 还原后）亲跑同值 **恒等**（读数与 rtx 卷 1189/3767 之差系届值基线不同·非本刀引入） | **绿（与 base 恒等）** |
| 7 | egress inventory | `static_provider_egress_inventory_valid: adapters=5; operations=10; registered_consumer_source_pairs=55; environment_references=401` EXIT=0 | **绿** |
| 8 | docs:check | 步进后 `scanned 2491=cap 2491` 恰等 EXIT=0（起草前 base 亲跑 scanned 2490=cap 2490 恰等） | **绿** |
| 9 | PTP | `public-text-policy.proof.mjs` EXIT=0 `static_preflight_valid: selected=12/12`（四联动点步进后亲跑） | **绿** |
| 10 | markers | 改动集（八改+一新增·净增行 246 行）五类标记词 grep 零命中（冲突标记 0/假绿绕过词 0/测试门弱化 0/遗留标 0/secrets 样值 0；本卷 §7 族名行沿既有卷先例形非词面命中如实注） | **0** |

**小改复跑（2026-11-06 缺省 2min 裁定行使后全门重跑·本席亲跑回执）**：

| # | 门 | 小改后读数 |
|---|-----|------|
| 1 | 重试计费闸臂 | `r2-p-worker-route-classify:prove` EXIT=0 `OK`（隔离 runner·新增断言全 PASS：pin `120000` / resolver 缺省+env 数值+非法越界四例全抛 / 第二岗位缺省 2min 窗内抑制 `unknown_pending` / env `ROUTE_RETRY_UNKNOWN_COOLDOWN_MS=30` 老化放行 `retried@rev2`；窗内抑制/双击两路 unknown_pending/老化放行/走完分类/known_not_sent 臂读数原值恒等） |
| 2 | 既有路由 proof | rag03-route / rag07-free-text-route / rag05-qbank-miss / rag06-route-scope-cache / rag04-track-local 全「全部通过」EXIT=0；`recruiter:prove` 全部通过 |
| 3 | `pnpm db:prove` | 「四原语证明全部通过」EXIT=0 |
| 4/5 | typecheck/lint | db / worker / api / web / contracts 全 EXIT=0；warnings 恰等基线（db 1042/worker 999/api 1545/web 607·0 errors 零新增） |
| 6 | `pnpm arch` | 0 errors/8 warnings · 1191 modules/3777 deps（与小改前恒等） |
| 7 | egress inventory | `environment_references=405`（401+4·ROUTE_RETRY_UNKNOWN_COOLDOWN_MS 登记 db recruiter/db index/api service comment/worker proof 四 source·compose.prod.yml deploymentReferences +1）EXIT=0 |
| 8/9 | docs:check / PTP | `scanned 2491=cap 2491` 恰等（零新受管文件）；PTP `selected=12/12` EXIT=0 |
| 10 | markers | 小改改动集（九改·零新增文件）冲突标记 0 / secrets 样值 0 |

**基线红（与所改无关 · 单列）**：沿 route-classify-tx 卷 §2 单列六件（`r2-classify-job-route-prereq`/`r2-p-fake-route-classify`/`r2-p-loop-route-classify`/`r2-p-start-route-classify`/`r2-p-live-route-effective`/`r4-funnel-covered-count-batch4`·`existsSync` 文件在位失位类·PTP-archive 收纳刀既判）——本刀零处置；其失败数对 base 漂移则触 §8 停止条件 2。

## §3 范围外（越界即 FAIL）

1. **free-text funnel 重发面**：`runFreeTextAllowlistedScopeFunnel` 每次恒产新 revision（新键）同形窗口，但无用户 retry 出口（内部 allowlisted funnel 触发）——登记不修。
2. **编辑回退同 digest 残余窗**：岗位改文（rev2 新 digest）后又回退原文（rev3 digest=rev1）时，rev3 为 route_pending 走 drain 自动分类（新键）——若 rev1 前账 unknown 仍 fresh 则同窗。闸只守用户 retry 出口（任务书域）；封此窗=C3（否决理由：阻塞 rtx 保留的编辑自愈主路径）。随 §1.3 窗值确认一并产品知悉。
3. `succeeded∧不可回放`（invalid schema/validation_rejected）+ known_not_sent 的重试**不设闸**（任务书明示 known_not_sent 正常重试；该面首账已结非 unknown 歧义）。
4. 0209/0088/invoke/对账器/超时参数语义调参；`persistValidatedOutput` 工件重放加固（rtx 悬决项·另刀）。
5. 迁移（零预占）、Key/`.env*` 值、`.tmp/**` 业务上下文、他 worktree、E2E UI runner。

## §4 依赖与迁移号

零新依赖；迁移号=零。

## §5 Ban 列表 + pins

**Ban**：push/force-push（改动只交付本 worktree 一 commit）· 放宽 0209/invoke/0088 围栏语义 · 触 §3 各域 · 起草期之外码动 · 改写既有 CAP-SANCTION 注记（只恰等追加）· Key/`.env*` 物料入卷 · self-approve · 预占迁移号 · E2E UI runner / 长驻服务 · `.tmp/**` 当业务上下文 · 不用 git stash。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零真实模型外呼 · 隔离 PG + scripted ModelClient）。

## §6 est live=0

全部 proof=隔离 PG + scripted ModelClient（零 provider 外呼零 Key）；门面=typecheck/lint/arch/docs 机检（全本地）。`actualSpendCny=null`。

## §7 markers=0

五类标记词（冲突标记/假绿绕过词/测试门弱化/遗留标/secrets 样值·词面运行时组装防自指）改动集 grep 零新增（命令回执随交付报告；词面不在卷内复抄防自匹配）。

## §8 STOP + 停止条件

**`draft:awaiting_pre_exec_dual`**（2026-11-06 起草席落卷即停 · 三处以上实测一致=Status 头/§8/§9/卷尾 · pre-exec 双审两独立外席派定+协调方 EXEC 授权均未行使 · alone ≠ dual）。

**停止条件（命中即停手上报）**：
1. **现场漂移**：pre-exec/EXEC 对届时 tip 重 pin，§0 锚漂移超 ±3 且结论受影响、或根因面（retryJobRoute/invoke/0209/ai_model_invocation/路由状态机）被他刀改动 → 停。
2. **验收红**：§2 门 1-10 任一红且无法在本刀范围内归因修复（含 Ban 为绿放宽断言/门）→ 停。基线红（已单列）不触发本条，但若其失败数对 base 漂移 → 停。
3. **越界需要**：需触 §3 任一域才能继续 → 停。
4. **机制不符**：修复后闸臂若复现二次派发（门 1 绿不可稳）或 known_not_sent 被误拦 → 停。

## §9 pre-exec dual 交接（状态：**`draft:awaiting_pre_exec_dual`**）

- **双审对象**：§0 锚表逐条 file:line+红读数原值保真 · §1.1 修法结构（同键重构式与 ai-runtime :154 同式防漂）· §1.2 四问逐条 · §1.3 候选比较与窗值取舍 · §1.4 proof 面（红先证链）· §2 门矩阵与基线红单列 · §3 范围外。
- **悬决项（归协调方/产品）**：pre-exec 双席派定 · EXEC 排程 · post-prove 双席 · ~~冷却窗值（10min 缺省）与 web 文案措辞产品确认~~（**已裁定 2026-11-06**：缺省 2min + env `ROUTE_RETRY_UNKNOWN_COOLDOWN_MS` 可覆盖·理由见 §1.3/小改记·文案已同步） · `gap-bug-backlog.md` GAP-ROUTE-RETRY-UNKNOWN-REBILL 行翻面权（append-only 纪律归协调方·本刀零触） · free-text funnel 面与编辑回退同 digest 残余窗（§3-1/2）后继处置立项与否。
- **小改记入档（2026-11-06 协调方裁定·双审未行使状态不变）**：缺省 2 分钟与 env 覆盖 resolver（`resolveRouteRetryUnknownCooldownMs`·非法即抛）· web 文案原因+等待时间+`ok:false` 展示面小补 · proof 常量 pin 120_000 + env 覆盖臂 + resolver 断言 · egress inventory 登记 4 sources（401→405）· compose.prod.yml / api.env.example 披露。本记只改上述面，§0 红读数与 §1.2 判读原值保真零冲销。
- **本卷落卷后事实基座不受后继裁决影响的部分**：§0 全节读数与 §0.2 红读数系原值记账（零冲销）；§1.2 判读系在案实测。

---

*ROUTE-RETRY-BILLING REQUEST · 2026-11-06 起草 **`draft:awaiting_pre_exec_dual`**（起草席落卷即停 · ⛔push ⛔merge 主线 · alone ≠ dual · base `origin/main` @`d549a497b`（#212 rtx merge 点 · 本地 ref=令文届值恒等 · fetch 两试网络不可达如实承登）· worktree `meetwise-rretry` · branch `line/rretry-draft` · 改动集=四 src（recruiter.ts 闸+常量/db index 导出/contracts additive 枚举/web actions 文案披露/api service 注释）+proof 既有文件加两臂一 pin（r2-p-worker-route-classify）+两 policy 脚本 cap 恰等步进 2490→2491（CAP-SANCTION-2491 链注追加·四联动点恰等改）+本卷（唯一新受管件）· 修复前红已证（§0.2 base 树 EXIT=1）· 修复后全绿（§2）· **小改（2026-11-06 协调方裁定行使·状态不变）**：冷却窗缺省 10min→2min + env `ROUTE_RETRY_UNKNOWN_COOLDOWN_MS` 覆盖 resolver + web 文案原因/等待时间与 ok:false 展示小补 + proof pin 120_000 加 env 覆盖臂与 resolver 断言 + egress inventory 登记（401→405）+ compose.prod.yml/api.env.example 披露+本卷编辑（改动集小改后=九改零新增·全门复跑绿 §2 小改复跑表）· est live=0 · pins 十一值照抄 · markers=0 · 停止条件四类全设 · Ban self-approve · pre-exec dual 待派 · **STOP（起草落卷即停）***
