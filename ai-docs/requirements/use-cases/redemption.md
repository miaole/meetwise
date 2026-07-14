---
id: requirements_uc_redeem
name: 用例 · 兑换码/兑换服务（批次·校验·一次性·有效期·绑定·防刷·权益衔接）
description: 兑换域业务用例与测试用例（正常/异常/特殊/逃逸/并发/复杂/刁钻七类）。评审收口·终版：在前稿基础上补齐共享多次码全局名额计数器、批次预算上限、validFrom 生效下界、跨批次叠加/互斥、码明文受控导出（明文不落日志）、输入规范化纯函数、充值侧退款冲正、码泄露应急 kill-switch、账本 append-only DB 强制+哈希链、能力位 tier=max 不降级、幂等真相键投毒防护、reserve-then-abandon DoS。41 UC / 99 TC。
type: reference
scope: shared
level: spec
status: active
owner: product
related:
  - ./README.md
  - ./commerce.md
  - ../use-case-conventions.md
  - ../../rules/global/production-invariants.md
  - ../../rules/global/status-machine.md
  - ../../testing/conventions/test-authoring.md
---

# Redemption 兑换域 · 最终用例与测试用例文档（评审收口·终版）

> 顺序铁律：用例 → 契约 → 状态机 → 测试 → 代码。本文为二轮对抗评审后定稿，在前稿（已修复侧信道恒定时间、reservation TTL、clawback 冲正、preview 同源、风控契约化、SoD、批次 EXHAUSTED/EXPIRED、对账分布式锁、RLS 越权）基础上，进一步收口本轮评审五问的实质洞：
> - **①七类某类在关键场景缺实例**：补「共享多次码（一码 N 用）」整条正常主路径（015）、`validFrom` 生效下界特殊用例（014）、跨批次叠加/互斥复杂用例（017）。
> - **②有结论无机制（最致命）**：「明文不落日志」从裸结论升级为受控导出 UC + 可测断言（007）；「append-only 永不物理删」从文字承诺焊死到 DB 撤权 + 触发器 + 哈希链（084）；幂等定义为服务端业务真相键 `(principal, code_hash)` 并防投毒（025）。
> - **③不可测**：007/084 全部落成可执行 security 集成断言（日志 grep=0、UPDATE/DELETE 被拒、哈希链断裂检出、一次性链接 TTL 注入时钟）。
> - **④业务漏场景**：共享码全局名额计数器（015）、reserve-then-abandon 锁名额 DoS（026）、批次预算超发（018）、充值侧退款/chargeback 独立冲正（054）、码泄露应急 kill-switch+幂等重发（062）、能力位 tier=max 防降级（091）、输入规范化纯函数（044）。
> - **⑤单一码模型不足**：「一码一用」单一模型扩展为「单码 CAS 模型 + 共享码全局计数器模型」双模型并存（码 type 决定收口路径，互斥选择，互不打架）。
>
> **量纲铁律**：权益以**整数 units** 计（积分/套餐天/能力位授权天），禁浮点。所有改状态路径必须落在四承重原语之一（CAS / 幂等键 / RLS / 持久有序事件日志），AI 不参与本域（纯交易/权益域，无模型出口）。

---

## 0. 全局口径

### 0.0 七类 case 图例
标签：`[正常] [异常] [特殊] [逃逸] [并发] [复杂] [刁钻]`。每条 UC 标题行声明覆盖类，单 UC 可多归类。**缺类即不合格**：本域每条钱/状态/隔离相关 UC 至少含「异常 + 并发 + 刁钻」三类之一组合。

### 0.1 状态机增补（作为 `rules/global/status-machine.md` 的 delta，签字项见 openDecisions）

**RedeemBatch（批次，治理对象，含 SoD、版本化、预算上限）** 枚举：
`draft · pending_approval · active · paused · exhausted · expired · revoked`

| from | to | 触发 | 守卫（机制） | 失败动作 |
|---|---|---|---|---|
| draft | pending_approval | 生成者提交审批 | 生成者 principal 入审计；批量量级 > `batchApprovalThreshold` 必须走审批位 | — |
| pending_approval | active | 审批者批准 | **SoD：审批者 principal ≠ 生成者 principal**（DB CHECK + 业务校验）；批准瞬间**冻结 specVersion 快照**；初始化 `consumed_units=0`（预算）与 `redeemed_total=0`（共享码名额） | — |
| pending_approval | draft | 驳回 | 审批者角色 RLS | — |
| active | paused | 风控命中 / 运营 kill-switch / 对账不平 / **预算耗尽（018）/ 泄露应急（062）** | 操作者运营角色（RLS）；CAS | — |
| paused | active | 复核通过 | 不平已勾平且留痕 | 拒绝 → 维持 paused |
| active | exhausted | **末码兑换 / 共享码名额满 / 预算耗尽** 后剩余归零（自动） | CAS `remaining=0 AND status=active` 或 `redeemed_total=maxRedeemTotal` 或 `consumed_units=budgetUnits`，由兑换事务派生 | — |
| active·paused | expired | 批次 `validUntil` 到期（定时，**可注入时钟**） | CAS `now()≥validUntil`（注入时钟，非裸 `now()`） | — |
| active·paused | revoked | 运营吊销（欺诈/合规/泄露） | **双签**（两名运营 principal，SoD）；未发放码批量 VOID | — |

- 区分**批次级 EXPIRED**（治理终态，停止一切兑换）与**码级惰性过期/未生效**（见 RedeemCode，单码 `validFrom/validUntil` 在兑换瞬间惰性双侧判定，不改批次态）。
- `specVersion`：批次每次改 spec（draft 期可改；active 后改 spec → 见 UC-REDEEM-006 强制版本号自增），码在生成时**绑定 specVersion**，发放按**码所属 specVersion**，不按批次当前版本。

**RedeemCode（兑换码）** 枚举：`unused · reserved · used · void`

> **双收口模型（评审⑤：单一「一码一用」模型升级）**：码 `type ∈ {single, shared}`。
> - `single`（一码一用，默认）：走下表单码 `unused→reserved` CAS，是其唯一并发收口点。
> - `shared`（一码 N 用，营销 WELCOME 类）：码本身**无 used 终态翻转**，并发收口走批次/码级**全局名额计数器行 CAS** `redeemed_total < maxRedeemTotal`（UC-015）+ `unique(code_id, principal)` per-user 去重。
> - 两模型**互斥选择、并存不打架**：服务按码 type 路由到对应收口路径；single 不读 redeemed_total 计数器，shared 不做单码 status CAS。

| from | to | 触发 | 守卫（机制） | 失败动作 |
|---|---|---|---|---|
| unused | reserved | 兑换发起占用（**single 型**） | **CAS `unused→reserved WHERE status=unused AND version=$v`**；同事务校验：批次 active、`validFrom≤now<validUntil`（UC-014 注入时钟）、per-user 配额未超（UC-016 计数器 CAS）、批次预算未超（UC-018）、principal 限流通过 | 0 行 = 输竞争/已变态/未生效/已过期 → 回查归因 |
| reserved | used | 权益发放成功 confirm | reservation 仍有效（未超 TTL）；entitlement_ledger credit 全部成功（异构 spec 原子，UC-070） | — |
| reserved | unused | 发放失败 release **或 reservation TTL 超时回收**（UC-023） | reaper CAS `reserved→unused WHERE status=reserved AND reserved_at<now()-TTL`（注入时钟）；释放 per-user 计数器与（共享码）名额计数器 | — |
| unused | void | 批次 revoked/欺诈/泄露下线 | 仅未发放码；批次 revoked 守卫 | — |
| used | （无后继态）| 事后欺诈/盗刷/chargeback | **码态保持 used，权益侧走 entitlement_ledger 负向冲正 clawback**（UC-053/054），不回退码态——保留一次性与审计真相 | — |

> **一次性铁律（single 型）**：`unused→reserved` 的 CAS 是唯一并发收口点。同码并发只有一个 reserve 成功，其余读 0 行，归因为「已被占用」（统一错误码，不泄露细节，见 UC-031）。
> **名额铁律（shared 型）**：`redeemed_total<maxRedeemTotal` 的计数器行 CAS 是唯一并发收口点，恰 `maxRedeemTotal` 个成功，超出读 0 行，统一错误码「已售罄」，不泄露剩余名额细节。

**绑定（BIND_ON_FIRST_USE）**：single 码首次兑换成功（`reserved→used`）瞬间将码 `bound_principal` 写为兑换者；shared 码以 `unique(code_id, principal)` 行表达「此人已领」。二次出示（极端：用户注销前的同码重放）因码已 `used`/已有 unique 行直接拒。绑定解除/注销见 UC-REDEEM-082。

### 0.2 数值口径与机制常量（定稿，可调项见 openDecisions）

- **码空间高熵**：码体 = 128-bit CSPRNG 随机 → Crockford base32（26 字符有效载荷）+ **2 字符 checksum**。
  - **checksum 定位（评审修正）**：checksum 仅用于**防误输/降库压**（过滤格式非法请求、减少打到 DB 的无效查询压力），**不计入撞库安全预算**。算法公开，对脚本攻击熵削减≈0。撞库实质防御 = L1 限流 + L3 退避封禁 + 128-bit 高熵（暴力命中期望 ≈ 2^127 次尝试，限流下不可行）。
  - **输入规范化（UC-044，新增）**：lookup/hash 前经**确定性规范化纯函数**：NFKC 归一 → 去分隔符/空白 → 大写 → Crockford 映射（`O→0`、`I/L→1`）→ 白名单字符校验。纯函数无副作用、可单测，使「合法用户误输」被接受、「多书写形式探测」收敛为同一 hash（同一限流/恒定时间桶），杜绝存在性探测旁路。
- **时间窗（评审①特殊补：双侧）**：码/批次 `validFrom`（默认 null=立即生效）与 `validUntil`，reserve CAS 内联 `validFrom≤clock.now()<validUntil`。`validFrom` 在未来 = 预热/未生效码，提前兑换 0 行拒（UC-014）。
- **reservation TTL** = `reservationTtlSec`（默认 600s/10min）。reaper 扫描周期 = `reservationReaperSec`（默认 60s）。
- **共享码名额（UC-015，新增）**：`maxRedeemTotal=T`（全局名额，shared 型必填），`maxRedeemPerUser`（默认 1）。
- **批次预算（UC-018，新增）**：`budgetUnits=B`（财务额度上界，整数 units），`consumed_units` 计数器 CAS `consumed_units+grant≤B`，异构 spec 折算同一 units 量纲入预算（折算表见 openDecisions）。
- **占位防护（UC-026，新增）**：`maxInflightReservePerUser`（默认 3）限制单 principal 未确认 reserve 数，防 reserve-then-abandon 锁名额 DoS。
- **明文受控导出（UC-007，新增）**：`exportLinkTtlSec`（默认 300s）一次性下载链接 TTL；码明文**绝不**落 app 日志/trace/审计正文/DB 明文列（DB 仅存 hash + 密文/HSM 派生）。
- **per-user 配额** = 批次 `maxRedeemPerUser`（默认 1）。single 型并发收口靠 `unique(batch_id, bound_principal, slot)` + 独立计数器 CAS（UC-016）；shared 型靠 `unique(code_id, principal)` + 名额计数器（UC-015）。
- **隔离级别（全域声明，评审必补）**：码 reserve、名额/预算/配额计数器、权益记账走 `SERIALIZABLE`（或 `SELECT … FOR UPDATE` 行锁）；只读 preview/status 走 `READ COMMITTED`。序列化冲突 `40001`/死锁 `40P01` → 有界抖动退避（3 次，20–150ms jitter），超界失败上抛。
- **可注入时钟（全域声明）**：所有 TTL、`validFrom`、`validUntil`、退避滑窗判定走可注入 `Clock` 抽象（测试注入固定时刻），禁裸 `now()`，使临界用例可确定性断言；**客户端时间无信任**（UC-014 防改本地时钟提前兑）。
- **恒定时间响应封装**（UC-031）：所有兑换/preview 结果（成功/已用/无效/未生效/过期/超配额/已售罄/限流/封禁）经**统一响应封装**走**同一 handler 代码路径**，对外**统一错误码 `REDEEM_REJECTED` + 统一 schema**（成功额外带受理凭据），不区分 used/invalid/未生效/存在性；服务端按 `redeemMinLatencyMs`（默认 120ms）floor **异步填充延迟**至下限。
- **风控契约化**（UC-032，评审必补，替代「黑盒评分」）：信号、阈值、动作矩阵全部契约常量化、写可观测账本，测试用确定性夹具断言：
  - 信号：`ipAttemptRate`、`principalAttemptRate`、`failRatio`（无效码占比）、`reserveAbandonRate`（占而不付率，接 026）、`batchHitSkew`（同批命中分布偏度）、`deviceClusterSize`（设备指纹聚集）。
  - 阈值（契约常量）：`failRatio>0.8 within 1min` / `ipAttemptRate>R1` / `deviceClusterSize>K` / `reserveAbandonRate>A1` 等。
  - 动作矩阵：`observe → challenge(step-up 二次验证) → batch PAUSE → principal 封禁`，每级动作落 `risk_action_ledger`，**确定性可断言**。
