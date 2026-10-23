# LEASE-ATTEMPTS-CAP REQUEST（AG 台账下一刀起草席——interview_job 重排队 attempts 上限残面最小收口·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-22 落卷·pre-exec 双审两独立外席待派→Dual PASS→协调方授权 EXEC·est live=0·Ban self-approve·alone≠dual·⛔push·翻面权归协调方）

**席位**：AG 台账下一刀起草席（协调方派单·标的=issues-final AG-29 残半「queued job 被反复 requeue 时没有 attempts 上限」·前半「解锁失败带锁回池」已由 provision-lock-release 刀收口勿重做）。
**基线**：`origin/main` @ `98033ca8`（`git fetch` 后亲证·`git rev-parse origin/main`=`98033ca86b63cad532f346d2bb7d4e138400e7b8`）。分支 `line/lease-attempts-cap-draft`·工作树 `meetwise-ag29`（起步落后 2 commit·`git reset --hard origin/main` 对齐=fast-forward 等价·零 merge commit）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：`ai-docs/delivery/ai-capability-review/issues-final.md` AG-29 总览行 `:41`+详情 `:371-383`（判词两半·修法三肢「unlock 失败销连接；requeue 计数并设上限；或事务级锁+CAS」·`:381` 翻面注记 2026-10-16 已登记两半收口=fce5aa22·本卷 §0.2 届树逐条复核其词）。

## §0 现状锚（起草席亲读·base `98033ca8`·file:line/blob 逐条 rg/sed/Read/git rev-parse 实测·**EXEC 立项照届时 tip 全量重 pin——漂移如实改锚·结论不变则只更行号**）

### 0.0 防重三查 + 在飞交叠复核

- `git worktree list`：**10 树**实测·恰本席一棵 ag29 树（meetwise-ag29）——零第二同名树。
- `git branch -a` 无 ag29 字样分支；`ls ai-docs/delivery/harness/ | grep -i "ag29\|lease-attempts"` EXIT=1——**零同名刀卷**（`line/provision-lock-release-draft`=前半邻刀·非同名非本面）。
- 在飞交叠：`git log --all --oneline --grep="AG-29"` 恰 1 笔=`fce5aa22`（翻面注记文面·非码刀）——零在飞修复刀；同基线在飞 ag34（锁连接占用时长面）/ag35（legacy API 导出面）两 draft 树 `git status --short` 零输出·触面与本刀（interview-jobs.ts claim 谓词+requeue-backoff proof+本卷）**零交集**。→ 停止条件未触发·可落卷。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·全 40 hex @`98033ca8`）

