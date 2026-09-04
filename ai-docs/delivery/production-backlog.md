---
id: delivery_production_backlog
name: 生产就绪 Master Backlog（自驱目标文档）
description: 北极星 + 按优先级的生产面 backlog + 行走骨架序列 + 刻意不做清单。承重设计从 .tmp/对话决定 land 进 committed 知识层的进度看板。
type: plan
scope: shared
level: guide
status: active
owner: architecture
related:
  - ./roadmap.md
  - ./production-readiness-remediation-register.md
  - ../rules/global/production-invariants.md
---

# 生产就绪 Master Backlog

> **北极星**：100% 生产高可用（= 零业务事实丢失 + 优雅降级 + 快速恢复）/ 一个细节不放过 / agent 架构师水准。它是目标，不是当前已证明的事实；单节点数据库、运行时高权账号和未演练恢复仍是发布阻断。
> **根因诊断**：承重设计曾 70% 烂在 `.tmp`，committed 文档把硬机制「交接给后续任务」却无该任务（handoff 空指针）。修复 = land 孤儿 + 把 handoff 兑现成机制。
> **四个承重原语**（所有「漏钱/泄露/丢失」的塌缩）：CAS 条件更新、幂等键、RLS principal 绑定、持久有序事件日志。见 [生产不变量](../rules/global/production-invariants.md)。

状态：✅已 land committed · 🟡已决定待成文 · 🟠workflow 完成待 land · ❌待写

> **生产等价性纪律**：功能的测试、评测、演示或控制面存在，不等于它已经进入真实生产请求路径。
> 已知差距、关闭条件与勾选状态以
> [`production-readiness-remediation-register.md`](./production-readiness-remediation-register.md) 为准；本页不再用一行 ✅ 掩盖未接线的 serving、云端或浏览器链路。

## P0 — 演示关键 / 上线阻塞

| 条目 | 状态 |
|---|---|
| 四原语（CAS/幂等/RLS/事件日志） | ✅ `rules/global/production-invariants.md` |
| RLS 谓词机制（GUC/连接池/fail-closed/越权测试） | 🟡 API/worker Compose 配置已切换到 `APP_RUNTIME_DB_USER`；独立 PostgreSQL 的低权账号 19 项及低权 LangGraph checkpoint 3 项已通过。仍缺完整同构 Compose HTTP+队列压测、checkpoint 每行 owner-RLS 和恢复演练，见 `architecture/backend/rls-isolation.md` §4.1 |
| 5 对象状态机转换表 | ✅ `rules/global/status-machine.md` |
| 模块边界 + 依赖方向 + CI 强约束 | ✅ `architecture/backend/module-boundaries.md` |
| agent-runtime 关口（catalog/router/双校验/压缩/repair/重试） | ✅ `architecture/ai/agent-runtime.md` |
| agent-runtime 8 洞修复（双写/并发 resume/流式↔校验/序列化炸弹/interrupt 重放/token/背压/降级路由） | ✅ `architecture/ai/agent-runtime.md` §15 |
| 多 agent 编排 + 污染防火墙 | ✅ `architecture/ai/multi-agent-orchestration.md` |
| 长会话迁移（pin/drain/lease/安全终止；Phase0 子集） | ✅ `architecture/ai/runtime-migration.md` |
| 多模态摄取清洗 → 结构化 ResumeProfile（地基） | ✅ `architecture/backend/ingestion-pipeline.md` |
| factuality 歪曲门（不止缺失） | ✅ `rules/ai/structured-output-and-safety.md` |
| 对抗 golden 安全套件当 release-gate | ✅ spec 定 `rules/ai/safety-defense-in-depth.md` §4 + `devops/ci-cd.md` §1（实装在 S0+ 代码） |
| 题库 metadata 与分类/路由 tier | 🟠 后端、前端、测试、AI 等层级题域尚未在摄取/切块、generation 或生产 Worker 中出现：当前固定“技术岗”，题库/检索无 track 硬过滤。先交付 `PRD-TEST-016 / RAG-FUNNEL-01…06` 的 metadata taxonomy、question-aware generation projection、**自动**岗位意图分类/immutable snapshot、SQL/evidence/cache 隔离和 clean no-result 的一次同桶 LLM 出题；该 fallback 必须有 QuestionPlan、独立 provenance/rubric/score policy，且在评分校准前 B 端影响=0。再按 `PRD-TEST-017 / RAG-FUNNEL-07…08` 为其他自由文本复用规则→轻量模型→未决补充信息漏斗。不得给每题无条件加模型分类，也不得把 CRAG 或当前 generic fallback 叫意图分类器/同桶生成。 |
| ADR 登记册 | ✅ `architecture/adr/README.md` |
| CI/CD（docs:check+lint+合约+golden gate+demo 黄金路径） | ✅ `architecture/devops/ci-cd.md` |
| 旧 `/interview/:id/answer` 假评分旁路 | ✅ 本地组合根止血已验证：代码/OpenAPI 将遗留入口固定为 `410`，B 端数值投影/排序已暂停；`pnpm scor-00:http:prove` 在完整迁移、独立低权 runtime login 的真实 HTTP 中验证 C/B、重放、并发、跨主体调用及所有受检副作用为 0。`SCOR-00H` 另接线消费面诚实闸（无 identity / 空评估不得伪造 0；域 `refuseMappedBSideScore` 恒失败，worker/`markApplicationNoEligibleScore` 仍读 event hint；`GET` 不重跑闸；`pnpm scor-00-honesty:prove`）。回执均为 `releaseEvidence=false`，只证明旁路止血与消费诚实，不是评分闭环；见 `PRD-TEST-001 / SCOR-00`，评分卡、校准与 B 端用途仍由 `SCOR-01…08` 阻断。 |
| 全仓 strict TypeScript gate | 🟠 `packages/db`、`apps/api` 与 `packages/ai-runtime` 的局部 `tsc --noEmit` 可通过；当前 `apps/worker` 全量检查受 LangGraph 依赖缺失及若干 proof 类型错误阻断。尚未建立“所有 workspace（工作区）+ production image（生产镜像）”的单一 CI（持续集成）强制门，不能把局部通过写成全仓发布保证。 |

