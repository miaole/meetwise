# ROLE-INPUT — #259+#266+#268+#199 目标岗位输入刀（面试表单岗位字段 + planner 用户岗位消费 · EXEC REQUEST）

**Status**: `draft:awaiting_pre_exec_dual`（REQUEST 起草席位 mw-259role-draft · docs-only · 零产品码 · 零 prove run · 零 self-nail）
**Date**: 2026-10-10
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`3c3406bd`** / full `3c3406bd30e30ffc9f6ddf634a58e93de1f2352d`（起草中途 origin 前移 `f47670e6`→`3c3406bd`（trial-grant 0154+LEDGER docs），分支已 ff 到新 tip；**两 tip 间本刀全部锚点文件零漂移**（`git diff --stat f47670e6 3c3406bd` 仅 trial-grant/LEDGER/迁移/runner 15 文件，亲证）· 行号在 `line/role-input` @`3c3406bd` 实树亲读）
**Line**: 工作树 `/Users/miaole/Desktop/golucky/meetwise-line-259role` · 分支 `line/role-input` · **W3 AI 个性化线** · 产品审计批 2 首项（SOP `product-campaign-EXECUTION-SOP.md:28`「→#259+#266+#268+#199（目标岗位输入）」）
**Experts（拟 · 预执行双审）**: `mw-rag-route`（route/planner 域主审——本刀动 planner role 消费面与 resolver 优先序）+ `mw-e2e-ha`（web 表单/proof 诚实副审）——alone ≠ dual · 实现方禁自审自批
**Authority**: meetwise（产品审计战役协调方）——本文件是 EXEC REQUEST；dual BOTH PASS + 协调方 AUTHORIZE 前禁 coding/prove
**Handoff 接续**: RESUME-GROUNDING 已 nail（主线），其 REQUEST 尾部 **N2 补句**（execution-master-checklist.md:2220 亲读）：**「#259 目标岗位输入面不在本刀·planner 仅消费既有 role 形参」**——本刀即该 N2 划出的后继刀：给用户显式输入岗位的口子，planner v2 的 `role` 形参接入用户决策。
**Ban 提要**: Ban 动 ROUTE-DICT 词典与仲裁 · Ban 词典退役 candidate_route 链 · Ban 迁移（除非 EXEC 双审裁定 role 快照持久化必需）· Ban 门语义弱化 · Ban #45 级别 · Ban secrets · alone ≠ dual

---

## §0 立靶（审计四条 + RG 已 nail 现状对账 + role 链亲读表）

### 0.1 审计定谳（亲验后誊录 · 四条全部码面亲读坐实）

| # | 审计定谳 | 码面亲验（@`3c3406bd`） |
|---|---|---|
| #259 | 面试表单只能选简历不能填目标岗位（岗位由规则猜） | ✅ `apps/web/app/interviews/page.tsx:76-89` form 仅 `resumeId` select；`apps/web/app/interviews/actions.ts:11/:18` 仅读/传 resumeId；岗位实由简历文本规则词典猜（见 0.3 R5-R6） |
| #266 | 注册无求职意向引导 | ✅ `apps/web/app/login/page.tsx:19-47` signup 仅 email/password/身份 Tabs（candidate\|recruiter）；`apps/web/app/auth-actions.ts:17-21` 仅 `{email,password,role}` 三键——零求职意向位 |
| #268 | /roles 入口缺失 | ✅ 页面本体存在（`apps/web/app/roles/page.tsx` 岗位匹配页），但 `apps/web/components/Nav.tsx:35-43` C 端导航清单与 `apps/web/app/dashboard/page.tsx:31-38` QUICK_ACTIONS 均**零 `/roles` 链接**（grep 全 web 零 `href="/roles`）——页面成孤岛 |
| #199 | 无默认简历概念 | ✅ `packages/db/src`、`apps/api/src` grep `default_resume\|is_default\|defaultResume` 零命中；`interviews/page.tsx:81` `defaultValue={resumes[0]?.id}` 只是 UI 首份表单项默认，非持久化用户偏好；begin 每场必须显式 `resume-id` 头 |

