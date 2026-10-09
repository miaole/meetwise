# B110 EXEC REQUEST — #110 招聘方注册审核/邀请制刀（W4 B 端线首刀·设计裁决在案）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs-only 起草·本档零码动·EXEC 须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual**）
**Date**: 2026-10-07
**Base**: 主线 `feat/mysql-schema-skeleton` @`b429aebb` · 分支 `line/b110-recruiter-gate`（工作树 `meetwise-line-b110`）
**蓝本**: 上游审计 #110 全条（`Meetwise产品审计-更正版/issues-master.md:171`）+ W4 派单（`ai-docs/delivery/harness/product-campaign-EXECUTION-SOP.md:29`「W4 B 端｜批 3｜#110（审核/邀请制→企业账户主体）→#271（…迁移 0152+）→…」）——**审计文档不在本 base 实树**（上游事实源① `/Users/miaole/Documents/Meetwise产品审计-更正版/`，仓外路径·如实登记），引文逐字誊录；仓内锚点全部本 base 实树亲读。
**Honesty**: 审计行号按本 base 实测逐一对账，漂移处 §0.3 如实登记（行号错=审席 FAIL）；蓝本引文逐字誊录。

---

## §0 立靶

### 0.1 审计 #110 原文（issues-master.md:171 逐字誊录·锚点列为本刀授权面）

- **定级/域**：#110 · P1 · 技术缺陷 · B端-发岗位。
- **问题**：「招聘方身份可自助注册（role 由客户端提交、无审核），invite 限流按主体可被批量注册绕过，形成邮箱枚举/骚扰面」。
- **修法（授权面原文）**：「（D4 已决保留 B 端）recruiter 注册改为审核/邀请制，审核通过后开通企业额度账户（见 #271/D5）；invite 结果不暴露候选人是否存在；按 IP/组织维度限流」。
- **审计列锚**：`apps/api/src/modules/auth/auth.service.ts:20-22`；`apps/api/src/modules/recruiter/recruiter.service.ts:60-71`；`packages/db/migrations/0041_api_runtime_least_privilege.sql:53-63`；`apps/web/app/auth-actions.ts:17,21`。关联：#111、#131、#87、#263。

### 0.2 D4/D5 关联（决策链逐字）

- **D4（2026-10-09 用户决策更新·product-audit-report.md:7）**：「D4（B 端保留继续做）」——下线/隐藏注册入口分支已删（fix-roadmap.md:109 删除线原文可证），审核/邀请制成为 B 端上线必需项。
- **#110↔#271 硬依赖（fix-roadmap.md:104,111 逐字）**：「#110（复核从 5A 移入本批）先行：招聘方注册改审核/邀请制，**审核通过即开通企业额度账户（#271 的付费主体）**」；「#271 硬依赖 #110（企业付费主体）」。D5 已决企业充值、企业付费、候选人不扣（product-audit-report.md:7）→ **approve 动作=企业付费主体的诞生时刻**，必须 admin_audit 留痕（主体可问责），本刀就是把这一时刻钉出来的刀。
- **企业渠道更新（issues-master.md:171 尾注逐字）**：「审核通过的招聘方同时是企业订单的下单人与开票资料的持有人（见 #271）；审核时可一并采集企业主体名称」——企业主体名称/开票采集归 #271（§2），本刀只留审批与留痕轨道。

### 0.3 锚点亲读对账表（base `b429aebb` 实测·漂±登记）

