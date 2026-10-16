# REQUEST — CI · **gitleaks FP allowlist + egress env-name register**（**post-prove**）→ mw-e2e-ha

**Status**: **`REQUEST / awaiting`**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 ~00:22 PT  
**Knife**: PR #108 · HEAD `1b0380237f3f891ee3fc1ce6f21daa688d0a79d8` · `fix(ci): allowlist gitleaks FPs + register MODEL_API_KEY egress refs`  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ R5 retired** · **≠ UI green** · **sole 恰 5** · **FP fix ≠ suite green ≠ R5/G6/HA** · **no real Key committed** · **Ban treating CI green as product close**  
**Pair**: `REQUEST-2026-09-17-ci-gitleaks-egress-fp-fix-post-prove-mw-rag-route.md`  
**Scope**: **docs/CI gate honesty only** — FP allowlist + env ***name*** registration（≠ product close · ≠ suite/G6/R5/HA）

---

## Contra

| File | Role |
|------|------|
| `.gitleaks.toml` | NEW · FP allowlist（4 paths + 3 regexes）· **not** real-secret hide |
| `ai-docs/architecture/ai/provider-egress-inventory.json` | +MODEL_API_KEY / +DASHSCOPE_API_KEY env **name** refs · `releaseEvidence=false` · mode=observe-only |
| `scripts/provider-egress-inventory.proof.mjs` | envReferenceCount **222 → 243** |
| `.github/workflows/ci.yml` | `secrets-scan` + `provider-egress:inventory/prove` jobs（unchanged by this knife） |
| R5 / G6 / sole / suite | **SEPARATE** — not this close surface |

---

## Post-prove CMD+EXIT（实现方 · 待专家独立核对）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `gitleaks detect`（PR #108 commit range + `.gitleaks.toml`） | **0** · no leaks found | Commit surface clean · **≠** full-history secrets-scan product green · **≠** suite/G6/R5/HA |
| `pnpm provider-egress:inventory` | **0** | static inventory valid · env_references=243 · releaseEvidence=false · **≠** egress enforce · **≠** cloud isolation |
| `pnpm provider-egress:prove` | **0** · 7/7 | proof asserts releaseEvidence=false · count=243 |

**Pins for experts**:
- Allowlist targets honesty docs / `prove:uc0xx` script-name FPs · **Ban** expanding to hide residual orthogonal FPs without separate knife
- Registered entries = env ***names*** only · class=`test-isolation` · **no** secret values committed
- **FP fix ≠ suite green ≠ R5/G6/HA** · **Ban treating CI green as product close** · **sole 恰 5**

---

## Please answer（Q1–Q6）

1. Agree scope = **CI gate honesty only**（FP allowlist + env name register）· **≠** suite/G6/R5/HA/product close?  
2. Agree allowlist is FP-only（paths/regexes for script names / Key-unset honesty）· **no** real Key committed in PR #108?  
3. Agree `provider-egress:inventory` EXIT=0 + `releaseEvidence=false` · names-only register · **≠** enforce / cloud isolation / product close?  
4. Agree **FP fix ≠ suite green ≠ R5/G6/HA** · **sole 恰 5** retained · **Ban treating CI green as product close**?  
5. Agree residual full-history fixture-phrase hits（outside this allowlist）= **orthogonal** · this knife **must not** claim full-history secrets-scan / product green?  
6. Independent spot：re-run gitleaks (PR range) and/or `pnpm provider-egress:inventory`？

Please write conclusion to `reviews/2026-09-17-ci-gitleaks-egress-fp-fix-post-prove-mw-e2e-ha.md`. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not suite green · not G6 closed · not R5 closed · not HA · not product close  
- FP allowlist ≠ secret hide · env name register ≠ Key committed  
- `releaseEvidence=false` · sole 恰 5 · no self-approve

---

*REQUEST · mw-e2e-ha · CI gitleaks+egress FP fix post-prove · 2026-09-17 ~00:22 PT · HEAD 1b03802 · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6/R5 · sole 恰 5 · Ban CI green as product close · no invent Key*
