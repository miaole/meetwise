# TOKSTREAM-S4B EXEC 收据（receipts/tokstream-s4b/exec-receipt.md）

EXEC 施工席 · 2026-10-14 · 分支 `line/tokstream-s4b` · 工作树 `meetwise-s4b` · 卷宗 `ai-docs/delivery/harness/tokstream-s4b-REQUEST.md` rev3（193 行·施工唯一依据）· 重派席（上波限速未执行·上波遗存施工=merge df267c89+未提交工作面，本席逐件核验续完）· ⛔push。

## 0. 并线与重 pin

- 并线链：`0ee5a390`（rev3）→ `df267c89` = merge --no-ff `12ecb34b`（上波）→ 本席 `fc1964cf` = merge --no-ff `c4025186`（fetch 实测主线 tip=OBS-READY nail SSOT 随翻·12ecb34b..c4025186 区间含 obs-ready 分支 28b9da2f·与施工面交叠=package.json 两件 prove 注册行·按注册行并集惯例 stash→merge→pop 零冲突自动并·s4b 两行+obs-ready/qa-tool-layer 行逐值在位亲证）。
- §0 全量重 pin @`fc1964cf`（施工前树 git show 亲证）：
  - **零漂锚（17/23）**：A1 A2 A3 A5 A8 A10 A11 A12 A13 A14 A15 A16 A17 A20 A22（`git diff --stat f0147886..fc1964cf` 于对应文件全空·行号逐值恒等）+ A18（proof 形制集）+ A19（归档现位叙事）。
  - **漂移重锚（6）**：A4 `packages/ai-runtime/package.json` :48/:50/:51→**:50/:52/:53**；A7 `apps/worker/src/generation-progress.ts` :107→:108（withGenerationProgress）/:122→:123（writeProgressOnce）/:143-151→:144-152（heartbeat·+1 漆）（触发面 interview-service :253/:351 + adaptive :460 恒等）；A9 `adaptive-lifecycle.ts` :265/:273/:449→**:266/:274/:450**；A21 迁移链顶=**0187**（187 文件·0188/0189 本树空闲）；A23 root `package.json` docs:check :8→**:9**/typecheck :22→**:23**/web:prove :252→**:255**·api `:46/:65/:66`→**:49/:68/:69**·worker `:10/:14`→**:12/:17**·turbo.json typecheck :7→**:8**；A6 施工后由「全缺位」转实落（rg `withTokenStream|TokenSink|interview_token_ch` 运行时面 4 文件=token-stream.ts/interview-service.ts/adaptive-interview-service.ts/sse-notify.service.ts+proof 面 2 件）。
  - **A19 连带改锚**：`S2_DIR` 三 proof（model-client-stream/stitch-validator/token-coalesce）旧 pin `ai-docs/delivery/receipts/tokstream-s2-probe/…`→**`receipts/archive/2026-09-batch23/receipts/tokstream-s2-probe/2026-10-07`**（ptp-archive `426e0b28` git mv 3025 件后历刀未随钉=基线红·三门前 EXIT=1 ENOENT·stash A/B 亲证与本刀无关；A19「引用一律用归档现位」依据·fixture 字节零触）。
- §4-③ 复核：迁移链顶 0187 实测（0188/0189 空闲·b5m 实占 0190-0199 在 b5m 树·本刀零迁移结论维持）；§4-④ 在飞树 `git worktree list` 复核 18 树在飞·与本刀文件域相切面登记=**5C-SSE-API 界碑**：`meetwise-5cq`（line/5c-queue @12ecb34b）与 `meetwise-apid`（line/api-harden）在飞，本刀于 sse-notify/sse-pump/interview.controller 仅 additive（第二 LISTEN 通道+deltaSource 可选注入+delta 臂），槽位/loseClient/重连既有面零字节零触。

## 1. 门矩阵全表（§3 逐条）