- **服务端为定价/spec 唯一真相源**（UC-083）：客户端**只传码 + 幂等键 + locale**，绝不传可信金额/spec/units；服务端按码所属 specVersion 计算发放，篡改字段一律忽略并记安全事件。**业务幂等真相键 = `(principal, code_hash)`**（服务端派生），客户端 idempotencyKey 仅作请求去重辅助、不作发放真相（UC-025 防键投毒）。

### 0.3 账本（三账本，append-only DB 强制，不可丢、不可改）

| 账本 | 写入时机 | 关键列 |
|---|---|---|
| `entitlement_ledger` | credit（发放）/ clawback（负向冲正） | `account_id, entry_type∈{credit,clawback}, spec_type∈{points,duration,capability}, units(可负), source∈{redeem,paid}, source_code_id, order_id(可空), refund_id(可空), spec_version, idempotency_key, prev_hash, row_hash, created_at` |
| `redeem_audit_ledger` | 每次 reserve/confirm/release/void/preview/export/拒绝 | `code_id(可空,preview/export 不泄露存在性时记 hash,绝不记明文), action, reject_reason(内部细分,对外不暴露), principal, ip_hash, ts` |
| `risk_action_ledger` | 风控每级动作 | `subject(principal/ip/batch), signal_snapshot, threshold_hit, action, ts` |
| `domain_events`（outbox，单调 eventSeq） | 批次/码终态迁移 | `batch_exhausted / batch_expired / batch_paused / batch_revoked / code_redeemed / shared_code_exhausted / code_clawback / code_exported / leak_response` |

**append-only DB 强制（UC-084，评审②裸结论→机制）**：`entitlement_ledger` 对应用角色**仅授 INSERT/SELECT，撤销 UPDATE/DELETE**；BEFORE UPDATE/DELETE 触发器 RAISE 拒绝；行 `row_hash=H(prev_hash||payload)` 哈希链（per-account 分段）使删行/改行可检出；CI 迁移校验断言授权与触发器存在。**clawback 是新增负向 INSERT，非 UPDATE/DELETE**，撤权不卡冲正写入。

**勾稽恒等式**：`EntitlementAccount.balance + reserved == Σcredit.units − Σclawback.units − Σconfirm_debit.units`（与 commerce 账户共享，量纲一致；clawback 为负向冲正，append-only 永不物理删流水——由 DB 权限+触发器+哈希链强制，非文字承诺）。

### 0.4 测试基础设施补丁（评审④⑤必补，全域生效）
- 并发类 TC 一律 Testcontainers 真 Postgres，**显式声明事务隔离级别**（reserve/名额/预算/记账 SERIALIZABLE）；断言「恰一个成功 + 其余 0 行回查」，不写「最后写赢」。
- 时序/临界类 TC **注入固定时钟**，断言**代码路径同一 / 配置常量值**，**禁止统计耗时断言**（评审③：CI 噪声下 flaky = 假验收）。
- 属性测试**固定 seed + 崩溃点枚举边界**（reserve 后崩、credit 部分成功后崩、reaper 与 confirm 交错、名额计数器 +1 后崩、预算扣减后崩），可复现。
- 对账/reaper 类 TC 起**双实例**断言分布式锁下终态一次。
- 隐私/不可篡改类 TC（007/084）一律 **security 层**：日志/trace grep 明文断言、DB UPDATE/DELETE 被拒断言、哈希链断裂检出断言、一次性链接注入时钟失效断言。

---

## 1. 批次生命周期与治理（B 端/运营，SoD）

### UC-REDEEM-001 · 生成兑换码批次（草稿 + 审批位）`[正常][特殊][刁钻]`
- **角色**：运营/企业管理员（生成者）　**前置**：具批次创建角色（RLS）。**触发**：提交批次（spec、数量、code type、validFrom、validUntil、maxRedeemPerUser、maxRedeemTotal、budgetUnits、租户归属）。
- **主流程**：1) RLS principal 入上下文 2) 服务端校验 spec（spec_type 合法、units≥0、能力位授权天有界、type=shared 必含 maxRedeemTotal、budgetUnits≥Σ潜在发放）3) **服务端**生成高熵码体（128-bit CSPRNG，UC-083 客户端不传码值）4) 批次 `draft`，码批量 `unused`（shared 型仅生成少量码 + 计数器），绑定 `specVersion=1`，初始化 `consumed_units=0`/`redeemed_total=0` 5) 量级 > `batchApprovalThreshold` → 必须 `draft→pending_approval` 6) 返回批次号 + 量级（**不返回码明文**，明文仅经 UC-007 一次性导出受控通道）。
- **备选 A1**：小批量（≤阈值）且角色具自审权 → 允许直接 `pending_approval`（仍需 UC-002 审批）。
- **异常 E3 越权**：跨租户为他租户建批 → RLS 0 行 → 拒。
- **特殊（i18n/空/首次）**：spec 文案多语言不影响 units 快照值；数量=0 / shared 型 maxRedeemTotal=0 拒；首批生成初始化账户绑定关系。
- **刁钻（注入/越权字段）**：请求体夹带 `units`/`specVersion`/`code`/`redeemed_total` 等服务端真相字段 → 一律忽略并记安全事件（UC-083）。
- **后置**：`RedeemBatch=draft|pending_approval`；写 `redeem_audit_ledger(batch_created)`。
- **验收**：码体熵 ≥128bit 且服务端生成；同请求重复提交（幂等键）不产双批；越权建批 0 行；明文绝不出现在创建响应。
- **关联**：契约 `POST /admin/redeem/batches`；状态机 RedeemBatch；原语 幂等键+RLS；安全：服务端真相源、明文不外泄。
- **TC**：
  - `TC-REDEEM-001-entropy`（单元）：断言码体由 CSPRNG 生成、长度/字符集正确、checksum 可校验且**不参与安全预算**（注释明确）。
  - `TC-REDEEM-001-idem`（集成）：同幂等键提交 2 次 → 仅一批、码数不翻倍。
  - `TC-REDEEM-001-rls`（集成）：租户 B 管理员为租户 A 建批 → 0 行/403。
  - `TC-REDEEM-001-inject`（集成）：请求夹带 `units=99999`/`redeemed_total=-1` → 落库为服务端值，记安全事件。

### UC-REDEEM-002 · 批次审批激活（SoD）`[正常][异常][刁钻]`
- **角色**：审批者　**前置**：批次 `pending_approval`。**触发**：审批通过。
- **主流程**：1) **SoD 守卫：审批者 principal ≠ 生成者 principal**（DB CHECK + 业务校验）2) CAS `pending_approval→active` 3) **冻结 specVersion 快照**（此后码发放按此版本）+ 初始化 `consumed_units=0`/`redeemed_total=0` 4) 派生 `domain_event(batch_activated)`。
- **异常 E2 并发审批**：双审批者并发 → CAS 恰一个赢，另一个 0 行。
- **刁钻（自审批越权）**：生成者本人尝试审批自己批次 → SoD CHECK 拒，记 `risk_action_ledger`。
- **后置**：`active`；specVersion 冻结。
- **验收**：自审批被拒；激活后 specVersion 不可隐式变更（变更走 UC-006 显式版本号）。
- **关联**：契约 `POST /admin/redeem/batches/:id/approve`；状态机 RedeemBatch；原语 CAS+RLS；规则 SoD。
- **TC**：
  - `TC-REDEEM-002-sod`（集成）：生成者=审批者 → DB CHECK 违例/拒，断言 `risk_action_ledger` 留痕。
  - `TC-REDEEM-002-race`（集成,SERIALIZABLE）：双审批并发 → 恰一态 active，另一 0 行。

### UC-REDEEM-003 · 批次吊销（双签 + 未发放码 VOID）`[异常][复杂][刁钻]`
- **角色**：两名运营　**前置**：批次 `active|paused`，疑欺诈/合规下线。**触发**：吊销申请 + 第二人复核。
- **主流程**：1) **双签**（principal1≠principal2，均具吊销角色）2) CAS `→revoked` 3) 批量 CAS `unused→void`（仅未发放码）4) **已发放（used）码不回退**，欺诈追回走 UC-053 clawback 5) 派生 `domain_event(batch_revoked)`。
- **异常 E4 部分失败**：批量 VOID 中途崩 → 幂等重放（按 code_id 唯一）继续，已 VOID 不重复。
- **复杂（跨码批量 + 已发放分流）**：unused→void 与 used→clawback 两条链分别处理，saga 各自幂等。
- **刁钻（单签绕过）**：仅一人尝试吊销大批 → 拒，要求第二签。
- **后置**：批次 `revoked`，未发放码 `void`，已发放码触发 clawback 评估。
- **验收**：单签不可吊销；VOID 幂等；used 码不被错误回退。
- **关联**：契约 `POST /admin/redeem/batches/:id/revoke`；状态机 RedeemBatch+RedeemCode；原语 CAS+幂等键；规则 SoD。
- **TC**：
  - `TC-REDEEM-003-dualsign`（集成）：单签 → 拒；双签且 P1≠P2 → 成功。
  - `TC-REDEEM-003-voidonce`（集成,崩溃点枚举）：VOID 批量中途崩重放 → 每码恰一次 void，无重复。
  - `TC-REDEEM-003-usedkept`（集成）：含 used 码批次吊销 → used 码态不变、进入 clawback 评估队列。

### UC-REDEEM-004 · 批次 EXHAUSTED / EXPIRED 自动迁移 `[正常][特殊][并发]`
- **角色**：系统（兑换事务派生 / 定时）　**触发**：末码兑换成功 / 共享码名额满 / 预算耗尽 / 批次 `validUntil` 到期。
- **主流程（EXHAUSTED）**：兑换事务内 `reserved→used`（single）或名额计数器 +1（shared）后，CAS `remaining=remaining-1` / `redeemed_total++` / `consumed_units+=grant`；当 `remaining=0` ∨ `redeemed_total=maxRedeemTotal` ∨ `consumed_units=budgetUnits` 同事务 CAS `active→exhausted`。
- **主流程（EXPIRED）**：定时任务（**注入时钟**）扫 `now()≥validUntil` 的 active/paused 批 → CAS `→expired`，停止后续兑换。
- **特殊（边界）**：`remaining=1`/`redeemed_total=T-1` 末名额并发两请求 → CAS 仅一成功，恰到 0/T，exhausted 恰迁一次。
- **并发 E2**：末名额兑换与 expired 定时并发 → 二者皆 CAS，终态唯一（exhausted 或 expired 取决于谁先，账实一致）。
- **后置**：`exhausted`/`expired`；派生 `domain_event(batch_exhausted|batch_expired)`。
- **验收**：末名额后批次恰转 exhausted 一次；到期批不可再兑（码级请求被 expired 守卫拒）；时钟注入下临界（validUntil 前 1ms 可兑 / 后 1ms 拒）确定。
- **关联**：状态机 RedeemBatch；原语 CAS+事件日志；可注入时钟。
- **TC**：
  - `TC-REDEEM-004-exhaust`（集成,SERIALIZABLE）：remaining=1 并发两兑 → 一成一拒、batch=exhausted 恰一次、remaining=0。
  - `TC-REDEEM-004-expire`（集成,注入时钟）：注入 validUntil±1ms → 前可兑、后拒；批 →expired。
  - `TC-REDEEM-004-bothrace`（集成）：末名额兑换 vs expired 定时并发 → 终态唯一、无重复事件。

