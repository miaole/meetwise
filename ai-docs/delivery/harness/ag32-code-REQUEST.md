# AG32-CODE REQUEST（meetwise AG-32 码面修复刀 · P3 · 编排运行时三处：await-answer 非法输入即终场 · voice-turn 原始转写 resume 违 {answerId} 契约 · voice-adaptive.proof 假 submit 掩盖契约差 · 起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-11-06 起草席落卷 · 起草期已含修复实现与真路径 proof 全绿 · pre-exec 双审两独立外席待派 · alone ≠ dual · ⛔push ⛔merge 主线 · Ban self-approve · est live=0 · `actualSpendCny=null`）

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
| 5 | `apps/worker/src/adaptive-lifecycle.ts:498` | 文本作答真路：`g.invoke(new Command({ resume: { answerId: input.answerId } }), cfg)`，前置 `verifyInterviewAnswerClaim` 占用核对 | ✓ |
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

## §1 修法（三处 · 不另造恢复路径 · 不松动 `{answerId}` 契约）

### 1.1 修1 `await-answer.ts`：非法输入拒绝+重问，不结束整场

- 校验失败臂不再返回 `concluded:true`；改在**原题原 identity** 上重新 `interrupt({…question, resumeError:'answer_reference_invalid'})`（新增导出常量 `ANSWER_REFERENCE_INVALID`，纯枚举标识符 additive 可入 interrupt/checkpoint），`pending/transcript/turn` 零推进，用户可重答。
- 机制：LangGraph 多 interrupt 语义（`interrupt.js` 源码亲读：节点重放按调用序回放已持久化 resume 数组，循环停在最早未回放下标=最新一次拒绝；`algo.js _scratchpad` 从 checkpoint pendingWrites 恢复）——合法 `{answerId}` 到达即走出循环走原 `submitted` 臂；concluded 臂只保留 pending 缺失的 fail-closed 面。
- 兼容面亲证：`uc-e2e-012-nhp-neg.proof.ts` N1 臂（job 载荷空 answerId 引用）依赖的具型拒 `answer_not_applied_to_expected_question` 语义**逐值不变**（新形下 invoke 照常返回、transcript 仍空、`!last → :487` 同码抛出），隔离 runner 真跑 62/62 绿（§2 门 7）。
- 消费面零破：worker/API 的 `pendingQuestion(snap)` 读 `interrupts[0].value.question` 原样在场，`resumeError` 为 additive 可选字段；文本路径 claim→resume 链恒合法输入，行为字节零变。

### 1.2 修2 `voice-turn.ts` + `interview-voice.ts`：走与文本作答同一提交路径

- `VoiceTurnDeps` 由 `{asr,tts,graph,cfg}` 改为 `{asr,tts,submit}`（`submit: (answer) => Promise<{nextQuestion?,done}>`，与 `runVoiceAdaptiveInterview` 的 `d.submit` 同形=「submitAdaptiveAnswer 包一层」既有约定）：本层零图直触，**转写字符串绝不进 Command(resume)**；`@langchain/langgraph` import 随之移除。
- 组合根 `previewVoiceAnswerTurn` 透传 `submit`（production 接线=claim+submitAdaptiveAnswer，本刀由真路径 proof 承证：转写→claimInterviewAnswer→`{answerId}` resume→投影，claim 行 queued→answered、结算 confirmed 全链断言）。
- `voice.proof.ts`（mock 图）适配：submit 闭包内 resume 归口（mock 图契约本就是字符串 resume，与本刀无涉；adaptive 图契约由 voice-adaptive.proof 真路覆盖）。

### 1.3 修3 `voice-adaptive.proof.ts`：假 submit 换真路径 + AG-32 三断言面 + 守卫不绕面

