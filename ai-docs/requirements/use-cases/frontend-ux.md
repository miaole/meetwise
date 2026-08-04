---
id: requirements_uc_frontend_ux
name: 用例 · 前端 SSE·流式·多标签·恢复·无障碍·性能
description: 前端 SSE·流式·多标签·恢复·无障碍·性能 业务用例与测试用例（正常/异常/特殊/逃逸/并发/复杂/刁钻七类，22 UC / 101 TC）。
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

# 前端体验域（frontend-ux）用例 + 测试用例 · 最终收口文档

> **🔎 实现状态（对齐真实代码 · 2026-07）** — 本文是 TARGET 规格。**✅ 已实现+接线**：约 25 个真实 SSR 页面（RSC + Server Actions + cookie 鉴权）、SSE 业务事件消费、状态感知渲染（server-truth-wins，避免 spinner 死胡同）、PC/H5 响应式（Tailwind/shadcn）、next-intl 中英、真浏览器 Playwright E2E（chromium+H5 通过）；serverFetch content-type 静默失败 bug 已修。**🟠 部分**：文内多标签同步、离线恢复、无障碍全量、细粒度 PERF 阈值门等 22 UC 未全部落到自动化验收；基础渲染态机与流式已生效。

> 收口依据：`requirements/use-case-conventions.md`、`testing/conventions/test-authoring.md`、`rules/global/status-machine.md`、`architecture/ai/langgraph-blueprint.md`、`architecture/frontend/frontend-blueprint.md`。
> 本文针对 frontend-ux 对抗评审逐条整改：补齐业务生命周期两端（创建/额度入口、报告/退款出口）、把"服务端不变量/模型语义/CI 构建门"从 FE 可测验收剥离、为每条异常/刁钻流落到机制、统一 FE 渲染态机迁移表、给 PERF 填具体阈值、修正测试层映射。
> 七类覆盖标注：**正常 / 异常 / 特殊 / 逃逸 / 并发 / 复杂 / 刁钻**，每条 UC 必须七类齐全。

---

## 0. 横切：FE 渲染态机（统一迁移表 — 使状态机可审计可测）

**根不变量（CLAUDE.md 载重承诺）**：FE 渲染态机**不是业务真相源**。业务真相在服务端 LangGraph checkpoint / 业务表。FE 态机只约束"本页渲染与本地交互可达性"，并接受**服务端事件强制收敛（server-truth-wins）**：任一入站业务事件（`waiting_user`/`answer_evaluated`/`report_ready`/`error`/安全事件）可无视本地态强制迁移。FE 态不写任何业务账本。

**枚举（全站唯一，禁止各 UC 自造）**：
`loading · empty · streaming · waiting_user · submitting · submitted · reconnecting · auth_recovering · degraded · error · report_polling · report_failed · session_expired(终) · abandoned(终) · crisis_safe_stop(终)`

| from | to | 触发（FE 侧） | 守卫 | 终态 |
|---|---|---|---|---|
| loading | empty / waiting_user / streaming / degraded / error | 首拉 checkpoint 完成，按服务端 status 投影 | 响应 schema 合法 | — |
| waiting_user | submitting | 用户提交答案（乐观） | 输入非空 + 持有本页写令牌（leader） | — |
| submitting | submitted | 收到提交 ack（HTTP 2xx + 同幂等键） | ack 幂等键 == 本地键 | — |
| submitting | waiting_user | 提交失败可重试（网络/5xx） | 重试预算内；**复用同一幂等键** | — |
| submitted | streaming / waiting_user / report_polling | 收到 `answer_evaluated` / 下一 `question_ready` / 面试 `completed` | seq 单调递增 | — |
| streaming | waiting_user | 收到 `waiting_user` 事件 | — | — |
| 任意非终 | reconnecting | SSE 流结束/心跳超时（前台） | 非后台节流误判（见 FE-BGTAB-001） | — |
| reconnecting | 回到收敛态 | 重连成功，按 `Last-Event-ID` 重放收敛 | seq > lastSeen 才应用 | — |
| 任意非终 | auth_recovering | 收到 401 | 静默刷新预算内 | — |
| auth_recovering | 回到原态 / session_expired | 刷新成功 / 失败 | — | session_expired=终 |
| 任意非终 | degraded | 收到 `error`(可降级) / 部分数据 | 有可展示残值 | — |
| 任意非终 | error | 不可恢复拉取失败 | — | （可手动重试→loading） |
| 面试 completed | report_polling | 进入报告页 | Interview=completed | — |
| report_polling | report_failed | 轮询到 `AssessmentReport=failed`/超时 | — | （可重试→report_polling） |
| 任意非终 | abandoned | 用户确认放弃 / 服务端 `abandoned` | — | **终** |
| 任意非终 | session_expired | 服务端 TTL 过期且不可续 | — | **终** |
| 任意非终 | crisis_safe_stop | 收到安全终止事件（危机自伤） | — | **终（隐藏打分/继续元素）** |

**非法迁移（必测断言 0 次发生）**：`submitted→submitting`（不得本地回退已确认提交）、`crisis_safe_stop→streaming/waiting_user`（安全终止后必须经新导航重开，不得本地复活）、`session_expired→waiting_user`（过期态不得本地复活继续作答）、`abandoned→*` 非终。
**合法澄清**：`submitting→waiting_user→submitting`（重试合法，须同一幂等键）；`submitting→queued` **不引入**——评审质疑的 `queued` 态删除，排队语义由服务端 `progress` 事件渲染，FE 不持有排队业务态。

---

## UC-FE-START-001 · 开始面试 / 创建会话入口（genesis）

- **角色**：求职者
- **前置**：已登录（httpOnly cookie）；已选岗位/简历/服务类型；尚无对应进行中 `Interview`。
- **触发**：用户在 `/interview/start` 点击"开始面试"。

### 主流程 Main（正常）
1. 表单用契约 Zod schema 客户端预校验（岗位/简历/serviceType 必填）。
2. 客户端生成稳定 `createIdempotencyKey`（绑定 userId+roleProfileId+resumeVersionId+serviceType 哈希），随创建请求发送。
3. 调用 `POST /interview`（类型化 fetch，复用 contracts 的 zod4 schema 校验）。服务端：额度门（`ConsumptionRecord` reserved CAS 扣减）→ 创建 `Interview(created→active)` → 入队首问。
4. 收到 `resultId`，路由跳 `/interview/[resultId]`，FE 态 `loading→waiting_user`（首问 `question_ready`/`waiting_user` 事件到达）。

### 备选流 Alternate（正常-合法分支）
- A1：用户用"再来一场（相同配置）"再次创建 → 因幂等键不同（含时间盐由服务端区分）得到新 `resultId`，旧场不受影响。

### 异常流 Exception（每条落机制）
| flow | 类 | 场景 | 机制落点 | 后置 |
|---|---|---|---|---|
| E-额度不足 | 异常 | 额度=0 / reserve CAS 失败 | `ConsumptionRecord` reserve CAS 返回失败 → 服务端 402 | FE 不创建会话，跳 FE-ENTITLE-001 引导充值；无账本写 |
| E-创建失败回滚 | 异常 | 首问生成失败 / 服务端 5xx | 服务端 `Interview→failed` 且 reserved→released | FE 显示"未能开始，权益已退还"，态→error；可重试 |
| E-重复创建（双击） | 并发 | 同页双击/重复提交 | **幂等键唯一**（`ON CONFLICT DO NOTHING`）→ 同一 `resultId` | 只创建一次、只 reserve 一次 |
| E-多页签同时开始 | 并发/刁钻 | 两个标签页同配置同时点 | 同一 `createIdempotencyKey` → 服务端去重；FE 写令牌（Web Lock）保证仅 leader 发起 | 仅一个 `Interview`，另一个收敛到同 `resultId` |

### 特殊/逃逸/复杂/刁钻
- **特殊**：首次用户无简历 → 入口禁用并引导上传（空态）；i18n：错误文案随 locale（zh/en）切换且键存在。
- **逃逸**：服务端 reserve 成功但首问长时间不达（超 N s）→ 不卡死，落 degraded：可"返回列表，后台继续生成首问"，凭 `resultId` 稍后进入。
- **复杂**：reserve→create→首问 是跨聚合 saga 的 FE 投影；任一步失败，FE 必须呈现 saga 终态（released/failed），不得停在 spinner。
- **刁钻**：用户改请求体绕过客户端校验 → 服务端二次校验拒绝，FE 渲染服务端错误，不信任本地校验通过态。

### 后置 Postcondition
成功：`Interview=active`、`ConsumptionRecord=reserved`、写 `interview_event(created/question_ready,seq)`。失败：`Interview=failed`+`ConsumptionRecord=released`，FE 态 error/degraded。

### 验收 Acceptance（可测）
- 双击创建 → 网络层恰一条携带相同 `createIdempotencyKey` 的 `POST /interview`（去重 hook 单测）；mock 服务端恰返回一个 `resultId`。
- 额度=0 → 不发创建请求或收 402 后渲染充值引导，**URL 不跳 [resultId]**。
- 创建失败 → DOM 出现"权益已退还"文案且态=error（注入 5xx fixture）。

