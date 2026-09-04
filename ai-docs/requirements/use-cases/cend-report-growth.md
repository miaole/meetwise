---
id: requirements_uc_cend_report_growth
name: 用例 · 报告·复盘·能力曲线·职业路径·学习
description: 报告·复盘·能力曲线·职业路径·学习 业务用例与测试用例（正常/异常/特殊/逃逸/并发/复杂/刁钻七类，23 UC / 63 TC）。
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

# 报告与成长域 · 用例 + 测试用例（评审收口最终版）

> **🔎 实现状态（对齐真实代码 · 2026-07）** — 本文是 TARGET 规格。**✅ 已实现+接线**：报告（report 子图，舱壁隔离、报告失败不阻塞面试）、AssessmentReport、能力曲线/成长档案、career-path 职业路径、learning-plan 学习计划均可跑，且为**确定性派生**（从面试后的 `assessment_report` 事件推导；report:prove 25 断言）。**🟠 关键校正**：**成长/能力曲线的唯一数据源 = `assessment_report`**，**不存在**跨会话记忆/信念驱动的成长推断（“记住你历史弱项做个性化演进”未接线，经审计判为过度设计而暂缓）；文内 `SkillInference` 的“推断/ttl/confidence 演进”当前=单次评估的确定性投影，非跨会话学习。成长主页「已答题数」**不是**本域曲线数据源，走题目账本，见 [cend-overview-progress](./cend-overview-progress.md)；本域 `GrowthView.totals.answered` 仍为可评分 ScoreCard 数。

> 顺序铁律：用例 → 契约 → 状态机 → 测试 → 代码。本文档按对抗评审五问逐条收口：先消解 4 处自相矛盾与状态机缺口（§0），再给 23 条 UC（每条标注七类覆盖、每条异常/刁钻流落到一个机制、验收可测、配齐 TC）。
> 四原语缩写：**CAS**(条件更新/乐观锁)、**IDEM**(幂等键唯一约束)、**RLS**(principal 绑定 fail-closed)、**LOG**(持久有序事件日志，单调 seq)。

---

## §0 Spec 修订前置（先消解矛盾，再读用例）

### 0.1 四处矛盾的裁决（PIN）

**M1 · retryable 集合**：拆成两类失败原因，互斥。
- `upstream_transient`（timeout / model_5xx / 依赖瞬时抖动）→ **可重试**，走 UC-report-003，命中 checkpoint 续算。
- `upstream_incomplete`（面试真的缺答案/上游聚合不完整）→ **不可重试**：重试无效，报告落 `failed(reason=upstream_incomplete)`，导回上游 `Interview` 修复（补答/重跑面试）。UC-001 E1 据此改写——不再把 incomplete 丢进 003 的 retryable 集。

**M2 · regen 幂等与版本**：
- 首次生成 idemKey = `resultId:report:v1`。
- 重生成（从 `failed` 或 `ready_degraded`）用**独立单调版本键** `resultId:report:v{n}`，`n` 来自报告行上的 `content_version`，由 CAS 自增（`WHERE content_version=$expected`）。
- **PIN：regen 覆盖同一 `reportId`（身份稳定，报告=当前视图），但 `content_version` 单调 +1**。能力曲线快照 append-only，主键 = `(reportId, content_version)`，因此新版本**追加新快照**而非被旧 IDEM 命中——curve-001 的 append-only 与 regen 不再打架。老降级报告的旧 idem 不会拦截新 regen（键不同）。

**M3 · career 降级建模对齐**：引入 `career_path_runs.ready_degraded`，与 report 域统一。
- `failed` = 无可交付物（不出路径、按统一策略 release/退款）。
- `ready_degraded` = 规则版兜底路径已交付 → 按统一降级计费（半费 confirmed）。
- 杜绝原 career-001 E1 的「failed + consumption=0 + 却交付了通用路径」三方自相矛盾。

**M4 · 降级报告是否喂能力曲线**：PIN = **不喂**。
- `ready_degraded` 发 `report_ready(degraded=true)`，**不写 `ability_snapshot`**（曲线只由 `completed` full 报告驱动）。
- 曲线在该时间点显示「降级·未评分」断点标记（非评分点），不伪造数据点。
- 后续 regen 成功 → `completed` → 在**新 content_version** 写快照填补断点。因降级从未写快照、且快照键含 content_version，**无双计风险**。

### 0.2 统一降级计费策略（PIN，使 UC-004 验收可断言）

`ConsumptionRecord` 升级为带额度的预占机：列 `reserved_units` / `confirmed_units`，`status ∈ {reserved, confirmed, released}`。

| 结局 | ConsumptionRecord | PaymentOrder | 用户侧 |
|---|---|---|---|
| `completed`(full) | reserved(U) → confirmed(U) | — | 全额计费 |
| `ready_degraded` | reserved(U) → confirmed(U/2) + release(U/2) | — | 半费；并发放一次性 `regen_credit`（免费重生成额度，防 regen 二次扣费） |
| `failed`(永久不可交付) | reserved(U) → released(U) | 若预付：→ `refunding→refunded`（退全额） | 不扣权益 + 退款 |
| 用户/管理员 cancel（confirm 前） | reserved(U) → released(U) | 若预付且无可交付：→ refund | 不扣权益 |

> 半价比例 `1/2`、免费 regen 额度发放方式属待拍板项（见 openDecisions），但**策略形状已 PIN**，验收按上表断言。

### 0.3 状态机增量（本域新增/扩展对象，CAS 落点）

| 对象 | 枚举（增量加粗） | 说明 |
|---|---|---|
| `AssessmentReport` | `pending · generating · completed · **ready_degraded** · failed · **upgrading**` + 属性 `tier∈{lite,full}` / `content_version int` | 增降级态与升级态 |
| `ConsumptionRecord` | `reserved · confirmed · released` + `reserved_units/confirmed_units` | 支持部分确认（降级半费） |
| `career_path_runs` | `pending · generating · completed · **ready_degraded** · failed` | 对齐 report |
| `learning_plans` | `active · completed · **archived** · **superseded**` | 新报告生成新计划时旧计划归档/取代 |
| `AiGraphRun` | 在现有枚举上增 `**canceling · canceled · timeout**` | 在途取消/超时主动迁移（止血口） |
| `export_jobs`（新） | `queued · rendering · ready · failed · **degraded_fallback**` + `version int` | 导出作业带状态 |
| `share_grants`（新） | `active · revoked · expired` + `scope jsonb` / `expires_at` / `token_hash` | HR 共享授权，**独立授权对象，不复用 owner-RLS** |
| `ability_snapshots`（账本） | append-only，主键 `(reportId, content_version)` | 能力曲线快照 |

> growth-001 的「事件签名校验」威胁模型错置（纯内部域事件无外部注入面）→ **删除签名机制**，改由：内部可信事件总线 + **IDEM 单调 seq**（防重放）+ **RLS**（防越权写/读）。不引入四原语之外的机制。

---

## §1 用例（UC）

