# B110 招聘方审核制刀 · EXEC prove 收据

**席位**: mw-b110-exec（W4 B 端线）· **日期**: 2026-10-07
**蓝本**: `ai-docs/delivery/harness/b110-REQUEST.md` @`f0a8a8ee` rev2（窄域双审 BOTH PASS · EXEC 授权由协调方明示转达）
**分支**: `line/b110-recruiter-gate`（工作树 `meetwise-line-b110`）· base `feat/mysql-schema-skeleton` @`b429aebb`
**范围**: §3 C1-C12（C5=撤销项·gateway_auth_login 零字节兑现）· est live=0 兑现（全离线本地 API + 一次性隔离 PG 容器 · 零模型外呼 · 零消耗）

## CMD | EXIT（原值全账·Ban retry-to-green：attempts 逐次如实）

| CMD | EXIT | 备注 |
|-----|------|------|
| `node scripts/run-e2e-isolated.mjs neg:bend`（attempt 1） | **1** | 3/157 红——**均系本刀新用例自身的测试前提缺陷，非产品码**：①隔离 runner 凭据剥离清单剥掉 `RAG_JOB_ROUTE_INPUT_HASH_KEY`→neg 面首个真打 HTTP 建岗用例（approve 解锁 create）缺每调用读取的 HMAC 测试键；②DB 直调 decision 非法值探针误用无 principal 上下文的 pool 连接（被 `gateway_admin_required` 先拦，测不到函数内枚举自守）。修复均在 neg-bend.proof.ts 测试码内（补测试键 `??=`·改 `asP('adminU',…)`），产品码零回退。日志 `logs/neg-bend-attempt1-fail.log` |
| `node scripts/run-e2e-isolated.mjs neg:bend`（attempt 2） | **0** | **157/157 全绿**。日志 `logs/neg-bend-attempt2.log` |
| `node scripts/run-e2e-isolated.mjs neg:bend`（attempt 3） | **0** | 仅新增两行确定性 `console.log`（§4.6 admin_audit 留痕输出入收据，断言零变化）后复跑。157/157 全绿。`logs/neg-bend-attempt3.log` |
| `node scripts/run-e2e-isolated.mjs neg:auth`（attempt 1） | **0** | 81/81 全绿（signup:ip 桶对 neg-auth 零自饥饿：其服务级 signup 仅 5 次同 IP < 容量 10；同邮箱节流用例走 per-email 短路）。`logs/neg-auth.log` |
| `node scripts/run-e2e-isolated.mjs neg:all`（attempt 1） | **1** | 五段 auth 81/commerce 84/resume 87/interview 97/bend 157 全绿；**neg:input 2/135 红=预存红**（§4.5 条款，对账见下节）。未重跑。`logs/neg-all.log` |
| `node scripts/run-e2e-isolated.mjs neg:input` @base `f0a8a8ee`（对照） | **1** | base 红 4/135 ⊇ 本刀红 2/135（同名交集，见对账节）。`logs/neg-input-BASE-f0a8a8ee.log` |
| `node scripts/run-e2e-isolated.mjs api-runtime-role:prove:raw` | **0** | runMigrations 全量含 **0152 干净应用**（expand-only+同签名换体+lock_timeout 在 runner 事务内）· login 五键契约不变（C5 镜像断言 `id,password_hash,pwd_epoch,role,status`）。`logs/api-runtime-role-http.log` |
| `node scripts/run-e2e-isolated.mjs runtime-role:prove:raw`（packages/db，§4 之外加测） | **1** | **预存红**：种子步 `interview_privacy_fenced`（0058/0062 围栏触发器，与 0152 零表交集）；base 对照同点同红同 EXIT。未修未重跑。`logs/db-runtime-role-PREEXISTING-RED.log` / `logs/db-runtime-role-BASE-f0a8a8ee.log` |
| `pnpm openapi:prove` | **0** | 73 断言全绿（apiContract inviteCandidate 换挂 InviteReceived 后 OpenAPI 生成面一致）。`logs/openapi-prove.log` |
| `pnpm -C apps/web typecheck` | **0** | web 全量 tsc 干净（admin 审批卡片/Server Action/auth-actions 分流类型面）。`logs/web-typecheck.log` |
| `pnpm -C packages/contracts typecheck` | **0** | 契约包 tsc 干净 |
| `apps/api` ad-hoc `tsc --noEmit` | （非口径） | 报错全部位于本刀零触碰的 `packages/ai-runtime`/`packages/domain`（git diff 可证）；apps/api 无 typecheck script，仓内口径不经过该直调，预存态如实登记 |

