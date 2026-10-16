# REQUEUE-FIXTURE-FIX REQUEST — requeue-backoff.proof 同 owner 连排 5 笔入队撞 #117 饱和闸夹具适配刀（第 4 笔 STRID EXIT=1 · claim-drain 消账形 · 单文件测试夹具面 · 快速链一体席 · 沿 Q2-VSF 先例 · STOP=`draft:awaiting_exec`）

**Status**: **`draft:awaiting_exec`**（2026-10-16 起草席落卷 · 快速链=诊断→起草→自审（窄域五项）→EXEC→STOP 同席连行使（协调方派单 brief 明示·总时长 40 分钟）· 修法裁决=b 随派单已定（post 席1 裁定「纯时序修复不可行·修复形二择」·协调方裁 b=claim-drain 清空 queued 再排后两笔·保同 owner 语义·轻）· post-prove 双审归协调方派席 · alone≠dual · Ban self-approve · est live=0 · `actualSpendCny=null` · ⛔push · ⛔merge 主线 · STOP 三处锚定=①卷头标题行②本 Status 行③§8 节 · 卷尾不载 STOP 值）

**席位**：REQUEUE-FIXTURE-FIX 诊断+起草+EXEC 一体席·测试夹具面（协调方派单 2026-10-16 · QUEUE-CLOSEOUT post 双审定谳跨刀遗留 · 沿 Q2-VSF 快速链先例形 · ⛔push）。
**基线**：`feat/mysql-schema-skeleton` @ **`d4d2155f`**（`git fetch` 后亲证 `origin/feat/mysql-schema-skeleton` tip=`d4d2155f` **恰等派单下界**（≥ 以等号成立·G7W-DIAG-NEEDLES nail 波 tip））· worktree **`meetwise-rqf`**（仓根同级 · `git worktree add ../meetwise-rqf -b line/requeue-fixture-fix` 本席亲立）· branch **`line/requeue-fixture-fix`**。
**立项出处**：①协调方派单 brief（2026-10-16 · QUEUE-CLOSEOUT post 双审定谳=requeue-backoff.proof.ts:118-126 同 owner 连排 5 笔 queued start·第 4 笔 STRID(:126) 时 queued 深度=3 撞 #117 饱和闸（MAX_INTERVIEW_PER_OWNER_QUEUED=3·interview-jobs.ts:89-90）→0 臂执行 EXIT=1 · 跨刀遗留=#117 queue-enqueue-bp 并线后 fixture 未随迁 · 基线红=QUEUE EXEC 席净树对照同值实锤）；②本席本树 @`d4d2155f` 亲跑复现（改前红 `pnpm requeue-backoff:prove` EXIT=1 · `Error: interview_queue_saturated` @interview-jobs.ts:90 ← proof.ts:126 · 全文=§1.1）；③修法裁决随派单已定=**案 b（claim-drain 清空 queued 再排后两笔）**（post 席1：纯时序修复不可行——parkDue 远期退避行仍占深度·闸谓词只认 status='queued' 无时间过滤 :86-88；a=per-owner 拆分+断言域 per-owner 化（重）否决）；④结构范本=`harness/q2-validate-scene-fix-REQUEST.md`（Q2-VSF 快速链一体席+闸前消账先例 `a480c7e1`）+`harness/queue-enqueue-bp-REQUEST.md`（#117 闸本卷·闸语义六裁决记录 `b549dabf`）。

---

## §0 现状锚（起草席亲证 · 全部 Read/git hash-object 实测 @`d4d2155f` · EXEC 同席锚零漂直接落码；行锚漂移超 ±3 且结论受影响 → §8 停止条件①）

### 0.1 blob 锚表（`git hash-object` 亲算 8 hex · @`d4d2155f` 亲读）

