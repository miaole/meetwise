---
id: requirements_uc_admin_console
name: 用例 · admin-console
description: admin-console 业务用例与测试用例（七类全覆盖，34 UC / 219 TC）。最终收口版，已闭合两轮对抗评审全部必补项。
type: reference
scope: shared
level: spec
status: active
owner: product
---

# Admin Console（管理/运营后台）用例 + 测试用例规范 · 最终收口版（v2，评审全闭合）

> **🔎 实现状态（对齐真实代码 · 2026-07）** — 本文是 TARGET 规格。**🟡 部分（薄骨架）**：api 有 `admin` 模块 + `AdminGuard`（is_admin fail-closed 特权只读）+ web `/admin` 页面，具备最小后台读视图。**⬜ 未建（规划）**：本文 34 UC / 219 TC 的绝大多数——后台 RBAC 多角色、订单退款核查、内容/题库审核闸门、兑换码批次断点续生成、运营位、看门狗补跑、通知治理、SKU/定价目录、Kill-switch、危险操作二次确认等——**均无对应生产代码**，为待建规格。当前后台仅基础特权读，勿视为整套运营后台已交付。

> 领域：管理/运营后台 — 后台认证与会话、用户管理、订单与退款核查、内容/题库审核、运营位、数据看板、RBAC、操作审计、危险操作二次确认、导出脱敏；外加四类横切治理对象（通知 / 工单CaseRef / 调度可靠性 / 商品目录·计费地基）与两类应急对象（Kill-switch / 隐私删除权）。
> 本版在 v1（24 UC）基础上按第二轮对抗评审逐条收口，**新增 9 个承重缺失 UC 把所有"对策写在纸面但机制悬空/不可测"的刁钻流落到原语或状态机**：退款渠道异步回调摄入（区别于 chargeback）、泄题紧急撤回安全默认、AI 生成内容专用闸门、兑换码批次确定性断点续生成、通知治理、CaseRef 生命周期、调度 missed-run 补跑、权益消费 commit 时点地基、SKU/定价目录。
> 实现标准一律遵循 Meetwise 承重设计：四原语（CAS / 幂等 / RLS / 事件日志）、显式状态机、双校验、可观测三账本、安全护栏五层。**杜绝一切静默失败的弱实现**：通知建模为有状态机的持久对象 NotificationJob（fire-and-forget 会静默丢投递、无重试无审计）；kill-switch 是带 status enum + 审计迁移 + 二人复核 + blast-radius 的对象（临时 flag 无审计、拨动不可追溯）；告警一律落 outbox domain event（裸字符串告警下游不可对账）；会话状态持久化到 DB + 版本号比对（in-memory 会话重启/多实例即丢）；审计经事务性 outbox 投递到独立哈希链存储（与业务同事务插 log 耦合业务事务、无独立防篡改保证）。

---

## 0. 文档约定与承重标准（全集统一，不在各 UC 重复）

### 0.1 四原语命中标注
- **CAS**：状态/计数变更必须基于期望前值的原子比较交换（`UPDATE ... WHERE status=expected / count<limit`，受影响行数=0 即冲突）。禁止"读-改-写"无锁。
- **幂等**：所有写动作携带 `Idempotency-Key`（客户端生成或 `(adminId, action, targetId, nonce)` 派生），服务端 `idempotency_keys` 唯一约束 + 结果缓存，重放返回首次结果。
- **RLS**：Postgres 行级安全按 `tenant_scope`（C 端用户域 / B 端招聘域**物理隔离**）+ `admin_role_scope` 双重过滤。**注意：运营对 C 端不是隔离而是"带 scope 收敛 + 强审计的特权下视"，隔离面是 C↔B 互不可见；运营特权读 C 端但读 B 端域受限**（纠正评审④三租户面概念混淆）。后台读 C 端数据走只读视图。
- **事件日志**：每个状态迁移/敏感读写产出 domain event → **事务性 outbox**（与业务事实同事务写 outbox 行，独立投递进程消费），落三账本之一。**禁止主流程内 fire-and-forget。**

### 0.2 可观测三账本（告警/通知一律绑此，禁裸副作用）
| 账本 | 内容 | 写入方式 |
|---|---|---|
| `admin_audit_log`（审计/防篡改账本） | 谁、何时、对谁、做了什么、前后值摘要、caseRef、correlationId | 业务事实强一致写业务表 + 同事务写 outbox；outbox 投递到**独立 append-only 哈希链存储**（每行 `prev_hash`/`entry_hash` 链式）。**审计不与业务同库同事务插 log**（同事务插 log 耦合业务事务、无独立防篡改保证）。 |
| `ai_invocation_traces`（推理账本） | 审核/检测类模型调用 traceId、prompt 版本、双校验结果、AI 内容生成管线身份 | ai-runtime invoke 内写 |
| `consumption_records` / `payment_orders`（业务/计费账本） | 权益 reserved/committed/released、退款、clawback、红冲 | 业务服务事务内写 |
| **告警/通知** | 一律建模为 outbox domain event（`alert.*` / `notify.*`）落入上表对应通道；测试**断言事件入箱，禁止断言下游真发**（纠正评审③-2 裸字符串告警）。 |

### 0.3 时间基准（评审①-3 + 评审"调度漏跑"收口）
- **所有时间戳 UTC 存储**（`timestamptz`）。排期/有效期/TTL 的"墙钟语义"按对象显式携带的 **IANA 时区**（如 `Asia/Shanghai`）解释，DST 切换用绝对 UTC 边界，不用本地墙钟做减法。
- **应用层不信本地墙钟**，时间判定以 DB 服务器时间为准；时钟漂移超阈告警（UC-adminscheduler-01）。
- **TTL/到期不仅靠调度器 tick 迁移，所有消费/鉴权/核销侧读时再校验绝对截止**（防漏跑放大，UC-adminscheduler-01 刁钻流核心）。
- 受时间约束对象：`OpsPlacement`（scheduled→live）、`RedemptionCodeBatch`（有效期）、`ExportJob`（下载 TTL）、`DangerApproval`（pending TTL）、`CaseRef`（工单 TTL）、`ConsumptionRecord`（reserved 超时 release）、`RefundOrder`（渠道回调超时）。

### 0.4 策略配置（policy config，占位值可测、接配置中心可灰度可热调；纠正硬编码弱实现）
| Key | 占位值 | 用途 |
|---|---|---|
| `ADMIN_LOGIN_FAIL_LOCK` | 5 次失败 / 15min 窗口 → 锁 30min | 防后台爆破 |
| `ADMIN_MFA_REQUIRED` | 所有 admin 角色强制 TOTP | 登录 |
| `ADMIN_SESSION_IDLE` / `ABSOLUTE` | 空闲 15min / 绝对 8h | 会话超时 |
| `ADMIN_SESSION_MAX_CONCURRENT` | 2 | 并发会话治理 |
| `USER_LIST_RATE` | 100 req/min/admin → 429 | 列表限速 |
| `PII_REVEAL_RATE` | 20 次 / 60min/admin → `restricted` | reveal 频次 |
| `REDEMPTION_PER_USER_LIMIT` | 1 / (userId,batchId) | 单用户限领 |
| `EXPORT_QUOTA` | 3 job/日、10万行/job、下载 TTL 15min | 导出 |
| `DANGER_APPROVAL_TTL` | pending 30min 过期 | 四眼 |
| `K_ANONYMITY_MIN` | k=5 | 看板下钻最小同质组 |
| `DASHBOARD_REFRESH_LOCK` | 每物化视图 advisory lock | 刷新并发 |
| `REFUND_COOLDOWN` / `PRORATION` | 下单 24h 无条件全退 / 之后按未用次数线性 | 退款（见 openDecisions） |
| `CASEREF_TTL` | 工单 open 后 72h 自动过期 | reveal/下钻前置 |
| `NOTIFY_RETRY` | 指数退避，最多 6 次，超限入死信 | 通知投递 |
| `SCHEDULER_MISSED_GRACE` | 漏跑对账每 60s 扫描，补跑标记延迟执行 | 调度可靠性 |
| `REFUND_CALLBACK_TIMEOUT` | 渠道回调 30min 未到 → 转主动对账轮询 | 退款异步边界 |
| `REPORT_COMMIT_TIMEOUT` | report 90min 未出 → 自动 release 归还次数 | commit 时点兜底 |
| `AI_CONTENT_SAMPLE_RATE` | AI 生成批 20% 强制人工精审 | AI 内容闸门 |

### 0.5 安全护栏五层（命中用 SR-* 标注）
SR-AUTHZ（鉴权/RBAC/RLS/特权下视收敛）· SR-PII（PII 受控解密/脱敏/k-匿名，**reveal 与下钻与导出三路同源 caseRef 治理**）· SR-INJECT（注入/越狱检测，对抗语料黄金集；含通知模板审核）· SR-ANTIFRAUD（限速/频次/超发/刷分/恶意拒付）· SR-AUDIT（防篡改审计/四眼/危险操作/break-glass）。

### 0.6 全集状态机（显式枚举，server 侧 CAS 迁移，禁布尔汤）

```
AdminAccount:    invited → active ⇄ restricted(reveal超阈/风控,自动恢复) → suspended → disabled
AdminSession:    issued → active → idle_expired | revoked | absolute_expired
User(C端):       active → suspended ⇄ active(解封) → erased(墓碑)
RefundOrder:     requested → approved → executing → awaiting_channel_callback
                 → refunded | partially_refunded | failed → compensated
                 外部入口: chargeback_received → reconciling → clawback_issued | disputed
ConsumptionRecord: reserved → committed(交付:report ready) | released(退款/未交付/超时) | clawed_back(拒付追回)
RedemptionCodeBatch: draft →(确定性分片续生成,cursor)→ active(issued_count<total_quota,CAS)
                 → exhausted | killed | expired
RedemptionCode:  unused → locked → redeemed | (locked 超时回滚 unused)
ContentItem(题): draft → in_review → approved → published → archived(可 unusable 即时移出抽题) ;
                 search_index: pending → indexed | failed(补偿重试) | unusable(撤回) ；
                 抽题 gating: 仅 search_index=indexed 可被面试抽中
AiGraphRun:      ... → aborted_by_ban | aborted_by_recall(泄题撤回中止) | safe_finalized(kill-switch收尾)
AssessmentReport: ... → finalized → amending(题失效回标) → amended
OpsPlacement:    draft → scheduled → live → ended | killed
ExportJob:       requested → running → ready(下载TTL) → expired | failed
DangerApproval:  pending(TTL) → approved → executing | expired | rejected ;
                 executing 一旦进入即脱离 TTL 管辖
KillSwitch:      armed ⇄ tripped(危险操作,四眼) ；恢复 tripped→armed 需二次确认
PrivacyErasure:  requested → scheduled → shredded(密钥销毁) → verified
NotificationJob: queued → sending → delivered | failed(重试/死信) | recalled(误发召回)
NotifyTemplate:  draft → in_review → approved → deprecated（未 approved 不可发送）
CaseRef(工单):   open → in_use → closed | expired
ScheduledTask:   scheduled → fired | missed →(对账补跑)→ caught_up | dropped(超宽限弃跑+告警)
SkuCatalog/PricingPlan: draft → active → deprecated（版本化，价格快照锁定在途订单）
```

---

# 模块一：后台认证与会话（admin-auth）— 评审④-1 最大缺口补齐

## UC-adminauth-01 后台登录（MFA + 失败锁定 + IP 白名单）

- **角色**：任意 admin 角色（support/ops/auditor/super_admin）
- **前置**：账号 `AdminAccount.status ∈ {active, restricted}`；已注册 TOTP；来源 IP
- **触发**：提交账号+密码+TOTP
- **主流程**：
  1. 校验来源 IP ∈ IP 白名单（SR-AUTHZ）；否则直接拒绝并记审计。
  2. 校验账号状态≠`suspended/disabled`。
  3. 校验密码（argon2id），失败计数原子自增（CAS）。
  4. 校验 TOTP（防重放：记录已用 step）。
  5. 签发 `AdminSession`（issued→active），写会话版本号 `session_version`；并发会话超 `ADMIN_SESSION_MAX_CONCURRENT` 时挤掉最旧（撤旧 session）。
  6. 写 `admin_audit_log`（登录成功，IP、deviceId）经 outbox。
- **后置**：`AdminSession: issued→active`；账本 `admin_audit_log`(login)。失败计数清零（CAS）。
- **关联**：契约 `POST /admin/auth/login`、`POST /admin/auth/mfa/verify`；状态机 AdminSession；四原语 CAS(失败计数/会话版本)·幂等(登录 nonce)·RLS(admin_role_scope)·事件日志(login/lockout)；SR-AUTHZ/SR-AUDIT/SR-ANTIFRAUD。

**七类 case 覆盖：**
- **正常**：白名单 IP + 正确密码 + 有效 TOTP → 签发会话。
- **异常（失败回滚）**：TOTP 错误 → 不签发会话，失败计数原子自增，**会话表无半成品行**（事务回滚）。
- **特殊（边界/首次/i18n）**：首次登录强制 TOTP 注册引导；中英错误文案 i18n；失败计数恰阈值-1 仍可登录。
- **逃逸通道**：TOTP 设备丢失 → 走 break-glass（UC-adminrbac-02）申请，强审计 + 事后追认，**不降低 MFA 要求**。
- **高并发（竞态 CAS）**：同账号并发 5+ 次错误密码 → 失败计数 CAS 原子累加，**不会因竞态少计绕过锁定**；达阈值原子置 `restricted`/锁定。
- **复杂**：并发会话达上限时新登录 → 挤掉最旧会话（撤其 session_version）+ 新会话签发为一个原子操作，旧会话下次鉴权 fail-closed。
- **刁钻（注入/对抗）**：白名单外 IP 撞库 + TOTP 重放（重用同一 6 位码）→ IP 拦截在前、TOTP step 防重放在后，双拒；撞库触发频次锁定。

**测试用例：**
- `TC-adminauth-01-normal` [集成]：白名单 IP + 正确凭据 → 200，DB 出现 `AdminSession.status=active` 且 `session_version` 写入；audit outbox 有 login 行。
- `TC-adminauth-01-exception` [集成]：错误 TOTP → 401，断言 `AdminSession` 无新行（事务回滚），`fail_count` 自增 1。
- `TC-adminauth-01-special-firstlogin` [e2e]：新账号首登被重定向 TOTP 注册页；i18n 切换 zh/en 文案断言。
- `TC-adminauth-01-escape-breakglass` [集成]：MFA 不可用 → 普通登录拒绝，break-glass 申请进入 pending 且产生强审计事件。
- `TC-adminauth-01-concurrency` [集成]：并发 6 个错误登录（Promise.all）→ `fail_count` 最终=6（无丢失更新），第 6 次触发锁定，账号置 `restricted`/locked。
- `TC-adminauth-01-tricky-replay` [集成]：复用同一 TOTP step 二次 → 第二次 401（防重放）；白名单外 IP → 403 且不进密码校验。

---