| 审计锚 | 实测 | 内容（亲读） | 漂 |
|---|---|---|---|
| `auth.service.ts:20-22` | :20-22 无漂 | :20 signup 限流键 `signup:${email}`(3,0.02)+`signup:global`(60,1)，注释自认「真·防海量不同邮箱注册仍需 IP 维度——内存限流是已知 seam」；:22 `const role = b.role === 'recruiter' ? 'recruiter' : 'candidate'`（role 客户端提交即得 B 端身份·无审核） | 无 |
| `recruiter.service.ts:60-71` | :60-81（面实测延至 :81） | :60 invite 签名；:63 `rl.allow(\`invite:${principal}\`,12,0.05)` **按主体限流**（批量注册 recruiter 即绕过——本条审计攻击面）；:70-73 `gateway_active_candidate` 解析；:74 未命中→404 `candidate_not_found`（**存在性 oracle**）；:78-80 命中→200 `{applicationId,status}` | 无（面边界 :71→:81 如实延展） |
| `0041_api_runtime_least_privilege.sql:53-63` | :53-65 | :43-51 `gateway_require_active_recruiter()`（仅查 `role='recruiter' AND status='active'`·**无审批维度**）；:53-65 `gateway_active_candidate`（:56 PERFORM require_recruiter；:60-63 仅解析 `role='candidate' AND status='active'`）；:107-120 `gateway_admin_disable`（**admin_audit 留痕样板**）；:122-129 `gateway_admin_audit`；:139-161 REVOKE/GRANT 纪律 | +2 |
| `auth-actions.ts:17,21` | :17,21 无漂 | :17 role 读表单提交；:21 signup payload 带 role；:29-33 `mw_role` cookie + 按 role 跳 `/recruiter/jobs` | 无 |
| 0001_baseline.sql（role 枚举） | **不在 0001** | 0001:362-371 `user_account` 无 role 列（status 枚举 `('active','disabled')` :365）；role 列实为 `0006_user_role.sql:2-3` `CHECK (role IN ('candidate','recruiter'))`；注册落库经 `23_api_gateway.sql:5-25` `gateway_auth_signup`（:18 role 白名单·:21-22 INSERT 无审批维度） | 归属漂移如实登记：审计写 0001，实锚 0006+23_api_gateway |

旁证（本刀设计输入·同 base 亲读）：`recruiter.guard.ts:12-18`（API 层 B 端门：`SELECT role`→非 recruiter 403·无审批维度·fail-closed）；`admin.controller.ts:30-39`+`admin.service.ts:34-44`（disable+audit 端点先例）；`0019_schema_drift_reconcile.sql:7-16`（admin_audit 表·append-only·无 RLS·app_role INSERT/SELECT）；`rate-limit.service.ts:12-19`（per-key 令牌桶 `allow(key,capacity,refillPerSec)`·内存单实例·seam 注释「多实例换 Redis·同 allow 接口」）；`auth.controller.ts:11-16`（signup 未接 req/IP）；`recruiter.controller.ts:50-54`（invite 有 `@Req` 未传 IP）；`contracts/src/index.ts:15`（SignupDto role optional）·`:354-358`（InviteCandidateDto）·`:360-361`（InviteResult={applicationId,status}）·`:1107/:1113`（inviteCandidate 与 declineApplication 共用 InviteResult）；`apps/web/app/recruiter/jobs/actions.ts:53,57`（404→「未找到该候选人」=枚举面 UX）；`apps/api/test/neg-bend.proof.ts:290-299`（现状 404/枚举断言·本刀须改）·`:136,:165,:168`（401/C 端 403 底线）；`_neg-harness.ts:65-77`（种子直插 user_account 带 role）；`packages/db/src/migrate.ts:3-5`（铁律：checksum 守卫**禁改历史迁移**）；`packages/db/migrations/` 共 152 文件最大 `0151` → 新迁移 **0152 起**（SOP:37「一律 0152 起编号·expand-only·带 lock_timeout」）；近期迁移 `CREATE OR REPLACE FUNCTION gateway_*` 先例 0128/0132/0134/0144（→0152 可替换 gateway 函数·零改 0041）；`packages/db/sql/23_api_gateway.sql` 为 gateway 现态镜像（含 0041 全部函数·镜像义务先例）。**邀请码通道核查**：全仓 `grep invite_code|inviteCode|邀请码|invitation` 于 apps/packages 非 test 码——零邀请码注册通道；现有「invite」=面试邀请（`0009_interview_invitation.sql`·`job_application.source='invited'`），语义为 B→C 面试邀约，**非注册邀请码**（形态裁决关键事实，§1.1）。

