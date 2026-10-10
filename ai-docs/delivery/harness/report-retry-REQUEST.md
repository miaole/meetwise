# REQUEST — **#229 报告重试刀**（审计 P1 · D2 已决五件：quarantined 重试+频控+零扣费 proof+文案+存量重排 · docs-only 起草）

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（docs-only 起草 · Ban coding · Ban prove 执行 · Ban self-approve · alone ≠ dual · 不代签 peer）
**Line**: **REPORT-RETRY**（批 1 主路径 · LEDGER `product-campaign-EXECUTION-SOP.md:27` W2 序 `:49` 批 1 验收「#229 六项」· 台账 `product-campaign-LEDGER.md:28` 🆕）
**Base tip**: `a03b9371`（`origin/feat/mysql-schema-skeleton` tip·worktree `/Users/miaole/Desktop/golucky/meetwise-line-retry229` 分支 `line/report-retry`·本文全部 file:line 于本 worktree **亲读复核**·行号漂±登记 §3 表）
**Author**: `mw-retry229-draft`（REQUEST 起草席 · 实现不自批）
**Date**: 2026-10-10
**依据**: ①审计 #229 全行（`/Users/miaole/Documents/Meetwise产品审计-更正版/issues-master.md:189`·271 条更正版·修法①-⑤**逐字誊录见 §0**·本地 `01-成品文档/` 快照上限 #184 不含本条——honesty 登记以更正版为唯一蓝本）②D2 已决（更正版 `fix-roadmap.md:281` + `:61` 落地节）③SCORE S1+S2 已落主线（`2c3a7d80` nail·`a03b9371` backfill）——**硬依赖 #40(40c) 已解**④锚点亲读：`packages/db/src/report.ts:10,50-57,60-65,73-86`、`apps/worker/src/report-worker.ts:61-72`、`apps/web/app/report/[id]/actions.ts:6-13`、`apps/web/app/report/[id]/page.tsx:51`、`apps/api/src/modules/interview/interview-report.ts:37-39`、`packages/db/test/uc-e2e-011-report-refund.proof.ts:6-8`（R2/R3 不改）

---

## §0 立靶（审计定谳 · 本席逐条亲验 @a03b9371）

- **蓝本逐字（issues-master :189 · 建议修复方式列 · 禁改写）**：「按 D2（2026-10-09 已决：失败可重试、重试不重复扣费、不退款）：① 自动重试保留现有 sweepReports（failed 指数退避重排，上限 3 次）；② 手动重试：requeueFailedReport 接受 failed\|quarantined，重排时重置 attempts/next_attempt_at（每次手动重试给一轮新的自动重试预算），加每份报告的手动重试频控防成本 DoS；retryReportAction 读返回码，非 2xx 给明确提示；③ 不重复扣费：保持"完成时 confirm 一次、confirmed 不 release、无红冲"账本规则（uc-e2e-011 R2/R3 不改），报告重试路径不得调用 reserve/confirm（加 proof 断言防回归），页面不得引导"重新开一场面试"替代重试；④ 文案："报告生成失败，系统已自动重试 N 次；你可以再次重试，不会重复扣费"；⑤ 存量已扣费无报告的用户：#40 接线后其 quarantined 报告可手动/批量重排生成，不另做补偿迁移」。
- **硬依赖 #40(40c) 已解（前置已满足·本席亲证）**：SCORE S2 已落主线（`2c3a7d80` nail「P0 chain #40 code-complete」+ `a03b9371` import 冲突双保留修）——评分卡写入+读侧切换完成，报告可成功生成（S2 收据 `receipts/extrev-score-writer/S2/2026-10-10-s2-exec-prove.md`：`interview:prove` EXIT=0·33 PASS·账本家族实卡生产同链 `enqueueReport→drain→ready`·overall=确定性聚合 63·零 `report_unavailable`；`apps/worker/src/main.ts:171-189` 生产 `loadSummary` 读 `listScorableScoreCards` 亲读）。**「报告必败」根因已除，本刀只修「重试无效/静默」的信任与金钱体验缺口。**
- **现状四缺口（亲读坐实）**：① **quarantined 手动重试静默无效**：报告页对 `failed`/`quarantined` 都渲染「重试生成」（`page.tsx:51` `unavailable` 含 quarantined）；`retryReportById` SELECT 含 `('failed','quarantined')`（`interview-report.ts:37-39`）但 `requeueFailedReport` CAS 只认 `status='failed'` 且不重置 attempts（`report.ts:60-65`）⇒ quarantined 上 404 `no_retriable_report`；② **前端吞返回码**：`retryReportAction` 对 `serverFetch` 返回的 Response 不读 `ok/status`、catch 全吞（`actions.ts:6-13`·`apps/web/lib/api/server.ts:23-30` 返回原 Response 亲读）——404/429 用户全然不知；③ **页面不承诺零扣费**：`page.tsx:171-181` 只有「生成可能因临时故障被中断,可以重新尝试生成。」，无 D2 要求的「不会重复扣费」告知，N（attempts）也未回传（`interview-report.ts:30` reportView 仅返 `{status, content}`·`page.tsx:23` Report type 无 attempts）；④ **无频控**：手动重试每次给一轮新的 3 次自动预算（attempts 重置后 sweep 再跑 3 轮模型调用），无限点击=成本 DoS 面（`ai_report` 无手动重试计数列·0001_baseline.sql:224-238 亲读）。
- **账本规则在产（零扣费承诺的地基·亲读）**：扣费唯一收口=`completeInterviewAndConfirm`（`packages/db/src/commerce.ts:162-175`·confirm+completed 同事务 CAS·幂等键=interviewId）；报告重试链路（`interview-report.ts`/`report.ts`/`report-worker.ts`）非测试代码对 reserve/confirm/release **零调用**（rg 亲证同审计 2026-10-09 复核）——③ 只需**钉住**不需**建立**。