## UC-adminauth-02 会话治理（空闲/绝对超时、并发会话、强制失效）

- **角色**：已登录 admin / super_admin（治理他人会话）
- **前置**：存在活跃 `AdminSession`
- **触发**：每次受保护请求的会话校验；或 super_admin 主动吊销某会话
- **主流程**：
  1. 鉴权中间件实时比对 `session_version`（单调 CAS 语义；不用"待吊销标记"——标记依赖轮询清理、吊销与放行间存在窗口，版本号比对每请求即时生效、fail-closed）。
  2. 校验空闲时长 < `IDLE`、绝对时长 < `ABSOLUTE`；超则置 `idle_expired/absolute_expired`。
  3. super_admin 吊销 → `session_version` 自增（CAS），目标会话下次鉴权 fail-closed。
- **后置**：`AdminSession: active→idle_expired|absolute_expired|revoked`；audit(session_revoke)。
- **关联**：契约 `DELETE /admin/sessions/:id`、`GET /admin/sessions`；状态机 AdminSession；CAS(session_version 单调)·RLS·事件日志；SR-AUTHZ/SR-AUDIT。**会话失效靠版本号实时比对，store 不可用时 fail-closed 拒绝放行。**

**七类 case：**
- **正常**：活跃会话通过；空闲 15min 后请求被拒并要求重登。
- **异常**：吊销写 outbox 失败 → 整体回滚，`session_version` 不前进（不产生"以为吊销实未吊销"幻觉）。
- **特殊**：绝对超时边界（8h±1s）；跨 DST 用 UTC 绝对差，不受墙钟跳变影响。
- **逃逸通道**：会话 store(Redis) 不可用 → **fail-closed**，拒绝所有需鉴权请求，告警事件入箱，**不放行**。
- **高并发**：同一会话被并发吊销与正常请求 → CAS 版本号保证吊销一旦提交后续一律失效；无交错放行。
- **复杂**：用户多端 3 会话，super_admin 一键全吊 → 批量自增版本号为单事务，任一端后续 fail-closed。
- **刁钻**：盗取旧 session token 在新 IP 重放 → 版本号已变 + IP 不在该会话绑定 → 拒；会话固定攻击 → 登录成功强制轮换 session id。

**测试用例：**
- `TC-adminauth-02-normal` [集成]：空闲超时后请求 → 401 `session_expired`。
- `TC-adminauth-02-exception` [集成]：注入 outbox 写失败 → 吊销事务回滚，`session_version` 不变。
- `TC-adminauth-02-special-dst` [单元]：绝对超时计算用 UTC 差，构造 DST 切换日，断言不提前/延后过期。
- `TC-adminauth-02-escape-failclosed` [集成]：mock 会话 store 不可用 → 鉴权返回拒绝（非放行），告警事件入箱。
- `TC-adminauth-02-concurrency` [集成]：并发吊销 + 50 次受保护请求 → 吊销提交后 0 次放行。
- `TC-adminauth-02-tricky-fixation` [e2e]：登录前后断言 session id 轮换；旧 token 重放 403。

---

# 模块二：用户管理（adminuser）

## UC-adminuser-01 用户列表/检索（限速参数化）

- **角色**：support / ops（`user.read`）
- **前置**：登录态有效（UC-adminauth-02 通过）
- **触发**：分页/条件检索 C 端用户
- **主流程**：1. RLS 限定 C 端域（特权下视，B 端不可见）；2. 返回**脱敏字段**（手机号/邮箱掩码）；3. 限速计数原子自增，超 `USER_LIST_RATE` → 429；4. 检索动作记审计（聚合采样，避免审计风暴）。
- **后置**：无状态迁移；audit(user_query, 采样)。
- **关联**：契约 `GET /admin/users`；CAS(限速令牌桶)·RLS·事件日志；SR-AUTHZ/SR-PII/SR-ANTIFRAUD。

**七类 case：**
- **正常**：检索返回掩码字段。
- **异常**：下游用户服务超时 → 可解释错误 + 不缓存脏页。
- **特殊**：空结果集 / i18n 排序（拼音 vs 英文）/ 深翻页 keyset 分页边界。
- **逃逸通道**：用户服务降级 → 返回只读缓存快照并标注 `snapshotAt`（不伪装实时）。
- **高并发（竞态 CAS）**：单 admin 并发刷 → 令牌桶 CAS 扣减，**第 (limit+1) 个并发请求确定性 429**（不因竞态漏放）。
- **复杂**：跨筛选 + 排序 + 导出触发（转 UC-adminexport-01）。
- **刁钻（注入/越权）**：检索参数 SQL/NoSQL 注入 → 参数化查询拦截；按完整手机号精确匹配探测未脱敏 PII → 精确匹配 PII 字段需 `user.read.pii`，否则仅掩码模糊匹配拒绝。

**测试用例：**
- `TC-adminuser-01-normal` [契约+集成]：响应 schema 校验，手机号字段为掩码 `138****5678`。
- `TC-adminuser-01-exception` [集成]：mock 下游超时 → 503 可解释错误，无脏缓存。
- `TC-adminuser-01-special-empty` [集成]：空结果 → 200 空数组 + 正确分页元数据。
- `TC-adminuser-01-escape-degrade` [集成]：降级返回快照含 `snapshotAt`。
- `TC-adminuser-01-concurrency` [集成]：并发 `USER_LIST_RATE+1` 请求 → 恰 1 个 429（CAS 无漏放）。
- `TC-adminuser-01-tricky-inject` [集成]：注入 payload → 参数化拒绝；无 pii 权限按完整手机号精确查 → 403/降级模糊。

---

## UC-adminuser-02 PII 受控解密（reveal：caseRef + 频次 CAS + 受限态）

- **角色**：support（`user.read.pii`）
- **前置**：持 `user.read.pii`；提供 `caseRef`（工单号，生命周期见 UC-admincaseref-01）；账号非 `restricted`
- **触发**：对某字段（手机号/邮箱/身份证后四位）发起 reveal
- **主流程**：
  1. 校验 `user.read.pii` + **`caseRef` 状态=open|in_use 且 `subjectUserId==目标用户`（归属校验，UC-admincaseref-01 落机制，解评审②caseRef 悬空）**。
  2. **reveal 频次计数器原子自增（CAS）**，命中 `PII_REVEAL_RATE` → 原子置 `AdminAccount: active→restricted`。
  3. 解密单字段，每字段独立写审计（含 caseRef、字段名、**不含明文值**，仅落"已解密"事实）。
  4. 返回明文（仅本响应，不缓存）。
- **后置**：超阈 → `AdminAccount: active→restricted`（冷却后 CAS 回 active 或人工解除）；audit(pii_reveal, 每字段)。
- **关联**：契约 `POST /admin/users/:id/reveal`；状态机 AdminAccount(含 restricted)；**CAS(reveal 频次 + 阈值锁定)**·幂等(caseRef+field 去重)·RLS·事件日志；SR-PII/SR-AUDIT/SR-ANTIFRAUD。

**七类 case：**
- **正常**：有权 + caseRef 归属有效 + 未超阈 → 返回明文，写审计。
- **异常（回滚）**：审计 outbox 写失败 → **解密响应不返回**（fail-closed，无"解密了但没记审计"）。
- **特殊**：caseRef 已关闭/过期 → 拒绝；身份证仅允许后四位；i18n 字段名审计。
- **逃逸通道**：reveal 服务异常 → 拒绝并提示走人工/工单复核，不返回半解密。
- **高并发（竞态 CAS）**：同一 support **并发 reveal 多字段冲阈值** → 频次计数器原子自增，**并发不可越过阈值**，达阈即锁定后续。
- **复杂**：跨多用户工单批量 reveal → 每字段计入同一 admin 频次，累计触发 restricted，已返回字段不回滚但后续拒绝。
- **刁钻（PII 旁路/对抗）**：无 pii 权限改走看板下钻反推个体 → **被 UC-admindash-01 同源 caseRef+k-匿名闸门拦截**（旁路堵死，两路同锁）；借他人工单 reveal 第三方 → 归属校验拒（UC-admincaseref-01）。

**测试用例：**
- `TC-adminuser-02-normal` [集成]：有权 reveal → 明文返回，audit 每字段一行含 caseRef，无明文落库。
- `TC-adminuser-02-exception` [集成]：mock audit outbox 失败 → reveal 不返回明文（fail-closed）。
- `TC-adminuser-02-special-caseref` [集成]：过期/越归属 caseRef → 403。
- `TC-adminuser-02-escape` [集成]：reveal 服务异常 → 拒绝 + 人工通道提示事件。
- `TC-adminuser-02-concurrency` [集成]：并发 `PII_REVEAL_RATE+5` reveal → 计数精确，恰在阈值处账号 CAS 置 `restricted`，超阈请求全 403。
- `TC-adminuser-02-tricky-bypass` [集成]：无 pii 权限走下钻反推 → 被 k-匿名+caseRef 同源闸门拦截（与 admindash-01 共用断言夹具）。

---

## UC-adminuser-03 封禁/解封用户（与续连语义统一）

- **角色**：support/ops（`user.ban`，高危→四眼可选）
- **前置**：目标用户 `status=active`
- **触发**：发起封禁（含原因码、证据 ref）
- **主流程**：1. CAS `User: active→suspended`；2. 触发强制下线（转 UC-adminuser-04 吊销会话）；3. **续连/SSE/消费三处闸门统一二次校验 `user.status`**（评审④跨域不变量，落机制：admin 域显式声明对 commerce/interview 域的"消费前重读 user.status"义务）；4. 通知经 UC-adminnotify-01 治理（非 fire-and-forget）。
- **后置**：`User: active→suspended`；audit(ban)；NotificationJob。
- **关联**：契约 `POST /admin/users/:id/ban`；状态机 User；CAS·幂等·RLS·事件日志；SR-AUTHZ/SR-AUDIT。

**七类 case：**
- **正常**：封禁 → suspended + 强制下线。
- **异常（回滚）**：下线子步骤失败 → 封禁与下线同 saga，失败补偿回滚到 active，不留"已封但仍在线"。
- **特殊**：重复封禁已封用户 → 幂等返回首次结果；i18n 原因码。
- **逃逸通道**：误封 → 解封 CAS `suspended→active` + 恢复事件 + 召回误封通知（UC-adminnotify-01）。
- **高并发**：并发"封禁"与用户"长会话续连" → 续连闸门二次查 `status=suspended` 即拒续连（被封 ≠ 被盗号，必须拒）。
- **复杂（跨聚合）**：封禁同时用户有在途 mock-interview run → 续连被拒，run 标 `aborted_by_ban`，**已 reserved 的 ConsumptionRecord 处置与退款竞态见 UC-adminorder-03 / commit 口径见 UC-admincommerce-01**。
- **刁钻**：被封用户凭旧 `threadId` 试图续连 → SSE/续连闸门统一 `status` 校验拒绝（**靠 user.status 而非 threadId 本身判定**：盗号续连放行、封禁续连拒绝）。

**测试用例：**
- `TC-adminuser-03-normal` [集成]：封禁 → `status=suspended`，会话被撤。
- `TC-adminuser-03-exception` [集成]：mock 下线失败 → saga 补偿回滚 active。
- `TC-adminuser-03-special-idem` [集成]：重复封禁 → 幂等同结果，audit 不重复计。
- `TC-adminuser-03-escape-unban` [集成]：解封 CAS `suspended→active`，误封通知召回。
- `TC-adminuser-03-concurrency` [集成]：并发封禁 + 续连请求 → 续连 403（status 闸门），run 标 `aborted_by_ban`。
- `TC-adminuser-03-tricky-resume` [e2e+graph]：被封用户旧 threadId 续连 → SSE 拒绝；对照盗号续连放行，断言判定依据为 user.status。

---

## UC-adminuser-04 强制下线 / token 吊销（版本号 fail-closed）

- **角色**：support/super_admin（`user.session.revoke`）
- **前置**：目标用户有活跃会话
- **触发**：吊销用户全部会话（盗号/封禁联动）
- **主流程**：1. 用户 `session_version` 单调自增（CAS）；2. 鉴权层实时比对版本号，旧 token 一律失效；3. 审计经 outbox。**不依赖"待吊销标记"。**
- **后置**：用户会话全失效；audit(force_logout)。
- **关联**：契约 `POST /admin/users/:id/revoke-sessions`；CAS(版本号单调)·幂等·RLS·事件日志；SR-AUTHZ/SR-AUDIT。**token store 不可用 → fail-closed 拒绝放行，不写"待吊销标记"。**

**七类 case：**
- **正常**：吊销 → 旧 token 全失效。
- **异常（回滚）**：版本号自增事务失败 → 整体回滚，不前进版本号。
- **特殊**：用户无活跃会话 → 幂等空操作成功。
- **逃逸通道**：token store 读不可用 → 鉴权 **fail-closed 拒绝**（不放行、不标记），告警入箱。
- **高并发**：并发吊销 + 用户多端请求 → 版本号 CAS 后所有旧端确定性失效，无交错放行。
- **复杂**：与封禁联动（UC-03）同 saga；盗号场景吊销后用户重登正常（区别于封禁）。
- **刁钻**：攻击者持旧 token 在吊销瞬间高频重放 → 版本号比对在每请求执行，吊销提交后 0 放行。

**测试用例：**
- `TC-adminuser-04-normal` [集成]：吊销 → 旧 token 401。
- `TC-adminuser-04-exception` [集成]：版本号写失败 → 回滚，version 不变。
- `TC-adminuser-04-special-noop` [集成]：无会话 → 幂等成功。
- `TC-adminuser-04-escape-failclosed` [集成]：mock store 不可用 → 鉴权拒绝放行（非标记），告警事件入箱。
- `TC-adminuser-04-concurrency` [集成]：并发吊销 + 100 旧 token 请求 → 提交后 0 放行。
- `TC-adminuser-04-tricky-replay` [集成]：吊销瞬间旧 token 风暴 → 全部 401。

---

## UC-adminuser-05 用户 360 视图（跨聚合一致性口径）

- **角色**：support（`user.read` + 按字段 `user.read.pii`）
- **前置**：登录态有效
- **触发**：打开用户详情聚合（基础/订单/消费/面试/学习 5 聚合）
- **主流程**：1. 并行读 5 聚合（RLS 各自域）；2. **统一快照时间戳**，标注每子域 `asOf`；3. 跨聚合不一致（订单已退但消费账本仍显示持有）→ **显式口径标注 + 以业务账本为准**；4. PII 字段默认掩码，明文走 reveal(UC-02)。
- **后置**：无迁移；audit(profile_view, 采样)。
- **关联**：契约 `GET /admin/users/:id/overview`；RLS·事件日志；SR-PII/SR-AUTHZ。

