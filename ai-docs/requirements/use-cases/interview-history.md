---
id: requirements_uc_interview_history
name: 用例集 · 面试历史（interview-history）
description: 第二批能力缺口「面试历史」终稿。按资深产品+QA 两轮对抗评审补齐七类 case、异常/刁钻逐条落机制、验收可测、配齐测试用例，一律走 Meetwise 承重设计（四原语/RLS/双校验/状态机/可观测三账本/安全护栏五层）。会话状态以「行 CAS + run 级 fencing/lease」建模（不用内存 Map 假设单进程：重启/多实例即丢会话）；会话生命周期闭环（过期/废弃/退费）、非时间排序分页正确性、resume 失败补偿、被遗忘权对财务账本的边界 四处致命缺口已逐项收口。
type: use-case
scope: cend
level: spec
status: active
owner: product
related:
  - ./use-case-conventions.md
  - ./UC-interview-submit-answer.md
  - ./cend-mock-interview.md
  - ../../rules/global/production-invariants.md
  - ../../rules/global/status-machine.md
  - ../../architecture/ai/langgraph-blueprint.md
  - ../open-decisions.md
---

# 用例集 · 面试历史（interview-history）

> **🔎 实现状态（对齐真实代码 · 2026-08-09）** — 本文是 TARGET（目标）规格，不能把后续流程图或测试编号当作已跑证据。**✅ 已实现并有局部实测**：面试/报告历史读取、RLS（行级安全）principal（主体）绑定；列表/详情进度投影 `issued_turns`/`answered_turns`（题目账本），与成长主页「已答题数」同源，见 [cend-overview-progress](./cend-overview-progress.md)；LangGraph（图编排框架）checkpoint（检查点）通过 `CheckpointAccess(owner,threadId,fenceEpoch)` 与数据库触发器拒绝撤回后的迟到写入，跨主体读、改、删为 0 的真实 PostgreSQL（关系型数据库）证明已通过。**🟠 部分 / ⬜ 未建**：本节定义的完整 `AiGraphRun` lease（租约）抢占、历史 checkpoint 物理删除与外部数据面回执、会话生命周期看门狗、非时间排序的复合 keyset（键集）分页、被遗忘权对财务账本的排除清单，均不能当作已完成发布能力。基础历史读取与隔离已生效。

> 评审定论（两轮）：契约面（RLS / IDOR-404 / 游标 / CAS）骨架扎实；致命失分集中在四处并已收口——①分布式「至多一个活动 run」的执行机制（错把保证放在 `Interview` 行 CAS 上，而 checkpoint 按 `thread_id` 写、不经这把 CAS → 脑裂）→ 0.1 fencing/lease；②**会话生命周期闭环**（谁/何时/按什么 TTL 把 `in_progress/waiting_user` 迁成 `expired/abandoned`，以及对应退费）→ 0.2 + 0.3 + 新增 **UC-IH-13 看门狗**；③**非时间排序的分页正确性**（按 score/role 排序时裸 `(started_at,id)` 游标会重复/跳漏）→ 0.6 复合 keyset；④**被遗忘权对财务账本的边界**（naive cascade 会删交易凭证）→ 0.8 erasure 排除清单。其余无法测的高成熟度承诺（读副本降级、报告译文层、时延持平断言）一律降级/移除。

---

## 0. 横切不变量（本领域所有 UC 共用，先定义再被各 UC 引用）

### 0.1 单活动 run 的真正执行点 = AiGraphRun fencing token + lease 心跳（修评审②1/②2/⑤，P0-阻断）

`Interview` 行 CAS 管不到 LangGraph checkpoint 写（checkpoint 按 `thread_id` 写库），所以「至多一个活动 run」**不能**只靠 `Interview.status+version` CAS。承重机制：

- `AiGraphRun` 增列：`fenceEpoch int`（每线程单调递增的栅栏世代）、`leaseOwner`（实例/请求标识）、`leaseExpiresAt`、`heartbeatAt`。每 `threadId` 任意时刻**至多一个有效 lease**。
- **抢锁/续跑** = 两段 CAS：先对 `Interview` 行 CAS（前态守卫），**再**对该 `threadId` 的 run lease CAS 抢占：仅当旧 lease 已死（`leaseExpiresAt < now()` 或心跳超时）才允许 `fenceEpoch = fenceEpoch + 1`，返回新 epoch。
- **目标态：所有 checkpoint 写入带 fence 校验**：本规格要求 checkpointer 写入守卫等价于 `thread_id=$tid AND fenceEpoch=$myEpoch`；陈旧 run（低 epoch）写入返回 0 行 → 该 run 判定「被栅栏」→ 自我转 `safe_terminating`（不改写 checkpoint，不脑裂）。当前 `0047_checkpoint_privacy_fence` 已以 `CheckpointAccess(owner,threadId,fenceEpoch)` 和三张 vendor（供应商）checkpoint 表的触发器实现“撤回后旧 epoch 拒写”，但尚未实现本节完整的 `AiGraphRun` lease 抢占/心跳/接管状态机；不得将两者混为一项已完成能力。
- **心跳**：活动 run 周期性 `UPDATE … heartbeatAt=now() WHERE fenceEpoch=$myEpoch`；0 行 = 已被抢占 → 立即停机安全终止。
- **死 run 检测**：`leaseExpiresAt < now()`（心跳超时）→ 该 run 可被抢占；**僵尸 `Interview.active` 但 lease 已死**（实例崩溃）→ resume 时检测到死 lease，bump epoch 栅栏僵尸，再拉起新 run（不会拉起第二个活动 run）。
- **`resume_lock` 布尔锁是反模式**（违反「显式状态枚举、禁布尔汤」「等待态由持久化 state 表达」），**本设计不引入**任何 ad-hoc 锁标志：单写者互斥完全由 `AiGraphRun` 的 `fenceEpoch/lease` 状态迁移 + CAS 表达。

### 0.2 会话过期 resumableUntil（修评审④1，P0）

- `Interview` 进入 `waiting_user` 时写 `interruptedAt`，派生 `resumableUntil = interruptedAt + RESUMABLE_TTL`（`PIN=7天`，待签 → open-decisions）。
- resume 守卫含 `resumableUntil > now()`；过期 → 由 **UC-IH-13 看门狗** CAS 迁移 `waiting_user → abandoned`，触发 `ConsumptionRecord released`（退还），并入队 checkpoint GC（`AiGraphRun → safe_terminating`，回收 checkpoint）。
- 与 UC-IH-06 PURGE 协同：`abandoned` 仍是历史记录，可被软删/清除；GC 只回收**运行时** checkpoint，不删业务事实。

### 0.3 计费时点与退费规则（修评审④2「失败/废弃会话退费未定义」，P0；面试计费口径,与 e2e 一致。注:此为**面试**会话计费,与图片 OCR 的按次计费决策B 无关）

**1 次额度 = 一场面试**。`ConsumptionRecord reserved` 发生在面试 **start**（创建 `Interview` 同事务，可用额度 CAS 扣减）；`reserved → confirmed` 触发点 = `Interview.completed`；**未完成即结束的一切路径一律 `released`（退还额度）**：

| 终止路径 | 触发者 | ConsumptionRecord | 是否退额度 |
|---|---|---|---|
| `completed` | 正常收尾 | `reserved→confirmed` | 否（已消费） |
| `failed`（resume/图不可恢复） | 业务服务 | `reserved→released` | **是** |
| `abandoned`（过期/用户中止/清空删除 in_progress） | UC-IH-13 看门狗 / 用户 | `reserved→released` | **是** |
| start 前放弃（未创建 Interview） | — | 无 reserved | 无扣费 |

- **退还（release）必须幂等**：`ConsumptionRecord` 用 `(reserved→released)` CAS + `version` 守卫，同一记录重复 release → 0 行 → 幂等无副作用（看门狗/用户/补偿可能并发触发，断言额度只回一次）。退还落 `cost_ledger(release, reason)` 成本账本，可对账。
- **resume 永不重复扣费**（resume 不碰 `ConsumptionRecord`，已 reserved）。
- **report 含在本次面试内，不单独计费**；**report 重生成（retry）永不计费**（面试已 completed、额度已 confirmed），失败默认不退款，提供免费重生成。
- **导出不计面试额度**（导出是数据可携权，免费但受 UC-IH-12 配额限流），见 0.9。

### 0.4 Idempotency-Key 原语规格化（修评审②3/②6/④10，P1）

所有写端点（resume / delete / batch-delete / restore / export / report:retry）须带 `Idempotency-Key`：

- 存 `idempotency_key(principal, key)` UNIQUE，落请求体规范化指纹 `bodyHash`、响应快照、`expires_at`。
- 同键同 body（TTL 内）→ 重放存储响应，**不重复执行**。
- 同键异 body → `422 idempotency_conflict`。
- 键过 TTL 被 GC → 视为新键。
- **TTL 分级写死（不再「按策略」）**：
  - 状态变更类（resume / delete / batch-delete / restore / report:retry）`TTL=24h`。
  - **导出 `export` `TTL=60s`（短 TTL）**：导出物是「生成时刻数据快照」，数据会变；60s 内同键同 body 重放同一 `exportJob`（避免双击重复生成），超 60s 视为新导出请求（避免返回过期快照当最新，修评审③「导出幂等返回过期快照即错误」）。
- **resume 的幂等语义 = 续接而非创建**：同键同 body 命中且图已推进时，「同一结果」= **同一 `threadId` 当前 run 的状态快照**（当前 `fenceEpoch`/状态/最新事件 `seq`），**不**二次 resume、**不**二次抢 lease。

### 0.4' 高危操作二次确认令牌 confirmToken（修评审②3，P1）

「立即彻底删」「清空全部 `all:true`」「全量含正文导出」属**高危不可逆/高 PII 出口**操作，除 `Idempotency-Key` 外另需 `confirmToken`：

- 服务端 `POST …:prepare` 签发 HMAC `confirmToken`，绑定 `(principal, 操作类型, 目标集指纹 targetDigest, exp)`，`TTL=5min`。
- 执行端点校验 `confirmToken` 签名 + 未过期 + `targetDigest` 与本次请求实际目标集一致（防签发后目标集被扩大）。失效/不符 → `409 confirm_required` / `422 confirm_mismatch`。
- 普通「软删单条（可 undo）」不需要 confirmToken（低风险，宽限期可恢复）。

### 0.5 枚举白名单显式排除内部态（修评审④3，P1）

筛选/搜索的 `status` 多选白名单 = `{created, active, waiting_user, completed, failed, abandoned}` 中**对用户可见**子集；**显式排除** `soft_deleted / purging / purged`（删除子态）；`abandoned` **默认隐藏**、仅显式勾选可见（防存在性泄漏）。传内部态 → `422 invalid_status_filter`（不静默忽略，否则掩盖攻击意图）。

### 0.6 键集分页：支持非时间排序的复合 keyset 游标（修评审③/④1「非时间排序游标未定义=强发现」，P0）

**绝不裸 OFFSET。** 每种 `sort` 定义专属复合 keyset 游标，游标 payload = 排序键三元组的不透明 HMAC 编码（防篡改/防越权枚举），追加 `(started_at, id)` 作**唯一裂决尾键**保证全序、不重不漏：

| sort | 游标键 | NULL 排序 | 覆盖索引 |
|---|---|---|---|
| `time`（默认） | `(started_at DESC, id DESC)` | — | `(owner, deletion_status, started_at DESC, id DESC)` |
| `score` | `(score DESC **NULLS LAST**, started_at DESC, id DESC)` | 空分（未出报告）统一排末尾 | `(owner, deletion_status, score DESC NULLS LAST, started_at DESC, id DESC)` |
| `role` | `(role_name ASC **NULLS LAST**, started_at DESC, id DESC)` | 空角色名排末尾 | `(owner, deletion_status, role_name NULLS LAST, started_at DESC, id DESC)` |

