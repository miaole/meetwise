# I2 B-DELIVERABLE — EXEC 落卷记账（i2b-exec 席）

**Date**: 2026-10-11 · **席**: `i2b-exec`（I2 B 端定性输出刀·三件修法） · **分支**: `line/i2-b-deliverable`（工作树 `meetwise-i2`）
**REQUEST**: `ai-docs/delivery/harness/i2-b-deliverable-REQUEST.md`（§1 W1-W3 + §4 判据 + 复审 7 条约束 E1-E7 随派单）
**Base**: `feat/mysql-schema-skeleton` @`36ded20a`（merge-base 亲证=主线 tip·origin tip 6a7a3acc 为其祖先·本地主线领先 origin 156 commits 已含全部在册落卷）· **提交前工作树 tip**: `b26a930a`（REQUEST 起草）

---

## §1 rebase 账

`git rebase feat/mysql-schema-skeleton` → **`Current branch line/i2-b-deliverable is up to date.` EXIT=0**（merge-base `36ded20aa1ce…` == 主线 tip·零冲突零重定位）。逐锚重定位照 §2 漂移表。

## §2 锚重定位漂移表（REQUEST 锚 @36ded20a · EXEC 实树 @36ded20a 亲读重钉）

| # | REQUEST 锚 | 实树重钉 | 判定 |
|---|---|---|---|
| D1（E2） | scoring_list_scorable_score_cards（REQUEST §0.3 未给迁移行号·引 0100:189-190 RLS + scoring-aggregation.ts:30-33） | **实落 `0103_scoring_deterministic_aggregation.sql:330`（CREATE）/:350（ALTER OWNER）/:354（REVOKE）/:355（GRANT EXECUTE）**；0100:267-270=score_card_app_role owner 作用域策略实线；scoring-aggregation.ts:30-33=注释行亲证零漂 | E2 成立·0160 形制照 0103/0159 双先例 |
| D2（E1-①） | 0082 触发器「本体」@0082:9-27 | 函数体 CREATE OR REPLACE 实落 0082:9-27 零漂；**触发器挂载面（trg_finalize_bound_job_application）实落 0028_application_bound_interview.sql:72-75**（AFTER UPDATE OF status ON interview→0082 函数·0082 换体即生效） | 锚补全·0082 文件零字节（git diff 空·亲证） |
| D3（E1-②） | MyApplications :372-378 / JobCandidates :379-385 | contracts/index.ts:372-378 / :381-386 亲证零漂（W1 改动后 :371-421） | 零漂 |
| D4（E1-③） | 0005 job_application DDL（status CHECK 三值 'invited','interviewing','completed'） | 0005:23 为**历史初版形**；现行状态机白名单（五值含 assessment_unavailable）实落 0082:60-71 状态迁移铁闸 + 0144 状态机规则表；0005 RLS p_party_read :40-43 在位零漂 | 初版 DDL 与现行白名单并存为既有事实·本刀零触 |
| D5 | privacy 枚举「privacy.controller.ts:23-26」 | controller 调用面 :23-26 亲证零漂；**枚举单源实落 contracts/index.ts:496**（CONSENT_PURPOSES·controller 经 ZodValidationPipe 消费） | 零漂·W3 改单源即生效 |
| D6 | jobs/page.tsx :28/:126-128/:148 · surface.ts :13/:22-29 · recruiter.ts :156-165/:371/:412-417 | 全部亲证零漂（recruiter.ts:371=completed/declined 拦截行·:412-417→rebase 后 :429-434 resume 恒等检查行） | 零漂 |

## §3 W1-W3 逐条落账（file:line = 落卷后实树）