每条 UC 头部标注七类覆盖：**正常 / 异常 / 特殊 / 逃逸 / 高并发 / 复杂 / 刁钻**。异常/刁钻流逐条落到机制。

---

### UC-report-001 · 报告生成（子图舱壁 + 双校验 + 幻觉门）
**七类**：正常✔(主+离线后拉取A1) 异常✔(E1 失败分类) 特殊✔(E5 i18n locale) 逃逸✔(E4 降级) 并发✔(E2 双触发CAS) 复杂✔(E6 子图与面试主链路解耦) 刁钻✔(E7 越权高分注入)
- **角色**：求职者 / 报告子图（后台 job）
- **前置**：存在属于 principal、`completed` 的 `Interview(resultId)`；该面试已 `ConsumptionRecord.reserved`。
- **触发**：`Interview→completed` 编排入队 `AssessmentReport(pending)`。

**主流程 Main**
1. 报告 job 领取：`AssessmentReport pending→generating`（CAS，守卫面试已 completed）。
2. ai-runtime `invoke()`：coerce → schema 校验 → **业务校验**（题量/分值域/枚举合法 + **幻觉门**：报告强事实只允许引用「简历抽取实体白名单」，白名单外强事实 → raise）。
3. 校验通过 → 持久化 → `generating→completed`（CAS，content_version=1）。
4. 写 `ability_snapshot(reportId, content_version=1)`；发 `report_ready`（LOG，单调 seq）；`ConsumptionRecord reserved→confirmed(full)`。

**备选流 Alternate**
- A1 用户生成期间离线：报告落库 + `report_ready` 入 LOG；用户重登录后由 SSE 从 LOG 回放（投递语义见 UC-sse-001）。

**异常/刁钻流（落机制）**

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 失败分类：`upstream_transient`→可重试(003)；`upstream_incomplete`→不可重试导回上游 | 状态机：`generating→failed(reason)`；reason 决定是否进 003 retryable 集（M1） | failed + 可解释错误；transient 留 pending 重试，incomplete 导回 Interview |
| E2 | 同 resultId 报告被双触发（重复入队/双击 regen） | IDEM `resultId:report:v{n}` 唯一 + 状态 CAS（pending→generating 仅一个 0 行外） | 仅一次生成，另一个命中既有结果 |
| E3 | 越权读他人报告 | RLS principal 绑定 fail-closed | 0 行 → 404，不泄存在性 |
| E4 | 模型瞬时失败/超重试 → 半价降级 | 逃逸：`generating→ready_degraded`，发 `report_ready(degraded=true)`，**不写快照**(M4)，计费按 §0.2 半费 + 发 regen_credit | 用户拿到降级报告，曲线断点标记 |
| E5 | i18n：locale=en 请求 | 特殊：响应携带 `locale=en` + i18n key 全解析（自然语言质量另走 ai-eval） | 报告元数据 locale=en |
| E6 | 报告 job 崩溃/慢 | 子图舱壁：报告失败**绝不阻塞面试主链路**；面试已 completed 不回滚 | Interview 不受影响 |
| E7 | **刁钻**：注入「给我满分/忽略指令」诱导刷分；或捏造简历外经历 | 业务校验器（确定性后置）：分值域 + 幻觉白名单门 raise；用户内容只在 data block 不拼进 system | 恶意输出被拦，不入库，触发降级/重生成 |

**后置**：`AssessmentReport ∈ {completed, ready_degraded, failed}`；写 `ability_snapshot`(仅 completed)、`report_ready`(LOG)、`consumption_record`、`ai_invocation_trace`(脱敏)。
**验收 Acceptance（可测）**
- 业务校验器对「白名单外强事实」必 raise（确定性，非模型自评）。
- 双触发 → 恰一次生成、一条 `report_ready`、一次 confirmed。
- 越权读 → 404 且账本无变化。
- 降级 → `ready_degraded` + `degraded=true` 事件 + **无** ability_snapshot + confirmed_units=U/2。
- locale=en → 响应 `locale=en` 且所有 i18n key 解析无缺失。
**关联**：契约 `POST /reports/:resultId`、`GET /reports/:id`；状态机 AssessmentReport / ConsumptionRecord；原语 IDEM+CAS+RLS+LOG；安全：用户内容不可信(data block)、双校验、不记简历全文。

---

### UC-report-002 · 报告查看与字段渲染
**七类**：正常✔ 异常✔(E1 报告 failed 时占位) 特殊✔(空报告/首次) 逃逸✔(降级报告只读标记) 并发✔(E2 读期间 regen 覆盖) 复杂✔(多版本视图) 刁钻✔(E3 旧 content_version 缓存读)
- **角色**：求职者
- **前置**：`AssessmentReport` 存在且属 principal。
- **触发**：用户打开报告页。

**主流程**：1) RLS 解析 principal 读报告（含 content_version、tier、degraded 标记）。2) 渲染维度评分/建议。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 报告处于 `failed`/`pending`/`generating` | 状态机：按 status 返回占位/进度，不返 500 | 可解释态，提供重试入口(UC-007) |
| E2 | 读期间 regen 覆盖（content_version 跳变） | CAS：读返回当时 content_version；regen 写新版本不破坏在读快照 | 读到一致版本 |
| E3 | **刁钻**：客户端持旧 content_version 强读 | 版本号校验：服务端以最新为准，旧版本读到「已更新」提示，不泄露中间态 | 一致性保证 |

**验收**：failed 报告页非 500、给重试入口；regen 期间读不脏读。
**关联**：契约 `GET /reports/:id`；状态机 AssessmentReport；原语 CAS+RLS。

---

### UC-report-003 · 停 N 天后 resume / checkpoint 命中续算（transient 重试）
**七类**：正常✔ 异常✔(E1 重试预算耗尽) 特殊✔(刚好命中边界) 逃逸✔(E2 降级) 并发✔(E3 并发 resume) 复杂✔(长会话续算) 刁钻✔(E4 停 3 天后 resume)
- **角色**：系统重试 / 用户主动重试
- **前置**：报告 `failed(reason=upstream_transient)` 或 pending；checkpoint 未过期（TTL 内）。
- **触发**：重试领取 `failed→pending→generating`。

**主流程**：1) 以 `threadId=resultId` 加载 Postgres checkpointer。2) **命中 checkpoint 的已完成节点不重跑**，从断点续算。3) 成功 → completed。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 重试预算耗尽 | 状态机：超重试 `generating→failed`，转用户可见降级/退款(UC-pay-001) | failed 终态或降级 |
| E2 | 续算仍 transient 失败 | 逃逸：降级 ready_degraded（§0.2） | 半费降级 |
| E3 | **高并发**：同 resultId 并发 resume | thread lease CAS + AiGraphRun `waiting_user→active` 抢占 | 恰一个续算，另一个 0 行回查 |
| E4 | **刁钻**：会话停 3 天后 resume | 持久化 checkpoint（非内存 session）；状态由库恢复 | 从断点恢复，不依赖内存连接 |