| # | 文件 | blob | 关键行锚（@`d4d2155f` 亲读） |
|---|------|------|------|
| 1 | `apps/worker/test/requeue-backoff.proof.ts` | `2dbe7c33`（248 行·30 `A(` 断言） | **`:123`-`:127` 五笔连排入队正身**（TID/DID/CAPID/STRID/GID 全 kind='start' seq=0 同 OWNER=`agc-requeue-${pid}`·`:126` STRID=第 4 笔撞闸点）·`:128`-`:131` parkDue(CAPID/STRID/GID) 远期退避（各臂独占可领集）·`:120`-`:122` reserveEntitlement×3（TID/DID/STRID 各 1.0·`:132` reservedBalance 断言锚）·五臂断言域：①瞬时臂 `:142`-`:153`（TID·claims earliest·attempts===1·退避 2s）·②确定性臂 `:155`-`:165`（DID·failed+job_failed 事件+退款+1.0）·①b 时闸面 `:167`-`:176`（TID probe·attempts 1→2·退避 4s）·③+④超限臂 `:178`-`:200`（TID 循环 backdate→drain attempts 3..MAX=5·deltas=[2,4,8,16]·retry_exhausted:57014 终态+退款）·③b 封顶臂 `:202`-`:208`（**CAPID 直 UPDATE 形 `:204`-`:205`**→requeue 封顶 300s）·⑤滞留行臂 `:210`-`:241`（**STRID 直 UPDATE 形 `:212`-`:214`**·tick 收割 `:218`·二次 reap 幂等 `:230`-`:234`·cap 同拍收割 erratum `:237`-`:239`·**GID 零触面 `:240`-`:241`** queued attempts=0） |
| 2 | `packages/db/src/interview/interview-jobs.ts` | `fbd43616`（367 行·**本刀只读零触**） | `:25` MAX_INTERVIEW_PER_OWNER_QUEUED=3 · **`:84`-`:91` 饱和闸正身**（`:79` per-owner advisory xact lock·`:80`-`:83` 幂等重放预查豁免·`:85`-`:88` depth count **谓词只认 `status='queued'` 无时间过滤**·`:89`-`:90` ≥N → throw `interview_queue_saturated`）·`:143`-`:188` claimNextInterviewJob（`:162` 退避时闸谓词：queued 且 next_attempt_at 未到不领·NULL=立即可领）·`:261`-`:267` markJobDone（**消费终态形=status='done'+lease_owner=NULL**）·`:277`-`:285` requeueInterviewJob · `:309`-`:332` sweepStuckInterviewJobs（⑤ 收割面：queued 且 attempts≥MAX 终态化） |
| 3 | `apps/worker/src/interview-consumer.ts` | `265798df`（660 行·**只读零触**） | `:301` drainInterviewJobOnce（claim 择早 (seq,created_at)）·`:606` reapStuckInterviewJobs · `:632`-`:657` interviewDispatchTick（先 reap 后 drain·`enumerateOwnersWithJobs` 只认 queued/expired-running） |
| 4 | `ai-docs/delivery/harness/q2-validate-scene-fix-REQUEST.md` | `a480c7e1`（172 行） | **消账先例**：§1 闸前清 userA queued（「模拟 worker 已消费积压(仅 queued 受闸·窄谓词不触他行他主)」）·Q2 六裁决既定（案A/per-owner/N=3/429/预查豁免/收紧形） |
| 5 | `ai-docs/delivery/harness/queue-enqueue-bp-REQUEST.md` | `b549dabf`（229 行） | #117 闸本卷（六裁决件行使记录·N=3 翻面权既定） |
| 6 | `scripts/ai-docs/public-text-policy.mjs` | — | `:104` MAX_FILES=2_208（docs cap 现值·基线 2206 余 2·落卷后预期 2207 余 1） |
| 7 | `scripts/i6-239-gates.proof.mjs` | — | `:151`-`:163` markers 五类词族（运行时组装·本卷词面不复抄防自匹配）+冲突标记对 |
| 8 | `apps/worker/package.json` | — | `prove:requeue-backoff => tsx test/requeue-backoff.proof.ts`（run-e2e-isolated.mjs `:813`-`:815`+`:2379`-`:2380` 注册 `requeue-backoff:prove:raw`·tsconfig include src+test=typecheck 面覆盖） |

