# ERRMSG-MAP — #250/#251/#224 错误文案映射刀（actionErrorMessage 四页 · 审计批 0 几行前端止血 · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（本 REQUEST 只送审 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 自动开工 · 须 meetwise 明示授权才进 EXEC）
**Date**: 2026-10-07
**Base**: `origin/feat/mysql-schema-skeleton` @`115c47f2` · 分支 `line/errmsg-map`（工作树 `/Users/miaole/Desktop/golucky/meetwise-line-errmsg`）
**蓝本**: fix-roadmap 批 0 原文（协调方审定誊录）：「统一 actionErrorMessage(status, code) 覆盖四页；映射表：402→『额度不足，去哪里获取』·candidate_route_undecided→『暂时无法判断岗位方向』·interview_resume_binding_conflict→『你有一场未结束的面试：继续/放弃后重来』·503→『服务暂不可用』；/jobs 不再写『将消耗你 1 次额度』——D5 已决企业付费，#271 上线前如实提示。」——**唯一蓝本**，文案逐字忠实，**禁自由发挥**。
**Honesty**: 本档全部 file:line 锚点在 `line/errmsg-map` @`115c47f2` 实树亲读验证（apps/web 四页+四 actions+lib/jobs+pricing/billing、apps/api interview/quiz/diagnosis service、apps/web/test/web-logic.proof.ts、product-campaign-EXECUTION-SOP.md——行号错=审席 FAIL）；「将消耗你 1 次额度」在 apps/web **零命中**（grep `消耗|次额度` 实证），该句为 Ban 项非改动项（§5-8）。

---

## §0 立靶

审计批 0 三案（全部亲验后誊录，锚点见 §3 现状列）：

1. **#250（402 额度不足四页全无提示）**：actions 侧 402 一律重定向 `?error=credits_unavailable` 系（interviews/quiz/diagnosis）与 `apply_credits_unavailable`/`interview_credits_unavailable`（jobs），但页面只渲染 `create_failed`（quiz/diagnosis）与 `create_failed`/`begin_failed`（interviews）——402 重定向落地即哑；**jobs 页根本不读 error**（searchParams 只有 `limit`/`alimit`）。用户额度不足只看到按钮毫无反应般回到列表，无任何指引。
2. **#251（begin 409/503 全折叠为 begin_failed）**：`startInterviewAction` 对 begin 非 402/401 一律 `redirect('/interviews?error=begin_failed')`，把 API begin 的确定性 409（`candidate_route_undecided`/`interview_resume_binding_conflict`/`interview_resume_binding_unavailable`/`legacy_resume_reference_unavailable`/`resume_version_mismatch`）与 503 全部折叠为「启动面试失败（未预留额度）,请稍后重试」——**确定性失败重试无效**，文案在教用户白点。
3. **#224（/jobs 不读 ?error= 实例）**：`jobs/page.tsx` searchParams 解构只有 `{ limit, alimit }`，actions 写下的 `?error=` 永远无人渲染。

上游事实源：`product-campaign-EXECUTION-SOP.md:26`（W1 主路径：「#250/#251/#224（actionErrorMessage 四页）→ROUTE-DICT rev3 政策改→EXEC」）·`:48`（批 0 验收：「四页 402/409/503 中文文案 proof」）·`:13`（ROUTE-DICT rev3 政策：「歧义/零叶命中→默认路由（backend/general），409 退役」→ `candidate_route_undecided` 在 rev3 后**结构性不可达**，映射行保留防御）。

本刀=纯前端文案映射止血：apps/api 零字节，begin/额度 saga/路由决策服务端语义零触。

## §1 范围

**① 纯函数 `actionErrorMessage(status, code)`**（lib/ 下·命名 EXEC 定，建议 `apps/web/lib/errors/action-error.ts`）：

- 签名（declare·形制 EXEC 审定，行为契约=§4 断言面）：`actionErrorMessage(status: number, code: string | null): { text: string; href?: string; note?: string } | null`。redirect 通道只携码不携 status——码表内自带 status 归属（`credits_unavailable`/`insufficient_entitlement`/`*_credits_unavailable`→402 等），`status` 形参服务非码通道与防御；返回 `null`=该码无渲染面（四页不渲染空壳）。
- 单测断言逐码映射：落 `apps/web/test/web-logic.proof.ts` 新 section（沿 `resumeOcrPreviewBanner` 纯文案函数先例，`web-logic.proof.ts:643-644` includes 断言形制）。

