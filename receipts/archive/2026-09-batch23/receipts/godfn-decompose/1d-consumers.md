# GODFN-1d · 1d-consumers.md — 错误分类位点 tip 亲测全列（EXEC 前置交付物 · 设计 §2.4）

**Status**: **EXEC 前置交付 · 动码前落盘** · 蓝本 = REQUEST rev2 `86627721`（唯一蓝本）+ 已 nail 设计 `ai-docs/delivery/harness/godfn-decompose.md` @37705a3e（§1 #9 / §2.4 / §5.4 / §7.3）
**Date**: 2026-10-07 · **实测 tip**: worktree `meetwise-line-godfn1d` branch `line/godfn-1d-apperror` HEAD `86627721`（= rebase 后 REQUEST rev2，父链 `6da98526` → `493fc3b8` 1c 主线 tip · **§7.3 串行前置 1c 已兑现**）
**亲测口径**: `grep -rn "catch (<ident>: *any)"` 于 `apps/api/src` + `apps/worker/src` + `apps/worker/smoke` + `packages/db/src` + `packages/ai-runtime/src`（设计 §1 #9 同口径）；行号为本 tip 现树行号（**禁抄设计纪元 :9028eb70 行号** · 1a/1b/1c 后已漂移，本表全列漂移后实位）。
**计数**: **30 处 `catch (<ident>: any)` / 19 文件**（设计纪元 30/18；漂移=1c 把 interview.service 5 处拆为 facade 3 + interview-voice.ts 2 → 文件数 18→19，处数守恒 30）。含 smoke 1 处；核心生产 29 处。

---

## §0 1c 串行守恒复测（EXEC 亲测 · 五 catch 实位）

| 位点 | 现树行号 | 形态 | 判 |
|---|---|---|---|
| `interview.service.ts` facade | **:157** `catch (error: any)` | `error?.message === 'interview_privacy_fenced'` → 410/410 映射（guardInterviewPrivacy 内 assertInterviewPrivacyActive 收口） | 守恒 ✓ |
| `interview.service.ts` facade | **:305** `catch (e: any)` | `e?.code === 'insufficient_entitlement'` → 402（begin 额度口） | 守恒 ✓ |
| `interview.service.ts` facade | **:501** `catch (e: any)` | `e?.code === 'interview_release_failed' \|\| e?.code === 'interview_abandon_conflict'` → 409（abandon） | 守恒 ✓ |
| `interview-voice.ts`（api · 1c 新域文件） | **:30** `catch (e: any)` | `String(e?.message) === 'tts_not_configured'/'tts_download_capacity_exceeded'/'tts_malformed'` → 503/503/502 | 守恒 ✓ |
| `interview-voice.ts`（api） | **:73** `catch (e: any)` | `String(e?.message) === 'asr_not_configured'/'asr_malformed'/'asr_timeout'/'asr_aborted'` → 503/502/504/499 | 守恒 ✓ |

（REQUEST rev2 记载的 EXEC 哈希引用更正：rev2 文内 "1c EXEC @6f7e13cb" 应为 **@bbf9a962**（1c EXEC 实 commit，主线 493fc3b8 为其 nail）——勘误由本 EXEC 落账（收据 §勘误）。）

## §1 30 处 `catch (<ident>: any)` 全列（本 tip 亲测行号 · 处置逐处钉）

判定轨标记：**[code]** = `e?.code` 判定（code 轨 13 正等 + 否定式）· **[msg]** = message 轨 · **[3prop]** = reason/code/status 三属性 · **[lazy]** = 判定结果不可观测 · **[fold]** = code??message 折叠。处置：**narrow** = catch 型 any→unknown + 单一分类面（`asErr`/`errCode`，落 `@meetwise/db/src/errors.ts`）；**narrow+code** = narrow 且判定通道迁 code；**frozen** = 字节冻结（g7 车道豁免）；**retain** = narrow 但判定通道原样保留（本文 §3 pin 证据）。

