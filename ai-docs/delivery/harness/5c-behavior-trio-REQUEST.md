# 5C-BEHAVIOR-TRIO REQUEST（5C 行为面三件小刀·issues-master 第5批-C 四件 #1/#8/#12/#19 一卷四件独立可停·5E-CLEANUP-SWEEP §1-簇B 剔除归槽承接卷·docs-only 起草·体量 M）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-10-16 诊断+起草席落卷·⛔push ⛔merge主线 ⛔force push · alone≠dual · Ban self-approve · Dual PASS ≠ 开工 · est live=0）

**席位**：meetwise 战役 5C 行为面「BEHAVIOR-TRIO 行为面三件小刀」诊断+起草席（5E EXEC 簇B 归槽呈报承接：#1/#8/#12/#19→5C 行为面·北星 loop·起草 only 零码动）。
**基线**：`feat/mysql-schema-skeleton` @ `3cd159dd`（本席亲跑 `git fetch origin` 后 `origin/feat/mysql-schema-skeleton` tip=`3cd159dd` 同值亲证=tip≥3cd159dd 等号成立；origin/main tip=`112e6d26` 系 `3cd159dd` 祖先 `git merge-base --is-ancestor` 亲证）。分支 `line/5c-behavior-trio`·工作树 `meetwise-b3`（`git worktree add ../meetwise-b3 -b line/5c-behavior-trio` 本席已立·建前 `git worktree list` 实查该路径空闲·建后 tip `3cd159dd` 亲证）。
**蓝本**：①审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` 逐行原文（#1 `:360`/#8 `:363`/#12 `:364`/#19 `:367`·外部只读蓝本·批次列=第5批-C 可靠性/运维/API·状态「仍存在/部分修复」）②5E-CLEANUP-SWEEP 卷 `5e-cleanup-sweep-REQUEST.md` §0.1-c 类表+§1-簇B（四件剔除归槽登记「#1/#8/#12/#19→5C 行为面·归协调方派单裁」·LEDGER `:89` 行尾 5 token 保留零删·剔除登记句已随 5E EXEC 落卷）③LEDGER `ai-docs/delivery/harness/product-campaign-LEDGER.md` `:87`（5C 可靠性批 52 行=四件归属批行·post-prove 后翻面载体）+`:89`（5E 行 W9 尾组四 token 枚举原文）④邻卷形制=admin-disable-evict-REQUEST（§8 停止条件四类标准源+neg 687 门形）+5e-cleanup-sweep-REQUEST（§0/§5/§7 形制）⑤协调方派单 brief 2026-10-16（5E EXEC 簇B 呈报定谳：#1 死函数/№8 终态写缺/#12 eventKey 缺省/#19 report-worker 同族）。

## §0 现状锚+诊断定稿（四件逐件·三源对勘=issues-master 更正版原文×5E 簇B 呈报×实树读码亲证 @`3cd159dd`）

### 0.0 防重检查记录（强制项·起草席实跑）

- `ls ai-docs/delivery/harness/ | grep -iE "5c|behavior|trio"` → 命中=本卷 `5c-behavior-trio-REQUEST.md`（本席新建前**零命中**=无同名卷亲证）+`5e-behavior-REQUEST.md`（5E 批 #27 面卷·非本卷域）+`g7-trio-*`/`g7trio*` 五件（G7 车道域·非行为面）——**无同域刀卷**·本卷成立。
- 工作树面：`git worktree list` 实查 `meetwise-b3` 建前空闲·建后在册（分支 `line/5c-behavior-trio`@`3cd159dd`）·邻 47+ 树零触。
- 锚漂移预检：四件实锚全部本席 @`3cd159dd` Read 亲读（非转引）·行号锚见 §0.1 表。

### 0.1 锚表（四件逐件·issues-master 原文×现状核×诊断定谳）

| 件 | issues-master 更正版（行号·原文要点·状态） | 现状核（实树亲证锚 @`3cd159dd`·本席逐文件 Read） | 诊断定谳 |
|---|---|---|---|
| #1 | `:360` P3·空闲放弃后 interview_question 仍 issued（cancelOpenInterviewQuestion 无生产调用方），列表 current_turn 把它算待答；建议=在 abandonInterviewAndRelease 与空闲回收路径内同事务调用｜**仍存在** | 定义 `packages/db/src/interview/interview-question.ts:139`+导出 `packages/db/src/index.ts:155`；全仓生产调用方**零命中**（唯一调用方=`packages/db/test/rag05-qbank-miss.proof.ts` `:24` 导入+`:375`/`:440` 两处测试夹具调用·幂等 UPDATE 形）；伤害链现 tip 仍真实=`apps/api/src/modules/interview/interview.service.ts:692`/`:728` `max(iq.turn) FILTER (WHERE iq.status='issued') AS current_turn` → `apps/web/lib/interview/progress.ts:20` 渲染「第 N 题待答」；接线点在位=用户放弃臂 `interview.service.ts:631`→`abandonInterviewAndRelease`（`packages/db/src/commerce/commerce.ts:471`·收口 chokepoint=`finishAbandon` `:464-469`）+空闲回收臂 `apps/worker/src/commerce-reconcile.ts:75`（主臂走 abandonInterviewAndRelease·soft-set 兜底臂 `:80-83` 绕过） | **接线（否决删·§1.3-1）**。双 wire 点：⑴ `finishAbandon`（一.href 覆盖用户放弃+对账主臂+already_abandoned 重放幂等）；⑵ `commerce-reconcile.ts:80-83` soft-set 臂后补显式 cancel（该臂绕过收口协议） |
| #8 | `:363` P3·ai_graph_run.status 已有 CHECK，但面试 completed 后 run 仍停 waiting_user，无 completed/succeeded 写入方；建议=在收尾事务内置终态并统一双终态｜**部分修复** | 已修半=`safelyTerminateAiGraphRunsOnAbandon`（`commerce.ts:447-462`·abandon 臂 safe_terminating→safely_terminated 两步 CAS·清 lease·`finishAbandon:467` 挂接）；缺修正主病灶=`completeInterviewAndConfirm`（`commerce.ts:339-392`）**零 ai_graph_run 写**——面试 created→completed CAS 成功后 run 行永停 waiting_user；释放面=`interview-graph-lease.ts:81-87` releaseInterviewGraphFence 恒写 waiting_user（无终态参数）；词表=0149 十一值+0194 终态冻结触发器（`OLD.status='completed' AND NEW≠OLD → RAISE 23514`·'completed'=kernel 纪元遗留零生产写点·**双终态并存保留=Ban 统一**）；done 臂时序=末次 fence 复核 `adaptive-lifecycle.ts:532` 先于收口 `:567`/`:577`·同事务其后零 assertInterviewGraphFence | **CAS 成功臂挂终态写**。值='succeeded'（非 'completed'·§1.3-2/3）·thread-wide 从集与 abandon 先例同形·清 lease+version+1 令 finally 释放天然 no-op（`releaseInterviewGraphFence` WHERE lease_owner/version 双失配→0 行→终态不被覆盖·不触 0194 冻结臂） |
| #12 | `:364` P3·空闲回收路径的 interview_unavailable 仍无 event_key，且不 cancel issued 题（consumer/lifecycle 已带 key）；建议=补 event_key interview_unavailable:\<id\>:reclaim，并同事务 cancel issued 题｜**部分修复** | 无 key 锚=`commerce-reconcile.ts:84` `appendEvent(c, owner, s.idempotencyKey, 'interview_unavailable', { reason: 'abandoned' })` 五参调用（文件头注 `:43` 自述「idempotencyKey=interviewId」与实现不符=注释先行实现滞后面）；已带 key 先例=`adaptive-lifecycle.ts:69` `assessment_unavailable:${reason}`/`:79` `'interview_unavailable:terminal'`+`interview-consumer.ts:162`/`:163` `interview_unavailable:${reason}`（reason∈job_failed/worker_died/retry_exhausted）；去重机制=`packages/db/src/interview-event.ts:23-38`（event_key 在场=prior 查询+`ON CONFLICT (stream_key,event_key) DO NOTHING` 幂等·**无 key 不去重**=审计病灶面）；cancel 半=件① 兑现（§1 交叉引用） | **补第 6 参** `interview_unavailable:${s.idempotencyKey}:reclaim`（issues-master 建议形逐字）。**值源核**：`<id>`=`s.idempotencyKey`=消费预留幂等键=interviewId=stream_key 本值（`commerce.ts:546` SweptReservation 契约+`:43` 注释+reconcile swept 语义三源互证）；去重域=per-stream（stream_key 已按面试隔离·键内 id 段为 ops 溯源冗余·刻意保留=§1.3-6） |
| #19 | `:367` P3·report_unavailable 与回收路径 interview_unavailable 仍无 event_key，appendEvent 无 key 时不去重；建议=为两类事件补 event_key｜**部分修复（重复风险低）** | 无 key 锚=`apps/worker/src/report-worker.ts:203` `appendEvent(c, owner, interviewId, 'report_unavailable', { reason: 'max_attempts_exceeded' })` 五参调用（sweepReportsOnce 隔离臂）；审计旧锚 `:68` 现系 #204 成长链 docstring 行（文件生长锚漂移·本卷重 pin=`:203`）；同文件 `:183` report_ready 亦无 key（审计未锚·范围外零触）；隔离 exactly-once 结构面=sweepReports 翻 quarantine 行锁（与 commerce swept 同形）→现有键=纵深防御非唯一防线 | **补第 6 参** `report_unavailable:${interviewId}:quarantine`（与件③ 同族同形=一卷一形 kind:id:phase）。值源=`interviewId`=`res.quarantinedInterviews` 元素=stream_key 本值（循环变量逐字同源） |

### 0.2 诊断统计与相互独立性

- **四件两簇**：eventKey 族=#12+#19（同族同形 kind:id:phase·两文件两行互不依赖）；终态/ledger 族=#1+#8（同文件 `commerce.ts` 不同函数·hunks 不相交：件① 触 import+`finishAbandon`·件② 触新 helper+`completeInterviewAndConfirm` CAS 成功臂）。
- **交叉引用一处**：#12 审计文的「并同事务 cancel issued 题」半由件①-⑵ 兑现（soft-set 臂 cancel 一行归属件①）·件③ 自身触面恰 `:84` 一行第 6 参——**零重复 hunks·单件可停不拖邻件**。
- **分桶**：四件全=码面行为件（非清理件·非产品决议件）·第5批-C 归槽无出入·a+b=4≥1 达起草线·本卷成立。

## §1 修法（四件逐处·EXEC 立项重 pin·每件独立可停·§8-2 单件法则）

### 件① #1 cancelOpenInterviewQuestion 接线（否决删·两 wire 点+一增臂）

- ⑴ `packages/db/src/commerce/commerce.ts`：import 区（`:22-24` 直引纪律区）追加 `import { cancelOpenInterviewQuestion } from '../interview/interview-question.ts';`（环安全亲证=interview-question.ts 零包内 import·仅 node:crypto+pg 类型）；`finishAbandon`（`:464-469`）内追加 `await cancelOpenInterviewQuestion(c, owner, interviewId);`（挂 `safelyTerminateAiGraphRunsOnAbandon` 同位=收口协议原子面·同 Client 同事务）。
  - **覆盖面亲证**：用户放弃（`interview.service.ts:631`）·对账主臂（`commerce-reconcile.ts:75`）·already_abandoned 重放（`commerce.ts:493`/`:513`·幂等 UPDATE 重放零害）——chokepoint 一 href 四臂。
  - **权限面亲证**：app_role 对 interview_question UPDATE 可达（rag05 proof `:375`/`:440` asPrincipal 实跑先例）。
  - **语义面亲证**：cancel 非删（`:438-440`「不删 interview_question=业务事实独立保全」不违·status 翻转=账本正常迁移）；cancelled 态令 `claimInterviewAnswer` 走既有 stale 臂（`interview-question.ts:94`/`:109` 客户端弃旧 token 契约面原样）。
  - `abandonInterviewAndRelease` docstring（`:432-441`）append 一行注记（#1 接线·open 题 cancelled 同事务）。
- ⑵ `apps/worker/src/commerce-reconcile.ts`：import 行（`:15` @meetwise/db token·index.ts:155 已导出）续接 `cancelOpenInterviewQuestion`；soft-set 兜底臂 UPDATE（`:80-83`）之后追加 `await cancelOpenInterviewQuestion(c, owner, s.idempotencyKey);`（该臂绕过 abandonInterviewAndRelease·不补则与主臂口径分裂）。
- ⑶ 伤害闭环：current_turn=`FILTER (WHERE iq.status='issued')`（`interview.service.ts:692`/`:728`）→abandon 后 issued 清零→`progress.ts:20`「第 N 题待答」残影消除（列表面零码改=读侧自然修复）。
- ⑷ 增臂裁决=**增**：`packages/db` `prove:uc018-abandon`（`test/uc-e2e-018-user-abandon.proof.ts`）新判别臂——abandon 后 open 题（issued/queued）status='cancelled'+current_turn 读数 NULL；**改前必做 run 该臂红**（现码 issued 残留）→改后绿。
- ⑸ 回归面：`prove:rag05-qbank-miss`（该函数现有唯一调用方）零改仍绿（函数体零触·仅增调用方）。

### 件② #8 ai_graph_run 面试完成后终态写（'succeeded' 形）

- ⑴ `packages/db/src/commerce/commerce.ts`：新增私有 helper（`safelyTerminateAiGraphRunsOnAbandon` `:447-462` 同构·一步形）：
  `UPDATE ai_graph_run SET status='succeeded', lease_owner=NULL, lease_expires_at=NULL, version=version+1 WHERE owner_user_id=$1 AND thread_id=$2 AND status IN ('created','active','waiting_user','migrating','paused','quarantined')`（thread-wide 从集与 abandon 先例逐字节同形——完成时点 career-path run 结构性不存在=deriveCareerPath 以 assessment_required 409 前置）。
- ⑵ 挂点=`completeInterviewAndConfirm` **CAS 成功臂**（`:379-381` `updated.rowCount===1` return 前·同事务原子）：面试 completed 与 run 终态同事务不可分（「唯一收口协议」语义自洽）；docstring（`:331-336`）append 注记一行。
- ⑶ 不覆盖性亲证链（EXEC 落码后复核）：终态写清 lease_owner+version+1 → `withInterviewGraphFence` finally 之 `releaseInterviewGraphFence`（`interview-graph-lease.ts:81-87` WHERE lease_owner=$4 AND version=$5）0 行 no-op → 终态存活；done 臂末次 fence 复核 `adaptive-lifecycle.ts:532` 先于收口 `:567`/`:577`·终态写后同事务零 `assertInterviewGraphFence`（本席 Read 亲证）。
- ⑷ 重试/重放安全亲证：'succeeded'→active 续约臂 0194 明文允许（career-path 成功后重复 POST 同走续约臂先例）→完成后 job 重放/重试走 `:41-46` 续约臂零 23514 新险（对照：'completed' 臂=§1.3-2 否决理由）。
- ⑸ 增臂裁决=**增**：`apps/worker` `prove:adaptive-life`（`test/adaptive-lifecycle.proof.ts`；备用面 `prove:adaptive-consumer` 现仅 count 断言不冲突）新判别臂——收口后 `ai_graph_run.status='succeeded'`+lease 双列 NULL；**改前必做 run 该臂红**（现码 waiting_user）→改后绿。
- ⑹ 范围外（§3）：failed 臂（`failInterviewAndRelease` :401-430）run 终态写——failure 族已有独立失败面（interview_job failed+markApplicationAssessmentUnavailable）·0194 failed→active=契约重试臂零触。

### 件③ #12 commerce-reconcile interview_unavailable 补 eventKey

- ⑴ `apps/worker/src/commerce-reconcile.ts:84`：appendEvent 增第 6 参 `'interview_unavailable:' + s.idempotencyKey + ':reclaim'`（issues-master `:364` 建议形逐字）。
- ⑵ 值源核（§0.1 表）：`s.idempotencyKey`=swept 消费预留幂等键=interviewId=stream_key（`commerce.ts:546` SweptReservation 契约+`commerce-reconcile.ts:43` 注释+swept 行锁 exactly-once 语义三源互证）——键内 id 段与 stream 同值系刻意冗余（ops 跨流溯源+键自描述·§1.3-6）。
- ⑶ 碰撞面亲证：全仓 interview_unavailable 键从集={'interview_unavailable:terminal'（lifecycle:79）, 'interview_unavailable:job_failed/worker_died/retry_exhausted'（consumer:163 formula）}∪空——`:reclaim` 形零碰撞。
- ⑷ cancel issued 题半=件①-⑵ 兑现（交叉引用·零重复 hunks·单件停不影响该半归属）。
- ⑸ 增臂裁决=**增**：`prove:commerce-reconcile` 新判别臂——interview_unavailable 行 event_key 恒等断言 + 重放拍零重发（现有 `:81`/`:136`/`:153` evCount===1 断言零改仍绿=kind/payload 不变面）。

### 件④ #19 report-worker report_unavailable 补 eventKey

- ⑴ `apps/worker/src/report-worker.ts:203`：appendEvent 增第 6 参 `'report_unavailable:' + interviewId + ':quarantine'`（与件③ 同族同形·一卷一形）。锚勘误登记：审计旧锚 `:68` 系 #204 成长链 docstring（文件生长漂移）·本卷重 pin=`:203` 实码行。
- ⑵ 值源=`interviewId`=`res.quarantinedInterviews` 循环元素=stream_key 本值（`:202` for-of 逐字同源）。
- ⑶ 增臂裁决=**增**：`prove:report`（`test/report-bulkhead.proof.ts`）新判别臂——report_unavailable 行 event_key 恒等断言；`:183` report_ready 无 key 面零触（范围外·审计未锚）。

## §1.3 否决（候选否决·全部有据·Ban EXEC 复活）

1. **#1 删除候选（派单默认候选）否决**：证据三连=①用户可见伤害现 tip 仍真实（current_turn FILTER issued+progress.ts:20·§0.1 亲证）；②issues-master `:360` 建议明文=「abandonInterviewAndRelease 与空闲回收路径内同事务调用」=接线非删；③删则 abandon/reclaim 两路径 issued 残留病灶**零修**（删函数≠删 bug·死函数系病灶症状非病灶本体）+rag05 夹具反需内联 SQL 重写=净 churn 零收益。删除候选仅在「伤害链已消失」前提下成立——前提亲证为伪。
2. **#8 'completed' 终态值否决**（issues-master 建议 `:363` 字面）：0194 冻结触发器使 completed 行**迁出即 23514**+0194 定谳 'completed'=kernel 纪元词表遗留零生产写点；写 completed 后 job 重放续约臂（lease :41-46 无 status 过滤）completed→active 必 23514=生产重试路径恒炸。
3. **#8 succeeded/completed 双终态统一否决**：0194 明文「双终态并存保留=Ban 业务语义变更」——统一诉求系 #152 已裁决面·本卷不复活。
4. **#8 存量 waiting_user 行回填否决**：迁移面越 checksum 铁律（§3-2）·存量行无消费方读终态值（adaptive-consumer proof 仅 count）·写点修复后新完成面试即正确。
5. **#8 failed 臂 run 终态写否决（范围外）**：审计只锚 completed 面；failure 族独立失败面在位；触之即扩 reaper/重试族面=越界（§8-3）。
6. **#12/#19 kind:reason 无 id 键形否决**（`interview_unavailable:abandoned`/`report_unavailable:max_attempts_exceeded`）：现时零碰撞但键稳定性耦合 payload 字面（reason 参数化即键漂移）·且同卷两件两形违背一卷一形——择 issues-master 建议形 kind:id:phase 统一。
7. **appendEvent 原语本体改造否决**（如无 key 自动派生/去重语义收紧）：interview-event.ts 头注「四原语是 DAG 最底层」·原语面零触·键由调用方显式补齐=最小改面。

## §2 门矩阵（EXEC 断言·断言力≥3·届时值实跑重 pin）

| # | 门 | 判据 |
|---|---|---|
| G1 | 受影响 prove 判别链（改前红→改后绿） | `pnpm -C packages/db prove:uc018-abandon`（件① 新臂）·`pnpm -C apps/worker prove:commerce-reconcile`（件③ 新臂+既有 exactly-once 零弱化）·`pnpm -C apps/worker prove:uc018-ttl`（件① 回收口径回归）·`pnpm -C apps/worker prove:adaptive-life`（件② 新臂）·`pnpm -C apps/worker prove:report`（件④ 新臂）·`pnpm -C packages/db prove:rag05-qbank-miss`（件① 既有调用方回归）——新臂改前必红（无判别力=空转绿嫌疑即停 §8-2）·改后全绿·PASS 名单对改前 diff=恰 +臂数·其余零弱化 |
| G2 | neg:all | `pnpm -C apps/api neg:all` EXIT=0·**687/687** 六段（auth 90+commerce 90+resume 91+interview 102+bend 179+input 135·段序沿 apps/api/package.json）——本卷四件触面在 db/worker·api neg 面预期零波动·diff≠∅ 即停如实归因 |
| G3 | typecheck | 根 `pnpm typecheck`+五包 turbo 面·5D 裁定 8/8 形·届时实跑值重 pin（本卷零类型新增面·import 均既有导出） |
| G4 | lint | `pnpm lint` 全绿贴边（root max-warnings 5235 基线·基线时值+届时值双登·+1 warning 即红） |
| G5 | docs:check | `node scripts/ai-docs/check-docs.mjs` EXIT=0·managed ≤cap **2200**（起草基线 2185+本卷 1=**2186**·余量 14·起草时点亲跑 EXIT=0 在案·EXEC 并线后实跑值如实记） |
| G6 | markers 五类标记词 | 净增行五类探针（冲突标记/假绿绕过词/测试门弱化/遗留标/secrets 样值·词面运行时组装防自指·沿 5e-cleanup G2 形）零命中 **0/0**+改动集全文件对账（既有命中逐行裁决=历史登记叙事·改前改后计数恒等） |
| G7 | diff 面+迁移零触 | 修法工作面=恰 4 产品文件（`packages/db/src/commerce/commerce.ts`+`apps/worker/src/commerce-reconcile.ts`+`apps/worker/src/report-worker.ts`+增臂测试文件 4 件内）·`git diff <base> -- packages/db/migrations`=空（checksum 铁律）·`git status` porcelain 无越面文件·本卷 .md 系起草面不计修法工作面 |
| G8 | est live=0 | 零模型真实外呼（prove 全 fakeModel/静态 DB 面）·零生产操作·零 secrets·零 SMTP |

**起草时点自检（本席亲跑）**：G5 EXIT=0·2185≤2200（本卷 +1 后 2186·余量 14）·G6 本卷 .md 五类探针 0 命中（§7）·diff 面=恰 1 新增 .md·零码面。

## §3 范围外（边界清单·越界即 FAIL）

1. 件② failed 臂/`failInterviewAndRelease` 族·reaper 族·`releaseInterviewGraphFence` 释放协议本体（§1.3-5/§1-件②-⑹）。
2. `packages/db/migrations/` 全目录字节零触（G7·0149 词表/0194 触发器零改）。
3. `interview-event.ts` 原语本体/`interview-graph-lease.ts` 零触（键调用方补齐·终态写挂收口协议侧·§1.3-7）。
4. report_ready 无 key 面（`:183`·审计未锚）/`assessment_unavailable:reservation_expired`（`:68` 已有 key）零触。
5. 四件审计文其余半（#1 hard-deps #128 面/#12 B 端臂）不在本卷——#128 已闭（LEDGER `:89` 5E 翻面在卷）。
6. est live=0：零模型真实外呼·零生产操作·零 secrets·零 SMTP。
7. ⛔push ⛔merge主线 ⛔force push（nail/推送归后继席·协调方派单）。

## §4 依赖

**零未决硬依赖**：四件触面全在本基线树（issues-master 硬依赖列 #1→#12/#128·#12→#1/#19·#19→#12——本卷四件一卷互为同卷件·无外部前置）。**并发面**：`commerce.ts` 系多刀热点（billing P3 等已并线收口·在飞 sse/obs/api-harden 族触面不交叠·本席 §0.1 锚 @`3cd159dd` 亲证在位）——EXEC 立项照例 fetch 重 pin（§8-1）。

## §5 Ban 列表 + pins（沿邻卷同源誊录+本卷面增补）

**Ban 列表**：Ban push/force push/merge 主线；Ban 自批（双审须独立外席）；Ban retry-to-green/masking/假绿叙事；Ban 翻 pins（十一值含 `actualSpendCny=null`）；Ban 改共享 SSOT（LEDGER/checklist/TASK-SOP-v2/issues-master 零触——本卷四件翻面归 post-prove 后继笔）；Ban 触 migrations/0149 词表/0194 触发器；Ban 触 §1.3 否决七项（尤其 'completed' 终态值与 #1 删除候选复活）；Ban 触 interview-event 原语本体与 interview-graph-lease；Ban 增臂无判别力（改前不红=空转绿嫌疑即停）；Ban 就地扩面（§8-3）；Ban 触其他工作树（worktree list 在册树零触）；Ban 伪造已问/已验来源；Ban 弱化既有产品承诺或安全语义；Ban secrets/`.env*`（Key name-only）；Ban G7 面/车道/live 套件；Ban Meridian；Ban buy cloud。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本卷起草全静态/读码/git 亲证·零模型外呼·零消耗）

## §6 est live=0

本卷起草零模型真实外呼：全部诊断=静态源读码+git 亲证（§0.1 逐锚 Read）；零生产操作·零 secrets·零 SMTP·零消耗（pins 脚注同源·EXEC 收据逐门登记零外呼口径——prove 套件全系 fakeModel/本地 DB·G8）。

## §7 markers=0（卫生声明）

本卷改动集（起草阶段恰 1 新增 .md=本卷）五类标记词 grep 零命中（起草席自检·命令与回执留 prove·五类标记词运行时组装不入卷防自指·沿 5E GROUP/5e-cleanup 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1 修法清单与 §1.3 否决与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin·漂移只更行号不改结论）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：

- **现场漂移**：EXEC 时点 tip 对 §0.1 任一实锚漂移且 §1 结论受疑（cancelOpenInterviewQuestion 被他线删除/接线·completeInterviewAndConfirm 收口协议改形·0194 触发器或 0149 词表改写·commerce-reconcile/report-worker 臂改形）→停·重 pin 回炉。
- **机制不满足（含单件法则）**：新臂改前不红（判别力缺失=空转绿嫌疑）或改后不绿→该件诊断被证伪→**该件停**（revert 该件 hunks）·**余件继续**（四件两簇 hunks 不相交亲证 §0.2·单件 revert 不拖邻件编译面）·如实登记归因；卷级门（G2 neg:all/G3 typecheck/G4 lint/G5 docs:check）红=全卷停·Ban 借机修邻面。
- **越界需要**：修法诉求超出 §1 申报面（需触 migrations/0149/0194/lease 释放协议/原语③/reaper 族）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（lint 贴边 +1 warning/docs:check 超届时 cap/邻套件新红）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

**待双审/EXEC 裁决项**：①件① 删除候选否决确认（派单默认候选=删·本卷证据三连否决改接线·§1.3-1——双审席若翻案须给出伤害链消失反证）；②件② 终态值 'succeeded' 裁定（§1.3-2/3 否决 'completed'/统一形后唯一可行值·0194 在卷）；③件③/件④ 键形 kind:id:phase 裁定（§1.3-6 vs kind:reason 形）；④增臂落点裁定（件② 备用面 adaptive-consumer vs adaptive-life·以两 proof 现有夹具可复用性实测定）。

---

*5C-BEHAVIOR-TRIO REQUEST · 2026-10-16 诊断+起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`3cd159dd`（fetch 后 origin/feat/mysql-schema-skeleton tip 同值亲证=tip≥3cd159dd 等号成立）· 分支 `line/5c-behavior-trio` · 工作树 `meetwise-b3`（本起草席立）· 立项出处=5E-CLEANUP-SWEEP §1-簇B 剔除归槽呈报（#1/#8/#12/#19→5C 行为面·LEDGER `:89` 五 token 保留零删）+协调方派单 brief 2026-10-16 · 四件=issues-master 第5批-C（#1 `:360` 仍存在/#8 `:363` 部分修复/#12 `:364` 部分修复/#19 `:367` 部分修复）· 诊断定谳=#1 接线（删候选否决·finishAbandon+soft-set 臂双 wire 点+current_turn 伤害链亲证）/#8 completeInterviewAndConfirm CAS 成功臂挂 'succeeded' 终态写（'completed' 0194 冻结否决·finally 释放 no-op 不覆盖链亲证）/#12 commerce-reconcile:84 补 `interview_unavailable:<id>:reclaim`（值源=s.idempotencyKey 三源互证）/#19 report-worker:203 补 `report_unavailable:<id>:quarantine`（审计旧锚 :68 系 #204 注释·重 pin :203）· 四件两簇 hunks 不相交·每件独立可停·增臂裁决=四件各增一判别臂（改前红→改后绿）· 否决七项在卷 · 门矩阵 G1-G8（受影响 prove 判别链+neg 687 六段+typecheck+lint 贴边+docs:check ≤cap 2200（基线 2185·本卷 +1=2186·余量 14）+markers 0/0+diff 面恰 4 产品文件+migrations 零触+est live=0）· 防重检查过（harness 无同名卷·5e-behavior/g7-trio 非本域）· est live=0 · pins 十一值照抄零翻 · markers=0 · 停止条件四类全设（单件法则=机制不满足类单件可停余件继续·卷级门红全卷停）· ⛔push ⛔merge主线 ⛔force push · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*