### UC-REDEEM-005 · SoD 职责分离与审批位完整性 `[异常][刁钻]`
- **角色**：运营　**前置**：批次治理操作。**触发**：尝试同人生成+吊销 / 无审批位大批量。
- **主流程**：1) 审计追溯生成者、审批者、吊销者 principal 链 2) 校验三者满足分离矩阵（生成≠审批、吊销双签）3) 大批量（>阈值）无审批位 → 强制拒。
- **异常 E3**：同一管理员既生成又吊销同批 → 拒并 `risk_action_ledger`。
- **刁钻（提权绕过）**：尝试用脚本绕审批位直发大批 → 契约层强制 `pending_approval` 前置，无路径绕过。
- **后置**：违例操作不落地，审计完整。
- **验收**：SoD 矩阵任一违例被拒且留痕；大批量无审批不可激活。
- **关联**：规则 SoD（落 `rules/`）；原语 RLS+事件日志。
- **TC**：
  - `TC-REDEEM-005-matrix`（单元）：SoD 决策矩阵表驱动断言（生成=吊销/生成=审批/单签大批 → 拒）。
  - `TC-REDEEM-005-noapproval`（集成）：量级>阈值直激活 → 拒，状态停 pending_approval。

### UC-REDEEM-006 · ACTIVE 后 spec 变更版本化 `[特殊][复杂][刁钻]`
- **角色**：运营　**前置**：批次 `active`，已有 unused 码。**触发**：修改 spec。
- **主流程**：1) active 后改 spec **不可原地改**，强制 `specVersion+1` 新版本 2) **已生成码保持其绑定的旧 specVersion**，按旧规格发放 3) 新增码（若批次允许追加）绑定新版本 4) 留痕版本 diff。
- **特殊（发放规格一致性）**：用户 reserve 的码按**码绑定的 specVersion**发放，不受后续变更影响。
- **复杂**：同批存在多 specVersion 码并存，发放按码各自版本。
- **刁钻（金额错配攻击）**：运营改高 spec 后期望旧码也按新规格发放套利 → 被「码绑定版本」机制阻断。
- **后置**：批次 spec 多版本并存，码与版本一一绑定。
- **验收**：改 spec 后老码发放 units = 旧版本值；新码 = 新版本值；无串版。
- **关联**：状态机 RedeemBatch(specVersion)；原语 CAS（version）+事件日志。
- **TC**：
  - `TC-REDEEM-006-versionbind`（集成）：active 改 spec v1→v2，旧 unused 码兑换 → 发放按 v1；新码 → v2。
  - `TC-REDEEM-006-noinplace`（单元）：active 态原地改 spec 不升版本 → 拒。

### UC-REDEEM-007 · 码明文受控导出/分发（一次性短 TTL 链接，明文不落日志）`[特殊][逃逸][刁钻]`（评审②③ P0：裸结论→机制）
- **角色**：运营/企业管理员（导出者）　**前置**：批次 `active`，具导出角色（RLS）+ step-up 二次验证。**触发**：请求导出码明文（发放给最终用户/印券/分发渠道）。
- **主流程**：1) 导出角色 RLS + **step-up 强认证**（近期二次验证，否则拒）2) 服务端从密文/HSM 派生明文，生成**一次性短 TTL 下载链接**（`exportLinkTtlSec` 默认 300s、一次性 token、用后即焚）3) 明文**仅经该受控通道流式返回，绝不落 app 日志/trace/审计正文/DB 明文列**（DB 码列为 hash + 密文）4) 写 `redeem_audit_ledger(code_exported)` 记导出者/批次/数量/链接 id，**不含任何明文** 5) 链接消费一次或 TTL 到期即失效。
- **备选 A1**：分批导出 → 每批独立一次性链接，各自 TTL。
- **特殊（边界）**：导出数量=0 拒；链接 TTL 注入时钟可测；重复点击同（已消费）链接 → 失效拒。
- **逃逸**：导出通道依赖（对象存储/HSM）失效 → **决不 fallback 到明文落库/降级日志**，返回可重试受理。
- **刁钻（明文泄露/越权导出/链接重放）**：无 step-up 直接导出 → 拒；抓取 app 日志/trace grep 明文 → 0 命中；重放已消费链接 → 失效；越权导出他批 → RLS 0 行。
- **后置**：无码态变更；写 `redeem_audit_ledger(code_exported, 不含明文)` + `domain_event(code_exported)`。
- **验收**：全量 app 日志/trace/审计正文 grep 码明文 = 0 处；下载链接单次消费后 + TTL 后（注入时钟）均失效；无 step-up 导出被拒；越权导出 0 行。
- **关联**：契约 `POST /admin/redeem/batches/:id/export`；状态机 RedeemCode（无变更）；原语 RLS+事件日志；规则 明文不落日志（隐私硬规则）+ step-up。
- **TC**：
  - `TC-REDEEM-007-noplaintext`（集成,security）：导出后 grep 全量日志/trace/audit 正文 → 0 处明文；DB 码列为 hash/密文。
  - `TC-REDEEM-007-onceonly`（集成,注入时钟）：链接消费一次后再用 → 失效；TTL+1s 后 → 失效；TTL 内首用 → 成功。
  - `TC-REDEEM-007-stepup`（集成,security）：无 step-up/越权角色导出 → 拒并记 risk；越权导出他批 → 0 行。

### UC-REDEEM-018 · 批次预算上限超发防护（budgetUnits CAS）`[异常][并发][复杂]`（评审④.2 P0）
- **角色**：系统/运营　**前置**：批次 `budgetUnits=B`（财务额度上界，整数 units）。**触发**：兑换累计发放逼近预算。
- **主流程**：1) 批次预算计数器行 `consumed_units`，每次 credit 前 CAS `consumed_units+grant≤B → consumed_units+=grant`（SERIALIZABLE）2) 超预算 → 拒该次兑换并（按策略）CAS 批次 `active→paused`（接 061）3) 预算消耗与 entitlement credit **同事务原子** 4) 异构 spec（070）不同 spec_type 按折算表归一为 units 入预算。
- **异常 E**：credit 失败 → `consumed_units` 回滚，预算不被空耗。
- **并发 E2**：预算 B，大量并发异构 grant → 计数器 CAS 串行，`Σgrant≤B` 恒成立，无击穿。
- **复杂**：异构 spec 部分失败整体回滚（接 070），预算与发放一致。
- **逃逸**：预算耗尽 → 批次 paused + 后续兑换走受理/统一拒（不暴露内部预算细节）。
- **后置**：`consumed_units≤B`；超界批次 `paused`/`exhausted`。
- **验收**：预算 B + 并发总额 > B → 落账总额恰 ≤B、超出请求被拒、财务对账有上界；credit 失败预算回补。
- **关联**：状态机 RedeemBatch(paused/exhausted)；原语 预算计数器 CAS+事件日志；隔离 SERIALIZABLE；接 061。
- **TC**：
  - `TC-REDEEM-018-budgetcap`（集成,SERIALIZABLE,固定seed）：B=1000，并发总需求 2000 → 落账 ≤1000、超出拒。
  - `TC-REDEEM-018-pause`（集成）：预算耗尽 → 批次 active→paused、后续兑换受理/拒。
  - `TC-REDEEM-018-rollback`（集成,崩溃点）：credit 失败 → `consumed_units` 回补、零悬挂。

### UC-REDEEM-062 · 码批量泄露应急（kill-switch 批量 VOID + 幂等重发）`[逃逸][复杂][刁钻]`（评审④.4 P1）
- **角色**：两名运营（应急）　**前置**：批次码明文/密钥疑泄露。**触发**：泄露应急。
- **主流程**：1) **kill-switch 双签**（复用 003 双签 CAS）→ 批次 `active→paused/revoked`（即时止血）2) 受影响**未发放码批量 VOID**，已发放（used）走 clawback 评估（053）3) **对合法用户幂等重发新 specVersion 码**（`specVersion+1`，接 006），重发幂等键 = `(原 code_id, reissue_reason)` 防重复发新码 4) 派生 `domain_event(leak_response)` + 通知。
- **复杂（saga）**：VOID + clawback + 重发三链各自幂等，部分失败可重入（接 040/053）。
- **逃逸**：泄露 → kill-switch 即时止血 + 合法用户无损重发，**非一刀切作废伤及合法持有者**。
- **刁钻（泄露窗口抢兑/重发被重放）**：泄露后攻击者抢兑 unused 码 → VOID CAS 与兑换 CAS 竞争（接 050）；重发链幂等防同人多发。
- **后置**：泄露码 `void/revoked`；合法用户持新 specVersion 码；旧码失效。
- **验收**：单签不可触发 kill-switch；批量 VOID 幂等；合法用户恰重发一张新版码（幂等不重复）；泄露后旧码不可兑。
- **关联**：契约 `POST /admin/redeem/batches/:id/leak-response`；状态机 RedeemBatch+RedeemCode；原语 双签 CAS+幂等键+事件日志；接 003/006/040/050/053。
- **TC**：
  - `TC-REDEEM-062-dualkill`（集成）：单签 → 拒；双签（P1≠P2）→ 批次止血、未发放码 VOID。
  - `TC-REDEEM-062-reissueidem`（集成,崩溃点）：重发中途崩重放 → 每合法用户恰一张新 specVersion 码。
  - `TC-REDEEM-062-oldinvalid`（集成）：泄露 VOID 后旧码兑换 → 拒。

---

## 2. 兑换主路径与权益衔接

### UC-REDEEM-010 · 兑换码兑换（reserve→confirm 衔接权益池）`[正常][复杂][并发]`
- **角色**：求职者（C 端）/ 企业成员（B 端）　**前置**：已登录，提交码 + 幂等键（UC-083：不传 units/spec）。**触发**：提交兑换。
- **主流程**：1) RLS principal 入上下文 2) **输入规范化（UC-044）→ L1 限流 + checksum 防误输**（格式非法/限流命中 → 统一拒，UC-031）3) 业务真相键 `(principal, code_hash)` 查 `redeem_audit_ledger`：命中 → 返回首次结果（幂等，UC-021/025）4) 按码 `type` 路由：**single** 走 `unused→reserved` CAS；**shared** 走名额计数器 CAS（UC-015）。**SERIALIZABLE 事务**同事务校验批次 active、`validFrom≤now<validUntil`（UC-014）、per-user 配额（UC-016）、批次预算（UC-018）5) **reserve 权益池**（commerce `EntitlementAccount` reserve→credit 衔接）按码 specVersion 异构 spec 发放（UC-070），能力位走 tier=max 合并（UC-091）6) 全部成功 → CAS `reserved→used`、BIND_ON_FIRST_USE 写 bound_principal、`entitlement_ledger(credit)`、remaining--/redeemed_total++ 7) 派生 `domain_event(code_redeemed)`，统一响应封装返回成功凭据。
- **备选 A1（B 端席位型 spec）**：能力位授予走租户账户而非个人账户（RLS 租户谓词）。
- **异常 E4 发放失败**：任一 spec credit 失败 → 整事务回滚、CAS `reserved→unused`/名额计数器回滚、释放配额计数器、统一错误码（UC-070）。
- **异常 E5 权益池依赖失效**：EntitlementAccount 服务超时 → reserve 不落 used，码留 reserved 待 reaper 回收（UC-023），用户得「受理中」可查（UC-012）。
- **并发 E2**：见 UC-020（single 同码）、UC-015（shared 名额）、UC-016（同批不同码冲配额）。
- **后置**：`code=used`/名额+1，账户 credit；或失败 `code=unused`/名额回滚 无副作用。
- **验收**：一次成功兑换 = 恰一条 credit ledger（真相键去重）+ 码 used/名额+1 + remaining 准确；任一 spec 失败则零副作用、码可再兑。
- **关联**：契约 `POST /redeem`；状态机 RedeemCode+EntitlementAccount；原语 CAS+幂等键+RLS+事件日志；安全：服务端真相源、统一响应。
- **TC**：
  - `TC-REDEEM-010-happy`（集成）：兑换成功 → code=used、credit 一条、remaining--、bound_principal=兑换者。
  - `TC-REDEEM-010-idem`（集成）：同真相键发 2 次 → 一条 credit、第二次返回首次结果。
  - `TC-REDEEM-010-depfail`（集成）：注入权益池超时 → 码留 reserved、无 credit、status 可查受理中。
  - `TC-REDEEM-010-e2e`（e2e）：C 端输入码 → 看到到账（仅验交互流转，账本断言归集成）。