| # | 文件:行 | catch 变量 | 分类表达式（现树） | 轨 | 处置 |
|---|---|---|---|---|---|
| 1 | apps/api/src/modules/auth/auth.service.ts**:32** | e | `e?.code === '23505'` → 409 email_taken（否定支照抛·不误报掩盖故障） | [code] | narrow |
| 2 | apps/api/src/modules/commerce/commerce.service.ts**:32** | e | `e?.code === 'idempotency_key_conflict'` → 409 | [code] | narrow |
| 3 | apps/api/src/modules/diagnosis/diagnosis.service.ts**:60** | e | `e?.code === 'insufficient_entitlement'` → 402 | [code] | narrow |
| 4 | apps/api/src/modules/interview/interview-voice.ts**:30** | e | `String(e?.message) === 'tts_not_configured'` /`'tts_download_capacity_exceeded'`/`'tts_malformed'` → 503/503/502 | [msg] | retain |
| 5 | apps/api/src/modules/interview/interview-voice.ts**:73** | e | `String(e?.message) === 'asr_not_configured'/'asr_malformed'/'asr_timeout'/'asr_aborted'` → 503/502/504/499（e instanceof HttpException 先照抛） | [msg] | retain |
| 6 | apps/api/src/modules/interview/interview.service.ts**:157** | error | `error?.message === 'interview_privacy_fenced'` → 410 | [msg] | retain |
| 7 | apps/api/src/modules/interview/interview.service.ts**:305** | e | `e?.code === 'insufficient_entitlement'` → 402 | [code] | narrow |
| 8 | apps/api/src/modules/interview/interview.service.ts**:501** | e | `e?.code === 'interview_release_failed' \|\| e?.code === 'interview_abandon_conflict'` → 409（读 `e?.status`） | [code] | narrow |
| 9 | apps/api/src/modules/quiz/quiz.service.ts**:57** | e | `e?.code === 'insufficient_entitlement'` → 402 | [code] | narrow |
| 10 | apps/api/src/modules/resume/resume.service.ts**:53** | e | `e?.code === 'unsupported_file_format'` → 415 · `'encrypted'` → 422 · `'image_needs_ocr'` → OCR 重定向 | [code] | narrow |
| 11 | apps/api/src/modules/resume/resume.service.ts**:99** | e | `e?.code === 'insufficient_entitlement'` → 402（并透传 `e.requested`/`e.available`） | [code] | narrow |
| 12 | apps/worker/smoke/adaptive-attack.ts**:67** | e | `'exc_' + String(e?.message).slice(0, 30)`（smoke 观测面·非分类门） | [msg] | narrow |
| 13 | apps/worker/src/commerce-reconcile.ts**:57** | e | `e?.code !== 'interview_abandon_conflict' && e?.code !== 'interview_release_failed'` → 照抛（**否定式**·软置 abandoned 仅吞两确定性码） | [code] | narrow |
| 14 | apps/worker/src/diagnosis-consumer.ts**:36** | e | `e?.code === 'legacy_resume_reference_unresolved'`（+ `e?.message ?? 'err'` 落 markFailed 文本） | [code] | narrow |
| 15 | apps/worker/src/interview-consumer.ts**:82** | error | `error?.reason === 'already_confirmed' \|\| (error?.code === 'interview_failure_terminal_conflict' && (error?.status === 'completed' \|\| error?.status === 'abandoned'))` → 'settled' 否则照抛 | [3prop] | narrow（三属性**原样表达**） |
| 16 | apps/worker/src/interview-consumer.ts**:163** | terminalError | 无判定（metrics 计数 + 原样重抛） | — | narrow |
| 17 | apps/worker/src/interview-consumer.ts**:188** | error | `error?.message === 'interview_privacy_fenced'` → requeue+retry 否则照抛 | [msg] | retain |
| 18 | apps/worker/src/interview-consumer.ts**:374** | e | `e?.code === 'graph_fence_lost'` → requeue+retry | [code] | narrow |
| 19 | apps/worker/src/interview-consumer.ts**:408** | terminalError | 无判定（refundFailed 计数 + 原样重抛） | — | narrow |
| 20 | apps/worker/src/interview-consumer.ts**:427** | error | `error?.code ?? error?.message ?? 'err'`（console 日志折叠） | [fold] | narrow |
| 21 | apps/worker/src/interview-service.ts**:299** | error | `error?.message ?? 'invalid_report'`（businessValidate 回调文本折叠） | [fold] | narrow |
| 22 | apps/worker/src/quiz-consumer.ts**:36** | e | `e?.code === 'legacy_resume_reference_unresolved'`（+ `e?.message ?? 'err'`） | [code] | narrow |
| 23 | apps/worker/src/report-worker.ts**:47** | e | `e?.message === 'interview_privacy_fenced'` → 'stale'（+ `e?.message ?? 'err'` 落 markReportFailed） | [msg] | retain |
| 24 | packages/ai-runtime/src/circuit-breaker.ts**:121** | error | `error?.message === 'model_circuit_half_open'` → known_not_executed（**精确等** · 保 :85 近邻变体 `model_circuit_half_open_admission_required` 不匹配） | [msg] | narrow+code（§2·M2） |
| 25 | packages/ai-runtime/src/tools.ts**:31** | e | `'tool_error:' + (e?.message ?? 'unknown')` | [fold] | narrow |
| 26 | packages/ai-runtime/src/voice.ts**:446** | error | instanceof ExternalRequestAbortedError/TimeoutError/HttpStatusError 分派 + **:453** `error instanceof Error && error.message === 'asr_malformed'` → throw（**惰性位点**：:454 无条件 `throw error`，两臂同效） | [msg·lazy] | narrow+code（§2·M3·惰性保持禁修活） |
| 27 | packages/ai-runtime/src/voice.ts**:488** | error | instanceof External 三型分派（tts 下载面） | — | narrow |
| 28 | packages/db/src/payment.ts**:76** | e | `e?.code !== '23505'` → **照抛**（**否定式·禁吞 PG 身份**）·23505 → savepoint 回滚 → 'conflict' | [code] | narrow |
| 29 | packages/db/src/payment.ts**:119** | e | 同 :76（refund 面） | [code] | narrow |
| 30 | packages/db/src/resume.ts**:114** | error | `error?.code !== '23505'` → savepoint 回滚 + **照抛**（否定式） | [code] | narrow |

