---
id: use_cases_cloud_runtime_and_migration
name: 云端唯一依赖运行与迁移用例
description: 定义 Meetwise 只使用线上 RDS、Tair 与 OSS 的运行、迁移、缓存和对象摄取用例、状态机与测试门禁。
type: requirements
scope: shared
level: spec
status: draft
owner: platform
version: 9
related:
  - ../../architecture/adr/0017-cloud-runtime-target-grant.md
  - ../../testing/cloud-runtime-migration-test-matrix.md
  - ../../testing/cloud-runtime-performance-thresholds.md
tags:
  - cloud
  - rds
  - tair
  - oss
  - migration
  - security
---

# 云端唯一依赖运行与迁移用例

> 本文是**目标规范**，不是已实现证明。2026-08-09 已完成一个阿里云 RDS（关系型数据库服务）PostgreSQL 17 基础版单节点**测试实例**的控制面配置：创建了 1 个空的 `meetwise_cloud_test` 数据库、1 个独立迁移账户及其数据库所有者权限，并对内网地址启用了 TLS（传输层安全协议）。该实例未开放公网，尚无同 VPC（虚拟私有云）计算运行器、受控 CA（证书颁发机构）文件、TargetGrant（目标授权）或真实数据面回执；磁盘加密未启用且基础版不提供生产高可用能力。它只能作为后续非破坏性连通性验证的候选目标，不能以此宣称“真实云端 E2E（端到端）通过”或“生产高可用”。

## 0. 范围、术语与不可突破边界

线上 API（应用程序接口）、Worker（后台任务进程）和一次性迁移任务只能使用受管 RDS、Tair Redis（托管内存键值数据库）和 OSS（对象存储服务）。本地 Docker 不能成为线上数据面替代品。项目负责人已要求迁移期间不再执行本地 Docker 数据面测试：纯逻辑、静态文档和 fake（模拟）模型检查可留在本地/CI；任何 PostgreSQL、Tair、OSS、API/Worker 或浏览器数据面验收必须等待受控 ECS（云服务器）执行器。旧 Docker 路由在同等 ECS 覆盖前仅作为历史兼容源码保留，不能运行、不能当作证据，也不能删除。

| 环境 | 可用目标 | 传输与可用性要求 | 当前事实 |
| --- | --- | --- | --- |
| `test` | 每次运行新建的独占数据库、独占 OSS run 前缀和独占 Tair 前缀 | 仅测试身份可达；破坏性操作必须有 TargetGrant（目标授权） | 已有 1 个固定空 PostgreSQL 测试库和 TLS；它不是每 run 独占目标，且没有同 VPC 运行器、CA 文件或数据面 E2E 回执。 |
| `staging` | 受控预发布资源 | 私网、最小网络路径、无公网数据面 | 当前新购 PostgreSQL 基础版只允许作为测试候选；无多可用区、恢复能力证据或 TargetGrant，真实验证仍被运行器与控制面阻断。 |
| `production` | 经批准的生产资源 | TLS `verify-full`（完整证书与主机名验证）、多可用区、签署的 RPO（恢复点目标）/RTO（恢复时间目标）、恢复演练 | 当前无合格数据库，禁止发布。 |

以下内容不在本次迁移内：真实业务数据迁移、购买或创建收费计算资源、开放 RDS/Tair 公网、放宽到 `0.0.0.0/0`、关闭 TLS、删除现有本地卷。全格式 RAG（检索增强生成）原件在 OSS adapter（适配器）、隔离提取、引用回跳与删除传播全部实装前，不得宣称已上线。

### 0.2 只读云连通性 smoke（冒烟测试）

`pnpm cloud:smoke --run <run-id>` 是为同 VPC（虚拟私有云）测试运行器准备的**只读**前置门，不是 `cloud:verify`（真实云验证）替代品。它只接受 `CLOUD_TEST_*` 专用变量，拒绝 `DATABASE_URL`、`RUNTIME_DATABASE_URL`、`MIGRATION_DATABASE_URL` 与运行时 `RAG_REDIS_URL`；PostgreSQL（关系型数据库）与 Tair（托管 Redis）均要求 TLS（传输层加密）。默认校验证书链；仅既有私网、固定只读测试目标可由函数私有配置显式选择 `vpc-test-only-no-verify`，此时回执会标明该模式，且永远不构成发布证据。运行成功只产生脱敏 HMAC（带密钥哈希）回执，并且数据库、Tair、OSS（对象存储服务）写入数均为 0。

该门有两个**互不等价**的 target profile（目标配置档）：默认 `run-scoped` 要求数据库名精确为 `meetwise_e2e_<run-id>`，只适用于未来独占目标；`fixed-readonly` 只允许精确的 `meetwise_cloud_test`，且必须设置不可默认获得的确认值 `CLOUD_TEST_FIXED_READONLY_ACK=I_UNDERSTAND_FIXED_TARGET_IS_READ_ONLY`。固定档强制 URL（统一资源定位符）中的 RDS（关系型数据库服务）账号为 `meetwise_cloud_smoke_reader`、Tair 用户为 `mw_cloud_smoke`，并强制 PostgreSQL（关系型数据库）`BEGIN READ ONLY`（只读事务）。当前 RDS PostgreSQL 的托管授权接口只能把普通账号授予该测试数据库的 `DBOwner`；所以它是**仅限 `meetwise_cloud_test` 的项目测试账号，不是生产低权账号**，零写入由函数事务和固定目标共同保证。连接前 DNS（域名解析）验证后，数据库/Tair socket（网络连接）会**固定到已验证私网 IP（互联网协议地址）**，同时保留原 hostname（主机名）用于 TLS（传输层加密）SNI（服务器名称指示）/证书校验；数据库连接后还复核 peer（对端地址）。Tair 固定 RESP2（Redis 序列化协议第二版）、`database=0` 和关闭 client-info（客户端信息），因此函数的命令面精确为认证握手加 `PING`。阿里云 Tair 的托管账户模型只提供只读/读写两档，不能把这条代码级命令约束误写成服务端 `PING` ACL：云端必须是单用途 `RoleReadOnly` 账号，且该既有项目测试实例不得放入业务缓存数据。`PG*`/`REDIS_*` ambient（环境继承）变量、明文、回环和公网重绑定一律在首个 SQL（结构化查询语言）前拒绝。该 profile 不能写数据库、缓存或 OSS（对象存储服务），也不能作为 `TC-CLOUD-*` 的通过证据、迁移入口或发布证明；它的用途只是以最低成本验证已购买 RDS/Tair 的私网 TLS（传输层加密）连通性。

### UC-cloud-smoke-001 · 云测试资源的零写入连通性预检

- 角色 Actor：受控测试运行器；不要求业务用户主体。
- 前置 Precondition：专用 `CLOUD_TEST_*` 变量、独立回执 HMAC（带密钥哈希）密钥和受控 `CLOUD_TEST_PRIVATE_CIDRS`（私网网段）可用；默认 TLS 必须以 Node 的系统信任根严格校验。`vpc-test-only-no-verify` 只能由已部署函数的私有配置为固定 `meetwise_cloud_test` 显式选择，仍保持 TLS 加密、私网 VPC（虚拟私有云）白名单与固定 DNS/peer（对端地址）守卫，不能用于每 run（运行）目标、迁移或发布。运行器不携带任何 runtime（运行时）/migration（迁移）/`PG*`/`REDIS_*` 连接变量。云端另有仅对 `meetwise_cloud_test` 有效的 RDS `meetwise_cloud_smoke_reader` 项目测试账号，以及 Tair `mw_cloud_smoke` 单用途只读账号。RDS 不以“物理拒绝 DDL/DML”作为本 profile 的前提；函数本身始终以只读事务运行。Tair 的平台账户权限只能验证为只读，函数自身只发送认证握手和 `PING`，不发送 `CLIENT`、`EVAL`、`DEL` 或任何键读写命令。
- 触发 Trigger：执行 `pnpm cloud:smoke --run <run-id>`。
- 主流程 Main：1) 本地校验 run、目标档、专用角色、URL（统一资源定位符）、TLS（传输层加密）、可选私有 CA（证书颁发机构）和私网 CIDR（无类别域间路由）；2) 解析两端 DNS（域名解析），连接后校验 RDS peer（对端地址）仍在该 CIDR 内，再于 `BEGIN READ ONLY`（只读事务）中执行 `SELECT current_database()`/当前会话 TLS 读取并连接 Tair 执行 `PING`；3) 产出仅含 HMAC（带密钥哈希）指纹的回执，三类写入计数均为 0。
- 备选流 Alternate：`fixed-readonly` 只能精确连接 `meetwise_cloud_test` 且有显式确认；它以数据库只读事务、固定测试数据库和私网白名单守卫，不依赖“脚本约定不写”。
- 异常流 Exception：E1 重复执行只产生独立零写入回执；E2 128 并发预检不写业务状态；E3 任一 runtime/ambient（环境继承）变量、非专用角色、回环/明文/公网 URL、DNS 重绑定、错误数据库名或错误确认值在首个 SQL 前拒绝；E4 TLS/CA/依赖失败或 `error` 事件返回脱敏错误、写入为 0；E5 Tair 不可达只使预检失败，不能把 RDS 单独成功伪装为通过；E6 数据库/Tair 每个连接与 Tair 命令均配置 5,000 毫秒预算，失败后产出一次脱敏回执；Tair 禁止自动重连/第二次认证握手，下次调用从头只读。进程总耗时还包含启动、DNS 与连接池清理，必须由真实云回执单独量化。
- 后置 Postcondition：无领域状态、账本、缓存、OSS 对象或迁移账本变化；回执不含 URL、密码、数据库名或主体。
- 验收 Acceptance：TC-cloud-smoke-001 至 007 分别验证 run-scoped、fixed-readonly、重复/并发、变量/私网逃逸、TLS/依赖失败和断线；任一拒绝路径数据库/Tair/OSS 写入均为 0。真实云前置为：RDS 项目测试账号只能连接 `meetwise_cloud_test`，函数内 `CREATE/INSERT/UPDATE/DELETE` 均因只读事务失败且 `SELECT` 成功；Tair 专用只读身份的函数调用只发出认证握手和 `PING`，不将其权限表述为命令级 ACL。
- 关联：`apps/worker/src/cloud-readiness.ts`；无领域状态机；E1/E2 依赖只读语义，E3/E4/E6 依赖 fail-closed（故障关闭）、物理低权和最小披露，E5 依赖双依赖全成；本 UC 不是 TargetGrant（目标授权）替代。
- 七类覆盖：正常（Main）/异常（E4、E6）/特殊（Alternate、E5）/逃逸通道（E3）/高并发（E2）/复杂（双数据面 TLS）/刁钻（固定共享库确认值、连接变量污染）。

