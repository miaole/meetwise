---
id: uc_model_invocation_reliability
name: 模型调用可靠性与未知结果对账
description: 模型供应商调用的准入、持久领取、半开熔断、未知结果冻结与人工对账用例。
type: requirement
scope: shared
level: must
status: active
owner: architecture
---

# 模型调用可靠性与未知结果对账

## UC-MODEL-001 · 受限模型调用不重复派发且有可恢复终态

- **角色 Actor：** C 端候选人、B 端招聘方、Worker（后台进程）、模型供应商、对账 Worker。
- **前置 Precondition：** 请求具有服务端生成的幂等键与输入摘要；调用运行在 principal（主体）范围；生产环境的可计费文本模型已配置费用策略。`prepare`（预派发准备）只能选路，不能发网络请求。
- **触发 Trigger：** 图节点或异步任务请求一次模型能力。
- **主流程 Main：**
  1. 调用方获得本地准入：并发容量、每分钟请求上限（RPM）和熔断器都在持久 `dispatching`（已派发）之前。
  2. `ai_model_invocation` 以 `(owner,idempotencyKey)` 的唯一键领取，并在领取时绑定 `cost_scope_id`（费用预算范围）；同键成功只回放安全输出，未知结果不重发。
  3. 准入成功后，在短事务中依次写模型调用与费用的 `dispatching`；再在事务外向供应商发送一次请求。
  4. 供应商响应经过结构校验与业务校验；成功、明确未执行的拒绝，或未知结果分别落为显式终态。
  5. 已派发后超时、连接中断或终态事务失败时，不重新向供应商发送；对账 Worker 只在对账窗口大于执行时限加终态化宽限时启动，将陈旧 `dispatching` 原子标为 `unknown`（未知），并冻结绑定 scope（范围）的同键费用，交人工账单/业务对账。
- **备选流 Alternate：** 发送前已知主端点熔断或拒绝服务时，才可选择已知健康的备用端点；已派发后的 429（请求过多）、5xx（服务端错误）或超时不得同键切换备用端点。
- **异常流 Exception：**
  - **E1 重复请求：** 相同 owner、幂等键和输入摘要命中领取记录；只回放已有安全结果或返回既有 `unknown`，供应商调用数增量为 `0`。机制：唯一键 + 持久状态机。
  - **E2 并发冲突：** 同一端点熔断冷却期只允许一个半开探针取得本进程 lease（租约）；跟随者在派发前重新执行一次纯选路，存在同 scope（范围）备用端点时改走备用端点，否则明确拒绝，主端点供应商调用数增量为 `0`。机制：半开 CAS（比较并交换）式 lease + 一次纯选路；该 lease 仅限进程内，不冒充跨副本全局限流。
  - **E3 越权：** 主体 A 无法读取、领取或终态化主体 B 的调用/费用记录。机制：RLS（行级安全）与 `asPrincipal`。
  - **E4 终态写入失败：** 外部请求已可能计费，数据库临时不可用；记录保持 `dispatching`，到达有界陈旧阈值后由对账 Worker 以条件更新成为 `unknown`，绝不释放或自动重发。每一笔对账按持久 `cost_scope_id` 精确冻结，缺失配对费用会回滚并使 worker 未就绪，不允许假报成功。机制：`status='dispatching'` 条件更新 + 费用账本原子冻结。
  - **E5 依赖降级：** 熔断打开、无健康端点或预算不足时，在派发前停止；出题走确定性降级，评分写 `unscored`（未评分），不伪造数值成绩。机制：熔断状态机、费用预留、业务事件账本。
  - **E6 超时/断线：** `prepare`、准入和 HTTP 传输收到 AbortSignal（中断信号）；准入前超时=确定未发送，已派发超时=`unknown`。迟到成功不得写成功工件、trace（追踪）或覆盖未知终态。机制：AbortSignal、持久状态机、幂等键。
