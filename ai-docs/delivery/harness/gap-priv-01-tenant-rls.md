# Harness — **PRIV01 · GAP-PRIV-01 tenant≠RLS**（应用层 tenant ≠ RLS 差距面 · REQUEST docs-only · backlog `:57` OPEN · DELETE=503 · PG-retained）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 零 coding / 零 prove · Ban coding until PRE dual BOTH PASS + coordinator AUTHORIZE · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · **PG-retained** · public DELETE stays **503** · backlog `:57` OPEN · UC-052 partial · `:60`/`:64`/`:68` cite-only · canHonestlyFlip=false
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`313e04a7`** / full `313e04a7fc0ca91ef60fb229802dd374f85cc93d`（开工时点 origin 最新 tip · 满足预期 ≥`313e04a7`）。fetch 如实记录：attempt1 HTTP2 framing layer 失败 · attempt2 HTTP/1.1 connect 443 超时 · attempt3 成功且 up-to-date（本地 ref 开工前已恰在 `313e04a7`，2026-10-07 18:27 +08 落地）——origin tip 实测即预期 tip，零位移。
**Authority**: meetwise — docs-only REQUEST（§3 loop 第③步）· Ban coding · Ban prove · Ban push · PRE dual BOTH PASS（mw-privacy-int + mw-e2e-ha）后由协调方授权 coding · implementer 禁自批
**Line**: **PRIV01**（队列 Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:31-32`「DELETE=503 freeze · INT-TRANSCRIPT-01 · **GAP-PRIV-01 tenant≠RLS** · GAP-PRIV-04 vector erase」）

## 0. backlog 原文与缺口定义（表头 `:55` · 行锚 `:57`）

原文（`ai-docs/delivery/gap-bug-backlog.md:57`，列名按表头 `:55`「现状 | 目标 | 归属域 | 拟切片 | 所需 harness 路径」）：

- **现状**：「应用层 tenant 原型 additive + prove 绿；审查 **conditional**；授权根仍为 PG RLS / `asPrincipal`+`set_config`；**应用层 tenant ≠ RLS**」
- **目标**：「写清并 prove MySQL 时代显式强制（非 optional filter）+ 跨 owner fail-closed；privacy 清单 prove 绿前 **MUST NOT abandon RLS**」
- **归属域**：privacy · **拟切片**：「M2 等价强制设计→prove 对齐 ADR 清单；接线 PR 另审」 · **所需 harness 路径**：`ai-docs/delivery/harness/tenant-enforcement.prototype.md`；切流前另需 `pnpm privacy-authorization:prove` / `crypto:prove` / erasure*

**缺口定义一句话**：应用层 tenant 强制原型（additive、旁路、审查 conditional）**不是** PG RLS 授权根的等价物——授权根今日仍且仅为 PG RLS FORCE + `asPrincipal`+`set_config('app.principal_user')`，在「显式强制（非 optional filter）+ 跨 owner fail-closed」被 prove 之前 **MUST NOT abandon RLS**，且应用层 tenant 不得被写成已替代/已等价 RLS。

### 0.1 D1 · 原文属向裁决（「tenant」两读法 · 沿 MOP02 D1 先例 · 交双审裁）

原文「tenant」语义存在两种读法，本 REQUEST 如实并陈、不择一冒充：

- **读法 R-A（组织/多租户维度缺失）**：tenant = 组织/工作区级多租户隔离。缺口读作「全 schema 无 tenant/org 列与 membership 谓词、RLS 仅 owner_user_id 单维」。**反证（如实呈报）**：`0001_baseline.sql:281-282` 头注显式钉「**C 端定位:owner_user_id RLS 即足**(每用户自己的库)。B 端租户共享题库是未来扩展:届时按 tenant 维度加 membership 谓词(owner 列即扩展点),现在不过度设计」——R-A 语境下的「缺口」是**显式延后的设计扩展**，非现行隐私洞；实现之即伪造缺口/过度设计。
- **读法 R-B（backlog 原义 · M2 语境）**：tenant = M2「应用层 tenant 强制面」（MySQL 时代原型，`packages/db/src/tenant/`）。缺口读作「该原型 ≠ RLS 授权根」：additive/旁路、审查 conditional、未接线；处置列验收维度写的是「跨 **owner** fail-closed」而非 org 维度。PG-retained 裁定下（`adr-postgres-retained.md` · `m2-tenant-authorization-model.md`/`m2-tenant-prototype-impl.md` 头注 **STOPPED / superseded by PG-retained direction**）MySQL 前提 superseded，残余诚实面 = 对现行 PG RLS 根做隔离实证（prove 绿）+ 「应用层 tenant ≠ RLS」差距**如实保留不关**（`m2-tenant-prototype-impl.md` 头注自钉「tenant≠RLS still true under PG-retained」）。
- **implementer 读法（非绑定）**：**R-B 为原文重心**（现状列整段即 M2 原型状态、「应用层 tenant ≠ RLS」系 M2 文档钉死短语、验收维度为「跨 owner」）。若双审判原文重心在 R-A，本刀显式改写收窄为「设计缺口诚实登记（零 schema 变更）」——**逃生门写死于此 · Ban 静默换范围 · Ban 借机加 tenant/org 列**。

### 0.2 边界钉（cite-only · Ban 借）

| 边界 | 钉 |
|------|----|
| UC-052 | stays **partial**（`harness/uc-e2e-050-052-privacy-erasure.md` · Ban covered flip） |
| 公开 DELETE | **503 不动**（`privacy.controller.ts:51-52` + `privacy.service.ts` throw · GAP-PRIV-02 `:58` 冻结） |
| GAP-PRIV-04 `:60` | 向量面已另刀 **post_prove_dual_pass**——**Ban 借**其证据/状态/receipt/代码 |
| AR `:64` | GAP-PRIV-EXTERNAL-SINK-RETENTION **OPEN**（stub≠cloud · cloudVendorDeleted=false）——**不借** |
| `:68` | GAP-PRIV-AUTHZ-PROVE-FLAKE **OPEN**（mitigated/cause-unknown · Ban retry-to-green）——不借、不洗、不当本刀 prove 面挡箭牌 |

## 1. Evidence（cite only · Ban re-prove）

| Item | SHA / note |
|------|------------|
| RLS 根（baseline） | `packages/db/migrations/0001_baseline.sql:7`（「所有归属表都带 owner_user_id + ENABLE + FORCE ROW LEVEL SECURITY」）· `:63-82`（`app_role NOLOGIN` 无 BYPASSRLS + DO 循环 `p_owner`：`USING/WITH CHECK (owner_user_id = current_setting(''app.principal_user'', true))`）· `:300-307`（vector_chunk 同形） |
| owner-only 设计注记 | `0001_baseline.sql:281-282`「C 端定位:owner_user_id RLS 即足…B 端租户共享题库是未来扩展…现在不过度设计」——R-A 读法的直接反证锚 |
| asPrincipal | `packages/db/src/principal.ts:945-955`（`BEGIN` → `SET LOCAL ROLE app_role` → `set_config('app.principal_user',$1,true)` → COMMIT；`:938-944` 注释自钉「tenant-routing context, not a cryptographic identity root」） |
| provisionRuntimeLogin | `principal.ts:566-608`（`LOGIN NOINHERIT … NOBYPASSRLS` + `GRANT app_role TO` + 反向 REVOKE 控制面角色——P 线/W 线实证的强制入口） |
| guardInterviewPrivacy | `apps/api/src/modules/interview/interview.service.ts:177-190`（跨 owner id → 404 `not_found_or_forbidden` 不可区分；fence → 410 GONE）——**owner 维度**应用层守卫，非 tenant 维度 |
| 应用层 tenant 原型（现状） | `packages/db/src/tenant/index.ts`（`requireOwnerUserId`/`assertTenantPredicate`/`buildRequiredOwnerFilter`/`enforceOwnerOnRow` · 头注「ADDITIVE path for future MySQL · 应用层 tenant ≠ RLS」）+ `packages/db/test/tenant-enforcement.proof.ts`（`pnpm --filter @meetwise/db tenant-enforcement:prove` EXIT=0 · 审查 conditional `reviews/2026-09-10-tenant-enforcement-mw-privacy-int.md`） |
| M2 文档（superseded 前提） | `ai-docs/delivery/m2-tenant-authorization-model.md` + `m2-tenant-prototype-impl.md` 头注 **STOPPED / superseded by PG-retained direction**（2026-09-17 hard ruling · Ban MySQL-relational cutover work）· §2 显式表「应用层 tenant ≠ RLS」「授权根不得静默降级」 |
| 栈裁定 | `ai-docs/delivery/adr-postgres-retained.md`（retained truth = Postgres (+pgvector + PostgresSaver)） |
| 隔离 prove 先例 | `privacy-authorization:prove`（`package.json:304-305`）· `vector-plane-erasure:prove`（`:343-344`）均经 `scripts/run-e2e-isolated.mjs` 隔离真 PG（新注册点先例：receipt sources / gate 白名单 / isolatedCommand 分派 / migrate-with-recovery 列表） |
| 共享语料面（by-design · 非 tenant 隔离） | `0032_rag_corpus_version_control.sql:38` 等 `visibility='global' OR owner_user_id=…`（系统发布共享语料，`:417` 仅 `__system_rag__` 可发布 global）——访问矩阵须与 owner 数据面**分开断言** |

## 2. Scope（拟 · 未授权 · PRE dual 裁定）

- **候选 A（RLS 根隔离实证 · 零 schema 变更）**：隔离真 PG 上跑跨 owner 访问矩阵（fail-closed 全拒）+ RLS 策略内省 + 静态钉复验 + tenant/org 维度**记录性**内省（见 §3）；docs 登记两读法裁决与差距保留（R-B 残余面 prove 绿、R-A 现状如实登记）。利=直面 backlog 验收「显式强制 + 跨 owner fail-closed」的可证残余面、零产品风险；弊=不新增任何隔离能力（本就「不是修隔离」而是「证隔离」）。
- **候选 B（additive 迁移补 tenant/org 维度）**：新迁移加 tenant 列/membership 谓词族。**默认 Ban**：与 baseline `:281-282` 显式「未来扩展/不过度设计」冲突、产品现状无 org 概念、触碰面为全 ownership 表族 + 348±2 条策略面（M2 文档实测口径）= 大面积伪缺口实现。仅当双审 + 产品权威显式裁「产品现已需 B 端隔离」时以**显式申报 + 重立卷**解禁。
- **候选 C（诚实登记不做实现）**：若双审判缺口原文前提（MySQL 时代等价强制）被 PG-retained 完全 supersede 而无残余可证面，或隔离环境不可复现 → 仅 docs 诚实登记裁决 + lifecycle 推进；与候选 A 的 EXIT1 失败路径同形兼容（attempts 全录）。
- **实现方倾向（非绑定）**：A 主体；C 为 A 的诚实失败/裁决路径；B 默认 Ban。组合/取舍由 PRE dual 裁定写入 AUTHORIZE。
- **触碰 file 清单（拟 · 授权后 coding 阶段）**：`packages/db/test/tenant-rls-isolation.proof.ts`（新增）· `packages/db/package.json`（raw CMD）· 根 `package.json`（named CMD）· `scripts/run-e2e-isolated.mjs`（注册，先例恰 4 注册点）· 本 harness/slice + 双审 stub 的 lifecycle 推进。**Ban 抢迁移号（零新迁移为默认）**。
- **非目标**：不加 tenant/org 列（候选 B 默认 Ban）· 不动 `packages/db/src/tenant/`（不接线、不删、不改语义）· 不动 `asPrincipal`/`set_config`/FORCE RLS（授权根零触碰）· 不动 0091/0125/0137/0140/0141 授权与擦除链 · 不动公开 DELETE 503 · 不动 UC-052 面 · 不借 `:60`/`:64`/`:68` 面 · 零 SSOT 翻行（backlog `:57`/checklist/matrix/queue）。

## 3. Prove 方案（授权后 · Ban live · 本 REQUEST 零 prove）

- **具名 CMD（拟 · PRE dual 裁定）**：`pnpm tenant-rls-isolation:prove` → `node scripts/run-e2e-isolated.mjs tenant-rls-isolation:prove:raw` → `pnpm -C packages/db prove:tenant-rls-isolation`（`privacy-authorization:prove` / `vector-plane-erasure:prove` 同形先例）· **隔离真 PG**（run-e2e-isolated 容器惯例）· Ban live 云端 · Ban 复用共享开发库。
- **owner 维度访问矩阵（fail-closed · 两 owner A/B 同库）**：
  1. A 的 GUC 下 `SELECT` B 行 → **0 行**；
  2. A `INSERT` 冒充 B 的 `owner_user_id` → WITH CHECK 违反 **42501**；
  3. A `UPDATE`/`DELETE` B 行 → **0 rows affected**；
  4. GUC 未设/空 → `current_setting('app.principal_user', true)` 为 NULL → **0 行**（缺省 deny，不抛错、不放宽）；
  5. 角色逃逸面：runtime login `rolbypassrls=false`、`rolinherit=false`（`provisionRuntimeLogin` 形状内省）；`SET LOCAL ROLE app_role` 后 FORCE RLS 仍生效（表 owner/超级用户也不绕）；
  6. 应用层守卫同形断言：`guardInterviewPrivacy` 路径跨 owner id → **404 `not_found_or_forbidden`**（不可区分）；fence → 410。
- **RLS 策略内省（真 PG `pg_policies`/`pg_class`，非 grep 代替）**：ownership 表族 `relrowsecurity=true` 且 `relforcerowsecurity=true`；策略 `qual`/`with_check` 含 `owner_user_id` 与 `current_setting('app.principal_user'`；策略普查基线（数量+表清单）入 receipt JSON；`visibility='global'` 共享语料面单列报告、与 owner 数据面分开断言。
- **tenant/org 维度（R-A · 记录性内省）**：`information_schema` 断言「无 tenant_id/org_id/workspace 类列、无 tenant 谓词策略」→ 诚实登记 owner-only 现状 + baseline `:281-282` future 注记；**非授权实现、非缺口实锤**。
- **静态钉**：`asPrincipal` + `set_config('app.principal_user')` + FORCE RLS 在位（沿 `tenant-enforcement:prove` 静态先例）；`packages/db/src/tenant/` 零生产接线（grep 面）。
- **同列入账**：公开 DELETE=503 复验（cite/重跑 `pnpm privacy-erasure:http:prove`）· UC-052 partial 不动确认。
- **EXIT 契约**：EXIT0 ≠ covered ≠ backlog `:57` GAP-PRIV-01 CLOSED/翻行 ≠ 「应用层 tenant = RLS」等价宣称 ≠ 授权根已迁 ≠ MySQL 等价强制完成 ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ R-A 缺口消失。EXIT1 = 诚实保留（做不出 / 隔离环境不可复现 / 双审判缺口无残余可证面→转候选 C），**attempts 全录**（Asia/Shanghai 时间戳 + commit SHA + log 路径）· **Ban retry-to-green**；PREREQ 缺（docker/PG 不可用）→ 预期非零 EXIT 且记录，Ban 换弱断言凑绿。

## 4. 诚实条款

- **Ban 把 owner-scoped 冒充 tenant 隔离**：owner 维度与 tenant/org 维度**分开断言、分开报告、分开结论**——owner 矩阵全绿 ≠ 存在租户（组织）隔离；tenant/org 维度只允许记录性内省。
- **Ban 借 PRIV4/AR 证据**：`:60` 向量面（receipt/prove/代码）与 `:64` external 面（stub≠cloud 等）零借用、零抵扣、零互洗；`:68` flake 面不得被引用为本刀弱化的理由。
- **Ban 两头叙事**：baseline `:281-282` future 注记既不得写成「已具备租户隔离」，也不得写成「隔离缺陷已实锤」——两读法如实并陈，裁决权在双审。
- **Ban prototype 洗白**：`tenant-enforcement:prove` 的绿 ≠ RLS 等价 ≠ 授权根替代（2026-09-10 审查 **conditional** 结论原样保留、不得引用为已解除）。

## 5. Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban push · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban 加 tenant/org 列或 membership 谓词（候选 B 默认 Ban · 显式申报才可解禁）· Ban 动 `asPrincipal`/`set_config`/FORCE RLS/`app_role` 授权根 · Ban 接线 `packages/db/src/tenant/` 进生产路径 · Ban 把 `tenant-enforcement:prove` 绿写成 RLS 等价 · Ban owner 冒充 tenant（两维度混报）· Ban 借 `:60`/`:64`/`:68` 证据/状态 · Ban 开公开 DELETE（DELETE=503）· Ban flip UC-050/051/052 covered · Ban SSOT 翻行（`:57`/checklist/matrix/queue）· Ban retry-to-green · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签 · Ban product/infra code this turn。

Pins: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · `:57` OPEN · UC-052 partial。

## 6. Products

| Role | Path |
|------|------|
| Harness | `ai-docs/delivery/harness/gap-priv-01-tenant-rls.md`（本文件） |
| Slice | `ai-docs/delivery/gap-priv-01-tenant-rls.slice.md` |
| Dual stub `mw-privacy-int` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-gap-priv-01-tenant-rls-mw-privacy-int.md`（PENDING · 不代填 Verdict） |
| Dual stub `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-gap-priv-01-tenant-rls-mw-e2e-ha.md`（PENDING · 不代填 Verdict） |

**本 commit = 上述恰 4 文件 docs-only**（零 SSOT 编辑 · backlog/checklist/matrix/queue 不在 diff · 零产品码 / migration / script / prove 执行）。

## 7. 双审

**mw-privacy-int + mw-e2e-ha**（PRE dual BOTH PASS · 各自独立签 · alone ≠ dual）→ 协调方 AUTHORIZE coding。裁决点：D1 两读法属向、候选 A/B/C 取舍、prove 断言强度（矩阵 6 项 + 内省 3 项不得弱化）、EXIT 契约与诚实条款。

---

*Harness · PRIV01 GAP-PRIV-01 tenant≠RLS · `draft:awaiting_pre_exec_dual` · 2026-10-07 · backlog `:57` OPEN · DELETE=503 · PG-retained · Ban coding awaiting PRE BOTH + AUTHORIZE · alone ≠ dual · STOP*