## §1 范围

### 1.1 设计裁决（先做）：审核制形态 = **a) 注册即审核队列（admin 后台 approve）** · 推荐 + 理由

三形态对垒（亲读现 invite/recruiter 面后裁定）：

| 形态 | 裁定 | 理由 |
|---|---|---|
| **a) 注册即审核队列**（recruiter 注册落 `approval_status='pending'`·admin 审批 approve/reject·admin_audit 留痕） | **✅ 推荐·本刀采用** | ① **admin 轨道现成**：admin.controller/service+AdminGuard+admin_audit（0019:7-16）+`gateway_admin_disable` 留痕样板（0041:107-120）——审批只加「队列查询+裁决」两受控函数两端点，零新概念；② **#271 时刻对齐**：fix-roadmap.md:104 明文 approve=企业付费主体诞生时刻，邀请码直通没有可留痕的裁决动作；③ 审计更新明示「审核时可一并采集企业主体名称」——审批队列天然是 #271 主体采集挂点（本刀不采，§2）。 |
| b) 邀请码制（「现有 invite 通道扩展」） | ❌ 否 | **伪前提**：现有 invite 通道=面试邀请（job_application.source），非注册邀请码；全仓无邀请码表/发码/核销面。真做 (b)=新表+发码面+核销面，面更大；码可转发→任意持码人自助，无裁决无留痕，企业主体无诞生时刻。 |
| c) 混合（邀请码直通+公开注册走审核） | ❌ 否（首刀） | 双通道双门，prove 面翻倍，违 EXTREV「简化优先」；邀请码可作后继刀的「预审批快车道」叠加在 (a) 之上，不损终态。 |

### 1.2 授权面（EXEC 刀四件事·全部钉在本 §）

1. **审批列+门（DB）**：迁移 `packages/db/migrations/0152_recruiter_approval_gate.sql`（编号 0152 起·expand-only·SQL 内 `SET LOCAL lock_timeout`·照 SOP:37；EXEC 时若主线已被占号则取最小未占号并如实登记）：
   - `ALTER TABLE user_account ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('pending','approved','rejected'))`（存量行零回填=默认 approved·向后兼容·candidates 携带值无语义）；
   - `CREATE OR REPLACE gateway_auth_signup`：`role='recruiter'` → INSERT `approval_status='pending'`（candidate 走默认）；
   - `CREATE OR REPLACE gateway_require_active_recruiter`：加 `approval_status='approved'` 维度（fail-closed·0041:43-51 语义只增不弱）；`gateway_auth_login` RETURNS 增 `approval_status` 透出；
   - 新增 `gateway_admin_recruiter_approvals()`（待审/最近队列）+ `gateway_admin_recruiter_approval(p_target_id, p_decision)`（decision∈approve/reject·`PERFORM gateway_require_active_admin()` + UPDATE + **admin_audit INSERT（action='approve_recruiter'/'reject_recruiter'·actor/action/target 照 0041:116 样板）**）；REVOKE/GRANT 照 0041:139-161 纪律（新函数 REVOKE ALL FROM PUBLIC,app_gateway_role；EXECUTE TO app_role）；
   - 镜像现态：`packages/db/sql/23_api_gateway.sql` + `09_auth.sql`（user_account 列）照 0041→23_api_gateway 同步先例更新。
