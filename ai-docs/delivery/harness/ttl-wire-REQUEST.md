# TTL-WIRE REQUEST（AUTHZ-HARDEN 5A-2 R-1 接线小刀 · #18 滞留 payload TTL 清理原语生产接线 · 单一接线面零新原语）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + 协调方明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）。

**席位**：TTL-WIRE 小刀起草席（AUTHZ-HARDEN 5A-2 post-prove 席2 R-1 登记承接·协调方裁「接线小刀」向·北星 loop）。
**基线**：`feat/mysql-schema-skeleton` @ `7500ac73`（主线 tip·`git log -1` 实测 2026-10-12 16:30:38 +0800·docs(coord) LEDGER :352 勘误卷·零码面）。分支 `line/ttl-wire`·工作树 `meetwise-ttlwire`（`git worktree add ../meetwise-ttlwire -b line/ttl-wire` 本起草席已立·建前 worktree list + branch 双查实测不存在）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①`ai-docs/delivery/execution-master-checklist.md`（blob `7356acfd`）`:2268` Line AUTHZ-HARDEN 5A-2 nail 段头（载「#18 payload TTL 滞留半」）+ `:2276` **R-1 遗留行逐字**：「#18 purgeStaleInterviewJobPayloads 生产零调用点=原语已落未接线——挂协调方裁『接线小刀或降格声明』」——本卷即「接线小刀」向之起草兑现；②`ai-docs/delivery/harness/authz-harden-REQUEST.md`（blob `4180d446`）§1 簇④ `:110` #18 滞留半修法行（「收割函数 sweepStuckInterviewJobs 语义零改·新增旁路清理函数」——旁路函数已落·本刀补生产触发）+ §2-6 `:120` 断言族（已落 `packages/db/test/authz5a2-stale-payload-ttl.proof.ts` 17 臂·blob `c92e1e64`）。

## §0 现状锚（起草席亲读·base `7500ac73`·file:line 逐条 rg/sed/awk/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（已终局·强制项）

- `git worktree list`：8 树实测（主仓+5e-baseline/5e/authz/blite/e2sc/i6/entpay/parity2）——**无 ttl-wire 树**。
- `git branch --list | grep -i ttl` EXIT=1 + `git branch -a | grep ttl-wire` EXIT=1——**无 line/ttl-wire 分支**。
- `rg -l "TTL-WIRE|ttl-wire" ai-docs/delivery/harness/` EXIT=1 **零同名卷**；`rg -li "TTL-WIRE|ttl-wire" ai-docs/delivery/` EXIT=1 全域零命中（checklist `:2276` R-1 行系授权出处登记非刀卷·不在 rg 命中之列）。→ **停止条件未触发·可建树落卷**。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`7500ac73`）

