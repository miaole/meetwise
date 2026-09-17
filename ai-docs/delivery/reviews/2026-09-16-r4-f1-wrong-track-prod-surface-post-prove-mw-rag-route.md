# Review — Knife **F1** · wrong_track **production-surface remaining** **post-prove**（RAG/路由 · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~23:25 PT；本审独立复跑 · **不采信**实现方自报 EXIT）  
**结论**：**pass**（限：独立复跑 isolated prove EXIT=0 + raw 无 PG EXIT=1 fail-closed；PS1–PS3 / E1–E8 诚实；G-R2-5 / ban P-FAKEPLAN / ban unscoped **保留**；**仍 ≠ R4 关 ≠ 题域已隔离 ≠ production wrong_track=0 fully closed ≠ HA**）  
**releaseEvidence=false** · Not HA · 配对 `mw-e2e-ha` · HEAD `639134f`  
**硬钉**：≠R4关 · ≠题域已隔离 · LIVE_PG dual ≠ prod closed · NHP covered dual ≠ this knife · EXIT=0 ≠ prod fully closed · sole allowlist 恰 5 · releaseEvidence=false · ≠HA · no self-approve · Key unset · 未读 `.env*`

覆盖 REQUEST：`REQUEST-2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-rag-route.md`  
前序 pre-exec：`2026-09-16-r4-f1-wrong-track-prod-surface-mw-rag-route.md`（pass · 文档门）

---

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 独立复跑 prove + raw no-PG？ | **已复跑** — `pnpm r4-wrong-track-prod-surface:prove` **EXIT=0**（真 isolated PG · `mode=isolated` · `127.0.0.1:32855`）；`:prove:raw` no-PG **EXIT=1**（`PROD_SURFACE_GAP` · skip≠pass） |
| 2 | PS1–PS3 / E1–E8 是否诚实？ | **是** — deploy fail-closed `track_local_required` · `trackLocal`→`retrieveViaDispatchTrackLocal` · `mode=track_local` obs · cache-replay map fail-closed · honesty pins 全绿；E1–E8 均 **不**关 R4 / **不**关 prod fully |
| 3 | LIVE_PG dual ≠ prod closed · NHP covered dual ≠ this knife 是否硬钉？ | **是** — LIVE_PG spawn = separate honesty 旁证；NHP-R4-ADV-01 covered = THIS case only · **≠** F1 · **≠** prod fully closed |
| 4 | G-R2-5 / ban P-FAKEPLAN / ban unscoped 是否保留？ | **是** — helper 仍钉 fail-closed / no unscoped / sibling / legacy_unrouted / P-FAKEPLAN；LIVE_PG L4 + unit A4 旁证 PASS |
| 5 | EXIT=0 是否仍钉 ≠ R4 closed / ≠ 题域已隔离 / ≠ HA / ≠ production wrong_track=0 fully closed？ | **是（硬钉）** |
| 6 | harness/status/eval 是否错误把本绿写成 R4 关 / prod fully closed？ | **否** — 仍 `executed:awaiting_post_prove_dual`；status §13 / m4 §R4 仍 NOT closed |
| 7 | sole allowlist 恰 5 · `releaseEvidence=false`？ | **是** — SOLE 恰 5；F1 **不在** allowlist；`releaseEvidence=false` |

---

## CMD / EXIT（本域独立复跑 · ~23:25 PT · HEAD `639134f`）

| CMD | EXIT | 读法 |
|-----|------|------|
| **`pnpm r4-wrong-track-prod-surface:prove`**（isolated 真 PG） | **0** | PS1–PS3；LIVE_PG+unit 旁证；**≠ R4 closed**；**≠ prod fully closed**；await dual |
| **`pnpm r4-wrong-track-prod-surface:prove:raw`**（无 PG；env -u PG* / DATABASE_URL / E2E_ISOLATED / E2E_TEST_TARGET_TOKEN） | **1** | fail-closed：**refuse fake-green**；skip≠pass；`PROD_SURFACE_GAP` |

OK banner（摘录）：`OK  r4-wrong-track-prod-surface prove (PS1–PS3; LIVE_PG+unit 旁证; ≠ R4 closed; ≠ prod fully closed; releaseEvidence=false)`

FAIL banner（raw）：`PROD_SURFACE_GAP: real Postgres required … skip ≠ pass — refusing fake-green with in-memory-only.`

收据：`.tmp/isolated-proof-receipts/2026-09-17T06-25-23-042Z-1245556-ebd90ae4-719c-48e1-811b-8341ec85abbf.json` · `release_evidence=false`  
夹具注：isolated 默认 **pgvector-legacy** → **R5 green-risk**（本绿≠已迁 / ≠ sole）；Key **unset** · 未读 `.env*` · 未 invent `MODEL_API_KEY`

---

## RAG / 生产面焦点（PS1–PS3）

