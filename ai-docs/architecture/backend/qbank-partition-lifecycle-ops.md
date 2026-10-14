---
id: architecture_backend_qbank_partition_lifecycle_ops
name: QBank generation 分区释放运维手册
description: qbank_generation_chunk 分区释放例程（qbank_release_retired_generation_storage）的调用前置、锁窗语义、超时行为与故障处置；含 DETACH 无并发载体约束与手动执行的锁窗纪律。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ../../rules/backend/qbank-control-definer-sealed-manifest.md
  - ../../rules/global/production-invariants.md
---

# QBank generation 分区释放运维手册

> 释放例程 = `qbank_release_retired_generation_storage(p_generation text)`（`SECURITY DEFINER`，
> owner/ACL/`search_path` 契约归 [QBank 控制面密封清单](../../rules/backend/qbank-control-definer-sealed-manifest.md)）。
> 调用面 = qbank 控制面执行器角色 `qbank_control_executor`（`REVOKE ALL … FROM PUBLIC, app_role` 收口后
> executor-only）。本手册是运维执行与故障处置口径，不是发布证据。

## 1. 调用前置（守卫语义，逐条 fail-closed）

1. **definer 白名单**：`tf_is_generation_control_definer()` 不通过即 `qbank_release_storage_definer_required`（伪造
   `app.principal_user` GUC 不构成授权根，执行授权边界=EXECUTE 授权面）。
2. **目标代已终结**：仅 `retired` / `failed` 可释放；`building`/`validated`/`active` 一律拒绝。
3. **非当前 active 指针**：`qbank_active_generation` 指向该代即拒绝。
4. **回滚窗口已死**：`retired` 代须 `qbank_corpus_epoch.epoch` 已前进过该代 `source_epoch`（旧代在回滚窗口内是回滚资产）。
5. **幂等门**：`storage_released_at` 已落即拒绝（防二次 DETACH 撞不存在的分区名）。

## 2. 锁窗语义与超时（DETACH 无并发载体约束）

- `DETACH PARTITION` **没有并发载体**：`ALTER TABLE … DETACH PARTITION` 对父表取 `ACCESS EXCLUSIVE`；
  `DETACH CONCURRENTLY` 仅 PG14+ 且要求语句运行在事务块外——本例程函数体内 `EXECUTE` 恒在事务中，
  迁移运行器三种模式（transactional 单事务 / multi-statement 逐语句事务 / concurrent-index 解析器仅受
  `CREATE INDEX` 形）均不可承载并发 DETACH。故例程采用**函数内非并发 DETACH + `SET LOCAL lock_timeout`** 形：
- 函数体首行 `SET LOCAL lock_timeout = '15s'`（与迁移运行器 `MIGRATION_LOCK_TIMEOUT_MS` 默认族同值）：
  DETACH/DROP 等待热表强锁超过 15s 即放弃并报错，不拖住发布链路；`SET LOCAL` 只作用当前事务，
  事务结束自动复原，无会话泄漏。
- 锁窗评估：qbank chunk 分区为冷数据面（retired/failed 代无活跃读写），`ACCESS EXCLUSIVE` 等待主要来自
  长查询/备份窗口——避开 `VACUUM`/备份时段执行；超时即改窗重试，禁止为"过锁"手动放宽 `lock_timeout`。

## 3. 手动执行纪律（直连库时）

```sql
SET lock_timeout = '15s';
SET statement_timeout = '60s';
SELECT qbank_release_retired_generation_storage('<generation-id>');
```

- 先查 `qbank_vector_generation` 的 `state`/`storage_released_at`/`source_epoch` 三值确认前置满足再调；
- 不在事务内手动包裹（例程自身逐守卫 fail-closed，外层事务只会拉长锁窗）；
- 若释放失败于 DETACH 之后、DROP 之前：分区已脱离父表但元数据行未落 `storage_released_at`——
  重调例程会在幂等门拒绝，处置=核对 `qbank_generation_chunk_<suffix>` 物理表存在性后手工
  `DROP TABLE` 并落 `storage_released_at`（两步均在变更单下执行，禁止跳过守卫直接删元数据行）。

## 4. 观测与告警面

- 释放成功收据 = `qbank_vector_generation.storage_released_at` 非 NULL + 物理分区表消失；
- 释放异常（`check_violation`/`insufficient_privilege`/`lock_timeout` 55P03）一律停手按守卫语义归因，
  禁止 retry-to-green：守卫 2-5 报错代表状态机/回滚窗口/幂等面真实冲突，须先解决状态再释放。
