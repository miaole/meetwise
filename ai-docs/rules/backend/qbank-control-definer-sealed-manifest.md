---
id: rule_backend_qbank_control_definer_sealed_manifest
name: QBank 控制面 SECURITY DEFINER 密封依赖清单（RAG-FUNNEL-01A）
description: 冻结 QBank 控制面 definer 移交的权威依赖闭包：固定 definer 角色、18 函数 / 14 关系的 owner/ACL/RLS/fixed-search_path 契约、既有 generation 分区/索引 owner 转移、未知 SECURITY DEFINER 的 fail-closed 目录门禁，以及经真实隔离 PostgreSQL 实证的闭包外缺口清单。
type: rule
scope: backend
level: must
status: active
owner: architecture
version: 1
tags:
  - security
  - rls
  - security-definer
  - postgres
  - qbank
related:
  - ../../architecture/backend/rls-isolation.md
  - ../../architecture/backend/data-model.md
  - ../../delivery/production-readiness-remediation-register.md
---

# QBank 控制面 SECURITY DEFINER 密封依赖清单（RAG-FUNNEL-01A）

> 本清单是 PRD-TEST-016 的 P0 前序产物。它**冻结**「底表移交后 control / serving 不得 42501」这件事所依赖的精确对象集合与契约，供后续 `RAG-FUNNEL-01` 的部署回执与 `MetadataReviewReceipt` 对照核验。清单分两部分：**在闭包内（已覆盖并验证）** 与 **闭包外（实证缺口，未覆盖）**。每一条都给出「为什么」——这不是静态列表，是承重安全边界。

---

## 0. 结论先行

- **在闭包内：18 函数 + 14 关系 + 既有 generation 分区/索引，handoff 已验证。** 真实隔离 PostgreSQL 上 `qbank-control-role:prove` 12/12 通过（`packages/db/test/qbank-control-role.proof.ts`）。
- **在闭包外：13 个 `qbank_*` 函数 + 2 个视图仍归 `meetwise` 所有，不在 definer 移交闭包内。** 这正是 PRD-TEST-016 的 P0 缺口——bounded retrieval reader、security-definer view、词法 helper、pool/cache/epoch trigger 均在其中。
- **42501 在隔离测试里不显现**，因为隔离 Docker 里迁移角色 `meetwise` 是超级用户（`rolsuper=true, rolbypassrls=true`），绕过了 FORCE RLS。生产形态下（迁移主体非超级用户、或 serving 主体不复用超级用户）该缺口才会表现为 42501。这是必须如实报告的验证边界，不是「已验证通过」的证明。

---

## 1. 固定 definer 角色契约

| 属性 | 要求值 | 为什么 |
| --- | --- | --- |
| 角色名 | `qbank_control_definer` | 18 函数 / 14 关系移交后的唯一所有者。 |
| `rolcanlogin` | `false` | 不能有登录入口，杜绝被直接 `SET ROLE` / 连接进入。 |
| `rolinherit` | `false` | 不得继承任何授予它的成员关系，防止迁移超级用户经成员链塌缩控制面边界。 |
| `rolsuper` | `false` | 超级用户绕过 FORCE RLS，会让 SECURITY DEFINER 变成隐式提权。 |
| `rolbypassrls` | `false` | 同上，RLS 旁路等于没有 RLS。 |
| `rolcreaterole` / `rolcreatedb` / `rolreplication` | `false` | 最小权限面，无创建/复制能力。 |
| 成员关系（父/子） | 均为空 | 既不能是别人的成员（父关系），也不能有成员（子关系），否则可被 `SET ROLE` 进入或反向授予。 |
| `public` schema 权限 | `USAGE=true, CREATE=true` | 继承 PostgreSQL 默认，仅此两项，不得被收紧为只读（会让后续 `SET LOCAL ROLE` 建对象失败）。 |
| 全局默认函数 ACL | 恰好 1 条，且仅 `definer=X/definer`（owner-only） | 新函数默认不得向 PUBLIC 授予 EXECUTE；一条 owner-only 全局函数默认 ACL 是唯一允许形态。 |

