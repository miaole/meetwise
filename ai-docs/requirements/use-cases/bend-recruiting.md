---
id: requirements_uc_bend_recruiting
name: 用例 · B端招聘 入驻·席位·题库·匹配·隔离·录用
description: B端招聘 入驻·席位·题库·匹配·隔离·录用 业务用例与测试用例（正常/异常/特殊/逃逸/并发/复杂/刁钻七类，28 UC / 135 TC）。
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

# bend-recruiting 用例+测试用例（评审收口·最终版）

> **🔎 实现状态（对齐真实代码 · 2026-07）** — 本文是 TARGET 规格。**✅ 已实现+接线**：招聘方岗位发布（job_posting）、候选人投递/申请（job_application）、人才库、C↔B **多方 RLS 物理隔离**闭环（投递→招聘方看到申请人；e2e proof 覆盖，含 B 端 RLS）。**🟠 部分 / ⬜ 未建**：文内 TenantEnrollment 入驻验证全生命周期、席位配额状态机（seat frozen/reclaimed）、QuestionItem 双签核/发布/隔离题库、批量匹配排名、DSAR 全流程等多为规格；候选人 AI 面试复用同一面试引擎但 B 端专属评分/分数自报仍有缺口。招聘域骨架已建，整套 28 UC 未全部落地。

> 收口原则：①七类 case 每条 UC 必标且必有对应 TC（标签≠覆盖，缺 TC 即不合格）；②每条异常/刁钻流落到一个机制——**状态机迁移** 或 **四原语**（CAS / 幂等键 / RLS principal 绑定 / 持久有序事件日志 LOG）；③验收可测（量化阈值/确定性断言）；④测试层修正：fake-model 只验机制管道与状态流转，模型能力（抗越狱/危机识别/抗注入/bias）一律 ai-eval；确定性数据断言归集成/数据层。本版已吸收全部评审意见（①–⑤ + 必补清单）。

## 0. 总则（被各 UC 引用，避免一结论多处）

### 0.1 状态机清单（本域新增/对齐）
- **TenantEnrollment**：`pending_verification · verifying · verified · recheck_due · expired · rejected · suspended`。转移：`pending_verification→verifying`（提交/人工补件触发，写 `verify_due_at` TTL）；`verifying→verified|rejected`；`{pending_verification,verifying}→expired`（TTL 到期，定时器 CAS）；`verified→recheck_due`（周期复核触发器/执照到期）；`recheck_due→verified|suspended`；`*→suspended`（欠费/吊销）。
- **Membership**：`invited · active · suspended · removed`，附 **Role∈{owner,admin,member}**。不变量：每租户 **恰一个 active owner**（DB partial unique index `WHERE role='owner' AND status='active'`）。转移：`invited→active`（接受）；`active→suspended/removed`；`owner_transfer`（原 owner→admin 且 新 admin→owner，同一事务双 CAS）。
- **Seat（席位账）**：`seatQuota / seatUsed`，分配=CAS `seatUsed=seatUsed+1 WHERE seatUsed<seatQuota AND version=$v`。降配新增席位态 `seat: active · frozen · reclaimed`。
- **QuestionItem**：`imported · enriching · enriched · pending_signoff · published · quarantined · recalled · deprecated`，签核列 `tech_signed_by/at`、`hr_signed_by/at`（双签 CAS）；`content_version int`、`snapshot_id`。
- **InterviewSession（候选人 AI 面试）**：`created · active · waiting_user · completed · abandoned · failed · terminated_safety · under_review · terminated_consent`。
- **DSARRequest**：`requested · processing · partially_fulfilled · fulfilled · suspended_legal_hold`。
- **BillingOrder/Invoice**：`draft · pending_payment · paid · overdue · refunding · refunded · void`；**BillingAccount**：`active · grace · suspended`。
- **MatchJob**：`queued · running · partial · completed · failed`，证据绑定 `resume_snapshot_version`。
- **DecisionRecord**：append-only，`drafted · finalized`（finalized 不可改，仅可被新版本 supersede）。

### 0.2 LOG 原语自我验证（防篡改，支撑所有"追加式不可改/签核后偷改/时钟漂移"验收）
所有审计/同意/决策/成本账本采用 **hash 链 + 服务端权威时间戳 + WORM**：每条 `entry.hash = H(prev_hash || canonical_payload || server_ts)`，`server_ts` 来自 DB `now()` 不接受客户端时间；表仅授予 `INSERT`，无 `UPDATE/DELETE`（DB 角色权限 + 触发器拒改）。校验器周期重算链头一致。任何"签核后偷改/伪造时间"= 链断/权限拒，**可检测且不可成立**。

### 0.3 验收口径基线（把"达阈值"变可测，详见附录 A）
- bias：**反事实配对数据集**（同 JD 同能力、仅受保护属性翻转）+ 统计显著性（配对差均值 95% CI 不跨阈、最大组间分差 ≤ ε）。
- jailbreak/PII/crisis：固定版本 **golden set（规模与构成在附录 A 锁定）**，硬指标=拦截率/检出率下限 + 漏检率上限。
- 脱敏：**字段清单 + 序列化器粒度断言**（白名单序列化，非黑名单）。

### 0.4 跨租户隔离六类越权回归（被 ISO 引用）
IDOR / JWT 跨租 / 向量库（pgvector 命名空间）/ 缓存键 / LangGraph checkpoint / SSE，**+ 第六类：trace/审计/Langfuse 可观测性后台跨租户隔离**。全部 fail-closed 断言 0 行/0 命中。

---

## 1. 企业入驻 ENT

### UC-ENT-001 · 企业入驻与对公资质认证（含人工补件）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **角色**：企业管理员（待成为 owner）/ 审核系统 / 人工审核员
- **前置**：账号已实名；无同一统一社会信用代码的 verified 租户
- **触发**：提交对公资质（执照号、主体名、法人、对公凭证）
- **主流程**：1) RLS 建租户上下文；2) 资质入 `verifying`，写 `verify_due_at`；3) 对公信息**白名单序列化**入审计 LOG（仅存掩码+hash，明文进加密保险箱）；4) 自动核验通过→`verified`，建首个 Membership(owner, active)。

| 类 | flow | 场景 | 落点机制 | 后置/账本 |
|---|---|---|---|---|
| 正常 | N1 | 资质齐全自动通过 | 状态机 `verifying→verified` CAS | verified；audit_log(append) |
| 备选 | N2 | 自动不确定→转人工补件 | `verifying`(保持)+人工任务 | verifying；task_log |
| 异常 | EX1 | 核验三方超时/失败 | 降级见 ES1，不盲改态 | verifying；不入脏态 |
| 特殊 | SP1 | 中英双语主体名/i18n、首个租户空成员 | locale 规范化，owner 初始化幂等 | verified；唯一 owner 建立 |
| 逃逸 | ES1 | 三方核验依赖失效 | 降级人工通道（kill-switch 切手动）+ 可解释 pending | verifying；degrade_log |
| 高并发 | HC1 | 同一信用代码并发提交两份 | 唯一约束(credit_code) + CAS | 恰一进 verifying，另一 409 |
| 复杂 | CX1 | 补件多轮→通过（跨"补件→再核验"saga） | 每轮幂等键，状态在 verifying 内自旋 | 最终 verified，账本可回放 |
| 刁钻 | TR1 | 对公明文是否落日志明文 | 白名单序列化器（仅掩码可序列化） | 断言序列化产物零明文 |

- **验收**：①同信用代码并发→恰一 verifying；②审计 LOG 序列化产物对 {执照号,法人,对公账号} 命中=0 明文（仅掩码`5****`+hash）；③核验失败 → 仍 `verifying`，不产生 verified；④首租户 owner 唯一且 active。
- **关联**：契约 `POST /tenants/enroll`；状态机 TenantEnrollment、Membership；原语 CAS+幂等+RLS+LOG；安全：对公 PII 脱敏白名单。

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-001-N1 | 集成 | 齐全资质→verified，建 owner Membership 1 条 |
| TC-ENT-001-SP1 | 单元 | i18n 主体名规范化幂等；空成员组 owner 初始化恰一次 |
| TC-ENT-001-ES1 | 集成 | mock 三方失败→停在 verifying，无 verified，写 degrade_log |
| TC-ENT-001-HC1 | 集成 | 并发同 credit_code 两请求→1 成功 1×409，DB 仅 1 行 |
| TC-ENT-001-CX1 | 集成 | 两轮补件 saga→最终 verified，账本顺序可重放 |
| TC-ENT-001-TR1 | 集成/数据 | 审计行序列化 JSON 全文正则扫 {执照号/法人/账号} 明文命中=0 |

