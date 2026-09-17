# M2 — App-level tenant enforcement prototype（实现切片）

> **2026-09-17 (~01:15 PT) · STOPPED / superseded by PG-retained direction**  
> Meetwise ruling (**hard**): **NO business DB migration to MySQL.** Relational DB + LangGraph checkpoint **keep Postgres** (`PostgresSaver` / RLS / migration **0043** path retained).  
> `packages/db-mysql` / `compose.mysql-local` are **NOT** sole cutover targets. Ban knives that replace PG business tables with MySQL.  
> Prior status preserved below for history; **do not delete**. Further MySQL-relational cutover work on this artifact is **banned**.  
> Qdrant vector cutover likewise superseded (see sibling pins); **Redis wake** remains separately evaluable (not canceled).  
> `releaseEvidence=false` · ≠HA · ≠suite green · Ban implementing cutover from this pin · Dual PASS ≠ authorize coding.

**Prior status (historical)**: implemented prototype · framed under MySQL+Qdrant+Redis sole stack (additive on `packages/db`; tenant≠RLS still true under PG-retained)


**状态**：implemented prototype · **releaseEvidence=false** · Not HA · 不宣称 controlPlaneClosed  
**栈裁定**：**MySQL + Qdrant + Redis sole stack**（架构唯一真相）；本切片仅落地 **additive** 应用层 tenant 强制原型。  
**硬约束**：Do NOT delete/weaken RLS、`principal.ts` `set_config`、或 FORCE policies。**应用层 tenant ≠ RLS**；**授权根不得静默降级**。  
**cutover blocked until proves**；实现方不自批切流。

关联：`m2-tenant-authorization-model.md`（设计）、`adr-mysql-qdrant-local.md`（sole stack）。

---

## 1. 交付物

| 路径 | 作用 |
|------|------|
| `packages/db/src/tenant/index.ts` | `requireOwnerUserId` / `assertTenantPredicate` / `buildRequiredOwnerFilter` / `enforceOwnerOnRow` |
| `packages/db/test/tenant-enforcement.proof.ts` | 无 MySQL 也可跑的单元 prove；可选 PG 仍走 `asPrincipal` |
| `@meetwise/db` script `tenant-enforcement:prove` | `tsx test/tenant-enforcement.proof.ts` |
| `packages/db/src/index.ts` | **additive** re-export（不改 `asPrincipal` 生产路径） |

## 2. 行为契约

1. **`requireOwnerUserId(owner)`** — 缺省 / 空白 / 非 string → throw `tenant_owner_user_id_required`（fail-closed；非 optional filter）。
2. **`assertTenantPredicate(rowOwner, requiredOwner)`** — 跨 owner → throw `tenant_owner_mismatch`；行 owner 缺失 → `tenant_predicate_invalid`。
3. **`buildRequiredOwnerFilter(owner)`** — 返回 `{ column: 'owner_user_id', value }`，供 dual-write / 未来 MySQL 查询显式绑定。
4. 注释与源码钉死：**应用层 tenant ≠ RLS**；不得静默替换 auth root（`asPrincipal` + `set_config('app.principal_user')` + FORCE RLS）。

## 3. 与 RLS 的关系（活门）

| 面 | 本切片 |
|----|--------|
| PG RLS / FORCE / `set_config` | **intact**；prove 静态校验 `principal.ts` 仍含 `asPrincipal` + `set_config('app.principal_user')` |
| 应用层 tenant | **旁路原型**（dual-write OR bypass prove）：证明「必带 owner」谓词，**不是**已完成等价强制 |
| 生产接线 | **未**把 tenant helpers 接到会去掉 `set_config` 的路径；零行为变化于现有 request 事务 |

Until privacy proves green：**MUST NOT abandon RLS** in code.

## 4. Prove

```bash
pnpm --filter @meetwise/db tenant-enforcement:prove
# EXIT=0：缺 owner 必抛；mismatch 必抛；principal set_config 仍在
```

可选：若环境有 `DATABASE_URL` 或完整 `PG*`，proof 额外走 `asPrincipal` 验证 GUC 仍绑定；连接失败不否决单元绿。

## 5. 非目标

- 不移除 / 不绕过 `asPrincipal`、`set_config('app.principal_user')`、RLS FORCE
- 不宣称 cutover / HA / `releaseEvidence=true` / `controlPlaneClosed=true`
- 不把应用层 tenant 写成「已替代 RLS」
- 不以 dual-run / PG-as-product-truth 为叙事

**成功标准**：helpers + prove **EXIT=0** + 本文档；RLS 路径 intact。

## 运行时澄清（审查条件）
**架构** sole stack（MySQL+Qdrant+Redis）**不等于**运行时授权根已迁。切流前 PG RLS / `asPrincipal`+`set_config` 仍为运行时真相；本原型不得绕开它们。详见 `reviews/2026-09-10-tenant-enforcement-mw-privacy-int.md`。