### 关联
契约：`POST /interview`、`GET /interview/:id/events`。状态机：Interview(created→active/failed)、ConsumptionRecord(reserve)。原语：**幂等键 + CAS**（评审修正：建单去重=幂等键，额度扣减=CAS，二者并存）。安全：所有表单输入为不可信，服务端权威校验。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-START-001-normal | 正常 | 集成(MSW+RTL) | 提交→收 resultId→路由跳转→渲染首问 |
| TC-FE-START-001-dupkey | 并发 | 单元(请求构造器) | 双击仅发一请求且 `createIdempotencyKey` 一致 |
| TC-FE-START-001-noquota | 异常/特殊 | 集成 | 402 → 渲染充值引导、URL 不变 |
| TC-FE-START-001-rollback | 异常 | 集成 | 5xx → "权益已退还" + 态 error |
| TC-FE-START-001-multitab | 并发/刁钻 | 单元(Web Lock mock) | 仅 leader 标签发起创建 |
| TC-FE-START-001-i18n | 特殊 | component | locale=en 时错误键存在、无缺键回退 |

---

## UC-FE-ENTITLE-001 · 权益/额度耗尽拦截与续接

- **角色**：求职者
- **前置**：已登录；尝试进入需消耗权益的能力（开始面试/押题）。
- **触发**：能力入口点击，或服务端返回 402/额度不足。

### 主流程 Main（正常）
1. 入口处 FE 用 `GET /entitlements`(TanStack Query 缓存) 预判额度，额度=0 时入口呈"额度不足"态并禁用主按钮。
2. 引导"去充值"→ `/profile` 充值（FE-PAY-001）。
3. 充值回跳后失效 `entitlements` 缓存重拉，额度>0 → 恢复入口可用，续接原意图（深链回原配置）。

### 备选流 / 异常 / 特殊 / 逃逸 / 并发 / 复杂 / 刁钻
- **正常备选**：额度>0 直接放行。
- **异常**：预判 `GET /entitlements` 失败 → 不阻断也不盲放行：按钮置 degraded，提交时以服务端 402 为准（FE 预判仅体验优化，非授权）。
- **特殊**：首次用户赠送额度边界（恰好 1 次）；i18n 文案。
- **逃逸**：充值链路不可用 → 提供"稍后再试/联系客服"出口，不死锁在弹窗。
- **并发**：多标签页同时消费最后 1 次额度 → 服务端 reserve CAS 仅一个成功，另一标签收 402，FE 收敛为"额度已被占用"。
- **复杂**：充值→回跳→续接 是跨页 saga；中途关页再回，凭意图深链恢复。
- **刁钻**：用户本地改 `entitlements` 缓存伪造额度 → 仍被服务端 reserve CAS 拦截；FE 不以本地数为授权依据。

### 后置
不创建会话时无业务写；`ConsumptionRecord` 由服务端 reserve CAS 决定。FE 渲染态：`empty`(额度0)/`degraded`(预判失败)。

### 验收（可测）
- 注入 `entitlements.remaining=0` → 主按钮 disabled 且出现充值引导。
- 注入提交时 402 → 即便本地缓存>0，也不进入会话、渲染拦截。
- 充值回跳后 query 失效 → 重新放行（缓存失效断言）。

### 关联
契约：`GET /entitlements`、`POST /interview`(402)。状态机：ConsumptionRecord(reserve)。原语：CAS（额度）。安全：本地额度不可信。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-ENTITLE-001-block | 正常/特殊 | component | remaining=0 → disabled + 引导 |
| TC-FE-ENTITLE-001-server402 | 刁钻/异常 | 集成 | 本地>0 但 402 → 拦截 |
| TC-FE-ENTITLE-001-resume | 复杂 | 集成 | 回跳后 query invalidate → 放行续接 |
| TC-FE-ENTITLE-001-race | 并发 | 集成 | 最后 1 次额度并发 → 一成一拒(402) |

---

## UC-FE-QUIZ-001 · 押题逐题作答（resume-quiz 产品线主用例）

- **角色**：求职者
- **前置**：押题 `Interview(serviceType=resume_quiz)` 已生成 `ForecastQuestion[]`。
- **触发**：进入押题运行页逐题作答/查看标准解。

### 主流程 Main（正常）
1. SSE 接 `question_ready` 渐进渲染题目列表（不一次性等全集）。
2. 用户逐题展开作答/自评，提交携带题级幂等键。
3. 收 `answer_evaluated` 渲染计分与标准解（Markdown 经 rehype-sanitize）。

### 七类覆盖
- **正常**：全部题就绪后展示总览；备选-跳过某题合法。
- **异常**：单题评估失败 → 该题降级"暂不可评，重试"，不阻塞其它题（题级舱壁）。
- **特殊**：空题集（生成 0 题）→ 空态引导重生成；超长题干 CJK 折行；i18n。
- **逃逸**：押题图整体失败 → 保留已就绪题的残值 + "返回列表后台续算"出口。
- **并发**：同题双击提交 → 题级幂等键去重，仅一次评估。
- **复杂**：题量大时虚拟列表渲染（>50 虚拟化），渐进 + 断线重放保持顺序。
- **刁钻**：用户提交注入文本企图诱导模型刷高分/泄露其它题答案 → 提交即不可信，服务端处理；FE 不据答案内容改本地分；`message_delta` 讲解流见 FE-STREAM-001 围栏。

### 后置
题级 `answer_evaluated` 事件按 seq 渲染；FE 态在 `streaming/waiting_user/submitting/submitted` 间。无 FE 账本写。

### 验收
- 注入 3 条乱序 `question_ready` → 按 seq 稳定排序渲染。
- 单题 `error` 事件 → 仅该题降级，其余可交互（DOM 隔离断言）。
- 同题双击 → 一条提交请求、相同题级幂等键。

### 关联
契约：`GET /interview/:id/events`、`POST /interview/:id/answer`。状态机：Interview。原语：幂等键 + 持久有序事件日志(seq)。安全：答案为不可信输入。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-QUIZ-001-stream | 正常/复杂 | component(SSE fixture) | 乱序事件按 seq 渲染 |
| TC-FE-QUIZ-001-itemfail | 异常/逃逸 | component | 单题 error 仅局部降级 |
| TC-FE-QUIZ-001-empty | 特殊 | component | 0 题 → 空态引导 |
| TC-FE-QUIZ-001-dup | 并发 | 单元 | 同题双击去重 |

---

## UC-FE-STREAM-001 · 讲解流流式渲染（fence 状态机）【返修后保留】

> **返修说明（评审第二节）**：原 UC 引入"来源含糊的逐字 chunk"违反"前端不消费 token"不变量。整改：流式增量**只允许绑定 langgraph-blueprint 已列的契约事件 `message_delta`**，且该事件被强约束为：①携带单调 `seq`、可经 `Last-Event-ID` 重放；②**仅承载讲解类展示文本，绝不承载任何业务状态**（分数/状态/题目结构走各自业务事件）。fence 状态机只做"展示层 Markdown 围栏安全闭合"，不产生业务事实。若契约未提供 `message_delta`，本 UC 退化为整段渲染，不得自造未契约通道。

- **角色**：求职者 / 系统(SSE)
- **前置**：运行页已建立 SSE；服务端按契约推送 `message_delta`(seq)。
- **触发**：收到 `message_delta` 增量。

### 主流程 Main（正常）
1. fence 状态机接收增量，维护 Markdown 围栏开闭状态（代码块/列表/CJK 引号）。
2. 仅在围栏安全闭合点提交 sanitize 后渲染（react-markdown + rehype-sanitize）。
3. 收到对应业务事件（如 `answer_evaluated`）后用业务事件为准定稿，丢弃讲解流临时态。

### 七类覆盖
- **正常**：完整流顺序渲染；备选-讲解流缺省（服务端不推 `message_delta`）→ 整段渲染。
- **异常**：流中途 `error` → 已渲染讲解保留为 degraded，标注"讲解未完"，不破坏页面。
- **特殊**：CJK 全角引号/未闭合代码围栏；空增量；i18n 文案。
- **逃逸**：讲解流不可用 → 回退整段渲染（kill-switch 关闭逐字渲染），不影响业务事件路径。
- **并发**：重连后重复 `message_delta` → 以 seq 幂等去重，不重复追加。
- **复杂**：长讲解跨多重连，按 `Last-Event-ID` 重放拼接不错位。
- **刁钻**：增量被截断在 `<script` 中途 / 注入 `<img onerror>` / 伪 Markdown XSS → sanitize 白名单拦截，**截断态绝不提交渲染**（围栏未闭合不渲染）；DOM 零 `<script>` 注入。

### 后置
无业务写；FE 态 `streaming`，定稿后由业务事件迁移。讲解流临时态不进任何账本。

### 验收
- 注入含 `<img src=x onerror=alert(1)>` 的 `message_delta` → DOM 无 onerror、无脚本执行。
- 注入截断于代码围栏中的增量 → 该帧不渲染，闭合后才渲染。
- 重连重复 seq 增量 → 文本不重复。
- 关闭讲解流开关 → 同内容整段渲染、业务事件不受影响。

