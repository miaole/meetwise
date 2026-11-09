# AG32-CODE REQUEST（meetwise AG-32 码面修复刀 · P3 · 编排运行时三处：await-answer 非法输入即终场 · voice-turn 原始转写 resume 违 {answerId} 契约 · voice-adaptive.proof 假 submit 掩盖契约差 · rev r1 证伪修订：语音缝内容闸等位下沉 · 2026-11-06 EXEC 落卷即停（rebase 并线+会签 P2 吸收））

**Status**: **`post_prove_dual_pass`**（post-prove 双审两独立外席收口 PASS（卷 §9 记录在案；.tmp/reviews/ag32-post-1.md 在库，席 2 报告随 .tmp 轮换·ag32 并线 PR #220）·2026-11-06 起草席落卷 · 同日 rev r1 证伪修订落卷（登记源=`.tmp/reviews/ag32-pre-2.md` FAIL · P1×1·P2×3）· 起草期已含修复实现与真路径 proof 全绿 · pre-exec 双审两独立外席会签 PASS（证伪初审 FAIL 后 rev r1 修订·报告=`.tmp/reviews/ag32-pre-2.md`+`ag32-r1.md`）· 同日 EXEC 授权行使：rebase 并线 origin/main `6ecce7705`=#217（两 policy dual-keep·cap 2497→2498 union 恰等步进）+届树全门复跑绿+会签 5 条 P2 吸收落卷（§9-EXEC）· post-prove 双审两独立外席待派 · alone ≠ dual · ⛔push ⛔merge 主线 · Ban self-approve · est live=0 · `actualSpendCny=null`）

**席位**：AG-32 码面修复刀 起草席（协调方派单令「普查三处均纯代码问题本地可修 · 语音对真实用户开放依赖部署不在本刀」· 普查结论只作线索 · 本席逐条亲读代码与台账原文复核后落修）。
**基线**：`origin/main` @ **`768db078f`**（fetch EXIT=0 后亲证 origin tip=#213 merge 点 · 主仓仅 `git worktree add ../meetwise-ag32 -b line/ag32-draft origin/main` 一改动 · `pnpm install --frozen-lockfile` EXIT=0 · branch **`line/ag32-draft`**）。

---

## §0 现状锚（起草席亲证 · 全部 Read/rg/sed/git 实测 @`768db078f` · 修复前红读数=/tmp 拷贝变异真跑实测）

### 0.1 台账与三处源码亲读锚表（@`768db078f` 亲读 · 修复前行号）

| # | 依据 | 内容 | 亲证 |
|---|------|------|------|
| 1 | `ai-docs/delivery/ai-capability-review/issues-final.md:408-415` | AG-32 台账原文三条修法指向：「删除或改写 voice-turn，统一走 answerId；proof 改为调用真实 submitAdaptiveAnswer；非法 resume 返回可重试错误，不要直接 concluded」；`:413` file:line 旧路径 `packages/ai-graphs/src/voice-turn.ts:16` 已被审计总表 `:44` 勘正为 `apps/worker/src/voice-turn.ts`（packages 侧该路径在树不存在，rg 亲证） | ✓ |
| 2 | `packages/ai-graphs/src/adaptive-interview/nodes/await-answer.ts:32-38` | `submittedReference` 校验失败（原始字符串/缺 answerId/answerId 非 1..256 字符串）→ 返回 `pending:null·concluded:true·degraded:answer_reference_invalid`——**一次非法输入即结束整场** | ✓ |
| 3 | `apps/worker/src/voice-turn.ts:16` | `await deps.graph.invoke(new Command({ resume: transcript }), deps.cfg)` —— 用 ASR 原始转写字符串直驱 resume，与图 `{ answerId }` 契约（`await-answer.ts:20` interrupt 载荷仅收 `{answerId:string}`）**必不兼容** | ✓ |
| 4 | `apps/worker/test/voice-adaptive.proof.ts:26`（修复前） | `submit: async (answer: string) => { submitted.push(answer); q++; return … }` —— 纯假 submit 闭包，真实 `submitAdaptiveAnswer` 链（claim→`{answerId}` resume→投影）零覆盖，契约差异被跑绿掩盖 | ✓ |
| 5 | `apps/worker/src/adaptive-lifecycle.ts:473` | 文本作答真路：`g.invoke(new Command({ resume: { answerId: input.answerId } }), cfg)`，前置 `verifyInterviewAnswerClaim` 占用核对（rev r1 勘正：r0 卷锚 `:498` 系漂移，基 commit 实位 `:473`，证伪外席2 P2-1 勘正·结论不变） | ✓ |
| 6 | `packages/db/src/interview/interview-question.ts:85-109` | `claimInterviewAnswer`：API 事务内占用 issued 题、answerHash 服务端重算、同 identity 可重放——「写入答案」的唯一合法入口 | ✓ |
| 7 | `packages/ai-graphs/src/adaptive-interview/ephemeral-answer-vault.ts` | `createEphemeralAnswerVault().issue(text)→{answerId}` + `loadAnswer`——答案引用式恢复的测试原语（adaptive-flow/adaptive-interview 等 proof 均经此走 `{answerId}`） | ✓ |

