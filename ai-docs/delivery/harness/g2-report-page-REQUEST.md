# REQUEST — **G2 REPORT-PAGE 体验刀**（#254+#257+#232残 · S 体量 · 三处同域=报告/列表前端小改 · docs-only 起草）

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（docs-only 起草 · Ban coding · Ban prove 执行 · Ban self-approve · alone ≠ dual · 不代签 peer）
**Line**: **G2 REPORT-PAGE**（批1 残余打包 G2 组 · 蓝本 `batch-residual-plan.md:87` 分组表 + `:114` 派序建议「G2/G3 S 批1 收官·用户面立见」· 台账 `product-campaign-LEDGER.md:38` #254 行在册 + **#257 行漏登**（`:119` 注记1·回填归协调方））
**Base tip**: `df12a054`（`feat/mysql-schema-skeleton` tip · worktree `meetwise-g2`（仓根同级 worktree）分支 `line/g2-report-page` · 本文全部 file:line 于本 worktree **实树亲读** · 上游行号漂±登记 §0 表）
**Author**: `g2-draft`（REQUEST 起草席 · 实现不自批）
**Date**: 2026-10-10
**依据**: ①批残留清点 `batch-residual-plan.md`（meetwise-line-entpay 树 @`ab02d499`）G2 组行 `:87` + 流程注记 `:119-121` ②审计 issues-master 全行（外部审计总表·本机外部件·不入仓 `issues-master.md`·:290 #254 / :293 #257 / :308 #232 · **修法列逐字誊录见 §0**）③TASK-SOP-v2 `:110` #257 对账漏条回账行（归批1·与 #254 同族）④锚点亲读：`apps/web/components/InterviewPanel.tsx:68,451-456,544-558`、`apps/web/lib/view-model.ts:112`、`apps/web/app/report/[id]/page.tsx:32-37,69,154,167`、`apps/web/app/api/privacy/export/route.ts:7-16`、`apps/web/app/quiz/page.tsx:16,47-60,101`、`apps/api/src/modules/quiz/quiz.service.ts:83-89`、`apps/api/src/modules/interview/interview.service.ts:605-618`、`apps/api/src/modules/interview/interview-view.ts:7-30`、`apps/api/src/modules/resume/resume-display.ts:34-38`

---

## §0 立靶（审计定谳 · 本席逐条亲验 @df12a054）

- **蓝本逐字（issues-master · 建议修复方式列 · 禁改写）**：
  - **#254（:290）**：横幅加「查看完整报告 →」。
  - **#257（:293）**：导出走同源代理（cookie→Bearer），站内跳转用相对路径。
  - **#232（:308）**：修法列含「与面试 action 统一错误处理（#250/#251）；**列表显示简历名与时间**」——错误处理半面已随批0 ERRMSG 刀落（quiz/page.tsx:47-60 actionErrorMessage 集成亲读在位·零触），**本刀残面仅列表显示**（batch-residual-plan `:31` 半收口定谳）。
- **现状三缺口（亲读坐实 @df12a054）**：
  1. **#254**：view-model 已产 `view_report`（`view-model.ts:112` report_ready 分支·`action: { kind: 'view_report', label: '查看完整报告' }`·模型面已有断言 `apps/web/test/web-logic.proof.ts:427`）；InterviewPanel 完成横幅 `:451-456`（`display.report &&` 卡「练习完成 · 本次练习反馈 N」）**无任何入口**，action 渲染区 `:544-558` 只认 `retry`/`view_applications` 两 kind——`view_report` 产出即死，用户完成面试后无路到报告。报告路由可达性亲读：`apps/web/app/report/[id]/page.tsx:32-35` 在位（服务端自取数·不依赖面板态；`id`=interview id，面板 `resultId` prop `:68` 同源——报告页 `:39` 即以该 id 调 `/interview/{id}/report`）。
  2. **#257**：报告页 `:37` `const base = process.env.NEXT_PUBLIC_API_BASE ?? ''` 浏览器直拼三处——`:69` 导出 `<a href={base + '/interview/' + id + '/report/export'}>`（浏览器 GET 无 Authorization 头·API 只认 Bearer `principal.guard.ts:47-55` 亲读→**401**）；`:154` 「继续这场面试」`base + '/interview/' + id`、`:167` 「回到面试列表」`base + '/interviews'`（两处**站内跳转落到 API 主机**·非 web 路由）。API 导出端点亲读：`interview.controller.ts:190-195` `GET :id/report/export`（`req.principal` 鉴权·未就绪 404 `report_not_ready`·就绪回 `text/markdown`）。同源代理先例亲读：`apps/web/app/api/privacy/export/route.ts:7-16`（getServerToken→Bearer→上游→附件透传·`!ok` 透传 status）——**修法形已在本仓在产**。边界亲读：`rg NEXT_PUBLIC_API_BASE apps/web` 全量——服务端面全部走 `API_BASE_INTERNAL ?? NEXT_PUBLIC_API_BASE` 回退形（server.ts:10 等·正确），**浏览器面 base 直拼仅 report/[id]/page.tsx:37 一处**（三消费点 :69/:154/:167）。
  3. **#232 残**：押题列表 `quiz/page.tsx:101` 仍 `{it.id.slice(0, 12)}…`；API `GET /quiz` list `quiz.service.ts:83-89` 仅 `SELECT id, status`——**简历名/时间不在返回中**，纯前端改无法落实。数据地基亲读：`resume_quiz` 表有 `resume_id`/`created_at`（`packages/db/sql/20_resume_quiz.sql:8,17`）；同域投影先例亲读：`interview.service.ts:605-618`（LEFT JOIN resume + resume_profile 取四字段）+ `interview-view.ts:16-23`（`resumeDisplayName` 映射·`resume-display.ts:34-38` 单一出处）——quiz list 镜像即可，零新推导逻辑。同形镜像面（登记不扩权）：`apps/web/app/diagnosis/page.tsx:108` 同 `id.slice(0,12)` 形（归 H5/#230 域·§2）。
