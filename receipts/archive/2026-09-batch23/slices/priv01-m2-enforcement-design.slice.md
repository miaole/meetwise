# Slice — **PRIV01-B · 应用层 tenant M2 等价强制（设计 + prove 方案）**（GAP-PRIV-01 后继刀 · 设计+prove 面 · 接线 PR 另审另刀 · backlog `:57` OPEN · DELETE=503 · PG-retained · **`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**（nail lifecycle 推进 2026-10-08 Asia/Shanghai · post-prove 双审 BOTH PASS：mw-privacy-int PASS（裁决 attempts 1,0 **可采** · attempt2 EXIT=0 为 EXEC 终态）+ mw-e2e-ha PASS（独立复跑 EXIT=0 35/0 逐值一致 · 可采确认 · E-1 勘误处方确认）+ meetwise 协调方正式授权 nail · **E-1 勘误已落**（attempt1 台账计数三处统一 33/1→**34/1** · `.exit`/log 原样零改）· Ban self-write 条款由本授权满足 · 接线 PR 另审另刀 · `:57` OPEN · alone ≠ dual · 详见 harness §12）

> **Exec-era status（historical · retained）**: **`executed:awaiting_post_prove_dual`**（EXEC lifecycle 推进 2026-10-08 Asia/Shanghai · PRE dual BOTH PASS（privacy-int + e2e-ha 全项 PASS）+ meetwise §3⑤ standing authorize · **P-A 裁定**：proof 扩展 +146/−1（E2 成形/源钉 · E4 baseline+provisionRuntimeLogin 钉 · R1 接线面双面机检+barrel `index.ts:25-32` 登记 re-export≠consumption · R2 头注 E5 归属接线 PR）· prove `pnpm --filter @meetwise/db tenant-enforcement:prove` **EXIT=0（35/0）** · attempts 1,0 全录（attempt1 EXIT=1 = 断言正则漏源 `:99` 一词 `object` 的确定性 fixture 缺陷 · 沿 PRIV4 先例 · 交 post 双审裁）· R3 条件性不触发 · 零 `src/` 产品码 · ADR 门 cite-only 零 receipt · 详见 harness §4.1.1/§11 + `receipts/priv01-m2-enforcement/` · **Ban self-write `post_prove_dual_pass`** · alone ≠ dual）

> **Pre-exec-era status（historical · retained）**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 零 coding / 零 prove 执行 / 零产品码 / 零 SSOT · Ban coding until PRE dual BOTH PASS + meetwise AUTHORIZE · Ban self-approve · alone ≠ dual）
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

REQUEST → 预执行双审（mw-privacy-int + mw-e2e-ha）→ meetwise 授权 → 设计+prove 面 EXEC → post 双审 → meetwise 授权 nail。（当前推进至 `post_prove_dual_pass`——post-prove 双审 BOTH PASS + meetwise 协调方授权 nail，2026-10-08 落链，详见 harness §12）

## EXEC 登记（浓缩 · 全表见 harness §11 + `receipts/priv01-m2-enforcement/2026-10-08-exec-assertions-and-prove.md`）

- **P-A 裁定**：proof `packages/db/test/tenant-enforcement.proof.ts` 154→299 行（+146/−1）· E2 成形断言 `:101`/`:107` + 源短语钉 `:132` · E4 baseline 四钉 `:160`/`:163`/`:165`/`:168`（`0001:7`/`:63-64`/`:69-79`/`:300-304`）+ provisionRuntimeLogin `:150` · **R1 断言 5**：face A 字面 `src/tenant` 串零命中（`:250` · `hits=0 files-scanned=332`）+ face B 模块引用面 re-export 外零命中（`:253` · `consumption=0 reexportStmts=2`）+ barrel `packages/db/src/index.ts:25-32` 存在且归类 **re-export≠consumption**（`:256` · 恰 2 条语句 · 防误红/防静默收窄）· **R2/O1**：E5 应用层半边 prove 显式归属接线 PR（`proof:26-29`+`:180`+receipts+§4.1.1 四处同文 · Ban 读作「E5 已证」）· **R3 条件性不触发显式注销** · 两 package.json 零变更（CMD 沿用 `packages/db/package.json:35`）。
- **prove**：`pnpm --filter @meetwise/db tenant-enforcement:prove` · attempt1 **EXIT=1**（10:26:28..10:26:32 +0800 · 34/1（E-1 勘误 · 原文 33/1）· 确定性 fixture 字串缺陷：断言正则漏源 `src/tenant/index.ts:99` 一词 `object`）→ 恰一行修复 → attempt2 **EXIT=0**（10:27:29 +0800 · **35 PASS/0 FAIL**）· attempts 1,0 全录落 receipts（log+exit+env 探针 node v22.22.3/pnpm 10.18.0/tsx v4.22.4）· 沿 PRIV4 台账先例、非 `:68` 型 retry-to-green，**缺陷定性交 post 双审裁**。
- **边界**：零 `src/` 产品码 · ADR 门零执行零复跑零 receipt（cite-only）· DELETE=503/UC-052/`:57` OPEN/coveredCount=8 原样 · secrets 零触及（actualSpendCny=null）· EXEC commit 触面恰 7 文件（proof + harness + slice + receipts 4）· 零 SSOT/零 stub/零 `checkpoint-principal.ts`/零授权根。

## NAIL 登记（浓缩 · 全文见 harness §12 + `execution-master-checklist.md` PRIV01-B NAIL 节）

- **lifecycle**：`executed:awaiting_post_prove_dual` → **`post_prove_dual_pass`**（2026-10-08 · post-prove 双审 BOTH PASS：mw-privacy-int 裁 attempts 1,0 可采 + mw-e2e-ha 独立复跑 EXIT=0 35/0 逐值一致并确认 E-1 勘误处方 · meetwise 协调方正式授权 nail · Ban self-write 条款由本授权满足 · 历史 EXEC 态保留文首 blockquote）。
- **E-1 勘误（append-only 注记）**：attempt1 台账计数三处统一（本文件 EXEC 登记 prove 行 + receipts §3 + harness §11）「33/1」→「**34/1**」（log 实为 34 PASS+1 FAIL 含 skip 行口径 · 与 attempt2 35/0 总数一致）· `.exit`/log 原样零改。
- **Non-claims**：EXIT0 ≠ 接线授权 ≠ cutover ≠ abandon RLS ≠ tenant=RLS 等价 ≠ 授权根迁移 ≠ MySQL 等价完成 · `:57` stays OPEN · ADR 门 cite-only 零执行 · UC-052 partial 零触碰。

---

*Slice · PRIV01-B 应用层 tenant M2 等价强制（设计+prove 方案）· `post_prove_dual_pass` · 2026-10-07 立卷 / 2026-10-08 EXEC · 2026-10-08 nail · backlog `:57` OPEN · DELETE=503 · PG-retained · PRE dual BOTH PASS · post-prove dual BOTH PASS（attempts 1,0 可采 · E-1 已正 33/1→34/1）· P-A · prove EXIT=0（35/0 · attempts 1,0 全录）· ADR 门 cite-only · 零 src/ 产品码 · 接线 PR 另审另刀 · alone ≠ dual*
