# REQUEST — **G-R4-5 product close** · post-prove dual · `mw-rag-route`

**Verdict**: **PASS**  
**Expert**: `mw-rag-route`（domain: rag-route / funnel-route · **Aggregate face G-R4-5 only** · verify funnel/eg2/coveredCount=8 live）  
**Date**: 2026-09-23 (~14:03 PT)  
**Tip / HEAD（verified）**: `ba1b8aa888f74e997757db700bad2bb1a4b01052` / tip `ba1b8aa` · branch `feat/mysql-schema-skeleton`  
**Chain（MUST match）**: REQUEST `4681b1a` → pre_dual `c2cc937` → prove `ba1b8aa` · **MATCH**  
**Pair path（named · ZERO peer · 未写 · 未读正文）**: `REQUEST-2026-09-23-g-r4-5-product-close-post-prove-mw-e2e-ha.md`  
**Knife**: `harness/g-r4-5-product-close.md` + `g-r4-5-product-close.slice.md`  
**Harness status（live · 未改）**: **`executed:awaiting_post_prove_dual`** · **Ban self-nail `post_prove_dual_pass`** · Dual PASS ≠ nail · alone≠dual  
**ZERO peer**: **confirmed** · 未写 peer · 未读 peer 正文 · alone≠dual · Ban自批 harness  
**This write**: **ONLY** this receipt · **no commit/push** · **no harness edit**

---

## 0. HEAD / chain gate

| Check | Result |
|-------|--------|
| Expected HEAD `ba1b8aa888f74e997757db700bad2bb1a4b01052` | **MATCH** |
| Tip `ba1b8aa` on `feat/mysql-schema-skeleton` | **MATCH** |
| Chain REQUEST `4681b1a` → pre_dual `c2cc937` → prove `ba1b8aa` | **MATCH**（`git log -3` 对齐） |
| Mismatch → BLOCK/FAIL | **未触发** |

---

## 1. Independent prove（本专家自跑 · 不信任 claim alone）

### 1.1 CMD EXIT

| CMD | EXIT（本机重跑） |
|-----|------------------|
| `pnpm r4-g-r4-5-product-close:prove` | **0** |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| **2×0** | **YES** |

### 1.2 Live honesty pins（dedicated prove 输出 · 尤其 domain）

| Flag / pin | Live observed | Domain note |
|------------|---------------|-------------|
| `gR45Closed` | **true**（P2 emit + roundtrip） | aggregate face under authorize |
| `canHonestlyFlip` | **true**（P1 + P2） | flip reason = live gate · **Ban假关** |
| `coveredCount` | **8**（P1 coveredCountEight · P2 · roundtrip） | **live** · Ban invent · Ban wash Batch4b/`a34421a`/`2d3f055` alone |
| `coveredCountInvented` | **false** | **PASS** |
| `eg2ProductClosed` | **true**（P1 eg2Live · P2 · roundtrip） | funnel-covered retained · ≠ wash alone |
| `r4ProductClosed` | **true** | retained · ≠ wash alone |
| `funnelProductClosed` | **true** | retained · ≠ wash alone |
| `eg1ProductClosed` / `gR45DualClaimClosed` | **true** | retained |
| `eg3`/`domainIsolation` · `eg4`/`wrongTrack` · `eg5`/`productSsot` · `eg6` | **true** | retained |
| `ms3EqualsR4Closed` | **false**（P1 + P2 + roundtrip） | **Ban MS3=R4** · Ban flip to true |
| `releaseEvidence` | **false** | ≠HA · ≠suite · ≠cutover |
| `emptyMetaAloneDoesNotClose` / `idleSingleEgAloneDoesNotClose` / `priorTipsAloneDoNotClose` | **true** | Ban wash / Ban idle single-EG fake close |
| Harness status in prove P0 | **awaiting_post_prove_dual** + Ban self-nail | **未自钉** |

**Domain 结论（rag-route / funnel-route）**: live aggregate gate **保留** eg2 + funnel + r4 · **coveredCount=8 live** · **未**把 Batch4b / tip `a34421a` / prove `2d3f055` 单独洗成 `gR45Closed` · `canHonestlyFlip=true` 支撑 `gR45Closed=true` · **未**发明 coveredCount · **未** MS3=R4。