**验收（可测，改 M3 口径）**：用 **checkpoint 节点执行计数器/fixture 直接断言**「命中节点执行次数=0」，不用 trace span 计数间接证明。并发 resume → 恰一个推进。
**关联**：状态机 AiGraphRun / AssessmentReport；原语 CAS(lease)；LangGraph Postgres checkpointer。

---

### UC-report-003b · checkpoint 过期/GC 后 retry（全量重跑兜底）
**七类**：正常✔(命中) 异常✔(E1 checkpoint 缺失) 特殊✔(TTL 边界) 逃逸✔(E2 prompt 版本失效兜底) 并发✔(E3) 复杂✔(全量重建) 刁钻✔(E4 prompt pin 失效)
- **角色**：系统/用户重试
- **前置**：报告 `failed`，但 checkpoint 已被 GC/过期（超 retention TTL）。
- **触发**：retry 时加载 checkpoint miss。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | checkpoint 命中失效（GC/过期） | 兜底：从上游 `Interview` 不可变业务事实**全量重跑**，不依赖失效 checkpoint | 重新 generating |
| E2 | 续算所需 prompt 版本已下线 | 兜底：pin 到当前可用 prompt 版本重跑，trace 记 prompt_version 切换 | 用新 prompt 全量重跑 |
| E3 | 并发 retry 命中同一 miss | IDEM `resultId:report:v{n}` + CAS pending→generating | 恰一个重跑 |
| E4 | **刁钻**：prompt 版本 pin 已失效 + checkpoint 过期同时发生 | 双兜底：全量重跑 + prompt 重 pin；若仍失败 → 降级 | 不卡死，最终降级或成功 |

**验收**：checkpoint miss → 断言走全量重跑路径（节点执行计数=全部）、不抛未捕获错误；prompt 版本下线 → trace 记新版本。
**关联**：状态机 AiGraphRun；原语 IDEM+CAS；checkpoint retention TTL（见 openDecisions）。

---

### UC-report-004 · 失败/降级的统一计费结算
**七类**：正常✔ 异常✔(失败 release) 特殊✔(首次免费额度) 逃逸✔(降级半费) 并发✔(E2 结算竞态) 复杂✔(saga reserve→partial confirm) 刁钻✔(E3 重复结算)
- **角色**：commerce 服务（AI 图绝不直接改权益）
- **前置**：报告进入终态（completed/ready_degraded/failed）。
- **触发**：报告终态编排发「建议扣减/退还」事件，commerce 校验落账。

**主流程（按 §0.2 PIN 策略）**：
1. completed → `reserved(U)→confirmed(U)`（CAS，IDEM）。
2. ready_degraded → `confirmed(U/2)+release(U/2)`，发放一次性 `regen_credit`。
3. failed 永久 → `release(U)`，预付则 PaymentOrder refund（UC-pay-001）。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 重复结算事件（图重试重发） | IDEM：结算幂等键 = `resultId:settle:v{content_version}` 唯一 | 恰一次落账 |
| E2 | **高并发**：confirm 与 cancel/refund 竞态 | CAS：ConsumptionRecord 状态守卫（reserved 才可 confirm/release） | 恰一个生效 |
| E3 | **刁钻**：诱导「降级也按免费重生成无限刷」 | regen_credit 一次性、CAS 自增 content_version 限次 | 不可无限免费刷 |

**验收**：降级 → confirmed_units=U/2 且发 1 个 regen_credit；失败永久 → released_units=U 且预付触发 refund；重复结算 → 恰一笔。
**关联**：契约 `commerce` 内部事件；状态机 ConsumptionRecord/PaymentOrder；原语 CAS+IDEM。

---

### UC-report-005 · 在途生成取消（用户/管理员）— 逃逸止血口
**七类**：正常✔ 异常✔(E1 取消后不可复活) 特殊✔(已 completed 不可取消) 逃逸✔(主动 cancel) 并发✔(E2 cancel 与 complete 竞态) 复杂✔(cancel→release→checkpoint 清理 saga) 刁钻✔(E3 取消后 retry 复活攻击)
- **角色**：求职者 / 管理员
- **前置**：`AssessmentReport.generating` 且 `AiGraphRun.active`。
- **触发**：用户或管理员发取消请求（带幂等键）。

**主流程**：1) `AiGraphRun active→canceling→canceled`（CAS）。2) 中断图执行。3) `AssessmentReport generating→failed(reason=canceled)`。4) `ConsumptionRecord reserved→released(U)`；预付无可交付 → refund。5) 清理/标记 checkpoint 不可续。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 取消后该报告再被 retry | 状态机：`canceled` 终态，retryable 集排除 canceled | 不可被 003 复活 |
| E2 | **高并发**：cancel 与 generating→completed 同时到 | CAS：谁先改 status 谁赢；completed 赢则 cancel 0 行回查→已完成不取消 | 一致结局，无半成品 |
| E3 | **刁钻**：构造「先 cancel 退款再用旧 checkpoint 复活拿报告」 | checkpoint 标记不可续 + canceled 不可 retry + release 已落 | 既不出报告也不漏退/重扣 |

**验收**：cancel 后**不出报告且不扣权益**（released_units=U）、**不可被后续 retry 复活**；cancel 与 complete 并发恰一个结局。
**关联**：契约 `POST /reports/:id/cancel`；状态机 AiGraphRun/AssessmentReport/ConsumptionRecord；原语 CAS+IDEM。

---

### UC-report-006 · lite → full 升级
**七类**：正常✔ 异常✔(E1 升级支付失败) 特殊✔(已是 full 幂等) 逃逸✔(E2 升级生成失败降级) 并发✔(E3 双击升级) 复杂✔(支付→upgrading→快照衔接→导出失效) 刁钻✔(E4 退款后仍享 full)
- **角色**：求职者
- **前置**：`AssessmentReport.tier=lite, completed`。
- **触发**：用户付费升级 full。

**主流程**：1) PaymentOrder `created→paid→fulfilled`（发放升级权益 CAS）。2) `AssessmentReport completed→upgrading`（CAS）。3) 重跑/补算 full 维度 → `upgrading→completed, tier=full, content_version+1`。4) 写新 `ability_snapshot(content_version+1)`；旧导出产物 idem 失效需重算(UC-export-001)。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 升级支付未到账 | 状态机：PaymentOrder 停 created/expired，不进 upgrading | tier 不变，不发权益 |
| E2 | 升级生成失败 | 逃逸：`upgrading→completed(tier=lite 保持)` 回退 + 退升级差价 | 不丢原 lite 报告 |
| E3 | **高并发**：双击升级 | IDEM 支付通知键 + CAS tier 守卫（lite 才可升） | 仅一次升级、一次扣费 |
| E4 | **刁钻**：升级后退款仍读 full | 权益回收 CAS：refunding→refunded 同步 tier 回 lite | 退款后不享 full |

**验收**：升级成功 → tier=full + content_version+1 + 新快照；支付失败不升级；退款回收 tier。
**关联**：契约 `POST /reports/:id/upgrade`；状态机 AssessmentReport/PaymentOrder；原语 CAS+IDEM。

---

