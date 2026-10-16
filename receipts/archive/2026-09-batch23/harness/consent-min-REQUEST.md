# CONSENT-MIN — #82缩水件+#69缩水件 批4收官两小件（用户 2026-10-10 裁定「不用那么重的隐私，就上传的时候授权协议就行了」· EXTREV-7 简化优先 · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（本 REQUEST 只送审 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 自动开工 · 须 meetwise 明示授权才进 EXEC）
**Date**: 2026-10-10
**Base**: `feat/mysql-schema-skeleton` 主线 tip @`6a7a3acc` · 分支 `line/consent-min`（工作树 `/Users/miaole/Desktop/golucky/meetwise-consentmin`）
**蓝本**: 用户 2026-10-10 裁定原文（见 §1 引用，**硬边界**）+ issues-master #82（purpose 任意串）/ #69（语音同意记录）的**缩水面**（非全量面）+ 仓内既有登记 `apps/api/test/neg-input.proof.ts:322-324`（「/privacy/consent …语义字段无 zod 约束(purpose…任意串)——记录供契约方评估是否补 schema」）。**唯一蓝本，逐条忠实，禁自由发挥。**
**Honesty**: 本档全部 file:line 锚点在 `line/consent-min` @`6a7a3acc` 实树亲读验证（privacy.controller/privacy.service/resume.service/interview.service/interview-voice/VoiceCallPanel/InterviewPanel/resume actions+page、contracts index、0001_baseline/0152、neg-input/neg-interview/voice-timeout/voice-cancel-http/privacy-erasure-http/resume-grounding 各 proof、root+各包 package.json——行号错=审席 FAIL）。行号为撰写时点值；EXEC 开工若基线前移，漂移逐条登记后可续，**形状变=停**（§8）。

---

## §0 立靶（现状固化·全数亲读 @`6a7a3acc`）

**0.1 consent_record 机制现状（本刀全部复用它·零新机制）**：
- 表：`packages/db/migrations/0001_baseline.sql:450-456` —— `consent_record(id, owner_user_id, purpose, policy_version, granted_at)`；`purpose text NOT NULL` **无 CHECK**（`:453` 注释「采集目的(resume_processing / interview / ...)」为历史注释，实际代码只用两值；〔rev2 勘误（席1）：purpose 注释行原记 :451 错→实为 :453·@`6a81acfc` 亲证〕）；RLS p_owner `:459-464`；DELETE 授权由 `0152_consent_revoke_grant.sql:6` 补授。**字段齐备 → 本刀零迁移**（§2-2）。
- 写入点（唯一产品写入口）：`apps/api/src/modules/privacy/privacy.service.ts:19-27` `consent()` —— 幂等（`:22-24` 先查后插）；读取点：`consentStatus()` `:30-34`、导出面 `:55`；撤回：`withdrawConsent()` `:41-46`（G4 已落面·保留不拆，§2-1）。
- RG 同意门先例（同形复用源）：`apps/api/src/modules/resume/resume.service.ts:94-96`（OCR 扣费前）与 `:201-203`（上传落库前）——`SELECT 1 FROM consent_record WHERE purpose='resume_processing' LIMIT 1` → 缺行 `403 {error:'consent_required', purpose}`；worker 侧 `apps/worker/src/adaptive-lifecycle.ts:186-191`（purpose='interview_personalization' 注入门）。
- 前端记录先例（同形复用源）：`apps/web/app/resume/actions.ts:41-51` `grantConsentAction`（server action → `serverFetch POST /privacy/consent` 带 purpose；`apps/web/lib/api/server.ts:16`）。