**est live=0 兑现**：全部 prove 为离线本地 API + 一次性 `meetwise-e2e-*` PG 容器；零模型/零云/零外网调用；`MODEL_API_KEY` 在 harness 内显式 delete。

## C1-C12 逐条落位表（numstat 实测）

| # | 落位 | 证据（diff/numstat） |
|---|------|------|
| C1 | `packages/db/migrations/0152_recruiter_approval_gate.sql` 新增 | lock_timeout='2s'·`ADD COLUMN IF NOT EXISTS approval_status`(DEFAULT 'approved'·CHECK 三值)·`gateway_auth_signup` recruiter→'pending'·`gateway_require_active_recruiter` 加审批维度（**R7 同签名 RETURNS void 换体**）·`gateway_admin_recruiter_approvals()`+`gateway_admin_recruiter_approval(text,text)`（照 0041:107-120 disable 留痕样板·action='approve_recruiter'/'reject_recruiter'）·REVOKE/GRANT 照 0041:139-161（0132 重贴先例）。历史迁移 0001-0151 **零字节**（`git status packages/db/migrations/` 仅新增 0152）· 0152 号位空闲实测 |
| C2 | `packages/db/sql/23_api_gateway.sql`（+63/-3）· `09_auth.sql`（+1） | 镜像现态同步（0041→23 先例）：signup 换体+门审批维度+两新函数+REVOKE/GRANT；09_auth user_account 补列。**承重墙兑现**：`_neg-harness.ts:65/:70` 直载本镜像（迁移仅载 0037-0046）→neg:bend 的 pending/rejected 种子与 DB 直调断言全绿=prove DB 实有 approval 列 |
| C3 | `recruiter.guard.ts`（+6/-2） | 三分码：非 recruiter→`recruiter_required`（原样）·pending→`recruiter_pending_review`·非 approved→`recruiter_rejected`（fail-closed 只增） |
| C4 | `auth.controller.ts`（+4/-3）· `auth.service.ts`（+13/-2） | 接 `req.ip`·`signup:ip:${ip}` 桶 (10,0.05)（桶序 per-email→ip→global 短路钉死）·`RL_SIGNUP_IP` env 覆写口（prod 默认钉死值）·recruiter 返回体 `approvalStatus:'pending'`（token 照发）·login 模式零改（R1 双通道） |
| C5 | **撤销项=零字节兑现** | `git diff` 全文无 `gateway_auth_login` 触碰（0152 与镜像均未 REPLACE·login 五键由 api-runtime-role proof 复证） |
| C6 | `admin.controller.ts`（+15/-1）· `admin.service.ts`（+17） | `GET /admin/recruiter-approvals` + `POST /admin/recruiter-approvals/:id/decision`（AdminGuard+函数内复核双层照既有·RecruiterDecisionDto zod 契约） |
| C7 | `apps/web/app/admin/page.tsx`（+65/-2） | 招聘方审批卡片（沿 users/audit 卡片样式）+ 模块级 inline Server Action（httpOnly cookie Bearer 服务端调 decision 端点·revalidatePath）·approve/reject 后 audit 卡片可见留痕 |
| C8 | `recruiter.service.ts`（+22/-12）· `recruiter.controller.ts`（+2/-1） | `getJob` 归属预检**前置**到候选人解析之前（恒 404 `job_not_found_or_forbidden`）·恒定壳 `{received:true}`（applicationId/status 出响应）·`invite:ip:${ip}` 桶 (12,0.05)（per-principal 桶零改·controller 传 req.ip） |
| C9 | `contracts/index.ts` | `InviteReceived` 常量壳 schema 挂 apiContract `inviteCandidate`；`declineApplication` 仍 InviteResult **零触** |
| C12 | `contracts/index.ts` | `AuthResult.approvalStatus: z.enum(['pending','approved','rejected']).optional()`（R3） |
| C10 | `apps/web/app/recruiter/jobs/actions.ts`（+4/-2） | :52 404 分支退役（恒定壳后 404 仅剩岗位面，落通用失败文案）；:55 文案中性化钉死「已受理；若对方是注册求职者将收到邀请」 |
| C11 | `apps/api/test/neg-bend.proof.ts`（+143/-8） | §9 枚举断言改恒定壳；新增 §13（审核制 28 断言）/§14（恒等+第四探针 5）/§15（IP 限流末段 4）；:136/:165/:168 401/403 底线**零删零松**（157 总断言含原 111 口径全部保留，原注释陈旧计数已按实测校正） |
| ⑧/R5 | `auth-actions.ts`（+6）· `scripts/run-performance-e2e.mjs`（+5） | signup pending 分流审核中反馈（既有表单状态位渲染，零新后端面）；perf 档 `RL_SIGNUP_IP='64,0.05'` 显式落档（28 同 IP signup>10 突发碰撞实证适配·桶检查零删零静默 special-case） |