## §1 范围（D2 五件 · 逐条 file:line · 免迁移）

1. **① 自动重试保留 sweepReports（零改动·防回归行使）**：`sweepReports`（`report.ts:73-86`·failed 指数退避 `2^attempts` 封顶 300s 重排·超限 quarantined）+ `sweepReportsOnce` 终态事件 `report_unavailable`（`report-worker.ts:61-72`）+ 常驻调度（`report-worker.ts:91-109` dispatchTick/runReportDispatcher）**全部原样保留，本刀零改其语义/参数/SQL**。本件交付物=prove §4-① 行使 + 静态锚钉（防后续刀无声改动自动重试预算）。
2. **② 手动重试解锁 quarantined + 重置预算 + 频控**：
   - `requeueFailedReport`（`report.ts:60-65`）：CAS 谓词 `status='failed'` → `status IN ('failed','quarantined')`，SET 增加 `attempts=0, next_attempt_at=NULL`（蓝本②「每次手动重试给一轮新的自动重试预算」逐字落实——quarantined/超限 failed 重排后即拥有全新 3 次自动预算）；函数名/签名/导出面（`packages/db/src/index.ts`）零变；:59 注释同步「手动重排单个失败或隔离报告」。
   - **频控（防成本 DoS·免迁移·S12 未决→建议默认待追认）**：`retryReport` 入口前置 `RateLimitService.allow('report_retry:'+interviewId, capacity, refillPerSec)`（`apps/api/src/platform/rate-limit.service.ts:12-19` 令牌桶·在产 signup 同款 b110 §1.2.6 先例）——**建议默认 capacity=3、refillPerSec=3/3600（=3 次/小时/份）·常量命名钉死可调·TASK-SOP-v2 S12「建议 3 次/小时/份」待用户追认**；超限 `429 {error:'report_retry_limited'}`（HttpException 映射既有面）。位形推荐=服务层 `interview.service.ts:618-620`（DI 注入 RateLimitService·不动 GODFN-1c 零 DI 的 interview-report.ts）；备选 B=interview_event 计数（**interview_event 无 created_at** 0001:38-46 亲读→需 payload 携带时间戳过滤·且新 kind 流经 SSE 通道需查 `interview.controller.ts:261` isTerminal 白名单面）——**A/B 由预执行双审裁，本席推荐 A**。
   - `retryReportAction`（`actions.ts:6-13`）：读 `serverFetch` 返回的 Response `ok/status`——非 2xx **不再静默吞**：推荐 redirect `/report/{id}?retry_error=report_retry_limited|no_retriable_report`，page 读 searchParams 渲染提示条（Server Component 加 searchParams 签名）；替代形=action 返回值+useActionState（需转客户端组件·改动大，不推荐）——**双审可裁**。成功路径 `revalidatePath` 原样。
