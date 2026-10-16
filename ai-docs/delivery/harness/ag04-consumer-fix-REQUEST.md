# AG04-CONSUMER-FIX REQUEST — adaptive-consumer 基线红 2 臂根因刀（AG-04 刀C `114f7189` requeue 指数退避×claim 时闸×proof 即时 drain 假设过时·裁决测试改形恰 1 文件·零产品语义变更·ag04-consumer-fix 战役·起草落卷即停）

**Status**: **`closed`**（2026-10-15 卷主翻面·协调方授权批量滞后卷 Status 对账翻面·沿 ag37/ag-cost5/ha-6 状态行翻面先例·一行依据=checklist「Line ag04-consumer-fix nail」段 :2799 已载 post 双审双 PASS（两外席会签）+nail merge @`619f0a92`（对 HEAD `git merge-base --is-ancestor` 亲证 EXIT=0）——原 `executed:awaiting_post_prove_dual` 系滞后登记 · est live=0 · Ban self-approve · alone≠dual · ⛔push）

**席位**：ag04-consumer-fix 起草席（诊断+起草双责·协调方派·adaptive-consumer:prove 主线恒红 fail_count=2 在靶）。
**基线**：`feat/mysql-schema-skeleton` @ `148cf83b`（=origin tip·fetch 后 `git rev-parse origin/feat/mysql-schema-skeleton` 亲证恒等·5E-BEHAVIOR nail 收官 SSOT commit·docs:check 2108≤cap 2112 base 裸树亲跑；**本卷落卷后本支改前基线=2109（=2108+本卷 REQUEST 1 件·pre-exec 双审 P2 纠正）；EXEC @merge `6b9191e9`（主线并至 `4ff1ec6a`）首测=2110（+主线 e2e-stress nail 1 件）·全值见 §0.4 重 pin**）· 分支 `line/ag04-consumer-fix`（本起草席 `git worktree add ../meetwise-acf -b line/ag04-consumer-fix origin/feat/mysql-schema-skeleton` 亲立·HEAD 落 `148cf83b` 亲证）· 工作树 `meetwise-acf`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①5E nail SSOT `148cf83b` STILL OPEN 登记原文「adaptive-consumer AG-04 114f7189 退避时序根因（两臂 payload-only start）登记归后继」（commit 题面亲读）；②协调方派单 brief（2026-10-14·ag04-consumer-fix 战役·根因链 :252/:134/:275/:278/:294/:296 指派+修法 (a)/(b) 裁决授权）；③本席当日同 tip 实测三件套：隔离 runner run（receipt `.tmp/isolated-proof-receipts/2026-10-14T21-09-03-506Z-19638-af4d4779-8b6d-4436-a7e4-eee6a1253e0f.json`·`passCount=33 failCount=2 failureClass=child_exit_nonzero`·易失件·值已誊入本卷）+ 树外直通 raw run（`/tmp/acf-proof-raw.log`·易失件·FAIL 原文两行誊入 §1.2）+ 临时隔离库 DB 行级取证（§1.1-⑤·容器已拆·观测值誊入）；④形制范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8 骨架·本基线树内 `git cat-file -e 148cf83b:<本路径>` 在场亲证）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/Read/git hash-object 实测 @`148cf83b`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 27 树实测——无第二 ag04 同名树；`git branch --list "line/ag04*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | rg ag04` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀唯一码触面=`apps/worker/test/adaptive-consumer.proof.ts`（现 blob `a1b89c84`·主线末次变更=`5b1208a1` 5E EXEC·已在主线）。起草日全 branch 扫描（逐支 `git log -1 -- <file>`+`merge-base --is-ancestor`）AHEAD 命中五组：`line/adaptive-consumer-diag`（tip 件 `4323d81f`·2026-10-09·其 proof blob `317601bc`；其夹具供给实体改动经 `9e82dfda` **已在主线**——is-ancestor 亲证·残枝内容被主线超集演进吸收·与 negbend rev3 b110 残枝判定同形）、`line/extrev-score-writer`+`line/growth-gen`（`19ddcbb4`·2026-10-10）、`line/resume-grounding`（`a2eb45dc`·2026-10-10）、`feature/*` 十九支（`c3de7fe6`·2026-08-14 初始导入·远古残枝）——五组均早于主线 AG-C 窗口且非本战役在飞线·**起草日判定=历史残枝零碰撞**；EXEC 日照本协议重扫，任一分支顶对该文件出现主线 `148cf83b` 之后的新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 亲算 @`148cf83b`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/worker/test/adaptive-consumer.proof.ts` | `a1b89c84`（464 行） | **`:271` `claimNextInterviewJob(c,OWNER,'legacy-metadata-audit')`（legacy start 元数据审计 claim·attempts 0→1）·`:272-:274` 「遗留 start claim 只返回元数据」断言（PASS 在册）·`:275` `requeueInterviewJob(...preclaimedLegacy.id,'legacy-metadata-audit')`（红链写退避点）·`:276-:277` modelCalls/resumeDecryptions 前值捕获·`:278` `drainInterviewJobOnce(d,OWNER)` 恰一次即时 drain（红链挡闸点）·`:279-:284` legacyState 四查询（job/events/enrollment/graphRuns）·`:285-:293` `legacyStartContract` 七成员（`:286` result=（legacyResult==='failed'）等）·`:294` **红臂①**·`:296-:297` **红臂②**（paired release）·`:301-:329` LEGACY_BOUND 直排臂（绿）·其余 legacy 直排臂 `:330-:433`（全绿）** |
| `packages/db/src/interview/interview-jobs.ts` | `7ebdff1a`（339 行） | **`:15` `MAX_INTERVIEW_JOB_ATTEMPTS=5`·`:16-:18` `INTERVIEW_RETRY_BACKOFF_CAP_SECONDS=300` 常量+注释（AG-04 刀C #4·report.ts:53 范本自证=产品有意行为）·`:126` claim UPDATE（attempts=attempts+1）·`:131-:134` claim queued 臂时闸注释+谓词 `(j.status='queued' AND (j.next_attempt_at IS NULL OR j.next_attempt_at <= now()))`·`:245-:248` requeue 文档注释（退避语义自证「REQUEST §1-修法②」）·`:249-:257` `requeueInterviewJob`（`:252` `next_attempt_at=now()+make_interval(secs=>least(power(2,attempts)::int,$4))`）·`:281-:304` sweep 三臂** |
| `apps/worker/src/interview-consumer.ts` | `27ddbcf1`（657 行） | **`:299` `drainInterviewJobOnce`·`:305-:307` claim 调用·`:308` `if (!job) return 'idle';`（时闸挡下→'idle' 的代码面）·`:277-:294` `requeueOrTerminalizeExhausted`（产品 requeue 上限闸·本刀零触）** |
| `apps/worker/test/requeue-backoff.proof.ts` | `2dbe7c33`（248 行） | **`:20` 「假时钟可证：next_attempt_at 直接回拨/前拨（reaper prove 先例），无需等待真实退避」·`:89-:91` `backdateDue`=`UPDATE interview_job SET next_attempt_at=now()-interval '1 second' WHERE interview_id=$1`（回拨到点先例·本刀改形照抄形）·`:93-:95` `parkDue` 前拨**——AG-C `114f7189` 新建 33 臂五臂（瞬时/确定性负臂/时闸+到点重领/退避单调[2,4,8,16]+封顶300/EG-A2 滞留终态·EXEC 记 33/33 EXIT=0）=退避语义专属绿证族 |

### 0.2 派单简报对表（零漂移）

简报六锚逐条对现树实测恒等：`:252` 退避写入／`:134` 时闸谓词／proof `:275` requeue／`:278` 即时 drain／`:294`/`:296` 两红臂——六值零漂；`fail_count=2 pass=33` 对 receipt 恒等；「两臂=payload-only start 面」对 `:260-:264`（`requestId:'legacy-payload-only'`+`resumeRaw` sentinel·v49 trigger 停用插入）恒等。**5E nail「5E nail SSOT STILL OPEN 已登记归后继」即本刀立项面——本刀不翻该行，翻面权归协调方。**

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**201**·头 `0201_qbank_fusion_owner_rank_org_dedup.sql`（隔离 runner 当日 run migrate `applied=201 skipped=0` 同证）。
- 本刀修法=纯测试夹具段改形（§1-修法件①）·**预期零迁移零 DDL**。EXEC 期若实测产生非预期迁移需求→**停（越界需要类）上报**，认领号对届时链顶亲数后最小未占号顺延·Ban 抢号。

### 0.4 EXEC 重 pin（EXEC 席 2026-10-14·对 merge 后树 HEAD=`6b9191e9`（双亲=`807ba02e`+主线 tip `4ff1ec6a`·`--no-ff` ort 零冲突）全量亲证）

| 锚 | 起草 pin | EXEC 重 pin | 结论 |
|---|---|---|---|
| proof blob/行数 | `a1b89c84`/464 | `a1b89c84`/464（`git hash-object` 亲算） | 恒等·行锚 `:271/:275/:276-:277/:278/:285/:286/:294/:296/:301-:433` 零漂 |
| interview-jobs blob/行数 | `7ebdff1a`/339 | `7ebdff1a`/339 | 恒等·`:15-:18/:126/:131-:134/:245-:248/:249-:257/:252/:281-:304` 零漂 |
| interview-consumer blob/行数 | `27ddbcf1`/657 | `27ddbcf1`/657 | 恒等·`:277/:299/:305-:308` 零漂 |
| requeue-backoff blob/行数 | `2dbe7c33`/248 | `2dbe7c33`/248 | 恒等·`:20/:89-:91/:93-:95` 零漂 |
| 迁移链 | 201·头 0201 | 201·头 `0201_qbank_fusion_owner_rank_org_dedup.sql`（隔离 run `applied=201 skipped=0` 同证） | 恒等 |
| §0.2 简报六锚 | 六值零漂 | `:252/:134`+proof `:275/:278/:294/:296` 六值零漂·`requestId:'legacy-payload-only'`+resumeRaw sentinel `:260-:264` 恒等 | 恒等 |
| §0.0 在飞复核 | 五组残枝零碰撞 | 同五组（`4323d81f`/`19ddcbb4`/`a2eb45dc`/`c3de7fe6`+cursor 两支 `b07e509c`/`c13209c9`@09-04 更远古）·全支顶对 proof 文件无主线 `148cf83b` 后新增提交（逐支 `git log -1`+`merge-base --is-ancestor` 亲证） | 零碰撞·不触停 |
| docs:check | 2108（base 裸树） | 改前基线 **2109**（P2 纠正=2108+本卷 REQUEST 1 件）·merge 后首测 **2110**（+主线 e2e-stress nail 1 件·`4ff1ec6a` 题面自证 2109 同链） | P2② 落卷 |

**pre-exec 双审 P2×2 折入（协调方授权随 pin 落卷）**：①直排臂计数四→五（§1.1-⑤ 已改·五臂名亲数如上）；②docs:check 改前基线 2109（§0 基线行+§2-7 已改）。两处均为计数纠偏·§1.1/§1.2/§1.3 根因结论与裁决零改。

## §1 红事实与修法裁决（机制链全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 根因机制链（五环·每环 file:line 亲证）

1. **claim**：proof `:271` 对 legacy payload-only start 行 claim——`interview-jobs.ts:126` UPDATE 置 `status='running'`+`attempts=0→1`；`:272-:274` 元数据断言绿（resumeRaw sentinel 不出库=该审计面本体无恙）。
2. **requeue 写退避**：proof `:275` 调 `requeueInterviewJob`——`interview-jobs.ts:252` 同条 UPDATE 写 `next_attempt_at=now()+least(2^attempts,300)`，attempts 取本 UPDATE 前现值=1→**退避窗=2 秒**（AG-04 刀C `114f7189` 引入·`:16-:18`/`:245-:248` 注释自证产品有意·report.ts:53 范本形）。
3. **即时 drain 被时闸挡下**：proof `:278` 立即 `drainInterviewJobOnce`——`interview-consumer.ts:305-:307` claim→`interview-jobs.ts:134` 谓词 `next_attempt_at <= now()` 不满足（2 秒窗未逝）→claim 返 null→`interview-consumer.ts:308` **`return 'idle'`**。此时该 owner 无其余可领 job（`:198` 「所有 job done」绿在先·DUP 面 `:436` 在后）——'idle' 判定确定无歧义。
4. **契约落空**：`legacyResult==='idle'≠'failed'`→`:286` result=false；job 滞 `'queued'`≠`'failed'`（`:289` false）；`interview_unavailable`=0≠1（`:290` false）→**红臂① `:294` FAIL**。paired release 永未发生→`availableUnits` 维持 `legacyBefore-1.0`→**红臂② `:296-:297` FAIL**。
5. **DB 行级实证（当日临时隔离库观测·容器已拆）**：requeue 臂行终态=`status='queued'·attempts=1·next_attempt_at IS NOT NULL·last_error`空；对照五个**无 requeue 直排** legacy 臂全数 `status='failed'·last_error='interview_resume_reference_missing_or_mismatched'` 且 `interview_unavailable` 恰 1（**五臂=pre-exec 双审 P2 纠正·起草误记四**：LEGACY_BOUND/LEGACY_NULL_START/LEGACY_NULL_BOUND_START/LEGACY_ANSWER_V49/LEGACY_ANSWER_NULL 五臂 EXEC 对 `:301-:433` 亲数恒等·根因结论零变）——LEGACY-MISSING-TYPED-REF（唯一经 claim→requeue 的面试）是 unavailable 事件清单唯一缺席者。**时序窗证据**：2 秒退避窗 < 后续臂间隔（`:317` 等直排臂全绿·零级联）——恰 2 红非 7 红的算术自洽。
6. **实测总账**：隔离 runner `exit=1 pass_count=33 fail_count=2`；raw 直跑 33 PASS/2 FAIL·FAIL 原文两行（§1.2）——与 5E nail SSOT 登记「两臂 payload-only start」恒等。

### 1.2 两红臂断言原文（raw run 当日实测·byte-for-byte 誊录）

```text
FAIL  遗留 payload-only start 在任何图副作用前失败：模型=0、job failed、终态事件恰一条          ← proof :294
FAIL  遗留 payload-only start 走一次既有 paired release，额度精确恢复                          ← proof :296
```

### 1.3 修法裁决=候选甲（测试改形）·候选乙（产品修）否决在卷（防 EXEC 期重开）

- **候选甲（采纳）=proof 测试改形（零产品语义变更）**：退避是 AG-04 刀C 的**产品有意行为**（`interview-jobs.ts:16-:18` 常量注释+`:245-:248` 函数文档双自证·report.ts:53/:85 范本形·且有专属绿证族 requeue-backoff 33 臂含「时闸+到点重领」「退避单调[2,4,8,16]+封顶300」臂——`2dbe7c33`）；红臂成因=proof `:271-:278` 序列内「requeue 后即时 drain 可领」假设**早于 AG-04（2026-10-12 落链）·属测试侧过时假设**，非产品缺陷。改形方向=承认并**正向断言**退避语义（时闸成立→'idle'）+以仓库既有假时钟先例（`2dbe7c33 :89-:91` backdateDue）回拨过窗后二次 drain 走既有 v50 门终态路径——legacy 契约本体（job failed/终态事件恰 1/模型 0/解密 0/enrollment 0/graphRuns 0/paired release 恰一次）**逐成员保留零弱化**。
- **候选乙（否决·Ban）=产品修**（requeue 首次退避改固定短延迟／claim 时闸放行首次）：①触 `packages/db/src/interview/interview-jobs.ts` 生产调度热路径语义=重开 AG-C-REQUEUE 卷裁决（`114f7189` 双审既裁「退避+时闸」形·「存量零变」承诺在注释 `:132`）；②时闸放行首次=退避对首重试失效·削雷群防护=产品语义让步于测试；③requeue-backoff 33 臂对 `:252`/`:134` 字节级锚定·产品修必连锁翻该族=爆炸半径不可界；④5E nail 登记语自称「退避时序根因」归后继**消红**·非翻产品语义。**为绿改产品=本战役 Ban（沿 negbend §1.3 候选丙否决同构纪律）。**
- **改形内子候选否决登记**：①真实 sleep 过 2 秒窗——引入实时等待与 flake 面·假时钟先例在场而不用=劣解；②夹具直调 markJobFailed/failInterviewAndRelease 代 drain——绕过被证主体（consumer 消费路径）=断言弱化·Ban；③删 `:271-:275` claim/requeue 序列——`:272-:274` 元数据审计断言为在册绿契约·删之=丢面·Ban。

## §1-修法（测试改形刀·预期恰 1 码文件=proof 夹具段·零产品文件·零迁移）

- **件①（唯一码改）**：`apps/worker/test/adaptive-consumer.proof.ts`（blob `a1b89c84`）LEGACY_START_GATES 段三处·其余 33 臂字节零触：
  1. **`:278` 单行展开为三行**（gated drain→回拨→二次 drain）：`const gatedDrainResult = await drainInterviewJobOnce(d, OWNER);`（时闸成立断言观测值）+ `await admin.query("UPDATE interview_job SET next_attempt_at=now()-interval '1 second' WHERE interview_id=$1", [LEGACY]);`（**照抄 `requeue-backoff.proof.ts:91` backdateDue 语句形**·admin 连接夹具手术与 `:245` DELETE/`:258` DISABLE TRIGGER 同位格·LEGACY 面试此时恰 1 job·按 interview_id 仿 `2dbe7c33` 先例作用域·规避 `preclaimedLegacy` 出 if 块后 TS 收窄丢失）+ `const legacyResult = await drainInterviewJobOnce(d, OWNER);`（过闸二次 drain→v50 门→既有 failed+paired release 路径）。原 `:276-:277` 前值捕获行位次不动（在 gated drain 之前）。
  2. **`legacyStartContract`（`:285-:293`）增一成员**：`gate: gatedDrainResult === 'idle',`（列于 result 前）——七成员变八成员·断言强度只增不减。
  3. **红臂① `:294` 断言文案改形**：`'遗留 payload-only start 退避时闸成立且过闸后在任何图副作用前失败：即时 drain=idle、模型=0、job failed、终态事件恰一条'`——判据仍 `Object.values(legacyStartContract).every(Boolean)`。
  4. **红臂② `:296-:297` 字节零改**（二次 drain 终态化后 paired release 自然复绿）。
  - **diff 预期=恰 1 文件净 +5/−1 ±注释行**（新增段附 2-3 行注释自证 AG-04 语义+假时钟先例出处）·其余 tracked 树零改。**断言总数恒 35**（§2-1 熔断锚）。
- **件②（prove·零 retry-to-green）**：①**改前复跑恰 1 次**（`pnpm adaptive-consumer:prove`·不计 prove·沿 negbend rev2 必做口径）→期望 EXIT=1 **33/2**·FAIL 名单恰 §1.2 两行（对届时 tip 现场漂移熔断：若 35/0 或红名单≠两臂→停）；②改形后 **THE prove 恰 1 次**→期望 EXIT=0 **35/35**。两次 run 原文摘要+EXIT+receipt 文件名入收据。
- **件③（收据）**：`ai-docs/delivery/receipts/ag04-consumer-fix/00-exec.md`——七字段（门矩阵全表+EXIT 原值+改前改后 PASS 名单 diff（`sort|uniq -c` 协议·分母=件②① 本树改前 run）+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）·untracked 口径沿 negbend §9。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵九门·数字口径以实跑实测为准）

1. **adaptive-consumer:prove 35/35 绿**：`pnpm adaptive-consumer:prove` EXIT=0·`pass_count=35 fail_count=0`（**熔断=0 容差**：实测总数≠35 即触「现场漂移」停——改形只增契约成员不增断言行）；改前改后 PASS 名单 diff 恰 2 条=`:294`/`:296` 翻绿·其余 33 条零弱化（diff 出第 3 条即停）。
2. **nearby 邻面不回退**（退避语义 SSOT 族+消费邻族三命令全 EXIT=0）：`pnpm requeue-backoff:prove` **33/33**（`2dbe7c33` 族·本刀未触其文件·臂总数≠33 即停）+ `pnpm adaptive-life:prove` EXIT=0 + `pnpm reaper:prove` EXIT=0（臂数如实记·对基线零回退口径）。
3. **migrate 链 201**：`pnpm migrate:prove` EXIT=0·链头实测=0201（届时顺延如实记）·**零新迁移**（多出 0202+ 即停·越界需要类）。
4. **migration uniqueness**：`node scripts/check-migration-version-uniqueness.mjs`→`files=201 violations=0`（files 对届时链顶亲数·violations 恒 0）。
5. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（`8 successful, 8 total`·0 cached）。
6. **lint 三值**：`pnpm turbo lint` EXIT=0·12 任务全绿·三贴线**恰等**：web `601≤601`+api `1421≤1421`+root `5224≤5224`（零第四红·出现即停）。
7. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned ≤cap **2112**（改前基线 **2109**=2108 裸树+本卷 REQUEST 1 件·pre-exec 双审 P2 纠正；EXEC @merge `6b9191e9` 首测 **2110**=+主线 e2e-stress nail 1 件·收据落卷后终测值见 §9·**>2112 红停上报**）。
8. **markers 五类零命中**：本刀改动集（本卷 1 .md+件① 1 .ts+EXEC 收据目录 untracked）五类标记词（词族=`scripts/i6-239-gates.proof.mjs:151-:163` 运行时组装四词+冲突标记对·**词面本卷不复抄防自匹配**）grep 零命中（命令与回执入收据）。
9. **diff 面机检**：`git diff --numstat <base>` 恰 2 tracked 路径=`apps/worker/test/adaptive-consumer.proof.ts`+本卷 .md（EXEC 阶段另加收据目录 untracked）——多任何 tracked 路径即停（越界需要类）·typecheck 若翻动 `apps/web/tsconfig.tsbuildinfo`→`git checkout` 回滚（negbend §9 同款处置）。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码零触**：`packages/db/src/interview/interview-jobs.ts`（`7ebdff1a`）·`apps/worker/src/interview-consumer.ts`（`27ddbcf1`）·`apps/worker/test/requeue-backoff.proof.ts`（`2dbe7c33`）·`apps/worker/src/adaptive-lifecycle.ts` 前后 blob 全等——候选乙否决承卷（§1.3）。
2. **proof 其余 33 臂断言本体零触**：仅 §1-修法件① 列名三处改形·`:272-:274` 元数据审计臂与四直排 legacy 臂（`:301-:433`）字节零改。
3. **runner/依赖零触**：`scripts/run-e2e-isolated.mjs`·root/worker package.json 零改·零依赖升级·零 CI/wrapper 改。
4. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star 只读引用——adaptive-consumer 红清单行与 5E STILL OPEN 行翻面权归协调方 nail。
5. **零迁移零 DDL**（§0.3）·零 `.env*`/secrets 触面。

## §4 依赖

**①上游已满足**：AG-04 刀C `114f7189`（在链·`git log --oneline -1 114f7189` 亲证）=被证语义本体；requeue-backoff 33 臂绿证族（`114f7189` EXEC 记 33/33·`2dbe7c33` 在链）=假时钟先例与退避语义锚；5E nail `148cf83b` STILL OPEN 登记=立项授权面。**②无同文件并发**：§0.0 五组 AHEAD 残枝判定在卷·EXEC 日重扫必做。**③迁移号**：§0.3 预期零。**④下游**：adaptive-consumer:prove 35/35 转绿=主线 baseline 门矩阵消红前提；行翻面与 nail 排序归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（件② 恰 2 run 各司其职·改后红不重跑冲销·红即停上报）；Ban 触产品码（§3-1 四文件 blob 锚定·候选乙否决沿承）；Ban 为绿弱化断言（legacy 契约八成员逐成员保留·只增 gate 成员·33 绿臂零触）；Ban 实时 sleep 过窗/Ban 夹具绕过 consumer 直调终态函数（§1.3 子候选①②否决沿承）；Ban 迁移 Ban DDL（§0.3 预期零·需则停上报走认领规则）；Ban 触 runner/依赖/CI（§3-3）；Ban 改共享 SSOT（§3-4）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因两臂外新红（邻面若现新红→如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit 前）：est live=**0**——零模型外呼（proof 全程 scriptedModelClient 假体·MODEL_API_KEY 零加载）·零生产操作·零 secrets；本地 Docker 隔离库与临时诊断容器属本地基建非外呼。EXEC 期 prove 同为零外呼（同 scripted 面）·本卷 §2 承。

## §7 markers=0（卫生声明）

本刀起草改动集（本卷 1 .md）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词面不复抄卷内防自匹配——沿 negbend/ag-c 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.1/§1.2 根因结论、§1.3 裁决（候选甲/否决面）与 §5 Ban/pins 与 §1-修法件① 唯一码改面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且根因结论受疑（如 `:252` 退避形/`:134` 时闸谓词被改写·proof 臂总数≠35·两红断言行漂·件②① 改前复跑≠33/2·§0.0 在飞分支对 proof 文件有主线后新增提交）→停·重 pin 回炉。
- **机制不满足**：改后 THE prove 两臂未全翻绿·或改形后 gated drain 实测≠'idle'（=时闸未挡下·根因链第 3 环被证伪）→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法件① 恰 1 测试文件面（需触产品码/requeue-backoff 族/runner/迁移/SSOT）→停·另刀或协调方裁决（§1.3 候选乙否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 第四红/docs:check>2112/migrate 链漂）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

## §9 EXEC 记录（EXEC 席落卷·2026-10-14·授权链=pre-exec 双审 BOTH PASS（席1 `agent_eda33b7b`+席2 `agent_80e409c8` 会签）+协调方明示 EXEC 授权（committed SHA 重钉=`807ba02e`）·收据=件③ `ai-docs/delivery/receipts/ag04-consumer-fix/00-exec.md`+改前 raw log·untracked §2-9 口径）

**工序与 commit 链**：①`git fetch` 主线 tip 亲证 `4ff1ec6a`（恒等派单值）→`git merge --no-ff feat/mysql-schema-skeleton`→**`6b9191e9`**（ort 零冲突·delta 5 文件：execution-master-checklist+g7k-api-reds-REQUEST+LEDGER+next.config.mjs+nail-prep 收据·proof/产品四文件零触）；②§0 全量重 pin（§0.4 全表）+P2×2 折入；③改前复跑恰 1 次（件②①）=隔离 run EXIT=1 **33/2**·failure_class=child_exit_nonzero+raw 直跑（一次性临时 pgvector 容器·用后拆）**33 PASS/2 FAIL·FAIL 两行 byte-for-byte 恒等 §1.2**——现场漂移熔断零触发；④件① 改形落点（`apps/worker/test/adaptive-consumer.proof.ts`·blob `a1b89c84`→`2eb0703e`·numstat **+7/−1**=预期 +5/−1+3 注释行容差内）：`:278` 单行展开三行（gated drain 断言观测值→`admin.query` 内联 backdate（语句形照 `requeue-backoff.proof.ts:91`·作用域恰 LEGACY 单 job）→二次 drain）+`legacyStartContract` 增 `gate` 成员（七→八·列于 result 前·判据仍 `Object.values(...).every(Boolean)`）+`:294` 文案改形（即时 drain=idle 语义入文）·`:296-:297` 字节零改·`:272-:274` 元数据审计臂与 33 绿臂零触；⑤THE prove 恰 1 次（件②②）=EXIT=0 **35/35**·failure_class=none·receipt `.tmp/isolated-proof-receipts/2026-10-14T21-59-49-207Z-...json`；⑥门矩阵九门全绿（下表）；⑦本 §9 落卷=commit 2（merge+落卷两 commit·无 rev 单独 errata——P2 随 pin 折入协调方授权）。

**门矩阵九门全表（实跑实测·2026-10-14 @merge 后树）**：

| # | 门 | 命令 | 结果 | 证据 |
|---|---|---|---|---|
| 1 | adaptive-consumer:prove | `pnpm adaptive-consumer:prove` | **EXIT=0 35/35**（33+2 翻绿·熔断 0 容差满足） | `pass_count=35 fail_count=0 failure_class=none`·migrate applied=201 skipped=0 |
| 2 | 邻面不回退 | `pnpm requeue-backoff:prove`/`adaptive-life:prove`/`reaper:prove` | 全 EXIT=0：**33/33**（族臂数恒等）/43 PASS/28 PASS | 三族对基线零回退·文件零触 |
| 3 | migrate 链 | `pnpm migrate:prove` | EXIT=0·链 201·头 0201·**零新迁移** | 「迁移运行器 全部通过」 |
| 4 | uniqueness | `node scripts/check-migration-version-uniqueness.mjs` | **files=201 violations=0**（exemptions 0143/0152/0160 既登记） | EXIT=0 |
| 5 | typecheck | `pnpm turbo typecheck --force` | EXIT=0·**8 successful, 8 total**（0 cached） | — |
| 6 | lint 三值 | `pnpm turbo lint` | EXIT=0·12 任务全成功·**web 601≤601+api 1421≤1421+root 5224≤5224 恰等**·零第四红 | 0 errors 全任务 |
| 7 | docs:check | `node scripts/ai-docs/check-docs.mjs` | EXIT=0·改前（merge 后）**2110**≤cap 2112·落卷终测 **2111**≤cap 2112（余 1） | >2112 红停未触发 |
| 8 | markers 五类 | 改动集 grep（词面运行时组装四词+冲突对·同 `i6-239-gates.proof.mjs:151-:163` 形） | **hits=0**（改动集 5 文件=卷+proof+收据目录 3 件） | 收据同验 |
| 9 | diff 面机检 | `git diff --numstat` | **恰 2 tracked 路径**=本 proof.ts（+7/−1）+本卷 .md（+46/−5）·收据目录 untracked | typecheck 翻动 `apps/web/tsconfig.tsbuildinfo`→`git checkout` 回滚（§2-9 预案·negbend §9 同款）·多路径即停未触发 |

**翻绿收据（PASS 名单 diff·`sort|uniq -c` 协议·分母=件②① 本树改前 raw run）**：改前 33 PASS 名单+改后 THE prove `fail_count=0` 35 全过——diff 恰 2 条=`:294` 臂（文案改形后翻绿）+`:296` 臂（文案字节零改自然复绿）·其余 33 条名单零弱化（隔离 runner 对 `adaptive-consumer:prove:raw` 结构性扣留臂名 stdout（`ISOLATED_POSTGRES_OUTPUT_WITHHELD`）·THE prove 臂名经 `fail_count=0`+改前 raw 名单联合推证·非偏离·同起草席三件套仪器形制）。

**偏离任务书清单**：①改前 raw 直跑与拆容器系 EXEC 自备仪器（起草席三件套同形·非任务书件②列名 run·不占 prove 预算——件②① 隔离 run 恰 1+THE prove 恰 1 各司其职恒成立）；②docs:check 改前基线三值链（2108 裸树→2109 本支→2110 merge 后）较 P2 单值 2109 更细·如实全记（cap 口径零变）；③零其余偏离——产品码四文件 blob 恒等、33 绿臂零触、Ban 列表零违、pins 十一值零翻（haStatus=NOT_HA·releaseEvidence=false·claimProductionHA=false·gR45Closed=true·coveredCount=8·ms3EqualsR4Closed=false·PG-retained·公开 DELETE=503·g7SuiteGreen=false·r1Closed=false·actualSpendCny=null）。

**STOP → `executed:awaiting_post_prove_dual`**：post 双审两外席待派·LEDGER 红清单行与 5E STILL OPEN 行翻面权归协调方 nail·alone≠dual·⛔push。

---

*AG04-CONSUMER-FIX REQUEST · 2026-10-14 起草 · **`executed:awaiting_post_prove_dual`（§9 EXEC 记录·门矩阵九门全绿·35/35 两臂翻绿·post 双审待派·行翻面/nail 归协调方）** · base `feat/mysql-schema-skeleton` @`148cf83b`（=起草时 origin tip·EXEC 并线至 `4ff1ec6a` 零冲突）· 分支 `line/ag04-consumer-fix` · 工作树 `meetwise-acf`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=5E nail SSOT `148cf83b` STILL OPEN 登记（adaptive-consumer AG-04 114f7189 归后继）+协调方派单 brief+本席当日三件套实测（隔离 runner 33/2 receipt+raw 直跑 FAIL 两行原文+DB 行级取证）+形制范本 negbend-fix-REQUEST · 根因链五环亲证=`:271` claim（attempts 0→1）→`:275` requeue（`interview-jobs.ts:252` 写 `now()+2^1=+2s` 退避）→`:278` 即时 drain 被 `:134` 时闸挡下（`interview-consumer.ts:308` 'idle'）→`:286-:293` 契约落空→`:294`/`:296` 两臂红·2 秒窗<臂间隔=恰 2 红零级联·DB 实证=requeue 臂 `queued/attempts=1/next_attempt_at 非空` vs 五直排臂全 `failed`+终态事件恰 1（五臂=pre-exec P2 纠正）· 裁决=候选甲测试改形（退避系产品有意行为双注释自证+requeue-backoff 33 臂专属绿证族·proof 即时 drain 假设早于 AG-04 过时）·候选乙产品修否决（重开 AG-C 裁决+削雷群防护+连锁翻绿证族）· 修法=件① 恰 1 测试文件三处（`:278` 展开为 gated drain→backdateDue 形回拨→二次 drain+契约增 gate 成员+`:294` 文案改形·`:296` 零改·33 绿臂零触·断言总数恒 35）· 门矩阵九门（35/35+邻面三命令+migrate 201 零新+uniqueness+typecheck 8/8+lint 三值恰等 601/1421/5224+docs:check≤2112 红停+markers 五类+diff 面机检恰 2 路径）· 迁移预期零 · est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · ⛔push · STOP*
