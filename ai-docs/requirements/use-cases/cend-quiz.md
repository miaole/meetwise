---
id: requirements_uc_cend_quiz
name: 用例 · 押题 resume-quiz·接地歪曲门·空召回
description: 押题 resume-quiz·接地歪曲门·空召回 业务用例与测试用例（正常/异常/特殊/逃逸/并发/复杂/刁钻七类，29 UC / 63 TC）。
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

# cend-quiz · resume-quiz 最终用例 + 测试用例文档

> **🔎 实现状态（对齐真实代码 · 2026-07）** — 本文是 TARGET 规格。**✅ 已实现+接线**：resume-quiz 押题生成 + 四门接地/歪曲门（无来源/照搬/跑题/重复 → rejected）+ 空召回降级 + reserve→confirm 计费，可跑。**🟠 校正**：接地素材来自**本地约 32 题种子库** + **联网 web-explore（默认开启，`main.ts` 6 个官方文档源作 CRAG fallback 外呼；env `WEB_ALLOWLIST` 设空串才关）**。真正未建的是**真实策展题库源表 + 审核门 + 扩召回 golden**（TODO；注意归属：CRAG/web-explore 接在 mock-interview 自适应图，本文 cend-quiz 的接地是简历 provenance span，另一口径）。故 `empty_recall` 更多由本地池覆盖不足触发。

> 领域：简历押题（押题生成 / 查看 / 重生成 / 接地与歪曲门 / 空召回 / 导出）。
> 本文是对抗评审后的收口版：补齐七类 case、每条异常/刁钻流落到「状态机迁移」或「四原语（CAS / 幂等键 / RLS principal 绑定 / 持久有序事件日志）」、验收可测、配齐测试用例。
> 对齐：`ai-docs/rules/global/status-machine.md`、`ai-docs/rules/global/production-invariants.md`、`ai-docs/architecture/ai/langgraph-blueprint.md`、`ai-docs/rules/ai/structured-output-and-safety.md`。

---

## 0. 领域承重设计（所有 UC 共用的落点）

### 0.1 聚合与状态机

**QuizSet（押题集聚合根，id = `quizSetId`，带 `version int` 做 CAS）**

枚举：`created · reserved · generating · validating · partial · completed · empty_recall · throttled · failed`

| from | to | 触发 | 守卫 | 失败动作 |
|---|---|---|---|---|
| —(insert) | created | 提交生成请求 | 幂等键 `(userId, resumeVersionId, roleSetHash)` UNIQUE | 重复键 → 返回首单（不新建） |
| created | reserved | 占用权益 | 额度 CAS 扣减成功 + `ConsumptionRecord.idempotency_key` UNIQUE | 额度不足 → 拒绝（不进 generating） |
| reserved | created | **逆向补偿**：QuizSet 落库/启动失败 | 补偿 job exactly-once | 释放预留（见 UC-073） |
| reserved | generating | 抢到 thread lease 启图 | `AiGraphRun` lease CAS 成功 | lease 冲突 → 拒绝并发 |
| generating | validating | 模型出题 | schema 校验通过 | schema 连续失败超预算 → failed |
| validating | completed | 接地 + 歪曲门 + 业务校验全过，题量=target | 全题接地命中且无歪曲 | — |
| validating | partial | 接地后有效题 0<N<target | 至少 1 题有效 | — |
| validating | empty_recall | 接地后有效题 N=0（全被歪曲门拦/无召回） | — | 不计全额费（见 UC-075/081） |
| reserved·generating | throttled | 命中速率/配额阈值（限流中间件） | `N 次/时窗` 常量超限 | 降级只读，写审计（见 UC-079） |
| 任意非终态 | failed | 不可恢复错误 / 模型 failover 也耗尽 | — | 业务事实保全 + ConsumptionRecord released |

编排：`completed`→ConsumptionRecord reserved→confirmed（全额）；`partial`→按 UC-075 规则部分 confirm + 余额 release；`empty_recall`/`failed`/`throttled(未出题)`→released（全额退还）。

**QuizSetRole（多岗位子项，per-role 维度）**：`pending · grounded · empty_recall · failed`。多岗位押题的状态/计费/事件都按 role 维度展开（见 UC-077），QuizSet 顶层状态是子项的聚合：全成功=completed，部分成功=partial，全空=empty_recall。

**AiGraphRun（resume-quiz 图运行时，threadId = quizSetId）**：沿用全局枚举 `created·active·waiting_user·migrating·paused·quarantined·safe_terminating·safely_terminated·completed·failed`。

### 0.2 账本（写哪些）

| 账本 | 作用 | 关键约束 |
|---|---|---|
| `consumption_record` | 权益 reserve→confirm→release | `idempotency_key` UNIQUE；reserve/confirm/release 均 CAS |
| `quiz_set_event` | 持久**有序**事件日志（原语 4），单调 `seq` | SSE 只重放此账本；事件：`generation_started/questions_ready/grounding_validated/distortion_flagged/empty_recall/partial_recall/role_empty_recall/version_archived/throttled/model_failover/export_ready/safety_flagged` |
| `distortion_flags` | 歪曲门处置账本（缺失/夸大/坐标投毒） | 每条记 claim、被拒原因、span 命中结果；不入业务库 |
| `safety_flags` | 安全处置账本（自伤/辱骂/违法/越狱/诱导刷分/泄题） | 分类标签 + 确定性路由命中 + 处置动作 + 审计（见 UC-078） |
| `rate_limit_audit` | 限流/配额命中审计 | 计数器 + 触发阈值 + kill-switch 状态 |
| `ai_invocation_traces` | trace/成本/幂等（脱敏） | 写失败不阻塞主链路（见 UC-083） |
| `ai_prompt_versions` | prompt/schema 版本 pin | — |

### 0.3 契约（共享 zod4 schema，前后端共享，中英 i18n）

