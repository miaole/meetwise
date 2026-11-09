# ROUTE-RETRY-BILLING REQUEST（meetwise 路由分类重试二次计费修复刀 · GAP-ROUTE-RETRY-UNKNOWN-REBILL · retryJobRoute 同键前账 unknown 冷却窗抑制闸 · 红先证修复后全绿 · 起草落卷即停）

**Status**: **`post_prove_dual_pass`**（post-prove 双审两独立外席收口 PASS（卷 §9 记录在案；.tmp/reviews/rretry-post-1.md 在库，证伪席报告随 .tmp 轮换·rretry 并线 PR #221）·2026-11-06 EXEC 行使落卷（pre-exec 双审两独立外席 PASS·报告 `meetwise/.tmp/reviews/rretry-pre-1.md`/`rretry-pre-2.md`·协调方 EXEC 授权随令）· rebase 并线届值 origin/main `6ecce7705`=#217（两 policy 冲突 dual-keep·CAP-SANCTION-2498 union 注记·cap 2497→2498 合并树实测恰等）· P2 三件就地修+勘误登记（§9 EXEC 交接段）· 全门绿（§2 EXEC 复跑表）· ⛔push · Ban self-approve · est live=0 · `actualSpendCny=null`）

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

### 0.1b EXEC 重 pin（2026-11-06 · 届时 tip 亲读 · 漂移如实更新）