### UC-REDEEM-014 · validFrom 未生效码拒兑（生效下界 + 时区 + 注入时钟）`[特殊][异常][刁钻]`（评审①特殊补）
- **角色**：求职者　**前置**：码/批次 `validFrom` 在未来（预热/未生效）。**触发**：提前兑换。
- **主流程**：1) reserve CAS 的 WHERE 内联 `clock.now()≥validFrom AND clock.now()<validUntil`（双侧时间窗，注入时钟）2) 未到 `validFrom` → 0 行 → 统一错误码（不泄露「未生效」细节，接 031）3) `validUntil` 已过 → 同样 0 行（惰性过期）。
- **异常 E（时区错配）**：`validFrom/validUntil` 一律 UTC 存储 + 比较，客户端展示按 locale，判定不受客户端时区影响。
- **特殊（边界）**：`validFrom` 前 1ms 拒 / 后 1ms 可兑（注入时钟确定）。
- **刁钻（抢预热码/改本地时钟）**：客户端改系统时间提前兑 → 服务端注入 `Clock` 为唯一真相，客户端时间无效。
- **后置**：未生效拒，码态不变。
- **验收**：`validFrom±1ms` 边界注入时钟下确定；客户端时区/时钟篡改不影响判定；未生效对外统一错误码不泄露。
- **关联**：reserve CAS WHERE 内联；状态机 RedeemCode；原语 CAS+事件日志；可注入时钟。
- **TC**：
  - `TC-REDEEM-014-boundary`（集成,注入时钟）：`validFrom±1ms` → 前拒、后可兑。
  - `TC-REDEEM-014-tz`（单元）：不同客户端时区/伪造时钟 → 判定仍按服务端 UTC Clock。
  - `TC-REDEEM-014-samereject`（集成）：未生效 vs 已过期 vs 无效 → 对外统一错误码 schema 一致（接 031）。

### UC-REDEEM-015 · 共享多次码（全局 maxRedeemTotal 计数器 CAS）`[正常][并发][复杂][刁钻]`（评审①④.1 P0：模型洞）
- **角色**：求职者（C 端营销 WELCOME 类码）　**前置**：码 `type=shared`，`maxRedeemTotal=T`，per-user `maxRedeemPerUser=1`。**触发**：多用户兑换同一共享码。
- **主流程**：1) 共享码**不走单码 status CAS**（码无 used 翻转），走**全局名额计数器行 CAS** `redeemed_total<T → redeemed_total+1`（SERIALIZABLE）2) 同事务 per-user 去重 `unique(code_id, principal)` 防同人多领 3) 计数器 +1 与 entitlement credit **同事务原子** 4) `redeemed_total==T` 时同事务 CAS 批次 `active→exhausted`（逻辑售罄）5) 派生 `domain_event(shared_code_exhausted)`（仅满时）。
- **备选**：共享码同样支持 `validFrom/validUntil` 双侧时间窗（接 014）。
- **异常 E**：credit 失败 → 计数器 +1 回滚（同事务），名额不被空占。
- **并发 E2**：`T=100`，500 并发 → 计数器 CAS 串行化，恰 100 成功，401 拒（名额满统一错误码）；无超发。
- **复杂**：共享码计数器模型与单码 CAS 模型**并存不打架** — 码 type 决定走哪条收口路径，二者互斥选择。
- **刁钻（同人多端刷共享码/绕 per-user）**：同 principal 多端并发同共享码 → `unique(code_id, principal)` + 计数器双守卫，同人恰 1 次，超发 0。
- **后置**：计数器 ≤T；每 principal ≤maxRedeemPerUser；credit 与计数同事务。
- **验收**：T 名额 + N>T 并发 → 恰 T 成功、计数器=T、无超发；同人多端 → 恰 1；credit 失败名额回补。
- **关联**：契约 `POST /redeem`（code type=shared）；状态机 RedeemCode(shared 分支)+RedeemBatch(exhausted)；原语 计数器行 CAS+唯一约束+事件日志；隔离 SERIALIZABLE。
- **TC**：
  - `TC-REDEEM-015-totalcap`（集成,SERIALIZABLE,固定seed）：T=100，500 并发 → 恰100成功、计数器=100、400拒。
  - `TC-REDEEM-015-peruser`（集成）：同 principal 5 端并发同共享码 → 恰1、`unique` 约束拒其余。
  - `TC-REDEEM-015-creditfail`（集成,崩溃点）：credit 失败 → 计数器回滚、名额回补、零 credit。

### UC-REDEEM-016 · per-user 配额并发收口 `[并发][刁钻][异常]`（评审 P0）
- **角色**：求职者　**前置**：批次 `maxRedeemPerUser=N`。**触发**：同用户用**同批不同码**并发多发。
- **主流程**：单码 CAS 只护同一码；per-user 配额靠**独立机制**：1) `unique(batch_id, bound_principal, slot)` 唯一约束，slot ∈ [1..N] 2) 或 **配额计数器行 CAS** `redeemed_count<N` 守卫，与 `reserved→used` 同事务推进 3) 超配额 → 拒，释放该次 reserve。
- **异常 E2 跨设备/跨码竞态**：同用户 N+1 个不同码并发 → 计数器 CAS 串行化，恰 N 个成功，第 N+1 个 0 行拒。
- **刁钻（多设备刷配额）**：同 principal 多端并发冲击 → 计数器为单一真相，设备数无关，超发=0。
- **后置**：成功数恰 = 配额 N；超额请求码回 unused。
- **验收**：N 并发不同码、配额=1 → 恰 1 成功；配额=N、N+5 并发 → 恰 N 成功、无超发、计数器=N。
- **关联**：状态机 RedeemCode；原语 CAS+唯一约束（配额计数器）+RLS。
- **TC**：
  - `TC-REDEEM-016-quota1`（集成,SERIALIZABLE）：配额1，10 个不同码并发 → 恰1成功、9 拒、9 码回 unused。
  - `TC-REDEEM-016-quotaN`（集成）：配额3，8 并发 → 恰3成功、计数器=3。
  - `TC-REDEEM-016-multidevice`（集成）：同 principal 5 端并发 → 受配额约束、超发0。

### UC-REDEEM-044 · 兑换输入规范化（Crockford O/0,I/L/1 + NFKC 纯函数）`[特殊][异常][刁钻]`（评审④.6）
- **角色**：求职者　**触发**：用户输入码（含分隔符/大小写/易混字符/全角）。
- **主流程**：1) lookup/hash 前经**确定性规范化纯函数**：NFKC 归一 → 去分隔符/空白 → 大写 → Crockford 映射（`O→0`、`I/L→1`）→ 白名单字符校验 2) 规范化后再 hash 查找 3) 规范化是纯函数（无副作用、可单测），同源恒定时间（接 030/031）。
- **特殊（i18n/全角/边界）**：全角数字/中文分隔符 → NFKC 归一；空输入 → 格式拒（checksum 降库压，接 030）。
- **异常 E**：含白名单外字符 → 格式非法拒，不打 DB（降库压）。
- **刁钻（多书写形式存在性探测旁路）**：攻击者用 `O` vs `0` 等多形式探测同码存在性 → 规范化先收敛为单一规范形，多形式 → 同一 hash → 同一限流/恒定时间桶，无旁路。
- **后置**：无状态变更；规范化后查找。
- **验收**：`O0o`/`Il1` 各书写形式 → 规范化为同一码 hash；合法用户误输（大小写/分隔符）被正确接受；多形式不产生多限流桶旁路。
- **关联**：纯函数（落 `packages`）；原语 事件日志；规则 输入规范化 + 撞库同源（接 030/031）。
- **TC**：
  - `TC-REDEEM-044-normalize`（单元,property,固定seed）：随机大小写/分隔符/Crockford 混淆 → 规范化恒等于规范形。
  - `TC-REDEEM-044-whitelist`（单元）：白名单外字符 → 格式拒、不打 DB。
  - `TC-REDEEM-044-noprobe`（集成）：同码多书写形式 → 同 hash、同限流桶、恒定时间一致（接 031）。

### UC-REDEEM-043 · 兑换预览 preview（防撞库同源）`[特殊][刁钻][逃逸]`（评审 P1）
- **角色**：求职者　**前置**：输入码请求预览（看将得权益）。**触发**：`POST /redeem/preview`。
- **主流程**：1) **与 redeem 共享 L1–L5 全护栏**（同输入规范化、同限流桶、同退避、同风控、同恒定时间封装）2) **只读**校验，不改任何码态/计数器 3) 命中合法且可兑 → 返回 spec 摘要（按 specVersion）4) 任何不可兑（已用/无效/未生效/过期/越权/超配额/已售罄）→ **统一错误码 `REDEEM_REJECTED`，不泄露存在性** 5) preview 计入同一限流/风控账本。
- **特殊（i18n）**：spec 摘要按 locale 渲染，不影响存在性判定。
- **刁钻（存在性探测/撞库旁路）**：高频 preview 枚举码 → 与 redeem **同被限流/退避/封禁**，不成无限流探测器。
- **逃逸**：风控命中 → preview 同样降级/challenge，不旁路。
- **后置**：码态/计数器不变；写 `redeem_audit_ledger(preview)` + 计入风控信号。
- **验收**：preview 不区分「无效 vs 已用 vs 未生效」对外响应；高频 preview 与 redeem 共享限流，超限同被封；preview 不改任何码态。
- **关联**：契约 `POST /redeem/preview`；原语 RLS+事件日志；规则 撞库同源 + 恒定时间。
- **TC**：
  - `TC-REDEEM-043-nosrc`（集成）：preview「不存在码」vs「已用码」→ 响应体/错误码/schema 完全一致。
  - `TC-REDEEM-043-sharedlimit`（集成）：preview 高频枚举 → 触发与 redeem 同一限流桶、被退避封禁。
  - `TC-REDEEM-043-readonly`（集成）：preview 后码态、计数器、账本无写入（除 audit/risk 信号）。