**0.2 #82 现状：purpose 三入口全裸串**：`apps/api/src/modules/privacy/privacy.controller.ts` —— POST body `:15-19`（裸 `@Body() b: { purpose?: string }`·缺省 resume_processing）、GET query `:21-26`、DELETE query `:29-33`，**三处均无 zod 枚举校验** → 任意串可写入 consent_record.purpose（0001 无 CHECK 兜底）。仓内既有登记：`apps/api/test/neg-input.proof.ts:322-324`（原文见蓝本行）。既有兼容面：`:69` 畸形 JSON→is4xx（Fastify 兜·仍 400）；`:286` array body→`noCrash = s<500`（`neg-input.proof.ts:24`）→ 加 pipe 后 400 仍绿。zod 管道先例：`apps/api/src/platform/zod.pipe.ts`（safeParse→`400 {error:'invalid', issues}`）·用法先例 `privacy.controller.ts:44`。contracts 枚举形状先例：`packages/contracts/src/index.ts:398-399`（`PRIVACY_AUTHZ_PURPOSES`+`z.enum`）——**那是删除授权域的另一个枚举，零触不并**（§5-4）。现有 purpose 实集（亲证）：`resume_processing`（resume.service `:95/:202` 门·`apps/api/test/_neg-harness.ts:174`·`validate.ts:187`）、`interview_personalization`（adaptive-lifecycle `:191`·`apps/worker/test/resume-grounding.proof.ts:225/:326`·resume/actions `:44/:58`）；`voice_capture` 为本刀 #69 新增第三值（用户裁定点名）。

**0.3 #69 现状：语音同意=纯前端本地态·后端零记录**：
- 前端协议卡**已有两张**（opt-in·零 UI 重画）：`apps/web/components/VoiceCallPanel.tsx:605-625`（「确认人机语音处理范围（预览版）」·同意钮 `:614` 现只 `setCaptureConsented(true); setStatus('connecting')`）与 `apps/web/components/InterviewPanel.tsx:462-482`（「启用本机单人语音录入（预览版）」·同意钮 `:471` 现只 `setVoiceCaptureConsented(true); …; void startRecording()`）。〔rev2 勘误（席1）：两卡区间尾值原记 :628/:484 错→:625/:482·@`6a81acfc` 亲证〕。能力门已有：VoiceCallPanel `:516-517`（未同意不请求麦克风不调 ASR）。
- 语音入口（apps/web 语音组件）：`VoiceCallPanel.tsx`（'use client' `:1`）与 `InterviewPanel.tsx`（'use client' `:1`）。消费链〔rev2 事实修正（席2）：page 不直接消费 VoiceCallPanel·编辑面零影响照登〕：`apps/web/app/interview/[resultId]/page.tsx`（import `:4`/render `:31`）→ `InterviewPanel.tsx`（`:14` import VoiceCallPanel·`:310` render）→ `VoiceCallPanel`。转写请求三处：VoiceCallPanel `:439-449`（主路·错误分支 `:444`）与 `:486-495`（重试·错误分支 `:493`）、InterviewPanel `:143-157`（`mr.onstop`·错误分支 `:152`）——均带 `capture:{consent:true, policyVersion:VOICE_CAPTURE_POLICY_VERSION}`（contracts `packages/contracts/src/index.ts:115` `'voice_ephemeral_v1'`·`:126-132` `VoiceCapture` z.literal 门·`:134-141` `TranscribeDto` strict）。
- 后端：`apps/api/src/modules/interview/interview.controller.ts:52-65`（POST :id/transcribe·已过 TranscribeDto pipe）→ `apps/api/src/modules/interview/interview.service.ts:444-452` `transcribe()`（`:445` voiceGate 429 限流 → `:446` owner → `:450` `guardInterviewPrivacy`（`:151-162`·恰 2 条 SELECT：`:152` 归属 + `:156` assertInterviewPrivacyActive）→ `:451` `transcribeAnswer`（`interview-voice.ts:57-90`·ASR egress 尾段））。**此链路上无任何 consent_record 校验、无 voice_capture 落库**。〔rev2 勘误（席1）：插入点原记 :448/:449 错 2 行→guard 调用 :450/transcribeAnswer :451；guard 函数体 :151-166→:151-162·归属 SELECT :153→:152·assertInterviewPrivacyActive :157→:156；transcribe() 区间尾 :450→:452·均 @`6a81acfc` 亲证〕