### UC-ENT-002 · 企业注销 offboarding（in-flight 阻断 + 欠费阻断 purge）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **角色**：owner / 系统
- **前置**：租户 verified；触发注销
- **主流程**：1) 租户置 `suspended`(冻结写入)；2) 校验无 in-flight（在跑面试/匹配/导出/未结账单）；3) 进入数据保留期 `retention`；4) 期满 purge。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 无 in-flight→suspended→retention | 状态机迁移 | suspended |
| 异常 | EX1 | purge 中部分失败回滚 | saga 补偿 + 幂等键 | retention 保持，重试不重删 |
| 特殊 | SP1 | 空租户（无任何数据）注销 | 直接终态，幂等 | purged |
| 逃逸 | ES1 | 注销误触→保留期内可撤销恢复 | `suspended→verified` 人工接管回路 | verified 恢复 |
| 高并发 | HC1 | 注销同时并发邀请成员/起新面试 | 写冻结门 + 状态守卫拒入 | 新写一律 409 |
| 复杂 | CX1 | offboarding 与多聚合 in-flight 并存 | 见 UC-ISO-003 混合并发 | 阻断至全部 in-flight 收口 |
| 刁钻 | TR1 | 欠费时强行 purge 逃避结算 | 欠费门：`account≠active` 阻断 purge | purge 拒绝，转 COMMERCE |

- **验收**：①有 in-flight→注销阻断且列出阻断源；②欠费(account∈{grace,suspended})→purge 拒绝；③保留期内可恢复→verified；④purge 重试幂等，无二次删除副作用。
- **关联**：契约 `POST /tenants/:id/offboard`；状态机 TenantEnrollment+BillingAccount；原语 CAS+幂等+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-002-N1 | 集成 | 无 in-flight→suspended→retention |
| TC-ENT-002-EX1 | 集成 | purge 中断重试→对账无重复删除 |
| TC-ENT-002-ES1 | 集成 | 保留期内恢复→verified，数据完好 |
| TC-ENT-002-HC1 | 集成 | suspended 后并发邀请/起面试全 409 |
| TC-ENT-002-TR1 | 集成 | account=overdue→purge 被欠费门拒绝 |

### UC-ENT-003 · 资质周期复核 + pending TTL（新增·机制补全）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **角色**：定时器系统 / 人工审核员 / owner
- **前置**：存在 verified 租户（执照有有效期）/ 或僵尸 pending|verifying
- **主流程**：1) 周期作业扫描到期执照→`verified→recheck_due`；2) 通知补件，写 `recheck_due_at` TTL；3) 通过→verified，逾期→suspended。僵尸 `{pending_verification,verifying}` 超 TTL → `expired`。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 到期复核通过 | `recheck_due→verified` CAS | verified |
| 异常 | EX1 | 复核中三方失败 | 不盲改，停 recheck_due | recheck_due 保持 |
| 特殊 | SP1 | 执照恰当日到期边界/时区 | 权威 server 日期判定 | 边界确定 |
| 逃逸 | ES1 | 复核全面失效→降级宽限期再复核 | grace 窗 + 人工接管 | recheck_due+grace |
| 高并发 | HC1 | 定时器与人工补件并发推进同租户 | 状态 CAS 恰一推进 | 0 行落败回查 |
| 复杂 | CX1 | 复核失败→suspended→影响在跑面试 | 级联：触发 in-flight 安全收尾 | suspended + 会话保全 |
| 刁钻 | TR1 | 僵尸 pending 永不补传占位 | TTL 定时器 `→expired` | expired，可重新入驻 |

- **验收**：①执照到期 N 天→自动 recheck_due 且通知；②逾期未复核→suspended；③pending/verifying 超 TTL→expired；④定时器与人工并发→恰一迁移成功。
- **关联**：契约 `internal cron`/`POST /tenants/:id/recheck`；状态机 TenantEnrollment；原语 CAS+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-ENT-003-N1 | 集成 | 到期触发 recheck_due |
| TC-ENT-003-SP1 | 单元 | 时区/当日边界用 server 日期判定确定 |
| TC-ENT-003-TR1 | 集成 | verifying 超 TTL→expired（定时器 CAS 0/1） |
| TC-ENT-003-HC1 | 集成 | 定时器+人工并发→恰一成功，另一 0 行 |
| TC-ENT-003-ES1 | 集成 | 复核依赖失效→grace 宽限不立即 suspend |

---

## 2. 成员席位 SEAT

### UC-SEAT-001 · 成员邀请与席位占用
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **角色**：admin/owner（邀请人）/ 被邀人
- **主流程**：1) 校验 seatUsed<seatQuota（CAS 占席）；2) 发邀请（幂等键=tenant+email）；3) 接受→Membership active。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 邀请→接受占席 | seat CAS + 状态机 | active，seatUsed+1 |
| 异常 | EX1 | 接受失败→释放预占席 | CAS 回滚 + 幂等 | invited 撤销，seatUsed 不漏 |
| 特殊 | SP1 | 首个成员/已离职邮箱/i18n 邀请文案 | locale + 幂等键 | 单条邀请 |
| 逃逸 | ES1 | 邮件服务失效→生成可复制邀请链接降级 | fallback 通道 | invited 仍成立 |
| 高并发 | HC1 | 最后一个空席双击/两 admin 并发邀请 | seatUsed CAS `<quota` | 恰一占席，另一 409 满员 |
| 复杂 | CX1 | 邀请→接受→跨租户已是他租成员 | 多租 Membership 隔离校验 | 仅本租建关系 |
| 刁钻 | TR1 | 伪造邀请 token 跨租接受 | RLS + token 绑定 tenant | 0 行→404 |

- **验收**：①最后一席并发→恰一成功；②重复邀请同 email→1 条；③接受失败 seatUsed 回滚；④跨租伪造 token→404。
- **关联**：契约 `POST /tenants/:id/invitations`；原语 CAS+幂等+RLS。

| TC | 层 | 断言 |
|---|---|---|
| TC-SEAT-001-HC1 | 集成 | 满席并发→1 成功 1×409，seatUsed≤quota |
| TC-SEAT-001-EX1 | 集成 | 接受失败→seatUsed 复原 |
| TC-SEAT-001-SP1 | 单元 | 重复邀请幂等→1 条；i18n 文案按 locale |
| TC-SEAT-001-ES1 | 集成 | 邮件失效→降级链接，invited 成立 |
| TC-SEAT-001-TR1 | 集成 | 伪造 token 跨租接受→404，0 行 |

### UC-SEAT-002 · 成员移除（最后 admin/owner 守卫）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) 校验非"最后管理者"不变量；2) `active→removed` CAS；3) 释放席位。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 移除普通成员 | 状态机 + seat 释放 | removed |
| 异常 | EX1 | 移除时其有 in-flight 面试 | 阻断或交接，不裸删 | 阻断/转交后再 removed |
| 特殊 | SP1 | 移除已 suspended 成员 | 幂等 | 终态稳定 |
| 逃逸 | ES1 | 误移除→撤销恢复 | `removed→active`（保留窗）人工接管 | active 恢复 |
| 高并发 | HC1 | 并发移除最后两 admin | 计数 CAS + owner 唯一 index | 至少留一管理者 |
| 复杂 | CX1 | 移除 owner（非法，需转移） | 守卫拒绝→引导 SEAT-004 | 拒绝 |
| 刁钻 | TR1 | 移除最后 admin 绕守卫 | 服务端再校验（前端预校验不可信） | 拒绝 |

- **验收**：①移除最后管理者→拒绝；②并发移除→不变量恒成立（≥1 active 管理者、恰 1 owner）；③removed 释放席位。
- **关联**：契约 `DELETE /tenants/:id/members/:mid`；状态机 Membership；原语 CAS+RLS+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-SEAT-002-N1 | 集成 | 普通成员移除→seatUsed-1 |
| TC-SEAT-002-HC1 | 集成 | 并发移除→不变量 ≥1 管理者恒真 |
| TC-SEAT-002-CX1 | 单元 | 移除 owner→守卫拒绝 |
| TC-SEAT-002-TR1 | 集成 | 直接 API 绕前端→服务端守卫拒绝 |
| TC-SEAT-002-EX1 | 集成 | 有 in-flight→阻断/交接后才 removed |

