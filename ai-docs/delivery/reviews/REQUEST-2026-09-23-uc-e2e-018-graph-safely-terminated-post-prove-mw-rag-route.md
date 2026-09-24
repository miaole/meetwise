# REQUEST — **UC-E2E-018 AiGraphRun safely_terminated · GAP-UC018-GRAPH** · post-prove dual · `mw-rag-route`

**Verdict**: **PASS**  
**Expert / Author**: `mw-rag-route`（domain: metadata/route 中立 · **第二对抗域** · **本刀 ≠ RAG/FUNNEL/G-R4-5 产品面 flip** · **≠ UC covered 宣称** · **Ban peer authorship** · 未写 `mw-e2e-ha` receipt）  
**Date**: 2026-09-23 (~16:48–16:50 PT)  
**Knife**: UC-E2E-018 AiGraphRun safely_terminated · §1b #2 only · `GAP-UC018-GRAPH`  
**Branch**: `feat/mysql-schema-skeleton`  
**Tip before（verified）**: `f06dcbaf0da35d853888df700f78c5541902e1a7` / `f06dcba` · prove tip **MATCH**（`git rev-parse HEAD` 恰等于 prove tip · ancestor YES）  
**Tip after**: 本 receipt 单文件 commit 后更新（见 git log）  
**Prove tip pin**: `f06dcba` / `f06dcbaf0da35d853888df700f78c5541902e1a7` · **MATCH yes**  
**REQUEST tip（pre-exec）**: `25d1900` retained  
**Pre-exec dual（retained）**: e2e-ha `dc0e1fd` · rag-route `d1f1f69`  
**Claimed prove docs**: `ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-graph-safely-terminated-prove.md` + `ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-graph-safely-terminated-evidence.json`  
**Harness left**: `executed:awaiting_post_prove_dual` · **未自钉** · **≠ post_prove_dual_pass** · Ban authorize nail  
**ZERO peer**: confirmed · 未写 peer stub · Ban forge peer mw-e2e-ha reviews · alone≠dual · Dual PASS ≠ nail ≠ covered ≠ coding authorize for next knife

---

## 0. Tip / harness gate

| Check | Result |
|-------|--------|
| Tip before = prove tip `f06dcba` / full `f06dcbaf0da35d853888df700f78c5541902e1a7` | **MATCH** |
| Prove tip is ancestor of HEAD (before this commit) | **YES**（HEAD 即 tip） |
| Branch `feat/mysql-schema-skeleton` | **MATCH** |
| Harness Status | **`executed:awaiting_post_prove_dual`** · **left unchanged** · Ban self-nail |
| Ban Meridian · Ban Cloud Agent · Ban `.env*` | **HOLD** · 未读 `.env*` · 未触 Meridian/Cloud Agent |

---

## 1. Dedicated graph prove ≠ wash abandon（focus #1）

| Check | Result |
|-------|--------|
| Root script `uc018:graph:prove` | `node scripts/run-e2e-isolated.mjs uc018:graph:prove:raw` → `pnpm -C packages/db prove:uc018-graph` |
| Raw prove entry | `packages/db` `prove:uc018-graph` = `tsx test/uc-e2e-018-graph-safely-terminated.proof.ts` |
| Abandon prove entry（对照） | `prove:uc018-abandon` = `tsx test/uc-e2e-018-user-abandon.proof.ts` — **不同文件** |
| Assert surface | G1–G5 nail `AiGraphRun` → `safely_terminated` + 业务事实保全（event/question/interview）· lease cleared · idempotent · safe_terminating→safely_terminated |
| Wash check | **NOT** a rename of `uc018:abandon:*` · Ban wash abandon EXIT=0 alone into GRAPH closed |

**Ruling**: `uc018:graph:prove` is a **dedicated** graph-terminal prove · **PASS wash check**.

---

## 2. 独立复跑 CMD + EXIT（Ban rubber-stamp）

Claimed EXIT（prove receipt + evidence.json + mission table）vs **本专家实测**：

| # | CMD | Claimed | Measured EXIT | Honest read |
|---|-----|---------|---------------|-------------|
| 1 | `pnpm uc018:graph:prove` | 0 | **0** | dedicated G1–G5 graph terminal + fact retention · closes `GAP-UC018-GRAPH` only · ≠ covered · R5 |
| 2 | `pnpm uc018:abandon:prove` | 0 | **0** | retained db regression · ≠ covered · ≠ GRAPH alone · R5 |
| 3 | `pnpm uc018:abandon:http:prove` | 0 | **0** | retained HTTP regression · ≠ covered · ≠ graph terminal · R5 |
| 4 | `pnpm uc018:abandon:full-e2e:prove` | 0 | **0** · `E2E_FINAL_SUMMARY assertions=14` | retained full.e2e abandon · FULL-E2E already CLOSED · ≠ covered · ≠ GRAPH · R5 |
| 5 | `pnpm eval-harness-matrix-cite:prove` | 0 | **0** | static cite · **matrix UC-E2E-018 is partial (not covered)** |

