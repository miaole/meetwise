# PRE-EXEC · mw-model-op · GAP-UC011-REFUND-CALLBACK product mouth（Line Z）

**Verdict**: **FAIL**（docs-only 属实 · Path B / Line V 边界 / pins 大体诚实 · **Path A 合同未钉 C-1 具名 status/error codes** · 且未禁「任意非-404 4xx = 拒签成功」——与本审 Line V PRE `587b9e0` / POST `0421e5a` C-1 条件冲突 · **本 PASS 不可用** · **≠** coding 授权）  
**Role**: `mw-model-op`  
**Date**: 2026-10-06 ~00:15 CST（Asia/Shanghai · UTC+8）  
**REQUEST tip**: `bb1721bd6b3fdf76d5195a463543a9c3bf841d18`  
**Git parent / claimed base**: `f43bea12fc7f2e28e7bb0052b6a80811eac47e91`（match）  
**Branch**: `feat/mysql-schema-skeleton`  
**Kind**: static docs pre-exec · Ban live · **未**跑 prove · **未**写产品码  

**Pins**（原值 · 文档内无漂移）: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained**

**Coding authorized**: **no** · **Prove authorized**: **no** · alone ≠ dual

---

## 1. Docs-only

`git show --stat bb1721b` / diff vs parent：**4 markdown，+209，无代码 / migration / script / package.json**。

| Path |
|------|
| `ai-docs/delivery/harness/gap-uc011-refund-callback-product-mouth.md` |
| `ai-docs/delivery/gap-uc011-refund-callback-product-mouth.slice.md` |
| `ai-docs/delivery/reviews/REQUEST-2026-10-06-gap-uc011-refund-callback-product-mouth-mw-e2e-ha.md` |
| `ai-docs/delivery/reviews/REQUEST-2026-10-06-gap-uc011-refund-callback-product-mouth-mw-model-op.md` |

## 2. Rulings a–g

### a. Path A — **FAIL / blocker**

Harness Path A 表（~:42–50）：

| Required by this review | Harness says | Ruling |
|-------------------------|--------------|--------|
| Fail-closed 验签 + **named** reject codes（missing/bad/expired sig · unknown order · amount mismatch）· never 2xx/side effect | 「验签 fail-closed（错签拒；无双退）」 | **拒的语义有，码没有** |
| M1+M2 可证伪 prove + **exact** expected status/error | 「至少 M1 合法回调一次退 + M2 同键重放幂等；口仍缺 → EXIT1」 | **里程碑名有，成功/拒签 HTTP+error 未钉** |
| Ban「任意非-404 4xx」当 A1/拒签成功（Line V C-1 / POST-PROVE non-blocker 升级为此刀硬条件） | EXIT0 =「非 404 + M1/M2」 | **仍可被读成 any non-404 4xx** · **未**钉 `403 bad_signature`（或等价格）· **未**钉未知单 / 金额不符码 · **未**钉 M2 二次 `already`/`no-op`/`409` |

对照 UC014 先例（`gap-uc014-026-adv-webhook-nhp.md`）C1 钉 `403 bad_signature` + 零副作用。本刀是 **产品口落地刀**，正是 Line V C-1「口落地后再钉具名码」的承载处——**不得再 defer**。

**Blocker B-1**：Path A 在授权 coding/prove 前必须在 harness（或同 tip 修订）钉死至少：

1. 错签/缺签/垃圾签 → 具名 **HTTP status + error body**（建议对齐 pay webhook：`403` + `bad_signature` 或书面另选并证明）  
2. 未知 order → 具名码（如 `404` + 具名 error，且 **≠** 「口缺失 404」叙事混用）  
3. 金额不符 / 非法体（若产品有金额通道）→ 具名码；若结构性无金额通道 → **DISCLOSED** 如 UC014 C3，不得假称已复核  
4. M1 成功 → 具名 2xx + DB paid→refunded / 权益红冲断言  
5. M2 重放 → 具名二次响应（2xx already/no-op 或 4xx conflict）+ **无双退** DB 快照  
6. 明文：**Ban** 把「任意非-404 4xx」记为验签真证据  

未满足 B-1 前：**Dual PASS 也不构成 Path A coding/prove 授权**。

幂等 / 无双退（支付单号+流水 · CAS）在 §1b#1 / scenarios E3 有锚——**方向对**，但仍缺上表具名码。

### b. Path B — **PASS**

ADR 降级合同清晰（:52–58）：须正式 ADR + 双审 + 协调方 nail 才对齐 SSOT；Ban 无 ADR 假关；Ban ADR 洗 covered。coveredCount=8 · UC-011 partial · ADV gap 保持。

### c. Line V honesty-red 边界 — **PASS**

:68–72 / :18：V nail = EXIT1 · 三口 404 · Ban wash 404=pass；本刀不重开 ADV、不改写 nail；口绿 ≠ ADV covered ≠ 关 `GAP-UC011-ADV-01`。**未**把 V 的 404 重解释为 pass 或 covered。

### d. Ledger 边界 — **PASS（model-op）**

合同锚定 payment_order / ConsumptionRecord / entitlement CAS · 幂等键——**支付/退款账**。未与 G7 NDJSON 跑次账或 usage/calibration reconciler 混淆。stub 钉零模型调用 + Ban 借刀改 model-client。

### e. EXIT0 ≠ covered + pins — **PASS**

:64 / pins 表 / 四文件：coveredCount=**8** · EXIT0 ≠ covered · UC-011 stays partial · ADV stays gap/case-only。Pins 原值全抄。

### f. Forbidden claims — **PASS**

无 HA / R1 closed / G7 green / A3 closed / MODEL-OP-00 closed / `releaseEvidence=true` / `coveredCount=9`。仅 Ban HA cloud buy 等否定句。

### g. Cite accuracy — **PASS（小漂移 non-blocker）**

| Cite | Check |
|------|-------|
| matrix `:117` UC-E2E-011 | **hit** · partial / ADV gap case-only |
| matrix `:414` Line V nail | **hit**（nail 段 · STILL_OPEN 两 gap · product mouths = other knife） |
| backlog `:463-468` | **hit** · honesty of red · gaps OPEN |
| covered-path backlog `:34`/`:45` 叙事 | **hit**（011 行 · H5≠产品口） |
| scenarios `:238` / `:248-258` | 内容在 `ai-docs/requirements/use-cases/e2e-scenarios.md:248-258`（E3/A3/TC）；`:238` 略偏 · **C-cite** |
| `uc-e2e-011-report-refund.md:69` §1b#1 | **hit** |

## Blockers

- **B-1（Path A C-1）**：具名 HTTP status/error codes 未钉；未禁 any-non-404-4xx；M1/M2 不可机检到码级。**必须修订 harness 后再求 Path A coding dual**。

## Non-blockers / Conditions

- Docs-only · Path B 合同可用 · Line V 边界诚实 · pins / EXIT0≠covered / 无假绿宣称。  
- **C-cite**：scenarios 行号 `:238` vs 实文 `:248`。  
- alone ≠ dual · PASS（若他日翻绿）仍 ≠ coding（尤其 Path A 受 B-1 挡）。  
- 修订建议：照抄 UC014 级注入表（错签/缺签/未知单/重放 → 码 + DB 快照）写入 Path A，并显式 `Ban any non-404 4xx as signature evidence`。

## Non-claims

Not coding auth · not prove auth · not covered · not ADV wash · not 产品口已落 · not ADR 已批 · not HA · not MODEL-OP-00 · Line V EXIT1 仍有效

---

Verdict: FAIL