### W1 待校准/失败区分 + 修法④（零迁移·0082 零字节）
- **C1 契约**：`packages/contracts/src/index.ts:371-378` ApplicationTerminalKind z.enum(['held','failed']) + MyApplications 增 `terminalKind: ApplicationTerminalKind.nullable().optional()`（裁定①形 a·不透传 interview 内部态名）。
- **C2 SQL join**（E3 派生口径收窄·逐字）：`packages/db/src/recruiting/recruiter.ts:155-172` listMyApplications `LEFT JOIN interview i ON i.id=a.interview_id` + `CASE WHEN a.status='assessment_unavailable' AND i.status='completed' THEN 'held' WHEN …'failed' THEN 'failed' ELSE NULL END AS "terminalKind"`（owner 谓词零改·零迁移）。
- **C3 服务端守卫**：`recruiter.ts:367-371`（StartApplicationResult 联合增 `application_held_not_retryable`）+ `recruiter.ts:429-446`（assessment_unavailable 且绑定面试 status='completed' → 新拒因返回·:373-410 G7FIX-4 in_progress 面零字节零触·'failed' 走既有恢复形）。
- **C4 409 映射**：`apps/api/src/modules/jobs/applications.service.ts:75-81`（409 `application_held_not_retryable`·message「本场面试已完成，评分待校准；无需重新开始」·既有 402 分码面零改·新拒因并列表 `apps/web/lib/jobs/application-start-error.ts:5-13` 既有四行零字节）。
- **C5 候选人两态**：`apps/web/app/jobs/page.tsx:24-39`（STATUS_LABEL 兜底改「评分暂不可用」不承诺可重试 + terminalStatusLabel 两态纯函数）+ `:138-146`（startable 收窄=仅 `terminalKind==='failed'`·held 不再渲染重试入口=修法④）+ `:170-172`（held 中性注记逐字「本场面试已完成；评分校准完成后与结果一起提供，不提供重试。」·非时间承诺 §7）。
- **C6（部分·见 §5 偏差 R-1）**：`apps/web/lib/recruiter/surface.ts:19-52` applicationStatusLabel/recruiterAssessmentLabel 扩参 terminalKind 两态（向后兼容·I2-1c 无派生 fail-closed 保持原文案）；**recruiter 列表页 `jobs/[id]/page.tsx` 零字节零触**（git diff 空·理由见 R-1）。

### W2 B 端最小定性投影（0159 形受控 DEFINER·E6 同意门嵌入）
- **C7 迁移 0160**：`packages/db/migrations/0160_b_qualitative_projection.sql`（全文 118 行）——`gateway_b_qualitative_projection(text,text)` SECURITY DEFINER SET search_path=pg_catalog,public（0159 首选形·零 ALTER OWNER=部署车属主同族惯例 0041/0155/0159）·expand-only 零表零列零触发器零策略·`SET LOCAL lock_timeout='2s'`·自包含 REVOKE/GRANT（REVOKE FROM PUBLIC,app_role,app_gateway_role + GRANT EXECUTE TO app_role·0156:318-325 纪律）。出参白名单 7 列：`disclosed, terminal_kind, competency, strong_count, mid_count, weak_count, insufficient_count`——**无 deterministic_total/score/overall/coverage 数值列**（Ban 数字分列·i2b:prove I2B-0d information_schema 结构性断言）。函数内：①owner 谓词 fail-closed（recruiter_user_id+$2+assessment_unavailable+绑定面试两源终态·0 行即空）②E6 同意门（consent_record 按 (candidate_owner,'b_qualitative_share') 查询·无同意行→disclosed=false·有→投影·**Ban 旁路由函数内承重**）③首行恒属主标记行（terminal_kind 恒可用=状态分流不进同意门·W3④ 承接）+ 维度行（question_rubric.competency 联表·disposition 三值 FILTER 计数聚合→强/中/弱·非可评分卡/coverage<1→证据不足·superseded/fenced 整卡排除照 0103 scoring_aggregate 同款）。
- **镜像**：`packages/db/sql/23_api_gateway.sql` 尾部同位追加（RX-3 受控函数族+ACL 镜像住地·函数体+ACL 与迁移**逐字节同文** 3224B·i2b:prove I2B-0e 直载比对）。
- **C8 端点**：`apps/api/src/modules/recruiter/recruiter.controller.ts:50-56`（GET `jobs/:id/applications/:applicationId/qualitative`·RecruiterGuard 门复用）+ `recruiter.service.ts:54-101`（getJob 归属预检 404 恒定壳 + 申请归属预检 + 函数 0 行同壳 404 不可区分 + 计数→档位存在性映射 [strong,mid,weak,insufficient]·**计数不出 API 面**）。
- **C9 状态页消费**：`apps/web/app/recruiter/jobs/[id]/applications/[applicationId]/page.tsx:36-45`（TIER_BADGE 强/中/弱/证据不足）+ `:98-115`（仅 assessment_unavailable 读取·BQualitativeProjection zod safeParse·terminalKind=候选列表缺位回落 qual.terminalKind）+ `:150-179`（定性区四态：读取失败中性/未同意/暂无可复核的评估记录/档位徽+排序红线注记「单申请人评估事实投影：不可用于候选人之间排序比较，不含数字评分、答题内容与证据摘录原文。」）+ `:200-208`（免责卡两态分流·主句「证据不够就不给分」零字节）。

