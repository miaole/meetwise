# Slice — **PRIV01 · GAP-PRIV-01 tenant≠RLS**（应用层 tenant ≠ RLS 差距面 · REQUEST docs-only · backlog `:57` OPEN · DELETE=503 · PG-retained）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 零 coding / 零 prove · Ban coding until PRE dual BOTH PASS + coordinator AUTHORIZE · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · **PG-retained** · public DELETE stays **503** · backlog `:57` OPEN · UC-052 partial · canHonestlyFlip=false
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`313e04a7`** / full `313e04a7fc0ca91ef60fb229802dd374f85cc93d`（开工时点 origin 最新 tip · 满足预期 ≥`313e04a7` · fetch attempt1/2 网络失败、attempt3 up-to-date 如实记录于 harness 头）
**Authority**: meetwise — docs-only REQUEST（§3 loop 第③步）· Ban coding · Ban prove · Ban push · PRE dual BOTH PASS（mw-privacy-int + mw-e2e-ha）后由协调方授权 coding · implementer 禁自批
**Line**: **PRIV01**（队列 Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:31-32`）

## One-line

backlog `:57` **GAP-PRIV-01** **OPEN**：应用层 tenant 强制原型（additive · `packages/db/src/tenant/` · prove 绿但审查 **conditional**）**≠** PG RLS 授权根（`0001_baseline.sql` FORCE RLS + `asPrincipal`+`set_config('app.principal_user')` + `provisionRuntimeLogin` NOINHERIT/NOBYPASSRLS + `guardInterviewPrivacy` owner-scoped 404）——授权根今日仍且仅为后者；**D1 两读法交双审**（R-B 原义=M2 原型≠RLS 差距保留、验收维度「跨 owner fail-closed」；R-A=组织 tenant 维度缺失但 baseline `:281-282` 显式「未来扩展/不过度设计」）· 候选 **A 隔离真 PG owner 访问矩阵+RLS 内省（零 schema 变更）/ B 补 tenant 维度（默认 Ban 伪缺口）/ C 诚实登记不做实现** 列利弊交双审裁 · **Ban owner 冒充 tenant（两维度分开断言）** · **Ban 借 `:60` PRIV4 / `:64` AR / `:68` flake 证据** · 公开 DELETE=503 保持 · UC-052 stays partial · `:57` stays OPEN · alone≠dual。

## Evidence（cite only · Ban re-prove）

| Item | SHA / note |
|------|------------|
| RLS 根 | `0001_baseline.sql:7` · `:63-82`（app_role NOLOGIN 无 BYPASSRLS + `p_owner` USING/WITH CHECK 双侧）· `:300-307` vector_chunk 同形 |
| owner-only 设计注记 | `0001_baseline.sql:281-282`「C 端定位:owner_user_id RLS 即足…B 端租户共享题库是未来扩展…现在不过度设计」 |
| asPrincipal / login | `principal.ts:945-955`（GUC=tenant-routing context 非身份根）· `:566-608` provisionRuntimeLogin NOINHERIT+NOBYPASSRLS |
| guardInterviewPrivacy | `interview.service.ts:177-190` 跨 owner 404 不可区分 · fence 410——owner 维度 |
| 应用层原型（现状） | `packages/db/src/tenant/index.ts` additive 头注「应用层 tenant ≠ RLS」+ `tenant-enforcement:prove` 绿 · 审查 conditional（`reviews/2026-09-10-tenant-enforcement-mw-privacy-int.md`） |
| superseded 前提 | `m2-tenant-authorization-model.md` / `m2-tenant-prototype-impl.md` 头注 STOPPED/superseded by PG-retained（「tenant≠RLS still true under PG-retained」）· `adr-postgres-retained.md` |
| prove 先例 | `package.json:304` `privacy-authorization:prove` · `:343` `vector-plane-erasure:prove`——`run-e2e-isolated.mjs` 隔离真 PG 同形 |
| 共享语料面（分开断言） | `0032:38` 等 `visibility='global' OR owner_user_id=…`——by-design 共享面 ≠ owner 数据面 ≠ tenant 隔离 |

## Products

| Role | Path |
|------|------|
| Harness | `ai-docs/delivery/harness/gap-priv-01-tenant-rls.md` |
| Slice | `ai-docs/delivery/gap-priv-01-tenant-rls.slice.md`（本文件） |
| Dual stub `mw-privacy-int` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-gap-priv-01-tenant-rls-mw-privacy-int.md`（PENDING · 不代填 Verdict） |
| Dual stub `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-gap-priv-01-tenant-rls-mw-e2e-ha.md`（PENDING · 不代填 Verdict） |