### UC-SEAT-003 · SCIM 同步（含首次全量空组）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) 接收 SCIM 批；2) diff→建/停/改 Membership（每条幂等键=externalId）；3) 占/释席位。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 增量同步 | 幂等 upsert | 一致 |
| 异常 | EX1 | 批中途失败 | 逐条幂等，部分提交可重放 | 已成不回退，重放补齐 |
| 特殊 | SP1 | **首次全量空组**（0 用户） | 空集幂等，不误删本地 | 无副作用 |
| 逃逸 | ES1 | IdP 不可达→暂停同步保留现状 | kill-switch 暂停 | 现状冻结 |
| 高并发 | HC1 | SCIM 批与人工邀请并发同一人 | externalId 幂等 + CAS | 单一 Membership |
| 复杂 | CX1 | 大批量超席位配额 | 超额置 pending，不破 quota | 部分 active+部分 pending |
| 刁钻 | TR1 | 重放旧 SCIM 批（时钟漂移） | 版本/序号单调拒回放 | 旧批被拒 |

- **验收**：①首次空组→不删除本地既有/无异常；②重复批→0 重复成员；③超配额→不突破 seatQuota。
- **关联**：契约 `SCIM /Users`；原语 幂等+CAS+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-SEAT-003-SP1 | 集成 | 首次全量空组→本地无删除、无报错 |
| TC-SEAT-003-EX1 | 集成 | 中断重放→无重复、补齐缺口 |
| TC-SEAT-003-HC1 | 集成 | SCIM+人工并发→单 Membership |
| TC-SEAT-003-CX1 | 集成 | 超配额→pending，不破 quota |
| TC-SEAT-003-TR1 | 单元 | 旧批序号回放→拒绝 |

### UC-SEAT-004 · owner 转移与唯一性（新增·治理生死线）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **角色**：现 owner / 目标 admin / 平台风控（盗号回收）
- **主流程**：1) 校验目标为本租 active 成员；2) **同一事务双 CAS**：`old owner→admin` 且 `target→owner`；3) partial unique index 保证全程恰一 active owner。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | owner 主动转移 | owner_transfer 双 CAS + 唯一 index | 新 owner 唯一 |
| 异常 | EX1 | 转移中目标侧失败 | 事务整体回滚 | 原 owner 不变 |
| 特殊 | SP1 | 转移给跨 locale 账号/二次确认 | 强 MFA 二次确认 | 确认后生效 |
| 逃逸 | ES1 | owner 离职失联→管理员发起平台仲裁回收 | 人工接管回路 + 审计 | 回收授新 owner |
| 高并发 | HC1 | 两个 admin 并发抢 owner | 唯一 index + CAS | 恰一成功 |
| 复杂 | CX1 | 转移与 SEAT-002 移除原 owner 并发 | 状态守卫顺序化 | 不出现 0 owner |
| 刁钻 | TR1 | 转移给已离职/removed 成员；盗号者转给自己 | 守卫=目标 active + 风控验证 | 拒绝 |

- **验收**：①任意时刻 active owner 数恒=1（并发下亦然）；②转给 removed/非本租→拒绝；③盗号回收走仲裁且全程留 LOG；④转移失败原子回滚。
- **关联**：契约 `POST /tenants/:id/owner-transfer`；状态机 Membership(owner_transfer)；原语 CAS+RLS+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-SEAT-004-N1 | 集成 | 转移后唯一 active owner，原 owner→admin |
| TC-SEAT-004-HC1 | 集成 | 两 admin 并发抢→恰一成功，owner 计数恒=1 |
| TC-SEAT-004-CX1 | 集成 | 转移+移除原 owner 并发→无 0-owner 窗口 |
| TC-SEAT-004-TR1 | 单元 | 目标 removed/跨租→守卫拒绝 |
| TC-SEAT-004-EX1 | 集成 | 目标侧失败→事务回滚，状态不变 |
| TC-SEAT-004-ES1 | 集成 | 仲裁回收→新 owner，链式审计完整 |

### UC-SEAT-005 · 席位降配处置（新增）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **触发**：套餐降级使 `seatQuota < seatUsed`
- **主流程**：1) 计算超额 = seatUsed−newQuota；2) 超额席位置 `frozen`（按 LRU/管理员指定，**禁冻最后 owner/admin**）；3) frozen 成员只读/不可计费操作；4) owner 7 日内重选保留谁→其余 `reclaimed`。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 超额冻结+人工重选 | seat `active→frozen→reclaimed` CAS | quota 内一致 |
| 异常 | EX1 | 重选过程失败 | 幂等重放，frozen 不误 reclaim | 可恢复 |
| 特殊 | SP1 | newQuota=0 边界/恰等于 used | 边界守卫，至少留 owner | 守卫成立 |
| 逃逸 | ES1 | 未在窗口处置→默认冻结不删，可补 | 宽限保留 + 提醒 | frozen 不丢数据 |
| 高并发 | HC1 | 降配同时有人接受邀请占席 | seatUsed CAS 拒超额 | 不超 newQuota |
| 复杂 | CX1 | 降配 + 在跑面试归属 frozen 成员 | 面试转交/保全，不中断结果 | 结果保全 |
| 刁钻 | TR1 | 冻结后偷偷调 API 以 frozen 席发起计费操作 | 状态守卫拒 frozen 写 | 拒绝 |

- **验收**：①降配后 active 席 ≤ newQuota；②owner/最后 admin 不被冻结；③frozen 成员计费类操作被拒；④数据不因降配被删（仅 frozen/reclaim）。
- **关联**：契约 `webhook plan-change`；状态机 Seat；原语 CAS+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-SEAT-005-N1 | 集成 | 降配→超额 frozen，active≤newQuota |
| TC-SEAT-005-SP1 | 单元 | newQuota 边界→owner 不冻结 |
| TC-SEAT-005-HC1 | 集成 | 降配+占席并发→不超 newQuota |
| TC-SEAT-005-TR1 | 集成 | frozen 席发起计费操作→守卫拒绝 |
| TC-SEAT-005-CX1 | 集成 | frozen 成员在跑面试→转交保全不中断 |

---

## 3. 题库生命周期 QB

### UC-QB-001 · 题库导入（中英混排/超大文件分片）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) 上传→分片摄取；2) 解析入 `imported`（每条 import_key 幂等）；3) 去重。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 标准 CSV/JSON 导入 | 幂等 upsert | imported |
| 异常 | EX1 | 分片中途失败 | 分片幂等键，断点续传 | 已入不重，缺片补 |
| 特殊 | SP1 | **中英混排/超大文件分片**、空文件 | 分片+编码规范化（确定性） | 全量入库无乱码 |
| 逃逸 | ES1 | 解析器对畸形行→隔离行不阻断整批 | 坏行入 quarantine 区降级 | 好行入库 |
| 高并发 | HC1 | 同文件并发上传两次 | import_batch 幂等键 | 单批 |
| 复杂 | CX1 | 多批合并去重跨批 | 内容指纹去重 | 无重复题 |
| 刁钻 | TR1 | CSV 公式注入/超长字段/编码炸弹 | 输入消毒+长度门+解码限额 | 拒危险行 |

- **验收**：①超大文件分片全量入库且条数=源；②中英混排无乱码（编码确定性断言）；③重复上传→单批；④CSV 注入行被消毒/隔离。
- **关联**：契约 `POST /question-banks/:id/import`；原语 幂等+LOG；安全：导入内容为不可信输入。

| TC | 层 | 断言 |
|---|---|---|
| TC-QB-001-SP1 | 集成/数据 | 1GB 分片导入条数=源；UTF-8/GBK 混排无乱码 |
| TC-QB-001-EX1 | 集成 | 分片中断续传→无重无漏 |
| TC-QB-001-HC1 | 集成 | 并发同文件→单 batch |
| TC-QB-001-TR1 | 单元 | `=cmd()`/超长字段→消毒或隔离 |

### UC-QB-002 · 裸题 AI 富化（注入隔离）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) `imported→enriching`；2) ai-runtime invoke 富化（题干/标签/标准解）→ coerce→schema→业务校验（标签合法、难度域、无幻觉）；3) `→enriched`。