### 关联
契约：`message_delta`(必须带 seq)。状态机：FE 渲染态(streaming)。原语：持久有序事件日志(seq 重放/幂等)。安全：`structured-output-and-safety` — AI 输出不可信，sanitize + 围栏闭合门。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-STREAM-001-normal | 正常 | component(fixture) | 顺序增量渲染等于终稿 |
| TC-FE-STREAM-001-xss | 刁钻 | component | 注入脚本被 sanitize，DOM 零 script/onerror |
| TC-FE-STREAM-001-truncate | 刁钻/特殊 | 单元(fence FSM) | 围栏未闭合帧不渲染 |
| TC-FE-STREAM-001-replay | 并发/复杂 | component | 重复 seq 不重复追加 |
| TC-FE-STREAM-001-killswitch | 逃逸 | component | 关流 → 整段渲染、业务事件正常 |

---

## UC-FE-SSE-001 · SSE 业务事件消费与断线韧性

- **角色**：求职者 / 系统
- **前置**：运行页订阅 `GET /interview/:id/events`(SSE)。
- **触发**：建立/维持/重连 SSE。

### 主流程 Main（正常）
1. 建立 EventSource/fetch-stream，记录 `lastEventId`(seq)。
2. 解析强类型业务事件（`progress/question_ready/waiting_user/answer_evaluated/report_generating/report_ready/error`）→ 驱动 FE 渲染态机。
3. 流结束（含 Serverless 超时正常结束）→ 用同 `resultId` + `Last-Event-ID` 重连，按 seq>lastSeen 收敛。

### 七类覆盖
- **正常**：心跳维持；备选-服务端主动 `report_ready` 跳报告页。
- **异常**：`error`(可降级) → 渲染 degraded + 重试；不可恢复 → error 态。
- **特殊**：首事件前的空白态(loading)；i18n 状态文案；事件乱序到达按 seq 排序。
- **逃逸**：连续重连 N 次仍失败 → 提供"返回列表，凭 resultId 稍后恢复"出口（不无限 spinner）；服务端安全终止事件 → `crisis_safe_stop` 终态。
- **并发**：重连后重复事件 → seq 幂等去重。
- **复杂**：跨多次重连拼接完整会话，状态由 checkpoint 收敛而非客户端累计。
- **刁钻**：服务端推来 seq 倒退/重复/缺口 → seq<=lastSeen 丢弃；缺口触发一次性全量重放回查，不盲信单事件；恶意超大事件体 → 大小上限保护。

### 后置
FE 态随事件收敛；不写业务账本（账本在服务端事件日志）。

### 验收
- `Last-Event-ID=N` 重连 → 仅应用 seq>N（断言不重复渲染已见事件）。
- 注入乱序事件 → 渲染顺序按 seq。
- 注入 seq 倒退事件 → 被丢弃。
- 重连失败 N 次 → 出现逃逸出口而非永久 loading。

### 关联
契约：SSE 事件清单 + seq。状态机：FE 渲染态机；Interview 由服务端驱动。原语：持久有序事件日志(seq/Last-Event-ID 重放)。安全：事件为不可信，大小/类型校验。

### 测试用例（评审修正层映射：FE 渲染断言用 SSE 边界注入 fixture 的 component/集成层，不挂 graph+真实图）
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-SSE-001-normal | 正常 | component(SSE fixture, **非 graph**) | 固定事件序列 → 期望渲染 |
| TC-FE-SSE-001-replay | 并发/复杂 | component | Last-Event-ID 只应用 seq>N |
| TC-FE-SSE-001-outoforder | 特殊/刁钻 | 单元(reducer) | 乱序按 seq、倒退丢弃 |
| TC-FE-SSE-001-escape | 逃逸 | component | N 次重连失败 → 逃逸出口 |
| TC-FE-SSE-001-safestop | 逃逸 | component | 安全终止事件 → crisis_safe_stop 终态、隐藏继续 |

---

## UC-FE-BGTAB-001 · 后台标签页节流下的断线看门狗

- **角色**：求职者(浏览器)
- **前置**：运行页 SSE 活跃；用户切到后台标签。
- **触发**：浏览器对 background tab 节流 timer。

### 主流程 Main（正常）
1. 监听 `visibilitychange`；进入 hidden 时**放宽心跳看门狗阈值或暂停误判**（不以前台心跳窗口判后台断线）。
2. 回前台 visible 时，不盲目重连：先用 `Last-Event-ID` 校正/续读，仅当确认流确实关闭才重连。

### 七类覆盖
- **正常**：后台→前台无谓重连=0。
- **异常**：后台期间真断线 → 前台化后凭 Last-Event-ID 重连补 seq。
- **特殊**：移动端切后台被系统挂起；长时间后台(数分钟)；i18n 无关。
- **逃逸**：前台化后服务端已 TTL 过期 → `session_expired` 终态 + 重开入口。
- **并发**：多后台标签同时前台化 → 配合 FE-MULTITAB-001 leader 仅一个重连。
- **复杂**：后台 30 分钟 + 服务端 checkpoint 仍在 → 前台化凭 resultId 全量收敛。
- **刁钻**：**时钟漂移/定时器节流**致看门狗误判（评审点名最常见 SSE bug）→ 用 `document.visibilityState` 与单调时钟(performance.now)而非 wall-clock 判定，hidden 态不触发断线重连。

### 后置
无业务写；FE 态保持，前台化后收敛。

### 验收
- 模拟 hidden + timer 节流（jsdom 伪造 visibility）→ 看门狗**不**触发重连（断言 reconnect 调用次数=0）。
- visible 化且流仍开 → 不重连；流已关 → 携 Last-Event-ID 重连一次。

### 关联
契约：SSE。状态机：FE 渲染态(reconnecting/session_expired)。原语：事件日志(Last-Event-ID)。安全：—。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-BGTAB-001-noflap | 特殊/正常 | 单元(visibility mock) | hidden 节流不触发重连 |
| TC-FE-BGTAB-001-correct | 异常 | component | 前台化凭 Last-Event-ID 校正而非盲重连 |
| TC-FE-BGTAB-001-expired | 逃逸 | component | 前台化遇 TTL 过期 → session_expired |

---

## UC-FE-MULTITAB-001 · 同账号多标签页同会话协调

- **角色**：求职者(多标签)
- **前置**：同账号在多个标签打开同一 `/interview/[resultId]`。
- **触发**：多个标签欲各自建 SSE / 提交。

### 主流程 Main（正常）
1. 用 **Web Lock / BroadcastChannel 选举 leader**；仅 leader 持有唯一 `EventSource`。
2. leader 通过 BroadcastChannel 把业务事件广播给 follower 标签渲染。
3. 写操作（提交答案）只允许持写令牌的 leader 发起；follower 提交请求转交 leader 或共享同一幂等键。

### 七类覆盖
- **正常**：N 标签仅 1 条 SSE、1 份 replay。
- **异常**：leader 崩溃/关页 → follower 重新选举接管，凭 resultId+Last-Event-ID 续。
- **特殊**：隐身窗口无共享上下文 → 退化为各自独立连接但仍受服务端 lease（FE-NET-002）约束。
- **逃逸**：BroadcastChannel/Web Lock 不可用(老浏览器) → 退化：每标签独立连接，服务端 thread lease 兜底防双写。
- **并发**：两标签同时提交同题 → 共享/同一幂等键 → 服务端去重，仅一次评估。
- **复杂**：**EventSource 同域 6 连接上限(HTTP/1.1)**（评审点名）→ 多标签/多研究任务共享 leader 单连接 + 退避，避免连接池饿死新 SSE。
- **刁钻**：两标签竞争 leader 出现脑裂 → Web Lock 互斥保证唯一持有；双 EventSource 抖动被 lease + leader 选举收敛，不致双倍重连风暴。

### 后置
仅一条活跃 SSE；写操作经唯一写令牌；服务端 thread lease(CAS) 终裁。FE 态各标签经广播收敛一致。

### 验收
- 开 3 标签 → 活跃 EventSource 实例数=1（断言）。
- 杀掉 leader → follower 在阈值内重新选举且 SSE 实例仍=1。
- 两标签同时提交同题 → 网络层一条提交、相同幂等键。
- 无 BroadcastChannel 环境 → 退化为独立连接但服务端 lease 仅允许一个写者（集成）。

### 关联
契约：SSE、`POST /answer`。状态机：AiGraphRun thread lease；FE 渲染态。原语：**FE 写令牌(Web Lock/BroadcastChannel leader) + 服务端 lease CAS + 幂等键**。安全：—。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-MULTITAB-001-leader | 并发/正常 | 单元(Web Lock mock) | N 标签仅 1 EventSource |
| TC-FE-MULTITAB-001-failover | 异常 | 单元 | leader 关闭 → 重新选举 |
| TC-FE-MULTITAB-001-dupsubmit | 并发/刁钻 | 集成 | 两标签同题提交 → 一次评估 |
| TC-FE-MULTITAB-001-degrade | 逃逸 | 集成 | 无 BC → 服务端 lease 仅一写者 |
| TC-FE-MULTITAB-001-poolcap | 复杂/刁钻 | 单元 | 超 6 连接 → 共享 leader + 退避，无饿死 |

---

## UC-FE-NET-001 · 响应丢失重发（幂等携带）

> **评审修正**："不双扣"是服务端幂等重放的保证，**不写进 FE 验收**。FE 可测口径仅"重发携带相同 Idempotency-Key"；"不双扣"落 commerce 集成层（见 FE-REFUND-001/对账）。