截至 2026-08-11，本地拒绝路径证明已通过；固定 `meetwise_cloud_test` 只可作为 `fixed-readonly` 连通性候选，绝不符合每 run（运行）独占的破坏性 E2E（端到端）要求。历史上曾有私网 test-only 试跑和最小回执，但 2026-08-12 的独立数据库/SRE 审计确认：当时的串行运行器缺少持久 lease fence、崩溃恢复、实例身份绑定和本 run 资源所有权证明。因此这些记录只能保留为历史试跑，**不得**作为 `TC-CLOUD-TEST-*` 通过、重放、清理、迁移等价或 Docker 退役证据。所有 release-required `TC-CLOUD-*` 以及 serial-test-only 的破坏性 case 均维持 `blocked`；在严格目标档、可恢复账本和实测 E1–E6 闭合前，任何 DDL（数据定义语言）、DML（数据操纵语言）、对象操作、迁移或故障注入不得执行。

### 0.3 项目专用的 ECS 串行云测试执行器（目标，不是发布路径）

项目负责人已明确授权将当前非生产 RDS/Tair 仅用于本项目自动化测试。为避免把共享固定库误写为一般 E2E（端到端）目标，目标是一个受限的 `serial-test-only`（仅测试串行）**私网 ECS executor**：它只运行显式登记的数据库测试 case，不处理真实业务数据、不接收运行期或迁移期连接变量，也不改变 `TC-CLOUD-01` 至 `TC-CLOUD-04` 的 release（发布）状态。ECS executor 必须无公网入站、以工作负载身份取得短期配置、在启动前校验 TargetGrant、case、run、镜像摘要和 target profile；GitHub Actions 或开发机只可请求受控执行并验签回执，不能取得数据面凭据。

当前 `apps/worker/fc/` 与 `cloud-test-fc.ts` 是历史函数形态候选，不是 ECS executor，也没有完成 crash recovery、instance/VPC attestation 或 E1–E6 真正数据面验证。它不得部署、不得接收新的破坏性 case，直到 ECS rollout（逐步迁移）回执完成后明确下线或删除；不能以“同为私网函数”替代 ECS 运行边界。

#### 当前最小目标档配置清单（不含任何密钥）

只有下表全部由项目负责人在私有配置中供给后，才允许尝试 `TC-CLOUD-TEST-001-main`；它不是授权执行 002/003 或全量 Docker 迁移的清单。

| 字段/事实 | 当前 runner 的强制用途 | 不满足时的处理 |
| --- | --- | --- |
| 专用 RDS 目标、原始 FQDN、VPC 声明、无公网入口 | FQDN 用于 TLS SNI（服务器名称指示）；VPC/实例 ID 进入静态 profile/回执指纹 | 拒绝执行；当前静态 VPC/instance 声明仍待控制台/TargetGrant（目标授权）实证。 |
| 系统信任根或私有 CA（证书颁发机构）、证书 SHA-256 指纹 | `verify-full` + 每个 control/ledger/child socket 的 pin | 拒绝；`vpc-test-only-no-verify` 只留给 fixed-readonly smoke。 |
| `mw_e2e_admin` 专用测试凭据 | 仅可连接 bootstrap `postgres`，创建控制库和本 run 临时资源 | 不得复用 runtime、migration 或 fixed-smoke 账号。 |
| `CLOUD_TEST_ALLOWED_CASE_ID=TC-CLOUD-TEST-001-main` | ECS executor 只接受登记的 case | 002/003 需独占可重置 cluster 和另行复审。 |
| ECS 构建的 `suiteArtifactSha256` | 必须与 private profile 的期望摘要精确相同，且在连网前比较 | 摘要不符时 socket/DDL=0。 |
| 回执 HMAC 密钥 | 仅保护脱敏 terminal receipt，不进日志、文档或事件 | 缺失或长度不足时拒绝。 |

运行前仍必须先获得一次**单独的外部执行确认**，因为该 case 会创建并删除测试数据库和角色；当前文档/本地 proof 不能替代这一步。

### UC-cloud-test-001 · 可清理的项目专用 RDS 串行测试

- 角色 Actor：同 VPC（虚拟私有云）的项目专用测试执行器；不得由 API（应用程序接口）、Worker（后台任务进程）或开发机直接调用。
- 前置 Precondition：ECS executor 只从工作负载私有配置取得专用 `mw_e2e_admin` 短期凭据和静态 `CloudTestTargetProfile`（目标实例/VPC 声明、原始 FQDN、`verify-full` CA/证书指纹、管理员、控制库、允许的 case 与构建摘要）。构建摘要、case、原始 FQDN、系统 TLS（传输层安全）验证与证书 pin 必须在任何创建控制库、租约账本或其他可写 DDL 前验证；仅 CIDR（无类别域间路由）、DNS（域名解析）、数据库名或环境变量不是目标身份。**当前代码尚不能从 PostgreSQL socket 证明控制台 instance/VPC 声明，也没有已签名 TargetGrant 或 ECS executor；因此本 UC 与全部云执行 case 仍为 `blocked`。** 显式 `CLOUD_TEST_MODE=serial-test-only`、run ID、case ID 与 profile 均通过校验，当前实例明确仅服务本项目测试。纯逻辑、文档、fake（模拟）模型和浏览器离线测试保持本地运行；数据面测试不再在本地 Docker 执行。固定只读 `meetwise_cloud_test`、`meetwise_cloud_smoke_reader`、任何 runtime（运行时）/migration（迁移）/`PG*`/`REDIS_*` 环境变量一律拒绝；`vpc-test-only-no-verify` 只可用于零写入 smoke，不能进入本 UC。
- 触发 Trigger：ECS executor 在收到已验签、与 run 和镜像摘要绑定的受控执行请求后执行 `pnpm cloud:test --case <case-id> --run <run-id>`；开发机、GitHub Actions runner 和 FC 均不得直接调用破坏性路径。
- 主流程 Main：1) 在首条可写 SQL 前验证 `CloudTestTargetProfile`、构建摘要、case、run ID、命名规则和 TLS（传输层安全）/对端证书身份；2) 以实例级锁和事务内 CAS（比较并交换）取得带 `attempt_id`、fencing token（围栏令牌）和到期时间的唯一租约，并在同一事务追加事件；3) **同一事务**写入确定性的数据库/角色计划名，再在每一条创建 DDL 前写入精确资源意图；创建成功后写入本 attempt 实际拥有的 OID（对象标识符）/成员关系；4) 仅创建 `meetwise_e2e_<run-id>` 数据库及 `mw_e2e_<run-id>` 临时角色，执行该 case；5) 正常路径按已拥有 OID/成员关系精确清理并回读为 0；6) 同一 attempt 以 HMAC（带密钥哈希）保护的 `cleaned`、`failed` 或 `failed_cleanup` 回执终结。任何未知资源、外来同名角色或清理不确定均不得删除、不得重跑套件。
- 备选流 Alternate：Tair（托管 Redis）写入型 case 只能使用独立读写测试身份与 `mw:e2e:<run-id>:` 前缀，禁止 `FLUSH*`、`SCAN` 和跨 run（运行）键操作；在该身份尚未供给前，此类 case 保持 `blocked`。
- 异常流 Exception：E1 相同 run/case/artifact 的终态重放只返回原回执，绝不创建第二个目标；E2 20 个并发请求恰一条获得同一 attempt 的租约，其余在首条 DDL（数据定义语言）前失败；E3 错误实例、VPC、证书、账户、库名、角色、run、固定只读目标或环境变量污染均在控制库创建和首条 DDL 前拒绝；E4 case 或执行器中断后，仅持有已过期 attempt 围栏的恢复器可读取不可变清单、终止该 run 标记的连接并清理已确认拥有的资源，随后写 `failed` 或 `failed_cleanup`；自动重跑原 suite=0；E5 缺少 vector（向量）/HNSW（分层可导航小世界索引）、CREATEDB（创建数据库）或 CREATEROLE（创建角色）能力时进入持久 `failed` 且无业务对象写入；E6 清理回读失败、外来 sentinel（哨兵）角色/成员关系或迟到连接使 run=`failed_cleanup`，不得伪装通过。
- 后置 Postcondition：成功后仅保留脱敏 test receipt（测试回执）；数据库、临时角色和 Tair 前缀均为 0。若崩溃发生在 `CREATE` 与 OID 归属记录之间，恢复器不得盲删，必须以 `failed_cleanup` 终结并给出人工处置证据。任何实际业务 schema（模式）、业务事件、用户数据、发布账本和生产资源均为 0。
- 验收 Acceptance：`TC-CLOUD-TEST-001-main/E1/E2/E3/E4/E5/E6` 逐项验证 profile、命名、并发、错误目标、崩溃恢复、能力缺失和回读。E4 必须在真实 PostgreSQL（关系型数据库）中覆盖 `requested/leased/executing` 和每条创建/删除 DDL 后中断；E2 必须 20 路并发且 winner=1、其他 DDL=0；E3 必须证明错误 target profile 时控制库/业务 DDL=0；E4/E6 必须证明外来同名角色和成员关系=0 影响。所有回执固定 `test_only=true`、`releaseEvidence=false`。本 UC 不替代 TargetGrant（目标授权）、ReleaseAttestation（发布证明）或 28 条 release-required（发布必需）TC。
- 关联 Relation：`apps/worker/src/cloud-test-serial.ts`、`apps/worker/src/cloud-test-run-ledger.ts`、对应 PostgreSQL 故障注入 proof、云端运行与迁移测试矩阵；依赖目标身份、事务 CAS、attempt fence、精确拥有资源清单和 HMAC 回执，不将命名、advisory lock 或环境变量允许列表当作授权根。
- 七类覆盖：正常（Main）/异常（E4、E5、E6）/特殊（Alternate）/逃逸通道（E3）/高并发（E2）/复杂（RDS 与 Tair 分层）/刁钻（重放、孤儿和错误清理）。