| 类 | flow | 机制/层 | 后置 |
|---|---|---|---|
| 正常 | N1 | 富化通过双校验 | invoke 双校验 + 状态机 | enriched |
| 异常 | EX1 | schema 失败/瞬时失败 | 分类重试，确定性拒不重试 | 重试或降级 |
| 特殊 | SP1 | 极短裸题/纯代码题/i18n | 富化 fixture 确定性 | enriched |
| 逃逸 | ES1 | 模型持续拒答→降级人工富化 | fallback 人工通道 | 不卡死 |
| 高并发 | HC1 | 同题并发富化 | turn 幂等键 | 单次落账 |
| 复杂 | CX1 | 批量富化部分失败 | 子任务 `(runId,itemId,attempt)` 幂等 | 部分成功可续 |
| 刁钻 | TR1（管道） | 裸题内嵌"忽略指令/越权"提示 | **数据块隔离**：用户内容入 data block 不拼系统指令 | 指令不生效（管道成立） |
| 刁钻 | TR2（能力） | 真实抗注入 | **ai-eval** golden 注入集 | 注入命中率≤上限 |

- **验收**：①富化输出过双校验，非法标签/越界难度→拒；②注入题干不改变系统指令（管道）；③真实模型抗注入达附录 A 阈值（ai-eval）。
- **关联**：契约 内部 invoke；原语 幂等；不变量：双校验、数据块隔离；安全：结构化输出与注入防护。

| TC | 层 | 断言 |
|---|---|---|
| TC-QB-002-N1 | graph-fake-model | 富化→schema+业务校验通过→enriched |
| TC-QB-002-EX1 | graph-fake-model | schema 失败一次→重试成功；确定性拒→不重试 |
| TC-QB-002-TR1 | graph-fake-model | 注入题干→系统指令不变（数据块隔离管道成立） |
| TC-QB-002-TR2 | ai-eval | 真模型注入 golden 集→越权命中率≤阈值（附录 A） |
| TC-QB-002-HC1 | 集成 | 同题并发富化→单次计费/落账 |

### UC-QB-003 · 采纳 tech+HR 双签（签核后偷改/时钟漂移）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) `enriched→pending_signoff`；2) tech 签（CAS 写 `tech_signed_by/at`，server_ts）；3) HR 签；4) 两签齐→`pending_signoff→published`（守卫=双签非空）。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 双签→发布 | 双签 CAS + 守卫 | published |
| 异常 | EX1 | 仅单签即试图发布 | 守卫拒（双签非空） | 保持 pending_signoff |
| 特殊 | SP1 | 同一人兼 tech+HR 角色 | 职责分离守卫拒同签 | 拒绝/需第二人 |
| 逃逸 | ES1 | 签核服务故障→草稿冻结不误发 | fail-closed 不发布 | pending 保持 |
| 高并发 | HC1 | tech/HR 同时点签 | 各自字段 CAS | 两签幂等落定 |
| 复杂 | CX1 | 签后内容变更需重新签 | 内容指纹变→签失效，回 enriched | 重新双签 |
| 刁钻 | TR1 | 签核后偷改题面/伪造签署时间 | **LOG hash 链 + server_ts WORM**（0.2） | 链断/拒改可检测 |

- **验收**：①缺任一签→不可 published；②同一人不能双签；③published 后改内容→触发重签且 hash 链检出原签失效；④签署时间用 server_ts，伪造客户端时间无效。
- **关联**：契约 `POST /questions/:id/signoff`；状态机 QuestionItem；原语 CAS+LOG（hash 链）。

| TC | 层 | 断言 |
|---|---|---|
| TC-QB-003-N1 | 集成 | 双签齐→published |
| TC-QB-003-EX1 | 单元 | 单签发布→守卫拒 |
| TC-QB-003-SP1 | 单元 | 同人双签→拒 |
| TC-QB-003-HC1 | 集成 | tech/HR 并发签→两字段幂等落定 |
| TC-QB-003-TR1 | 集成/数据 | 偷改 payload→hash 链校验失败；客户端伪造 ts 被 server_ts 覆盖 |

### UC-QB-004 · PII 泛化（不可逆向 + 误伤质量门）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) 发布前扫描题面/答案 PII；2) 泛化（实体→占位符），映射表加密存储（KMS 管控、访问审计）；3) 质量门校验题意未失真。

| 类 | flow | 机制/层 | 后置 |
|---|---|---|---|
| 正常 | N1 | 检出并泛化 | 泛化管道 + 状态机 | 发布集 PII=0 |
| 异常 | EX1 | 泛化失败 | fail-closed 不发布 | 阻断发布 |
| 特殊 | SP1 | 跨语种 PII/无 PII 题 | i18n 识别 | 正确放行/泛化 |
| 逃逸 | ES1 | 扫描器失效→默认不发布降级人工 | kill-switch | 不泄露 |
| 高并发 | HC1 | 并发发布同题 | 幂等 | 单次 |
| 复杂 | CX1 | 映射表密钥轮转 | KMS 轮转 + 访问审计 | 可解密授权内 |
| 刁钻 | TR1（确定性） | published 集全文扫描 PII | **集成/数据层**：全量正则+实体扫描命中=0 | 0 命中 |
| 刁钻 | TR2（对抗） | 变体/谐音/拆分 PII 规避检测 | **ai-eval** 对抗样本检出率 | 检出率≥阈值 |
| 刁钻 | TR3 | 误伤：普通词被当公司名抹除致题意失真 | 质量门指标（语义保真）门槛 | 失真率≤阈值 |

- **验收**：①published 集 PII 全文扫描命中=0（确定性）；②对抗变体检出率≥阈值、漏检≤上限（ai-eval，附录 A）；③映射表加密+访问审计，逆向需授权且留痕；④泛化误伤致题意失真率≤质量门阈值。
- **关联**：契约 发布前置 gate；原语 幂等+LOG；安全：PII 不可逆向、密钥管理。

| TC | 层 | 断言 |
|---|---|---|
| TC-QB-004-N1 | 集成 | 含 PII 题→泛化后入库 |
| TC-QB-004-pii-scan | 集成/数据 | published 全集正则+实体扫描 PII 命中=0（确定性，**非 ai-eval**） |
| TC-QB-004-adversarial | ai-eval | 对抗 PII golden 集→检出率≥阈值、漏检≤上限 |
| TC-QB-004-TR3 | ai-eval | 质量门：泛化后题意保真度≥阈值（误伤率≤上限） |
| TC-QB-004-CX1 | 集成 | 密钥轮转后授权可解、非授权访问被审计拒 |
| TC-QB-004-ES1 | 集成 | 扫描器失效→fail-closed 不发布 |

### UC-QB-005 · 版本 pin + 泄题 kill-switch + 快照
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) 面试引用题目时 pin 到 `content_version`+`snapshot_id`；2) 泄题情报→`published→quarantined`（kill-switch）；3) 受影响面试改用替补题。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | pin 版本快照引用 | snapshot + version | 引用稳定 |
| 异常 | EX1 | 引用已被改题 | pin 快照不漂移 | 用 pinned 版本 |
| 特殊 | SP1 | 题被 deprecated 但旧面试已 pin | 快照保留 | 旧面试可读 |
| 逃逸 | ES1 | 泄题 kill-switch | `published→quarantined` | 立即停用 |
| 高并发 | HC1 | quarantine 与并发抽题 | 状态守卫拒抽 quarantined | 不再发出 |
| 复杂 | CX1 | quarantine 后在跑面试替补 | 替补题 saga | 面试不中断 |
| 刁钻 | TR1 | 通过缓存/向量库取回已下架题 | 全路径状态校验+缓存失效 | 取不到 |

- **验收**：①引用恒用 pinned 快照，改题不影响在跑面试；②kill-switch 后该题 0 次新发出（含缓存/向量路径）；③在跑面试自动替补不中断。
- **关联**：契约 `POST /questions/:id/quarantine`；状态机 QuestionItem；原语 CAS+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-QB-005-N1 | 集成 | pin 后改题→面试读 pinned 版本 |
| TC-QB-005-ES1 | 集成 | quarantine→新抽题 0 次该题 |
| TC-QB-005-TR1 | 集成 | 缓存/向量路径取下架题→0 命中 |
| TC-QB-005-CX1 | 集成 | quarantine 在跑面试→替补不中断 |

### UC-QB-006 · 已发布题目纠错召回（新增）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **触发**：发现 published 题"标准解错误"
- **主流程**：1) `published→recalled`（kill 旧版）；2) 新版本经富化+双签→新 published version；3) 已用该题面试结果重算策略：未完成→换新版；已完成→标记"受影响"并按策略重评/标注。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 召回+发新版 | `published→recalled`+新 version 双签 | 新版生效 |
| 异常 | EX1 | 重算批部分失败 | 子任务幂等 + 状态标记 | 可续算 |
| 特殊 | SP1 | 错误题从未被任何面试用过 | 仅版本切换无重算 | 直接替换 |
| 逃逸 | ES1 | 重算不可行→标注"该题不计分"降级 | 评分剔除 + 可解释 | 结果可信化 |
| 高并发 | HC1 | 召回时该题正被抽中作答 | 状态守卫+在跑替补 | 不发旧版 |
| 复杂 | CX1 | 已完成报告依赖该题分→报告重生成 | 触发 report 重生成（限流见 AIIV-004） | 报告更新留痕 |
| 刁钻 | TR1 | 重算被用于"洗高/洗低"特定候选人分 | 重算策略对全体一致 + LOG | 无选择性篡改 |

