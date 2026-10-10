# REVIEW — Knife **commerce-reconcile raw INSERT / missing `interviewId`** **post-prove** · mw-e2e-ha

**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~00:59 PT · independent re-run)  
**SHA verified**: `6cb6f888a6830d5058af9cd2ab121b9a1fe2b05c`（短 **`6cb6f88`**）· `fix(ci): commerce-reconcile B-side seed supplies real interviewId` · **matches claimed `6cb6f88`** · HEAD = claimed  
**PR**: #108 · branch `feat/mysql-schema-skeleton`  
**送审**: `reviews/REQUEST-2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-e2e-ha.md`  
**对照**:
- Pre-exec dual pass（docs gate）: `2026-09-17-commerce-reconcile-raw-insert-mw-e2e-ha.md` + `…-mw-rag-route.md`
- `apps/worker/test/commerce-reconcile.proof.ts` §⑦（本审独立复跑 + 源码核对）
- commit `6cb6f88` diff（B 端 seed：raw INSERT → createJob/classify/assert）
- 同形先例：`2026-09-17-adaptive-life-idempotency-ci-fix-post-prove-mw-e2e-ha.md`（pattern sibling · 非自动套用）
**Pair**: `REQUEST-2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-rag-route.md`（**须独立签**；本审 **不代签 / 不等待**；冲突取更严）  
**Scope**: **commerce-reconcile post-prove honesty only**（`pnpm commerce-reconcile:prove` 一点 + 根因/修法诚实 · Ban forge）  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ R5** · **≠ G6** · **≠ R4 closed** · **≠ sole cutover** · **≠ flip default**

---

## Verdict

**pass**（限定 scope：commerce-reconcile post-prove honesty only）

| Pin | 本审钉死 |
|-----|----------|
| EXIT=0 | ✓ 本审 **独立复跑** `pnpm commerce-reconcile:prove` → **0** |
| ≠ suite green | ✓ 未宣称、未跑全 suite |
| ≠ R5 / ≠ G6 / ≠ HA | ✓ |
| releaseEvidence=false | ✓ |
| Ban forge | ✓ 无直插 `route_decided` / 伪造 `interviewId`；走 `createJob` → `classifyJobRoute` rule path → 真实 start |
| 拒自批 | ✓ 实现方仅 REQUEST（待审 / 禁自批）；本文件为独立专家审 |
| Ban secrets / 未读 `.env*` | ✓ |
| Pair `mw-rag-route` | ✓ 须独立；本审不代签 |

**不批 / 不抬级**：本 pass ≠ suite green · ≠ R5 · ≠ G6 · ≠ HA · ≠ releaseEvidence · ≠ R4 closed · ≠ sole cutover · ≠ flip default · ≠ 题域已隔离 · ≠ production routing 变更批准。

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | commerce-reconcile **post-prove honesty only** |
| CMD | `pnpm commerce-reconcile:prove` |
| EXIT（本审独立） | **0** |
| 根因读法 | **同意**（raw `job_posting` INSERT → 跳 classify → start 无 interviewId → reserve(undefined)） |
| 修法诚实 | **同意**（createJob → rule-classify → invite → start → assert 非空 interviewId → reserve） |
| Ban forge | **持守** |
| 实现方自批 | **无效 / 拒绝** |
| `releaseEvidence` | **false** |
| HA / suite / R5 / G6 | **≠** |
| Blockers（本 scope） | **无**（pair 域独立；见 §4） |

---

## 1. SHA / HEAD

| 项 | 值 |
|----|-----|
| 声称 SHA | `6cb6f88` |
| 本审 box HEAD | `6cb6f888a6830d5058af9cd2ab121b9a1fe2b05c` |
| 关系 | **一致**（HEAD = claimed） |
| 读法 | 本审在 claimed tip 上独立复跑；不因 EXIT=0 抬级 |

---

## Q1 — 独立复跑 CMD+EXIT

| CMD | EXIT | 关键 OK |
|-----|------|---------|
| **`pnpm commerce-reconcile:prove`** | **0** | 隔离栈 `[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy` · `E2E_PG_IMAGE=pgvector/pgvector:pg16` · migrations `applied=133` · §①–⑥ 全 PASS · §⑦：`PASS  B 端岗位 rule-classified route_decided（start 前置）` · `PASS  B 端 startApplicationInterview 返回 interviewId` · assessment_unavailable / released / attempt=2 全 PASS · 收尾 `✓ C1 对账兜底调度侧:…全部通过` |

**诚实读法**：本 EXIT=0 = `commerce-reconcile:prove` **一点绿**。**≠** suite green · **≠** R5/G6/HA · **≠** releaseEvidence。stdout 自标 `releaseEvidence=false · Not HA` / `local green ≠ HA`。

Alias 核验：`commerce-reconcile:prove` → `run-e2e-isolated.mjs` → `pnpm -C apps/worker prove:commerce-reconcile`（`tsx test/commerce-reconcile.proof.ts`）。本审跑的是 REQUEST 命名 CMD，非绕过隔离的 `:raw` 直调。

---

## Q2 — 根因读法是否成立？修法是否诚实？

**同意（agree）**。

### 2.1 根因

| 声称 | 对抗核验 |
|------|----------|
| 旧 B 端 raw `job_posting` INSERT 跳过 semantic revision / classify | Pre-exec spot-check（`:150` raw INSERT）+ commit `6cb6f88` diff 删除该 INSERT — **成立** |
| `startApplicationInterview` 无 `route_decided` → `interview_ineligible_route`（无 interviewId） | 与 R2 P-START / adaptive-life 同形；pre-exec 已同意 latent path |
| `reserveEntitlement(undefined)` → `idempotency_key` NULL 撞 NOT NULL / 或守卫拒 | 同形；**根因在 seed 前置缺失**，非 schema 过严 |