- **角色**：求职者
- **前置**：已提交答案/创建/支付类写请求，响应在网络中丢失（请求可能已被服务端处理）。
- **触发**：超时/网络中断后客户端重试。

### 主流程 Main（正常）
1. 写请求一律携带稳定 `Idempotency-Key`（提交=题级键，创建=createKey）。
2. 响应丢失 → 在重试预算内**复用同一 key** 重发，态 `submitting→waiting_user→submitting`。
3. 收到任一成功响应即定稿 `submitted`，不再重发。

### 七类覆盖
- **正常**：一次丢失一次重发成功。
- **异常**：重试预算耗尽 → degraded "提交可能未送达，请刷新查看"，引导以服务端事件为准。
- **特殊**：首次提交即丢失；慢网（重发与原响应竞态）。
- **逃逸**：彻底失败 → 不杜撰成功态；提供刷新/重进入口由 checkpoint 收敛真相。
- **并发**：原请求迟到 + 重发并发到达 → 同 key 服务端幂等，FE 收敛一份。
- **复杂**：丢失发生在评估返回路径 → FE 不据本地乐观分定稿，等服务端 `answer_evaluated` 收敛。
- **刁钻**：重发时本地误生成新 key → **必测断言禁止**：同一逻辑提交跨重试 key 不变。

### 后置
FE 态 submitting↔waiting_user↔submitted；不写业务账本；不变量由服务端幂等保证。

### 验收（FE 仅测请求构造）
- 同逻辑提交重发 → 所有重发请求 `Idempotency-Key` 严格相等（请求构造器单测）。
- 重试预算耗尽 → 渲染 degraded、不渲染伪成功。

### 关联
契约：写端点(`Idempotency-Key` header)。状态机：FE 渲染态。原语：幂等键(FE 携带) + 服务端幂等重放(归 commerce 集成层)。安全：—。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-NET-001-idem | 正常/刁钻 | **单元(请求构造器)**(评审修正，非集成) | 重发 key 恒等 |
| TC-FE-NET-001-exhaust | 异常/逃逸 | component | 预算耗尽 → degraded、无伪成功 |
| TC-FE-NET-001-noundercount | 复杂 | 集成(commerce) | (越层项移此) 同 key 重发服务端不双扣 |

---

## UC-FE-NET-002 · 跨设备 / 长时（停 3 天后）resume

- **角色**：求职者
- **前置**：存在未完成 `Interview`（`waiting_user`），checkpoint 在服务端。
- **触发**：用户换设备 / 停 3 天后凭 URL/历史进入。

### 主流程 Main（正常）
1. 进入 `/interview/[resultId]` → RSC/Query 拉权威 checkpoint 与 `waiting_user`。
2. 渲染服务端权威历史（Zustand 不作事实源），态收敛 `waiting_user`，可继续作答。

### 七类覆盖
- **正常**：跨设备无缝续。
- **异常**：服务端 TTL 已过期 → `session_expired` 终态 + 重开入口；reserved 权益按状态机 released（FE-REFUND-001 呈现）。
- **特殊**：停 3 天后 resume；恰在 TTL 边界；i18n。
- **逃逸**：checkpoint 损坏/迁移失败(AiGraphRun→quarantined/safe_terminating) → 安全终止呈现 + 业务事实保全提示，不卡死。
- **并发**：旧设备仍开着 + 新设备进入 → 服务端 thread lease(CAS) 仅一个持写，另一只读。
- **复杂**：版本迁移(migrating)中 resume → FE 显示"恢复中"过渡，迁移成功后渲染，失败走 quarantined 逃逸。
- **刁钻**：本地缓存的旧 messages 与服务端不一致（评审 Pinia 漂移问题）→ **以服务端为准**，本地草稿仅作 UI 暂存，冲突时丢弃本地。

### 后置
成功：态 waiting_user；过期：session_expired + ConsumptionRecord released。FE 不写账本。

### 验收
- 注入 checkpoint fixture → 渲染权威历史（断言与本地 stale 草稿不同则取服务端）。
- 注入 TTL 过期 → session_expired + 不允许提交。
- 注入旧设备 lease 持有 → 新设备只读、提交被拒呈现。

### 关联
契约：`GET /interview/:id`、events。状态机：Interview/AiGraphRun(lease/migrating/quarantined)。原语：RLS(属主) + lease CAS + 事件日志。安全：属主隔离，本地状态不可信。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-NET-002-resume | 正常/特殊 | 集成 | 3 天后进入渲染权威 waiting_user |
| TC-FE-NET-002-expired | 异常/逃逸 | component | TTL 过期 → session_expired |
| TC-FE-NET-002-lease | 并发 | 集成 | 新设备只读、旧设备持写 |
| TC-FE-NET-002-staledrop | 刁钻 | component | 本地 stale 草稿被服务端覆盖 |

---

## UC-FE-EXIT-001 · 主动放弃 / 退出确认 / 二次进入

- **角色**：求职者
- **前置**：面试进行中(`waiting_user`/`active`)，可能有未提交草稿。
- **触发**：用户关闭/离开/点"退出"。

### 主流程 Main（正常）
1. 检测离场意图（路由守卫 + `beforeunload`）→ 弹"是否放弃本场？草稿将保留"确认。
2. 选择"保留并退出"→ 草稿存 Zustand 易失态（非事实源），会话保持 `waiting_user`。
3. 二次进入 → 提供恢复点选择（继续 / 放弃本场重开）。

### 七类覆盖
- **正常**：保留退出 + 二次继续。
- **异常**：用户选"放弃本场" → 服务端 `Interview→abandoned`、`ConsumptionRecord→released`（退还），FE 呈现"已放弃，权益已退"。
- **特殊**：草稿为空时不弹确认；首次离场教育提示；i18n。
- **逃逸**：`beforeunload` 被浏览器静默(移动端) → 不依赖它保真相，真相在服务端 checkpoint，二次进入凭 resultId 恢复。
- **并发**：一标签放弃、另一标签仍在作答 → 服务端 abandoned 为权威，另一标签收敛到 abandoned 终态。
- **复杂**：放弃 → released → 若同时报告已入队，子图舱壁使报告不被错误触发（abandoned 不入队报告）。
- **刁钻**：用户在确认弹窗与服务端 TTL 过期间隙竞态 → 以服务端状态机为准（abandoned/expired 谁先 CAS 谁定）。

### 后置
继续：Interview=waiting_user，草稿在易失态。放弃：Interview=abandoned + ConsumptionRecord=released，写 `interview_event(abandoned)`。

### 验收
- 有草稿离场 → 弹确认；无草稿 → 不弹。
- 选放弃 → 调 `POST /interview/:id/abandon`，渲染"权益已退还"。
- 二次进入 → 出现"继续/重开"选择，继续时渲染服务端权威历史。

### 关联
契约：`POST /interview/:id/abandon`、`GET /interview/:id`。状态机：Interview(abandoned)、ConsumptionRecord(released)。原语：CAS(状态迁移) + RLS。安全：草稿不可信、非事实源。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-EXIT-001-confirm | 正常/特殊 | component | 有/无草稿弹窗分支 |
| TC-FE-EXIT-001-abandon | 异常 | 集成 | 放弃 → abandoned + released 呈现 |
| TC-FE-EXIT-001-reentry | 复杂 | 集成 | 二次进入恢复点选择 |
| TC-FE-EXIT-001-race | 刁钻/并发 | 集成 | abandon 与 expire 竞态以服务端为准 |

---

## UC-FE-REDPEN-001 · 红笔批改动效

- **角色**：求职者
- **前置**：收到 `answer_evaluated`（含逐句批注定位）。
- **触发**：渲染批改高亮/红笔动效。

### 七类覆盖
- **正常**：按批注 span 渲染红笔下划线 + 悬浮释义。
- **异常**：批注定位越界/与文本不匹配 → 降级为整段标注，不抛错、不错位。
- **特殊**：CJK 与混排定位、空批注、超长答案；`prefers-reduced-motion` 关动效。
- **逃逸**：动效库失败 → 退化为静态高亮（无动画）仍可读。
- **并发**：重连重复 `answer_evaluated` → seq 幂等，不重复叠加红笔。
- **复杂**：多维度批注叠加（语法/逻辑/事实）分层渲染不互相遮挡。
- **刁钻**：批注文本含 Markdown/HTML 注入 → sanitize；动效不读取/执行批注内容为代码。

### 后置
无业务写；FE 态 streaming→定稿。

### 验收
- 注入越界 span → 不抛错、降级整段（无 console error）。
- `prefers-reduced-motion: reduce` → 无动画类、内容仍呈现。
- 重复 seq → 红笔节点数不翻倍。
- 批注注入 `<script>` → DOM 零脚本。

### 关联
契约：`answer_evaluated`(批注结构)。状态机：FE 渲染态。原语：事件日志(seq 幂等)。安全：批注为不可信 → sanitize。

### 测试用例（评审修正层：注入 fixture 的 component/UI-state 测试，非 e2e）
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-REDPEN-001-normal | 正常 | component | span 高亮正确 |
| TC-FE-REDPEN-001-oob | 异常 | component | 越界降级、无错 |
| TC-FE-REDPEN-001-a11y | 特殊/逃逸 | **component**(评审修正，非 e2e) | reduced-motion 无动画、aria-label 存在 |
| TC-FE-REDPEN-001-xss | 刁钻 | component | 批注注入被 sanitize |

