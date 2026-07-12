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
- **实现现状（已验证 solid）**：所有归属表 `ENABLE` **且 `FORCE ROW LEVEL SECURITY`**（`packages/db/sql/01_schema.sql` 等对全表 `ALTER TABLE … FORCE`）——连超级用户经 `app_role` 也不绕过。commerce 对账等**调度层基础设施**才用最小权限 dispatcher 角色（BYPASSRLS，仅只读 `owner_user_id` 枚举待办），逐 owner 处理仍回落 RLS 限定的 principal。
- principal 未设置 → `current_setting(..., true)` 为 NULL → 谓词为假 → **0 行**。功能会坏，但坏在安全侧，且被测试抓到。
- **会话吊销已接线**：`PrincipalGuard` 验签后**再查一次 `user_account.status='active'`**（60s 缓存），禁用/改密即失效——防"被盗令牌在 TTL 内继续畅通"。这是 RLS 之上的主体有效性闸，非 RLS 本身。

## 4. 全路径注入（一个都不能漏）

任何「开了 DB 连接却没 `SET LOCAL`」的路径都是越权入口。必须覆盖：

| 路径 | 怎么注入 principal |
| --- | --- |
| HTTP 请求 | 认证后 guard/interceptor 解析 → 事务包装器 SET LOCAL |
| worker / 队列任务 | principal 随 job payload 传递，消费第一步恢复再查任何库 |
| LangGraph checkpointer 读写 | **不归 RLS**（库管理表无 owner 列、挂不上策略）→ 改由 ai-runtime 以 `threadId(=resultId)` 反查 `Interview` 归属做**应用层授权**；或给 checkpoint 表加 principal 列后再上 RLS |
| 缓存键（Redis） | 键名前缀带 principal，禁止跨 principal 命中 |
| trace / 日志 | 按 principal 脱敏，不串户 |
| 后台批量 job（B 端排名等） | 每条处理绑对应租户 principal，不以高权角色裸跑 |

## 5. B 端生死线：RLS 是基线，不是全部

RLS 是**逻辑隔离**。对 B 端高敏数据（候选人库、考核结论），是否再上 **schema-per-tenant / 独立库** 的物理隔离，是一个需要单列 ADR 的取舍（隔离强度 vs 运维与成本）。本 spec 锁定 RLS 为统一基线；物理隔离决策见 ADR（待补）。

## 6. 失败模式

| 失败 | 后果 | 防御 |
| --- | --- | --- |
| 池子 session 模式 | 跨请求 principal 串号、越权读 | 事务模式池 + 禁 `SET` |
| 忘了 SET LOCAL | 0 行（功能坏，安全） | 测试抓 + 事务包装器统一 |
| 应用角色有 BYPASSRLS | 隔离全失效 | 角色权限审计、CI 检查 |
| 谓词写错（OR 短路） | 越权 | 多角色越权测试门禁 |

## 7. 测试 = 发布门禁

多角色矩阵，**0 越权是上线前置条件**：

- A 租户上下文查 B 的数据 → 断言 0 行。
- 无 principal → 断言 0 行。
- worker / 缓存 / 批量路径 → 断言同样强制。
- 成员关系撤销后 → 立即失去访问。

这套与原语 1（CAS 的 WHERE 同样在 principal 作用域内）、原语 4（事件账本按 principal 隔离）协同——三者共同构成「改状态既安全又不越权」的底座。