- **上游行号漂登记（issues-master 旧锚 → df12a054 实测）**：#254 `view-model.ts:69`→`:112`·`InterviewPanel.tsx:405-410,487-500`→`:451-456,:544-558`；#257 `page.tsx:36,63,141,154`→`:37,:69,:154,:167`；#232 `quiz/page.tsx:18`→`:16`（:101 未漂）。漂移源=REPORT-RETRY 刀（#229）落 `page.tsx` retry_error 面 + SSE-RESILIENCE/TOKSTREAM 落 InterviewPanel——**锚以新码为准**（亲读即上列）。

## §1 范围（三件 · 逐条 file:line · 免迁移）

1. **#254 横幅加「查看完整报告」口**：InterviewPanel 渲染 `view_report` kind——推荐形：横幅块 `:451-456` 卡内（或紧随其后）加 `<Link href={'/report/' + resultId}>`（label 用 `display.action.label` 既有值「查看完整报告」·零新文案）；`import Link from 'next/link'`（顶部 imports `:7-20` 现无·需加）；备选形=`location.assign('/report/'+resultId)` 沿 `:554` view_applications 同形——**A=next/link（推荐·SPA 导航）/B=location.assign 双审裁**。view-model `:112` report_ready 分支语义/文案**零改**（只加渲染·模型面断言 `web-logic.proof.ts:427` 不翻）。
2. **#257 导出同源代理 + 站内相对路径**：
   - 新增同源代理 `apps/web/app/api/interview/[id]/report/export/route.ts`：**沿 `privacy/export/route.ts` 逐形**（`getServerToken`→无 token 401→`API_BASE_INTERNAL ?? NEXT_PUBLIC_API_BASE` 回退→上游 `GET /interview/{id}/report/export` 带 Bearer→`text/markdown; charset=utf-8` + `content-disposition: attachment` 透传·`!ok` 透传上游 status）。位形 A（推荐·可证性）=处理体抽 `apps/web/lib/api/report-export-proxy.ts`（`fetchImpl` 注入·沿 `transcribe-proxy.ts` + `transcribe-proxy.proof.ts` 先例）+ 路由薄壳；位形 B=纯薄路由（privacy/export 精确镜像·prove 走隔离库 HTTP 面）——**A/B 双审裁·本席推荐 A**。
   - `report/[id]/page.tsx`：`:69` 导出 href → 同源相对 `/api/interview/{id}/report/export`；`:154` → 相对 `/interview/{id}`；`:167` → 相对 `/interviews`；`:37` `base` 常量删除。完工后 `rg "NEXT_PUBLIC_API_BASE" apps/web` 浏览器面直拼=0（服务端回退形在产面零触）。
