# Review — Knife **F4** · **P-R1 fail-closed remaining** **post-prove** · mw-rag-route

**专家**：mw-rag-route  
**日期**：2026-09-17（~00:04 PT；对抗独立审 · **不采信**实现方自报 EXIT；实现方禁止自批）  
**结论**：**pass**（限：post-prove honesty — PR1-A–D · 专家独立复跑 EXIT=0 · **≠ R1 closed / ≠ R4 closed / ≠ 题域已隔离** · **PR1-A `productionDependsOnLegacyDefault=true`** · **PR1-B `comboRootFlagOnEvidence=false`** · **PR1-C `r1Closed=false`** · **G-R4-3 / P-R1 STILL OPEN** · `releaseEvidence=false` · ≠HA · sole 恰 5 · no flip · no Live Key×3）  
**硬钉**：**EXIT=0 ≠ R1 closed ≠ R4 closed ≠ 题域已隔离 ≠ HA ≠ suite green ≠ flip authorized** · **PR1-A true · PR1-B/C false（remaining）** · **G-R4-3 / P-R1 STILL OPEN** · **G-R4-5 / P-META serving parallel open** · **F3=`post_prove_dual_pass` ≠ FUNNEL-01 closed** · **F2=`post_prove_dual_pass` ≠ R1 closed** · **no flip default** · **no Live Key×3** · **no self-approve** · **omit model-op** · HEAD `639134f` · 未 invent Key · 未读 `.env*` · **Ban claiming R4 closed** · **Ban claiming R1 closed**  
**配对**：mw-e2e-ha · 本审不代签 · 本审不代改 harness（coordinator 可在双域齐后 → `post_prove_dual_pass` · 仍 ≠ R1/R4 closed · G-R4-3 STILL OPEN · no flip）

覆盖 REQUEST：`REQUEST-2026-09-16-r4-f4-p-r1-fail-closed-post-prove-mw-rag-route.md`  
对照：`harness/r4-f4-p-r1-fail-closed.md` · `eval/r4-f4-p-r1-fail-closed.eval.md` · `r4-f4-p-r1-fail-closed.slice.md` · status §13 · **G-R4-3** · `harness/r4-domain-isolation.md` §2 / §6c.3 · `apps/worker/src/r4-p-r1-fail-closed-remaining.ts` · `apps/worker/test/r4-p-r1-fail-closed.proof.ts` · `apps/worker/src/r4-p-meta-p-r1-remaining.ts` · `apps/worker/src/adaptive-role-resolve.ts` · `m4-rag-hard-gates.md` §R1 / GAP-RAG-01 · `docker/env/worker.env.example` · `harness/r1-tech-role-fail-closed.md` · Prior F3 **`post_prove_dual_pass`** · Prior F2 **`post_prove_dual_pass`** · Sibling F1 **`post_prove_dual_pass`** · 前序 pre-exec `2026-09-16-r4-f4-p-r1-fail-closed-mw-rag-route.md`（pass） · SOLE 恰 5

---

## 0. Verdict table

| Item | Ruling |
|------|--------|
| **Verdict** | **pass** |
| **Scope** | **post-prove honesty only** — NOT close R1 / R4 / 题域已隔离 · NOT flip authorized |
| Implementer self-approve | **rejected** |
| `pnpm r4-p-r1-fail-closed:prove`（expert re-run） | **EXIT=0** |
| spawn `pnpm r1-tech-role-fail-closed:prove` | **EXIT=0** · **≠ R1 closed** |
| `:prove:raw` | **n/a**（harness：no PG） |
| PR1-A / PR1-B / PR1-C / PR1-D | **honest remaining-gap**（PR1-A true · PR1-B/C false） |
| G-R4-3 / P-R1 | **STILL OPEN** |
| G-R4-5 / P-META serving | **parallel open** · not this F4 |
| F3 `post_prove_dual_pass` | **≠** FUNNEL-01 closed · MS1–MS3 still false |
| F2 `post_prove_dual_pass` | **≠** R1 closed · ≠ flip |
| harness/eval/status | still `executed:awaiting_post_prove_dual` · **did not** claim R1/R4 closed / flip authorized |
| `releaseEvidence` | **false** |
| sole | **恰 5 未翻** |
| Flag default | **still OFF** · env.example `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` |
| omit `mw-model-op` | **still correct** |
| Blockers（this domain） | **none**（pair independent） |

---

## 1. Independent re-run（~00:04 PT · HEAD `639134f`）

| CMD | EXIT | Read |
|-----|------|------|
| **`pnpm r4-p-r1-fail-closed:prove`** | **0** | PR1-A–D all PASS；≠ R1/R4 closed · PR1-A true · PR1-B/C false · no flip |
| spawn `pnpm r1-tech-role-fail-closed:prove` | **0** | contract 旁证 · **≠ R1 closed** |
| `:prove:raw` | n/a | harness does not require |

