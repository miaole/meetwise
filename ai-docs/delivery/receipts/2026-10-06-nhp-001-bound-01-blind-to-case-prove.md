# Receipt — **NHP-001-BOUND-01 · UC-001 BOUND blind→case prove**（Line AB · case ≠ covered）

**Status**: **`post_prove_dual_pass`**（Line AB nail · prove tip **NAILED TO** `f8cdc82748922a15f668993fe742411052cf21fd` · CODE `6e96cf5` · EXIT 0 17/17 · POST dual mw-e2e-ha `b060e4e` + mw-rag-route `5adb14f` BOTH PASS · **EXIT0≠covered** · SCOPE UC-001 BOUND only · coveredCount=8 · STOP）
**Date**: 2026-10-06（Asia/Shanghai）
**Knife**: Line AB · `harness/nhp-001-bound-01-blind-to-case.md` · slice `nhp-001-bound-01-blind-to-case.slice.md` · gap `GAP-UC001-BOUND-01` · case `NHP-001-BOUND-01` · row `UC-E2E-001`（BOUND 列）
**授权链**: REQUEST `c6dd1a67fc6b6ef4c2dfad0f9a5beff9791d657b` → PRE-EXEC dual BOTH PASS：**mw-e2e-ha `d448da9d0426c30b8ebf8570ecf3d1b7b996bcc9`** + **mw-rag-route `64252bec74a5cde9aed077869aa86dfcf5d40586`** → 协调方 meetwise 授权 coding+prove（Line AB ONLY · UC-001 BOUND）
**执行 worktree**: box `/workspace/meetwise-lineAB-code` · base `origin/feat/mysql-schema-skeleton`（REQUEST `c6dd1a67` + PRE dual 均为祖先）
**Code commit = prove 执行 SHA**: **`6e96cf50a8be410a0d2154761afef88cd2368c7a`**（porcelain 0 行 · 仅 untracked node_modules 软链）
**Prove CMD**: `pnpm uc001:nhp-bound:prove`（root → `scripts/run-e2e-isolated.mjs uc001:nhp-bound:prove:raw` → `pnpm -C apps/api prove:uc001-nhp-bound` → `test/uc-e2e-001-nhp-bound.proof.ts`；容器 `meetwise-e2e-503112-1791218074470` @ `127.0.0.1:32812` · migrations applied=**136** · `ISOLATED_TARGET_ATTESTATION ok`）
**执行方式**: `sg docker -c "env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-bound:prove"`（**显式剥离 MODEL_API_KEY/MODEL_BASE_URL**，prove 入口另行 fail-closed 断言 key 不存在）
**实际 EXIT**: **shell EXIT=0** · `CMD=pnpm uc001:nhp-bound:prove EXIT=0` · `SUMMARY asserts=17 failed=0`（re-prove @ post-rebase CODE_SHA `6e96cf5` · 2026-10-06 00:34:33 → 00:34:47 CST；pre-rebase one-shot @`284d8f3` 亦 EXIT=0，rebase 后锚点行号随 AA land 位移已重证）
**Machine receipt（.tmp，gitignored）**: `.tmp/isolated-proof-receipts/2026-10-05T16-34-47-558Z-503112-06dc5afd-60b8-4302-8472-3c2f0e98d9e9.json`（target=`uc001:nhp-bound:prove:raw` · outcome=passed · exitCode=0 · releaseEvidence=false · sha256 `b6fd8e36f5dd4cf1ab3e909c287c865f837f05f6850822d14533224b817d94ef`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503（原值，零变动）

> **EXIT0 = case 级证据（blind→case）≠ covered。** `UC-E2E-001` 矩阵 BOUND 读法不变（仍 blind/case-only，直到 post-prove dual + 协调方 nail）；本 receipt **不翻 SSOT**、不改矩阵/NHP 行/checklist；≠ UC-E2E-001 covered · ≠ `e2e:isolated` suite green · ≠ trio green · 快乐路径仍可 blind。**Ban wash** Line Y NEG / UC-017 orphan / FUNNEL / G-R4-5 / commerce 旁证成本收据——本 prove 独立成证。
>
> **Honesty**: 产品**已有** begin 幂等（interview id 键 · advisory lock · alreadyBegun · `ON CONFLICT DO NOTHING`）。本刀 = BOUND 真接线 prove 收据，**非**发明产品口。

## 1. 运行账目（全披露）