3. **③ 零扣费 proof 防回归**：a) **静态门**：新 proof 内 lineOf 静态锚（沿 `apps/api/test/uc-e2e-001-nhp-fault.proof.ts:105-132` 先例）断言报告重试链路四文件（`interview-report.ts`/`report.ts`/`report-worker.ts`/`actions.ts`）对 `reserveEntitlement|confirmConsumption|releaseConsumption` 非测试调用=0；b) **动态断言**：重试全链（自动×3+手动×N）逐位断言 `availableUnits` 不变、`consumption_record` 恒 `confirmed`（无 released、无新 consumption 行）；c) **页面不引导重开面试**：`page.tsx:171-181` unavailable 卡保持「重试生成」唯一出口，④文案渲染于此，**禁新增「重新开一场面试」替代链接**（`page.tsx:149-159` interview_failed 卡的「回到列表」属面试终态域·非本刀对象零触）；d) **BLOCKED 钉翻转**：旧「quarantined 不可 requeue」诚实钉随②翻转为新语义钉（quarantined 手动重排**成功**且 consumption 仍 confirmed）——翻转清单见 §3 表第 8 行，**R2/R3 账本边界断言本体逐字节不改**（§2）。
4. **④ 文案（逐字忠实蓝本）**：「报告生成失败，系统已自动重试 N 次；你可以再次重试，不会重复扣费」渲染于 unavailable 卡（`page.tsx:171-181`）——N=`attempts`，需 `reportView`（`interview-report.ts:30`）回传 `attempts`（`getReport` 已 SELECT attempts·`report.ts:88-92` 亲读）+ `page.tsx:23` Report type 加 `attempts?: number`。频控 429 提示文案「重试太频繁，请稍后再试」（刀内补充·蓝本②「明确提示」义务派生·双审核）。
5. **⑤ 存量 quarantined 重排不补偿**：②落地后存量 `status='quarantined'` 行经**同一报告页手动重试出口**自然解锁重排生成（零特殊路径）——**不建 admin 批量重排工具、不做补偿迁移、不做退款**（蓝本⑤「不另做补偿迁移」·D2 不退款）；批量入口登记 §7 Non-claim。prove §4-⑥ 以 fixture 模拟存量行（直接 INSERT attempts≥3 quarantined）行使该出口。

## §2 非范围（划界防双改/扩权）

- **零迁移**（D2 定谳「无迁移」）：禁 0152+ 新迁移、禁改任何既有迁移、禁动 `ai_report`/`interview_event` schema（0001_baseline.sql 零触）。
- **uc-e2e-011 R2/R3 账本边界不改**：`packages/db/test/uc-e2e-011-report-refund.proof.ts` 的 R2 核心断言（:140-144 confirmed 不退/舱壁/额度不回补）与 R3 全部（:158-179 release→already_confirmed/无合法迁移）**逐字节原样**；R1/R4 零触。唯一许可触碰=该文件 :146-155「quarantined 不可 requeue」BLOCKED 钉——它钉的是本刀②要解锁的旧重试行为，翻转义务在 §3-8（这不是改 R2/R3，是把钉在重试机制上的旧诚实钉换成新语义）。
- **退款永不**（D2）：不做退款/红冲/补偿；`consumption.refunded` 态不建；`releaseConsumption` 调用面零新增。
- **sweepReports 自动重试零改动**：退避公式/上限 3/隔离语义/`report_unavailable` 事件全原样（§1.①）。
- **UC-019 regenerate 出口之外零触**：报告页信息架构（三区块/导出/海报）、`interview_failed`/`assessment_unavailable` 卡（`page.tsx:148-169`）不动。
- **#271 企业付费重试再扣面归 W4**；#204 三区块内容质量、#53-56 SSE 归各自刀。
- **零 G7 面 · 零 SSOT 编辑**（backlog/matrix/checklist/queue/issues-master 状态行归协调方）。

## §3 逐条改动清单（file:line 全亲读 @a03b9371）