### UC-cloud-test-002 · 云端隔离测试套件替代本地 Docker

- 角色 Actor：同 VPC（虚拟私有云）的项目专用测试运行器；它不是 API（应用程序接口）、Worker（后台任务进程）、浏览器或发布控制面。
- 前置 Precondition：RDS（关系型数据库服务）实例明确只承载本项目自动化测试，固定只读 `meetwise_cloud_test` 与其 smoke（冒烟测试）身份不属于破坏性套件；套件、源码/构建摘要、run ID、target profile 和资源清单都在受控 allowlist（允许列表）中。破坏性路径只允许 `system-root`/`verify-full`；`vpc-test-only-no-verify` 永远不能运行迁移、RLS（行级安全）、角色、扩展或其他 Docker 替代 suite。包含固定 cluster（集群）角色、角色成员、默认 ACL（访问控制列表）、基线 `DROP ROLE` 或扩展断言的 suite 必须在可重置、独占的 RDS instance/cluster（实例/集群）运行，不能把同一实例中的新 database（数据库）误称为同等隔离。纯函数、契约、文档和 fake（模拟）模型测试没有 Docker（容器）数据依赖，保持本地执行而非伪造“云迁移”。
- 触发 Trigger：受控命令 `pnpm cloud:verify --suite <allowlisted-suite> --run <run-id>` 仅向私网运行器提交不含 URL（统一资源定位符）、账号、密钥、任意 shell（命令解释器）参数或业务数据的事件。
- 主流程 Main：1) 运行器在可写连接前验证 TargetGrant（目标授权）或 test-only `CloudTestTargetProfile` 的实例/VPC（虚拟私有云）/证书/构建/run/case 绑定；2) 以事务 CAS（比较并交换）取得带 attempt fence 的唯一租约，并将每项资源 create-intent、实际 OID/成员关系和清理事实持久化；系统 `postgres` 仅用于 bootstrap（引导），固定只读 `meetwise_cloud_test` 绝不承载账本或破坏性 suite；3) 只对 database-local suite 创建精确 run 数据库、token（令牌）、Tair（托管 Redis）前缀和 OSS（对象存储服务）前缀。任何固定 cluster 角色或 `ALTER … OWNER TO` 迁移仅在独占可重置 cluster 中运行；4) 仅执行 suite manifest（套件清单）中的固定命令，数据库 proof（证明）使用 `cloud-private` 隔离 profile（配置档）验证 run ID、目标数据库、私网 peer（对端）、TLS 和数据库 token；5) 按同一 attempt 的实际拥有清单回收资源，未知或外来资源不删；6) 以 append-only（只追加）脱敏 receipt（回执）终结为 `cleaned`、`failed` 或 `failed_cleanup`。
- 备选流 Alternate：A1 PostgreSQL（关系型数据库）/RLS（行级安全）/迁移 proof 先迁；A2 API/Worker（后台任务进程）随后在同一私网运行器启动；A3 Playwright（浏览器自动化）只在可复现 Chromium（浏览器）运行器就绪后迁；A4 Tair 写入型 case 使用专用读写测试身份与 `mw:e2e:<run-id>:` 前缀；A5 OSS case 在 adapter（适配器）、测试桶或精确前缀和清理回执存在后才迁。Mailhog（邮件测试服务）没有业务测试调用者，直接从测试 compose（编排）退役，不迁移为云服务。
- 异常流 Exception：E1 同一 `runId + suiteId + artifactDigest` 重放只返回首次 receipt（幂等键）；E2 多个请求竞争时 CAS winner（胜者）=1、输家在首条 DDL（数据定义语言）前失败；E3 固定只读库、非本项目实例、错数据库、错 token、非 allowlist suite、环境变量污染、任意命令或非私网/TLS 目标均在首条业务 SQL（结构化查询语言）前拒绝（RLS/allowlist）；E4 执行器中断后的 successor（继任）只根据 run ledger（运行账本）清理该 run 的精确资源，不能按名称通配删除；E5 缺扩展、缺角色能力、Tair/OSS/浏览器依赖不可用时进入 `failed`、不执行替代本地 Docker 路径；E6 cleanup（清理）超时、遗留 cluster 角色、迟到子进程或连接重建时进入 `failed_cleanup`，保留最小清理清单，自动跨 run 重试=0。
- 后置 Postcondition：每个成功 run 仅保留不含连接信息、密钥、用户数据或子进程原文的 receipt；临时数据库、临时角色及临时成员关系、Tair/OSS 前缀均为 0。任何非清理成功、孤儿或异常 run 都不能被 CI（持续集成）视为通过。
- 验收 Acceptance：每个登记的 `TC-CLOUD-TEST-002-*` 或其子 suite（例如 `TC-CLOUD-TEST-003-*`）分别覆盖 manifest 执行、重放、全实例并发、目标/命令逃逸、中断恢复、能力缺失和 cleanup 失败；每个原 Docker 数据面 gate 必须先在云端连续两次通过且相同 suite 的 E1–E6 已通过，才可删除其 Docker 路由。所有结果固定 `test_only=true`、`releaseEvidence=false`，不改变 28 条 release-required（发布必需）TC 的状态。
- 关联 Relation：`scripts/run-e2e-isolated.mjs`、`packages/db/src/isolated-test-target.ts`、`apps/worker/src/cloud-test-serial.ts`、云端运行与迁移测试矩阵；依赖 CAS、幂等键、RLS、append-only receipt 和精确资源清单，禁止动态 shell、名称通配清理或固定共享库替代。
- 七类覆盖：正常（Main）/异常（E4、E5、E6）/特殊（A1–A5）/逃逸通道（E3）/高并发（E2）/复杂（数据库、缓存、对象、API、Worker 与浏览器分层）/刁钻（E1、E4、E6）。

### 0.1 ReleaseAttestation（发布证明）、TargetGrant（破坏性执行授权）与目标预检

`ReleaseAttestation`（发布证明）是不可变、一次性预检证明，只绑定环境、镜像 digest（内容摘要）、配置/目标指纹和服务身份版本；它不授予 DDL（数据定义语言）、破坏性测试或运行期凭据。`issued → verified → consumed` 用 CAS（比较并交换）完成；`revoked/expired` 只阻断尚未预检的 release（发布）。运行期的身份撤销、续期与 drain（排空）由独立的工作负载身份和 CloudRuntimeRelease 状态机承担。`TargetGrant`（目标授权）只用于迁移和破坏性 E2E（端到端），一次执行只能绑定一个 run。数据库名、环境变量、marker（标记）或 hostname（主机名）允许列表均不是信任根。

