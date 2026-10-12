# AG-A-RESUME EXEC receipt（AG-05 alreadyApplied invoke(null) 续跑+AG-26 start 续跑·席=EXEC·2026-10-12）

分支 `line/ag-a-resume` · 树 `meetwise-aga` · 开工 HEAD `1df39e6e`（REQUEST rev2·双审 BOTH PASS 落协调方+协调方常设 loop 授权）· ⛔push（本卷零 push）· est live=0（新 proof=scriptedModelClient 假体+MemorySaver+隔离库 fresh-DB-per-run·零模型外呼）· pins 十一值零翻。

## §0 并线重 pin（merge `feat/mysql-schema-skeleton` @tip `616d8ef3` → merge commit `999febbf`·零冲突 EXIT=0）

- **并线漂移如实登记**：任务书口径「主线 4c178a4c..2bc4e2bd」——实际 merge 时主线 tip 已前移至 `616d8ef3`（`2bc4e2bd` 之后主线落 `bccbd139`/`9aa33de8`/`6f2ed876`（AG-COST1 nail 合入）/三笔用户裁决 docs/`4fabecc3`/`46439f3b`/`9a938854`（AG-39~43+审计+qbank-acl）/`434a57dc`→`2a2fee56`→`616d8ef3`（刀 B REQUEST+EXEC rev2 合入））——merge 按分支名现 tip 执行·全部为 `git merge-base --is-ancestor` 亲证祖先·零冲突（ort 策略·53 文件 3188+/38−·全为 docs/proof/主线码 additive·本刀两目标文件零漂见下）。
- **本刀触面主线零漂**：`adaptive-lifecycle.ts` blob `5cfce9be`（505 行有尾换）与 `adaptive-lifecycle.proof.ts` blob `62d465cc`（332 行有尾换）主线自 merge-base `d46cdd21` 起零 commit 触及（`git log d46cdd21..feat/mysql-schema-skeleton -- <file>` 空输出亲证）——§0.1 行锚全数存活。
- **§2-⑤ 三 blob 按任务书口径评**：`invoke.ts` 主线漂 `68e3c1f4`→`eda87ce0`（AG-B EXEC `ae478bc6` known_executed+cost1 `e6dc3ba7` cachedInputTokens·additive·刀 A 零触）；`0130` `239a0b19`/`0085` `671c342f` 恒定——本刀 diff 对三件零触（receipts `06-zero-ledger-touch.log`：diff --stat 空+name-only grep EXIT=1）。
- **席2 勘误行使**：E1（TTL-WIRE `0e5e1256`/`42b3b036` purge 接线并线携入）——`interview-consumer.ts` 恰两处（:7 import+:537 purge 调用）对 AG-05 链零影响：purge 只 terminalize 后清 interview_job 滞留 payload 明文（TTL 面），不触 graph checkpoint/lifecycle 投影/alreadyApplied 判定链任一环；E2（invoke.ts +8 additive）——cachedInputTokens 观测字段与 METRIC，settle/validUsage 计费语义零字节，对 invoke(null) 续跑语义与 proof 断言面零影响。
- worker `package.json` blob `47c40e2d`→`6f94d86d`（并线携入 ag-b/reaper-purge-wire/usage-calibration-bleed 等 prove 注册）→本刀施工后含 `prove:adaptive-resume` :42。

## §1 施工落点（修法四边界·恰一文件两区+proof 一新件·全 file:line 亲算）

| # | 边界 | 落点 |
|---|---|---|
| ①③ | alreadyApplied 分支改造：`before.next` 非空且无 pending interrupt（守卫=现成 `pendingQuestion(before)===undefined`·零新原语）→ `g.invoke(null, cfg)` 续跑 | `apps/worker/src/adaptive-lifecycle.ts:334-347`（守卫 `:342`·invoke(null) `:343`） |
| ② | 续跑后重读 snap | `adaptive-lifecycle.ts:333`（`let snap = before`）+`:341/:344`（两续跑臂均 `snap = await g.getState(cfg)` 重读——next/done/投影全用新快照） |
| ④ | start 区：`snap.next` 非空→invoke(null) 续跑；全新 thread（getState 空·next 空）才 invoke({}) | `adaptive-lifecycle.ts:268-282`（守卫 `:275`·invoke(null) `:277`·invoke({}) `:279`·重读 `:281`） |
| ⑤ | 残余窗口披露（§8 行使·零码）：provider 调用期间崩溃→dispatching→120s reconciler→unknown（never retries）→续跑 invoke(null) 后 genQuestion fail-closed 落 degraded→既有 `generationFailureOf`→`writeGenerationUnavailable` 确定性 unavailable 快速终态 | 注释披露于两区（`:268-273`/`:322-331`）+REQUEST §8 行使记录——30 分钟挂死变确定性失败·非全窗口复活 |

