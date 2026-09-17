# M2 — Tenant / Authorization Model（MySQL 栈目标授权模型）

> **2026-09-17 (~01:15 PT) · STOPPED / superseded by PG-retained direction**  
> Meetwise ruling (**hard**): **NO business DB migration to MySQL.** Relational DB + LangGraph checkpoint **keep Postgres** (`PostgresSaver` / RLS / migration **0043** path retained).  
> `packages/db-mysql` / `compose.mysql-local` are **NOT** sole cutover targets. Ban knives that replace PG business tables with MySQL.  
> Prior status preserved below for history; **do not delete**. Further MySQL-relational cutover work on this artifact is **banned**.  
> Qdrant vector cutover likewise superseded (see sibling pins); **Redis wake** remains separately evaluable (not canceled).  
> `releaseEvidence=false` · ≠HA · ≠suite green · Ban implementing cutover from this pin · Dual PASS ≠ authorize coding.

**Prior status (historical)**: design draft · MySQL-era target auth model · cutover blocked until proves


**状态**：design draft · **releaseEvidence=false** · Not HA · 不宣称 controlPlaneClosed  
**栈裁定**：**MySQL + Qdrant + Redis** 为架构文档 **当前唯一真相**；本里程碑写目标授权模型，**cutover blocked until proves**。  
**实现方不自批切流**：合入/切流前须独立审查 + 下列 prove 退出码绿；本里程碑 **禁止自批 cutover**。  
**硬约束（privacy/meetwise · 活门）**：Until privacy proves are green，**MUST NOT abandon RLS** enforcement **in CODE**（`principal.ts` / migrations 本任务不删弱）。应用层 tenant 是目标栈强制面设计，**不是**静默替换。

关联：`ai-docs/delivery/adr-mysql-qdrant-local.md`（隐私不倒退 / M2 门禁）；依赖面快照 `.tmp/pg-mysql-pivot/PG-DEPENDENCY-INVENTORY.md`。

---

## 1. 现有代码强制面（须 re-prove；切流前不得放弃）

代码入口与强制面（**读代码，非臆造**）— 下列为 **切流前须保留并重新证明的要求**，不是「双跑产品计划」：

| 组件 | 位置 / 行为 |
|------|-------------|
| **asPrincipal** | `packages/db/src/principal.ts`：`BEGIN` → `SET LOCAL ROLE app_role` → `set_config('app.principal_user', $1, true)` → 回调 → `COMMIT`。注释明确：该 GUC 是 **tenant-routing context，不是密码学身份根**；任意可跑 SQL 的 runtime login 也能设它。破坏性 SECURITY DEFINER 不得把 `app.principal_user` 单独当用户授权证明。 |
| **asPrivacyWorkerPrincipal** | 同文件：专用 `privacy_worker_executor` + 同样 `set_config('app.principal_user', …)`；**不可**用 `asPrincipal` 替代（登录无交叉 grant）。 |
| **RLS FORCE** | 迁移中大量 `ALTER TABLE … FORCE ROW LEVEL SECURITY`；POLICY 典型谓词 `owner_user_id = current_setting('app.principal_user', true)`（及 WITH CHECK）。 |
| **privacy GUC** | 擦除路径另绑 `app.privacy_target_id` / `app.privacy_lease_token`（见如 `0048_checkpoint_physical_erasure.sql`、`0078`、`0092`、`0096`、`0111`、`0112`、`0118`、`0125` 等 `PERFORM set_config(...)`）。 |
| **issuer** | `packages/db/src/privacy-authorization.ts` + DB `privacy_issue_authorization_snapshot`；`EXECUTE` 仅授 **`privacy_issuer`**。Owner 恒等于已认证 principal，调用方不可自报。验签在 `packages/domain`（ECDSA P-256；私钥不进 SQL）。`assertPrivacyAuthorizationIssuerIdentity`（`principal.ts`）校验 issuer/guard 角色目录契约。 |

### 库存计数（依赖面快照 + 本地迁移复核）

来源：`.tmp/pg-mysql-pivot/PG-DEPENDENCY-INVENTORY.md`（ADR 引用的快照）：

- ~**49** 迁移开 RLS；~**348** `CREATE POLICY`；~**429** `SECURITY DEFINER`
- GUC：`app.principal_user` 主；另有 checkpoint / privacy_lease / qbank_serving*
- 入口：`asPrincipal()` → `set_config`

本地迁移树复核（`packages/db/migrations/*.sql`，本切片撰写时）：

- `CREATE POLICY`：**348**（与快照一致）
- `SECURITY DEFINER`：**429**（与快照一致）
- 含 `FORCE ROW LEVEL SECURITY` 的迁移文件：**51**；`FORCE` 语句约 **163**（表级强制次数；快照「~49 迁移开 RLS」为同量级依赖面摘要，以 inventory + ADR 为准）

**结论**：隐私边界今日依赖 **DB fail-closed**（RLS FORCE + principal GUC + privacy lease GUC + issuer/guard + 分登录）。迁 MySQL 栈后须有 **显式等价强制** 并 prove；在证明前 **不得放弃代码中的 RLS 路径**。