`TargetGrant` 的不可变规范化载荷至少包含：`grant_id`、`issuer`（签发方）、`audience`（受众）、`key_id`（签名密钥标识）、签名算法、云账号 ID、region（地域）、RDS 实例 ID、VPC ID、数据库名、允许的运行角色、环境、允许操作、迁移 manifest hash（清单哈希）、计划 schema revision（模式修订）、E2E run ID、OSS 前缀、Tair 前缀、镜像 digest（内容摘要）、签发/到期时间和撤销序号。签名密钥仅在部署控制面或 KMS（密钥管理服务）中；运行日志、指标和 Git（代码仓库）只可保存 `grant_id` 的不可逆摘要。

在任何测试 SQL（结构化查询语言）或 HTTP（超文本传输协议）请求前，测试启动器必须本地验证签名、到期时间、操作、环境、run ID 与配置。通过后，迁移器才可对已绑定目标建立第一条专用预检连接；在**任何 DDL（数据定义语言）前**必须再次验证：云账号/地域/RDS 资源 ID/VPC/私网解析地址/数据库名/CA（证书颁发机构）指纹/TLS 模式/运行角色均与授权一致，且 DNS（域名解析）未漂移。拒绝 loopback（回环）、link-local（链路本地）、公网与授权外的地址。

预检发现任一业务表而 `schema_migrations`（迁移账本）缺失、损坏或 checksum（校验和）不匹配时，必须在第一条 DDL 前失败；断言业务行、表结构、角色和 OSS 对象写入均为 0。现有含 `DROP` 的基线迁移不得在共享 staging 或生产资源运行。

`TargetGrant` 的持久状态为 `issued · leased · executing · consumed · revoked · expired`；控制面用 CAS 将 `issued → leased → executing → consumed`，并将 lease 绑定为 `grant_id + run_id + runner identity + image digest + expiry`。仅 `leased` 的持有者可开始预检，预检成功后转 `executing`；同一授权可在其执行 lease 内完成已绑定的多个迁移阶段，只有正常 `promoted`、受控 `failed/aborted` 或受控 successor handover（继任交接）后才消费为 `consumed`。任何第二次租用、签名篡改、错误 audience、镜像不符、撤销、过期或控制面不可达均 fail-closed（故障关闭），在首个 SQL/HTTP 前拒绝。`revoked`/`expired` 是**替代**终态；过期 lease 由控制面 CAS 收回为 `expired`，不可由运行器自行续期。

| from → to | 触发者与 CAS 守卫 | 结果 |
| --- | --- | --- |
| `issued → leased` | 控制面；`expectedVersion`、目标已 provisioned、runner/image/run 全匹配 | 写 lease receipt；并发租用恰 1 个成功 |
| `leased → executing` | 已租用 runner；在线撤销检查、短期凭据仍有效 | 写开始执行事件；同一授权仅允许这一执行链 |
| `executing → consumed` | CloudMigrationRun=`promoted/failed/aborted`、SchemaMigrationRun=`completed/failed/aborted`，或唯一 `successor_handover`：旧 attempt 已 CAS fence、旧 RDS/Tair/OSS 凭据均拒绝、`plan_manifest_hash`/`snapshot_manifest_hash` 一致、不可重放 handover receipt 已写；且终态补偿完成 | 写消费 receipt；仅 `failed/aborted`，或完成且不再依赖源端的 `promoted` 可解冻；handover 绝不解冻 |
| `issued/leased/executing → revoked` | 受权控制面 | grant 终态保持 `revoked`；作废下一阶段，迁移 attempt（尝试）失败补偿并解冻源 |
| `issued/leased/executing → expired` | 控制面到期扫尾 | grant 终态保持 `expired`；回收 lease，迁移 attempt 失败补偿并解冻源 |

授权载荷的 `plan_manifest_hash` 仅绑定迁移计划和预期 revision；源冻结后另生成不可变 `snapshot_manifest_hash`，记录快照、LSN（日志序列号）和批次摘要，二者不得混用。每个破坏性阶段开始前都必须在线检查撤销序号和 `executing` lease；控制面为执行链签发与 `grant_id` 精确绑定的短期数据库、Tair 与 OSS 凭据，凭据到期即失效。**TargetGrant 不是数据库防火墙**：若迁移进程持有长期高权数据库口令，它仍可绕过应用校验。因此，在凭据代理、短期凭据和网络隔离未实装前，破坏性云迁移保持 `blocked`；当前静态 RDS 账户仅能用于无破坏性的受控连接验证。

## 1. 承重对象与可执行状态机

所有转换都采用 `UPDATE ... WHERE id = :id AND status = :from AND version = :expectedVersion` 的 CAS（比较并交换）写；成功写入 `version + 1`、操作者、原因、幂等键、事件 ID、时间、证据 URI（统一资源标识符）和 transition receipt（迁移回执）。每个 receipt 固定 `from/to/expected_version/result_version/actor/retry_owner/compensation_owner`；数据库 advisory lock（建议锁）只能减少并发，不得替代持久 CAS。重复请求返回首次 receipt；版本冲突回查后返回已有结果或冲突，不得盲重试。

### 1.1 CloudRuntimeRelease（云运行发布）

枚举：`draft · preflighted · ready · running_full · running_degraded · draining · drained · blocked · failed`。每条记录固定 `environment=test|staging|production`，而非以“非测试库”一刀切。

| from → to | 触发者 | 守卫与副作用 | 重复/失败语义 |
| --- | --- | --- | --- |
| `draft → preflighted` | 发布控制面 | ReleaseAttestation、镜像 digest（内容摘要）、配置 fingerprint、身份矩阵、网络和环境规则全部通过；如需 DDL，另验证 TargetGrant | 同幂等键返回 `preflighted`；任一不符 → `blocked` |
| `preflighted → ready` | 一次性 migrate + API/Worker | 迁移 manifest 达目标 revision；组件各自只读 readiness（就绪检查）探针通过 | 失败 → `failed`，不接流量 |
| `ready → running_full` | 流量控制面 | 必需路径健康；RAG 路径的 RDS/Tair/授权均可用 | 已切流重试无副作用 |
| `running_full → running_degraded` | 运行时控制器 | 仅可选 RAG 依赖失效；账本/支付等非 RAG 路径保持独立健康 | RAG 拒绝新检索或向量化，不得本地或旧缓存回退 |
| `running_degraded → running_full` | 运行时控制器 | 连续观测窗口内依赖恢复、缓存 generation 和授权 epoch（授权版本）一致 | 未满足则保持降级 |
| `running_full/running_degraded → draining → drained` | 发布控制面 | 停止新任务、等待 lease（租约）到期或转移、记录未完成任务 | 超时 → `failed`，保留证据而非强杀 |
| 任一非终态 → `blocked/failed` | 控制面/安全策略 | 目标漂移、越权、迁移失败或必需依赖失效 | 仅创建新 release 可再次预检；原记录不可回写为成功 |

健康检查必须拆分：`/livez`（进程存活）不访问外部资源；`/readyz/api`（命令路径就绪）、`/readyz/worker`（任务路径就绪）、`/readyz/rag`（检索路径就绪）和 `/readyz/ingest`（摄取路径就绪）只做受限、超时的读探针，绝不创建 OSS 对象、消费队列或调用模型。对外响应不得泄漏端点、角色、密钥或拓扑。

### UC-runtime-health-001 · API（应用程序接口）存活与就绪探针分离

- 角色 Actor：负载均衡器、编排器、监控系统；不要求用户或租户 principal（主体）。
- 前置 Precondition：API 进程已绑定端口；`/readyz/api` 的数据库连接池由受限读超时保护。
- 触发 Trigger：编排器调用 `GET /livez` 进行存活判断，或调用 `GET /readyz/api` 决定能否接收命令流量；旧 `GET /health` 仅作为等价的 readiness（就绪）兼容路径。
- 主流程 Main：
  1. `GET /livez` 只返回固定 `{status:"ok"}`，不访问 PostgreSQL、Tair、OSS（对象存储服务）、模型或队列。
  2. `GET /readyz/api` 只执行受限 `SELECT 1` 读探针；成功返回固定 `{status:"ok"}`。
  3. 失败时 readiness 返回 `503 {status:"degraded"}`；流量控制器摘流，但不以 liveness 失败重启仍可诊断的 API 进程。
- 备选流 Alternate：调用旧 `/health` 时返回与 `/readyz/api` 相同状态，不改变旧探活集成的语义。
- 异常流 Exception：
  - E1 重复：任意次数探针均为只读、零业务写入；不需要幂等记录。
  - E2 高并发：256 个并发 `/livez` 请求不得争用数据库连接，2xx 数=256；这是无状态读，不能用 CAS（比较并交换）伪装排队成功。
  - E3 逃逸：无 principal 的公开探针只能得到固定状态，响应、日志和指标均不得包含端点、数据库角色、密钥、用户或租户信息（最小披露安全边界）。
  - E4 依赖失败：数据库异常、连接超时或读探针失败时，`/readyz/api` 与兼容 `/health` 必须是 `503`，不得回退为 200、不得写入或消费任务。
  - E5 降级：可选 RAG（检索增强生成）依赖不可用不改变 API command readiness 的判定；它由独立 `/readyz/rag` 表达，不可把可选依赖误判为 API 进程死亡。
  - E6 断线/超时：客户端中断不产生重试、任务或账本副作用；下一次探针独立执行。读超时仍只返回最小 503 状态。