**0.4 影响面亲证（blast radius）**：`apps/api/test/voice-timeout.proof.ts:40` 断言 `queries === 2`（=guard 两 SELECT）——同意门 +1 条 SELECT 后 **2→3**（**登记更新处一**）；**rev2 影响面补项（席1·原「全仓唯一」漏项勘误）**：`apps/api/test/validate.ts:401` `A('未配置 ASR → 503 asr_unavailable…')` —— userA 无 voice_capture 行，C2b 门落地后该请求必先改判 `403 {error:'consent_required', purpose:'voice_capture'}`（门在 ASR 判 503 之前·**登记更新处二**·两处登记更新见 §3-C2b-2）；`apps/api/test/privacy-erasure-http.proof.ts:312-317` 围栏后 transcribe escape 尝试 + `:356-361` 断言**含 transcribe 在内全部围栏端点恰 410** → 同意门必须排在 guardInterviewPrivacy **之后**（序钉，C2b），该 proof 即序钉的既有实证且原样绿；`neg-interview.proof.ts:462-471` transcribe 负面全 400/404（无成功路 transcribe）→ 不受门影响；`voice-cancel-http.proof.ts:62` 整体 stub 掉 service.transcribe（controller 级）→ 不受影响；`apps/web/test/transcribe-proxy.proof.ts`（36 行·纯代理）与 worker `prove:voice`/`prove:voice-adaptive`（零 transcribe 引用）→ 不受影响。

## §1 范围（两件·同 PR）

**用户裁定原文（2026-10-10·硬边界）**：「**不用那么重的隐私，就上传的时候授权协议就行了。**」派生缩水面：#82 只做 purpose 一行枚举校验（不做白名单体系/不做管理面）；#69 只做「语音功能使用时前端协议勾选卡 + 后端记一条 consent_record」——与上传同意协议同形制（复用现有 consent_record 表与 RG 同意门模式），无独立新机制、无迁移。

**C1（#82 缩水件）purpose 一行枚举校验**：contracts 新增 `CONSENT_PURPOSES = ['resume_processing','interview_personalization','voice_capture'] as const` + `ConsentPurpose = z.enum(...)`（形状沿 `:398-399` 先例）+ POST body 用 strict DTO、GET/DELETE query 用非 strict DTO（只校 purpose 值·其余 query 键不拒），经既有 `ZodValidationPipe` 挂上三入口（400 `{error:'invalid'}`·与 neg-interview 既有 invalid 面同形）。仅此。

**C2（#69 缩水件）语音同意=卡（已有）+ 记录（新增）+ 门（同形一行）+ 回卡（诚实出路）**：
- **C2a 记录接线**：新增 `apps/web/app/interview/actions.ts`（'use server'）`grantVoiceCaptureConsentAction()` —— serverFetch POST /privacy/consent `{purpose:'voice_capture'}`，非 ok 抛（沿 resume/actions.ts:26-28 assertOk 形·**零 redirect 零 revalidate**）；两卡同意钮改为 **await 落库成功后**才进 connecting/开录（VoiceCallPanel `:614`、InterviewPanel `:471`）；失败=停留/重开同意卡，不假前进不请求麦克风（`:516-517` 能力门语义保持）。
- **C2b transcribe 同意门**：`interview.service.ts:450` 的 asPrincipal 块内、guardInterviewPrivacy **之后**加一组两行（SELECT `purpose='voice_capture'` → 缺行 `403 {error:'consent_required', purpose:'voice_capture'}`）——byte 同形 resume.service.ts:94-96 先例；**序钉=围栏 410 先于同意门 403**（privacy-erasure-http `:356-361` 既有 410 面为证且不回归）。伴随**两处**登记更新：`voice-timeout.proof.ts:40` `queries === 2` → `=== 3` + 文案补「与语音同意门」；`validate.ts:401` 503 断言改判 `403 consent_required`（§0-4·§3-C2b-2·〔rev2 勘误（席1）：原「唯一登记更新」漏 validate.ts:401〕·除两处外任何新增红=STOP）。
- **C2c 403 回卡**：三处转写错误分支（VoiceCallPanel `:444`/`:493`·InterviewPanel `:152`）前置判 `status===403 && body.error==='consent_required'` → 回 consent_required 态重开协议卡（VoiceCallPanel 用既有 `STATUS_LABEL.consent_required` `:76`·**零新增文案**；InterviewPanel 重开 `voiceConsentPrompt`）。
- **新 prove**：`apps/api/test/consent-min.proof.ts` + `apps/api/package.json` 新 script `prove:consent-min`（HTTP 全链·真本地库·零 Key 零外呼）。