### 0.2 「非法输入」两路径来源与用户现状（亲读判读）

- **文本路径**：`/turn` 入口（`apps/api/src/modules/interview/interview.service.ts:436-484`）先 `claimInterviewAnswer` 占用再入队，worker `submitAdaptiveAnswer` 恒以 `{answerId}` resume——文本路径**到不了**非法 resume 面（answerId 由 claim 生成、identity 由 ledger 核对）。
- **语音路径**：`voiceAnswerTurn`（voice-turn.ts）绕过 claim 面直驱图——接上即首答必炸：原始转写字符串被 `submittedReference` 判非法 → 旧形 `answer_reference_invalid` **concluded 整场结束**。当前无生产调用方（台账复核结论：仅 `previewVoiceAnswerTurn` 使用，`rg` 亲证）=零生产影响，属语音上线必踩坑。
- **用户现状**：文本路径用户零感知；语音 preview 用户首答后整场直接结束（无重答机会）；CI 的 `voice-adaptive:prove` 因假 submit 恒绿。

### 0.3 修复前红读数（/tmp 拷贝变异真跑 · 2026-11-06 · 容器 `meetwise-va32-pg`(pgvector/pg16:54331) · 隔离库 · scripted ModelClient · 零外呼）

新真路径 proof（`apps/worker/test/voice-adaptive.proof.ts`，§1.3）先在 /tmp 拷贝（rsync 全树+node_modules 符号链）上对**未修复基线**做两变异各跑一轮：

- **MUT-A（把 await-answer 改回旧 conclude 形，voice-turn 保持新形）**：`FAIL ×4`（①原始转写被拒臂：重新 interrupt/concluded 未翻真/pending 原样/resumeError 标记 四断言全红）→ 随后真提交臂 abort（旧形已 concluded）· **EXIT=1 红**。
- **MUT-B（把 voice-turn.ts+interview-voice.ts 改回原始转写直 resume 旧形，await-answer 保持新形）**：`Cannot read properties of undefined (reading 'invoke')`——组合根 `deps.graph` 已不存在，语音真提交腿零 claim 零推进 · **EXIT=1 红**（运行时红，不依赖编译失败）。
- 两变异恢复后同 proof 复跑：**28/28 PASS**（变异只落 /tmp 拷贝，交付树零污染，`git status` 亲证）。
- 旧 proof 对假 submit 的掩盖面：修复前 voice-adaptive:prove 全绿而真实链零覆盖（§0.1-#4 形即证据），本轮已由真路径 proof 取代。

### 0.4 守卫现状锚（不绕面 · 亲读）

- 语音同意门：`apps/api/src/modules/interview/interview-voice.ts:116-127`（`transcribeForIssuedQuestion` 零 `consent_record(purpose='voice_capture')` 行 → 403 `consent_required`，先于任何 ASR 外发）。
- 内容安全开关：`apps/api/src/platform/content-safety.ts:39-43`（`MEETWISE_CONTENT_SAFETY_KILL_SWITCH=1` 即抛，api begin/turn 双口 503）。
- 计费预留：API begin `reserveEntitlement` → worker done 分支 `completeInterviewAndConfirm` 结算/失败 `failInterviewAndRelease`（`adaptive-lifecycle.ts:645/655`）。
- worker 侧语音门：`runVoiceAdaptiveInterview` 首行 `assertVoiceTurnTakingPreviewAllowed`（`voice-adaptive.ts:27`，production/enforce/公开预览 refuse-closed）。

### 0.5 rev r1 增锚（证伪外席2 报告 `.tmp/reviews/ag32-pre-2.md` 原值记账 · 2026-11-06）

**文本作答入口（`interview.service.ts turn()`）全部校验清单（起草席 rev r1 亲读盘点）**：

| # | 校验 | 层 | 缝内等位 |
|---|------|-----|---------|
| 1 | `denyContentSafetyKilled()` → 503 | HTTP/env ops 开关 | 留 HTTP 层（worker 生命周期不重设；proof 直证同一闸函数面） |
| 2 | `denyPublicPreviewWrite()` 公开预览写禁 | HTTP | 留 HTTP 层 |
| 3 | Zod TurnDto（answer `.min(1).max(8000)`·strict·identity 正则）→ 400 | HTTP pipe | 缝内等价=内容层长度闸（#5）+ 空白闸（#4）；请求体形状/大小仍 HTTP-only |
| 4 | `!body.answer.trim()` 空白 → 400 `invalid_turn` | 内容层 | **下沉共用**（judgeInterviewAnswerContent） |
| 5 | `resolveOverlongAnswerPolicy` >8000 → 413 `answer_too_long` | 内容层 | **下沉共用**（同上·单一上限 INTERVIEW_ANSWER_MAX_LENGTH） |
| 6 | per-principal 令牌桶 → 429 | HTTP DoS | 留 HTTP 层（语音缝无队列无逐 turn 计费 job，无对应面） |
| 7 | `assertAnswerable` 状态机 → 409 | ledger | 已同路共享（claim/verify fence + pending identity 核对 = stale_question） |
| 8 | `guardInterviewPrivacy` 隐私栅栏 → 404/410 | DB RLS | 已同路共享（asPrincipal + claim owner 域） |
| 9 | `claimInterviewAnswer` identity fence | DB | 已同路共享（语音缝同函数） |
| 10 | 入队背压 `interview_queue_saturated` → 429 | HTTP/enqueue | 语音缝无队列（直驱图），无对应面 |
| 11 | 计费预留/结算（reserve→confirmed/release） | 生命周期 | 已同路共享（同一 lifecycle，proof 逐腿断言） |