- 后置 Postcondition：没有领域状态、账本、队列、OSS、模型或事件日志写入；指标仅记录低基数 `method/route/status`。
- 验收 Acceptance：
  - `TC-runtime-health-001`：`/livez`=200、响应仅含 `status=ok`、数据库 query 次数=0。
  - `TC-runtime-health-002`：真实隔离 PostgreSQL 上 `/readyz/api`=200；低权 runtime login（运行登录）只执行 `SELECT 1`。
  - `TC-runtime-health-003`：模拟数据库失败时 `/readyz/api` 与 `/health`=503，响应不含错误详情；同一时刻 `/livez` 仍=200、数据库调用次数=0。
  - `TC-runtime-health-004`：256 并发 `/livez` 的非 2xx=0，P95（第 95 百分位延迟）<500 毫秒；数据库读路径另行以 `/commerce/products` 测量，禁止拿 liveness 冒充数据库性能。
  - `TC-runtime-health-005`：无 principal、恶意 query 参数和连接复用均不改变响应形状、无业务副作用、无敏感字段。
- 关联：`GET /livez`、`GET /readyz/api`、`GET /health`；无业务状态机；E1/E2 由无状态只读语义，E3 由最小披露与网络边界，E4/E6 由依赖 fail-closed（故障关闭）和连接/查询超时，E5 由独立 readiness 分域；见 `TC-runtime-health-001` 至 `005`。
- 七类覆盖：正常（Main）/异常（E4、E6）/特殊（Alternate、E5）/逃逸通道（E3、TC-005）/高并发（E2、TC-004）/复杂（编排器 liveness 与 readiness 分流）/刁钻（连接复用、恶意 query、依赖半失效）。

### 1.2 CloudMigrationRun（云迁移任务）

枚举：`planned · preflighted · source_frozen · source_snapshotted · exporting · export_verified · restoring · restore_verified · recovery_drilled · approval_pending · promoted · rollback_requested · rolled_back · paused · orphaned · failed · aborted`。

```text
planned → preflighted → source_frozen → source_snapshotted → exporting
        → export_verified → restoring → restore_verified → recovery_drilled
        → approval_pending → promoted → rollback_requested → rolled_back
```

| 阶段 | 强制守卫 | 不变量与证据 |
| --- | --- | --- |
| `preflighted` | TargetGrant=`executing` 与运行身份双验；目标为空，或迁移账本完整且 checksum 一致 | 预检失败前没有业务 SQL、DDL 或对象写入 |
| `source_frozen → source_snapshotted` | 源端进入只读窗口，取得 PostgreSQL 一致性快照和 LSN（日志序列号） | manifest 固化源 revision、快照、LSN、转换版本与数据分类 |
| `exporting → export_verified` | 加密 data-only（仅数据）导出完成；所有批次 nonce（一次性编号）和摘要齐全 | 不迁移角色、密码、Redis 键或本地 MinIO 对象 |
| `restoring → restore_verified` | 先执行目标版本化迁移，再恢复数据；每表规范化行 HMAC（哈希消息认证码）摘要、外键、唯一索引、`NOT VALID` 约束、RLS（行级安全）、扩展版本、序列 next value（下一个值）与业务不变量均一致 | 仅行数或主键集合一致不得 `promoted` |
| `recovery_drilled → approval_pending` | 从隔离备份恢复完成，记录数据量、备份时间、耗时与证据 | 当前基础版只能称“最近基础备份恢复实测”，不得宣称 PITR（时间点恢复）或生产 RPO 达标 |
| `approval_pending → promoted` | 受权人工批准，且目标环境与 TargetGrant 一致 | 已提交的迁移按 forward-only（只前进）或明确 reversible（可逆）方案处理；数据库恢复不是普通代码回滚 |

| from → to | 触发身份与 CAS 守卫 | 数据副作用、失败和解冻语义 |
| --- | --- | --- |
| `planned → preflighted → source_frozen` | `migration` 身份、唯一幂等键和 expected version；TargetGrant=`executing` | 源端只读冻结最大时长由 manifest 声明；到期前告警，不自动继续 |
| `source_frozen → source_snapshotted → exporting` | 快照/LSN 已固化；源冻结 lease 尚有效 | 导出失败仅可 `paused(resume_from_state=source_snapshotted)`；不得重复取不一致快照 |
| `exporting → export_verified → restoring` | 每批次 nonce 与内容摘要完整 | 恢复中断必须 `orphaned(resume_from_state=export_verified)`；人工核对后唯一恢复入口为 `export_verified` |
| `restoring → restore_verified → recovery_drilled → approval_pending` | 内容、关系、恢复证据达标，且审批人不是执行人 | 失败转 `failed`；受权操作者先解除源冻结并写审计，源从不删除 |
| `approval_pending → promoted` | 双人审批、TargetGrant/目标 fingerprint 未漂移 | 写切流/兼容窗口事件并消费 grant；如无批准，只能 `aborted` 后解冻源并消费 grant |
| `promoted → rollback_requested → rolled_back` | 受权发布控制面、已验证服务回切与独立恢复目标 | 回滚=服务回切和独立目标恢复；不可逆 DDL 禁止假称逆向 SQL 回滚 |
| `source_snapshotted/exporting → paused` | CAS、可恢复错误、不可变 `resume_from_state=source_snapshotted` 与 receipt 必填 | 导出中断仅从已固化快照恢复；不保留活动执行权限 |
| `export_verified → paused` | CAS、可恢复错误、不可变 `resume_from_state=export_verified` 与 receipt 必填 | 恢复前先对账已验证导出；不保留活动执行权限 |
| `restoring/recovery_drilled → orphaned` | CAS、runner 失联且没有撤销/过期 | 禁止自动重跑；先 fence 旧 attempt，再人工对账 |
| `planned/preflighted/source_frozen/source_snapshotted/exporting/export_verified/restoring/recovery_drilled/approval_pending → failed/aborted` | CAS、失败码和 receipt 必填 | `failed/aborted` 由 compensation owner 解冻源并保留 manifest/证据；TargetGrant 进入对应唯一终态 |

每个 migration manifest 必须声明兼容窗口、最旧可运行二进制、是否只前进、回填/切流/收缩计划、长会话 checkpoint（检查点）兼容性、回退方式、源冻结最大时长与证据保留期。`orphaned` 不得自动重跑；须先比较已恢复批次的内容摘要、对象数和 schema revision 后由受权操作者续跑或失败。

### 1.3 SchemaMigrationRun（结构迁移任务）

普通 schema migration（数据库结构迁移）不能以“命令退出码为 0”推定安全完成。它是独立于数据迁移的对象，枚举为 `planned · preflighted · applying · verified · completed · failed · aborted`：

| from → to | 触发者与守卫 | 结果 |
| --- | --- | --- |
| `planned → preflighted → applying` | `migration` 身份、TargetGrant=`executing`、目标账本/指纹和 migration manifest 一致 | 每个 DDL 与账本记录在同一事务；非法目标写=0 |
| `applying → verified → completed` | 预期 migration ID、checksum、角色权限和 schema revision 全部一致 | 追加完成 receipt，TargetGrant=`consumed` |
| `planned/preflighted/applying/verified → failed/aborted` | CAS、失败码和补偿 receipt | 普通失败/中止时 TargetGrant=`consumed`；授权撤销/到期时 run=`failed` 且 Grant 保持 `revoked/expired`；无需源冻结，但不得接流量 |

CloudRuntimeRelease 只引用 `SchemaMigrationRun=completed` 的 receipt；它不直接消费 TargetGrant。

## 2. 身份、最小权限与隔离契约

| 身份 | 可做 | 明确禁止 | 网络/审计要求 |
| --- | --- | --- | --- |
| `migration` | staging/test 的受权 schema 与数据迁移 | 生产库、共享 staging 破坏性迁移、模型外联 | 单独凭据、TargetGrant、短 lease、全量审计 |
| `runtime_api` | 经主体上下文的 API 事务 | DDL、角色管理、绕过 RLS | 私网；每请求 `SET LOCAL` 主体；`NOBYPASSRLS` |
| `runtime_worker` | 受控任务、RAG 账本 | DDL、跨租户读写 | 私网；任务主体和 purpose（用途）均入审计 |
| `checkpoint` | 仅所归属 thread（线程）的 LangGraph（图编排框架）检查点 | 读取/写入其他主体 thread、`SET ROLE` | thread → owner 映射、逐行 RLS、A 替换 B 的 thread ID 读写删均为 0 |
| `e2e` | 每 run 新建独占测试目标的最小测试操作 | 生产网络路径、非测试库、`CREATE ROLE` | TargetGrant 先验；独占 DB、Tair/OSS run 前缀 |
| `ingest` / `viewer` | 隔离摄取或每次授权查看 | 互相提权、跨租户 prefix（前缀） | 临时凭据、purpose、对象版本和撤权事件审计 |

