# REQUEST — Knife **F4** · **P-R1 fail-closed remaining** **post-prove** → mw-rag-route

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-16 (~23:59 PT · post-prove)  
**releaseEvidence=false** · Not HA · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-16-r4-f4-p-r1-fail-closed-post-prove-mw-e2e-ha.md`  
**Hard**: pre-exec dual PASS · meetwise authorize coding+prove · **DO NOT flip** `MEETWISE_TECH_ROLE_FAIL_CLOSED` default · EXIT=0 ≠ R1/R4 closed · no self-approve · **Ban** claiming R1 closed / R4 closed  
**Prior pre-exec dual（pass）**: `2026-09-16-r4-f4-p-r1-fail-closed-mw-e2e-ha.md` · `2026-09-16-r4-f4-p-r1-fail-closed-mw-rag-route.md`  
**Knife**: `pnpm r4-p-r1-fail-closed:prove`；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f4-p-r1-fail-closed.md` | **本刀**（`executed:awaiting_post_prove_dual`） |
| `eval/r4-f4-p-r1-fail-closed.eval.md` | Eval + CMD+EXIT |
| `r4-f4-p-r1-fail-closed.slice.md` | Slice |
| `harness/r4-domain-isolation.md` §2 / §6c.3 | P-R1 inventory **仍开** |
| `harness/r4-domain-isolation-status.md` **G-R4-3** / §13 | F4 awaiting post-prove · G-R4-3 STILL OPEN |
| `apps/worker/src/r4-p-r1-fail-closed-remaining.ts` | classifyPR1FailClosedRemaining / PR1-A–D |
| `apps/worker/test/r4-p-r1-fail-closed.proof.ts` | Prove body |
| `apps/worker/src/r4-p-meta-p-r1-remaining.ts` | F2 align · default OFF · legacy on · r1Closed=false |
| `apps/worker/src/adaptive-role-resolve.ts` | Flag + legacy / fail-closed（default OFF · **unchanged**） |
| `m4-rag-hard-gates.md` §R1 / GAP-RAG-01 | R1 close conditions · prove绿 ≠ closed · combo-root |
| `docker/env/worker.env.example` | `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` |
| `harness/r1-tech-role-fail-closed.md` | contract 旁证 harness |

---

## Stance（rag-route）

F4 = **honesty remaining-gap** for inventory P-R1 **fail-closed**（**not** closing R1 · **not** flipping default）:

1. **PR1-A**：`failClosedFlagDefaultOn=false` · `productionDependsOnLegacyDefault=true` · legacy「技术岗」still on  
2. **PR1-B**：`flagOnContractUnitExists=true` · `comboRootFlagOnEvidence=false` · unit flag-on throws `adaptive_role_route_missing` · **≠ combo-root / production evidence** · **≠ flip**  
3. **PR1-C**：spawn `r1-tech-role-fail-closed:prove` EXIT=0 **≠** R1 closed · aligns with F2 PR1 classifiers  
4. Experts = rag-route + e2e-ha only — **omit** `mw-model-op`  
5. **G-R4-3 still open** after EXIT=0；closing narrative alone ≠ R4 / 题域已隔离 / R1 closed  
6. **G-R4-5 / P-META serving** remains parallel open — **not** this F4 · F3 honesty only  
7. **禁**假关 R1 / 假 flip default / 假关 R4

**EXIT=0 ≠ R1 closed ≠ R4 closed ≠ 题域已隔离 ≠ flip authorized**.

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-p-r1-fail-closed:prove`** | **0** | PR1-A–D honesty；await dual |
| spawn `pnpm r1-tech-role-fail-closed:prove` | **0** | contract 旁证 ≠ R1 closed |
| `:prove:raw` | **n/a** | harness does not require :raw |

**Key**：unset（未 invent）。**未跑** Live Key×3。  
**Flag default**：仍 **OFF**（authorize **does NOT** enable `MEETWISE_TECH_ROLE_FAIL_CLOSED`）。

---

## Please answer

1. 请 **独立复跑** `pnpm r4-p-r1-fail-closed:prove`，附 CMD+EXIT。  
2. PR1-A：default OFF · productionDependsOnLegacy=true · env.example `=0` — 同意？  
3. PR1-B/C：combo-root evidence still missing · r1 prove ≠ R1 closed · no flip — 同意？  
4. EXIT=0 是否仍钉 **≠ R1 closed / ≠ R4 closed / ≠ 题域已隔离 / ≠ HA / ≠ suite green / ≠ flip authorized**？  
5. G-R4-3 / P-R1 是否仍登记为 **open**？G-R4-5 parallel open？  
6. sole 恰 5 · `releaseEvidence=false` · omit model-op · default still OFF 仍正确？  
7. harness/eval/status 是否错误把本绿写成 R1/R4 已关 / flip authorized？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-16-r4-f4-p-r1-fail-closed-post-prove-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- **未**关 R1 / FUNNEL-01 / R4 / 题域已隔离  
- **未** flip default · **未** open DELETE · **未**扩 sole allowlist  
- **await post-prove dual**

---

*REQUEST · mw-rag-route · F4 P-R1 fail-closed post-prove · 2026-09-16 ~23:59 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠R1 closed · ≠flip · ≠R4 closed · G-R4-3 STILL OPEN · awaiting dual*