**七类 case：**
- **正常**：5 聚合返回 + 统一 asOf。
- **异常（薄→补厚）**：某子域超时 → 该子域返回 `partial+error`，其余正常，整体不 500；标注缺口。
- **特殊**：新用户无订单/无面试 → 空态正确；i18n 标签。
- **逃逸通道**：多子域同时降级 → 返回可用子域 + 明确"快照不完整"提示。
- **高并发**：只读无写竞态，但**跨聚合读到不一致快照**：订单已退、消费账本未同步 → 以账本为准并标注"退款处理中可能延迟"。
- **复杂（跨 5 聚合）**：退款 saga 执行中打开 360 → 显示 RefundOrder=`executing`、ConsumptionRecord=`reserved/releasing`，口径一致解释，无"已退+仍持有"无注释矛盾。
- **刁钻**：客服据 360 明文截图外泄 → 360 默认掩码 + 明文 reveal 单独审计 + 水印/操作留痕。

**测试用例：**
- `TC-adminuser-05-normal` [集成]：5 聚合 + 统一 asOf 字段。
- `TC-adminuser-05-exception` [集成]：mock 一子域超时 → 该域 partial，整体 200，缺口标注。
- `TC-adminuser-05-special-newuser` [集成]：空聚合态正确渲染。
- `TC-adminuser-05-escape` [集成]：多域降级 → "快照不完整"标志。
- `TC-adminuser-05-tricky-inconsistent` [集成]：构造订单已退/账本未同步 → 响应含"以账本为准+处理中"口径标注，无无注释矛盾。
- `TC-adminuser-05-tricky-pii` [e2e]：360 默认掩码；reveal 触发独立审计。

---

# 模块三：订单与退款（adminorder）

## UC-adminorder-01 订单核查

- **角色**：support/finance（`order.read`）
- **前置**：登录态有效
- **触发**：查订单 + 关联支付/消费记录
- **主流程**：RLS 限定；返回订单状态机当前态 + 关联 ConsumptionRecord；金额/secret 脱敏。
- **后置**：无迁移；audit(order_view 采样)。
- **关联**：契约 `GET /admin/orders/:id`；RLS·事件日志；SR-AUTHZ/SR-PII。

**七类 case：**
- **正常**：返回订单 + 关联账本。
- **异常**：支付渠道查询超时 → 返回本地态 + 标注"渠道态未同步"。
- **特殊**：跨时区订单时间显示（UTC 存 + 时区展示）；空关联。
- **逃逸通道**：渠道对账服务降级 → 本地账本为准 + 标注。
- **高并发**：只读无写竞态。
- **复杂**：一单多次部分退/clawback 历史链完整展示。
- **刁钻**：订单号枚举遍历他域订单 → RLS + 越权拦截；金额参数篡改无写路径。

**测试用例：**
- `TC-adminorder-01-normal` [契约+集成]：schema 校验，支付 secret 字段不出现。
- `TC-adminorder-01-exception` [集成]：渠道超时 → 本地态 + 未同步标注。
- `TC-adminorder-01-special-tz` [单元]：跨时区订单时间展示正确。
- `TC-adminorder-01-escape` [集成]：对账降级 → 本地为准。
- `TC-adminorder-01-complex` [集成]：多次部分退历史链完整。
- `TC-adminorder-01-tricky-enum` [集成]：枚举他域订单 → 403/空（RLS）。

---

## UC-adminorder-02 退款审批（四眼 + proration 政策）

- **角色**：support 发起 / finance 或 super_admin 审批（`refund.approve`）
- **前置**：订单可退；**退款政策明确**（24h 冷静期全退 / 之后按 proration；commit 口径见 UC-admincommerce-01）
- **触发**：发起退款申请（金额、原因、proration 计算）
- **主流程**：1. 计算应退额：冷静期内全退；否则 `退额 = 单价 × (reserved 未 committed 次数) / 总次数`（口径见 UC-admincommerce-01，公式占位见 openDecisions）；2. `RefundOrder: requested`；3. **四眼：approver≠initiator**（身份+设备双校验 CAS）；4. 审批 → `requested→approved`。
- **后置**：`RefundOrder: requested→approved`；audit(refund_approve)。
- **关联**：契约 `POST /admin/refunds`、`POST /admin/refunds/:id/approve`；状态机 RefundOrder；CAS·幂等·RLS·事件日志；SR-AUDIT。**审批人≠danger 复核人≠发起人（UC-adminrbac-02 防合谋约束）。**

**七类 case：**
- **正常**：发起 + 不同人审批 → approved。
- **异常（回滚）**：审批与发起同事务冲突 → CAS 拒绝，状态不前进。
- **特殊**：冷静期边界（下单 24h±1s，UTC）→ 全退/proration 切换正确；i18n 原因码。
- **逃逸通道**：proration 计算服务异常 → 退款挂起为 `requested`，人工核额，不自动放行。
- **高并发（竞态 CAS）**：同一单并发两次审批 → CAS `requested→approved` 仅一次成功。
- **复杂**：部分退（已用 2/5 次，committed=2）→ 仅退 3/5 单价（基于 committed 口径），proration 公式断言。
- **刁钻（刷退/共谋）**：发起人用第二账号自审批 → approver≠initiator 身份+设备双校验拦截；超额退款（>订单额）→ 上界 CAS 拒绝。

**测试用例：**
- `TC-adminorder-02-normal` [集成]：异人审批 → approved。
- `TC-adminorder-02-exception` [集成]：同人审批 → 403（四眼），状态不变。
- `TC-adminorder-02-special-cooldown` [单元]：24h 边界 UTC，全退/proration 切换断言。
- `TC-adminorder-02-escape` [集成]：proration 服务异常 → 挂起 requested，无自动放行。
- `TC-adminorder-02-concurrency` [集成]：并发审批 → 恰 1 成功（CAS）。
- `TC-adminorder-02-complex-proration` [单元]：committed=2/5 → 退 3/5 单价，公式精确。
- `TC-adminorder-02-tricky-overrefund` [集成]：退额 > 订单额 → 上界 CAS 拒绝。

---

## UC-adminorder-03 退款执行 saga（与在途 run 的 reserved 竞态）

- **角色**：系统（审批后触发）/ finance 监控
- **前置**：`RefundOrder=approved`
- **触发**：执行退款（渠道退款 + 权益反向 + 账本）
- **主流程（saga）**：
  1. **先锁/终止在途 AiGraphRun**：对该 ConsumptionRecord 关联的在途 mock-interview run 加锁；若 `reserved` 正被在途 run 占用 → **先安全终止 run 或拒退**，避免"跑完一场已退款面试"。
  2. CAS `ConsumptionRecord: reserved→released`（仅 reserved 未 committed 部分；committed 口径见 UC-admincommerce-01）。
  3. 调渠道退款（幂等键=渠道退款单号防重复退）；**渠道异步结果由 UC-adminorder-05 webhook 摄入**，本步进入 `executing→awaiting_channel_callback`。
  4. 回调成功 → `refunded`；部分 → `partially_refunded`；失败 → `failed→compensated`（权益回滚 reserved）。
  5. 通知经 UC-adminnotify-01；**告警落可观测事件**（断言事件非下游真发）。
- **后置**：`RefundOrder→awaiting_channel_callback→refunded|partially_refunded|failed`；`ConsumptionRecord→released`；账本红冲；NotificationJob。
- **关联**：契约 `POST /admin/refunds/:id/execute`；状态机 RefundOrder + ConsumptionRecord；CAS(reserved→released + run 锁)·幂等(渠道退款键)·RLS·事件日志；SR-ANTIFRAUD/SR-AUDIT。

**七类 case：**
- **正常**：发起渠道退款 → awaiting_channel_callback → (UC-05 回调) refunded + released。
- **异常（失败回滚/退款）**：渠道退款失败回调 → saga 补偿，`failed→compensated`，权益不释放（既未扣又未误退），告警事件入箱。
- **特殊**：仅退差额（部分退）→ `partially_refunded`，账本红冲差额。
- **逃逸通道**：渠道侧不可用 → 退款挂起 + 退款 kill-switch（UC-adminkill-01）可暂停退款流水线，人工接管，不丢单。
- **高并发（竞态 CAS）**：退款 `reserved→released` 与 mock-interview run 内 `reserved→committed` 并发 → **run 锁 + CAS 串行化**：要么 run 先 commit（退款转 proration），要么退款先 release（run 收到 reserved 失效安全终止）；**不会两者都成功**。
- **复杂（多步 saga/部分失败）**：渠道退成功但权益回滚失败 → 补偿重试 + 标 `failed`，对账事件标记"已退款待权益核对"，不静默。
- **刁钻**：用户察觉退款发起后疯狂消费剩余次数 → 退款执行前对在途/新建 run 的 reserved 加锁，发起后新 run 申请 reserved 被拒（CAS 看到退款锁）。

**测试用例：**
- `TC-adminorder-03-normal` [集成]：执行 → awaiting_channel_callback；注入成功回调 → refunded + released + 账本红冲。
- `TC-adminorder-03-exception` [集成]：mock 渠道失败回调 → `compensated`，reserved 不释放，**告警事件入 outbox（断言事件非下游）**。
- `TC-adminorder-03-special-partial` [集成]：部分退 → `partially_refunded`，红冲差额。
- `TC-adminorder-03-escape-killswitch` [集成]：退款 kill-switch tripped → 流水线暂停，单挂起不丢。
- `TC-adminorder-03-concurrency` [graph+集成]：并发 release 与 run commit → 断言二者互斥，无"已退款 run 仍 commit"。
- `TC-adminorder-03-complex-partialfail` [集成]：渠道退成功+权益回滚失败 → 补偿重试，对账标记入箱。
- `TC-adminorder-03-tricky-race-spend` [集成]：退款发起后新 run reserved 申请 → 被退款锁 CAS 拒绝。

---

## UC-adminorder-04 外部拒付 / chargeback / 平台介入

- **角色**：系统（对账感知）/ finance 处置
- **前置**：渠道侧推送拒付/争议，或对账发现外部退款
- **触发**：`chargeback_received` 事件入站（external→local 方向，与 UC-05 退款结果回调区分：本 UC 是用户主动拒付，UC-05 是我方发起退款的结果回调）
- **主流程**：
  1. **验签**（渠道公钥/HMAC）失败 → 入隔离队列人工核，不改账。
  2. 对账感知 → `RefundOrder: chargeback_received→reconciling`，幂等去重（同一 chargeback id）。
  3. `PaymentOrder` 被动迁移（标记争议/已外部退）。
  4. **权益反向追回（clawback）**：CAS `ConsumptionRecord: committed→clawed_back`，生成 `ClawbackRecord` 落消费账本红冲；已消费完 → 记账（负余额 vs 仅记账见 openDecisions）。
  5. 争议需举证 → `disputed`，材料提交渠道。
- **后置**：`RefundOrder→clawback_issued|disputed`；账本 clawback 红冲；audit(chargeback)。
- **关联**：契约 `POST /admin/chargebacks/webhook`、`POST /admin/chargebacks/:id/dispute`；状态机 RefundOrder(外部分支) + ConsumptionRecord(clawed_back)；CAS·幂等(chargeback id)·RLS·事件日志；SR-ANTIFRAUD/SR-AUDIT。

**七类 case：**
- **正常**：拒付入站 → reconciling → clawback_issued。
- **异常（回滚）**：clawback 写账本失败 → 整体回滚，不留"标记拒付但权益未追回"。
- **特殊**：用户已消费完全部次数后拒付 → ClawbackRecord 记账（见 openDecisions），不强行负扣到崩。
- **逃逸通道**：webhook 真伪不明 → 验签失败入隔离队列人工核，不直接 clawback。
- **高并发（竞态）**：同一 chargeback 重复推送 → 幂等键去重，clawback 仅一次（CAS committed→clawed_back）。
- **复杂（外部→本地 saga）**：本地退款(UC-03)与外部 chargeback 同时到 → 去重：已 refunded 的单收到 chargeback → 识别重复退，仅对账标记不二次扣。
- **刁钻（恶意拒付套利）**：用户消费完再恶意拒付 → clawback + 风控标记 + 进黑名单池（SR-ANTIFRAUD），后续下单加验。

**测试用例：**
- `TC-adminorder-04-normal` [集成]：webhook → clawback_issued + 账本红冲。
- `TC-adminorder-04-exception` [集成]：mock 账本写失败 → 回滚，状态不前进。
- `TC-adminorder-04-special-consumed` [集成]：已用完后拒付 → ClawbackRecord 记账不崩。
- `TC-adminorder-04-escape-sig` [集成]：伪造 webhook 签名 → 入隔离队列，不 clawback。
- `TC-adminorder-04-concurrency` [集成]：重复 webhook → 幂等，clawback 一次（CAS）。
- `TC-adminorder-04-complex-double` [集成]：已 refunded 单再 chargeback → 识别重复，不双扣。
- `TC-adminorder-04-tricky-abuse` [集成]：消费完恶意拒付 → 风控标记 + 黑名单事件入箱。

---

## UC-adminorder-05 退款渠道异步回调摄入（webhook：验签 + 重放 + 乱序 + 回调先于本地落库）— 新增，评审②退款域最大缺口

- **角色**：系统（渠道 webhook 入站）/ finance 监控
- **前置**：UC-adminorder-03 已发起渠道退款，`RefundOrder=awaiting_channel_callback`，幂等键=渠道退款单号 `refundChannelTxnId`
- **触发**：支付渠道异步回调退款结果（成功/失败/处理中）
- **主流程**：
  1. **验签**（渠道公钥/HMAC），失败 → 入隔离队列人工核，**不改账**（防伪造回调凭空 release 权益）。
  2. **幂等键=渠道退款单号 CAS 去重**，重复回调返回首次处理结果。
  3. **乱序保护**：回调携带渠道序号/时间戳，状态机**只接受单调前进**（`refunded` 后再收到 `processing` 回调 → 丢弃记审计）。
  4. **回调先于本地落库**：webhook 早于本地 `awaiting_channel_callback` 提交到达 → 暂存 `pending_match`，本地落库后对账匹配；超 `REFUND_CALLBACK_TIMEOUT` 仍无本地单 → 告警人工核（防回调指向不存在的本地单）。
  5. 成功回调 → CAS `awaiting_channel_callback→refunded|partially_refunded`；失败回调 → `→failed→compensated`（释放退款锁，ConsumptionRecord 按消费口径回 reserved/committed）。
  6. 与主动轮询对账互为补偿：webhook 与 reconcile 谁先到谁落，另一个幂等。
- **后置**：`RefundOrder` 终态；`ConsumptionRecord` 落点；audit(refund_callback)；账本红冲/回滚。
- **关联**：契约 `POST /admin/refunds/webhook`；状态机 RefundOrder(awaiting_channel_callback→终态)；CAS·幂等(渠道退款单号)·RLS·事件日志；SR-ANTIFRAUD/SR-AUDIT。**渠道错误 taxonomy 显式定义（unknown/timeout/explicit_fail/insufficient/duplicate），fake 渠道按此建模可测（解评审③渠道错误分类未定义）。**

