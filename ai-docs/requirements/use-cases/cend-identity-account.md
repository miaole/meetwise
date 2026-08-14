---
id: requirements_uc_cend_identity_account
name: 用例 · 认证·同意·账号·权益·支付入口
description: 认证·同意·账号·权益·支付入口 业务用例与测试用例（正常/异常/特殊/逃逸/并发/复杂/刁钻七类，46 UC / 90 TC）。
type: reference
scope: shared
level: spec
status: active
owner: product
related:
  - ./README.md
  - ../use-case-conventions.md
  - ../../testing/conventions/test-authoring.md
---

# 领域用例 + 测试用例终稿 · cend-identity-account（C 端身份与账户）

> **🔎 实现状态（对齐真实代码 · 2026-07）** — 本文是 TARGET 规格。**✅ 已实现+接线**：真实鉴权（注册 scrypt 哈希 + 常量时间校验 + 同邮箱限流 + HMAC 会话令牌，cookie 鉴权），账号/权益次数入口、登录页可跑。**🟠 校正 / ⬜ 未建**：本文首段的**“微信扫码登录（QrLoginTicket 状态机）”未接线** —— 当前登录为**邮箱+密码**，无微信/OAuth；PIPL 实名/同意状态机、onboarding 全链路、充值真实收单等为规格。核心密码鉴权与会话已生效，扫码/实名/OAuth 为规划。

> 范围：微信扫码登录 / onboarding / 实名与个人信息同意（PIPL）/ 账号生命周期 / 权益次数 / 充值入口。
> 顺序铁律：用例 → 契约 → 状态机 → 测试 → 代码。本稿已收口对抗评审全部结论（七类补齐、每条异常/刁钻落机制、验收可测、配齐测试）。
> 机制词汇统一引用四承重原语：**CAS 条件更新 / 幂等键 / RLS principal 绑定 / 持久有序事件日志（outbox）**。

## 0. 本域状态机（CAS 落点，每次迁移服务端再校验 + 写审计 + version 守卫）

### QrLoginTicket（扫码登录票据，匿名→具名的桥）
枚举：`PENDING · SCANNED · CONFIRMED · CONSUMED · EXPIRED · CANCELLED`

| from | to | 触发 | 守卫 | 失败动作 |
|---|---|---|---|---|
| —(insert) | PENDING | qrCreate | 绑定**创建端 httpOnly 服务端会话 id `bindSid`** + 限流通过 | 限流命中→拒绝建 ticket |
| PENDING | SCANNED | 微信回调：已扫 | ticket 未过期 | — |
| PENDING·SCANNED | CONFIRMED | 微信回调：用户确认授权 | 未过期 | — |
| PENDING·SCANNED | CANCELLED | **用户在微信端取消/拒绝授权**（AUTH-07）/ hijack 检出（AUTH-03） | — | — |
| PENDING·SCANNED | EXPIRED | TTL 到期 | — | — |
| CONFIRMED | CONSUMED | 取 unionid 成功 + 发 token | **轮询端 sid == bindSid（CAS）** + 取号成功 + 账号非封禁 | sid 不符→拒发(0 token)，迁 CANCELLED(hijack) |
| CONFIRMED | EXPIRED | **取号失败/超时且重入预算耗尽**（AUTH-08） | 重入次数≤N | 预算内→保持 CONFIRMED 可重入 |
| CONFIRMED | CANCELLED | **封禁拦截：confirm 通过但发 token 前命中 BANNED**（AUTH-06） | — | ticket 不发 token，落 CANCELLED |

> ticket 与登录会话的绑定键是 **httpOnly 服务端会话 id（CAS 校验）**，非「浏览器指纹」。CONSUMED 是 exactly-once 终态（幂等键=ticketId）。

### AccountStatus（账号）
枚举：`PENDING_ONBOARD · ACTIVE · SELF_FROZEN · FROZEN · RESTRICTED · BANNED · DELETING · DELETED`

| from | to | 触发 | 守卫 | 失败动作 |
|---|---|---|---|---|
| —(insert) | PENDING_ONBOARD | 首次建账 | unionid UNIQUE | 并发→唯一约束去重 |
| PENDING_ONBOARD | ACTIVE | onboarding 完成（base 同意已 GRANTED） | base 同意存在 | — |
| ACTIVE | SELF_FROZEN | **用户自助安全冻结**（ACCT-05） | 本人会话 | — |
| SELF_FROZEN | ACTIVE | 用户解冻 | 二次校验通过 | — |
| ACTIVE·SELF_FROZEN | FROZEN | 风控冻结（确定性阈值判定） | 特征向量命中阈值 | — |
| ACTIVE | RESTRICTED | **撤回 base 概括同意**（CONSENT-06） | — | 受限：禁新处理，引导注销 |
| 任意非终态 | BANNED | 管理员封禁 | — | 撤销全部会话 |
| ACTIVE·RESTRICTED·FROZEN·SELF_FROZEN | DELETING | 用户发起注销（冷静期 saga 起点） | 本人 + 二次确认 | — |
| DELETING | ACTIVE | **冷静期内撤销恢复**（ACCT-02） | 冷静期未到期 | — |
| DELETING | DELETED | 冷静期到期执行 | 冷静期到期 | 业务数据删/匿名化；交易凭证依法留存并解关联（ACCT-06） |

### ConsentRecord（同意记录，按 scope+version 维度）
枚举：`GRANTED · WITHDRAWN · SUPERSEDED`；`scope ∈ {base, sensitive, cross_border, automated_decision, guardian}`；带 `policy_version`。

### EntitlementGrant（权益桶） / ConsumptionRecord（两阶段消费）
- 桶：`type ∈ {trial, paid}`，带 `expires_at`、`remaining`、`version`。
- ConsumptionRecord：`reserved · confirmed · released`（两阶段语义：`confirmed`=提交扣减不可逆；`released`=回退退次/REVERSED）。`idempotency_key UNIQUE` + `INSERT … ON CONFLICT DO NOTHING` 保证「占用」exactly-once。

### PaymentOrder（支付单，钱路径 SERIALIZABLE）
枚举：`created · paid · fulfilled · fulfill_failed · refunding · refunded · expired`（canonical）。
- 渠道预下单失败 → `created→expired(reason=channel_prepay_failed)`，用户另起新单（不复用 token，见 PAY-01）。
- **支付回调（commerce）与发权益（entitlement 业务服务）是跨聚合，禁止同 DB 事务**；用事务性 outbox + 可重入履约（PAY-02）。

## 1. 四原语速查（本域每条异常/刁钻流的落点）
- **CAS**：ticket sid 校验、账号/订单/消费每次迁移、额度桶扣减回补、注销冷静期撤销竞态。
- **幂等键**：ticketId（发 token exactly-once）、consumption idempotency_key、支付单号+通知流水、退款单号、reaper 处置键。
- **RLS**：所有账号/权益/订单读写带 principal，fail-closed 0 行；后台 reaper/对账 job 同样带 principal。
- **有序事件日志/outbox**：`entitlement_ledger`（余额溯源）、`payment_event`（履约 outbox）、`login_audit`、`consent_audit`、`account_audit`。

---

# AUTH · 登录（微信扫码）

## UC-AUTH-01 · 微信扫码登录
**覆盖类**：正常 · 异常 · 特殊 · 逃逸 · 并发
- **角色**：求职者（匿名→具名） / 系统
- **前置**：未登录；微信开放平台可用。
- **触发**：Web 端请求登录二维码并轮询。
- **主流程 Main**：1) qrCreate 建 `QrLoginTicket=PENDING`，绑定创建端 httpOnly `bindSid` 2) 前端展示码并以 `Last-Event-ID`/轮询订阅 ticket 状态 3) 用户扫码→`SCANNED`→确认→`CONFIRMED` 4) 后端凭 code 取 unionid 成功 5) **CAS 校验轮询端 sid==bindSid** 且账号非封禁 → ticket `CONFIRMED→CONSUMED`（幂等键=ticketId），签发 httpOnly token 6) 首次→建账（AUTH-02），老用户→ACTIVE 直接入站。

| flow | 类 | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 老用户登录 | sid CAS + ticketId 幂等 | ticket CONSUMED；写 login_audit |
| 1a | 特殊 | 首次登录 | 转 AUTH-02 建账 | account PENDING_ONBOARD |
| 4a | 异常 | **unionid 取号失败/超时** | 转 AUTH-08（CONFIRMED 可重入预算，耗尽→EXPIRED） | ticket 不悬空；前端可重发 qrCreate 起新票据 |
| E1 | 并发 | 同 ticket 被并发 confirm/取号 | ticketId 幂等键 + CONFIRMED→CONSUMED CAS | 仅签发一次 token、一条 login_audit |
| E5 | 逃逸 | 微信网关整体不可用 | 降级：返回可解释错误 + 引导稍后重试；不发空 token | ticket 随 TTL EXPIRED |

- **后置**：ticket∈{CONSUMED,EXPIRED}；account∈{PENDING_ONBOARD,ACTIVE}；写 `login_audit`（脱敏，不记 unionid 明文，只记 hash）。
- **验收**：同 ticket 重复 confirm → 恰一次签发、一条 login_audit；取号失败→ticket 不停留在 CONFIRMED 悬空（转 AUTH-08 终态）；网关不可用→0 token + 可解释错误码。
- **关联**：契约 `POST /auth/qr`、`GET /auth/qr/:id/status`；状态机 QrLoginTicket、Account；原语 CAS+幂等键+事件日志；安全：token httpOnly、unionid 不落明文。