### UC-REDEEM-012 · 查询兑换状态（逃逸态可见）`[正常][逃逸][特殊]`
- **角色**：求职者　**前置**：发起过兑换（含卡 reserved 受理中）。**触发**：`GET /redeem/:requestId/status`。
- **主流程**：1) RLS 仅返回 principal 自己的兑换请求 2) 映射内部态 → 用户态：`processing(reserved 受理中) / fulfilled(used 到账) / rejected(统一原因，不泄细节) / expired`。
- **逃逸（可观测补洞，评审必补）**：卡 RESERVED 的码对用户**可见为 processing**，附预计到账/重试入口，消除「零可观测 dead-end」。
- **特殊（i18n）**：状态文案 i18n。
- **异常 E3**：查他人 requestId → RLS 0 行 → 404。
- **后置**：无状态变更。
- **验收**：reserved 中的请求返回 processing 而非「成功/失败」；越权查 0 行；rejected 不泄露内部原因。
- **关联**：契约 `GET /redeem/:requestId/status`；原语 RLS。
- **TC**：
  - `TC-REDEEM-012-processing`（集成）：reserved 态 → 返回 processing，非终态误报。
  - `TC-REDEEM-012-rls`（集成）：查他人请求 → 404/0 行。

### UC-REDEEM-013 · 充值与兑换两条路径汇入同一权益账户 `[正常][复杂][特殊]`
- **角色**：求职者　**前置**：账户存在。**触发**：兑换 / 充值（commerce）任一到账。
- **主流程**：1) 兑换 credit `source='redeem'`，充值 credit `source∈{paid}`（commerce 口径）2) 同一 `EntitlementAccount` 统一 balance，扣减优先级沿用 commerce：`gift→trial→paid(FIFO)`，兑换发放按 spec_type 入对应额度 3) 勾稽恒等式跨两路径一致。
- **复杂**：两路径并发到账同账户 → 各自幂等键 + CAS 增 balance，无丢增、无重复增。
- **特殊**：能力位/时间型 spec 不进点数 balance，单独 `capability/duration` 计量（UC-070/090/091）。
- **后置**：账户 balance/能力位/到期反映两路径合并结果。
- **验收**：兑换 + 充值并发各 +N → 账户增量恰 = 两者和；勾稽恒等式成立。
- **关联**：状态机 EntitlementAccount；原语 CAS+幂等键；与 commerce 共享账户。
- **TC**：
  - `TC-REDEEM-013-merge`（集成,property,固定seed）：随机交错充值+兑换 N 笔 → 勾稽恒等式恒成立。

---

## 3. 并发、幂等、TTL、对账

### UC-REDEEM-020 · 同码并发兑换（一次性 CAS 收口，single 型）`[并发][刁钻]`
- **角色**：求职者（同人双击 / 攻击者并发同码）　**触发**：同 single 码并发多请求。
- **主流程**：唯一收口点 CAS `unused→reserved`；恰一成功，其余读 0 行 → 归因「已占用」→ 统一错误码。
- **刁钻（TOCTOU）**：校验与占用非两步——**校验内联进 CAS 的 WHERE 条件**（status/validFrom/validUntil/批次态），杜绝 check-then-act 窗口。
- **后置**：单码恰一次 reserved→used。
- **验收**：M 并发同码 → 恰 1 成功，M-1 拒且无副作用、无第二条 credit。
- **关联**：原语 CAS；隔离 SERIALIZABLE。
- **TC**：
  - `TC-REDEEM-020-race`（集成,SERIALIZABLE,固定seed）：50 并发同码 → 断言恰1 used、1 credit、49 拒。
  - `TC-REDEEM-020-toctou`（集成）：validFrom/validUntil 边界并发 → 无「校验通过但占用时已过期/未生效」的漏发。

### UC-REDEEM-021 · 幂等重复兑换（双击/断线重发）`[并发][正常]`
- **主流程**：业务真相键 `(principal, code_hash)` 唯一约束 + `ON CONFLICT DO NOTHING`；重复请求返回首次结果，副作用一次。
- **异常 E6 断线重连**：客户端重发同真相键 → 不双扣、不双 credit。
- **后置**：恰一条 credit。
- **验收**：同真相键 2 次 → 一条 credit、一次绑定、第二次返回首次成功体。
- **关联**：原语 幂等键。
- **TC**：`TC-REDEEM-021-idem`（集成）：双发同真相键 → 副作用一次。

### UC-REDEEM-025 · 幂等键投毒 / 键-码不匹配（服务端真相键）`[刁钻][异常][并发]`（评审②.3 P1：裸结论→机制）
- **角色**：攻击者/客户端　**触发**：复用同一 `idempotencyKey` 提交不同码 / 用他人成功键套缓存体。
- **主流程**：1) **业务幂等真相键 = `(principal, code_hash)`**（服务端派生，非纯客户端 idempotencyKey）2) 客户端 `idempotencyKey` 仅作请求去重辅助，**不作权益发放真相** 3) 同 idempotencyKey 但 code_hash 不同 → 键-码不匹配，不返回缓存的他码结果，按新 `(principal, code_hash)` 走兑换 4) 跨 principal 复用键 → principal 维度隔离，不命中他人结果（接 083 真相源）。
- **异常 E**：客户端复用键提交不同码企图「套已成功码的结果」→ 真相键 mismatch，不串发。
- **并发 E2**：同 `(principal, code_hash)` 并发多请求 → 唯一约束 `ON CONFLICT`，副作用一次（接 021）。
- **刁钻（键投毒/缓存体污染）**：投毒键关联他码/他人结果 → 服务端真相键阻断，记安全事件。
- **后置**：发放真相绑定 `(principal, code_hash)`，投毒无效。
- **验收**：同 idempotencyKey + 不同码 → 各自按真相键独立处理、不串结果；跨 principal 复用键 → 不命中他人结果；同真相键并发 → 副作用一次。
- **关联**：契约 redeem schema；原语 幂等键（服务端真相）+事件日志；规则 服务端真相源（接 083）。
- **TC**：
  - `TC-REDEEM-025-keymismatch`（集成）：同 idempotencyKey 提交码A后再提交码B → 不返回A结果、B独立兑换。
  - `TC-REDEEM-025-crossprincipal`（集成,security）：用他人成功 key → principal 隔离、不命中、记安全事件。
  - `TC-REDEEM-025-truthkeyrace`（集成,SERIALIZABLE）：同 `(principal,code_hash)` 并发 → 副作用一次。

### UC-REDEEM-022 · 权益发放失败释放（reserved→unused）`[异常][逃逸][复杂]`
- **角色**：系统　**前置**：码 reserved，发放过程失败。**触发**：credit 失败/超时。
- **主流程**：1) 事务回滚 2) CAS `reserved→unused`（释放码）/名额计数器回滚 3) 释放 per-user 配额计数器 4) 用户 status=processing→rejected 或可重试。
- **复杂（部分 spec 已落）**：异构 spec 中途失败 → 见 UC-070 整体回滚原子性，不留半发放。
- **逃逸**：发放方暂不可用 → 不立即 release，留 reserved 待 TTL（UC-023），给用户受理可查（UC-012）。
- **后置**：`code=unused`，无 credit，配额/名额回补。
- **验收**：发放失败后码可被同人/他人再兑；无残留 reserved 超 TTL。
- **关联**：原语 CAS+事件日志。
- **TC**：`TC-REDEEM-022-release`（集成,崩溃点枚举）：注入 credit 失败 → 码回 unused、配额回补、零 credit。

### UC-REDEEM-023 · reservation TTL 超时回收（reaper）`[特殊][逃逸][并发]`（评审 P0）
- **角色**：系统（reaper）　**前置**：码卡 reserved 超 `reservationTtlSec`（如崩在 reserve 与 confirm 之间）。**触发**：reaper 周期扫描（**注入时钟**）。
- **主流程**：1) 扫 `status=reserved AND reserved_at < clock.now()-TTL` 2) CAS `reserved→unused`（幂等：仅 reserved 命中）3) 释放配额/名额计数器 4) 派生回收事件。
- **并发 E2（reaper vs 迟到 confirm）**：reaper release 与 confirm 并发 → 二者 CAS，恰一赢：若 confirm 先赢码 used、reaper 0 行放弃；若 reaper 先赢码 unused、迟到 confirm 0 行 → 归因失败、用户重兑。
- **逃逸**：永久卡 reserved 被消灭（评审「半吊子迁移」修复）——TTL 是显式持久语义，非内存断连。
- **特殊（边界）**：TTL 前 1s 不回收 / 后 1s 回收（注入时钟确定）。
- **后置**：超时码回 `unused` 可再兑。
- **验收**：reserved 超 TTL 必被回收且幂等；reaper 与 confirm 并发终态唯一、无双发。
- **关联**：状态机 RedeemCode；原语 CAS+事件日志；可注入时钟。
- **TC**：
  - `TC-REDEEM-023-reap`（集成,注入时钟）：卡 reserved 超 TTL → reaper 回 unused、配额回补、码可再兑。
  - `TC-REDEEM-023-vsconfirm`（集成,SERIALIZABLE）：reaper 与 confirm 并发 → 恰一态、无双 credit。
  - `TC-REDEEM-023-boundary`（单元,注入时钟）：TTL±1s 边界 → 前不收、后收。

### UC-REDEEM-026 · reserve-then-abandon 锁名额 DoS 防护 `[逃逸][并发][刁钻]`（评审④.1 衍生 P0）
- **角色**：系统/攻击者　**前置**：共享码（015）或单批有限名额。**触发**：攻击者大量 reserve 不 confirm，占满名额制造「售罄」。
- **主流程**：1) `maxInflightReservePerUser`（默认 3）限制单 principal 未确认 reserve 数，超限拒新 reserve 2) reservation TTL（023 reaper）兜底回收 abandoned 名额，释放计数器 3) 风控（032）`reserveAbandonRate` 信号命中 → step-up/封禁 4) 名额计数器（015）在 reaper 回收后回补。
- **逃逸**：名额被恶意占用 → reaper + inflight 上限双兜底，合法用户最终可兑，无永久售罄 dead-end。
- **并发 E2**：攻击者 N 端并发占名额 → inflight 上限 + 计数器，占用受限；reaper TTL 后批量回补。
- **刁钻（占位 DoS/慢速耗尽）**：慢速持续占位 → inflight 上限 + abandon 率风控联合拦截。
- **后置**：abandoned 名额经 TTL 回补；攻击 principal 受限/封禁。
- **验收**：单 principal inflight reserve 超 `maxInflightReservePerUser` → 拒；abandoned 名额 TTL 后回补可兑；高 abandon 率 → 风控动作留痕。
- **关联**：状态机 RedeemCode(reserved→unused via reaper)；原语 CAS+计数器+事件日志；接 015/023/032。
- **TC**：
  - `TC-REDEEM-026-inflightcap`（集成）：单 principal 第4个未确认 reserve → 拒（上限3）。
  - `TC-REDEEM-026-reapreclaim`（集成,注入时钟）：占名额不 confirm → TTL 后 reaper 回补、合法用户可兑。
  - `TC-REDEEM-026-riskaband`（集成,夹具）：高 abandon 率 → 风控 step-up/封禁、`risk_action_ledger` 留痕。

### UC-REDEEM-024 · 对账/恢复任务调度语义（分布式锁）`[复杂][并发][逃逸]`（评审 P2）
- **角色**：系统（对账/恢复任务）　**前置**：多实例部署。**触发**：定时对账「卡态码、账实勾稽」。
- **主流程**：1) 任务获取**单实例/分布式锁**（Postgres advisory lock 或 Redis 锁，带租约）2) 仅持锁实例执行恢复（release 卡态、补派生缺失事件）3) 每笔恢复操作仍 reservationId/code_id 层幂等 4) 锁租约到期自动释放。
- **并发 E2（多实例并发对账，评审必补）**：双实例同时跑 → 仅一个持锁执行，另一个跳过 → **不双前滚、不重复发放**。
- **逃逸**：持锁实例崩 → 租约到期他实例接管，恢复幂等不重复。
- **后置**：卡态码终态化一次；账实平。
- **验收**：双实例并发恢复 → 每码终态恰一次迁移、credit 不重复；无锁裸跑被禁止。
- **关联**：原语 幂等键+事件日志；机制 分布式锁（落 `architecture/`）。
- **TC**：
  - `TC-REDEEM-024-lock`（集成,双实例）：两实例并发对账 → 恢复操作恰执行一次、无重复 credit。
  - `TC-REDEEM-024-leasetakeover`（集成）：持锁实例崩 → 他实例租约接管、幂等不双发。

