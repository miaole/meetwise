---
id: uc_rag_corpus_control_plane
name: 通用 RAG 语料版本控制面身份隔离
description: 将全格式 RAG 语料的私有写入与 generation（检索世代）控制操作分离为不同数据库身份，禁止用可伪造会话变量充当授权根。
type: requirement
scope: shared
level: spec
status: proposed
owner: architecture
related:
  - ../../architecture/ai/rag-corpus-lifecycle.md
  - ./full-format-rag-platform.md
  - ../../rules/global/production-invariants.md
  - ../../testing/strategy/test-strategy.md
---

# 通用 RAG（检索增强生成）语料版本控制面身份隔离

## 缩略语阅读卡

本页使用：`RAG（检索增强生成）`、`RLS（行级安全；由数据库拒绝越权数据）`、`CAS（比较并交换；带预期前态的原子切换）`、`SQL（结构化查询语言）`、`TLS（传输层安全；数据库连接加密与服务端校验）`、`ANN（近似最近邻；向量候选检索）`、`E2E（端到端；跨进程真实链路测试）` 与 `HMAC（带密钥散列；缓存或关联键去标识化）`。

## 0. 任务边界与现状

- 来源：`0032_rag_corpus_version_control.sql` 当前将 `app.principal_user='__system_rag__'` 作为 generation（检索世代）、recipe（嵌入配方）、global（全局）文档和发布切换的授权根，并将多个控制函数授予 `app_role`（应用运行时角色）。普通连接能自行设置这个会话变量，故不是授权边界。
- 目标：引入无登录能力的 `rag_control_executor`（通用 RAG 控制执行器）角色和独立登录；请求运行时仅能在自己的 RLS（行级安全）范围内登记/发布 private（私有）文档内容，不能读取/改写全局原件、recipe、generation、物理向量表、灰度或活动指针。
- 不做：本用例不接入 PDF/Office（办公文档）/视频解析器、不创建全格式 HTTP（超文本传输协议）接口、不把当前通用 RAG 控制面宣称为已接入 C 端或 B 端热路径、不替代尚未实现的组织授权/人工审核/云端凭据隔离。
- 安全边界：`app.principal_user` 仍只可作为私有行的 RLS 路由上下文；它**不是**控制面、删除、发布、模型或人工审核的授权根。

## 1. 对象、角色与状态机

| 对象 | 状态/字段 | 允许角色 | 不变量 |
| --- | --- | --- | --- |
| `rag_corpus_document` | `active → superseded → tombstoned`，owner、visibility | owner runtime；control executor 可管理 global | 私有 owner 只能写自己的文档；global 只能由独立控制身份创建。 |
| `rag_embedding_recipe` | immutable（不可变）recipe receipt（配方回执） | control executor | 普通运行时读/写 `0` 行；已登记配方不得 UPDATE（更新）/DELETE（删除）。 |
| `rag_embedding_generation` | `building → shadow → gated → active → deprecated/retired`，或 `failed/aborted` | control executor | 状态迁移、物理表创建、灰度和活动指针均不依赖会话变量；外部结果的 `unknown`（未知）只存在于 dispatch request（派发请求），只能经回执将 generation 终态为 `failed`。 |
| `rag_active_generation` / rollout（灰度） | singleton（单行）与 `1→10→50→100` | control executor | 指针切换只接受预期旧值的 CAS，失败方只读回最终状态。 |
| `rag_generation_release_event`（拟议） / cache epoch（缓存世代） | append-only（仅追加）发布事件；版本号单调递增 | control executor | CAS 翻转、旧世代弃用、发布事件/epoch/缓存失效 outbox（外发箱）同一 PostgreSQL（关系型数据库）事务；Redis（内存数据存储）失效异步重试。 |
| `rag_generation_integrity_quarantine`（拟议） | 仅追加；`detected → terminalized` | migration/control executor | 历史物理表不可信时保留 generation ID、原因、摘要和时间，不保存正文、向量或连接串。 |
| `rag_query_binding` / citation（引用） | `active → expired/revoked` | owner runtime 读自己的；受限函数检索 | 不能借 binding 读取其他 owner、已撤销 chunk 或 retired generation。 |
| `rag_rebuild_run` | `pending → running → succeeded/failed/aborted/orphaned` | control executor | 外部 `unknown` 只存在于关联 dispatch request（派发请求），只能经有外部对账回执的人工终态化将 run 转为 `failed`；不得沿用旧请求或旧租约再次派发。 |
| `rag_control_executor` | `NOLOGIN NOINHERIT`，无 `app_role` 成员关系 | 仅由 provisioner（配置器）创建的 control login（控制登录）成员可 `SET LOCAL ROLE` | runtime、gateway（网关）、privacy（隐私）和 migration owner（迁移所有者）错挂均在启动身份检查前失败。 |
| `rag_control_login` | `NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS` reserved compatibility capability group（保留兼容能力组）；它本身是 `rag_control_executor` 的成员 | 不是可复用凭据，也不是 provisioned control login 的授权跳板；实际 `LOGIN` 由 provisioner 为单个构建 worker 创建并**直接**授予 `rag_control_executor` | 不是 public（公共）对象/schema（模式）owner；无 `app_role`、gateway、privacy、migration 成员关系。 |

控制活动的最小状态机如下；私有内容写入不自动激活 generation：

```text
private document: draft/active → superseded/tombstoned
generation: building → shadow → gated → active → deprecated → retired
                                  └──────────────→ failed / aborted
rebuild run: pending → running → succeeded / failed / aborted / orphaned
dispatch request: prepared → dispatching → succeeded / known_not_sent / unknown / failed
unknown dispatch: only a signed/manual reconciliation may terminalize its exact domain row to failed;
                  retry means a new logical business revision and a new generation ID
active pointer: expected-old --CAS--> new-active | conflict → read-final
```

### 1.1 不可替代的授权与所有权分离