| 文件 | blob | 关键行锚 |
|---|---|---|
| `packages/db/src/interview/interview-jobs.ts` | `c34863305b777b6814b7e0b005c69fcde3989376` | `:14-15` `MAX_INTERVIEW_JOB_ATTEMPTS=5`（自述「claim 续领上限=reaper 终结边界单一真相,claim 与 sweep 共用,杜绝 off-by-one 死循环/早夭」）·`:18` 退避封顶 300s·`:154` claim `attempts=attempts+1`·**:162 queued 臂仅退避时闸（`next_attempt_at IS NULL OR <=now()`）无 attempts 谓词**·`:163` running 过期臂 `attempts<$4`·`:290-302` requeueInterviewJob（`:297` 写 `2^attempts` 封顶退避）·`:324-326` sweep 注释自认「claim 谓词单选形无终态路径,rev2 E2 披露」·`:334` running≥MAX→failed·`:347` queued≥MAX→failed(reaped:retry_exhausted) |
| `apps/worker/src/interview-consumer.ts` | `b608da1a16295566cbc03d22136e8d616c09c1cf` | `:285-307` requeueOrTerminalizeExhausted（**:288 attempts≥MAX→markJobFailed retry_exhausted+终态+退款**·`:302` 唯一 requeue 写点）·调用点全集 `:330`（privacy fenced）/`:591`（fence unavailable）/`:606`（transient 白名单）·`:631-657` reapStuckInterviewJobs（`:633` sweep+`:651` purge）·`:657-663` interviewDispatchTick **先收割后 drain** |
| `packages/db/src/interview/interview-graph-lease.ts` | `bb5bf73acbc208d35a11a24efd945942b09f7265` | `:25` `pg_advisory_xact_lock` 单短事务=前半 provision-lock-release 已落机证（锁随 COMMIT 自释·连接即归池·unlock 调用在面试租约路径已不存在） |
| `apps/worker/test/requeue-backoff.proof.ts` | `12c46f517d6ea61e9f9b46a7e33af55aa95b854f` | `:14-16` 头注臂⑤自述「attempts 不自增=收割先于 drain 不入领…rev2 E2：claim 谓词单选形无终态路径」·`:219` 臂⑤起·`:223-226` 滞留行 fixture（queued+attempts=MAX+无退避=legacy 形态）·`:227` `interviewDispatchTick`（**件② 插点=:226 与 :227 之间**）·`:229-241` 收割终态化/不入领/幂等断言 |
| `packages/db/migrations/0175_interview_job_next_attempt_at.sql` | `ac234d442571849f96eba1796840d8f2b8aaecc2` | 退避列 expand-only 零索引（「时闸只闸 claim 领取面」）·目录 0216/0217 空缺·现 max=0218 |
| `ai-docs/delivery/ai-capability-review/issues-final.md` | `7bf0f03d00db44959af7c1983e7926d25d67e514` | AG-29 `:41`+`:371-383`（含翻面注记原文）——只读蓝本 |
| `scripts/ai-docs/public-text-policy.mjs` | `f3b183ee0491f7c854b8548fe1e8953eded1f8d5` | `:135` `MAX_FILES = 2_338`（docs cap 现值·起草树 docs:check 实测 **2331**·本卷 +1=2332） |

### 0.2 判词复核定谳（起草席读码面·**judged 运行面已闭·结构披露面留此一刀·诚实第一**）

1. **requeue 路径全集届树重 pin**（派单引 :265/:269/:279/:313/:317/:322 系复核快照行号）：届树=consumer 三调用点 `:330`/`:591`/`:606` 全部汇入 `requeueOrTerminalizeExhausted`（`:288` 上限闸）→ 唯一写点 `:302` `requeueInterviewJob`（全仓 grep 产品码恰此一处调用·db 侧 `:290-302` 同拍写退避）；收割面=`:633` sweep（`:334` running≥MAX 终态/`:342` rq 臂仅 attempts<MAX 回池/`:347` queued≥MAX 终态）·每 dispatch tick 先收割后 drain（`:663`）。
2. **attempts 上限现状=已落（派单前提「上限半未动」届树勘误·如实录）**：AG-04 刀C 三层闸全在——writer 闸（`:288`·attempts≥5 即终态 retry_exhausted+事件+退款）+claim running 过期臂（`:163` attempts<5 方可重领）+sweep 结构闸（`:334`/`:347`）+退避时闸（`:162`·0175 列·防 5s 消费拍内烧光次数）。judged 缺陷「反复 requeue 无上限」届树**不可达**：至多恰 5 次 claim（第 5 次失败即被 writer 闸终态）。台账 `:381` 翻面注记 2026-10-16 与树相符（fce5aa22·其引 migrate.ts:394 现漂 `:413`·注记级）。
3. **前半已落亲证（勿重做）**：lease `:25` 事务级锁于单短事务内·锁随 COMMIT 自释；面试租约路径已无 unlock 调用可败；全仓 session 级 `pg_advisory_lock` 仅 migrate.ts `:413`/`:597`+principal.ts `:298`/`:563`（迁移串行化/qbank provision·均 AG-29 指涉面外）。
4. **唯一可辩护残面**：`:162` queued 臂无 attempts 谓词——queued≥MAX 行退避到点后仍可被领一次（`:324-326` 自认 rev2 E2 披露面·sweep 为唯一终态化面）。可达性=现行写面**不可产出**该类行（writer 闸终态先于 requeue·rq 臂仅 attempts<MAX 回池）·仅存量 legacy 行可现·收割拍每 tick 先行即终态化（proof 臂⑤ `:14-16` 亦同词披露）。邻刀对照：0213=autovacuum reloptions 与 attempts 面零交；0175=退避列已扩·本刀零迁移动作。
5. **停止条件裁量**：「标的已修复」对 judged 运行面**成立**（见 2）——本卷据此收窄：不重做已落三层·只就结构披露面（4）落最小一刀·并陈零码翻面案（裁决项 1）·处置权归协调方。行漂均注记级·未超停止阈值。

