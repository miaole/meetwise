---
id: product_glossary
name: 统一术语 + serviceType 权威枚举
description: 产品/技术术语单一真相，含 serviceType↔graphName 权威映射，避免命名漂移。术语与 data-model/domain 对齐。
type: reference
scope: shared
level: guide
status: active
owner: product
version: 3
related:
  - ./domain-models/interview-career-domain.md
  - ../architecture/backend/data-model.md
  - ../requirements/use-cases/interview-modality.md
---

# 统一术语

## 面向用户的缩写写法（P0）

面试教材、交付报告和产品说明中，技术缩写第一次出现必须写成“`缩写（中文全称；这里负责什么）`”。后续同一篇文档可只写缩写，避免把口语答案写得无法朗读；代码标识符、URL、命令、SQL、JSON 键和环境变量保持原样，但紧邻文字必须解释。以下表是跨文档的权威中文解释，不把英文缩写当作读者已知前提。

| 缩写 | 中文全称 / 在本项目中的作用 |
| --- | --- |
| AI | 人工智能；这里泛指模型辅助的出题、检索和评分能力。 |
| LLM | 大语言模型；生成或评审自然语言，但不是业务事实源。 |
| RAG | 检索增强生成；先找经过权限过滤的证据，再让模型基于证据作答。 |
| DB | 数据库；本项目的订单、账本、权限、事件和版本状态真相源。 |
| SQL | 结构化查询语言；用于数据库查询与事务性状态更新。 |
| HTTP | 超文本传输协议；浏览器、支付渠道和服务之间的请求协议。 |
| API | 应用程序编程接口；服务对外提供的受契约约束的调用入口。 |
| JSON | JavaScript 对象表示法；模型输出与接口中使用的结构化数据格式。 |
| PDF/DOCX/XLSX/PPTX | 分别为可移植文档、Word、Excel、PowerPoint 文件格式；全格式 RAG 需保留其页/表/单元格/幻灯片定位。 |
| MIME | 多用途互联网邮件扩展类型；上传时用于声明文件类型，必须再由 magic bytes 复核。 |
| OCR | 光学字符识别；从扫描图像、截图或幻灯片图中提取文字。 |
| ASR | 自动语音识别；将音视频语音分段转写为文本和时间戳。 |
| VLM | 视觉语言模型；用于理解图片/图表，但不能替代原始图表数据。 |
| PII | 个人可识别信息；如姓名、电话、简历内容，需最小化保存与脱敏。 |
| DLP | 数据泄露防护；防止敏感信息进入训练集、日志或非授权渠道。 |
| ACL | 访问控制列表；定义哪些主体可读取某份证据或题库。 |
| RLS | 行级安全；由数据库在每一行数据层面执行的访问隔离。 |
| CAS | 比较并交换；只有记录仍处于预期状态才更新，用于并发幂等收口。 |
| PSP | 支付服务提供商；外部支付渠道，回调按至少一次投递处理。 |
| SLO | 服务等级目标；把延迟、错误率、可用性等写成可量化的运营目标。 |
| SSE | 服务器发送事件；服务端向浏览器持续推送流式进度的协议。 |
| rAF | 请求动画帧；浏览器按屏幕帧率合并渲染更新，避免每个流 token 都重排。 |
| E2E | 端到端测试；从真实界面/接口到存储和异步消费链路的验证。 |
| CI | 持续集成；每次变更自动运行的构建和测试门禁。 |
| TTL | 生存时间；缓存或临时状态的自动失效时长。 |
| P95/P99 | 第 95/99 百分位延迟；分别表示 95%/99% 请求不超过的耗时。 |
| DLQ | 死信队列；重试耗尽或无法安全处理的消息进入人工可见队列。 |
| HNSW | 分层可导航小世界图索引；向量库的近似最近邻索引，需实测而非假定生效。 |
| ANN | 近似最近邻检索；在大向量集合中以速度换取可能漏召回的检索算法。 |
| RRF | 倒数排名融合；合并多个检索排序的规则，必须由冻结集证明收益。 |
| BM25 | 一种词项匹配排序函数；对专有名词、缩写和精确关键词常有帮助。 |
| MRR | 平均倒数排名；相关结果第一次出现的位置质量指标。 |
| nDCG | 归一化折损累计增益；考虑位置和相关性等级的排序指标。 |
| MAP | 平均准确率均值；综合每个相关结果排序位置的检索指标。 |
| SFT | 监督式微调；用审核过的输入输出示例调整模型行为。 |
| CPT | 持续预训练；用大量领域原始语料继续训练基础模型，成本与治理要求更高。 |
| DPO | 直接偏好优化；用同一输入下的优选/拒选输出对齐模型偏好。 |
| LoRA/QLoRA | 低秩适配/量化低秩适配；用较少可训练参数做低成本微调试验。 |

> 修闭合验证 regression：删除已废术语（面试会话/面试结果/岗位画像），对齐 data-model 命名。