- **后置 Postcondition：** 每个调用处于 `succeeded`、`failed` 或 `unknown`；`claimed` 仅在未发送租约期内可接管，`dispatching` 不可自动重发。费用与模型调用在已派发异常时都可审计且冻结。
- **验收 Acceptance：** 同键并发供应商派发数 `=1`（follower 只 `wait`/`cached`/`failed`/`unknown`，不得因孤儿 permit 或无行冲突而第二次 `execute`）；半开并发仅 `1` 个主端点探针进入供应商，配置备用端点的 follower（跟随者）派发数 `=1` 且两条幂等键均成功；准入超时调用/费用预留 `=0`；迟到成功后的成功工件/trace `=0`；危险“执行时限 ≥ 对账窗口−宽限”配置启动失败；对账后陈旧 `dispatching` 数 `=0` 且同键二次外呼 `=0`；跨 scope 同键的无关费用状态不变；跨主体读取/更新 `=0` 行；对账基础设施连续失败使 worker 就绪状态为 `false`。
- **关联：** `packages/ai-runtime/src/invoke.ts`、`circuit-breaker.ts`、`rate-limit-model.ts`、`packages/db/src/model-invocation.ts`；状态机 `claimed → dispatching → succeeded|failed|unknown`；原语为 CAS、幂等键、RLS、持久事件/审计账本。
- **七类覆盖：** 正常、异常、特殊（可计费/非可计费）、逃逸通道（降级/人工对账）、高并发、复杂（供应商与两个账本）、刁钻（迟到成功、半开并发、终态库故障）均覆盖。

### 测试用例

- `TC-MODEL-001-main` · 隔离 PostgreSQL（关系型数据库）集成：成功调用的调用/费用终态一致。
- `TC-MODEL-001-E1` · 隔离 PostgreSQL 集成：同键双并发仅一次供应商派发并回放相同结果。
- `TC-MODEL-001-E2` · 隔离 PostgreSQL（关系型数据库）集成：两个请求先完成半开纯选路时，恰一条主端点探针外呼，另一条在派发前重选同 scope backup（备用端点）；两条持久幂等键均成功。
- `TC-MODEL-001-E3` · 隔离 PostgreSQL 集成：跨主体调用记录查询/更新均为 `0` 行或被拒绝。
- `TC-MODEL-001-E4` · 隔离 PostgreSQL 集成：注入终态事务失败，陈旧记录由对账转 `unknown`，只冻结持久绑定 scope 的费用，重放零外呼；费用配对缺失时整笔回滚并向 drain loop（排空循环）传播失败。
- `TC-MODEL-001-E5` · 确定性运行时：熔断打开/预算拒绝不外呼，评分业务映射为 `unscored`。
- `TC-MODEL-001-E6` · 隔离 PostgreSQL 集成：准入超时零外呼，已派发超时与迟到成功不覆写 `unknown`。

## 当前实现边界

- `TC-MODEL-001-E1/E6` 已由 `pnpm runtime:isolated:prove` 与 `pnpm model-cost:isolated:prove` 覆盖；它们不证明供应商已取消计费。`0127` 把同键 claim 创建串到短事务 advisory lock 上，无 invocation 行时只 `wait`（清孤儿 permit），不二次 execute。不改 `0126`。
- 熔断、并发和 RPM 目前均是进程内控制，尚非跨 API/Worker 副本的全局限流；云 Redis/Tair（内存键值服务）数据面验证完成前，不能把它表述为生产容量保证。
- OCR（光学字符识别）仍有单独的 API 同步调用路径；其完整费用治理和跨副本保护必须单独通过本用例的验收，不得因文本模型通过而默认已通过。

## UC-MODEL-002 · 唯一模型网络出口与可验证外发收据（目标态，未实现）

- **角色：** API（应用程序接口）服务、Worker（后台进程）、模型网关、模型供应商、隐私删除 Worker、对账 Worker。
- **前置：** 模型网关是独立进程和私网 workload（工作负载），持有唯一的供应商 API key（密钥）和 `model_gateway_executor`（模型网关执行器）数据库登录；API/Worker 不持有供应商 key，亦不拥有该数据库角色。网关与调用方以 mTLS（双向传输层安全）认证，且调用方只能发送预定义的业务 command（命令），不能转发任意 prompt（提示词）。mTLS workload identity（工作负载身份）只证明“哪个服务在调用”，不能证明它代表哪个候选人或组织；主体授权必须由独立 `AuthorizationSnapshot`（授权快照）提供。

### 实现前不可省略的信任、状态和出口契约