| TC | 层 | 断言 |
|---|---|---|
| TC-AUTH-01-main | e2e(Playwright) | 扫码→确认→落地 ACTIVE，token httpOnly |
| TC-AUTH-01-E1 | 集成(Testcontainers) | 并发 confirm 同 ticket → 1 token、login_audit=1 行 |
| **TC-AUTH-01-4a** | 集成 | mock 取号超时 → ticket 不停 CONFIRMED，按 AUTH-08 落终态；无 token |
| TC-AUTH-01-E5 | 集成 | mock 网关 5xx → HTTP 503 可解释码、0 token |
| TC-AUTH-01-contract | 契约 | qr/status 响应 schema 符合 Zod |

## UC-AUTH-02 · 首次登录建账（并发建账竞态）
**覆盖类**：正常 · 特殊 · 并发 · 刁钻
- **角色**：系统 / 求职者
- **前置**：unionid 取号成功且无对应 account。
- **触发**：CONSUMED 后落地建账。
- **主流程**：1) 以 unionid 为唯一键 `INSERT … ON CONFLICT DO NOTHING` 建 `account=PENDING_ONBOARD` 2) 冲突命中→回查既有 account 复用 3) 进入 onboarding。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 单次建账 | unionid UNIQUE | PENDING_ONBOARD |
| E2/并发 | 并发 | 用户双标签页/重试并发建账 | unionid UNIQUE + ON CONFLICT DO NOTHING（回查复用） | 恰一个 account，无重复 |
| Z1 | 刁钻 | unionid 漂移/跨主体不一致 | 转 ACCT-04 身份键裁决（不盲建第二账号） | 不分裂身份 |

- **后置**：account=PENDING_ONBOARD；写 `account_audit(create)`。
- **验收**：并发 N 路建账 → DB 恰 1 行 account；重复触发 0 副作用。
- **关联**：状态机 Account；原语 幂等键(unionid UNIQUE)+CAS；安全：RLS 建账后立即绑定 principal。

| TC | 层 | 断言 |
|---|---|---|
| **TC-AUTH-02-race** | 集成(Testcontainers 真 Postgres) | 并发 20 路建账同 unionid → account=1 行，其余读到既有行 |
| TC-AUTH-02-main | 单元 | 首次建账返回 PENDING_ONBOARD |

## UC-AUTH-03 · 防扫码登录劫持
**覆盖类**：异常 · 逃逸 · 刁钻 · 并发
- **角色**：攻击者 B / 受害者 A / 系统
- **前置**：A 浏览器创建 ticket（绑定 A 的 httpOnly `bindSid`）。
- **触发**：B 诱导 A 扫 B 屏上的码，或 B 用 A 的 ticketId 轮询取 token。
- **主流程**：发 token 前 **CAS 校验轮询端 sid==ticket.bindSid**；不符→拒发并 ticket→CANCELLED(hijack)。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| Z1 | 刁钻 | B 用不同会话轮询同 ticketId | CONFIRMED→CONSUMED 守卫 `sid==bindSid` CAS | B 端 403 且 **0 token**；ticket CANCELLED |
| Z2 | 刁钻 | 跨站诱导（A 扫码 B 受益） | bindSid 绑定 + 拒发 | 同上 |
| E2 | 并发 | A、B 同时轮询 | CAS 仅 bindSid 端可 CONSUMED | 仅 A 取得 token |

- **后置**：ticket∈{CONSUMED(仅 A),CANCELLED}；写 `login_audit(hijack_blocked)`。
- **验收**（有界、可证伪）：**轮询端 sid≠bindSid → HTTP 403 且响应体 0 token**；该 ticket 后续不可再 CONSUMED（终态 CANCELLED）。
- **关联**：状态机 QrLoginTicket；原语 CAS+幂等键；安全：会话绑定不可伪造（服务端 httpOnly sid，非客户端指纹）。

| TC | 层 | 断言 |
|---|---|---|
| TC-AUTH-03-Z1 | 集成 | B 会话轮询 → 403、body 无 token 字段、ticket=CANCELLED |
| TC-AUTH-03-E2 | 集成 | A/B 并发轮询 → 仅 A 1 token |

## UC-AUTH-04 · 令牌刷新与轮换
**覆盖类**：正常 · 异常 · 刁钻 · 并发
- **角色**：求职者 / 系统
- **触发**：access token 临期，用 refresh token 续期。
- **主流程**：1) 校验 refresh token 未撤销 2) **轮换**：旧 refresh 标记已用，签发新对（CAS family version+1）。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| Z1 | 刁钻 | refresh token 重放（已轮换的旧 token 再用） | family version CAS（重用旧版本=0 行）→判定盗用，撤销整个 family | 全端下线 + 告警 |
| E2 | 并发 | 多端并发刷新 | CAS 仅一个成功，另一个回查用新 token | 不双发 |
| E3 | 异常 | 账号已 BANNED/DELETED | 刷新前校验 account 终态 | 拒绝续期 |

- **后置**：写 `login_audit(refresh/rotate/revoke)`。
- **验收**：旧 refresh 二次使用 → 整 family 撤销 + 401。
- **关联**：原语 CAS+事件日志；安全：refresh 轮换防重放。

| TC | 层 | 断言 |
|---|---|---|
| TC-AUTH-04-Z1 | 集成 | 重放旧 refresh → family 撤销、后续全 401 |
| TC-AUTH-04-E2 | 集成 | 并发刷新 → 恰一新对生效 |

## UC-AUTH-05 · 登出与会话撤销
**覆盖类**：正常 · 特殊 · 逃逸
- **触发**：用户登出（本端/全端）。
- **主流程**：撤销会话/refresh family；全端登出写入会话撤销表，各端校验即失效。
- **后置**：写 `login_audit(logout)`。**验收**：登出后旧 token 调任意鉴权接口 → 401。
- **关联**：与 ACCT-05「一键下线全端」共用撤销机制。

| TC | 层 | 断言 |
|---|---|---|
| TC-AUTH-05-main | 集成 | 登出后旧 token → 401 |
| TC-AUTH-05-all | 集成 | 全端登出后所有端 token → 401 |

## UC-AUTH-06 · 封禁用户登录拦截（confirm 通过但发 token 前拦截）
**覆盖类**：异常 · 逃逸 · 刁钻
- **前置**：account=BANNED；用户仍走扫码到 CONFIRMED。
- **主流程**：发 token 前校验 account 终态=BANNED → **拒发 token，ticket `CONFIRMED→CANCELLED`**（不停留 CONFIRMED 悬空）。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| E3 | 异常 | BANNED 用户登录 | 发 token 前账号终态守卫 + ticket CONFIRMED→CANCELLED | 0 token；ticket 终态明确 |
| Z1 | 刁钻 | BANNED 用户狂刷登录 | 转 AUTH-09 限流 | 被限流 |

- **后置**：ticket=CANCELLED；写 `login_audit(banned_blocked)`。
- **验收**：BANNED 用户 confirm → 0 token 且 ticket 落 CANCELLED（非悬空 CONFIRMED）。
- **关联**：状态机 QrLoginTicket/Account；原语 CAS。

| TC | 层 | 断言 |
|---|---|---|
| TC-AUTH-06-E3 | 集成 | BANNED confirm → 0 token、ticket=CANCELLED |

## UC-AUTH-07 · 用户主动取消/拒绝微信授权（补 CANCELLED 正向入口）
**覆盖类**：正常 · 特殊
- **触发**：用户在微信端点「取消」或「拒绝授权」。
- **主流程**：微信回调拒绝事件 → ticket `PENDING/SCANNED→CANCELLED`；前端提示可重新扫码。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 用户取消授权 | PENDING/SCANNED→CANCELLED 迁移 | ticket CANCELLED，0 token |

- **后置**：ticket=CANCELLED；写 `login_audit(user_cancel)`。**验收**：取消事件 → ticket 落 CANCELLED，前端可发起新 qrCreate。
- **关联**：状态机 QrLoginTicket（CANCELLED 不再只由 hijack 驱动）。

| TC | 层 | 断言 |
|---|---|---|
| TC-AUTH-07-main | 集成 | 模拟拒绝回调 → ticket=CANCELLED、无 token |

## UC-AUTH-08 · CONFIRMED 取号失败/超时的终态与重入（修状态机悬空）
**覆盖类**：异常 · 逃逸 · 复杂 · 刁钻
- **前置**：ticket=CONFIRMED，但后端取 unionid 失败/超时。
- **主流程**：1) 取号失败计入 ticket 重入计数 2) 预算内（≤N 次，有界退避）→保持 CONFIRMED，下次轮询触发重试 3) 预算耗尽或 TTL 到 → `CONFIRMED→EXPIRED(reason=union_fetch_failed)` 4) 前端收终态后引导重新 qrCreate。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| E5 | 逃逸 | 取号瞬时失败 | 有界重入（CAS 计数 version+1） | 预算内重试 |
| E6 | 异常 | 取号持续失败/超时 | CONFIRMED→EXPIRED 终态 | ticket 不永久泄漏在 CONFIRMED |
| Z1 | 刁钻 | 会话停 3 天后才 resume 轮询 | TTL 守卫优先于重入：已过 TTL→EXPIRED | 不复活 |