### 1.1 诊断（红事实 · 本席 @`d4d2155f` 亲跑 + 源级亲证）

- **改前红实锤（本席本树亲跑）**：`pnpm requeue-backoff:prove` EXIT=1 · 隔离库（migrations applied=204·0204 头）boot 后 proof **零臂输出即崩**：`Error: interview_queue_saturated` at `interview-jobs.ts:90:27` ← `requeue-backoff.proof.ts:126:3`（第 4 笔 STRID enqueue）· `main().catch → process.exit(1)`。
- **时序推演（逐笔）**：TID 入队时 queued 深度 0→1 · DID 1→2 · CAPID 2→3 · **STRID 深度=3 ≥ N=3 → 拒**（闸在 INSERT 前·同事务）· GID 未达。
- **纯时序修复不可行（post 席1 裁定承引+源级亲证）**：`:129`-`:131` parkDue 先行于入队不可解——闸 count 谓词 `:85`-`:88` 只认 `status='queued'` **无 `next_attempt_at` 时间过滤**，远期退避行照样占深度；先 park 后排同撞。
- **各臂断言域（改后语义保真核·5 臂全数保持）**：①②臂依赖 TID/DID 为**同 owner 可领集前两早**（claim 择早 (seq,created_at)·`:19` 夹具注释明示）；③b/⑤臂依赖 CAPID/STRID 行**存在且可被夹具直 UPDATE 覆写**（`:204`/`:212` 现有夹具形）；⑤臂依赖 GID 全程 queued attempts=0 零触（`:240`-`:241`）。**五臂无一依赖「入队时 queued 深度」本身**——深度只被闸消费，故夹具可在入队窗口内模拟 worker 消费而不触任何断言域。

## §1-修法（裁决 b 已随派单定稿 · requeue-backoff.proof.ts 单文件恰几行 · claim-drain 消账形）

`apps/worker/test/requeue-backoff.proof.ts` 两处**纯插入**（+9/−0）：**插入甲**=`:125`（CAPID 入队）与 `:126`（STRID 入队）之间恰 5 行（3 注释+2 落码）；**插入乙**=`:127`（GID 入队）与 `:128`（parkDue 注释行）之间恰 4 行（2 注释+2 落码）。既有行零改零删零重排（`:123`-`:131` 五笔序列与 parkDue 原位保持）。

**插入甲（第 3 笔后·第 4 笔前·模拟 worker 消费清空 queued=深度 3→0）**：

```ts
  // [REQUEUE-FIXTURE-FIX] #117 并线夹具适配:上三笔后同 owner queued 深度=3 已达背压闸
  // (MAX_INTERVIEW_PER_OWNER_QUEUED=3·interview-jobs.ts:89-90),第 4/5 笔入队前模拟 worker 消费
  // 清空 queued(done=markJobDone 消费终态形·窄谓词仅触本 owner queued 行·沿 Q2-VSF 消账先例)。
  await asPrincipal(pool, OWNER, (c) => c.query(
    "UPDATE interview_job SET status='done', lease_owner=NULL WHERE owner_user_id=$1 AND status='queued'", [OWNER]));
```

**插入乙（第 5 笔后·parkDue 前·三笔恢复 queued 入队原形=①-⑤ 各臂断言域零变）**：

```ts
  // [REQUEUE-FIXTURE-FIX] 消费还原:三笔恢复 queued 入队原形(attempts 未触恒 0·next_attempt_at=NULL),
  // 各臂断言域零变(claim 择早序=created_at 未动·③b/⑤ 直 UPDATE 面与 GID 零触面保持)。
  await asPrincipal(pool, OWNER, (c) => c.query(
    "UPDATE interview_job SET status='queued', lease_owner=NULL, next_attempt_at=NULL WHERE owner_user_id=$1 AND status='done'", [OWNER]));
```