- **验收**：①召回后旧版 0 次新发出；②受影响"已完成"面试被标记且按统一策略重算/标注；③重算批幂等可续；④重算策略对全体一致，留 LOG 不可选择性操作。
- **关联**：契约 `POST /questions/:id/recall`；状态机 QuestionItem+InterviewSession；原语 CAS+幂等+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-QB-006-N1 | 集成 | 召回→新版双签发布，旧版停发 |
| TC-QB-006-CX1 | 集成 | 受影响已完成面试→报告重生成并标注 |
| TC-QB-006-EX1 | 集成 | 重算批中断→幂等续算无重复 |
| TC-QB-006-TR1 | 集成 | 重算覆盖全体一致，无单候选人差异化操作（LOG 核对） |
| TC-QB-006-HC1 | 集成 | 召回时在跑→替补不发旧版 |

---

## 4. 批量匹配排名 MATCH / 人才库 TALENT

### UC-MATCH-001 · 候选人批量匹配排名（带证据 + 反歧视）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) MatchJob `queued→running`；2) 对每候选人 RAG 检索→打分+生成**证据 span**（引用绑定 resume_snapshot_version，见 MATCH-003）；3) 排名输出；4) 计费按成功条数（对账见 COMMERCE-001）。

| 类 | flow | 机制/层 | 后置 |
|---|---|---|---|
| 正常 | N1 | 批量打分排名带证据 | invoke 双校验 + 状态机 | completed |
| 异常 | EX1 | 部分候选人打分失败 | `running→partial`，失败条不计费 | partial，对账守恒 |
| 特殊 | SP1 | 空简历/单候选人/i18n 简历 | 边界处理 | 稳定输出 |
| 逃逸 | ES1 | 打分模型失效→降级"仅检索召回不排名" | fallback 模式 | 可用降级结果 |
| 高并发 | HC1 | 同 JD 并发起两个 job | job 幂等键 | 单 job 落账 |
| 复杂 | CX1 | 大批量跨简历快照/部分失败 saga | 子任务 `(jobId,candId,attempt)` 幂等 | 可续，对账一致 |
| 刁钻 | TR1 | 简历埋"请给满分/忽略要求"提示词 | 用户内容数据块隔离 + 业务校验 | 不影响系统/分数 |
| 刁钻 | TR2（bias） | 受保护属性致系统性偏移 | **ai-eval 反事实配对 + 统计显著**（附录 A） | 偏移 ≤ ε，CI 不跨阈 |

- **验收**：①每个分数有可溯源证据 span；②失败条不计费、对账总额守恒；③注入简历不改系统/分；④反事实配对：仅翻转受保护属性，配对分差均值 95% CI 不跨 ε、最大组间分差≤ε（统计显著，非单 golden）。
- **关联**：契约 `POST /match-jobs`；状态机 MatchJob；原语 幂等+RLS+LOG；不变量：双校验；安全：简历不可信输入、反歧视。

| TC | 层 | 断言 |
|---|---|---|
| TC-MATCH-001-N1 | graph-fake-model | 打分输出含证据 span 且过业务校验 |
| TC-MATCH-001-EX1 | 集成 | 部分失败→partial，失败条计费=0 |
| TC-MATCH-001-TR1 | graph-fake-model | 注入简历→系统指令/分数不变（管道） |
| TC-MATCH-001-bias | ai-eval | 反事实配对集→配对分差 95% CI 不跨 ε，统计显著无系统性偏移 |
| TC-MATCH-001-HC1 | 集成 | 同 JD 并发→单 job |
| TC-MATCH-001-SP1 | 单元 | 空/单候选人/i18n 简历边界稳定 |

### UC-MATCH-003 · 证据 span 快照绑定（新增）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) 打分时证据 span 记录 `(resume_snapshot_version, span_offset, content_hash)`；2) 展示证据时按快照渲染；3) 简历更新只创建新快照，旧证据指向旧快照不漂移。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 证据绑定快照 | snapshot + version CAS | 可溯源 |
| 异常 | EX1 | 简历更新后旧证据 | 指向旧快照不失效 | 证据稳定 |
| 特殊 | SP1 | 快照缺失/被删（保留期内） | 快照保留窗 | 可读 |
| 逃逸 | ES1 | 快照不可读→证据降级为"原文已变更"标注 | 降级标注 | 不静默错配 |
| 高并发 | HC1 | 打分时简历正被更新 | 快照在打分起点冻结 | 一致快照 |
| 复杂 | CX1 | 多 job 引用同简历不同快照 | 各 pin 各快照 | 互不串 |
| 刁钻 | TR1 | 改简历后宣称"证据造假" | content_hash 校验匹配快照 | 证据可证一致 |

- **验收**：①每证据 span 可定位到具体快照版本；②简历更新后旧证据仍指向打分时快照、不漂移；③content_hash 校验证据与快照一致。
- **关联**：契约 `GET /match-jobs/:id/evidence`；原语 CAS+快照+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-MATCH-003-N1 | 集成 | 证据携带 snapshot_version + hash |
| TC-MATCH-003-EX1 | 集成 | 简历更新后旧证据指向旧快照不变 |
| TC-MATCH-003-HC1 | 集成 | 打分中并发改简历→证据用冻结快照 |
| TC-MATCH-003-TR1 | 单元 | content_hash 校验证据-快照一致 |

### UC-TALENT-001 · 人才库（隔离存储 + 同意约束）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) 候选人入库（绑 tenant + 同意范围）；2) 检索/标签；3) 同意撤回则移出可检索面。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 入库+检索 | RLS tenant 绑定 | 在库 |
| 异常 | EX1 | 入库部分字段缺 | 校验拒/补 | 不脏写 |
| 特殊 | SP1 | 同一候选人多租户存在 | 各租独立隔离 | 互不可见 |
| 逃逸 | ES1 | 检索索引失效→降级精确查 | fallback | 可用 |
| 高并发 | HC1 | 并发入库同候选 | 幂等键 | 单条 |
| 复杂 | CX1 | 撤回同意→移出+下游清理 saga | 事件驱动级联 | 一致 |
| 刁钻 | TR1 | A 租检索看到 B 租人才/向量串号 | RLS + 向量命名空间隔离 | 0 命中 |

- **验收**：①跨租检索 0 命中（含向量）；②撤回同意→该候选人移出可检索面且下游清理；③重复入库单条。
- **关联**：契约 `/talent-pool`；原语 RLS+幂等+LOG；安全：同意范围。

| TC | 层 | 断言 |
|---|---|---|
| TC-TALENT-001-TR1 | 集成 | A 租检索 B 租人才/向量→0 命中 |
| TC-TALENT-001-CX1 | 集成 | 撤回→移出可检索+下游清理 |
| TC-TALENT-001-HC1 | 集成 | 并发入库→单条 |
| TC-TALENT-001-SP1 | 集成 | 跨租同候选→互不可见 |

---

## 5. 候选人 AI 面试 AIIV

### UC-AIIV-001 · 候选人 AI 面试（可中断可恢复 + 语音降级）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) 候选人同意后 `created→active`；2) threadId=sessionId，状态持久于 Postgres checkpoint；3) `waiting_user` 经 interrupt 持久化等待；4) 语音转写→文本→评估→`answer_evaluated` 事件（LOG seq）；5) `completed`。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 全程作答完成 | 状态机 + LOG seq | completed |
| 异常 | EX1 | 评估 schema 失败 | 重试分类 | 重试/降级 |
| 特殊 | SP1 | **语音转写失败→降级文字输入** | 转写降级通道 | 不中断 |
| 逃逸 | ES1 | 模型不可用→保存进度安全暂停 | interrupt 持久化 + 可解释 | waiting_user 持久 |
| 高并发 | HC1 | 双击提交/并发 resume | 答案幂等键 + thread 租约 CAS | 恰一推进 |
| 复杂 | CX1 | **停 3 天后 resume**（长会话） | Postgres checkpoint（非内存 Map） | 同 threadId 续跑 |
| 刁钻 | TR1 | resume 时窃用他人 threadId | RLS principal 绑定 checkpoint | 0 行→404 |