| 对象 / 契约 | 最小字段和不变量 |
| --- | --- |
| `AuthorizationSnapshot`（授权快照） | 只可由单一、受签名身份保护的签发 procedure（存储过程）创建；冻结 issuer workload、actor、tenant/org（租户/组织）、data subject（数据主体）、业务对象及版本、consent/share-grant revision（同意/共享授权版本）、privacy epoch（隐私世代）、operation（操作）、cost scope（费用范围）与过期时间。Gateway claim（领取）与撤权/删除必须在同一 subject/object CAS（比较并交换）版本或锁上判断；绝不信 RPC（远程过程调用）正文的 owner/tenant，绝不以可写 GUC（会话配置）为授权根。 |
| operation registry（操作登记册） | 所有可达供应商出口必须先登记并由网关 allowlist（允许清单）执行：chat、vision/OCR（视觉/光学字符识别）、ASR（自动语音识别）、stream-ASR（流式识别）、TTS（文本转语音）、stream-TTS（流式合成）、embedding build/query（嵌入构建/查询）、rerank（重排序）、provider signed-download（供应商签名下载）。每项冻结 issuer class（签发者类别）、typed renderer（类型化渲染器）、允许读取的表/对象及 authorization snapshot predicate（授权快照谓词）、输入/输出/媒体上限、citation contract（引用契约）、owner、数据类别、区域、meter type（计量类型）、max units（最大单位）、price revision（价格版本）、provider contract（供应商合同）、删除能力与迁移状态。未登记调用使 production（生产）启动失败。 |
| `model_command_request_outbox`（模型命令请求外发箱） | 业务事务原子写入的待外发命令意图，状态只能为 `pending → claimed → consumed / expired / voided`，含 encrypted JWS（加密 JSON 网页签名）、`logical_request_key`（逻辑请求键）、不可变请求绑定、业务对象/version、privacy epoch、issuer/outbox idempotency key（签发者/外发箱幂等键）。`logical_request_key=(issuer, stable_job_or_run_generation, node, canonical_binding_digest, business_revision)` 全局唯一；`current_lease` 仅用于调用者授权围栏，绝不进入去重键。相同逻辑键只返回既有 outbox（包括 `dispatching/unknown/succeeded`）；仅旧行 `known_not_sent/expired/voided` 且当前授权、隐私和绑定版本仍有效时，受锁的 `issuance_sequence` 才能建 successor（后继），并记录 `supersedes_outbox_id`。网关只消费已提交 outbox，绝不消费 RPC 中的任意内容。 |
| `command_request_binding`（命令请求绑定） / `command_input_binding`（命令输入绑定） | 业务事务必须先写不可变、加密的 canonical typed binding（规范类型化绑定）：operation schema（操作模式）版本、业务对象/工件 ID + version + digest（标识/版本/摘要）、允许 scalar（受限标量）、业务结果 target（目标）与 canonical digest（规范摘要）。Gateway（网关）重算摘要后才能派生本地 `command_input_binding` 并渲染；不得读取“最新对象”替代已冻结版本。禁止 raw prompt（原始提示词）、provider URL（供应商地址）、image URL（图片地址）、audio URL（音频地址）及未知字段；缺少引用、摘要不匹配、跨主体、过长输入均为 `denied`（拒绝）且供应商请求数为 `0`。 |
| `model_gateway_command`（模型网关命令）与 attempt（尝试） | **一条语义外发动作 = 一条 outbox = 一条 command = 一条 attempt，`max_attempts=1`，禁止 child ordinal（子序号）。** 多步业务由 orchestrator（编排器）显式签发多条 outbox，各有费用/删除收据。attempt 是唯一状态真源，command 只保存不可变计划与 attempt ID；其幂等键仅由服务器派生 `gw:<outbox-id>`，不允许用户提供。 |
| attempt（尝试）状态机 | `issued → claimed → prepared → dispatching → succeeded / failed / known_not_sent / unknown`。同一短事务必须完成 outbox CAS、authorization snapshot/隐私 fence、input evidence、费用/客户权益预留、`ai_model_invocation=dispatching` 与 attempt=dispatching；事务提交后才能写 socket（套接字）首字节。`prepared/claimed` 过期只能 `known_not_sent`；`dispatching`、响应丢失、结算失败只能 `unknown`，永不自动重发。 |
| stream session（流式会话） | stream-ASR/stream-TTS 必须另有 `gateway_stream_session(attempt_id, session_nonce_hash, protocol_version, max_bytes, max_duration, max_frames, state, started_at, ended_at)`。浏览器只经 same-origin API（同源 API）代理到网关；每帧受大小、时长、并发和背压限制，session nonce（会话随机数）不可用于第二条流。provider task start / 第一 socket 写之前失败=`known_not_sent`，其后断线/抢话/barge-in（用户抢话）/WS close（网络套接字关闭）=`unknown`，只有供应商 task-cancel（任务取消）与 billing（计费）合同明确且有回执时才可成为受控 cancel（取消）/释放；否则绝不重试或释放。费用、删除和外部定位器都绑定同一 attempt。 |
| input/dispatch/output evidence（输入/派发/输出证据） | immutable input receipt 只冻结 attempt ID、operation schema version（操作模式版本）、prompt/version hash（提示词/版本散列）、renderer policy version（渲染策略版本）、provider/model/region/endpoint policy version（供应商/模型/区域/端点策略版本）、真实请求字节 SHA-256+长度、工件祖先链/片段摘要、数据类别和 key version（密钥版本）。append-only dispatch evidence（追加写派发证据）才记录 dispatch time（派发时间）、可用的 provider request ID 和传输元数据；output receipt 只在成功结构/业务校验后追加 output digest（输出摘要）和已验证引用。没有供应商签名/账单 API 时名称必须是 `gateway-local dispatch evidence`（网关本地派发证据），不是供应商可验证回执。 |
| 费用 / 权益 | registry 指定 `input/output token`、`image/page`、`audio-second`、`TTS character/audio-second`、`rerank document` 等 meter type。派发事务只写**本地** `provider_cost_reservation_ledger`（供应商成本预留账本）、price revision（价格版本）、客户权益/订单引用与供应商幂等键；不得在数据库事务中调用供应商真实预扣。真实 provider billing/hold（供应商计费/预扣）只能在已提交 attempt 后发生，以供应商幂等键及 `unknown/freeze`（未知/冻结）对账；只有明确未发送才释放，已派发均冻结。 |
| 删除 | 每个 attempt 以 `attempt_id + payload_key_id + subject + privacy_epoch` 关联 input/output payload、OCR image（图片）、ASR audio（音频）、TTS 下载对象、embedding/rerank query/candidate（查询/候选）、成功 domain artifact（领域工件）、graph projection（图投影）、outbox（外发箱）和 trace redacted locator（脱敏追踪定位器）。删除 procedure 先按 `subject + privacy_epoch` 加锁，void（作废）未 claim 的 outbox、request binding、snapshot 和未消费 result outbox，再按 attempt 枚举 target（删除目标）；consumer 的 CAS（比较并交换）事务内必须重查当前 privacy epoch（隐私世代）、撤权版本和 tombstone（墓碑），围栏已赢则写 `voided_privacy_fenced` 而不得写领域事实。本地只保留不可逆摘要。派发先赢时本地做 payload envelope-key crypto-erasure（有效载荷信封密钥加密擦除），外部只能 `pending_external`（外部处理未完成）/`retention_pending`（保留待确认）；不得把本地删除报告为全链删除。 |
| 对账 / 删除职责 | reconciler（对账器）运行在网关进程或只调用 gateway fixed executor procedure（网关固定执行器过程）；普通 Worker 失去 `ai_model_invocation` / 费用账本的写权限。privacy worker（隐私删除进程）只能给网关提交受限 `provider_erasure_target_id`，不持有供应商 key/locator（密钥/定位器）。旧 `dispatching/unknown` 只读迁移到网关对账，不自动转成功或重发。 |
| 业务结果绑定 | attempt 终态、费用/权益结算、output receipt（如有）与 `model_result_outbox`（模型结果外发箱）必须在**同一事务**提交，且 `UNIQUE(attempt_id,result_kind)`；事务崩溃后由 attempt/receipt 重放同一条 outbox，不能丢失补偿信号。签发时冻结 `target_type/id/version/allowed_projection_kind`（目标类型/标识/版本/允许投影类别），默认 `model_result_application(outbox_id PRIMARY KEY)`；若确需 fan-out（扇出），签发时创建不可变 manifest entry（清单项），并唯一 `(outbox_id,entry_id)`。业务 owner consumer（业务所有者消费者）仅能按该冻结目标 CAS exactly-once（精确一次）消费：成功 receipt 才能绑定 question/report/score/OCR/voice 领域投影；unknown/known_not_sent 映射 `unscored`（未评分）或新的 command revision（命令修订），不得在 graph resume（图恢复）中直连重发。 |
| 部署 | Gateway 使用独立数据库登录、独立 secret（密钥）、唯一 provider egress（供应商出站）网络身份和固定 FQDN（完全限定域名）/TLS allowlist。API/Worker production 启动拒绝 provider key/base URL/backup URL 与 gateway executor membership。云端用 NetworkPolicy（网络策略）/egress proxy（出站代理）和 FQDN+TLS 证明强制；grep（文本扫描）或 compose（容器编排）测试不能代替。provider CDN（内容分发网络）signed URL（签名地址）只可为 registry 中 provider-versioned endpoint/CDN FQDN allowlist 的逐跳 HTTPS（安全传输）地址，并强制 DNS/peer private-range（私有地址段）拒绝、响应大小/Content-Type（内容类型）/redirect 次数上限、签名过期与 attempt binding（尝试绑定）；其他跨域、回环、链路本地、内网地址一律拒绝。 |

