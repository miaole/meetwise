# I3 JOB-MGMT EXEC 收据 · 2026-10-11

分支 `line/i3-job-mgmt` @ 0f2ff494（base f3a54577·merge-base 与主线 83a940c7 亲证·全触面 `git diff HEAD 83a940c7 -- <触面>` 零漂移实测）。预执行双审 BOTH PASS（席1 盘点裁定 + 席2 验收回归·互盲独立）+ 协调方本次派单 = §8 开工授权。⛔push · est live=0 · markers=0 · 零迁移 · pins 十一值零翻转。

## 一、逐簇实施（§1 三簇·裁决项落点）

### 簇① 编辑/下线接线（#220）
- contracts registry 补两操作注册 + 路由读面/重试共四注册（additive）：`packages/contracts/src/index.ts` apiContract `updateJob`（PATCH /recruiter/jobs/{id}·request=UpdateJobDto）/`closeJob`（POST …/close）/`getJobRoute`（GET …/route）/`retryJobRoute`（POST …/route-retry）。
- **裁决①采纳**：HTTP 形 = PATCH /recruiter/jobs/:id + POST /recruiter/jobs/:id/close（controller `recruiter.controller.ts` 四端点·RecruiterGuard/PrincipalGuard 既有门内）。
- **裁决②采纳（registry response 如实化）**：createJob `response: JobView` → `JobCreated`（`{id}` 单键·实回形状同源）；`JobView` 退役为读面专用（getJob/listJobs/browseJobs 维持）。UpdateJobDto 原样前移至 recruiter DTO 区（apiContract 静态求值 TDZ 需先声明·冻结语义零改·原位留勘注）。
- closeJob 三臂语义保持：非自有/不存在 → 404；closed 再 close → db `rowCount=0` false → 同 404 恒定壳（无存在性信号）；open → closed → 200 `{closed:true}`（service `recruiter.service.ts` close()）。
- UI：JobCreateForm 加 JD 字段（name=description·maxLength=8000·后端 CreateJobDto 原生上限）；actions.ts createJobAction 透传 description + 新增 updateJobAction/closeJobAction/retryJobRouteAction；列表页 routes 旁车徽 + 详情页岗位管理卡（JobAdminPanel：编辑表单/下线二次确认「确认下线该岗位？下线后候选人不可再投递。」/重试仅 route_unresolved 态）。
- 编辑后自动重路由：零新增管道——service update() 接线既有 db updateJob（:108 写新 revision route_pending）+ notifyWorkerJobWakeup（R2 P-API 组合根同 createJob 先例）→ sole worker drain 认领。

### 簇② 路由可见 + 显式重试（#219）
- 读面：db `getJobRouteStatus`/`listJobRouteStatuses`（`recruiting/recruiter.ts`·最新 revision LEFT JOIN decision 摘要·零迁移 0104 表已在）；api GET /recruiter/jobs/:id/route + 列表 `routes` 旁车；web 文案单源 `apps/web/lib/recruiter/route-status.ts`（**裁决⑦**：标签含状态枚举字样「路由排队中(route_pending)/路由就绪(route_decided)/路由未决(route_unresolved)」·未知态 fail-closed「路由状态待同步」；未决警示含 reasonCodes+attemptOutcome 摘要与出路指引）。
- **裁决③采纳（重试=新 revision + 显式动作）**：db `retryJobRoute`（job_posting FOR UPDATE 行锁·最新 revision 仅 route_unresolved 才动作·经 createJobSemanticRevision 同一管道写新 revision route_pending·unresolved 旧 revision 原样留存）+ api wakeup → 既有 `listNextJobRoutePending` drain 自动认领（route-classify-consumer 零改动）。
- **sticky 枚举语义零改**：`job-route-decision.ts:181` noop 闸字节零动（本次 diff 零触该文件——亲证 `git diff --stat` 无此文件）；Ban 无界自动重试兑现（重试=招聘方显式动作·一次至多一个新 revision·already_pending/already_decided/not_retryable 幂等门）。
- **席2 登记项④落成显式断言**：recruiter-depth.proof `I3-3d`「unresolved 后同 revision classifyJobRoute 仍 noop already_unresolved（sticky 终态语义零改·零二次外发）」——可失败断言·实测 PASS（含 rejectSeamCalls.length===1 零二次外发副断言）。