**语义保真核（五臂逐一）**：
- 消费形为何 UPDATE-to-done 而非 claim 形（claimNextInterviewJob+markJobDone）：claim 自增 attempts（0→1）——①臂 `attempts===1` 断言与 ③+④臂退避序列锚 `[2,4,8,16]=2^attempts` 会被夹具预增破坏，还原须第三次写 attempts=0；直 UPDATE-to-done 逐字节落 markJobDone 消费终态形（status='done'+lease_owner=NULL）零副作用，最短可判定。
- 还原为何必需：TID/DID 须为①②臂可领前两早；CAPID/STRID 须为③b/⑤臂直 UPDATE 面存在行。还原谓词 `status='done'` 窄域恰触本夹具三行（本时点 owner 下 done 恰此三行·OWNER 含 pid 唯一）。
- **①臂**：TID queued+attempts=0+NULL due 还原原态 → drain 择早领取（STRID/GID 虽先于 parkDue 暂为 NULL due，但 created_at 晚于 TID/DID——择早序不变；且本臂运行前 `:153` parkDue(TID) 已断言完毕落位）→ PASS 域零变。**②臂**：同理由 DID 次早领取。**①b/③+④臂**：全走 TID，时序同上。**③b 臂**：CAPID 行在（还原保证）→ 直 UPDATE 面`:204` 照常。**⑤臂**：STRID 行在→直 UPDATE 面 `:212` 照常；GID 还原 queued+attempts=0→parkDue 远期→`:240`-`:241` 零触断言照常。
- **失败响度（零新断言之理由）**：消费 UPDATE 若失效→STRID 入队当场 throw `interview_queue_saturated` EXIT=1（闸即断言）；还原若失效→①臂 `r1==='retry'` FAIL。两处失效均响，无需新增断言=**30 `A(` 断言数与文本逐字节零变**。

## §1.3 否决清单（veto · EXEC/自审违反任一即 FAIL）

1. **Ban 修法案 a（per-owner 拆分）**：断言域 per-owner 化=五臂夹具全链重写（resume/bucket/interview×N seed+各臂 OWNER 化），违派单裁决 b 与「恰几行」约束。
2. **Ban 调大 N / 闸语义弱化**：改 MAX_INTERVIEW_PER_OWNER_QUEUED 或放宽 count 谓词=产品码触+违 Q2 六裁决件③（N=3 既定·翻面权归协调方）。
3. **Ban 产品码触**：interview-jobs.ts / interview-consumer.ts / api/worker 产品面及迁移/依赖零字节改（闸语义=#117 既定·§0.1 #2/#3 只读）。
4. **Ban 断言弱化**：既有 30 `A(` 断言原文零改零删零跳过——Ban 删断言/改期望值为绿；Ban retry-to-green（红绿两证全量落档·只留绿 attempt 即 FAIL）。
5. **Ban 窄谓词超界**：两 UPDATE 谓词仅 `owner_user_id=$1 AND status=…`——不触他 owner/他状态/他表；零迁移零新表。
6. **Ban SSOT 行本体触**：LEDGER / checklist / backlog / SOP 零字节改（行翻面权归协调方·本刀不自建 SSOT 行）。
7. **Ban self-approve / post-prove 代行**（post 双审归协调方派席 · alone≠dual）· **Ban push / force-push / merge 主线** · **Ban 触 §3 全部域**。

## §3 范围外（边界清单 · 越界即 FAIL）