| 文件 | blob | 关键行锚 |
|---|---|---|
| `packages/db/src/interview/interview-jobs.ts` | `775a9336`（全 40 hex：`775a93361e5db460a6b94a765e346c5c840126bf`） | `:259-265` sweep 文档注释 · `:266-279` `sweepStuckInterviewJobs`（两条原子 UPDATE·只触 running）· `:281-282` `INTERVIEW_STUCK_PAYLOAD_TTL_SECONDS = 86_400` · `:284-293` purge 文档注释（「本函数独立于收割路径(新旁路)」「queued 行收割永不触达」）· `:294-308` `purgeStaleInterviewJobPayloads`（SQL `:297-305`：`payload=payload-'answer'` + 谓词门 `payload ? 'answer'` + 双窗 `(status='queued' AND created_at < now()-ttl) OR (status='running' AND lease_expires_at < now()-ttl)` · `stale_payload_purge` 结构化日志 `:306`） |
| `apps/worker/src/interview-consumer.ts` | `787f23fe`（`787f23fe0733194804f67975c7e4a41ae4900875`·全 570 行） | `:7` 巨型 import（含 `sweepStuckInterviewJobs` **不含** `purgeStaleInterviewJobPayloads`——红事实机证之一）· `:522-525` reap 文档注释 · `:526-540` `reapStuckInterviewJobs`（`:528` sweep 调用 · `:529-537` failedInterviews→terminalizeUnsettledInterview 循环 · 同一 `asPrincipal` 事务 RLS 限 owner）· `:542-565` `interviewDispatchTick`（`:548` 逐 owner reap 调用 · `:555-559` 逐 owner reap 异常隔离 catch）· `:568-570` `runInterviewConsumer`（`runDrainLoop` 5000ms 默认拍） |
| `apps/worker/src/main.ts` | （生产入口佐证） | `:30` import runInterviewConsumer · `:643` `runInterviewConsumer({...}, jobReconcileIntervalMs)` 常驻 loop 挂载 |
| `packages/db/test/authz5a2-stale-payload-ttl.proof.ts` | `c92e1e64`（`c92e1e6416a05eb369ef16b2037e35ce119d6a08`·全 116 行） | 头注 `:1-10`（假时钟三臂形·运行命令 `:8`）· 17 臂亲数 `A(` = **17**（rg -c 实测）· `:84` `:109` purge 双调（prove 专用） |
| `packages/db/src/index.ts` | `3fa6f9a8` | `:126` barrel export 携 `purgeStaleInterviewJobPayloads`+`INTERVIEW_STUCK_PAYLOAD_TTL_SECONDS` |
| `packages/db/package.json` | `91eb0b2f` | `:26` `"prove:authz5a2-stale-payload-ttl": "tsx test/authz5a2-stale-payload-ttl.proof.ts"` |
| `apps/worker/test/reaper.proof.ts` | `48c690c0` | `:15` import（sweep 族）· `:86` sweep 调用——reaper 既有 prove 基线（§2-3 回归原值锚） |
| `ai-docs/delivery/execution-master-checklist.md` | `7356acfd` | `:2268` 5A-2 nail 段头 · `:2276` R-1 遗留行（出处·只读引用） |

### 0.2 两处锚勘误如实登记（登记面与派单/登记文字之差·结论零变）

1. **reaper 路径**：登记/派单文字作 `apps/worker/src/interview/interview-consumer.ts:528`——实测真实路径 `apps/worker/src/interview-consumer.ts`（**无 `interview/` 子目录层**）·行号 `:528` 逐位吻合（`const res = await sweepStuckInterviewJobs(c, owner);`）·reaper 形态（仅调 sweep·零 purge）与预判全合——**非停止条件**·本卷全锚按实测路径钉。
2. **prove 门名**：派单文字作 `authz5a2:stale-payload-ttl:prove`——实测注册名 `prove:authz5a2-stale-payload-ttl`（`packages/db/package.json:26`·运行形 `pnpm -C packages/db prove:authz5a2-stale-payload-ttl`）·同物异名·如实更锚。

## §1 红事实（接线缺口机证·全 @`7500ac73` 实测）

### 1.1 原语已落且证明在卷

`purgeStaleInterviewJobPayloads`（`interview-jobs.ts:294-308`）：TTL 默认 `INTERVIEW_STUCK_PAYLOAD_TTL_SECONDS=86_400`（`:282`）·只清 `payload-'answer'`（身份/追踪保留·明文不留·D6 同款）·幂等谓词门 `payload ? 'answer'`（已清行天然不再命中）·目标域双窗=超龄 queued（`created_at` 早于 now−TTL）∨ running 租约过期超 TTL（兜底臂）·`stale_payload_purge` 结构化日志在位。5A-2 已 prove：`packages/db/test/authz5a2-stale-payload-ttl.proof.ts` **17 臂**假时钟三臂形（臂①超龄 queued 清明文·臂②活跃/未超龄/刚过期零触边界·臂③ sweep 计数零回归）。

### 1.2 生产零调用点（rg 全仓机证）

`rg -n "purgeStaleInterviewJobPayloads" --type ts`（基线树实跑）恰 **5 命中全列**：`interview-jobs.ts:294`（定义）+ `packages/db/src/index.ts:126`（barrel export）+ `authz5a2-stale-payload-ttl.proof.ts:14/:84/:109`（prove 专用）——**生产调用点=0**。旁证：worker 侧唯一 interview 域 import 面 `interview-consumer.ts:7` 携 sweep 而不携 purge。

### 1.3 reaper 主循环逐行亲读（触发链完整·唯 purge 缺席）

