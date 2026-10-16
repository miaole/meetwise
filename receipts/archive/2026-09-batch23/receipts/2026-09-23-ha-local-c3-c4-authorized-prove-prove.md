**Prove tip**: `94b05b6` / `94b05b68c66c29996242477bf6e27a5f2966a3c5` · parent `72d2b93`

# Prove receipt — **HA local C3+C4 authorized-prove** (fix+re-prove after rag-route BLOCK)

**Date**: 2026-09-23 (~14:29 PT)
**Parent / prior tip**: **`72d2b93`** / full `72d2b93c19f181d27dc14baa074af887f69f6cbf`
**Branch**: `feat/mysql-schema-skeleton`
**Authority**: meetwise — **AUTHORIZED fix+re-prove** after post-prove **BLOCK** by `mw-rag-route` on tip `72d2b93` · Ban secrets / `.env*` · Ban Meridian · Ban Cloud Agent · **Ban self-nail `post_prove_dual_pass`** · Ban claim 阶 C/D green · Ban production HA / failover · Ban flip `releaseEvidence` · Ban wash G-R4-5 tip `6ded589` / prove `ba1b8aa` into HA · Ban wash skeleton/stub EXIT=0 into HA · Ban invent green / forge receipts · Ban second knife
**Harness**: `harness/ha-local-c3-c4-authorized-prove.md` · status **`executed:awaiting_post_prove_dual`**（**NOT** `post_prove_dual_pass` · fresh）
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · 阶 C/D **STILL NOT GREEN** · ≠ production HA · Dual PASS ≠ HA green · local EXIT=0 ≠ 阶 C/D green
**Prior G-R4-5 retained（≠ wash into HA）**: nail **`6ded589`** · prove **`ba1b8aa`** · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · eg1–eg6/r4/funnel retained · `releaseEvidence=false`

---

## Why fix (cite BLOCK)

`mw-rag-route` post-prove receipt `reviews/REQUEST-2026-09-23-ha-local-c3-c4-authorized-prove-post-prove-mw-rag-route.md` · tip `72d2b93` · independent CMD4:
`MEETWISE_HA_FAULT_AUTHORIZED=1 pnpm ha:fault-inject -- --kill --with-shared-survivor`
→ **EXIT=1** · `COMPOSE_INCOMPLETE` · after `docker stop api-a`, A `/livez` still **200** · `aDown=false`.
Claimed 4×0 on `72d2b93` **NOT** independently reproduced. `mw-e2e-ha` post-prove PASS alone on `72d2b93` · **alone≠dual** · nail HOLD.

**Root cause (diagnose)**: `docker stop -t 5` leaves a SIGTERM grace window where Nest `/livez` can still answer 200; concurrent compose re-bring-up (RestartCount=0) can also resurrect A before probes settle. `waitPostFault` previously only polled livez for ~4.5s without inspecting `State.Running` or re-killing.

**Fix (files)**: `scripts/ha/fault-inject.mjs`
1. `--kill` path uses `docker kill` (SIGKILL) instead of `docker stop -t 5`.
2. `waitPostFault` requires `Running=false` **and** livez-down, with **3 consecutive** confirms (~15s window).
3. If A container resurrects mid-wait, **one** re-kill then continue; receipt records `aContainerRunning` / `rekillUsed` / `aLivezOk`.

---

## Pre-exec dual（historical · REQUEST tip）

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-09-23-ha-local-c3-c4-authorized-prove-mw-e2e-ha.md` | **PASS** (pre-exec) |
| `mw-rag-route` | `reviews/REQUEST-2026-09-23-ha-local-c3-c4-authorized-prove-mw-rag-route.md` | **PASS** (pre-exec) |

## Post-prove dual on parent `72d2b93`（history · not this tip）

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-09-23-ha-local-c3-c4-authorized-prove-post-prove-mw-e2e-ha.md` | **PASS alone** · alone≠dual |
| `mw-rag-route` | `reviews/REQUEST-2026-09-23-ha-local-c3-c4-authorized-prove-post-prove-mw-rag-route.md` | **BLOCK** (CMD4 EXIT=1) |

This tip lands fix+re-prove only. Status = **`executed:awaiting_post_prove_dual`**. **Ban self-nail**. Fresh **BOTH-domain** post-prove required on **new** tip.

---

## CMD+EXIT（exact order · honest · this re-prove ~14:28–14:29 PT）

| # | CMD | EXIT | Result label | Honest read |
|---|-----|------|--------------|-------------|
| 1 | `pnpm ha:dual:build-image` | **0** | `IMAGE_BUILT` | local image · ≠ HA · ≠ 阶 C green |
| 2 | `MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:dual:compose-shared` | **0** | `DUAL_COMPOSE_SHARED_UP` | dual Nest `/livez` + sole-stack · **still** NOT_HA |
| 3 | `MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:prove:shared -- --prove` | **0** | `SHARED_OK`（`sharedPath=shared_backend_hostpath`） | C3 local shared · still NOT_HA · ≠ 阶 C green |
| 4 | `MEETWISE_HA_FAULT_AUTHORIZED=1 pnpm ha:fault-inject -- --kill --with-shared-survivor` | **0** | `COMPOSE_FAULT_SHARED_PARTIAL` / `SHARED_OK_SURVIVOR` · method `docker-kill-api-a` · **`aDown=true`** | C4 local fault · still NOT_HA · ≠ production failover |

**Independent post-CMD4 verify**: A `/livez` **000** · A `Running=false` · B `/livez` **200** · kill receipt `aDown=true` · survivor `status=OK`.
**GAP pins**: **none** this run.
**Prereq**: `docker compose -f docker/compose.mysql-local.yml up -d mysql redis` (sole network healthy) before CMD2.

---

## Evidence

- JSON summary: `receipts/2026-09-23-ha-local-c3-c4-authorized-prove-evidence.json`
- Local runtime (gitignored `.tmp/`): `.tmp/ha-evidence/`
  - `shared-state-A-write.json` · `shared-state-B-read.json`
  - `kill-A.receipt.json` · `B-still-serving.receipt.json` · `fault-shared-survivor.receipt.json`
- All receipts hard-pin `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`

---

## Non-claims / Ban

- **≠** claim 阶 C/D green · **≠** production HA / failover · **≠** flip `releaseEvidence`
- **≠** wash G-R4-5 tip `6ded589` / prove `ba1b8aa` into HA · **≠** wash skeleton/stub EXIT=0 into HA
- **≠** invent green / forge EXIT · Dual PASS ≠ HA green · local EXIT=0 ≠ 阶 C/D green ≠ production HA
- **Ban self-nail `post_prove_dual_pass`** · STOP for **fresh** post-prove dual on **this new tip** · no second knife · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*`
- e2e-ha alone PASS on `72d2b93` **≠** dual · **≠** nail

---

*Prove receipt · HA local C3+C4 authorized-prove · fix+re-prove · 2026-09-23 (~14:29 PT) · EXIT 4×0 · aDown=true · SHARED_OK + FAULT_OK local · executed:awaiting_post_prove_dual · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · 阶 C/D STILL NOT GREEN · Ban self-nail · STOP*