| # | 项 | 结果 | 说明 |
|---|----|------|------|
| 1 | 编码期 smoke（未提交工作树，同 CMD） | EXIT=1 一次（B2 文档自检过严）→ 收紧后 EXIT=0 | 如实披露；B2 仅禁可执行 import/call，允许 Ban-wash 文案提及 |
| 2 | 编码期 smoke（收紧后，未提交） | EXIT=0（17/17） | 编码自检；之后提交 `6e96cf5`（rebase 后；re-prove @同内容） |
| 3 | **`pnpm uc001:nhp-bound:prove`（@`6e96cf5` re-prove after rebase）** | **EXIT=0** | 全文 §Appendix A。无断言放宽；rebase 后重证一次。 |
| 4 | `node scripts/e2e-static-guards.mjs` | EXIT=0 | runners=6 helpers=20 flags=9 aiPaths=6 |
| 5 | `node scripts/eval-harness-matrix-cite.proof.mjs` @`6e96cf5` | EXIT=0 | coveredCount 叙事未动 |
| 6 | `node scripts/check-staged-secrets.mjs`（提交前） | passed | 零 `.env*` / 凭据 |
| 7 | 容器清理 | 无残留 `meetwise-e2e-*` | runner 自删 |

## 2. 触碰面（`git show --stat 6e96cf5`，4 文件 · **零产品改动**）

| 文件 | 变更 |
|------|------|
| `apps/api/test/uc-e2e-001-nhp-bound.proof.ts` | **新增** BOUND B1/B2 真 HTTP+PG prove + 静态锚点 |
| `apps/api/package.json` | +1 `prove:uc001-nhp-bound` |
| `package.json` | +2 `uc001:nhp-bound:prove`（isolated 壳）/ `:raw` |
| `scripts/run-e2e-isolated.mjs` | target 白名单、命令映射、迁移列表、receipt sourceDigests 各登记 `uc001:nhp-bound:prove:raw` |

**零 diff**：`apps/api/src/**`（含 `interview.service.ts` begin 幂等口——产品已有，本刀不改）· `packages/**` · migrations · SSOT（矩阵 / NHP 矩阵 / checklist / backlog）· harness/slice/REQUEST 文档（Ban self-nail）· UC-003/018/025/004/052/011 文件 · Line Y NEG 收据。

## 3. B1 / B2 合同 → 观察（rag-route prove 钉）

拓扑：真实迁移库（136）→ `provisionRuntimeLogin` 低权登录（RLS 生效）→ in-process `createApp()` 监听回环 → 真 `/auth/signup` 取真 Bearer → `POST /interview/:id/begin`。**无 worker、无模型网关**；`AUTH_DEV_HEADER` 删除。

幂等键 = **interview id**（传入 `reserveEntitlement` 第 3 参）· **≠** HTTP `Idempotency-Key` header（controller 无此头）。

| id | 注入 | HTTP | 观察（SQL 直查，superuser） |
|----|------|------|------|
| **B1a** | 有额度 principal 首次 begin | **202** accepted + jobId | consumption 恰 1 · `idempotency_key===interview id` · reserved 1.00/5.00 · start job 1 · resume 绑定 |
| **B1b** | 同 interview + 同 resume 第二次 begin | **202** `alreadyBegun:true` · **同 jobId** | ledger 与 B1a **逐字相同** · consumption 仍 1 · start job 仍 1 · interview version 不变 |
| **B1c** | 第三次 begin | **202** alreadyBegun · 同 jobId | ledger 仍相同 · 强化幂等口稳定 |
| **B2** | 静态 | — | 本文件无可执行 import/call 到 uc017 orphan / nhp-neg（旁证 ≠ 本收据） |
| L0 | 入口 MODEL_API_KEY | absent | Ban live / Ban key |
| L1 | `ai_model_invocation` / `ai_invocation_trace` | 0→0 | 零模型路径；重放不增生 |

### 锚点（运行时解析 · @`6e96cf5`）

- `apps/api/src/modules/interview/interview.service.ts`：begin `:192` · `pg_advisory_xact_lock('begin', id)` `:198` · alreadyBegun `:321` · `reserveEntitlement(..., id, ...)` `:329` · enqueue start `:337`
- `apps/api/src/modules/interview/interview.controller.ts`：`@Post(':id/begin')` `:22` · `@HttpCode(202)` `:23`
- `packages/db/src/commerce.ts`：`reserveEntitlement` `:36` · `ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING` `:50` · duplicate `:20`

## 4. 诚实边界

