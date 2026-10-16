# EXEC 收据 — G2 REPORT-PAGE 体验刀（#254 横幅报告口 + #257 导出同源代理/站内相对 + #232 残列表简历名时间）

**Author**: `g2-exec`（EXEC 席 · 协调方明示授权后开工 · implementer 不自批） · **Date**: 2026-10-10 · **Branch**: `line/g2-report-page`
**蓝图**: `ai-docs/delivery/harness/g2-report-page-REQUEST.md` @ `ca2d99a5`（rebase 后同点 · pre-exec 双席 BOTH PASS · 席2 P1-P4 约束性处方绑定）
**Base tip**: 主线 `feat/mysql-schema-skeleton` @ `46ff2290` · est live=0 · actualSpendCny=null · 0 Key 值接触 · 零迁移（join 读面零 DDL）

---

## §1 rebase 与锚点漂移表（逐锚亲读 @ca2d99a5）

rebase `feat/mysql-schema-skeleton`（tip `46ff2290` · 上游 docs-only 链 `4983042d` ledger + `46ff2290` harness）→ `d994870c` 干净重放为 `ca2d99a5`，1/1 零冲突（docs-only 链如预期）。

| REQUEST 锚（旧） | ca2d99a5 实测 | 漂 |
|---|---|---|
| `InterviewPanel.tsx` imports `:7-20` | `:7-20`（Link 落 `:8`） | 无漂 |
| `InterviewPanel.tsx` resultId prop `:68` | `:68` | 无漂 |
| `InterviewPanel.tsx` 横幅块 `:451-456` | `:451-456` | 无漂 |
| `InterviewPanel.tsx` action 区 `:544-558` | `:544-558` | 无漂 |
| `view-model.ts:112` report_ready→view_report | `:112` | 无漂 |
| `web-logic.proof.ts:427` 模型面断言 | `:427` | 无漂（256 PASS 内原值保持） |
| `report/[id]/page.tsx` `:37/:69/:154/:167` | `:37/:69/:154/:167` | 无漂 |
| `privacy/export/route.ts:7-16` 先例 | `:7-16` | 无漂 |
| `quiz/page.tsx` `:16/:101` | `:16/:101` | 无漂 |
| `quiz.service.ts` list `:83-89` | `:83-90` | +1 微漂（方法体；SQL 两支 `:87-88`→改后 `:99-100`） |
| `interview.service.ts` 投影形 `:605-618` | `:604-628`（:605 SELECT 起 · :617-618 双 JOIN） | 无实质漂 |
| `interview.controller.ts` export `:190-195` | `:190-194` | 微漂 |
| `context.ts` helpers（REQUEST §1.3 写 `:8-12`/`:14-21`） | `interviewResumeLabel :6-8` / `interviewTimeLabel :10-16` | **漂（席1 登记在案·本 EXEC 亲读坐实）** |
| `20_resume_quiz.sql` resume_id/created_at `:8,17` | `resume_id :11` / `created_at :18` | **漂（席1 登记 resume_id `:11` 一致）** |
| `resume-display.ts:34-38` / `interview-view.ts:7-30` | 同位 | 无漂 |

## §2 逐条落位（file:line = 改后实测）

### #254 横幅「查看完整报告」口（P1 处方绑定）

| 面 | 落位 | 说明 |
|---|---|---|
| imports | `apps/web/components/InterviewPanel.tsx:8` | `import Link from 'next/link'`（原 `:7-20` 无 · REQUEST §1.1 预告需加） |
| 横幅卡内入口（位形 A 主入口） | `InterviewPanel.tsx:457-466`（卡内 · data-testid `banner-view-report` `:461`） | `display.action.kind==='view_report'` 守卫 + `href={'/report/' + resultId}` + label=`display.action.label` 既有值（零新文案）· next/link SPA 导航 |
| action 区渲染分支 | `InterviewPanel.tsx:571-580`（data-testid `action-view-report` `:575`） | 沿 `retry`(`:544`)/`view_applications`(`:552`) 同形第三支 · kind 间构造性互斥不破坏 · 既有两 kind 零 diff |
| view-model 语义 | `lib/view-model.ts:112` 零触 | `:112` report_ready→view_report 分支原值 · `web-logic.proof.ts:427` 断言不翻（256 PASS 内含） |