- 真 submit 闭包 `makeRealSubmit`：读 issued 题 identity（ledger）→ `claimInterviewAnswer`（randomUUID answerId+服务端同形 answerHash）→ `submitAdaptiveAnswer`——与 API turn+worker job 同一条写入恢复路。
- 真路三腿：② `runVoiceAdaptiveInterview`×真 lifecycle 整场收敛（转写=ANS、全题 answered、结算 confirmed、SSE question_ready=N/answer_evaluated=N、模型面 exactly-once 2N+1）；③ `previewVoiceAnswerTurn` 逐轮至 done（identity 链=issued 题面恒等 nextQuestion、done 后零开题）；① 非法 resume 三形（原始转写字符串/`{answerId:42}`/`{}`）拒绝+重问+identity 原样+resumeError 标记+拒绝后真提交一次通过（修复前红=§0.3 MUT-A）。
- 守卫不绕面：预览门五 refusal 臂（无旗标/半旗标/production/enforce/公开预览，tripwire=真 submit 零触）；内容安全开关 engage 即抛+缺省 off（api 同一闸原语亲证）；voice_capture 同意门（零 consent_record → `consent_required` 且题仍 issued，音频不出进程）；计费同路（reserve 1.0→结算 confirmed、可用额度逐腿核对）。
- 零外呼守面：入场删三 provider 键并断言不在场（词面运行时组装防自指）；ASR/TTS=fake 族（test-support 子路径）；ModelClient=scripted。零新受管 proof 文件（全并入既有 `voice-adaptive.proof.ts`）；egress inventory 对新 proof 的三键引用按 `test-isolation` 类 additive 登记 3 行（`.json` 既有注记零改写）。

## §2 验收（起草落卷期全跑 · 读数为亲跑回执）

