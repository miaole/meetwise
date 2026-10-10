# POST-PROVE · mw-model-op · NHP-011-ADV-01 real evidence（Line V）

**Verdict**: **PASS**（审诚实红 · EXIT **1** · **≠** covered · **≠** ADV partial · **≠** nail · alone ≠ dual · **不**关产品口）  
**Role**: `mw-model-op`  
**Date**: 2026-10-05 ~00:05 CST（Asia/Shanghai · UTC+8；本机写审时刻）  
**REQUEST**: `bb9af74b8398a2a8e4bba15f34699775529295c6`  
**Code / prove SHA**: `3d113c872455375d81d84de48b7d806eb42b2dd4`  
**Receipt tip**: `79825b206d068aea0ef200ae8f5c4f92e85642d6`（docs only vs code）  
**PRE dual**: mw-model-op `587b9e0` + mw-e2e-ha `5716b47`（收据引文）  
**Branch**: `feat/mysql-schema-skeleton`  
**Live**: **Ban** · keys unset · 本审 **未**调模型 / 外部支付  

**Pins**: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained**

---

## Diff honesty

| Range | Result |
|-------|--------|
| `3d113c8` alone | 4 files：`uc-e2e-011-adv-refund-callback.proof.ts` + `apps/api/package.json` + root `package.json` + `scripts/run-e2e-isolated.mjs` · **零** `apps/api/src/**` |
| `3d113c8` → `79825b2` | **仅** `ai-docs/delivery/receipts/2026-10-05-nhp-011-adv-01-real-evidence-prove.md` |
| `bb9af74` → `3d113c8` 更宽 | 含他线（如 Line W `interview.service.ts` resumeVersion pin）· **无** refund-callback / payment webhook 产品路由 |

## 1. 本审重跑（@ `3d113c8` · keys unset · `sg docker`）

| Field | Value |
|-------|-------|
| CMD | `sg docker -c 'env -u MODEL_API_KEY -u MODEL_BASE_URL … pnpm uc011:adv:prove'` |
| EXIT | **1**（`CMD=pnpm uc011:adv:prove EXIT=1` · 断言 18 / 失败 6） |
| Path | 隔离 PG ready → `_neg-harness` 起 api · **观察到真实 HTTP 404**（非「DB missing」洗成 ADV） |

Printed GAP / surface（摘录）:

- `SURFACE: anyReachable=false allUnreachable=true`
- `GAP-UC011-REFUND-CALLBACK: 三口皆 404/405 — 执行面 UNREACHABLE`
- `GAP-UC011-ADV-01: A1/A2 无法取得非-404 验签/重放证据（Ban wash 404=pass）`
- A1/A2 OBSERVE 均为 `HTTP 404` · `Cannot POST /payment/refund-callback`（及 webhook 等价口）
- 收尾再印 `GAP-UC011-ADV-01` + `GAP-UC011-REFUND-CALLBACK` + `coveredCount=8`

**与收据宣称的 404 路径一致**（不是 DB-not-ready 冒充）。

## 2. Hard-wired check — **not hard-wired**

文件 `apps/api/test/uc-e2e-011-adv-refund-callback.proof.ts`:

| Check | Evidence |
|-------|----------|
| 真实发请求 | SURFACE / A1 / A2 均 `h.post(...)`（~141–187, ~244–245） |
| 404 ≠ pass | `isUnreachable` = 404\|405（:58–61）；`isExplainableRejectNotGap` 排除 unreachable（:63–66）；A1 断言要求非-404 4xx（:194–199） |
| 双 404 ≠ 幂等 PASS | A2 `Ban wash: 双次 404 不得记成重放幂等 PASS`（:259–260）显式 **FAIL** when both unreachable |
| EXIT 分支 | `failures.length > 0` → `process.exit(1)`（:290–300）；仅全绿 → `exit(0)`（:303–307）。**非**无条件 `exit(1)` |
| 区分 404 vs 其他 4xx | 404/405 → UNREACHABLE；其他 4xx 才算「可解释拒」（C-1 具名码仍 deferred） |

## 3. Zero product business endpoints

`3d113c8`：**无**新 refund-callback / webhook refund 控制器或 stub。读码：`commerce-webhook.controller.ts` 仅 `@Post('pay/:id')`；`commerce.controller` / `commerce.service` / `payment.ts` 无 refund* API（INV 5/5 PASS）。**无**「一律拒」的假口可喂未来绿 run。

## 4. Ledger / 无双退

口缺失路径下 DB before/after 零误改 **PASS**，收据正确写明 **仍 ≠ 验签/重放真证据**。无宣称 refund 幂等已证。无与 G7 NDJSON / model-invocation/usage 账混淆。无 reconciler cutover。

## 5. Covered washing

收据 + 本审重跑输出：`coveredCount=8` · UC-011 **partial** · ADV **gap/case-only** · EXIT0 ≠ covered · 无 `coveredCount=9` · 无 suite green。`79825b2` 未改 SSOT。

## 6. C-1 deferral

收据与 prove 均印 `C-1 DISCLOSED: …未预填`。今日三口 404 → **不可能** EXIT 0。  
**Non-blocker**：代码层 EXIT 0 条件是「非-404 的任意 4xx + A2 可达」——**尚未**强制具名 `bad_signature` 级码；口落地后须先钉 C-1 再认绿 dual（与 PRE C-1 一致）。

## 7. Scope / redaction

Ban live · 无 outbound/Line C 编辑于 `3d113c8`。收据 sk-/Bearer/MODEL_API_KEY=/private-key **0**。

## Blockers

无。

## Non-blockers / Non-claims

- PASS ≠ nail · alone ≠ dual（`mw-e2e-ha` 须另签）  
- EXIT 1 诚实 ≠ 产品口关闭 · Ban 互借关 `GAP-UC011-REFUND-CALLBACK`  
- C-1 具名码仍待产品口刀  
- 更宽 `bb9af74..3d113c8` 含 Line W interview pin（非本刀 refund stub）

---

Verdict: PASS
