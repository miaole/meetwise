---
id: rule_backend_qbank_control_definer_sealed_manifest
name: QBank 控制面 SECURITY DEFINER 密封依赖清单（RAG-FUNNEL-01A）
description: 冻结 QBank 控制面 definer 移交的权威依赖闭包：固定 definer 角色、31 函数 / 15 表 / 2 视图的 owner/ACL/RLS/fixed-search_path 契约、既有 generation 分区/索引 owner 转移、未知 SECURITY DEFINER 的 fail-closed 目录门禁。§6.1–6.5 已纳入源码闭包；云组合根回执与 routed serving 仍未关闭。
type: rule
scope: backend
level: must
status: active
owner: architecture
version: 2
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

> 本清单是 PRD-TEST-016 的 P0 前序产物。它**冻结**「底表移交后 control / serving 不得 42501」这件事所依赖的精确对象集合与契约，供后续 `RAG-FUNNEL-01` 的部署回执与 `MetadataReviewReceipt` 对照核验。权威源是 `packages/db/src/principal.ts` 的三个 manifest 与 `assertQbankControlDefinerOwnership`。每一条都给出「为什么」——这不是静态列表，是承重安全边界。

---

## 0. 结论先行

- **在闭包内（源码已密封）：31 函数 + 15 表 + 2 视图 + 既有 generation 分区/索引。** `QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST` / `TABLE_MANIFEST` / `VIEW_MANIFEST` 与 `0094` + `provisionQbankControlDefiner` 对齐。原 §6.1–6.5（bounded reader、security-definer view、词法 helper、pool/cache/epoch trigger、quarantine/source guard）**已在同一 owner/ACL/RLS/fixed-`search_path` 清单内**，不再是「仍归迁移角色」的缺口。
- **本地隔离 proof 存在，不是云发布回执。** `packages/db/test/qbank-handoff-closure.proof.ts`（`pnpm qbank-handoff-closure:prove`）覆盖移交前 42501、移交后 catalog gate、低权 ingest、MetadataReviewReceipt 表写入、lane(b) 撤销、二次 provision 重入，以及本轮补上的 bounded reader 非 42501 与 raw relation/view read=0。`releaseEvidence=false`。本机 Docker daemon 不可用时该组合根不会在当前树上重跑；不得把源码密封写成已部署验证。
- **仍未关闭（不得过度声明）：** 云/标准部署组合根回执；`MetadataReviewReceipt` 进入 routed serving（01）；generation projection / track-local serving（02+）；生产 Worker 仍固定“技术岗”。`0124_rag_retrieval_acl_fail_closed.sql` 只把 generic RAG resolve/search/evidence 的空 principal 收成 `rag_acl_principal_missing`，不授权 routed 出题。

---

## 1. 固定 definer 角色契约

| 属性 | 要求值 | 为什么 |
| --- | --- | --- |
| 角色名 | `qbank_control_definer` | 31 函数 / 15 表 / 2 视图移交后的唯一所有者。 |
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

## 2. 在闭包内：31 函数移交清单（`QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST`）

> owner 全部 = `qbank_control_definer`；`prosecdef` 标记 SECURITY DEFINER 或 INVOKER；`allowAppRoleExecute` / `allowExecutorExecute` 是精确 EXECUTE 授权契约，多余授权即启动失败。search_path 全部**固定**（非 NULL），杜绝 `search_path` 劫持。

### 2.1 原 18 个控制面锚点（0086/0087/0089）

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

### 2.2 原 §6.1–6.5（现已在闭包内）

| 签名 | SECURITY DEFINER? | app_role EXECUTE | executor EXECUTE | 固定 search_path | 组别 |
| --- | --- | --- | --- | --- | --- |
| `qbank_generation_ann_search(text,vector,integer)` | 是 | 是 | 否 | `public, pg_temp` | 6.1 bounded reader |
| `qbank_generation_lexical_search(text,text,integer)` | 是 | 是 | 否 | `public, pg_temp` | 6.1 |
| `qbank_generation_distances(text,vector,text[])` | 是 | 是 | 否 | `public, pg_temp` | 6.1 |
| `qbank_generation_evidence(text,text[],integer)` | 是 | 是 | 否 | `public, pg_temp` | 6.1 |
| `qbank_active_generation_metadata()` | 是 | 是 | 否 | `public, pg_temp` | 6.1 |
| `qbank_active_source_id(text)` | 是 | 是 | 是 | `public, pg_temp` | 6.1 策展去重 |
| `qbank_search_terms(text)` | 否（INVOKER） | 否 | 是 | `pg_catalog, public, pg_temp` | 6.3 词法 helper |
| `qbank_bump_retrieval_cache_epoch()` | 是 | 否 | 否 | `public, pg_temp` | 6.4 trigger |
| `qbank_lock_retrieval_cache_epoch()` | 是 | 是 | 否 | `public, pg_temp` | 6.4 |
| `qbank_pool_visible_epoch_sync()` | 是 | 否 | 否 | `public, pg_temp` | 6.4 |
| `qbank_source_visible_epoch_sync()` | 否（INVOKER） | 否 | 否 | `public, pg_temp` | 6.4 |
| `qbank_integrity_quarantine_immutable()` | 是 | 否 | 否 | `public, pg_temp` | 6.5 |
| `qbank_source_guard_update()` | 否（INVOKER） | 否 | 否 | `public, pg_temp` | 6.5 |

- SECURITY DEFINER 函数以 `qbank_control_definer` 身份执行，因 FORCE RLS 作用于该非超级用户所有者，RLS 策略才不会被绕过。
- `qbank_search_terms` 的 search_path **已固定**为 `pg_catalog, public, pg_temp`（不再允许继承会话 search_path）。
- request 侧只通过 bounded reader / `qbank_visible_ref` 读；不得补回 raw-table GRANT。