合计（不含新增迁移/收据）：**15 文件 · +368 / -39**（含回滚的 tsconfig.tsbuildinfo 构建产物已还原零入账）。

## 预存红对账（§4.5「input 段预存红按既有对账登记」同法）

- **neg:input**：本刀分支红 2 = `inj:sqli-in-status-query-nocrash`、`inj:non-uuid-id/resume-delete`；base `f0a8a8ee` 红 4 = 上两条 + `inj:xss-in-feedback-comment-nocrash`、`inj:xss-in-learning-topic-nocrash`。**分支红集 ⊆ base 红集**（同名严格子集，且 base 另有 2 条在本刀环境转绿）→ 零新增红，不构成本刀 STOP，未 retry-to-green。
- **packages/db `runtime-role:prove`**（§4 之外加测）：base 与分支**同点同红**（种子步 `interview_privacy_fenced`，0058/0062 触发器，与 0152 零表交集），EXIT 同为 1。迁移路径合规性由 `api-runtime-role:prove:raw` EXIT=0 承载。
- **冲突标记门（SOP:36 全仓 grep）**：全仓唯一命中 = `ai-docs/delivery/execution-master-checklist.md:2148` 残留 `>>>>>>> b23a0069 (docs(lint-s0): nail …)`——上游 lint-s0「dual-keep resolve」提交（7b042e46）尾巴，**本刀零触碰**（`git diff HEAD` 该文件为净）；本刀全部改动文件逐一扫描 **0 标记**。残留行留协调方裁决，本刀不越权改范围外文档。

## §4 逐键断言摘录（neg:bend attempt 3 · 157/157 全绿）

§4.1 未审批不可进 B 端（三分码）：
```
PASS  pending GET /recruiter/jobs→403 recruiter_pending_review
PASS  pending POST /recruiter/jobs→403 recruiter_pending_review
PASS  pending GET /recruiter/talent→403 recruiter_pending_review
PASS  pending GET /recruiter/jobs/:id→403 recruiter_pending_review
PASS  pending GET /recruiter/jobs/:id/candidates→403 recruiter_pending_review
PASS  pending POST invite→403 recruiter_pending_review
PASS  纵深: DB 直调 gateway_active_candidate 对 pending recruiter 拒(gateway_recruiter_required)
PASS  纵深: DB 直调对 rejected recruiter 同拒(fail-closed 只增不弱)
PASS  回归: approved recruiter DB 直调仍解析到活跃候选人(零弱化)
```
§4.2 审批解锁+留痕+R6 分码：
```
PASS  admin approve pendU→200 decided
PASS  approve_recruiter 留痕:actor/action/target 断言(照 0041:107-120 样板)
PASS  approve 后同账户 create→200(解锁)
PASS  approve 后同账户 invite→200 恒定壳
PASS  admin reject pendU→200 decided
PASS  reject_recruiter 留痕:actor/action/target 断言
PASS  reject 后恒 403 recruiter_rejected(分码断言)
PASS  reject 后 GET /recruiter/talent 恒 403 recruiter_rejected
PASS  非 admin POST decision→403(HTTP AdminGuard 层)
PASS  非 admin decision DB 双层拒(函数内复核 gateway_admin_required)
PASS  decision 非法枚举值→400(zod 契约)
PASS  DB 直调 decision 非法值→invalid_decision(函数自守·绕 HTTP 也拒)
PASS  decision 对 candidate 目标→404(role 过滤)
PASS  decision 对幽灵目标→404
```
§4.3 枚举不可区分 + R2 第四探针（raw 逐字节）：
```
PASS  invite 不存在候选人→恒定壳 200 received(零存在性信号)
PASS  invite 招聘方 email→同壳零信号(不暴露 B 端账户)
PASS  recU 邀请到 recU2 岗位→404 job_not_found_or_forbidden
PASS  枚举不可区分:三路 invite status+body 逐字节一致
PASS  恒定壳钉死期望字节 {"received":true} 且 200(非「都 404」弱化形)
PASS  命中真实建申请:租户内 candidates 列表可见 freshC(壳外承载)
PASS  第四探针:越权岗位×注册候选人=×幽灵 status+body 逐字节一致
PASS  第四探针:双方恒 404 期望字节 {"error":"job_not_found_or_forbidden"}(字节钉死)
```
§4.4 IP 限流（末段·§1.2.6 钉置）：
```
PASS  signup:ip 桶:同 IP 前 10 次(容量内)全放行
PASS  signup:ip 桶:第 11 次(容量+1)→429 too_many_attempts
PASS  invite:ip 桶:同 IP 超速→429(recU2 主体桶未满,429 必来自 ip 维度)
PASS  invite 429 后同主体后续恒 429(fail-closed,不静默换道放行)
```
§4.5 零弱化回归：neg:auth 81 / neg:commerce 84 / neg:resume 87 / neg:interview 97 / neg:bend 157 全绿；neg:bend 原 :136（invite 无鉴权→401）/:165（candidate 打 talent→403）/:168（candidate 借 invite 枚举→403）全数保留且 PASS。

