# REQUEST — **HA local C3+C4 authorized-prove** · post-prove dual · `mw-rag-route`

**Verdict**: **PASS**  
**Expert**: `mw-rag-route`（domain: rag-route · **second adversarial** · **本刀 ≠ RAG 产品面 flip**）  
**Date**: 2026-09-23 (~14:34 PT)  
**Tip / HEAD（verified）**: `16e8379cc04ab3216751da2a0d60097b674aed6f` / tip `16e8379` · branch `feat/mysql-schema-skeleton`  
**Chain（MUST match · `git log` verified）**: REQUEST `a32da03` / full `a32da0377a16f311399ad03b0befc973b2866081` → prior BLOCK tip `72d2b93` / full `72d2b93c19f181d27dc14baa074af887f69f6cbf` → prove land / fix `94b05b6` / full `94b05b68c66c29996242477bf6e27a5f2966a3c5`（parent=`72d2b93`） → tip `16e8379` / full `16e8379cc04ab3216751da2a0d60097b674aed6f` · **MATCH**  
**Prior BLOCK reference**: 本专家 prior post-prove on `72d2b93` → **BLOCK**（CMD4 EXIT 1 · `aDown=false` · `COMPOSE_INCOMPLETE` · `docker stop` 后 A `/livez` 仍 200）· peer e2e-ha PASS on `72d2b93` **不**计入本 tip · alone≠dual  
**Pair path（named · ZERO peer · 未写 · 未读正文）**: `REQUEST-2026-09-23-ha-local-c3-c4-authorized-prove-post-prove-mw-e2e-ha.md`  
**Knife**: `harness/ha-local-c3-c4-authorized-prove.md` + prove `receipts/2026-09-23-ha-local-c3-c4-authorized-prove-prove.md` + evidence JSON  
**Harness status（live · 未改）**: **`executed:awaiting_post_prove_dual`** · **Ban self-nail `post_prove_dual_pass`** · Dual PASS ≠ nail · alone≠dual  
**ZERO peer**: **confirmed** · 未写 peer · 未读 peer 正文 · alone≠dual · Ban自批 harness  
**This write**: **ONLY** this receipt · **no commit/push** · **no harness edit** · **未读 `.env*`** · Ban Meridian · Ban Cloud Agent

---

## 0. HEAD / chain gate

| Check | Result |
|-------|--------|
| Expected HEAD `16e8379cc04ab3216751da2a0d60097b674aed6f` | **MATCH**（`git rev-parse HEAD`） |
| Tip `16e8379` on `feat/mysql-schema-skeleton` | **MATCH** |
| Chain REQUEST `a32da03` → prior BLOCK `72d2b93` → prove land `94b05b6` → tip `16e8379` | **MATCH**（`git log` + ancestor checks） |
| Parent of `94b05b6` = `72d2b93` | **MATCH** |
| Mismatch → BLOCK | **未触发** |

---

## 0.1 Fix claim independent verify（不信任 implementer）

| Claim | Live on tip `16e8379` |
|-------|------------------------|
| Root: `docker stop -t 5` 留下 A `/livez` 200 | Prior BLOCK on `72d2b93` confirmed this failure mode |
| Fix in `scripts/ha/fault-inject.mjs`: `--kill` → `docker kill` | **CONFIRMED** · tip 含 `method: docker-kill-api-a` · `dockerOk(['kill', CONTAINER_A])` · 注释明确避开 `docker stop -t N` SIGTERM grace |
| `waitPostFault` Running=false + livez-down ×3 confirms | **CONFIRMED** · `needConsecutive=3` · `aDown = !a.ok && !aRunning` |
| Re-kill if A resurrects | **CONFIRMED** · `rekillUsed` 单次 re-kill path |
| Live EXIT evidence still required | **本跑提供** · 见 §1 |

`git show 94b05b6 -- scripts/ha/fault-inject.mjs` 可见 `docker stop` → `docker kill` + waitPostFault harden。Fix **存在于 tip**；本 PASS **依赖** §1 实跑 EXIT，非仅 diff 阅览。

---

## 1. Independent CMD re-run（本专家自跑 · 不信任 harness alone）

**Prereq**: `docker compose -f docker/compose.mysql-local.yml` · mysql+redis **healthy** before CMD2。CMD2 首次因残留 rename 冲突容器名失败 → **移除 stale** `f869e2280810_meetwise-ha-dual-api-b` / 半创建 dual 后 **重跑 CMD2**（环境卫生 · 非 invent EXIT）。仅 shell 注入 `MEETWISE_HA_*_AUTHORIZED=1` · **未**读/cat 任何 `.env*`。

### 1.1 CMD EXIT 表（本机实跑 · THIS tip）