分布对账（vs 设计 §1 #9 纪元）：interview-consumer 6（=:15,16,17,18,19,20）· interview.service 5→**现树 3+interview-voice 2**（=:6,7,8 + :4,5 · 1c 拆分漂移·处数守恒）· payment 2（:28,29）· resume.service 2（:10,11）· voice 2（:26,27 · ai-runtime voice.ts）· 单点文件 13（:1,2,3,9,12,13,14,21,22,23,24,25,30）。**合计 30 / 19 文件** ✓

## §2 message 轨位点全列（双轨收敛处置 · g7 车道豁免）

设计 §2.4 迁移名单（纪元）：`invoke.ts:200` · `model-client.ts:517` · `voice.ts:453` · cloud-* helpers。现树实位与处置：

| 位点（现树） | 表达式 | 处置 | 依据 |
|---|---|---|---|
| **model-client.ts:508 / :520**（纪元 :505/:517） | `msg.startsWith('g7_')` ×2 | **字节冻结（零 diff）** | rev2 席2 处方① g7 车道豁免：换判定通道须重编 g7_ 族 ~27 抛点，撞设计 §2.4 Ban+§3③ 零 G7 判定面。catch 型收窄不适用（两位点所在 catch 本为无注解/非 any——亲测 :505 `catch (fallbackError)` 与 :520 所在 catch 均**非 `:any`**，无 narrow 面故本刀对该文件**零触碰**） |
| **circuit-breaker.ts:122**（catch 在 :121） | `error?.message === 'model_circuit_half_open'` 精确等 | **narrow+code**：producer :56 → `AppError`；:122 → `errCode(error) === 'model_circuit_half_open'`（精确等保形·禁前缀化） | 闭世界 producer 审计：全树 throw 该串仅 breaker :56（:43/:96 为结构化 outcome 非抛·model-admission.ts:35/:96 为映射表→结构化 outcome 非抛·invoke :685 的 `new Error(plan.error)` 不流经 :122/:200 判定面）；近邻变体 :85 `model_circuit_half_open_admission_required` 不同串不匹配（保形） |
| **invoke.ts:200**（isHalfOpenFollower） | `error instanceof Error && error.message === 'model_circuit_half_open'` | **→ `errCode(error) === 'model_circuit_half_open'`** | 唯一调用点 invoke :682（admit 相位 catch）·流经错误仅 breaker :56 抛出（§上方审计）·测试桩 3 处随形对齐（断言零改，§4） |
| **voice.ts:453**（catch :446 内） | `error instanceof Error && error.message === 'asr_malformed'` → throw；**:454 无条件 `throw error`** | **narrow+code·惰性保持**：表达式 → `errCode(error) === 'asr_malformed'`；producer `requireNonEmptyText`（native-response-guard.ts:11/:13）→ `AppError`（message=code 零变）·**tautology 原样保留禁修活**（:453 真臂 ≡ :454 无条件抛——判定不可观测，等价论证=两臂同效，禁顺手删除/改写该分支） | 唯一 src 调用者 voice.ts:445；api interview-voice.ts:78 消费 `.message` 串——AppError message 串零变故 retain 位点不受扰；seam `interview-voice-seams.ts:69/:75` 仍抛 plain Error（测试支持面·零触碰） |
| **cloud 双轨**（fc_⊂smoke_ 分层漏斗） | cloud-smoke-fc.ts:79/:96 · cloud-test-fc.ts:104/:120 · cloud-readiness.ts:281-289 · cloud-test-serial.ts:509/:513 | **producer→AppError（7 抛点）+ 漏斗保形**：`failure()`/`smokeError()` 族 → `AppError`（code=原串·message=原串）；漏斗判定表达式**逐字节原样**（AppError.message=code → 现行 `message.startsWith(...)` 判定对 AppError 恒同结果·fc_⊂smoke_ 分层漏斗保形） | 保形 pin 证据（断言面 Ban 洗红）：cloud-test-serial.proof.ts:70-73 以 **plain Error** 钉 `cloudTestSerialFailure` 的 (unknown)→string 契约（:70/:72/:73 依赖 message 轨过层）·cloud-readiness.proof.ts:28-30 钉 code 探测层 ·cloud-*-fc.proof.ts:20/:63/:67/:38-:57 钉 handler 收据 code 串——漏斗即本车道单一分类面（smoke→cloudSmokeFailure · serial→cloudTestSerialFailure · fc→failedReceipt/fixedFailure），漏斗内层 2 code 探测（cloud-readiness.ts:283-285）已是 code 轨保持原样 |
| apps/api/modules/interview/interview-voice.ts:31/:33/:35/:76/:78/:80/:85 | `String(e?.message) === 'tts_*/asr_*'` | **retain**（1c 后漂移新增 msg 轨位点·catch narrow 但判定通道原样） | 1c 机械迁出位点；producer（ai-runtime voice.ts :431/:475/:484/:486 等）不在本刀迁移名单；换通道需全 producer 链 AppError 化=借刀夹带风险 |
| report-worker.ts:48 | `e?.message === 'interview_privacy_fenced'` | **retain** | producer `assertInterviewPrivacyActive`（db）非本刀迁移名单 |
| interview-consumer.ts:189 | `error?.message === 'interview_privacy_fenced'` | **retain** | 同上 |
| interview.service.ts:158 | `error?.message === 'interview_privacy_fenced'` | **retain** | 同上（mapAnswerLedgerError :103 的 `String(error?.code ?? error?.message ?? '')` 折叠为**参数面**非 catch 面，设计 §6 余量·零触碰） |