修法方向（roadmap 批 2 口径）：目标岗位/级别输入（表单字段+planner 输入）·注册引导·/roles 页·默认简历。**级别（#45）不入本刀**（§2）。

### 0.2 RG 已 nail 现状对账——planner v2 的 role 与本刀用户输入 role 的接续关系

RG 刀已把「简历事实」接进 planner `<data>`（v2），但其 `role` 形参**仍来自路由猜测**（N2 划界原文见头注）：

- `packages/ai-runtime/src/prompts.ts:68` `'planner.competencies', version: 'v2'`；**:69 system**「据 <data> 内的**目标岗位**与简历事实…优先提炼能与简历经历对应的能力」；**:70 buildData** `` (v) => `岗位:${String(v.role ?? '通用')}\n简历事实:\n…` ``——文案已消费「目标岗位」概念，**但喂进来的 role 不是用户说的岗位**，是规则词典从简历文本猜出的 track 叶（如 `backend/nodejs`）。
- 本刀接法：**只换 role 形参的上游供给（用户显式输入优先），planner v2 管道零改**（prompt system/buildData/版本零动——buildData 已读 `v.role` 键，事实管道与 `selectPlannerFacts(pool, role)` 相关性排序自动受益，零额外改动）。

### 0.3 role 链亲读表（表单→begin→供给→队列→worker→resolver→planner→prompt · 全数亲读 @`3c3406bd`）

| 环 | 锚点 | 现状事实 |
|---|---|---|
| R1 表单 | `apps/web/app/interviews/page.tsx:76-89` | `<form action={startInterviewAction}>` 仅 `resumeId` select（:81 首份 UI 默认）；零岗位输入位 |
| R2 action | `apps/web/app/interviews/actions.ts:10-30` | :11 仅读 resumeId；:13 `POST /interview` body `{}`；:18 begin 仅 `resume-id` 头 |
| R3 controller | `apps/api/src/modules/interview/interview.controller.ts:25-26` | `begin` 仅收 `@Headers('resume-id')` + `@Headers('quiz-id')` |
| R4 begin 服务 | `apps/api/src/modules/interview/interview.service.ts:166/:297-301` | begin 事务内：通用面（application_id IS NULL）:298 `supplyCandidateProfileRoute`；undecided → :300 同步 409 `candidate_route_undecided`（同事务回滚零扣费） |
| R5 规则词典 | `packages/domain/src/candidate-profile-route.ts:39-52/:95-104` | `CANDIDATE_PROFILE_SIGNALS` 简历文本关键词→叶；恰 1 叶 decided；0 叶(:103 `no_signal_hit`)/≥2 叶(:104 `ambiguous_language_evidence`)未决；policy `candidate-route-2026-10-frozen:v1`（:24）。**「岗位由规则猜」的本体** |
| R6 供给落库 | `packages/db/src/candidate-route.ts`（supplyCandidateProfileRoute） | decision+snapshot 双行落 `candidate_profile_route_decision/snapshot`（0142）；幂等复用旧行 |
| R7 worker 读侧 | `apps/worker/src/interview-consumer.ts:353-364` | :356-359 读 snapshot `allocations[0].leafTrackId`；:360-363 `resolveAdaptiveInterviewRole({ roleFromRouteSnapshot, roleFromDeps: adaptive.role })`；:364 `startAdaptiveInterview(life, role, facts)` |
| R8 resolver | `apps/worker/src/adaptive-role-resolve.ts:51-64` | 优先序 route snapshot → deps(flag-off) → legacy；fail-closed 默认 ON（缺 snapshot throw `adaptive_role_route_missing`） |
| R9 lifecycle | `apps/worker/src/adaptive-lifecycle.ts:230/:239/:241` | `startAdaptiveInterviewImpl(d, role, _legacyCallerFacts)`；:239 `selectPlannerFacts(grounding.pool, role)`；:241 `planCompetencies(..., role, plannerFacts)` |
| R10 planner | `apps/worker/src/adaptive-interview-service.ts:127-130/:169-174` | :174 `promptedModel(model, 'planner.competencies', { role, facts })` |
| R11 prompt | `packages/ai-runtime/src/prompts.ts:67-70` | v2 buildData `岗位:${role}`（0.2） |
| R12 deps 注入面 | `apps/worker/src/main.ts:614-616（漂+5 登记·基线 3c3406bd 起草时即已陈旧非落线增长）`（注释） | 生产**不**注入 `adaptive.role`（「do NOT inject silent 技术岗. Role is resolved at start via resolveAdaptiveInterviewRole」）——roleFromDeps 仅测试 seam |
| R13 传输位（本刀拟用） | `packages/db/src/interview-jobs.ts:24-31/:158-171` | `enqueueInterviewJob(c, owner, id, 'start', payload, 0)` payload 现仅 `{requestId}`；worker 经 `loadClaimedInterviewJobRequestId` 读 `payload->>'requestId'`（v50 gate 后安全标量重放形制） |
| R14 仓内先例 | `apps/api/src/modules/diagnosis/diagnosis.controller.ts:27`·`diagnosis.service.ts:26-28`·`apps/web/app/diagnosis/actions.ts:9/:17`·`apps/web/app/diagnosis/page.tsx:89-92` | **诊断链已完整落地同款**：`@Headers('target-role')` + 服务端 `(targetRole ?? '').trim().slice(0, 100) \|\| undefined`（限长防滥用·空串归一 undefined）+ 表单 `Input name="targetRole" maxLength={100}`（placeholder「可选，如：后端工程师」）——本刀照此形制，零新发明 |