### W3 候选人文案 + 同意门
- **C10 purpose 枚举**：`packages/contracts/src/index.ts:489-496` CONSENT_PURPOSES 增 `'b_qualitative_share'`（裁定④命名·#82 CONSENT-MIN 枚举校验面扩展·零新协议·controller 零字节）。
- **C11 触面**：`apps/web/app/jobs/actions.ts:55-75`（consentQualitativeShareAction=POST /privacy/consent {purpose} + withdrawQualitativeShareAction=DELETE /privacy/consent?purpose·沿既有三入口）+ `apps/web/app/jobs/page.tsx:46-53`（per-user 同意态读取）+ `:181-193`（isHeld 行区同意/撤回开关+现场语境文案「同意后招聘方仅可见能力维度与强/中/弱/证据不足档位，不含数字评分、答题内容与证据摘录原文；可随时撤回，撤回后立即停止展示。」）。
- **C12 测试面**：`apps/api/test/i2b.proof.ts`（新·33 断言）+ `apps/web/test/web-logic.proof.ts`（新 section·20 断言）+ `apps/api/package.json:20`（i2b:prove）+ `scripts/run-e2e-isolated.mjs:1748,:2121-2122`（runner 注册·entpay:s3 先例同形）。

## §4 E1-E7 复审约束兑现表

| 约束 | 兑现 |
|---|---|
| **E1 锚漂移三条** | §2 漂移表 D2/D3/D4 三条入账（+D1/D5/D6 全量重钉）·EXEC 重钉为准 |
| **E2 scoring_list 实落 0103:330/:354-355** | D1 亲证成立·0160 形制照 0103（OWNER/GRANT 形）+0159（本人行作用域形）双先例 |
| **E3 派生口径收窄** | C2 SQL CASE 逐字 `a.status='assessment_unavailable' AND i.status=…` 双源（completed→held/failed→failed/ELSE NULL）·C3 守卫同式·i2b:prove W1-1a/1b/1c/1d/1f/1g 全绿（含 attempt+1 恢复后再 hold 最新绑定口径） |
| **E4（裁定①-③）** | ①形 a（terminalKind 派生语义字段·不透传 interview 态名）②形 A（0160 受控 DEFINER·降级形未采）③落点 A（详情页定性区全兑·**列表行半区因隔离墙降级为兜底零改·见 R-1**） |
| **E5（裁定④-⑥）** | ④purpose=`b_qualitative_share` 进 CONSENT_PURPOSES·触面=jobs 申请行区 ⑤文案逐字值见 §3（两态徽/评估列/定性注记/拒因 message）⑥拒因 `application_held_not_retryable`·409 |
| **E6 同意门嵌入 DEFINER 函数** | 0160 ②：consent_record 查询在函数内·无同意行→disclosed=false 未披露形状·有→投影白名单·Ban 旁路（endpoint 无独立同意查询·函数内 fail-closed 承重）。consent_record SELECT：函数 definer=部署车属主角色（0041/0155/0159 gateway 族同形·0001 建表同源属主·SELECT 随属主内含）；**非属主部署变体**（definer 非 consent_record 属主且 FORCE RLS 生效）下同意行不可读→门 fail-closed 落未披露形状（宁缺勿漏·零泄漏·已如实登记于迁移头注）·i2b:prove W2-1/1b/2/8 双极性全绿（同意→披露/撤回→翻回未披露） |
| **E7（判定剩余）** | 档位映射仅 rubric disposition 三值（below/meets/exceeds→弱/中/强）+ 证据不足（非可评分卡/coverage<1）·H3 五档零依赖零预支·Ban 自造档位（i2b:prove W2-4a/4b/6/7 逐值全绿） |

