# Slice — **PRIV01-B · 应用层 tenant M2 等价强制（设计 + prove 方案）**（GAP-PRIV-01 后继刀 · REQUEST docs-only · 设计+prove 面 · 接线 PR 另审另刀 · backlog `:57` OPEN · DELETE=503 · PG-retained · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 零 coding / 零 prove 执行 / 零产品码 / 零 SSOT · Ban coding until PRE dual BOTH PASS + meetwise AUTHORIZE · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`fe218b7a`** / full `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9`（开工时点 origin 最新 tip · 满足预期 ≥`fe218b7a` · fetch 一次成功 up-to-date · ff no-op）
**Authority**: meetwise — docs-only REQUEST · Ban coding · Ban prove 执行 · Ban self-nail · PRE dual BOTH PASS（mw-privacy-int + mw-e2e-ha）后由 meetwise 授权「设计+prove 面 EXEC」· implementer 禁自批
**Line**: **PRIV01-B**（GAP-PRIV-01 后继刀 · 前刀 PRIV01-A 已落 · 队列 Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:31-32`）

## One-line

backlog `:57` **GAP-PRIV-01** **OPEN** 后继刀：应用层 tenant 强制原型（additive · `packages/db/src/tenant/` 四 helper · prove 绿但审查 **conditional** · 零生产接线）**≠** PG RLS 授权根（FORCE RLS `0001:7`/`:63-82`/`:300-304` + `asPrincipal`+`set_config` `principal.ts:945-955` + `provisionRuntimeLogin` `:566-608` NOINHERIT/NOBYPASSRLS）——本刀把「MySQL 时代显式强制（非 optional filter）+ 跨 owner fail-closed」**写清为 PG-retained 下的等价强制语义设计（E1–E5 合同）+ prove 方案**（设计面 prove 证语义合同 · ADR 清单门 = `m2-tenant-authorization-model.md` §4 + `:57` 行内清单 cite-only 切流门）；**两层关系写死：授权根仍且仅为 RLS/asPrincipal+set_config，应用层强制 = 纵深防御第二层非替代，「=RLS 等价/替代/授权根已迁」三类叙事 Ban，privacy 清单 prove 绿前 MUST NOT abandon RLS**；接线 PR（产品码）另刀另审本刀零预支 · 公开 DELETE=503 · UC-052 partial · `:57` OPEN · alone≠dual。

## 目标（REQUEST 三件事）

1. **M2 等价强制设计文档 + prove 方案**：additive 原型 → 显式强制（非 optional filter）+ 跨 owner fail-closed 的**等价语义设计**（非授权根迁移 · 非 MySQL cutover 复活——M2 两文档 STOPPED/superseded 头注原样有效）。
2. **prove 对齐 ADR 清单**：哪些 prove 必须绿按行内清单写清——privacy-authorization / crypto / erasure 系列（§下 ADR 门表）——登记为切流门，本刀 cite-only 不执行。
3. **本刀只做设计+prove 面**：接线 PR 另审另刀（2026-09-10 conditional 审查条件 #2 原样）。

## 两层关系（写死）

授权根（第一层 · 唯一 · 零触碰 · MUST NOT abandon/弱化/迁移）= PG RLS FORCE + `asPrincipal`+`set_config('app.principal_user')` + `provisionRuntimeLogin` + `app_role`；应用层 tenant 强制（第二层 · 纵深防御）= `packages/db/src/tenant/` helper 族按 E1–E5 合同显式强制。两层形态不同缺一不可（DB 层 GUC 未设→0 行缺省 deny；应用层入口 throw）；abandon 零预授权（本刀全绿也不触发，另须 privacy 清单 prove 绿 + 产品权威显式裁定）。

## 设计要点（E1–E5 · 全表见 harness §3）

| # | 合同 | fail 模式 |
|---|------|-----------|
| E1 | owner 显式供给 · 无默认 scope · 缺/空/非串入口拒绝 | `tenant_owner_user_id_required` throw |
| E2 | 必选谓词非 optional filter · 恒返回谓词形状 · 无空谓词成功形态 | 恒返回或 throw |
| E3 | 跨 owner fail-closed · API 面不可区分 404（`interview.service.ts:177-190` 先例） | `tenant_owner_mismatch` / `tenant_predicate_invalid` throw |
| E4 | 层内运行 · 在 `asPrincipal` 会话内 · 不包装/不旁路/不移除 `set_config` | 违反 = 授权根静默降级（静态钉） |
| E5 | 双层 fail-closed 形态区分 · 自身 id 意外 0 行按 fail-closed 上抛非合法空结果 | 错误路径（非空结果） |

## Prove plan（授权后 · 本 REQUEST 零 prove）

- **设计面（本刀 EXEC 面 · 拟）**：`pnpm --filter @meetwise/db tenant-enforcement:prove`（`packages/db/package.json:35`）扩展或具名后继 CMD——always-on 零 DB 依赖；断言面 = E1–E5 + 静态钉（`asPrincipal`/`set_config`/FORCE RLS/`p_owner` 双侧 · 实锚 `principal.ts:945-955` + `0001:7`/`:63-82`/`:300-304`）+ 接线面机检（`src/tenant` 生产接线 = 0）。候选 **P-A** 扩展 proof / **P-B** 沿用现有零扩展 / **P-C** 诚实失败路径——PRE dual 裁定（倾向 P-A 主体 · P-B 最小面 · C 仅诚实失败）。
- **ADR 清单门（切流门 · cite-only · 本刀不执行不复跑）**：`pnpm privacy-authorization:prove`（`package.json:306`）· `pnpm privacy-authorization:crypto:prove`（`:303`）· `pnpm privacy-erasure-preview:prove` 及 domain/contract（`:349`/`:304`/`:305`）· `pnpm privacy-erasure:prove` / `pnpm privacy-erasure:http:prove` 含 DELETE=503 pin（`:299`/`:359`）· `pnpm memory-vector-chunk-erasure:prove`（`:345`）· `:57` 行内广义 erasure*：`uc052:internal-erasure:prove`（`:308`）· `privacy-erasure:pause-upgrade:prove`（`:301`）· `vector-plane-erasure:prove`（`:347`）· `qdrant-store:g5-erasure:prove`（`:50`）——未绿 = 红 · 全绿前 Ban cutover · Ban abandon RLS · 各门独立 EXIT=0 + 独立审查。
- **分层零互借**：设计面（语义合同）vs 前刀隔离面（PRIV01-A 候选 A · 真 PG owner 矩阵 6+3 · prove 执行仍待授权）vs ADR 门——三层分开断言/报告/结论。
- **EXIT 契约**：EXIT0 ≠ 接线授权 ≠ abandon 门开 ≠ `:57` CLOSED ≠ tenant=RLS 等价 ≠ 授权根已迁 ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ ADR 门全绿宣称；EXIT1 = 诚实保留 · attempts 全录（Asia/Shanghai+SHA+log）· Ban retry-to-green · PREREQ 缺预期非零且记录。

## Evidence（cite only · Ban re-prove）

| Item | SHA / note |
|------|------------|
| RLS 根 | `0001_baseline.sql:7` · `:63-82`（app_role NOLOGIN 无 BYPASSRLS + `p_owner` USING/WITH CHECK 双侧）· `:300-304` vector_chunk 同形（fe218b7a 实测锚） |
| asPrincipal / login | `principal.ts:945-955`（BEGIN→SET LOCAL ROLE app_role→set_config→COMMIT）· `:566-608` provisionRuntimeLogin NOINHERIT+NOBYPASSRLS |
| owner 守卫先例 | `interview.service.ts:177-190` `guardInterviewPrivacy` 跨 owner 404 不可区分 · fence 410 |
| 应用层原型（现状） | `packages/db/src/tenant/index.ts`（四 helper · 头注「应用层 tenant ≠ RLS · Must not silently replace the auth root」）+ `tenant-enforcement.proof.ts` + `pnpm --filter @meetwise/db tenant-enforcement:prove` 绿 · 审查 conditional（`reviews/2026-09-10-tenant-enforcement-mw-privacy-int.md` 原样有效） |
| ADR 清单 | `m2-tenant-authorization-model.md` §3 等价表 + §4「Prove 门禁清单（ADR）」· 头注 STOPPED/superseded by PG-retained 原样有效 |
| 栈裁定 / 前刀 | `adr-postgres-retained.md` · `harness/gap-priv-01-tenant-rls.md`（D1 R-B 胜出 · 候选 A 隔离面裁可待授权）· backlog `:774` 立卷登记 |
| 公开 DELETE | `privacy.controller.ts:51-52` `@HttpCode(SERVICE_UNAVAILABLE)` · GAP-PRIV-02 `:58` 冻结 |

## Products

| Role | Path |
|------|------|
| Harness | `ai-docs/delivery/harness/priv01-m2-enforcement-design.md` |
| Slice | `ai-docs/delivery/priv01-m2-enforcement-design.slice.md`（本文件） |
| Dual stub `mw-privacy-int` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-priv01-m2-mw-privacy-int.md`（PENDING · 不代填 Verdict） |
| Dual stub `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-priv01-m2-mw-e2e-ha.md`（PENDING · 不代填 Verdict） |

