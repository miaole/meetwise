---
id: architecture_backend_rls_isolation
name: 多租户 RLS 隔离机制
description: Postgres 行级安全把租户/用户隔离做成 DB 强制、fail-closed——principal 上下文绑定、谓词 SQL、连接池协议、全路径注入、越权测试当发布门禁。实现生产不变量原语 3。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ../../rules/global/production-invariants.md
  - ./data-model.md
---

# 多租户 RLS 隔离机制

> 实现 [生产不变量](../../rules/global/production-invariants.md) 原语 3。隔离不是「应用记得带 where」，而是 **DB 强制 + fail-closed**：没绑 principal 就返回 0 行，绝不返回全表。这是 B/C 两产品线物理隔离生死线的技术底座。

## 1. 数据归属模型

承 `data-model.md`：每条受控数据归属一个 **principal**，类型判别二选一非空：

- `owner_user_id`（C 端用户私有）或 `owner_tenant_id`（B 端租户所有），**恰一非空**（CHECK 约束）。
- 语料另有四级可见性 `private / org / shared / global`，与归属正交。

## 2. principal 上下文绑定（每事务）

每个请求解析出 principal，在**事务内**写入 GUC，随事务结束自动清除。**必须用绑定参数 `set_config`，绝不字符串拼接 `SET LOCAL …=$userId`**（拼接 = GUC 注入面，把隔离底座变越权入口）：

```sql
-- 正确：$1 是绑定参数，不是字符串插值；写前先校验 uuid 形态
SELECT set_config('app.principal_user', $1, true);     -- C 端
SELECT set_config('app.principal_tenant', $2, true);   -- B 端（如适用）
```

写入前对 `$1/$2` 做 uuid 形态校验（`::uuid` 或正则），非法即拒绝，杜绝注入与脏 principal。**任何 `SET LOCAL app.x = ` + 变量拼接的写法一律禁止。**

读取用带缺省的 `current_setting('app.principal_user', true)`——**未设置返回 NULL**，谓词随即落空（fail-closed）。

**信任边界（发布阻断）**：`app.principal_user`（应用主体会话变量）是可信 HTTP（超文本传输协议）/worker（后台进程）进程向数据库传递已验证主体的上下文，**不是不可伪造身份根**。持有 runtime（运行时）数据库登录且能执行任意 SQL（结构化查询语言）的一方同样可以 `SET LOCAL app.principal_user`。因此这套 RLS（行级安全）能防正常业务路径遗漏 owner（所有者）条件和无上下文访问，但不能单独抵抗 SQL 注入、运行时凭据泄露或低权 SQL 控制台滥用。涉及删除、付款、角色授予或其他高风险 `SECURITY DEFINER`（受控权限函数）操作，必须使用独立无表权限 executor（执行角色）+ 已验证且短时的签名授权断言；不能仅以该 GUC（会话变量）、`current_user`（当前数据库用户）或 GUC 中的 UUID（通用唯一标识符）作为 capability（能力令牌）。当前此独立身份根尚未实现，故完整简历删除接口保持 `503 fail-closed`（故障关闭）。

**连接池协议（头号脚枪）**：`SET LOCAL` 只在当前事务有效，**必须配事务模式连接池**（PgBouncer transaction mode），否则 session 模式下连接跨请求复用会把上一个请求的 principal 串给下一个 = 静默越权。规则：

- 池子事务模式；或每请求独占连接并在归还前 `RESET`。
- 严禁用 `SET`（会话级）替代 `SET LOCAL`。
- **实现现状（doc-drift 已修）**：本仓库**不用 Prisma**，改用原生 `pg` + `packages/db` 的 `asPrincipal(pool, owner, fn)` 包裹器——事务第一句 `SELECT set_config('app.principal_user', $1, true)`（绑定参数，非拼接），业务查询随后，事务结束自动清 GUC。原「Prisma interactive transaction」表述为历史 stale，现为 `asPrincipal`。

## 3. 谓词与 fail-closed 角色

每张受控表 `ENABLE ROW LEVEL SECURITY` 并加策略：

```sql
-- 用户私有
CREATE POLICY p_user_owned ON interview
  USING (owner_user_id = current_setting('app.principal_user', true)::uuid);

-- 租户所有 + 成员关系
CREATE POLICY p_tenant_member ON interview
  USING (owner_tenant_id IN (
    SELECT m.tenant_id FROM membership m
     WHERE m.user_id = current_setting('app.principal_user', true)::uuid
       AND m.status = 'active'));
```

- 应用 DB 角色**不得有 `BYPASSRLS`、不得是表 owner**（owner 隐式绕过 RLS）。迁移/超管用独立高权角色，与应用角色分离。
- **实现现状（2026-08-10，不能过度表述）**：归属表使用 `ENABLE` **且 `FORCE ROW LEVEL SECURITY`**；`user_account` 有 self-RLS。`provisionRuntimeLogin` 创建 `NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS` 登录，并仅授予 `app_role` 与无表权限的 `app_gateway_role` 成员资格。`0045_checkpoint_thread_rls.sql` 将 `checkpoints`、`checkpoint_blobs`、`checkpoint_writes` 绑定到 owner；`0047_checkpoint_privacy_fence.sql` 再要求 `owner + threadId + fenceEpoch + active`，并以触发器锁 enrollment 阻止撤回后的迟到写入。`pnpm checkpoint-role:prove` 已验证跨 owner 的读取、更新和删除为 0，且撤回后旧 epoch 写入/重新登记均被拒绝。`0063_resume_active_content_read_gate.sql` 进一步让 `erasure_fenced`（已围栏）/`erased`（已擦除）简历的 blob/profile（原文/画像）在低权 SQL 下读取=0。**仍未获得云上低权账号的完整 API、队列 drain、压力和故障恢复证据；更根本地，principal GUC 还不是抵抗任意 runtime SQL 的签名身份根，checkpoint 的历史物理擦除、备份和外部数据面删除也仍未闭环。因此不能宣称生产最小权限、隐私删除或租户隔离已经全部闭环。**
- principal 未设置 → `current_setting(..., true)` 为 NULL → 谓词为假 → **0 行**。功能会坏，但坏在安全侧，且被测试抓到。
- **会话吊销已接线**：`PrincipalGuard` 验签后**再查一次 `user_account.status='active'`**（60s 缓存），禁用/改密即失效——防"被盗令牌在 TTL 内继续畅通"。这是 RLS 之上的主体有效性闸，非 RLS 本身。