## P1 — 重要非演示阻塞

| 条目 | 状态 |
|---|---|
| RAG 语料生命周期（双指针/蓝绿/隔离/被遗忘权） | 🟡 QBank generation serving 已接线；通用/全格式 RAG 仍只有控制面与本地合同、没有 rebuild/outbox worker 或请求热路径。见 `PRD-TEST-005`。 |
| 可观测三账本 + 三支柱 | ✅ 策略成文 `observability/observability-strategy.md`；**成本/token 埋点已接线**（`invoke`→`ai_invocation_trace.service/input_tokens/output_tokens/latency_ms`，migration 0011，自库即成本真相，Langfuse 为分析层）。剩余埋点（OTel metrics 导出/告警下钻）随功能续接 |
| 安全/护栏纵深（输入分类→策略→输出审核→升级→审计；危机/over-refusal/AIGC 备案） | ✅ `rules/ai/safety-defense-in-depth.md` |
| 题库生命周期（org 私有/裸题富化/版本 pin/采纳双签/PII 泛化） | ❌ `product/question-bank-lifecycle.md` |
| 人↔AI 语音管线（ASR/TTS/turn-taking/endpointing/延迟/录音同意/B 端不打分） | 🟡 批量 ASR、普通/流式 TTS 与本地取消合同已接线；流式 ASR、服务端 turn-taking、真实抢话与浏览器→API→供应商 E2E 未验证。见 `architecture/ai/voice-capability-boundary.md` 与 `PRD-TEST-006`。 |
| 自主研究 agent（异步/沙箱/有界预算/对抗核实/同意 gate） | ❌ `architecture/ai/research-agent.md` |
| C 端 PI 同意 + 简历静态加密 + 删除级联 + 境外 egress 守卫 | 🟡 部分在 data-model，需机制化 |
| 密钥治理 + 泄露 IR（Langfuse key 待轮换） | ❌ `rules/security/secrets-management.md` |
| API/契约版本化与弃用 | ❌ `architecture/backend/api-versioning.md` |
| 数据演进（embedding 蓝绿/记忆和解/prompt eval-gate，MVP 精简集） | 🟠 `.tmp/versioning` 提升 |

## P2 — 规模化才咬人