本能力的最小安全边界不是“新增一个控制角色”而是三层分离。`app.principal_user`（应用主体会话变量）只在 runtime（运行时）函数内路由 private（私有）数据；它在控制函数、全局语料、generation（检索世代）、灰度、活动指针、rebuild（重建）租约和物理向量表操作中一律没有授权意义。

```text
runtime login → app_role → rag_runtime_definer
provisioned control login → rag_control_executor → rag_control_definer
rag_control_login (reserved compatibility group) → rag_control_executor
```

| 身份 | 固定能力 | 明确禁止 |
| --- | --- | --- |
| `app_role`（应用运行时角色） | 仅执行 private 文档、binding（检索绑定）、search（检索）、evidence（证据）、citation（引用）受限函数 | 控制表直读写、global（全局）文档、recipe（检索配方）、generation、物理向量表、灰度、发布和重建租约。 |
| `rag_runtime_definer`（运行时安全定义者） | 执行 runtime-only（仅运行时）函数；通过 RLS（行级安全）中的主体路由读/改 private 行 | 不能拥有控制表或物理表，不能成为 control executor 成员，不能得到任意全局可见 policy（策略）。 |
| provisioned control login（配置生成的控制登录） | 唯一具有 `rag_control_executor` 成员关系的 `LOGIN NOINHERIT`（不可继承登录）身份；不使用固定共享角色名 | 无 `app_role`、gateway（网关）、privacy（隐私）、migration 成员关系；无 public（公共）schema（模式）创建权；不直接暴露给 HTTP（超文本传输协议）请求。 |
| `rag_control_executor`（通用 RAG 控制执行器） | `NOLOGIN NOINHERIT`（无登录、不可继承）能力角色；仅被 control login `SET LOCAL ROLE` | 无 runtime/gateway/privacy/migration 成员关系；无表直接权限和 schema 创建权。 |
| `rag_control_definer`（控制安全定义者） | 拥有控制表、受限控制函数与 `rag_vector_*` 物理表；在 FORCE RLS（强制行级安全）下完成 generation 建表/写入/校验/切换 | 无登录、无成员、非超级用户、无 `BYPASSRLS`（绕过行级安全）；不得拥有 runtime-only 函数。 |

`rag_control_definer` 是唯一具有建立分区/物理向量表所需 schema `USAGE`（使用）和 `CREATE`（创建）权限的角色；control login 只执行其固定 `SECURITY DEFINER`（安全定义者）函数。这样不会为了建表而把数据定义语言权限返还给运行时或 control login。

### 1.2 受信 schema（模式）与安全定义者基线

迁移必须先建立受信 schema，而不是继续把 `public` 当作可写的动态对象空间：

```text
rag_runtime  : runtime-only SECURITY DEFINER 函数；owner=rag_runtime_definer
rag_control  : control-only SECURITY DEFINER 函数和 rag_vector_* 物理表；owner=rag_control_definer
public       : 仅保留既有业务表/扩展类型；任何受控函数都只能以 schema-qualified 名称引用它
```

以下条件是**迁移完成后的初始正确态**，不是故障后的建议：

1. `REVOKE CREATE ON SCHEMA public FROM PUBLIC, app_role, rag_runtime_definer, rag_control_executor`；`rag_control_definer` 只可在 `rag_control` 建表，不能在 `public` 建表。`PUBLIC`、runtime login、control login、gateway（网关）、privacy（隐私）和 migration login（迁移登录）均不是这两个受信 schema 的 owner。
2. 所有**新、可调用**的 `SECURITY DEFINER`（安全定义者）函数必须迁入 `rag_runtime` 或 `rag_control`，并固定 `search_path = pg_catalog, <所属 schema>, pg_temp`；业务表、`public.vector` 类型和跨 schema 对象必须显式 schema-qualified。历史 `public.rag_*` guard/overload 为滚动升级保留时，必须逐签名撤销全部非 owner 执行权，且新函数不得引用它们。不得在函数体、动态 SQL（结构化查询语言）或触发器中依赖调用方 `search_path`。
3. `PUBLIC EXECUTE=0`。每个函数的**直接 ACL**只能包含其 owner 和本节 manifest（清单）指定的执行角色：control/global 仅 `rag_control_executor`，runtime-only 仅 `app_role`；不得把 gateway（网关）、privacy（隐私）、qbank（题库）或任意 provisioned login（配置登录）授予 control 函数。`rag_control` 的直接 `USAGE` 只允许 control executor 与为动态物理表检索所需的 runtime definer。`rag_control_executor` 的成员闭包只允许当前 provisioned control login（配置生成的控制登录）和非登录的保留兼容组 `rag_control_login`；gateway/privacy/qbank/runtime 角色或任意其他 login 均不得经 `SET ROLE` 取得该能力。所有 legacy（旧版）overload（同名不同参数函数）必须逐个撤权，而不是仅按函数名撤权。
4. 启动 catalog（数据库目录）断言必须以 `regprocedure`（带参数函数标识）逐项检查：schema、owner、`proconfig.search_path`、`prosecdef`、精确函数/模式 ACL allowlist（授权白名单）、control executor 成员闭包、definer 属性与成员闭包。任何一项漂移都在读取正文、创建表或调用 embedding（嵌入）前失败。

因此 `public` 中遗留对象既不会被安全定义者的未限定名称选中，也不能由普通运行时创建来遮蔽受控对象。

函数按职责永久拆分，禁止同一个 definer 同时拥有两类函数：

| 函数类 | 函数 | 允许执行者 |
| --- | --- | --- |
| runtime-only（仅运行时） | private register/publish/tombstone、bind/resolve/search/evidence/citation | `app_role` → `rag_runtime_definer` |
| control-only（仅控制） | recipe、release policy（发布策略）、start/prepare/insert/validate、unknown（未知）终态化、当前 shadow evaluation（影子评测）、gate、rollout（灰度）、promote/rollback、rebuild run（重建任务） | `rag_control_executor` → `rag_control_definer` |
| global-only（仅全局） | 无 `visibility`（可见性）参数的 global register/publish | `rag_control_executor` → `rag_control_definer` |
| trigger guard（触发器守卫） | 仍是 `public` 旧 schema（模式）的历史 guard；0073 仅撤销普通执行角色的调用权 | 不把它列为 `rag_runtime_definer` 新 API（应用程序接口） |