**七类 case：**
- **正常**：成功回调 → refunded。
- **异常（失败回滚/退款）**：明确失败回调（taxonomy=explicit_fail）→ `compensated`，退款锁释放，权益按口径回 reserved/committed，无"以为退成功"。
- **特殊（边界）**：处理中回调（taxonomy=processing）→ 不前进终态，保持 awaiting_channel_callback 等最终回调；i18n 渠道错误码映射。
- **逃逸通道**：回调验签不可用/渠道证书轮换 → 入隔离队列 + 退款 kill-switch 可暂停摄入，人工核，不盲信。
- **高并发（竞态）**：同一成功回调重复推送 N 次 + 轮询对账同时落 → 幂等键 CAS，仅一次状态迁移，账本仅红冲一次。
- **复杂（乱序/回调先于落库）**：webhook 先于本地提交到达 → `pending_match` → 本地落库后匹配；乱序 processing 晚于 refunded 到达 → 丢弃记审计。
- **刁钻（伪造/重放）**：攻击者伪造成功回调指向任意本地单 → 验签失败拒；重放历史合法回调 → 幂等去重 + 单调状态拒；回调指向不存在本地单 → pending_match 超时告警不落账。

**测试用例：**
- `TC-adminorder-05-normal` [集成]：签名有效成功回调 → refunded + 账本红冲一次。
- `TC-adminorder-05-exception` [集成]：taxonomy=explicit_fail 回调 → compensated，退款锁释放，权益回 reserved。
- `TC-adminorder-05-special-processing` [集成]：processing 回调 → 保持 awaiting_channel_callback 不前进。
- `TC-adminorder-05-escape-isolate` [集成]：验签失败 → 入隔离队列，账不变；kill-switch 暂停摄入。
- `TC-adminorder-05-concurrency` [集成]：重复成功回调×N + 对账并发 → 幂等键 CAS，仅一次迁移与红冲。
- `TC-adminorder-05-complex-ooo` [集成]：webhook 先于本地落库 → pending_match → 本地落库后匹配；processing 晚到 refunded → 丢弃记审计。
- `TC-adminorder-05-tricky-forge` [集成]：伪造回调/重放/指向不存在单 → 验签拒 / 幂等拒 / pending_match 超时告警不落账。

---

# 模块四：内容 / 题库审核（admincontent）

## UC-admincontent-01 题库审核（注入检测走对抗黄金集）

- **角色**：content reviewer（`content.review`）
- **前置**：题处于 `in_review`；待审内容视为**不可信输入**（放数据块，绝不拼进 system 指令）
- **触发**：审核一批待发布题
- **主流程**：1. 题文进入注入/越狱检测（SR-INJECT），**走对抗语料 ai-eval 黄金集 + 多语种/编码/变体绕过检测**，非单关键词 `includes()`；2. 双校验（schema + 业务：题型/答案/标签合法）；3. 通过 → `in_review→approved`，**未通过不入向量库**（真隔离）；4. 人工终审可覆盖。
- **后置**：`ContentItem: in_review→approved|rejected`；ai_invocation_traces(检测) + audit(review)。
- **关联**：契约 `POST /admin/content/:id/review`；状态机 ContentItem；幂等·RLS·事件日志；SR-INJECT/SR-AUDIT；ai-runtime 双校验。

**七类 case：**
- **正常**：干净题 → approved。
- **异常（回滚）**：检测服务超时 → 题停 `in_review`，不默认放行（fail-closed），可重试。
- **特殊**：空题/超长题/纯符号/中英混排 → 边界拒绝或标注；i18n 题。
- **逃逸通道**：检测模型不可用 → 降级到规则+人工双复核，**绝不自动 approved**。
- **高并发**：同题并发审核 → CAS `in_review→approved` 仅一次。
- **复杂**：批量审核部分含注入 → 逐题隔离，干净题 approved、污染题 rejected，部分失败不连坐。
- **刁钻（注入/越狱/泄题）**：题文藏 `ignore previous instructions`、base64/Unicode 同形字/多语种变体 → **对抗黄金集断言检测率**，命中即拒且**不入向量库直到通过**。

**测试用例：**
- `TC-admincontent-01-normal` [graph-fake-model]：干净题 → approved。
- `TC-admincontent-01-exception` [集成]：mock 检测超时 → 停 in_review，未自动放行。
- `TC-admincontent-01-special-boundary` [单元]：空/超长/纯符号题边界处理。
- `TC-admincontent-01-escape` [集成]：检测模型不可用 → 转人工双复核，无自动 approved。
- `TC-admincontent-01-concurrency` [集成]：并发审核同题 → CAS 一次。
- `TC-admincontent-01-tricky` [ai-eval]：**对抗语料黄金集**（多语种/base64/同形字/变体）跑检测，断言检出率阈值 + 未过题确未进向量库（查 search_index 无该 embedding）。

---

## UC-admincontent-02 题发布 + 向量化 + 抽题就绪 gating

- **角色**：content reviewer / 系统
- **前置**：题 `approved`
- **触发**：发布上线
- **主流程**：1. CAS `approved→published`；2. 异步向量化，`search_index: pending→indexed`；失败 → `failed`，补偿重试；3. **抽题 gating：resume-quiz/mock-interview 仅抽 `search_index=indexed` 的题**，published-but-unindexed 半态题**不流入面试**。
- **后置**：`ContentItem→published`；`search_index→indexed|failed`；audit(publish)。
- **关联**：契约 `POST /admin/content/:id/publish`；状态机 ContentItem + search_index；CAS·幂等·RLS·事件日志；与 ai-graphs 抽题 gating 关联。

**七类 case：**
- **正常**：发布 → published → indexed → 可抽。
- **异常（回滚）**：向量化失败 → `failed`，补偿重试，**抽题侧不抽该题**（半态隔离）。
- **特殊**：超大题批量向量化 → 分批 + 进度事件；i18n 题独立 embedding。
- **逃逸通道**：向量服务不可用 → 题保持 published+pending，抽题 gating 自动跳过，告警入箱。
- **高并发**：并发发布 + 抽题 → 抽题快照仅含 indexed，未就绪题不被并发抽到。
- **复杂**：published-but-unindexed 长时间未恢复 → 监控告警 + 可手动重索引；下架则 `published→archived` 并移出抽题池。
- **刁钻**：构造发布即抢抽（发布瞬间面试请求）→ gating 以 `search_index=indexed` 为唯一准入，未就绪一律不抽。

**测试用例：**
- `TC-admincontent-02-normal` [集成]：发布 → indexed，可被抽题夹具抽中。
- `TC-admincontent-02-exception` [集成]：mock 向量化失败 → `failed`，抽题查询排除该题。
- `TC-admincontent-02-special-batch` [集成]：批量向量化分批进度事件。
- `TC-admincontent-02-escape` [集成]：向量服务不可用 → published+pending，抽题跳过 + 告警入箱。
- `TC-admincontent-02-concurrency` [graph]：发布瞬间并发抽题 → 仅 indexed 题入候选。
- `TC-admincontent-02-tricky-gating` [graph]：published-but-unindexed 题在 race 下确未被抽中。

---

## UC-admincontent-03 泄题紧急撤回（安全默认：标记 + 可中止在途 + 回标报告）— 新增，评审④弱默认纠正

- **角色**：content reviewer / security（`content.recall`，高危→走 UC-admindanger-01）
- **前置**：题 `published` 且 `indexed`，发现泄露/泄题/答案外泄
- **触发**：发起紧急撤回（**区别于常规 unpublish 的弱默认**）
- **主流程**：
  1. CAS `published→archived` 并**立即将 search_index 置 `unusable`，即时移出抽题池**（新面试不再抽）。
  2. **阻断在途 + 可中止（安全默认而非仅阻断新分发）**：扫描在途 AiGraphRun 正使用该题者 → 标记 affected；按策略**安全中止在途 run**（interrupt → `aborted_by_recall`）或允许收尾但标记结果污染。
  3. **回标已生成报告（核心，解评审"手挥"）**：受影响 Interview/AssessmentReport（已 finalize 终态）→ 触发 **report subgraph 的"题失效回标"重迁移**：`finalized→amending→amended`，打 `tainted_question` 标记 + 重算/降权该题贡献（report 自己的状态机迁移，非手挥）。
  4. 全程 danger 四眼 + 强审计 + 通知受影响用户（UC-adminnotify-01）。
- **后置**：`ContentItem→archived(unusable)`；受影响 run `aborted_by_recall`；`AssessmentReport: finalized→amending→amended`；audit(content_recall)。
- **关联**：契约 `POST /admin/content/:id/recall`；状态机 ContentItem + AiGraphRun + AssessmentReport(amend)；CAS·幂等·RLS·事件日志；SR-INJECT/SR-AUDIT；report subgraph 关联。

**七类 case：**
- **正常**：撤回 → archived，移出抽题池，受影响报告回标 amended。
- **异常（回滚/补偿）**：回标子步骤失败 → 撤回与回标同 saga，标记"撤回成功/回标待重试"（题已止血优先，报告回标补偿重试），不静默丢。
- **特殊（边界）**：无在途 run/无已生成报告 → 仅 archived；i18n 通知。
- **逃逸通道**：report 回标引擎不可用 → 题先 archived 止血 + 受影响报告挂 `tainted` 待回标队列，不阻塞止血。
- **高并发（竞态）**：撤回与新面试抽题并发 → gating 以 `search_index=unusable` 即时拒抽（与 UC-admincontent-02 同闸门），在途 run 标记一致。
- **复杂（跨聚合 saga）**：撤回触发 [移出抽题池 + 中止 K 个在途 run + 回标 M 份终态报告] 多步 → 部分失败补偿 + 对账标记，全程审计。
- **刁钻（应急对抗）**：攻击者趁撤回窗口疯狂发起含泄露题面试 → archived 即时阻断 + 在途中止，"窗口期跑完"被中止语义截断；伪撤回（滥用 recall 删竞品题）→ danger 四眼 + 强审计可追溯。

**测试用例：**
- `TC-admincontent-03-normal` [集成]：recall → archived + 移出抽题 + 受影响报告 amended。
- `TC-admincontent-03-exception` [集成]：mock 回标失败 → 题 archived 成功、报告入回标重试队列，不静默。
- `TC-admincontent-03-special-noinflight` [集成]：无在途/无报告 → 仅 archived。
- `TC-admincontent-03-escape-reportdown` [集成]：report 引擎不可用 → 止血不阻塞，报告挂 tainted 待回标。
- `TC-admincontent-03-concurrency` [graph]：撤回瞬间并发抽题 → unusable 即时拒抽，在途标记一致。
- `TC-admincontent-03-complex-saga` [集成]：撤回 + 中止 K run + 回标 M 报告 → 部分失败补偿 + 对账。
- `TC-admincontent-03-tricky-window` [graph+集成]：撤回窗口期发起面试 → 在途中止截断；伪撤回 → danger 拦截 + 审计。

---

## UC-admincontent-04 AI 生成题专用闸门（指定人类 owner 替代四眼）— 新增，评审④"AI 无自然人 submitter"

- **角色**：content reviewer（`content.review`）+ AI 生成管线
- **前置**：AI 混合批生成的待审题（无自然人 submitter）
- **触发**：审核 AI 生成批次
- **主流程**：
  1. **AI 生成内容禁止自动 approved**：四眼"submitter≠reviewer"对 AI 批失效 → 改为**强制指定人类 owner（accountable human）作为不同闸门**，owner≠reviewer（两名自然人）。
  2. AI 批先过 UC-admincontent-01 注入/越狱检测（对抗黄金集）+ 双校验。
  3. **不得自审**：生成该批的 AI/管线身份记入 traces；人类 owner 担保事实性（防 AI 幻觉简历事实/编造"标准答案"），reviewer 独立复核 → approved。
  4. 高比例 AI 生成批按 `AI_CONTENT_SAMPLE_RATE` 抽样人工精审。
- **后置**：`ContentItem: in_review→approved|rejected`；owner/reviewer 双自然人审计；ai_invocation_traces。
- **关联**：契约 `POST /admin/content/ai-batch/:id/review`；状态机 ContentItem；幂等·RLS·事件日志；SR-INJECT/SR-AUDIT；ai-runtime 双校验。

**七类 case：**
- **正常**：AI 批 + owner 担保 + reviewer 复核 → approved。
- **异常（回滚）**：检测/双校验失败 → rejected，不入向量库。
- **特殊（边界）**：owner 未指定 → 拒绝进入审核（硬闸门）；i18n。
- **逃逸通道**：检测模型不可用 → 转人工双复核，AI 批绝不自动放行。
- **高并发**：并发审同 AI 批 → CAS 一次。
- **复杂**：混合批（人写+AI 生成）→ AI 子集走 owner 闸门，人写子集走标准四眼，分流不混。
- **刁钻（AI 幻觉/绕审）**：AI 题暗含编造的"标准答案"或幻觉简历事实 → owner 事实性担保 + 业务校验拦截；AI 自审自批（管线身份冒充 reviewer）→ owner≠reviewer≠管线身份三方校验拒。

**测试用例：**
- `TC-admincontent-04-normal` [graph-fake-model]：AI 批 + owner + reviewer → approved。
- `TC-admincontent-04-exception` [集成]：双校验失败 → rejected，未入向量库。
- `TC-admincontent-04-special-noowner` [集成]：未指定 owner → 403 不可进审。
- `TC-admincontent-04-escape` [集成]：检测不可用 → 转人工双复核，无自动放行。
- `TC-admincontent-04-concurrency` [集成]：并发审同 AI 批 → CAS 一次。
- `TC-admincontent-04-complex-mixed` [集成]：混合批分流，AI 子集走 owner 闸门。
- `TC-admincontent-04-tricky-hallucinate` [ai-eval]：AI 幻觉答案/事实 → owner+业务校验拦截；管线冒充 reviewer → 三方身份校验拒。

---

# 模块五：运营位（adminops）

## UC-adminops-01 运营位排期（banner/活动，时区语义）

- **角色**：ops（`ops.placement`）
- **前置**：登录态有效
- **触发**：创建/编辑运营位排期（携带 IANA 时区）
- **主流程**：1. 排期窗口 UTC 存储 + 显式时区解释；2. 调度器到点 CAS `scheduled→live`、结束 `live→ended`（漏跑补跑见 UC-adminscheduler-01）；3. 审计。
- **后置**：`OpsPlacement: draft→scheduled→live→ended|killed`；audit(placement)。
- **关联**：契约 `POST /admin/placements`；状态机 OpsPlacement；CAS·幂等·RLS·事件日志；SR-AUDIT。

**七类 case：**
- **正常**：排期到点 live。
- **异常（回滚）**：上线时素材校验失败 → 不 live，停 scheduled + 告警，不展示半成品。
- **特殊（时区/DST）**：跨时区排期、DST 切换日 → 用 UTC 绝对边界到点，不早不晚。
- **逃逸通道**：误投放 → kill `→killed` 立即下线（危险操作二次确认）。
- **高并发（竞态 CAS）**：调度器多实例并发到点触发 → CAS `scheduled→live` 仅一次，不重复上线。
- **复杂**：多运营位排期重叠 + 优先级 → 冲突解析，按优先级展示，审计冲突决策。
- **刁钻**：排期时间设为过去/极远未来绕过审核窗口 → 校验拒绝；素材含 XSS → 输出转义 + CSP。