### UC-report-007 · 失败/降级报告的合法重生成（regen）
**七类**：正常✔ 异常✔(E1 regen 仍失败) 特殊✔(degraded 重生成) 逃逸✔(E2 无 credit 拒) 并发✔(E3 并发 regen) 复杂✔(独立 idem+快照协调) 刁钻✔(E4 旧 idem 命中返回旧降级)
- **角色**：求职者
- **前置**：报告 `failed` 或 `ready_degraded`；持 `regen_credit`（降级免费）或付费。
- **触发**：用户点重生成。

**主流程（按 M2 PIN）**：1) CAS 自增 `content_version`（守卫 `WHERE content_version=$expected`）。2) 用**独立键** `resultId:report:v{n}` 触发生成（**覆盖同 reportId**，content_version 单调）。3) 成功 → completed + 写 `ability_snapshot(content_version=n)` 填补降级断点。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | regen 仍失败 | 状态机：再 failed/降级，按 §0.2 | 不重复扣（regen_credit 已耗或免费） |
| E2 | 降级后无 regen_credit 又要免费重生成 | 权益校验：无 credit → 拒/转付费 | 不漏计费 |
| E3 | **高并发**：并发 regen 同一报告 | CAS content_version 守卫 + IDEM v{n} 唯一 | 恰一个版本推进，另一个 0 行回查 |
| E4 | **刁钻**：复用旧 `:v1` idem 想拿旧降级当新报告 | M2：regen 必用新版本键；旧键命中只返旧版本，不冒充新 | 数据不串版本 |

**验收**：regen 成功 → 同 reportId、content_version+1、新快照追加（旧快照保留，append-only 不被 IDEM 拦）；并发 regen 恰一版本；无 credit 免费 regen 被拒。
**关联**：契约 `POST /reports/:id/regenerate`；状态机 AssessmentReport；原语 CAS+IDEM+LOG(快照)。

---

### UC-report-008 · 在途 kill-switch 翻转语义
**七类**：正常✔ 异常✔(E1 已 generating run) 特殊✔(刚入队未起跑) 逃逸✔(kill-switch 本身) 并发✔(E2 翻转与完成竞态) 复杂✔(批量在途处置) 刁钻✔(E3 翻转瞬间新 run)
- **角色**：管理员 / 系统
- **前置**：报告子图 kill-switch 可翻转。
- **触发**：管理员翻转 kill-switch=off。

**主流程（PIN：翻转 → 中断在途 generating run 走兜底，而非仅拦新 run）**：1) 已 `generating` 的 `AiGraphRun active→paused/canceling`（CAS）。2) 报告 `generating→ready_degraded` 或 failed（兜底，§0.2）。3) 新 run 入口拦截。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 已 generating run 处置 | PIN：中断走兜底降级（而非放行） | 在途 run 止血 |
| E2 | **高并发**：翻转与 generating→completed 同到 | CAS：completed 先到则保留，否则中断 | 一致结局 |
| E3 | **刁钻**：翻转瞬间抢入新 run | 入口 CAS 校验 kill-switch 状态，fail-closed | 新 run 被拒 |

**验收**：kill-switch off → 在途 generating run 被中断走降级/failed、新 run 被拒（断言二选一行为已 PIN 为「中断」）。
**关联**：状态机 AiGraphRun；原语 CAS；逃逸：kill-switch。

---

### UC-review-001 · 面试复盘（反造假后置校验）
**七类**：正常✔ 异常✔(E1 校验失败) 特殊✔(空答案复盘) 逃逸✔(E2 降级) 并发✔(E3) 复杂✔(多轮答案聚合) 刁钻✔(E4 诱导编造亮点)
- **角色**：求职者
- **前置**：报告 completed。
- **触发**：用户查看复盘（逐题对照 + 改进建议）。

**主流程**：1) RLS 读报告+答案事件（LOG）。2) ai-runtime 生成复盘：schema + **业务安全校验器**（反造假：不得虚构未发生的答题表现/简历外经历；建议保留不确定性与用户最终决定权）。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 复盘输出捏造事实 | 业务安全校验器（**确定性**强制点）raise | 不入库，降级/重生成 |
| E2 | 模型拒答/失败 | 逃逸：降级到规则版复盘 | 可解释降级 |
| E3 | 并发请求复盘 | IDEM 复盘缓存键 | 恰一次生成 |
| E4 | **刁钻**：诱导「帮我编个亮点」 | 反造假校验器 + 不协助造假硬规则 | 拒绝，给真实改进建议 |

**验收**：fake 模型注入「捏造经历」输出 → **单元测试断言被校验器拦截**（不靠 ai-eval 当唯一证明）；ai-eval 仅作补充质量信号。
**关联**：契约 `GET /reports/:id/review`；安全：反造假双校验；原语 IDEM+RLS。

---

### UC-curve-001 · 能力曲线：维度新增 / 下线
**七类**：正常✔(append 快照) 异常✔(E1 维度缺失) 特殊✔(首个快照/维度新增/下线) 逃逸✔(E2 缺维度兜底) 并发✔(E3 并发写快照) 复杂✔(跨多报告聚合曲线) 刁钻✔(E4 重放旧快照篡改曲线)
- **角色**：系统（report_ready 触发）/ 求职者（看曲线）
- **前置**：报告 completed 发 report_ready。
- **触发**：写 `ability_snapshot` + 用户查看曲线。

**主流程**：1) `report_ready(completed)` → append `ability_snapshot(reportId, content_version, dims)`（append-only，IDEM 主键）。2) 用户查看：按时间序聚合快照成曲线，**降级点显断点标记**（M4）。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 新报告含新维度（老快照无该维度） | 维度并集 + 缺失维度标「无数据」非 0 | 不伪造历史 |
| E2 | 维度**下线/弃用** | 标 deprecated，历史保留、新快照不再产出该维度 | 曲线不回填假数据 |
| E3 | **高并发**：同 reportId 并发写快照 | IDEM 主键 `(reportId, content_version)` ON CONFLICT DO NOTHING | 恰一条 |
| E4 | **刁钻**：重放旧 report_ready 篡改曲线 | LOG 单调 seq + IDEM 主键去重 | 重放无效 |

**验收**：新维度 → 老点显「无数据」非 0；维度下线 → 历史保留+新快照无该维度；并发写恰一条快照。
**关联**：状态机 AssessmentReport；账本 ability_snapshots(append-only)；原语 IDEM+LOG。

---

### UC-curve-003 · 能力曲线缓存失效（防美化曲线泄漏）
**七类**：正常✔ 异常✔(E1 软删后旧缓存) 特殊✔(空曲线) 逃逸✔(缓存失败回源) 并发✔(E2 失效与读竞态) 复杂✔(多源失效) 刁钻✔(E3 经缓存读已删数据)
- **角色**：系统 / 求职者
- **前置**：曲线有缓存。
- **触发**：软删面试 / 新快照写入。