固定表和动态物理表均启用且强制 RLS。物理表必须同时具备 `(a)` 对 `rag_control_definer` 的 `FOR ALL` 写入/校验策略，和 `(b)` 对 `rag_runtime_definer` 的按主体 `SELECT/DELETE` 策略；任何动态表只建 SELECT/DELETE 而缺 INSERT 的部署都不是可运行控制面。固定表的精确读写矩阵由 §1.4 manifest（清单）定义；`app_role` 对所有表均无直接 DML（数据操作语言）或 SELECT（查询）权限。

### 1.3 0032 前缀升级、历史信任切断与物理表完整性

> **当前实现边界（2026-08-10）：** 0073–0074、0079–0081 已对全部 0032
> generation/global 链执行默认 `legacy_untrusted` 隔离、清空活动指针、撤销旧
> binding/citation，并迁移发现到的历史 `rag_vector_*` 表为 control-only
> quarantine 表。它**尚未**实现下面第 110–117 行所述的
> generation→catalog→member 双向完整性枚举、逐条 `failed` 收据和缺表
> generation 的物理清理；`TC-RAG-01-E4/X1` 仍是 `planned`。这些条款是
> 发布前必须完成的目标契约，不能被四条本地 prefix-upgrade 断言冒充为已覆盖。

本次只能新增 forward-only（只前进）迁移，不重写 `0032`。升级器先枚举每个 `rag_embedding_generation.physical_table`，以生成行、catalog（数据库目录）和 `rag_generation_member` 建立以下检查：

1. 表存在、名称精确绑定 generation，owner（所有者）为 `rag_control_definer`，已 `FORCE RLS`，且具 control/runtime 两组精确策略；
2. 物理向量行与 member（成员快照）在 `chunk_id/document_id/owner_user_id/visibility/content_version` 上双向一一对应，行数相同但 ID 或元数据错配仍为污染；
3. 任一不合格 generation 不得继续 `active/gated/shadow/building` 服务。升级事务要将其置 `failed`、活动指针失活并写无正文/无向量的 append-only（仅追加）`rag_generation_integrity_quarantine`（检索世代完整性隔离）收据；不得“尽力修复”后继续切流；
4. generation 已登记但物理表尚未建立时，tombstone（删除墓碑）仍完成：跳过不存在的表，保留 generation 失败收据，并对已存在 retained（保留）表删除向量、使 citation（引用）失效。

`rag_validate_generation` 必须验证上述双向集合，而不是只比较 `count(*)`。构建/向量写入/评测出现超时、响应丢失或不完整时必须显式收口至 `failed/unknown`；活动指针、cache epoch（缓存世代）和发布账本均不变，且未知结果自动二次外发数为 `0`。

`0032` 的控制授权根已经可被伪造，故**结构正确不等于历史可信**。本次升级采取默认隔离策略：所有由 `0032` 旧控制面产生的 global（全局）文档、recipe（嵌入配方）、release policy（发布策略）、generation（检索世代）、rollout（灰度）和物理表均先标记 `legacy_untrusted`（旧版不可信）并从活动/候选读路径移除；不删除正文或向量，但也绝不继续服务。当前仓库没有迁移前、可验签的可信发布回执，因此**本次迁移没有恢复旧数据的分支**：任何 `0032` generation 不能恢复为 `deprecated`（已弃用但可回滚）或 `active`，只能由升级后的受控 source（来源）重新构建。

升级还必须清空活动指针、使旧 query binding（检索绑定）和 citation（引用）失效；runtime（运行时）函数对 `legacy_untrusted` 统一返回不可用，不得用 “global 可读” 规则绕过隔离。后续新 generation 只能从升级后受控的 recipe、source epoch（语料世代）与冻结 member（成员）清单重建。

每个 global 文档版本必须有不可变 `rag_global_document_provenance`（全局文档来源证明）行：`(document_id, content_version)` 主键、`trust_state`（仅 `approved|legacy_untrusted|revoked`）、`control_request_id` 外键、`issued_at` 与 `provenance_digest`（来源摘要）。`rag_control_publish_global_document_version` 与 provenance 行在同一 PostgreSQL（关系型数据库）事务写入，并由受控函数在返回前将 request 收口为成功；当前 runtime RLS 直接判定 `trust_state='approved'`，**尚未独立 join request outcome**，故这条链接只能视为受控写入路径的不变量，不能写成 RLS 自身已经验证 request 成功。升级为所有旧 global 版本写 `legacy_untrusted`，并禁止 UPDATE（更新）为 `approved`；本次范围不实现恢复例外。

### 1.4 版本化控制 manifest（清单）v1

下表是 manifest v1 的语义基线。**当前实现尚未把迁移、启动 catalog gate（目录门）和隔离 PostgreSQL（关系型数据库）测试收敛为同一份 versioned（版本化）机器可读清单**：它们各自有显式受审列表，并由本地回归检测漂移。将三份列表收敛为单一版本化对象仍是后续维护项；在完成前不得把“同一对象读取期望”描述为已实现，也不得用“14 个函数/15 张表”这类魔法数字替代实际目录校验。