| 点 | 裁定 |
|----|------|
| **PS1 call-path** | `main.ts` injects `trackLocal`；consumer prefers `adaptive.trackLocal` → `retrieveViaDispatchTrackLocal` — **诚实** |
| **PS1 deploy fail-closed** | `productionRequiresTrackLocal` + consumer `track_local_required` when `NODE_ENV=production` 且缺 trackLocal — **诚实**（禁 compat scoped localRetrieve 冒充 prod） |
| **PS2 observability** | `classifyTrackLocalOutcome` + `observeTrackLocalRetrieval` → `rag_retrieval_total{mode=track_local,outcome=…}`（wrong_track / recheck / cache_replay_* / track_local_required）— **诚实** |
| **PS2 cache-replay** | `scoredRefsFromDispatch` replay recheck_failed → degraded；served → empty；full `R4_WRONG_TRACK_RECHECK_REASONS` map fail-closed — **诚实** |
| **PS3 honesty** | LIVE_PG dual ≠ prod closed · NHP covered ≠ this knife · ≠ R4 closed · P-R1/P-R2/P-META/P-FIX 仍开 — **硬钉保留** |
| **G-R2-5 / P-FAKEPLAN** | **保留** — 缺 snapshot → `route_snapshot_missing`；禁 P-FAKEPLAN；禁 unscoped / sibling / legacy_unrouted |
| **分层（不可坍缩）** | unit ADV honesty → LIVE_PG honesty → NHP-R4-ADV-01 covered（THIS case）→ **F1 production-surface remaining** →（仍开）P-R1 / P-R2 / P-META / P-FIX · **R4 NOT closed**。任一层绿 ≠ 上层关闭。 |

---

## Sole allowlist

- `SOLE_WIRING_ALLOWLIST` **恰 5**：`sole-stack:wiring|ping|qdrant-backed|vectorstore-adapter|vectorstore-qdrant:prove`
- **`r4-wrong-track-prod-surface:prove:raw` 不在 allowlist**（走 legacy isolated PG；prove 内 PS3 断言未扩）
- **sole allowlist 未翻 / 未扩**

---

## Docs 诚实性抽查

| 文件 | 观察 |
|------|------|
| `harness/r4-f1-wrong-track-prod-surface.md` | `executed:awaiting_post_prove_dual` · PS1–PS3 · ≠ R4 closed · LIVE_PG ≠ prod closed · NHP ≠ this knife |
| `eval/r4-f1-wrong-track-prod-surface.eval.md` | 同上；E1–E8 均 Close R4?=否 · Close prod fully?=否/n/a；假绿清单完整 |
| `r4-f1-wrong-track-prod-surface.slice.md` | indexes harness+eval；硬钉齐 |
| `r4-domain-isolation-status.md` §13 | F1 = `executed:awaiting_post_prove_dual`；R4 **仍 NOT closed**；题域隔离 NOT closed；sole 恰 5 |
| `m4-rag-hard-gates.md` §R4 | wrong_track=0 关闭条件原文仍挡；本刀绿 **不**关 R4 |

**未发现** premature R4 closed / 题域已隔离 / prod fully closed / HA 宣称。

---

## 仍开

- **post-prove dual**：本域 pass 已写；配对 `mw-e2e-ha` 独立 — dual = 两域齐后 coordinator 可推进 harness → `post_prove_dual_pass`（**仍 ≠ R4 closed ≠ prod fully closed**）
- production wrong_track=0 **未 fully closed**；R4 / 题域隔离 **NOT closed**
- P-R1 / P-R2 / P-META / P-FIX 仍开；F2 另刀
- LIVE_PG honesty · NHP-R4-ADV-01 covered（THIS case）均为旁证/升格层 · **≠** F1 alone · **≠** prod fully closed

---

## 非宣称

禁止：R4 closed、题域已隔离、production wrong_track=0 fully closed、LIVE_PG dual = prod closed、NHP covered dual = this knife / prod fully closed、HA、`releaseEvidence=true`、suite green、sole cutover、flip default、open DELETE、实现方自批、sole allowlist 已翻、本域 pass 冒充 dual 齐 / R4 关。

---

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-rag-route.md`
- 对照：harness/eval/slice · status §13 · m4 §R4 · `qbank-track-local-retrieve.ts` · `interview-consumer.ts` · `production-config.ts` · `r4-wrong-track-prod-surface.proof.ts` · SOLE
- HEAD：`639134f`
- **prove EXIT=0 · raw EXIT=1 · releaseEvidence=false · ≠HA · ≠R4关 · ≠题域已隔离 · ≠prod fully closed**
- Note：若配对 `mw-e2e-ha` 亦 pass，coordinator **可**将 harness 推进至 `post_prove_dual_pass` — **本审不代改 harness**；推进后仍 **≠ R4 closed**

---

*Review · mw-rag-route · F1 wrong_track prod-surface post-prove · 2026-09-16 ~23:25 PT · pass（post-prove honesty only）· prove EXIT=0 · raw EXIT=1 · G-R2-5 retained · R4 open · ≠ prod fully closed*