## admin_audit 留痕输出（§4.6·neg:bend attempt 3 实捕）

```
[b110] admin_audit approve_recruiter row: {"actor":"adminU","action":"approve_recruiter","target":"pendU"}
[b110] admin_audit reject_recruiter row: {"actor":"adminU","action":"reject_recruiter","target":"pendU"}
```

## §4.1 种子 / DB 直插审批细节（对账明细）

- **adminU 种子**：由共享 harness `_neg-harness.ts:73-76` 直插（`('adminU','admin@x.com','scrypt$a$b',is_admin=true,role='candidate')`）——本刀零改 harness，审批动作全部经 HTTP `POST /admin/recruiter-approvals/:id/decision`（AdminGuard→`gateway_admin_recruiter_approval`）。
- **本刀种子（neg-bend 直插·`_neg-harness.ts:73` 同法）**：
  `INSERT INTO user_account(id,email,password_hash,role,approval_status) VALUES ('pendU','pend@x.com','scrypt$p$p','recruiter','pending'), ('rejU','rej@x.com','scrypt$rj$r','recruiter','rejected'), ('freshC','f@x.com','scrypt$f$f','candidate','approved')`。
  直插显式携带 approval_status（绕过 signup 函数的 pending 落列，构造审批两态）；存量/其余种子（recU/recU2 等）不经该列 → DEFAULT 'approved' 零回归（neg:bend §3/§6 原 recruiter 断言全绿为证）。
- **DB 直插审批**：审批态变化不经直插——approve/reject 全走受控函数（纵深另有 `asP('adminU',…)`/`asP('pendU',…)` 直调断言）；仅**种子态**用直插。
- **测试前提补齐**：`process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'b110-neg-route-input-hmac-key-test-only-…'`（neg-bend 内·≥32 字符测试值·非凭据；隔离 runner 凭据剥离清单所迫，与 harness AUTH_SECRET 同模式）。

## 停止条件核查（五条·蓝图 §5/§8）

1. **锚点形状不符**：未触发。全部锚点亲读对账一致（23_api_gateway 函数面/0041 样板/guard/invite 面/auth-actions 行号与 REQUEST §0.3 对账表吻合；neg-bend :136/:165/:168 底线实测在位）。
2. **需触范围外**：未触发。改动面 = C1-C12+⑧+R5 落档；#271/组织限流/邮箱归一/#263/历史迁移/turbo/CI/CLAUDE.md/SSOT 零字节（git status 仅本刀清单）。新用例的两处测试前提修复均在 C11 用例块内。
3. **est live>0**：未触发。est live=0 兑现（零模型/零云/零外网）。
4. **C2 镜像落后 prove DB 仍无 approval 列即停**：未触发。C2 先行落位；neg:bend pending/rejected 种子+守卫三分码+DB 纵深断言全绿=prove DB 实有 approval 列。
5. **prove 红即停**：§4 承重键（neg:bend/neg:auth/neg:all 五段/api-runtime-role）终态全绿 EXIT=0；两处 §4 之外预存红已按「既有对账登记」处理（base 对照同名在案），未 retry-to-green。