2. **API/web 门**：`recruiter.guard.ts:15-17` 查询加 approval_status，非 approved → 403 `recruiter_pending_review`（与非 recruiter 的 `recruiter_required` 分码·仍 fail-closed）；`auth-actions.ts:29-33` pending 分流审核中反馈（渲染落在既有 web 面，禁新增后端面）；`auth.controller.ts:14`/`auth.service.ts:16-37` signup 接 `req.ip` 加 **`signup:ip:${ip}` 限流桶**（参数值 EXEC 钉死·沿 :18 注释量级纪律）+ recruiter 注册返回体带 `approvalStatus:'pending'`（token 照发：账户可登录、B 端功能全 403）。
3. **admin 审批面**：`admin.service.ts`/`admin.controller.ts` 加 `GET /admin/recruiter-approvals` + `POST /admin/recruiter-approvals/:id/decision`（调 §1.2.1 新函数·AdminGuard 双校验照既有）；`apps/web/app/admin/page.tsx` 加审批卡片（沿 users/audit 卡片样式·175 行现文件内落）。
4. **invite 枚举面封堵 + IP 维度限流**：`recruiter.service.ts:60-81` 响应收敛**恒定壳**（命中=真实建申请、未命中/招聘方 email=同形同码零信号；`applicationId/status` 不再出响应，真实状态以租户内 candidates 列表为准——:80 幂等诚实注释语义由租户列表承载）；`contracts/src/index.ts:360-361,1107` invite 响应换挂新常量壳 schema（`:1113` declineApplication 仍用 InviteResult **零触**）；`recruiter.service.ts:63` 增 **`invite:ip:${ip}`** 桶（保留 per-principal 桶·双层）；`recruiter.controller.ts:52` 传 `req.ip`；`apps/web/app/recruiter/jobs/actions.ts:53` 404 分支退役 + :57 文案中性化（「已受理；若对方是注册求职者将收到邀请」）。
5. **测试面**：`neg-bend.proof.ts:290-299` 枚举断言改为**不可区分断言**（注册候选人 email/幽灵 email/招聘方 email 三者响应逐字节一致）；新增：pending recruiter → `/recruiter/*` 全 403 + admin approve 后解锁 + admin_audit 有痕 + reject 恒 403 + IP 限流 429；`:136,:165,:168` 401/403 底线零弱化；DB 直调 `gateway_active_candidate` 对 pending recruiter 拒（纵深断言）。

## §2 非范围

1. **#271 全部**：企业额度桶（entitlement kind/payer）、充值（线上+对公）、开票资料、扣费路由、企业主体名称采集、迁移 0153+——本刀只交付审批轨道与留痕（§0.2）。
2. **org 维度限流不实现**：全仓无组织实体（git grep organization/enterprise 零命中·#271 审计引证同认）——实现即造表=越权；org 维度归 #271。
3. **#111/#131 邮箱归一归 5A**：signup/invite 的 email 处理零改（仅 invite 既有 `toLowerCase()` 保留原样）。
4. **#263 注册入口零触**：D4 已决保留公开入口，login 页/Nav 零字节。
5. **存量 recruiter 零清洗**：DEFAULT 'approved' 使存量自助注册 recruiter 全数过门——数据现实（无历史审核依据），批量复核/改判归协调方另议（§7 披露）。
6. **多实例 Redis 限流不做**：rate-limit.service 内存单实例为已知 seam（:4 注释自认），另刀。
7. **迁移历史零改**：0041/0006/0001 等已应用迁移零字节（migrate.ts checksum 守卫=机器判据）；gateway 变更全部走 0152 CREATE OR REPLACE。
8. turbo/CI/CLAUDE.md/SSOT 台账零字节；rejected 账户后续处置（改判/删号/C 端可用性）留协调方裁决——本刀 rejected 语义仅「不可进 B 端功能·留痕」。

## §3 改动清单（file:line 现状→目标·全数亲读 @`b429aebb`）