| # | CMD | EXIT（本机重跑） | Live result / note |
|---|-----|------------------|--------------------|
| 1 | `pnpm ha:dual:build-image` | **0** | `IMAGE_BUILT` · `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` |
| 2 | `MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:dual:compose-shared` | **0** | 首次 stale name conflict EXIT=1 → 清残留后重跑 **0** · `DUAL_COMPOSE_SHARED_UP` · livez A/B 200 · **仍** NOT_HA |
| 3 | `MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:prove:shared -- --prove` | **0** | `SHARED_OK` · `sharedPath=shared_backend_hostpath` · in_container Redis TCP timeout → hostpath fallback · **仍** NOT_HA · ≠ 阶 C green |
| 4 | `MEETWISE_HA_FAULT_AUTHORIZED=1 pnpm ha:fault-inject -- --kill --with-shared-survivor` | **0** | `result: COMPOSE_FAULT_SHARED_PARTIAL` · `faultInject: COMPOSE_A_DOWN_B_UP` · `sharedState: SHARED_OK_SURVIVOR` · method `docker-kill-api-a` · **仍** `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` |
| **4×0?** | — | **YES** · **4×0** | claimed prove 4×0 **被本专家独立复现**（本 tip · 非 parent） |

**Hard rule**: PASS only if HEAD match + **all 4 EXIT 0** + honesty pins hold · **任一 EXIT≠0 → BLOCK**。本跑 **4×0** → EXIT 门 **PASS**。

### 1.2 CMD4 observations（honesty · Ban COMPOSE_INCOMPLETE）

| Observation | Live | Source |
|-------------|------|--------|
| `aDown` | **true** | `.tmp/ha-evidence/kill-A.receipt.json` |
| A livez down | **true** · `aLivezOk=false` · status=0 | kill receipt + post note `A status=0` |
| A `Running=false` | **true** · `aContainerRunning=false` · ExitCode=137 | kill receipt + `docker inspect` |
| B up / still serving | **true** · B livez **200** · `bStillServing=true` | kill + B-still-serving receipt |
| `SHARED_OK_SURVIVOR` | **true** · `sharedState: SHARED_OK_SURVIVOR` | fault-inject receipt + `fault-shared-survivor.receipt.json` status=OK |
| `COMPOSE_INCOMPLETE` / A still up | **NOT observed** · `faultInject: COMPOSE_A_DOWN_B_UP` · A exited | Ban 触发条件未成立 |
| `rekillUsed` | **false** | A 未在 wait 中复活 |
| pre dual livez A/B | **FAIL status=0**（pre） | 脚本因 `--kill` forceCompose 仍进入 kill 路径；**post** 门全部成立 · 记为观察 · **不**据此洗红 |

Prior BLOCK 根因（`docker stop` + `aDown=false` + `COMPOSE_INCOMPLETE`）**本 tip 未复现**。

### 1.3 Live honesty pins（CMD 收据 + evidence JSON + harness · 未洗绿）

| Pin | Live observed | Expert |
|-----|---------------|--------|
| `haStatus` | **`NOT_HA`**（CMD1–4 收据 + evidence JSON + harness） | **HOLD** |
| `releaseEvidence` | **`false`** | **HOLD** · Ban flip |
| `claimProductionHA` | **`false`** | **HOLD** |
| 阶 C/D | **STILL NOT GREEN** · 本地 EXIT≠阶绿 | **HOLD** · Ban claim |
| production HA / failover | **NOT claimed** · fault 收据注 ≠ production failover | **HOLD** |
| `gR45Closed` | **`true` retained** · tip `6ded589` / prove `ba1b8aa` **orthogonal** | **HOLD** · **Ban wash into HA** |
| `coveredCount` | **8 retained** | **OUT OF SCOPE flip** |
| `ms3EqualsR4Closed` | **`false` retained** | **HOLD** |
| eg1–eg6 / r4 / funnel | **retained** · 本刀未触产品面 | **OUT OF SCOPE** |
| Harness Status | **`executed:awaiting_post_prove_dual`** · **NOT** `post_prove_dual_pass` | **HOLD** · 本专家 **未改 harness** |

### 1.4 Ban wash · G-R4-5 → HA（对抗核）

| Wash vector | Live? | Expert |
|-------------|-------|--------|
| Wash nail `6ded589` / prove `ba1b8aa` / `gR45Closed=true` → HA green / production HA / `releaseEvidence=true` | **未出现** · harness+evidence 显式 Ban · pins 仍 ≠HA | **HOLD** |
| Wash skeleton/stub EXIT=0 → HA / 阶 C/D | **未出现** | **HOLD** |
| Claim 本地 C3 sharedOk / C4 fault = 阶 C/D green / production failover | **未出现** · 收据显式 NOT_HA | **HOLD** |
| Dual PASS → nail / HA green / next knife | **Ban** · 本专家 **不**自钉 · alone≠dual | **HOLD** |
| Parent `72d2b93` peer PASS 计入本 tip | **Ban** · 本跑独立于 THIS tip `16e8379` | **HOLD** |

