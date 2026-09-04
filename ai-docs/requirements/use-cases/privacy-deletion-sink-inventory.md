---
id: use_cases_privacy_deletion_sink_inventory
name: 隐私删除 sink 盘点与向量块回执围栏
description: 把删除回执盘点定为真相，并为 vector_chunk kind=memory 补账户轨道 target/写围栏/残留=0；公开删除保持故障关闭。
type: requirements
scope: shared
level: spec
status: active
owner: platform
version: 1
related:
  - ../../architecture/ai/privacy-deletion-sink-inventory.md
  - ./resume-erasure-lifecycle.md
  - ./checkpoint-privacy-erasure.md
  - ./memory-governance-and-recall.md
  - ../use-case-conventions.md
  - ../../rules/global/production-invariants.md
tags:
  - privacy
  - deletion
  - vector_chunk
  - memory
  - testing
---

# 隐私删除 sink 盘点与向量块回执围栏

## 生成前门禁

| 字段 | 内容 |
| --- | --- |
| 任务范围 | 在 ai-docs 固定删除 sink 盘点；为 `vector_chunk.kind='memory'` 补账户删除 target、写围栏与残留=0 回执。公开删除入口保持 503。 |
| 来源证据 | `0096` 登记过 MEM-00 未覆盖 `vector_chunk`；`0093` `memory_begin_account_erasure` 只枚举 3 sink；`memory_embedding` 只删 `memory_index_generation`；0125 补 `memory_vector_chunk`；PRD-TEST-015 / 盘点仍开 `user_memory` 与 trace；公开入口 `PrivacyService` 503。 |
| 明确不做 | 不重开公开删除；不改冻结 0093 三 sink 形状；不删 `kind='qbank'`；不宣称账户/备份/trace/`user_memory` 已完整删除；不接生产长期记忆写入。 |
| 领域对象 | `privacy_erasure_request`、`privacy_deletion_target`、`vector_chunk`、授权快照 jti。 |
| 状态机影响 | 本 sweep：request `requested→fenced→purging→completed`；target `pending→leased→erased`。无行级 fenced 列。 |
| 接口契约影响 | 无新公开 HTTP。域侧新增 `memory_vector_chunk` 进签发并集。 |
| 数据库影响 | 迁移 `0125`：扩展 sink CHECK、worker ACL/RLS、begin/claim/purge、写围栏触发器。 |
| 测试计划 | 域 pin（可无库）+ 隔离 PostgreSQL 七类证明 + 既有 HTTP 503 证明。 |
| 验证命令 | `pnpm -C packages/domain prove:memory-vector-chunk-deletion`；`pnpm memory-vector-chunk-erasure:prove`（需隔离库）；`pnpm privacy-erasure:http:prove`；`pnpm docs:check`。阻塞：本机无容器时隔离库证明不可跑，不得改写成已验证发布。 |

盘点正文只维护在 [`privacy-deletion-sink-inventory.md`](../../architecture/ai/privacy-deletion-sink-inventory.md)。

## 用例 · 账户删除必须枚举记忆向量块回执

- **角色 Actor：** 候选人（数据主体）、隐私签发器、受约束 deletion worker。
- **前置 Precondition：** 账户存在；owner 可在 `vector_chunk` 持有 `kind='memory'` 行；公开删除入口 503。
- **触发 Trigger：** `memory_vector_chunk_begin_erasure(idempotency_key_hash)`（64-hex），经 `app_role` + owner GUC。
- **主流程 Main：**
  1. 短事务校验账户、按幂等键建或重放 `privacy_erasure_request(scope='account_data')`。
  2. 插入恰好 1 个 `sink='memory_vector_chunk'` target，计算活 `target_set_digest`，request→`fenced`。
  3. 此后该 owner 的 `kind='memory'` INSERT/UPDATE 被触发器拒绝。
  4. 签发 `account_data_erasure` 快照 → consume jti → claim → purge：只 DELETE `owner=principal AND kind='memory'`，残留=0 才 `erased`。
- **备选流 Alternate：** 同 hash 重放返回同一 request（`replayed=true`），不双写 target。
- **异常流 Exception：**
  - **E1 重复：** 唯一键 `(owner, idempotency_key_hash)`，并发只 1 request。
  - **E2 并发：** claim/purge 租约 token + version CAS，恰一赢；陈旧 token → `lease_lost`。
  - **E3 越权：** 跨 owner claim/purge=0；RLS + owner 双校验。
  - **E4 残留：** DELETE 后 `kind='memory'` 计数≠0 → `memory_vector_chunk_target_residual_rows`，不标 erased。
  - **E5 降级：** 未知 sink / 非 account 域 claim → `sink_forbidden`；公开 HTTP 仍 503。
  - **E6 重连：** 同 key 重放同一 `requestId`。0125 只建 1 个 target，purge 同事务把 request 置 `completed`；再 purge → `memory_vector_chunk_target_request_not_active`（证明层断言拒绝，不是再删 0 行）。SQL 虽有「target 已 erased 且 request 仍 active → `deleted_count=0`」分支，单 target sweep 不可达，不得当成本迭代验收。
- **后置 Postcondition：** 本 sweep 有 target 回执；owner 的 memory 向量残留=0；qbank 与他户行不变；`user_memory` / trace / 外部 sink 仍按盘点未闭合；公开删除仍 503。
- **验收 Acceptance：** 见下方七类矩阵；禁止只断言 HTTP 200 或“函数存在”。
- **关联：** 四原语（CAS / 幂等键 / RLS / 删除账本）；盘点 §4–§5。
- **七类覆盖：** 正/异/特/逃/并/复/刁。

### 七类测试覆盖

| 类 | 证明层 | 能失败的断言 |
| --- | --- | --- |
| 正 | 隔离 PostgreSQL | begin 恰好 1 个 `memory_vector_chunk` target；digest 与 TS 逐字节相等；purge 后 owner `kind='memory'` =0 且 request 可 completed |
| 异 | 隔离 PostgreSQL | 非 64-hex hash 拒；残留≠0 不得 erased |
| 特 | 域 pin + 隔离库 | 0093 begin 仍是 3 sink 且不含本 sink；`kind='qbank'` 行数不变 |
| 逃 | HTTP + 隔离库 | 公开简历/面试 DELETE 仍 503 且 request=0；面试删除不误删 `vector_chunk`（既有 0096 证明） |
| 并 | 隔离 PostgreSQL | 同 target 并发 claim 恰一 lease winner |
| 复 | 隔离 PostgreSQL | 0093 三 sink 走完后向量行仍在；必须另开本 sweep 才进回执；本 sweep `completed` 后再 purge 拒（`request_not_active`），不是再删 0 行 |
| 刁 | 隔离 PostgreSQL | 跨 owner raw 读/删=0；围栏后迟到 memory 写入失败；伪造 sink/域 claim 拒 |