---

## UC-FE-STATE-001 · 三态/列表态/降级（空·错·加载·降级）

- **角色**：求职者
- **前置**：任意数据驱动页面（历史列表、报告、档案等）。
- **触发**：数据加载生命周期。

### 七类覆盖
- **正常**：loading skeleton → 数据态；备选-分页/加载更多。
- **异常**：拉取失败 → error 态 + 重试按钮（不空白页）。
- **特殊**：空数据(首次无历史)→ 空态引导；CLS<0.1 的骨架占位；i18n。
- **逃逸**：部分接口失败 → degraded 渲染可得部分 + 标注"部分内容暂不可用"。
- **并发**：快速翻页/快速失效重取 → 请求竞态以最新为准（取消旧请求/丢弃过期响应）。
- **复杂**：列表 + 详情抽屉跨组件态一致；>50 项虚拟化。
- **刁钻**：服务端返回畸形/超大/字段缺失 payload → Zod 解析失败走 error/degraded，不渲染脏数据、不崩页。

### 后置
无业务写；FE 渲染态机 loading/empty/error/degraded。

### 验收
- 注入 loading → 骨架且布局位移 CLS<0.1（Lighthouse/测量）。
- 注入空数组 → 空态文案，无错误。
- 注入畸形 JSON → Zod fail → error/degraded，无未捕获异常。
- 快速翻页竞态 → 仅最新页渲染（断言旧响应被丢弃）。

### 关联
契约：各列表/详情端点 Zod。状态机：FE 渲染态。原语：—（FE 健壮性）。安全：服务端数据仍按 schema 校验。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-STATE-001-three | 正常/特殊 | component | loading/empty/data 三态切换 |
| TC-FE-STATE-001-error | 异常 | component | 失败 → error + 重试 |
| TC-FE-STATE-001-partial | 逃逸/复杂 | component | 部分失败 → degraded |
| TC-FE-STATE-001-malformed | 刁钻 | 单元(Zod) | 畸形 payload 不渲染脏数据 |
| TC-FE-STATE-001-race | 并发 | 单元 | 翻页竞态取最新 |

---

## UC-FE-REPORT-001 · 报告生成中 / 失败 / 超时（report subgraph 出口）

> **评审致命缺口补全**：report 为 subgraph/后台 job，`report_ready` **可能永不到达**（子图失败/超时）。报告页必须独立轮询其 `AssessmentReport` 状态，给 `generating/failed/timeout` 显式态 + 重试 + 逃逸。

- **角色**：求职者
- **前置**：`Interview=completed`，已入队 `AssessmentReport`。
- **触发**：进入 `/interview/[resultId]/report`。

### 主流程 Main（正常）
1. RSC 首屏：若 `AssessmentReport=completed` 直接 SSR 渲染。
2. 未就绪 → 降级 client 订阅 `report_generating/report_ready` 或**独立轮询 `GET /interview/:id/report` 状态**（不复用面试 SSE，避免子图失败时永久 loading）。
3. `completed` → 渐进揭示报告（能力曲线/成长档案）。

### 七类覆盖
- **正常**：generating → completed 渲染。
- **异常**：`AssessmentReport=failed`（schema/业务校验失败）→ report_failed 态 + "重试生成"（触发 failed→pending）。
- **特殊**：超长报告渐进揭示；空维度兜底；i18n。
- **逃逸**：**超时永不就绪**（评审核心）→ 轮询超阈值 → 显式 timeout 态 + "返回列表，后台继续生成，就绪后通知"，用户可脱困（不卡 loading）。
- **并发**：多次点"重试" → 重试携带幂等，仅一次入队；轮询并发去重。
- **复杂**：报告失败但面试事实已保全（子图舱壁）→ 报告失败不影响面试历史可见、不影响权益已 confirm。
- **刁钻**：服务端误推 `report_ready` 但拉取报告为空/畸形 → 不信单事件，以 `GET report` 权威状态为准，校验失败回 report_failed。

### 后置
渲染随 `AssessmentReport` 状态；FE 态 report_polling/report_failed。重试写：服务端 `AssessmentReport: failed→pending`。

### 验收
- 注入 `generating` 持续超阈值 → 出现 timeout 逃逸出口（断言非永久 spinner）。
- 注入 `failed` → 渲染失败态 + 重试按钮；点重试调重试端点。
- 注入 `report_ready` 但 GET 报告为空 → 回退 report_failed，不渲染空报告。

### 关联
契约：`GET /interview/:id/report`、`report_generating/report_ready`、重试端点。状态机：**AssessmentReport(pending/generating/completed/failed)**。原语：事件日志 + 幂等(重试)。安全：报告为模型产出，schema+业务校验在服务端（FE 不自评）。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-REPORT-001-ready | 正常 | 集成 | completed → 渲染报告 |
| TC-FE-REPORT-001-failed | 异常 | component | failed → 失败态 + 重试 |
| TC-FE-REPORT-001-timeout | 逃逸/特殊 | component | 超时 → timeout 出口、非永久 loading |
| TC-FE-REPORT-001-retrydup | 并发 | 单元 | 多次重试携同幂等键 |
| TC-FE-REPORT-001-emptyguard | 刁钻 | 集成 | 误 ready+空报告 → 回 report_failed |

---

## UC-FE-REFUND-001 · 面试中途失败 → 权益退还呈现（failure-refund，repo 纪律强制）

> **评审违纪点补全**：CLAUDE.md/test-strategy 明确把"跳过 failure-refund"列为禁止的假验收。本 UC 专责呈现"已退 N 次额度"的对账态。

- **角色**：求职者
- **前置**：面试因不可恢复错误 `Interview→failed`，服务端已 `ConsumptionRecord→released`（退还）。
- **触发**：面试运行中收到 `error`(不可恢复) / 进入已 failed 的会话。

### 主流程 Main（正常）
1. 收到失败终态事件 → 渲染"本场面试未完成，已退还 N 次权益"。
2. 提供"返回列表 / 重新开始"出口（重开走 FE-START-001 重新 reserve）。
3. 余额/消费记录页与订单中心呈现一致的 released 记录（对账）。

### 七类覆盖
- **正常**：失败即呈现退还。
- **异常**：退还呈现与服务端账本不一致（FE 缓存陈旧）→ 失效缓存重拉，以服务端 `ConsumptionRecord/entitlements` 为准。
- **特殊**：恰好退还后额度从 0→1；i18n 退还文案。
- **逃逸**：失败事件丢失（断线）→ 进入会话时凭 checkpoint 收敛到 failed + released，不残留"进行中"假象。
- **并发**：失败与用户正提交并发 → 服务端状态机 CAS：failed 终态优先，提交被拒并呈现失败退还。
- **复杂**：失败 → released 是 reserve→release saga 出口；与订单/对账跨聚合一致呈现。
- **刁钻**：用户刷新企图"复活"失败会话继续作答 → FE 态 failed 终态不可回 waiting_user（非法迁移断言），输入禁用。

### 后置
渲染 Interview=failed + ConsumptionRecord=released；FE 态收敛失败终态。FE 不写账本，仅呈现服务端账本。

### 验收
- 注入失败事件 → DOM 出现"已退还 N 次"且 N 与服务端 released 计数一致（注入 fixture 对账断言）。
- 失败终态 → 输入区禁用、不可提交（非法迁移=0）。
- 缓存陈旧 → 失效后呈现与服务端一致。

### 关联
契约：`GET /entitlements`、`GET /interview/:id`、消费记录端点。状态机：Interview(failed)、ConsumptionRecord(released)。原语：CAS(状态) + RLS。安全：—。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-REFUND-001-show | 正常/特殊 | component | 失败 → "已退 N 次" 与 fixture 一致 |
| TC-FE-REFUND-001-reconcile | 异常/复杂 | 集成 | 退还呈现与服务端账本对账一致 |
| TC-FE-REFUND-001-noresurrect | 刁钻 | component | failed 终态不可继续作答 |
| TC-FE-REFUND-001-lost | 逃逸 | 集成 | 失败事件丢失→进入收敛 failed |

---

## UC-FE-PAY-001 · 充值支付前端

> **评审修正**：①建单去重=**幂等键(`orderRef`)** 不是 CAS；CAS 只在 `PaymentOrder` 状态迁移(pending→paid 防回退)。②spoof 验收必须接**真实/契约真相端点**，mock `getOrder` 实测的是"FE 忽略回跳 URL 参数"，二者分开测。

- **角色**：求职者
- **前置**：已登录，在 `/profile` 充值。
- **触发**：选套餐 → 发起支付 → 回跳。

### 主流程 Main（正常）
1. 发起 `POST /orders` 携带客户端 `orderRef`(幂等键) 建单。
2. 跳第三方支付 → 回跳带 URL 参数。
3. **FE 忽略回跳 URL 中的成功标记**，以 `GET /orders/:id` 服务端真相态为准渲染结果，轮询至 paid/fulfilled。

