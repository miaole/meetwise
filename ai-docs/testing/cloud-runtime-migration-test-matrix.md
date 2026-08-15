---
id: testing_cloud_runtime_migration_matrix
name: 云端运行与迁移测试矩阵
description: 为云端唯一依赖、迁移、Tair 缓存和 OSS 摄取定义可追溯的非理想化测试用例与证据要求。
type: testing
scope: shared
level: spec
status: draft
owner: qa
version: 6
related:
  - ../requirements/use-cases/cloud-runtime-and-migration.md
  - ../architecture/adr/0017-cloud-runtime-target-grant.md
  - ./cloud-runtime-performance-thresholds.md
tags:
  - cloud
  - migration
  - security
  - e2e
---

# 云端运行与迁移测试矩阵

本矩阵是 [云端唯一依赖运行与迁移用例](../requirements/use-cases/cloud-runtime-and-migration.md) 的测试下游。它不以 HTTP 200（超文本传输协议成功状态码）、容器存活或 mock（模拟）结果作为通过条件。每一项必须保存测试记录：TC ID、代码/镜像 digest（内容摘要）、TargetGrant（目标授权）摘要、隔离 run ID、资源脱敏 fingerprint、时间、样本量、命令、故障注入、状态机事件、指标和证据 URI（统一资源标识符）。

## 0. 执行前共同门槛

1. 控制面先完成 `TestTargetProvisionRun`（测试目标供给任务），创建独占目标并将其绑定到 run ID；运行器离线验证 TargetGrant（目标授权）签名、`issuer/audience/key_id`、到期、环境、操作、run ID、镜像 digest、RDS（关系型数据库服务）/Tair/OSS（对象存储服务）前缀绑定，再 CAS（比较并交换）租用并进入 `executing`。本地校验失败时 SQL（结构化查询语言）/HTTP（超文本传输协议）=0；只有目标指纹、DNS（域名解析）或 CA（证书颁发机构）类错误可建立**只读预检**连接，任何失败均要求 DDL（数据定义语言）/业务 DML（数据操纵语言）/OSS 写=0。
2. 云端集成/E2E（端到端）只使用 `e2e` 身份与本 run 新建的独占数据库、Tair 前缀、OSS 前缀；任何共享 staging（预发布环境）或 production（生产环境）目标均失败。Tair 主从切换/逐出等破坏性故障只允许专用实例。
3. 每个破坏性 case 先采集目标表数、行数、schema revision（模式修订）和 OSS 对象数；拒绝路径结束后必须逐项相同，且数据库审计显示 DDL（数据定义语言）数为 0。case 结束后控制面逐项清理本 run 创建资源，并保存清理 receipt（回执）。
4. 对 release-required（发布必需）的真实云 TC，唯一契约仍为 `pnpm cloud:verify --case <TC-ID> --run <run-id>`，计划 job ID 为 `cloud-verify:<TC-ID>`；在该命令和 job 实现前，不得将任何 release-required TC 标为 `passed`。目标执行体是项目私网 ECS executor；GitHub Actions runner、开发机和历史 FC 形态均不能取得破坏性数据面凭据。历史 `testOnly=true` 串行回执只能记录 `TC-CLOUD-TEST-*` 的测试迁移进度，永远不改变发布矩阵状态。Tair、RDS、OSS、模型和网络故障均必须用可复现注入方式，而非手工“看起来像断了”。每个 E3 还须直接用 `e2e` 凭据调用三类数据面，跨 run 的 RDS/Tair/OSS 读、写、列举、删除均为 0，并保存云审计证据。
5. 任何真实云性能 TC（测试用例）至少连续执行 3 次；阈值、样本量、并发、持续时间、资源规格和成本预算以 [THR-CLOUD-v1](./cloud-runtime-performance-thresholds.md) 为准，在运行前签名冻结。
6. 历史 test-only 试跑和最小 HMAC 回执不构成 serial runner 的通过证据。独立数据库/SRE 审计已确认旧实现没有 crash recovery、attempt fence、目标实例身份绑定和本 run 资源拥有证明；因此 `TC-CLOUD-TEST-001` 至 `003` 的 main/E1 均回退为 `blocked`，直至**ECS executor**在真实 PostgreSQL 故障注入覆盖 E1–E6。它不是完整 E2E（端到端）运行器。OSS adapter（适配器）仍未实现。因此所有 release-required（发布必需）“真实云” TC 当前均为 `blocked`；本矩阵定义的是未来可执行验收，不构成通过证据。