- **后置**：ticket∈{CONSUMED(成功),EXPIRED}；写 `login_audit(union_fetch_fail/expired)`。
- **验收**：持续取号失败 N 次 → ticket 必达 EXPIRED（不悬空）；预算内一次成功 → CONSUMED 且仅签发一次（ticketId 幂等）。
- **关联**：状态机 QrLoginTicket 新增 CONFIRMED→EXPIRED 出边；原语 CAS+幂等键。

| TC | 层 | 断言 |
|---|---|---|
| TC-AUTH-08-retry | 集成 | mock 前 N-1 次失败、第 N 次成功 → ticket=CONSUMED，token 数=1 |
| TC-AUTH-08-expire | 集成 | mock 持续失败 → ticket=EXPIRED，重入计数=N |
| TC-AUTH-08-ttl | 集成 | TTL 过期 + CONFIRMED → EXPIRED（TTL 优先） |

## UC-AUTH-09 · qrCreate 限流/防刷（匿名 DoS 护栏）
**覆盖类**：逃逸 · 高并发 · 刁钻
- **角色**：匿名客户端 / 系统
- **触发**：匿名高频建 ticket。
- **主流程**：按 IP+设备指纹滑动窗口限流；超阈→拒绝建 ticket（429），可触发验证码升级或临时封禁。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| E5 | 逃逸 | 突发流量 | 限流 kill-switch（Redis 计数 CAS/INCR+TTL） | 拒新建 ticket |
| 并发 | 高并发 | 单 IP 并发暴建 | 原子计数器（Redis INCR 原子） | 限速精确，无超发 |
| Z1 | 刁钻 | 分布式刷码 | 多维(IP/指纹/全局)阈值 + 全局熔断 | 全局降级保护 |

- **后置**：超阈记 `security_audit(qr_rate_limited)`。**验收**：单 IP 超阈第 K+1 次 → 429 且未创建 ticket 行。
- **关联**：原语 CAS（限流计数原子）；安全：匿名入口护栏。

| TC | 层 | 断言 |
|---|---|---|
| TC-AUTH-09-limit | 集成 | 连发超阈 → 429，DB ticket 行数=阈值上限 |
| TC-AUTH-09-concurrent | 集成 | 并发暴建 → 计数精确不超发 |

---

# ONB · Onboarding

## UC-ONB-01 · 新用户 onboarding（C 端定位；B 端身份选择移出本期 scope）
**覆盖类**：正常 · 特殊 · 异常 · 刁钻 · 并发
- **角色**：求职者 / 系统
- **前置**：account=PENDING_ONBOARD。
- **触发**：首次登录进入引导。
- **主流程**：1) 展示 base 概括同意（CONSENT-01）+ 基础资料（昵称/求职意向，均非敏感） 2) i18n：按 Accept-Language/用户 locale 渲染 zh/en 条款与文案 3) base 同意 GRANTED 后 `account PENDING_ONBOARD→ACTIVE`。**`tenantType` 默认 `C` 且本期不暴露 B 端选择分支**（B 端开通另域，明确出本期 scope）。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 完成 base 同意+资料 | account CAS PENDING_ONBOARD→ACTIVE | ACTIVE |
| S1 | 特殊 | i18n/locale | 条款版本绑定 locale，留痕语言版本 | consent 记录含 locale |
| S2 | 特殊 | 中途退出再进入 | 幂等：onboarding 进度可续，不重复建账 | 幂等续接 |
| E4 | 异常 | base 同意被拒/未勾选 | 不迁 ACTIVE，停 PENDING_ONBOARD（功能受限） | 无越权放行 |
| Z1 | 刁钻 | **二次尝试变更 tenantType** | tenantType 写入即不可逆：变更请求 CAS 守卫 `tenantType IS NULL/默认` → 0 行拒绝 | 拒绝改写，写审计 |
| E2 | 并发 | 双端并发提交 onboarding | account 迁移 CAS | 恰一次迁 ACTIVE |

- **后置**：account=ACTIVE（或仍 PENDING_ONBOARD）；写 `account_audit(onboarded)`、consent 记录。
- **验收**：未给 base 同意 → 不进 ACTIVE；**已设定的 tenantType 二次变更请求被拒（0 行）**；中途退出再进 → 不重复建账。
- **关联**：契约 `POST /onboarding`；状态机 Account；原语 CAS+幂等键；安全：条款 i18n 版本留痕。**开放裁决：B 端 onboarding 全链路出本期 scope（建议），待产品确认。**

| TC | 层 | 断言 |
|---|---|---|
| TC-ONB-01-main | e2e | 同意+资料 → ACTIVE |
| TC-ONB-01-S1 | 集成 | en/zh locale → consent 记录 locale 正确 |
| **TC-ONB-01-tenant-immutable** | 集成 | 二次变更 tenantType → 403/0 行，审计有拒绝记录 |
| TC-ONB-01-E4 | 集成 | 拒绝 base → 仍 PENDING_ONBOARD，受限接口 403 |

---

# CONSENT · 实名与个人信息同意（PIPL）

## UC-CONSENT-01 · 概括同意（base）授予（PIPL 第14条知情同意）
**覆盖类**：正常 · 特殊 · 异常
- **主流程**：展示隐私政策摘要 → 用户勾选 → 写 `consent_record(scope=base, version, GRANTED, locale)`（append-only，不可篡改）。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 授予 base | consent_audit 有序日志追加 | GRANTED |
| S1 | 特殊 | 政策版本升级 | 旧版 SUPERSEDED，要求重新授予（CONSENT-04） | 版本可追溯 |
| E4 | 异常 | 未授予 | 不放行需同意的功能 | 受限 |

- **后置**：consent GRANTED；写 `consent_audit`。**验收**：每次授予/撤回都在 append-only 日志留痕且带 policy_version+locale。
- **关联**：原语 有序事件日志；安全：同意记录不可篡改。

| TC | 层 | 断言 |
|---|---|---|
| TC-CONSENT-01-main | 集成 | 授予 → 日志 1 条带版本/locale |

## UC-CONSENT-02 · 敏感个人信息单独同意 + 门禁（PIPL 第29条）
**覆盖类**：正常 · 异常 · 特殊 · 刁钻
- **前置**：account ACTIVE。
- **触发**：用户上传简历/触及敏感 PII 前。
- **主流程**：1) **单独**弹出敏感信息处理告知（目的/范围/影响） 2) 单独同意 GRANTED(scope=sensitive) 3) 放行简历上传/诊断。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 单独同意后上传 | 门禁校验 consent(sensitive)=GRANTED | 放行 |
| E3/刁钻 | 刁钻 | **绕过前端直接调 upload/诊断 API** | 服务端门禁强制：无 sensitive 同意→403 | 0 处理，无泄露 |
| S1 | 特殊 | 仅给 base 未给 sensitive | 服务端区分 scope，敏感功能仍 403 | 受限 |

- **后置**：consent(sensitive)=GRANTED；写 consent_audit。**验收**：未给 sensitive 同意时，直连 upload/诊断 API → **服务端 403**（不依赖前端拦截）。
- **关联**：契约 `POST /consent`、受保护资源端点；原语 RLS+有序日志；安全：敏感信息单独同意（第29条）。

| TC | 层 | 断言 |
|---|---|---|
| TC-CONSENT-02-main | e2e | 单独同意后可上传 |
| **TC-CONSENT-02-bypass** | 集成 | 直连 upload API 无 sensitive 同意 → 403、无简历落库 |

## UC-CONSENT-03 · 撤回敏感同意 → 级联停止处理
**覆盖类**：正常 · 异常 · 复杂 · 逃逸
- **主流程**：1) 撤回 → consent(sensitive) GRANTED→WITHDRAWN 2) 级联：停止后续敏感处理，敏感功能门禁关闭，已生成派生数据按策略删/匿名化。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 撤回 sensitive | consent CAS→WITHDRAWN + 门禁即时关闭 | 敏感功能 403 |
| E6/复杂 | 复杂 | 撤回时有 in-flight 诊断 | 有序事件日志：撤回事件后入队的处理被拒 | 不再处理新敏感数据 |
| 逃逸 | 逃逸 | 撤回即安全终止相关会话 | 安全终止（safe_terminate）relevant runs | 不强杀业务事实 |

- **后置**：consent=WITHDRAWN；写 consent_audit。**验收**：撤回后敏感 API → 403；撤回时间戳后不得有新敏感处理记录。
- **关联**：原语 CAS+有序日志；安全：撤回不影响已合法产出但停止新处理。

| TC | 层 | 断言 |
|---|---|---|
| TC-CONSENT-03-main | 集成 | 撤回后敏感 API → 403 |
| TC-CONSENT-03-inflight | 集成 | 撤回后入队的敏感处理被拒 |

## UC-CONSENT-04 · 同意版本升级与重新授权
**覆盖类**：正常 · 特殊 · 异常
- **主流程**：政策版本变更 → 旧 consent SUPERSEDED → 关键功能前要求重新授予新版本。
- **后置**：新版 GRANTED；旧版 SUPERSEDED 留痕。**验收**：版本变更后，未重授前调受影响功能 → 要求重新同意。
- **关联**：原语 有序日志（版本链）。

| TC | 层 | 断言 |
|---|---|---|
| TC-CONSENT-04-main | 集成 | 升版后未重授 → 拦截要求重新同意；版本链完整 |