| # | 门 | 结果 | 摘录 |
|---|---|---|---|
| 1 | `prove:model-client-stream` | **EXIT=0** | 56 PASS（含 R1b④ 双新臂+R1b① 静态组） |
| 2 | `prove:stitch-validator` | **EXIT=0** | T0/T1/T2 承重全过 |
| 3 | `prove:token-coalesce` | **EXIT=0** | probe-b 重放+合成卷④ |
| 4 | 新·`prove:invoke-model-delta`（ai-runtime） | **EXIT=0** | 12 臂（R1 四臂+R8(a) 行为臂+静态七臂·隔离 PG run-e2e-isolated） |
| 5 | 新·`prove:token-stream`（worker） | **EXIT=0** | 17 断言（R2 六臂七断言+R3 三面六+R7 两侧+静态二·post 后复跑见 §8·隔离 PG LISTEN 实收） |
| 6 | 新·`prove:s4b-delta-arm`（api） | **EXIT=0** | 21 臂（R4(i)-(iv)+fan-out/坏帧/环丢旧/唤醒源区分/基线回归·零 DB 单元缝） |
| 7 | 新·`prove:token-delta`（web） | **EXIT=0** | 19 臂（R5 六臂+R6 三态+probe-b L3 pacing+UX-A·纯函数） |
| 8 | `tokenstream:prove`（既有·隔离） | **EXIT=1=基线红** | 唯一红臂 `TS-P1 ask 面 model_first_token 落表`——stash A/B 基线亲证同红同形（H2 #79 scenario 空检索模板降级后 ask 面零模型调用·proof 自调 noteModelFirstToken seam 无从触发）·**非本刀回归·登记不洗（cost1 先例）** |
| 9 | `interview:prove`（隔离） | **EXIT=0** | 「当前 v64 面试链路全部通过」 |
| 10 | `sse-push:notify:prove`（隔离） | **EXIT=0** | 35 条负路径用例全绿 |
| 11 | `sse-slot:prove` | **EXIT=0** | 5+1 429+shared principal bucket |
| 12 | `prove:ha2-drain` | **EXIT=1=基线红** | 45 PASS 后 C4 /readyz 排水翻脸面 HttpException(degraded)——stash A/B 基线同红同形同点（env 依赖红·非本刀回归·登记不洗） |
| 13 | `web:prove` | **EXIT=0** | ✓ 全部通过（含 TS-P3×11 既有） |
| 14 | `turbo typecheck --force` | **EXIT=0** | 8/8（0 cached） |
| 15 | `pnpm typecheck` | **EXIT=0** | tsc e2e 零错 |
| 16 | `turbo lint` | **预算红四值** | api/db/domain/contracts EXIT=0；超支=ai-runtime **628>621**（+7 全数归因新件 invoke-model-delta.proof.ts 同族 naming-convention）/web **581>579**（+2）/worker **954>950**（+4）/scripts **5213>5200**（+13·run-e2e-isolated 注册触点）——**如实登记禁自调**·重钉/清偿归协调方授权（沿 ciw2 `5580a059`+obs `f29ceb59`/`28b9da2f` 先例） |
| 17 | `docs:check` | **EXIT=1** | `PTP_FILE_LIMIT:2077>2072`——本刀 +7 受管新文件（施工新件 5+新 proof 2）·沿 AG38 `stopped:exec_red_docs_file_limit` 先例·处置建议=`public-text-policy.mjs` MAX_FILES 一行调顶 ≥2077（建议 2080） |
| 18 | markers 五类（TODO/FIXME/XXX/HACK/conflict）改动集直扫 | **零命中** | `git status` 全集 grep 五类零命中（回执本收据 §5） |

新 proof 臂电图：R1 (i)(ii)(iii)(iv) 四臂全绿（含 flag 双开正路端到端=transport seam 注入→`invoke(spec{onModelDelta})` 实收拼接==raw 原文）；R1b① 静态（层1/层2 路由在位+单源恰 2 调用位+层3 三落点零路由注记+`.completeStream(` 恰 2 调用位=R7(iv)）；R2 a-f 六臂（f=Σdelta 对账非恒 0·post 补）；R3 quiz/report/adaptive 三面各两臂；R4 (i)(ii)(iii)(iv)+共醒/丢旧/fan-out；R5 (i)-(vi)；R6 三态+pacing；R7 (i)(iii) worker 侧+(iv) 静态。