| 类别 | 精确对象 | owner（所有者） | 唯一执行/数据面角色 | 禁止 |
| --- | --- | --- | --- | --- |
| runtime 函数 | `rag_runtime.rag_register_private_document(text,text)`；`rag_runtime.rag_publish_private_document_version(text,text,text,text,text,jsonb,jsonb)`；`rag_runtime.rag_tombstone_private_document(text,text)`；`rag_runtime.rag_bind_query(text,text,integer)`；`rag_runtime.rag_resolve_query_binding(text)`；`rag_runtime.rag_search_bound(text,public.vector,integer)`；`rag_runtime.rag_evidence_bound(text,text[],integer)`；`rag_runtime.rag_record_citation(text,text,text)` | `rag_runtime_definer` | `app_role` | global 写入、control executor、`PUBLIC`、gateway/privacy/migration 登录 |
| request / reconciliation（请求/对账）函数 | `rag_control.rag_control_begin_request(text,text,text,bigint)`；`rag_control.rag_bind_generation_dispatch_request(text,text)`；`rag_control.rag_bind_rebuild_dispatch_request(text,text)`；`rag_control.rag_mark_request_dispatching(text,text,text)`；`rag_control.rag_settle_request_dispatch(text,text,text)`；`rag_control.rag_record_reconciliation_receipt(text,text,text,text,text,text)`；`rag_control.rag_terminalize_unknown_generation(text,text,text)`；`rag_control.rag_terminalize_unknown_rebuild_run(text,text,text)`；内部不授予执行权的 typed input binding（类型化输入绑定）三个 helper（辅助函数） | `rag_control_definer` | `rag_control_executor`（helper 除外） | `app_role`、`PUBLIC`、runtime/gateway/privacy/migration 登录 |
| control 函数 | `rag_control.rag_register_embedding_recipe(text,text,text,text,text,text,integer,text,text,text,text,jsonb)`；`rag_control.rag_register_release_policy(text,text,integer,integer,integer,integer)`；`rag_control.rag_start_generation(text,text,text,text)`；`rag_control.rag_prepare_generation_storage(text,text)`；`rag_control.rag_insert_generation_vector(text,text,text,public.vector)`；`rag_control.rag_validate_generation(text,text)`；`rag_control.rag_record_shadow_evaluation(text,text,text,integer,numeric,numeric,numeric,numeric,numeric,numeric)`；`rag_control.rag_gate_generation(text,text,text)`；`rag_control.rag_advance_rollout(text,text,integer)`；`rag_control.rag_promote_generation(text,text,text)`；`rag_control.rag_rollback_generation(text,text,text)`；`rag_control.rag_create_rebuild_run(text,text,text,timestamptz,integer)`；`rag_control.rag_claim_rebuild_run(text,text,integer)`；`rag_control.rag_heartbeat_rebuild_run(text,text,integer,jsonb)` | `rag_control_definer` | `rag_control_executor` | `app_role`、`PUBLIC`、runtime/gateway/privacy/migration 登录 |
| global 函数 | `rag_control.rag_register_global_document(text,text,text)`；`rag_control.rag_control_publish_global_document_version(text,text,text,text,text,text,jsonb,jsonb)` | `rag_control_definer` | `rag_control_executor` | `app_role`、`PUBLIC`、所有带 `visibility` 的 generic（泛型）旧入口 |
| disabled legacy（已禁用旧入口） | `public.rag_require_system()`；`public.rag_recipe_immutable()`；`public.rag_content_version_guard()`；`public.rag_chunk_guard()`；`public.rag_register_document(text,text,text)`；`public.rag_publish_document_version(text,text,text,text,text,jsonb,jsonb)`；`public.rag_tombstone_document(text,text)`；`public.rag_bind_query(text,text,integer)`；`public.rag_resolve_query_binding(text)`；`public.rag_search_bound(text,public.vector,integer)`；`public.rag_evidence_bound(text,text[],integer)`；`public.rag_record_citation(text,text,text)`；`public.rag_register_embedding_recipe(text,text,text,text,text,integer,text,text,text,text,jsonb)`；`public.rag_register_release_policy(text,integer,integer,integer,integer)`；`public.rag_start_generation(text,text,text)`；`public.rag_prepare_generation_storage(text)`；`public.rag_insert_generation_vector(text,text,public.vector)`；`public.rag_validate_generation(text)`；`public.rag_record_shadow_evaluation(text,text,integer,numeric,numeric,numeric,numeric,numeric,numeric)`；`public.rag_gate_generation(text,text)`；`public.rag_advance_rollout(text,integer)`；`public.rag_promote_generation(text,text)`；`public.rag_rollback_generation(text,text)`；`public.rag_create_rebuild_run(text,text,timestamptz,integer)`；`public.rag_claim_rebuild_run(text,text,integer)`；`public.rag_heartbeat_rebuild_run(text,text,integer,jsonb)` | 不适用 | 无 | `PUBLIC`、`app_role`、control/runtime 登录均不得执行；没有未列出的 overload |