威胁建模(STRIDE/DFD) · 授权矩阵(RBAC/ABAC) · 部署加固(ports/IMDS/SSRF/WAF) · 双索引/shadow(50万+) · 代码沙箱(技术岗) · a11y/WCAG · 成长档案/职业路径(Phase4)。

## 行走骨架（第一条端到端可演示窄切片）

链路：**上传简历 → 押题 → 一次模拟面试 → 出报告**（纯文本先行，语音后叠）。每步退出准则=可演示。

| # | 步 | 退出准则 |
|---|---|---|
| S0 | monorepo + compose.dev + Prisma 初始 schema + RLS 原语 + CAS 原语 + 事件日志表 | 🟡 进行中：**四原语已 code-validated**（`packages/db`，`pnpm db:prove` 对真 Postgres 全 PASS：CAS 恰一个赢 / 幂等去重 / RLS 越权=0 fail-closed / 事件 seq 单调）；Prisma schema + monorepo 应用层待续 |
| S1 | zod4 契约 + demo 登录 + principalContext 全路径注入 | 🟡 请求路径 code-validated（`apps/api`，`pnpm api:validate` 7/7：无principal→401、越权→404 不泄露存在性、HTTP 幂等）；zod4 契约 + 真登录待补 |
| S2 | 简历上传 → 摄取清洗 → 结构化 ResumeProfile（PII 闸+加密） | ✅ **code-validated**（`packages/db` + `domain.ingestResume`，2026-08-10 的 `pnpm resume:prove` 在 64 个迁移后的隔离 PostgreSQL（关系型数据库）通过 32/32，`releaseEvidence=false`，**经安全审计修 PII-strip 漏网/裸 sha 预言机/fail-open 密钥/FK 绕 RLS 等 P0-P1**）：原文 `pgp_sym_encrypt` 加密落 blob、结构化 profile 永不含明文 PII（NFKC 归一 + 行内/+86/全角脱敏 + ≥11 位数字 fail-closed 兜底）、注入拦截、状态机 CAS 原子完成、HMAC 去重、复合 FK 强制同 owner、RLS 越权=0、越权解密被拒。PDF/多模态抽取适配器层待补（本期 text；不代表全格式 RAG 或完整删除权）。|
| S3 | ai-runtime invoke 管线（catalog+PII 区域门+双校验+重试封顶+幂等键） | ✅ 内核 code-validated（`pnpm runtime:prove`：schema 失败重试/幻觉拦截/确定性拒绝不重试/幂等 exactly-once）；catalog+PII 区域门待补 |
| S4 | resume-quiz graph（押题）+ factuality 歪曲门 | 基于真简历出押题，无幻觉资历；2026-08-10 在 64 个迁移后的隔离 PostgreSQL（关系型数据库）`pnpm quiz:prove` 25/25，`releaseEvidence=false`。 |
| S5 | mock-interview graph：threadId=resultId + checkpointer + interrupt waiting_user + 事件账本 + lease | ✅ 内核 code-validated（`pnpm runtime:prove`：CAS 迁移/事件 seq/租约拒并发/**进程重启后纯从 DB 恢复 waiting_user，无内存 session**）；**真 LangGraph 图已验证**（`pnpm graph:prove`：interrupt + Postgres checkpointer + 重启续会话） |
| S6 | SSE 业务事件 + 报告子图（舱壁）+ 失败可重试降级态 | ✅ SSE Last-Event-ID 重放 code-validated（`pnpm api:validate`，不丢不重）；**报告子图舱壁**在 64 个迁移后的隔离数据库通过 `pnpm report:prove` 36 断言：报告作后台 job（后台任务）、失败不碰 interview（失败隔离）、3 事务生命周期（模型在事务外跑，不占连接/不持事件流锁）、租约防并发双跑、崩溃重领、stale finalize（过期收口）不发假事件、poison-pill（毒丸）超 MAX_ATTEMPTS（最大尝试次数）隔离 quarantined（隔离态）、ready 才发 report_ready。回执仍为 `releaseEvidence=false`；真长连接续推、真实模型与云端 worker 待验。 |
| S7 | commerce：共享权益池 reserve→confirm→release saga + FIFO + 按比例 + outbox 真实结算 + lease 心跳 | ✅ **code-validated**：2026-08-10 的 `pnpm commerce:prove` 在 64 个迁移后的隔离 PostgreSQL（关系型数据库）通过 50/50，`releaseEvidence=false`。覆盖 FIFO（先到期先扣）/全有全无/降级按比例大余数分账（Σ===settled 无分币泄漏）/幂等不重扣/**并发不超卖（FOR UPDATE+CAS）**/RLS（行级安全）越权=0/**outbox 真实结算入 `settlement_ledger` exactly-once（精确一次）**/**lease（租约）心跳续约 + 原子回收（修 heartbeat-vs-sweep TOCTOU，检查与使用竞争）**/同支付流水全局一次入账/确认与放弃终态配对。真实支付回调、云故障和资金清算仍待验。|