### 七类覆盖
- **正常**：建单→支付→服务端 paid→fulfilled→额度到账。
- **异常**：支付失败/取消 → 渲染失败，订单 created/expired；不发放额度。
- **特殊**：回跳参数缺失/乱序；恰好 TTL 边界过期(created→expired)；i18n 金额/币种格式。
- **逃逸**：回跳页不可达 → "去订单中心查状态"出口；不以前端臆断结果。
- **并发**：双击建单 → 同 `orderRef` 幂等，仅一单。
- **复杂**：支付异步通知与前端轮询竞态 → 以服务端状态机为准（paid 由通知幂等键 + 金额复核驱动）。
- **刁钻**：用户篡改回跳 URL 为 `?status=success` → FE 不据此发放/渲染成功，**以 `GET /orders/:id` 后端真相为准**；篡改金额无效（服务端复核）。

### 后置
渲染随 `PaymentOrder` 状态；FE 不写账本。

### 验收
- 双击建单 → 一请求、相同 `orderRef`（请求构造器单测）。
- 篡改回跳 `?status=success` 但服务端 `GET order=created` → 渲染未成功（**接契约真相端点的集成**，非 mock）。
- 仅"忽略 URL 参数"行为 → 单测（不读 URL status 决定渲染）。

### 关联
契约：`POST /orders`、`GET /orders/:id`。状态机：PaymentOrder。原语：**幂等键(建单) + CAS(状态迁移)**。安全：回跳参数不可信，后端真相唯一。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-PAY-001-create | 正常/并发 | 单元(请求构造) | 双击同 orderRef 一单 |
| TC-FE-PAY-001-ignoreurl | 刁钻 | **单元** | 不据 URL status 渲染成功 |
| TC-FE-PAY-001-spoof | 刁钻 | **集成(真相端点)**(评审修正) | URL=success 但服务端 created → 不成功 |
| TC-FE-PAY-001-expire | 特殊/异常 | component | TTL 过期 → expired 呈现 |
| TC-FE-PAY-001-escape | 逃逸 | component | 回跳不可达 → 订单中心出口 |

---

## UC-FE-UPLOAD-001 · 简历上传刁钻防护

> **评审修正**："恶意宏"FE 无机制承接（宏扫描是服务端 AV）。替换为 FE 真正能承接的刁钻：**SVG/HTML 伪装内联 `<script>`、文件名路径穿越(`../`)、双扩展名**。

- **角色**：求职者
- **前置**：已登录，上传简历至 S3/MinIO（前端取直传凭证或经代理）。
- **触发**：选择/拖拽文件上传。

### 主流程 Main（正常）
1. 客户端校验类型白名单(pdf/docx)、大小上限、扩展名与 MIME 一致。
2. 文件名前端规范化（剥离路径、限制字符），不信任原始 filename。
3. 上传 → 取得 `resumeVersionId`，进入摄取/清洗（服务端）。

### 七类覆盖
- **正常**：合法 pdf 上传成功。
- **异常**：上传中断/失败 → 可重试，进度可见，不残留半态。
- **特殊**：空文件/0 字节、超大文件、超长中文名、i18n。
- **逃逸**：直传失败 → 回退代理上传通道（fallback），仍可完成。
- **并发**：同文件双击上传 → 幂等(内容哈希/版本键)去重或明确"已上传"。
- **复杂**：大文件分片 + 断点续传，部分分片失败重传。
- **刁钻**：
  - **SVG/HTML 伪装简历内联 `<script>`** → 上传后预览**绝不**以 HTML 渲染该内容，预览经 sanitize / 仅当数据展示；前端不执行其内容。
  - **文件名路径穿越** `../../etc` → 前端剥离路径段，仅取 basename。
  - **双扩展名** `resume.pdf.html` → 按真实 MIME 校验拒绝，不被展示名欺骗。
  - 畸形文件头 → 类型嗅探与白名单不匹配则拒。

### 后置
成功：`resumeVersionId` 建立（服务端）；FE 不写业务账本。失败/拒绝：不产生版本。

### 验收
- 上传 `a.svg`(含 `<script>`) → 预览 DOM 零脚本执行（不 innerHTML 渲染）。
- 文件名 `../../x.pdf` → 发送的 filename 已剥离路径段（断言 basename）。
- `x.pdf.html` 真实 MIME=text/html → 被拒（断言不进上传）。
- 0 字节/超大 → 拦截文案。

### 关联
契约：上传/直传凭证端点。状态机：—（resumeVersion 在服务端）。原语：幂等(内容哈希)。安全：文件名/内容不可信、AV/解析在服务端、FE 不执行不 innerHTML。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-UPLOAD-001-normal | 正常 | component | 合法 pdf 成功 |
| TC-FE-UPLOAD-001-svgscript | 刁钻 | component | SVG/HTML 内联脚本不执行 |
| TC-FE-UPLOAD-001-traversal | 刁钻 | 单元 | 文件名剥离 `../` |
| TC-FE-UPLOAD-001-doubleext | 刁钻 | 单元 | 双扩展名/MIME 不符拒绝 |
| TC-FE-UPLOAD-001-fallback | 逃逸 | 集成 | 直传失败回退代理 |
| TC-FE-UPLOAD-001-edge | 特殊 | component | 空/超大拦截 |

---

## UC-FE-CAREER-001 · 成长路径决策（保留用户最终决定权的交互）

> **评审修正**："保留不确定性措辞""保留最终决定权"是**模型输出语义**，FE 无法测，落 ai-eval 黄金集。FE 能测的是**交互形态**：决策由用户显式确认、无默认替用户选定、含不确定性徽标位。

- **角色**：求职者
- **前置**：career-path 图产出多条路径建议与风险提示。
- **触发**：用户查看路径推荐并做选择。

### 主流程 Main（正常）
1. 渲染候选路径（并列、无预选默认项），每条带风险/差距标注。
2. 用户**显式选择**一条作为关注路径（需主动点击确认，非自动落定）。
3. 选择写入成长档案（服务端），可随时更改。

### 七类覆盖
- **正常**：用户主动选定一路径。
- **异常**：保存失败 → 不丢用户选择（本地暂存）+ 重试。
- **特殊**：仅 1 条/0 条路径；i18n。
- **逃逸**：图失败 → 呈现已得部分 + "稍后重算"，不强迫用户在无数据下决策。
- **并发**：多标签同时改选 → 服务端 CAS 最后写赢 + 审计；FE 收敛一致。
- **复杂**：路径与学习计划联动，改选触发计划重算（异步），过渡态可见。
- **刁钻**：UI 不得用预选/默认高亮**诱导**用户接受某路径（暗模式）→ 断言无默认 `checked`、无自动提交；不确定性徽标(如"建议，非定论")DOM 存在。

### 后置
用户选择写服务端成长档案；FE 态正常；本地仅暂存草稿。

### 验收
- 渲染候选 → 无任一项默认选中（断言无预选）。
- 不点击确认 → 不产生保存请求（无自动落定）。
- 每条建议旁存在"建议/未定论"徽标元素（存在性断言，非语义判断）。
- 保存失败 → 本地保留选择 + 重试。

### 关联
契约：`GET /career/paths`、`POST /career/selection`。状态机：成长档案(服务端)。原语：CAS(改选) + RLS。安全：career-advice 保留用户决定（**语义达标归 ai-eval**，FE 只测交互形态）。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-CAREER-001-nodefault | 刁钻/正常 | component | 无预选、无自动提交 |
| TC-FE-CAREER-001-confirm | 正常 | component | 显式确认才发保存 |
| TC-FE-CAREER-001-badge | 特殊 | component | 不确定性徽标存在 |
| TC-FE-CAREER-001-savefail | 异常 | component | 保存失败保留选择 |
| TC-FE-CAREER-001-semantics | （越层迁出） | **ai-eval(golden)** | 措辞保留不确定性/决定权 |

---

## UC-FE-RESEARCH-001 · 自主研究 agent 前端（kill / 残值 / 未验证徽标）

> **评审修正**：①"逃逸"必须是真正业务出口（kill 后残值可落库/可结算/可重开），非仅"显示部分结果"。②"保留不确定性措辞"层错 → ai-eval；FE 只测"未验证徽标存在"。

- **角色**：求职者
- **前置**：发起一次自主研究任务（多步 agent）。
- **触发**：启动 / 观察 / kill 研究任务。

### 主流程 Main（正常）
1. 渲染研究进度（步骤/来源），消费业务事件(`progress` 等)。
2. 每条产出标注"已验证/未验证"徽标（依服务端校验标志）。
3. 完成 → 渲染带引用的结论。

### 七类覆盖
- **正常**：完整研究完成。
- **异常**：某步失败 → 该步降级，整体可继续/可终止。
- **特殊**：零来源/极少来源；超长；i18n。
- **逃逸（真业务出口）**：用户 **kill** 或预算耗尽 → 触发服务端安全终止，**已得残值落库为可见草稿**（AiGraphRun→safe_terminating→safely_terminated），FE 呈现"已停止，部分结果已保存"，可**重开/续算**，不是仅显示就丢。
- **并发**：多研究任务并发 → 受 SSE 6 连接上限约束（配合 FE-MULTITAB-001 共享/排队），双击 kill 幂等。
- **复杂**：多步 saga 部分失败 → 呈现部分成功/部分失败的分步态。
- **刁钻**：研究产出含注入/不可信外链 → sanitize + 链接白名单；未经服务端 verify 的产出强制"未验证"徽标，不得呈现为定论。