## §5 执行中实证发现与处置（如实登记）

- **R-1（本刀最大偏差·REQUEST W2③ 列表行半区）**：listJobCandidates join interview 派生 terminalKind 在招聘方会话内**不可达**——interview 为候选人私有（RLS p_owner·0005:44 注释 by-design「招聘方只看到缓存状态，看不到候选人私有面试数据」），招聘方 GUC 下 join 恒 0 行（i2b:prove **attempt3** 调试探针实证 `[null,null,null]`）。处置：①listJobCandidates **还原零改**（误导性死 SQL 不留）②0160 函数增 `terminal_kind` 出参列（属主标记行恒携带·状态信号非评分非摘录**不进同意门**·W3④ 详情页状态分流承重）③详情页 terminalKind 自 0160 承接（applicationStatusLabel/recruiterAssessmentLabel/免责卡三处分流全活）④B 端列表行保持既有兜底文案零字节（fail-closed 不臆测终态）⑤i2b:prove W1-1e 翻为**隔离墙如实断言**（三申请可见∧两态信号零携带）。REQUEST「列表行仅文案分流零新查询」在隔离墙下只能兑「零新查询」半句——偏差根因= REQUEST 起草未跑证，漂移已入本表，待 post-prove 双审裁定追认。
- **R-2**：0103 铁律2 可评分卡 coverage 恒 1.0 → REQUEST「coverage<1→证据不足」为防御分支，生产 writer 不可达；score_card content-immutable 触发器禁原地改写（attempt2 实证 23514 `score_card_content_immutable`）→ prove 夹具改 0158 守门内初始态直插（pending_evidence / b_review_eligible+coverage=0.5 各一枚·断言名内如实标注夹具形）。
- **R-3**：0155/0159 gateway DEFINER 族=迁移运行角色（部署车属主）为 defainer 上下文·隔离 runner 实证 FORCE RLS 表读取全通（属主角色 bootstrap superuser）·非属主变体 fail-closed 降级已登记（见 E6 行）。

## §6 门禁 EXIT 表（全 CMD 可复跑·est live=0）

| 门 | CMD | 结果 | 判定 |
|---|---|---|---|
| rebase | `git rebase feat/mysql-schema-skeleton` | up to date·EXIT=0 | 零冲突 |
| contracts | `pnpm --filter @meetwise/contracts typecheck` | EXIT=0 | 绿 |
| web typecheck | `npx tsc --noEmit`（apps/web） | EXIT=0·0 errors | 绿 |
| db tsc | `npx tsc --noEmit`（packages/db） | EXIT=2·24 行·**与 pristine（stash 对照）逐字节同**（db-tsc-current vs db-tsc-pristine diff 空） | 基线零新增 |
| api tsc | `npx tsc --noEmit`（apps/api） | EXIT=2·30 行·**与 pristine 逐字节同**（api-tsc diff 空） | 基线零新增 |
| web prove | `pnpm --filter @meetwise/web prove` | **EXIT=0·343 PASS**（=323 基线 +20 新增 I2 section·零删改·web-logic-prove.log） | 全绿 |
| i2b:prove | `node scripts/run-e2e-isolated.mjs i2b:prove` | **EXIT=0·33/33 全绿**（i2b-prove-run5-green.log·隔离容器 0001→0160 全量+幂等） | 全绿 |
| neg:commerce | `node scripts/run-e2e-isolated.mjs neg:commerce` | **84/84 全绿**（neg-commerce.log） | 零翻 |
| entpay:s1 复验 | `node scripts/run-e2e-isolated.mjs entpay:s1:prove` | 47/48·唯一 FAIL=S1-0 链末位钉死（断言期望 last=0156·runner applied=162 last=0160 正确·**与 slice3 收据在册预存红同形同断言**·entpay-s1.log） | 预存红·零新增 |
| entpay:s2 复验 | `node scripts/run-e2e-isolated.mjs entpay:s2:prove` | 27/28·唯一 FAIL=S2-0（期望 last=0157·同上预存形·entpay-s2.log） | 预存红·零新增 |
| 0082 零字节 | `git diff -- packages/db/migrations/0082_*.sql` | 空 | 零字节 |
| 迁移面零触 | `git diff --name-only -- packages/db/migrations/` | 仅新增 0160 | 0001-0159 零字节 |
| markers | `git diff | grep ^+ | grep -iE "TODO\|FIXME\|待补\|占位\|placeholder\|R5-MARKED-RED\|fake\|stub"` | 零命中 | markers=0 |
| secrets | `git diff | grep ^+ | grep -iE "sk-…\|api_key…\|password…\|secret…"` | 零命中 | 零 secrets |
| pins | `git diff | grep ^+.*releaseEvidence/claimProductionHA` | 零命中 | 十一值零翻转 |