| # | 门 | 判据 | 结论 |
|---|-----|------|------|
| 1 | 真路径 proof | `pnpm voice-adaptive:prove`（隔离 PG `meetwise-va32-pg`:54331 + scripted + fake ASR/TTS）28/28 PASS | **绿** |
| 2 | 修复前红（变异） | /tmp 拷贝 MUT-A=4 FAIL+abort EXIT=1 · MUT-B=运行时红 EXIT=1（§0.3） | **红（已证）→ 恢复后 28/28 绿** |
| 3 | 语音边缘 proof | `node scripts/run-e2e-isolated.mjs voice:prove` 全 PASS（mock 图 modality-agnostic 面零回归） | **绿** |
| 4 | 自适应图族 proof | adaptive-flow（隔离 runner）✓ · ag-a-resume（AG-05/AG-26 全臂）✓ · adaptive-life ✓ · adaptive-consumer 37/37 ✓ · adaptive-degrade ✓ · ag16-legacy ✓ · graph-run-observability ALL PASS（零 DB 直跑） | **绿** |
| 5 | ai-graphs prove | prove:adaptive-graph ✓ · prove:adaptive-signals ✓ · prove:adaptive-compile-contract ✓ | **绿** |
| 6 | N1 具型拒面 | `node scripts/run-e2e-isolated.mjs uc012:nhp-neg:prove:raw` **62/62**（N1 空引用载荷→`:487` 具型拒语义零变） | **绿** |
| 7 | `pnpm neg:interview` | 108 条负路径用例全绿 | **绿** |
| 8 | typecheck | `pnpm -C apps/worker typecheck` EXIT=0 · ai-graphs 无 typecheck 脚本（以 lint+tsx 真跑承） | **绿** |
| 9 | lint | worker 0 errors/**991** warnings（base 999——新 proof 去 any/命名告警后**低于基线**）· ai-graphs exit=0（47 warnings=cap 47 恰等） | **绿（不高于基线）** |
| 10 | `pnpm arch` | 0 errors/8 warnings · 1191 modules/3788 deps（base 同 8 warnings/3777 deps·+11 边=proof 新增跨包 import 面，零新违例）EXIT=0 | **绿（违例与 base 恒等）** |
| 11 | egress inventory | `static_provider_egress_inventory_valid: adapters=5; operations=10; pairs=55; environment_references=404` EXIT=0（base 401+本刀 proof 三键 `test-isolation` 登记，最小追加 diff） | **绿** |
| 12 | docs:check | cap 步进后 `scanned 2491=cap 2491` 恰等 EXIT=0（步进前基线亲跑 scanned 2490=cap 2490 恰等） | **绿** |
| 13 | PTP | `public-text-policy.proof.mjs` EXIT=0 **12/12**（cap 联动四点步进后亲跑） | **绿** |
| 14 | markers | 改动集五类标记词 grep 零命中（词面不入卷防自匹配） | **0** |

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

**`draft:awaiting_pre_exec_dual`**（Status 头/§8/§9/卷尾四处同值 · 起草落卷即停）。开工三条款：①pre-exec 双审两独立外席 BOTH PASS（各 P0=0·P1=0 · 审 §0 锚与红读数保真 + §1 三处修法与机制亲证 + §1.3 proof 面 + §2 门矩阵 + §0.3 变异红承）待满足；②协调方 EXEC 授权待行使；③post-prove 双审后继工序。

**停止条件（命中即停手上报）**：
1. **现场漂移**：pre-exec/EXEC 对届时 tip 重 pin，§0 锚漂移超 ±3 且结论受影响、或三处根因面（await-answer/voice-turn/voice-adaptive）被他刀改动 → 停。
2. **验收红**：§2 门 1-14 任一红且无法在本刀范围内归因修复（含 Ban 为绿放宽断言/门）→ 停。
3. **越界需要**：需触 §3 任一域才能继续 → 停。
4. **机制不符**：非法重问臂若在真 Postgres checkpointer 下复现 resume 数组不回放/首答即终场（interrupt 多下标语义漂移）→ 停。

## §9 pre-exec dual 交接

- **双审对象**：§0.1 锚表逐条 file:line 与台账原文（含 `:413` 旧路径勘正对齐）· §0.2 两路径判读 · §0.3 变异红读数原值 · §1.1 重问机制（LangGraph 多 interrupt 回放语义）与 N1 具型拒兼容面 · §1.2 submit 缝形 · §1.3 真路径/守卫/零外呼三面 · §2 十四门判定 · §3 范围外。
- **悬决项（归协调方）**：pre-exec 双席派定 · EXEC 排程 · post-prove 双席 · AG 台账 AG-32 行翻面（**建议**：三处修毕且本卷门全绿后按登记笔惯例翻 CLOSED，翻面注引本卷）· `resumeError` 的 SSE/前端消费提示（additive 字段已可观测，消费面后刀）· 语音生产接线排程（依赖部署）。
- **本卷落卷后事实基座不受后继裁决影响的部分**：§0 全节读数与 §0.3 变异红读数系原值记账（零冲销）。

---

*AG32-CODE REQUEST · 2026-11-06 起草 · 起草落卷即停 · **`draft:awaiting_pre_exec_dual`**（Status 头/§8/§9/卷尾四处同值）· alone ≠ dual · base `origin/main` @`768db078f`（#213 merge 点 · fetch 后亲证）· worktree `meetwise-ag32` · branch `line/ag32-draft` · 起草改动集=三 src（await-answer.ts 重问臂/voice-turn.ts submit 缝/interview-voice.ts 组合根）+三 proof（voice-adaptive.proof 真路径重写/voice.proof submit 形适配/—）+egress inventory.json additive 三行+两 policy 脚本 cap 恰等步进 2490→2491（CAP-SANCTION-2491 链注追加·四联动点恰等改）+本卷（唯一新受管件）· 修复前红已证（§0.3 变异两臂）· 修复后全绿（§2 门 1-14）· est live=0 · pins 十一值照抄 · markers=0 · 停止条件四类全设 · self-approve 禁令不变 · **STOP（起草落卷即停·pre-exec 双审待派）***