## UC-CONSENT-05 · 未成年识别与门禁（<14 监护人同意 / 14–18 限制行为能力）
**覆盖类**：异常 · 特殊 · 逃逸 · 刁钻
- **前置**：年龄/实名数据来源由 CONSENT-10 定义（**扫码登录本身不提供年龄**）。
- **触发**：用户在提供实名/年龄信息（CONSENT-10 定义的来源，如实名认证/自填生日并经校验）后。
- **主流程**：1) 取得年龄输入（CONSENT-10） 2) age<14 → 必须监护人同意(scope=guardian)，否则关闭处理门禁 3) 14≤age<18 → 标记限制民事行为能力，大额消费门禁（PAY-07）。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| E3 | 异常 | age<14 无监护同意 | 服务端门禁：敏感处理/上传 API 403 | 0 处理 |
| S1 | 特殊 | 14–18 | 标记 limited_capacity，转 PAY-07 大额门禁 | 受限消费 |
| Z1 | 刁钻 | 谎报年龄绕门禁 | 以 CONSENT-10 权威来源为准，非纯前端自填 | 不被绕过 |
| 逃逸 | 逃逸 | 无年龄来源 | 默认按未识别处理（不放行高风险），引导补实名 | fail-safe |

- **后置**：写 consent_audit(minor_gate)。**验收**：age<14 无监护同意 → 上传/诊断 API **403（集成验证执行点，非仅单元判定分支）**。
- **关联**：状态机 ConsentRecord(guardian)；原语 RLS+有序日志；安全：未成年保护。依赖 CONSENT-10。

| TC | 层 | 断言 |
|---|---|---|
| **TC-CONSENT-05-minor-gate** | 集成 | age<14 无监护同意 → 上传/诊断 API 实际 403、无数据落库（执行点门禁，非单元分支） |
| TC-CONSENT-05-14to18 | 集成 | 14–18 标记 limited_capacity，大额充值被 PAY-07 拦 |

## UC-CONSENT-06 · 撤回 base 概括同意 → 账号级联受限/引导注销（新增，修机制洞）
**覆盖类**：异常 · 逃逸 · 复杂
- **主流程**：1) 撤回 base → consent(base) WITHDRAWN 2) 无 base 同意即无法继续处理个人信息 → `account ACTIVE→RESTRICTED` 3) RESTRICTED 下仅保留查阅/导出/注销入口，引导用户注销或重新授予。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 异常 | 撤回 base | consent CAS + account ACTIVE→RESTRICTED 级联迁移 | RESTRICTED |
| 逃逸 | 逃逸 | 引导注销 | RESTRICTED→DELETING（ACCT-02） | 安全出口 |
| 复杂 | 复杂 | 重新授予恢复 | RESTRICTED→ACTIVE（重授 base） | 恢复 |

- **后置**：account=RESTRICTED；写 consent_audit+account_audit。**验收**：撤回 base → 业务处理类 API 403、账号=RESTRICTED，仅查阅/导出/注销可用。
- **关联**：状态机 Account 新增 ACTIVE↔RESTRICTED；原语 CAS+有序日志。

| TC | 层 | 断言 |
|---|---|---|
| TC-CONSENT-06-main | 集成 | 撤回 base → account=RESTRICTED，业务 API 403，导出/注销可用 |
| TC-CONSENT-06-restore | 集成 | RESTRICTED 重授 base → ACTIVE |

## UC-CONSENT-07 · 个人信息查阅/复制/导出（PIPL 第45条 可携带权）（新增）
**覆盖类**：正常 · 特殊 · 异常 · 复杂 · 高并发 · 刁钻
- **触发**：用户申请导出个人信息副本。
- **主流程**：1) 建 `data_export_request`（状态机 pending→generating→ready→downloaded/expired），异步打包结构化数据 2) 完成发通知，限时下载链接（鉴权+一次性）。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 导出 | RLS：仅本人数据范围（principal 绑定） | ready |
| 并发 | 高并发 | 重复点「导出」 | 幂等键（用户+窗口）：合并为一个 request | 不重复打包 |
| E3 | 刁钻 | 拿他人 export 下载链接 | RLS + 链接绑定 principal 一次性 token | 403 |
| 复杂 | 复杂 | 大数据量分片打包 | 有序进度事件，可断点 | 不超时丢任务 |
| S1 | 特殊 | RESTRICTED 账号 | 导出仍可用（合规权利不受限） | 放行 |

- **后置**：export ready；写 audit(export_requested/downloaded)。**验收**：导出仅含本人数据（越权 0 行）；重复申请去重；下载链接他人不可用。
- **关联**：原语 RLS+幂等键+有序日志；安全：导出含 PII，链接一次性、不记明文。

| TC | 层 | 断言 |
|---|---|---|
| TC-CONSENT-07-main | 集成 | 导出内容范围==本人，schema 完整 |
| TC-CONSENT-07-idem | 集成 | 并发重复申请 → 1 个 request |
| TC-CONSENT-07-rls | 集成 | 他人下载链接 → 403 |

## UC-CONSENT-08 · 自动化决策解释与拒绝权（PIPL 第24条，针对 AI 打分/职业建议）（新增）
**覆盖类**：正常 · 特殊 · 异常 · 逃逸
- **触发**：用户对 AI 面试评分/职业建议要求解释或拒绝自动化决策。
- **主流程**：1) 提供该决策的可解释依据（输入因子/口径，引用 trace，不泄露提示词） 2) 用户可拒绝纯自动化决策 → 标记 consent(automated_decision)=WITHDRAWN，转人工/非自动路径或停用该能力。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 请求解释 | 引用 ai_invocation_trace（脱敏） | 返回解释 |
| 逃逸 | 逃逸 | 拒绝自动化决策 | consent(automated_decision) WITHDRAWN → 关闭该能力/人工接管 | 不再自动决策 |
| Z1/异常 | 异常 | 解释请求试图套提示词 | 解释只给业务口径，绝不回显 system prompt | 不泄露 |

- **后置**：写 consent_audit(automated_decision)。**验收**：拒绝后不再对其执行自动化打分；解释响应不含提示词原文/密钥。
- **关联**：原语 有序日志；安全：模型输出/提示词不外泄；保留用户最终决策权。

| TC | 层 | 断言 |
|---|---|---|
| TC-CONSENT-08-explain | 集成 | 解释含业务因子、不含 prompt 原文 |
| TC-CONSENT-08-optout | 集成 | 拒绝后自动打分接口对其关闭/转人工 |

## UC-CONSENT-09 · 跨境传输单独同意（PIPL 第38/39条，LLM 若境外）（新增）
**覆盖类**：特殊 · 异常 · 逃逸 · 刁钻
- **前置**：模型部署位置已知（境内默认不触发；本项目取境内模型，跨境为条件分支）。
- **主流程**：若数据将出境 → 必须**单独同意**(scope=cross_border) 告知接收方/目的/类型；未同意则不出境，降级到境内模型或停用该能力。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| S1 | 特殊 | 境内模型 | 不触发跨境同意 | 直接处理 |
| E5 | 逃逸 | 需出境但未同意 | 门禁：无 cross_border 同意→不出境，降级境内/停用 | 不越境 |
| Z1 | 刁钻 | 配置漂移误把数据送境外 | 出境调用前强制校验 consent(cross_border) | 拦截 |

- **后置**：写 consent_audit(cross_border)。**验收**：无 cross_border 同意 → 任何出境调用被拦截（0 出境请求）。
- **关联**：原语 RLS/门禁+有序日志；安全：跨境单独同意。**开放裁决：本期模型境内，CONSENT-09 为预留分支，触发取决于部署。**

| TC | 层 | 断言 |
|---|---|---|
| TC-CONSENT-09-gate | 集成 | mock 出境路径无同意 → 0 出境调用 |

## UC-CONSENT-10 · 实名/年龄数据来源定义（补 CONSENT-05 触发输入）（新增）
**覆盖类**：正常 · 特殊 · 异常 · 刁钻
- **目的**：定义年龄/实名的权威来源，使未成年识别（CONSENT-05）可测、非空洞。
- **主流程**：1) 扫码登录**不提供**年龄/实名 2) 年龄来源限定为：可选实名认证（权威）或用户自填生日（弱，需配合大额支付实名校验）3) 来源、采集时间、是否经校验全部留痕，作为 CONSENT-05/PAY-07 的确定性输入。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 完成实名 | 写 identity_verification（权威来源标记） | 年龄可用 |
| S1 | 特殊 | 未提供任何年龄来源 | CONSENT-05 走 fail-safe（按未识别） | 不放行高风险 |
| Z1 | 刁钻 | 自填生日造假 | 弱来源标记 unverified；大额支付触发实名复核 | 不以弱来源放行大额 |

- **后置**：写 identity_audit(age_source)。**验收**：CONSENT-05/PAY-07 的年龄判定输入必有明确来源字段（authoritative/unverified/none），无来源时 fail-safe。
- **关联**：为 CONSENT-05、PAY-07 提供确定性触发输入；原语 有序日志。

| TC | 层 | 断言 |
|---|---|---|
| TC-CONSENT-10-source | 单元+集成 | 年龄判定输入带来源枚举；无来源→fail-safe 路径 |

---

# ACCT · 账号

## UC-ACCT-01 · 查看/编辑账号资料
**覆盖类**：正常 · 特殊 · 异常
- **主流程**：RLS 下读写本人资料。**验收**：越权读写他人资料 → 0 行/403。
- **关联**：原语 RLS。

| TC | 层 | 断言 |
|---|---|---|
| TC-ACCT-01-rls | 集成 | userB 改 userA 资料 → 403/0 行 |