### 后置
kill：AiGraphRun=safely_terminated + 残值持久化（服务端）；FE 呈现可重开。FE 不写账本。

### 验收
- 点 kill → 调安全终止端点；随后 DOM 呈现"部分结果已保存" + 重开入口（断言出口存在）。
- 注入未验证产出 → "未验证"徽标 DOM 存在（存在性，非语义）。
- 产出含外链注入 → sanitize、白名单过滤。
- 双击 kill → 幂等一次。

### 关联
契约：研究任务事件 + kill 端点。状态机：AiGraphRun(safe_terminating/safely_terminated)。原语：幂等(kill) + 事件日志 + 安全终止。安全：产出不可信(sanitize/白名单)；不确定性措辞达标归 ai-eval。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-RESEARCH-001-normal | 正常 | component | 进度+引用渲染 |
| TC-FE-RESEARCH-001-kill | 逃逸 | 集成 | kill→残值保存+重开出口 |
| TC-FE-RESEARCH-001-badge | 刁钻/特殊 | component | 未验证徽标存在 |
| TC-FE-RESEARCH-001-sanitize | 刁钻 | component | 外链白名单/sanitize |
| TC-FE-RESEARCH-001-killdup | 并发 | 单元 | 双击 kill 幂等 |
| TC-FE-RESEARCH-001-uncertainty | （越层迁出） | **ai-eval** | 措辞保留不确定性 |

---

## UC-FE-SAFE-001 · 安全护栏前端呈现（越界/越狱/辱骂/危机自伤/造假）

> **评审修正**："文案随 locale 切换且语义不变""保留最终决定权措辞"不可机检 → **语义类迁 ai-eval/人审**；FE 验收改为可机检：危机态隐藏打分/继续元素、护栏文案键随 locale 存在、危机资源链可见。

- **角色**：求职者 / 系统(安全事件)
- **前置**：运行中可能触发安全事件（注入/越狱/辱骂/危机自伤/诱导造假）。
- **触发**：服务端推安全事件（如 `crisis_safe_stop` / 拒答 / 降级）。

### 主流程 Main（正常）
1. 收到安全事件 → 按类别渲染对应 UI（拒答提示 / 危机关怀资源 / 造假拒绝说明）。
2. 危机自伤态 → **隐藏打分/竞争性/继续作答元素**，仅呈现关怀与资源链接，态 `crisis_safe_stop`(终)。

### 七类覆盖
- **正常**：常规拒答/降级呈现。
- **异常**：安全事件与正常事件竞态 → 安全终态优先收敛（不可被后续业务事件复活）。
- **特殊**：locale 切换护栏文案键存在（zh/en），无缺键。
- **逃逸**：危机态即逃逸出口本身——安全终止 + 人工接管/资源引导；不可回 streaming/waiting_user。
- **并发**：多标签同时收到危机事件 → 全部收敛 crisis_safe_stop，写令牌标签广播一致。
- **复杂**：会话中后段触发 → 已有作答事实保全，但前端继续路径关闭。
- **刁钻**：用户**注入/越狱**企图绕护栏（"忽略前面指令…"）→ 用户文本进数据块、永不拼进系统指令（服务端保证）；FE 不据用户文本切换护栏态，只据服务端安全事件；危机态不被本地操作解除。

### 后置
危机：FE 态 crisis_safe_stop(终)；服务端 AiGraphRun 安全终止。FE 不写账本。

### 验收（可机检）
- 注入危机事件 → 打分/继续元素从 DOM 移除（存在性=0）+ 关怀资源链可见。
- locale=en → 护栏文案键存在、无回退缺键（键存在断言，**非语义比较**）。
- 危机终态 → 本地任何操作不能回到可作答态（非法迁移=0）。

### 关联
契约：安全事件类型。状态机：FE 渲染态(crisis_safe_stop)、AiGraphRun(safe_terminating)。原语：状态机迁移 + 事件日志。安全：`structured-output-and-safety`（用户内容为不可信数据块）；**语义达标(措辞/不变)归 ai-eval 黄金集**。

### 测试用例（评审修正层：注入 fixture 的 component/UI-state，非 e2e）
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-SAFE-001-crisis | 逃逸/异常 | **component**(评审修正) | 危机态隐藏打分/继续 + 资源链 |
| TC-FE-SAFE-001-noresurrect | 刁钻 | component | 危机终态不可本地复活 |
| TC-FE-SAFE-001-i18nkey | 特殊 | component | locale 文案键存在无缺键 |
| TC-FE-SAFE-001-semantics | （越层迁出） | **ai-eval** | 跨 locale 语义一致/保留决定权 |

---

## UC-FE-A11Y-001 · 无障碍 WCAG AA

> **评审修正**："对比度全量达标"无界、axe 测不到动态注入/canvas。收口为**可闭合口径**：静态元素 axe 零 violation；SSE 动态注入元素在注入后再跑 axe；canvas/图表对比度走**人工/快照 + 设计令牌对比度单测**，不交给 axe。

- **角色**：所有用户（含辅助技术用户）
- **前置**：任意页面。
- **触发**：键盘/读屏/对比度/动效偏好交互。

### 七类覆盖
- **正常**：全键盘可达、焦点可见、aria 标注完整。
- **异常**：错误态有 `role=alert`/aria-live 播报。
- **特殊**：`prefers-reduced-motion` 关动效；放大 200% 不破版；i18n RTL 兼容预留。
- **逃逸**：JS 失败/降级态仍保留语义结构与可读内容。
- **并发**：SSE 动态注入内容 aria-live 增量播报不淹没（礼貌级）。
- **复杂**：模态/抽屉焦点陷阱与还原；长列表虚拟化仍可读屏导航。
- **刁钻**：动态注入元素**注入后**再测对比度/aria（评审点名 axe 静态盲区）；canvas 图表提供文本替代/data table 兜底。

### 后置
无业务写。

### 验收（可闭合）
- 静态页 axe-core 0 violation（CI 门）。
- SSE 注入固定事件后再跑 axe → 注入区 0 violation。
- 设计令牌色对（前景/背景）对比度单测 ≥ 4.5:1(正文)/3:1(大字)。
- 全键盘走通关键路径（Playwright tab 序列）。
- canvas 图表存在文本替代节点（存在性）。

### 关联
契约：—。状态机：—。原语：—。安全：—。

### 测试用例
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-A11Y-001-static | 正常 | component(axe) | 静态 0 violation |
| TC-FE-A11Y-001-injected | 刁钻 | component(axe after inject) | 注入区 0 violation |
| TC-FE-A11Y-001-contrast | 特殊 | 单元(token) | 对比度阈值达标 |
| TC-FE-A11Y-001-keyboard | 复杂 | e2e(Playwright) | 全键盘走通 |
| TC-FE-A11Y-001-canvasalt | 刁钻 | component | 图表文本替代存在 |

---

## UC-FE-PERF-001 · 前端性能预算（填具体阈值，CI 可判红）

> **评审修正**：阈值不得占位。下列为**具体数字**，bundle-size 走**构建期 CI 门**（非单元），Web Vitals 走 Lighthouse CI assertions（p75，mid-tier 4G profile）。

- **角色**：所有用户
- **前置**：构建产物 + 关键路径页面。
- **触发**：CI 构建 / 页面加载测量。

### 具体预算阈值
| 指标 | 阈值 | 门类型 |
|---|---|---|
| 运行页(`interview/[resultId]`)首屏关键 JS(gzip) | ≤ 180 KB | CI 构建门(bundle-size) |
| 营销页关键 JS(gzip) | ≤ 120 KB | CI 构建门 |
| LCP (p75) | ≤ 2.5 s | Lighthouse CI |
| INP (p75) | ≤ 200 ms | Lighthouse CI |
| CLS | ≤ 0.1 | Lighthouse CI |
| TTFB (RSC, p75) | ≤ 0.8 s | Lighthouse CI |
| `waiting_user` 后首事件渲染 | ≤ 1.0 s | 性能集成 |
| 长列表虚拟化触发 | > 50 项 | 单元/快照 |

### 七类覆盖
- **正常**：达标构建通过。
- **异常**：超预算 → CI 判红阻断合并（断言门生效）。
- **特殊**：慢网/低端机 profile；首次无缓存冷启。
- **逃逸**：第三方脚本超预算 → 动态 import / 延迟加载降级，不阻塞首屏。
- **并发**：多 SSE/多任务下交互延迟仍 INP≤200ms。
- **复杂**：代码分割 + RSC 流式，路由级懒加载预算分摊。
- **刁钻**：依赖意外引入大包(barrel import) → bundle 门捕获回归（体积快照对比）。

### 后置
无业务写；CI gate 结果。

### 验收
- bundle 超 180KB → CI 失败（构建门，断言可判红）。
- Lighthouse LCP>2.5s/INP>200ms/CLS>0.1 → 任一超标 CI 失败。

### 关联
契约：—。状态机：—。原语：—。安全：—。

### 测试用例（评审修正层：bundle 是 CI 构建门，非单元）
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-PERF-001-bundle | 异常/刁钻 | **CI 构建门(size-limit)**(评审修正) | 关键 JS ≤ 阈值，回归判红 |
| TC-FE-PERF-001-vitals | 正常/特殊 | Lighthouse CI(e2e) | LCP/INP/CLS/TTFB 达标 |
| TC-FE-PERF-001-firstevent | 复杂 | 性能集成 | 首事件渲染 ≤1s |
| TC-FE-PERF-001-lazy | 逃逸 | 单元 | 重组件动态 import 不入首屏 |