每步必带：四原语落齐、状态机转换、可观测埋点、对应测试（含失败/并发/越权用例）。

**报告 worker 生产部署待办（审计 round4 ops riders,非阻塞,部署清单跟进）**：① BYPASSRLS 的 **dispatcher 最小权限角色**（只 SELECT `ai_report.owner_user_id`,非 superuser 池）；② 枚举器加 `LIMIT`/游标 + 按 owner 并行 drain（高扇出前）；③ quarantined 报告的**运维告警面**（指标/管理员列表）；④ 终态事件可选 `UNIQUE(stream_key,kind)` 或文档化"SSE 消费者必须幂等"。

**commerce 对账已接线（原「built-but-not-called」已消除）**：`runCommerceReconciler`（`apps/worker`，30s 一拍）已在 worker 主循环启动——回收租约过期的孤儿预留（退额度回池、零泄漏）+ 对被弃 `mock_interview` 置终态 `abandoned` + 补发 `interview_unavailable` 终态事件 + `settleOutbox` 真实入结算账本（`SKIP LOCKED` 幂等、多实例安全）。心跳续约由 interview-consumer 每轮 job 调 `renewReservationLease`。此前 sweep/settle/renew 已建但零生产调用方，现为 **WIRED**。同时接线的稳态修复：**job-death/reap 标 `interview.status='failed'`**（消除"可复用尸体"reuse-trap）；**migration 0005 策略 `DROP IF EXISTS` 守卫**（原非幂等 → 脏库重跑崩 worker，已修）。

### 代码验证现状（可复跑 gate）