## 2. R1-R8 逐条落点（rg 产出物路径=本收据同目录 grepables.txt）

- **R1** invoke 观察缝：`InvokeSpec.onModelDelta?`+`ModelCallPlan.execute` 第 2 参+`Model.call` 第 3 参（additive）+`swallowObserverThrows` 吞没——关口零改（:488/:912/:1048 链零分叉·R1(iii) 落账行数四键互等臂）。
- **R1b① 五处三层**：层1 `:647`（openAICompatibleClient prepare execute 臂·唯一生产臂）flag-aware 路由 `shouldRouteModelTextStream()` 单源；层2 `:1107`（modelFor call 臂·invoke 路径死码·直调 parity）duck-type 收窄同刀路由；层3 `:884`（completeStream 自回退注记）/`:1110`（**EXEC 定谳=注记声明恒非流式不施工**·二择一行使前者）/`failover-model.ts:19`（注记·生产 failover 链全 openAICompatibleClient 不可达）——g7 freetier 例外在单源内（`:257/:636/:665` 读取面）。
- **R1b③**：三触发面 spec 显式 `onModelDelta`→sink 绑定（quiz/report/adaptive 三处·非闭包隐式）。
- **R1b④**：completeStream usage 组装 AG-14 口径（`?? 0` 废除→policy 上限/估算补齐+`usageSource='usage_missing'`；整体缺失=undefined）+验收双臂。
- **R2**：`apps/worker/src/token-stream.ts` 新建（§D-3 签名逐字·L1 复用 coalesceTokenDeltas 100ms/4KB 原值·pg_notify best-effort·帧契约 v:1·seq 自 1 单调·**R8(b) 定谳=stringify 后实算 7500+超限切分**·单写者前提定谳=**配置上界声明**〔execution ≤ lease 60s〕·attemptKey 换代登记）。
- **R3**：三触发面 withTokenStream 外包裹（阶段1 progress 面零字节零回归=interview:prove+tokenstream 基线臂）。
- **R4**：单例同连接第二 `LISTEN interview_token_ch`（失败降级不拖垮权威通道）+`subscribeToken` 广播复制（**fan-out 定谳=广播复制·禁互偷帧**）+`dispatchTokenFrame` 坏帧即丢+SsePumpOptions.deltaSource 可选注入+delta 臂（环形 256 有界丢旧 coalesced 痕记·无 id 帧·**delta-only 唤醒免 fetchMore；notify 唤醒恒取数=notifyWoke 唤醒源区分**）+interview 控制器接线+quiz/diagnosis 零触。
- **R5**：`token_delta` 全表唯一 id optional 成员+zod loose data+decodeSSE/toBusinessEvent 零改+归约缓冲（attemptKey 键控 max-seq 幂等·换代不互毒）+**光标守卫**（`interview-state.ts` id===undefined 跳过游标推进=定谳窄守卫+`interview-stream.ts` highestId 不动上游半）。
- **R6**：UX-A 打字机（token-typewriter.ts 纯函数）+L3 frame-coalescer 复用+对照器 web 半（token-stitch.ts·T0 镜像·telemetry 不阻断仍用终态权威）+probe-b 曲线 L3 pacing 臂。
- **R7**：断开不取消语义生产化——worker 两侧注记+proof 四断言（无听众照常终态〔R7(i) worker 臂=弱代理：零听众面 worker 不可观测·臂证业务终态不依赖 delta 消费者·见 §8〕/usage 恰一次=R1(iii)/流中失败禁自动重 invoke=恰一次臂/「为补 delta 重跑」`.completeStream(` 恰 2 调用位静态零新增）。
- **R8**：零翻 flag+《翻转策略》落 `receipts/tokstream-s4b/flip-policy.md`（序列/锁面/回滚/g7 注记/R8(a)(b) 两增条）。

## 3. 五裁决项行使记录