浏览器不直接连接模型网关：固定路径为 **browser → same-origin API（同源 API）→ mTLS gateway（双向传输层安全网关）→ provider（供应商）**。浏览器 API 先完成会话/同源/CSRF（跨站请求伪造）/速率限制校验，再仅代理已签发 `gateway_stream_session` 的受限二进制帧；浏览器永远看不到网关、供应商 endpoint（端点）或 capability（能力令牌）。

`AuthorizationSnapshot` 的签发根和持久化模型固定如下：认证 API（而不是 Worker）在 `PrincipalGuard`（主体守卫）验签、账户状态/密码代次验证和业务授权检查后，用只驻留在 API/KMS（密钥管理服务）的 Ed25519 私钥签发短时 JWS（JSON Web Signature，JSON 网页签名）。JWS 必须有固定 `iss=meetwise-authz-v1`、`aud=meetwise-model-gateway`、`kid`、`jti`、`iat`、`nbf`、最大 `exp-iat=60s`，以及 actor/subject/object/version/grant/privacy/operation/cost claims（声明）。在与业务 parent/job/projection 的**同一个数据库事务**中，API 同时写 `command_request_binding` 与 `model_command_request_outbox`（保存 encrypted JWS、JWS digest、binding digest、payload_key_id、subject/epoch、`logical_request_key` 与唯一 outbox idempotency key）；网关绝不能在这个事务提交前派发。一个 `jti` 只能写一个 outbox；JTI 的唯一约束随失败事务回滚，提交后不得复用。JWS 只授权 outbox claim 的短窗口：claim 时原子验证 `exp`；过期 outbox 必须写 `expired/known_not_sent`，不建 attempt、不外发。JWKS（JSON Web Key Set，JSON 网页密钥集）恢复后，只有旧行已终态、当前授权/隐私/绑定仍有效时，授权 API 才能为相同 `logical_request_key` 创建受锁 successor revision；旧/新并发只能有一个有效 successor。