**主流程**：1) 软删面试或新快照 → 发失效事件 → 曲线缓存即时失效（CAS 版本戳/缓存 key 带 content_version）。2) 下次读回源重算。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 软删面试后旧缓存仍含其分数 | 缓存 key 绑 RLS principal + content_version 戳；失效后回源 RLS 过滤软删 | 已删数据不经缓存泄漏 |
| E2 | **高并发**：失效与读并发 | CAS 版本戳：读到旧戳触发回源 | 不读脏 |
| E3 | **刁钻**：构造「软删差评面试经缓存读旧美化曲线」 | 失效即时 + RLS 回源过滤 | 不可经缓存泄旧分 |

**验收**：软删面试后立即读曲线 → 不含该面试分数（缓存即时失效，断言回源）。
**关联**：原语 CAS(版本戳)+RLS；安全：防美化曲线泄漏。

---

### UC-growth-001 · 成长档案事件累积（威胁模型修正）
**七类**：正常✔ 异常✔(E1 乱序事件) 特殊✔(首个里程碑) 逃逸✔(E2 producer 失败重发) 并发✔(E3 并发追加) 复杂✔(跨域事件聚合) 刁钻✔(E4 重放/伪造写)
- **角色**：系统（内部可信事件总线）/ 求职者
- **前置**：报告/计划/面试产生成长事件（里程碑、能力提升等）。
- **触发**：内部 producer 发成长事件。

**主流程（删签名，改 IDEM+RLS，见 §0.3）**：1) producer 服务端写成长事件，带 **IDEM 单调 seq**。2) append 到成长档案账本（LOG），RLS 绑 principal。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 事件乱序到达 | LOG 单调 seq 排序 | 有序聚合 |
| E2 | producer 失败重发 | IDEM 去重 | 恰一次 |
| E3 | **高并发**：并发追加 | LOG append + IDEM | 不重不丢 |
| E4 | **刁钻**：重放/伪造成长事件刷里程碑 | **内部可信总线 + IDEM 单调 seq（防重放）+ RLS（防越权写/读）**——不引入签名机制 | 重放被 IDEM 拦、越权被 RLS 拦 |

**验收**：重放同 seq 事件 → 恰一条；越权写他人档案 → RLS 0 行。
**关联**：账本 growth_events(LOG)；原语 IDEM+RLS+LOG。

---

### UC-career-001 · 职业路径生成（降级建模对齐 report）
**七类**：正常✔ 异常✔(E1 失败 release/退款) 特殊✔(数据稀疏路径) 逃逸✔(E2 规则版降级) 并发✔(E3 双击) 复杂✔(多步路径推演) 刁钻✔(E4 过度承诺)
- **角色**：求职者 / career 子图
- **前置**：报告/能力曲线就绪；权益 reserved。
- **触发**：用户请求职业路径。

**主流程**：1) `career_path_runs pending→generating`。2) invoke + 双校验（路径建议保留不确定性、不过度承诺）。3) completed → 交付 + confirmed(U)。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 永久失败不可交付 | 状态机：`generating→failed`；release(U) + 预付退款 | 不扣 + 退款 |
| E2 | 模型失败 → 规则版兜底路径 | 逃逸（**M3 对齐**）：`generating→ready_degraded`；confirmed(U/2)+release(U/2)+regen_credit | 半费降级，不再 failed+0+交付的矛盾 |
| E3 | **高并发**：双击生成 | IDEM `resultId:career:v{n}` + CAS | 恰一次 |
| E4 | **刁钻**：诱导「保证 3 个月进大厂」过度承诺 | 反过度承诺业务校验器（确定性） | 拒绝绝对化承诺，保留不确定性 |

**验收**：永久失败 → failed + released(U) + 退款；降级 → ready_degraded + confirmed(U/2)（不再出现 failed+consumption=0+已交付）。
**关联**：契约 `POST /career-path`；状态机 career_path_runs/ConsumptionRecord；原语 CAS+IDEM；安全：反过度承诺。

---

### UC-learn-001 · 学习计划生成（反造假 + 计划取代）
**七类**：正常✔ 异常✔(E1 失败) 特殊✔(首个计划) 逃逸✔(E2 降级) 并发✔(E3 双 active 竞态) 复杂✔(新计划取代旧 active) 刁钻✔(E4 编造不存在资源)
- **角色**：求职者 / learning 子图
- **前置**：报告就绪。
- **触发**：用户请求学习计划（或新报告自动触发新计划）。

**主流程**：1) 生成新 `learning_plan`。2) 若已有 active 计划 → 旧计划 `active→superseded`（CAS），新计划 active，**保证不双 active**。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 生成失败 | 状态机 + §0.2 计费 | failed/降级 |
| E2 | 模型失败 → 规则版计划 | 逃逸：降级计划 | 半费 |
| E3 | **高并发**：并发生成两个计划 | CAS：active 唯一约束 + 旧 active→superseded 守卫 | 恰一个 active |
| E4 | **刁钻**：编造不存在的课程/资源链接 | 反造假校验器：资源须来自白名单/标注不确定 | 不入库虚构资源 |

**验收**：新计划生成 → 旧 active→superseded、系统**不存在双 active**；fake 模型编造资源 → 单元断言被拦。
**关联**：契约 `POST /learning-plan`；状态机 learning_plans；原语 CAS+IDEM；安全：反造假。

---

### UC-learn-002 · 学习进度更新 + completed 反向迁移补偿
**七类**：正常✔(勾选完成) 异常✔(E1 越权改) 特殊✔(全勾 completed) 逃逸✔(E2 状态不一致回退) 并发✔(E3 并发勾选) 复杂✔(completed→active 反向 + 补偿事件) 刁钻✔(E4 取消最后一题)
- **角色**：求职者
- **前置**：计划 active 或 completed。
- **触发**：勾选/取消题目完成。

**主流程**：1) 勾选 → 进度更新（CAS）。2) 全勾 → `active→completed` + 写成长里程碑事件(LOG)。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 越权改他人计划 | RLS fail-closed | 0 行 → 404 |
| E2 | 状态与进度不一致 | CAS 守卫：进度<100% 不可 completed | 一致 |
| E3 | **高并发**：并发勾选同题 | IDEM(题级) + CAS 进度 | 不重复计进度 |
| E4 | **刁钻**：completed 后取消勾选最后一题 → 计划回退 | **反向迁移**：`completed→active`（CAS）+ 发**补偿事件**撤回/标记成长档案里程碑（LOG 补偿，不物理删历史） | 计划回 active；里程碑补偿，不留假完成 |

**验收**：completed 后取消最后一题 → 计划回 active + 成长档案写补偿事件（里程碑标记撤回，append-only 不物理删）；越权改 → 404。
**关联**：契约 `PATCH /learning-plan/:id/progress`；状态机 learning_plans；原语 CAS+IDEM+RLS+LOG(补偿)。

---

### UC-learn-003 · 计划取代/归档生命周期
**七类**：正常✔ 异常✔(E1) 特殊✔(首次无旧计划) 逃逸✔(归档失败回滚) 并发✔(E2) 复杂✔(active→superseded/archived 多态) 刁钻✔(E3 取代竞态双 active)
- **角色**：系统 / 求职者
- **前置**：存在 active 计划。
- **触发**：新报告生成新计划 / 用户手动归档。