## 0.1 TC-CLOUD-TEST-001：项目专用串行 RDS 测试执行器

此组只验证测试执行器，不属于 28 条 release-required（发布必需）TC；每条结果均固定 `test_only=true`、`releaseEvidence=false`。它只在项目负责人明确授权的非生产、项目专用 RDS（关系型数据库服务）目标执行，且全实例串行；固定只读 smoke（冒烟测试）库不属于该组。

| TC ID / 分类 | 隔离样本与注入 | 步骤 | 业务事实断言 | 层 / 当前状态 |
| --- | --- | --- | --- | --- |
| `TC-CLOUD-TEST-001-main` 正常 | 合法 run、登记 case、已验证 target profile、私网专用测试身份 | 原子租约/attempt→资源 intent→创建精确 run 数据库/临时角色→执行受限 case→按拥有清单清理→回读 | 仅本 attempt 登记的 `meetwise_e2e_<run>` 与 `mw_e2e_<run>` 被触及；清理后两者=0；回执为测试证据 | 私网云测试执行器 / `blocked` |
| `TC-CLOUD-TEST-001-E1` 异常/重放 | 相同 run/case/artifact 连续提交 | 重放终态或拒绝非终态 | 不创建第二个数据库、角色或回执链 | 串行集成 / `blocked` |
| `TC-CLOUD-TEST-001-E2` 高并发 | 20 个相同或不同 run 并发请求 | 同时取得实例租约 | winner=1；其余 DDL=0 | 串行集成 / `blocked` |
| `TC-CLOUD-TEST-001-E3` 逃逸/越权 | 固定只读库、错误账户/实例/VPC/证书、环境变量污染、错误命名 | 发起测试命令 | 控制库创建和首条业务 DDL 前拒绝；业务对象=0 | 安全集成 / `blocked` |
| `TC-CLOUD-TEST-001-E4` 异常/中断 | `requested/leased/executing` 及每条创建/删除 DDL 后强杀 | 仅过期 attempt 的恢复器执行清理 | 只清理本 attempt 已拥有资源；其他 run/外来同名角色=0 影响；原 suite 不自动重跑 | 恢复集成 / `blocked` |
| `TC-CLOUD-TEST-001-E5` 特殊/能力缺失 | 缺 vector（向量）/HNSW（分层可导航小世界索引）/CREATEDB（创建数据库）/CREATEROLE（创建角色） | preflight（预检） | 持久 `failed`，fail-closed（故障关闭）；业务对象=0 | 配置集成 / `blocked` |
| `TC-CLOUD-TEST-001-E6` 刁钻/清理失败 | 删除数据库或角色后回读异常、外来 sentinel 角色/成员 | 完成清理阶段 | run=`failed_cleanup`，外来资源不改，不得标记通过 | 恢复集成 / `blocked` |

## 0.2 TC-CLOUD-TEST-002：云端隔离套件替换 Docker 数据面

该组迁移的是需要 PostgreSQL（关系型数据库）、Tair（托管 Redis）、OSS（对象存储服务）、API/Worker（后台任务进程）或浏览器运行器的数据面 gate；纯函数、契约、文档和 fake（模拟）模型测试不依赖 Docker，不应为了形式而上云。固定只读 smoke 不属于本组。