| fixed table（固定表）对象 | owner（所有者） | `rag_runtime_definer` 的精确 GRANT（授权）与 RLS（行级安全）谓词 | `rag_control_definer` 的精确能力 | `app_role` 直接权限 |
| --- | --- | --- | --- | --- |
| `public.rag_corpus_document` | `rag_control_definer` | `SELECT/INSERT/UPDATE`；仅 `visibility='private' AND owner_user_id=current_setting('app.principal_user',true)`，以及已批准 global version 的 document 元数据 | `SELECT` 全量仅用于冻结 snapshot；`INSERT/UPDATE` 仅 global-only 函数 | `0` |
| `public.rag_corpus_content_version` | `rag_control_definer` | `SELECT/INSERT/UPDATE` 仅可见 private owner 的 document/version，或 approved global version | `SELECT` snapshot；global-only publish/tombstone 最小写入 | `0` |
| `public.rag_corpus_chunk` | `rag_control_definer` | `SELECT/INSERT/UPDATE` 仅 private owner 的 chunk，或 `visibility='global' AND provenance.approved`；`content` 不得经通用表读取外泄 | `SELECT` frozen snapshot；global-only publish/tombstone 最小写入 | `0` |
| `public.rag_corpus_tombstone` | `rag_control_definer` | 当前 owner-scope `SELECT/INSERT/UPDATE`；不读其他主体 tombstone | generation 删除/擦除和 global tombstone 所需读写 | `0` |
| `public.rag_global_document_provenance` | `rag_control_definer` | `SELECT` 仅用于判定 approved global 版本；无写入 | global publish 同事务 `INSERT`；无 UPDATE/DELETE | `0` |
| `public.rag_query_binding` | `rag_control_definer` | `SELECT/INSERT/UPDATE` 且 `owner_user_id=current_setting('app.principal_user',true)` | 仅 release/legacy 隔离时使 binding 失效 | `0` |
| `public.rag_citation` | `rag_control_definer` | `SELECT/INSERT/UPDATE` 且 `owner_user_id=current_setting('app.principal_user',true)` | tombstone/legacy 隔离时仅将受影响 citation 标为 invalidated | `0` |
| `public.rag_corpus_epoch` | `rag_control_definer` | `SELECT` singleton（单行） | `FOR ALL`；仅受控 publish/tombstone/rebuild 变更 | `0` |
| `public.rag_embedding_recipe` | `rag_control_definer` | 当前 `SELECT` 可读 recipe 元数据（不含语料正文）；不得据此绕过 binding 读取 chunk | `FOR ALL`，仅 immutable register | `0` |
| `public.rag_release_policy` | `rag_control_definer` | 无直接读取；runtime 只消费 gate 后选择结果 | `FOR ALL`，仅 immutable register | `0` |
| `public.rag_embedding_generation` | `rag_control_definer` | `SELECT` 仅 active/gated candidate 或本主体 binding 引用的 generation；不能扫描全部 history | `FOR ALL`，仅状态机函数 | `0` |
| `public.rag_generation_member` | `rag_control_definer` | 当前 `(owner=current principal OR approved global)` 的 member；query 函数再以 binding 收窄 generation | `FOR ALL`，仅冻结 snapshot 与完整性校验 | `0` |
| `public.rag_active_generation` | `rag_control_definer` | `SELECT` singleton | `FOR ALL`，仅 CAS promote/rollback/历史隔离 | `0` |
| `public.rag_rebuild_run` | `rag_control_definer` | 无 | `FOR ALL`，仅 request 关联的租约状态机 | `0` |
| `public.rag_shadow_evaluation` | `rag_control_definer` | 无 | legacy-only 读取/隔离；新 gate 不依赖其可写数据 | `0` |
| `public.rag_generation_rollout` | `rag_control_definer` | 当前 `SELECT` 可读 rollout 元数据；query 函数再以受控 generation 状态收窄 | `FOR ALL`，仅状态机函数 | `0` |
| `public.rag_control_request`、`public.rag_control_request_input_binding`、`public.rag_control_dispatch_attempt`、`public.rag_control_dispatch_subject`、`public.rag_generation_release_event`、`public.rag_cache_epoch`、`public.rag_cache_invalidation_outbox` | `rag_control_definer` | 无 | `FOR ALL`，仅 request/binding/dispatch/release/outbox 函数；每次派发先绑定 generation（检索世代）或 rebuild run（重建任务），dispatch/event 仅追加，状态转移由 CAS（比较并交换）函数完成 | `0` |
| `public.rag_generation_integrity_quarantine`、`public.rag_reconciliation_receipt` | `rag_control_definer` | 无 | 当前实现为受限控制函数写入；不把未来 evaluation/approval receipt（评测/审批回执）表冒充已经落地 | `0` |
| dynamic vector（动态向量）`rag_control.rag_vector_<generation-id>` | `rag_control_definer` | 按主体 `SELECT/DELETE`；无 INSERT/UPDATE/DDL（数据定义语言） | `FOR ALL`（全操作）写入/校验；唯一可建表/索引 | `0` |

`rag_control_begin_request(operation, logical_request_key, canonical_input_digest, business_revision)` 是 control worker 唯一可创建/读取 `rag_control_request` 的入口。每条记录有不可变 `request_id`、`workflow_root_id`、`predecessor_request_id`、`operation`、`logical_request_key`、`business_revision`、调用方 dedupe digest（去重摘要）与 outcome（结果）。repository 对该字段只写由 `operation + logical_request_key` 派生的稳定 hint，绝不以 `JSON.stringify` 当跨版本业务等价判断；控制函数首次执行时必须将**实际类型化数据库参数**规范化为 `rag_control_request_input_binding.input_digest`，之后只能使用相同绑定重放。因此键序不同但 JSONB 等价的 retry（重试）可读回同一 request，真实参数差异在写入前以 `rag_control_request_input_mismatch` 拒绝：

1. 同一 revision（版本）的唯一键是 `(operation, logical_request_key, business_revision)`；同键同摘要精确读回同一 `request_id`，同键不同摘要报 `rag_control_idempotency_conflict`。
2. 初始请求令 `workflow_root_id=request_id`。后继请求必须显式指向 predecessor（前序），并同时满足 `UNIQUE(workflow_root_id, business_revision)`、`business_revision=predecessor.business_revision+1` 与 `UNIQUE(predecessor_request_id)`；数据库触发器拒绝跳号、分叉、换 root 或跨 operation（操作）交接。
3. 后继只可由显式控制动作创建：predecessor 为 `known_not_sent`（已知未发送），或 predecessor 已经 immutable（不可变）reconciliation receipt（对账回执）终态为 `failed`。`unknown`（未知）本身、`dispatching`（已派发）和 `succeeded`（成功）均不能创建 successor（后继）。任何自动 worker recovery（工作进程恢复）只能精确读回原 request，不能创建新 revision。

该记录在 generation/release audit（发布审计）保留期内不可过期或覆盖。当前实现中 generation 创建、prepare（准备）、向量写入、validate（校验）、shadow evaluation（影子评测）、gate（门禁）、rollout（灰度）、promote/rollback（发布/回滚）、global publish（全局发布）和 rebuild run（重建任务）创建均显式接收 `request_id`，并在同一短事务中绑定实际参数、验证前态及写 `succeeded`。成功重放只读回已存在结果，不会再次变更业务状态。claim/heartbeat（领取/心跳）只引用已关联 request 的 rebuild run，不能自行创建新 request。