- `POST /quiz/generate`（header `idempotency-key`；body `{resumeVersionId, roleProfileIds[], locale}`）
- `POST /quiz/:quizSetId/regenerate`（header `idempotency-key`）
- `POST /quiz/:quizSetId/questions/:questionId/regenerate`（单题重算）
- `GET /quiz/:quizSetId`（读，RLS）
- `GET /quiz/:quizSetId/events`（SSE，`Last-Event-ID` 重放）
- `POST /quiz/:quizSetId/export`（PDF，水印 + PII 脱敏）

每个**写入口**（generate / regenerate / single-regenerate / export）都必须在 principal 上下文执行，RLS fail-closed，越权返回 404（不泄露存在性）。

### 0.4 接地与歪曲门（resume-quiz 护城河）

- 每题（question）与每条对候选人的断言必须接地到 `ResumeVersion` 的 provenance span（页/坐标/原文）。
- **接地校验 = 坐标存在性 + span 文本语义蕴含 claim（text-match / 蕴含判定）**——非空坐标不充分（堵坐标投毒，见 UC-074）。
- `resumeVersionId` 在生成时 **pin**，查看/导出时校验版本一致，简历漂移则 span 标失效不错位（UC-076）。
- answerOutline（示范答案）允许超简历事实但必须显式标注「示范/非候选人事实」，与 question 走不同接地口径，不被歪曲门误杀也不冒充候选人经历（见 UC-030 备注 + openDecisions）。
- 歪曲是 **deterministic**：拦截 → 写 `distortion_flags` → 不入库 → 该题作废（不盲目重试模型）。

---

## 1. UC 索引

见结构化字段 `ucIndex`。下表逐条展开。每条 UC 顶部标注命中的七类。

---

## UC-quiz-001 · 首次押题生成（单岗位主流程）
**七类：正常 · 特殊(首次/i18n) · 异常 · 复杂**

- 角色：求职者（C 端）
- 前置：已上传并解析的 `ResumeVersion`；已选 `RoleProfile`；持有 quiz 权益；持 `idempotency-key`。
- 触发：`POST /quiz/generate`。

主流程 Main
1. 鉴权解析 principal，进入 RLS 上下文。
2. 幂等键 `(userId, resumeVersionId, roleSetHash)` `INSERT … ON CONFLICT DO NOTHING`；冲突 → 返回首单（QuizSet `created`）。
3. 额度 CAS 扣减 → `ConsumptionRecord` reserved；QuizSet `created→reserved`。
4. 抢 thread lease 启 resume-quiz 图；QuizSet `reserved→generating`，写 `generation_started`(seq=1)。
5. `load_context→parse_resume→analyze_role→build_match_profile→generate_questions`：ai-runtime invoke 出题，coerce→schema 校验。
6. `validate_questions`：接地 + 歪曲门 + 业务校验（题量、字段、置信度 range、枚举）；写 `questions_ready`、`grounding_validated`。
7. 全题有效 → QuizSet `validating→completed`；ConsumptionRecord reserved→confirmed（全额）。

备选流 Alt
- A1 schema 校验失败但属 transient → 有界重试（图内 `valid? no → generate_questions`）。
- A2 首次生成（用户无历史）→ 正常路径，无旧版归档。

异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 重复请求/双击同 key | 幂等键 UNIQUE（原语2） | 恰一个 run、扣一次（详见 UC-080） |
| E2 | 额度不足 | 额度 CAS 返回 0 行（原语1） | 拒绝启动，不 reserve |
| E3 | schema 连续失败超预算 | 重试分类（确定性拒绝不重试） | QuizSet→failed，released 退还 |

后置：QuizSet∈{completed,failed}；写 `quiz_set_event`、`consumption_record`、`ai_invocation_traces`、`ai_prompt_versions`。

验收（可测）
- 同 key 两次 → 恰一个 QuizSet、一次 reserve、一次 confirm。
- 成功 → 题量=target、每题置信度∈[0,1]、每题有 grounding span。
- schema 超预算失败 → QuizSet=failed 且权益已 released（余额复原）。

关联：契约 `POST /quiz/generate`；状态机 QuizSet/ConsumptionRecord/AiGraphRun；原语 幂等键/CAS/事件日志；安全 简历为不可信输入。

测试用例
- TC-quiz-001-main〔集成〕：跑通生成，断言 QuizSet=completed、reserved→confirmed、题量=target、每题 span 非空。
- TC-quiz-001-A1〔graph-fake-model〕：注入一次 schema 非法→断言走 retry 分支、第二次通过、retry 计数=1。
- TC-quiz-001-E2〔集成〕：余额=0 发起 → 断言 0 行 reserve、QuizSet 不进 generating、返回额度不足。
- TC-quiz-001-E3〔graph-fake-model〕：模型持续返回非法 schema → 断言超预算后 failed + released（余额=初值）。
- TC-quiz-001-contract〔契约〕：响应体过 Zod，置信度 range、必填字段。

---

## UC-quiz-002 · 押题输出契约与置信度合理性
**七类：正常 · 特殊(边界) · 刁钻(畸形输出)**

- 角色：系统（契约+业务 validator）
- 触发：generate/regenerate 产出落库前。

主流程
1. 模型输出 coerce → Zod schema 校验（字段/类型/枚举）。
2. 业务 validator：题量∈[1,target]、置信度 `confidence`∈[0,1] 且非全 1（异常自信检测）、难度枚举合法、每题绑 `groundingSpans[]` 非空。
3. 通过 → 入库；任一失败 → 不入库 + 分类（schema=retry/降级；业务歪曲=deterministic 拒绝）。

异常/刁钻流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 置信度全=1 或越界 | 业务 validator（结构合法≠业务合法），不入库 |
| E2 | 题字段缺失/枚举非法 | schema 校验失败→retry/降级 |

验收
- `confidence`∉[0,1] → 拒绝入库。
- 全题 `confidence=1.0`（可疑）→ 触发合理性告警，标记复核。
- 缺 `groundingSpans` 的题 → 拒绝入库。

关联：契约输出 schema；安全 双校验（schema→业务）。