---

## 4. 异构 spec / 时间型 / 档位权益（复杂类，评审核心补洞）

### UC-REDEEM-070 · 异构 spec 部分成功原子性 `[复杂][异常][刁钻]`（评审 P0）
- **角色**：求职者　**前置**：码 spec 含多型（如 积分100 + 套餐30天 + 能力位X）。**触发**：兑换。
- **主流程**：1) **单一 SERIALIZABLE 事务**内对三型分别记账：`credit(points,100)`、`credit(duration,30)`、`credit(capability,X)` 2) **全成功**才 CAS `reserved→used`、提交 3) **任一失败 → 整事务回滚**、CAS `reserved→unused`、码回 UNUSED、零 ledger。
- **异常 E4（注入天数发放失败）**：duration credit 失败 → 积分 credit 一并回滚，不留「积分到账但天数没到」的半成功。
- **复杂（跨聚合：个人积分 + 租户能力位）**：跨账户多 credit 仍同事务原子；跨聚合不可同事务者 → outbox 编排 + 补偿，最终一致且每型幂等。
- **刁钻（构造部分失败套利）**：攻击者诱导某型失败以期保留另一型 → 原子回滚阻断，无部分获利。
- **后置**：全成功 `used`+三条 credit；否则 `unused`+零 credit。
- **验收**：注入任一 spec 失败 → 其余 spec 零落账、码回 unused；成功则三型 credit 同时可见、勾稽一致。
- **关联**：状态机 RedeemCode+EntitlementAccount；原语 CAS+事件日志；隔离 SERIALIZABLE。
- **TC**：
  - `TC-REDEEM-070-atomic`（集成,崩溃点枚举,固定seed）：注入 duration credit 失败 → points/capability 均未落、码 unused。
  - `TC-REDEEM-070-allok`（集成）：三型成功 → 三条 credit、code used、勾稽成立。
  - `TC-REDEEM-070-crosssaga`（集成）：跨聚合 outbox 编排，部分失败 → 补偿后无悬挂 credit。

### UC-REDEEM-017 · 跨批次叠加/互斥（stackPolicy：独立/maxStackN/互斥组）`[复杂][特殊][刁钻]`（评审①复杂补）
- **角色**：求职者　**前置**：已兑过某批次码，再兑另一批次码。**触发**：叠加兑换。
- **主流程**：1) 批次 spec 声明 `stackPolicy ∈ {independent, maxStackN, mutexGroup:G}` 2) `independent` → 直接叠加 3) `maxStackN` → 叠加计数行 CAS `stack_count<N`（同 stackKey 维度，SERIALIZABLE）4) `mutexGroup:G` → 同组已兑则拒（`unique(principal, mutex_group)`）5) 违反策略 → 拒，统一错误码。
- **特殊（边界）**：首次叠加（stack_count=0）正常；恰达 N 边界拒第 N+1。
- **复杂（跨聚合）**：叠加判定跨多批次/多 credit，同事务原子，部分失败回滚（接 070）。
- **刁钻（互斥组套利）**：用户钻空子同时兑互斥组两券套利 → 并发下 unique + 计数器 CAS 串行，恰一成功。
- **后置**：叠加计数 ≤N / 互斥组恰一；违规零副作用。
- **验收**：`maxStackN=2`，3 券并发 → 恰2成功；互斥组两券并发 → 恰1；independent 无限叠加正常。
- **关联**：契约 `POST /redeem`；状态机 EntitlementAccount；原语 叠加计数 CAS+唯一约束+事件日志；隔离 SERIALIZABLE。
- **TC**：
  - `TC-REDEEM-017-maxstack`（集成,SERIALIZABLE）：`maxStackN=2`，3 券并发 → 恰2、第3拒。
  - `TC-REDEEM-017-mutex`（集成）：互斥组两券并发 → 恰1成功、另一拒。
  - `TC-REDEEM-017-independent`（集成）：independent → 多券叠加全成功、勾稽成立。

### UC-REDEEM-090 · 时间型权益续期语义（累加 vs 覆盖 / 到期回收）`[复杂][特殊][并发]`（评审 P2）
- **角色**：求职者　**前置**：账户已有时间型权益（剩余 M 天）/ 能力位有到期日。**触发**：兑换时间型/能力位码。
- **主流程**：1) **续期策略（契约锁定）**：套餐天数默认 **累加**（`expiry = max(now, current_expiry)+grantDays`），能力位默认 **覆盖延长**到期日 2) credit(duration) 落账 3) 能力位到期由定时任务（注入时钟）回收：到期 → 能力位失效，写回收事件。
- **特殊（边界）**：已过期账户续期从 `now()` 起算，非从旧过期日叠加（避免「续期即过期」）。
- **并发 E2**：两张时间型码并发兑换同账户 → 累加 CAS 串行，总天数 = 两者和，无丢加。
- **复杂**：能力位 + 时间型混合（UC-070 原子）下续期与授予同事务；档位合并见 UC-091。
- **后置**：到期日正确累加/覆盖；过期能力位被回收失效。
- **验收**：累加策略下两码 → 到期日 = 起点+两段；过期账户续期从 now 起算；到期能力位定时回收后鉴权失败。
- **关联**：状态机 EntitlementAccount(duration/capability)；原语 CAS+事件日志；可注入时钟。
- **TC**：
  - `TC-REDEEM-090-stack`（集成,注入时钟）：连兑两 30 天码 → 到期日 = now+60（未过期叠加）/ now+30（过期账户重置起点）。
  - `TC-REDEEM-090-reap`（集成,注入时钟）：能力位到期 → 回收事件 + 鉴权失效。
  - `TC-REDEEM-090-concurrent`（集成）：两时间码并发 → 总天数无丢加。

### UC-REDEEM-091 · 能力位/档位合并不降级（tier=max，多维各自取优）`[特殊][复杂][刁钻]`（评审④.5）
- **角色**：求职者　**前置**：账户已有能力位 `tier=T_cur`。**触发**：兑换含能力位/档位的码 `tier=T_grant`。
- **主流程**：1) **合并纯函数**：能力位 `tier = max(T_cur, T_grant)`（防降级），时长维度累加（接 090），各维度**各自取优**不互相覆盖 2) 高档账户兑低档码 → tier 不降（仍 T_cur），但低档码的时长/其他维度仍可叠加 3) 合并结果落账，写事件。
- **特殊（边界）**：同档兑换 → tier 不变、时长叠加；跨档升级 → tier 升、时长按策略。
- **复杂**：能力位 + 时长 + 点数多维混合（070 原子）下各维独立 max/累加，同事务。
- **刁钻（诱导降级退差价套利）**：高档用户兑低档码期望降权后退差价 → `tier=max` 阻断降级，无套利；反向：低档兑高档正常升级。
- **后置**：tier=max（各维取优）；无降级。
- **验收**：高档账户兑低档码 → tier 不降；低档兑高档 → tier 升；多维各自取优、互不覆盖、勾稽一致。
- **关联**：状态机 EntitlementAccount(capability/tier)；原语 合并纯函数+CAS+事件日志；接 090。
- **TC**：
  - `TC-REDEEM-091-nodowngrade`（单元）：`tier=max(3,1)=3`，高档兑低码 → tier 仍3。
  - `TC-REDEEM-091-upgrade`（集成）：低档兑高码 → tier 升、事件留痕。
  - `TC-REDEEM-091-multidim`（集成）：能力位 max + 时长累加 + 点数 → 各维独立、勾稽成立。

---

## 5. 退款 / 冲正 / 欺诈 / 账本不可篡改（clawback，评审核心补洞）

### UC-REDEEM-050 · 兑换码事后欺诈下线（未用 VOID）`[异常][刁钻]`
- **角色**：运营　**前置**：批次疑盗刷，部分码 unused 部分 used。**触发**：欺诈下线。
- **主流程**：未发放码 CAS `unused→void`（封堵未来兑换）；已发放码进入 UC-053 clawback 评估。
- **刁钻（抢在 VOID 前兑换）**：下线瞬间并发兑换 unused 码 → 单码 CAS 与 void CAS 竞争，恰一赢；若兑换先赢则转 used 后由 clawback 追回。
- **后置**：unused→void；used→clawback 队列。
- **验收**：void 后该码不可兑；下线竞态无双态。
- **关联**：原语 CAS；接 UC-053。
- **TC**：`TC-REDEEM-050-voidrace`（集成）：void 与兑换并发同码 → 终态唯一、used 者入 clawback。

### UC-REDEEM-053 · 兑换侧 clawback（欺诈追回，负向冲正）`[异常][复杂][并发]`（评审 P0）
- **角色**：系统/运营（兑换侧欺诈追回）　**前置**：`source=redeem` 码已 used 发放权益，部分已被消费。**触发**：判定欺诈/盗刷。
- **主流程**：1) `entitlement_ledger` **append-only**（DB 强制，UC-084），追回写**负向 `clawback` 流水 source='redeem'**（不物理删 credit）2) 计算可追回 = `credit.units − 已消费(confirm_debit).units` 3) CAS 减 balance（仅扣未消费部分）4) **负余额政策（锁定）**：已消费部分不可追回 → 余额不可为负，缺口记 `clawback_shortfall` 账并按策略（停权/挂账/人工）处理，**不强制负余额**。
- **异常 E2（追回 vs 已消费竞态）**：用户正消费（reserve/confirm）与 clawback 并发 → 二者皆 CAS 同账户行，串行化：先消费则可追回额随之减少，clawback 按结算后剩余冲正，**无双扣、无幻减**。
- **复杂（saga）**：批次级 clawback 批量 → 每账户冲正幂等（幂等键 = `(code_id, clawback_reason)`）。
- **并发**：见 E2；冲正与 reserve 并发走 SERIALIZABLE。
- **后置**：`entitlement_ledger` 增 redeem 源 clawback 负流水；balance 反映追回；shortfall 留痕。
- **验收**：已用部分后追回 → 仅扣未消费、余额≥0、缺口入 shortfall；clawback 与消费并发账实一致、无双扣。
- **关联**：状态机 EntitlementAccount；原语 CAS+幂等键+事件日志；隔离 SERIALIZABLE；接 084。
- **TC**：
  - `TC-REDEEM-053-clawback`（集成）：发放100、消费40后追回 → clawback −60、balance=0、shortfall 记录消费40、source=redeem。
  - `TC-REDEEM-053-racemaster`（集成,SERIALIZABLE,固定seed）：consume 与 clawback 并发 → 无双扣、无负余额、勾稽成立。
  - `TC-REDEEM-053-idem`（集成）：同 `(code_id,clawback_reason)` 幂等键重放 → 负流水一条。

