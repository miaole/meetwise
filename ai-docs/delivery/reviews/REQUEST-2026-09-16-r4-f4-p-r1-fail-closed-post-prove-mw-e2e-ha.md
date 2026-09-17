# REQUEST — Knife **F4** · **P-R1 fail-closed remaining** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-16 (~23:59 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-16-r4-f4-p-r1-fail-closed-post-prove-mw-rag-route.md`  
**Hard**: pre-exec dual PASS · meetwise authorize coding+prove · **DO NOT flip** `MEETWISE_TECH_ROLE_FAIL_CLOSED` default · EXIT=0 ≠ R1/R4 closed ≠ HA · no self-approve · **Ban claiming R4 closed** · **Ban claiming R1 closed**  
**Prior pre-exec dual（pass）**: `2026-09-16-r4-f4-p-r1-fail-closed-mw-e2e-ha.md` · `2026-09-16-r4-f4-p-r1-fail-closed-mw-rag-route.md`  
**Knife**: `pnpm r4-p-r1-fail-closed:prove`（PR1-A–D honesty）；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f4-p-r1-fail-closed.md` | Canonical harness（`executed:awaiting_post_prove_dual`） |
| `eval/r4-f4-p-r1-fail-closed.eval.md` | run-status + fake-green checklist |
| `r4-f4-p-r1-fail-closed.slice.md` | Slice index |
| `harness/r4-domain-isolation-status.md` §13 · **G-R4-3** | R4 **仍 NOT closed**；F4 awaiting post-prove dual · P-R1 gaps STILL OPEN |
| `apps/worker/src/r4-p-r1-fail-closed-remaining.ts` | PR1-A–D fail-closed honesty classifiers |
| `apps/worker/src/r4-p-meta-p-r1-remaining.ts` | F2 classifiers（aligned · default OFF · legacy on） |
| `apps/worker/src/adaptive-role-resolve.ts` | Flag default OFF · legacy「技术岗」（**no flip**） |
| `apps/worker/test/r4-p-r1-fail-closed.proof.ts` | F4 prove |
| `docker/env/worker.env.example` | `MEETWISE_TECH_ROLE_FAIL_CLOSED=0`（unchanged） |
| Prior F3 | `harness/r4-f3-p-meta-serving.md` · **`post_prove_dual_pass`**（MS1–MS3 still false · G-R4-5 STILL OPEN） |
| Prior F2 | `harness/r4-f2-p-meta-p-r1.md` · **`post_prove_dual_pass`**（≠ R1 closed） |
| Sibling F1 | `harness/r4-f1-wrong-track-prod-surface.md` · **`post_prove_dual_pass`**（≠ R4） |

---

## Stance（E2E-HA）

F4 landed **honesty / remaining-gap** for P-R1 **fail-closed**（≠ close R1 · ≠ flip default）:

1. **PR1-A** legacy「技术岗」default-on: flag default **OFF** · `productionDependsOnLegacyDefault=true` · env.example `=0`  
2. **PR1-B** fail-closed flag-on: contract unit exists · `comboRootFlagOnEvidence=false` · **≠ flip default**  
3. **PR1-C** r1 contract 旁证: spawn `r1-tech-role-fail-closed:prove` EXIT=0 **≠** R1 closed  
4. **PR1-D** hard pins: ≠ R1/R4 closed · sole 恰 5 · `releaseEvidence=false` · no model-op · G-R4-5 parallel open

**EXIT=0 ≠ R1 closed ≠ R4 closed ≠ HA ≠ flip authorized**.  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · 见 eval 实测栏）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-p-r1-fail-closed:prove`** | **0** | PR1-A–D；≠ R1/R4 关；no flip；await dual |
| spawn `pnpm r1-tech-role-fail-closed:prove` | **0** | contract 旁证 ≠ R1 closed |
| `:prove:raw` / no-PG isolated | **n/a** | harness **does not** require :raw（no PG） |

**未跑（禁）**：HA 绿关 · flip default / open DELETE · Live Key×3 · 把本绿写成 R1/R4 关。  
**Key**：unset（未 invent MODEL_API_KEY）。  
**Flag**：`MEETWISE_TECH_ROLE_FAIL_CLOSED` default **仍 OFF**（authorize **does NOT** enable that flag）。

---

## Please answer

1. 请 **独立复跑** `pnpm r4-p-r1-fail-closed:prove`，附 CMD+EXIT。  
2. PR1-A–D 是否诚实成立（legacy default-on · combo-root missing · r1 ≠ R1 closed · no flip）？  
3. EXIT=0 是否仍钉 **≠ R1 closed / ≠ R4 closed / ≠ 题域已隔离 / ≠ HA / ≠ suite green / ≠ flip authorized**？  
4. F3 `post_prove_dual_pass` 是否仍钉 **≠** FUNNEL-01 closed · G-R4-5 STILL OPEN · F2 dual **≠** R1 closed？  
5. harness/status/eval 是否错误把本绿写成 R1/R4 已关 / flip authorized？（期望：**否**）  
6. sole allowlist 是否仍恰 5 未翻？`releaseEvidence=false`？default still OFF？  
7. **no** `mw-model-op` 是否仍正确？G-R4-3 / P-R1 是否仍 STILL OPEN？

Please write the conclusion to `reviews/`（e.g. `2026-09-16-r4-f4-p-r1-fail-closed-post-prove-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 R1 / FUNNEL-01 / R4 closed / 题域已隔离 / HA / flip authorized  
- **await post-prove dual**

---

*REQUEST · mw-e2e-ha · F4 P-R1 fail-closed post-prove · 2026-09-16 ~23:59 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠R1 closed · ≠flip · ≠R4 closed · G-R4-3 STILL OPEN · awaiting dual*