**fail-closed 语义**：目录门禁 `assertQbankControlDefinerOwnership`（`packages/db/src/principal.ts`）在角色不存在、任何属性偏离、任何 ACL 漂移、任何未知 SECURITY DEFINER 时，一律抛 `qbank_control_definer_ownership_invalid` 而非静默放行。

---

## 2. 在闭包内：18 函数移交清单（`QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST`）

> owner 全部 = `qbank_control_definer`；`prosecdef` 标记 SECURITY DEFINER 或 INVOKER；`allowAppRoleExecute` / `allowExecutorExecute` 是精确 EXECUTE 授权契约，多余授权即启动失败。search_path 全部**固定**（非 NULL），杜绝 `search_path` 劫持。

| 签名 | SECURITY DEFINER? | app_role EXECUTE | executor EXECUTE | 固定 search_path |
| --- | --- | --- | --- | --- |
| `qbank_generation_chunk_only_building()` | 是 | 否 | 否 | `public, pg_temp` |
| `qbank_prepare_generation_partition(text)` | 是 | 否 | 是 | `public, pg_temp` |
| `qbank_validate_generation(text)` | 是 | 否 | 是 | `public, pg_temp` |
| `qbank_activate_generation(text)` | 是 | 否 | 是 | `public, pg_temp` |
| `qbank_mark_generation_failed(text,text)` | 是 | 否 | 是 | `public, pg_temp` |
| `qbank_question_chunk_requires_visible_source()` | 是 | 否 | 否 | `public, pg_temp` |
| `qbank_question_artifact_guard()` | 是 | 否 | 否 | `public, pg_temp` |
| `qbank_question_chunk_artifact_guard()` | 是 | 否 | 否 | `public, pg_temp` |
| `qbank_generation_question_evidence(text,text[],integer)` | 是 | 是 | 否 | `public, pg_temp` |
| `qbank_pool_requires_approved()` | 是 | 否 | 否 | `public, pg_temp` |
| `qbank_chunk_requires_approved_pool()` | 是 | 否 | 否 | `public, pg_temp` |
| `qbank_is_generation_control_definer()` | 否（INVOKER） | 是 | 是 | `pg_catalog, public, pg_temp` |
| `qbank_metadata_hash(text,text,text,text)` | 否（INVOKER） | 否 | 是 | `pg_catalog, public, pg_temp` |
| `qbank_is_curator()` | 否（INVOKER） | 是 | 是 | `pg_catalog, public, pg_temp` |
| `qbank_taxonomy_release_guard()` | 否（INVOKER） | 否 | 否 | `public, pg_temp` |
| `qbank_taxonomy_scope_guard()` | 否（INVOKER） | 否 | 否 | `public, pg_temp` |
| `qbank_taxonomy_manifest_hash(text)` | 否（INVOKER） | 否 | 是 | `pg_catalog, public, pg_temp` |
| `qbank_chunk_serving_scope_guard()` | 否（INVOKER） | 否 | 否 | `public, pg_temp` |

- 11 个 SECURITY DEFINER + 7 个 INVOKER 共 18。SECURITY DEFINER 函数以 `qbank_control_definer` 身份执行，因 FORCE RLS 作用于该非超级用户所有者，RLS 策略（`qbank_is_generation_control_definer()` 判定 `current_user` 是否为 11 个 definer 函数的所有者）才不会被绕过——这就是为什么 owner 必须是非超级用户、无登录、无成员的固定角色。
- `qbank_generation_question_evidence` 是唯一允许 `app_role` 执行的 bounded reader（在闭包内）。

---

## 3. 在闭包内：14 关系移交清单（`QBANK_CONTROL_DEFINER_TABLE_MANIFEST`）