**② 四页接入 + actions 侧错误码透传（#251 折叠点解除·码必达页面）**：

- 页面：`?error=` 读取+渲染统一走 ①（interviews 已读 `:33`·quiz `:28`·diagnosis `:29`·**jobs 补读** `:32-34`）；既有 `create_failed`/`begin_failed` 硬编码三分支改由映射函数渲染，**兜底原文一字不改**。
- actions：`interviews/actions.ts:20` begin 非 402/401 → 解析 begin body `error` 码 → `?error=<code>` 透传（body 不可解析/码未映射 → `begin_failed` 兜底）；`quiz/actions.ts:14-16` 与 `diagnosis/actions.ts:17-19` begin 非 402 失败**现状静默 redirect 进会话页**（亲读）——同刀补「带码回列表」，沿 `interviews/actions.ts:8` 既有纪律注释原文（「begin 非 2xx（除已处理的 402）也必须回列表带错——禁止带着未预留的空壳进会话页」）。jobs actions 零改（`:10/:28/:40` 已写码，页面补读即达）。

**③ 映射表逐码（全文·蓝本四条逐字 + 兜底保留 + 防御行）**：

| status | code（来源·亲读锚 @`115c47f2`） | 文案 | 出口/链接 |
|---|---|---|---|
| 402 | `insufficient_entitlement`（API interview.service.ts:306/:309·quiz.service.ts:58/:61·diagnosis.service.ts:61/:64）·`credits_unavailable`（interviews/actions.ts:18·quiz/actions.ts:15·diagnosis/actions.ts:18）·`apply_credits_unavailable`/`interview_credits_unavailable`（jobs/actions.ts:10/:28/:40） | 蓝本原文「额度不足，去哪里获取」→ 定稿「额度不足，请前往『额度说明』查看获取方式」+ 如实注记「预览环境暂未开放购买」 | 链接 **`/pricing`**（亲读定夺：`features/page.tsx:89` 既有站内入口；`/billing` **零入站链接**且自身回链 /pricing；`billing/actions.ts:6` 关闭期如实原文「预览环境未开放订单、支付或额度购买。」） |
| 409 | `candidate_route_undecided`（interview.service.ts:300） | 蓝本原文逐字「暂时无法判断岗位方向」 | 无链接 · ROUTE-DICT rev3 后结构性不可达（SOP:13「409 退役」）·**映射行保留防御** |
| 409 | `interview_resume_binding_conflict`（interview.service.ts:243） | 蓝本原文逐字「你有一场未结束的面试：继续/放弃后重来」 | 页面自身即 /interviews 列表（继续/放弃入口=列表既有按钮面 `interviews/page.tsx:112-118`） |
| 503 | `public_preview_read_only`（interview.service.ts:81·begin 入口 `:167` denyPublicPreviewWrite）及其余 503 | 蓝本原文逐字「服务暂不可用」 | 无链接 |
| — | `create_failed`（兜底·保留） | 原文一字不改（interviews `:50`「创建面试失败，请稍后重试；若反复出现请确认额度与网络。」·quiz `:47`/diagnosis `:48` 同型） | 无 |
| — | `begin_failed`（兜底·保留·仅接收未映射码） | 原文一字不改（interviews `:54-55`「启动面试失败（未预留额度）,请稍后重试;不会进入空会话。」） | 无 |
| 防御 | `interview_resume_binding_unavailable`（:269）·`legacy_resume_reference_unavailable`（:249/:288）·`resume_version_mismatch`（:230）·`interview_not_active`（:183）·quiz/diagnosis begin 409：`resume_not_found_or_not_ready`（quiz:45/diag:47）·`quiz_resume_reference_conflict`（quiz:53）·`diagnosis_resume_reference_conflict`（diag:56） | 蓝本未给专文案 → **begin_failed 兜底原文保留**；透传后码必达页面不折叠丢失（#251 的"折叠"指码丢失，非兜底文案改写） | 无 |

