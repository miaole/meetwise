---
id: use_cases_quality_assurance_traceability
name: 规格、测试与运行证据追溯
description: 定义 Meetwise 如何将业务用例、测试用例、测试实现、运行回执和发布门做成可校验的闭环，防止文档或模拟结果被误写成已验证能力。
type: requirements
scope: shared
level: spec
status: draft
owner: quality
version: 1
related:
  - ../../testing/strategy/test-strategy.md
  - ../../testing/conventions/test-authoring.md
  - ../../testing/cloud-runtime-migration-test-matrix.md
  - ../../architecture/current-runtime-truth.md
tags:
  - quality
  - traceability
  - evidence
  - release-gate
---

# 规格、测试与运行证据追溯

## 0. 目的与边界

本能力回答“哪一条测试在什么版本、什么依赖、什么环境下，证明了哪一条业务用例”。它不运行测试、不替代 CI（持续集成）、不授予发布权限，也不把本地 mock（模拟）结果升级为真实云端或模型质量证据。

**唯一真相**是版本化的追溯注册表和不可变运行回执。文档中的“通过”、终端输出、截图、PR（合并请求）评论、人工复制的数字均不是单独的发布证据。

## 1. 承重对象与状态

静态定义只存在于 Git（代码仓库）修订中，不能被运行时“改成已验证”。可变的执行与发布状态只存在于独立的证据接收器中。

| 对象 | 最小字段 | 不可变约束 |
| --- | --- | --- |
| `TestCaseDefinition`（测试用例定义） | `tcId`、`ucIds`、`flowRef`、`coverageKinds`、`acceptanceRefs`、`invariants`、`risk`、`lifecycle=group|leaf`、`requiredProfiles` | `tcId` 在同一 manifest（注册表）内唯一；group（分组）不可作为发布分母或执行目标；leaf（叶子）不可缺失 flow 与验收引用。 |
| `TestBinding`（测试绑定） | `bindingId`、`tcId`、`role=primary|supporting`、`runnerId`、`selector`、`sourceFiles`、`coveredSourceGlobs`、`fixtureDigests`、`requiredEnvironmentClass`、`assertionIds` | `bindingId` 唯一；每个 leaf TC 恰有一个 primary；不接受自由 shell（命令行）文本、远程可变脚本或 `continue-on-error`（失败继续）。静态环境声明不是运行环境事实。 |
| `EvidenceProfile`（证据配置） | `profileId`、允许的 attestation（证明）约束、最小样本、连续运行次数、最大证据年龄、受限 `thresholdPath`（阈值文件路径）及其 SHA-256（安全散列算法）摘要 | 校验器只接受仓库内版本化阈值文件并重新计算摘要；`pr-local`、`release-browser`、`release-real-model`、`release-cloud` 彼此不可替代，满足关系只能由接收器从证明推导。 |
| `RunnerAttestation`（运行器证明） | `issuer`（签发者）、`audience`（受众）、`subject`、仓库、受保护 workflow（工作流）、ref（引用）、commit/tree、镜像、`iat/nbf/exp/jti`（签发/生效/过期/一次性编号） | 接收器验证签名、密钥轮换、issuer/audience/subject/repository/workflow/ref/commit、有效期和一次性 `jti` 重放缓存；fork（派生仓库）和不受保护 workflow 一律拒绝。 |
| `HarnessAttestation`（编排器证明） | 预置 harness 二进制/镜像摘要、证书链、服务器颁发的 per-run（每运行）签名能力摘要、run lease（运行租约）和执行计划摘要 | 子进程不持有私钥、JWT（JSON 网络令牌）或签名 API；接收器仅接受与 RunnerAttestation、run lease 和固定 harness 摘要同时匹配的 envelope（信封）。 |
| `DataPlaneAttestation`（数据面证明） | 独立签发者、签名/密钥标识、`runId`、plan/image/target 摘要、nonce（一次性编号）、有效期与平台专属证据 | cloud（云端）只接受控制面签名 TargetGrant（目标授权）+ 云工作负载身份/资源 API（应用程序接口）证明；real-model（真实模型）只接受供应商 usage receipt（用量回执）或接收器代理账本；browser（浏览器）只接受预登记设备/驱动签名回执。 |
| `TestRun`（命令级运行） | `runId`、冻结执行计划摘要、Git commit/tree、lockfile（依赖锁文件）摘要、经验证的 RunnerAttestation、工作流运行 ID、观察到的环境/依赖/镜像摘要、开始/结束时间 | 由可信接收器分配 run ID；同一 `runId` 只封存一次；测试子进程的 stdout（标准输出）仅是诊断，不能自证结果。 |
| `ProfileSatisfaction`（配置满足证明） | `runId`、`profileId`、已验证 DataPlaneAttestation、接收器推导的环境、provider（供应商）/VPC（虚拟私有云）/target（目标）/image（镜像）/CA（证书颁发机构）/model（模型）摘要、样本计数 | 只由接收器依据 RunnerAttestation、HarnessAttestation、冻结计划和已验签数据面证明生成；未知、错配或样本不足为 `inconclusive`（结论不充分）。 |
| `CaseAttempt`（TC 级尝试） | 不可变 `caseAttemptId`、唯一 `(runId,tcId,bindingId,attemptNo)`、`profileSatisfactionId`、结果、原因码、预期/实际断言数、指标/阈值摘要、依赖摘要、`evidenceIds`、服务器回执摘要 | 一个 TestRun 可以有多个 CaseAttempt；接收器在同一事务/追加回执中原子写 caseAttempt 与预期 evidence（证据）集合；父 harness（测试编排器）按冻结计划启动固定 runner 并收集退出码、信号、超时和框架 machine report（机器报告）；子进程伪造 `case_start/assertion/case_end` 事件不得产生 passed。 |
| `EvidenceObject`（证据对象） | 不透明 `evidenceId`、`caseAttemptId`、plan nonce、证据种类/序号、内容寻址摘要、存储 versionId/ETag（版本标识/实体标签）、字节数、白名单 schema（结构）、sanitizer（脱敏器）回执、封存身份、保留/删除状态 | 接收器对不可复用、内容寻址键执行一次性条件写；对象版本化与 WORM（一次写入多次读取）/对象锁是 release 必要条件；只有已验证的独立签名追加账本可替代，否则 profile 不满足且 release=blocked。写入和读取 IAM（身份权限）分离。release 表只存不透明 ID，不存真实 OSS URL（对象存储链接）。 |
| `ReleaseEvidenceSet`（发布证据集） | `releaseId`、精确 commit、manifest/配置摘要、required leaf TC 集、被接受的 CaseAttempt 集、版本、决策回执 | CAS（比较并交换）只用于 release 状态；冻结后不可改写；每次读回均重新验证 attempt → artifact digest/versionId/ETag；缺任一 profile 匹配的 leaf 回执不得 promoted（晋级）。 |