> owner 全部 = `qbank_control_definer`；全部 `relrowsecurity=true AND relforcerowsecurity=true`（FORCE RLS，所有者亦受约束）。`app_role` 仅对 `qbank_curator`、`qbank_cache_epoch` 有 `SELECT`，其余 12 表 `app_role` 零权限；executor 权限按列精确。

| 关系 | 类型 | app_role 权限 | executor 权限 |
| --- | --- | --- | --- |
| `qbank_vector_generation` | r | — | SELECT, INSERT, UPDATE, DELETE |
| `qbank_generation_chunk` | p（分区父表） | — | SELECT, INSERT, UPDATE, DELETE |
| `qbank_corpus_epoch` | r | — | SELECT, UPDATE |
| `qbank_active_generation` | r | — | SELECT |
| `qbank_cache_epoch` | r | **SELECT** | SELECT, UPDATE |
| `qbank_question` | r | — | SELECT, INSERT, UPDATE, DELETE |
| `qbank_question_chunk` | r | — | SELECT, INSERT, UPDATE, DELETE |
| `qbank_curator` | r | **SELECT** | SELECT |
| `qbank_source` | r | — | SELECT, INSERT, UPDATE, DELETE |
| `qbank_pool_entry` | r | — | SELECT, INSERT |
| `qbank_chunk` | r | — | SELECT, INSERT |
| `qbank_taxonomy_release` | r | — | SELECT, INSERT, UPDATE |
| `qbank_taxonomy_scope` | r | — | SELECT, INSERT |
| `qbank_chunk_serving_scope` | r | — | SELECT, INSERT |

- 「—」表示该角色无任何表级/列级权限；`app_role` 对原始题库关系的 SELECT 全部经 SECURITY DEFINER bounded reader 或 RLS 策略走，不允许直接读路径。
- executor（`qbank_control_executor`）是控制登录经 NOINHERIT 进入的唯一执行角色，权限精确到列级校验；缺一项即启动失败而非延迟到 ingest/rebuild 才爆。

---

## 4. 分区与索引 owner 转移（递归）

- 以 `qbank_generation_chunk` 为父表的 `pg_inherits` 递归后代（既有 generation 分区）及其物理索引，在 `provisionQbankControlDefiner` 中递归 `OWNER TO qbank_control_definer`。PostgreSQL 不会随父表 owner 变更自动改子分区/索引 owner，故这是必须显式修复的 pre-handoff 形态。
- 目录门禁复核：每个分区的 owner、ACL（app/executor/PUBLIC 全拒）、列级 ACL、索引 owner 全部归 definer；任何漂移即 fail-closed。

---

## 5. 未知 SECURITY DEFINER 目录检测（fail-closed）

- 门禁对 `public` schema 内、owner = `qbank_control_definer`、`prosecdef=true`、且**不在** 18 函数清单里的任何函数计数；非零即 `qbank_control_definer_ownership_invalid`。
- 覆盖的威胁：一个 rogue SECURITY DEFINER 函数被 `ALTER FUNCTION ... OWNER TO qbank_control_definer` 转移后，即使其 ACL 仍 PUBLIC EXECUTE，也会被目录门禁拦下——不依赖函数默认 ACL（迁移 `0073` 已把迁移角色默认函数 ACL 收紧为 owner-only）。

---

## 6. 闭包外缺口清单（实证，未覆盖）

以下对象在当前库中 owner 均为 `meetwise`（迁移角色），**不在** `qbank_control_definer` 移交闭包内。这是 PRD-TEST-016 明确点名的 P0 缺口，逐条对照如下：

### 6.1 bounded retrieval reader（有界检索读取器）