## UC-ACCT-02 · 注销账号（冷静期 saga；冷静期内撤销恢复）
**覆盖类**：正常 · 异常 · 复杂 · 高并发 · 逃逸
- **主流程**：1) 用户发起注销 + 二次确认 → `account→DELETING`，启动冷静期（如 15 天） 2) 冷静期内可**撤销恢复 ACTIVE** 3) 冷静期到期 → 执行删除/匿名化（业务数据），交易凭证依法保留（转 ACCT-06）。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 发起注销 | ACTIVE→DELETING CAS | DELETING |
| **A2** | 正常 | **冷静期内撤销恢复** | DELETING→ACTIVE CAS（冷静期未到期守卫） | ACTIVE |
| 复杂 | 复杂 | 删除 saga 多步（简历/面试/导出/权益清算） | 有序事件日志驱动 saga，每步幂等 | 可重入完成 |
| 并发 | 高并发 | 冷静期到期执行 与 用户撤销 竞态 | CAS：恢复(DELETING→ACTIVE) vs 执行(DELETING→DELETED) 仅一个赢 | 不会既恢复又删除 |
| 逃逸 | 逃逸 | 删除 saga 中途崩溃 | outbox 重投 + 幂等，断点续删 | 最终一致 |

- **后置**：account∈{ACTIVE(撤销),DELETED}；写 account_audit。**验收**：冷静期内撤销 → 恢复 ACTIVE（**此恢复正向路径有独立 TC**）；到期执行与撤销并发 → 恰一个结果。
- **关联**：状态机 Account；原语 CAS+有序日志+幂等键；与 ACCT-06 财务保留协同。

| TC | 层 | 断言 |
|---|---|---|
| TC-ACCT-02-main | 集成 | 发起注销 → DELETING |
| **TC-ACCT-02-cancel-restore** | 集成 | 冷静期内撤销 → account=ACTIVE（恢复路径本身断言） |
| TC-ACCT-02-race | 集成(Testcontainers) | 到期执行 vs 撤销并发 → 恰一个赢，状态唯一 |
| TC-ACCT-02-saga | 集成 | 删除 saga 中途 kill 重投 → 全步完成、幂等 |

## UC-ACCT-03 · 风控冻结（系统/风控驱动）
**覆盖类**：异常 · 逃逸 · 刁钻
- **主流程**：风控**确定性阈值**（给定特征向量→确定判定）命中 → `account→FROZEN`，敏感操作受限，走申诉/人工复核解冻。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| E3 | 异常 | 命中风控阈值 | 特征向量→确定判定 + ACTIVE→FROZEN CAS | FROZEN |
| 逃逸 | 逃逸 | 人工复核解冻 | FROZEN→ACTIVE（人工接管） | 恢复 |
| Z1 | 刁钻 | 边界分数抖动 | 阈值确定性、可注入 fixture 复现 | 判定稳定 |

- **后置**：account=FROZEN；写 security_audit。**验收**：给定特征向量 fixture → 确定性 FROZEN/不 FROZEN（可证伪）。
- **关联**：原语 CAS。**开放裁决：风控阈值/评分模型标定。**

| TC | 层 | 断言 |
|---|---|---|
| TC-ACCT-03-threshold | 集成 | fixture 特征向量越阈 → FROZEN；未越阈 → 不变 |

## UC-ACCT-04 · unionid 唯一身份键 + 漂移/换绑处理
**覆盖类**：正常 · 特殊 · 异常 · 刁钻
- **主流程**：unionid 为主身份键；处理开放平台跨主体不一致/换绑边角：1) 新 unionid 无映射→正常建账 2) 疑似同人不同 unionid→不自动合并，进人工/二次校验合并流，不分裂也不误并。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 稳定 unionid | UNIQUE 键 | 单账号 |
| Z1 | 刁钻 | 跨主体 unionid 漂移 | 不盲建/不盲并，挂 pending_merge，人工裁决 | 身份不分裂 |
| E2 | 异常 | 换绑导致键变更 | 受控合并（CAS 迁移关联），审计留痕 | 一致 |

- **后置**：写 identity_audit(merge/drift)。**验收**：unionid 漂移 → 不自动产生第二活跃账号，挂待裁决。
- **关联**：原语 幂等键(UNIQUE)+CAS。

| TC | 层 | 断言 |
|---|---|---|
| TC-ACCT-04-drift | 集成 | 同人不同 unionid → 不自动合并/不双账号，置 pending_merge |

## UC-ACCT-05 · 用户自助安全冻结 / 异地登录提醒 / 一键下线全端（新增，用户侧逃逸通道）
**覆盖类**：正常 · 逃逸 · 高并发 · 刁钻
- **触发**：用户收到异地登录提醒，或主动判断「这不是我本人登录」。
- **主流程**：1) 异地/异常登录 → 推送提醒并提供「一键下线全端 + 冻结」 2) 用户触发 → 撤销全部会话/refresh family（AUTH-04/05 机制）+ `account ACTIVE→SELF_FROZEN` 3) 二次校验后用户自行解冻。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 一键下线全端 | 会话撤销表（全 family version+1 CAS） | 所有端 401 |
| 逃逸 | 逃逸 | 用户自助冻结 | ACTIVE→SELF_FROZEN，用户侧安全自救入口 | SELF_FROZEN |
| 并发 | 高并发 | 下线全端 与 攻击者刷新 竞态 | family version CAS：撤销后旧 refresh=0 行 | 攻击者被踢 |
| Z1 | 刁钻 | 攻击者已持 token 仍在操作 | 撤销即时生效（各端鉴权校验撤销表） | 即时失效 |

- **后置**：account=SELF_FROZEN；写 login_audit/security_audit。**验收**：一键下线后所有既有 token → 401；自助冻结后需二次校验才解冻。
- **关联**：状态机 Account(SELF_FROZEN)；原语 CAS+有序日志；安全：用户最终控制权。

| TC | 层 | 断言 |
|---|---|---|
| TC-ACCT-05-logout-all | 集成 | 一键下线后全端 token → 401 |
| TC-ACCT-05-selffreeze | 集成 | 自助冻结 → SELF_FROZEN，登录受限直至二次校验解冻 |
| TC-ACCT-05-race | 集成(Testcontainers) | 下线 vs 攻击者刷新并发 → 旧 family 全失效 |

## UC-ACCT-06 · 注销与财务/审计保留义务裁决（新增，修删除 vs 留存冲突）
**覆盖类**：异常 · 特殊 · 复杂 · 刁钻
- **目的**：裁决 PIPL 删除权 与 税务/审计交易凭证留存义务冲突。
- **主流程**：account DELETED 时：1) **业务数据**（简历/面试/画像）删除或匿名化 2) `payment_order`/`consumption_record`/`entitlement_ledger` 等**交易凭证依法保留**（保留期内），并**与已删账号解关联**（去标识/置 deleted_subject 引用，不可反查个人） 3) 留存数据不再可用于业务处理。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 异常 | 删账时财务数据处理 | 业务数据删/匿名；交易凭证保留+解关联（去标识 CAS 更新引用） | 合法且删得干净 |
| 复杂 | 复杂 | 解关联 saga 跨表 | 有序事件日志驱动，幂等 | 一致 |
| Z1 | 刁钻 | 通过保留的订单反查个人 | 凭证去标识，无法反向关联到自然人 | 不可反查 |
| S1 | 特殊 | 保留期到期 | 到期后凭证按策略清理 | 合规清理 |

- **后置**：业务数据 DELETED/匿名；财务凭证 retained+解关联；写 account_audit(deletion_with_retention)。**验收**：删账后简历/面试不可查（0 行）；交易凭证仍存在但不含可反查 PII。
- **关联**：原语 RLS+CAS+有序日志；安全：删除权 vs 法定留存的合规裁决。**开放裁决：凭证法定保留年限按税务/审计法规确定。**

| TC | 层 | 断言 |
|---|---|---|
| TC-ACCT-06-delete | 集成 | 删账后业务数据 0 行；payment_order 仍在 |
| TC-ACCT-06-deident | 集成 | 保留订单无法反查到自然人（PII 去标识） |

---

# ENT · 权益次数

## UC-ENT-01 · 查看权益余额
**覆盖类**：正常 · 特殊 · 异常
- **主流程**：RLS 下聚合各桶 remaining。**验收**：越权查他人余额 → 0 行。
- **关联**：原语 RLS+有序日志（余额由 ledger 派生，见 ENT-05）。

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-01-rls | 集成 | 越权查询 → 0 行 |

## UC-ENT-02 · 两阶段消费 reserve→confirm/release
**覆盖类**：正常 · 异常 · 高并发 · 复杂 · 逃逸
- **前置**：有可用余额。
- **主流程**：1) 能力启动：额度桶 CAS 扣减 + 建 `consumption_record(reserved)`（idempotency_key UNIQUE） 2) 能力成功 → reserved→confirmed 3) 能力失败/中止 → reserved→released（额度 CAS 回补）。部分完成裁决见 ENT-09。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 成功消费 | reserve CAS + confirm | confirmed |
| E4 | 异常 | 能力失败 | reserved→released + 额度回补 CAS | released（退次） |
| E1/并发 | 高并发 | 双击启动同能力 | idempotency_key UNIQUE + ON CONFLICT DO NOTHING | 仅占一次 |
| E2 | 高并发 | 并发扣同一桶 | 桶 remaining CAS（version 守卫） | 恰一个扣成功 |
| 逃逸 | 逃逸 | reserve 后进程崩溃 | 转 ENT-07 reaper 通用回收 | 最终 released |
| 复杂 | 复杂 | reserve→confirm 跨能力会话 | 有序事件日志记账 | 可对账 |