测试用例
- TC-quiz-002-range〔单元〕：置信度 1.2 / -0.1 → validator 拒绝。
- TC-quiz-002-allone〔单元〕：全 1.0 → 触发可疑标记。
- TC-quiz-002-contract〔契约〕：合法/非法样本过 Zod。
- TC-quiz-002-nospan〔单元〕：题无 span → 拒绝。

---

## UC-quiz-003 · 多岗位对比押题
**七类：正常 · 复杂(跨聚合/per-role) · 特殊**

- 角色：求职者
- 前置：选 N 个 `RoleProfile`（N≥2）。
- 触发：`POST /quiz/generate` 带 `roleProfileIds[]`。

主流程
1. 幂等键含 `roleSetHash`（岗位集有序哈希），防同集双发。
2. 按 N 个 role 各建 `QuizSetRole` 子项（per-role 状态/计费/事件）。
3. 逐 role 出题 + 接地；写 `role_empty_recall`/`questions_ready`（带 roleId）。
4. 聚合：全成功→completed；部分→partial（见 UC-077）；全空→empty_recall。

异常流：见 UC-077（混合态）。

验收
- N 岗位各有独立 `QuizSetRole` 状态与 per-role 事件。
- 计费 = 成功岗位数 × 单价（per-role 计量，见 UC-075）。

关联：状态机 QuizSetRole；原语 幂等键(roleSetHash)/事件日志(roleId)。

测试用例
- TC-quiz-003-main〔集成〕：3 岗位全成功 → 3 个 grounded、扣 3 份。
- TC-quiz-003-mixed〔集成〕：见 TC-quiz-077。
- TC-quiz-003-idem〔集成〕：同 roleSetHash 双发 → 恰一个 QuizSet。

---

## UC-quiz-010 · 查看押题集（RLS 读路径）
**七类：正常 · 刁钻(越权读/PII边角) · 特殊(i18n)**

- 角色：求职者
- 触发：`GET /quiz/:quizSetId`。

主流程
1. principal 上下文 → RLS 过滤。
2. 返回题集 + grounding span 引用；校验 `resumeVersionId` 与当前简历版本一致（不一致 → 标 span 失效，见 UC-076）。

异常/刁钻流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 非属主读他人 quizSetId | RLS principal 绑定 fail-closed → 0 行 → 404 |
| E2 | 简历已变更 | provenance pin 校验 → 标失效不错位 |

验收
- userB 读 userA 的 quizSetId → 404（不泄露存在性）。
- 返回体不含原始简历 PII 明文（仅 span 坐标引用）。

关联：契约 `GET /quiz/:id`；原语 RLS；安全 PII 不外泄。

测试用例
- TC-quiz-010-rls〔集成〕：userB GET userA 资源 → 404，db 查询 0 行。
- TC-quiz-010-pii〔集成〕：响应体扫描 PII 字段清单（见 UC-060 清单）→ 0 命中。

---

## UC-quiz-020 · 重生成（归档旧版 + 双击去重）
**七类：正常 · 高并发(双击) · 复杂(版本) · 异常**

- 角色：求职者
- 触发：`POST /quiz/:quizSetId/regenerate` 带 `idempotency-key`。

主流程
1. RLS 校验属主（写入口必复测，见 UC-072）。
2. 幂等键去重；CAS 占新额度 reserved。
3. 旧版 CAS 归档（`version_archived` 事件）；新版 generating。
4. 完成 → confirmed；遵守版本上限/GC（见 UC-082）。

异常/高并发流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 双击重生成（同 key） | 幂等键 UNIQUE → 恰一个新版、扣一次 |
| E2 | 并发两请求不同 key | 状态 CAS（reserved 守卫）→ 仅一个推进 |
| E3 | 越权重生成他人集 | RLS（见 UC-072）→ 404，0 行写 |

验收
- 双击同 key → 恰一个新版本、一次扣费、旧版恰一次归档。
- 并发不同 key → 恰一个赢，另一个读 0 行回查。

关联：契约 `regenerate`；状态机 QuizSet；原语 幂等键/CAS/RLS/事件日志。

测试用例
- TC-quiz-020-dblclick〔集成(并发)〕：同 key×2 → 1 个新版、1 次 confirm。
- TC-quiz-020-race〔集成(并发)〕：不同 key×2 → CAS 恰一胜，败者读 0 行。
- TC-quiz-020-archive〔单元〕：旧版状态=archived 恰一条 `version_archived`。

---

## UC-quiz-021 · 单题重算
**七类：正常 · 异常 · 刁钻(越权写)**

- 角色：求职者
- 触发：`POST /quiz/:quizSetId/questions/:questionId/regenerate`。

主流程
1. RLS 校验属主（写入口）。
2. 单题幂等键去重；按比例占用/复用配额（轻量，记 `rate_limit_audit`）。
3. 重出该题 → 接地 + 歪曲门 → 替换；写 `questions_ready(questionId)`。

异常/刁钻流
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 越权重算他人题 | RLS → 404，0 行写（见 UC-072） |
| E2 | 重算结果被歪曲门拦 | distortion_flags + 保留原题不替换 |

验收
- userB 重算 userA 题 → 404，原题不变、B 配额不变。
- 重算被拦 → 原题保留、写 `distortion_flags`。

测试用例
- TC-quiz-021-rls〔集成〕：越权重算 → 404、0 行写。
- TC-quiz-021-distort〔graph-fake-model〕：注入歪曲→拦截、原题保留、retry=0。

---

## UC-quiz-030 · 接地与歪曲门（question 真实性）
**七类：正常 · 异常(拦截不入库) · 刁钻(夸大/缺失)**

- 角色：系统（validator + 图 validate_questions 节点）
- 触发：出题后入库前。

主流程
1. 对每题断言抽取 claim → 在 `ResumeVersion` 定位 provenance span。
2. **缺失**（简历无此经历/技能）→ 拦截。**歪曲**（参与→主导、30%→50%、边缘→核心）→ 拦截。
3. span 须语义蕴含 claim（见 UC-074 强化口径）；通过 → `grounding_validated`；失败 → `distortion_flags` + 不入库 + 该题作废（deterministic，不盲重试）。