## pins 十一值（§6 照抄·零翻转）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · 公开 DELETE=**503** · g7SuiteGreen=**false** · r1Closed=**false** · 脚注 actualSpendCny=**null**（本刀零模型外呼·零消耗）

## Non-claims（§7 摘引·收据口径同）

本刀 ≠ 企业付费闭环 ≠ 批 3 验收 ≠ B 端上线；approve 留痕 ≠ 财务双人确认；存量 recruiter 默认 approved = 向后兼容决定，非「历史注册已合规」声明；`signup:ip`/`invite:ip` 内存桶 ≠ 生产多实例防刷（Redis seam 已知）；`req.ip`=socket 地址（trustProxy 关闭）≠反代后真实客户端 IP；invite:ip 与 per-principal 桶同参 (12,0.05) 使两桶在单进程内同耗——**invite 429 断言的桶归因由「循环内该主体 per-principal 用量 ≤11<12」逻辑钉死**（代码注释在案），纯 per-principal 429 的 HTTP 孤立重现被同参结构排除，per-principal 回归以键/参数/桶序零改（diff 可证）+恒 429 断言承载；full-e2e 面 signupOrLogin 共 5 站点 <10 容量无碰撞（perf 档已另落独立限流段）。

## sha256（关键工件）

```
9e5ec28d5f5a1c1e4e271a14d9ec1338895d84bcaeafd0da412112b329ebb439  packages/db/migrations/0152_recruiter_approval_gate.sql
7c10816f40da4ea54d3c68cf570f5d76d1c3fb61c9292cfcd5bc501220d19a63  packages/db/sql/23_api_gateway.sql
7d0c0d56b019cf1114540e6cba0406fc69aebc8f0d68fdde262e704402cd88a1  packages/db/sql/09_auth.sql
e64c3ef542f9afb8e465509aa481b2334cedb4f76b81102572945e74ac3c39f7  apps/api/src/platform/recruiter.guard.ts
031fe8e63092ba5641b33c9796565e4f54f220dbd0e564b2d54a3dbd47fb3237  apps/api/src/modules/auth/auth.service.ts
f232f0fc219d86c37cd2995e62666f672d6155cc0724307eba6400c84a83a729  apps/api/src/modules/recruiter/recruiter.service.ts
8a0d6221fe7833d1b2fc1c071236b31de6c46ca209944830bbecb480f74978d6  packages/contracts/src/index.ts
03f49721b1c518d4c56ac5bb9782d67d4595a90b530d39df74e6ae460720a266  apps/api/test/neg-bend.proof.ts
```
（logs/*.log 十份逐一入 git；commit hash 于 REQUEST 状态行 append 登记。）

## 断言 diff（§9 改前→改后）

```diff
-  A('invite 不存在候选人→404 candidate_not_found', g1.status === 404 && g1.body?.error === 'candidate_not_found');
-  A('invite 招聘方 email→404 candidate_not_found(不暴露 B 端账户)', g2.status === 404 && g2.body?.error === 'candidate_not_found');
+  A('invite 不存在候选人→恒定壳 200 received(零存在性信号)', g1.status === 200 && g1.body?.received === true && !('applicationId' in (g1.body ?? {})) && !('status' in (g1.body ?? {})));
+  A('invite 招聘方 email→同壳零信号(不暴露 B 端账户)', g2.status === 200 && g2.body?.received === true && g2.body && Object.keys(g2.body).length === 1);
   A('recU 邀请到 recU2 岗位→404 job_not_found_or_forbidden', g3…);   // 期望不变，语义升级为「候选人解析之前」的归属预检（R2）
```

---
*EXEC 收据 · mw-b110-exec · attempts 全账如实（neg:bend 三跑：1 红（新用例测试前提缺陷，修复在测试码）→ 2 绿 → 3 绿（仅加留痕输出行））；Ban self-approve——本收据待双席复核。*