- **后置**：consumption∈{confirmed,released}；写 entitlement_ledger。**验收**：双击启动 → 仅 1 条 reserved；失败 → 余额回补；并发扣桶 → 不超扣。
- **关联**：状态机 ConsumptionRecord/EntitlementGrant；原语 全四条。

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-02-main | 集成 | 成功 → confirmed、余额-1 |
| TC-ENT-02-E4 | 集成 | 失败 → released、余额回补 |
| TC-ENT-02-idem | 集成 | 双击 → reserved=1 |
| TC-ENT-02-cas | 集成(Testcontainers) | 并发扣桶 → 恰一成功，余额不为负 |

## UC-ENT-03 · trial 权益首次发放
**覆盖类**：正常 · 特殊 · 高并发 · 刁钻
- **主流程**：首次 onboarding 完成发放 trial 桶（带 expires_at），幂等键=account+「trial_grant」防重领。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| S1 | 特殊 | 首次发放 | 幂等键防重领 | trial 桶建立 |
| 并发 | 高并发 | 并发触发发放 | 幂等键 UNIQUE | 仅发一次 |
| Z1 | 刁钻 | 注销重注册刷 trial | 以 unionid/设备维度防刷标记 | 不重复白嫖 |

- **后置**：写 entitlement_ledger(grant)。**验收**：重复触发 → trial 仅发一次；注销重注册按策略不重发。
- **关联**：原语 幂等键+有序日志。

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-03-once | 集成 | 并发发放 → trial 桶 1 个 |
| TC-ENT-03-refarm | 集成 | 注销重注册 → 不重发 trial |

## UC-ENT-04 · 多桶扣减顺序（到期 FIFO + 类型优先裁决见 ENT-10）
**覆盖类**：正常 · 特殊 · 高并发 · 复杂
- **主流程**：扣减按裁决顺序选桶（默认见 ENT-10）；每桶 CAS。
- **后置**：写 ledger。**验收**：给定多桶场景 → 扣减顺序确定可复现。
- **关联**：原语 CAS；裁决依赖 ENT-10。

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-04-order | 集成 | 多桶按裁决顺序扣，结果确定 |
| TC-ENT-04-race | 集成(Testcontainers) | 并发扣多桶 → 不超扣、顺序一致 |

## UC-ENT-05 · 余额事件溯源重建
**覆盖类**：正常 · 复杂 · 刁钻
- **主流程**：余额=对 `entitlement_ledger` 的有序回放；缓存余额仅派生。
- **验收**（收敛可测）：**对任一已提交事件序列，回放余额 == 缓存余额**（非「任意时刻」绝对表述）。
- **关联**：原语 有序事件日志。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| 复杂 | 复杂 | 随机 grant/reserve/confirm/release 序列 | 回放==缓存 | 一致 |
| Z1 | 刁钻 | 缓存被污染 | 以 ledger 重建为真相 | 自愈 |

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-05-replay | 集成(property) | 随机已提交序列回放余额 == 缓存余额 |

## UC-ENT-06 · 长会话租约回收
**覆盖类**：异常 · 逃逸 · 高并发 · 复杂
- **主流程**：长会话（模拟面试）持 thread lease + reserved；lease 续约失败/会话超 TTL → 回收：reserved→released 退次。区别于通用崩溃回收（ENT-07）。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| E6 | 异常 | 会话超 TTL 未推进 | lease 过期 + reserved→released CAS | 退次 |
| 并发 | 高并发 | 回收 与 用户 resume 竞态 | lease CAS 仅一方持有 | 不双推进 |
| 逃逸 | 逃逸 | 会话停 3 天后 resume | lease 已回收→拒绝陈旧 resume，引导重开 | 不复活旧扣费 |

- **后置**：consumption=released；写 ledger。**验收**：会话超 TTL → 自动退次；回收后陈旧 resume 被拒。
- **关联**：原语 CAS（lease）+有序日志。

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-06-reclaim | 集成 | 超 TTL → released 退次 |
| TC-ENT-06-stale-resume | 集成 | 回收后 resume → 拒绝，无重复扣 |

## UC-ENT-07 · 孤儿 RESERVED 通用回收 reaper（新增，最高优先级·资损）
**覆盖类**：异常 · 逃逸 · 高并发 · 复杂 · 刁钻
- **目的**：覆盖「reserve 之后、能力/graph 触发之前进程崩溃」造成的**永久 RESERVED**（次/钱泄漏），区别于 ENT-06 长会话租约。
- **主流程**：1) 独立 reaper job（带 principal，RLS 合规）周期扫描 `consumption_record=reserved` 且超**推进宽限期**仍无对应 run 推进的 2) 对每条以处置幂等键 CAS `reserved→released` 回补额度 3) 落有序事件日志。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| E4 | 异常 | reserve 后崩溃留孤儿 | reaper：reserved→released CAS（前态守卫） | 退次 |
| 并发 | 高并发 | reaper 与 迟到的真实 confirm 竞态 | CAS 前态守卫：confirm 已发生则 reaper 0 行（不误退） | 不误回收 |
| 逃逸 | 逃逸 | 多实例 reaper 并跑 | 处置幂等键 + CAS，仅一个处置 | 不重复退 |
| 复杂 | 复杂 | 批量孤儿 | 有序日志逐条幂等 | 全部回收 |
| Z1 | 刁钻 | 时钟漂移误判宽限期 | 以 DB 服务端时间 + 充足宽限，避免误回收 in-flight | 不误杀活跃 |

- **后置**：孤儿 consumption=released；写 entitlement_ledger(reaped_release)。**验收**：超宽限孤儿 reserved → 被 reaper 退次；真实 in-flight（已 confirm 或仍活跃）**不被误回收**（CAS 0 行）。
- **关联**：状态机 ConsumptionRecord；原语 CAS+幂等键+RLS+有序日志（全四条）。

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-07-reap | 集成 | 注入超宽限孤儿 → reaper 后 released、余额回补 |
| TC-ENT-07-noerr | 集成(Testcontainers) | reaper 与迟到 confirm 并发 → confirm 赢则 reaper 0 行（不误退） |
| TC-ENT-07-multi | 集成 | 双实例 reaper → 每孤儿仅退一次 |
| TC-ENT-07-clock | 单元 | 时钟漂移注入 → 用服务端时间，未超宽限不回收 |

## UC-ENT-08 · 能力级 kill-switch 对 in-flight RESERVED 的处置（新增，逃逸通道）
**覆盖类**：逃逸 · 异常 · 高并发 · 复杂
- **触发**：某能力（如模拟面试）紧急下线/维护。
- **主流程**：1) 置能力 kill-switch=on → **拒绝新 reserve**（启动门禁返回可解释降级） 2) 对存量 `reserved` 未 `confirmed` 批量 `reserved→released` 退次（CAS+处置幂等键） 3) 通知受影响用户、相关 run 安全终止。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| 逃逸 | 逃逸 | 能力下线 | kill-switch：拒新 reserve + 批量 released | 拒新+退存量 |
| 并发 | 高并发 | 批量退 与 用户正完成 竞态 | CAS 前态守卫：已 confirm 的不退 | 不误退已完成 |
| 异常 | 异常 | 退次 job 中途崩溃 | 处置幂等键 + 有序日志重投 | 全部退完 |
| 复杂 | 复杂 | 安全终止关联 run | safe_terminate run + 业务事实保全 | 一致 |

- **后置**：存量 reserved→released；新 reserve 被拒；写 ledger+ops_audit。**验收**：kill-switch 开启后，新启动被拒（降级），存量 reserved 全部退次且已 confirmed 不受影响。
- **关联**：原语 CAS+幂等键+有序日志；状态机 ConsumptionRecord/AiGraphRun(safe_terminate)；安全：kill-switch 逃逸通道。

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-08-killnew | 集成 | kill-switch 开 → 新 reserve 403/降级 |
| TC-ENT-08-drain | 集成 | 存量 reserved 批量 released；confirmed 不变 |
| TC-ENT-08-resume | 集成 | 退次 job kill 后重投 → 全部退完，幂等 |

## UC-ENT-09 · 部分完成计费裁决（新增）
**覆盖类**：异常 · 特殊 · 复杂 · 刁钻
- **目的**：裁决「模拟面试 5 题完成 3 题后失败」的退/计策略。
- **主流程**（默认裁决，待产品确认）：模拟面试以**整次**为计费单位 → 未达完成判据即 `reserved→released`（全退，不部分计费）；若产品改为按里程碑计费，则按已达里程碑 confirm 部分、其余 release。两种口径都必须落到 consumption 状态机，不留模糊。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| E4 | 异常 | 3/5 题后失败（默认全有全无） | reserved→released 全退 | 退次 |
| S1 | 特殊 | 里程碑计费口径 | 部分 confirm + 部分 release | 部分计费 |
| Z1 | 刁钻 | 用户故意做到第4题中断刷免费 | 完成判据 + 防滥用计数 | 不被白嫖 |
| 复杂 | 复杂 | 部分完成 + 报告子图 | 报告子图舱壁，不影响计费裁决 | 隔离 |