| 项 | 行使 | 理由 |
|---|---|---|
| ① flag 翻转时点 | **推荐行使**：零翻·《翻转策略》随卷 | §I 原文「上线旗标另裁」 |
| ② 断开计费语义 | **推荐行使**：断开不取消·usage 恰一次·终态照落 | §E-⑤ 既有裁定 |
| ③ 降级回退面 | **推荐行使**：三层既有形零新增 | flag 门自回退+行泵现状+unknown null 丢弃 |
| ④ CLAUDE.md:54 | **改判=收敛行使（零触）** | 本刀零翻 flag·token_delta 传输态未上线·:54 句现描述仍为真；目录登记留翻转刀一并·SSOT 触面最小化 |
| ⑤ quiz/diagnosis 深度 | **推荐行使**：interview 先行·两控制器零触 | §D-4 原文 |

## 4. 偏离任务书清单（10 条全登记）

1. **docs:check cap 红**：2077>2072（+7 受管新文件皆任务书门预申明① mandated·处置=协调方一行调顶·AG38 先例）。
2. **lint 四预算超支**：+7/+2/+4/+13（同上·禁自调·登记归授权面）。
3. **基线红双门承登**：tokenstream TS-P1 ask 臂/ha2-drain C4 臂（stash A/B 同红同形亲证·非本刀引入·登记不洗）。
4. **S2_DIR 三 proof 再锚**：ptp-archive `426e0b28` 归档欠账随本刀改锚（A19 依据·fixture 字节零触·基线三门 ENOENT 红随之消解）。
5. **model-client-stream 三静态再钉**：dispatchOnce/complete sha256+index.ts:32 导出行（S4a 时点旧钉·主线 AG-B/成本轨/cost3 合法触面后未随钉·rev3 基 `0ee5a390` 实测同值=非本刀引入·沿 AG-COST2「臂自建再钉协议」·语义面由行为臂承底）。
6. **run-e2e-isolated.mjs 五触点注册**：watch×2+known 名单+命令映射×2+预迁移名单（AG38「四处」先例+预迁移=同形接线）。
7. **《翻转策略》落位 receipts/（非受管面）**：cap 预算触顶下受管面零增文件取舍·如实登记。
8. **sse-pump 唤醒源区分补全**：上波 delta-only 臂缺「notify 唤醒恒 fetchMore」逆命题半（连续 delta 流可饿死权威行取数）——本席随补 `notifyWoke` 旗（保守方向：stale waiter 误置旗=多取数不丢数据）+proof 共醒臂。
9. **新 proof 基座补齐**：invoke-model-delta 补 MODEL_API_KEY/G7 台账 env/wire JSON 修正（上波件跑不通的缝面）·worker token-stream adaptive 臂改 grounded 带事实面（scenario 空检索=模板降级零模型调用·与 TS-P1 基线红同根非本刀面）。
10. **裁决④收敛行使**（CLAUDE.md 零触·见 §3）。
11. **web 渲染组件接线保留至 UI 刀**（post 席·协调方裁决 B1 采纳方案 (a) 登记）：streamingTextDisplay/token-typewriter 为显示原语（纯函数）·组件消费归 UI 刀域——渲染组件接线未含于本刀交付面（flip-policy §7 措辞随件勘正「渲染=归约+纯函数显示原语·组件接线未含」）。

## 5. markers 五类回执 + pins 自检

- 五类词面（TODO/FIXME/XXX/HACK/`<<<<<<<`/`>>>>>>>`）于 `git status` 全改动集直扫：**零命中**（命令：`git status --porcelain | awk '{print $2}' | grep -v tsbuildinfo | xargs grep -l -E "TODO|FIXME|XXX|HACK|<<<<<<<|>>>>>>>"`→空）。
- pins 十一值零翻：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null（全 proof 注入缝/fake transport/隔离 PG·零模型真实外呼·零 secrets）。
- SSOT 四件+INDEX 零字节亲证（`git status` 无 LEDGER/checklist/issues-master 触面）·历史迁移 0001-0187 零字节（改动集零 migrations 文件）·CLAUDE.md 零触。

## 6. 「旧代码忽略仍正确」书面结论（wire/通道变更义务）