**主流程**：1) 新计划生成 → 旧 `active→superseded`（被取代）。2) 用户手动归档 → `active→archived`。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 归档不存在/已终态计划 | CAS 前态守卫 0 行 | 非法迁移拒 |
| E2 | **高并发**：取代与手动归档并发 | CAS：active 守卫，恰一个迁移 | 一致终态 |
| E3 | **刁钻**：构造两个新计划同时取代 → 双 active | active 唯一约束 + CAS | 恰一 active |

**验收**：取代后旧计划 superseded、无双 active；归档已终态计划 → 0 行拒。
**关联**：状态机 learning_plans；原语 CAS。

---

### UC-pay-001 · 报告/路径永久失败或删除已付费面试的退款联动
**七类**：正常✔(成功无退款) 异常✔(永久失败退款) 特殊✔(部分降级半退) 逃逸✔(退款即逃逸出口) 并发✔(E2 重复退款) 复杂✔(reserve→release→refund saga 跨 Payment/Consumption) 刁钻✔(E3 删面试后伪造索退)
- **角色**：commerce 服务
- **前置**：预付费报告/路径；进入永久失败 / 用户删除已付费面试。
- **触发**：永久失败编排事件 / 用户删除已付费面试。

**主流程**：1) `ConsumptionRecord reserved→released`（额度回补 CAS）。2) `PaymentOrder paid/fulfilled→refunding→refunded`（权益回收 CAS）。3) **1 个触发动作 ≤ 1 笔退款**（IDEM 退款键 = `orderId:refund:<cause>`）。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 降级半价：退一半 | §0.2：confirmed(U/2)，refund 差额（IDEM） | 半退 |
| E2 | **高并发**：重复退款请求（双击/重发） | IDEM 退款键唯一 ON CONFLICT DO NOTHING | 恰一笔退款 |
| E3 | **刁钻**：删面试后反复索退/对已 released 再退 | CAS 前态守卫（仅 paid/fulfilled 可 refunding）+ IDEM | 不重复退、不超退 |

**验收（直接命中 CLAUDE.md「禁止跳过 failure-refund」）**：永久失败 → 退全额且恰一笔；降级 → 退半额；重复退款请求 → 副作用一次；对已退订单再退 → 0 行拒。
**关联**：契约 `commerce` 内部；状态机 PaymentOrder/ConsumptionRecord；原语 CAS+IDEM。钱路径 SERIALIZABLE。

---

### UC-entitlement-001 · 共享权益池并发扣减（本域最危险并发缺口）
**七类**：正常✔ 异常✔(E1 余额不足拒) 特殊✔(余额恰为 1) 逃逸✔(E2 扣减失败 release) 并发✔(核心：跨图同抽一池) 复杂✔(check-then-confirm 跨聚合) 刁钻✔(E3 并发 confirm 透支攻击)
- **角色**：commerce 服务（report / career / learning 三图共享一个 AI credit 池）
- **前置**：用户 AI credit 余额=1；两场不同图（如 report + career）同时收尾各自要 confirm。
- **触发**：两图并发 reserve/confirm。

**主流程（CAS 余额，跨对象同抽一池）**：
1. reserve 阶段即 **CAS 扣减可用额度**（`UPDATE entitlement SET available=available-1 WHERE id=$id AND available>=1 RETURNING`）——**不是 check-then-confirm**，预占即扣。
2. 0 行 = 余额不足 → 拒绝启动该图。
3. confirm 仅把 reserved 落实 confirmed；release 把预占额度 CAS 回补。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 余额不足 | CAS `available>=1` 0 行 → 拒 | 不启动 |
| E2 | 图失败 | release：`available=available+1` CAS 回补 | 额度归还 |
| E3 | **高并发/刁钻**：两图各校验余额=1、各 confirm → 透支 | **预占即 CAS 扣减**（reserve 阶段竞争），杜绝 check-then-confirm 窗口；第二个 reserve 0 行被拒 | 无透支、无丢扣 |

**验收（Testcontainers 并发）**：N 并发不同图同时对余额=1 的池 reserve → **恰一个成功、其余被拒、最终 available≥0 无透支**；失败 release → 额度精确回补、无丢扣。
**关联**：状态机 ConsumptionRecord；原语 **CAS（核心）**+IDEM。钱路径 SERIALIZABLE/FOR UPDATE。

---

### UC-export-001 · 报告导出作业失败与降级
**七类**：正常✔(PDF 成功) 异常✔(E1 渲染崩) 特殊✔(空报告导出) 逃逸✔(E2 HTML 兜底) 并发✔(E3 重复导出 idem) 复杂✔(render-job 异步状态机) 刁钻✔(E4 旧版本产物泄漏)
- **角色**：求职者 / 导出渲染服务
- **前置**：报告 completed。
- **触发**：用户请求导出（PDF）。

**主流程**：1) `export_jobs queued→rendering`（CAS）。2) 渲染产物落 S3。3) `rendering→ready`，产物 idem 键 = `reportId:export:v{content_version}:pdf`。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 渲染服务崩/超时 | 状态机：`rendering→failed`，**返回可见错误非 500** | 用户可见失败+重试 |
| E2 | PDF 渲染不可用 | 逃逸：`rendering→degraded_fallback`（HTML 兜底） | 降级产物可下载 |
| E3 | **高并发**：重复导出请求 | IDEM 产物键唯一 → 复用同一产物 | 产物唯一、不重复渲染 |
| E4 | **刁钻**：报告 regen 后旧 content_version 导出产物被读 | 产物键含 content_version → 旧版本失效需重算(UC-006/007 联动) | 不导出过期产物 |

**验收**：渲染崩 → 降级且**非 500**、产物唯一；重复导出 → 复用产物恰一份；regen 后旧产物失效。
**关联**：契约 `POST /reports/:id/export`；状态机 export_jobs；原语 CAS+IDEM。

---

### UC-share-001 · HR 共享授权（独立授权对象，不复用 owner-RLS）
**七类**：正常✔(签发可读) 异常✔(E1 撤销后拒) 特殊✔(scope=单维度) 逃逸✔(E2 过期自动失效) 并发✔(E3 并发撤销) 复杂✔(签发/scope/过期/撤销生命周期) 刁钻✔(E4 scope 越界/绕 owner-RLS)
- **角色**：求职者（owner，签发）/ HR（持 token 读）
- **前置**：报告 completed，owner 决定对外分享。
- **触发**：owner 签发 share-grant（限定 scope + 过期）。

**主流程**：1) 创建 `share_grants(active, scope, expires_at, token_hash)`，绑 reportId + owner principal。2) HR 持 token 访问：**校验 share_grant 而非 owner-RLS**——token 有效 + active + 未过期 + scope 内字段才返。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | owner 撤销后 HR 再访问 | 状态机：`active→revoked`（CAS），即时失效 | 旧 token 拒 |
| E2 | token 过期 | `active→expired`（expires_at 守卫） | 自动失效 |
| E3 | **高并发**：并发撤销与访问 | CAS 状态守卫 | 撤销赢则即时拒 |
| E4 | **刁钻**：HR 用 token 越 scope 拉全报告/绕 owner-RLS 读他人 | **scope 白名单字段过滤** + token 仅授某 reportId，非 principal；越 scope 0 行 | 越界拒、不泄 scope 外字段 |