**④ 文案忠实 + 充值入口 + jobs 消耗文案**：映射表文案逐字忠实蓝本（定稿措辞只做蓝本口语的页面化，语义零增删·双审逐字核）；402 充值入口链接 `/pricing`（①表定夺依据）；billing 关闭期注记如实「预览环境暂未开放购买」——**不得出现任何购买/充值可用承诺**（`billing/actions.ts:6` 关闭期原文为锚）；/jobs **不新增**「将消耗你 1 次额度」类文案（现状零命中实证·D5 已决企业付费·#271 上线前如实）。

## §2 非范围

1. **#256 提前结束 · #53-56 SSE · #229 报告重试 · #259 UI 改岗位**：全部另刀（SOP:26 W1/W3 序），本刀零触。
2. **apps/api 零字节**：begin 409/402/503 抛出语义、额度 saga（reserveEntitlement :304-309）、candidate_route_undecided 供给面（:297-301）零改——本刀只改 web 消费/渲染面。
3. **jobs 根错误边界 throw 面**：`startApplicationAction` 非 402 失败走 `applicationStartFailureMessage` throw→根 error boundary（jobs/actions.ts:31-35·lib/jobs/application-start-error.ts），该通道零触；本刀只接 `?error=` redirect 通道。
4. **/pricing、/billing 页面本体零触**：关闭期如实文案原样；充值能力/订单面零声明（#271 另刀）。
5. **兜底文案改写零**：create_failed/begin_failed 原文一字不改；未映射码的兜底文案不改（残留见 §7）。
6. **i18n/locale 面**：四页均硬编码中文（亲读），本刀沿现状，不做多语言抽取。
7. **SSOT 零触**：CLAUDE.md、backlog、coverage matrix、SOP 本体零改。

## §3 清单（file:line 现状→目标·全数亲读 @`115c47f2`）

| # | 码面 | 现状（亲读） | 目标 |
|---|---|---|---|
| C1 | `apps/web/lib/errors/action-error.ts`（新增） | 无 | ①纯函数+映射表（§1③ 全文）+码→status 归属；零依赖（纯字符串面） |
| C2 | `apps/web/app/interviews/page.tsx:31-33·:48-57` | searchParams 已读 `error`（:31/:33）；渲染硬编码两分支 create_failed/begin_failed | 渲染改走 `actionErrorMessage`（mapped 码+兜底原文不变）；402/409/503 mapped 码落此页 |
| C3 | `apps/web/app/quiz/page.tsx:26-28·:46-48` | 已读 `error`；仅渲染 create_failed | 同 C2（quiz 码集） |
| C4 | `apps/web/app/diagnosis/page.tsx:27-29·:47-49` | 已读 `error`；仅渲染 create_failed | 同 C2（diagnosis 码集） |
| C5 | `apps/web/app/jobs/page.tsx:32-34` | searchParams 只有 `{ limit, alimit }`——**不读 error**（#224 实证） | 补读 `error`+新增渲染面（`apply_credits_unavailable`/`interview_credits_unavailable` → 402 行）；页面其余零改 |
| C6 | `apps/web/app/interviews/actions.ts:20` | begin 非 402/401 一律 `?error=begin_failed`（#251 折叠点） | 解析 begin body `error` → `?error=<code>` 透传；不可解析/未映射 → begin_failed 兜底；:18 402 分支零改 |
| C7 | `apps/web/app/quiz/actions.ts:14-16`·`apps/web/app/diagnosis/actions.ts:17-19` | begin 非 402 失败**静默 redirect 进会话页**（:16/:19 亲读） | 补「带码回列表」（沿 interviews/actions.ts:8 纪律注释）；402 分支零改 |
| C8 | `apps/web/test/web-logic.proof.ts`（新 section） | 既有纯函数断言面（先例 :643-644） | §4 断言矩阵；既有 section 零改 |