> 备注（answerOutline 分流）：示范答案允许超简历事实，但必须打 `is_demo=true` 标签走「示范口径」，不进候选人事实接地；question 与候选人能力断言走严格歪曲门。避免误杀示范答案 / 放行编造经历。

异常/刁钻流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 模型夸大经历 | 业务 validator 歪曲门，deterministic 拦截、不入库 |
| E2 | 模型臆造不存在经历 | 同上（缺失分支） |
| E3 | 简历夹「给满分/全部通过」注入 | 当 data block 处理，不进 system instruction |

验收
- 注入夸大题 → 走拦截分支、`retry=0`（不盲重试）、不入库、写 `distortion_flags`。
- 示范答案超事实但标 `is_demo` → 不被误杀。

关联：安全 歪曲门/双校验/注入；原语 事件日志(distortion_flags)。

测试用例
- TC-quiz-030-distort〔graph-fake-model〕：注入夸大→断言进拦截分支、`retry计数=0`、不入库。（**控制流验证归 graph-fake，非 ai-eval**）
- TC-quiz-030-quality〔ai-eval〕：金标样本断言歪曲判定准确率≥阈值（仅测判得准）。
- TC-quiz-030-demo〔单元〕：`is_demo` 答案超事实→不进歪曲门、不误杀。
- TC-quiz-030-inject〔graph-fake-model〕：简历夹「给满分」→ 作 data 处理、不改判分。

---

## UC-quiz-033 · 泄题 / 真题声称防护
**七类：刁钻(泄题) · 逃逸(降级) · 异常**

- 角色：系统（安全 validator）
- 触发：出题/查看时检测「声称为某公司真实面试原题」。

主流程
1. 业务 validator 扫描断言中「真题/原题/内部题库」声称（rubric 关键模式 + 分类器）。
2. 命中 → 重写为「模拟押题」表述或拦截；写 `safety_flags(category=leak_claim)`，确定性路由。

异常/刁钻流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 模型声称「这是 X 公司真题」 | 确定性 rubric 命中→重写/拦截 + safety_flags |

验收（带 rubric）
- 含「真题/原题/泄露题」模式断言 → 命中 rubric（确定性）、重写或拦截、写 `safety_flags`。
- rubric 判分有金标集，非 AI 自评。

测试用例
- TC-quiz-033-leak-route〔集成〕：注入真题声称→确定性 rubric 命中、写 safety_flags、路由到重写/拦截。
- TC-quiz-033-leak-quality〔ai-eval〕：金标集断言分类质量（rubric 之外的语义召回）。

---

## UC-quiz-040 · 空召回（低召回阈值降级）
**七类：异常 · 特殊(空) · 逃逸(降级)**

- 角色：求职者 / 系统
- 触发：简历与岗位相关性过低，接地后有效题命中率 < 阈值。

主流程
1. 接地后统计有效题命中率；< 阈值（边界见 UC-081）→ QuizSet `validating→empty_recall`。
2. 写 `empty_recall` 事件；权益按 UC-075 规则（empty=全额 release）。
3. 前端可解释提示「简历与该岗位匹配不足，建议补充经历/换岗位」（不伪造题）。

异常/逃逸流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 命中率 < 阈值 | 状态机→empty_recall + ConsumptionRecord released |
| E2 | 强行凑题诱导 | 拒绝凑题（不造假）→ 降级提示 |

验收
- 命中率 < 阈值 → empty_recall、全额退还、不产任何虚构题。

关联：状态机 QuizSet(empty_recall)；原语 CAS(release)。

测试用例
- TC-quiz-040-empty〔集成〕：低相关简历→empty_recall、released、题数=0。
- TC-quiz-040-noforce〔graph-fake-model〕：断言不触发「凑题」分支。

---

## UC-quiz-042 · 部分召回
**七类：异常 · 特殊(边界) · 复杂(部分价值计费)**

- 角色：求职者
- 触发：接地后有效题 0<N<target。

主流程
1. QuizSet `validating→partial`，写 `partial_recall(N, target)`。
2. 计费按 UC-075 确定性规则（全额 or 按比例），余额 release。
3. 前端展示 N 题 + 缺口说明。

验收：见 UC-075（计费口径），断言 confirm 金额=规则值。

测试用例：见 TC-quiz-075-*。

---

## UC-quiz-051 · reserve→confirm saga（confirm 崩溃）
**七类：复杂(saga) · 异常(部分失败) · 逃逸(补偿重放)**

- 角色：系统
- 触发：生成 completed 后 confirm 阶段进程崩。

主流程
1. completed 后 reserved→confirmed（CAS + 幂等键）。
2. confirm 前崩 → 补偿 job 重放：按幂等键 exactly-once confirm（不重复确认）。

异常流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | confirm 崩溃 | 补偿 job exactly-once 重放 confirm（幂等键去重 + CAS） |

> 逆向半边（reserve 后 QuizSet 创建失败的孤儿预留）见 UC-073。

验收
- confirm 崩后重放 → 恰一次 confirmed，无重复扣费。

测试用例
- TC-quiz-051-confirmcrash〔集成·故障注入·补偿重放层〕：在 confirm 前注入 crash→重放→断言 exactly-once confirmed（重放 2 次副作用仍 1 次）。

---

## UC-quiz-060 · 导出（RLS + 水印 + PII 脱敏）
**七类：正常 · 刁钻(越权导出/PII边角) · 异常**

- 角色：求职者
- 触发：`POST /quiz/:quizSetId/export`。

主流程
1. RLS 校验属主（写/消耗入口，见 UC-072）。
2. 生成 PDF：加用户水印；脱敏 PII 字段。
3. 写 `export_ready` 事件 + trace。

