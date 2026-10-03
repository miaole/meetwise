# REQUEST — **NHP-014-ADV-01 · UC-E2E-014·026 webhook ADV 真证据** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-uc014-026-adv-webhook-nhp.md` · slice `gap-uc014-026-adv-webhook-nhp.slice.md`
**Parent tip**: `0345315`（series open · not a prove tip）
**Date**: 2026-10-03

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

## 请审什么（mw-e2e-ha 视角）

矩阵 `NHP-014-ADV-01` / §1.0.1 `UC-E2E-014/026` ADV **gap**（「重放/篡改七类未全铺」）。本刀 REQUEST 为该行求七类 webhook ADV 可复现真证据。请审：

1. **七类注入可执行性**：C1 伪造签名 / C2 缺字段 / C3 夹带金额字段 / C4 同单重放 / C5 跨订单同 providerTxn / C6 并发乱序重复 / C7 未知单+冒充 owner。注入路径唯一 = `POST /commerce/webhook/pay/:id`（无登录态；`commerce-webhook.controller.ts:12`）；产品事实 = `commerce.service.ts:56-68`（缺字段 400 → HMAC `timingSafeEqual` fail-closed 403 → owner-gateway 404 → exactly-once CAS）。
2. **EXIT 契约**：EXIT 0 = C1–C7 每类 HTTP 状态码+响应体+DB before/after 快照断言全成立（C1/C2/C3/C7 零副作用：PaymentOrder 状态与桶不变；C4–C6 恰一次：桶/额/provider_txn 行数）；任一不成立/做不出 → **EXIT 1 诚实保留 gap**。EXIT 0 也不自动翻行：ADV gap→partial 还须 post-prove dual + 协调方授权。
3. **诚实失败路径**：C3 必须如实按「结构性无金额通道」断言，**Ban** 改口「已实现金额复核」；审计后置（GuardrailHit）只披露 observed/absent，不作 EXIT 门槛（case 行期望=幂等+拒）。EXIT1 打印 `GAP-UC014-026-WEBHOOK-ADV` 明细；**Ban** 把 EXIT1 说成 flake。
4. **隔离与安全**：prove 走 `scripts/run-e2e-isolated.mjs` 隔离壳（同 `neg:commerce` 三层包装，`package.json:95` 先例）；`PAY_PROVIDER_SECRET` 只经隔离壳进程环境，Ban secrets/`.env*` 入树入 receipt；`releaseEvidence=false`。
5. **口径与既有 prove 关系**：`neg-commerce.proof.ts` §4（重放/并发/跨订单子集）与 `full.e2e.ts`（错签 403/未知单 404，Key-blocked）与本刀收据**互不替代**；本刀不改这两个文件。receipt 落点 `receipts/2026-10-03-gap-uc014-026-adv-webhook-nhp-prove.md`。
6. **G7 列闸**：NEG 内嵌 C1/C2/C3/C7（拒+错误码+零副作用）；NEG/FAULT/BOUND 保持既有 partial 不动；PERF/LOAD 显式 blind（Ban n/a 偷关、Ban wash）。

Row **`UC-E2E-014/026`** ADV column stays gap. Case `NHP-014-ADV-01` stays gap→case-only. **Ban covered** · coveredCount=8. **Ban 翻任何 SSOT 行**。**Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 任何行/文件**（UC-052 stays partial）。**Ban retry-to-green · attempts 全记录**。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