### 2.2 修法（Ban forge · 真实 interviewId path）

源码核对 `commerce-reconcile.proof.ts` §⑦（当前 HEAD）：

```text
createJob(recruiter, { title, description, competencies })
  → SELECT MAX(revision) FROM job_semantic_revision
  → classifyJobRoute(..., modelClassify: throw)   ← 强制 rule path；禁 model 偷绿
  → A(route_decided && rule_decided)
  → inviteCandidate → startApplicationInterview
  → assert typeof interviewId === 'string' && length > 0
  → 缺 ID 则 throw b_side_start_missing_interview_id（fail-closed）
  → reserveEntitlement(..., firstInterviewId, ...)
```

| 检查 | 结果 |
|------|------|
| 仍有 `INSERT INTO job_posting`（B 端）？ | **否**（已删） |
| 直插 `route_decided` / 伪造 decision 行？ | **否** |
| 伪造 / 硬编码 `interviewId` 字符串？ | **否** — 来自 `startApplicationInterview` 返回 |
| 非空断言在 reserve 前？ | **是**（A + throw） |
| 放松 schema NOT NULL？ | **否**（本刀未改 migration / commerce schema） |
| 改 production routing？ | **否**（仅 proof seed） |

**非夸大**：`RAG_JOB_ROUTE_INPUT_HASH_KEY` test-only `??=` 字面量（`…-not-production-01`）= adaptive-life/rag03/r4 同款；**非**生产密钥。`packages/db` 既有 `idempotency_key_required` 守卫 = fail-fast 遗留；**本刀根因修复在 seed 前置**，不是靠守卫吞坏路径。

---

## Q3 — EXIT=0 是否仍钉 ≠ suite / ≠ R5/G6/HA / releaseEvidence=false？

**是，仍钉。**

- 独立复跑 stdout：`[R5-MARKED-RED]` · `releaseEvidence=false · Not HA` · `local green ≠ HA` · `Local green ≠ RAG migrated`
- 本审 **不** 将本绿写成 suite green、R5、G6、HA、releaseEvidence、R4 closed、sole cutover、flip default、题域已隔离
- **EXIT=0 ≠ suite green ≠ R5 ≠ G6 ≠ HA**

---

## Q4 — secrets / `.env*` / 自批 pass？

**否（符合期望）**。

| 检查 | 结果 |
|------|------|
| commit 含 `.env*` / credential 文件 | 无（改 proof + harness/eval/slice/REQUEST/docs reviews） |
| 本审未读 `.env*` | 遵守 |
| 生产 secrets invent | 无 |
| `RAG_JOB_ROUTE_INPUT_HASH_KEY` | proof 内 test-only `??=`，标注 not-production |
| 实现方自批 pass review | 无；仅双 post-prove REQUEST（Status=待审 / 禁止自批） |
| Pair `mw-rag-route` post-prove 结论 | 本审时点 **尚未** 见 `2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-rag-route.md`；**不代签**；须独立 |

---

## 3. 对抗：假绿 / 偷关 / 冒充

| 假绿手法 | 本审裁定 |
|----------|----------|
| 把本 EXIT=0 写成 suite green / R5 / G6 / HA | **拒绝** |
| 把本 pass 写成 releaseEvidence / sole cutover / flip default | **拒绝** |
| 把 `idempotency_key_required` 守卫写成「本刀唯一修法」 | **拒绝** — 根因修复 = seed 前置；守卫 ≠ 消 latent |
| 把 adaptive-life post-prove 写成「本 proof 自动已绿」 | **拒绝** — sibling only；本审独立复跑 |
| 伪造 `route_decided` / 硬编码 interviewId 以推进 | **Ban forge** — 当前实现 **未** 犯 |
| 实现方自批 / 本审代签 rag-route | **拒绝** |
| 用 `:raw` 绕过隔离栈宣称绿 | **拒绝** — 本审跑完整 `commerce-reconcile:prove` |

---

## 4. Blockers

**无阻塞**（相对本 scope：commerce-reconcile post-prove honesty）。

非 blocker / 范围外硬提醒（**不**抬级）：

1. **Pair `mw-rag-route` 须独立 post-prove 结论** — 本审不代签；冲突取更严
2. **本绿一点** — 仅 `commerce-reconcile:prove`；≠ 全 suite / HA / R5 / G6
3. **隔离夹具自标 R5-MARKED-RED / pgvector-legacy** — 与 sole-stack（MySQL+Qdrant+Redis）叙事分离
4. **`releaseEvidence=false` · ≠HA** — 硬钉保持

---

## 5. 本审执行边界确认

| 钉 | 本审 |
|----|------|
| 独立复跑 prove | ✓ `pnpm commerce-reconcile:prove` EXIT=0 |
| 未改源码 / 未 invent key | ✓ |
| 未读 `.env*` | ✓ |
| `releaseEvidence=false` | ✓ |
| ≠HA · ≠ suite · ≠ R5 · ≠ G6 | ✓ |
| 拒自批 | ✓ |
| Ban forge 核验 | ✓ |
| 仅 Meetwise `/workspace/meetwise` | ✓ · Never Meridian |
| 不代签 pair | ✓ |

---

## Sign-off

**Verdict**: `pass`  
**Scope**: commerce-reconcile post-prove honesty only  
**CMD+EXIT**: `pnpm commerce-reconcile:prove` → **0**（独立复跑）  
**Blockers**: **无**（本 scope）  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠R5** · **≠G6**  
**Pair**: `mw-rag-route` 须独立 · 本审不代签  

Signed: **mw-e2e-ha** · 2026-09-17 ~00:59 PT
