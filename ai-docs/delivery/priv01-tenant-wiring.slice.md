# Slice — **PRIV01-C · GAP-PRIV-01 应用层 tenant 强制接线 PR（纵深防御第二层）**（PRIV01-B 后继刀 · REQUEST docs-only · 零产品码 · backlog `:57` OPEN · DELETE=503 · PG-retained · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 本 commit 恰 4 文档 · 零 coding / 零 prove 执行 / 零产品码 / 零 SSOT / 零 stub 代填 · Ban coding until PRE dual BOTH PASS + meetwise AUTHORIZE · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Date**: 2026-10-07（本机）· stub 名 `REQUEST-2026-10-08-priv01-wiring-*` 系协调方 mandate（Asia/Shanghai 跨日命名）
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`eef469d9`** / full `eef469d9b1305e290d41f510922c0b0795f2266f`（≥`eef469d9` 满足 · fetch up-to-date · ff no-op · 全部引锚 @`eef469d9` 实测）
**Authority**: meetwise — docs-only REQUEST · Ban coding · Ban prove 执行 · Ban self-nail · PRE dual BOTH PASS（mw-privacy-int + mw-e2e-ha）后由 meetwise 授权「接线 coding+prove EXEC」· implementer 禁自批
**Line**: **PRIV01-C**（GAP-PRIV-01 接线刀 · PRIV01-A 立卷 + PRIV01-B 设计已 nail @主线 · 队列 Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:31-32`）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-priv01wire` · 分支 `line/priv01-tenant-wiring` 恰基于 `eef469d9`

## One-line

PRIV01-B 已落 E1–E5 合同 + P-A 断言面 prove 35/0 + R1/R2/O1 登记（`post_prove_dual_pass` @主线），但 `packages/db/src/tenant/` 四 helper **零生产接线**（R1 face A `hits=0`/face B `consumption=0` 钉死）——本刀 = **接线 PR REQUEST**：把 `requireOwnerUserId`/`buildRequiredOwnerFilter`/`assertTenantPredicate`/`enforceOwnerOnRow`（`asPrincipal` 边界零触碰）按 E1–E5 接进 C 端 owner 归属数据路径，应用层为 **RLS 之上纵深防御第二层非替代**，并兑现 **E5 应用层半边 prove（R2 落卷归属本刀）**；授权根今日仍且仅为 PG RLS FORCE + `asPrincipal`+`set_config`，privacy 清单 prove 绿前 **MUST NOT abandon RLS**；本 REQUEST docs-only，接线 coding=授权后 EXEC · 公开 DELETE=503 · UC-052 partial · `:57` OPEN · alone ≠ dual。

## 接线范围（摘要 · 全表 file:line 锚见 harness §3）

- **纳入（C 端 owner 数据平面）**：interview（`interview.service.ts` 入口 `:196` 等 11 处 + 谓词点 `:214`-`:664` · `guardInterviewPrivacy :177-190` 先例原样 · db `interview-jobs.ts`/`interview-question.ts`/`report.ts`）· resume（`:164-165/:208-216 隐式 RLS-only/:234-249` + db `resume.ts`）· quiz（`:20/:32/:37/:44/:68` + `quiz-jobs.ts`）· diagnosis（`:20/:33/:39/:47/:70` + `diagnosis-jobs.ts`）· profile（`:37/:52-54` 双闸先例）· applications 候选侧（`applications.service.ts :17-:72` + `recruiter.ts :132/:153/:182/:222/:265/:354/:437`）· notification（**db `notification.ts :6-22` owner 形参零绑定 = 最薄增量面**）· commerce owner 侧（`commerce.service.ts :63-64/:86-87`）。
- **排除（理由写死）**：privacy 主链/erasure 链（Ban 触）· `checkpoint-principal.ts`（禁改）· worker 系统链（第二波另刀）· recruiter B 端/admin/roles（角色维度 ≠ owner 维度 · Ban owner 冒充 tenant）· `listOpenJobs` 公开读（by-design）· `db-mysql`/migration（cutover Ban · schema 零变更）。
- **形态**：α=`buildRequiredOwnerFilter` 进查询构造（入口 `requireOwnerUserId` · 必选谓词非 optional · 拟 always-on 无 flag 交 PRE dual）· β=`asPrincipal` 会话内 `assertTenantPredicate`/`enforceOwnerOnRow` read-back + E5 单 id 意外 0 行 fail-closed 上抛（list 端点白名单「正当 0 行」）；`asPrincipal` 本体不包裹不改形。
- **EXEC 定量**：实际触点以接线清单（manifest）登记，prove 断言 == manifest，超表触点=越权。

## Prove 方案（摘要 · 命令+期望 EXIT）

| # | CMD | 期望 EXIT | 面 |
|---|-----|-----------|-----|
| P1 | `pnpm --filter @meetwise/db tenant-enforcement:prove` | 0 · PASS=35+Δ（Δ 如实宣布）· face B `consumption>0` | **R1 翻正 + 35/0 回绿**：face A 保持 0（barrel 导入纪律 · 禁深路径字面）· face B `>0` 且 == manifest · barrel 恰 2 条 re-export 零弱化 · R2 头注更新 · 既有断言一字不减——**翻正本身交双审** |
| P2 | `pnpm tenant-wiring-e5:prove`（新 · 零 DB） | 0 | **E5 应用层半边（R2 本刀兑现）**：manifest 逐单 id 路径断言必选谓词 + 0 行 fail-closed 分支 |
| P3 | `pnpm tenant-wiring-neg:prove`（`run-e2e-isolated.mjs` 一次性 pgvector 容器 · Ban dev/共享 PG · Ban buy cloud） | 0（PREREQ 缺→预期非零如实记） | **端到端 NEG**：跨 owner 读/写 → app throw + 404 不可区分 + RLS `42501` 双重 fail-closed |