| # | 码面 | 现状（亲读） | 目标 |
|---|---|---|---|
| C1 | `packages/db/migrations/0152_recruiter_approval_gate.sql`（新增） | 无（当前最大 0151） | §1.2.1 全部（列+signup/login/recruiter 门+admin 两函数+REVOKE/GRANT+lock_timeout） |
| C2 | `packages/db/sql/23_api_gateway.sql` · `09_auth.sql` | 现态镜像（含 0041 全函数 :49,:66,:73 等） | 与 0152 同步的现态镜像（先例：0041→本文件已同步） |
| C3 | `apps/api/src/platform/recruiter.guard.ts:15-17` | `SELECT role FROM user_account` → 非 recruiter 403 `recruiter_required` | 查询加 approval_status；非 approved → 403 `recruiter_pending_review`（fail-closed 只增） |
| C4 | `apps/api/src/modules/auth/auth.controller.ts:14` · `auth.service.ts:16-37` | signup 未接 req/IP；:22 role 直认 | 接 `req.ip`；加 `signup:ip:${ip}` 桶；recruiter 落 pending（经 C1 函数）+返回体带 approvalStatus |
| C5 | `packages/db/sql/23_api_gateway.sql` `gateway_auth_login` ↔ `auth.service.ts:44-53` | RETURNS 无审批维度；login 返回 {token,userId,role} | RETURNS+查询+返回体增 approvalStatus（供 web 分流） |
| C6 | `apps/api/src/modules/admin/admin.controller.ts:30-39` · `admin.service.ts:34-44` | 仅 disable/audit | 增 approvals 队列+decision 两端点（AdminGuard+函数内复核双层照既有） |
| C7 | `apps/web/app/admin/page.tsx`（175 行） | users/orders/stats/disable/audit 卡片 | 增审批卡片（approve/reject 按钮→decision 端点·audit 卡片可见留痕） |
| C8 | `apps/api/src/modules/recruiter/recruiter.service.ts:60-81` · `recruiter.controller.ts:50-54` | :63 per-principal 桶；:74 404 vs :80 200（存在性 oracle） | 恒定壳响应+`invite:ip:${ip}` 桶（per-principal 桶保留·controller 传 req.ip） |
| C9 | `packages/contracts/src/index.ts:360-361,1107` | InviteResult 共用；inviteCandidate response=InviteResult | invite 专用常量壳 schema 换挂 :1107；:1113 declineApplication 零触 |
| C10 | `apps/web/app/recruiter/jobs/actions.ts:53,57` | 404→「未找到该候选人」 | 404 分支退役；成功/受理文案中性化 |
| C11 | `apps/api/test/neg-bend.proof.ts:290-299`（+pending/审批/IP 用例块） | 404/枚举断言 | §1.2.5 断言面（不可区分+审批解锁+留痕+429）；:136,:165,:168 零弱化 |

**零改动面**：`0041`/`0006`/`0001` 等既有迁移 · `packages/contracts/src/index.ts:15`（SignupDto role 枚举保留·语义变化在服务端门） · `apps/web/app/login/` · `Nav.tsx`（#263） · `.github/**` · `CLAUDE.md` · `apps/api/src/platform/rate-limit.service.ts`（结构既有·只加调用键） · `0009/22_interview_invitation` 面试邀请语义。

## §4 prove（可证伪口径·全离线本地 API·est live=0）

1. **未审批不可进 B 端**：pending recruiter 种子（`_neg-harness.ts:73` 同法直插 `approval_status='pending'`）→ `POST /recruiter/jobs`、invite、talent 全 403 `recruiter_pending_review`；DB 直调 `gateway_active_candidate`（app_role 上下文）同拒（纵深）。
2. **审批解锁+留痕**：admin decision approve → 同账户 create/invite 200；`gateway_admin_audit()` 出现 `action='approve_recruiter'` 行（actor/action/target 断言）；reject → 恒 403 且留痕；非 admin 调 decision → 403（guard+函数双层）。
3. **枚举不可区分断言**：注册候选人 email / 幽灵 email / recruiter email 三路 invite → status+body **逐字节一致**；恒等断言非「都 404」弱化形。
4. **IP 限流断言**：同 IP 第 capacity+1 次 signup（不同邮箱键）→ 429；同 IP invite 超速 → 429；per-principal 桶行为不变（回归）。
5. **零弱化回归**：`neg:auth`+`neg:bend` 全绿（改后）·`neg:all` 五段 auth/commerce/resume/interview/bend 绿（input 段预存红按既有对账登记·不 retry-to-green·不构成本刀 STOP）。
6. **收据 `ai-docs/delivery/receipts/b110-recruiter-gate/`**：EXIT 原值+断言 diff（改前改后）+admin_audit 留痕输出+sha256，入 git。
7. **EXIT=0 一次过**：Ban retry-to-green，attempts 全账如实。