3. **#232 残 押题列表显简历名+时间**：
   - API：`quiz.service.ts:83-89` list 两支 SQL 扩投影——`q.created_at` + LEFT JOIN `resume r ON r.id=q.resume_id AND r.owner_user_id=q.owner_user_id` + LEFT JOIN `resume_profile rp` 取 `resume_created_at/resume_content_sha/resume_experience_hint/resume_skill_hint` 四字段（**镜像 `interview.service.ts:605-618` 投影形逐字**）→ 行映射经 `resumeDisplayName`（`resume-display.ts:34` 复用·`created_at` 序列化 ISO 沿 `interview-view.ts:14`）→ 返回 `{id, status, created_at, resume_display_name}`。`status`/`limit` 过滤、ORDER BY、LIMIT 封顶、RLS owner 谓词**语义零变**。
   - Web：`quiz/page.tsx:16` Quiz type 扩 `created_at?: string|null; resume_display_name?: string|null`；`:101` `id.slice` → 简历名+时间行——时间复用 `interviewTimeLabel`（`apps/web/lib/interview/context.ts:14-21` 导出在位）或同形（双审裁）；兜底沿 `interviewResumeLabel`（context.ts:8-12）形：`resume_display_name` null → 「未绑定简历」、时间 null → 「时间待同步」——**列表行不撒谎（无数据如实说无·禁编 id 假名）**。`statusBadge :102`/`查看 → :103-105` 零触。
4. **est live=0**：零模型外呼、零云资源、零 spend（`actualSpendCny=null` 脚注）。

## §2 非范围（划界防双改/扩权）

- **#255 恢复面（刷新 transcript 回放）/#256 显示面（第 N 题/预计 M 题）归 G3**（batch-residual-plan `:88`）；**#256 提前结束出报告 🔒D3 零触**（本刀不接 conclude 通道 UI·signalConclude 渲染 `:446-450` 已在产零触）。
- **评分语义零触**：assessment/report 生成链、overall 聚合、ScoreRing、view-model 全部分支语义（`:112` report_ready 在列）零改——本刀只做**入口/路径/列表显示**三面。
- **#230 押题 target-role、#200 带题模拟面试、#215 报告标题/真逐题** → 各归域刀零触。
- **diagnosis/page.tsx:108 同形 id.slice 镜像面默认不做**（H5/#230 域）——双审若裁收编须显式入 §3 表并加 prove 面；未裁前 Ban 扩。
- **零迁移**：`resume_quiz`/`resume`/`resume_profile` schema 零触（join 读面零 DDL）。
- **#232 错误处理半面零触**：批0 ERRMSG 刀已落（quiz/page.tsx:47-60 actionErrorMessage 集成在位）——本刀禁重做/禁改 actionErrorMessage 面。
- **零 SSOT 编辑**：LEDGER 批1 表 **#257 漏行回填归协调方**（batch-residual-plan `:119` 注记1·`product-campaign-LEDGER.md` 批1 区亲读无 #257 行）——本 REQUEST 以 issues-master `:293` 为唯一蓝本，禁代笔台账。
- 报告页信息架构其余面（三区块/海报/状态卡/`retry_error` 提示条 :102-107）零触。

## §3 逐条改动清单（file:line 全亲读 @df12a054）

| # | 面 | 锚点（亲读） | 改动 | 备注 |
|---|---|---|---|---|
| 1 | #254 面板 | `apps/web/components/InterviewPanel.tsx:451-456`（横幅块·推荐位）+ `:7-20`（imports） | view_report → Link `/report/{resultId}`，label=display.action.label | 位形 A 横幅卡内（推荐）/B action 区 `:552` 后并列·双审裁；`:544-558` 既有两 kind 零触 |
| 2 | #257 代理 | 新 `apps/web/app/api/interview/[id]/report/export/route.ts`（+形 A：`apps/web/lib/api/report-export-proxy.ts`） | cookie→Bearer→上游 export→markdown 附件透传；无 token 401；`!ok` 透传 status | `privacy/export/route.ts:7-16` 逐形先例；API 端点 `interview.controller.ts:190-195` 亲读（404 `report_not_ready` 未就绪面如实透传） |
| 3 | #257 页面 | `apps/web/app/report/[id]/page.tsx:37,:69,:154,:167` | base 删；导出→`/api/interview/{id}/report/export`；`:154`→`/interview/{id}`；`:167`→`/interviews` | `rg` 验浏览器面直拼清零；服务端回退形面零触 |
| 4 | #232 api | `apps/api/src/modules/quiz/quiz.service.ts:83-89` | list SQL 扩投影+双 LEFT JOIN→`{id,status,created_at,resume_display_name}` | 投影镜像 `interview.service.ts:605-618`；映射复用 `resume-display.ts:34`（零新推导）；过滤/排序/RLS 语义零变 |
| 5 | #232 web | `apps/web/app/quiz/page.tsx:16,:101` | Quiz type 扩；列表行 id.slice→简历名+时间+兜底 | `interviewTimeLabel`（context.ts:14-21）复用；`:102-105` 零触 |
| 6 | proofs | 新 `apps/web/test/report-export-proxy.proof.ts`（形 A）+ quiz-list 断言（隔离库·fixture 直插 resume+resume_quiz）+ 既有复跑 | §4 表 | 根 `package.json` 键注册沿 trial-grant 先例；web-logic `:427` 原值不翻 |