生产链逐行：`main.ts:643` `runInterviewConsumer(…, jobReconcileIntervalMs)` 常驻 → `interview-consumer.ts:568-570` `runDrainLoop(interviewDispatchTick)` → `:542` `interviewDispatchTick` 逐 owner `:548` 调 `reapStuckInterviewJobs` → `:526-540` 体内 `:528` **仅** `sweepStuckInterviewJobs(c, owner)`（sweep 两条 UPDATE 之 WHERE 全系 `status='running'`——`:271`/`:275` 亲证）→ failedInterviews 逐单 terminalize（`:529-537`）。**purge 全链零触达**。

### 1.4 queued 滞留面影响（缺口实害）

sweep 只处理 running（翻 queued/failed）；**queued 行收割永不触达**（原语文档注释 `:287` 自证）——worker 停机期/重队列终态不可达的 queued 滞留 job 其明文 answer 无外部触发不清；running 租约过期超 TTL 兜底臂同 面。设计 TTL=86 400s 已定而生产恒不执行 → 明文 payload 滞留 24h+ 乃至无限期（等下一手工/未定触发）·恰 #18「滞留半」在生产未兑现·R-1 登记「原语已落未接线」机证闭环。

### 1-修法（单一接线面·零新原语·零迁移）

**接线点唯一**：`reapStuckInterviewJobs`（`interview-consumer.ts:526-540`）体内、同一 `asPrincipal` 事务内追加一次 `purgeStaleInterviewJobPayloads(c, owner)` 调用 + `:7` import 行补名——共两处改动·恰一文件。推荐置位=**terminalize 循环后、return 前**（`:537` 与 `:538` 之间）：purge 异常不饿死同拍退款/终态面（行为最安全形）；置于 `:528` sweep 后紧邻为备选（裁决项①）。

- **触发频率/条件自控**：调用形沿既有 `sweepStuckInterviewJobs(c, owner)` 同参同域（asPrincipal+RLS 限 owner）；频率沿 reaper 既有拍（5000ms 默认）；条件沿 purge 自身幂等谓词门自控——非超龄/已清/活跃 running 行天然零命中，逐拍重复调用为无害空转（零新配置面、零新 env 闸、零新定时器；短窗覆写若双审欲行使沿原语既有第三参 `ttlSeconds`·默认 `86_400` 不动·§3-1）。
- **异常隔离**：purge 抛错落 `interviewDispatchTick` 既有逐 owner catch（`:555-559`）·与 sweep 抛错同款隔离面·零新错误处理面。
- **零语义面**：`sweepStuckInterviewJobs`（`interview-jobs.ts:259-279`）与 `purgeStaleInterviewJobPayloads`（`:281-308`）两原语函数体**零字节改**——本刀只接线不改原语·零迁移·零 DDL·零新存储面。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）

1. **prove 复用臂（回归原值）**：`pnpm -C packages/db prove:authz5a2-stale-payload-ttl` EXIT=0·**17 臂全绿原值**（现树 17 `A(` 亲数·blob `c92e1e64` 零改前提）——原语面回归不翻。
2. **新接线臂（reaper 触发路径到 purge 的调用可达性·载体=裁决项②）**：候选形 A=worker 侧最小单测假池/spy 形（驱动 `reapStuckInterviewJobs` → 断言 purge 被调且参形 `(c, owner)` 默认 TTL·沿 `apps/worker/test` 既有假体形·住地沿 `reaper.proof.ts` 同目录）；候选形 B=静态源断言（`interview-consumer.ts` 含 purge import+调用点 rg 断言·静态门形）——推荐 A+B 双形并陈。
3. **零行为面回归（sweep 语义零改）**：`apps/worker/test/reaper.proof.ts`（blob `48c690c0`）既有臂全绿原值·requeued/failed 计数零变；`git diff` 断言 `interview-jobs.ts` `:259-308` 区零字节；若采推荐置位（terminalize 后）·补一臂「purge 异常注入不阻断同拍 terminalize 退款面」（负测不落卷不留痕）。
4. markers=0（§7）+ est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **TTL 值调参不出手**：`86_400` 原值零动；调参/常量化覆写/启动档短窗=另刀或裁决项（本刀零调参面）。
2. **新存储面零触**：零新迁移/零 DDL/零新表列（`packages/db/migrations/` 零新增零改）。
3. **别的队列零触**：quiz（`packages/db/src/jobs/quiz-jobs.ts:81` 镜像 reaper 面）·diagnosis 及其余 consumer 面——#18 只锁 interview 面·不外溢。
4. **原语零改**：`purgeStaleInterviewJobPayloads` 与 `sweepStuckInterviewJobs` 函数体/谓词/日志零字节（§1-修法同款）·`interviewDispatchTick` 调度/公平轮转/逐 owner 隔离语义零改。
5. **API/前端/e2e 产品面零触**；共享 SSOT（LEDGER/checklist/issues-master/TASK-SOP）只读引用零改（R-1 行翻面权归协调方）。
6. est live=0（§6）。

