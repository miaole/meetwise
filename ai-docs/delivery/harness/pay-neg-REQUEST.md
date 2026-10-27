# PAY-NEG REQUEST — NHP-UI-PAY-NEG-01「UI 支付拒绝」web 面具名 case 起草卷·支付失败/额度不足页面渲染与交互拒绝（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`** · alone≠dual · **STOP=draft（三处钉：本 Status 行 + §8 + 卷尾注）** · 本 commit 不预 claim 任何 post-commit EXIT。

**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null`（十值零翻转）
**Date**: 2026-10-26
**Base / tip**: `origin/main` `0246361dd75ac84beb70c6bed99be387da989499`（fetch 后亲算 HEAD==origin/main 同值 · worktree `meetwise-pay-neg` · branch `line/pay-neg-draft` · ⛔动主仓 · ⛔push）
**卷源**: `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` §1.7 `:153` 行 + §2 盲区清单 `:169` 行 + `ai-docs/delivery/e2e-requirement-coverage-matrix.md` `:136` 行（三行基线 pin 均对 tip 亲点·blob 见 §0.1 · rev 2026-10-26 随 tip `e072e957f` 重点：case-matrix 行漂 +2·内容恒等）
**本卷性质**: docs-only 起草卷。认领 NHP-UI-PAY-NEG-01 行 **web UI 面**（拒付/取消/渠道失败的页面渲染与交互拒绝），为后继 EXEC 立「具名 UI 用例」拟定交付面与臂面。登记≠修复≠定谳≠关闭；行翻面权归协调方。

**席位**：PAY-NEG UI 支付拒绝 NEG 刀起草席（docs-only 起草·协调方授权派单·认领 NHP-UI-PAY-NEG-01 行 web UI 面·与 001/011 api 钱路径各 UC 专属线互斥不重叠）。
**基线**：`origin/main` @ **`0246361dd`**（full `0246361dd75ac84beb70c6bed99be387da989499` · `git fetch origin` 本 turn 成功 · 分支 `line/pay-neg-draft` 零独有 commit · worktree 建树即落 tip 亲证）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2382 ≤ cap 2386**（§2-1 亲算）· 工作树 `meetwise-pay-neg`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 / §1.0.3 双表同步令）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.7 `:145-:153` / §2 `:166-:169`）→ `ai-docs/delivery/harness/errmsg-map-REQUEST.md`（#250/#251/#224 蓝本）→ `ai-docs/delivery/harness/micro-batch-REQUEST.md`（L-01 privacyPreview 迁移先例·本刀异域）→ 涉事机制源 `apps/web/lib/errors/action-error.ts` / `apps/web/app/{interviews,quiz,diagnosis,jobs}/actions.ts` / 同名四 `page.tsx` / `apps/web/lib/jobs/application-start-error.ts` / `apps/web/app/pricing/page.tsx` → 旁证先例 `apps/web/test/web-logic.proof.ts`（ERRMSG-MAP `:867` 段 / ROLE-INPUT `:939` 静态源面段 / 片3-1a `:1589-:1590`）与 `apps/api/src/modules/{interview,quiz,diagnosis}/*.service.ts`（api 402 producer·零触）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①case-matrix §1.7 `:153` 行（**显式 gap/out-of-scope 登记·「现无具名 UI 用例」**）；②case-matrix §2 `:169` 盲区行（「未具名易被读成 001/011 已覆盖」）；③coverage-matrix `:136` 行（NEG=**gap/out-of-scope** · FAULT/BOUND/ADV=**blind**×3）；④批 C 卷（`harness/nhp-batch-c-REQUEST.md`）残余盘点将 `:136-:139` 归注「云授权 blocked → 出域」——其中 UI-PAY 行的 out-of-scope 旗系 §1.7 表头语义「尚无评测用例 ID 时一律 gap/out-of-scope」（case-matrix `:147` 亲读·`case-only` 未用因），非云授权 blocked 义；批 C 取 `:120/:121/:146` 三行，UI-PAY 行留白，本刀依协调方派单（2026-10-26）认领之，与批 C 触面行级互斥零重叠。

---

## 认领核对（fresh 行号亲点·全 gap/blind 亲读逐字）

| 行号（tip 亲点） | 行原文关键值（逐字） | 现列值 | 本刀认领 |
|---|---|---|---|
| case-matrix **`:153`** | `NHP-UI-PAY-NEG-01 ｜ 001/011 ｜ NEG ｜ web ｜ **UI 支付拒绝**（拒付/取消/渠道失败面）｜ 可解释拒 + 账本不双扣；现无具名 UI 用例` | **gap / out-of-scope** | **web UI 面**全行（后继 EXEC 补具名 case·gap→case-only 措辞·EXIT0=case≠covered） |
| case-matrix **`:169`** | `**UI 支付拒绝**｜ 未具名易被读成 001/011 已覆盖 ｜ **显式 gap/out-of-scope**：NHP-UI-PAY-NEG-01` | 盲区清单行 | 同上（§2 缓解列措辞随 EXEC 收据呈报·格值零自翻） |
| coverage-matrix **`:136`** | `NHP-UI-PAY-NEG-01（UI 支付拒绝）｜ 显式缺口；≠ 001/011 api 钱路径已覆盖 UI 拒付` | NEG=**gap/out-of-scope** · FAULT/BOUND/ADV=**blind**×3 | 仅 NEG 列 web 面；其余三列不动 |

**与 001/011 api 钱路径分界（互斥不重叠亲证）**：api 面已有充分覆盖——001-NEG（`pnpm uc001:nhp-neg:prove` EXIT=0 · N1 **402** `insufficient_entitlement` · asserts=26 · `GAP-UC001-NEG-01` Line Y nail）与 011 钱路径（refund-callback 41/41 + adv 68/68 · NHP-011-ADV-01 CLOSED(wired)）均系 **api 嘴面**证据。本刀认领 **web UI 面**：402 到达浏览器后的①页面渲染（文案形/链接/注记/`role=alert` 块）与②交互拒绝（重试入口显隐/零重复扣费交互/zh-en 渲染态）。**Ban 互借双向**：api 收据不 wash 本行；本刀后继 EXEC 收据亦不 wash 001/011 api 行、不宣「钱路径已闭环」。

## §0 现状锚（起草席亲读·file:line+blob 逐条亲算 @`0246361dd`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **32 树**实测——`meetwise-pay-neg` 恰 1 命中=本席；`ls ai-docs/delivery/harness/ | grep pay-neg` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **在飞逐树亲读**：`line/online-pay-draft` @`fdaa1ecf0`（领先 1 commit · docs-only 线上支付适配器 REQUEST 初稿 · commerce provider 契约/回调幂等面）——其 diff **无 apps/web 无双矩阵**（亲证），与本刀 web UI 面**零文件交叠**；money 域相邻不重叠，Ban 互借收据、Ban 冒充支付能力（pricing 页如实边界 §0.2-5 承登）。`line/nhp-c-draft`（领先 9 commits · EXEC 已落待并）——触双矩阵 `:120/:121/:146`+case-matrix `:40-42/:86-88` 行，与本刀认领行（coverage `:136`+case-matrix `:153/:169`）**行级互斥**；同文件 merge-order 敏感如实登记。`line/enterprise-pay`（领先 1416 commits·B271 旧线）与 `line/k-next-nhp`（领先 541 commits·NHP-014 旧线）系长线陈旧支，其内容已经由他线落主线（tip `jobs/actions.ts:27-31` B271 片2 注记在码亲证）——非活跃竞争面。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only 恰 1 新 .md）；后继 EXEC 拟触面=web 测试面新具名 case（零产品码意向，§1）。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树复核，任一分支顶对触面存在 `0246361dd` 之后新增提交 → 触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算 · 8 hex · 行数 wc -l）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `apps/web/lib/errors/action-error.ts` | `c2701484`（124） | `:28-33` 402 四码集 `CREDITS_402_CODES` · `:34` `CREDITS_TEXT` · `:35` `CREDITS_NOTE` · `:36` `PRICING_HREF='/pricing'` · `:55-:58` create_failed 兜底三页 · `:60` begin_failed（interviews 专属）· `:91-:93` `actionErrorMessage` 402 行（四页同文案）· `:122` 503 行 · `:123` 未知码 null |
| `apps/web/app/interviews/actions.ts` | `ab7459fc`（111） | `:19-:22` `reclaimShellAndRedirect`（best-effort abandon → 必达一次带码 redirect）· `:25-:29` `beginErrorCode` 码透传/兜底 · `:51`（start）与 `:104`（focus-retrain）`begin.status===402 → reclaimShellAndRedirect('credits_unavailable')` |
| `apps/web/app/quiz/actions.ts` | `8bd2ca2e`（30） | `:20` `begin.status===402 → redirect('/quiz?error=credits_unavailable')` |
| `apps/web/app/diagnosis/actions.ts` | `591e4a7c`（29） | `:19` 同形 `/diagnosis?error=credits_unavailable` |
| `apps/web/app/jobs/actions.ts` | `107dba3e`（80） | `:29-:31` `res.status===402 → applicationStartRedirectError(b402?.error)` 分码 redirect · `:46-:49` 注记（begin 已并入 `/applications/:id/start` 同一服务端事务·企业预留与申请状态迁移原子提交·候选人零扣·#227 缺陷收口） |
| `apps/web/lib/jobs/application-start-error.ts` | `3ad2cad7`（50） | `:24-:26` `APPLICATION_START_REDIRECT_ERRORS`（`application_enterprise_pay_unavailable→'该岗位面试暂不可用，请联系招聘方'`）· `:31-:33` 未知 402 分码回落 `interview_credits_unavailable` |
| `apps/web/app/interviews/page.tsx` | `a2bf466f`（226） | `:34/:36` `searchParams` 解析 `error` · `:61-:71` `role=alert` 渲染块（`:69` Link label=`{actionError.hrefLabel ?? '额度说明'}`） |
| `apps/web/app/quiz/page.tsx` | `906349a7`（134） | `:52-:63` 渲染块（`:60` label 硬编码「额度说明」） |
| `apps/web/app/diagnosis/page.tsx` | `c44df79d`（130） | `:50-:61` 渲染块（`:58` 同） |
| `apps/web/app/jobs/page.tsx` | `3799e63f`（239） | `:72-:83` 渲染块（`:79` 同） |
| `apps/web/app/pricing/page.tsx` | `28c12ee8`（48） | `:7-:8` metadata「额度说明·知面/不提供支付购买退款」· `:22-:44` 「暂不开放交易」如实边界（零购买 CTA 零价格） |
| `apps/web/test/web-logic.proof.ts` | `add5e1b0`（2041） | `:867` ERRMSG-MAP 段头 · `:869-:877` 402 四码×四页断言（text/href/note 三元组逐字）· `:923-:929` hrefLabel 缺省恒等断言 · `:930-:937` 未知码/status 402+未知码 → null · `:939` ROLE-INPUT 静态源面段头 · `:1589-:1590` 片3-1a 企业支付分码文案静态断言 |
| `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` | `08ffaf9c` | `:213-:220` S6 `newNamespaces` 注册面（errorBoundary/publicPreview/resumeDelete/privacyPreview）· S2/S3 全 catalog parity+CJK-free 机检 |
| `apps/web/messages/zh.json` / `en.json` | `71afc9a0` / `4bb0f67a` | zh `:100` `home.footPricing=额度说明` / en `:100` `Credits`；zh `:159` `features.ctaPricing=查看额度说明` / en `:159` `See credits note`；`nav.billing`（额度/Credits）`nav.pricing`（定价/Pricing）双语在册 |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15` | `:100`（企业路径不映射候选人 402）· `:250`（C 端本人不足语义）· `:258-:260` `HttpException PAYMENT_REQUIRED {error:'insufficient_entitlement'}` |
| `apps/api/src/modules/quiz/quiz.service.ts` / `diagnosis/diagnosis.service.ts` | `98edbeb2` / `2c7c882e` | quiz `:62/:65` · diagnosis `:61/:64` 402 同码两臂（saga 抛 / `reserved` 未落） |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `cbf9d97f`（199）·rev tip `852d1ccc`（201） | `:145` §1.7 段头 · `:147` 「尚无评测用例 ID 时一律 gap/out-of-scope」· `:151` 认领行 · `:167` 盲区行 · rev 随 tip `e072e957f` 重点：段头 `:147`·规则语 `:149`·认领行 `:153`·盲区行 `:169`（+2 行漂·内容恒等） |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `6fc92dd0`（520）·rev tip `6e40c988`（520） | `:136` 认领行（rev tip 行号不变） |

### 0.2 码面锚（402 拒绝链注入缝 · file:line 亲证）

1. **producer（api · 旁证零触）**：`interview.service.ts:258-260` C 端本人额度不足 ⇒ HTTP **402** `PAYMENT_REQUIRED` `{error:'insufficient_entitlement'}`（企业路径 `:100` 明示不映射候选人 402）；quiz `:62/:65`、diagnosis `:61/:64` 同码两臂（`reserved` 未落 ⇒ 402=**预留失败零消费**语义）。
2. **web 捕获臂（四 actions）**：interviews `:51/:104` 先回收空壳再带码 redirect；quiz `:20` / diagnosis `:19` 直 redirect 带 `credits_unavailable`；jobs `:29-:31` 按响应体分码（白名单 `application-start-error.ts:24-:26`，未知 402 分码回落 legacy `interview_credits_unavailable` `:31-:33`）。
3. **映射单源**：`action-error.ts:92-93` —— 四码集命中 ⇒ `{text: CREDITS_TEXT, href: '/pricing', note: CREDITS_NOTE}`，**四页同文案**（页域无关）；未知码 `:123` 返回 null（不渲染空壳）。
4. **渲染位（四页）**：`?error=` 经 `actionErrorMessage(page, 0, code)` 落 `role=alert` 段——text + Link（label 缺省「额度说明」，interviews 页 `:69` 支持 `hrefLabel` 覆写，quiz/diagnosis/jobs `:60/:58/:79` 硬编码）+ note 小字（`:61-:71/:52-:63/:50-:61/:72-:83`）。
5. **零双扣交互**：interviews `reclaimShellAndRedirect`（`:19-:22`）=begin 402 后 best-effort `POST :id/abandon` **先于** redirect——`created` 空壳零消费走 commerce NOT EXISTS 分支转 `abandoned`，不残留幽灵「进入 →」，abandon 失败不阻塞不重试（注释 `:13-:16` 亲读）；「禁止带着未预留的空壳进会话页」纪律（`:9` 注释）。jobs 面 begin 已并入 start 同一服务端事务（`:46-:49` 注记·候选人零扣）。quiz/diagnosis begin 未成功即零扣（producer `:65` 语义），`created` 记录留存列表不进会话页。
6. **目的页**：`/pricing`（`app/pricing/page.tsx`）如实边界页——「暂不开放交易」零价格零购买 CTA；402 行 note「预览环境暂未开放购买」与之一致（无购买承诺）。

### 0.3 zh/en 双语渲染态 + i18n namespace 亲证

- 四支付面页（interviews/quiz/diagnosis/jobs）+ pricing 页 **locale/Translations 消费=0**（grep 亲证四文件 0 命中）——页面整体 zh 渲染，非仅错误行。
- 双语在册面仅 chrome：`home.footPricing`（zh `:100` 额度说明 / en `:100` Credits）、`features.ctaPricing`（zh/en `:159`）、`nav.billing`/`nav.pricing`。
- **402 拒绝文案三件**（`CREDITS_TEXT:34` / `CREDITS_NOTE:35` / 链接 label「额度说明」）**不在任何 messages namespace**——en locale 用户收到 zh 拒绝文案（如实登记的现状态，非本刀洗面）。
- **L-01 先例异域注记**：`privacyPreview` namespace 已随 micro-batch 刀落（`app/privacy/actions.ts` cookie-locale helper + zh/en 双侧落键 + uc-e2e-003 S6 `:219` 注册 + CJK-free 机检）——系**隐私 actions 域**，与本刀支付/额度 UI 面**异域零重叠**（不同文件不同 namespace 面）；其先例形（纯函数离线可证 + S6 注册 + en CJK-free）供后继 i18n 刀沿形，本刀零触 messages catalog。

### 0.4 期望值逐条对码（402 PAYMENT_REQUIRED → UI）

| # | 期望（矩阵「可解释拒+账本不双扣」/蓝本语义） | 码面实锚（file:line） | 判定 |
|---|---|---|---|
| E1 | 402 → 可解释拒文案（额度不足+获取指引） | `action-error.ts:92-93 → :34` 逐字 | 在码（web-logic `:869-:877` 已断言·非具名 case） |
| E2 | **重试入口显隐**：402 不给「请稍后重试」（重试不可解），给『额度说明』→`/pricing` 入口+如实注记 | `:93` text 零「请稍后重试」（该语仅 `:55-:60` 兜底行·`:64` 注释明示「重试不可解」原则）；`href:'/pricing'`+`note`（web-logic `:870-:877` 断言） | 在码 |
| E3 | 链接 label 缺省「额度说明」· UC-025 行可覆写 hrefLabel | interviews `:69` `hrefLabel ?? '额度说明'`（web-logic `:923-:929` 缺省恒等断言） | 在码 |
| E4 | **零重复扣费**：402=预留失败零消费；UI 绝不带未预留空壳进会话页 | interviews `:51/:104` 先 abandon 后 redirect（`:19-:22`）；quiz/diag `:20/:19` 直 redirect；api `:65` reserved 未落即零预留 | 在码·**无具名 UI 断言臂** |
| E5 | 渠道/企业支付失败分码（jobs 面·候选人稳定拒因） | jobs `:29-:31`+白名单 `:24-:33`；渲染 `jobs/page.tsx:72-:83`；web-logic `:1589-:1590` 静态断言 | 在码 |
| E6 | zh/en 双语渲染 402 文案 | §0.3：四页零 translations 消费·文案 zh-only | **盲（现状态）**：en 用户得 zh 文案——如实登记·后继 i18n 刀面（沿 L-01 形）·本刀不修不 wash |
| E7 | 具名 UI 用例（NHP-UI-PAY-NEG-01 注册可执行证据） | 全仓 `grep -rn "NHP-UI-PAY" apps/`=**0 命中**（亲证） | **gap**：本刀后继 EXEC 补（§1） |

## §1 交付面（后继 EXEC 拟面 · 本卷零码动）

**具名 case 形**：`NHP-UI-PAY-NEG-01` = apps/web 测试面新具名 case 段（`web-logic.proof.ts` 新 section 或独立 prove 文件，pre-exec dual 裁定）——**纯函数输出断言 + 静态源面 regex 断言为主案，零 DOM 零浏览器依赖、离线可证**（沿 L-01 web-logic 纯函数先例 + ERRMSG-MAP `:867` 输出断言形 + ROLE-INPUT `:939` 静态源面形两先例；如需 boot/组件 render 形沿 web-middleware/boot-validate 先例另案裁定）。**prove-only · `apps/*/src`/`packages/*/src` 零 diff 意向**。

**臂面概要**（逐臂对 §0.4）：
- **ARM-1 文案形**（E1/E2）：`actionErrorMessage` 四页×四码 → `{text,href,note}` 三元组逐字断言+text 负含「请稍后重试」（**负含只对 402 行 text 施加**——`begin_failed`/`create_failed` 兜底行合法含该语·勿全函数负断言）；防御注记：四码中 `apply_credits_unavailable` web 侧产出臂唯 ensureOk 402 分支（`ensure-ok.ts:17`·applyAction/declineApplicationAction `:14/:57` 调用点）·上游 apply/decline 接口现无 402 触发（api jobs 模块 402 仅 `applications.service.ts:60` 企业分码）=dormant 防御臂·web-logic `:1250-1252` 既有分支零改断言在钉——断言措辞防「可达路径全行使」误读。
- **ARM-2 拒绝链静态源面**（E4/E5）：四 actions 402 臂源面断言（沿 `:939` 段 readSrc 先例·**interviews 臂序断言强形钉死**）：先切 `reclaimShellAndRedirect` 函数体切片（`async function` 行起至闭合括号止·切片隔离本文件后续函数），切片内断言 abandon-fetch 形在位（`serverFetch('/interview/' + interviewId + '/abandon', { method: 'POST' }).catch(() => null)`）+ 带码 redirect 形在位（``redirect(`/interviews?error=${encodeURIComponent(code)}`)``）+ 切片内 `indexOf(abandon) < indexOf(redirect)`；另全文件断言 `begin.status === 402) await reclaimShellAndRedirect(interviewId, 'credits_unavailable')` **恰二命中**（`:51`/`:104` 两臂）；quiz/diag redirect 带 `credits_unavailable`、jobs 分码白名单+未知码回落同源面形。**Ban 裸全文件单 regex 序断言**（函数体内重排时假绿·后续函数 redirect 供匹配）。
- **ARM-3 渲染位源面**（E1/E3）：四页 `role=alert` 块 + Link label + note span regex（`:61-:71/:52-:63/:50-:61/:72-:83` 锚）。
- **ARM-4 零双扣交互面**（E4）：reclaimShellAndRedirect abandon-before-redirect 序源面断言（**沿 ARM-2 同一强形**：函数体切片内 `indexOf(abandon) < indexOf(redirect)`·Ban 裸全文件单 regex 序断言）+ jobs 原子 begin 注记面（`:46-:49`）；api 零预留语义仅引证零触。
- **ARM-5 边界**（E2 对照）：status=402+未知码 → null 不渲染空壳；503 行对照。
- **非替代申明**：ERRMSG-MAP `:869-:877/:923-:937` 与片3-1a `:1589-:1590` 既有断言**保留不动**，本 case 系 chain-level 具名注册（补 actions 臂+渲染位臂），Ban 删改既有断言、Ban 互借关列、Ban 借本 case 宣「支付已闭环」。web-logic `:978` 既有 interviews 页源面 hrefLabel 断言（`{actionError.hrefLabel ?? '额度说明'}` regex）与 ARM-3 渲染位臂重叠——申报 **additive restatement**（重叠=复述加固·零替代零删改）。
- **非目标**：E6 en 文案迁移（后继 i18n 刀沿 L-01 形·messages catalog 零触）；api 钱路径（001/011 已覆盖）；浏览器 DOM/Playwright 面（Chromium runner 前置·gap-uc016/017 两卷既登记「UI 域+Chromium runner 前置（G7 prereq）另刀」注记承登）。
- 行/列状态一字不动：EXIT0=case≠covered，coveredCount=8 不变，升格仅经协调方 nail 的 additive honesty；双矩阵行内改随 EXEC 收据呈报归协调方。

## §2 门矩阵（命令与届值在树亲证 · 本 docs-only worktree 未装依赖的依赖型门如实登记）

| 门 | 命令（树亲证） | 届值/基线 | 起草席 | 后继 EXEC |
|----|----------------|-----------|--------|-----------|
| docs:check | `node scripts/ai-docs/check-docs.mjs` | cap=**2386**（`scripts/ai-docs/public-text-policy.mjs:149` `MAX_FILES = 2_386` 亲证）· 本席亲跑 **EXIT=0 · scanned 2382** · 卷后 **2383≤2386 余 3**（新文件 +1 计入）· **零 cap 上调需求**（越限沿先例步进承登预授权条款未触发）· **届值重钉预告（rev 增）**：cap 系届值——本行 2386 系起草基线 `0246361dd` 届值如实保留，rev 时点 tip `e072e957f` 已步进 **2397**（`public-text-policy.mjs:155` `MAX_FILES = 2_397` 亲证）· **EXEC 立项日按届时 tip 重 pin** · rev 2026-10-26 复跑 **EXIT=0 · scanned 2383**（如实） | **亲跑 EXIT=0** | 必跑 |
| markers 五类 | 沿 `scripts/i6-239-gates.proof.mjs:152-:163` 五类标记词词面运行时组装形对卷面直扫（词形不誊防自指） | 卷面零命中 | **亲扫零命中** | 必跑 |
| diff 面 | `git diff --cached --numstat` | 恰 1 tracked（本卷 .md 新增 · 零他件） | 落卷亲检 | 必检 |
| web typecheck | `pnpm -C apps/web typecheck`（= `tsc --noEmit` · `apps/web/package.json:24` 亲证） | scripts 值亲证；本 worktree 无 node_modules 未实跑（如实登记） | 未跑 | 必跑 |
| web lint | `pnpm -C apps/web lint`（`eslint . --max-warnings 601` · `apps/web/package.json:7` 亲证） | 基线 **601 恰等**（micro-batch §9-EXEC/§9-post 两轮亲证值） | 未跑 | 必跑（Ban 放宽） |
| web-logic prove | `pnpm -C apps/web prove`（`tsx test/web-logic.proof.ts` · `:8` 亲证） | 基线 **432 PASS/0 FAIL**（micro-batch §9-EXEC 7 亲证基线值） | 未跑 | 必跑（新 case 段后基线值步进如实登记） |
| uc003-i18n prove | `node apps/web/test/uc-e2e-003-i18n-locale.proof.mjs`（纯 node 零依赖） | EXIT=0 基线（micro-batch §9-EXEC 亲证） | 未跑 | 若触 i18n 面必跑（本卷拟面零触） |
| 环境供给 | — | est live=0 · 0 Key 值 · `actualSpendCny=null` | — | — |

## §3 停止条件核（起草席如实登记）

1. **码面可测注入缝判定：有缝**——§0.2 六缝 + §0.4 E1-E5 在码、E7 具名 case 缺位=本刀缝本体（`grep -rn "NHP-UI-PAY" apps/` 0 命中亲证）。**非**「无可测注入缝」停止条件形态，如实入卷不销账。
2. **锚漂**：起草 turn 零漂（§0.1 blob 表对 `0246361dd` 亲算；批 C 卷残余盘点表 `:136-:139` 注记与本刀认领不冲突亲读）。
3. **E6 en 文案盲区**系现状态登记非本刀可修（修面=i18n 迁移刀沿 L-01 形另派）——不修不 wash 不冒充已修；本卷零触 messages catalog。
4. 其余停止条件（现场漂移/越限未授权/self-approve/push）未命中。

## §5 pins（全卷）

Pins 十值零翻转（见卷头）。**全卷 Ban 面**：零产品码动（本卷 docs-only 恰 1 新 .md；后继 EXEC 拟面亦 prove-only 零产品码意向）；Ban 触产品码行为面、messages catalog、`.env*`、SSOT 行结构、双矩阵格值翻转、lint/cap 上限放宽、retry-to-green、self-approve、push、动主仓。登记≠修复≠定谳≠关闭；EXIT0≠covered；alone≠dual；行翻面/回写（case-matrix `:153/:169` 与 coverage-matrix `:136` 行处置建议）随 EXEC 收据呈报归协调方。

## §8

draft:awaiting_pre_exec_dual（2026-10-26 起草落卷）。本步只新增本卷任务书，不改任何码面、proof、catalog、SSOT。

## §9 卷纪律

diff 恰 1 tracked 新增（本卷 `ai-docs/delivery/harness/pay-neg-REQUEST.md`）；commit 净消息 `docs(test): 起草支付拒绝界面测试任务书`；⛔push；收据不入库（untracked）；实现方不 self-approve · alone≠dual · EXIT0≠covered。

draft:awaiting_pre_exec_dual（卷尾注 · STOP 三处钉之三 · 与 Status 行/§8 同值 · 落卷即停 · 后继 EXEC 待协调方派单+pre-exec dual 放行）