- **`interview_token_ch` 新 NOTIFY 通道**：旧 api 实例（无第二 LISTEN）对该通道零听众=NOTIFY 无消费者无害；旧 worker 不发→新 api 无帧=纯行泵现状。双向共存零语义损害。
- **`token_delta` SSE 事件**：旧 web（无 zod 成员）unknown→null 丢弃=R5(ii) 臂实证；新 web 对旧 api 流零 delta 帧=零影响。终态权威兜底与通道正交。
- **`InvokeSpec.onModelDelta`/`execute` 第 2 参/`call` 第 3 参 additive**：既有 prepare 实现（少参声明）TS 兼容；缺省 undefined=既有单参调用逐字节原值（R1(i) 臂）。
- **帧契约**：v:1 钉版+web `.loose()` 容演进字段；api→browser emit 剥 v/streamKey（流键由连接承载）。
- **usage 组装变更**（`?? 0`→补齐+打标）：旧消费方读 `inputTokens/outputTokens` 数值面形不变；`usageSource` 为新增可选字段·invoke validUsage 无 usage 整体缺席面归并既有臂零新语义。

## 7. STOP

**STOP=`stopped:exec_red_gate_budget`**（沿 AG38 `stopped:exec_red_docs_file_limit` 先例形）：施工全量落码+新 proof 四门全绿+既有门零新红（基线红双门 A/B 承登）；docs:check FILE_LIMIT 与 lint 四预算超支=授权面红·**Status 不落 executed**·待协调方处置（cap ≥2077+lint 四值重钉或清偿授权）后翻面 `executed:awaiting_post_prove_dual`+post-prove 双审两外席。⛔push · alone≠dual · Ban self-approve。

## 8. POST 修复席补记（2026-10-14 · 协调方裁决执行 · Status `executed:awaiting_post_prove_dual` 维持·@1f1a5160 后）

- **B1（登记形）**：偏离 #11 登记（见 §4）+ flip-policy §7 改词「渲染（=归约+纯函数显示原语·组件接线未含·组件消费接线归 UI 刀域）」。
- **E1 deltaChars 对账复活**：`token-stream.ts` pushDelta 补 `deltaChars += text.length`（原变量只声明零累计=endUsage `token_stream_reconcile` 遥测恒 0 死面·两半全死之「产侧半」）+ worker proof 补 R2-f 臂（换装 console.log 捕获 reconcile 行·deltaChars===5>0）——复跑对账日志实值 51/39/43/45 非恒 0 亲证复活。
- **E3 启动期哨兵**：`token-stream.ts` 模块装载期 `MODEL_EXECUTION_TIMEOUT_MS>60_000` 结构化 warn（`token_stream_single_writer_window_open`·单写者前提破窗提示·缺省 35s 档零告警·仅提示不改行为）。
- **E2 门名勘正**：错误名 `s4b-token-stream:prove` 实位=worker proof 头注运行行（exec-receipt §1 原名本正无勘）→ 勘正为 runner 形 `node scripts/run-e2e-isolated.mjs s4b-token-stream:prove:raw` + pnpm 门名 `prove:token-stream`。
- **N1 静态臂收紧**：invoke-model-delta「路由单源恰 2 调用位」`>=2`→**调用位恰 2**（实现形=剔除单源定义行与全行注记后计数 `===2`；raw 全文出现 4 次=定义+层1 注记+两调用位，字面整串 `===2` 必红——实现形偏离如实登记·语义=臂名「恰 2 调用位」的强制化）。
- **N2 R7(i) 弱代理注记**：worker proof R7(i) 臂加注（「零听众」worker 侧不可观测——本 proof 自身持 LISTEN；臂只证业务终态不依赖 delta 消费者·零听众静默丢弃由 PG best-effort 语义承底）+§2 R7 行随注。
- **post 门矩阵复跑全绿**：四新 proof 全 EXIT=0（invoke-model-delta 12 臂/token-stream 17 断言/s4b-delta-arm 21 臂/token-delta 全过）+ `turbo typecheck --force` 8/8（0 cached）+ `turbo lint` 12/12（root warnings 5213 实数恰钉零新增·ai-runtime 628/worker 954/web 581 未触顶）+ `docs:check` EXIT=0（2077≤2080）+ markers 五类改动集零命中。⛔push · Ban self-approve。
