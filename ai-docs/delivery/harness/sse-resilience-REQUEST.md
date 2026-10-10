# SSE-RESILIENCE — SSE 韧性刀（#53→#54→#55→#56+#61 · 批1 波A · EXEC REQUEST 起草）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `mw-sse1-draft` · docs-only · Ban self-approve · 待预执行双审 PASS 后才派 EXEC coding）
**Date**: 2026-10-10
**审计项**: issues-master #53/#54/#55/#56（P1·前端/SSE·第3批C 可靠性/运维/API）+ #61（P2·同域）·总单 `TASK-SOP-v2.md:42` 批1 波A 第 3 刀「指数退避+草稿 sessionStorage+干净 end 不计失败+状态码分支（401 登录/429 多标签）·三面板」
**Base**: `feat/mysql-schema-skeleton` @`a03b9371` · 分支 `line/sse-resilience`（工作树 `meetwise-line-sse1`）
**Honesty**: 五锚与全部涉案码 file:line 起草席亲读（漂±见 §0 表）；零实跑零 prove（本刀=REQUEST 起草，prove 判据见 §4 待 EXEC 兑现）；est live=0（纯前端/代理侧，零 Key 零外呼）。

---

## §0 立靶（五锚亲读 · 漂±全录）

蓝本锚 `issues-master :160-163` 实读漂 **-11**（文件在飞演进，五锚落 `:149-152` + `:282`）。逐条原文誊录 + 代码锚点复核：

| 锚 | issues-master（蓝本→实读） | 原文一句话（誊录） | 代码锚（蓝本→实读·漂） | 亲读实证 |
|---|---|---|---|---|
| **#53** | :160→**:149** | SSE 重连预算极小（3 次/≈1.4s）即 degraded，不监听 online/visibilitychange，恢复只能整页刷新 | interview-stream.ts:30,39,95（**零漂**）·InterviewPanel.tsx:489（**零漂**）·interview-state.ts:151-152→**:163-170**（漂 +12，onStreamClosed/onReconnectExhausted） | :30 `maxRetries ?? 3`；:39 `200*2**(a-1)` 封顶 5000 → 三连败 200+400+800≈1.4s；:95 耗尽→degraded；全仓 grep `visibilitychange\|onLine\|'online'` = **0 命中** |
| **#54** | :161→**:150** | 作答草稿只在 useState，无本地持久化；"重试"=整页刷新、resultId 变化清空，长答案会丢 | InterviewPanel.tsx:96,489（**零漂**）·view-model.ts:34→**:35**（漂 +1） | :68 `useState('')`；:96 resultId 切换 `setAnswer('')+setAnswers({})`；:489 retry=`location.reload()`；:210 仅提交成功才清空；view-model:35 文案「已答内容不会丢失…」——reload 即清 useState，**文案对草稿不成立**；全仓 web 码 grep `sessionStorage` = **0 命中**（持久化确缺） |
| **#55** | :162→**:151** | 服务端 10 分钟干净 end 也被客户端计为重连，空闲（无新事件）约 40 分钟即误判 degraded | sse-pump.ts:69,96（**零漂**）·interview-stream.ts:89-95（**零漂**） | pump :69 `deadline=+10min`、:96 干净 `raw.end()`；客户端 for-await 正常完成（无抛错）落到 :90 `onStreamClosed`→reconnecting、:92 `attempts++`；无进展时 :95 `attempts>max` → 第 4 根连接（4×10min≈**40min 空闲**）误判 degraded。**心跳盲区**：decodeSSE（business-events.ts:88,94）把 `: ping` 注释帧静默丢弃，驱动看不到活跃信号 |
| **#56** | :163→**:152** | SSE 打开失败全被抹平：401/404/429/5xx 都变"空流结束"→ 假断线 → degraded，无 401→登录跳转 | sse-cursor.ts:46-49,59-69（**零漂**）·events/route.ts:48,61（**零漂**）·interview.controller.ts:258（**零漂**） | cursor :49 `if (!res.ok \|\| !res.body) return;` ——**非 OK 一律空结束**；代理 :68 `sseProxyFailureResponse` 其实**已保 status 透传**（401/404/429/5xx 原码到浏览器），是客户端把白送的分类信息扔掉；上游源：route :48 无 token→401、controller :255→404、**:258** 429 `too_many_streams`；三 hooks 注释自认抹平（useInterviewStream.ts:19 等「401/404/502 空结束 → 驱动重连」） |
| **#61** | （蓝本未给）→**:282** | Server Action 对 401 无统一处理，会话过期点操作只见"出错了" | jobs/actions.ts:9-12,18（**零漂**；另 :50 同面）·lib/api/server.ts:27-31（**零漂**，完整函数 :27-33）·app/error.tsx:5-17（**零漂**） | ensureOk（actions :9-12）只对 402 redirect，其余非 ok 抛 `action_failed_<status>` 落根边界；**一致性靶已在仓**：serverGet（server.ts:30）对 401 `redirect('/login?expired=1')`——ensureOk 对齐它即可 |

