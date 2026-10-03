# REQUEST — **GAP-BACKFILL-EMITTER-UNAUTHENTICATED** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）  
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`  
**Knife**: `harness/gap-backfill-emitter-unauthenticated.md` · slice `gap-backfill-emitter-unauthenticated.slice.md`  
**Parent tip**: `315870e`（series open · not a prove tip）  
**Date**: 2026-10-02 (~21:00 PT)

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |

This stub authorizes no coding. Later allowlist is emitter, guard, prove only.

Dual PASS ≠ coding ≠ covered ≠ nail · No coding is authorized by this stub.

---

*Stub · awaiting expert pre-exec dual · STOP*


---

## 预执行审 · `11f1016` · 2026-10-02 (~21:07 PT)

**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 peer · 只追加 · 不改 harness  
**审的 SHA**: `11f1016`（`GAP-BACKFILL-EMITTER-UNAUTHENTICATED` · L0 docs）· 祖先于 origin  
**分支已前移**: 点名 tip `5cd6cbc` 是祖先，不是当前 tip（`49ef158`）。本文件自 `11f1016` 后无再改。  
**性质**: pre-exec only · 本 commit 不改 emitter / guard / prove 代码

### 对照禁令

范围不得超出 emitter / guard / prove。若计划改 evaluator 翻转逻辑、矩阵状态或审者文件，FAIL。HMAC 必须失败关闭：缺标签或坏标签拒绝，禁止 optional-pass。

### 计划是否守禁

- 本 open 声明不改代码。授权后允许列表仅：`scripts/uc018-receipt-backfill-emit.mjs`、`scripts/lib/uc018-receipt-backfill-guard.mjs`、`scripts/uc-e2e-018-receipt-backfill.proof.mjs`。  
- 明确禁止改 `uc018-receipt-backfill-facts.mjs`、`uc-covered-evaluator.mjs`、已入库收据 JSON、覆盖矩阵、gap backlog、execution checklist。  
- 本 commit 的 diff 只有 harness、slice、两份 PENDING stub。stub 无 Verdict，不是 HMAC 实现，也不是改审者结论。evaluator 与矩阵不在 diff 里。  
- 失败关闭已写明：有 log digest 但无 HMAC/签名 → reject；截断签名 → reject；缺密钥 → fail closed，禁止仓库默认密钥；无钥同时改 JSON+log → reject。没有「缺 HMAC 仍通过」的路径。  
- 密钥来自运行时环境。Ban 读 `.env*`。Ban 把密钥写入日志。prove 可在进程内设夹具密钥。  
- UC-018 保持 **partial**。pins：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false。

### 裁定

**PASS**（条件化）。范围与失败关闭都写在计划里，本 open 未越界改 evaluator / 矩阵 / 审者结论。

### Conditions

1. 编码提交只能动上述三文件。碰 evaluator 翻转、facts、矩阵、已入库收据、任一审者文件 → 越界，post-prove 应 FAIL。  
2. 缺标签、坏标签、截断、缺密钥必须拒绝。禁止缺密钥时放行，禁止仓库内默认密钥。  
3. 密钥不进 git，不读 `.env*`，不进日志。  
4. post-prove 须展示：真签通过；改 JSON 失败；改 log 失败；无钥双改失败。  
5. 旧的 HMAC-free 收据不得静默当成已签名。  
6. 不改 `canHonestlyFlip`、不抬 UC-018 / §1.1、coveredCount 保持 8。EXIT=0 ≠ covered ≠ HA。Dual PASS ≠ coding ≠ nail。

### signature

**mw-rag-route** · 2026-10-02 (~21:07 PT) · emitter HMAC pre-exec **PASS** @ `11f1016`（条件化）

Verdict: PASS