### 簇③ JD 喂 planner + 宣称如实化（#258/#197）
- 表单→供给链：JobCreateForm description → createJob → 语义 revision（digest 含 description·既有链）。
- **裁决⑥采纳（读侧 join 形·禁破 worker 只读快照纪律）**：db `getJobPlannerInputForInterview`（RLS 读 interview→job_posting + **快照同源门**：live 文本 canonicalJobSemanticDigest 必须等于绑定 revision 存证 digest 才供给——岗位编辑后旧面试不喂新文本；C 端无岗位面试 job_id 空/缺快照/闭岗 → null）。worker `interview-consumer.ts` 条件化供给：JD 摘要=确定性有界截取（`JD_SUMMARY_MAX_CHARS=400`·空白折叠·零模型）+ competencies → startAdaptiveInterview 第 5 参（additive）→ planCompetencies 第 8 参 → promptedModel `job` 键。
- prompt `planner.competencies` v3→**v4**（升 version 纪律）：buildData 增 job 可选段（「岗位要求(招聘方发布·仅提示考什么能力·非难度信号)」）——**job 缺省/全空 → 与 v3 输出逐字节一致**（i3-jd-supply:prove 四态断言：缺省/仅 focus/有 job/全空·resume-grounding B1/S1-1 守卫同源）。
- **改道条件化（#197 顺手面）**：`allocations[0]` → `reduce` 按 allocationBps 最高权重取 primary（单叶与原形逐字节等价·并列取快照序首个确定性）；#259 透传线（roleFromUserInput）与 G-R2-5 fail-closed 门零触（i3-jd-supply 静态断言双锚在位）。
- **裁决⑤采纳（兑现）**：dashboard :37 「看岗位,做简历×JD 匹配。」**保留零改**——JD 已真实入链（表单→revision→planner），宣称有兑现源；同源蕴含断言 web-logic.proof `I3-4j`（宣称在 ⇒ planner 岗位段+consumer 供给门+表单 JD 三链全在）PASS。注释如实化：recruiter.service.ts 头注「岗位 competencies 驱动出题」随本面如实（簇③实现兑现注释语义·该文件区注释随四端点注释一并更新）。

## 二、验收断言（§2 七条 → 证据）

| # | 断言 | 落点 | 证据 |
|---|---|---|---|
| §2-1 | updateJob 语义变更→新 revision 2 route_pending；unchanged 零 revision；他主 null | recruiter-depth.proof I3-1a~I3-1e | `pnpm recruiter:prove` EXIT=0（57 PASS·`receipts/i3-job-mgmt/final-recruiter-prove.log`） |
| §2-2 | closeJob 三臂（false/true/false）+ close 后 apply→null（404 族 db 缝） | 同上 I3-2a~I3-2d | 同上 |
| §2-3 | mock 拒分→route_unresolved 可见+reasonCodes；**席2④ noop 显式断言**；重试→新 revision→drain 认领→翻 route_decided；幂等门 | 同上 I3-3a~I3-3i（全 mock seam 零外呼） | 同上 |
| §2-4 | 表单 JD 字段/三动作/列表徽/详情警示/文案枚举字样/fail-closed/宣称⇒供给同源 | web-logic.proof I3-4a~I3-4j + worker i3-jd-planner-supply.proof 16 断言（纯 buildData 产物断言非模型输出） | `pnpm -C apps/web prove` EXIT=0 全绿；`pnpm i3-jd-supply:prove` EXIT=0 |
| §2-5 | 四注册进 OpenAPI+UpdateJobDto 全可选+createJob response {id} 如实化+listJobs routes 旁车 additive | openapi.proof I3 八断言 | `pnpm openapi:prove` EXIT=0（92 断言） |
| §2-6 | 回归集 | neg:bend 165 条全绿（157 基线+8 新臂 401/403）EXIT=0；recruiter:prove EXIT=0；openapi:prove EXIT=0；r2-classify-job-route-prereq:prove EXIT=0；worker-wakeup:prove EXIT=0；job-route-classify-binding:prove EXIT=0 | `receipts/i3-job-mgmt/final-*.log` |
| §2-7 | markers=0 + est live=0 双声明 | 本收据 + markers-scan.txt | 见下门禁节 |

增强回归（触面邻近既有 prove·终局全 EXIT=0）：adaptive-consumer:prove（隔离 runner·EXIT=0）· role-input:prove（EXIT=0）· g7fix4:finalize:prove（applications 契约·import recruiter.ts·EXIT=0）· resume-grounding:prove:raw（planner buildData 逐字节守卫消费方·S1-1 真路径断言 PASS·EXIT=0）。首跑误用记录（如实登记）：①四目标曾按 `*:raw` 根脚本名调用——其中三个根脚本为直连形（不经隔离 runner·`database_target_missing` infra 形红非产品红）②resume-grounding 无根包装脚本（改 `node scripts/run-e2e-isolated.mjs resume-grounding:prove:raw` 绿）。typecheck：contracts EXIT=0 + web EXIT=0。