**测试用例：**
- `TC-adminops-01-normal` [集成]：到点 → live。
- `TC-adminops-01-exception` [集成]：素材校验失败 → 停 scheduled + 告警事件。
- `TC-adminops-01-special-dst` [单元]：DST 切换日排期用 UTC 边界，到点精确。
- `TC-adminops-01-escape-kill` [集成]：kill → killed 立即下线。
- `TC-adminops-01-concurrency` [集成]：多调度实例并发 → CAS 仅一次上线。
- `TC-adminops-01-tricky-xss` [e2e]：素材 XSS → 转义 + CSP 拦截。

---

## UC-adminops-02 兑换码批次生成（确定性分片断点续生成 + 加密随机码抗碰撞）— 新增，解评审②"随机不幂等"矛盾

- **角色**：ops（`ops.batch.create`，高危→走 UC-admindanger-01）
- **前置**：活动预算/SKU 目录有效（UC-admincommerce-02）
- **触发**：创建批次并生成 N 张码
- **主流程**：
  1. `RedemptionCodeBatch: draft`，登记 `total_quota`、预算、有效期（时区语义）、生成计划 `generation_plan`（确定性：分片大小 + **已落库游标 cursor** + 批次 seed）。
  2. **确定性分片续生成（解"随机生成天然不幂等"矛盾）**：码 = 加密随机熵（抗碰撞/抗预测）+ DB unique index；**生成进度由 cursor 持久化**，中断重试从 cursor 续生成"未落库的剩余张数"，**幂等性来自"已落库游标 + unique 约束"而非可重放的确定性随机**——随机熵保证抗预测，cursor 保证不重不漏。
  3. unique 约束冲突（极低概率碰撞）→ 重抽该张，cursor 不前进直到落库成功。
  4. 全部生成 → `draft→active`（issued_count 初始化）。
- **后置**：`Batch: draft→active`；码全部落库；audit(batch_create)。
- **关联**：契约 `POST /admin/batches`；状态机 RedemptionCodeBatch；CAS(cursor 前进 + unique 约束)·幂等(批次键 + cursor)·RLS·事件日志；SR-ANTIFRAUD/SR-AUDIT。

**七类 case：**
- **正常**：生成 N 张 → active。
- **异常（回滚）**：生成中途 DB 故障 → 已落库码保留，cursor 标记断点，重试续生成剩余，不重不漏。
- **特殊（边界）**：N=0/超大批分批进度事件；有效期时区边界。
- **逃逸通道**：熵源/KMS 不可用 → 暂停生成 + 告警，**不退化为弱随机/顺序码**（保抗预测）。
- **高并发（竞态）**：并发两次"续生成"同批次 → cursor advisory lock/CAS 串行，不重复发码，issued 预登记不超 quota。
- **复杂（断点续传）**：生成到 6 万/10 万崩溃 → 重试从 cursor=60000 续生成 4 万，最终恰 10 万张、零重复。
- **刁钻（可预测/碰撞/刷量）**：攻击者据已知码预测后续码 → 加密随机熵抗预测；构造碰撞 → unique 约束 + 重抽；枚举生成接口刷量 → 创建走 danger 四眼 + 限频。

**测试用例：**
- `TC-adminops-02-normal` [集成]：生成 N → active，码数=N 且全 unique。
- `TC-adminops-02-exception` [集成]：注入中途 DB 故障 → 重试续生成，最终数=N，零重复（unique 校验）。
- `TC-adminops-02-special-batch` [集成]：超大批分批进度事件；N=0 边界。
- `TC-adminops-02-escape-entropy` [集成]：mock 熵源不可用 → 暂停 + 告警，不降级弱随机。
- `TC-adminops-02-concurrency` [集成]：并发续生成同批 → cursor 锁串行，issued 不超 quota，零重复。
- `TC-adminops-02-complex-resume` [集成]：6 万处崩溃 → 从 cursor 续生成至 10 万，断言总数与零重复。
- `TC-adminops-02-tricky-predict` [单元]：码熵/分布检验抗预测；碰撞注入 → 重抽落库。

---

## UC-adminops-03 兑换码批次核销（批次级超发 CAS — P0）

- **角色**：用户核销（C 端触发）/ ops 管理批次
- **前置**：批次 `active` 且未过期（时区语义；过期判定核销侧读时再校验绝对截止，UC-adminscheduler-01）
- **触发**：用户提交兑换码
- **主流程（多步 saga，validate-then-commit）**：
  1. **先校验批次冻结/过期/预算**（前置校验在锁码之前）。
  2. 单码 CAS `unused→locked→redeemed`（防同码多抢）。
  3. **批次级超发防护**：`issued_count` 原子自增 + 上界 CAS（`issued_count < total_quota`），击穿即拒。
  4. **单用户限领 CAS**：`(userId,batchId)` 计数 < `REDEMPTION_PER_USER_LIMIT`。
  5. **活动预算预扣（reserved budget）**：原子预扣权益成本，预算耗尽拒发。
  6. 发放权益 → 写消费账本；**任一步失败补偿回滚码锁 + issued_count 回减 + 计数回退 + 预算回补**（解评审②"码锁成功但限领 CAS 失败是否回滚码锁"——明确：整 saga 任一失败全补偿）。
- **后置**：`RedemptionCode: unused→redeemed`；`Batch.issued_count++`；权益入账本；audit(redeem)。
- **关联**：契约 `POST /redeem`（C 端）+ `GET/POST /admin/batches`；状态机 RedemptionCode + Batch；**CAS(单码 + 批次 issued_count 上界 + 单用户计数 + 预算预扣)**·幂等(码+userId)·RLS·事件日志；SR-ANTIFRAUD。

**七类 case：**
- **正常**：有效码 + 未超量 + 未超限领 → 发权益。
- **异常（回滚）**：权益发放失败 → 码 CAS 回 `unused`、`issued_count` 原子回减、计数回退、预算回补，无"码已用但权益没发"。
- **特殊**：批次过期（时区边界，核销侧读时校验）→ 拒；首次领取；i18n 文案。
- **逃逸通道**：兑换码 kill-switch tripped → 全批次暂停核销，在途 locked 码超时回滚 unused。
- **高并发（竞态 CAS — 核心）**：同码并发 → 单码 CAS 仅一次；**不同码并发击穿批次总量** → `issued_count` 上界 CAS，第 (quota+1) 个确定性拒绝；同用户并发领多张 → `(userId,batchId)` 计数 CAS 拒超领。
- **复杂（跨聚合）**：核销 = 码状态 + 批次计数 + 用户计数 + 预算 + 权益账本 多步 saga，任一失败全补偿（含"码锁成功但限领 CAS 失败 → 回滚码锁"显式断言）。
- **刁钻（爆破/刷码）**：脚本枚举码 + 并发核销刷量 → 频次锁定 + 批次/预算上界双闸；爆破触发 SR-ANTIFRAUD 锁定。

**测试用例：**
- `TC-adminops-03-normal` [集成]：有效码 → 发权益，issued_count+1。
- `TC-adminops-03-exception` [集成]：mock 权益发放失败 → 码回 unused、issued_count 回减、预算回补。
- `TC-adminops-03-special-expired` [单元+集成]：过期批次（时区边界，核销侧读时校验）→ 拒。
- `TC-adminops-03-escape-killswitch` [集成]：批次 kill → 核销暂停，locked 超时回 unused。
- `TC-adminops-03-concurrency-singlecode` [集成]：同码并发 N → 恰 1 成功（单码 CAS）。
- `TC-adminops-03-concurrency-batch` [集成]：**不同码并发 (quota+50)，quota=100 → 恰 100 成功、50 拒绝（批次 issued_count 上界 CAS，证总量不击穿）**。
- `TC-adminops-03-concurrency-peruser` [集成]：同用户并发领 5（limit=1）→ 恰 1 成功。
- `TC-adminops-03-tricky-bruteforce` [集成]：枚举爆破 → 频次锁定 + 预算上界拒；构造"码锁成功+限领失败" → 断言码锁补偿回滚 unused。

---

## UC-adminops-04 实时风控自动冻结（告警落可观测事件）

- **角色**：系统风控 / ops 监控
- **前置**：风控规则启用（策略化阈值）
- **触发**：异常行为命中规则（刷码/刷分/异常退款率）
- **主流程**：1. 命中规则 → CAS 冻结目标（账号/批次/活动）；2. **冻结动作与告警均落可观测事件（outbox domain event）**，测试断言事件入箱而非下游真发；3. 人工复核解冻。
- **后置**：目标 `→frozen/restricted`；audit + alert 事件 outbox。
- **关联**：契约 `POST /admin/risk/freeze`；状态机相关对象；CAS·幂等·事件日志；SR-ANTIFRAUD/SR-AUDIT。

**七类 case：**
- **正常**：命中 → 冻结 + 事件入箱。
- **异常（回滚）**：冻结写失败 → 回滚，不留"以为冻结实未冻"。
- **特殊**：阈值边界（命中值=阈值±1）→ 策略化可测断言。
- **逃逸通道**：风控引擎不可用 → 降级保守策略（宁可多冻 + 人工快速解冻），不放任。
- **高并发**：并发触发同目标冻结 → CAS 幂等，一次冻结。
- **复杂**：连锁冻结（用户+其批次+其订单）→ saga，部分失败补偿 + 标记。
- **刁钻（对抗风控）**：攻击者压低单账号频次、多账号分摊刷量 → 跨账号关联风控（设备/IP 指纹）+ 批次预算上界兜底。

**测试用例：**
- `TC-adminops-04-normal` [集成]：命中 → 冻结，**alert 事件入 outbox（断言事件，非下游）**。
- `TC-adminops-04-exception` [集成]：冻结写失败 → 回滚。
- `TC-adminops-04-special-threshold` [单元]：阈值±1 边界确定性触发/不触发。
- `TC-adminops-04-escape` [集成]：风控引擎不可用 → 保守冻结策略生效。
- `TC-adminops-04-concurrency` [集成]：并发冻结同目标 → CAS 一次。
- `TC-adminops-04-tricky-distributed` [集成]：多账号分摊刷量 → 关联风控 + 批次预算兜底拦截。

---

# 模块六：数据看板（admindash）

## UC-admindash-01 看板下钻（k-匿名 + 与 reveal 同源闸门 — P0）

- **角色**：ops/analyst（`dashboard.read`）
- **前置**：登录态有效
- **触发**：在看板上下钻维度（地域/渠道/SKU 交叉）
- **主流程**：1. 聚合查询；2. **k-匿名闸门**：任一下钻同质组人数 `< K_ANONYMITY_MIN(=5)` → 拒绝/合并显示；3. **跨 UC 隐私同源治理**：当下钻指向可识别个体 PII 时，**复用 UC-adminuser-02 的 `user.read.pii`+caseRef 闸门**，堵"无 pii 权限者反复下钻交叉反推个体"旁路（统一一把锁）。
- **后置**：无迁移；audit(drilldown, 含维度组合，反推检测)。
- **关联**：契约 `GET /admin/dashboard/drilldown`；RLS·事件日志；**SR-PII（k-匿名 + reveal 同源）**/SR-AUTHZ。

**七类 case：**
- **正常**：下钻同质组 ≥k → 返回聚合。
- **异常**：下游 OLAP 超时 → 可解释错误 + 标注，不返回半成品。
- **特殊**：恰 k 边界（=5 通过、=4 拒）；i18n 维度名；空维度。
- **逃逸通道**：OLAP 降级 → 返回粗粒度快照（不足以反推个体）+ 标注。
- **高并发**：读侧无写竞态（刷新侧并发见 UC-admindash-02）；但缓存击穿/雪崩按 UC-admindash-02 物化视图原子切换 + 限频兜底。
- **复杂（多维交叉逼近 k）**：连续多次小步下钻 + 交叉维度逼近个体 → **累积反推检测**：跨请求维度组合监控，逼近 k 边界即触发 caseRef 闸门或拒绝。
- **刁钻（隐私旁路 — 核心）**：无 `user.read.pii` 者用反复下钻+交叉维度反推到个体手机号 → **被同源 caseRef+k-匿名闸门拦截**（与 UC-adminuser-02 共用治理）。

**测试用例：**
- `TC-admindash-01-normal` [集成]：下钻 ≥k → 聚合返回。
- `TC-admindash-01-exception` [集成]：OLAP 超时 → 可解释错误。
- `TC-admindash-01-special-k` [集成]：**k=5 边界：组=5 通过、组=4 拒/合并（给定 k 可测）**。
- `TC-admindash-01-escape` [集成]：降级返回粗粒度，断言粒度不足反推个体。
- `TC-admindash-01-complex-multiaxis` [集成]：多维交叉逼近 k → 累积反推检测触发。
- `TC-admindash-01-tricky-bypass` [集成]：**无 pii 权限反复下钻反推个体 → 同源闸门拦截（与 TC-adminuser-02-tricky-bypass 共用夹具）**。

---

## UC-admindash-02 看板物化视图刷新（刷新并发 + 缓存击穿兜底）

- **角色**：系统调度 / analyst（`dashboard.refresh`）
- **前置**：物化视图/快照存在
- **触发**：定时或手动刷新
- **主流程**：1. 刷新前取 `DASHBOARD_REFRESH_LOCK`（每视图 advisory lock）；2. 刷新到临时表后**原子切换**（避免读到半成品快照）；3. 并发刷新被锁串行化或跳过；4. **缓存击穿兜底**：热点 key 失效用 single-flight 合并回源 + 旧值短暂兜底，防雪崩。
- **后置**：快照版本前进；audit(refresh) + refresh 事件。
- **关联**：契约 `POST /admin/dashboard/refresh`；CAS/advisory lock·事件日志；SR-AUDIT。

**七类 case：**
- **正常**：刷新 → 新快照原子可见。
- **异常（回滚）**：刷新中途失败 → 旧快照保留（原子切换未提交），无半成品暴露。
- **特殊**：首次刷新（无旧快照）→ 空态正确；大表刷新分批。
- **逃逸通道**：刷新引擎不可用 → 沿用旧快照 + 标注"数据陈旧 asOf"，不空屏。
- **高并发（核心）**：**两次刷新并发** → advisory lock 串行化/跳过，**不互相覆盖**；**刷新与读取并发** → 读到切换前完整旧快照或切换后完整新快照，**绝不读半成品**；**缓存击穿** → single-flight 合并回源不放大。
- **复杂**：多视图级联刷新依赖 → 拓扑序刷新，部分失败标记下游陈旧。
- **刁钻**：高频手动刷新打爆资源 → 刷新限速 + 合并去重（debounce）。