外部 embedding（嵌入）调用必须有一条 `rag_control_dispatch_attempt`（控制派发尝试）且 `UNIQUE(request_id)`，并先通过 `rag_control_dispatch_subject` 绑定一个 `generation`（检索世代）或 `rebuild_run`（重建任务）：其中保存 request、provider idempotency key digest（供应商幂等键摘要）、provider policy revision（供应商策略版本）、`prepared → dispatching → succeeded|known_not_sent|unknown|failed` 状态、发送/结算时间与无正文 response digest（响应摘要）。`rag_bind_generation_dispatch_request` / `rag_bind_rebuild_dispatch_request` 只接受相应 operation（操作）和当前可处理业务对象；`rag_mark_request_dispatching(request_id, provider_policy_revision, provider_idempotency_key_digest)` 在网络 I/O（输入输出）前的短事务中创建/比较该尝试并写 `dispatching`；提交后才允许发送首字节。网络前崩溃只能收口为 `known_not_sent`；派发后进程崩溃、响应丢失或结算失败一律 `unknown`，绝不自动重发。`rag_settle_request_dispatch(request_id, terminal_state, response_digest)` 只接受合法前态 CAS（比较并交换）转换。因而测试可分别注入外发前、外发中和回包后三个崩溃点，验证同 root/revision 的供应商调用数最多为 `1`。

`rag_record_reconciliation_receipt(request_id, receipt_id, subject_kind, subject_id, decision, evidence_digest)` 写不可变 `rag_reconciliation_receipt`；`rag_terminalize_unknown_generation(request_id, generation_id, receipt_id)` 与 `rag_terminalize_unknown_rebuild_run(request_id, run_id, receipt_id)` 只接受 subject（对象）精确匹配、`decision='failed'` 的 receipt。它们只可终态化为 `failed`，不能复活/重发；本次范围不宣称外部签名或人工审核服务已经存在。

`rag_register_embedding_recipe` 的自然键是 `recipe_hash`；相同 `recipe_hash` 必须逐字段、canonical manifest digest（规范清单摘要）一致才精确读回同一 recipe，任一材料字段不同报 `rag_recipe_conflict`。`rag_register_release_policy` 同样先计算 canonical policy digest（规范策略摘要），相同 digest 精确读回、相同业务 policy ID 但不同摘要报 `rag_release_policy_conflict`。二者不得以无条件 `ON CONFLICT DO NOTHING` 静默吞掉不一致输入，也不产生外部 I/O（输入输出）。

**尚未实现，不能作为发布依据：** `rag_mark_generation_failed`、冻结 dataset/code/executor 的 shadow evaluation receipt（影子评测回执）、release approval receipt（发布审批回执）及其跨表 gate（门禁）验证、实际 embedding（向量嵌入）控制 worker/outbox（外发箱）和云端故障演练。当前 `rag_record_shadow_evaluation` 只保存数据库内的数值 verdict（裁决），`rag_gate_generation` 只验证该 verdict 与最短 approval reference（审批引用）。在上述对象与独立测试落地前，不能把本段目标态措辞外推为已实现人工审批或模型调用审计。

缓存以数据库 `rag_cache_epoch` 为真相：promote/rollback 的同一 PostgreSQL 事务写 active pointer（活动指针）、append-only（仅追加）release event（发布事件）、epoch 加一与 `rag_cache_invalidation_outbox`（缓存失效外发箱）。Redis（内存数据存储）失效是异步、可重试的派生副作用；所有缓存键必须含已读出的数据库 epoch，因此 outbox 暂时失败只会造成旧 key 不再命中，绝不能继续返回旧 epoch 数据。

## UC-RAG-01 · 以独立身份构建并发布通用 RAG generation（检索世代）

- **角色 Actor：** 受控 RAG build worker（构建工作进程，持独立 control 登录）；请求 runtime（运行时）只可调用 owner 范围内的语料登记/查询 API（应用程序接口）。
- **前置 Precondition：** provisioned control login（配置生成的控制登录）、`rag_control_executor`、`rag_control_definer`（控制安全定义者）和 `rag_runtime_definer`（运行时安全定义者）已由版本化迁移/受控 provision（配置）创建；实际 login 经启动检查确认无超级用户、无 `BYPASSRLS`（绕过行级安全）、无 `app_role` / gateway / privacy 成员关系，且其唯一直接能力成员关系为 `rag_control_executor`，不是任何 public（公共）表或 schema（模式）所有者；受信 schema、全部 `regprocedure`、固定表、动态向量表和 RLS（行级安全）目录形状均符合 §1.2 与 §1.4 manifest（清单）。`rag_control_login` 只是保留兼容组，不在此登录的能力链上。`0032` 历史控制数据已按 §1.3 隔离，活动指针为空；构建输入绑定一个升级后冻结 recipe、release policy（发布策略）与 source epoch（语料世代）。
- **触发 Trigger：** 运营者批准一次 rebuild（重建）工单，受控 worker 使用 `RAG_CONTROL_DATABASE_URL`（通用 RAG 控制数据库连接）领取该工单。
- **主流程 Main：**
  1. control 登录通过 `assertRagControlExecutorIdentity`（控制身份校验）和 `assertRagControlDefinerOwnership`（控制安全定义者所有权校验）；失败时在任何读取原文、创建物理表或外部 embedding（嵌入）调用前终止。
  2. 以 `asRagControlExecutor`（控制执行器事务范围）先创建或精确读回 `rag_control_request`（控制幂等请求），再登记不可变 recipe/release policy，冻结可见 chunk 清单、`source_epoch` 与预期条数，创建 `building` generation；global（全局）语料仅能经无 `visibility` 参数的 global-only 函数写入，private（私有）语料只能经 runtime-only 函数写入。
  3. 在短事务外调用 embedding；每一向量写回前检查 tombstone（删除墓碑）和冻结清单。网络后失败只能把 generation 标为 `failed/unknown`，不自动盲重发或覆盖活动世代。
  4. control executor 在单事务内校验条数、维度、source epoch 与 shadow（影子）评测 receipt（评测回执）及 approval receipt（审批回执）门；仅按 `1→10→50→100` 推进 rollout（灰度）。
  5. `rag_promote_generation(new, expected_old)` 以 CAS 原子翻 active pointer（活动指针）；成功后在同一 PostgreSQL 事务写 append-only（仅追加）发布审计事件、cache epoch（缓存世代）与缓存失效 outbox（外发箱），旧 generation 进入 `deprecated`，不是原地修改；Redis（内存数据存储）仅异步消费 outbox，读取不得回退旧 epoch。