---

## 3. 在闭包内：15 表 + 2 视图（`TABLE_MANIFEST` / `VIEW_MANIFEST`）

> 表 owner 全部 = `qbank_control_definer`；全部 `relrowsecurity=true AND relforcerowsecurity=true`（FORCE RLS）。`app_role` 仅对 `qbank_curator`、`qbank_cache_epoch` 有表级 `SELECT`，对 `qbank_visible_ref` 有视图 `SELECT`；其余原始表与 `qbank_retrieval_candidate` 零 request 权限。第 15 表是 `qbank_metadata_review_receipt`（executor SELECT/INSERT，request 全拒）。

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
| `qbank_metadata_review_receipt` | r | — | SELECT, INSERT |

| 视图 | security_invoker | app_role | executor |
| --- | --- | --- | --- |
| `qbank_retrieval_candidate` | `false`（0094 pin） | — | — |
| `qbank_visible_ref` | `false` | **SELECT** | — |

> **移交后必需不变量（`qbank_visible_ref` lane(b) 撤销隔离）**：
> 1. `qbank_visible_ref` 与 `qbank_retrieval_candidate` **必须共享同一 owner = `qbank_control_definer`**；
> 2. 该 owner **必须 NOBYPASSRLS**；
> 3. `p_qbank_pool_candidate_view`（0068）**必须允许「`qbank_retrieval_candidate` 的 owner」看全量 `qbank_pool_entry` 行（含已撤销源）**。
>
> **失效后果**：事实 1/2 被拆开会触发 `assertQbankControlDefinerOwnership` fail-fast；事实 3 被改掉时启动门禁不校验 SQL 体，被撤销块可能在 legacy 路径静默复活，只能靠 `qbank-handoff-closure:prove` 的端到端撤销断言拦截。

---

## 4. 分区与索引 owner 转移（递归）

- 以 `qbank_generation_chunk` 为父表的 `pg_inherits` 递归后代及其物理索引，在 `provisionQbankControlDefiner` 中递归 `OWNER TO qbank_control_definer`。
- 目录门禁复核：每个分区的 owner、ACL（app/executor/PUBLIC 全拒）、列级 ACL、索引 owner 全部归 definer；任何漂移即 fail-closed。

---

## 5. 未知 SECURITY DEFINER 目录检测（fail-closed）

- 门禁对 `public` schema 内、owner = `qbank_control_definer`、`prosecdef=true`、且**不在** 31 函数清单里的任何函数计数；非零即 `qbank_control_definer_ownership_invalid`。
- 覆盖的威胁：一个 rogue SECURITY DEFINER 被 `ALTER FUNCTION ... OWNER TO qbank_control_definer` 转移后，即使 ACL 仍 PUBLIC EXECUTE，也会被目录门禁拦下。

---

## 6. 检索 ACL fail-closed（generic RAG，与 QBank 清单并列）

QBank 密封清单不拥有 generic corpus 函数（那些归 `rag_runtime_definer`）。`0124_rag_retrieval_acl_fail_closed.sql` 只替换已有 `rag_bind_query` / `rag_resolve_query_binding` / `rag_search_bound` / `rag_evidence_bound` 的函数体：空或空白 `app.principal_user` 抛 `rag_acl_principal_missing`（`insufficient_privilege`），不得无范围检索。跨租户 binding 仍是 `rag_binding_unavailable`；global 无批准 provenance 仍是 0 行。域合同在 `packages/domain/src/rag-retrieval-acl.ts`。

编号（与并行未合入变更协调，不构成对方已合入的证据）：`main` 在合入 #65/#68/#69 后最新仍是 `0123_user_facing_context_snapshots.sql`（那三项无新迁移）。本切片占用 `0124`。并行隐私删除 sink（`memory_vector_chunk` 擦除）已改用 `0125_memory_vector_chunk_erasure.sql`，不得与本文件抢 `0124`，本文件也不得改号到 `0125`。`0124` 未进 `main`。该并行变更不在本树，不得把 `memory_vector_chunk` 写成已落地。#65 题目账本谓词、#68 公开预览写门禁、#69 公开 DELETE 503 / 无 `/answers` 均保持。

---

## 7. 验证边界（不得写成发布证据）

- 隔离 Docker 组合根里迁移角色可以是超级用户；因此「handoff 不 42501」必须用**移交前把 §6 对象改到非超级用户 owner → serving 见 42501 → provision 后再通**来证明，而不是只跑 happy path。`qbank-handoff-closure.proof.ts` 就是这条 before/after。
- 云上隔离验证仍 blocked（`cloud-runtime-and-migration.md` / UC-cloud-test-002）。本地回执一律 `releaseEvidence=false`。不得宣称云上 42501 已实测。

---

## 8. 与后续工作流的接缝

- `RAG-FUNNEL-01A`（本清单）：源码依赖闭包 + 本地 isolation/abuse proof。目录缺口不再是「readers 在闭包外」。
- `RAG-FUNNEL-01`：独立 `MetadataReviewReceipt` 进入 serving、完整 facets、经真实组合根验证的标准部署 handoff receipt。表已存在且 FORCE RLS，不等于 routed serving。
- **lane(b) 撤销隔离不变量**：任何回写 `qbank_visible_ref` / `qbank_retrieval_candidate` / `p_qbank_pool_candidate_view` 的后续迁移或 provision 改动，都必须重跑 `qbank-handoff-closure:prove` 的端到端撤销断言。0016 的 DO 硬断言（`rolsuper OR rolbypassrls`）**仅 pre-handoff 成立**。
- `RAG-FUNNEL-02A` 之前，本清单不回写 serving filter。本地 03–07 proof 不是生产 Worker 接线。