**P1 静态正门**：`rg "view_report" InterviewPanel.tsx` = 4（≥1 ✓）· `rg "/report/" InterviewPanel.tsx` = 4（≥1 ✓）。
**prove 限度诚实登记（REQUEST §4-1 允许形）**：渲染面未扩 e2e 行（处方「可选增强·不做也行」）——以 tsc web 门 + `web-logic.proof.ts:427` 模型面原值 + 静态正门双 rg + 路由亲读（`app/report/[id]/page.tsx:32-35` 服务端自取数在位）登记限度，不虚称已证渲染。

### #257 导出同源代理 + 站内相对（P3 裁定=形 A lib 抽取）

| 面 | 落位 | 说明 |
|---|---|---|
| lib 抽取 | 新 `apps/web/lib/api/report-export-proxy.ts:1-23` | `proxyReportExport({apiBase, interviewId, bearerToken, fetchImpl?})` 沿 `transcribe-proxy.ts` 注入 fetchImpl 形；无 token→401 fail-closed（判据收进 lib 单一出处·离线可证）；`!ok`→透传上游 status（`||502` 兜底）；200→`text/markdown; charset=utf-8` + `content-disposition: attachment` |
| 路由薄壳 | 新 `apps/web/app/api/interview/[id]/report/export/route.ts:1-14` | `privacy/export/route.ts:7-16` 逐形镜像 · `API_BASE_INTERNAL ?? NEXT_PUBLIC_API_BASE` 回退 · `getServerToken`→lib · `dynamic='force-dynamic'` |
| 导出 href | `report/[id]/page.tsx:69` | `<a href={'/api/interview/' + id + '/report/export'}>` 同源相对（下载保留 a 标签） |
| 继续面试 | `report/[id]/page.tsx:155` | `base+'/interview/'+id` → `<Link href={'/interview/' + id}>` 站内路由 |
| 回列表 | `report/[id]/page.tsx:169` | `base+'/interviews'` → `<Link href="/interviews">` 站内路由 |
| base 常量删除 | `report/[id]/page.tsx`（原 `:37` 整行删） | 浏览器面 base 直拼消除 |
| proof | 新 `apps/web/test/report-export-proxy.proof.ts`（6 判据） | 注入 fetchImpl 离线三判据（处方）：①无 token 401+上游零调用 ②上游 URL=`apiBase+/interview/{id}/report/export`（id 编码）+Bearer 头 ③200 markdown→200+text/markdown+attachment 透传 + 404 透传 |
| prove 键 | `apps/web/package.json:12` | `prove:report-export-proxy: tsx test/report-export-proxy.proof.ts`（沿 transcribe 先例） |

**§4.4 验证门双 rg**：`rg "NEXT_PUBLIC_API_BASE" apps/web/app/report` = **0** ✓ · `rg "slice\(0, 12\)" apps/web/app/quiz` = **0** ✓。全仓 `NEXT_PUBLIC_API_BASE` 余量全为服务端回退形（`server.ts:10`/`auth-actions.ts:10`/api route 族），零触。

### #232 残 押题列表显简历名+时间（P2+P3 裁定）