---

## 2. 应用层 tenant ≠ RLS（显式）

| 说法 | 本里程碑裁定 |
|------|----------------|
| 应用层 tenant | **目标栈强制面设计 / prototype**；面向 MySQL+Qdrant+Redis sole stack |
| RLS（代码路径） | **切流前活门**：privacy prove 未绿前 **MUST NOT abandon RLS** in code；须 re-prove，非怀旧叙事 |
| 「每次查询注入 `owner_user_id`」 | **≠** 已完成的等价强制；**授权根不得静默降级** |

中文钉死（静态 prove 会钉这些短语）：

- **应用层 tenant ≠ RLS**
- **授权根不得静默降级**
- **MUST NOT abandon RLS** until privacy proves green
- **MySQL+Qdrant+Redis sole stack**
- **cutover blocked until proves**

禁止：在 privacy prove 未绿时，把应用层 tenant 写成「已替代 RLS」或默默去掉 `set_config` / FORCE 路径。

---

## 3. 拟议 MySQL 时代等价强制（显式，非 optional filter）

对齐 ADR「等价强制」表；**尚未证明、不得切流**：

| 现有代码强制 | MySQL 时代最低等价（拟议） |
|----------|---------------------------|
| RLS FORCE + `app.principal_user` GUC | **显式强制策略**（连接/会话绑定 tenant；查询路径不可跳过；跨 owner **fail-closed** prove）— 不是默认 WHERE 可选 filter |
| privacy issuer / lease GUC（`privacy_issuer`、`app.privacy_*`） | 等价授权根 + lease 语义；**禁止** `AUTH_SECRET` 冒充隐私 JWS |
| SECURITY DEFINER 写路径 | 收敛写入口 + 契约 prove（分登录 / 过程门） |
| 向量/题库 chunk 删除 | Qdrant 为可证明擦除 sink：删后 **recall=0** + **逐 sink receipt**；receipt 形状对齐关系库 ledger 前不得切向量真相 |

应用层 tenant 原型若落地代码，必须：

1. **additive**（旁路设计 / feature-flag / `packages/db/src/tenant/` stubs）  
2. **不得削弱**现有 `asPrincipal` / `set_config('app.principal_user')` / RLS FORCE 路径  
3. flag 关时零行为变化；默认不得静默降级授权根  

本切片：**docs-first**；未合入会削弱 RLS 的运行时代码。

---

## 4. Prove 门禁清单（ADR；未绿 = 红；未绿禁止 cutover）

下列须保持为切流红灯，直到各自 EXIT=0 且经独立审查（**不自批**）：

| Prove | 脚本名（package.json） |
|-------|------------------------|
| privacy-authorization | `pnpm privacy-authorization:prove` |
| crypto | `pnpm privacy-authorization:crypto:prove` |
| erasure-preview | `pnpm privacy-erasure-preview:prove`（及 domain/contract 按需） |
| erasure + DELETE=503 | `pnpm privacy-erasure:prove` / `pnpm privacy-erasure:http:prove`（含 **公开 DELETE=503 pin**） |
| memory-vector-chunk-erasure | `pnpm memory-vector-chunk-erasure:prove`（迁 Qdrant 后须有对应 sink prove） |

钉名（本 doc / skeleton prove 静态匹配）：

- `privacy-authorization:prove`
- `privacy-authorization:crypto:prove` / **crypto**
- `privacy-erasure-preview:prove` / **erasure-preview**
- **DELETE=503**
- `memory-vector-chunk-erasure:prove` / **memory-vector-chunk-erasure**

公开 DELETE 仍为 **503** 冻结，直至独立 prove + 专家审。

---

## 5. 切流门（本里程碑 · 非双跑主路径）

- **MySQL+Qdrant+Redis sole stack** 为文档与目标拓扑真相；`compose.mysql-local.yml` 为本地栈入口。
- `compose.dev.yml` 若仍在树内：仅 **legacy 待删产物**，不是 dual-run 产品计划。
- MySQL 侧 schema/tenant 原型在 prove 未绿前 **不得**写成 cutover 完成。
- **releaseEvidence=false**；不宣称生产 HA；不勾 `controlPlaneClosed=true`；不宣称 INT-TRANSCRIPT / 控制面已关。
- **cutover blocked until proves**；**no abandon RLS code until proves**。

---

## 6. 本切片交付与非目标

**交付**

- 本文档 `ai-docs/delivery/m2-tenant-authorization-model.md`
- 静态 prove：`scripts/mysql-stack.m2-tenant.skeleton.proof.mjs` + `pnpm mysql-stack:m2-tenant:prove`

**非目标 / 未做**

- 不移除 / 不绕过 `asPrincipal`、`set_config('app.principal_user')`、RLS FORCE
- 不 push；不触 `.env*`
- 不自批 cutover；不宣称 controlPlaneClosed / HA / releaseEvidence=true
- 不把应用层 tenant 静默降级为授权根
- 不以 dual-run / 「旧栈仍为产品真相」作为主路径叙事

**成功标准**：doc 落地 + 静态 prove **EXIT=0**；RLS 路径 intact。