- **验收**：①语音失败→自动降级文字、会话不终止；②停 3 天 resume→同 threadId 从断点续、不丢事件；③双击/并发 resume→恰一推进；④跨用户 resume→404；⑤checkpoint 读写带 principal。
- **关联**：契约 `POST /interviews/:id/answer`、`GET .../events`；状态机 InterviewSession；原语 CAS+幂等+RLS+LOG；不变量：持久态等待、checkpoint 隔离。

| TC | 层 | 断言 |
|---|---|---|
| TC-AIIV-001-SP1 | 集成 | 转写失败→降级文字路径，session 不 fail |
| TC-AIIV-001-CX1 | graph-fake-model | 停 3 天（推进时钟）resume→同 threadId 续，事件 seq 连续 |
| TC-AIIV-001-HC1 | 集成 | 双击+并发 resume→恰一推进，thread 租约拒并发 |
| TC-AIIV-001-TR1 | 集成 | 他人 threadId resume→404，checkpoint 0 行 |
| TC-AIIV-001-EX1 | graph-fake-model | schema 失败→重试；确定性拒→降级 |

### UC-AIIV-002 · 候选人面试安全护栏（越狱/危机/辱骂/造假）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) 每轮输入过安全分类；2) 命中类别（越狱/辱骂/危机自伤/造假诱导）按策略处置；3) 危机→`active→terminated_safety` + 危机资源提示。

| 类 | flow | 机制/层 | 后置 |
|---|---|---|---|
| 正常 | N1 | 正常作答放行 | 状态机 | 继续 |
| 异常 | EX1 | 分类器调用失败 | **保守拦截**（fail-safe）+ 转申诉(AIIV-003) | 暂拦，有回路 |
| 特殊 | SP1 | 多语种辱骂/边界轻微 | i18n 分类阈值 | 按级处置 |
| 逃逸 | ES1 | 危机自伤识别 | `→terminated_safety` + 资源 + 人工通道 | 安全终止 |
| 高并发 | HC1 | 连发多条触发 | 每轮幂等 + 状态守卫 | 一次终止 |
| 复杂 | CX1 | 造假诱导跨多轮累积 | 累积信号 + 业务校验 | 标记不采信 |
| 刁钻 | TR1（管道） | 越狱"忽略规则" | 数据块隔离 + 安全标记触发状态流转 | terminated/拦截标记成立 |
| 刁钻 | TR2（能力） | 真实抗越狱/危机识别能力 | **ai-eval** 越狱集 + 危机集 | 拦截率/识别率≥阈值 |

- **验收**：①危机识别→terminated_safety + 危机资源 + 不继续追问；②分类器故障→保守拦截且生成申诉入口（不死胡同）；③越狱注入不改系统指令（管道）；④真实抗越狱拦截率≥阈值、危机识别召回≥阈值（ai-eval，附录 A）；⑤安全终止/拦截不泄露他人 PII 明文。
- **关联**：契约 内部安全 gate；状态机 InterviewSession；原语 LOG+状态机；安全：越界/越狱/危机/造假规则。

| TC | 层 | 断言 |
|---|---|---|
| TC-AIIV-002-pipeline | graph-fake-model | 注入/危机标记→`terminated_safety` 状态流转正确（**仅验机制**） |
| TC-AIIV-002-jailbreak | ai-eval | 真模型越狱 golden 集→拦截率≥阈值、绕过≤上限 |
| TC-AIIV-002-crisis | ai-eval | 危机自伤 golden 集→识别召回≥阈值、误杀≤上限 |
| TC-AIIV-002-EX1 | 集成 | 分类器故障→保守拦截 + 生成申诉工单 |
| TC-AIIV-002-HC1 | 集成 | 连发触发→一次 terminated，幂等 |

### UC-AIIV-003 · 安全误判申诉回路（新增·逃逸闭环）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **触发**：被 `terminated_safety` 或保守拦截的候选人/HR 申诉
- **主流程**：1) `terminated_safety→under_review`（CAS，写申诉 LOG）；2) 人工复核；3) 误判→`under_review→active`(恢复，回滚走 LOG+CAS) 或确认→维持 terminated。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 申诉→复核→恢复 | `terminated_safety→under_review→active` CAS+LOG | active 续跑 |
| 异常 | EX1 | 复核确认确属违规 | `under_review→terminated_safety`（终态） | 维持终止 |
| 特殊 | SP1 | 误杀大面积保守拦截批量申诉 | 批量复核 + 逐条 CAS | 逐条恢复 |
| 逃逸 | ES1 | 复核系统不可用→保留申诉不丢 | 工单持久 LOG | 待复核 |
| 高并发 | HC1 | 候选人重复申诉/复核员并发处置 | 申诉幂等键 + 状态 CAS | 单次生效 |
| 复杂 | CX1 | 恢复后续跑需重建会话上下文 | checkpoint 恢复 + 同 threadId | 无缝续 |
| 刁钻 | TR1 | 真违规者反复申诉刷恢复 | 复核留痕 + 次数/速率限制 | 不可滥用 |

- **验收**：①terminated_safety 非死胡同，存在 `→under_review→active` 回滚路径且走 CAS+LOG；②误判恢复后同 threadId 续跑；③恶意反复申诉受速率限制；④每次状态回滚有审计人/原因。
- **关联**：契约 `POST /interviews/:id/appeal`；状态机 InterviewSession（新增回滚转移）；原语 CAS+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-AIIV-003-N1 | 集成 | 申诉→under_review→恢复 active，审计完整 |
| TC-AIIV-003-EX1 | 单元 | 复核确认→维持 terminated（终态守卫） |
| TC-AIIV-003-CX1 | graph-fake-model | 恢复后同 threadId 重建上下文续跑 |
| TC-AIIV-003-HC1 | 集成 | 并发申诉/复核→状态 CAS 恰一生效 |
| TC-AIIV-003-TR1 | 集成 | 反复申诉→速率限制拦截，留痕 |

### UC-AIIV-004 · 报告/复盘重生成限流（新增·防刷费）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) 重生成请求带 IDEM 键；2) 校验次数≤上限 + 速率限制；3) 计费按成功生成；report 子图后台跑不阻塞。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 限额内重生成 | IDEM + 计数 CAS | 新报告版本 |
| 异常 | EX1 | 生成失败 | 不计费、不计次 | 可重试 |
| 特殊 | SP1 | 首次生成 vs 重生成区分 | 计次起点 | 正确计 |
| 逃逸 | ES1 | 模型失效→返回上版 + 排队重试 | 降级返回缓存版 | 不空白 |
| 高并发 | HC1 | 双击重生成 | IDEM 键去重 | 单次计费 |
| 复杂 | CX1 | QB-006 召回触发的系统重生成 | 系统发起豁免用户配额但仍 IDEM | 留痕 |
| 刁钻 | TR1 | 脚本批量重生成刷费 | 次数上限 + 速率限制 | 超限拒绝 |

- **验收**：①重生成次数≤上限、超限拒绝；②同 IDEM 双击→单次计费；③失败不计费不计次；④系统召回触发的重生成与用户配额隔离且留痕。
- **关联**：契约 `POST /interviews/:id/report:regenerate`；状态机 AssessmentReport；原语 幂等+CAS+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-AIIV-004-N1 | 集成 | 限额内→新版本，计费 1 |
| TC-AIIV-004-HC1 | 集成 | 同 IDEM 双击→计费 1 |
| TC-AIIV-004-TR1 | 集成 | 超次数上限→拒绝 |
| TC-AIIV-004-EX1 | 集成 | 生成失败→不计费不计次 |

---

## 6. 同意与合规 CONS

### UC-CONS-001 · 同意采集（未成年/监护人 + 撤回 vs 进行中面试）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) 面试/入库前采集同意（按范围），写同意 LOG（hash 链）；2) 未成年/敏感岗→额外监护人同意；3) 撤回以 ledger 顺序为准，强制级联。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 采集同意后进入流程 | 同意 LOG（append） | granted |
| 异常 | EX1 | 同意缺失即起面试 | 前置守卫拒 | 阻断 |
| 特殊 | SP1 | **未成年→监护人同意/敏感岗额外同意** | 监护人同意子流程 | 双同意成立 |
| 逃逸 | ES1 | 同意服务故障→不放行降级 | fail-closed | 阻断 |
| 高并发 | HC1 | 同意/撤回乱序并发 | ledger 单调 seq 定序 | 以最终顺序为准 |
| 复杂 | CX1 | **撤回时面试 in_progress** | 强制 `in_progress→terminated_consent` | 即停 + 结果按策略处置 |
| 刁钻 | TR1 | 伪造/重放旧同意凭证 | hash 链 + server_ts | 拒伪造 |