- 谓词 `WHERE (sortKey, started_at, id) < (cursorSortKey, cursorTs, cursorId)`（按各列方向展开为字典序比较），**NULLS LAST 同向编码进游标**。
- 游标内编码当前 `sort`；翻页中切换 `sort` → 游标失配 → `400 cursor_sort_mismatch`（不静默退化 OFFSET）。
- **未定义复合游标的 sort 一律拒绝**（`422 unsupported_sort`），杜绝「静默退化裸 OFFSET 的性能 bug + 分页重复/跳漏」。
- 0.4' 的 `score` 列来源见 0.10（只读派生投影，带版本戳，最终一致），分页用投影列保证排序稳定。

### 0.7 删除即吊销在途下载（修评审②4/⑥，P1）

详情答案分段、export 下载**不直接下发 S3 presign**，而是经应用代理的短令牌（`downloadToken`，TTL ≤ 60s，绑定 `objectId + principal + urlEpoch`）。下载端点请求时再校验对象 `deletion_status = visible` 且 `urlEpoch` 匹配；PURGE/软删 bump `urlEpoch` → 在途令牌即时失效（被遗忘权无 TTL 泄漏窗口）。本期**统一采用应用代理短令牌（不直连 presign）**，消除「签名 URL 吊销窗口」整类问题（不再「二选一按策略」）。

### 0.7' 性能验收口径（修评审③/⑤「时延持平不可测」，P2）

不用裸 `<200ms`/`EXPLAIN 命中具体计划`（planner 跨版本漂移、CI flaky）。改为：**固定数据集（每用户 5,000 条种子）+ 计划结构断言**——「**无 Seq Scan + 无 OFFSET 节点 + 扫描行数有界（`rows_scanned ≤ limit + Δ`）**」，不锁定具体计划、**不断言「第 1 页与第 250 页耗时持平/恒定」**（天然 flaky，删除）。可选 P95 去抖动采样仅作**回归基线记录**，非硬失败门。单 Postgres 主库超时 → `503 + 不返回半量`（删除「读副本 stale=true」逃逸，本期基建无读副本，见⑤）。

### 0.8 被遗忘权的账本边界：erasure 排除清单（修评审④3「误删财务账本=合规+收入完整性 bug」，P0）

PURGE 级联**必须显式排除**法定须保留的账本，naive cascade 严禁删除：

- **保留（仅去标识，不删行）**：`consumption_record`（额度交易凭证）、`payment_order`/`refund_order`/`invoice`（财务凭证）、`audit_log`（操作审计骨架）。这些做**去标识**（把 `owner_user_id` 替换为不可逆 pseudonymous tombstone id、清除任何嵌入正文/PII 字段），保留金额/时间/状态/关联 id 以满足法定保存年限与对账。
- **物理删除（正文清除）**：`Interview` 业务行明细、答案正文、报告 body、LangGraph checkpoint、S3 对象、向量嵌入、`interview_event` 正文载荷。
- 验收硬断言：PURGE 后「该用户已无可召回正文/向量」**且**「`consumption_record`/财务凭证行仍在、金额可对账、但已去标识」。

### 0.9 导出二次认证 + 出口审计（修评审④6/必补11「PII 全量导出无 step-up」，P1）

全量/含正文导出是高危 PII 出口，签名短链不足，C 端加：

- **Step-up 认证**：发起导出前要求二次校验（重输密码或一次性验证码）；近 `PIN=10min` 内已 step-up 可豁免。未通过 → `401 step_up_required`。
- **出口审计**：导出生成与每次下载都写 `export_audit`（principal、范围指纹、objectId、IP/UA、时间），独立于业务事件账本，供合规追溯。
- 配合 0.7（应用代理 downloadToken）+ 0.7' urlEpoch 即时吊销。

### 0.10 列表分数投影的来源与同步（修评审④4「score 占位来源/同步未定义，事实两处漂移」，P1）

列表/排序用的 `score` 是**只读派生投影**，事实源唯一为 `AssessmentReport.overallScore`：

- report `→completed`（含重生成）时，经**事务性 outbox 单写者**把 `overallScore + reportVersion` 反范式化写入 `Interview.scoreSummary`（带版本戳）。
- 投影列**只读、永不被直接编辑**；重生成后按 `reportVersion` 单调覆盖，最终一致。读列表读投影（避免每行 join 报告表 + 避免两处可写漂移，满足「一个结论一处」：事实在报告，列表是其只读快照）。
- 未出报告 → 投影为 NULL，排序按 0.6 `NULLS LAST`。

### 0.11 时间筛选时区口径（修评审④7「from/to 忽略用户时区，跨设备必现」，P2）

- `from/to` 契约要求传**带时区偏移的 ISO-8601**（或显式 `tz` 参数）；服务端统一转 UTC 比较，区间语义为**半开 `[from, to)`**（明确文档化，消除 `from==to` 同一秒边界歧义）。
- 缺时区 → 按用户 profile 时区解析，再缺 → UTC；响应回显 `resolvedTz` 供前端校对。

### 0.12 关键词/查询的审计脱敏（修评审②6「敏感分类器不可实现」，P2）

需审计的搜索/筛选关键词**一律 salted-hash 或截断到 `PIN=8` 字符**入 `audit_log`，**绝不存原文明文**——取消「敏感分类器」这一不可实现/不可测设计。验收用「索引/审计字段不含答案正文字段」的**结构断言**证明（schema 层），不用「查询证伪」。

---

## 用例

### UC-IH-01 · 历史列表加载与排序分页

- **角色**：求职者
- **前置**：已登录，持有 principal 上下文（RLS 生效）。
- **触发**：进入「面试历史」页 / 下拉翻页（keyset 游标）/ 切换排序（时间/得分/角色）。