PII 字段清单（脱敏断言基线）：身份证号、手机号、邮箱、家庭住址、银行卡号、社保号。导出件中以上全部掩码。

异常/刁钻流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 越权导出他人集 | RLS → 404，0 行写（UC-072） |
| E2 | PDF 渲染失败/超大 | 见 UC-084 |

验收
- userB 导出 userA 集 → 404。
- 导出件含水印；上述 PII 清单字段全部掩码（逐字段断言）。

测试用例
- TC-quiz-060-rls〔集成〕：越权导出→404、0 行写。
- TC-quiz-060-pii〔集成〕：导出件按 PII 清单逐字段断言掩码、含水印。

---

## UC-quiz-061 · i18n / locale 回退（带审计）
**七类：特殊(i18n/locale) · 逃逸(回退) · 异常**

- 角色：求职者
- 触发：请求 locale 与简历/岗位语言不一致，或请求不支持的 locale。

主流程
1. 解析 `locale`；不支持 → 回退默认 locale，**写 `quiz_set_event(locale_fallback, from→to)`**（可复现）。
2. 中英混合简历 → validator 术语接地映射（确定性）；ai-eval 仅补语言质量。

异常/逃逸流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 不支持 locale | 回退 + 事件日志记录（原语4）→ 可审计可复现 |

验收
- 不支持 locale → 回退且 `locale_fallback` 事件存在（from/to 可查）。
- 中英术语映射由 validator 确定性产出。

测试用例
- TC-quiz-061-fallback〔集成〕：传 `xx-YY`→回退默认、断言 `locale_fallback` 事件落账。
- TC-quiz-061-map〔单元/graph-fake-model〕：中英混合→断言术语接地映射正确（确定性）。
- TC-quiz-061-quality〔ai-eval〕：仅断言译文/语言质量。

---

## UC-quiz-067 · 安全护栏（自伤 / 辱骂 / 违法）
**七类：刁钻(危机/对抗) · 逃逸(人工接管/安全终止) · 异常**

> 处置账本 + 确定性路由的机制化落点见 UC-078（本 UC 描述场景，UC-078 描述机制断言）。

- 角色：系统（安全分类 + 路由）
- 触发：简历/输入夹自伤倾向、辱骂、违法诉求。

主流程
1. 安全分类器命中 → **确定性路由**到对应处置：自伤→危机响应文案 + 人工接管标记；辱骂/违法→拒绝 + 安全终止。
2. 写 `safety_flags(category, route, action)`；CAS 落 AiGraphRun→`safe_terminating→safely_terminated`（必要时）。

验收：见 UC-078。

测试用例：见 TC-quiz-078-*。

---

## UC-quiz-070 · 系统级并发准入 / 排队（背压）★必补
**七类：高并发(系统级背压) · 逃逸(降级/503) · 异常**

- 角色：系统（准入控制 + 队列）
- 触发：M 个用户在 worker/连接池容量之上同时发起生成。

主流程
1. 生成请求先过**准入控制**：队列深度 < 上限 → 入队（写 `queued` 事件 + 估计等待）；≥ 上限 → 直接 503 降级（可解释「繁忙，请稍后」）。
2. worker 按 lease 逐个领取；**准入与 reserve 解耦**：入队不预扣额度，领取启图时才 reserve（避免超额预留）。
3. 池满期间已 reserved 的任务不被穿透。

异常/逃逸流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 并发 M > 容量 | 准入控制 + 队列深度上限（kill-switch 常量）→ 排队或 503 |
| E2 | 资源穿透风险 | lease 准入 + reserve 延迟到领取时（CAS） |

验收
- 并发 M（> 容量）→ 准入控制生效：超上限部分 503、其余排队；**无 reserve 超额**（reserved 数 ≤ 实际领取数）。
- 队列深度不超上限常量。

关联：原语 CAS(lease)/事件日志(queued)；逃逸 503 降级 + 队列上限 kill-switch。

测试用例
- TC-quiz-070-admit〔集成(并发 M)〕：并发超容量→断言准入生效、503 计数符合上限、reserved≤领取数、无资源穿透。
- TC-quiz-070-queuecap〔集成〕：队列填满→新请求 503，队列深度=上限。

---

## UC-quiz-071 · 主模型不可用 failover ★必补
**七类：逃逸(failover/熔断) · 异常 · 刁钻(供应商抖动)**

- 角色：系统（model-router）
- 触发：主模型 503/超时/熔断打开。

主流程
1. model-router 检测主模型连续失败→熔断打开，failover 备用模型；写 `model_failover(from→to)` trace。
2. 备用也不可用 → 进重试队列（有界退避）；全耗尽才 QuizSet→failed + released。
3. 全程 PIPL 境内模型池内切换。

异常/逃逸流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 主模型 503 | 熔断 + failover 备用（不直接 failed） |
| E2 | 全部不可用 | 有界重试耗尽→failed→released（退还），可解释 |

验收
- 主模型抛 503 → 走 fallback 分支、`model_failover` trace 存在、**不直接 failed**。
- 主+备全挂 → 有界重试后 failed + released（余额复原）。

关联：逃逸 熔断/降级；原语 事件日志(failover)/CAS(release)。

测试用例
- TC-quiz-071-failover〔graph-fake-model〕：主抛 503→断言切备用、`model_failover` 记录、生成成功。
- TC-quiz-071-exhaust〔graph-fake-model〕：主+备全 503→有界重试后 failed、released。

---

## UC-quiz-072 · 越权写 / 重生成 / 导出隔离（RLS 写路径）★必补·最高优先级
**七类：刁钻(越权写) · 异常(0 行写) · 高并发**

- 角色：攻击者（持他人 quizSetId）
- 触发：A 对 B 的 quizSet 触发 generate-on / regenerate / single-regenerate / export。

主流程（防御）
1. 每个**写/消耗入口**在 principal 上下文执行，RLS fail-closed。
2. 非属主 → 0 行命中 → 404（不泄露存在性），不改状态、不扣 B 权益、不写 B 账本。