- **备选流 Alternate：** 相同 immutable recipe（不可变配方）与 source epoch 已有 `active` generation 时精确复用，外部 embedding 调用数、物理表创建数与活动指针变更数均为 `0`。
- **异常流 Exception：**
  - **E1 重复工单/响应重放：** 同 `(operation, logical request key, business revision)`（操作、逻辑请求键、业务版本）和 canonical input digest（规范输入摘要）只读回首次 result（结果）；同键不同摘要报 `rag_control_idempotency_conflict`。重复 `prepare`/vector insert（向量写入）不产生第二张物理表或第二次发布；发布事件和 cache epoch 增量均为 `0`。机制：唯一键 + 幂等键 + 精确读回。
  - **E2 并发切流：** 两个 control worker（控制工作进程）以相同 expected-old（预期旧指针）切换时恰一个 CAS 成功；另一方不覆盖而读取最终 generation。机制：CAS + 单行指针。
  - **E3 越权/伪造会话变量：** runtime、gateway、privacy 登录即使 `SET LOCAL app.principal_user='__system_rag__'`，对 manifest v1 全部 control/global 函数、控制表 `SELECT/INSERT/UPDATE/DELETE`、已有 `rag_control.rag_vector_*` 物理表、global 写入和 legacy overload 均为拒绝；其调用 control transaction helper（事务辅助函数）也必须失败。运行时函数不能因 control definer 的 RLS policy（策略）而跨主体读取。机制：双 definer、独立数据库角色、最小 `GRANT`（授权）、RLS、受信 schema 与启动身份断言。
  - **E4 构建失败/写入不完整：** 条数、维度、member（成员）双向匹配、epoch、评测、approval receipt（审批回执）或事务失败时 generation 只能 `failed/aborted/unknown`；`unknown` 只能由带 reconciliation receipt（对账回执）的人工终态化进入 `failed`，绝不进入 `shadow/gated/active`。活动指针、已发布 generation、cache epoch（缓存世代）和账本不被半更新。机制：状态机前态守卫 + 事务回滚 + 事件账本。
  - **E5 依赖降级：** 无 control URL、身份检查失败或 embedding provider（供应商）不可用时请求热路径不得退化为 `app_role` 控制操作；新 binding（检索绑定）返回明确不可用/旧冻结 binding 仅在仍合法时读，不能扩大检索范围。机制：fail-closed（失败关闭）配置门 + 绑定/RLS。
  - **E6 超时/断线：** 网络调用前、网络中、回包后进程死掉、lease（租约）超时或响应丢失时，`rag_control_dispatch_attempt`（控制派发尝试）分别收口为 `known_not_sent/unknown/unknown`，rebuild run（重建任务）和 generation 进入相应 `failed/unknown`；自动同 logical request key（逻辑请求键）重发数为 `0`。人工对账只有先将 predecessor（前序）终态为 `failed`，才能以新 business revision（业务版本）和新 generation ID 创建 successor（后继）；不得复用旧 provider idempotency key（供应商幂等键）。机制：派发 CAS + 租约 CAS + 幂等键 + 审计事件。
  - **X1 刁钻路径：** 错挂 migration owner（迁移所有者）或 runtime URL（运行时连接）为 RAG control URL、残留角色成员关系、`SET ROLE`、任一 manifest control/runtime function owner drift（函数所有者漂移）、`search_path`（名称解析路径）/schema CREATE（模式创建）权限漂移、任一 isolated schema 新增但未登记的 `SECURITY DEFINER`（安全定义者）函数或其 `PUBLIC EXECUTE` 默认 ACL（访问控制列表）、gateway/privacy/qbank 或任意 provisioned login 对 control 函数或 `rag_control` schema 的直接 ACL 漂移、或取得 `rag_control_executor` 的成员资格、迁移账号创建函数后转移至 definer 的 ACL handoff、直接调用 legacy `SECURITY DEFINER` 函数、直读物理 `rag_vector_*` 表、`__system_rag__` 全局文档伪造、`legacy_untrusted` global provenance（全局来源证明）误放行、历史预建/错配向量表和 20 路竞争必须分别拒绝或恰一收口。机制：迁移后目录门、身份断言、REVOKE（撤销授权）、受限函数、默认 ACL 目录门、RLS、CAS、完整性隔离账本与独立低权 PostgreSQL（关系型数据库）测试。
  - **后置 Postcondition：** 成功时恰一 generation 进入 `active`、一条发布审计事件、一个 cache epoch 增量、一个可复现 recipe/source receipt（回执）和一条可消费/可重试 cache-invalidation outbox（缓存失效外发箱）存在；失败时生成可审计 `failed/aborted/unknown` 记录且活动指针不变。控制 secret（凭据）、正文、向量和 `RAG_CONTROL_DATABASE_URL` 不进日志、trace（追踪）或测试回执。