- 纯重放路径逐字节保留：alreadyApplied 且（next 空或已有 pending interrupt）→ 走原 if(!alreadyApplied) 之外的原投影路径，零图执行（形② 臂实证）。
- 新 proof：`apps/worker/test/adaptive-resume.proof.ts`（306 行）——**两形都做**（裁决项②·协调方任务书指令）：形①两段驱动（lifecycle 起跑→绕投影直驱图 Command(resume)·模型 seam 注入抛错=执行面续跑窗口·generate-question.ts:65 无 try/catch 实证）+形②MemorySaver+checkpoint 边界注入抛错（投影面窗口——genQuestion writes 已 putWrites 持久化·checkpoint 未推进；壳内 structuredClone 修正 MemorySaver 按引用存对象的别名泄漏以对齐 PostgresSaver 字节冻结语义）。AG-26 a 面（直驱 invoke({}) 起跑+seam 注入=裁决项③「无 interrupt·next 非空」确定复现）+b 面（checkpoint 注入=投影面）。
- 门注册：worker `prove:adaptive-resume` :42+root `adaptive-resume:prove` :494（=`ag-a-resume:prove:raw` isolated 目标）+runner 三处（source 清单 :248-255·允许表 :1826·migrate 名单 :2724·命令映射 :2016-2017）。
- 施工过程如实披露：durability-async 下 decide→genQuestion 边界的 put 注入走 fire-and-forget 链致 loop 半续跑坠点态不确定（run7/run8 实证）——AG-26 a 面改用形① seam 直驱法确定复现；MemorySaver 对象别名泄漏（坠后 getState 泄漏后至 superstep 状态）以入库侧 freeze 修正（run5 实证）。过程 run1-run9 全记录于会话，最终树 receipts 01 为终形。

## §2 断言门全表（§2 五条+CI 权威形·全亲跑·收据文件同目录·全在最终树）

| # | 门 | 命令 | 结果 | 收据 |
|---|---|---|---|---|
| 1 | 新 proof（§2-①②两形+§2-④ AG-26 两面+对照臂·36 臂） | `pnpm adaptive-resume:prove`（=isolated `ag-a-resume:prove:raw`） | **EXIT=0·36 PASS/0 FAIL**·`migrations: applied=172`（隔离容器 fresh-DB-per-run 自建自清） | 01-adaptive-resume-proof.log |
| 2 | 既有 adaptive-life 回归（rev2 断言前提=43 臂） | `pnpm adaptive-life:prove`（=isolated `adaptive-life:prove:raw`） | **EXIT=0·43 PASS/0 FAIL 原值**（终树重跑·含本刀 lifecycle 改造） | 02-adaptive-life-43.log |
| 3 | typecheck CI 权威形 | `npx turbo typecheck --force` | **EXIT=0·3 successful/3 total·0 cached** | 03-typecheck-turbo.log |
| 4 | typecheck 根 | `pnpm typecheck`（=tsc -p tsconfig.e2e.json） | **EXIT=0** | 04-typecheck-root.log |
| 5 | 零账本触面（§2-⑤·本刀 diff 零触口径） | `git diff HEAD --stat/--name-only` 对 invoke.ts/0130/0085 | **diff 空+grep EXIT=1=零命中** | 06-zero-ledger-touch.log |
| 6 | markers=0 五门 | 净增行五类 grep（精化正则）+全文件命中逐行裁决 | **五门 EXIT=1 零命中**（粗 `xit\(` 伪命中 `process.exit(`·词界形 EXIT=1·裁决在卷） | 05-markers-estlive.log |
| 7 | worker 直调 tsc（基线对照·非门） | `tsc --noEmit`（apps/worker） | **46 错误=rev2 基线原值·本刀文件零新增**（`adaptive-resume.proof.ts` 2 错已修·`adaptive-lifecycle.ts:189` TS2532 系既有基线内错误·行号 186→189 系本刀注释增行漂移） | 07-worker-direct-tsc-baseline46.log |
| 8 | docs:check | `pnpm docs:check` | **EXIT=0**（80 required files·2005 files scanned） | 会话亲跑 |