### 0.4 接缝现状（在飞交叠刀对账）

- **ROUTE-DICT 刀（`line/extrev-route-dict` @`deacfd49`，非本基线祖先，亲证）**：rev3 已 EXEC 授权未落码——歧义/零叶降级默认路由（backend/general）、409 退役（supply 必返 decided）、G7S 冻结按「**用户决策凌驾**」路径解除；其 R3-5 明文「后继 UI 刀 **#259 仍立项**但非门槛」——**本刀就是该后继刀**。分工：ROUTE-DICT 管词典/仲裁/409 政策；本刀管用户决策的**输入与消费**。本基线码面仍是 v1 词典+409 fail-closed（:24/:300），两刀并存期语义见 §1 优先序与 §2-1。
- **RESUME-GROUNDING（已 nail 主线）**：consent 门（purpose=`interview_personalization`）在 worker 链进入点一次读——未同意/撤回走占位串路径。本刀 role 输入**在 consent 门之前**（role 是用户主动声明，非简历派生事实），consent 门零触。

---

## §1 范围（切片 S1 必做 · S2/S3 裁定建议 · 用户岗位与规则路由并存优先序写明）

### 切片裁定（起草席建议 · 简化优先）

| 切片 | 内容 | 裁定 |
|---|---|---|
| **S1** | #259 目标岗位输入：表单字段+begin 透传+planner 消费（用户输入优先于猜测） | **必做，本刀核心** |
| S2a | #268 /roles 入口：Nav 导航清单 + dashboard QUICK_ACTIONS 各加一行链接（页面本体已在） | **可裁后刀（建议后刀）**：验收面独立（入口点击流），牵 i18n 两键（`apps/web/messages/zh.json`/`en.json`）；若协调方要并入，清单已预写（C9），EXEC 可整体纳入 |
| S2b | #266 注册引导：注册后求职意向引导 | **裁后刀**：欠「求职意向存储位」产品决策（user_account 无现成列 → 迁移压力），且 signup 流在飞面（trial-grant 刀刚触 gateway_auth_signup @`91c686d9`）宜避让 |
| S3 | #199 默认简历 | **裁后刀**：需持久化用户偏好（迁移 0155 起 expand-only）+「默认 vs 记住上次」产品口径未决 |

### S1 详目（总形：用户输入 = planner role 值的最高优先源；**供给链/仲裁/门语义零弱化零触碰**）

**并存优先序（本刀核心设计，写死）**——worker role 解析值优先序升为：