| TC ID / 分类 | 隔离样本与注入 | 步骤 | 业务事实断言 | 层 / 当前状态 |
| --- | --- | --- | --- | --- |
| `TC-CLOUD-TEST-002-main` 正常 | allowlist database-local suite、严格 target profile/TLS、私网运行器 | CAS 租约→临时 DB/token→固定 suite→按 attempt-owned 清理 | suite 仅触及其 run 资源；receipt/清理均完整；同 suite 连续两次通过且 E1–E6 通过后才可移除 Docker 路由 | 云端测试执行器 / `blocked` |
| `TC-CLOUD-TEST-002-E1` 异常/重放 | 相同 run/suite/artifact | 连续提交 | receipt=1；不重建 DB/角色、不二次执行子进程 | 串行集成 / `blocked` |
| `TC-CLOUD-TEST-002-E2` 高并发 | 20 个不同或相同 run | 同时租约 | winner=1；其他 DDL/子进程=0 | 串行集成 / `blocked` |
| `TC-CLOUD-TEST-002-E3` 逃逸/越权 | fixed-readonly、错误实例/DB/token、任意命令、环境污染、非 TLS | 发起执行 | 首条业务 SQL 前拒绝；业务/共享目标=0 | 安全集成 / `blocked` |
| `TC-CLOUD-TEST-002-E4` 异常/中断 | 执行中断、孤儿资源 | successor cleanup | 仅 manifest 列出的精确 run 资源被清理；其他 run=0 | 恢复集成 / `blocked` |
| `TC-CLOUD-TEST-002-E5` 特殊/能力缺失 | 缺 vector/HNSW、Tair、OSS、Chromium 或角色能力 | preflight / suite run | 状态=`failed`；本地 Docker fallback=0 | 配置集成 / `blocked` |
| `TC-CLOUD-TEST-002-E6` 刁钻/清理失败 | DB/role/key/object 删除后回读异常、迟到进程 | finalization | 状态=`failed_cleanup`；CI 不通过；跨 run 自动清理=0 | 恢复集成 / `blocked` |

### 0.3 TC-CLOUD-TEST-003：pgvector 检索 proof 的云端数据面

该子套件只迁移原 `pnpm vectorstore:prove` 的 PostgreSQL/pgvector 断言：向量写入、HNSW 检索、RLS 隔离、去重和“无正文列”检查。它不读取模型、Tair、OSS、API、浏览器或业务数据；每次仅在项目专用临时数据库中运行。

| TC ID / 分类 | 隔离样本与注入 | 步骤 | 业务事实断言 | 层 / 当前状态 |
| --- | --- | --- | --- | --- |
| `TC-CLOUD-TEST-003-main` 正常 | 原 `vectorstore:prove` 断言体、独占 database-local target、严格 target profile/TLS、私网运行器 | 租约→临时 DB/token→SQL schema/retrieval→HNSW/RLS/去重断言→按 attempt-owned 清理 | 同一断言体通过；临时数据库/角色回读为 0 | 云端测试执行器 / `blocked` |
| `TC-CLOUD-TEST-003-E1` 异常/重放 | 相同 run、artifact 与 suite | 连续提交 | receipt=1；不第二次写向量或重建资源 | 串行集成 / `blocked` |
| `TC-CLOUD-TEST-003-E2` 高并发 | 20 个相同或不同 run | 同时租约 | winner=1；其余在首条 DDL 前失败 | 串行集成 / `blocked` |
| `TC-CLOUD-TEST-003-E3` 逃逸/越权 | fixed-readonly、错误 run/token、环境污染、非私网或非 TLS 目标 | 发起执行 | 首条业务 SQL 前拒绝；共享库/业务对象=0 | 安全集成 / `blocked` |
| `TC-CLOUD-TEST-003-E4` 异常/中断 | schema/retrieval 执行中断 | successor cleanup | 只根据精确资源清单回收本 run；其他 run=0 | 恢复集成 / `blocked` |
| `TC-CLOUD-TEST-003-E5` 特殊/能力缺失 | 缺 vector、HNSW 或权限 | preflight / suite run | `failed`；Docker fallback=0 | 配置集成 / `blocked` |
| `TC-CLOUD-TEST-003-E6` 刁钻/清理失败 | 删除 DB/role 后回读异常、迟到连接 | finalization | `failed_cleanup`；不标记通过 | 恢复集成 / `blocked` |

## 1. TC-CLOUD-01：云端唯一依赖运行时