**主流程 Main**
1. 鉴权解析 principal → `SET LOCAL app.principal`（事务模式连接池，RLS fail-closed）。
2. 按 0.6 选定 `sort` 的复合 keyset 查询，谓词含 `deletion_status='visible'` 且 0.5 默认可见态。
3. 返回当前页 + `nextCursor`（HMAC 不透明，内编码 sort）；每行仅元数据（标题/角色/状态/时间/**分数投影 0.10**），不含正文。

**七类覆盖**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | 翻页加载 | keyset 游标 + 复合索引 | 纯读 |
| 异常 | E1 | 主库超时 | 0.7' 显式 `503`，**不返回半量** | 无 |
| 特殊 | S1 | 空历史（首次用户） | 返回空集 + 空态契约（见 UC-IH-09） | 无 |
| 特殊 | S2 | i18n：`Accept-Language: en` | 元字段 label 走 i18n 资源；正文原文语言**不翻译**（本期 non-goal） | 无 |
| 特殊 | S3 | 按 score 排序但大量未出报告（score 空） | 0.6 `NULLS LAST` + 投影 0.10；空分稳定排末尾 | 无 |
| 逃逸 | X1 | 列表渲染压力过大 | 服务端硬上界 `limit≤50`，超限截断 + `truncated=true`；**不读副本** | 无 |
| 高并发 | C1 | 翻页中并发软删某行 | keyset 不依赖 OFFSET，删除只改 `deletion_status` 谓词；不串页、不重复 | 无 |
| 高并发 | C2 | 翻页中某行报告重生成刷新 score 投影 | 0.10 投影按 reportVersion 单调覆盖；keyset 锚定快照点不跳行 | 无 |
| 复杂 | M1 | 跨 created/active/waiting_user/completed 混合态 + score 排序分页 | 单复合索引覆盖；尾键 `(started_at,id)` 唯一裂决 | 无 |
| 刁钻 | T1 | 篡改/猜测 `cursor` 越权枚举他人记录 | 游标 HMAC 校验失败 → `400`；即便伪造，RLS 谓词 0 行 → 不泄露存在性 | 无 |
| 刁钻 | T2 | 翻页中切 sort 复用旧游标 | 游标内 sort 失配 → `400 cursor_sort_mismatch`（不退化 OFFSET） | 无 |
| 刁钻 | T3 | `sort=answer_text` 等未定义排序键 | `422 unsupported_sort` | 无 |

**验收标准 Acceptance（可测）**
- 固定 5,000 条种子，time/score/role 三种排序第 1 页与第 250 页 EXPLAIN **无 Seq Scan、无 OFFSET 节点、扫描行数有界**（不断言耗时持平）。
- score 排序：100 条空分 + 重复分跨页 → 取回集合**无重复 id、无跳漏 id**（直接验证 0.6 复合游标正确性）。
- 主库超时注入 → `503`，响应体无任何行（`items.length===0`）。
- 篡改游标 → `400`；他人有效游标 → RLS 0 行。
- 未支持 sort → `422 unsupported_sort`；切 sort 复用旧游标 → `400`。

**关联**：契约 `GET /interview-history?sort=&cursor=&limit=`。状态机：只读（score 投影由 report outbox 写，非本端）。原语：③ RLS、④ 事件账本(只读)。安全：游标 HMAC、存在性不泄露。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-01-keyset | integration(真库) | 5,000 种子，time 排序第1/250页 EXPLAIN 无 SeqScan + 无 OFFSET + 扫描行有界 |
| TC-IH-01-score-cursor | integration(真库) | score 排序：空分+重复分跨页集合无重无漏；EXPLAIN 无 SeqScan/OFFSET |
| TC-IH-01-role-cursor | integration | role 排序 NULLS LAST 稳定，集合无重无漏 |
| TC-IH-01-unsupported-sort | contract | sort=answer_text→422；切 sort 复用旧游标→400 cursor_sort_mismatch |
| TC-IH-01-db-timeout | integration(故障注入) | statement_timeout 注入 → 503 且 items 为空，无半量 |
| TC-IH-01-cursor-hmac | contract+integration | 篡改游标→400；他人游标→0 行(404 语义) |
| TC-IH-01-rls-zero | integration(security) | 无 principal → 0 行；A 查 B → 0 行 |
| TC-IH-01-score-projection | integration | report 完成→outbox 刷新 Interview.scoreSummary，带 reportVersion；重生成单调覆盖 |

---

### UC-IH-02 · 多维筛选（状态/时间/角色/分数）

- **角色**：求职者　**前置**：同 01　**触发**：选择筛选条件。

**主流程**
1. 解析筛选 DTO（Zod 校验）；`status[]` 过 0.5 白名单；`from/to` 过 0.11 时区口径。
2. 谓词参数化（绝不字符串拼 SQL），与 0.6 keyset 游标组合。
3. 返回结果 + 命中计数（近似/精确见契约）。需审计的筛选词按 0.12 哈希/截断入 audit。

**七类覆盖**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | 多条件组合 | 参数化谓词 + 复合索引 | 读 |
| 异常 | E1 | 非法时间区间（from>to） | Zod 拒绝 → `422`，不查库 | 无 |
| 特殊 | S1 | 全条件命中 0 行 | 返回空集 + 空态 | 无 |
| 特殊 | S2 | i18n 状态枚举显示 | 后端返回枚举码，前端 i18n 映射 | 无 |
| 特殊 | S3 | `from==to` 同一秒 / 跨时区边界 | 0.11 半开区间 `[from,to)` + tz 归一；回显 resolvedTz | 无 |
| 逃逸 | X1 | 筛选组合致全表扫 | 强制至少一个走索引的谓词；否则限 `limit` + 基准退化告警 | 无 |
| 高并发 | C1 | 筛选中记录状态被推进 | 读已提交快照一致；下次翻页按最新谓词 | 无 |
| 复杂 | M1 | 状态多选 + 分数区间 + 角色 + 时间 | 单查询参数化，无 N+1 | 无 |
| 刁钻 | T1 | `status=['soft_deleted']`/`['purged']` 想筛出已删 | 0.5 白名单显式排除 → `422 invalid_status_filter`（不静默） | 无 |
| 刁钻 | T2 | `status=['abandoned']` 探测存在性 | abandoned 非默认可见但合法显式查询；仍受 RLS 限本人 | 无 |
| 刁钻 | T3 | 筛选词审计想留明文取证 | 0.12 一律 salted-hash/截断入 audit，无明文 | 无 |

**验收标准**
- 传 `soft_deleted/purging/purged` → `422`（断言错误码，非空结果）。
- 不传 abandoned → 结果集不含 abandoned；显式传 → 含且仅本人。
- `from==to` → 半开区间断言（边界记录归属可预期）；跨时区夹具断言归一到 UTC 后结果一致。
- 任意筛选组合不产生未参数化片段（参数计数断言）。
- 审计字段断言：`audit_log` 不含筛选词明文（结构断言，0.12）。

**关联**：契约 `GET /interview-history?status[]=&from=&to=&tz=&role=&minScore=&sort=`。原语：③ RLS。安全：枚举白名单、参数化防 SQLi、审计脱敏、时区口径。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-02-whitelist | contract+integration | 内部态入参→422 invalid_status_filter |
| TC-IH-02-abandoned-hidden | integration | 默认不含 abandoned；显式含且 RLS 限本人 |
| TC-IH-02-param-safe | unit(查询构建器) | 任意筛选组合断言全参数化，注入串无效 |
| TC-IH-02-bad-range | contract | from>to →422，不触库 |
| TC-IH-02-tz-boundary | integration | from==to 半开区间 + 跨时区归一 UTC 结果一致；回显 resolvedTz |
| TC-IH-02-audit-redact | unit | 筛选词入 audit 为 hash/截断，无明文（结构断言） |

---

### UC-IH-03 · 历史详情 + 懒加载答案分段

- **角色**：求职者　**前置**：存在属本人、可见的 `Interview`　**触发**：打开某条详情 / 滚动加载答案分段。

**主流程**
1. RLS 校验归属 → 返回详情头（题目列表、状态、分数摘要、报告状态）。
2. 答案正文**懒加载子资源**：`GET /interview-history/:id/answers?cursor=`，分段返回，同样 RLS + 归属校验。
3. 正文下载（长答案附件/录音）走 0.7 应用代理 `downloadToken`。
4. **半成品作答可见性（修评审①UC-03「abandoned/expired 详情展示什么」）**：`abandoned/expired/failed` 会话详情**只读可见已产生的题与作答**（已落库部分），标 `partial=true` + 状态横幅；无「继续」入口；未作答题显占位，不臆造。

**七类覆盖**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | 看详情 + 翻答案分段 | keyset 子资源分页 | 读 |
| 异常 | E1 | 详情头 ok 但某分段存储读失败 | 该分段降级占位 `segment_unavailable`，不整页 500 | 无 |
| 特殊 | S1 | 进行中会话无报告 | 报告区显 `pending/none`，提供「继续面试」入口（→UC-IH-04） | 无 |
| 特殊 | S2 | 超长答案（数千 token） | 分段 + `hasMore` 截断，不一次性下发 | 无 |
| 特殊 | S3 | **abandoned/expired 半成品详情** | 只读展示已落库部分 + `partial=true`，无「继续」入口，未答题占位 | 无 |
| 逃逸 | X1 | PII 渲染前 | 答案为不可信内容，只读展示，不入提示词；日志脱敏（不记全文） | 无 |
| 逃逸 | X2 | 详情聚合某子源（报告状态）超时 | 该子块降级占位，详情头仍返回（部分降级，不整页失败） | 无 |
| 高并发 | C1 | 看详情时该会话被 resume 推进 | 读快照一致；状态以再查为准 | 无 |
| 复杂 | M1 | 详情聚合多源（题/答/分/报告状态/护栏标记） | 单聚合服务编排，无控制器编排（架构不变量） | 无 |
| 刁钻 | T1 | **子资源 IDOR**：猜 `:id`/分段 id 取他人答案 | 子资源端点同一 RLS+归属校验 → 0 行 → `404` | 无 |
| 刁钻 | T2 | flagged（风控冻结）会话详情 | 可看历史只读，但「继续」入口禁用（守卫与 UC-IH-04 一致） | 无 |

**验收标准**
- 答案分段端点对非属主 → `404`（断言 0 行，非 403 泄露存在）。
- 某分段存储故障注入 → 该段 `segment_unavailable`，HTTP 200 且其余段正常（非整页 500）。
- `abandoned/expired` 详情 → 返回 `partial=true` + 已落库作答可见 + 无「继续」入口（断言无 resume CTA）。
- 日志断言：不出现答案全文 / PII（脱敏校验器）。

**关联**：契约 `GET /interview-history/:id`、`GET /interview-history/:id/answers?cursor=`（子资源契约纳入同一 RLS）。原语：③ RLS。安全：不可信输入隔离、脱敏日志、IDOR-404。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-03-idor-404 | integration(security) | 非属主取详情/分段 →404，账本无变化 |
| TC-IH-03-segment-degrade | integration(故障注入) | 单分段读失败→200 + segment_unavailable，其余正常 |
| TC-IH-03-partial-visibility | integration | abandoned/expired 详情→partial=true + 已答可见 + 无继续 CTA |
| TC-IH-03-lazy-paging | contract+integration | 答案分段 keyset 翻页不重不漏，hasMore 正确 |
| TC-IH-03-log-redaction | unit | 详情/分段路径日志断言无全文/PII |
| TC-IH-03-flagged-cta | unit | flagged 会话「继续」入口禁用 |

---

### UC-IH-04 · 继续未完成会话（同 threadId resume）

> 评审核心 UC。修：① fencing/lease（②1/②2/⑤）② resumableUntil（④1）③ flagged 守卫并入 CAS（②3）④ 计费不重复+失败退还（④2）⑤ **resume 失败补偿事务**（②1，区分瞬时/不可恢复）⑥ **SSE 重放作答幂等栅栏**（②4/⑦）。

- **角色**：求职者
- **前置**：存在属本人、`status=waiting_user`、`flagged=false`、`resumableUntil>now()` 的 `Interview(id=threadId)`；额度已在 start 时 reserved（不重复）。
- **触发**：历史列表/详情点「继续面试」（带 `Idempotency-Key`）。

**主流程 Main**
1. RLS 校验归属；`SET LOCAL app.principal`。
2. **第一段 CAS（业务态守卫）**：`UPDATE interview SET status='active', version=version+1 WHERE id=$tid AND status='waiting_user' AND flagged=false AND resumable_until>now() AND owner_user_id=$me`。0 行 → 回查重判，分类返回（见异常流）。
3. **第二段 CAS（run lease 抢占/续约，0.1）**：仅当旧 lease 死（`leaseExpiresAt<now()` 或心跳超时）才 `fenceEpoch=fenceEpoch+1`，写 `leaseOwner/leaseExpiresAt/heartbeatAt`，返回新 epoch。活 lease 存在 → 拒绝（另一活动 run 在跑，见 C1）。
4. 以同 `threadId`（→ `thread_id` in configurable）+ 新 `fenceEpoch` resume LangGraph；所有 checkpoint 写带 fence 校验。
5. 建立 SSE，按 `Last-Event-ID` 从事件账本**重放业务事件**（progress/question_ready/waiting_user…）。
6. **作答提交幂等栅栏（0.x / 修②4）**：每题有 `turnSeq`；提交作答唯一约束 `(thread_id, turn_seq)` 单写。SSE 重连/重放后客户端若**重复提交断网前已落库的作答** → 命中已存 turn → **幂等忽略，返回已有 `AnswerEval`**，不二次评分、不二次推进状态机（状态机守卫「答案幂等键未见过」）。
7. **不碰 `ConsumptionRecord`**（已 reserved，resume 不重复扣费）。

**resume 失败补偿（修评审②1「自相矛盾 + 死锁」，P0）**
区分两类失败，各有确定补偿，lease 一律靠 0.1 lease/TTL 自动释放（无需手工解锁，杜绝永久不可 resume 死锁）：
- **瞬时失败**（图启动可重试错误/网络抖动）：第一段已 `→active`，补偿 = **CAS 回滚 `active→waiting_user`**（前态守卫），lease 不续约 → TTL 到期自动失效，`ConsumptionRecord` 不变（**不退款**，可重试）。
- **不可恢复失败**（checkpoint 缺失/损坏/图版本隔离失败）：`AiGraphRun→failed`，`Interview→failed/safety_hold`，`ConsumptionRecord reserved→released`（**退还**），业务事实保全。
- 两类均不停留在「已改 active 却声称 waiting_user」的矛盾态（评审指出的旧稿自相矛盾已消除）。

**七类覆盖 / 异常流（每条落机制）**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | 正常续跑 | 两段 CAS + fence resume | `waiting_user→active`；无新扣费 |
| 异常 | E1 | resume 瞬时启动错误 | **补偿 CAS `active→waiting_user`** + lease TTL 释放；不退款，可重试 | 回到 waiting_user |
| 异常 | E2 | checkpoint 缺失/损坏不可恢复 | 安全终止 `Interview→failed/safety_hold`，`ConsumptionRecord released`（退还） | failed + 退还 |
| 特殊 | S1 | 首次 resume（中断后即续） | resumableUntil 未过期，正常 | active |
| 特殊 | S2 | i18n：原会话 zh，当前 en | 续跑沿用会话创建语言（不中途切，避免提示词漂移） | active |
| 逃逸 | X1 | **会话过期/陈旧**：`resumableUntil` 已过 | CAS 守卫不满足 → `409 session_expired`；看门狗(UC-13) 已/将 `→abandoned` + `released` + checkpoint GC | abandoned + 退还 |
| 逃逸 | X2 | kill-switch / 运维冻结该图 | `AiGraphRun→paused`；resume 返回 `503 graph_disabled`，业务态不变，可恢复 | 不变 |
| 高并发 | C1 | **双击 / 跨设备同时 resume** | 第一段 CAS 仅一个赢；第二段 lease 仅一个抢到 epoch；输者 `409 already_active`，**不拉起第二个活动 run** | 恰一活动 run |
| 高并发 | C2 | **僵尸 active**（实例崩溃，status=active 但 lease 死） | 死 run 检测：心跳超时→lease 可抢占；resume 检测死 lease，bump epoch 栅栏僵尸，再拉新 run；僵尸复活其 checkpoint 写 fence 失败→自我 `safe_terminating` | 恰一活动 run |
| 高并发 | C3 | **SSE 重连后重复提交断网前作答** | `(thread_id,turn_seq)` 单写 + 答案幂等键 → 重复 turn 幂等忽略，返回已有 AnswerEval，**不二次评分** | 无重复评分 |
| 复杂 | M1 | resume 命中图版本变更（懒迁移） | `AiGraphRun waiting_user→migrating→active`（迁移再校验通过）；失败→`quarantined`（原 checkpoint 不改写，DLQ） | 迁移或隔离 |
| 刁钻 | T1 | **flagged（风控）会话绕过 resume** | CAS WHERE 含 `flagged=false` → 0 行 → `409 risk_held` | 不变 |
| 刁钻 | T2 | 非属主 resume 他人 thread | RLS + `owner_user_id=$me` → 0 行 → `404` | 不变 |
| 刁钻 | T3 | 同键不同 body 重放 resume | 0.4 IDEM：同键异 body→`422 idempotency_conflict`；同键同 body→返回当前 run 快照，不二次 resume | 不变 |

**后置 Postcondition**
正常：`Interview waiting_user→active`，`AiGraphRun` 新 `fenceEpoch` + lease，`ConsumptionRecord` 不变（仍 reserved）。瞬时失败：回 `waiting_user`，额度不变。不可恢复：`→failed` + `released`。过期：`→abandoned` + `released` + checkpoint GC。写：`interview_event(resumed/answer_replayed_ignored, seq)`、`ai_invocation_trace`（fence/epoch）、审计（操作人/请求/原因）。

**验收标准（可测）**
- 双设备同 thread 各发一次 resume → 恰一个 `200`、一个 `409`；DB 断言**同 threadId 活动 run 数 = 1**（fenceEpoch 仅前进一次）。
- 被抢占端的图步骤再写 checkpoint → fence 守卫 0 行，断言 checkpoint **未被覆盖**（无脑裂）。
- 僵尸 active + 死 lease → resume 成功且活动 run=1；僵尸复活写入被 fence 拒。
- **瞬时失败**：注入图启动瞬时错误 → 断言 `Interview` 回到 `waiting_user`、lease 失效后可再次 resume、`ConsumptionRecord` 不变（不退款）。
- **不可恢复失败**：注入 checkpoint 损坏 → `failed` + `ConsumptionRecord released`（退还，幂等：重复触发仅退一次）。
- `resumableUntil` 过期 → `409 session_expired`，记录最终 `abandoned` + `released`。
- flagged=true → `409 risk_held`，无 run 启动。
- **SSE 重连重复提交同一 turn → 仅一次评分**（断言 AnswerEval 计数不变、状态机不重复推进）。
- resume 全程 `ConsumptionRecord` 计数不变（无二次扣费）；同 key 重放仅一次副作用。

**关联**：契约 `POST /interview/:id/resume`、SSE `GET /interview/:id/events`（Last-Event-ID）、`POST /interview/:id/turns/:turnSeq/answer`（含答案幂等键）。状态机：`Interview(waiting_user→active / →waiting_user 补偿 / →abandoned / →failed)`、`AiGraphRun(lease/fenceEpoch、waiting_user→migrating→active / →quarantined / →safe_terminating)`、`ConsumptionRecord(reserved→released 仅过期/不可恢复失败)`。原语：① CAS（两段+补偿+作答 turn）、② 幂等键（resume + 作答 turn）、③ RLS、④ 事件账本重放。安全：flagged 守卫、存在性不泄露、重放不重复副作用。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-04-single-active-fence | graph(fake-model)+integration | 并发双 resume：恰一200一409；活动 run=1；fenceEpoch 仅+1 |
| TC-IH-04-checkpoint-no-split | graph+integration | 被栅栏 run 写 checkpoint→fence 守卫 0 行，checkpoint 未覆盖；被栅栏 run→safe_terminating |
| TC-IH-04-zombie-preempt | integration(故障注入) | status=active+心跳超时→resume 成功且活动 run=1；僵尸复活写入被拒 |
| TC-IH-04-transient-compensate | integration(故障注入) | 瞬时启动错误→Interview 回 waiting_user，lease 失效后可再 resume，ConsumptionRecord 不变 |
| TC-IH-04-unrecoverable-refund | integration(故障注入) | checkpoint 损坏→failed + released；重复触发退还幂等仅一次 |
| TC-IH-04-resumable-expired | integration | resumableUntil 过期→409 session_expired；看门狗后 abandoned + released |
| TC-IH-04-answer-replay-fence | graph+integration | SSE 重连重复提交同一 turn→幂等忽略返回已有 AnswerEval，无二次评分 |
| TC-IH-04-flagged-guard | integration(security) | flagged=true→409 risk_held，无 AiGraphRun active |
| TC-IH-04-no-double-bill | integration | resume 前后 ConsumptionRecord 计数不变；同 key 重放仅一次 |
| TC-IH-04-idor-404 | integration(security) | 非属主 resume→404 |
| TC-IH-04-idem-conflict | contract | 同键异 body→422 idempotency_conflict；同键同 body→当前 run 快照 |
| TC-IH-04-lazy-migrate | graph(fake-model) | 版本变更 resume→migrating→active；迁移校验失败→quarantined，原 checkpoint 不改 |

---

### UC-IH-05 · 重看报告 + 报告重生成 saga

> 修评审①UC-05[复杂-saga]缺、③报告 i18n 过度承诺、④9 READY 快照损坏降级、⑤报告译文层、**②2 看门狗 vs 活跑单写者栅栏**（report 版本 CAS + 终止迟到 run）。

- **角色**：求职者
- **前置**：面试 `completed`，`AssessmentReport` ∈ {completed, failed, generating, pending}。
- **触发**：点「查看报告」（读）或「重新生成」（saga 写，带 `Idempotency-Key`）。

**主流程 A · 重看（纯读）**
1. RLS 校验归属 → 取 `AssessmentReport` 快照（completed 才有 body）。
2. 渲染分维度评分/建议；正文以**会话原文语言**呈现 + 语言标签；**本期不做自动翻译**（无翻译服务，non-goal，见 open-decisions）。

**主流程 B · 重生成（真 saga：子图→落表→事件）**
1. 守卫：报告 `failed`（或 completed 允许重生成一次，按产品）；**重生成永不计费**（0.3）。
2. CAS `AssessmentReport failed→pending`（version 守卫）→ 入队子图 job，bump report 关联 run 的 fenceEpoch（与 0.1 一致，单写者）。
3. 子图 `pending→generating→completed`（schema+业务双校验通过并持久化）或 `→failed`（可解释降级 + 可重试）。
4. 子图舱壁：报告失败**绝不阻塞面试主链路**；事件 `report_ready/report_failed` 由事务性 outbox 派生；完成时按 0.10 刷新列表 score 投影。

**报告看门狗 vs 活跑单写者栅栏（修评审②2「孤儿 run 回写已 failed 报告」，P0）**
- `AssessmentReport` 的**所有终态写都走 version CAS**（单写者）。看门狗判超时 `generating→failed` 是一次 CAS；真实子图 run 完成 `generating→completed` 也是一次 CAS。
- 二者竞争只一个赢：看门狗先判 failed（version+1）后，**迟到的真实 run** 再 `generating→completed` → 前态/version 失配 → **CAS 0 行** → 该迟到 run 判定被取代 → **自我 `safe_terminating`，丢弃产物，不回写已 failed 的报告**（无孤儿覆盖）。
- 看门狗终止 run 同时 bump run `fenceEpoch`，迟到 run 的任何 checkpoint 写亦被 fence 拒（双保险）。

**七类覆盖**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | 重看 completed 报告 | 读快照 | 读 |
| 异常 | E1 | 重生成子图不可恢复失败 | `generating→failed`，可见降级 + 可重试；**不退款**（额度 confirmed），免费重试 | failed |
| 异常 | E2 | 子图落表后 emit 事件前崩溃 | 事务性 outbox：事件由提交派生，恢复重放幂等，不丢不重 report_ready | completed |
| 特殊 | S1 | 报告 `generating` 中重看 | 显进度态，不给损坏 body | 读 |
| 特殊 | S2 | i18n：en 用户看 zh 报告 | 显原文 + 语言标签；不重算、不翻译（non-goal 显式声明） | 读 |
| 逃逸 | X1 | 重生成超重试预算 | `failed`（终态降级）+ 可解释错误 + 不再自动重试；保留旧 failed 态 | failed |
| 逃逸 | X2 | **生成超时**（子图卡死） | 看门狗(UC-13) CAS `generating→failed` + 终止迟到 run；用户可免费重生成 | failed |
| 高并发 | C1 | 双击「重新生成」 | CAS `failed→pending` 仅一个赢 + IDEM 键去重；另一个读 0 行/重放 | 恰一 job |
| 高并发 | C2 | **看门狗判 failed 与真实 run 完成竞态** | report version CAS 单写者：仅一个赢；迟到 run CAS 0 行→safe_terminating，不覆盖 | 一致无孤儿 |
| 复杂 | M1 | **重生成 saga 部分失败**：子图成功落 body 但能力曲线回写失败 | 拆补偿：报告 completed 落定；曲线回写为独立 `CompensationJob`（DLQ + sweeper），不回滚报告 | completed + 补偿挂起 |
| 刁钻 | T1 | **READY 但 body 不可解析**（快照损坏） | 渲染前业务校验失败 → 降级视图 `report_corrupt`（可解释 + 提供重生成），**非 500** | 降级 |
| 刁钻 | T2 | 越权看他人报告 | RLS → 0 行 → `404` | 不变 |
| 刁钻 | T3 | 诱导报告自评/刷分（重生成想抬分） | 双校验（分值域/枚举合法/无幻觉简历事实）；AI 不自评自报告（禁假验收） | 不变 |

**验收标准**
- 重生成 5 次（双击）→ 恰一个 `pending`、一个 saga job；其余重放/0 行。
- 重生成成功/失败 → `ConsumptionRecord` 计数**不变**（断言永不计费）。
- **看门狗 failed 后迟到 run 完成回写** → CAS 0 行，断言报告仍 `failed`、未被孤儿覆盖、迟到 run `safe_terminating`。
- READY 但 body 注入损坏 → 返回 `report_corrupt` 降级（HTTP 200 业务降级），断言非 500、非空白页。
- 子图落表后注入崩溃 → 恢复后恰一条 `report_ready`（不重不漏）。
- en 用户读 zh 报告 → 返回原文 + `lang='zh'` 标签，断言无翻译字段（本期）。

**关联**：契约 `GET /interview/:id/report`、`POST /interview/:id/report:retry`。状态机：`AssessmentReport(failed→pending→generating→completed/failed，全终态 version CAS 单写者)`、`CompensationJob`（曲线回写）。原语：① CAS、② 幂等键、④ outbox。安全：双校验、AI 不自评、不退款规则。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-05-retry-single | integration | 双击重生成→恰一 pending/一 job；余重放 |
| TC-IH-05-never-bill | integration | 重生成成/败→ConsumptionRecord 计数不变 |
| TC-IH-05-watchdog-singlewriter | integration(故障注入) | 看门狗 failed 后迟到 run 完成→CAS 0 行，报告仍 failed 无孤儿覆盖，迟到 run safe_terminating |
| TC-IH-05-corrupt-degrade | integration+unit | 损坏 body→report_corrupt 降级，非 500 |
| TC-IH-05-outbox-replay | integration(故障注入) | 落表后崩溃→恢复后恰一 report_ready |
| TC-IH-05-saga-partial | integration | 曲线回写失败→报告仍 completed，CompensationJob 进 DLQ 重试 |
| TC-IH-05-double-validate | graph(fake-model)+ai-eval | 越界分/幻觉简历事实被业务校验拦，不入库 |
| TC-IH-05-i18n-nontranslate | contract | en 读 zh 报告→原文 + lang 标签，无翻译字段 |
| TC-IH-05-idor-404 | integration(security) | 越权看报告→404 |

---

### UC-IH-06 · 删除单条（被遗忘权级联）

> 修评审①UC-06[异常-回滚]名不副实、④6 undo 取舍、②4 签名 URL 吊销、**④3 erasure 误删财务账本**（0.8 排除清单）。删除是「软删→宽限→PURGE 多存储物理删」，PURGE 半途崩溃是**不可回滚态**，靠前向幂等收口。

- **角色**：求职者　**前置**：存在属本人记录　**触发**：删除（软删带 `Idempotency-Key`；「立即彻底删」另需 0.4' `confirmToken`）。

**删除子状态机（新增承重对象 DeletionRecord，绑定 Interview，CAS+审计+测试覆盖）**
枚举：`visible · soft_deleted · purging · purged · purge_failed`

| from | to | 触发 | 守卫 | 失败动作 |
|---|---|---|---|---|
| visible | soft_deleted | 用户删除 | RLS 属主 + 会话**非活动 run**（活动则先安全终止）；若 in_progress 计费态 → 触发 0.3 `released` 退还 | — |
| soft_deleted | visible | **undo 恢复** | 宽限期内 + `purge_started_at IS NULL` | 已进 purging → 拒绝 |
| soft_deleted | purging | 宽限到期 / 用户立即彻底删（需 confirmToken） | — | — |
| purging | purged | 各存储删除**幂等清单全完成**（0.8 排除财务/审计） | 全项确认 | — |
| purging | purge_failed | 某存储永久失败 | — | DLQ + sweeper；**不回 visible**（前向不可逆） |

**主流程**
1. RLS 校验属主；若该会话有活动 run → 先 0.1 lease 抢占/安全终止（栅栏），再删；若处于计费中（reserved 未结）→ 按 0.3 `released` 退还（幂等）。
2. CAS `visible→soft_deleted`，bump 0.7 `urlEpoch`（**即时吊销在途 downloadToken**），从列表/搜索隐藏，起宽限期。
3. 宽限到期/立即彻底删 → `soft_deleted→purging`，入队 `CompensationJob`（PURGE）级联删，**按 0.8 区分**：物理删业务正文/checkpoint/S3/向量/事件正文；**财务（consumption_record/payment/refund/invoice）与审计骨架仅去标识保留**。每项**幂等可重入**。
4. 全项确认 → `purging→purged`。

**七类覆盖**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | 删除→软删→宽限到期 PURGE | 子状态机 CAS + CompensationJob + 0.8 排除清单 | purged |
| 异常 | E1 | PURGE 中某存储瞬时失败 | 幂等清单 + DLQ 重试（最终一致） | 重试后 purged |
| 异常 | E2 | **PURGE 物理删一半后任务崩溃（不可回滚）** | 各删幂等可重入；恢复从清单未完成项继续，**绝不回 visible**；永久失败→`purge_failed`+DLQ+人工 | purged/purge_failed |
| 异常 | E3 | 删除 in_progress 计费会话 | 先栅栏 run，`ConsumptionRecord released`（退还，幂等） | soft_deleted + 退还 |
| 特殊 | S1 | 删一条不存在/已 purged | 幂等：返回成功（已无），无副作用 | 不变 |
| 特殊 | S2 | i18n 删除确认文案 | 前端 i18n；后端无关 | — |
| 逃逸 | X1 | PURGE 反复失败 → 人工接管 | `purge_failed` 进人工工单（ManualReview），SLA 兜底 | purge_failed |
| 高并发 | C1 | 双击删除 / 删除中正被 resume | IDEM 去重；删除前 0.1 lease 栅栏正在跑的 run（被夺端 safe_terminating） | soft_deleted |
| 复杂 | M1 | 跨聚合级联（多存储 + 报告 + 曲线引用 + 财务凭证） | saga 幂等清单逐项；**财务/审计去标识保留，引用置空非删主体** | purged |
| 刁钻 | T1 | **删后在途 downloadToken 仍下载已清正文** | 0.7 bump urlEpoch + 下载端点请求时校验 deletion_status → 即时失效（无 TTL 泄漏窗口） | 拒绝下载 |
| 刁钻 | T2 | 越权删他人记录 | RLS → 0 行 → `404` | 不变 |
| 刁钻 | T3 | 软删后枚举/筛选探测存在性 | 0.5 白名单排除 soft_deleted/purged；列表/搜索谓词隐藏 | 不可见 |
| 刁钻 | T4 | **naive cascade 想连财务凭证一起删** | 0.8 排除清单：财务/审计仅去标识；断言 PURGE 后凭证行仍在、可对账 | 凭证保留 |

**验收标准**
- 软删后立即用删除前签发的 downloadToken 下载 → `403/404`（断言 urlEpoch 失效，无正文）。
- PURGE 中途 kill（删一半）→ 重跑后最终 `purged`；断言已删存储项不被「复活」、未删项被补删；状态**从不回 visible**。
- **PURGE 后断言：该用户已无可召回正文/向量，但 `consumption_record`/财务凭证行仍在、金额可对账、`owner_user_id` 已去标识为 tombstone**（0.8）。
- 删除 in_progress 计费会话 → `ConsumptionRecord released`（退还，重复删幂等仅退一次）。
- undo：宽限内 `soft_deleted→visible` 成功；进 `purging` 后 undo → 拒绝（断言不可逆）。
- 越权删 → `404`，账本无变化。
- 「立即彻底删」缺 confirmToken → `409 confirm_required`。
- 软删记录不出现在列表/筛选/搜索结果。

**关联**：契约 `DELETE /interview-history/:id`、`POST /interview-history/:id:prepare-purge`（签 confirmToken）、`POST /interview-history/:id:restore`、下载端点。状态机：`DeletionRecord(visible→soft_deleted→purging→purged/purge_failed)`、`CompensationJob`(+DLQ+sweeper)、`ManualReview`、`ConsumptionRecord(reserved→released)`。原语：① CAS、② 幂等键、③ RLS、④ 审计事件。安全：被遗忘权、财务账本边界(0.8)、签名 URL 即时吊销、存在性不泄露。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-06-soft-then-purge | integration | 删除→soft_deleted→到期 purging→purged，全存储正文清除 |
| TC-IH-06-purge-crash-resume | integration(故障注入) | PURGE 半途 kill→重跑最终 purged；已删项不复活，未删项补删，从不回 visible |
| TC-IH-06-erasure-keeps-finance | integration(security) | PURGE 后正文/向量不可召回；consumption_record/财务凭证行仍在、可对账、owner 去标识 |
| TC-IH-06-delete-inprogress-refund | integration | 删 in_progress 计费会话→released 退还，重复删幂等仅退一次 |
| TC-IH-06-url-revoke | integration(security) | 删后用旧 downloadToken→403/404，无正文；urlEpoch 失效 |
| TC-IH-06-undo-grace | integration | 宽限内 restore→visible；purging 后 restore→拒绝（不可逆） |
| TC-IH-06-confirm-token | contract | 立即彻底删缺/错 confirmToken→409 confirm_required/422 confirm_mismatch |
| TC-IH-06-idor-404 | integration(security) | 越权删→404，无副作用 |
| TC-IH-06-hidden-after-soft | integration | 软删后列表/筛选/搜索不含该记录 |
| TC-IH-06-delete-fences-run | graph+integration | 删除活动会话→先栅栏 run，被夺端 safe_terminating |
| TC-IH-06-idem | contract | 双击删除→一次副作用；同键重放成功 |

---

### UC-IH-07 · 批量删除 / 清空历史

> 修评审①UC-07薄、④4 `all:true` 与并发新建竞态、④5 批量任务可观测端点、混入他人 id 处理定调。

- **角色**：求职者　**前置**：同 06　**触发**：勾选多条删除，或「清空全部」`all:true`（带 `Idempotency-Key` + 0.4' `confirmToken`）。

**主流程**
1. RLS 校验；记录请求时刻 `req_ts`；校验 `confirmToken`（清空高危）。
2. `all:true` **绑定请求时刻快照**：仅删 `created_at <= req_ts` 的记录（防清空期间用户新建被误删）。
3. **混入他人 id 处理（定调，不再「按策略」）**：`ids` 含非属主项 → **逐条 RLS 过滤静默跳过**（不 400、不报他人存在性），仅删本人项；响应回 `deletedCount`，不回被跳过明细。
4. 创建 `batchJob`（含 `total/done/failed/status`），游标分批软删 → 逐条进 UC-IH-06 子状态机（软删→PURGE，含 0.8 财务排除 + 0.3 计费退还）。
5. 返回 `batchJobId`；进度经 `GET /interview-history/batch-deletions/:jobId` 查询（RLS 绑 owner）。

**七类覆盖**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | 批量软删 + 后台 PURGE | batchJob + 游标分批 + 子状态机 | 各项 purged |
| 异常 | E1 | 批中部分项 PURGE 失败 | 失败项 `purge_failed` 进 DLQ；batchJob `failed` 计数，不影响成功项 | 部分 purged |
| 异常 | E2 | 批中含计费 in_progress 会话 | 逐条 0.3 released 退还（幂等汇总），不重复退 | 退还一致 |
| 特殊 | S1 | 清空时本就 0 条 | batchJob 立即 completed(total=0) | — |
| 特殊 | S2 | i18n 进度文案 | 前端 i18n | — |
| 逃逸 | X1 | 超大批量（数万条） | 游标分批 + 限速；批任务可暂停/续跑（幂等清单） | 渐进 purged |
| 高并发 | C1 | **清空期间用户新建面试** | `all:true` 绑 `created_at<=req_ts` 快照 → 新建（>req_ts）**不被删** | 新会话保留 |
| 高并发 | C2 | 双击清空 | IDEM 键去重 → 恰一 batchJob | 一个任务 |
| 复杂 | M1 | 批中含活动 run 的会话 | 逐条先 0.1 栅栏 run 再软删 | safe_terminating |
| 刁钻 | T1 | `ids` 含他人记录 id | 逐条 RLS 过滤静默跳过（不报他人存在性） | 仅删本人 |
| 刁钻 | T2 | 篡改 batchJobId 查他人进度 | RLS 绑定 job.owner → 0 行 → 404 | — |

**验收标准**
- `all:true` 后在 `req_ts` 之后新建会话 → 断言新会话**存活**、不在删除集。
- 双击清空 → 恰一 `batchJobId`（IDEM）；清空缺 confirmToken → `409 confirm_required`。
- 批中某项 PURGE 永久失败 → batchJob `failed` 计数+1，其余项仍 purged，失败项进 DLQ。
- 批中计费会话 → `ConsumptionRecord released` 退还（断言退还总额=计费会话数，幂等无重复退）。
- `GET /batch-deletions/:jobId` 返回 `total/done/failed/status` 且 RLS 限本人。
- `ids` 含他人 id → 仅删本人项，`deletedCount` 不计他人，不泄露他人存在性。

**关联**：契约 `POST /interview-history:prepare-clear`（签 confirmToken）、`POST /interview-history:batch-delete`（`ids[]`/`all:true`）、`GET /interview-history/batch-deletions/:jobId`。状态机：`BatchJob`、`DeletionRecord`、`CompensationJob`(DLQ)、`ConsumptionRecord`。原语：① CAS、② 幂等键、③ RLS、④ 事件账本。安全：快照防误删、越权过滤、进度查询 RLS、confirmToken。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-07-snapshot-race | integration(并发) | 清空中并发新建→新建(created_at>req_ts)存活，不被删 |
| TC-IH-07-idem-one-job | contract+integration | 双击清空→恰一 batchJob；缺 confirmToken→409 |
| TC-IH-07-partial-fail | integration(故障注入) | 某项 purge 永久失败→batchJob.failed+1，余项 purged，失败入 DLQ |
| TC-IH-07-batch-refund | integration | 批含计费会话→released 退还总额=计费会话数，幂等无重复退 |
| TC-IH-07-job-status-rls | integration(security) | 进度端点返回计数；他人 jobId→404 |
| TC-IH-07-foreign-ids | integration(security) | ids 含他人→仅删本人，不泄露存在性 |
| TC-IH-07-fence-active | graph+integration | 批含活动会话→先栅栏再软删 |

---

### UC-IH-08 · 跨设备恢复 / 夺锁接管（takeover）

> 修评审①UC-08凑数、②5 **takeover 推送机制**（B 接管后失效 A 的活 SSE）、②真正复杂点：**被夺锁端的图执行如何被栅栏**（= 0.1 fenceEpoch）。

- **角色**：求职者（多设备）　**前置**：设备 A 持有某 thread 活动 run（lease 未死）　**触发**：设备 B 对同 thread 发起恢复/接管。

**主流程**
1. 设备 B RLS 校验属主。
2. **夺锁**：第二段 lease CAS（0.1）——若 A lease 仍活（心跳新鲜），B 须**显式接管**（用户确认 `takeover=true`）才允许强制 bump `fenceEpoch`；否则（A lease 死）直接抢占。
3. bump `fenceEpoch` → A 的下一次 checkpoint 写/心跳 fence 守卫 0 行 → **A 的图执行被栅栏**，A 转 `safe_terminating`。
4. **takeover 主动推送（修评审②5「无机制把 takeover 推给 A」，P1）**：bump epoch 时向 A 的活 SSE 连接经事件总线推 `superseded` 事件（A 订阅自身 thread 的 control-channel）→ A 客户端立即断流、禁用作答 UI；即便推送未达，A 的**任何后续作答提交**也因 0.1 fence + `(thread_id,turn_seq)` 幂等栅栏被服务端拒（双保险：推送尽力 + 服务端强制）。
5. B 以新 epoch resume，按 `Last-Event-ID` 从事件账本**重放**业务事件，续推。

**七类覆盖**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | A 断网，B 接管续跑 | A lease 死→B 抢占 bump epoch；事件重放 | 活动 run 转移到 B |
| 异常 | E1 | 接管时 checkpoint 不可恢复 | 安全终止→`Interview failed/safety_hold`，`ConsumptionRecord released` | 退还 |
| 特殊 | S1 | B 接管后立即看到完整上下文 | SSE snapshot 端点先取快照再增量重放 | — |
| 特殊 | S2 | i18n：A=zh,B 设备 en | 续会话沿用原语言，UI 壳 i18n | — |
| 逃逸 | X1 | A、B 都异常 → 无活动端 | lease 心跳超时→看门狗(UC-13) 判 `abandoned`（若过 resumableUntil）+ released，或保留 waiting_user 待下次 | 视 TTL |
| 高并发 | C1 | **A、B 几乎同时操作** | fenceEpoch 单调：仅最后成功 bump 者持锁，旧 epoch 全被 fence 拒；活动 run 恒=1 | 恰一活动 run |
| 复杂 | M1 | 接管 + 图版本变更同时发生 | 先抢 lease 再走懒迁移（UC-04 M1），fence 贯穿迁移 | active/quarantined |
| 刁钻 | T1 | **被夺端脑裂写 checkpoint** | A 旧 epoch 写 checkpoint→fence 守卫 0 行拒→断言 checkpoint 未被 A 覆盖 | 无脑裂 |
| 刁钻 | T2 | 攻击者强夺他人 thread | RLS 属主 → 0 行 → 404 | 不变 |
| 刁钻 | T3 | **A 不死但被强接管后仍提交作答** | A 心跳 fence 0 行→自停；A 残留作答经 fence + turn 幂等栅栏被拒，不二次评分 | A 终止 |

**验收标准**
- B 接管后，A 再写 checkpoint → fence 0 行，断言 checkpoint **未被 A 覆盖**、活动 run=1。
- A、B 近乎同时夺锁 → fenceEpoch 仅前进到一个赢家；旧 epoch 写全部被拒。
- **B 接管 → A 活 SSE 收到 `superseded` 并断流**（断言事件下发）；**且** A 接管后提交的作答被服务端拒（断言不入库、不评分，即便推送丢失也强制拦截）。
- B 接管 SSE → 先 snapshot 后按 `Last-Event-ID` 重放，事件 seq 连续不重不漏。
- 越权夺他人 thread → `404`。

**关联**：契约 `POST /interview/:id/resume?takeover=true`、SSE `GET /interview/:id/events`（snapshot + Last-Event-ID + control-channel `superseded`）。状态机：`AiGraphRun(fenceEpoch、active→safe_terminating)`、`Interview`、`ConsumptionRecord`。原语：① CAS(lease)、② 幂等键(作答 turn)、③ RLS、④ 事件账本重放。安全：强接管需用户确认、被夺端作答强制拦截、存在性不泄露。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-08-fence-displaced | graph(fake-model)+integration | B 夺锁后 A 写 checkpoint→fence 0 行，checkpoint 未覆盖，活动 run=1 |
| TC-IH-08-epoch-monotonic | integration(并发) | A/B 同时夺锁→fenceEpoch 仅一个赢家，旧 epoch 全被拒 |
| TC-IH-08-superseded-push | integration | B 接管→A SSE 收 superseded 断流；推送丢失下 A 作答仍被服务端 fence+turn 栅栏拒 |
| TC-IH-08-sse-replay | integration | 接管后 snapshot+Last-Event-ID 重放，seq 连续不重不漏 |
| TC-IH-08-idor-404 | integration(security) | 越权夺他人 thread→404 |
| TC-IH-08-both-dead-sweeper | integration | A/B 均死+TTL 过→看门狗判 abandoned + released |

---

### UC-IH-09 · 空态 / 首次 / i18n 特殊态

- **角色**：求职者　**前置**：账号无历史或筛选无命中　**触发**：进入历史页。

**主流程**
1. 列表/筛选返回空集 → 契约带 `emptyReason`（`no_history` / `no_match` / `all_deleted`）。
2. 前端按 reason 渲染对应空态与 CTA（首次→引导开始面试；无命中→清筛选）。

**七类覆盖**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | 首次用户空历史 | 空集 + `emptyReason=no_history` | 读 |
| 异常 | E1 | 列表后端故障（非空逻辑） | 走 UC-IH-01 E1 → 503，前端区分「空」与「错」 | 无 |
| 特殊 | S1 | 全部已删后的空态 | `emptyReason=all_deleted`（不暴露曾有几条） | 读 |
| 特殊 | S2 | i18n 空态文案 zh/en | 后端给 reason 码，前端 i18n 文案 | 读 |
| 逃逸 | X1 | 空态也注入广告/外链 | 不做；空态只读静态资源 | — |
| 高并发 | C1 | 空态渲染时另一端刚完成首场面试 | 下次拉取即非空；不缓存陈旧空态 | — |
| 复杂 | M1 | 筛选叠加致空 vs 真无数据 | reason 区分 `no_match` 与 `no_history` | 读 |
| 刁钻 | T1 | 空态枚举试探他人是否有历史 | RLS 限本人；空态不含任何他人信息 | — |

**验收标准**
- 三种空态返回正确 `emptyReason`，断言「空」与「503 错误」前端可区分（不混淆）。
- `all_deleted` 不返回历史计数（不泄露曾有数据）。

**关联**：契约 `GET /interview-history`（含 `emptyReason`）。原语：③ RLS。安全：不泄露曾有数据。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-09-empty-reasons | contract+integration | 三态返回正确 emptyReason；all_deleted 无计数 |
| TC-IH-09-empty-vs-error | integration | 空集 vs 503 前端可区分 |
| TC-IH-09-i18n-shell | unit(前端) | reason 码→zh/en 文案映射正确 |

---

### UC-IH-10 · 大量数据深翻页（keyset 稳定性）

> 修评审③不可测的 P95/EXPLAIN/时延持平口径；与 UC-IH-01 共用机制，本 UC 专攻深翻页与索引计划稳定性。**删除「耗时持平/恒定」时延断言**，仅留查询计划/扫描行数（0.7'）。

- **角色**：求职者　**前置**：固定 5,000 条种子　**触发**：翻至深页（如第 250 页）。

**主流程**：见 0.6 keyset；无 OFFSET，复合索引覆盖；支持 time/score/role 三种排序的深翻页。

**七类覆盖**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | 深翻页 | keyset `(sortKey,started_at,id)<cursor` + 复合索引 | 读 |
| 异常 | E1 | 游标指向已删行 | 谓词跳过 deletion_status≠visible；继续下一批 | 读 |
| 特殊 | S1 | 末页（无更多） | `nextCursor=null` | 读 |
| 特殊 | S2 | 同 sortKey 大量并列 | 尾键 `(started_at,id)` 唯一裂决，不漏不重 | 读 |
| 逃逸 | X1 | 客户端请求超大 limit | 服务端硬上界 limit≤50 截断 | 读 |
| 高并发 | C1 | 翻页中插入新记录 | keyset 锚定快照点，新记录不挤动旧游标 | 不串页 |
| 复杂 | M1 | 深页 + 筛选 + score 排序组合 | 复合索引覆盖 (owner,deletion_status,score,started_at,id) | 读 |
| 刁钻 | T1 | 构造游标跳到他人数据段 | HMAC 校验 + RLS 0 行 | 不泄露 |

**验收标准**
- 三种排序第 1 页与第 250 页查询 EXPLAIN **均无 Seq Scan、无 OFFSET 节点、扫描行数有界**（断言计划节点类型 + rows_scanned，不锁定具体计划，**不断言耗时持平**）。
- 同 sortKey 并列 100 条跨页 → 断言总取回集合无重复 id、无遗漏 id（含 score NULL 并列段）。
- limit=10000 → 实际返回 ≤50。

**关联**：契约 `GET /interview-history?sort=&cursor=&limit=`。原语：③ RLS。安全：游标 HMAC。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-10-no-seqscan-no-offset | integration(真库) | time/score/role 第1/250页 EXPLAIN 无 SeqScan + 无 OFFSET + 扫描行有界（无时延断言） |
| TC-IH-10-tie-break | integration | 同 sortKey 并列跨页：集合无重无漏（含 score NULL 段） |
| TC-IH-10-limit-cap | contract | limit=10000→返回≤50 |
| TC-IH-10-insert-during-page | integration(并发) | 翻页中插入→不串页、旧游标稳定 |

---

### UC-IH-11 · 元数据搜索

> 修评审②5 LIKE 通配符注入、③/④10 搜索语义未定义、0.12 审计脱敏。

- **角色**：求职者　**前置**：同 01　**触发**：搜索框输入关键词。

**搜索语义（本期定义，open-decisions 确认）**：仅对**元字段**（面试标题、目标角色名、JD 标签）做子串匹配；用 `pg_trgm` GIN 索引的 `ILIKE` 子串（CJK 由 trigram 覆盖基本子串，**不做分词/tsvector**，本期 non-goal）；**不**搜答案/报告正文（避免正文泄漏面 + 性能 + 防泄题）。

**主流程**
1. RLS 校验；输入做 0.5 范围 + 长度限制（≤64 字符，防 ReDoS/超长）；需审计的关键词按 0.12 哈希/截断。
2. **LIKE 元字符转义**：`% _ \` 全转义 → 用户输入只作字面量子串，`q='%'`/`'_'` 不再通配枚举全部。
3. `ILIKE '%' || escaped(q) || '%'` 走 trgm 索引；与 keyset 组合。

**七类覆盖**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | 关键词搜元字段 | trgm ILIKE 子串 + RLS | 读 |
| 异常 | E1 | 空/纯空白查询 | 返回 422 或退化为全列表（按契约），不全表扫 | 无 |
| 特殊 | S1 | CJK 关键词 | trgm 子串覆盖；命中范围 = 元字段含该子串 | 读 |
| 特殊 | S2 | i18n：en 关键词搜 zh 标题 | 字面子串匹配，不跨语言翻译 | 读 |
| 逃逸 | X1 | 超长/高频搜索 | 长度上限 + 每用户限流；超限 429 | 无 |
| 高并发 | C1 | 搜索中记录被删 | deletion_status 谓词隐藏；结果集即时一致 | 读 |
| 复杂 | M1 | 搜索 + 筛选 + 深翻页组合 | trgm + 复合索引 + keyset | 读 |
| 刁钻 | T1 | **`q='%'` / `q='_'` 枚举全部** | LIKE 元字符转义→字面量，无通配枚举 | 仅字面匹配 |
| 刁钻 | T2 | SQLi / ReDoS 注入串 | 参数化 + 长度上限 + 无正则回溯（trgm 非回溯） | 无 |
| 刁钻 | T3 | 搜他人元数据探测 | RLS 限本人 → 0 行 | 不泄露 |
| 刁钻 | T4 | 搜索想命中答案正文泄题 | 仅搜元字段，正文不入搜索面（索引 schema 不含正文字段，结构断言） | 不命中正文 |
| 刁钻 | T5 | 搜索词审计想留明文取证 | 0.12 hash/截断入 audit，无明文 | — |

**验收标准**
- `q='%'`、`q='_'`、`q='\'` → 断言仅匹配字面含该字符的元字段（非全量返回）。
- 搜索结果**不含**任何答案/报告正文字段（断言响应 schema 无正文 **且 搜索索引 schema 不含正文字段**——结构断言，非「查询证伪」，修评审③口径）。
- 注入串 / 64+ 字符 → `422`/转义后无效，无错误暴露内部 SQL。
- CJK 子串命中范围 = 元字段含该子串（用固定夹具断言命中集合精确）。
- 审计字段断言：搜索词入 audit 为 hash/截断，无明文（0.12）。

**关联**：契约 `GET /interview-history/search?q=`（响应仅元字段 + keyset）。原语：③ RLS。安全：LIKE 转义、参数化、仅元字段、限流、不泄题、审计脱敏。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-11-like-escape | integration(security) | q='%'/'_'/'\\' →仅字面匹配，非全量 |
| TC-IH-11-meta-only | contract+integration | 结果 schema + 搜索索引 schema 均无正文；正文关键词搜不到（结构断言） |
| TC-IH-11-cjk-scope | integration(固定夹具) | CJK 子串命中集合精确等于期望 |
| TC-IH-11-inject-ddos | integration(security) | SQLi/超长/ReDoS 串→422/无效，无内部 SQL 暴露 |
| TC-IH-11-rls | integration(security) | 搜他人元数据→0 行 |
| TC-IH-11-audit-redact | unit | 搜索词入 audit 为 hash/截断，无明文 |

---

### UC-IH-12 · 历史导出（PII 出口）

> 修评审④5/⑦ 导出频率配额、②4 签名 URL 吊销、可观测端点、**④6/必补11 step-up 认证 + 出口审计**、③ 导出 idem 短 TTL。

- **角色**：求职者　**前置**：同 01　**触发**：导出选定/全部历史（带 `Idempotency-Key` + 全量含正文需 0.4' `confirmToken` + 0.9 step-up）。

**主流程**
1. RLS 校验；**0.9 step-up 认证**（未通过 → `401 step_up_required`）；**每用户导出配额**（`PIN=1次/小时、3次/天`，open-decisions）→ 超限 `429 export_quota_exceeded`。
2. 创建 `exportJob`（异步，0.4 导出 IDEM `TTL=60s` 短窗）；脱敏策略：导出含本人正文（属本人数据），生成物经 0.7 应用代理 `downloadToken`，不直发 S3 presign；写 0.9 `export_audit`。
3. `GET /interview-history/exports/:jobId` 查进度 + 完成后取 `downloadToken`。
4. 下载端点请求时校验属主 + 对象未删 + `urlEpoch`，每次下载写 `export_audit`。

**七类覆盖**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | 导出→异步生成→下载 | exportJob + downloadToken + export_audit | 完成 |
| 异常 | E1 | 生成中部分记录读失败 | 该记录标记 `partial`，导出物含错误清单，不整单失败 | partial |
| 特殊 | S1 | 导出 0 条 | exportJob 立即完成，空导出物 | 完成 |
| 特殊 | S2 | i18n 导出元数据语言 | 正文原文语言 + lang 标签，不翻译 | 完成 |
| 逃逸 | X1 | 频繁导出（抓取/DoS） | 每用户配额 → 429 + 排队限流双闸 | 拒绝 |
| 高并发 | C1 | 双击导出 | IDEM 键（60s 短窗）→恰一 exportJob | 一个任务 |
| 复杂 | M1 | 导出 + 同时删除被导记录 | 删除 bump urlEpoch；已签发 downloadToken 失效；导出物按生成时快照 | 一致 |
| 刁钻 | T1 | **导出后删除，在途 token 仍下载** | 0.7 urlEpoch + 请求时校验 deletion_status → 即时失效 | 拒绝下载 |
| 刁钻 | T2 | 篡改 exportJobId/token 取他人导出 | RLS + token 绑 principal → 404/403 | 不泄露 |
| 刁钻 | T3 | 越权导出他人历史 | RLS 仅圈本人数据 → 导出物只含本人 | 仅本人 |
| 刁钻 | T4 | **无 step-up 直接拉全量 PII** | 0.9：未 step-up→401 step_up_required；全量含正文缺 confirmToken→409 | 拒绝 |

**验收标准**
- 未 step-up 发起含正文导出 → `401 step_up_required`；全量缺 confirmToken → `409`。
- 1 小时内第 2 次导出（超配额）→ `429 export_quota_exceeded`。
- 双击导出（60s 内同键同 body）→ 恰一 `exportJobId`；超 60s 同键 → 新 job（不返回过期快照）。
- 导出后删除被导记录，再用 token 下载 → `403/404`（urlEpoch 失效，无正文）。
- 他人 token/jobId → `404/403`，不泄露存在性。
- 导出物只含本人数据（断言无他人记录）；每次导出/下载写 `export_audit`（断言审计有记录）。

**关联**：契约 `POST /interview-history:export`（含 step-up 校验）、`GET /interview-history/exports/:jobId`、下载端点。状态机：`ExportJob(pending→running→completed/partial/failed)`。原语：① CAS、② 幂等键(60s 短窗)、③ RLS、④ 事件账本 + export_audit。安全：step-up 认证、配额限流、签名 URL 吊销、越权隔离、出口审计、脱敏日志。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-12-step-up | integration(security) | 未 step-up 含正文导出→401；全量缺 confirmToken→409 |
| TC-IH-12-quota | integration | 超配额→429 export_quota_exceeded |
| TC-IH-12-idem-short-ttl | contract+integration | 60s 内双击→恰一 exportJob；超 60s 同键→新 job（非过期快照） |
| TC-IH-12-url-revoke | integration(security) | 导出后删记录→旧 token 下载 403/404，无正文 |
| TC-IH-12-foreign-token | integration(security) | 他人 token/jobId→404/403 |
| TC-IH-12-owner-only | integration(security) | 导出物仅含本人数据 |
| TC-IH-12-export-audit | integration | 每次导出/下载写 export_audit（principal/范围/objectId/IP） |
| TC-IH-12-partial | integration(故障注入) | 部分记录读失败→partial + 错误清单，非整单失败 |

---

### UC-IH-13 · 会话过期/废弃看门狗（expired/abandoned 生产者）★新增

> 修评审①「全模块致命空白：没有任何用例生产 expired/abandoned」「会话过期看门狗缺失」+ ②2 看门狗 vs 活跑单写者栅栏。本 UC 是 `waiting_user/active/generating` 超 TTL 的**唯一生产者**，闭合会话生命周期。

- **角色**：系统（定时 sweeper job）
- **前置**：存在 `waiting_user` 且 `resumableUntil<now()` 的会话，或 `active` 但 lease 心跳超时的僵尸会话，或 `generating` 超报告 TTL 的报告。
- **触发**：周期性 sweeper（`PIN=每 1min` 扫一批；幂等可重入）。

**主流程**
1. 分批扫描候选（复合索引 `(status, resumableUntil)` / `(status, leaseExpiresAt)` / `(report.status, report.deadlineAt)`），每批 keyset 有界、限速。
2. **会话过期**：CAS `Interview waiting_user→abandoned`（前态+`resumableUntil<now()` 守卫）→ 成功者：`ConsumptionRecord reserved→released`（退还，幂等）、入队 checkpoint GC（`AiGraphRun→safe_terminating`、bump fenceEpoch 栅栏僵尸 run）。
3. **僵尸 active**：lease 心跳超时的 `active` → bump fenceEpoch 栅栏 + 若亦过 resumableUntil 则同上迁 abandoned + released；否则保留 `waiting_user` 待用户下次 resume（仅回收死 run）。
4. **报告生成超时**：CAS `AssessmentReport generating→failed`（version 守卫，单写者）+ 终止迟到 run（UC-05 看门狗段）；用户可免费重生成。
5. 每步写审计（sweeper 操作、原因、迁移前后态）。

**七类覆盖**

| 类 | flow | 场景 | 落到机制 | 后置 |
|---|---|---|---|---|
| 正常 | N | waiting_user 过 TTL→abandoned | CAS 迁移 + released + checkpoint GC | abandoned + 退还 |
| 异常 | E1 | 退还 release 中途崩溃 | release 幂等（reserved→released CAS）；sweeper 重跑补齐，不重复退 | 最终退还一次 |
| 异常 | E2 | checkpoint GC 部分失败 | CompensationJob + DLQ 重试；业务态已 abandoned 不回滚 | 最终 GC |
| 特殊 | S1 | 候选为空 | 空跑，无副作用 | — |
| 特殊 | S2 | 恰在 TTL 边界（resumableUntil≈now） | 半开判定 `<now()`；与用户并发 resume 竞争见 C1 | 二选一确定 |
| 逃逸 | X1 | sweeper 自身故障/停摆 | 监控告警 + 补扫（下次启动按 deadline 兜底，非内存定时器） | 恢复后补迁 |
| 逃逸 | X2 | 大量积压（数万过期） | 分批限速 + 可续跑（无大事务）；不阻塞在线路径 | 渐进 |
| 高并发 | C1 | **用户 resume 与 sweeper 同时判过期** | 两者都对 `Interview` 行 CAS：仅一个赢。sweeper 赢→abandoned，用户得 409；用户赢(刚好 resumableUntil 内)→active，sweeper CAS 0 行跳过 | 恰一结果 |
| 高并发 | C2 | **报告看门狗 vs 真实 run 完成** | report version CAS 单写者（UC-05 C2）；迟到 run CAS 0 行→safe_terminating | 无孤儿 |
| 复杂 | M1 | 过期会话同时被软删 | 删除与 sweeper 都走 CAS；先到者赢，退还仍幂等仅一次 | 一致 |
| 刁钻 | T1 | 构造大量临界态诱发重复退款 | release 幂等 + CAS 单赢 → 断言每会话额度只回一次 | 不重复退 |
| 刁钻 | T2 | 利用 sweeper 延迟卡 TTL 边界白嫖额度 | 计费在 start 已 reserved；abandoned 才 released，无「未付先用」窗口 | 无套利 |

**验收标准**
- `waiting_user` 过 `resumableUntil` → 被 sweeper 迁 `abandoned` + `ConsumptionRecord released`（断言额度退还、checkpoint 入 GC、AiGraphRun safe_terminating）。
- **用户 resume 与 sweeper 并发**（注入同刻）→ 恰一个赢：用户赢则 active 且无退还；sweeper 赢则 abandoned + released + 用户 409；断言活动 run≤1、额度状态唯一。
- 退还幂等：sweeper 重复扫同一过期会话 → 额度只 release 一次（断言计数）。
- 报告 `generating` 超 TTL → `failed`（version CAS）；迟到 run 完成回写 → CAS 0 行不覆盖。
- sweeper 停摆后重启 → 按 deadline 补迁所有逾期会话（非内存定时器，崩溃安全）。

**关联**：契约（内部）`worker: session-sweeper`、`worker: report-watchdog`。状态机：`Interview(waiting_user/active→abandoned)`、`AiGraphRun(→safe_terminating, fenceEpoch++)`、`AssessmentReport(generating→failed)`、`ConsumptionRecord(reserved→released)`、`CompensationJob`(GC+DLQ)。原语：① CAS（迁移+退还单写者）、② 幂等（重入退还）、④ 事件/审计账本。安全：无套利窗口、崩溃安全（持久 deadline 非内存定时器）。

**测试用例**

| TC | 层 | 断言 |
|---|---|---|
| TC-IH-13-expire-abandon-release | integration | 过 resumableUntil→abandoned + released + checkpoint GC + run safe_terminating |
| TC-IH-13-resume-vs-sweeper | integration(并发) | 用户 resume 与 sweeper 同刻→恰一赢；活动 run≤1，额度状态唯一 |
| TC-IH-13-release-idempotent | integration | sweeper 重复扫同一会话→额度只 release 一次 |
| TC-IH-13-report-timeout | integration(故障注入) | generating 超 TTL→failed(version CAS)；迟到 run 回写 0 行不覆盖 |
| TC-IH-13-crash-safe | integration | sweeper 停摆重启→按持久 deadline 补迁逾期会话（非内存定时器） |
| TC-IH-13-zombie-active | integration(故障注入) | active+lease 死→bump epoch 栅栏；过 TTL 则 abandoned+released，否则留 waiting_user |
| TC-IH-13-no-arbitrage | integration(security) | 卡 TTL 边界无法白嫖：start 已 reserved，abandoned 才 released |

---

## 附录 A · 七类覆盖矩阵（自检：缺失即不合格）

| UC | 正常 | 异常(回滚/退款) | 特殊(边界/空/首次/i18n) | 逃逸(降级/kill/人工) | 高并发(双击/竞态CAS) | 复杂(saga/跨聚合/部分失败) | 刁钻(注入/越狱/刷分/泄题/PII/越权) |
|---|---|---|---|---|---|---|---|
| 01 列表/排序 | ✓ | ✓(503不返半量) | ✓(空分NULLS LAST) | ✓(硬上界截断) | ✓(投影刷新不跳行) | ✓(score排序混态) | ✓(游标HMAC/sort失配/unsupported) |
| 02 筛选 | ✓ | ✓(422) | ✓(时区半开区间) | ✓ | ✓ | ✓ | ✓(枚举白名单/参数化/审计脱敏) |
| 03 详情 | ✓ | ✓(分段降级) | ✓(半成品partial) | ✓(子源降级) | ✓ | ✓ | ✓(子资源IDOR) |
| 04 resume | ✓ | ✓(瞬时补偿/不可恢复退还) | ✓ | ✓(session_expired/kill) | ✓(fence单活动/作答幂等栅栏) | ✓(懒迁移) | ✓(flagged/IDEM冲突) |
| 05 报告 | ✓ | ✓(不退款免费重试) | ✓ | ✓(超重试/超时降级) | ✓(看门狗单写者) | ✓(saga部分失败) | ✓(快照损坏/不自评) |
| 06 删除 | ✓ | ✓(最终一致/不可逆/退还) | ✓ | ✓(purge_failed人工) | ✓ | ✓(跨存储级联+财务排除) | ✓(URL吊销/财务保留/存在性) |
| 07 批量 | ✓ | ✓(部分失败DLQ/批退还) | ✓ | ✓(分批限速) | ✓(快照防误删) | ✓ | ✓(越权过滤/confirmToken) |
| 08 接管 | ✓ | ✓(safety_hold/退还) | ✓ | ✓(双死sweeper) | ✓(epoch单调) | ✓(接管+迁移) | ✓(脑裂fence/作答强拦) |
| 09 空态 | ✓ | ✓(空vs错) | ✓ | ✓ | ✓ | ✓ | ✓ |
| 10 深翻页 | ✓ | ✓(跳已删) | ✓ | ✓(limit上界) | ✓(不串页) | ✓(score排序深页) | ✓(游标越权) |
| 11 搜索 | ✓ | ✓ | ✓(CJK) | ✓(限流429) | ✓ | ✓ | ✓(LIKE转义/泄题/审计脱敏) |
| 12 导出 | ✓ | ✓(partial) | ✓ | ✓(配额429) | ✓(60s短窗) | ✓(导出时删) | ✓(URL吊销/越权/step-up) |
| 13 看门狗 | ✓ | ✓(退还幂等/GC补偿) | ✓(TTL边界) | ✓(停摆补扫) | ✓(resume竞争/报告单写者) | ✓(过期+软删) | ✓(无套利/不重复退) |

## 附录 B · 两轮评审必补清单对账（P0→P2 全部落点）

| # | 必补项（评审） | 落点 | 状态 |
|---|---|---|---|
| 1 | AiGraphRun fencing token/epoch + lease 心跳，checkpoint 写带 fence；删 resume_lock 布尔锁 | 0.1 + UC-04/08 | 已落 |
| 2 | 死 run 检测，修僵尸 active resume 盲点 | 0.1 + UC-04 C2 + UC-13 | 已落 |
| 3 | resumableUntil + 过期→abandoned + checkpoint GC | 0.2 + **UC-13** + UC-04 X1 | 已落 |
| 4 | 计费时点 + 失败/废弃/删除 in_progress **退额度规则 + 幂等退款测试** | 0.3 + UC-04/06/07/13 | 已落 |
| 5 | resume CAS 并入 flagged=false | UC-04 主流程2/T1 | 已落 |
| 6 | 删除即吊销在途签名 URL | 0.7 + UC-06 T1/UC-12 T1 | 已落 |
| 7 | 筛选/搜索白名单显式排除 soft_deleted/purged | 0.5 + UC-02 T1 | 已落 |
| 8 | all:true 绑请求时刻快照 | UC-07 C1 | 已落 |
| 9 | IDEM 原语规格化 + **导出短 TTL 60s** | 0.4 + UC-12 | 已落 |
| 10 | LIKE 元字符转义 + 搜索语义定义 | UC-11 | 已落 |
| 11 | 批量删除任务状态查询端点 | UC-07 + 契约 | 已落 |
| 12 | export 每用户频率配额 + **step-up 认证 + 出口审计** | 0.9 + UC-12 | 已落 |
| 13 | 懒加载答案分段子资源契约 + RLS | UC-03 | 已落 |
| 14 | undo 删除支持/non-goal 显式 | UC-06 (soft_deleted→visible 宽限) | 已落 |
| 15 | 性能验收口径重写 + **删时延持平断言**，仅留 EXPLAIN 无 SeqScan/无 OFFSET/扫描行有界 | 0.7' + UC-01/10 | 已落 |
| 16 | 删读副本降级/报告译文层 → 删或降级 | 0.7'(503)/UC-05(non-goal 译文) | 已落 |
| 17 | READY 报告快照损坏降级用例 | UC-05 T1 | 已落 |
| 18 | **新增 UC：会话过期/废弃看门狗**（expired/abandoned 生产者，幂等/CAS/不破坏 checkpoint） | **UC-13** | 已落 |
| 19 | **UC-04 resume 失败补偿事务**（区分瞬时回滚/不可恢复退还，lease TTL 自动释放，消自相矛盾） | UC-04 补偿段 + E1/E2 | 已落 |
| 20 | **非时间排序复合 keyset 游标 + NULL 排序**（否则禁用 score/role 排序） | 0.6 + UC-01/10 | 已落 |
| 21 | **erasure 显式排除 consumption_record/财务审计账本**（去标识保留）+ 删后财务凭证仍在测试 | 0.8 + UC-06 T4/E3 | 已落 |
| 22 | **看门狗 vs 活跑单写者栅栏**（report version CAS + 终止迟到 run） | UC-05 C2 + UC-13 | 已落 |
| 23 | **SSE resume 重放作答幂等栅栏**（按 question turn） | UC-04 主流程6/C3 | 已落 |
| 24 | **UC-08 takeover 推送机制**（失效 A 活 SSE + 服务端强拦） | UC-08 主流程4/E·T3 | 已落 |
| 25 | **confirm token / IDEM 语义与 TTL 写死** | 0.4 + 0.4' | 已落 |
| 26 | **score 投影来源/同步定义**（只读派生 + outbox + 版本戳） | 0.10 + UC-01 | 已落 |
| 27 | **所有「按策略」各定一结论**（删除模式/混入他人id/导出计费/undo） | 0.3/0.7/UC-06/UC-07 T1 | 已落 |
| 28 | **PII 全量导出 step-up + 出口审计** | 0.9 + UC-12 T4 | 已落 |
| 29 | **from/to 时区口径**（半开区间 + tz 归一） | 0.11 + UC-02 S3 | 已落 |
| 30 | **关键词审计脱敏**（一律 hash/截断，弃敏感分类器） | 0.12 + UC-02/11 | 已落 |
| 31 | **vector-purge 证明力**（先证删前可召回再证删后不可召回） | UC-06 erasure-keeps-finance 测试（含删前可召回前置） | 已落 |

## 附录 C · 新增/扩展状态机对象（须同步 status-machine.md + check-docs.mjs）

- `DeletionRecord`（绑定 Interview）：`visible · soft_deleted · purging · purged · purge_failed`（含 undo `soft_deleted→visible` 宽限守卫、purging 后不可逆）。
- `AiGraphRun` 扩展：`fenceEpoch / leaseOwner / leaseExpiresAt / heartbeatAt`（单活动 run 真正执行点）+ `safe_terminating / migrating / quarantined`。
- `Interview` 扩展：`interruptedAt / resumableUntil`；过期 `waiting_user→abandoned`（生产者 = UC-13 看门狗）；resume 瞬时失败补偿 `active→waiting_user`。
- `AssessmentReport`：全终态写 version CAS 单写者（看门狗 vs 真实 run 竞争只一个赢）。
- `BatchJob`、`ExportJob`：`pending → running → completed / partial / failed`，RLS 绑 owner。
- `ConsumptionRecord(reserved→released)`：abandon/cancel/expire/delete-in_progress 一律 released（幂等退还）。
- 新表/列：`idempotency_key`（分级 TTL）、`confirmToken`（HMAC，TTL 5min）、`export_audit`（出口留痕）、`Interview.scoreSummary + reportVersion`（只读投影）、`answer_turn (thread_id, turn_seq)` UNIQUE（作答幂等栅栏）。
- 复用：`CompensationJob`(+DLQ+sweeper)、`ManualReview`。

## 附录 D · 仍需签字的待拍板项（PIN，落数前确认；见 open-decisions）

- `RESUMABLE_TTL`（会话可续期）`PIN=7天`。
- sweeper 扫描周期 `PIN=1min`；报告生成 TTL（generating 超时）`PIN=待定`。
- 导出配额 `PIN=1次/小时、3次/天`；导出 IDEM 短 TTL `PIN=60s`；confirmToken TTL `PIN=5min`；step-up 豁免窗 `PIN=10min`。
- 审计关键词截断长度 `PIN=8字符`。
- completed 报告是否允许重生成一次（UC-05 守卫）`PIN=允许1次`。