`passed` 只属于某一个 `CaseAttempt`，不能被文档文字、测试文件存在、标准输出或历史绿色日志替代。静态 manifest 没有 `draft/validated/stale` 状态；其有效性由某一 Git 修订下的验证结果推导。没有 OIDC（开放式身份连接）证明、封存存储和隐私隔离前，只允许实现静态 manifest 校验，**不得**实现或接线可供 release（发布）采信的接收器。

## UC-quality-01 · 登记并验证一条规格测试追溯

- **角色 Actor：** 质量工程师、CI（持续集成）运行器、发布控制面。
- **前置 Precondition：** 业务用例含可测验收标准；TC（测试用例）已经命名；仓库有冻结的代码修订。
- **触发 Trigger：** 工程师新增、修改或删除一条 TC，或 CI 验证待发布修订。
- **主流程 Main：**
  1. 工程师在版本化注册表声明 `TestCaseDefinition`，再用 `TestBinding` 的固定 `runnerId + selector` 绑定主实现和辅助实现。
  2. 校验器解析业务用例、测试矩阵和注册表，拒绝未知 TC、未知 UC、重复 ID、无 primary、失效路径、无断言 ID 和不允许的运行器/选择器。
  3. 受信任 CI 身份用 OIDC 向接收器证明其受保护 workflow、仓库、ref、commit 和镜像；接收器先验证签名/有效期/一次性编号并分配 run ID 与仅父 harness 可用的签名能力。父 harness 的不可变摘要与运行租约绑定，子进程无法读取签名能力；harness 收集退出码、信号、超时和框架机器报告，封存 Git、锁文件、fixture（固定测试数据）、依赖、镜像、阈值和工件摘要。
  4. 发布控制面仅收集与当前修订和当前注册表摘要一致、且 `CaseAttempt ↔ EvidenceObject` 原子关系、版本和摘要均可读回的 required TC 回执。
  5. 事实矩阵只引用不透明 evidenceId（证据标识）和明确的范围；真实对象 URI（统一资源标识符）只在受控接收器内部解析，不将回执外推到未覆盖的依赖、容量或模型质量。