| TC ID / 分类 | 隔离样本与注入 | 步骤 | 业务事实断言 | 层 / 当前状态 |
| --- | --- | --- | --- | --- |
| `TC-CLOUD-01-main` 正常 | 受签名的 ReleaseAttestation（发布证明）、必要时独立 TargetGrant、同 VPC runner、三个独立凭据 | 发布→迁移→API/Worker 启动→读 readiness | `CloudRuntimeRelease=running_full`；云 Compose 无 postgres/redis/minio；targetFingerprint 一致、identityFingerprint 不同；本地回退=0 | 真实云 E2E / `blocked` |
| `TC-CLOUD-01-E1` 异常/重复 | 相同 release manifest 与幂等键连续提交两次 | 并行前后提交 | 只有一条 release 审计事实；二次响应重放首次状态；无第二次 migrate | 集成 + 真实云 / `planned` |
| `TC-CLOUD-01-E2` 高并发 | 两个控制面进程、相同 expectedVersion | 同时 preflight/migrate | CAS（比较并交换）成功数=1；输家回查结果；advisory lock 不能掩盖版本冲突 | 集成 + 真实云 / `planned` |
| `TC-CLOUD-01-E3` 逃逸/越权 | ReleaseAttestation（发布证明）重放/过期/撤销/篡改，grant 并发重放、过期/撤销/篡改签名、错误 audience/镜像 digest、错云账号、错误角色、DNS（域名解析）重绑定、错误 CA（证书颁发机构）、A/B thread ID | 分别尝试预检、租用授权、启动、读写 checkpoint | 发布证明仅允许一次预检；grant lease CAS（比较并交换）胜者=1；SchemaMigrationRun 遇授权撤销/过期为 `failed` 且 Grant 保持 `revoked/expired`；各失败码可区分；首 SQL 前拒绝目标错误；跨主体 checkpoint 读/写/删=0 | 安全集成 + 真实云 / `planned` |
| `TC-CLOUD-01-E4` 异常/失败 | migrate 半程失败、不可兼容二进制、授权撤销/过期 | 注入失败后尝试切流 | release=`failed`；撤销/过期不消费 Grant；流量切换=0；已提交迁移遵守 forward-only（只前进）计划且可服务回切 | 集成 / `planned` |
| `TC-CLOUD-01-E5` 特殊/降级 | Tair TLS（传输层加密）握手失败、RAG 依赖超时 | 正常 API 请求与 RAG 请求并发 | release=`running_degraded`；非 RAG 路径仍合约可用；RAG 为受控依赖错误；embedding（向量化）/ANN（近似最近邻）调用=0 | 故障注入 E2E / `blocked` |
| `TC-CLOUD-01-E6` 刁钻/重连 | Runner 滚动重启、RDS/Tair 凭据轮转、网络半断 | 在活动任务与 readiness 探针期间注入 | 没有泄露拓扑；有界重连；未确认外部费用转 `unknown` 且无自动二次派发 | 混沌 E2E / `blocked` |

## 2. TC-CLOUD-02：隔离数据迁移

固定 fixture：匿名化的多表测试集，含空值、Unicode（统一码）、长文本、JSON（对象数据格式）、金额、枚举、父子关系、序列、RLS（行级安全）行与 `NOT VALID` 约束。每表按稳定主键排序、规范化序列化后分桶产生 HMAC（哈希消息认证码）内容摘要；原文不写日志。