## 4. 全路径注入（一个都不能漏）

任何「开了 DB 连接却没 `SET LOCAL`」的路径都是越权入口。必须覆盖：

| 路径 | 怎么注入 principal |
| --- | --- |
| HTTP 请求 | 认证后 guard/interceptor 解析 → 事务包装器 SET LOCAL |
| worker / 队列任务 | principal 随 job payload 传递，消费第一步恢复再查任何库 |
| LangGraph checkpointer 读写 | `0043` 预建供应商表，`0045` 以 `checkpoint_thread_enrollment(thread_id, owner_user_id)` 建立每行 owner-RLS；`0047` 要求 `CheckpointAccess(owner,threadId,fenceEpoch)` 并在三张 vendor 表的触发器中复核 active epoch；worker 以 principal-bound pool 写入，运行时不得 `setup()` 建表。仍须补齐历史 checkpoint 的隐私删除/GC（垃圾回收）闭环。 |
| 缓存键（Redis） | 键名前缀带 principal，禁止跨 principal 命中 |
| trace / 日志 | 按 principal 脱敏，不串户 |
| 后台批量 job（B 端排名等） | 每条处理绑对应租户 principal，不以高权角色裸跑 |

### 4.1 运行时账号切换的完成条件（P0）

迁移容器可在同时提供 `APP_RUNTIME_DB_USER` 与 `APP_RUNTIME_DB_PASSWORD` 时创建/轮换低权运行时登录；应用容器只能使用该登录。切换前必须完成以下工作，不能只改 Compose 环境变量：

1. ✅ API 的账户自助访问走 `asPrincipal`；注册/登录/支付 webhook（支付服务端回调）只调用 `app_gateway_role` 的固定函数。运营和 B 端跨用户函数在函数内复核 principal，不能只信 HTTP guard。
2. ✅ worker 的队列 owner 枚举、队列 gauge（仪表）、费用摘要均改为只返回最小字段的固定网关函数；运行时不得直读队列正文或费用账本。价格/预算写入移至短生命周期 migrate 服务，worker 只读摘要并在 enforce（强制）模式下缺配置即退出。
3. ✅ LangGraph checkpoint 表随 `0043` 迁移预建；`pnpm checkpoint-role:prove` 在独立 PostgreSQL 验证低权账号能中断、恢复、落库，但不能直读 checkpoint 表或执行 DDL。
4. ⬜ 在临时生产同构数据库以低权登录跑完整 HTTP、队列、迁移后 smoke（冒烟）、负路径与压力门；所有“permission denied”必须逐一分类为缺权限或越权设计，不能为绿灯而回退高权账号。
5. ⬜ 连续观察授权拒绝率、RLS 0 行率、队列积压、失败重试和业务终态；演练 rollback（回滚）账号与时限。

## 5. B 端生死线：RLS 是基线，不是全部

RLS 是**逻辑隔离**。对 B 端高敏数据（候选人库、考核结论），是否再上 **schema-per-tenant / 独立库** 的物理隔离，是一个需要单列 ADR 的取舍（隔离强度 vs 运维与成本）。本 spec 锁定 RLS 为统一基线；物理隔离决策见 ADR（待补）。

## 6. 失败模式

| 失败 | 后果 | 防御 |
| --- | --- | --- |
| 池子 session 模式 | 跨请求 principal 串号、越权读 | 事务模式池 + 禁 `SET` |
| 忘了 SET LOCAL | 0 行（功能坏，安全） | 测试抓 + 事务包装器统一 |
| 应用角色有 BYPASSRLS | 隔离全失效 | 角色权限审计、CI 检查 |
| runtime 登录可执行任意 SQL | 可伪造 principal GUC，RLS 失去主体真实性 | 密钥隔离、参数化查询/无 SQL 控制台；高风险操作改为独立 executor + 签名授权断言 |
| 谓词写错（OR 短路） | 越权 | 多角色越权测试门禁 |

## 7. 测试 = 发布门禁

多角色矩阵，**0 越权是上线前置条件**：

- A 租户上下文查 B 的数据 → 断言 0 行。
- 无 principal → 断言 0 行。
- worker / 缓存 / 批量路径 → 断言同样强制。
- 成员关系撤销后 → 立即失去访问。
- 低权 runtime login → 断言没有 `SUPERUSER`、`BYPASSRLS`、建表/建角色/切高权角色权限，且仍只能见自己的行；固定函数不得返回正文（`pnpm runtime-role:prove`，19 项）。
- 低权 checkpointer → 断言能恢复同一 graph 但不能直读 checkpoint 表、不能做 vendor DDL（`pnpm checkpoint-role:prove`，3 项）。

这套与原语 1（CAS 的 WHERE 同样在 principal 作用域内）、原语 4（事件账本按 principal 隔离）协同——三者共同构成「改状态既安全又不越权」的底座。
