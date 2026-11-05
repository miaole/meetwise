# API-HARDEN-A REQUEST（普查勘误四件本地收口刀 · #84 裸 @Body 收编 + #66 三代理韧性 + #146 begin 成本闸 + #87 成本分级限流 · 起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-11-06 起草落卷即停 · pre-exec 双审两独立外席待派 → Dual PASS → 协调方明示 EXEC 授权后始有 EXEC（行使面=本卷 §1 修法逐字落码 · 全部既有字零字节改写纪律仅约束既有注记 · 翻面/计件终裁行使源=协调方随令）· alone ≠ dual · Ban self-approve · est live=0 · markers=0 · 状态钉四处：本行+§8+§9+卷尾·同值 · ⛔push ⛔merge 主线）
**Date**: 2026-11-06
**刀位**: 普查席 A `.tmp/residual-census-a-1105.md` 表 1 行 19（#66）/行 25（#84）/行 27（#87）/行 29（#146）+ LEDGER-FLIP-A §1-E1 勘误亲读（LEDGER `:87` 两组组级 ✅ 错挂勘正 · 本刀四件=勘误十件 OPEN 中「本地可收尾」之四）· 起草席对本树逐项亲读复核（复核不成立者移出，见 §0.1）。
**Base**: `origin/main` @`e282c5ebd`（cap 2489 · 起草令亲证值）· 分支 `line/apih-draft`（仓根同级工作树 `meetwise-apih`：`git -C ../meetwise worktree add ../meetwise-apih -b line/apih-draft origin/main` · 主仓只此一改动）。**fetch 如实注**：`git fetch origin` 两次均网络失败（HTTP2 framing → `-c http.version=HTTP/1.1` 重试仍 connect fail），但本地 `origin/main` ref 实测恰为 `e282c5ebd`=派单亲证值，worktree 从该 ref 建=与 fetch 成功后同物；起草期 `origin/main` 已被他席 fetch 推进至 `d549a497b`（#212 rtx 已并 · `merge-base --is-ancestor e282c5ebd origin/main` EXIT=0 亲证 · cap 承 2489 未动）——本支 EXEC/并线期沿协调方常设预授权「cap/lint 以合并树实测恰等步进免再询」届时取大重算承登，§3-政策步进算式按 union 届时重算。
**Pins（十一值照抄 · 零翻转）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`
**Honesty**: 普查结论只当线索，四件全部回本树逐项亲读复核（§0 全录，红读数=各 proof 修复前实跑留档 `/tmp/apih-*-red*.log`，断言面全数入树）；零模型调用零外呼零 secrets（本刀全部 proof 离线/隔离库，egress inventory 亲跑 401 条目与基线同值零新增）；markers=0（起草后逐类探针零命中）；est live=0。

---

## §0 现状锚（起草席亲读亲证 @`e282c5ebd` · 修复前红读数=本支树实跑 · EXEC 立项照本节重 pin）

### 0.0 防重三查

1. **AUTHZ-HARDEN 5A-1/5A-2 已收口面零重叠**：5A 已落 login 三桶/signup 三桶/chgpwd 双桶+失败锁（auth.service.ts:13-26/:46/:90-92 · profile.service.ts:133-139）与本刀四件零触——#87 残面（成本分级桶）正是 5A 亲证「部分」的后半（authz5a 系 proof 不涉本刀桶）。
2. **在飞同号竞争如实列**（§0.5 全录）：ksw-draft 触 `interview.service.ts`（内容安全开关 · :90-:353 hunks · 与本刀 begin 闸同文件不同函数区）；fastm/flipa/ksw/priv1/s3caps/sbg/uc31 七支触两 policy 脚本（cap 热面 dual-keep 先例形）；xs-draft 触 `sse-pump.ts`+`web-logic.proof.ts`+`public-text-policy*`（#57 修复在飞 `af55b8b01` · 与本刀零文件交叠——本刀 web 侧触面=proxy seams+action-error+web-logic.proof **追加了断言行**，并线期 web-logic.proof 属共享热面如实列）。
3. **普查表复核裁定**：#84 普查 8 处裸 `@Body` 亲点 8 处全部在树属实，其中 **login 一处复核不成立移出**（§0.1）——本刀修 7 处+NHP-014 单源前置检查；#66/#146 复核成立原样；#87 复核成立（残面=begin/诊断/押题/支付回调成本分级桶，begin 桶已随 #146 另立，本件收 诊断/押题/回调 三臂）。

### 0.1 #84：8 处裸 `@Body` 复核（7 成立 · 1 移出）+ NHP-014

| 处 | 普查锚 | 现树亲读（`e282c5ebd`） | 裁定 | 病根 |
|---|---|---|---|---|
| login | auth.controller.ts:25 | `:21-24` 注释自证「**故意不**套 Credentials pipe」+`auth.service.ts:78-87` 服务侧最小校验（email 格式+≤254/password 类型+≤128/非空 → 400 `invalid_credentials` 先于三桶） | **移出（复核不成立）**：文档化裁决（5A-1 #90/#34 裁决项②）+服务侧已有运行时校验，Zod pipe 纯属重复且会改变「限流看到所有尝试」语义 | 无缺陷（设计如此） |
| changePassword | profile.controller.ts:40 | 裸 `@Body`；service `profile.service.ts:134` 只做 falsy+min8 检查——非字符串真值穿透 → scrypt TypeError（实跑 500 `ERR_INVALID_ARG_TYPE`）； newPassword 无上帽（129+ 位密码可入库） | 成立 | 类型混淆 500 + 无帽 |
| deactivate | profile.controller.ts:46 | 裸 `@Body`；service `:179-181` 只 `!password` 检查——数值/对象 password 穿透 → scrypt TypeError（实跑 500） | 成立 | 类型混淆 500 |
| roles/match | roles.controller.ts:18 | 裸 `@Body`；controller 只查 `!b?.resumeId`——对象 resumeId 穿透 → `UUID_RE.test({})` 强转 → 404（语义漂移，非 5xx）；service roles.service.ts:22-23 另有 uuid 门 | 成立（轻） | 类型混淆 404 语义漂移 |
| commerce pay-callback | commerce.controller.ts:39 | 裸 `@Body` → payWebhook → verifyCommerceSig：sig/providerTxn 只 falsy 检查（commerce.service.ts:28）→ 非字符串 sig → `Buffer.from(123)` TypeError（实跑 **500**=NHP-014 主面） | 成立 | NHP-014 |
| webhook pay | commerce-webhook.controller.ts:15 | 同管道同病（实跑 500） | 成立 | NHP-014 |
| webhook refund | commerce-webhook.controller.ts:22 | 同管道同病；对象 providerTxn → HMAC update 强转 → 403 语义漂移（实跑 403） | 成立 | NHP-014 族 |
| payment refund-callback | payment-callback.controller.ts:26 | 裸 `@Body` 只查 `!orderId`；数字 sig → 500（实跑 500） | 成立 | NHP-014 对偶口 |

**修复前红读数**（本支树实跑，断言已入树）：
- `pnpm neg:input` → **4/142 FAIL**：changepw-object-oldpassword **500**（ERR_INVALID_ARG_TYPE）/changepw-overlong(129 位) **401**（越帽直落验旧密分支）/deactivate-number **500**/roles-match-object **404**；具名词保留对照三臂 PASS（缺字段词 `missing_resume_id`/`invalid_password`/`password_required` 修前即对）。
- `pnpm neg:commerce` → **4/95 FAIL**：webhook 数字 sig **500**/对象 providerTxn **403**/refund-callback 数字 sig **500**/超帽(129) providerTxn **403**；字符串垃圾 sig 403 对照 PASS。

### 0.2 #66：三个 Next 同源代理

| 代理 | 现树亲读 | 病根 |
|---|---|---|
| turn | `apps/web/app/api/interview/[id]/turn/route.ts:17-23`（修前）裸 fetch：无 catch（网络抛错漏成 Next 500）、无超时、不转发 `req.signal`（客户端断开不终止上游） | census/E-1 亲证一致 |
| events | `apps/web/app/api/interview/[id]/events/route.ts:125-126`（修前）`await fetch` 只在非 OK 时走 `sseProxyFailureResponse`——网络抛错未接住 → Next 500；无首包超时 | 同上 |
| transcribe | `apps/web/lib/api/transcribe-proxy.ts:14-27`（修前）seam 无 catch（fetch 抛错穿透 route → Next 500）、无超时；route 无兜底 | 同上 |

**修复前红读数**：`pnpm -C apps/web prove:transcribe-proxy` → 新增韧性臂崩（TypeError 从 seam 穿透未捕获，进程非零退出）；`prove:api-proxy-resilience` → `ERR_MODULE_NOT_FOUND: turn-proxy.ts`（缝不存在=红根）。

### 0.3 #146：begin 无速率限制

- 现树亲读：`interview.service.ts:424-433`（修前）`begin()` 无任何 `rl.allow`——对照 `turn`(:449 `TURN_RL` 30,0.2)/`voiceGate`(:383 40,0.3)/`report_retry`(:778) 三既有桶俱全；controller `interview.controller.ts:28-31` 亦无限流。每 begin=1.0 单位预留+start job（整条规划-出题模型管线）→ 成本 DoS 面（census #146/E-1 亲证一致）。
- **修复前红读数**：`pnpm neg:interview` → **2/114 FAIL**：§11 新臂「第 11 发 → 429」修前恒 404（11 连发全过）+「400 臂未消费桶仍 429」随红；前 10 发 404 对照 PASS。

### 0.4 #87：诊断/押题/支付回调无成本分级限流

- 现树亲读：`diagnosis.service.ts:26-68` begin（1.0 预留+generate job）无 `rl.allow`，DiagnosisService 未注入 RateLimitService；`quiz.service.ts:29-69` 同病；`commerce.service.ts` payWebhook(:151)/refundWebhook(:181) 验签前无任何桶——回调面（money 变更）可无界重放/喷射。census #87 残面原文「begin、诊断、押题、支付回调的成本分级桶还没做」+E-1 亲证一致（begin 桶已随 #146 立，本件收其余三臂）。
- **修复前红读数**：`pnpm apih:cost-rl:prove`（新门 · env 注入短窗沿 authz5a-login-ip-throttle 先例）→ **3/10 FAIL**：押题第 3 发 **404**（应 429）/诊断第 3 发 **404**/回调同单第 4 发 **403**（应 429）；其余 7 对照臂 PASS（前两发进站/他主体他单不受株连/垃圾签 403 语义保留/退款口独立桶态）。

### 0.5 在飞同号竞争（如实列 · 届时并线沿常设预授权）

| 支 | ahead | 触面与本刀交叠 |
|---|---|---|
| ksw-draft `7c667e229` | 3 | `interview.service.ts`（:90-:353 hunks · begin 闸同文件异区 · merge 期文本冲突可能 · dual-keep/语义并读） |
| xs-draft `3f91dac91` | 9 | `web-logic.proof.ts`（本刀追加 429 断言行 · 同文件热面）+`public-text-policy*` |
| fastm/flipa/priv1/s3caps/sbg/uc31 | 1-6 | 两 policy 脚本 cap 热面（本刀 §3 步进与其 union 届时取大重算） |
| rtx | 0（已并 #212） | — |

## §1 修法（四件 · 全部沿用现有机制零新依赖 · EXEC 期照本节行使）

### 件① #84（含 NHP-014）：裸 @Body 收编 Zod DTO + verifyCommerceSig 单源前置检查

- **管道参变词**：`zod.pipe.ts` 构造器加可选第二参 `errorWord='invalid'`（既有 7 调用点零改）；回调族传 `'invalid_callback'`——该域具名词 400 语义（neg-commerce/uc-e2e-011 系断言面）零漂移，信封形状（400 `{error,issues}`）与默认臂一致。
- **contracts additive**（`packages/contracts/src/index.ts`）：`ChangePasswordDto`/`DeactivateDto`/`RoleMatchDto`/`CommerceCallbackDto`/`PaymentRefundCallbackDto` 五 schema——字段全 optional（**「缺字段」语义仍由 service 具名词裁决**：`invalid_password`/`password_required`/`missing_resume_id`/`invalid_callback` 逐字保留=neg-auth/neg-commerce 既有断言面零漂移），pipe 只收「在场的值必 string 且 ≤128 帽」；128=Credentials R4 同源（密码族），providerTxn/sig 128=PSP 流水/sig(hex64) 充裕帽，resumeId/orderId 64=InvoiceRequestDto 同形帽，ts=签名毫秒数（有限性/±300s 窗仍在 verifyCommerceSig 单源）。
- **四控制器收编**：profile（changePassword/deactivate）/roles（match）/commerce（callback）/commerce-webhook（pay/refund）/payment-callback（refundCallback）七处裸 `@Body` 全换 `ZodValidationPipe(Dto[,词])`。
- **NHP-014 单源前置**（commerce.service `verifyCommerceSig`）：`typeof providerTxn!=='string'||空||>128||typeof sig!=='string'||空||>128 → 400 invalid_callback`（C2 结构化拒绝日志随臂）——控制器 pipe 为第一线，单源检查纵深兜底覆盖未来新调用口；字符串垃圾 sig 的 403 `bad_signature` 语义零触。
- **兼容面**：合法请求零变化（optional+帽不影响合法体）；新增 400 信封=`invalid`（pipe 家族约定）或 `invalid_callback`（域约定），无新错误码。

### 件② #66：三代理收敛到可注入缝 + 超时 + 502 信封

- **新缝**（沿 transcribe/speak/report-export-proxy 家族形 · fetchImpl 可注入离线可证）：
  - `apps/web/lib/api/turn-proxy.ts`：`proxyInterviewTurn`——上游 HTTP 应答原样透传（含 429/409，客户端既有分码零改写）；网络抛错/整请求超时 → **502 `{error:'upstream_unavailable'}` JSON**；客户端 AbortError 原样重抛（TC-VOICE-01-E6 取消合同族）。
  - `apps/web/lib/api/events-proxy.ts`：`openInterviewEventsUpstream`——上游应答任意状态原样 resolve（route 既有 `sseProxyFailureResponse` 非 OK 映射零改）；网络抛错/TTFB 超时 → **502 `stream_unavailable` 文本**（与 sseProxyFailureResponse 同信封 → 客户端 SSE-RESILIENCE #56 分类零新分支）；TTFB 计时器到头即清，SSE 流体不设整体超时（长连设计，10min deadline 在 api 侧，不被普通超时误杀）；客户端取消全程同步中止上游（**rev r1·证伪 pre-2 P2-1**：修前缝在响应头到达后于 finally 摘除 abort 监听，「打开后取消」实际不中止上游——探针实测 socket closed=0，弃置流挂到 10min deadline 并占 `sse:${principal}` 槽；修法=保留监听不摘（`{once:true}`·随 req.signal 回收），流建立后取消即撤上游 socket；proof 补臂⑪「流建立后 clientSignal.abort → 上游组合信号同步中止」·修前红修后绿）。
  - `transcribe-proxy.ts`：加可选 `timeoutMs`（传时 `AbortSignal.any` 组合、不传时转发信号=入参同一实例——既有 identity 取消合同逐字保留）+catch 同 turn 形。
- **三 route 收编**：turn/transcribe/events 改薄调缝；超时帽 env 可覆写并给依据：`PROXY_TURN_TIMEOUT_MS`（默认 15000：/turn=202 入队快路径亚秒返回，15s 含慢库/慢队列余量）、`PROXY_TRANSCRIBE_TIMEOUT_MS`（默认 60000；**rev r1 依据改正·证伪 pre-2 P2-2**：录音侧唯一硬帽=10MB 字节（contracts `VOICE_MAX_AUDIO_BYTES`·服务内 413 `audio_too_large` 兜底），**时长无帽**——原「录音侧 60s 硬上限」说法失真已删（60s 帽只在另一语音通话面板 `VoiceCallPanel MAX_REC_MS`，不经本代理口径）；值保 60s 合理：覆盖分钟级常态作答录音的 ASR 处理余量，字节帽内超长录音（10MB opus≈20-50 分钟量级）转写超时走既有降级回文字作答（产品既有契约），env 可覆写）、`PROXY_SSE_TTFB_TIMEOUT_MS`（默认 10000：api 侧打开=DB 回放+pump 启动秒级路径，10s 含冷池余量）。
- **前端兼容**（apps/web 零改即正确）：turn 502 → `turnSubmitFeedback` 落「提交失败,请重试」既有兜底（502 本就是可重试语义）；transcribe 502 → InterviewPanel `!res.ok` 臂既有降级回文字作答；events 502 文本 → SSE 驱动 5xx 分类既有臂。

### 件③ #146：begin 成本闸

- `interview.service.ts`：`RL_BEGIN`/`RL_BEGIN_GLOBAL` env 双值形覆写口（沿 RL_SIGNUP_IP/RL_LOGIN_IP 先例 · prod 钉死默认 **(10,0.05)**/**(60,1)**）+`begin()` 改 async，闸在 400 形校验后、DB 会话前（400 不入桶=signup「桶在体校验后」同序；404 不可区分面照常返回但桶已扣=按尝试计数，与 login 桶语义一致）；桶序 principal→global（`begin:${owner}`+`begin:global` 共享桶 · `||` 短路 429 断言确定性，signup/login 三桶同形）；429 信封 `{error:'too_many_requests',message:'开面过于频繁,请稍候'}`（turn/voice 家族同词）。
- **阈值依据**：全 e2e/neg 套件单主体合法 begin 峰值 ≤5（validate 3/neg-interview ~3/full.e2e ~5 实点），突发 10=2 倍套件余量；稳态 0.05/s=3/分沿 signup:ip(10,0.05) 先例——真人开面节奏（开面后需整场作答）远低于此；全局 60/1 沿 signup:global(60,1)。B 端申请开场走 beginInterviewCore 直调不经本闸（approved-recruiter 门+内容安全开关另有守卫，如实注）。
- **前端映射**：`action-error.ts` interviews 页域加 `too_many_requests` 行（`开面过于频繁，请稍候再试`）——429 不再落 begin_failed 兜底（「未预留额度」文案对限流失真）；web-logic.proof 加键级断言。

### 件④ #87：诊断/押题/回调成本分级闸

- **分级设计**（成本分层=操作真实成本；桶序皆 principal/order→global `||` 短路）：
  - Tier A 付费模型管线（1.0 预留+generate job）：quiz begin `qzbegin:${owner}`+`qzbegin:global`、diagnosis begin `dgbg:${owner}`+`dgbg:global`，值/依据与件③同源（RL_QUIZ_BEGIN/RL_QUIZ_BEGIN_GLOBAL/RL_DIAG_BEGIN/RL_DIAG_BEGIN_GLOBAL · 默认 (10,0.05)/(60,1)）；幂等 alreadyBegun 重放也计费（重复 begin 本身即可刷面，与 interview begin 同口径）。
  - Tier B money 变更面（**rev r1 改形·证伪 apih-pre-2 P1-1**：闸移 `verifyCommerceSig` **之后**、gateway owner 查询**之前**——只有验签通过的请求才计入桶。修前「闸在验签前·429 先于 400/403」被探针证伪：垃圾签 3 发耗同单桶/120 发（随机单号）耗全局桶后，真实回调全被 429 挡死=未认证 DoS money 面；「伪造洪水不得挤占真实回调桶」登记为验收断言。HMAC 对 ≤128 字节输入微秒级，前置闸不构成成本屏障；真正贵的 owner 查询与 CAS 仍不为洪水买单）：`commerceCallbackGate(rl,kind,id)` 单函数于 payWebhook/refundWebhook ·per-order `cbpay:${id}`/`cbref:${id}` 默认 **(30,1)**（合法 PSP 重试个位数；套件同单峰值 8 连发 nhp-load/11 散发 neg-commerce 实测在上限内）+global `cbpay:global`/`cbref:global` 默认 **(120,5)**（生产语义=每实付订单一条回调，120 突发/300 每分稳态远高于真实交易节奏；套件单进程峰值 <60 在上限内）·429 `{error:'too_many_requests'}`（无前端调用方=PSP 侧，无 web 映射面）。验签失败防暴力**独立桶**：只计 `bad_signature`（400 结构拒非签名爆破不计），按来源 `cbfail:ip:${ip}`（`:ip:` 形=PG 共享跨实例合计·signup:ip 同制）默认 **(60,2)**（RL_CB_FAIL 同形覆写），只在 403 路径消费/拒、**绝不影响验签通过的请求**。验收三断言（apih-cost-rl·修前全红留档 `/tmp/apih-rev1-cb-red.log`）：①同单 3 垃圾签后合法回调放行（404 达 owner 查询）②120 垃圾后合法回调放行 ③合法回调自身超频仍 429（垃圾零掺入）。在飞套件合同随改形回正：nhp-load P1 臂恢复全 403/400 面零 429（垃圾签不占成功桶）。
  - 注入形：三 service `@Optional() rl?`（沿 RateLimitService 自身 db 注入先例——直接 new 的既有单测零改零触；Nest DI 生产恒注入）；隔离负测环境 `:global` 键自动落进程内降级桶（harness 无 0189 网关函数，亲证 `23_api_gateway.sql` 零 `gateway_rl_bucket_*`），跨 proof 零污染。
- **在飞套件 P1 臂合同精确化**（uc-e2e-011-nhp-load · 行为边界变更如实登记）：60 并发同单洪水超出桶容量 → 超额臂被闸 429 先发制人——两 P1 断言改「零 5xx+非闸臂具名词保留+闸臂恒 429」（垃圾签臂保底 ≥1 个 403=容量 30 内必达；缺字段臂桶跨臂结转可全 429=闸的预期行为）。L2 16 并发 storm/L3 8 重放臂在上限内零触。
- **前端映射**：quiz/diagnosis 页域 `too_many_requests` 行（`押题/诊断过于频繁，请稍候再试`）+web-logic.proof 键级断言。

## §2 验收（EXEC 后门矩阵 · 本起草卷已随刀预跑全绿 · EXEC 期重跑为准）

1. 四件 proof：`pnpm neg:input`(142)/`pnpm neg:commerce`(95)/`pnpm neg:interview`(114)/`pnpm apih:cost-rl:prove`(10·新门已注册 run-e2e-isolated fingerprint+gate list+runner 映射+双 package.json)/`pnpm -C apps/web prove:api-proxy-resilience`(10·新)/`prove:transcribe-proxy`(4)/`prove`(web-logic 含新 429 断言)/`pnpm uc011:nhp-load:prove`(17)。
2. `pnpm neg:all` 六段全绿（auth 90/commerce 95/resume 91/interview 114/bend 179/input 142）。
3. apps/api+apps/web typecheck EXIT=0；lint 双帽不升：api 1545=1545 恰等/web 604<607（turn route 重写净 −3，如实注）。
4. `pnpm arch` 8 warnings=基线同值零增；`node scripts/provider-egress-inventory.mjs` valid（401 条目=基线零新增）；`node scripts/e2e-static-guards.mjs` passed。
5. `node scripts/ai-docs/check-docs.mjs` scanned 2494=cap 2494 恰等（§3 步进后）；`node scripts/ai-docs/public-text-policy.proof.mjs` 12/12；markers 五类探针 0。不跑浏览器 UI runner。

## §3 政策步进（CAP-SANCTION 链注追加 · 四联动点恰等 · 不改写既有注记）

- **受管净增恰 5**：`harness/api-harden-a-REQUEST.md`（本卷）+`apps/web/lib/api/turn-proxy.ts`+`apps/web/lib/api/events-proxy.ts`+`apps/web/test/api-proxy-resilience.proof.ts`+`apps/api/test/apih-cost-rl.proof.ts`（tracked gate stdout 收据 .log ∉TEXT_EXTENSIONS 不计·本刀收据走 /tmp 不入树）。改前树亲跑 docs:check `PTP_FILE_LIMIT:2493>2489` 红亲证（4 件码/proof 已入树时点值）→ 随本卷 +1=2494 恰等零多放。
- **cap 2489→2494 恰等步进**（协调方常设预授权「cap/lint 以合并树实测恰等步进免再询」随令行使）落两 policy 脚本：`MAX_FILES=2_494`+CAP-SANCTION-2494 注记**追加置链区**（policy .mjs 链区+proof 链区各一条 · 既有注记零字节改写 · dual-keep 先例形）+proof TC 四联动点恰等改（loop `i<2_494`/atCap `scannedFiles 2_494`/越限件 `f-2494.md`/错误码 `FILE_LIMIT:2495`）·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
- **在飞七支触两 policy 热面**（§0.5 表）如实列——并线期 union 沿常设预授权届时取大重算承登。
- **限流桶归属与多副本/重启语义如实登记（rev r1·证伪 pre-2 P2-3·本刀不改码）**：RateLimitService 分级制——`*:global`/`*:ip:*` 键落 PG 共享桶表（跨实例合计、重启存续、7 天 TTL）；其余键=**进程内 LRU**（本刀 `begin:${owner}`/`qzbegin:`/`dgbg:`/`cbpay:${id}`/`cbref:${id}` per-principal/per-order 族全在此列；`cbfail:ip:*` 属 `:ip:` 共享形）。compose.ha 双实例+lb 轮询下进程内桶实际阈值 ×2：对合法用户=突发跨实例分摊（放宽），对单点攻击者=需 ×2 发数；进程重启桶清零。沿平台既有 `login:${email}` 同形制（登记缺口，非行为 bug）。**后续建议（另行派单）**：per-principal/per-order 桶迁共享存储（沿 `gateway_rl_bucket_*` 网关函数形）使多副本/重启语义归一。rev r1 改形残余面如实：验签失败洪水打 HMAC CPU=微秒级/请求，可忽略量级。

## §8 停止条件

1. 任一门红停（§2 矩阵零容忍；lint/arch 越基线即停，禁升帽禁豁免）。
2. 合法请求行为变化即停（本刀全部负路径面新增 400/429/502；正路径面零触——neg 系具名词保留臂+既有全绿套件为证）。
3. EXCEED 范围即停：本刀不做 #86 游标分页/#88 错误信封归一/#68 前端上报/#71 录音上限/#72 语音额度预留（普查另四件，另行派单）；不加「禁裸 @Body」lint 规则（login 文档化裸 @Body 需例外设计，残面如实登记 §9）。
4. 并线冲突超两 policy 双件+interview.service/web-logic.proof 共享热面即停问协调方。
5. **Status: `draft:awaiting_pre_exec_dual`**（2026-11-06 · pre-exec 双审待派 · alone≠dual · ⛔push ⛔merge）。

## §9 起草如实注记

1. **#84 login 移出**（复核不成立）：普查 8 处裸 `@Body` 中 login（auth.controller.ts:25）系文档化故意形（「限流必须看到所有尝试+登录不校验复杂度」两理由原文在树）+服务侧最小校验已给 400——Zod 收编属重复且破坏裁决②语义。本刀实际收编 7 处。普查/E-1 的「8 处」点数与树实锚一致，裁定差异如实承登。
2. **fetch 失败与届值漂移**：起草令 fetch 两次网络失败（如实 §Header）；本地 ref 恰=`e282c5ebd` 同物建支。起草期 origin/main 推进 `d549a497b`（#212 已并 · 本支基为其祖先亲证）——cap 承 2489；并线期 §3 算式届时取大重算。
3. **nhp-load P1 两臂合同精确化**（§1 件④）系行为边界变更（洪水面 429 先发制人），已在该 proof 内注释逐字登记；L2/L3/L4/防空转臂零触。
4. **lint 净变化**：api 恰等 1545；web 604<607（turn route 缝化重写净 −3 · 禁升帽未触）。折堕面如实载：零豁免新增（computed-key 先例形 enterprise-pay-s1 同款）。
5. **markers=0**：起草后「awaiting_post/exec 授权」类标记词探针逐类扫零命中；est live=0 零模型零外呼。
6. **residual 如实登记**（不在本刀、普查仍在）：#84 残面=「禁裸 @Body lint 规则」（login 例外待设计）；#87 残面=IP 维度桶（authz 域，5A-1 已落 signup/login/chgpwd/invite 四口，其余口是否需 :ip 归并网关面另行派单）；#66 残面=无（三代理全收）。
7. **Status: `draft:awaiting_pre_exec_dual`**（2026-11-06 · 状态钉四处同值 · 本卷=起草落卷即停 · ⛔push）。

---

SOP trace：Intake(派单+普查+flipa §1-E1) → 需求门（证据=E0 本树亲读+红读数实跑留档）→ Generate（四件修法沿既有机制）→ EXEC（本支已随四 commit 落码 d3354a8f8/d953ed32c/1c077b6f1/e380e077a+hygiene 23d010280 · 门矩阵全绿）→ **本卷起草落卷 `draft:awaiting_pre_exec_dual` → pre-exec 双审两独立外席 → Dual PASS → 协调方 EXEC 授权** → post 双审 → 翻面行使归协调方随令。