## §2 范围外·不做（用户裁定砍掉清单·写死）

1. **#81 撤回端点/policy_version 升版机制：不做。** RG 刀已带的 interview_personalization 撤回=**G4 已落面·保留不拆**（`privacy.controller.ts:29-33` + `resume/actions.ts:57-61` + `resume/page.tsx:74-79` 零字节）；通用撤回/policy 升版归 #81 W5 原判不变。
2. **#83 导出补全：降 P4 备忘**（export 面 `privacy.service.ts:50-58` 零触）。
3. **#153/#183：不做**（ERASE nail 已含·unstube-erase 落线覆盖）。
4. **围栏/fence 族零改动**：0058/0059/0062/0076 及 guardInterviewPrivacy 语义零字节（consent 门只作其后追加消费，序钉见 C2b）。
5. **零迁移**：consent_record 字段亲证齐备（§0-1）。**唯一例外**：EXEC 开工亲证缺字段时，列最小迁移 `packages/db/migrations/0156_*.sql`（0155 后下一号；仓内 0152 已有双号先例 `0152_consent_revoke_grant.sql`+`0152_resume_soft_delete_fence.sql` 如实登记）并**开工即 claim** 标注——否则零 schema 变更。〔rev2 从属声明（席2·append-only）：**0156 归属建议=ENTPAY 片1**（P0 链+体量大·其 rev2 在飞先登记）；本刀预计零迁移——例外路径若真触发，按当时登记实况取下一空闲号（预计 0158+）·开工即 claim（TASK-SOP-v2.md:16 迁移号治理）。〕
6. **不同机制零触不并**：`memory_consent`（0093·interview_prep/career/preference/self_improvement）与 `PRIVACY_AUTHZ_PURPOSES`（contracts `:398` erasure 域）**不进本 enum、零字节**。
7. **零 UI 重画**：语音两卡既有 opt-in 形保留（本刀只接线不动形状）；上传同意卡（resume/page.tsx:46-63）零改。
8. **SSOT 零触**：CLAUDE.md/backlog/coverage matrix/SOP/NORTH-STAR §1 pins 行零改。

## §3 清单（file:line 现状→目标·全数亲读 @`6a7a3acc`）