**语音缝缺口（证伪读数原值 · 修复前 = r0 实现形）**：P-B1 空白 `'   '` 直走 claim→submit → claim **accepted**（claim 无空白拒）→ 图判非作答 `unresolved` score=0 → **该题 turn 被消耗**；P-B2 超长 11000 字符直走 claim→submit → claim accepted → 模面评 **100** 计入 eligible（文本路同载荷 413 `answer_too_long`）；P-B4 `previewVoiceAnswerTurn` 空白音频 → transcript 直通 submit 同 B1 后果；膨胀读数：5 拒含 100KB 载荷 → checkpoint_writes **+200,177B**（`__resume__` 通道行·终态 deleteThread 清零）。`voice:prove`（mock 图）跑在无 0047 隐私栅栏的 runner boot 世界（P2-3 世界口径，§1.3 注记承接）。

## §1 修法（三处 · 不另造恢复路径 · 不松动 `{answerId}` 契约）

### 1.1 修1 `await-answer.ts`：非法输入拒绝+重问，不结束整场

- 校验失败臂不再返回 `concluded:true`；改在**原题原 identity** 上重新 `interrupt({…question, resumeError:'answer_reference_invalid'})`（新增导出常量 `ANSWER_REFERENCE_INVALID`，纯枚举标识符 additive 可入 interrupt/checkpoint），`pending/transcript/turn` 零推进，用户可重答。
- 机制：LangGraph 多 interrupt 语义（`interrupt.js` 源码亲读：节点重放按调用序回放已持久化 resume 数组，循环停在最早未回放下标=最新一次拒绝；`algo.js _scratchpad` 从 checkpoint pendingWrites 恢复）——合法 `{answerId}` 到达即走出循环走原 `submitted` 臂；concluded 臂只保留 pending 缺失的 fail-closed 面。
- 兼容面亲证：`uc-e2e-012-nhp-neg.proof.ts` N1 臂（job 载荷空 answerId 引用）依赖的具型拒 `answer_not_applied_to_expected_question` 语义**逐值不变**（新形下 invoke 照常返回、transcript 仍空、`!last → :494` 同码抛出（会签 P2-a 届位勘正：缝顶闸 +7 行位移后 :487→:494，rebase 届树亲证恒等）），隔离 runner 真跑 62/62 绿（§2 门 6 · EXEC 届树复跑同值）。
- 消费面零破：worker/API 的 `pendingQuestion(snap)` 读 `interrupts[0].value.question` 原样在场，`resumeError` 为 additive 可选字段；文本路径 claim→resume 链恒合法输入，行为字节零变。

### 1.2 修2 `voice-turn.ts` + `interview-voice.ts`：走与文本作答同一提交路径

- `VoiceTurnDeps` 由 `{asr,tts,graph,cfg}` 改为 `{asr,tts,submit}`（`submit: (answer) => Promise<{nextQuestion?,done}>`，与 `runVoiceAdaptiveInterview` 的 `d.submit` 同形=「submitAdaptiveAnswer 包一层」既有约定）：本层零图直触，**转写字符串绝不进 Command(resume)**；`@langchain/langgraph` import 随之移除。
- 组合根 `previewVoiceAnswerTurn` 透传 `submit`（production 接线=claim+submitAdaptiveAnswer，本刀由真路径 proof 承证：转写→claimInterviewAnswer→`{answerId}` resume→投影，claim 行 queued→answered、结算 confirmed 全链断言）。
- `voice.proof.ts`（mock 图）适配：submit 闭包内 resume 归口（mock 图契约本就是字符串 resume，与本刀无涉；adaptive 图契约由 voice-adaptive.proof 真路覆盖）。
- **rev r1（证伪外席2 P1 修复）语音缝内容闸等位下沉**：文本入口两道内容闸（空白 `invalid_turn`/超长 `answer_too_long`，上限=INTERVIEW_ANSWER_MAX_LENGTH 8000）下沉为 `@meetwise/domain` 单一真相 `judgeInterviewAnswerContent`/`assertInterviewAnswerContentAcceptable`，两路三挂点共用同一判定同一错误码：①文本入口 `turn()` 判定经 judge、HTTP 码面映射（400/413+max）留 service 层（`interviewAnswerContentException`，码面与旧形逐值不变）；②语音提交缝 `submitVoiceTranscriptAnswer`（interview-voice.ts 新组合形=生产接线）**内容闸先于 claim**——拒收轮次不 claim 不推进图：题目保持 issued 可重答，checkpoint/ledger/事件/计费零变更（证伪 P-B1「吃题」/P-B2「满分计分」的根因面即 claim 先于校验的排序）；③`submitAdaptiveAnswerImpl` 缝顶闸（文本/语音两路收敛点纵深兜底，先于 enrollCheckpointThread 任何 DB 写）——HTTP-only 校验（请求体大小）的缝内等价即此内容层长度闸。流式边缘空白守卫 `streaming_asr_malformed` 保持原位（边缘 ASR 形缺≠作答内容闸）。