### UC-REDEEM-054 · 充值侧退款/chargeback → 权益冲正（区别 053）`[异常][复杂][并发]`（评审④.3）
- **角色**：系统（commerce 退款/chargeback 回调）　**前置**：`source=paid` 充值已 credit 权益，部分已消费。**触发**：PaymentOrder 退款/chargeback 成功。
- **主流程**：1) **触发源 = commerce PaymentOrder 退款/chargeback 事件**（经 outbox，非兑换侧）2) 幂等键 = `(order_id, refund_id)`（区别 053 的 `(code_id, clawback_reason)`）3) `entitlement_ledger` 写负向 clawback `source='paid'`，计算可追回 = credit − 已消费 4) CAS 减 balance（仅未消费部分），负余额政策同 053（不强制负余额，缺口入 shortfall）5) 与 commerce 经 **outbox/saga 解耦**，各自幂等。
- **异常 E2（先消费再退款白嫖）**：用户消费后退款 → 仅冲正未消费部分，已消费缺口入 `clawback_shortfall` 按策略（停权/挂账/人工），不被无损白嫖。
- **复杂（saga）**：退款 saga 跨 commerce PaymentOrder + entitlement_ledger 两聚合，outbox 编排，幂等可重入。
- **并发**：退款冲正 vs 正消费并发 → SERIALIZABLE 串行，无双扣无幻减（同 053 E2）。
- **后置**：`entitlement_ledger` 增 paid 源 clawback 负流水；balance 反映；shortfall 留痕。
- **验收**：充值退款 → 冲正 source=paid、幂等键 `(order_id,refund_id)` 去重一条；先消费再退款 → 仅扣未消费、缺口入 shortfall；与兑换侧 053 clawback 互不串源。
- **关联**：状态机 EntitlementAccount；原语 CAS+幂等键+outbox 事件；隔离 SERIALIZABLE；接 commerce PaymentOrder + 084。
- **TC**：
  - `TC-REDEEM-054-refund`（集成）：paid 充值100、消费40后退款 → clawback −60、balance=0、shortfall=40、source=paid。
  - `TC-REDEEM-054-idem`（集成）：同 `(order_id,refund_id)` 重放 → 负流水一条。
  - `TC-REDEEM-054-racemaster`（集成,SERIALIZABLE,固定seed）：退款冲正 vs 消费并发 → 无双扣、勾稽成立。

### UC-REDEEM-084 · 账本 append-only 不可篡改强制（DB 撤 UPDATE/DELETE + 哈希链）`[刁钻][异常][复杂]`（评审②.2③ P0：裸结论→机制）
- **角色**：系统/内鬼（对抗）　**触发**：试图 UPDATE/DELETE `entitlement_ledger` 掩盖盗刷。
- **主流程**：1) **DB 层强制**：ledger 表对应用角色仅授 INSERT/SELECT，**撤销 UPDATE/DELETE 权限**（GRANT 收紧）2) **行级触发器**拒绝 UPDATE/DELETE（BEFORE UPDATE/DELETE → RAISE）3) **哈希链**：每行 `row_hash = H(prev_hash || payload)`，链式防篡改/删行可检出 4) CI 迁移校验断言授权与触发器存在（防迁移回退打开缺口）。
- **异常 E（撤权不卡 clawback）**：合法负向冲正（053/054 clawback）是**新增 INSERT 负流水**，不是 UPDATE/DELETE → 不被触发器误拒（关键不变量）。
- **复杂（哈希链分段）**：哈希链跨账户分片需定义 **per-account 链分段**以兼顾并发写入与可验证。
- **刁钻（内鬼删流水/改 units 掩盖盗刷）**：直接 UPDATE units / DELETE 行 → DB 权限 + 触发器双拒；删中间行 → 哈希链断裂可检出。
- **后置**：ledger 物理不可改/删；篡改尝试被拒并（可）告警。
- **验收**：对 `entitlement_ledger` 执行 UPDATE/DELETE → 权限/触发器拒（security 集成可断言）；删行/改行 → 哈希链校验检出断裂（单测）；clawback 负向 INSERT 正常通过；CI 校验授权存在。
- **关联**：机制 DB 权限+触发器+哈希链（落 `architecture/` + `rules/`）；原语 持久有序事件日志（不可篡改强化）；接 053/054。
- **TC**：
  - `TC-REDEEM-084-noupdate`（集成,security）：应用角色 UPDATE/DELETE ledger → 拒（权限/触发器）。
  - `TC-REDEEM-084-hashchain`（单元）：篡改/删某行 → 哈希链校验检出断裂、定位。
  - `TC-REDEEM-084-clawbackok`（集成）：053/054 负向 INSERT clawback → 通过（撤权不卡冲正写入）。
  - `TC-REDEEM-084-cimigration`（契约/CI）：迁移校验断言 ledger 撤 UPDATE/DELETE + 触发器存在。

### UC-REDEEM-083 · 服务端定价/spec 为唯一真相源 `[刁钻][异常]`（评审④补）
- **角色**：求职者　**触发**：客户端请求夹带 units/spec/金额。
- **主流程**：1) 契约层 redeem 请求**只接受 `code + idempotencyKey + locale`** 2) 服务端按码 specVersion 计算发放，**忽略任何客户端可信字段** 3) 检出篡改字段 → 记安全事件。
- **刁钻（金额/units 篡改）**：请求传 `units=99999` → 发放仍 = spec 真相值。
- **后置**：发放与篡改无关。
- **验收**：篡改 units/spec → 发放为服务端真相值且记安全事件。
- **关联**：契约 schema 收紧；原语 事件日志；规则 真相源。
- **TC**：`TC-REDEEM-083-tamper`（契约+集成）：契约层断言请求 schema 无 units/spec 字段；集成断言夹带被忽略。

---

## 6. 防刷 / 防撞库 / 侧信道 / 风控（评审②③核心修正）

### UC-REDEEM-030 · 撞库防御（限流 + 退避 + 高熵，checksum 降级）`[刁钻][并发][逃逸]`
- **角色**：系统　**触发**：脚本高频试码。
- **主流程**：1) **输入规范化（044）+ L1 限流**：per-IP + per-principal token bucket（滑窗，**注入时钟**）2) **L3 指数退避 + 封禁**：连续失败超阈 → 退避加长 → 封禁窗口 3) **高熵码空间**：128-bit，暴力期望 2^127 4) **checksum 仅过滤格式非法（降库压/防误输），不计安全预算**（评审修正：算法公开，熵削减≈0）。
- **刁钻（预过滤 checksum 合法码攻击）**：攻击者只发 checksum 合法码 → checksum 防线对其失效**是预期的**；真实拦截来自 L1+L3+高熵，撞库不可行。
- **并发（分布式撞库）**：多 IP/多 principal 协同 → per-IP 限流 + 全局 failRatio 风控（UC-032）联合拦截。
- **逃逸**：风控命中 → challenge/降级（UC-040），不直接误封合法用户（UC-061 误伤防护）。
- **后置**：超阈请求被退避/封禁，写 `risk_action_ledger`。
- **验收**：高频试码 N 次后被限流且退避加长；checksum 不被当撞库防线（测试注释明确其定位）；2^128 空间下随机命中概率断言可忽略。
- **关联**：原语 事件日志；规则 撞库分层（落 `rules/`）；可注入时钟。
- **TC**：
  - `TC-REDEEM-030-ratelimit`（集成,注入时钟）：超 R1 次/窗 → 限流码、退避窗口按配置常量加长（断言常量，非统计耗时）。
  - `TC-REDEEM-030-checksumrole`（单元）：断言 checksum 合法但不存在的码仍走完整 L1/L3，checksum **不短路安全**。
  - `TC-REDEEM-030-entropy`（单元）：码空间 2^128，断言期望尝试数远超限流上限。

### UC-REDEEM-031 · 侧信道恒定时间机制 `[刁钻][特殊]`（评审 P1，替代 timing 统计断言）
- **角色**：系统　**触发**：攻击者用响应时间/错误码差异区分「已用 vs 无效 vs 未生效 vs 存在」。
- **主流程**：1) **统一响应封装**：所有结果（成功/已用/无效/未生效/过期/超配额/已售罄/限流）经**同一 handler 出口**、**统一错误码 `REDEEM_REJECTED` + 统一 schema**（成功仅多带受理凭据字段，长度恒定）2) **固定延迟 floor**：服务端测得处理耗时后异步填充至 `redeemMinLatencyMs`，使各路径对外延迟趋同 3) used/invalid/未生效 内部细分仅入 `redeem_audit_ledger`，对外不可见。
- **刁钻（计时/错误码侧信道）**：枚举尝试 → 无法从响应区分码状态/存在性。
- **特殊（评审③修正：不可测 → 可测）**：**测试断言代码路径同一（同一响应封装函数、同一错误码、同一 schema）+ 注入计时器断言填充至 floor 常量**，**禁止统计耗时差判定**（CI flaky=假验收）。
- **后置**：对外信息恒定。
- **验收**：各类拒绝响应（已用/无效/未生效/过期/越权/已售罄）的对外错误码与 schema 字节级一致；注入计时器下延迟填充至配置 floor。
- **关联**：规则 恒定时间响应（落 `testing/` + `rules/`）；原语 事件日志（内部细分）。
- **TC**：
  - `TC-REDEEM-031-sameresp`（契约+集成）：已用/无效/未生效/过期/越权 → 对外 error code + schema 完全一致（schema-diff 断言）。
  - `TC-REDEEM-031-floor`（单元,注入计时器）：处理耗时 < floor → 填充至 `redeemMinLatencyMs`；断言**代码路径同一**，不做统计耗时比较。

### UC-REDEEM-032 · 风控契约化（信号/阈值/动作矩阵）`[刁钻][逃逸][复杂]`（评审 P1）
- **角色**：系统（风控）　**触发**：异常兑换分布。
- **主流程**：1) 采集契约化信号 `{ipAttemptRate, principalAttemptRate, failRatio, reserveAbandonRate, batchHitSkew, deviceClusterSize}` 2) 比对**契约常量阈值** 3) 按**动作矩阵**确定性触发：`observe→challenge(step-up)→batch PAUSE→principal 封禁` 4) 每级写 `risk_action_ledger`（信号快照 + 命中阈值 + 动作）。
- **逃逸**：challenge 通过 → 放行；误判申诉 → 解封通道。
- **复杂**：用户维度封禁 + 批次维度 PAUSE 两条线独立，避免单点误伤（UC-061）。
- **刁钻（农场/设备聚集/占位 DoS）**：`deviceClusterSize>K` / `reserveAbandonRate>A1` → step-up，仍异常 → 封禁；阈值契约化故可断言。
- **后置**：动作落 `risk_action_ledger`，可观测可回放。
- **验收**：给定信号夹具命中确定阈值 → 触发确定动作（确定性断言，非黑盒评分）；每级动作留痕。
- **关联**：规则 风控契约化（落 `rules/` + `observability/`）；原语 事件日志。
- **TC**：
  - `TC-REDEEM-032-matrix`（单元,确定性夹具）：表驱动 — 各信号组合 → 命中阈值 → 期望动作（observe/challenge/pause/ban）。
  - `TC-REDEEM-032-ledger`（集成）：触发后 `risk_action_ledger` 含信号快照 + 阈值 + 动作。

### UC-REDEEM-040 · 逃逸：降级 / 受理 / 稍后到账（可见）`[逃逸][异常][特殊]`
- **角色**：系统　**触发**：权益池/记账依赖暂不可用，但兑换合法。
- **主流程**：1) 码 reserve 成功但 confirm 依赖失效 → **不丢请求**：留 reserved、返回「已受理，稍后到账」+ requestId 2) 后台恢复任务（UC-024 持锁）/ reaper（UC-023）兜底 3) 用户经 UC-012 查 processing。
- **逃逸（kill-switch/人工接管）**：批次风控 PAUSE（UC-061）/ 泄露应急（UC-062）→ 兑换暂挂、给受理态，运营恢复后续发；极端不可恢复 → 转人工台账补发。
- **异常 E5 降级**：依赖失效不暴露 500，返回可重试受理态。
- **特殊**：受理态文案 i18n；卡 reserved 不超 TTL（UC-023 兜底）。
- **后置**：reserved 受理中或恢复后 used；无静默丢失。
- **验收**：依赖失效时兑换不报错丢失，返回受理 + requestId 可查；恢复后到账恰一次。
- **关联**：原语 事件日志+幂等键；接 UC-012/023/024/061/062。
- **TC**：
  - `TC-REDEEM-040-accepted`（集成）：注入 confirm 依赖失效 → 受理态 + requestId、码 reserved、可查 processing。
  - `TC-REDEEM-040-recover`（集成）：恢复任务后 → 恰一次 credit、status→fulfilled。