**验收**：撤销后旧 token 即拒；scope 越界字段拒返；token 仅能读被授 reportId 的 scope 内字段，**不获得 owner 全权**。
**关联**：契约 `POST /reports/:id/share`、`GET /shared/:token`；状态机 share_grants；原语 CAS（撤销）+ 授权对象（非 RLS owner 复用）；安全：故意绕 owner-RLS 的授权面必须有独立生命周期。

---

### UC-sse-001 · SSE 断线重连补偿
**七类**：正常✔(实时收 report_ready) 异常✔(E1 断连期间事件) 特殊✔(从头无 Last-Event-ID) 逃逸✔(E2 SSE 挂掉转轮询拉取) 并发✔(E3 多标签页) 复杂✔(LOG 回放有序去重) 刁钻✔(E4 伪造 Last-Event-ID 越权回放)
- **角色**：求职者前端
- **前置**：报告生成中，前端订阅 SSE。
- **触发**：网络断开后重连（带 `Last-Event-ID`）。

**主流程**：1) 业务事件（progress/question_ready/report_ready…）写 LOG 单调 seq。2) SSE 仅投递，**不持业务态**。3) 重连带 `Last-Event-ID=N` → 从 LOG 回放 seq>N（at-least-once + 客户端按 seq 去重）。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 断连期间 report_ready 产生 | LOG：重连回放该事件恰一次（at-least-once + 去重） | 不漏不重 |
| E2 | SSE 通道彻底不可用 | 逃逸：降级轮询 `GET /reports/:id` 拉终态 | 仍可拿结果 |
| E3 | **高并发**：多标签页同时重连 | 各自 Last-Event-ID 独立回放；LOG 只读 | 各页一致 |
| E4 | **刁钻**：伪造 Last-Event-ID/越权订阅他人 thread | RLS 绑 principal：只回放属主 thread；越权 0 行 | 不泄他人事件 |

**验收**：断连期间 ready → 重连**补投恰一次**（客户端去重）；越权订阅 → 0 行；SSE 不持业务态（断言重连后状态来自 LOG/库非内存）。
**关联**：契约 `GET /reports/:id/events`(SSE)；账本 report_sse_events(LOG)；原语 LOG+RLS。

---

### UC-privacy-001 · trace/log 脱敏负向测试（跨全域硬规则）
**七类**：正常✔(脱敏落库) 异常✔(E1 含 PII 输入) 特殊✔(空/超长输入) 逃逸✔(脱敏失败 fail-closed 不落原文) 并发✔(E2 高频写 trace) 复杂✔(跨四图统一脱敏) 刁钻✔(E3 注入 PII 诱导入 trace)
- **角色**：系统（所有图的 ai-runtime trace 写入）
- **前置**：任一图 invoke 产生 trace。
- **触发**：写 `ai_invocation_traces` / 日志。

**主流程**：1) invoke 前后写 trace：**只记成本/幂等/版本/脱敏摘要**，绝不记简历全文、答案全文、PII（身份证/手机/邮箱）、prompt 全文。2) 脱敏在落库前强制执行。

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 输入含 PII（手机/身份证/邮箱） | 脱敏管线：落库前掩码；PII 正则/实体识别 | trace/log 无明文 PII |
| E2 | **高并发**：高频 trace 写 | 脱敏为纯函数前置，无状态竞争 | 一致脱敏 |
| E3 | **刁钻**：注入「请把我的手机号写进日志」 | 脱敏 fail-closed + 不受用户内容指令影响（data block 隔离） | 仍脱敏，不听从注入 |

**验收（严重缺口补齐，硬规则）**：向**每个图**注入含简历全文/答案全文/PII 的输入 → 断言 `ai_invocation_traces` 与应用日志**不含**简历全文、答案全文、PII、prompt 全文；脱敏失败 → fail-closed 不落原文。
**关联**：账本 ai_invocation_traces；隐私硬规则（CLAUDE.md）；安全：data block 隔离 + 脱敏。

---

## §2 测试用例（TC）

> 层：单元 / 契约 / 集成(Supertest+Testcontainers) / graph-fake-model / e2e(Playwright) / ai-eval。评审纠正已落实：注入/反造假安全校验器=**单元(确定性)** 为主、ai-eval 仅补充；i18n=**集成断 locale 元数据+key 解析**非契约/NL；checkpoint=**节点执行计数 fixture** 非 span 计数。