同构面（三面板/三驱动/三代理同病，逐点亲读）：quiz-stream.ts:36,44,80-85 · diagnosis-stream.ts:36,44,80-85 · QuizPanel.tsx:109,122（reload）· DiagnosisPanel.tsx:144,155（reload）· useQuizStream.ts / useDiagnosisStream.ts（同 iterateSseBody 抹平）· quiz/[id]/events/route.ts:14,19 · diagnosis/[id]/events/route.ts:14,19 · quiz-state.ts:113 / diagnosis-state.ts:103（同「不会丢失」文案）。

**靶心一句话**：一条 SSE 流在今天可因「手机锁屏/切网 1.4 秒」永久 degraded（#53）、可因「服务器每 10 分钟的正常轮换」在 40 分钟空闲后误降级（#55）、401 会话过期被扮成假断线（#56），正在输入的长答案因任何一次刷新蒸发（#54），而岗位页 Server Action 过期只给一句「出错了」（#61）。修复口径（issues-master 建议列 + SOP:42）：**指数退避+抖动长期重连+online/visibilitychange；草稿 sessionStorage 按 interviewId+questionId；去 reload；干净 end 不计失败；按状态码分支（401 登录/429 多标签/5xx 退避）；ensureOk 401 redirect**。

## §1 范围（五件逐条 · 押题/诊断同改）