| TC ID / 分类 | 隔离样本与注入 | 步骤 | 业务事实断言 | 层 / 当前状态 |
| --- | --- | --- | --- | --- |
| `TC-CLOUD-02-main` 正常 | 固定 fixture、独占空目标、批准 grant | 冻结源→快照/LSN（日志序列号）→迁移→恢复→内容对账→恢复演练 | 目标 manifest 全部 checksum 一致；行/内容/关系/序列/RLS/扩展=100%；`promoted` 仅在审批后 | 真实云 E2E / `blocked` |
| `TC-CLOUD-02-E1` 异常/重复 | 相同 manifest/batch nonce（一次性编号） | 在导出、恢复、审批阶段各重放一次 | 每批次仅一份数据；同一审批结果重放；事件无重复 | 集成 / `planned` |
| `TC-CLOUD-02-E2` 高并发 | 两个 runner 竞争同一 run | 同时进入 restore | CAS winner=1；另一个进入冲突回查；目标内容摘要无双写 | 集成 + 真实云 / `planned` |
| `TC-CLOUD-02-E3` 逃逸/越权 | 缺/过期/撤销/伪造 grant、错误 plan manifest、生产库、共享 staging、错误 VPC、非空且账本缺失的目标 | 分别运行迁移入口 | 第一 SQL/HTTP 前本地拒绝 grant 错误；若预检已连接，DDL/业务写/OSS 写=0；baseline 不得执行 | 安全集成 / `planned` |
| `TC-CLOUD-02-E4` 异常/失败 | 内容字段截断、外键破坏、恢复中断、基础备份恢复失败、中途撤销/过期 TargetGrant | 执行到验证/演练再注入 | 不能 `promoted`；撤销/过期固定为 `failed`、补偿解冻；撤销后下一阶段 SQL/OSS 写=0；连接失联且授权仍有效才可 `orphaned`；目标证据保留 | 恢复演练 / `blocked` |
| `TC-CLOUD-02-E5` 特殊/降级 | OSS 临时迁移前缀不可写 | 导出之前/中间关闭权限后执行 successor handover | 状态=`paused(resume_from_state=source_snapshotted)`；旧 attempt fence、旧 RDS/Tair/OSS 凭据拒绝；新旧 winner=1；源写成功数=0；`source_freeze_id/source_freeze_epoch` 仅转移不释放；转移失败=`aborted → unfreeze`；不使用本地共享目录；已完成批次保持可审计 | 集成 / `planned` |
| `TC-CLOUD-02-E6` 刁钻/重连 | 源冻结后 runner 心跳/连接丢失、长时间挂起、源端有人试图写、旧 runner 恢复；TargetGrant 始终仍为 `executing` | 先使 run orphaned，再尝试 successor handover | 自动重跑=0；旧 attempt fence 后三类旧凭据读写/继续阶段=0；新旧并发 winner=1；源写成功数=0；冻结 owner/epoch 仅转移不释放；转移失败=`aborted → unfreeze`；人工对比内容摘要后才可 CAS 续跑；TargetGrant 到期不属于本 TC，必须走 E4 的 `failed` | 混沌 E2E / `blocked` |

## 3. TC-CLOUD-03：Tair RAG 热缓存与费用

固定 fixture：同 query（查询）32+ 并发、不同 tenant（租户）/principal（主体）/ACL epoch（授权版本）/generation（代际）的等价检索请求，及明确的供应商 idempotency key（幂等键）。所有 cache key 只保存 scoped HMAC，不存原 query 或主体。

| TC ID / 分类 | 隔离样本与注入 | 步骤 | 业务事实断言 | 层 / 当前状态 |
| --- | --- | --- | --- | --- |
| `TC-CLOUD-03-main` 正常 | 32+ 同 identity 并发、真实 `rediss://` | 同时 acquire→fill→publish→hit | Lua（Redis 原子脚本）winner=1；供应商派发=1；RDS fill intent=1；fencing token（围栏令牌）单调 | 真实 Tair E2E / `blocked` |
| `TC-CLOUD-03-E1` 异常/重复 | 同 identity 重放与已有已结算 fill | 连续 hit/miss | 复用同一 fill intent；模型收费请求=0（已有结果）或=1（首次） | 集成 / `planned` |
| `TC-CLOUD-03-E2` 高并发 | 128 并发、跨槽/锁竞争 | 多轮 parallel acquire | 每轮恰 1 winner；等待者不模型调用；RDS CAS 失败者回读同一结果 | 压力 E2E / `blocked` |
| `TC-CLOUD-03-E3` 逃逸/越权 | 改 tenant/principal/ACL epoch/generation、已撤销 owner | 对同 key 形状尝试 hit/publish | 跨作用域命中=0；RLS 二次授权=0 行；旧 owner publish 失败 | 安全集成 / `planned` |
| `TC-CLOUD-03-E4` 异常/失败 | 供应商已接收而响应丢失 | 在 dispatch 后断开并模拟不确定结果 | 费用状态=`unknown`；供应商请求标识唯一；自动重发=0；对账后仅一次 `settled` 或人工终止 | 集成 / `planned` |
| `TC-CLOUD-03-E5` 特殊/降级 | 主从切换、逐出、ACL 变更、TLS 失败 | 分阶段注入 | RAG fail-closed；旧值不越权回放；API 非 RAG 路径不被误判不健康 | 故障注入 E2E / `blocked` |
| `TC-CLOUD-03-E6` 刁钻/重连 | 网络半断、旧 owner lease 到期后恢复 | 旧 owner 延迟 publish | publish=0；新 owner 的 fencing token 胜出；费用账本无第二次扣费 | 混沌 E2E / `blocked` |

