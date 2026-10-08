# Harness — **PRIV01-C · GAP-PRIV-01 应用层 tenant 强制接线 PR（纵深防御第二层）**（PRIV01-B 后继刀 · REQUEST docs-only · 零产品码 · backlog `:57` OPEN · DELETE=503 · PG-retained · **`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**（nail lifecycle 推进落盘 2026-10-07（本机 · Asia/Shanghai 2026-10-08 链语境）· post-prove 双审 BOTH PASS：mw-privacy-int PASS + mw-e2e-ha PASS（两处 attempt1 均裁可采 · R1 翻正「加严非放松」终核成立 · runner 第 4 处 isolatedCommand 路由追认）· meetwise 协调方正式授权 nail · **Ban self-write 条款由本授权满足**（非 implementer 自写）· 本 nail 恰 ai-docs（零产品码/零 proof/零收据已落内容触碰）· 公开 DELETE=503 · `:57` OPEN · alone ≠ dual · 详见 `execution-master-checklist.md` Line PRIV01-C NAIL 节）

> **Exec-era status（historical · retained）**: **`executed:awaiting_post_prove_dual`**（EXEC 2026-10-08 Asia/Shanghai · base 重钉 `566e3b3d`（mandated rebase）· coding 11 文件/81 触点精确接线 · prove 三段全绿 P1 35/0 + P2 163/0 + P3 9 具名红 · attempts 1,1 交 post 双审裁 · runner 三道门 + 第 4 处 isolatedCommand 分支 · 全节原样保留于 §13 · Ban self-write `post_prove_dual_pass`）

> **Pre-exec-era status（historical · retained）**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 本 commit 恰 4 文档 · 零 coding / 零 prove 执行 / 零产品码 / 零 SSOT / 零 stub 代填 · Ban coding until PRE dual BOTH PASS + meetwise AUTHORIZE · Ban self-approve · alone ≠ dual）