| 面 | 落位 | 说明 |
|---|---|---|
| API list 扩投影 | `apps/api/src/modules/quiz/quiz.service.ts:5`（import resumeDisplayName）+ `:88-101`（list 重写） | 两支 SQL 共享 `projection`（`:88-96`）：`q.id,q.status,q.created_at,q.resume_id` + 双 LEFT JOIN（`:96-97`：`resume r ON r.id=q.resume_id AND r.owner_user_id=q.owner_user_id` + `resume_profile rp` 同形）取四派生源字段——**镜像 `interview.service.ts:605-618` 投影形逐字**；status 过滤/ORDER BY/LIMIT 封顶/asPrincipal(RLS) **语义零变**（`:99-100` 参数位形原值）；行映射（`:102-113`）经 `resumeDisplayName` 单一出处 + `created_at` ISO 序列化（沿 `interview-view.ts:14` 形）→ `{id,status,created_at,resume_display_name}`；resume_id NULL→`resume_display_name: null` |
| Web type 扩 | `apps/web/app/quiz/page.tsx:18` | `created_at?: string\|null; resume_display_name?: string\|null` |
| 列表行替换 | `apps/web/app/quiz/page.tsx:105-109`（原 `:101` id.slice 行） | `interviewResumeLabel(it.resume_display_name)` + `interviewTimeLabel(it.created_at)`——**P3 裁定=复用 context.ts helper（`:6-8`/`:10-16`）·禁同形新写 · NULL 兜底内建**（未绑定→「未绑定简历」·时间缺→「时间待同步」·列表行不撒谎禁编 id 假名） |
| 零触面 | `quiz/page.tsx:12` import 新增 · `:107` statusBadge · `:108-110` 查看 Link | `:102-105` 旧零触面（改后 :107-110）语义原值 |
| 不收编 | `apps/web/app/diagnosis/page.tsx:108` | P3 裁定=镜像不收编（H5/#230 域）·零触 |
| 隔离库 proof | 新 `apps/api/test/quiz-list.proof.ts`（9 判据） | fixture 直插 resume×2+resume_profile×1+resume_quiz×3（含 resume_id NULL 一行·按 0061 `reference_pair_chk` 成对带 privacy_epoch）+ 他人一行：扩投影 ISO/简历名接地/NULL 行 null/status 过滤/LIMIT 封顶/RLS 原值全过 |
| prove 键注册 | `apps/api/package.json:15` + root `package.json:101` + `scripts/run-e2e-isolated.mjs:1734`（ALLOWLIST）+ `:2089-2090`（command map）+ `:2592`（migrate 名单·沿 `quiz:prove:raw` 先例——首跑实证缺名单则 role 不存在） | `quiz-list:prove` 三层注册沿 `trial:grant:prove` 先例形 |

## §3 prove 逐键 EXIT 全账（隔离库 run-e2e-isolated · 零 retry-to-green · est live=0）

| 键 | 结果 | 断言计数 |
|---|---|---|
| `pnpm -C apps/web prove`（web-logic 全量） | **EXIT=0** | **256 PASS / 0 FAIL**（df12a054 基线 256 原值保持 · `:427` view_report 断言原值在列） |
| `pnpm -C apps/web typecheck` | **EXIT=0** | tsc --noEmit 干净 |
| `pnpm -C apps/web prove:report-export-proxy`（新） | **EXIT=0** | 6/6 PASS（处方三判据六断言） |
| `pnpm quiz-list:prove`（新 · 隔离库 159 迁移全链） | **EXIT=0** | 9/9 PASS（①扩投影 5 + ②过滤/封顶/RLS 回归 4） |
| `pnpm quiz:prove`（复跑 · 隔离库） | **EXIT=0** | 全 PASS（worker 进程接线 ①-⑥ 全绿 · LOCAL_ISOLATED_PROOF_RECEIPT 落盘） |
| `pnpm uc025:stale-quiz-expiry:prove`（复跑） | **EXIT=1（预存红 · 基线同值 · 非本刀新红）** | S1 FAIL=`interview.controller begin 不得带 quiz 头`正则钉——**基线亲证**：HEAD `ca2d99a5` 上 `interview.controller.ts:27` begin 已带 `@Headers('quiz-id') quizId?`（#200 带题模拟面试产品面浮出）→ 旧钉必不匹配；G7 盘点（主线 `46ff2290`）在案「uc025 产品钉漂移」22 红之一。本刀零触 interview.controller（`git diff HEAD -- apps/api/src/modules/interview/` 空）。归 uc025/#200 域刀 · GAP pins=4 如实保持 |
| apps/api tsc --noEmit（只读核查 · 非门禁） | 预存测试族红原值 | 本刀改动/新增文件 **零新误差**（`quiz.service.ts`/`quiz-list.proof.ts` rg 0 命中 · 预存红=resume.service/env-schema 族在案不动 · 禁 retry-to-green） |
| 静态正门 P1/P2/§4.4 | 全过 | P1: view_report=4·/report/=4 · P2: resume_display_name=3·interviewTimeLabel=2 · §4.4: 双 rg=0 |