| # | 面 | 锚点（亲读） | 改动 | 备注 |
|---|---|---|---|---|
| 1 | db 重排 | `packages/db/src/report.ts:60-65` | CAS `IN ('failed','quarantined')` + `attempts=0, next_attempt_at=NULL`；:59 注释更新 | 导出面零变；`report.ts:50-57,73-86` 零触 |
| 2 | api 频控 | `apps/api/src/modules/interview/interview.service.ts:618-620`（推荐位） | 注入 RateLimitService→`allow('report_retry:'+id, 3, 3/3600)`；超限抛 `429 report_retry_limited` | 阈值常量钉死可调·S12 待追认；位形 B 备选见 §1.② |
| 3 | api 读面 | `apps/api/src/modules/interview/interview-report.ts:30`（reportView 返回值） | 回传 `attempts`（:34-43 retryReportById 本体零逻辑变——SELECT 已含 quarantined·404 语义收窄为「无可重试行」） | `getReport` 已返 attempts（report.ts:88-92） |
| 4 | api 路由 | `apps/api/src/modules/interview/interview.controller.ts:181-184` | 预期零改（HttpException 429/404 自然透传） | 行号漂±登记即可 |
| 5 | web action | `apps/web/app/report/[id]/actions.ts:6-13` | 读 `r.ok/r.status`；非 2xx redirect `?retry_error=<code>`；成功 revalidatePath 原样 | 形制 A redirect（推荐）/B 返回值——双审裁 |
| 6 | web 页面 | `apps/web/app/report/[id]/page.tsx:23,51,171-181` | Report type 加 attempts；④文案逐字渲染（N=attempts）；searchParams 渲染 retry_error 提示条；不新增重开面试出口 | `page.tsx:148-169` 两卡零触 |
| 7 | 新 proof | `packages/db/test/report-retry.proof.ts` + `apps/api/test/report-retry-http.proof.ts`（命名双审可裁） | §4 六项主证+频控断言+静态 rg 门；根 `package.json` 三处键注册（run-e2e-isolated+raw+包内·trial-grant 先例） | 隔离库形制沿 uc011 |
| 8 | 旧钉翻转 | `uc-e2e-011-report-refund.proof.ts:146-155`·`uc-e2e-019-report-regenerate.proof.ts:173-200`（G3+GAP_PIN `GAP-UC019-QUARANTINE-REGEN` 退役改写）·`uc-e2e-019-report-regenerate-http.proof.ts:11-12,234-259+`（H3）·`uc-e2e-011-report-refund-http.proof.ts:194-196`（H2 钉）·`uc-e2e-001-nhp-fault.proof.ts:105,121,131-132,440-444`（static anchor 正则+F2 quarantined→404→改为 200 requeued·频控内） | 旧「quarantined 不可 requeue/BLOCKED」钉全部随②翻转为新语义钉（成功+confirmed 不变）；`report-bulkhead.proof.ts:73` failed→queued 基线保持绿（零改预期） | 每处翻转在新钉注释注明「#229 D2 已决翻转旧诚实钉·旧语义 见 git blame」 |

## §4 Prove（隔离库 · 断言表 · est live=0 · 六项+频控+回归）

1. **①注入故障自动重试至 ready**：generate 注入故障 2 次→每次 fail（退避 next_attempt_at 断言）→sweep 重排→第 3 次 good→`ready`；全程 `availableUnits` 与 consumption=`confirmed` 逐位不变（`report-bulkhead.proof.ts` 同形）。
2. **②持续故障 3 次 quarantined+手动重试解锁**：poison×3→`quarantined`+`report_unavailable(reason=max_attempts_exceeded)` 事件→HTTP `POST /interview/:id/report/retry`→200 `requeued:true` 且 `attempts=0`→good generate→`ready`。
3. **③零扣费断言**：②全链+手动重试×3 轮：额度恒 4.0、consumption 恒 `confirmed`、无 released/无新 consumption 行；静态门：重试链路四文件 reserve/confirm/release 非测试调用=0。
4. **④非 2xx 提示**：queued/ready 上重试→404 `no_retriable_report`；频控超限→429 `report_retry_limited`；两者 `retryReportAction` 不吞（redirect query 断言·web 契约面）。
5. **⑤uc011 R2/R3 原样**：`uc011:report-refund:prove`+`:http:prove` 复跑——R1/R2 核心/R3/R4 断言逐字节原样全绿；diff 唯一许可=:146-155 钉语义翻转（§3-8）。
6. **⑥存量重排**：fixture 直插 attempts≥3 `quarantined` 存量行→同一手动出口重排→ready；断言零补偿面（无 refund/无 ledger 写入·ledger snapshot byte-identical 除报告行自身）。
7. **频控**：同报告 1 小时内第 1-3 次 200、第 4 次 429；跨报告互不影响（per-interview key）；`interview:prove`/`neg:interview`/`report-bulkhead` 复跑全绿原值。期望 **EXIT=0**+断言计数如实宣布·**禁 retry-to-green**。

