# REQUEST — **PRIV01-B · 应用层 tenant M2 等价强制（设计+prove 方案）** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-privacy-int`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/priv01-m2-enforcement-design.md` · slice `priv01-m2-enforcement-design.slice.md`
**Parent tip**: `fe218b7a`（full `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9` · `origin/feat/mysql-schema-skeleton` tip · not a prove tip · 开工时点 origin 最新 tip · 满足预期 ≥`fe218b7a`；fetch 一次成功 up-to-date · 本机 ref 开工前已恰在预期 tip · ff no-op）
**边界 cite**: `:58` GAP-PRIV-02（公开 DELETE=503 冻结 · `privacy.controller.ts:51-52` 实码）· `:60` GAP-PRIV-04（vector erase · post_prove_dual_pass）· `:64` GAP-PRIV-EXTERNAL-SINK-RETENTION（**OPEN** · stub≠cloud · cloudVendorDeleted=false）· `:68` GAP-PRIV-AUTHZ-PROVE-FLAKE（OPEN · cause-unknown · Ban retry-to-green）——**只读边界 · Ban 借证据/状态 · Ban 洗 OPEN 钉**
**Date**: 2026-10-07
**Line**: **PRIV01-B**（GAP-PRIV-01 后继刀 · 前刀 PRIV01-A 已落 · 队列 Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:31-32`）

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained**（授权根仍为 PG RLS / `asPrincipal`+`set_config` · Ban 授权根迁移叙事 · Ban abandon RLS） |
| 公开 DELETE | **503**（stays · GAP-PRIV-02 `:58` 冻结） |
| `g7SuiteGreen` | **false** |
| `actualSpendCny` | **null** |
| backlog `:57` GAP-PRIV-01 | **OPEN**（本 commit 零 SSOT 编辑 · Ban close via docs alone） |
| UC-052 | **partial**（Ban covered flip） |
| `:60` / `:64` / `:68` | cite-only（Ban 借证据/状态 · Ban 洗 OPEN 钉） |
| EXIT 契约 | EXIT0 ≠ 接线授权 ≠ abandon 门开 ≠ `:57` CLOSED ≠ tenant=RLS 等价 ≠ 授权根已迁 ≠ UC-052 flip ≠ DELETE 开放 ≠ HA；EXIT1 诚实保留 · Ban retry-to-green |

## 请审什么（mw-privacy-int）

1. **两层关系写死（核心）**：授权根今日仍且仅为 PG RLS FORCE（`0001_baseline.sql:7`/`:63-82`/`:300-304`）+ `asPrincipal`+`set_config`（`principal.ts:945-955`）+ `provisionRuntimeLogin`（`:566-608`）+ `app_role`；应用层 tenant 强制 = 纵深防御第二层**非替代**；「privacy 清单 prove 绿前 **MUST NOT abandon RLS**」（backlog `:57` 目标列逐字）与「abandon 零预授权（本刀全绿也不触发）」是否写死；**三类等价宣称 Ban**（「=RLS 等价」「已替代 RLS/授权根已迁应用层」「prove 绿 ⇒ RLS 可降级」）是否全部落文。
2. **E1–E5 显式强制合同强度**：owner 显式供给无默认 scope（缺/空/非串入口 throw）· 必选谓词非 optional filter（无「空谓词成功」形态）· 跨 owner fail-closed（mismatch throw + API 面不可区分 404 沿 `interview.service.ts:177-190` `guardInterviewPrivacy` 先例）· 层内运行（`asPrincipal` 会话内 · 不旁路 `set_config`）· 双层 fail-closed 形态区分（自身 id 意外 0 行按 fail-closed 上抛）——五项是否写死且 Ban 弱化，与 `packages/db/src/tenant/index.ts` 实码形状逐一吻合。
3. **非 MySQL 复活诚实**：`m2-tenant-authorization-model.md`/`m2-tenant-prototype-impl.md` 头注 STOPPED/superseded by PG-retained 原样有效；本设计 = PG-retained 下等价强制**语义**设计，「MySQL 时代」仅系 `:57` 原文语境引用——是否如实、无 cutover 复活叙事。
4. **conditional 审查不解除**：2026-09-10 审查 conditional（「切流/放弃 RLS 仍 block · 接线 PR 须另审」）原样保留；本刀设计绿 ≠ 解除。
5. **prove 方案分层零互借**：设计面（E1–E5 语义合同）vs 前刀隔离面（PRIV01-A 候选 A · 真 PG owner 矩阵 6+3 · prove 执行仍待授权）vs ADR 清单门——三层分开断言/报告/结论是否写死；候选 P-A/P-B/P-C 取舍交双审。
6. **ADR 清单门口径**：`m2-tenant-authorization-model.md` §4 + `:57` 行内清单（privacy-authorization / crypto / erasure 系列，`package.json` 行锚实读）是否 cite-only 登记、本刀零执行零复跑零 receipt；「未绿 = 红 · 全绿前 Ban cutover · Ban abandon RLS · 各门独立 EXIT=0 + 独立审查」是否如实。
7. **硬 Ban 面**：Ban 碰 `apps/worker/src/checkpoint-principal.ts`（隐私主链禁改文件）· Ban 改共享 SSOT（`:57` stays OPEN）· Ban secrets（Key name-only）· Ban 公开 DELETE=503 触碰（`privacy.controller.ts:51-52`）· Ban 接线（零产品 import/调用 · 接线 PR 另刀另审）· Ban 加 tenant/org 列。
8. **docs-only 边界**：本 commit 恰 4 文档 · 零产品码/migration/script · 零 prove 执行 · Ban coding until PRE dual BOTH PASS + meetwise AUTHORIZE；流程声明（REQUEST → 预执行双审 → meetwise 授权 → 设计+prove 面 EXEC → post 双审 → meetwise 授权 nail）是否如实。

## Ban

Ban coding（until PRE dual BOTH PASS + meetwise AUTHORIZE）· Ban prove 执行 · Ban push 冒充执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban abandon RLS / Ban 动授权根（`asPrincipal`/`set_config`/FORCE RLS/`app_role`/`provisionRuntimeLogin`）· Ban 把「应用层 tenant」写成 RLS 等价或替代叙事 · Ban 接线 `packages/db/src/tenant/` 进生产路径 · Ban 碰 `apps/worker/src/checkpoint-principal.ts` · Ban 改共享 SSOT（backlog/checklist/matrix/queue）· Ban 开公开 DELETE（DELETE=503）· Ban flip UC-050/051/052 covered · Ban 借 `:60`/`:64`/`:68` 证据/状态 · Ban 加 tenant/org 列或 membership 谓词 · Ban retry-to-green · Ban Meridian · Ban secrets / `.env*`（Key name-only）· Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签 · Ban claiming PRE PASS · Ban product/infra code。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由 meetwise（协调方）授权设计+prove 面 EXEC；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-privacy-int` · implementer 不得填写）

---

*Stub · awaiting expert pre-exec dual · awaiting_pre_exec_dual · STOP*