| 签名 | SECURITY DEFINER? | 当前 owner | 固定 search_path |
| --- | --- | --- | --- |
| `qbank_generation_ann_search(text,vector,integer)` | 是 | meetwise | `public, pg_temp` |
| `qbank_generation_lexical_search(text,text,integer)` | 是 | meetwise | `public, pg_temp` |
| `qbank_generation_distances(text,vector,text[])` | 是 | meetwise | `public, pg_temp` |
| `qbank_generation_evidence(text,text[],integer)` | 是 | meetwise | `public, pg_temp` |
| `qbank_active_generation_metadata()` | 是 | meetwise | `public, pg_temp` |
| `qbank_active_source_id(text)` | 是 | meetwise | `public`（无 `pg_temp`） |

### 6.2 security-definer view

| 视图 | owner | security_invoker |
| --- | --- | --- |
| `qbank_retrieval_candidate` | meetwise | `security_invoker=false`（0094 §C 显式 pin；0068 曾默认 NULL） |
| `qbank_visible_ref` | meetwise | `security_invoker=false` |

> **移交后必需不变量（`qbank_visible_ref` lane(b) 撤销隔离，RAG-FUNNEL-01 收口）**：
> handoff 后这两视图 owner 变为 `qbank_control_definer`（NOSUPERUSER **NOBYPASSRLS**）。此时 `qbank_visible_ref`
> lane(b) 的 `NOT EXISTS(池条目)` 要能看到**已撤销源的池条目**、从而排除被撤销块，**不再**依赖 0016 时代的
> 「视图属主 rolsuper/rolbypassrls」（那在 post-handoff 形态已被 `assertQbankControlDefinerOwnership` 反向要求为
> `owner_bypass_rls===false`）。撤销正确性改由下面**三个必须同时成立**的事实承接：
>
> 1. `qbank_visible_ref` 与 `qbank_retrieval_candidate` **必须共享同一 owner = `qbank_control_definer`**
>    （`assertQbankControlDefinerOwnership` 的 `view_owner_count===1` 已锁死这一点）；
> 2. 该 owner **必须 NOBYPASSRLS**（若带 bypassrls，FORCE RLS 被绕过，反而是隐式提权）；
> 3. `p_qbank_pool_candidate_view`（0068）**必须允许「`qbank_retrieval_candidate` 的 owner」看全量 `qbank_pool_entry`
>    行（含已撤销源）**——它按 `qbank_retrieval_candidate` 的**动态 relowner** 命名授权，而不是按 `qbank_visible_ref`，
>    所以「两视图 owner 一致」是这条 RLS 谓词能命中 lane(b) `NOT EXISTS` 的前提。
>
> **失效后果**：事实 1/2 被拆开（两视图 owner 分开、给 owner 加 bypassrls）会触发启动门禁
> `assertQbankControlDefinerOwnership` 的 `view_owner_count===1` / `owner_bypass_rls===false` **fail-fast 拦截**；
> 而事实 3（删掉/改动 0068 的 `p_qbank_pool_candidate_view` 候选视图策略体）**启动门禁不校验**（它只校验
> owner/ACL/RLS 形状，不校验 `qbank_visible_ref` 的 SQL 体或该策略体），被撤销（approved→rejected）的块会在
> legacy 路径 `annSearchLegacy`（`retrieval-legacy.ts` → `retrieval-store.ts` / `qbank-generation-retrieval.ts` 的
> legacy/pre-generation 分支）**静默复活**，只能靠端到端撤销断言拦截。端到端撤销断言已永久固化在 `packages/db/test/qbank-handoff-closure.proof.ts`
> （「post-handoff: revoking an approved source drops its chunk from qbank_visible_ref (lane (b) does not resurrect it)」）。

### 6.3 词法 helper

| 签名 | SECURITY DEFINER? | 当前 owner | 固定 search_path |
| --- | --- | --- | --- |
| `qbank_search_terms(text)` | 否（INVOKER） | meetwise | **NULL（未固定，继承会话 search_path）** |

### 6.4 pool / cache / epoch trigger