**Verdict on EXIT table**: 全部 MATCH claimed **0** · 独立复跑 · 未发明 EXIT · 未用 HA 授权 env（本刀非 HA）· graph prove **not wash**.

Local receipts（本轮 · `release_evidence=false` · 仅作对照）:
- graph: `.tmp/isolated-proof-receipts/2026-09-23T23-49-05-365Z-1159649-cfef8701-6bd3-4a00-b613-51db449b6ef8.json`
- abandon: `.tmp/isolated-proof-receipts/2026-09-23T23-49-19-680Z-1160826-febaf3a8-c91e-4f92-8ca5-de74959b6436.json`
- http: `.tmp/isolated-proof-receipts/2026-09-23T23-49-29-019Z-1161738-daa73aaa-61e1-4604-afba-b55ab7685784.json`
- full-e2e: `.tmp/e2e-receipts/2026-09-23T23-49-48-608Z-1162688-8edc0817-0279-4751-8460-7c4b08a6f889.json`

---

## 3. Scope / product flags（硬钉 · Ban wash）

| Claim / pin | Expert |
|-------------|--------|
| `GAP-UC018-GRAPH` closed（§1b #2 only） | **同意** · 本刀 scope **ONLY #2** · dedicated `uc018:graph:prove` EXIT=0 |
| matrix **partial** · Ban claim **UC-E2E-018 covered** | **HOLD** · cite prove 确认 `UC-E2E-018 is partial (not covered)` |
| #3 TTL / #5 UI / #6 sole-stack **remain OPEN** | **HOLD** |
| `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` | **retained** · RAG/FUNNEL **OUT OF SCOPE** · Ban wash into UC covered |
| Ban wash RAG/FUNNEL/HA/D2b/`uc018:abandon:*` into UC covered / GRAPH | **HOLD** · abandon proves retained ≠ GRAPH alone |
| `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` | **HOLD** |
| alone≠dual · Dual PASS ≠ nail ≠ covered ≠ coding authorize next knife | **HOLD** |
| Ban authorize nail · Ban self-nail harness → `post_prove_dual_pass` | **HOLD** · harness **left** `executed:awaiting_post_prove_dual` |

---

## 4. Verdict

**PASS** — tip before `f06dcba` **MATCH** prove tip · 五 CMD 独立复跑 EXIT **0/0/0/0/0** · `uc018:graph:prove` **dedicated** G1–G5（≠ abandon rename / wash）· scope **ONLY §1b #2** / `GAP-UC018-GRAPH` closed only · matrix **partial** · Ban claim UC covered · #3/#5/#6 **remain OPEN** · pins `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` / coveredCount **8** / `ms3EqualsR4Closed=false` **retained** · Ban wash RAG/FUNNEL/HA/abandon into UC covered · harness **left** `executed:awaiting_post_prove_dual` · **未自钉** · **未写 peer** · **未读 `.env*`** · **未触 Meridian / Cloud Agent** · Ban authorize nail。

**Blockers**: **无**（本专家侧 EXIT 全绿 · graph prove 非 wash）。完整 post-prove dual 仍待 `mw-e2e-ha` 独立 PASS；alone≠dual · Dual PASS ≠ nail。

---

## 5. Hard pins retained（must appear）

- `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`
- alone≠dual · Dual PASS ≠ nail ≠ covered ≠ coding authorize for next knife
- Ban authorize nail · Ban forge peer mw-e2e-ha reviews · Ban self-nail harness to `post_prove_dual_pass`
- Harness left `executed:awaiting_post_prove_dual`
- Ban Meridian · Ban Cloud Agent · Ban `.env*`
- Ban wash D2b/HA/RAG/FUNNEL/`uc018:abandon:*` into UC covered / GRAPH closed alone
- matrix **partial** · Ban claim UC-E2E-018 covered
- Close **GAP-UC018-GRAPH only** · #3 TTL / #5 UI / #6 sole-stack **OPEN**
- `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false`

---

*Receipt · mw-rag-route · UC-E2E-018 AiGraphRun safely_terminated · GAP-UC018-GRAPH · post-prove · 2026-09-23 (~16:50 PT) · Verdict PASS · tip before f06dcba · prove tip MATCH · EXIT 0/0/0/0/0 · graph prove dedicated G1–G5 · matrix partial · Ban covered · harness left awaiting_post_prove_dual · ZERO peer · Ban Meridian · Ban .env* · Ban self-nail · STOP*