网关 scheduler（调度器）只领取已经提交且未过期的 outbox；它验签后在一个事务内 `verify-or-create authorization_snapshot`（验证或创建授权快照，保存加密 compact JWS 或 canonical claims、`jti` 唯一键、`payload_key_id`、subject/epoch）→ 对 `command_request_binding` 重新哈希和对象版本校验 → immutable `command_input_binding`（不可变命令输入绑定）→ command/attempt（命令/尝试），并以 command/outbox/snapshot 三重外键绑定。异步 Worker/Graph（后台进程/图）绝不持有 capability：若它需要新的动态调用，只能以 mTLS 调 internal authorization API（内部授权 API），传 `job_id + current_lease + node + input_digest + issuance_attempt`；其中 `current_lease` 只证明调用者当前有权请求，授权 API 必须以稳定的 `logical_request_key` 查找/创建同一 outbox，不能因 lease 改变另造 outbox。Gateway 以 `model_result_outbox` 返回终态，业务 owner consumer（业务所有者消费者）CAS 消费后才完成题目、评分或报告投影。这样 RPC 响应丢失、graph resume（图恢复）和任一提交点崩溃都只能重放同一 outbox/结果，不能早派发或另造成功业务事实。

Gateway 只使用 KMS/配置注入的轮换 JWKS（JSON Web Key Set，JSON 网页密钥集）公钥验签；未知 `kid`、JWKS 不可达或过期均使新 outbox claim fail-closed（失败关闭），绝不公网临时抓取。随后 `claim_and_render_command` 以 SECURITY DEFINER（定义者权限）读取账户、对象、membership/share-grant（成员关系/共享授权）、privacy epoch 和费用范围的**当前**版本再比较 claims。API 签名快照仅是可验证调用者意图，数据库 claim 是最后授权判定；二者均不读取 `app.principal_user`。JWS 私钥、供应商 key 和 gateway 数据库登录三者必须在不同 secret scope（密钥范围）中，且轮换时新/旧 `kid` 只在受控重叠窗口并存。

