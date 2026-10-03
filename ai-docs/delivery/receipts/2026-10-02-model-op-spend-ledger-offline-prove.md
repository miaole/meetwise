# Receipt — **MODEL-OP spend-ledger offline** prove（CMD+EXIT）

**Date**: 2026-10-02（PT）· **awaiting post-prove dual** · Ban self-nail `post_prove_dual_pass` · Ban self-approve
**Knife**: `harness/model-op-spend-ledger-offline.md` · `model-op-spend-ledger-offline.slice.md`
**Pre-exec dual**: **PASS**（`mw-model-op` + `mw-e2e-ha` @ REQUEST `dfd8443`）
**Line / worktree**: **I** · `line/i-model-op-ledger`（独立 worktree，基线 `3d7063f`）
**Status after this execute**: **`executed:awaiting_post_prove_dual`** · **NOT** `post_prove_dual_pass` · **NOT** MODEL-OP closed
**Pins（不可改口）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · 公开 DELETE=**503**

---

## 范围诚实

本 execute 是 **docs + 新离线 prove 夹具**，零 `packages/ai-runtime/src/` 改动（含 g7-freetier-reprove-guard.ts 只引用），零出站主链改动（model-client / invoke / interceptor / g7-bootstrap / apps/*/main.ts 均未触碰）。**无网络、无 Key、无 live model 调用**（prove 内置 fetch spy：任何网络尝试即抛错，全程 0 次）。`actualSpendCny` 在代码中保持 `null`。

## EXIT table（this execute）

| # | CMD | EXIT | Attempts | Log（worktree 内，`.tmp/` 为 gitignored 原始留档） | Honest read |
|---|-----|------|----------|--------------------------------------------------|-------------|
| 0 | `pnpm install --frozen-lockfile`（worktree 根） | **0** | 2（首次 23.8s 全新安装；二次幂等复核 641ms；两次均 0） | `.tmp/line-i-model-op-spend-ledger-prove/install.log` | 依赖安装，无脚本审批变更 |
| 1 | `pnpm --filter @meetwise/ai-runtime prove:model-op-spend-ledger` | **0** | 2（attempt1 首跑即绿；attempt2 提交态复现；无失败重试） | `.tmp/line-i-model-op-spend-ledger-prove/model-op-spend-ledger-attempt1.log` · `...-attempt2.log` | 34/34 断言 PASS（两次）· **EXIT 0 ≠ MODEL-OP closed ≠ cutover ≠ SLO** |
| 2 | `pnpm --filter @meetwise/ai-runtime prove:g7-freetier-reprove-guard`（回归 sanity） | **0** | 1 | `.tmp/line-i-model-op-spend-ledger-prove/g7-guard-regression-attempt1.log` | 既有 guard NHP 无回归（src 未动） |

**All EXIT=0 · Ban invent EXIT · 全部 attempts 已列出（无隐藏失败）。**

## Prove 原始输出（attempt 1 全文，34 PASS / 0 FAIL）

```
> tsx test/model-op-spend-ledger.proof.ts

PASS  NEG: missing ledger path refused by resolveG7LedgerPath
PASS  NEG: missing ledger path refused by readG7SharedLedger
PASS  NEG: missing ledger path refused by recordG7CallToSharedLedger (fail closed)
PASS  NEG: whitespace-only path refused (trim, not falsy luck)
PASS  NEG: path set but file absent reads as running 0 (empty ≠ missing path)
PASS  FAULT: at-cap fixture refuses another estimated call (g7_cost_cap_exceeded)
PASS  FAULT: refusal leaves ledger bytes unchanged (no silent write)
PASS  FAULT: refusal attempted zero transport (no live retry) :: fetchAttempts=0
PASS  FAULT: over-cap estimate (5 + est 6 > 5) refused with COST_CAP class
PASS  FAULT: still zero bytes written after over-cap refusal
PASS  FAULT: paid reservation on at-cap fixture refused before dispatch
PASS  FAULT: ledger still unchanged after refused reservation
PASS  FAULT: reservation over token cap refused (g7_token_cap_exceeded)
PASS  BOUND: estimator produces estimatedCostCny (number), never an actual field
PASS  BOUND: ledger rows carry no actualSpendCny key (JSON-level)
PASS  BOUND: receipt actualSpendCny is null while estimatedCostCny is a number
PASS  BOUND: receipt actualSpendCny stays null even with a forged env figure present
PASS  BOUND: receipt carries releaseEvidence=false (pin retained in code)
PASS  BOUND: receipt priceBookCitation is the constant price citation, not a console invoice
PASS  ADV: GN-SPEND-LEDGER-FILE demonstrated — rewritten unsigned NDJSON moves cap reads :: honest=1 forged=4.9
PASS  ADV: ledger file carries no signature/HMAC field (gap, not endorsement)
PASS  ADV: forged actual without citation rejected (no citation)
PASS  ADV: forged actual without citation rejected (casual remark ≠ console citation)
PASS  ADV: price-book citation CANNOT authenticate an actual figure (constant ≠ console invoice)
PASS  ADV: non-finite figure rejected even with citation shape
PASS  ADV: negative figure rejected
PASS  ADV: cited console actual accepted by harness policy (out-of-band only)
PASS  ADV: even a cited actual never enters the code receipt (stays null)
PASS  SEP: usage-calibration reconciler never references the G7 NDJSON ledger path
PASS  SEP: G7 guard never references the PG calibration tables/reconciler
PASS  SEP: receipt makes no modelOpClosed / cutover claim
PASS  SEP: receipt evidenceLabel keeps the free-tier non-evidence wording
PASS  SEP: price book citation stays the 2026-09-23 console-reported source (unverified, non-committal)
PASS  transport spy: whole offline run made zero fetch attempts :: fetchAttempts=0

model-op-spend-ledger.proof: ALL PASS (offline; EXIT 0 ≠ MODEL-OP closed ≠ cutover ≠ SLO)
```

## 覆盖映射（harness plan checks + NHP → 断言）

| Harness 项 | 断言（上表前缀） | 结果 |
|------------|------------------|------|
| `:41` missing ledger path fails closed | NEG ×5 | PASS |
| `:41` fixture ledger over cap refuses another estimated call（NHP-2 FAULT，无 live 重试） | FAULT ×8 | PASS |
| `:41` estimator 不能填 `actualSpendCny`（NHP-3 BOUND） | BOUND ×6 | PASS |
| `:41` 伪造实付无控制台出处 = 拒绝（NHP-4 ADV：无签名 NDJSON 不是证据） | ADV ×8 | PASS |
| mw-model-op §5：G7 封顶账 vs usage/calibration reconciler 分开证明 | SEP ×5 | PASS |

## 落点（本 execute 新增/触碰的全部文件）

| Path | 变更 |
|------|------|
| `ai-docs/delivery/model-op-spend-ledger.md` | **新增**：MODEL-OP 费用账现状文档（两本账分开、费率来源标注、Non-claims） |
| `ai-docs/delivery/receipts/2026-10-02-model-op-spend-ledger-offline-prove.md` | **新增**：本 receipt |
| `packages/ai-runtime/test/model-op-spend-ledger.proof.ts` | **新增**：离线 prove 夹具（harness 侧策略 `assertCitedActualSpend` 仅存在于该测试文件，未入 `src/`） |
| `packages/ai-runtime/package.json` | **+1 行**：`prove:model-op-spend-ledger` 脚本注册（scripts 接线，非主链） |

**未触碰（自证）**：`packages/ai-runtime/src/**` 全部（含 g7-freetier-reprove-guard.ts / model-client.ts / invoke.ts / g7-outbound-interceptor.ts / g7-bootstrap.ts / embedder / failover-model / circuit-breaker）、`apps/api/src/main.ts`、`apps/worker/src/main.ts`、共享 SSOT 三件（e2e-requirement-coverage-matrix / e2e-covered-path-backlog / execution-master-checklist）、既有 harness/slice 原文、`.env*`。

## Still open（hard · Ban forge）

| Item | Status |
|------|--------|
| MODEL-OP-00 / spend ledger 关闭 | **STILL OPEN** · EXIT 0 不关闭 |
| GN-SPEND-ACTUAL-NULL（控制台实付落账） | **OPEN** · `actualSpendCny` 恒 null |
| GN-SPEND-LEDGER-FILE（NDJSON 无 HMAC） | **OPEN** · prove 仅演示缺口并拒绝当证据，未实现签名 |
| GN-SPEND-PRICE-REV（priceRevision 在 Line C 出站链） | **OPEN** · 本刀未 retune |
| Line C（G7 fix round2） | **别人手里** · outbound 主链未碰 |
| usage/calibration cutover | **NOT claimed** · reconciler wired ≠ 切换 |
| post-prove dual | **awaiting** · 独立审查方后置 |

---

*Receipt · MODEL-OP spend-ledger offline · 2026-10-02 · executed:awaiting_post_prove_dual · EXIT 0/0 · no live · releaseEvidence=false · ≠HA · ≠ MODEL-OP closed · Ban假绿 · Ban self-approve*