### UC-REDEEM-061 · 批次级风控 PAUSE（防误伤）`[逃逸][复杂][刁钻]`（评审 P1，误伤修正）
- **角色**：系统（风控）　**触发**：批次维度异常分布命中阈值。
- **主流程**：1) 自动 PAUSE 前先比对**预热基线**（批次历史/营销预期流量）+ **白名单**（已知高流量营销批）2) 仅偏离基线且非白名单 → CAS `active→paused` 3) PAUSE 期兑换走受理态（UC-040），不丢 4) 运营复核 → `paused→active`。
- **复杂**：批次 PAUSE 与用户封禁两线独立，单批误伤不波及他批。
- **刁钻（自封 DoS / 合法营销误伤）**：高流量真实营销批 → 预热基线 + 白名单避免自动 PAUSE 合法活动（评审「自封 DoS」修复）。
- **逃逸**：误 PAUSE → 运营一键恢复 + 受理态用户无损补发。
- **后置**：`paused`（仅异常批），合法批不受影响。
- **验收**：白名单/基线内高流量批不被自动 PAUSE；异常批 PAUSE 后兑换受理不丢；恢复后续发恰一次。
- **关联**：状态机 RedeemBatch；原语 CAS+事件日志；规则 风控误伤防护。
- **TC**：
  - `TC-REDEEM-061-baseline`（单元,确定性夹具）：白名单/基线内高流量 → 不 PAUSE；超基线非白名单 → PAUSE。
  - `TC-REDEEM-061-nolost`（集成）：PAUSE 期兑换 → 受理态、恢复后恰一次到账。

---

## 7. RLS 越权 / 跨租户 / 生命周期

### UC-REDEEM-080 · entitlements/me RLS 越权读 `[刁钻][异常]`（评审 P1）
- **角色**：求职者/企业成员　**触发**：`GET /entitlements/me` 或带他人/跨租户 id 探测。
- **主流程**：1) RLS principal 谓词：个人账户 `owner_user_id=principal`、租户账户 `Membership EXISTS` 2) fail-closed：无 principal → 0 行 3) 越权 id → 0 行 → 404，不泄露存在性。
- **刁钻（IDOR/跨租户）**：B 用户读 A 用户/A 租户权益 → RLS 0 行。
- **异常 E3**：缺 principal 上下文（忘注入）→ 空集，非全表。
- **后置**：无变更。
- **验收**：仅返回 principal 自身权益；跨用户/跨租户读 0 行；无 principal fail-closed 空集。
- **关联**：契约 `GET /entitlements/me`；原语 RLS。
- **TC**：
  - `TC-REDEEM-080-self`（集成）：principal 读自身 → 仅本人权益。
  - `TC-REDEEM-080-idor`（集成,security）：读他人/跨租户 → 0 行/404。
  - `TC-REDEEM-080-noprincipal`（集成）：无 principal 上下文 → 空集（fail-closed）。

### UC-REDEEM-081 · 跨租户兑换拒绝 `[刁钻][异常]`（评审④补）
- **角色**：企业成员　**前置**：码归属租户 A。**触发**：租户 B 用户兑换 A 的码。
- **主流程**：1) reserve CAS 同事务校验 `code.tenant_id == principal.tenant`（B 端码）/ 个人码归属域匹配 2) 不匹配 → 拒，不泄露存在性（统一错误码）。
- **刁钻（跨租户套利）**：B 用户拿 A 营销码兑换 → 拒、记安全事件。
- **后置**：码态不变。
- **验收**：跨租户兑换 → 统一拒、码未被占用、记安全事件。
- **关联**：原语 RLS+CAS+事件日志。
- **TC**：`TC-REDEEM-081-crosstenant`（集成,security）：B 兑 A 码 → 拒、码仍 unused、安全事件留痕。

### UC-REDEEM-082 · 绑定解除 / 账号注销 / 删除权 `[特殊][复杂][刁钻]`（评审④补）
- **角色**：求职者/系统　**前置**：码已 BIND_ON_FIRST_USE 绑定。**触发**：账号注销 / 数据删除请求（PIPL/合规）。
- **主流程**：1) **绑定默认不可自助解绑**（防转卖套利）2) 账号注销 → 已用码权益账户走 commerce `active/frozen→closed`（余额清算）3) **`entitlement_ledger` 不物理删**（append-only 审计真相，UC-084 DB 强制），但 PII 关联**脱敏/匿名化**（principal→匿名 token）4) 未用绑定码随账户处置策略（作废或保留批次统计）。
- **特殊（合规删除 vs 审计保留张力）**：删除 PII 但保留去标识账本，满足审计与合规双约束。
- **复杂**：注销 saga 跨账户/账本/码绑定多聚合，幂等可重入。
- **刁钻（注销逃避 clawback）**：欺诈者注销以逃避追回 → clawback 在账户 closed 前结算/挂账，账本去标识仍保留追溯。
- **后置**：账户 closed、PII 脱敏、账本保留去标识。
- **验收**：注销后 PII 不可读但账本可去标识审计；绑定码不可自助解绑；clawback 不被注销逃避。
- **关联**：状态机 EntitlementAccount(closed)；原语 事件日志；规则 隐私/删除权；接 084。
- **TC**：
  - `TC-REDEEM-082-anon`（集成）：注销 → 账户 closed、PII 脱敏、ledger 行存在但 principal 匿名化。
  - `TC-REDEEM-082-nounbind`（集成）：自助解绑请求 → 拒。
  - `TC-REDEEM-082-clawbackbeforeclose`（集成）：注销含欺诈追回 → clawback 先结算/挂账再 close。

---

## 8. 可追溯矩阵（抽样）

| UC | 契约 endpoint | 状态机对象 | 命中原语 | 关键测试层 |
|---|---|---|---|---|
| 010 兑换主路径 | POST /redeem | RedeemCode·EntitlementAccount | CAS+幂等+RLS+事件 | 集成·e2e |
| 015 共享码名额 | POST /redeem(shared) | RedeemCode(shared)·名额计数器 | 计数器 CAS+唯一约束 | 集成(SERIALIZABLE) |
| 016 配额并发 | POST /redeem | RedeemCode·配额计数器 | CAS+唯一约束 | 集成(SERIALIZABLE) |
| 018 预算上限 | POST /redeem | RedeemBatch·预算计数器 | CAS+事件 | 集成(SERIALIZABLE) |
| 014 validFrom 下界 | POST /redeem | RedeemCode | CAS·注入时钟 | 集成·单元 |
| 017 叠加/互斥 | POST /redeem | EntitlementAccount·叠加计数 | CAS+唯一约束 | 集成(SERIALIZABLE) |
| 023 reservation TTL | (reaper) | RedeemCode(reserved→unused) | CAS+事件·注入时钟 | 集成·单元 |
| 026 占位 DoS | POST /redeem | RedeemCode·inflight 计数 | CAS+计数器·注入时钟 | 集成(夹具) |
| 024 对账调度 | (job) | RedeemCode·勾稽 | 幂等+分布式锁 | 集成(双实例) |
| 043 preview 同源 | POST /redeem/preview | （只读） | RLS+事件·撞库同源 | 集成·契约 |
| 025 幂等真相键 | POST /redeem | （真相键） | 幂等键+事件 | 集成(security) |
| 007 明文受控导出 | POST .../export | （无码态变更） | RLS+事件·明文不落日志 | 集成(security)·注入时钟 |
| 044 输入规范化 | (纯函数) | （无） | 事件·撞库同源 | 单元(property) |
| 053 兑换侧 clawback | (admin/job) | EntitlementAccount·ledger(clawback) | CAS+幂等+事件 | 集成(SERIALIZABLE) |
| 054 充值侧退款冲正 | (commerce 回调) | EntitlementAccount·ledger(clawback) | CAS+幂等(order,refund)+outbox | 集成(SERIALIZABLE) |
| 084 账本不可篡改 | (DB/迁移) | entitlement_ledger | 事件(DB 撤权+哈希链) | 集成(security)·单元·CI |
| 070 异构 spec 原子 | POST /redeem | RedeemCode·三型 credit | CAS+事件·崩溃点 | 集成(property) |
| 091 档位 tier=max | POST /redeem | EntitlementAccount(tier) | 合并纯函数+CAS | 单元·集成 |
| 031 恒定时间 | POST /redeem(·/preview) | （响应封装） | 事件(内部细分) | 契约·单元(注入计时器) |
| 032 风控契约化 | (risk) | risk_action_ledger | 事件 | 单元(夹具)·集成 |
| 062 泄露应急 | POST .../leak-response | RedeemBatch+RedeemCode | 双签 CAS+幂等+事件 | 集成(崩溃点) |
| 080 entitlements/me RLS | GET /entitlements/me | RLS | RLS | 集成(security) |
| 004 EXHAUSTED/EXPIRED | (派生/定时) | RedeemBatch | CAS+事件·注入时钟 | 集成 |
| 002/005 SoD | POST .../approve | RedeemBatch | CAS+RLS+事件 | 集成·单元 |

模式：写路径恒 ① CAS 守终态（single 一次性、shared 名额计数器、配额计数器、预算计数器、批次迁移）；外部触发恒 ③ 幂等键（principal+code_hash 真相键 / order+refund / code+reason）；隔离恒 ④ RLS（个人/租户谓词，fail-closed）；跨终态恒 ② 持久有序事件（outbox eventSeq，ledger DB 强制 append-only+哈希链）。钱/权益多步走 SERIALIZABLE；撞库/侧信道靠 044 规范化+L1+L3+高熵+恒定时间封装，checksum 仅降库压；风控信号/阈值/动作全契约化、确定性可断言；码明文仅经一次性受控通道、绝不落日志。

## 9. 落库建议（接 CLAUDE.md）

- 机制入 `ai-docs/architecture/`：reservation TTL+reaper、隔离级别矩阵、共享码全局名额计数器、批次预算计数器、跨批次叠加/互斥、clawback 负向冲正（兑换侧/充值侧双源）、对账分布式锁、异构 spec 原子事务、specVersion 版本化、账本哈希链 per-account 分段、码明文 HSM 派生+一次性导出通道。
- 硬约束入 `ai-docs/rules/`：checksum 定位（降库压非安全层）、输入规范化纯函数规范、SoD 矩阵、风控信号/阈值/动作契约化（含 reserveAbandonRate）、撞库分层、恒定时间响应封装、服务端真相源+幂等真相键、明文不落日志（隐私硬规则）、ledger DB 撤 UPDATE/DELETE+哈希链、档位 tier=max 不降级、负余额 shortfall 政策。
- 测试约定入 `ai-docs/testing/`：恒定时间「代码路径同一」断言模式、确定性夹具、隔离级别声明、可注入时钟、属性测试固定 seed+崩溃点枚举、security 层（日志 grep 明文=0 / DB UPDATE-DELETE 被拒 / 哈希链断裂检出 / 一次性链接 TTL）。
- 同步 `scripts/ai-docs/check-docs.mjs` requiredTerms 增补：`clawback`、`reservation TTL`、`preview 防撞库`、`恒定时间`、`SoD`、`specVersion`、`EXHAUSTED`、`分布式锁`、`共享码`、`validFrom`、`预算上限`、`append-only`、`明文不落日志`、`哈希链`、`tier=max`。
- **落库前 expert-audit 触发（评审契约）**：对 015/026/054/084 与既有 RedeemCode/RedeemBatch 状态机一致性触发一次 `expert-audit`，重点验：(a) 共享码名额计数器与单码 CAS 双模型并存不打架（type 路由互斥、reaper 同时回补两类计数器无串）；(b) 084 的 DB 撤 UPDATE/DELETE 不卡 053/054 的负向 INSERT clawback；(c) 018 预算计数器与 015 名额计数器在同一兑换事务内的加锁顺序无死锁。
- 待拍板（openDecisions）：见结构化输出清单。