---

## 2. Domain adjudication（rag-route · second adversarial）

| Product / flag | This knife | Expert ruling |
|----------------|------------|---------------|
| `gR45Closed` / eg1–eg6 / r4 / funnel / `coveredCount` | **retained only** | **OUT OF SCOPE** · Ban flip |
| `gR45DualClaimClosed` / 其他 product dual-claim | **未授权** | **OUT OF SCOPE** |
| HA local C3+C4 receipts | 本刀域 · 对抗复跑 | CMD1–4 **4×0** + CMD4 honesty 门成立 → **PASS** |
| Dual PASS ≠ nail · alone≠dual | **pinned** | 本 PASS **≠** 钉生命周期 · **≠** 写 peer · harness **仍** awaiting |

---

## 3. Harness / peer / nail discipline

| Check | Result |
|-------|--------|
| Harness status | **`executed:awaiting_post_prove_dual`**（live 读 · 本专家未改） |
| Self-nail `post_prove_dual_pass` | **NOT done** · Ban |
| Peer `…-post-prove-mw-e2e-ha.md` | **ZERO** · 未写 · 未读正文 · alone≠dual |
| Commit / push | **none** |
| Dual PASS ≠ nail / ≠ HA green | **pinned** · 本写为 **PASS**（dual 一侧）· **无钉权** · 留 awaiting |
| Ban Cloud Agent · Ban Meridian · Ban `.env*` | **HOLD** · 未读 `.env*` |

---

## 4. Blockers

**无 hard BLOCKER**（本 tip · 本跑）。

**已关闭（相对 prior BLOCK on `72d2b93`）**:
- CMD4 EXIT=1 / `aDown=false` / `COMPOSE_INCOMPLETE` / A `/livez` 仍 200 — **本 tip 未复现** · fix `94b05b6` + live EXIT 证据成立

**仍 HOLD（非 blocker · 硬保留）**:
- HEAD / chain mismatch — 未触发  
- wash G-R4-5 `6ded589`/`ba1b8aa`/`gR45Closed` into HA / `releaseEvidence=true` — 未出现  
- live evidence 声称 production HA / 阶 C/D green — 未出现  
- harness 自钉 `post_prove_dual_pass` · 写 peer · commit/push — **本专家未做**  
- alone≠dual · peer 须独立对本 tip 裁决 · 本 PASS **不**代替 peer

**备查（非洗红）**: CMD4 pre dual livez A/B 曾 status=0；post-fault 门与 evidence JSON 仍满足 PASS 条件 · 不 invent 失败。

---

## 5. Pins surviving this review

1. Full tip SHA **`16e8379cc04ab3216751da2a0d60097b674aed6f`** · chain `a32da03`→`72d2b93`(prior BLOCK)→`94b05b6`(fix land)→`16e8379` **MATCH**  
2. 本机 EXIT：**0 / 0 / 0 / 0** · CMD4 `aDown=true` · A livez down · Running=false · B up · `SHARED_OK_SURVIVOR` · **非** `COMPOSE_INCOMPLETE`  
3. **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · 阶 C/D **STILL NOT GREEN**  
4. **Ban wash G-R4-5** nail `6ded589` / prove `ba1b8aa` / `gR45Closed=true` / coveredCount **8** / `ms3EqualsR4Closed=false` → HA  
5. RAG product faces **retained · OUT OF SCOPE flip**  
6. Harness **仍** `executed:awaiting_post_prove_dual` · Ban self-nail · Dual PASS ≠ nail · alone≠dual · ZERO peer  
7. no commit/push · 未写 peer · 未读 `.env*` · Ban Cloud Agent · Ban Meridian  
8. Prior BLOCK on `72d2b93` **引用保留** · parent peer PASS **不**计入本 tip

---

## 6. Verdict

**PASS** — tip `16e8379cc04ab3216751da2a0d60097b674aed6f` · 本专家独立 4×CMD EXIT **0/0/0/0** · CMD4 honesty 门成立 · fix claim 在 tip 上证实 · pins HOLD · **不** rubber-stamp · **不**自钉 harness · **不**签 peer · alone≠dual · 阶 C/D **仍未绿** · `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`。

*Receipt · mw-rag-route · post-prove dual · 2026-09-23 (~14:34 PT) · OVERWRITE fresh for tip 16e8379 · prior BLOCK 72d2b93 referenced · no commit/push*