### 1.3 Domain-isolation pair

EXIT **0** · production-scoped honesty pair · ≠ invent coveredCount · ≠ MS3=R4 · ≠ HA · 与 dedicated **2×0** 对齐。  
（该 CMD 自身 harness 文案中历史 “G-R4-5 STILL OPEN” 钉为 **R4 domain-isolation 刀** 正交文档诚实钉 · **不**否定本刀 dedicated emit 的 `gR45Closed=true` · P1 `orthogonalNotForged` PASS。）

---

## 2. Hard bans 复查（post-prove）

| Ban | Live hold? |
|-----|------------|
| Ban invent coveredCount | **HOLD** · live=8 · invented=false |
| Ban wash Batch4b / `a34421a` / `2d3f055` alone → gR45Closed | **HOLD** · priorTipsAloneDoNotClose=true · dedicated live gate 存在 |
| Ban MS3=R4 · Ban flip `ms3EqualsR4Closed` | **HOLD** · false retained |
| Ban empty meta · Ban idle single-EG fake close | **HOLD** |
| Ban claim HA/suite/cutover · `releaseEvidence=false` | **HOLD** |
| Ban self-nail harness `post_prove_dual_pass` | **HOLD** · status 仍 `awaiting_post_prove_dual` · 本专家 **未改 harness** |
| Dual PASS ≠ nail · alone≠dual · ZERO peer · Ban Cloud Agent · Ban Meridian · Ban `.env*` | **HOLD** |
| Ban wash EG1–EG6 / R4·FUNNEL alone | **HOLD** |

---

## 3. Harness / peer / nail discipline

| Check | Result |
|-------|--------|
| Harness status | **`executed:awaiting_post_prove_dual`**（prove P0 确认 · 本专家未改） |
| Self-nail `post_prove_dual_pass` | **NOT done** · Ban |
| Peer `…-mw-e2e-ha.md` | **ZERO** · 未写 · 未读正文 · alone≠dual |
| Commit / push | **none** |
| Dual PASS ≠ nail authorize | **pinned** · 本 PASS **≠** 生命周期钉 |

---

## 4. Blockers

**None.**

若下列任一为真则本应收 BLOCK（**未触发**）：
- HEAD / chain mismatch  
- 任一 CMD EXIT ≠ 0  
- `canHonestlyFlip=false` 或 live 缺 eg2 / coveredCount=8 / funnel / r4  
- invent coveredCount / wash Batch4b·`a34421a`·`2d3f055` alone / MS3=R4  
- harness 被自钉 `post_prove_dual_pass` · rubber-stamp · 写 peer  

---

## 5. Pins surviving this review

1. HEAD `ba1b8aa888f74e997757db700bad2bb1a4b01052` · chain `4681b1a`→`c2cc937`→`ba1b8aa`  
2. EXIT **2×0** · live `gR45Closed=true` **because** `canHonestlyFlip=true`  
3. **coveredCount=8 live** · eg2/funnel/r4 retained · Ban invent · Ban wash alone  
4. `ms3EqualsR4Closed=false` · `releaseEvidence=false` · ≠HA · ≠suite · ≠cutover  
5. Harness **仍** `awaiting_post_prove_dual` · Ban self-nail · Dual PASS ≠ nail  
6. ZERO peer · only this receipt · no commit/push  

---

## 6. Verdict summary

**PASS** — HEAD/chain match · dedicated+domain EXIT **2×0** · live honesty 支撑 `gR45Closed=true` + `canHonestlyFlip=true` + **coveredCount=8** + eg2/funnel/r4 retained · Ban wash/MS3/HA/invent · harness **未**自钉 · ZERO peer · Dual PASS ≠ nail · no rubber-stamp.

*mw-rag-route · post-prove · G-R4-5 product close · 2026-09-23 (~14:03 PT) · tip ba1b8aa · EXIT 2×0 · gR45Closed=true · canHonestlyFlip=true · coveredCount=8 · STOP this expert write · no commit/push · harness untouched*