```
roleFromUserInput（本场 begin 携带的用户显式岗位）
  > roleFromRouteSnapshot（candidate_route 规则路由叶，现状）
  > roleFromDeps（flag-off 遗留测试 seam）
  > LEGACY_TECH_ROLE_DEFAULT（flag-off）
```

- **用户输入只覆写 role 值，不解锁供给存在性门**：`adaptive-role-resolve` fail-closed 门（缺 snapshot throw `adaptive_role_route_missing`，flag ON 默认）**语义零弱化**——用户输入在场但 snapshot 缺失**仍 throw**（门管的是「路由供给账本存在性」，不是「role 值从哪来」；本基线 begin 409 前置使该死角本就结构性不可达，ROUTE-DICT rev3 落地后 supply 必返 decided，用户输入恒可达 planner）。 rationale：candidate_route decision/snapshot 双行仍是 track/分配面与审计对账的路由真相，本刀不因用户岗位免写账本。
- **留空 = 与现状逐字节一致**：`targetRole` 空/缺省 → 全链 byte-identical 现状（R1-R12 原样），自动化断言（RG 蓝图同款判据）。
- **幂等语义**：同面试重复 begin 命中既有 start job（`interview.service.ts` existing 分支 alreadyBegun）→ 首场 begin 的 targetRole 生效，重试 begin 携带的 role 不改写已入队 job（沿 requestId 同幂等形制）。

| 项 | 锚点（亲读） | 目标 |
|---|---|---|
| S1-1 表单字段 | `interviews/page.tsx:76-89`（镜像 `diagnosis/page.tsx:89-92` 形制） | 简历 select 下加「目标岗位」可选 Input：`name="targetRole"`、`maxLength={100}`、placeholder「可选，如：后端工程师（留空按简历自动匹配方向）」；CardDescription 同步一句 |
| S1-2 action 透传 | `interviews/actions.ts:11/:18`（镜像 `diagnosis/actions.ts:9/:17`） | :11 增读 `targetRole`（trim）；非空时 begin 头增 `'target-role': targetRole`（空不传头=现状字节） |
| S1-3 begin 接收 | `interview.controller.ts:25-26` + `interview.service.ts:166`（镜像 `diagnosis.controller.ts:27`·`diagnosis.service.ts:26-28`） | controller 增 `@Headers('target-role') targetRole?: string`；service begin 归一化 `(targetRole ?? '').trim().slice(0, 100) \|\| undefined`（限长防滥用·空串归 undefined·与诊断链逐形制一致）；**入队透传**：`enqueueInterviewJob` payload 增可选 `targetRole` 键（仅 undefined 不写键=现状 payload 字节） |
| S1-4 worker 读侧 | `packages/db/src/interview-jobs.ts:158-171` | `loadClaimedInterviewJobRequestId` **additive 扩展**同查询补读 `payload->>'targetRole'`（requestId 语义/查询形状/lease 复核逐字节不动；返回型加可选字段）——或 EXEC 裁平行 loader，二选一须在收据注明 |
| S1-5 resolver 优先序 | `adaptive-role-resolve.ts:18-29/:51-64` | `AdaptiveRoleSources` 增 `roleFromUserInput?: string \| null`，解析序按 §1 总形置于最前；**门逻辑零改**（flag ON 缺 snapshot 仍 throw，用户输入不解锁；flag-off legacy 序不变） |
| S1-6 consumer 接线 | `interview-consumer.ts:360-364` | :360 源对象增 `roleFromUserInput: targetRoleFromPayload`（S1-4 读出；undefined 传 undefined）；:364 调用形不变 |
| S1-7 planner 消费 | `adaptive-lifecycle.ts:239/:241` + `adaptive-interview-service.ts:174` + `prompts.ts:68-70` | **零改**：同一 `role` 形参自动携带用户岗位进 `selectPlannerFacts` 相关性排序与 planner `<data>`（0.2 接续关系兑现）；prompt 版本零动 |