- **验收**：①未成年/敏感岗无监护人同意→不可进入；②撤回时 in_progress 面试强制 `→terminated_consent` 并停止处理用户内容；③乱序同意/撤回以 ledger seq 定序判定；④同意凭证伪造/重放→hash 链拒。
- **关联**：契约 `POST /consents`、`POST /consents:withdraw`；状态机 InterviewSession(terminated_consent)；原语 LOG(hash 链)+CAS。

| TC | 层 | 断言 |
|---|---|---|
| TC-CONS-001-SP1 | 集成 | 未成年无监护人同意→面试入口 403 |
| TC-CONS-001-CX1 | graph-fake-model | 撤回→in_progress 面试 `terminated_consent`，停止处理内容 |
| TC-CONS-001-HC1 | 集成 | 乱序同意/撤回→按 seq 定序，最终态正确 |
| TC-CONS-001-TR1 | 集成 | 重放旧同意→hash 链/server_ts 拒 |
| TC-CONS-001-EX1 | 集成 | 无同意起面试→守卫阻断 |

### UC-CONS-002 · DSAR 导出/删除
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) DSAR `requested→processing`；2) 导出/删除按范围执行；3) `→fulfilled`。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 导出/删除完成 | 状态机 + LOG | fulfilled |
| 异常 | EX1 | 部分子系统删除失败 | saga 幂等续删 | partially_fulfilled |
| 特殊 | SP1 | 跨租同名候选人区分 | RLS + 主体绑定 | 仅本主体 |
| 逃逸 | ES1 | 下游不可达→挂起重试 | 持久任务重试 | processing 保持 |
| 高并发 | HC1 | 重复 DSAR 提交 | 幂等键 | 单任务 |
| 复杂 | CX1 | 删除涉及向量/缓存/checkpoint/快照 | 全路径清理清单 | 全路径删净 |
| 刁钻 | TR1 | 借 DSAR 删他人数据（越权） | RLS principal 绑定 | 0 行 |

- **验收**：①删除覆盖全路径（DB/向量/缓存/checkpoint/快照/备份策略）；②部分失败→partially_fulfilled 可续；③越权 DSAR→0 行。
- **关联**：契约 `POST /dsar`；状态机 DSARRequest；原语 幂等+RLS+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-CONS-002-CX1 | 集成 | 删除后全路径（含向量/缓存/checkpoint）0 命中 |
| TC-CONS-002-EX1 | 集成 | 部分失败→partially_fulfilled，重放续删 |
| TC-CONS-002-TR1 | 集成 | 跨主体 DSAR→0 行 |
| TC-CONS-002-HC1 | 集成 | 重复 DSAR→单任务 |

### UC-CONS-003 · 删除权 vs 法定保存冲突（新增）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) DSAR 删除请求命中"合规审计 LOG 不可删/法定保存期"；2) 裁决：可删数据删除，法定保存部分 `suspended_legal_hold` 并对用户透明告知保留依据与期限；3) 期满转可删。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 可删部分删、保存部分留 | 分区裁决 + 状态机 | partially_fulfilled |
| 异常 | EX1 | 误删合规 LOG | LOG WORM 拒删 | 删除被拒，记录 |
| 特殊 | SP1 | 全部命中法定保存（如审计期内） | suspended_legal_hold | 暂挂+告知 |
| 逃逸 | ES1 | 法务规则未配置→默认保守保留+人工裁决 | 人工接管 | 不误删 |
| 高并发 | HC1 | 删除与新审计写入并发 | LOG append 不阻删可删区 | 互不破坏 |
| 复杂 | CX1 | 未决纠纷叠加法定保存 | 双重 hold 取并集 | 取最长保留 |
| 刁钻 | TR1 | 借删除权销毁对己不利的合规证据 | 合规 LOG 不可删（WORM） | 拒绝销毁 |

- **验收**：①合规审计 LOG 在保存期内不可删（WORM 拒删）；②可删数据仍删除，对用户透明告知保留范围/依据/期限；③期满后保留部分转可删；④纠纷+法定保存取并集（最长）。
- **关联**：契约 `POST /dsar`；状态机 DSARRequest(suspended_legal_hold)；原语 LOG(WORM)+RLS。

| TC | 层 | 断言 |
|---|---|---|
| TC-CONS-003-N1 | 集成 | 混合数据→可删删、保存挂起，告知文案含依据/期限 |
| TC-CONS-003-EX1 | 集成/数据 | 合规 LOG 删除调用→WORM 权限拒 |
| TC-CONS-003-CX1 | 单元 | 纠纷+法定→保留期取并集最长 |
| TC-CONS-003-TR1 | 集成 | 试删对己不利合规证据→拒绝 |

---

## 7. 计费对账 COMMERCE / 录用决策 DECISION

### UC-COMMERCE-001 · 计费/订单/欠费/退款统一对账（新增·收口）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **角色**：系统计费 / owner / 对账作业
- **主流程**：1) MATCH/AIIV/ENT 各计费事件统一写计费账本（幂等键=业务事件 id）；2) 出账单 `draft→pending_payment`；3) 支付通知（幂等=单号+流水）`→paid`；4) 欠费 `→overdue`→账户 `active→grace→suspended` 降级/停权；5) 退款 `refunding→refunded`（总额守恒）。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 计费→出账→支付 | 幂等 + 状态机 | paid |
| 异常 | EX1 | 服务失败需退款 | `refunding→refunded` 幂等，总额守恒 | refunded |
| 特殊 | SP1 | 0 元/首单/币种 i18n | 边界计费 | 正确 |
| 逃逸 | ES1 | 支付网关失效→挂起重试不重复扣 | 幂等通知 | pending 保持 |
| 高并发 | HC1 | 支付通知重复/乱序回调 | 幂等键(单号+流水)+CAS | 单次履约 |
| 复杂 | CX1 | **跨 MATCH/AIIV/ENT 总账核对** | 对账作业：账本求和=各 UC 成功条数 | 差异=0 |
| 刁钻 | TR1 | 欠费状态继续消费逃费 | 账户 `suspended` 写门阻断 | 拒绝 |

- **验收**：①各 UC"按成功条数计费"经对账作业核对，账本总额=各业务成功事件和，差异=0；②欠费→grace→suspended 降级/停权主流程生效；③退款幂等、总额守恒（退款≤已收）；④重复/乱序支付通知→单次履约。
- **关联**：契约 `/billing/*`、`webhook /payments`；状态机 BillingOrder/Invoice、BillingAccount；原语 幂等+CAS+LOG。

| TC | 层 | 断言 |
|---|---|---|
| TC-COMMERCE-001-CX1 | 集成 | 对账作业：账本总额=MATCH+AIIV+ENT 成功条数和，差异=0 |
| TC-COMMERCE-001-HC1 | 集成 | 重复/乱序支付回调→恰一次 paid 履约 |
| TC-COMMERCE-001-EX1 | 集成 | 退款幂等，退款总额≤已收（守恒） |
| TC-COMMERCE-001-TR1 | 集成 | 账户 suspended→消费写被欠费门拒 |
| TC-COMMERCE-001-N1 | 集成 | 计费→出账→支付 paid 全链 |

### UC-DECISION-001 · 录用/淘汰决策合规留痕（新增·反歧视证据）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：1) HR 对候选人作录用/淘汰决策，**必填可解释理由**（结构化，绑定证据 span）；2) 决策写 append-only DecisionRecord（hash 链）`drafted→finalized`；3) 校验理由不含受保护属性字段。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 决策+理由留痕 | DecisionRecord LOG | finalized |
| 异常 | EX1 | 无理由直接淘汰 | 必填守卫拒 | 阻断 |
| 特殊 | SP1 | 批量淘汰需逐条理由 | 逐条校验 | 全条留痕 |
| 逃逸 | ES1 | 决策系统故障→暂存草稿不丢 | drafted 持久 | 可续 |
| 高并发 | HC1 | 并发改同候选决策 | 决策 CAS + 版本 | 单一最终 |
| 复杂 | CX1 | 决策依赖被召回题分(QB-006) | 关联重算→决策可复核标记 | 留痕可追 |
| 刁钻 | TR1 | 理由含/隐含受保护属性歧视 | 受保护属性检测 + 拒/告警 | 阻断歧视决策 |