| 签名 | SECURITY DEFINER? | 当前 owner | 固定 search_path |
| --- | --- | --- | --- |
| `qbank_bump_retrieval_cache_epoch()` | 是 | meetwise | `public, pg_temp` |
| `qbank_lock_retrieval_cache_epoch()` | 是 | meetwise | `public, pg_temp` |
| `qbank_pool_visible_epoch_sync()` | 是 | meetwise | `public, pg_temp` |
| `qbank_source_visible_epoch_sync()` | 否（INVOKER） | meetwise | `public, pg_temp` |

### 6.5 其它仍在 `meetwise` 名下的 `qbank_*` 函数

| 签名 | SECURITY DEFINER? | 当前 owner |
| --- | --- | --- |
| `qbank_integrity_quarantine_immutable()` | 是 | meetwise |
| `qbank_source_guard_update()` | 否（INVOKER） | meetwise |

---

## 7. 为什么 42501 在隔离测试里不显现（验证边界）

- 隔离 Docker 组合根里迁移角色 `meetwise` 是超级用户（`rolsuper=true, rolbypassrls=true`）。闭包外 SECURITY DEFINER 函数以 `meetwise` 身份执行时绕过 FORCE RLS，写 `qbank_cache_epoch` / `qbank_corpus_epoch` / `qbank_pool_entry` / `qbank_source` 不触发 42501。
- 生产形态（迁移主体非超级用户，或 serving 主体不复用超级用户）下，这些 trigger/reader 会因 RLS 拒绝而 42501——**这正是本清单要移交它们的原因**。
- 因此「handoff 不 42501」当前**只能证明闭包内那 18 函数 + 14 关系**；闭包外对象的 42501 风险未消除，只能如实标记为缺口，不能宣称已验证。
- **云上隔离验证当前 blocked（用户决策缺口）**：本清单的「真实隔离 PostgreSQL 12/12 通过」证据是**本地 Docker 隔离容器**（`LOCAL_ISOLATED_PROOF_RECEIPT`、随机端口、`release_evidence=false`），**不是云**。云上验证整体未落地——`ai-docs/requirements/use-cases/cloud-runtime-and-migration.md`（UC-cloud-test-002）明确「当前代码尚不能从 PostgreSQL socket 证明控制台 instance/VPC 声明，也没有已签名 TargetGrant 或 ECS executor；本 UC 与全部云执行 case 仍为 blocked」。云 RDS TLS 三模式（`Connection terminated unexpectedly`）目前仅记录于 gitignored `.tmp/user-oncall-checklist.md`，无持久回执、无日志；`.env.cloud-test.local` 的 `CLOUD_TEST_PG_SSL_MODE=verify-full` 只是静态配置值，非测量结果。因此「云上 42501 实测」是**待用户决策的未关闭项**（需 RDS TLS/CA/安全组/同 VPC 运行器），本清单不得据此宣称云上已验证。

---

## 8. 与后续工作流的接缝

- `RAG-FUNNEL-01`：以本清单为部署回执 + `MetadataReviewReceipt` 的对照基；把 6.1–6.5 闭包外对象纳入移交闭包（owner/ACL/RLS/fixed-search_path 四项齐备）。
- **lane(b) 撤销隔离不变量（§6.2）**：§6.2 的「三事实必须同时成立」是 `RAG-FUNNEL-01` 移交闭包承重后的**新必需不变量**。任何回写 `qbank_visible_ref` / `qbank_retrieval_candidate` / `p_qbank_pool_candidate_view` 的后续迁移或 provision 改动，都必须重跑 `qbank-handoff-closure:prove` 的端到端撤销断言；否则不得宣称撤销隔离成立。0016 的 DO 硬断言（`rolsuper OR rolbypassrls`）**仅 pre-handoff 成立**——它运行时（0016 早于 0068 与 provision）owner 还是迁移角色，0068 的候选视图策略尚不存在；post-handoff 该前置已被 §6.2 三事实取代，不得再据此要求移交后的 owner 绕 RLS。
- `RAG-FUNNEL-02A`（canonical projection / provider-input recipe）之前，本清单不回写。