异常/刁钻流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | A 重生成 B 集 | RLS principal 绑定（原语3）→ 404、0 行写 |
| E2 | A 单题重算 B 题 | RLS → 404、B 产物不变 |
| E3 | A 导出 B 集 | RLS → 404、不生成 B 文件 |
| E4 | A 并发刷 B 多入口 | RLS + 状态 CAS → 全部 0 行 |

验收
- A 对 B 的 4 个写入口各自 → 404；B 的 QuizSet 状态/版本/题集/权益**完全不变**（前后快照相等）；B 账本 0 新增。

关联：契约 regenerate/single-regenerate/export；原语 RLS/CAS；这是写路径 RLS 复测的硬基线。

测试用例
- TC-quiz-072-regen〔集成〕：A 重生成 B→404、B 快照不变、consumption 0 增。
- TC-quiz-072-single〔集成〕：A 单题重算 B→404、B 题不变。
- TC-quiz-072-export〔集成〕：A 导出 B→404、无文件生成。
- TC-quiz-072-dbprove〔集成〕：db 层断言越权操作命中 0 行写。

---

## UC-quiz-073 · reserve 成功后 QuizSet 创建失败的逆向补偿 ★必补·最高优先级
**七类：复杂(saga 逆向) · 异常(孤儿预留) · 逃逸(补偿重放)**

- 角色：系统
- 触发：额度已 reserved，但 QuizSet insert 失败 / 启图前进程崩 → 孤儿预留。

主流程
1. reserve 与 QuizSet 创建在一个 saga；reserved 记 `idempotency_key` + 关联未决 quizSetId。
2. QuizSet 落库失败/崩 → 补偿 job 扫描「reserved 但无对应 QuizSet/超时未推进」→ exactly-once release（幂等键 + CAS）。
3. 额度回补恰一次。

异常/逃逸流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | reserve 后 insert 崩 | 补偿 job exactly-once release（原语1+2）→ 回补额度 |
| E2 | 补偿 job 重复跑 | 幂等键去重 → release 恰一次 |

验收
- 注入 insert 崩 → 孤儿预留被补偿、额度回补**恰一次**（重放补偿 2 次余额仍只回补 1 次）。
- 不产生悬挂 reserved（最终一致后无孤儿）。

关联：状态机 ConsumptionRecord(reserved→released)、QuizSet(reserved→created 回退)；原语 CAS/幂等键。

测试用例
- TC-quiz-073-orphan〔集成·故障注入〕：reserve 后注入 insert 失败→补偿→断言额度回补、无孤儿 reserved。
- TC-quiz-073-replay〔集成〕：补偿 job 重放 2 次→release 副作用恰一次。

---

## UC-quiz-074 · 接地 span 内容蕴含校验（坐标投毒）★必补·最高优先级
**七类：刁钻(坐标投毒/对抗) · 异常(拦截不入库)**

> 替换/强化 UC-030 的「非空 span」口径。

- 角色：系统（接地 validator）
- 触发：模型返回「断言 + 指向无关原文的合法坐标」。

主流程
1. 对每条 claim：定位 span → **校验 span 文本语义蕴含/支撑该 claim**（text-match + 蕴含判定），非仅坐标存在。
2. 坐标合法但内容不支撑 → 判 distortion → 拦截 + `distortion_flags` + 不入库。

异常/刁钻流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 合法坐标 + 无关原文 | 蕴含校验（业务 validator，deterministic）→ 拦截 |
| E2 | span 指向简历他人/无关段 | 同上 |

验收
- 投毒样本（claim 与 span 文本不匹配/不蕴含）→ 判 distortion、拦截、不入库、写 `distortion_flags`。
- 反例（span 真实蕴含 claim）→ 通过。
- **不接受「坐标非空即通过」**。

关联：安全 歪曲门(证据接地)；原语 事件日志(distortion_flags)。

测试用例
- TC-quiz-074-poison〔graph-fake-model〕：注入合法坐标+无关 span→断言蕴含校验失败、拦截、不入库、retry=0。
- TC-quiz-074-valid〔单元〕：span 真蕴含 claim→通过。
- TC-quiz-074-entail〔ai-eval〕：金标蕴含集断言判定质量（补语义维度）。

---

## UC-quiz-075 · 部分召回计费口径 ★必补
**七类：异常 · 特殊(部分价值)**

- 角色：系统（commerce）
- 触发：partial（0<N<target）或 empty_recall。

主流程（确定性规则）
1. **empty_recall（N=0）→ 全额 release**（不计费）。
2. **partial（0<N<target）→ 计费 = 单位价 × N（按比例，向 target 封顶）**；余额 release；写 `partial_recall(N, target, charged)` 审计。
3. 规则为常量，不依赖模型；AI 图只发「建议扣减」，commerce 校验后落账。

异常流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | partial | 确定性计费规则 + CAS confirm 部分 + release 余额 |
| E2 | 计费纠纷/重放 | 幂等键 → 部分 confirm 恰一次 |

验收
- N=0 → confirm 金额=0、全额 released。
- 0<N<target → confirm 金额 = 规则值（按比例），有「部分价值」审计记录。

关联：状态机 ConsumptionRecord/QuizSet(partial/empty_recall)；原语 CAS/幂等键/事件日志。

测试用例
- TC-quiz-075-empty〔集成〕：N=0→confirm=0、released。
- TC-quiz-075-partial〔集成〕：N=2/target=5→confirm=规则值、余额 release、审计存在。
- TC-quiz-075-rule〔单元〕：计费规则纯函数边界（N=1, N=target-1）。

---

## UC-quiz-076 · 简历版本漂移 / provenance 失效 ★必补
**七类：刁钻(版本漂移) · 特殊 · 异常**

- 角色：系统
- 触发：生成中或生成后，源简历被更新/删除。

主流程
1. 生成时 **pin `resumeVersionId`** 进 QuizSet/每个 span。
2. 查看/导出时校验 quiz.`resumeVersionId` == 当前简历版本；不一致 → span 标 `stale`，不按旧坐标高亮，降级提示「简历已更新，押题基于历史版本」。
3. 简历删除 → span 标失效，不悬空错位。