- **备选流 Alternate：** 一个 TC 可有多个测试实现；注册表显式列出 primary（主）和 supporting（辅助）绑定，但每个 required leaf TC 必须有一个可执行 primary binding（主绑定）。
- **异常流 Exception：**
  - **E1 重复登记（幂等）：** 相同 manifest 内容重复验证得到相同摘要；同一 `tcId` 的不同定义或重复 primary binding 拒绝。机制：唯一键 + 内容摘要。
  - **E2 并发封存（CAS，比较并交换）：** 两个运行器竞争同一 release 状态时 CAS 恰一个成功；同一 run 的证据对象只能以不可复用内容寻址键条件写一次，失败方回读服务器回执，不得覆盖。机制：release 版本 CAS + 一次性条件写 + 追加审计事件。
  - **E3 伪造/逃逸：** 条目指向不存在测试、仓库外路径、可变远程脚本、失败继续、缺机器报告，测试代码伪造完整 JSON（对象数据格式）事件并 `exit 0`，或把 mock 标成真实依赖，均拒绝且不产生通过回执。机制：schema（结构校验）+ allowlist（允许列表）+ runner/selector 守卫 + OIDC 验签 + 父 harness 封装事件 + 证据类型守卫。
  - **E4 测试失败：** 命令非零退出、结果断言失败、预期/实际事件不符或工件摘要不匹配，回执只能为 `failed`；旧 `passed` 不可覆盖。机制：追加事件日志 + 不可变回执。
  - **E5 依赖降级：** 云端、真实模型或浏览器设备不可用，或者静态 binding 声称 cloud（云端）但接收器观察为 local（本地）、VPC/镜像/CA/模型供应商不匹配时，运行回执为 `blocked` 或 `inconclusive`；本地 fake（假实现）只能证明自身层，不得替代 required 云端/模型 TC。机制：接收器推导 ProfileSatisfaction + 发布门。
  - **E6 超时/断线重连：** 运行器失联、回执上传超时或日志截断，结果为 `inconclusive`；重试创建新 `attempt`，原 attempt 保留。机制：运行租约 + 幂等 run ID + 追加审计事件。
- **后置 Postcondition：** 静态 manifest 仍由当前 Git 修订唯一确定；每次运行新增 `TestRun`、对应的 `CaseAttempt` 与封存 `EvidenceObject`；任一 required leaf TC 无同修订、同 profile 回执，`ReleaseEvidenceSet` 保持 `blocked`。
- **验收 Acceptance：**
  <!-- acceptance: UC-quality-01.acceptance.1 -->
  1. 所有声明为 required 的 leaf TC 恰好有一个 primary binding，且 runner、selector、文件、UC、flow、断言 ID 与覆盖种类都可解析。
  2. 每个**已登记为 required** 的 P0/P1 UC（最高/高优先级用例）的正常、异常、特殊、逃逸、高并发、复杂、刁钻七类均有 leaf TC；未映射、重复、孤儿映射、缺 event 数量均为 `0`。未登记历史 TC 必须显示为 `planned/unmapped`，不能从分母消失。
  3. 修改代码、锁文件、注册表、fixture、依赖/镜像或阈值摘要后，旧回执不得使新 release 通过。
  <!-- acceptance: UC-quality-01.acceptance.4 -->
  4. 错误 issuer/audience/subject/workflow/ref/commit、过期/重放 OIDC、伪 stdout、空机器报告、local 冒充 cloud、错 VPC/镜像/CA/模型供应商均为零 accepted attempt。
  <!-- acceptance: UC-quality-01.acceptance.5 -->
  5. `failed/blocked/inconclusive` 回执永远不能被计作 `passed`；任何尝试均有可定位的原因码。
- **关联：** 测试编写规范；CAS、幂等键、事件日志；`TC-quality-01-main`、`TC-quality-01-E1`、`TC-quality-01-E2`、`TC-quality-01-E3`、`TC-quality-01-E4`、`TC-quality-01-E5`、`TC-quality-01-E6`。
- **七类覆盖：** 正常、异常、特殊（多实现）、逃逸通道、高并发、复杂（多 TC 发布集）、刁钻（断线/摘要漂移）。