断言核心四条（任务书门①口径）全落：续跑推进到下一 interrupt（pending=下一题·next=[awaitAnswer]）+ question_ready 发射（事件键逐键断言）+ evaluate 零重评（评分模型计数不变）+ ask+1（形① 执行面·AG-25 披露）；形②/b 面另证投影面零图执行零模型重调（exactly-once）。

## §3 双声明

- **est live=0**：两 prove=一次性隔离 PG 容器（wrapper 自建自清·fresh-DB-per-run）+scriptedModelClient 脚本假体+MemorySaver；typecheck/docs:check/markers=本地门。零模型外呼·零生产操作·零 secrets·零消耗（pins 脚注 `actualSpendCny=null` 同源）。
- **pins 十一值零翻**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §4 越面自查（13 条陷阱自检）

1. 并线重 pin：零冲突·两目标文件 blob 主线零漂·并线超任务书范围（tip 前移至 616d8ef3）如实登记·§0.3 勘误落卷 ✓
2. 账本面零触：invoke.ts（主线漂系并线携入·本刀 diff 零触）/0130/0085/0088/0120/0174 零字节·model-client.ts 零字节（刀 B 领地）✓
3. 图包零字节：`packages/ai-graphs/src/adaptive-interview/**` 零 diff（git diff 亲证）·只改 lifecycle 投影层两区 ✓
4. 纯重放路径语义零变更：形② 实证投影面走既有路径逐字节（含既有收口语义如实钉住）·proof :57-61 既有等价重放臂面在 43 臂回归中原值 ✓
5. 全新 thread invoke({}) 面零回退：对照臂 plan 恰 1·EmptyInputError 结构性不可能（invoke(null) 仅在 next 非空分支）✓
6. AG-25 副作用面只披露不修：形① ask+1 如实断言为披露面·检索/进度帧重放归后继刀 ✓
7. 残余窗口如实披露：dispatching→unknown→确定性 unavailable 非全窗口复活（§8 行使记录）·checkpoint 注入新观测两窗口语义（执行面/投影面）如实登记 ✓
8. REQUEST 状态行 append 保史（draft 行原文保留+append executed 行）·§0.3 勘误注+§8 行使记录 append·§1/§5 冻结条款零改 ✓
9. 零共享 SSOT 行改：LEDGER/checklist/issues-master/ai-capability-review 四件+INDEX 零 diff（只读引用）·AG-RESUME 行翻面权归协调方 ✓
10. 回滚面：改动集=1 码文件两区+1 新 proof+3 注册文件+REQUEST+receipts——单 commit 可整回滚（零迁移零 DDL 零 env 闸零定时器）✓
11. 停止条件：零触发——四边界与现 tip 码零冲突（§0 重 pin 全落勘误注）·施工中新观测（durability-async put 注入不确定/MemorySaver 别名）非边界冲突·系 proof 方法学选择·如实登记 ✓
12. ⛔push：本卷零 push（commit 后停·待 post-prove 双审两外席）✓
13. est live=0+markers=0+pins 零翻：§3 双声明 ✓

## §5 裁决项行使（§8 四项·全按卷推荐形+协调方任务书指令）

| 项 | 卷推荐 | 行使 |
|---|---|---|
| ① 守卫形 | 单函数形 `pendingQuestion(before)===undefined` 判「无 pending interrupt」（边界③零新原语）vs 附加 next 数组形 | **双条件并陈**：`(before.next?.length ?? 0) > 0 && pendingQuestion(before) === undefined`——单函数形为核·next 非空为界（:342） |
| ② proof 注入形 | 两段驱动形（推荐）vs 进程内注入抛错形（备选）·rev2 维持双裁呈现 | **两形都做**（协调方任务书指令「两形都做」）：形① 两段驱动+seam 抛错=执行面窗口·形② MemorySaver+checkpoint 边界注入=投影面窗口 |
| ③ AG-26 同刀 | 同刀（蓝本刀 A 计划原文「AG-05+AG-26+确定性 proof」） | **同刀**·a/b 两面（执行面+投影面） |
| ④ 新 proof 住地与门名 | 沿 `apps/worker/test/` 形制·EXEC 定名沿 prove:adaptive-life 形 | `apps/worker/test/adaptive-resume.proof.ts`+`prove:adaptive-resume`（worker）/`adaptive-resume:prove`（root·isolated 目标 `ag-a-resume:prove:raw`） |