支持的 issuer class（签发者类别）矩阵固定为：`api-user`（API 的 KMS 私钥；仅当前用户/招聘方经 HTTP 授权可发的 operation）；`qbank-control-system`（qbank 控制 workload 以 mTLS 调 internal authorization API（内部授权 API），API 验证固定 SPIFFE/SAN（安全生产身份框架/主题备用名称）和 generation manifest（世代清单）后用其自身 KMS key 签发，仅 `qbank_embedding_build`）；`privacy-erasure-system`（privacy workload 以 mTLS 调 internal authorization API，API 复核 deletion request（删除请求）后只签 provider erasure/retention operation）；`online-judge-system`（online judge scheduler（在线评测调度器）以 mTLS 调 internal authorization API，API 复核固定 dataset revision（数据集版本）和 10% 配额后只签 judge operation）。任何 Worker 都不能持有 API JWS key 或直接签 system command；每个 issuer 的 JWS `kid`、mTLS identity、允许 operation、绑定对象和数据库最终谓词必须在 registry 中一一对应。
- **主流程：**
  1. 受限签发 procedure 在业务 parent/job/projection 的同一事务内，基于 `AuthorizationSnapshot`（授权快照）和 operation schema（操作模式）写一条 `command_request_binding` 与一条 `model_command_request_outbox`；主体、用途、业务 object（对象）/版本、operation registry 版本、费用 scope（范围）、隐私 epoch（世代）、过期时间、encrypted JWS（加密 JSON 网页签名）、binding digest、稳定 `logical_request_key` 和业务 target 一并固定。API 以 CSPRNG（密码学安全随机数生成器）生成至少 256 bit 的 outbox idempotency token（外发箱幂等令牌），仅保存 SHA-256（安全散列）并不进入 URL query（查询参数）、错误、日志、指标标签或 checkpoint。
  2. Gateway scheduler（网关调度器）以 mTLS workload identity（工作负载身份）领取**已提交且未过期** outbox；固定 procedure 重算 binding digest、从冻结 object/version 取数，并在同一个 subject/object CAS（比较并交换）版本下验证 snapshot/对象读取 predicate（快照/对象读取谓词）后创建唯一 command/attempt。任何 raw text（原始文本）、image/audio/provider URL（图片/音频/供应商地址）、未知字段、未绑定对象、跨主体对象、过长输入均为派发前拒绝，供应商请求数为 `0`。
  3. 网关自行渲染模型请求、执行 RAG（检索增强生成）可见性检查，并在一次短事务中创建 input receipt（输入收据）、本地 provider-cost reservation ledger（供应商成本预留账本）、客户权益预留、`ai_model_invocation` 和 `gateway_attempt=dispatching`。网络 I/O（输入输出）与任何供应商真实计费始终在事务外。
  4. 网关是唯一供应商 egress（出站）点。成功响应经结构/业务校验后，在**同一结算事务**追加不可变 output receipt（输出收据）、收口模型调用/客户权益/费用，并 `INSERT model_result_outbox UNIQUE(attempt_id,result_kind)`。仅 operation registry 的 `citation_contract != none`（引用契约不为无）的 text/vision（文本/视觉）输出才执行“模型声明引用是实际 rendered evidence（已渲染证据）的子集”校验；ASR/TTS/embedding/rerank（识别/合成/嵌入/重排序）只记录 evidence binding/digest（证据绑定/摘要），不得伪造 citation（引用）。
  5. 题目投影、评分、报告、OCR、ASR（自动语音识别）和 TTS（文本转语音）的业务 owner consumer 以 result outbox 的冻结 target/manifest entry（目标/清单项）和同事务 privacy/revocation fence（隐私/撤权围栏）CAS 绑定事实；围栏已赢时只写 `voided_privacy_fenced`，调用方不得自行再调供应商。QBank embedding build 只能由 `qbank_control_executor`（题库控制执行器）类的 system issuer（系统签发者）签发，并冻结 recipe/generation/source epoch（配方/世代/来源世代）与 approved-source manifest（已批准来源清单）；query embedding/rerank 只可由请求授权快照 + active generation/ACL evidence binding（活动世代/访问控制列表证据绑定）签发。Gateway 没有 qbank 原表的泛化读取权限。