## §3 producer 面审计（零变/随形清单）

- **零触碰 producer**（code 轨消费方现生产者，`Object.assign(new Error(msg), { code, ... })` 形态——`errCode` 结构探测对恒同）：db commerce.ts :82（insufficient_entitlement+available/requested）· :221-222（interview_failure_terminal_conflict+status）· :270/:287-288/:308-309（interview_release_failed/interview_abandon_conflict）· payment.ts:40（idempotency_key_conflict）· diagnosis/quiz consumer :34（legacy_resume_reference_unresolved Object.assign 形）· graph_fence_lost/interview_* 族各 producer。
- **随形 → AppError producer**（仅 3 组·message=code 零变）：① breaker :56（model_circuit_half_open）；② cloud 7 抛点：cloud-smoke-fc.ts:29 · cloud-test-fc.ts:33 · cloud-test-serial.ts:70 · cloud-test-run-ledger.ts:46 · cloud-readiness.ts:55 · cloud-smoke-runner.ts:92/:97；③ native-response-guard.ts `requireNonEmptyText` 2 throw（asr_malformed 唯一 src 消费者 voice.ts:445；同文件 requireRecord/requireFiniteVector/requireHttpsUrl **零触碰**）。
- **零触碰 seam**：interview-voice-seams.ts:69/:75（plain Error·测试支持面）。
- **g7_ 族 ~27 抛点**：零触碰（Ban：把 g7_ 前缀族错误改码）。

