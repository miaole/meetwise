# Prove receipt — **HA D2b live GHA probe:multi artifact URL**

**Prove land**: **`0c5e7d5`** / `0c5e7d559521e344df3b662fb2b5243b22e57b52`  
**Prove tip**: **`fa507c9`** / `fa507c971167e15c37d5278d82395e288c5772ae`  
**Date**: 2026-09-23 (~15:49–15:55 PT)  
**REQUEST tip**: **`2310187`** / full `231018760f84df6c4ca5a8640748d9146833a97b`  
**Pre-exec dual BOTH PASS**: e2e-ha tip **`c3d99ea`** / full `c3d99ea5b9028483c3daf5730f2ceaa6f3431bb5` · rag-route tip **`af51ad9`** / full `af51ad9f1c62f5367f9561e875f48f4f2353d755`  
**Parent D2 nail**: **`d79519d`** / full `d79519d0005960bd85b9ce1cc01e968bace12315` · prove pin **`9015410`**  
**Branch**: `feat/mysql-schema-skeleton`  
**Authority**: meetwise — **AUTHORIZED coding+prove** after pre-exec dual **BOTH PASS** · Ban secrets / `.env*` · Ban Meridian · Ban Cloud Agent · **Ban self-nail `post_prove_dual_pass`** · Ban claim 阶 D / 阶 C/D green · Ban production HA / failover · Ban claim CI stub green = 阶 D · Ban claim artifact URL = 阶 D / production HA · Ban flip `releaseEvidence` · Ban wash D1 `b72c7c4` / D2 `d79519d`/`9015410` / C3b / C3+C4 / G-R4-5 into 阶 D/HA · Ban wash `--require-evidence` EXIT=1 into green · Ban invent green/URL · Ban second knife · D3 production probe **OUT OF SCOPE**  
**Harness**: `harness/ha-d2b-live-gha-probe-multi-artifact.md` · status **`executed:awaiting_post_prove_dual`**（**NOT** `post_prove_dual_pass`）  
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · 阶 C/D **STILL NOT GREEN** · Local D1 done ≠ 阶 D · D2 workflow+static done ≠ 阶 D · **live artifact URL alone ≠ 阶 D** · D3 **OUT OF SCOPE**  
**Retained**: `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · prior D1 / D2 / C3b / C3+C4 / G-R4-5 product flags  

---

## Pre-exec dual（REQUEST tip `2310187`）

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-09-23-ha-d2b-live-gha-probe-multi-artifact-mw-e2e-ha.md` | **PASS** (pre-exec) · tip `c3d99ea` / `c3d99ea5b9028483c3daf5730f2ceaa6f3431bb5` |
| `mw-rag-route` | `reviews/REQUEST-2026-09-23-ha-d2b-live-gha-probe-multi-artifact-mw-rag-route.md` | **PASS** (pre-exec) · tip `af51ad9` / `af51ad9f1c62f5367f9561e875f48f4f2353d755` |

Pre-exec BOTH PASS authorized coding+prove. Dual PASS ≠ HA green · Dual PASS ≠ 阶 D · Dual PASS ≠ next knife. Status = **`executed:awaiting_post_prove_dual`**. **Ban self-nail**. Post-prove dual required.

---

## Live GHA run（REAL）

| Field | Value |
|-------|-------|
| Command | `gh workflow run ha-probe-multi.yml --ref feat/mysql-schema-skeleton` |
| Event | `workflow_dispatch` |
| Run id | `35930389740` |
| **liveGhaRunUrl** | **https://github.com/miaole/meetwise/actions/runs/35930389740** |
| headSha | `c3d99ea5b9028483c3daf5730f2ceaa6f3431bb5` |
| Job | `stub probe + honesty EXIT=1 + artifact` |
| Job conclusion | **success** (~28s · ~15:49 PT) |
| Artifact name | **`ha-probe-multi-receipt`** |
| Artifact id | `10781320550` |
| Artifact download URL | **https://github.com/miaole/meetwise/actions/runs/35930389740/artifacts/10781320550** |
| Artifact API URL | **https://api.github.com/repos/miaole/meetwise/actions/artifacts/10781320550** |
| Artifact zip API | `https://api.github.com/repos/miaole/meetwise/actions/artifacts/10781320550/zip` |
| Actions UI artifacts | `https://github.com/miaole/meetwise/actions/runs/35930389740#artifacts` |
| How URL recorded | GitHub Actions upload-artifact log + `gh api repos/miaole/meetwise/actions/runs/35930389740/artifacts` · Ban invent |

