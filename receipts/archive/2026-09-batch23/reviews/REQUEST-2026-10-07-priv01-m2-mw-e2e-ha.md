# REQUEST — **PRIV01-B · 应用层 tenant M2 等价强制（设计+prove 方案）** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-privacy-int`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-e2e-ha`
**Peer**: `mw-privacy-int`（独立签 · alone ≠ dual）
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
| EXIT 契约 | EXIT0 ≠ 接线授权 ≠ abandon 门开 ≠ `:57` CLOSED ≠ tenant=RLS 等价 ≠ 授权根已迁 ≠ UC-052 flip ≠ DELETE 开放 ≠ HA ≠ releaseEvidence ≠ ADR 门全绿宣称；EXIT1 诚实保留 · Ban retry-to-green |

## 请审什么（mw-e2e-ha）

1. **Pins 冻结与 HA 叙事边界**：Pins 十项原值（含 `g7SuiteGreen=false` · `actualSpendCny=null`）三文件是否零漂移；haStatus=NOT_HA / releaseEvidence=false / claimProductionHA=false 下设计文是否零 HA / 零 releaseEvidence / 零 controlPlaneClosed 宣称。
2. **设计面 prove 可执行性**：CMD 形状（现有 `pnpm --filter @meetwise/db tenant-enforcement:prove`（`packages/db/package.json:35`）扩展 vs 具名后继 CMD）· always-on 零 DB 依赖声明（Ban live 云端 · 不要求 MySQL/Qdrant）· 断言面（E1–E5 + 静态钉实锚 `principal.ts:945-955` + `0001:7`/`:63-82`/`:300-304` + 接线面机检 `src/tenant` 生产接线 = 0）是否可机检、不可弱化。
3. **候选 P-A/P-B/P-C 裁定点**：P-A（扩展 proof 文件落 E1–E5 断言 + 机检）/ P-B（沿用现有零扩展 · 复跑入账）/ P-C（诚实失败路径 EXIT1 同形 · Ban docs-alone 捷径）的边界与利弊是否如实并陈、留双审裁。
4. **ADR 清单门 cite-only 口径**：门表（`m2-tenant-authorization-model.md` §4 + `:57` 行内清单 · `package.json` `:50`/`:299`/`:301`/`:303`/`:304`/`:305`/`:306`/`:308`/`:345`/`:347`/`:349`/`:359` 实读）是否本刀零执行零复跑零 receipt；「未绿 = 红 · 全绿前 Ban cutover · Ban abandon RLS · 各门独立 EXIT=0 + 独立审查」是否如实；本刀绿 ≠ 任何一门绿。
5. **EXIT 契约与诚实失败路径**：EXIT0 十不得 + EXIT1 attempts 全录（Asia/Shanghai 时间戳 + commit SHA + log 路径）· PREREQ 缺预期非零且记录 · Ban 换弱断言凑绿 · Ban retry-to-green（`:68` 口径不借其状态）。
6. **分层零互借**：设计面（语义合同）vs 前刀隔离面（PRIV01-A 候选 A · `harness/gap-priv-01-tenant-rls.md` §2-§3 · prove 执行仍待授权）vs ADR 门——三层分开断言/报告/结论、零抵扣零互洗是否写死。
7. **docs-only 边界与文件清单**：本 commit 恰 4 文档 · 零产品码/migration/script/package.json · 零 SSOT 翻行（backlog `:57`/checklist/matrix/queue）· 零 secrets（Key name-only）· Ban 碰 `apps/worker/src/checkpoint-principal.ts` · Ban 公开 DELETE=503 触碰 · 接线 PR 另刀另审不预支。
8. **流程与生命周期**：`draft:awaiting_pre_exec_dual` · Ban coding until PRE dual BOTH PASS + meetwise AUTHORIZE · Ban self-nail · alone ≠ dual；流程声明（REQUEST → 预执行双审 → meetwise 授权 → 设计+prove 面 EXEC → post 双审 → meetwise 授权 nail）是否如实。

## Ban

Ban coding（until PRE dual BOTH PASS + meetwise AUTHORIZE）· Ban prove 执行 · Ban push 冒充执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban abandon RLS / Ban 动授权根（`asPrincipal`/`set_config`/FORCE RLS/`app_role`/`provisionRuntimeLogin`）· Ban 把「应用层 tenant」写成 RLS 等价或替代叙事 · Ban 接线 `packages/db/src/tenant/` 进生产路径 · Ban 碰 `apps/worker/src/checkpoint-principal.ts` · Ban 改共享 SSOT（backlog/checklist/matrix/queue）· Ban 开公开 DELETE（DELETE=503）· Ban flip UC-050/051/052 covered · Ban 借 `:60`/`:64`/`:68` 证据/状态 · Ban 加 tenant/org 列或 membership 谓词 · Ban retry-to-green · Ban Meridian · Ban secrets / `.env*`（Key name-only）· Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签 · Ban claiming PRE PASS · Ban product/infra code。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由 meetwise（协调方）授权设计+prove 面 EXEC；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` · implementer 不得填写）

---

*Stub · awaiting expert pre-exec dual · awaiting_pre_exec_dual · STOP*