| # | 码面 | 现状（亲读） | 目标（形状钉） | 验收断言 |
|---|---|---|---|---|
| C1-1 | `packages/contracts/src/index.ts`（新导出·置于 `:398` 族附近） | 无 consent purpose 枚举（`:398` 是 erasure 域另一枚举） | `CONSENT_PURPOSES` as const 三值 + `ConsentPurpose = z.enum` + `ConsentPurposeDto = z.object({purpose: ConsentPurpose.optional()}).strict()` + `ConsentPurposeQueryDto = z.object({purpose: ConsentPurpose.optional()})`（非 strict·strip 其余键）；类型导出同形 | contracts typecheck 绿；`prove:openapi` 绿（consent 端点不在 openapi registry `:1159` 族·零 openapi 面变化） |
| C1-2 | `apps/api/src/modules/privacy/privacy.controller.ts:17-18` | POST 裸 `@Body() b: { purpose?: string }` | `@Body(new ZodValidationPipe(ConsentPurposeDto))`；`:18` `b?.purpose ?? 'resume_processing'` 行为保留（optional 缺省同形） | POST `{purpose:'garbage'}`/`{purpose:'interview_prep'}`（memory 域值故意打界）→ 400 `{error:'invalid'}`；三合法值 → 200 `recorded:true` |
| C1-3 | `apps/api/src/modules/privacy/privacy.controller.ts:22-25` | GET 裸 `@Query('purpose')` | `@Query(new ZodValidationPipe(ConsentPurposeQueryDto)) q` → `q?.purpose ?? 'resume_processing'` | GET `?purpose=garbage` → 400；缺省/合法值行为不变 |
| C1-4 | `apps/api/src/modules/privacy/privacy.controller.ts:31-32` | DELETE 裸 `@Query('purpose')` | 同 C1-3 同形 | DELETE `?purpose=garbage` → 400；`?purpose=voice_capture` 合法路径供 C2 用 |
| C1-5 | `apps/api/test/neg-input.proof.ts:322` | 注释「/privacy/consent …用裸 @Body(无 pipe)」 | 一行注释同步（/privacy/consent 摘出·/commerce/pay-callback、/roles/match 原文保留） | `:69` is4xx、`:286` noCrash（`=s<500`·400 过）双绿不回归 |
| C2a-1 | `apps/web/app/interview/actions.ts`（新文件） | 无 | 'use server' + `grantVoiceCaptureConsentAction(): Promise<void>`：serverFetch POST /privacy/consent `{purpose:'voice_capture'}`；非 ok 抛 `voice_consent_failed_<status>`（沿 resume/actions.ts:26-28 形）；**零 redirect 零 revalidate** | typecheck+web build 绿；C2a-2/3 行为断言经 code-review + prove:consent-min e 项链证 |
| C2a-2 | `apps/web/components/VoiceCallPanel.tsx:614` | 同意钮只置本地态即 connecting | onClick 改 async：**await action 成功后** `setCaptureConsented(true)+setStatus('connecting')`；失败停留 `consent_required`（不请求麦克风·`:516-517` 门语义保持） | 同上 |
| C2a-3 | `apps/web/components/InterviewPanel.tsx:471` | 同意钮只置本地态即 `void startRecording()` | 同 C2a-2 同形：await 成功后才 `setVoiceCaptureConsented(true)+startRecording()`；失败重开 `voiceConsentPrompt` | 同上 |
| C2b-1 | `apps/api/src/modules/interview/interview.service.ts:450`（asPrincipal 块内·guard 之后；〔rev2 勘误（席1）：插入点原记 :448 错 2 行→:450·@`6a81acfc` 亲证〕） | 转写链无 consent_record 校验 | 两行：`SELECT 1 FROM consent_record WHERE purpose='voice_capture' LIMIT 1` → `rowCount===0` 抛 `403 {error:'consent_required', purpose:'voice_capture'}`（byte 同形 resume.service.ts:94-96）；**序钉=410 围栏先于 403 同意门** | 无行 transcribe→403（d）；有行→门过（e）；围栏面试无行→仍 410（privacy-erasure-http `:356-361` 原样绿=序钉实证） |
| C2b-2 | `apps/api/test/voice-timeout.proof.ts:40` + `apps/api/test/validate.ts:401`（〔rev2 扩项（席1）：由一处扩为**两处登记更新**·原「全仓唯一」口径作废〕） | voice-timeout `:40` `queries === 2 && statements.every(SELECT)`；validate `:401` `A('未配置 ASR → 503 asr_unavailable…', r.status===503 && r.body.error==='asr_unavailable')`（userA 无 voice_capture 行） | voice-timeout `:40` `=== 3` + 文案「归属、隐私围栏与语音同意门读取」；validate `:401` 断言改 `403 {error:'consent_required', purpose:'voice_capture'}`（C2b 门先于 ASR 503 判·§0-4） | `prove:voice-timeout` EXIT=0 + `pnpm -C apps/api validate` EXIT=0（根 `pnpm api:validate` 亦可·scripts/run-post-change-regression.mjs:86 在册）（更新后·一次过·attempts 入收据） |
| C2c-1 | `apps/web/components/VoiceCallPanel.tsx:444` 与 `:493` | `!res.ok` → 一律 `asr_down`「语音转写暂不可用」 | 前置分支：`status===403 && body.error==='consent_required'` → `setCaptureConsented(false)+setStatus('consent_required')`（卡重开·`:76` 既有文案零新增）；其余分支 byte 级不变 | 403 回卡（不误报 asr_down）；503/502 既有出路不变 |
| C2c-2 | `apps/web/components/InterviewPanel.tsx:152` | `!res.ok` → `voiceErr`+toast | 前置同判 403 consent_required → `setVoiceCaptureConsented(false)+setVoiceConsentPrompt(true)`；其余不变 | 同上 |
| C2-3 | `apps/api/test/consent-min.proof.ts`（新文件）+ `apps/api/package.json` script `prove:consent-min` | 无 | HTTP 全链（真本地库·asr 不配置·零 Key）：a 三合法 purpose POST 200+幂等（重复 POST 仍 1 行）+ **POST 空 body `{}` → 缺省 `resume_processing` 同形断言**（〔rev2 补项（席2）〕privacy.controller.ts:18 `?? 'resume_processing'` 缺省行为须在 strict DTO+optional 下保持）；b `garbage`/`interview_prep` POST → 400 invalid；c GET/DELETE `?purpose=garbage` → 400；d 无行 transcribe → 403 `{error:'consent_required',purpose:'voice_capture'}`；e POST voice_capture 200 → transcribe 重发 → `503 asr_unavailable`（=门+fence 已过的可证形状·零外呼）；f DELETE voice_capture → 403 回（门关） | `pnpm -C apps/api prove:consent-min` EXIT=0 |