异常/刁钻流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 生成中简历被改 | pin resumeVersionId（生成期不读新版） |
| E2 | 查看时版本不符 | 版本一致性校验→标 stale、降级提示 |
| E3 | 简历被删 | span 失效标记，不错位 |

验收
- quiz 始终 pin 生成时的 `resumeVersionId`。
- 版本不符 → span 标 stale + 降级提示，**坐标不错位**（不高亮到新版错误位置）。

关联：安全 provenance pin；原语 事件日志(版本标记)。

测试用例
- TC-quiz-076-pin〔集成〕：生成中改简历→quiz 仍 pin 旧版、span 坐标对旧版有效。
- TC-quiz-076-stale〔集成〕：查看时版本不符→span 标 stale、降级提示、无错位高亮。
- TC-quiz-076-deleted〔集成〕：简历删→span 失效不悬空。

---

## UC-quiz-077 · 多岗位部分空召回混合态 ★必补
**七类：复杂(per-role 混合态) · 异常**

- 角色：求职者
- 触发：UC-003 中部分岗位 empty_recall、部分成功。

主流程
1. 每岗位独立 `QuizSetRole` 状态/计费/事件。
2. 聚合 QuizSet=partial；成功岗位 per-role confirm，空召回岗位 per-role release。
3. 整集**不因单岗位空而全失败或全扣费**。

异常流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 岗位 A 成功 / B 空 | per-role 状态机 + per-role 计费（CAS）+ per-role 事件 |

验收
- 3 岗位（2 成功 1 空）→ 2 个 grounded + 1 个 role_empty_recall；计费=2 份；整集=partial、不全失败。

关联：状态机 QuizSetRole；原语 CAS/事件日志(roleId)。

测试用例
- TC-quiz-077-mixed〔集成〕：构造 2 成功 1 空→断言 per-role 状态、计费=2 份、整集 partial、各 roleId 事件齐。

---

## UC-quiz-078 · 安全处置账本 + 确定性路由 ★必补
**七类：刁钻(危机/越狱) · 逃逸(人工接管/安全终止)**

> 机制化 UC-067。

- 角色：系统（安全分类 + 路由）
- 触发：分类命中自伤/辱骂/违法/越狱/诱导刷分/泄题。

主流程
1. 分类器输出标签 → **确定性路由**（标签→固定处置分支，非模型自由发挥）。
2. 写 `safety_flags(category, route, action, audit)`；危机类 CAS 落 AiGraphRun→safe_terminating/safely_terminated 或挂人工接管。
3. ai-eval 仅测「分类是否准」；路由命中由集成层确定性断言。

异常/逃逸流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 自伤倾向 | 分类命中→确定性路由危机响应 + safety_flags + 人工接管标记 |
| E2 | 越狱/诱导刷分 | 路由拒绝 + safety_flags + 不执行注入指令 |

验收
- 危机分类命中 → 路由分支确定性命中（同输入恒定路由）、`safety_flags` 落账（category/route/action）、审计可查。
- ai-eval 只断言分类质量，不参与路由硬断言。

关联：安全 内容安全/越狱纵深；状态机 AiGraphRun(safe_terminating)；原语 事件日志(safety_flags)。

测试用例
- TC-quiz-078-route〔集成〕：注入危机文本→断言确定性路由命中、safety_flags 落账、AiGraphRun 安全终止/接管。
- TC-quiz-078-jailbreak〔graph-fake-model〕：越狱指令→不执行、路由拒绝、flags 记录。
- TC-quiz-078-quality〔ai-eval〕：金标集仅测分类准确率。

---

## UC-quiz-079 · 反滥用状态机落点 + 阈值固化 ★必补
**七类：逃逸(限流/kill-switch) · 刁钻(刷量)**

> 机制化原 UC-023。

- 角色：系统（限流中间件 + 配额 kill-switch）
- 触发：用户在 `N 次/时窗`（固化常量，如 **20 次/分钟/用户**，生成类更严）之上刷生成/重生成。

主流程
1. 限流中间件计数器（Redis）；超阈值 → QuizSet/请求路由 `throttled` 枚举；返回 429。
2. 写 `rate_limit_audit(counter, threshold, window, kill_switch)`；超阈值**不 reserve**（不扣额度、不进 generating）。
3. 全局 kill-switch 可一键降级只读。

异常/刁钻流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 刷量超阈值 | 限流中间件 + `throttled` 状态枚举 + 审计→429、不 reserve |
| E2 | 全站滥用 | 配额 kill-switch → 全局只读降级（可审计） |

验收
- 超 `N 次/时窗`（常量固化）→ 429、`throttled` 状态、`rate_limit_audit` 落账、**0 次 reserve**。
- kill-switch 开 → 写入口拒绝、读可用。

关联：状态机 QuizSet(throttled)；逃逸 限流/kill-switch；原语 事件日志(rate_limit_audit)。

测试用例
- TC-quiz-079-throttle〔集成〕：连发超阈值→429、throttled、0 reserve、审计存在。
- TC-quiz-079-killswitch〔集成〕：开 kill-switch→写 429、读 200。
- TC-quiz-079-const〔单元〕：阈值常量与时窗断言（防漂移）。

---

## UC-quiz-080 · 首次生成双击去重 ★必补
**七类：正常 · 高并发(首发双击)**

- 角色：求职者
- 触发：首次生成路径并发 2 个同 key 请求。

主流程
1. 幂等键 `(userId, resumeVersionId, roleSetHash)` `ON CONFLICT DO NOTHING`。
2. 恰一个建 QuizSet + reserve；另一个读首单返回。

高并发流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | 首发并发同 key | 幂等键 UNIQUE（原语2）→ 恰一个 run、一次 reserve |

验收
- 首发并发 2 请求 → 恰一个 QuizSet、一次 reserve、一次 confirm；另一个返回同一 quizSetId。