### 1.3 修3 `voice-adaptive.proof.ts`：假 submit 换真路径 + AG-32 三断言面 + 守卫不绕面

- 真 submit 闭包 `makeRealSubmit`：委托语音提交缝 `submitVoiceTranscriptAnswer`（内容闸→读 issued 题 identity（ledger）→ `claimInterviewAnswer`（randomUUID answerId+服务端同形 answerHash）→ `submitAdaptiveAnswer`）——与 API turn+worker job 同一条写入恢复路，缝内校验单一真相（rev r1）。
- 真路三腿：② `runVoiceAdaptiveInterview`×真 lifecycle 整场收敛（转写=ANS、全题 answered、结算 confirmed、SSE question_ready=N/answer_evaluated=N、模型面 exactly-once 2N+1）；③ `previewVoiceAnswerTurn` 逐轮至 done（identity 链=issued 题面恒等 nextQuestion、done 后零开题）；① 非法 resume 三形（原始转写字符串/`{answerId:42}`/`{}`）拒绝+重问+identity 原样+resumeError 标记+拒绝后真提交一次通过（修复前红=§0.3 MUT-A）。
- **rev r1 语音缝内容闸臂（恢复旧 proof 删除断言 + 增超长臂）**：⑤ 直接缝形空白 `'   '` → `invalid_turn`、超长 8001 字符 → `answer_too_long`+max=8000（与文本入口逐值同码同上限）+ 拒收不吃题（题保持 issued·answer_id 空·identity 原样）+ 零持久化（checkpoint state 字节数零增长·transcript 零推进·模型调用零触发）+ 零副作用（事件零增长·额度恒 reserved）+ 拒后原题真提交一次通过；编排全程形 `previewVoiceAnswerTurn` 空白/超长经 ASR 边缘→缝同码拒（claim 零发生）；流式守卫臂 `streaming_asr_malformed` submit 零触（恢复 P-B3 证实在场的旧臂）+ 流式超长经缝闸拒（题保持 issued）。变异承证：MUT-C 双闸去除 → 7 FAIL EXIT=1；MUT-C1 仅去组合根闸（缝顶闸仍在）→ 拒码不变但「不吃题」红+真提交 abort `voice_submit_no_issued_question` EXIT=1（pre-claim 排序承重）；恢复后 37/37 EXIT=0。
- 守卫不绕面：预览门五 refusal 臂（无旗标/半旗标/production/enforce/公开预览，tripwire=真 submit 零触）；内容安全开关 engage 即抛+缺省 off（api 同一闸原语亲证）；voice_capture 同意门（零 consent_record → `consent_required` 且题仍 issued，音频不出进程）；计费同路（reserve 1.0→结算 confirmed、可用额度逐腿核对）。
- 零外呼守面：入场删三 provider 键并断言不在场（词面运行时组装防自指）；ASR/TTS=fake 族（test-support 子路径）；ModelClient=scripted。零新受管 proof 文件（全并入既有 `voice-adaptive.proof.ts`）；egress inventory 对新 proof 的三键引用按 `test-isolation` 类 additive 登记 3 行（`.json` 既有注记零改写）。
- **rev r1 世界口径注记（证伪外席2 P2-3）**：`voice:prove`（`voice.proof.ts`，mock 图边缘契约）跑在隔离 runner **boot 世界**（预迁移名单不含 0047 checkpoint 隐私栅栏——本证面零业务表依赖自足）；其断言不涉 0047 管辖面，守卫不绕面/同意门/内容安全/计费/隐私栅栏由 voice-adaptive.proof 在全量真迁移链（loadMigrations+runMigrations）隔离 PG 世界承载——`voice:prove` 门绿不得读成产品世界证据（proof 头注+本条双登记；不补 0047 的理由=mock 图世界无业务表，0047 管辖面（checkpoint 隐私栅栏写闸）在该世界无消费者，强补属换世界非补证）。

## §2 验收（起草落卷期全跑 · 读数为亲跑回执 · rev r1 同日全门复跑更新）