- **异常流：**
  - **E1 重放：** L1（旧租约）已提交 outbox 但 RPC 响应丢失，L2（新租约）或 20 个 graph resume（图恢复）必须以相同 `logical_request_key` 读回同一 outbox；outbox 数、派发数和费用预留数均为 `1`。同 outbox idempotency key（外发箱幂等键）只回放安全结果或返回 `unknown`（未知），供应商调用增量 `0`。
  - **E2 并发/过期：** 同 outbox 的 20 个并发 claim（领取）恰一成功；JWS 超过 60 秒、JWKS 短故障恢复、旧/新 successor 并发时，旧 outbox 只能 `expired/known_not_sent`，不建 attempt、不外发；受锁 successor 恰一条。多步骤业务的每条 outbox 各有费用/删除收据，不能执行时动态追加 child attempt（子尝试）。机制：数据库唯一键 + CAS。
  - **E3 旁路：** operation registry 覆盖 chat、OCR、ASR、流式语音、TTS、embedding、rerank、签名下载等每一条可达出口；API/Worker 环境缺供应商 key/base URL/backup URL，启动校验、镜像 scan（扫描）和强制网络策略均拒绝直连。只部署一个 database role（数据库角色）不能代替该网络隔离。
  - **E4 断线/崩溃：** `claimed/prepared` 过期可能从未发送，必须收口为 `known_not_sent`（确认未发送）；`dispatching/unknown` 可以没有业务题目，仍进入成本、对账和删除账本；socket 首字节后不得自动重发或补造成功业务结果。
  - **E5 隐私/撤权：** 删除或 B 端撤权先赢时，未 claim outbox/binding/snapshot/result outbox 必须 void，command/receipt 派发前拒绝；`claimed/prepared`、供应商成功待结果消费、`unknown` 对账四种竞态均不得投影领域事实。派发先赢时按 attempt 建 provider deletion/retention target（供应商删除/保留目标），没有供应商合同只能 `retention_pending`，不得将本地物理删除误报为全链删除。流式会话在删除/撤权后必须每帧或最多 N 秒 heartbeat（心跳）重查 snapshot/epoch 并终止，N 由 registry 固定并实测。
  - **E6 密钥/身份轮换：** 网关双 key（密钥）和 CA（证书颁发机构）短期重叠、旧 command 有界完成；单个 authorization snapshot（授权快照）撤销只拒绝其 command/attempt 并计入安全指标，不影响全局 ready（就绪）。gateway 身份/credential policy（数据库登录、CA 链、egress policy）撤销后，必须 pool drain（连接池排空）/终止旧连接并以 fresh-connection identity probe（新连接身份探针）使全局 ready=false，不能静默回退 Worker 直连。
  - **E7 语音/多模态旁路：** OCR、ASR、TTS、视频/图像解析、embedding、rerank 与签名下载必须逐一登记 provider、区域、数据类别、计量和删除能力；任何未迁移调用在 production（生产）启动时 fail-closed（失败关闭）。