## 三、基线收据（E5·批前实测）

主树批前 4 次 neg:bend/recruiter 全数 `isolated_postgres_database_not_ready:boot`（host load 28-30 外部并行刀压载·容器手动复现 25s 就绪健康·同签名 infra 红非产品红·如实登记）；改用**基线专用 worktree**（`../meetwise-i3-base` @0f2ff494·与本树编辑解耦）一次双绿：
- `neg:bend` EXIT=0（157 条全绿）attempt 1 · `base-neg-bend.log`
- `recruiter:prove` EXIT=0（39 PASS）attempt 1 · `base-recruiter-prove.log`
终局对账：neg:bend 157→165（+8 全新臂·零删改）·recruiter:prove 39→57（+18 全新断言·既有 39 逐条原值 PASS·零删改）。

## 四、门禁

- **markers=0**：改动集新增行五类占位标记词 grep EXIT=1 亲证（`markers-scan.txt`·配方沿 i2-b/diag exec-receipt 先例）。
- **est live=0**：全 prove mock/静态——§2-3 双臂 classifyJobRoute 均注入 fake seam（rejectSeam/acceptSeam 纯函数）零 LLM；§2-4 buildData 纯函数+静态源；隔离 PG 即用即灭；零 Key 零模型外呼零生产操作零 secrets（pins 脚注 actualSpendCny=null 同源）。
- **零迁移声明**：`packages/db/migrations/` 本次 diff 零新增（本树实测基线最高 0161；H2 刀占 0162/0163 未入本树——若后续 rebase 需迁移号从 0164 起，本刀零需求）。migrate:prove 不适用（零迁移）。
- **pins 十一值零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（零触碰零叙事·SSOT 四件 ledger/residual-plan/checklist/issues-master 零触）。
- **触面机检**：`git diff --stat` 22 文件（19 改 + 3 新）恰符申报清单；工器工件 tsconfig.tsbuildinfo 已还原不入卷。申报清单：
  改：packages/contracts/src/index.ts · packages/contracts/test/openapi.proof.ts · packages/db/src/recruiting/recruiter.ts · packages/db/src/index.ts · packages/db/test/recruiter-depth.proof.ts · apps/api/src/modules/recruiter/recruiter.service.ts · apps/api/src/modules/recruiter/recruiter.controller.ts · apps/api/test/neg-bend.proof.ts · apps/web/app/recruiter/jobs/{actions.ts,JobCreateForm.tsx,page.tsx,[id]/page.tsx} · apps/web/test/web-logic.proof.ts · apps/worker/src/{interview-consumer.ts,adaptive-lifecycle.ts,adaptive-interview-service.ts} · apps/worker/package.json · package.json · ai-docs/delivery/harness/i3-job-mgmt-REQUEST.md（状态行+四处更锚）
  新：apps/web/lib/recruiter/route-status.ts · apps/web/app/recruiter/jobs/[id]/JobAdminPanel.tsx · apps/worker/test/i3-jd-planner-supply.proof.ts
  收据：receipts/i3-job-mgmt/（9 件）
- **锚漂移四处更锚**（照席1/席2 登记·REQUEST 卷只更行号不改结论·§0 免责条款授权）：①job-route-decision INSERT :119→:118（§0.2）②recruiter unchanged 短路 :98-99→:101-103（§2-1）③applications.service #227 注释 :44-51→:47-53（§0.1）④#223 第三锚补录 `jobs/[id]/applications/[applicationId]/page.tsx:131`（§0.1·留 I4 零触）。主线 83a940c7 对本刀全触面零漂移（merge-base 实测+`git diff HEAD 83a940c7 -- 触面` 空输出亲证）。

## 五、冲突预判清单（H2 line/h2-qbank-corpus @634eb645 vs 本刀）