## §1 修法（最小面·恰 1 SQL 谓词+1 additive 断言·零迁移零新常量零新文件）

### 件① claim queued 臂补 attempts 结构谓词

- `packages/db/src/interview/interview-jobs.ts` `:162`：queued 臂 `(j.next_attempt_at IS NULL OR j.next_attempt_at <= now())` 后加 `AND j.attempts < $4`（`$4`=既有 maxAttempts 形参=MAX_INTERVIEW_JOB_ATTEMPTS·与 `:163` running 过期臂同参同谓词形）；`:159-161` 注记块补一行（「queued 臂同闸——claim 侧两臂统一续领上限·legacy≥MAX 行拒领待收割终态化」）。
- **N 取值依据**：单一真相常量 `:15` 已有（5=claim 续领上限=reaper 终结边界·claim/sweep 共用防 off-by-one）——谓词使 `:14` 自述对 claim 两臂同时为真：上限自「writer 纪律+收割兜底」升为 DB 读路径结构闸=第三独立层；后继刀在「只增」白名单区新增绕闸写点时不再复活活锁。
- **零行为变更论证**：现行可产出 queued 行 attempts 恒 ≤MAX-1（§0.2-4）恒过闸·新入队行 attempts=0 恒过闸；仅不可产出的 legacy≥MAX 行由「可领一次再靠收割」变「拒领直待收割」——sweep 终态化面（`:347`）与事件/退款语义零变（拒绝领取≠终态·单选形设计维持）。

### 件② proof additive 负例断言（requeue-backoff.proof.ts 臂⑤ 前置插点）

- `apps/worker/test/requeue-backoff.proof.ts` `:226` 与 `:227` 之间（滞留行 fixture 断言后·`interviewDispatchTick` 前）插一断言：直接 `claimNextInterviewJob` 返回 **null**（谓词拒领·行保持 queued·attempts 不自增）。改前该行（queued+attempts=MAX+退避 NULL）必被领=mark-red 判别面·改后绿。臂⑤ 既有断言（收割终态化/attempts 恒 MAX/二次幂等/终态后零领取）原样全绿——谓词只强化「不入领」性质·零断言冲突（逐条比对亲证）。

### §1.2 触面矩阵

恰 **3 tracked**：interview-jobs.ts 1+requeue-backoff.proof.ts 1+本卷 1——零迁移（attempts 列 0001_baseline 已有·0175 退避列已扩·**0216/0217 空缺勿补·无 0219**）·零 worker 产品码触（consumer 三调用点+`:288` 闸零字节）·零 env 闸零新增·零新依赖。

### §1.3 否决（五面）

- **甲=无限退避替上限**（解除 300s 封顶让毒行自然沉寂）：退避节流速率不节次数——2^n 无界溢出·且封顶解除后毒行每拍照旧循环·judged 活锁面原样；北星=终态+退款（无静默死胡同+无额度泄漏）非永悬。Ban。
- **乙=全局/每 owner 并发帽替代**（MAX_INTERVIEW_PER_OWNER_QUEUED=3 已有）：深度帽闸入队不闸重领——单条毒行在深度 1 内照旧循环·面外不正交。Ban。
- **丙=删除 requeue 语义**（瞬时错误直终态·无重试）：瞬时族（fence 交接/PG 超时/连接族/准入拒绝）合法可恢复·一刀终态=单次网络抖动即整场失败退款=可用性倒退；AG-04 刀C 白名单「只增不清」系既有裁定。Ban。
- **丁=新迁移 0219 加 retry_count/重置列**：attempts 列即单一真相·双计数列=off-by-one 早夭/死循环风险源·本刀零 schema 必要。Ban。
- **戊=直改 issues-final/LEDGER 翻面**：翻面权归协调方·本刀零 SSOT 触。Ban。