| # | 门 | 判据 | 结论 |
|---|-----|------|------|
| 1 | 真路径 proof | `pnpm voice-adaptive:prove`（隔离 PG + scripted + fake ASR/TTS）r0=28/28 → **rev r1=37/37 PASS EXIT=0**（增语音缝内容闸九臂） | **绿** |
| 2 | 修复前红（变异） | r0：MUT-A=4 FAIL+abort EXIT=1 · MUT-B=运行时红 EXIT=1（§0.3）。rev r1 增：**MUT-C**（/tmp 双闸去除）=7 FAIL EXIT=1 · **MUT-C1**（仅去组合根闸）=2 FAIL+abort `voice_submit_no_issued_question` EXIT=1（pre-claim 排序承重）→ 恢复后 **37/37 EXIT=0** | **红（已证）→ 恢复后绿** |
| 3 | 语音边缘 proof | `node scripts/run-e2e-isolated.mjs voice:prove` 全 PASS EXIT=0（mock 图 modality-agnostic 面零回归；世界口径注记见 §1.3——本门绿≠产品世界证据） | **绿** |
| 4 | 自适应图族 proof | adaptive-flow（隔离 runner）✓ · ag-a-resume ✓ · adaptive-life ✓ · adaptive-consumer ✓ · adaptive-degrade ✓ · graph-run-observability ALL PASS（零 DB 直跑）· **ag16-legacy：rev r1 亲跑 EXIT=1 `stale_question`（重放臂 c F-2）——基线即红四证**：`768db078f`（runner+直跑两形）· `1a028cf79` · rev r1 树 · 审查期收据（19:57Z failed/1·收据本体无臂/错误指纹字段，该腿「同臂同错」系 digest 钉+三亲跑推定补强·会签 P2-d 如实注·裁定不变）同臂同错=**基线预存红，非本刀回归、AG-16 域越界不可修**；r0 卷本行「ag16-legacy ✓」判定被今日读数推翻，本行勘正如实记账（归协调方派单，见 §9 悬决项） | **族 6/7 绿 + ag16 基线即红如实记账** |
| 5 | ai-graphs prove | prove:adaptive-graph ✓ · prove:adaptive-signals ✓ · prove:adaptive-compile-contract ✓ | **绿** |
| 6 | N1 具型拒面 | `node scripts/run-e2e-isolated.mjs uc012:nhp-neg:prove:raw` **62/62** EXIT=0（N1 空引用载荷→`:494` 具型拒语义零变·:487 系缝顶闸 +7 行位移前旧位如实勘正·会签 P2-a；EXEC 届树复跑同值） | **绿** |
| 7 | `pnpm neg:interview` | EXEC 届树 **128** 条负路径用例全绿 EXIT=0（起草期读数 108·+20 系主线 KILL-SWITCH-ENTRY 刀 §11 三口负臂随 rebase 并入·非本刀臂如实注） | **绿** |
| 7b | `pnpm neg:input`（rev r1 增门：内容闸单一真相入口负路径面） | 135 条负路径用例全绿 EXIT=0 | **绿** |
| 7c | domain 内容闸 proof（rev r1 增） | `pnpm -C packages/domain prove:ctx-01-input-routing` 增 C2 七臂全 PASS EXIT=0（空白/边界 8000/超长 8001/assert 形同码） | **绿** |
| 8 | typecheck | worker EXIT=0 · api EXIT=0 · domain EXIT=0（rev r1 三包全跑）· ai-graphs 无 typecheck 脚本（以 lint+tsx 真跑承） | **绿** |
| 9 | lint | worker 0 errors/**991** warnings（=r0 读数恒等·base 999）· domain 0 errors/115=cap 115 恰等 EXIT=0 · ai-graphs 47=cap 47 恰等 EXIT=0 · api 0 errors/1545 EXIT=0 | **绿（不高于基线）** |
| 10 | `pnpm arch` | 0 errors/8 warnings · 1191 modules/3792 deps（r0=3788·rev r1 +4 边=内容闸单一真相 import 面：domain 新原语+interview-voice→lifecycle/db/domain 组合根装配，零新违例）EXIT=0；EXEC 届树 1192 modules/3802 deps（+1/+10 系主线 KSW/UC31/SBG 并入模块面·违例恒 0E/8W 不升） | **绿（违例与 base 恒等）** |
| 11 | egress inventory | `static_provider_egress_inventory_valid: adapters=5; operations=10; registered_consumer_source_pairs=55; environment_references=404` EXIT=0（与 r0 读数恒等——rev r1 零新 proof 文件零新登记） | **绿** |
| 12 | docs:check | `scanned 2491=cap 2491` 恰等 EXIT=0（rev r1 零新受管文件，cap 零步进）；EXEC 届树 rebase 并线后亲跑 `scanned 2498=cap 2498` 恰等 EXIT=0（cap 2497→2498 union 恰等步进·CAP-SANCTION-2498 注记在案·零新受管文件） | **绿** |
| 13 | PTP | `public-text-policy.proof.mjs` EXIT=0 **12/12**（`static_preflight_valid: selected=12/12`） | **绿** |
| 14 | markers | 改动集（9 文件）五类标记词 grep 零命中（词面不入卷防自匹配） | **0** |

## §3 范围外（越界即 FAIL）

1. 语音对真实用户开放（生产接线/公开开关）——依赖部署，不在本刀（台账复核结论同源）。
2. AG 台账 `issues-final.md` AG-32 行翻面——**只写成建议**（翻面权归协调方/登记笔，本刀零触台账文件）。
3. `pending_question_missing` concluded 臂、AG-31 图版本持久化、`evaluate-answer` 各 fail-closed 臂语义——零触。
4. `run-e2e-isolated.mjs` 收据/门域（CAP-SANCTION-2480 R2-RECEIPT-GATE 修复域）——零触。
5. 迁移（零预占）、Key/`.env*` 值、`.tmp/**` 业务上下文、他 worktree（主仓只 worktree add 一改动）。

## §4 依赖与迁移号

零新依赖；迁移号=零。

## §5 Ban 列表 + pins

**Ban**：push/force-push（改动只交付本 worktree 一 commit）· git stash · 触 §3 各域 · 改写既有 CAP-SANCTION 注记（只恰等追加）· 放宽 `{answerId}` 契约或加兼容路径（原始字符串/任意对象 resume 永不合法）· 绕过 voice_capture 同意门/内容安全开关/计费预留/预览门任何一守卫 · Key/`.env*` 物料入卷 · self-approve · 预占迁移号 · 浏览器 UI runner / 长驻服务 · `.tmp/**` 当业务上下文 · 动他 worktree。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零真实模型外呼 · 隔离 PG + scripted ModelClient + fake ASR/TTS）。

## §6 est live=0

全部 proof=隔离 PG（专用容器 `meetwise-va32-pg` / 隔离 runner 自建容器）+ scripted ModelClient + fake ASR/TTS（零 provider 外呼零 Key）；门面=typecheck/lint/arch/egress/docs 机检（全本地）。`actualSpendCny=null`。

## §7 markers=0

五类标记词改动集 grep 零新增（命令回执随交付报告；词面不在卷内复抄防自匹配）。

## §8 STOP + 停止条件

**`post_prove_dual_pass`**（Status 头/§8/卷尾三处同值·§9 仅节题无字面——会签 P2-b 对 r0「四处同值」措辞勘正如实 · EXEC 落卷即停）。开工三条款：①pre-exec 双审两独立外席 BOTH PASS **已满足**（证伪初审 FAIL→rev r1 修订→会签 PASS·各 P0=0·P1=0·报告 `.tmp/reviews/ag32-pre-2.md`/`ag32-r1.md`）；②协调方 EXEC 授权 **已行使**（同日：rebase 并线 origin/main 6ecce7705=#217+届树全门复跑绿+会签 5 条 P2 吸收·§9-EXEC 亲跑读数在案）；③post-prove 双审后继工序待派。

**停止条件（命中即停手上报）**：
1. **现场漂移**：pre-exec/EXEC 对届时 tip 重 pin，§0 锚漂移超 ±3 且结论受影响、或三处根因面（await-answer/voice-turn/voice-adaptive）被他刀改动 → 停。
2. **验收红**：§2 门 1-14 任一红且无法在本刀范围内归因修复（含 Ban 为绿放宽断言/门）→ 停。
3. **越界需要**：需触 §3 任一域才能继续 → 停。
4. **机制不符**：非法重问臂若在真 Postgres checkpointer 下复现 resume 数组不回放/首答即终场（interrupt 多下标语义漂移）→ 停。

## §9 pre-exec dual 交接

- **双审对象**：§0.1 锚表逐条 file:line 与台账原文（含 `:413` 旧路径勘正对齐）· §0.2 两路径判读 · §0.3 变异红读数原值 · §0.5 rev r1 增锚（文本入口校验清单+语音缝缺口原值）· §1.1 重问机制（LangGraph 多 interrupt 回放语义）与 N1 具型拒兼容面 · §1.2 submit 缝形与内容闸三挂点单一真相 · §1.3 真路径/守卫/零外呼/缝内容闸四面与 `voice:prove` 世界口径注记 · §2 门矩阵（含 rev r1 ag16 勘正记账）· §3 范围外。
- **rev r1 注记（登记源=证伪外席2 报告 `.tmp/reviews/ag32-pre-2.md` FAIL · P1×1·P2×3）**：P1 语音缝入口校验不等位 → 按 1(a) 修法落（内容闸下沉单一真相+pre-claim 排序，§1.2/§1.3，proof 九臂+双变异承证）；P2-1 锚漂移 → §0.1-#5 `:498`→`:473` 勘正；P2-2 状态膨胀 → 缝内拒收先于 claim+invoke=被拒内容**零持久化**（checkpoint state 字节零增长 proof 断言承证；重问 interrupt value 仅携带枚举诊断字段不含原始 payload），**登记义务：未来任何直驱 resume 的接线必须保持非法 resume 面关闭或加拒绝次数帽**（否则框架仍按拒绝次数持久化原始 payload 进 checkpoint_writes，实测 +200KB/5拒·100KB 载荷）；P2-3 `voice:prove` 0047 世界口径 → §1.3 注记（理由在案：boot 世界零业务表自足，0047 管辖面在该世界无消费者）。
- **EXEC 期记录（2026-11-06 · 协调方 EXEC 授权随令行使 · 全部读数届树亲跑）**：
  - **rebase 并线**：fetch 首试 HTTP2 framing 层错（ref 已前进至 6ecce7705 亲证）·HTTP/1.1 重试连接不可达·再三试 EXIT=0 up-to-date 届值恒等；届值如实采 origin/main `6ecce7705`=#217 ksw-status-pin（ahead 22 commits）·rebase 两 commit 干净落位（届 tip=`6125f0d29`）。
  - **两 policy 冲突 dual-keep**：4 处冲突块（policy 注记/cap 区+proof loop/atCap 区+proof 注记/overCap 区）均在注记/注释行+数值行——main 侧 SBG 起草/SBG nail/UC31-REV 起草/UC31-REV r2/UC31 EXEC/UC31 nail/FASTM 起草/FASTM nail/KSW 起草/KSW nail 十注史录全保留+本支 AG32 起草注并留（预登 2491 史录零洗）+新增 **CAP-SANCTION-2498** union 注记·cap 按合并树实测恰等步进 **2497→2498**（union 算式=main 届扫 2497+本卷 REQUEST 1 件·docs:check 届核亲跑 scanned 2498=cap 2498 恰等 EXIT=0）·四联动点 2_498/f-2498.md/:2499 恰等改·PTP 12/12 亲跑。
  - **作答提交缝被主线改动（逐个处理+受影响 proof 重跑）**：主线 KILL-SWITCH-ENTRY 刀改 `interview.service.ts`（`denyContentSafetyKilled` 映射体模块化为 `denyContentSafetyKilledShared` :109+beginInterviewCore 核首语句复闸 :139/:372）与本刀 turn() 内容闸（judge :472）同文件不同区 auto-merge 零冲突·语义正交（kill-switch=§0.5-#1 HTTP 层闸语义零翻·内容闸单一真相原样）；`await-answer.ts`/`voice-turn.ts`/`voice-adaptive.proof.ts` 主线零触（`git diff --name-only` 亲证）·三处根因面字节保持 r1 形；受影响 proof 全量重跑：voice-adaptive 37/37 EXIT=0（含 kill-switch engage 臂 api begin/turn 同一闸面）·neg:interview 128 全绿·neg:input 135 全绿·api typecheck EXIT=0/lint 0E/1545W 恒等——**机制结论零变化·停止条件 1/4 未命中**。
  - **届位重 pin（EXEC 届树亲证）**：adaptive-lifecycle.ts 缝顶闸 :432 区/stale_question :477/resume `{answerId}` :480/具型拒 :494/verify fence :502-503/stale 臂 :504-505（与 r1 会签审查届位恒等·零再位移）；interview.service.ts turn() :461 起·judge :472-473·共享 kill-switch 映射 :109/:139/:372·submitPreviewAnswer :513-516；api interview-voice.ts consent :127；billing :652/:662（§0.4 历史锚 :645/:655 系 @768db078f 修复前读数零洗·届位 +7 位移如实注）。
  - **会签 5 条 P2 处置（登记源=`.tmp/reviews/ag32-r1.md` PASS·P2×5）**：a. uc012 锚勘正已落（本 proof 注记/PIN 钉 :487/:496/:498→:494/:503/:505+卷 §1.1/§2 门6 届位勘正·勘正后复跑 62/62 绿）；b. 卷状态字面**三处**如实（Status 头/§8/卷尾·§9 无字面仅节题——r0「四处同值」措辞勘正）；c. `submitPreviewAnswer`（interview.service.ts :513-:516）0092 预演路行内空白/超长闸**就地保留不改**（空白码 `interview_answer_body_empty` 与 `invalid_turn` 分叉系基线既有 0092 域语义·有闸不属缺口；本刀改码即动 §3 范围外基线路由 fail-closed 面——**理由在案**·单一真相归拢登记后继候选刀）；d. 19:57Z 收据无臂/错误指纹字段**已注明**（§2 门4·该腿系 digest 钉+三亲跑推定补强·裁定不变）；e. 语音缝重放 stale 语义**登记为语音生产接线刀前置决面**（§9 悬决项承接）。
  - **EXEC 门读数全表（届树亲跑·一次性容器 `ag32-exec-pg` pgvector pg16 @127.0.0.1:54432·用后即删）**：门1 voice-adaptive **37/37** EXIT=0 · 门3 voice:prove EXIT=0 · 门6 uc012 **62/62** EXIT=0 · 门7 neg:interview **128** 全绿 EXIT=0 · 门7b neg:input **135** 全绿 EXIT=0 · 门8 typecheck worker/api/domain EXIT=0 · 门9 lint worker 0E/991W（基线 999）·domain 0E/115=cap·ai-graphs 47=cap·api 0E/1545（全部与 r1 恒等·不高于基线）· 门10 arch 0E/8W·1192 modules/3802 deps EXIT=0 · 门11 egress valid adapters=5/operations=10/pairs=55/env_refs=404（与 r1 恒等）· 门12 docs:check scanned 2498=cap 2498 恰等 EXIT=0 · 门13 PTP **12/12** EXIT=0 · 门14 markers **0**（改动集 14 文件五类词 grep 零命中）。
- **悬决项（归协调方）**：pre-exec 双席派定 · EXEC 排程 · post-prove 双席 · AG 台账 AG-32 行翻面（**建议**：三处修毕且本卷门全绿后按登记笔惯例翻 CLOSED，翻面注引本卷）· `resumeError` 的 SSE/前端消费提示（additive 字段已可观测，消费面后刀）· 语音缝重放 stale 语义决面（同转写重试新 answerId→claim stale vs 文本路同 identity replayed·归语音生产接线刀·会签 P2-e）· preview 路空白码单一真相归拢候选刀（`submitPreviewAnswer` `interview_answer_body_empty` 与 `invalid_turn` 分叉·基线既有 0092 域有闸不属缺口·会签 P2-c）· 语音生产接线排程（依赖部署）· **ag16-legacy 基线预存红派单**（`stale_question` 于重放臂 c F-2，`768db078f` 即红四证——AG-16 域，非本刀面，§2 门 4 勘正记账待专刀归因修复）。
- **本卷落卷后事实基座不受后继裁决影响的部分**：§0 全节读数、§0.3 变异红读数、§0.5 证伪原值记账、§2 门 4 ag16 四证系原值记账（零冲销）。

---

*AG32-CODE REQUEST · 2026-11-06 起草 · 同日 rev r1 证伪修订（登记源=证伪外席2 FAIL · P1 语音缝内容闸等位下沉+P2×3 勘正）· 起草落卷即停 · **`post_prove_dual_pass`**（Status 头/§8/卷尾三处同值·§9 仅节题·会签 P2-b 勘正）· alone ≠ dual · base `origin/main` @`768db078f`（#213 merge 点 · fetch 后亲证）· worktree `meetwise-ag32` · branch `line/ag32-draft` · r0 改动集=三 src（await-answer.ts 重问臂/voice-turn.ts submit 缝/interview-voice.ts 组合根）+三 proof（voice-adaptive.proof 真路径重写/voice.proof submit 形适配/—）+egress inventory.json additive 三行+两 policy 脚本 cap 恰等步进 2490→2491+本卷（唯一新受管件）；rev r1 增改集=domain input-routing.ts+index.ts（内容闸单一真相 judge/assert）+domain input-routing.proof.ts（C2 七臂）+api interview.service.ts（turn() 判定经 judge·HTTP 码面映射不变）+worker adaptive-lifecycle.ts（submitAdaptiveAnswerImpl 缝顶闸）+worker interview-voice.ts（submitVoiceTranscriptAnswer 组合形=pre-claim 闸）+voice-adaptive.proof.ts（真缝委托+九臂）+voice.proof.ts（0047 世界口径头注）+本卷——**零新受管文件零新依赖零迁移，cap 恒等 2491，egress 零新增** · 修复前红已证（§0.3 变异两臂+§0.5 证伪原值）· rev r1 双变异红已证（MUT-C/C1）· 恢复后 37/37 绿 · §2 门 1-3/5-14 绿 · 门 4 族 6/7 绿+ag16 基线即红四证如实记账（§9 悬决派单）· est live=0 · pins 十一值照抄 · markers=0 · 停止条件四类全设 · self-approve 禁令不变 · **STOP（EXEC 落卷即停·post-prove 双审待派）***· EXEC 期 rebase 并线 origin/main `6ecce7705`=#217（两 policy dual-keep：main 十注史录全保留+本支 AG32 注并留+CAP-SANCTION-2498 union 注·cap 2497→2498 合并树实测恰等·docs:check scanned 2498=cap 亲证）· 缝面主线交互：interview.service.ts 同文件异区 auto-merge 语义正交·三处根因面主线零触字节保持 r1 形·受影响 proof 重跑全绿（§9-EXEC 全表：37/37·voice:prove 绿·62·128·135·typecheck×3·lint 恒等·arch 1192/3802·egress 恒等·PTP 12/12·markers 0）· 会签 5 条 P2 全吸收（a 锚勘正/b 三处措辞/c preview 分叉理由在案登记后继/d 收据注明/e 重放 stale 登记接线刀）· 届 tip=`6125f0d29`