---

## UC-FE-B2B-001 · B 端隔离与 PII 零命中

> **评审修正**：①"不可还原 PII"是不可证伪命题 → 改可测口径：**任一网络响应体/DOM/localStorage 中原始手机号、身份证正则零命中**。②RLS 行级隔离**契约 schema 测不出**(schema 不编码行属主) → 只能靠**带真实 principal 的集成**。

- **角色**：企业 HR（B 端，与 C 端隔离）
- **前置**：HR 登录企业侧，访问题库/候选人/人才库。
- **触发**：浏览/匹配/导出等 B 端操作。

### 七类覆盖
- **正常**：仅见本企业(本 principal)数据。
- **异常**：越权访问他企业资源 → 服务端 RLS=0 行 → 404，FE 不泄露存在性。
- **特殊**：脱敏字段渲染（手机号/身份证泛化为掩码）；i18n。
- **逃逸**：导出/匹配服务降级 → 不回退到明文 PII；降级也保持脱敏。
- **并发**：多 HR 并发操作同资源 → 服务端 CAS/lease；FE 收敛一致。
- **复杂**：候选人批量匹配排名跨多资源 → 全程脱敏投影。
- **刁钻**：脱敏字段被前端拼接企图还原 PII → 验收改为**正则零命中**断言（响应体/DOM/storage 中原始手机号 `1[3-9]\d{9}`、身份证 18 位正则命中数=0）。

### 后置
无 FE 账本；服务端 RLS/审计为准。

### 验收（可机检）
- 越权访问 → 404 且 DOM 无目标数据（带 userB principal 的集成）。
- 任一网络响应体/DOM/localStorage 扫描：原始手机号正则命中=0、身份证正则命中=0。
- 脱敏字段渲染为掩码（如 `138****1234`）。

### 关联
契约：B 端端点（注意：契约 schema **不编码行属主**，隔离不可由契约测出）。状态机：—。原语：**RLS principal 绑定**（集成层验证）。安全：B/C 隔离、PII 泛化、不可信拼接。

### 测试用例（评审修正层：RLS 走带真实 principal 的集成，非契约）
| TC | 类 | 层 | 断言 |
|---|---|---|---|
| TC-FE-B2B-001-isolation | 异常/刁钻 | **集成(真实 principal)**(评审修正，非契约) | userB 越权→404、0 行 |
| TC-FE-B2B-001-piizero | 刁钻 | 集成 + DOM 扫描 | 手机号/身份证正则零命中 |
| TC-FE-B2B-001-mask | 特殊 | component | 脱敏字段掩码渲染 |
| TC-FE-B2B-001-degrade | 逃逸 | 集成 | 降级仍脱敏，不回退明文 |

---

## 附录 A · 七类覆盖矩阵（实查，非打勾位）

| UC | 正常 | 异常 | 特殊 | 逃逸 | 并发 | 复杂 | 刁钻 |
|---|---|---|---|---|---|---|---|
| FE-START-001 | ✓ | ✓回滚 | ✓首次/i18n | ✓首问超时离场 | ✓双击/多页签 | ✓reserve-create saga | ✓绕校验 |
| FE-ENTITLE-001 | ✓ | ✓预判失败 | ✓首次额度 | ✓充值不可用出口 | ✓抢最后额度 | ✓跨页续接 | ✓伪造本地额度 |
| FE-QUIZ-001 | ✓ | ✓题级降级 | ✓空题集 | ✓后台续算 | ✓同题双击 | ✓虚拟列表 | ✓诱导刷分 |
| FE-STREAM-001 | ✓ | ✓流中断 | ✓CJK围栏 | ✓kill-switch整段 | ✓重复seq | ✓跨重连拼接 | ✓截断/XSS |
| FE-SSE-001 | ✓ | ✓error降级 | ✓乱序 | ✓重连出口/安全终止 | ✓重复事件 | ✓跨重连收敛 | ✓seq倒退/超大 |
| FE-BGTAB-001 | ✓ | ✓真断线 | ✓后台挂起 | ✓过期 | ✓多标签前台 | ✓长后台收敛 | ✓时钟漂移误判 |
| FE-MULTITAB-001 | ✓ | ✓leader崩溃 | ✓隐身窗 | ✓无BC退化 | ✓双写同键 | ✓6连接上限 | ✓脑裂 |
| FE-NET-001 | ✓ | ✓预算耗尽 | ✓首次丢失 | ✓刷新收敛 | ✓迟到+重发 | ✓评估路径丢失 | ✓key漂移 |
| FE-NET-002 | ✓ | ✓TTL过期 | ✓停3天 | ✓损坏安全终止 | ✓双设备lease | ✓迁移中 | ✓本地stale |
| FE-EXIT-001 | ✓ | ✓放弃退还 | ✓空草稿 | ✓beforeunload不可靠 | ✓双标签放弃 | ✓released saga | ✓复活竞态 |
| FE-REDPEN-001 | ✓ | ✓越界降级 | ✓reduced-motion | ✓动效失败静态 | ✓重复seq | ✓多维叠加 | ✓批注注入 |
| FE-STATE-001 | ✓ | ✓拉取失败 | ✓空/CLS | ✓部分降级 | ✓翻页竞态 | ✓列表+抽屉 | ✓畸形payload |
| FE-REPORT-001 | ✓ | ✓failed重试 | ✓空维度 | ✓超时出口 | ✓重试去重 | ✓子图舱壁 | ✓误ready空报告 |
| FE-REFUND-001 | ✓ | ✓缓存不一致 | ✓额度边界 | ✓事件丢失收敛 | ✓失败vs提交 | ✓release saga/对账 | ✓复活作答 |
| FE-PAY-001 | ✓ | ✓支付失败 | ✓回跳缺参/过期 | ✓回跳不可达出口 | ✓双击建单 | ✓通知vs轮询 | ✓篡改回跳 |
| FE-UPLOAD-001 | ✓ | ✓中断重试 | ✓空/超大 | ✓直传回退代理 | ✓同文件双击 | ✓分片续传 | ✓SVG脚本/穿越/双扩展名 |
| FE-CAREER-001 | ✓ | ✓保存失败 | ✓单/零路径 | ✓图失败部分 | ✓多标签改选 | ✓计划联动 | ✓暗模式诱导 |
| FE-RESEARCH-001 | ✓ | ✓步失败 | ✓零来源 | ✓kill残值落库重开 | ✓多任务/双击kill | ✓多步部分失败 | ✓注入外链/未验证 |
| FE-SAFE-001 | ✓ | ✓安全vs业务竞态 | ✓locale键 | ✓危机安全终止 | ✓多标签危机 | ✓后段触发保全 | ✓越狱注入 |
| FE-A11Y-001 | ✓ | ✓alert播报 | ✓reduced-motion/200% | ✓降级保语义 | ✓aria-live增量 | ✓焦点陷阱/虚拟 | ✓动态注入/canvas |
| FE-PERF-001 | ✓ | ✓超预算判红 | ✓慢网冷启 | ✓三方延迟加载 | ✓多SSE下INP | ✓分割分摊 | ✓barrel大包 |
| FE-B2B-001 | ✓ | ✓越权404 | ✓掩码/i18n | ✓降级仍脱敏 | ✓多HR并发 | ✓批量匹配脱敏 | ✓拼接还原PII |

## 附录 B · 评审整改落点对照

- 逃逸通道升级为真业务出口：FE-REPORT-001(超时出口)、FE-REFUND-001(失败退还)、FE-RESEARCH-001(kill 残值落库可重开)、FE-SAFE-001(安全终止)。
- 真实并发拓扑补全：FE-MULTITAB-001(多页签 leader/6 连接上限)、FE-BGTAB-001(后台节流误判)。
- 业务生命周期两端补全：FE-START-001/FE-ENTITLE-001(创建/额度入口)、FE-REPORT-001/FE-REFUND-001(报告/退款出口)、FE-EXIT-001(主动离场)、FE-QUIZ-001/FE-CAREER-001(两条产品线主用例)。
- 机制落点修正：FE-NET-001(幂等键 FE 携带 vs 不双扣归服务端)、FE-PAY-001(建单=幂等键，迁移=CAS)、FE-START-001(幂等键+CAS 并存)、FE-UPLOAD-001(SVG/穿越/双扩展名替换"恶意宏")、FE-STREAM-001(绑定契约 message_delta + seq/replay)。
- 验收可测化：FE-PERF-001(具体阈值)、FE-A11Y-001(可闭合口径)、FE-B2B-001(PII 正则零命中)、FE-SAFE-001(危机隐藏元素存在性)。
- 越层迁出 ai-eval：FE-CAREER/FE-RESEARCH/FE-SAFE 的"措辞/语义/不确定性"类断言。
- 测试层映射修正：SSE 渲染→component fixture(非 graph)、幂等 key→单元(非集成)、a11y/危机→component(非 e2e)、RLS→集成(非契约)、bundle→CI 构建门(非单元)、spoof→接真相端点集成。
- 横切：统一 FE 渲染态机迁移表(§0，含合法/非法迁移与终态)。