## §4 依赖

**零未决硬依赖**：①原语+prove 已落主线（5A-2 merge `@4a5528a5` 携入·基线树 `7500ac73` 亲证在位）——无前置刀；②无迁移编号交点（零迁移）；③无其他工作树/在飞刀同文件交（`interview-consumer.ts` 现势零并发登记面）；④既有 prove 基线（`authz5a2-stale-payload-ttl` 17 臂+`reaper.proof`）现成可复跑。下游无硬闸。

## §5 Ban 列表 + pins（沿 authz-harden/ci-wiring 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用·R-1 行翻面权归协调方）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 动 `purgeStaleInterviewJobPayloads` 原语函数体与谓词语义（`interview-jobs.ts:281-308` 零字节改·只接线）；Ban 动 `sweepStuckInterviewJobs` 语义（`:259-279` 零字节改·reaper.proof 既有臂零翻）；Ban TTL 调参/短窗覆写出手（`86_400` 原值·§3-1）；Ban 触非 interview 队列 reaper 面（quiz/diagnosis 等·§3-3）；Ban 新增迁移/DDL/新存储面/新配置面/env 闸（§1-修法·§3-2）；Ban 无界清 payload（沿 5A-2 原纪律·只限超龄滞留行·活跃 running 零触）；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 假体/静态/隔离库·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：接线臂=worker 侧假池/spy 最小单测+静态源断言；复用臂/回归臂=隔离库 db prove（假时钟）与既有 worker prove 假体形——零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ttl-wire-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 authz-harden/ci-wiring/blite-fix 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（R-1「接线小刀」向授权承接·本卷非授权本身）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 0.2 两处锚勘误如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：①purge 调用置位（推荐=terminalize 循环后 return 前·异常不饿死退款/终态面 vs `:528` sweep 后紧邻）；②新接线臂载体（假池/spy 单测+静态源断言双形并陈=推荐·单形亦须断言力≥3）；③接线臂命名与住地（`apps/worker/test/` 住地·EXEC 定名沿 reaper.proof 形）；④prove 复跑口径（17 臂臂计数复核方式·逐臂原值对账入收据）。

---

*TTL-WIRE REQUEST · 2026-10-12 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`7500ac73`（git log -1 实测 2026-10-12 16:30:38 +0800）· 分支 `line/ttl-wire` · 工作树 `meetwise-ttlwire`（git worktree add 本起草席立·建前 worktree list+branch 双查不存在）· 立项出处=checklist `:2268`/`:2276` R-1 遗留行（挂协调方裁「接线小刀或降格声明」·本卷即接线小刀向起草·不自建 SSOT 行）+authz-harden-REQUEST §1-簇④:110/§2-6:120（5A-2 已落原语与 17 臂 prove 承接）· 防重双对表过（harness 无同名卷·delivery 全域零命中）· 红事实机证=rg 全仓 purge 恰 5 命中（定义+export+prove×3·生产零调用）+reaper 触发链逐行亲读（main.ts:643→consumer:568→:542→:548→:528 仅 sweep）+queued 滞留明文无清理触发面· 锚勘误两处如实登记（reaper 实径无 interview/ 子层·prove 实名 prove:authz5a2-stale-payload-ttl）· 修法=单一接线面恰一文件两处（import+asPrincipal 域内 purge 调用·推荐 terminalize 循环后）·零新原语·零迁移·零配置面 · 断言候选四条（17 臂回归原值+新接线臂+零行为回归+双声明）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