## UC-quality-02 · 阻止过度声明与陈旧证据进入发布结论

- **角色 Actor：** 文档维护者、CI、发布审批人、审计者。
- **前置 Precondition：** 事实矩阵或发布文档需要引用某项质量、性能、安全或云端结论。
- **触发 Trigger：** 文档新增“已通过”、修改门槛、代码或依赖版本发生变化、或发起 release（发布）。
- **主流程 Main：**
  1. 文档引用封存 `CaseAttempt` 的稳定 ID、范围、分子/分母、环境与生成时间，而非手填“通过”。
  2. 校验器确认引用 TC 属于冻结证据集、精确 commit/tree/锁文件/注册表/阈值摘要未漂移、运行结果为 `passed`，并且没有超过证据声明的范围。
  3. 文档事实矩阵显示“已验证 / 已接线待验 / 仅设计 / 发布阻断”之一；证据不足时必须选择后 3 类。
  4. 发布审批人以冻结证据集审查必需 TC；不足则 release 保持 `blocked`。
- **备选流 Alternate：** 历史回执可以作为趋势资料，但必须标注 historical（历史）并不能满足当前 release。
- **异常流 Exception：**
  - **E1 重复引用（幂等）：** 同一回执被多页引用允许，但同页冲突结论拒绝。机制：引用唯一键 + 内容摘要。
  - **E2 并发发布（CAS）：** 两个 release 竞争同一 evidence set，只有与冻结摘要相符的版本可晋级。机制：release version CAS。
  - **E3 伪造/逃逸：** 手工日志、空文件、截图、mock、错误环境或过期代码摘要引用为真实 E2E（端到端）证据，校验拒绝。机制：可信运行器身份 + 一次性封存回执 + 环境/摘要匹配。
  - **E4 回执或工件损坏：** 读回摘要不符，结论降为 `inconclusive`，不得沿用旧绿灯。机制：工件内容摘要校验 + 追加事件。
  - **E5 观测依赖不可用：** Langfuse（模型观测服务）或证据桶不可用时，不允许补写伪回执；对应门保持 `blocked`。机制：fail-closed（故障关闭）发布门。
  - **E6 审批/上传中断：** release 记录保留在 `evidence_pending`；恢复时只能重读既有回执或创建新运行，不能臆造结果。机制：幂等键 + 状态机事件。
- **后置 Postcondition：** 结论与可读回的回执一致；无法验证的内容被标记为未验证，不触发流量或高风险自动化。
- **验收 Acceptance：**
  <!-- acceptance: UC-quality-02.acceptance.1 -->
  1. 任何 release 必需 leaf TC 缺少当前代码/tree/锁文件/注册表/阈值摘要匹配、profile（证据配置）匹配且未过期的回执，发布通过数为 `0`。
  <!-- acceptance: UC-quality-02.acceptance.2 -->
  2. 含没有回执的“通过”文字的受管事实页在 CI 失败，或明确标为历史/未验证。
  <!-- acceptance: UC-quality-02.acceptance.3 -->
  3. 伪造回执、工件篡改、空日志和旧代码回执均被拒绝。
- **关联：** `ReleaseEvidenceSet`、云端测试矩阵、事实矩阵、CAS、幂等键、事件日志；`TC-quality-02-main`、`TC-quality-02-E1`、`TC-quality-02-E2`、`TC-quality-02-E3`、`TC-quality-02-E4`、`TC-quality-02-E5`、`TC-quality-02-E6`。
- **七类覆盖：** 正常、异常、特殊（历史趋势）、逃逸通道、高并发、复杂（多门发布）、刁钻（工件/摘要/上传中断）。

## UC-quality-03 · 让复杂变更的 Harness 与专家审计可复核