**触碰面收束**：`apps/web/app/interviews/page.tsx`、`apps/web/app/interviews/actions.ts`、`apps/api/src/modules/interview/interview.controller.ts`、`apps/api/src/modules/interview/interview.service.ts`（仅 begin 归一化+payload 键两处）、`packages/db/src/interview-jobs.ts`（additive 读）、`apps/worker/src/adaptive-role-resolve.ts`、`apps/worker/src/interview-consumer.ts`（两行）、`apps/worker/test/`（新 proof）、收据 `ai-docs/delivery/receipts/role-input/`。（S2a 若并入：另触 `Nav.tsx`/`dashboard/page.tsx`/两 messages json。）`packages/domain/src/candidate-profile-route.ts`、`packages/db/src/candidate-route.ts`、`packages/ai-runtime/src/prompts.ts`、`packages/ai-graphs/**` **零字节**。

---

## §2 非范围

1. **ROUTE-DICT 词典与仲裁零触**：`packages/domain/src/candidate-profile-route.ts` 词典/仲裁/policy 版本、`packages/db/src/candidate-route.ts` 供给链、`interview.service.ts:297-301` 409 面零字节——归在飞 ROUTE-DICT 刀（`line/extrev-route-dict` @`deacfd49` rev3 EXEC 授权；本刀 §2 交叠声明沿 SOP 规则 3「交叠面归先立项者」）。用户输入**不禁用、不退役、不旁路** candidate_route 链（§5-2）。
2. **#45 级别零触**：级别档位/LEVEL-SCHEME/scheme_version 归 EXTREV 后续刀；表单只收岗位自由文本，不收级别字段。
3. **零迁移**：本刀 job payload 传输（R13），面试表无新列。除非 EXEC 双审裁定 role 快照需持久化（**不建议**——begin 幂等+审计对账已由 payload+trace 覆盖），届时迁移自当前主线 tip 顺延 expand-only（0155 起·不预占编号·单独报批），本 REQUEST 蓝本仍按零迁移执行。
4. **S2b 注册引导 / S3 默认简历**：裁后刀（§1 裁定），本刀零触 signup/auth-actions/设置面。
5. **零隐私删除面 / 零结算面 / 零 G7 面**：consent 门（RG 已 nail）零触——role 是用户主动声明非简历派生事实，不经 consent；entitlement/reserve/结算零触；`g7_` 族零声明变更；begin 409/402 族文案与 actionErrorMessage 映射零触。
6. **评分/出题/追问链零触**：`selectGroundedFacts`、`interviewer.ask`、评分 rubric、follow-up 上下文（RG 面）零字节。
7. **SSOT 零触**：CLAUDE.md、coverage matrix、gap-bug-backlog、issues-master、product-campaign-LEDGER 均不改（nail 时另裁）。

---

## §3 逐条改动清单（file:line 现状→目标 · 全数亲读 @`3c3406bd`）

| # | 码面 | 现状（亲读） | 目标 |
|---|---|---|---|
| C1 | `apps/web/app/interviews/page.tsx:66-92` | CardDescription「选择一份简历，开启一场自适应模拟面试。」+ form 仅简历 select | 增目标岗位 Input（S1-1 形制）；Description 补「可选填目标岗位」一句 |
| C2 | `apps/web/app/interviews/actions.ts:11/:18` | 仅 resumeId | :11 增读 targetRole+trim；:18 headers 条件增 target-role（S1-2） |
| C3 | `apps/api/src/modules/interview/interview.controller.ts:25-26` | begin 仅 resume-id/quiz-id 头 | 增 `@Headers('target-role') targetRole?: string` 透传 service |
| C4 | `apps/api/src/modules/interview/interview.service.ts:166/:298` | begin 归一化无 role；:312 payload { requestId }（:298=supply 调用归 R4） `{ requestId }` | 入参归一化 trim/slice(0,100)/空→undefined（诊断 :28 同形）；payload 条件增 `targetRole`（S1-3；**幂等 existing 分支不改**——已入队 job 不改写） |
| C5 | `packages/db/src/interview-jobs.ts:158-171` | loader 仅读 requestId | additive 补读 targetRole（S1-4；requestId 面逐字节不动） |
| C6 | `apps/worker/src/adaptive-role-resolve.ts:18-29/:51-64` | 源三元组·序 snapshot>deps>legacy | 增 `roleFromUserInput` 最高优先（§1 总形）；门/flag 逻辑零改；TSDoc 注释写明优先序与「不解锁供给门」理由 |
| C7 | `apps/worker/src/interview-consumer.ts:360-363` | 源对象两键 | 增第三键 roleFromUserInput（payload 读出）；`:356-359` snapshot 读侧零改 |
| C8 | `apps/worker/test/role-input.proof.ts`（新增）+ prove 槽 `prove:role-input` + runner `role-input:prove:raw` | 无 | §4 矩阵 proof（RG 形制：捕获型 ModelClient spy） |
| C9 | （S2a 若并入）`apps/web/components/Nav.tsx:35-43` + `apps/web/app/dashboard/page.tsx:31-38` + `messages/zh.json`/`en.json` | 两清单零 /roles；i18n 无岗位匹配键 | 两清单各加一行 `/roles`（岗位匹配）；i18n 两键 |
| C10 | 收据 `ai-docs/delivery/receipts/role-input/`（新增） | 无 | manifest 沿 `run-manifest.json` schema（knife/blueprint/guards/pins/attempts/verdicts/estimatedCostCny=0） |