**测试用例：**
- `TC-admindash-02-normal` [集成]：刷新 → 新快照原子可见。
- `TC-admindash-02-exception` [集成]：刷新中途失败 → 旧快照完整保留。
- `TC-admindash-02-special-first` [集成]：首次刷新空态。
- `TC-admindash-02-escape` [集成]：引擎不可用 → 旧快照 + asOf 陈旧标注。
- `TC-admindash-02-concurrency-refresh` [集成]：**两并发刷新 → advisory lock，互不覆盖，最终一致**。
- `TC-admindash-02-concurrency-readwrite` [集成]：刷新与读并发 → 读到完整旧或完整新，**断言永不半成品**；热点 key 失效并发回源 → single-flight 仅一次回源。
- `TC-admindash-02-tricky-flood` [集成]：高频刷新 → debounce 合并 + 限速。

---

# 模块七：权限分级（adminrbac）

## UC-adminrbac-01 RBAC 授权

- **角色**：super_admin（`rbac.manage`）
- **前置**：登录态有效
- **触发**：分配/回收角色权限
- **主流程**：1. 权限变更 CAS（基于角色版本）；2. 变更即时生效（鉴权读最新角色版本，不缓存陈旧）；3. 高危权限（pii/refund/danger）分配本身为危险操作 → 四眼。
- **后置**：角色版本前进；audit(rbac_change)。
- **关联**：契约 `POST /admin/roles/:id/grants`；状态机（角色版本）；CAS·幂等·RLS·事件日志；SR-AUTHZ/SR-AUDIT。

**七类 case：**
- **正常**：授权 → 即时生效。
- **异常（回滚）**：授权写部分失败 → 回滚，无半授权态。
- **特殊**：授予不存在权限/越权授予超自身权限 → 拒（不可提权超过自身）。
- **逃逸通道**：误授高危权限 → 即时回收 + 强制相关会话重鉴权。
- **高并发（竞态 CAS）**：并发改同角色 → 角色版本 CAS，后者基于陈旧版本冲突重试。
- **复杂**：批量调整角色矩阵 → 事务一致，部分失败全回滚。
- **刁钻（提权）**：support 尝试自授 `user.read.pii`/`refund.approve` → 越权拦截（不可授超自身 + 高危需 super_admin + 四眼）。

**测试用例：**
- `TC-adminrbac-01-normal` [集成]：授权 → 下次鉴权生效。
- `TC-adminrbac-01-exception` [集成]：部分失败 → 全回滚。
- `TC-adminrbac-01-special-overgrant` [集成]：授超自身权限 → 403。
- `TC-adminrbac-01-escape` [集成]：误授回收 → 相关会话强制重鉴权。
- `TC-adminrbac-01-concurrency` [集成]：并发改同角色 → 版本 CAS 冲突重试。
- `TC-adminrbac-01-tricky-privesc` [集成]：自授高危权限 → 拦截。

---

## UC-adminrbac-02 唯一 super_admin 保护 + 最小管理员 + 审批人池防合谋 + break-glass

- **角色**：super_admin
- **前置**：系统管理员集合
- **触发**：禁用/降级某 super_admin，或危险操作遇四眼死锁
- **主流程**：
  1. 禁用 super_admin 前 CAS 校验"剩余可用 super_admin ≥ 最小值（≥2）"，否则拒（防唯一管理员锁死）。
  2. **审批人池容量与防合谋（评审⑨）**：四眼要求每角色**≥2 合格自然人**；**大额退款显式约束"审批人 ≠ danger 复核人 ≠ 发起人"三方分离**（同一 finance 不可同时充当退款审批与 danger-approver，防四眼被击穿）。
  3. **四眼死锁解（break-glass）**：若合规复核人仅 1 且正是发起人，危险操作走 **break-glass 应急通道**：更强审计 + 单人执行 + **24h 内须 ≥1 名非发起 super_admin 事后追认**，否则自动升级告警 + 冻结该 break-glass。
  4. 审批人池容量不足（角色<2 合格人）→ 显式拒绝高危操作并提示组织补充（非静默降标）。
- **后置**：`AdminAccount` 迁移受最小集合约束；break-glass 事件 + 追认状态机。
- **关联**：契约 `POST /admin/admins/:id/disable`、`POST /admin/break-glass`；状态机 AdminAccount + break-glass 追认；CAS(最小集合)·事件日志；SR-AUTHZ/SR-AUDIT。

**七类 case：**
- **正常**：禁用非唯一 super_admin → 成功。
- **异常（回滚）**：禁用致低于最小集合 → CAS 拒绝，状态不变。
- **特殊**：恰好剩 2 个时禁用 1 个 → 拒（须 ≥2 可用）；大额退款发起人=审批人=danger 复核人 → 三方分离校验拒。
- **逃逸通道**：四眼死锁 → break-glass 单人执行 + 强审计 + 事后追认（不永久卡死，也不静默降标）。
- **高并发（竞态）**：并发禁用两个 super_admin → 最小集合 CAS 串行化，避免两个同时通过致归零。
- **复杂**：break-glass 执行后追认超时 → 自动告警升级 + 冻结 break-glass 账号，全程审计链。
- **刁钻（合谋/自批）**：发起人滥用 break-glass 绕四眼 → 强审计 + 强制事后追认 + 追认人≠发起人，未追认即冻结；finance 一人兼审批与 danger 复核 → 三方分离校验拒。

**测试用例：**
- `TC-adminrbac-02-normal` [集成]：禁用非唯一 → 成功。
- `TC-adminrbac-02-exception` [集成]：禁用致低于最小集合 → 拒，状态不变。
- `TC-adminrbac-02-special-min2` [集成]：剩 2 禁 1 → 拒；三方分离（发起=审批=复核）→ 拒。
- `TC-adminrbac-02-escape-breakglass` [集成]：死锁 → break-glass 单人执行 + 强审计事件。
- `TC-adminrbac-02-concurrency` [集成]：并发禁两个 super_admin → CAS 串行，不归零。
- `TC-adminrbac-02-tricky-abuse` [集成]：break-glass 后 24h 未追认 → 自动冻结 + 升级告警事件；finance 兼审批+复核 → 拒。

---

# 模块八：操作审计（adminaudit）

## UC-adminaudit-01 审计落账（业务强一致 + 事务性 outbox + 链上防篡改 + 高危枚举表 — P0）

- **角色**：系统（所有写动作自动触发）/ auditor 查阅
- **前置**：任意敏感动作
- **触发**：状态迁移/敏感读写
- **主流程（业务事实表强一致 + 审计经事务性 outbox 投递，不与业务同库同事务插 log）**：
  1. **业务事实表强一致**写入（业务表 + 同事务写 outbox 行，单事务原子）。
  2. **审计经事务性 outbox 投递**到**独立 append-only 哈希链存储**（`prev_hash→entry_hash` 链，可验证不可篡改），**不与业务同库同事务插 log**。
  3. **按动作风险分级决定"是否阻塞业务"**（高危=outbox 确认前不放行后续 / 普通=异步），**而非是否同事务**。
  4. **高危动作显式枚举表（fail-closed 强一致清单，删除"或 outbox 按风险分级"的模糊措辞）**：`reveal`、`refund execute`、`refund callback`、`clawback`、`ban`、`rbac 高危授权`、`break-glass`、`kill-switch 拨动`、`批量 danger 执行`、`export 含 PII`、`隐私 erasure`、`content recall`、`commerce 改价/下架`。**未在表内的动作默认按高危处理（fail-closed 缺省）。**
  5. PII 仅落摘要/密文（配合 UC-adminprivacy-01 crypto-shredding）。
- **后置**：审计链前进；不可篡改可验证。
- **关联**：契约 `GET /admin/audit`；CAS(链 head)·幂等(事件 id)·事件日志(outbox)；SR-AUDIT。

**七类 case：**
- **正常**：动作 → 业务强一致 + 审计链追加。
- **异常（回滚）**：高危动作 outbox 写失败 → 业务事务回滚（同事务写 outbox 行保证），无"业务成了审计丢了"。
- **特殊**：海量审计分区 + 链分段锚定；i18n 动作名。
- **逃逸通道**：链上存储不可用 → outbox 积压重试，高危动作 fail-closed（审计未确认不放行），普通动作降级异步补投。
- **高并发（竞态）**：并发动作写同一链 → 链 head CAS 串行追加，哈希链不断裂。
- **复杂**：跨服务分布式动作的审计聚合 → 同 correlationId 串联，部分服务失败标记缺口。
- **刁钻（篡改/抵赖）**：改历史审计行 → 哈希链校验断裂可检测；删除中间行 → prev_hash 不连续暴露；伪造事件 id → 幂等去重 + 链校验；新增未登记的高危动作 → 默认按高危 fail-closed（不静默落 outbox 弱路径）。

**测试用例：**
- `TC-adminaudit-01-normal` [集成]：动作 → 业务表 + 审计链各一致追加。
- `TC-adminaudit-01-exception` [集成]：mock outbox 写失败（高危）→ 业务事务回滚（断言业务表无变更）。
- `TC-adminaudit-01-special-partition` [集成]：分区 + 链分段锚定验证。
- `TC-adminaudit-01-escape` [集成]：链存储不可用 → 高危 fail-closed 不放行，普通积压补投。
- `TC-adminaudit-01-concurrency` [集成]：并发写同链 → head CAS，链连续无断裂。
- `TC-adminaudit-01-tricky-tamper` [单元+集成]：篡改/删除审计行 → 哈希链校验检出断裂；未登记动作 → 断言按高危 fail-closed 处理。

---

# 模块九：隐私 / 删除权（adminprivacy）

## UC-adminprivacy-01 删除权 vs append-only 审计调和（crypto-shredding）

- **角色**：系统（C 端注销触发）/ DPO（数据保护官）
- **前置**：用户行使删除权 / 注销
- **触发**：erasure 请求
- **主流程**：
  1. `PrivacyErasure: requested→scheduled`。
  2. 业务表 PII 物理删除/匿名化（保留墓碑：聚合统计需要的非 PII）。
  3. **审计链内 PII 为加密摘要**：删除时**销毁该用户密钥（crypto-shredding）**，密文不可解 = 等效删除，**同时保留密文长度+哈希以证审计链未被事后篡改**（合规口径见 openDecisions）。
  4. `scheduled→shredded→verified`（验证密钥已销毁、密文不可解）。
- **后置**：`PrivacyErasure→verified`；审计链保留结构但 PII 不可解。
- **关联**：契约 `POST /admin/privacy/erasure`；状态机 PrivacyErasure；CAS·幂等·事件日志；SR-PII/SR-AUDIT。

**七类 case：**
- **正常**：erasure → PII 物删 + 密钥销毁 → verified。
- **异常（回滚）**：密钥销毁失败 → 停 `scheduled`，重试，不标 verified（避免假删除）。
- **特殊**：用户有未结订单/进行中退款 → 延迟 erasure 至业务终态，先匿名化非必要 PII。
- **逃逸通道**：密钥管理服务不可用 → erasure 挂起 + 告警，**不假装已删**（合规真实性）。
- **高并发（竞态）**：并发 erasure 同用户 → 幂等，密钥销毁一次（CAS）。
- **复杂（跨聚合）**：PII 散落多聚合 + 审计链 → 编排逐域删除/匿名 + 统一密钥销毁，部分失败标记未完成。
- **刁钻（合规对抗）**：删除后凭旧审计行试图反推 PII → 密钥已销毁密文不可解；"删除但审计可查 PII"的矛盾请求 → 明确合规口径（审计仅留不可解密文 + 操作事实）。

**测试用例：**
- `TC-adminprivacy-01-normal` [集成]：erasure → 业务 PII 删除，密钥销毁，审计密文不可解，verified。
- `TC-adminprivacy-01-exception` [集成]：密钥销毁失败 → 停 scheduled，不标 verified。
- `TC-adminprivacy-01-special-pending` [集成]：未结订单 → 延迟 erasure，先匿名非必要 PII。
- `TC-adminprivacy-01-escape` [集成]：KMS 不可用 → 挂起 + 告警，不假删。
- `TC-adminprivacy-01-concurrency` [集成]：并发 erasure → 幂等一次。
- `TC-adminprivacy-01-tricky-reidentify` [单元]：密钥销毁后审计密文不可解（解密尝试失败），链哈希仍可验证完整。

---

# 模块十：危险操作（admindanger）

## UC-admindanger-01 危险操作四眼 + 二次确认（expiry vs in-flight saga）

- **角色**：initiator + approver（≠initiator）
- **前置**：高危动作（高危枚举表见 UC-adminaudit-01）
- **触发**：发起危险操作（批量封禁/批量退款/数据导出/kill-switch 拨动/兑换码批次生成/泄题撤回/改价）
- **主流程**：
  1. `DangerApproval: pending`（TTL=30min），二次确认（输入确认短语 + 影响范围 blast radius 展示）。
  2. 四眼 CAS approver≠initiator（身份+设备双校验）。
  3. 批准 → `pending→approved→executing`（批量动作本身为 saga）。
  4. **expiry vs in-flight 边界**：TTL 仅对 `pending` 生效；**一旦进入 `executing` 即脱离 expiry 管辖**，长 saga 执行中到期不被中断。
  5. **blast-radius/影响面重算（解评审②TOCTOU）**：审批与执行间影响面阈值翻倍（如批量目标数从 100 变 200）→ **同一 DangerApproval 标记 stale，强制重审**；"同一动作"以 `(action,targetSetHash)` 判定，重算本身基于快照 + CAS，不可竞态绕过。
- **后置**：`DangerApproval: pending→approved|expired|rejected→executing`；audit(danger)。
- **关联**：契约 `POST /admin/danger/:id/approve`；状态机 DangerApproval；CAS(四眼 + 状态 + 影响面快照)·幂等·事件日志；SR-AUDIT。

**七类 case：**
- **正常**：发起 + 异人批准 + 二次确认 → executing。
- **异常（回滚）**：批量 saga 中途失败 → 补偿回滚已执行部分 + 标记，**不残留半执行**。
- **特殊**：二次确认短语不符 → 拒；blast radius 超阈强制更高审批级。
- **逃逸通道**：执行中发现误操作 → kill/abort saga（安全终止），已执行部分按补偿语义回滚。
- **高并发（竞态 CAS）**：并发两次批准 → CAS `pending→approved` 一次；并发批准与到期 → 状态机 CAS 决定先到者（批准赢则进 executing 脱离 expiry）。
- **复杂（saga/部分失败）**：批量退款 100 单批准后执行到第 50 单失败 → 前 50 已退保留、失败单补偿、剩余继续或暂停，全程对账。
- **刁钻（TOCTOU/自批）**：审批 pending 在 saga 执行到一半时到期 → **已 executing 不受 expiry 影响继续**；审批后执行前影响面翻倍 → stale 重审拦截；自批准绕四眼 → 身份+设备双校验拦截。

**测试用例：**
- `TC-admindanger-01-normal` [集成]：异人批准 + 确认短语 → executing。
- `TC-admindanger-01-exception` [集成]：saga 中途失败 → 补偿回滚，无半执行残留。
- `TC-admindanger-01-special-blastradius` [集成]：影响超阈 → 升级审批级。
- `TC-admindanger-01-escape-abort` [集成]：执行中 abort → 已执行部分补偿。
- `TC-admindanger-01-concurrency` [集成]：并发批准 → CAS 一次；批准 vs 到期 → CAS 决定，批准赢则进 executing。
- `TC-admindanger-01-tricky-expiry` [集成]：**executing 中 TTL 到期 → saga 不被中断**；审批后影响面翻倍 → stale 重审；自批准 → 拦截。