| 术语 | 英文 | 说明 |
| --- | --- | --- |
| 知面 | Meetwise | 产品名 |
| principal | Principal | 一次访问的安全主体：`user`(C 端) 或 `tenant`(B 端) |
| 机构 / 成员 | Tenant / Membership | B 端机构与其成员关系 |
| principalContext | Principal Context | 请求身份上下文(`personal`\|`tenant:<id>`)，RLS 据此判别 |
| 面试（聚合） | Interview | **唯一面试聚合根**(id=threadId，mode=self_practice\|candidate_evaluation)；取代旧 Session/Result 二分 |
| 问答 | InterviewQA | 单轮问答（Interview 强一致子实体）；物理表 `interview_question` |
| 题目账本 | question ledger | C 端已出/已答进度的业务事实（`interview_question`）；不是 ScoreCard，也不是测量质量根 |
| 已答题数 | Overview.answered | 成长主页统计：privacy-active 面试上 `status='answered'` 的题目账本行数 |
| 可评分答题数 | GrowthView.totals.answered | 成长档案「累计已评分」：`practice_eligible`/`b_review_eligible` ScoreCard 张数，不是成长主页已答题数 |
| 事件账本 | InterviewEvent | 单一 append-only 有序事件真相(单调 seq)，审计/重放/推断证据共用 |
| 简历 / 版本 | Resume / ResumeVersion | 简历聚合与版本 |
| 岗位 | Role | 岗位/JD/能力要求(owner+visibility)；取代旧 RoleProfile |
| 职业目标 | CareerProfile | 用户**声明**的职业意图(targetRoles/goals) |
| 成长档案 | GrowthProfile | 系统**推断**聚合(只读，汇总 SkillInference) |
| 技能推断 | SkillInference | 不可变推断条目(level/confidence/evidence/ttl) |
| 能力差距 | SkillGap | 当前与目标岗位的差，**派生不落表** |
| 押题 | Question Forecast | 据简历×JD 预测问题 |
| 复盘报告 | AssessmentReport | 结构化评估(独立聚合，经 interviewId 引用) |
| 学习计划 | LearningPlan | 据差距与目标生成的阶段计划 |
| 权益 / 消费 | Entitlement / ConsumptionRecord | 可用次数额度 / reserve-confirm-release 消费 |
| 可见性 / 归属 | visibility / owner | private\|org\|shared\|global / owner_user_id\|owner_tenant_id |
| AI 图 / 图运行 | AI Graph / AiGraphRun | LangGraph 状态图 / 一次执行(独立聚合) |
| checkpoint / thread_id | Checkpoint / Thread ID | LangGraph 线程状态快照 / 恢复同会话标识 |

# serviceType ↔ graphName 权威映射（单一真相）

> 修 open 桥：本表是 `serviceType`(计费/权益维度) 与 `graphName`(编排维度) 的**唯一真相**。domain/blueprint 不得内联私有枚举，一律引用此表。权威集源自 `use-cases/interview-modality.md §0.1`。

| serviceType（计费/权益） | graphName（编排） | 说明 |
| --- | --- | --- |
| `resume_quiz` | `resume-quiz` | 简历押题 |
| `special_interview` | `mock-interview` | 专项面试（载入专项 profile/rubric） |
| `behavior_interview` | `mock-interview` | 行为面试（载入行为 profile） |
| `mock_interview` | `mock-interview` | 通用模拟面试 |
| `career_path` | `career-path` | 职业路径分析；**消耗额度，入共享/主池**（与面试同口径 reserve→confirm，已签 open-decisions） |

- **`hr` / `system-design` 等是 `mock_interview` 的 profile 参数，不是独立 serviceType**（消除 domain 旧文 line 81 的游离值）。
- **`report` 不是 serviceType**：面试后自动生成、bundled 进面试，graphName=`report`（子图/后台）。
- **计费按 serviceType、路由按 graphName**，二者经本表显式桥接；落 `packages/contracts` 时以本表为 enum 真相。
- ✅ **已签**（open-decisions）：所有 serviceType 走**共享额度池**（FIFO 先到期先扣）；`career_path` 消耗额度入主池，非免费、非独立 SKU。

> **🔎 实现状态（对齐真实代码 · 2026-07）** — 术语/映射为权威定义（canonical），本身无对错。落地校正：四图（resume-quiz / mock-interview / career-path / report）与 serviceType 路由**已接线并可跑**；`career_path`/report 为**确定性派生**。`GroundedQuestion` 的“联网找真题”来源（web-explore）**机制已接且默认开启**（`main.ts` `DEFAULT_WEB_ALLOWLIST` 6 个官方文档源，env `WEB_ALLOWLIST` 设空串才关），但本地题库仍只约 32 条、**策展题库源表/审核门未建**；`GrowthProfile`/`SkillInference` 的“系统推断”当前=**复用 assessment_report 的确定性派生**，跨会话仅精确 hash 题目去重 + 历史弱项软偏置，语义记忆/belief 未接（死代码）。