## §4 Prove（隔离库 · 断言表 · est live=0）

1. **#254 模型面原值**：`web:prove`（`web-logic.proof.ts`）EXIT=0 全量原值——`:427` report_ready→view_report 断言不翻；渲染面断言位形待裁（e2e/full.e2e.ts 已有 report 终态面 `:217-250` 可扩「横幅入口可达 `/report/{id}`」一行·或以 tsc+路由亲读登记 prove 限度——**双审裁·诚实登记不虚称已证**）。
2. **#257 代理面**（形 A）：新 proof 注入 fetchImpl——无 token→401；有 token→上游收到 `authorization: Bearer` 头且 URL=内部 base+`/interview/{id}/report/export`；上游 200 markdown→200 `text/markdown`+attachment 透传；上游 404 `report_not_ready`→404 透传。（形 B 则改隔离库 HTTP 面：直开导出 URL 无 cookie→401、带 cookie→200。）
3. **#232 list 面**：隔离库 fixture（resume+resume_profile+resume_quiz 三行·含 resume_id NULL 一行）→ list 返回含 `created_at`（ISO）与 `resume_display_name`（简历名；NULL 行→null）→ web 行渲染简历名+时间、null 行兜底文案；`status` 过滤/LIMIT 封顶回归断言原值。quiz 家族既有 proof 复跑（`uc-e2e-025-stale-quiz-expiry` 等·EXEC 时 rg 定位全排）EXIT=0。
4. **#257 页面静态门**：`rg "NEXT_PUBLIC_API_BASE" apps/web/app/report` =0；`rg "slice\(0, 12\)" apps/web/app/quiz` =0。
5. **tsc 三门 + web tsc EXIT=0**；既有 base 红如实登记（df12a054 基线现值·禁 retry-to-green）。期望 **EXIT=0**+断言计数如实宣布。

## §5 Ban

Ban 迁移/动 schema · Ban 触评分语义与 view-model 分支语义（§2）· Ban 重做 #232 错误处理半面 · Ban 扩 diagnosis 镜像（未裁前）· Ban 触 #255/#256/提前结束🔒D3 · Ban 站内跳转落 API 主机的任何新拼法 · Ban 编造列表假名（无数据如实兜底）· Ban 死代码删除 · Ban secrets/`.env*` 入卷 · Ban self-approve/代签 peer（alone≠dual）· Ban retry-to-green/masking/假绿叙事 · Ban SSOT 编辑（LEDGER #257 回填归协调方）· Ban push 冒充执行（docs-only 起草期）· Ban Meridian · Ban buy cloud。

## §6 Pins（十一值照抄现值 · 本刀不改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector·禁 MySQL/Qdrant 业务切流叙事）· 公开 DELETE /privacy/interview-data/:id=503（UNSTUB-ERASE supersession 现值照抄：简历/账户轨=202 软删受理·purgePending=true 恒真直至 S2 逐 sink 回执·interview-data 面仍 503 关闭·原值行零改）· `g7SuiteGreen=false` · `actualSpendCny=null`（本刀零模型外呼·零消耗）· r1Closed=false

## §7 Non-claims

本刀 ≠ #255（逐题点评持久化/transcript 恢复）· ≠ #256（进度显示/提前结束·D3 待决）· ≠ 评分/报告内容质量（横幅分数仍=签名时刻聚合·不因入口新增而变义）· ≠ 报告必成（失败态仍走 `:184-197` 重试卡在产面）· ≠ 导出格式增强（仍为 API 既有 markdown 原样透传）· ≠ 押题列表全信息架构（仅显示行替换·「用这些题去模拟面试」归 #200）· ≠ LEDGER 回填完成（归协调方）· prove 绿 ≠ 全链路 E2E covered。

## §8 STOP