| 件 | 锚 | 修法（EXEC 依此实现） |
|---|---|---|
| **W1 重连韧性（#53）** | interview-stream.ts:30,39,95 | ① 退避改 **full-jitter 指数退避**（base/factor/cap 生产钉值，建议 base≈500ms·cap≈30s，注入可测）；② **连续无进展耗尽不再 degraded**——转入慢速永续退避（cap 档）继续重连，degraded 出口只留给：绝对上限 `maxTotalReconnects`（防 dribble-DoS，语义保留）、HTTP 400 非法游标（既有 fail-closed 零改）、本刀新增的 fatal 状态码（见 W4）；③ 浏览器触发器经**注入**（驱动保持框架无关可单测）：`online` → 立即重连一次并重置退避；`visibilitychange→visible` → 若在退避等待立即唤醒；`offline` → 退避等待可滞留（无需特判重试白烧）；`reconnecting` 态由 online 触发的恢复**绝不 reload 页面**。三驱动（interview/quiz/diagnosis）同构同改 |
| **W2 草稿持久化（#54）** | InterviewPanel.tsx:68,96,210,489 | 新增 `apps/web/lib/interview/draft-store.ts`（纯函数 + 可注入 storage，默认 `sessionStorage`）：键 `${resultId}:${questionId}`（questionIdentity 可用即用 questionId；缺失时降级 `${resultId}:${turns.length}` 并**不得跨题误复用**）；输入防抖写入；**:210 提交成功路径清除该题草稿**（次序：清草稿与 setAnswer('') 同事务语义）；:96 的 resultId 切换清除**只清匹配前缀键**，不误伤他场；驱动回 live/收到同 questionId 重放时恢复草稿入框。**:489 retry 去 `location.reload()`**——改为驱动「立即重连+重置退避」信号出口 |
| **W3 干净 end 不计失败（#55）** | interview-stream.ts:89-95 + sse-pump.ts:69,96 | 客户端**区分两种断流**：① 流**无错干净结束**（for-await 正常完成且非终态=服务器 10min 轮换/正常收尾）→ **不计 attempts/totalReconnects**，短固定间隔（如 1s）即重连；② 抛错断流（传输错/溢出）→ 才进 W1 失败预算。服务端 sse-pump **零改**（:69 封顶与 :96 raw.end 是既有语义，客户端适配）。可选小件：decodeSSE 透出「本 chunk 见过任何字节/注释帧」的 liveness 旗，驱动收到即重置 attempts（修复口径原文「收到心跳即重置」；心跳今天在 :88,:94 被静默丢）。三驱动同改 |
| **W4 状态码分支（#56）** | sse-cursor.ts:46-49 + 三 hooks | `iterateSseBody` 非 OK 不再静默空结束：**抛 `SseOpenStatusError(status)`**（400 分支仍走 `InvalidLastEventIdError` 既有语义零改）；驱动分类消费：**401** → 停转 + `streamStopReason:'auth'` + UI 层跳 `/login?expired=1`（驱动框架无关不碰 location，跳转由面板//hooks 执行）；**429** → 停退避慢速重试 + UI 透出「连接过多，请关闭其它标签页」（多标签**提示**归本刀，共享归 #127 非范围）；**5xx** → 计失败走 W1 退避；**404** → fail-closed degraded + 原因透出（会话不存在/无权，不无限重连）。`InterviewView`/`QuizViewState`/`DiagnosisViewState` 各增 `streamStopReason?: 'auth'\|'rate_limited'\|'server'\|'not_found'\|'cursor'`，view-model 三处 reconnecting/degraded 分臂按 reason 透出原因（不止「网络中断」一句话）。代理面（route.ts:48,61 与 quiz/diagnosis 同构）**零改或最小改**——status 已透传，消费在客户端 |
| **W5 Server Action 401（#61）** | jobs/actions.ts:9-12 | `ensureOk` 增 `if (res.status === 401) redirect('/login?expired=1')`（与 serverGet:30 逐字对齐；402 既有分支、tolerate 集、抛错路径零改）；:18/:50 两调用点自动受益，另核 startApplicationAction 内联 :28/:40 同面（401 同跳）。error.tsx:5-17 零改（401 不再落它） |

**押题/诊断同改（一并交付，不许漏）**：W1/W3/W4 三驱动三 hooks 三视图三 view-model 同构改；W2 的 **去 reload** 面覆盖 QuizPanel:109,122 与 DiagnosisPanel:144,155（押题/诊断为只读流无草稿输入，只改重试出口为驱动重连信号，不 reload）；quiz-state:113 / diagnosis-state:103 文案按 reason 分臂。

## §2 非范围（全列 · 越界即废）

1. **#127 BroadcastChannel 多标签共享一条流**——本刀只做 429 的**提示与慢速重试**，不做同浏览器流共享/槽位协同。
2. **#58 客户端心跳/空闲看门狗**（半开 TCP 下 for-await 永久挂起）——本刀不动读超时；W3 的 liveness 旗只是把已到字节计入重置，**不建读超时计时器**。
3. **#66 Next 代理上游 fetch 无 try/catch、无首包超时**——三代理 route 的 try/catch 包裹与超时归该刀；本刀客户端消费既有透传 status。
4. 顺带非范围：#184（SSE 槽先取数后占用）·服务端 sse-pump/interview.controller 任何改动 ·#161（connecting 读进度）·#250/#251 ERR-COLLECT 错误映射族 ·error.tsx 泛化文案 ·transcribe/speak 代理 ·中间件/登录页本身。

## §3 逐条改动清单（file 现状 → 目标 · EXEC 落码对账表）