- **角色 Actor：** 工程师、对抗审计专家、CI（持续集成）、审批人。
- **前置 Precondition：** 待合并修订涉及 L2+ 的代码、规格、测试、数据库、云端或 AI 运行时；任务已拥有任务 ID 与范围声明。
- **触发 Trigger：** 新增或修改受管路径，或把任务状态推进为 `approved_to_implement`、`done`。
- **主流程 Main：**
  1. 工程师在版本化 `governance-audit-index` 写入任务 ID、稳定 scope ID、风险级别、受管路径摘要、Harness 摘要、审计镜头、审阅者声明、审计摘要及其摘要、finding ID、处置状态、复审结论和验证命令；原始推理仍可保留在 `.tmp`。
  2. 校验器只读取当前工作区中索引明确列出的本地文件，只重算每个 scope/risk terminal revision 的 Harness、受管路径与审计记录摘要；历史 revision 只验结构和存储摘要。它确认 L2+ 有审计结论，L3+ 有 ADR（架构决策记录）；记录状态、Harness 授权结论和审计结论必须匹配转换表，`open`（已识别待处置）或 `blocked`（处置受阻）finding 只能伴随任务 `blocked`。它不读取 Git 状态或推断未登记路径的风险级别。
  3. 受信 CI 守卫从 GitHub 事件给出的受保护 base revision 执行 base 版本 guard，将 PR head 的索引和基线作为 Git blob 读取；既有 record、冻结基线和既有 expansion 必须保持原序和原内容，新 record 只能追加为单一 successor。它从该 task ID 首次出现的 Git commit 重算每条路径快照；successor 必须保留 predecessor 的 P0/P1 finding ID、严重度和路径，关闭未闭合 finding 必须有明确处置和 `closureEvidence`。它不安装依赖或执行候选代码。两类检查均仅输出 `static_preflight_valid`，不产生发布证据，也不把审计文字转为运行通过。
  4. 新增或修改 UC/TC（业务/测试用例）时，追溯基线比较未映射 ID 集；历史缺口允许保留，但当前修订不得扩大缺口。若确有新增历史缺口，必须以 revision 大于 1 的 change record 绑定前一基线摘要、精确新增 ID 和扩展理由。
- **备选流 Alternate：** L0/L1 只允许显式 `self_checked` 且必须含跳过理由；一次范围未变化的修订可重用有效审计记录。
- **异常流 Exception：**
  - **E1 重复登记（幂等）：** 相同任务、摘要与 finding 集重放返回同一记录；不同内容使用同一任务 ID 拒绝。机制：唯一键 + 内容摘要。
  - **E2 并发修改（CAS，比较并交换）：** 两个修订竞争同一任务记录时，受信 base 守卫只接受一个追加 successor；revision 大于 1 的记录必须指向同 scope、同风险级别、前一 revision，且 `(scopeId, riskLevel, revision)` 与 predecessor successor 都唯一。机制：受保护 base 比较 + 追加记录。
  - **E3 逃逸：** 将 L2+ 降为 L1、删除 P1 finding、伪造闭合、借用其他任务的摘要、范围变化后复用旧审计，均拒绝。机制：受管路径 allowlist（允许列表）+ 摘要绑定 + finding 状态机。
  - **E4 验证失败：** Harness、ADR、审计字段或验证命令缺失时状态只能为 `blocked`，不得进入 spike、实现或完成态；`blocked` 状态的 Harness 授权和审计结论也必须均为 `blocked`，阻塞 finding 不能伪装成普通 `open`。机制：状态三元组守卫 + 事件日志。
  - **E5 降级：** 无法执行真实运行门时只允许 `static_preflight_valid`，不得写为已发布或已验证。机制：证据等级守卫。
  - **E6 范围漂移：** 受管路径、契约或风险升级后旧审计自动失效，需重新审计。机制：内容摘要 + successor 链。
- **后置 Postcondition：** 每个复杂任务有可定位、可重算的审计摘要和 finding 处置；静态门永远不替代运行回执。
- **验收 Acceptance：**
  <!-- acceptance: UC-quality-03.acceptance.1 -->
  1. 任一 L2+ 受管变更缺少当前摘要匹配的 Harness 与审计记录时 CI 失败；任一 L3+ 缺 ADR 或未处置 P0/P1 finding 时 CI 失败。
  <!-- acceptance: UC-quality-03.acceptance.2 -->
  2. 已冻结未映射基线不得增加；新增/修改的 UC、TC 与 required 集之间的差集为 `0`。
  <!-- acceptance: UC-quality-03.acceptance.3 -->
  3. 重复、并发、路径逃逸、摘要漂移、错误降级和范围变化均不能生成 `done` 或发布证据。
- **关联：** `GovernanceAuditRecord`、`TraceabilityBaseline`、任务 SOP、ADR、CAS、幂等键、事件日志；`TC-quality-03-main`、`TC-quality-03-E1`、`TC-quality-03-E2`、`TC-quality-03-E3`、`TC-quality-03-E4`、`TC-quality-03-E5`、`TC-quality-03-E6`。
- **七类覆盖：** 正常、特殊（L0/L1）、高并发、逃逸通道、异常、复杂（多记录/多 UC）、刁钻（范围漂移）。