---

# 模块十一：Kill-switch 治理（adminkill）

## UC-adminkill-01 Kill-switch 拨动与安全恢复

- **角色**：super_admin（拨动=危险操作）
- **前置**：kill-switch（退款/题库/兑换码/通知/全局）`armed`
- **触发**：拨动（应急掐断）或回拨恢复，或**自动阈值触发**（异常率超阈自动 trip）
- **主流程**：
  1. 拨动 = 危险操作 → 走 UC-admindanger-01 四眼 + 二次确认 + **blast radius 声明**（全局 vs 单域）。
  2. CAS `KillSwitch: armed→tripped`，**新请求 fail-closed**，**在途 AiGraphRun 允许安全收尾不再新增计费**（`safe_finalized`，计费切割点见 openDecisions）。
  3. **自动阈值触发**：监控指标超阈 → 自动 trip（仍记 danger 审计），人工确认后方可恢复。
  4. **安全恢复**：回拨 `tripped→armed` 同样需二次确认（误拨保护），恢复后**逐步放量（灰度）+ 验证**。
  5. 全程审计 + 状态广播事件入箱。
- **后置**：`KillSwitch: armed⇄tripped`；audit(killswitch) + 状态广播事件。
- **关联**：契约 `POST /admin/killswitch/:id`；状态机 KillSwitch + DangerApproval；CAS·幂等·事件日志；SR-AUDIT/SR-ANTIFRAUD。**kill-switch 是有 status enum + 审计迁移 + 二人复核 + blast-radius 的对象，非临时 flag（临时 flag 无审计、无 blast-radius 边界、拨动不可追溯）。**

**七类 case：**
- **正常**：四眼批准 → tripped，新请求被拒。
- **异常（回滚）**：拨动广播失败 → CAS 回滚 armed，不留"半掐断"（部分实例认为 tripped）。
- **特殊**：blast radius 全局 vs 单 SKU 分级；拨动期间在途请求语义明确（新拒、在途收尾）。
- **逃逸通道**：kill-switch 本身是逃逸通道，但**恢复**需防误拨 → 回拨二次确认 + 灰度放量。
- **高并发（竞态）**：并发拨动 + 大量在途请求 → CAS tripped 后所有新请求确定性 fail-closed，在途 run 收尾不新增计费；自动阈值触发与人工拨动并发 → CAS 幂等一次 trip。
- **复杂**：拨动期间在途退款 saga（UC-03）→ 退款 kill 暂停新退款，在途退款 saga 按 abort/收尾语义处置，不丢单。
- **刁钻（单点掐营收）**：低权限者尝试拨动 / 误拨后慌乱乱回拨 → 拨动与回拨均四眼 + 二次确认；恶意拨动有强审计可追溯 + 告警。

**测试用例：**
- `TC-adminkill-01-normal` [集成]：四眼批准 → tripped，新请求 fail-closed。
- `TC-adminkill-01-exception` [集成]：广播失败 → CAS 回滚 armed，无半掐断。
- `TC-adminkill-01-special-blast` [集成]：分级 blast radius（全局/单 SKU）生效范围正确。
- `TC-adminkill-01-escape-recover` [集成]：回拨需二次确认 + 灰度放量。
- `TC-adminkill-01-concurrency` [集成]：tripped 后并发新请求全 fail-closed；在途 run 收尾不新增计费；自动+人工并发 trip → CAS 一次。
- `TC-adminkill-01-tricky` [集成]：低权限拨动 → 403；拨动/回拨全审计事件入箱可追溯。

---

# 模块十二：导出脱敏（adminexport）

## UC-adminexport-01 数据导出（quota + 脱敏 + 下载 TTL 时区）

- **角色**：ops/analyst（`export`，含 PII 导出需 `export.pii` + 四眼）
- **前置**：登录态有效；导出配额未耗尽
- **触发**：发起导出任务
- **主流程**：
  1. `ExportJob: requested`，**配额 CAS**（`EXPORT_QUOTA`：3 job/日、10万行上限），超额拒。
  2. 默认**脱敏导出**；含 PII 导出 → `export.pii` + 四眼 + 强审计 + **caseRef 同源闸门**（与 reveal/下钻三路同治）。
  3. 异步生成 → `running→ready`，下载链接 **TTL（15min，UTC 绝对边界）**，过期 `expired`（TTL 漏跑对账见 UC-adminscheduler-01）。
  4. 下载需重鉴权 + 一次性 token + 审计。
- **后置**：`ExportJob: requested→running→ready→expired|failed`；audit(export, 含字段清单)。
- **关联**：契约 `POST /admin/exports`、`GET /admin/exports/:id/download`；状态机 ExportJob；CAS(配额)·幂等·RLS·事件日志；SR-PII/SR-ANTIFRAUD/SR-AUDIT。

**七类 case：**
- **正常**：脱敏导出 → ready，TTL 内可下载。
- **异常（回滚）**：生成失败 → `failed`，配额回补（不白扣配额）。
- **特殊（时区/边界）**：下载 TTL 跨 DST/跨时区 → UTC 绝对边界过期，不早不晚；恰 10万行边界。
- **逃逸通道**：导出引擎不可用 → 任务挂起 + 告警，配额不扣。
- **高并发（竞态 CAS）**：并发发起超配额 → 配额 CAS，第 (quota+1) 个确定性拒绝。
- **复杂**：大数据集分片导出 + 进度事件 + 部分失败重试该分片。
- **刁钻（PII 出域/越权）**：脱敏导出后多次交叉导出反推 PII → 导出维度受 k-匿名/同源闸门约束；含 PII 导出绕四眼 → 拦截；下载链接泄露被他人用 → 下载重鉴权 + 短 TTL + 一次性 token。

**测试用例：**
- `TC-adminexport-01-normal` [集成]：脱敏导出 → ready，下载得掩码数据。
- `TC-adminexport-01-exception` [集成]：生成失败 → failed，配额回补。
- `TC-adminexport-01-special-ttl` [单元]：TTL 跨 DST 用 UTC 边界精确过期；10万行边界。
- `TC-adminexport-01-escape` [集成]：引擎不可用 → 挂起 + 告警，配额不扣。
- `TC-adminexport-01-concurrency` [集成]：并发超配额 → 第 (quota+1) 个 403（CAS）。
- `TC-adminexport-01-tricky-pii` [集成]：含 PII 导出绕四眼 → 拦截；下载链接他人重用 → 重鉴权拒绝；交叉导出反推 → k-匿名/同源闸门拦截。

---

# 模块十三：通知治理（adminnotify）— 通知建模为有状态机的持久对象 NotificationJob（fire-and-forget 会静默丢投递、无重试无审计）

## UC-adminnotify-01 通知治理（持久作业状态机 + outbox + 重试 + 误发召回 + 模板审核 + PII 脱敏）

- **角色**：系统（各业务触发通知）/ ops（模板管理）
- **前置**：通知模板 `NotifyTemplate.status=approved`；触发事件入 outbox
- **触发**：业务事件（封禁/退款/撤回/风控）产生通知作业
- **主流程**：
  1. 通知作业持久化 `NotificationJob: queued`（含 templateId、收件人、**脱敏后渲染参数**、幂等键）。
  2. **PII 脱敏在入队前完成**：渲染参数仅脱敏值（不落原文手机号/邮箱/简历）。
  3. 投递经 outbox 独立进程：`queued→sending→delivered`；失败指数退避重试（`NOTIFY_RETRY`），超限 `→failed` 入死信告警。
  4. **误发召回**：发现错误（如误封通知）→ 召回作业（撤回未读/发更正），`delivered→recalled`，强审计。
  5. **模板审核**：模板变更走审核（防注入/钓鱼/错误文案），`NotifyTemplate: draft→in_review→approved`，未 approved 模板不可发送。
- **后置**：`NotificationJob` 终态；audit(notify)；事件入箱。
- **关联**：契约 `POST /admin/notify/templates`、内部 notify enqueue；状态机 NotificationJob + NotifyTemplate；CAS·幂等(通知键)·RLS·事件日志；SR-PII/SR-AUDIT/SR-INJECT(模板)。

**七类 case：**
- **正常**：事件 → 通知 delivered。
- **异常（回滚/重试）**：投递失败 → 退避重试，超限 failed 入死信告警，不静默丢。
- **特殊（边界）**：收件人退订/无效地址 → skip + 记录，不无限重试；i18n 模板按用户语言。
- **逃逸通道**：通知渠道全不可用 → 作业积压 queued 不丢，渠道恢复后补投；可 kill-switch 暂停某类通知。
- **高并发（竞态）**：同一事件并发触发重复通知 → 幂等键去重，仅一次 delivered。
- **复杂（误发召回 saga）**：批量误发 1000 条 → 召回作业批量 `delivered→recalled` + 发更正，部分召回失败标记。
- **刁钻（钓鱼/注入/PII 泄露）**：模板被注入钓鱼链接/越狱 → 模板审核 SR-INJECT 拦截；通知正文含未脱敏 PII → 入队前脱敏校验拒发；伪造 enqueue 滥发 → 鉴权 + 幂等 + 限频。

**测试用例：**
- `TC-adminnotify-01-normal` [集成]：事件 → NotificationJob delivered。
- `TC-adminnotify-01-exception` [集成]：mock 投递失败 → 重试至上限 → failed 死信 + 告警事件。
- `TC-adminnotify-01-special-unsub` [集成]：退订收件人 → skip，不重试。
- `TC-adminnotify-01-escape` [集成]：渠道全挂 → 作业积压 queued 不丢，恢复后补投。
- `TC-adminnotify-01-concurrency` [集成]：同事件并发触发 → 幂等键，仅一次 delivered。
- `TC-adminnotify-01-complex-recall` [集成]：批量误发 → 召回 `delivered→recalled`，部分失败标记。
- `TC-adminnotify-01-tricky-template` [集成]：注入模板 → 审核拦截；未脱敏 PII 正文 → 入队前校验拒发。

---

# 模块十四：工单 / CaseRef（admincaseref）— 新增，解评审② caseRef 悬空

## UC-admincaseref-01 工单/CaseRef 生命周期（签发 / 归属 / 关闭）

- **角色**：support（`caseref.manage`）/ 系统
- **前置**：C 端用户发起客服请求 / 内部合规调查
- **触发**：创建工单
- **主流程**：
  1. `CaseRef: open`，绑定 `subjectUserId`（归属）、reason、发起人、TTL（`CASEREF_TTL`）。
  2. **reveal/下钻/PII 导出的硬前置即此对象**：UC-adminuser-02 / UC-admindash-01 / UC-adminexport-01 校验 caseRef 状态=`open|in_use` 且 `subjectUserId==目标用户`（归属校验，防借他人工单 reveal 第三方）。
  3. 工单关闭/过期 → `closed/expired`，关联 reveal 权限即时失效。
  4. 工单与 reveal 审计交叉引用（caseRef ↔ pii_reveal 双向可查）。
- **后置**：`CaseRef: open→in_use→closed|expired`；audit(caseref)。
- **关联**：契约 `POST /admin/caserefs`、`PATCH /admin/caserefs/:id/close`；状态机 CaseRef；CAS·幂等·RLS·事件日志；SR-PII/SR-AUDIT。

**七类 case：**
- **正常**：建单 → open，可用于 reveal。
- **异常（回滚）**：建单写失败 → 无半成品工单，reveal 前置不通过。
- **特殊（边界/TTL）**：工单过期边界（UTC，读时再校验）→ 关联 reveal 即时失效；i18n reason。
- **逃逸通道**：工单系统不可用 → reveal 前置 **fail-closed 拒绝**（无工单不解密），不放行。
- **高并发（竞态）**：并发关闭工单 + reveal → CAS 状态校验，关闭提交后 reveal 即拒。
- **复杂（跨域）**：一工单关联多用户调查 → 每 reveal 校验 `subjectUserId` 归属，越界用户拒。
- **刁钻（借单越权）**：support 持 A 用户工单 reveal B 用户 PII → 归属校验 `subjectUserId≠B` 拒；伪造 caseRef 号 → 不存在/未签发拒（与 UC-adminuser-02-tricky 共用夹具）。

**测试用例：**
- `TC-admincaseref-01-normal` [集成]：建单 open → reveal 前置通过。
- `TC-admincaseref-01-exception` [集成]：建单写失败 → 无工单，reveal 拒。
- `TC-admincaseref-01-special-ttl` [单元]：工单 TTL UTC 边界过期 → reveal 失效。
- `TC-admincaseref-01-escape` [集成]：工单系统不可用 → reveal fail-closed 拒。
- `TC-admincaseref-01-concurrency` [集成]：并发关单 + reveal → 关单后 reveal 即拒。
- `TC-admincaseref-01-complex-multi` [集成]：多用户工单，reveal 越归属用户 → 拒。
- `TC-admincaseref-01-tricky-borrow` [集成]：借 A 工单 reveal B → subjectUserId 归属拒；伪造号 → 拒。

---

# 模块十五：调度可靠性（adminscheduler）— 新增，解评审①"漏跑=永久封禁/过期码可核销"

## UC-adminscheduler-01 定时器可靠性（missed-run 补跑 + 时钟漂移 + 过期对账）

- **角色**：系统调度
- **前置**：存在受时间约束作业（临时封禁解封 / 码过期 / export TTL / approval TTL / 排期 live / reserved 超时 release / caseRef 过期）
- **触发**：定时 tick / 实例重启后恢复
- **主流程**：
  1. **基于绝对截止时间的对账驱动（非依赖每 tick 触发）**：每类 TTL/排期落库截止 UTC；调度器既按 tick 触发，也**周期性对账扫描"已过截止但未迁移"的对象补跑**（`ScheduledTask: missed→catch-up→caught_up`）。
  2. **missed tick 补跑**：实例宕机/漏跑 → 恢复后对账扫描 due 对象，CAS 迁移（幂等：已迁移者跳过）。
  3. **时钟漂移防护**：以 DB 服务器时间为准，应用层不信本地墙钟；漂移超阈告警。
  4. `SCHEDULER_MISSED_GRACE` 宽限：补跑标记"延迟执行"审计，区分正常与补跑；超宽限 `dropped` 并告警。
- **后置**：到期对象正确迁移；audit(scheduler_run + missed_catchup)；事件入箱。
- **关联**：契约（内部 cron + 对账接口）；状态机 ScheduledTask + 多对象 TTL 迁移；CAS(迁移幂等)·幂等(run id)·事件日志；SR-AUDIT。

