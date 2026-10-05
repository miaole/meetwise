# PRE-EXEC · mw-model-op · NHP-011-ADV-01 real evidence（Line V）

**Verdict**: **PASS**（docs-only gate · **不**授权 coding · **不**授权 prove 执行 · alone ≠ dual · **≠** covered · **≠** ADV partial · **≠** nail）  
**Role**: `mw-model-op`  
**Date**: 2026-10-05 ~23:40 CST（Asia/Shanghai · UTC+8）  
**REQUEST tip**: `bb9af74b8398a2a8e4bba15f34699775529295c6`  
**Git parent / claimed base**: `6a79946ae5bb4b2148e0d63d3b7f66d64a1e51df`（match）  
**Branch**: `feat/mysql-schema-skeleton`  
**Kind**: static docs pre-exec · **Ban live** · **未**跑 `uc011:adv:prove` 或任何 prove  

**Pins**（原值 · 无漂移）: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained**

**Coding authorized**: **no** · **Prove authorized**: **no**

---

## 1. Docs-only

`git show --stat bb9af74` / diff vs parent：**4 个 markdown，+187，无代码 / migration / script / package.json / 收据改写**。

| Path |
|------|
| `ai-docs/delivery/harness/nhp-011-adv-01-real-evidence.md` |
| `ai-docs/delivery/nhp-011-adv-01-real-evidence.slice.md` |
| `ai-docs/delivery/reviews/REQUEST-2026-10-05-nhp-011-adv-01-real-evidence-mw-e2e-ha.md` |
| `ai-docs/delivery/reviews/REQUEST-2026-10-05-nhp-011-adv-01-real-evidence-mw-model-op.md` |

拟 CMD `pnpm uc011:adv:prove`：**尚不存在**（package.json 无该 script）；harness 写「待授权新增」且 **Ban coding** 本 turn。先例 `uc011:report-refund:http:prove` / `uc014:webhook-adv:prove` 存在，仅作形态引用。

## 2. A1 / A2 contract

| Leg | Doc | Assessment |
|-----|-----|------------|
| **A1 错签** | 垃圾/错 HMAC · `POST /payment/refund-callback`（或协调方裁的等价 webhook）· 观察「拒（4xx 可解释）+ 无双退」· DB before/after on ConsumptionRecord / entitlement / payment_order | 路由 + 注入类 + **无双退**侧效 可证。**缺**具名 status/error body（对比 UC014 C1 钉 `403 bad_signature`）与 HMAC 头/密钥名——因产品口今日 **404 缺失**，本 REQUEST 不能诚实发明码。prove 方案要求「HTTP 状态+错误码」入断言，但**未预填具体码**。 |
| **A2 重放** | 同幂等键合法回调顺序重放 · 首退一次 / 次 already\|no-op · 二余额不变 · 无双退 | 幂等键口径可锚定 scenarios E3「支付单号+流水」。**缺**二次提交具名 HTTP status 与字段名。 |

**裁决**：对本 **docs REQUEST**（主诚实闸 = 口缺失 → EXIT1）**合同足够开闸**；具体 4xx/错误码须在 **产品口落地刀**（`GAP-UC011-REFUND-CALLBACK`）或后续 coding REQUEST 钉死后再授权 prove——登记 **Condition C-1**（非 blocker）。**不**把「4xx 可解释」当成已可执行的 machine-check 完成态。

## 3. 404 → EXIT 1 + GAP（关键闸）

Harness 原文（§ADV 注入表后）：

> 若产品口仍 404：prove **诚实 EXIT=1**（执行面 UNREACHABLE / GAP），逐项打印 `GAP-UC011-ADV-01` + `GAP-UC011-REFUND-CALLBACK` 明细；**Ban** 把 404 洗成 ADV partial/covered；**Ban** 在本刀内发明产品口。

另：Non-claims「**H4 404 ≠ ADV evidence**」· Ban「把 H4 404 / H5 PREREQ 洗成 ADV 真证据」· EXIT 0 **仅当**「A1+A2 真证据成立（拒 + 无双退）」。

**裁决：PASS。** 404 **不能**当 A1/A2「拒 = pass」（缺口的 404 会「拒」一切请求，不是验签/重放证明）。未来 prove 必须 EXIT **1** + 双 GAP 明细，不得 skip-as-pass / 降 EXIT 0。

## 4. Covered washing

四文件通篇 **EXIT0 ≠ covered** · coveredCount=**8** · Ban invent covered · Ban flip UC-011 · ADV stays gap/case-only · 无 `coveredCount=9` · 无 `g7SuiteGreen`/suite green 宣称 · 无把 docs-only 或 404 记 covered。引文与矩阵 `:117` / NHP `:58` / H4 404 一致。

## 5. Ledger / 「双退」边界

| Term in doc | Meaning |
|-------------|---------|
| **无双退** | **无二次退款/误 release**：ConsumptionRecord / entitlement / payment_order 快照 · **不是** G7 NDJSON 跑次账 · **不是** usage/calibration reconciler |
| EXIT 0 vs EXIT 1 | **互斥必选**：0 = A1+A2 真证据；1 = 口缺失或断言失败 + GAP 打印。**不是** OR 二选一洗绿 |

无 reconciler cutover 宣称。支付回调账 ≠ G7 封顶账。model-op stub 钉 **零模型调用** + Ban 借刀改 model-client。

## 6. Pins

四文件原值全抄：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。无漂移。

## 7. Scope

无 outbound / Line C / ai-runtime / api·worker main 编辑。Ban live · Ban secrets。Ban SSOT 本 turn。

## Blockers

无。

## Conditions / Non-blockers

- **C-1（合同钉码 · 产品口后）**：A1/A2 在口落地后须钉具名 HTTP status + error code（及 HMAC/幂等字段），对齐 UC014 级具体性，方可授权可执行 prove；本 docs tip 以 404→EXIT1 为主闸，不发明码。  
- **C-2（alone ≠ dual）**：本 PASS 仅为 mw-model-op 半签；须 mw-e2e-ha 独立 PASS + 协调方授权后才可 coding/prove。  
- **C-3（行号小漂移）**：harness 写 scenarios `:238`；本树内容在 `ai-docs/requirements/use-cases/e2e-scenarios.md:248-258`（E3/A3/TC）。矩阵 `:117` / NHP `:58` 实测命中。非 blocker。  
- Dual PASS ≠ coding ≠ prove ≠ nail · EXIT0 ≠ covered · H4 404 ≠ ADV evidence.

## Non-claims

Not coding auth · not prove auth · not covered · not ADV partial · not refund-callback 产品口 · not HA · not `releaseEvidence=true` · not MODEL-OP-00 · not nail · Ban live

---

Verdict: PASS