测试用例
- TC-quiz-080-firstdbl〔集成(并发)〕：同 key×2 并发首发→断言 1 个 QuizSet、reserve 计数=1、两响应同 id。

---

## UC-quiz-081 · 空召回阈值临界（边界值）★必补
**七类：特殊(边界)**

- 角色：系统
- 触发：命中率恰=阈值、有效题 N=0 / N=1 / N=target-1。

主流程
1. 命中率 = 阈值 → 归类规则确定（含/不含边界，固化）。
2. N=0→empty_recall；N=1..target-1→partial；N=target→completed。

验收（边界确定）
- 命中率==阈值 → 落入既定一侧（规则常量决定，可测）。
- N=0/1/target-1/target 各落对应状态。

测试用例
- TC-quiz-081-bound〔单元〕：阈值±ε、N∈{0,1,target-1,target} → 状态归类正确。
- TC-quiz-081-int〔集成〕：构造 N=1 与 N=target-1→partial、计费=规则值。

---

## UC-quiz-082 · 版本归档上限 / GC ★必补
**七类：特殊(存储治理)**

- 角色：系统
- 触发：反复重生成导致版本累积。

主流程
1. 每 QuizSet 保留版本数上限（如最近 K 版）；超出 → 归档/软删最旧版（保留审计摘要）。
2. GC job 周期清理超期归档版本（保留事件日志元数据）。

验收
- 重生成 K+1 次 → 活跃版本 ≤ K，最旧版被归档/GC。
- GC 后 `version_archived` 审计仍可查。

测试用例
- TC-quiz-082-cap〔单元〕：版本策略纯函数，K+1 版→保留 K。
- TC-quiz-082-gc〔集成〕：触发 GC→超期版本清理、审计保留。

---

## UC-quiz-083 · 可观测性背压（trace 写失败不阻塞）★必补
**七类：异常 · 逃逸(降级记录)**

- 角色：系统
- 触发：`ai_invocation_traces`/`quiz_set_event` 观测写在抖动/不可用。

主流程
1. trace 写失败 → 不阻塞主链路（best-effort + 异步缓冲/丢弃可解释）；业务事件日志（账本）仍走主事务保障一致。
2. 区分：**业务账本（必落，原语4）** vs **观测 trace（可降级）**。

异常/逃逸流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | trace DB 抖动 | 观测写与业务事务解耦→主链路不 fail，降级记录 |
| E2 | 业务事件日志写失败 | 属主事务，回滚/重试（不可降级） |

验收
- 注入 trace 写失败 → 生成主链路成功完成（QuizSet 正常落点），仅 trace 降级。
- 注入业务 `quiz_set_event` 写失败 → 主事务回滚（一致性优先）。

关联：原语 事件日志（业务必落）；逃逸 观测降级。

测试用例
- TC-quiz-083-tracefail〔集成·故障注入〕：trace 写抛错→主链路 completed、trace 降级标记。
- TC-quiz-083-eventfail〔集成〕：业务事件写失败→事务回滚、无半成品状态。

---

## UC-quiz-084 · 导出生成失败 / 超大 ★必补
**七类：异常 · 逃逸(可解释错误)**

- 角色：求职者 / 系统
- 触发：PDF 渲染失败 / 超大文件 / 超限。

主流程
1. 导出渲染失败/超限 → 不返回半成品、不泄露中间文件；返回可解释错误。
2. 不消耗导出配额（或失败 release）；写 trace。

异常/逃逸流（落机制）
| flow | 场景 | 机制 |
|---|---|---|
| E1 | PDF 渲染失败 | 失败→可解释错误 + 不泄半成品 + 配额 release |
| E2 | 超大/超限 | 预检拦截或分页/降级 |

验收
- 渲染失败 → 返回可解释错误、无半成品文件可访问、配额未净消耗。
- 超限 → 预检拒绝（不进渲染）。

测试用例
- TC-quiz-084-fail〔集成·故障注入〕：渲染抛错→可解释错误、无文件 URL、配额复原。
- TC-quiz-084-toobig〔集成〕：超限输入→预检 422。

---

## 2. 七类覆盖矩阵（域级自检）

| 类 | 代表 UC |
|---|---|
| 正常 | 001 / 002 / 003 / 010 / 020 / 080 |
| 异常(回滚/退款) | 001E3 / 040 / 042 / 051 / 071 / 073 / 075 / 083 / 084 |
| 特殊(边界/空/首次/i18n) | 002 / 040 / 042 / 061 / 075 / 076 / 081 / 082 |
| 逃逸(降级/fallback/kill-switch/接管/安全终止) | 033 / 040 / 067 / 070 / 071 / 078 / 079 / 083 / 084 |
| 高并发(双击/并发resume/竞态CAS/租约) | 020 / 070 / 072E4 / 080 |
| 复杂(saga/跨聚合/长会话/部分失败) | 003 / 051 / 073 / 075 / 077 |
| 刁钻(注入/越狱/刷分/泄题/PII/版本漂移/对抗) | 010 / 021 / 030 / 033 / 060 / 072 / 074 / 076 / 078 / 079 |

每条异常/刁钻流均落到「状态机迁移」或四原语之一（见各 UC 异常流表「机制」列）。

## 3. 测试层映射纠偏（落实评审⑤）

- 歪曲/坐标投毒「不盲重试」=确定性控制流 → **graph-fake-model**（TC-030-distort、074-poison：断言走拦截分支 + retry=0）；ai-eval 仅测判得准（030-quality、074-entail）。
- locale 术语接地 → unit/graph（061-map）；ai-eval 仅补语言质量（061-quality）。
- 危机路由「触发」=确定性 → 集成层硬断言（078-route）；ai-eval 仅测分类质量（078-quality）。
- confirm 崩溃 → 显式声明为补偿 job 重放层 + 故障注入点（051-confirmcrash、073-replay：exactly-once）。

## 4. 开放决策

见结构化字段 `openDecisions`。