- **并线届值**：`git fetch origin` EXIT=0 → origin/main=`6ecce7705`（#217 ksw 开关入口收口已并）→ rebase 本支两 commit（`c7227dd9c` 修复 + `b3579874b` 小改）零 drop；两 policy 脚本冲突 dual-keep（main 侧十四注史录全保留+本支 CAP-SANCTION-2491 注并留+新增 CAP-SANCTION-2498 RRETRY union 注记）·cap 合并树实测 `scanned 2498=cap 2498` 恰等（=main 届扫 2497+本卷 1）；backlog 无冲突（`gap-bug-backlog.md:989` GAP 行 main 侧零前进零冲突）。
- **§0.1 锚表届时重 pin**（`6ecce7705` 并线后本支树亲读）：锚 1（job-route-classify.ts:154）/锚 2（0209:218-220）/锚 5（invoke.ts:1116-1122·`markModelInvocationUnknown` :1118）/锚 6（model-invocation-reconcile.ts:4-8）/锚 7（job-route-classify.ts:185-196）行号届值**恒等**；**锚 3 漂移 invoke.ts:823→836**（#216 fastm additive `errorDetail` 观测 plumbing 使下游行号 +13；diff 亲读=仅传输观测 additive 字段+注释·`claim.action==='failed'||'unknown'`→`deterministic_refusal` 终态判定逐字节零变·unknown 冻结/落库/零重试语义零变——pre-1 §1.8 同判）；锚 4 系 base 相对锚（base `d549a497b` 原值保真；届树该函数体随本刀闸代码在位 `recruiter.ts:189-228`）。**机制结论零变 → 不触 §8 停止条件 1**。

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
- 冷却窗缺省 **`ROUTE_RETRY_UNKNOWN_COOLDOWN_MS = 2 分钟`**（2026-11-06 协调方裁定·原起草值 10 分钟据此小改·导出常量·`opts.unknownOutcomeCooldownMs` 可注入供 proof 注入小窗）；db 包 index 导出常量与 **`resolveRouteRetryUnknownCooldownMs`**（环境变量 **`ROUTE_RETRY_UNKNOWN_COOLDOWN_MS`** 同名覆盖 resolver：毫秒整数·0=关闭抑制·上限 3,600,000·非法/越界即抛 `route_retry_unknown_cooldown_invalid`·每次调用读取沿 reconcile resolver 同法）——**EXEC 期 P2 吸收改（2026-11-06 EXEC 令随令行使）**：0/负数/非数字/越上限（含 `' '`/`'-0'` 经 `Number()` 静默归 0 角·pre-2 问5 角1）不再抛错亦不静默关闸，统一 **fail-closed=回退缺省 120000 并警告一次**（进程生命周期首例一次·沿启动日志面·抑制闸不可经 env 关闭，「0=关闭抑制」旧语义废止·正值域 1–3,600,000 整数）；按仓库约定登记 egress inventory（4 sources·compose.prod.yml x-cloud-runtime-env + deploymentReferences + docker/env/api.env.example 披露）——**EXEC 期 +1 source**（web actions 文案同源读点·见下行·405→406）。
- `packages/contracts/src/index.ts`：`JobRouteRetryResult.status` enum additive + `'unknown_pending'`（openapi.proof 既有断言 includes 面 additive 兼容）。
- `apps/web/app/recruiter/jobs/actions.ts`：`unknown_pending` 映射披露文案「上一次岗位识别结果尚未确认（为避免重复计费已暂缓重发），请约 2 分钟后再试，或编辑岗位内容触发重新分类。」——说清原因与等待时间（小改裁定稿）加两出口，不谎报已提交；映射为 **`ok:false`** 使 `JobAdminPanel.runAction` 不硬刷新（该状态零状态变化，原 `ok:true` 形会 `window.location.reload()` 冲掉文案——前端展示面小修补上）——**EXEC 期 P2 吸收改（2026-11-06·pre-2 P2-3 文案失真就地修）**：等待文案不再硬编码「约 2 分钟」，改由 server action 服务端读同一 `ROUTE_RETRY_UNKNOWN_COOLDOWN_MS` 生成（与 db resolver 同法 fail-closed 回退缺省·分钟向上取整下限 1·「约」承近似性），环境改了文案跟着走；compose.prod.yml web service 补披露同键（x-cloud-runtime-env 注记「API only」→「API + web」）；web 侧静默回退不警告（警告归 db resolver 单一所有方防双份日志）。
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
  - **跨 owner 冷却隔离臂（EXEC 期新增·pre-1 P2-3/pre-2 问3 补证就地修）**：owner-A 岗位首账 unknown 缺省窗内时 owner-B 独立岗位重试照常 `retried@rev2`→走完分类；正向对照 owner-A 自身同窗仍 `unknown_pending`；owner-A 前账 unknown 原样未动——闸谓词 owner 过滤（0037 PK+FORCE RLS）行为级实证。
  - 常量 pin：`ROUTE_RETRY_UNKNOWN_COOLDOWN_MS === 120_000`（小改前原值 600_000）；resolver 断言：缺省回落 120000 / env 数值生效 / 非法（abc/1.5）与越界（-1/3600001）四例全抛——**EXEC 期改**（随 §1.1 fail-closed 裁定）：非法六例（abc/-1/**0**/1.5/3600001/**' '**）断言**全回退缺省 120000 且警告恰一次**（0 例=「关闭」旧语义废止·`' '` 例=pre-2 问5 角1 堵角）。
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

**EXEC 期复跑（2026-11-06 · rebase 并线届值 `6ecce7705` 树 + P2 吸收改后 · EXEC 席亲跑回执）**：

| # | 门 | EXEC 读数 |
|---|-----|------|
| 1 | 重试计费闸臂 | `r2-p-worker-route-classify:prove` 隔离 runner EXIT=0 `OK`（容器 PGPORT=33598）：既有臂全 PASS 原值恒等（suppress `unknown_pending@1 revisions=1 calls=1` / 双击两路 unknown_pending / 老化放行 `retried@rev2` / 走完分类 `route_decided·calls=2` / env=30 放行 / known_not_sent `retried@rev2→decided`）；**新增跨 owner 隔离臂三断言全 PASS**（正向对照 owner-A `unknown_pending·闸未失效` / owner-B `retried@2` / owner-B 走完分类且 owner-A 前账 unknown 原样未动）；**resolver 断言改形全 PASS**（`fallbacks=6 warns=1`·缺省 120000·env=30 生效） |
| 2 | 既有路由 proof | rag03-route / rag07-free-text-route / rag05-qbank-miss / rag06-route-scope-cache / rag04-track-local 五 receipt `outcome=passed exitCode=0`；`recruiter:prove` passed exitCode=0（cleanup 阶段 best-effort `interview_event_immutable` 噪声同前·不影响 EXIT 与断言面·如实登记） |
| 3 | `pnpm db:prove` | 「四原语证明全部通过」EXIT=0 |
| 4/5 | typecheck/lint | db/worker/api/web/contracts 五包 typecheck 全 EXIT=0；lint db **1042**/worker **999**/contracts **265**/api **1545**/web **607** warnings·0 errors=五包恰等基线零新增（worker 期中 +1 `no-unused-vars`（跨 owner 臂 `refuseCalls` 未用）已以断言消费收敛回 999 恰等·上限未调·如实登记） |
| 6 | `pnpm arch` | 0 errors/8 warnings · **1192 modules/3787 deps**——届时 base（origin/main `6ecce7705`）/tmp 共享克隆 `pnpm install --frozen-lockfile` 后亲跑同值**恒等**（对旧 base `d549a497b` 之 1191/3777→1192/3787 差系 main 并线四刀（sbg/uc31-rev/fastm/ksw）并入·非本刀引入） |
| 7 | egress inventory | `static_provider_egress_inventory_valid: adapters=5; operations=10; registered_consumer_source_pairs=55; environment_references=406` EXIT=0（405+1·web actions 文案同源读点 `runtime-configuration` 登记；compose.prod.yml web service 补披露） |
| 8 | docs:check | `scanned 2498=cap 2498` 恰等 EXIT=0（rebase 并线 union：main 届扫 2497=CAP-SANCTION-2497 KSW nail 承值+本卷 1；两 policy 冲突 dual-keep·新增 CAP-SANCTION-2498 union 注记·本支 2491 注并留） |
| 9 | PTP | `public-text-policy.proof.mjs` EXIT=0 `static_preflight_valid: selected=12/12`（EXEC 改动集落卷后亲跑） |
| 10 | markers | EXEC 改动集（六 src/披露/卷·零新增文件）五类标记词 grep 零命中（冲突标记 0/假绿绕过词 0/测试门弱化 0/遗留标 0/secrets 样值 0）。**勘误登记（如实·pre-1 §⑧ 三件）**：①门 10 原文「净增行 246 行」勘误——commit1（原 `7168689f1`）ex-卷 numstat 亲算 **ins=238/del=14/净 +224**（pre-1 P2-1 同值·EXEC 复算承登·初版读数系收敛前估算未随更新）；②卷尾「四 src」勘误「**五 src**」（recruiter.ts/db index/contracts/web actions/api service·pre-1 P2-2）；③Ban「改动只交付本 worktree 一 commit」对实际两 commit（`7168689f1` 修复+`89d0cb8bd` 小改·小改系协调方裁定独立落卷）字面不符——EXEC 如实勘误登记、不追改史录（pre-1 P2-5·归协调方追认） |

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