## §5 Ban

Ban 迁移（0152+/改旧迁移/动 ai_report·interview_event schema）· Ban 触 R2/R3 账本边界断言本体（§2 清单外零触）· Ban 退款/红冲/补偿（D2 永不）· Ban 改 sweepReports 语义/参数（§1.①）· Ban 重试链路任何 reserve/confirm/release 调用 · Ban 页面「重新开一场面试」替代出口 · Ban admin 批量重排工具（§7）· Ban 死代码删除 · Ban secrets/`.env*` 入卷 · Ban self-approve/代签 peer（alone≠dual）· Ban retry-to-green/masking/假绿叙事 · Ban SSOT 编辑 · Ban push 冒充执行（docs-only 起草期）· Ban Meridian · Ban buy cloud。

## §6 Pins（十一值照抄 · 本刀不改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector·禁 MySQL/Qdrant 业务切流叙事）· 公开 DELETE /privacy/interview-data/:id=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false

## §7 Non-claims

本刀 ≠ 批量重排入口（存量用户走报告页手动出口·admin 批量工具/运营脚本另决另刀）· ≠ 频控阈值定谳（S12 建议 3 次/小时/份**待用户追认**·常量可调·改值不需重开 REQUEST）· ≠ 频控多实例完备（RateLimitService 单实例内存·与 signup 同 seam·Redis 共享桶归 HA 簇）· ≠ 报告必成（模型持续故障仍可 failed→quarantined·本刀保证的是**可重试+不重复扣费+如实提示**）· ≠ 退款/补偿承诺（D2 已决不退·页面文案承诺的是「不重复扣费」非「失败退款」）· ≠ #204 三区块内容质量· ≠ #271 B 端重试面 · prove 绿 ≠ 全链路 E2E covered · ≠ UC-019 全 covered（仅 quarantine 出口从 BLOCKED 翻 green·GAP-UC019-QUARANTINE-REGEN 钉退役后 UC-019 收口判定归其自身刀线）。

## §8 STOP

本 REQUEST 为 docs-only 起草，**不授权 coding/prove 执行/实跑/push 执行面**。下一步：预执行双审（`awaiting_pre_exec_dual`）——待裁项：①频控位形 A（RateLimitService 服务层·推荐）vs B（interview_event 计数）（§1.②）②阈值 3 次/小时/份追认（S12·§1.②/§7）③非 2xx UX 形 redirect query vs 返回值（§1.②/§3-5）④旧钉翻转清单覆盖完整性核对（§3-8 六处）。BOTH Verdict: PASS → meetwise 授权 EXEC → coding+prove 一次优先 → post-prove 双审 → meetwise 授权 nail。implementer 不自批 · **alone ≠ dual** · **STOP**。

---

*REQUEST stub · #229 report-retry · Line REPORT-RETRY · mw-retry229-draft · 2026-10-10 · PENDING awaiting pre-exec dual · alone ≠ dual · STOP*

## rev2 补登（双席同向 FAIL 合并 · 2026-10-10）
- **翻转⑦（席1 发现·席2 独立坐实）**：`report-bulkhead.proof.ts:76` `attempts===2` 随②重置必翻（requeue 重置 0→claim+1=1≠2）——断言值/标签更新+注记「#229 D2 翻转·旧语义 git blame」；§4-⑦「全绿原值」改「除 :76 外原值」（:73 返 true 仍绿）。全仓 .attempts 消费面独立穷举确认无第 8 处（席2）。
- **附加缺口 (a)**（席2）：nhp-fault:105 `requeueOnlyFailed` 首匹配语义现锚 report.ts:52 SET 行——②后不自然翻红（假见证）·改写为主动钉新正则 `status IN ('failed','quarantined')` 锚 requeue 函数体。
- **附加缺口 (b)**（席2）：§4 prove 表补排 uc019 db/http+nhp-fault 三文件翻转后复跑与 EXIT 预期（全绿·否则禁 retry-to-green 纪律同款张力）。
- EXEC 注记：nhp-fault :135-136 C3 自披露字符串（F2b/no_retriable_report/quarantined）保留于新钉注释防 C3 自红。