## §4 测试桩随形对齐（断言零改 · 1c「IO 桩随形对齐·断言零改」先例）

| 文件:行 | 现形态 | 随形 |
|---|---|---|
| packages/ai-runtime/test/failover-price-policy.proof.ts:249 | `admit: async () => { throw new Error('model_circuit_half_open'); }` | `new AppError('model_circuit_half_open')` |
| packages/ai-runtime/test/failover-price-policy.proof.ts:293 | 同上（sameAdmitCalls===1 支） | 同上 |
| packages/ai-runtime/test/model-cost-governance.proof.ts:230 | `if (primaryProbeHeld) throw new Error('model_circuit_half_open');` | 同上 |

（三处皆为 :200/:122 迁 code 后的等价输入对齐；**断言零改**。prove:failover-price-policy/prove:model-cost/prove:model-op02 均在 §5.4 1d 键面内复跑闭环。）

## §5 13 处 `e?.code ===` 正等位点（零行为变·负测面）

auth.service:33（23505）· commerce.service:33（idempotency_key_conflict）· diagnosis.service:61（insufficient_entitlement）· interview.service:306（insufficient_entitlement）· interview.service:502（interview_release_failed‖interview_abandon_conflict）· quiz.service:58（insufficient_entitlement）· resume.service:54/:58/:63/:100（unsupported_file_format/encrypted/image_needs_ocr/insufficient_entitlement）· diagnosis-consumer:40（legacy_resume_reference_unresolved）· interview-consumer:378（graph_fence_lost）· quiz-consumer:40（legacy_resume_reference_unresolved）。

**负测证明面**：narrow 后逐位点判定恒等（`errCode(e)` 对任意输入 ≡ `e?.code ===` 字面判定——非 string code / 无 code / 原始值输入全等价）+ 否定式 4 处（payment:77/:120 · db resume:115 · commerce-reconcile:60）**照抛分支保 PG/业务错误身份**（负测=非 23505/非两码输入必照抛）。触面=neg 五键+uc 键+四 consumer+payment 键（§6）。

## §6 prove 面（设计 §5.4 · rev2 §2 全键）

- interview uc/neg 十键（api）：`neg:interview` · `prove:uc002-http` · `prove:uc002-adv` · `prove:uc004-career-path` · `prove:uc004-career-path-fault` · `prove:uc011-report-refund-http` · `prove:uc018-abandon-http` · `prove:uc018-adv` · `prove:uc019-report-regenerate-http` · `prove:uc025-stale-quiz-expiry`
- neg 五键+总门（api）：`neg:auth` · `neg:commerce` · `neg:resume` · `neg:input` · `neg:all`
- invoke 五键（ai-runtime）：`prove:model-op02` · `prove:failover` · `prove:failover-price-policy` · `prove:claim-join-orphan` · `prove:model-cost`
- voice 七键（ai-runtime `prove:voice-reliability` · `prove:vstream` · `prove:voice-stream-preview` · `prove:interview-voice-seams`；api `prove:voice-timeout` · `prove:voice-operation-policy` · `prove:voice-cancel-http`）
- cloud 五键（worker）：`prove:cloud-readiness` · `prove:cloud-smoke-fc` · `prove:cloud-test-fc` · `prove:cloud-test-ledger` · `prove:cloud-test-serial`
- worker 四 consumer：`prove:interview` · `prove:quiz` · `prove:diagnosis` · `prove:report`
- payment/reconcile 三键：`prove:uc011-report-refund-http`（api·与 uc 列重合计一次执行）· `prove:commerce-reconcile`（worker）· `prove:model-invocation-reconcile`（worker）
- 门：**EXIT=0 或 base 同红零回归**（base≡red 全账·Ban 洗红）· est live 模型调用 ≤25/run 链记账 · Key name-only。

## §7 硬约束对照（EXEC 遵守）

零迁移/零 SSOT/零 G7 判定面（g7 车道豁免条款外·model-client.ts 零 diff）· 错误分类语义零变（判定结果/映射面等价·禁吞错误身份=否定式照抛分支保形·禁修活惰性位点 :453 tautology 保持）· pins 十一值照抄设计 §4 + 脚注 actualSpendCny=null · 作者 mw-core · 本文件为动码前置交付物——落盘后 EXEC 方可动码。

*1d-consumers.md · 2026-10-07 · tip 86627721 亲测 · EXEC 席 mw-core · STOP*