**本 commit = 上述恰 4 文件 docs-only**（零 SSOT 编辑 · backlog/checklist/matrix/queue 不在 diff · 零产品码 / migration / script）。

## Scope（拟 · 未授权 · PRE dual 裁定）

- **D1 裁决点**：R-B（原义 · M2 原型≠RLS · implementer 读法，非绑定）vs R-A（组织维度缺失 · baseline 注记显式延后）；双审判 R-A 则本刀**显式改写收窄为诚实登记**（逃生门写死 · Ban 静默换范围 · Ban 借机加列）。
- **候选 A（零 schema 变更）**：隔离真 PG 跨 owner 矩阵（读 0 行 / INSERT 冒充 42501 / UPDATE·DELETE 0 行 / GUC 未设缺省 deny / 角色逃逸面 / 404 不可区分）+ RLS 内省（`pg_policies` 谓词、`relforcerowsecurity`、`rolbypassrls=false`）+ tenant/org 维度记录性内省 + 静态钉。
- **候选 B**：新迁移补 tenant/org 维度——**默认 Ban**（伪缺口/过度设计 · 与 `:281-282` 冲突），显式申报+重立卷才可解禁。
- **候选 C**：诚实登记不做实现（双审判无残余可证面 / 环境不可复现 → EXIT1 同形兼容）。
- **实现方倾向（非绑定）**：A 主体；C 为 A 的诚实失败/裁决路径；B 默认 Ban。组合由 PRE dual 裁定写入 AUTHORIZE。
- **非目标**：不动授权根（`asPrincipal`/`set_config`/FORCE RLS/`app_role`）· 不接线 `packages/db/src/tenant/` · 不动 0091/0125/0137/0140/0141 链 · `privacy.controller.ts` 503 一字不动 · UC-052/`:60`/`:64`/`:68` 面零触碰 · 零 SSOT 翻行。

## Prove plan（授权后 · Ban live · 本 REQUEST 零 prove）

- 具名 CMD（拟 · PRE dual 裁定）：`pnpm tenant-rls-isolation:prove` via `run-e2e-isolated.mjs` · **隔离真 PG** · Ban live 云端。
- **fail-closed 矩阵**：两 owner 同库 A/B——A 读 B=0 行 · A 写 B=42501 · A 改/删 B=0 行 · GUC 未设=0 行（缺省 deny）· runtime login 逃逸面拒 · 404 不可区分；**owner 与 tenant/org 两维度分开断言、分开报告**。
- **RLS 内省**：`pg_policies` 谓词含 `owner_user_id`+`current_setting('app.principal_user'` · `relrowsecurity`+`relforcerowsecurity` · `rolbypassrls=false`/`rolinherit=false` · 策略普查基线入 receipt；`visibility='global'` 共享面单列。
- **EXIT 契约**：EXIT0 ≠ covered ≠ `:57` CLOSED ≠ 「tenant=RLS 等价」≠ 授权根已迁 ≠ HA ≠ UC-052 flip ≠ DELETE 开放 ≠ R-A 缺口消失；EXIT1=诚实保留 · attempts 全录（Asia/Shanghai+SHA+log）· **Ban retry-to-green**；PREREQ 缺→预期非零 EXIT 且记录。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban push · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban 加 tenant/org 列（候选 B 默认 Ban）· Ban 动授权根（`asPrincipal`/`set_config`/FORCE RLS）· Ban 接线 `packages/db/src/tenant/` · Ban 把 `tenant-enforcement:prove` 绿写成 RLS 等价 · **Ban owner 冒充 tenant（两维度混报）** · **Ban 借 `:60` PRIV4 / `:64` AR / `:68` flake 证据/状态** · Ban 开公开 DELETE（DELETE=503）· Ban flip UC-050/051/052 covered · Ban SSOT 翻行（`:57`/checklist/matrix/queue）· Ban retry-to-green · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签 · Ban product/infra code this turn。

Pins: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · `:57` OPEN · UC-052 partial。

---

*Slice · PRIV01 GAP-PRIV-01 tenant≠RLS · `draft:awaiting_pre_exec_dual` · 2026-10-07 · backlog `:57` OPEN · DELETE=503 · PG-retained · Ban coding awaiting PRE BOTH + AUTHORIZE · alone ≠ dual · STOP*