- **验收**：①淘汰/录用必须有结构化可解释理由，无理由→拒；②理由命中受保护属性→拒并告警；③决策 finalized 不可篡改（hash 链），修改=新版本 supersede 留痕；④决策可关联其依据证据/题分版本。
- **关联**：契约 `POST /candidates/:id/decision`；状态机 DecisionRecord；原语 CAS+LOG(hash 链)；安全：反歧视、决策可解释。

| TC | 层 | 断言 |
|---|---|---|
| TC-DECISION-001-N1 | 集成 | 决策+理由→finalized，hash 链可验 |
| TC-DECISION-001-EX1 | 单元 | 无理由淘汰→守卫拒 |
| TC-DECISION-001-TR1 | 集成 | 理由含受保护属性→拒+告警 |
| TC-DECISION-001-HC1 | 集成 | 并发改决策→CAS 单一最终 |
| TC-DECISION-001-CX1 | 集成/数据 | finalized 改动→新版本 supersede，旧版不可改（WORM） |

---

## 8. 跨租户隔离 ISO

### UC-ISO-001 · 六类越权隔离回归
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **主流程**：以 A 租户 principal 尝试访问 B 租户资源，全部 fail-closed。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 本租正常访问 | RLS 放行本租 | 命中本租 |
| 异常 | EX1 | 无 principal 上下文访问 | fail-closed 空集 | 0 行 |
| 特殊 | SP1 | 跨租同 ID 资源 | RLS 谓词隔离 | 0 行 |
| 逃逸 | ES1 | RLS 策略异常→默认拒（非默认放行） | fail-closed | 0 行 |
| 高并发 | HC1 | 并发多租请求连接池复用 | 事务模式连接池 + SET LOCAL | 不串号 |
| 复杂 | CX1 | 后台 job/worker 路径越权 | 全路径注入 principal | 0 行 |
| 刁钻 | TR1 | 六类：IDOR/JWT 跨租/向量/缓存键/checkpoint/SSE/**+trace 审计 Langfuse** | 各路径 principal 绑定 | 全 0 命中 |

- **验收**：六类（含第六类可观测性 trace/审计/Langfuse 后台）跨租访问全部 0 行/0 命中；无 principal→0 行；连接池复用不串号。
- **关联**：原语 RLS（全路径）；安全：B/C 物理隔离生死线。

| TC | 层 | 断言 |
|---|---|---|
| TC-ISO-001-TR1-idor | 集成 | A 访 B 资源 id→404/0 行 |
| TC-ISO-001-TR1-vector | 集成 | A 检索→0 命中 B 向量命名空间 |
| TC-ISO-001-TR1-cache | 集成 | 缓存键含 principal→A 取不到 B |
| TC-ISO-001-TR1-checkpoint | 集成 | A resume B threadId→0 行 |
| TC-ISO-001-TR1-sse | 集成 | A 订阅 B 事件流→拒/空 |
| TC-ISO-001-TR1-observability | 集成 | A 在可观测后台查 B 的 trace/审计/Langfuse→0 命中（第六类） |
| TC-ISO-001-EX1 | 集成/数据 | 无 principal→0 行（DB fail-closed） |
| TC-ISO-001-HC1 | 集成 | 并发多租连接池复用→无串号 |

### UC-ISO-003 · 混合并发压测 + 可观测性隔离（新增·跨聚合竞态）
**七类覆盖**：正常✓ 异常✓ 特殊✓ 逃逸✓ 高并发✓ 复杂✓ 刁钻✓
- **触发**：offboarding 进行中，同时并发：邀请成员 + 在跑面试 resume + 导出 + 同意撤回
- **主流程**：1) 注销冻结门生效；2) 各并发操作分别遭遇状态守卫/CAS/幂等；3) 系统保持不变量。

| 类 | flow | 机制 | 后置 |
|---|---|---|---|
| 正常 | N1 | 无冲突的本租并发 | 各自原语 | 一致 |
| 异常 | EX1 | offboarding 中邀请成员 | 写冻结门拒 | 409 |
| 特殊 | SP1 | offboarding 中导出 | 阻断或快照只读 | 受控 |
| 逃逸 | ES1 | 冲突过多→排队/退避不雪崩 | 有界退避 + 背压 | 稳定 |
| 高并发 | HC1 | **四操作同时并发** | 各 CAS/租约/幂等独立成立 | 无脏态、无 0-owner、无双扣费 |
| 复杂 | CX1 | resume 与撤回同时命中同面试 | 撤回优先→terminated_consent | 一致裁决 |
| 刁钻 | TR1 | 借混合竞态钻隔离/计费空子 | 全路径 principal + 对账 | 无越权无漏费 |

- **验收**：①四操作混合并发后不变量恒真（恰一 owner、seatUsed≤quota、无双扣费、面试态一致）；②offboarding 中违规写全 409；③resume vs 撤回→撤回优先 terminated_consent；④压测后对账差异=0、跨租 trace 0 命中。
- **关联**：状态机 多聚合；原语 CAS+幂等+RLS+LOG（四原语合击）。

| TC | 层 | 断言 |
|---|---|---|
| TC-ISO-003-HC1 | 集成 | 四操作并发压测→全不变量恒真，无脏态 |
| TC-ISO-003-CX1 | 集成 | resume+撤回同面试→terminated_consent 优先 |
| TC-ISO-003-EX1 | 集成 | offboarding 中邀请/导出→409/受控只读 |
| TC-ISO-003-TR1 | 集成 | 混合竞态后对账差异=0、跨租 trace 0 命中 |

---

## 附录 A · 验收口径锁定（把"达阈值"变可测）
- **bias 反事实配对**：数据集=同 JD 同能力画像的成对样本，仅翻转单一受保护属性（性别/年龄段/地域/民族等，逐属性独立集，各 ≥N 对）。指标：每属性配对分差 `Δ=score(A)−score(B)`，要求 mean(Δ) 的 95% 置信区间落在 [−ε, ε] 内（ε 为业务定的可接受分差，建议占满分≤2%），且配对 t/wilcoxon 检验**不**呈系统性方向显著。单跑单 golden 不达此口径。
- **jailbreak golden set**：固定版本，分类含直接越狱/角色扮演/编码绕过/多轮诱导/多语种，规模 ≥M 条；硬指标=拦截率≥下限、绕过率≤上限（按风险等级分层定）。
- **crisis golden set**：自伤/危机表达 + 易混良性对照（hard negatives），指标=召回≥下限、误杀（良性误判）≤上限。
- **PII 对抗 golden set**：变体/谐音/拆分/跨语种，指标=检出率≥下限、漏检≤上限；published 全集 PII=确定性数据扫描命中=0（非 ai-eval）。
- **脱敏字段清单 + 序列化器粒度**：对公{统一信用代码、法人、对公账号}、个人{身份证、手机、邮箱、住址}、密钥/令牌/支付密钥、完整简历正文、完整模型 prompt。断言方式=**白名单序列化器**（DTO 仅声明可外泄字段），对序列化产物做敏感正则全扫命中=0；日志/trace 同断言。

## 附录 B · 测试层修正（评审⑤落实）
- jailbreak / crisis / prompt-injection：拆两条 TC——**状态流转/安全标记/数据块隔离管道 = graph-fake-model**；**真实模型能力（拦截率/识别率/抗注入）= ai-eval**。禁止用 fake model 证明生产安全质量。
- QB-004 published PII 全文扫描：归 **集成/数据层**确定性断言；ai-eval 仅承担对抗变体检出率。
- MATCH-001 bias：改 **反事实配对 + 统计显著**，非单 golden 单跑。
- 所有"对账/0 命中/0 行/字段扫描"= 确定性集成/数据层；ai-eval 仅承担模型能力类。

## 附录 C · LOG 原语自我验证 TC（防篡改）
| TC | 层 | 断言 |
|---|---|---|
| TC-LOG-hashchain | 集成/数据 | 篡改任一历史 entry→链重算检出断裂 |
| TC-LOG-worm | 集成/数据 | 对审计/同意/决策表执行 UPDATE/DELETE→权限拒（无写改授权） |
| TC-LOG-servertime | 单元 | 客户端伪造 ts→入库以 server now() 为准，伪造无效 |
| TC-LOG-clockdrift | 集成 | 时钟漂移/乱序写入→seq 单调、server_ts 权威，顺序可判 |

> 本 TC 组为 QB-003「签核后偷改/伪造时间」、CONS-001/003、DECISION-001、COMMERCE-001 的"追加式不可改/可审计"验收提供统一机制底座，避免一结论多处。