四页码集（redirect 通道·prove 断言域）：/interviews={create_failed, begin_failed, credits_unavailable, candidate_route_undecided, interview_resume_binding_conflict, interview_resume_binding_unavailable, legacy_resume_reference_unavailable, resume_version_mismatch, interview_not_active, public_preview_read_only}；/quiz、/diagnosis={create_failed, credits_unavailable, resume_not_found_or_not_ready, *_resume_reference_conflict, public_preview_read_only}；/jobs={apply_credits_unavailable, interview_credits_unavailable}。

## §4 prove

1. **web-logic proof 新 section**（`apps/web/test/web-logic.proof.ts`·`pnpm web:prove`→package.json:7 `tsx test/web-logic.proof.ts`）：**四页码集 × {402 行, 409 mapped 各码, 503, create_failed, begin_failed, 未知码} 逐条断言** `actionErrorMessage` 输出——文案含蓝本关键短语、402 断言 `href==='/pricing'` + 「预览环境暂未开放购买」注记、兜底码断言原文精确串、未知码断言兜底/null 不渲染空壳。**渲染断言=纯函数输出断言**（四页为 RSC·页面渲染该输出·照 `resumeOcrPreviewBanner` 先例 `:643-644`；**非浏览器 DOM 证明**，如实声明不冒充）。
2. **既有 prove 零回归**：`pnpm web:prove` 全卷 EXIT=0，既有 section 断言零删改；**一次过**（Ban retry-to-green·attempts 全账入收据）。
3. **门清单**：apps/api 零字节断言（git diff 面）·冲突标记门（push 前 `grep '^<<<<<<< \|^=======$\|^>>>>>>> '` 全仓=0）·收据落 `ai-docs/delivery/receipts/errmsg-map/`（est live=0·零外呼零消耗）。

## §5 Ban（全列）

1. **Ban self-approve** · **alone≠dual**：本 REQUEST 只送 pre-exec 双审，Dual PASS ≠ 开工。
2. **Ban retry-to-green**：prove EXIT=0 一次过，attempts 全账如实。
3. **Ban 自由发挥**：蓝本=fix-roadmap 批 0 原文，映射文案逐字忠实（§1④）；蓝本外文案/码行零新增。
4. **Ban 新增额度消耗/购买承诺文案**：「将消耗你 1 次额度」类零新增（现状零命中实证）；402 注记只可如实「预览环境暂未开放购买」（D5 已决企业付费·#271 前不承诺）。
5. **Ban apps/api 触碰**：begin/额度 saga/路由决策服务端语义零字节（§2-2）。
6. **Ban 兜底原文改写**：create_failed/begin_failed 一字不改（§2-5）。
7. **Ban 根错误边界通道改写**：jobs throw 面与 application-start-error.ts 零触（§2-3）。
8. **Ban SSOT 触碰**：CLAUDE.md/backlog/coverage matrix/SOP 零改。
9. **Key name-only**：零 Key 触碰零 live（est live=0）·零 secrets/.env 入库。

## §6 pins（十一值照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼·零消耗）

## §7 Non-claims

文案 ≠ 功能：映射文案上线 ≠ 额度/绑定/路由行为任何改变 ≠ 402 可充值 ≠ candidate_route_undecided 可达（rev3 后结构性不可达·映射行保留防御 ≠ 功能存在）；充值入口 = /pricing **说明页** ≠ 充值可用（billing 关闭期如实·billing/actions.ts:6 为锚）；`begin_failed` 兜底对未映射确定性 409（防御行七码）仍含「请稍后重试」字样 = **如实残留**（蓝本范围如此·非本刀谎称已根除）；纯函数 prove ≠ 浏览器 DOM 渲染证明；jobs 页补读 ≠ startApplicationAction throw 面修复（根错误边界通道仍现状）；本 REQUEST ≠ EXEC 编码授权；`actualSpendCny=null`。

## §8 STOP

**STOP · `awaiting_pre_exec_dual` · alone≠dual。** REQUEST 写完即停零码动；EXEC 须双审 PASS + meetwise 明示授权；Ban self-approve；Ban retry-to-green。

---

*ERRMSG-MAP EXEC REQUEST · 2026-10-07 · draft:awaiting_pre_exec_dual · base `origin/feat/mysql-schema-skeleton` @`115c47f2` · 分支 `line/errmsg-map` · 蓝本=fix-roadmap 批 0 原文 · pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*