**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Date**: 2026-10-07（本机）· 双审 stub 名 `REQUEST-2026-10-08-priv01-wiring-*` 系协调方 mandate（Asia/Shanghai 跨日命名 · 与 PRIV01-B EXEC 落卷 2026-10-08 +0800 同链语境）
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`eef469d9`** / full `eef469d9b1305e290d41f510922c0b0795f2266f`（开工时点 origin 最新 tip · 满足预期 ≥`eef469d9` · fetch 一次成功 up-to-date：本地 ref 开工前已恰在 `eef469d9` · ff no-op · 全部引锚 @`eef469d9` 实测）
**Authority**: meetwise — docs-only REQUEST · Ban coding · Ban prove 执行 · Ban self-nail · PRE dual BOTH PASS（mw-privacy-int + mw-e2e-ha）后由 meetwise 授权「接线 coding+prove EXEC」· implementer 禁自批
**Line**: **PRIV01-C**（GAP-PRIV-01 接线刀 · 前刀 PRIV01-A 立卷 + PRIV01-B 设计已 nail @主线 · 队列 Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:31-32`）
**Worktree provenance**: `/Users/miaole/Desktop/golucky/meetwise-line-priv01wire`（`git worktree add … -b line/priv01-tenant-wiring origin/feat/mysql-schema-skeleton` · 分支恰基于 `eef469d9`）

## 0. backlog 原文与前刀 provenance（行锚 `:57` · 表头 `:55`）

原文（`ai-docs/delivery/gap-bug-backlog.md:57`）：现状「应用层 tenant 原型 additive + prove 绿；审查 **conditional**；授权根仍为 PG RLS / `asPrincipal`+`set_config`；**应用层 tenant ≠ RLS**」→ 目标「写清并 prove MySQL 时代显式强制（非 optional filter）+ 跨 owner fail-closed；privacy 清单 prove 绿前 **MUST NOT abandon RLS**」→ 拟切片「M2 等价强制设计→prove 对齐 ADR 清单；**接线 PR 另审**」。

**前刀已落（cite）**：PRIV01-A 立卷（候选 A 隔离面裁可 · prove 执行待授权 · `:774` 登记）· PRIV01-B M2 等价强制设计 `post_prove_dual_pass`（E1–E5 合同 + P-A 断言面 prove EXIT=0 **35/0** attempts 1,0 可采 + R1/R2/O1 登记 · `harness/priv01-m2-enforcement-design.md` §4.1.1/§11/§12 + checklist `:1397` NAIL 节）。**R2 归属（落卷原文）**：「E5 应用层半边（自身 id 意外 0 行 fail-closed 上抛）本 proof 不证、prove 显式归属接线 PR」（`proof:26-29` 头注 + `:180` 注释 + receipts + 设计文 §4.1.1 四处同文）——**本刀兑现 R2**。

**缺口定义一句话（本刀）**：PRIV01-B 写清了「显式强制 + 跨 owner fail-closed」的语义合同（E1–E5），但 `packages/db/src/tenant/` 四 helper 至今**零生产接线**（R1 机检 face A `hits=0` / face B `consumption=0` 钉死）；本刀把四 helper（`requireOwnerUserId`/`buildRequiredOwnerFilter`/`assertTenantPredicate`/`enforceOwnerOnRow` · `asPrincipal` 边界零触碰）按合同接进生产 owner 归属数据路径，使应用层成为 **RLS 之上的纵深防御第二层**，并兑现 E5 应用层半边 prove（R2）。

## 1. 目标（REQUEST 必写三件事）

1. **接线范围**：C 端 owner 归属数据路径逐域清单（§3 · file:line 锚 @`eef469d9`）+ 接线形态（§2 两层关系 · §3.3 形态 α/β）。
2. **Prove 方案**：R1 接线面机检**翻正** + E5 应用层半边 prove（R2 兑现）+ 既有 proof 35/0 回绿 + 端到端 NEG 面（§5 · 命令 + 期望 EXIT + attempts 全账一次优先）。
3. **本 REQUEST 只做 docs-only**：接线 coding = **EXEC 面另步**（PRE dual BOTH PASS + meetwise AUTHORIZE 后）；本 commit 零产品码、零 SSOT、零 prove 执行。

## 2. 两层关系（写死 · 与 PRIV01-B §2 同文不弱化）

| 层 | 真相 | 本刀处置 |
|----|------|----------|
| **授权根（第一层 · 唯一）** | PG RLS FORCE（`0001_baseline.sql:7`/`:63-82`/`:300-304`）+ `asPrincipal`+`set_config('app.principal_user')`（`principal.ts:945-955`）+ `provisionRuntimeLogin`（`:566-608` NOINHERIT/NOBYPASSRLS）+ `app_role` | **零触碰 · MUST NOT abandon/弱化/迁移**——`asPrincipal`/`set_config`/RLS FORCE/`app_role`/`provisionRuntimeLogin` 一字不改 |
| **应用层 tenant 强制（第二层 · 纵深防御）** | `packages/db/src/tenant/` 四 helper · additive · prove 绿 · 审查 conditional · **零生产接线**（R1 face A/B 双 0 @`eef469d9` 实测保持） | 本刀接线：生产路径在既有 `asPrincipal` 会话内按 E1–E5 调用 helper 族 |

- **接线 ≠ 授权根迁移**：应用层为纵深防御第二层**非替代**；「=RLS 等价」「已替代 RLS/授权根已迁」「prove 绿 ⇒ RLS 可降级」三类叙事 Ban（PRIV01-B §2 原样）；privacy 清单 prove 绿前 **MUST NOT abandon RLS**（`:57` 目标列逐字）；abandon 零预授权。
- **E4 层内运行**：全部接线点在既有 `asPrincipal` 会话内（BEGIN→SET LOCAL ROLE app_role→set_config→COMMIT）执行——接线**不包装、不改形、不旁路** `asPrincipal`；GUC 仍是 RLS 输入。

## 3. 接线范围（逐域 owner 过滤点 · file:line 锚 @`eef469d9`）

### 3.1 纳入范围（C 端 owner 归属数据平面 · principal=owner）

| 域 | 接线点（file:line 锚） | 现状形态 → 接线后 |
|----|------------------------|-------------------|
| **interview** | `apps/api/src/modules/interview/interview.service.ts`：`asPrincipal` 入口 `:196/:369/:401/:469/:490/:510/:553/:565/:591/:631/:639`（`:84` 头注「拥有 asPrincipal 事务边界」）· owner 谓词点 `:214/:232/:255-256/:294/:300/:311-312/:415（GUC 式）/:555-556/:598/:619-620/:629/:654-655/:664` · `guardInterviewPrivacy` `:177-190`（**E5/E3 先例原样保留不重写**）· `list` `:604-631` · db 面 `packages/db/src/interview-jobs.ts`（owner 点 `:40-42/:65-67/:80/:126/:139/:164/:185/:193-195`）· `interview-question.ts`（8 处）· `report.ts`（`:15-16/:18/:32/:44/:54/:62/:78/:83/:89`） | 谓词已存在但**散落字面**（手写 `owner_user_id=$N`/GUC 直读）→ 形态 α 收敛：入口 `requireOwnerUserId` + `buildRequiredOwnerFilter` 绑定谓词；单 id 路径 read-back `assertTenantPredicate`/`enforceOwnerOnRow`（形态 β）+ E5 0 行 fail-closed |
| **resume** | `apps/api/src/modules/resume/resume.service.ts`：`reparse` 显式谓词 `:234-235/:246/:249` + 0 行分支 `:250` · OCR confirm 路径 `:164-165` · **`list` `:208-216`（现状零 owner 谓词 · 注释「RLS:只己见」· 仅隐式 RLS）** · db 面 `packages/db/src/resume.ts`（`:63-70/:77/:87/:110/:136/:143-147/:166-181/:195-217`） | `list` 为本刀**典型增量面**：隐式 RLS-only → 形态 α 显式必选谓词（第二防御层落位）；reparse/confirm 散落字面 → 形态 α 收敛 |
| **quiz** | `apps/api/src/modules/quiz/quiz.service.ts`：`:20（INSERT WITH CHECK 路径）/:32/:37/:44/:68` · db 面 `packages/db/src/quiz-jobs.ts`（9 处） | 同 interview 收敛（形态 α+β） |
| **diagnosis** | `apps/api/src/modules/diagnosis/diagnosis.service.ts`：`:20/:33/:39/:47/:70` · db 面 `packages/db/src/diagnosis-jobs.ts`（9 处） | 同上 |
| **profile** | `apps/api/src/modules/profile/profile.service.ts`：`:37（GUC 式）`· `:52-54`（既有注释「RLS(FORCE)已限己;再显式带 owner_user_id 作纵深防御(双闸)」= 本刀先例） | GUC 直读 → `buildRequiredOwnerFilter` 绑定（双闸注释语义即本刀合同） |
| **applications（jobs 候选侧）** | `apps/api/src/modules/jobs/applications.service.ts`：入口 `:17/:37/:62/:70/:72` · db 面 `packages/db/src/recruiter.ts` 候选侧函数：`applyToJob :132` · `listMyApplications :153` · `finalizeApplication :182` · `markApplicationAssessmentUnavailable :222` · `markApplicationNoEligibleScore :265` · `startApplicationInterview :354` · `declineInvitation :437` | application↔interview↔resume owner 链显式化（形态 α+β · E5 单 id 0 行 fail-closed） |
| **notification** | `apps/api/src/modules/notification/notification.service.ts`：入口 `:14/:19/:24/:29` · db 面 `packages/db/src/notification.ts`：`insertNotification :3-5`（owner 已绑）· **`listNotifications :6-9` / `markNotificationRead :10-13` / `unreadCount :14-17` / `markAllNotificationsRead :19-22`（`owner` 形参收下但 SQL 零绑定 · 注释「RLS 限己」· 纯隐式 RLS）** | 本刀**最薄增量面**：形参已在手、谓词零绑定 → 形态 α 补 `buildRequiredOwnerFilter` 显式谓词；`markNotificationRead`/`markAllNotificationsRead` 单/批写路径加 E5 语义登记 |
| **commerce（owner 同意侧）** | `apps/api/src/modules/commerce/commerce.service.ts`：`:63-64/:86-87`（`gateway_payment_order_owner` owner 回查）· db 面 `packages/db/src/payment.ts`（10 处）/`commerce.ts`（23 处）中 owner 归属路径 | 仅限 owner 归属读写点（形态 α）· 支付网关回调/对账系统链不在本刀（§3.2） |
| **candidate-route（候选路由 · 两席一致裁定纳入）** | `packages/db/src/candidate-route.ts`（owner 点 `:50/:73/:86`） | C 端 owner 归属读写平面，与 applications/interview 候选侧**同质同链**——Ban 接线 applications 而豁免本文件留静默豁口（形态 α+β 同收敛） |

**接线清单总账**：EXEC 落地时以**接线清单（wiring manifest）**形式登记实际触点——**以文件为封套单位，每文件登记精确全量触点数（非 ≥N 下限）**，face B `== manifest` 按「文件集合 + 每文件精确计数」双断言（§5-P1）；**同文件内本刀不接线的残余 owner 路径须在 manifest 显式登记「本刀不接线残余面」+ 理由 + 归属——Ban 静默缺席**（实测例 @`eef469d9`：`interview.service.ts:673-931` 计 16 处未锚 `asPrincipal` 入口）；上表为 REQUEST 级 inventory，最终触点以 EXEC diff 为准，超出本表范围的触点 = 越权触面。

### 3.2 明确排除（出范围 · 理由写死）

| 排除面 | 理由 |
|--------|------|
| `apps/api/src/modules/privacy/**`（`privacy.service.ts:20-128` 等）+ erasure 链（0091/0125/0137/0140/0141 · uc052 · memory-vector-chunk-erasure · vector-plane-erasure） | 隐私主链/擦除链 Ban 触（本刀硬 Ban · §6）；其授权根另属 ADR 门 |
| `apps/worker/src/checkpoint-principal.ts` | 隐私主链禁改文件 · 零触碰 |
| worker/系统内部链（`apps/worker/src/interview-consumer.ts`/`quiz-consumer.ts`/`diagnosis-consumer.ts`/`memory-service.ts`/`commerce-reconcile.ts` 等 asPrincipal/owner 面） | 系统 lane 的 principal 语义（worker 身份/lease/privacy_worker_executor）≠ 用户 principal=owner 模型——第二波接线另行设计另刀另审；本刀零 worker `src/` 触碰 |
| recruiter B 端 / admin / roles 域（`recruiter.service.ts`/`admin.service.ts`/`roles.service.ts`） | 隔离模型为角色/招聘方维度（`recruiter.guard`/`admin.guard`），≠ `owner_user_id` 维度；**Ban owner 冒充 tenant**——不加 tenant/org 列、不加 membership 谓词；如需等价第二层另立设计刀 |
| `jobs` 公开读（`recruiter.ts:126` `listOpenJobs` + `:134` 公开读注释） | 公开读策略 by-design 无 owner 谓词，非归属数据路径 |
| `db-mysql`/`qdrant-store` 面与任何 migration | MySQL cutover Ban（STOPPED/superseded 原样）· schema 零变更（候选 B 伪缺口 Ban 沿袭） |

### 3.3 接线形态（两层关系落地 · E1–E5 逐条兑现）

- **形态 α（`buildRequiredOwnerFilter` 进查询构造 · E1/E2）**：owner 归属 SQL 的 owner 谓词从「散落字面/纯隐式 RLS」收敛为 helper 供给的**必选谓词对象**（`column:'owner_user_id'`+`value`）bind 进 WHERE/WITH CHECK；入口 `requireOwnerUserId`（缺/空/非串 → `tenant_owner_user_id_required` fail-closed）；**零可选开关**——第二防御层 always-on，无 flag/无 bypass 开关（可开关即「optional filter」违反 E2 · 精确裁决交 PRE dual）。
- **形态 β（`asPrincipal` 会话内断言 · E3/E4/E5）**：全部接线点在既有 `asPrincipal` 会话内执行（**不包裹、不改 `asPrincipal` 本体**）；单行 read-back/写前 `assertTenantPredicate`/`enforceOwnerOnRow`（mismatch → `tenant_owner_mismatch` · row owner 缺失 → `tenant_predicate_invalid`）；API 出面不可区分 404 `not_found_or_forbidden`（`guardInterviewPrivacy :177-190` 先例 · 不泄露存在性 oracle）。
- **E5 形态区分（R2 本刀兑现）**：
  - **正当 0 行**：list/集合端点（interview `:604-631` · resume `:208-216` · notification list）空集 = 合法空列表——谓词显式化后仍合法，E5 不适用（prove 白名单登记防误红）。
  - **自身 id 读写意外 0 行**：单 id 读/写路径（get/cancel/reparse/finalize/decline/mark-read/begin/submit 等）以己方 principal 查询意外 0 行 → **fail-closed 上抛**（404 不可区分或 `TenantEnforcementError`），**不得**静默转译为合法空结果/success=false 吞掉。

## 4. E5 应用层半边 prove 设计（R2 归本刀 · 落卷原文兑现）

- **断言面（拟 · EXEC 定稿交 PRE dual）**：对接线 manifest 内**每一单 id 路径**静态断言 (a) 必选 owner 谓词在语句形状（E2）· (b) 0 行 → fail-closed 分支存在且上抛形状正确（404 `not_found_or_forbidden` / `TenantEnforcementError` rethrow · 非空 success）；list 端点白名单归类「正当 0 行」。
- **归属切割写死**：E5 **DB 层半边**（GUC 未设 → 0 行缺省 deny）归属 PRIV01-A 候选 A 隔离面 prove（待其自身授权）——本刀零代证、零互借；**任何一方不得读作「E5 已全证」**（R2/O1 切割原样）。

## 5. Prove 方案（EXEC 面 · 授权后执行 · 本 REQUEST 零 prove）

| # | CMD（拟） | 期望 EXIT | 面 |
|---|-----------|-----------|-----|
| **P1** | `pnpm --filter @meetwise/db tenant-enforcement:prove`（CMD 不变 · `packages/db/package.json:35`） | **0** · PASS 数 = 35+Δ（Δ=E5/manifest 新增断言数 · **执行时如实宣布禁静默**）· face B 行示 `consumption=N>0` | **R1 机检翻正 + 既有 35/0 回绿** |
| **P2** | `pnpm tenant-wiring-e5:prove`（新 named script · raw=`tsx test/tenant-wiring-e5.proof.ts` @`packages/db` · 零 DB 依赖） | **0** | **E5 应用层半边**（§4 断言面 · manifest 逐项） |
| **P3** | `pnpm tenant-wiring-neg:prove`（`node scripts/run-e2e-isolated.mjs tenant-wiring-neg:prove:raw` · 一次性本 run 自有 `pgvector/pgvector:pg16` 容器：**固定 dev 口令（不落盘 · 不入 receipt）+ 随机容器名/`e2e_run_token` token + `docker port` 动态解析 PGPORT**（实锚 `run-e2e-isolated.mjs:2296-2309` · 口令 `:2299` · token `:2302` · port `:2305-2309`）· finally 自有 `rm -f` 仅该名 · 目标须登记进 runner 三道门（§7 授权触面 · 三处登记即打通）：①模块级 supported-target 数组 `:1510-1578`（缺登记即 `unsupported_e2e_target` 启动抛 · 早于容器与 migrate 门）②PG-migrate 白名单数组 `:2315-2317`（勘误 · 原 `:2313` 引锚近似）③`isolatedReceiptSources` `:93`（否则空 schema 起跑、RLS `42501` 面不可达）· **Ban 指向 dev/共享/他线 PG · Ban buy cloud**） | **0** | **端到端 NEG（跨 owner fail-closed）**：user-a 建 fixture → user-b principal 走已接线路径读/写 user-a 资源 → 应用层 throw `tenant_owner_mismatch`/`tenant_owner_user_id_required` + API 面 404 不可区分 + 写侧 RLS `42501` 双重 fail-closed；容器/PREREQ 缺 → **预期非零 EXIT 且如实记录**（Ban 换弱断言凑绿） |

- **P1 翻正细节（翻正本身交双审 · **翻正方向 = 加严非放松**：face B 从「0=未接线」翻为「>0 且受 manifest 文件封套+精确计数约束」= 断言面加严；face A 语义翻转如实叙述、深路径字面导入仍零容忍非放松）**：
  - face A（字面 `'src/tenant'` 串）：接线形态钉死 `@meetwise/db` barrel 导入（与各 service 既有导入风格一致）→ face A **保持 0**，断言语义从「零接线=绿」翻转为「**零深路径字面导入纪律=绿**」——接线禁止深路径 import，防绕 barrel（翻转如实叙述 · 非放松）；
  - face B（模块/符号引用面）：`consumption=0` → **`consumption>0` 且 == manifest**（**加严**：manifest 以文件为封套单位、每文件精确全量触点数 · 文件集合与每文件精确计数双断言 · manifest 常量随 prove 落盘 · 同文件残余面登记见 §3.1 总账）；
  - barrel 存在性断言（恰 2 条 re-export 语句 · `packages/db/src/index.ts:25-32`）**零弱化保留**（re-export ≠ consumption 归类原样）；
  - R2 头注（`proof:26-29`/`:180`）同步更新为「E5 应用层半边由本刀 P2/P3 兑现 · DB 层半边仍归 PRIV01-A」；
  - 其余 E1–E3/E4 静态钉（35/0 基线）**一字不减**——弱化任一既有断言 = 本刀失败。
- **attempts 全账 · 一次优先**：每 CMD attempts 全录（Asia/Shanghai 时间戳 + commit SHA + log/`.exit` 落 `receipts/priv01-tenant-wiring/`）· **一次通过优先 · Ban retry-to-green**；若出现确定性 harness 字串级缺陷 → 沿 PRIV01-B E-1/PRIV4 先例**交 post 双审裁可采性**，implementer 不得自裁自采；PREREQ 缺（docker/pnpm/tsx）→ 预期非零 EXIT 记录并停刀回报。
- **EXIT 契约**：全绿 ≠ `:57` CLOSED/翻行 ≠ RLS abandon 门开 ≠ tenant=RLS 等价 ≠ 授权根已迁 ≠ cutover ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ ADR 门全绿宣称 ≠ coveredCount 变化；ADR 清单门（PRIV01-B §4.2 表）仍 cite-only 零执行零复跑零 receipt（切流门 · 非本刀）。

## 6. 硬 Ban（本刀全链生效）

Ban 动 RLS 授权根（`asPrincipal`/`set_config`/RLS FORCE/`app_role`/`provisionRuntimeLogin` · **MUST NOT abandon/弱化/migrate** · `0001_baseline.sql:7`/`:63-82`/`:300-304` + `principal.ts:945-955`/`:566-608` 零触碰）· Ban 把应用层写成 RLS 等价/替代（三类等价宣称 Ban · 第二层 = 纵深防御非替代）· Ban 碰 `apps/worker/src/checkpoint-principal.ts`（隐私主链禁改文件）· Ban 碰公开 DELETE=503（`privacy.controller.ts:51-52`）· Ban 碰 privacy 主链/erasure 链（§3.2 排除面）· Ban 改共享 SSOT（backlog/checklist/matrix/queue · **`:57` 行翻转 = 本刀全链 + 双审 + 协调方 nail 后另议** · coveredCount=8 不变 · 矩阵零触碰）· Ban 顺手做 cutover/abandon 议题（M2 STOPPED/superseded 头注原样）· Ban 加 tenant/org 列或 membership 谓词（Ban owner 冒充 tenant）· Ban feature-flag/bypass 化第二防御层（拟 · 交 PRE dual 精确裁决）· Ban worker/recruiter/admin/roles 域顺手接线（§3.2）· Ban E5 两半边互借混报（app-half 归本刀 · DB-half 归 PRIV01-A · Ban 读作「E5 已全证」）· Ban secrets（Key name-only · 零 `.env*`）· Ban retry-to-green · Ban self-approve/self-nail（alone ≠ dual）· Ban force-push · Ban buy cloud · Ban 冒充 dual/代签。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · backlog `:57` OPEN · UC-052 partial。

## 7. Scope / 非目标

- **本 REQUEST（本 commit）**：恰 4 文档 docs-only（§8）· 零产品码 / 零 migration / 零 script / 零 prove 执行 / 零 SSOT 编辑 / 零 stub 代填。
- **EXEC 面（PRE dual BOTH PASS + meetwise AUTHORIZE 后 · 拟）**：§3 接线清单内生产文件（api services + `packages/db/src` 归属模块，含两席裁定纳入的 `packages/db/src/candidate-route.ts`）+ P1 翻正面（`packages/db/test/tenant-enforcement.proof.ts`）+ P2 新 proof + **P3 raw proof（`packages/db/test/tenant-wiring-neg.proof.ts`）** + **`scripts/run-e2e-isolated.mjs`（授权触面仅**三处**登记即打通：①模块级 supported-target 数组 `:1510-1578`——P3 新目标 `tenant-wiring-neg:prove:raw` 登记，缺登记即 `unsupported_e2e_target` 启动抛（`:1579`）· 早于容器与 migrate 门（rev3 复核席新实锚）②PG-migrate 白名单数组 `:2315-2317`（**勘误：rev2 `:2313` 系复核席一轮引锚近似**）③`isolatedReceiptSources` `:93`——否则空 schema 起跑、RLS `42501` 面不可达；runner 其余逻辑零改动）** + 根/包 `package.json` named script + harness/slice lifecycle 推进 + receipts。**触碰面超出授权清单 = 越权**。
- **非目标**：不动授权根 · 不动隐私/擦除链 · 不动 worker 域 · 不动 recruiter/admin/roles 域 · 不执行 ADR 门 · 零 SSOT 翻行 · 零 secrets。

## 8. Products

| Role | Path |
|------|------|
| Harness（接线设计 + prove 方案） | `ai-docs/delivery/harness/priv01-tenant-wiring.md`（本文件） |
| Slice | `ai-docs/delivery/priv01-tenant-wiring.slice.md` |
| Dual stub `mw-privacy-int` | `ai-docs/delivery/reviews/REQUEST-2026-10-08-priv01-wiring-mw-privacy-int.md`（PENDING · 不代填 Verdict） |
| Dual stub `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-10-08-priv01-wiring-mw-e2e-ha.md`（PENDING · 不代填 Verdict） |

**REQUEST 立卷 commit = 上述恰 4 文件 docs-only**（零 SSOT 编辑 · backlog/checklist/matrix/queue 不在 diff · 零产品码/migration/script/prove 执行/零 secrets）。

## 9. 双审 + 流程声明

**预执行双审**：`mw-privacy-int` + `mw-e2e-ha`（各自独立签 · alone ≠ dual · stub PENDING 不代填）。裁决点：两层关系与三类等价宣称 Ban 是否写死 · §3 接线范围/排除面是否恰当（含 notification/resume-list 增量面定性）· 形态 α/β 与 always-on 无 flag 裁决 · E5 两半边切割 · R1 翻正方案（face A 保持 0 纪律 + face B manifest 双断言 + barrel 零弱化）· P1–P3 命令与期望 EXIT · attempts 一次优先契约 · hard Ban 面 · docs-only 边界。

**流程声明**：REQUEST → 预执行双审（mw-privacy-int + mw-e2e-ha）→ meetwise 授权 → coding+prove 一次优先 EXEC → post-prove 双审 → meetwise 授权 nail。（当前停在 REQUEST · awaiting PRE dual）

---

*Harness · PRIV01-C GAP-PRIV-01 应用层 tenant 强制接线 PR（纵深防御第二层 · RLS 根零触碰 · E5 应用层半边 prove 兑现）· `post_prove_dual_pass` · 2026-10-07 立卷 / 2026-10-08 EXEC · 2026-10-07 nail（本机 · Asia/Shanghai 2026-10-08 链语境）· backlog `:57` OPEN · DELETE=503 · PG-retained · PRE dual BOTH PASS · post-prove dual BOTH PASS（attempts 1,1 可采 · R1 翻正「加严非放松」终核 · runner 第 4 处 isolatedCommand 路由追认）· alone ≠ dual · STOP*

## 13. EXEC 登记（2026-10-08 Asia/Shanghai · meetwise 协调方 AUTHORIZE 后 EXEC · coding+prove 一次优先 · `executed:awaiting_post_prove_dual`）

- **base 重钉**：fetch → origin tip `5a2994c4` → rebase 干净（REQUEST 三 commit 重放）→ **EXEC base HEAD = `566e3b3d`**（全部 prove 运行时 HEAD 亲测同值）· 上游 `eef469d9..5a2994c4` 零 src 漂移实测 · 全锚原位复核。
- **coding**：接线 manifest **11 文件 / 精确 81 触点**（文件封套+每文件精确全量计数非 ≥N）——interview 17 · resume 9 · quiz 9 · diagnosis 9 · profile 6 · notification(svc) 5 · applications 5 · commerce 3 · notification(db) 6 · recruiter 9 · candidate-route 3（两席一致裁定纳入）· 形态 α=buildRequiredOwnerFilter 进查询构造（resume.list/interview.list/notification db 四 fn 等隐式 RLS-only 面补显式必选谓词）· β=asPrincipal 会话内 E1 入口 requireOwnerUserId + 既有 fail-closed 分支见证 · 残余面 **10 类显式登记**（interview `:673-931` 16 处读侧 + guard 先例原样 · worker lane · B 端角色域 · db 深层 · Ban 链）——Ban 静默缺席兑现。
- **prove 三段全绿**：P1 `pnpm --filter @meetwise/db tenant-enforcement:prove` **EXIT=0（35/0）**——R1 翻正三断言在位：face A hits=0（零深路径字面导入纪律 · 语义翻转如实叙述）· **face B consumption=81 == manifest 81/11 文件双向精确** · barrel ===2 零弱化 · 既有 35 基线一字不减；P2 `pnpm tenant-wiring-e5:prove` **EXIT=0（163/0）**（singleId=28 fail-closed 见证 · list=16 白名单 · predicates=39 · E4 根在位）——**R2 E5 应用层半边兑现**；P3 `pnpm tenant-wiring-neg:prove` **EXIT=0（9 具名红全 PASS）**——跨 owner list/read/write fail-closed + 写路径恰一次尝试 + RLS `42501` 根在位 + own-id 正控。
- **attempts 全账**：P1 attempt1 EXIT=0 + 终态确认 attempt2 EXIT=0（manifest 重分类后一致性跑非红后重试）；P2 attempt1 **EXIT=1**（确定性 manifest 分类缺陷：14 个 α 谓词绑定子触点误标 `single-id`）→ 恰分类改标 `predicate-bind` + P2 断言分支 → attempt2 **EXIT=0**；P3 attempt1 **EXIT=1**（确定性 fixture 缺陷：notification GRANT 无 DELETE → 预清理 42501）→ 恰 fixture 修正 + 汇总行判定 → attempt2 **EXIT=0**。**两缺陷定性交 post 双审裁（沿 PRIV01-B E-1/PRIV4 先例 · 若裁不可采各自 attempt1 EXIT=1 诚实保留为终态）** · log/exit 落 `receipts/priv01-tenant-wiring/`。
- **runner 三道门 + 命令分支登记**（EXEC 后行锚见收据 §6 · 相对 rev3 引锚位移=本刀 diff 所致）：①supported-target 数组 ②PG-migrate 白名单 ③isolatedReceiptSources ④isolatedCommand 分支——runner 其余逻辑零改动（`node --check` 过）。
- **触面自检**：恰授权清单（11 生产 + runner + 两 package.json + P1 翻正面 + 新 test×3 + 收据 + 本 harness/slice 登记）· **零 principal.ts / 零 migrations / 零 privacy.controller.ts / 零 checkpoint-principal.ts / 零 worker src / 零隐私·擦除链 / 零 SSOT / 零 stub / 零 secrets（.env* ABSENT · actualSpendCny=null）**。
- **Ban self-write**：本节仅推进至 `executed:awaiting_post_prove_dual` · post-prove 双审 + R1 翻正逐字比对 + meetwise AUTHORIZE 后方可 nail · alone ≠ dual。