本 REQUEST 为 docs-only 起草，**不授权 coding/prove 执行/实跑/push 执行面**。下一步：预执行双审（`awaiting_pre_exec_dual`）——待裁项：①#254 入口位形 A（横幅卡内·推荐）vs B（action 区并列）与导航形 next/link（推荐）vs location.assign（§1.1/§3-1）②#257 代理位形 A（lib 抽取+注入 proof·推荐）vs B（纯薄路由+隔离库 HTTP 面）（§1.2/§3-2）③#232 时间显示 helper 复用 `interviewTimeLabel` vs 同形新写（§1.3/§3-5）④diagnosis/page.tsx:108 镜像收编与否（默认不收编·§2）⑤#254 渲染面 prove 位形（e2e 扩行 vs 诚实登记限度·§4-1）。BOTH Verdict: PASS → meetwise 授权 EXEC → coding+prove 一次优先 → post-prove 双审 → meetwise 授权 nail。**Dual PASS ≠ 自动开工**（EXEC 须 meetwise 明示授权）· implementer 不自批 · **alone ≠ dual** · **STOP**。

---

*REQUEST stub · G2 report-page · Line G2 REPORT-PAGE · g2-draft · 2026-10-10 · PENDING awaiting pre-exec dual · alone ≠ dual · STOP*

*markers=0（本刀改动 12 文件 TODO/FIXME/XXX/PLACEHOLDER/待填 扫描零命中·EXEC 席自证）*

*`executed:awaiting_post_prove_dual`（G2 REPORT-PAGE EXEC 落卷·2026-10-10·g2-exec 席·协调方明示授权+pre-exec 双席 BOTH PASS·rebase 主线 `feat/mysql-schema-skeleton`@`46ff2290` 干净 1/1（`d994870c`→`ca2d99a5` docs-only 零冲突）·锚点漂移表 5 处登记入 `receipts/g2-report-page/2026-10-10-exec-prove.md`（context.ts helper 实 `:6-8`/`:10-16`·20_resume_quiz.sql resume_id 实 `:11`·quiz.service list `:83-90`+1·interview.controller export `:190-194`·余全同位）·#254=横幅卡内 `:457-466` next/link 入口+action 区 `:571-580` view_report 分支（P1 全落·静态正门 view_report=4·/report/=4）·#257=形 A lib `report-export-proxy.ts`（注入 fetchImpl）+薄壳路由 `app/api/interview/[id]/report/export/route.ts`+page 三处 base 直拼消除（`:69`→同源代理·`:155`/`:169`→站内 Link·原 `:37` base 删）+proof 6 判据（P3 全落·§4.4 双 rg=0）·#232=quiz.service list `:88-113` 扩投影双 LEFT JOIN 镜像 interview.service 形+quiz/page `:105-109` 复用 context.ts helper（P2 全落·正门 resume_display_name=3·interviewTimeLabel=2·diagnosis:108 不收编）·门禁全账：web prove 256 PASS/0 FAIL 基线原值+web typecheck 0+prove:report-export-proxy 6/6+quiz-list:prove 9/9（新·隔离库 159 迁移）+quiz:prove 复跑全绿·uc025 EXIT=1=预存钉漂红基线同值亲证（interview.controller.ts:27 begin 已带 quiz-id 头·#200 产品面浮出·G7 盘点在案·非本刀新红·归域刀）·est live=0·actualSpendCny=null·零迁移·零 secrets·pins 十一值零翻转·markers=0·⛔push·Ban self-approve·alone≠dual）*

---

## nail 落卷（2026-10-10 · post-prove 双席 BOTH PASS）

**双审结果**：席1（实现语义）+席2（用户旅程/回归）互盲复核 BOTH PASS。#257 代理三面亲证（fail-closed 401 spy 证上游零调用/URL 编码含空格 id 实证/404 report_not_ready 透传不吞·body 以 report_export_unavailable 替换与 privacy 先例同形如实未虚称）·#254 双入口构造性互斥（横幅 :457-466+action 第三支 :571-580·既有两 kind 零 diff·P1 正门 4/4 复跑）·#232 投影镜像逐字（双 LEFT JOIN/NULL 行→null·接地名断言 HINT 实证非 id 假名）·quiz-list 隔离库 9/9（0061 reference_pair fixture 成对）·回归零翻（retry 面/InterviewPanel/quiz 家族/uc025 基线同值=#200 产品面浮出归域刀）。merge 落主线 @b11d6d12。

**ENOSPC 全账**：EXEC 中段磁盘 100%（pnpm store prune 释放 16Gi 零用户数据·Docker daemon 重启）——quiz-list 首两跑失败=注册缺口+0061 约束 fixture 缺口，修正形 commit 实物可验非 masking；双席断电式独立复跑全数同值=可复现性反 masking 证。

**Status**: `nail:closed`（post-prove 双席 BOTH PASS·merge 落主线 @b11d6d12·#254/#257/#232 正式解除·批1 残 12→9·markers=0·est live=0）。
