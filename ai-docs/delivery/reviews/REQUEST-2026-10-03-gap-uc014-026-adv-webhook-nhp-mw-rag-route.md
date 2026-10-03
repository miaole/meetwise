# REQUEST — **NHP-014-ADV-01 · UC-E2E-014·026 webhook ADV 真证据** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`（第二独立审 · 本行非隐私域 → 不换 mw-privacy-int：commerce webhook ADV 无 PII/擦除面）
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

## 请审什么（mw-rag-route 视角 · 独立第二审）

1. **选行与枚举忠实性**：`NHP-014-ADV-01`（矩阵 :60，gap→case-only）+ §1.0.1 `UC-E2E-014/026` ADV gap「重放/篡改七类未全铺」；七类 C1–C7 枚举是否与 `e2e-scenarios.md` UC-E2E-014/026 原文（E-伪造签名/E-篡改金额/E-重放 + A1/A2/A3 + TC-E2E-026-\*）一致，**Ban invent 验收标准**。
2. **诚实路径**：C3「篡改金额」必须按产品事实（`commerce.service.ts:56-68` 回调体无金额通道 = 结构性双拦）如实断言与记录，**Ban** 把结构性事实洗成「已实现服务端金额复核」；审计后置（GuardrailHit）缺席须如实披露，不作 EXIT 门槛、不得沉默。EXIT 1 = 诚实保留 gap（打印 `GAP-UC014-026-WEBHOOK-ADV` 明细），**Ban** 把 EXIT1 说成 flake，**Ban invent fix**。
3. **越界禁令**：本刀不碰 RAG/R2/R4/R5 任何行（`gR45Closed=true` 原值保留；NHP-R4-\* 归 G-R4-5 线群）；不改 `neg-commerce.proof.ts` / `full.e2e.ts` 既有断言；prove 不引入 fake-model、不把连通绿当业务绿；EXIT 0 ≠ covered ≠ ADV 翻行（翻行须 post-prove dual + 协调方授权）。
4. **隔离与密钥卫生**：`scripts/run-e2e-isolated.mjs` 隔离壳三层包装；`PAY_PROVIDER_SECRET` 只经进程环境，Ban secrets/`.env*` 入树入 receipt；`releaseEvidence=false`。
5. **Pins 与禁碰**：Pins 原值（见上表）逐字不变；**Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 任何行/文件**；**Ban retry-to-green**，attempts 全记录（含失败 attempt 的 EXIT 与时间戳）；receipt 落点 `receipts/2026-10-03-gap-uc014-026-adv-webhook-nhp-prove.md`。

Row **`UC-E2E-014/026`** ADV column stays gap. Case `NHP-014-ADV-01` stays gap→case-only. **Ban covered** · coveredCount=8. **Ban 翻任何 SSOT 行**。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