attempts 全账一次优先 · **Ban retry-to-green**（确定性 harness 缺陷沿 PRIV01-B E-1 先例交 post 双审裁 · implementer 不自裁）· E5 两半边切割写死（DB-half 归 PRIV01-A 候选 A · Ban 读作「E5 已全证」）· EXIT0 ≠ `:57` CLOSED ≠ abandon 门开 ≠ tenant=RLS 等价 ≠ cutover ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ ADR 门全绿（ADR 门 cite-only 零执行）。

## Evidence（cite only · @`eef469d9`）

| Item | 锚 |
|------|-----|
| 前刀链 | PRIV01-B `harness/priv01-m2-enforcement-design.md` §4.1.1/§11/§12 + `execution-master-checklist.md:1397` NAIL 节 + `gap-bug-backlog.md:57`/`:774` |
| R1 现状 | `packages/db/test/tenant-enforcement.proof.ts:250-258`（face A/B/barrel 三断言）· barrel `packages/db/src/index.ts:25-32` |
| R2 落卷 | `proof:26-29`/`:180`（E5 应用层半边 prove 归属接线 PR）· DB-half 归 PRIV01-A（`harness/gap-priv-01-tenant-rls.md` §2-§3 · 待授权） |
| 授权根 | `0001_baseline.sql:7`/`:63-82`/`:300-304` · `principal.ts:945-955`（asPrincipal）/`:566-608`（provisionRuntimeLogin） |
| E3/E5 先例 | `interview.service.ts:177-190` `guardInterviewPrivacy`（0 行→404 不可区分 · fence 410）· `profile.service.ts:52-54` 双闸注释 |
| conditional 审查 | `reviews/2026-09-10-tenant-enforcement-mw-privacy-int.md`（接线 PR 须另审——本刀即该另审刀） |
| DELETE=503 | `privacy.controller.ts:51-52` 冻结 |
| 容器 prove 口径 | `scripts/run-e2e-isolated.mjs` + `receipts/2026-10-05-gap-principal-pool-error-listener-fix-prove.md:21` |

## Products

| Role | Path |
|------|------|
| Harness | `ai-docs/delivery/harness/priv01-tenant-wiring.md` |
| Slice | `ai-docs/delivery/priv01-tenant-wiring.slice.md`（本文件） |
| Dual stub `mw-privacy-int` | `ai-docs/delivery/reviews/REQUEST-2026-10-08-priv01-wiring-mw-privacy-int.md`（PENDING · 不代填 Verdict） |
| Dual stub `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-10-08-priv01-wiring-mw-e2e-ha.md`（PENDING · 不代填 Verdict） |

**REQUEST 立卷 commit = 恰 4 文件 docs-only**（零 SSOT · 零产品码/migration/script/prove 执行/零 secrets）。

## Scope / 非目标 · Ban

- **本 REQUEST**：恰 4 文档 docs-only · 零 coding/零 prove 执行/零 SSOT。
- **EXEC（授权后）**：§3 清单生产文件 + P1 翻正面 + P2 新 proof + named scripts + lifecycle/receipts；超清单触面=越权。
- **非目标**：不动授权根 · 不动隐私/擦除链 · 不动 worker/recruiter/admin/roles · 不执行 ADR 门 · 零 SSOT 翻行 · 零 secrets。
- **Ban**：Ban 动 RLS 授权根（MUST NOT abandon/弱化/migrate · asPrincipal/set_config/RLS FORCE 零触碰）· Ban 把应用层写成 RLS 等价/替代 · Ban 碰 `checkpoint-principal.ts` · Ban 碰公开 DELETE=503/privacy 主链/erasure 链 · Ban 改共享 SSOT（`:57` 行翻转=本刀全链+双审+协调方 nail 后另议）· Ban 顺手做 cutover/abandon · Ban tenant/org 列（Ban owner 冒充 tenant）· Ban flag/bypass 化第二层（拟 · 交 PRE dual）· Ban worker 域顺手接线 · Ban E5 互借混报 · Ban retry-to-green · Ban self-approve/self-nail · Ban force-push · Ban buy cloud · Ban 冒充 dual/代签。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · `:57` OPEN · UC-052 partial。

## 流程声明

REQUEST → 预执行双审（mw-privacy-int + mw-e2e-ha）→ meetwise 授权 → coding+prove 一次优先 EXEC → post-prove 双审 → meetwise 授权 nail。（当前停在 REQUEST · awaiting PRE dual）

---

*Slice · PRIV01-C GAP-PRIV-01 应用层 tenant 强制接线 PR（纵深防御第二层 · RLS 根零触碰 · E5 应用层半边 prove 兑现）· `draft:awaiting_pre_exec_dual` · 2026-10-07 立卷 · backlog `:57` OPEN · DELETE=503 · PG-retained · R1 翻正交双审 · alone ≠ dual · STOP*