**`post_prove_dual_pass`**（2026-11-06 EXEC 行使落卷 · 状态四处实测一致=Status 头/§8/§9/卷尾 · pre-exec 双审两独立外席 PASS+协调方 EXEC 授权随令已行使 · ⛔push · post-prove dual 待派 · alone ≠ dual）。

**停止条件（命中即停手上报）**：
1. **现场漂移**：pre-exec/EXEC 对届时 tip 重 pin，§0 锚漂移超 ±3 且结论受影响、或根因面（retryJobRoute/invoke/0209/ai_model_invocation/路由状态机）被他刀改动 → 停。
2. **验收红**：§2 门 1-10 任一红且无法在本刀范围内归因修复（含 Ban 为绿放宽断言/门）→ 停。基线红（已单列）不触发本条，但若其失败数对 base 漂移 → 停。
3. **越界需要**：需触 §3 任一域才能继续 → 停。
4. **机制不符**：修复后闸臂若复现二次派发（门 1 绿不可稳）或 known_not_sent 被误拦 → 停。

## §9 pre-exec dual 交接（状态：**`post_prove_dual_pass`**）

- **双审对象**：§0 锚表逐条 file:line+红读数原值保真 · §1.1 修法结构（同键重构式与 ai-runtime :154 同式防漂）· §1.2 四问逐条 · §1.3 候选比较与窗值取舍 · §1.4 proof 面（红先证链）· §2 门矩阵与基线红单列 · §3 范围外。
- **悬决项（归协调方/产品）**：pre-exec 双席派定 · EXEC 排程 · post-prove 双席 · ~~冷却窗值（10min 缺省）与 web 文案措辞产品确认~~（**已裁定 2026-11-06**：缺省 2min + env `ROUTE_RETRY_UNKNOWN_COOLDOWN_MS` 可覆盖·理由见 §1.3/小改记·文案已同步） · `gap-bug-backlog.md` GAP-ROUTE-RETRY-UNKNOWN-REBILL 行翻面权（append-only 纪律归协调方·本刀零触） · free-text funnel 面与编辑回退同 digest 残余窗（§3-1/2）后继处置立项与否。
- **小改记入档（2026-11-06 协调方裁定·双审未行使状态不变）**：缺省 2 分钟与 env 覆盖 resolver（`resolveRouteRetryUnknownCooldownMs`·非法即抛）· web 文案原因+等待时间+`ok:false` 展示面小补 · proof 常量 pin 120_000 + env 覆盖臂 + resolver 断言 · egress inventory 登记 4 sources（401→405）· compose.prod.yml / api.env.example 披露。本记只改上述面，§0 红读数与 §1.2 判读原值保真零冲销。
- **本卷落卷后事实基座不受后继裁决影响的部分**：§0 全节读数与 §0.2 红读数系原值记账（零冲销）；§1.2 判读系在案实测。
- **EXEC 行使记录（2026-11-06 · EXEC 席·授权随令）**：
  - **rebase 并线**：fetch EXIT=0（首试即达）→ origin/main=`6ecce7705`=#217 → rebase 两 commit 零 drop；两 policy 冲突 dual-keep（main 十四注史录全保留+本支 CAP-SANCTION-2491 注并留+新增 CAP-SANCTION-2498 RRETRY union 注记）·cap 合并树实测恰等 2498（conflict 件先 add 收敛后终测·沿 CAP-SANCTION-2418 冗计坑规避先例）；backlog 无冲突（双方追加行无对撞·零处置）。
  - **届时重 pin**：§0.1b 全锚届时亲读——唯锚 3 `invoke.ts:823→836` 漂移（#216 fastm additive errorDetail·语义 diff 亲读零变·pre-1 §1.8 同判）·机制结论零变 → 停止条件 1 不触；停止条件 2/3/4 逐条核查不触（§2 EXEC 表全绿·零越界·闸臂稳绿无二次派发·known_not_sent 未误拦）。
  - **P2 两路吸收处置（就地修 3+登记 1 组）**：
    - 就地修①（pre-2 P2-3 文案失真）：web `unknown_pending` 等待文案改 server 端读 `ROUTE_RETRY_UNKNOWN_COOLDOWN_MS` 生成（fail-closed 同法回退·compose.prod.yml web service 补披露同键·inventory +1 source=406）——pre-1 §⑨「本刀不需修」判定系就「web 无法感知 API env」旧前提出发，EXEC 令明示「读 env 生成」随令行使（同 compose 部署面两容器同读一键·缺失/非法回退缺省文案=现状不劣化）。
    - 就地修②（pre-2 P2-2+问5 角1·EXEC 令明示 fail-closed 裁定）：resolver 0/负/非数字/越界（含 `' '`/`'-0'` 静默归 0 关闸角）不再抛错亦不静默关闸，统一回退缺省 120000+进程内首例警告一次；proof resolver 断言改形（六例回退+警告恰一次）——「0=关闭抑制」与「非法即抛 500」旧语义就此废止（api.env.example 披露同步）。
    - 就地修③（pre-1 P2-3/pre-2 问3）：proof 新增跨 owner 冷却隔离臂三断言（全 PASS·读数见 §2 EXEC 表门 1）。
    - 登记组（pre-1 §⑧ 勘误三件+P2-5）：门 10「净增行 246」勘正 ins=238/net=+224；卷尾「四 src」勘正「五 src」；Ban「一 commit」对实际两 commit 字面不符如实登记归协调方追认（不追改史录）。
    - 其余 P2 不另动：pre-2 P2-1（残余窗定量系假设）已由 §1.3/§3 如实登记在卷+本记留证；pre-2 P2-4 附注（opts 注入缝未校验·API 不可达）就此在卷如实承登：`opts.unknownOutcomeCooldownMs` 系未校验 proof 注入缝（绕过 resolver 校验·负/NaN 即静默关闸），API 产品路径不可达，防后继刀误用为产品配置面（§1.1 修法行同域）；pre-2 P2-5（model_prepared 崩溃残面）系基线残面归 gap-bug-backlog append-only（本刀零触·§9 悬决原样）；pre-1 P2-4 文案观察项由就地修①吸收闭环。
  - **EXEC 期改动集（六改零新增受管文件）**：`packages/db/src/recruiting/recruiter.ts`（resolver fail-closed）/`apps/web/app/recruiter/jobs/actions.ts`（文案同源生成）/`apps/worker/test/r2-p-worker-route-classify.proof.ts`（跨 owner 臂+resolver 断言改形）/`docker/compose.prod.yml`（web 披露+注记）/`docker/env/api.env.example`（披露语义同步）/`ai-docs/architecture/ai/provider-egress-inventory.json`（405→406）+本卷编辑；两 policy 并线冲突收敛随 rebase 落 `c7227dd9c`。
  - **est live=0 不变**（全 proof 隔离 PG + scripted ModelClient·零 provider 外呼零 Key·`actualSpendCny=null`）；pins 十一值照抄零翻转；零迁移零新依赖。