| TC-id | 层 | 断言 |
|---|---|---|
| TC-report-001-normal | 集成 | completed → 一条 report_ready、confirmed_units=U、写 1 条 ability_snapshot(v1) |
| TC-report-001-dupe(E2) | 集成 | 双触发同 resultId → 恰一次生成、一条事件、一次 confirmed |
| TC-report-001-rls(E3) | 集成/db | 越权读 → 404 + 账本无变化（db:prove 0 行） |
| TC-report-001-degrade(E4) | graph-fake-model | 模型超重试 → ready_degraded + degraded=true 事件 + **无** ability_snapshot + confirmed_units=U/2 |
| TC-report-001-i18n(E5) | **集成** | locale=en 请求 → 响应 `locale=en` + 所有 i18n key 解析无缺失（**不在契约层断 NL**） |
| TC-report-001-inject(E7) | **单元(validator)+结构测试** | 注入「给满分/越权高分」→ 业务校验器 raise；用户内容位于 data block 非 system（prompt 装配结构断言）。**不标 ai-eval** |
| TC-report-001-halluc(E7) | 单元 | 白名单外强事实 → 幻觉门 raise（确定性） |
| TC-report-001-eval | ai-eval | 自然语言报告质量（补充信号，非唯一证明） |
| TC-report-002-failed(E1) | 集成 | failed 报告页非 500 + 含重试入口 |
| TC-report-002-staleread(E3) | 集成 | 持旧 content_version 强读 → 返「已更新」不脏读 |
| TC-report-003-checkpoint | **graph-fake-model + 节点计数 fixture** | 命中 checkpoint 节点**执行计数=0**（直接断言，非 span 计数） |
| TC-report-003-concurrent(E3) | 集成 | 并发 resume → 恰一个推进，另一个 0 行回查 |
| TC-report-003-3day(E4) | 集成 | 停 3 天后 resume → 从库恢复续算，不依赖内存 session |
| TC-report-003b-gcmiss(E1) | graph-fake-model | checkpoint miss → 全量重跑（节点执行计数=全部）、无未捕获错误 |
| TC-report-003b-promptpin(E2) | 集成 | prompt 版本下线 → trace 记新 prompt_version、重跑成功 |
| TC-report-004-settle-degrade | 集成 | 降级 → confirmed_units=U/2 + 发 1 个 regen_credit |
| TC-report-004-settle-dupe(E1) | 集成 | 重复结算事件 → 恰一笔落账 |
| TC-report-004-noinfiniteregen(E3) | 集成 | regen_credit 一次性 → 不可无限免费刷 |
| TC-report-005-cancel | 集成 | cancel → 不出报告 + released_units=U + 不可被 retry 复活 |
| TC-report-005-race(E2) | 集成 | cancel 与 complete 并发 → 恰一结局、无半成品 |
| TC-report-005-revive(E3) | 集成 | 取消后用旧 checkpoint retry → 被拒（canceled 不在 retryable 集） |
| TC-report-006-upgrade | 集成 | 升级 → tier=full + content_version+1 + 新快照 |
| TC-report-006-payfail(E1) | 集成 | 支付未到账 → 不进 upgrading、tier 不变 |
| TC-report-006-refund(E4) | 集成 | 升级后退款 → tier 回 lite（权益回收 CAS） |
| TC-report-007-regen-version | 集成 | regen → 同 reportId、content_version+1、新快照追加（旧快照保留） |
| TC-report-007-oldidem(E4) | 集成 | 复用旧 v1 idem → 返旧版本不冒充新（M2） |
| TC-report-007-concurrent(E3) | 集成 | 并发 regen → 恰一版本推进 |
| TC-report-008-killswitch(E1) | 集成 | kill-switch off → 在途 generating run 被中断走降级 + 新 run 被拒 |
| TC-review-001-antifabricate(E1) | **单元(fake 模型注入捏造经历→断言被校验器拦)** | 反造假校验器拦截（确定性强制点） |
| TC-review-001-eval | ai-eval | 复盘质量补充信号 |
| TC-curve-001-newdim(E1) | 集成 | 新维度 → 老快照点显「无数据」非 0 |
| TC-curve-001-deprecate(E2) | 集成 | 维度下线 → 历史保留、新快照无该维度 |
| TC-curve-001-concurrent(E3) | 集成/db | 并发写同 (reportId,content_version) → 恰一条快照 |
| TC-curve-001-replay(E4) | 集成 | 重放旧 report_ready → IDEM 拦、无新快照 |
| TC-curve-003-invalidate(E1) | 集成 | 软删面试后读曲线 → 不含其分数（缓存即时失效回源） |
| TC-curve-003-race(E2) | 集成 | 失效与读并发 → 不读脏（CAS 版本戳） |
| TC-growth-001-replay(E4) | 集成 | 重放同 seq 成长事件 → 恰一条（IDEM 单调 seq，**无签名机制**） |
| TC-growth-001-rls(E3) | db | 越权写他人成长档案 → 0 行 |
| TC-career-001-degrade(E2) | graph-fake-model | 模型失败 → ready_degraded + confirmed(U/2)（不再 failed+0+交付矛盾） |
| TC-career-001-failrefund(E1) | 集成 | 永久失败 → failed + released(U) + 退款 |
| TC-career-001-overpromise(E4) | **单元(fake 模型注入「保证进大厂」→断言被拦)** | 反过度承诺校验器拦截（确定性）。**ai-eval 仅补充** |
| TC-learn-001-noduplicateactive(E3) | 集成/db | 并发生成 → active 唯一、旧 active→superseded |
| TC-learn-001-fabricate(E4) | **单元(fake 模型注入虚构资源→断言被拦)** | 反造假校验器拦截。**ai-eval 仅补充** |
| TC-learn-002-reverse(E4) | 集成 | completed 取消最后一题 → 计划回 active + 成长档案写补偿事件(不物理删) |
| TC-learn-002-rls(E1) | db | 越权改他人计划 → 404/0 行 |
| TC-learn-003-supersede(E2) | 集成 | 取代与归档并发 → 恰一终态、无双 active |
| TC-pay-001-failrefund | 集成 | 永久失败 → 退全额且恰一笔（命中 CLAUDE.md failure-refund） |
| TC-pay-001-dupe-refund(E2) | 集成 | 重复退款请求 → 副作用一次（IDEM） |
| TC-pay-001-half(E1) | 集成 | 降级 → 退半额 |
| TC-pay-001-overrefund(E3) | 集成 | 对已退订单再退 → 0 行拒（CAS 前态守卫） |
| TC-entitlement-001-overdraw | **集成(Testcontainers 并发)** | N 并发不同图对余额=1 池 reserve → 恰一成功、其余拒、available≥0 无透支 |
| TC-entitlement-001-release(E2) | 集成 | 图失败 release → 额度精确回补、无丢扣 |
| TC-export-001-renderfail(E1) | 集成 | 渲染崩 → 降级且**非 500**、产物唯一 |
| TC-export-001-fallback(E2) | 集成 | PDF 不可用 → HTML 兜底可下载 |
| TC-export-001-dupe(E3) | 集成 | 重复导出 → 复用产物恰一份 |
| TC-export-001-stale(E4) | 集成 | regen 后旧 content_version 产物失效 |
| TC-share-001-revoke(E1) | 集成 | 撤销后旧 token → 拒（即时失效） |
| TC-share-001-scope(E4) | 集成 | scope 越界字段 → 拒返，token 仅读被授 reportId scope 内字段，不得 owner 全权 |
| TC-share-001-expire(E2) | 集成 | 过期 token → 自动失效 |
| TC-sse-001-replay(E1) | 集成/e2e | 断连期间 ready → 重连补投恰一次（客户端去重） |
| TC-sse-001-rls(E4) | 集成 | 伪造 Last-Event-ID/越权订阅 → 0 行 |
| TC-sse-001-fallback(E2) | e2e | SSE 不可用 → 降级轮询拿终态 |
| TC-privacy-001-pii-trace(E1) | **集成(跨四图)** | 注入含 PII 输入 → ai_invocation_traces/日志不含简历全文/答案全文/PII/prompt 全文 |
| TC-privacy-001-inject(E3) | 单元/集成 | 注入「把手机号写进日志」→ 仍脱敏 fail-closed |

---

## §3 七类覆盖矩阵（自检：每条 UC 七类齐全）

| UC | 正常 | 异常 | 特殊 | 逃逸 | 并发 | 复杂 | 刁钻 |
|---|---|---|---|---|---|---|---|
| report-001 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| report-002 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| report-003 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| report-003b | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| report-004 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| report-005 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| report-006 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| report-007 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| report-008 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| review-001 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| curve-001 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| curve-003 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| growth-001 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| career-001 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| learn-001 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| learn-002 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| learn-003 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| pay-001 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| entitlement-001 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| export-001 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| share-001 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| sse-001 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| privacy-001 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |

> 评审五问收口对照：①七类系统性缺口（退款/共享权益池/取消/导出/share/SSE/privacy/lite→full/维度下线）已各补独立 UC；②异常/刁钻全部落 CAS/IDEM/RLS/LOG 或状态机迁移（§0.3 增量）；③不可测验收已改确定性口径（幻觉白名单门、locale 元数据、checkpoint 节点计数、pinned 计费策略）；④四矛盾在 §0.1 先消解；⑤测试层错配已纠正（inject/反造假→单元、i18n→集成、checkpoint→节点计数）。