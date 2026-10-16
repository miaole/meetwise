# REQUEST — CI · **gitleaks FP allowlist + egress env-name register**（**post-prove**）→ mw-rag-route

**Status**: **`REQUEST / awaiting`**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 ~00:22 PT  
**Knife**: PR #108 · HEAD `1b0380237f3f891ee3fc1ce6f21daa688d0a79d8`  
**releaseEvidence=false** · **Not HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ R5 retired** · **≠ sole cutover** · **≠ R4 closed** · **≠ 题域已隔离** · **sole 恰 5** · **FP fix ≠ suite green ≠ R5/G6/HA** · **no real Key committed** · **Ban treating CI green as product close**  
**Pair**: `REQUEST-2026-09-17-ci-gitleaks-egress-fp-fix-post-prove-mw-e2e-ha.md`  
**Scope**: **docs/CI gate honesty only** — FP allowlist + provider-egress env ***name*** registration  
**Experts**: `mw-rag-route` + `mw-e2e-ha` only — **omit** `mw-model-op`

---

## Contra

| File | Role |
|------|------|
| `.gitleaks.toml` | FP allowlist · honesty docs / prove script-name regexes |
| `provider-egress-inventory.json` | +MODEL_API_KEY (+DASHSCOPE_API_KEY) **name** refs · observe-only · releaseEvidence=false |
| `provider-egress-inventory.proof.mjs` | count 222→243 · releaseEvidence must stay false |
| R5 / sole / G6 / RAG migrate | **SEPARATE** — register ≠ RAG migrated ≠ R5 retired |

---

## Post-prove CMD+EXIT（实现方 · 待专家核对）

| CMD | EXIT | RAG / egress 诚实读法 |
|-----|------|----------------------|
| `gitleaks detect`（PR #108 range） | **0** · no leaks | Commit clean · **≠** product close · **≠** RAG migrated |
| `pnpm provider-egress:inventory` | **0** | observe-only inventory · env names registered · **≠** enforce · **≠** cloud egress proof |
| `pnpm provider-egress:prove` | **0** | releaseEvidence=false pinned · **≠** release evidence |

---

## Stance（rag-route post-prove）

1. Egress register = **env name** inventory honesty · class=`test-isolation` · **≠** Key material committed  
2. mode stays **observe-only** · `releaseEvidence=false`  
3. Closing CI FP/register **alone ≠** G6/R5/suite/R4/题域已隔离/HA/RAG migrated  
4. **sole 恰 5** retained · R5 SEPARATE  
5. **Ban treating CI green as product close**  
6. omit `mw-model-op` — this knife = CI/docs gate · not classify/route MODEL-OP

---

## Please answer（Q1–Q7）

1. harness/docs 是否诚实：本刀 = CI gate honesty only · **≠** suite/G6/R5/HA/product close？  
2. 是否同意：egress 新增 = env ***name*** only · `test-isolation` · **no** real Key in tree？  
3. 是否同意：**省略** `mw-model-op` 仍正确？  
4. 是否同意：G6 OPEN · R5 OPEN SEPARATE · suite 未绿 · sole 恰 5 · 本刀 ≠ 全家关？  
5. 是否同意：`releaseEvidence=false` · mode observe-only · Ban CI green = product close？  
6. 是否同意：gitleaks allowlist = FP-only（script names / Key-unset honesty）· **Ban** using it to hide real credentials？  
7. 是否同意：R5 / sole-stack / RAG migrate **不**并入本刀（SEPARATE）？

Please write conclusion to `reviews/2026-09-17-ci-gitleaks-egress-fp-fix-post-prove-mw-rag-route.md`. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass；实现方禁止自批  
- FP fix / inventory EXIT=0 ≠ suite / G6 / R5 / HA / product close  
- await post-prove dual expert reviews

---

*REQUEST · mw-rag-route · CI gitleaks+egress FP fix post-prove · 2026-09-17 ~00:22 PT · HEAD 1b03802 · releaseEvidence=false · ≠HA · sole 恰 5 · Ban CI green as product close · omit model-op*
