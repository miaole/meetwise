**Prove tip**: *(pinned in follow-up docs commit to land SHA)* · parent / REQUEST tip `dad775f` / `dad775f0261ad35f86dcbdf7affd01c9cb68ad9a`

# Prove receipt — **HA D2 CI probe:multi workflow**

**Date**: 2026-09-23 (~15:27–15:35 PT)
**Parent / REQUEST tip**: **`dad775f`** / full `dad775f0261ad35f86dcbdf7affd01c9cb68ad9a`
**Pre-exec dual BOTH PASS**: e2e-ha tip **`10d2053`** / full `10d205360dd318220cde337df42b75d170170a58` · rag-route tip **`4724ce3`** / full `4724ce3` (ancestor of HEAD before land)
**Branch**: `feat/mysql-schema-skeleton`
**Authority**: meetwise — **AUTHORIZED coding+prove** after pre-exec dual **BOTH PASS** · Ban secrets / `.env*` · Ban Meridian · Ban Cloud Agent · **Ban self-nail `post_prove_dual_pass`** · Ban claim 阶 D / 阶 C/D green · Ban production HA / failover · Ban claim CI stub green = 阶 D · Ban flip `releaseEvidence` · Ban wash D1 tips `b72c7c4`/`65526ac`/`1f020fd` into 阶 D · Ban wash C3b `beaedc9`/`4da46d5` · Ban wash C3+C4 `358a5cf`/`16e8379` · Ban wash G-R4-5 `6ded589`/`ba1b8aa` into HA · Ban wash `--require-evidence` EXIT=1 into green · Ban invent green · Ban second knife · D3 production probe **OUT OF SCOPE**
**Harness**: `harness/ha-d2-ci-probe-multi-workflow.md` · status **`executed:awaiting_post_prove_dual`**（**NOT** `post_prove_dual_pass`）
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · 阶 C/D **STILL NOT GREEN** · Local D1 done ≠ 阶 D · CI stub ≠ 阶 D ≠ production HA
**Retained**: `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · prior D1 / C3b / C3+C4 / G-R4-5 product flags

---

## Pre-exec dual（REQUEST tip `dad775f`）

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-09-23-ha-d2-ci-probe-multi-workflow-mw-e2e-ha.md` | **PASS** (pre-exec) · tip `10d2053` |
| `mw-rag-route` | `reviews/REQUEST-2026-09-23-ha-d2-ci-probe-multi-workflow-mw-rag-route.md` | **PASS** (pre-exec) · tip `4724ce3` |

Pre-exec BOTH PASS authorized coding+prove. Dual PASS ≠ HA green · Dual PASS ≠ 阶 D · Dual PASS ≠ next knife. This tip lands workflow + static prove only. Status = **`executed:awaiting_post_prove_dual`**. **Ban self-nail**. Post-prove dual required.

---

## Deliverable

| Path | Role |
|------|------|
| `.github/workflows/ha-probe-multi.yml` | D2 CI-safe workflow · `workflow_dispatch` + `pull_request` path filter · no secrets / `.env*` |
| Job steps | checkout · pnpm/node22 · install · stub `ha:probe:multi -- --with-bring-up-stub --with-fault-inject` expect EXIT 0 · honesty `--require-evidence` **assert EXIT=1** · upload-artifact `ha-probe-multi-receipt` · pin NOT_HA logs |
| Artifact URL recording | **design documented** · live GHA run URL: **none** (not run on cloud yet) · pattern: `https://github.com/<owner>/<repo>/actions/runs/<run_id>#artifacts` · API: `GET /repos/<owner>/<repo>/actions/runs/<run_id>/artifacts` · Ban inventing live URL |

---

## CMD+EXIT（local static prove · ~15:27–15:35 PT）

| # | CMD | EXIT | Honest read |
|---|-----|------|-------------|
| 1 | node `js-yaml` parse `.github/workflows/ha-probe-multi.yml` | **0** | YAML_PARSE_OK · triggers + paths + job present · no `secrets.` expr · no dotenv/env_file load · ≠ HA · ≠ 阶 D |
| 2 | package.json `scripts["ha:probe:multi"]` exists | **0** | SCRIPT_OK · `node scripts/ha/probe.multi.mjs` · flags `--with-bring-up-stub` `--with-fault-inject` `--require-evidence` retained in probe.multi.mjs |
| 3 | `actionlint` | **skip** | actionlint not installed on box · Ban invent green from skip |
| 4 | `pnpm ha:probe:multi -- --require-evidence` | **1** | honesty fail-closed SUCCESS · Ban wash EXIT=1 into green · Ban flip to pass · (local box still had D1 compose dual + shared evidence; even with local evidence still EXIT=1 refuse HA) |
| 5 | `pnpm ha:probe:multi -- --with-bring-up-stub --with-fault-inject` | **0** | overall EXIT=0 · **honesty note**: local box leftover compose dual (`meetwise-ha-dual-api-a/b`) polluted stub fault path (A stayed 200; FAULT auth unset → compose kill refused) · **≠** claim clean GHA stub green · GHA runners have no leftover compose → designed CI-safe stub path · still NOT_HA · ≠ 阶 D |
| 6 | Live GHA workflow run | **not run** | live artifact URL: **none** · Ban invent |

**GAP pins**: actionlint skip · live GHA run none · local stub fault polluted by leftover compose (documented honesty).
**Authorize flags**: none required for CI stub path · Ban secrets / `.env*`.

---

## Non-claims / Ban

- **≠** claim 阶 D / 阶 C/D green · **≠** production HA / failover · **≠** CI stub green = 阶 D · **≠** flip `releaseEvidence`
- **≠** wash D1 `b72c7c4`/`65526ac`/`1f020fd` · C3b `beaedc9`/`4da46d5` · C3+C4 `358a5cf`/`16e8379` into 阶 D
- **≠** wash G-R4-5 `6ded589`/`ba1b8aa` into HA · **≠** wash `--require-evidence` EXIT=1 into green
- Dual PASS ≠ HA green · workflow land ≠ 阶 D · Local D1 done ≠ 阶 D · D3 **OUT OF SCOPE**
- **Ban self-nail `post_prove_dual_pass`** · STOP for post-prove dual · no second knife · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*`
- `gR45Closed=true` retained · coveredCount **8** retained · `ms3EqualsR4Closed=false` retained

---

*Prove receipt · HA D2 CI probe:multi workflow · 2026-09-23 (~15:35 PT) · YAML parse EXIT=0 · script OK · actionlint skip · require-evidence EXIT=1 honesty · stub local EXIT=0 with compose-pollution honesty note · live GHA none · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · 阶 C/D STILL NOT GREEN · CI stub ≠ 阶 D · executed:awaiting_post_prove_dual · Ban self-nail · STOP*
