# REVIEW — CI fix · `adaptive-life:prove` idempotency_key NOT NULL **post-prove** · mw-e2e-ha

**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~00:42 PT · independent re-run)  
**SHA verified**: `21672ab4475c2f1cf3b9cca55077889dd7b32d72` · branch `feat/mysql-schema-skeleton` · matches claimed `21672ab`  
**PR**: #108  
**Pair**: `REQUEST-2026-09-17-adaptive-life-idempotency-ci-fix-post-prove-mw-rag-route.md`（独立配对；本审不代其结论）  
**Scope**: **CI fix post-prove honesty only**（`pnpm adaptive-life:prove` 一点 + 根因/修法诚实）  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ R5** · **≠ G6** · **≠ R4 closed** · **≠ sole cutover** · **≠ flip default**

---

## Verdict

**pass**（限定 scope：CI fix post-prove honesty only）

硬钉（本绿不抬级）：

| Pin | 本审钉死 |
|-----|----------|
| EXIT=0 | ✓ 独立复跑为 0 |
| ≠ suite green | ✓ 未宣称、未跑全 suite |
| ≠ R5 / ≠ G6 / ≠ HA | ✓ |
| releaseEvidence=false | ✓ |
| ≠ R4 closed / ≠ sole cutover / ≠ flip default | ✓ 未宣称 |
| 拒自批 | ✓ 实现方仅 REQUEST；本文件为独立专家审 |
| Ban secrets | ✓ 未见生产密钥 / 未读 `.env*` |

---

## Q1 — 独立复跑 CMD+EXIT

| CMD | EXIT | 关键 OK |
|-----|------|---------|
| `pnpm adaptive-life:prove` | **0** | 隔离栈 `[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy` · migrations applied=133 · B 端：`PASS  B 端岗位 rule-classified route_decided（start 前置）` · `PASS  B 端 startApplicationInterview 返回 interviewId` · 全 unresolved 收口 PASS · quote/fail 段 PASS · 收尾 `✓ 生产主线替换:…全部通过` |

**诚实读法**：本 EXIT=0 = `adaptive-life:prove` **一点绿**。**≠** suite green · **≠** R5/G6/HA · **≠** releaseEvidence。隔离夹具自标 `pgvector-legacy` / `releaseEvidence=false · Not HA`。

---

## Q2 — 根因读法是否成立？

**同意（agree）**。

| 声称 | 对抗核验 |
|------|----------|
| CI 失败：`null value in column "idempotency_key" of relation "entitlement_consumption"`（B 端） | 与旧 seed 路径一致：raw `job_posting` INSERT → 无 semantic revision / classify → `startApplicationInterview` 无 `route_decided` → `interview_ineligible_route`（无 interviewId）→ `reserveEntitlement(..., undefined)` → SQL NULL 撞 schema |
| Schema `idempotency_key text NOT NULL` 正确、**未放松** | `0001_baseline.sql` L112：`idempotency_key text NOT NULL` + UNIQUE(owner,key)。commit `21672ab` **未改任何 migration** |
| 修法：seed 对齐 R2（`createJob` + `classifyJobRoute` rule path）+ 调用方非空 key 守卫 | Diff 证实：B 端改 `createJob` → 查 `job_semantic_revision` → `classifyJobRoute(..., modelClassify throw)` → assert `route_decided`/`rule_decided` → 仅在有真实 `interviewId` 后 `reserveEntitlement`；`commerce.ts` 增 `idempotency_key_required`（非空 string 守卫） |

**非夸大**：守卫是 fail-fast 诚实层（避免约束错掩盖丢 interviewId）；**根因修复在 seed/start 前置**，不是靠守卫「吞」坏路径。未放松 NOT NULL。

---

## Q3 — EXIT=0 是否仍钉 ≠ suite / ≠ R5/G6/HA / releaseEvidence=false？

**是，仍钉。**

- 独立复跑 stdout 自带 `[R5-MARKED-RED]` / `releaseEvidence=false · Not HA` / `local green ≠ HA`
- 本审 **不** 将本绿写成 suite green、R5、G6、HA、releaseEvidence、R4 closed、sole cutover、flip default

---

## Q4 — secrets / `.env*` / 自批 pass？

**否（符合期望）**。

| 检查 | 结果 |
|------|------|
| commit 含 `.env*` / credential 文件 | 无 |
| 本审未读 `.env*` | 遵守 |
| 生产 secrets invent | 无 |
| `RAG_JOB_ROUTE_INPUT_HASH_KEY` | proof 内 test-only `??=` 字面量，标注 `not-production`，与 rag03/r4 同款模式 |
| 实现方自批 pass review | 无；仅双 REQUEST（待审 / 禁止自批）；本文件为 `mw-e2e-ha` 独立结论 |
| Pair | `mw-rag-route` REQUEST 存在；本审 **不** 代其 pass |

---

## Blockers

**无**（相对本 scope：CI fix post-prove honesty）。

非 blocker / 范围外提醒（不抬级）：

- 全 suite / HA / R5/G6 / releaseEvidence 仍未证
- Pair `mw-rag-route` 须独立结论
- 隔离栈仍为 legacy pgvector fixture（自标 ≠ sole-stack truth）

---

## Sign-off

**Verdict**: `pass`  
**Scope**: CI fix post-prove honesty only  
**CMD+EXIT**: `pnpm adaptive-life:prove` → **EXIT=0**（独立复跑）  
**Root-cause**: **agree**（seed/createJob+classify · 非空 idempotency_key 守卫 · schema NOT NULL 未放松）  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠R5** · **≠G6**

Signed: **mw-e2e-ha** · 2026-09-17 ~00:42 PT