| gate | 命令 | 验证内容 |
|---|---|---|
| 四原语 | `pnpm db:up && pnpm db:prove` | CAS 恰一个赢 / 幂等去重 / RLS 越权=0 fail-closed / 事件 seq 单调（对真 Postgres） |
| 运行内核 | `pnpm runtime:prove` | invoke 双校验·重试分类·幂等 exactly-once / 状态机 CAS / 租约拒并发 / **进程重启纯从 DB 恢复（无内存 session）**（19/19） |
| 请求路径 + SSE（**真 NestJS**） | `pnpm api:validate` | **Fastify + 类型 DI + SWC**（已 re-home，弃手搓 http 与 @Inject 绕法）；principal 注入 / RLS fail-closed（401/404）/ HTTP 幂等 / SSE Last-Event-ID 重放（10/10）。must-smoke #1（NestJS×SWC×Fastify×类型DI）已验证 |
| 真 LangGraph 图 | `pnpm graph:prove` | StateGraph + interrupt 等待用户 + **Postgres checkpointer**：换新实例（模拟重启）从 Postgres 续会话、多 thread 隔离（6/6） |
| commerce saga | `pnpm commerce:prove` | 共享池 reserve/confirm/release + FIFO + 降级按比例（大余数分账,Σconsume===settled 无分币泄漏）+ 幂等不重扣 + **并发不超卖** + RLS（行级安全）越权=0 + **outbox 真实结算 exactly-once（精确一次）入账本** + **lease（租约）心跳 + 原子回收（无 TOCTOU，检查与使用竞争）** + 数据库容量 CHECK（检查约束）兜底（64 个迁移下 50 断言，本地 `releaseEvidence=false`）。 |
| 简历摄取 | `pnpm resume:prove` | 原文加密落 blob + 结构化 profile **永不含明文 PII**（NFKC + 行内/+86/全角脱敏 + ≥11 位数字 fail-closed）+ 注入拦截 + 状态机 CAS 原子完成 + HMAC 去重（非裸 sha 预言机）+ 复合 FK 强制同 owner + RLS 越权=0 + 越权解密被拒（64 个迁移、32/32 断言、**经 3 轮安全审计**、本地 `releaseEvidence=false`）；不证明 PDF（可移植文档格式）/音视频/表格解析或完整简历删除。 |
| 报告子图舱壁 | `pnpm report:prove` | 报告作后台 job（后台任务）：**失败隔离（报告失败不碰 interview）** + 3 事务生命周期（模型在事务外）+ 租约防并发双跑 + 崩溃重领 + stale finalize（过期收口）不发假事件 + poison-pill（毒丸）退避 + 超限 quarantined（隔离态）+ **quarantine 发 report_unavailable 终态事件（不静默死胡同）** + **多租户 dispatcher（调度器）真排干队列** + RLS（行级安全）越权=0（64 个迁移下 36 断言，本地 `releaseEvidence=false`）。不把该脚本模型测试当成真实报告质量、云端 worker 或外部通知证据。 |
| 孤儿任务收割 | `pnpm reaper:prove` | 面试与押题 job（后台任务）在 64 个迁移后的隔离 PostgreSQL（关系型数据库）通过 28 断言：心跳—收割竞态、重试边界、失败退款、重复收割幂等、已结算不倒退，以及 v64 failed start（开始）后 answer（回答）任务的数据库拒绝入队；回执为本地 `releaseEvidence=false`，不等于云端多副本崩溃演练。 |
| 契约 must-smoke | `pnpm api:smoke` | NestJS×SWC×Fastify×类型DI + `@meetwise/contracts` zod4 校验（合法 200 / 非法 400） |
| **端到端 agent 主干** | `pnpm interview:prove`（64 个迁移、脚本模型、隔离运行器） | 固定题单 `interview-lifecycle` 已退役并失败关闭；当前唯一主链为 v64 parent（父面试）`(resume_id,resume_privacy_epoch)` → durable job（持久任务）→ adaptive consumer（自适应消费者）→ LangGraph（图编排框架）→ 评分/结算 → 报告舱壁。2026-08-10 本地隔离为 11/11，`releaseEvidence=false`；不再把旧 `flow:prove` 或历史“真模型贯通”写作当前发布证据。 |
| 前端承重逻辑 | `pnpm web:prove` | SSE 业务事件解码(CRLF/心跳/分块) + 契约客户端(HTTP 状态分流 business/transport/drift + 强制幂等键) + 视图归约**无静默死胡同**(report_unavailable→degraded / 流断→reconnecting / 重连耗尽→出口)（27 断言,**经协议/安全审计**） |

> 最难、最差异化的路径已 code-validated；外围按"建完即跑验证"推进。

### 安全加固（本轮已接线）

| 项 | 状态 |
|---|---|
| 会话吊销（`PrincipalGuard` 验签后查 `user_account.status='active'`,60s 缓存 → 禁用/改密即失效） | ✅ 已接线 `apps/api` |
| 语音端点限流 `voiceGate`（防成本 DoS） + 登录/注册限流（爆破/滥注册） | ✅ 已接线 `RateLimitService` |
| CORS 生产 fail-closed（漏配 `WEB_ORIGIN` 拒绝启动,不反射任意 Origin） | ✅ `apps/api/main.ts` |
| 安全响应头（CSP/X-Frame-Options=DENY/HSTS/frame-ancestors none） | ✅ `apps/web/next.config.mjs` |
| RLS（行级安全）`FORCE ROW LEVEL SECURITY` + 越权=0 | 🟡 运行 Compose 已配置低权账号；API 的用户自助订单访问均经 RLS，跨用户账户/支付/队列/费用账本不再裸读。独立库 proof 已通过；仍缺同构 Compose 全链路与 checkpoint 每行 owner-RLS，未达到最小权限最终发布线 |
| migration 幂等（0005 策略 `DROP IF EXISTS` 守卫;0011 加 trace token 列） | ✅ 已修 |

### 🟡 已建未接线 / 待建（诚实剩余，勿当已交付）