| # | 码面 | 现状（亲读） → 目标 |
|---|---|---|
| C1 | `apps/web/lib/stream/backoff.ts`（新增） | full-jitter 指数退避纯函数（`jitteredBackoff(baseMs,factor,capMs)(attempt)`）+ 单测可注入；三驱动共用，杜绝三份复制粘贴漂移 |
| C2 | `interview-stream.ts:30,39,89-97`（quiz-stream/diagnosis-stream 同构三处） | maxRetries 耗尽→不再 `onReconnectExhausted`，改慢速永续（cap 档）退避；backoff 默认换 C1；`for-await` 正常完成（非终态）分支与抛错分支**分家**——干净 end 不计失败、短间隔重连；`RunStreamOpts` 增可注入 `resumeSignals?: { onOnline(cb):dispose; onVisible(cb):dispose }`（默认 no-op，浏览器实现在 C4）；400 游标 fail-closed 与绝对上限**零改** |
| C3 | `sse-cursor.ts:46-49` | `iterateSseBody`：`if (!res.ok …)` → 抛 `SseOpenStatusError(status)`（新导出类+守卫函数；400 先经既有 `throwIfInvalidLastEventIdStatus` 语义零改）；`sseProxyFailureResponse` :59-69 零改 |
| C4 | `useInterviewStream.ts`（useQuizStream/useDiagnosisStream 同构） | openSse 分类透传；挂 C2 resumeSignals 的浏览器实现（`window.addEventListener('online'/'visibilitychange')`，SSR 守卫）；401 时置 view 停转面并触发 `/login?expired=1` 跳转（面板层执行） |
| C5 | `interview-state.ts` + `quiz-state.ts` + `diagnosis-state.ts` | 各 view 增 `streamStopReason` 字段；`onReconnectExhausted` 族按 reason 承载；view-model（view-model.ts:33-47 / quiz-state:112-116 / diagnosis-state:102-106）分臂：auth→引导重新登录、rate_limited→多标签提示+慢重试、server→退避重连中、not_found→fail-closed |
| C6 | `apps/web/lib/interview/draft-store.ts`（新增） | W2 草稿读写纯函数 + storage 注入缝；`save/load/clear` 按 `${resultId}:${questionId}` |
| C7 | `InterviewPanel.tsx:68,96,210,489`（QuizPanel:109,122 / DiagnosisPanel:144,155） | 草稿接 C6（防抖写/成功清/恢复/换场不误清）；retry 动作全部去 `location.reload()` → 驱动重连信号出口 |
| C8 | `apps/web/app/jobs/actions.ts:9-12` | ensureOk 增 401 redirect（W5）；:18,:50,:28,:40 调用面自动覆盖 |
| C9 | `apps/web/test/web-logic.proof.ts`（现 848 行·`section()` 断言形制） | 新增 §4 六组 section；既有全部 section 零改零删 |
| C10 | `business-events.ts:88,94`（可选小件·随 W3） | decodeSSE 返回值增 `sawTraffic` 旗（注释/心跳字节亦算活）；零行为破坏（frames 语义零改） |

## §4 prove 判据（EXEC 必须全过 · 全部注入式确定性 · 不碰真网络）

1. **断网 30s 不 degraded（#53 回归钉）**：注入 opener 恒抛传输错 + 虚拟时钟推进 ≥30s：connection 全程 `reconnecting`、`degraded=false`（旧实现 ≈1.4s 即 degraded——新旧对照断言）；online 触发器回调注入：online → 立即重连且退避重置；visible → 跳过剩余退避等待。
2. **干净 end 不计失败（#55）**：注入 opener 返回立即正常结束的空流，连打 ≥5 轮（模拟 10min 轮换压缩）：`attempts` 不涨、永不 degraded；对照组：抛错流仍计失败并可按绝对上限 degraded（既有语义保留）；（若行 C10）带心跳字节的流重置 attempts。
3. **草稿 session 断言（#54）**：draft-store 纯函数 + 注入 storage stub：写入/读取/跨题隔离（不同 questionId 不串）/提交成功清除/换 resultId 前缀不误清；InterviewPanel 逻辑面断言成功提交路径清草稿（:210 同拍）。
4. **401/429/5xx/404 分支（#56）**：`iterateSseBody` 对各非 OK Response 断言抛 `SseOpenStatusError(status)` 且 400 仍抛 `InvalidLastEventIdError`；驱动收 401 → 停转+`streamStopReason='auth'`（**零重连**，不再空流假断线）、429 → `'rate_limited'` 慢重试、5xx → 计失败退避、404 → `'not_found'` degraded；view-model 三面板分臂文案逐字断言；ensureOk 401 → `redirect('/login?expired=1')`（NEXT_REDIRECT 断言形制沿仓内先例）。
5. **既有零回归**：`pnpm --filter @meetwise/web prove`（web-logic 全量既有 section 全绿）+ `prove:public-copy` + `typecheck` 零新增错；api/worker 侧零触（sse-pump/controller 零改），如 prove 矩阵涉 web 面如实列跑/未跑账，红项逐条基线对账禁 skip-as-pass。
6. 全部收据（EXIT、PASS/FAIL 计数、基线对照）入 EXEC 记账 + receipts，attempts 全账 Ban retry-to-green。