---

## EXIT table

| # | CMD / step | EXIT / conclusion | Honest read |
|---|------------|-------------------|-------------|
| 1 | `gh auth status` | OK | authenticated · scopes include `workflow` |
| 2 | `gh workflow run ha-probe-multi.yml --ref feat/mysql-schema-skeleton` | dispatched | real run id `35930389740` |
| 3 | Stub probe (GHA) `pnpm ha:probe:multi -- --with-bring-up-stub --with-fault-inject` | **0** | log `EXIT=0` · `stub probe EXIT=0 — CI-safe stub only; still NOT_HA; ≠ 阶 D; ≠ production HA` |
| 4 | Honesty (GHA) `pnpm ha:probe:multi -- --require-evidence` | **1** (asserted · step SUCCESS) | log `require-evidence exit code: 1` · `EXIT=1 = honesty fail-closed SUCCESS — Ban wash to pass` |
| 5 | Upload artifact `ha-probe-multi-receipt` | success | id `10781320550` · download `https://github.com/miaole/meetwise/actions/runs/35930389740/artifacts/10781320550` |
| 6 | Job / run conclusion | **success** | CI stub ≠ 阶 D · artifact URL ≠ 阶 D ≠ production HA |

### Log snippets（truncate · from `gh run view --log`）

```
[ha:probe:multi] PASS honesty banner — releaseEvidence=false; haStatus=NOT_HA; multi-track ≠ production HA
CMD=node .../scripts/ha/probe.multi.mjs EXIT=0
stub probe EXIT=0 — CI-safe stub only; still NOT_HA; ≠ 阶 D; ≠ production HA

require-evidence exit code: 1
EXIT=1 = honesty fail-closed SUCCESS — Ban wash to pass
haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false

Artifact ha-probe-multi-receipt has been successfully uploaded! Artifact ID is 10781320550
Artifact download URL: https://github.com/miaole/meetwise/actions/runs/35930389740/artifacts/10781320550
```

---

## Ladder sync

`harness/ha-track.multi-instance.md` honesty: Local D1 **done** · D2 workflow+static **done** · **D2b = live CI artifact (real URL)** · **D3 OUT OF SCOPE** · 阶 C/D **STILL NOT GREEN** · Ban claim 阶 D from artifact URL alone.

---

## Non-claims / Ban

- **≠** claim 阶 D / 阶 C/D green · **≠** production HA / failover · **≠** CI stub green = 阶 D · **≠** artifact URL = 阶 D / HA · **≠** flip `releaseEvidence`
- **≠** wash D1 `b72c7c4` · D2 `d79519d`/`9015410`/`50e35ba` · C3b `beaedc9` · C3+C4 `358a5cf` into 阶 D
- **≠** wash G-R4-5 `6ded589`/`ba1b8aa` into HA · **≠** wash `--require-evidence` EXIT=1 into green
- Dual PASS ≠ HA green · Local D1 done ≠ 阶 D · D2 done ≠ 阶 D · **artifact URL alone ≠ 阶 D** · D3 **OUT OF SCOPE**
- **Ban self-nail `post_prove_dual_pass`** · STOP for post-prove dual · no second knife · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*`
- `gR45Closed=true` retained · coveredCount **8** retained · `ms3EqualsR4Closed=false` retained

---

*Prove receipt · HA D2b live GHA probe:multi artifact · 2026-09-23 (~15:49–15:55 PT) · liveGhaRunUrl=https://github.com/miaole/meetwise/actions/runs/35930389740 · artifact=ha-probe-multi-receipt id=10781320550 · stub EXIT=0 · require-evidence EXIT=1 honesty · job success · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · 阶 C/D STILL NOT GREEN · Ban claim 阶 D from artifact URL alone · executed:awaiting_post_prove_dual · Ban self-nail · STOP*