## §4 prove（验收命令矩阵·脚本名亲查 package.json）

1. `pnpm -C apps/api prove:consent-min`（**新**·§3-C2-3 全矩阵）EXIT=0
2. `pnpm -C apps/api neg:input` EXIT=0（`:69`/`:286` 不回归）
3. `pnpm -C apps/api neg:interview` EXIT=0（`:462-471` transcribe 负面不回归）
4. `pnpm -C apps/api prove:voice-timeout` EXIT=0（`:40` 登记更新后）
4a. `pnpm -C apps/api validate` EXIT=0（〔rev2 补项（席1·C2b-2 第二处登记更新）〕validate.ts:401 改判 403 后全量 validate 须绿·根 `pnpm api:validate` 亦可·scripts/run-post-change-regression.mjs:86 在册）
4b. `pnpm -C apps/api prove:unstube-erase` EXIT=0（〔rev2 补项（席2）〕全仓另一打 POST /privacy/consent 的 proof·unstube-erase.proof.ts:121 值合法（`resume_processing`）应在 C1 enum 下保持绿）
5. `pnpm -C apps/api prove:voice-cancel-http` + `pnpm -C apps/api prove:voice-operation-policy` EXIT=0（邻接原样绿）
6. `pnpm -C apps/api prove:privacy-erasure-http` EXIT=0（`:356-361` 410 面=序钉实证不回归）
7. `pnpm -C apps/worker prove:resume-grounding` EXIT=0（RG 同意门三态 spot·worker 零改）
8. `pnpm -C packages/contracts typecheck` + `pnpm -C packages/contracts prove:openapi` EXIT=0
9. `pnpm typecheck` EXIT=0（根·growth-gen 收据先例）
10. `pnpm -C apps/web prove` + `pnpm -C apps/web prove:transcribe-proxy` EXIT=0（既有 section 零删改）
11. **web 构建门**：`pnpm -C apps/web build` EXIT=0
12. 冲突标记门：`grep '^<<<<<<< \|^=======$\|^>>>>>>> '` 全仓 = 0；一次过 Ban retry-to-green（attempts 全账入收据 `ai-docs/delivery/receipts/consent-min/`）；est live=0 零外呼零消耗零 Key。

## §5 Ban（全列）