- **后置：** 每次已派发供应商调用至少有 immutable input + dispatch evidence（不可变输入及派发证据）、模型调用、费用和隐私 subject（隐私主体）关联；只有成功且通过输出校验的调用才有 output receipt。每次业务结果最多绑定一个成功模型输入，澄清复发可以只引用 origin question（原问题）的既有收据。
- **验收：**
  - 正常 API/Worker 镜像与运行环境中供应商 key/base URL/backup URL 命中数 `=0`；网关镜像之外对供应商域名、WebSocket（网络套接字）与 signed-download（签名下载）的 egress（出站）拒绝数 `=全部尝试数`。
  - 20 并发同 command 的供应商派发数 `=1`；过期/重放/隐私围栏的派发数 `=0`。
  - `prepared`、`dispatching`、`unknown` 无业务绑定的行均可列入对账/删除，孤儿计数不被伪改为 `0`。
  - 云端验证必须记录 **provider API credential holder（供应商 API 凭据持有 workload）数 `=1`**、供应商 egress workload 数 `=1`、直连拒绝数、mTLS 拒绝数、状态收敛 P95（第 95 百分位）和 provider retention receipt（供应商保留回执）覆盖率；AuthorizationSnapshot 的 API/KMS 签名密钥属于不同类别，不计入该数字。未实测不得填写数值。
- **测试矩阵：**

| 流 | 用例编号 | 测试层 | 必测断言 |
| --- | --- | --- | --- |
| 正常 | TC-MODEL-002-N1 | 隔离 PostgreSQL（关系数据库）+ gateway component | 业务事务 + authorization snapshot/binding/outbox 原子提交 → command/attempt → input/dispatch/output evidence → **同事务** result outbox → 冻结 target 的业务绑定一次完成；真实请求字节摘要一致。 |
| E1/E2 | TC-MODEL-002-E1/E2 | 20 并发隔离 PostgreSQL | L1 提交+RPC 响应丢失后 L2/20 并发恢复仍只有一个 `logical_request_key` outbox、一次派发和一次费用预留；过期 JWS/JWKS 恢复/successor 竞争不外发旧行；重放/超额/跨 owner scope collision（范围碰撞）、raw text/image/audio/provider URL、未知字段和跨主体对象均零外发。 |
| E3 | TC-MODEL-002-E3 | inventory（清单）+ 镜像/环境/网络策略 | Worker/API 无 key/base URL/executor role、无 chat/OCR/ASR/TTS/embedding/rerank/download 供应商 egress；网关外的直连和 TTS SSRF（服务端请求伪造）被拒。 |
| E4 | TC-MODEL-002-E4 | 每个 crash point（崩溃点）故障注入 | business/binding/outbox commit 前后、claim/prepared/dispatching/socket 首字节/响应/结算+result-outbox insert/consumer CAS commit 前后均不丢失、不重发、可对账；RPC 响应丢失和 graph resume 只重放同一 outbox；旧 Worker reconciler（对账器）无写权限。 |
| E5 | TC-MODEL-002-E5 | 删除 Worker + provider adapter（供应商适配器） | 未 claim、claimed/prepared、供应商成功待消费、unknown 对账四种删除/撤权 barrier（栅栏）均为领域投影 `0`；派发先赢的 audio/image/TTS/download/query/response 为 pending_external/retention_pending 且有回执。 |
| E6/E7 | TC-MODEL-002-E6/E7 | stream component（流式组件）+ 云端同构 E2E（端到端） | 音频巨帧、慢读/背压、断线、barge-in（用户抢话）、stream 重放、provider WS close（网络套接字关闭）受限且可删；撤权在 N 帧后 provider write 增量 `=0`；轮换不回退直连；文字/OCR/ASR/TTS/embedding/rerank/download 每类仅经网关外发；mTLS/数据库身份撤销使 ready=false。 |

**当前实现边界：** 本仓库尚未实现该 UC。现有 `invoke()` 由 Worker 以普通 runtime 登录执行，Worker 直接持有模型 key；它只能提供受信进程内的幂等/费用控制，不能作为独立 egress 或不可伪造模型输入证明。已存在的 [provider egress inventory（供应商出站清单）](../../architecture/ai/provider-egress-inventory.md) 只是 `observe-only`（仅观测）静态门，固定 `releaseEvidence=false`，不改变密钥、路由、数据库角色、云网络或 production（生产）启动行为。任何相反表述均为发布阻断级文档错误。