- **验收 Acceptance：**
  1. 低权 runtime/gateway/privacy 三种身份各伪造 `__system_rag__` 后，manifest v1 的每个 control/global/disabled-legacy `regprocedure`、每张固定控制表、所有历史 `rag_control.rag_vector_*` 物理表和 global 写入成功数均为 `0`；runtime search/evidence 仍仅返回自身 private + 已通过 control provenance（来源证明）的 global 行。
  2. 正确 control login 可完成 recipe→generation→shadow→gated→灰度→CAS 发布；同输入重放的 generation、物理表、活动指针、发布事件、cache epoch、cache-invalidation outbox 和外部调用计数分别为 `1/1/1/1/1/1/1`。
  3. 20 路并发 promote（发布）恰一成功；指针、发布事件和 cache epoch 增量各为 `1`，其余 19 次可解释地冲突。
  4. runtime/control URL 互换、超级用户、`BYPASSRLS`、任何额外成员关系、public relation/schema/database owner（数据库所有者）、任一 manifest runtime/control 函数 owner、`search_path`、`PUBLIC EXECUTE` 或任意非 allowlist 角色对 control-`EXECUTE` / `rag_control`-`USAGE` 的直接 ACL 漂移、或非 control login 经 `SET ROLE` 进入 `rag_control_executor`、受信 schema owner/CREATE/USAGE 漂移或动态表缺 RLS policy（策略）均使控制 worker 启动失败，DDL（数据定义语言）与数据面写入为 `0`；runtime 仅保留 manifest 指定函数的 `app_role EXECUTE`。
  5. 前缀升级的缺表、错 owner、错策略或 member/物理向量错配 generation 均被隔离并不再指向 active；全部 `0032` 历史 generation/global 数据均不可读，本次迁移没有恢复分支。
  6. 任一失败/超时/epoch drift（世代漂移）后 active generation、可见 search（检索）结果和 cache epoch 均保持攻击前精确值；`unknown` 不出现自动第二次 embedding 外发。外发前/外发中/回包后三个崩溃点的同 request/provider 调用数均为 `≤1`；只有已对账 `failed` 的 predecessor（前序）才能用新 business revision（业务版本）创建 successor generation（后继世代）。
- **关联：** `RAG_CONTROL_DATABASE_URL`（仅 worker 配置，非 HTTP API）、`asRagControlExecutor`、`assertRagControlExecutorIdentity`、`rag_*` 控制函数；生产不变量中的 CAS、幂等键、RLS、持久有序事件日志；全格式 RAG 的版本、删除与灰度发布协议。
- **七类覆盖：** 正常（主流程）、异常（E1/E4/E5/E6）、特殊（冻结 binding 与代际）、逃逸通道（E3/X1）、高并发（E2/X1）、复杂（身份/状态机/embedding 组合）、刁钻（错挂/角色污染/原始 SQL）。

## 2. 测试矩阵与实施门

| 场景 | TC（测试用例） | 层级 | 必须量化的断言 | 初始状态 |
| --- | --- | --- | --- | --- |
| 主流程、E1 | `TC-RAG-01-N1/E1` | 全迁移隔离 PostgreSQL | 1 个 generation、1 张物理表、1 次发布/事件/cache epoch/outbox；同键重放增量均 0，同键不同摘要拒绝 | planned（计划中） |
| E2 | `TC-RAG-01-E2` | 20 并发隔离 PostgreSQL | 成功=1、冲突=19、活动指针/发布事件/cache epoch=1 | planned |
| E3 | `TC-RAG-01-E3` | runtime/gateway/privacy 三个低权登录 + 原始 SQL | manifest v1 每身份/每伪造 GUC（会话变量）control/global/legacy 函数、控制表、物理表和 global 写入=0；runtime search/evidence 跨主体=0 | planned |
| E4、X1 | `TC-RAG-01-E4/X1` | 0032 前缀升级隔离 PostgreSQL + fault seam（故障注入边界） | 全部 0032 旧链隔离；缺表/错 owner/RLS/成员错配隔离=1、active 指向不可信 generation=0；失败 generation=1；活动/缓存/发布账本增量=0 | planned |
| E5 | `TC-RAG-01-E5` | worker 启动契约 | 已挂载 control URL 的错身份/manifest owner、`search_path`、schema policy 漂移时启动失败=1；runtime 控制调用=0；未挂载时不创建控制连接，也不伪装启动 rebuild worker | local startup contract（本地启动契约，非真实 rebuild/云证据） |
| E6 | `TC-RAG-01-E6` | lease/reconcile（租约/对账）隔离测试 | 外发前/中/回包后崩溃的同 request 调用≤1；unknown（未知）自动重试=0；successor（后继）仅 `failed` predecessor+新 revision；接管者最多1个；账本连续；未建物理表删除成功=1；旧缓存 epoch 不命中=1 | planned |

**实施门结论（2026-08-10）：** 0073–0074、0079–0081 与角色/升级/派发/版本四组隔离 PostgreSQL（关系型数据库）证明已经落地并由专家复核；其中 0081 把并发恢复中的同一 request/key 精确收敛为一个 `dispatching` attempt：只有赢家返回可外发，后来者返回 `false`，不会把父请求重置或触发第二次外发。Worker 对已挂载的 `RAG_CONTROL_DATABASE_URL` 也会先验证独立低权登录和完整 definer/RLS 目录，错接 runtime/migration 登录或目录漂移均在任何循环启动前失败。未挂载 URL 时不会创建连接，更不会伪装启动尚未实现的通用 RAG rebuild/outbox worker。它们关闭了“0032 控制授权可由普通 runtime（运行时）伪造”的本地代码级 P0；仍不得把 qbank（共享题库）的控制身份隔离外推至全格式 RAG 发布，也不得将本地 `release_evidence=false` 回执当成云端、真实 embedding（向量嵌入）、全格式摄取、人工审批或高可用证据。上述未实现 receipt（回执）、worker/outbox（外发箱）和真实云测试仍为发布阻断。