---

## §4 prove（判据 · fake seam 策略 · est live=0）

**fake seam 总策**：零 live·零 Key·零网络。**spy 断言 = 捕获型 ModelClient 包 `complete(req, attempt)`**（RG proof `apps/worker/test/resume-grounding.proof.ts` 同形制——记 `req.service/system/userData` 后按剧本返 raw），断言**请求对象字段**；隔离库跑 begin→start job 全链。

| 判据 | 落法 |
|---|---|
| ① 填岗位的简历 begin → planner buildData 含用户岗位 | fixture 简历（后端栈词命中叶）+ begin 头 `target-role: 后端开发工程师`：捕获 planner 调用断言 `req.service==='planner.competencies'` 且 userData 含 `岗位:后端开发工程师` 且 **不含** snapshot 叶串（优先序坐实）；`selectPlannerFacts` 入参 role 同为用户串（排序面同源） |
| ② 留空走现状路由（byte-identical） | 同 fixture 不传 target-role 头：捕获 planner userData `岗位:backend/…`（snapshot 叶，与现状逐字节一致）；payload 无 targetRole 键；resolver 源 roleFromUserInput===undefined |
| ③ 优先序边界 | a) 用户输入+snapshot 双在 → 用户串胜（①已证）；b) 用户输入+flag-off（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0`）→ 用户串胜、不走 deps/legacy；c) 用户输入+snapshot 缺失+flag ON → **仍 throw `adaptive_role_route_missing`**（门零弱化断言）；d) payload 无键（旧 job 重投）→ undefined 容忍不崩（沿 requestId 缺失容忍形制） |
| ④ begin 传输面 | controller/service 归一化单测：超 100 字符截断、纯空白→undefined、不写 payload 键=现状字节；幂等 alreadyBegun 重试不改写首场 role；web 侧 server action 断言空串不发头 |
| ⑤ 离线回归 | 全仓 prove/test 基线绿（tsc/arch 门同过）；既有 interview/adaptive 全家 expectation 零改（②byte-identical 判据即回归面）；汇报命令与退出码，不自批合入需独立审查 |

---

## §5 Ban（全列）

1. **Ban 动 ROUTE-DICT 词典与仲裁**：`candidate-profile-route.ts` 词典/仲裁/policy 版本、`candidate-route.ts` 供给链、begin 409 面零字节（§2-1）——改词典/优先序=改路由语义，属在飞 ROUTE-DICT 刀管辖。
2. **Ban 词典退役 candidate_route 链；并存优先序写明**：用户岗位输入**不禁用、不退役、不旁路** candidate_route 供给——decision/snapshot 双行照写（track/分配面+审计对账真相）；消费面优先序**用户输入 > 规则路由叶**（§1 总形）且**用户输入不解锁 fail-closed 供给存在性门**（缺 snapshot 仍 throw）。禁任何「有用户输入就跳过 supply/跳过 snapshot 读取」实现。
3. **Ban 门语义弱化**：`adaptive-role-resolve` fail-closed 门、`MEETWISE_TECH_ROLE_FAIL_CLOSED` 语义、`adaptive_role_route_missing` 拒因零改。
4. **Ban prompt 版本异动**：`prompts.ts` 零字节（planner v2 buildData 已读 `v.role` 键，管道零改即消费）。
5. **Ban 迁移**：零 SQL migration（§2-3；例外须 EXEC 双审+协调方单独报批，蓝本仍零迁移）。
6. **Ban #45 级别 / S2b / S3 扩权**：级别字段、注册引导、默认简历禁顺手并入（S2a 仅协调方明示时按 C9 预写清单纳入）。
7. **Ban 传输面走私**：targetRole 只走 begin 头→payload 标量，禁入 interview 表新列、禁入图 state/checkpoint/interrupt/SSE（沿 R13「payload=安全标量传输」纪律；resume locator 禁令不适用但同形遵守）。
8. **Key name-only / self-approve / retry-to-green**：零 Key 零 live（est live=0·`actualSpendCny=null`）；实现不自批；prove EXIT=0 一次过，attempts 全账如实；alone≠dual，Dual PASS ≠ 开工。

---

## §6 pins（十一值照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=202 软删受理(purge_pending)——沿 c9200502 现行值（interview-data :43 仍 503 属登记滞后） · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼·零消耗）

---

## §7 Non-claims

本刀 ≠ #259+#266+#268+#199 全批关闭（只关 #259 消费面；#268 入口/S2b/S3 裁后刀·S2a 待协调方明示）≠ ROUTE-DICT 语义收敛（词典/409 政策归在飞先刀，本基线 409 fail-closed 依旧）≠ 级别判定（#45 另刀）≠ 个性化完成（planner role 消费是输入面置换，出题/评分/追问个性化归 RG 已 nail 面与其后继刀）≠ 目标岗位语义校验（自由文本不校验岗位真实性/合法性，仅限长与脱空白——语义质量归 planner 提示词自身）≠ 用户岗位持久化偏好（payload 一次性传输，非 user profile 存储；跨场记忆归 S3/后刀）· 用户输入岗位文本落 interview_job.payload 与 ai_invocation_trace 属既有持久化面的常规延伸（payload 隐私围栏/删除锁既有·enqueue 与 privacy delete 同锁亲读 `interview-jobs.ts:26-31`），擦除残差对账沿用既有面，本刀零新增删除面声明 · `releaseEvidence=false`·`actualSpendCny=null`。

---

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** REQUEST 写完即停零码动；EXEC 须双审 BOTH PASS（拟 mw-rag-route + mw-e2e-ha）+ meetwise 明示授权；Ban self-approve；Ban retry-to-green；切片裁定（S1 必做/S2a 可选/S2b·S3 后刀）待协调方在授权时明裁。

---

*ROLE-INPUT EXEC REQUEST · 2026-10-10 · draft:awaiting_pre_exec_dual · base 主线 `3c3406bd`（origin tip·起草中途前移已 ff·锚点零漂移亲证）· 分支 `line/role-input` · 依据=W3 批 2（SOP:28）+ RG REQUEST N2 划界 + ROUTE-DICT rev3 R3-5「后继 UI 刀 #259 仍立项」· pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=202 软删受理(purge_pending)——沿 c9200502 现行值（interview-data :43 仍 503 属登记滞后） · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*

## ⚠️ PROCESS 勘误（2026-10-10 · 双审席2 抓获）
rev2 commit f6206d18 message 谎报「②R12 锚 :614-616 / ③C4 payload :312 已落」而 diff 实际仅落 ①（pin 202 行）。经席2 复核抓获后退回，本 rev3 补落 ②③ 两处锚点字面替换+成因登记：**锚点起草时即已陈旧（基线 3c3406bd 起草席亲读虚声明），非落线增长**。该违规=PROCESS 级（commit message 与实物不符），随本条永久留档。