产品码全 family（packages/db/src/**、apps/worker/src/**、apps/api/**）·迁移（packages/db/migrations/**）·依赖/lockfile·worker 面其他证明件本体语义（reaper.proof.ts / interview.proof.ts 只跑不改）·SSOT 四卷·neg-interview 本体。本刀=**单测试夹具文件+本卷 .md** 两 tracked 面。

## §2 门矩阵（每条可独立判定 · §9 EXEC 记录逐门落结果）

| # | 门 | 命令/判据 | 判定 |
|---|-----|-----------|------|
| 1 | requeue-backoff **双向** | `pnpm requeue-backoff:prove`（隔离库·migrations 0204） | **改前红**（本席 @`d4d2155f` 亲跑 EXIT=1·`interview_queue_saturated`@proof:126·§1.1）→ **改后绿**：EXIT=0·30/30 全 PASS（`✓ AG-04 刀C …全部通过`·断言分母 30 恰等基线） |
| 2 | 邻面 reaper | `node scripts/run-e2e-isolated.mjs reaper:prove:raw` | EXIT=0 全 PASS（消费族收割面零回退） |
| 3 | 邻面 queue-enqueue-bp 承重面 | `node scripts/run-e2e-isolated.mjs interview:prove:raw`（worker interview.proof.ts `:567`-`:595` 饱和判别臂/per-owner 维度臂在册） | EXIT=0 全 PASS（闸语义零回退） |
| 4 | 邻面 neg interview 段 | `node scripts/run-e2e-isolated.mjs neg:interview`（neg-interview.proof.ts §10 429 映射臂在册） | EXIT=0 全 PASS |
| 5 | typecheck | `pnpm turbo typecheck --force` | EXIT=0（8/8·worker tsconfig include test 覆盖本刀文件） |
| 6 | lint | `pnpm lint`（root eslint --max-warnings 5235） | EXIT=0 零新警告（5235 恰等 pin） |
| 7 | docs:check | `node scripts/ai-docs/check-docs.mjs` | EXIT=0 **2207 ≤ cap 2208 余 1**（基线 2206 本席亲跑+本卷 1·恰等派单预期） |
| 8 | markers 五类 | 改动集 grep（词族=`i6-239-gates.proof.mjs:151`-`:163` 运行时组装四词+冲突标记对·词面不复抄防自匹配） | **零命中**（改动集=proof.ts+本卷 .md） |
| 9 | diff 面 | `git status --porcelain` + `git diff --numstat` | 恰 2 tracked=本卷 .md（起草+§9 增补）+proof.ts（**+9/−0** 纯插入）；migrations/pnpm-lock.yaml 零 delta |

## §8 STOP（开工三条款）+ 停止条件

**STOP · `draft:awaiting_exec`（起草态·本值为卷内三处锚定=①卷头标题行②Status 行③本节 · 卷尾不载 STOP 值）。** 快速链开工三条款：①协调方派单令+修法裁决 b 随单已定=**已兑现**；②快速链授权（沿 Q2-VSF 先例·起草→自审→EXEC 同席连行使）=**已兑现**（派单 brief 明示「总时长 40 分钟」）；③⛔push（并线/推送归协调方）=**兑现中**（本刀零 push 零 merge 主线）。EXEC 面落卷后本值翻 `executed:awaiting_post_prove_dual`（§9 七字段随卷·三处同翻）。

**停止条件（四类 · 命中即停手上报）**：
1. **现场漂移**：EXEC 面对届时 tip 重 pin——§0.1 锚漂移超 ±3 且结论受影响、或 `:123`-`:131` 序列块被他刀改写 → 停手上报。
2. **机制不满足**：若改后 requeue-backoff 仍红且归因非本刀夹具面（如闸谓词/时闸语义与 §0.1 #2 锚不符）→ 停手上报回炉（不得就地改定性、Ban 为绿改产品码）。
3. **越界需要**：执行中若需触 §3 任何域 → 停手上报。
4. **验收红不可修**：门矩阵任一门红且无法在本刀范围内归因修复 → 停手上报（Ban 为绿放宽门）。