**REQUEST 立卷 commit = 上述恰 4 文件 docs-only**（零 SSOT 编辑 · backlog/checklist/matrix/queue 不在 diff · 零产品码 / migration / script / prove 执行 / 零 secrets）。

## Scope / 非目标

- **非目标**：不接线（零生产 import/调用）· 不加 tenant/org 列 · 不动授权根 · **不碰 `apps/worker/src/checkpoint-principal.ts`（隐私主链禁改文件）** · 不动 0091/0125/0137/0140/0141 链 · 不动公开 DELETE 503 · 不动 UC-052 面 · 不执行 ADR 门（cite-only）· 零 SSOT 翻行 · 零 secrets（Key name-only）。
- **EXEC 面（授权后 · 拟）**：harness/slice lifecycle 推进 + P-A/P-B 裁定的 prove 面落地执行入账（若 P-A：`packages/db/test/tenant-enforcement.proof.ts` + `packages/db/package.json` + 根 `package.json`）· 零 `src/` 产品码 · 双审 stub 零触碰。

## Ban

Ban abandon RLS（授权根仍 PG RLS / `asPrincipal`+`set_config`）· Ban 把「应用层 tenant」写成 RLS 等价或替代叙事 · Ban 碰公开 DELETE=503 · Ban 碰 `apps/worker/src/checkpoint-principal.ts` · Ban 改共享 SSOT（`:57` stays OPEN）· Ban secrets（Key name-only）· Ban coding / product code（接线另刀）· Ban prove 执行（本 REQUEST）· Ban self-nail · Ban self-approve（alone ≠ dual）· Ban 动授权根 · Ban 借 `:60`/`:64`/`:68` 证据/状态 · Ban flip UC-050/051/052 covered · Ban retry-to-green · Ban Meridian · Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签。

Pins: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · `:57` OPEN · UC-052 partial。

## 流程声明

REQUEST → 预执行双审（mw-privacy-int + mw-e2e-ha）→ meetwise 授权 → 设计+prove 面 EXEC → post 双审 → meetwise 授权 nail。

---

*Slice · PRIV01-B 应用层 tenant M2 等价强制（设计+prove 方案）· `draft:awaiting_pre_exec_dual` · 2026-10-07 · backlog `:57` OPEN · DELETE=503 · PG-retained · Ban coding / Ban prove 执行 / Ban self-nail until PRE dual BOTH PASS + meetwise AUTHORIZE · 接线 PR 另审另刀 · alone ≠ dual · STOP*