## §7 attempts 全账（Ban retry-to-green·全账不隐）

| attempt | 载体 | 结果 | 根因（全部 prove 侧·产品码零翻转） |
|---|---|---|---|
| 1 | i2b:prove | red（I2B-0d + myRows 42703 崩） | ①pg_type 组合类型查询取列不中 ②myRows 直查 job_application 引用不存在的 "terminalKind" 列（派生列只在视图 SQL 里）→ 改生产函数 listMyApplications 直调 + information_schema.parameters 断言 |
| 2 | i2b:prove | red×3（W1-1c/1e + score_card_content_immutable 23514 崩） | ①`?? '<missing>'` 吞 null（proof bug）②W1-1e 假设三申请同 job（实际每 seedApplication 新 job）③coverage UPDATE 被 content-immutable 触发器正确拒绝（R-2·夹具改直插） |
| 3 | i2b:prove | red×1（W1-1e） | 调试探针实证 **interview RLS 隔离墙**（招聘方会话 join 恒 null）→ 触发产品修订 R-1（0160 增 terminal_kind + listJobCandidates 还原 + W1-1e 翻墙断言）——非同码重试·设计修正 |
| 4 | i2b:prove | red×1（W1-1e） | 残留 `?? '<missing>'` 同型 proof bug（row undefined 与 null 混判）→ 显式 undefined 分支（后在 R-1 修订中整块重写为墙断言） |
| 5 | i2b:prove | **33/33 全绿** | 最终态（=提交树） |
| web prove | ×2 | 两次全绿（343 PASS） | — |

## §8 非范围零越界自查（§2 全列）

分数信号解锁零触（score/deterministicTotal/overall/coverage 数值零出参·结构性断言在卷）·0082 零字节·新申请状态值零加（assessment_unavailable 语义零改）·自造档位零加·假定性输出零加（未同意→未披露·无事实→暂无可复核）·同意门旁路零加·身份显示零触（8 位 id 保持·#223 归 I4）·企业付费/commerce/payment/0156-0159 零字节·C 端报告面零触·既有 402 分码面零改（application-start-error 既有行零字节·新拒因并列表）·评分写侧/模型/prompt 零触·talent 排序面零触（listTalentPool 零字节·git diff 亲证）·recruiter.ts :373-410 G7FIX-4 面零字节零触·H3 五档零预支·零 secrets·est live=0（零模型外呼·零真实支付·隔离容器即用即弃）。

## §9 Non-claims

prove EXIT=0 ≠ DONE（claimDone=false·完成判定走 post-prove 双审+nail）·held 语义=「校准完成后与结果一起提供」非时间承诺·定性面非招聘决策背书（页面明示不可排序比较·法务复核保留 per fix-roadmap:117）·证据摘录默认不出（门后预留·本刀零摘录渲染）·非全 B 端产品化（内部预览标注保留）·非「重试必成功」·非 0082 语义变更·B 端列表行两态分流为隔离墙下降级形态（R-1·待双审追认）。

---

*i2b-exec · 2026-10-11 · est live=0 · markers=0 · pins 十一值零翻转 · ⛔push · Ban self-approve · alone≠dual*