Tair 如无法提供命令级 ACL（访问控制列表），补偿控制必须是独立实例、私网白名单、独立凭据及不与数据库身份复用。缓存 key 的 HMAC 输入必须包括 tenant（租户）、principal（主体）、ACL epoch、corpus generation（语料代际）、检索 recipe（配方）和 query；命中后仍必须由 RDS 重新授权。

### 2.1 目标、指纹与检查点访问契约

`targetFingerprint`（目标指纹）只包含脱敏云资源 ID、数据库名、CA（证书颁发机构）指纹、TLS 模式、schema revision 和环境；API、Worker、checkpointer 必须相同。`identityFingerprint`（身份指纹）只包含角色/权限集版本；三个组件必须不同，且均与身份矩阵匹配。二者绝不包含端点、用户名、密码或可逆的资源地址。

`TestTargetProvisionRun`（测试目标供给任务）枚举为 `planned · provisioned · leased · active · cleaning · cleaned · failed`：控制面以 CAS 创建独占数据库或实例、独占 Tair 前缀/专用故障实例、独占 OSS run 前缀，再签发 TargetGrant；E2E 只得到低权短期凭据。run 到期后控制面先确认没有 active lease、核对只属于 run 的对象，再进入 `cleaning → cleaned`。共享 staging 不得用于破坏性 Tair 主从切换、逐出或数据库基线测试。

| from → to | 触发者与守卫 | 结果 |
| --- | --- | --- |
| `planned → provisioned` | 控制面 CAS；资源标签和 run ID 唯一 | 写资源清单与所有权 receipt |
| `provisioned → leased → active` | 控制面租用 TargetGrant；E2E runner 获短期凭据 | 仅该 runner 可执行；重复租用返回首次 receipt |
| `active/leased → cleaning` | 到期或受权终止；没有 active grant lease | 仅删除本 run 资源，记录每个删除 receipt |
| `cleaning → cleaned` | 控制面对目标/前缀重新枚举 | 外部可读残留=0；保留期对象转对应 retention 状态 |
| `planned/provisioned/leased/active/cleaning → failed` | CAS；资源漂移、清理不属于 run 或权限不符 | 禁止重用目标，保留证据并人工处置 |
| `failed → cleaning → cleaned` | 受权补偿者；先撤销本 run 凭据和终止会话，再重新枚举并确认只操作本 run 资源 | 失败目标仍必须清理；无法清理时保留 failed、告警和不可重用标记 |

LangGraph checkpoint 的访问必须经一个固定的 `CheckpointAccess` 边界：不可变 `thread_enrollment(thread_id, owner_principal, tenant_id, membership_version)` 映射先于 checkpoint 行建立；每次读写在事务模式连接池内 `SET LOCAL app.principal` 与 `SET LOCAL app.purpose`。若供应商 checkpoint 表可安全增加 owner/tenant 列，则启用并强制逐行 RLS；否则只能经经过审计的 SECURITY DEFINER（安全定义者）网关函数验证 enrollment、主体、成员版本和 purpose，再访问供应商表。网关函数所有者是无登录、最小权力角色；固定 `search_path`、禁止动态 SQL（结构化查询语言）、撤销 `PUBLIC EXECUTE`、仅授予 checkpoint 角色执行权限、撤销底表对 runtime/checkpoint 角色的直接权限，并强制 RLS。无主体、跨租户、撤权、连接复用、伪造 thread ID、`SET ROLE` 均必须返回 0 行或拒绝。当前代码未实现该边界，因而该路径仍为发布阻断项。

### 2.2 RAG fill intent（填充意图）与对象删除账本

`RagFillIntent` 枚举为 `claimed · dispatching · unknown · settled · canceled`，每次转换以 CAS + 供应商幂等键 + 有序事件完成。表必须有 `scope_hmac/generation/recipe_version/provider`、`provider_request_id`、lease、fencing token、预算版本和审计字段；`provider_request_id` 全局唯一，且 `scope_hmac + generation + recipe_version + provider` 在 `claimed/dispatching/unknown` 活跃态上有部分唯一索引。`unknown` 的最长阻断时长、预算冻结、对账责任人和人工决策必须预登记；在确认 `settled` 或受权 `canceled` 前，禁止自动二次派发。`claimed/dispatching` lease 到期时：有“供应商确定未收到”回执才可 `canceled` 并由**新 generation**创建新 intent；其余一律转 `unknown`。缓存 value（值）必须含 `schema_version`、scoped identity 摘要、generation、ACL epoch、fencing token、到期时间、citation IDs（引用标识）和 tombstone revision；TTL 上限、CA 验证、离线命令队列关闭、主从切换和运行后 run 前缀清理均为验收项。

| from → to | 触发者与守卫 | 结果 |
| --- | --- | --- |
| `claimed → dispatching` | 单一 CAS winner；预算未冻结；供应商幂等键唯一 | 追加派发事件与请求标识 |
| `dispatching → settled` | 已验证供应商结果和 fencing token | 可发布授权缓存引用 |
| `dispatching → unknown` | 超时、网络半断或响应无法确认 | 冻结预算；自动派发数=0 |
| `unknown → settled/canceled` | 受权对账者；供应商请求标识和账单证据 | 追加人工决策；仍禁止新派发 |
| `claimed/dispatching → canceled` | 未派发或有明确取消回执 | 清理锁/临时值，不删除费用审计 |

每个 document version（文档版本）必须有 `DeletionTargetLedger`（删除目标账本），逐项列出原件、提取文本、OCR（光学字符识别）/ASR（自动语音识别）产物、chunk/vector（切块/向量）、缓存、citation、日志最小化引用、备份和第三方模型作业。每个 target 有 `pending · erased · retention_pending · exempt · failed` 状态、receipt、deadline（截止时间）和重试预算。上传凭据只能写入隔离对象名，绑定对象长度、内容哈希、单次写入、MIME（媒体类型）和到期时间；服务端复核后受控复制至正式前缀。viewer endpoint 不重定向到可复用 OSS URL，返回 `Cache-Control: no-store`，禁止 CDN（内容分发网络）缓存受保护内容。

| from → to | 触发者与守卫 | 结果 |
| --- | --- | --- |
| `pending → erased` | 删除 worker；target receipt 与读路径复验 | 在线可读残留为 0 |
| `pending → retention_pending` | 版本/备份保留策略命中 | 立即拒绝在线读取，记录到期时间 |
| `retention_pending → pending/exempt` | 保留到期后重新派发物理删除，或受权合规豁免 | 记录到期/豁免依据；`pending` 复用剩余重试预算 |
| `pending/retention_pending → failed` | 超过重试预算或目标不可达 | 触发告警；不得伪称已擦除 |
| `failed → pending` | 受权补偿者创建新的不可覆盖 `DeletionTargetAttempt`（删除目标尝试）、剩余重试预算和前次 receipt 完整 | 只重试该失败 sink；保留所有旧 receipt；已 `erased` 子项不可回退 |
| `exempt → pending` | 豁免到期/撤销，创建新的不可覆盖 `DeletionTargetAttempt`，复审 receipt 完整 | 重新派发物理删除；保留所有旧 receipt；已 `erased` 子项不可回退 |

### 2.3 凭据代理与三类云数据面的强制范围

`CredentialBroker`（凭据代理）是破坏性路径的唯一凭据入口：工作负载身份经控制面验证后，只能在 TargetGrant=`executing` 期间申请凭据；每次签发、刷新、撤销检查和阶段 receipt 均以同一个 `grant_id/run_id/attempt_id` 关联。迁移/E2E 凭据最大 TTL（存活时间）为 15 分钟，且仅能在未撤销的 `executing` 状态刷新；撤销、失联或到期后不得进入下一破坏性阶段：运行 attempt（尝试）进入补偿/解冻/`failed`，Grant 保持 `revoked/expired`，不改写为 `consumed`。当前静态 RDS 账户不满足该契约，绝不得用于破坏性路径。

| 数据面 | 服务端强制边界 | 越权拒绝证据 |
| --- | --- | --- |
| RDS | 每 run 独立数据库和 `e2e_<run_id>` 角色；角色无 `CREATEROLE`、无其他数据库 `CONNECT`、无生产网络路由；迁移角色仅能访问其绑定 database | 跨 run/数据库的连接、读、写、DDL 均失败；审计事件与表/DDL 计数为 0 |
| Tair | ACL（访问控制列表）限定 `~mw:e2e:<run_id>:*` 键模式与必要命令；若产品能力不足，使用独立实例或受控代理，禁止共享高权凭据 | 跨 run `GET/SET/SCAN/DEL/EVAL` 均拒绝；专用故障实例才可主从切换/逐出 |
| OSS | 临时凭据仅允许桶内 `runs/<run_id>/*` 的最小 `Put/Get/Delete/List` 操作，且 List 结果受前缀条件约束；禁止 bucket 级策略变更与其他前缀 | 跨 run/前缀的读、写、列举、删除均拒绝；云审计记录授权和拒绝 |

每个 `TC-CLOUD-*-E3` 必须同时直接调用 RDS、Tair、OSS 验证上述拒绝，不能只通过应用 HTTP 层断言。凭据代理、三类服务端策略和云审计导出未实施前，所有对应 TC 只能为 `blocked`。

### 2.4 暂停、孤儿与删除聚合的确定恢复规则