区分**已接线运行** vs **已建未接线** vs **纯待建**：

| 项 | 现状 |
|---|---|
| **长期记忆模块** | 🟡 **部分接线**：完成后写系统题面的 `episode`，`wasAsked` 做跨会话 exact 去重；`assessment_report` 的弱项维度只读软偏置能力排序。语义 `user_memory` 向量召回、冻结 snapshot、信念画像和删除/同意闭环仍未接线；登记为 `PRD-TEST-011`（见 `architecture/ai/memory-context-design.md`）。 |
| **上下文记忆 / 语义压缩** | 🟡 **只有有界输入，不是摘要记忆**：当前按服务字符上限截断并加标记，评分只读当前题答；没有 tokenizer 精确预算、版本化摘要、可重放压缩边界或撤回传播。登记为 `PRD-TEST-012`。 |
| **Web 探索（CRAG 联网 fallback）** | 🟢 **机制已接线且默认开启**：`webExplore`(SSRF 安全 fetch:逐跳重定向复核 + 私网/allowlist 复核 + 硬超时 + fail-soft)已建;`DEFAULT_WEB_ALLOWLIST` 含 6 个官方文档源作 CRAG fallback 外呼(env `WEB_ALLOWLIST` 覆盖,显式空串才关)。**真正未建**:策展题库源表 + 审核门 + 扩召回 + 跨租户投毒断言 |
| **跨供应商模型 failover** | 🟡 **机制已接线,backup 未配**：`failoverModel` 链已建并接进默认客户端,但需配 `MODEL_BACKUP_*` 才真有第二供应商;未配等价单端点 |
| **图片简历 OCR（光学字符识别）** | 🔴 **全环境 disabled，未接线**：`OCR_ENABLED=1` 会在 API 组合根拒绝，缺失或非 `1` 的开关在入口前返回 `422 image_ocr_unavailable`，不创建额度、恢复工件或模型调用。旧的 `ocr:prove` 是历史脚本模型/计费路径证据，不能证明当前启用或百炼视觉能力。恢复必须先完成 `MODEL-OP-01` typed binding、原生 endpoint/凭据隔离、媒体预算、attempt/unknown、删除与合成 fixture 的脱敏组合根。 |
| **起步题库语料** | 🟡 **toy corpus**：仅 ~32 条自撰种子;**真正策展/授权题库 + 离线策展灌入管线未建**(P1「题库生命周期」❌) |
| **容灾备份 / PITR / 只读副本** | ❌ **未配**：模型层 failover 有机制,但 DB 备份/故障转移/演练未落地(部署清单跟进) |
| Next 渲染壳层 + EventSource 重连驱动 · CI eval gate | 🟠 承重逻辑已 code-validated,壳层/门禁续接 |

## 刻意不做 / 暂不做（什么时候不做的判断）

- **swarm**：流程是已知 DAG，去中心化对等交接只丢确定性/可观测/成本控制。
- **AI 给自己报告打分当权威**：考核信度红线，反思只做内部校验。
- **语义缓存 / HyDE / multi-query**：eval 门控，实测差才上；个性化缓存命中 3–5% ROI 低。
- **K8s / IaC**：demo 期单机 compose，规模化再上。
- **双索引/shadow embedding**：50 万向量+才需，MVP 直接全量重嵌。
- **代码沙箱 / 语音**：抬维度非补短板，骨架跑通后评估（语音是产品核心，但排在文本可恢复骨架之后）。

## 自驱执行顺序

1. land 孤儿：可观测 spec（🟠）；提升 versioning（🟠）。
2. 补 P0 从零：ingestion-pipeline、ADR、ci-cd、安全纵深、factuality 歪曲门、agent-runtime 8 洞收口；已识别的多题域面试先按 `PRD-TEST-016` 建 metadata 数据面隔离、**自动**岗位路由快照和 clean no-result 的同桶 LLM fallback，再按 `PRD-TEST-017` 在其他自由文本入口复用分类漏斗，不能为每题无条件堆叠分类模型。
3. 已决未成文：题库生命周期、语音、自主研究、密钥治理、API 版本化。
4. 行走骨架 S0→S6（动代码）。

> 进度看板即本文；每完成一项把状态翻 ✅ 并指向落地文件。