1. **Ban self-approve · alone≠dual**：本 REQUEST 只送 pre-exec 双审，Dual PASS ≠ 开工。
2. **Ban 动 #81 面**：通用撤回端点/policy_version 升版机制零字节；G4 interview_personalization 撤回既有面（§2-1 三锚）保留不拆。
3. **Ban 动围栏/fence 族**：0058/0059/0062/0076 立法与 guardInterviewPrivacy 语义零字节；consent 门只准排在 guard 之后（序钉）。
4. **Ban 并不同机制**：memory_consent（0093）/PRIVACY_AUTHZ_PURPOSES（contracts `:398`）零触不并入 enum。
5. **Ban 新独立同意机制**：无新表/无新端点/无版本化面；只复用 consent_record + 既有 POST/GET/DELETE /privacy/consent 三面。
6. **Ban 录音持久化语义松动**：`VOICE_CAPTURE_POLICY_VERSION='voice_ephemeral_v1'`（contracts `:115`）原值零改；原始音频不落库口径不动——本刀只加同意记录，不扩采集范围。
7. **Ban retry-to-green**：prove EXIT=0 一次过（voice-timeout `:40` + validate `:401` **两处登记更新**除外·〔rev2 勘误（席1）：原「唯一」漏 validate.ts:401〕），attempts 全账如实。
8. **Ban Key/live**：est live=0 · 零 secrets/.env 入库。
9. **Ban SSOT 触碰**：CLAUDE.md/backlog/coverage matrix/SOP/NORTH-STAR §1 pins 零改。

## §6 pins（十一值照抄·禁止改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事） · 公开 DELETE /privacy/interview-data/:id = 503（superseded：简历/账户轨=202 软删受理 mode=logical·purgePending=true 恒真直至 S2 逐 sink 回执；interview-data 面原值不动——NORTH-STAR §1 pins 块+:46 supersession 注记现行值照抄） · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼·零消耗）

## §7 Non-claims

consent_record voice_capture 行 ≠ 录音可持久化（ephemeral 口径不动）≠ 历史语音使用可回溯补录（行只对新同意生效·存量用户无行·如实）；transcribe 403 门 ≠ 数据删除 ≠ 撤回产品面建成（voice 无撤回 UI·API DELETE 既有面可用·本刀不新增 UI）；purpose Zod enum ≠ 库层 CHECK（0001 `purpose` 仍 text 无约束·库层立法不在本刀）；enum ≠ 全部同意目的终局清单（后续新 purpose=另刀改 enum+双审）；同意卡接线 ≠ 离线可用保证（action 失败=停留同意卡不假前进）；prove 503 `asr_unavailable` 形状 ≠ ASR 已配置（只证明门序通过）；前端协议卡沿用既有 opt-in 形 ≠ 勾选框重画（零 UI 重画·§2-7）；本 REQUEST ≠ EXEC 编码授权；`actualSpendCny=null`。

## §8 STOP

**停止条件（触发即停·回报协调方）**：(i) §3 任一锚点**形状**与本档不符（行号漂移逐条登记后可续·形状变=停）；(ii) 需触 consent_record 表结构——唯一例外=开工亲证缺字段→最小迁移 0156_* + 开工即 claim 标注（§2-5；〔rev2 从属声明（席2）：0156 归属建议=ENTPAY 片1·本刀预计零迁移·例外触发按当时登记实况取下一空闲号（预计 0158+）·开工即 claim·TASK-SOP-v2.md:16〕）；(iii) §4 任一 prove **新增红**（voice-timeout.proof.ts:40 + validate.ts:401 **两处登记更新**除外·〔rev2 勘误（席1）：原「唯一」漏 validate.ts:401〕）；(iv) 需要任何 §2 范围外触碰才能落地。

**STOP · `awaiting_pre_exec_dual` · alone≠dual。** REQUEST 写完即停零码动；EXEC 须双审 PASS + meetwise 明示授权；Ban self-approve；Ban retry-to-green。

---