## §5 Ban（全列）

1. **Ban 改历史迁移**：migrate.ts checksum 守卫面零触；0041/0006/0001 零字节改。
2. **Ban #271 蔓延**：entitlement kind/payer/充值/开票/扣费路由/企业主体采集零字节；迁移只许 0152 一枚（§1.2.1 面）。
3. **Ban org 维度限流实现**：无实体可挂（§2.2），造表=越权。
4. **Ban 隐藏/下线招聘方注册入口**：D4 已决保留；#263 面（login 页/Nav/footDesc）零字节。
5. **Ban 邮箱归一**：#111/#131 面（归 5A）零字节。
6. **Ban 弱化**：RecruiterGuard/gateway_require_active_recruiter fail-closed 语义只增不弱；neg-bend 401/403 底线断言零删零松；invite 恒定壳不得退化为「区分但加密」形。
7. **Ban secrets/.env/Key**：零凭据落盘；Key name-only；staged 过 secret gate。
8. **Ban 冲突标记**：push 前 `grep '^<<<<<<< $|^=======$|^>>>>>>> '` 全仓=0（SOP:36 strict 门）。
9. **Ban self-approve · Ban retry-to-green**：双审两外席·作者≠审者·跨席互审。

## §6 pins（十一值照抄·零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）

## §7 Non-claims

**本刀 ≠ 企业付费闭环 ≠ 批 3 验收 ≠ B 端上线**。审批轨道落地 ≠ #271 企业额度存在（桶/充值/对公/开票全归后刀）；approve 留痕 ≠ 财务双人确认（那是 #271 对公面）；存量 recruiter 默认 approved = 向后兼容决定，**非「历史注册已合规」声明**（批量复核未做·如实披露）；恒定壳封的是 invite 端点存在性 oracle，租户内 candidates 列表可见自有租户候选人（本就如此·非枚举面）；`signup:ip`/`invite:ip` 内存桶 ≠ 生产多实例防刷（Redis seam 已知）；邀请码制未建 ≠ 终态裁决（可作后继快车道叠加）；「审核时可一并采集企业主体名称」未实现（归 #271）；审计行号为 `b429aebb` 实测，后续 base 漂移须重对账；批 3 验收（企业桶断言·对公双人确认）以 fix-roadmap 第 3 批验收节为准，本刀后仍不满足。

## §8 STOP

**STOP · `awaiting_pre_exec_dual` · alone≠dual。** 本 REQUEST docs-only 起草，写完即停零码动；EXEC（§1.2 四件事+§3 C1-C11）须预执行双审两外席 PASS + meetwise 明示授权方可行使；Ban self-approve；Ban retry-to-green；prove 红即停手上报协调方（停止条件：锚点形状不符/需触范围外/est live>0）。

---

*B110 EXEC REQUEST · 2026-10-07 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`b429aebb` · 分支 `line/b110-recruiter-gate` · 蓝本=上游审计 #110（issues-master.md:171）+ product-campaign-EXECUTION-SOP.md:29 W4 首刀 · 形态裁决=(a) 注册即审核队列（b/c 否决理由 §1.1）· 四件事=审批列+门/admin 审批面（0041:107-120 样板留痕）/invite 枚举面恒定壳/signup+invite IP 维度限流 · 迁移 0152 起·expand-only·lock_timeout · pins 十一值照抄 · Dual PASS ≠ 开工 · Ban self-approve*