**Receipt highlights**

- PR1-A：`failClosedFlagDefaultOn=false` · `legacyDefaultLabel=技术岗` · `productionDependsOnLegacyDefault=true` · empty env → fail-closed OFF · flag-off + no route → legacy「技术岗」· `docker/env/worker.env.example` pins `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` · Ban flip / Ban claiming R1 closed
- PR1-B：`flagOnContractUnitExists=true` · `comboRootFlagOnEvidence=false` · flag-on + no route → `adaptive_role_route_missing` · flag-on + deps alone still fail-closed · flag-on + route snapshot accepted · m4/R1 pin combo-root / 组合根 evidence remaining · **≠ flip**
- PR1-C：`contractHarnessExists=true` · `r1Closed=false` · `isPR1FailClosedR1Closed=false` · F2 `isR1Closed=false` · `failClosedAlignsWithF2PR1=true` · inventory/status still list P-R1 / G-R4-3 open · **spawn r1 EXIT=0 ≠ R1 closed**
- PR1-D：`gR45PMetaServingParallelOpen=true` · harness pins ≠ R1/R4 closed · ≠ flip without authorize · `releaseEvidence=false` · ≠HA · sole 恰 5 · omit model-op · G-R4-5 parallel open · status 题域隔离 NOT closed · F3=`post_prove_dual_pass` · G-R4-5 STILL OPEN · **SOLE 恰 5 · F4 NOT on allowlist** · no invent `MODEL_API_KEY`
- Final：`OK  r4-p-r1-fail-closed prove (PR1-A–D; r1 旁证; ≠ R1/R4 closed; no flip; releaseEvidence=false)`

**Key**：未 invent `MODEL_API_KEY` · prove 未 assign · 未读 `.env*` · 未跑 Live Key×3（本刀不依赖 Key）

**Flag**：`isTechRoleFailClosedEnabled({})===false` · env.example `=0` · **未 flip**

**Sole spot**：5 items (`wiring` / `ping` / `qdrant-backed` / `vectorstore-adapter` / `vectorstore-qdrant`) · no `r4-p-r1-fail-closed`

---

## 2. REQUEST Q1–Q7（rag-route answers）

| # | Q | Answer |
|---|---|--------|
| **1** | Independent re-run prove + EXIT？ | **Done** — `pnpm r4-p-r1-fail-closed:prove` **EXIT=0**；spawn r1 EXIT=0 ≠ R1 closed；`:raw` n/a |
| **2** | PR1-A：default OFF · `productionDependsOnLegacyDefault=true` · env.example `=0` — agree？ | **Agree** — classifiers + unit + env.example · legacy「技术岗」still on when flag off · **≠ R1 closed** · **≠ flip** |
| **3** | PR1-B/C：combo-root evidence still missing · r1 prove ≠ R1 closed · no flip — agree？ | **Agree** — `comboRootFlagOnEvidence=false` · flag-on contract unit exists as unit only · spawn r1 EXIT=0 · `r1Closed=false` · aligns F2 · **≠ flip** |
| **4** | EXIT=0 still pins ≠ R1 closed / ≠ R4 closed / ≠ 题域已隔离 / ≠ HA / ≠ suite green / ≠ flip authorized？ | **Yes（hard）** — status/harness/eval/prove summary all pin |
| **5** | G-R4-3 / P-R1 still registered **open**？G-R4-5 parallel open？ | **Yes** — G-R4-3 **是**（仍开）· inventory P-R1 **未关** · PR1-A true · PR1-B/C false · G-R4-5 **parallel open** · **not** this F4 · F3 honesty only · MS1–MS3 still false |
| **6** | sole 恰 5 · `releaseEvidence=false` · omit model-op · default still OFF 仍正确？ | **Yes** — SOLE 5 · F4 not listed · `releaseEvidence=false` · no MODEL-OP domain need → omit **correct** · fail-closed still OFF |
| **7** | harness/eval/status wrongly claim R1/R4 closed / flip authorized？ | **No** — still `executed:awaiting_post_prove_dual`；explicit ≠ R1/R4 closed · ≠ flip · G-R4-3 STILL OPEN · 题域隔离 NOT closed |

---

## 3. RAG / R1 · FUNNEL focus（post-prove）