*CONSENT-MIN EXEC REQUEST · 2026-10-10 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`6a7a3acc` · 分支 `line/consent-min` · 蓝本=用户 2026-10-10 裁定「不用那么重的隐私，就上传的时候授权协议就行了」+ neg-input `:322-324` 仓内既有登记 · #82=purpose 一行枚举 · #69=卡(已有)+记录+门+回卡 · 范围外：#81(升版/通用撤回·G4 已落面保留)/#83(P4 备忘)/#153·#183(ERASE 已含)/围栏族零改动 · pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 superseded(202+logical·purgePending) · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null · est live=0 · Dual PASS ≠ 开工 · Ban self-approve*

`draft_rev2:pre_exec_dual（双席处方 7 条落卷·待复核席快核）` · 2026-10-10 · rev2 docs-only 零码动 · rev2 基线仍 @`6a81acfc`（本文件为唯一改动面）

`executed:awaiting_post_prove_dual` · 2026-10-10 · EXEC 落卷（append-only 状态行）· 工作树 `meetwise-consentmin` @分支 `line/consent-min`（rebase 主线 `6979a069` 干净重放后于 `5f6eeee6` 开工）· C1+C2 全件落地 + 新证 `prove:consent-min`（isolated runner 登记·EXIT=0 19/19）· 矩阵全跑收据 `ai-docs/delivery/receipts/consent-min/2026-10-10-exec-receipt.md`（logs 20 件在卷）· **零新增红**：neg:input 3 红与 web build 1 红均基线血统（stash 对照跑/临时 worktree 对照跑同集实证·详收据 §2/§3）· 两处登记更新（voice-timeout:40=3 / validate:401=403 consent_required）均一次过 · 零迁移 · markers=0 · **awaiting_post_prove_dual（alone≠dual）**

---

## nail 落卷（2026-10-10 · post-prove 双席 BOTH PASS·批4 收官）

**双审结果**：席1（实现语义+范围纪律）+席2（用户旅程+回归）互盲复核 BOTH PASS。范围零越界（C1 三入口仅挂枚举·C2 恰四小件零新机制·byte 同 resume.service :95-96 形）·序钉亲证（guard :451 先于门 :454-455·privacy-erasure-http 19/0 复跑绿=410 先于 403）·两登记更新语义精确（queries===3=归属 1+围栏 1+门 1·validate :403-404 断言真实 seed 无 voice 行 403 只能出自新门）·四证全亲跑绿（consent-min 19/19·neg:interview 97·api:validate·privacy-erasure-http 19/0）·语音旅程全链亲读（await 落库成功才开录/RLS owner 隔离无跨户解锁/三处回卡/503 环境面非门误伤）·既有 5 调用方零破坏·委托函数与 0058 立法同形仅作用一次性证明库（围栏族零字节）·neg:input 血统独立坐实（PASS/FAIL 集 diff 空+3c9f235c 更早刀已录 base≡red 旁证）。merge 落主线 @07ab0c12（runner+InterviewPanel dual-keep·web typecheck+prove 复验 EXIT=0）。

**nail 随卷勘误与注记**：①neg:input 3 红根因标注勘误——其中 2 红（xss 对）实为 42883 assert_interview_privacy_active 缺失（sql/ 镜像链漂移家族）非 i.created_at；材料结论（基线血统非新增红）不变（席2）。②新证 EXIT=0 系 attempt2 达成（attempt1 红=证明环境缺 0058 镜像·收据 §2 全账·非断言改口）——Ban「一次过」披露偏差如实留档（席1）。③runner 登记 5 行=REQUEST 外最小必要管道已披露（席1）。

**批4 收官**：10 条全闭（#247/#236/#242/#198/#241/#238/#253/#243/#69/#82+#83 降 P4+#153/#183 归 ERASE）——隐私机制冻结在用户裁定水位（「上传时授权协议即可」），不再新增任何隐私机制。

**Status**: `nail:closed`（post-prove 双席 BOTH PASS·merge 落主线 @07ab0c12·批4 正式收官·markers=0·est live=0）。