## 4. TC-CLOUD-04：OSS 全格式摄取、撤权和擦除

固定 fixture：每种已宣称格式的良性文档、表格、PPT（演示文稿）、图片、音视频；并包含压缩炸弹、宏文件、外链文件、密码文件、伪造 MIME、polyglot（多格式伪装）、超页数/时长文件、恶意回调和 CDN（内容分发网络）缓存的旧 URL（统一资源定位符）。每个 fixture 标注格式、大小、预期结构元素、允许的 citation（引用）与 locator（定位器）误差。

| TC ID / 分类 | 隔离样本与注入 | 步骤 | 业务事实断言 | 层 / 当前状态 |
| --- | --- | --- | --- | --- |
| `TC-CLOUD-04-main` 正常 | 每种良性 fixture、独占 tenant/document/version 前缀 | 上传→扫描→解析→人工批准→检索 citation | 状态到 `published`；引用回跳正确不可变对象版本；预登记解析/定位阈值通过 | 真实 OSS E2E / `blocked` |
| `TC-CLOUD-04-E1` 异常/重复 | 相同 content hash/version 两次上传 | 重复上传与重放回调 | 对象版本、任务、引用各=1；响应重放首次结果 | 集成 / `planned` |
| `TC-CLOUD-04-E2` 高并发 | 上传、删除、回填同时发起 | 并发执行 | tombstone CAS 胜出后新读/新写=0；不发生回填复活 | 集成 + OSS / `blocked` |
| `TC-CLOUD-04-E3` 逃逸/越权 | 撤权前旧 URL、历史版本 URL、CDN 缓存、跨租户 prefix | 撤权后并发下载/引用 | viewer endpoint 每次授权；在线可读对象/向量/缓存/引用=0；跨租户=0 | 安全 E2E / `blocked` |
| `TC-CLOUD-04-E4` 异常/失败 | 任一 sink 删除失败 | tombstone 后断开向量、缓存或 OSS 删除，再创建新的 DeletionTargetAttempt（删除目标尝试） | 状态=`purging`；成功 sink 不反弹；只失败 sink 获得新 attempt；旧 receipt 不覆盖；不假称 `erased` | 集成 / `planned` |
| `TC-CLOUD-04-E5` 特殊/降级 | AV（反病毒）不可用、沙箱超时、桶拒绝写 | 提交良性和恶意 fixture | 全部留在隔离或拒绝；本地落盘/日志原文=0；公开链接=0 | 安全集成 / `planned` |
| `TC-CLOUD-04-E6` 刁钻/重连 | 压缩炸弹、伪造 MIME、重放回调、扫描超时、版本化删除、豁免到期/撤销 | 反复重投并让 URL 到期，再复审豁免 | 无网络沙箱出站=0；nonce 唯一；`tombstoned` 后在线残留=0；豁免失效后仅对应 sink 获得新 DeletionTargetAttempt；90 天保留期内仅 `retention_pending`，期满后才验物理残留 | 安全/混沌 E2E / `blocked` |

## 5. 结果判定与不可冒充规则

- `passed`：目标、身份、样本、断言、证据完整，且真实云测试按预登记阈值连续三次满足。
- `failed`：断言不满足；保留证据和清理记录，不得用重跑覆盖失败。
- `blocked`：缺少运行器、TargetGrant、adapter、权限或符合条件的云资源；不是失败，也不能记作通过。
- `inconclusive`（结论不充分）：样本不足、指标缺失、阈值事后补填、运行环境漂移或任一三次结果超阈；不能用于 release（发布）晋级。

真实云性能报告还必须包含 RDS 规格/RCU（资源容量单位）、Tair 规格、数据集 revision、并发/持续时间、P50/P95/P99、错误率、连接池等待、模型调用量/成本和预算上限。不得把本地 PostgreSQL（关系型数据库）、Redis、MinIO 的结果标为线上性能或可用性结果。