---

*ROUTE-RETRY-BILLING REQUEST · 2026-11-06 起草→小改→**EXEC 行使 `post_prove_dual_pass`**（pre-exec 双审两独立外席 PASS（`meetwise/.tmp/reviews/rretry-pre-1.md`/`rretry-pre-2.md`）+协调方 EXEC 授权随令已行使 · ⛔push · post-prove dual 待派 · alone ≠ dual · worktree `meetwise-rretry` · branch `line/rretry-draft` · rebase 并线届值 origin/main `6ecce7705`=#217（两 policy 冲突 dual-keep·CAP-SANCTION-2498 union 注记·cap 合并树实测恰等 2498·本支 CAP-SANCTION-2491 注并留史录）· 改动集史录=修复 commit（五 src 勘正：recruiter.ts 闸+常量/db index 导出/contracts additive 枚举/web actions 文案披露/api service 注释）+proof 既有文件加臂一 pin+两 policy cap 步进 2490→2491+本卷（唯一新受管件）；小改 commit=九改零新增（缺省 2min+env resolver+文案 ok:false+proof pin/覆盖臂+inventory 401→405+披露）；**EXEC 期=六改零新增**（resolver fail-closed 回退缺省+警告一次·文案自 env 同源生成+compose web 披露·proof 跨 owner 隔离臂+resolver 断言六例回退警告恰一次·inventory 405→406·api.env.example 语义同步·本卷 §0.1b 重 pin/§2 EXEC 表/§9 EXEC 记/勘误三件）· 修复前红已证（§0.2）· 修复后全绿→并线+P2 后全门复跑绿（§2 EXEC 复跑表·arch 与届时 base 恒等 1192/3787）· 勘误三件如实登记（净增行 246→ins 238/net +224·四 src→五 src·Ban 一 commit→两 commit 归协调方追认）· est live=0 · pins 十一值照抄 · markers=0 · 停止条件四类届时核查不触 · Ban self-approve · **STOP（EXEC 落卷即停·待 post-prove 双审）***