## UC-quality-04 · 保持公开成果的原创表述

- **角色 Actor：** 文档维护者、工程师、CI、审计者。
- **前置 Precondition：** 受管文本属于 Git 修订中的产品、架构、需求、测试、脚本、CI 或开发指南；技术术语白名单已版本化。
- **触发 Trigger：** 新增或修改受管文本，或静态检查执行。
- **主流程 Main：**
  1. 校验器从 Git 受管文件集读取文本，不读取 `.tmp`、依赖、构建物或环境变量。
  2. 它拒绝把本项目描述为外部项目的衍生、改编、迁移、照搬或附属的中英文表述，以及外部代码托管项目 URL（统一资源定位符）。
  3. 对安全、产品或运行时结论，文档改用本项目对象、状态机、约束和可验证失败模式陈述；技术术语如“参照系”“schema reference”与业务 citation（引用）不受影响。
  4. 校验器输出固定原因码和文件位置，不回显敏感配置值或未受管文件内容。
- **备选流 Alternate：** 协议、法规或供应商合同所必需的官方资料，仅可进入受控、版本化 allowlist；当前未配置 allowlist 时一律拒绝。
- **异常流 Exception：**
  - **E1 重复扫描（幂等）：** 相同树得到相同违规集合与摘要。机制：内容摘要 + 确定性排序。
  - **E2 并发编辑（CAS）：** 两个编辑产生不同树时各自独立扫描，结果不得互相覆盖。机制：Git tree 摘要。
  - **E3 逃逸：** 中文/英文变体、大小写、YAML（配置语言）、CI、隐藏开发指南、中间符号链接或代码托管 URL 均被发现。机制：受管文件枚举 + 路径边界 + 模式 allowlist。
  - **E4 扫描失败：** 不可读、超限或符号链接路径返回 `blocked`，不能按无违规通过。机制：fail-closed（失败关闭）错误事件。
  - **E5 降级：** 规则无法判定的文字保留为 `needs_review`，不得自动标记原创。机制：人工审计状态机。
  - **E6 刁钻术语：** 合法技术术语、内部对象字段和本项目相对文档链接必须通过，避免以泛化禁词替代语义规则。机制：精确模式 + allowlist 测试夹具。
- **后置 Postcondition：** 受管公开成果不包含外部项目归属或代码托管项目地址；检查结果只属于静态文字治理，不构成产品、云端或质量证据。
- **验收 Acceptance：**
  <!-- acceptance: UC-quality-04.acceptance.1 -->
  1. 中英文项目归属表述、代码托管项目 URL、受管路径逃逸和未登记例外在 CI 中均失败。
  <!-- acceptance: UC-quality-04.acceptance.2 -->
  2. 合法技术术语与本项目内部相对链接通过；检查器不读取环境变量、不联网、不加载被扫描模块。
  <!-- acceptance: UC-quality-04.acceptance.3 -->
  3. 每条拒绝都输出确定性原因码；扫描根缺失、符号链接或读取错误一律 fail-closed。
- **关联：** `PublicTextPolicy`、任务 SOP、路径边界、事件日志；`TC-quality-04-main`、`TC-quality-04-E1`、`TC-quality-04-E2`、`TC-quality-04-E3`、`TC-quality-04-E4`、`TC-quality-04-E5`、`TC-quality-04-E6`。
- **七类覆盖：** 正常、特殊（白名单）、高并发、逃逸通道、异常、复杂（多根/多格式）、刁钻（术语与符号链接）。

## 2. 规范化注册表最小形状

注册表必须是机器可读的 JSON（JavaScript 对象表示法）或 YAML（YAML 配置语言），并分开定义 case（测试用例）、binding（测试绑定）和 profile（证据配置）：