- **后置**：consumption∈{released,confirmed/部分}；写 ledger。**验收**：给定完成 3/5 → 按选定口径确定性退/计（可证伪）。
- **关联**：状态机 ConsumptionRecord；原语 CAS+有序日志。**开放裁决：全有全无 vs 里程碑计费，产品口径待定（默认全退）。**

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-09-allnothing | 集成 | 3/5 失败（默认口径）→ 全退 released |
| TC-ENT-09-milestone | 集成 | 里程碑口径 → 部分 confirm、部分 release |

## UC-ENT-10 · trial vs paid 扣减优先级与回收顺序裁决（新增）
**覆盖类**：正常 · 特殊 · 复杂 · 刁钻
- **目的**：裁决「类型优先（先扣 trial）」与「到期优先（FIFO）」冲突，及退款回收（PAY-04）按哪类回收。
- **主流程**（默认裁决，待确认）：扣减顺序 = **先到期优先，同到期内先 trial**（消耗免费且临期的，保护已付费长效）；退款回收 = **回收对应支付来源的 paid 桶**（按 payment_order 关联回收，不动 trial）。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 同到期 trial+paid | 先 trial 后 paid（CAS 各桶） | 顺序确定 |
| S1 | 特殊 | 临期 paid vs 长效 trial | 到期优先压过类型 | 临期先扣 |
| 复杂 | 复杂 | 退款回收选桶 | 回收对应 payment_order 的 paid 桶 | 精确回收 |
| Z1 | 刁钻 | 用退款回收去吃掉 trial | 回收只动来源 paid 桶 | 不误扣 trial |

- **后置**：写 ledger。**验收**：给定桶组合 → 扣减/回收顺序确定可复现；退款只回收对应 paid。
- **关联**：原语 CAS+有序日志；与 PAY-04 协同。**开放裁决：到期优先 vs 类型优先的默认次序，待产品确认。**

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-10-order | 集成 | 混合桶扣减顺序确定 |
| TC-ENT-10-refund-bucket | 集成 | 退款仅回收来源 paid 桶，trial 不变 |

---

# PAY · 充值入口与支付

## UC-PAY-01 · 创建充值订单
**覆盖类**：正常 · 异常 · 特殊 · 高并发 · 刁钻
- **触发**：用户在充值入口选套餐下单。
- **主流程**：1) **服务端权威定价**（PAY-09），建 `payment_order=created`（绑定 `clientOrderToken` 幂等键） 2) 调渠道预下单 3) 返回支付参数。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 下单成功 | clientOrderToken 幂等键 | created |
| 2a/E4 | 异常 | **渠道预下单失败** | created→expired(channel_prepay_failed)，引导新单 | 终态明确，不悬空 |
| E1/并发 | 高并发 | 双击下单 | clientOrderToken UNIQUE → 复用同单 | 仅一单 |
| S1 | 特殊 | created 超 TTL 未付 | created→expired | 过期 |
| Z1 | 刁钻 | 前端改价 | 转 PAY-09 服务端定价覆盖 | 以服务端价为准 |

- **后置**：order∈{created,expired}；写 payment_audit。**验收**：双击 → 1 单；渠道失败 → order=expired（非悬空 created）。
- **关联**：状态机 PaymentOrder；原语 幂等键+CAS。

| TC | 层 | 断言 |
|---|---|---|
| TC-PAY-01-main | 集成 | 下单 → created，价=服务端价 |
| TC-PAY-01-idem | 集成 | 双击同 token → 1 单 |
| **TC-PAY-01-2a** | 集成 | mock 渠道失败 → order=expired，可起新单 |

## UC-PAY-02 · 支付异步通知履约（跨聚合 outbox 重投，非同事务）
**覆盖类**：正常 · 异常 · 高并发 · 复杂 · 逃逸
- **前置**：order=created。
- **主流程**：1) 收到渠道通知：幂等键=（支付单号+通知流水）+ **服务端金额复核** + 乱序守卫 → `created→paid` 2) **派生 outbox 事件**（事务性 outbox，与 paid 同库事务） 3) 独立履约消费者读 outbox → 调 entitlement 业务服务发权益（CAS）→ `paid→fulfilled`。**支付（commerce）与发权益（entitlement）跨聚合，绝不同 DB 事务**；靠 outbox + 可重入。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 通知→履约 | 幂等键 + outbox + 履约 CAS | fulfilled |
| E1 | 高并发 | **重复回调（同交易号）** | 通知幂等键 ON CONFLICT DO NOTHING | 仅履约一次 |
| E6 | 异常 | 通知乱序 | 乱序守卫（状态前态 + 单调） | 不错乱 |
| 复杂/逃逸 | 复杂 | 发权益失败/履约消费者崩溃 | paid→fulfill_failed → outbox 重投可重入直至 fulfilled | 最终一致 |
| Z1 | 刁钻 | 伪造通知 | 渠道签名校验 + 金额复核 | 拒绝 |

- **后置**：order∈{fulfilled,fulfill_failed→(重投)fulfilled}；写 payment_event(outbox)+entitlement_ledger。**验收**：重复回调 → 权益仅发一次；履约消费者崩溃后 outbox 重投 → 最终 fulfilled（**跨服务重投，非单事务回滚**）。
- **关联**：状态机 PaymentOrder/EntitlementGrant；原语 幂等键+CAS+有序日志(outbox)；不变量：AI/支付不直接改权益，commerce 校验后落账。

| TC | 层 | 断言 |
|---|---|---|
| TC-PAY-02-main | 集成 | 通知 → fulfilled、权益+N |
| TC-PAY-02-dup | 集成 | 同交易号重复回调 → 权益仅发一次 |
| **TC-PAY-02-resume** | 集成(Testcontainers) | 履约消费者崩溃后 outbox 重投 → 最终 fulfilled（验证跨服务可重入，非单事务回滚） |
| TC-PAY-02-forge | 集成 | 伪造/金额不符通知 → 拒绝、不入账 |

## UC-PAY-03 · 单订单状态查询与补发
**覆盖类**：正常 · 异常 · 逃逸
- **主流程**：用户/客服按订单查状态；paid 但未 fulfilled 的可手动触发**幂等补发**（复用 PAY-02 outbox 重投）。日终批量对账见 PAY-10。
- **后置**：fulfilled。**验收**：补发幂等，不重复发权益。
- **关联**：原语 幂等键+outbox。

| TC | 层 | 断言 |
|---|---|---|
| TC-PAY-03-refulfill | 集成 | paid 未履约 → 补发后 fulfilled，仅一次权益 |

## UC-PAY-04 · 退款与权益回收
**覆盖类**：正常 · 异常 · 复杂 · 高并发 · 刁钻
- **主流程**：1) 退款发起 `paid/fulfilled→refunding` 2) 渠道退款成功 → 权益回收 CAS（按 ENT-10 回收对应 paid 桶）→ `refunding→refunded`。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| A1 | 正常 | 退款+回收 | refunding→refunded + 桶回收 CAS | refunded |
| E4 | 异常 | 已消费部分权益后退款 | 回收至下限（不为负），差额按策略 | 一致非负 |
| 并发 | 高并发 | 退款回收 与 用户正消费 竞态 | 桶 CAS：仅一方成功 | 不超扣/超回收 |
| Z1 | 刁钻 | 重复退款请求 | 退款单号幂等键 | 仅退一次 |
| 复杂 | 复杂 | 跨聚合（支付↔权益） | outbox 重投可重入 | 最终一致 |

- **后置**：order=refunded；写 ledger+payment_event。**验收**：退款 → 对应 paid 桶回收（trial 不动）；重复退款 → 仅一次；回收不致负余额。
- **关联**：状态机 PaymentOrder；原语 幂等键+CAS+outbox；与 ENT-10 协同。

| TC | 层 | 断言 |
|---|---|---|
| TC-PAY-04-main | 集成 | 退款 → refunded、paid 桶回收 |
| TC-PAY-04-dup | 集成 | 重复退款 → 仅一次 |
| TC-PAY-04-race | 集成(Testcontainers) | 回收 vs 消费并发 → 余额非负、不超扣 |

## UC-PAY-05 · 服务端权威定价（金额篡改对抗见 PAY-09）
**覆盖类**：正常 · 异常 · 刁钻
- **主流程**：价格与套餐只信服务端目录；下单/履约均以服务端价为准。**验收**：客户端传入价格被忽略。详细对抗在 PAY-09。
- **关联**：原语 CAS（金额复核）。

| TC | 层 | 断言 |
|---|---|---|
| TC-PAY-05-server-price | 契约+集成 | 客户端传价被服务端覆盖 |

## UC-PAY-06 · 支付风控（确定性阈值判定）
**覆盖类**：异常 · 逃逸 · 刁钻
- **主流程**：给定特征向量 → 确定性判定（放行/挑战/拒绝）；命中拒绝→不下单或转人工。
- **验收**（可测）：给定特征向量 fixture → 确定性放行/拒绝（可证伪），非模糊评分。
- **关联**：原语 CAS。**开放裁决：风控阈值标定。**

| TC | 层 | 断言 |
|---|---|---|
| TC-PAY-06-threshold | 集成 | fixture 越阈 → 拒绝；未越阈 → 放行 |