**est live=0 全账**：全部 proof 零模型外呼（web-logic 纯逻辑 · report-export-proxy 注入 fetchImpl · quiz-list 纯 DB fixture · quiz:prove scriptedModelClient 注入 · uc025 静态正则）· 零云资源 · `actualSpendCny=null`。

## §4 P1-P4 处方兑现声明（席2 约束性处方 · 逐条）

| 处方 | 兑现 | 实证 |
|---|---|---|
| **P1**（#254 横幅卡内 next/link 入口 + action 区 view_report 分支 · 构造性互斥不破坏） | ✅ 全落 | 横幅 `:457-466`（next/link·`/report/{resultId}`·resultId prop `:68` 同源）+ action 区 `:571-580` 沿形第三支 · 既有 retry/view_applications 零 diff · 静态正门双 rg ≥1 |
| **P2**（#232 list 扩投影 + helper 替换 · 静态正门） | ✅ 全落 | quiz.service `:88-113`（双 LEFT JOIN 镜像 interview.service `:617-618` 形 · status/ORDER/LIMIT/asPrincipal 零变）· quiz/page `:106-107` interviewResumeLabel/interviewTimeLabel · 正门 resume_display_name=3·interviewTimeLabel=2 |
| **P3**（#257 形 A lib 抽取沿 transcribe-proxy 注入 fetchImpl · §4.4 双 rg=0 · diagnosis:108 不收编） | ✅ 全落 | `report-export-proxy.ts` lib + 薄壳路由 · proof 注入 fetchImpl · `NEXT_PUBLIC_API_BASE apps/web/app/report`=0 · diagnosis `:108` 零触 |
| **P4**（REQUEST 尾注补 markers=0 声明一行） | ✅ 全落 | REQUEST 尾部 append `executed:awaiting_post_prove_dual` 状态行内含 `markers=0` 声明（沿 entpay-slice2 append-only 先例形）· 改动 12 文件 markers 扫描（TODO/FIXME/XXX/PLACEHOLDER/待填）=0 |

## §5 边界遵守与环境事件登记（全账如实）

- **零 secrets / 零 .env 入卷** · **pins 十一值零翻转**（REQUEST §6 照抄现值）· **markers=0** · **est live=0**。
- **零迁移**：resume/resume_profile/resume_quiz schema 零 DDL（join 读面）· 零新迁移文件。
- **评分语义零触**：assessment/report 生成链、view-model 全部分支、ScoreRing、retry_error 提示条 `:102-107` 零 diff；#255/#256/提前结束🔒D3 零触；#232 错误处理半面（actionErrorMessage `:47-60`）零触。
- **⛔push**（本 commit 仅落本工作树本分支）· ⛔动主线（rebase 只重放本分支 docs commit）· ⛔触其他工作树。
- **环境事件（如实登记）**：EXEC 中段宿主机磁盘 100% 满（ENOSPC）→ `pnpm store prune` 释放无引用缓存（127Mi→16Gi 可用 · 零用户数据触碰）；Docker Desktop daemon 因磁盘满挂死 → 进程级重启恢复（容器表空无残留）· 恢复后隔离库三键全数实跑。事件不影响任何 prove 结果的真实性（quiz-list 首两跑失败=注册缺口 22023/约束 23514，修注册与 fixture 后全绿，非 retry-to-green masking）。
- **SSOT 零编辑**：LEDGER #257 漏行回填归协调方（本刀未触）· markers 声明落 REQUEST 尾注行。

## §6 Non-claims（照 REQUEST §7 原值）

本刀 ≠ #255（transcript 恢复）· ≠ #256（进度显示/提前结束·D3）· ≠ 评分/报告内容质量 · ≠ 报告必成 · ≠ 导出格式增强（API markdown 原样透传）· ≠ 押题列表全信息架构（「用这些题去模拟面试」归 #200）· ≠ LEDGER 回填完成 · prove 绿 ≠ 全链路 E2E covered · **dual verdict 待 post-prove 双审**（本收据≠自批）。

---

*G2 REPORT-PAGE EXEC 收据 · g2-exec · 2026-10-10 · alone ≠ dual*