```json
{
  "requiredLeafTcIds": ["TC-quality-01-E3"],
  "cases": [{
    "tcId": "TC-quality-01-E3",
    "ucIds": ["UC-quality-01"],
    "flowRef": "E3",
    "lifecycle": "leaf",
    "coverageKinds": ["escape"],
    "acceptanceRefs": ["UC-quality-01.acceptance.1"],
    "invariants": ["allowlist", "event-log"],
    "risk": "P0",
    "requiredProfiles": ["pr-local"]
  }],
  "bindings": [{
    "bindingId": "quality-01-e3-primary",
    "tcId": "TC-quality-01-E3",
    "role": "primary",
    "runnerId": "node-traceability-proof",
    "selector": { "caseId": "TC-quality-01-E3" },
    "sourceFiles": [
      "scripts/quality-traceability-check.mjs",
      "scripts/quality-traceability.proof.mjs"
    ],
    "coveredSourceGlobs": ["scripts/quality-traceability-*.mjs"],
    "fixtureDigests": [],
    "requiredEnvironmentClass": "local-deterministic",
    "assertionIds": ["reject-untrusted-binding"]
  }],
  "profiles": [{
    "profileId": "pr-local",
    "attestationConstraints": { "runnerClass": "unattested-static", "environmentClass": "local-deterministic" },
    "minimumSamples": 1,
    "minimumConsecutiveRuns": 1,
    "maxEvidenceAgeHours": 24,
    "thresholdPath": "ai-docs/testing/traceability-thresholds.json",
    "thresholdDigest": "sha256:<64-lowercase-hex>"
  }]
}
```

`requiredEnvironmentClass` 必须枚举为 `local-deterministic`（本地确定性）、`browser`（浏览器）、`real-model`（真实模型）、`cloud`（真实云端）或 `manual`（人工）。它只描述 binding 要求；后四类是否真正满足只能由接收器依据 attestation（证明）得出。`requiredProfiles` 中的每个 profile 必须定义 attestation 约束、最小样本数、连续运行次数、最大证据年龄和受限 `thresholdPath`；校验器读取该文件并重算 SHA-256，格式正确但内容不匹配同样失败。

## 3. 可信证明、封存与隐私边界

可采信接收器必须先验证 `RunnerAttestation`，验证规则固定在服务器 allowlist（允许列表）而不是请求 body（请求正文）：

1. OIDC 签名和 issuer/audience/subject 必须匹配；密钥轮换只接受受信任 JWKS（JSON Web Key Set，JSON 网络密钥集）。
2. repository（仓库）、受保护 workflow、受保护 ref、exact commit/tree、镜像摘要与冻结执行计划必须同时匹配；fork、任意 PR（合并请求）工作流、过期 `exp`、未生效 `nbf` 和已消费 `jti` 均拒绝。
3. 接收器只向已验证身份颁发一次 run lease（运行租约）；harness 以该 lease 启动固定 runner，子进程 stdout/stderr（标准错误）只进入短期隔离诊断区，不能成为 case 结果来源。
4. harness 对固定框架机器报告、退出码、信号、超时和计划内 assertion（断言）集合生成签名 envelope（信封）；缺失、重复、越界或自报事件一律 `inconclusive`。

封存对象使用 `content/<sha256>/<random-nonce>` 这类不可复用键，并同时记录内容摘要、存储 `versionId`/ETag。接收器执行条件写后立刻读回，并在一个原子服务器回执中绑定 `caseAttemptId + plan nonce + evidence kind/ordinal + evidenceId + digest + versionId/ETag`；同一 run 内不得把一个合法 case 工件替给另一个 case，也不得向已封存 attempt 追加第二份同序号工件。对象存储启用版本化和 WORM（一次写入多次读取）/对象锁；能力不足时，**只有**独立签名、不可改追加账本已验证且对象摘要/version 仍可读回才可替代，否则 ProfileSatisfaction（配置满足证明）=false 且 release=blocked。写入角色不得读取 release（发布）决策，读取角色不得覆盖/删除对象。release 验证逐项重读 `CaseAttempt → EvidenceObject` 版本和摘要；真实桶地址只保留在受控服务内部，所有日志、数据库、指标和 release 回执只保存不透明 `evidenceId`。

封存前使用字段白名单 schema、确定性 sanitizer（脱敏器）和敏感信息扫描：prompt（提示词）、回答、简历、音频、截图、trace（追踪）、端点和账号只能在有授权时进入加密、最小权限、短保留的 raw quarantine（原始隔离区），绝不进入 release 证据。**token（令牌）、OIDC JWT（JSON 网络令牌）、数据库密码、私钥和其他密钥必须在 sanitizer 阶段不可逆删除；命中即 drop+blocked，禁止进入任何隔离区或持久化介质。**扫描不确定、脱敏失败、证据桶不可用或 raw quarantine 不可写均为 `inconclusive/blocked`，不得回退到 CI artifact（持续集成工件）、PR 评论或本地文件。每种授权数据类有 TTL（生存时间）/删除任务与回执、访问审计、RLS（行级安全）；break-glass（紧急访问）要求审批人≠发起人、最短时限和不可改审计。