## UC-PAY-07 · 未成年人充值退款 + 14–18 限制行为能力门禁（新增，强合规·高优先级）
**覆盖类**：异常 · 特殊 · 逃逸 · 复杂 · 刁钻
- **前置**：年龄来源由 CONSENT-10 提供；未成年标记来自 CONSENT-05。
- **主流程**：1) **下单门禁**：limited_capacity(14–18) 大额/超频充值 → 拦截或要求监护人确认；<14 → 充值能力关闭 2) **事后退款通道**：未成年大额充值申请退款（民法典/PIPL）→ 走核验+退款 saga（PAY-04 机制）。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| E3 | 异常 | <14 尝试充值 | CONSENT-05 门禁 → 充值 API 403 | 不下单 |
| S1 | 特殊 | 14–18 大额 | 门禁：超额需监护确认/拦截 | 受限 |
| 逃逸 | 逃逸 | 已发生未成年充值 | 退款通道（核验→refunding→refunded+回收） | 可退 |
| 复杂 | 复杂 | 退款 saga 跨聚合 | outbox 重投 + ENT-10 回收 | 一致 |
| Z1 | 刁钻 | 谎报成年绕门禁 | 以 CONSENT-10 权威来源 + 大额实名复核 | 不被绕 |

- **后置**：order=refunded / 拦截；写 payment_audit(minor)。**验收**：<14 充值 API → 403；未成年退款申请 → 走退款 saga 至 refunded + 权益回收。
- **关联**：状态机 PaymentOrder；原语 CAS+幂等键+outbox；安全：未成年保护；依赖 CONSENT-05/10。**开放裁决：退款金额比例/举证标准。**

| TC | 层 | 断言 |
|---|---|---|
| TC-PAY-07-gate | 集成 | <14 充值 → 403；14–18 大额需监护确认 |
| TC-PAY-07-refund | 集成 | 未成年退款申请 → refunded + 桶回收 |

## UC-PAY-08 · 同订单两次真实扣款的识别与退一笔（新增）
**覆盖类**：异常 · 高并发 · 复杂 · 刁钻
- **目的**：区别于「同交易号重复回调」（PAY-02）。此处是**两个不同交易号、同一 clientOrderToken 都真实付款**（用户在两渠道/重试各付一次）。
- **主流程**：1) 同 clientOrderToken 仅一个 payment_order 履约一次（幂等键保证只发一次权益） 2) 检测到同 token 关联到第二个**真实成功**的渠道交易号 → 识别为重复真实扣款 → 自动发起对第二笔的退款（PAY-04 saga）。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| E1 | 复杂 | 同 token 两笔真实付款 | clientOrderToken 幂等：权益仅发一次；第二笔真实交易 → 标记 duplicate_paid → 退一笔 | 仅一次权益、退一笔 |
| 并发 | 高并发 | 两笔通知几乎同时到 | order 履约 CAS：仅一笔 fulfilled，另一笔判重→退款 | 不双发权益 |
| Z1 | 刁钻 | 用重复付款套双倍权益 | 幂等键阻断双发 | 不被套利 |
| 复杂 | 复杂 | 退第二笔跨聚合 | outbox 重投退款 | 一致 |

- **后置**：一个 order fulfilled，第二笔 refunded；写 payment_event+ledger。**验收**：同 token 两笔真实付款 → 权益仅发一次且第二笔被退（区别于重复回调）。
- **关联**：原语 幂等键+CAS+outbox。

| TC | 层 | 断言 |
|---|---|---|
| TC-PAY-08-dup-pay | 集成(Testcontainers) | 同 token 两不同交易号都成功 → 权益+N(一次)，第二笔 refunded |

## UC-PAY-09 · 金额/价格篡改对抗（新增，显式刁钻）
**覆盖类**：刁钻 · 异常 · 高并发
- **主流程**：下单与履约金额一律以服务端目录重算；篡改请求体金额/套餐 → 服务端复核失败 → 拒绝或以权威价为准。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| Z1 | 刁钻 | 改请求体价格 | 服务端权威定价覆盖 + 金额复核 CAS | 以服务端价处理/拒绝 |
| Z2 | 刁钻 | 回调金额与订单不符 | created→paid 守卫金额复核 → 不入账+告警 | 拦截 |
| 并发 | 高并发 | 篡改+重放 | 幂等键 + 金额守卫 | 双重拦截 |

- **后置**：篡改被拒；写 security_audit(price_tamper)。**验收**：请求体改价 → 实际成交=服务端价或拒绝；回调金额不符 → 不入账+告警。
- **关联**：原语 CAS（金额复核）+幂等键；安全：客户端输入不可信。

| TC | 层 | 断言 |
|---|---|---|
| TC-PAY-09-body | 契约+集成 | 改价下单 → 成交价=服务端价 |
| TC-PAY-09-callback | 集成 | 回调金额不符 → 不入账、告警 |

## UC-PAY-10 · 日终三方对账 job（新增，资金真相·高优先级）
**覆盖类**：复杂 · 异常 · 逃逸 · 高并发 · 刁钻
- **目的**：渠道账单 ↔ `payment_order` ↔ `entitlement_grant/ledger` 三方核对、差异检测与补偿。
- **主流程**：1) 拉渠道日终账单 2) 三方逐单核对：渠道已付 vs order 状态 vs 权益已发 3) 分类差异：①渠道付了但 order 未 paid → 补 paid+履约；②order fulfilled 但权益缺 → 补发（幂等）；③权益发了但渠道无付款 → 告警+回收/挂查；④金额不符 → 告警 4) 生成对账报告 + 差异工单。

| flow | 类 | 场景 | 机制 | 后置 |
|---|---|---|---|---|
| 复杂 | 复杂 | 三方逐单核对 | RLS(带 principal 的批 job) + 幂等补偿 | 报告+工单 |
| E4 | 异常 | 漏履约差异 | 触发幂等补发（PAY-02 outbox） | 补齐 |
| 逃逸 | 逃逸 | 权益多发/无付款 | 告警 + 挂查/回收，不静默 | 受控 |
| 并发 | 高并发 | 对账 与 实时履约 并发 | 以 DB 真相为准 + CAS，避免双补 | 不重复补 |
| Z1 | 刁钻 | 渠道账单时区/时钟漂移 | 以对账日切口径+服务端时间对齐 | 不漏不重 |

- **后置**：写 reconciliation_report + reconciliation_diff(工单)；补偿落 payment_event/ledger。**验收**：注入四类差异 fixture → job 全部检出并按类补偿/告警；补偿幂等不重复。
- **关联**：原语 RLS+幂等键+CAS+有序日志（全四条）；与 PAY-02/03/04 补偿协同。**开放裁决：差异阈值与人工工单 SLA。**

| TC | 层 | 断言 |
|---|---|---|
| TC-PAY-10-detect | 集成 | 注入四类差异 → 全部检出、分类正确 |
| TC-PAY-10-compensate | 集成(Testcontainers) | 漏履约差异 → 幂等补发至 fulfilled，不重复 |
| TC-PAY-10-alert | 集成 | 权益多发/无付款 → 生成告警工单 |

---

## 附 A · 七类覆盖总账（域级，确保无偏科）
| 类别 | 代表用例 |
|---|---|
| 正常 | AUTH-01/02/05/07, ONB-01, CONSENT-01, ACCT-01, ENT-01/02/03, PAY-01/02 |
| 异常(失败回滚/退款) | AUTH-04/06/08, ENT-02/07/09, PAY-01-2a/02/04/07/08 |
| 特殊(边界/空/首次/i18n) | ONB-01(i18n), CONSENT-04/09/10, ENT-03(首次), ENT-04 |
| 逃逸(降级/kill-switch/人工/安全终止) | AUTH-09, CONSENT-03/06/08, ACCT-02/03/05, ENT-06/07/08, PAY-03/10 |
| 高并发(双击/并发resume/CAS/租约) | AUTH-02-race/03, ACCT-02-race/05-race, ENT-02/04/06/07, PAY-02/04/08 |
| 复杂(saga/跨聚合/长会话/部分失败) | ACCT-02/06, ENT-05/06/09, PAY-02/08/10 |
| 刁钻(注入/越狱/刷分/泄题/PII/时钟/3天resume/对抗) | AUTH-03/08(3天resume), CONSENT-02-bypass/05/08(套提示词)/09, ENT-03(刷trial)/07(时钟)/09(白嫖), PAY-08/09(篡改)/10(时区) |

## 附 B · 收口的评审硬漏洞 ✓
- 逃逸偏科：补 ACCT-05(用户自助)、ENT-08(能力 kill-switch in-flight)、CONSENT-06(撤回 base)。
- 复杂缺对账：补 PAY-10 独立日终三方对账 job。
- 刁钻金额：补 PAY-08(两次真实扣款)、PAY-09(改价对抗)。
- 状态机悬空：AUTH-08(CONFIRMED→EXPIRED/重入)、AUTH-06(CONFIRMED→CANCELLED)、AUTH-07(用户取消→CANCELLED)、ENT-07(孤儿 reaper)、CONSENT-06(ACTIVE→RESTRICTED)。
- 「同事务」纠偏：PAY-02 明确跨聚合 outbox + 可重入，非单 DB 事务。
- 不可测收敛：AUTH-03(sid CAS + 403/0 token)、CONSENT-05(集成门禁)、ENT-05(已提交序列回放==缓存)、PAY-06/ACCT-03(确定性阈值)。
- 业务缺口：PAY-07(未成年退款+14–18)、CONSENT-07/08/09(PIPL 45/24/38)、ACCT-06(删除 vs 留存)、ONB-01(B 端出 scope + tenantType 不可逆 TC)、ENT-09/10(部分计费/优先级)、ACCT-04(unionid 漂移)。
- 补测试：AUTH-01-4a、PAY-01-2a、ACCT-02 恢复、CONSENT-05 升集成、ONB-01 tenant 不可逆、race 类显式 Testcontainers。