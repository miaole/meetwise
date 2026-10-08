# REQUEST — **PRIV01-C · GAP-PRIV-01 应用层 tenant 强制接线 PR（纵深防御第二层）** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-privacy-int`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/priv01-tenant-wiring.md` · slice `priv01-tenant-wiring.slice.md`
**Parent tip**: `eef469d9`（full `eef469d9b1305e290d41f510922c0b0795f2266f` · `origin/feat/mysql-schema-skeleton` tip · not a prove tip · 开工时点 origin 最新 tip · 满足预期 ≥`eef469d9`；fetch up-to-date · ff no-op）
**边界 cite**: `:58` GAP-PRIV-02（公开 DELETE=503 冻结 · `privacy.controller.ts:51-52` 实码）· `:60` GAP-PRIV-04（vector erase）· `:64` GAP-PRIV-EXTERNAL-SINK-RETENTION（OPEN）· `:68` GAP-PRIV-AUTHZ-PROVE-FLAKE（OPEN · Ban retry-to-green）——**只读边界 · Ban 借证据/状态 · Ban 洗 OPEN 钉**
**Date**: 2026-10-07（本机 · stub 名 `REQUEST-2026-10-08-*` 系协调方 mandate 跨日命名）
**Line**: **PRIV01-C**（GAP-PRIV-01 接线刀 · PRIV01-A 立卷 + PRIV01-B 设计已 nail @主线 · 队列 Phase 3 privacy）

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
| backlog `:57` GAP-PRIV-01 | **OPEN**（本 commit 零 SSOT 编辑 · 行翻转 = 本刀全链 + 双审 + 协调方 nail 后另议） |
| UC-052 | **partial**（Ban covered flip） |
| `:60` / `:64` / `:68` | cite-only（Ban 借证据/状态 · Ban 洗 OPEN 钉） |
| EXIT 契约 | 全绿 ≠ `:57` CLOSED ≠ abandon 门开 ≠ tenant=RLS 等价 ≠ 授权根已迁 ≠ cutover ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ ADR 门全绿；非零 = 诚实保留 · Ban retry-to-green |

## 请审什么（mw-privacy-int）

1. **两层关系写死（核心）**：授权根今日仍且仅为 PG RLS FORCE（`0001_baseline.sql:7`/`:63-82`/`:300-304`）+ `asPrincipal`+`set_config`（`principal.ts:945-955`）+ `provisionRuntimeLogin`（`:566-608`）+ `app_role`——接线后授权根**不变**；应用层 = 纵深防御第二层**非替代**；「MUST NOT abandon/弱化/migrate」与三类等价宣称 Ban（=RLS 等价/已替代/授权根已迁）是否写死；`asPrincipal` 本体零包裹零改形（E4）是否钉死。
2. **接线范围与排除面**：§3 纳入面（interview/resume/quiz/diagnosis/profile/applications 候选侧/notification/commerce owner 侧 · file:line 锚 @`eef469d9`）与排除面（privacy 主链/erasure 链/`checkpoint-principal.ts`/worker 系统 lane/recruiter B 端/admin/roles/公开读/`db-mysql`）是否恰当；notification `notification.ts:6-22` 形参零绑定与 resume `list :208-216` 隐式 RLS-only 增量面定性是否如实；「Ban owner 冒充 tenant」与零 tenant/org 列是否守住。
3. **E1–E5 合同在接线面的兑现**：必选谓词非 optional filter（形态 α · 拟 always-on 无 flag/bypass——裁决点）· 跨 owner fail-closed + 404 不可区分（`guardInterviewPrivacy :177-190` 先例原样不重写）· E5 双形态区分（list 正当 0 行白名单 vs 单 id 意外 0 行 fail-closed 上抛）· E5 两半边切割（app-half 归本刀 P2/P3 · DB-half 归 PRIV01-A 候选 A · Ban 读作「E5 已全证」）。
4. **R1 机检翻正（翻正本身交双审）**：face A 保持 0 语义翻转为「零深路径字面导入纪律」（barrel `@meetwise/db` 导入钉死）· face B `consumption>0` 且 == wiring manifest（文件集合+每文件计数双断言）· barrel 恰 2 条 re-export 断言零弱化（re-export ≠ consumption 原样）· R2 头注（`proof:26-29`/`:180`）同步更新 · 既有 35/0 断言一字不减。
5. **Prove 方案诚实性**：P1/P2/P3 命令与期望 EXIT（P3 一次性自有 pgvector 容器口径 · Ban dev/共享 PG · Ban buy cloud）· PASS=35+Δ 如实宣布 · attempts 全账一次优先 Ban retry-to-green（确定性 harness 缺陷沿 PRIV01-B E-1 先例交 post 双审裁 · implementer 不自裁）· ADR 门 cite-only 零执行零 receipt。
6. **硬 Ban 面**：Ban 碰公开 DELETE=503（`privacy.controller.ts:51-52`）· Ban 碰 `apps/worker/src/checkpoint-principal.ts` · Ban 改共享 SSOT（`:57` stays OPEN）· Ban secrets（Key name-only）· Ban 顺手 cutover/abandon（M2 STOPPED/superseded 头注原样）· Ban E5 互借混报 · Ban worker/角色域顺手接线。
7. **docs-only 边界**：本 commit 恰 4 文档 · 零产品码/migration/script · 零 prove 执行 · Ban coding until PRE dual BOTH PASS + meetwise AUTHORIZE；流程声明（REQUEST → 预执行双审 → meetwise 授权 → coding+prove 一次优先 EXEC → post-prove 双审 → meetwise 授权 nail）是否如实。

## Ban

Ban coding（until PRE dual BOTH PASS + meetwise AUTHORIZE）· Ban prove 执行 · Ban push 冒充执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban 动 RLS 授权根（`asPrincipal`/`set_config`/FORCE RLS/`app_role`/`provisionRuntimeLogin` · MUST NOT abandon/弱化/migrate）· Ban 把应用层写成 RLS 等价或替代叙事 · Ban 碰 `apps/worker/src/checkpoint-principal.ts` · Ban 碰公开 DELETE=503 / privacy 主链 / erasure 链 · Ban 改共享 SSOT（backlog/checklist/matrix/queue · `:57` stays OPEN）· Ban flip UC-050/051/052 covered · Ban 借 `:60`/`:64`/`:68` 证据/状态 · Ban 加 tenant/org 列或 membership 谓词 · Ban feature-flag/bypass 化第二防御层（拟 · 待双审裁决）· Ban worker/recruiter/admin/roles 域接线 · Ban retry-to-green · Ban Meridian · Ban secrets / `.env*`（Key name-only）· Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签 · Ban claiming PRE PASS · Ban product/infra code（本 REQUEST docs-only）。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由 meetwise（协调方）授权接线 coding+prove EXEC；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-privacy-int` · implementer 不得填写）

---

*Stub · awaiting expert pre-exec dual · awaiting_pre_exec_dual · STOP*