**七类 case：**
- **正常**：到点 tick → 对象迁移（解封/过期）。
- **异常（回滚）**：补跑迁移写失败 → 对象保持原态，下轮对账重试，不假迁移。
- **特殊（边界）**：截止恰在 tick 间隙 → 对账兜底捕获；DST 切换日不重不漏（UTC 绝对边界）。
- **逃逸通道**：调度器不可用 → 恢复后对账批量补跑，**漏跑不致永久封禁/过期码可核销**（核心安全保证）。
- **高并发（竞态）**：多调度实例并发补跑同对象 → CAS 迁移幂等，仅一次。
- **复杂**：长时间宕机后大量积压到期对象 → 对账分批补跑 + 限流，全部最终迁移。
- **刁钻（漏跑放大攻击）**：用户期待"漏跑使临时封禁不解除"或"过期码因漏跑仍可核销" → 核销/鉴权侧**读时再校验绝对截止**（不仅依赖调度器迁移），漏跑也不放行过期码 / 不延长封禁。

**测试用例：**
- `TC-adminscheduler-01-normal` [集成]：到点 → 临时封禁 CAS 解封。
- `TC-adminscheduler-01-exception` [集成]：mock 补跑写失败 → 对象不迁移，下轮重试。
- `TC-adminscheduler-01-special-dst` [单元]：DST 切换日到期对账不重不漏。
- `TC-adminscheduler-01-escape-catchup` [集成]：模拟调度宕机 N 分钟 → 恢复后对账补跑所有 due 对象（临时封禁全部解封）。
- `TC-adminscheduler-01-concurrency` [集成]：多实例并发补跑同对象 → CAS 幂等一次。
- `TC-adminscheduler-01-complex-backlog` [集成]：积压大量到期 → 分批补跑全部迁移。
- `TC-adminscheduler-01-tricky-staleguard` [集成]：漏跑期间核销过期码 → 核销侧读时校验绝对截止拒；漏跑期间封禁到期 → 鉴权侧读时判定已解封放行（不被漏跑永久封）。

---

# 模块十六：商品目录 / 计费地基（admincommerce）— 新增，解评审④ commit 时点 P0 地基

## UC-admincommerce-01 权益消费 commit 时点与口径（退款政策地基）

- **角色**：系统（消费链路）/ finance（退款据此判定）
- **前置**：用户持权益（次数/订阅），ConsumptionRecord 存在
- **触发**：mock-interview / report / quiz 消费权益
- **主流程（定义 reserved/committed/released 业务计量口径，作 UC-adminorder-02/03/04 退款政策唯一判据）**：
  1. **预占 reserved**：面试 run 开始即 CAS 占用一次（reserved），防超用。
  2. **commit 时点（默认口径，待产品确认见 openDecisions）**：mock-interview 以**"报告成功生成（report ready）"为 commit 时点**（出报告即视为已交付价值）；中途放弃/失败未出报告 → `release` 回退（不计费）。quiz 以提交评分完成 commit。
  3. **退款差额口径**：退额 = 单价 ×（reserved 但未 committed 的次数）；已 committed（已出报告）不退（或按 proration 政策的 openDecision）。
  4. `released`（退款/未交付）vs `committed`（已交付）为退款/clawback 唯一判据。
- **后置**：`ConsumptionRecord: reserved→committed|released`；账本一致；audit(consume)。
- **关联**：契约（内部 commerce service）；状态机 ConsumptionRecord；CAS·幂等·事件日志；被 UC-adminorder-02/03/04 退款政策依赖。

**七类 case：**
- **正常**：出报告 → committed。
- **异常（回滚）**：报告生成失败 → `reserved→released`，不计费，可退/可重试。
- **特殊（边界）**：报告生成中途用户退款 → 见 UC-adminorder-03 run 锁竞态；commit 与 release 互斥。
- **逃逸通道**：report subgraph 长时间未出报告 → 超 `REPORT_COMMIT_TIMEOUT` 自动 release（不永久占用次数），次数归还。
- **高并发（竞态）**：commit 与退款 release 并发 → CAS 互斥（UC-adminorder-03 核心），不可同时成功。
- **复杂（渐进消费）**：mock-interview 多题渐进 → 仍以单次 reserved，**出报告整体 commit（非每题 commit）**，口径单一可计量。
- **刁钻（套利）**：用户每次做到出报告前一刻放弃刷免费次数 → reserved 超时 release 但记"未完成消费"风控计数，多次异常触发风控（SR-ANTIFRAUD）。

**测试用例：**
- `TC-admincommerce-01-normal` [集成]：报告 ready → ConsumptionRecord committed。
- `TC-admincommerce-01-exception` [集成]：报告失败 → released，次数归还，不计费。
- `TC-admincommerce-01-special-mutex` [集成]：commit 与 release 互斥断言。
- `TC-admincommerce-01-escape-timeout` [集成]：report 超时 → 自动 release，次数归还。
- `TC-admincommerce-01-concurrency` [graph+集成]：commit vs 退款 release 并发 → CAS 互斥，不双成功。
- `TC-admincommerce-01-complex-progressive` [graph]：多题渐进 → 单次 reserved，出报告整体 commit。
- `TC-admincommerce-01-tricky-abuse` [集成]：反复做到出报告前放弃 → reserved 超时 release + 未完成消费风控计数累积触发风控。

---

## UC-admincommerce-02 SKU / 定价 / 权益目录管理（版本化，走 danger，价格快照锁定在途）

- **角色**：ops/finance（`commerce.config`，高危→走 UC-admindanger-01）
- **前置**：登录态有效
- **触发**：新增/调整 SKU、定价、权益包
- **主流程**：
  1. SkuCatalog/PricingPlan **版本化**（`draft→active→deprecated`），变更不就地改而发新版本。
  2. **对在途订单影响隔离**：在途/已下单订单锁定其**下单时版本价（价格快照）**，新版本仅对新订单生效（防"改价影响历史单"）。
  3. 高危（改价/下架 SKU）走 danger 四眼 + 二次确认 + blast radius（影响多少在售）。
  4. `deprecated` SKU 不可新购，已购权益继续有效。
- **后置**：SkuCatalog/PricingPlan 版本迁移；audit(commerce_config)。
- **关联**：契约 `POST /admin/commerce/skus`、`/pricing`；状态机 SkuCatalog/PricingPlan；CAS(版本)·幂等·RLS·事件日志；SR-AUDIT。

**七类 case：**
- **正常**：发新版本定价 → active，新订单用新价。
- **异常（回滚）**：版本切换部分失败 → 回滚，无半生效定价。
- **特殊（边界）**：在途订单用下单版本快照价；i18n SKU 名/币种。
- **逃逸通道**：误改价 → 即时发回滚版本 + danger 审计；deprecated 错误 → 重新 active。
- **高并发（竞态）**：并发改同 SKU → 版本 CAS，后者基于陈旧版本冲突重试。
- **复杂（在途影响）**：改价瞬间用户正在下单 → 下单锁定旧版本快照，改价不影响该笔。
- **刁钻（价格篡改/低价套利）**：构造请求改价为 0/负 → 校验下界拒；抢在改价生效前后并发下单套低价 → 价格快照按下单提交版本锁定，不可跨版本套利。

**测试用例：**
- `TC-admincommerce-02-normal` [集成]：新版本定价 → 新订单用新价。
- `TC-admincommerce-02-exception` [集成]：版本切换部分失败 → 回滚。
- `TC-admincommerce-02-special-snapshot` [集成]：在途订单用下单版本快照价。
- `TC-admincommerce-02-escape` [集成]：误改价 → 回滚版本 + danger 审计。
- `TC-admincommerce-02-concurrency` [集成]：并发改同 SKU → 版本 CAS 冲突重试。
- `TC-admincommerce-02-complex-inflight` [集成]：改价瞬间下单 → 锁定旧快照，不受影响。
- `TC-admincommerce-02-tricky-pricetamper` [集成]：改价为 0/负 → 下界拒；跨版本并发下单套利 → 快照版本锁定拒。

---

## 附录 A：评审必补清单对照（两轮评审全部落点）

| # | 必补项 | 落点 UC / 机制 | 状态 |
|---|---|---|---|
| 1 | 兑换码批次总量/单用户限领/预算 CAS + 码锁补偿 | UC-adminops-03 | 闭合 |
| 2 | 看板下钻 k-匿名与 reveal/导出 caseRef 三路同源 | UC-admindash-01 ↔ UC-adminuser-02 ↔ UC-adminexport-01 ↔ UC-admincaseref-01 | 闭合 |
| 3 | 后台登录/MFA/会话治理 | UC-adminauth-01/02 | 闭合 |
| 4 | 封禁↔threadId 续连语义（user.status 跨域义务） | UC-adminuser-03 | 闭合 |
| 5 | 退款↔在途 run reserved 竞态（run 锁 + CAS 互斥） | UC-adminorder-03 + UC-admincommerce-01 | 闭合 |
| 6 | 审计强一致 + outbox + 链 + **高危枚举表（fail-closed 缺省）** | UC-adminaudit-01 | 闭合 |
| 7 | 外部拒付/chargeback + clawback（验签/幂等） | UC-adminorder-04 | 闭合 |
| 8 | **退款渠道异步回调摄入（验签/重放/乱序/回调先于落库/渠道错误 taxonomy）** | UC-adminorder-05 | 新增闭合 |
| 9 | AdminAccount restricted 态 + reveal 计数 CAS | UC-adminuser-02 + 状态机 0.6 | 闭合 |
| 10 | 限速/频次/配额参数化 + 告警/通知落可观测事件 | 0.4 + UC-adminorder-03/04/05、UC-adminops-04 | 闭合 |
| 11 | SR-INJECT 对抗语料黄金集 | UC-admincontent-01（ai-eval） | 闭合 |
| 12 | 删除权 vs append-only 审计（crypto-shredding） | UC-adminprivacy-01 | 闭合 |
| 13 | kill-switch 治理（status enum + 四眼 + blast-radius + 自动阈值 + 恢复） | UC-adminkill-01 | 闭合 |
| 14 | 四眼死锁 + 最小管理员 + **审批人池≥2 + 三方分离防合谋** + break-glass | UC-adminrbac-02 | 闭合 |
| 15 | 退款 proration + 冷静期 + **commit 时点地基** | UC-adminorder-02 + UC-admincommerce-01 | 闭合 |
| 16 | 时区基准 + **调度 missed-run 补跑 + 读时校验绝对截止** | 0.3 + UC-adminscheduler-01 | 新增闭合 |
| 17 | published-but-unindexed 抽题 gating | UC-admincontent-02 | 闭合 |
| 18 | 看板物化视图刷新并发 + 缓存击穿兜底 | UC-admindash-02 | 闭合 |
| 19 | danger expired vs in-flight saga + **TOCTOU 影响面重算** | UC-admindanger-01 | 闭合 |
| 20 | **通知治理（NotificationJob 状态机 + outbox + 重试 + 误发召回 + 模板审核 + PII 脱敏）** | UC-adminnotify-01 | 新增闭合 |
| 21 | **CaseRef 生命周期（签发/归属/关闭，PII reveal 硬前置落点）** | UC-admincaseref-01 | 新增闭合 |
| 22 | **泄题紧急撤回安全默认（标记+可中止在途+回标报告 amend）** | UC-admincontent-03 | 新增闭合 |
| 23 | **AI 生成内容专用闸门（指定人类 owner 替代四眼）** | UC-admincontent-04 | 新增闭合 |
| 24 | **兑换码批次确定性分片断点续生成（cursor + unique，解随机不幂等矛盾）** | UC-adminops-02 | 新增闭合 |
| 25 | **SKU/定价/权益目录版本化（价格快照锁定在途，走 danger）** | UC-admincommerce-02 | 新增闭合 |
| 26 | 三租户面概念厘清（隔离面 C↔B；运营=特权下视+scope 收敛+审计） | 0.1 RLS 说明 | 闭合 |

## 附录 B：删除/降级项（评审"自评≠覆盖"）

- **不设"覆盖矩阵自检"作为验收物**：本文档不含 N/A 注水的自评打分矩阵；每条 UC 的七类覆盖直接由其测试用例 TC 验证（可执行断言），覆盖与否以测试通过为准，非自评声明。
- **删除 adminaudit-01"强一致 or outbox 按风险分级"模糊措辞**：改为 UC-adminaudit-01 主流程第 4 步的**显式高危动作枚举表 + fail-closed 缺省**（未登记动作默认按高危处理），消除"高危动作静默落 outbox 弱路径"的正确性风险。

## 附录 C：ADR 重点（面试可防御）

1. **批次级超发用 CAS 计数器/预扣预算，而非只锁单码** — 单码 CAS 只防同码竞争，批次总量/预算/单用户限领须各自原子计数 + 上界 CAS；核销为 validate-then-commit 的多步 saga，任一失败全补偿（含码锁回滚）（UC-adminops-03）。
2. **看板 k-匿名、详情 reveal、PII 导出三路同源治理** — 通往同一 PII 的三条路共用 `user.read.pii`+caseRef+k-匿名，CaseRef 有独立生命周期与归属校验，隐私不留旁路（UC-admindash-01 ↔ UC-adminuser-02 ↔ UC-adminexport-01 ↔ UC-admincaseref-01）。
3. **审计强一致 vs 防篡改取舍** — 业务事实表强一致 + 审计经事务性 outbox 投递 + 独立 append-only 链上防篡改；按显式高危枚举表（fail-closed 缺省）决定"是否阻塞业务"而非"是否同事务插 log"（UC-adminaudit-01）。
4. **退款异步边界三分** — 我方主动退款的渠道异步结果回调（UC-adminorder-05）、用户主动拒付 chargeback（UC-adminorder-04）、主动对账轮询三者互为幂等补偿；幂等键=渠道单号，状态机单调前进，回调先于落库走 pending_match（评审"退款域最大机制空洞"闭合）。
5. **commit 时点是退款政策地基** — reserved/committed/released 以"报告 ready"为 commit 判据，渐进消费整体 commit 而非每题，退款差额仅退 reserved 未 committed 部分；commit 与退款 release 经 run 锁 + CAS 严格互斥（UC-admincommerce-01 ↔ UC-adminorder-03）。
6. **横切治理对象皆建模为有状态机的持久对象** — 通知（NotificationJob）、工单（CaseRef）、止血开关（KillSwitch）、调度（ScheduledTask）均有显式 status enum + 审计迁移 + 原语落点，杜绝 fire-and-forget（静默丢投递）/ 临时 flag（无审计无 blast-radius）/ 裸告警（下游不可对账）/ 仅依赖每 tick 调度（漏跑即放大）等静默失败路径。

> 收尾判断：本版已把第二轮评审定为"在补齐前应保持 draft"的三类机制空洞——**异步边界（UC-adminorder-05 渠道回调 / UC-adminnotify-01 通知）、横切治理对象未建模（UC-adminkill-01 / UC-admincaseref-01 / UC-adminscheduler-01）、退款业务地基（UC-admincommerce-01 commit 时点）**——全部落到状态机或四原语，对应刁钻流均有可执行 TC。剩余 openDecisions 为产品/财务/法务口径选择（非工程机制缺口），不阻塞 spec 定稿；定稿后方可作为生成前门禁的输入。
