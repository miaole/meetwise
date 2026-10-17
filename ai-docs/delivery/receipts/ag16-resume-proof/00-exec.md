# AG16-RESUME-PROOF 00-exec 收据（EXEC 席·2026-10-17·test-only 零产品码零迁移·旧 checkpoint resume 三面 proof+recursionLimit 纪实收口）

工作区 `meetwise-ag16` · 分支 `line/ag16-resume-proof` · EXEC 基线=merge `741bc79e`（--no-ff 并 origin tip=`79d83617`=届 fetch 亲证·对 rev4 pin `656fc7be` merge-base --is-ancestor EXIT=0 祖先亲证·SSOT 冲突并集解**未触发**=auto-merge 零冲突 40 files·⛔pull --rebase 未用）· pre-exec 第四次双审会签 PASS×2（席1 agent_8ff74c69+席2 agent_264162ff）+协调方明示授权 EXEC · est live=0（全 proof=隔离库+脚本模型假体+静态 readSrc+进程内自环小图·零模型外呼零 secrets）· actualSpendCny=null。

## ① 门矩阵全表（终态·届时实跑）

| 门 | EXIT | 关键值（届实跑） |
|---|---|---|
| 1 prove:adaptive-legacy-checkpoint（runner ag16-legacy:prove:raw·隔离库） | 0 | **43/43 PASS**（连跑两次同值·lint 修正后复跑同值） |
| 2 prove:adaptive-compile-contract（no-DB） | 0 | **18/18 PASS**（C1×3+C2×6+C3×2+C4×2+C5×3+C6×2） |
| 3 adaptive-resume:prove（邻面） | 0 | 36/36 PASS（36 臂原值恰等） |
| 4 adaptive-life:prove（邻面） | 0 | 49/49 PASS（届时实测值·rev4 记 46 A( 位系静态计数·runner 实跑打印 49） |
| 5 adaptive-flow/adaptive-degrade/adaptive-chaos/resume-grounding | 0/0/0/0 | 5/11/4/39 PASS（届时实测·门5 预期 5/11/4 在册） |
| 6 neg:all | 0 | **692** 恰等基线（90/90/91/107/179/135） |
| 7 turbo typecheck --force | 0 | 8/8·0 cached |
| 8 turbo lint --force | 0 | 12/12 五值恰等 root 5235/web 601/api 1421/db 1042/worker 954（+contracts 265/ai-graphs 47/ai-runtime 628/domain 115/qdrant-store 27 全贴线零新增——中途两新件 +2/+8 红自纠=仓内既立计算键形 `['thread_id']`/`['planner.competencies']`+Record 括号访问，复归恰等·沿 WHG EXEC 红自纠先例·帽值不放宽） |
| 9 docs:check | 0 | 本收据落卷前届实跑 **2214≤2216**（=届 tip 树 2211+本卷 REQUEST 1+两 proof 2·cap `public-text-policy.mjs:106` MAX_FILES=2_216 亲读）·收据落卷后 **2215≤2216 余 1**（A7 算术兑现）·门9 判据=届实跑≤届 cap ✓ |
| 10 markers 五类+行首冲突标记 | 零命中 | 改动集（4 改+2 新 proof+REQUEST+本收据）运行时组装词表直扫 0 hits（i6-239 §2-7 口径·词面不复抄） |
| 11 diff 面 | 恰 | 2 新 proof+4 改注册件（三 package.json+runner 四处 additive）+本卷 REQUEST（已卷）+本收据·零产品码零迁移零 lockfile·tsconfig.tsbuildinfo 门副产已 checkout 还原 |
| 12 迁移面 | 零 | migrations 目录零增（改动集零触） |

## ② 件① 43 断言臂账（三面·隔离库）

- **面1 fresh 臂 a（9）**：start 首题 identity / F-1 score_request 已 seed 在途 / claim accepted / stale 守卫零抛·identity 保持·评分 100·推进下一题 / 出题方向确定=planner 序第二位（缓存）/ persist 行 topic_id=自己+ask_mode=pivot（:430 系）/ question_ready payload plannedTurns 数字（:496 系）/ 世代判据命中≥2 读（:366 before+续跑读同指旧世代）/ **F-1 配对正对照：score_card=1 且 deterministic_total=100**（证写链在 harness 内通）。
- **面1 fresh 臂 b（5）**：start identity / claim / plannerSequence 空序（:374-379）→确定性 conclude 收口（done+100+零第二题+世代判据≥2 读）/ question_ready 恒 1 / eligible=1 臂 completed+报告入队舱壁。
- **面1 重放臂 c（12）**：phase1（local qbank 假体供题·模型 ask 零放行）/ claim / 形① 注入坠于 genQuestion（:193-195 同形）/ 坠点形态三件 / F-1 score_request 已 seed / 零重评零重执行（evaluate 计数不变+plan/evalAnswer 零重执行+恰只补执行 genQuestion）/ 后臂形态 failClosed（done+degraded+100+零下一题）/ **score_card=0**（leaseOwner 必配+request 在途=非短路非 no_request）/ :509 伴生条件为真 / 事件键幂等恰 1 / F-2 幂等重放（二遍 submit 零 throw·:402 elif next 空零 invoke·drive3 计数空）/ 确定性终态（failed+released+interview_unavailable:terminal generation_*）。
- **面1 重放臂 d（6）**：phase1 / claim / 形① 坠点合成 / F-1 seed / **evidence 缺键**（answer_evaluated payload 零 evidence 键·undefined 不进 JSONB）/ 同形伴生 rows=0+request 在途。
- **面2 版本失配（5）**：缺键形确定性推进 / 遥测事件同形（generation_started 恰 1/臂）/ **与「无该键」对照逐字节一致**（语义投影序列恒等·固定 UUID 入参）/ 两遍同形 / 未知遗留键零害。
- **面3 中断点确定性（6）**：重复 getState 恒等 / 深拷隔离证（A resume 落写零漏进 B）/ 浅拷对照（判别器有牙：共享 map 实例 resume 串染回源）/ 落点恒等（next/pending identity/stateVersion/评分全等）/ 节点计数（plan 零执行·awaitAnswer 两代各 1·evalAnswer/decide/genQuestion 各恰 1）/ genQuestion 零重执行·ask 零重问（`['缓存@1']` 两实例同形）。

## ③ 五列臂数映射（§9-rev3.9 五列·rev4.5 预填 4 臂+EXEC 增臂同形入表）

| 臂 | 手法 | 断言 | 布防位置 | 消费读位 |
|---|---|---|---|---|
| fresh-stale 守卫 | 世代判据剥 pending 四子键+同 identity submit（resume 形） | stale 零抛·identity 保持·评分 100 推进 | GenerationInterceptSaver getTuple 世代判据（checkpoint.id==resume 前目标 id）+needle（pending 四子键） | `:366`（before 快照·`:396-397` 判据）+`:400/:401` |
| fresh-出题方向 | 同形+mind.competencies→空序 | plannerSequence 空序→确定性 conclude 收口+新世代 payload plannedTurns 正对照（证零过剥） | 世代判据+needle（mind.competencies） | `:374-379`+`:400/:401` |
| fresh-F-1 正对照（增臂·fresh a 同驱动） | 同臂一+score_request seed（interview.proof.ts:252 先例·submitInterviewAnswer+createScoreRequestForSubmission 同一 asPrincipal 事务=D2 形）+deps.scoreWriterLeaseOwner 配 | score_card=1 total=100（证写链在 harness 内通·dispositions 在场侧） | seedScoreRequest+leaseOwner | `:509-511`（反侧：门开→写达） |
| replay-写卡跳过 | 形① eval-done 坠点+同 identity 重入 invoke(null)（fail-closed 错形定稿） | score_card=0+`:509` 伴生条件全真+事件键幂等+F-2 幂等重放 | 世代判据+needle（transcript dispositions）+seed score_request+leaseOwner | `:510`（`:509`/`:511` 门） |
| replay-evidence 缺键 | 同 replay 驱动形（独立 interview） | answer_evaluated payload 零 evidence 键 | 世代判据+needle（evidence） | `:443` 系（`:446` 读） |
| 面2 缺键形×2+对照×1 | 顶层整键剥 {topicMainQuestionId,weightedDeficit,concludeReason,competencyExhaustions}+未知键注入 | 语义投影逐字节一致+两遍同形 | 世代判据+channelKeys+injectLegacyKey | `:366/:400/:401`+state.ts `:237/:250/:260/:262` channel default |
| 面3 克隆双 resume | 裸图双 Command(resume)·双克隆实例各自直驱·固定 UUID 同源单输入 | 落点恒等+深拷隔离+浅拷对照+节点计数+ask 零重问 | cloneSaverMaps（storage+writes 双层深拷·deep=false 浅拷对照）+FACE3_RESUME 固定对象 | 裸图（无 lifecycle 读位） |

## ④ F-1/A1-A7 落法逐条（第四审硬前置）

- **F-1（P2 硬前置）**：重放臂（c/d）与 fresh 臂 a 的 harness setup 均 seed score_request——沿 `apps/worker/test/interview.proof.ts:252` createScoreRequestForSubmission 先例（`@meetwise/db` 已导出·submitInterviewAnswer+createScoreRequestForSubmission 同一 asPrincipal 事务原子）——封 no_request 平凡绿通道（rows=0 断言同时核 score_request 状态恒 pending=写卡步未 claim=跳过归 `:511` 空序门）。配对正对照：fresh a（dispositions 在场·scripted assess 沿 state.ts:191 形供 `dispositions:[{criterionId:'answer_quality',disposition:'exceeds',quote:'滑动窗口'}]`）→score_card=1 且 total=100，证写链在 harness 内通。
- **A2/A3（evidence 双同形位 :446/:490）**：重入 seam 三择一定稿=**fail-closed 错形→:443-447 位**（replay 驱动 ask 族外确定性失败→failClosed→generationFailed 臂 `:441-455`→`:443` appendEvent answer_evaluated·`:446` evidence 读=剥后 undefined 不进 JSONB）。rows=0 收据附 `:509` 伴生条件为真断言（replay c 专项臂：last.score=100 number+outcome='answered' 非 unscored/clarify+leaseOwner 已配+request 在途 pending）。
- **F-2/A5（假机制句禁入收据）**：本收据钉死真机制=同 identity 二遍 submit=**幂等重放非 answer_identity_lost**（replay c F-2 臂实证：二遍 submit 零 throw·`:381` alreadyApplied+`:402` elif before.next 空→**零 invoke**（drive3 观测计数空对象）·answer_evaluated 恒 1）；面3 用裸图双 Command(resume) 的真因=二遍 submit 撞 `:381` alreadyApplied/`:402` elif 零 invoke 形非对等驱动（rev4.4「`:421-424` answer_identity_lost」机制句系假机制·本刀实测 :421-424 在首生命周期 claim 在场时幂等通过·该句作废不入账）。
- **F-3/A4（克隆深拷双 map 钉不变）**：克隆器对 storage 与 writes 两 map 各自逐层复制（含 Uint8Array 字节级保形）。归因句定稿=「**浅拷共享内层 map 跨实例串染=恒等假象（主险）**」——浅拷对照臂实证（共享 map 实例 resume 串染回源 S→S 被推进到 q2）；深拷实例零漏（B 仍停 q1）。RESUME 值系 loop 内存链自种不依赖克隆 writes——rev4.3「漏 writes=RESUME 丢失→interrupt 再抛假绿」路径句不入账（本刀双 map 深拷仍行使=防串染主险·非防 RESUME 丢失）。
- **A7（届账亲证重算）**：EXEC fetch 亲证 origin/feat/mysql-schema-skeleton=`79d83617`（≥rev4 pin 656fc7be 祖先亲证 EXIT=0·届 tip 树 2211=worker-shutdown-seq EXEC 门6 承卷同值）·届树账=2211+本卷 REQUEST 1+2 proof+收据 1=**2215≤2216 余 1**（cap `:106` MAX_FILES=2_216 亲读）·门9=届实跑≤届 cap ✓（落卷前实跑 2214·落卷后 2215）。

## ⑤ 收据披露（§9-rev.5/rev3.2/rev4.4 披露义务）

1. **ID 纪律**：全臂固定 UUID 入参（`6a16000x-…` 字面量·禁 randomUUID 两遍异值假红）·面3 双实例共用同一冻结输入对象 FACE3_RESUME。
2. **same-shape-uncovered 如实披露**：愈形（genQuestion 续跑成功）的 `:487-491` 位「剥后 evidence 缺键」**未覆盖**——replay 臂定稿 fail-closed 错形只及 `:443-447` 位；`:487-491` 位在本刀仅以 evidence 在场形（fresh b conclude 收口 emission·新世代非剥形）间接行使。
3. **面2 逐字节一致口径**：语义投影序列（kind+event_key+payload：question_ready/answer_evaluated 等）逐字节恒等；`generation_started` 遥测事件单列（payload 内嵌 thread identity+startedAt 墙钟·跨 interview 结构性非同构·以「恰 1/臂」计数同形断言承之）。
4. **克隆形披露**：`cloneSaverMaps(source, deep)`——deep=true 时对 `storage`/`writes` 两 null-prototype map 逐层复制至字节叶（Uint8Array 重建）；deep=false 即浅拷对照判别器（有牙实证）。
5. **届 tip 锚**：§0 全量重 pin 对届树 `741bc79e`（merge `741bc79e`=双亲 1510999a+79d83617）十一 blob 全恒等零漂（七 code/test+四注册件+pnpm-workspace `f14e7fc2`·policy `4509bf68` 唯一漂移件随 cap 步进承 rev4.2 记账）。
6. **SSOT 行翻面**：LEDGER/checklist/issues-final 的 AG-16 行翻面权归协调方（本刀零触共享 SSOT）·STOP 翻面仅及本卷 REQUEST 三处（Status 头/§8/卷尾注）。

## ⑥ 偏离任务书清单（如实登记）

1. 邻面 adaptive-life PASS=49（REQUEST §2 门4 沿革口径「43」/rev4 勘记「46 A( 位」系静态计数——runner 实跑打印 49·届时实测值口径入账=rev4.4 修订语义·非红）。
2. lint 贴线红自纠两处（件② +2/件① +8→零新增）：计算键形+Record 括号访问系仓内既立先例形（adaptive-lifecycle.proof `['thread_id']`）·帽值 47/954 零放宽。
3. 中途迭代诊断输出（DIAG 行）已全部摘除·仓外 .tmp 诊断脚本已删（零 tracked 残留）。

——est live=0 · actualSpendCny=null · pins 十一值零翻转 · ⛔push（push/翻面权归协调方）· STOP=`executed:awaiting_post_prove_dual`（post-prove 双审两独立外席待派·alone≠dual·Ban self-approve）。