## §5 Ban

Ban self-approve · Ban retry-to-green（attempts 全账）· Ban skip-as-pass · **Ban location.reload 残留**（三面板 retry 面全数收口，rg 门：`location.reload` 在 SSE 面板族零命中——InterviewPanel/QuizPanel/DiagnosisPanel 内）· Ban 整页刷新当作恢复手段（#53 口径「恢复不刷新页面」）· Ban 服务端 sse-pump/controller 触碰（客户端适配，见 §2.4）· Ban BroadcastChannel/看门狗/代理超时越界（#127/#58/#66）· Ban 破坏 400 invalid_last_event_id fail-closed 既有语义与绝对上限防 DoS 语义 · Ban 框架依赖渗入三驱动（resumeSignals 必须 注入式，驱动保持无浏览器全局可单测）· Ban secrets/Key 入库 · Ban SSOT 无关触碰（`e2e-requirement-coverage-matrix`/`gap-bug-backlog` 只在 nail 时改）。

## §6 pins（十一值照抄 · EXEC/审查不得改口）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = 503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零外呼·零消耗·est live=0）

## §7 Non-claims

本刀 ≠ 多标签流共享（#127）≠ 半开 TCP 看门狗（#58）≠ 代理 try/catch/首包超时（#66）≠ SSE 槽位时序（#184）≠ 服务端推送语义任何增强；「重连韧性」≠ 断网期间零事件丢失承诺（服务端账本重放是既有 Last-Event-ID 语义，本刀只改客户端重试/分类/草稿）；草稿 sessionStorage ≠ 跨设备/跨标签持久化 ≠ 已提交答案持久化（已答真相在服务端 checkpoint，文案「已答不丢」在 W2 后对**未提交草稿**才成立，EXEC 须同步校准 view-model 文案措辞防过度承诺）；401 跳登录 ≠ 会话续期；prove EXIT=0 ≠ DONE（claimDone=false · 完成判定走双审+nail）。

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 本 REQUEST 为起草席 docs-only 产物：未动任何产品码、未跑 prove、无实现自批资格。预执行双审 PASS 后由协调方派 EXEC coding；EXEC 不得改 §1 修法口径与 §5 Ban，漂移须回 REQUEST 补审。任何越 §2 非范围冲动 = 停手上报，不借机修。

---

## 双审收口（rev2 · 2026-10-10 · 席1 PASS+席2 PASS）
- **EXEC 派发序（席1 附注 a）**：W4（错误分类原语）→ W1/W3（驱动消费）→ W2（去 reload+草稿）→ W5（ensureOk 401）
- **补钉 1（席2·W3 必落）**：sse-pump `:97` `fetchMore().catch(()=>null)→break` = 第三种 clean-end（DB 取数失败）——连续 N 次（建议 5-10）无进展（lastEventId 不涨）的 clean end 重新计入失败预算走退避；有进展即清零。prove #2 增对应断言。禁 1Hz 永续轮询退化向量。
- **注记 A（W2 恢复钉）**：恢复入框须以「当前输入框为空」为前提（防存储落后于活内存砸掉更新键入）；questionId 缺失降级只写不自动恢复（防跨题误复用）
- **注记 B（W1 生命周期）**：resumeSignals 监听随驱动全部退出路径 dispose（prove #1 加处置断言）
- **注记 C（文案）**：干净 end 轮换闪回措辞偏软（非断网是换连接）——C5 分臂时给软措辞
- **EXEC 附注**：prove4 NEXT_REDIRECT 自建 try/catch 捕获 next/navigation redirect 抛错（仓内无先例）
- 状态：`dual_pass:ready_for_exec` · EXEC 授权（S 系决策按建议值已裁）
