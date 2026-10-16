# Harness — **HA D3 pre-purchase quote note**（capacity · price · selection · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · do not buy cloud · **claimProductionHA=false**）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban purchase · Ban coding · Dual PASS ≠ HA · Dual PASS ≠ `releaseEvidence=true`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-02 (~21:00 PT)
**Base / parent tip**: series opened against origin `feat/mysql-schema-skeleton` **`315870e`** / full `315870e502210ac54a4068ac33aeb12721a64766`（`receipt(g7): sync FR2 tipSha in markdown` · historical branch name · Ban MySQL cutover）
**Knife name**: **HA D3 pre-purchase quote note**
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · public DELETE stays **503** · **gR45Closed=true** retained · coveredCount **8** retained · **ms3EqualsR4Closed=false** retained · PG-retained · **claimProductionHA=false** · 阶 D production probe **未开** · Ban buy
**Experts**: `mw-e2e-ha` only（one stub · second reviewer **not assigned**）
**Authority**: meetwise — docs REQUEST open only · status `draft:awaiting_pre_exec_dual` · Ban secrets / `.env*` · Ban force-push · **Do not buy cloud** · Ban coding
**Honesty**: No vendor quote was pulled in this open. Price cells are **UNQUOTED**. Inventing CNY is banned. Local compose limits are not a cloud invoice.

---

## What D3 is not

`harness/ha-track.skeleton.md` step D3 is "≥2 domain independent review", and that review is **not** this file. This note is only a pre-purchase worksheet for a future production-shaped probe. It does not open D3, does not claim 阶 D green, and does not set `claimProductionHA`.

Existing cloud fact（`requirements/use-cases/cloud-runtime-and-migration.md`）: a 2026-08-09 Aliyun RDS PostgreSQL 17 **基础版** single-node test instance does **not** provide production HA. It is not a D3 selection.

## Capacity note（local pins · not a purchase）

From `docker/compose.prod.yml`（comment: 单机 4G 预览 · **≠ HA**）:

| Piece | Local pin | Planning envelope for a later quote（not ordered） |
|-------|-----------|-----------------------------------------------------|
| api | `mem_limit: 512m` | one small instance class · not HA by itself |
| worker | `mem_limit: 1g` | one small instance class |
| web | `mem_limit: 512m` | one small instance class |
| Host comment | 单机 4G 预览 | a single 4G box is a preview, not multi-AZ |
| UC-018 perf local cap | ≤2 vCPU / 4 GiB · `capacityRepresentative=false` | Ban using that cap as production capacity |

A future quote, if ever authorized, would price **two** app instances plus a managed Postgres that is **not** 基础版, plus a private Redis, in one VPC. This REQUEST does not choose SKUs and does not create them.

## Price note

| Item | Price |
|------|-------|
| RDS PostgreSQL HA（not 基础版） | **UNQUOTED** |
| ECS ×2（api/worker/web split TBD） | **UNQUOTED** |
| Tair / Redis private | **UNQUOTED** |
| Egress / snapshot / backup | **UNQUOTED** |
| This REQUEST | **¥0 spent** · purchase count **0** |

Ban filling these cells from memory. A later note may paste a dated public price-list URL and the figure copied from it. Until then the price is UNQUOTED.

## Selection note

| Candidate | Select? | Why |
|-----------|---------|-----|
| RDS PostgreSQL 基础版 single node | **No** | Repo already says 基础版 is not production HA |
| RDS PostgreSQL multi-AZ / HA edition | **Not selected** | In the quote envelope only · UNQUOTED · not bought |
| Local compose / `ha:probe:multi` | **Not a purchase** | Stays `haStatus=NOT_HA` · `releaseEvidence=false` |
| Qdrant as required vector | **No** | PG-retained · Ban cutover |
| Anything bought by this REQUEST | **No** | Do not buy cloud |

## NHP

| Order | Item |
|-------|------|
| 1 NEG | A note that names a price without a citation → not evidence |
| 2 FAULT | Treating 基础版 as HA → fail |
| 3 BOUND | `claimProductionHA` must stay false |
| 4 ADV | A "quote" that is actually an order id → out of scope · Ban |
| 5 PERF | Local 512m/1g/512m ≠ production SLO |
| 6 LOAD | Not measured here |
| HP last | Worksheet only · ¥0 · still NOT_HA |

## Dual stub

| Expert | Path | Status |
|--------|------|--------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-02-ha-d3-prepurchase-quote-mw-e2e-ha.md` | **PENDING** |
| second | **reviewer not assigned** | no second file |

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · Ban invent covered · STOP after push · **claimProductionHA=false** · do not buy cloud

*Harness · HA D3 pre-purchase quote · draft:awaiting_pre_exec_dual · UNQUOTED · STOP*