| 当前状态 | 唯一允许恢复/终止 | 守卫与补偿 |
| --- | --- | --- |
| `paused(resume_from_state=source_snapshotted)` | 旧 attempt CAS fence、旧 Grant `consumed`、旧短凭据撤销/会话终止 receipt 后；新 TargetGrant 同计划/同快照 `executing` → `source_snapshotted` | 原子转移 `source_freeze_id/source_freeze_epoch` 给新 attempt，源端不得解冻或写入；旧源冻结到期或转移失败只能 `aborted → unfreeze` |
| `paused/orphaned(resume_from_state=export_verified)` | 旧 attempt CAS fence（`fencing_token+1`）、Broker 拒绝旧刷新、旧短凭据三类数据面拒绝 receipt 后；新 TargetGrant 同计划/同快照 `executing` → `export_verified` | 原子转移 `source_freeze_id/source_freeze_epoch`，不解冻源端；已恢复批次摘要、对象数、schema revision 一致；新旧 attempt 并发胜者=1；转移不一致/失败 → `aborted → unfreeze` |
| `paused` 于 `source_frozen` 且未获得快照 | 仅 `aborted` | compensation owner 解冻源，禁止重用未固化快照 |
| `executing` grant 被撤销/到期 | attempt=`failed`，Grant 保持 `revoked/expired` | 不再执行下一阶段 SQL/对象写；解冻源、保留 receipt、重新申请 grant 才可新 run |

父聚合 `DocumentDeletionRun`（文档删除任务）枚举为 `requested · tombstoned · purging · retention_pending · retained_exempt · erased · failed`；子对象 `DeletionTargetLedger` 保持 `pending · erased · retention_pending · exempt · failed`。`requested → tombstoned` 必须先阻断所有在线读/检索/引用；`tombstoned → purging` 时创建每个 sink（落点）子项。所有子项为 `erased` 才可父级 `erased`；子项混合时父状态优先级固定为 `failed > retained_exempt > retention_pending > purging`，不允许状态回弹。`failed → purging` 仅允许受权补偿者带新删除 attempt 和剩余 retry budget 进入，且只重试 `failed` 子项；`retained_exempt → purging` 仅允许豁免到期/撤销且不存在其他 `exempt` 子项时进入，否则转 `retention_pending`。`exempt` 必须有受权人、不可变法律/合规依据、到期时间和复审任务。备份/第三方作业不能取得物理删除回执时只可 `retention_pending/failed`，不得伪造 `erased`。

## UC-CLOUD-01 · 以线上唯一依赖启动运行时

- **角色 Actor**：平台运维；API/Worker；受管云服务。
- **前置 Precondition**：存在同 VPC 运行器；所有身份符合上表；密钥由受控注入，不在镜像、Git 或 `.env`；生产目标具 TLS `verify-full`、多可用区及已签署 RPO/RTO。
- **触发 Trigger**：运维提交不可变 CloudRuntimeRelease。
- **主流程 Main**：
  1. 控制面签发并本地验证 ReleaseAttestation；如有待执行 DDL，再租用 TargetGrant，随后预检唯一云端目标和镜像 digest。
  2. `SchemaMigrationRun` 以 `migration` 身份取得 advisory lock，确认 manifest 对应 revision 后到达 `completed` 并消费 TargetGrant；release 只引用完成 receipt。
  3. API、Worker 和 checkpointer 使用同一解析器；`targetFingerprint` 含版本化、脱敏的资源 ID/数据库/CA 指纹/TLS 模式/schema revision，三者一致；`identityFingerprint` 仅含权限集版本，三者必须不同。
  4. API、Worker、RAG 和摄取分别执行受限就绪探针；Worker 指标端点仅私网暴露。
  5. 达标后 CAS 转为 `running_full`；否则记录失败码和证据，不切流量。
- **备选流 Alternate**：staging 资源可在其环境规则内运行；当前无 TLS 的 RDS 不得进入 production。
- **异常流 Exception**：

  | 流 | 场景与处置 | 落机制 |
  | --- | --- | --- |
  | E1 重复 | 同 manifest 重复提交回放首次状态。 | 幂等键 + CAS + 有序审计 |
  | E2 并发 | 两个 migrate/release 竞争，仅一个版本写成功。 | CAS；advisory lock 仅串行化 |
  | E3 越权 | 错误云账号、角色、DNS 重绑定、跨主体 checkpoint 均拒绝。 | ReleaseAttestation/TargetGrant + RLS + 私网网络策略 |
  | E4 失败回滚 | 未切流失败保持 `failed`；已切流先 drain，再按兼容窗口服务回切。 | forward-only 迁移计划 + 审计 |
  | E5 降级 | Tair/RAG 故障进入 `running_degraded`。 | RAG fail-closed（故障关闭）；模型调用数为 0 |
  | E6 超时/重连 | 连接预算耗尽或凭据轮转失败不重试收费请求。 | 有限重连 + 费用账本 `unknown` 对账 |
- **后置 Postcondition**：成功为 `running_full` 或受控 `running_degraded`，追加 release、ReleaseAttestation、SchemaMigrationRun 完成 receipt、迁移 revision 与就绪事件；失败为 `blocked/failed`，无本地依赖替代、无流量切换。
- **验收 Acceptance**：云 Compose（容器编排）不定义 `postgres`、`redis`、`minio`；不存在 localhost 回退；`targetFingerprint` 一致而 `identityFingerprint` 不同；运行身份 DDL/跨主体行数均为 0；检查点替换 thread ID 的读写删均为 0；生产 TLS 降级配置为 0。
- **关联 Relation**：CloudRuntimeRelease、ReleaseAttestation、必要时 TargetGrant；CAS/幂等键/RLS/持久有序事件；`TC-CLOUD-01-*`；网络、密钥、隐私和 checkpoint 隔离规则。
- **七类覆盖**：正常、异常、特殊（staging/production）、逃逸通道（错误目标/越权）、高并发、复杂（多依赖启动）、刁钻（DNS 重绑定/轮转/半断）。

## UC-CLOUD-02 · 受控迁移隔离测试数据至云 staging

- **角色 Actor**：迁移运维；本地测试数据源；RDS staging；OSS 临时迁移前缀。
- **前置 Precondition**：源卷只读清点；`migration` 与 `e2e` 独立；TargetGrant 已获批准；目标是每次新建的独占测试数据库/实例，或已完整且可验证的 staging 迁移账本。
- **触发 Trigger**：受权操作者以 expected version 提交 `planned → preflighted`。
- **主流程 Main**：
  1. 执行两次目标预检；发现非空业务表且账本不合法立即在 DDL 前失败。
  2. 冻结源写入，取得一致性快照/LSN，并记录无原文的 manifest。
  3. 在目标先运行版本化迁移，再执行加密 data-only 导出/恢复和批次 HMAC 对账。
  4. 校验内容、关系、序列、RLS、扩展与对象引用；恢复至隔离目标完成演练。
  5. 受权人审批才 `promoted`；源数据和未批准目标均不删除。
- **备选流 Alternate**：未接通 OSS 摄取链时只迁结构化、无敏感测试数据；不把本地 MinIO 当已迁移对象。
- **异常流 Exception**：

  | 流 | 场景与处置 | 落机制 |
  | --- | --- | --- |
  | E1 重复 | 相同 manifest/batch nonce 回放并返回已有摘要。 | 幂等键 + manifest |
  | E2 并发 | 两个进程争同 run，仅一个进入 `restoring`。 | CAS + advisory lock |
  | E3 越权 | 错 grant、生产/共享 staging、错误 VPC、账本缺失均首个 SQL 前拒绝。 | TargetGrant + e2e 隔离身份 |
  | E4 失败回滚 | 校验或恢复失败转 `failed`；服务回切或重建独立目标，不删除源。 | 迁移状态机 + 备份恢复证据 |
  | E5 降级 | OSS 临时前缀不可用即 `paused`，不改用共享本地目录。 | fail-closed + 有序事件 |
  | E6 超时/重连 | 恢复中断转 `orphaned`；先按内容摘要对账，再由人工续跑。 | lease + 批次 nonce + CAS |
- **后置 Postcondition**：成功为 `promoted`，追加 manifest、内容摘要、审批、恢复和切流事件；失败为 `failed/aborted` 并解除源冻结，源与生产环境均无写入。
- **验收 Acceptance**：期望 migration ID 从冻结 manifest 动态派生且 100% checksum 一致；每表内容摘要/行数/关系/序列一致率 100%；非法目标的业务 SQL、DDL 与 OSS 写入均为 0。
- **关联 Relation**：CloudMigrationRun、TargetGrant；CAS/幂等键/RLS/持久有序事件；`TC-CLOUD-02-*`；迁移、备份恢复、密钥和数据保留规则。
- **七类覆盖**：正常、异常、特殊（空库/已迁移库）、逃逸通道（错误授权/生产目标）、高并发、复杂（快照-恢复-演练）、刁钻（账本缺失/冻结超时/断线）。

## UC-CLOUD-03 · 使用 Tair 作为云端 RAG 热缓存