- EXIT0 ≠ covered · coveredCount=8 · Ban invent covered · Ban SSOT flip · **Ban self-nail**（harness/slice 生命周期仍 awaiting；本 turn 不钉）。
- Post-prove dual **PENDING**：mw-e2e-ha + mw-rag-route（本 receipt 仅为 prove 证据，alone ≠ dual）。*（历史原文；见下行 nail 更新）*
- **NAIL update（2026-10-06 · additive）**：post-prove dual BOTH PASS — mw-e2e-ha `b060e4e35cfbde00715ff3d8be29ff1d657c9b67` + mw-rag-route `5adb14f68f43108c09ef277db03c674e9b93bfa3`。Lifecycle advanced to **`post_prove_dual_pass`** by Line AB nail（cross-ref harness/slice/SSOT）。prove-only · zero `apps/api/src` · product mouth pre-existing; this knife = BOUND prove wiring · 无双扣。**EXIT0≠covered** · coveredCount=8 · Ban wash Y/018/052/025/004/011 · Ban claiming covered。Pins: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503。
- 本 prove 未触 NEG/ADV/FAULT；UC-003 i18n 未借刀；Ban 018/052/025/004/011；Ban FUNNEL / G-R4-5。
- fixture = pgvector-legacy 隔离 PG（R5 marked-red 提示原样保留）· PG-retained · Not HA · releaseEvidence=false。

## Appendix A — prove 全文（@`6e96cf5`）

```text
CODE_SHA=6e96cf50a8be410a0d2154761afef88cd2368c7a porcelain=0 start=2026-10-06 00:34:33 CST
SHELL_EXIT=0 end=2026-10-06 00:34:47 CST

> meetwise@0.1.0 uc001:nhp-bound:prove /workspace/meetwise-lineAB-code
> node scripts/run-e2e-isolated.mjs uc001:nhp-bound:prove:raw

[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy ... releaseEvidence=false · Not HA ...
E2E isolated PostgreSQL: meetwise-e2e-503112-1791218074470 on 127.0.0.1:32812
migrations: applied=136 skipped=0 ...

> @meetwise/api@0.0.0 prove:uc001-nhp-bound ...
NHP-001-BOUND-01 UC-E2E-001 BOUND blind→case prove (B1 same-interview repeat begin · interview-id idempotency)
PASS  L0 Ban live: MODEL_API_KEY absent on entry (not loaded)
ANCHOR interview.service.ts:begin=192
ANCHOR interview.service.ts:pg_advisory_xact_lock(begin,id)=198
ANCHOR interview.service.ts:alreadyBegun=321
ANCHOR interview.service.ts:reserveEntitlement(interviewIdKey)=329
ANCHOR interview.service.ts:enqueueInterviewJob(start)=337
ANCHOR interview.controller.ts:@Post(:id/begin)=22
ANCHOR interview.controller.ts:@HttpCode(202)=23
ANCHOR commerce.ts:reserveEntitlement=36
ANCHOR commerce.ts:ON CONFLICT DO NOTHING=50
ANCHOR commerce.ts:duplicate status=20
PASS  ANCHOR-B1 ...
PASS  B2 boundary: this receipt does not import/call uc017 orphan prove or nhp-neg proof
ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified
PASS  B1a first begin → HTTP 202 accepted with jobId
PASS  B1a exactly one ConsumptionRecord · idempotency_key === interview id · status reserved · 1.00 unit
PASS  B1a bucket reserved exactly 1.00 (of 5.00) · version bumped once
PASS  B1a exactly one start job enqueued
PASS  B1a interview bound to resume ...
PASS  B1b second begin → HTTP 202 alreadyBegun with SAME jobId (idempotent safe)
PASS  B1b ledger byte-identical after replay (no 双扣 · no second ConsumptionRecord)
PASS  B1b still exactly one ConsumptionRecord keyed by interview id
PASS  B1b still exactly one start job (no double enqueue)
PASS  B1b interview state unchanged by replay ...
PASS  B1c third begin still alreadyBegun · same jobId · ledger still identical
PASS  L1 zero ai_model_invocation / ai_invocation_trace rows created (no model path reached · Ban live)

SUMMARY asserts=17 failed=0
CASE  NHP-001-BOUND-01 B1(...) real HTTP+PG evidence = blind→case
NOTE  EXIT0 ≠ covered · ≠ UC-E2E-001 covered · ≠ e2e:isolated suite green · ≠ trio green · coveredCount=8
CMD=pnpm uc001:nhp-bound:prove EXIT=0
LOCAL_ISOLATED_PROOF_RECEIPT file=.tmp/isolated-proof-receipts/2026-10-05T16-34-47-558Z-503112-06dc5afd-60b8-4302-8472-3c2f0e98d9e9.json release_evidence=false
```

*Receipt · NHP-001-BOUND-01 · Line AB · prove EXIT=0 17/17 @6e96cf5 · tip NAILED TO f8cdc82 · post dual b060e4e+5adb14f PASS · lifecycle post_prove_dual_pass · EXIT0≠covered · coveredCount=8 · STOP*
