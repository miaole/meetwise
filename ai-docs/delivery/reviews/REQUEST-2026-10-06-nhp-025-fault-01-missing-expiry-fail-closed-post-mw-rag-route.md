# REQUEST — **NHP-025-FAULT-01 · UC-025 FAULT missing-expiry fail-closed** · post-prove · mw-rag-route

**Status**: post-prove · 2026-10-06T00:38:05+0800
**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 mw-e2e-ha · 不 nail
**审查对象**: REQUEST `448a33e` · CODE `a8b98fcaaa8c314fd8e25437ff015f59dce05d93` · prove tip `3a6ec52195bbde8bd56cae10e48346391cee116d` · runner `fe411fa` · receipt `ai-docs/delivery/receipts/2026-10-06-nhp-025-fault-01-missing-expiry-fail-closed-prove.md` @ `3a6ec52`
**PRE**: ours `9862601` · peer mw-e2e-ha `fbd47ac`（只读 C-1 · 不代签）
**NORTH-STAR-EXECUTION-LOOP**: 门 = `north-star-hard-gates.md` + harness/slice。

## 复跑（`/tmp/mwrr-3a6ec52` @ `3a6ec52` · `env -u MODEL_API_KEY` · 首次缺 `@swc-node/register` → `pnpm install --frozen-lockfile` 披露后绿）

| CMD | EXIT | 断言/要点 |
|-----|------|-----------|
| `pnpm uc025:nhp-fault:prove` | **0** | `PASS`×15（S0–S6 + R1–R5 + 终句）；`HTTP_ERROR_PIN 409 missing_quiz_expiry` |
| `pnpm uc025:nhp-neg:prove` | **0** | frozen · Ban wash |
| `pnpm uc025:nhp-bound:prove` | **0** | Ban wash |
| Pre-wire @ `fe411fa`（产品未接线） | **1** | `GAP … unwired` |
| Mutation1：禁用 NULL+NaN throw | **1** | S2/S4/S5/S6 FAIL → GAP |
| Mutation2：仅禁用 NaN throw | **1** | R2 FAIL（`REACHED_BIND`） |
| Restore 后再跑 FAULT | **0** | — |

NEG/BOUND proof 文件：`a8b98fc`/`fe411fa`/`3a6ec52` **未**改 `uc-e2e-025-nhp-neg.proof.mjs` / `uc-e2e-025-nhp-bound.proof.ts`。

## 产品改动（`a8b98fc` · 仅 `interview.service.ts`）

独立 FAULT 块（NEG stale throw 后、BOUND 前）：`expires_at == null` 或 `Number.isNaN(expiryMs)` → **409** `missing_quiz_expiry`；先于 bind/reserve/enqueue。NEG `stale_quiz`（非空且过期）语义保留。无 quiz-id 跳过。

## C-1 supersede（peer PRE · meetwise 落地）

- **旧 C-1**（peer PRE）：NULL 不得当过期拒 → fail-OPEN（当 fresh）。
- **裁决**：**supersede**（harness §C-1 + 产品注释 + receipt）：窄保留 NULL **仍不得**抛 `stale_quiz`；缺锚 → 独立 `missing_quiz_expiry` fail-closed；旧工件须回填锚点。
- **裁定**：合法收紧/显式决策（非静默丢条件）；与我们 PRE「钉 exact error」一致。

## PRE 条件（`9862601`）落地表

| # | 条件 | 落地 | 证据 |
|---|------|------|------|
| (1) | NaN/invalid 也 fail-closed（或披露不在 scope） | **落地** | 产品 `Number.isNaN` → 409 `missing_quiz_expiry`；prove R2；mut2 EXIT1 |
| (2) | 钉 exact HTTP+error | **落地** | harness/receipt：**409** + `missing_quiz_expiry`（新码 · ≠ stale/BOUND） |
| (3) | 证据层择一 · ≠ 叙述为隔离 PG/HTTP/covered | **落地** | harness Evidence shape = **in-process + fake DB**；「隔离壳三层」本刀 NOT run；matrix BOUND 旁注同诚实；FAULT prove 输出 `EVIDENCE_SHAPE in-process` |
| (4) | 正控 + NEG/BOUND 回归 EXIT0（不改脚本） | **落地** | R3 未来 expiry → reaches bind；本审 NEG/BOUND EXIT0；proof 文件未改 |

## 范围 / Pins

- `UC-E2E-025` tip 矩阵仍 **gap**（FAULT 列 gap）；coveredCount=**8**。
- 邻刀 UC-011 等在 `448a33e..3a6ec52` 有独立改动；**本刀产品面**仅 `a8b98fc` 面试 FAULT 块。
- FUNNEL / G-R4-5 / r4-funnel*：本刀 range 未触。无 RAG 假关。
- Pins：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · DELETE=503 · PG-retained。

## 条件（本 post）

1. EXIT0 ≠ covered ≠ FAULT 列翻 ≠ nail ≠ HA。alone ≠ dual。
2. 不代签 peer post `c674cb54`。

Verdict: PASS