## §2 门矩阵（EXEC 立项届树亲跑·预申明八门）

①`pnpm -C apps/worker prove:requeue-backoff` EXIT=0（件② additive 断言绿+臂⑤ 原样全绿）；②`pnpm -C apps/worker prove:reaper` EXIT=0 原值（attempts=MAX-1/MAX 两边界回归·running 臂零触证）；③`pnpm -C apps/worker prove:adaptive-consumer` EXIT=0 原值（consumer 全链回归）；④`turbo typecheck --force` 全绿 0 cached；⑤`turbo lint --force` 全绿·worker **959**/db **1042** 计数恰等帽（`apps/worker/package.json:7`/`packages/db/package.json:11` 亲证）；⑥`node scripts/ai-docs/check-docs.mjs` EXIT=0·**2332≤2338**（起草树实测 2331+本卷 1·EXEC 届值如实录）；⑦markers：改动集五类标记词+行首冲突标记（词面运行时组装）0 命中亲跑；⑧`git diff --stat` 恰 **3 tracked**。零迁移故 uniqueness/migrate 门无。db 包无独立 interview-job prove 脚本（worker proof 直使 `@meetwise/db` 函数=覆盖面）·如实申明。**出站两门申明**：本刀零模型调用（proof=隔离 PG+错误注入·零 provider 外呼零 DNS 零 Key）→ provider-egress 两门不适用，如实申明。

## §3 裁决项（两件·两案并陈处标推荐）

1. **处置双案（并陈）**：**推荐=行使本刀**（件① 谓词收结构披露面·上限成三独立层·防绕闸写点复活活锁·成本=1 谓词+1 断言）；协裁=**零码翻面**（judged 运行面已闭 §0.2-2·披露面维持 rev2 E2 现状·issues-final AG-29 行按 `:381` 注记翻面·本卷留档即资产）。两案均不重做前半与已落三层。
2. **proof 载体**：**推荐=并入 requeue-backoff.proof.ts additive 一臂**（判别面同源·零新文件·0 tracked 增量）；协裁新立独立 proof 则触面 +1 tracked（4 tracked）须预申明。

## §5 Ban 面

migrations 0001-0218 零字节·零新迁移（0216/0217 空缺维持·不补 0219）；consumer 三调用点+`:288` 闸+TRANSIENT 白名单零字节（已落三层零重做·「只增不清」Ban 沿袭）；sweep 四臂语义零变（终态化面唯一性维持·谓词只拒领不终态）；quiz/diagnosis 两队列零触（面外自有上限闸）；0175 列语义零触；SSOT 四卷+issues-final 零触；⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 停止条件与 STOP

- 停止四类（现场漂移超注记级/机制不满足/越界需要/验收红不可修）：**「标的已修复」半触发**（§0.2-2 运行面已闭）→ 按裁决项 1 并陈收窄落卷·处置权归协调方——非弃卷·漂移均注记级（§0.2-2/3 亲证）。
- **本卷 STOP=`draft:awaiting_pre_exec_dual`**（三处同值：Status 头+本节+卷尾注）·pre-exec 双审两独立外席待派→Dual PASS→协调方授权 EXEC·翻面权归协调方·alone≠dual·Ban self-approve。
- **est live=0**（proof=隔离 PG+错误注入·零模型外呼零 DNS·0 Key 值·`actualSpendCny=null`）·零 env 闸零新增。
- **STOP=`draft:awaiting_pre_exec_dual`**（与 Status 头/§8 同值第三处）·起草落卷即停·⛔push。

---

卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·起草 2026-10-22 落卷·基线 `98033ca8`·派单前提「attempts 上限半未动」届树勘误已录（§0.2-2·AG-04 刀C 三层闸已落·judged 运行面已闭）·本卷收窄为 claim queued 臂结构披露面最小一刀（件① 谓词+件② 判别断言）+零码翻面案并陈（裁决项 1）·est live=0·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase 未用·翻面权归协调方·alone≠dual·Ban self-approve。