| 文件 | H2 改动段 | 本刀改动段 | 判定 |
|---|---|---|---|
| apps/worker/src/interview-consumer.ts | import 行（getInterviewRouteSnapshot 移除）·:181 观测行删·:276-280 检索面读源切双轨·:337 targetRole 透传·:374-383 勘注 | import 行（追加 getJobPlannerInputForInterview）·:377-395 角色面改道条件化+供给读·:420 第 5 参 | **文件级交集·段级零重叠**；import 行 3-way 冲突预期（双方 additive·平凡合并）；检索段（G-R2-5 :280 区）与角色面（:377+ 区）不同 hunk |
| packages/ai-runtime/src/prompts.ts | resume-diagnosis.generate 条目+getPrompt 签名（H2 分支落后主线 #213·其线自带 3-way 冲突面） | planner.competencies 条目（v3→v4） | 同文件不同条目·hunk 不相邻·预期自动合并；H2 rebase 时其 getPrompt 区将与主线 #213 冲突（归 H2 线·与本刀无关） |
| apps/worker/src/adaptive-interview-service.ts | 检索/facet 段（+58 行） | planCompetencies 签名+注释（:170-186 区） | 段级零重叠预期 |
| apps/worker/src/adaptive-lifecycle.ts | +3 行（H2 面待其 diff 细核） | startAdaptiveInterview 签名/透传（:231-250 区） | 段级零重叠预期 |
| packages/db/src/index.ts / recruiter.ts / contracts / api / web | 零交集（H2=qbank-*/corpus/scripts/迁移 0162-0163） | 本刀主触面 | 零冲突 |
| 迁移号 | 0162/0163（其线） | 零迁移 | 零冲突·后续若本线需迁移自 0164 起号 |

## 六、陷阱自检表

| 陷阱 | 自检 |
|---|---|
| Ban 触 sticky 终态枚举语义 | `job-route-decision.ts` 零 diff（:181 noop 闸/:12-14 头注/枚举本体字节零动）；重试只写新 revision 走既有管道；I3-3d 显式断言闸仍拦 |
| Ban 无界自动重试 | retryJobRoute 幂等门（非 unresolved 不动作）+一次一 revision+招聘方显式动作；I3-3f/I3-3i 断言在位 |
| Ban 触 I4 面（邀请文案/通知/owner_user_id 回包/候选人识别） | invite/qualitative/talent/candidates 零触；#223 slice(0,8) 三锚零改（diff 无涉） |
| Ban 动 I2 已闭面/start-begin 合一链 | applications.service.ts 零 diff；held 两态/`application_held_not_retryable`/b_qualitative_share 零触（g7fix4:finalize 回归 EXIT=0 佐证） |
| Ban 迁移越权 | 零迁移（级别/题库/评分口径列未建·裁决④采纳不入） |
| Ban planner 面伪造岗位侧输入 | 供给=RLS 真读+快照同源门（digest 复核）·缺省 null 走既有路径·零 mock 进生产路径 |
| Ban 保留无兑现源宣称 | 裁决⑤兑现向：JD 全链落码+I3-4j 同源蕴含断言（宣称可删而供给不可伪的设计） |
| Ban 破 worker 只读快照纪律 | 裁决⑥读侧 join 形为 REQUEST §1-③ 明载可选项；同源门保证供给文本与绑定 revision 一致（编辑后不供给）·路由产物消费面（binding/snapshot/检索）零触 |
| #259 透传线 / G-R2-5 门 | 零触（i3-jd-supply 静态双锚+role-input:prove:raw 回归） |
| E2E 场景面 | 零新增 Playwright 场景（§3-2）·neg:bend 仅 additive 负臂 |
| retry-to-green | recruiter:prove 首跑 14 FAIL=夹具句柄 bug（jobC 常量≠createJob 自生成 id·测试代码错非产品码错）——修 prove 侧夹具句柄重跑；产品码零改绿（断言修正沿 h4 先例如实登记） |
| 调用形误用 | 四增强回归首跑 :raw 根脚本名错配（直连形缺隔离目标→infra 形红）+resume-grounding 无根包装——改正后全绿；两段误用原样登记（Ban 静默改口径） |
| push | ⛔ 零 push（全部本地） |

## 七、Non-claims

prove EXIT=0 ≠ R2 closed ≠ 路由已生效 ≠ HA ≠ releaseEvidence=false 翻转 ≠ DONE（claimDone=false·走 post-prove 双审+nail）；重试面=显式有界动作 ≠ 自动自愈；JD 喂 planner=「考哪些能力」提示段 ≠ 难度/信心信号（隔离铁律零触）≠ 匹配质量已评估（效果归 eval 面）；裁决⑦文案为如实状态披露 ≠ 产品化招聘面板（页面仍内部预览定位）；alone≠dual。

## 八、逐 prove 零外呼口径（§6）

| prove | 形 | 外呼 |
|---|---|---|
| recruiter:prove | 真 PG/RLS + mock classify seam | 零模型外呼 |
| neg:bend | 真 API harness 负路径 | 零模型外呼 |
| openapi/i3-jd-supply/web-logic/r2-prereq/binding/wakeup | 静态/纯函数 | 零 |
| adaptive-consumer/role-input/g7fix4/resume-grounding（增强） | 真 PG + scripted model | 零 |