## 4. 当前迁移原则

现有仓库有大量未编号 proof（证明脚本）和规格 TC。迁移必须分批进行：

1. 先登记能确定映射的 high-risk（高风险） leaf TC；无法映射的显式标为 `unmapped/planned`，不能猜测绑定或从分母删除。
2. 云端矩阵的 4 个 group 只作汇总，`main/E1–E6` 的 28 个 leaf 才是可执行分母；全部保持 `blocked`，直到真实云封存回执存在。
3. 新增或修改 UC/TC 时，CI 同时检查注册表；`requiredLeafTcIds` 是当前机器可读的 required 唯一事实源，新增 required TC 未登记为 leaf + primary binding 一律失败。未进入该集合的历史 TC 只能明确显示为 `planned/unmapped`，不能计为已验证或发布分母。
4. 历史文档数字没有原始、摘要可读的回执时，迁入 `historical/unverified`，不能作为当前发布证据。
5. 直到 required 覆盖率、运行回执和审计完整性均为 100%，本能力不允许把全仓测试覆盖称为完成。

## 5. 首批静态校验与待实现的受信任运行

以下 14 个均为 leaf TC。当前仓库只实现了它们的**静态注册表前置校验**（UC/TC 引用、唯一 primary、固定 runner/selector、仓库内文件、profile 声明和七类覆盖）；它既不运行业务测试，也不接受任何 `passed`，更不覆盖下表中标明“受信任运行器”的部分。后者必须等独立接收器按第 3 节落地后才可执行并封存回执。

| TC | 当前静态校验 | 仍待受信任运行器实现 |
| --- | --- | --- |
| `TC-quality-01-main` | 合法 case、binding 与 profile 可解析；primary 恰 1。 | Git 修订绑定、受保护 CI 身份与封存回执。 |
| `TC-quality-01-E1` | 重复 TC/primary binding 拒绝。 | 内容摘要幂等与接收器回读。 |
| `TC-quality-01-E2` | 重复 primary binding 拒绝。 | release CAS winner（唯一胜者）=1；相同封存键条件写恰 1 次。 |
| `TC-quality-01-E3` | 自由 shell、远程脚本、仓库外路径和非允许 runner/selector 拒绝。 | 缺机器报告、伪 stdout/`exit 0`、错误/重放 OIDC、子进程签名能力盗用拒绝。 |
| `TC-quality-01-E4` | 空 assertion（断言）ID 拒绝。 | 非零退出、少断言、摘要不符均不是 passed。 |
| `TC-quality-01-E5` | 静态 local/cloud profile 声明错配拒绝。 | local 冒充 cloud、错 VPC/镜像/CA/模型供应商、无 DataPlaneAttestation 拒绝。 |
| `TC-quality-01-E6` | 仓库外路径（含符号链接）拒绝。 | 上传中断为 inconclusive；新 attempt 不覆盖旧 attempt。 |
| `TC-quality-02-main` | 已映射 leaf 的数量和孤儿映射可盘点。 | 同修订、同 profile、同摘要的封存回执可只读验证。 |
| `TC-quality-02-E1` | 文档 TC 集合去重且 group/leaf 分母可算。 | 同页冲突引用拒绝。 |
| `TC-quality-02-E2` | 重复 primary binding 拒绝。 | release CAS 胜者=1。 |
| `TC-quality-02-E3` | 未知 UC（业务用例）引用拒绝。 | 空日志、完整伪 stdout、错误 runner/环境/commit/OIDC 拒绝。 |
| `TC-quality-02-E4` | 孤儿 manifest case 与未映射文档 TC 都被报出。 | 工件覆盖、删除、跨 case 替换、摘要篡改降为 inconclusive。 |
| `TC-quality-02-E5` | 未定义 profile 拒绝。 | 接收器、敏感信息扫描或隔离区不可用时 release 保持 blocked；密钥命中 drop+blocked。 |
| `TC-quality-02-E6` | 新增文档 TC 必须显式显示为 unmapped。 | 审批中断进入 evidence_pending，不臆造结果。 |