- **角色 Actor**：Worker；Tair；RDS 费用/填充意图账本。
- **前置 Precondition**：同 VPC 运行器、`rediss://` 与证书验证、专用前缀和独立凭据；RDS 是费用幂等真相。
- **触发 Trigger**：受授权主体发起 RAG 查询。
- **主流程 Main**：
  1. Worker 生成不泄露原文的 scoped HMAC cache identity，读取 Tair。
  2. miss 时 Lua（Redis 原子脚本）只选出一个 owner；所有 contender 绑定同一 RDS fill intent（填充意图）。
  3. owner 以 fencing token（围栏令牌）发布有限 TTL（存活时间）引用；每次命中重新授权。
  4. 费用状态依次为 `claimed → dispatching → unknown|settled`；`unknown` 由对账任务和受权人工处理，禁止自动二次供应商请求。
- **备选流 Alternate**：无活跃 generation 或值无法重新授权时，返回受控不可用结果，不扩大检索范围。
- **异常流 Exception**：

  | 流 | 场景与处置 | 落机制 |
  | --- | --- | --- |
  | E1 重复 | 同 identity 重用同一 fill intent。 | 幂等键 |
  | E2 并发 | 32+ 并发只允许一个 winner。 | Lua + RDS CAS + fencing |
  | E3 越权 | tenant/principal/ACL epoch/generation 不同永不共享；命中后二次授权。 | scoped HMAC + RLS |
  | E4 失败回滚 | 供应商请求已派发但响应不明，状态为 `unknown`。 | 费用对账状态机；无自动重发 |
  | E5 降级 | TLS、认证、主从切换、逐出或网络半断时 RAG fail-closed。 | `running_degraded` + 有界超时 |
  | E6 超时/重连 | 旧 owner lease 到期后恢复，publish 必须失败。 | fencing token + 账本对账 |
- **后置 Postcondition**：缓存仅有受限引用；追加 fill intent、费用状态、fencing 和授权事件；费用、授权、版本与删除真相在 RDS。
- **验收 Acceptance**：真实 Tair 的并发 winner=1、旧 owner 覆盖=0、跨主体命中=0、缓存故障时 embedding（向量化）/ANN（近似最近邻）/旧缓存回退调用=0；费用 `unknown` 有唯一供应商请求标识和对账结果。
- **关联 Relation**：CloudRuntimeRelease、RAG fill intent/费用账本；CAS/幂等键/RLS/持久有序事件；`TC-CLOUD-03-*`；成本、缓存和凭据轮转规则。
- **七类覆盖**：正常、异常、特殊（generation/ACL 变化）、逃逸通道（缓存越权/费用重放）、高并发、复杂（RDS+Tair+供应商）、刁钻（旧 owner/半断/未确认派发）。

## UC-CLOUD-04 · 在 OSS 上摄取与撤销全格式 RAG 原件

- **角色 Actor**：受权用户/企业成员；上传服务；摄取 Worker；OSS；人工审核员。
- **前置 Precondition**：真实 OSS adapter、私有桶、版本控制、`tenant/document/version` 隔离、AV（反病毒）签名回执、无网络解析沙箱和人工审核已部署；当前任一未满足则能力保持不可用。
- **触发 Trigger**：用户上传、解析、引用、撤权或删除原件。
- **主流程 Main**：
  1. 服务端每次重新授权，发放极短时、单对象、不可缓存的上传凭据；敏感原件查看经受控 viewer endpoint（查看端点）重新授权，而非依赖无法即时撤销的长效预签名 URL（统一资源定位符）。
  2. 对文件魔数与 MIME（媒体类型）双验，限制大小、页数、时长和解压比；拒绝宏、外链、密码文件、压缩炸弹与多格式伪装。
  3. 原件先进入 `quarantine → scanning → extracting → reviewing → published`；隔离前缀只能受控复制到正式前缀，所有回调以 task/version nonce 防重放。
  4. 删除先 CAS 写 `tombstoned`，立即阻断新读/检索/引用；随后进入 `purging` 清除在线对象、向量、缓存、引用和派生物，仅在所有子项物理擦除后变为 `erased`；有保留对象则保持 `retention_pending`。
- **备选流 Alternate**：扫描、解析或质量门失败时保持隔离并进入人工审核；不得复用失败产物。
- **异常流 Exception**：

  | 流 | 场景与处置 | 落机制 |
  | --- | --- | --- |
  | E1 重复 | 相同 content hash/version 幂等；不同内容创建新版本。 | 幂等键 + 版本约束 |
  | E2 并发 | 上传、删除和回填竞争时 tombstone 优先。 | content version CAS + tombstone |
  | E3 越权 | 非 owner、撤销成员、旧 URL、历史版本 URL 与跨租户 prefix 均拒绝。 | RLS + viewer 每次重授权 |
  | E4 失败回滚 | 多 sink 删除失败停在 `purging`，按目标幂等续做。 | 有序事件 + 删除账本 |
  | E5 降级 | OSS/扫描/沙箱不可用时拒绝上传或解析，不落本地盘与日志。 | fail-closed |
  | E6 超时/重连 | 回调重放、扫描超时、上传与删除竞态按 nonce 对账。 | 任务事件 + CAS |
- **后置 Postcondition**：成功 `published` 时追加版本、扫描、提取、审核与 citation 事件；`tombstoned` 后线上可读对象、向量、缓存、引用残留均为 0；版本化对象/备份受保留策略控制，不得假称即时物理清除。当前 OSS 的历史版本保留 90 天，期间状态为 `retention_pending`；到期后验证物理残留为 0 或按合规策略完成加密销毁。
- **验收 Acceptance**：未授权/跨租户读写=0；撤权前已签发 URL、历史版本 URL、CDN（内容分发网络）缓存和并发下载均不能再次取得受保护内容；各格式用真实样本产生可回跳 citation（引用），并记录格式、样本量、恶意样本、解析质量和 locator（定位器）精度。
- **关联 Relation**：文档版本/擦除聚合、TargetGrant；CAS/幂等键/RLS/持久有序事件；`TC-CLOUD-04-*`；隐私删除、对象保留、人工审核和摄取安全规则。
- **七类覆盖**：正常、异常、特殊（格式/版本/保留期）、逃逸通道（旧 URL/跨租户）、高并发、复杂（多 sink 删除）、刁钻（压缩炸弹/回调重放/删除竞争）。

## 3. 可追溯测试矩阵与当前证据状态

唯一测试来源是 [云端运行与迁移测试矩阵](../../testing/cloud-runtime-migration-test-matrix.md)。该矩阵展开 `TC-CLOUD-01-main` 至 `TC-CLOUD-04-E6` 共 28 条独立 TC（测试用例）；不得用合并编号替代任何 E1–E6 流。

每个 TC 都保存 `planned|blocked|executed|failed|passed|inconclusive` 状态、TargetGrant 摘要、资源脱敏 fingerprint、镜像 digest、运行器规格、数据集 revision、最小样本量、并发度、持续时间、命令/计划 job ID、故障注入、清理验收、P50/P95/P99、错误率、连接池等待、RDS/Tair 指标、模型调用数/成本和证据 URI。阈值登记必须由责任人签名并版本化，且在运行前冻结；相同配置连续三次运行，任何一次超阈或样本不足均为 `inconclusive`（结论不充分），禁止晋级。

## 4. 发布禁令

以下任一项不满足，CloudRuntimeRelease 必须为 `blocked`；不得将静态检查、本地 Docker 或控制面“运行中”误称为真实云端验证：

本能力的 `release-required TC` 固定为测试矩阵中的 28 条：`TC-CLOUD-01-main/E1/E2/E3/E4/E5/E6`、`TC-CLOUD-02-main/E1/E2/E3/E4/E5/E6`、`TC-CLOUD-03-main/E1/E2/E3/E4/E5/E6`、`TC-CLOUD-04-main/E1/E2/E3/E4/E5/E6`。每份签名 release manifest（发布清单）必须嵌入排序后的 TC ID 集合摘要、`THR-CLOUD-v1`（云端阈值版本）摘要、数据集 revision 和三次证据 URI；缺任何一个即 `blocked`。增删任何条目必须新建本规范版本并重新签署阈值清单；不允许临时排除未通过 TC，任何豁免仍保持阻断事实。

- 运行时仍能回退至 localhost、`postgres`、`redis` 或 `minio`。
- API、Worker、checkpointer 的解析目标或最低权限身份不一致；检查点无逐行 RLS。
- 测试入口在 TargetGrant 本地验证前发出 SQL/HTTP，或可触及共享 staging/生产目标。
- 目标含业务表而迁移账本不存在、损坏或 checksum 不匹配。
- production RDS 未具 TLS `verify-full`、多可用区、签署 RPO/RTO 和实际恢复演练证据。
- 每一个 release-required TC（测试用例）未同时满足 `passed`、签名阈值版本、三次真实云运行和完整证据 URI；`planned`、`executed`、`blocked`、`failed`、`inconclusive` 任一状态均阻断发布。
- Tair、OSS、RLS、迁移、性能/成本三次重复测试或全格式摄取任一对应证据不满足 [THR-CLOUD-v1](../../testing/cloud-runtime-performance-thresholds.md)。