| Point | Ruling |
|-------|--------|
| **P-R1 fail-closed remaining（G-R4-3）** | Flag default **OFF** · production still depends on legacy「技术岗」· combo-root flag-on evidence **missing** → **R1 still open** · **G-R4-3 STILL OPEN** |
| **PR1-A** | `failClosedFlagDefaultOn=false` · `productionDependsOnLegacyDefault=true` · env.example `=0` — honesty remaining · **≠** authorize flip |
| **PR1-B** | Unit flag-on throws `adaptive_role_route_missing` · `comboRootFlagOnEvidence=false` — unit ≠ combo-root / production evidence · **≠ flip** |
| **PR1-C** | `pnpm r1-tech-role-fail-closed:prove` EXIT=0 = contract 旁证 · `r1Closed=false` · **≠ R1 closed** · aligns F2 PR1 classifiers |
| **G-R4-3 still open** | After EXIT=0 — closing narrative alone ≠ close R1 / R4 / 题域已隔离 · **no flip authorized** |
| **G-R4-5 / P-META serving** | **Parallel open** · F3=`post_prove_dual_pass` honesty only · MS1–MS3 still false · **≠** FUNNEL-01 closed · **not** this F4 scope |
| **Relative F2** | F2=`post_prove_dual_pass` = honesty · P-R1 **STILL OPEN** · **≠** R1 closed · **≠** flip · F4 deepens fail-closed remaining honesty · **still does not close** R1 |
| **Relative F3** | F3=`post_prove_dual_pass` **≠** FUNNEL-01 · G-R4-5 STILL OPEN · **≠** this F4 |
| **Relative F1** | F1=`post_prove_dual_pass` **≠** R4 closed · **≠** prod fully closed |
| **Layering** | F4 prove EXIT=0 → await post-prove dual →（later）`post_prove_dual_pass` **still ≠** R1/R4 / 题域已隔离 · G-R4-3 STILL OPEN · no flip |

---

## 4. Fake-green bans（this review）

- Ban：EXIT=0 → R1 closed / R4 closed / 题域已隔离 / HA / suite green / flip authorized / knife product-done  
- Ban：r1 contract prove green → R1 closed / authorize flip  
- Ban：PR1-A–D honesty classifiers → claim product P-R1 / G-R4-3 closed  
- Ban：F3 dual → FUNNEL-01 / G-R4-5 closed · F2 dual → R1 closed / flip authorized · F1 dual → R4 / prod fully closed  
- Ban：implementer REQUEST = expert pass · self-approve  
- Ban：flip `MEETWISE_TECH_ROLE_FAIL_CLOSED` default · open DELETE · sole expand · invent Live Key×3  
- Ban：missing model-op as blocker（omit **correct**）  
- Ban：single-domain pass = dual-complete without pair · Ban claiming R4 closed · Ban claiming R1 closed

---

## 5. Approve / do-not-approve

**Approve**：post-prove honesty that `pnpm r4-p-r1-fail-closed:prove` independently EXIT=0 documents **remaining-gap** for P-R1 **fail-closed**（PR1-A–D）；PR1-A true · PR1-B/C false · spawn r1 ≠ R1 closed · G-R4-3 / P-R1 **STILL OPEN** · G-R4-5 parallel open · `releaseEvidence=false` · ≠HA · sole 恰 5 · flag still OFF · no flip · no model-op · no Live×3 · no self-approve.

**Do not approve**：R1 closed · R4 closed · 题域已隔离 · HA · suite green · `releaseEvidence=true` · sole cutover · flip default · open DELETE · claiming this green closed G-R4-3 / R1 · treating this single-domain pass as dual-complete without pair · Ban claiming R4 closed · Ban claiming R1 closed.

---

## 6. Receipt

- Expert：`mw-rag-route`
- Cover：`REQUEST-2026-09-16-r4-f4-p-r1-fail-closed-post-prove-mw-rag-route.md`
- Conclusion：`ai-docs/delivery/reviews/2026-09-16-r4-f4-p-r1-fail-closed-post-prove-mw-rag-route.md`
- Expert EXIT：`pnpm r4-p-r1-fail-closed:prove` → **EXIT=0**（~00:04 PT · HEAD `639134f`）；spawn r1 → EXIT=0 ≠ R1 closed
- Confirm：PR1-A–D honesty · PR1-A true · PR1-B/C false · G-R4-3 STILL OPEN · EXIT=0 ≠ R1/R4/题域/HA/suite/flip · sole 恰 5 · `releaseEvidence=false` · flag still OFF · no Live×3 · 未 invent Key · 未读 `.env*` · omit model-op · 拒绝自批 · 配对独立 · **Ban R4 closed** · **Ban R1 closed** · **本审不代改 harness**

---

*Review · mw-rag-route · F4 P-R1 fail-closed post-prove · 2026-09-17 ~00:04 PT · pass（honesty only）· expert EXIT=0 · releaseEvidence=false · ≠HA · ≠R1 closed · ≠R4 closed · ≠flip authorized · PR1-A true · PR1-B/C false · G-R4-3 STILL OPEN · sole 恰 5 · no self-approve · Ban R4 closed · Ban R1 closed*
